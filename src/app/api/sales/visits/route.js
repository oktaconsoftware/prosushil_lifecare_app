


// export const dynamic = 'force-dynamic'; 
// export const revalidate = 60; 

// import { NextResponse } from 'next/server';
// import { db } from '../../../../db';
// import { medicalShops, places, areas, visits } from '../../../../db/schema';
// import { eq, desc, and, gte } from 'drizzle-orm';
// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// const S3 = new S3Client({
//   region: "auto",
//   endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
//   credentials: {
//     accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
//     secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
//   },
// });

// async function uploadToR2(base64String, filename) {
//   // Check if it's actually an image
//   if (!base64String || !base64String.startsWith('data:image')) {
//     console.error("🚨 Upload Blocked: The data sent from the phone is not a valid base64 image.");
//     return null;
//   }
  
//   // 🛠️ THE LOCAL TESTING BYPASS
//   // When running 'npm run dev', this skips Cloudflare and returns the raw Base64 string
//   if (process.env.NODE_ENV === 'development') {
//     console.log("🛠️ LOCAL MODE: Bypassing R2. Saving Base64 directly to local database.");
//     return base64String; 
//   }

//   try {
//     // 1. Strip the prefix
//     const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
//     // 2. Convert to Buffer
//     const buffer = Buffer.from(base64Data, 'base64');

//     console.log(`⏳ Uploading ${filename} to Cloudflare R2...`);

//     // 3. Upload to Cloudflare R2
//     await S3.send(new PutObjectCommand({
//       Bucket: process.env.R2_BUCKET_NAME,
//       Key: filename,
//       Body: buffer,
//       ContentType: 'image/jpeg',
//     }));

//     // 4. Return the Cloudflare Public URL
//     const publicUrl = `${process.env.R2_PUBLIC_URL}/${filename}`;
//     console.log("✅ SUCCESS! Uploaded to:", publicUrl);
    
//     return publicUrl;

//   } catch (err) {
//     console.error("🚨 CLOUDFLARE R2 UPLOAD FAILED! Reason:");
//     console.error(err.message);
//     return null; 
//   }
// }

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

// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const agentId = searchParams.get('agentId'); 

//     if (!agentId) return NextResponse.json({ error: 'Missing agent ID' }, { status: 400 });

//     // 🚨 EGRESS FIX 1: Calculate the timestamp for 24 hours ago
//     const yesterday = new Date();
//     yesterday.setHours(yesterday.getHours() - 24);

//     // 🚨 EGRESS FIX 2: Fetch ONLY the last 24 hours of visits, and ONLY needed columns
//     const agentVisits = await db.select({
//       medicalShopId: visits.medicalShopId,
//       createdAt: visits.createdAt,
//       orderAmount: visits.orderAmount,
//       paymentMethod: visits.paymentMethod
//       // Notice we exclude photoUrl and remark to save massive bandwidth
//     })
//     .from(visits)
//     .where(
//       and(
//         eq(visits.agentId, agentId),
//         gte(visits.createdAt, yesterday) // Restrict to recent visits only
//       )
//     )
//     .orderBy(desc(visits.createdAt)); 

//     const masterAreas = await db.select({ id: areas.id, name: areas.name }).from(areas);

//     // 🚨 EGRESS FIX 3: Drop 'photoUrl' and unused columns from the massive Shops payload
//     const allTargets = await db.select({
//       id: medicalShops.id,
//       name: medicalShops.name,
//       latitude: medicalShops.latitude,
//       longitude: medicalShops.longitude,
//       isVerified: medicalShops.isVerified,
//       placeName: places.name,
//       areaName: areas.name
//     })
//     .from(medicalShops)
//     .leftJoin(places, eq(medicalShops.placeId, places.id))
//     .leftJoin(areas, eq(places.areaId, areas.id));

//     const now = new Date();

//     const formattedTargets = allTargets.map((t) => {
//       const shopVisits = agentVisits.filter(v => String(v.medicalShopId) === String(t.id));
//       const latestVisit = shopVisits[0]; 
      
//       let status = 'PENDING';
//       let lastVisitedLabel = 'Never Visited';
//       let todayCollection = 0;
//       let todayOrder = 0;

//       if (latestVisit && latestVisit.createdAt) {
//         const vDate = new Date(latestVisit.createdAt);
//         if (!isNaN(vDate.getTime())) {
//           const hoursSinceVisit = Math.abs(now - vDate) / (1000 * 60 * 60);
//           if (hoursSinceVisit < 16) {
//             status = 'COMPLETED';
//             const timeString = vDate.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
//             lastVisitedLabel = `Visited today at ${timeString}`;
//             todayCollection = 0; 
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
//         Collection: todayCollection,
//         orderAmount: todayOrder,
//         paymentMethod: latestVisit?.paymentMethod || 'Cash' 
//       };
//     });

//     return NextResponse.json({ targets: formattedTargets, masterAreas: masterAreas }, {
//       headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' }
//     });
//   } catch (error) {
//     console.error('API Error:', error);
//     return NextResponse.json({ error: 'Failed to load route plan.' }, { status: 500 });
//   }
// }

// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const { agentId, targetId, photoUrl, photoUrlCrushed, orderAmount, collectionAmount, remark, latitude, longitude } = body;

//     const finalPaymentMethod = body.paymentMethod || body.paymentType || body.payment_method || 'Cash';

//     if (!agentId || !targetId) return NextResponse.json({ error: 'Agent ID and Target ID are required' }, { status: 400 });

//     if (photoUrl) {
//       const sizeInMB = (photoUrl.length * 0.75) / (1024 * 1024);
//       if (sizeInMB > 1.5) {
//         return NextResponse.json({ 
//           error: `Image is too large (${sizeInMB.toFixed(1)}MB). The app must compress it before saving.` 
//         }, { status: 413 });
//       }
//     }

//     const cleanTargetId = parseInt(targetId, 10);
//     if (isNaN(cleanTargetId)) return NextResponse.json({ error: 'Invalid Target ID.' }, { status: 400 });

//     const cleanOrderAmt = parseFloat(orderAmount) || 0;
    
//     const cleanCollectionAmt = parseFloat(collectionAmount) || 0;

//     // ─────────────────────────────────────────────────────────
//     // 🚨 ACTION 0: DUPLICATE PREVENTION (1 ENTRY PER DAY)
//     // ─────────────────────────────────────────────────────────
//     const lastVisit = await db.select({ createdAt: visits.createdAt })
//       .from(visits)
//       .where(
//         and(
//           eq(visits.agentId, String(agentId)),
//           eq(visits.medicalShopId, cleanTargetId)
//         )
//       )
//       .orderBy(desc(visits.createdAt))
//       .limit(1);

//     if (lastVisit.length > 0 && lastVisit[0].createdAt) {
//       const visitDate = new Date(lastVisit[0].createdAt);
//       const today = new Date();
      
//       // Check in Indian Standard Time (IST)
//       const visitDateIST = new Date(visitDate.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
//       const todayIST = new Date(today.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));

//       if (
//         visitDateIST.getFullYear() === todayIST.getFullYear() &&
//         visitDateIST.getMonth() === todayIST.getMonth() &&
//         visitDateIST.getDate() === todayIST.getDate()
//       ) {
//         return NextResponse.json({ 
//           error: '🚨 Duplicate Blocked: You have already logged this medical shop today!' 
//         }, { status: 409 });
//       }
//     }

// // ─────────────────────────────────────────────────────────
//     // CLOUDFLARE R2 UPLOAD INTERCEPTOR
//     // ─────────────────────────────────────────────────────────
//     // We only care about the crushed (smallest) photo to save space!
//     const incomingCrushed = photoUrlCrushed || photoUrl || null;
    
//     let finalBaselineUrl = null; 
//     let finalCrushedUrl = null;
//     const timestamp = Date.now();

//     // 🚨 Only upload the tiny, compressed image!
//     if (incomingCrushed && incomingCrushed.length > 1000) {
//       const filename = `visit_${cleanTargetId}_${timestamp}.jpg`;
//       finalCrushedUrl = await uploadToR2(incomingCrushed, filename);
      
//       // Assign the same URL to both database columns so nothing breaks
//       finalBaselineUrl = finalCrushedUrl; 
//     }
//     // ─────────────────────────────────────────────────────────
//     // ACTION 1: DRIZZLE INSERT (Log the Visit History)
//     // ─────────────────────────────────────────────────────────
//     const insertRes = await db.insert(visits).values({
//       agentId: String(agentId),
//       medicalShopId: cleanTargetId,
//       photoUrl: finalBaselineUrl, 
//       orderAmount: String(cleanOrderAmt),
//       collectionAmount: String(cleanCollectionAmt),
//       paymentMethod: finalPaymentMethod, 
//       remark: remark || '',
//       latitude: latitude ? String(latitude) : null,
//       longitude: longitude ? String(longitude) : null
//     }).returning({ id: visits.id });
    
//     const newVisitId = insertRes[0].id;

//     if (latitude && longitude) {
      
//       const shopData = await db.select({
//         savedLat: medicalShops.latitude,
//         savedLng: medicalShops.longitude,
//         savedPhotoUrl: medicalShops.photoUrl,
//         isVerified: medicalShops.isVerified 
//       })
//       .from(medicalShops)
//       .where(eq(medicalShops.id, cleanTargetId))
//       .limit(1);

//       if (shopData.length > 0) {
//         const shop = shopData[0];

//         // We only block them if the shop is ALREADY VERIFIED!
//         if (shop.savedLat && shop.savedLng && shop.isVerified) {
//           const distanceToShop = getDistance(latitude, longitude, Number(shop.savedLat), Number(shop.savedLng));
          
//           if (distanceToShop > 60) { 
//             return NextResponse.json({ 
//               error: `🚨 SERVER BLOCK: You are ${distanceToShop}m away from the verified shop location. (Max 60m)` 
//             }, { status: 403 });
//           }
//         }

//         // const isVerified = shop.isVerified === true;

//         // if (isVerified) {
//         //   // SHOP IS LOCKED: ONLY UPDATE LATEST PHOTO
//         //   await db.update(medicalShops)
//         //     .set({ 
//         //       photoUrl2: finalCrushedUrl 
//         //     })
//         //     .where(eq(medicalShops.id, cleanTargetId));
            
//         // } else {
//         //   // NOT VERIFIED YET: OVERWRITE ALL (Fixes bad GPS!)
//         //   await db.update(medicalShops)
//         //     .set({ 
//         //       latitude: String(latitude),
//         //       longitude: String(longitude),
//         //       photoUrl: finalBaselineUrl,  
//         //       photoUrl2: finalCrushedUrl ,
//         //     })
//         //     .where(eq(medicalShops.id, cleanTargetId));
//         // }

//         const isVerified = shop.isVerified === true;

//         if (isVerified) {
//           // SHOP IS VERIFIED: ONLY UPDATE LATEST PHOTO (photoUrl2) IF UPLOAD WAS SUCCESSFUL
//           if (finalCrushedUrl) {
//             await db.update(medicalShops)
//               .set({ 
//                 photoUrl2: finalCrushedUrl 
//               })
//               .where(eq(medicalShops.id, cleanTargetId));
//           }
            
//         } else {
//           // NOT VERIFIED YET: OVERWRITE ALL (Fixes bad GPS!)
//           await db.update(medicalShops)
//             .set({ 
//               latitude: String(latitude),
//               longitude: String(longitude),
//               // Use finalCrushedUrl if available, otherwise keep it whatever it was
//               photoUrl: finalBaselineUrl || null,  
//               photoUrl2: finalCrushedUrl || null,
//             })
//             .where(eq(medicalShops.id, cleanTargetId));
//         }
//       }
//     }

//     return NextResponse.json({ 
//       success: true, 
//       visitId: newVisitId,
//       Collection: cleanCollectionAmt,
//       time: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })
//     }, { status: 200 });

//   } catch (error) {
//     console.error('Failed to log visit:', error);
//     return NextResponse.json({ error: error.message || 'Database insertion failed.' }, { status: 500 });
//   }
// }


export const dynamic = 'force-dynamic'; 
export const revalidate = 60; 

import { NextResponse } from 'next/server';
import { db } from '../../../../db';
import { medicalShops, places, areas, visits } from '../../../../db/schema';
// 🚨 CRITICAL: Added 'sql' to securely check the Timezone in the database
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

async function uploadToR2(base64String, filename) {
  if (!base64String || !base64String.startsWith('data:image')) {
    console.error("🚨 Upload Blocked: The data sent from the phone is not a valid base64 image.");
    return null;
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log("🛠️ LOCAL MODE: Bypassing R2. Saving Base64 directly to local database.");
    return base64String; 
  }

  try {
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    
    console.log(`⏳ Uploading ${filename} to Cloudflare R2...`);

    await S3.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: 'image/jpeg',
    }));

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${filename}`;
    console.log("✅ SUCCESS! Uploaded to:", publicUrl);
    
    return publicUrl;
  } catch (err) {
    console.error("🚨 CLOUDFLARE R2 UPLOAD FAILED! Reason:", err.message);
    return null; 
  }
}

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

    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const agentVisits = await db.select({
      medicalShopId: visits.medicalShopId,
      createdAt: visits.createdAt,
      orderAmount: visits.orderAmount,
      paymentMethod: visits.paymentMethod
    })
    .from(visits)
    .where(
      and(
        eq(visits.agentId, agentId),
        gte(visits.createdAt, yesterday)
      )
    )
    .orderBy(desc(visits.createdAt)); 

    const masterAreas = await db.select({ id: areas.id, name: areas.name }).from(areas);

    const allTargets = await db.select({
      id: medicalShops.id,
      name: medicalShops.name,
      latitude: medicalShops.latitude,
      longitude: medicalShops.longitude,
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
      let todayCollection = 0;
      let todayOrder = 0;

      if (latestVisit && latestVisit.createdAt) {
        const vDate = new Date(latestVisit.createdAt);
        if (!isNaN(vDate.getTime())) {
          const hoursSinceVisit = Math.abs(now - vDate) / (1000 * 60 * 60);
          if (hoursSinceVisit < 16) {
            status = 'COMPLETED';
            const timeString = vDate.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
            lastVisitedLabel = `Visited today at ${timeString}`;
            todayCollection = 0; 
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
        Collection: todayCollection,
        orderAmount: todayOrder,
        paymentMethod: latestVisit?.paymentMethod || 'Cash' 
      };
    });

    return NextResponse.json({ targets: formattedTargets, masterAreas: masterAreas }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' }
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to load route plan.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { agentId, targetId, photoUrl, photoUrlCrushed, orderAmount, collectionAmount, remark, latitude, longitude } = body;

    const finalPaymentMethod = body.paymentMethod || body.paymentType || body.payment_method || 'Cash';

    if (!agentId || !targetId) return NextResponse.json({ error: 'Agent ID and Target ID are required' }, { status: 400 });

    if (photoUrl) {
      const sizeInMB = (photoUrl.length * 0.75) / (1024 * 1024);
      if (sizeInMB > 1.5) {
        return NextResponse.json({ 
          error: `Image is too large (${sizeInMB.toFixed(1)}MB). The app must compress it before saving.` 
        }, { status: 413 });
      }
    }

    const cleanTargetId = parseInt(targetId, 10);
    if (isNaN(cleanTargetId)) return NextResponse.json({ error: 'Invalid Target ID.' }, { status: 400 });

    const cleanOrderAmt = parseFloat(orderAmount) || 0;
    const cleanCollectionAmt = parseFloat(collectionAmount) || 0;

 // ─────────────────────────────────────────────────────────
    // 🚨 ACTION 0: BULLETPROOF DUPLICATE PREVENTION (1 ENTRY PER DAY)
    // ─────────────────────────────────────────────────────────
    // Using SQL to ensure checking is strictly tied to IST time
    const duplicateCheck = await db.select({ id: visits.id })
      .from(visits)
      .where(
        and(
          eq(visits.agentId, String(agentId)),
          eq(visits.medicalShopId, cleanTargetId),
          // 🚨 CRITICAL FIX: Tell Postgres the timestamp is UTC first, THEN shift to Kolkata time!
          sql`DATE(${visits.createdAt} AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata') = DATE(NOW() AT TIME ZONE 'Asia/Kolkata')`
        )
      )
      .limit(1);

    if (duplicateCheck.length > 0) {
      return NextResponse.json({ 
        error: '🚨 Duplicate Blocked: You have already logged this medical shop today!' 
      }, { status: 409 });
    }
    // ─────────────────────────────────────────────────────────
    // CLOUDFLARE R2 UPLOAD INTERCEPTOR
    // ─────────────────────────────────────────────────────────
    const incomingCrushed = photoUrlCrushed || photoUrl || null;
    let finalBaselineUrl = null; 
    let finalCrushedUrl = null;
    const timestamp = Date.now();

    if (incomingCrushed && incomingCrushed.length > 1000) {
      const filename = `visit_${cleanTargetId}_${timestamp}.jpg`;
      finalCrushedUrl = await uploadToR2(incomingCrushed, filename);
      finalBaselineUrl = finalCrushedUrl; 
    }

    // ─────────────────────────────────────────────────────────
    // ACTION 1: DRIZZLE INSERT (Log the Visit History)
    // ─────────────────────────────────────────────────────────
    const insertRes = await db.insert(visits).values({
      agentId: String(agentId),
      medicalShopId: cleanTargetId,
      photoUrl: finalBaselineUrl, 
      orderAmount: String(cleanOrderAmt),
      collectionAmount: String(cleanCollectionAmt),
      paymentMethod: finalPaymentMethod, 
      remark: remark || '',
      latitude: latitude ? String(latitude) : null,
      longitude: longitude ? String(longitude) : null
    }).returning({ id: visits.id });
    
    const newVisitId = insertRes[0].id;

    if (latitude && longitude) {
      
      const shopData = await db.select({
        savedLat: medicalShops.latitude,
        savedLng: medicalShops.longitude,
        savedPhotoUrl: medicalShops.photoUrl,
        isVerified: medicalShops.isVerified 
      })
      .from(medicalShops)
      .where(eq(medicalShops.id, cleanTargetId))
      .limit(1);

      if (shopData.length > 0) {
        const shop = shopData[0];

        // 🚨 500 METER RADIUS BLOCK
        if (shop.savedLat && shop.savedLng && shop.isVerified) {
          const distanceToShop = getDistance(latitude, longitude, Number(shop.savedLat), Number(shop.savedLng));
          
          if (distanceToShop > 500) { 
            return NextResponse.json({ 
              error: `🚨 SERVER BLOCK: You are ${distanceToShop}m away from the verified shop location. (Max 500m)` 
            }, { status: 403 });
          }
        }

        const isVerified = shop.isVerified === true;

        if (isVerified) {
          // SHOP IS VERIFIED: ONLY UPDATE LATEST PHOTO (photoUrl2)
          if (finalCrushedUrl) {
            await db.update(medicalShops)
              .set({ 
                photoUrl2: finalCrushedUrl 
              })
              .where(eq(medicalShops.id, cleanTargetId));
          }
        } else {
          // NOT VERIFIED YET: SAVE GPS AND PROTECT ORIGINAL MASTER PHOTO
          await db.update(medicalShops)
            .set({ 
              latitude: String(latitude),
              longitude: String(longitude),
              // Use saved master photo if it exists, otherwise use current
              photoUrl: shop.savedPhotoUrl ? shop.savedPhotoUrl : (finalBaselineUrl || null),  
              photoUrl2: finalCrushedUrl || null,
            })
            .where(eq(medicalShops.id, cleanTargetId));
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      visitId: newVisitId,
      Collection: cleanCollectionAmt,
      time: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to log visit:', error);
    return NextResponse.json({ error: error.message || 'Database insertion failed.' }, { status: 500 });
  }
}