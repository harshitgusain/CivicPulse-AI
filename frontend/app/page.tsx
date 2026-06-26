// frontend/app/page.tsx
'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const DynamicMap = dynamic(() => import('../Components/MapCanvas'), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-slate-950 text-emerald-400 font-mono tracking-widest">INITIALIZING GEOSPATIAL RADAR...</div>
});

export default function Home() {
  const [lng, setLng] = useState(77.2090);
  const [lat, setLat] = useState(28.6139);
  const [radius, setRadius] = useState(5000);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // States for user-defined threat reporting
  const [selectedThreat, setSelectedThreat] = useState("Select Threat Type");
  const [selectedSeverity, setSelectedSeverity] = useState(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [telemetryLogs, setTelemetryLogs] = useState(["SYSTEM ONLINE: Awaiting payload..."]);
  
  const [activeTarget, setActiveTarget] = useState(null); 
  const [mapMarkers, setMapMarkers] = useState([]); 

  const [addressQuery, setAddressQuery] = useState("");
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  const addLog = (message: string) => {
    setTelemetryLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      addLog(`File staged: ${e.target.files[0].name}`);
    }
  };

  const handleAddressSearch = async () => {
    if (!addressQuery.trim()) return;
    setIsSearchingAddress(true);
    addLog(`GEOCODE: Resolving vector matrix for "${addressQuery}"...`);

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        setLat(parseFloat(data[0].lat));
        setLng(parseFloat(data[0].lon));
        addLog(`SUCCESS: Target locked at [${data[0].lat}, ${data[0].lon}]`);
        setActiveTarget(null);
        setMapMarkers([]);
      } else {
        addLog("GEOCODE FAILURE: Location not found.");
      }
    } catch (error) {
      addLog("GEOCODE ERROR: Lookup interrupted.");
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const executePipeline = async () => {
    if (!selectedFile) {
      addLog("ERROR: No image payload selected.");
      return;
    }
    if (selectedThreat === "Select Threat Type" || !selectedSeverity) {
      addLog("ERROR: Please select Threat Type and Severity.");
      return;
    }

    setIsProcessing(true);
    addLog(`INITIATING: Uploading ${selectedThreat} [Severity: ${selectedSeverity}]...`);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("latitude", lat.toString());
    formData.append("longitude", lng.toString());
    formData.append("radius", radius.toString());
    formData.append("threatType", selectedThreat);
    formData.append("severity", selectedSeverity);

    try {
      const response = await fetch("https://civicpulse-ai-bdf1.onrender.com/detect", {
        method: "POST",
        body: formData
      });

      if (!response.ok) throw new Error("Backend connection failed");
      const data = await response.json();
      
      addLog("SUCCESS: Pipeline processed by CivicPulse Core.");
      setActiveTarget([lat, lng]);
      setMapMarkers(data.detections);
    } catch (error) {
      addLog("PIPELINE FAILURE: Backend unreachable.");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="relative w-screen h-screen bg-slate-950 overflow-hidden text-slate-100 font-sans antialiased select-none">
      <div className="absolute inset-0 w-full h-full z-0">
        <DynamicMap 
          key={activeTarget ? "target-locked" : "scanning"} 
          targetCoord={activeTarget} 
          currentLocation={[lat, lng]} 
          markers={mapMarkers}
          onMapClick={(clickedLat, clickedLng) => {
            setLat(parseFloat(clickedLat.toFixed(4)));
            setLng(parseFloat(clickedLng.toFixed(4)));
            setAddressQuery(""); setActiveTarget(null); setMapMarkers([]);
          }}
        />
      </div>

      <div className="absolute top-6 left-6 z-10 w-96 max-h-[calc(100vh-48px)] overflow-y-auto bg-slate-900/85 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-5 scrollbar-none">
        <div>
          <h1 className="text-2xl font-black tracking-wider bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">CIVICPULSE AI</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Geospatial Threat Tracking Node</p>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Target Location Matrix</label>
          <input 
            type="text" placeholder="Search address..." value={addressQuery}
            onChange={(e) => setAddressQuery(e.target.value)}
            className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 w-full"
          />
          <div className="grid grid-cols-2 gap-2">
            <input type="number" value={lng} onChange={(e) => setLng(parseFloat(e.target.value))} className="bg-slate-950/60 p-3 rounded-lg text-emerald-400 font-mono text-xs" />
            <input type="number" value={lat} onChange={(e) => setLat(parseFloat(e.target.value))} className="bg-slate-950/60 p-3 rounded-lg text-emerald-400 font-mono text-xs" />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">2. Evidence Payload</label>
          
          <select 
            className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-200"
            value={selectedThreat}
            onChange={(e) => setSelectedThreat(e.target.value)}
          >
            <option>Select Threat Type</option>
            <option>Broken Road</option>
            <option>Deep Pothole</option>
            <option>Traffic Jam</option>
            <option>Garbage Accumulation</option>
            <option>Helmet Violation</option>
          </select>

          <div className="grid grid-cols-3 gap-2">
            {['LOW', 'MEDIUM', 'HIGH'].map((level) => (
              <button 
                key={level}
                onClick={() => setSelectedSeverity(level)}
                className={`p-2 rounded-xl text-[10px] font-bold border transition-all ${selectedSeverity === level ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-950/60 border-slate-800 text-slate-400'}`}
              >
                {level}
              </button>
            ))}
          </div>

          <label className="border-2 border-dashed border-slate-800 rounded-xl h-20 flex items-center justify-center cursor-pointer hover:border-slate-700">
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <span className="text-xs text-slate-400">{selectedFile ? selectedFile.name : "Drop footprint here"}</span>
          </label>
        </div>

        <button onClick={executePipeline} disabled={isProcessing} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 p-3.5 rounded-xl text-xs font-bold uppercase text-slate-950 hover:opacity-90">
          {isProcessing ? 'Transmitting...' : 'Execute Upload Pipeline'}
        </button>

        <div className="bg-black p-3 h-32 overflow-y-auto font-mono text-[10px] text-slate-500 scrollbar-none">
          {telemetryLogs.map((log, i) => <div key={i}>{log}</div>)}
        </div>
      </div>
    </main>
  );
}