// 'use client';
// import { useState, useRef, useMemo } from 'react';

// export default function AddShopTab({ targets, onSuccess, setMobileNav }) {
//   const [step, setStep] = useState('camera'); // 'camera' | 'form'
//   const [photoUri, setPhotoUri] = useState(null);
//   const [coords, setCoords] = useState(null);
//   const [isLocating, setIsLocating] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
  
//   // Use text inputs instead of IDs so we can dynamically create them if they don't exist
//   const [formData, setFormData] = useState({ name: '', address: '', areaName: '', placeName: '' });
//   const fileInputRef = useRef(null);

//   // Extract unique Areas and Places from the existing targets to use as Auto-complete suggestions
//   const uniqueAreas = useMemo(() => [...new Set(targets?.map(t => t.areaName).filter(Boolean))], [targets]);
//   const uniquePlaces = useMemo(() => [...new Set(targets?.map(t => t.placeName).filter(Boolean))], [targets]);

//   // STEP 1: Capture Photo -> Then Lock GPS -> Then Show Form
//   const handleCapture = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setPhotoUri(reader.result);
//         lockLocationAndProceed();
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const lockLocationAndProceed = () => {
//     setIsLocating(true);
//     setStep('loading'); // Show loading state while getting GPS

//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
//           setIsLocating(false);
//           setStep('form'); // Move to form entry
//         },
//         (error) => {
//           alert("GPS Failed! Please enable location services.");
//           setIsLocating(false);
//           setStep('camera'); // Go back if failed
//         },
//         { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
//       );
//     } else {
//       alert("Geolocation is not supported by your browser.");
//       setIsLocating(false);
//       setStep('camera');
//     }
//   };

//   // STEP 2: Submit all data to the new intelligent API
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
//           photoUrl: photoUri // Send the captured image
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
//                 ? 'Please wait while we acquire a high-accuracy GPS lock for this medical shop.' 
//                 : 'Take a clear photo of the medical shop to lock the GPS coordinates and start registration.'}
//             </p>
//             <button 
//               onClick={() => fileInputRef.current?.click()}
//               disabled={step === 'loading'}
//               className="w-full max-w-[260px] mx-auto bg-[#0A0F1A] text-white hover:bg-[#97C22A] hover:text-[#0A0F1A] disabled:opacity-50 rounded-xl py-3 font-bold text-[13px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm group"
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
//               {/* Ghost letter */}
//               <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[64px] font-black text-white/[0.04] leading-none select-none pointer-events-none">
//                 R
//               </span>
//               {/* Ambient glow */}
//               <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(151,194,42,0.18) 0%, transparent 70%)' }} />
//               {/* Signature left stripe */}
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
//                 <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 relative z-10 shrink-0 shadow-sm">
//                   <img src={photoUri} alt="Captured" className="w-full h-full object-cover" />
//                 </div>
//               )}
//             </div>

//             {/* ── FORM BODY ── */}
//             <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-5">
              
//               {/* Datalists for Native HTML Auto-Complete */}
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
//                     className="w-full bg-[#F0F2F5] border border-[#E2E8F0] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#97C22A]/30 focus:border-[#97C22A] transition-all"
//                     value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5">Street Address</label>
//                   <input required type="text" placeholder="e.g. Main Road, Rajarampuri" 
//                     className="w-full bg-[#F0F2F5] border border-[#E2E8F0] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#97C22A]/30 focus:border-[#97C22A] transition-all"
//                     value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
//                   />
//                 </div>

//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5">Area / City</label>
//                     <input required type="text" list="area-list" placeholder="Select or type..." 
//                       className="w-full bg-[#F0F2F5] border border-[#E2E8F0] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-[#97C22A] transition-all"
//                       value={formData.areaName} onChange={e => setFormData({...formData, areaName: e.target.value})}
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5">Place / Zone</label>
//                     <input required type="text" list="place-list" placeholder="Select or type..." 
//                       className="w-full bg-[#F0F2F5] border border-[#E2E8F0] rounded-xl px-4 py-3 text-[13px] font-semibold text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-[#97C22A] transition-all"
//                       value={formData.placeName} onChange={e => setFormData({...formData, placeName: e.target.value})}
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* ── SUBMIT BUTTON ── */}
//               <div className="pt-2">
//                 <button 
//                   type="submit" disabled={isSubmitting}
//                   className="w-full bg-[#0A0F1A] text-white hover:bg-[#97C22A] hover:text-[#0A0F1A] disabled:opacity-50 rounded-xl py-3.5 font-bold text-[13px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm group"
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

'use client';
import { useState, useRef, useMemo } from 'react';

export default function AddShopTab({ targets, onSuccess, setMobileNav }) {
  const [step, setStep] = useState('camera'); // 'camera' | 'loading' | 'form'
  const [photoUri, setPhotoUri] = useState(null);
  const [coords, setCoords] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', address: '', areaName: '', placeName: '' });
  const fileInputRef = useRef(null);

  const uniqueAreas = useMemo(() => [...new Set(targets?.map(t => t.areaName).filter(Boolean))], [targets]);
  const uniquePlaces = useMemo(() => [...new Set(targets?.map(t => t.placeName).filter(Boolean))], [targets]);

  // STEP 1: Capture photo → GPS lock → show form
  const handleCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUri(reader.result);
        lockLocationAndProceed();
      };
      reader.readAsDataURL(file);
    }
  };

  const lockLocationAndProceed = () => {
    setStep('loading');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setStep('form');
        },
        () => {
          alert('GPS Failed! Please enable location services.');
          setStep('camera');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert('Geolocation not supported.');
      setStep('camera');
    }
  };

  // STEP 2: Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!coords) return alert('Missing GPS coordinates!');
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
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onSuccess();
        setMobileNav('route');
      } else {
        throw new Error(data.error || 'Failed to save shop');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const field = (label, key, placeholder, opts = {}) => (
    <div>
      <label className="block text-[9px] font-bold tracking-widest uppercase mb-1.5" style={{ color: '#94A3B8' }}>
        {label}
      </label>
      <input
        required
        type="text"
        placeholder={placeholder}
        list={opts.list}
        value={formData[key]}
        onChange={e => setFormData({ ...formData, [key]: e.target.value })}
        className="w-full rounded-xl px-4 py-2.5 text-[13px] font-semibold placeholder-slate-400 focus:outline-none transition-all"
        style={{
          background: '#F0F2F5',
          border: '1px solid #E2E8F0',
          color: '#1E293B',
        }}
        onFocus={e => {
          e.target.style.borderColor = '#97C22A';
          e.target.style.boxShadow = '0 0 0 3px rgba(151,194,42,0.12)';
        }}
        onBlur={e => {
          e.target.style.borderColor = '#E2E8F0';
          e.target.style.boxShadow = 'none';
        }}
      />
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#F0F2F5] pb-28" style={{ WebkitOverflowScrolling: 'touch' }}>

      {/* Hidden camera input */}
      <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleCapture} className="hidden" />

      {/* ── STICKY HEADER ── */}
      <div className="sticky top-0 z-30 bg-[#0A0F1A] px-4 lg:px-6 py-3 flex items-center justify-between shadow-md">
        <div>
          <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500">Field Sales</p>
          <p className="text-[15px] font-bold text-white mt-0.5">Add Shop</p>
        </div>
        <div
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{ background: 'rgba(151,194,42,0.10)', border: '1px solid rgba(151,194,42,0.2)' }}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${step === 'form' ? 'animate-pulse' : ''}`}
            style={{ background: step === 'form' ? '#97C22A' : '#475569' }}
          />
          <span
            className="text-[9px] font-bold tracking-widest uppercase"
            style={{ color: step === 'form' ? '#97C22A' : '#64748b' }}
          >
            {step === 'form' ? 'GPS Locked' : step === 'loading' ? 'Locking…' : 'Standby'}
          </span>
        </div>
      </div>

      <div className="max-w-xl mx-auto w-full pt-5 px-4">

        {/* ── STEP INDICATOR ── */}
        <div className="flex items-center gap-2 mb-4">
          {['Capture', 'GPS', 'Register'].map((label, i) => {
            const stepIndex = step === 'camera' ? 0 : step === 'loading' ? 1 : 2;
            const active = i === stepIndex;
            const done = i < stepIndex;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all"
                    style={{
                      background: done ? '#97C22A' : active ? '#0A0F1A' : '#E2E8F0',
                      color: done ? '#0A0F1A' : active ? '#97C22A' : '#94A3B8',
                      border: active ? '1.5px solid #97C22A' : 'none',
                    }}
                  >
                    {done ? (
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : i + 1}
                  </div>
                  <span
                    className="text-[10px] font-bold tracking-widest uppercase"
                    style={{ color: active ? '#1E293B' : '#94A3B8' }}
                  >
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className="w-6 h-px"
                    style={{ background: done ? '#97C22A' : '#E2E8F0' }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ── CAMERA / LOADING SCREEN ── */}
        {(step === 'camera' || step === 'loading') && (
          <div
            className="bg-white rounded-2xl overflow-hidden animate-in zoom-in-95 duration-300"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0' }}
          >
            {/* Dark top band */}
            <div className="bg-[#0A0F1A] px-5 py-4 relative overflow-hidden">
              <div
                className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(151,194,42,0.15) 0%, transparent 70%)' }}
              />
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full" style={{ background: '#97C22A' }} />
              <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500 relative z-10 pl-2">Step 1 of 3</p>
              <p className="text-[13px] font-bold text-white relative z-10 pl-2 mt-0.5">
                {step === 'loading' ? 'Locking GPS Coordinates' : 'Verify Location'}
              </p>
            </div>

            {/* Body */}
            <div className="p-8 md:p-12 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(151,194,42,0.10)', border: '1px solid rgba(151,194,42,0.2)' }}
                >
                  {step === 'loading' ? (
                    <div
                      className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                      style={{ borderColor: '#97C22A', borderTopColor: 'transparent' }}
                    />
                  ) : (
                    <svg className="w-7 h-7" style={{ color: '#97C22A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <circle cx="12" cy="13" r="3" strokeWidth="1.8" />
                    </svg>
                  )}
                </div>
                {step === 'loading' && (
                  <div
                    className="absolute inset-0 rounded-2xl animate-ping opacity-10"
                    style={{ background: '#97C22A' }}
                  />
                )}
              </div>

              <p className="text-[13px] font-bold mb-1.5" style={{ color: '#1E293B' }}>
                {step === 'loading' ? 'Acquiring high-accuracy GPS…' : 'Take a shop photo'}
              </p>
              <p className="text-[11px] font-medium max-w-[240px] leading-relaxed mb-8" style={{ color: '#94A3B8' }}>
                {step === 'loading'
                  ? 'Stay near the shop entrance for the best GPS accuracy.'
                  : 'Capture a clear front photo to lock coordinates and begin registration.'}
              </p>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={step === 'loading'}
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-[12px] font-bold text-white active:scale-95 transition-all disabled:opacity-50"
                style={{ background: '#0A0F1A' }}
                onMouseEnter={e => { if (step !== 'loading') { e.currentTarget.style.background = '#97C22A'; e.currentTarget.style.color = '#0A0F1A'; } }}
                onMouseLeave={e => { e.currentTarget.style.background = '#0A0F1A'; e.currentTarget.style.color = 'white'; }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
                {step === 'loading' ? 'Please wait…' : 'Open Camera'}
              </button>
            </div>
          </div>
        )}

        {/* ── FORM SCREEN ── */}
        {step === 'form' && (
          <div
            className="bg-white rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-300"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0' }}
          >
            {/* Dark header */}
            <div className="bg-[#0A0F1A] px-5 py-4 relative overflow-hidden flex items-center justify-between">
              <div
                className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(151,194,42,0.15) 0%, transparent 70%)' }}
              />
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full" style={{ background: '#97C22A' }} />

              <div className="relative z-10 pl-2">
                <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500 mb-0.5">Step 3 of 3</p>
                <p className="text-[13px] font-bold text-white">Register Details</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#97C22A' }} />
                  <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: '#97C22A' }}>GPS Locked</span>
                </div>
              </div>

              {photoUri && (
                <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 relative z-10" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
                  <img src={photoUri} alt="Captured" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Form body */}
            <form onSubmit={handleSubmit} className="p-4 md:p-5 space-y-4">

              <datalist id="area-list">
                {uniqueAreas.map(a => <option key={a} value={a} />)}
              </datalist>
              <datalist id="place-list">
                {uniquePlaces.map(p => <option key={p} value={p} />)}
              </datalist>

              {field('Medical Shop Name', 'name', 'e.g. Apollo Pharmacy')}
              {field('Street Address', 'address', 'e.g. Main Road, Rajarampuri')}

              <div className="grid grid-cols-2 gap-3">
                {field('Area / City', 'areaName', 'Select or type…', { list: 'area-list' })}
                {field('Place / Zone', 'placeName', 'Select or type…', { list: 'place-list' })}
              </div>

              {/* GPS coords display */}
              {coords && (
                <div
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                  style={{ background: 'rgba(151,194,42,0.08)', border: '1px solid rgba(151,194,42,0.18)' }}
                >
                  <svg className="w-3.5 h-3.5 shrink-0" style={{ color: '#97C22A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#97C22A' }}>
                    {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                  </span>
                </div>
              )}

              {/* Submit */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl py-3 text-[12px] font-bold tracking-widest uppercase text-white active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: '#0A0F1A' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#97C22A'; e.currentTarget.style.color = '#0A0F1A'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#0A0F1A'; e.currentTarget.style.color = 'white'; }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin border-current" />
                      Saving…
                    </>
                  ) : (
                    <>
                      Register Medical Shop
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
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