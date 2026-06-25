// NUCLEAR CACHE KILLERS
export const dynamic = 'force-dynamic'; 
export const revalidate = 0; 
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';
import { db } from '../../../../db';
import { medicalShops, places, areas, visits } from '../../../../db/schema';
import { eq, desc } from 'drizzle-orm';

// FETCH ALL SHOPS & AGENT'S VISITS & MASTER AREAS (Self-Assignment Mode)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId'); 

    if (!agentId) {
      return NextResponse.json({ error: 'Missing agent ID' }, { status: 400 });
    }

    // 1. Fetch ALL visits for this agent
    const agentVisits = await db.select()
      .from(visits)
      .where(eq(visits.agentId, agentId))
      .orderBy(desc(visits.createdAt)); 

    // 2. FETCH MASTER AREAS (So the dropdown is ALWAYS full!)
    const masterAreas = await db.select({
      id: areas.id,
      name: areas.name
    }).from(areas);

    // 3. FETCH ALL SHOPS (No Admin Route Assignment Required)
    const allTargets = await db.select({
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
    .leftJoin(areas, eq(places.areaId, areas.id));

    const now = new Date();

    // 4. Merge the master shop data with the agent's visit data
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
          const hoursSinceVisit = Math.abs(now - vDate) / (1000 * 60 * 60);
          if (hoursSinceVisit < 16) {
            status = 'COMPLETED';
            const timeString = vDate.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
            lastVisitedLabel = `Visited today at ${timeString}`;
            todayCommission = Math.round(Number(latestVisit.collectionAmount) * 0.08) || 0;
            todayOrder = Number(latestVisit.orderAmount) || 0;
          } else {
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

    // 🚨 CRITICAL CHANGE: Returning BOTH targets and masterAreas in a single object
    return NextResponse.json({
      targets: formattedTargets,
      masterAreas: masterAreas
    }, {
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

// POST: LOG A VISIT & DEAL TO THE DATABASE
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
      paymentMethod: paymentMethod || 'None', 
      remark: remark || ''
    }).returning();

    // 3. AUTO-UPDATE MISSING GPS COORDINATES
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