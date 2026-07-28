
// export const dynamic = 'force-dynamic';
// export const revalidate = 0;
// export const fetchCache = 'force-no-store';

// import { NextResponse } from 'next/server';
// import { db } from '../../../../db';
// import { visits, medicalShops, places, areas } from '../../../../db/schema';
// import { eq, and, gte, lte, desc } from 'drizzle-orm';

// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const agentId = searchParams.get('agentId');
//     const dateParam = searchParams.get('date');

//     if (!agentId || !dateParam) {
//       return NextResponse.json({ error: 'Missing agentId or date parameters' }, { status: 400 });
//     }

//     // ── 1. SETUP DATE BOUNDARIES (STRICTLY IST TIMEZONE) ──
//     const dateStr = dateParam; // Format: 'YYYY-MM-DD'
//     const [year, month] = dateStr.split('-');
    
//     // Force Start and End of Day to IST (+05:30)
//     const startOfDay = new Date(`${dateStr}T00:00:00+05:30`);
//     const endOfDay = new Date(`${dateStr}T23:59:59.999+05:30`);

//     // Force Start and End of Month to IST (+05:30)
//     const startOfMonth = new Date(`${year}-${month}-01T00:00:00+05:30`);
//     const lastDay = new Date(Number(year), Number(month), 0).getDate();
//     const endOfMonth = new Date(`${year}-${month}-${lastDay}T23:59:59.999+05:30`);

//     // ── 2. FETCH DAILY VISITS ──
//     const dailyVisits = await db.select({
//       visit: visits,
//       shop: medicalShops,
//       place: places,
//       area: areas
//     })
//     .from(visits)
//     .leftJoin(medicalShops, eq(visits.medicalShopId, medicalShops.id))
//     .leftJoin(places, eq(medicalShops.placeId, places.id))
//     .leftJoin(areas, eq(places.areaId, areas.id))
//     .where(
//       and(
//         eq(visits.agentId, agentId),
//         gte(visits.createdAt, startOfDay),
//         lte(visits.createdAt, endOfDay)
//       )
//     )
//     .orderBy(desc(visits.createdAt));

//     // ── 3. PROCESS DAILY TIMELINE ──
//     let dailyOrderValue = 0;
//     let dailyCollection = 0;
//     let dailyCommission = 0; 
//     let deviations = 0;

//     const timeline = dailyVisits.map(row => {
//       const v = row.visit;
//       const s = row.shop;
//       const orderAmt = Number(v.orderAmount) || 0;
//       const collAmt = Number(v.collectionAmount) || 0;
      
//       dailyOrderValue += orderAmt;
//       dailyCollection += collAmt;
//       dailyCommission += Math.round(orderAmt * 0.08); 

//       let status = 'success';
//       let errorNote = null;
//       if (!v.photoUrl || v.photoUrl === 'no-photo') {
//         status = 'error';
//         errorNote = 'Missing Photographic Proof';
//         deviations++;
//       }

//       return {
//         status: status,
//         type: 'visit',
//         title: s ? s.name : 'Unknown Shop',
//         time: new Date(v.createdAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }),
//         location: `${s?.address || 'No Address'} | ${row.place?.name || ''}, ${row.area?.name || ''}`,
//         errorNote: errorNote,
//         details: { order: orderAmt, collection: collAmt, paymentMethod: v.paymentMethod || 'None', note: v.remark || '' }
//       };
//     });

//     // ── 4. FETCH MONTHLY DATA & CALCULATE ATTENDANCE ──
//     const monthlyVisits = await db.select()
//       .from(visits)
//       .where(
//         and(
//           eq(visits.agentId, agentId),
//           gte(visits.createdAt, startOfMonth),
//           lte(visits.createdAt, endOfMonth)
//         )
//       );

//     const monthlyOrderValue = monthlyVisits.reduce((sum, v) => sum + (Number(v.orderAmount) || 0), 0);
//     const monthlyCollection = monthlyVisits.reduce((sum, v) => sum + (Number(v.collectionAmount) || 0), 0);
//     const monthlyCommission = Math.round(monthlyOrderValue * 0.08);

//     // Group visits by Day cleanly using IST Timezone string
//     const visitsByDate = {};
//     monthlyVisits.forEach(v => {
//       // Force date string to evaluate in Kolkata time to avoid 11:30PM UTC shifting to the next day
//       const dStr = new Date(v.createdAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); 
//       visitsByDate[dStr] = (visitsByDate[dStr] || 0) + 1;
//     });

//     let presentDays = 0;
//     Object.values(visitsByDate).forEach(count => {
//       if (count >= 10) presentDays++;
//     });

//     const targetDateObj = new Date(`${dateStr}T12:00:00+05:30`);
//     const now = new Date();
//     let elapsedDaysInMonth;
    
//     // Compare month/year safely
//     if (targetDateObj.getFullYear() === now.getFullYear() && targetDateObj.getMonth() === now.getMonth()) {
//       elapsedDaysInMonth = Number(now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric' }));
//     } else {
//       elapsedDaysInMonth = lastDay;
//     }

//     const absentDays = elapsedDaysInMonth - presentDays;

//     return NextResponse.json({
//       summary: {
//         completedVisits: dailyVisits.length,
//         totalVisits: dailyVisits.length,
//         totalOrderValue: dailyOrderValue,
//         totalCollection: dailyCollection, 
//         commissionEarned: dailyCommission,
//         deviations: deviations
//       },
//       timeline: timeline,
//       monthlySummary: {
//         presentDays: presentDays,
//         absentDays: absentDays,
//         totalVisits: monthlyVisits.length,
//         totalOrderValue: monthlyOrderValue,
//         totalCollection: monthlyCollection, 
//         commissionEarned: monthlyCommission
//       }
//     }, {
//       headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
//     });

//   } catch (error) {
//     console.error("Report Error:", error);
//     return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
//   }
// }



// // 🚨 NUCLEAR CACHE KILLERS 🚨
// export const dynamic = 'force-dynamic';
// export const revalidate = 0;
// export const fetchCache = 'force-no-store';

// import { NextResponse } from 'next/server';
// import { db } from '../../../../db';
// import { visits, medicalShops, places, areas } from '../../../../db/schema';
// import { eq, and, gte, lte, desc } from 'drizzle-orm';

// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const agentId = searchParams.get('agentId');
//     const dateParam = searchParams.get('date');

//     if (!agentId || !dateParam) {
//       return NextResponse.json({ error: 'Missing agentId or date parameters' }, { status: 400 });
//     }

//     // ── 1. SETUP DATE BOUNDARIES (STRICTLY IST TIMEZONE) ──
//     const dateStr = dateParam; // Format: 'YYYY-MM-DD'
//     const [year, month] = dateStr.split('-');
    
//     // Force Start and End of Day to IST (+05:30)
//     const startOfDay = new Date(`${dateStr}T00:00:00+05:30`);
//     const endOfDay = new Date(`${dateStr}T23:59:59.999+05:30`);

//     // Force Start and End of Month to IST (+05:30)
//     const startOfMonth = new Date(`${year}-${month}-01T00:00:00+05:30`);
//     const lastDay = new Date(Number(year), Number(month), 0).getDate();
//     const endOfMonth = new Date(`${year}-${month}-${lastDay}T23:59:59.999+05:30`);

//     // ── 2. FETCH DAILY VISITS ──
//     const dailyVisits = await db.select({
//       visit: visits,
//       shop: medicalShops,
//       place: places,
//       area: areas
//     })
//     .from(visits)
//     .leftJoin(medicalShops, eq(visits.medicalShopId, medicalShops.id))
//     .leftJoin(places, eq(medicalShops.placeId, places.id))
//     .leftJoin(areas, eq(places.areaId, areas.id))
//     .where(
//       and(
//         eq(visits.agentId, agentId),
//         gte(visits.createdAt, startOfDay),
//         lte(visits.createdAt, endOfDay)
//       )
//     )
//     .orderBy(desc(visits.createdAt));

//     // ── 3. PROCESS DAILY TIMELINE ──
//     let dailyOrderValue = 0;
//     let dailyCollection = 0;
//     let dailyCommission = 0; 
//     let deviations = 0;

//     const timeline = dailyVisits.map(row => {
//       const v = row.visit;
//       const s = row.shop;
//       const orderAmt = Number(v.orderAmount) || 0;
//       const collAmt = Number(v.collectionAmount) || 0;
      
//       dailyOrderValue += orderAmt;
//       dailyCollection += collAmt;
//       dailyCommission += Math.round(orderAmt * 0.08); 

//       let status = 'success';
//       let errorNote = null;
//       if (!v.photoUrl || v.photoUrl === 'no-photo') {
//         status = 'error';
//         errorNote = 'Missing Photographic Proof';
//         deviations++;
//       }

//       // 🚨 Failsafe: Handle both camelCase and snake_case mapping for Payment Method
//       const safePaymentMethod = v.paymentMethod || v.payment_method || 'Cash';

//       return {
//         status: status,
//         type: 'visit',
//         title: s ? s.name : 'Unknown Shop',
//         time: new Date(v.createdAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }),
//         location: `${s?.address || 'No Address'} | ${row.place?.name || ''}, ${row.area?.name || ''}`,
//         errorNote: errorNote,
//         details: { 
//           order: orderAmt, 
//           collection: collAmt, 
//           paymentMethod: safePaymentMethod, 
//           note: v.remark || '' 
//         }
//       };
//     });

//     // ── 4. FETCH MONTHLY DATA & CALCULATE ATTENDANCE ──
//     const monthlyVisits = await db.select()
//       .from(visits)
//       .where(
//         and(
//           eq(visits.agentId, agentId),
//           gte(visits.createdAt, startOfMonth),
//           lte(visits.createdAt, endOfMonth)
//         )
//       );

//     const monthlyOrderValue = monthlyVisits.reduce((sum, v) => sum + (Number(v.orderAmount) || 0), 0);
//     const monthlyCollection = monthlyVisits.reduce((sum, v) => sum + (Number(v.collectionAmount) || 0), 0);
//     const monthlyCommission = Math.round(monthlyOrderValue * 0.08);

//     // Group visits by Day cleanly using IST Timezone string
//     const visitsByDate = {};
//     monthlyVisits.forEach(v => {
//       // Force date string to evaluate in Kolkata time to avoid 11:30PM UTC shifting to the next day
//       const dStr = new Date(v.createdAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); 
//       visitsByDate[dStr] = (visitsByDate[dStr] || 0) + 1;
//     });

//     let presentDays = 0;
//     Object.values(visitsByDate).forEach(count => {
//       if (count >= 10) presentDays++;
//     });

//     const targetDateObj = new Date(`${dateStr}T12:00:00+05:30`);
//     const now = new Date();
//     let elapsedDaysInMonth;
    
//     // Compare month/year safely
//     if (targetDateObj.getFullYear() === now.getFullYear() && targetDateObj.getMonth() === now.getMonth()) {
//       elapsedDaysInMonth = Number(now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric' }));
//     } else {
//       elapsedDaysInMonth = lastDay;
//     }

//     const absentDays = elapsedDaysInMonth - presentDays;

//     // 🚨 FIX: Force Strict Headers via Next.js Headers API
//     const responseHeaders = new Headers();
//     responseHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
//     responseHeaders.set('Pragma', 'no-cache');
//     responseHeaders.set('Expires', '0');
//     responseHeaders.set('Surrogate-Control', 'no-store');

//     return NextResponse.json({
//       summary: {
//         completedVisits: dailyVisits.length,
//         totalVisits: dailyVisits.length,
//         totalOrderValue: dailyOrderValue,
//         totalCollection: dailyCollection, 
//         commissionEarned: dailyCommission,
//         deviations: deviations
//       },
//       timeline: timeline,
//       monthlySummary: {
//         presentDays: presentDays,
//         absentDays: absentDays,
//         totalVisits: monthlyVisits.length,
//         totalOrderValue: monthlyOrderValue,
//         totalCollection: monthlyCollection, 
//         commissionEarned: monthlyCommission
//       }
//     }, {
//       status: 200,
//       headers: responseHeaders // Injecting the absolute cache-killers here
//     });

//   } catch (error) {
//     console.error("Report Error:", error);
//     return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
//   }
// }
// 🚨 NUCLEAR CACHE KILLERS 🚨
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';
import { db } from '../../../../db';
import { visits, medicalShops, places, areas, users } from '../../../../db/schema';
import { eq, and, desc, sql, or, inArray } from 'drizzle-orm';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const dateParam = searchParams.get('date');

    if (!agentId || !dateParam) {
      return NextResponse.json({ error: 'Missing agentId or date parameters' }, { status: 400 });
    }

    // ── 1. AGENT ID MATCHING (SUPPORT BOTH DB ID AND EMPLOYEE_ID) ──
    const agentIdNum = Number(agentId);
    const [foundUser] = await db.select()
      .from(users)
      .where(
        or(
          eq(users.employeeId, agentId),
          eq(users.id, isNaN(agentIdNum) ? -1 : agentIdNum)
        )
      )
      .limit(1);

    // Build array of all valid identifiers for this agent
    const targetAgentIds = [agentId];
    if (foundUser) {
      if (foundUser.id) targetAgentIds.push(foundUser.id.toString());
      if (foundUser.employeeId) targetAgentIds.push(foundUser.employeeId);
    }

    const dateStr = dateParam; // Format: 'YYYY-MM-DD'
    const [year, month] = dateStr.split('-');
    const monthStr = `${year}-${month}`;

    // ── 2. FETCH DAILY VISITS USING POSTGRES IST DATE ──
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
        inArray(visits.agentId, targetAgentIds),
        // Postgres native date comparison in IST timezone
        sql`(
          DATE(${visits.createdAt} AT TIME ZONE 'Asia/Kolkata') = ${dateStr}::date 
          OR DATE(${visits.createdAt}) = ${dateStr}::date
        )`
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
      dailyCommission += Math.round(orderAmt * 0.08); 

      let status = 'success';
      let errorNote = null;
      if (!v.photoUrl || v.photoUrl === 'no-photo') {
        status = 'error';
        errorNote = 'Missing Photographic Proof';
        deviations++;
      }

      const safePaymentMethod = v.paymentMethod || 'Cash';
      const validVisitPhoto = v.photoUrl && v.photoUrl !== 'no-photo' ? v.photoUrl : null;
      const shopPhoto1 = s?.photoUrl || null;
      const shopPhoto2 = (s?.isVerified && s?.photoUrl2) ? s.photoUrl2 : null;

      // Safely format time in IST
      let formattedTime = 'Unknown Time';
      if (v.createdAt) {
        const d = v.createdAt instanceof Date ? v.createdAt : new Date(v.createdAt);
        formattedTime = d.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
      }

      return {
        status: status,
        type: 'visit',
        title: s ? s.name : 'Unknown Shop',
        shopId: s?.id || null,
        isVerified: s?.isVerified || false,
        time: formattedTime,
        location: `${s?.address || 'No Address'} | ${row.place?.name || ''}, ${row.area?.name || ''}`,
        errorNote: errorNote,
        details: { 
          order: orderAmt, 
          collection: collAmt, 
          paymentMethod: safePaymentMethod, 
          note: v.remark || '',
          photoUrl: validVisitPhoto || shopPhoto1, 
          photoUrl2: shopPhoto2 
        }
      };
    });

    // ── 4. FETCH MONTHLY DATA & CALCULATE ATTENDANCE ──
    const monthlyVisits = await db.select()
      .from(visits)
      .where(
        and(
          inArray(visits.agentId, targetAgentIds),
          sql`(
            TO_CHAR(${visits.createdAt} AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM') = ${monthStr}
            OR TO_CHAR(${visits.createdAt}, 'YYYY-MM') = ${monthStr}
          )`
        )
      );

    const monthlyOrderValue = monthlyVisits.reduce((sum, v) => sum + (Number(v.orderAmount) || 0), 0);
    const monthlyCollection = monthlyVisits.reduce((sum, v) => sum + (Number(v.collectionAmount) || 0), 0);
    const monthlyCommission = Math.round(monthlyOrderValue * 0.08);

    const visitsByDate = {};
    monthlyVisits.forEach(v => {
      if (v.createdAt) {
        const d = v.createdAt instanceof Date ? v.createdAt : new Date(v.createdAt);
        const dStr = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); 
        visitsByDate[dStr] = (visitsByDate[dStr] || 0) + 1;
      }
    });

    let presentDays = 0;
    Object.values(visitsByDate).forEach(count => {
      if (count >= 10) presentDays++;
    });

    const lastDay = new Date(Number(year), Number(month), 0).getDate();
    const targetDateObj = new Date(`${dateStr}T12:00:00+05:30`);
    const now = new Date();
    let elapsedDaysInMonth;
    
    if (targetDateObj.getFullYear() === now.getFullYear() && targetDateObj.getMonth() === now.getMonth()) {
      elapsedDaysInMonth = Number(now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric' }));
    } else {
      elapsedDaysInMonth = lastDay;
    }

    const absentDays = elapsedDaysInMonth - presentDays;

    const responseHeaders = new Headers();
    responseHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    responseHeaders.set('Pragma', 'no-cache');
    responseHeaders.set('Expires', '0');
    responseHeaders.set('Surrogate-Control', 'no-store');

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
        totalCollection: monthlyCollection, 
        commissionEarned: monthlyCommission
      }
    }, {
      status: 200,
      headers: responseHeaders 
    });

  } catch (error) {
    console.error("Report Error:", error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // 🚨 NEW: Now we also receive the visitPhotoUrl from the frontend
    const { shopId, visitPhotoUrl } = await request.json();

    if (!shopId) {
      return NextResponse.json({ error: 'Shop ID is required' }, { status: 400 });
    }

    // 🚨 NEW: Prepare the update object
    const updatePayload = { isVerified: true };
    
    // If a valid photo was passed, save it as the permanent photoUrl2 for the shop!
    if (visitPhotoUrl && visitPhotoUrl !== 'no-photo') {
      updatePayload.photoUrl2 = visitPhotoUrl;
    }

    await db.update(medicalShops)
      .set(updatePayload)
      .where(eq(medicalShops.id, shopId));

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json({ error: 'Failed to verify shop' }, { status: 500 });
  }
}