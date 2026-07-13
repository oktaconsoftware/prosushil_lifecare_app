// 'use client';
// import { useState, useEffect } from 'react';

// export default function DailySalesTab() {
//   const today = new Date().toISOString().split('T')[0];
//   const [date, setDate] = useState(today);
//   const [salesData, setSalesData] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

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

//   const totalCompanyVolume = salesData.reduce((sum, a) => sum + a.orderVolume, 0);
//   const totalCompanyVisits = salesData.reduce((sum, a) => sum + a.visitCount, 0);

//   return (
//     <div className="flex-1 overflow-y-auto animate-in fade-in duration-300 bg-slate-50">
//       <div className="p-4 md:p-8 lg:p-10 space-y-6 md:space-y-8 pb-24 md:pb-10 max-w-5xl mx-auto w-full">
        
//         {/* ── HEADER & DATE PICKER ── */}
//         <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
//           <div>
//             <h3 className="text-[15px] md:text-lg font-bold text-slate-800 tracking-tight">Team Performance</h3>
//             <p className="text-[11px] text-slate-500 mt-1">Daily overview of visits and sales volume.</p>
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

//         {/* ── COMPANY SUMMARY ── */}
//         <div className="bg-[#0a0f1a] rounded-[24px] md:rounded-[32px] p-6 md:p-10 relative overflow-hidden shadow-xl">
//           <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#97c22a]/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          
//           <div className="relative z-10 grid grid-cols-2 gap-6 items-center">
//             <div>
//               <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1.5">Total Company Volume</p>
//               <h3 className="text-3xl md:text-5xl font-bold text-white tracking-tight">₹{totalCompanyVolume.toLocaleString('en-IN')}</h3>
//             </div>
//             <div className="border-l border-white/10 pl-6 md:pl-8">
//               <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1.5">Total Field Visits</p>
//               <h3 className="text-3xl md:text-4xl font-bold text-[#97c22a] tracking-tight">{totalCompanyVisits}</h3>
//             </div>
//           </div>
//         </div>

//         {/* ── AGENT LIST ── */}
//         {isLoading ? (
//           <div className="py-20 flex flex-col items-center justify-center">
//              <div className="w-8 h-8 border-4 border-slate-200 border-t-[#97c22a] rounded-full animate-spin mb-3"></div>
//              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Loading Performance Data...</p>
//           </div>
//         ) : salesData.length === 0 ? (
//           <p className="text-center text-slate-500 py-10">No agents found in the system.</p>
//         ) : (
//           <div className="space-y-4">
//             {salesData.map((agent, index) => (
//               <div key={agent.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-transform hover:-translate-y-1 duration-300">
                
//                 {/* Agent Identity */}
//                 <div className="flex items-center gap-4">
//                   <div className="relative">
//                     <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm border border-slate-200 shrink-0">
//                       {agent.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
//                     </div>
//                     {/* Top 3 Trophies */}
//                     {index === 0 && <div className="absolute -top-2 -right-2 text-xl filter drop-shadow-sm">🥇</div>}
//                     {index === 1 && <div className="absolute -top-2 -right-2 text-xl filter drop-shadow-sm">🥈</div>}
//                     {index === 2 && <div className="absolute -top-2 -right-2 text-xl filter drop-shadow-sm">🥉</div>}
//                   </div>
//                   <div>
//                     <h4 className="text-[15px] font-bold text-slate-800">{agent.name}</h4>
//                     <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{agent.id}</p>
//                   </div>
//                 </div>

//                 {/* Metrics Grid */}
//                 <div className="grid grid-cols-3 gap-3 md:gap-6 w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
//                   <div className="text-center md:text-right bg-slate-50 md:bg-transparent rounded-lg p-2 md:p-0">
//                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Visits</p>
//                     <p className="text-[15px] font-bold text-slate-800">{agent.visitCount}</p>
//                   </div>
//                   <div className="text-center md:text-right bg-slate-50 md:bg-transparent rounded-lg p-2 md:p-0">
//                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Collection</p>
//                     <p className="text-[15px] font-bold text-slate-800">₹{agent.collectionVolume.toLocaleString('en-IN')}</p>
//                   </div>
//                   <div className="text-center md:text-right bg-[#97c22a]/5 md:bg-transparent rounded-lg p-2 md:p-0">
//                     <p className="text-[9px] font-bold text-[#659c12] uppercase tracking-widest mb-1">Total Sales</p>
//                     <p className="text-[15px] font-bold text-[#659c12]">₹{agent.orderVolume.toLocaleString('en-IN')}</p>
//                   </div>
//                 </div>

//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
'use client';
import { useState, useEffect } from 'react';

export default function DailySalesTab() {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🚨 NEW: State for Employee Dropdown Filter
  const [selectedAgentId, setSelectedAgentId] = useState('ALL');

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

  // 🚨 NEW: Filter data based on dropdown selection
  const filteredData = selectedAgentId === 'ALL' 
    ? salesData 
    : salesData.filter(agent => agent.id === selectedAgentId);

  return (
    <div className="flex-1 overflow-y-auto animate-in fade-in duration-300 bg-slate-50">
      <div className="p-4 md:p-8 lg:p-10 space-y-6 md:space-y-8 pb-24 md:pb-10 max-w-5xl mx-auto w-full">
        
        {/* ── HEADER & DATE PICKER ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h3 className="text-[15px] md:text-lg font-bold text-slate-800 tracking-tight">Team Performance</h3>
            <p className="text-[11px] text-slate-500 mt-1">Select a date to view Today vs Monthly performance.</p>
          </div>
          
          <div className="w-full md:w-56">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Select Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-[#F0F2F5] border border-[#E2E8F0] rounded-xl text-[13px] font-bold text-[#1E293B] outline-none transition-all cursor-pointer"
            />
          </div>
        </div>

        {/* ── EMPLOYEE FILTER (DARK HERO CARD) ── */}
        <div className="bg-[#0a0f1a] rounded-xl p-6 md:p-8 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#97c22a]/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-[#97c22a] uppercase mb-1.5">Employee Filter</p>
              <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">View Specific Agent</h3>
            </div>
            
            <div className="w-full md:w-72 shrink-0">
              <select 
                value={selectedAgentId} 
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="w-full px-4 py-3.5 bg-white/10 border border-white/20 text-white rounded-xl text-[13px] font-bold outline-none transition-all appearance-none cursor-pointer focus:border-[#97c22a] focus:bg-white/15"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2397c22a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.2rem center', backgroundSize: '1.2em' }}
              >
                <option value="ALL" className="text-slate-900 bg-white">All Employees</option>
                {salesData.map(agent => (
                  <option key={agent.id} value={agent.id} className="text-slate-900 bg-white">
                    {agent.name} ({agent.id})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── AGENT LIST (EMPLOYEE-WISE DAILY VS MONTHLY) ── */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
             <div className="w-8 h-8 border-4 border-slate-200 border-t-[#97c22a] rounded-full animate-spin mb-3"></div>
             <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Loading Employee Data...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <p className="text-center text-slate-500 py-10">No agents found for this selection.</p>
        ) : (
          <div className="space-y-5">
            {filteredData.map((agent, index) => (
              <div key={agent.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden transition-transform hover:-translate-y-1 duration-300">
                
                {/* Agent Identity Header */}
                <div className="p-4 flex items-center gap-4 bg-slate-50/50 border-b border-slate-100 relative">
                  {/* Top 3 Trophies (Only show if viewing ALL) */}
                  {selectedAgentId === 'ALL' && index === 0 && <div className="absolute top-4 right-4 text-2xl filter drop-shadow-sm">🥇</div>}
                  {selectedAgentId === 'ALL' && index === 1 && <div className="absolute top-4 right-4 text-2xl filter drop-shadow-sm">🥈</div>}
                  {selectedAgentId === 'ALL' && index === 2 && <div className="absolute top-4 right-4 text-2xl filter drop-shadow-sm">🥉</div>}
                  
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-600 font-bold text-[13px] border border-slate-200 shrink-0 shadow-sm">
                    {agent.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-slate-800 leading-tight">{agent.name}</h4>
                    <p className="text-[10px] font-bold tracking-wider text-slate-400 mt-0.5">{agent.id}</p>
                  </div>
                </div>

                {/* Split Metrics Grid (Daily | Monthly) */}
                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  
                  {/* ── TODAY'S PERFORMANCE ── */}
                  <div className="flex-1 p-5 relative">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-blue-100 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">Today</span>
                      <span className="text-[10px] font-semibold text-slate-400">{new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Visits</p>
                        <p className="text-[15px] font-bold text-slate-800">{agent.visitCount || 0}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cash</p>
                        <p className="text-[15px] font-bold text-slate-800">₹{(agent.collectionVolume || 0).toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-[#3b82f6] uppercase tracking-widest mb-1">Sales</p>
                        <p className="text-[15px] font-bold text-[#3b82f6]">₹{(agent.orderVolume || 0).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>

                  {/* ── MONTHLY TILL DATE ── */}
                  <div className="flex-1 p-5 bg-[#fcfdfa] relative">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-[#97c22a]/20 text-[#659c12] text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">This Month</span>
                      <span className="text-[10px] font-semibold text-slate-400">Till Date</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Vis</p>
                        <p className="text-[15px] font-bold text-slate-800">{agent.monthlyVisitCount || 0}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Cash</p>
                        <p className="text-[15px] font-bold text-slate-800">₹{(agent.monthlyCollectionVolume || 0).toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-[#97c22a] uppercase tracking-widest mb-1">Total Sales</p>
                        <p className="text-[15px] font-bold text-[#97c22a]">₹{(agent.monthlyOrderVolume || 0).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}