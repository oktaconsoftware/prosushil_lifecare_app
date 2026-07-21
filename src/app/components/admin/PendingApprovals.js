'use client';
import { useState, useEffect } from 'react';

export default function PendingApprovals() {
  const [data, setData] = useState([]);
  const [dismissedPending, setDismissedPending] = useState([]);
  
  // Server-Side Pagination States
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  // Lightbox State
  const [fullImage, setFullImage] = useState(null);
  const [isFetchingPhoto, setIsFetchingPhoto] = useState(false);

  // 1. Debounce Search (Waits 400ms after you stop typing to trigger a search)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // 2. Fetch Data from the new highly-optimized API
  const fetchPendingShops = async (pageNum, query, isReset = false) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/pending?page=${pageNum}&search=${encodeURIComponent(query)}&t=${Date.now()}`, {
        cache: 'no-store'
      });
      
      if (res.ok) {
        const json = await res.json();
        if (isReset) {
          setData(json.data); // Replace data on new search
        } else {
          setData(prev => [...prev, ...json.data]); // Append data on "Load More"
        }
        setHasMore(json.hasMore);
      }
    } catch (err) {
      console.error("Failed to load pending approvals");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Trigger Fetch when Search or Page changes
  useEffect(() => {
    // If the search changes, reset to page 1
    setPage(1);
    fetchPendingShops(1, debouncedQuery, true);
    
    // Load local storage dismissals
    try {
      const saved = localStorage.getItem('dismissedPendingShops');
      if (saved) setDismissedPending(JSON.parse(saved));
    } catch (e) { }
  }, [debouncedQuery]);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPendingShops(nextPage, debouncedQuery, false);
    }
  };

  const handleVerify = async (medicalId, newStatus) => {
    try {
      const res = await fetch('/api/admin/territories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'medical', id: medicalId, isVerified: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update verification status.");
      
      // Remove from current UI list instantly without re-fetching everything
      setData(prev => prev.filter(shop => shop.id !== medicalId));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleViewPhoto = async (shopId) => {
    setIsFetchingPhoto(true);
    try {
      const res = await fetch(`/api/admin/territories/photo?id=${shopId}`);
      if (!res.ok) throw new Error("Could not load photo");
      const result = await res.json();
      setFullImage(result.photoUrl);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsFetchingPhoto(false);
    }
  };

  const handleDismiss = (shopId) => {
    setDismissedPending(prev => {
      const updatedList = [...prev, shopId];
      try { localStorage.setItem('dismissedPendingShops', JSON.stringify(updatedList)); } catch (e) {}
      return updatedList;
    });
  };

  // Filter out locally dismissed shops
  const visibleShops = data.filter(shop => !dismissedPending.includes(shop.id));

  return (
    <>
      <div className="flex flex-col w-full font-sans p-4 md:p-8" style={{ background: '#f1f5f9' }}>
        
        {/* Header section with Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
              Pending Approvals
            </h3>
            <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-lg text-sm font-semibold">
              {visibleShops.length} visible
            </span>
          </div>

          {/* Database Search Bar */}
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
              placeholder="Database search (Name, Area, Address)..." 
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-10 flex flex-col">
          <div className="overflow-x-auto overflow-y-auto max-h-[70vh] custom-scrollbar">
            <table className="w-full text-left border-collapse whitespace-nowrap relative">
              <thead className="sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="bg-slate-100 border-b border-r border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 w-12 text-center">Photo</th>
                  <th className="bg-slate-100 border-b border-r border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">Shop Name</th>
                  <th className="bg-slate-100 border-b border-r border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">Territory</th>
                  <th className="bg-slate-100 border-b border-r border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 max-w-[300px]">Address</th>
                  <th className="bg-slate-100 border-b border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleShops.length > 0 ? (
                  visibleShops.map(shop => (
                    <tr key={shop.id} className="hover:bg-slate-50/80 transition-colors group">
                      
                      <td className="border-b border-r border-slate-200 px-4 py-2 align-middle">
                        <div className="flex justify-center items-center">
                          {shop.hasPhoto ? (
                            <div 
                              onClick={() => handleViewPhoto(shop.id)}
                              className="w-10 h-10 rounded-lg bg-[#97c22a]/10 border border-[#97c22a]/30 flex flex-col items-center justify-center text-[9px] text-[#5c7a1a] font-bold text-center leading-tight shadow-sm cursor-pointer hover:bg-[#97c22a]/20 transition-colors"
                            >
                              {isFetchingPhoto ? (
                                <div className="w-4 h-4 mb-0.5 border-2 border-[#5c7a1a] border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <svg className="w-4 h-4 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
                              )}
                              Photo
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 font-semibold shrink-0 text-center leading-tight">
                              No<br/>Img
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="border-b border-r border-slate-200 px-4 py-2 align-middle">
                        <p className="text-base font-semibold text-slate-900 truncate max-w-[120px] sm:max-w-[160px] md:max-w-[200px] lg:max-w-[250px]" title={shop.name}>
                          {shop.name}
                        </p>
                      </td>

                      <td className="border-b border-r border-slate-200 px-4 py-2 align-middle">
                        <p className="text-sm font-semibold text-[#97C22A] tracking-wide truncate max-w-[120px] sm:max-w-[160px] md:max-w-[200px] lg:max-w-[250px]" title={`${shop.areaName} › ${shop.placeName}`}>
                          {shop.areaName} <span className="text-slate-300 mx-1.5 font-normal">›</span> {shop.placeName}
                        </p>
                      </td>

                      <td className="border-b border-r border-slate-200 px-4 py-2 align-middle">
                        <p className="text-sm text-slate-500 truncate max-w-[140px] sm:max-w-[180px] md:max-w-[250px] lg:max-w-[320px]" title={shop.address}>
                          {shop.address || '-'}
                        </p>
                      </td>

                      <td className="border-b border-slate-200 px-4 py-2 align-middle">
                        <div className="flex items-center justify-end gap-4">
                          <button onClick={() => handleDismiss(shop.id)} className="text-sm font-semibold text-slate-400 hover:text-slate-700 transition-colors px-2 py-1 rounded-md hover:bg-slate-100 shrink-0">
                            Later
                          </button>
                          
                          <label className="relative inline-flex items-center cursor-pointer group/toggle shrink-0">
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
                        <p className="text-slate-500 font-medium text-sm">
                          {isLoading ? "Searching database..." : `No pending shops found matching "${searchQuery}"`}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* LOAD MORE BUTTON */}
          {hasMore && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-center">
              <button 
                onClick={loadMore}
                disabled={isLoading}
                className="px-6 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-xl shadow-sm hover:bg-slate-100 active:scale-95 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Load 50 More'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Full-screen Lightbox overlay */}
      {fullImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setFullImage(null)}>
          <img src={fullImage} className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl" alt="Shop Full View" />
          <button className="absolute top-5 right-5 text-slate-800 bg-white hover:bg-slate-100 p-2.5 rounded-full transition-colors shadow-lg" onClick={() => setFullImage(null)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}