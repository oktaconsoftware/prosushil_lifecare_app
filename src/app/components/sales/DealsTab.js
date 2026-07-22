

// 'use client';
// import { useState, useEffect } from 'react';

// export default function DealsTab({ targets }) {
//   const [selectedArea, setSelectedArea] = useState('');
//   const [isMounted, setIsMounted] = useState(false);

//   // Grab today's date and format it beautifully (e.g., "Wed, 8 Jul 2026")
//   const todayDate = new Date().toLocaleDateString('en-IN', {
//     weekday: 'short',
//     day: 'numeric',
//     month: 'short',
//     year: 'numeric'
//   });

//   useEffect(() => {
//     setIsMounted(true);
    
//     const checkSelectedArea = () => {
//       const savedArea = localStorage.getItem('assignedSalesArea');
//       if (savedArea && savedArea !== selectedArea) {
//         setSelectedArea(savedArea);
//       }
//     };

//     checkSelectedArea();
//     const interval = setInterval(checkSelectedArea, 500);
//     return () => clearInterval(interval);
//   }, [selectedArea]);

//   const safeTargets = Array.isArray(targets) ? targets : [];
//   const areaShops = safeTargets.filter((shop) => shop.areaName === selectedArea);
  
//   const completedDeals = areaShops.filter((shop) => shop.status === 'COMPLETED');
//   const pendingShops = areaShops.filter((shop) => shop.status !== 'COMPLETED');

//   const completedCount = completedDeals.length;
//   const totalCount = areaShops.length;
//   const totalPipeline = completedDeals.reduce((sum, shop) => sum + (Number(shop.orderAmount) || 0), 0);
  
//   const totalCollection = completedDeals.reduce((sum, shop) => {
//     const shopCollection = Number(shop.Collection) || (Number(shop.orderAmount) * 0.08);
//     return sum + shopCollection;
//   }, 0);

//   // ── NEW: CALCULATE PAYMENT METHOD METHODOLOGIES ──
//   const paymentBreakdown = completedDeals.reduce(
//     (acc, shop) => {
//       const amt = Number(shop.orderAmount) || 0;
//       // Match key safely regardless of capitalization (cash, upi, cheque, credit)
//       const method = String(shop.paymentMethod || shop.paymentType || '').toLowerCase().trim();
      
//       if (method === 'cash') acc.cash += amt;
//       else if (method === 'upi') acc.upi += amt;
//       else if (method === 'cheque') acc.cheque += amt;
//       else if (method === 'credit') acc.credit += amt;
//       else acc.cash += amt; // Default fallback to cash safety configuration
//       return acc;
//     },
//     { cash: 0, upi: 0, cheque: 0, credit: 0 }
//   );

//   if (!isMounted) return null;

//   return (
//     <div className="flex-1 overflow-y-auto bg-[#F0F2F5]" style={{ WebkitOverflowScrolling: 'touch' }}>

//       {/* ── STICKY HEADER ── */}
//       <div className="sticky top-0 z-30 bg-slate-100 px-6 py-3 flex items-center justify-between shadow-md">
//         <div>
//           <p className="text-sm font-semibold text-slate-500">
//             {selectedArea || 'Field Sales'} • {todayDate}
//           </p>
//           <p className="text-lg font-bold text-slate-800 mt-0.5">Today's Route</p>
//         </div>
//         <div
//           className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
//           style={{ background: 'rgba(151,194,42,0.10)', border: '1px solid rgba(151,194,42,0.2)' }}
//         >
//           <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#97C22A' }} />
//           <span className="text-sm font-semibold" style={{ color: '#d65703' }}>
//             Live
//           </span>
//         </div>
//       </div>

//       <div className="max-w-2xl mx-auto w-full px-4 lg:px-6 pt-5 pb-28 space-y-4">

//         {/* ── PIPELINE & COLLECTION HERO CARD ── */}
//         <div
//           className="bg-[#0A0F1A] rounded-2xl p-5 relative overflow-hidden"
//           style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.18)' }}
//         >
//           <div
//             className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full pointer-events-none"
//             style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.10) 0%, transparent 70%)' }}
//           />
        
//           <div className="relative z-10 pl-2">
//             <p className="text-xs font-bold tracking-widest uppercase text-slate-500 mb-1">Total Pipeline</p>
//             <p className="text-2xl font-bold text-white leading-none">
//               ₹{totalPipeline.toLocaleString('en-IN')}
//             </p>

//             <div className="mt-4 pt-4 flex items-center gap-5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
//               <div>
//                 <p className="text-xs font-bold tracking-widest uppercase text-slate-500 mb-1">Collection</p>
//                 <p className="text-base font-bold leading-none" style={{ color: '#97C22A' }}>
//                   ₹{Math.round(totalCollection).toLocaleString('en-IN')}
//                 </p>
//               </div>

//               <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.08)' }} />

//               <div>
//                 <p className="text-xs font-bold tracking-widest uppercase text-slate-500 mb-1">Route Progress</p>
//                 <p className="text-base font-bold text-white leading-none">
//                   {completedCount} <span className="text-slate-500 text-xs">/ {totalCount}</span>
//                 </p>
//               </div>

//               <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.08)' }} />

//               <div>
//                 <p className="text-xs font-bold tracking-widest uppercase text-slate-500 mb-1">Avg Order</p>
//                 <p className="text-base font-bold text-slate-300 leading-none">
//                   ₹{completedCount > 0
//                     ? Math.round(totalPipeline / completedCount).toLocaleString('en-IN')
//                     : 0}
//                 </p>
//               </div>
//             </div>

//     {/* ── NEW: DYNAMIC PAYMENT SUMMARY ROW (Light Theme) ── */}
//             <div className="mt-5 pt-5 grid grid-cols-4 gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              
//               {/* Cash Card */}
//               <div className="bg-slate-50 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-sm border border-slate-200/50">
//                 <p className="text-[11px] font-semibold text-slate-500 mb-1.5">💵 Cash</p>
//                 <p className="text-[13px] font-bold text-slate-900 leading-none tracking-tight">
//                   ₹{paymentBreakdown.cash.toLocaleString('en-IN')}
//                 </p>
//               </div>

//               {/* UPI Card */}
//               <div className="bg-slate-50 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-sm border border-slate-200/50">
//                 <p className="text-[11px] font-semibold  text-slate-500 mb-1.5">📱 UPI</p>
//                 <p className="text-[13px] font-bold text-slate-900 leading-none tracking-tight">
//                   ₹{paymentBreakdown.upi.toLocaleString('en-IN')}
//                 </p>
//               </div>

//               {/* Cheque Card */}
//               <div className="bg-slate-50 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-sm border border-slate-200/50">
//                 <p className="text-[11px] font-semibold text-slate-500 mb-1.5">🏦 Cheque</p>
//                 <p className="text-[13px] font-bold text-slate-900 leading-none tracking-tight">
//                   ₹{paymentBreakdown.cheque.toLocaleString('en-IN')}
//                 </p>
//               </div>

//               {/* Credit Card (Highlighted) */}
//               <div className="bg-amber-50 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-sm border border-amber-200">
//                 <p className="text-[11px] font-semibold t  text-amber-600 mb-1.5">⏳ Credit</p>
//                 <p className="text-[13px] font-bold text-amber-900 leading-none tracking-tight">
//                   ₹{paymentBreakdown.credit.toLocaleString('en-IN')}
//                 </p>
//               </div>

//             </div>

//           </div>
//         </div>

//         {/* ── SHOPS SECTION ── */}
//         <div
//           className="bg-white rounded-2xl overflow-hidden"
//           style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0' }}
//         >
//           <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
//             <p className="text-xs font-bold tracking-widest uppercase text-slate-500">Today's Shop List</p>
//             <p className="text-xs font-bold tracking-widest uppercase text-slate-400">
//               {totalCount} total
//             </p>
//           </div>

//           {totalCount === 0 ? (
//             <div className="py-14 flex flex-col items-center text-center px-6">
//               <div
//                 className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3"
//                 style={{ background: '#F0F2F5', border: '1px solid #E2E8F0' }}
//               >
//                 <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                 </svg>
//               </div>
//               <p className="text-sm font-bold text-slate-800">
//                 {!safeTargets.length ? "Loading shop data..." : "No shops available"}
//               </p>
//               <p className="text-xs font-semibold mt-1 text-slate-400">
//                 {!safeTargets.length 
//                   ? "Fetching latest territory data..." 
//                   : "Please select a valid territory in the Territory tab."}
//               </p>
//             </div>
//           ) : (
//             <div className="divide-y divide-slate-100">
//               {completedDeals.map((shop, idx) => (
//                 <DealRow key={`completed-${shop.id || idx}`} shop={shop} isCompleted={true} />
//               ))}

//               {pendingShops.map((shop, idx) => (
//                 <DealRow key={`pending-${shop.id || idx}`} shop={shop} isCompleted={false} />
//               ))}
//             </div>
//           )}
//         </div>

//       </div>
//     </div>
//   );
// }

// // ── DEAL ROW COMPONENT ──
// function DealRow({ shop, isCompleted }) {
//   const orderAmount = Number(shop.orderAmount) || 0;
//   const Collection = Number(shop.Collection) || (orderAmount * 0.08); 
//   const time = shop.time || shop.lastVisited?.split('at ')[1] || 'Today';
//   const method = shop.paymentMethod || shop.paymentType || 'Cash';

//   return (
//     <div
//       className="px-4 py-3.5 flex items-center gap-3 transition-colors"
//       onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; }}
//       onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
//     >
//       <div
//         className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
//         style={{ 
//           background: isCompleted ? 'rgba(151,194,42,0.10)' : '#F1F5F9', 
//           border: `1px solid ${isCompleted ? 'rgba(151,194,42,0.18)' : '#E2E8F0'}` 
//         }}
//       >
//         {isCompleted ? (
//           <svg className="w-5 h-5" style={{ color: '#97C22A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
//           </svg>
//         ) : (
//           <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//           </svg>
//         )}
//       </div>

//       <div className="flex-1 min-w-0">
//         <p className="text-base font-bold truncate" style={{ color: isCompleted ? '#1E293B' : '#64748B' }}>
//           {shop.name}
//         </p>
        
//         {isCompleted ? (
//           <p className="text-xs font-semibold mt-0.5 text-slate-400">
//             Order: ₹{orderAmount.toLocaleString('en-IN')} <span className="opacity-60">•</span> {method}
//           </p>
//         ) : (
//           <p className="text-xs font-semibold mt-0.5 text-slate-400">
//             {shop.address || 'Address not provided'}
//           </p>
//         )}
//       </div>

//       <div className="text-right shrink-0">
//         {isCompleted ? (
//           <>
//             <p className="text-base font-bold" style={{ color: '#97C22A' }}>
//               +₹{Math.round(Collection).toLocaleString('en-IN')}
//             </p>
//             <p className="text-xs font-bold tracking-wider uppercase mt-0.5 text-slate-400">
//               {time}
//             </p>
//           </>
//         ) : (
//           <>
//             <p className="text-sm font-bold text-slate-400">
//               Pending
//             </p>
//             <p className="text-[10px] font-bold tracking-wider uppercase mt-0.5 text-slate-300">
//               Visit Required
//             </p>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }
'use client';
import { useState, useEffect } from 'react';

export default function DealsTab() {
  const [selectedArea, setSelectedArea] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [routeData, setRouteData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const todayDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });

  // 1. Listen for Area Selection
  useEffect(() => {
    setIsMounted(true);
    const checkSelectedArea = () => {
      const savedArea = localStorage.getItem('assignedSalesArea');
      if (savedArea && savedArea !== selectedArea) {
        setSelectedArea(savedArea);
      }
    };
    checkSelectedArea();
    const interval = setInterval(checkSelectedArea, 500);
    return () => clearInterval(interval);
  }, [selectedArea]);

  // 🚨 2. FETCH LIVE DATA FROM OUR NEW API
  useEffect(() => {
    if (!selectedArea) return;
    
    const fetchDeals = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/sales/deals?area=${encodeURIComponent(selectedArea)}`);
        if (res.ok) {
          const data = await res.json();
          setRouteData(data);
        }
      } catch (err) {
        console.error("Failed to load deals", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeals();
  }, [selectedArea]);

  // 3. Process the Data
  const completedDeals = routeData.filter((shop) => shop.status === 'COMPLETED');
  const pendingShops = routeData.filter((shop) => shop.status !== 'COMPLETED');

  const completedCount = completedDeals.length;
  const totalCount = routeData.length;
  
  const totalPipeline = completedDeals.reduce((sum, shop) => sum + (shop.orderAmount || 0), 0);
  const totalCollection = completedDeals.reduce((sum, shop) => sum + (shop.collectionAmount || 0), 0);

  // Group Payments Dynamically
  const paymentBreakdown = completedDeals.reduce((acc, shop) => {
    const amt = shop.collectionAmount || 0;
    if (amt > 0) {
      const method = shop.paymentMethod || 'Unknown';
      if (!acc[method]) acc[method] = 0;
      acc[method] += amt;
    }
    return acc;
  }, {});

  if (!isMounted) return null;

  return (
    <div className="flex-1 overflow-y-auto bg-[#F4F6F8]" style={{ WebkitOverflowScrolling: 'touch' }}>

      {/* ── STICKY HEADER ── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md px-5 py-3.5 flex items-center justify-between border-b border-slate-200/60 shadow-sm">
        <div>
          <p className="text-[11px] font-bold tracking-widest uppercase text-slate-400 mb-0.5">{todayDate}</p>
          <p className="text-[16px] font-extrabold text-slate-800 leading-none truncate max-w-[200px]">
            {selectedArea || 'No Area Selected'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-[#97C22A]/10 border border-[#97C22A]/20 shrink-0">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-[#97C22A]" />
          <span className="text-[10px] font-bold text-[#5c7a1a] uppercase tracking-wider">Live</span>
        </div>
      </div>

      <div className="w-full px-4 pt-5 pb-28 space-y-4 max-w-lg mx-auto">

        {/* ── HERO DASHBOARD CARD ── */}
        <div className="bg-[#0A0F1A] rounded-3xl p-6 relative overflow-hidden shadow-xl">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#97C22A] blur-[70px] opacity-20 pointer-events-none" />
        
          <div className="relative z-10">
            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="text-[11px] font-bold tracking-widest uppercase text-slate-400 mb-1.5">Today's Sales</p>
                <p className="text-3xl font-black text-white leading-none tracking-tight">
                  ₹{totalPipeline.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold tracking-widest uppercase text-[#97C22A] mb-1.5">Collected</p>
                <p className="text-xl font-bold text-[#97C22A] leading-none">
                  ₹{totalCollection.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between bg-white/5 rounded-2xl p-3.5 border border-white/10">
              <div className="text-center flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Visited</p>
                <p className="text-[14px] font-bold text-white leading-none">
                  {completedCount} <span className="text-slate-500 text-[11px]">/ {totalCount}</span>
                </p>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="text-center flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Avg Order</p>
                <p className="text-[14px] font-bold text-white leading-none">
                  ₹{completedCount > 0 ? Math.round(totalPipeline / completedCount).toLocaleString('en-IN') : 0}
                </p>
              </div>
            </div>

            {/* Dynamic Payment Method Row */}
            {Object.keys(paymentBreakdown).length > 0 && (
              <div className="mt-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2.5">Collection Methods</p>
                <div className="flex overflow-x-auto gap-2.5 pb-1 custom-scrollbar hide-scroll-indicator">
                  {Object.entries(paymentBreakdown).map(([method, amount]) => (
                    <div key={method} className="bg-white/10 border border-white/10 rounded-xl px-3.5 py-2 shrink-0 flex flex-col justify-center">
                      <p className="text-[10px] font-semibold text-slate-300 mb-0.5">{method}</p>
                      <p className="text-[13px] font-bold text-white tracking-tight">₹{amount.toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── SHOP LIST ── */}
        <div>
          <div className="flex items-center justify-between px-2 mb-3">
            <h3 className="text-[13px] font-bold tracking-widest uppercase text-slate-500">Route List</h3>
            <span className="text-[12px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-lg">{totalCount} Shops</span>
          </div>

          {isLoading ? (
             <div className="bg-white rounded-3xl py-12 flex flex-col items-center text-center border border-slate-200 shadow-sm">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-[#97c22a] rounded-full animate-spin mb-3"></div>
                <p className="text-[13px] font-bold text-slate-800">Syncing with Database...</p>
             </div>
          ) : totalCount === 0 ? (
            <div className="bg-white rounded-3xl py-12 flex flex-col items-center text-center px-6 border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 border border-slate-200">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-[15px] font-bold text-slate-800 mb-1">No shops assigned</p>
              <p className="text-[13px] font-medium text-slate-500 leading-relaxed max-w-[250px]">
                Please select a working area in the Territory Tab to see your shops.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedDeals.map((shop, idx) => (
                <DealRow key={`completed-${shop.id || idx}`} shop={shop} isCompleted={true} />
              ))}
              {pendingShops.map((shop, idx) => (
                <DealRow key={`pending-${shop.id || idx}`} shop={shop} isCompleted={false} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ── MOBILE-OPTIMIZED DEAL ROW COMPONENT ──
function DealRow({ shop, isCompleted }) {
  return (
    <div className={`bg-white rounded-3xl p-4 shadow-sm border transition-all ${
      isCompleted ? 'border-[#97C22A]/30' : 'border-slate-200/70'
    }`}>
      
      <div className="flex justify-between items-start mb-3.5">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border ${
            isCompleted ? 'bg-[#97C22A]/10 border-[#97C22A]/20' : 'bg-slate-50 border-slate-200'
          }`}>
            {isCompleted ? (
              <svg className="w-5 h-5 text-[#73961b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            )}
          </div>
          <div>
            <h4 className={`text-[15px] font-bold leading-tight ${isCompleted ? 'text-slate-900' : 'text-slate-600'}`}>
              {shop.name}
            </h4>
            {isCompleted ? (
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Visited at {shop.time}</p>
            ) : (
              <p className="text-[11px] font-medium text-slate-400 mt-0.5 truncate max-w-[180px]">
                {shop.address || 'Pending Visit'}
              </p>
            )}
          </div>
        </div>
        
        {isCompleted ? (
          <span className="bg-[#97C22A] text-[#0a0f1c] text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shrink-0 shadow-sm">
            Visited
          </span>
        ) : (
          <span className="bg-slate-100 text-slate-500 border border-slate-200 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg shrink-0">
            Pending
          </span>
        )}
      </div>

      {isCompleted && (
        <div className="bg-[#F8FAFC] rounded-2xl p-3 border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sales Generated</p>
            <p className="text-[15px] font-bold text-slate-800 leading-none">
              ₹{shop.orderAmount.toLocaleString('en-IN')}
            </p>
          </div>
          
          <div className="w-px h-8 bg-slate-200 mx-3" />
          
          <div className="text-right">
            <p className="text-[9px] font-bold text-[#5c7a1a] uppercase tracking-widest mb-1 flex items-center justify-end gap-1">
              Collected <span className="lowercase font-semibold bg-[#97c22a]/20 px-1 py-0.5 rounded text-[8px] ml-1">{shop.paymentMethod}</span>
            </p>
            <p className="text-[15px] font-bold text-[#73961b] leading-none">
              ₹{shop.collectionAmount.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}