import { NextResponse } from 'next/server';
import { db } from '@/db';
import { targets } from '@/db/schema';

export async function GET() {
  try {
    // 1. Fetch REAL targets from the PostgreSQL database
    const allTargets = await db.select().from(targets);

    // 2. Format the data for the mobile app (Including Lat/Lng for live GPS tracking)
    const formattedTargets = allTargets.map((t) => ({
      id: t.id,
      name: t.name,
      address: t.address,
      latitude: Number(t.latitude),   // Required for dynamic distance
      longitude: Number(t.longitude), // Required for dynamic distance
      status: 'PENDING', 
      commission: 0,
      deals: 0
    }));

    return NextResponse.json(formattedTargets);
  } catch (error) {
    console.error('Failed to fetch targets:', error);
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