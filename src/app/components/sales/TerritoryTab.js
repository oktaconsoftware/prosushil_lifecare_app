'use client';
import { useState, useRef, useMemo, useEffect } from 'react';

function getDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999999;
  const R = 6371e3;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dp / 2) * Math.sin(dp / 2) +
    Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  return Math.round(R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))));
}

export default function TerritoryTab({
  targets,
  masterTerritories,
  masterAreas,
  isLoadingRoute,
  totalCollection,
  setPhotoUri,
  onRefreshData
}) {
  const [step, setStep] = useState('camera');
  const [selectedArea, setSelectedArea] = useState(''); 
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
  const [areaSearchQuery, setAreaSearchQuery] = useState(''); // NEW: Search state
  const [localPhoto, setLocalPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  const [nearbyShops, setNearbyShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState('');
  const [formData, setFormData] = useState({
    orderAmount: '',
    collectionAmount: '',
    paymentMethod: 'Cash',
    remark: ''
  });

  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const GEOFENCE_RADIUS_METERS = 1000;

  const uniqueAreas = useMemo(() => {
    const fromMasterTerritories = Array.isArray(masterTerritories) ? masterTerritories.map(a => a.name) : [];
    const fromMasterAreas = Array.isArray(masterAreas) ? masterAreas.map(a => a.name) : [];
    const fromTargets = Array.isArray(targets) ? targets.map(t => t.areaName) : [];

    return [...new Set([...fromMasterTerritories, ...fromMasterAreas, ...fromTargets]
      .filter(Boolean)
      .filter(name => name !== 'Unassigned Area')
    )].sort();
  }, [targets, masterTerritories, masterAreas]);

  // NEW: Filter areas based on search query
  const filteredAreas = useMemo(() => {
    if (!areaSearchQuery) return uniqueAreas;
    return uniqueAreas.filter(area => 
      area.toLowerCase().includes(areaSearchQuery.toLowerCase())
    );
  }, [uniqueAreas, areaSearchQuery]);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('assignedSalesArea');
    if (saved) setSelectedArea(saved);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsAreaDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);


  useEffect(() => {
    // 🚨 DEVELOPER BYPASS: Always allow if testing locally on your computer
    if (window.location.hostname === 'localhost') {
      setIsMobile(true);
      return;
    }

    // Standard security check for production
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android/i.test(userAgent) || /iPad|iPhone|iPod/.test(userAgent)) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  }, []);

  const toggleArea = (area) => {
    setSelectedArea(area);
    localStorage.setItem('assignedSalesArea', area);
    setIsAreaDropdownOpen(false);
    setAreaSearchQuery(''); // Reset search when selected
    setStep('camera');
    setLocalPhoto(null);
    setLocation(null);
    if (setPhotoUri) setPhotoUri(null);
  };

  const activeTargets = useMemo(() => {
    if (!selectedArea) return [];
    return targets?.filter((t) => t.areaName === selectedArea) || [];
  }, [targets, selectedArea]);

  const visitedCount = activeTargets.filter((t) => t.status === 'COMPLETED').length || 0;
  const totalCount = activeTargets.length || 0;
  const safeCollection = totalCollection || 0;
  const progress = totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;

const handleCapture = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsLocating(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // MODIFIED: Aggressive scaling to guarantee it stays under Next.js 1MB limits
        const MAX_WIDTH = 600; 
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) { 
            height *= Math.round(MAX_WIDTH / width); 
            width = MAX_WIDTH; 
          }
        } else {
          if (height > MAX_HEIGHT) { 
            width *= Math.round(MAX_HEIGHT / height); 
            height = MAX_HEIGHT; 
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width; 
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Fill with white background in case of transparent PNGs to prevent black backgrounds
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // MODIFIED: Quality dropped to 0.5 (perfectly readable for shop verifications, massively reduces Base64 length)
        const compressedPhoto = canvas.toDataURL('image/jpeg', 0.5);
        
        setLocalPhoto(compressedPhoto);
        if (setPhotoUri) setPhotoUri(compressedPhoto);
        
        verifyGeofence();
      };
      img.src = event.target.result;
    };
    
    reader.readAsDataURL(file);
    
    // NEW: Clear the input so the salesman can take another photo if needed
    e.target.value = ''; 
  };
const verifyGeofence = () => {
    // 1. HTTPS Security Check
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      alert("🚨 GPS requires a secure HTTPS connection.");
      setIsLocating(false);
      setStep('camera');
      return;
    }

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      setIsLocating(false);
      return;
    }

    // 🚨 THE KILL SWITCH: Force-stop everything after 12 seconds
    let isResolved = false;
    const killSwitchTimer = setTimeout(() => {
      if (!isResolved) {
        isResolved = true; // Mark as done so late GPS responses are ignored
        alert("⚠️ GPS is completely unresponsive.\n\nPlease check your phone settings:\n1. Ensure 'Location' is turned ON.\n2. Ensure your browser has permission to use Location.");
        setIsLocating(false);
        setStep('camera');
      }
    }, 12000); 

    const handleLocationSuccess = (pos) => {
      if (isResolved) return; // Prevent running if kill switch already fired
      isResolved = true;
      clearTimeout(killSwitchTimer); // Turn off the kill switch

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const shopsWithGps = activeTargets.filter(s => s.latitude && s.longitude);
      
      let closestShop = null;
      let minDistance = Infinity;

      shopsWithGps.forEach((s) => {
        const d = getDistance(lat, lng, Number(s.latitude), Number(s.longitude));
        if (d < minDistance) { minDistance = d; closestShop = s; }
      });

      let availableOptions = activeTargets.map(s => {
        const hasGps = s.latitude && s.longitude;
        let dist = hasGps ? getDistance(lat, lng, Number(s.latitude), Number(s.longitude)) : undefined;
        return {
          ...s,
          isNewAnchor: !hasGps,
          distance: dist
        };
      });
      
      let autoSelectId = "";
      if (closestShop && minDistance <= GEOFENCE_RADIUS_METERS) {
        autoSelectId = closestShop.id.toString();
      }

      availableOptions.sort((a, b) => {
         if (autoSelectId) {
           if (a.id.toString() === autoSelectId) return -1;
           if (b.id.toString() === autoSelectId) return 1;
         }
         if (a.isNewAnchor && !b.isNewAnchor) return -1;
         if (!a.isNewAnchor && b.isNewAnchor) return 1;
         if (!a.isNewAnchor && !b.isNewAnchor) return a.distance - b.distance;
         return 0;
      });

      setLocation({ lat, lng });
      setNearbyShops(availableOptions);
      setSelectedShopId(autoSelectId);
      setIsLocating(false);
      setStep('form');
    };

    const handleLocationError = (error) => {
      if (isResolved) return;
      isResolved = true;
      clearTimeout(killSwitchTimer);
      
      alert('Could not get location. Please enable Location permissions for this browser. Error: ' + error.message);
      setIsLocating(false);
      setLocalPhoto(null);
      if (setPhotoUri) setPhotoUri(null);
      setStep('camera');
    };

    // 🚨 FAST MODE: Use basic cell-tower triangulation instantly instead of waiting for satellites
    navigator.geolocation.getCurrentPosition(
      handleLocationSuccess,
      handleLocationError,
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleSubmitVisit = async (e) => {
    e.preventDefault();
    if (!selectedShopId) return alert("Please select a medical shop.");

    setIsSubmitting(true);
    try {
      const agentId = localStorage.getItem('employeeId') || 'Unknown';

      const payload = {
        agentId: agentId,
        targetId: selectedShopId,
        latitude: location?.lat || null,
        longitude: location?.lng || null,
        photoUrl: localPhoto || null,
        orderAmount: parseFloat(formData.orderAmount) || 0,
        collectionAmount: parseFloat(formData.collectionAmount) || 0,
        paymentMethod: formData.paymentMethod || 'Cash',
        remark: formData.remark || ''
      };

      const response = await fetch('/api/sales/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to log visit.");

      setStep('camera');
      setLocalPhoto(null);
      setLocation(null);
      setFormData({ orderAmount: '', collectionAmount: '', paymentMethod: 'Cash', remark: '' });

      if (onRefreshData) onRefreshData();
      else window.location.reload();

    } catch (err) {
      console.error("Submission Error:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 relative pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>

  <input 
    type="file" 
    accept="image/jpeg, image/png, image/jpg" 
    capture="environment" 
    ref={fileInputRef} 
    onChange={handleCapture} 
    className="hidden" 
  />
      {/* Floating Header Component */}
      <div ref={dropdownRef} className="sticky top-0 z-30 bg-slate-100 px-5 pt-4 pb-5 rounded-b-xl shadow-md border-b border-white/5 transition-all">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-slate-400 mb-1.5">
              Choose your working area for today
            </p>
            <div className="flex items-center flex-wrap gap-2.5">
              {selectedArea ? (
                <span className="inline-flex items-center gap-1.5 text-[16px] font-semibold text-[#97C22A] bg-[#97C22A]/10 border border-[#97C22A]/20 rounded-2xl px-3 py-1">
                  {selectedArea}
                </span>
              ) : (
                <span className="text-[14px] text-slate-500 font-medium">No area selected</span>
              )}
              
              <button
                onClick={() => setIsAreaDropdownOpen((p) => !p)}
                className={`inline-flex items-center gap-1.5 text-[14px] font-semibold rounded-2xl px-3 py-1 transition-colors ${
                  isAreaDropdownOpen 
                    ? 'bg-slate-200 text-red-500 hover:bg-red-500/20' 
                    : 'bg-slate-200 text-blue-500 hover:bg-blue-500/20'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isAreaDropdownOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />}
                </svg>
                {selectedArea ? (isAreaDropdownOpen ? 'Close' : 'Change') : 'Select'}
              </button>
            </div>
          </div>

          {/* Status Indicator */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border shrink-0 mt-1 ${
            step === 'form' ? 'bg-[#97C22A]/10 border-[#97C22A]/20' : 'bg-white/5 border-white/10'
          }`}>
            <span className={` ${step === 'form' ? 'bg-[#97C22A]' : 'bg-slate-500'}`} />
            <span className={`text-[12px] font-semibold ${step === 'form' ? 'text-slate-700' : 'text-slate-400'}`}>
              {step === 'camera' ? '🔒 Locked' : '✅ Verified'}
            </span>
          </div>
        </div>

        {/* MODIFIED: Searchable Horizontal Chips Dropdown */}
        {isAreaDropdownOpen && (
          <div className="absolute top-[100%] left-4 right-4 mt-2 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-40">
            
            {/* Search Bar */}
            <div className="p-3 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search area..."
                  value={areaSearchQuery}
                  onChange={(e) => setAreaSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-9 pr-4 py-2.5 text-[14px] font-medium text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all"
                />
              </div>
            </div>

            {/* Horizontal Flowing Chips */}
            {filteredAreas.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-[13px] text-slate-500 font-medium m-0">No areas found</p>
              </div>
            ) : (
              <div className="p-3 flex flex-wrap gap-2 max-h-[35vh] overflow-y-auto">
                {filteredAreas.map((area) => {
                  const sel = area === selectedArea;
                  return (
                    <button
                      key={area}
                      onClick={() => toggleArea(area)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-[13px] font-semibold transition-all ${
                        sel 
                          ? 'bg-[#97C22A] text-[#0a0f1c] shadow-sm' 
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      {sel && (
                        <svg className="w-3.5 h-3.5 text-[#0a0f1c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {area}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

     <div className="px-4 pt-5 flex flex-col gap-4 max-w-lg mx-auto">
        
        {/* Progress Cards */}
        {selectedArea && (
          <div className="flex flex-col gap-3">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[12px] font-semibold text-slate-500">Daily progress</span>
                <span className="text-[14px] font-bold text-[#5C7A1A]">{progress}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-[#97C22A] rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex divide-x divide-slate-100">
                {[
                  { label: 'Total', val: totalCount },
                  { label: 'Done', val: visitedCount },
                  { label: 'Left', val: totalCount - visitedCount },
                ].map(({ label, val }) => (
                  <div key={label} className="flex-1 text-center">
                    <p className="text-[20px] font-bold text-slate-800 leading-none m-0">{val}</p>
                    <p className="text-[11px] font-semibold text-slate-400 mt-1.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex justify-between items-center">
              <span className="text-[13px] font-semibold text-slate-500">Earned today</span>
              <p className="text-[20px] font-bold text-slate-900 m-0">
                ₹{safeCollection >= 1000 ? (safeCollection / 1000).toFixed(1) + 'k' : safeCollection.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        )}

        {/* Dynamic Views */}
        {isLoadingRoute ? (
          <div className="bg-white rounded-2xl p-10 flex flex-col items-center gap-4 shadow-sm border border-slate-100 mt-2">
            <svg className="w-8 h-8 text-[#97C22A] animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-[13px] font-medium text-slate-500 m-0">Loading territory data...</p>
          </div>
        ) : !selectedArea ? (
          <div className="bg-white rounded-2xl p-10 flex flex-col items-center text-center shadow-sm border border-slate-100 mt-2">
            <div className="w-14 h-14 rounded-2xl bg-[#97C22A]/10 flex items-center justify-center mb-5 border border-[#97C22A]/20">
              <svg className="w-6 h-6 text-[#5C7A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" strokeWidth="2" />
              </svg>
            </div>
            <h2 className="text-[17px] font-bold text-slate-900 mb-2">Select working area</h2>
            <p className="text-[13px] text-slate-500 leading-relaxed mb-6">
              Choose your territory from the header to view your targets and start logging visits.
            </p>
            <button 
              onClick={() => setIsAreaDropdownOpen(true)} 
              className="bg-[#0a0f1c] text-white text-[14px] font-bold rounded-2xl px-6 py-3.5 flex items-center gap-2 active:scale-95 transition-transform shadow-sm"
            >
              Select area
            </button>
          </div>
        ) : step === 'camera' ? (
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center text-center shadow-sm border border-slate-100 mt-2">
            <div className="w-16 h-16 rounded-3xl bg-[#97C22A]/10 flex items-center justify-center mb-5 border border-[#97C22A]/20 relative">
              {isLocating && <div className="absolute inset-0 border-2 border-[#97C22A] rounded-3xl animate-ping opacity-30" />}
              <svg className="w-7 h-7 text-[#5C7A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
              </svg>
            </div>
            <p className="text-[12px] font-bold text-[#97C22A] mb-1.5">Security check</p>
            <h2 className="text-[18px] font-bold text-slate-900 mb-2">Field check-in</h2>
            <p className="text-[13.5px] text-slate-500 leading-relaxed mb-7 max-w-[260px]">
              Take a photo of the shop in {selectedArea}. GPS will auto-detect your location.
            </p>
            
            {/* 🚨 DESKTOP BLOCKER CONDITIONAL BUTTON 🚨 */}
            {isMobile ? (
              <button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={isLocating} 
                className={`w-full py-4 rounded-2xl text-[15px] font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                  isLocating ? 'bg-slate-800 text-white/50 cursor-not-allowed' : 'bg-[#0a0f1c] text-white active:scale-[0.98]'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                </svg>
                {isLocating ? 'Analyzing GPS...' : 'Take photo to unlock'}
              </button>
            ) : (
              <div className="w-full py-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-[14px] font-bold flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Please use a mobile phone to check-in
              </div>
            )}
            
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-4 duration-300 mt-2 flex flex-col gap-4">
            
            {/* Verified Photo Card */}
            <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <img src={localPhoto} alt="Captured" className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm" />
              <div className="flex-1">
                <p className="text-[12px] font-bold text-[#5C7A1A] flex items-center gap-1.5 m-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> 
                  GPS Verified
                </p>
                <button 
                  onClick={() => setStep('camera')} 
                  className="text-[12px] font-semibold text-slate-400 mt-1 underline underline-offset-2 active:text-slate-600 transition-colors"
                >
                  Retake photo
                </button>
              </div>
            </div>

            {/* Visit Form */}
            <form onSubmit={handleSubmitVisit} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              
              <div className="mb-5">
                <label className="block text-[12px] font-semibold text-slate-500 mb-2">Selected medical shop</label>
                <div className="relative">
                  <select
                    value={selectedShopId}
                    onChange={(e) => setSelectedShopId(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-[14px] font-semibold text-slate-800 appearance-none outline-none focus:border-slate-400 focus:bg-white transition-colors"
                  >
                    <option value="" disabled>Select a shop in {selectedArea}...</option>
                    {nearbyShops.map((shop) => (
                      <option key={shop.id} value={shop.id}>
                        {shop.isNewAnchor ? 'First Visit - ' : ''}{shop.name} {shop.distance !== undefined && shop.distance < 999999 ? `(${ (shop.distance / 1000).toFixed(1) }km)` : ''}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
                {selectedShopId && nearbyShops.find(s => s.id.toString() === selectedShopId)?.isNewAnchor && (
                  <p className="text-[11px] text-[#5C7A1A] mt-2 font-medium bg-[#97C22A]/10 p-2 rounded-2xl border border-[#97C22A]/20">
                    First visit: Submitting will lock its GPS coordinates here.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div>
                  <label className="block text-[12px] font-semibold text-slate-500 mb-2">Order vol (₹)</label>
                  <input
                    type="number"
                    value={formData.orderAmount}
                    onChange={(e) => setFormData({...formData, orderAmount: e.target.value})}
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-[15px] font-bold text-slate-800 outline-none focus:border-slate-400 focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#5C7A1A] mb-2">Collection (₹)</label>
                  <input
                    type="number"
                    value={formData.collectionAmount}
                    onChange={(e) => setFormData({...formData, collectionAmount: e.target.value})}
                    placeholder="0"
                    className="w-full bg-[#97C22A]/10 border border-[#97C22A]/30 rounded-2xl px-4 py-3.5 text-[15px] font-bold text-slate-900 outline-none focus:bg-[#97C22A]/20 transition-colors"
                  />
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-[12px] font-semibold text-slate-500 mb-2">Payment method</label>
                <div className="grid grid-cols-4 gap-2">
                  {['Cash', 'UPI', 'Cheque', 'Credit'].map((method) => {
                    const active = formData.paymentMethod === method;
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setFormData({...formData, paymentMethod: method})}
                        className={`py-2.5 text-[12px] font-semibold rounded-2xl transition-all border ${
                          active 
                            ? 'bg-[#0a0f1c] text-[#97C22A] border-[#0a0f1c] shadow-sm' 
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {method}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-[12px] font-semibold text-slate-500 mb-2">Remark / note</label>
                <textarea
                  value={formData.remark}
                  onChange={(e) => setFormData({...formData, remark: e.target.value})}
                  placeholder="Optional notes regarding this visit..."
                  rows="2"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-[14px] font-medium text-slate-800 outline-none focus:border-slate-400 focus:bg-white transition-colors resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-2xl text-[#0a0f1c] font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-sm ${
                  isSubmitting ? 'bg-[#97C22A]/70 cursor-not-allowed' : 'bg-[#97C22A] active:scale-[0.98]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-5 h-5 animate-spin text-[#0a0f1c]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Log this visit'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}