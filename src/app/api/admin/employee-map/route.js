export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { db } from '../../../../db';
import { users, visits, medicalShops } from '../../../../db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) {
      const agents = await db.select({
        id: users.id,
        employeeId: users.employeeId,
        name: users.name
      }).from(users).where(eq(users.role, 'AGENT'));
      
      return NextResponse.json({ agents });
    }

    const agentVisits = await db.select({
      visitId: visits.id,
      shopName: medicalShops.name,
      address: medicalShops.address,
      
      // 🚨 FIX: Plotting where the AGENT was, not where the shop is!
      latitude: visits.latitude,
      longitude: visits.longitude,
      
      orderAmount: visits.orderAmount,
      collectionAmount: visits.collectionAmount,
      paymentMethod: visits.paymentMethod,
      time: visits.createdAt
    })
    .from(visits)
    .innerJoin(medicalShops, eq(visits.medicalShopId, medicalShops.id))
    .where(eq(visits.agentId, agentId))
    .orderBy(desc(visits.createdAt));

    return NextResponse.json({ visits: agentVisits });

  } catch (error) {
    console.error("Map API Error:", error);
    return NextResponse.json({ error: 'Failed to fetch map data' }, { status: 500 });
  }
}