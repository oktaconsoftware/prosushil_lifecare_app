'use client';

// 👇 1. Added setIsRegisterModalOpen to the props here
export default function TerritoryTab({ targets, isLoadingRoute, activeTarget, setIsDealModalOpen, initiateCheckIn, totalCommission, setIsRegisterModalOpen }) {
  
  const groupedTerritory = targets.reduce((acc, target) => {
    const area = target.areaName || 'Unassigned Area';
    const place = target.placeName || 'Unassigned Place';
    if (!acc[area]) acc[area] = {};
    if (!acc[area][place]) acc[area][place] = [];
    acc[area][place].push(target);
    return acc;
  }, {});

  return (
    <div className="flex-1 overflow-y-auto animate-in fade-in duration-200">
      <div className="p-4 md:p-8 lg:p-10 space-y-6 pb-24 md:pb-10 max-w-4xl mx-auto w-full">

        <div className="grid grid-cols-2 gap-3 md:gap-5">
          <div className="relative overflow-hidden p-4 md:p-5 rounded-2xl bg-white" style={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <p className="text-[10px] md:text-[11px] font-semibold tracking-wide mb-1" style={{ color: '#8896aa' }}>Total Assigned Shops</p>
            <p className="text-lg md:text-2xl font-semibold text-slate-800 tracking-tight leading-none">{targets.length}</p>
          </div>
          <div className="relative overflow-hidden p-4 md:p-5 rounded-2xl bg-white" style={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <p className="text-[10px] md:text-[11px] font-semibold tracking-wide mb-1" style={{ color: '#97c22a' }}>Daily commission</p>
            <p className="text-lg md:text-2xl font-semibold text-slate-800 tracking-tight leading-none">₹{totalCommission.toLocaleString('en-IN')}</p>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl" style={{ background: '#97c22a' }} />
          </div>
        </div>

        {/* 👇 2. Added the "Register New Shop" Button Header here */}
        <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-2xl p-4 shadow-sm">
          <div>
            <h4 className="text-[13px] font-semibold text-blue-900">Found a new prospect?</h4>
            <p className="text-[10px] text-blue-600 mt-0.5">Add it to your territory permanently.</p>
          </div>
          <button 
            onClick={() => setIsRegisterModalOpen(true)} 
            className="px-4 py-2.5 rounded-xl text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-md flex items-center gap-1.5 shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
            Add New Shop
          </button>
        </div>

        {isLoadingRoute ? (
          <div className="text-center py-10 text-sm font-medium text-slate-500">Loading your territory...</div>
        ) : targets.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-500">No assigned territory. Use the Area Radar to find shops.</div>
        ) : (
          Object.entries(groupedTerritory).map(([areaName, places]) => (
            <div key={areaName} className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* HIGHLIGHTED AREA BANNER */}
              <div className="bg-[#0a0f1a] rounded-t-2xl p-4 flex items-center gap-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#97c22a]/20 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/5 relative z-10">
                  <svg className="w-5 h-5 text-[#97c22a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Operating Area</p>
                  <h3 className="text-lg font-bold text-white leading-none">{areaName}</h3>
                </div>
              </div>
              
              {/* PLACES & SHOPS */}
              <div className="bg-white border border-slate-200 border-t-0 rounded-b-2xl p-4 space-y-4 shadow-sm">
                {Object.entries(places).map(([placeName, shops]) => (
                  <div key={placeName} className="border border-slate-100 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-700">{placeName}</span>
                      <span className="text-[10px] font-medium bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-500">{shops.length} shops</span>
                    </div>
                    
                    <div className="divide-y divide-slate-100">
                      {shops.map(target => (
                        <div key={target.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="text-[13px] font-semibold text-slate-800 leading-tight">{target.name}</h4>
                              <p className="text-[11px] font-medium mt-0.5 text-slate-500">{target.address}</p>
                            </div>
                            
                            {/* SINGLE BUTTON -> DIRECT TO MODAL */}
                            {target.status === 'COMPLETED' ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-[#97c22a]/10 text-[#97c22a] border border-[#97c22a]/20">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg> Visited
                              </span>
                            ) : (
                              <button 
                                onClick={() => { initiateCheckIn(target); setIsDealModalOpen(true); }} 
                                className="px-4 py-2 rounded-xl text-[11px] font-bold text-white bg-[#0a0f1a] hover:bg-[#97c22a] active:scale-95 transition-all shadow-md flex items-center gap-1.5"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                Log Visit
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}