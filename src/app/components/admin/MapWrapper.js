'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Safely restore default Leaflet pins (Next.js breaks these by default)
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

export default function MapWrapper({ visits }) {
  // Default to central Maharashtra if no visits exist
  const defaultCenter = [16.7050, 74.2433]; 
  
  // Center map on the agent's first valid visit location
  const center = visits.length > 0 && visits[0].latitude 
    ? [Number(visits[0].latitude), Number(visits[0].longitude)] 
    : defaultCenter;

  return (
    <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%', zIndex: 10 }}>
      <TileLayer 
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
      />
      
      {visits.map((visit) => {
        // Skip shops that don't have GPS coordinates recorded
        if (!visit.latitude || !visit.longitude) return null;

        return (
          <Marker 
            key={visit.visitId} 
            position={[Number(visit.latitude), Number(visit.longitude)]}
          >
            <Popup className="custom-popup">
              <div className="p-1 min-w-[180px]">
                <p className="text-[13px] font-bold text-slate-900 mb-1">{visit.shopName}</p>
                <p className="text-[10px] text-slate-500 mb-3 leading-tight">{visit.address}</p>
                
                <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Sales</p>
                    <p className="text-[12px] font-bold text-slate-800">₹{Number(visit.orderAmount).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-[#97C22A] uppercase tracking-wider mb-0.5">Collected</p>
                    <p className="text-[12px] font-bold text-[#73961b]">₹{Number(visit.collectionAmount).toLocaleString('en-IN')}</p>
                  </div>
                </div>
                
                <p className="text-[9px] font-semibold text-slate-400 mt-2 text-right">
                  {new Date(visit.time).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}