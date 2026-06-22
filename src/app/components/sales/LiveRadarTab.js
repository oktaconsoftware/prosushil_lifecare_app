'use client';
import { useState, useRef, useMemo } from 'react';

export default function LiveRadarTab({ allShops, initiateCheckIn, setIsDealModalOpen }) {
  const [step, setStep] = useState('camera'); // 'camera' | 'radar'
  const [photoUri, setPhotoUri] = useState(null);
  const [location, setLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);

  // 1. Handle Camera Capture & GPS
  const handleCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUri(reader.result);
        findLocationAndShops();
      };
      reader.readAsDataURL(file);
    }
  };

  // 2. Grab GPS Location
  const findLocationAndShops = () => {
    setIsLocating(true);
    setStep('radar'); // Move to radar view immediately to show loading state

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLocating(false);
        },
        (error) => {
          console.warn("GPS Error:", error);
          alert("Could not get exact GPS. Please ensure Location Services are enabled.");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setIsLocating(false);
    }
  };

  // 3. Smart Filter: By Search Query OR By GPS Distance
  const filteredShops = useMemo(() => {
    let result = allShops || [];

    // If typing in search bar, prioritize text search
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      result = result.filter(shop => 
        shop.name?.toLowerCase().includes(q) || 
        shop.address?.toLowerCase().includes(q)
      );
    } 
    // If no search query, try to sort/filter by GPS distance (mocked radius logic)
    else if (location && result.length > 0) {
      // Basic Pythagorean distance for demo purposes
      result = result.map(shop => {
        const dLat = (Number(shop.latitude) || 0) - location.lat;
        const dLng = (Number(shop.longitude) || 0) - location.lng;
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);
        return { ...shop, distance: dist };
      })
      .sort((a, b) => a.distance - b.distance) // Closest first
      .slice(0, 15); // Show only the 15 closest shops to save screen space
    }

    return result;
  }, [allShops, searchQuery, location]);


  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 relative" style={{ WebkitOverflowScrolling: 'touch' }}>
      
      {/* Hidden native file input for camera */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={fileInputRef}
        onChange={handleCapture}
        className="hidden" 
      />

      {/* =========================================
          STEP 1: CAMERA & VERIFICATION SCREEN
      ========================================= */}
      {step === 'camera' && (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-300">
          
          <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 border-2 border-blue-500 rounded-full animate-ping opacity-20"></div>
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-2">Field Verification</h2>
          <p className="text-[13px] text-slate-500 max-w-[280px] mb-10 leading-relaxed">
            Snap a live photo of your surroundings to activate the Area Radar and discover shops near you.
          </p>

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full max-w-[280px] bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-4 font-bold text-[15px] shadow-lg shadow-blue-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
            Open Camera
          </button>
        </div>
      )}

      {/* =========================================
          STEP 2: RADAR & SEARCH SCREEN
      ========================================= */}
      {step === 'radar' && (
        <div className="max-w-2xl mx-auto w-full pb-28 animate-in fade-in slide-in-from-bottom-4 duration-400">
          
          {/* HEADER: Verified Tag + Search Bar */}
          <div className="bg-[#0A0F1A] px-4 md:px-6 pt-6 pb-6 rounded-b-3xl shadow-lg relative z-20">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Status</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-[#97C22A] animate-pulse"></div>
                  <h3 className="text-[15px] font-bold text-white">Live Area Radar</h3>
                </div>
              </div>
              
              {/* Captured Photo Thumbnail */}
              {photoUri && (
                <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white/10 shadow-sm relative group cursor-pointer" onClick={() => setStep('camera')}>
                  <img src={photoUri} alt="Verification" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                  </div>
                </div>
              )}
            </div>

            {/* Smart Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="w-4.5 h-4.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input
                type="text"
                placeholder="Search individual medical shop..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-xl pl-10 pr-4 py-3.5 text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#97C22A]/50 focus:border-[#97C22A] transition-all"
              />
            </div>
          </div>

          {/* LIST OF SHOPS */}
          <div className="px-4 md:px-6 pt-5">
            {/* Contextual Header */}
            <h4 className="text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-3 pl-1">
              {searchQuery.length > 0 ? 'Search Results' : 'Nearby Database Shops'}
            </h4>

            {isLocating ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-[12px] font-semibold text-slate-500">Scanning GPS area...</p>
              </div>
            ) : filteredShops.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 mt-2">
                <p className="text-[13px] font-bold text-slate-700">No shops found.</p>
                <p className="text-[11px] font-medium text-slate-500 mt-1">Try searching a different name.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
                {filteredShops.map(shop => (
                  <div key={shop.id} className="p-4 flex items-center justify-between gap-3 active:bg-slate-50 transition-colors">
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[14px] font-bold text-slate-800 truncate">{shop.name}</h4>
                      <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">{shop.address}</p>
                    </div>

                    <div className="shrink-0">
                      {shop.status === 'COMPLETED' ? (
                        <div className="inline-flex items-center gap-1 bg-[#97C22A]/10 px-2.5 py-1.5 rounded-lg">
                          <svg className="w-3.5 h-3.5 text-[#97C22A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                          <span className="text-[10px] font-bold text-[#97C22A]">Done</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => { initiateCheckIn(shop); setIsDealModalOpen(true); }}
                          className="px-4 py-2 bg-[#0A0F1A] text-white rounded-lg text-[11px] font-bold active:scale-95 transition-all flex items-center gap-1.5"
                        >
                          Visit
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}