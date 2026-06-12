import { NextResponse } from 'next/server';
import { db } from '@/db';
import { targets, routeAssignments } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// FETCH ASSIGNED ROUTE FOR LOGGED IN SALESMAN
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId'); // Who is logged in?
    const date = searchParams.get('date'); // What day is it?

    if (!agentId || !date) {
      return NextResponse.json({ error: 'Missing agent ID or date' }, { status: 400 });
    }

    // Join the targets table with the route_assignments table
    const assignedTargets = await db.select({
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

    // Format for the mobile app UI
    const formattedTargets = assignedTargets.map((t) => ({
      ...t,
      latitude: Number(t.latitude),
      longitude: Number(t.longitude),
      status: 'PENDING', 
      commission: 0,
      deals: 0
    }));

    return NextResponse.json(formattedTargets);
  } catch (error) {
    console.error('Failed to fetch assigned targets:', error);
    return NextResponse.json({ error: 'Failed to load route plan.' }, { status: 500 });
  }
}


// LOG A DEAL & CLOSE VISIT
export async function POST(request) {
  try {
    const body = await request.json();
    const { orderValue } = body;

    // Calculate the 8% commission dynamically on the server
    const calculatedCommission = Math.round(Number(orderValue) * 0.08) || 0;

    return NextResponse.json({ 
      success: true, 
      commission: calculatedCommission,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to log deal:', error);
    return NextResponse.json({ error: 'Failed to save deal to the ledger.' }, { status: 500 });
  }
}