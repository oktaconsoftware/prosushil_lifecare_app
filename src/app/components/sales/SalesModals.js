'use client';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export function SalesModals({ 
  isRegisterModalOpen, setIsRegisterModalOpen, newShopData, setNewShopData, handleRegisterShop, isRegistering,
  isDealModalOpen, setIsDealModalOpen, activeTarget, dealData, setDealData, handleDealSubmit, isSubmittingDeal,
  photoUri, setPhotoUri, masterTerritories // <-- ADDED THIS PROP
}) {

  const captureVisitPhoto = async () => {
    try {
      const image = await Camera.getPhoto({ quality: 80, allowEditing: false, resultType: CameraResultType.DataUrl, source: CameraSource.Camera });
      setPhotoUri(image.dataUrl);
    } catch (err) {
      setPhotoUri('https://placehold.co/600x400/97c22a/ffffff?text=Mock+Photo+For+Testing');
    }
  };

  // Logic to find places based on the selected area
  const selectedAreaObj = masterTerritories?.find(a => a.id == newShopData.areaId);
  const availablePlaces = selectedAreaObj ? selectedAreaObj.places : [];

  return (
    <>
      {/* 1. REGISTER NEW SHOP MODAL */}
      {isRegisterModalOpen && (
        <div className="absolute inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4" style={{ background: 'rgba(10,15,26,0.7)', backdropFilter: 'blur(6px)' }}>
          <div className="w-full sm:max-w-md bg-white relative overflow-hidden rounded-t-2xl sm:rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <p className="text-[13px] font-semibold text-slate-800">Register New Medical</p>
                <p className="text-[11px] text-slate-500">Add to master database</p>
              </div>
              <button onClick={() => setIsRegisterModalOpen(false)} className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center"><svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            
            <form onSubmit={handleRegisterShop} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* Dynamic Territory Dropdowns */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Select Area</label>
                  <select required value={newShopData.areaId} onChange={e => setNewShopData({...newShopData, areaId: e.target.value, placeId: ''})} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500">
                    <option value="">-- Choose --</option>
                    {masterTerritories?.map(area => (
                      <option key={area.id} value={area.id}>{area.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Select Place</label>
                  <select required disabled={!newShopData.areaId} value={newShopData.placeId} onChange={e => setNewShopData({...newShopData, placeId: e.target.value})} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 disabled:opacity-50">
                    <option value="">-- Choose --</option>
                    {availablePlaces.map(place => (
                      <option key={place.id} value={place.id}>{place.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Shop Name</label>
                <input type="text" required value={newShopData.name} onChange={e => setNewShopData({...newShopData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" placeholder="e.g. Wellness Medicos" />
              </div>
              
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Full Address</label>
                <textarea rows="2" value={newShopData.address} onChange={e => setNewShopData({...newShopData, address: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 resize-none" placeholder="Street, Landmark..."></textarea>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-start gap-3 mt-4">
                <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                <p className="text-[10px] text-blue-800 leading-relaxed">
                  Clicking continue will capture your live GPS location and lock this medical shop to the master database permanently.
                </p>
              </div>

              <button type="submit" disabled={isRegistering || !newShopData.placeId} className="w-full py-3.5 mt-2 bg-blue-600 text-white font-semibold rounded-xl text-[13px] disabled:opacity-50">
                {isRegistering ? 'Processing...' : 'Save & Proceed to Visit'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. LOG VISIT / DEAL MODAL (Keep your existing one here) */}
      {isDealModalOpen && activeTarget && (
         <div className="absolute inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4" style={{ background: 'rgba(10,15,26,0.7)', backdropFilter: 'blur(6px)' }}>
          <div className="w-full sm:max-w-md bg-white relative overflow-hidden rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90dvh]">
            
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
              <div>
                <p className="text-[13px] font-semibold text-slate-800">Log Visit Report</p>
                <p className="text-[11px] text-[#97c22a] font-medium">Verify visit and collect order</p>
              </div>
              <button onClick={() => setIsDealModalOpen(false)} className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center hover:bg-slate-100"><svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            
            <form onSubmit={handleDealSubmit} className="p-5 space-y-5 overflow-y-auto flex-1">
              
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Location</p>
                <h4 className="text-[14px] font-bold text-slate-800 leading-tight">{activeTarget.name}</h4>
                <p className="text-[11px] font-medium text-slate-500 mt-1">{activeTarget.address}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-semibold bg-[#97c22a]/10 text-[#97c22a] px-2 py-0.5 rounded-md border border-[#97c22a]/20">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                  Area: {activeTarget.areaName || 'Newly Discovered'}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Shop Photo (Required)</label>
                {photoUri ? (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden border-2 border-[#97c22a] shadow-sm">
                    <img src={photoUri} alt="Shop Proof" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setPhotoUri(null)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg shadow-lg hover:bg-red-600 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={captureVisitPhoto} className="w-full h-24 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-500 hover:bg-[#97c22a]/5 hover:border-[#97c22a] hover:text-[#97c22a] transition-colors">
                    <svg className="w-6 h-6 mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <span className="text-[11px] font-semibold">Tap to Open Camera</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Order Amount (₹)</label>
                  <input type="number" required min="0" value={dealData.orderAmount} onChange={e => setDealData({...dealData, orderAmount: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-[#97c22a]" placeholder="Min. 0" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Collection Amount (₹)</label>
                  <input type="number" required min="0" value={dealData.collectionAmount} onChange={e => setDealData({...dealData, collectionAmount: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-[#97c22a]" placeholder="Min. 0" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Remark / Notes (Optional)</label>
                <textarea rows="2" value={dealData.remark} onChange={e => setDealData({...dealData, remark: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm resize-none outline-none focus:border-[#97c22a]" placeholder="Doctor unavailable, feedback, etc."></textarea>
              </div>

              <button type="submit" disabled={isSubmittingDeal || !photoUri} className="w-full py-4 mt-2 bg-[#0a0f1a] text-white font-semibold rounded-xl text-[13px] active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {isSubmittingDeal ? 'Saving Data...' : 'Submit & Close Visit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}