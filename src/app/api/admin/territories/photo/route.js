export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { db } from '../../../../../db'; 
import { medicalShops } from '../../../../../db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    // 🚨 NEW: Fetch both photoUrl and photoUrl2 from the database
    const shop = await db.select({ 
        photoUrl: medicalShops.photoUrl,
        photoUrl2: medicalShops.photoUrl2 
      })
      .from(medicalShops)
      .where(eq(medicalShops.id, Number(id))) // Converted to Number for safety
      .limit(1);

    // Check if shop exists
    if (shop.length === 0) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    // Check if BOTH photos are missing
    if (!shop[0].photoUrl && !shop[0].photoUrl2) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // 🚨 NEW: Return both URLs to the frontend so your logic can choose which to show
    return NextResponse.json({ 
      photoUrl: shop[0].photoUrl,
      photoUrl2: shop[0].photoUrl2
    });
    
  } catch (error) {
    console.error("Photo Fetch Error:", error);
    return NextResponse.json({ error: 'Failed to load photo' }, { status: 500 });
  }
}