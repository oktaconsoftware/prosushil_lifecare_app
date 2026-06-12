import { NextResponse } from 'next/server';
import { db } from '@/db';
import { targets } from '@/db/schema';

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

// GET: Find all medical shops within 200 meters of the Agent's GPS
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentLat = parseFloat(searchParams.get('lat'));
    const agentLng = parseFloat(searchParams.get('lng'));

    if (!agentLat || !agentLng) {
      return NextResponse.json({ error: 'GPS coordinates required' }, { status: 400 });
    }

    // Fetch all targets (In a massive app with 100,000s of targets, you would use PostGIS. 
    // For now, filtering in memory is perfectly fast enough).
    const allTargets = await db.select().from(targets);

    const nearbyShops = allTargets.map(shop => {
      const dist = calculateDistance(agentLat, agentLng, Number(shop.latitude), Number(shop.longitude));
      return { ...shop, distance: dist };
    })
    .filter(shop => shop.distance <= 200) // Only return shops within a 200m radius
    .sort((a, b) => a.distance - b.distance); // Closest first

    return NextResponse.json(nearbyShops);
  } catch (error) {
    console.error('Discovery Error:', error);
    return NextResponse.json({ error: 'Failed to scan nearby area.' }, { status: 500 });
  }
}

// POST: Register a brand new medical shop into the database
export async function POST(request) {
  try {
    const { name, address, latitude, longitude, photoUrl } = await request.json();

    if (!name || !latitude || !longitude) {
      return NextResponse.json({ error: 'Missing required shop data.' }, { status: 400 });
    }

    // Insert the newly discovered shop into the global database
    const newShop = await db.insert(targets).values({
      name,
      address: address || 'Discovered via GPS',
      latitude: latitude,
      longitude: longitude,
      // Note: Add a photoUrl column to your targets schema if you want to store the shop image!
    }).returning({ id: targets.id, name: targets.name });

    return NextResponse.json({ success: true, target: newShop[0] }, { status: 201 });
  } catch (error) {
    console.error('Shop Registration Error:', error);
    return NextResponse.json({ error: 'Failed to register new medical shop.' }, { status: 500 });
  }
}