'use client';
import { useState, useRef, useMemo } from 'react';

export function SalesModals({ 
  isRegisterModalOpen, setIsRegisterModalOpen, newShopData, setNewShopData, handleRegisterShop, isRegistering,
  isDealModalOpen, setIsDealModalOpen, activeTarget, dealData, setDealData, handleDealSubmit, isSubmittingDeal,
  photoUri, setPhotoUri, masterTerritories 
}) {

  const [isLocatingVisit, setIsLocatingVisit] = useState(false);
  const [isLocatingShop, setIsLocatingShop] = useState(false); 
  
  const [showAreaSuggestions, setShowAreaSuggestions] = useState(false);
  const [showPlaceSuggestions, setShowPlaceSuggestions] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleNativeVisitCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUri(reader.result);
        
        setIsLocatingVisit(true);
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setDealData(prev => ({
                ...prev,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              }));
              setIsLocatingVisit(false);
            },
            (error) => {
              alert("Photo captured, but GPS lock failed. Please enable location services.");
              setIsLocatingVisit(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        } else {
          alert("Geolocation is not supported by your device browser.");
          setIsLocatingVisit(false);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = null; 
  };

  const interceptRegisterSubmit = (e) => {
    e.preventDefault();
    setIsLocatingShop(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNewShopData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          
          setIsLocatingShop(false);
          handleRegisterShop(e);
        },
        (error) => {
          alert("Could not get GPS location. Please enable location services to register a shop.");
          setIsLocatingShop(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert("Geolocation is not supported.");
      setIsLocatingShop(false);
    }
  };

  const filteredAreas = useMemo(() => {
    if (!newShopData.areaName) return masterTerritories || [];
    return (masterTerritories || []).filter(a => 
      a.name.toLowerCase().includes(newShopData.areaName.toLowerCase())
    );
  }, [newShopData.areaName, masterTerritories]);

  const matchedAreaObj = useMemo(() => {
    if (!newShopData.areaName) return null;
    return masterTerritories?.find(a => a.name.toLowerCase() === newShopData.areaName.toLowerCase());
  }, [newShopData.areaName, masterTerritories]);

  const availablePlaces = matchedAreaObj ? matchedAreaObj.places : [];

  const filteredPlaces = useMemo(() => {
    if (!newShopData.placeName) return availablePlaces;
    return availablePlaces.filter(p => 
      p.name.toLowerCase().includes(newShopData.placeName.toLowerCase())
    );
  }, [newShopData.placeName, availablePlaces]);

  return (
    <>
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={fileInputRef} 
        onChange={handleNativeVisitCapture} 
        className="hidden" 
      />

      {/* 1. REGISTER NEW SHOP MODAL */}
      {isRegisterModalOpen && (
        <div className="absolute inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4" style={{ background: 'rgba(10,15,26,0.7)', backdropFilter: 'blur(6px)' }}>
          <div className="w-full sm:max-w-md bg-white relative overflow-hidden rounded-t-2xl sm:rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <p className="text-[13px] font-semibold text-slate-800">Register New Medical</p>
                <p className="text-[11px] text-slate-500">Add to master database</p>
              </div>
              <button onClick={() => setIsRegisterModalOpen(false)} className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center active:scale-95 transition-transform"><svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            
            <form onSubmit={interceptRegisterSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Area / City</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Type area..." 
                    value={newShopData.areaName || ''} 
                    onChange={e => {
                      setNewShopData({...newShopData, areaName: e.target.value, placeName: ''});
                      setShowAreaSuggestions(true);
                    }} 
                    onFocus={() => setShowAreaSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowAreaSuggestions(false), 200)}
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-semibold text-[#1E293B] outline-none focus:border-[#97C22A] transition-colors" 
                  />
                  {showAreaSuggestions && filteredAreas.length > 0 && (
                    <ul className="absolute z-20 w-full mt-1 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                      {filteredAreas.map(area => (
                        <li 
                          key={area.id} 
                          onClick={() => {
                            setNewShopData({...newShopData, areaName: area.name, placeName: ''});
                            setShowAreaSuggestions(false);
                          }}
                          className="px-4 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-[#97C22A]/10 hover:text-[#97C22A] cursor-pointer border-b border-slate-50 last:border-0"
                        >
                          {area.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Place / Zone</label>
                  <input 
                    type="text" 
                    required 
                    disabled={!newShopData.areaName}
                    placeholder={newShopData.areaName ? "Type place..." : "Select Area first"} 
                    value={newShopData.placeName || ''} 
                    onChange={e => {
                      setNewShopData({...newShopData, placeName: e.target.value});
                      setShowPlaceSuggestions(true);
                    }} 
                    onFocus={() => setShowPlaceSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowPlaceSuggestions(false), 200)}
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-semibold text-[#1E293B] outline-none focus:border-[#97C22A] disabled:opacity-50 transition-colors" 
                  />
                  {showPlaceSuggestions && newShopData.areaName && filteredPlaces.length > 0 && (
                    <ul className="absolute z-20 w-full mt-1 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                      {filteredPlaces.map(place => (
                        <li 
                          key={place.id} 
                          onClick={() => {
                            setNewShopData({...newShopData, placeName: place.name});
                            setShowPlaceSuggestions(false);
                          }}
                          className="px-4 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-[#97C22A]/10 hover:text-[#97C22A] cursor-pointer border-b border-slate-50 last:border-0"
                        >
                          {place.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Shop Name</label>
                <input type="text" required value={newShopData.name || ''} onChange={e => setNewShopData({...newShopData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#97C22A]" placeholder="e.g. Wellness Medicos" />
              </div>
              
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Full Address</label>
                <textarea rows="2" value={newShopData.address || ''} onChange={e => setNewShopData({...newShopData, address: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#97C22A] resize-none" placeholder="Street, Landmark..."></textarea>
              </div>
              
              <div className="bg-[#97C22A]/10 border border-[#97C22A]/20 p-3 rounded-xl flex items-start gap-3 mt-4">
                <svg className="w-5 h-5 text-[#97C22A] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                <p className="text-[10px] text-slate-700 leading-relaxed font-medium">
                  Clicking continue will capture your live GPS location and lock this medical shop to the master database permanently.
                </p>
              </div>

              <button 
                type="submit" 
                disabled={isRegistering || isLocatingShop || !newShopData.placeName} 
                className="w-full py-3.5 mt-2 bg-[#0A0F1A] text-white hover:bg-[#97C22A] hover:text-[#0A0F1A] font-bold tracking-wide rounded-xl text-[13px] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLocatingShop ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Locking Coordinates...
                  </>
                ) : isRegistering ? (
                  'Saving Database...'
                ) : (
                  'Save & Proceed to Visit'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. LOG VISIT / DEAL MODAL */}
      {isDealModalOpen && activeTarget && (
         <div className="absolute inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4" style={{ background: 'rgba(10,15,26,0.7)', backdropFilter: 'blur(6px)' }}>
          <div className="w-full sm:max-w-md bg-white relative overflow-hidden rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90dvh]">
            
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
              <div>
                <p className="text-[13px] font-bold text-[#1E293B]">Log Visit Report</p>
                <p className="text-[11px] text-[#97C22a] font-bold tracking-wide">VERIFY VISIT AND COLLECT ORDER</p>
              </div>
              <button 
                onClick={() => {
                  setIsDealModalOpen(false);
                  setPhotoUri(null); 
                  // CLEAR NEW PAYMENT METHOD STATE ON CLOSE
                  setDealData({ orderAmount: '', collectionAmount: '', paymentMethod: '', remark: '', latitude: null, longitude: null }); 
                }} 
                className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-transform"
              >
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleDealSubmit} className="p-5 space-y-5 overflow-y-auto flex-1">
              
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Location</p>
                <h4 className="text-[14px] font-bold text-slate-800 leading-tight">{activeTarget.name}</h4>
                <p className="text-[11px] font-medium text-slate-500 mt-1">{activeTarget.address}</p>
                <div className="mt-2.5 inline-flex items-center gap-1.5 text-[10px] font-bold bg-[#97c22a]/10 text-[#97c22a] px-2.5 py-1 rounded-md border border-[#97c22a]/20">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                  Area: {activeTarget.areaName || 'Newly Discovered'}
                </div>
              </div>

              {/* ── PHOTO & GPS VERIFICATION WIDGET ── */}
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-[#94A3B8] uppercase mb-1.5">Proof of Visit (Required)</label>
                {photoUri ? (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden border-2 border-[#97C22A] shadow-sm">
                    <img src={photoUri} alt="Shop Proof" className="w-full h-full object-cover" />
                    
                    <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm rounded-lg p-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isLocatingVisit ? (
                          <>
                            <div className="w-3 h-3 border-2 border-[#97C22A] border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-[10px] font-bold text-white tracking-wide">Locking GPS...</span>
                          </>
                        ) : dealData.latitude ? (
                          <>
                            <div className="w-2 h-2 rounded-full bg-[#97C22A] animate-pulse"></div>
                            <span className="text-[10px] font-bold text-white tracking-wide">Location Verified</span>
                          </>
                        ) : (
                          <span className="text-[10px] font-bold text-red-400 tracking-wide">GPS Failed</span>
                        )}
                      </div>
                    </div>

                    <button 
                      type="button" 
                      onClick={() => {
                        setPhotoUri(null);
                        setDealData(prev => ({...prev, latitude: null, longitude: null}));
                      }} 
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg shadow-lg hover:bg-red-600 active:scale-95 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()} 
                    className="w-full h-28 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-500 hover:bg-[#97C22A]/5 hover:border-[#97C22A] hover:text-[#97C22A] transition-colors active:scale-[0.98]"
                  >
                    <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <span className="text-[12px] font-bold tracking-wide">Tap to Capture Image & GPS</span>
                  </button>
                )}
              </div>

              {/* ── NEW PAYMENT METHOD UI ── */}
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-[#94A3B8] uppercase mb-1.5">Payment Method</label>
                <select 
                  required
                  value={dealData.paymentMethod || ''} 
                  onChange={e => setDealData({...dealData, paymentMethod: e.target.value})} 
                  className="w-full px-4 py-3 bg-[#F0F2F5] border border-[#E2E8F0] rounded-xl text-[13px] font-bold text-[#1E293B] outline-none focus:ring-2 focus:ring-[#97C22A]/30 focus:border-[#97C22A] transition-all cursor-pointer"
                >
                  <option value="" disabled>Select Method...</option>
                  <option value="None">None (No Collection)</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-[#94A3B8] uppercase mb-1.5">Order Amount (₹)</label>
                  <input type="number" required min="0" value={dealData.orderAmount} onChange={e => setDealData({...dealData, orderAmount: e.target.value})} className="w-full px-4 py-3 bg-[#F0F2F5] border border-[#E2E8F0] rounded-xl text-[13px] font-bold text-[#1E293B] outline-none focus:ring-2 focus:ring-[#97C22A]/30 focus:border-[#97C22A] transition-all" placeholder="Min. 0" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-[#94A3B8] uppercase mb-1.5">Collection (₹)</label>
                  <input type="number" required min="0" value={dealData.collectionAmount} onChange={e => setDealData({...dealData, collectionAmount: e.target.value})} className="w-full px-4 py-3 bg-[#F0F2F5] border border-[#E2E8F0] rounded-xl text-[13px] font-bold text-[#1E293B] outline-none focus:ring-2 focus:ring-[#97C22A]/30 focus:border-[#97C22A] transition-all" placeholder="Min. 0" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-widest text-[#94A3B8] uppercase mb-1.5">Remark / Notes</label>
                <textarea rows="2" value={dealData.remark} onChange={e => setDealData({...dealData, remark: e.target.value})} className="w-full px-4 py-3 bg-[#F0F2F5] border border-[#E2E8F0] rounded-xl text-[13px] font-semibold text-[#1E293B] resize-none outline-none focus:ring-2 focus:ring-[#97C22A]/30 focus:border-[#97C22A] transition-all" placeholder="Doctor unavailable, feedback, etc."></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSubmittingDeal || !photoUri || isLocatingVisit || !dealData.latitude || !dealData.paymentMethod} 
                className="w-full py-4 mt-2 bg-[#0A0F1A] text-white hover:bg-[#97C22A] hover:text-[#0A0F1A] font-bold tracking-wider rounded-xl text-[13px] uppercase active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg"
              >
                {isLocatingVisit ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Locking GPS...
                  </>
                ) : isSubmittingDeal ? (
                  'Saving Data...'
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Submit & Close Visit
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}