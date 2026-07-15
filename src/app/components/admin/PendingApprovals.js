'use client';
import { useState, useEffect, useMemo } from 'react';

export default function PendingApprovals() {
  const [data, setData] = useState([]);
  const [dismissedPending, setDismissedPending] = useState([]);
  const [fullImage, setFullImage] = useState(null);

  // 1. Fetch its own data from the DB
  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/territories');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load pending approvals");
    }
  };

  useEffect(() => {
    fetchData();
    // Load the dismissed list from Local Storage
    try {
      const saved = localStorage.getItem('dismissedPendingShops');
      if (saved) setDismissedPending(JSON.parse(saved));
    } catch (e) { }
  }, []);

  // 2. Handle its own verification logic
  const handleVerify = async (medicalId, newStatus) => {
    try {
      const res = await fetch('/api/admin/territories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'medical', id: medicalId, isVerified: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update verification status.");
      
      // Refresh the list immediately after approving
      await fetchData(); 
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDismiss = (shopId) => {
    setDismissedPending(prev => {
      const updatedList = [...prev, shopId];
      try { localStorage.setItem('dismissedPendingShops', JSON.stringify(updatedList)); } catch (e) {}
      return updatedList;
    });
  };

  const pendingShops = useMemo(() => {
    let pending = [];
    if (!data) return pending;
    
    data.forEach(area => {
      area.places?.forEach(place => {
        place.medicals?.forEach(med => {
          if (!med.isVerified && !dismissedPending.includes(med.id)) {
            pending.push({ ...med, areaName: area.name, placeName: place.name });
          }
        });
      });
    });
    return pending;
  }, [data, dismissedPending]);

  if (pendingShops.length === 0) return null;

  return (
    <>
      {/* 🚨 CORRECTED WRAPPER: flex-col ensures top-to-bottom layout, removed overflow-hidden so you can scroll 🚨 */}
      <div className="flex flex-col min-h-screen max-w-8xl mx-auto w-full font-sans p-4 md:p-8" style={{ background: '#f1f5f9' }}>
        
        {/* Header section */}
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
            Pending Approvals
          </h3>
          <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-lg text-sm font-semibold">
            {pendingShops.length} action{pendingShops.length !== 1 ? 's' : ''} required
          </span>
        </div>
        
        {/* Grid Container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-20">
          {pendingShops.map(shop => (
            <div key={shop.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
              
              {/* Card Body */}
              <div className="p-4 flex-1">
                <div className="flex justify-between items-start gap-3 mb-2">
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-slate-900 line-clamp-1" title={shop.name}>
                      {shop.name}
                    </h4>
                    <p className="text-sm font-semibold text-[#97C22A] mt-0.5 line-clamp-1">
                      {shop.areaName} <span className="text-slate-300 mx-1">›</span> {shop.placeName}
                    </p>
                  </div>
                  
                  {shop.photoUrl ? (
                    <img 
                      src={shop.photoUrl} 
                      alt="Shop" 
                      onClick={() => setFullImage(shop.photoUrl)}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity shrink-0 shadow-sm" 
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-semibold shrink-0 text-center leading-tight">
                      No<br/>Img
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-slate-500 mt-2 line-clamp-2" title={shop.address}>
                  {shop.address}
                </p>
              </div>

              {/* Card Footer with Toggle & Dismiss */}
              <div className="border-t border-slate-100 p-3 bg-slate-50/50 flex items-center justify-between">
                
                {/* Later Button */}
                <button
                  onClick={() => handleDismiss(shop.id)}
                  className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors px-2 py-1"
                >
                  Later
                </button>
                
                {/* Modern Toggle Switch */}
                <label className="relative inline-flex items-center cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    onChange={(e) => {
                      if (e.target.checked) handleVerify(shop.id, true);
                    }} 
                    checked={false} 
                  />
                  {/* Toggle Track */}
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#97C22A] group-hover:bg-slate-300"></div>
                  {/* Toggle Label */}
                  <span className="ml-2 text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                    Approve
                  </span>
                </label>

              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full-screen Lightbox overlay */}
      {fullImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200" 
          onClick={() => setFullImage(null)}
        >
          <img src={fullImage} className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" alt="Shop Full View" />
          <button 
            className="absolute top-5 right-5 text-white bg-white/20 hover:bg-white/40 p-2.5 rounded-full transition-colors"
            onClick={() => setFullImage(null)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}