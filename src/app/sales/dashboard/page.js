'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

// ==========================================
// NAVIGATION COMPONENTS
// ==========================================
function TopHeader({ mobileNav, handleLogout }) {
  const titles = {
    'route': { title: 'Active route', sub: 'Verify your assigned visits' },
    'radar': { title: 'Area Radar', sub: 'Scan for nearby medical shops' },
    'deals': { title: 'Commission Ledger', sub: 'Track your monthly earnings' }
  };

  return (
    <>
      <header className="hidden md:flex shrink-0 items-center justify-between px-8 lg:px-10 h-[72px] bg-white" style={{ borderBottom: '1px solid #e9edf2', boxShadow: '0 1px 0 #e9edf2' }}>
        <div>
          <h2 className="text-lg font-semibold text-slate-800 tracking-tight">{titles[mobileNav]?.title}</h2>
          <p className="text-xs font-medium mt-0.5" style={{ color: '#8896aa' }}>{titles[mobileNav]?.sub}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-medium px-3 py-1.5 rounded-full" style={{ background: '#f1f5f9', color: '#64748b' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </header>

      <header className="md:hidden flex shrink-0 items-center justify-between px-4 h-14 bg-white" style={{ borderBottom: '1px solid #e9edf2' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: mobileNav === 'radar' ? 'rgba(168,85,247,0.1)' : mobileNav === 'route' ? 'rgba(151,194,42,0.1)' : 'rgba(96,165,250,0.1)' }}>
            {mobileNav === 'route' && <svg className="w-3.5 h-3.5" style={{ color: '#97c22a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>}
            {mobileNav === 'radar' && <svg className="w-3.5 h-3.5" style={{ color: '#a855f7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>}
            {mobileNav === 'deals' && <svg className="w-3.5 h-3.5" style={{ color: '#60a5fa' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>}
          </div>
          <p className="text-[13px] font-semibold text-slate-800">{titles[mobileNav]?.title}</p>
        </div>
        <button onClick={handleLogout} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </button>
      </header>
    </>
  );
}

// Haversine Formula to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371e3; // Earth radius in meters
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  return Math.round(R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))));
}

// ==========================================
// MAIN DASHBOARD COMPONENT
// ==========================================
export default function SalesDashboard() {
  const router = useRouter();
  
  // App State
  const [mobileNav, setMobileNav] = useState('route'); 
  const [currentGps, setCurrentGps] = useState(null);
  
  // Route State
  const [targets, setTargets] = useState([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(true);
  const [distanceToActiveTarget, setDistanceToActiveTarget] = useState(null);
  const [visitStatus, setVisitStatus] = useState('Idle'); 
  const [photoUri, setPhotoUri] = useState(null);
  const [error, setError] = useState('');

  // Radar State
  const [nearbyShops, setNearbyShops] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [newShopData, setNewShopData] = useState({ name: '', address: '' });
  const [isRegistering, setIsRegistering] = useState(false);

  // Deal Logging State
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [activeTarget, setActiveTarget] = useState(null); 
  const [dealData, setDealData] = useState({ orderValue: '', samplesGiven: 0, productPitched: 'Adivasi Neelambari Oil', feedback: '' });
  const [isSubmittingDeal, setIsSubmittingDeal] = useState(false);
  const [dealError, setDealError] = useState('');

  // Derived Stats
  const totalCommission = targets.reduce((sum, t) => sum + (t.commission || 0), 0);
  const totalPipeline = targets.reduce((sum, t) => sum + (t.orderValue || 0), 0);
  const completedCount = targets.filter(t => t.status === 'COMPLETED').length;
  const completedDeals = targets.filter(t => t.status === 'COMPLETED').reverse();
  
  // Track GPS automatically
  useEffect(() => {
    let watchId;
    const startTracking = async () => {
      try {
        await Geolocation.requestPermissions();
        watchId = await Geolocation.watchPosition({ enableHighAccuracy: true }, (pos) => {
          if (pos) {
            setCurrentGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          }
        });
      } catch (err) { 
        console.error("GPS Error", err); 
        setError("GPS hardware not available.");
      }
    };
    startTracking();
    return () => { if (watchId) Geolocation.clearWatch({ id: watchId }); };
  }, []);

  // Fetch Assigned Route
  useEffect(() => {
    fetch('/api/sales/visits').then(res => res.json()).then(data => {
      if(Array.isArray(data)) setTargets(data);
      setIsLoadingRoute(false);
    });
  }, []);

  // Calculate distance to the currently active target dynamically
  useEffect(() => {
    if (currentGps && targets.length > 0) {
      const active = targets.find(t => t.status === 'PENDING');
      if (active && active.latitude && active.longitude) {
        const dist = calculateDistance(currentGps.lat, currentGps.lng, active.latitude, active.longitude);
        setDistanceToActiveTarget(dist);
      }
    }
  }, [currentGps, targets]);

  // Run Radar Scan
  const scanArea = async () => {
    if (!currentGps) {
      alert("Waiting for GPS lock. Ensure location services are enabled.");
      return;
    }
    setIsScanning(true);
    try {
      const res = await fetch(`/api/sales/discovery?lat=${currentGps.lat}&lng=${currentGps.lng}`);
      const data = await res.json();
      if(Array.isArray(data)) setNearbyShops(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  // Auto-scan when opening Radar tab
  useEffect(() => {
    if (mobileNav === 'radar' && currentGps) { scanArea(); }
  }, [mobileNav, currentGps]);

  const handleLogout = () => router.push('/');

  // Action: Register New Shop (Photo + Name)
  const handleRegisterShop = async (e) => {
    e.preventDefault();
    setIsRegistering(true);
    try {
      let capturedPhoto = null;
      try {
        const image = await Camera.getPhoto({ quality: 80, resultType: CameraResultType.Uri, source: CameraSource.Camera });
        capturedPhoto = image.webPath;
      } catch (e) {
        capturedPhoto = 'no-photo';
      }

      const res = await fetch('/api/sales/discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newShopData.name,
          address: newShopData.address,
          latitude: currentGps.lat,
          longitude: currentGps.lng,
          photoUrl: capturedPhoto
        })
      });
      const data = await res.json();

      setActiveTarget({ id: data.target.id, name: data.target.name });
      setIsRegisterModalOpen(false);
      setNewShopData({ name: '', address: '' });
      setIsDealModalOpen(true);

    } catch (err) {
      alert("Failed to register shop.");
    } finally {
      setIsRegistering(false);
    }
  };

  const initiateDeal = (target) => {
    setActiveTarget(target);
    setIsDealModalOpen(true);
  };

  const handleNativeCheckIn = async () => {
    if (distanceToActiveTarget !== null && distanceToActiveTarget > 50) {
      alert(`Geofence violation: You are ${distanceToActiveTarget}m away. Must be under 50m to verify.`);
      return;
    }
    
    try {
      const image = await Camera.getPhoto({ quality: 80, allowEditing: false, resultType: CameraResultType.Uri, source: CameraSource.Camera });
      setPhotoUri(image.webPath);
    } catch (err) {
      console.log("Camera bypassed or dismissed.");
    }
    setVisitStatus('CheckedIn');
  };

  const handleDealSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingDeal(true);
    setDealError('');
    
    try {
      const currentDealTarget = activeTarget || targets.find(t => t.status === 'PENDING');
      if (!currentDealTarget) throw new Error("No active target selected.");

      const response = await fetch('/api/sales/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId: currentDealTarget.id, ...dealData }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Dynamically update the target array so it shows as completed
      setTargets(prev => {
        // If the shop was from Radar and not in targets array, add it temporarily
        if (!prev.find(t => t.id === currentDealTarget.id)) {
           return [...prev, { ...currentDealTarget, status: 'COMPLETED', time: data.time, commission: data.commission, orderValue: Number(dealData.orderValue) }];
        }
        // Otherwise update existing assigned route
        return prev.map(t => 
          t.id === currentDealTarget.id ? { 
            ...t, 
            status: 'COMPLETED', 
            time: data.time,
            commission: data.commission,
            orderValue: Number(dealData.orderValue)
          } : t
        );
      });

      setIsDealModalOpen(false);
      setVisitStatus('Completed');
      setDealData({ orderValue: '', samplesGiven: 0, productPitched: 'Adivasi Neelambari Oil', feedback: '' });
      setActiveTarget(null);
      
      if (mobileNav === 'radar') setMobileNav('route');

    } catch (err) {
      setDealError(err.message);
    } finally {
      setIsSubmittingDeal(false);
    }
  };

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden font-sans" style={{ background: '#f1f5f9' }}>
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 relative z-20" style={{ background: '#0a0f1a', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute pointer-events-none" style={{ top: '-60px', right: '-60px', width: '240px', height: '240px', background: 'radial-gradient(circle,rgba(151,194,42,0.1) 0%,transparent 70%)' }} />

        <div className="relative z-10 px-6 py-7 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(151,194,42,0.12)', border: '1px solid rgba(151,194,42,0.2)' }}>
              <svg className="w-4 h-4" style={{ color: '#97c22a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-white leading-none">Prosushil Lifecare</p>
              <p className="text-[10px] font-medium mt-0.5" style={{ color: '#97c22a' }}>Field operations</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit" style={{ background: 'rgba(151,194,42,0.08)', border: '1px solid rgba(151,194,42,0.15)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#97c22a' }} />
            <span className="text-[10px] font-medium" style={{ color: '#a3cc35' }}>Tracker online</span>
          </div>
        </div>

        <nav className="relative z-10 flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {[
            { id: 'route', label: 'Active route', icon: 'M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z' },
            { id: 'radar', label: 'Area radar', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
            { id: 'deals', label: 'My deals', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
          ].map((n) => (
            <button key={n.id} onClick={() => setMobileNav(n.id)} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left" style={mobileNav === n.id ? { background: 'rgba(151,194,42,0.1)', border: '1px solid rgba(151,194,42,0.18)', color: '#97c22a' } : { color: '#8896aa', border: '1px solid transparent' }}>
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={n.icon} /></svg>
              <span className="text-[13px] font-medium">{n.label}</span>
            </button>
          ))}
        </nav>

        <div className="relative z-10 px-4 py-4 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl transition-all" style={{ border: '1px solid transparent', color: '#8896aa' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(231,62,67,0.08)'; e.currentTarget.style.color = '#e73e43'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8896aa'; }}>
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span className="text-[13px] font-medium">Sign out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden relative w-full">
        <TopHeader mobileNav={mobileNav} handleLogout={handleLogout} />

        {/* ── ROUTE TAB ── */}
        {mobileNav === 'route' && (
          <div className="flex-1 overflow-y-auto animate-in fade-in duration-200">
            <div className="p-4 md:p-8 lg:p-10 space-y-4 md:space-y-6 pb-24 md:pb-10 max-w-4xl mx-auto w-full">

              <div className="grid grid-cols-2 gap-3 md:gap-5">
                <div className="relative overflow-hidden p-4 md:p-5 rounded-2xl bg-white" style={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <p className="text-[10px] md:text-[11px] font-semibold tracking-wide mb-1" style={{ color: '#8896aa' }}>Target progress</p>
                  <p className="text-lg md:text-2xl font-semibold text-slate-800 tracking-tight leading-none">{completedCount} <span className="text-[13px] md:text-sm font-medium" style={{ color: '#b0bac8' }}>/ {targets.length} visits</span></p>
                </div>
                <div className="relative overflow-hidden p-4 md:p-5 rounded-2xl bg-white" style={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <p className="text-[10px] md:text-[11px] font-semibold tracking-wide mb-1" style={{ color: '#97c22a' }}>Daily commission</p>
                  <p className="text-lg md:text-2xl font-semibold text-slate-800 tracking-tight leading-none">₹{totalCommission.toLocaleString('en-IN')}</p>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl" style={{ background: '#97c22a' }} />
                </div>
              </div>

              {isLoadingRoute ? (
                <div className="text-center py-10 text-sm font-medium text-slate-500">Loading database route...</div>
              ) : targets.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500">No assigned routes today. Use the Area Radar to find shops.</div>
              ) : (
                targets.map((target, index) => {
                  // The active target is the FIRST one that is PENDING
                  const isActiveTarget = target.status === 'PENDING' && targets.findIndex(t => t.status === 'PENDING') === index;

                  return (
                    <div key={target.id} className="bg-white rounded-2xl p-5 md:p-6 transition-all" style={{ border: isActiveTarget ? '2px solid #97c22a' : '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', opacity: target.status === 'COMPLETED' ? 0.6 : 1 }}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          {isActiveTarget && <p className="text-[11px] font-semibold tracking-wide mb-1" style={{ color: '#97c22a' }}>Active destination</p>}
                          <h3 className="text-lg md:text-xl font-semibold text-slate-800 leading-tight">{target.name}</h3>
                          <p className="text-[12px] font-medium mt-1" style={{ color: '#64748b' }}>{target.address}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: target.status === 'COMPLETED' ? 'rgba(151,194,42,0.1)' : 'rgba(231,62,67,0.08)' }}>
                          <svg className="w-5 h-5" style={{ color: target.status === 'COMPLETED' ? '#97c22a' : '#e73e43' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {target.status === 'COMPLETED' ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>}
                          </svg>
                        </div>
                      </div>

                      {isActiveTarget && (
                        <div>
                          <div className="rounded-xl p-3 mb-4" style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-[11px] font-medium" style={{ color: '#8896aa' }}>Distance to target</span>
                                <span className="text-[13px] font-semibold" style={{ color: distanceToActiveTarget !== null && distanceToActiveTarget <= 50 ? '#97c22a' : '#e73e43' }}>
                                  {distanceToActiveTarget !== null ? `${distanceToActiveTarget}m away` : 'Calculating...'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {visitStatus === 'Idle' && (
                            <button onClick={handleNativeCheckIn} className="w-full py-3.5 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2" style={{ background: '#97c22a', boxShadow: '0 4px 14px rgba(151,194,42,0.25)' }}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
                              Verify location & check in
                            </button>
                          )}

                          {visitStatus === 'CheckedIn' && (
                            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                              <div className="flex items-start gap-2 p-3 rounded-xl text-xs font-medium" style={{ background: 'rgba(151,194,42,0.08)', border: '1px solid rgba(151,194,42,0.2)', color: '#5a8a10' }}>
                                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                <div>
                                  <p className="font-semibold">Location verified.</p>
                                  <p className="text-[10px] mt-0.5" style={{ color: '#7aaa1f' }}>You are within 50m of the target.</p>
                                </div>
                              </div>
                              <button onClick={() => { setActiveTarget(target); setIsDealModalOpen(true); }} className="w-full py-3.5 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2" style={{ background: '#0a0f1a', boxShadow: '0 4px 14px rgba(10,15,26,0.15)' }}>
                                Log deal & Close visit
                              </button>
                            </div>
                          )}

                          {visitStatus === 'Completed' && (
                            <div className="p-6 rounded-xl text-center animate-in fade-in duration-200" style={{ background: '#f8fafc', border: '1px solid #e9edf2' }}>
                              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(151,194,42,0.12)' }}>
                                <svg className="w-5 h-5" style={{ color: '#97c22a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                              </div>
                              <p className="text-[13px] font-semibold text-slate-800">Visit logged successfully</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {target.status === 'COMPLETED' && (
                        <div className="mt-2 pt-3 border-t border-slate-100 flex justify-between items-center text-[11px] font-semibold">
                          <span className="text-slate-500">Completed at {target.time}</span>
                          <span style={{ color: '#97c22a' }}>+ ₹{target.commission}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ── RADAR / DISCOVERY TAB ── */}
        {mobileNav === 'radar' && (
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
                      <button onClick={() => initiateDeal(shop)} className="px-4 py-2 rounded-xl text-[11px] font-semibold text-white bg-purple-600 shadow-sm active:scale-95 transition-all">
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
        )}

        {/* ── DEALS TAB ── */}
        {mobileNav === 'deals' && (
          <div className="flex-1 overflow-y-auto animate-in fade-in duration-200">
            <div className="p-4 md:p-8 lg:p-10 space-y-4 md:space-y-6 pb-24 md:pb-10 max-w-4xl mx-auto w-full">
              
              <div className="bg-slate-900 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#60a5fa]/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-[#97c22a]/15 rounded-full blur-[40px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
                
                <div className="relative z-10">
                  <p className="text-[11px] md:text-xs font-semibold tracking-wide text-slate-400 mb-1">Total Pipeline Generated</p>
                  <h3 className="text-3xl md:text-5xl font-semibold text-white tracking-tight">₹{totalPipeline.toLocaleString('en-IN')}</h3>
                  
                  <div className="mt-6 flex items-center gap-4 border-t border-white/10 pt-5">
                    <div>
                      <p className="text-[10px] font-medium text-slate-400 mb-0.5">Commission Earned</p>
                      <p className="text-lg font-semibold" style={{ color: '#97c22a' }}>₹{totalCommission.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div>
                      <p className="text-[10px] font-medium text-slate-400 mb-0.5">Successful Visits</p>
                      <p className="text-lg font-semibold text-white">{completedCount}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <h3 className="text-[13px] md:text-base font-semibold text-slate-800 mb-4">Recent Transactions</h3>
                
                <div className="space-y-3">
                  {completedDeals.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center" style={{ border: '1px solid #e9edf2' }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: '#f1f5f9' }}>
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      </div>
                      <p className="text-[12px] font-medium text-slate-500">No deals logged yet.</p>
                    </div>
                  ) : (
                    completedDeals.map((deal) => (
                      <div key={deal.id} className="bg-white rounded-2xl p-4 md:p-5 flex items-center justify-between" style={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(96,165,250,0.1)' }}>
                            <svg className="w-4 h-4" style={{ color: '#60a5fa' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                          </div>
                          <div>
                            <h4 className="text-[13px] font-semibold text-slate-800 leading-tight">{deal.name}</h4>
                            <p className="text-[10px] font-medium text-slate-500 mt-0.5">Order: ₹{deal.orderValue?.toLocaleString('en-IN') || 0}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[13px] font-semibold" style={{ color: '#97c22a' }}>+ ₹{deal.commission?.toLocaleString('en-IN') || 0}</p>
                          <p className="text-[9px] font-medium text-slate-400 mt-1">{deal.time}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM NAV */}
        <nav className="md:hidden absolute bottom-0 left-0 right-0 z-40 bg-white" style={{ borderTop: '1px solid #e9edf2', paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="flex items-center justify-around px-2 h-14">
            {[
              { id: 'route', label: 'Route', icon: 'M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z' },
              { id: 'radar', label: 'Nearby', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
              { id: 'deals', label: 'Deals', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            ].map((n) => (
              <button key={n.id} onClick={() => setMobileNav(n.id)} className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all">
                <svg className="w-4.5 h-4.5" style={{ color: mobileNav === n.id ? (n.id === 'radar' ? '#a855f7' : '#97c22a') : '#94a3b8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={mobileNav === n.id ? '2' : '1.5'} d={n.icon} />
                </svg>
                <span className="text-[9px] font-semibold" style={{ color: mobileNav === n.id ? (n.id === 'radar' ? '#a855f7' : '#97c22a') : '#94a3b8' }}>{n.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* ══════════════════════════════════════════════
            MODALS
        ══════════════════════════════════════════════ */}

        {/* 1. Register New Shop Modal */}
        {isRegisterModalOpen && (
          <div className="absolute inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4" style={{ background: 'rgba(10,15,26,0.7)', backdropFilter: 'blur(6px)' }}>
            <div className="w-full sm:max-w-md bg-white relative overflow-hidden rounded-t-2xl sm:rounded-2xl shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div>
                  <p className="text-[13px] font-semibold text-slate-800">Register New Medical</p>
                  <p className="text-[11px] text-slate-500">Add to global database</p>
                </div>
                <button onClick={() => setIsRegisterModalOpen(false)} className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center"><svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <form onSubmit={handleRegisterShop} className="p-5 space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Shop Name</label>
                  <input type="text" required value={newShopData.name} onChange={e => setNewShopData({...newShopData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" placeholder="e.g. Wellness Medicos" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Local Area / Address (Optional)</label>
                  <input type="text" value={newShopData.address} onChange={e => setNewShopData({...newShopData, address: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" placeholder="e.g. Rankala Bus Stand" />
                </div>
                
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-start gap-3 mt-4">
                  <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <p className="text-[10px] text-blue-800 leading-relaxed">
                    Clicking continue will open your camera to take a photo of the shop front, locking its GPS coordinates to the database.
                  </p>
                </div>

                <button type="submit" disabled={isRegistering} className="w-full py-3.5 mt-2 bg-blue-600 text-white font-semibold rounded-xl text-[13px] disabled:opacity-50">
                  {isRegistering ? 'Processing...' : 'Capture Photo & Register'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 2. Log Deal Modal */}
        {isDealModalOpen && activeTarget && (
          <div className="absolute inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4" style={{ background: 'rgba(10,15,26,0.7)', backdropFilter: 'blur(6px)' }}>
            <div className="w-full sm:max-w-md bg-white relative overflow-hidden rounded-t-2xl sm:rounded-2xl shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div>
                  <p className="text-[13px] font-semibold text-slate-800">Log Visit Outcome</p>
                  <p className="text-[11px] text-slate-500">{activeTarget.name}</p>
                </div>
                <button onClick={() => setIsDealModalOpen(false)} className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center"><svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              
              <form onSubmit={handleDealSubmit} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Order Value (₹)</label>
                    <input type="number" required min="0" value={dealData.orderValue} onChange={e => setDealData({...dealData, orderValue: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-semibold outline-none focus:border-[#97c22a]" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Samples Given</label>
                    <input type="number" min="0" value={dealData.samplesGiven} onChange={e => setDealData({...dealData, samplesGiven: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-semibold outline-none focus:border-[#97c22a]" placeholder="0" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Doctor/Pharmacist Notes</label>
                  <textarea rows="2" value={dealData.feedback} onChange={e => setDealData({...dealData, feedback: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none outline-none focus:border-[#97c22a]" placeholder="Any feedback?"></textarea>
                </div>

                <button type="submit" disabled={isSubmittingDeal} className="w-full py-3.5 bg-slate-900 text-white font-semibold rounded-xl text-[13px] disabled:opacity-50">
                  {isSubmittingDeal ? 'Saving to Ledger...' : 'Submit & Close Visit'}
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}