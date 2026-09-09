
// 'use client';
// import { useState, useRef, useMemo, useEffect } from 'react';
// import toast from 'react-hot-toast';
// import Image from 'next/image';

// // Highly accurate Haversine distance formula
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
//   masterTerritories,
//   masterAreas,
//   isLoadingRoute,
//   totalCollection,
//   setPhotoUri,
//   onRefreshData
// }) {
//   const [step, setStep] = useState('camera');
//   const [selectedArea, setSelectedArea] = useState(''); 
//   const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
//   const [areaSearchQuery, setAreaSearchQuery] = useState(''); 
//   const [localPhoto, setLocalPhoto] = useState(null);
//   const [location, setLocation] = useState(null);
//   const [isLocating, setIsLocating] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isMounted, setIsMounted] = useState(false);
//   const [isMobile, setIsMobile] = useState(true);
  
//   const [nearbyShops, setNearbyShops] = useState([]);
//   const [selectedShopId, setSelectedShopId] = useState('');
//   const [localPhotoCrushed, setLocalPhotoCrushed] = useState(null);
//   const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
//   const [shopSearchQuery, setShopSearchQuery] = useState('');
  
//   const shopDropdownRef = useRef(null);
//   const fileInputRef = useRef(null);
//   const dropdownRef = useRef(null);

//   // 🚨 STANDARD RADIUS FOR INDIAN MARKETS
//   const GEOFENCE_RADIUS_METERS = 60; 

//   const [formData, setFormData] = useState({
//     orderAmount: '',
//     cashAmount: '',
//     otherAmount: '',
//     otherMethod: 'UPI',
//     remark: ''
//   });

//   useEffect(() => {
//     const handler = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setIsAreaDropdownOpen(false);
//       }
//       if (shopDropdownRef.current && !shopDropdownRef.current.contains(e.target)) {
//         setIsShopDropdownOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handler);
//     return () => document.removeEventListener('mousedown', handler);
//   }, []);

//   const filteredNearbyShops = useMemo(() => {
//     if (!shopSearchQuery) return nearbyShops;
//     return nearbyShops.filter(shop => 
//       shop.name.toLowerCase().includes(shopSearchQuery.toLowerCase()) || 
//       (shop.placeName && shop.placeName.toLowerCase().includes(shopSearchQuery.toLowerCase()))
//     );
//   }, [nearbyShops, shopSearchQuery]);

//   const uniqueAreas = useMemo(() => {
//     const fromMasterTerritories = Array.isArray(masterTerritories) ? masterTerritories.map(a => a.name) : [];
//     const fromMasterAreas = Array.isArray(masterAreas) ? masterAreas.map(a => a.name) : [];
//     const fromTargets = Array.isArray(targets) ? targets.map(t => t.areaName) : [];

//     return [...new Set([...fromMasterTerritories, ...fromMasterAreas, ...fromTargets]
//       .filter(Boolean)
//       .filter(name => name !== 'Unassigned Area')
//     )].sort();
//   }, [targets, masterTerritories, masterAreas]);

//   const filteredAreas = useMemo(() => {
//     if (!areaSearchQuery) return uniqueAreas;
//     return uniqueAreas.filter(area => 
//       area.toLowerCase().includes(areaSearchQuery.toLowerCase())
//     );
//   }, [uniqueAreas, areaSearchQuery]);

//   useEffect(() => {
//     setIsMounted(true);
//     const saved = localStorage.getItem('assignedSalesArea');
//     if (saved) setSelectedArea(saved);
//   }, []);

//   useEffect(() => {
//     if (window.location.hostname === 'localhost') {
//       setIsMobile(true);
//       return;
//     }
//     const userAgent = navigator.userAgent || navigator.vendor || window.opera;
//     if (/android/i.test(userAgent) || /iPad|iPhone|iPod/.test(userAgent)) {
//       setIsMobile(true);
//     } else {
//       setIsMobile(false);
//     }
//   }, []);

//   const toggleArea = (area) => {
//     setSelectedArea(area);
//     localStorage.setItem('assignedSalesArea', area);
//     setIsAreaDropdownOpen(false);
//     setAreaSearchQuery('');
//     setStep('camera');
//     setLocalPhoto(null);
//     setLocation(null);
//     if (setPhotoUri) setPhotoUri(null);
//   };

//   const activeTargets = useMemo(() => {
//     if (!selectedArea) return [];
//     return targets?.filter((t) => t.areaName === selectedArea) || [];
//   }, [targets, selectedArea]);

//   const visitedCount = activeTargets.filter((t) => t.status === 'COMPLETED').length || 0;
//   const totalCount = activeTargets.length || 0;
//   const safeCollection = totalCollection || 0;
//   const progress = totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;

//   const handleCapture = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
    
//     const fileAgeInSeconds = (Date.now() - file.lastModified) / 1000;
//     const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

//     if (fileAgeInSeconds > 30 && !isLocalhost) {
//       toast.error("Gallery uploads are forbidden. Please capture a live photo right now.");
//       if (fileInputRef.current) fileInputRef.current.value = '';
//       return; 
//     }

//     setIsLocating(true);
//     verifyGeofence(file);
//   };

// const verifyGeofence = (file) => {
//     if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
//       toast.error("GPS requires a secure HTTPS connection.");
//       setIsLocating(false);
//       setStep('camera');
//       return;
//     }

//     const processLocation = async (lat, lng) => {
//       let closestVerifiedShop = null;
//       let minVerifiedDistance = Infinity;

//       let processedShops = activeTargets.map(s => {
//         const hasGps = Boolean(s.latitude && s.longitude && s.latitude !== "null" && s.longitude !== "null");
//         let dist = hasGps ? getDistance(lat, lng, Number(s.latitude), Number(s.longitude)) : 999999;
        
//         if (s.isVerified && hasGps && dist < minVerifiedDistance) {
//           minVerifiedDistance = dist;
//           closestVerifiedShop = s;
//         }

//         return { ...s, isNewAnchor: !hasGps, distance: dist };
//       });
      
//       let availableOptions = processedShops;
//       let autoSelectId = "";
//       if (closestVerifiedShop && minVerifiedDistance <= GEOFENCE_RADIUS_METERS) {
//         autoSelectId = closestVerifiedShop.id.toString();
//       }

//       availableOptions.sort((a, b) => {
//          if (autoSelectId) {
//            if (a.id.toString() === autoSelectId) return -1;
//            if (b.id.toString() === autoSelectId) return 1;
//          }
//          if (a.isVerified && !b.isVerified) return -1;
//          if (!a.isVerified && b.isVerified) return 1;
//          if (a.isVerified && b.isVerified) return a.distance - b.distance;
//          return a.name.localeCompare(b.name);
//       });

//       let streetAddress = "Address location not found";
//       try {
//         const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
//         const data = await res.json();
//         if (data && data.display_name) {
//           streetAddress = data.display_name.length > 65
//             ? data.display_name.substring(0, 62) + "..."
//             : data.display_name;
//         }
//       } catch (err) {
//         console.warn("Could not fetch street address", err);
//       }

//       // 🚨 FIX: Use document.createElement('img') to avoid Next.js Image component collision!
//       const imgObj = document.createElement('img');
//       imgObj.onload = () => {
//         const MAX_WIDTH = 500;
//         const MAX_HEIGHT = 500;
//         let width = imgObj.width;
//         let height = imgObj.height;

//         if (width > height) {
//           if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH; }
//         } else {
//           if (height > MAX_HEIGHT) { width = Math.round((width * MAX_HEIGHT) / height); height = MAX_HEIGHT; }
//         }

//         const canvas = document.createElement('canvas');
//         canvas.width = width;
//         canvas.height = height;
//         const ctx = canvas.getContext('2d');
        
//         ctx.fillStyle = '#FFFFFF';
//         ctx.fillRect(0, 0, width, height);
//         ctx.drawImage(imgObj, 0, 0, width, height);

//         ctx.fillStyle = 'rgba(10, 15, 26, 0.85)';
//         ctx.fillRect(0, height - 70, width, 70);

//         ctx.fillStyle = '#97C22A';
//         ctx.font = 'bold 12px sans-serif';
//         const timeStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
//         ctx.fillText(`${selectedArea.toUpperCase()} • ${timeStr}`, 10, height - 52);

//         ctx.fillStyle = '#FFFFFF';
//         ctx.font = '10px sans-serif';
//         ctx.fillText(`Current GPS : ${lat.toFixed(6)}, ${lng.toFixed(6)}`, 10, height - 38);

//         ctx.fillStyle = '#FFB020';
//         ctx.font = '10px sans-serif';
//         let originalText = "Original DB GPS : UNVERIFIED";
//         if (closestVerifiedShop && closestVerifiedShop.latitude) {
//           originalText = `Original DB GPS : ${Number(closestVerifiedShop.latitude).toFixed(6)}, ${Number(closestVerifiedShop.longitude).toFixed(6)}`;
//         }
//         ctx.fillText(originalText, 10, height - 24);

//         ctx.fillStyle = '#E2E8F0';
//         ctx.font = '9px sans-serif';
//         ctx.fillText(streetAddress, 10, height - 10);

//         const standardPhoto = canvas.toDataURL('image/jpeg', 0.8);
//         let quality = 0.7;
//         let crushedPhoto = canvas.toDataURL('image/jpeg', quality);
//         let sizeInKb = (crushedPhoto.length * 0.75) / 1024;

//         while (sizeInKb > 30 && quality > 0.1) {
//           quality -= 0.1;
//           crushedPhoto = canvas.toDataURL('image/jpeg', Math.max(0.1, quality));
//           sizeInKb = (crushedPhoto.length * 0.75) / 1024;
//         }
        
//         setLocalPhoto(standardPhoto);
//         setLocalPhotoCrushed(crushedPhoto);
//         if (setPhotoUri) setPhotoUri(standardPhoto);
        
//         URL.revokeObjectURL(imgObj.src);
//         if (fileInputRef.current) fileInputRef.current.value = '';
        
//         setLocation({ lat, lng });
//         setNearbyShops(availableOptions);
//         setSelectedShopId(autoSelectId);
        
//         setIsLocating(false);
//         setStep('form');
        
//         if (autoSelectId) {
//           toast.success("Location verified & Shop Auto-Selected!");
//         } else {
//           toast.success("Location logged! Please search and select the unverified shop.");
//         }
//       };
      
//       imgObj.src = URL.createObjectURL(file);
//     };

//     if (!navigator.geolocation) {
//       toast.error('Geolocation is not supported by your browser.');
//       setIsLocating(false);
//       return;
//     }

//     let isResolved = false;
//     const killSwitchTimer = setTimeout(() => {
//       if (!isResolved) {
//         isResolved = true;
//         toast.error("GPS is unresponsive. Please check your phone location settings.");
//         setIsLocating(false);
//         setStep('camera');
//       }
//     }, 10000);

//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         if (isResolved) return;
//         isResolved = true;
//         clearTimeout(killSwitchTimer);
//         processLocation(pos.coords.latitude, pos.coords.longitude);
//       },
//       (error) => {
//         if (isResolved) return;
//         isResolved = true;
//         clearTimeout(killSwitchTimer);
        
//         if (error.code === 1) toast.error("Permission Denied! Please allow location access.");
//         else if (error.code === 2) toast.error("GPS is OFF! Please turn ON 'Location' in your phone settings.");
//         else toast.error("Signal Lost! Please step outside or near a window.");
        
//         setIsLocating(false);
//         setStep('camera');
//       },
//       { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
//     );
//   };

//   const handleSubmitVisit = async (e) => {
//     e.preventDefault();
//     if (!selectedShopId) return toast.error("Please select a medical shop from the dropdown.");

//     const selectedShop = nearbyShops.find(s => s.id.toString() === selectedShopId.toString());
//     if (!selectedShop) return toast.error("Invalid shop selection.");

//     // 🚨 FLAWLESS LOGIC 5: Submission Validation
//     // We ONLY enforce distance rules on VERIFIED shops.
//     // UNVERIFIED shops are always allowed so they can set the DB baseline!
//     if (selectedShop.isVerified) {
//       if (selectedShop.distance > GEOFENCE_RADIUS_METERS) {
//         toast.error(
//           `GPS Mismatch! 🚨 You are ${selectedShop.distance.toFixed(0)}m away from ${selectedShop.name}. Max allowed is ${GEOFENCE_RADIUS_METERS}m.`, 
//           { duration: 6000 }
//         );
//         return; 
//       }
//     }

//     setIsSubmitting(true);
//     try {
//       const agentId = localStorage.getItem('employeeId') || 'Unknown';

//       const cashVal = parseFloat(formData.cashAmount) || 0;
//       const otherVal = parseFloat(formData.otherAmount) || 0;
//       const totalCollectionVal = cashVal + otherVal;

//       let finalMethod = 'None';
//       if (cashVal > 0 && otherVal > 0) {
//         finalMethod = `Cash & ${formData.otherMethod}`;
//       } else if (cashVal > 0 && otherVal === 0) {
//         finalMethod = 'Cash';
//       } else if (cashVal === 0 && otherVal > 0) {
//         finalMethod = formData.otherMethod;
//       }

//       const payload = {
//         agentId: agentId,
//         targetId: selectedShopId,
//         latitude: location?.lat ? String(location.lat) : null,
//         longitude: location?.lng ? String(location.lng) : null,
//         photoUrl: localPhoto || null,
//         photoUrlCrushed: localPhotoCrushed || null,
//         orderAmount: parseFloat(formData.orderAmount) || 0,
//         collectionAmount: totalCollectionVal, 
//         paymentMethod: finalMethod,          
//         remark: formData.remark || ''
//       };

//       const response = await fetch('/api/sales/visits', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.error || "Failed to log visit.");

//       setStep('camera');
//       setLocalPhoto(null);
//       setLocalPhotoCrushed(null);
//       setLocation(null);
//       setFormData({ orderAmount: '', cashAmount: '', otherAmount: '', otherMethod: 'UPI', remark: '' });

//       if (onRefreshData) onRefreshData();
//       else window.location.reload();

//     } catch (err) {
//       console.error("Submission Error:", err);
//       toast.error(`Error: ${err.message}`);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (!isMounted) return null;

//   return (
//     <div className="flex-1 overflow-y-auto bg-slate-50 relative pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>

//       <input 
//         type="file" 
//         accept="image/jpeg, image/png, image/jpg" 
//         capture="environment" 
//         ref={fileInputRef} 
//         onChange={handleCapture} 
//         className="hidden" 
//       />
      
//       {/* Floating Header Component */}
//       <div ref={dropdownRef} className="sticky top-0 z-30 bg-slate-100 px-5 pt-4 pb-5 rounded-b-xl shadow-md border-b border-white/5 transition-all">
//         <div className="flex items-start justify-between gap-3">
//           <div className="flex-1 min-w-0">
//             <p className="text-[11px] font-semibold text-slate-400 mb-1.5">
//               Choose your working area for today
//             </p>
//             <div className="flex items-center flex-wrap gap-2.5">
//               {selectedArea ? (
//                 <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0b2900] bg-[#97C22A]/10 border border-[#97C22A]/20 rounded-2xl px-3 py-1">
//                   {selectedArea}
//                 </span>
//               ) : (
//                 <span className="text-[14px] text-slate-500 font-medium">No area selected</span>
//               )}
              
//               <button
//                 onClick={() => setIsAreaDropdownOpen((p) => !p)}
//                 className={`inline-flex items-center gap-1.5 text-[12px] font-medium rounded-2xl px-3 py-1 transition-colors ${
//                   isAreaDropdownOpen 
//                     ? 'bg-slate-200 text-red-500 hover:bg-red-500/20' 
//                     : 'bg-slate-200 text-blue-500 hover:bg-blue-500/20'
//                 }`}
//               >
//                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   {isAreaDropdownOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" /> :
//                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />}
//                 </svg>
//                 {selectedArea ? (isAreaDropdownOpen ? 'Close' : 'Change') : 'Select'}
//               </button>
//             </div>
//           </div>

//           <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border shrink-0 mt-1 ${
//             step === 'form' ? 'bg-[#97C22A]/10 border-[#97C22A]/20' : 'bg-white/5 border-white/10'
//           }`}>
//             <span className={` ${step === 'form' ? 'bg-[#97C22A]' : 'bg-slate-500'}`} />
//             <span className={`text-[12px] font-semibold ${step === 'form' ? 'text-slate-700' : 'text-slate-400'}`}>
//               {step === 'camera' ? '🔒 Locked' : '✅ Verified'}
//             </span>
//           </div>
//         </div>

//         {isAreaDropdownOpen && (
//           <div className="absolute top-[100%] left-4 right-4 mt-2 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-40">
//             <div className="p-3 border-b border-slate-100 bg-slate-50/50">
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                   </svg>
//                 </div>
//                 <input
//                   type="text"
//                   placeholder="Search area..."
//                   value={areaSearchQuery}
//                   onChange={(e) => setAreaSearchQuery(e.target.value)}
//                   className="w-full bg-white border border-slate-200 rounded-2xl pl-9 pr-4 py-2.5 text-[16px] font-medium text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all"
//                 />
//               </div>
//             </div>

//             {filteredAreas.length === 0 ? (
//               <div className="p-6 text-center">
//                 <p className="text-[13px] text-slate-500 font-medium m-0">No areas found</p>
//               </div>
//             ) : (
//               <div className="p-3 flex flex-wrap gap-2 max-h-[35vh] overflow-y-auto">
//                {filteredAreas.map((area, index) => {
//                   const sel = area === selectedArea;
//                   return (
//                     <button
//                       key={`${area}-${index}`} 
//                       onClick={() => toggleArea(area)}
//                       className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-[13px] font-semibold transition-all ${
//                         sel 
//                           ? 'bg-[#97C22A] text-[#0a0f1c] shadow-sm' 
//                           : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
//                       }`}
//                     >
//                       {sel && (
//                         <svg className="w-3.5 h-3.5 text-[#0a0f1c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
//                         </svg>
//                       )}
//                       {area}
//                     </button>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//      <div className="px-4 pt-5 flex flex-col gap-4 max-w-lg mx-auto">
        
//         {selectedArea && (
//           <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
//             <div className="flex justify-between items-center mb-2.5">
//               <div className="flex items-center gap-2">
//                 <span className="text-[12px] font-semibold text-slate-500">Daily progress</span>
//                 <span className="text-[13px] font-bold text-[#5C7A1A]">{progress}%</span>
//               </div>
//               <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
//                 <span className="text-[11px] font-semibold text-slate-400">Earned</span>
//                 <span className="text-[12px] font-semibold text-[#1d6e04]">
//                   ₹{safeCollection >= 1000 ? (safeCollection / 1000).toFixed(1) + 'k' : safeCollection.toLocaleString('en-IN')}
//                 </span>
//               </div>
//             </div>
//             <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
//               <div className="h-full bg-[#97C22A] rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
//             </div>
//             <div className="flex divide-x divide-slate-100">
//               {[
//                 { label: 'Total Shops', val: totalCount },
//                 { label: 'Visited', val: visitedCount },
//                 { label: 'Pending', val: totalCount - visitedCount },
//               ].map(({ label, val }) => (
//                 <div key={label} className="flex-1 text-center">
//                   <p className="text-[16px] font-bold text-slate-800 leading-none m-0">{val}</p>
//                   <p className="text-[10px] font-semibold text-slate-400 mt-1">{label}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
     
//         {isLoadingRoute ? (
//           <div className="bg-white rounded-2xl p-10 flex flex-col items-center gap-4 shadow-sm border border-slate-100 mt-2">
//             <svg className="w-8 h-8 text-[#97C22A] animate-spin" fill="none" viewBox="0 0 24 24">
//               <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//               <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//             </svg>
//             <p className="text-[13px] font-medium text-slate-500 m-0">Loading territory data...</p>
//           </div>
//         ) : !selectedArea ? (
//           <div className="bg-white rounded-2xl p-10 flex flex-col items-center text-center shadow-sm border border-slate-100 mt-2">
//             <div className="w-14 h-14 rounded-2xl bg-[#97C22A]/10 flex items-center justify-center mb-5 border border-[#97C22A]/20">
//               <svg className="w-6 h-6 text-[#5C7A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
//                 <circle cx="12" cy="10" r="3" strokeWidth="2" />
//               </svg>
//             </div>
//             <h2 className="text-[17px] font-bold text-slate-900 mb-2">Select working area</h2>
//             <p className="text-[13px] text-slate-500 leading-relaxed mb-6">
//               Choose your territory from the header to view your targets and start logging visits.
//             </p>
//             <button 
//               onClick={() => setIsAreaDropdownOpen(true)} 
//               className="bg-[#0a0f1c] text-white text-[14px] font-bold rounded-2xl px-6 py-3.5 flex items-center gap-2 active:scale-95 transition-transform shadow-sm"
//             >
//               Select area
//             </button>
//           </div>
//         ) : step === 'camera' ? (
//           <div className="bg-white rounded-2xl p-4 flex flex-col items-center text-center shadow-sm border border-slate-100 mt-2">
//             <div className="w-14 h-14 rounded-2xl bg-[#97C22A]/10 flex items-center justify-center mb-3 border border-[#97C22A]/20 relative">
//               {isLocating && <div className="absolute inset-0 border-2 border-[#97C22A] rounded-3xl animate-ping opacity-30" />}
//            <Image 
//   src="/camera.png" 
//   alt="Camera Icon" 
//   width={28} 
//   height={28} 
//   className="w-7 h-7 object-contain" 
// />
//             </div>
//             <p className="text-[12px] font-semibold text-[#97C22A] mb-1.5">Security check 🛡️</p>
//             <h2 className="text-[18px] font-bold text-slate-900 mb-1.5">Field check-in</h2>
//             <p className="text-[13px] text-slate-500 leading-relaxed mb-3 max-w-[300px]">
//               Take a photo of the shop in <span className="font-semibold text-[#fc2666]">{selectedArea}</span>. GPS will auto-detect your location.
//             </p>

//             {isMobile ? (
//               <div className="space-y-3">
//                 <button 
//                   onClick={() => fileInputRef.current?.click()} 
//                   disabled={isLocating} 
//                   className={`w-full px-5 py-4 rounded-2xl text-[14px] font-semibold flex items-center justify-center gap-3 transition-all shadow-sm text-left ${
//                     isLocating ? 'bg-slate-800 text-[#b8ed3b] cursor-not-allowed' : 'bg-[#0a0f1c] text-white active:scale-[0.98]'
//                   }`}
//                 >
//                   <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
//                   </svg>
//                   {isLocating ? 'Analyzing GPS...' : 'Take photo to unlock'}
//                 </button>

//                 <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-3.5 flex items-start gap-3 text-left">
//                   <div>
//                     <p className="text-[12px] font-bold flex gap-2 text-[#6e2600] mb-1">⚠️ Strict GPS Protocol Active</p>
//                     <ul className="text-[11px] font-medium text-[#6e2600]/60 space-y-1 list-disc pl-5">
//                       <li>You must be exactly at the shop location.</li>
//                       <li>Photo must clearly show the shop's front board.</li>
//                       <li>All check-ins are recorded and audited.</li>
//                     </ul>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <div className="w-full p-4 rounded-2xl bg-red-50 border border-red-100 text-left shadow-sm">
//                 <div className="text-red-600 text-[14px] font-bold flex items-center justify-start gap-2 mb-1.5">
//                   <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//                   </svg>
//                   Desktop Access Blocked
//                 </div>
//                 <p className="text-[11px] font-medium text-red-500/90 leading-relaxed">
//                   Hardware GPS verification is required. Please switch to your mobile device to check in and submit this form.
//                 </p>
//               </div>
//             )}
            
//           </div>
//         ) : (
//           <div className="animate-in slide-in-from-bottom-4 duration-300 mt-2 flex flex-col gap-4">
            
//             <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
//               <img src={localPhoto} alt="Captured" className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm" />
//               <div className="flex-1">
//                 <p className="text-[12px] font-bold text-[#5C7A1A] flex items-center gap-1.5 m-0">
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> 
//                   GPS Verified
//                 </p>
//                 <button 
//                   onClick={() => setStep('camera')} 
//                   className="text-[12px] font-semibold text-slate-400 mt-1 underline underline-offset-2 active:text-slate-600 transition-colors"
//                 >
//                   Retake photo
//                 </button>
//               </div>
//             </div>

//             <form onSubmit={handleSubmitVisit} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              
//           <div className="mb-5">
//                 <label className="block text-[12px] font-semibold text-slate-500 mb-2">Selected medical shop</label>
                
//                 {/* 🚨 CUSTOM MOBILE-OPTIMIZED SEARCHABLE DROPDOWN */}
//                 <div className="relative" ref={shopDropdownRef}>
                  
//                   {/* The Trigger Button */}
//                   <button
//                     type="button"
//                     onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)}
//                     className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-[14px] font-semibold text-slate-800 flex items-center justify-between transition-colors focus:border-[#97C22A] focus:bg-white"
//                   >
//                     <span className="truncate flex-1 text-left pr-2">
//                       {selectedShopId 
//                         ? (() => {
//                             const s = nearbyShops.find(x => x.id.toString() === selectedShopId.toString());
//                             if (s) {
//                               const placeStr = (s.placeName || s.place) ? ` (${s.placeName || s.place})` : '';
//                              const distStr = s.isVerified && s.distance !== undefined && s.distance < 999999 ? ` - ${(s.distance).toFixed(0)}m` : '';
//                               return `${s.isNewAnchor ? 'First Visit - ' : ''}${s.name}${placeStr}${distStr}`;
//                             }
//                             return 'Select a shop...';
//                           })()
//                         : `Select a shop in ${selectedArea}...`}
//                     </span>
//                     <svg className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${isShopDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
//                   </button>

//                   {/* The Dropdown Menu */}
//                   {isShopDropdownOpen && (
//                     <div className="absolute top-[100%] left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                      
//                       {/* Sticky Search Bar */}
//                       <div className="p-3 border-b border-slate-100 bg-slate-50/90 backdrop-blur-sm sticky top-0 z-10">
//                         <div className="relative">
//                           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                             <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
//                           </div>
//                           <input
//                             type="text"
//                             placeholder="Search shops..."
//                             value={shopSearchQuery}
//                             onChange={(e) => setShopSearchQuery(e.target.value)}
//                             className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-[14px] font-medium text-slate-800 outline-none focus:border-[#97C22A] focus:ring-1 focus:ring-[#97C22A] transition-all"
//                             autoFocus 
//                           />
//                         </div>
//                       </div>

//                       {/* Scrollable Shop List */}
//                       <div className="max-h-[40vh] overflow-y-auto p-2 overscroll-contain">
//                         {filteredNearbyShops.length === 0 ? (
//                           <div className="p-4 text-center text-[13px] text-slate-500 font-medium">
//                             No shops found matching "{shopSearchQuery}"
//                           </div>
//                         ) : (
//                           filteredNearbyShops.map((shop) => {
//                             const isSelected = selectedShopId === shop.id.toString();
//                             return (
//                               <button
//                                 key={shop.id}
//                                 type="button"
//                                 onClick={() => {
//                                   setSelectedShopId(shop.id.toString());
//                                   setIsShopDropdownOpen(false);
//                                   setShopSearchQuery(''); 
//                                 }}
//                                 className={`w-full text-left px-3.5 py-3 rounded-xl mb-1 flex items-center justify-between transition-colors ${
//                                   isSelected 
//                                     ? 'bg-[#97C22A]/10' 
//                                     : 'hover:bg-slate-50'
//                                 }`}
//                               >
//                                 {/* <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
//                                   {!shop.isVerified && (
//                                     <span className="shrink-0 text-[#fc2666] text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-[#fc2666]/30 bg-[#fc2666]/10">
//                                       UNVERIFIED
//                                     </span>
//                                   )}
                                  
//                                   <div className="truncate flex-1 min-w-0 text-left">
//                                     <span className={`text-[14px] font-semibold ${isSelected ? 'text-[#5C7A1A]' : 'text-slate-700'}`}>
//                                       {shop.name}
//                                     </span>
//                                     {(shop.placeName || shop.place) && (
//                                       <span className="text-slate-400 font-normal text-[12px] ml-1.5 inline-block">
//                                         ({shop.placeName || shop.place})
//                                       </span>
//                                     )}
//                                   </div>
//                                 </div> */}

//                                 <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
//                                 <div className="truncate flex-1 min-w-0 text-left flex items-center gap-2">
                                  
//                                   {/* 1. The Color-Coded Place Name Badge FIRST */}
//                                   {(shop.placeName || shop.place) && (
//                                     <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-xl border ${
//                                       shop.isVerified 
//                                         ? 'bg-[#97C22A]/10 text-[#5C7A1A] border-[#97C22A]/20' // 🟢 Light Green for Verified
//                                         : 'bg-red-50 text-red-500 border-red-100'              // 🔴 Light Red for Unverified
//                                     }`}>
//                                       {shop.placeName || shop.place}
//                                     </span>
//                                   )}

//                                   {/* 2. The Shop Name SECOND */}
//                                   <span className={`text-[14px] font-semibold truncate ${isSelected ? 'text-[#5C7A1A]' : 'text-slate-700'}`}>
//                                     {shop.name} {shop.isVerified && shop.distance !== undefined && shop.distance < 999999 && (
//                                   <span className={`text-[12px] font-medium shrink-0 ${isSelected ? 'text-[#5C7A1A]' : 'text-slate-400'}`}>
//                                      ( {shop.distance.toFixed(0)} meters )
//                                   </span>
//                                 )}
//                                   </span>
                                  
//                                 </div>
//                               </div>
                                                              
                                
//                               </button>
//                             );
//                           })
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="mb-4">
//                 <label className="block text-[12px] font-semibold text-slate-500 mb-1.5">
//                   Order / Sales Volume (₹) <span className="font-normal text-slate-400">- New Orders Taken</span>
//                 </label>
//                 <input
//                   type="number"
//                   value={formData.orderAmount}
//                   onChange={(e) => setFormData({...formData, orderAmount: e.target.value})}
//                   placeholder="0"
//                   className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-[15px] font-bold text-slate-800 outline-none focus:border-slate-400 focus:bg-white transition-colors"
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-3 mb-4">
//                 <div>
//                   <label className="block text-[12px] font-semibold text-[#5C7A1A] mb-1.5">Cash Collection (₹)</label>
//                   <input
//                     type="number"
//                     value={formData.cashAmount}
//                     onChange={(e) => setFormData({...formData, cashAmount: e.target.value})}
//                     placeholder="0"
//                     className="w-full bg-[#97C22A]/10 border border-[#97C22A]/30 rounded-2xl px-4 py-3.5 text-[15px] font-bold text-slate-900 outline-none focus:bg-[#97C22A]/20 transition-colors"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-[12px] font-semibold text-blue-600 mb-1.5">Other Collection (₹)</label>
//                   <input
//                     type="number"
//                     value={formData.otherAmount}
//                     onChange={(e) => setFormData({...formData, otherAmount: e.target.value})}
//                     placeholder="0"
//                     className="w-full bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3.5 text-[15px] font-bold text-slate-900 outline-none focus:bg-blue-100 transition-colors"
//                   />
//                 </div>
//               </div>

//               <div className="mb-5" style={{ opacity: formData.otherAmount > 0 ? 1 : 0.4, pointerEvents: formData.otherAmount > 0 ? 'auto' : 'none' }}>
//                 <label className="block text-[12px] font-semibold text-slate-500 mb-2">Method for 'Other Collection'</label>
//                 <div className="grid grid-cols-3 gap-2">
//                   {['UPI', 'Cheque', 'Credit'].map((method) => {
//                     const active = formData.otherMethod === method;
//                     return (
//                       <button
//                         key={method}
//                         type="button"
//                         onClick={() => setFormData({...formData, otherMethod: method})}
//                         className={`py-2.5 text-[12px] font-semibold rounded-2xl transition-all border ${
//                           active 
//                             ? 'bg-[#0a0f1c] text-white border-[#0a0f1c] shadow-sm' 
//                             : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
//                         }`}
//                       >
//                         {method}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>

//               <div className="mb-6">
//                 <label className="block text-[12px] font-semibold text-slate-500 mb-2">Remark / note</label>
//                 <textarea
//                   value={formData.remark}
//                   onChange={(e) => setFormData({...formData, remark: e.target.value})}
//                   placeholder="Optional notes regarding this visit..."
//                   rows="2"
//                   className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-[14px] font-medium text-slate-800 outline-none focus:border-slate-400 focus:bg-white transition-colors resize-none"
//                 ></textarea>
//               </div>

//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className={`w-full py-4 rounded-2xl text-[#0a0f1c] font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-sm ${
//                   isSubmitting ? 'bg-[#97C22A]/70 cursor-not-allowed' : 'bg-[#97C22A] active:scale-[0.98]'
//                 }`}
//               >
//                 {isSubmitting ? (
//                   <>
//                     <svg className="w-5 h-5 animate-spin text-[#0a0f1c]" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     Submitting...
//                   </>
//                 ) : (
//                   'Log this visit'
//                 )}
//               </button>
//             </form>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



// 'use client';
// import { useState, useRef, useMemo, useEffect } from 'react';
// import toast from 'react-hot-toast';
// import Image from 'next/image';

// // Highly accurate Haversine distance formula
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
//   masterTerritories,
//   masterAreas,
//   isLoadingRoute,
//   totalCollection,
//   setPhotoUri,
//   onRefreshData
// }) {
//   const [step, setStep] = useState('camera');
//   const [selectedArea, setSelectedArea] = useState(''); 
//   const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
//   const [areaSearchQuery, setAreaSearchQuery] = useState(''); 
//   const [localPhoto, setLocalPhoto] = useState(null);
//   const [location, setLocation] = useState(null);
//   const [isLocating, setIsLocating] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isMounted, setIsMounted] = useState(false);
//   const [isMobile, setIsMobile] = useState(true);
  
//   const [nearbyShops, setNearbyShops] = useState([]);
//   const [selectedShopId, setSelectedShopId] = useState('');
//   const [localPhotoCrushed, setLocalPhotoCrushed] = useState(null);
//   const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
//   const [shopSearchQuery, setShopSearchQuery] = useState('');
  
//   const shopDropdownRef = useRef(null);
//   const fileInputRef = useRef(null);
//   const dropdownRef = useRef(null);

//   // 🚨 STANDARD RADIUS FOR INDIAN MARKETS
//   const GEOFENCE_RADIUS_METERS = 500; 

//   const [formData, setFormData] = useState({
//     orderAmount: '',
//     cashAmount: '',
//     otherAmount: '',
//     otherMethod: 'UPI',
//     remark: ''
//   });

//   useEffect(() => {
//     const handler = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setIsAreaDropdownOpen(false);
//       }
//       if (shopDropdownRef.current && !shopDropdownRef.current.contains(e.target)) {
//         setIsShopDropdownOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handler);
//     return () => document.removeEventListener('mousedown', handler);
//   }, []);

//   const filteredNearbyShops = useMemo(() => {
//     if (!shopSearchQuery) return nearbyShops;
//     return nearbyShops.filter(shop => 
//       shop.name.toLowerCase().includes(shopSearchQuery.toLowerCase()) || 
//       (shop.placeName && shop.placeName.toLowerCase().includes(shopSearchQuery.toLowerCase()))
//     );
//   }, [nearbyShops, shopSearchQuery]);

//   const uniqueAreas = useMemo(() => {
//     const fromMasterTerritories = Array.isArray(masterTerritories) ? masterTerritories.map(a => a.name) : [];
//     const fromMasterAreas = Array.isArray(masterAreas) ? masterAreas.map(a => a.name) : [];
//     const fromTargets = Array.isArray(targets) ? targets.map(t => t.areaName) : [];

//     return [...new Set([...fromMasterTerritories, ...fromMasterAreas, ...fromTargets]
//       .filter(Boolean)
//       .filter(name => name !== 'Unassigned Area')
//     )].sort();
//   }, [targets, masterTerritories, masterAreas]);

//   const filteredAreas = useMemo(() => {
//     if (!areaSearchQuery) return uniqueAreas;
//     return uniqueAreas.filter(area => 
//       area.toLowerCase().includes(areaSearchQuery.toLowerCase())
//     );
//   }, [uniqueAreas, areaSearchQuery]);

//   useEffect(() => {
//     setIsMounted(true);
//     const saved = localStorage.getItem('assignedSalesArea');
//     if (saved) setSelectedArea(saved);
//   }, []);

//   useEffect(() => {
//     if (window.location.hostname === 'localhost') {
//       setIsMobile(true);
//       return;
//     }
//     const userAgent = navigator.userAgent || navigator.vendor || window.opera;
//     if (/android/i.test(userAgent) || /iPad|iPhone|iPod/.test(userAgent)) {
//       setIsMobile(true);
//     } else {
//       setIsMobile(false);
//     }
//   }, []);

//   const toggleArea = (area) => {
//     setSelectedArea(area);
//     localStorage.setItem('assignedSalesArea', area);
//     setIsAreaDropdownOpen(false);
//     setAreaSearchQuery('');
//     setStep('camera');
//     setLocalPhoto(null);
//     setLocation(null);
//     if (setPhotoUri) setPhotoUri(null);
//   };

//   const activeTargets = useMemo(() => {
//     if (!selectedArea) return [];
//     return targets?.filter((t) => t.areaName === selectedArea) || [];
//   }, [targets, selectedArea]);

//   const visitedCount = activeTargets.filter((t) => t.status === 'COMPLETED').length || 0;
//   const totalCount = activeTargets.length || 0;
//   const safeCollection = totalCollection || 0;
//   const progress = totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;

//   const handleCapture = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
    
//     const fileAgeInSeconds = (Date.now() - file.lastModified) / 1000;
//     const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

//     if (fileAgeInSeconds > 30 && !isLocalhost) {
//       toast.error("Gallery uploads are forbidden. Please capture a live photo right now.");
//       if (fileInputRef.current) fileInputRef.current.value = '';
//       return; 
//     }

//     setIsLocating(true);
//     verifyGeofence(file);
//   };

// // const verifyGeofence = (file) => {
// //     if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
// //       toast.error("GPS requires a secure HTTPS connection.");
// //       setIsLocating(false);
// //       setStep('camera');
// //       return;
// //     }

// //     const processLocation = async (lat, lng) => {
// //       let closestVerifiedShop = null;
// //       let minVerifiedDistance = Infinity;

// //       let processedShops = activeTargets.map(s => {
// //         const hasGps = Boolean(s.latitude && s.longitude && s.latitude !== "null" && s.longitude !== "null");
// //         let dist = hasGps ? getDistance(lat, lng, Number(s.latitude), Number(s.longitude)) : 999999;
        
// //         if (s.isVerified && hasGps && dist < minVerifiedDistance) {
// //           minVerifiedDistance = dist;
// //           closestVerifiedShop = s;
// //         }

// //         return { ...s, isNewAnchor: !hasGps, distance: dist };
// //       });
      
// //       let availableOptions = processedShops;
// //       let autoSelectId = "";
// //       if (closestVerifiedShop && minVerifiedDistance <= GEOFENCE_RADIUS_METERS) {
// //         autoSelectId = closestVerifiedShop.id.toString();
// //       }

// //       availableOptions.sort((a, b) => {
// //          if (autoSelectId) {
// //            if (a.id.toString() === autoSelectId) return -1;
// //            if (b.id.toString() === autoSelectId) return 1;
// //          }
// //          if (a.isVerified && !b.isVerified) return -1;
// //          if (!a.isVerified && b.isVerified) return 1;
// //          if (a.isVerified && b.isVerified) return a.distance - b.distance;
// //          return a.name.localeCompare(b.name);
// //       });

// //       let streetAddress = "Address location not found";
// //       try {
// //         const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
// //         const data = await res.json();
// //         if (data && data.display_name) {
// //           streetAddress = data.display_name.length > 65
// //             ? data.display_name.substring(0, 62) + "..."
// //             : data.display_name;
// //         }
// //       } catch (err) {
// //         console.warn("Could not fetch street address", err);
// //       }

// //       // 🚨 FIX: Use document.createElement('img') to avoid Next.js Image component collision!
// //       const imgObj = document.createElement('img');
// //       imgObj.onload = () => {
// //         const MAX_WIDTH = 500;
// //         const MAX_HEIGHT = 500;
// //         let width = imgObj.width;
// //         let height = imgObj.height;

// //         if (width > height) {
// //           if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH; }
// //         } else {
// //           if (height > MAX_HEIGHT) { width = Math.round((width * MAX_HEIGHT) / height); height = MAX_HEIGHT; }
// //         }

// //         const canvas = document.createElement('canvas');
// //         canvas.width = width;
// //         canvas.height = height;
// //         const ctx = canvas.getContext('2d');
        
// //         ctx.fillStyle = '#FFFFFF';
// //         ctx.fillRect(0, 0, width, height);
// //         ctx.drawImage(imgObj, 0, 0, width, height);

// //         ctx.fillStyle = 'rgba(10, 15, 26, 0.85)';
// //         ctx.fillRect(0, height - 70, width, 70);

// //         ctx.fillStyle = '#97C22A';
// //         ctx.font = 'bold 12px sans-serif';
// //         const timeStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
// //         ctx.fillText(`${selectedArea.toUpperCase()} • ${timeStr}`, 10, height - 52);

// //         ctx.fillStyle = '#FFFFFF';
// //         ctx.font = '10px sans-serif';
// //         ctx.fillText(`Current GPS : ${lat.toFixed(6)}, ${lng.toFixed(6)}`, 10, height - 38);

// //         ctx.fillStyle = '#FFB020';
// //         ctx.font = '10px sans-serif';
// //         let originalText = "Original DB GPS : UNVERIFIED";
// //         if (closestVerifiedShop && closestVerifiedShop.latitude) {
// //           originalText = `Original DB GPS : ${Number(closestVerifiedShop.latitude).toFixed(6)}, ${Number(closestVerifiedShop.longitude).toFixed(6)}`;
// //         }
// //         ctx.fillText(originalText, 10, height - 24);

// //         ctx.fillStyle = '#E2E8F0';
// //         ctx.font = '9px sans-serif';
// //         ctx.fillText(streetAddress, 10, height - 10);

// //         const standardPhoto = canvas.toDataURL('image/jpeg', 0.8);
// //         let quality = 0.7;
// //         let crushedPhoto = canvas.toDataURL('image/jpeg', quality);
// //         let sizeInKb = (crushedPhoto.length * 0.75) / 1024;

// //         while (sizeInKb > 30 && quality > 0.1) {
// //           quality -= 0.1;
// //           crushedPhoto = canvas.toDataURL('image/jpeg', Math.max(0.1, quality));
// //           sizeInKb = (crushedPhoto.length * 0.75) / 1024;
// //         }
        
// //         setLocalPhoto(standardPhoto);
// //         setLocalPhotoCrushed(crushedPhoto);
// //         if (setPhotoUri) setPhotoUri(standardPhoto);
        
// //         URL.revokeObjectURL(imgObj.src);
// //         if (fileInputRef.current) fileInputRef.current.value = '';
        
// //         setLocation({ lat, lng });
// //         setNearbyShops(availableOptions);
// //         setSelectedShopId(autoSelectId);
        
// //         setIsLocating(false);
// //         setStep('form');
        
// //         if (autoSelectId) {
// //           toast.success("Location verified & Shop Auto-Selected!");
// //         } else {
// //           toast.success("Location logged! Please search and select the unverified shop.");
// //         }
// //       };
      
// //       imgObj.src = URL.createObjectURL(file);
// //     };

// //     if (!navigator.geolocation) {
// //       toast.error('Geolocation is not supported by your browser.');
// //       setIsLocating(false);
// //       return;
// //     }

// //     let isResolved = false;
// //     const killSwitchTimer = setTimeout(() => {
// //       if (!isResolved) {
// //         isResolved = true;
// //         toast.error("GPS is unresponsive. Please check your phone location settings.");
// //         setIsLocating(false);
// //         setStep('camera');
// //       }
// //     }, 10000);

// //     navigator.geolocation.getCurrentPosition(
// //       (pos) => {
// //         if (isResolved) return;
// //         isResolved = true;
// //         clearTimeout(killSwitchTimer);
// //         processLocation(pos.coords.latitude, pos.coords.longitude);
// //       },
// //       (error) => {
// //         if (isResolved) return;
// //         isResolved = true;
// //         clearTimeout(killSwitchTimer);
        
// //         if (error.code === 1) toast.error("Permission Denied! Please allow location access.");
// //         else if (error.code === 2) toast.error("GPS is OFF! Please turn ON 'Location' in your phone settings.");
// //         else toast.error("Signal Lost! Please step outside or near a window.");
        
// //         setIsLocating(false);
// //         setStep('camera');
// //       },
// //       { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
// //     );
// //   };

// const verifyGeofence = (file) => {
//     if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
//       toast.error("GPS requires a secure HTTPS connection.");
//       setIsLocating(false);
//       setStep('camera');
//       return;
//     }

//     const processLocation = async (lat, lng) => {
//       let closestVerifiedShop = null;
//       let minVerifiedDistance = Infinity;

//       let processedShops = activeTargets.map(s => {
//         const hasGps = Boolean(s.latitude && s.longitude && s.latitude !== "null" && s.longitude !== "null");
//         let dist = hasGps ? getDistance(lat, lng, Number(s.latitude), Number(s.longitude)) : 999999;
        
//         if (s.isVerified && hasGps && dist < minVerifiedDistance) {
//           minVerifiedDistance = dist;
//           closestVerifiedShop = s;
//         }

//         return { ...s, isNewAnchor: !hasGps, distance: dist };
//       });
      
//       let availableOptions = processedShops;
//       let autoSelectId = "";
//       if (closestVerifiedShop && minVerifiedDistance <= GEOFENCE_RADIUS_METERS) {
//         autoSelectId = closestVerifiedShop.id.toString();
//       }

//       availableOptions.sort((a, b) => {
//          if (autoSelectId) {
//            if (a.id.toString() === autoSelectId) return -1;
//            if (b.id.toString() === autoSelectId) return 1;
//          }
//          if (a.isVerified && !b.isVerified) return -1;
//          if (!a.isVerified && b.isVerified) return 1;
//          if (a.isVerified && b.isVerified) return a.distance - b.distance;
//          return a.name.localeCompare(b.name);
//       });

//       let streetAddress = "Address location not found";
//       try {
//         const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
//         const data = await res.json();
//         if (data && data.display_name) {
//           streetAddress = data.display_name.length > 65
//             ? data.display_name.substring(0, 62) + "..."
//             : data.display_name;
//         }
//       } catch (err) {
//         console.warn("Could not fetch street address", err);
//       }

//       // 🚨 FIX: Use document.createElement('img') to avoid Next.js Image component collision!
//       const imgObj = document.createElement('img');
//       imgObj.onload = () => {
//         const MAX_WIDTH = 500;
//         const MAX_HEIGHT = 500;
//         let width = imgObj.width;
//         let height = imgObj.height;

//         if (width > height) {
//           if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH; }
//         } else {
//           if (height > MAX_HEIGHT) { width = Math.round((width * MAX_HEIGHT) / height); height = MAX_HEIGHT; }
//         }

//         const canvas = document.createElement('canvas');
//         canvas.width = width;
//         canvas.height = height;
//         const ctx = canvas.getContext('2d');
        
//         ctx.fillStyle = '#FFFFFF';
//         ctx.fillRect(0, 0, width, height);
//         ctx.drawImage(imgObj, 0, 0, width, height);

//         ctx.fillStyle = 'rgba(10, 15, 26, 0.85)';
//         ctx.fillRect(0, height - 70, width, 70);

//         ctx.fillStyle = '#97C22A';
//         ctx.font = 'bold 12px sans-serif';
//         const timeStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
//         ctx.fillText(`${selectedArea.toUpperCase()} • ${timeStr}`, 10, height - 52);

//         ctx.fillStyle = '#FFFFFF';
//         ctx.font = '10px sans-serif';
//         ctx.fillText(`Current GPS : ${lat.toFixed(6)}, ${lng.toFixed(6)}`, 10, height - 38);

//         ctx.fillStyle = '#FFB020';
//         ctx.font = '10px sans-serif';
//         let originalText = "Original DB GPS : UNVERIFIED";
//         if (closestVerifiedShop && closestVerifiedShop.latitude) {
//           originalText = `Original DB GPS : ${Number(closestVerifiedShop.latitude).toFixed(6)}, ${Number(closestVerifiedShop.longitude).toFixed(6)}`;
//         }
//         ctx.fillText(originalText, 10, height - 24);

//         ctx.fillStyle = '#E2E8F0';
//         ctx.font = '9px sans-serif';
//         ctx.fillText(streetAddress, 10, height - 10);

//         const standardPhoto = canvas.toDataURL('image/jpeg', 0.8);
//         let quality = 0.7;
//         let crushedPhoto = canvas.toDataURL('image/jpeg', quality);
//         let sizeInKb = (crushedPhoto.length * 0.75) / 1024;

//         while (sizeInKb > 30 && quality > 0.1) {
//           quality -= 0.1;
//           crushedPhoto = canvas.toDataURL('image/jpeg', Math.max(0.1, quality));
//           sizeInKb = (crushedPhoto.length * 0.75) / 1024;
//         }
        
//         setLocalPhoto(standardPhoto);
//         setLocalPhotoCrushed(crushedPhoto);
//         if (setPhotoUri) setPhotoUri(standardPhoto);
        
//         URL.revokeObjectURL(imgObj.src);
//         if (fileInputRef.current) fileInputRef.current.value = '';
        
//         setLocation({ lat, lng });
//         setNearbyShops(availableOptions);
//         setSelectedShopId(autoSelectId);
        
//         setIsLocating(false);
//         setStep('form');
        
//         if (autoSelectId) {
//           toast.success("Location verified & Shop Auto-Selected!");
//         } else {
//           toast.success("Location logged! Please search and select the unverified shop.");
//         }
//       };

//       // 🚨 FIX 1: Prevent crash if large photos run out of memory before drawing
//       imgObj.onerror = () => {
//         toast.error("Memory error: Could not process this photo. Please try again.");
//         URL.revokeObjectURL(imgObj.src);
//         if (fileInputRef.current) fileInputRef.current.value = '';
//         setIsLocating(false);
//         setStep('camera');
//       };
      
//       imgObj.src = URL.createObjectURL(file);
//     };

//     if (!navigator.geolocation) {
//       toast.error('Geolocation is not supported by your browser.');
//       setIsLocating(false);
//       return;
//     }

//     let isResolved = false;
    
//     // 🚨 FIX 2: Mobile phones need up to 25 seconds for a fresh GPS lock, not 10.
//     const killSwitchTimer = setTimeout(() => {
//       if (!isResolved) {
//         isResolved = true;
//         toast.error("GPS is unresponsive. Step outside or near a window.");
//         setIsLocating(false);
//         setStep('camera');
//       }
//     }, 25000);

//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         if (isResolved) return;
//         isResolved = true;
//         clearTimeout(killSwitchTimer);
//         processLocation(pos.coords.latitude, pos.coords.longitude);
//       },
//       (error) => {
//         if (isResolved) return;
//         isResolved = true;
//         clearTimeout(killSwitchTimer);
        
//         if (error.code === 1) toast.error("Permission Denied! Please allow location access.");
//         else if (error.code === 2) toast.error("GPS is OFF! Please turn ON 'Location' in your phone settings.");
//         else toast.error("Signal Lost! Please step outside or near a window.");
        
//         setIsLocating(false);
//         setStep('camera');
//       },
//       // 🚨 FIX 3: Increased timeout to 20 seconds and allowed a 1-minute cached GPS location to increase success rate
//       { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 }
//     );
//   };

//   const handleSubmitVisit = async (e) => {
//     e.preventDefault();
//     // 🚨 Instant lock to prevent double-tapping
//     if (isSubmitting) return;
//     if (!selectedShopId) return toast.error("Please select a medical shop from the dropdown.");

//     const selectedShop = nearbyShops.find(s => s.id.toString() === selectedShopId.toString());
//     if (!selectedShop) return toast.error("Invalid shop selection.");

//     // 🚨 FLAWLESS LOGIC 5: Submission Validation
//     // We ONLY enforce distance rules on VERIFIED shops.
//     // UNVERIFIED shops are always allowed so they can set the DB baseline!
//     if (selectedShop.isVerified) {
//       if (selectedShop.distance > GEOFENCE_RADIUS_METERS) {
//         toast.error(
//           `GPS Mismatch! 🚨 You are ${selectedShop.distance.toFixed(0)}m away from ${selectedShop.name}. Max allowed is ${GEOFENCE_RADIUS_METERS}m.`, 
//           { duration: 6000 }
//         );
//         return; 
//       }
//     }

//     setIsSubmitting(true);
//     try {
//       const agentId = localStorage.getItem('employeeId') || 'Unknown';

//       const cashVal = parseFloat(formData.cashAmount) || 0;
//       const otherVal = parseFloat(formData.otherAmount) || 0;
//       const totalCollectionVal = cashVal + otherVal;

//       let finalMethod = 'None';
//       if (cashVal > 0 && otherVal > 0) {
//         finalMethod = `Cash & ${formData.otherMethod}`;
//       } else if (cashVal > 0 && otherVal === 0) {
//         finalMethod = 'Cash';
//       } else if (cashVal === 0 && otherVal > 0) {
//         finalMethod = formData.otherMethod;
//       }

//       const payload = {
//         agentId: agentId,
//         targetId: selectedShopId,
//         latitude: location?.lat ? String(location.lat) : null,
//         longitude: location?.lng ? String(location.lng) : null,
//         photoUrl: localPhoto || null,
//         photoUrlCrushed: localPhotoCrushed || null,
//         orderAmount: parseFloat(formData.orderAmount) || 0,
//         collectionAmount: totalCollectionVal, 
//         paymentMethod: finalMethod,          
//         remark: formData.remark || ''
//       };

//       const response = await fetch('/api/sales/visits', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.error || "Failed to log visit.");

//       setStep('camera');
//       setLocalPhoto(null);
//       setLocalPhotoCrushed(null);
//       setLocation(null);
//       setFormData({ orderAmount: '', cashAmount: '', otherAmount: '', otherMethod: 'UPI', remark: '' });

//       if (onRefreshData) onRefreshData();
//       else window.location.reload();

//     } catch (err) {
//       console.error("Submission Error:", err);
//       toast.error(`Error: ${err.message}`);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (!isMounted) return null;

//   return (
//     <div className="flex-1 overflow-y-auto bg-slate-50 relative pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>

//       <input 
//         type="file" 
//         accept="image/jpeg, image/png, image/jpg" 
//         capture="environment" 
//         ref={fileInputRef} 
//         onChange={handleCapture} 
//         className="hidden" 
//       />
      
//       {/* Floating Header Component */}
//       <div ref={dropdownRef} className="sticky top-0 z-30 bg-slate-100 px-5 pt-4 pb-5 rounded-b-xl shadow-md border-b border-white/5 transition-all">
//         <div className="flex items-start justify-between gap-3">
//           <div className="flex-1 min-w-0">
//             <p className="text-[11px] font-semibold text-slate-400 mb-1.5">
//               Choose your working area for today
//             </p>
//             <div className="flex items-center flex-wrap gap-2.5">
//               {selectedArea ? (
//                 <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0b2900] bg-[#97C22A]/10 border border-[#97C22A]/20 rounded-2xl px-3 py-1">
//                   {selectedArea}
//                 </span>
//               ) : (
//                 <span className="text-[14px] text-slate-500 font-medium">No area selected</span>
//               )}
              
//               <button
//                 onClick={() => setIsAreaDropdownOpen((p) => !p)}
//                 className={`inline-flex items-center gap-1.5 text-[12px] font-medium rounded-2xl px-3 py-1 transition-colors ${
//                   isAreaDropdownOpen 
//                     ? 'bg-slate-200 text-red-500 hover:bg-red-500/20' 
//                     : 'bg-slate-200 text-blue-500 hover:bg-blue-500/20'
//                 }`}
//               >
//                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   {isAreaDropdownOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" /> :
//                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />}
//                 </svg>
//                 {selectedArea ? (isAreaDropdownOpen ? 'Close' : 'Change') : 'Select'}
//               </button>
//             </div>
//           </div>

//           <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border shrink-0 mt-1 ${
//             step === 'form' ? 'bg-[#97C22A]/10 border-[#97C22A]/20' : 'bg-white/5 border-white/10'
//           }`}>
//             <span className={` ${step === 'form' ? 'bg-[#97C22A]' : 'bg-slate-500'}`} />
//             <span className={`text-[12px] font-semibold ${step === 'form' ? 'text-slate-700' : 'text-slate-400'}`}>
//               {step === 'camera' ? '🔒 Locked' : '✅ Verified'}
//             </span>
//           </div>
//         </div>

//         {isAreaDropdownOpen && (
//           <div className="absolute top-[100%] left-4 right-4 mt-2 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-40">
//             <div className="p-3 border-b border-slate-100 bg-slate-50/50">
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                   </svg>
//                 </div>
//                 <input
//                   type="text"
//                   placeholder="Search area..."
//                   value={areaSearchQuery}
//                   onChange={(e) => setAreaSearchQuery(e.target.value)}
//                   className="w-full bg-white border border-slate-200 rounded-2xl pl-9 pr-4 py-2.5 text-[16px] font-medium text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all"
//                 />
//               </div>
//             </div>

//             {filteredAreas.length === 0 ? (
//               <div className="p-6 text-center">
//                 <p className="text-[13px] text-slate-500 font-medium m-0">No areas found</p>
//               </div>
//             ) : (
//               <div className="p-3 flex flex-wrap gap-2 max-h-[35vh] overflow-y-auto">
//                {filteredAreas.map((area, index) => {
//                   const sel = area === selectedArea;
//                   return (
//                     <button
//                       key={`${area}-${index}`} 
//                       onClick={() => toggleArea(area)}
//                       className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-[13px] font-semibold transition-all ${
//                         sel 
//                           ? 'bg-[#97C22A] text-[#0a0f1c] shadow-sm' 
//                           : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
//                       }`}
//                     >
//                       {sel && (
//                         <svg className="w-3.5 h-3.5 text-[#0a0f1c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
//                         </svg>
//                       )}
//                       {area}
//                     </button>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//      <div className="px-4 pt-5 flex flex-col gap-4 max-w-lg mx-auto">
        
//         {selectedArea && (
//           <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
//             <div className="flex justify-between items-center mb-2.5">
//               <div className="flex items-center gap-2">
//                 <span className="text-[12px] font-semibold text-slate-500">Daily progress</span>
//                 <span className="text-[13px] font-bold text-[#5C7A1A]">{progress}%</span>
//               </div>
//               <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
//                 <span className="text-[11px] font-semibold text-slate-400">Earned</span>
//                 <span className="text-[12px] font-semibold text-[#1d6e04]">
//                   ₹{safeCollection >= 1000 ? (safeCollection / 1000).toFixed(1) + 'k' : safeCollection.toLocaleString('en-IN')}
//                 </span>
//               </div>
//             </div>
//             <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
//               <div className="h-full bg-[#97C22A] rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
//             </div>
//             <div className="flex divide-x divide-slate-100">
//               {[
//                 { label: 'Total Shops', val: totalCount },
//                 { label: 'Visited', val: visitedCount },
//                 { label: 'Pending', val: totalCount - visitedCount },
//               ].map(({ label, val }) => (
//                 <div key={label} className="flex-1 text-center">
//                   <p className="text-[16px] font-bold text-slate-800 leading-none m-0">{val}</p>
//                   <p className="text-[10px] font-semibold text-slate-400 mt-1">{label}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
     
//         {isLoadingRoute ? (
//           <div className="bg-white rounded-2xl p-10 flex flex-col items-center gap-4 shadow-sm border border-slate-100 mt-2">
//             <svg className="w-8 h-8 text-[#97C22A] animate-spin" fill="none" viewBox="0 0 24 24">
//               <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//               <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//             </svg>
//             <p className="text-[13px] font-medium text-slate-500 m-0">Loading territory data...</p>
//           </div>
//         ) : !selectedArea ? (
//           <div className="bg-white rounded-2xl p-10 flex flex-col items-center text-center shadow-sm border border-slate-100 mt-2">
//             <div className="w-14 h-14 rounded-2xl bg-[#97C22A]/10 flex items-center justify-center mb-5 border border-[#97C22A]/20">
//               <svg className="w-6 h-6 text-[#5C7A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
//                 <circle cx="12" cy="10" r="3" strokeWidth="2" />
//               </svg>
//             </div>
//             <h2 className="text-[17px] font-bold text-slate-900 mb-2">Select working area</h2>
//             <p className="text-[13px] text-slate-500 leading-relaxed mb-6">
//               Choose your territory from the header to view your targets and start logging visits.
//             </p>
//             <button 
//               onClick={() => setIsAreaDropdownOpen(true)} 
//               className="bg-[#0a0f1c] text-white text-[14px] font-bold rounded-2xl px-6 py-3.5 flex items-center gap-2 active:scale-95 transition-transform shadow-sm"
//             >
//               Select area
//             </button>
//           </div>
//         ) : step === 'camera' ? (
//           <div className="bg-white rounded-2xl p-4 flex flex-col items-center text-center shadow-sm border border-slate-100 mt-2">
//             <div className="w-14 h-14 rounded-2xl bg-[#97C22A]/10 flex items-center justify-center mb-3 border border-[#97C22A]/20 relative">
//               {isLocating && <div className="absolute inset-0 border-2 border-[#97C22A] rounded-3xl animate-ping opacity-30" />}
//            <Image 
//   src="/camera.png" 
//   alt="Camera Icon" 
//   width={28} 
//   height={28} 
//   className="w-7 h-7 object-contain" 
// />
//             </div>
//             <p className="text-[12px] font-semibold text-[#97C22A] mb-1.5">Security check 🛡️</p>
//             <h2 className="text-[18px] font-bold text-slate-900 mb-1.5">Field check-in</h2>
//             <p className="text-[13px] text-slate-500 leading-relaxed mb-3 max-w-[300px]">
//               Take a photo of the shop in <span className="font-semibold text-[#fc2666]">{selectedArea}</span>. GPS will auto-detect your location.
//             </p>

//             {isMobile ? (
//               <div className="space-y-3">
//                 {/* <button 
//                   onClick={() => fileInputRef.current?.click()} 
//                   disabled={isLocating} 
//                   className={`w-full px-5 py-4 rounded-2xl text-[14px] font-semibold flex items-center justify-center gap-3 transition-all shadow-sm text-left ${
//                     isLocating ? 'bg-slate-800 text-[#b8ed3b] cursor-not-allowed' : 'bg-[#0a0f1c] text-white active:scale-[0.98]'
//                   }`}
//                 >
//                   <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
//                   </svg>
//                   {isLocating ? 'Analyzing GPS...' : 'Take photo to unlock'}
//                 </button> */}

//                 <button 
//                   type="button"
//                   onClick={() => {
//                     // 🚨 Force clear the input right before opening the camera. 
//                     // This prevents Android/iOS from ignoring the tap if they previously canceled the camera.
//                     if (fileInputRef.current) fileInputRef.current.value = '';
//                     fileInputRef.current?.click();
//                   }} 
//                   disabled={isLocating} 
//                   className={`w-full px-5 py-4 rounded-2xl text-[14px] font-semibold flex items-center justify-center gap-3 transition-all shadow-sm text-left ${
//                     isLocating ? 'bg-slate-800 text-[#b8ed3b] cursor-not-allowed' : 'bg-[#0a0f1c] text-white active:scale-[0.98]'
//                   }`}
//                 >
//                   <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
//                   </svg>
//                   {isLocating ? 'Analyzing GPS...' : 'Take photo to unlock'}
//                 </button>

//                 <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-3.5 flex items-start gap-3 text-left">
//                   <div>
//                     <p className="text-[12px] font-bold flex gap-2 text-[#6e2600] mb-1">⚠️ Strict GPS Protocol Active</p>
//                     <ul className="text-[11px] font-medium text-[#6e2600]/60 space-y-1 list-disc pl-5">
//                       <li>You must be exactly at the shop location.</li>
//                       <li>Photo must clearly show the shop's front board.</li>
//                       <li>All check-ins are recorded and audited.</li>
//                     </ul>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <div className="w-full p-4 rounded-2xl bg-red-50 border border-red-100 text-left shadow-sm">
//                 <div className="text-red-600 text-[14px] font-bold flex items-center justify-start gap-2 mb-1.5">
//                   <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//                   </svg>
//                   Desktop Access Blocked
//                 </div>
//                 <p className="text-[11px] font-medium text-red-500/90 leading-relaxed">
//                   Hardware GPS verification is required. Please switch to your mobile device to check in and submit this form.
//                 </p>
//               </div>
//             )}
            
//           </div>
//         ) : (
//           <div className="animate-in slide-in-from-bottom-4 duration-300 mt-2 flex flex-col gap-4">
            
//             <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
//               <img src={localPhoto} alt="Captured" className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm" />
//               <div className="flex-1">
//                 <p className="text-[12px] font-bold text-[#5C7A1A] flex items-center gap-1.5 m-0">
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> 
//                   GPS Verified
//                 </p>
//                 {/* <button 
//                   onClick={() => setStep('camera')} 
//                   className="text-[12px] font-semibold text-slate-400 mt-1 underline underline-offset-2 active:text-slate-600 transition-colors"
//                 >
//                   Retake photo
//                 </button> */}

//                 <button 
//                   type="button"
//                   onClick={() => {
//                     // 🚨 Wipes all memory so it behaves like a fresh page load
//                     setStep('camera');
//                     setLocalPhoto(null);
//                     setLocalPhotoCrushed(null);
//                     setLocation(null);
//                     setSelectedShopId('');
//                     if (fileInputRef.current) fileInputRef.current.value = '';
//                   }} 
//                   className="text-[12px] font-semibold text-slate-400 mt-1 underline underline-offset-2 active:text-slate-600 transition-colors"
//                 >
//                   Retake photo
//                 </button>
//               </div>
//             </div>

//             <form onSubmit={handleSubmitVisit} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              
//           <div className="mb-5">
//                 <label className="block text-[12px] font-semibold text-slate-500 mb-2">Selected medical shop</label>
                
//                 {/* 🚨 CUSTOM MOBILE-OPTIMIZED SEARCHABLE DROPDOWN */}
//                 <div className="relative" ref={shopDropdownRef}>
                  
//                   {/* The Trigger Button */}
//                   <button
//                     type="button"
//                     onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)}
//                     className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-[14px] font-semibold text-slate-800 flex items-center justify-between transition-colors focus:border-[#97C22A] focus:bg-white"
//                   >
//                     <span className="truncate flex-1 text-left pr-2">
//                       {selectedShopId 
//                         ? (() => {
//                             const s = nearbyShops.find(x => x.id.toString() === selectedShopId.toString());
//                             if (s) {
//                               const placeStr = (s.placeName || s.place) ? ` (${s.placeName || s.place})` : '';
//                              const distStr = s.isVerified && s.distance !== undefined && s.distance < 999999 ? ` - ${(s.distance).toFixed(0)}m` : '';
//                               return `${s.isNewAnchor ? 'First Visit - ' : ''}${s.name}${placeStr}${distStr}`;
//                             }
//                             return 'Select a shop...';
//                           })()
//                         : `Select a shop in ${selectedArea}...`}
//                     </span>
//                     <svg className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${isShopDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
//                   </button>

//                   {/* The Dropdown Menu */}
//                   {isShopDropdownOpen && (
//                     <div className="absolute top-[100%] left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                      
//                       {/* Sticky Search Bar */}
//                       <div className="p-3 border-b border-slate-100 bg-slate-50/90 backdrop-blur-sm sticky top-0 z-10">
//                         <div className="relative">
//                           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                             <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
//                           </div>
//                           <input
//                             type="text"
//                             placeholder="Search shops..."
//                             value={shopSearchQuery}
//                             onChange={(e) => setShopSearchQuery(e.target.value)}
//                             className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-[14px] font-medium text-slate-800 outline-none focus:border-[#97C22A] focus:ring-1 focus:ring-[#97C22A] transition-all"
//                             autoFocus 
//                           />
//                         </div>
//                       </div>

//                       {/* Scrollable Shop List */}
//                       <div className="max-h-[40vh] overflow-y-auto p-2 overscroll-contain">
//                         {filteredNearbyShops.length === 0 ? (
//                           <div className="p-4 text-center text-[13px] text-slate-500 font-medium">
//                             No shops found matching "{shopSearchQuery}"
//                           </div>
//                         ) : (
//                           filteredNearbyShops.map((shop) => {
//                             const isSelected = selectedShopId === shop.id.toString();
//                             return (
//                               <button
//                                 key={shop.id}
//                                 type="button"
//                                 onClick={() => {
//                                   setSelectedShopId(shop.id.toString());
//                                   setIsShopDropdownOpen(false);
//                                   setShopSearchQuery(''); 
//                                 }}
//                                 className={`w-full text-left px-3.5 py-3 rounded-xl mb-1 flex items-center justify-between transition-colors ${
//                                   isSelected 
//                                     ? 'bg-[#97C22A]/10' 
//                                     : 'hover:bg-slate-50'
//                                 }`}
//                               >
//                                 {/* <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
//                                   {!shop.isVerified && (
//                                     <span className="shrink-0 text-[#fc2666] text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-[#fc2666]/30 bg-[#fc2666]/10">
//                                       UNVERIFIED
//                                     </span>
//                                   )}
                                  
//                                   <div className="truncate flex-1 min-w-0 text-left">
//                                     <span className={`text-[14px] font-semibold ${isSelected ? 'text-[#5C7A1A]' : 'text-slate-700'}`}>
//                                       {shop.name}
//                                     </span>
//                                     {(shop.placeName || shop.place) && (
//                                       <span className="text-slate-400 font-normal text-[12px] ml-1.5 inline-block">
//                                         ({shop.placeName || shop.place})
//                                       </span>
//                                     )}
//                                   </div>
//                                 </div> */}

//                                 <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
//                                 <div className="truncate flex-1 min-w-0 text-left flex items-center gap-2">
                                  
//                                   {/* 1. The Color-Coded Place Name Badge FIRST */}
//                                   {(shop.placeName || shop.place) && (
//                                     <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-xl border ${
//                                       shop.isVerified 
//                                         ? 'bg-[#97C22A]/10 text-[#5C7A1A] border-[#97C22A]/20' // 🟢 Light Green for Verified
//                                         : 'bg-red-50 text-red-500 border-red-100'              // 🔴 Light Red for Unverified
//                                     }`}>
//                                       {shop.placeName || shop.place}
//                                     </span>
//                                   )}

//                                   {/* 2. The Shop Name SECOND */}
//                                   <span className={`text-[14px] font-semibold truncate ${isSelected ? 'text-[#5C7A1A]' : 'text-slate-700'}`}>
//                                     {shop.name} {shop.isVerified && shop.distance !== undefined && shop.distance < 999999 && (
//                                   <span className={`text-[12px] font-medium shrink-0 ${isSelected ? 'text-[#5C7A1A]' : 'text-slate-400'}`}>
//                                      ( {shop.distance.toFixed(0)} meters )
//                                   </span>
//                                 )}
//                                   </span>
                                  
//                                 </div>
//                               </div>
                                                              
                                
//                               </button>
//                             );
//                           })
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="mb-4">
//                 <label className="block text-[12px] font-semibold text-slate-500 mb-1.5">
//                   Order / Sales Volume (₹) <span className="font-normal text-slate-400">- New Orders Taken</span>
//                 </label>
//                 <input
//                   type="number"
//                   value={formData.orderAmount}
//                   onChange={(e) => setFormData({...formData, orderAmount: e.target.value})}
//                   placeholder="0"
//                   className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-[15px] font-bold text-slate-800 outline-none focus:border-slate-400 focus:bg-white transition-colors"
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-3 mb-4">
//                 <div>
//                   <label className="block text-[12px] font-semibold text-[#5C7A1A] mb-1.5">Cash Collection (₹)</label>
//                   <input
//                     type="number"
//                     value={formData.cashAmount}
//                     onChange={(e) => setFormData({...formData, cashAmount: e.target.value})}
//                     placeholder="0"
//                     className="w-full bg-[#97C22A]/10 border border-[#97C22A]/30 rounded-2xl px-4 py-3.5 text-[15px] font-bold text-slate-900 outline-none focus:bg-[#97C22A]/20 transition-colors"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-[12px] font-semibold text-blue-600 mb-1.5">Other Collection (₹)</label>
//                   <input
//                     type="number"
//                     value={formData.otherAmount}
//                     onChange={(e) => setFormData({...formData, otherAmount: e.target.value})}
//                     placeholder="0"
//                     className="w-full bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3.5 text-[15px] font-bold text-slate-900 outline-none focus:bg-blue-100 transition-colors"
//                   />
//                 </div>
//               </div>

//               <div className="mb-5" style={{ opacity: formData.otherAmount > 0 ? 1 : 0.4, pointerEvents: formData.otherAmount > 0 ? 'auto' : 'none' }}>
//                 <label className="block text-[12px] font-semibold text-slate-500 mb-2">Method for 'Other Collection'</label>
//                 <div className="grid grid-cols-3 gap-2">
//                   {['UPI', 'Cheque', 'Credit'].map((method) => {
//                     const active = formData.otherMethod === method;
//                     return (
//                       <button
//                         key={method}
//                         type="button"
//                         onClick={() => setFormData({...formData, otherMethod: method})}
//                         className={`py-2.5 text-[12px] font-semibold rounded-2xl transition-all border ${
//                           active 
//                             ? 'bg-[#0a0f1c] text-white border-[#0a0f1c] shadow-sm' 
//                             : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
//                         }`}
//                       >
//                         {method}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>

//               <div className="mb-6">
//                 <label className="block text-[12px] font-semibold text-slate-500 mb-2">Remark / note</label>
//                 <textarea
//                   value={formData.remark}
//                   onChange={(e) => setFormData({...formData, remark: e.target.value})}
//                   placeholder="Optional notes regarding this visit..."
//                   rows="2"
//                   className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-[14px] font-medium text-slate-800 outline-none focus:border-slate-400 focus:bg-white transition-colors resize-none"
//                 ></textarea>
//               </div>

//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className={`w-full py-4 rounded-2xl text-[#0a0f1c] font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-sm ${
//                   isSubmitting ? 'bg-[#97C22A]/70 cursor-not-allowed' : 'bg-[#97C22A] active:scale-[0.98]'
//                 }`}
//               >
//                 {isSubmitting ? (
//                   <>
//                     <svg className="w-5 h-5 animate-spin text-[#0a0f1c]" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     Submitting...
//                   </>
//                 ) : (
//                   'Log this visit'
//                 )}
//               </button>
//             </form>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


'use client';
import { useState, useRef, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image';

// 🚨 IMPORT CAPACITOR NATIVE PLUGINS!
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';

// Highly accurate Haversine distance formula
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
  masterTerritories,
  masterAreas,
  isLoadingRoute,
  totalCollection,
  setPhotoUri,
  onRefreshData
}) {
  const [step, setStep] = useState('camera');
  const [selectedArea, setSelectedArea] = useState(''); 
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
  const [areaSearchQuery, setAreaSearchQuery] = useState(''); 
  const [localPhoto, setLocalPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  
  const [nearbyShops, setNearbyShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState('');
  const [localPhotoCrushed, setLocalPhotoCrushed] = useState(null);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [shopSearchQuery, setShopSearchQuery] = useState('');
  
  const shopDropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // 🚨 STANDARD RADIUS FOR INDIAN MARKETS
  const GEOFENCE_RADIUS_METERS = 500; 

  const [formData, setFormData] = useState({
    orderAmount: '',
    cashAmount: '',
    otherAmount: '',
    otherMethod: 'UPI',
    remark: ''
  });

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsAreaDropdownOpen(false);
      }
      if (shopDropdownRef.current && !shopDropdownRef.current.contains(e.target)) {
        setIsShopDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredNearbyShops = useMemo(() => {
    if (!shopSearchQuery) return nearbyShops;
    return nearbyShops.filter(shop => 
      shop.name.toLowerCase().includes(shopSearchQuery.toLowerCase()) || 
      (shop.placeName && shop.placeName.toLowerCase().includes(shopSearchQuery.toLowerCase()))
    );
  }, [nearbyShops, shopSearchQuery]);

  const uniqueAreas = useMemo(() => {
    const fromMasterTerritories = Array.isArray(masterTerritories) ? masterTerritories.map(a => a.name) : [];
    const fromMasterAreas = Array.isArray(masterAreas) ? masterAreas.map(a => a.name) : [];
    const fromTargets = Array.isArray(targets) ? targets.map(t => t.areaName) : [];

    return [...new Set([...fromMasterTerritories, ...fromMasterAreas, ...fromTargets]
      .filter(Boolean)
      .filter(name => name !== 'Unassigned Area')
    )].sort();
  }, [targets, masterTerritories, masterAreas]);

  const filteredAreas = useMemo(() => {
    if (!areaSearchQuery) return uniqueAreas;
    return uniqueAreas.filter(area => 
      area.toLowerCase().includes(areaSearchQuery.toLowerCase())
    );
  }, [uniqueAreas, areaSearchQuery]);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('assignedSalesArea');
    if (saved) setSelectedArea(saved);
  }, []);

  useEffect(() => {
    if (window.location.hostname === 'localhost') {
      setIsMobile(true);
      return;
    }
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android/i.test(userAgent) || /iPad|iPhone|iPod/.test(userAgent)) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  }, []);

  const toggleArea = (area) => {
    setSelectedArea(area);
    localStorage.setItem('assignedSalesArea', area);
    setIsAreaDropdownOpen(false);
    setAreaSearchQuery('');
    setStep('camera');
    setLocalPhoto(null);
    setLocation(null);
    if (setPhotoUri) setPhotoUri(null);
  };

  const activeTargets = useMemo(() => {
    if (!selectedArea) return [];
    return targets?.filter((t) => t.areaName === selectedArea) || [];
  }, [targets, selectedArea]);

  const visitedCount = activeTargets.filter((t) => t.status === 'COMPLETED').length || 0;
  const totalCount = activeTargets.length || 0;
  const safeCollection = totalCollection || 0;
  const progress = totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;

  // ─────────────────────────────────────────────────────────────────
  // 🚨 REUSABLE LOGIC: Processes Canvas Watermark for BOTH Native & Web
  // ─────────────────────────────────────────────────────────────────
  const processWatermarkAndShop = async (photoSourceData, lat, lng) => {
    let closestVerifiedShop = null;
    let minVerifiedDistance = Infinity;

    let processedShops = activeTargets.map(s => {
      const hasGps = Boolean(s.latitude && s.longitude && s.latitude !== "null" && s.longitude !== "null");
      let dist = hasGps ? getDistance(lat, lng, Number(s.latitude), Number(s.longitude)) : 999999;
      
      if (s.isVerified && hasGps && dist < minVerifiedDistance) {
        minVerifiedDistance = dist;
        closestVerifiedShop = s;
      }

      return { ...s, isNewAnchor: !hasGps, distance: dist };
    });
    
    let availableOptions = processedShops;
    let autoSelectId = "";
    if (closestVerifiedShop && minVerifiedDistance <= GEOFENCE_RADIUS_METERS) {
      autoSelectId = closestVerifiedShop.id.toString();
    }

    availableOptions.sort((a, b) => {
       if (autoSelectId) {
         if (a.id.toString() === autoSelectId) return -1;
         if (b.id.toString() === autoSelectId) return 1;
       }
       if (a.isVerified && !b.isVerified) return -1;
       if (!a.isVerified && b.isVerified) return 1;
       if (a.isVerified && b.isVerified) return a.distance - b.distance;
       return a.name.localeCompare(b.name);
    });

    let streetAddress = "Address location not found";
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.display_name) {
        streetAddress = data.display_name.length > 65
          ? data.display_name.substring(0, 62) + "..."
          : data.display_name;
      }
    } catch (err) {
      console.warn("Could not fetch street address", err);
    }

    const imgObj = document.createElement('img');
    imgObj.onload = () => {
      const MAX_WIDTH = 500;
      const MAX_HEIGHT = 500;
      let width = imgObj.width;
      let height = imgObj.height;

      if (width > height) {
        if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH; }
      } else {
        if (height > MAX_HEIGHT) { width = Math.round((width * MAX_HEIGHT) / height); height = MAX_HEIGHT; }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(imgObj, 0, 0, width, height);

      ctx.fillStyle = 'rgba(10, 15, 26, 0.85)';
      ctx.fillRect(0, height - 70, width, 70);

      ctx.fillStyle = '#97C22A';
      ctx.font = 'bold 12px sans-serif';
      const timeStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      ctx.fillText(`${selectedArea.toUpperCase()} • ${timeStr}`, 10, height - 52);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '10px sans-serif';
      ctx.fillText(`Current GPS : ${lat.toFixed(6)}, ${lng.toFixed(6)}`, 10, height - 38);

      ctx.fillStyle = '#FFB020';
      ctx.font = '10px sans-serif';
      let originalText = "Original DB GPS : UNVERIFIED";
      if (closestVerifiedShop && closestVerifiedShop.latitude) {
        originalText = `Original DB GPS : ${Number(closestVerifiedShop.latitude).toFixed(6)}, ${Number(closestVerifiedShop.longitude).toFixed(6)}`;
      }
      ctx.fillText(originalText, 10, height - 24);

      ctx.fillStyle = '#E2E8F0';
      ctx.font = '9px sans-serif';
      ctx.fillText(streetAddress, 10, height - 10);

      const standardPhoto = canvas.toDataURL('image/jpeg', 0.8);
      let quality = 0.7;
      let crushedPhoto = canvas.toDataURL('image/jpeg', quality);
      let sizeInKb = (crushedPhoto.length * 0.75) / 1024;

      while (sizeInKb > 30 && quality > 0.1) {
        quality -= 0.1;
        crushedPhoto = canvas.toDataURL('image/jpeg', Math.max(0.1, quality));
        sizeInKb = (crushedPhoto.length * 0.75) / 1024;
      }
      
      setLocalPhoto(standardPhoto);
      setLocalPhotoCrushed(crushedPhoto);
      if (setPhotoUri) setPhotoUri(standardPhoto);
      
      setLocation({ lat, lng });
      setNearbyShops(availableOptions);
      setSelectedShopId(autoSelectId);
      
      setIsLocating(false);
      setStep('form');
      
      if (autoSelectId) {
        toast.success("Location verified & Shop Auto-Selected!");
      } else {
        toast.success("Location logged! Please search and select the unverified shop.");
      }
    };

    imgObj.onerror = () => {
      toast.error("Memory error: Could not process this photo. Please try again.");
      setIsLocating(false);
      setStep('camera');
    };
    
    imgObj.src = photoSourceData;
  };

  // ─────────────────────────────────────────────────────────────────
  // 🚨 NATIVE CAPACITOR FLOW (Fixes Android WebView Crash & Lost State)
  // ─────────────────────────────────────────────────────────────────
  const executeNativeCheckIn = async () => {
    setIsLocating(true);
    try {
      // 1. Ask for GPS Permissions securely
      let perm = await Geolocation.checkPermissions();
      if (perm.location !== 'granted') {
        perm = await Geolocation.requestPermissions();
        if (perm.location !== 'granted') throw new Error("Location Denied");
      }

      // 2. Open Native Android Camera 
      // (This pauses the webview safely without killing it!)
      const image = await Camera.getPhoto({
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      // 3. Get accurate Native GPS coordinates
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 60000
      });

      // 4. Send to the processor
      processWatermarkAndShop(image.dataUrl, pos.coords.latitude, pos.coords.longitude);

    } catch (err) {
      console.error("Native Capacitor Error:", err);
      if (err.message && !err.message.includes('User cancelled')) {
        toast.error("Hardware access failed. Check Camera/GPS permissions.");
      }
      setIsLocating(false);
      setStep('camera');
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // 🚨 LEGACY WEB FLOW (Fallback for Desktop/Safari Browsers)
  // ─────────────────────────────────────────────────────────────────
  const handleWebCapture = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const fileAgeInSeconds = (Date.now() - file.lastModified) / 1000;
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (fileAgeInSeconds > 30 && !isLocalhost) {
      toast.error("Gallery uploads are forbidden. Please capture a live photo right now.");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return; 
    }

    setIsLocating(true);

    if (window.location.protocol !== 'https:' && !isLocalhost) {
      toast.error("GPS requires a secure HTTPS connection.");
      setIsLocating(false);
      setStep('camera');
      return;
    }

    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      setIsLocating(false);
      return;
    }

    let isResolved = false;
    const killSwitchTimer = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        toast.error("GPS is unresponsive. Step outside or near a window.");
        setIsLocating(false);
        setStep('camera');
      }
    }, 25000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (isResolved) return;
        isResolved = true;
        clearTimeout(killSwitchTimer);
        
        // Pass to processor
        const tempUrl = URL.createObjectURL(file);
        processWatermarkAndShop(tempUrl, pos.coords.latitude, pos.coords.longitude);
      },
      (error) => {
        if (isResolved) return;
        isResolved = true;
        clearTimeout(killSwitchTimer);
        
        if (error.code === 1) toast.error("Permission Denied! Please allow location access.");
        else if (error.code === 2) toast.error("GPS is OFF! Please turn ON 'Location' in your phone settings.");
        else toast.error("Signal Lost! Please step outside or near a window.");
        
        setIsLocating(false);
        setStep('camera');
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 }
    );
  };

  const handleSubmitVisit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!selectedShopId) return toast.error("Please select a medical shop from the dropdown.");

    const selectedShop = nearbyShops.find(s => s.id.toString() === selectedShopId.toString());
    if (!selectedShop) return toast.error("Invalid shop selection.");

    if (selectedShop.isVerified) {
      if (selectedShop.distance > GEOFENCE_RADIUS_METERS) {
        toast.error(
          `GPS Mismatch! 🚨 You are ${selectedShop.distance.toFixed(0)}m away from ${selectedShop.name}. Max allowed is ${GEOFENCE_RADIUS_METERS}m.`, 
          { duration: 6000 }
        );
        return; 
      }
    }

    setIsSubmitting(true);
    try {
      const agentId = localStorage.getItem('employeeId') || 'Unknown';

      const cashVal = parseFloat(formData.cashAmount) || 0;
      const otherVal = parseFloat(formData.otherAmount) || 0;
      const totalCollectionVal = cashVal + otherVal;

      let finalMethod = 'None';
      if (cashVal > 0 && otherVal > 0) {
        finalMethod = `Cash & ${formData.otherMethod}`;
      } else if (cashVal > 0 && otherVal === 0) {
        finalMethod = 'Cash';
      } else if (cashVal === 0 && otherVal > 0) {
        finalMethod = formData.otherMethod;
      }

      const payload = {
        agentId: agentId,
        targetId: selectedShopId,
        latitude: location?.lat ? String(location.lat) : null,
        longitude: location?.lng ? String(location.lng) : null,
        photoUrl: localPhoto || null,
        photoUrlCrushed: localPhotoCrushed || null,
        orderAmount: parseFloat(formData.orderAmount) || 0,
        collectionAmount: totalCollectionVal, 
        paymentMethod: finalMethod,          
        remark: formData.remark || ''
      };

      const response = await fetch('/api/sales/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to log visit.");

      setStep('camera');
      setLocalPhoto(null);
      setLocalPhotoCrushed(null);
      setLocation(null);
      setFormData({ orderAmount: '', cashAmount: '', otherAmount: '', otherMethod: 'UPI', remark: '' });

      if (onRefreshData) onRefreshData();
      else window.location.reload();

    } catch (err) {
      console.error("Submission Error:", err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 relative pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>

      <input 
        type="file" 
        accept="image/jpeg, image/png, image/jpg" 
        capture="environment" 
        ref={fileInputRef} 
        onChange={handleWebCapture} 
        className="hidden" 
      />
      
      {/* Floating Header Component */}
      <div ref={dropdownRef} className="sticky top-0 z-30 bg-slate-100 px-5 pt-4 pb-5 rounded-b-xl shadow-md border-b border-white/5 transition-all">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-slate-400 mb-1.5">
              Choose your working area for today
            </p>
            <div className="flex items-center flex-wrap gap-2.5">
              {selectedArea ? (
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0b2900] bg-[#97C22A]/10 border border-[#97C22A]/20 rounded-2xl px-3 py-1">
                  {selectedArea}
                </span>
              ) : (
                <span className="text-[14px] text-slate-500 font-medium">No area selected</span>
              )}
              
              <button
                onClick={() => setIsAreaDropdownOpen((p) => !p)}
                className={`inline-flex items-center gap-1.5 text-[12px] font-medium rounded-2xl px-3 py-1 transition-colors ${
                  isAreaDropdownOpen 
                    ? 'bg-slate-200 text-red-500 hover:bg-red-500/20' 
                    : 'bg-slate-200 text-blue-500 hover:bg-blue-500/20'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isAreaDropdownOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" /> :
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />}
                </svg>
                {selectedArea ? (isAreaDropdownOpen ? 'Close' : 'Change') : 'Select'}
              </button>
            </div>
          </div>

          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border shrink-0 mt-1 ${
            step === 'form' ? 'bg-[#97C22A]/10 border-[#97C22A]/20' : 'bg-white/5 border-white/10'
          }`}>
            <span className={` ${step === 'form' ? 'bg-[#97C22A]' : 'bg-slate-500'}`} />
            <span className={`text-[12px] font-semibold ${step === 'form' ? 'text-slate-700' : 'text-slate-400'}`}>
              {step === 'camera' ? '🔒 Locked' : '✅ Verified'}
            </span>
          </div>
        </div>

        {isAreaDropdownOpen && (
          <div className="absolute top-[100%] left-4 right-4 mt-2 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-40">
            <div className="p-3 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search area..."
                  value={areaSearchQuery}
                  onChange={(e) => setAreaSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-9 pr-4 py-2.5 text-[16px] font-medium text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all"
                />
              </div>
            </div>

            {filteredAreas.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-[13px] text-slate-500 font-medium m-0">No areas found</p>
              </div>
            ) : (
              <div className="p-3 flex flex-wrap gap-2 max-h-[35vh] overflow-y-auto">
               {filteredAreas.map((area, index) => {
                  const sel = area === selectedArea;
                  return (
                    <button
                      key={`${area}-${index}`} 
                      onClick={() => toggleArea(area)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-[13px] font-semibold transition-all ${
                        sel 
                          ? 'bg-[#97C22A] text-[#0a0f1c] shadow-sm' 
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      {sel && (
                        <svg className="w-3.5 h-3.5 text-[#0a0f1c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {area}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

     <div className="px-4 pt-5 flex flex-col gap-4 max-w-lg mx-auto">
        
        {selectedArea && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-semibold text-slate-500">Daily progress</span>
                <span className="text-[13px] font-bold text-[#5C7A1A]">{progress}%</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400">Earned</span>
                <span className="text-[12px] font-semibold text-[#1d6e04]">
                  ₹{safeCollection >= 1000 ? (safeCollection / 1000).toFixed(1) + 'k' : safeCollection.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-[#97C22A] rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex divide-x divide-slate-100">
              {[
                { label: 'Total Shops', val: totalCount },
                { label: 'Visited', val: visitedCount },
                { label: 'Pending', val: totalCount - visitedCount },
              ].map(({ label, val }) => (
                <div key={label} className="flex-1 text-center">
                  <p className="text-[16px] font-bold text-slate-800 leading-none m-0">{val}</p>
                  <p className="text-[10px] font-semibold text-slate-400 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
     
        {isLoadingRoute ? (
          <div className="bg-white rounded-2xl p-10 flex flex-col items-center gap-4 shadow-sm border border-slate-100 mt-2">
            <svg className="w-8 h-8 text-[#97C22A] animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-[13px] font-medium text-slate-500 m-0">Loading territory data...</p>
          </div>
        ) : !selectedArea ? (
          <div className="bg-white rounded-2xl p-10 flex flex-col items-center text-center shadow-sm border border-slate-100 mt-2">
            <div className="w-14 h-14 rounded-2xl bg-[#97C22A]/10 flex items-center justify-center mb-5 border border-[#97C22A]/20">
              <svg className="w-6 h-6 text-[#5C7A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" strokeWidth="2" />
              </svg>
            </div>
            <h2 className="text-[17px] font-bold text-slate-900 mb-2">Select working area</h2>
            <p className="text-[13px] text-slate-500 leading-relaxed mb-6">
              Choose your territory from the header to view your targets and start logging visits.
            </p>
            <button 
              onClick={() => setIsAreaDropdownOpen(true)} 
              className="bg-[#0a0f1c] text-white text-[14px] font-bold rounded-2xl px-6 py-3.5 flex items-center gap-2 active:scale-95 transition-transform shadow-sm"
            >
              Select area
            </button>
          </div>
        ) : step === 'camera' ? (
          <div className="bg-white rounded-2xl p-4 flex flex-col items-center text-center shadow-sm border border-slate-100 mt-2">
            <div className="w-14 h-14 rounded-2xl bg-[#97C22A]/10 flex items-center justify-center mb-3 border border-[#97C22A]/20 relative">
              {isLocating && <div className="absolute inset-0 border-2 border-[#97C22A] rounded-3xl animate-ping opacity-30" />}
              <Image 
                src="/camera.png" 
                alt="Camera Icon" 
                width={28} 
                height={28} 
                className="w-7 h-7 object-contain" 
              />
            </div>
            <p className="text-[12px] font-semibold text-[#97C22A] mb-1.5">Security check 🛡️</p>
            <h2 className="text-[18px] font-bold text-slate-900 mb-1.5">Field check-in</h2>
            <p className="text-[13px] text-slate-500 leading-relaxed mb-3 max-w-[300px]">
              Take a photo of the shop in <span className="font-semibold text-[#fc2666]">{selectedArea}</span>. GPS will auto-detect your location.
            </p>

            {isMobile ? (
              <div className="space-y-3 w-full">
                
                {/* 🚨 THE NEW NATIVE BUTTON LOGIC */}
                <button 
                  type="button"
                  onClick={async () => {
                    if (Capacitor.isNativePlatform()) {
                      await executeNativeCheckIn(); // Triggers safe Capacitor flow
                    } else {
                      if (fileInputRef.current) fileInputRef.current.value = '';
                      fileInputRef.current?.click(); // Triggers standard Web flow
                    }
                  }} 
                  disabled={isLocating} 
                  className={`w-full px-5 py-4 rounded-2xl text-[14px] font-semibold flex items-center justify-center gap-3 transition-all shadow-sm text-left ${
                    isLocating ? 'bg-slate-800 text-[#b8ed3b] cursor-not-allowed' : 'bg-[#0a0f1c] text-white active:scale-[0.98]'
                  }`}
                >
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                  </svg>
                  {isLocating ? 'Analyzing GPS & Photo...' : 'Take photo to unlock'}
                </button>

                <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-3.5 flex items-start gap-3 text-left">
                  <div>
                    <p className="text-[12px] font-bold flex gap-2 text-[#6e2600] mb-1">⚠️ Strict GPS Protocol Active</p>
                    <ul className="text-[11px] font-medium text-[#6e2600]/60 space-y-1 list-disc pl-5">
                      <li>You must be exactly at the shop location.</li>
                      <li>Photo must clearly show the shop's front board.</li>
                      <li>All check-ins are recorded and audited.</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full p-4 rounded-2xl bg-red-50 border border-red-100 text-left shadow-sm">
                <div className="text-red-600 text-[14px] font-bold flex items-center justify-start gap-2 mb-1.5">
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Desktop Access Blocked
                </div>
                <p className="text-[11px] font-medium text-red-500/90 leading-relaxed">
                  Hardware GPS verification is required. Please switch to your mobile device to check in and submit this form.
                </p>
              </div>
            )}
            
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-4 duration-300 mt-2 flex flex-col gap-4">
            
            <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <img src={localPhoto} alt="Captured" className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm" />
              <div className="flex-1">
                <p className="text-[12px] font-bold text-[#5C7A1A] flex items-center gap-1.5 m-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> 
                  GPS Verified
                </p>

                <button 
                  type="button"
                  onClick={() => {
                    setStep('camera');
                    setLocalPhoto(null);
                    setLocalPhotoCrushed(null);
                    setLocation(null);
                    setSelectedShopId('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }} 
                  className="text-[12px] font-semibold text-slate-400 mt-1 underline underline-offset-2 active:text-slate-600 transition-colors"
                >
                  Retake photo
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitVisit} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              
              <div className="mb-5">
                <label className="block text-[12px] font-semibold text-slate-500 mb-2">Selected medical shop</label>
                
                <div className="relative" ref={shopDropdownRef}>
                  
                  <button
                    type="button"
                    onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-[14px] font-semibold text-slate-800 flex items-center justify-between transition-colors focus:border-[#97C22A] focus:bg-white"
                  >
                    <span className="truncate flex-1 text-left pr-2">
                      {selectedShopId 
                        ? (() => {
                            const s = nearbyShops.find(x => x.id.toString() === selectedShopId.toString());
                            if (s) {
                              const placeStr = (s.placeName || s.place) ? ` (${s.placeName || s.place})` : '';
                             const distStr = s.isVerified && s.distance !== undefined && s.distance < 999999 ? ` - ${(s.distance).toFixed(0)}m` : '';
                              return `${s.isNewAnchor ? 'First Visit - ' : ''}${s.name}${placeStr}${distStr}`;
                            }
                            return 'Select a shop...';
                          })()
                        : `Select a shop in ${selectedArea}...`}
                    </span>
                    <svg className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${isShopDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </button>

                  {isShopDropdownOpen && (
                    <div className="absolute top-[100%] left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                      
                      <div className="p-3 border-b border-slate-100 bg-slate-50/90 backdrop-blur-sm sticky top-0 z-10">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                          </div>
                          <input
                            type="text"
                            placeholder="Search shops..."
                            value={shopSearchQuery}
                            onChange={(e) => setShopSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-[14px] font-medium text-slate-800 outline-none focus:border-[#97C22A] focus:ring-1 focus:ring-[#97C22A] transition-all"
                            autoFocus 
                          />
                        </div>
                      </div>

                      <div className="max-h-[40vh] overflow-y-auto p-2 overscroll-contain">
                        {filteredNearbyShops.length === 0 ? (
                          <div className="p-4 text-center text-[13px] text-slate-500 font-medium">
                            No shops found matching "{shopSearchQuery}"
                          </div>
                        ) : (
                          filteredNearbyShops.map((shop) => {
                            const isSelected = selectedShopId === shop.id.toString();
                            return (
                              <button
                                key={shop.id}
                                type="button"
                                onClick={() => {
                                  setSelectedShopId(shop.id.toString());
                                  setIsShopDropdownOpen(false);
                                  setShopSearchQuery(''); 
                                }}
                                className={`w-full text-left px-3.5 py-3 rounded-xl mb-1 flex items-center justify-between transition-colors ${
                                  isSelected 
                                    ? 'bg-[#97C22A]/10' 
                                    : 'hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                                  <div className="truncate flex-1 min-w-0 text-left flex items-center gap-2">
                                    
                                    {(shop.placeName || shop.place) && (
                                      <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-xl border ${
                                        shop.isVerified 
                                          ? 'bg-[#97C22A]/10 text-[#5C7A1A] border-[#97C22A]/20' 
                                          : 'bg-red-50 text-red-500 border-red-100'              
                                      }`}>
                                        {shop.placeName || shop.place}
                                      </span>
                                    )}

                                    <span className={`text-[14px] font-semibold truncate ${isSelected ? 'text-[#5C7A1A]' : 'text-slate-700'}`}>
                                      {shop.name} {shop.isVerified && shop.distance !== undefined && shop.distance < 999999 && (
                                        <span className={`text-[12px] font-medium shrink-0 ${isSelected ? 'text-[#5C7A1A]' : 'text-slate-400'}`}>
                                          ( {shop.distance.toFixed(0)} meters )
                                        </span>
                                      )}
                                    </span>
                                    
                                  </div>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-[12px] font-semibold text-slate-500 mb-1.5">
                  Order / Sales Volume (₹) <span className="font-normal text-slate-400">- New Orders Taken</span>
                </label>
                <input
                  type="number"
                  value={formData.orderAmount}
                  onChange={(e) => setFormData({...formData, orderAmount: e.target.value})}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-[15px] font-bold text-slate-800 outline-none focus:border-slate-400 focus:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-[12px] font-semibold text-[#5C7A1A] mb-1.5">Cash Collection (₹)</label>
                  <input
                    type="number"
                    value={formData.cashAmount}
                    onChange={(e) => setFormData({...formData, cashAmount: e.target.value})}
                    placeholder="0"
                    className="w-full bg-[#97C22A]/10 border border-[#97C22A]/30 rounded-2xl px-4 py-3.5 text-[15px] font-bold text-slate-900 outline-none focus:bg-[#97C22A]/20 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-blue-600 mb-1.5">Other Collection (₹)</label>
                  <input
                    type="number"
                    value={formData.otherAmount}
                    onChange={(e) => setFormData({...formData, otherAmount: e.target.value})}
                    placeholder="0"
                    className="w-full bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3.5 text-[15px] font-bold text-slate-900 outline-none focus:bg-blue-100 transition-colors"
                  />
                </div>
              </div>

              <div className="mb-5" style={{ opacity: formData.otherAmount > 0 ? 1 : 0.4, pointerEvents: formData.otherAmount > 0 ? 'auto' : 'none' }}>
                <label className="block text-[12px] font-semibold text-slate-500 mb-2">Method for 'Other Collection'</label>
                <div className="grid grid-cols-3 gap-2">
                  {['UPI', 'Cheque', 'Credit'].map((method) => {
                    const active = formData.otherMethod === method;
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setFormData({...formData, otherMethod: method})}
                        className={`py-2.5 text-[12px] font-semibold rounded-2xl transition-all border ${
                          active 
                            ? 'bg-[#0a0f1c] text-white border-[#0a0f1c] shadow-sm' 
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {method}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-[12px] font-semibold text-slate-500 mb-2">Remark / note</label>
                <textarea
                  value={formData.remark}
                  onChange={(e) => setFormData({...formData, remark: e.target.value})}
                  placeholder="Optional notes regarding this visit..."
                  rows="2"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-[14px] font-medium text-slate-800 outline-none focus:border-slate-400 focus:bg-white transition-colors resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-2xl text-[#0a0f1c] font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-sm ${
                  isSubmitting ? 'bg-[#97C22A]/70 cursor-not-allowed' : 'bg-[#97C22A] active:scale-[0.98]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-5 h-5 animate-spin text-[#0a0f1c]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Log this visit'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}