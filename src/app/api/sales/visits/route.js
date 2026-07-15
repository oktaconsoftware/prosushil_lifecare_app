export const dynamic = 'force-dynamic'; 
export const revalidate = 0; 
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';
import { db } from '../../../../db';
import { medicalShops, places, areas, visits } from '../../../../db/schema';
import { eq, desc, sql } from 'drizzle-orm'; 

// Math function to check the 20km shield
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

    // ─────────────────────────────────────────────────────────
    // NEW: NUCLEAR BASE64 SIZE SHIELD
    // ─────────────────────────────────────────────────────────
    if (photoUrl) {
      // Base64 strings are ~33% larger than the actual file. 
      // This calculates the exact file size in Megabytes.
      const sizeInMB = (photoUrl.length * 0.75) / (1024 * 1024);
      
      // If the image is larger than 1.5MB, reject it immediately to protect the database.
      if (sizeInMB > 1.5) {
        return NextResponse.json({ 
          error: `Image is too large (${sizeInMB.toFixed(1)}MB). The app must compress it before saving.` 
        }, { status: 413 });
      }
    }
    // ─────────────────────────────────────────────────────────

    const cleanTargetId = parseInt(targetId, 10);
    if (isNaN(cleanTargetId)) return NextResponse.json({ error: 'Invalid Target ID.' }, { status: 400 });

    const cleanOrderAmt = parseFloat(orderAmount) || 0;
    const cleanCollectionAmt = parseFloat(collectionAmount) || 0;
    // ─────────────────────────────────────────────────────────
    // ACTION 1: RAW SQL INSERT (Log the Visit)
    // ─────────────────────────────────────────────────────────
    const insertRes = await db.execute(sql`
      INSERT INTO visits (agent_id, medical_shop_id, photo_url, order_amount, collection_amount, payment_method, remark)
      VALUES (${String(agentId)}, ${cleanTargetId}, ${photoUrl || null}, ${String(cleanOrderAmt)}, ${String(cleanCollectionAmt)}, ${paymentMethod || 'None'}, ${remark || ''})
      RETURNING id
    `);
    
    const newVisitId = insertRes.rows ? insertRes.rows[0].id : (insertRes[0] ? insertRes[0].id : 0);

    // ─────────────────────────────────────────────────────────
    // ACTION 2: 20KM SHIELD & SHOP UPDATE
    // ─────────────────────────────────────────────────────────
    if (latitude && longitude) {
      
      // Fetch the currently saved GPS of this specific shop
      const shopData = await db.select({
        savedLat: medicalShops.latitude,
        savedLng: medicalShops.longitude,
      })
      .from(medicalShops)
      .where(eq(medicalShops.id, cleanTargetId))
      .limit(1);

      if (shopData.length > 0) {
        const { savedLat, savedLng } = shopData[0];

        // 🚨 APPLY 20KM SHIELD ONLY IF GPS IS ALREADY SAVED IN DB
        if (savedLat && savedLng) {
          const distanceToShop = getDistance(latitude, longitude, Number(savedLat), Number(savedLng));
          
          if (distanceToShop > 20000) { // 20,000 meters = 20km
            return NextResponse.json({ 
              error: `🚨 MISMATCH: You are ${(distanceToShop / 1000).toFixed(1)}km away from the shop's official location.` 
            }, { status: 403 });
          }
        }
      }

      // Update the Medical Shop with new GPS and Image IF it's not verified yet!
      await db.execute(sql`
        UPDATE medical_shops 
        SET latitude = ${String(latitude)}, 
            longitude = ${String(longitude)}, 
            photo_url = ${photoUrl || null}
        WHERE id = ${cleanTargetId} 
          AND (is_verified IS NULL OR is_verified = false)
      `);
    }

    return NextResponse.json({ 
      success: true, 
      visitId: newVisitId,
      Collection: 0,
      time: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to log deal:', error);
    return NextResponse.json({ error: error.message || 'Database insertion failed.' }, { status: 500 });
  }
}