
"use client";

import { useEffect, useState } from "react";

function localDateString(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function getDefaultDates() {
  const today = new Date();
  const firstDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  return {
    fromDate: localDateString(firstDay),
    toDate: localDateString(today),
  };
}

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SummaryCard({ title, value, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-2 break-words text-2xl font-extrabold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

export default function CollectionStatements() {
  const [agents, setAgents] = useState([]);
  const [agentId, setAgentId] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [report, setReport] = useState(null);

  const [loadingAgents, setLoadingAgents] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);

  const [error, setError] = useState("");
  const [agentError, setAgentError] = useState("");

  // Default to the first day of this month through today.
  useEffect(() => {
    const defaults = getDefaultDates();

    setFromDate(defaults.fromDate);
    setToDate(defaults.toDate);
  }, []);

useEffect(() => {
  let cancelled = false;

  async function loadAgents() {
    setLoadingAgents(true);
    setAgentError("");

    try {
      const response = await fetch(
        "/api/admin/collection-statements?action=agents",
        {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load salesmen"
        );
      }

      if (!cancelled) {
        setAgents(Array.isArray(data.agents) ? data.agents : []);
      }
    } catch (err) {
      if (!cancelled) {
        setAgentError(
          err.message || "Unable to load salesmen"
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

  async function handleShowStatements(event) {
    event.preventDefault();

    setError("");
    setReport(null);

    if (!agentId) {
      setError("Please select a salesman.");
      return;
    }

    if (!fromDate || !toDate) {
      setError("Please select both the start date and end date.");
      return;
    }

    if (fromDate > toDate) {
      setError("From date cannot be after To date.");
      return;
    }

    const startMs = Date.parse(`${fromDate}T00:00:00Z`);
    const endMs = Date.parse(`${toDate}T00:00:00Z`);

    const days =
      Math.floor((endMs - startMs) / 86400000) + 1;

    if (days > 366) {
      setError("Please select a date range of 366 days or less.");
      return;
    }

    setLoadingReport(true);

    try {
      const params = new URLSearchParams({
        agentId,
        fromDate,
        toDate,
      });

      const response = await fetch(
        `/api/admin/collection-statements?${params.toString()}`,
        {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load collection statements"
        );
      }

      setReport(data);
    } catch (err) {
      setError(
        err.message || "Unable to load collection statements"
      );
    } finally {
      setLoadingReport(false);
    }
  }

  return (
    <section className="w-full min-w-0 space-y-6 pb-8">
      {/* PAGE HEADER */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <rect
                x="3"
                y="5"
                width="18"
                height="14"
                rx="2"
                strokeWidth="1.8"
              />
              <path
                d="M3 10h18M7 15h4"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Collection Statements
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Track cash collected by each salesman and visit.
            </p>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <form
        onSubmit={handleShowStatements}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900">
            Statement Filters
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select a salesman and date range to view cash collections.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* SALESMAN */}
          <div>
            <label
              htmlFor="collection-agent"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Salesman / Agent
            </label>

            <select
              id="collection-agent"
              value={agentId}
              onChange={handleAgentChange}
              disabled={loadingAgents}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
            >
              <option value="">
                {loadingAgents
                  ? "Loading salesmen..."
                  : "Select a salesman"}
              </option>

              {agents.map((agent) => (
                <option
                  key={agent.employeeId}
                  value={agent.employeeId}
                >
                  {agent.name} — {agent.employeeId}
                </option>
              ))}
            </select>

            {agentError && (
              <p className="mt-2 text-xs text-red-600">
                {agentError}
              </p>
            )}
          </div>

          {/* FROM DATE */}
          <div>
            <label
              htmlFor="collection-from-date"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              From Date
            </label>

            <input
              id="collection-from-date"
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(event) => {
                setFromDate(event.target.value);
                setReport(null);
                setError("");
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* TO DATE */}
          <div>
            <label
              htmlFor="collection-to-date"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              To Date
            </label>

            <input
              id="collection-to-date"
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(event) => {
                setToDate(event.target.value);
                setReport(null);
                setError("");
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* SUBMIT */}
          <div className="flex flex-col justify-end">
            <button
              type="submit"
              disabled={loadingReport || loadingAgents}
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingReport ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Loading...
                </>
              ) : (
                "Show Statements"
              )}
            </button>
          </div>
        </div>
      </form>

      {/* ERROR */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* RESULTS */}
      {report && (
        <>
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {report.agent.name}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Employee ID: {report.agent.employeeId}
              </p>
            </div>

            <p className="text-sm text-slate-500">
              {report.fromDate} to {report.toDate}
            </p>
          </div>

          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryCard
              title="Total Cash Collected"
              value={money(report.summary.totalCashCollection)}
              description="Cash payment visits with positive collections"
            />

            <SummaryCard
              title="Cash Collection Visits"
              value={report.summary.cashVisitCount}
              description="Matching visits in the selected date range"
            />

            <SummaryCard
              title="Order Amount"
              value={money(report.summary.totalOrderAmount)}
              description="Order value for these cash-collection visits"
            />
          </div>

          {/* STATEMENTS TABLE */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Cash Collection Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Only visits where the payment method is Cash and a positive
                  collection amount was recorded.
                </p>
              </div>

              <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                Cash Only
              </span>
            </div>

            {report.truncated && (
              <div className="border-b border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Showing the first {report.detailsReturned} statement rows.
                The total cash amount above includes all matching records.
                Narrow the date range to view fewer rows.
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-[1000px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-4">
                      Visit Date & Time
                    </th>
                    <th className="whitespace-nowrap px-4 py-4">
                      Salesman
                    </th>
                    <th className="whitespace-nowrap px-4 py-4">
                      Medical Shop
                    </th>
                    <th className="whitespace-nowrap px-4 py-4">
                      Area / Place
                    </th>
                    <th className="whitespace-nowrap px-4 py-4 text-right">
                      Order Amount
                    </th>
                    <th className="whitespace-nowrap px-4 py-4 text-right">
                      Cash Collected
                    </th>
                    <th className="whitespace-nowrap px-4 py-4">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {report.statements.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-12 text-center"
                      >
                        <p className="font-semibold text-slate-700">
                          No cash collections found
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          No visits match this salesman and date range.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    report.statements.map((statement) => (
                      <tr
                        key={statement.visitId}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                          {formatDateTime(statement.visitTime)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-900">
                          {statement.agentName}
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-900">
                            {statement.shopName}
                          </p>

                          {statement.address && (
                            <p className="mt-1 max-w-xs text-xs text-slate-500">
                              {statement.address}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-4 text-slate-600">
                          <p>{statement.areaName}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {statement.placeName}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-right text-slate-700">
                          {money(statement.orderAmount)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-right">
                          <span className="font-bold text-emerald-700">
                            {money(statement.collectionAmount)}
                          </span>

                          <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                            {statement.paymentMethod}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                            {statement.status}
                          </span>

                          {statement.remark && (
                            <p className="mt-1 max-w-[180px] text-xs text-slate-500">
                              {statement.remark}
                            </p>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

                {report.statements.length > 0 && (
                  <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-4 font-bold text-slate-900"
                      >
                        Total Cash Collected
                      </td>

                      <td className="px-4 py-4 text-right font-bold text-slate-900">
                        {money(report.summary.totalOrderAmount)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-right font-extrabold text-emerald-700">
                        {money(report.summary.totalCashCollection)}
                      </td>

                      <td className="px-4 py-4" />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </>
      )}

      {!report && !loadingReport && !error && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
          <h3 className="text-base font-bold text-slate-800">
            Generate a Collection Statement
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Select the salesman and date range, then click Show Statements
            to view cash collected at each medical shop.
          </p>
        </div>
      )}
    </section>
  );
}
