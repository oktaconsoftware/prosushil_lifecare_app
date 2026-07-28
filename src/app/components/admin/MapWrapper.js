'use client';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// ─────────────────────────────────────────────────────────
// 🚨 RESTORE DEFAULT LEAFLET PINS
// ─────────────────────────────────────────────────────────
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// ─────────────────────────────────────────────────────────
// 🚨 PREMIUM UI: CUSTOM COLOR-CODED PINS
// ─────────────────────────────────────────────────────────
const getCustomIcon = (orderAmount, index) => {
  const isProductive = Number(orderAmount) > 0;
  const color = isProductive ? '#97C22A' : '#e73e43'; 

  return L.divIcon({
    className: 'custom-pin',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 10px;
        font-weight: bold;
        font-family: sans-serif;
      ">${index + 1}</div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14]
  });
};

// ─────────────────────────────────────────────────────────
// 🚨 SMART AUTO-FRAMING ENGINE
// ─────────────────────────────────────────────────────────
function SmartMapFramer({ visits }) {
  const map = useMap();

  useEffect(() => {
    const validVisits = visits.filter(v => v.latitude && v.longitude);
    if (validVisits.length === 0) return;

    if (validVisits.length === 1) {
      const singlePin = [Number(validVisits[0].latitude), Number(validVisits[0].longitude)];
      map.flyTo(singlePin, 15, { duration: 1.5 });
    } else {
      const bounds = L.latLngBounds(validVisits.map(v => [Number(v.latitude), Number(v.longitude)]));
      map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 16, duration: 1.5 });
    }
  }, [visits, map]);

  return null;
}

export default function MapWrapper({ visits }) {
  const defaultCenter = [16.7050, 74.2433]; 

  const routeCoordinates = visits
    .filter(v => v.latitude && v.longitude)
    .map(v => [Number(v.latitude), Number(v.longitude)]);

  return (
    <MapContainer center={defaultCenter} zoom={10} style={{ height: '100%', width: '100%', zIndex: 10 }}>
      <SmartMapFramer visits={visits} />
      
      <TileLayer 
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
      />
      
      {/* 🚨 ROUTE LINE REMOVED COMPLETELY */}
      
      {visits.map((visit, index) => {
        if (!visit.latitude || !visit.longitude) return null;

        return (
          <Marker 
            key={visit.visitId} 
            position={[Number(visit.latitude), Number(visit.longitude)]}
            icon={getCustomIcon(visit.orderAmount, index)}
          >
            <Popup className="custom-popup border-0 p-0 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-4 min-w-[220px] bg-white rounded-xl">
                
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Stop #{index + 1}
                  </span>
                </div>
                
                <h3 className="text-[15px] font-extrabold text-slate-900 mb-1 leading-tight">
                  {visit.shopName}
                </h3>
                <p className="text-[11px] font-medium text-slate-500 mb-4 leading-relaxed line-clamp-2">
                  {visit.address || 'No address provided'}
                </p>
                
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Order Value</p>
                    <p className="text-[14px] font-black text-slate-800">
                      ₹{Number(visit.orderAmount || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="w-[1px] h-8 bg-slate-200 mx-3"></div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-[#97C22A] uppercase tracking-wider mb-1">Collected</p>
                    <p className="text-[14px] font-black text-[#73961b]">
                      ₹{Number(visit.collectionAmount || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <p className="text-[10px] font-bold uppercase tracking-wider">Visit Time</p>
                  </div>
                  <p className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                    {new Date(visit.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}