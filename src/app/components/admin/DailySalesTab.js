// 'use client';
// import { useState, useEffect } from 'react';

// export default function DailySalesTab() {
//   const today = new Date().toISOString().split('T')[0];
//   const [date, setDate] = useState(today);
//   const [salesData, setSalesData] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
  
//   // State for Employee Dropdown Filter
//   const [selectedAgentId, setSelectedAgentId] = useState('ALL');

//   useEffect(() => {
//     setIsLoading(true);
//     fetch(`/api/admin/daily-sales?date=${date}`)
//       .then(res => res.json())
//       .then(data => {
//         setSalesData(data || []);
//         setIsLoading(false);
//       })
//       .catch(err => {
//         console.error(err);
//         setIsLoading(false);
//       });
//   }, [date]);

//   // Filter data based on dropdown selection
//   const filteredData = selectedAgentId === 'ALL' 
//     ? salesData 
//     : salesData.filter(agent => agent.id === selectedAgentId);

//   return (
//     <div className="flex-1 overflow-y-auto animate-in fade-in duration-300 bg-slate-50">
//       <div className="p-4 md:p-8 lg:p-10 space-y-6 md:space-y-8 pb-24 md:pb-10 max-w-7xl mx-auto w-full">
        
//         {/* ── HEADER & DATE PICKER ── */}
//         <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
//           <div>
//             <h3 className="text-[15px] md:text-lg font-bold text-slate-800 tracking-tight">Team Performance</h3>
//             <p className="text-[11px] text-slate-500 mt-1">Select a date to view Today vs Monthly performance.</p>
//           </div>
          
//           <div className="w-full md:w-56">
//             <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Select Date</label>
//             <input 
//               type="date" 
//               value={date} 
//               onChange={(e) => setDate(e.target.value)}
//               className="w-full px-4 py-3 bg-[#F0F2F5] border border-[#E2E8F0] rounded-xl text-[13px] font-bold text-[#1E293B] outline-none transition-all cursor-pointer"
//             />
//           </div>
//         </div>

//         {/* ── EMPLOYEE FILTER (DARK HERO CARD) ── */}
//         <div className="bg-[#0a0f1a] rounded-xl p-6 md:p-8 relative overflow-hidden shadow-xl">
//           <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#97c22a]/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          
//           <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
//             <div>
//               <p className="text-[10px] font-bold tracking-widest text-[#97c22a] uppercase mb-1.5">Employee Filter</p>
//               <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">View Specific Agent</h3>
//             </div>
            
//             <div className="w-full md:w-72 shrink-0">
//               <select 
//                 value={selectedAgentId} 
//                 onChange={(e) => setSelectedAgentId(e.target.value)}
//                 className="w-full px-4 py-3.5 bg-white/10 border border-white/20 text-white rounded-xl text-[13px] font-bold outline-none transition-all appearance-none cursor-pointer focus:border-[#97c22a] focus:bg-white/15"
//                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2397c22a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.2rem center', backgroundSize: '1.2em' }}
//               >
//                 <option value="ALL" className="text-slate-900 bg-white">All Employees</option>
//                 {salesData.map(agent => (
//                   <option key={agent.id} value={agent.id} className="text-slate-900 bg-white">
//                     {agent.name} ({agent.id})
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* ── EXCEL-LIKE DATA TABLE ── */}
//         {isLoading ? (
//           <div className="py-20 flex flex-col items-center justify-center">
//              <div className="w-8 h-8 border-4 border-slate-200 border-t-[#97c22a] rounded-full animate-spin mb-3"></div>
//              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Loading Employee Data...</p>
//           </div>
//         ) : filteredData.length === 0 ? (
//           <p className="text-center text-slate-500 py-10 bg-white rounded-2xl border border-slate-200 shadow-sm">No agents found for this selection.</p>
//         ) : (
//           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-10">
//             <div className="overflow-x-auto overflow-y-auto max-h-[65vh] custom-scrollbar">
//               <table className="w-full text-left border-collapse whitespace-nowrap relative">
                
//                 {/* Master Headers */}
//                 <thead className="sticky top-0 z-20 shadow-sm">
//                   <tr>
//                     <th className="bg-slate-100 border-b border-r border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 w-12 text-center" rowSpan="2">Rank</th>
//                     <th className="bg-slate-100 border-b border-r border-slate-200 px-4 py-2 text-xs font-bold text-slate-700" rowSpan="2">Employee Name</th>
//                     <th className="bg-slate-100 border-b border-r border-slate-200 px-4 py-2 text-xs font-bold text-slate-700" rowSpan="2">Area</th>
//                     <th className="bg-blue-50 border-b border-r border-slate-300 px-4 py-2 text-xs font-bold text-blue-900 text-center" colSpan="4">
//                       Today ({new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })})
//                     </th>
//                     <th className="bg-[#f4faeb] border-b border-slate-300 px-4 py-2 text-xs font-bold text-[#5c7a1a] text-center" colSpan="3">
//                       Monthly (Till Date)
//                     </th>
//                   </tr>
                  
//                   {/* Sub Headers */}
//                   <tr>
//                     <th className="bg-blue-50/60 border-b border-r border-slate-200 px-4 py-2 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-center">Visits</th>
//                     <th className="bg-blue-50/60 border-b border-r border-slate-200 px-4 py-2 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-right">Sales (₹)</th>
//                     <th className="bg-blue-50/60 border-b border-r border-slate-200 px-4 py-2 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-right">Cash (₹)</th>
//                     <th className="bg-blue-50/60 border-b border-r border-slate-300 px-4 py-2 text-[11px] font-bold text-slate-600 uppercase tracking-wider">Pay Method</th>
                    
//                     <th className="bg-[#f4faeb]/60 border-b border-r border-slate-200 px-4 py-2 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-center">Visits</th>
//                     <th className="bg-[#f4faeb]/60 border-b border-r border-slate-200 px-4 py-2 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-right">Sales (₹)</th>
//                     <th className="bg-[#f4faeb]/60 border-b border-slate-200 px-4 py-2 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-right">Cash (₹)</th>
//                   </tr>
//                 </thead>

//                 {/* Table Body */}
//                 <tbody>
//                   {filteredData.map((agent, index) => (
//                     <tr key={agent.id} className="hover:bg-slate-50/80 transition-colors group">
                      
//                       {/* Rank Logic */}
//                       <td className="border-b border-r border-slate-200 px-4 py-2.5 text-center text-lg bg-slate-50/30">
//                         {selectedAgentId === 'ALL' && index === 0 ? '🥇' : 
//                          selectedAgentId === 'ALL' && index === 1 ? '🥈' : 
//                          selectedAgentId === 'ALL' && index === 2 ? '🥉' : 
//                          <span className="text-xs font-semibold text-slate-400">{index + 1}</span>}
//                       </td>

//                       <td className="border-b border-r border-slate-200 px-4 py-2.5">
//                         <p className="text-sm font-bold text-slate-800">{agent.name}</p>
//                         <p className="text-[10px] font-semibold text-slate-400">{agent.id}</p>
//                       </td>

//                       <td className="border-b border-r border-slate-200 px-4 py-2.5 text-xs font-medium text-slate-600">
//                         {agent.area || '-'}
//                       </td>

//                       {/* Today Data */}
//                       <td className="border-b border-r border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 text-center">
//                         {agent.visitCount || 0}
//                       </td>
//                       <td className="border-b border-r border-slate-200 px-4 py-2.5 text-sm font-bold text-blue-600 text-right bg-blue-50/10">
//                         {(agent.orderVolume || 0).toLocaleString('en-IN')}
//                       </td>
//                       <td className="border-b border-r border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 text-right">
//                         {(agent.collectionVolume || 0).toLocaleString('en-IN')}
//                       </td>
//                       <td className="border-b border-r border-slate-300 px-4 py-2.5 text-xs font-medium text-slate-500">
//                         {agent.paymentMethod || '-'}
//                       </td>

//                       {/* Monthly Data */}
//                       <td className="border-b border-r border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 text-center bg-[#f4faeb]/20">
//                         {agent.monthlyVisitCount || 0}
//                       </td>
//                       <td className="border-b border-r border-slate-200 px-4 py-2.5 text-sm font-bold text-[#659c12] text-right bg-[#f4faeb]/40">
//                         {(agent.monthlyOrderVolume || 0).toLocaleString('en-IN')}
//                       </td>
//                       <td className="border-b border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 text-right bg-[#f4faeb]/20">
//                         {(agent.monthlyCollectionVolume || 0).toLocaleString('en-IN')}
//                       </td>

//                     </tr>
//                   ))}
//                 </tbody>

//               </table>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

'use client';
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx'; // 🚨 IMPORTED XLSX FOR EXCEL EXPORT

export default function DailySalesTab() {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for Employee Dropdown Filter
  const [selectedAgentId, setSelectedAgentId] = useState('ALL');

  // 🚨 UI STATE: Date Range Export Modal
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportStart, setExportStart] = useState(today);
  const [exportEnd, setExportEnd] = useState(today);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/admin/daily-sales?date=${date}`)
      .then(res => res.json())
      .then(data => {
        setSalesData(data || []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, [date]);

  // Filter data based on dropdown selection
  const filteredData = selectedAgentId === 'ALL' 
    ? salesData 
    : salesData.filter(agent => agent.id === selectedAgentId);

  // Get unique agents for the dropdown
  const uniqueAgents = [...new Set(salesData.map(a => a.id))].map(id => {
    return salesData.find(a => a.id === id);
  });

  // ── EXPORT 1: CURRENT DAILY VIEW (CSV) ──
  const exportToCSV = () => {
    if (filteredData.length === 0) return alert("No data available to export.");

    const headers = [
      "Rank", "Employee Name", "Employee ID", "Area", 
      "Today Visits", "Today Sales (INR)", "Today Cash (INR)", "Payment Method", 
      "Monthly Visits", "Monthly Sales (INR)", "Monthly Cash (INR)"
    ];

    const csvRows = [headers.join(",")];
    
    filteredData.forEach((agent, index) => {
      const row = [
        index + 1,
        `"${agent.name}"`, 
        agent.id,
        `"${agent.area || '-'}"`,
        agent.visitCount || 0,
        agent.orderVolume || 0,
        agent.collectionVolume || 0,
        `"${agent.paymentMethod || '-'}"`,
        agent.monthlyVisitCount || 0,
        agent.monthlyOrderVolume || 0,
        agent.monthlyCollectionVolume || 0
      ];
      csvRows.push(row.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Daily_Sales_Summary_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 🚨 EXPORT 2: DATE RANGE EXPORT (EXCEL)
  const handleRangeExport = async () => {
    if (!exportStart || !exportEnd) return alert("Please select both dates.");
    if (exportStart > exportEnd) return alert("Start Date must be before End Date.");

    setIsExporting(true);
    try {
      const res = await fetch(`/api/admin/daily-sales/export?startDate=${exportStart}&endDate=${exportEnd}&agentId=${selectedAgentId}`);
      if (!res.ok) throw new Error("Export failed");
      
      const rawData = await res.json();

      if (!rawData || rawData.length === 0) {
        alert("No visits found for this date range and selection.");
        setIsExporting(false);
        return;
      }

      // Convert to strict Excel format (.xlsx)
      const ws = XLSX.utils.json_to_sheet(rawData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Visit_Details");
      XLSX.writeFile(wb, `Detailed_Visits_${exportStart}_to_${exportEnd}.xlsx`);

      setShowExportModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to export. Check console for details.");
    } finally {
      setIsExporting(false);
    }
  };

  // Helper function to get initials for modern avatars
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex-1 overflow-y-auto animate-in fade-in duration-500 bg-[#f8fafc] font-sans text-slate-800">
      
      {/* 🚨 MODAL: DATE RANGE SELECTION */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Export Visit Details</h3>
              <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:bg-slate-200 hover:text-slate-700 p-1.5 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Start Date</label>
                <input 
                  type="date" 
                  value={exportStart} 
                  onChange={e => setExportStart(e.target.value)} 
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#97c22a]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">End Date</label>
                <input 
                  type="date" 
                  value={exportEnd} 
                  onChange={e => setExportEnd(e.target.value)} 
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#97c22a]"
                />
              </div>
              <button 
                onClick={handleRangeExport} 
                disabled={isExporting} 
                className="w-full py-3 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
              >
                {isExporting ? 'Generating Excel...' : 'Download Excel Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-12 max-w-7xl mx-auto w-full">
        
        {/* ── MODERN HEADER & FILTERS ── */}
        <div className="bg-white border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-2xl p-5 flex flex-col lg:flex-row lg:items-end justify-between gap-5 transition-all">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 flex-1">
            {/* Date Picker */}
            <div className="flex flex-col w-full sm:w-auto">
              <label className="text-[12px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                Activity Date
              </label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full sm:w-auto border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] font-semibold text-slate-700 outline-none focus:border-[#97c22a] focus:ring-2 focus:ring-[#97c22a]/20 bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer"
              />
            </div>

            {/* Employee Filter */}
            <div className="flex flex-col w-full sm:w-auto">
              <label className="text-[12px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                Sales Representative
              </label>
              <select 
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="w-full sm:w-auto border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] font-semibold text-slate-700 outline-none focus:border-[#97c22a] focus:ring-2 focus:ring-[#97c22a]/20 bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer min-w-[220px]"
              >
                <option value="ALL">All Representatives</option>
                {uniqueAgents.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name} ({agent.id})</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <button 
              onClick={() => { setDate(today); setSelectedAgentId('ALL'); }}
              className="flex-1 lg:flex-none px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 text-[13px] font-bold rounded-xl transition-all shadow-sm"
            >
              Reset
            </button>
            <button 
              onClick={exportToCSV}
              className="flex-1 lg:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-[13px] font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95"
            >
              Export Day (CSV)
            </button>
            <button 
              onClick={() => setShowExportModal(true)}
              className="flex-1 lg:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white border border-transparent text-[13px] font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Export Range
            </button>
          </div>
        </div>

        {/* ── MODERN DATA TABLE ── */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center bg-white border border-slate-200/60 rounded-2xl shadow-sm">
             <div className="w-10 h-10 border-4 border-slate-100 border-t-[#97c22a] rounded-full animate-spin mb-4"></div>
             <p className="text-[13px] font-bold text-slate-400 animate-pulse">Syncing Sales Data...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center bg-white border border-slate-200/60 rounded-2xl shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
            </div>
            <p className="text-[15px] font-semibold text-slate-600">No records found for this selection.</p>
            <p className="text-[13px] text-slate-400 mt-1">Try changing the date or employee filter.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] rounded-2xl overflow-hidden flex flex-col">
            <div className="overflow-x-auto custom-scrollbar">
              
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-white">
                  <tr>
                    <th colSpan="3" className="border-b border-r border-slate-100 bg-white"></th>
                    <th colSpan="4" className="px-4 py-3 text-center border-b border-slate-100 border-r bg-blue-50/30">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/50 text-blue-700 text-[11px] font-bold uppercase tracking-wider">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                       Today - {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </th>
                    <th colSpan="3" className="px-4 py-3 text-center border-b border-slate-100 bg-emerald-50/30">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/50 text-emerald-700 text-[11px] font-bold uppercase tracking-wider">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                        Monthly Total
                      </span>
                    </th>
                  </tr>
                  
                  <tr>
                    <th className="px-5 py-3.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-16 text-center">Rank</th>
                    <th className="px-4 py-3.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Employee</th>
                    <th className="px-4 py-3.5 border-b border-slate-100 border-r text-[11px] font-bold text-slate-400 uppercase tracking-wider">Territory</th>
                    
                    <th className="px-4 py-3.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center bg-blue-50/10">Visits</th>
                    <th className="px-4 py-3.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right bg-blue-50/10">Sales (₹)</th>
                    <th className="px-4 py-3.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right bg-blue-50/10">Cash (₹)</th>
                    <th className="px-4 py-3.5 border-b border-r border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-blue-50/10">Method</th>
                    
                    <th className="px-4 py-3.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center bg-emerald-50/10">Visits</th>
                    <th className="px-4 py-3.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right bg-emerald-50/10">Sales (₹)</th>
                    <th className="px-5 py-3.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right bg-emerald-50/10">Cash (₹)</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((agent, index) => (
                    <tr key={agent.id} className="hover:bg-slate-50/80 transition-colors group">
                      
                      <td className="px-5 py-3 text-center">
                        {index === 0 && selectedAgentId === 'ALL' ? (
                          <div className="w-7 h-7 mx-auto bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-sm shadow-sm ring-2 ring-amber-50">🥇</div>
                        ) : index === 1 && selectedAgentId === 'ALL' ? (
                          <div className="w-7 h-7 mx-auto bg-slate-200 text-slate-600 rounded-full flex items-center justify-center text-sm shadow-sm ring-2 ring-slate-50">🥈</div>
                        ) : index === 2 && selectedAgentId === 'ALL' ? (
                          <div className="w-7 h-7 mx-auto bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-sm shadow-sm ring-2 ring-orange-50">🥉</div>
                        ) : (
                          <span className="text-[13px] font-bold text-slate-400">{index + 1}</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0">
                            {getInitials(agent.name)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[14px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{agent.name}</span>
                            <span className="text-[11px] font-medium text-slate-500">{agent.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 border-r border-slate-100/50">
                        {agent.area ? (
                           <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[12px] font-semibold rounded-lg border border-slate-200/60 inline-block">
                             {agent.area}
                           </span>
                        ) : (
                          <span className="text-slate-300 text-sm">-</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center bg-blue-50/5 group-hover:bg-transparent">
                        <span className="text-[14px] font-bold text-slate-700">{agent.visitCount || 0}</span>
                      </td>
                      <td className="px-4 py-3 text-right bg-blue-50/5 group-hover:bg-transparent">
                        <span className="text-[14px] font-bold text-slate-900 tracking-tight tabular-nums">
                          ₹{(agent.orderVolume || 0).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right bg-blue-50/5 group-hover:bg-transparent">
                        <span className="text-[13px] font-semibold text-slate-500 tabular-nums">
                          ₹{(agent.collectionVolume || 0).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-r border-slate-100/50 bg-blue-50/5 group-hover:bg-transparent">
                        {agent.paymentMethod && agent.paymentMethod !== 'None' ? (
                           <span className="px-2 py-1 bg-white border border-slate-200 text-slate-500 text-[11px] font-bold rounded shadow-sm inline-block">
                             {agent.paymentMethod}
                           </span>
                        ) : (
                          <span className="text-slate-300 text-sm">-</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center bg-emerald-50/10 group-hover:bg-transparent">
                        <span className="text-[14px] font-bold text-slate-700">{agent.monthlyVisitCount || 0}</span>
                      </td>
                      <td className="px-4 py-3 text-right bg-emerald-50/10 group-hover:bg-transparent">
                        <span className="text-[15px] font-black text-[#166534] tracking-tight tabular-nums">
                          ₹{(agent.monthlyOrderVolume || 0).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right bg-emerald-50/10 group-hover:bg-transparent">
                        <span className="text-[13px] font-semibold text-[#166534]/70 tabular-nums">
                          ₹{(agent.monthlyCollectionVolume || 0).toLocaleString('en-IN')}
                        </span>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
              
            </div>
            
            <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-between items-center text-[12px] font-semibold text-slate-500">
               <span>Showing {filteredData.length} records</span>
               <span className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                 Live Data Sync Active
               </span>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}