// Force Next.js to process this dynamically
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { eq, and, ilike } from 'drizzle-orm';

// Note: 5 levels up because we are inside the /upload folder now!
import { db } from '../../../../../db';
import { medicalShops, areas, places } from '../../../../../db/schema';

// Helper to sanitize text (e.g. "kOlHaPuR" -> "Kolhapur")
function toTitleCase(str) {
  if (!str) return '';
  return String(str).trim().toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { data } = body; // Array of { area, place, shopName, address }

    if (!data || !Array.isArray(data)) {
      return NextResponse.json({ error: 'Invalid data format uploaded.' }, { status: 400 });
    }

    let successCount = 0;

    // Loop through every row in the Excel file
    for (const row of data) {
      const areaName = toTitleCase(row.area);
      const placeName = toTitleCase(row.place);
      const shopName = toTitleCase(row.shopName);

      if (!areaName || !placeName || !shopName) continue; // Skip invalid rows

      // ── 1. Find or Create Area ──
      let areaRecord = await db.select().from(areas).where(ilike(areas.name, areaName)).limit(1);
      let areaId;
      if (areaRecord.length > 0) {
        areaId = areaRecord[0].id;
      } else {
        const newArea = await db.insert(areas).values({ name: areaName }).returning();
        areaId = newArea[0].id;
      }

      // ── 2. Find or Create Place ──
      let placeRecord = await db.select().from(places)
        .where(and(ilike(places.name, placeName), eq(places.areaId, areaId)))
        .limit(1);
      let placeId;
      if (placeRecord.length > 0) {
        placeId = placeRecord[0].id;
      } else {
        const newPlace = await db.insert(places).values({ name: placeName, areaId: areaId }).returning();
        placeId = newPlace[0].id;
      }

      // ── 3. Find or Create Medical Shop ──
      const existingShop = await db.select().from(medicalShops)
        .where(and(ilike(medicalShops.name, shopName), eq(medicalShops.placeId, placeId)))
        .limit(1);
        
      if (existingShop.length === 0) {
        await db.insert(medicalShops).values({
          name: shopName,
          address: row.address ? String(row.address).trim() : '',
          placeId: placeId
        });
        successCount++;
      }
    }

    return NextResponse.json({ success: true, message: `Successfully added ${successCount} new shops!` }, { status: 200 });
    
  } catch (err) {
    console.error("Upload API Error:", err);
    return NextResponse.json({ error: err.message || 'Server error during upload.' }, { status: 500 });
  }
}