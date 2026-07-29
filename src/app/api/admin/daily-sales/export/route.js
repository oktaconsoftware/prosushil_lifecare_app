// 🚨 NUCLEAR CACHE KILLERS 🚨
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';
import { db } from '../../../../../db';
import { visits, users, medicalShops, places, areas } from '../../../../../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const agentId = searchParams.get('agentId');

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Missing start or end dates" }, { status: 400 });
    }

    // Safely enforce exact string boundaries
    const startOfDayStr = `${startDate} 00:00:00`;
    const endOfDayStr = `${endDate} 23:59:59.999999`;

    // 🚨 FIX: We use sql`` to completely bypass Drizzle's internal Date formatting
    // This stops the "value.toISOString is not a function" crash!
    let conditions = [
      sql`${visits.createdAt} >= ${startOfDayStr}`,
      sql`${visits.createdAt} <= ${endOfDayStr}`
    ];

    if (agentId && agentId !== 'ALL') {
      conditions.push(eq(visits.agentId, agentId)); 
    }

    const data = await db.select({
      date: visits.createdAt,
      agentId: visits.agentId,
      shopName: medicalShops.name,
      place: places.name,
      area: areas.name,
      orderAmount: visits.orderAmount,
      collectionAmount: visits.collectionAmount,
      paymentMethod: visits.paymentMethod,
      remark: visits.remark,
      isVerified: medicalShops.isVerified
    })
    .from(visits)
    .leftJoin(medicalShops, eq(visits.medicalShopId, medicalShops.id))
    .leftJoin(places, eq(medicalShops.placeId, places.id))
    .leftJoin(areas, eq(places.areaId, areas.id))
    .where(and(...conditions))
    .orderBy(desc(visits.createdAt));

    // Convert data to a beautiful flat format required by Excel
    const formattedForExcel = data.map(row => {
      
      // 🚨 BULLETPROOF DATE PARSING (Matches your Reports API exactly)
      let parsedDate = new Date(); // Fallback
      
      if (row.date) {
        if (row.date instanceof Date) {
          parsedDate = row.date;
        } else if (typeof row.date === 'string') {
          // Replace spaces with 'T' and append +05:30 to lock it to IST
          const safeStr = row.date.includes('T') ? row.date : row.date.replace(' ', 'T');
          parsedDate = new Date(safeStr.includes('+') || safeStr.includes('Z') ? safeStr : safeStr + '+05:30');
        } else {
          parsedDate = new Date(row.date);
        }
      }

      return {
        "Date": parsedDate.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }),
        "Time": parsedDate.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }),
        "Agent ID": row.agentId,
        "Shop Name": row.shopName || 'Unknown',
        "Area": row.area || '-',
        "Place": row.place || '-',
        "Order (INR)": Number(row.orderAmount) || 0,
        "Collection (INR)": Number(row.collectionAmount) || 0,
        "Payment Method": row.paymentMethod || 'None',
        "Remark": row.remark || '',
        "Shop Verified": row.isVerified ? 'Yes' : 'No'
      };
    });

    return NextResponse.json(formattedForExcel);

  } catch (error) {
    console.error("Export API Error:", error);
    return NextResponse.json({ error: "Failed to generate export" }, { status: 500 });
  }
}