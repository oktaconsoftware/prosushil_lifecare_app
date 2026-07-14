import { NextResponse } from 'next/server';
import { db } from '../../../../db';
import { medicalShops, places, areas } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

// Haversine distance calculator for the server
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  return Math.round(R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))));
}

// GET: Find recognized medical shops within 200m
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentLat = parseFloat(searchParams.get('lat'));
    const agentLng = parseFloat(searchParams.get('lng'));

    if (!agentLat || !agentLng) return NextResponse.json({ error: 'GPS coordinates required' }, { status: 400 });

    // Fetch all medical shops with their Area and Place names
    const allShops = await db.select({
      id: medicalShops.id,
      name: medicalShops.name,
      address: medicalShops.address,
      latitude: medicalShops.latitude,
      longitude: medicalShops.longitude,
      placeName: places.name,
      areaName: areas.name
    })
    .from(medicalShops)
    .leftJoin(places, eq(medicalShops.placeId, places.id))
    .leftJoin(areas, eq(places.areaId, areas.id));

    // Filter by GPS distance
    const nearbyShops = allShops.map(shop => {
      const dist = calculateDistance(agentLat, agentLng, Number(shop.latitude), Number(shop.longitude));
      return { ...shop, distance: dist };
    })
    .filter(shop => shop.distance <= 200) // Within 200 meters
    .sort((a, b) => a.distance - b.distance); 

    return NextResponse.json(nearbyShops);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to scan nearby area.' }, { status: 500 });
  }
}

// POST: Register a brand new medical shop permanently into the DB
export async function POST(request) {
  try {
    const { name, address, placeId, latitude, longitude } = await request.json();

    if (!name || !placeId || !latitude || !longitude) {
      return NextResponse.json({ error: 'Missing required shop data.' }, { status: 400 });
    }

    // Insert into the master medical_shops table
    const newShop = await db.insert(medicalShops).values({
      name,
      address: address || 'Discovered via GPS Field Scan',
      placeId: placeId,
      latitude: latitude,
      longitude: longitude,
    }).returning();

    return NextResponse.json({ success: true, target: newShop[0] }, { status: 201 });
  } catch (error) {
    console.error('Shop Registration Error:', error);
    return NextResponse.json({ error: 'Failed to register new medical shop.' }, { status: 500 });
  }
}