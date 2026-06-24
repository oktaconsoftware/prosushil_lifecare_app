// Force Next.js to process this dynamically
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
// CRITICAL: We added 'ilike' for Case-Insensitive matching!
import { eq, and, ilike } from 'drizzle-orm';

import { db } from '../../../../db';
import { medicalShops, areas, places } from '../../../../db/schema';

// Helper function to force clean Title Case (e.g. "sangli" -> "Sangli", "NEW DELHI" -> "New Delhi")
function toTitleCase(str) {
  return str.trim().toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, address, areaName, placeName, latitude, longitude } = body;

    if (!name || !areaName || !placeName || !latitude || !longitude) {
      return NextResponse.json({ error: 'Missing required shop details or GPS data.' }, { status: 400 });
    }

    const cleanLat = String(latitude);
    const cleanLng = String(longitude);
    
    // Clean and standardize the text input!
    const cleanAreaName = toTitleCase(areaName);
    const cleanPlaceName = toTitleCase(placeName);
    const cleanShopName = toTitleCase(name);

    // ── 1. FIND OR CREATE AREA (CASE-INSENSITIVE) ──
    // Using ilike() so "sangli" matches "Sangli"
    let areaRecord = await db.select().from(areas).where(ilike(areas.name, cleanAreaName)).limit(1);
    let finalAreaId;
    
    if (areaRecord.length === 0) {
      // Area doesn't exist, create it cleanly!
      const newArea = await db.insert(areas).values({ 
        name: cleanAreaName,
        latitude: cleanLat,
        longitude: cleanLng
      }).returning();
      
      finalAreaId = newArea[0].id;
    } else {
      // Area exists! Re-use the ID so we don't create a duplicate.
      finalAreaId = areaRecord[0].id;
      
      // Self-Healing: If the existing area was missing GPS coordinates, update it!
      if (!areaRecord[0].latitude || !areaRecord[0].longitude) {
        await db.update(areas)
          .set({ latitude: cleanLat, longitude: cleanLng })
          .where(eq(areas.id, finalAreaId));
      }
    }

    // ── 2. FIND OR CREATE PLACE (CASE-INSENSITIVE) ──
    let placeRecord = await db.select().from(places)
      .where(and(ilike(places.name, cleanPlaceName), eq(places.areaId, finalAreaId)))
      .limit(1);
    let finalPlaceId;

    if (placeRecord.length === 0) {
      // Place doesn't exist in this area, create it cleanly!
      const newPlace = await db.insert(places).values({ 
        name: cleanPlaceName,
        areaId: finalAreaId,
        latitude: cleanLat,
        longitude: cleanLng
      }).returning();
      
      finalPlaceId = newPlace[0].id;
    } else {
      // Place exists! Re-use the ID so we don't create a duplicate.
      finalPlaceId = placeRecord[0].id;
      
      // Self-Healing: If the existing place was missing GPS coordinates, update it!
      if (!placeRecord[0].latitude || !placeRecord[0].longitude) {
        await db.update(places)
          .set({ latitude: cleanLat, longitude: cleanLng })
          .where(eq(places.id, finalPlaceId));
      }
    }

    // ── 3. INSERT THE NEW MEDICAL SHOP ──
    const newShop = await db.insert(medicalShops).values({
      name: cleanShopName,
      address: address ? address.trim() : '',
      placeId: finalPlaceId, 
      latitude: cleanLat,
      longitude: cleanLng,
    }).returning();

    return NextResponse.json({ 
      success: true, 
      message: 'Shop successfully mapped to the database!',
      shop: newShop[0] 
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to process new medical shop:', error);
    return NextResponse.json({ 
      error: error.message || 'Database error occurred while mapping the location.' 
    }, { status: 500 });
  }
}