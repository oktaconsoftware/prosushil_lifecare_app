

// 'use client';
// import { useState, useEffect } from 'react';
// import dynamic from 'next/dynamic';

// // Load the map dynamically so Next.js doesn't crash on the server
// const MapWrapper = dynamic(() => import('./MapWrapper'), {
//   ssr: false,
//   loading: () => (
//     <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 rounded-2xl md:rounded-3xl animate-pulse min-h-[300px]">
//       <div className="w-8 h-8 border-4 border-slate-300 border-t-[#97c22a] rounded-full animate-spin mb-3"></div>
//       <p className="text-[13px] font-bold text-slate-500">Loading Map Engine...</p>
//     </div>
//   )
// });

// // Helper to accurately get YYYY-MM-DD in Local Time (IST)
// const getLocalYYYYMMDD = (dateInput) => {
//   const d = dateInput ? new Date(dateInput) : new Date();
//   const year = d.getFullYear();
//   const month = String(d.getMonth() + 1).padStart(2, '0');
//   const day = String(d.getDate()).padStart(2, '0');
//   return `${year}-${month}-${day}`;
// };

// export default function EmployeeMapTab() {
//   const [selectedDate, setSelectedDate] = useState(''); 
//   const [agents, setAgents] = useState([]);
//   const [selectedAgentId, setSelectedAgentId] = useState('');
//   const [visits, setVisits] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isFetchingVisits, setIsFetchingVisits] = useState(false);

//   useEffect(() => {
//     setSelectedDate(getLocalYYYYMMDD());
//   }, []);

//   // 1. Fetch the list of agents on load
//   useEffect(() => {
//     fetch('/api/admin/employee-map')
//       .then(res => res.json())
//       .then(data => {
//         setAgents(data.agents || []);
//         setIsLoading(false);
//       })
//       .catch(err => {
//         console.error(err);
//         setIsLoading(false);
//       });
//   }, []);

//   // 2. FETCH VISITS (Triggered when Agent OR Date changes)
//   useEffect(() => {
//     if (!selectedAgentId || !selectedDate) {
//       setVisits([]);
//       return;
//     }

//     setIsFetchingVisits(true);
    
//     // Pass BOTH agentId and Date to the backend
//     fetch(`/api/admin/employee-map?agentId=${selectedAgentId}&date=${selectedDate}`)
//       .then(res => res.json())
//       .then(data => {
//         // Convert the string numbers to real floats so the Map doesn't break
//         const sanitizedVisits = (data.visits || []).map(v => ({
//           ...v,
//           latitude: parseFloat(v.latitude),
//           longitude: parseFloat(v.longitude),
//           orderAmount: parseFloat(v.orderAmount) || 0,
//           collectionAmount: parseFloat(v.collectionAmount) || 0
//         }));
        
//         setVisits(sanitizedVisits);
//         setIsFetchingVisits(false);
//       })
//       .catch(err => {
//         console.error(err);
//         setIsFetchingVisits(false);
//       });
//   }, [selectedAgentId, selectedDate]);

//   // Valid pins count checking
//   const validPinsCount = visits.filter(v => v.latitude && !isNaN(v.latitude) && v.longitude && !isNaN(v.longitude)).length;

//   return (
//     <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F4F6F8] animate-in fade-in duration-300">
//       {/* 🚨 RESPONSIVE PADDING: Small on mobile, large on desktop */}
//       <div className="p-3 sm:p-5 md:p-8 lg:p-10 w-full h-full flex flex-col max-w-7xl mx-auto gap-4 md:gap-6 overflow-y-auto custom-scrollbar">
        
//         {/* ── HERO HEADER & CONTROLS ── */}
//         <div className="bg-[#0a0f1a] rounded-2xl md:rounded-3xl p-5 md:p-8 relative overflow-hidden shadow-xl shrink-0">
//           {/* Ambient Glow */}
//           <div className="absolute top-0 right-0 w-[150px] md:w-[200px] h-[150px] md:h-[200px] bg-[#97c22a]/20 rounded-full blur-[50px] md:blur-[60px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          
//           <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 md:gap-6">
            
//             {/* Title Section */}
//             <div className="text-left">
//               <p className="text-[10px] md:text-[11px] font-bold tracking-widest text-[#97c22a] uppercase mb-1 md:mb-1.5">Geographic Tracking</p>
//               <h3 className="text-[18px] md:text-2xl font-bold text-white tracking-tight">Day-Wise Route Map</h3>
//             </div>
            
//             {/* 🚨 RESPONSIVE CONTROLS: Stacked on mobile, row on tablet/desktop */}
//             <div className="flex flex-col sm:flex-row w-full lg:w-auto shrink-0 gap-3">
              
//               <input 
//                 type="date"
//                 value={selectedDate}
//                 onChange={(e) => setSelectedDate(e.target.value)}
//                 className="w-full sm:w-44 px-4 py-3 md:py-3.5 bg-white/10 border border-white/20 text-white rounded-xl text-[14px] font-bold outline-none transition-all cursor-pointer focus:border-[#97c22a] focus:bg-white/15"
//               />

//               <select 
//                 value={selectedAgentId} 
//                 onChange={(e) => setSelectedAgentId(e.target.value)}
//                 className="w-full sm:w-64 lg:w-72 px-4 py-3 md:py-3.5 bg-white/10 border border-white/20 text-white rounded-xl text-[14px] font-bold outline-none transition-all appearance-none cursor-pointer focus:border-[#97c22a] focus:bg-white/15"
//                 style={{ 
//                   backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2397c22a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, 
//                   backgroundRepeat: 'no-repeat', 
//                   backgroundPosition: 'right 1.2rem center', 
//                   backgroundSize: '1.2em' 
//                 }}
//               >
//                 <option value="" disabled className="text-slate-500 bg-white">Select an Employee...</option>
//                 {agents.map(agent => {
//                   const displayAgentName = agent.name || agent.fullName || agent.username || agent.first_name || 'Unknown Agent';
//                   return (
//                     <option key={agent.id} value={agent.employeeId || agent.id} className="text-slate-900 bg-white">
//                       {displayAgentName}
//                     </option>
//                   );
//                 })}
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* ── MAP CONTAINER ── */}
//         {/* 🚨 RESPONSIVE MAP HEIGHT: Minimum 60vh on mobile to prevent squishing, flex-1 on desktop */}
//         <div className="flex-1 bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative min-h-[60vh] md:min-h-0 flex flex-col z-0">
          
//           {/* Floating Status Badge (Responsive positioning) */}
//           {selectedAgentId && selectedDate && (
//             <div className="absolute top-3 right-3 md:top-4 md:right-4 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl shadow-lg border border-slate-200 flex items-center gap-2.5 max-w-[calc(100%-24px)]">
//               <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full shrink-0 ${validPinsCount > 0 ? 'bg-[#97c22a] animate-pulse' : 'bg-red-500'}`}></div>
//               <p className="text-[11px] md:text-[12px] font-bold text-slate-700 truncate">
//                 {isFetchingVisits 
//                   ? 'Plotting pins...' 
//                   : `${validPinsCount} Pinned on ${new Date(selectedDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`}
//               </p>
//             </div>
//           )}

//           {/* Map Empty State */}
//           {!selectedAgentId ? (
//             <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/50">
//               <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-[#97C22A]/10 flex items-center justify-center mb-3 md:mb-4 border border-[#97C22A]/20">
//                 <svg className="w-7 h-7 md:w-8 md:h-8 text-[#5c7a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//                 </svg>
//               </div>
//               <p className="text-[15px] md:text-[16px] font-bold text-slate-800">Map Standby</p>
//               <p className="text-[12px] md:text-[13px] font-medium text-slate-500 mt-1 max-w-xs md:max-w-sm px-4">
//                 Select an employee from the dropdown above to load their physical visit history.
//               </p>
//             </div>
//           ) : (
//             <MapWrapper visits={visits} />
//           )}

//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Load Leaflet only in the browser.
const MapWrapper = dynamic(() => import("./MapWrapper"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[300px] h-full w-full flex-col items-center justify-center rounded-2xl bg-slate-100">
      <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#97c22a]" />
      <p className="text-[13px] font-bold text-slate-500">
        Loading Map Engine...
      </p>
    </div>
  ),
});

// Get the local calendar date without converting it to UTC.
function getLocalYYYYMMDD(input) {
  const date = input ? new Date(input) : new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function sanitizeVisit(visit) {
  return {
    ...visit,
    latitude: toNumberOrNull(visit.latitude),
    longitude: toNumberOrNull(visit.longitude),
    orderAmount: Number(visit.orderAmount) || 0,
    collectionAmount: Number(visit.collectionAmount) || 0,
  };
}

function hasValidCoordinates(visit) {
  return (
    Number.isFinite(visit.latitude) &&
    visit.latitude >= -90 &&
    visit.latitude <= 90 &&
    Number.isFinite(visit.longitude) &&
    visit.longitude >= -180 &&
    visit.longitude <= 180
  );
}

function formatDisplayDate(value) {
  if (!value) return "";

  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function EmployeeMapTab() {
  // Map modes
  const [mode, setMode] = useState("single");

  // Existing single employee + date mode
  const [selectedDate, setSelectedDate] = useState("");
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");

  // Date range + all employees mode
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [rangeSubmitted, setRangeSubmitted] = useState(false);
  const [rangeRequestVersion, setRangeRequestVersion] = useState(0);

  // Map data
  const [visits, setVisits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingVisits, setIsFetchingVisits] = useState(false);
  const [error, setError] = useState("");
  const [agentError, setAgentError] = useState("");
  const [isTruncated, setIsTruncated] = useState(false);

  // Initialize date inputs using local time.
  useEffect(() => {
    const today = getLocalYYYYMMDD();

    setSelectedDate(today);
    setFromDate(today);
    setToDate(today);
  }, []);

  // Load employee list.
  // No AbortController: the cleanup flag ignores outdated responses.
  useEffect(() => {
    let cancelled = false;

    async function loadAgents() {
      setIsLoading(true);
      setAgentError("");

      try {
        const response = await fetch("/api/admin/employee-map", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load employees");
        }

        if (!cancelled) {
          setAgents(Array.isArray(data.agents) ? data.agents : []);
        }
      } catch (err) {
        if (!cancelled) {
          setAgentError(
            err.message || "Unable to load employee list"
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadAgents();

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch visits for either map mode.
  // Single: one employee on one date.
  // Range: all employees between the selected dates.
  useEffect(() => {
    let cancelled = false;

    async function loadVisits() {
      let requestUrl;

      if (mode === "single") {
        if (!selectedAgentId || !selectedDate) {
          setVisits([]);
          setError("");
          setIsTruncated(false);
          setIsFetchingVisits(false);
          return;
        }

        const params = new URLSearchParams({
          agentId: selectedAgentId,
          date: selectedDate,
        });

        requestUrl = `/api/admin/employee-map?${params.toString()}`;
      } else {
        if (!rangeSubmitted || !fromDate || !toDate) {
          setVisits([]);
          setError("");
          setIsTruncated(false);
          setIsFetchingVisits(false);
          return;
        }

        const params = new URLSearchParams({
          fromDate,
          toDate,
        });

        requestUrl = `/api/admin/employee-map?${params.toString()}`;
      }

      setIsFetchingVisits(true);
      setError("");
      setVisits([]);
      setIsTruncated(false);

      try {
        const response = await fetch(requestUrl, {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to fetch visit locations"
          );
        }

        const loadedVisits = Array.isArray(data.visits)
          ? data.visits.map(sanitizeVisit)
          : [];

        if (!cancelled) {
          setVisits(loadedVisits);
          setIsTruncated(Boolean(data.truncated));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Unable to load visit locations"
          );
        }
      } finally {
        if (!cancelled) {
          setIsFetchingVisits(false);
        }
      }
    }

    loadVisits();

    return () => {
      // Ignore old responses without aborting an active fetch.
      cancelled = true;
    };
  }, [
    mode,
    selectedAgentId,
    selectedDate,
    fromDate,
    toDate,
    rangeSubmitted,
    rangeRequestVersion,
  ]);

  // Switch between map modes.
  function handleModeChange(nextMode) {
    setMode(nextMode);
    setVisits([]);
    setError("");
    setIsTruncated(false);
    setRangeSubmitted(false);
  }

  // Change a date without loading until the user submits again.
  function handleRangeDateChange(type, value) {
    if (type === "from") {
      setFromDate(value);
    } else {
      setToDate(value);
    }

    setRangeSubmitted(false);
    setVisits([]);
    setError("");
    setIsTruncated(false);
  }

  // Load every employee's visits in the selected date range.
  function handleLoadRange() {
    setError("");
    setVisits([]);
    setIsTruncated(false);

    if (!fromDate || !toDate) {
      setError("Please select both the start date and end date.");
      return;
    }

    if (fromDate > toDate) {
      setError("Start date cannot be after the end date.");
      return;
    }

    const startMs = Date.parse(`${fromDate}T00:00:00Z`);
    const endMs = Date.parse(`${toDate}T00:00:00Z`);

    const totalDays =
      Math.floor((endMs - startMs) / 86400000) + 1;

    if (totalDays > 31) {
      setError("Please select a date range of 31 days or less.");
      return;
    }

    setRangeSubmitted(true);
    setRangeRequestVersion((previous) => previous + 1);
  }

  // Only use real, valid coordinates as map pins.
  const validPins = visits.filter(hasValidCoordinates);
  const validPinsCount = validPins.length;

  const hasSelection =
    mode === "single"
      ? Boolean(selectedAgentId && selectedDate)
      : Boolean(rangeSubmitted && fromDate && toDate);

  const selectedAgent = agents.find(
    (agent) =>
      String(agent.employeeId || agent.id) ===
      String(selectedAgentId)
  );

  const selectedAgentName = selectedAgent
    ? selectedAgent.name ||
      selectedAgent.fullName ||
      selectedAgent.username ||
      selectedAgent.first_name ||
      "Unknown Agent"
    : "";

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[#F4F6F8]">
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-4 overflow-y-auto overscroll-y-contain p-3 pb-8 sm:gap-5 sm:p-5 md:p-8">
        {/* HEADER & MODE CONTROLS */}
        <section className="relative shrink-0 overflow-hidden rounded-2xl bg-[#0a0f1a] p-5 shadow-xl md:rounded-3xl md:p-8">
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 translate-x-1/4 -translate-y-1/2 rounded-full bg-[#97c22a]/20 blur-[50px] md:h-52 md:w-52" />

          <div className="relative z-10 space-y-5">
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-[#97c22a] md:text-[11px]">
                Geographic Tracking
              </p>

              <h1 className="text-xl font-bold tracking-tight text-white md:text-2xl">
                Employee Visit Map
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Track individual employee visits or view visits from all
                employees across a date range.
              </p>
            </div>

            {/* MODE SELECTION */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleModeChange("single")}
                aria-pressed={mode === "single"}
                className={`rounded-xl border px-4 py-3 text-left text-sm font-bold transition ${
                  mode === "single"
                    ? "border-[#97c22a] bg-[#97c22a] text-[#10150b]"
                    : "border-white/15 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                <span className="block">Single Date + Employee</span>
                <span className="mt-1 block text-xs font-medium opacity-75">
                  View one employee on one day
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange("range")}
                aria-pressed={mode === "range"}
                className={`rounded-xl border px-4 py-3 text-left text-sm font-bold transition ${
                  mode === "range"
                    ? "border-[#97c22a] bg-[#97c22a] text-[#10150b]"
                    : "border-white/15 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                <span className="block">Date Range + All Employees</span>
                <span className="mt-1 block text-xs font-medium opacity-75">
                  View all employee visit pins
                </span>
              </button>
            </div>

            {/* MODE 1: SINGLE EMPLOYEE + DATE */}
            {mode === "single" && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="map-single-date"
                    className="mb-2 block text-xs font-bold text-slate-300"
                  >
                    Select Date
                  </label>

                  <input
                    id="map-single-date"
                    type="date"
                    value={selectedDate}
                    onChange={(event) =>
                      setSelectedDate(event.target.value)
                    }
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-[#97c22a] focus:bg-white/15"
                  />
                </div>

                <div>
                  <label
                    htmlFor="map-single-agent"
                    className="mb-2 block text-xs font-bold text-slate-300"
                  >
                    Select Employee
                  </label>

                  <select
                    id="map-single-agent"
                    value={selectedAgentId}
                    onChange={(event) =>
                      setSelectedAgentId(event.target.value)
                    }
                    disabled={isLoading}
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-[#97c22a] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="" className="bg-white text-slate-900">
                      {isLoading
                        ? "Loading employees..."
                        : "Select an employee..."}
                    </option>

                    {agents.map((agent) => {
                      const id = agent.employeeId || agent.id;
                      const name =
                        agent.name ||
                        agent.fullName ||
                        agent.username ||
                        agent.first_name ||
                        "Unknown Agent";

                      return (
                        <option
                          key={String(id)}
                          value={String(id)}
                          className="bg-white text-slate-900"
                        >
                          {name}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            )}

            {/* MODE 2: DATE RANGE + ALL EMPLOYEES */}
            {mode === "range" && (
              <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label
                    htmlFor="map-from-date"
                    className="mb-2 block text-xs font-bold text-slate-300"
                  >
                    From Date
                  </label>

                  <input
                    id="map-from-date"
                    type="date"
                    value={fromDate}
                    max={toDate || undefined}
                    onChange={(event) =>
                      handleRangeDateChange("from", event.target.value)
                    }
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-[#97c22a]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="map-to-date"
                    className="mb-2 block text-xs font-bold text-slate-300"
                  >
                    To Date
                  </label>

                  <input
                    id="map-to-date"
                    type="date"
                    value={toDate}
                    min={fromDate || undefined}
                    onChange={(event) =>
                      handleRangeDateChange("to", event.target.value)
                    }
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-[#97c22a]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleLoadRange}
                  disabled={isFetchingVisits || isLoading}
                  className="min-h-[46px] rounded-xl bg-[#97c22a] px-5 py-3 text-sm font-extrabold text-[#10150b] transition hover:bg-[#a9d936] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isFetchingVisits
                    ? "Loading Locations..."
                    : "Load All Visits"}
                </button>

                <p className="text-xs text-slate-400 sm:col-span-2 lg:col-span-3">
                  Every employee is included. Date ranges are limited to
                  31 days per request for map performance.
                </p>
              </div>
            )}

            {/* ERRORS */}
            {agentError && (
              <p
                role="alert"
                className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200"
              >
                {agentError}
              </p>
            )}

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200"
              >
                {error}
              </p>
            )}
          </div>
        </section>

        {/* MAP CONTAINER */}
        <section className="relative flex min-h-[60vh] shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:min-h-[560px] md:flex-1">
          {/* Map status badge */}
          {hasSelection && (
            <div className="absolute right-3 top-3 z-[400] flex max-w-[calc(100%-24px)] items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur md:right-4 md:top-4 md:px-4">
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                  isFetchingVisits
                    ? "animate-pulse bg-amber-500"
                    : validPinsCount > 0
                      ? "bg-[#97c22a]"
                      : "bg-red-500"
                }`}
              />

              <span className="truncate text-[11px] font-bold text-slate-700 md:text-xs">
                {isFetchingVisits
                  ? "Loading visit pins..."
                  : mode === "range"
                    ? `${validPinsCount} pins · ${formatDisplayDate(
                        fromDate
                      )} – ${formatDisplayDate(toDate)}`
                    : `${validPinsCount} pins · ${formatDisplayDate(
                        selectedDate
                      )}`}
              </span>
            </div>
          )}

          {/* Truncated results warning */}
          {isTruncated && (
            <div className="absolute bottom-3 left-3 right-3 z-[400] rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-900 shadow md:bottom-4 md:left-4 md:right-auto md:max-w-lg">
              More than 3,000 visits match this range. Only the first 3,000
              are displayed. Narrow the date range to see fewer locations.
            </div>
          )}

          {/* Empty selection state */}
          {!hasSelection ? (
            <div className="flex min-h-[60vh] flex-1 flex-col items-center justify-center bg-slate-50 px-6 py-12 text-center md:min-h-[560px]">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#97c22a]/20 bg-[#97c22a]/10">
                <svg
                  className="h-8 w-8 text-[#5c7a1a]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657 13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
                  />
                </svg>
              </div>

              <h2 className="text-base font-bold text-slate-800">
                Map Standby
              </h2>

              <p className="mt-2 max-w-sm text-sm text-slate-500">
                {mode === "single"
                  ? "Select an employee and a date to display their visit locations."
                  : "Choose a start date and end date, then click Load All Visits to display every employee's visit pins."}
              </p>
            </div>
          ) : (
            <>
              <div className="min-h-[60vh] flex-1 md:min-h-[560px]">
                <MapWrapper
                  key={
                    mode === "range"
                      ? `range-${fromDate}-${toDate}-${rangeRequestVersion}`
                      : `single-${selectedAgentId}-${selectedDate}`
                  }
                  visits={validPins}
                  showAgentDetails={mode === "range"}
                />
              </div>

              {!isFetchingVisits &&
                visits.length > 0 &&
                validPinsCount === 0 && (
                  <div className="border-t border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    Visits were found, but none contains valid GPS coordinates
                    that can be plotted on the map.
                  </div>
                )}

              {!isFetchingVisits &&
                visits.length === 0 &&
                !error && (
                  <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    No visits were found for the selected dates.
                  </div>
                )}

              {mode === "single" && selectedAgentName && (
                <div className="border-t border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
                  Showing visits for{" "}
                  <span className="font-bold text-slate-800">
                    {selectedAgentName}
                  </span>
                </div>
              )}

              {mode === "range" && rangeSubmitted && (
                <div className="border-t border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
                  Showing all employees from{" "}
                  <span className="font-bold text-slate-800">
                    {formatDisplayDate(fromDate)}
                  </span>{" "}
                  to{" "}
                  <span className="font-bold text-slate-800">
                    {formatDisplayDate(toDate)}
                  </span>
                  . Click any pin to view its employee and visit details.
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
