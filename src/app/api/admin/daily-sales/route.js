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
    const dateParam = searchParams.get('date') || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const [year, month] = dateParam.split('-');

    // ── STRICT IST TIMEZONE BOUNDARIES ──
    const startOfDay = new Date(`${dateParam}T00:00:00+05:30`);
    const endOfDay = new Date(`${dateParam}T23:59:59.999+05:30`);

    // Fetch the whole month to calculate "Till Date" metrics
    const lastDay = new Date(Number(year), Number(month), 0).getDate();
    const startOfMonth = new Date(`${year}-${month}-01T00:00:00+05:30`);
    const endOfMonth = new Date(`${year}-${month}-${lastDay}T23:59:59.999+05:30`);

    // 1. Fetch all AGENTS
    const agents = await db.select({
      id: users.id,                 
      employeeId: users.employeeId, 
      name: users.name
    })
    .from(users)
    .where(eq(users.role, 'AGENT'));

    // 2. 🚨 Fetch ALL visits for the ENTIRE MONTH in IST
    const monthlyVisits = await db.select()
      .from(visits)
      .where(
        and(
          gte(visits.createdAt, startOfMonth),
          lte(visits.createdAt, endOfMonth)
        )
      );

    // 3. Map visits to their respective agents
    const report = agents.map(agent => {
      
      // Get this agent's visits for the whole month
      const agentMonthlyVisits = monthlyVisits.filter(v => 
        String(v.agentId) === String(agent.employeeId) || 
        String(v.agentId) === String(agent.id)
      );

      // Filter out ONLY today's visits from the monthly pool
      const agentDailyVisits = agentMonthlyVisits.filter(v => {
        const vDate = new Date(v.createdAt);
        return vDate >= startOfDay && vDate <= endOfDay;
      });
      
      // Calculate Daily Totals
      const dailyOrder = agentDailyVisits.reduce((sum, v) => sum + (Number(v.orderAmount) || 0), 0);
      const dailyCollection = agentDailyVisits.reduce((sum, v) => sum + (Number(v.collectionAmount) || 0), 0);
      
      // Calculate Monthly Totals
      const monthlyOrder = agentMonthlyVisits.reduce((sum, v) => sum + (Number(v.orderAmount) || 0), 0);
      const monthlyCollection = agentMonthlyVisits.reduce((sum, v) => sum + (Number(v.collectionAmount) || 0), 0);
      
      return {
        id: agent.employeeId || String(agent.id),
        name: agent.name,
        visitCount: agentDailyVisits.length, // Today's visits
        orderVolume: dailyOrder,             // Today's orders
        collectionVolume: dailyCollection,   // Today's cash
        monthlyVisitCount: agentMonthlyVisits.length,
        monthlyOrderVolume: monthlyOrder,    // 🚨 NEW: Monthly Orders
        monthlyCollectionVolume: monthlyCollection // 🚨 NEW: Monthly Cash
      };
    });

    // 4. Sort leaderboard by highest DAILY order volume first (You can change this to b.monthlyOrderVolume if you prefer)
    report.sort((a, b) => b.orderVolume - a.orderVolume);

    return NextResponse.json(report, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    });

  } catch (error) {
    console.error("Daily Sales API Error:", error);
    return NextResponse.json({ error: 'Failed to load daily sales' }, { status: 500 });
  }
}