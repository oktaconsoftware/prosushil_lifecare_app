export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { db } from '../../../../../db'; // Adjust path to your db file if needed
import { medicalShops } from '../../../../../db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const shop = await db.select({ photoUrl: medicalShops.photoUrl })
      .from(medicalShops)
      .where(eq(medicalShops.id, id))
      .limit(1);

    if (shop.length === 0 || !shop[0].photoUrl) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    return NextResponse.json({ photoUrl: shop[0].photoUrl });
  } catch (error) {
    console.error("Photo Fetch Error:", error);
    return NextResponse.json({ error: 'Failed to load photo' }, { status: 500 });
  }
}