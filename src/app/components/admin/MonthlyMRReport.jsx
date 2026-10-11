
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

  const [report, setReport] = useState(null);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);

  const [agentsError, setAgentsError] = useState("");
  const [error, setError] = useState("");

  // Load the salesman list.
  // Cleanup ignores stale responses without aborting fetch requests.
  useEffect(() => {
    let cancelled = false;

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
          }
        );

        const data = await readJson(response);

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load salesmen."
          );
        }

        if (!cancelled) {
          setAgents(
            Array.isArray(data.agents) ? data.agents : []
          );
        }
      } catch (err) {
        if (!cancelled) {
          setAgentsError(
            err.message || "Unable to load salesmen."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingAgents(false);
        }
      }
    }

    loadAgents();

    return () => {
      cancelled = true;
    };
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

  // Fetch only after the user submits the selected agent and month.
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
        !Array.isArray(data.days)
      ) {
        throw new Error(
          "Unexpected report response. Check that the API supports agentId and month."
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

  return (
    <section className="mx-auto w-full min-w-0 max-w-7xl space-y-5 px-3 py-4 pb-8 sm:space-y-6 sm:px-5 sm:py-6 md:px-8 md:py-8">
      {/* Page heading */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
          Performance Analytics
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          MR Monthly Performance
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
          Select a salesman first, choose a month, and review daily
          visits, deals, area-wise activity, order amounts and collections.
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
            Choose the salesman before selecting the reporting month.
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
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
          Generating monthly report...
        </div>
      )}

      {/* Report */}
      {report && !loadingReport && (
        <div className="space-y-5 sm:space-y-6">
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
              {report.days.length} calendar days
            </span>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 sm:gap-4">
            <SummaryCard
              title="Total Visits"
              value={Number(
                report.summary.totalVisits || 0
              ).toLocaleString("en-IN")}
              subtitle="Visits in the selected month"
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

          {/* Daily details */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-4 sm:p-5">
              <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
                Daily Visit & Deal Details
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Daily results are grouped by area and place.
                Dates without visits are also shown.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3.5">
                      Date
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
                  {report.days.map((day) => {
                    const rows = Array.isArray(day.rows)
                      ? day.rows
                      : [];

                    if (rows.length === 0) {
                      return (
                        <tr key={day.date}>
                          <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-700">
                            {formatDate(day.date)}
                          </td>

                          <td
                            colSpan={6}
                            className="px-4 py-4 text-gray-400"
                          >
                            No visits recorded
                          </td>
                        </tr>
                      );
                    }

                    return rows.map((row, index) => (
                      <tr
                        key={`${day.date}-${row.areaId ?? "area"}-${row.placeId ?? "place"}-${index}`}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-700">
                          {formatDate(day.date)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-gray-600">
                          {row.areaName || "Unassigned area"}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-gray-600">
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
                      colSpan={3}
                      className="px-4 py-4 font-bold text-gray-900"
                    >
                      Monthly Total
                    </td>

                    <td className="px-4 py-4 text-right font-bold">
                      {Number(report.summary.totalVisits || 0)}
                    </td>

                    <td className="px-4 py-4 text-right font-bold text-green-700">
                      {Number(report.summary.totalDeals || 0)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-right font-bold">
                      {formatMoney(
                        report.summary.totalOrderAmount
                      )}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-right font-bold">
                      {formatMoney(
                        report.summary.totalCollectionAmount
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
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
            Choose the salesman first, select the month, then click
            Show Report to review daily visit and deal details.
          </p>
        </div>
      )}
    </section>
  );
}
