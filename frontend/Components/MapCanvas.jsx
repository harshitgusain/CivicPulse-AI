// frontend/components/MapCanvas.jsx
'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// ✈️ Smooth Camera Fly Function
function MapAutoFly({ coord }) {
  const map = useMap();
  useEffect(() => {
    if (coord && coord[0]) {
      map.flyTo(coord, 15, { animate: true, duration: 1.0 });
    }
  }, [coord, map]);
  return null;
}

// 🖱️ Click Listener
function MapClickListener({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function MapCanvas({ targetCoord, currentLocation, markers = [], onMapClick }) {
  const centerPos = currentLocation && currentLocation[0] ? currentLocation : [28.6139, 77.2090];
  const mapKey = targetCoord ? `locked-${targetCoord[0]}-${targetCoord[1]}-${markers.length}` : "scanning";

  return (
    <MapContainer 
      key={mapKey}
      center={centerPos} 
      zoom={15} 
      zoomControl={false}
      style={{ height: '100%', width: '100%', background: '#0f172a' }}
    >
      <TileLayer
        attribution='&copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      
      {/* Camera auto-pilot and click listener */}
      <MapAutoFly coord={currentLocation} />
      <MapClickListener onMapClick={onMapClick} />
      
      {/* LIVE TARGETING RETICLE (Cyan) */}
      {!targetCoord && currentLocation && currentLocation[0] && (
        <CircleMarker
          center={currentLocation}
          radius={6}
          interactive={false}
          pathOptions={{ color: '#06b6d4', fillColor: '#22d3ee', fillOpacity: 0.8, weight: 2 }}
        />
      )}

      {/* ORIGIN RADAR */}
      {targetCoord && targetCoord[0] && (
        <>
          <Circle 
            center={targetCoord} 
            radius={400} 
            interactive={false} 
            pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.15, weight: 2, dashArray: '5' }} 
          />
          <CircleMarker 
            center={targetCoord} 
            radius={10}
            interactive={false}
            pathOptions={{ color: '#022c22', fillColor: '#10b981', fillOpacity: 1, weight: 3 }}
          >
            <Popup><div className="text-emerald-600 font-black text-xs uppercase">Scan Origin</div></Popup>
          </CircleMarker>
        </>
      )}

      {/* THREAT TARGETS (Color-coded by backend severity) */}
      {markers.map((marker, idx) => {
        const offsetLat = targetCoord[0] + (Math.random() - 0.5) * 0.005;
        const offsetLng = targetCoord[1] + (Math.random() - 0.5) * 0.005;

        // Use backend colors or default to emergency red
        const pinFill = marker.fillColor || '#ef4444';
        const pinBorder = marker.borderColor || '#4c0519';

        return (
          <CircleMarker 
            key={idx} 
            center={[offsetLat, offsetLng]} 
            radius={8}
            pathOptions={{ color: pinBorder, fillColor: pinFill, fillOpacity: 1, weight: 3 }}
          >
            <Popup>
              <div className="font-sans text-center min-w-[120px]">
                <div className="font-black text-xs uppercase" style={{ color: pinFill }}>
                  {marker.class}
                </div>
                <div className="text-slate-200 font-bold text-[10px] bg-slate-800 rounded px-2 py-0.5 mt-1 inline-block">
                  SEVERITY: {marker.severity || 'UNKNOWN'}
                </div>
                <div className="text-slate-500 font-mono text-[10px] mt-1">
                  Confidence: {(marker.confidence * 100).toFixed(1)}%
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}