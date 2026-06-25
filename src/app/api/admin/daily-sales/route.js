// NUCLEAR CACHE KILLERS
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';
import { db } from '../../../../db';
import { users, visits } from '../../../../db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const targetDate = new Date(dateParam);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // 1. Fetch all AGENTS from the database
    const agents = await db.select({
      employeeId: users.employeeId,
      name: users.name
    })
    .from(users)
    .where(eq(users.role, 'AGENT'));

    // 2. Fetch ALL visits for the selected day
    const todaysVisits = await db.select()
      .from(visits)
      .where(
        and(
          gte(visits.createdAt, startOfDay),
          lte(visits.createdAt, endOfDay)
        )
      );

    // 3. Map visits to their respective agents
    const report = agents.map(agent => {
      // Find visits belonging to this specific agent
      const agentVisits = todaysVisits.filter(v => v.agentId === agent.employeeId);
      
      const totalOrder = agentVisits.reduce((sum, v) => sum + (Number(v.orderAmount) || 0), 0);
      const totalCollection = agentVisits.reduce((sum, v) => sum + (Number(v.collectionAmount) || 0), 0);
      
      return {
        id: agent.employeeId,
        name: agent.name,
        visitCount: agentVisits.length,
        orderVolume: totalOrder,
        collectionVolume: totalCollection
      };
    });

    // 4. Sort leaderboard by highest order volume first
    report.sort((a, b) => b.orderVolume - a.orderVolume);

    return NextResponse.json(report, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    });

  } catch (error) {
    console.error("Daily Sales API Error:", error);
    return NextResponse.json({ error: 'Failed to load daily sales' }, { status: 500 });
  }
}