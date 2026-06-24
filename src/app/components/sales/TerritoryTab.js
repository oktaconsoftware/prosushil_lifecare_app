// 'use client';
// import { useState, useRef, useMemo } from 'react';

// // Haversine Distance Calculator (Returns distance in meters)
// function getDistance(lat1, lon1, lat2, lon2) {
//   if (!lat1 || !lon1 || !lat2 || !lon2) return 999999;
//   const R = 6371e3;
//   const p1 = (lat1 * Math.PI) / 180;
//   const p2 = (lat2 * Math.PI) / 180;
//   const dp = ((lat2 - lat1) * Math.PI) / 180;
//   const dl = ((lon2 - lon1) * Math.PI) / 180;
//   const a = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
//   return Math.round(R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))));
// }

// export default function TerritoryTab({ 
//   targets, 
//   isLoadingRoute, 
//   initiateCheckIn, 
//   totalCommission, 
//   setIsDealModalOpen,
//   setPhotoUri
// }) {
  
//   const [step, setStep] = useState('camera'); // 'camera' | 'feed'
//   const [localPhoto, setLocalPhoto] = useState(null);
//   const [location, setLocation] = useState(null);
//   const [isLocating, setIsLocating] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const fileInputRef = useRef(null);

//   const visitedCount = targets?.filter(t => t.status === 'COMPLETED').length || 0;
//   const safeCommission = totalCommission || 0;

//   // ── CAMERA & GPS LOGIC ──
//   const handleCapture = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setLocalPhoto(reader.result);
//         if (setPhotoUri) setPhotoUri(reader.result); // Pass to parent for DB submission
//         findLocationAndUnlock();
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const findLocationAndUnlock = () => {
//     setIsLocating(true);
//     setStep('feed'); 

//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
//           setIsLocating(false);
//         },
//         (error) => {
//           console.warn("GPS Error:", error);
//           alert("Could not get exact GPS. Searching will rely on manual text input.");
//           setIsLocating(false);
//         },
//         { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
//       );
//     } else {
//       setIsLocating(false);
//     }
//   };

//   // ── SMART SORTING & FILTERING ──
//   const sortedAndFilteredShops = useMemo(() => {
//     let result = [...(targets || [])];

//     if (searchQuery.trim().length > 0) {
//       // Manual Search mode
//       const q = searchQuery.toLowerCase();
//       result = result.filter(shop => 
//         shop.name?.toLowerCase().includes(q) || 
//         shop.address?.toLowerCase().includes(q)
//       );
//     } else if (location) {
//       // GPS Radar Mode: Sort by closest distance
//       result = result.map(shop => {
//         const dist = getDistance(location.lat, location.lng, Number(shop.latitude), Number(shop.longitude));
//         return { ...shop, distance: dist };
//       }).sort((a, b) => a.distance - b.distance);
//     }

//     return result;
//   }, [targets, searchQuery, location]);


//   return (
//     <div className="flex-1 overflow-y-auto bg-[#F0F2F5]" style={{ WebkitOverflowScrolling: 'touch' }}>
      
//       {/* Hidden native file input for camera */}
//       <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleCapture} className="hidden" />

//       <div className="max-w-7xl mx-auto w-full min-h-full pb-28 lg:pb-12 lg:p-6 lg:pt-8">
        
//         {/* DESKTOP SPLIT LAYOUT */}
//         <div className="flex flex-col lg:flex-row lg:gap-8 items-start">

//           {/* =========================================
//               LEFT SIDEBAR (Sticky Stats)
//           ========================================= */}
//           <div className="w-full lg:w-[340px] xl:w-[380px] shrink-0 flex flex-col lg:sticky lg:top-6 z-20">
            
//             <div className="bg-[#0A0F1A] px-5 pt-6 pb-8 relative overflow-hidden rounded-none rounded-b-lg lg:rounded-xl shadow-lg">
//               <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(151,194,42,0.18) 0%, transparent 70%)' }} />
              
//               <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-4 relative z-10">Shift Overview</p>

//               <div className="grid grid-cols-2 gap-3 relative z-10">
//                 <div className="bg-white/5 border border-white/10 rounded-lg p-4">
//                   <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-1">Target</p>
//                   <p className="text-2xl font-bold text-white leading-none">{targets?.length || 0}</p>
//                 </div>
//                 <div className="bg-[#97C22A]/10 border border-[#97C22A]/20 rounded-lg p-4">
//                   <p className="text-[10px] font-bold tracking-widest uppercase text-[#97C22A]/80 mb-1">Visited</p>
//                   <p className="text-2xl font-bold text-[#97C22A] leading-none">{visitedCount}</p>
//                 </div>
//                 <div className="col-span-2 bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between mt-1">
//                   <div>
//                     <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-1">Earned Today</p>
//                     <p className="text-xl font-bold text-white leading-none">
//                       ₹{safeCommission >= 1000 ? (safeCommission / 1000).toFixed(1) + 'k' : safeCommission.toLocaleString('en-IN')}
//                     </p>
//                   </div>
//                   <div className="w-8 h-8 rounded-md bg-[#97C22A]/20 flex items-center justify-center">
//                     <svg className="w-4 h-4 text-[#97C22A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
//                   </div>
//                 </div>
//               </div>
//             </div>

//           </div>

//           {/* =========================================
//               RIGHT CONTENT (Camera Gatekeeper -> Feed)
//           ========================================= */}
//           <div className="flex-1 min-w-0 w-full px-4 md:px-6 lg:px-0 pt-4 lg:pt-0">

//             {isLoadingRoute ? (
//               <div className="flex flex-col items-center justify-center py-32 bg-white rounded-xl border border-slate-200 gap-3">
//                 <div className="w-8 h-8 rounded-full border-2 border-[#97C22A] border-t-transparent animate-spin" />
//                 <p className="text-sm font-semibold text-slate-400">Loading your territory…</p>
//               </div>
//             ) : step === 'camera' ? (
              
//               /* ── STEP 1: CAMERA LOCK ── */
//               <div className="bg-white rounded-xl border border-slate-200 p-8 md:p-16 text-center shadow-sm flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
//                 <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 relative">
//                   <div className="absolute inset-0 border-2 border-blue-500 rounded-full animate-ping opacity-20"></div>
//                   <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
//                 </div>
//                 <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Location Verification</h2>
//                 <p className="text-[13px] text-slate-500 max-w-[280px] mb-8 leading-relaxed">
//                   Snap a live photo of your surroundings to unlock your territory feed and find shops near you.
//                 </p>
//                 <button 
//                   onClick={() => fileInputRef.current?.click()}
//                   className="w-full max-w-[260px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3.5 font-bold text-[14px] shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
//                 >
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
//                   Open Camera
//                 </button>
//               </div>

//             ) : (
              
//               /* ── STEP 2: RADAR & SEARCH FEED ── */
//               <div className="animate-in fade-in slide-in-from-bottom-4 duration-400 space-y-4">
                
//                 {/* Search & Verification Header */}
//                 <div className="bg-[#0A0F1A] p-5 rounded-xl shadow-md relative z-10">
//                   <div className="flex items-center justify-between mb-4">
//                     <div>
//                       <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Live GPS Radar</p>
//                       <div className="flex items-center gap-1.5 mt-1">
//                         <div className="w-2 h-2 rounded-full bg-[#97C22A] animate-pulse"></div>
//                         <h3 className="text-[14px] font-bold text-white">Area Unlocked</h3>
//                       </div>
//                     </div>
//                     {localPhoto && (
//                       <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/20">
//                         <img src={localPhoto} alt="Verification" className="w-full h-full object-cover" />
//                       </div>
//                     )}
//                   </div>

//                   <div className="relative">
//                     <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
//                       <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
//                     </div>
//                     <input
//                       type="text"
//                       placeholder="Search medical shop name or address..."
//                       value={searchQuery}
//                       onChange={(e) => setSearchQuery(e.target.value)}
//                       className="w-full bg-white/10 border border-white/10 text-white placeholder-slate-400 rounded-lg pl-10 pr-4 py-3 text-[13px] font-bold focus:outline-none focus:border-[#97C22A] transition-colors"
//                     />
//                   </div>
//                 </div>

//                 {/* Shop List */}
//                 <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  
//                   <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex items-center justify-between">
//                     <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
//                       {searchQuery ? 'Search Results' : 'Assigned Shops (Sorted by Distance)'}
//                     </h4>
//                   </div>

//                   {isLocating ? (
//                     <div className="flex flex-col items-center justify-center py-12">
//                       <div className="w-6 h-6 border-2 border-[#97C22A] border-t-transparent rounded-full animate-spin mb-3"></div>
//                       <p className="text-[12px] font-bold text-slate-400">Locking coordinates...</p>
//                     </div>
//                   ) : sortedAndFilteredShops.length === 0 ? (
//                     <div className="p-8 text-center">
//                       <p className="text-[13px] font-bold text-slate-700">No shops found.</p>
//                       <p className="text-[11px] font-medium text-slate-500 mt-1">Try a different search.</p>
//                     </div>
//                   ) : (
//                     <div className="divide-y divide-slate-100">
//                       {sortedAndFilteredShops.map(shop => (
//                         <div key={shop.id} className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                          
//                           <div className="flex items-start sm:items-center gap-3 min-w-0">
//                             <div className={`mt-1 sm:mt-0 w-2.5 h-2.5 rounded-full shrink-0 ${shop.status === 'COMPLETED' ? 'bg-[#97C22A]' : 'bg-slate-200'}`} />
//                             <div className="flex-1 min-w-0">
//                               <h4 className="text-[14px] md:text-[15px] font-bold text-slate-800 truncate">{shop.name}</h4>
//                               <p className="text-[11px] md:text-[12px] font-medium text-slate-500 truncate mt-0.5">{shop.address}</p>
                              
//                               <div className="flex items-center gap-3 mt-1.5">
//                                 {/* Distance Indicator */}
//                                 {shop.distance !== undefined && shop.distance < 999999 && (
//                                   <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">
//                                     {shop.distance < 1000 ? `${shop.distance}m away` : `${(shop.distance/1000).toFixed(1)}km away`}
//                                   </span>
//                                 )}
                                
//                                 {/* Last Visited Indicator */}
//                                 {shop.lastVisited && (
//                                   <span className="text-[10px] font-bold" style={{ color: shop.status === 'COMPLETED' ? '#97C22A' : '#94a3b8' }}>
//                                     {shop.status === 'COMPLETED' ? '✓ ' : ''}{shop.lastVisited}
//                                   </span>
//                                 )}
//                               </div>
//                             </div>
//                           </div>

//                           <div className="shrink-0 sm:ml-auto">
//                             {shop.status === 'COMPLETED' ? (
//                               <div className="inline-flex items-center gap-1.5 bg-[#97C22A]/10 border border-[#97C22A]/20 rounded-md px-3 py-2">
//                                 <svg className="w-4 h-4 text-[#97C22A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
//                                 <span className="text-[11px] font-bold text-[#97C22A] uppercase tracking-wider">Visited</span>
//                               </div>
//                             ) : (
//                               <button
//                                 onClick={() => { initiateCheckIn(shop); setIsDealModalOpen(true); }}
//                                 className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0A0F1A] hover:bg-[#97C22A] active:scale-95 rounded-md px-4 py-2.5 transition-all text-white group"
//                               >
//                                 <span className="text-[12px] font-bold group-hover:text-[#0A0F1A] transition-colors">Log Visit</span>
//                                 <svg className="w-4 h-4 text-[#97C22A] group-hover:text-[#0A0F1A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
//                               </button>
//                             )}
//                           </div>

//                         </div>
//                       ))}
//                     </div>
//                   )}

//                 </div>
//               </div>
//             )}
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }


// 'use client';
// import { useState, useRef, useMemo } from 'react';

// // Haversine Distance Calculator (Returns distance in meters)
// function getDistance(lat1, lon1, lat2, lon2) {
//   if (!lat1 || !lon1 || !lat2 || !lon2) return 999999;
//   const R = 6371e3;
//   const p1 = (lat1 * Math.PI) / 180;
//   const p2 = (lat2 * Math.PI) / 180;
//   const dp = ((lat2 - lat1) * Math.PI) / 180;
//   const dl = ((lon2 - lon1) * Math.PI) / 180;
//   const a =
//     Math.sin(dp / 2) * Math.sin(dp / 2) +
//     Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
//   return Math.round(R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))));
// }

// export default function TerritoryTab({
//   targets,
//   isLoadingRoute,
//   initiateCheckIn,
//   totalCommission,
//   setIsDealModalOpen,
//   setPhotoUri,
// }) {
//   const [step, setStep] = useState('camera'); // 'camera' | 'feed'
//   const [localPhoto, setLocalPhoto] = useState(null);
//   const [location, setLocation] = useState(null);
//   const [isLocating, setIsLocating] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const fileInputRef = useRef(null);

//   const visitedCount = targets?.filter((t) => t.status === 'COMPLETED').length || 0;
//   const totalCount = targets?.length || 0;
//   const safeCommission = totalCommission || 0;
//   const progress = totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;

//   // ── CAMERA & GPS LOGIC ──
//   const handleCapture = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setLocalPhoto(reader.result);
//         if (setPhotoUri) setPhotoUri(reader.result);
//         findLocationAndUnlock();
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const findLocationAndUnlock = () => {
//     setIsLocating(true);
//     setStep('feed');
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (pos) => {
//           setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
//           setIsLocating(false);
//         },
//         (err) => {
//           console.warn('GPS Error:', err);
//           alert('Could not get GPS. Use search to find shops.');
//           setIsLocating(false);
//         },
//         { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
//       );
//     } else {
//       setIsLocating(false);
//     }
//   };

//   // ── SMART SORTING & FILTERING ──
//   const sortedAndFilteredShops = useMemo(() => {
//     let result = [...(targets || [])];
//     if (searchQuery.trim().length > 0) {
//       const q = searchQuery.toLowerCase();
//       result = result.filter(
//         (s) =>
//           s.name?.toLowerCase().includes(q) ||
//           s.address?.toLowerCase().includes(q)
//       );
//     } else if (location) {
//       result = result
//         .map((s) => ({
//           ...s,
//           distance: getDistance(location.lat, location.lng, Number(s.latitude), Number(s.longitude)),
//         }))
//         .sort((a, b) => a.distance - b.distance);
//     }
//     return result;
//   }, [targets, searchQuery, location]);

//   return (
//     <div className="flex-1 overflow-y-auto bg-[#F0F2F5]" style={{ WebkitOverflowScrolling: 'touch' }}>

//       {/* Hidden file input */}
//       <input
//         type="file"
//         accept="image/*"
//         capture="environment"
//         ref={fileInputRef}
//         onChange={handleCapture}
//         className="hidden"
//       />

//       {/* ── STICKY HEADER ── */}
//       <div className="sticky top-0 z-30 bg-[#0A0F1A] px-4 lg:px-6 py-3 flex items-center justify-between shadow-md">
//         <div>
//           <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500">Field Sales</p>
//           <p className="text-[15px] font-bold text-white mt-0.5">Territory</p>
//         </div>
//         <div className="flex items-center gap-2">
//           {step === 'feed' && localPhoto && (
//             <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-[#97C22A]/40">
//               <img src={localPhoto} alt="Verified" className="w-full h-full object-cover" />
//             </div>
//           )}
//           <div
//             className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
//             style={{
//               background: 'rgba(151,194,42,0.10)',
//               border: '1px solid rgba(151,194,42,0.2)',
//             }}
//           >
//             <div
//               className={`w-1.5 h-1.5 rounded-full ${step === 'feed' ? 'animate-pulse' : ''}`}
//               style={{ background: step === 'feed' ? '#97C22A' : '#475569' }}
//             />
//             <span
//               className="text-[9px] font-bold tracking-widest uppercase"
//               style={{ color: step === 'feed' ? '#97C22A' : '#64748b' }}
//             >
//               {step === 'feed' ? 'Live' : 'Locked'}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* ── PAGE BODY ── */}
//       <div className="max-w-6xl mx-auto w-full pb-28 lg:pb-12 px-4 lg:px-6 pt-5">
//         <div className="flex flex-col lg:flex-row lg:gap-6 items-start">

//           {/* =========================================
//               LEFT SIDEBAR — Stats
//           ========================================= */}
//           <div className="w-full lg:w-[300px] xl:w-[320px] shrink-0 lg:sticky lg:top-[60px] space-y-3">

//             {/* Shift Overview — dark card */}
//             <div
//               className="bg-[#0A0F1A] rounded-2xl p-5 relative overflow-hidden"
//               style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.18)' }}
//             >
//               <div
//                 className="absolute -top-8 -right-8 w-36 h-36 rounded-full pointer-events-none"
//                 style={{ background: 'radial-gradient(circle, rgba(151,194,42,0.15) 0%, transparent 70%)' }}
//               />

//               <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500 mb-4 relative z-10">
//                 Shift Overview
//               </p>

//               {/* Progress bar */}
//               <div className="relative z-10 mb-4">
//                 <div className="flex items-center justify-between mb-1.5">
//                   <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Progress</span>
//                   <span className="text-[10px] font-bold" style={{ color: '#97C22A' }}>{progress}%</span>
//                 </div>
//                 <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
//                   <div
//                     className="h-full rounded-full transition-all duration-700"
//                     style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#6fa81a,#97C22A)' }}
//                   />
//                 </div>
//               </div>

//               {/* Stats grid */}
//               <div className="grid grid-cols-3 gap-2 relative z-10">
//                 <div
//                   className="rounded-xl p-3 text-center"
//                   style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
//                 >
//                   <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500 mb-1">Target</p>
//                   <p className="text-2xl font-bold text-white leading-none">{totalCount}</p>
//                 </div>
//                 <div
//                   className="rounded-xl p-3 text-center"
//                   style={{ background: 'rgba(151,194,42,0.10)', border: '1px solid rgba(151,194,42,0.2)' }}
//                 >
//                   <p className="text-[9px] font-bold tracking-widest uppercase mb-1" style={{ color: 'rgba(151,194,42,0.7)' }}>Done</p>
//                   <p className="text-2xl font-bold leading-none" style={{ color: '#97C22A' }}>{visitedCount}</p>
//                 </div>
//                 <div
//                   className="rounded-xl p-3 text-center"
//                   style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
//                 >
//                   <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500 mb-1">Left</p>
//                   <p className="text-2xl font-bold text-slate-300 leading-none">{totalCount - visitedCount}</p>
//                 </div>
//               </div>
//             </div>

//             {/* Commission — white card */}
//             <div
//               className="bg-white rounded-2xl p-4 flex items-center justify-between"
//               style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0' }}
//             >
//               <div>
//                 <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500 mb-1">Earned Today</p>
//                 <p className="text-2xl font-bold leading-none" style={{ color: '#1E293B' }}>
//                   ₹{safeCommission >= 1000
//                     ? (safeCommission / 1000).toFixed(1) + 'k'
//                     : safeCommission.toLocaleString('en-IN')}
//                 </p>
//               </div>
//               <div
//                 className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
//                 style={{ background: 'rgba(151,194,42,0.10)', border: '1px solid rgba(151,194,42,0.2)' }}
//               >
//                 <svg className="w-4 h-4" style={{ color: '#97C22A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               </div>
//             </div>

//           </div>

//           {/* =========================================
//               RIGHT — Camera Gate → Feed
//           ========================================= */}
//           <div className="flex-1 min-w-0 w-full mt-3 lg:mt-0">

//             {/* LOADING */}
//             {isLoadingRoute ? (
//               <div
//                 className="bg-white rounded-2xl flex flex-col items-center justify-center py-24 gap-3"
//                 style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0' }}
//               >
//                 <div
//                   className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
//                   style={{ borderColor: '#97C22A', borderTopColor: 'transparent' }}
//                 />
//                 <p className="text-[11px] font-medium text-slate-400">Loading territory…</p>
//               </div>

//             ) : step === 'camera' ? (

//               /* ── CAMERA LOCK SCREEN ── */
//               <div
//                 className="bg-white rounded-2xl p-10 md:p-16 flex flex-col items-center text-center"
//                 style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0' }}
//               >
//                 <div className="relative mb-6">
//                   <div
//                     className="w-16 h-16 rounded-2xl flex items-center justify-center"
//                     style={{ background: 'rgba(151,194,42,0.10)', border: '1px solid rgba(151,194,42,0.2)' }}
//                   >
//                     <svg className="w-7 h-7" style={{ color: '#97C22A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
//                       <circle cx="12" cy="13" r="3" strokeWidth="1.8" />
//                     </svg>
//                   </div>
//                 </div>

//                 <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500 mb-2">Step 1 of 2</p>
//                 <h2 className="text-[15px] font-bold mb-2" style={{ color: '#1E293B' }}>Location Verification</h2>
//                 <p className="text-[11px] font-medium text-slate-400 max-w-[240px] leading-relaxed mb-8">
//                   Take a live photo to unlock your territory and auto-sort shops by distance.
//                 </p>

//                 <button
//                   onClick={() => fileInputRef.current?.click()}
//                   className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-[12px] font-bold text-white active:scale-95 transition-all"
//                   style={{ background: '#0A0F1A' }}
//                 >
//                   <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
//                   </svg>
//                   Open Camera
//                 </button>
//                 <p className="text-[9px] font-bold tracking-widest uppercase text-slate-400 mt-4">GPS + photo required</p>
//               </div>

//             ) : (

//               /* ── RADAR & SHOP FEED ── */
//               <div className="space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-300">

//                 {/* GPS header + search — dark card */}
//                 <div
//                   className="bg-[#0A0F1A] rounded-2xl p-4"
//                   style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.18)' }}
//                 >
//                   <div className="flex items-center justify-between mb-3">
//                     <div className="flex items-center gap-2">
//                       <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#97C22A' }} />
//                       <p className="text-[13px] font-bold text-white">GPS Radar</p>
//                       {isLocating && (
//                         <span className="text-[10px] font-medium text-slate-500">Locking…</span>
//                       )}
//                     </div>
//                     {location && !isLocating && (
//                       <span
//                         className="text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-full"
//                         style={{
//                           color: '#97C22A',
//                           background: 'rgba(151,194,42,0.10)',
//                           border: '1px solid rgba(151,194,42,0.2)',
//                         }}
//                       >
//                         Proximity sorted
//                       </span>
//                     )}
//                   </div>

//                   {/* Search input */}
//                   <div className="relative">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                       </svg>
//                     </div>
//                     <input
//                       type="text"
//                       placeholder="Search shop name or address…"
//                       value={searchQuery}
//                       onChange={(e) => setSearchQuery(e.target.value)}
//                       className="w-full rounded-xl pl-9 pr-9 py-2.5 text-[12px] font-bold text-white placeholder-slate-600 focus:outline-none transition-colors"
//                       style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
//                     />
//                     {searchQuery && (
//                       <button
//                         onClick={() => setSearchQuery('')}
//                         className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
//                       >
//                         <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
//                         </svg>
//                       </button>
//                     )}
//                   </div>
//                 </div>

//                 {/* Shop list — white card */}
//                 <div
//                   className="bg-white rounded-2xl overflow-hidden"
//                   style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0' }}
//                 >
//                   {/* List header */}
//                   <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
//                     <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500">
//                       {searchQuery ? 'Search Results' : 'Assigned Shops'}
//                     </p>
//                     <p className="text-[9px] font-bold tracking-widest uppercase text-slate-400">
//                       {sortedAndFilteredShops.length} shops
//                     </p>
//                   </div>

//                   {/* States */}
//                   {isLocating ? (
//                     <div className="flex flex-col items-center justify-center py-14 gap-2.5">
//                       <div
//                         className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
//                         style={{ borderColor: '#97C22A', borderTopColor: 'transparent' }}
//                       />
//                       <p className="text-[11px] font-medium text-slate-400">Locking coordinates…</p>
//                     </div>
//                   ) : sortedAndFilteredShops.length === 0 ? (
//                     <div className="py-14 text-center px-6">
//                       <div
//                         className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
//                         style={{ background: '#F0F2F5', border: '1px solid #E2E8F0' }}
//                       >
//                         <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                         </svg>
//                       </div>
//                       <p className="text-[13px] font-bold" style={{ color: '#1E293B' }}>No shops found</p>
//                       <p className="text-[11px] font-medium text-slate-400 mt-1">Try a different search term</p>
//                     </div>
//                   ) : (
//                     <div className="divide-y divide-slate-100">
//                       {sortedAndFilteredShops.map((shop, idx) => (
//                         <ShopRow
//                           key={shop.id}
//                           shop={shop}
//                           idx={idx}
//                           onLogVisit={() => {
//                             initiateCheckIn(shop);
//                             setIsDealModalOpen(true);
//                           }}
//                         />
//                       ))}
//                     </div>
//                   )}
//                 </div>

//               </div>
//             )}
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }

// // ── SHOP ROW COMPONENT ──
// function ShopRow({ shop, idx, onLogVisit }) {
//   const isCompleted = shop.status === 'COMPLETED';

//   return (
//     <div
//       className="px-4 py-3.5 flex items-center gap-3 transition-colors"
//       style={{ background: 'transparent' }}
//       onMouseEnter={e => { if (!isCompleted) e.currentTarget.style.background = '#F8FAFC'; }}
//       onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
//     >
//       {/* Index / check bubble */}
//       <div
//         className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold"
//         style={
//           isCompleted
//             ? { background: 'rgba(151,194,42,0.10)', color: '#97C22A', border: '1px solid rgba(151,194,42,0.2)' }
//             : { background: '#F0F2F5', color: '#94A3B8', border: '1px solid #E2E8F0' }
//         }
//       >
//         {isCompleted ? (
//           <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
//           </svg>
//         ) : (
//           idx + 1
//         )}
//       </div>

//       {/* Shop details */}
//       <div className="flex-1 min-w-0">
//         <div className="flex items-center gap-2 flex-wrap">
//           <p
//             className="text-[13px] font-bold truncate"
//             style={{ color: isCompleted ? '#94A3B8' : '#1E293B' }}
//           >
//             {shop.name}
//           </p>
//           {shop.distance !== undefined && shop.distance < 999999 && (
//             <span
//               className="text-[9px] font-bold tracking-widest uppercase shrink-0 px-1.5 py-0.5 rounded-full"
//               style={{
//                 color: '#3b82f6',
//                 background: 'rgba(59,130,246,0.08)',
//                 border: '1px solid rgba(59,130,246,0.15)',
//               }}
//             >
//               {shop.distance < 1000 ? `${shop.distance}m` : `${(shop.distance / 1000).toFixed(1)}km`}
//             </span>
//           )}
//         </div>
//         <p className="text-[11px] font-medium truncate mt-0.5" style={{ color: '#94A3B8' }}>
//           {shop.address}
//         </p>
//         {shop.lastVisited && (
//           <p
//             className="text-[9px] font-bold tracking-widest uppercase mt-1"
//             style={{ color: isCompleted ? '#97C22A' : '#94A3B8' }}
//           >
//             {isCompleted ? '✓ ' : ''}{shop.lastVisited}
//           </p>
//         )}
//       </div>

//       {/* Action */}
//       <div className="shrink-0">
//         {isCompleted ? (
//           <span
//             className="inline-flex items-center gap-1 text-[9px] font-bold tracking-widest uppercase px-2.5 py-1.5 rounded-full"
//             style={{
//               color: '#97C22A',
//               background: 'rgba(151,194,42,0.10)',
//               border: '1px solid rgba(151,194,42,0.2)',
//             }}
//           >
//             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
//             </svg>
//             Visited
//           </span>
//         ) : (
//           <button
//             onClick={onLogVisit}
//             className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold text-white active:scale-95 transition-all"
//             style={{ background: '#0A0F1A' }}
//             onMouseEnter={e => {
//               e.currentTarget.style.background = '#97C22A';
//               e.currentTarget.style.color = '#0A0F1A';
//             }}
//             onMouseLeave={e => {
//               e.currentTarget.style.background = '#0A0F1A';
//               e.currentTarget.style.color = 'white';
//             }}
//           >
//             Log Visit
//             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
//             </svg>
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }


'use client';
import { useState, useRef, useMemo, useEffect } from 'react';

// Haversine Distance Calculator (Returns distance in meters)
function getDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999999;
  const R = 6371e3;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dp / 2) * Math.sin(dp / 2) +
    Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  return Math.round(R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))));
}

export default function TerritoryTab({
  targets,
  isLoadingRoute,
  initiateCheckIn,
  totalCommission,
  setIsDealModalOpen,
  setPhotoUri,
}) {
  const [step, setStep] = useState('camera'); // 'area' | 'camera' | 'feed'
  const [selectedAreas, setSelectedAreas] = useState([]); 
  const [localPhoto, setLocalPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  
  const fileInputRef = useRef(null);
  
  // 🚨 STRICT GEOFENCE LIMIT: Maximum 5km (5000 meters)
  const GEOFENCE_RADIUS_METERS = 5000;

  // Extract unique areas dynamically from the target database objects
  const uniqueAreas = useMemo(() => {
    return [...new Set(targets?.map(t => t.areaName).filter(Boolean))].sort();
  }, [targets]);

  // ── 1. LOAD PERMANENT AREAS ON STARTUP ──
  useEffect(() => {
    setIsMounted(true);
    const savedAreas = localStorage.getItem('assignedSalesAreas');
    if (savedAreas) {
      try {
        const parsed = JSON.parse(savedAreas);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedAreas(parsed);
          return;
        }
      } catch (e) { console.error("Error parsing saved areas"); }
    }
    setStep('area');
  }, []);

  const activeTargets = useMemo(() => {
    if (selectedAreas.length === 0) return [];
    return targets?.filter(t => selectedAreas.includes(t.areaName)) || [];
  }, [targets, selectedAreas]);

  const visitedCount = activeTargets.filter((t) => t.status === 'COMPLETED').length || 0;
  const totalCount = activeTargets.length || 0;
  const safeCommission = totalCommission || 0;
  const progress = totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;

  const toggleArea = (area) => {
    setSelectedAreas(prev => 
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const confirmAreaSelection = () => {
    localStorage.setItem('assignedSalesAreas', JSON.stringify(selectedAreas));
    setStep('camera');
  };

  // ── CAMERA & ULTRA-SMART GEOFENCE LOGIC ──
  const handleCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalPhoto(reader.result);
        if (setPhotoUri) setPhotoUri(reader.result);
        findLocationAndVerifyGeofence();
      };
      reader.readAsDataURL(file);
    }
  };

  const findLocationAndVerifyGeofence = () => {
    setIsLocating(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          
          // Look at ALL shops in the database that have valid GPS
          const allValidTargets = targets?.filter(shop => shop.latitude && shop.longitude) || [];

          if (allValidTargets.length > 0) {
            let closestShop = null;
            let minDistance = Infinity;

            // Find the absolute closest shop to the salesman's current GPS
            allValidTargets.forEach(shop => {
              const dist = getDistance(lat, lng, Number(shop.latitude), Number(shop.longitude));
              if (dist < minDistance) {
                minDistance = dist;
                closestShop = shop;
              }
            });

            // CHECK 1: Are they within 5km of ANY shop?
            if (minDistance > GEOFENCE_RADIUS_METERS) {
              const distKm = (minDistance / 1000).toFixed(1);
              const maxKm = (GEOFENCE_RADIUS_METERS / 1000).toFixed(1);
              
              alert(`🚨 GEOFENCE BLOCKED 🚨\n\nYou are ${distKm}km away from the nearest registered shop in the database.\n\nYou must be within ${maxKm}km of your territory to unlock.`);
              setIsLocating(false);
              setLocalPhoto(null); 
              if (setPhotoUri) setPhotoUri(null);
              setStep('camera'); 
              return;
            }

            // CHECK 2: Is the closest shop actually inside their SELECTED AREA?
            if (closestShop && !selectedAreas.includes(closestShop.areaName)) {
              alert(`🚨 AREA MISMATCH 🚨\n\nYour GPS matches ${closestShop.areaName} (near ${closestShop.name}), but you selected ${selectedAreas.join(', ')}.\n\nPlease edit your Working Territories in the sidebar.`);
              setIsLocating(false);
              setLocalPhoto(null); 
              if (setPhotoUri) setPhotoUri(null);
              setStep('camera'); 
              return;
            }
          }

          // If passed both checks (or if no shops exist in DB yet to compare against), allow access!
          setLocation({ lat, lng });
          setIsLocating(false);
          setStep('feed');
        },
        (err) => {
          console.warn('GPS Error:', err);
          alert('Could not get strict GPS location. Please ensure Location Services are enabled to verify your area.');
          setIsLocating(false);
          setLocalPhoto(null);
          setStep('camera');
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      setIsLocating(false);
      alert('Geolocation is not supported by your browser.');
    }
  };

  const sortedAndFilteredShops = useMemo(() => {
    let result = [...activeTargets]; 
    
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.address?.toLowerCase().includes(q)
      );
    } else if (location) {
      result = result
        .map((s) => ({
          ...s,
          distance: getDistance(location.lat, location.lng, Number(s.latitude), Number(s.longitude)),
        }))
        .sort((a, b) => a.distance - b.distance);
    }
    return result;
  }, [activeTargets, searchQuery, location]);

  if (!isMounted) return null; 

  return (
    <div className="flex-1 overflow-y-auto bg-[#F0F2F5]" style={{ WebkitOverflowScrolling: 'touch' }}>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleCapture}
        className="hidden"
      />

      {/* ── STICKY HEADER ── */}
      <div className="sticky top-0 z-30 bg-[#0A0F1A] px-4 lg:px-6 py-3 flex items-center justify-between shadow-md">
        <div>
          <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500">Operating Territory</p>
          <p className="text-[15px] font-bold text-white mt-0.5 truncate max-w-[200px]">
            {step === 'area' ? 'Assignment Required' : selectedAreas.length > 0 ? selectedAreas.join(', ') : 'No Area'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {step === 'feed' && localPhoto && (
            <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-[#97C22A]/40">
              <img src={localPhoto} alt="Verified" className="w-full h-full object-cover" />
            </div>
          )}
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
            style={{ background: 'rgba(151,194,42,0.10)', border: '1px solid rgba(151,194,42,0.2)' }}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${step === 'feed' ? 'animate-pulse' : ''}`}
              style={{ background: step === 'feed' ? '#97C22A' : '#475569' }}
            />
            <span
              className="text-[9px] font-bold tracking-widest uppercase"
              style={{ color: step === 'feed' ? '#97C22A' : '#64748b' }}
            >
              {step === 'area' ? 'Setup' : step === 'camera' ? 'Locked' : 'Verified'}
            </span>
          </div>
        </div>
      </div>

      {/* ── PAGE BODY ── */}
      <div className="max-w-6xl mx-auto w-full pb-28 lg:pb-12 px-4 lg:px-6 pt-5">
        <div className="flex flex-col lg:flex-row lg:gap-6 items-start">

          {/* =========================================
              LEFT SIDEBAR — Selected Areas & Stats
          ========================================= */}
          <div className="w-full lg:w-[300px] xl:w-[320px] shrink-0 lg:sticky lg:top-[60px] space-y-3">

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E2E8F0]">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-[9px] font-bold tracking-widest uppercase text-slate-500">Working Territories</label>
                <button 
                  onClick={() => {
                    setStep('area');
                    setLocalPhoto(null);
                    setLocation(null);
                    if (setPhotoUri) setPhotoUri(null);
                  }} 
                  className="w-6 h-6 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 rounded-full flex items-center justify-center transition-colors active:scale-95"
                  title="Change Areas"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedAreas.length > 0 ? selectedAreas.map(a => (
                  <span key={a} className="bg-[#F0F2F5] border border-[#E2E8F0] text-[#1E293B] text-[10px] font-bold px-2.5 py-1.5 rounded-md">
                    {a}
                  </span>
                )) : <span className="text-[11px] text-slate-400 font-medium">None selected</span>}
              </div>
            </div>

            <div className="bg-[#0A0F1A] rounded-2xl p-5 relative overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.18)' }}>
              <div
                className="absolute -top-8 -right-8 w-36 h-36 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(151,194,42,0.15) 0%, transparent 70%)' }}
              />

              <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500 mb-4 relative z-10">Combined Target</p>

              <div className="relative z-10 mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Completion</span>
                  <span className="text-[10px] font-bold" style={{ color: '#97C22A' }}>{progress}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#6fa81a,#97C22A)' }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 relative z-10">
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500 mb-1">Target</p>
                  <p className="text-2xl font-bold text-white leading-none">{totalCount}</p>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(151,194,42,0.10)', border: '1px solid rgba(151,194,42,0.2)' }}>
                  <p className="text-[9px] font-bold tracking-widest uppercase mb-1" style={{ color: 'rgba(151,194,42,0.7)' }}>Done</p>
                  <p className="text-2xl font-bold leading-none" style={{ color: '#97C22A' }}>{visitedCount}</p>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500 mb-1">Left</p>
                  <p className="text-2xl font-bold text-slate-300 leading-none">{totalCount - visitedCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 flex items-center justify-between" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0' }}>
              <div>
                <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500 mb-1">Earned Today</p>
                <p className="text-2xl font-bold leading-none" style={{ color: '#1E293B' }}>
                  ₹{safeCommission >= 1000 ? (safeCommission / 1000).toFixed(1) + 'k' : safeCommission.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(151,194,42,0.10)', border: '1px solid rgba(151,194,42,0.2)' }}>
                <svg className="w-4 h-4" style={{ color: '#97C22A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

          </div>

          {/* =========================================
              RIGHT — Main Workflow Container
          ========================================= */}
          <div className="flex-1 min-w-0 w-full mt-3 lg:mt-0">

            {isLoadingRoute ? (
              <div className="bg-white rounded-2xl flex flex-col items-center justify-center py-24 gap-3 border border-[#E2E8F0] shadow-sm">
                <div className="w-6 h-6 rounded-full border-2 border-[#97C22A] border-t-transparent animate-spin" />
                <p className="text-[11px] font-medium text-slate-400">Loading territory…</p>
              </div>

            ) : step === 'area' ? (

              <AreaSelector 
                areas={uniqueAreas} 
                selectedAreas={selectedAreas}
                onToggleArea={toggleArea} 
                onConfirm={confirmAreaSelection}
              />

            ) : step === 'camera' ? (

              <div className="bg-white rounded-2xl p-10 md:p-16 flex flex-col items-center text-center animate-in zoom-in-95 duration-300 border border-[#E2E8F0] shadow-sm">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(151,194,42,0.10)', border: '1px solid rgba(151,194,42,0.2)' }}>
                    <svg className="w-7 h-7" style={{ color: '#97C22A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <circle cx="12" cy="13" r="3" strokeWidth="1.8" />
                    </svg>
                  </div>
                </div>

                <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500 mb-2">Security Verification</p>
                <h2 className="text-[15px] font-bold mb-2 text-[#1E293B]">Field Geofence Check</h2>
                <p className="text-[11px] font-medium text-slate-400 max-w-[280px] leading-relaxed mb-8">
                  Take a live photo to verify your GPS location matches your selected territories and unlock your shops.
                </p>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLocating || selectedAreas.length === 0}
                  className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-[12px] font-bold text-white active:scale-95 transition-all shadow-md disabled:opacity-50"
                  style={{ background: '#0A0F1A' }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                  {isLocating ? 'Verifying Coordinates...' : 'Open Camera to Unlock'}
                </button>
                <p className="text-[9px] font-bold tracking-widest uppercase text-slate-400 mt-4">Strict Geofencing Active</p>
              </div>

            ) : (

              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-300">

                <div className="bg-[#0A0F1A] rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-[#97C22A]" />
                      <p className="text-[13px] font-bold text-white">Geofence Verified</p>
                    </div>
                    {location && !isLocating && (
                      <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-full text-[#97C22A] border border-[#97C22A]/20 bg-[#97C22A]/10">
                        Proximity sorted
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search within selected areas…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl pl-9 pr-9 py-2.5 text-[12px] font-bold text-white placeholder-slate-600 focus:outline-none transition-colors"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-sm">
                  <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                    <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500">
                      {searchQuery ? 'Search Results' : 'Territory Shops'}
                    </p>
                    <p className="text-[9px] font-bold tracking-widest uppercase text-slate-400">
                      {sortedAndFilteredShops.length} shops
                    </p>
                  </div>

                  {sortedAndFilteredShops.length === 0 ? (
                    <div className="py-14 text-center px-6">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: '#F0F2F5', border: '1px solid #E2E8F0' }}>
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      </div>
                      <p className="text-[13px] font-bold text-[#1E293B]">No shops found</p>
                      <p className="text-[11px] font-medium text-slate-400 mt-1">Try a different search term or edit areas.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {sortedAndFilteredShops.map((shop, idx) => (
                        <ShopRow
                          key={shop.id}
                          shop={shop}
                          idx={idx}
                          onLogVisit={() => {
                            initiateCheckIn(shop);
                            setIsDealModalOpen(true);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

function AreaSelector({ areas, selectedAreas, onToggleArea, onConfirm }) {
  if (areas.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center border border-[#E2E8F0] shadow-sm animate-in zoom-in-95">
        <h2 className="text-[15px] font-bold text-[#1E293B] mb-2">No Territories Assigned</h2>
        <p className="text-[12px] text-slate-500">You do not have any shops assigned to your route yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 md:p-10 border border-[#E2E8F0] shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300 text-center">
      <h2 className="text-[16px] font-bold text-[#1E293B] mb-2">Select Your Territories</h2>
      <p className="text-[11px] font-medium text-[#94A3B8] max-w-[300px] mx-auto mb-8 leading-relaxed">
        Choose one or more areas you are working in today. You must physically be inside your selected territory to unlock the feed.
      </p>

      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {areas.map((area) => {
          const isSelected = selectedAreas.includes(area);
          return (
            <button
              key={area}
              onClick={() => onToggleArea(area)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all active:scale-95 border ${
                isSelected 
                  ? 'bg-[#97C22A]/10 border-[#97C22A]/30 text-[#97C22A]' 
                  : 'bg-[#F0F2F5] border-transparent text-[#1E293B] hover:bg-[#E2E8F0]'
              }`}
            >
              {isSelected && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>}
              {area}
            </button>
          )
        })}
      </div>

      <button
        onClick={onConfirm}
        disabled={selectedAreas.length === 0}
        className="w-full max-w-[260px] mx-auto bg-[#0A0F1A] text-white hover:bg-[#97C22A] hover:text-[#0A0F1A] disabled:opacity-50 disabled:pointer-events-none rounded-xl py-3.5 font-bold text-[13px] uppercase tracking-wider transition-all shadow-sm"
      >
        Confirm & Continue
      </button>
    </div>
  );
}

function ShopRow({ shop, idx, onLogVisit }) {
  const isCompleted = shop.status === 'COMPLETED';

  return (
    <div
      className="px-4 py-3.5 flex items-center gap-3 transition-colors"
      style={{ background: 'transparent' }}
      onMouseEnter={e => { if (!isCompleted) e.currentTarget.style.background = '#F8FAFC'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      <div
        className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold"
        style={
          isCompleted
            ? { background: 'rgba(151,194,42,0.10)', color: '#97C22A', border: '1px solid rgba(151,194,42,0.2)' }
            : { background: '#F0F2F5', color: '#94A3B8', border: '1px solid #E2E8F0' }
        }
      >
        {isCompleted ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg> : idx + 1}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[13px] font-bold truncate" style={{ color: isCompleted ? '#94A3B8' : '#1E293B' }}>{shop.name}</p>
          {shop.distance !== undefined && shop.distance < 999999 && (
            <span
              className="text-[9px] font-bold tracking-widest uppercase shrink-0 px-1.5 py-0.5 rounded-full"
              style={{ color: '#3b82f6', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}
            >
              {shop.distance < 1000 ? `${shop.distance}m` : `${(shop.distance / 1000).toFixed(1)}km`}
            </span>
          )}
        </div>
        <p className="text-[11px] font-medium truncate mt-0.5" style={{ color: '#94A3B8' }}>{shop.address}</p>
        {shop.lastVisited && (
          <p className="text-[9px] font-bold tracking-widest uppercase mt-1" style={{ color: isCompleted ? '#97C22A' : '#94A3B8' }}>
            {isCompleted ? '✓ ' : ''}{shop.lastVisited}
          </p>
        )}
      </div>

      <div className="shrink-0">
        {isCompleted ? (
          <span
            className="inline-flex items-center gap-1 text-[9px] font-bold tracking-widest uppercase px-2.5 py-1.5 rounded-full"
            style={{ color: '#97C22A', background: 'rgba(151,194,42,0.10)', border: '1px solid rgba(151,194,42,0.2)' }}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
            Visited
          </span>
        ) : (
          <button
            onClick={onLogVisit}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold text-white active:scale-95 transition-all shadow-sm"
            style={{ background: '#0A0F1A' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#97C22A'; e.currentTarget.style.color = '#0A0F1A'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#0A0F1A'; e.currentTarget.style.color = 'white'; }}
          >
            Log Visit
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
          </button>
        )}
      </div>
    </div>
  );
}