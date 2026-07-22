'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// 🚨 CRITICAL FIX: Load the map dynamically so Next.js doesn't crash on the server
const MapWrapper = dynamic(() => import('./MapWrapper'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 rounded-3xl animate-pulse">
      <div className="w-8 h-8 border-4 border-slate-300 border-t-[#97c22a] rounded-full animate-spin mb-3"></div>
      <p className="text-[13px] font-bold text-slate-500">Loading Map Engine...</p>
    </div>
  )
});

export default function EmployeeMapTab() {
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [visits, setVisits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingVisits, setIsFetchingVisits] = useState(false);

  // 1. Fetch the list of agents on load
  useEffect(() => {
    fetch('/api/admin/employee-map')
      .then(res => res.json())
      .then(data => {
        setAgents(data.agents || []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  // 2. Fetch visits whenever an agent is selected
  useEffect(() => {
    if (!selectedAgentId) {
      setVisits([]);
      return;
    }

    setIsFetchingVisits(true);
    fetch(`/api/admin/employee-map?agentId=${selectedAgentId}`)
      .then(res => res.json())
      .then(data => {
        setVisits(data.visits || []);
        setIsFetchingVisits(false);
      })
      .catch(err => {
        console.error(err);
        setIsFetchingVisits(false);
      });
  }, [selectedAgentId]);

  const validPinsCount = visits.filter(v => v.latitude && v.longitude).length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 animate-in fade-in duration-300">
      <div className="p-4 md:p-8 lg:p-10 w-full h-full flex flex-col max-w-7xl mx-auto gap-6">
        
        {/* ── HERO HEADER & DROPDOWN ── */}
        <div className="bg-[#0a0f1a] rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl shrink-0">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#97c22a]/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-[#97c22a] uppercase mb-1.5">Geographic Tracking</p>
              <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">Employee Visit Map</h3>
            </div>
            
            <div className="w-full md:w-80 shrink-0">
              <select 
                value={selectedAgentId} 
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="w-full px-4 py-3.5 bg-white/10 border border-white/20 text-white rounded-xl text-[14px] font-bold outline-none transition-all appearance-none cursor-pointer focus:border-[#97c22a] focus:bg-white/15"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2397c22a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.2rem center', backgroundSize: '1.2em' }}
              >
                <option value="" disabled className="text-slate-500 bg-white">Select an Employee...</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.employeeId || agent.id} className="text-slate-900 bg-white">
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── MAP CONTAINER ── */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative min-h-[400px]">
          
          {/* Floating Status Badge */}
          {selectedAgentId && (
            <div className="absolute top-4 right-4 z-[20] bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-slate-200 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#97c22a] animate-pulse"></div>
              <p className="text-[12px] font-bold text-slate-700">
                {isFetchingVisits ? 'Plotting pins...' : `${validPinsCount} Valid Locations Pinned`}
              </p>
            </div>
          )}

          {!selectedAgentId ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50">
              <div className="w-16 h-16 rounded-3xl bg-[#97C22A]/10 flex items-center justify-center mb-4 border border-[#97C22A]/20">
                <svg className="w-8 h-8 text-[#5c7a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-[16px] font-bold text-slate-800">Map Standby</p>
              <p className="text-[13px] font-medium text-slate-500 mt-1 max-w-sm">
                Select an employee from the dropdown above to load their physical visit history.
              </p>
            </div>
          ) : (
            <MapWrapper visits={visits} />
          )}

        </div>
      </div>
    </div>
  );
}