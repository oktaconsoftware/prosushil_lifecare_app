// 'use client';
// import { useState } from 'react';
// import { useRouter } from 'next/navigation';

// export default function LoginPage() {
//   const router = useRouter();
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState(''); // NEW: Error state

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setErrorMsg(''); // Clear previous errors

//     try {
//       // Call our new PostgreSQL Database API
//       const response = await fetch('/api/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           employeeId: username, 
//           password: password 
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || 'Authentication failed');
//       }

//       // Route based on the role returned from the database
//       if (data.role === 'ADMIN') {
//         router.push('/admin/dashboard');
//       } else {
//         router.push('/sales/dashboard'); 
//       }
      
//     } catch (error) {
//       setErrorMsg(error.message);
//       setLoading(false); // Only stop loading if there is an error
//     }
//   };

//   return (
//     <div className="min-h-[100dvh] flex flex-col md:flex-row bg-slate-50 font-sans selection:bg-emerald-200">
      
//       {/* Left Panel: Enterprise Branding (MNC Pharma Style) */}
//       <div className="md:flex-1 bg-gradient-to-br from-emerald-800 to-emerald-950 p-8 md:p-16 flex flex-col justify-between relative overflow-hidden">
//         {/* Abstract Medical Graphic / Background Pattern */}
//         <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
//         <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 bg-emerald-500 opacity-10 rounded-full blur-3xl"></div>

//         <div className="relative z-10">
//           <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
//             Prosushil Lifecare LLP
//           </h1>
//           <p className="text-emerald-300 font-medium text-lg mt-2 max-w-sm">
//             Enterprise Field Force & Administrative Portal
//           </p>
//         </div>

//         <div className="relative z-10 mt-12 md:mt-0 space-y-4">
//           <div className="bg-emerald-900/40 border border-emerald-800/50 p-4 rounded-xl backdrop-blur-sm max-w-md">
//             <h3 className="text-emerald-100 font-bold text-sm flex items-center">
//               <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z"></path></svg>
//               Restricted Access
//             </h3>
//             <p className="text-emerald-300/80 text-xs mt-1 leading-relaxed">
//               This system is strictly for authorized marketing executives and administrative personnel. All activities are logged and monitored for compliance.
//             </p>
//           </div>
//           <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
//             <span>Powered by Oktacon Softwares</span>
//             <span>v2.4.0 (Android Build)</span>
//           </div>
//         </div>
//       </div>

//       {/* Right Panel: Secure Login Form */}
//       <div className="md:w-[680px] lg:w-[740px] bg-white flex items-center justify-center p-8 md:p-12 shadow-[-20px_0_40px_rgba(0,0,0,0.05)] z-20">
//         <div className="w-full max-w-md space-y-8">
          
//           <div>
//             <h2 className="text-2xl font-black text-slate-900">Secure Sign In</h2>
//             <p className="text-slate-500 font-medium text-sm mt-1">Please enter your enterprise credentials.</p>
//           </div>

//           <form onSubmit={handleLogin} className="space-y-6">
            
//             {/* NEW: Error Message Display */}
//             {errorMsg && (
//               <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-semibold flex items-center">
//                 <svg className="w-4 h-4 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
//                 {errorMsg}
//               </div>
//             )}

//             <div className="space-y-2">
//               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Employee ID / Username</label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
//                 </div>
//                 <input
//                   type="text"
//                   required
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                   className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 font-semibold transition-all"
//                   placeholder="e.g. PL-ADMIN"
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <div className="flex items-center justify-between">
//                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
//                 <a href="#" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Forgot Password?</a>
//               </div>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z"></path></svg>
//                 </div>
//                 <input
//                   type="password"
//                   required
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 font-semibold transition-all"
//                   placeholder="••••••••"
//                 />
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-xl shadow-[0_8px_20px_rgba(5,150,105,0.2)] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 text-lg mt-2 flex justify-center items-center"
//             >
//               {loading ? (
//                 <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                 </svg>
//               ) : 'Authenticate'}
//             </button>
//           </form>

//           {/* IT Helpdesk Section */}
//           <div className="pt-8 mt-8 border-t border-slate-100 text-center">
//             <p className="text-xs font-semibold text-slate-500">
//               Need access or facing issues? <br/>
//               Contact <span className="text-emerald-600 cursor-pointer hover:underline">IT Helpdesk</span>
//             </p>
//           </div>

//         </div>
//       </div>

//     </div>
//   );
// }

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: username, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Authentication failed');
      if (data.role === 'ADMIN') router.push('/admin/dashboard');
      else router.push('/sales/dashboard');
    } catch (error) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] w-full overflow-hidden flex font-sans" style={{ background: '#0a0f1a' }}>

      {/* ─── MOBILE VIEW ─── */}
      <div className="md:hidden flex flex-col w-full h-full relative overflow-hidden">

        {/* Ambient top blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(151,194,42,0.12) 0%, transparent 70%)', transform: 'translate(-30%, -30%)' }} />
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(231,62,67,0.08) 0%, transparent 70%)', transform: 'translate(30%, -20%)' }} />

        {/* Header strip */}
        <div className="shrink-0 flex items-center justify-between px-5 pt-8 pb-4 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(151,194,42,0.15)', border: '1px solid rgba(151,194,42,0.25)' }}>
              <svg className="w-3.5 h-3.5" style={{ color: '#97c22a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white leading-none">Prosushil Lifecare</p>
              <p className="text-[9px] font-medium mt-0.5" style={{ color: '#97c22a' }}>Enterprise Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: 'rgba(151,194,42,0.08)', border: '1px solid rgba(151,194,42,0.18)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#97c22a' }} />
            <span className="text-[9px] font-medium" style={{ color: '#a8d44a' }}>v2.4 live</span>
          </div>
        </div>

        {/* Hero info area */}
        <div className="pb-10 px-5 pt-3 relative z-10 min-h-0">
          <h1 className="text-[22px] font-semibold text-white leading-tight tracking-tight">
            Field intelligence<br />
            <span style={{ color: '#97c22a' }}>at your fingertips</span>
          </h1>
          <p className="text-[11px] font-medium mt-2 leading-relaxed" style={{ color: '#8896aa' }}>
            Real-time territory management, geospatial tracking, and sales telemetry — all in one platform.
          </p>

          {/* Mini stat pills */}
          <div className="flex gap-2 mt-4">
            {[
              { icon: 'M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', label: 'GPS verified', val: 'Field visits' },
              { icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', label: 'Live sync', val: 'Sales data' },
            ].map((s, i) => (
              <div key={i} className="flex-1 p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <svg className="w-3.5 h-3.5 mb-1.5" style={{ color: i === 0 ? '#97c22a' : '#e73e43' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={s.icon} /></svg>
                <p className="text-[11px] font-semibold text-white leading-none">{s.val}</p>
                <p className="text-[9px] font-medium mt-0.5" style={{ color: '#8896aa' }}>{s.label}</p>
              </div>
            ))}
            <div className="flex-1 p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <svg className="w-3.5 h-3.5 mb-1.5" style={{ color: '#60a5fa' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-[11px] font-semibold text-white leading-none">Ledger</p>
              <p className="text-[9px] font-medium mt-0.5" style={{ color: '#8896aa' }}>Auto-tracked</p>
            </div>
          </div>
        </div>

        {/* Login card — bottom sheet */}
        <div className="shrink-0 relative z-20 mx-3 mb-4 rounded-2xl overflow-hidden" style={{ background: '#0a0f1a', backdropFilter: 'blur(20px)' }}>
          <div className="px-5 pt-5 pb-6">
            <p className="text-[18px] font-semibold text-slate-100 mb-4 tracking-tight">Sign in to your account</p>

            {errorMsg && (
              <div className="flex items-start gap-2 p-2.5 rounded-xl mb-3" style={{ background: 'rgba(231,62,67,0.08)', border: '1px solid rgba(231,62,67,0.18)' }}>
                <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#e73e43' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <p className="text-[11px] font-medium leading-tight" style={{ color: '#c0373b' }}>{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-300 mb-1.5 tracking-wide">Employee ID</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-[15px] text-slate-800 outline-none transition-all"
                  style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', fontSize: '16px' }}
                  onFocus={e => e.target.style.borderColor = '#97c22a'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  placeholder="e.g. PL-1042"
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-300 mb-1.5 tracking-wide">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2.5 pr-10 rounded-xl text-slate-800 outline-none transition-all"
                    style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', fontSize: '16px' }}
                    onFocus={e => e.target.style.borderColor = '#97c22a'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute inset-y-0 right-0 pr-3 flex items-center" tabIndex={-1}>
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword
                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                      }
                    </svg>
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
                style={{ background: loading ? '#7aaa1f' : '#97c22a', boxShadow: '0 4px 16px rgba(151,194,42,0.28)' }}
              >
                {loading ? (
                  <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Verifying identity...</>
                ) : 'Sign in'}
              </button>
            </form>
            <p className="text-[9px] font-medium text-center mt-3" style={{ color: '#94a3b8' }}>Secured by Oktacon Softwares · All access logged</p>
          </div>
        </div>
      </div>

   <div className="hidden md:flex w-full h-full relative">
        
        {/* Left Panel: Enterprise Context (Expands automatically) */}
        <div className="flex-1 bg-slate-900 p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden border-r border-slate-800">
          
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none"></div>
          
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#97c22a]/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#e73e43]/5 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/3"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 backdrop-blur-md px-3 py-1.5 rounded-full mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#97c22a] animate-pulse shadow-[0_0_10px_#97c22a]"></span>
              <span className="text-xs font-medium text-slate-300 tracking-wide">System Online • v2.4.0</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-semibold text-white tracking-tight leading-[1.1]">
              Prosushil <br/>
              <span className="text-[#97c22a]">Lifecare LLP</span>
            </h1>
            <p className="text-slate-400 font-medium text-base lg:text-lg mt-5 max-w-lg leading-relaxed">
              Centralized intelligence platform for field operations, dynamic territory management, and real-time sales telemetry.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-8">
              <div className="flex items-center space-x-2 text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-md border border-slate-700/50">
                <svg className="w-4 h-4 text-[#97c22a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                <span className="text-xs font-medium">End-to-End Encrypted</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-md border border-slate-700/50">
                <svg className="w-4 h-4 text-[#97c22a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                <span className="text-xs font-medium">99.9% Uptime</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-12 w-full max-w-xl">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 tracking-wide">Enterprise Capabilities</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              <div className="bg-white/5 border border-white/10 p-5 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 bg-[#97c22a]/10 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-[#97c22a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </div>
                <h4 className="text-sm font-semibold text-white mb-1.5">Geospatial Protocol</h4>
                <p className="text-xs font-medium text-slate-400 leading-relaxed">Hardware-locked verification for all field visits ensuring strict routing compliance.</p>
              </div>

              <div className="bg-white/5 border border-white/10 p-5 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 bg-[#e73e43]/10 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-[#e73e43]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                </div>
                <h4 className="text-sm font-semibold text-white mb-1.5">Live Telemetry</h4>
                <p className="text-xs font-medium text-slate-400 leading-relaxed">Instant database synchronization between mobile agents and the command center.</p>
              </div>

              <div className="bg-white/5 border border-white/10 p-5 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-colors hidden lg:block">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h4 className="text-sm font-semibold text-white mb-1.5">Automated Ledger</h4>
                <p className="text-xs font-medium text-slate-400 leading-relaxed">Real-time compilation of successful closures and dynamic commission routing.</p>
              </div>

              <div className="bg-white/5 border border-white/10 p-5 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-colors hidden lg:block">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                </div>
                <h4 className="text-sm font-semibold text-white mb-1.5">Role-Based Access</h4>
                <p className="text-xs font-medium text-slate-400 leading-relaxed">Strict data compartmentalization separating field execution from administration.</p>
              </div>

            </div>

            <div className="flex items-center justify-between text-slate-500 text-xs font-medium pt-8 mt-8 border-t border-slate-800">
              <span>Powered by Oktacon Softwares</span>
              <span>© {new Date().getFullYear()} Restricted System</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Clean Login Form */}
        <div className="w-[360px] lg:w-[460px] xl:w-[540px] bg-white flex items-center justify-center p-8 lg:p-12 shadow-[-20px_0_40px_rgba(0,0,0,0.02)] z-20 shrink-0">
          <div className="w-full space-y-8">
            
            <div>
              <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <h2 className="text-2xl lg:text-3xl font-semibold text-slate-800 tracking-tight">Access Portal</h2>
              <p className="text-slate-500 font-medium text-sm mt-1.5">Please authenticate with your enterprise credentials.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              
              {errorMsg && (
                <div className="p-4 rounded-xl bg-[#e73e43]/10 border border-[#e73e43]/20 text-[#e73e43] text-sm font-medium flex items-start shadow-sm">
                  <svg className="w-5 h-5 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-600">Employee ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#97c22a]/10 focus:border-[#97c22a] outline-none text-slate-800 text-sm font-medium transition-all"
                    placeholder="e.g. PL-ADMIN"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-600">Password</label>
                  <a href="#" className="text-xs font-medium text-[#97c22a] hover:text-[#85ab25] transition-colors">Forgot Password?</a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z"></path></svg>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#97c22a]/10 focus:border-[#97c22a] outline-none text-slate-800 text-sm font-medium transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#97c22a] hover:bg-[#85ab25] text-white font-medium py-3.5 rounded-xl shadow-[0_4px_15px_rgba(151,194,42,0.25)] hover:shadow-[0_6px_20px_rgba(151,194,42,0.3)] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 text-base flex justify-center items-center"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : 'Authenticate Request'}
                </button>
              </div>
            </form>

            <div className="pt-8 mt-8 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-500 leading-relaxed">
                Unauthorized access is strictly prohibited. All authentication requests are monitored and logged for security compliance.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}