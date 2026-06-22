// 'use client';

// export default function DealsTab({ totalPipeline, totalCommission, completedCount, completedDeals }) {
//   return (
//     <div className="flex-1 overflow-y-auto animate-in fade-in duration-200">
//       <div className="p-4 md:p-8 lg:p-10 space-y-4 md:space-y-6 pb-24 md:pb-10 max-w-4xl mx-auto w-full">
        
//         <div className="bg-slate-900 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl">
//           <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#60a5fa]/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
//           <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-[#97c22a]/15 rounded-full blur-[40px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
          
//           <div className="relative z-10">
//             <p className="text-[11px] md:text-xs font-semibold tracking-wide text-slate-400 mb-1">Total Pipeline Generated</p>
//             <h3 className="text-3xl md:text-5xl font-semibold text-white tracking-tight">₹{totalPipeline.toLocaleString('en-IN')}</h3>
            
//             <div className="mt-6 flex items-center gap-4 border-t border-white/10 pt-5">
//               <div>
//                 <p className="text-[10px] font-medium text-slate-400 mb-0.5">Commission Earned</p>
//                 <p className="text-lg font-semibold" style={{ color: '#97c22a' }}>₹{totalCommission.toLocaleString('en-IN')}</p>
//               </div>
//               <div className="w-px h-8 bg-white/10"></div>
//               <div>
//                 <p className="text-[10px] font-medium text-slate-400 mb-0.5">Successful Visits</p>
//                 <p className="text-lg font-semibold text-white">{completedCount}</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="pt-2">
//           <h3 className="text-[13px] md:text-base font-semibold text-slate-800 mb-4">Recent Transactions</h3>
          
//           <div className="space-y-3">
//             {completedDeals.length === 0 ? (
//               <div className="bg-white rounded-2xl p-8 text-center" style={{ border: '1px solid #e9edf2' }}>
//                 <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: '#f1f5f9' }}>
//                   <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
//                 </div>
//                 <p className="text-[12px] font-medium text-slate-500">No deals logged yet.</p>
//               </div>
//             ) : (
//               completedDeals.map((deal) => (
//                 <div key={deal.id} className="bg-white rounded-2xl p-4 md:p-5 flex items-center justify-between" style={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(96,165,250,0.1)' }}>
//                       <svg className="w-4 h-4" style={{ color: '#60a5fa' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
//                     </div>
//                     <div>
//                       <h4 className="text-[13px] font-semibold text-slate-800 leading-tight">{deal.name}</h4>
//                       {/* FIX: Changed deal.orderValue to deal.orderAmount */}
//                       <p className="text-[10px] font-medium text-slate-500 mt-0.5">Order: ₹{deal.orderAmount?.toLocaleString('en-IN') || 0}</p>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-[13px] font-semibold" style={{ color: '#97c22a' }}>+ ₹{deal.commission?.toLocaleString('en-IN') || 0}</p>
//                     {/* FIX: Ensure time extracts correctly from lastVisited if deal.time is missing */}
//                     <p className="text-[9px] font-medium text-slate-400 mt-1">{deal.time || deal.lastVisited?.split('at ')[1] || 'Today'}</p>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

export default function DealsTab({ totalPipeline, totalCommission, completedCount, completedDeals }) {
  return (
    <div className="flex-1 overflow-y-auto bg-[#F0F2F5]" style={{ WebkitOverflowScrolling: 'touch' }}>

      {/* ── STICKY HEADER ── */}
      <div className="sticky top-0 z-30 bg-[#0A0F1A] px-4 lg:px-6 py-3 flex items-center justify-between shadow-md">
        <div>
          <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500">Field Sales</p>
          <p className="text-[15px] font-bold text-white mt-0.5">Deals</p>
        </div>
        <div
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{ background: 'rgba(151,194,42,0.10)', border: '1px solid rgba(151,194,42,0.2)' }}
        >
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#97C22A' }} />
          <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: '#97C22A' }}>
            Live
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full px-4 lg:px-6 pt-5 pb-28 space-y-3">

        {/* ── PIPELINE HERO CARD (dark) ── */}
        <div
          className="bg-[#0A0F1A] rounded-2xl p-5 relative overflow-hidden"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.18)' }}
        >
          {/* Ambient glows */}
          <div
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(151,194,42,0.14) 0%, transparent 70%)' }}
          />
          <div
            className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.10) 0%, transparent 70%)' }}
          />
          {/* Left accent stripe */}
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full" style={{ background: '#97C22A' }} />

          <div className="relative z-10 pl-2">
            <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500 mb-1">Total Pipeline</p>
            <p className="text-2xl font-bold text-white leading-none">
              ₹{totalPipeline?.toLocaleString('en-IN') || 0}
            </p>

            <div className="mt-4 pt-4 flex items-center gap-5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              {/* Commission */}
              <div>
                <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500 mb-1">Commission</p>
                <p className="text-[15px] font-bold leading-none" style={{ color: '#97C22A' }}>
                  ₹{totalCommission?.toLocaleString('en-IN') || 0}
                </p>
              </div>

              <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.08)' }} />

              {/* Visits */}
              <div>
                <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500 mb-1">Visits Done</p>
                <p className="text-[15px] font-bold text-white leading-none">{completedCount || 0}</p>
              </div>

              <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.08)' }} />

              {/* Avg order */}
              <div>
                <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500 mb-1">Avg Order</p>
                <p className="text-[15px] font-bold text-slate-300 leading-none">
                  ₹{completedCount > 0
                    ? Math.round(totalPipeline / completedCount).toLocaleString('en-IN')
                    : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── TRANSACTIONS SECTION ── */}
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0' }}
        >
          {/* Section header */}
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500">Recent Transactions</p>
            <p className="text-[9px] font-bold tracking-widest uppercase text-slate-400">
              {completedDeals?.length || 0} deals
            </p>
          </div>

          {/* Empty state */}
          {!completedDeals || completedDeals.length === 0 ? (
            <div className="py-14 flex flex-col items-center text-center px-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: '#F0F2F5', border: '1px solid #E2E8F0' }}
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-[13px] font-bold" style={{ color: '#1E293B' }}>No deals logged yet</p>
              <p className="text-[11px] font-medium mt-1" style={{ color: '#94A3B8' }}>
                Complete a shop visit to see your deals here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {completedDeals.map((deal, idx) => (
                <DealRow key={deal.id || idx} deal={deal} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ── DEAL ROW ──
function DealRow({ deal }) {
  const commission = deal.commission || 0;
  const orderAmount = deal.orderAmount || 0;
  const time = deal.time || deal.lastVisited?.split('at ')[1] || 'Today';

  return (
    <div
      className="px-4 py-3.5 flex items-center gap-3 transition-colors"
      onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      {/* Icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(151,194,42,0.10)', border: '1px solid rgba(151,194,42,0.18)' }}
      >
        <svg className="w-4 h-4" style={{ color: '#97C22A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold truncate" style={{ color: '#1E293B' }}>{deal.name}</p>
        <p className="text-[11px] font-medium mt-0.5" style={{ color: '#94A3B8' }}>
          Order: ₹{orderAmount.toLocaleString('en-IN')}
        </p>
      </div>

      {/* Right */}
      <div className="text-right shrink-0">
        <p className="text-[13px] font-bold" style={{ color: '#97C22A' }}>
          +₹{commission.toLocaleString('en-IN')}
        </p>
        <p className="text-[9px] font-bold tracking-widest uppercase mt-0.5" style={{ color: '#94A3B8' }}>
          {time}
        </p>
      </div>
    </div>
  );
}