
// export const dynamic = 'force-dynamic';
// export const revalidate = 0;

// import { NextResponse } from 'next/server';
// import { db } from '../../../../db';
// import { users, visits, medicalShops } from '../../../../db/schema';
// // 🚨 CRITICAL FIX: We changed 'desc' to 'asc' to fix the reverse-order bug!
// import { eq, and, asc, sql } from 'drizzle-orm';

// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const agentId = searchParams.get('agentId');
//     const dateParam = searchParams.get('date');

//     if (!agentId) {
//       const agents = await db.select({
//         id: users.id,
//         employeeId: users.employeeId,
//         name: users.name
//       }).from(users).where(eq(users.role, 'AGENT'));
      
//       return NextResponse.json({ agents });
//     }

//     if (!dateParam) {
//       return NextResponse.json({ visits: [] });
//     }

//     const agentVisits = await db.select({
//       visitId: visits.id,
//       shopName: medicalShops.name,
//       address: medicalShops.address,
      
//       // Plotting where the AGENT was
//       latitude: visits.latitude,
//       longitude: visits.longitude,
      
//       orderAmount: visits.orderAmount,
//       collectionAmount: visits.collectionAmount,
//       paymentMethod: visits.paymentMethod,
//       time: visits.createdAt
//     })
//     .from(visits)
//     .innerJoin(medicalShops, eq(visits.medicalShopId, medicalShops.id))
//     .where(
//       and(
//         eq(visits.agentId, agentId),
//         // 🚨 STRICT FILTER: Only grab visits from THIS exact date!
//         sql`(DATE(${visits.createdAt} AT TIME ZONE 'Asia/Kolkata') = ${dateParam}::date OR DATE(${visits.createdAt}) = ${dateParam}::date)`
//       )
//     )
//     // 🚨 FIX: Order by ASCENDING so 1st visit is 1st pin, 2nd is 2nd, etc.
//     .orderBy(asc(visits.createdAt));

//     return NextResponse.json({ visits: agentVisits });

//   } catch (error) {
//     console.error("Map API Error:", error);
//     return NextResponse.json({ error: 'Failed to fetch map data' }, { status: 500 });
//   }
// }


export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "../../../../db";
import { users, visits, medicalShops } from "../../../../db/schema";
import { eq, and, asc, sql } from "drizzle-orm";

const MAX_MAP_VISITS = 3000;
const MAX_SINGLE_MAP_VISITS = 500;
const MAX_RANGE_DAYS = 31;

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function jsonError(message, status) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store, private",
      },
    }
  );
}

function sanitizeCoordinate(value, min, max) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) && number >= min && number <= max
    ? number
    : null;
}

function sanitizeVisit(visit) {
  return {
    ...visit,
    latitude: sanitizeCoordinate(visit.latitude, -90, 90),
    longitude: sanitizeCoordinate(visit.longitude, -180, 180),
    orderAmount: Number(visit.orderAmount || 0),
    collectionAmount: Number(visit.collectionAmount || 0),
  };
}

function validateDateRange(fromDate, toDate) {
  if (!isValidDate(fromDate) || !isValidDate(toDate)) {
    return {
      error:
        "Provide valid fromDate and toDate in YYYY-MM-DD format",
    };
  }

  if (fromDate > toDate) {
    return {
      error: "Start date must not be after end date",
    };
  }

  const startMs = Date.parse(`${fromDate}T00:00:00.000Z`);
  const endMs = Date.parse(`${toDate}T00:00:00.000Z`);

  const rangeDays =
    Math.floor((endMs - startMs) / 86400000) + 1;

  if (rangeDays > MAX_RANGE_DAYS) {
    return {
      error: `Date range cannot exceed ${MAX_RANGE_DAYS} days`,
    };
  }

  return {};
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const agentId = (searchParams.get("agentId") || "").trim();
    const dateParam = searchParams.get("date");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    // MODE 1:
    // One employee + date range OR all employees + date range.
    //
    // One employee:
    // ?agentId=EMP001&fromDate=2026-10-01&toDate=2026-10-07
    //
    // All employees:
    // ?fromDate=2026-10-01&toDate=2026-10-07

    if (fromDate !== null || toDate !== null) {
      const validation = validateDateRange(fromDate, toDate);

      if (validation.error) {
        return jsonError(validation.error, 400);
      }

      const dateCondition = sql`(
        DATE(${visits.createdAt} AT TIME ZONE 'Asia/Kolkata')
          BETWEEN ${fromDate}::date AND ${toDate}::date
        OR
        DATE(${visits.createdAt})
          BETWEEN ${fromDate}::date AND ${toDate}::date
      )`;

      const conditions = [dateCondition];

      // This condition ensures the employee-range request
      // returns only the selected employee's visits.
      if (agentId) {
        conditions.push(eq(visits.agentId, agentId));
      }

      const rangeVisits = await db
        .select({
          visitId: visits.id,
          agentId: visits.agentId,
          agentName: users.name,

          shopName: medicalShops.name,
          address: medicalShops.address,

          latitude: visits.latitude,
          longitude: visits.longitude,

          orderAmount: visits.orderAmount,
          collectionAmount: visits.collectionAmount,
          paymentMethod: visits.paymentMethod,
          time: visits.createdAt,
        })
        .from(visits)
        .leftJoin(
          users,
          eq(visits.agentId, users.employeeId)
        )
        .innerJoin(
          medicalShops,
          eq(visits.medicalShopId, medicalShops.id)
        )
        .where(and(...conditions))
        .orderBy(asc(visits.createdAt))
        .limit(MAX_MAP_VISITS + 1);

      const truncated = rangeVisits.length > MAX_MAP_VISITS;

      const safeVisits = rangeVisits
        .slice(0, MAX_MAP_VISITS)
        .map((visit) => ({
          ...sanitizeVisit(visit),
          agentName: visit.agentName || "Unknown Agent",
        }));

      return NextResponse.json(
        {
          mode: agentId ? "employee-range" : "range",
          ...(agentId ? { agentId } : {}),
          fromDate,
          toDate,
          totalVisitsReturned: safeVisits.length,
          truncated,
          visits: safeVisits,
        },
        {
          headers: {
            "Cache-Control": "no-store, private",
          },
        }
      );
    }

    // MODE 2:
    // Employee dropdown.
    //
    // /api/admin/employee-map

    if (!agentId && dateParam === null) {
      const agents = await db
        .select({
          id: users.id,
          employeeId: users.employeeId,
          name: users.name,
        })
        .from(users)
        .where(eq(users.role, "AGENT"))
        .orderBy(asc(users.name));

      return NextResponse.json(
        { agents },
        {
          headers: {
            "Cache-Control": "no-store, private",
          },
        }
      );
    }

    // MODE 3:
    // Existing single employee + single date request.
    //
    // ?agentId=EMP001&date=2026-10-12

    if (!agentId) {
      return jsonError("Provide an agentId", 400);
    }

    if (!dateParam || !isValidDate(dateParam)) {
      return jsonError(
        "Provide a valid date in YYYY-MM-DD format",
        400
      );
    }

    const agentVisits = await db
      .select({
        visitId: visits.id,
        agentId: visits.agentId,

        shopName: medicalShops.name,
        address: medicalShops.address,

        latitude: visits.latitude,
        longitude: visits.longitude,

        orderAmount: visits.orderAmount,
        collectionAmount: visits.collectionAmount,
        paymentMethod: visits.paymentMethod,
        time: visits.createdAt,
      })
      .from(visits)
      .innerJoin(
        medicalShops,
        eq(visits.medicalShopId, medicalShops.id)
      )
      .where(
        and(
          eq(visits.agentId, agentId),
          sql`(
            DATE(${visits.createdAt} AT TIME ZONE 'Asia/Kolkata')
              = ${dateParam}::date
            OR
            DATE(${visits.createdAt}) = ${dateParam}::date
          )`
        )
      )
      .orderBy(asc(visits.createdAt))
      .limit(MAX_SINGLE_MAP_VISITS + 1);

    const truncated =
      agentVisits.length > MAX_SINGLE_MAP_VISITS;

    const safeAgentVisits = agentVisits
      .slice(0, MAX_SINGLE_MAP_VISITS)
      .map(sanitizeVisit);

    return NextResponse.json(
      {
        mode: "single",
        visits: safeAgentVisits,
        totalVisitsReturned: safeAgentVisits.length,
        truncated,
      },
      {
        headers: {
          "Cache-Control": "no-store, private",
        },
      }
    );
  } catch (error) {
    console.error(
      "Employee Map API Error:",
      error?.message
    );

    return jsonError("Failed to fetch map data", 500);
  }
}