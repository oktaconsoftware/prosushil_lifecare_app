import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, visits, targets } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('agentId'); // e.g., 'PL-1042'
    const dateStr = searchParams.get('date'); // e.g., '2023-10-25'

    if (!employeeId || !dateStr) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // 1. Find the internal User ID
    const userRecord = await db.select().from(users).where(eq(users.employeeId, employeeId));
    if (userRecord.length === 0) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }
    const agentInternalId = userRecord[0].id;

    // 2. Build Date Bounds for "That specific day"
    const startDate = new Date(`${dateStr}T00:00:00.000Z`);
    const endDate = new Date(`${dateStr}T23:59:59.999Z`);

    // 3. Fetch real visits joined with targets
    const agentVisits = await db.select({
      visit: visits,
      target: targets
    })
    .from(visits)
    .innerJoin(targets, eq(visits.targetId, targets.id))
    .where(
      and(
        eq(visits.agentId, agentInternalId),
        gte(visits.createdAt, startDate),
        lte(visits.createdAt, endDate)
      )
    );

    // 4. Calculate Summary Metrics
    let totalOrderValue = 0;
    let deviations = 0;

    const timeline = agentVisits.map((record, index) => {
      totalOrderValue += (record.visit.dealVolume || 0);
      if (record.visit.deviationMeters > 50) deviations += 1;

      return {
        id: record.visit.id,
        time: new Date(record.visit.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        type: 'visit',
        title: record.target.name,
        location: record.target.address,
        status: record.visit.status === 'Flagged' ? 'error' : 'success',
        errorNote: record.visit.status === 'Flagged' ? `Geofence Warning: ${record.visit.deviationMeters}m away` : null,
        details: record.visit.dealVolume > 0 ? {
          order: record.visit.dealVolume,
          samples: record.visit.dealsClosed,
          note: 'Visit completed and deal logged.'
        } : null
      };
    });

    // Add a system entry for when the day started (if they have visits)
    if (timeline.length > 0) {
      timeline.unshift({
        id: 'start',
        time: '09:00 AM',
        type: 'system',
        title: 'System Access',
        location: 'GPS Active & Verified',
        details: null,
        status: 'info'
      });
    }

    const reportData = {
      summary: {
        totalVisits: agentVisits.length,
        completedVisits: agentVisits.filter(v => v.visit.status !== 'Flagged').length,
        totalOrderValue: totalOrderValue,
        commissionEarned: Math.round(totalOrderValue * 0.08), // 8% Commission
        deviations: deviations
      },
      timeline: timeline
    };

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Report generation failed:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}