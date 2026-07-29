
// 'use client';
// import { useState, useRef, useEffect, useMemo } from 'react';

// export default function AddShopTab({ targets, onSuccess, setMobileNav }) {
//   const [step, setStep] = useState('camera'); 
//   const [photoUri, setPhotoUri] = useState(null);
//   const [coords, setCoords] = useState(null);
//   const [isLocating, setIsLocating] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isMobile, setIsMobile] = useState(true); // NEW: Mobile tracker
  
//   const [formData, setFormData] = useState({ name: '', address: '', areaName: '', placeName: '' });
//   const fileInputRef = useRef(null);

//   // DB States
//   const [masterAreas, setMasterAreas] = useState([]);
//   const [masterPlaces, setMasterPlaces] = useState([]);
//   const [isLoadingDB, setIsLoadingDB] = useState(true);

//   // NEW: Device Check for Desktop Blocker
//   useEffect(() => {
//     if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
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

//   // 1. Fetch Master Locations from the DB when the tab opens
//   useEffect(() => {
//     const fetchLocations = async () => {
//       try {
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
//     if (masterPlaces.length > 0) return masterPlaces.map(p => p.name).sort();
//     if (targets && targets.length > 0) {
//       const fallback = targets.map(t => t.placeName).filter(Boolean);
//       return [...new Set(fallback)].sort();
//     }
//     return [];
//   }, [formData.areaName, masterAreas, masterPlaces, targets]);

//   // MODIFIED: Canvas compression & Gallery Blocker applied here
//   const handleCapture = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       const img = new Image();
//       img.onload = () => {
//         const MAX_WIDTH = 600;
//         const MAX_HEIGHT = 600;
//         let width = img.width;
//         let height = img.height;

//         if (width > height) {
//           if (width > MAX_WIDTH) { height *= Math.round(MAX_WIDTH / width); width = MAX_WIDTH; }
//         } else {
//           if (height > MAX_HEIGHT) { width *= Math.round(MAX_HEIGHT / height); height = MAX_HEIGHT; }
//         }

//         const canvas = document.createElement('canvas');
//         canvas.width = width; canvas.height = height;
//         const ctx = canvas.getContext('2d');
//         ctx.fillStyle = '#FFFFFF';
//         ctx.fillRect(0, 0, width, height);
//         ctx.drawImage(img, 0, 0, width, height);

//         const compressedPhoto = canvas.toDataURL('image/jpeg', 0.5);
//         setPhotoUri(compressedPhoto);
//         lockLocation();
//       };
//       img.src = event.target.result;
//     };
//     reader.readAsDataURL(file);
    
//     // Clear input to prevent "stuck camera" bug
//     e.target.value = ''; 
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

//   const handleBack = () => {
//     setStep('camera');
//     setPhotoUri(null);
//     setCoords(null);
//   };

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
//           photoUrl: photoUri,
//           isVerified: false
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
//     <div className="flex-1 overflow-y-auto bg-slate-50 relative pb-28" style={{ WebkitOverflowScrolling: 'touch' }}>
      
//       {/* MODIFIED: Explicit MIME types to block gallery */}
//       <input type="file" accept="image/jpeg, image/png, image/jpg" capture="environment" ref={fileInputRef} onChange={handleCapture} className="hidden" />

//       <div className="max-w-lg mx-auto w-full pt-4 px-4 space-y-4">
        
//         {step === 'camera' || step === 'loading' ? (
          
//           <div className="bg-white rounded-2xl p-8 md:p-12 text-center animate-in zoom-in-95 duration-300 shadow-sm border border-slate-200 mt-2">
            
//             <div className="w-20 h-20 bg-[#97C22A]/10 border border-[#97C22A]/20 rounded-3xl flex items-center justify-center mx-auto mb-6 relative">
//               {step === 'loading' && <div className="absolute inset-0 border-2 border-[#97C22A] rounded-3xl animate-ping opacity-40"></div>}
//               <svg className={`w-8 h-8 text-[#5C7A1A] ${step === 'loading' ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
//               </svg>
//             </div>
            
//             <h2 className="text-[18px] font-bold text-slate-900 mb-2">
//               {step === 'loading' ? 'Locking coordinates...' : 'Verify location'}
//             </h2>
            
//             <p className="text-[14px] font-medium text-slate-500 max-w-[280px] mx-auto mb-8 leading-relaxed">
//               {step === 'loading' 
//                 ? 'Please wait while we acquire a high-accuracy GPS lock.' 
//                 : 'Take a clear photo of the medical shop to lock the permanent GPS coordinates.'}
//             </p>
            
//             {/* MODIFIED: Desktop blocker conditional rendering */}
//             {isMobile ? (
//               <button 
//                 onClick={() => fileInputRef.current?.click()}
//                 disabled={step === 'loading'}
//                 className={`w-full py-4 rounded-2xl text-[15px] font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
//                   step === 'loading' 
//                     ? 'bg-slate-800 text-white/50 cursor-not-allowed' 
//                     : 'bg-[#0a0f1c] text-white hover:bg-[#97C22A] hover:text-[#0a0f1c] active:scale-[0.98]'
//                 }`}
//               >
//                 {step === 'loading' ? (
//                   <>
//                     <svg className="w-5 h-5 animate-spin text-white/50" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     Please wait...
//                   </>
//                 ) : (
//                   <>
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
//                     </svg>
//                     Open camera
//                   </>
//                 )}
//               </button>
//             ) : (
//               <div className="w-full py-4 rounded-2xl bg-red-50 border border-red-100
//                text-red-600 text-[14px] font-base flex items-center justify-center gap-2">
//                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//                 </svg>
//                 Please use a mobile phone to add a shop
//               </div>
//             )}
//           </div>

//         ) : (

//           <div className="bg-white w-full rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 shadow-sm border border-slate-200 mt-2">
            
//             <div className="bg-[#0a0f1c] px-5 py-4 flex items-center justify-between overflow-hidden relative">
//               <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#97C22A]/20 blur-2xl rounded-2xl pointer-events-none" />
              
//               <div className="relative z-10 flex items-center gap-3">
//                 <button 
//                   onClick={handleBack}
//                   className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white active:scale-95 transition-all shadow-sm border border-white/5"
//                   aria-label="Go back and retake photo"
//                 >
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
//                   </svg>
//                 </button>

//                 <div>
//                   <p className="text-[12px] font-medium text-slate-400 mb-0.5">Global database</p>
//                   <h3 className="text-[16px] font-bold text-white">Register details</h3>
//                 </div>
//               </div>

//               {photoUri && (
//                 <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 relative z-10 shrink-0 shadow-sm">
//                   <img src={photoUri} alt="Captured" className="w-full h-full object-cover" />
//                 </div>
//               )}
//             </div>

//             <form onSubmit={handleSubmit} className="p-5 space-y-5">
              
//               <datalist id="area-list">
//                 {uniqueAreas.map(area => <option key={area} value={area} />)}
//               </datalist>
//               <datalist id="place-list">
//                 {uniquePlaces.map(place => <option key={place} value={place} />)}
//               </datalist>

//               <div className="space-y-4">
                
//                 <div>
//                   <label className="block text-[13px] font-semibold text-slate-700 mb-2">Medical shop name</label>
//                   <input required type="text" placeholder="e.g. Apollo Pharmacy" 
//                     className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-[14px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#97C22A] transition-colors"
//                     value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-[13px] font-semibold text-slate-700 mb-2">Street address</label>
//                   <input required type="text" placeholder="e.g. Main Road, Rajarampuri" 
//                     className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-[14px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#97C22A] transition-colors"
//                     value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
//                   />
//                 </div>

//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <label className="block text-[13px] font-semibold text-slate-700 mb-2">
//                       Area / city {isLoadingDB && <span className="text-slate-400 font-medium ml-1">(Loading...)</span>}
//                     </label>
//                     <div className="relative">
//                       <input required type="text" list="area-list" placeholder="Select..." 
//                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-10 py-3.5 text-[14px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#97C22A] transition-colors"
//                         value={formData.areaName} onChange={e => setFormData({...formData, areaName: e.target.value})}
//                       />
//                       <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div>
//                     <label className="block text-[13px] font-semibold text-slate-700 mb-2">
//                       Place / zone
//                     </label>
//                     <div className="relative">
//                       <input required type="text" list="place-list" placeholder="Select..." 
//                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-10 py-3.5 text-[14px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#97C22A] transition-colors"
//                         value={formData.placeName} onChange={e => setFormData({...formData, placeName: e.target.value})}
//                       />
//                       <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
                
//                 <p className="text-[12px] font-medium text-slate-500 mt-1">
//                   Tip: Tap the arrows or double-click to see the dropdown list, or just type a new one.
//                 </p>
//               </div>

//               <div className="pt-3">
//                 <button 
//                   type="submit" disabled={isSubmitting}
//                   className="w-full bg-[#0a0f1c] text-white hover:bg-[#97C22A] hover:text-[#0a0f1c] disabled:opacity-60 rounded-2xl py-4 font-bold text-[15px] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm"
//                 >
//                   {isSubmitting ? (
//                     <>
//                       <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                       Saving to database...
//                     </>
//                   ) : (
//                     'Register medical shop'
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

'use client';
import { useState, useRef, useEffect, useMemo } from 'react';

// 🚨 NEW COMPONENT: Searchable & Scrollable Dropdown for Area/Place
const SearchableDropdown = ({ options, value, onChange, placeholder, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-left text-[14px] font-semibold flex justify-between items-center transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white focus:bg-white focus:border-[#97C22A]'
        }`}
      >
        {/* 🚨 TRUNCATE: Prevents long names from breaking the UI */}
        <span className="truncate flex-1 pr-2">{value || placeholder}</span>
        <svg className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>

      {isOpen && (
        <div className="absolute z-[999] w-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input
                type="text"
                autoFocus
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[14px] font-medium outline-none focus:border-[#97c22a] focus:ring-1 focus:ring-[#97c22a] transition-all"
              />
            </div>
          </div>
          {/* Scrollable list */}
          <div className="max-h-52 overflow-y-auto custom-scrollbar p-1.5">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-[13px] text-center text-slate-400 font-medium">No results found</div>
            ) : (
              filteredOptions.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full text-left px-3 py-3 text-[13px] rounded-xl transition-colors mb-0.5 truncate ${
                    value === opt 
                      ? 'bg-[#97c22a]/10 font-bold text-[#6a8c1d]' 
                      : 'text-slate-700 hover:bg-slate-100 font-semibold'
                  }`}
                >
                  {opt}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};


export default function AddShopTab({ targets, onSuccess, setMobileNav }) {
  const [step, setStep] = useState('camera'); 
  const [photoUri, setPhotoUri] = useState(null);
  const [coords, setCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  
  const [formData, setFormData] = useState({ name: '', address: '', areaName: '', placeName: '' });
  const fileInputRef = useRef(null);

  const [masterAreas, setMasterAreas] = useState([]);
  const [masterPlaces, setMasterPlaces] = useState([]);
  const [isLoadingDB, setIsLoadingDB] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
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
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) { height *= Math.round(MAX_WIDTH / width); width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= Math.round(MAX_HEIGHT / height); height = MAX_HEIGHT; }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const compressedPhoto = canvas.toDataURL('image/jpeg', 0.5);
        setPhotoUri(compressedPhoto);
        lockLocation();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = ''; 
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
    if (!formData.areaName || !formData.placeName) return alert("Please select an Area and Place.");
    
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
      
      <input type="file" accept="image/jpeg, image/png, image/jpg" capture="environment" ref={fileInputRef} onChange={handleCapture} className="hidden" />

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
            
            {isMobile ? (
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
            ) : (
              <div className="w-full py-4 rounded-2xl bg-red-50 border border-red-100
               text-red-600 text-[14px] font-base flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Please use a mobile phone to add a shop
              </div>
            )}
          </div>

        ) : (

          <div className="bg-white w-full rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 shadow-sm border border-slate-200 mt-2">
            
            <div className="bg-[#0a0f1c] rounded-t-2xl px-5 py-4 flex items-center justify-between overflow-hidden relative">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#97C22A]/20 blur-2xl rounded-2xl pointer-events-none" />
              
              <div className="relative z-10 flex items-center gap-3">
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
                    <label className="block text-[13px] font-semibold text-slate-700 mb-2 flex items-center gap-1">
                      Area / city {isLoadingDB && <span className="text-slate-400 font-medium">(...)</span>}
                    </label>
                    {/* 🚨 REPLACED WITH SEARCHABLE DROPDOWN */}
                    <SearchableDropdown
                      options={uniqueAreas}
                      value={formData.areaName}
                      placeholder="Select Area..."
                      onChange={(val) => setFormData({...formData, areaName: val, placeName: ''})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-2">
                      Place / zone
                    </label>
                    {/* 🚨 REPLACED WITH SEARCHABLE DROPDOWN */}
                    <SearchableDropdown
                      disabled={!formData.areaName}
                      options={uniquePlaces}
                      value={formData.placeName}
                      placeholder="Select Place..."
                      onChange={(val) => setFormData({...formData, placeName: val})}
                    />
                  </div>
                </div>
                
                <p className="text-[12px] font-medium text-slate-500 mt-1">
                  Tip: Select your main working Area first to load the specific Places assigned to it.
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