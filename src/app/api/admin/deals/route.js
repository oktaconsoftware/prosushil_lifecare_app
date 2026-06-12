import { NextResponse } from 'next/server';
import { db } from '@/db';
import { visits, users, targets } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// FETCH ALL DEALS FOR THE MASTER LEDGER
export async function GET() {
  try {
    const allDeals = await db.select({
      id: visits.id,
      status: visits.status,
      orderValue: visits.dealVolume,
      date: visits.createdAt,
      agentName: users.name,
      pharmacy: targets.name
    })
    .from(visits)
    .innerJoin(users, eq(visits.agentId, users.id))
    .innerJoin(targets, eq(visits.targetId, targets.id))
    .orderBy(desc(visits.createdAt));

    // Format for the frontend UI
    const formattedDeals = allDeals
      .filter(deal => deal.orderValue > 0) // Only show actual deals
      .map(deal => ({
        id: `DL-100${deal.id}`,
        dbId: deal.id,
        agentName: deal.agentName,
        pharmacy: deal.pharmacy,
        orderValue: deal.orderValue,
        commission: Math.round(deal.orderValue * 0.08),
        date: new Date(deal.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        status: deal.status === 'Verified' ? 'Pending Review' : deal.status // Map DB status to Admin UI Status
      }));

    return NextResponse.json(formattedDeals);
  } catch (error) {
    console.error('Failed to load ledger:', error);
    return NextResponse.json({ error: 'Failed to load ledger' }, { status: 500 });
  }
}

// APPROVE OR PAY A DEAL
export async function PUT(request) {
  try {
    const { dealId, newStatus } = await request.json();
    
    // Extract the actual database ID from the UI's 'DL-100X' format
    const dbId = parseInt(dealId.replace('DL-100', ''));

    await db.update(visits)
      .set({ status: newStatus })
      .where(eq(visits.id, dbId));

    return NextResponse.json({ success: true, dealId, status: newStatus });
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}