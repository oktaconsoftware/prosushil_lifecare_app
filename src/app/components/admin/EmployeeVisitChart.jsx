"use client";

import { useState } from "react";

function getCurrentMonth() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
}

function getCalendarDays(month, daysInMonth) {
  const [year, monthNumber] = month.split("-").map(Number);

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const date = `${month}-${String(day).padStart(2, "0")}`;
    const weekdayIndex = new Date(
      year,
      monthNumber - 1,
      day
    ).getDay();

    return {
      date,
      day,
      weekday: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
        weekdayIndex
      ],
      isSunday: weekdayIndex === 0,
    };
  });
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-IN");
}

function getCellClass(count, isSunday) {
  if (isSunday) {
    return "border-red-300 bg-red-200 text-red-900";
  }

  if (count === 0) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-emerald-200 bg-emerald-100 text-emerald-800";
}

function getMonthLabel(month) {
  if (!month) return "";

  const [year, monthNumber] = month.split("-").map(Number);

  return new Date(year, monthNumber - 1, 1).toLocaleDateString(
    "en-IN",
    {
      month: "long",
      year: "numeric",
    }
  );
}

export default function EmployeeVisitChart() {
  const [month, setMonth] = useState(getCurrentMonth);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleShowChart(event) {
    event.preventDefault();

    if (!month) {
      setError("Please select a month.");
      return;
    }

    setLoading(true);
    setError("");
    setReport(null);

    try {
      const response = await fetch(
        `/api/admin/mr-monthly-report/attendance?month=${encodeURIComponent(
          month
        )}`,
        {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load employee visit counts."
        );
      }

      if (!Array.isArray(data.employees)) {
        throw new Error("Invalid attendance API response.");
      }

      setReport(data);
    } catch (err) {
      setError(
        err.message || "Unable to load the attendance chart."
      );
    } finally {
      setLoading(false);
    }
  }

  const employees = report?.employees || [];
  const dailyTotals = report?.dailyTotals || {};

  const calendarDays = report
    ? getCalendarDays(report.month, report.daysInMonth)
    : [];

  return (
    <section className="mx-auto w-full max-w-[1800px] space-y-5 px-3 py-5 sm:px-5 sm:py-6 lg:px-8">
      {/* Heading */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
          Workforce Analytics
        </p>

        <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Employee Attendance &amp; Visit Chart
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
          Monitor daily visit activity for all active employees.
          Zero-visit working days and Sundays are highlighted in red.
        </p>
      </div>

      {/* Month filter */}
      <form
        onSubmit={handleShowChart}
        className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:p-5"
      >
        <div className="w-full sm:max-w-xs">
          <label
            htmlFor="employee-attendance-month"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Select Month
          </label>

          <input
            id="employee-attendance-month"
            type="month"
            required
            value={month}
            onChange={(event) => {
              setMonth(event.target.value);
              setReport(null);
              setError("");
            }}
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <button
          type="submit"
          disabled={!month || loading}
          className="min-h-12 w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto"
        >
          {loading ? "Loading Chart..." : "Show Chart"}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div
          role="status"
          className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500"
        >
          Loading aggregated employee visit counts...
        </div>
      )}

      {/* Chart */}
      {report && !loading && (
        <div className="space-y-5">
          {/* Summary */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">
                Active Employees
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {formatNumber(report.summary?.totalEmployees)}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">
                Total Recorded Visits
              </p>

              <p className="mt-2 text-3xl font-bold text-emerald-700">
                {formatNumber(report.summary?.totalVisits)}
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl border border-gray-200 bg-white p-4">
            <span className="text-sm font-semibold text-gray-700">
              Legend
            </span>

            <span className="flex items-center gap-2 text-sm text-gray-600">
              <span className="h-5 w-5 rounded border border-emerald-200 bg-emerald-100" />
              Visits recorded
            </span>

            <span className="flex items-center gap-2 text-sm text-gray-600">
              <span className="h-5 w-5 rounded border border-rose-200 bg-rose-50" />
              Zero visits, Monday–Saturday
            </span>

            <span className="flex items-center gap-2 text-sm text-gray-600">
              <span className="h-5 w-5 rounded border border-red-300 bg-red-200" />
              Sunday
            </span>
          </div>

          {/* Attendance grid */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-4 sm:p-5">
              <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
                {getMonthLabel(report.month)} — Employee-wise Visits
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Each cell shows that employee&apos;s recorded visits on
                the corresponding date. Scroll horizontally to view
                the whole month.
              </p>
            </div>

            {employees.length === 0 ? (
              <div className="p-10 text-center text-sm text-gray-500">
                No active employees with employee IDs were found.
              </div>
            ) : (
              <div className="max-h-[70vh] overflow-auto">
                <table className="w-full min-w-max border-separate border-spacing-0 text-center text-xs">
                  <thead>
                    <tr>
                      <th className="sticky left-0 top-0 z-30 min-w-[200px] border-b border-r border-gray-200 bg-gray-100 px-4 py-3 text-left font-bold text-gray-700">
                        Employee
                      </th>

                      {calendarDays.map((day) => (
                        <th
                          key={day.date}
                          title={day.date}
                          className={`sticky top-0 z-20 min-w-[48px] border-b border-r px-1 py-2 ${
                            day.isSunday
                              ? "border-red-300 bg-red-200 text-red-900"
                              : "border-gray-200 bg-gray-100 text-gray-700"
                          }`}
                        >
                          <div className="text-sm font-bold">
                            {day.day}
                          </div>

                          <div className="mt-1 text-[10px] font-semibold uppercase">
                            {day.weekday}
                          </div>
                        </th>
                      ))}

                      <th className="sticky top-0 z-20 min-w-[105px] border-b border-gray-200 bg-blue-100 px-3 py-3 font-bold text-blue-900">
                        Monthly Total
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {employees.map((employee) => (
                      <tr
                        key={employee.id || employee.employeeId}
                      >
                        <td className="sticky left-0 z-10 border-b border-r border-gray-200 bg-white px-4 py-3 text-left">
                          <p className="font-semibold text-gray-900">
                            {employee.name}
                          </p>

                          <p className="mt-1 text-[11px] text-gray-500">
                            ID: {employee.employeeId}
                          </p>
                        </td>

                        {calendarDays.map((day) => {
                          const count = Number(
                            employee.dailyCounts?.[day.date] || 0
                          );

                          return (
                            <td
                              key={day.date}
                              title={`${employee.name} | ${day.date} | ${count} visit(s)`}
                              className="border-b border-r border-gray-100 p-1"
                            >
                              <div
                                className={`flex h-9 min-w-[38px] items-center justify-center rounded-md border text-sm font-bold ${getCellClass(
                                  count,
                                  day.isSunday
                                )}`}
                              >
                                {count}
                              </div>
                            </td>
                          );
                        })}

                        <td className="border-b border-gray-200 bg-blue-50 p-2">
                          <span className="inline-flex min-w-12 justify-center rounded-lg bg-blue-100 px-3 py-2 text-sm font-bold text-blue-900">
                            {formatNumber(employee.totalVisits)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  <tfoot>
                    <tr>
                      <td className="sticky bottom-0 left-0 z-20 border-r border-t-2 border-gray-300 bg-gray-100 p-3 text-left font-bold text-gray-900">
                        All Employees Total
                      </td>

                      {calendarDays.map((day) => {
                        const count = Number(
                          dailyTotals[day.date] || 0
                        );

                        return (
                          <td
                            key={day.date}
                            className="sticky bottom-0 border-t-2 border-gray-300 bg-gray-100 p-1"
                          >
                            <div
                              className={`flex h-9 min-w-[38px] items-center justify-center rounded-md border text-sm font-bold ${getCellClass(
                                count,
                                day.isSunday
                              )}`}
                            >
                              {count}
                            </div>
                          </td>
                        );
                      })}

                      <td className="sticky bottom-0 border-t-2 border-gray-300 bg-blue-100 p-3 font-bold text-blue-900">
                        {formatNumber(report.summary?.totalVisits)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          <p className="text-xs leading-5 text-gray-500">
            Counts represent saved visit records, not confirmed working
            hours or attendance punches. Sundays remain red even when
            visits are recorded.
          </p>
        </div>
      )}

      {/* Initial state */}
      {!report && !loading && !error && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-5 py-12 text-center">
          <h3 className="text-base font-semibold text-gray-800">
            Select a month to view attendance
          </h3>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500">
            Click Show Chart to load daily visit counts for all active
            employees. The chart does not fetch data automatically.
          </p>
        </div>
      )}
    </section>
  );
}