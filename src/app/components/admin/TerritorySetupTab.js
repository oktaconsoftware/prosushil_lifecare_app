'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx'; 
import toast from 'react-hot-toast';

// 🚨 ULTIMATE SPEED FIX: Moved ListItem OUTSIDE the main component and wrapped it in React.memo.
// Now, React caches these 300+ buttons and DOES NOT rebuild them every time you type a letter in the search bar.
const ListItem = React.memo(({ item, isSelected, onClick, type, onVerify, onViewPhoto, onEdit, onDelete }) => {
  const isMedical = type === 'medical';
  const isPending = isMedical && !item.isVerified;
  const isVerified = isMedical && item.isVerified;

  let cardStyle = 'border-slate-200 bg-white hover:border-[#97c22a]/50';
  if (isSelected) {
    cardStyle = 'border-[#97c22a] bg-[#f7fceb] shadow-sm ring-1 ring-[#97c22a]/20';
  } else if (isVerified) {
    cardStyle = 'border-[#97c22a]/60 bg-[#f4faeb] hover:border-[#97c22a]'; 
  } else if (isPending) {
    cardStyle = 'border-amber-300 bg-amber-50 hover:border-amber-400'; 
  }

  const totalMedicalsInArea = type === 'area' 
    ? (item.places || []).reduce((sum, place) => sum + (place.medicals?.length || 0), 0) 
    : 0;

  return (
    <div onClick={onClick} className={`w-full p-2.5 rounded-xl border transition-all flex items-center gap-3 group cursor-pointer ${cardStyle}`}>
      {isMedical && (
        <div className="shrink-0">
          {item.hasPhoto ? (
            <div 
              onClick={(e) => { e.stopPropagation(); onViewPhoto(item.id, item.isVerified); }} 
              className="w-10 h-10 rounded-lg bg-[#97c22a]/10 border border-[#97c22a]/30 flex flex-col items-center justify-center text-[9px] text-[#5c7a1a] font-bold text-center leading-tight shadow-sm cursor-pointer hover:bg-[#97c22a]/20 transition-colors"
            >
              <svg className="w-4 h-4 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
              Photo
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[9px] text-slate-400 font-semibold text-center leading-tight shadow-sm">No<br/>Img</div>
          )}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-base font-semibold text-slate-900 truncate">{item.name}</p>
          {isPending && <span className="flex items-center gap-1 bg-amber-100 text-amber-700 border border-amber-200 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span> Pending</span>}
          {isVerified && <span className="flex items-center gap-1 bg-[#97C22A]/10 text-[#97C22A] border border-[#97C22A]/20 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg> Verified</span>}
        </div>
        
        {type === 'area' && <p className="text-sm text-slate-500 truncate">{item.places?.length || 0} Places • {totalMedicalsInArea} Shops</p>}
        {type === 'place' && <p className="text-sm text-slate-500 truncate">{item.medicals?.length || 0} Medical Shops</p>}
        {isMedical && <p className="text-sm text-slate-600 truncate" title={item.address}>{item.address}</p>}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {isMedical && (
          <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" onChange={(e) => onVerify(item.id, e.target.checked)} checked={item.isVerified} />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#97C22A] shadow-inner"></div>
            </label>
          </div>
        )}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); onEdit(type, item); }} className="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(type, item); }} className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
});
ListItem.displayName = 'ListItem'; // Needed for React.memo


export default function TerritorySetupTab() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false); 

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Cascading Selection State
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Modal States
  const [modalMode, setModalMode] = useState(null); 
  const [modalType, setModalType] = useState(null); 
  const [formData, setFormData] = useState({ id: null, name: '', address: '', parentId: null, removeGps: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for Delete Password Verification
  const [deletePassword, setDeletePassword] = useState('');
  
  // Lightbox & Photo State
  const [fullImage, setFullImage] = useState(null);
  const [isFetchingPhoto, setIsFetchingPhoto] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/territories?t=${Date.now()}`, { 
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      });
      
      const json = await res.json();
      setData(json);
      
      if (selectedArea) {
        const updatedArea = json.find(a => a.id === selectedArea.id);
        setSelectedArea(updatedArea || null);
        if (selectedPlace && updatedArea) {
          setSelectedPlace(updatedArea.places.find(p => p.id === selectedPlace.id) || null);
        }
      }
    } catch (err) { 
      console.error("Failed to load territories"); 
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    setSelectedArea(null);
    setSelectedPlace(null);
  }, [debouncedQuery]);

  const downloadTemplate = () => {
    const ws_data = [
      ["Area", "Place", "ShopName", "Address"], 
      ["Kolhapur", "Rajarampuri", "Apollo Pharmacy", "Main Road, Near Bank"],
      ["Sangli", "Vishrambag", "Wellness Medicos", "Station Road"]
    ];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Territories");
    XLSX.writeFile(wb, "Territory_Upload_Template.xlsx");
  };

const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 🚨 1. Start a loading toast immediately
    const toastId = toast.loading('Reading Excel file...');
    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const rawData = XLSX.utils.sheet_to_json(ws);

          const formatted = rawData.map(row => ({
            area: row.Area || row.area,
            place: row.Place || row.place,
            shopName: row.ShopName || row.shopName || row['Shop Name'],
            address: row.Address || row.address || ''
          })).filter(row => row.area && row.place && row.shopName); 

          if (formatted.length === 0) throw new Error("No valid data found in Excel.");

          const CHUNK_SIZE = 2000; 
          let totalSuccess = 0;
          const totalBatches = Math.ceil(formatted.length / CHUNK_SIZE);

          // 🚨 2. Update the toast to show batch progress
          toast.loading(`Uploading batch 1 of ${totalBatches}...`, { id: toastId });

          for (let i = 0; i < formatted.length; i += CHUNK_SIZE) {
            const chunk = formatted.slice(i, i + CHUNK_SIZE);
            const currentBatch = Math.floor(i / CHUNK_SIZE) + 1;

            // Update the toast message for each new chunk
            if (currentBatch > 1) {
              toast.loading(`Uploading batch ${currentBatch} of ${totalBatches}...`, { id: toastId });
            }

            const res = await fetch('/api/admin/territories/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ data: chunk })
            });

            if (!res.ok) {
              const errData = await res.json();
              throw new Error(errData.error || `Upload failed on batch ${currentBatch}`);
            }
            
            totalSuccess += chunk.length;
          }

          // 🚨 3. Change the toast to a Success message when completely finished!
          toast.success(`Success! ${totalSuccess} shops processed safely.`, { id: toastId });
          await fetchData(); 

        } catch (err) {
          // 🚨 4. Change the toast to an Error message if something breaks
          toast.error("Upload Error: " + err.message, { id: toastId });
        } finally {
          setIsUploading(false);
          e.target.value = null; 
        }
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      toast.error("File error: " + err.message, { id: toastId });
      setIsUploading(false);
      e.target.value = null;
    }
  };

  // 🚨 Wrapped handlers in useCallback to maintain memoization performance
  const handleVerify = useCallback(async (medicalId, newStatus) => {
    try {
      const res = await fetch('/api/admin/territories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'medical', id: medicalId, isVerified: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update verification status.");
      await fetchData(); 
    } catch (err) { alert(err.message); }
  }, []);

const handleViewPhoto = useCallback(async (shopId, isVerified) => {
    setIsFetchingPhoto(true);
    try {
      const res = await fetch(`/api/admin/territories/photo?id=${shopId}`);
      if (!res.ok) throw new Error("Could not load photo");
      const data = await res.json();
      
      // 🚨 NEW LOGIC: If verified, show photoUrl2. If not verified (or if photoUrl2 is missing), show photoUrl.
      const imageToShow = isVerified ? (data.photoUrl2 || data.photoUrl) : data.photoUrl;
      
      setFullImage(imageToShow); 
    } catch (err) {
      toast.error(err.message); // Updated to use toast instead of alert
    } finally {
      setIsFetchingPhoto(false);
    }
  }, []);

  const closeModal = () => { 
    setModalMode(null); 
    setModalType(null); 
    setDeletePassword(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const endpoint = '/api/admin/territories';
    let method = modalMode === 'add' ? 'POST' : modalMode === 'edit' ? 'PUT' : 'DELETE';
    
    const payload = { type: modalType, ...formData };
    if (modalMode === 'delete') {
      payload.adminPassword = deletePassword;
    }

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || "Operation failed.");

      closeModal();
      await fetchData(); 
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const grandTotalShops = useMemo(() => {
    return data.reduce((total, area) => {
      return total + (area.places || []).reduce((pTotal, place) => pTotal + (place.medicals?.length || 0), 0);
    }, 0);
  }, [data]);

  const filteredHierarchy = useMemo(() => {
    if (!debouncedQuery.trim()) return data;
    const lowerQ = debouncedQuery.toLowerCase().trim();

    return data.map(area => {
      const areaName = area.name || '';
      const areaMatches = areaName.toLowerCase().includes(lowerQ);
      
      const filteredPlaces = (area.places || []).map(place => {
        const placeName = place.name || '';
        const placeMatches = placeName.toLowerCase().includes(lowerQ);
        
        const filteredMedicals = (place.medicals || []).filter(med => {
          const medName = med.name || '';
          const medAddress = med.address || '';
          return areaMatches || placeMatches || 
            medName.toLowerCase().includes(lowerQ) || 
            medAddress.toLowerCase().includes(lowerQ);
        });
        
        if (placeMatches || filteredMedicals.length > 0) {
          return { ...place, medicals: filteredMedicals };
        }
        return null;
      }).filter(Boolean);

      if (areaMatches || filteredPlaces.length > 0) {
        return { ...area, places: filteredPlaces };
      }
      return null;
    }).filter(Boolean);
  }, [data, debouncedQuery]);

  const activeArea = useMemo(() => {
    if (filteredHierarchy.length === 0) return null;
    if (selectedArea) {
      const found = filteredHierarchy.find(a => a.id === selectedArea.id);
      if (found) return found;
    }
    return filteredHierarchy[0];
  }, [filteredHierarchy, selectedArea]);

  const activePlace = useMemo(() => {
    if (!activeArea || !activeArea.places || activeArea.places.length === 0) return null;
    if (selectedPlace) {
      const found = activeArea.places.find(p => p.id === selectedPlace.id);
      if (found) return found;
    }
    return activeArea.places[0];
  }, [activeArea, selectedPlace]);

  const sortedActiveMedicals = useMemo(() => {
    if (!activePlace || !activePlace.medicals) return [];
    return [...activePlace.medicals].sort((a, b) => {
      if (a.isVerified === b.isVerified) return 0;
      return a.isVerified ? 1 : -1;
    });
  }, [activePlace]);

  const openAddModal = useCallback((type) => {
    setModalMode('add'); setModalType(type);
    setFormData({ id: null, name: '', address: '', parentId: type === 'place' ? activeArea?.id : type === 'medical' ? activePlace?.id : null, removeGps: false });
  }, [activeArea, activePlace]);

  const openEditModal = useCallback((type, item) => {
    setModalMode('edit'); setModalType(type);
    setFormData({ id: item.id, name: item.name, address: item.address || '', removeGps: false });
  }, []);

  const openDeleteModal = useCallback((type, item) => {
    setModalMode('delete'); setModalType(type);
    setFormData({ id: item.id, name: item.name });
    setDeletePassword(''); 
  }, []);

  return (
    <div className="flex-1 overflow-y-auto animate-in fade-in duration-200 bg-slate-50">
      <div className="p-4 md:p-8 lg:p-10 pb-24 md:pb-10 max-w-7xl mx-auto w-full h-full flex flex-col">
        
        {/* HEADER & SEARCH BAR */}
        <div className="mb-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div className="flex-1 w-full xl:max-w-md">
            <h3 className="text-base font-semibold text-slate-800">Geographic Territory Management</h3>
            <div className="mt-3 relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search medical shops, places, or areas..." className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-[13px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#97C22A] focus:ring-1 focus:ring-[#97C22A] transition-all shadow-sm" />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2 xl:mt-0 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0">
            <button onClick={downloadTemplate} className="inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 transition-all shadow-sm active:scale-95">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4-4m4 4V4"></path></svg>
              Download Template
            </button>
            <label className={`shrink-0 cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-bold text-white transition-all shadow-sm ${isUploading ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#0A0F1A] hover:bg-[#97C22A] hover:text-[#0A0F1A] active:scale-95'}`}>
              {isUploading ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Processing...</> : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>Upload Data</>}
              <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} disabled={isUploading} />
            </label>
          </div>
        </div>

        {/* 3-COLUMN HIERARCHY LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-[500px] animate-in fade-in duration-300">
          
          {/* AREA COLUMN */}
          <div className="flex-1 bg-white rounded-2xl flex flex-col overflow-hidden shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h4 className="text-[12px] font-semibold text-slate-800">1. Master Areas <span className='text-red-600'>Total Medical Shops:({grandTotalShops})</span></h4>
              <button onClick={() => openAddModal('area')} className="w-6 h-6 rounded-lg bg-[#97c22a]/10 text-[#97c22a] flex items-center justify-center hover:bg-[#97c22a] hover:text-white transition-colors"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {isLoading ? <p className="text-[11px] text-slate-400 text-center py-4">Loading...</p> : 
               filteredHierarchy.length === 0 ? <p className="text-[11px] text-slate-400 text-center py-4">No matching areas found.</p> :
               filteredHierarchy.slice(0, 100).map(area => 
                 <ListItem key={area.id} type="area" item={area} isSelected={activeArea?.id === area.id} 
                   onClick={() => { setSelectedArea(area); setSelectedPlace(null); }} 
                   onVerify={handleVerify} onViewPhoto={handleViewPhoto} onEdit={openEditModal} onDelete={openDeleteModal} 
                 />)
              }
              {filteredHierarchy.length > 100 && <p className="text-[11px] text-slate-400 text-center py-3 italic">Use search to view more areas...</p>}
            </div>
          </div>

          {/* PLACE COLUMN */}
          <div className="flex-1 bg-white rounded-2xl flex flex-col overflow-hidden shadow-sm border border-slate-200 transition-opacity" style={{ opacity: activeArea ? 1 : 0.4, pointerEvents: activeArea ? 'auto' : 'none' }}>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h4 className="text-[12px] font-semibold text-slate-800">2. Places</h4>
              <button onClick={() => openAddModal('place')} className="w-6 h-6 rounded-lg bg-[#97c22a]/10 text-[#97c22a] flex items-center justify-center hover:bg-[#97c22a] hover:text-white transition-colors"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {!activeArea ? <p className="text-[11px] text-slate-400 text-center py-4">Select an Area first.</p> : 
               !activeArea.places || activeArea.places.length === 0 ? <p className="text-[11px] text-slate-400 text-center py-4">No places added yet.</p> :
               activeArea.places.slice(0, 150).map(place => 
                 <ListItem key={place.id} type="place" item={place} isSelected={activePlace?.id === place.id} 
                   onClick={() => setSelectedPlace(place)} 
                   onVerify={handleVerify} onViewPhoto={handleViewPhoto} onEdit={openEditModal} onDelete={openDeleteModal}
                 />)
              }
              {activeArea?.places?.length > 150 && <p className="text-[11px] text-slate-400 text-center py-3 italic">Use search to view more places...</p>}
            </div>
          </div>

          {/* MEDICAL SHOPS COLUMN */}
          <div className="flex-[1.5] bg-white rounded-2xl flex flex-col overflow-hidden shadow-sm border border-slate-200 transition-opacity" style={{ opacity: activePlace ? 1 : 0.4, pointerEvents: activePlace ? 'auto' : 'none' }}>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h4 className="text-[12px] font-semibold text-slate-800">3. Medical Shops</h4>
              <button onClick={() => openAddModal('medical')} className="px-3 h-7 rounded-lg bg-[#97c22a]/10 text-[#97c22a] text-[11px] font-semibold flex items-center justify-center gap-1.5 hover:bg-[#97c22a] hover:text-white transition-colors"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg> Add Medical</button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/30">
              {!activePlace ? <p className="text-[11px] text-slate-400 text-center py-4">Select a Place first.</p> : 
               !sortedActiveMedicals || sortedActiveMedicals.length === 0 ? <p className="text-[11px] text-slate-400 text-center py-4">No shops registered.</p> :
               sortedActiveMedicals.slice(0, 150).map(med => 
                 <ListItem key={med.id} type="medical" item={med} isSelected={false} 
                   onClick={() => {}} 
                   onVerify={handleVerify} onViewPhoto={handleViewPhoto} onEdit={openEditModal} onDelete={openDeleteModal}
                 />)
              }
              {sortedActiveMedicals.length > 150 && <p className="text-[11px] text-slate-400 text-center py-3 italic bg-white border border-slate-200 rounded-xl mt-2">Showing 150 shops. Use search to find more.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* FULL-SCREEN LIGHTBOX OVERLAY */}
      {fullImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setFullImage(null)}>
          <img src={fullImage} className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" alt="Shop Full View" />
          <button className="absolute top-5 right-5 text-white bg-white/20 hover:bg-white/40 p-2.5 rounded-full transition-colors" onClick={() => setFullImage(null)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* MODAL SYSTEM */}
      {modalMode && (
        <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" style={{ background: 'rgba(10,15,26,0.65)', backdropFilter: 'blur(6px)' }}>
          <div className="w-full sm:max-w-md bg-white overflow-hidden rounded-t-2xl sm:rounded-2xl shadow-2xl">
            
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <p className="text-[13px] font-semibold text-slate-800 capitalize">{modalMode} {modalType}</p>
              <button onClick={closeModal} className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center hover:bg-slate-100"><svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {modalMode === 'delete' ? (
                <div className="text-center pb-2">
                  <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  </div>
                  <p className="text-[13px] font-semibold text-slate-800">Delete {formData.name}?</p>
                  <p className="text-[11px] text-slate-500 mt-1">This will permanently remove it from the system.</p>

                  <div className="mt-5 text-left">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Verify Admin Password</label>
                    <input 
                      type="password" 
                      required 
                      value={deletePassword} 
                      onChange={e => setDeletePassword(e.target.value)} 
                      className="w-full px-4 py-3 bg-white border border-red-200 rounded-xl text-[13px] outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-slate-300" 
                      placeholder="Enter your admin password" 
                    />
                  </div>

                  <button type="submit" disabled={isSubmitting || !deletePassword} className="w-full py-3.5 mt-4 bg-red-500 text-white font-semibold rounded-xl text-[13px] active:scale-[0.98] transition-all disabled:opacity-70">
                    {isSubmitting ? 'Verifying & Deleting...' : 'Yes, Delete'}
                  </button>
                </div>
              ) : (
              <>
                {modalType === 'place' && modalMode === 'add' && <p className="text-[11px] text-slate-500 mb-2">Area: <b>{activeArea?.name}</b></p>}
                {modalType === 'medical' && modalMode === 'add' && <p className="text-[11px] text-slate-500 mb-2">Place: <b>{activePlace?.name}</b></p>}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[13px] outline-none focus:border-[#97c22a]" placeholder="Enter name" />
                </div>

                {modalType === 'medical' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Full Address</label>
                    <textarea rows="2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[13px] outline-none focus:border-[#97c22a] resize-none" placeholder="Full address"></textarea>
                  </div>
                )}
                
                {modalType === 'medical' && modalMode === 'edit' && (
                  <label className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer hover:bg-amber-100 transition-colors mt-2">
                    <input type="checkbox" className="mt-0.5 w-4 h-4 rounded border-amber-400 text-amber-600 focus:ring-amber-500" checked={formData.removeGps || false} onChange={(e) => setFormData({...formData, removeGps: e.target.checked})} />
                    <div>
                      <p className="text-[12px] font-bold text-amber-900">Clear GPS & Photo</p>
                      <p className="text-[11px] text-amber-700 mt-0.5 leading-tight">Check this to set latitude/longitude to null. The field agent will have to re-verify it.</p>
                    </div>
                  </label>
                )}

                <button type="submit" disabled={isSubmitting} className="w-full py-3.5 mt-2 bg-[#0a0f1a] text-white font-semibold rounded-xl text-[13px] active:scale-[0.98] transition-all disabled:opacity-70">
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}