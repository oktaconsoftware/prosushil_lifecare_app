'use client';
import { useState, useEffect, useMemo } from 'react';

export default function PendingApprovals() {
  const [data, setData] = useState([]);
  const [dismissedPending, setDismissedPending] = useState([]);
  const [fullImage, setFullImage] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');

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
    try {
      const saved = localStorage.getItem('dismissedPendingShops');
      if (saved) setDismissedPending(JSON.parse(saved));
    } catch (e) { }
  }, []);

  const handleVerify = async (medicalId, newStatus) => {
    try {
      const res = await fetch('/api/admin/territories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'medical', id: medicalId, isVerified: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update verification status.");
      
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

  const filteredShops = useMemo(() => {
    if (!searchQuery.trim()) return pendingShops;
    const lowerQ = searchQuery.toLowerCase();
    return pendingShops.filter(shop => 
      shop.name.toLowerCase().includes(lowerQ) ||
      shop.areaName.toLowerCase().includes(lowerQ) ||
      shop.placeName.toLowerCase().includes(lowerQ) ||
      (shop.address && shop.address.toLowerCase().includes(lowerQ))
    );
  }, [pendingShops, searchQuery]);

  if (pendingShops.length === 0) return null;

  return (
    <>
      <div className="flex flex-col min-h-screen max-w-7xl mx-auto w-full font-sans p-4 md:p-8" style={{ background: '#f1f5f9' }}>
        
        {/* Header section with Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
              Pending Approvals
            </h3>
            <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-lg text-sm font-semibold">
              {filteredShops.length} action{filteredShops.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Search Bar UI */}
          <div className="relative w-full md:w-[350px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shop, area, or address..." 
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2.5 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#97C22A] focus:ring-1 focus:ring-[#97C22A] transition-all shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* MODERN EXCEL-LIKE COMPACT TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="border-b border-r border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 w-12 text-center">Photo</th>
                  <th className="border-b border-r border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600">Shop Name</th>
                  <th className="border-b border-r border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600">Territory</th>
                  <th className="border-b border-r border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 max-w-[300px]">Address</th>
                  <th className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShops.length > 0 ? (
                  filteredShops.map(shop => (
                    <tr key={shop.id} className="hover:bg-slate-50/80 transition-colors group">
                      
                      {/* Photo Column */}
                      <td className="border-b border-r border-slate-200 px-4 py-2 align-middle">
                        <div className="flex justify-center items-center">
                          {shop.photoUrl ? (
                            <img 
                              src={shop.photoUrl} 
                              alt="Shop" 
                              onClick={() => setFullImage(shop.photoUrl)}
                              className="w-9 h-9 rounded-lg object-cover border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity shadow-sm" 
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 font-semibold shrink-0 text-center leading-tight">
                              No<br/>Img
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Shop Name Column */}
                      <td className="border-b border-r border-slate-200 px-4 py-2 align-middle">
                        <p className="text-base font-semibold text-slate-900 truncate max-w-[200px] xl:max-w-[300px]" title={shop.name}>
                          {shop.name}
                        </p>
                      </td>

                      {/* Territory Column */}
                      <td className="border-b border-r border-slate-200 px-4 py-2 align-middle">
                        <p className="text-sm font-semibold text-[#97C22A] tracking-wide">
                          {shop.areaName} <span className="text-slate-300 mx-1.5 font-normal">›</span> {shop.placeName}
                        </p>
                      </td>

                      {/* Address Column */}
                      <td className="border-b border-r border-slate-200 px-4 py-2 align-middle">
                        <p className="text-sm text-slate-500 truncate max-w-[200px] xl:max-w-[350px]" title={shop.address}>
                          {shop.address || '-'}
                        </p>
                      </td>

                      {/* Actions Column */}
                      <td className="border-b border-slate-200 px-4 py-2 align-middle">
                        <div className="flex items-center justify-end gap-4">
                          
                          {/* Later Button */}
                          <button
                            onClick={() => handleDismiss(shop.id)}
                            className="text-sm font-semibold text-slate-400 hover:text-slate-700 transition-colors px-2 py-1 rounded-md hover:bg-slate-100"
                          >
                            Later
                          </button>
                          
                          {/* Modern Toggle Switch */}
                          <label className="relative inline-flex items-center cursor-pointer group/toggle">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              onChange={(e) => {
                                if (e.target.checked) handleVerify(shop.id, true);
                              }} 
                              checked={false} 
                            />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#97C22A] group-hover/toggle:bg-slate-300 shadow-inner"></div>
                            <span className="ml-2.5 text-sm font-semibold text-slate-600 group-hover/toggle:text-slate-900 transition-colors">
                              Approve
                            </span>
                          </label>
                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                        <p className="text-slate-500 font-medium text-sm">No pending shops found matching "{searchQuery}"</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Full-screen Lightbox overlay */}
      {fullImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200" 
          onClick={() => setFullImage(null)}
        >
          <img src={fullImage} className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl" alt="Shop Full View" />
          <button 
            className="absolute top-5 right-5 text-slate-800 bg-white hover:bg-slate-100 p-2.5 rounded-full transition-colors shadow-lg"
            onClick={() => setFullImage(null)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}