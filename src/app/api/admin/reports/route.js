// NUCLEAR CACHE KILLERS
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';
import { db } from '../../../../db';
import { visits, medicalShops, places, areas } from '../../../../db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const dateParam = searchParams.get('date');

    if (!agentId || !dateParam) {
      return NextResponse.json({ error: 'Missing agentId or date parameters' }, { status: 400 });
    }

    // ── 1. SETUP DATE BOUNDARIES ──
    const targetDate = new Date(dateParam);
    
    // Daily Bounds
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Monthly Bounds
    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999);

    // ── 2. FETCH DAILY VISITS ──
    const dailyVisits = await db.select({
      visit: visits,
      shop: medicalShops,
      place: places,
      area: areas
    })
    .from(visits)
    .leftJoin(medicalShops, eq(visits.medicalShopId, medicalShops.id))
    .leftJoin(places, eq(medicalShops.placeId, places.id))
    .leftJoin(areas, eq(places.areaId, areas.id))
    .where(
      and(
        eq(visits.agentId, agentId),
        gte(visits.createdAt, startOfDay),
        lte(visits.createdAt, endOfDay)
      )
    )
    .orderBy(desc(visits.createdAt));

    // ── 3. PROCESS DAILY TIMELINE ──
    let dailyOrderValue = 0;
    let dailyCollection = 0;
    let dailyCommission = 0;
    let deviations = 0;

    const timeline = dailyVisits.map(row => {
      const v = row.visit;
      const s = row.shop;
      const orderAmt = Number(v.orderAmount) || 0;
      const collAmt = Number(v.collectionAmount) || 0;
      
      dailyOrderValue += orderAmt;
      dailyCollection += collAmt;
      dailyCommission += Math.round(collAmt * 0.08);

      let status = 'success';
      let errorNote = null;
      if (!v.photoUrl || v.photoUrl === 'no-photo') {
        status = 'error';
        errorNote = 'Missing Photographic Proof';
        deviations++;
      }

      return {
        status: status,
        type: 'visit',
        title: s ? s.name : 'Unknown Shop',
        time: new Date(v.createdAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }),
        location: `${s?.address || 'No Address'} | ${row.place?.name || ''}, ${row.area?.name || ''}`,
        errorNote: errorNote,
        details: { order: orderAmt, collection: collAmt, paymentMethod: v.paymentMethod || 'None', note: v.remark || '' }
      };
    });

    // ── 4. FETCH MONTHLY DATA & CALCULATE ATTENDANCE ──
    const monthlyVisits = await db.select()
      .from(visits)
      .where(
        and(
          eq(visits.agentId, agentId),
          gte(visits.createdAt, startOfMonth),
          lte(visits.createdAt, endOfMonth)
        )
      );

    const monthlyOrderValue = monthlyVisits.reduce((sum, v) => sum + (Number(v.orderAmount) || 0), 0);
    const monthlyCollection = monthlyVisits.reduce((sum, v) => sum + (Number(v.collectionAmount) || 0), 0);
    const monthlyCommission = Math.round(monthlyCollection * 0.08);

    // Group visits by Day to check the "10 Visits" rule
    const visitsByDate = {};
    monthlyVisits.forEach(v => {
      const d = new Date(v.createdAt);
      // Format as YYYY-MM-DD
      const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      visitsByDate[dateStr] = (visitsByDate[dateStr] || 0) + 1;
    });

    // Calculate Present Days (Days with >= 10 visits)
    let presentDays = 0;
    Object.values(visitsByDate).forEach(count => {
      if (count >= 10) presentDays++;
    });

    // Calculate Total Working Days in the Month (Up to today)
    const now = new Date();
    let elapsedDaysInMonth;
    if (targetDate.getFullYear() === now.getFullYear() && targetDate.getMonth() === now.getMonth()) {
      elapsedDaysInMonth = now.getDate(); // If current month, only count up to today
    } else {
      elapsedDaysInMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate(); // Total days in past month
    }

    // Absent Days = Total Days - Present Days
    const absentDays = elapsedDaysInMonth - presentDays;

    return NextResponse.json({
      summary: {
        completedVisits: dailyVisits.length,
        totalVisits: dailyVisits.length,
        totalOrderValue: dailyOrderValue,
        totalCollection: dailyCollection, 
        commissionEarned: dailyCommission,
        deviations: deviations
      },
      timeline: timeline,
      monthlySummary: {
        presentDays: presentDays,
        absentDays: absentDays,
        totalVisits: monthlyVisits.length,
        totalOrderValue: monthlyOrderValue,
        commissionEarned: monthlyCommission
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });

  } catch (error) {
    console.error("Report Error:", error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}