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

// export default function AddShopTab({ targets, onSuccess, setMobileNav }) {
//   const [step, setStep] = useState('camera'); // 'camera' | 'loading' | 'form'
//   const [photoUri, setPhotoUri] = useState(null);
//   const [coords, setCoords] = useState(null);
//   const [isLocating, setIsLocating] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [autoDetected, setAutoDetected] = useState(false); // Flag to show "Auto-detected!" UI
  
//   const [formData, setFormData] = useState({ name: '', address: '', areaName: '', placeName: '' });
//   const fileInputRef = useRef(null);

//   // Extract unique Areas and Places for Auto-complete dropdown suggestions
//   const uniqueAreas = useMemo(() => [...new Set(targets?.map(t => t.areaName).filter(Boolean))], [targets]);
//   const uniquePlaces = useMemo(() => [...new Set(targets?.map(t => t.placeName).filter(Boolean))], [targets]);

//   // ── STEP 1: CAPTURE PHOTO ──
//   const handleCapture = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setPhotoUri(reader.result);
//         lockLocationAndAutoDetect();
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   // ── STEP 2: LOCK GPS & AUTO-DETECT AREA ──
//   const lockLocationAndAutoDetect = () => {
//     setIsLocating(true);
//     setStep('loading'); 

//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const lat = position.coords.latitude;
//           const lng = position.coords.longitude;
//           setCoords({ lat, lng });

//           // 🤖 AUTO-DETECT LOGIC: Find the closest existing shop
//           if (targets && targets.length > 0) {
//             let closestShop = null;
//             let minDistance = Infinity;

//             targets.forEach(shop => {
//               if (shop.latitude && shop.longitude) {
//                 const dist = getDistance(lat, lng, Number(shop.latitude), Number(shop.longitude));
//                 if (dist < minDistance) {
//                   minDistance = dist;
//                   closestShop = shop;
//                 }
//               }
//             });

//             // If the closest shop is within 10km (10,000 meters), Auto-Fill the Area & Place!
//             if (closestShop && minDistance <= 10000) {
//               setFormData(prev => ({
//                 ...prev,
//                 areaName: closestShop.areaName || '',
//                 placeName: closestShop.placeName || ''
//               }));
//               setAutoDetected(true); // Triggers a green "Auto-Detected" badge in the UI
//             }
//           }

//           setIsLocating(false);
//           setStep('form'); 
//         },
//         (error) => {
//           alert("GPS Failed! Please enable location services.");
//           setIsLocating(false);
//           setStep('camera'); 
//         },
//         { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
//       );
//     } else {
//       alert("Geolocation is not supported by your browser.");
//       setIsLocating(false);
//       setStep('camera');
//     }
//   };

//   // ── STEP 3: SUBMIT TO DATABASE ──
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!coords) return alert("Missing GPS coordinates!");
    
//     setIsSubmitting(true);
//     try {
//       const res = await fetch('/api/sales/shops', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           ...formData,
//           latitude: coords.lat,
//           longitude: coords.lng,
//           photoUrl: photoUri 
//         })
//       });

//       const data = await res.json();

//       if (res.ok) {
//         onSuccess(); // Refresh the dashboard route data
//         setMobileNav('route'); // Send them back to the feed
//       } else {
//         throw new Error(data.error || "Failed to save shop");
//       }
//     } catch (error) {
//       alert(error.message);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="flex-1 overflow-y-auto bg-[#F0F2F5] pb-28" style={{ WebkitOverflowScrolling: 'touch' }}>
      
//       {/* Hidden native camera input */}
//       <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleCapture} className="hidden" />

//       <div className="max-w-2xl mx-auto w-full pt-6 px-4 space-y-6">
        
//         {step === 'camera' || step === 'loading' ? (
          
//           /* ── CAMERA / GPS LOCK SCREEN ── */
//           <div 
//             className="bg-[#FFFFFF] rounded-2xl p-8 md:p-12 text-center animate-in zoom-in-95 duration-300"
//             style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
//           >
//             <div className="w-20 h-20 bg-[#F0F2F5] rounded-full flex items-center justify-center mx-auto mb-6 relative">
//               {step === 'loading' && <div className="absolute inset-0 border-2 border-[#97C22A] rounded-full animate-ping opacity-40"></div>}
//               <svg className={`w-8 h-8 text-[#0A0F1A] ${step === 'loading' ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
//             </div>
//             <h2 className="text-[15px] font-bold text-[#1E293B] mb-2">
//               {step === 'loading' ? 'Locking Coordinates...' : 'Verify Location'}
//             </h2>
//             <p className="text-[11px] font-medium text-[#94A3B8] max-w-[280px] mx-auto mb-8">
//               {step === 'loading' 
//                 ? 'Please wait while we acquire a high-accuracy GPS lock to auto-detect your area.' 
//                 : 'Take a clear photo of the medical shop to lock the GPS coordinates and auto-detect your operating area.'}
//             </p>
//             <button 
//               onClick={() => fileInputRef.current?.click()}
//               disabled={step === 'loading'}
//               className="w-full max-w-[260px] mx-auto bg-[#0A0F1A] text-white hover:bg-[#97C22A] hover:text-[#0A0F1A] disabled:opacity-50 rounded-2xl py-3 font-bold text-[13px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm group"
//             >
//               <svg className="w-4 h-4 text-[#97C22A] group-hover:text-[#0A0F1A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
//               {step === 'loading' ? 'Please Wait...' : 'Open Camera'}
//             </button>
//           </div>

//         ) : (

//           /* ── FORM SCREEN ── */
//           <div 
//             className="bg-[#FFFFFF] w-full rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-300"
//             style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
//           >
            
//             {/* ── DARK HEADER BLOCK ── */}
//             <div className="relative bg-[#0A0F1A] px-4 py-5 md:px-6 flex items-center justify-between overflow-hidden">
//               <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[64px] font-black text-white/[0.04] leading-none select-none pointer-events-none">R</span>
//               <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(151,194,42,0.18) 0%, transparent 70%)' }} />
//               <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#97C22A]" />

//               <div className="relative z-10 pl-2">
//                 <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500 mb-0.5">Global Database</p>
//                 <h3 className="text-[15px] font-bold text-white tracking-wide">Register Details</h3>
//                 <div className="flex items-center gap-1.5 mt-1.5">
//                   <span className="w-1.5 h-1.5 rounded-full bg-[#97C22A] animate-pulse"></span>
//                   <p className="text-[9px] font-bold text-[#97C22A] uppercase tracking-widest">GPS Locked</p>
//                 </div>
//               </div>

//               {photoUri && (
//                 <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 relative z-10 shrink-0 shadow-sm">
//                   <img src={photoUri} alt="Captured" className="w-full h-full object-cover" />
//                 </div>
//               )}
//             </div>

//             {/* ── FORM BODY ── */}
//             <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-5">
              
//               <datalist id="area-list">
//                 {uniqueAreas.map(area => <option key={area} value={area} />)}
//               </datalist>
//               <datalist id="place-list">
//                 {uniquePlaces.map(place => <option key={place} value={place} />)}
//               </datalist>

//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5">Medical Shop Name</label>
//                   <input required type="text" placeholder="e.g. Apollo Pharmacy" 
//                     className="w-full bg-[#F0F2F5] border border-[#E2E8F0] rounded-2xl px-4 py-3 text-[13px] font-semibold text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#97C22A]/30 focus:border-[#97C22A] transition-all"
//                     value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5">Street Address</label>
//                   <input required type="text" placeholder="e.g. Main Road, Rajarampuri" 
//                     className="w-full bg-[#F0F2F5] border border-[#E2E8F0] rounded-2xl px-4 py-3 text-[13px] font-semibold text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#97C22A]/30 focus:border-[#97C22A] transition-all"
//                     value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
//                   />
//                 </div>

//                 <div className="grid grid-cols-2 gap-3 relative">
//                   {/* Auto-Detect Badge */}
//                   {autoDetected && (
//                     <div className="absolute -top-6 right-0 bg-[#97C22A]/10 border border-[#97C22A]/30 text-[#97C22A] px-2 py-0.5 rounded-md text-[9px] font-bold tracking-widest uppercase animate-in fade-in slide-in-from-bottom-1">
//                       Auto-Detected via GPS ✓
//                     </div>
//                   )}
//                   <div>
//                     <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5">Area / City</label>
//                     <input required type="text" list="area-list" placeholder="Select or type..." 
//                       className={`w-full bg-[#F0F2F5] border ${autoDetected ? 'border-[#97C22A]/50 bg-[#97C22A]/5' : 'border-[#E2E8F0]'} rounded-2xl px-4 py-3 text-[13px] font-semibold text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-[#97C22A] transition-all`}
//                       value={formData.areaName} onChange={e => { setFormData({...formData, areaName: e.target.value}); setAutoDetected(false); }}
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5">Place / Zone</label>
//                     <input required type="text" list="place-list" placeholder="Select or type..." 
//                       className={`w-full bg-[#F0F2F5] border ${autoDetected ? 'border-[#97C22A]/50 bg-[#97C22A]/5' : 'border-[#E2E8F0]'} rounded-2xl px-4 py-3 text-[13px] font-semibold text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-[#97C22A] transition-all`}
//                       value={formData.placeName} onChange={e => { setFormData({...formData, placeName: e.target.value}); setAutoDetected(false); }}
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* ── SUBMIT BUTTON ── */}
//               <div className="pt-2">
//                 <button 
//                   type="submit" disabled={isSubmitting}
//                   className="w-full bg-[#0A0F1A] text-white hover:bg-[#97C22A] hover:text-[#0A0F1A] disabled:opacity-50 rounded-2xl py-3.5 font-bold text-[13px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm group"
//                 >
//                   {isSubmitting ? 'Saving to Database...' : 'Register Medical Shop'}
//                   {!isSubmitting && (
//                     <svg className="w-4 h-4 text-[#97C22A] group-hover:text-[#0A0F1A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
//                   )}
//                 </button>
//               </div>
//             </form>

//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// 'use client';
// import { useState, useRef, useEffect, useMemo } from 'react';

// export default function AddShopTab({ targets, onSuccess, setMobileNav }) {
//   const [step, setStep] = useState('camera'); 
//   const [photoUri, setPhotoUri] = useState(null);
//   const [coords, setCoords] = useState(null);
//   const [isLocating, setIsLocating] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
  
//   const [formData, setFormData] = useState({ name: '', address: '', areaName: '', placeName: '' });
//   const fileInputRef = useRef(null);

//   // DB States
//   const [masterAreas, setMasterAreas] = useState([]);
//   const [masterPlaces, setMasterPlaces] = useState([]);
//   const [isLoadingDB, setIsLoadingDB] = useState(true);
// // 1. Fetch Master Locations from the DB when the tab opens
//   useEffect(() => {
//     const fetchLocations = async () => {
//       try {
//         // 🚨 CHANGE THIS LINE BELOW 🚨
//         const res = await fetch('/api/sales/shops/locations'); 
        
//         if (res.ok) {
//           const data = await res.json();
//           if (data.areas) setMasterAreas(data.areas);
//           if (data.places) setMasterPlaces(data.places);
//         }
//       } catch (err) {
//         console.error("Failed to load master locations", err);
//       } finally {
//         setIsLoadingDB(false);
//       }
//     };
//     fetchLocations();
//   }, []);

//   // 2. Safely extract Areas (Fallback to targets if DB fails)
//   const uniqueAreas = useMemo(() => {
//     if (masterAreas.length > 0) {
//       return masterAreas.map(a => a.name).sort();
//     }
//     // Fallback if the API fails for some reason
//     if (targets && targets.length > 0) {
//       const fallback = targets.map(t => t.areaName).filter(Boolean);
//       return [...new Set(fallback)].sort();
//     }
//     return [];
//   }, [masterAreas, targets]);

//   // 3. SMART FILTER: Only show Places linked to the selected Area!
//   const uniquePlaces = useMemo(() => {
//     if (masterAreas.length > 0 && formData.areaName) {
//       const selectedAreaObj = masterAreas.find(
//         a => a.name.toLowerCase() === formData.areaName.toLowerCase()
//       );
//       if (selectedAreaObj) {
//         return masterPlaces
//           .filter(p => p.areaId === selectedAreaObj.id)
//           .map(p => p.name)
//           .sort();
//       }
//     }
//     // Fallback logic
//     if (masterPlaces.length > 0) return masterPlaces.map(p => p.name).sort();
//     if (targets && targets.length > 0) {
//       const fallback = targets.map(t => t.placeName).filter(Boolean);
//       return [...new Set(fallback)].sort();
//     }
//     return [];
//   }, [formData.areaName, masterAreas, masterPlaces, targets]);

//   const handleCapture = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setPhotoUri(reader.result);
//         lockLocation(); 
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const lockLocation = () => {
//     setIsLocating(true);
//     setStep('loading'); 

//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
//           setIsLocating(false);
//           setStep('form'); 
//         },
//         (error) => {
//           alert("GPS Failed! Please enable location services.");
//           setIsLocating(false);
//           setStep('camera'); 
//         },
//         { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
//       );
//     } else {
//       alert("Geolocation is not supported by your browser.");
//       setIsLocating(false);
//       setStep('camera');
//     }
//   };

// const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!coords) return alert("Missing GPS coordinates!");
    
//     setIsSubmitting(true);
//     try {
//       const res = await fetch('/api/sales/shops', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           ...formData,
//           latitude: coords.lat,  
//           longitude: coords.lng, 
//           photoUrl: photoUri,
//           isVerified: false // 👈 ADD THIS: Explicitly mark as unverified
//         })
//       });

//       const data = await res.json();

//       if (res.ok) {
//         onSuccess(); 
//         setMobileNav('route'); 
//       } else {
//         throw new Error(data.error || "Failed to save shop");
//       }
//     } catch (error) {
//       alert(error.message);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="flex-1 overflow-y-auto bg-[#F0F2F5] pb-28" style={{ WebkitOverflowScrolling: 'touch' }}>
      
//       <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleCapture} className="hidden" />

//       <div className="max-w-2xl mx-auto w-full pt-6 px-4 space-y-6">
        
//         {step === 'camera' || step === 'loading' ? (
          
//           <div 
//             className="bg-[#FFFFFF] rounded-2xl p-8 md:p-12 text-center animate-in zoom-in-95 duration-300"
//             style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
//           >
//             <div className="w-20 h-20 bg-[#F0F2F5] rounded-full flex items-center justify-center mx-auto mb-6 relative">
//               {step === 'loading' && <div className="absolute inset-0 border-2 border-[#97C22A] rounded-full animate-ping opacity-40"></div>}
//               <svg className={`w-8 h-8 text-[#0A0F1A] ${step === 'loading' ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
//             </div>
//             <h2 className="text-[15px] font-bold text-[#1E293B] mb-2">
//               {step === 'loading' ? 'Locking Coordinates...' : 'Verify Location'}
//             </h2>
//             <p className="text-[11px] font-medium text-[#94A3B8] max-w-[280px] mx-auto mb-8">
//               {step === 'loading' 
//                 ? 'Please wait while we acquire a high-accuracy GPS lock.' 
//                 : 'Take a clear photo of the medical shop to lock the permanent GPS coordinates.'}
//             </p>
//             <button 
//               onClick={() => fileInputRef.current?.click()}
//               disabled={step === 'loading'}
//               className="w-full max-w-[260px] mx-auto bg-[#0A0F1A] text-white hover:bg-[#97C22A] hover:text-[#0A0F1A] disabled:opacity-50 rounded-2xl py-3 font-bold text-[13px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm group"
//             >
//               {step === 'loading' ? 'Please Wait...' : 'Open Camera'}
//             </button>
//           </div>

//         ) : (

//           <div className="bg-[#FFFFFF] w-full rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-300" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            
//             <div className="relative bg-[#0A0F1A] px-4 py-5 md:px-6 flex items-center justify-between overflow-hidden">
//               <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[64px] font-black text-white/[0.04] leading-none select-none pointer-events-none">R</span>
//               <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(151,194,42,0.18) 0%, transparent 70%)' }} />
//               <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#97C22A]" />

//               <div className="relative z-10 pl-2">
//                 <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500 mb-0.5">Global Database</p>
//                 <h3 className="text-[15px] font-bold text-white tracking-wide">Register Details</h3>
//               </div>

//               {photoUri && (
//                 <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 relative z-10 shrink-0 shadow-sm">
//                   <img src={photoUri} alt="Captured" className="w-full h-full object-cover" />
//                 </div>
//               )}
//             </div>

//             <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-5">
              
//               <datalist id="area-list">
//                 {uniqueAreas.map(area => <option key={area} value={area} />)}
//               </datalist>
//               <datalist id="place-list">
//                 {uniquePlaces.map(place => <option key={place} value={place} />)}
//               </datalist>

//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5">Medical Shop Name</label>
//                   <input required type="text" placeholder="e.g. Apollo Pharmacy" 
//                     className="w-full bg-[#F0F2F5] border border-[#E2E8F0] rounded-2xl px-4 py-3 text-[13px] font-semibold text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#97C22A]/30 focus:border-[#97C22A] transition-all"
//                     value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5">Street Address</label>
//                   <input required type="text" placeholder="e.g. Main Road, Rajarampuri" 
//                     className="w-full bg-[#F0F2F5] border border-[#E2E8F0] rounded-2xl px-4 py-3 text-[13px] font-semibold text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#97C22A]/30 focus:border-[#97C22A] transition-all"
//                     value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
//                   />
//                 </div>

//                 <div className="grid grid-cols-2 gap-3 relative">
//                   <div>
//                     <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5">
//                       Area / City <span className="text-[#97C22A] ml-1">{isLoadingDB ? '(Loading...)' : ''}</span>
//                     </label>
//                     <input required type="text" list="area-list" placeholder="Double-click for list..." 
//                       className="w-full bg-[#F0F2F5] border border-[#E2E8F0] rounded-2xl px-4 py-3 text-[13px] font-semibold text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-[#97C22A] transition-all"
//                       value={formData.areaName} onChange={e => setFormData({...formData, areaName: e.target.value})}
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5">
//                       Place / Zone
//                     </label>
//                     <input required type="text" list="place-list" placeholder="Double-click for list..." 
//                       className="w-full bg-[#F0F2F5] border border-[#E2E8F0] rounded-2xl px-4 py-3 text-[13px] font-semibold text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-[#97C22A] transition-all"
//                       value={formData.placeName} onChange={e => setFormData({...formData, placeName: e.target.value})}
//                     />
//                   </div>
//                 </div>
//                 <p className="text-[10px] text-slate-400 mt-1 italic">Tip: Double-click inside the Area or Place box to see the dropdown list, or just type a new one!</p>
//               </div>

//               <div className="pt-2">
//                 <button 
//                   type="submit" disabled={isSubmitting}
//                   className="w-full bg-[#0A0F1A] text-white hover:bg-[#97C22A] hover:text-[#0A0F1A] disabled:opacity-50 rounded-2xl py-3.5 font-bold text-[13px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm group"
//                 >
//                   {isSubmitting ? 'Saving to Database...' : 'Register Medical Shop'}
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
import { useState, useRef, useEffect, useMemo } from 'react';

export default function AddShopTab({ targets, onSuccess, setMobileNav }) {
  const [step, setStep] = useState('camera'); 
  const [photoUri, setPhotoUri] = useState(null);
  const [coords, setCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', address: '', areaName: '', placeName: '' });
  const fileInputRef = useRef(null);

  // DB States
  const [masterAreas, setMasterAreas] = useState([]);
  const [masterPlaces, setMasterPlaces] = useState([]);
  const [isLoadingDB, setIsLoadingDB] = useState(true);

  // 1. Fetch Master Locations from the DB when the tab opens
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch('/api/sales/shops/locations'); 
        
        if (res.ok) {
          const data = await res.json();
          if (data.areas) setMasterAreas(data.areas);
          if (data.places) setMasterPlaces(data.places);
        }
      } catch (err) {
        console.error("Failed to load master locations", err);
      } finally {
        setIsLoadingDB(false);
      }
    };
    fetchLocations();
  }, []);

  // 2. Safely extract Areas (Fallback to targets if DB fails)
  const uniqueAreas = useMemo(() => {
    if (masterAreas.length > 0) {
      return masterAreas.map(a => a.name).sort();
    }
    if (targets && targets.length > 0) {
      const fallback = targets.map(t => t.areaName).filter(Boolean);
      return [...new Set(fallback)].sort();
    }
    return [];
  }, [masterAreas, targets]);

  // 3. SMART FILTER: Only show Places linked to the selected Area!
  const uniquePlaces = useMemo(() => {
    if (masterAreas.length > 0 && formData.areaName) {
      const selectedAreaObj = masterAreas.find(
        a => a.name.toLowerCase() === formData.areaName.toLowerCase()
      );
      if (selectedAreaObj) {
        return masterPlaces
          .filter(p => p.areaId === selectedAreaObj.id)
          .map(p => p.name)
          .sort();
      }
    }
    if (masterPlaces.length > 0) return masterPlaces.map(p => p.name).sort();
    if (targets && targets.length > 0) {
      const fallback = targets.map(t => t.placeName).filter(Boolean);
      return [...new Set(fallback)].sort();
    }
    return [];
  }, [formData.areaName, masterAreas, masterPlaces, targets]);

  const handleCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUri(reader.result);
        lockLocation(); 
      };
      reader.readAsDataURL(file);
    }
  };

  const lockLocation = () => {
    setIsLocating(true);
    setStep('loading'); 

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
          setIsLocating(false);
          setStep('form'); 
        },
        (error) => {
          alert("GPS Failed! Please enable location services.");
          setIsLocating(false);
          setStep('camera'); 
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsLocating(false);
      setStep('camera');
    }
  };

  const handleBack = () => {
    setStep('camera');
    setPhotoUri(null);
    setCoords(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!coords) return alert("Missing GPS coordinates!");
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/sales/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          latitude: coords.lat,  
          longitude: coords.lng, 
          photoUrl: photoUri,
          isVerified: false
        })
      });

      const data = await res.json();

      if (res.ok) {
        onSuccess(); 
        setMobileNav('route'); 
      } else {
        throw new Error(data.error || "Failed to save shop");
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 relative pb-28" style={{ WebkitOverflowScrolling: 'touch' }}>
      
      <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleCapture} className="hidden" />

      <div className="max-w-lg mx-auto w-full pt-4 px-4 space-y-4">
        
        {step === 'camera' || step === 'loading' ? (
          
          <div className="bg-white rounded-2xl p-8 md:p-12 text-center animate-in zoom-in-95 duration-300 shadow-sm border border-slate-200 mt-2">
            
            <div className="w-20 h-20 bg-[#97C22A]/10 border border-[#97C22A]/20 rounded-3xl flex items-center justify-center mx-auto mb-6 relative">
              {step === 'loading' && <div className="absolute inset-0 border-2 border-[#97C22A] rounded-3xl animate-ping opacity-40"></div>}
              <svg className={`w-8 h-8 text-[#5C7A1A] ${step === 'loading' ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
              </svg>
            </div>
            
            <h2 className="text-[18px] font-bold text-slate-900 mb-2">
              {step === 'loading' ? 'Locking coordinates...' : 'Verify location'}
            </h2>
            
            <p className="text-[14px] font-medium text-slate-500 max-w-[280px] mx-auto mb-8 leading-relaxed">
              {step === 'loading' 
                ? 'Please wait while we acquire a high-accuracy GPS lock.' 
                : 'Take a clear photo of the medical shop to lock the permanent GPS coordinates.'}
            </p>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={step === 'loading'}
              className={`w-full py-4 rounded-2xl text-[15px] font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                step === 'loading' 
                  ? 'bg-slate-800 text-white/50 cursor-not-allowed' 
                  : 'bg-[#0a0f1c] text-white hover:bg-[#97C22A] hover:text-[#0a0f1c] active:scale-[0.98]'
              }`}
            >
              {step === 'loading' ? (
                <>
                  <svg className="w-5 h-5 animate-spin text-white/50" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Please wait...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                  </svg>
                  Open camera
                </>
              )}
            </button>
          </div>

        ) : (

          <div className="bg-white w-full rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 shadow-sm border border-slate-200 mt-2">
            
            <div className="bg-[#0a0f1c] px-5 py-4 flex items-center justify-between overflow-hidden relative">
              {/* Ambient decoration */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#97C22A]/20 blur-2xl rounded-2xl pointer-events-none" />
              
              <div className="relative z-10 flex items-center gap-3">
                {/* ── BACK BUTTON ADDED HERE ── */}
                <button 
                  onClick={handleBack}
                  className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white active:scale-95 transition-all shadow-sm border border-white/5"
                  aria-label="Go back and retake photo"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div>
                  <p className="text-[12px] font-medium text-slate-400 mb-0.5">Global database</p>
                  <h3 className="text-[16px] font-bold text-white">Register details</h3>
                </div>
              </div>

              {photoUri && (
                <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 relative z-10 shrink-0 shadow-sm">
                  <img src={photoUri} alt="Captured" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              
              <datalist id="area-list">
                {uniqueAreas.map(area => <option key={area} value={area} />)}
              </datalist>
              <datalist id="place-list">
                {uniquePlaces.map(place => <option key={place} value={place} />)}
              </datalist>

              <div className="space-y-4">
                
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-2">Medical shop name</label>
                  <input required type="text" placeholder="e.g. Apollo Pharmacy" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-[14px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#97C22A] transition-colors"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-2">Street address</label>
                  <input required type="text" placeholder="e.g. Main Road, Rajarampuri" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-[14px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#97C22A] transition-colors"
                    value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-2">
                      Area / city {isLoadingDB && <span className="text-slate-400 font-medium ml-1">(Loading...)</span>}
                    </label>
                    <div className="relative">
                      <input required type="text" list="area-list" placeholder="Select..." 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-10 py-3.5 text-[14px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#97C22A] transition-colors"
                        value={formData.areaName} onChange={e => setFormData({...formData, areaName: e.target.value})}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-2">
                      Place / zone
                    </label>
                    <div className="relative">
                      <input required type="text" list="place-list" placeholder="Select..." 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-10 py-3.5 text-[14px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#97C22A] transition-colors"
                        value={formData.placeName} onChange={e => setFormData({...formData, placeName: e.target.value})}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-[12px] font-medium text-slate-500 mt-1">
                  Tip: Tap the arrows or double-click to see the dropdown list, or just type a new one.
                </p>
              </div>

              <div className="pt-3">
                <button 
                  type="submit" disabled={isSubmitting}
                  className="w-full bg-[#0a0f1c] text-white hover:bg-[#97C22A] hover:text-[#0a0f1c] disabled:opacity-60 rounded-2xl py-4 font-bold text-[15px] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving to database...
                    </>
                  ) : (
                    'Register medical shop'
                  )}
                </button>
              </div>
              
            </form>

          </div>
        )}
      </div>
    </div>
  );
}