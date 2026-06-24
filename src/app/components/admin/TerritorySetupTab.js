'use client';
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx'; 

export default function TerritorySetupTab() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false); 

  // Cascading Selection State
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Modal States
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | 'delete' | null
  const [modalType, setModalType] = useState(null); // 'area' | 'place' | 'medical'
  const [formData, setFormData] = useState({ id: null, name: '', address: '', parentId: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/territories');
      const json = await res.json();
      setData(json);
      
      // Maintain selection state after refresh
      if (selectedArea) {
        const updatedArea = json.find(a => a.id === selectedArea.id);
        setSelectedArea(updatedArea || null);
        if (selectedPlace && updatedArea) {
          setSelectedPlace(updatedArea.places.find(p => p.id === selectedPlace.id) || null);
        }
      }
    } catch (err) { console.error("Failed to load territories"); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // ── GENERATE & DOWNLOAD EXCEL TEMPLATE ──
  const downloadTemplate = () => {
    // Define headers and some dummy sample data
    const ws_data = [
      ["Area", "Place", "ShopName", "Address"], // Exact column headers
      ["Kolhapur", "Rajarampuri", "Apollo Pharmacy", "Main Road, Near Bank"],
      ["Sangli", "Vishrambag", "Wellness Medicos", "Station Road"]
    ];
    
    // Create Excel workbook and sheet
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Territories");
    
    // Trigger file download
    XLSX.writeFile(wb, "Territory_Upload_Template.xlsx");
  };

  // ── EXCEL UPLOAD HANDLER ──
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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

          // Map Excel columns safely
          const formatted = rawData.map(row => ({
            area: row.Area || row.area,
            place: row.Place || row.place,
            shopName: row.ShopName || row.shopName || row['Shop Name'],
            address: row.Address || row.address || ''
          })).filter(row => row.area && row.place && row.shopName); // Skip empty rows

          if (formatted.length === 0) {
            throw new Error("No valid data found. Ensure your columns are named exactly: Area, Place, ShopName");
          }

          // Send to the backend API you created
          const res = await fetch('/api/admin/territories/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: formatted })
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Upload failed');
          }

          alert(`Successfully uploaded ${formatted.length} shops!`);
          await fetchData(); // Refresh the list
        } catch (err) {
          alert("Error processing Excel: " + err.message);
        } finally {
          setIsUploading(false);
          e.target.value = null; // Reset input
        }
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      alert("File read error: " + err.message);
      setIsUploading(false);
      e.target.value = null;
    }
  };

  // Action Handlers
  const openAddModal = (type) => {
    setModalMode('add'); setModalType(type);
    setFormData({ id: null, name: '', address: '', parentId: type === 'place' ? selectedArea?.id : type === 'medical' ? selectedPlace?.id : null });
  };

  const openEditModal = (type, item) => {
    setModalMode('edit'); setModalType(type);
    setFormData({ id: item.id, name: item.name, address: item.address || '' });
  };

  const openDeleteModal = (type, item) => {
    setModalMode('delete'); setModalType(type);
    setFormData({ id: item.id, name: item.name });
  };

  const closeModal = () => { setModalMode(null); setModalType(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const endpoint = '/api/admin/territories';
    let method = modalMode === 'add' ? 'POST' : modalMode === 'edit' ? 'PUT' : 'DELETE';
    
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: modalType, ...formData })
      });
      
      if (!res.ok) throw new Error("Operation failed. Ensure no agents are linked to this territory before deleting.");

      closeModal();
      await fetchData(); 
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ListItem = ({ item, isSelected, onClick, type }) => (
    <div 
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl border transition-all flex justify-between items-center group cursor-pointer ${isSelected ? 'border-[#97c22a] bg-[#f7fceb]' : 'border-[#f1f5f9] bg-white hover:border-[#97c22a]/30'}`}
    >
      <div>
        <p className="text-[13px] font-semibold text-slate-800">{item.name}</p>
        {type === 'area' && <p className="text-[10px] text-slate-500 mt-0.5">{item.places?.length || 0} Places</p>}
        {type === 'place' && <p className="text-[10px] text-slate-500 mt-0.5">{item.medicals?.length || 0} Medical Shops</p>}
        {type === 'medical' && <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{item.address}</p>}
      </div>
      
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={(e) => { e.stopPropagation(); openEditModal(type, item); }} className="w-6 h-6 rounded bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
        </button>
        <button onClick={(e) => { e.stopPropagation(); openDeleteModal(type, item); }} className="w-6 h-6 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto animate-in fade-in duration-200">
      <div className="p-4 md:p-8 lg:p-10 pb-24 md:pb-10 max-w-7xl mx-auto w-full h-full flex flex-col">
        
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h3 className="text-[13px] md:text-base font-semibold text-slate-800">Geographic Territory Management</h3>
            <p className="text-[11px] font-medium text-slate-500 mt-1">Configure your routing hierarchy.</p>
          </div>

          <div className="flex items-center gap-2">
            {/* ── DOWNLOAD TEMPLATE BUTTON ── */}
            <button 
              onClick={downloadTemplate}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 transition-all shadow-sm active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Download Template
            </button>

            {/* ── UPLOAD EXCEL BUTTON ── */}
            <label className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-bold text-white transition-all shadow-sm ${isUploading ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#0A0F1A] hover:bg-[#97C22A] hover:text-[#0A0F1A] active:scale-95'}`}>
              {isUploading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  Upload Data
                </>
              )}
              <input 
                type="file" 
                className="hidden" 
                accept=".xlsx, .xls" 
                onChange={handleFileUpload} 
                disabled={isUploading}
              />
            </label>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-[500px]">
          
          {/* COLUMN 1: AREAS */}
          <div className="flex-1 bg-white rounded-2xl flex flex-col overflow-hidden" style={{ border: '1px solid #e9edf2' }}>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h4 className="text-[12px] font-semibold text-slate-800">1. Master Areas</h4>
              <button onClick={() => openAddModal('area')} className="w-6 h-6 rounded-lg bg-[#97c22a]/10 text-[#97c22a] flex items-center justify-center hover:bg-[#97c22a] hover:text-white transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {isLoading ? <p className="text-[11px] text-slate-400 text-center py-4">Loading...</p> : 
               data.length === 0 ? <p className="text-[11px] text-slate-400 text-center py-4">No areas found.</p> :
               data.map(area => <ListItem key={area.id} type="area" item={area} isSelected={selectedArea?.id === area.id} onClick={() => { setSelectedArea(area); setSelectedPlace(null); }} />)
              }
            </div>
          </div>

          {/* COLUMN 2: PLACES */}
          <div className="flex-1 bg-white rounded-2xl flex flex-col overflow-hidden transition-opacity" style={{ border: '1px solid #e9edf2', opacity: selectedArea ? 1 : 0.4, pointerEvents: selectedArea ? 'auto' : 'none' }}>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h4 className="text-[12px] font-semibold text-slate-800">2. Places</h4>
              <button onClick={() => openAddModal('place')} className="w-6 h-6 rounded-lg bg-[#97c22a]/10 text-[#97c22a] flex items-center justify-center hover:bg-[#97c22a] hover:text-white transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {!selectedArea ? <p className="text-[11px] text-slate-400 text-center py-4">Select an Area first.</p> : 
               selectedArea.places.length === 0 ? <p className="text-[11px] text-slate-400 text-center py-4">No places added yet.</p> :
               selectedArea.places.map(place => <ListItem key={place.id} type="place" item={place} isSelected={selectedPlace?.id === place.id} onClick={() => setSelectedPlace(place)} />)
              }
            </div>
          </div>

          {/* COLUMN 3: MEDICAL SHOPS */}
          <div className="flex-[1.5] bg-white rounded-2xl flex flex-col overflow-hidden transition-opacity" style={{ border: '1px solid #e9edf2', opacity: selectedPlace ? 1 : 0.4, pointerEvents: selectedPlace ? 'auto' : 'none' }}>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h4 className="text-[12px] font-semibold text-slate-800">3. Medical Shops</h4>
              <button onClick={() => openAddModal('medical')} className="px-3 h-7 rounded-lg bg-[#97c22a]/10 text-[#97c22a] text-[11px] font-semibold flex items-center justify-center gap-1.5 hover:bg-[#97c22a] hover:text-white transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg> Add Medical
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/30">
              {!selectedPlace ? <p className="text-[11px] text-slate-400 text-center py-4">Select a Place first.</p> : 
               selectedPlace.medicals.length === 0 ? <p className="text-[11px] text-slate-400 text-center py-4">No shops registered.</p> :
               selectedPlace.medicals.map(med => <ListItem key={med.id} type="medical" item={med} isSelected={false} onClick={() => {}} />)
              }
            </div>
          </div>

        </div>
      </div>

      {/* MODAL SYSTEM */}
      {modalMode && (
        <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" style={{ background: 'rgba(10,15,26,0.65)', backdropFilter: 'blur(6px)' }}>
          <div className="w-full sm:max-w-md bg-white overflow-hidden rounded-t-2xl sm:rounded-2xl shadow-2xl">
            
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <p className="text-[13px] font-semibold text-slate-800 capitalize">
                {modalMode} {modalType}
              </p>
              <button onClick={closeModal} className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center hover:bg-slate-100"><svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              
              {/* DELETE MODE */}
              {modalMode === 'delete' ? (
                <div className="text-center pb-2">
                  <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  </div>
                  <p className="text-[13px] font-semibold text-slate-800">Delete {formData.name}?</p>
                  <p className="text-[11px] text-slate-500 mt-1">This will permanently remove it from the system.</p>
                  
                  <button type="submit" disabled={isSubmitting} className="w-full py-3.5 mt-6 bg-red-500 text-white font-semibold rounded-xl text-[13px] active:scale-[0.98] transition-all disabled:opacity-70">
                    {isSubmitting ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                </div>
              ) : (
                
              /* ADD/EDIT MODE */
              <>
                {modalType === 'place' && modalMode === 'add' && <p className="text-[11px] text-slate-500 mb-2">Area: <b>{selectedArea.name}</b></p>}
                {modalType === 'medical' && modalMode === 'add' && <p className="text-[11px] text-slate-500 mb-2">Place: <b>{selectedPlace.name}</b></p>}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Medical/Shop Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[13px] outline-none focus:border-[#97c22a]" placeholder="Enter name" />
                </div>

                {modalType === 'medical' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Full Address</label>
                    <textarea rows="2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[13px] outline-none focus:border-[#97c22a] resize-none" placeholder="Full address"></textarea>
                  </div>
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