'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(''); // NEW: Error state

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(''); // Clear previous errors

    try {
      // Call our new PostgreSQL Database API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          employeeId: username, 
          password: password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Route based on the role returned from the database
      if (data.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/sales/dashboard'); 
      }
      
    } catch (error) {
      setErrorMsg(error.message);
      setLoading(false); // Only stop loading if there is an error
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-slate-50 font-sans selection:bg-emerald-200">
      
      {/* Left Panel: Enterprise Branding (MNC Pharma Style) */}
      <div className="md:flex-1 bg-gradient-to-br from-emerald-800 to-emerald-950 p-8 md:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Abstract Medical Graphic / Background Pattern */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 bg-emerald-500 opacity-10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            Prosushil Lifecare LLP
          </h1>
          <p className="text-emerald-300 font-medium text-lg mt-2 max-w-sm">
            Enterprise Field Force & Administrative Portal
          </p>
        </div>

        <div className="relative z-10 mt-12 md:mt-0 space-y-4">
          <div className="bg-emerald-900/40 border border-emerald-800/50 p-4 rounded-xl backdrop-blur-sm max-w-md">
            <h3 className="text-emerald-100 font-bold text-sm flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z"></path></svg>
              Restricted Access
            </h3>
            <p className="text-emerald-300/80 text-xs mt-1 leading-relaxed">
              This system is strictly for authorized marketing executives and administrative personnel. All activities are logged and monitored for compliance.
            </p>
          </div>
          <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
            <span>Powered by Oktacon Softwares</span>
            <span>v2.4.0 (Android Build)</span>
          </div>
        </div>
      </div>

      {/* Right Panel: Secure Login Form */}
      <div className="md:w-[680px] lg:w-[740px] bg-white flex items-center justify-center p-8 md:p-12 shadow-[-20px_0_40px_rgba(0,0,0,0.05)] z-20">
        <div className="w-full max-w-md space-y-8">
          
          <div>
            <h2 className="text-2xl font-black text-slate-900">Secure Sign In</h2>
            <p className="text-slate-500 font-medium text-sm mt-1">Please enter your enterprise credentials.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* NEW: Error Message Display */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-semibold flex items-center">
                <svg className="w-4 h-4 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                {errorMsg}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Employee ID / Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 font-semibold transition-all"
                  placeholder="e.g. PL-ADMIN"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                <a href="#" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Forgot Password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 font-semibold transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-xl shadow-[0_8px_20px_rgba(5,150,105,0.2)] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 text-lg mt-2 flex justify-center items-center"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Authenticate'}
            </button>
          </form>

          {/* IT Helpdesk Section */}
          <div className="pt-8 mt-8 border-t border-slate-100 text-center">
            <p className="text-xs font-semibold text-slate-500">
              Need access or facing issues? <br/>
              Contact <span className="text-emerald-600 cursor-pointer hover:underline">IT Helpdesk</span>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}