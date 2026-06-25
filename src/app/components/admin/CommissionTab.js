'use client';
import { useState, useEffect, useMemo } from 'react';

export default function CommissionTab({ team = [] }) { // 👈 ADDED TEAM PROP
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('ALL'); 

  useEffect(() => {
    fetch('/api/admin/deals')
      .then(res => res.json())
      .then(data => {
        setDeals(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load deals:", err);
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

  // ── EXTRACT ALL EMPLOYEES ──
  // This merges your full team database with anyone who has deals
  const allAgents = useMemo(() => {
    const teamNames = team.map(a => a.name);
    const dealNames = deals.map(d => d.agentName || 'Unknown Agent');
    return [...new Set([...teamNames, ...dealNames])].sort();
  }, [team, deals]);

  // ── Filter Deals based on Dropdown ──
  const displayedDeals = useMemo(() => {
    if (selectedAgent === 'ALL') return deals;
    return deals.filter(d => (d.agentName || 'Unknown Agent') === selectedAgent);
  }, [deals, selectedAgent]);

  // ── Dynamic Consolidated Stats ──
  const pendingCount = displayedDeals.filter(d => d.status === 'Pending Review').length;
  const totalLiability = displayedDeals.filter(d => d.status !== 'Paid').reduce((sum, d) => sum + (Number(d.commission) || 0), 0);
  const totalPaid = displayedDeals.filter(d => d.status === 'Paid').reduce((sum, d) => sum + (Number(d.commission) || 0), 0);

  // Helper component for the Status Badge
  const StatusBadge = ({ status }) => (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wide shrink-0" 
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
            HEADER & DROPDOWN FILTER
        ========================================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h3 className="text-[15px] md:text-lg font-bold text-slate-800 tracking-tight">Agent Commissions</h3>
            <p className="text-[11px] text-slate-500 mt-1">Review and process payout requests.</p>
          </div>
          
          <div className="w-full md:w-72">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Select Sales Agent</label>
            <select 
              value={selectedAgent} 
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full px-4 py-3 bg-[#F0F2F5] border border-[#E2E8F0] rounded-xl text-[13px] font-bold text-[#1E293B] outline-none focus:ring-2 focus:ring-[#97C22A]/30 focus:border-[#97C22A] transition-all cursor-pointer appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
            >
              <option value="ALL">Company Overview (All Agents)</option>
              {allAgents.map(agent => (
                <option key={agent} value={agent}>{agent}</option>
              ))}
            </select>
          </div>
        </div>

        {/* =========================================
            DYNAMIC CONSOLIDATED RECORD
        ========================================= */}
        <div className="bg-[#0a0f1a] rounded-[24px] md:rounded-[32px] p-6 md:p-10 relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="absolute top-0 right-0 w-[200px] md:w-[300px] h-[200px] md:h-[300px] bg-blue-500/20 rounded-full blur-[60px] md:blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[150px] md:w-[200px] h-[150px] md:h-[200px] bg-[#97c22a]/20 rounded-full blur-[50px] md:blur-[60px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
          
          <p className="text-[10px] font-bold text-[#97c22a] uppercase tracking-widest mb-6 relative z-10 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#97c22a] animate-pulse"></span>
            {selectedAgent === 'ALL' ? 'Total Company Liability' : `${selectedAgent}'s Ledger`}
          </p>

          <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 items-center">
            <div className="col-span-2 md:col-span-1">
              <p className="text-[10px] md:text-xs font-semibold tracking-widest text-slate-400 uppercase mb-1.5">Owed / Liability</p>
              <h3 className="text-3xl md:text-5xl font-bold text-white tracking-tight">₹{totalLiability.toLocaleString('en-IN')}</h3>
            </div>
            
            <div className="border-t md:border-t-0 md:border-l border-white/10 pt-5 md:pt-0 md:pl-8 col-span-1">
              <p className="text-[10px] md:text-xs font-semibold tracking-widest text-slate-400 uppercase mb-1.5">Awaiting Review</p>
              <h3 className="text-2xl md:text-4xl font-bold text-[#e73e43] tracking-tight">{pendingCount}</h3>
            </div>
            
            <div className="border-t md:border-t-0 md:border-l border-white/10 pt-5 md:pt-0 md:pl-8 col-span-1">
              <p className="text-[10px] md:text-xs font-semibold tracking-widest text-slate-400 uppercase mb-1.5">Already Paid</p>
              <h3 className="text-2xl md:text-4xl font-bold text-[#97c22a] tracking-tight">₹{totalPaid.toLocaleString('en-IN')}</h3>
            </div>
          </div>
        </div>

        {/* =========================================
            DETAILED DEAL RECORDS
        ========================================= */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
             <div className="w-8 h-8 border-4 border-slate-200 border-t-[#97c22a] rounded-full animate-spin mb-3"></div>
             <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Syncing Ledger...</p>
          </div>
        ) : displayedDeals.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-sm animate-in zoom-in-95 duration-300">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-100">
               <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <p className="text-[14px] font-bold text-slate-700">No records found</p>
            <p className="text-[12px] text-slate-400 mt-1">There are no commission logs for {selectedAgent !== 'ALL' ? selectedAgent : 'this selection'}.</p>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-0">
            
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-[13px] md:text-base font-bold text-slate-800 tracking-tight">Chronological Details</h3>
              <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400">{displayedDeals.length} Records</p>
            </div>

            {/* ── MOBILE VIEW (Card List) ── */}
            <div className="md:hidden space-y-4">
              {displayedDeals.map((deal) => (
                <div key={deal.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm relative overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
                  <div className="flex justify-between items-start mb-3">
                    <div className="pr-2">
                      <h4 className="text-[13px] font-bold text-slate-800 leading-tight">{deal.pharmacy}</h4>
                      <p className="text-[10px] font-medium text-slate-400 mt-0.5">{deal.date}</p>
                    </div>
                    <StatusBadge status={deal.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Order Vol</p>
                      <p className="text-[12px] font-bold text-slate-700">₹{deal.orderValue?.toLocaleString('en-IN') || 0}</p>
                    </div>
                    <div className="bg-[#97c22a]/5 rounded-xl p-2.5 border border-[#97c22a]/10">
                      <p className="text-[9px] font-bold text-[#659c12] uppercase tracking-wider mb-0.5">Commission</p>
                      <p className="text-[13px] font-extrabold text-[#659c12]">₹{deal.commission?.toLocaleString('en-IN') || 0}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-500">
                      Agent: <span className="text-slate-800 font-bold">{deal.agentName}</span>
                    </p>
                    
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

            {/* ── DESKTOP VIEW (Clean Table) ── */}
            <div className="hidden md:block rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-200 animate-in slide-in-from-bottom-2 duration-300">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {['Deal ID', 'Agent', 'Target Pharmacy', 'Order Vol.', 'Commission', 'Status', 'Actions'].map((h) => (
                        <th key={h} className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayedDeals.map((deal) => (
                      <tr key={deal.id} className="hover:bg-blue-50/20 transition-colors border-b border-slate-100 last:border-0">
                        <td className="px-6 py-4">
                          <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md">{deal.id}</span>
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
                        <td className="px-6 py-4 text-right">
                          {deal.status === 'Pending Review' && (
                            <button onClick={() => handleAction(deal.id, 'approve')} disabled={isProcessing} className="px-4 py-2 rounded-xl text-[11px] font-bold text-white bg-blue-500 hover:bg-blue-600 active:scale-95 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50">
                              Approve
                            </button>
                          )}
                          {deal.status === 'Approved' && (
                            <button onClick={() => handleAction(deal.id, 'pay')} disabled={isProcessing} className="px-4 py-2 rounded-xl text-[11px] font-bold text-white bg-[#0a0f1a] hover:bg-slate-800 active:scale-95 transition-all shadow-md shadow-slate-900/20 disabled:opacity-50">
                              Mark Paid
                            </button>
                          )}
                          {deal.status === 'Paid' && (
                            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 justify-end pr-2">
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

          </div>
        )}
      </div>
    </div>
  );
}