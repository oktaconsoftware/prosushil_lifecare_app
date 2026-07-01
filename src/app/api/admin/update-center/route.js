export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { db } from '../../../../db';
import { medicalShops, places, areas } from '../../../../db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(request) {
  try {
    // 1. UPDATE ALL PLACES (Based on the average of their medical shops)
    const placesToUpdate = await db.select({
      placeId: places.id,
      avgLat: sql`AVG(CAST(${medicalShops.latitude} AS FLOAT))`,
      avgLng: sql`AVG(CAST(${medicalShops.longitude} AS FLOAT))`
    })
    .from(places)
    .leftJoin(medicalShops, eq(medicalShops.placeId, places.id))
    .where(sql`${medicalShops.latitude} IS NOT NULL`) 
    .groupBy(places.id);

    for (const p of placesToUpdate) {
      if (p.avgLat && p.avgLng) {
        await db.update(places)
          .set({ latitude: String(p.avgLat.toFixed(6)), longitude: String(p.avgLng.toFixed(6)) })
          .where(eq(places.id, p.placeId));
      }
    }

    // 2. UPDATE ALL AREAS (Based on the average of their places)
    const areasToUpdate = await db.select({
      areaId: areas.id,
      avgLat: sql`AVG(CAST(${places.latitude} AS FLOAT))`,
      avgLng: sql`AVG(CAST(${places.longitude} AS FLOAT))`
    })
    .from(areas)
    .leftJoin(places, eq(places.areaId, areas.id))
    .where(sql`${places.latitude} IS NOT NULL`) 
    .groupBy(areas.id);

    for (const a of areasToUpdate) {
      if (a.avgLat && a.avgLng) {
        await db.update(areas)
          .set({ latitude: String(a.avgLat.toFixed(6)), longitude: String(a.avgLng.toFixed(6)) })
          .where(eq(areas.id, a.areaId));
      }
    }

    return NextResponse.json({ success: true, message: "Map centers mathematically updated." });

  } catch (error) {
    console.error("Geo-Center Update Error:", error);
    return NextResponse.json({ error: 'Failed to update geographic centers' }, { status: 500 });
  }
}