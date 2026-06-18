'use client';
import { useState, useEffect } from 'react';

export default function CommissionTab() {
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetch('/api/admin/deals')
      .then(res => res.json())
      .then(data => {
        setDeals(data);
        setIsLoading(false);
      });
  }, []);

  const handleAction = async (dealId, action) => {
    setIsProcessing(true);
    const newStatus = action === 'approve' ? 'Approved' : 'Paid';
    
    try {
      const res = await fetch('/api/admin/deals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId, newStatus })
      });
      
      if (res.ok) {
        setDeals(prev => prev.map(d => d.id === dealId ? { ...d, status: newStatus } : d));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingCount = deals.filter(d => d.status === 'Pending Review').length;
  const totalPendingPayout = deals.filter(d => d.status !== 'Paid').reduce((sum, d) => sum + (Number(d.commission) || 0), 0);

  // Helper component for the Status Badge to keep code clean
  const StatusBadge = ({ status }) => (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wide" 
      style={
        status === 'Pending Review' ? { background: 'rgba(231,62,67,0.1)', color: '#e73e43' } :
        status === 'Approved' ? { background: 'rgba(96,165,250,0.1)', color: '#3b82f6' } :
        { background: 'rgba(151,194,42,0.1)', color: '#659c12' }
      }>
      {status}
    </span>
  );

  return (
    <div className="flex-1 overflow-y-auto animate-in fade-in duration-300 bg-slate-50">
      <div className="p-4 md:p-8 lg:p-10 space-y-6 md:space-y-8 pb-24 md:pb-10 max-w-7xl mx-auto w-full">
        
        {/* =========================================
            FINANCIAL SUMMARY (App-like Header)
        ========================================= */}
        <div className="bg-[#0a0f1a] rounded-[24px] md:rounded-[32px] p-6 md:p-10 relative overflow-hidden shadow-2xl">
          {/* Decorative Gradients */}
          <div className="absolute top-0 right-0 w-[200px] md:w-[300px] h-[200px] md:h-[300px] bg-blue-500/20 rounded-full blur-[60px] md:blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[150px] md:w-[200px] h-[150px] md:h-[200px] bg-[#97c22a]/20 rounded-full blur-[50px] md:blur-[60px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
          
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 items-center">
            <div className="col-span-2 md:col-span-1">
              <p className="text-[10px] md:text-xs font-semibold tracking-widest text-slate-400 uppercase mb-1.5">Total Liability</p>
              <h3 className="text-3xl md:text-5xl font-bold text-white tracking-tight">₹{totalPendingPayout.toLocaleString('en-IN')}</h3>
            </div>
            
            <div className="border-t md:border-t-0 md:border-l border-white/10 pt-5 md:pt-0 md:pl-8 col-span-1">
              <p className="text-[10px] md:text-xs font-semibold tracking-widest text-slate-400 uppercase mb-1.5">Awaiting Review</p>
              <h3 className="text-2xl md:text-4xl font-bold text-[#e73e43] tracking-tight">{pendingCount}</h3>
            </div>
            
            <div className="border-t md:border-t-0 md:border-l border-white/10 pt-5 md:pt-0 md:pl-8 col-span-1 text-right md:text-left">
              <p className="text-[10px] md:text-xs font-semibold tracking-widest text-slate-400 uppercase mb-1.5">Treasury</p>
              <div className="inline-flex items-center gap-2 mt-1 px-3 py-1.5 rounded-full bg-[#97c22a]/10 border border-[#97c22a]/20">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full animate-pulse bg-[#97c22a]" />
                <span className="text-[10px] md:text-xs font-bold text-[#97c22a]">Funds Liquid</span>
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-[14px] md:text-lg font-bold text-slate-800 tracking-tight ml-1">Master Ledger Feed</h3>
        
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
             <div className="w-8 h-8 border-4 border-slate-200 border-t-[#97c22a] rounded-full animate-spin mb-3"></div>
             <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Syncing Ledger...</p>
          </div>
        ) : (
          <>
            {/* =========================================
                MOBILE VIEW (Card List)
            ========================================= */}
            <div className="md:hidden space-y-4">
              {deals.map((deal) => (
                <div key={deal.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden">
                  
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="pr-2">
                      <h4 className="text-[13px] font-bold text-slate-800 leading-tight">{deal.pharmacy}</h4>
                      <p className="text-[10px] font-medium text-slate-400 mt-0.5">{deal.date}</p>
                    </div>
                    <StatusBadge status={deal.status} />
                  </div>

                  {/* Financial Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Order Vol</p>
                      <p className="text-[12px] font-bold text-slate-700">₹{deal.orderValue?.toLocaleString('en-IN') || 0}</p>
                    </div>
                    <div className="bg-[#97c22a]/5 rounded-xl p-2.5 border border-[#97c22a]/10">
                      <p className="text-[9px] font-bold text-[#659c12] uppercase tracking-wider mb-0.5">Commission</p>
                      <p className="text-[12px] font-bold text-[#659c12]">₹{deal.commission?.toLocaleString('en-IN') || 0}</p>
                    </div>
                  </div>

                  {/* Card Footer / Actions */}
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-500">Agent: <span className="text-slate-800">{deal.agentName}</span></p>
                    
                    <div>
                      {deal.status === 'Pending Review' && (
                        <button onClick={() => handleAction(deal.id, 'approve')} disabled={isProcessing} className="px-4 py-1.5 rounded-lg text-[10px] font-bold text-white bg-blue-500 hover:bg-blue-600 active:scale-95 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50">
                          Approve
                        </button>
                      )}
                      {deal.status === 'Approved' && (
                        <button onClick={() => handleAction(deal.id, 'pay')} disabled={isProcessing} className="px-4 py-1.5 rounded-lg text-[10px] font-bold text-white bg-[#0a0f1a] hover:bg-slate-800 active:scale-95 transition-all shadow-md shadow-slate-900/20 disabled:opacity-50">
                          Mark Paid
                        </button>
                      )}
                      {deal.status === 'Paid' && (
                        <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                          Settled
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>

            {/* =========================================
                DESKTOP VIEW (Clean Table)
            ========================================= */}
            <div className="hidden md:block rounded-2xl overflow-hidden bg-white shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {['Deal ID', 'Agent', 'Target Pharmacy', 'Order Vol.', 'Commission', 'Status', 'Actions'].map((h) => (
                        <th key={h} className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {deals.map((deal, i) => (
                      <tr key={deal.id} className="hover:bg-blue-50/30 transition-colors border-b border-slate-50 last:border-0">
                        <td className="px-6 py-4">
                          <span className="font-mono text-[11px] font-medium bg-slate-100 text-slate-500 px-2 py-1 rounded-md">{deal.id}</span>
                        </td>
                        <td className="px-6 py-4 text-[13px] font-bold text-slate-700">{deal.agentName}</td>
                        <td className="px-6 py-4">
                          <p className="text-[13px] font-bold text-slate-800">{deal.pharmacy}</p>
                          <p className="text-[11px] font-medium text-slate-400 mt-0.5">{deal.date}</p>
                        </td>
                        <td className="px-6 py-4 text-[13px] font-bold text-slate-600">₹{deal.orderValue?.toLocaleString('en-IN') || 0}</td>
                        <td className="px-6 py-4 text-[14px] font-extrabold text-[#659c12]">₹{deal.commission?.toLocaleString('en-IN') || 0}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={deal.status} />
                        </td>
                        <td className="px-6 py-4">
                          {deal.status === 'Pending Review' && (
                            <button onClick={() => handleAction(deal.id, 'approve')} disabled={isProcessing} className="px-4 py-2 rounded-xl text-[11px] font-bold text-white bg-blue-500 hover:bg-blue-600 active:scale-95 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">
                              Approve
                            </button>
                          )}
                          {deal.status === 'Approved' && (
                            <button onClick={() => handleAction(deal.id, 'pay')} disabled={isProcessing} className="px-4 py-2 rounded-xl text-[11px] font-bold text-white bg-[#0a0f1a] hover:bg-slate-800 active:scale-95 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50">
                              Mark Paid
                            </button>
                          )}
                          {deal.status === 'Paid' && (
                            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 pl-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                              Settled
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}