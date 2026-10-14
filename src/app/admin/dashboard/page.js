

// "use client";
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// import DailyReportTab from '../../components/admin/DailyReportTab';
// import TerritorySetupTab from '../../components/admin/TerritorySetupTab';
// import DailySalesTab from '../../components/admin/DailySalesTab';
// import PendingApprovals from '../../components/admin/PendingApprovals';
// import EmployeeMapTab from '../../components/admin/EmployeeMapTab';
// import MonthlyMRReportTab from '../../components/admin/MonthlyMRReport';


// function Field({ label, hint, children }) {
//   return (
//     <div>
//       <div className="flex items-center justify-between mb-1.5">
//         <label className="text-[11px] font-semibold text-slate-500 tracking-wide">{label}</label>
//         {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
//       </div>
//       {children}
//     </div>
//   );
// }

// const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-800 outline-none transition-all";
// const inputStyle = { background: '#f8fafc', border: '1.5px solid #e2e8f0', fontSize: '16px' };
// const inputFocus = (e) => { e.target.style.borderColor = '#97c22a'; e.target.style.boxShadow = '0 0 0 3px rgba(151,194,42,0.1)'; };
// const inputBlur  = (e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; };

// export default function AdminDashboard() {
//   const router = useRouter();
  
//   // 🚨 FIX 1: Set default tab to 'sales' instead of 'command'
//   const [adminNav, setAdminNav] = useState('sales'); 
  
//   const [team, setTeam] = useState([]);
//   const [isLoadingTeam, setIsLoadingTeam] = useState(true);
//   const [currentAdminId, setCurrentAdminId] = useState('PL-ADMIN');

//   const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
//   const [isProfileModalOpen, setIsProfileModalOpen]   = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen]         = useState(false);
//   const [isDeleteModalOpen, setIsDeleteModalOpen]     = useState(false);

//   const [newAgentData, setNewAgentData]   = useState({ name: '', employeeId: '', password: '' });
//   const [editAgentData, setEditAgentData] = useState({ originalEmployeeId: '', name: '', employeeId: '', password: '' });
//   const [agentToDelete, setAgentToDelete] = useState(null);
//   const [profileData, setProfileData]     = useState({ newEmployeeId: '', newPassword: '' });

//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
//   const [showPassword, setShowPassword] = useState(false);

//   const [requests, setRequests] = useState([]);

//   const handleLogout = () => router.push('/');

// const fetchTeamData = async () => {
//     setIsLoadingTeam(true);
//     try {
//       const res  = await fetch('/api/admin/agents');
//       const data = await res.json();
//       if (res.ok) setTeam(data);
//     } catch (e) { console.error(e); }
//     finally { setIsLoadingTeam(false); }
//   };

//   // 🚨 THE FIX: Add this useEffect to actually run the function on page load!
//   useEffect(() => {
//     fetchTeamData();
//   }, []);


//   const resetMsg = () => setSubmitMessage({ type: '', text: '' });

//   const handleProvisionAgent = async (e) => {
//     e.preventDefault(); setIsSubmitting(true); resetMsg();
//     try {
//       const res  = await fetch('/api/admin/agents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newAgentData, role: 'AGENT' }) });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error);
//       setSubmitMessage({ type: 'success', text: 'Agent provisioned successfully.' });
//       setNewAgentData({ name: '', employeeId: '', password: '' }); setShowPassword(false);
//       fetchTeamData(); setTimeout(() => setIsProvisionModalOpen(false), 1500);
//     } catch (err) { setSubmitMessage({ type: 'error', text: err.message }); }
//     finally { setIsSubmitting(false); }
//   };

//   const handleEditAgent = async (e) => {
//     e.preventDefault(); setIsSubmitting(true); resetMsg();
//     try {
//       const res  = await fetch('/api/admin/agents', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editAgentData) });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error);
//       setSubmitMessage({ type: 'success', text: 'Agent updated.' });
//       fetchTeamData(); setTimeout(() => setIsEditModalOpen(false), 1500);
//     } catch (err) { setSubmitMessage({ type: 'error', text: err.message }); }
//     finally { setIsSubmitting(false); }
//   };

//   const handleDeleteAgent = async () => {
//     setIsSubmitting(true); resetMsg();
//     try {
//       const res  = await fetch('/api/admin/agents', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId: agentToDelete.id }) });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error);
//       fetchTeamData(); setIsDeleteModalOpen(false); setAgentToDelete(null);
//     } catch (err) { setSubmitMessage({ type: 'error', text: err.message }); }
//     finally { setIsSubmitting(false); }
//   };

//   const handleProfileUpdate = async (e) => {
//     e.preventDefault(); setIsSubmitting(true); resetMsg();
//     try {
//       const res  = await fetch('/api/admin/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentEmployeeId: currentAdminId, newEmployeeId: profileData.newEmployeeId, newPassword: profileData.newPassword }) });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error);
//       setSubmitMessage({ type: 'success', text: 'Profile updated.' });
//       if (profileData.newEmployeeId) setCurrentAdminId(profileData.newEmployeeId);
//       setProfileData({ newEmployeeId: '', newPassword: '' }); setShowPassword(false);
//       setTimeout(() => setIsProfileModalOpen(false), 1500);
//     } catch (err) { setSubmitMessage({ type: 'error', text: err.message }); }
//     finally { setIsSubmitting(false); }
//   };


//   const openEditModal = (agent) => {
//     setEditAgentData({ originalEmployeeId: agent.id, name: agent.name, employeeId: agent.id, password: '' });
//     resetMsg(); setShowPassword(false); setIsEditModalOpen(true);
//   };
//   const openDeleteModal = (agent) => { setAgentToDelete(agent); resetMsg(); setIsDeleteModalOpen(true); };

//   const totalPipeline     = team.reduce((s, a) => s + (a.pipeline || 0), 0);
//   const commissionPending = team.reduce((s, a) => s + (a.Collection|| 0), 0);
//   const violations        = team.filter(a => a.status === 'Flagged').length;

//   const kpis = [
//     { label: 'Total pipeline',      value: `₹${totalPipeline.toLocaleString('en-IN')}`,     sub: 'All active deals',     accent: '#97c22a', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
//     { label: 'Active agents',       value: team.length,                                      sub: 'Provisioned accounts', accent: '#60a5fa', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
//     { label: 'Protocol violations', value: violations,                                       sub: 'Flagged agents',       accent: '#e73e43', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
//     { label: 'Collection pending',  value: `₹${commissionPending.toLocaleString('en-IN')}`, sub: 'Awaiting disbursal',   accent: '#a78bfa', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
//   ];

//   const Msg = () => submitMessage.text ? (
//     <div className="flex items-start gap-2 p-3 rounded-xl text-xs font-medium" style={{ background: submitMessage.type === 'success' ? 'rgba(151,194,42,0.08)' : 'rgba(231,62,67,0.08)', border: `1px solid ${submitMessage.type === 'success' ? 'rgba(151,194,42,0.2)' : 'rgba(231,62,67,0.2)'}`, color: submitMessage.type === 'success' ? '#5a8a10' : '#c0373b' }}>
//       <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={submitMessage.type === 'success' ? 'M5 13l4 4L19 7' : 'M12 9v2m0 4h.01'} /></svg>
//       {submitMessage.text}
//     </div>
//   ) : null;

//   const EyeBtn = () => (
//     <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3.5 inset-y-0 flex items-center" tabIndex={-1}>
//       <svg className="w-4 h-4" style={{ color: '#94a3b8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         {showPassword
//           ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
//           : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
//         }
//       </svg>
//     </button>
//   );

//   return (
//     <div className="flex h-[100dvh] w-full overflow-hidden font-sans" style={{ background: '#f1f5f9' }}>

//       {/* DESKTOP SIDEBAR */}
//       <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 relative z-20" style={{ background: '#0a0f1a', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
//         <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
//         <div className="absolute pointer-events-none" style={{ top: '-60px', right: '-60px', width: '240px', height: '240px', background: 'radial-gradient(circle,rgba(151,194,42,0.1) 0%,transparent 70%)' }} />

//         <div className="relative z-10 px-6 py-7 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
//           <div className="flex items-center gap-2.5 mb-6">
//             <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(151,194,42,0.12)', border: '1px solid rgba(151,194,42,0.2)' }}>
//               <svg className="w-4 h-4" style={{ color: '#97c22a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
//             </div>
//             <div>
//               <p className="text-[13px] font-semibold text-white leading-none">Prosushil Lifecare</p>
//               <p className="text-[10px] font-medium mt-0.5" style={{ color: '#97c22a' }}>Admin console</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit" style={{ background: 'rgba(151,194,42,0.08)', border: '1px solid rgba(151,194,42,0.15)' }}>
//             <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#97c22a' }} />
//             <span className="text-[10px] font-medium" style={{ color: '#a3cc35' }}>System online · v2.4.0</span>
//           </div>
//         </div>

//         <nav className="relative z-10 flex-1 overflow-y-auto px-4 py-6 space-y-1">
//           {[
//             { id: 'sales', label: 'Sales performance', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
//             { id: 'territory', label: 'Territory Setup', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
//             { id: 'reports', label: 'Daily agent reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
//             { id: 'command', label: 'Agent accounts',   icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
//             { id: 'approvals', label: 'Pending approvals', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
//             { 
//   id: 'map', 
//   label: 'Live Tracker', 
//   icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' 
// },
//          { 
//   id: 'monthly-report', 
//   label: 'Monthly Report', 
//   icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' 
// }

//           ].map((n) => (
//             <button key={n.id} onClick={() => setAdminNav(n.id)} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left" style={adminNav === n.id ? { background: 'rgba(151,194,42,0.1)', border: '1px solid rgba(151,194,42,0.18)', color: '#97c22a' } : { color: '#8896aa', border: '1px solid transparent' }}>
//               <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={n.icon} /></svg>
//               <span className="text-[13px] font-medium">{n.label}</span>
//             </button>
//           ))}
//         </nav>

//         <div className="relative z-10 px-4 py-4 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
//           <button onClick={() => { resetMsg(); setIsProfileModalOpen(true); }} className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl transition-all mb-1 text-left" style={{ border: '1px solid transparent' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
//             <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0" style={{ background: 'rgba(151,194,42,0.12)', border: '1px solid rgba(151,194,42,0.2)', color: '#97c22a' }}>AD</div>
//             <div className="flex-1 min-w-0 text-left">
//               <p className="text-[13px] font-medium text-white truncate leading-none">Profile settings</p>
//               <p className="text-[10px] mt-0.5 truncate" style={{ color: '#8896aa' }}>{currentAdminId}</p>
//             </div>
//             <svg className="w-3.5 h-3.5 shrink-0" style={{ color: '#8896aa' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
//           </button>
//           <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl transition-all" style={{ border: '1px solid transparent', color: '#8896aa' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(231,62,67,0.08)'; e.currentTarget.style.color = '#e73e43'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8896aa'; }}>
//             <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
//             <span className="text-[13px] font-medium">Sign out</span>
//           </button>
//         </div>
//       </aside>

//       {/* MAIN CONTENT */}
//       <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden relative w-full">

//         <header className="hidden md:flex shrink-0 items-center justify-between px-8 lg:px-10 h-[72px] bg-white" style={{ borderBottom: '1px solid #e9edf2', boxShadow: '0 1px 0 #e9edf2' }}>
//           {/* 🚨 FIX 2: Correct Title and Subtitle rendering based on Nav State */}
//           <div>
//             <h2 className="text-lg font-semibold text-slate-800 tracking-tight">
//               {adminNav === 'command' && 'Agent Accounts'}
//               {adminNav === 'territory' && 'Territory Setup'}
//               {adminNav === 'reports' && 'Daily Field Reports'}
//               {adminNav === 'approvals' && 'Pending Device Approvals'}
//               {adminNav === 'sales' && 'Sales Performance'}

//             </h2>
//             <p className="text-xs font-medium mt-0.5" style={{ color: '#8896aa' }}>
//               {adminNav === 'command' && 'Manage field representative system access and credentials'}
//               {adminNav === 'territory' && 'Configure operational areas, places, and medical shops'}
//               {adminNav === 'reports' && 'Analyze daily salesman logs and field outcomes'}
//               {adminNav === 'approvals' && 'Review and approve new mobile device login requests'}
//               {adminNav === 'sales' && 'Track revenue, pipeline progress, and field collections'}
//             </p>
//           </div>

//           {/* Provision Agent Button */}
//           {adminNav === 'command' && (
//             <button
//               onClick={() => { resetMsg(); setIsProvisionModalOpen(true); }}
//               className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98]"
//               style={{ background: '#97c22a', boxShadow: '0 4px 14px rgba(151,194,42,0.28)' }}
//             >
//               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
//               Provision agent
//             </button>
//           )}
//         </header>

//         <header className="md:hidden flex shrink-0 items-center justify-between px-4 h-14 bg-white" style={{ borderBottom: '1px solid #e9edf2' }}>
//           <div className="flex items-center gap-2.5">
//             <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(151,194,42,0.1)' }}>
//               <svg className="w-3.5 h-3.5" style={{ color: '#97c22a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
//             </div>
//             <p className="text-[13px] font-semibold text-slate-800">Admin console</p>
//           </div>
//           <div className="flex items-center gap-2">
//             <button onClick={() => { resetMsg(); setIsProfileModalOpen(true); }} className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold" style={{ background: 'rgba(151,194,42,0.1)', color: '#5a8a10', border: '1px solid rgba(151,194,42,0.2)' }}>AD</button>
//             <button onClick={handleLogout} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
//               <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
//             </button>
//           </div>
//         </header>

//         {/* VIEW ROUTING */}
//         {adminNav === 'command' && (
//           <div className="flex-1 overflow-y-auto">
//             <div className="p-4 md:p-8 lg:p-10 space-y-5 md:space-y-7 pb-24 md:pb-10 max-w-7xl mx-auto w-full">

//               {requests.length > 0 && (
//                 <div className="bg-red-50 border border-red-200 p-5 rounded-2xl mb-6 shadow-sm">
//                   <h3 className="text-red-700 font-bold text-lg mb-4 flex items-center gap-2">
//                     🚨 Pending Device Approvals
//                   </h3>
//                   <div className="space-y-3">
//                     {requests.map((req) => (
//                       <div key={req.employeeId} className="bg-white p-4 rounded-xl shadow-sm border border-red-100 flex justify-between items-center">
//                         <div>
//                           <p className="font-bold text-slate-800">{req.name} <span className="text-slate-400 text-sm font-normal">({req.employeeId})</span></p>
//                           <div className="text-[11px] font-medium text-slate-500 mt-1">
//                             <p>Old Device: <span className="text-slate-700">{req.deviceEnv || 'None'}</span></p>
//                             <p className="text-red-500">New Device: <span className="text-red-700 font-bold">{req.pendingDeviceEnv}</span></p>
//                           </div>
//                         </div>
//                         <button 
//                           onClick={() => handleApprove(req.employeeId)}
//                           className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
//                         >
//                           Approve New Phone
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
//                 {kpis.map((k) => (
//                   <div key={k.label} className="relative overflow-hidden p-4 md:p-6 rounded-2xl bg-white" style={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
//                     <div className="flex items-start justify-between mb-3 md:mb-4">
//                       <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center" style={{ background: `${k.accent}14` }}>
//                         <svg className="w-4 h-4 md:w-4.5 md:h-4.5" style={{ color: k.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={k.icon} /></svg>
//                       </div>
//                       <span className="w-1.5 h-1.5 rounded-full mt-1" style={{ background: k.accent }} />
//                     </div>
//                     <p className="text-[10px] md:text-[11px] font-semibold tracking-wide mb-1" style={{ color: '#8896aa' }}>{k.label}</p>
//                     <p className="text-lg md:text-2xl font-semibold text-slate-800 tracking-tight leading-none">{k.value}</p>
//                     <p className="text-[10px] font-medium mt-1" style={{ color: '#b0bac8' }}>{k.sub}</p>
//                     <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl" style={{ background: `${k.accent}40` }} />
//                   </div>
//                 ))}
//               </div>

//               <div className="flex items-center justify-between">
//                 <div>
//                   <h3 className="text-[13px] md:text-base font-semibold text-slate-800">Field representative accounts</h3>
//                 </div>
//                 <button onClick={() => { resetMsg(); setIsProvisionModalOpen(true); }} className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold" style={{ background: 'rgba(151,194,42,0.1)', color: '#5a8a10', border: '1px solid rgba(151,194,42,0.2)' }}>
//                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
//                   Add agent
//                 </button>
//               </div>

//               {/* ── DESKTOP TABLE ─────────────────────── */}
//               <div className="hidden md:block rounded-2xl overflow-hidden bg-white" style={{ border: '1px solid #e9edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
//                 {isLoadingTeam ? (
//                   <div className="flex items-center justify-center py-16 gap-3">
//                     <span className="text-sm text-slate-400">Loading agents...</span>
//                   </div>
//                 ) : (
//                   <table className="w-full text-left border-collapse">
//                     <thead>
//                       <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e9edf2' }}>
//                         {['Agent ID', 'Name', 'Target location', 'Status', 'Actions'].map((h, i) => (
//                           <th key={h} className="px-5 py-3.5 text-[11px] font-semibold tracking-wide" style={{ color: '#8896aa', textAlign: i >= 3 ? 'center' : 'left' }}>{h}</th>
//                         ))}
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {team.length === 0 ? (
//                         <tr><td colSpan="5" className="py-14 text-center text-sm" style={{ color: '#8896aa' }}>No agents provisioned yet.</td></tr>
//                       ) : team.map((agent, i) => (
//                         <tr key={agent.id} style={{ borderTop: i > 0 ? '1px solid #f1f5f9' : 'none' }}>
//                           <td className="px-5 py-4 font-mono text-[12px]" style={{ color: '#8896aa' }}>{agent.id}</td>
//                           <td className="px-5 py-4">
//                             <div className="flex items-center gap-2.5">
//                               <span className="text-sm font-medium text-slate-700">{agent.name}</span>
//                             </div>
//                           </td>
//                           <td className="px-5 py-4 text-sm max-w-[200px] truncate" style={{ color: '#8896aa' }}>{agent.target || '—'}</td>
//                           <td className="px-5 py-4 text-center">
//                             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold" style={agent.status === 'Flagged' ? { background: 'rgba(231,62,67,0.08)', color: '#c0373b' } : { background: 'rgba(151,194,42,0.08)', color: '#5a8a10' }}>
//                               {agent.status || 'Active'}
//                             </span>
//                           </td>
//                           <td className="px-5 py-4">
//                             <div className="flex items-center justify-center gap-2">
//                               <button onClick={() => openEditModal(agent)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all" style={{ color: '#94a3b8' }} title="Edit">
//                                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
//                               </button>
//                               <button onClick={() => openDeleteModal(agent)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all" style={{ color: '#94a3b8' }} title="Delete">
//                                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
//                               </button>
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 )}
//               </div>

//               <div className="md:hidden space-y-2.5">
//                 {isLoadingTeam ? (
//                   <div className="text-center py-10 text-xs text-slate-400">Loading...</div>
//                 ) : team.map((agent) => (
//                   <div key={agent.id} className="rounded-2xl p-4 bg-white" style={{ border: '1px solid #e9edf2' }}>
//                     <div className="flex items-center justify-between mb-3">
//                       <div className="flex items-center gap-2.5">
//                         <div>
//                           <p className="text-[13px] font-semibold text-slate-800 leading-none">{agent.name}</p>
//                           <p className="text-[10px] font-mono mt-0.5" style={{ color: '#8896aa' }}>{agent.id}</p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-1.5">
//                         <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold" style={agent.status === 'Flagged' ? { background: 'rgba(231,62,67,0.08)', color: '#c0373b' } : { background: 'rgba(151,194,42,0.08)', color: '#5a8a10' }}>
//                           <span className="w-1 h-1 rounded-full" style={{ background: agent.status === 'Flagged' ? '#e73e43' : '#97c22a' }} />
//                           {agent.status || 'Active'}
//                         </span>
//                       </div>
//                     </div>
//                     <div className="flex gap-2">
//                       <button onClick={() => openEditModal(agent)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold" style={{ background: '#eff6ff', color: '#3b82f6', border: '1px solid #dbeafe' }}>Edit</button>
//                       <button onClick={() => openDeleteModal(agent)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold" style={{ background: 'rgba(231,62,67,0.07)', color: '#c0373b', border: '1px solid rgba(231,62,67,0.15)' }}>Remove</button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* COMPONENT ROUTING */}
//         {adminNav === 'sales' && <DailySalesTab />}
//         {adminNav === 'reports' && <DailyReportTab team={team} />}
//         {adminNav === 'territory' && <TerritorySetupTab />}
//         {adminNav === 'approvals' && <PendingApprovals />}
//         {adminNav === 'map' && <EmployeeMapTab/>}
//         {adminNav === 'monthly-report' && <MonthlyMRReportTab />}

//         {/* BOTTOM NAV FOR MOBILE */}
//         <nav className="md:hidden absolute bottom-0 left-0 right-0 z-40 bg-white" style={{ borderTop: '1px solid #e9edf2', paddingBottom: 'env(safe-area-inset-bottom)' }}>
//           <div className="flex items-center justify-around px-2 h-14">
//             {[
//               { id: 'sales', label: 'Sales', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' }, 
//               { id: 'territory', label: 'Territory', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
//               { id: 'reports', label: 'Reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
//               { id: 'command', label: 'Agents', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z' },
//               { id: 'approvals', label: 'Approvals', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
//               { id: 'monthly-report', label: 'Monthly Report', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-２a２　２　０　０１－２　２ｈ－２a２　２　０　０１－２　２V６z' },
//               { id: 'map' , label: 'map',icon: 'M3.055 11H5a₂　₂　₀　₀₁₂　₂v₁a₂　₂　₀　₀₀₂　₂　₂　₂　₀　₀₁₂　₂v₂.₉₄₅M8　₃.₉₃₅V5.5A₂.5　₂.5　₀　₀₀₁₀.5　₈h.5a₂　₂　₀　₀₁₂　₂　₂　₂　₀　₁₀₄　₀ ₂ ₀ ₁₂－₂h1.０６４M15　２０.４８８V18a₂　₂　₀　₀₁₂－₂h3.０６４M twenty-one　　 twelve　　 a nine　　 nine　　 zero　　 one　　 eighteen　　 zero　　 nine　　 nine　　 zero　　 zero　　 z' }
           
//             ].map((n) => (
//               <button key={n.id} onClick={() => setAdminNav(n.id)} className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all">
//                 <svg className="w-5 h-5" style={{ color: adminNav === n.id ? '#97c22a' : '#94a3b8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={adminNav === n.id ? '2' : '1.5'} d={n.icon} />
//                 </svg>
//                 <span className="text-[9px] font-semibold" style={{ color: adminNav === n.id ? '#97c22a' : '#94a3b8' }}>{n.label}</span>
//               </button>
//             ))}
//           </div>
//         </nav>

//         {/* MODALS */}
//         {isProvisionModalOpen && (
//           <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" style={{ background: 'rgba(10,15,26,0.65)', backdropFilter: 'blur(6px)' }}>
//             <div className="w-full sm:max-w-md bg-white overflow-hidden sm:rounded-2xl" style={{ borderRadius: '20px 20px 0 0', boxShadow: '0 -8px 40px rgba(0,0,0,0.15)' }}>
//               <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-8 h-1 rounded-full bg-slate-200" /></div>
//               <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
//                 <div>
//                   <p className="text-[13px] font-semibold text-slate-800">Provision new agent</p>
//                   <p className="text-[11px] mt-0.5" style={{ color: '#8896aa' }}>Create a field representative account</p>
//                 </div>
//                 <button onClick={() => setIsProvisionModalOpen(false)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
//                   <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
//                 </button>
//               </div>
//               <form onSubmit={handleProvisionAgent} className="px-5 py-4 space-y-3.5">
//                 <Msg />
//                 <Field label="Full name">
//                   <input type="text" required value={newAgentData.name} onChange={e => setNewAgentData({ ...newAgentData, name: e.target.value })} className={inputCls} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} placeholder="e.g. Rahul Sharma" />
//                 </Field>
//                 <Field label="Employee ID" hint="Used as login username">
//                   <input type="text" required value={newAgentData.employeeId} onChange={e => setNewAgentData({ ...newAgentData, employeeId: e.target.value })} className={inputCls} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} placeholder="e.g. PL-1043" />
//                 </Field>
//                 <Field label="Temporary password">
//                   <div className="relative">
//                     <input type={showPassword ? 'text' : 'password'} required value={newAgentData.password} onChange={e => setNewAgentData({ ...newAgentData, password: e.target.value })} className={inputCls + ' pr-10'} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} placeholder="Min. 8 characters" />
//                     <EyeBtn />
//                   </div>
//                 </Field>
//                 <div className="flex gap-2.5 pt-1">
//                   <button type="button" onClick={() => setIsProvisionModalOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 transition-all" style={{ border: '1.5px solid #e2e8f0' }}>Cancel</button>
//                   <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ background: '#97c22a', boxShadow: '0 4px 14px rgba(151,194,42,0.25)' }}>
//                     {isSubmitting ? 'Creating...' : 'Create account'}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//         {isEditModalOpen && (
//           <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" style={{ background: 'rgba(10,15,26,0.65)', backdropFilter: 'blur(6px)' }}>
//             <div className="w-full sm:max-w-md bg-white overflow-hidden sm:rounded-2xl" style={{ borderRadius: '20px 20px 0 0', boxShadow: '0 -8px 40px rgba(0,0,0,0.15)' }}>
//               <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-8 h-1 rounded-full bg-slate-200" /></div>
//               <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
//                 <div>
//                   <p className="text-[13px] font-semibold text-slate-800">Edit agent</p>
//                   <p className="text-[10px] font-mono mt-0.5" style={{ color: '#8896aa' }}>{editAgentData.originalEmployeeId}</p>
//                 </div>
//                 <button onClick={() => setIsEditModalOpen(false)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
//                   <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
//                 </button>
//               </div>
//               <form onSubmit={handleEditAgent} className="px-5 py-4 space-y-3.5">
//                 <Msg />
//                 <Field label="Full name">
//                   <input type="text" required value={editAgentData.name} onChange={e => setEditAgentData({ ...editAgentData, name: e.target.value })} className={inputCls} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
//                 </Field>
//                 <Field label="Employee ID">
//                   <input type="text" required value={editAgentData.employeeId} onChange={e => setEditAgentData({ ...editAgentData, employeeId: e.target.value })} className={inputCls} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
//                 </Field>
//                 <Field label="New password" hint="Optional">
//                   <div className="relative">
//                     <input type={showPassword ? 'text' : 'password'} value={editAgentData.password} onChange={e => setEditAgentData({ ...editAgentData, password: e.target.value })} className={inputCls + ' pr-10'} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} placeholder="Leave blank to keep current" />
//                     <EyeBtn />
//                   </div>
//                 </Field>
//                 <div className="flex gap-2.5 pt-1">
//                   <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600" style={{ border: '1.5px solid #e2e8f0' }}>Cancel</button>
//                   <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ background: '#3b82f6', boxShadow: '0 4px 14px rgba(59,130,246,0.22)' }}>
//                     {isSubmitting ? 'Saving...' : 'Save changes'}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//         {isDeleteModalOpen && agentToDelete && (
//           <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" style={{ background: 'rgba(10,15,26,0.65)', backdropFilter: 'blur(6px)' }}>
//             <div className="w-full sm:max-w-sm bg-white overflow-hidden sm:rounded-2xl" style={{ borderRadius: '20px 20px 0 0', boxShadow: '0 -8px 40px rgba(0,0,0,0.15)' }}>
//               <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-8 h-1 rounded-full bg-slate-200" /></div>
//               <div className="px-5 py-6 text-center">
//                 <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(231,62,67,0.08)', border: '1px solid rgba(231,62,67,0.15)' }}>
//                   <svg className="w-6 h-6" style={{ color: '#e73e43' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
//                 </div>
//                 <p className="text-[15px] font-semibold text-slate-800">Remove agent?</p>
//                 <p className="text-xs font-medium mt-2 leading-relaxed" style={{ color: '#8896aa' }}>
//                   This will permanently remove <span className="text-slate-700 font-semibold">{agentToDelete.name}</span> from the system. This action cannot be undone.
//                 </p>
//                 {submitMessage.text && <div className="mt-3 p-2.5 rounded-xl text-xs font-medium" style={{ background: 'rgba(231,62,67,0.08)', color: '#c0373b' }}>{submitMessage.text}</div>}
//                 <div className="flex gap-2.5 mt-5">
//                   <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600" style={{ border: '1.5px solid #e2e8f0' }}>Cancel</button>
//                   <button onClick={handleDeleteAgent} disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ background: '#e73e43', boxShadow: '0 4px 14px rgba(231,62,67,0.22)' }}>
//                     {isSubmitting ? 'Removing...' : 'Yes, remove'}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {isProfileModalOpen && (
//           <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" style={{ background: 'rgba(10,15,26,0.65)', backdropFilter: 'blur(6px)' }}>
//             <div className="w-full sm:max-w-md bg-white overflow-hidden sm:rounded-2xl" style={{ borderRadius: '20px 20px 0 0', boxShadow: '0 -8px 40px rgba(0,0,0,0.15)' }}>
//               <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-8 h-1 rounded-full bg-slate-200" /></div>
//               <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
//                 <div>
//                   <p className="text-[13px] font-semibold text-slate-800">Account settings</p>
//                   <p className="text-[11px] mt-0.5" style={{ color: '#8896aa' }}>Update your admin credentials</p>
//                 </div>
//                 <button onClick={() => setIsProfileModalOpen(false)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
//                   <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
//                 </button>
//               </div>
//               <form onSubmit={handleProfileUpdate} className="px-5 py-4 space-y-3.5">
//                 <Msg />
//                 <Field label="New username" hint={`Current: ${currentAdminId}`}>
//                   <input type="text" value={profileData.newEmployeeId} onChange={e => setProfileData({ ...profileData, newEmployeeId: e.target.value })} className={inputCls} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} placeholder="Leave blank to keep current" />
//                 </Field>
//                 <Field label="New password" hint="Optional">
//                   <div className="relative">
//                     <input type={showPassword ? 'text' : 'password'} value={profileData.newPassword} onChange={e => setProfileData({ ...profileData, newPassword: e.target.value })} className={inputCls + ' pr-10'} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} placeholder="Leave blank to keep current" />
//                     <EyeBtn />
//                   </div>
//                 </Field>
//                 <div className="flex gap-2.5 pt-1">
//                   <button type="button" onClick={() => setIsProfileModalOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600" style={{ border: '1.5px solid #e2e8f0' }}>Cancel</button>
//                   <button type="submit" disabled={isSubmitting || (!profileData.newEmployeeId && !profileData.newPassword)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ background: '#0a0f1a' }}>
//                     {isSubmitting ? 'Saving...' : 'Save changes'}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//       </main>
//     </div>
//   );
// }





"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DailyReportTab from "../../components/admin/DailyReportTab";
import TerritorySetupTab from "../../components/admin/TerritorySetupTab";
import DailySalesTab from "../../components/admin/DailySalesTab";
import PendingApprovals from "../../components/admin/PendingApprovals";
import EmployeeMapTab from "../../components/admin/EmployeeMapTab";
import MonthlyMRReportTab from "../../components/admin/MonthlyMRReport";
import CollectionStatements from "../../components/admin/CollectionStatements";

/* -------------------------------------------------------
   NAVIGATION
------------------------------------------------------- */

const EmployeeVisitChartTab = dynamic(
  () => import("../../components/admin/employee-visit-chart"),
  {
    ssr: false,
    loading: () => (
      <div className="p-6 text-center text-sm text-slate-500">
        Loading attendance chart...
      </div>
    ),
  }
);

const NAV_ITEMS = [
  {
    id: "sales",
    label: "Sales Performance",
    mobileLabel: "Sales",
    icon: "M3 17l6-6 4 4 8-9 M15 6h6v6",
  },
  {
    id: "territory",
    label: "Territory Setup",
    mobileLabel: "Territory",
    icon: "M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z M12 10a2 2 0 100-4 2 2 0 000 4z",
  },
  {
    id: "reports",
    label: "Daily Agent Reports",
    mobileLabel: "Reports",
    icon: "M4 19V5m0 14h16M8 15v-4m4 4V7m4 8V9",
  },
  {
    id: "command",
    label: "Agent Accounts",
    mobileLabel: "Agents",
    icon: "M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2m6-10a4 4 0 100-8 4 4 0 000 8zm6-3a4 4 0 010 8m2 2h4v-2a4 4 0 00-3-3.87",
  },
  {
    id: "approvals",
    label: "Pending Approvals",
    mobileLabel: "Approvals",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    id: "map",
    label: "Live Tracker",
    mobileLabel: "Live Map",
    icon: "M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6zm6-3v15m6-12v15",
  },
  {
    id: "monthly-report",
    label: "Monthly Report",
    mobileLabel: "Monthly",
    icon: "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 012 2v14H3V6a2 2 0 012-2z",
  },
  {
    id: "collections",
    label: "Collection Statements",
    mobileLabel: "Collections",
    icon: "M3 5h18v14H3z M3 10h18m-14 5h4",
  },
  {
  id: "attendance",
  label: "Employee Attendance",
  mobileLabel: "Attendance",
  icon: "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 012 2v14H3V6a2 2 0 012-2z",
},
];

const PAGE_META = {
  sales: {
    title: "Sales Performance",
    subtitle: "Track revenue, pipeline progress, and field collections.",
  },
  territory: {
    title: "Territory Setup",
    subtitle: "Configure operational areas, places, and medical shops.",
  },
  reports: {
    title: "Daily Field Reports",
    subtitle: "Analyze daily salesman logs and field outcomes.",
  },
  command: {
    title: "Agent Accounts",
    subtitle: "Manage field representative accounts and credentials.",
  },
  approvals: {
    title: "Pending Device Approvals",
    subtitle: "Review and approve mobile device login requests.",
  },
  map: {
    title: "Live Tracker",
    subtitle: "View employee visit locations and route activity.",
  },
  "monthly-report": {
    title: "Monthly Report",
    subtitle: "Review monthly salesman visits, deals, and performance.",
  },
  collections: {
    title: "Collection Statements",
    subtitle: "Review cash collections by salesman and visit date.",
  },
  attendance: {
  title: "Employee Attendance",
  subtitle:
    "Review monthly employee visit counts, zero-visit days, and Sundays.",
},
};

/* -------------------------------------------------------
   SHARED UI COMPONENTS
------------------------------------------------------- */

function Icon({ path, className = "h-5 w-5", strokeWidth = 1.7 }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label className="text-[11px] font-semibold tracking-wide text-slate-500">
          {label}
        </label>
        {hint && (
          <span className="text-[10px] text-slate-400">{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function Notice({ type = "error", children }) {
  const styles =
    type === "success"
      ? "border-[#97c22a]/30 bg-[#97c22a]/10 text-[#5a8a10]"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`flex items-start gap-2 rounded-xl border p-3 text-xs font-medium ${styles}`}
    >
      <Icon
        className="mt-0.5 h-4 w-4 shrink-0"
        path={
          type === "success"
            ? "M5 13l4 4L19 7"
            : "M12 9v3m0 4h.01M10.3 3.9L1.8 18.1A2 2 0 003.5 21h17a2 2 0 001.7-2.9L13.7 3.9a2 2 0 00-3.4 0z"
        }
      />
      <span>{children}</span>
    </div>
  );
}

function getAgentId(agent) {
  return String(agent?.employeeId || agent?.id || "");
}

function getErrorMessage(data, fallback) {
  return data?.error || data?.message || fallback;
}

async function readResponse(response) {
  return response.json().catch(() => ({}));
}

const INPUT_CLASS =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-base font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#97c22a] focus:ring-2 focus:ring-[#97c22a]/15";

const BUTTON_SECONDARY =
  "rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50";

/* -------------------------------------------------------
   PAGE
------------------------------------------------------- */

export default function AdminDashboard() {
  const router = useRouter();

  const [adminNav, setAdminNav] = useState("sales");

  const [team, setTeam] = useState([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(true);
  const [teamError, setTeamError] = useState("");

  const [currentAdminId, setCurrentAdminId] = useState("PL-ADMIN");

  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [newAgentData, setNewAgentData] = useState({
    name: "",
    employeeId: "",
    password: "",
  });

  const [editAgentData, setEditAgentData] = useState({
    originalEmployeeId: "",
    name: "",
    employeeId: "",
    password: "",
  });

  const [agentToDelete, setAgentToDelete] = useState(null);

  const [profileData, setProfileData] = useState({
    newEmployeeId: "",
    newPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({
    type: "",
    text: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const resetMsg = useCallback(() => {
    setSubmitMessage({ type: "", text: "" });
  }, []);

  /* -------------------------------------------------------
     FETCH AGENTS
  ------------------------------------------------------- */

  const fetchTeamData = useCallback(async () => {
    setIsLoadingTeam(true);
    setTeamError("");

    try {
      const response = await fetch("/api/admin/agents", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Unable to load agent accounts.")
        );
      }

      // Supports APIs returning either an array or { agents: [] }.
      const agents = Array.isArray(data)
        ? data
        : Array.isArray(data.agents)
          ? data.agents
          : [];

      setTeam(agents);
    } catch (error) {
      console.error("Admin agents fetch failed:", error);
      setTeamError(error.message || "Unable to load agent accounts.");
    } finally {
      setIsLoadingTeam(false);
    }
  }, []);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  /* -------------------------------------------------------
     PROVISION AGENT
  ------------------------------------------------------- */

  const handleProvisionAgent = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);
    resetMsg();

    try {
      const response = await fetch("/api/admin/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          ...newAgentData,
          role: "AGENT",
        }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Unable to create the agent.")
        );
      }

      setSubmitMessage({
        type: "success",
        text: "Agent provisioned successfully.",
      });

      setNewAgentData({
        name: "",
        employeeId: "",
        password: "",
      });
      setShowPassword(false);

      await fetchTeamData();

      window.setTimeout(() => {
        setIsProvisionModalOpen(false);
        resetMsg();
      }, 1000);
    } catch (error) {
      setSubmitMessage({
        type: "error",
        text: error.message || "Unable to create the agent.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* -------------------------------------------------------
     EDIT AGENT
  ------------------------------------------------------- */

  const openEditModal = (agent) => {
    const id = getAgentId(agent);

    setEditAgentData({
      originalEmployeeId: id,
      name: agent.name || "",
      employeeId: id,
      password: "",
    });

    setShowPassword(false);
    resetMsg();
    setIsEditModalOpen(true);
  };

  const handleEditAgent = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);
    resetMsg();

    try {
      const response = await fetch("/api/admin/agents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(editAgentData),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Unable to update the agent.")
        );
      }

      setSubmitMessage({
        type: "success",
        text: "Agent updated successfully.",
      });

      await fetchTeamData();

      window.setTimeout(() => {
        setIsEditModalOpen(false);
        resetMsg();
      }, 1000);
    } catch (error) {
      setSubmitMessage({
        type: "error",
        text: error.message || "Unable to update the agent.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* -------------------------------------------------------
     DELETE AGENT
  ------------------------------------------------------- */

  const openDeleteModal = (agent) => {
    setAgentToDelete(agent);
    resetMsg();
    setIsDeleteModalOpen(true);
  };

  const handleDeleteAgent = async () => {
    if (!agentToDelete) return;

    setIsSubmitting(true);
    resetMsg();

    try {
      const response = await fetch("/api/admin/agents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          employeeId: getAgentId(agentToDelete),
        }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Unable to remove the agent.")
        );
      }

      setSubmitMessage({
        type: "success",
        text: "Agent removed successfully.",
      });

      await fetchTeamData();

      setAgentToDelete(null);
      setIsDeleteModalOpen(false);
      resetMsg();
    } catch (error) {
      setSubmitMessage({
        type: "error",
        text: error.message || "Unable to remove the agent.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* -------------------------------------------------------
     UPDATE ADMIN PROFILE
  ------------------------------------------------------- */

  const handleProfileUpdate = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);
    resetMsg();

    try {
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          currentEmployeeId: currentAdminId,
          newEmployeeId: profileData.newEmployeeId,
          newPassword: profileData.newPassword,
        }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Unable to update admin profile.")
        );
      }

      setSubmitMessage({
        type: "success",
        text: "Admin profile updated successfully.",
      });

      if (profileData.newEmployeeId) {
        setCurrentAdminId(profileData.newEmployeeId);
      }

      setProfileData({
        newEmployeeId: "",
        newPassword: "",
      });
      setShowPassword(false);

      window.setTimeout(() => {
        setIsProfileModalOpen(false);
        resetMsg();
      }, 1000);
    } catch (error) {
      setSubmitMessage({
        type: "error",
        text: error.message || "Unable to update admin profile.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* -------------------------------------------------------
     NAVIGATION / LOGOUT
  ------------------------------------------------------- */

  const handleLogout = () => {
    // Preserves the existing logout navigation behavior.
    router.push("/");
  };

  const navigateTo = (id) => {
    setAdminNav(id);
    setMobileNavOpen(false);
  };

  /* -------------------------------------------------------
     SUMMARY STATS
  ------------------------------------------------------- */

  const totalPipeline = team.reduce(
    (sum, agent) => sum + (Number(agent.pipeline) || 0),
    0
  );

  const commissionPending = team.reduce(
    (sum, agent) => sum + (Number(agent.Collection) || 0),
    0
  );

  const violations = team.filter(
    (agent) => agent.status === "Flagged"
  ).length;

  const kpis = [
    {
      label: "Total pipeline",
      value: `₹${totalPipeline.toLocaleString("en-IN")}`,
      sub: "All active deals",
      accent: "#97c22a",
      icon: "M3 17l6-6 4 4 8-9 M15 6h6v6",
    },
    {
      label: "Active agents",
      value: team.length,
      sub: "Provisioned accounts",
      accent: "#60a5fa",
      icon: "M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2m6-10a4 4 0 100-8 4 4 0 000 8zm6-3a4 4 0 010 8m2 2h4v-2a4 4 0 00-3-3.87",
    },
    {
      label: "Protocol violations",
      value: violations,
      sub: "Flagged agents",
      accent: "#e73e43",
      icon: "M12 9v3m0 4h.01M10.3 3.9L1.8 18.1A2 2 0 003.5 21h17a2 2 0 001.7-2.9L13.7 3.9a2 2 0 00-3.4 0z",
    },
    {
      label: "Collection pending",
      value: `₹${commissionPending.toLocaleString("en-IN")}`,
      sub: "Awaiting disbursal",
      accent: "#a78bfa",
      icon: "M12 2v20m5-15H9.5a3.5 3.5 0 000 7H14a3.5 3.5 0 010 7H6",
    },
  ];

  const pageMeta = PAGE_META[adminNav] || PAGE_META.sales;

  /* -------------------------------------------------------
     REUSABLE INPUT AND MESSAGE ELEMENTS
  ------------------------------------------------------- */

  const Message = () =>
    submitMessage.text ? (
      <Notice type={submitMessage.type}>
        {submitMessage.text}
      </Notice>
    ) : null;

  const PasswordToggle = () => (
    <button
      type="button"
      aria-label={showPassword ? "Hide password" : "Show password"}
      onClick={() => setShowPassword((previous) => !previous)}
      className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-700"
    >
      {showPassword ? (
        <Icon
          className="h-4 w-4"
          path="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.2A10.7 10.7 0 0112 5c4.5 0 8.3 2.9 9.5 7a10.6 10.6 0 01-3.1 4.5M6.2 6.2A10.3 10.3 0 002.5 12a10.2 10.2 0 003.7 5.1A10.3 10.3 0 0012 19"
        />
      ) : (
        <Icon
          className="h-4 w-4"
          path="M2.5 12s3.4-7 9.5-7 9.5 7 9.5 7-3.4 7-9.5 7-9.5-7-9.5-7zm9.5 3a3 3 0 100-6 3 3 0 000 6z"
        />
      )}
    </button>
  );

  /* -------------------------------------------------------
     AGENT ACCOUNTS VIEW
  ------------------------------------------------------- */

  const AgentAccountsView = () => (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-3 pb-8 sm:p-5 md:space-y-7 md:p-8 lg:p-10">
      {teamError && (
        <Notice type="error">{teamError}</Notice>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
        {kpis.map((item) => (
          <div
            key={item.label}
            className="relative min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6"
          >
            <div className="mb-3 flex items-start justify-between md:mb-4">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: `${item.accent}14` }}
              >
                <Icon
                  className="h-4 w-4"
                  path={item.icon}
                />
              </div>

              <span
                className="mt-1.5 h-2 w-2 rounded-full"
                style={{ background: item.accent }}
              />
            </div>

            <p className="mb-1 text-[10px] font-semibold tracking-wide text-slate-500 md:text-[11px]">
              {item.label}
            </p>

            <p className="break-words text-lg font-bold leading-tight text-slate-900 sm:text-xl md:text-2xl">
              {item.value}
            </p>

            <p className="mt-2 text-[10px] text-slate-400">
              {item.sub}
            </p>

            <div
              className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{ background: `${item.accent}50` }}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Field Representative Accounts
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Manage your field representatives and account access.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetMsg();
            setNewAgentData({
              name: "",
              employeeId: "",
              password: "",
            });
            setShowPassword(false);
            setIsProvisionModalOpen(true);
          }}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#97c22a] px-4 py-2.5 text-sm font-bold text-[#17200a] shadow-sm transition hover:bg-[#a8d73b]"
        >
          <Icon
            className="h-4 w-4"
            path="M12 5v14M5 12h14"
            strokeWidth={2}
          />
          Provision Agent
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        {isLoadingTeam ? (
          <div className="py-16 text-center text-sm text-slate-400">
            Loading agents...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  {[
                    "Agent ID",
                    "Name",
                    "Target location",
                    "Status",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-5 py-4 text-xs font-semibold text-slate-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {team.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-14 text-center text-sm text-slate-500"
                    >
                      No agents provisioned yet.
                    </td>
                  </tr>
                ) : (
                  team.map((agent) => (
                    <tr
                      key={getAgentId(agent)}
                      className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-4 font-mono text-xs text-slate-500">
                        {getAgentId(agent)}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                        {agent.name || "Unnamed agent"}
                      </td>

                      <td className="max-w-[220px] truncate px-5 py-4 text-sm text-slate-500">
                        {agent.target || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            agent.status === "Flagged"
                              ? "bg-red-50 text-red-700"
                              : "bg-[#97c22a]/10 text-[#5a8a10]"
                          }`}
                        >
                          {agent.status || "Active"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(agent)}
                            className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => openDeleteModal(agent)}
                            className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile agent cards */}
      <div className="space-y-3 md:hidden">
        {isLoadingTeam ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-10 text-center text-sm text-slate-400">
            Loading agents...
          </div>
        ) : team.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-7 text-center text-sm text-slate-500">
            No agents provisioned yet.
          </div>
        ) : (
          team.map((agent) => (
            <div
              key={getAgentId(agent)}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words text-sm font-bold text-slate-900">
                    {agent.name || "Unnamed agent"}
                  </p>

                  <p className="mt-1 break-all font-mono text-xs text-slate-400">
                    {getAgentId(agent)}
                  </p>

                  {agent.target && (
                    <p className="mt-2 break-words text-xs text-slate-500">
                      {agent.target}
                    </p>
                  )}
                </div>

                <span
                  className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${
                    agent.status === "Flagged"
                      ? "bg-red-50 text-red-700"
                      : "bg-[#97c22a]/10 text-[#5a8a10]"
                  }`}
                >
                  {agent.status || "Active"}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(agent)}
                  className="min-h-[42px] rounded-xl border border-blue-100 bg-blue-50 text-sm font-semibold text-blue-700"
                >
                  Edit Agent
                </button>

                <button
                  type="button"
                  onClick={() => openDeleteModal(agent)}
                  className="min-h-[42px] rounded-xl border border-red-100 bg-red-50 text-sm font-semibold text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  /* -------------------------------------------------------
     MODAL SHARED STYLES
  ------------------------------------------------------- */

  const Modal = ({ title, subtitle, onClose, children, maxWidth = "max-w-md" }) => (
    <div
      className="absolute inset-0 z-[60] flex items-end justify-center overflow-y-auto bg-[#0a0f1a]/65 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`max-h-[94dvh] w-full ${maxWidth} overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl`}
      >
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="h-1 w-9 rounded-full bg-slate-200" />
        </div>

        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-900">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-xs text-slate-500">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            <Icon path="M6 6l12 12M18 6L6 18" />
          </button>
        </div>

        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );

  /* -------------------------------------------------------
     MAIN RENDER
  ------------------------------------------------------- */

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-slate-100 font-sans">
      {/* DESKTOP SIDEBAR */}
      <aside className="relative z-20 hidden w-64 shrink-0 flex-col border-r border-white/5 bg-[#0a0f1a] lg:flex xl:w-72">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 shrink-0 border-b border-white/5 px-5 py-7 xl:px-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#97c22a]/20 bg-[#97c22a]/10 text-[#97c22a]">
              <Icon
                className="h-5 w-5"
                path="M9 12l2 2 4-4m5.6-4A12 12 0 0112 3a12 12 0 01-8.6 3A12 12 0 003 9c0 5.6 3.8 10.3 9 11.6 5.2-1.3 9-6 9-11.6 0-1-.1-2-.4-3z"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">
                ProSushil Lifecare
              </p>
              <p className="mt-1 text-xs font-medium text-[#97c22a]">
                Admin console
              </p>
            </div>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-[#97c22a]/20 bg-[#97c22a]/10 px-3 py-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#97c22a]" />
            <span className="text-[10px] font-semibold text-[#b8de5e]">
              Admin workspace
            </span>
          </div>
        </div>

        <nav className="relative z-10 flex-1 space-y-1 overflow-y-auto px-3 py-5 xl:px-4">
          {NAV_ITEMS.map((item) => {
            const active = adminNav === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateTo(item.id)}
                aria-current={active ? "page" : undefined}
                className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition ${
                  active
                    ? "border-[#97c22a]/20 bg-[#97c22a]/10 text-[#a9d938]"
                    : "border-transparent text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon
                  className="h-[18px] w-[18px] shrink-0"
                  path={item.icon}
                />
                <span className="min-w-0 text-[13px] font-medium">
                  {item.label}
                </span>

                {active && (
                  <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#97c22a]" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="relative z-10 shrink-0 space-y-1 border-t border-white/5 px-3 py-4 xl:px-4">
          <button
            type="button"
            onClick={() => {
              resetMsg();
              setShowPassword(false);
              setIsProfileModalOpen(true);
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#97c22a]/20 bg-[#97c22a]/10 text-xs font-bold text-[#a9d938]">
              AD
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-white">
                Profile settings
              </span>
              <span className="mt-1 block truncate text-[10px] text-slate-400">
                {currentAdminId}
              </span>
            </span>

            <Icon
              className="h-4 w-4 shrink-0"
              path="M9 5l7 7-7 7"
            />
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
          >
            <Icon
              className="h-5 w-5"
              path="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
            <span className="text-sm font-medium">Sign out</span>
          </button>
        </div>
      </aside>

      {/* MAIN PANEL */}
      <main className="relative flex h-[100dvh] min-w-0 flex-1 flex-col overflow-hidden">
        {/* DESKTOP HEADER */}
        <header className="hidden h-[72px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 lg:flex xl:px-10">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight text-slate-900">
              {pageMeta.title}
            </h1>
            <p className="mt-1 truncate text-xs text-slate-500">
              {pageMeta.subtitle}
            </p>
          </div>

          {adminNav === "command" && (
            <button
              type="button"
              onClick={() => {
                resetMsg();
                setNewAgentData({
                  name: "",
                  employeeId: "",
                  password: "",
                });
                setIsProvisionModalOpen(true);
              }}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#97c22a] px-4 py-2.5 text-sm font-bold text-[#17200a] shadow-sm transition hover:bg-[#a8d73b]"
            >
              <Icon
                className="h-4 w-4"
                path="M12 5v14M5 12h14"
              />
              Provision agent
            </button>
          )}
        </header>

        {/* MOBILE HEADER */}
        <header className="z-20 flex min-h-[60px] shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-3.5 sm:px-4 lg:hidden">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#97c22a]/10 text-[#6b921b]">
              <Icon
                className="h-5 w-5"
                path="M9 12l2 2 4-4m5.6-4A12 12 0 0112 3a12 12 0 01-8.6 3A12 12 0 003 9c0 5.6 3.8 10.3 9 11.6 5.2-1.3 9-6 9-11.6 0-1-.1-2-.4-3z"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-extrabold text-slate-900 sm:text-sm">
                ProSushil Lifecare
              </p>
              <p className="truncate text-[10px] font-medium text-slate-500">
                {pageMeta.title}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {adminNav === "command" && (
              <button
                type="button"
                aria-label="Provision agent"
                onClick={() => {
                  resetMsg();
                  setNewAgentData({
                    name: "",
                    employeeId: "",
                    password: "",
                  });
                  setIsProvisionModalOpen(true);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#97c22a]/15 text-[#5a8a10]"
              >
                <Icon
                  path="M12 5v14M5 12h14"
                  strokeWidth={2}
                />
              </button>
            )}

            <button
              type="button"
              aria-label="Profile settings"
              onClick={() => {
                resetMsg();
                setIsProfileModalOpen(true);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#97c22a]/20 bg-[#97c22a]/10 text-[10px] font-bold text-[#5a8a10]"
            >
              AD
            </button>

            <button
              type="button"
              aria-label="Sign out"
              onClick={handleLogout}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500"
            >
              <Icon
                className="h-4 w-4"
                path="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </button>
          </div>
        </header>

        {/* MOBILE NAV MENU */}
        {mobileNavOpen && (
          <div className="absolute inset-0 z-50 bg-[#0a0f1a]/50 lg:hidden">
            <button
              type="button"
              aria-label="Close navigation"
              className="absolute inset-0 h-full w-full"
              onClick={() => setMobileNavOpen(false)}
            />

            <div className="absolute bottom-0 left-0 right-0 max-h-[80dvh] overflow-y-auto rounded-t-3xl bg-white p-4 pb-[calc(env(safe-area-inset-bottom)+16px)] shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Admin Navigation
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Choose a section
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Close navigation"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600"
                >
                  <Icon path="M6 6l12 12M18 6L6 18" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {NAV_ITEMS.map((item) => {
                  const active = adminNav === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigateTo(item.id)}
                      className={`flex min-h-[76px] items-center gap-3 rounded-xl border p-3 text-left ${
                        active
                          ? "border-[#97c22a]/30 bg-[#97c22a]/10 text-[#5a8a10]"
                          : "border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      <Icon
                        className="h-5 w-5 shrink-0"
                        path={item.icon}
                      />
                      <span className="text-xs font-semibold leading-snug">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* CONTENT AREA */}
        <div
          className={`flex-1 min-h-0 ${
            adminNav === "map"
              ? "overflow-hidden"
              : "overflow-y-auto overscroll-y-contain"
          }`}
        >
          {adminNav === "command" && <AgentAccountsView />}

          {adminNav === "sales" && (
            <div className="min-h-full">
              <DailySalesTab />
            </div>
          )}

          {adminNav === "reports" && (
            <div className="min-h-full">
              <DailyReportTab team={team} />
            </div>
          )}

          {adminNav === "territory" && (
            <div className="min-h-full">
              <TerritorySetupTab />
            </div>
          )}

          {adminNav === "approvals" && (
            <div className="min-h-full">
              <PendingApprovals />
            </div>
          )}

          {adminNav === "map" && (
            <div className="h-full min-h-0 overflow-hidden">
              <EmployeeMapTab />
            </div>
          )}

          {adminNav === "monthly-report" && (
            <div className="min-h-full p-3 pb-8 sm:p-5 md:p-8">
              <MonthlyMRReportTab />
            </div>
          )}
          {adminNav === "attendance" && (
  <div className="min-h-full">
    <EmployeeVisitChartTab />
  </div>
)}

          {adminNav === "collections" && (
            <div className="min-h-full p-3 pb-8 sm:p-5 md:p-8">
              <CollectionStatements />
            </div>
          )}
        </div>

        {/* MOBILE BOTTOM NAVIGATION
            Horizontally scrollable so all 8 tabs remain reachable. */}
        <nav
          aria-label="Admin navigation"
          className="z-40 shrink-0 border-t border-slate-200 bg-white lg:hidden"
          style={{
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          <div
            className="flex h-[60px] items-stretch overflow-x-auto overscroll-x-contain px-1"
            style={{
              scrollbarWidth: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {NAV_ITEMS.map((item) => {
              const active = adminNav === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTo(item.id)}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex min-w-[72px] flex-none flex-col items-center justify-center gap-1 px-2 transition ${
                    active ? "text-[#6b921b]" : "text-slate-400"
                  }`}
                >
                  <Icon
                    className="h-[19px] w-[19px]"
                    path={item.icon}
                    strokeWidth={active ? 2 : 1.6}
                  />

                  <span className="max-w-full truncate text-[9px] font-bold leading-none">
                    {item.mobileLabel}
                  </span>

                  {active && (
                    <span className="absolute inset-x-3 top-0 h-[3px] rounded-b-full bg-[#97c22a]" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex justify-center pb-1">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold text-slate-500 hover:bg-slate-50"
            >
              <Icon
                className="h-3 w-3"
                path="M4 6h16M4 12h16M4 18h16"
              />
              All sections
            </button>
          </div>
        </nav>

        {/* ---------------------------------------------------
            PROVISION AGENT MODAL
        --------------------------------------------------- */}
        {isProvisionModalOpen && (
          <Modal
            title="Provision new agent"
            subtitle="Create a field representative account."
            onClose={() => setIsProvisionModalOpen(false)}
          >
            <form
              onSubmit={handleProvisionAgent}
              className="space-y-4"
            >
              <Message />

              <Field label="Full name">
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={newAgentData.name}
                  onChange={(event) =>
                    setNewAgentData({
                      ...newAgentData,
                      name: event.target.value,
                    })
                  }
                  className={INPUT_CLASS}
                  placeholder="e.g. Rahul Sharma"
                />
              </Field>

              <Field
                label="Employee ID"
                hint="Login username"
              >
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={newAgentData.employeeId}
                  onChange={(event) =>
                    setNewAgentData({
                      ...newAgentData,
                      employeeId: event.target.value,
                    })
                  }
                  className={INPUT_CLASS}
                  placeholder="e.g. PL-1043"
                />
              </Field>

              <Field
                label="Temporary password"
                hint="At least 8 characters"
              >
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={newAgentData.password}
                    onChange={(event) =>
                      setNewAgentData({
                        ...newAgentData,
                        password: event.target.value,
                      })
                    }
                    className={`${INPUT_CLASS} pr-12`}
                    placeholder="Enter a temporary password"
                  />
                  <PasswordToggle />
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsProvisionModalOpen(false)}
                  className={BUTTON_SECONDARY}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#97c22a] px-4 py-3 text-sm font-bold text-[#17200a] transition hover:bg-[#a8d73b] disabled:opacity-60"
                >
                  {isSubmitting ? "Creating..." : "Create agent"}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* ---------------------------------------------------
            EDIT AGENT MODAL
        --------------------------------------------------- */}
        {isEditModalOpen && (
          <Modal
            title="Edit agent"
            subtitle={`Employee ID: ${editAgentData.originalEmployeeId}`}
            onClose={() => setIsEditModalOpen(false)}
          >
            <form onSubmit={handleEditAgent} className="space-y-4">
              <Message />

              <Field label="Full name">
                <input
                  type="text"
                  required
                  value={editAgentData.name}
                  onChange={(event) =>
                    setEditAgentData({
                      ...editAgentData,
                      name: event.target.value,
                    })
                  }
                  className={INPUT_CLASS}
                />
              </Field>

              <Field label="Employee ID">
                <input
                  type="text"
                  required
                  value={editAgentData.employeeId}
                  onChange={(event) =>
                    setEditAgentData({
                      ...editAgentData,
                      employeeId: event.target.value,
                    })
                  }
                  className={INPUT_CLASS}
                />
              </Field>

              <Field label="New password" hint="Optional">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    minLength={8}
                    autoComplete="new-password"
                    value={editAgentData.password}
                    onChange={(event) =>
                      setEditAgentData({
                        ...editAgentData,
                        password: event.target.value,
                      })
                    }
                    className={`${INPUT_CLASS} pr-12`}
                    placeholder="Leave blank to keep current"
                  />
                  <PasswordToggle />
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsEditModalOpen(false)}
                  className={BUTTON_SECONDARY}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {isSubmitting ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* ---------------------------------------------------
            DELETE AGENT MODAL
        --------------------------------------------------- */}
        {isDeleteModalOpen && agentToDelete && (
          <Modal
            title="Remove agent?"
            subtitle="This action may affect the agent's account access."
            onClose={() => setIsDeleteModalOpen(false)}
            maxWidth="max-w-sm"
          >
            <div className="space-y-4">
              <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                <p className="text-sm font-bold text-red-800">
                  {agentToDelete.name || "Selected agent"}
                </p>

                <p className="mt-1 break-all font-mono text-xs text-red-600">
                  {getAgentId(agentToDelete)}
                </p>
              </div>

              <p className="text-sm leading-relaxed text-slate-600">
                Are you sure you want to remove this agent account?
                Confirm that this action is appropriate for your
                account-retention and record-preservation rules.
              </p>

              <Message />

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsDeleteModalOpen(false)}
                  className={BUTTON_SECONDARY}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeleteAgent}
                  disabled={isSubmitting}
                  className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
                >
                  {isSubmitting ? "Removing..." : "Remove agent"}
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ---------------------------------------------------
            ADMIN PROFILE MODAL
        --------------------------------------------------- */}
        {isProfileModalOpen && (
          <Modal
            title="Account settings"
            subtitle={`Current administrator: ${currentAdminId}`}
            onClose={() => setIsProfileModalOpen(false)}
          >
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <Message />

              <Field
                label="New username"
                hint="Optional"
              >
                <input
                  type="text"
                  autoComplete="username"
                  value={profileData.newEmployeeId}
                  onChange={(event) =>
                    setProfileData({
                      ...profileData,
                      newEmployeeId: event.target.value,
                    })
                  }
                  className={INPUT_CLASS}
                  placeholder="Leave blank to keep current"
                />
              </Field>

              <Field
                label="New password"
                hint="Optional"
              >
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    minLength={8}
                    autoComplete="new-password"
                    value={profileData.newPassword}
                    onChange={(event) =>
                      setProfileData({
                        ...profileData,
                        newPassword: event.target.value,
                      })
                    }
                    className={`${INPUT_CLASS} pr-12`}
                    placeholder="Leave blank to keep current"
                  />
                  <PasswordToggle />
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsProfileModalOpen(false)}
                  className={BUTTON_SECONDARY}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    (!profileData.newEmployeeId &&
                      !profileData.newPassword)
                  }
                  className="rounded-xl bg-[#0a0f1a] px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </main>
    </div>
  );
}
