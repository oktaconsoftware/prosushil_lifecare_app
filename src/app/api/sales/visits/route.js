// // NUCLEAR CACHE KILLERS
// export const dynamic = 'force-dynamic'; 
// export const revalidate = 0; 
// export const fetchCache = 'force-no-store';

// import { NextResponse } from 'next/server';
// import { db } from '../../../../db';
// import { medicalShops, places, areas, visits } from '../../../../db/schema';
// import { eq, desc } from 'drizzle-orm';

// // FETCH ALL SHOPS & AGENT'S VISITS & MASTER AREAS (Self-Assignment Mode)
// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const agentId = searchParams.get('agentId'); 

//     if (!agentId) {
//       return NextResponse.json({ error: 'Missing agent ID' }, { status: 400 });
//     }

//     // 1. Fetch ALL visits for this agent
//     const agentVisits = await db.select()
//       .from(visits)
//       .where(eq(visits.agentId, agentId))
//       .orderBy(desc(visits.createdAt)); 

//     // 2. FETCH MASTER AREAS (So the dropdown is ALWAYS full!)
//     const masterAreas = await db.select({
//       id: areas.id,
//       name: areas.name
//     }).from(areas);

//     // 3. FETCH ALL SHOPS (No Admin Route Assignment Required)
//     const allTargets = await db.select({
//       id: medicalShops.id,
//       name: medicalShops.name,
//       address: medicalShops.address,
//       latitude: medicalShops.latitude,
//       longitude: medicalShops.longitude,
//       placeName: places.name,
//       areaName: areas.name
//     })
//     .from(medicalShops)
//     .leftJoin(places, eq(medicalShops.placeId, places.id))
//     .leftJoin(areas, eq(places.areaId, areas.id));

//     const now = new Date();

//     // 4. Merge the master shop data with the agent's visit data
//     const formattedTargets = allTargets.map((t) => {
//       const shopVisits = agentVisits.filter(v => 
//         String(v.medicalShopId) === String(t.id) || 
//         String(v.medical_shop_id) === String(t.id)
//       );
      
//       const latestVisit = shopVisits[0]; 
      
//       let status = 'PENDING';
//       let lastVisitedLabel = 'Never Visited';
//       let todayCommission = 0;
//       let todayOrder = 0;

//       if (latestVisit && latestVisit.createdAt) {
//         const vDate = new Date(latestVisit.createdAt);
//         if (!isNaN(vDate.getTime())) {
//           const hoursSinceVisit = Math.abs(now - vDate) / (1000 * 60 * 60);
//           if (hoursSinceVisit < 16) {
//             status = 'COMPLETED';
//             const timeString = vDate.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
//             lastVisitedLabel = `Visited today at ${timeString}`;
//             todayCommission = Math.round(Number(latestVisit.collectionAmount) * 0.08) || 0;
//             todayOrder = Number(latestVisit.orderAmount) || 0;
//           } else {
//             const dateString = vDate.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' });
//             lastVisitedLabel = `Last visited: ${dateString}`;
//           }
//         }
//       }

//       return {
//         ...t,
//         latitude: Number(t.latitude),
//         longitude: Number(t.longitude),
//         areaName: t.areaName || 'Unassigned Area',
//         placeName: t.placeName || 'Unassigned Place',
//         status: status, 
//         lastVisited: lastVisitedLabel,
//         commission: todayCommission,
//         orderAmount: todayOrder
//       };
//     });

//     // 🚨 CRITICAL CHANGE: Returning BOTH targets and masterAreas in a single object
//     return NextResponse.json({
//       targets: formattedTargets,
//       masterAreas: masterAreas
//     }, {
//       headers: {
//         'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
//         'Pragma': 'no-cache',
//         'Expires': '0',
//       }
//     });

//   } catch (error) {
//     console.error('API Error:', error);
//     return NextResponse.json({ error: 'Failed to load route plan.' }, { status: 500 });
//   }
// }

// // POST: LOG A VISIT & DEAL TO THE DATABASE
// export async function POST(request) {
//   try {
//     const body = await request.json();
    
//     // 1. EXTRACT paymentMethod from the request body!
//     const { agentId, targetId, photoUrl, orderAmount, collectionAmount, paymentMethod, remark, latitude, longitude } = body;

//     if (!agentId || !targetId) {
//       return NextResponse.json({ error: 'Agent ID and Target ID are required' }, { status: 400 });
//     }

//     const cleanTargetId = parseInt(targetId, 10);
//     const cleanOrderAmt = parseFloat(orderAmount) || 0;
//     const cleanCollectionAmt = parseFloat(collectionAmount) || 0;

//     // 2. SAVE paymentMethod to the database
//     const newVisit = await db.insert(visits).values({
//       agentId: agentId,
//       medicalShopId: cleanTargetId,
//       photoUrl: photoUrl || 'no-photo',
//       orderAmount: cleanOrderAmt,
//       collectionAmount: cleanCollectionAmt,
//       paymentMethod: paymentMethod || 'None', 
//       remark: remark || ''
//     }).returning();

//     // 3. AUTO-UPDATE MISSING GPS COORDINATES
//     if (latitude && longitude) {
//       await db.update(medicalShops)
//         .set({ latitude: String(latitude), longitude: String(longitude) })
//         .where(eq(medicalShops.id, cleanTargetId));
//     }

//     const calculatedCommission = Math.round(cleanCollectionAmt * 0.08) || 0;

//     return NextResponse.json({ 
//       success: true, 
//       visitId: newVisit[0].id,
//       commission: calculatedCommission,
//       time: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })
//     }, { status: 200 });

//   } catch (error) {
//     console.error('Failed to log deal:', error);
//     return NextResponse.json({ error: error.message || 'Database insertion failed.' }, { status: 500 });
//   }
// }

// // NUCLEAR CACHE KILLERS
// export const dynamic = 'force-dynamic'; 
// export const revalidate = 0; 
// export const fetchCache = 'force-no-store';

// import { NextResponse } from 'next/server';
// import { db } from '../../../../db';
// import { medicalShops, places, areas, visits } from '../../../../db/schema';
// import { eq, desc, and, isNull, sql } from 'drizzle-orm'; 

// // 🚨 ADDED THIS: The math function to calculate distances in meters
// function getDistance(lat1, lon1, lat2, lon2) {
//   if (!lat1 || !lon1 || !lat2 || !lon2) return 999999;
//   const R = 6371e3;
//   const p1 = (lat1 * Math.PI) / 180;
//   const p2 = (lat2 * Math.PI) / 180;
//   const dp = ((lat2 - lat1) * Math.PI) / 180;
//   const dl = ((lon2 - lon1) * Math.PI) / 180;
//   const a = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
//   return Math.round(R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))));
// }

// // FETCH ALL SHOPS & AGENT'S VISITS & MASTER AREAS (Self-Assignment Mode)
// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const agentId = searchParams.get('agentId'); 

//     if (!agentId) {
//       return NextResponse.json({ error: 'Missing agent ID' }, { status: 400 });
//     }

//     // 1. Fetch ALL visits for this agent
//     const agentVisits = await db.select()
//       .from(visits)
//       .where(eq(visits.agentId, agentId))
//       .orderBy(desc(visits.createdAt)); 

//     // 2. FETCH MASTER AREAS
//     const masterAreas = await db.select({
//       id: areas.id,
//       name: areas.name
//     }).from(areas);

//     // 3. FETCH ALL SHOPS
//     const allTargets = await db.select({
//       id: medicalShops.id,
//       name: medicalShops.name,
//       address: medicalShops.address,
//       latitude: medicalShops.latitude,
//       longitude: medicalShops.longitude,
//       placeName: places.name,
//       areaName: areas.name
//     })
//     .from(medicalShops)
//     .leftJoin(places, eq(medicalShops.placeId, places.id))
//     .leftJoin(areas, eq(places.areaId, areas.id));

//     const now = new Date();

//     // 4. Merge data
//     const formattedTargets = allTargets.map((t) => {
//       const shopVisits = agentVisits.filter(v => 
//         String(v.medicalShopId) === String(t.id) || 
//         String(v.medical_shop_id) === String(t.id)
//       );
      
//       const latestVisit = shopVisits[0]; 
      
//       let status = 'PENDING';
//       let lastVisitedLabel = 'Never Visited';
//       let todayCommission = 0;
//       let todayOrder = 0;

//       if (latestVisit && latestVisit.createdAt) {
//         const vDate = new Date(latestVisit.createdAt);
//         if (!isNaN(vDate.getTime())) {
//           const hoursSinceVisit = Math.abs(now - vDate) / (1000 * 60 * 60);
//           if (hoursSinceVisit < 16) {
//             status = 'COMPLETED';
//             const timeString = vDate.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
//             lastVisitedLabel = `Visited today at ${timeString}`;
//            todayCommission = 0; // Commission logic removed
//             todayOrder = Number(latestVisit.orderAmount) || 0;
//           } else {
//             const dateString = vDate.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' });
//             lastVisitedLabel = `Last visited: ${dateString}`;
//           }
//         }
//       }

//       return {
//         ...t,
//         latitude: Number(t.latitude),
//         longitude: Number(t.longitude),
//         areaName: t.areaName || 'Unassigned Area',
//         placeName: t.placeName || 'Unassigned Place',
//         status: status, 
//         lastVisited: lastVisitedLabel,
//         commission: todayCommission,
//         orderAmount: todayOrder
//       };
//     });

//     return NextResponse.json({
//       targets: formattedTargets,
//       masterAreas: masterAreas
//     }, {
//       headers: {
//         'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
//         'Pragma': 'no-cache',
//         'Expires': '0',
//       }
//     });

//   } catch (error) {
//     console.error('API Error:', error);
//     return NextResponse.json({ error: 'Failed to load route plan.' }, { status: 500 });
//   }
// }

// // POST: LOG A VISIT & DEAL TO THE DATABASE
// export async function POST(request) {
//   try {
//     const body = await request.json();
    
//     const { agentId, targetId, photoUrl, orderAmount, collectionAmount, paymentMethod, remark, latitude, longitude } = body;

//     if (!agentId || !targetId) {
//       return NextResponse.json({ error: 'Agent ID and Target ID are required' }, { status: 400 });
//     }

//     const cleanTargetId = parseInt(targetId, 10);
//     const cleanOrderAmt = parseFloat(orderAmount) || 0;
//     const cleanCollectionAmt = parseFloat(collectionAmount) || 0;

//     // 2. SAVE VISIT
//     const newVisit = await db.insert(visits).values({
//       agentId: agentId,
//       medicalShopId: cleanTargetId,
//       photoUrl: photoUrl || 'no-photo',
//       orderAmount: cleanOrderAmt,
//       collectionAmount: cleanCollectionAmt,
//       paymentMethod: paymentMethod || 'None', 
//       remark: remark || ''
//     }).returning();


//     // 3. AUTO-UPDATE MISSING GPS COORDINATES & DYNAMIC CITY-CENTER SHIELD
//     if (latitude && longitude) {
      
//       const shopDetails = await db.select({
//         areaId: places.areaId,
//         areaName: areas.name,
//         areaLat: areas.latitude,
//         areaLng: areas.longitude
//       })
//       .from(medicalShops)
//       .leftJoin(places, eq(medicalShops.placeId, places.id))
//       .leftJoin(areas, eq(places.areaId, areas.id))
//       .where(eq(medicalShops.id, cleanTargetId))
//       .limit(1);

//       if (shopDetails.length > 0 && shopDetails[0].areaName) {
//         let targetCityLat = shopDetails[0].areaLat ? Number(shopDetails[0].areaLat) : null;
//         let targetCityLng = shopDetails[0].areaLng ? Number(shopDetails[0].areaLng) : null;

//         // 🤖 ZERO MANUAL WORK & ZERO HARDCODING: Ask OpenStreetMap dynamically!
//         if (!targetCityLat) {
//           try {
//             // We append ", Maharashtra, India" to make the search highly accurate for your region
//             const searchQuery = encodeURIComponent(`${shopDetails[0].areaName}, Maharashtra, India`);
//             const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`, {
//                headers: { 'User-Agent': 'ProSushil-Sales-App' } // Required by free OpenStreetMap API
//             });
//             const geoData = await geoRes.json();

//             if (geoData && geoData.length > 0) {
//               targetCityLat = parseFloat(geoData[0].lat);
//               targetCityLng = parseFloat(geoData[0].lon);

//               // Save the dynamically fetched coordinates to your database forever
//               if (shopDetails[0].areaId) {
//                 await db.update(areas)
//                   .set({ latitude: String(targetCityLat), longitude: String(targetCityLng) })
//                   .where(eq(areas.id, shopDetails[0].areaId));
//               }
//             } else {
//               return NextResponse.json({ 
//                 error: `🚨 MAP ERROR: Could not locate ${shopDetails[0].areaName} on the global map. Check the spelling of your Area name.` 
//               }, { status: 400 });
//             }
//           } catch (err) {
//              console.error("Geocoding API Failed:", err);
//              return NextResponse.json({ error: "Failed to verify city location dynamically." }, { status: 500 });
//           }
//         }

//         // Enforce the 50km Shield using the newly fetched (or existing) coordinates
//         if (targetCityLat && targetCityLng) {
//           const distanceToCity = getDistance(latitude, longitude, targetCityLat, targetCityLng);
          
//           if (distanceToCity > 50000) {
//             return NextResponse.json({ 
//               error: `🚨 AREA MISMATCH: You selected a shop in ${shopDetails[0].areaName}, but your GPS is ${(distanceToCity / 1000).toFixed(1)}km away. Check-in blocked.` 
//             }, { status: 403 });
//           }
//         }
//       }

//       // If they pass the shield, lock the specific shop's coordinates
//       await db.update(medicalShops)
//         .set({ latitude: String(latitude), longitude: String(longitude) })
//         .where(
//           and(
//             eq(medicalShops.id, cleanTargetId),
//             isNull(medicalShops.latitude)
//           )
//         );

//       // Trigger background math updates for neighboring places
//       try {
//         const protocol = request.headers.get('x-forwarded-proto') || 'http';
//         const host = request.headers.get('host');
//         // 🚨 ADDED THIS: You MUST have 'await' here or the server kills the request before it finishes!
//         await fetch(`${protocol}://${host}/api/admin/update-centers`, { method: 'POST' });
//       } catch (err) {
//         console.error("Background calculator failed to trigger:", err);
//       }
//     }

//     const calculatedCommission = 0; // Commission logic removed

//     return NextResponse.json({ 
//       success: true, 
//       visitId: newVisit[0].id,
//       commission: calculatedCommission,
//       time: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })
//     }, { status: 200 });

//   } catch (error) {
//     console.error('Failed to log deal:', error);
//     return NextResponse.json({ error: error.message || 'Database insertion failed.' }, { status: 500 });
//   }
// }
// NUCLEAR CACHE KILLERS
export const dynamic = 'force-dynamic'; 
export const revalidate = 0; 
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';
import { db } from '../../../../db';
import { medicalShops, places, areas, visits } from '../../../../db/schema';
import { eq, desc, and, isNull, or } from 'drizzle-orm'; 

// Math function to check the 50km shield
function getDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999999;
  const R = 6371e3;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  return Math.round(R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))));
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId'); 

    if (!agentId) return NextResponse.json({ error: 'Missing agent ID' }, { status: 400 });

    const agentVisits = await db.select().from(visits).where(eq(visits.agentId, agentId)).orderBy(desc(visits.createdAt)); 
    const masterAreas = await db.select({ id: areas.id, name: areas.name }).from(areas);

    const allTargets = await db.select({
      id: medicalShops.id,
      name: medicalShops.name,
      address: medicalShops.address,
      latitude: medicalShops.latitude,
      longitude: medicalShops.longitude,
      photoUrl: medicalShops.photoUrl,
      isVerified: medicalShops.isVerified,
      placeName: places.name,
      areaName: areas.name
    })
    .from(medicalShops)
    .leftJoin(places, eq(medicalShops.placeId, places.id))
    .leftJoin(areas, eq(places.areaId, areas.id));

    const now = new Date();

    const formattedTargets = allTargets.map((t) => {
      const shopVisits = agentVisits.filter(v => String(v.medicalShopId) === String(t.id));
      const latestVisit = shopVisits[0]; 
      
      let status = 'PENDING';
      let lastVisitedLabel = 'Never Visited';
      let todayCommission = 0;
      let todayOrder = 0;

      if (latestVisit && latestVisit.createdAt) {
        const vDate = new Date(latestVisit.createdAt);
        if (!isNaN(vDate.getTime())) {
          const hoursSinceVisit = Math.abs(now - vDate) / (1000 * 60 * 60);
          if (hoursSinceVisit < 16) {
            status = 'COMPLETED';
            const timeString = vDate.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
            lastVisitedLabel = `Visited today at ${timeString}`;
            todayCommission = 0; 
            todayOrder = Number(latestVisit.orderAmount) || 0;
          } else {
            const dateString = vDate.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' });
            lastVisitedLabel = `Last visited: ${dateString}`;
          }
        }
      }

      return {
        ...t,
        latitude: Number(t.latitude),
        longitude: Number(t.longitude),
        areaName: t.areaName || 'Unassigned Area',
        placeName: t.placeName || 'Unassigned Place',
        status: status, 
        lastVisited: lastVisitedLabel,
        commission: todayCommission,
        orderAmount: todayOrder
      };
    });

    return NextResponse.json({ targets: formattedTargets, masterAreas: masterAreas }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' }
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to load route plan.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { agentId, targetId, photoUrl, orderAmount, collectionAmount, paymentMethod, remark, latitude, longitude } = body;

    if (!agentId || !targetId) return NextResponse.json({ error: 'Agent ID and Target ID are required' }, { status: 400 });

    const cleanTargetId = parseInt(targetId, 10);
    if (isNaN(cleanTargetId)) return NextResponse.json({ error: 'Invalid Target ID.' }, { status: 400 });

    const cleanOrderAmt = parseFloat(orderAmount) || 0;
    const cleanCollectionAmt = parseFloat(collectionAmount) || 0;

    // ─────────────────────────────────────────────────────────
    // ACTION 1: LOG THE VISIT IN THE `visits` TABLE
    // ─────────────────────────────────────────────────────────
    const newVisit = await db.insert(visits).values({
      agentId: String(agentId),
      medicalShopId: cleanTargetId,
      photoUrl: photoUrl || 'no-photo',
      orderAmount: String(cleanOrderAmt),
      collectionAmount: String(cleanCollectionAmt),
      paymentMethod: paymentMethod || 'None', 
      remark: remark || ''
    }).returning();


    // ─────────────────────────────────────────────────────────
    // ACTION 2: UPDATE THE `medical_shops` MASTER RECORD
    // ─────────────────────────────────────────────────────────
    if (latitude && longitude) {
      
      // FIX: We only ask for the Area Name now, avoiding the undefined crash!
      const shopDetails = await db.select({
        areaName: areas.name
      })
      .from(medicalShops)
      .leftJoin(places, eq(medicalShops.placeId, places.id))
      .leftJoin(areas, eq(places.areaId, areas.id))
      .where(eq(medicalShops.id, cleanTargetId))
      .limit(1);

      if (shopDetails.length > 0 && shopDetails[0].areaName) {
        let targetCityLat = null;
        let targetCityLng = null;

        try {
          const searchQuery = encodeURIComponent(`${shopDetails[0].areaName}, Maharashtra, India`);
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`, { headers: { 'User-Agent': 'ProSushil-Sales-App' } });
          const geoData = await geoRes.json();
          if (geoData && geoData.length > 0) {
            targetCityLat = parseFloat(geoData[0].lat); 
            targetCityLng = parseFloat(geoData[0].lon);
          }
        } catch (err) { console.error("Geocoding API Failed:", err); }
        
        if (targetCityLat && targetCityLng) {
          const distanceToCity = getDistance(latitude, longitude, targetCityLat, targetCityLng);
          if (distanceToCity > 500000) {
            return NextResponse.json({ error: `🚨 MISMATCH: You are ${(distanceToCity / 1000).toFixed(1)}km away from the area.` }, { status: 403 });
          }
        }
      }

      // Update the Medical Shop with GPS and Image IF it's not verified yet!
      await db.update(medicalShops)
        .set({ 
          latitude: String(latitude), 
          longitude: String(longitude),
          photoUrl: photoUrl || null 
        })
        .where(
          and(
            eq(medicalShops.id, cleanTargetId),
            or(
              eq(medicalShops.isVerified, false),
              isNull(medicalShops.isVerified)
            )
          )
        );
    }

    return NextResponse.json({ 
      success: true, 
      visitId: newVisit[0].id,
      commission: 0,
      time: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to log deal:', error);
    return NextResponse.json({ error: error.message || 'Database insertion failed.' }, { status: 500 });
  }
}