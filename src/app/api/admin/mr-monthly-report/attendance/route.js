import {
  and,
  asc,
  eq,
  gte,
  lt,
  sql,
} from "drizzle-orm";

import { db } from "../../../../../db";
import {
  users,
  visits,
} from "../../../../../db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function jsonError(message, status) {
  return Response.json(
    { error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store, private",
      },
    }
  );
}

function asNumber(value) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const month = String(
      url.searchParams.get("month") || ""
    ).trim();

    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      return jsonError(
        "Select a valid month in YYYY-MM format.",
        400
      );
    }

    const [year, monthNumber] = month
      .split("-")
      .map(Number);

    if (year < 2000 || year > 2100) {
      return jsonError("Invalid report year.", 400);
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

    // Get all active sales agents, including agents
    // who recorded zero visits during the month.
    const agentRows = await db
      .select({
        id: users.id,
        employeeId: users.employeeId,
        name: users.name,
        role: users.role,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.role, "AGENT"))
      .orderBy(asc(users.name));

    const employees = agentRows
      .filter(
        (user) =>
          user.isActive !== false &&
          Boolean(String(user.employeeId || "").trim())
      )
      .map((user) => ({
        id: user.id,
        employeeId: String(user.employeeId).trim(),
        name: user.name || "Unnamed employee",
      }));

    // Only read aggregated daily counts, not every visit record.
    const dayExpression = sql`
      to_char(${visits.createdAt}, 'YYYY-MM-DD')
    `;

    const visitRows = await db
      .select({
        agentId: visits.agentId,
        date: dayExpression,
        visitCount: sql`count(*)::int`,
      })
      .from(visits)
      .where(
        and(
          gte(visits.createdAt, startDate),
          lt(visits.createdAt, nextMonth)
        )
      )
      .groupBy(
        visits.agentId,
        dayExpression
      )
      .orderBy(
        asc(dayExpression),
        asc(visits.agentId)
      );

    // Group counts by employee ID and calendar date.
    const dailyCountsByEmployee = new Map();

    for (const row of visitRows) {
      const employeeId = String(row.agentId || "").trim();
      const date = String(row.date || "");

      if (!employeeId || !date) continue;

      if (!dailyCountsByEmployee.has(employeeId)) {
        dailyCountsByEmployee.set(employeeId, {});
      }

      const counts = dailyCountsByEmployee.get(employeeId);

      counts[date] =
        (counts[date] || 0) + asNumber(row.visitCount);
    }

    const reportEmployees = employees.map((employee) => {
      const dailyCounts =
        dailyCountsByEmployee.get(employee.employeeId) || {};

      const totalVisits = Object.values(dailyCounts).reduce(
        (sum, count) => sum + asNumber(count),
        0
      );

      return {
        ...employee,
        dailyCounts,
        totalVisits,
      };
    });

    // Daily totals across all employees.
    const dailyTotals = {};

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date =
        `${month}-${String(day).padStart(2, "0")}`;

      dailyTotals[date] = reportEmployees.reduce(
        (sum, employee) =>
          sum + asNumber(employee.dailyCounts[date]),
        0
      );
    }

    return Response.json(
      {
        month,
        daysInMonth,
        employees: reportEmployees,
        dailyTotals,
        summary: {
          totalEmployees: reportEmployees.length,
          totalVisits: reportEmployees.reduce(
            (sum, employee) =>
              sum + employee.totalVisits,
            0
          ),
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, private",
        },
      }
    );
  } catch (error) {
    console.error(
      "[MR Attendance Chart API] Failed:",
      error
    );

    return jsonError(
      "Unable to load the employee visit chart.",
      500
    );
  }
}