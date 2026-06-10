'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [team, setTeam] = useState([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(true);
  const COMMISSION_RATE = 0.08; 

  const [currentAdminId, setCurrentAdminId] = useState('PL-ADMIN'); 

  // Modals State
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form Data States
  const [newAgentData, setNewAgentData] = useState({ name: '', employeeId: '', password: '' });
  const [editAgentData, setEditAgentData] = useState({ originalEmployeeId: '', name: '', employeeId: '', password: '' });
  const [agentToDelete, setAgentToDelete] = useState(null);
  const [profileData, setProfileData] = useState({ newEmployeeId: '', newPassword: '' });

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);

  // Logout Handler
  const handleLogout = () => {
    // In a real app with JWTs, you'd clear cookies/localStorage here
    router.push('/');
  };

  const fetchTeamData = async () => {
    setIsLoadingTeam(true);
    try {
      const response = await fetch('/api/admin/agents');
      const data = await response.json();
      if (response.ok) setTeam(data);
    } catch (error) {
      console.error("Error fetching team:", error);
    } finally {
      setIsLoadingTeam(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, []);

  // --- ACTIONS ---

  const handleProvisionAgent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/admin/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAgentData, role: 'AGENT' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setSubmitMessage({ type: 'success', text: `Agent provisioned successfully.` });
      setNewAgentData({ name: '', employeeId: '', password: '' });
      setShowPassword(false);
      fetchTeamData();
      setTimeout(() => setIsProvisionModalOpen(false), 1500);
    } catch (error) {
      setSubmitMessage({ type: 'error', text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAgent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/admin/agents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editAgentData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setSubmitMessage({ type: 'success', text: `Agent updated successfully.` });
      fetchTeamData();
      setTimeout(() => setIsEditModalOpen(false), 1500);
    } catch (error) {
      setSubmitMessage({ type: 'error', text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAgent = async () => {
    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/admin/agents', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: agentToDelete.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      fetchTeamData();
      setIsDeleteModalOpen(false);
      setAgentToDelete(null);
    } catch (error) {
      setSubmitMessage({ type: 'error', text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentEmployeeId: currentAdminId,
          newEmployeeId: profileData.newEmployeeId,
          newPassword: profileData.newPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setSubmitMessage({ type: 'success', text: 'Profile updated.' });
      if (profileData.newEmployeeId) setCurrentAdminId(profileData.newEmployeeId);
      
      setProfileData({ newEmployeeId: '', newPassword: '' });
      setShowPassword(false);
      setTimeout(() => setIsProfileModalOpen(false), 1500);
    } catch (error) {
      setSubmitMessage({ type: 'error', text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- OPEN MODAL TRIGGERS ---
  const openEditModal = (agent) => {
    setEditAgentData({ originalEmployeeId: agent.id, name: agent.name, employeeId: agent.id, password: '' });
    setSubmitMessage({ type: '', text: '' });
    setShowPassword(false);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (agent) => {
    setAgentToDelete(agent);
    setSubmitMessage({ type: '', text: '' });
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="flex h-[100dvh] w-full bg-[#f8fafc] text-slate-800 overflow-hidden font-sans selection:bg-[#97c22a]/20 relative">
      
      {/* ========================================= */}
      {/* DESKTOP SIDEBAR NAVIGATION                */}
      {/* ========================================= */}
      <aside className="hidden md:flex flex-col w-72 bg-slate-900 border-r border-slate-800 relative z-20 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-8 pb-10 border-b border-slate-800/60">
          <div className="inline-flex items-center space-x-2.5 bg-slate-800/40 border border-slate-700/50 px-3 py-1.5 rounded-md mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#97c22a] animate-pulse shadow-[0_0_8px_#97c22a]"></span>
            <span className="text-[11px] font-medium text-slate-300 tracking-wide">Admin Portal</span>
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight leading-snug">
            Prosushil <br/><span className="text-[#97c22a]">Lifecare LLP</span>
          </h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-8 px-5 space-y-2.5">
          <a href="#" className="flex items-center space-x-3.5 px-4 py-3.5 bg-[#97c22a]/10 text-[#97c22a] rounded-md font-medium border border-[#97c22a]/20 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            <span>Command Center</span>
          </a>
          <a href="#" className="flex items-center space-x-3.5 px-4 py-3.5 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-md font-medium transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            <span>Live Field Tracker</span>
          </a>
        </nav>

        {/* Bottom Actions: Profile & Logout */}
        <div className="border-t border-slate-800/60 p-4 space-y-2">
          <button onClick={() => setIsProfileModalOpen(true)} className="flex items-center space-x-3 px-4 py-3 w-full rounded-md hover:bg-slate-800/50 transition-colors text-left focus:outline-none group">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold shadow-sm text-xs shrink-0">AD</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate group-hover:text-[#97c22a] transition-colors">Profile Settings</p>
              <p className="text-[10px] text-slate-500 truncate">{currentAdminId}</p>
            </div>
          </button>
          
          <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 w-full rounded-md hover:bg-[#e73e43]/10 text-slate-400 hover:text-[#e73e43] transition-colors text-left focus:outline-none">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            <span className="text-sm font-medium">Secure Logout</span>
          </button>
        </div>
      </aside>

      {/* ========================================= */}
      {/* MAIN CONTENT AREA                         */}
      {/* ========================================= */}
      <main className="flex-1 flex flex-col h-[100dvh] relative overflow-hidden w-full bg-slate-50/50">
        
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#97c22a]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 -z-10"></div>
        <div className="absolute top-40 left-0 w-[200px] h-[200px] bg-[#e73e43]/5 rounded-full blur-[60px] -translate-x-1/2 -z-10"></div>

        {/* Top Header - Desktop */}
        <header className="hidden md:flex h-24 bg-white border-b border-slate-200/80 items-center justify-between px-10 shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.01)] z-10">
          <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">Sales Operations Command</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">Live tracking and performance metrics</p>
            </div>
            <button 
              onClick={() => {
                setSubmitMessage({type: '', text: ''});
                setIsProvisionModalOpen(true);
              }}
              className="bg-[#97c22a] hover:bg-[#85ab25] text-white font-medium px-6 py-2.5 rounded-md text-sm transition-all shadow-[0_4px_15px_rgba(151,194,42,0.25)] flex items-center active:scale-[0.98]"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Provision Agent
            </button>
          </div>
        </header>

        {/* Top Header - Mobile */}
        <header className="md:hidden flex h-16 bg-white items-center justify-between px-5 shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.03)] z-10 border-b border-slate-100">
          <div>
            <h1 className="text-lg font-semibold text-slate-800 tracking-tight">Admin Portal</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={() => setIsProfileModalOpen(true)} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-[10px] shadow-sm bg-slate-50">
              AD
            </button>
            <button onClick={handleLogout} className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 hover:text-[#e73e43] shadow-sm">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </button>
          </div>
        </header>

        {/* Scrollable Dashboard Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full p-4 md:p-10 space-y-6 md:space-y-8 pb-28 md:pb-10">
            
            {/* KPI Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-white p-4 md:p-7 rounded-md border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]">
                <p className="text-[11px] md:text-xs font-medium text-slate-500 tracking-wide mb-2">Total Pipeline</p>
                <h3 className="text-xl md:text-3xl font-semibold text-slate-800 tracking-tight">₹0</h3>
              </div>
              <div className="bg-white p-4 md:p-7 rounded-md border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]">
                <p className="text-[11px] md:text-xs font-medium text-slate-500 tracking-wide mb-2">Active Agents</p>
                <h3 className="text-xl md:text-3xl font-semibold text-slate-800 tracking-tight">{team.length}</h3>
              </div>
              <div className="bg-white p-4 md:p-7 rounded-md border border-[#e73e43]/20 shadow-[0_4px_20px_-4px_rgba(231,62,67,0.05)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#e73e43]"></div>
                <p className="text-[11px] md:text-xs font-medium text-[#e73e43] tracking-wide mb-2">Violations</p>
                <h3 className="text-xl md:text-3xl font-semibold text-slate-800 tracking-tight">0</h3>
              </div>
              <div className="bg-white p-4 md:p-7 rounded-md border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]">
                <p className="text-[11px] md:text-xs font-medium text-slate-500 tracking-wide mb-2">Commission Pending</p>
                <h3 className="text-xl md:text-3xl font-semibold text-[#97c22a] tracking-tight">₹0</h3>
              </div>
            </div>

            {/* DESKTOP DATA TABLE */}
            <div className="hidden md:block bg-white rounded-md shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] border border-slate-200/80 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center tracking-tight">Field Representative Logs</h3>
              </div>
              
              {isLoadingTeam ? (
                <div className="p-10 text-center text-slate-500 text-sm">Fetching agent data...</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-500 text-[11px] font-medium tracking-wide border-b border-slate-200/80">
                      <th className="p-5">Agent ID</th>
                      <th className="p-5">Representative Name</th>
                      <th className="p-5">Target Location</th>
                      <th className="p-5 text-center">Deals</th>
                      <th className="p-5 text-center">Status</th>
                      <th className="p-5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {team.length === 0 ? (
                      <tr><td colSpan="6" className="p-8 text-center text-slate-500">No agents provisioned yet.</td></tr>
                    ) : (
                      team.map((agent) => (
                        <tr key={agent.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-5 font-mono text-slate-500 text-[13px]">{agent.id}</td>
                          <td className="p-5 font-medium text-slate-800">{agent.name}</td>
                          <td className="p-5 text-slate-500 max-w-[220px] truncate">{agent.target}</td>
                          <td className="p-5 text-center font-medium text-slate-700">{agent.dealsClosed}</td>
                          <td className="p-5 text-center">
                            <span className={`inline-flex px-3 py-1 rounded-md text-[10px] font-medium tracking-wide border ${agent.status === 'Flagged' ? 'bg-[#e73e43]/10 text-[#e73e43] border-[#e73e43]/20' : 'bg-[#97c22a]/10 text-[#97c22a] border-[#97c22a]/20'}`}>
                              {agent.status}
                            </span>
                          </td>
                          <td className="p-5 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button onClick={() => openEditModal(agent)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit Agent">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                              </button>
                              <button onClick={() => openDeleteModal(agent)} className="p-1.5 text-slate-400 hover:text-[#e73e43] hover:bg-[#e73e43]/10 rounded-md transition-colors" title="Delete Agent">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* MOBILE APP CARDS */}
            <div className="md:hidden space-y-4">
              <div className="flex justify-between items-end mb-2">
                <h3 className="text-sm font-semibold text-slate-800 tracking-tight">Field Agent Logs</h3>
                <button onClick={() => { setSubmitMessage({type: '', text: ''}); setIsProvisionModalOpen(true); }} className="text-[11px] font-medium text-[#97c22a] bg-[#97c22a]/10 px-3 py-1.5 rounded-md flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  New Agent
                </button>
              </div>
              
              {isLoadingTeam ? (
                <div className="p-6 text-center text-slate-500 text-xs">Fetching...</div>
              ) : team.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs bg-white rounded-md border border-slate-200">No agents yet.</div>
              ) : (
                team.map((agent) => (
                  <div key={agent.id} className="bg-white rounded-md border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-4 flex flex-col relative">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2.5 ${agent.status === 'Flagged' ? 'bg-[#e73e43]' : 'bg-[#97c22a]'}`}></div>
                        <div>
                          <h4 className="font-semibold text-slate-800 text-sm">{agent.name}</h4>
                          <p className="text-[10px] font-mono text-slate-400">{agent.id}</p>
                        </div>
                      </div>
                      
                      {/* Mobile Actions */}
                      <div className="flex space-x-1">
                        <button onClick={() => openEditModal(agent)} className="p-1.5 text-slate-400 bg-slate-50 rounded-md">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </button>
                        <button onClick={() => openDeleteModal(agent)} className="p-1.5 text-[#e73e43] bg-[#e73e43]/10 rounded-md">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-md border border-slate-100 flex justify-between items-center">
                      <p className="text-[10px] font-medium text-slate-500">Target</p>
                      <p className="text-xs font-medium text-slate-800 truncate max-w-[180px]">{agent.target}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM NAV FOR MOBILE */}
        <nav className="md:hidden absolute bottom-0 w-full h-16 bg-white border-t border-slate-200/80 flex items-center justify-around z-40 px-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
          <button className="flex flex-col items-center justify-center text-[#97c22a] w-full h-full">
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            <span className="text-[10px] font-medium tracking-wide">Home</span>
          </button>
        </nav>

        {/* ========================================= */}
        {/* SHARED MODAL COMPONENT ENGINE             */}
        {/* ========================================= */}

        {/* PROVISION AGENT MODAL */}
        {isProvisionModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-md shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 p-5 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-semibold text-slate-800">Provision New Agent</h3>
                </div>
                <button onClick={() => setIsProvisionModalOpen(false)} className="text-slate-400 hover:text-slate-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12"></path></svg></button>
              </div>
              <form onSubmit={handleProvisionAgent} className="p-5 space-y-4">
                {submitMessage.text && (
                  <div className={`p-3 rounded-md text-xs font-medium ${submitMessage.type === 'success' ? 'bg-[#97c22a]/10 text-[#97c22a]' : 'bg-[#e73e43]/10 text-[#e73e43]'}`}>{submitMessage.text}</div>
                )}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label>
                  <input type="text" required value={newAgentData.name} onChange={(e) => setNewAgentData({ ...newAgentData, name: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-[#97c22a] transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Employee ID (Username)</label>
                  <input type="text" required value={newAgentData.employeeId} onChange={(e) => setNewAgentData({ ...newAgentData, employeeId: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-[#97c22a] transition-all" />
                </div>
                <div className="relative">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Temporary Password</label>
                  <input type={showPassword ? "text" : "password"} required value={newAgentData.password} onChange={(e) => setNewAgentData({ ...newAgentData, password: e.target.value })} className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-[#97c22a] transition-all" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[26px] text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                </div>
                <div className="pt-2 flex space-x-3">
                  <button type="button" onClick={() => setIsProvisionModalOpen(false)} className="flex-1 py-2.5 text-sm font-medium border border-slate-200 rounded-md">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 text-sm font-medium text-white bg-[#97c22a] rounded-md">{isSubmitting ? '...' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT AGENT MODAL */}
        {isEditModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-md shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 p-5 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-base font-semibold text-slate-800">Edit Agent: {editAgentData.originalEmployeeId}</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12"></path></svg></button>
              </div>
              <form onSubmit={handleEditAgent} className="p-5 space-y-4">
                {submitMessage.text && (
                  <div className={`p-3 rounded-md text-xs font-medium ${submitMessage.type === 'success' ? 'bg-[#97c22a]/10 text-[#97c22a]' : 'bg-[#e73e43]/10 text-[#e73e43]'}`}>{submitMessage.text}</div>
                )}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label>
                  <input type="text" required value={editAgentData.name} onChange={(e) => setEditAgentData({ ...editAgentData, name: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-[#97c22a]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Employee ID</label>
                  <input type="text" required value={editAgentData.employeeId} onChange={(e) => setEditAgentData({ ...editAgentData, employeeId: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-[#97c22a]" />
                </div>
                <div className="relative">
                  <label className="block text-xs font-medium text-slate-500 mb-1">New Password (Optional)</label>
                  <input type={showPassword ? "text" : "password"} value={editAgentData.password} onChange={(e) => setEditAgentData({ ...editAgentData, password: e.target.value })} placeholder="Leave blank to keep current" className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-[#97c22a]" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[26px] text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                </div>
                <div className="pt-2 flex space-x-3">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2.5 text-sm font-medium border border-slate-200 rounded-md">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-md">{isSubmitting ? '...' : 'Save Changes'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {isDeleteModalOpen && agentToDelete && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-md shadow-2xl w-full max-w-sm border border-slate-200 overflow-hidden text-center p-6">
              <div className="w-12 h-12 bg-[#e73e43]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#e73e43]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Delete Agent?</h3>
              <p className="text-sm text-slate-500 mt-2 mb-6">Are you sure you want to completely remove <b>{agentToDelete.name}</b> from the system? This cannot be undone.</p>
              
              {submitMessage.text && (
                 <div className="mb-4 p-3 rounded-md text-xs font-medium bg-[#e73e43]/10 text-[#e73e43] text-left">{submitMessage.text}</div>
              )}

              <div className="flex space-x-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 text-sm font-medium border border-slate-200 rounded-md">Cancel</button>
                <button onClick={handleDeleteAgent} disabled={isSubmitting} className="flex-1 py-2.5 text-sm font-medium text-white bg-[#e73e43] rounded-md">{isSubmitting ? 'Deleting...' : 'Yes, Delete'}</button>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN PROFILE SETTINGS MODAL */}
        {isProfileModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-md shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 p-5 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-base font-semibold text-slate-800">Admin Account Settings</h3>
                <button onClick={() => setIsProfileModalOpen(false)} className="text-slate-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12"></path></svg></button>
              </div>
              <form onSubmit={handleProfileUpdate} className="p-5 space-y-4">
                {submitMessage.text && (
                  <div className={`p-3 rounded-md text-xs font-medium ${submitMessage.type === 'success' ? 'bg-[#97c22a]/10 text-[#97c22a]' : 'bg-[#e73e43]/10 text-[#e73e43]'}`}>{submitMessage.text}</div>
                )}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">New Username (Current: {currentAdminId})</label>
                  <input type="text" value={profileData.newEmployeeId} onChange={(e) => setProfileData({ ...profileData, newEmployeeId: e.target.value })} placeholder="Leave blank to keep current" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-[#97c22a]" />
                </div>
                <div className="relative">
                  <label className="block text-xs font-medium text-slate-500 mb-1">New Password</label>
                  <input type={showPassword ? "text" : "password"} value={profileData.newPassword} onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })} placeholder="Leave blank to keep current" className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-[#97c22a]" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[26px] text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                </div>
                <div className="pt-2 flex space-x-3">
                  <button type="button" onClick={() => setIsProfileModalOpen(false)} className="flex-1 py-2.5 text-sm font-medium border border-slate-200 rounded-md">Cancel</button>
                  <button type="submit" disabled={isSubmitting || (!profileData.newEmployeeId && !profileData.newPassword)} className="flex-1 py-2.5 text-sm font-medium text-white bg-slate-800 rounded-md">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}