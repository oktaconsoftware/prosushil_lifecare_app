import { NextResponse } from 'next/server';
import { db } from '@/db';
import { targets, routeAssignments } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');
  const date = searchParams.get('date');
  const fetchAll = searchParams.get('fetchAll');

  try {
    // 1. Fetch Master List of all Medical Shops
    if (fetchAll) {
      const allTargets = await db.select().from(targets);
      return NextResponse.json(allTargets);
    }

    // 2. Fetch Assigned Shops for a Specific Agent on a Specific Date
    if (agentId && date) {
      const assigned = await db.select({
        id: targets.id,
        name: targets.name,
        address: targets.address,
        latitude: targets.latitude,
        longitude: targets.longitude
      })
      .from(routeAssignments)
      .innerJoin(targets, eq(routeAssignments.targetId, targets.id))
      .where(
        and(
          eq(routeAssignments.agentId, agentId),
          eq(routeAssignments.date, date)
        )
      );

      return NextResponse.json(assigned);
    }

    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Database fetch failed' }, { status: 500 });
  }
}

// Assign a Medical Shop to an Agent
export async function POST(request) {
  try {
    const { agentId, date, targetId } = await request.json();
    
    // Check if it already exists to prevent duplicates
    const existing = await db.select().from(routeAssignments).where(
      and(eq(routeAssignments.agentId, agentId), eq(routeAssignments.date, date), eq(routeAssignments.targetId, targetId))
    );

    if (existing.length === 0) {
      await db.insert(routeAssignments).values({ agentId, targetId, date });
    }

    return NextResponse.json({ success: true, message: 'Target assigned' });
  } catch (err) {
    return NextResponse.json({ error: 'Assignment failed' }, { status: 500 });
  }
}

// Remove a Medical Shop from an Agent's Route
export async function DELETE(request) {
  try {
    const { agentId, date, targetId } = await request.json();
    
    await db.delete(routeAssignments).where(
      and(eq(routeAssignments.agentId, agentId), eq(routeAssignments.date, date), eq(routeAssignments.targetId, targetId))
    );

    return NextResponse.json({ success: true, message: 'Target removed' });
  } catch (err) {
    return NextResponse.json({ error: 'Removal failed' }, { status: 500 });
  }
}