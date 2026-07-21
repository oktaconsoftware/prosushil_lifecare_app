export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { db } from '../../../../../db';
import { medicalShops, areas, places } from '../../../../../db/schema';

function toTitleCase(str) {
  if (!str) return '';
  return String(str).trim().toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { data } = body; 

    if (!data || !Array.isArray(data)) {
      return NextResponse.json({ error: 'Invalid data format uploaded.' }, { status: 400 });
    }

    // 1. LOAD MAPS INTO MEMORY (Instant Lookups)
    const allAreas = await db.select().from(areas);
    const allPlaces = await db.select().from(places);
    const allShops = await db.select({ placeId: medicalShops.placeId, name: medicalShops.name }).from(medicalShops);

    const areaMap = new Map(allAreas.map(a => [a.name.toLowerCase(), a.id]));
    const placeMap = new Map(allPlaces.map(p => [`${p.areaId}_${p.name.toLowerCase()}`, p.id]));
    const shopMap = new Set(allShops.map(s => `${s.placeId}_${s.name.toLowerCase()}`));

    const shopsToInsert = [];

    // 2. PROCESS DATA
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const areaName = toTitleCase(row.area);
      const placeName = toTitleCase(row.place);
      const shopName = toTitleCase(row.shopName);

      if (!areaName || !placeName || !shopName) continue;

      // ANTI-CRASH FIX: Give the server a micro-pause every 100 rows
      if (i > 0 && i % 100 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }

      // Find or Create Area
      const areaKey = areaName.toLowerCase();
      let areaId = areaMap.get(areaKey);
      if (!areaId) {
        const newArea = await db.insert(areas).values({ name: areaName }).returning();
        areaId = newArea[0].id;
        areaMap.set(areaKey, areaId); 
      }

      // Find or Create Place
      const placeKey = `${areaId}_${placeName.toLowerCase()}`;
      let placeId = placeMap.get(placeKey);
      if (!placeId) {
        const newPlace = await db.insert(places).values({ name: placeName, areaId: areaId }).returning();
        placeId = newPlace[0].id;
        placeMap.set(placeKey, placeId);
      }

      // Queue Shop for Insert
      const shopKey = `${placeId}_${shopName.toLowerCase()}`;
      if (!shopMap.has(shopKey)) {
        shopsToInsert.push({
          name: shopName,
          address: row.address ? String(row.address).trim() : '',
          placeId: placeId
        });
        shopMap.add(shopKey); 
      }
    }

    // 3. BULK INSERT (500 at a time)
    let successCount = 0;
    const CHUNK_SIZE = 500; 

    if (shopsToInsert.length > 0) {
      for (let i = 0; i < shopsToInsert.length; i += CHUNK_SIZE) {
        const chunk = shopsToInsert.slice(i, i + CHUNK_SIZE);
        await db.insert(medicalShops).values(chunk);
        successCount += chunk.length;
      }
    }

    return NextResponse.json({ success: true, message: `Successfully added ${successCount} new shops!` }, { status: 200 });
    
  } catch (err) {
    console.error("Upload API Error:", err);
    return NextResponse.json({ error: err.message || 'Server error during upload.' }, { status: 500 });
  }
}