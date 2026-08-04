
// export const dynamic = 'force-dynamic'; 
// export const revalidate = 0; 
// export const fetchCache = 'force-no-store';

// import { NextResponse } from 'next/server';
// import { db } from '../../../../db';
// import { medicalShops, places, areas, visits } from '../../../../db/schema';
// import { eq, desc, sql } from 'drizzle-orm'; 
// import { createClient } from '@supabase/supabase-js';

// // ─────────────────────────────────────────────────────────
// // SAFE SUPABASE INITIALIZATION HELPER
// // ─────────────────────────────────────────────────────────
// function getSupabaseClient() {
//   let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
//   let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
//   if (!supabaseUrl || !supabaseKey) {
//     console.error("🚨 SUPABASE KEYS MISSING FROM .env.local!");
//     return null;
//   }

//   // 🚨 STRIP OUT HIDDEN SPACES, NEWLINES, OR QUOTES
//   supabaseUrl = supabaseUrl.replace(/['"]/g, '').trim();
//   supabaseKey = supabaseKey.replace(/['"]/g, '').trim();

//   // DEBUG LOG: This will print in your VS Code terminal so you can see exactly what is being read
//   console.log("🔍 SUPABASE URL READ AS:", supabaseUrl);
  
//   try {
//     return createClient(supabaseUrl, supabaseKey);
//   } catch (err) {
//     console.error("🚨 createClient Crash:", err.message);
//     return null;
//   }
// }
// async function uploadToSupabase(base64String, filename) {
//   if (!base64String || !base64String.startsWith('data:image')) return null;
  
//   // 🚨 THE MAGIC SWITCH: Local Development Bypass
//   if (process.env.NODE_ENV === 'development') {
//     console.log("🛠️ LOCAL MODE DETECTED: Bypassing Supabase and saving Base64 directly.");
//     // Returning the raw Base64 string means it saves straight to your local PostgreSQL
//     // and your frontend <img> tags will still render it perfectly!
//     return base64String; 
//   }

//   // 🌍 PRODUCTION MODE: Proceed with normal Supabase upload
//   const supabase = getSupabaseClient();
//   if (!supabase) return null; // Fails safely if keys are missing
  
//   try {
//     // 1. Strip the "data:image/jpeg;base64," prefix
//     const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
//     // 2. Convert to a Buffer
//     const buffer = Buffer.from(base64Data, 'base64');

//     // 3. Upload to the 'shop_photos' bucket
//     const { data, error } = await supabase.storage
//       .from('shop_photos')
//       .upload(filename, buffer, {
//         contentType: 'image/jpeg',
//         upsert: true
//       });

//     if (error) throw error;

//     // 4. Return the tiny public URL
//     const { data: publicUrlData } = supabase.storage
//       .from('shop_photos')
//       .getPublicUrl(filename);

//     return publicUrlData.publicUrl;
//   } catch (err) {
//     console.error("Supabase Upload Error:", err);
//     return null; 
//   }
// }

// // Math function to check the 20km shield
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

// // ─────────────────────────────────────────────────────────
// // GET REQUEST: DASHBOARD LIST FETCH
// // ─────────────────────────────────────────────────────────
// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const agentId = searchParams.get('agentId'); 

//     if (!agentId) return NextResponse.json({ error: 'Missing agent ID' }, { status: 400 });

//     const agentVisits = await db.select().from(visits).where(eq(visits.agentId, agentId)).orderBy(desc(visits.createdAt)); 
//     const masterAreas = await db.select({ id: areas.id, name: areas.name }).from(areas);

//     const allTargets = await db.select({
//       id: medicalShops.id,
//       name: medicalShops.name,
//       address: medicalShops.address,
//       latitude: medicalShops.latitude,
//       longitude: medicalShops.longitude,
//       photoUrl: medicalShops.photoUrl,
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
//       let todayCollection= 0;
//       let todayOrder = 0;

//       if (latestVisit && latestVisit.createdAt) {
//         const vDate = new Date(latestVisit.createdAt);
//         if (!isNaN(vDate.getTime())) {
//           const hoursSinceVisit = Math.abs(now - vDate) / (1000 * 60 * 60);
//           if (hoursSinceVisit < 16) {
//             status = 'COMPLETED';
//             const timeString = vDate.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
//             lastVisitedLabel = `Visited today at ${timeString}`;
//             todayCollection= 0; 
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
//       headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' }
//     });
//   } catch (error) {
//     console.error('API Error:', error);
//     return NextResponse.json({ error: 'Failed to load route plan.' }, { status: 500 });
//   }
// }

// // ─────────────────────────────────────────────────────────
// // POST REQUEST: LOG VISIT & UPLOAD PHOTOS
// // ─────────────────────────────────────────────────────────
// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const { agentId, targetId, photoUrl, photoUrlCrushed, orderAmount, collectionAmount, remark, latitude, longitude } = body;

//     const finalPaymentMethod = body.paymentMethod || body.paymentType || body.payment_method || 'Cash';

//     if (!agentId || !targetId) return NextResponse.json({ error: 'Agent ID and Target ID are required' }, { status: 400 });

//     // NUCLEAR BASE64 SIZE SHIELD
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
//     // SUPABASE CLOUD UPLOAD INTERCEPTOR
//     // ─────────────────────────────────────────────────────────
//     const incomingBaseline = photoUrl || null;
//     const incomingCrushed = photoUrlCrushed || photoUrl || null;
    
//     let finalBaselineUrl = null;
//     let finalCrushedUrl = null;
//     const timestamp = Date.now();

//     // Only upload if a Base64 string was actually sent
//     if (incomingBaseline && incomingBaseline.length > 1000) {
//       const filename = `baseline_${cleanTargetId}_${timestamp}.jpg`;
//       finalBaselineUrl = await uploadToSupabase(incomingBaseline, filename);
//     }
    
//     if (incomingCrushed && incomingCrushed.length > 1000) {
//       const filename = `visit_${cleanTargetId}_${timestamp}.jpg`;
//       finalCrushedUrl = await uploadToSupabase(incomingCrushed, filename);
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

//     // ─────────────────────────────────────────────────────────
//     // ACTION 2: 20KM SHIELD & BASELINE VS CURRENT LOGIC
//     // ─────────────────────────────────────────────────────────
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

//         if (shop.savedLat && shop.savedLng) {
//           const distanceToShop = getDistance(latitude, longitude, Number(shop.savedLat), Number(shop.savedLng));
          
//           // 🚨 TIGHTENED TO 50 METERS
//           if (distanceToShop > 50) { 
//             return NextResponse.json({ 
//               error: `🚨 MISMATCH: GPS verification failed at server level. You are ${distanceToShop}m away.` 
//             }, { status: 403 });
//           }
//         }

//         const isVerified = shop.isVerified === true;

//         if (isVerified) {
//           // 🔒 SHOP IS LOCKED: ONLY UPDATE LATEST PHOTO
//           await db.update(medicalShops)
//             .set({ 
//               photoUrl2: finalCrushedUrl 
//             })
//             .where(eq(medicalShops.id, cleanTargetId));
            
//         } else {
//           // 🔓 NOT VERIFIED YET: OVERWRITE ALL
//           await db.update(medicalShops)
//             .set({ 
//               latitude: String(latitude),
//               longitude: String(longitude),
//               photoUrl: finalBaselineUrl,  
//               photoUrl2: finalCrushedUrl ,
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
//     console.error('Failed to log deal:', error);
//     return NextResponse.json({ error: error.message || 'Database insertion failed.' }, { status: 500 });
//   }
// }



// export const dynamic = 'force-dynamic'; 
// export const revalidate = 0; 
// export const fetchCache = 'force-no-store';

// import { NextResponse } from 'next/server';
// import { db } from '../../../../db';
// import { medicalShops, places, areas, visits } from '../../../../db/schema';
// import { eq, desc, sql } from 'drizzle-orm'; 
// import { createClient } from '@supabase/supabase-js';

// // ─────────────────────────────────────────────────────────
// // SAFE SUPABASE INITIALIZATION HELPER
// // ─────────────────────────────────────────────────────────
// function getSupabaseClient() {
//   let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
//   let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
//   if (!supabaseUrl || !supabaseKey) {
//     console.error("🚨 SUPABASE KEYS MISSING FROM .env.local!");
//     return null;
//   }

//   // 🚨 STRIP OUT HIDDEN SPACES, NEWLINES, OR QUOTES
//   supabaseUrl = supabaseUrl.replace(/['"]/g, '').trim();
//   supabaseKey = supabaseKey.replace(/['"]/g, '').trim();

//   // DEBUG LOG: This will print in your VS Code terminal so you can see exactly what is being read
//   console.log("🔍 SUPABASE URL READ AS:", supabaseUrl);
  
//   try {
//     return createClient(supabaseUrl, supabaseKey);
//   } catch (err) {
//     console.error("🚨 createClient Crash:", err.message);
//     return null;
//   }
// }
// async function uploadToSupabase(base64String, filename) {
//   if (!base64String || !base64String.startsWith('data:image')) return null;
  
//   // 🚨 THE MAGIC SWITCH: Local Development Bypass
//   if (process.env.NODE_ENV === 'development') {
//     console.log("🛠️ LOCAL MODE DETECTED: Bypassing Supabase and saving Base64 directly.");
//     // Returning the raw Base64 string means it saves straight to your local PostgreSQL
//     // and your frontend <img> tags will still render it perfectly!
//     return base64String; 
//   }

//   // 🌍 PRODUCTION MODE: Proceed with normal Supabase upload
//   const supabase = getSupabaseClient();
//   if (!supabase) return null; // Fails safely if keys are missing
  
//   try {
//     // 1. Strip the "data:image/jpeg;base64," prefix
//     const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
//     // 2. Convert to a Buffer
//     const buffer = Buffer.from(base64Data, 'base64');

//     // 3. Upload to the 'shop_photos' bucket
//     const { data, error } = await supabase.storage
//       .from('shop_photos')
//       .upload(filename, buffer, {
//         contentType: 'image/jpeg',
//         upsert: true
//       });

//     if (error) throw error;

//     // 4. Return the tiny public URL
//     const { data: publicUrlData } = supabase.storage
//       .from('shop_photos')
//       .getPublicUrl(filename);

//     return publicUrlData.publicUrl;
//   } catch (err) {
//     console.error("Supabase Upload Error:", err);
//     return null; 
//   }
// }

// // Math function to check the 20km shield
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

// // ─────────────────────────────────────────────────────────
// // GET REQUEST: DASHBOARD LIST FETCH
// // ─────────────────────────────────────────────────────────
// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const agentId = searchParams.get('agentId'); 

//     if (!agentId) return NextResponse.json({ error: 'Missing agent ID' }, { status: 400 });

//     const agentVisits = await db.select().from(visits).where(eq(visits.agentId, agentId)).orderBy(desc(visits.createdAt)); 
//     const masterAreas = await db.select({ id: areas.id, name: areas.name }).from(areas);

//     const allTargets = await db.select({
//       id: medicalShops.id,
//       name: medicalShops.name,
//       address: medicalShops.address,
//       latitude: medicalShops.latitude,
//       longitude: medicalShops.longitude,
//       photoUrl: medicalShops.photoUrl,
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
//       let todayCollection= 0;
//       let todayOrder = 0;

//       if (latestVisit && latestVisit.createdAt) {
//         const vDate = new Date(latestVisit.createdAt);
//         if (!isNaN(vDate.getTime())) {
//           const hoursSinceVisit = Math.abs(now - vDate) / (1000 * 60 * 60);
//           if (hoursSinceVisit < 16) {
//             status = 'COMPLETED';
//             const timeString = vDate.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
//             lastVisitedLabel = `Visited today at ${timeString}`;
//             todayCollection= 0; 
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
//       headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' }
//     });
//   } catch (error) {
//     console.error('API Error:', error);
//     return NextResponse.json({ error: 'Failed to load route plan.' }, { status: 500 });
//   }
// }

// // ─────────────────────────────────────────────────────────
// // POST REQUEST: LOG VISIT & UPLOAD PHOTOS
// // ─────────────────────────────────────────────────────────
// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const { agentId, targetId, photoUrl, photoUrlCrushed, orderAmount, collectionAmount, remark, latitude, longitude } = body;

//     const finalPaymentMethod = body.paymentMethod || body.paymentType || body.payment_method || 'Cash';

//     if (!agentId || !targetId) return NextResponse.json({ error: 'Agent ID and Target ID are required' }, { status: 400 });

//     // NUCLEAR BASE64 SIZE SHIELD
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
//     // SUPABASE CLOUD UPLOAD INTERCEPTOR
//     // ─────────────────────────────────────────────────────────
//     const incomingBaseline = photoUrl || null;
//     const incomingCrushed = photoUrlCrushed || photoUrl || null;
    
//     let finalBaselineUrl = null;
//     let finalCrushedUrl = null;
//     const timestamp = Date.now();

//     // Only upload if a Base64 string was actually sent
//     if (incomingBaseline && incomingBaseline.length > 1000) {
//       const filename = `baseline_${cleanTargetId}_${timestamp}.jpg`;
//       finalBaselineUrl = await uploadToSupabase(incomingBaseline, filename);
//     }
    
//     if (incomingCrushed && incomingCrushed.length > 1000) {
//       const filename = `visit_${cleanTargetId}_${timestamp}.jpg`;
//       finalCrushedUrl = await uploadToSupabase(incomingCrushed, filename);
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
//         const shop = shopData[0]; // 🚨 DEFINED HERE!

//         // 🚨 FIX 1: We only block them if the shop is ALREADY VERIFIED!
//         if (shop.savedLat && shop.savedLng && shop.isVerified) {
//           const distanceToShop = getDistance(latitude, longitude, Number(shop.savedLat), Number(shop.savedLng));
          
//           // 🚨 FIX 2: Increased to 60 meters to match your frontend rules perfectly
//           if (distanceToShop > 60) { 
//             return NextResponse.json({ 
//               error: `🚨 SERVER BLOCK: You are ${distanceToShop}m away from the verified shop location. (Max 60m)` 
//             }, { status: 403 });
//           }
//         }

//         const isVerified = shop.isVerified === true;

//         if (isVerified) {
//           // 🔒 SHOP IS LOCKED: ONLY UPDATE LATEST PHOTO
//           await db.update(medicalShops)
//             .set({ 
//               photoUrl2: finalCrushedUrl 
//             })
//             .where(eq(medicalShops.id, cleanTargetId));
            
//         } else {
//           // 🔓 NOT VERIFIED YET: OVERWRITE ALL (Fixes bad GPS!)
//           await db.update(medicalShops)
//             .set({ 
//               latitude: String(latitude),
//               longitude: String(longitude),
//               photoUrl: finalBaselineUrl,  
//               photoUrl2: finalCrushedUrl ,
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
//     console.error('Failed to log deal:', error);
//     return NextResponse.json({ error: error.message || 'Database insertion failed.' }, { status: 500 });
//   }
// }


export const dynamic = 'force-dynamic'; 
export const revalidate = 60; 

import { NextResponse } from 'next/server';
import { db } from '../../../../db';
import { medicalShops, places, areas, visits } from '../../../../db/schema';
import { eq, desc } from 'drizzle-orm'; 
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
  // Check if it's actually an image
  if (!base64String || !base64String.startsWith('data:image')) {
    console.error("🚨 Upload Blocked: The data sent from the phone is not a valid base64 image.");
    return null;
  }
  
  // 🛠️ THE LOCAL TESTING BYPASS
  // When running 'npm run dev', this skips Cloudflare and returns the raw Base64 string
  if (process.env.NODE_ENV === 'development') {
    console.log("🛠️ LOCAL MODE: Bypassing R2. Saving Base64 directly to local database.");
    return base64String; 
  }

  try {
    // 1. Strip the prefix
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
    // 2. Convert to Buffer
    const buffer = Buffer.from(base64Data, 'base64');

    console.log(`⏳ Uploading ${filename} to Cloudflare R2...`);

    // 3. Upload to Cloudflare R2
    await S3.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: 'image/jpeg',
    }));

    // 4. Return the Cloudflare Public URL
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${filename}`;
    console.log("✅ SUCCESS! Uploaded to:", publicUrl);
    
    return publicUrl;

  } catch (err) {
    console.error("🚨 CLOUDFLARE R2 UPLOAD FAILED! Reason:");
    console.error(err.message);
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
      let todayCollection= 0;
      let todayOrder = 0;

      if (latestVisit && latestVisit.createdAt) {
        const vDate = new Date(latestVisit.createdAt);
        if (!isNaN(vDate.getTime())) {
          const hoursSinceVisit = Math.abs(now - vDate) / (1000 * 60 * 60);
          if (hoursSinceVisit < 16) {
            status = 'COMPLETED';
            const timeString = vDate.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
            lastVisitedLabel = `Visited today at ${timeString}`;
            todayCollection= 0; 
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

    // 🚨 EGRESS FIX: Allows the browser to cache this data for 60 seconds
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
    // CLOUDFLARE R2 UPLOAD INTERCEPTOR
    // ─────────────────────────────────────────────────────────
    // We only care about the crushed (smallest) photo to save space!
    const incomingCrushed = photoUrlCrushed || photoUrl || null;
    
    let finalBaselineUrl = null; 
    let finalCrushedUrl = null;
    const timestamp = Date.now();

    // 🚨 Only upload the tiny, compressed image!
    if (incomingCrushed && incomingCrushed.length > 1000) {
      const filename = `visit_${cleanTargetId}_${timestamp}.jpg`;
      finalCrushedUrl = await uploadToR2(incomingCrushed, filename);
      
      // Assign the same URL to both database columns so nothing breaks
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

        // We only block them if the shop is ALREADY VERIFIED!
        if (shop.savedLat && shop.savedLng && shop.isVerified) {
          const distanceToShop = getDistance(latitude, longitude, Number(shop.savedLat), Number(shop.savedLng));
          
          if (distanceToShop > 60) { 
            return NextResponse.json({ 
              error: `🚨 SERVER BLOCK: You are ${distanceToShop}m away from the verified shop location. (Max 60m)` 
            }, { status: 403 });
          }
        }

        const isVerified = shop.isVerified === true;

        if (isVerified) {
          // SHOP IS LOCKED: ONLY UPDATE LATEST PHOTO
          await db.update(medicalShops)
            .set({ 
              photoUrl2: finalCrushedUrl 
            })
            .where(eq(medicalShops.id, cleanTargetId));
            
        } else {
          // NOT VERIFIED YET: OVERWRITE ALL (Fixes bad GPS!)
          await db.update(medicalShops)
            .set({ 
              latitude: String(latitude),
              longitude: String(longitude),
              photoUrl: finalBaselineUrl,  
              photoUrl2: finalCrushedUrl ,
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