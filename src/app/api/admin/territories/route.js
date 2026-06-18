import { NextResponse } from 'next/server';
import { db } from '@/db';
import { areas, places, medicalShops } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET: Fetch all territories
export async function GET() {
  try {
    const allAreas = await db.select().from(areas);
    const allPlaces = await db.select().from(places);
    const allMedicals = await db.select().from(medicalShops);

    const territories = allAreas.map(area => ({
      id: area.id,
      name: area.name,
      places: allPlaces.filter(p => p.areaId === area.id).map(place => ({
        id: place.id,
        name: place.name,
        medicals: allMedicals.filter(m => m.placeId === place.id)
      }))
    }));

    return NextResponse.json(territories);
  } catch (error) {
    return NextResponse.json({ error: 'Database fetch failed' }, { status: 500 });
  }
}

// POST: Add new record
export async function POST(request) {
  try {
    const { type, name, parentId, address } = await request.json();
    let newRecord;

    if (type === 'area') newRecord = await db.insert(areas).values({ name }).returning();
    else if (type === 'place') newRecord = await db.insert(places).values({ name, areaId: parentId }).returning();
    else if (type === 'medical') newRecord = await db.insert(medicalShops).values({ name, address, placeId: parentId }).returning();

    return NextResponse.json({ success: true, data: newRecord[0] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save to database' }, { status: 500 });
  }
}

// PUT: Edit existing record
export async function PUT(request) {
  try {
    const { type, id, name, address } = await request.json();
    
    if (type === 'area') await db.update(areas).set({ name }).where(eq(areas.id, id));
    else if (type === 'place') await db.update(places).set({ name }).where(eq(places.id, id));
    else if (type === 'medical') await db.update(medicalShops).set({ name, address }).where(eq(medicalShops.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

/// DELETE: Remove record (With Manual Cascade)
export async function DELETE(request) {
  try {
    const { type, id } = await request.json();

    if (type === 'area') {
      // 1. Find all places in this area
      const linkedPlaces = await db.select({ id: places.id }).from(places).where(eq(places.areaId, id));
      const placeIds = linkedPlaces.map(p => p.id);

      // 2. Delete medical shops linked to those places
      if (placeIds.length > 0) {
        await db.delete(medicalShops).where(inArray(medicalShops.placeId, placeIds));
      }

      // 3. Delete the places
      await db.delete(places).where(eq(places.areaId, id));

      // 4. Finally, delete the Area itself
      await db.delete(areas).where(eq(areas.id, id));

    } else if (type === 'place') {
      // 1. Delete medical shops in this place
      await db.delete(medicalShops).where(eq(medicalShops.placeId, id));

      // 2. Delete the place itself
      await db.delete(places).where(eq(places.id, id));

    } else if (type === 'medical') {
      // Delete just the medical shop
      await db.delete(medicalShops).where(eq(medicalShops.id, id));
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Delete Error:", error);

    // If PostgreSQL blocks it (e.g., Shop is already assigned to a Salesman's route)
    if (error.code === '23503') {
      return NextResponse.json(
        { error: "Cannot delete. This item is actively assigned to a Salesman's route." }, 
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Deletion failed due to a database error.' }, { status: 500 });
  }
}