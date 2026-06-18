// NUCLEAR CACHE KILLERS: Ensure admin always sees live data
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';
import { db } from '@/db';
import { visits, medicalShops } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET: Fetch all live deals from the field
export async function GET() {
  try {
    // Join the visits table with the medicalShops table to get the Pharmacy Name
    const allVisits = await db.select({
      id: visits.id,
      agentId: visits.agentId,
      pharmacyName: medicalShops.name,
      orderAmount: visits.orderAmount,
      collectionAmount: visits.collectionAmount,
      createdAt: visits.createdAt,
      status: visits.status
    })
    .from(visits)
    .leftJoin(medicalShops, eq(visits.medicalShopId, medicalShops.id))
    .orderBy(desc(visits.createdAt)); // Sort by newest deals first!

    // Format the data perfectly for your CommissionTab UI
    const formattedDeals = allVisits.map((v) => {
      const vDate = new Date(v.createdAt);
      
      // Get exact date and time in IST
      const dateStr = vDate.toLocaleDateString('en-IN', { 
        timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
      });

      // Calculate the actual 8% commission based on the collection amount
      const commissionAmount = Math.round(Number(v.collectionAmount) * 0.08) || 0;

      return {
        id: v.id,
        agentName: v.agentId, // Shows agent ID (e.g., PL-1043)
        pharmacy: v.pharmacyName || 'Unknown Pharmacy',
        date: dateStr,
        orderValue: Number(v.orderAmount) || 0,
        commission: commissionAmount,
        status: v.status || 'Pending Review'
      };
    });

    return NextResponse.json(formattedDeals, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });

  } catch (error) {
    console.error("Admin Deals API Error:", error);
    return NextResponse.json({ error: 'Failed to load ledger data' }, { status: 500 });
  }
}

// PUT: Handle Admin clicking "Approve" or "Mark Paid"
export async function PUT(request) {
  try {
    const { dealId, newStatus } = await request.json();

    if (!dealId || !newStatus) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Update the database permanently
    await db.update(visits)
      .set({ status: newStatus })
      .where(eq(visits.id, dealId));

    return NextResponse.json({ success: true, status: newStatus }, { status: 200 });

  } catch (error) {
    console.error("Admin Update Error:", error);
    return NextResponse.json({ error: 'Failed to update deal status' }, { status: 500 });
  }
}