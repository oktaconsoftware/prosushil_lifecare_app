'use client';
import { useState, useEffect } from 'react';

export default function RoutePlannerTab({ team }) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  
  const [allTargets, setAllTargets] = useState([]);
  const [assignedTargets, setAssignedTargets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-select first agent
  useEffect(() => {
    if (team.length > 0 && !selectedAgentId) setSelectedAgentId(team[0].id);
  }, [team]);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch Master List
        const targetRes = await fetch('/api/admin/planner?fetchAll=true');
        const targetData = await targetRes.json();
        setAllTargets(targetData);

        // Fetch Agent Assignments
        if (selectedAgentId && date) {
          const assignRes = await fetch(`/api/admin/planner?agentId=${selectedAgentId}&date=${date}`);
          const assignData = await assignRes.json();
          setAssignedTargets(assignData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedAgentId, date]);

  const activeAgent = team.find(a => a.id === selectedAgentId);

  const handleAssign = async (target) => {
    setAssignedTargets(prev => [...prev, target]); // Optimistic UI update
    await fetch('/api/admin/planner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: selectedAgentId, date, targetId: target.id })
    });
  };

  const handleRemove = async (target) => {
    setAssignedTargets(prev => prev.filter(t => t.id !== target.id)); // Optimistic UI update
    await fetch('/api/admin/planner', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: selectedAgentId, date, targetId: target.id })
    });
  };

  // Filter out targets that are already assigned
  const availableTargets = allTargets.filter(t => !assignedTargets.find(a => a.id === t.id));

  return (
    <div className="flex-1 overflow-y-auto animate-in fade-in duration-200">
      <div className="p-4 md:p-8 lg:p-10 space-y-6 max-w-7xl mx-auto w-full pb-24 md:pb-10">
        
        {/* Top Controls */}
        <div className="bg-white rounded-2xl p-5 md:p-6" style={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-[13px] md:text-base font-semibold text-slate-800">Territory Planner</h3>
              <p className="text-[11px] font-medium mt-0.5 text-slate-500">Assign specific medical shops to your MRs</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-800 outline-none transition-all"
                style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }}
              />
              <select 
                value={selectedAgentId} 
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-800 outline-none transition-all appearance-none pr-10"
                style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
              >
                {team.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name} ({agent.id})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <svg className="animate-spin w-5 h-5 text-[#97c22a]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            <span className="text-sm font-medium text-slate-400">Loading territories...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* LEFT: MASTER LIST */}
            <div className="bg-white rounded-2xl overflow-hidden flex flex-col h-[600px]" style={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <h4 className="text-[13px] font-semibold text-slate-800">Master Pharmacy Database</h4>
                <p className="text-[10px] text-slate-500">Available shops to assign</p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {availableTargets.map(target => (
                  <div key={target.id} className="p-4 rounded-xl border border-slate-100 flex items-center justify-between hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                    <div>
                      <h5 className="text-[13px] font-semibold text-slate-800">{target.name}</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">{target.address}</p>
                      <p className="text-[9px] font-medium mt-1.5 text-slate-400">Last visited: {target.lastVisited}</p>
                    </div>
                    <button onClick={() => handleAssign(target)} className="w-8 h-8 rounded-full bg-[#97c22a]/10 text-[#97c22a] flex items-center justify-center hover:bg-[#97c22a] hover:text-white transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: AGENT'S BEAT PLAN */}
            <div className="bg-[#0a0f1a] rounded-2xl overflow-hidden flex flex-col h-[600px] shadow-xl relative">
              {/* Premium Dark Gradients */}
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#97c22a]/10 rounded-full blur-[60px] pointer-events-none"></div>
              
              <div className="relative z-10 px-5 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-semibold" style={{ background: 'rgba(151,194,42,0.15)', color: '#97c22a', border: '1px solid rgba(151,194,42,0.2)' }}>
                    {activeAgent?.name?.split(' ').map(w => w[0]).join('').slice(0, 2) || 'MR'}
                  </div>
                  <div>
                    <h4 className="text-[14px] font-semibold text-white">{activeAgent?.name}'s Beat Plan</h4>
                    <p className="text-[11px] text-slate-400">{new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} • {assignedTargets.length} targets assigned</p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-3">
                {assignedTargets.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 mb-3">
                      <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                    </div>
                    <p className="text-[13px] font-medium text-slate-300">No route assigned</p>
                    <p className="text-[11px] text-slate-500 mt-1">Click the + icon on a pharmacy to assign it to this agent's day.</p>
                  </div>
                ) : (
                  assignedTargets.map((target, idx) => (
                    <div key={target.id} className="p-4 rounded-xl flex items-center justify-between transition-all bg-white/5 border border-white/10 hover:border-[#97c22a]/40 group">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#97c22a] text-white flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <div>
                          <h5 className="text-[13px] font-semibold text-white">{target.name}</h5>
                          <p className="text-[11px] text-slate-400 mt-0.5">{target.address}</p>
                        </div>
                      </div>
                      <button onClick={() => handleRemove(target)} className="w-8 h-8 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
              
              {assignedTargets.length > 0 && (
                <div className="relative z-10 p-4 border-t border-white/10 bg-black/20">
                  <button className="w-full py-3 rounded-xl bg-[#97c22a] text-white text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-[#85ab25] transition-colors shadow-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Publish Route to Agent App
                  </button>
                </div>
              )}
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}