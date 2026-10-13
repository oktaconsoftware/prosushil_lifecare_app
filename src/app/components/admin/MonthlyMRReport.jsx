
"use client";

import { useEffect, useState } from "react";

function formatDate(value) {
  if (!value) return "—";

  const parts = String(value).split("-").map(Number);

  if (
    parts.length !== 3 ||
    parts.some((part) => !Number.isFinite(part))
  ) {
    return String(value);
  }

  return new Date(
    parts[0],
    parts[1] - 1,
    parts[2]
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function SummaryCard({ title, value, subtitle }) {
  return (
    <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-2 break-words text-2xl font-bold text-gray-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-500">
        {subtitle}
      </p>
    </div>
  );
}

async function readJson(response) {
  return response.json().catch(() => ({}));
}

export default function MonthlyMRReport() {
  const [agents, setAgents] = useState([]);
  const [agentId, setAgentId] = useState("");
  const [month, setMonth] = useState("");
  const [showAllDays, setShowAllDays] = useState(false);
  const [report, setReport] = useState(null);

  const [loadingAgents, setLoadingAgents] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);

  const [agentsError, setAgentsError] = useState("");
  const [error, setError] = useState("");

  // Load the salesman list once when this component mounts.
  useEffect(() => {
    const controller = new AbortController();

    async function loadAgents() {
      setLoadingAgents(true);
      setAgentsError("");

      try {
        const response = await fetch(
          "/api/admin/employee-map",
          {
            method: "GET",
            credentials: "same-origin",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const data = await readJson(response);

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load salesmen."
          );
        }

        setAgents(
          Array.isArray(data.agents) ? data.agents : []
        );
      } catch (err) {
        if (err.name !== "AbortError") {
          setAgentsError(
            err.message || "Unable to load salesmen."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingAgents(false);
        }
      }
    }

    loadAgents();

    return () => controller.abort();
  }, []);

  function handleAgentChange(event) {
    setAgentId(event.target.value);
    setReport(null);
    setError("");
  }

  function handleMonthChange(event) {
    setMonth(event.target.value);
    setReport(null);
    setError("");
  }

  function handleShowAllDaysChange(event) {
    setShowAllDays(event.target.checked);
    setReport(null);
    setError("");
  }

  // Fetch only when the user submits the filters.
  async function handleShowReport(event) {
    event.preventDefault();

    if (!agentId) {
      setError("Please select a salesman first.");
      return;
    }

    if (!month) {
      setError("Please select a month.");
      return;
    }

    setLoadingReport(true);
    setError("");
    setReport(null);

    try {
      const params = new URLSearchParams({
        agentId,
        month,
      });

      if (showAllDays) {
        params.set("showAllDays", "1");
      }

      const response = await fetch(
        `/api/admin/mr-monthly-report?${params.toString()}`,
        {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        }
      );

      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load the monthly report."
        );
      }

      if (
        !data.summary ||
        !Array.isArray(data.days) ||
        !Array.isArray(data.medicalSummary)
      ) {
        throw new Error(
          "Unexpected report response. Verify the monthly report API."
        );
      }

      setReport(data);
    } catch (err) {
      setError(
        err.message || "Unable to generate the report."
      );
    } finally {
      setLoadingReport(false);
    }
  }

  const selectedAgent = agents.find(
    (agent) =>
      String(agent.employeeId || agent.id) ===
      String(agentId)
  );

  const visitedMedicals = report?.medicalSummary || [];
  const dailyDays = report?.days || [];

  const dailyTotals = dailyDays.reduce(
    (totals, day) => {
      totals.visits += Number(day.visitCount || 0);
      totals.deals += Number(day.dealCount || 0);
      totals.orders += Number(day.orderTotal || 0);
      totals.collections += Number(day.collectionTotal || 0);
      return totals;
    },
    {
      visits: 0,
      deals: 0,
      orders: 0,
      collections: 0,
    }
  );

  return (
    <section className="mx-auto w-full min-w-0 max-w-8xl space-y-5 px-2 py-4 pb-8 sm:space-y-6 ">
      {/* Heading */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
          Performance Analytics
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          MR Monthly Performance
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
          Review salesman visits, medical shops, deals,
          order amounts and collections for a selected month.
        </p>
      </div>

      {/* Filters */}
      <form
        onSubmit={handleShowReport}
        className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="mb-5">
          <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
            Report Filters
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Select a salesman and month before generating the report.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {/* Salesman */}
          <div className="min-w-0">
            <label
              htmlFor="mr-agent"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              1. Select Salesman / Agent
            </label>

            <select
              id="mr-agent"
              value={agentId}
              onChange={handleAgentChange}
              disabled={loadingAgents}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              <option value="">
                {loadingAgents
                  ? "Loading salesmen..."
                  : "Choose a salesman"}
              </option>

              {agents.map((agent) => {
                const id = String(
                  agent.employeeId || agent.id || ""
                );

                const name =
                  agent.name ||
                  agent.fullName ||
                  agent.username ||
                  "Unknown Agent";

                if (!id) return null;

                return (
                  <option key={id} value={id}>
                    {name} — {agent.employeeId || id}
                  </option>
                );
              })}
            </select>

            {agentsError && (
              <p
                role="alert"
                className="mt-2 text-xs text-red-600"
              >
                {agentsError}
              </p>
            )}

            {!loadingAgents &&
              !agentsError &&
              agents.length === 0 && (
                <p className="mt-2 text-xs text-gray-500">
                  No active salesmen were returned by the employee API.
                </p>
              )}
          </div>

          {/* Month */}
          <div className="min-w-0">
            <label
              htmlFor="mr-month"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              2. Select Month
            </label>

            <input
              id="mr-month"
              type="month"
              value={month}
              onChange={handleMonthChange}
              disabled={!agentId}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
            />

            {!agentId && (
              <p className="mt-2 text-xs text-gray-400">
                Select a salesman to enable this field.
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="flex flex-col justify-end md:col-span-2 xl:col-span-1">
            <button
              type="submit"
              disabled={
                !agentId ||
                !month ||
                loadingReport ||
                loadingAgents
              }
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {loadingReport
                ? "Generating Report..."
                : "Show Report"}
            </button>
          </div>
        </div>

        {/* Calendar option */}
        <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={showAllDays}
              onChange={handleShowAllDaysChange}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />

            <span>
              <span className="block text-sm font-semibold text-gray-800">
                Show all calendar days
              </span>

              <span className="mt-1 block text-xs leading-5 text-gray-500">
                Disabled by default. When enabled, the report includes
                dates without visits and displays “No visits recorded.”
                Select Show Report again after changing this option.
              </span>
            </span>
          </label>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
        >
          {error}
        </div>
      )}

      {/* Loading */}
      {loadingReport && (
        <div
          role="status"
          className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm"
        >
          Generating monthly report...
        </div>
      )}

      {/* Report */}
      {report && !loadingReport && (
        <div className="space-y-5 sm:space-y-6">
          {/* Selected salesman */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                {report.agent?.name ||
                  selectedAgent?.name ||
                  "Selected Salesman"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Employee ID: {report.agent?.employeeId || agentId}
                {" · "}
                Report month: {report.month || month}
              </p>
            </div>

            <span className="mt-2 w-fit rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 sm:mt-0">
              {visitedMedicals.length} visited medical
              {visitedMedicals.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5 sm:gap-4">
            <SummaryCard
              title="Total Visits"
              value={Number(
                report.summary.totalVisits || 0
              ).toLocaleString("en-IN")}
              subtitle="Visits in the selected month"
            />

            <SummaryCard
              title="Visited Medicals"
              value={Number(
                report.summary.totalVisitedMedicals ??
                  visitedMedicals.length
              ).toLocaleString("en-IN")}
              subtitle="Unique medical shops visited"
            />

            <SummaryCard
              title="Total Deals"
              value={Number(
                report.summary.totalDeals || 0
              ).toLocaleString("en-IN")}
              subtitle="Visits with positive order amount"
            />

            <SummaryCard
              title="Total Order Amount"
              value={formatMoney(
                report.summary.totalOrderAmount
              )}
              subtitle="Recorded order value"
            />

            <SummaryCard
              title="Total Collections"
              value={formatMoney(
                report.summary.totalCollectionAmount
              )}
              subtitle="Recorded collection amount"
            />
          </div>

          {/* Medical-wise summary */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-4 sm:p-5">
              <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
                Visited Medicals &amp; Medical-wise Visit Count
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Only shops visited by this salesman during{" "}
                {report.month || month} are shown.
              </p>
            </div>

            {visitedMedicals.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-gray-500">
                No medical shops were visited by this salesman
                during the selected month.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="whitespace-nowrap px-4 py-3.5">
                        Medical Shop
                      </th>
                      <th className="whitespace-nowrap px-4 py-3.5">
                        Address
                      </th>
                      <th className="whitespace-nowrap px-4 py-3.5">
                        Area
                      </th>
                      <th className="whitespace-nowrap px-4 py-3.5">
                        Place
                      </th>
                      <th className="whitespace-nowrap px-4 py-3.5 text-right">
                        Visit Count
                      </th>
                      <th className="whitespace-nowrap px-4 py-3.5 text-right">
                        Deals
                      </th>
                      <th className="whitespace-nowrap px-4 py-3.5 text-right">
                        Order Amount
                      </th>
                      <th className="whitespace-nowrap px-4 py-3.5 text-right">
                        Collections
                      </th>
                      <th className="whitespace-nowrap px-4 py-3.5">
                        Last Visit
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {visitedMedicals.map((medical, index) => (
                      <tr
                        key={`${medical.medicalShopId ?? "medical"}-${index}`}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="max-w-[240px] break-words px-4 py-4 font-semibold text-gray-900">
                          {medical.medicalName || "Unnamed medical"}
                        </td>

                        <td className="max-w-[220px] break-words px-4 py-4 text-gray-600">
                          {medical.medicalAddress || "—"}
                        </td>

                        <td className="px-4 py-4 text-gray-600">
                          {medical.areaName || "Unassigned area"}
                        </td>

                        <td className="px-4 py-4 text-gray-600">
                          {medical.placeName || "Unassigned place"}
                        </td>

                        <td className="px-4 py-4 text-right">
                          <span className="inline-flex min-w-10 items-center justify-center rounded-lg bg-blue-50 px-2.5 py-1.5 font-bold text-blue-700">
                            {Number(medical.visitCount || 0)}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-right font-semibold text-green-700">
                          {Number(medical.dealCount || 0)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-right text-gray-700">
                          {formatMoney(medical.orderTotal)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-right text-gray-700">
                          {formatMoney(medical.collectionTotal)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-gray-600">
                          {formatDate(medical.lastVisitDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-4 font-bold text-gray-900"
                      >
                        Totals for visited medicals
                      </td>

                      <td className="px-4 py-4 text-right font-bold">
                        {visitedMedicals.reduce(
                          (sum, item) =>
                            sum + Number(item.visitCount || 0),
                          0
                        )}
                      </td>

                      <td className="px-4 py-4 text-right font-bold text-green-700">
                        {visitedMedicals.reduce(
                          (sum, item) =>
                            sum + Number(item.dealCount || 0),
                          0
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-right font-bold">
                        {formatMoney(
                          visitedMedicals.reduce(
                            (sum, item) =>
                              sum + Number(item.orderTotal || 0),
                            0
                          )
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-right font-bold">
                        {formatMoney(
                          visitedMedicals.reduce(
                            (sum, item) =>
                              sum + Number(item.collectionTotal || 0),
                            0
                          )
                        )}
                      </td>

                      <td className="px-4 py-4">—</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Daily details */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-4 sm:p-5">
              <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
                Daily Visit &amp; Medical Details
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {showAllDays
                  ? "All calendar dates are shown, including days without visits."
                  : "Only dates with actual medical shop visits are shown."}
              </p>
            </div>

            {dailyDays.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-gray-500">
                No visits were recorded for this salesman during
                the selected month.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="whitespace-nowrap px-4 py-3.5">
                        Date
                      </th>
                      <th className="whitespace-nowrap px-4 py-3.5">
                        Medical Shop
                      </th>
                      <th className="whitespace-nowrap px-4 py-3.5">
                        Address
                      </th>
                      <th className="whitespace-nowrap px-4 py-3.5">
                        Area
                      </th>
                      <th className="whitespace-nowrap px-4 py-3.5">
                        Place
                      </th>
                      <th className="whitespace-nowrap px-4 py-3.5 text-right">
                        Visits
                      </th>
                      <th className="whitespace-nowrap px-4 py-3.5 text-right">
                        Deals
                      </th>
                      <th className="whitespace-nowrap px-4 py-3.5 text-right">
                        Order Amount
                      </th>
                      <th className="whitespace-nowrap px-4 py-3.5 text-right">
                        Collections
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {dailyDays.map((day) => {
                      const rows = Array.isArray(day.rows)
                        ? day.rows
                        : [];

                      if (rows.length === 0) {
                        return (
                          <tr
                            key={day.date}
                            className="bg-gray-50/70"
                          >
                            <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-700">
                              {formatDate(day.date)}
                            </td>

                            <td
                              colSpan={8}
                              className="px-4 py-4 italic text-gray-400"
                            >
                              No visits recorded
                            </td>
                          </tr>
                        );
                      }

                      return rows.map((row, index) => (
                        <tr
                          key={`${day.date}-${row.medicalShopId ?? "medical"}-${index}`}
                          className="transition hover:bg-gray-50"
                        >
                          <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-700">
                            {formatDate(day.date)}
                          </td>

                          <td className="max-w-[240px] break-words px-4 py-4 font-semibold text-gray-900">
                            {row.medicalName || "Unnamed medical"}
                          </td>

                          <td className="max-w-[220px] break-words px-4 py-4 text-gray-600">
                            {row.medicalAddress || "—"}
                          </td>

                          <td className="px-4 py-4 text-gray-600">
                            {row.areaName || "Unassigned area"}
                          </td>

                          <td className="px-4 py-4 text-gray-600">
                            {row.placeName || "Unassigned place"}
                          </td>

                          <td className="px-4 py-4 text-right font-semibold text-gray-900">
                            {Number(row.visitCount || 0)}
                          </td>

                          <td className="px-4 py-4 text-right font-semibold text-green-700">
                            {Number(row.dealCount || 0)}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-right text-gray-700">
                            {formatMoney(row.orderTotal)}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-right text-gray-700">
                            {formatMoney(row.collectionTotal)}
                          </td>
                        </tr>
                      ));
                    })}
                  </tbody>

                  <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-4 font-bold text-gray-900"
                      >
                        Monthly Total
                      </td>

                      <td className="px-4 py-4 text-right font-bold">
                        {Number(
                          report.summary.totalVisits ?? dailyTotals.visits
                        )}
                      </td>

                      <td className="px-4 py-4 text-right font-bold text-green-700">
                        {Number(
                          report.summary.totalDeals ?? dailyTotals.deals
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-right font-bold">
                        {formatMoney(
                          report.summary.totalOrderAmount ??
                            dailyTotals.orders
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-right font-bold">
                        {formatMoney(
                          report.summary.totalCollectionAmount ??
                            dailyTotals.collections
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Initial state */}
      {!report && !loadingReport && !error && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-5 py-10 text-center sm:px-6 sm:py-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 012 2v14H3V6a2 2 0 012-2z"
              />
            </svg>
          </div>

          <h3 className="mt-4 text-base font-semibold text-gray-800">
            Select a salesman and month
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
            Generate a monthly report to view visited medical
            shops, daily activity, deals, orders and collections.
          </p>
        </div>
      )}
    </section>
  );
}
