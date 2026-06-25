"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import CommissionTab from '../../components/admin/CommissionTab';
import DailyReportTab from '../../components/admin/DailyReportTab';
import TerritorySetupTab from '../../components/admin/TerritorySetupTab';
import DailySalesTab from '../../components/admin/DailySalesTab';

function Field({ label, hint, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[11px] font-semibold text-slate-500 tracking-wide">{label}</label>
        {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-800 outline-none transition-all";
const inputStyle = { background: '#f8fafc', border: '1.5px solid #e2e8f0', fontSize: '16px' };
const inputFocus = (e) => { e.target.style.borderColor = '#97c22a'; e.target.style.boxShadow = '0 0 0 3px rgba(151,194,42,0.1)'; };
const inputBlur  = (e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; };

export default function AdminDashboard() {
  const router = useRouter();
  const [adminNav, setAdminNav] = useState('command'); // 'command' | 'ledger' | 'reports'
  
  const [team, setTeam] = useState([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(true);
  const [currentAdminId, setCurrentAdminId] = useState('PL-ADMIN');

  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen]   = useState(false);
  const [isEditModalOpen, setIsEditModalOpen]         = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen]     = useState(false);

  const [newAgentData, setNewAgentData]   = useState({ name: '', employeeId: '', password: '' });
  const [editAgentData, setEditAgentData] = useState({ originalEmployeeId: '', name: '', employeeId: '', password: '' });
  const [agentToDelete, setAgentToDelete] = useState(null);
  const [profileData, setProfileData]     = useState({ newEmployeeId: '', newPassword: '' });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleLogout = () => router.push('/');

  const fetchTeamData = async () => {
    setIsLoadingTeam(true);
    try {
      const res  = await fetch('/api/admin/agents');
      const data = await res.json();
      if (res.ok) setTeam(data);
    } catch (e) { console.error(e); }
    finally { setIsLoadingTeam(false); }
  };
  
  useEffect(() => { fetchTeamData(); }, []);

  const resetMsg = () => setSubmitMessage({ type: '', text: '' });

  const handleProvisionAgent = async (e) => {
    e.preventDefault(); setIsSubmitting(true); resetMsg();
    try {
      const res  = await fetch('/api/admin/agents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newAgentData, role: 'AGENT' }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmitMessage({ type: 'success', text: 'Agent provisioned successfully.' });
      setNewAgentData({ name: '', employeeId: '', password: '' }); setShowPassword(false);
      fetchTeamData(); setTimeout(() => setIsProvisionModalOpen(false), 1500);
    } catch (err) { setSubmitMessage({ type: 'error', text: err.message }); }
    finally { setIsSubmitting(false); }
  };

  const handleEditAgent = async (e) => {
    e.preventDefault(); setIsSubmitting(true); resetMsg();
    try {
      const res  = await fetch('/api/admin/agents', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editAgentData) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmitMessage({ type: 'success', text: 'Agent updated.' });
      fetchTeamData(); setTimeout(() => setIsEditModalOpen(false), 1500);
    } catch (err) { setSubmitMessage({ type: 'error', text: err.message }); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteAgent = async () => {
    setIsSubmitting(true); resetMsg();
    try {
      const res  = await fetch('/api/admin/agents', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId: agentToDelete.id }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchTeamData(); setIsDeleteModalOpen(false); setAgentToDelete(null);
    } catch (err) { setSubmitMessage({ type: 'error', text: err.message }); }
    finally { setIsSubmitting(false); }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault(); setIsSubmitting(true); resetMsg();
    try {
      const res  = await fetch('/api/admin/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentEmployeeId: currentAdminId, newEmployeeId: profileData.newEmployeeId, newPassword: profileData.newPassword }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmitMessage({ type: 'success', text: 'Profile updated.' });
      if (profileData.newEmployeeId) setCurrentAdminId(profileData.newEmployeeId);
      setProfileData({ newEmployeeId: '', newPassword: '' }); setShowPassword(false);
      setTimeout(() => setIsProfileModalOpen(false), 1500);
    } catch (err) { setSubmitMessage({ type: 'error', text: err.message }); }
    finally { setIsSubmitting(false); }
  };

  const openEditModal = (agent) => {
    setEditAgentData({ originalEmployeeId: agent.id, name: agent.name, employeeId: agent.id, password: '' });
    resetMsg(); setShowPassword(false); setIsEditModalOpen(true);
  };
  const openDeleteModal = (agent) => { setAgentToDelete(agent); resetMsg(); setIsDeleteModalOpen(true); };

  const totalPipeline     = team.reduce((s, a) => s + (a.pipeline || 0), 0);
  const commissionPending = team.reduce((s, a) => s + (a.commission || 0), 0);
  const violations        = team.filter(a => a.status === 'Flagged').length;

  const kpis = [
    { label: 'Total pipeline',      value: `₹${totalPipeline.toLocaleString('en-IN')}`,     sub: 'All active deals',     accent: '#97c22a', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { label: 'Active agents',       value: team.length,                                      sub: 'Provisioned accounts', accent: '#60a5fa', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { label: 'Protocol violations', value: violations,                                       sub: 'Flagged agents',       accent: '#e73e43', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    { label: 'Commission pending',  value: `₹${commissionPending.toLocaleString('en-IN')}`, sub: 'Awaiting disbursal',   accent: '#a78bfa', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  const Msg = () => submitMessage.text ? (
    <div className="flex items-start gap-2 p-3 rounded-xl text-xs font-medium" style={{ background: submitMessage.type === 'success' ? 'rgba(151,194,42,0.08)' : 'rgba(231,62,67,0.08)', border: `1px solid ${submitMessage.type === 'success' ? 'rgba(151,194,42,0.2)' : 'rgba(231,62,67,0.2)'}`, color: submitMessage.type === 'success' ? '#5a8a10' : '#c0373b' }}>
      <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={submitMessage.type === 'success' ? 'M5 13l4 4L19 7' : 'M12 9v2m0 4h.01'} /></svg>
      {submitMessage.text}
    </div>
  ) : null;

  const EyeBtn = () => (
    <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3.5 inset-y-0 flex items-center" tabIndex={-1}>
      <svg className="w-4 h-4" style={{ color: '#94a3b8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {showPassword
          ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
        }
      </svg>
    </button>
  );

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden font-sans" style={{ background: '#f1f5f9' }}>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 relative z-20" style={{ background: '#0a0f1a', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute pointer-events-none" style={{ top: '-60px', right: '-60px', width: '240px', height: '240px', background: 'radial-gradient(circle,rgba(151,194,42,0.1) 0%,transparent 70%)' }} />

        <div className="relative z-10 px-6 py-7 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(151,194,42,0.12)', border: '1px solid rgba(151,194,42,0.2)' }}>
              <svg className="w-4 h-4" style={{ color: '#97c22a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-white leading-none">Prosushil Lifecare</p>
              <p className="text-[10px] font-medium mt-0.5" style={{ color: '#97c22a' }}>Admin console</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit" style={{ background: 'rgba(151,194,42,0.08)', border: '1px solid rgba(151,194,42,0.15)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#97c22a' }} />
            <span className="text-[10px] font-medium" style={{ color: '#a3cc35' }}>System online · v2.4.0</span>
          </div>
        </div>

   <nav className="relative z-10 flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {[
            { id: 'command', label: 'Command center',   icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
            { id: 'territory', label: 'Territory Setup', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
            { id: 'ledger',  label: 'Commission ledger', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
            { id: 'reports', label: 'Daily agent reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            
            // 🚨 FIXED: Replaced duplicate path with a "Trending Up / Sales" icon and capitalized label
            { id: 'sales', label: 'Sales performance', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' }
          
          ].map((n) => (
            <button key={n.id} onClick={() => setAdminNav(n.id)} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left" style={adminNav === n.id ? { background: 'rgba(151,194,42,0.1)', border: '1px solid rgba(151,194,42,0.18)', color: '#97c22a' } : { color: '#8896aa', border: '1px solid transparent' }}>
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={n.icon} /></svg>
              <span className="text-[13px] font-medium">{n.label}</span>
            </button>
          ))}
        </nav>

        <div className="relative z-10 px-4 py-4 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={() => { resetMsg(); setIsProfileModalOpen(true); }} className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl transition-all mb-1 text-left" style={{ border: '1px solid transparent' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0" style={{ background: 'rgba(151,194,42,0.12)', border: '1px solid rgba(151,194,42,0.2)', color: '#97c22a' }}>AD</div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[13px] font-medium text-white truncate leading-none">Profile settings</p>
              <p className="text-[10px] mt-0.5 truncate" style={{ color: '#8896aa' }}>{currentAdminId}</p>
            </div>
            <svg className="w-3.5 h-3.5 shrink-0" style={{ color: '#8896aa' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl transition-all" style={{ border: '1px solid transparent', color: '#8896aa' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(231,62,67,0.08)'; e.currentTarget.style.color = '#e73e43'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8896aa'; }}>
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span className="text-[13px] font-medium">Sign out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden relative w-full">

        <header className="hidden md:flex shrink-0 items-center justify-between px-8 lg:px-10 h-[72px] bg-white" style={{ borderBottom: '1px solid #e9edf2', boxShadow: '0 1px 0 #e9edf2' }}>
      <div>
            <h2 className="text-lg font-semibold text-slate-800 tracking-tight">
              {adminNav === 'command' ? 'Sales operations' : adminNav === 'ledger' ? 'Commission Treasury' : adminNav === 'planner' ? 'Route Dispatcher' : 'Daily Field Reports'}
            </h2>
            <p className="text-xs font-medium mt-0.5" style={{ color: '#8896aa' }}>
              {adminNav === 'command' ? 'Real-time agent performance and territory tracking' : adminNav === 'ledger' ? 'Review and approve field force payouts' : adminNav === 'planner' ? 'Assign specific medical shops to agents' : 'Analyze daily salesman logs and outcomes'}
            </p>
          </div>
          <button
            onClick={() => { resetMsg(); setIsProvisionModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98]"
            style={{ background: '#97c22a', boxShadow: '0 4px 14px rgba(151,194,42,0.28)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Provision agent
          </button>
        </header>

        <header className="md:hidden flex shrink-0 items-center justify-between px-4 h-14 bg-white" style={{ borderBottom: '1px solid #e9edf2' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(151,194,42,0.1)' }}>
              <svg className="w-3.5 h-3.5" style={{ color: '#97c22a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <p className="text-[13px] font-semibold text-slate-800">Admin console</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { resetMsg(); setIsProfileModalOpen(true); }} className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold" style={{ background: 'rgba(151,194,42,0.1)', color: '#5a8a10', border: '1px solid rgba(151,194,42,0.2)' }}>AD</button>
            <button onClick={handleLogout} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </header>

        {/* VIEW ROUTING */}
        {adminNav === 'command' && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-8 lg:p-10 space-y-5 md:space-y-7 pb-24 md:pb-10 max-w-7xl mx-auto w-full">

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
                {kpis.map((k) => (
                  <div key={k.label} className="relative overflow-hidden p-4 md:p-6 rounded-2xl bg-white" style={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                      <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center" style={{ background: `${k.accent}14` }}>
                        <svg className="w-4 h-4 md:w-4.5 md:h-4.5" style={{ color: k.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={k.icon} /></svg>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full mt-1" style={{ background: k.accent }} />
                    </div>
                    <p className="text-[10px] md:text-[11px] font-semibold tracking-wide mb-1" style={{ color: '#8896aa' }}>{k.label}</p>
                    <p className="text-lg md:text-2xl font-semibold text-slate-800 tracking-tight leading-none">{k.value}</p>
                    <p className="text-[10px] font-medium mt-1" style={{ color: '#b0bac8' }}>{k.sub}</p>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl" style={{ background: `${k.accent}40` }} />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[13px] md:text-base font-semibold text-slate-800">Field representative logs</h3>
                </div>
                <button onClick={() => { resetMsg(); setIsProvisionModalOpen(true); }} className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold" style={{ background: 'rgba(151,194,42,0.1)', color: '#5a8a10', border: '1px solid rgba(151,194,42,0.2)' }}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                  Add agent
                </button>
              </div>

              {/* ── DESKTOP TABLE ─────────────────────── */}
              <div className="hidden md:block rounded-2xl overflow-hidden bg-white" style={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                {isLoadingTeam ? (
                  <div className="flex items-center justify-center py-16 gap-3">
                    <span className="text-sm text-slate-400">Loading agents...</span>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e9edf2' }}>
                        {['Agent ID', 'Name', 'Target location', 'Status', 'Actions'].map((h, i) => (
                          <th key={h} className="px-5 py-3.5 text-[11px] font-semibold tracking-wide" style={{ color: '#8896aa', textAlign: i >= 3 ? 'center' : 'left' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {team.length === 0 ? (
                        <tr><td colSpan="5" className="py-14 text-center text-sm" style={{ color: '#8896aa' }}>No agents provisioned yet.</td></tr>
                      ) : team.map((agent, i) => (
                        <tr key={agent.id} style={{ borderTop: i > 0 ? '1px solid #f1f5f9' : 'none' }}>
                          <td className="px-5 py-4 font-mono text-[12px]" style={{ color: '#8896aa' }}>{agent.id}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              <span className="text-sm font-medium text-slate-700">{agent.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm max-w-[200px] truncate" style={{ color: '#8896aa' }}>{agent.target || '—'}</td>
                          <td className="px-5 py-4 text-center">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold" style={agent.status === 'Flagged' ? { background: 'rgba(231,62,67,0.08)', color: '#c0373b' } : { background: 'rgba(151,194,42,0.08)', color: '#5a8a10' }}>
                              {agent.status || 'Active'}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-2">
                              {/* View History is handled via the separate Reports tab */}
                              <button onClick={() => openEditModal(agent)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all" style={{ color: '#94a3b8' }} title="Edit">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              </button>
                              <button onClick={() => openDeleteModal(agent)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all" style={{ color: '#94a3b8' }} title="Delete">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="md:hidden space-y-2.5">
                {isLoadingTeam ? (
                  <div className="text-center py-10 text-xs text-slate-400">Loading...</div>
                ) : team.map((agent) => (
                  <div key={agent.id} className="rounded-2xl p-4 bg-white" style={{ border: '1px solid #e9edf2' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div>
                          <p className="text-[13px] font-semibold text-slate-800 leading-none">{agent.name}</p>
                          <p className="text-[10px] font-mono mt-0.5" style={{ color: '#8896aa' }}>{agent.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold" style={agent.status === 'Flagged' ? { background: 'rgba(231,62,67,0.08)', color: '#c0373b' } : { background: 'rgba(151,194,42,0.08)', color: '#5a8a10' }}>
                          <span className="w-1 h-1 rounded-full" style={{ background: agent.status === 'Flagged' ? '#e73e43' : '#97c22a' }} />
                          {agent.status || 'Active'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(agent)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold" style={{ background: '#eff6ff', color: '#3b82f6', border: '1px solid #dbeafe' }}>Edit</button>
                      <button onClick={() => openDeleteModal(agent)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold" style={{ background: 'rgba(231,62,67,0.07)', color: '#c0373b', border: '1px solid rgba(231,62,67,0.15)' }}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {adminNav === 'ledger' && <CommissionTab />}
        {adminNav === 'reports' && <DailyReportTab team={team} />}
        {adminNav === 'territory' && <TerritorySetupTab />}
        {adminNav === 'sales' && <DailySalesTab />}

{/* BOTTOM NAV */}
        <nav className="md:hidden absolute bottom-0 left-0 right-0 z-40 bg-white" style={{ borderTop: '1px solid #e9edf2', paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="flex items-center justify-around px-2 h-14">
            {[
              { id: 'command', label: 'Command', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z' },
              { id: 'ledger', label: 'Treasury', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
              { id: 'reports', label: 'Reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
              
              // 🚨 FIXED: Added a proper "Sales / Trending Up" icon path here
              { id: 'sales', label: 'Sales', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' }, 
            ].map((n) => (
              <button key={n.id} onClick={() => setAdminNav(n.id)} className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all">
                
                {/* 🚨 FIXED: Changed w-4.5 h-4.5 to standard w-5 h-5 */}
                <svg className="w-5 h-5" style={{ color: adminNav === n.id ? '#97c22a' : '#94a3b8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={adminNav === n.id ? '2' : '1.5'} d={n.icon} />
                </svg>
                
                <span className="text-[9px] font-semibold" style={{ color: adminNav === n.id ? '#97c22a' : '#94a3b8' }}>{n.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* MODALS */}
        {isProvisionModalOpen && (
          <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" style={{ background: 'rgba(10,15,26,0.65)', backdropFilter: 'blur(6px)' }}>
            <div className="w-full sm:max-w-md bg-white overflow-hidden sm:rounded-2xl" style={{ borderRadius: '20px 20px 0 0', boxShadow: '0 -8px 40px rgba(0,0,0,0.15)' }}>
              <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-8 h-1 rounded-full bg-slate-200" /></div>
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <p className="text-[13px] font-semibold text-slate-800">Provision new agent</p>
                  <p className="text-[11px] mt-0.5" style={{ color: '#8896aa' }}>Create a field representative account</p>
                </div>
                <button onClick={() => setIsProvisionModalOpen(false)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleProvisionAgent} className="px-5 py-4 space-y-3.5">
                <Msg />
                <Field label="Full name">
                  <input type="text" required value={newAgentData.name} onChange={e => setNewAgentData({ ...newAgentData, name: e.target.value })} className={inputCls} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} placeholder="e.g. Rahul Sharma" />
                </Field>
                <Field label="Employee ID" hint="Used as login username">
                  <input type="text" required value={newAgentData.employeeId} onChange={e => setNewAgentData({ ...newAgentData, employeeId: e.target.value })} className={inputCls} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} placeholder="e.g. PL-1043" />
                </Field>
                <Field label="Temporary password">
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} required value={newAgentData.password} onChange={e => setNewAgentData({ ...newAgentData, password: e.target.value })} className={inputCls + ' pr-10'} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} placeholder="Min. 8 characters" />
                    <EyeBtn />
                  </div>
                </Field>
                <div className="flex gap-2.5 pt-1">
                  <button type="button" onClick={() => setIsProvisionModalOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 transition-all" style={{ border: '1.5px solid #e2e8f0' }}>Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ background: '#97c22a', boxShadow: '0 4px 14px rgba(151,194,42,0.25)' }}>
                    {isSubmitting ? 'Creating...' : 'Create account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isEditModalOpen && (
          <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" style={{ background: 'rgba(10,15,26,0.65)', backdropFilter: 'blur(6px)' }}>
            <div className="w-full sm:max-w-md bg-white overflow-hidden sm:rounded-2xl" style={{ borderRadius: '20px 20px 0 0', boxShadow: '0 -8px 40px rgba(0,0,0,0.15)' }}>
              <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-8 h-1 rounded-full bg-slate-200" /></div>
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <p className="text-[13px] font-semibold text-slate-800">Edit agent</p>
                  <p className="text-[10px] font-mono mt-0.5" style={{ color: '#8896aa' }}>{editAgentData.originalEmployeeId}</p>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleEditAgent} className="px-5 py-4 space-y-3.5">
                <Msg />
                <Field label="Full name">
                  <input type="text" required value={editAgentData.name} onChange={e => setEditAgentData({ ...editAgentData, name: e.target.value })} className={inputCls} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                </Field>
                <Field label="Employee ID">
                  <input type="text" required value={editAgentData.employeeId} onChange={e => setEditAgentData({ ...editAgentData, employeeId: e.target.value })} className={inputCls} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                </Field>
                <Field label="New password" hint="Optional">
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={editAgentData.password} onChange={e => setEditAgentData({ ...editAgentData, password: e.target.value })} className={inputCls + ' pr-10'} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} placeholder="Leave blank to keep current" />
                    <EyeBtn />
                  </div>
                </Field>
                <div className="flex gap-2.5 pt-1">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600" style={{ border: '1.5px solid #e2e8f0' }}>Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ background: '#3b82f6', boxShadow: '0 4px 14px rgba(59,130,246,0.22)' }}>
                    {isSubmitting ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isDeleteModalOpen && agentToDelete && (
          <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" style={{ background: 'rgba(10,15,26,0.65)', backdropFilter: 'blur(6px)' }}>
            <div className="w-full sm:max-w-sm bg-white overflow-hidden sm:rounded-2xl" style={{ borderRadius: '20px 20px 0 0', boxShadow: '0 -8px 40px rgba(0,0,0,0.15)' }}>
              <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-8 h-1 rounded-full bg-slate-200" /></div>
              <div className="px-5 py-6 text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(231,62,67,0.08)', border: '1px solid rgba(231,62,67,0.15)' }}>
                  <svg className="w-6 h-6" style={{ color: '#e73e43' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </div>
                <p className="text-[15px] font-semibold text-slate-800">Remove agent?</p>
                <p className="text-xs font-medium mt-2 leading-relaxed" style={{ color: '#8896aa' }}>
                  This will permanently remove <span className="text-slate-700 font-semibold">{agentToDelete.name}</span> from the system. This action cannot be undone.
                </p>
                {submitMessage.text && <div className="mt-3 p-2.5 rounded-xl text-xs font-medium" style={{ background: 'rgba(231,62,67,0.08)', color: '#c0373b' }}>{submitMessage.text}</div>}
                <div className="flex gap-2.5 mt-5">
                  <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600" style={{ border: '1.5px solid #e2e8f0' }}>Cancel</button>
                  <button onClick={handleDeleteAgent} disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ background: '#e73e43', boxShadow: '0 4px 14px rgba(231,62,67,0.22)' }}>
                    {isSubmitting ? 'Removing...' : 'Yes, remove'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isProfileModalOpen && (
          <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" style={{ background: 'rgba(10,15,26,0.65)', backdropFilter: 'blur(6px)' }}>
            <div className="w-full sm:max-w-md bg-white overflow-hidden sm:rounded-2xl" style={{ borderRadius: '20px 20px 0 0', boxShadow: '0 -8px 40px rgba(0,0,0,0.15)' }}>
              <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-8 h-1 rounded-full bg-slate-200" /></div>
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <p className="text-[13px] font-semibold text-slate-800">Account settings</p>
                  <p className="text-[11px] mt-0.5" style={{ color: '#8896aa' }}>Update your admin credentials</p>
                </div>
                <button onClick={() => setIsProfileModalOpen(false)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleProfileUpdate} className="px-5 py-4 space-y-3.5">
                <Msg />
                <Field label="New username" hint={`Current: ${currentAdminId}`}>
                  <input type="text" value={profileData.newEmployeeId} onChange={e => setProfileData({ ...profileData, newEmployeeId: e.target.value })} className={inputCls} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} placeholder="Leave blank to keep current" />
                </Field>
                <Field label="New password" hint="Optional">
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={profileData.newPassword} onChange={e => setProfileData({ ...profileData, newPassword: e.target.value })} className={inputCls + ' pr-10'} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} placeholder="Leave blank to keep current" />
                    <EyeBtn />
                  </div>
                </Field>
                <div className="flex gap-2.5 pt-1">
                  <button type="button" onClick={() => setIsProfileModalOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600" style={{ border: '1.5px solid #e2e8f0' }}>Cancel</button>
                  <button type="submit" disabled={isSubmitting || (!profileData.newEmployeeId && !profileData.newPassword)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ background: '#0a0f1a' }}>
                    {isSubmitting ? 'Saving...' : 'Save changes'}
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