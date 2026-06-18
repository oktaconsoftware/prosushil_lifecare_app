import { NextResponse } from 'next/server';
import { db } from '@/db';
import { medicalShops, routeAssignments } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');

  try {
    if (agentId) {
      // Fetch PERMANENT assigned shops for this Agent
      const assigned = await db.select({
        id: medicalShops.id,
        name: medicalShops.name,
        address: medicalShops.address,
        latitude: medicalShops.latitude,
        longitude: medicalShops.longitude
      })
      .from(routeAssignments)
      .innerJoin(medicalShops, eq(routeAssignments.targetId, medicalShops.id))
      .where(eq(routeAssignments.agentId, agentId));

      return NextResponse.json(assigned);
    }
    return NextResponse.json({ error: 'Agent ID required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Database fetch failed' }, { status: 500 });
  }
}

// Bulk Assign Medical Shops
export async function POST(request) {
  try {
    const { agentId, targetIds } = await request.json(); // Now accepts an array of targetIds
    
    // Find already assigned shops to prevent duplicates
    const existing = await db.select().from(routeAssignments).where(eq(routeAssignments.agentId, agentId));
    const existingIds = existing.map(e => e.targetId);

    const newAssignments = targetIds
      .filter(id => !existingIds.includes(id))
      .map(id => ({ agentId, targetId: id }));

    if (newAssignments.length > 0) {
      await db.insert(routeAssignments).values(newAssignments);
    }

    return NextResponse.json({ success: true, message: 'Targets assigned permanently' });
  } catch (err) {
    return NextResponse.json({ error: 'Assignment failed' }, { status: 500 });
  }
}
// Replace the DELETE function in src/app/api/admin/planner/route.js with this:

export async function DELETE(request) {
  try {
    const { agentId, targetId, targetIds } = await request.json();
    
    // If we receive an array of IDs (Bulk Remove)
    if (targetIds && Array.isArray(targetIds)) {
      if (targetIds.length > 0) {
        await db.delete(routeAssignments).where(
          and(eq(routeAssignments.agentId, agentId), inArray(routeAssignments.targetId, targetIds))
        );
      }
    } 
    // If we receive a single ID (Single Remove)
    else if (targetId) {
      await db.delete(routeAssignments).where(
        and(eq(routeAssignments.agentId, agentId), eq(routeAssignments.targetId, targetId))
      );
    }

    return NextResponse.json({ success: true, message: 'Targets removed' });
  } catch (err) {
    return NextResponse.json({ error: 'Removal failed' }, { status: 500 });
  }
}