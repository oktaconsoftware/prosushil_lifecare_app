'use client';

export function TopHeader({ mobileNav, handleLogout }) {
  const titles = {
    'route': { title: 'My Territory', sub: 'Assigned medical shops' },
    'deals': { title: 'Collection Ledger', sub: 'Track monthly earnings' },
    'add-shop': { title: 'Register Shop', sub: 'Add new prospect' }
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:flex shrink-0 items-center justify-between px-8 lg:px-10 h-20 bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {titles[mobileNav]?.title || 'Dashboard'}
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            {titles[mobileNav]?.sub}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold px-4 py-2 rounded-full bg-[#97C22A]/10 text-[#7a9e22] shadow-inner">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </header>

 {/* Mobile App Header (Dark Theme with White Text) */}
      <header className="md:hidden flex shrink-0 items-center justify-between px-5 h-25 bg-[#0a0f1c]/95 backdrop-blur-lg sticky top-0 z-30 border-b border-white/10 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Simplified, Transparent Mobile Logo */}
          <div className="w-40 h-40 flex items-center justify-center p-1 shrink-0">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <div className="flex flex-col pt-2">
            <h2 className="text-[14px] font-semibold text-white tracking-tight leading-tight">
              {titles[mobileNav]?.title}
            </h2>
            <p className="text-[10px] font-medium text-slate-500">
              {titles[mobileNav]?.sub}
            </p>
          </div>
        </div>
        
        {/* Adjusted Logout Button for Dark Theme */}
        <button 
          onClick={handleLogout} 
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white/90 border border-white/10 text-slate-800 active:scale-90 active:bg-white/10 hover:text-rose-400 transition-all shadow-sm"
          aria-label="Logout"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </header>
    </>
  );
}


export function Sidebar({ mobileNav, setMobileNav, handleLogout }) {
  const items = [
    { id: 'route', label: 'My Territory', icon: 'M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 'add-shop', label: 'Add Shop', icon: 'M12 4v16m8-8H4' },
    { id: 'deals', label: 'My Deals', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-[320px] shrink-0 relative z-20 bg-[#0a0f1c] border-r border-white/[0.08] shadow-2xl">
      {/* Enhanced Background Ambient Effects */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#97C22A]/10 to-transparent pointer-events-none opacity-60" />
      <div className="absolute pointer-events-none" style={{ top: '-100px', left: '-100px', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(151,194,42,0.12) 0%, transparent 70%)' }} />
      <div className="absolute inset-0 pointer-events-none opacity-50" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

      <div className="relative z-10 px-8  shrink-0 border-b border-white/[0.08]">
        {/* Enlarged Logo with Ambient Glow (Slightly adjusted to match new font scale) */}
        <div className="flex items-center justify-center mb-1 relative">
          <div className="absolute inset-0  blur-[40px] rounded-full scale-12" />
          <div className="w-50 h-50 shrink-0 p-1 relative z-10 drop-shadow-xl transition-transform duration-500 hover:scale-105">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
        </div>
      </div>

      <nav className="relative z-10 flex-1 overflow-y-auto px-6 py-8 space-y-2">
        {items.map((n) => {
          const isActive = mobileNav === n.id;
          return (
            <button 
              key={n.id} 
              onClick={() => setMobileNav(n.id)} 
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-gradient-to-r from-[#97C22A]/20 to-[#97C22A]/5 border border-[#97C22A]/30 shadow-[0_4px_20px_rgba(151,194,42,0.15)]' 
                  : 'bg-transparent border border-transparent hover:bg-white/[0.04] hover:border-white/10'
              }`}
            >
              <div className={`flex items-center justify-center transition-transform duration-300 ${isActive ? 'scale-110 text-[#97C22A]' : 'text-slate-400 group-hover:text-slate-200'}`}>
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? "2" : "1.5"} d={n.icon} />
                </svg>
              </div>
              <span className={`text-[14px] font-base tracking-wide transition-colors duration-300 ${isActive ? 'text-[#97C22A]' : 'text-slate-400 group-hover:text-slate-200'}`}>
                {n.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="relative z-10 px-6 py-6 shrink-0 border-t border-white/[0.08] bg-[#0a0f1c]/50 backdrop-blur-sm">
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl transition-all duration-300 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 group"
        >
          <div className="flex items-center justify-center text-slate-400 group-hover:text-rose-400 transition-colors">
            <svg className="w-5 h-5 shrink-0 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <span className="text-[14px] font-medium tracking-wide">Sign out session</span>
        </button>
      </div>
    </aside>
  );
}

export function BottomNav({ mobileNav, setMobileNav }) {
  const items = [
    { id: 'route', label: 'Route', icon: 'M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 'add-shop', label: 'Add Shop', icon: 'M12 4v16m8-8H4' },
    { id: 'deals', label: 'Deals', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white shadow-[0_-4px_25px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-between h-[65px] px-10 w-full max-w-md mx-auto relative">
        
        {items.map((n, index) => {
          const isActive = mobileNav === n.id;
          const isCenterTab = index === 1; // The "Add Shop" button

          // ── SPECIAL STYLING FOR THE CENTER BUTTON ──
          if (isCenterTab) {
            return (
              <div key={n.id} className="absolute left-1/2 -translate-x-1/2 -top-6 flex flex-col items-center">
                <button 
                  onClick={() => setMobileNav(n.id)}
                  className={`w-[58px] h-[58px] rounded-full flex items-center justify-center text-white border-[5px] border-white shadow-[0_6px_16px_rgba(151,194,42,0.35)] transition-transform active:scale-90 outline-none ${
                    isActive ? 'bg-[#7a9d22]' : 'bg-[#97C22A]'
                  }`}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={n.icon} />
                  </svg>
                </button>
                <span className={`text-[10.5px] mt-1.5 transition-colors ${
                  isActive ? 'font-bold text-[#7a9d22]' : 'font-semibold text-slate-400'
                }`}>
                  {n.label}
                </span>
              </div>
            );
          }

          // ── STYLING FOR THE LEFT & RIGHT BUTTONS ──
          return (
            <button 
              key={n.id} 
              onClick={() => setMobileNav(n.id)} 
              className={`flex flex-col items-center justify-center w-16 h-full gap-1 outline-none transition-colors active:scale-95 ${
                isActive ? 'text-[#97C22A]' : 'text-slate-400 hover:text-slate-500'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className={`transition-transform duration-300 ${isActive ? '-translate-y-1' : 'translate-y-0'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? "2.5" : "2"} d={n.icon} />
                </svg>
              </div>
              <span className={`text-[10.5px] transition-all duration-300 ${
                isActive ? 'font-bold translate-y-0' : 'font-medium -translate-y-0.5'
              }`}>
                {n.label}
              </span>
            </button>
          );
        })}

      </div>
    </nav>
  );
}