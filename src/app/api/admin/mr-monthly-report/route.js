
import {
  and,
  asc,
  eq,
  gte,
  lt,
  sql,
} from "drizzle-orm";

import { db } from "../../../../db";
import {
  users,
  visits,
  medicalShops,
  places,
  areas,
} from "../../../../db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_ROLES = new Set([
  "admin",
  "administrator",
  "super_admin",
  "superadmin",
]);

function jsonError(message, status) {
  return Response.json(
    { error: message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

function asNumber(value) {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function isAdminRole(role) {
  return ADMIN_ROLES.has(
    String(role || "").trim().toLowerCase()
  );
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    // --------------------------------------------------
    // ACTION 1: GET SALESMAN / AGENT LIST
    // URL: /api/admin/mr-monthly-report?action=agents
    // --------------------------------------------------
    if (action === "agents") {
      const result = await db
        .select({
          employeeId: users.employeeId,
          name: users.name,
          role: users.role,
          isActive: users.isActive,
        })
        .from(users)
        .orderBy(asc(users.name));

      const agents = result
        .filter(
          (user) =>
            user.isActive !== false &&
            user.employeeId &&
            !isAdminRole(user.role)
        )
        .map((user) => ({
          employeeId: user.employeeId,
          name: user.name,
          role: user.role,
        }));

      return Response.json(
        { agents },
        {
          headers: { "Cache-Control": "no-store, private" },
        }
      );
    }

    // --------------------------------------------------
    // ACTION 2: GET SELECTED AGENT'S MONTHLY REPORT
    // URL: /api/admin/mr-monthly-report
    //      ?agentId=EMP001&month=2026-10
    // --------------------------------------------------
    const agentId = url.searchParams.get("agentId");
    const month = url.searchParams.get("month");

    if (!agentId || agentId.length > 255) {
      return jsonError("Select a valid salesman", 400);
    }

    if (!month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      return jsonError(
        "Select a valid month in YYYY-MM format",
        400
      );
    }

    const [year, monthNumber] = month.split("-").map(Number);

    if (year < 2000 || year > 2100) {
      return jsonError("Invalid report year", 400);
    }

    // Confirm the selected employee exists and is active.
    const matchingAgents = await db
      .select({
        employeeId: users.employeeId,
        name: users.name,
        role: users.role,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.employeeId, agentId))
      .limit(1);

    const selectedAgent = matchingAgents[0];

    if (
      !selectedAgent ||
      selectedAgent.isActive === false ||
      isAdminRole(selectedAgent.role)
    ) {
      return jsonError("Salesman not found", 404);
    }

    const startDate = new Date(
      Date.UTC(year, monthNumber - 1, 1)
    );

    const nextMonth = new Date(
      Date.UTC(year, monthNumber, 1)
    );

    const daysInMonth = new Date(
      Date.UTC(year, monthNumber, 0)
    ).getUTCDate();

    const dayExpression = sql`
      to_char(${visits.createdAt}, 'YYYY-MM-DD')
    `;

    // A deal means a visit with order_amount > 0.
    // visits.agent_id is assumed to store users.employee_id.
    const result = await db
      .select({
        date: dayExpression,

        agentId: visits.agentId,
        agentName: users.name,

        areaId: areas.id,
        areaName: areas.name,

        placeId: places.id,
        placeName: places.name,

        visitCount: sql`count(*)::int`,

        dealCount: sql`
          count(*) FILTER (
            WHERE coalesce(${visits.orderAmount}, 0) > 0
          )::int
        `,

        orderTotal: sql`
          coalesce(sum(${visits.orderAmount}), 0)::text
        `,

        collectionTotal: sql`
          coalesce(sum(${visits.collectionAmount}), 0)::text
        `,
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
      .where(
        and(
          eq(visits.agentId, agentId),
          gte(visits.createdAt, startDate),
          lt(visits.createdAt, nextMonth)
        )
      )
      .groupBy(
        dayExpression,
        visits.agentId,
        users.name,
        areas.id,
        areas.name,
        places.id,
        places.name
      )
      .orderBy(
        asc(dayExpression),
        asc(areas.name),
        asc(places.name)
      );

    // Group database results by calendar date.
    const rowsByDate = new Map();

    for (const row of result) {
      if (!rowsByDate.has(row.date)) {
        rowsByDate.set(row.date, []);
      }

      rowsByDate.get(row.date).push({
        agentId: row.agentId,
        agentName: row.agentName || selectedAgent.name,

        areaId: row.areaId,
        areaName: row.areaName || "Unassigned area",

        placeId: row.placeId,
        placeName: row.placeName || "Unassigned place",

        visitCount: asNumber(row.visitCount),
        dealCount: asNumber(row.dealCount),
        orderTotal: asNumber(row.orderTotal),
        collectionTotal: asNumber(row.collectionTotal),
      });
    }

    // Return every day, even if the agent made zero visits.
    const days = Array.from(
      { length: daysInMonth },
      (_, index) => {
        const date = [
          String(year).padStart(4, "0"),
          String(monthNumber).padStart(2, "0"),
          String(index + 1).padStart(2, "0"),
        ].join("-");

        const rows = rowsByDate.get(date) || [];

        return {
          date,
          visitCount: rows.reduce(
            (sum, row) => sum + row.visitCount,
            0
          ),
          dealCount: rows.reduce(
            (sum, row) => sum + row.dealCount,
            0
          ),
          orderTotal: rows.reduce(
            (sum, row) => sum + row.orderTotal,
            0
          ),
          collectionTotal: rows.reduce(
            (sum, row) => sum + row.collectionTotal,
            0
          ),
          rows,
        };
      }
    );

    const summary = {
      totalVisits: days.reduce(
        (sum, day) => sum + day.visitCount,
        0
      ),
      totalDeals: days.reduce(
        (sum, day) => sum + day.dealCount,
        0
      ),
      totalOrderAmount: days.reduce(
        (sum, day) => sum + day.orderTotal,
        0
      ),
      totalCollectionAmount: days.reduce(
        (sum, day) => sum + day.collectionTotal,
        0
      ),
    };

    return Response.json(
      {
        month,
        agent: {
          employeeId: selectedAgent.employeeId,
          name: selectedAgent.name,
          role: selectedAgent.role,
        },
        summary,
        days,
      },
      {
        headers: { "Cache-Control": "no-store, private" },
      }
    );
  } catch {
    return jsonError(
      "Unable to generate the monthly report",
      500
    );
  }
}
