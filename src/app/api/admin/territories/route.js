// import { NextResponse } from 'next/server';
// import { db } from '../../../../db/index';
// import { areas, places, medicalShops } from '../../../../db/schema';
// // CRITICAL FIX: Added inArray, ilike, and 'and' to the imports
// import { eq, inArray, ilike, and } from 'drizzle-orm';

// // Helper to standardize text to Title Case (e.g., "sangli" -> "Sangli")
// function toTitleCase(str) {
//   return String(str).trim().toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
// }

// // GET: Fetch all territories
// export async function GET() {
//   try {
//     const allAreas = await db.select().from(areas);
//     const allPlaces = await db.select().from(places);
//     const allMedicals = await db.select().from(medicalShops);

//     const territories = allAreas.map(area => ({
//       id: area.id,
//       name: area.name,
//       places: allPlaces.filter(p => p.areaId === area.id).map(place => ({
//         id: place.id,
//         name: place.name,
//         medicals: allMedicals.filter(m => m.placeId === place.id)
//       }))
//     }));

//     return NextResponse.json(territories);
//   } catch (error) {
//     return NextResponse.json({ error: 'Database fetch failed' }, { status: 500 });
//   }
// }

// // POST: Add new record (With Duplicate Prevention)
// export async function POST(request) {
//   try {
//     const { type, name, parentId, address } = await request.json();
//     const cleanName = toTitleCase(name);
//     let newRecord;

//     if (type === 'area') {
//       // Check if area already exists (case-insensitive)
//       const existing = await db.select().from(areas).where(ilike(areas.name, cleanName)).limit(1);
//       if (existing.length > 0) return NextResponse.json({ error: 'Area already exists' }, { status: 400 });
      
//       newRecord = await db.insert(areas).values({ name: cleanName }).returning();
//     } 
//     else if (type === 'place') {
//       // Check if place already exists inside this specific area (case-insensitive)
//       const existing = await db.select().from(places).where(and(ilike(places.name, cleanName), eq(places.areaId, parentId))).limit(1);
//       if (existing.length > 0) return NextResponse.json({ error: 'Place already exists in this area' }, { status: 400 });
      
//       newRecord = await db.insert(places).values({ name: cleanName, areaId: parentId }).returning();
//     } 
//     else if (type === 'medical') {
//       newRecord = await db.insert(medicalShops).values({ name: cleanName, address, placeId: parentId }).returning();
//     }

//     return NextResponse.json({ success: true, data: newRecord[0] });
//   } catch (error) {
//     return NextResponse.json({ error: 'Failed to save to database' }, { status: 500 });
//   }
// }

// // // PUT: Edit existing record
// // export async function PUT(request) {
// //   try {
// //     const { type, id, name, address } = await request.json();
// //     const cleanName = toTitleCase(name);
    
// //     if (type === 'area') await db.update(areas).set({ name: cleanName }).where(eq(areas.id, id));
// //     else if (type === 'place') await db.update(places).set({ name: cleanName }).where(eq(places.id, id));
// //     else if (type === 'medical') await db.update(medicalShops).set({ name: cleanName, address }).where(eq(medicalShops.id, id));

// //     return NextResponse.json({ success: true });
// //   } catch (error) {
// //     return NextResponse.json({ error: 'Update failed' }, { status: 500 });
// //   }
// // }


// // PUT: Edit existing record
// export async function PUT(request) {
//   try {
//     // 1. Extract removeGps from the request body
//     const { type, id, name, address, removeGps } = await request.json();
//     const cleanName = toTitleCase(name);
    
//     if (type === 'area') {
//       await db.update(areas).set({ name: cleanName }).where(eq(areas.id, id));
//     } 
//     else if (type === 'place') {
//       await db.update(places).set({ name: cleanName }).where(eq(places.id, id));
//     } 
//     else if (type === 'medical') {
      
//       // 2. Check if the admin checked the "Clear GPS" box
//       if (removeGps) {
//         await db.update(medicalShops)
//           .set({ 
//             name: cleanName, 
//             address: address,
//             latitude: null,       // Wipe latitude
//             longitude: null,      // Wipe longitude
//             photoUrl: null,       // Remove the old photo
//             isVerified: false     // Force them to re-verify
//           })
//           .where(eq(medicalShops.id, id));
//       } else {
//         // Standard edit: just update the name and address
//         await db.update(medicalShops)
//           .set({ name: cleanName, address: address })
//           .where(eq(medicalShops.id, id));
//       }
//     }

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Update Error:", error);
//     return NextResponse.json({ error: 'Update failed' }, { status: 500 });
//   }
// }

// // DELETE: Remove record (With Manual Cascade)
// export async function DELETE(request) {
//   try {
//     const { type, id } = await request.json();

//     if (type === 'area') {
//       // 1. Find all places in this area
//       const linkedPlaces = await db.select({ id: places.id }).from(places).where(eq(places.areaId, id));
//       const placeIds = linkedPlaces.map(p => p.id);

//       // 2. Delete medical shops linked to those places (using the imported inArray)
//       if (placeIds.length > 0) {
//         await db.delete(medicalShops).where(inArray(medicalShops.placeId, placeIds));
//       }

//       // 3. Delete the places
//       await db.delete(places).where(eq(places.areaId, id));

//       // 4. Finally, delete the Area itself
//       await db.delete(areas).where(eq(areas.id, id));

//     } else if (type === 'place') {
//       // 1. Delete medical shops in this place
//       await db.delete(medicalShops).where(eq(medicalShops.placeId, id));

//       // 2. Delete the place itself
//       await db.delete(places).where(eq(places.id, id));

//     } else if (type === 'medical') {
//       // Delete just the medical shop
//       await db.delete(medicalShops).where(eq(medicalShops.id, id));
//     }

//     return NextResponse.json({ success: true });

//   } catch (error) {
//     console.error("Delete Error:", error);

//     // If PostgreSQL blocks it (e.g., Shop is already assigned to a Salesman's route)
//     if (error.code === '23503') {
//       return NextResponse.json(
//         { error: "Cannot delete. This item is actively assigned to a Salesman's route." }, 
//         { status: 400 }
//       );
//     }

//     return NextResponse.json({ error: 'Deletion failed due to a database error.' }, { status: 500 });
//   }
// }

// export async function PATCH(request) {
//   try {
//     const body = await request.json();
//     const { type, id, isVerified } = body; // isVerified is now a boolean (true or false)

//     if (type === 'medical' && id !== undefined) {
//       await db.update(medicalShops)
//         .set({ isVerified: !!isVerified }) // Forces the boolean value
//         .where(eq(medicalShops.id, id));
        
//       return NextResponse.json({ success: true }, { status: 200 });
//     }
    
//     return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
//   } catch (error) {
//     return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
//   }
// }

// import { NextResponse } from 'next/server';
// import { cookies } from 'next/headers'; 
// import { db } from '../../../../db/index';
// import { areas, places, medicalShops, users, visits } from '../../../../db/schema';
// // 🚨 FIX 1: Added 'sql' to the imports here
// import { eq, inArray, ilike, and, sql } from 'drizzle-orm';

// // 🚨 FIX: Force Next.js to NEVER cache this route
// export const dynamic = 'force-dynamic';
// export const revalidate = 0;

// // Helper to standardize text to Title Case
// function toTitleCase(str) {
//   return String(str).trim().toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
// }

// // Helper to hash the password for verification
// async function hashPassword(password) {
//   const encoder = new TextEncoder();
//   const data = encoder.encode(password);
//   const hashBuffer = await crypto.subtle.digest('SHA-256', data);
//   const hashArray = Array.from(new Uint8Array(hashBuffer));
//   return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
// }

// // 🚨 FIX 2: Updated GET to PREVENT downloading massive photo URLs
// // GET: Fetch all territories (Optimized for massive data)
// export async function GET() {
//   try {
//     // 1. Fetch exactly the columns we need to prevent memory overload
//     const allAreas = await db.select({ id: areas.id, name: areas.name }).from(areas);
//     const allPlaces = await db.select({ id: places.id, name: places.name, areaId: places.areaId }).from(places);
    
//     // We explicitly EXCLUDE `photoUrl` from this query to stop server freezing!
//     const allMedicals = await db.select({
//       id: medicalShops.id,
//       name: medicalShops.name,
//       address: medicalShops.address,
//       placeId: medicalShops.placeId,
//       isVerified: medicalShops.isVerified,
//       // We use SQL to simply check IF the photo exists (returns 1 or 0) without downloading the heavy string
//       hasPhoto: sql`CASE WHEN ${medicalShops.photoUrl} IS NOT NULL THEN 1 ELSE 0 END`
//     }).from(medicalShops);

//     // 2. Create Hash Maps to group data instantly (O(1) lookup time)
//     const placesByArea = {};
//     const medicalsByPlace = {};

//     // Group all medical shops by their placeId
//     for (const med of allMedicals) {
//       if (!medicalsByPlace[med.placeId]) {
//         medicalsByPlace[med.placeId] = [];
//       }
//       // Convert SQL 1/0 to true/false for the frontend
//       med.hasPhoto = med.hasPhoto === 1;
//       medicalsByPlace[med.placeId].push(med);
//     }

//     // Group all places by their areaId, and instantly attach their medical shops
//     for (const place of allPlaces) {
//       if (!placesByArea[place.areaId]) {
//         placesByArea[place.areaId] = [];
//       }
//       placesByArea[place.areaId].push({
//         id: place.id,
//         name: place.name,
//         medicals: medicalsByPlace[place.id] || [] // Attach the shops instantly
//       });
//     }

//     // 3. Build the final Tree Structure instantly
//     const territories = allAreas.map(area => ({
//       id: area.id,
//       name: area.name,
//       places: placesByArea[area.id] || []
//     }));

//     return NextResponse.json(territories);
//   } catch (error) {
//     console.error("Fetch Error:", error);
//     return NextResponse.json({ error: 'Database fetch failed' }, { status: 500 });
//   }
// }

// // POST: Add new record (With Duplicate Prevention)
// export async function POST(request) {
//   try {
//     const { type, name, parentId, address } = await request.json();
//     const cleanName = toTitleCase(name);
//     let newRecord;

//     if (type === 'area') {
//       const existing = await db.select().from(areas).where(ilike(areas.name, cleanName)).limit(1);
//       if (existing.length > 0) return NextResponse.json({ error: 'Area already exists' }, { status: 400 });
      
//       newRecord = await db.insert(areas).values({ name: cleanName }).returning();
//     } 
//     else if (type === 'place') {
//       const existing = await db.select().from(places).where(and(ilike(places.name, cleanName), eq(places.areaId, parentId))).limit(1);
//       if (existing.length > 0) return NextResponse.json({ error: 'Place already exists in this area' }, { status: 400 });
      
//       newRecord = await db.insert(places).values({ name: cleanName, areaId: parentId }).returning();
//     } 
//     else if (type === 'medical') {
//       newRecord = await db.insert(medicalShops).values({ name: cleanName, address, placeId: parentId }).returning();
//     }

//     return NextResponse.json({ success: true, data: newRecord[0] });
//   } catch (error) {
//     return NextResponse.json({ error: 'Failed to save to database' }, { status: 500 });
//   }
// }

// // PUT: Edit existing record
// export async function PUT(request) {
//   try {
//     const { type, id, name, address, removeGps } = await request.json();
//     const cleanName = toTitleCase(name);
    
//     if (type === 'area') {
//       await db.update(areas).set({ name: cleanName }).where(eq(areas.id, id));
//     } 
//     else if (type === 'place') {
//       await db.update(places).set({ name: cleanName }).where(eq(places.id, id));
//     } 
//     else if (type === 'medical') {
//       if (removeGps) {
//         await db.update(medicalShops)
//           .set({ 
//             name: cleanName, 
//             address: address,
//             latitude: null,
//             longitude: null,
//             photoUrl: null,
//             isVerified: false
//           })
//           .where(eq(medicalShops.id, id));
//       } else {
//         await db.update(medicalShops)
//           .set({ name: cleanName, address: address })
//           .where(eq(medicalShops.id, id));
//       }
//     }

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Update Error:", error);
//     return NextResponse.json({ error: 'Update failed' }, { status: 500 });
//   }
// }

// // 🚨 FORCE DELETE: Safely wipes visits, then shops, then places, then areas
// export async function DELETE(request) {
//   try {
//     const body = await request.json();
//     const { type, id, adminPassword } = body;

//     // 1. Identify the logged-in Admin
//     const cookieStore = await cookies();
//     const adminId = cookieStore.get('employeeId')?.value;

//     if (!adminId || !adminPassword) {
//       return NextResponse.json({ error: "Unauthorized. Admin password required." }, { status: 401 });
//     }

//     // 2. Verify Admin Password
//     const adminResult = await db.select().from(users).where(eq(users.employeeId, adminId));
//     if (adminResult.length === 0) {
//       return NextResponse.json({ error: "Admin account not found." }, { status: 404 });
//     }
    
//     const adminUser = adminResult[0];
//     const inputHash = await hashPassword(adminPassword);
//     if (inputHash !== adminUser.passwordHash) {
//       return NextResponse.json({ error: "Incorrect Admin Password. Deletion blocked." }, { status: 403 });
//     }

//     // ✅ 3. FORCE DELETION LOGIC (The "Nuke" Method)
//     if (type === 'area') {
//       const linkedPlaces = await db.select({ id: places.id }).from(places).where(eq(places.areaId, id));
//       const placeIds = linkedPlaces.map(p => p.id);

//       if (placeIds.length > 0) {
//         // Step A: Find all medical shops in these places
//         const linkedShops = await db.select({ id: medicalShops.id }).from(medicalShops).where(inArray(medicalShops.placeId, placeIds));
//         const shopIds = linkedShops.map(s => s.id);

//         // Step B: Nuke all visits linked to these shops
//         if (shopIds.length > 0) {
//           await db.delete(visits).where(inArray(visits.medicalShopId, shopIds));
//         }

//         // Step C: Delete the shops
//         await db.delete(medicalShops).where(inArray(medicalShops.placeId, placeIds));
//       }
//       // Step D: Delete places and area
//       await db.delete(places).where(eq(places.areaId, id));
//       await db.delete(areas).where(eq(areas.id, id));

//     } else if (type === 'place') {
//       const linkedShops = await db.select({ id: medicalShops.id }).from(medicalShops).where(eq(medicalShops.placeId, id));
//       const shopIds = linkedShops.map(s => s.id);

//       if (shopIds.length > 0) {
//         await db.delete(visits).where(inArray(visits.medicalShopId, shopIds)); // Nuke visits
//       }
      
//       await db.delete(medicalShops).where(eq(medicalShops.placeId, id)); // Nuke shops
//       await db.delete(places).where(eq(places.id, id)); // Nuke place

//     } else if (type === 'medical') {
//       await db.delete(visits).where(eq(visits.medicalShopId, id)); // Nuke visits
//       await db.delete(medicalShops).where(eq(medicalShops.id, id)); // Nuke shop
//     }

//     return NextResponse.json({ success: true, message: `${type} deleted successfully.` });

//   } catch (error) {
//     console.error("Delete Error:", error);

//     // 🚨 FIX: Extract error code from Drizzle's nested cause object
//     const errorCode = error.code || error.cause?.code;
//     const errorMessage = String(error.message || error.cause?.message || '');

//     if (errorCode === '23503' || errorMessage.includes('foreign key constraint')) {
//       return NextResponse.json(
//         { error: "Cannot delete! There is connected data blocking this action." }, 
//         { status: 409 }
//       );
//     }

//     return NextResponse.json({ error: 'Deletion failed due to a database error.' }, { status: 500 });
//   }
// }

// export async function PATCH(request) {
//   try {
//     const body = await request.json();
//     const { type, id, isVerified } = body; 

//     if (type === 'medical' && id !== undefined) {
//       await db.update(medicalShops)
//         .set({ isVerified: !!isVerified })
//         .where(eq(medicalShops.id, id));
        
//       return NextResponse.json({ success: true }, { status: 200 });
//     }
    
//     return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
//   } catch (error) {
//     return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
//   }
// }





import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; 
import { db } from '../../../../db/index';
import { areas, places, medicalShops, users, visits } from '../../../../db/schema';
import { eq, inArray, ilike, and, sql } from 'drizzle-orm';

// 🚨 FIX: Force Next.js to NEVER cache this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Helper to standardize text to Title Case
function toTitleCase(str) {
  return String(str).trim().toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
}

// Helper to hash the password for verification
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// GET: Fetch all territories (Optimized for massive data)
// export async function GET() {
//   try {
//     const allAreas = await db.select({ id: areas.id, name: areas.name }).from(areas);
//     const allPlaces = await db.select({ id: places.id, name: places.name, areaId: places.areaId }).from(places);
    
//     const allMedicals = await db.select({
//       id: medicalShops.id,
//       name: medicalShops.name,
//       address: medicalShops.address,
//       placeId: medicalShops.placeId,
//       isVerified: medicalShops.isVerified,
//       hasPhoto: sql`CASE WHEN ${medicalShops.photoUrl} IS NOT NULL THEN 1 ELSE 0 END`
//     }).from(medicalShops);

//     const placesByArea = {};
//     const medicalsByPlace = {};

//     for (const med of allMedicals) {
//       if (!medicalsByPlace[med.placeId]) {
//         medicalsByPlace[med.placeId] = [];
//       }
//       med.hasPhoto = med.hasPhoto === 1;
//       medicalsByPlace[med.placeId].push(med);
//     }

//     for (const place of allPlaces) {
//       if (!placesByArea[place.areaId]) {
//         placesByArea[place.areaId] = [];
//       }
//       placesByArea[place.areaId].push({
//         id: place.id,
//         name: place.name,
//         medicals: medicalsByPlace[place.id] || []
//       });
//     }

//     const territories = allAreas.map(area => ({
//       id: area.id,
//       name: area.name,
//       places: placesByArea[area.id] || []
//     }));

//     return NextResponse.json(territories);
//   } catch (error) {
//     console.error("Fetch Error:", error);
//     return NextResponse.json({ error: 'Database fetch failed' }, { status: 500 });
//   }
// }

export async function GET() {
  try {
    const allAreas = await db.select({ id: areas.id, name: areas.name }).from(areas);
    const allPlaces = await db.select({ id: places.id, name: places.name, areaId: places.areaId }).from(places);
    
    // ✅ BRILLIANT EGRESS FIX: You only fetch the exact text you need, skipping the heavy photoUrl!
    const allMedicals = await db.select({
      id: medicalShops.id,
      name: medicalShops.name,
      address: medicalShops.address,
      placeId: medicalShops.placeId,
      isVerified: medicalShops.isVerified,
      hasPhoto: sql`CASE WHEN ${medicalShops.photoUrl} IS NOT NULL THEN 1 ELSE 0 END`
    }).from(medicalShops);

    const placesByArea = {};
    const medicalsByPlace = {};

    for (const med of allMedicals) {
      if (!medicalsByPlace[med.placeId]) {
        medicalsByPlace[med.placeId] = [];
      }
      med.hasPhoto = med.hasPhoto === 1;
      medicalsByPlace[med.placeId].push(med);
    }

    for (const place of allPlaces) {
      if (!placesByArea[place.areaId]) {
        placesByArea[place.areaId] = [];
      }
      placesByArea[place.areaId].push({
        id: place.id,
        name: place.name,
        medicals: medicalsByPlace[place.id] || []
      });
    }

    const territories = allAreas.map(area => ({
      id: area.id,
      name: area.name,
      places: placesByArea[area.id] || []
    }));

    // 🚨 EGRESS FIX: Allow the browser to hold onto this data so it doesn't spam Supabase
    return NextResponse.json(territories, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' }
    });
    
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ error: 'Database fetch failed' }, { status: 500 });
  }
}

// POST: Add new record (With Duplicate Prevention)
export async function POST(request) {
  try {
    const { type, name, parentId, address } = await request.json();
    const cleanName = toTitleCase(name);
    let newRecord;

    if (type === 'area') {
      const existing = await db.select().from(areas).where(ilike(areas.name, cleanName)).limit(1);
      if (existing.length > 0) return NextResponse.json({ error: 'Area already exists' }, { status: 400 });
      
      newRecord = await db.insert(areas).values({ name: cleanName }).returning();
    } 
    else if (type === 'place') {
      const existing = await db.select().from(places).where(and(ilike(places.name, cleanName), eq(places.areaId, parentId))).limit(1);
      if (existing.length > 0) return NextResponse.json({ error: 'Place already exists in this area' }, { status: 400 });
      
      newRecord = await db.insert(places).values({ name: cleanName, areaId: parentId }).returning();
    } 
    else if (type === 'medical') {
      newRecord = await db.insert(medicalShops).values({ name: cleanName, address, placeId: parentId }).returning();
    }

    return NextResponse.json({ success: true, data: newRecord[0] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save to database' }, { status: 500 });
  }
}

// PUT: Edit existing record
export async function PUT(request) {
  try {
    // 🚨 FIX 1: Extract parentId from the incoming payload
    const { type, id, name, address, removeGps, parentId } = await request.json();
    const cleanName = toTitleCase(name);
    
    if (type === 'area') {
      await db.update(areas).set({ name: cleanName }).where(eq(areas.id, id));
    } 
    else if (type === 'place') {
      await db.update(places).set({ name: cleanName }).where(eq(places.id, id));
    } 
    else if (type === 'medical') {
      
      // 🚨 FIX 2: Dynamically build the update payload so we can include placeId (parentId)
      const updateData = { 
        name: cleanName, 
        address: address 
      };

      // If a new parentId was provided from the dropdowns, assign the shop to the new Place!
      if (parentId) {
        updateData.placeId = parentId;
      }

      // If the admin checked "Clear GPS & Photo"
      if (removeGps) {
        updateData.latitude = null;
        updateData.longitude = null;
        updateData.photoUrl = null;
        updateData.isVerified = false;
      }

      await db.update(medicalShops)
        .set(updateData)
        .where(eq(medicalShops.id, id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

// FORCE DELETE: Safely wipes visits, then shops, then places, then areas
export async function DELETE(request) {
  try {
    const body = await request.json();
    const { type, id, adminPassword } = body;

    const cookieStore = await cookies();
    const adminId = cookieStore.get('employeeId')?.value;

    if (!adminId || !adminPassword) {
      return NextResponse.json({ error: "Unauthorized. Admin password required." }, { status: 401 });
    }

    const adminResult = await db.select().from(users).where(eq(users.employeeId, adminId));
    if (adminResult.length === 0) {
      return NextResponse.json({ error: "Admin account not found." }, { status: 404 });
    }
    
    const adminUser = adminResult[0];
    const inputHash = await hashPassword(adminPassword);
    if (inputHash !== adminUser.passwordHash) {
      return NextResponse.json({ error: "Incorrect Admin Password. Deletion blocked." }, { status: 403 });
    }

    if (type === 'area') {
      const linkedPlaces = await db.select({ id: places.id }).from(places).where(eq(places.areaId, id));
      const placeIds = linkedPlaces.map(p => p.id);

      if (placeIds.length > 0) {
        const linkedShops = await db.select({ id: medicalShops.id }).from(medicalShops).where(inArray(medicalShops.placeId, placeIds));
        const shopIds = linkedShops.map(s => s.id);

        if (shopIds.length > 0) {
          await db.delete(visits).where(inArray(visits.medicalShopId, shopIds));
        }
        await db.delete(medicalShops).where(inArray(medicalShops.placeId, placeIds));
      }
      await db.delete(places).where(eq(places.areaId, id));
      await db.delete(areas).where(eq(areas.id, id));

    } else if (type === 'place') {
      const linkedShops = await db.select({ id: medicalShops.id }).from(medicalShops).where(eq(medicalShops.placeId, id));
      const shopIds = linkedShops.map(s => s.id);

      if (shopIds.length > 0) {
        await db.delete(visits).where(inArray(visits.medicalShopId, shopIds));
      }
      
      await db.delete(medicalShops).where(eq(medicalShops.placeId, id));
      await db.delete(places).where(eq(places.id, id));

    } else if (type === 'medical') {
      await db.delete(visits).where(eq(visits.medicalShopId, id));
      await db.delete(medicalShops).where(eq(medicalShops.id, id));
    }

    return NextResponse.json({ success: true, message: `${type} deleted successfully.` });

  } catch (error) {
    console.error("Delete Error:", error);

    const errorCode = error.code || error.cause?.code;
    const errorMessage = String(error.message || error.cause?.message || '');

    if (errorCode === '23503' || errorMessage.includes('foreign key constraint')) {
      return NextResponse.json(
        { error: "Cannot delete! There is connected data blocking this action." }, 
        { status: 409 }
      );
    }

    return NextResponse.json({ error: 'Deletion failed due to a database error.' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { type, id, isVerified } = body; 

    if (type === 'medical' && id !== undefined) {
      await db.update(medicalShops)
        .set({ isVerified: !!isVerified })
        .where(eq(medicalShops.id, id));
        
      return NextResponse.json({ success: true }, { status: 200 });
    }
    
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
  }
}