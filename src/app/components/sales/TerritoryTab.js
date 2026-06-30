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


// 'use client';
// import { useState, useRef, useMemo, useEffect } from 'react';

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
//   const [step, setStep] = useState('camera'); // 'area' | 'camera' | 'feed'
//   const [selectedAreas, setSelectedAreas] = useState([]); 
//   const [localPhoto, setLocalPhoto] = useState(null);
//   const [location, setLocation] = useState(null);
//   const [isLocating, setIsLocating] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [isMounted, setIsMounted] = useState(false);
  
//   const fileInputRef = useRef(null);
  
//   // 🚨 STRICT GEOFENCE LIMIT: Maximum 5km (5000 meters)
//   const GEOFENCE_RADIUS_METERS = 5000;

//   // Extract unique areas dynamically from the target database objects
//   const uniqueAreas = useMemo(() => {
//     return [...new Set(targets?.map(t => t.areaName).filter(Boolean))].sort();
//   }, [targets]);

//   // ── 1. LOAD PERMANENT AREAS ON STARTUP ──
//   useEffect(() => {
//     setIsMounted(true);
//     const savedAreas = localStorage.getItem('assignedSalesAreas');
//     if (savedAreas) {
//       try {
//         const parsed = JSON.parse(savedAreas);
//         if (Array.isArray(parsed) && parsed.length > 0) {
//           setSelectedAreas(parsed);
//           return;
//         }
//       } catch (e) { console.error("Error parsing saved areas"); }
//     }
//     setStep('area');
//   }, []);

//   const activeTargets = useMemo(() => {
//     if (selectedAreas.length === 0) return [];
//     return targets?.filter(t => selectedAreas.includes(t.areaName)) || [];
//   }, [targets, selectedAreas]);

//   const visitedCount = activeTargets.filter((t) => t.status === 'COMPLETED').length || 0;
//   const totalCount = activeTargets.length || 0;
//   const safeCommission = totalCommission || 0;
//   const progress = totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;

//   const toggleArea = (area) => {
//     setSelectedAreas(prev => 
//       prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
//     );
//   };

//   const confirmAreaSelection = () => {
//     localStorage.setItem('assignedSalesAreas', JSON.stringify(selectedAreas));
//     setStep('camera');
//   };

//   // ── CAMERA & ULTRA-SMART GEOFENCE LOGIC ──
//   const handleCapture = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setLocalPhoto(reader.result);
//         if (setPhotoUri) setPhotoUri(reader.result);
//         findLocationAndVerifyGeofence();
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const findLocationAndVerifyGeofence = () => {
//     setIsLocating(true);
    
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (pos) => {
//           const lat = pos.coords.latitude;
//           const lng = pos.coords.longitude;
          
//           // Look at ALL shops in the database that have valid GPS
//           const allValidTargets = targets?.filter(shop => shop.latitude && shop.longitude) || [];

//           if (allValidTargets.length > 0) {
//             let closestShop = null;
//             let minDistance = Infinity;

//             // Find the absolute closest shop to the salesman's current GPS
//             allValidTargets.forEach(shop => {
//               const dist = getDistance(lat, lng, Number(shop.latitude), Number(shop.longitude));
//               if (dist < minDistance) {
//                 minDistance = dist;
//                 closestShop = shop;
//               }
//             });

//             // CHECK 1: Are they within 5km of ANY shop?
//             if (minDistance > GEOFENCE_RADIUS_METERS) {
//               const distKm = (minDistance / 1000).toFixed(1);
//               const maxKm = (GEOFENCE_RADIUS_METERS / 1000).toFixed(1);
              
//               alert(`🚨 GEOFENCE BLOCKED 🚨\n\nYou are ${distKm}km away from the nearest registered shop in the database.\n\nYou must be within ${maxKm}km of your territory to unlock.`);
//               setIsLocating(false);
//               setLocalPhoto(null); 
//               if (setPhotoUri) setPhotoUri(null);
//               setStep('camera'); 
//               return;
//             }

//             // CHECK 2: Is the closest shop actually inside their SELECTED AREA?
//             if (closestShop && !selectedAreas.includes(closestShop.areaName)) {
//               alert(`🚨 AREA MISMATCH 🚨\n\nYour GPS matches ${closestShop.areaName} (near ${closestShop.name}), but you selected ${selectedAreas.join(', ')}.\n\nPlease edit your Working Territories in the sidebar.`);
//               setIsLocating(false);
//               setLocalPhoto(null); 
//               if (setPhotoUri) setPhotoUri(null);
//               setStep('camera'); 
//               return;
//             }
//           }

//           // If passed both checks (or if no shops exist in DB yet to compare against), allow access!
//           setLocation({ lat, lng });
//           setIsLocating(false);
//           setStep('feed');
//         },
//         (err) => {
//           console.warn('GPS Error:', err);
//           alert('Could not get strict GPS location. Please ensure Location Services are enabled to verify your area.');
//           setIsLocating(false);
//           setLocalPhoto(null);
//           setStep('camera');
//         },
//         { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
//       );
//     } else {
//       setIsLocating(false);
//       alert('Geolocation is not supported by your browser.');
//     }
//   };

//   const sortedAndFilteredShops = useMemo(() => {
//     let result = [...activeTargets]; 
    
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
//   }, [activeTargets, searchQuery, location]);

//   if (!isMounted) return null; 

//   return (
//     <div className="flex-1 overflow-y-auto bg-[#F0F2F5]" style={{ WebkitOverflowScrolling: 'touch' }}>

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
//           <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500">Operating Territory</p>
//           <p className="text-[15px] font-bold text-white mt-0.5 truncate max-w-[200px]">
//             {step === 'area' ? 'Assignment Required' : selectedAreas.length > 0 ? selectedAreas.join(', ') : 'No Area'}
//           </p>
//         </div>
//         <div className="flex items-center gap-2">
//           {step === 'feed' && localPhoto && (
//             <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-[#97C22A]/40">
//               <img src={localPhoto} alt="Verified" className="w-full h-full object-cover" />
//             </div>
//           )}
//           <div
//             className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
//             style={{ background: 'rgba(151,194,42,0.10)', border: '1px solid rgba(151,194,42,0.2)' }}
//           >
//             <div
//               className={`w-1.5 h-1.5 rounded-full ${step === 'feed' ? 'animate-pulse' : ''}`}
//               style={{ background: step === 'feed' ? '#97C22A' : '#475569' }}
//             />
//             <span
//               className="text-[9px] font-bold tracking-widest uppercase"
//               style={{ color: step === 'feed' ? '#97C22A' : '#64748b' }}
//             >
//               {step === 'area' ? 'Setup' : step === 'camera' ? 'Locked' : 'Verified'}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* ── PAGE BODY ── */}
//       <div className="max-w-6xl mx-auto w-full pb-28 lg:pb-12 px-4 lg:px-6 pt-5">
//         <div className="flex flex-col lg:flex-row lg:gap-6 items-start">

//           {/* =========================================
//               LEFT SIDEBAR — Selected Areas & Stats
//           ========================================= */}
//           <div className="w-full lg:w-[300px] xl:w-[320px] shrink-0 lg:sticky lg:top-[60px] space-y-3">

//             <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E2E8F0]">
//               <div className="flex items-center justify-between mb-3">
//                 <label className="block text-[9px] font-bold tracking-widest uppercase text-slate-500">Working Territories</label>
//                 <button 
//                   onClick={() => {
//                     setStep('area');
//                     setLocalPhoto(null);
//                     setLocation(null);
//                     if (setPhotoUri) setPhotoUri(null);
//                   }} 
//                   className="w-6 h-6 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 rounded-full flex items-center justify-center transition-colors active:scale-95"
//                   title="Change Areas"
//                 >
//                   <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
//                 </button>
//               </div>
//               <div className="flex flex-wrap gap-1.5">
//                 {selectedAreas.length > 0 ? selectedAreas.map(a => (
//                   <span key={a} className="bg-[#F0F2F5] border border-[#E2E8F0] text-[#1E293B] text-[10px] font-bold px-2.5 py-1.5 rounded-md">
//                     {a}
//                   </span>
//                 )) : <span className="text-[11px] text-slate-400 font-medium">None selected</span>}
//               </div>
//             </div>

//             <div className="bg-[#0A0F1A] rounded-2xl p-5 relative overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.18)' }}>
//               <div
//                 className="absolute -top-8 -right-8 w-36 h-36 rounded-full pointer-events-none"
//                 style={{ background: 'radial-gradient(circle, rgba(151,194,42,0.15) 0%, transparent 70%)' }}
//               />

//               <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500 mb-4 relative z-10">Combined Target</p>

//               <div className="relative z-10 mb-4">
//                 <div className="flex items-center justify-between mb-1.5">
//                   <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Completion</span>
//                   <span className="text-[10px] font-bold" style={{ color: '#97C22A' }}>{progress}%</span>
//                 </div>
//                 <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
//                   <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#6fa81a,#97C22A)' }} />
//                 </div>
//               </div>

//               <div className="grid grid-cols-3 gap-2 relative z-10">
//                 <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
//                   <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500 mb-1">Target</p>
//                   <p className="text-2xl font-bold text-white leading-none">{totalCount}</p>
//                 </div>
//                 <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(151,194,42,0.10)', border: '1px solid rgba(151,194,42,0.2)' }}>
//                   <p className="text-[9px] font-bold tracking-widest uppercase mb-1" style={{ color: 'rgba(151,194,42,0.7)' }}>Done</p>
//                   <p className="text-2xl font-bold leading-none" style={{ color: '#97C22A' }}>{visitedCount}</p>
//                 </div>
//                 <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
//                   <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500 mb-1">Left</p>
//                   <p className="text-2xl font-bold text-slate-300 leading-none">{totalCount - visitedCount}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white rounded-2xl p-4 flex items-center justify-between" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0' }}>
//               <div>
//                 <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500 mb-1">Earned Today</p>
//                 <p className="text-2xl font-bold leading-none" style={{ color: '#1E293B' }}>
//                   ₹{safeCommission >= 1000 ? (safeCommission / 1000).toFixed(1) + 'k' : safeCommission.toLocaleString('en-IN')}
//                 </p>
//               </div>
//               <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(151,194,42,0.10)', border: '1px solid rgba(151,194,42,0.2)' }}>
//                 <svg className="w-4 h-4" style={{ color: '#97C22A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               </div>
//             </div>

//           </div>

//           {/* =========================================
//               RIGHT — Main Workflow Container
//           ========================================= */}
//           <div className="flex-1 min-w-0 w-full mt-3 lg:mt-0">

//             {isLoadingRoute ? (
//               <div className="bg-white rounded-2xl flex flex-col items-center justify-center py-24 gap-3 border border-[#E2E8F0] shadow-sm">
//                 <div className="w-6 h-6 rounded-full border-2 border-[#97C22A] border-t-transparent animate-spin" />
//                 <p className="text-[11px] font-medium text-slate-400">Loading territory…</p>
//               </div>

//             ) : step === 'area' ? (

//               <AreaSelector 
//                 areas={uniqueAreas} 
//                 selectedAreas={selectedAreas}
//                 onToggleArea={toggleArea} 
//                 onConfirm={confirmAreaSelection}
//               />

//             ) : step === 'camera' ? (

//               <div className="bg-white rounded-2xl p-10 md:p-16 flex flex-col items-center text-center animate-in zoom-in-95 duration-300 border border-[#E2E8F0] shadow-sm">
//                 <div className="relative mb-6">
//                   <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(151,194,42,0.10)', border: '1px solid rgba(151,194,42,0.2)' }}>
//                     <svg className="w-7 h-7" style={{ color: '#97C22A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
//                       <circle cx="12" cy="13" r="3" strokeWidth="1.8" />
//                     </svg>
//                   </div>
//                 </div>

//                 <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500 mb-2">Security Verification</p>
//                 <h2 className="text-[15px] font-bold mb-2 text-[#1E293B]">Field Geofence Check</h2>
//                 <p className="text-[11px] font-medium text-slate-400 max-w-[280px] leading-relaxed mb-8">
//                   Take a live photo to verify your GPS location matches your selected territories and unlock your shops.
//                 </p>

//                 <button
//                   onClick={() => fileInputRef.current?.click()}
//                   disabled={isLocating || selectedAreas.length === 0}
//                   className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-[12px] font-bold text-white active:scale-95 transition-all shadow-md disabled:opacity-50"
//                   style={{ background: '#0A0F1A' }}
//                 >
//                   <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
//                   </svg>
//                   {isLocating ? 'Verifying Coordinates...' : 'Open Camera to Unlock'}
//                 </button>
//                 <p className="text-[9px] font-bold tracking-widest uppercase text-slate-400 mt-4">Strict Geofencing Active</p>
//               </div>

//             ) : (

//               <div className="space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-300">

//                 <div className="bg-[#0A0F1A] rounded-2xl p-4 shadow-sm">
//                   <div className="flex items-center justify-between mb-3">
//                     <div className="flex items-center gap-2">
//                       <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-[#97C22A]" />
//                       <p className="text-[13px] font-bold text-white">Geofence Verified</p>
//                     </div>
//                     {location && !isLocating && (
//                       <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-full text-[#97C22A] border border-[#97C22A]/20 bg-[#97C22A]/10">
//                         Proximity sorted
//                       </span>
//                     )}
//                   </div>

//                   <div className="relative">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                       </svg>
//                     </div>
//                     <input
//                       type="text"
//                       placeholder="Search within selected areas…"
//                       value={searchQuery}
//                       onChange={(e) => setSearchQuery(e.target.value)}
//                       className="w-full rounded-xl pl-9 pr-9 py-2.5 text-[12px] font-bold text-white placeholder-slate-600 focus:outline-none transition-colors"
//                       style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
//                     />
//                     {searchQuery && (
//                       <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
//                         <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
//                       </button>
//                     )}
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-sm">
//                   <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
//                     <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500">
//                       {searchQuery ? 'Search Results' : 'Territory Shops'}
//                     </p>
//                     <p className="text-[9px] font-bold tracking-widest uppercase text-slate-400">
//                       {sortedAndFilteredShops.length} shops
//                     </p>
//                   </div>

//                   {sortedAndFilteredShops.length === 0 ? (
//                     <div className="py-14 text-center px-6">
//                       <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: '#F0F2F5', border: '1px solid #E2E8F0' }}>
//                         <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
//                       </div>
//                       <p className="text-[13px] font-bold text-[#1E293B]">No shops found</p>
//                       <p className="text-[11px] font-medium text-slate-400 mt-1">Try a different search term or edit areas.</p>
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

// function AreaSelector({ areas, selectedAreas, onToggleArea, onConfirm }) {
//   if (areas.length === 0) {
//     return (
//       <div className="bg-white rounded-2xl p-10 text-center border border-[#E2E8F0] shadow-sm animate-in zoom-in-95">
//         <h2 className="text-[15px] font-bold text-[#1E293B] mb-2">No Territories Assigned</h2>
//         <p className="text-[12px] text-slate-500">You do not have any shops assigned to your route yet.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white rounded-2xl p-6 md:p-10 border border-[#E2E8F0] shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300 text-center">
//       <h2 className="text-[16px] font-bold text-[#1E293B] mb-2">Select Your Territories</h2>
//       <p className="text-[11px] font-medium text-[#94A3B8] max-w-[300px] mx-auto mb-8 leading-relaxed">
//         Choose one or more areas you are working in today. You must physically be inside your selected territory to unlock the feed.
//       </p>

//       <div className="flex flex-wrap justify-center gap-3 mb-10">
//         {areas.map((area) => {
//           const isSelected = selectedAreas.includes(area);
//           return (
//             <button
//               key={area}
//               onClick={() => onToggleArea(area)}
//               className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all active:scale-95 border ${
//                 isSelected 
//                   ? 'bg-[#97C22A]/10 border-[#97C22A]/30 text-[#97C22A]' 
//                   : 'bg-[#F0F2F5] border-transparent text-[#1E293B] hover:bg-[#E2E8F0]'
//               }`}
//             >
//               {isSelected && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>}
//               {area}
//             </button>
//           )
//         })}
//       </div>

//       <button
//         onClick={onConfirm}
//         disabled={selectedAreas.length === 0}
//         className="w-full max-w-[260px] mx-auto bg-[#0A0F1A] text-white hover:bg-[#97C22A] hover:text-[#0A0F1A] disabled:opacity-50 disabled:pointer-events-none rounded-xl py-3.5 font-bold text-[13px] uppercase tracking-wider transition-all shadow-sm"
//       >
//         Confirm & Continue
//       </button>
//     </div>
//   );
// }

// function ShopRow({ shop, idx, onLogVisit }) {
//   const isCompleted = shop.status === 'COMPLETED';

//   return (
//     <div
//       className="px-4 py-3.5 flex items-center gap-3 transition-colors"
//       style={{ background: 'transparent' }}
//       onMouseEnter={e => { if (!isCompleted) e.currentTarget.style.background = '#F8FAFC'; }}
//       onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
//     >
//       <div
//         className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold"
//         style={
//           isCompleted
//             ? { background: 'rgba(151,194,42,0.10)', color: '#97C22A', border: '1px solid rgba(151,194,42,0.2)' }
//             : { background: '#F0F2F5', color: '#94A3B8', border: '1px solid #E2E8F0' }
//         }
//       >
//         {isCompleted ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg> : idx + 1}
//       </div>

//       <div className="flex-1 min-w-0">
//         <div className="flex items-center gap-2 flex-wrap">
//           <p className="text-[13px] font-bold truncate" style={{ color: isCompleted ? '#94A3B8' : '#1E293B' }}>{shop.name}</p>
//           {shop.distance !== undefined && shop.distance < 999999 && (
//             <span
//               className="text-[9px] font-bold tracking-widest uppercase shrink-0 px-1.5 py-0.5 rounded-full"
//               style={{ color: '#3b82f6', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}
//             >
//               {shop.distance < 1000 ? `${shop.distance}m` : `${(shop.distance / 1000).toFixed(1)}km`}
//             </span>
//           )}
//         </div>
//         <p className="text-[11px] font-medium truncate mt-0.5" style={{ color: '#94A3B8' }}>{shop.address}</p>
//         {shop.lastVisited && (
//           <p className="text-[9px] font-bold tracking-widest uppercase mt-1" style={{ color: isCompleted ? '#97C22A' : '#94A3B8' }}>
//             {isCompleted ? '✓ ' : ''}{shop.lastVisited}
//           </p>
//         )}
//       </div>

//       <div className="shrink-0">
//         {isCompleted ? (
//           <span
//             className="inline-flex items-center gap-1 text-[9px] font-bold tracking-widest uppercase px-2.5 py-1.5 rounded-full"
//             style={{ color: '#97C22A', background: 'rgba(151,194,42,0.10)', border: '1px solid rgba(151,194,42,0.2)' }}
//           >
//             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
//             Visited
//           </span>
//         ) : (
//           <button
//             onClick={onLogVisit}
//             className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold text-white active:scale-95 transition-all shadow-sm"
//             style={{ background: '#0A0F1A' }}
//             onMouseEnter={e => { e.currentTarget.style.background = '#97C22A'; e.currentTarget.style.color = '#0A0F1A'; }}
//             onMouseLeave={e => { e.currentTarget.style.background = '#0A0F1A'; e.currentTarget.style.color = 'white'; }}
//           >
//             Log Visit
//             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

// 'use client';
// import { useState, useRef, useMemo, useEffect } from 'react';

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

// const C = {
//   green: '#2E7D32',
//   greenBg: '#F1F8F1',
//   greenBorder: '#A5D6A7',
//   greenMid: '#43A047',
//   navy: '#1A2332',
//   text: '#1A2332',
//   textMuted: '#64748B',
//   textFaint: '#94A3B8',
//   border: '#E2E8F0',
//   surface: '#FFFFFF',
//   bg: '#F8FAFC',
//   blue: '#1D4ED8',
//   blueBg: '#EFF6FF',
//   blueBorder: '#BFDBFE',
// };

// export default function TerritoryTab({
//   targets,
//   masterTerritories,
//   masterAreas,       
//   isLoadingRoute,
//   initiateCheckIn,
//   totalCommission,
//   setIsDealModalOpen,
//   setPhotoUri,
// }) {
//   const [step, setStep] = useState('camera');
//   const [selectedAreas, setSelectedAreas] = useState([]);
//   const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
//   const [localPhoto, setLocalPhoto] = useState(null);
//   const [location, setLocation] = useState(null);
//   const [isLocating, setIsLocating] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [isMounted, setIsMounted] = useState(false);

//   const fileInputRef = useRef(null);
//   const dropdownRef = useRef(null);
  
//   // 5KM Radius Limit
//   const GEOFENCE_RADIUS_METERS = 5000;

//   const uniqueAreas = useMemo(() => {
//     const fromMasterTerritories = Array.isArray(masterTerritories) ? masterTerritories.map(a => a.name) : [];
//     const fromMasterAreas = Array.isArray(masterAreas) ? masterAreas.map(a => a.name) : [];
//     const fromTargets = Array.isArray(targets) ? targets.map(t => t.areaName) : [];
    
//     return [...new Set([...fromMasterTerritories, ...fromMasterAreas, ...fromTargets]
//       .filter(Boolean)
//       .filter(name => name !== 'Unassigned Area')
//     )].sort();
//   }, [targets, masterTerritories, masterAreas]);

//   useEffect(() => {
//     setIsMounted(true);
//     const saved = localStorage.getItem('assignedSalesAreas');
//     if (saved) {
//       try {
//         const parsed = JSON.parse(saved);
//         if (Array.isArray(parsed) && parsed.length > 0) setSelectedAreas(parsed);
//       } catch {}
//     }
//   }, []);

//   useEffect(() => {
//     const handler = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target))
//         setIsAreaDropdownOpen(false);
//     };
//     document.addEventListener('mousedown', handler);
//     return () => document.removeEventListener('mousedown', handler);
//   }, []);

//   const toggleArea = (area) => {
//     const next = selectedAreas.includes(area)
//       ? selectedAreas.filter((a) => a !== area)
//       : [...selectedAreas, area];
//     setSelectedAreas(next);
//     localStorage.setItem('assignedSalesAreas', JSON.stringify(next));
//     setStep('camera');
//     setLocalPhoto(null);
//     setLocation(null);
//     if (setPhotoUri) setPhotoUri(null);
//   };

//   const activeTargets = useMemo(() => {
//     if (selectedAreas.length === 0) return [];
//     return targets?.filter((t) => selectedAreas.includes(t.areaName)) || [];
//   }, [targets, selectedAreas]);

//   const visitedCount = activeTargets.filter((t) => t.status === 'COMPLETED').length || 0;
//   const totalCount = activeTargets.length || 0;
//   const safeCommission = totalCommission || 0;
//   const progress = totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;

//   const handleCapture = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setLocalPhoto(reader.result);
//       if (setPhotoUri) setPhotoUri(reader.result);
//       verifyGeofence();
//     };
//     reader.readAsDataURL(file);
//   };

//   const verifyGeofence = () => {
//     setIsLocating(true);
//     if (!navigator.geolocation) {
//       alert('Geolocation is not supported.');
//       setIsLocating(false);
//       return;
//     }
//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         const lat = pos.coords.latitude;
//         const lng = pos.coords.longitude;
        
//         // 1. Get shops inside the SELECTED area that have GPS
//         const areaShops = targets?.filter(
//           (s) => s.latitude && s.longitude && selectedAreas.includes(s.areaName)
//         ) || [];
        
//         if (areaShops.length > 0) {
//           // STANDARD GEOFENCE: The selected area has known GPS shops
//           let minDist = Infinity;
//           areaShops.forEach((s) => {
//             const d = getDistance(lat, lng, Number(s.latitude), Number(s.longitude));
//             if (d < minDist) minDist = d;
//           });
//           if (minDist > GEOFENCE_RADIUS_METERS) {
//             alert(
//               `📍 Outside territory\n\nYou are ${(minDist / 1000).toFixed(1)}km from the nearest shop in ${selectedAreas.join(', ')}. Move within ${GEOFENCE_RADIUS_METERS / 1000}km to unlock.`
//             );
//             setIsLocating(false);
//             setLocalPhoto(null);
//             if (setPhotoUri) setPhotoUri(null);
//             return;
//           }
//         } else {
//           // 🚨 ANTI-SPOOFING CHECK: The selected area is brand new (0 GPS shops).
//           // Let's make sure they aren't standing inside a DIFFERENT known area!
//           const otherShops = targets?.filter(
//             (s) => s.latitude && s.longitude && !selectedAreas.includes(s.areaName)
//           ) || [];
          
//           if (otherShops.length > 0) {
//             let closestOtherShop = null;
//             let minOtherDist = Infinity;
            
//             otherShops.forEach((s) => {
//               const d = getDistance(lat, lng, Number(s.latitude), Number(s.longitude));
//               if (d < minOtherDist) {
//                 minOtherDist = d;
//                 closestOtherShop = s;
//               }
//             });
            
//             // If they are within 5km of a Kolhapur shop, but selected Sangli -> BLOCK!
//             if (minOtherDist <= GEOFENCE_RADIUS_METERS) {
//               alert(`🚨 AREA MISMATCH\n\nYou selected ${selectedAreas.join(', ')}, but your GPS shows you are actually in ${closestOtherShop.areaName} (Near ${closestOtherShop.name}).\n\nPlease go back and select the correct operating area.`);
//               setIsLocating(false);
//               setLocalPhoto(null);
//               if (setPhotoUri) setPhotoUri(null);
//               return;
//             }
//           }
//         }

//         // Passed all checks!
//         setLocation({ lat, lng });
//         setIsLocating(false);
//         setStep('feed');
//       },
//       () => {
//         alert('Could not get location. Enable Location Services and try again.');
//         setIsLocating(false);
//         setLocalPhoto(null);
//         if (setPhotoUri) setPhotoUri(null);
//       },
//       { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
//     );
//   };

//   const sortedShops = useMemo(() => {
//     let result = [...activeTargets];
//     if (searchQuery.trim()) {
//       const q = searchQuery.toLowerCase();
//       result = result.filter(
//         (s) => s.name?.toLowerCase().includes(q) || s.address?.toLowerCase().includes(q)
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
//   }, [activeTargets, searchQuery, location]);

//   if (!isMounted) return null;

//   return (
//     <div style={{ flex: 1, overflowY: 'auto', background: C.bg, WebkitOverflowScrolling: 'touch' }}>
//       <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleCapture} style={{ display: 'none' }} />

//       {/* ══ STICKY HEADER ══ */}
//       <div
//         ref={dropdownRef}
//         style={{
//           position: 'sticky', top: 0, zIndex: 30,
//           background: C.surface,
//           borderBottom: `1px solid ${C.border}`,
//         }}
//       >
//         <div style={{ padding: '14px 20px 12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
//           {/* Left */}
//           <div style={{ flex: 1, minWidth: 0 }}>
//             <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', color: C.textFaint, textTransform: 'uppercase', margin: '0 0 6px' }}>
//               Operating Territory
//             </p>
//             <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
//               {selectedAreas.length === 0 ? (
//                 <span style={{ fontSize: 13, color: C.textMuted, fontStyle: 'italic' }}>No area selected</span>
//               ) : (
//                 selectedAreas.map((a) => (
//                   <span key={a} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: C.green, background: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: 20, padding: '3px 8px 3px 10px' }}>
//                     {a}
//                     <button onClick={() => toggleArea(a)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: C.green, opacity: 0.55 }}>
//                       <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
//                     </button>
//                   </span>
//                 ))
//               )}
//               <button
//                 onClick={() => setIsAreaDropdownOpen((p) => !p)}
//                 style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: isAreaDropdownOpen ? C.surface : C.green, background: isAreaDropdownOpen ? C.green : C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: 20, padding: '3px 10px', cursor: 'pointer' }}
//               >
//                 <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
//                   {isAreaDropdownOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M12 4v16M4 12h16" />}
//                 </svg>
//                 {isAreaDropdownOpen ? 'Close' : 'Add area'}
//               </button>
//             </div>
//           </div>

//           {/* Right: status */}
//           <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: step === 'feed' ? C.greenBg : '#F1F5F9', border: `1px solid ${step === 'feed' ? C.greenBorder : C.border}`, flexShrink: 0, marginTop: 2 }}>
//             <span style={{ width: 6, height: 6, borderRadius: '50%', background: step === 'feed' ? C.greenMid : C.textFaint, display: 'inline-block' }} />
//             <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: step === 'feed' ? C.green : C.textMuted }}>
//               {step === 'camera' ? 'Locked' : 'Verified'}
//             </span>
//             {step === 'feed' && localPhoto && (
//               <img src={localPhoto} alt="" style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover', border: `1.5px solid ${C.greenBorder}`, marginLeft: 2 }} />
//             )}
//           </div>
//         </div>

//         {/* Area dropdown */}
//         {isAreaDropdownOpen && (
//           <div style={{ margin: '0 16px 14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.09)' }}>
//             {uniqueAreas.length === 0 ? (
//               <p style={{ padding: '14px 16px', fontSize: 13, color: C.textMuted, margin: 0 }}>No territories in data.</p>
//             ) : (
//               <>
//                 <div style={{ padding: '12px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
//                   {uniqueAreas.map((area) => {
//                     const sel = selectedAreas.includes(area);
//                     return (
//                       <button
//                         key={area}
//                         onClick={() => toggleArea(area)}
//                         style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, padding: '7px 14px', borderRadius: 8, border: `1px solid ${sel ? C.greenBorder : C.border}`, background: sel ? C.greenBg : C.bg, color: sel ? C.green : C.text, cursor: 'pointer' }}
//                       >
//                         {sel && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>}
//                         {area}
//                       </button>
//                     );
//                   })}
//                 </div>
//                 <div style={{ padding: '8px 12px 12px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'flex-end' }}>
//                   <button
//                     onClick={() => setIsAreaDropdownOpen(false)}
//                     disabled={selectedAreas.length === 0}
//                     style={{ fontSize: 13, fontWeight: 600, padding: '7px 22px', borderRadius: 8, border: 'none', background: selectedAreas.length > 0 ? C.green : C.border, color: selectedAreas.length > 0 ? '#fff' : C.textMuted, cursor: selectedAreas.length > 0 ? 'pointer' : 'not-allowed' }}
//                   >
//                     Done
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>
//         )}
//       </div>

//       {/* ══ BODY ══ */}
//       <div style={{ maxWidth: 1100, margin: '0 auto', padding: '18px 16px 80px', display: 'flex', flexDirection: 'column', gap: 14 }}>

//         {/* Stats — only when area selected */}
//         {selectedAreas.length > 0 && (
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>

//             {/* Progress card spans 2 cols */}
//             <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px', gridColumn: 'span 2' }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
//                 <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: C.textFaint }}>Daily progress</span>
//                 <span style={{ fontSize: 13, fontWeight: 700, color: C.green }}>{progress}%</span>
//               </div>
//               <div style={{ height: 4, background: '#EFF2F7', borderRadius: 99, overflow: 'hidden', marginBottom: 14 }}>
//                 <div style={{ height: '100%', width: `${progress}%`, background: C.greenMid, borderRadius: 99, transition: 'width 0.6s ease' }} />
//               </div>
//               <div style={{ display: 'flex', gap: 0 }}>
//                 {[
//                   { label: 'Total', val: totalCount, color: C.text },
//                   { label: 'Done', val: visitedCount, color: C.green },
//                   { label: 'Left', val: totalCount - visitedCount, color: C.textMuted },
//                 ].map(({ label, val, color }, i) => (
//                   <div key={label} style={{ flex: 1, textAlign: 'center', borderLeft: i > 0 ? `1px solid ${C.border}` : 'none' }}>
//                     <p style={{ fontSize: 24, fontWeight: 700, color, margin: 0, lineHeight: 1 }}>{val}</p>
//                     <p style={{ fontSize: 10, fontWeight: 600, color: C.textFaint, letterSpacing: '0.07em', textTransform: 'uppercase', margin: '5px 0 0' }}>{label}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Commission */}
//             <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px' }}>
//               <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: C.textFaint, display: 'block', marginBottom: 8 }}>Earned today</span>
//               <p style={{ fontSize: 26, fontWeight: 700, color: C.text, margin: 0 }}>
//                 ₹{safeCommission >= 1000 ? (safeCommission / 1000).toFixed(1) + 'k' : safeCommission.toLocaleString('en-IN')}
//               </p>
//             </div>
//           </div>
//         )}

//         {/* Main panel */}
//         {isLoadingRoute ? (
//           <LoadingCard label="Loading territory…" />
//         ) : selectedAreas.length === 0 ? (
//           <EmptyState onAddArea={() => setIsAreaDropdownOpen(true)} />
//         ) : step === 'camera' ? (
//           <CameraGate selectedAreas={selectedAreas} isLocating={isLocating} geofenceKm={GEOFENCE_RADIUS_METERS / 1000} onOpen={() => fileInputRef.current?.click()} />
//         ) : (
//           <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>

//             {/* Search + verified bar */}
//             <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: C.greenBg, border: `1px solid ${C.greenBorder}`, flexShrink: 0 }}>
//                 <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
//                 <span style={{ fontSize: 10, fontWeight: 700, color: C.green, letterSpacing: '0.07em', textTransform: 'uppercase' }}>GPS verified</span>
//               </div>

//               <div style={{ flex: 1, position: 'relative' }}>
//                 <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.textFaint} strokeWidth="2" strokeLinecap="round" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
//                   <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
//                 </svg>
//                 <input
//                   type="text"
//                   placeholder="Search shops or addresses…"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   style={{ width: '100%', fontSize: 13, padding: '7px 30px 7px 30px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.bg, color: C.text, outline: 'none', boxSizing: 'border-box' }}
//                 />
//                 {searchQuery && (
//                   <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.textFaint, padding: 2, display: 'flex' }}>
//                     <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
//                   </button>
//                 )}
//               </div>

//               <span style={{ fontSize: 12, color: C.textFaint, fontWeight: 500, flexShrink: 0 }}>{sortedShops.length} shops</span>
//             </div>

//             {/* Table head */}
//             <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 72px 88px', gap: 8, padding: '7px 16px', background: C.bg, borderBottom: `1px solid ${C.border}` }}>
//               {['#', 'Shop', 'Dist.', ''].map((h, i) => (
//                 <span key={i} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textFaint }}>{h}</span>
//               ))}
//             </div>

//             {/* Rows */}
//             {sortedShops.length === 0 ? (
//               <div style={{ padding: '40px 20px', textAlign: 'center' }}>
//                 <p style={{ fontSize: 14, fontWeight: 600, color: C.text, margin: '0 0 4px' }}>No shops found</p>
//                 <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>Try a different search term.</p>
//               </div>
//             ) : (
//               sortedShops.map((shop, idx) => (
//                 <ShopRow key={shop.id} shop={shop} idx={idx} onLogVisit={() => { initiateCheckIn(shop); setIsDealModalOpen(true); }} />
//               ))
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function ShopRow({ shop, idx, onLogVisit }) {
//   const done = shop.status === 'COMPLETED';
//   const [hov, setHov] = useState(false);
//   return (
//     <div
//       onMouseEnter={() => setHov(true)}
//       onMouseLeave={() => setHov(false)}
//       style={{ display: 'grid', gridTemplateColumns: '32px 1fr 72px 88px', gap: 8, alignItems: 'center', padding: '11px 16px', borderBottom: `1px solid ${C.border}`, background: hov && !done ? C.bg : C.surface, transition: 'background 0.1s' }}
//     >
//       <div style={{ width: 26, height: 26, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: done ? C.greenBg : '#F1F5F9', border: `1px solid ${done ? C.greenBorder : C.border}`, color: done ? C.green : C.textMuted, flexShrink: 0 }}>
//         {done
//           ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
//           : idx + 1}
//       </div>

//       <div style={{ minWidth: 0 }}>
//         <p style={{ fontSize: 13, fontWeight: 600, color: done ? C.textMuted : C.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shop.name}</p>
//         <p style={{ fontSize: 11, color: C.textFaint, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shop.address}</p>
//         {shop.lastVisited && (
//           <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: done ? C.green : C.textFaint, margin: '2px 0 0' }}>
//             {done ? '✓ ' : ''}{shop.lastVisited}
//           </p>
//         )}
//       </div>

//       <div>
//         {shop.distance !== undefined && shop.distance < 999999 ? (
//           <span style={{ display: 'inline-flex', fontSize: 11, fontWeight: 600, color: C.blue, background: C.blueBg, border: `1px solid ${C.blueBorder}`, borderRadius: 6, padding: '3px 7px' }}>
//             {shop.distance < 1000 ? `${shop.distance}m` : `${(shop.distance / 1000).toFixed(1)}km`}
//           </span>
//         ) : null}
//       </div>

//       <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
//         {done ? (
//           <span style={{ fontSize: 11, fontWeight: 600, color: C.green, background: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: 7, padding: '5px 10px' }}>Visited</span>
//         ) : (
//           <button
//             onClick={onLogVisit}
//             style={{ fontSize: 12, fontWeight: 600, color: '#fff', background: C.navy, border: 'none', borderRadius: 7, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
//             onMouseEnter={(e) => { e.currentTarget.style.background = C.green; }}
//             onMouseLeave={(e) => { e.currentTarget.style.background = C.navy; }}
//           >
//             Log visit
//             <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

// function CameraGate({ selectedAreas, isLocating, geofenceKm, onOpen }) {
//   return (
//     <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '52px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
//       <div style={{ width: 54, height: 54, borderRadius: 14, background: C.greenBg, border: `1px solid ${C.greenBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
//         <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
//           <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" />
//         </svg>
//       </div>
//       <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: C.textFaint, margin: '0 0 6px' }}>Security check</p>
//       <h2 style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: '0 0 10px' }}>Field geofence verification</h2>
//       <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', margin: '0 0 12px' }}>
//         {selectedAreas.map((a) => (
//           <span key={a} style={{ fontSize: 12, fontWeight: 600, color: C.green, background: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: 20, padding: '3px 10px' }}>{a}</span>
//         ))}
//       </div>
//       <p style={{ fontSize: 13, color: C.textMuted, maxWidth: 300, lineHeight: 1.6, margin: '0 0 28px' }}>
//         Take a live photo to confirm your GPS location matches your selected territories and unlock your shop list.
//       </p>
//       <button
//         onClick={onOpen}
//         disabled={isLocating}
//         style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#fff', background: isLocating ? C.textFaint : C.navy, border: 'none', borderRadius: 10, padding: '11px 26px', cursor: isLocating ? 'not-allowed' : 'pointer' }}
//         onMouseEnter={(e) => { if (!isLocating) e.currentTarget.style.background = C.green; }}
//         onMouseLeave={(e) => { if (!isLocating) e.currentTarget.style.background = C.navy; }}
//       >
//         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//           <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" />
//         </svg>
//         {isLocating ? 'Verifying location…' : 'Open camera to unlock'}
//       </button>
//       <p style={{ fontSize: 11, color: C.textFaint, margin: '14px 0 0', letterSpacing: '0.05em' }}>Geofence radius · {geofenceKm}km</p>
//     </div>
//   );
// }

// function EmptyState({ onAddArea }) {
//   return (
//     <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '56px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
//       <div style={{ width: 52, height: 52, borderRadius: 14, background: C.greenBg, border: `1px solid ${C.greenBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
//         <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
//           <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
//         </svg>
//       </div>
//       <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: C.textFaint, margin: '0 0 6px' }}>No territory selected</p>
//       <h2 style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: '0 0 8px' }}>Select your working area</h2>
//       <p style={{ fontSize: 13, color: C.textMuted, maxWidth: 260, lineHeight: 1.6, margin: '0 0 24px' }}>
//         Tap <strong style={{ color: C.text }}>Add area</strong> in the header to choose which territories you are working in today.
//       </p>
//       <button
//         onClick={onAddArea}
//         style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#fff', background: C.navy, border: 'none', borderRadius: 9, padding: '10px 22px', cursor: 'pointer' }}
//         onMouseEnter={(e) => { e.currentTarget.style.background = C.green; }}
//         onMouseLeave={(e) => { e.currentTarget.style.background = C.navy; }}
//       >
//         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 4v16M4 12h16" /></svg>
//         Add area
//       </button>
//     </div>
//   );
// }

// function LoadingCard({ label }) {
//   return (
//     <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '52px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
//       <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2.5px solid ${C.greenBorder}`, borderTopColor: C.green, animation: 'spin 0.8s linear infinite' }} />
//       <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>{label}</p>
//       <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
//     </div>
//   );
// }


// 'use client';
// import { useState, useRef, useMemo, useEffect } from 'react';

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

// const C = {
//   green: '#2E7D32',
//   greenBg: '#F1F8F1',
//   greenBorder: '#A5D6A7',
//   greenMid: '#43A047',
//   navy: '#1A2332',
//   text: '#1A2332',
//   textMuted: '#64748B',
//   textFaint: '#94A3B8',
//   border: '#E2E8F0',
//   surface: '#FFFFFF',
//   bg: '#F8FAFC',
//   blue: '#1D4ED8',
//   blueBg: '#EFF6FF',
//   blueBorder: '#BFDBFE',
// };

// export default function TerritoryTab({
//   targets,
//   masterTerritories,
//   masterAreas,       
//   isLoadingRoute,
//   totalCommission,
//   setPhotoUri,
//   onRefreshData // 👈 Use this to refresh the dashboard after logging
// }) {
//   const [step, setStep] = useState('camera'); // 'camera' or 'form'
//   const [selectedAreas, setSelectedAreas] = useState([]);
//   const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
//   const [localPhoto, setLocalPhoto] = useState(null);
//   const [location, setLocation] = useState(null);
//   const [isLocating, setIsLocating] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isMounted, setIsMounted] = useState(false);

//   // Form State
//   const [nearbyShops, setNearbyShops] = useState([]);
//   const [selectedShopId, setSelectedShopId] = useState('');
//   const [formData, setFormData] = useState({
//     orderAmount: '',
//     collectionAmount: '',
//     paymentMethod: 'Cash',
//     remark: ''
//   });

//   const fileInputRef = useRef(null);
//   const dropdownRef = useRef(null);
  
//   // 5KM Radius Limit
//   const GEOFENCE_RADIUS_METERS = 5000;

//   const uniqueAreas = useMemo(() => {
//     const fromMasterTerritories = Array.isArray(masterTerritories) ? masterTerritories.map(a => a.name) : [];
//     const fromMasterAreas = Array.isArray(masterAreas) ? masterAreas.map(a => a.name) : [];
//     const fromTargets = Array.isArray(targets) ? targets.map(t => t.areaName) : [];
    
//     return [...new Set([...fromMasterTerritories, ...fromMasterAreas, ...fromTargets]
//       .filter(Boolean)
//       .filter(name => name !== 'Unassigned Area')
//     )].sort();
//   }, [targets, masterTerritories, masterAreas]);

//   useEffect(() => {
//     setIsMounted(true);
//     const saved = localStorage.getItem('assignedSalesAreas');
//     if (saved) {
//       try {
//         const parsed = JSON.parse(saved);
//         if (Array.isArray(parsed) && parsed.length > 0) setSelectedAreas(parsed);
//       } catch {}
//     }
//   }, []);

//   useEffect(() => {
//     const handler = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target))
//         setIsAreaDropdownOpen(false);
//     };
//     document.addEventListener('mousedown', handler);
//     return () => document.removeEventListener('mousedown', handler);
//   }, []);

//   const toggleArea = (area) => {
//     const next = selectedAreas.includes(area)
//       ? selectedAreas.filter((a) => a !== area)
//       : [...selectedAreas, area];
//     setSelectedAreas(next);
//     localStorage.setItem('assignedSalesAreas', JSON.stringify(next));
//     setStep('camera');
//     setLocalPhoto(null);
//     setLocation(null);
//     if (setPhotoUri) setPhotoUri(null);
//   };

//   const activeTargets = useMemo(() => {
//     if (selectedAreas.length === 0) return [];
//     return targets?.filter((t) => selectedAreas.includes(t.areaName)) || [];
//   }, [targets, selectedAreas]);

//   const visitedCount = activeTargets.filter((t) => t.status === 'COMPLETED').length || 0;
//   const totalCount = activeTargets.length || 0;
//   const safeCommission = totalCommission || 0;
//   const progress = totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;

//   // ── 1. HANDLE CAMERA & GPS ──
//   const handleCapture = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     const reader = new FileReader();
    
//     setIsLocating(true);
//     reader.onloadend = () => {
//       setLocalPhoto(reader.result);
//       if (setPhotoUri) setPhotoUri(reader.result);
//       verifyGeofence();
//     };
//     reader.readAsDataURL(file);
//   };

//   const verifyGeofence = () => {
//     if (!navigator.geolocation) {
//       alert('Geolocation is not supported.');
//       setIsLocating(false);
//       return;
//     }
//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         const lat = pos.coords.latitude;
//         const lng = pos.coords.longitude;
        
//         const areaShops = targets?.filter(
//           (s) => s.latitude && s.longitude && selectedAreas.includes(s.areaName)
//         ) || [];
        
//         if (areaShops.length > 0) {
//           let minDist = Infinity;
//           areaShops.forEach((s) => {
//             const d = getDistance(lat, lng, Number(s.latitude), Number(s.longitude));
//             if (d < minDist) minDist = d;
//           });
//           if (minDist > GEOFENCE_RADIUS_METERS) {
//             alert(
//               `📍 Outside territory\n\nYou are ${(minDist / 1000).toFixed(1)}km from the nearest shop in ${selectedAreas.join(', ')}. Move within ${GEOFENCE_RADIUS_METERS / 1000}km to unlock.`
//             );
//             setIsLocating(false);
//             setLocalPhoto(null);
//             if (setPhotoUri) setPhotoUri(null);
//             return;
//           }
//         } else {
//           // Anti-Spoofing Check
//           const otherShops = targets?.filter(
//             (s) => s.latitude && s.longitude && !selectedAreas.includes(s.areaName)
//           ) || [];
          
//           if (otherShops.length > 0) {
//             let closestOtherShop = null;
//             let minOtherDist = Infinity;
//             otherShops.forEach((s) => {
//               const d = getDistance(lat, lng, Number(s.latitude), Number(s.longitude));
//               if (d < minOtherDist) {
//                 minOtherDist = d;
//                 closestOtherShop = s;
//               }
//             });
//             if (minOtherDist <= GEOFENCE_RADIUS_METERS) {
//               alert(`🚨 AREA MISMATCH\n\nYou selected ${selectedAreas.join(', ')}, but your GPS shows you are actually in ${closestOtherShop.areaName} (Near ${closestOtherShop.name}).\n\nPlease go back and select the correct operating area.`);
//               setIsLocating(false);
//               setLocalPhoto(null);
//               if (setPhotoUri) setPhotoUri(null);
//               return;
//             }
//           }
//         }

//         // Passed all checks! Sort shops by distance and Auto-Select the closest one
//         setLocation({ lat, lng });
        
//         const sorted = activeTargets.map(t => ({
//           ...t,
//           distance: getDistance(lat, lng, Number(t.latitude), Number(t.longitude))
//         })).sort((a, b) => a.distance - b.distance);

//         setNearbyShops(sorted);
//         if (sorted.length > 0) setSelectedShopId(sorted[0].id.toString());
        
//         setIsLocating(false);
//         setStep('form');
//       },
//       () => {
//         alert('Could not get location. Enable Location Services and try again.');
//         setIsLocating(false);
//         setLocalPhoto(null);
//         if (setPhotoUri) setPhotoUri(null);
//       },
//       { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
//     );
//   };

//   // ── 2. HANDLE FORM SUBMISSION ──
//   const handleSubmitVisit = async (e) => {
//     e.preventDefault();
//     if (!selectedShopId) return alert("Please select a medical shop.");
    
//     setIsSubmitting(true);
//     try {
//       const agentId = localStorage.getItem('employeeId') || 'Unknown';

//       const response = await fetch('/api/sales/visits', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           agentId, 
//           targetId: selectedShopId, 
//           latitude: location?.lat, 
//           longitude: location?.lng,
//           photoUrl: localPhoto, 
//           orderAmount: parseFloat(formData.orderAmount) || 0,
//           collectionAmount: parseFloat(formData.collectionAmount) || 0,
//           paymentMethod: formData.paymentMethod,
//           remark: formData.remark
//         }),
//       });
      
//       const data = await response.json();
//       if (!response.ok) throw new Error(data.error || "Failed to log visit.");

//       // Success! Reset form and refresh data silently
//       setStep('camera');
//       setLocalPhoto(null);
//       setLocation(null);
//       setFormData({ orderAmount: '', collectionAmount: '', paymentMethod: 'Cash', remark: '' });
      
//       if (onRefreshData) onRefreshData(); // Tell dashboard to refresh stats
//       else window.location.reload(); // Fallback if prop not passed

//     } catch (err) {
//       console.error("Submission Error:", err);
//       alert(`Error: ${err.message}`);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (!isMounted) return null;

//   return (
//     <div style={{ flex: 1, overflowY: 'auto', background: C.bg, WebkitOverflowScrolling: 'touch' }}>
//       <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleCapture} style={{ display: 'none' }} />

//       {/* ══ STICKY HEADER (UNTOUCHED) ══ */}
//       <div
//         ref={dropdownRef}
//         style={{ position: 'sticky', top: 0, zIndex: 30, background: C.surface, borderBottom: `1px solid ${C.border}` }}
//       >
//         <div style={{ padding: '14px 20px 12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
//           {/* Left */}
//           <div style={{ flex: 1, minWidth: 0 }}>
//             <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', color: C.textFaint, textTransform: 'uppercase', margin: '0 0 6px' }}>
//               Operating Territory
//             </p>
//             <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
//               {selectedAreas.length === 0 ? (
//                 <span style={{ fontSize: 13, color: C.textMuted, fontStyle: 'italic' }}>No area selected</span>
//               ) : (
//                 selectedAreas.map((a) => (
//                   <span key={a} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: C.green, background: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: 20, padding: '3px 8px 3px 10px' }}>
//                     {a}
//                     <button onClick={() => toggleArea(a)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: C.green, opacity: 0.55 }}>
//                       <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
//                     </button>
//                   </span>
//                 ))
//               )}
//               <button
//                 onClick={() => setIsAreaDropdownOpen((p) => !p)}
//                 style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: isAreaDropdownOpen ? C.surface : C.green, background: isAreaDropdownOpen ? C.green : C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: 20, padding: '3px 10px', cursor: 'pointer' }}
//               >
//                 <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
//                   {isAreaDropdownOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M12 4v16M4 12h16" />}
//                 </svg>
//                 {isAreaDropdownOpen ? 'Close' : 'Add area'}
//               </button>
//             </div>
//           </div>

//           {/* Right: status */}
//           <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: step === 'form' ? C.greenBg : '#F1F5F9', border: `1px solid ${step === 'form' ? C.greenBorder : C.border}`, flexShrink: 0, marginTop: 2 }}>
//             <span style={{ width: 6, height: 6, borderRadius: '50%', background: step === 'form' ? C.greenMid : C.textFaint, display: 'inline-block' }} />
//             <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: step === 'form' ? C.green : C.textMuted }}>
//               {step === 'camera' ? 'Locked' : 'Verified'}
//             </span>
//             {step === 'form' && localPhoto && (
//               <img src={localPhoto} alt="" style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover', border: `1.5px solid ${C.greenBorder}`, marginLeft: 2 }} />
//             )}
//           </div>
//         </div>

//         {/* Area dropdown */}
//         {isAreaDropdownOpen && (
//           <div style={{ margin: '0 16px 14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.09)' }}>
//             {uniqueAreas.length === 0 ? (
//               <p style={{ padding: '14px 16px', fontSize: 13, color: C.textMuted, margin: 0 }}>No territories in data.</p>
//             ) : (
//               <>
//                 <div style={{ padding: '12px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
//                   {uniqueAreas.map((area) => {
//                     const sel = selectedAreas.includes(area);
//                     return (
//                       <button
//                         key={area}
//                         onClick={() => toggleArea(area)}
//                         style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, padding: '7px 14px', borderRadius: 8, border: `1px solid ${sel ? C.greenBorder : C.border}`, background: sel ? C.greenBg : C.bg, color: sel ? C.green : C.text, cursor: 'pointer' }}
//                       >
//                         {sel && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>}
//                         {area}
//                       </button>
//                     );
//                   })}
//                 </div>
//                 <div style={{ padding: '8px 12px 12px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'flex-end' }}>
//                   <button onClick={() => setIsAreaDropdownOpen(false)} disabled={selectedAreas.length === 0} style={{ fontSize: 13, fontWeight: 600, padding: '7px 22px', borderRadius: 8, border: 'none', background: selectedAreas.length > 0 ? C.green : C.border, color: selectedAreas.length > 0 ? '#fff' : C.textMuted, cursor: selectedAreas.length > 0 ? 'pointer' : 'not-allowed' }}>
//                     Done
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>
//         )}
//       </div>

//       {/* ══ BODY ══ */}
//       <div style={{ maxWidth: 1100, margin: '0 auto', padding: '18px 16px 80px', display: 'flex', flexDirection: 'column', gap: 14 }}>

//         {/* Stats — only when area selected (UNTOUCHED) */}
//         {selectedAreas.length > 0 && (
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
//             <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px', gridColumn: 'span 2' }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
//                 <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: C.textFaint }}>Daily progress</span>
//                 <span style={{ fontSize: 13, fontWeight: 700, color: C.green }}>{progress}%</span>
//               </div>
//               <div style={{ height: 4, background: '#EFF2F7', borderRadius: 99, overflow: 'hidden', marginBottom: 14 }}>
//                 <div style={{ height: '100%', width: `${progress}%`, background: C.greenMid, borderRadius: 99, transition: 'width 0.6s ease' }} />
//               </div>
//               <div style={{ display: 'flex', gap: 0 }}>
//                 {[
//                   { label: 'Total', val: totalCount, color: C.text },
//                   { label: 'Done', val: visitedCount, color: C.green },
//                   { label: 'Left', val: totalCount - visitedCount, color: C.textMuted },
//                 ].map(({ label, val, color }, i) => (
//                   <div key={label} style={{ flex: 1, textAlign: 'center', borderLeft: i > 0 ? `1px solid ${C.border}` : 'none' }}>
//                     <p style={{ fontSize: 24, fontWeight: 700, color, margin: 0, lineHeight: 1 }}>{val}</p>
//                     <p style={{ fontSize: 10, fontWeight: 600, color: C.textFaint, letterSpacing: '0.07em', textTransform: 'uppercase', margin: '5px 0 0' }}>{label}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//             <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px' }}>
//               <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: C.textFaint, display: 'block', marginBottom: 8 }}>Earned today</span>
//               <p style={{ fontSize: 26, fontWeight: 700, color: C.text, margin: 0 }}>
//                 ₹{safeCommission >= 1000 ? (safeCommission / 1000).toFixed(1) + 'k' : safeCommission.toLocaleString('en-IN')}
//               </p>
//             </div>
//           </div>
//         )}

//         {/* ══ DYNAMIC PANEL (CAMERA vs FORM) ══ */}
//         {isLoadingRoute ? (
//           <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '52px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
//             <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2.5px solid ${C.greenBorder}`, borderTopColor: C.green, animation: 'spin 0.8s linear infinite' }} />
//             <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>Loading territory…</p>
//             <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
//           </div>
//         ) : selectedAreas.length === 0 ? (
//           <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '56px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
//             <div style={{ width: 52, height: 52, borderRadius: 14, background: C.greenBg, border: `1px solid ${C.greenBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
//               <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
//             </div>
//             <h2 style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: '0 0 8px' }}>Select your working area</h2>
//             <p style={{ fontSize: 13, color: C.textMuted, maxWidth: 260, lineHeight: 1.6, margin: '0 0 24px' }}>Tap <strong>Add area</strong> in the header to choose which territories you are working in today.</p>
//             <button onClick={() => setIsAreaDropdownOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#fff', background: C.navy, border: 'none', borderRadius: 9, padding: '10px 22px', cursor: 'pointer' }}>
//               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 4v16M4 12h16" /></svg> Add area
//             </button>
//           </div>
//         ) : step === 'camera' ? (
//           <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '52px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
//             <div style={{ w: 54, height: 54, borderRadius: 14, background: C.greenBg, border: `1px solid ${C.greenBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, padding: 10 }}>
//               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>
//             </div>
//             <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: C.textFaint, margin: '0 0 6px' }}>Security check</p>
//             <h2 style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: '0 0 10px' }}>Field Check-In</h2>
//             <p style={{ fontSize: 13, color: C.textMuted, maxWidth: 300, lineHeight: 1.6, margin: '0 0 28px' }}>
//               Take a photo of the shop. We will use your GPS to automatically fill the form for you.
//             </p>
//             <button onClick={() => fileInputRef.current?.click()} disabled={isLocating} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#fff', background: isLocating ? C.textFaint : C.navy, border: 'none', borderRadius: 10, padding: '12px 30px', cursor: isLocating ? 'not-allowed' : 'pointer' }}>
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>
//               {isLocating ? 'Analyzing GPS...' : 'Take Photo to Unlock'}
//             </button>
//           </div>
//         ) : (
//           /* =========================================
//              FAST CHECK-IN FORM (AUTO DETECTED)
//           ========================================= */
//           <div className="animate-in slide-in-from-bottom-4 duration-300">
//             {/* Photo Preview Header */}
//             <div style={{ background: C.surface, padding: 12, borderRadius: 14, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: `1px solid ${C.border}`, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
//               <img src={localPhoto} alt="Captured" style={{ width: 60, height: 60, borderRadius: 10, objectFit: 'cover', border: `1px solid ${C.border}` }} />
//               <div style={{ flex: 1 }}>
//                 <p style={{ fontSize: 10, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 4 }}>
//                   <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg> GPS Verified
//                 </p>
//                 <button onClick={() => setStep('camera')} style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, textDecoration: 'underline', background: 'none', border: 'none', padding: 0, marginTop: 4, cursor: 'pointer' }}>Retake Photo</button>
//               </div>
//             </div>

//             <form onSubmit={handleSubmitVisit} style={{ background: C.surface, borderRadius: 16, padding: '24px 20px', border: `1px solid ${C.border}`, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              
//               {/* DROPDOWN (AUTO-SELECTED) */}
//               <div style={{ marginBottom: 20 }}>
//                 <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Detected Medical Shop</label>
//                 <select 
//                   value={selectedShopId}
//                   onChange={(e) => setSelectedShopId(e.target.value)}
//                   required
//                   style={{ width: '100%', padding: '12px 16px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, fontWeight: 700, color: C.text, outline: 'none' }}
//                 >
//                   <option value="" disabled>Select a shop...</option>
//                   {nearbyShops.map((shop, idx) => (
//                     <option key={shop.id} value={shop.id}>
//                       {idx === 0 ? '📍 (Nearest) ' : ''}{shop.name} {shop.distance < 999999 ? `- ${(shop.distance / 1000).toFixed(1)}km` : ''}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* AMOUNTS */}
//               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
//                 <div>
//                   <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Order Vol (₹)</label>
//                   <input 
//                     type="number" 
//                     value={formData.orderAmount}
//                     onChange={(e) => setFormData({...formData, orderAmount: e.target.value})}
//                     placeholder="0"
//                     style={{ width: '100%', padding: '12px 16px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, fontWeight: 700, color: C.text, outline: 'none' }}
//                   />
//                 </div>
//                 <div>
//                   <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Collection (₹)</label>
//                   <input 
//                     type="number" 
//                     value={formData.collectionAmount}
//                     onChange={(e) => setFormData({...formData, collectionAmount: e.target.value})}
//                     placeholder="0"
//                     style={{ width: '100%', padding: '12px 16px', background: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: 10, fontSize: 14, fontWeight: 700, color: C.text, outline: 'none' }}
//                   />
//                 </div>
//               </div>

//               {/* PAYMENT METHOD */}
//               <div style={{ marginBottom: 20 }}>
//                 <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Payment Method</label>
//                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
//                   {['Cash', 'UPI', 'Cheque', 'Credit'].map((method) => (
//                     <button
//                       key={method}
//                       type="button"
//                       onClick={() => setFormData({...formData, paymentMethod: method})}
//                       style={{ padding: '10px 0', fontSize: 12, fontWeight: 700, borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s', border: formData.paymentMethod === method ? `1px solid ${C.navy}` : `1px solid ${C.border}`, background: formData.paymentMethod === method ? C.navy : C.bg, color: formData.paymentMethod === method ? '#fff' : C.textMuted }}
//                     >
//                       {method}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* REMARK */}
//               <div style={{ marginBottom: 24 }}>
//                 <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Remark / Note</label>
//                 <textarea 
//                   value={formData.remark}
//                   onChange={(e) => setFormData({...formData, remark: e.target.value})}
//                   placeholder="Optional notes regarding this visit..."
//                   rows="2"
//                   style={{ width: '100%', padding: '12px 16px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, fontWeight: 500, color: C.text, outline: 'none', resize: 'none' }}
//                 ></textarea>
//               </div>

//               {/* SUBMIT BUTTON */}
//               <div style={{ paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
//                 <button 
//                   type="submit" 
//                   disabled={isSubmitting}
//                   style={{ width: '100%', padding: '14px', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 15, background: C.greenMid, border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: isSubmitting ? 0.7 : 1 }}
//                 >
//                   {isSubmitting ? 'Submitting...' : 'Log This Visit'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



'use client';
import { useState, useRef, useMemo, useEffect } from 'react';

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

// ━━━ DESIGN TOKENS ━━━
const C = {
  dark: '#0A0F1A',
  green: '#97C22A',
  greenSoft: 'rgba(151,194,42,0.10)',
  greenSoftBorder: 'rgba(151,194,42,0.30)',
  surface: '#F0F2F5',
  card: '#FFFFFF',
  border: '#E2E8F0',
  muted: '#94A3B8',
  text: '#1E293B',
};

export default function TerritoryTab({
  targets,
  masterTerritories,
  masterAreas,
  isLoadingRoute,
  totalCommission,
  setPhotoUri,
  onRefreshData
}) {
  const [step, setStep] = useState('camera');
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
  const [localPhoto, setLocalPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [nearbyShops, setNearbyShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState('');
  const [formData, setFormData] = useState({
    orderAmount: '',
    collectionAmount: '',
    paymentMethod: 'Cash',
    remark: ''
  });

  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const GEOFENCE_RADIUS_METERS = 1000;

  const uniqueAreas = useMemo(() => {
    const fromMasterTerritories = Array.isArray(masterTerritories) ? masterTerritories.map(a => a.name) : [];
    const fromMasterAreas = Array.isArray(masterAreas) ? masterAreas.map(a => a.name) : [];
    const fromTargets = Array.isArray(targets) ? targets.map(t => t.areaName) : [];

    return [...new Set([...fromMasterTerritories, ...fromMasterAreas, ...fromTargets]
      .filter(Boolean)
      .filter(name => name !== 'Unassigned Area')
    )].sort();
  }, [targets, masterTerritories, masterAreas]);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('assignedSalesAreas');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setSelectedAreas(parsed);
      } catch {}
    }
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsAreaDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleArea = (area) => {
    const next = selectedAreas.includes(area)
      ? selectedAreas.filter((a) => a !== area)
      : [...selectedAreas, area];
    setSelectedAreas(next);
    localStorage.setItem('assignedSalesAreas', JSON.stringify(next));
    setStep('camera');
    setLocalPhoto(null);
    setLocation(null);
    if (setPhotoUri) setPhotoUri(null);
  };

  const activeTargets = useMemo(() => {
    if (selectedAreas.length === 0) return [];
    return targets?.filter((t) => selectedAreas.includes(t.areaName)) || [];
  }, [targets, selectedAreas]);

  const visitedCount = activeTargets.filter((t) => t.status === 'COMPLETED').length || 0;
  const totalCount = activeTargets.length || 0;
  const safeCommission = totalCommission || 0;
  const progress = totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;

// ── 1. HANDLE CAMERA, COMPRESS IMAGE & GET GPS ──
  const handleCapture = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsLocating(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // 1. Set Maximum dimensions to prevent massive file sizes
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        // 2. Calculate the new size while keeping the aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= Math.round(MAX_WIDTH / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= Math.round(MAX_HEIGHT / height);
            height = MAX_HEIGHT;
          }
        }

        // 3. Draw the resized image on a hidden canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // 4. Compress into a lightweight JPEG (70% quality)
        const compressedPhoto = canvas.toDataURL('image/jpeg', 0.7);
        
        // 5. Save the lightweight photo and move to GPS check
        setLocalPhoto(compressedPhoto);
        if (setPhotoUri) setPhotoUri(compressedPhoto);
        
        verifyGeofence();
      };
      
      // Feed the raw file into the image object to start the compression
      img.src = event.target.result;
    };
    
    reader.readAsDataURL(file);
  };
  const verifyGeofence = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported.');
      setIsLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        const areaShops = targets?.filter(
          (s) => s.latitude && s.longitude && selectedAreas.includes(s.areaName)
        ) || [];

        if (areaShops.length > 0) {
          let minDist = Infinity;
          areaShops.forEach((s) => {
            const d = getDistance(lat, lng, Number(s.latitude), Number(s.longitude));
            if (d < minDist) minDist = d;
          });
          if (minDist > GEOFENCE_RADIUS_METERS) {
            alert(
              `📍 Outside territory\n\nYou are ${(minDist / 1000).toFixed(1)}km from the nearest shop in ${selectedAreas.join(', ')}. Move within ${GEOFENCE_RADIUS_METERS / 1000}km to unlock.`
            );
            setIsLocating(false);
            setLocalPhoto(null);
            if (setPhotoUri) setPhotoUri(null);
            return;
          }
        } else {
          const otherShops = targets?.filter(
            (s) => s.latitude && s.longitude && !selectedAreas.includes(s.areaName)
          ) || [];

          if (otherShops.length > 0) {
            let closestOtherShop = null;
            let minOtherDist = Infinity;
            otherShops.forEach((s) => {
              const d = getDistance(lat, lng, Number(s.latitude), Number(s.longitude));
              if (d < minOtherDist) {
                minOtherDist = d;
                closestOtherShop = s;
              }
            });
            if (minOtherDist <= GEOFENCE_RADIUS_METERS) {
              alert(`🚨 AREA MISMATCH\n\nYou selected ${selectedAreas.join(', ')}, but your GPS shows you are actually in ${closestOtherShop.areaName} (Near ${closestOtherShop.name}).\n\nPlease go back and select the correct operating area.`);
              setIsLocating(false);
              setLocalPhoto(null);
              if (setPhotoUri) setPhotoUri(null);
              return;
            }
          }
        }

        setLocation({ lat, lng });

        const sorted = activeTargets.map(t => ({
          ...t,
          distance: getDistance(lat, lng, Number(t.latitude), Number(t.longitude))
        })).sort((a, b) => a.distance - b.distance);

        setNearbyShops(sorted);
        if (sorted.length > 0) setSelectedShopId(sorted[0].id.toString());

        setIsLocating(false);
        setStep('form');
      },
      () => {
        alert('Could not get location. Enable Location Services and try again.');
        setIsLocating(false);
        setLocalPhoto(null);
        if (setPhotoUri) setPhotoUri(null);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSubmitVisit = async (e) => {
    e.preventDefault();
    if (!selectedShopId) return alert("Please select a medical shop.");

    setIsSubmitting(true);
    try {
      const agentId = localStorage.getItem('employeeId') || 'Unknown';

      const response = await fetch('/api/sales/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          targetId: selectedShopId,
          latitude: location?.lat,
          longitude: location?.lng,
          photoUrl: localPhoto,
          orderAmount: parseFloat(formData.orderAmount) || 0,
          collectionAmount: parseFloat(formData.collectionAmount) || 0,
          paymentMethod: formData.paymentMethod,
          remark: formData.remark
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to log visit.");

      setStep('camera');
      setLocalPhoto(null);
      setLocation(null);
      setFormData({ orderAmount: '', collectionAmount: '', paymentMethod: 'Cash', remark: '' });

      if (onRefreshData) onRefreshData();
      else window.location.reload();

    } catch (err) {
      console.error("Submission Error:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: C.surface, WebkitOverflowScrolling: 'touch' }}>
      <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleCapture} style={{ display: 'none' }} />

      {/* ══ STICKY HEADER — dark navy ══ */}
      <div
        ref={dropdownRef}
        style={{ position: 'sticky', top: 0, zIndex: 30, background: C.dark }}
      >
        <div style={{ padding: '12px 16px 10px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', margin: '0 0 6px' }}>
              Operating Territory
            </p>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 5 }}>
              {selectedAreas.length === 0 ? (
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>No area selected</span>
              ) : (
                selectedAreas.map((a) => (
                  <span key={a} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: C.green, background: C.greenSoft, border: `1px solid ${C.greenSoftBorder}`, borderRadius: 20, padding: '3px 7px 3px 9px' }}>
                    {a}
                    <button onClick={() => toggleArea(a)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: C.green, opacity: 0.6 }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                  </span>
                ))
              )}
              <button
                onClick={() => setIsAreaDropdownOpen((p) => !p)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: isAreaDropdownOpen ? C.dark : C.green, background: isAreaDropdownOpen ? C.green : C.greenSoft, border: `1px solid ${C.greenSoftBorder}`, borderRadius: 20, padding: '3px 9px' }}
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                  {isAreaDropdownOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M12 4v16M4 12h16" />}
                </svg>
                {isAreaDropdownOpen ? 'Close' : 'Add area'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: step === 'form' ? C.greenSoft : 'rgba(255,255,255,0.06)', border: `1px solid ${step === 'form' ? C.greenSoftBorder : 'rgba(255,255,255,0.1)'}`, flexShrink: 0, marginTop: 2 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: step === 'form' ? C.green : 'rgba(255,255,255,0.3)', display: 'inline-block' }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: step === 'form' ? C.green : 'rgba(255,255,255,0.5)' }}>
              {step === 'camera' ? 'Locked' : 'Verified'}
            </span>
            {step === 'form' && localPhoto && (
              <img src={localPhoto} alt="" style={{ width: 16, height: 16, borderRadius: '50%', objectFit: 'cover', border: `1px solid ${C.greenSoftBorder}`, marginLeft: 2 }} />
            )}
          </div>
        </div>

        {isAreaDropdownOpen && (
          <div style={{ margin: '0 12px 12px', background: C.card, borderRadius: 14, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}>
            {uniqueAreas.length === 0 ? (
              <p style={{ padding: '14px 16px', fontSize: 12, color: C.muted, margin: 0 }}>No territories in data.</p>
            ) : (
              <>
                <div style={{ padding: '10px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {uniqueAreas.map((area) => {
                    const sel = selectedAreas.includes(area);
                    return (
                      <button
                        key={area}
                        onClick={() => toggleArea(area)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, padding: '7px 12px', borderRadius: 8, border: sel ? `1px solid ${C.greenSoftBorder}` : `1px solid ${C.border}`, background: sel ? C.greenSoft : C.surface, color: sel ? '#5C7A1A' : C.text, cursor: 'pointer' }}
                      >
                        {sel && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#5C7A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>}
                        {area}
                      </button>
                    );
                  })}
                </div>
                <div style={{ padding: '8px 10px 10px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => setIsAreaDropdownOpen(false)} disabled={selectedAreas.length === 0} style={{ fontSize: 12, fontWeight: 600, padding: '8px 20px', borderRadius: 8, border: 'none', background: selectedAreas.length > 0 ? C.dark : C.border, color: selectedAreas.length > 0 ? C.green : C.muted, cursor: selectedAreas.length > 0 ? 'pointer' : 'not-allowed' }}>
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ══ BODY ══ */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '14px 14px 70px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {selectedAreas.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
            <div style={{ background: C.card, borderRadius: 16, padding: '14px 16px', gridColumn: 'span 2', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted }}>Daily progress</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#5C7A1A' }}>{progress}%</span>
              </div>
              <div style={{ height: 4, background: '#EEF1F4', borderRadius: 99, overflow: 'hidden', marginBottom: 14 }}>
                <div style={{ height: '100%', width: `${progress}%`, background: C.green, borderRadius: 99, transition: 'width 0.6s ease' }} />
              </div>
              <div className="divide-x divide-slate-100" style={{ display: 'flex' }}>
                {[
                  { label: 'Total', val: totalCount },
                  { label: 'Done', val: visitedCount },
                  { label: 'Left', val: totalCount - visitedCount },
                ].map(({ label, val }) => (
                  <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                    <p style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1 }}>{val}</p>
                    <p style={{ fontSize: 9, fontWeight: 600, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '5px 0 0' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: C.card, borderRadius: 16, padding: '14px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, display: 'block', marginBottom: 8 }}>Earned today</span>
              <p style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>
                ₹{safeCommission >= 1000 ? (safeCommission / 1000).toFixed(1) + 'k' : safeCommission.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        )}

        {isLoadingRoute ? (
          <div style={{ background: C.card, borderRadius: 16, padding: '46px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2.5px solid ${C.greenSoftBorder}`, borderTopColor: C.green, animation: 'spin 0.8s linear infinite' }} />
            <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>Loading territory…</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : selectedAreas.length === 0 ? (
          <div style={{ background: C.card, borderRadius: 16, padding: '48px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: C.greenSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5C7A1A" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
            </div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 8px' }}>Select your working area</h2>
            <p style={{ fontSize: 12, color: C.muted, maxWidth: 250, lineHeight: 1.6, margin: '0 0 22px' }}>Tap <span style={{ fontWeight: 600, color: C.text }}>Add area</span> in the header to choose which territories you are working in today.</p>
            <button onClick={() => setIsAreaDropdownOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: C.green, background: C.dark, border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 4v16M4 12h16" /></svg> Add area
            </button>
          </div>
        ) : step === 'camera' ? (
          <div style={{ background: C.card, borderRadius: 16, padding: '46px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: C.greenSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, padding: 10 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5C7A1A" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>
            </div>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, margin: '0 0 6px' }}>Security check</p>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 10px' }}>Field Check-In</h2>
            <p style={{ fontSize: 12, color: C.muted, maxWidth: 280, lineHeight: 1.6, margin: '0 0 24px' }}>
              Take a photo of the shop. We'll use your GPS to automatically fill the form for you.
            </p>
            <button onClick={() => fileInputRef.current?.click()} disabled={isLocating} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: isLocating ? '#fff' : C.green, background: C.dark, border: 'none', borderRadius: 12, padding: '12px 26px', cursor: isLocating ? 'not-allowed' : 'pointer', opacity: isLocating ? 0.7 : 1 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>
              {isLocating ? 'Analyzing GPS...' : 'Take Photo to Unlock'}
            </button>
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
            {/* Photo Preview Header */}
            <div style={{ background: C.card, padding: 12, borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
              <img src={localPhoto} alt="Captured" style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', border: `1px solid ${C.border}` }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: '#5C7A1A', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 4, margin: 0 }}>
                  <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg> GPS Verified
                </p>
                <button onClick={() => setStep('camera')} style={{ fontSize: 11, fontWeight: 600, color: C.muted, textDecoration: 'underline', background: 'none', border: 'none', padding: 0, marginTop: 4, cursor: 'pointer' }}>Retake photo</button>
              </div>
            </div>

            <form onSubmit={handleSubmitVisit} style={{ background: C.card, borderRadius: 18, padding: '18px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Detected medical shop</label>
                <select
                  value={selectedShopId}
                  onChange={(e) => setSelectedShopId(e.target.value)}
                  required
                  style={{ width: '100%', padding: '11px 14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, fontWeight: 600, color: C.text, outline: 'none' }}
                >
                  <option value="" disabled>Select a shop...</option>
                  {nearbyShops.map((shop, idx) => (
                    <option key={shop.id} value={shop.id}>
                      {idx === 0 ? '📍 (Nearest) ' : ''}{shop.name} {shop.distance < 999999 ? `- ${(shop.distance / 1000).toFixed(1)}km` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Order vol (₹)</label>
                  <input
                    type="number"
                    value={formData.orderAmount}
                    onChange={(e) => setFormData({...formData, orderAmount: e.target.value})}
                    placeholder="0"
                    style={{ width: '100%', padding: '11px 14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, fontWeight: 600, color: C.text, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#5C7A1A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Collection (₹)</label>
                  <input
                    type="number"
                    value={formData.collectionAmount}
                    onChange={(e) => setFormData({...formData, collectionAmount: e.target.value})}
                    placeholder="0"
                    style={{ width: '100%', padding: '11px 14px', background: C.greenSoft, border: `1px solid ${C.greenSoftBorder}`, borderRadius: 10, fontSize: 13, fontWeight: 600, color: C.text, outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Payment method</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7 }}>
                  {['Cash', 'UPI', 'Cheque', 'Credit'].map((method) => {
                    const active = formData.paymentMethod === method;
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setFormData({...formData, paymentMethod: method})}
                        style={{ padding: '9px 0', fontSize: 11, fontWeight: 600, borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s', border: active ? `1px solid ${C.dark}` : `1px solid ${C.border}`, background: active ? C.dark : C.surface, color: active ? C.green : C.muted }}
                      >
                        {method}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Remark / note</label>
                <textarea
                  value={formData.remark}
                  onChange={(e) => setFormData({...formData, remark: e.target.value})}
                  placeholder="Optional notes regarding this visit..."
                  rows="2"
                  style={{ width: '100%', padding: '11px 14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 12, fontWeight: 500, color: C.text, outline: 'none', resize: 'none' }}
                ></textarea>
              </div>

              <div style={{ paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ width: '100%', padding: '13px', borderRadius: 12, color: C.dark, fontWeight: 700, fontSize: 13, background: C.green, border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: isSubmitting ? 0.7 : 1 }}
                >
                  {isSubmitting ? 'Submitting...' : 'Log this visit'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}