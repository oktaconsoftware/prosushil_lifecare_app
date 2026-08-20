// 'use client';
// import { useState, useEffect } from 'react';
// import dynamic from 'next/dynamic';

// // 🚨 CRITICAL FIX: Load the map dynamically so Next.js doesn't crash on the server
// const MapWrapper = dynamic(() => import('./MapWrapper'), {
//   ssr: false,
//   loading: () => (
//     <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 rounded-3xl animate-pulse">
//       <div className="w-8 h-8 border-4 border-slate-300 border-t-[#97c22a] rounded-full animate-spin mb-3"></div>
//       <p className="text-[13px] font-bold text-slate-500">Loading Map Engine...</p>
//     </div>
//   )
// });

// // 🚨 TIMEZONE FIX: Helper to accurately get YYYY-MM-DD in Local Time (IST), NOT UTC!
// const getLocalYYYYMMDD = (dateInput) => {
//   const d = dateInput ? new Date(dateInput) : new Date();
//   const year = d.getFullYear();
//   const month = String(d.getMonth() + 1).padStart(2, '0');
//   const day = String(d.getDate()).padStart(2, '0');
//   return `${year}-${month}-${day}`;
// };

// export default function EmployeeMapTab() {
//   // Use the new local time helper instead of .toISOString()
//   const [selectedDate, setSelectedDate] = useState(''); 
//   const [agents, setAgents] = useState([]);
//   const [selectedAgentId, setSelectedAgentId] = useState('');
//   const [visits, setVisits] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isFetchingVisits, setIsFetchingVisits] = useState(false);

//   // Set initial date on mount to prevent Next.js Hydration Mismatch errors
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

//   // 2. Fetch visits whenever an agent is selected
//   useEffect(() => {
//     if (!selectedAgentId) {
//       setVisits([]);
//       return;
//     }

//     setIsFetchingVisits(true);
//     fetch(`/api/admin/employee-map?agentId=${selectedAgentId}`)
//       .then(res => res.json())
//       .then(data => {
//         setVisits(data.visits || []);
//         setIsFetchingVisits(false);
//       })
//       .catch(err => {
//         console.error(err);
//         setIsFetchingVisits(false);
//       });
//   }, [selectedAgentId]);

//   // 🚨 FILTER LOGIC: Now accurately comparing IST dates
//   const filteredVisits = visits.filter(visit => {
//     if (!visit.time || !selectedDate) return false;
//     const visitDate = getLocalYYYYMMDD(visit.time);
//     return visitDate === selectedDate;
//   });

//   const validPinsCount = filteredVisits.filter(v => v.latitude && v.longitude).length;

//   return (
//     <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 animate-in fade-in duration-300">
//       <div className="p-4 md:p-8 lg:p-10 w-full h-full flex flex-col max-w-7xl mx-auto gap-6">
        
//         {/* ── HERO HEADER & DROPDOWN ── */}
//         <div className="bg-[#0a0f1a] rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl shrink-0">
//           <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#97c22a]/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          
//           <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
//             <div>
//               <p className="text-[10px] font-bold tracking-widest text-[#97c22a] uppercase mb-1.5">Geographic Tracking</p>
//               <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">Day-Wise Route Map</h3>
//             </div>
            
//             <div className="flex flex-col sm:flex-row w-full lg:w-auto shrink-0 gap-3">
//               {/* 🚨 DATE PICKER */}
//               <input 
//                 type="date"
//                 value={selectedDate}
//                 onChange={(e) => setSelectedDate(e.target.value)}
//                 className="w-full sm:w-44 px-4 py-3.5 bg-white/10 border border-white/20 text-white rounded-xl text-[14px] font-bold outline-none transition-all cursor-pointer focus:border-[#97c22a] focus:bg-white/15"
//               />

//               <select 
//                 value={selectedAgentId} 
//                 onChange={(e) => setSelectedAgentId(e.target.value)}
//                 className="w-full sm:w-72 px-4 py-3.5 bg-white/10 border border-white/20 text-white rounded-xl text-[14px] font-bold outline-none transition-all appearance-none cursor-pointer focus:border-[#97c22a] focus:bg-white/15"
//                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2397c22a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.2rem center', backgroundSize: '1.2em' }}
//               >
//                 <option value="" disabled className="text-slate-500 bg-white">Select an Employee...</option>
//                 {agents.map(agent => (
//                   <option key={agent.id} value={agent.employeeId || agent.id} className="text-slate-900 bg-white">
//                     {agent.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* ── MAP CONTAINER ── */}
//         <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative min-h-[400px]">
          
//           {/* Floating Status Badge */}
//           {selectedAgentId && selectedDate && (
//             <div className="absolute top-4 right-4 z-[20] bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-slate-200 flex items-center gap-3">
//               <div className={`w-2.5 h-2.5 rounded-full ${validPinsCount > 0 ? 'bg-[#97c22a] animate-pulse' : 'bg-red-500'}`}></div>
//               <p className="text-[12px] font-bold text-slate-700">
//                 {isFetchingVisits ? 'Plotting pins...' : `${validPinsCount} Pinned on ${new Date(selectedDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`}
//               </p>
//             </div>
//           )}

//           {!selectedAgentId ? (
//             <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50">
//               <div className="w-16 h-16 rounded-3xl bg-[#97C22A]/10 flex items-center justify-center mb-4 border border-[#97C22A]/20">
//                 <svg className="w-8 h-8 text-[#5c7a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//                 </svg>
//               </div>
//               <p className="text-[16px] font-bold text-slate-800">Map Standby</p>
//               <p className="text-[13px] font-medium text-slate-500 mt-1 max-w-sm">
//                 Select an employee from the dropdown above to load their physical visit history.
//               </p>
//             </div>
//           ) : (
//             /* Pass the FILTERED visits to the map */
//             <MapWrapper visits={filteredVisits} />
//           )}

//         </div>
//       </div>
//     </div>
//   );
// }



'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Load the map dynamically so Next.js doesn't crash on the server
const MapWrapper = dynamic(() => import('./MapWrapper'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 rounded-2xl md:rounded-3xl animate-pulse min-h-[300px]">
      <div className="w-8 h-8 border-4 border-slate-300 border-t-[#97c22a] rounded-full animate-spin mb-3"></div>
      <p className="text-[13px] font-bold text-slate-500">Loading Map Engine...</p>
    </div>
  )
});

// Helper to accurately get YYYY-MM-DD in Local Time (IST)
const getLocalYYYYMMDD = (dateInput) => {
  const d = dateInput ? new Date(dateInput) : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function EmployeeMapTab() {
  const [selectedDate, setSelectedDate] = useState(''); 
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [visits, setVisits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingVisits, setIsFetchingVisits] = useState(false);

  useEffect(() => {
    setSelectedDate(getLocalYYYYMMDD());
  }, []);

  // 1. Fetch the list of agents on load
  useEffect(() => {
    fetch('/api/admin/employee-map')
      .then(res => res.json())
      .then(data => {
        setAgents(data.agents || []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  // 2. FETCH VISITS (Triggered when Agent OR Date changes)
  useEffect(() => {
    if (!selectedAgentId || !selectedDate) {
      setVisits([]);
      return;
    }

    setIsFetchingVisits(true);
    
    // Pass BOTH agentId and Date to the backend
    fetch(`/api/admin/employee-map?agentId=${selectedAgentId}&date=${selectedDate}`)
      .then(res => res.json())
      .then(data => {
        // Convert the string numbers to real floats so the Map doesn't break
        const sanitizedVisits = (data.visits || []).map(v => ({
          ...v,
          latitude: parseFloat(v.latitude),
          longitude: parseFloat(v.longitude),
          orderAmount: parseFloat(v.orderAmount) || 0,
          collectionAmount: parseFloat(v.collectionAmount) || 0
        }));
        
        setVisits(sanitizedVisits);
        setIsFetchingVisits(false);
      })
      .catch(err => {
        console.error(err);
        setIsFetchingVisits(false);
      });
  }, [selectedAgentId, selectedDate]);

  // Valid pins count checking
  const validPinsCount = visits.filter(v => v.latitude && !isNaN(v.latitude) && v.longitude && !isNaN(v.longitude)).length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F4F6F8] animate-in fade-in duration-300">
      {/* 🚨 RESPONSIVE PADDING: Small on mobile, large on desktop */}
      <div className="p-3 sm:p-5 md:p-8 lg:p-10 w-full h-full flex flex-col max-w-7xl mx-auto gap-4 md:gap-6 overflow-y-auto custom-scrollbar">
        
        {/* ── HERO HEADER & CONTROLS ── */}
        <div className="bg-[#0a0f1a] rounded-2xl md:rounded-3xl p-5 md:p-8 relative overflow-hidden shadow-xl shrink-0">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-[150px] md:w-[200px] h-[150px] md:h-[200px] bg-[#97c22a]/20 rounded-full blur-[50px] md:blur-[60px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 md:gap-6">
            
            {/* Title Section */}
            <div className="text-left">
              <p className="text-[10px] md:text-[11px] font-bold tracking-widest text-[#97c22a] uppercase mb-1 md:mb-1.5">Geographic Tracking</p>
              <h3 className="text-[18px] md:text-2xl font-bold text-white tracking-tight">Day-Wise Route Map</h3>
            </div>
            
            {/* 🚨 RESPONSIVE CONTROLS: Stacked on mobile, row on tablet/desktop */}
            <div className="flex flex-col sm:flex-row w-full lg:w-auto shrink-0 gap-3">
              
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-44 px-4 py-3 md:py-3.5 bg-white/10 border border-white/20 text-white rounded-xl text-[14px] font-bold outline-none transition-all cursor-pointer focus:border-[#97c22a] focus:bg-white/15"
              />

              <select 
                value={selectedAgentId} 
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="w-full sm:w-64 lg:w-72 px-4 py-3 md:py-3.5 bg-white/10 border border-white/20 text-white rounded-xl text-[14px] font-bold outline-none transition-all appearance-none cursor-pointer focus:border-[#97c22a] focus:bg-white/15"
                style={{ 
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2397c22a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, 
                  backgroundRepeat: 'no-repeat', 
                  backgroundPosition: 'right 1.2rem center', 
                  backgroundSize: '1.2em' 
                }}
              >
                <option value="" disabled className="text-slate-500 bg-white">Select an Employee...</option>
                {agents.map(agent => {
                  const displayAgentName = agent.name || agent.fullName || agent.username || agent.first_name || 'Unknown Agent';
                  return (
                    <option key={agent.id} value={agent.employeeId || agent.id} className="text-slate-900 bg-white">
                      {displayAgentName}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* ── MAP CONTAINER ── */}
        {/* 🚨 RESPONSIVE MAP HEIGHT: Minimum 60vh on mobile to prevent squishing, flex-1 on desktop */}
        <div className="flex-1 bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative min-h-[60vh] md:min-h-0 flex flex-col z-0">
          
          {/* Floating Status Badge (Responsive positioning) */}
          {selectedAgentId && selectedDate && (
            <div className="absolute top-3 right-3 md:top-4 md:right-4 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl shadow-lg border border-slate-200 flex items-center gap-2.5 max-w-[calc(100%-24px)]">
              <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full shrink-0 ${validPinsCount > 0 ? 'bg-[#97c22a] animate-pulse' : 'bg-red-500'}`}></div>
              <p className="text-[11px] md:text-[12px] font-bold text-slate-700 truncate">
                {isFetchingVisits 
                  ? 'Plotting pins...' 
                  : `${validPinsCount} Pinned on ${new Date(selectedDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`}
              </p>
            </div>
          )}

          {/* Map Empty State */}
          {!selectedAgentId ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/50">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-[#97C22A]/10 flex items-center justify-center mb-3 md:mb-4 border border-[#97C22A]/20">
                <svg className="w-7 h-7 md:w-8 md:h-8 text-[#5c7a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-[15px] md:text-[16px] font-bold text-slate-800">Map Standby</p>
              <p className="text-[12px] md:text-[13px] font-medium text-slate-500 mt-1 max-w-xs md:max-w-sm px-4">
                Select an employee from the dropdown above to load their physical visit history.
              </p>
            </div>
          ) : (
            <MapWrapper visits={visits} />
          )}

        </div>
      </div>
    </div>
  );
}