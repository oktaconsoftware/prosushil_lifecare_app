'use client';

export default function DealsTab({ totalPipeline, totalCommission, completedCount, completedDeals }) {
  return (
    <div className="flex-1 overflow-y-auto animate-in fade-in duration-200">
      <div className="p-4 md:p-8 lg:p-10 space-y-4 md:space-y-6 pb-24 md:pb-10 max-w-4xl mx-auto w-full">
        
        <div className="bg-slate-900 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#60a5fa]/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-[#97c22a]/15 rounded-full blur-[40px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
          
          <div className="relative z-10">
            <p className="text-[11px] md:text-xs font-semibold tracking-wide text-slate-400 mb-1">Total Pipeline Generated</p>
            <h3 className="text-3xl md:text-5xl font-semibold text-white tracking-tight">₹{totalPipeline.toLocaleString('en-IN')}</h3>
            
            <div className="mt-6 flex items-center gap-4 border-t border-white/10 pt-5">
              <div>
                <p className="text-[10px] font-medium text-slate-400 mb-0.5">Commission Earned</p>
                <p className="text-lg font-semibold" style={{ color: '#97c22a' }}>₹{totalCommission.toLocaleString('en-IN')}</p>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div>
                <p className="text-[10px] font-medium text-slate-400 mb-0.5">Successful Visits</p>
                <p className="text-lg font-semibold text-white">{completedCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <h3 className="text-[13px] md:text-base font-semibold text-slate-800 mb-4">Recent Transactions</h3>
          
          <div className="space-y-3">
            {completedDeals.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center" style={{ border: '1px solid #e9edf2' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: '#f1f5f9' }}>
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <p className="text-[12px] font-medium text-slate-500">No deals logged yet.</p>
              </div>
            ) : (
              completedDeals.map((deal) => (
                <div key={deal.id} className="bg-white rounded-2xl p-4 md:p-5 flex items-center justify-between" style={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(96,165,250,0.1)' }}>
                      <svg className="w-4 h-4" style={{ color: '#60a5fa' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <div>
                      <h4 className="text-[13px] font-semibold text-slate-800 leading-tight">{deal.name}</h4>
                      <p className="text-[10px] font-medium text-slate-500 mt-0.5">Order: ₹{deal.orderValue?.toLocaleString('en-IN') || 0}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-semibold" style={{ color: '#97c22a' }}>+ ₹{deal.commission?.toLocaleString('en-IN') || 0}</p>
                    <p className="text-[9px] font-medium text-slate-400 mt-1">{deal.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}