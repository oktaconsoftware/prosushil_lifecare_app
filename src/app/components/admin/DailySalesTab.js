'use client';
import { useState, useEffect } from 'react';

export default function DailySalesTab() {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for Employee Dropdown Filter
  const [selectedAgentId, setSelectedAgentId] = useState('ALL');

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/admin/daily-sales?date=${date}`)
      .then(res => res.json())
      .then(data => {
        setSalesData(data || []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, [date]);

  // Filter data based on dropdown selection
  const filteredData = selectedAgentId === 'ALL' 
    ? salesData 
    : salesData.filter(agent => agent.id === selectedAgentId);

  return (
    <div className="flex-1 overflow-y-auto animate-in fade-in duration-300 bg-slate-50">
      <div className="p-4 md:p-8 lg:p-10 space-y-6 md:space-y-8 pb-24 md:pb-10 max-w-7xl mx-auto w-full">
        
        {/* ── HEADER & DATE PICKER ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h3 className="text-[15px] md:text-lg font-bold text-slate-800 tracking-tight">Team Performance</h3>
            <p className="text-[11px] text-slate-500 mt-1">Select a date to view Today vs Monthly performance.</p>
          </div>
          
          <div className="w-full md:w-56">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Select Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-[#F0F2F5] border border-[#E2E8F0] rounded-xl text-[13px] font-bold text-[#1E293B] outline-none transition-all cursor-pointer"
            />
          </div>
        </div>

        {/* ── EMPLOYEE FILTER (DARK HERO CARD) ── */}
        <div className="bg-[#0a0f1a] rounded-xl p-6 md:p-8 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#97c22a]/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-[#97c22a] uppercase mb-1.5">Employee Filter</p>
              <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">View Specific Agent</h3>
            </div>
            
            <div className="w-full md:w-72 shrink-0">
              <select 
                value={selectedAgentId} 
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="w-full px-4 py-3.5 bg-white/10 border border-white/20 text-white rounded-xl text-[13px] font-bold outline-none transition-all appearance-none cursor-pointer focus:border-[#97c22a] focus:bg-white/15"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2397c22a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.2rem center', backgroundSize: '1.2em' }}
              >
                <option value="ALL" className="text-slate-900 bg-white">All Employees</option>
                {salesData.map(agent => (
                  <option key={agent.id} value={agent.id} className="text-slate-900 bg-white">
                    {agent.name} ({agent.id})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── EXCEL-LIKE DATA TABLE ── */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
             <div className="w-8 h-8 border-4 border-slate-200 border-t-[#97c22a] rounded-full animate-spin mb-3"></div>
             <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Loading Employee Data...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <p className="text-center text-slate-500 py-10 bg-white rounded-2xl border border-slate-200 shadow-sm">No agents found for this selection.</p>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-10">
            <div className="overflow-x-auto overflow-y-auto max-h-[65vh] custom-scrollbar">
              <table className="w-full text-left border-collapse whitespace-nowrap relative">
                
                {/* Master Headers */}
                <thead className="sticky top-0 z-20 shadow-sm">
                  <tr>
                    <th className="bg-slate-100 border-b border-r border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 w-12 text-center" rowSpan="2">Rank</th>
                    <th className="bg-slate-100 border-b border-r border-slate-200 px-4 py-2 text-xs font-bold text-slate-700" rowSpan="2">Employee Name</th>
                    <th className="bg-slate-100 border-b border-r border-slate-200 px-4 py-2 text-xs font-bold text-slate-700" rowSpan="2">Area</th>
                    <th className="bg-blue-50 border-b border-r border-slate-300 px-4 py-2 text-xs font-bold text-blue-900 text-center" colSpan="4">
                      Today ({new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })})
                    </th>
                    <th className="bg-[#f4faeb] border-b border-slate-300 px-4 py-2 text-xs font-bold text-[#5c7a1a] text-center" colSpan="3">
                      Monthly (Till Date)
                    </th>
                  </tr>
                  
                  {/* Sub Headers */}
                  <tr>
                    <th className="bg-blue-50/60 border-b border-r border-slate-200 px-4 py-2 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-center">Visits</th>
                    <th className="bg-blue-50/60 border-b border-r border-slate-200 px-4 py-2 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-right">Sales (₹)</th>
                    <th className="bg-blue-50/60 border-b border-r border-slate-200 px-4 py-2 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-right">Cash (₹)</th>
                    <th className="bg-blue-50/60 border-b border-r border-slate-300 px-4 py-2 text-[11px] font-bold text-slate-600 uppercase tracking-wider">Pay Method</th>
                    
                    <th className="bg-[#f4faeb]/60 border-b border-r border-slate-200 px-4 py-2 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-center">Visits</th>
                    <th className="bg-[#f4faeb]/60 border-b border-r border-slate-200 px-4 py-2 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-right">Sales (₹)</th>
                    <th className="bg-[#f4faeb]/60 border-b border-slate-200 px-4 py-2 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-right">Cash (₹)</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                  {filteredData.map((agent, index) => (
                    <tr key={agent.id} className="hover:bg-slate-50/80 transition-colors group">
                      
                      {/* Rank Logic */}
                      <td className="border-b border-r border-slate-200 px-4 py-2.5 text-center text-lg bg-slate-50/30">
                        {selectedAgentId === 'ALL' && index === 0 ? '🥇' : 
                         selectedAgentId === 'ALL' && index === 1 ? '🥈' : 
                         selectedAgentId === 'ALL' && index === 2 ? '🥉' : 
                         <span className="text-xs font-semibold text-slate-400">{index + 1}</span>}
                      </td>

                      <td className="border-b border-r border-slate-200 px-4 py-2.5">
                        <p className="text-sm font-bold text-slate-800">{agent.name}</p>
                        <p className="text-[10px] font-semibold text-slate-400">{agent.id}</p>
                      </td>

                      <td className="border-b border-r border-slate-200 px-4 py-2.5 text-xs font-medium text-slate-600">
                        {agent.area || '-'}
                      </td>

                      {/* Today Data */}
                      <td className="border-b border-r border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 text-center">
                        {agent.visitCount || 0}
                      </td>
                      <td className="border-b border-r border-slate-200 px-4 py-2.5 text-sm font-bold text-blue-600 text-right bg-blue-50/10">
                        {(agent.orderVolume || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="border-b border-r border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 text-right">
                        {(agent.collectionVolume || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="border-b border-r border-slate-300 px-4 py-2.5 text-xs font-medium text-slate-500">
                        {agent.paymentMethod || '-'}
                      </td>

                      {/* Monthly Data */}
                      <td className="border-b border-r border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 text-center bg-[#f4faeb]/20">
                        {agent.monthlyVisitCount || 0}
                      </td>
                      <td className="border-b border-r border-slate-200 px-4 py-2.5 text-sm font-bold text-[#659c12] text-right bg-[#f4faeb]/40">
                        {(agent.monthlyOrderVolume || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="border-b border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 text-right bg-[#f4faeb]/20">
                        {(agent.monthlyCollectionVolume || 0).toLocaleString('en-IN')}
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}