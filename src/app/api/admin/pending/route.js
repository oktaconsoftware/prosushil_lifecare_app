// src/app/api/admin/pending/route.js
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { db } from '../../../../db/index';
import { areas, places, medicalShops } from '../../../../db/schema';
import { eq, and, ilike, or, sql, desc } from 'drizzle-orm';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = 50; // Only fetch 50 shops at a time
    const offset = (page - 1) * limit;

    // Base condition: Only get shops that are NOT verified
    let conditions = eq(medicalShops.isVerified, false);

    // If Admin is searching, let the Database do the heavy lifting instantly
    if (search) {
      const searchPattern = `%${search}%`;
      conditions = and(
        conditions,
        or(
          ilike(medicalShops.name, searchPattern),
          ilike(medicalShops.address, searchPattern),
          ilike(areas.name, searchPattern),
          ilike(places.name, searchPattern)
        )
      );
    }

    // Perform a highly optimized JOIN and fetch exactly 50 rows
    const pendingShops = await db.select({
      id: medicalShops.id,
      name: medicalShops.name,
      address: medicalShops.address,
      placeId: medicalShops.placeId,
      placeName: places.name,
      areaName: areas.name,
      hasPhoto: sql`CASE WHEN ${medicalShops.photoUrl} IS NOT NULL THEN 1 ELSE 0 END`
    })
    .from(medicalShops)
    .innerJoin(places, eq(medicalShops.placeId, places.id))
    .innerJoin(areas, eq(places.areaId, areas.id))
    .where(conditions)
    // Custom Sort: Shops with photos float to the top
    .orderBy(
      desc(sql`CASE WHEN ${medicalShops.photoUrl} IS NOT NULL THEN 1 ELSE 0 END`), 
      desc(medicalShops.id)
    )
    .limit(limit)
    .offset(offset);

    // Format the response
    const formattedData = pendingShops.map(shop => ({
      ...shop,
      hasPhoto: shop.hasPhoto === 1
    }));

    return NextResponse.json({
      data: formattedData,
      hasMore: formattedData.length === limit // If we got 50, there are probably more
    });

  } catch (error) {
    console.error("Pending Approvals Fetch Error:", error);
    return NextResponse.json({ error: 'Failed to fetch pending shops' }, { status: 500 });
  }
}