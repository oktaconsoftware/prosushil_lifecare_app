// 'use client';
// import { useState, useEffect } from 'react';

// export default function DailyReportTab({ team }) {
//   const today = new Date().toISOString().split('T')[0];
//   const [date, setDate] = useState(today);
//   const [selectedAgentId, setSelectedAgentId] = useState('');
//   const [reportData, setReportData] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     if (team.length > 0 && !selectedAgentId) setSelectedAgentId(team[0].id);
//   }, [team]);

//   useEffect(() => {
//     if (!selectedAgentId || !date) return;
    
//     setIsLoading(true);
//     fetch(`/api/admin/reports?agentId=${selectedAgentId}&date=${date}`)
//       .then(res => res.json())
//       .then(data => {
//         if (data && data.summary) {
//           setReportData(data);
//         } else {
//           setReportData(null);
//         }
//         setIsLoading(false);
//       })
//       .catch(err => {
//         console.error("Report Fetch Error:", err);
//         setReportData(null);
//         setIsLoading(false);
//       });
//   }, [selectedAgentId, date]);

//   const activeAgent = team.find(a => a.id === selectedAgentId);

//   return (
//     <div className="flex-1 overflow-y-auto animate-in fade-in duration-200">
//       <div className="p-4 md:p-8 lg:p-10 space-y-6 max-w-5xl mx-auto w-full pb-24 md:pb-10">
        
//         {/* ── CONTROLS ── */}
//         <div className="bg-white rounded-2xl p-5 md:p-6" style={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
//           <h3 className="text-[13px] md:text-base font-semibold text-slate-800 mb-4">Report Parameters</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-[11px] font-semibold text-slate-500 tracking-wide mb-1.5">Select Date</label>
//               <input 
//                 type="date" 
//                 value={date} 
//                 onChange={(e) => setDate(e.target.value)}
//                 className="w-full px-3.5 py-3 rounded-xl text-sm font-medium text-slate-800 outline-none transition-all"
//                 style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }}
//               />
//             </div>
//             <div>
//               <label className="block text-[11px] font-semibold text-slate-500 tracking-wide mb-1.5">Select Sales Agent</label>
//               <select 
//                 value={selectedAgentId} 
//                 onChange={(e) => setSelectedAgentId(e.target.value)}
//                 className="w-full px-3.5 py-3 rounded-xl text-sm font-medium text-slate-800 outline-none transition-all appearance-none"
//                 style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
//               >
//                 {team.length === 0 ? <option value="">No agents available</option> : null}
//                 {team.map(agent => (
//                   <option key={agent.id} value={agent.id}>{agent.name} ({agent.id})</option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>

//         {isLoading ? (
//           <div className="flex items-center justify-center py-20 gap-3">
//             <svg className="animate-spin w-5 h-5" style={{ color: '#97c22a' }} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
//             <span className="text-sm font-medium text-slate-400">Querying database...</span>
//           </div>
//         ) : reportData && reportData.summary ? (
//           <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            
//             {/* ── HEADER ── */}
//             <div className="flex items-center gap-3 mb-2">
//               <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold" style={{ background: 'rgba(151,194,42,0.15)', color: '#5a8a10', border: '1px solid rgba(151,194,42,0.2)' }}>
//                 {activeAgent?.name?.split(' ').map(w => w[0]).join('').slice(0, 2) || 'AG'}
//               </div>
//               <div>
//                 <h2 className="text-xl font-semibold text-slate-800 tracking-tight">{activeAgent?.name || 'Agent'}</h2>
//                 <p className="text-xs font-medium text-slate-500">Viewing Data for • {new Date(date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
//               </div>
//             </div>

//             {/* ── MONTHLY ATTENDANCE & PERFORMANCE BOARD ── */}
//             <div className="bg-[#0a0f1a] rounded-2xl p-5 md:p-6 text-white relative overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
//               <div className="absolute top-0 right-0 w-32 h-32 bg-[#97c22a] rounded-full blur-[80px] opacity-20 pointer-events-none -mr-10 -mt-10"></div>
              
//               <h3 className="text-[13px] md:text-[14px] font-semibold mb-5 text-slate-300 flex items-center gap-2">
//                 <svg className="w-4 h-4 text-[#97c22a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
//                 Monthly Attendance & Overview
//               </h3>
              
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
//                 <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
//                   <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-1">Present Days</p>
//                   <p className="text-2xl font-bold text-[#97c22a]">{reportData.monthlySummary?.presentDays || 0}</p>
//                   <p className="text-[9px] text-slate-500 mt-1">≥ 10 visits logged</p>
//                 </div>
//                 <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
//                   <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-1">Absent Days</p>
//                   <p className="text-2xl font-bold text-[#e73e43]">{reportData.monthlySummary?.absentDays || 0}</p>
//                   <p className="text-[9px] text-slate-500 mt-1">&lt; 10 visits logged</p>
//                 </div>
//                 <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
//                   <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-1">Monthly Orders</p>
//                   <p className="text-xl font-bold text-white">₹{(reportData.monthlySummary?.totalOrderValue || 0).toLocaleString('en-IN')}</p>
//                   <p className="text-[9px] text-slate-500 mt-1">Total Pipeline</p>
//                 </div>
//                 <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
//                   <p className="text-[9px] uppercase tracking-widest text-[#97c22a] mb-1">Monthly Collection</p>
//                   <p className="text-xl font-bold text-white">₹{(reportData.monthlySummary?.totalCollection || 0).toLocaleString('en-IN')}</p>
//                   <p className="text-[9px] text-slate-500 mt-1">Total Cash Picked</p>
//                 </div>
//               </div>
//             </div>

//             {/* ── DAILY SUMMARY CARDS ── */}
//             <h3 className="text-[13px] md:text-base font-semibold text-slate-800 mb-2 mt-8">Daily Snapshot ({new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})</h3>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
//               <div className="bg-white p-4 rounded-2xl" style={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
//                 <p className="text-[10px] font-semibold tracking-wide text-slate-400 mb-1">Visits Today</p>
//                 <p className="text-xl font-semibold text-slate-800">{reportData.summary?.completedVisits || 0}</p>
//               </div>
//               <div className="bg-white p-4 rounded-2xl" style={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
//                 <p className="text-[10px] font-semibold tracking-wide text-slate-400 mb-1">Daily Orders</p>
//                 <p className="text-xl font-semibold text-slate-800">₹{(reportData.summary?.totalOrderValue || 0).toLocaleString('en-IN')}</p>
//               </div>
//               <div className="bg-white p-4 rounded-2xl border-b-2" style={{ border: '1px solid #e9edf2', borderBottomColor: '#97c22a', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
//                 <p className="text-[10px] font-semibold tracking-wide text-[#97c22a] mb-1">Daily Collection</p>
//                 <p className="text-xl font-semibold text-slate-800">₹{(reportData.summary?.totalCollection || 0).toLocaleString('en-IN')}</p>
//               </div>
//               <div className="bg-white p-4 rounded-2xl border-b-2" style={{ border: '1px solid #e9edf2', borderBottomColor: reportData.summary?.deviations > 0 ? '#e73e43' : '#e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
//                 <p className="text-[10px] font-semibold tracking-wide text-slate-400 mb-1">Protocol Deviations</p>
//                 <p className="text-xl font-semibold" style={{ color: reportData.summary?.deviations > 0 ? '#e73e43' : '#64748b' }}>{reportData.summary?.deviations || 0}</p>
//               </div>
//             </div>

//             {/* ── DAILY TIMELINE ── */}
//             <div className="bg-white rounded-2xl p-5 md:p-8" style={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
//               <h3 className="text-[13px] md:text-base font-semibold text-slate-800 mb-6">Daily Chronological Ledger</h3>
              
//               {!reportData.timeline || reportData.timeline.length === 0 ? (
//                 <div className="text-center py-10 text-sm text-slate-500 border border-dashed border-slate-200 rounded-xl">No visits logged on this date.</div>
//               ) : (
//                 <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100">
//                   {reportData.timeline.map((stop, idx) => (
//                     <div key={idx} className="relative flex items-start gap-4">
//                       <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 shadow-sm z-10 
//                         ${stop.status === 'error' ? 'text-[#e73e43] bg-[#e73e43]/10' : stop.status === 'success' ? 'text-[#97c22a] bg-[#97c22a]/10' : 'text-slate-500 bg-slate-100'}`}
//                       >
//                         {stop.status === 'error' ? (
//                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
//                         ) : (
//                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
//                         )}
//                       </div>

//                       <div className="flex-1 bg-slate-50/50 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
//                         <div className="flex items-center justify-between mb-1">
//                           <h4 className="text-[13px] font-semibold text-slate-800 leading-tight">{stop.title}</h4>
//                           <span className="text-[10px] font-bold tracking-wide" style={{ color: stop.status === 'error' ? '#e73e43' : '#8896aa' }}>{stop.time}</span>
//                         </div>
//                         <p className="text-[11px] font-medium text-slate-500 mt-0.5">{stop.location}</p>
                        
//                         {stop.status === 'error' && stop.errorNote && (
//                           <div className="mt-2 p-2 rounded-lg bg-[#e73e43]/5 border border-[#e73e43]/10">
//                             <p className="text-[10px] font-medium text-[#e73e43] leading-relaxed">{stop.errorNote}</p>
//                           </div>
//                         )}

//                         {stop.details && (
//                           <div className="mt-3 pt-3 border-t border-slate-200">
//                             <div className="flex justify-between items-center text-[10px] font-semibold mb-2">
//                               <span className="text-slate-500">Method: <span className="text-slate-700">{stop.details.paymentMethod}</span></span>
                              
//                               <div className="flex gap-4">
//                                 {stop.details.order > 0 ? (
//                                   <span style={{ color: '#97c22a' }}>Ord: ₹{(stop.details.order || 0).toLocaleString('en-IN')}</span>
//                                 ) : (
//                                   <span className="text-slate-400">No Ord.</span>
//                                 )}
                                
//                                 {stop.details.collection > 0 ? (
//                                   <span style={{ color: '#3b82f6' }}>Col: ₹{(stop.details.collection || 0).toLocaleString('en-IN')}</span>
//                                 ) : (
//                                   <span className="text-slate-400">No Col.</span>
//                                 )}
//                               </div>
//                             </div>
//                             {stop.details.note && (
//                               <p className="text-[10px] text-slate-500 italic mt-1">"{stop.details.note}"</p>
//                             )}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         ) : (
//           <div className="bg-white rounded-2xl p-10 text-center" style={{ border: '1px solid #e9edf2' }}>
//             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
//                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
//             </div>
//             <h3 className="text-sm font-bold text-slate-700">No Data Available</h3>
//             <p className="text-xs text-slate-500 mt-1">There is no report data for {activeAgent?.name} on this date.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// 'use client';
// import { useState, useEffect } from 'react';

// // 🚨 FIX: Force the "Today" calculation to strictly use Indian Standard Time (IST)
// const getTodayIST = () => {
//   const d = new Date();
//   const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' });
//   return formatter.format(d); // Always returns accurate YYYY-MM-DD in India
// };

// export default function DailyReportTab({ team }) {
//   const [date, setDate] = useState(getTodayIST());
//   const [selectedAgentId, setSelectedAgentId] = useState('');
//   const [reportData, setReportData] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     if (team.length > 0 && !selectedAgentId) setSelectedAgentId(team[0].id);
//   }, [team]);

//   useEffect(() => {
//     if (!selectedAgentId || !date) return;
    
//     setIsLoading(true);
    
//     // Cache-busting timestamp to bypass Next.js cache
//     fetch(`/api/admin/reports?agentId=${selectedAgentId}&date=${date}&t=${Date.now()}`, {
//       cache: 'no-store',
//       headers: {
//         'Pragma': 'no-cache',
//         'Cache-Control': 'no-cache, no-store, must-revalidate'
//       }
//     })
//       .then(res => res.json())
//       .then(data => {
//         if (data && data.summary) {
//           setReportData(data);
//         } else {
//           setReportData(null);
//         }
//         setIsLoading(false);
//       })
//       .catch(err => {
//         console.error("Report Fetch Error:", err);
//         setReportData(null);
//         setIsLoading(false);
//       });
//   }, [selectedAgentId, date]);

//   const activeAgent = team.find(a => a.id === selectedAgentId);

//   return (
//     <div className="flex-1 overflow-y-auto animate-in fade-in duration-200">
//       <div className="p-4 md:p-8 lg:p-10 space-y-6 max-w-5xl mx-auto w-full pb-24 md:pb-10">
        
//         {/* ── CONTROLS ── */}
//         <div className="bg-white rounded-2xl p-5 md:p-6" style={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
//           <h3 className="text-[13px] md:text-base font-semibold text-slate-800 mb-4">Report Parameters</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-[11px] font-semibold text-slate-500 tracking-wide mb-1.5">Select Date</label>
//               <input 
//                 type="date" 
//                 value={date} 
//                 onChange={(e) => setDate(e.target.value)}
//                 className="w-full px-3.5 py-3 rounded-xl text-sm font-medium text-slate-800 outline-none transition-all"
//                 style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }}
//               />
//             </div>
//             <div>
//               <label className="block text-[11px] font-semibold text-slate-500 tracking-wide mb-1.5">Select Sales Agent</label>
//               <select 
//                 value={selectedAgentId} 
//                 onChange={(e) => setSelectedAgentId(e.target.value)}
//                 className="w-full px-3.5 py-3 rounded-xl text-sm font-medium text-slate-800 outline-none transition-all appearance-none"
//                 style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
//               >
//                 {team.length === 0 ? <option value="">No agents available</option> : null}
//                 {team.map(agent => (
//                   <option key={agent.id} value={agent.id}>{agent.name} ({agent.id})</option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>

//         {isLoading ? (
//           <div className="flex items-center justify-center py-20 gap-3">
//             <svg className="animate-spin w-5 h-5" style={{ color: '#97c22a' }} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
//             <span className="text-sm font-medium text-slate-400">Querying database...</span>
//           </div>
//         ) : reportData && reportData.summary ? (
//           <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            
//             {/* ── HEADER ── */}
//             <div className="flex items-center gap-3 mb-2">
//               <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold" style={{ background: 'rgba(151,194,42,0.15)', color: '#5a8a10', border: '1px solid rgba(151,194,42,0.2)' }}>
//                 {activeAgent?.name?.split(' ').map(w => w[0]).join('').slice(0, 2) || 'AG'}
//               </div>
//               <div>
//                 <h2 className="text-xl font-semibold text-slate-800 tracking-tight">{activeAgent?.name || 'Agent'}</h2>
//                 <p className="text-xs font-medium text-slate-500">Viewing Data for • {new Date(date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
//               </div>
//             </div>

//             {/* ── MONTHLY ATTENDANCE & PERFORMANCE BOARD ── */}
//             <div className="bg-[#0a0f1a] rounded-2xl p-5 md:p-6 text-white relative overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
//               <div className="absolute top-0 right-0 w-32 h-32 bg-[#97c22a] rounded-full blur-[80px] opacity-20 pointer-events-none -mr-10 -mt-10"></div>
              
//               <h3 className="text-[13px] md:text-[14px] font-semibold mb-5 text-slate-300 flex items-center gap-2">
//                 <svg className="w-4 h-4 text-[#97c22a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
//                 Monthly Attendance & Overview
//               </h3>
              
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
//                 <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
//                   <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-1">Present Days</p>
//                   <p className="text-2xl font-bold text-[#97c22a]">{reportData.monthlySummary?.presentDays || 0}</p>
//                   <p className="text-[9px] text-slate-500 mt-1">≥ 10 visits logged</p>
//                 </div>
//                 <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
//                   <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-1">Absent Days</p>
//                   <p className="text-2xl font-bold text-[#e73e43]">{reportData.monthlySummary?.absentDays || 0}</p>
//                   <p className="text-[9px] text-slate-500 mt-1">&lt; 10 visits logged</p>
//                 </div>
//                 <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
//                   <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-1">Monthly Orders</p>
//                   <p className="text-xl font-bold text-white">₹{(reportData.monthlySummary?.totalOrderValue || 0).toLocaleString('en-IN')}</p>
//                   <p className="text-[9px] text-slate-500 mt-1">Total Pipeline</p>
//                 </div>
//                 <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
//                   <p className="text-[9px] uppercase tracking-widest text-[#97c22a] mb-1">Monthly Collection</p>
//                   <p className="text-xl font-bold text-white">₹{(reportData.monthlySummary?.totalCollection || 0).toLocaleString('en-IN')}</p>
//                   <p className="text-[9px] text-slate-500 mt-1">Total Cash Picked</p>
//                 </div>
//               </div>
//             </div>

//             {/* ── DAILY SUMMARY CARDS ── */}
//             <h3 className="text-[13px] md:text-base font-semibold text-slate-800 mb-2 mt-8">Daily Snapshot ({new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})</h3>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
//               <div className="bg-white p-4 rounded-2xl" style={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
//                 <p className="text-[10px] font-semibold tracking-wide text-slate-400 mb-1">Visits Today</p>
//                 <p className="text-xl font-semibold text-slate-800">{reportData.summary?.completedVisits || 0}</p>
//               </div>
//               <div className="bg-white p-4 rounded-2xl" style={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
//                 <p className="text-[10px] font-semibold tracking-wide text-slate-400 mb-1">Daily Orders</p>
//                 <p className="text-xl font-semibold text-slate-800">₹{(reportData.summary?.totalOrderValue || 0).toLocaleString('en-IN')}</p>
//               </div>
//               <div className="bg-white p-4 rounded-2xl border-b-2" style={{ border: '1px solid #e9edf2', borderBottomColor: '#97c22a', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
//                 <p className="text-[10px] font-semibold tracking-wide text-[#97c22a] mb-1">Daily Collection</p>
//                 <p className="text-xl font-semibold text-slate-800">₹{(reportData.summary?.totalCollection || 0).toLocaleString('en-IN')}</p>
//               </div>
//               <div className="bg-white p-4 rounded-2xl border-b-2" style={{ border: '1px solid #e9edf2', borderBottomColor: reportData.summary?.deviations > 0 ? '#e73e43' : '#e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
//                 <p className="text-[10px] font-semibold tracking-wide text-slate-400 mb-1">Protocol Deviations</p>
//                 <p className="text-xl font-semibold" style={{ color: reportData.summary?.deviations > 0 ? '#e73e43' : '#64748b' }}>{reportData.summary?.deviations || 0}</p>
//               </div>
//             </div>

//             {/* ── DAILY TIMELINE ── */}
//             <div className="bg-white rounded-2xl p-5 md:p-8" style={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
//               <h3 className="text-[13px] md:text-base font-semibold text-slate-800 mb-6">Daily Chronological Ledger</h3>
              
//               {!reportData.timeline || reportData.timeline.length === 0 ? (
//                 <div className="text-center py-10 text-sm text-slate-500 border border-dashed border-slate-200 rounded-xl">No visits logged on this date.</div>
//               ) : (
//                 <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100">
//                   {reportData.timeline.map((stop, idx) => (
//                     <div key={idx} className="relative flex items-start gap-4">
//                       <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 shadow-sm z-10 
//                         ${stop.status === 'error' ? 'text-[#e73e43] bg-[#e73e43]/10' : stop.status === 'success' ? 'text-[#97c22a] bg-[#97c22a]/10' : 'text-slate-500 bg-slate-100'}`}
//                       >
//                         {stop.status === 'error' ? (
//                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
//                         ) : (
//                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
//                         )}
//                       </div>

//                       <div className="flex-1 bg-slate-50/50 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
//                         <div className="flex items-center justify-between mb-1">
//                           <h4 className="text-[13px] font-semibold text-slate-800 leading-tight">{stop.title}</h4>
//                           <span className="text-[10px] font-bold tracking-wide" style={{ color: stop.status === 'error' ? '#e73e43' : '#8896aa' }}>{stop.time}</span>
//                         </div>
//                         <p className="text-[11px] font-medium text-slate-500 mt-0.5">{stop.location}</p>
                        
//                         {stop.status === 'error' && stop.errorNote && (
//                           <div className="mt-2 p-2 rounded-lg bg-[#e73e43]/5 border border-[#e73e43]/10">
//                             <p className="text-[10px] font-medium text-[#e73e43] leading-relaxed">{stop.errorNote}</p>
//                           </div>
//                         )}

//                         {stop.details && (
//                           <div className="mt-3 pt-3 border-t border-slate-200">
//                             <div className="flex justify-between items-center text-[10px] font-semibold mb-2">
//                               <span className="text-slate-500">Method: <span className="text-slate-700">{stop.details.paymentMethod}</span></span>
                              
//                               <div className="flex gap-4">
//                                 {stop.details.order > 0 ? (
//                                   <span style={{ color: '#97c22a' }}>Ord: ₹{(stop.details.order || 0).toLocaleString('en-IN')}</span>
//                                 ) : (
//                                   <span className="text-slate-400">No Ord.</span>
//                                 )}
                                
//                                 {stop.details.collection > 0 ? (
//                                   <span style={{ color: '#3b82f6' }}>Col: ₹{(stop.details.collection || 0).toLocaleString('en-IN')}</span>
//                                 ) : (
//                                   <span className="text-slate-400">No Col.</span>
//                                 )}
//                               </div>
//                             </div>
//                             {stop.details.note && (
//                               <p className="text-[10px] text-slate-500 italic mt-1">"{stop.details.note}"</p>
//                             )}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         ) : (
//           <div className="bg-white rounded-2xl p-10 text-center" style={{ border: '1px solid #e9edf2' }}>
//             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
//                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
//             </div>
//             <h3 className="text-sm font-bold text-slate-700">No Data Available</h3>
//             <p className="text-xs text-slate-500 mt-1">There is no report data for {activeAgent?.name} on this date.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



'use client';
import { useState, useEffect } from 'react';

// 🚨 FIX: Force the "Today" calculation to strictly use Indian Standard Time (IST)
const getTodayIST = () => {
  const d = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' });
  return formatter.format(d); // Always returns accurate YYYY-MM-DD in India
};

export default function DailyReportTab({ team }) {
  const [date, setDate] = useState(getTodayIST());
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // 🚨 UI STATE: Lightbox & Verification
  const [selectedImage, setSelectedImage] = useState(null);
  const [verifyingShopId, setVerifyingShopId] = useState(null);

  // 🚨 FIX: Ensure we use employeeId if it exists
  useEffect(() => {
    if (team.length > 0 && !selectedAgentId) {
      setSelectedAgentId(team[0].employeeId || team[0].id);
    }
  }, [team]);

  useEffect(() => {
    if (!selectedAgentId || !date) return;
    
    setIsLoading(true);
    
    // Cache-busting timestamp to bypass Next.js cache
    fetch(`/api/admin/reports?agentId=${selectedAgentId}&date=${date}&t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.summary) {
          setReportData(data);
        } else {
          setReportData(null);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Report Fetch Error:", err);
        setReportData(null);
        setIsLoading(false);
      });
  }, [selectedAgentId, date]);

  // 🚨 VERIFICATION HANDLER: Hits the POST endpoint and updates UI instantly
  const handleVerifyShop = async (shopId, photoUrlToSave) => {
    if (!shopId) return;
    setVerifyingShopId(shopId);
    
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId, visitPhotoUrl: photoUrlToSave }) // Pass photo here
      });
      
      if (res.ok) {
        // ✨ OPTIMISTIC UI UPDATE: Instantly change it to "Verified" on the screen
        setReportData(prev => {
          if (!prev || !prev.timeline) return prev;
          const newTimeline = prev.timeline.map(stop => {
            if (stop.shopId === shopId) {
              return { 
                ...stop, 
                isVerified: true,
                details: {
                  ...stop.details,
                  // Instantly show the second photo on the frontend without refreshing!
                  photoUrl2: photoUrlToSave || stop.details.photoUrl2
                }
              };
            }
            return stop;
          });
          return { ...prev, timeline: newTimeline };
        });
      }
    } catch (err) {
      console.error("Failed to verify:", err);
    }
    
    setVerifyingShopId(null);
  };

  const activeAgent = team.find(a => (a.employeeId || a.id).toString() === selectedAgentId.toString());

  // Helper to close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto animate-in fade-in duration-200 relative">
      
      {/* 🚨 FULL-SCREEN IMAGE LIGHTBOX MODAL */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-10 cursor-zoom-out animate-in fade-in zoom-in-95 duration-200"
          onClick={() => setSelectedImage(null)} // Click anywhere to close
        >
          <div className="relative max-w-5xl max-h-full w-full h-full flex items-center justify-center">
            <button 
              className="absolute top-2 right-2 md:-top-4 md:-right-4 text-white bg-white/20 hover:bg-white/40 rounded-full p-2.5 transition-all cursor-pointer z-50 backdrop-blur-sm"
              onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <img 
              src={selectedImage} 
              alt="Expanded view" 
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl cursor-default border border-white/10"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}

      <div className="p-4 md:p-8 lg:p-10 space-y-6 max-w-5xl mx-auto w-full pb-24 md:pb-10">
        
        {/* ── CONTROLS ── */}
        <div className="bg-white rounded-2xl p-5 md:p-6" style={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <h3 className="text-[13px] md:text-base font-semibold text-slate-800 mb-4">Report Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 tracking-wide mb-1.5">Select Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl text-sm font-medium text-slate-800 outline-none transition-all focus:ring-2 focus:ring-[#97c22a]/50 border-transparent focus:border-transparent bg-[#f8fafc]"
                style={{ border: '1.5px solid #e2e8f0' }}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 tracking-wide mb-1.5">Select Sales Agent</label>
              <select 
                value={selectedAgentId} 
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl text-sm font-medium text-slate-800 outline-none transition-all appearance-none focus:ring-2 focus:ring-[#97c22a]/50 bg-[#f8fafc]"
                style={{ border: '1.5px solid #e2e8f0', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
              >
                {team.length === 0 ? <option value="">No agents available</option> : null}
                {team.map(agent => (
                  <option key={agent.id} value={agent.employeeId || agent.id}>
                    {agent.name} ({agent.employeeId || agent.id})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <svg className="animate-spin w-5 h-5" style={{ color: '#97c22a' }} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            <span className="text-sm font-medium text-slate-400">Querying database...</span>
          </div>
        ) : reportData && reportData.summary ? (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            
            {/* ── HEADER ── */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold shadow-sm" style={{ background: 'rgba(151,194,42,0.15)', color: '#5a8a10', border: '1px solid rgba(151,194,42,0.2)' }}>
                {activeAgent?.name?.split(' ').map(w => w[0]).join('').slice(0, 2) || 'AG'}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-800 tracking-tight">{activeAgent?.name || 'Agent'}</h2>
                <p className="text-xs font-medium text-slate-500">Viewing Data for • {new Date(date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            {/* ── MONTHLY ATTENDANCE & PERFORMANCE BOARD ── */}
            <div className="bg-[#0a0f1a] rounded-2xl p-5 md:p-6 text-white relative overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#97c22a] rounded-full blur-[80px] opacity-20 pointer-events-none -mr-10 -mt-10"></div>
              
              <h3 className="text-[13px] md:text-[14px] font-semibold mb-5 text-slate-300 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#97c22a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                Monthly Attendance & Overview
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                  <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-1">Present Days</p>
                  <p className="text-2xl font-bold text-[#97c22a]">{reportData.monthlySummary?.presentDays || 0}</p>
                  <p className="text-[9px] text-slate-500 mt-1">≥ 10 visits logged</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                  <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-1">Absent Days</p>
                  <p className="text-2xl font-bold text-[#e73e43]">{reportData.monthlySummary?.absentDays || 0}</p>
                  <p className="text-[9px] text-slate-500 mt-1">&lt; 10 visits logged</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                  <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-1">Monthly Orders</p>
                  <p className="text-xl font-bold text-white">₹{(reportData.monthlySummary?.totalOrderValue || 0).toLocaleString('en-IN')}</p>
                  <p className="text-[9px] text-slate-500 mt-1">Total Pipeline</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                  <p className="text-[9px] uppercase tracking-widest text-[#97c22a] mb-1">Monthly Collection</p>
                  <p className="text-xl font-bold text-white">₹{(reportData.monthlySummary?.totalCollection || 0).toLocaleString('en-IN')}</p>
                  <p className="text-[9px] text-slate-500 mt-1">Total Cash Picked</p>
                </div>
              </div>
            </div>

            {/* ── DAILY SUMMARY CARDS ── */}
            <h3 className="text-[13px] md:text-base font-semibold text-slate-800 mb-2 mt-8">Daily Snapshot ({new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-white p-4 rounded-2xl transition-shadow hover:shadow-md" style={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <p className="text-[10px] font-semibold tracking-wide text-slate-400 mb-1">Visits Today</p>
                <p className="text-xl font-semibold text-slate-800">{reportData.summary?.completedVisits || 0}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl transition-shadow hover:shadow-md" style={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <p className="text-[10px] font-semibold tracking-wide text-slate-400 mb-1">Daily Orders</p>
                <p className="text-xl font-semibold text-slate-800">₹{(reportData.summary?.totalOrderValue || 0).toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border-b-2 transition-shadow hover:shadow-md" style={{ border: '1px solid #e9edf2', borderBottomColor: '#97c22a', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <p className="text-[10px] font-semibold tracking-wide text-[#97c22a] mb-1">Daily Collection</p>
                <p className="text-xl font-semibold text-slate-800">₹{(reportData.summary?.totalCollection || 0).toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border-b-2 transition-shadow hover:shadow-md" style={{ border: '1px solid #e9edf2', borderBottomColor: reportData.summary?.deviations > 0 ? '#e73e43' : '#e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <p className="text-[10px] font-semibold tracking-wide text-slate-400 mb-1">Protocol Deviations</p>
                <p className="text-xl font-semibold" style={{ color: reportData.summary?.deviations > 0 ? '#e73e43' : '#64748b' }}>{reportData.summary?.deviations || 0}</p>
              </div>
            </div>

            {/* ── DAILY TIMELINE ── */}
            <div className="bg-white rounded-2xl p-5 md:p-8" style={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <h3 className="text-[13px] md:text-base font-semibold text-slate-800 mb-6">Daily Chronological Ledger</h3>
              
              {!reportData.timeline || reportData.timeline.length === 0 ? (
                <div className="text-center py-10 text-sm text-slate-500 border border-dashed border-slate-200 rounded-xl">No visits logged on this date.</div>
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100">
                  {reportData.timeline.map((stop, idx) => (
                    <div key={idx} className="relative flex items-start gap-4 group">
                      
                      {/* Timeline Dot */}
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 shadow-sm z-10 transition-transform group-hover:scale-110 
                        ${stop.status === 'error' ? 'text-[#e73e43] bg-[#e73e43]/10' : stop.status === 'success' ? 'text-[#97c22a] bg-[#97c22a]/10' : 'text-slate-500 bg-slate-100'}`}
                      >
                        {stop.status === 'error' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        )}
                      </div>

                      {/* Content Card */}
                      <div className="flex-1 bg-slate-50/50 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors overflow-hidden hover:shadow-sm">
                        
                        {/* 🚨 TITLE & VERIFY BUTTON HEADER */}
                        <div className="flex items-start justify-between mb-1 gap-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-[14px] font-bold text-slate-800 leading-tight">{stop.title}</h4>
                            
                            {/* Verify Badge / Button */}
                            {stop.shopId && (
                              stop.isVerified ? (
                                <span className="bg-[#97c22a]/10 text-[#7a9d22] text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#97c22a]/20">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                  Verified
                                </span>
                              ) : (
                                <button 
                                  onClick={() => handleVerifyShop(stop.shopId, stop.details.photoUrl)}
                                  disabled={verifyingShopId === stop.shopId}
                                  className="bg-red-500 hover:bg-green-600 text-white text-[10px] font-bold cursor-pointer px-3 py-1 rounded-full transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                                >
                                  {verifyingShopId === stop.shopId ? (
                                    <>
                                      <svg className="animate-spin w-3 h-3 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                      Verifying...
                                    </>
                                  ) : (
                                    'Verify Shop'
                                  )}
                                </button>
                              )
                            )}
                          </div>
                          <span className="text-[10px] font-bold tracking-wide shrink-0 whitespace-nowrap mt-0.5" style={{ color: stop.status === 'error' ? '#e73e43' : '#8896aa' }}>
                            {stop.time}
                          </span>
                        </div>
                        
                        <p className="text-[11.5px] font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                          {stop.location}
                        </p>
                        
                        {stop.status === 'error' && stop.errorNote && (
                          <div className="mt-3 p-2.5 rounded-lg bg-[#e73e43]/5 border border-[#e73e43]/10 flex items-start gap-2">
                            <svg className="w-4 h-4 text-[#e73e43] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            <p className="text-[11px] font-semibold text-[#e73e43] leading-relaxed">{stop.errorNote}</p>
                          </div>
                        )}

                        {stop.details && (
                          <div className="mt-4 pt-3 border-t border-slate-200">
                            <div className="flex flex-wrap justify-between items-center text-[11px] font-semibold mb-2 gap-2">
                              <span className="text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-100 shadow-sm">
                                Method: <span className="text-slate-800">{stop.details.paymentMethod}</span>
                              </span>
                              
                              <div className="flex gap-3">
                                <div className="bg-white px-3 py-1 rounded-md border border-slate-100 shadow-sm flex items-center gap-1.5">
                                  <span className="text-slate-400">Ord:</span>
                                  {stop.details.order > 0 ? (
                                    <span className="text-[#97c22a] font-bold">₹{(stop.details.order || 0).toLocaleString('en-IN')}</span>
                                  ) : (
                                    <span className="text-slate-400 font-medium">-</span>
                                  )}
                                </div>
                                
                                <div className="bg-white px-3 py-1 rounded-md border border-slate-100 shadow-sm flex items-center gap-1.5">
                                  <span className="text-slate-400">Col:</span>
                                  {stop.details.collection > 0 ? (
                                    <span className="text-[#3b82f6] font-bold">₹{(stop.details.collection || 0).toLocaleString('en-IN')}</span>
                                  ) : (
                                    <span className="text-slate-400 font-medium">-</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {stop.details.note && (
                              <p className="text-[11px] text-slate-500 italic mt-2 bg-slate-100/50 p-2 rounded-md border-l-2 border-slate-300">"{stop.details.note}"</p>
                            )}

                            {/* IMAGE GALLERY WITH LIGHTBOX */}
                            {(stop.details.photoUrl || stop.details.photoUrl2) && (
                              <div className="mt-4 flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                                {stop.details.photoUrl && (
                                  <button 
                                    onClick={() => setSelectedImage(stop.details.photoUrl)}
                                    className="relative block shrink-0 group rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:ring-2 hover:ring-[#97c22a] hover:shadow-md transition-all cursor-zoom-in"
                                  >
                                    <img 
                                      src={stop.details.photoUrl} 
                                      alt="Visit photo 1" 
                                      className="w-20 h-20 object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
                                    </div>
                                  </button>
                                )}
                                
                                {stop.details.photoUrl2 && (
                                  <button 
                                    onClick={() => setSelectedImage(stop.details.photoUrl2)}
                                    className="relative block shrink-0 group rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:ring-2 hover:ring-[#97c22a] hover:shadow-md transition-all cursor-zoom-in"
                                  >
                                    <img 
                                      src={stop.details.photoUrl2} 
                                      alt="Visit photo 2" 
                                      className="w-20 h-20 object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
                                    </div>
                                  </button>
                                )}
                              </div>
                            )}
                            
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm" style={{ border: '1px solid #e9edf2' }}>
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner">
               <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            </div>
            <h3 className="text-base font-bold text-slate-800">No Data Available</h3>
            <p className="text-[13px] font-medium text-slate-500 mt-1 max-w-sm mx-auto">There are no visits or reports logged for {activeAgent?.name} on this date.</p>
          </div>
        )}
      </div>
    </div>
  );
}