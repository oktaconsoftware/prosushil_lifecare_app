'use client';

export default function RadarTab({ nearbyShops, isScanning, scanArea, initiateCheckIn, setIsDealModalOpen, setIsRegisterModalOpen }) {
  return (
    <div className="flex-1 overflow-y-auto animate-in fade-in duration-200">
      <div className="p-4 space-y-4 pb-24 max-w-4xl mx-auto relative">
        
        <div className="bg-slate-900 rounded-3xl p-6 relative overflow-hidden shadow-xl mb-6 text-center">
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
            <div className="w-32 h-32 border border-purple-500 rounded-full animate-ping"></div>
            <div className="w-48 h-48 border border-purple-500 rounded-full absolute"></div>
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-semibold text-white tracking-tight">Geofence Radar</h3>
            <p className="text-[11px] text-slate-400 mt-1 mb-4">Scanning for recognized pharmacies within 200 meters...</p>
            <button onClick={scanArea} disabled={isScanning} className="px-6 py-2 rounded-full text-xs font-semibold text-white bg-purple-600 disabled:opacity-50 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              {isScanning ? 'Scanning...' : 'Rescan Area'}
            </button>
          </div>
        </div>

        <h3 className="text-[13px] font-semibold text-slate-800 mb-2">Recognized Shops Nearby</h3>
        
        {nearbyShops.length === 0 && !isScanning ? (
          <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs font-medium text-slate-500">No known shops found in this area.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {nearbyShops.map(shop => (
              <div key={shop.id} className="bg-white rounded-2xl p-4 flex items-center justify-between border border-slate-200 shadow-sm hover:border-purple-300 transition-colors">
                <div>
                  <h4 className="text-[13px] font-semibold text-slate-800">{shop.name}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{shop.distance}m away</p>
                </div>
                <button onClick={() => { initiateCheckIn(shop); setIsDealModalOpen(true); }} className="px-4 py-2 rounded-xl text-[11px] font-semibold text-white bg-purple-600 shadow-sm active:scale-95 transition-all">
                  Check In
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-center">
            <h4 className="text-[13px] font-semibold text-blue-900 mb-1">Standing at a new medical shop?</h4>
            <p className="text-[10px] text-blue-600 mb-4 leading-relaxed">Register it to the global database so you and your team never have to type it again.</p>
            <button onClick={() => setIsRegisterModalOpen(true)} className="w-full py-3 rounded-xl text-xs font-semibold text-white bg-blue-600 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              Register New Shop
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}