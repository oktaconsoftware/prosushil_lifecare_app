
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { and, asc, eq, gt, sql } from "drizzle-orm";

import { db } from "../../../../db";
import {
  users,
  visits,
  medicalShops,
  places,
  areas,
} from "../../../../db/schema";

const MAX_DETAIL_ROWS = 5000;
const MAX_RANGE_DAYS = 366;

function jsonError(message, status) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

function asNumber(value) {
  const result = Number(value ?? 0);
  return Number.isFinite(result) ? result : 0;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    // --------------------------------------------------
    // 1. LOAD SALESMAN LIST
    // GET /api/admin/collection-statements?action=agents
    // --------------------------------------------------
    if (action === "agents") {
      const result = await db
        .select({
          id: users.id,
          employeeId: users.employeeId,
          name: users.name,
          isActive: users.isActive,
        })
        .from(users)
        .where(eq(users.role, "AGENT"))
        .orderBy(asc(users.name));

      const agents = result
        .filter(
          (agent) =>
            agent.employeeId &&
            agent.isActive !== false
        )
        .map((agent) => ({
          id: agent.id,
          employeeId: agent.employeeId,
          name: agent.name,
        }));

      return NextResponse.json(
        { agents },
        {
          headers: { "Cache-Control": "no-store, private" },
        }
      );
    }

    // --------------------------------------------------
    // 2. VALIDATE SELECTED SALESMAN AND DATE RANGE
    // --------------------------------------------------
    const agentId = searchParams.get("agentId");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    if (!agentId || agentId.length > 255) {
      return jsonError("Please select a salesman", 400);
    }

    if (!isValidDate(fromDate) || !isValidDate(toDate)) {
      return jsonError(
        "Please provide valid fromDate and toDate in YYYY-MM-DD format",
        400
      );
    }

    if (fromDate > toDate) {
      return jsonError(
        "Start date cannot be after end date",
        400
      );
    }

    const startMs = Date.parse(`${fromDate}T00:00:00.000Z`);
    const endMs = Date.parse(`${toDate}T00:00:00.000Z`);

    const totalDays =
      Math.floor((endMs - startMs) / 86400000) + 1;

    if (totalDays > MAX_RANGE_DAYS) {
      return jsonError(
        `Please select a date range of ${MAX_RANGE_DAYS} days or less`,
        400
      );
    }

    // Verify that the selected employee exists and is active.
    const selectedAgents = await db
      .select({
        employeeId: users.employeeId,
        name: users.name,
        role: users.role,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.employeeId, agentId))
      .limit(1);

    const selectedAgent = selectedAgents[0];

    if (
      !selectedAgent ||
      selectedAgent.isActive === false ||
      selectedAgent.role !== "AGENT"
    ) {
      return jsonError("Salesman not found or inactive", 404);
    }

    // --------------------------------------------------
    // 3. CASH COLLECTION FILTER
    //
    // Only payment_method = Cash (case-insensitive)
    // and collection_amount > 0 are included.
    //
    // The date comparison follows the current employee-map
    // API's existing date matching approach.
    // --------------------------------------------------
    const cashFilters = and(
      eq(visits.agentId, agentId),

      sql`
        lower(trim(coalesce(${visits.paymentMethod}, ''))) = 'cash'
      `,

      gt(visits.collectionAmount, "0"),

      sql`
        (
          DATE(${visits.createdAt} AT TIME ZONE 'Asia/Kolkata')
            BETWEEN ${fromDate}::date AND ${toDate}::date
          OR
          DATE(${visits.createdAt})
            BETWEEN ${fromDate}::date AND ${toDate}::date
        )
      `
    );

    // --------------------------------------------------
    // 4. LOAD VISIT STATEMENTS
    // A visit is one statement row.
    // --------------------------------------------------
    const result = await db
      .select({
        visitId: visits.id,
        agentId: visits.agentId,
        agentName: users.name,

        shopId: medicalShops.id,
        shopName: medicalShops.name,
        address: medicalShops.address,

        placeName: places.name,
        areaName: areas.name,

        orderAmount: visits.orderAmount,
        collectionAmount: visits.collectionAmount,
        paymentMethod: visits.paymentMethod,

        status: visits.status,
        remark: visits.remark,
        visitTime: visits.createdAt,
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
      .leftJoin(
        places,
        eq(medicalShops.placeId, places.id)
      )
      .leftJoin(
        areas,
        eq(places.areaId, areas.id)
      )
      .where(cashFilters)
      .orderBy(asc(visits.createdAt))
      .limit(MAX_DETAIL_ROWS + 1);

    const truncated = result.length > MAX_DETAIL_ROWS;
    const visibleRows = result.slice(0, MAX_DETAIL_ROWS);

    const statements = visibleRows.map((row) => ({
      visitId: row.visitId,
      agentId: row.agentId,
      agentName: row.agentName || "Unknown Agent",

      shopId: row.shopId,
      shopName: row.shopName || "Unknown Shop",
      address: row.address || "",

      placeName: row.placeName || "Unassigned Place",
      areaName: row.areaName || "Unassigned Area",

      orderAmount: asNumber(row.orderAmount),
      collectionAmount: asNumber(row.collectionAmount),
      paymentMethod: "Cash",

      status: row.status || "Pending Review",
      remark: row.remark || "",
      visitTime: row.visitTime,
    }));

    // --------------------------------------------------
    // 5. CALCULATE FULL-RANGE TOTALS IN THE DATABASE
    // Totals remain accurate even when detail rows are capped.
    // --------------------------------------------------
    const [totals] = await db
      .select({
        cashVisitCount: sql`count(*)::int`,
        totalCashCollection: sql`
          coalesce(sum(${visits.collectionAmount}), 0)::text
        `,
        totalOrderAmount: sql`
          coalesce(sum(${visits.orderAmount}), 0)::text
        `,
      })
      .from(visits)
      .where(cashFilters);

    return NextResponse.json(
      {
        agent: {
          employeeId: selectedAgent.employeeId,
          name: selectedAgent.name,
        },

        fromDate,
        toDate,

        summary: {
          cashVisitCount: asNumber(totals?.cashVisitCount),
          totalCashCollection: asNumber(
            totals?.totalCashCollection
          ),
          totalOrderAmount: asNumber(
            totals?.totalOrderAmount
          ),
        },

        truncated,
        detailsReturned: statements.length,
        statements,
      },
      {
        headers: {
          "Cache-Control": "no-store, private",
        },
      }
    );
  } catch (error) {
    console.error(
      "Collection Statements API Error:",
      error?.message || "Unknown error"
    );

    return jsonError(
      "Unable to load collection statements",
      500
    );
  }
}
