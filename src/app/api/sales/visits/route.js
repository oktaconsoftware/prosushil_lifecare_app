// NUCLEAR CACHE KILLERS
export const dynamic = 'force-dynamic'; 
export const revalidate = 0; 
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';
import { db } from '../../../../db';
import { medicalShops, routeAssignments, places, areas, visits } from '../../../../db/schema';
import { eq, desc, inArray } from 'drizzle-orm';

// FETCH ROUTE & VISITED SHOPS
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId'); 

    if (!agentId) {
      return NextResponse.json({ error: 'Missing agent ID' }, { status: 400 });
    }

    // 1. Fetch ALL visits for this agent first
    const agentVisits = await db.select()
      .from(visits)
      .where(eq(visits.agentId, agentId))
      .orderBy(desc(visits.createdAt)); 

    // Create an array of IDs the agent visited
    const visitedShopIds = agentVisits
      .map(v => Number(v.medicalShopId) || Number(v.medical_shop_id))
      .filter(id => !isNaN(id));

    // 2. Fetch their officially Assigned Territory
    const assignedTargets = await db.select({
      id: medicalShops.id,
      name: medicalShops.name,
      address: medicalShops.address,
      latitude: medicalShops.latitude,
      longitude: medicalShops.longitude,
      placeName: places.name,
      areaName: areas.name
    })
    .from(routeAssignments)
    .innerJoin(medicalShops, eq(routeAssignments.targetId, medicalShops.id))
    .leftJoin(places, eq(medicalShops.placeId, places.id))
    .leftJoin(areas, eq(places.areaId, areas.id))
    .where(eq(routeAssignments.agentId, agentId));

    // 3. Fetch NEW shops they visited today (from the Radar) that aren't officially assigned
    let extraTargets = [];
    if (visitedShopIds.length > 0) {
      const assignedIds = assignedTargets.map(t => Number(t.id));
      const unassignedIds = visitedShopIds.filter(id => !assignedIds.includes(id));

      if (unassignedIds.length > 0) {
        extraTargets = await db.select({
          id: medicalShops.id,
          name: medicalShops.name,
          address: medicalShops.address,
          latitude: medicalShops.latitude,
          longitude: medicalShops.longitude,
          placeName: places.name,
          areaName: areas.name
        })
        .from(medicalShops)
        .leftJoin(places, eq(medicalShops.placeId, places.id))
        .leftJoin(areas, eq(places.areaId, areas.id))
        .where(inArray(medicalShops.id, unassignedIds));
      }
    }

    // Combine Assigned Shops and Newly Discovered Shops
    const allTargets = [...assignedTargets, ...extraTargets];
    const now = new Date();

    // 4. Merge the data dynamically
    const formattedTargets = allTargets.map((t) => {
      
      const shopVisits = agentVisits.filter(v => 
        String(v.medicalShopId) === String(t.id) || 
        String(v.medical_shop_id) === String(t.id)
      );
      
      const latestVisit = shopVisits[0]; 
      
      let status = 'PENDING';
      let lastVisitedLabel = 'Never Visited';
      let todayCommission = 0;
      let todayOrder = 0;

      if (latestVisit && latestVisit.createdAt) {
        const vDate = new Date(latestVisit.createdAt);
        
        if (!isNaN(vDate.getTime())) {
          // CRITICAL FIX: Math.abs() prevents the UTC/IST timezone from creating a "Negative Time" bug
          const hoursSinceVisit = Math.abs(now - vDate) / (1000 * 60 * 60);
          
          // If the visit was logged less than 16 hours ago, keep it locked as "Today"
          if (hoursSinceVisit < 16) {
            status = 'COMPLETED';
            
            const timeString = vDate.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
            lastVisitedLabel = `Visited today at ${timeString}`;
            
            // Because the status is completed, we inject the amounts into the Dashboard
            todayCommission = Math.round(Number(latestVisit.collectionAmount) * 0.08) || 0;
            todayOrder = Number(latestVisit.orderAmount) || 0;
          } else {
            // Visited in the PAST
            const dateString = vDate.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' });
            lastVisitedLabel = `Last visited: ${dateString}`;
          }
        }
      }

      return {
        ...t,
        latitude: Number(t.latitude),
        longitude: Number(t.longitude),
        areaName: t.areaName || 'Unassigned Area',
        placeName: t.placeName || 'Unassigned Place',
        status: status, 
        lastVisited: lastVisitedLabel,
        commission: todayCommission,
        orderAmount: todayOrder
      };
    });

    return NextResponse.json(formattedTargets, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to load route plan.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // 1. EXTRACT paymentMethod from the request body!
    const { agentId, targetId, photoUrl, orderAmount, collectionAmount, paymentMethod, remark, latitude, longitude } = body;

    if (!agentId || !targetId) {
      return NextResponse.json({ error: 'Agent ID and Target ID are required' }, { status: 400 });
    }

    const cleanTargetId = parseInt(targetId, 10);
    const cleanOrderAmt = parseFloat(orderAmount) || 0;
    const cleanCollectionAmt = parseFloat(collectionAmount) || 0;

    // 2. SAVE paymentMethod to the database
    const newVisit = await db.insert(visits).values({
      agentId: agentId,
      medicalShopId: cleanTargetId,
      photoUrl: photoUrl || 'no-photo',
      orderAmount: cleanOrderAmt,
      collectionAmount: cleanCollectionAmt,
      paymentMethod: paymentMethod || 'None', // <-- ADDED HERE
      remark: remark || ''
    }).returning();

    if (latitude && longitude) {
      await db.update(medicalShops)
        .set({ latitude: String(latitude), longitude: String(longitude) })
        .where(eq(medicalShops.id, cleanTargetId));
    }

    const calculatedCommission = Math.round(cleanCollectionAmt * 0.08) || 0;

    return NextResponse.json({ 
      success: true, 
      visitId: newVisit[0].id,
      commission: calculatedCommission,
      time: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to log deal:', error);
    return NextResponse.json({ error: error.message || 'Database insertion failed.' }, { status: 500 });
  }
}