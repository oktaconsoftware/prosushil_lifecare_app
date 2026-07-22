// src/app/api/sales/deals/route.js
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '../../../../db';
import { medicalShops, places, areas, visits } from '../../../../db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const areaName = searchParams.get('area');

    // 1. Identify the Agent
    const cookieStore = await cookies();
    const agentId = cookieStore.get('employeeId')?.value || '';

    if (!agentId || !areaName) {
      return NextResponse.json([]);
    }

    // 2. Set strict boundaries for TODAY (IST)
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const startOfDay = new Date(`${todayStr}T00:00:00+05:30`);
    const endOfDay = new Date(`${todayStr}T23:59:59.999+05:30`);

    // 3. Fetch all shops in the selected Area
    const shops = await db.select({
      id: medicalShops.id,
      name: medicalShops.name,
      address: medicalShops.address,
      areaName: areas.name,
    })
    .from(medicalShops)
    .innerJoin(places, eq(medicalShops.placeId, places.id))
    .innerJoin(areas, eq(places.areaId, areas.id))
    .where(eq(areas.name, areaName));

    // 4. Fetch all of this agent's VISITS for TODAY
    const todaysVisits = await db.select()
    .from(visits)
    .where(
      and(
        eq(visits.agentId, agentId),
        gte(visits.createdAt, startOfDay),
        lte(visits.createdAt, endOfDay)
      )
    )
    .orderBy(desc(visits.createdAt)); // Get the most recent visit first

    // 5. Merge the Shops with the Visit Data!
    const routeData = shops.map(shop => {
      // Did the agent visit this shop today?
      const visit = todaysVisits.find(v => v.medicalShopId === shop.id);
      
      if (visit) {
        return {
          ...shop,
          status: 'COMPLETED',
          orderAmount: Number(visit.orderAmount) || 0,
          collectionAmount: Number(visit.collectionAmount) || 0,
          paymentMethod: visit.paymentMethod || 'Unknown',
          time: new Date(visit.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        };
      }

      // If no visit today, it's pending
      return {
        ...shop,
        status: 'PENDING',
        orderAmount: 0,
        collectionAmount: 0,
        paymentMethod: null,
        time: null
      };
    });

    return NextResponse.json(routeData);

  } catch (error) {
    console.error("Deals API Error:", error);
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 });
  }
}