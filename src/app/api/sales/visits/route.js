import { NextResponse } from 'next/server';
import { db } from '@/db';
import { medicalShops, routeAssignments, places, areas } from '@/db/schema';
import { eq } from 'drizzle-orm';

// FETCH PERMANENT ROUTE FOR LOGGED IN SALESMAN
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId'); 

    if (!agentId) {
      return NextResponse.json({ error: 'Missing agent ID' }, { status: 400 });
    }

    // Fetch permanent territory WITH Area and Place names
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

    const formattedTargets = assignedTargets.map((t) => ({
      ...t,
      latitude: Number(t.latitude),
      longitude: Number(t.longitude),
      areaName: t.areaName || 'Unassigned Area',
      placeName: t.placeName || 'Unassigned Place',
      status: 'PENDING', 
      commission: 0,
      deals: 0
    }));

    return NextResponse.json(formattedTargets);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to load route plan.' }, { status: 500 });
  }
}
// POST: LOG A VISIT & DEAL TO THE DATABASE
export async function POST(request) {
  try {
    const body = await request.json();
    const { agentId, targetId, photoUrl, orderAmount, collectionAmount, remark } = body;

    if (!agentId || !targetId) {
      return NextResponse.json({ error: 'Agent ID and Target ID are required' }, { status: 400 });
    }

    // Insert into the new visits table
    const newVisit = await db.insert(visits).values({
      agentId,
      medicalShopId: targetId,
      photoUrl: photoUrl || 'no-photo',
      orderAmount: orderAmount || 0,
      collectionAmount: collectionAmount || 0,
      remark: remark || ''
    }).returning();

    // Calculate a sample commission (e.g., 8% of the collection amount)
    const calculatedCommission = Math.round(Number(collectionAmount) * 0.08) || 0;

    return NextResponse.json({ 
      success: true, 
      visitId: newVisit[0].id,
      commission: calculatedCommission,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to log deal:', error);
    return NextResponse.json({ error: 'Failed to save visit to the database.' }, { status: 500 });
  }
}