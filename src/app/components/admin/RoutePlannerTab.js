'use client';
import { useState, useEffect } from 'react';

export default function RoutePlannerTab({ team }) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  
  // Real-time Data States
  const [territories, setTerritories] = useState([]); // Hierarchical: Area -> Place -> Medical
  const [assignedTargets, setAssignedTargets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Accordion UI States
  const [expandedAreas, setExpandedAreas] = useState({});
  const [expandedPlaces, setExpandedPlaces] = useState({});

  // Auto-select first agent
  useEffect(() => {
    if (team.length > 0 && !selectedAgentId) setSelectedAgentId(team[0].id);
  }, [team]);

  // Fetch Data 
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const terrRes = await fetch('/api/admin/territories');
        const terrData = await terrRes.json();
        setTerritories(terrData);

        if (terrData.length > 0) setExpandedAreas({ [terrData[0].id]: true });

        if (selectedAgentId) {
          const assignRes = await fetch(`/api/admin/planner?agentId=${selectedAgentId}`);
          const assignData = await assignRes.json();
          setAssignedTargets(assignData);
        }
      } catch (err) {
        console.error("Error fetching planner data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedAgentId]);

  const activeAgent = team.find(a => a.id === selectedAgentId);

  const toggleArea = (id) => setExpandedAreas(prev => ({ ...prev, [id]: !prev[id] }));
  const togglePlace = (id) => setExpandedPlaces(prev => ({ ...prev, [id]: !prev[id] }));

  // =====================================
  // ASSIGNMENT & REMOVAL LOGIC
  // =====================================

  const handleBulkAssign = async (medicalsArray) => {
    const unassigned = medicalsArray.filter(m => !assignedTargets.some(t => t.id === m.id));
    if (unassigned.length === 0) return;

    setAssignedTargets(prev => [...prev, ...unassigned]); // Optimistic UI
    
    await fetch('/api/admin/planner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: selectedAgentId, targetIds: unassigned.map(m => m.id) })
    });
  };

  const handleBulkRemove = async (medicalsArray) => {
    const idsToRemove = medicalsArray.map(m => m.id);
    const assignedToRemove = assignedTargets.filter(t => idsToRemove.includes(t.id));
    
    if (assignedToRemove.length === 0) return;

    setAssignedTargets(prev => prev.filter(t => !idsToRemove.includes(t.id))); // Optimistic UI
    
    await fetch('/api/admin/planner', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: selectedAgentId, targetIds: idsToRemove })
    });
  };

  const handleRemove = async (medical) => {
    setAssignedTargets(prev => prev.filter(t => t.id !== medical.id)); // Optimistic UI update
    await fetch('/api/admin/planner', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: selectedAgentId, targetId: medical.id })
    });
  };

  // Helper function to check assignment status for UI buttons
  const getAssignmentStats = (medicalsArray) => {
    const total = medicalsArray.length;
    const assignedCount = medicalsArray.filter(m => assignedTargets.some(t => t.id === m.id)).length;
    return { total, assignedCount, isFullyAssigned: total > 0 && assignedCount === total, hasSomeAssigned: assignedCount > 0 };
  };

  return (
    <div className="flex-1 overflow-y-auto animate-in fade-in duration-200">
      <div className="p-4 md:p-8 lg:p-10 space-y-6 max-w-7xl mx-auto w-full pb-24 md:pb-10">
        
        {/* Top Controls */}
        <div className="bg-white rounded-2xl p-5 md:p-6" style={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-[13px] md:text-base font-semibold text-slate-800">Permanent Territory Dispatcher</h3>
              <p className="text-[11px] font-medium mt-0.5 text-slate-500">Assign shops to an agent permanently.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <select 
                value={selectedAgentId} 
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-800 outline-none transition-all appearance-none pr-10 focus:border-[#97c22a]"
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
            <span className="text-sm font-medium text-slate-400">Loading live territories...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* LEFT: MASTER HIERARCHY ACCORDION */}
            <div className="bg-white rounded-2xl flex flex-col h-[600px] overflow-hidden" style={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
                <h4 className="text-[13px] font-semibold text-slate-800">Available Territories</h4>
                <p className="text-[10px] text-slate-500">Bulk assign entire Areas/Places, or assign single shops.</p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {territories.length === 0 ? (
                  <div className="text-center py-10 text-[11px] text-slate-400">No territories setup yet. Go to Territory Setup first.</div>
                ) : territories.map(area => {
                  const allMedicalsInArea = area.places.flatMap(p => p.medicals);
                  const areaStats = getAssignmentStats(allMedicalsInArea);

                  return (
                    <div key={area.id} className="border border-slate-200 rounded-xl overflow-hidden transition-all shadow-sm">
                      {/* Area Header */}
                      <div className="w-full bg-slate-50 p-3.5 flex justify-between items-center hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => toggleArea(area.id)}>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-[#97c22a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          <span className="text-[13px] font-bold text-slate-800">{area.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Only show Assign if not fully assigned */}
                          {!areaStats.isFullyAssigned && areaStats.total > 0 && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleBulkAssign(allMedicalsInArea); }}
                              className="text-[10px] font-semibold bg-[#97c22a]/10 text-[#97c22a] px-2 py-1 rounded hover:bg-[#97c22a] hover:text-white transition-colors"
                            >
                              + Assign Area
                            </button>
                          )}
                          {/* Show Unassign if any are assigned */}
                          {areaStats.hasSomeAssigned && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleBulkRemove(allMedicalsInArea); }}
                              className="text-[10px] font-semibold bg-red-50 text-red-500 px-2 py-1 rounded hover:bg-red-500 hover:text-white transition-colors"
                            >
                              - Unassign Area
                            </button>
                          )}
                          <svg className={`w-4 h-4 text-slate-400 transition-transform ${expandedAreas[area.id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>

                      {/* Places List (Shows if Area is Expanded) */}
                      {expandedAreas[area.id] && (
                        <div className="p-2 space-y-2 bg-white">
                          {area.places.length === 0 ? <p className="text-[10px] text-slate-400 p-2 text-center">No places added to this area.</p> : area.places.map(place => {
                            const placeStats = getAssignmentStats(place.medicals);
                            
                            return (
                              <div key={place.id} className="border border-slate-100 rounded-lg overflow-hidden">
                                {/* Place Header */}
                                <div className="w-full bg-slate-50/50 p-2.5 flex justify-between items-center hover:bg-blue-50/50 transition-colors cursor-pointer" onClick={() => togglePlace(place.id)}>
                                  <span className="text-[12px] font-semibold text-slate-700 pl-2 border-l-2 border-blue-400">{place.name}</span>
                                  <div className="flex items-center gap-2">
                                    {/* Place Level Bulk Buttons */}
                                    {!placeStats.isFullyAssigned && placeStats.total > 0 && (
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleBulkAssign(place.medicals); }}
                                        className="text-[10px] font-semibold bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-600 hover:text-white transition-colors"
                                      >
                                        + Assign
                                      </button>
                                    )}
                                    {placeStats.hasSomeAssigned && (
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleBulkRemove(place.medicals); }}
                                        className="text-[10px] font-semibold bg-red-50 text-red-500 px-2 py-1 rounded hover:bg-red-500 hover:text-white transition-colors"
                                      >
                                        - Unassign
                                      </button>
                                    )}
                                    <span className="text-[10px] font-medium text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-full">{place.medicals.length} shops</span>
                                  </div>
                                </div>

                                {/* Medical Shops List (Shows if Place is Expanded) */}
                                {expandedPlaces[place.id] && (
                                  <div className="p-2 space-y-1.5 bg-white">
                                    {place.medicals.length === 0 ? <p className="text-[10px] text-slate-400 p-2 text-center">No medical shops registered here.</p> : place.medicals.map(med => {
                                      const isAssigned = assignedTargets.some(t => t.id === med.id);
                                      if (isAssigned) return null; // Hide if already assigned

                                      return (
                                        <div key={med.id} className="p-3 bg-white border border-slate-100 rounded-lg flex justify-between items-center hover:border-[#97c22a]/50 transition-all group">
                                          <div>
                                            <h5 className="text-[12px] font-semibold text-slate-800">{med.name}</h5>
                                            <p className="text-[10px] text-slate-500 mt-0.5">{med.address}</p>
                                          </div>
                                          <button 
                                            onClick={() => handleBulkAssign([med])} 
                                            className="w-7 h-7 rounded-md bg-[#97c22a]/10 text-[#97c22a] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[#97c22a] hover:text-white"
                                            title="Add to Territory"
                                          >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                                          </button>
                                        </div>
                                      );
                                    })}
                                    {/* Show message if all shops in this place are already assigned */}
                                    {placeStats.isFullyAssigned && (
                                      <p className="text-[10px] text-[#97c22a] font-medium text-center p-2 bg-[#97c22a]/5 rounded-lg border border-[#97c22a]/20">All shops in {place.name} are assigned.</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: AGENT'S TERRITORY */}
            <div className="bg-[#0a0f1a] rounded-2xl flex flex-col h-[600px] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#97c22a]/10 rounded-full blur-[60px] pointer-events-none"></div>
              
              <div className="relative z-10 px-5 py-4 border-b border-white/10 shrink-0 bg-black/20 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-semibold" style={{ background: 'rgba(151,194,42,0.15)', color: '#97c22a', border: '1px solid rgba(151,194,42,0.2)' }}>
                    {activeAgent?.name?.split(' ').map(w => w[0]).join('').slice(0, 2) || 'MR'}
                  </div>
                  <div>
                    <h4 className="text-[14px] font-semibold text-white">{activeAgent?.name}'s Territory</h4>
                    <p className="text-[11px] text-slate-400">Permanently assigned • {assignedTargets.length} shops</p>
                  </div>
                </div>
                {assignedTargets.length > 0 && (
                  <button 
                    onClick={() => handleBulkRemove(assignedTargets)}
                    className="text-[10px] font-semibold bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-3">
                {assignedTargets.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 mb-3">
                      <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                    </div>
                    <p className="text-[13px] font-medium text-slate-300">No territory assigned</p>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">Click the "Assign Area" or "Assign Place" buttons on the left.</p>
                  </div>
                ) : (
                  assignedTargets.map((target, idx) => (
                    <div key={target.id} className="p-4 rounded-xl flex items-center justify-between transition-all bg-white/5 border border-white/10 hover:border-[#e73e43]/40 group shadow-lg">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#97c22a] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <h5 className="text-[13px] font-semibold text-white leading-tight">{target.name}</h5>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{target.address}</p>
                        </div>
                      </div>
                      <button onClick={() => handleRemove(target)} className="w-8 h-8 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}