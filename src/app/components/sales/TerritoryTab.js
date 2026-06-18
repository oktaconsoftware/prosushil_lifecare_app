// 'use client';

// export default function TerritoryTab({ targets, isLoadingRoute, activeTarget, setIsDealModalOpen, initiateCheckIn, totalCommission, setIsRegisterModalOpen }) {
  
//   const groupedTerritory = targets.reduce((acc, target) => {
//     const area = target.areaName || 'Unassigned Area';
//     const place = target.placeName || 'Unassigned Place';
//     if (!acc[area]) acc[area] = {};
//     if (!acc[area][place]) acc[area][place] = [];
//     acc[area][place].push(target);
//     return acc;
//   }, {});

//   return (
//     <div className="flex-1 overflow-y-auto animate-in fade-in duration-200">
//       <div className="p-4 md:p-8 lg:p-10 space-y-6 pb-24 md:pb-10 max-w-4xl mx-auto w-full">

//         <div className="grid grid-cols-2 gap-3 md:gap-5">
//           <div className="relative overflow-hidden p-4 md:p-5 rounded-2xl bg-white" style={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
//             <p className="text-[10px] md:text-[11px] font-semibold tracking-wide mb-1" style={{ color: '#8896aa' }}>Total Assigned Shops</p>
//             <p className="text-lg md:text-2xl font-semibold text-slate-800 tracking-tight leading-none">{targets.length}</p>
//           </div>
//           <div className="relative overflow-hidden p-4 md:p-5 rounded-2xl bg-white" style={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
//             <p className="text-[10px] md:text-[11px] font-semibold tracking-wide mb-1" style={{ color: '#97c22a' }}>Daily commission</p>
//             <p className="text-lg md:text-2xl font-semibold text-slate-800 tracking-tight leading-none">₹{totalCommission.toLocaleString('en-IN')}</p>
//             <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl" style={{ background: '#97c22a' }} />
//           </div>
//         </div>

//         <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-2xl p-4 shadow-sm">
//           <div>
//             <h4 className="text-[13px] font-semibold text-blue-900">Found a new prospect?</h4>
//             <p className="text-[10px] text-blue-600 mt-0.5">Add it to your territory permanently.</p>
//           </div>
//           <button 
//             onClick={() => setIsRegisterModalOpen(true)} 
//             className="px-4 py-2.5 rounded-xl text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-md flex items-center gap-1.5 shrink-0"
//           >
//             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
//             Add New Shop
//           </button>
//         </div>

//         {isLoadingRoute ? (
//           <div className="text-center py-10 text-sm font-medium text-slate-500">Loading your territory...</div>
//         ) : targets.length === 0 ? (
//           <div className="text-center py-10 text-xs text-slate-500">No assigned territory. Use the Area Radar to find shops.</div>
//         ) : (
//           Object.entries(groupedTerritory).map(([areaName, places]) => (
//             <div key={areaName} className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
//               {/* HIGHLIGHTED AREA BANNER */}
//               <div className="bg-[#0a0f1a] rounded-t-2xl p-4 flex items-center gap-3 relative overflow-hidden">
//                 <div className="absolute top-0 right-0 w-32 h-32 bg-[#97c22a]/20 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
//                 <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/5 relative z-10">
//                   <svg className="w-5 h-5 text-[#97c22a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
//                 </div>
//                 <div className="relative z-10">
//                   <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Operating Area</p>
//                   <h3 className="text-lg font-semibold text-white leading-none">{areaName}</h3>
//                 </div>
//               </div>
              
//               {/* PLACES & SHOPS */}
//               <div className="bg-white border border-slate-200 border-t-0 rounded-b-2xl p-4 space-y-4 shadow-sm">
//                 {Object.entries(places).map(([placeName, shops]) => (
//                   <div key={placeName} className="border border-slate-100 rounded-xl overflow-hidden">
                    
//                     {/* Fixed bg-slate-50 here instead of red */}
//                     <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
//                       <span className="font-semibold text-xs text-slate-700">{placeName}</span>
//                       <span className="text-[10px] font-medium bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-500">{shops.length} shops</span>
//                     </div>
                    
//                     <div className="divide-y divide-slate-100">
//                       {shops.map(target => (
//                         <div key={target.id} className="p-4 hover:bg-slate-50/50 transition-colors">
//                           <div className="flex justify-between items-center">
//                             <div>
//                               <h4 className="text-[13px] font-semibold text-slate-800 leading-tight">{target.name}</h4>
//                               <p className="text-[11px] font-medium mt-0.5 text-slate-500">{target.address}</p>
                              
//                               <p className="text-[10px] font-medium mt-1.5" style={{ color: target.status === 'COMPLETED' ? '#97c22a' : '#8896aa' }}>
//                                 {target.lastVisited}
//                               </p>
//                             </div>
                            
//                             {/* THIS IS THE LOGIC THAT HIDES THE BUTTON */}
//                             {target.status === 'COMPLETED' ? (
//                               <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-[#97c22a]/10 text-[#97c22a] border border-[#97c22a]/20">
//                                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg> Visited Today
//                               </span>
//                             ) : (
//                               <button 
//                                 onClick={() => { initiateCheckIn(target); setIsDealModalOpen(true); }} 
//                                 className="px-4 py-2 rounded-xl text-[11px] font-semibold text-white bg-[#0a0f1a] hover:bg-[#97c22a] active:scale-95 transition-all shadow-md flex items-center gap-1.5"
//                               >
//                                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
//                                 Log Visit
//                               </button>
//                             )}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 ))}
//               </div>

//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }

'use client';

export default function TerritoryTab({ targets, isLoadingRoute, activeTarget, setIsDealModalOpen, initiateCheckIn, totalCommission, setIsRegisterModalOpen }) {

  const groupedTerritory = targets.reduce((acc, target) => {
    const area = target.areaName || 'Unassigned Area';
    const place = target.placeName || 'Unassigned Place';
    if (!acc[area]) acc[area] = {};
    if (!acc[area][place]) acc[area][place] = [];
    acc[area][place].push(target);
    return acc;
  }, {});

  const visitedCount = targets.filter(t => t.status === 'COMPLETED').length;
  // Fallback for commission safely handling undefined
  const safeCommission = totalCommission || 0;

  return (
    <div className="flex-1 overflow-y-auto bg-[#F0F2F5]" style={{ WebkitOverflowScrolling: 'touch' }}>
      
      {/* ── RESPONSIVE CONTAINER (7xl for desktop split, full width on mobile) ── */}
      <div className="max-w-7xl mx-auto w-full min-h-full pb-28 lg:pb-12 lg:p-6 lg:pt-8">
        
        {/* CSS Flexbox: Stacks on mobile, Side-by-side on desktop */}
        <div className="flex flex-col lg:flex-row lg:gap-8 items-start">

          {/* =========================================
              LEFT SIDEBAR (Sticky on Desktop)
          ========================================= */}
          <div className="w-full lg:w-[340px] xl:w-[380px] shrink-0 flex flex-col lg:sticky lg:top-6 z-20">
            
            {/* ── TOP STAT STRIP ── */}
            {/* Mobile: touches top and rounds bottom | Desktop: Fully rounded floating card */}
            <div className="bg-[#0A0F1A] px-4 md:px-6 pt-6 pb-8 relative overflow-hidden rounded-none rounded-b-md md:rounded-b-xs shadow-lg">
              {/* Ambient glow */}
              <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(151,194,42,0.18) 0%, transparent 70%)' }} />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(151,194,42,0.08) 0%, transparent 70%)' }} />

              <p className="text-[11px] md:text-xs font-semibold tracking-[0.12em] uppercase text-slate-500 mb-4 relative z-10">My Territory</p>

              <div className="grid grid-cols-3 gap-3 relative z-10">
                {/* Total */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 md:p-4">
                  <p className="text-[9px] md:text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-1.5">Total</p>
                  <p className="text-2xl md:text-3xl font-semibold text-white leading-none">{targets.length}</p>
                  <p className="text-[9px] md:text-[10px] text-slate-500 mt-1">shops</p>
                </div>
                {/* Visited */}
                <div className="bg-[#97C22A]/10 border border-[#97C22A]/20 rounded-2xl p-3 md:p-4">
                  <p className="text-[9px] md:text-[10px] font-semibold tracking-widest uppercase text-[#97C22A]/70 mb-1.5">Visited</p>
                  <p className="text-2xl md:text-3xl font-semibold text-[#97C22A] leading-none">{visitedCount}</p>
                  <p className="text-[9px] md:text-[10px] text-[#97C22A]/60 mt-1">done</p>
                </div>
                {/* Commission */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 md:p-4">
                  <p className="text-[9px] md:text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-1.5">Earned</p>
                  <p className="text-xl md:text-2xl font-semibold text-white leading-none truncate">
                    ₹{safeCommission >= 1000 ? (safeCommission / 1000).toFixed(1) + 'k' : safeCommission.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[9px] md:text-[10px] text-slate-500 mt-1">today</p>
                </div>
              </div>

              {/* Progress bar */}
              {targets.length > 0 && (
                <div className="mt-5 relative z-10">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] md:text-[11px] font-medium text-slate-400">{visitedCount} of {targets.length} completed</span>
                    <span className="text-[10px] md:text-[11px] font-semibold text-[#97C22A]">{Math.round((visitedCount / targets.length) * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${targets.length > 0 ? (visitedCount / targets.length) * 100 : 0}%`, background: 'linear-gradient(90deg, #97C22A, #b5e03a)' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ── ADD NEW PROSPECT CARD ── */}
            {/* Mobile: Negative margin to overlap header | Desktop: Standard gap */}
            <div className="px-4 md:px-6 lg:px-0 -mt-4 lg:mt-6 relative z-10 mb-2 lg:mb-0">
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="w-full flex items-center justify-between bg-white lg:border lg:border-slate-200 rounded-2xl px-4 py-4 active:scale-[0.98] transition-all hover:shadow-lg hover:border-blue-200"
                style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-[13px] md:text-[15px] font-semibold text-slate-800">Add New Shop</p>
                    <p className="text-[10px] md:text-[12px] font-medium text-slate-400 mt-0.5">Found a new prospect? Add it.</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>
          </div>

          {/* =========================================
              RIGHT MAIN CONTENT (Feed)
          ========================================= */}
          <div className="flex-1 min-w-0 w-full px-4 md:px-6 lg:px-0 pt-3 lg:pt-0 space-y-5">

            {isLoadingRoute ? (
              <div className="flex flex-col items-center justify-center py-20 lg:py-32 lg:bg-white lg:rounded-3xl lg:border lg:border-slate-200 gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-[#97C22A] border-t-transparent animate-spin" />
                <p className="text-sm font-semibold text-slate-400">Loading your territory…</p>
              </div>

            ) : targets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 lg:py-32 lg:bg-white lg:rounded-3xl lg:border lg:border-slate-200 gap-3 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-2">
                  <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-[16px] font-semibold text-slate-700">No Territory Assigned</p>
                <p className="text-[12px] md:text-[13px] text-slate-400 max-w-[240px]">Use the Area Radar to discover and claim shops near you.</p>
              </div>

            ) : (
              Object.entries(groupedTerritory).map(([areaName, places], areaIndex) => {
                const safeAreaName = areaName || 'Unassigned';
                const areaInitial = safeAreaName.charAt(0).toUpperCase();
                const allAreaShops = Object.values(places).flat();
                const areaVisited = allAreaShops.filter(s => s.status === 'COMPLETED').length;

                return (
                  <div key={safeAreaName} className="animate-in fade-in slide-in-from-bottom-3 duration-300" style={{ animationDelay: `${areaIndex * 60}ms` }}>

                    {/* AREA ZONE HEADER */}
                    <div className="rounded-2xl lg:rounded-3xl overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                      <div className="relative bg-[#0A0F1A] px-4 py-4 md:py-5 flex items-center gap-3 overflow-hidden">
                        {/* Large ghost initial */}
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[72px] font-semibold text-white/[0.03] leading-none select-none pointer-events-none">{areaInitial}</span>
                        
                        {/* Green left stripe */}
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#97C22A]" />

                        <div className="w-10 h-10 rounded-xl bg-[#97C22A]/15 border border-[#97C22A]/20 flex items-center justify-center shrink-0 ml-2">
                          <svg className="w-4.5 h-4.5 text-[#97C22A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                        </div>

                        <div className="flex-1 min-w-0 relative z-10">
                          <p className="text-[9px] md:text-[10px] font-semibold tracking-widest uppercase text-slate-500">Area</p>
                          <h3 className="text-[15px] md:text-[17px] font-semibold text-white truncate leading-snug">{safeAreaName}</h3>
                        </div>

                        <div className="text-right relative z-10 shrink-0">
                          <p className="text-[18px] md:text-[20px] font-semibold text-white leading-none">{areaVisited}<span className="text-[12px] md:text-[13px] text-slate-500 font-medium">/{allAreaShops.length}</span></p>
                          <p className="text-[9px] md:text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-wider">Visited</p>
                        </div>
                      </div>

                      {/* PLACES */}
                      <div className="bg-white divide-y divide-slate-100/80 border border-slate-100 border-t-0 rounded-b-2xl lg:rounded-b-3xl">
                        {Object.entries(places).map(([placeName, shops]) => (
                          <div key={placeName}>

                            {/* Place sub-header */}
                            <div className="flex items-center justify-between px-4 lg:px-6 py-3 bg-slate-50/50">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                <span className="text-[11px] md:text-[12px] font-semibold text-slate-500 uppercase tracking-wider">{placeName}</span>
                              </div>
                              <span className="text-[9px] md:text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-sm">
                                {shops.filter(s => s.status === 'COMPLETED').length}/{shops.length}
                              </span>
                            </div>

                            {/* Shop rows */}
                            <div className="divide-y divide-slate-50">
                              {shops.map(target => (
                                <div key={target.id} className="px-4 lg:px-6 py-4 md:py-5 flex items-center gap-3 md:gap-4 hover:bg-slate-50/80 transition-colors">

                                  {/* Status dot */}
                                  <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full shrink-0 ${target.status === 'COMPLETED' ? 'bg-[#97C22A] shadow-[0_0_8px_rgba(151,194,42,0.4)]' : 'bg-slate-200'}`} />

                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-[13px] md:text-[15px] font-semibold text-slate-800 truncate leading-snug">{target.name}</h4>
                                    <p className="text-[11px] md:text-[12px] font-medium text-slate-400 truncate mt-0.5">{target.address}</p>
                                    {target.lastVisited && (
                                      <p className="text-[10px] md:text-[11px] font-semibold mt-1.5 flex items-center gap-1" style={{ color: target.status === 'COMPLETED' ? '#97C22A' : '#94a3b8' }}>
                                        {target.lastVisited}
                                      </p>
                                    )}
                                  </div>

                                  {/* Action */}
                                  {target.status === 'COMPLETED' ? (
                                    <div className="shrink-0 flex items-center gap-1.5 bg-[#97C22A]/10 border border-[#97C22A]/20 rounded-xl px-3 py-2">
                                      <svg className="w-3.5 h-3.5 text-[#97C22A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                      </svg>
                                      <span className="text-[10px] md:text-[11px] font-semibold text-[#97C22A] uppercase tracking-wider">Done</span>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => { initiateCheckIn(target); setIsDealModalOpen(true); }}
                                      className="shrink-0 flex items-center gap-1.5 bg-[#0A0F1A] hover:bg-[#97C22A] active:scale-95 rounded-xl px-3.5 py-2.5 transition-all shadow-md shadow-slate-900/10 group cursor-pointer"
                                    >
                                      <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#97C22A] group-hover:text-[#0A0F1A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                      </svg>
                                      <span className="text-[11px] md:text-[12px] font-semibold text-white group-hover:text-[#0A0F1A] transition-colors">Log</span>
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>

                          </div>
                        ))}
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}