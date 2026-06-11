import { NextResponse } from 'next/server';
import { db } from '@/db';
import { targets, visits } from '@/db/schema';

// FETCH TODAY'S ROUTE (TARGETS)
export async function GET() {
  try {
    // 1. Fetch real targets from the PostgreSQL database
    let allTargets = await db.select().from(targets);

    // 2. Auto-Seed Data (Only runs if your database is completely empty)
    if (allTargets.length === 0) {
      console.log('Seeding initial pharmacy targets...');
      await db.insert(targets).values([
        { name: 'Sushil Medical', address: 'Rajarampuri, Main Road', latitude: 16.6967, longitude: 74.2273 },
        { name: 'Care Pharmacy', address: 'Mahadwar Road', latitude: 16.6950, longitude: 74.2250 },
        { name: 'Apollo Pharmacy', address: 'Tarabai Park', latitude: 16.7000, longitude: 74.2300 }
      ]);
      allTargets = await db.select().from(targets);
    }

    // 3. Format the data for the mobile app
    const formattedTargets = allTargets.map((t) => ({
      id: t.id,
      name: t.name,
      address: t.address,
      status: 'PENDING', 
      distance: 'Scanning...',
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
    const { targetId, orderValue, samplesGiven, productPitched, feedback } = body;

    // Calculate the 8% commission server-side so agents can't manipulate it
    const calculatedCommission = Math.round(Number(orderValue) * 0.08) || 0;

    // NOTE: In a full production environment, you would insert this into the `visits` table here:
    /*
    await db.insert(visits).values({
      agentId: 1, // Get from auth token
      targetId: targetId,
      status: 'Verified',
      dealsClosed: 1,
      dealVolume: Number(orderValue)
    });
    */

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