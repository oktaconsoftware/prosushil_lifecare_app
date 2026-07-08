export const dynamic = 'force-dynamic'; 
export const revalidate = 0; 
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';
import { db } from '../../../../../db';
import { areas, places } from '../../../../../db/schema';

export async function GET() {
  try {
    const masterAreas = await db.select().from(areas);
    const masterPlaces = await db.select().from(places);
    
    return NextResponse.json({ areas: masterAreas, places: masterPlaces }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Database fetch failed.' }, { status: 500 });
  }
}