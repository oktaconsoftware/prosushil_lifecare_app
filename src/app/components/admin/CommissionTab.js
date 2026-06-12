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
  const totalPendingPayout = deals.filter(d => d.status !== 'Paid').reduce((sum, d) => sum + d.commission, 0);

  return (
    <div className="flex-1 overflow-y-auto animate-in fade-in duration-200">
      <div className="p-4 md:p-8 lg:p-10 space-y-5 md:space-y-7 pb-24 md:pb-10 max-w-7xl mx-auto w-full">
        
        {/* Financial Summary */}
        <div className="bg-slate-900 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl mb-8">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#a78bfa]/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-[#97c22a]/15 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-[11px] md:text-xs font-semibold tracking-wide text-slate-400 mb-1">Total Outstanding Liability</p>
              <h3 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">₹{totalPendingPayout.toLocaleString('en-IN')}</h3>
            </div>
            <div className="border-l border-white/10 pl-6">
              <p className="text-[11px] md:text-xs font-semibold tracking-wide text-slate-400 mb-1">Deals Awaiting Review</p>
              <h3 className="text-3xl md:text-4xl font-semibold text-[#e73e43] tracking-tight">{pendingCount}</h3>
            </div>
            <div className="border-l border-white/10 pl-6 hidden md:block">
              <p className="text-[11px] md:text-xs font-semibold tracking-wide text-slate-400 mb-1">Treasury Status</p>
              <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(151,194,42,0.1)', border: '1px solid rgba(151,194,42,0.2)' }}>
                <span className="w-2 h-2 rounded-full animate-pulse bg-[#97c22a]" />
                <span className="text-xs font-medium text-[#97c22a]">Funds Liquid</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <h3 className="text-[13px] md:text-base font-semibold text-slate-800 mb-4">Master Ledger Feed</h3>
        <div className="rounded-2xl overflow-hidden bg-white" style={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          {isLoading ? (
            <div className="py-16 text-center text-sm text-slate-400">Loading ledger...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e9edf2' }}>
                    {['Deal ID', 'Agent', 'Target', 'Order Vol.', 'Commission', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-[11px] font-semibold tracking-wide text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {deals.map((deal, i) => (
                    <tr key={deal.id} style={{ borderTop: i > 0 ? '1px solid #f1f5f9' : 'none' }} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 font-mono text-[12px] text-slate-400">{deal.id}</td>
                      <td className="px-5 py-4 text-[13px] font-semibold text-slate-700">{deal.agentName}</td>
                      <td className="px-5 py-4">
                        <p className="text-[13px] font-medium text-slate-700">{deal.pharmacy}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{deal.date}</p>
                      </td>
                      <td className="px-5 py-4 text-[13px] font-semibold text-slate-700">₹{deal.orderValue.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4 text-[13px] font-semibold" style={{ color: '#97c22a' }}>₹{deal.commission.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold" 
                          style={
                            deal.status === 'Pending Review' ? { background: 'rgba(231,62,67,0.08)', color: '#c0373b' } :
                            deal.status === 'Approved' ? { background: 'rgba(96,165,250,0.1)', color: '#3b82f6' } :
                            { background: 'rgba(151,194,42,0.08)', color: '#5a8a10' }
                          }>
                          {deal.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {deal.status === 'Pending Review' && (
                          <button onClick={() => handleAction(deal.id, 'approve')} disabled={isProcessing} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-all">
                            Approve
                          </button>
                        )}
                        {deal.status === 'Approved' && (
                          <button onClick={() => handleAction(deal.id, 'pay')} disabled={isProcessing} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-all" style={{ background: '#0a0f1a' }}>
                            Mark Paid
                          </button>
                        )}
                        {deal.status === 'Paid' && (
                          <span className="text-[11px] font-medium text-slate-400 pl-2">Settled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}