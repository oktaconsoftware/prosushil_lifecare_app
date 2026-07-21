// NUCLEAR CACHE KILLERS
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';
import { db } from '../../../../db';
import { users, visits } from '../../../../db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date') || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const [year, month] = dateParam.split('-');

    // ── STRICT IST TIMEZONE BOUNDARIES ──
    const startOfDay = new Date(`${dateParam}T00:00:00+05:30`);
    const endOfDay = new Date(`${dateParam}T23:59:59.999+05:30`);

    // Fetch the whole month to calculate "Till Date" metrics
    const lastDay = new Date(Number(year), Number(month), 0).getDate();
    const startOfMonth = new Date(`${year}-${month}-01T00:00:00+05:30`);
    const endOfMonth = new Date(`${year}-${month}-${lastDay}T23:59:59.999+05:30`);

    // 🚨 ULTIMATE SPEED FIX: Fire all 3 database queries SIMULTANEOUSLY
    // We let the Database do the SUM and COUNT math instead of Javascript
    const [agents, dailyStats, monthlyStats] = await Promise.all([
      
      // Query 1: Get all Agents
      db.select({
        id: users.id,                
        employeeId: users.employeeId, 
        name: users.name
      }).from(users).where(eq(users.role, 'AGENT')),

      // Query 2: Get TODAY'S sums grouped by Agent
      db.select({
        agentId: visits.agentId,
        visitCount: sql`count(${visits.id})::int`,
        orderSum: sql`COALESCE(sum(CAST(${visits.orderAmount} AS NUMERIC)), 0)::int`,
        collectionSum: sql`COALESCE(sum(CAST(${visits.collectionAmount} AS NUMERIC)), 0)::int`
      })
      .from(visits)
      .where(and(gte(visits.createdAt, startOfDay), lte(visits.createdAt, endOfDay)))
      .groupBy(visits.agentId),

      // Query 3: Get THIS MONTH'S sums grouped by Agent
      db.select({
        agentId: visits.agentId,
        visitCount: sql`count(${visits.id})::int`,
        orderSum: sql`COALESCE(sum(CAST(${visits.orderAmount} AS NUMERIC)), 0)::int`,
        collectionSum: sql`COALESCE(sum(CAST(${visits.collectionAmount} AS NUMERIC)), 0)::int`
      })
      .from(visits)
      .where(and(gte(visits.createdAt, startOfMonth), lte(visits.createdAt, endOfMonth)))
      .groupBy(visits.agentId)
    ]);

    // 2. Create ultra-fast lookup maps (O(1) time complexity)
    const dailyMap = new Map();
    dailyStats.forEach(stat => dailyMap.set(String(stat.agentId), stat));

    const monthlyMap = new Map();
    monthlyStats.forEach(stat => monthlyMap.set(String(stat.agentId), stat));

    // 3. Map everything together instantly without nested loops
    const report = agents.map(agent => {
      const empIdStr = String(agent.employeeId);
      const idStr = String(agent.id);

      // Instantly find agent stats (checking both employeeId and id just in case)
      const dStats = dailyMap.get(empIdStr) || dailyMap.get(idStr) || { visitCount: 0, orderSum: 0, collectionSum: 0 };
      const mStats = monthlyMap.get(empIdStr) || monthlyMap.get(idStr) || { visitCount: 0, orderSum: 0, collectionSum: 0 };

      return {
        id: agent.employeeId || idStr,
        name: agent.name,
        visitCount: dStats.visitCount,
        orderVolume: dStats.orderSum,
        collectionVolume: dStats.collectionSum,
        monthlyVisitCount: mStats.visitCount,
        monthlyOrderVolume: mStats.orderSum,
        monthlyCollectionVolume: mStats.collectionSum
      };
    });

    // 4. Sort leaderboard by highest DAILY order volume first
    report.sort((a, b) => b.orderVolume - a.orderVolume);

    return NextResponse.json(report, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    });

  } catch (error) {
    console.error("Daily Sales API Error:", error);
    return NextResponse.json({ error: 'Failed to load daily sales' }, { status: 500 });
  }
}