// 'use client';
// import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';
// import { useEffect } from 'react';

// // ─────────────────────────────────────────────────────────
// // 🚨 RESTORE DEFAULT LEAFLET PINS
// // ─────────────────────────────────────────────────────────
// const DefaultIcon = L.icon({
//   iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
//   iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
//   shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
//   shadowSize: [41, 41]
// });
// L.Marker.prototype.options.icon = DefaultIcon;

// // ─────────────────────────────────────────────────────────
// // 🚨 PREMIUM UI: CUSTOM COLOR-CODED PINS
// // ─────────────────────────────────────────────────────────
// const getCustomIcon = (orderAmount, index) => {
//   const isProductive = Number(orderAmount) > 0;
//   const color = isProductive ? '#97C22A' : '#e73e43'; 

//   return L.divIcon({
//     className: 'custom-pin',
//     html: `
//       <div style="
//         background-color: ${color};
//         width: 24px;
//         height: 24px;
//         border-radius: 50%;
//         border: 3px solid white;
//         box-shadow: 0 4px 10px rgba(0,0,0,0.3);
//         display: flex;
//         align-items: center;
//         justify-content: center;
//         color: white;
//         font-size: 10px;
//         font-weight: bold;
//         font-family: sans-serif;
//       ">${index + 1}</div>
//     `,
//     iconSize: [24, 24],
//     iconAnchor: [12, 12],
//     popupAnchor: [0, -14]
//   });
// };

// // ─────────────────────────────────────────────────────────
// // 🚨 SMART AUTO-FRAMING ENGINE
// // ─────────────────────────────────────────────────────────
// function SmartMapFramer({ visits }) {
//   const map = useMap();

//   useEffect(() => {
//     const validVisits = visits.filter(v => v.latitude && v.longitude);
//     if (validVisits.length === 0) return;

//     if (validVisits.length === 1) {
//       const singlePin = [Number(validVisits[0].latitude), Number(validVisits[0].longitude)];
//       map.flyTo(singlePin, 15, { duration: 1.5 });
//     } else {
//       const bounds = L.latLngBounds(validVisits.map(v => [Number(v.latitude), Number(v.longitude)]));
//       map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 16, duration: 1.5 });
//     }
//   }, [visits, map]);

//   return null;
// }

// export default function MapWrapper({ visits }) {
//   const defaultCenter = [16.7050, 74.2433]; 

//   const routeCoordinates = visits
//     .filter(v => v.latitude && v.longitude)
//     .map(v => [Number(v.latitude), Number(v.longitude)]);

//   return (
//     <MapContainer center={defaultCenter} zoom={10} style={{ height: '100%', width: '100%', zIndex: 10 }}>
//       <SmartMapFramer visits={visits} />
      
//       <TileLayer 
//         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
//       />
      
//       {/* 🚨 ROUTE LINE REMOVED COMPLETELY */}
      
//       {visits.map((visit, index) => {
//         if (!visit.latitude || !visit.longitude) return null;

//         return (
//           <Marker 
//             key={visit.visitId} 
//             position={[Number(visit.latitude), Number(visit.longitude)]}
//             icon={getCustomIcon(visit.orderAmount, index)}
//           >
//             <Popup className="custom-popup border-0 p-0 rounded-2xl overflow-hidden shadow-2xl">
//               <div className="p-4 min-w-[220px] bg-white rounded-xl">
                
//                 <div className="flex items-center gap-2 mb-1">
//                   <span className="bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
//                     Stop #{index + 1}
//                   </span>
//                 </div>
                
//                 <h3 className="text-[15px] font-extrabold text-slate-900 mb-1 leading-tight">
//                   {visit.shopName}
//                 </h3>
//                 <p className="text-[11px] font-medium text-slate-500 mb-4 leading-relaxed line-clamp-2">
//                   {visit.address || 'No address provided'}
//                 </p>
                
//                 <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3">
//                   <div>
//                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Order Value</p>
//                     <p className="text-[14px] font-black text-slate-800">
//                       ₹{Number(visit.orderAmount || 0).toLocaleString('en-IN')}
//                     </p>
//                   </div>
//                   <div className="w-[1px] h-8 bg-slate-200 mx-3"></div>
//                   <div className="text-right">
//                     <p className="text-[9px] font-bold text-[#97C22A] uppercase tracking-wider mb-1">Collected</p>
//                     <p className="text-[14px] font-black text-[#73961b]">
//                       ₹{Number(visit.collectionAmount || 0).toLocaleString('en-IN')}
//                     </p>
//                   </div>
//                 </div>
                
//                 <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
//                   <div className="flex items-center gap-1.5 text-slate-400">
//                     <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
//                     <p className="text-[10px] font-bold uppercase tracking-wider">Visit Time</p>
//                   </div>
//                   <p className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
//                     {new Date(visit.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
//                   </p>
//                 </div>

//               </div>
//             </Popup>
//           </Marker>
//         );
//       })}
//     </MapContainer>
//   );
// }



"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// ---------------------------------------------------------
// WEEKDAY PIN COLORS
// ---------------------------------------------------------
const WEEKDAY_PIN_COLORS = {
  Monday: {
    color: "#16A34A",
    textColor: "#FFFFFF",
    label: "Monday",
  },
  Tuesday: {
    color: "#FACC15",
    textColor: "#111827",
    label: "Tuesday",
  },
  Wednesday: {
    color: "#EC4899",
    textColor: "#FFFFFF",
    label: "Wednesday",
  },
  Thursday: {
    color: "#3B82F6",
    textColor: "#FFFFFF",
    label: "Thursday",
  },
  Friday: {
    color: "#8B5CF6",
    textColor: "#FFFFFF",
    label: "Friday",
  },
  Saturday: {
    color: "#F97316",
    textColor: "#FFFFFF",
    label: "Saturday",
  },
  Sunday: {
    color: "#EF4444",
    textColor: "#FFFFFF",
    label: "Sunday",
  },
};

const DEFAULT_PIN_COLOR = {
  color: "#64748B",
  textColor: "#FFFFFF",
  label: "Unknown day",
};

// ---------------------------------------------------------
// GET WEEKDAY FROM VISIT TIMESTAMP
// Uses Asia/Kolkata timezone.
// ---------------------------------------------------------
function getVisitDayInfo(visit) {
  const timestamp =
    visit?.time ??
    visit?.createdAt ??
    visit?.date ??
    null;

  if (!timestamp) {
    return DEFAULT_PIN_COLOR;
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return DEFAULT_PIN_COLOR;
  }

  const weekday = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    timeZone: "Asia/Kolkata",
  }).format(date);

  return WEEKDAY_PIN_COLORS[weekday] || DEFAULT_PIN_COLOR;
}

// ---------------------------------------------------------
// VALID GPS COORDINATES
// ---------------------------------------------------------
function hasValidCoordinates(visit) {
  const latitude = Number(visit?.latitude);
  const longitude = Number(visit?.longitude);

  return (
    visit?.latitude !== null &&
    visit?.latitude !== undefined &&
    visit?.latitude !== "" &&
    visit?.longitude !== null &&
    visit?.longitude !== undefined &&
    visit?.longitude !== "" &&
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180
  );
}

// ---------------------------------------------------------
// CUSTOM WEEKDAY-COLORED PIN
// ---------------------------------------------------------
function getCustomIcon(visit, index) {
  const weekdayInfo = getVisitDayInfo(visit);

  return L.divIcon({
    className: "weekday-colored-pin",

    html: `
      <div
        style="
          width: 30px;
          height: 30px;
          box-sizing: border-box;
          background-color: ${weekdayInfo.color};
          border: 3px solid #FFFFFF;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 3px 9px rgba(0, 0, 0, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
        "
      >
        <span
          style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            transform: rotate(45deg);
            color: ${weekdayInfo.textColor};
            font-size: 10px;
            font-weight: 800;
            font-family: Arial, sans-serif;
            line-height: 1;
          "
        >
          ${index + 1}
        </span>
      </div>
    `,

    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
}

// ---------------------------------------------------------
// AUTO FRAME MAP TO INCLUDE ALL VALID VISIT LOCATIONS
// ---------------------------------------------------------
function SmartMapFramer({ visits }) {
  const map = useMap();

  useEffect(() => {
    const validVisits = visits.filter(hasValidCoordinates);

    if (validVisits.length === 0) {
      return;
    }

    if (validVisits.length === 1) {
      const visit = validVisits[0];

      map.flyTo(
        [Number(visit.latitude), Number(visit.longitude)],
        15,
        { duration: 1 }
      );

      return;
    }

    const bounds = L.latLngBounds(
      validVisits.map((visit) => [
        Number(visit.latitude),
        Number(visit.longitude),
      ])
    );

    map.flyToBounds(bounds, {
      padding: [50, 50],
      maxZoom: 16,
      duration: 1,
    });
  }, [visits, map]);

  return null;
}

// ---------------------------------------------------------
// FORMAT VISIT DATE
// ---------------------------------------------------------
function formatVisitDateTime(value) {
  if (!value) {
    return {
      date: "Date unavailable",
      time: "Time unavailable",
    };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      date: "Date unavailable",
      time: "Time unavailable",
    };
  }

  return {
    date: new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(date),

    time: new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }).format(date),
  };
}

// ---------------------------------------------------------
// MAP COMPONENT
// ---------------------------------------------------------
export default function MapWrapper({ visits = [] }) {
  const defaultCenter = [16.705, 74.2433];

  const validVisits = visits.filter(hasValidCoordinates);

  const weekdayLegend = Object.values(WEEKDAY_PIN_COLORS);

  return (
    <div className="relative h-full min-h-[60vh] w-full">
      <MapContainer
        center={defaultCenter}
        zoom={10}
        style={{
          height: "100%",
          minHeight: "60vh",
          width: "100%",
          zIndex: 10,
        }}
      >
        <SmartMapFramer visits={validVisits} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {validVisits.map((visit, index) => {
          const weekdayInfo = getVisitDayInfo(visit);

          const visitDateTime = formatVisitDateTime(
            visit.time ?? visit.createdAt ?? visit.date
          );

          return (
            <Marker
              key={
                visit.visitId ??
                `${visit.agentId || "agent"}-${visit.time || ""}-${index}`
              }
              position={[
                Number(visit.latitude),
                Number(visit.longitude),
              ]}
              icon={getCustomIcon(visit, index)}
            >
              <Popup className="custom-popup">
                <div className="min-w-[220px] rounded-xl bg-white p-4">
                  {/* Stop number and weekday */}
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-slate-800 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
                      Stop #{index + 1}
                    </span>

                    <span
                      className="rounded-md px-2 py-1 text-[10px] font-bold"
                      style={{
                        backgroundColor: weekdayInfo.color,
                        color: weekdayInfo.textColor,
                      }}
                    >
                      {weekdayInfo.label}
                    </span>
                  </div>

                  {/* Employee */}
                  {visit.agentName && (
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      {visit.agentName}
                    </p>
                  )}

                  {/* Medical shop */}
                  <h3 className="mb-1 text-[15px] font-extrabold leading-tight text-slate-900">
                    {visit.shopName || "Unknown Medical"}
                  </h3>

                  <p className="mb-4 text-[11px] font-medium leading-relaxed text-slate-500">
                    {visit.address || "No address provided"}
                  </p>

                  {/* Order and collection */}
                  <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="min-w-0">
                      <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Order Value
                      </p>

                      <p className="text-[13px] font-black text-slate-800">
                        ₹
                        {Number(
                          visit.orderAmount || 0
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="h-8 w-px shrink-0 bg-slate-200" />

                    <div className="min-w-0 text-right">
                      <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-emerald-600">
                        Collected
                      </p>

                      <p className="text-[13px] font-black text-emerald-700">
                        ₹
                        {Number(
                          visit.collectionAmount || 0
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {/* Visit date and time */}
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] font-semibold text-slate-500">
                        Visit Date
                      </span>

                      <span className="text-[11px] font-bold text-slate-800">
                        {visitDateTime.date}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] font-semibold text-slate-500">
                        Visit Time
                      </span>

                      <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700">
                        {visitDateTime.time}
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Weekday color legend */}
      <div className="absolute bottom-4 left-3 z-[1000] max-w-[calc(100%-24px)] rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm sm:bottom-5 sm:left-5">
        <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
          Visit day colors
        </p>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
          {weekdayLegend.map((day) => (
            <div
              key={day.label}
              className="flex items-center gap-2"
            >
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/10"
                style={{
                  backgroundColor: day.color,
                }}
              />

              <span className="text-[10px] font-semibold text-slate-700">
                {day.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}