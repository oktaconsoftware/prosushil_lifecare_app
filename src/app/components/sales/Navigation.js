'use client';

export function TopHeader({ mobileNav, handleLogout }) {
  const titles = {
    'route': { title: 'My Territory', sub: 'Your permanently assigned medical shops' },
    'deals': { title: 'CollectionLedger', sub: 'Track your monthly earnings' },
    'add-shop': { title: 'Register Shop', sub: 'Add a new prospect to the database' }
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
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: mobileNav === 'radar' ? 'rgba(168,85,247,0.1)' : mobileNav === 'add-shop' ? 'rgba(37,99,235,0.1)' : mobileNav === 'route' ? 'rgba(151,194,42,0.1)' : 'rgba(96,165,250,0.1)' }}>
            {mobileNav === 'route' && <svg className="w-3.5 h-3.5" style={{ color: '#97c22a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>}
            {mobileNav === 'deals' && <svg className="w-3.5 h-3.5" style={{ color: '#60a5fa' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>}
            {mobileNav === 'add-shop' && <svg className="w-3.5 h-3.5" style={{ color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>}
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

export function Sidebar({ mobileNav, setMobileNav, handleLogout }) {
  const items = [
    { id: 'route', label: 'My Territory', icon: 'M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z' },
    // ADDED: The new Add Shop menu item
    { id: 'add-shop', label: 'Add Shop', icon: 'M12 4v16m8-8H4' },
    { id: 'deals', label: 'My deals', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ];

  return (
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
        {items.map((n) => (
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
  );
}

export function BottomNav({ mobileNav, setMobileNav }) {
  const items = [
    { id: 'route', label: 'Route', icon: 'M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z' },
    // ADDED: The new Add Shop menu item
    { id: 'add-shop', label: 'Add Shop', icon: 'M12 4v16m8-8H4' },
    { id: 'deals', label: 'Deals', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ];

  return (
    <nav className="md:hidden absolute bottom-0 left-0 right-0 z-40 bg-white" style={{ borderTop: '1px solid #e9edf2', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around px-1 h-14">
        {items.map((n) => (
          <button key={n.id} onClick={() => setMobileNav(n.id)} className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all">
            <svg className="w-5 h-5" style={{ color: mobileNav === n.id ? (n.id === 'radar' ? '#a855f7' : n.id === 'add-shop' ? '#2563eb' : '#97c22a') : '#94a3b8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={mobileNav === n.id ? '2' : '1.5'} d={n.icon} />
            </svg>
            <span className="text-[9px] font-semibold" style={{ color: mobileNav === n.id ? (n.id === 'radar' ? '#a855f7' : n.id === 'add-shop' ? '#2563eb' : '#97c22a') : '#94a3b8' }}>{n.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}