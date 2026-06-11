'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export default function SalesDashboard() {
  const router = useRouter();
  
  // Real Data State
  const [targets, setTargets] = useState([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(true);
  
  // Tracking & Location State
  const [distance, setDistance] = useState(45); // Mocked to 45m for testing
  const [visitStatus, setVisitStatus] = useState('Idle'); 
  const [mobileNav, setMobileNav] = useState('route'); // 'route' | 'deals'
  const [error, setError] = useState('');
  const [photoUri, setPhotoUri] = useState(null);

  // Deal Logging State
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [dealData, setDealData] = useState({ orderValue: '', samplesGiven: 0, productPitched: 'Adivasi Neelambari Oil', feedback: '' });
  const [isSubmittingDeal, setIsSubmittingDeal] = useState(false);
  const [dealError, setDealError] = useState('');

  // Derived Stats
  const totalCommission = targets.reduce((sum, t) => sum + (t.commission || 0), 0);
  const totalPipeline = targets.reduce((sum, t) => sum + (t.orderValue || 0), 0);
  const completedCount = targets.filter(t => t.status === 'COMPLETED').length;
  const completedDeals = targets.filter(t => t.status === 'COMPLETED').reverse(); // Newest first
  
  // Fetch real database route on load
  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const res = await fetch('/api/sales/visits');
        const data = await res.json();
        if (res.ok) {
          setTargets(data);
        }
      } catch (err) {
        console.error("Failed to load route:", err);
      } finally {
        setIsLoadingRoute(false);
      }
    };
    fetchRoute();
  }, []);

  const handleLogout = () => router.push('/');

  const handleNativeCheckIn = async () => {
    if (distance > 50) {
      alert(`Geofence violation: You are ${distance}m away. Must be under 50m to verify.`);
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
    } catch (err) {
      console.log("Camera bypassed or dismissed. Proceeding for web demo.");
    }
    setVisitStatus('CheckedIn');
  };

  const handleDealSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingDeal(true);
    setDealError('');
    
    try {
      const activeTarget = targets.find(t => t.status === 'PENDING');
      if (!activeTarget) throw new Error("No active target selected.");

      const response = await fetch('/api/sales/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId: activeTarget.id,
          ...dealData
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Update UI with real server-calculated commission & pipeline value
      setTargets(prev => prev.map(t => 
        t.id === activeTarget.id ? { 
          ...t, 
          status: 'COMPLETED', 
          time: data.time,
          commission: data.commission,
          orderValue: Number(dealData.orderValue)
        } : t
      ));

      setIsDealModalOpen(false);
      setVisitStatus('Completed');
      setDealData({ orderValue: '', samplesGiven: 0, productPitched: 'Adivasi Neelambari Oil', feedback: '' });

    } catch (err) {
      setDealError(err.message);
    } finally {
      setIsSubmittingDeal(false);
    }
  };

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden font-sans" style={{ background: '#f1f5f9' }}>

      {/* ══════════════════════════════════════════════
          DESKTOP SIDEBAR
      ══════════════════════════════════════════════ */}
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

      {/* ══════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden relative w-full">

        <header className="hidden md:flex shrink-0 items-center justify-between px-8 lg:px-10 h-[72px] bg-white" style={{ borderBottom: '1px solid #e9edf2', boxShadow: '0 1px 0 #e9edf2' }}>
          <div>
            <h2 className="text-lg font-semibold text-slate-800 tracking-tight">{mobileNav === 'route' ? 'Active route' : 'Commission Ledger'}</h2>
            <p className="text-xs font-medium mt-0.5" style={{ color: '#8896aa' }}>{mobileNav === 'route' ? 'Verify your location and log field visits' : 'Track your monthly earnings and closed deals'}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium px-3 py-1.5 rounded-full" style={{ background: '#f1f5f9', color: '#64748b' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </header>

        <header className="md:hidden flex shrink-0 items-center justify-between px-4 h-14 bg-white" style={{ borderBottom: '1px solid #e9edf2' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: mobileNav === 'route' ? 'rgba(151,194,42,0.1)' : 'rgba(96,165,250,0.1)' }}>
              {mobileNav === 'route' ? (
                <svg className="w-3.5 h-3.5" style={{ color: '#97c22a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
              ) : (
                <svg className="w-3.5 h-3.5" style={{ color: '#60a5fa' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              )}
            </div>
            <p className="text-[13px] font-semibold text-slate-800">{mobileNav === 'route' ? 'Active route' : 'My deals'}</p>
          </div>
          <button onClick={handleLogout} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </header>

        {/* ── ROUTE TAB ────────────────────────── */}
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
              ) : (
                targets.map((target, index) => {
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
                                <span className="text-[13px] font-semibold" style={{ color: distance !== null && distance <= 50 ? '#97c22a' : '#e73e43' }}>
                                  {distance !== null ? `${distance}m away` : 'Scanning...'}
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
                              <button onClick={() => setIsDealModalOpen(true)} className="w-full py-3.5 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2" style={{ background: '#0a0f1a', boxShadow: '0 4px 14px rgba(10,15,26,0.15)' }}>
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

        {/* ── DEALS / COMMISSION TAB ──────────────────── */}
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

        {/* ── MOBILE BOTTOM NAV ─────────────────────── */}
        <nav className="md:hidden absolute bottom-0 left-0 right-0 z-40 bg-white" style={{ borderTop: '1px solid #e9edf2', paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="flex items-center justify-around px-2 h-14">
            {[
              { id: 'route', label: 'Route', icon: 'M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z' },
              { id: 'deals', label: 'Deals', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            ].map((n) => (
              <button key={n.id} onClick={() => setMobileNav(n.id)} className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all">
                <svg className="w-4.5 h-4.5" style={{ color: mobileNav === n.id ? '#97c22a' : '#94a3b8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={mobileNav === n.id ? '2' : '1.5'} d={n.icon} /></svg>
                <span className="text-[9px] font-semibold" style={{ color: mobileNav === n.id ? '#97c22a' : '#94a3b8' }}>{n.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* ══════════════════════════════════════════════
            DEAL LOGGING MODAL
        ══════════════════════════════════════════════ */}
        {isDealModalOpen && (
          <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" style={{ background: 'rgba(10,15,26,0.7)', backdropFilter: 'blur(6px)' }}>
            <div className="w-full sm:max-w-md bg-white relative overflow-hidden" style={{ borderRadius: '20px 20px 0 0', boxShadow: '0 -8px 40px rgba(0,0,0,0.15)' }}>
              
              <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-8 h-1 rounded-full bg-slate-200" /></div>
              
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <p className="text-[13px] font-semibold text-slate-800">Log Visit Outcome</p>
                  <p className="text-[11px] mt-0.5" style={{ color: '#8896aa' }}>{targets.find(t=>t.status==='PENDING')?.name}</p>
                </div>
                <button onClick={() => setIsDealModalOpen(false)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-slate-100" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <form onSubmit={handleDealSubmit} className="px-5 py-5 space-y-4">
                {dealError && (
                  <div className="p-2.5 rounded-lg bg-[#e73e43]/10 border border-[#e73e43]/20 text-[#e73e43] text-xs font-medium flex items-start">
                    <svg className="w-4 h-4 mr-2 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    <span>{dealError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 tracking-wide mb-1.5">Product Pitched</label>
                  <select 
                    value={dealData.productPitched} 
                    onChange={e => setDealData({...dealData, productPitched: e.target.value})}
                    className="w-full px-3.5 py-3 rounded-xl text-sm font-medium text-slate-800 outline-none transition-all appearance-none"
                    style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
                  >
                    <option value="Adivasi Neelambari Oil">Adivasi Neelambari Hair Oil</option>
                    <option value="Sushil Pain Relief">Sushil Pain Relief Gel</option>
                    <option value="Herbal Supplements">General Herbal Supplements</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 tracking-wide mb-1.5">Order Value (₹)</label>
                    <input 
                      type="number" 
                      min="0"
                      required
                      value={dealData.orderValue} 
                      onChange={e => setDealData({...dealData, orderValue: e.target.value})}
                      placeholder="e.g. 5000"
                      className="w-full px-3.5 py-3 rounded-xl text-base font-medium text-slate-800 outline-none transition-all"
                      style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 tracking-wide mb-1.5">Samples Given</label>
                    <input 
                      type="number" 
                      min="0"
                      value={dealData.samplesGiven} 
                      onChange={e => setDealData({...dealData, samplesGiven: e.target.value})}
                      className="w-full px-3.5 py-3 rounded-xl text-base font-medium text-slate-800 outline-none transition-all"
                      style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 tracking-wide mb-1.5">Doctor/Pharmacist Notes</label>
                  <textarea 
                    rows="2"
                    value={dealData.feedback} 
                    onChange={e => setDealData({...dealData, feedback: e.target.value})}
                    placeholder="Any stock requirements or feedback?"
                    className="w-full px-3.5 py-3 rounded-xl text-sm font-medium text-slate-800 outline-none transition-all resize-none"
                    style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }}
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={isSubmittingDeal} 
                    className="w-full py-3.5 rounded-xl text-[13px] font-semibold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ background: '#0a0f1a' }}
                  >
                    {isSubmittingDeal ? (
                      <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving to ledger...</>
                    ) : 'Submit & Calculate Commission'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}