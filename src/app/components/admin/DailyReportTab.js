'use client';
import { useState, useEffect } from 'react';

export default function DailyReportTab({ team }) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (team.length > 0 && !selectedAgentId) setSelectedAgentId(team[0].id);
  }, [team]);

  useEffect(() => {
    if (!selectedAgentId || !date) return;
    
    setIsLoading(true);
    fetch(`/api/admin/reports?agentId=${selectedAgentId}&date=${date}`)
      .then(res => res.json())
      .then(data => {
        setReportData(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, [selectedAgentId, date]);

  const activeAgent = team.find(a => a.id === selectedAgentId);

  return (
    <div className="flex-1 overflow-y-auto animate-in fade-in duration-200">
      <div className="p-4 md:p-8 lg:p-10 space-y-6 max-w-5xl mx-auto w-full pb-24 md:pb-10">
        
        <div className="bg-white rounded-2xl p-5 md:p-6" style={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <h3 className="text-[13px] md:text-base font-semibold text-slate-800 mb-4">Report Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 tracking-wide mb-1.5">Select Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl text-sm font-medium text-slate-800 outline-none transition-all"
                style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 tracking-wide mb-1.5">Select Sales Agent</label>
              <select 
                value={selectedAgentId} 
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl text-sm font-medium text-slate-800 outline-none transition-all appearance-none"
                style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
              >
                {team.length === 0 ? <option value="">No agents available</option> : null}
                {team.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name} ({agent.id})</option>
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
        ) : reportData ? (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold" style={{ background: 'rgba(151,194,42,0.15)', color: '#5a8a10', border: '1px solid rgba(151,194,42,0.2)' }}>
                {activeAgent?.name?.split(' ').map(w => w[0]).join('').slice(0, 2) || 'AG'}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-800 tracking-tight">{activeAgent?.name || 'Agent'}</h2>
                <p className="text-xs font-medium text-slate-500">Daily Report • {new Date(date).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-white p-4 rounded-2xl" style={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <p className="text-[10px] font-semibold tracking-wide text-slate-400 mb-1">Visits Completed</p>
                <p className="text-xl font-semibold text-slate-800">{reportData.summary.completedVisits} <span className="text-xs text-slate-400">/ {reportData.summary.totalVisits}</span></p>
              </div>
              <div className="bg-white p-4 rounded-2xl" style={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <p className="text-[10px] font-semibold tracking-wide text-slate-400 mb-1">Generated Volume</p>
                <p className="text-xl font-semibold text-slate-800">₹{reportData.summary.totalOrderValue.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border-b-2" style={{ border: '1px solid #e9edf2', borderBottomColor: '#97c22a', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <p className="text-[10px] font-semibold tracking-wide text-[#97c22a] mb-1">Commission Earned</p>
                <p className="text-xl font-semibold text-slate-800">₹{reportData.summary.commissionEarned.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border-b-2" style={{ border: '1px solid #e9edf2', borderBottomColor: reportData.summary.deviations > 0 ? '#e73e43' : '#e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <p className="text-[10px] font-semibold tracking-wide text-slate-400 mb-1">Protocol Deviations</p>
                <p className="text-xl font-semibold" style={{ color: reportData.summary.deviations > 0 ? '#e73e43' : '#64748b' }}>{reportData.summary.deviations}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 md:p-8" style={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <h3 className="text-[13px] md:text-base font-semibold text-slate-800 mb-6">Chronological Ledger</h3>
              
              {reportData.timeline.length === 0 ? (
                <div className="text-center py-10 text-sm text-slate-500 border border-dashed border-slate-200 rounded-xl">No visits logged on this date.</div>
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100">
                  {reportData.timeline.map((stop, idx) => (
                    <div key={idx} className="relative flex items-start gap-4">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 shadow-sm z-10 
                        ${stop.status === 'error' ? 'text-[#e73e43] bg-[#e73e43]/10' : stop.status === 'success' ? 'text-[#97c22a] bg-[#97c22a]/10' : 'text-slate-500 bg-slate-100'}`}
                      >
                        {stop.type === 'system' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        ) : stop.status === 'error' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        )}
                      </div>

                      <div className="flex-1 bg-slate-50/50 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-[13px] font-semibold text-slate-800 leading-tight">{stop.title}</h4>
                          <span className="text-[10px] font-bold tracking-wide" style={{ color: stop.status === 'error' ? '#e73e43' : '#8896aa' }}>{stop.time}</span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">{stop.location}</p>
                        
                        {stop.status === 'error' && stop.errorNote && (
                          <div className="mt-2 p-2 rounded-lg bg-[#e73e43]/5 border border-[#e73e43]/10">
                            <p className="text-[10px] font-medium text-[#e73e43] leading-relaxed">{stop.errorNote}</p>
                          </div>
                        )}

                        {stop.details && (
                          <div className="mt-3 pt-3 border-t border-slate-200">
                            <div className="flex justify-between items-center text-[10px] font-semibold mb-2">
                              <span className="text-slate-500">Samples Given: <span className="text-slate-700">{stop.details.samples}</span></span>
                              {stop.details.order > 0 ? (
                                <span style={{ color: '#97c22a' }}>Order: ₹{stop.details.order.toLocaleString('en-IN')}</span>
                              ) : (
                                <span className="text-slate-400">No order placed</span>
                              )}
                            </div>
                            {stop.details.note && (
                              <p className="text-[10px] text-slate-500 italic">"{stop.details.note}"</p>
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
        ) : null}
      </div>
    </div>
  );
}