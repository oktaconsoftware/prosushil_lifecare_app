// Force Next.js to process this dynamically
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { db } from '@/db';
import { medicalShops } from '@/db/schema';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, address, placeId, latitude, longitude } = body;

    // 1. Validation
    if (!name) {
      return NextResponse.json({ error: 'Shop name is required.' }, { status: 400 });
    }

    // 2. Clean the data for PostgreSQL
    // Numeric columns in Drizzle/Postgres handle string values safely and accurately for GPS coordinates
    const safePlaceId = placeId ? parseInt(placeId, 10) : null;
    const safeLatitude = latitude ? String(latitude) : null;
    const safeLongitude = longitude ? String(longitude) : null;

    // 3. Insert the new shop into the database
    const newShop = await db.insert(medicalShops).values({
      name: name,
      address: address || '',
      placeId: safePlaceId, 
      latitude: safeLatitude,
      longitude: safeLongitude
    }).returning();

    // 4. Return the successful response
    return NextResponse.json({ 
      success: true, 
      message: 'New medical shop registered successfully!',
      shop: newShop[0] 
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to save new medical shop:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to save shop to the database.' 
    }, { status: 500 });
  }
}