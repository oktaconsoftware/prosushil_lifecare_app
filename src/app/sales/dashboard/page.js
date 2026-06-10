'use client';
import { useState, useEffect } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

// Local testing coordinates
const TARGET_PHARMACY = { lat: 16.6967, lng: 74.2273, name: "Care Pharmacy, Kolhapur" };

export default function SalesDashboard() {
  const [distance, setDistance] = useState(null);
  const [visitStatus, setVisitStatus] = useState('Idle');
  const [photoUri, setPhotoUri] = useState(null);
  const [error, setError] = useState('');

  // Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const p1 = (lat1 * Math.PI) / 180;
    const p2 = (lat2 * Math.PI) / 180;
    const dp = ((lat2 - lat1) * Math.PI) / 180;
    const dl = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
    return Math.round(R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))));
  };

  useEffect(() => {
    let watchId;

    const startAndroidTracking = async () => {
      try {
        const perm = await Geolocation.requestPermissions();
        if (perm.location !== 'granted') {
          setError('Location permission denied.');
          return;
        }

        watchId = await Geolocation.watchPosition(
          { enableHighAccuracy: true, timeout: 10000 },
          (position, err) => {
            if (err) {
              setError(err.message);
              return;
            }
            if (position) {
              const { latitude, longitude } = position.coords;
              setDistance(calculateDistance(latitude, longitude, TARGET_PHARMACY.lat, TARGET_PHARMACY.lng));
            }
          }
        );
      } catch (err) {
        setError('Hardware GPS failed to initialize.');
      }
    };

    startAndroidTracking();

    return () => {
      if (watchId) Geolocation.clearWatch({ id: watchId });
    };
  }, []);

  const handleNativeCheckIn = async () => {
    if (distance > 50) {
      alert(`Geofence active: You are ${distance}m away. Must be under 50m to check in.`);
      return;
    }

    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera, 
      });

      setPhotoUri(image.webPath);
      setVisitStatus('CheckedIn');
      
    } catch (err) {
      console.error("Camera hardware dismissed", err);
    }
  };

  return (
    <div className="flex h-[100dvh] w-full bg-[#f8fafc] text-slate-800 overflow-hidden font-sans selection:bg-[#97c22a]/20">
      
      {/* ========================================= */}
      {/* DESKTOP SIDEBAR NAVIGATION                */}
      {/* ========================================= */}
      <aside className="hidden md:flex flex-col w-72 bg-slate-900 border-r border-slate-800 relative z-20 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-8 pb-10 border-b border-slate-800/60">
          <div className="inline-flex items-center space-x-2.5 bg-slate-800/40 border border-slate-700/50 px-3 py-1.5 rounded-md mb-6">
            <span className="w-2 h-2 rounded-full bg-[#97c22a] shadow-[0_0_8px_#97c22a]"></span>
            <span className="text-[11px] font-medium text-slate-300 tracking-wide">Sales Portal</span>
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight leading-snug">
            Prosushil <br/><span className="text-[#97c22a]">Lifecare LLP</span>
          </h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-8 px-5 space-y-2.5">
          <a href="#" className="flex items-center space-x-3.5 px-4 py-3.5 bg-[#97c22a]/10 text-[#97c22a] rounded-md font-medium border border-[#97c22a]/20 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
            <span>My Routes</span>
          </a>
          <a href="#" className="flex items-center space-x-3.5 px-4 py-3.5 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-md font-medium transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            <span>My Deals & Pipeline</span>
          </a>
        </nav>

        <div className="p-6 border-t border-slate-800/60 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold shadow-sm text-sm">MR</div>
          <div>
            <p className="text-sm font-medium text-white">Sales Agent</p>
            <p className="text-[11px] font-medium text-slate-500 tracking-wide mt-0.5">ID: PL-1042</p>
          </div>
        </div>
      </aside>

      {/* ========================================= */}
      {/* MAIN CONTENT AREA                         */}
      {/* ========================================= */}
      <main className="flex-1 flex flex-col h-[100dvh] relative overflow-hidden w-full bg-slate-50/50">
        
        {/* Background Accent Graphics (Visible mostly on mobile, clipped on desktop) */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#97c22a]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 -z-10"></div>
        <div className="absolute top-40 left-0 w-[200px] h-[200px] bg-[#e73e43]/5 rounded-full blur-[60px] -translate-x-1/2 -z-10"></div>

        {/* Top Header - Desktop */}
        <header className="hidden md:flex h-24 bg-white border-b border-slate-200/80 items-center justify-between px-10 shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.01)] z-10">
          <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">Active Field Operations</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">Real-time target tracking and verification</p>
            </div>
            <div className="flex items-center space-x-2 bg-slate-50 px-4 py-2 rounded-md border border-slate-200/60 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-[#97c22a] animate-pulse shadow-[0_0_6px_#97c22a]" />
              <span className="text-xs text-slate-600 font-medium tracking-wide">Live GPS Active</span>
            </div>
          </div>
        </header>

        {/* Top Header - Mobile App Style */}
        <header className="md:hidden flex h-20 bg-white items-center justify-between px-6 shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.03)] z-10 border-b border-slate-100">
          <div>
            <h1 className="text-xl font-semibold text-slate-800 tracking-tight">Sales Portal</h1>
            <p className="text-[11px] font-medium text-[#97c22a] mt-0.5">Prosushil Lifecare LLP</p>
          </div>
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200/60 shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-[#97c22a] animate-pulse shadow-[0_0_6px_#97c22a]" />
            <span className="text-[10px] text-slate-600 font-medium tracking-wide">Live GPS</span>
          </div>
        </header>

        {/* Scrollable Dashboard Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full p-5 pb-24 md:p-10">
            
            {/* Desktop Only: Quick Stats Row */}
            <div className="hidden md:grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-md border border-slate-200/60 shadow-sm">
                <p className="text-xs font-medium text-slate-500 tracking-wide mb-1">Today's Visits</p>
                <h3 className="text-3xl font-semibold text-slate-800 tracking-tight">1 <span className="text-xl text-slate-400">/ 8</span></h3>
              </div>
              <div className="bg-white p-6 rounded-md border border-slate-200/60 shadow-sm">
                <p className="text-xs font-medium text-slate-500 tracking-wide mb-1">Pipeline Generated</p>
                <h3 className="text-3xl font-semibold text-slate-800 tracking-tight">₹42,500</h3>
              </div>
              <div className="bg-white p-6 rounded-md border border-slate-200/60 shadow-sm">
                <p className="text-xs font-medium text-slate-500 tracking-wide mb-1">Earned Commission (8%)</p>
                <h3 className="text-3xl font-semibold text-[#97c22a] tracking-tight">₹3,400</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
              
              {/* Left Column: Target & Telemetry */}
              <div className="space-y-5 md:space-y-8">
                {/* Target Location Card */}
                <div className="bg-white p-6 md:p-8 rounded-md border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)]">
                  <div className="flex items-start space-x-4">
                    <div className="hidden md:flex w-12 h-12 bg-[#e73e43]/10 rounded-full items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-[#e73e43]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                    </div>
                    <svg className="md:hidden w-5 h-5 text-[#e73e43] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                    <div>
                      <p className="text-[11px] md:text-sm font-medium text-slate-500 tracking-wide">Active Target Location</p>
                      <h3 className="text-lg md:text-2xl font-semibold text-slate-800 leading-tight mt-1">{TARGET_PHARMACY.name}</h3>
                      <p className="hidden md:block text-sm text-slate-500 mt-2">Required proximity for check-in: Under 50 meters.</p>
                    </div>
                  </div>
                </div>

                {/* Device Telemetry Card */}
                <div className="bg-white p-6 md:p-8 rounded-md border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]">
                  <h3 className="text-[11px] md:text-sm font-medium text-slate-500 tracking-wide mb-4 md:mb-6 border-b border-slate-100 pb-2 md:pb-4">Hardware Telemetry</h3>
                  
                  {error ? (
                    <div className="p-4 bg-[#e73e43]/10 text-[#e73e43] rounded-md text-sm font-medium border border-[#e73e43]/20">{error}</div>
                  ) : (
                    <div className="space-y-4 md:space-y-6">
                      <div className="flex justify-between items-center">
                        <span className="text-[13px] md:text-base font-medium text-slate-600">Signal Source</span>
                        <span className="text-[13px] md:text-base font-semibold text-[#97c22a] bg-[#97c22a]/10 px-3 py-1 rounded-md">Native OS GPS</span>
                      </div>
                      <div className="flex justify-between items-end pt-2 md:pt-4 border-t border-slate-50">
                        <span className="text-[13px] md:text-base font-medium text-slate-600 mb-1">Distance to target</span>
                        <span className={`text-2xl md:text-4xl font-semibold tracking-tight ${distance !== null && distance <= 50 ? 'text-[#97c22a]' : 'text-[#e73e43]'}`}>
                          {distance !== null ? `${distance}m` : 'Scanning...'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Action Engine */}
              <div>
                <div className="bg-white p-6 md:p-8 rounded-md border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] h-full flex flex-col justify-center">
                  <h3 className="hidden md:block text-sm font-medium text-slate-500 tracking-wide mb-6 text-center">Protocol Verification</h3>
                  
                  {visitStatus === 'Idle' && (
                    <button
                      onClick={handleNativeCheckIn}
                      disabled={distance === null}
                      className="w-full bg-[#97c22a] hover:bg-[#85ab25] text-white font-medium py-5 rounded-md shadow-[0_4px_15px_rgba(151,194,42,0.25)] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:active:scale-100 text-[15px] md:text-lg tracking-wide flex items-center justify-center space-x-3"
                    >
                      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      <span>Verify Geofence & Check In</span>
                    </button>
                  )}

                  {visitStatus === 'CheckedIn' && (
                    <div className="space-y-5">
                      <div className="flex items-center space-x-3 text-[#97c22a] font-medium bg-[#97c22a]/10 p-4 rounded-md border border-[#97c22a]/20">
                        <svg className="w-5 h-5 md:w-6 md:h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        <span className="text-sm md:text-base">Location verified and photo secured.</span>
                      </div>
                      
                      {photoUri && (
                        <img src={photoUri} alt="Visit Proof" className="w-full h-48 md:h-64 object-cover rounded-md border border-slate-200/60 shadow-sm" />
                      )}
                      
                      <button
                        onClick={() => setVisitStatus('Completed')}
                        className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-5 rounded-md shadow-[0_4px_15px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all tracking-wide text-[15px] md:text-lg mt-2 flex items-center justify-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>Log Deal & Close Visit</span>
                      </button>
                    </div>
                  )}

                  {visitStatus === 'Completed' && (
                    <div className="p-8 md:p-12 bg-[#97c22a]/10 border border-[#97c22a]/20 text-[#97c22a] text-center rounded-md flex flex-col items-center space-y-4">
                      <div className="w-16 h-16 bg-[#97c22a] rounded-full flex items-center justify-center text-white shadow-[0_4px_15px_rgba(151,194,42,0.4)]">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <span className="font-semibold text-lg md:text-xl tracking-wide text-slate-800">Visit Logged Successfully</span>
                      <p className="text-sm text-slate-500">The central database has been updated.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* MOBILE BOTTOM NAVIGATION (App Style)      */}
        {/* ========================================= */}
        <nav className="md:hidden absolute bottom-0 w-full h-16 bg-white border-t border-slate-200/80 flex items-center justify-around z-50 px-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
          <button className="flex flex-col items-center justify-center text-[#97c22a] w-full h-full">
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
            <span className="text-[10px] font-medium tracking-wide">Route</span>
          </button>
          
          <button className="flex flex-col items-center justify-center text-slate-400 hover:text-slate-600 transition-colors w-full h-full">
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            <span className="text-[10px] font-medium tracking-wide">Deals</span>
          </button>
          
          <button className="flex flex-col items-center justify-center text-slate-400 hover:text-slate-600 transition-colors w-full h-full">
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            <span className="text-[10px] font-medium tracking-wide">Profile</span>
          </button>
        </nav>
        
      </main>
    </div>
  );
}