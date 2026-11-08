import React, { useState } from 'react';
import { APIProvider, Map as GoogleMapComponent, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Workplace } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';
import { MapPin, Navigation, Building2, CheckCircle2, AlertTriangle, Crosshair } from 'lucide-react';

interface WorkplaceMapProps {
  workplace: Workplace;
  userCoords: { lat: number; lng: number; accuracy?: number } | null;
  distanceMeters: number | null;
  isWithinGeofence: boolean;
  onSelectCoordinates?: (coords: { lat: number; lng: number }) => void;
  isEditable?: boolean;
}

export const WorkplaceMap: React.FC<WorkplaceMapProps> = ({
  workplace,
  userCoords,
  distanceMeters,
  isWithinGeofence,
  onSelectCoordinates,
  isEditable = false,
}) => {
  const activeWp: Workplace = workplace || {
    id: 'wp-1',
    name: 'สำนักงานใหญ่',
    address: 'กรุงเทพมหานคร',
    lat: 13.736717,
    lng: 100.560638,
    radiusMeters: 250,
    isDefault: true,
  };

  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: activeWp.lat,
    lng: activeWp.lng,
  });

  React.useEffect(() => {
    if (activeWp.lat && activeWp.lng) {
      setMapCenter({ lat: activeWp.lat, lng: activeWp.lng });
    }
  }, [activeWp.lat, activeWp.lng]);

  const mapsApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || (firebaseConfig as { apiKey?: string }).apiKey || '';

  const handleMapClick = (e: { detail?: { latLng?: { lat: number; lng: number } } }) => {
    if (isEditable && onSelectCoordinates && e.detail?.latLng) {
      onSelectCoordinates({
        lat: e.detail.latLng.lat,
        lng: e.detail.latLng.lng,
      });
    }
  };

  const recenterToUser = () => {
    if (userCoords) {
      setMapCenter({ lat: userCoords.lat, lng: userCoords.lng });
    }
  };

  const recenterToWorkplace = () => {
    setMapCenter({ lat: activeWp.lat, lng: activeWp.lng });
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-md border border-purple-100 bg-white">
      {/* Top Status Bar */}
      <div className="p-3.5 bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 border-b border-purple-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center shadow-xs">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <span>{activeWp.name}</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                รัศมี {activeWp.radiusMeters} ม.
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate max-w-xs">{activeWp.address}</p>
          </div>
        </div>

        {/* Distance Badge */}
        {distanceMeters !== null && (
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all ${
              isWithinGeofence
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
            }`}
          >
            {isWithinGeofence ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>อยู่ในรัศมีที่ทำงาน ({Math.round(distanceMeters)} ม.)</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>อยู่นอกพื้นที่ ({Math.round(distanceMeters)} ม.)</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Map Canvas Container (Explicit height enforced per CF2) */}
      <div className="relative w-full h-[320px] md:h-[360px] bg-slate-100">
        <APIProvider apiKey={mapsApiKey}>
          <GoogleMapComponent
            center={mapCenter}
            zoom={16}
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            onClick={handleMapClick}
            gestureHandling="greedy"
            disableDefaultUI={false}
            className="w-full h-full"
          >
            {/* Workplace Marker */}
            <AdvancedMarker position={{ lat: activeWp.lat, lng: activeWp.lng }} title={activeWp.name}>
              <div className="relative group cursor-pointer">
                <div className="px-2 py-1 bg-pink-600 text-white text-[11px] font-bold rounded-lg shadow-md whitespace-nowrap mb-1 -translate-x-1/2 left-1/2 relative flex items-center gap-1">
                  <span>🏢</span> {activeWp.name}
                </div>
                <Pin background="#e11d48" glyphColor="#ffffff" borderColor="#9f1239" scale={1.2} />
              </div>
            </AdvancedMarker>

            {/* Employee User GPS Marker */}
            {userCoords && (
              <AdvancedMarker position={{ lat: userCoords.lat, lng: userCoords.lng }} title="พิกัดปัจจุบันของคุณ">
                <div className="relative group cursor-pointer">
                  <div className="px-2 py-1 bg-indigo-600 text-white text-[11px] font-bold rounded-lg shadow-md whitespace-nowrap mb-1 -translate-x-1/2 left-1/2 relative flex items-center gap-1">
                    <span>📍</span> พิกัดของคุณ
                  </div>
                  <Pin background="#4f46e5" glyphColor="#ffffff" borderColor="#3730a3" scale={1.1} />
                </div>
              </AdvancedMarker>
            )}
          </GoogleMapComponent>
        </APIProvider>

        {/* Map Control Buttons */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 z-10">
          {userCoords && (
            <button
              type="button"
              onClick={recenterToUser}
              className="bg-white/95 hover:bg-white text-indigo-700 p-2.5 rounded-xl shadow-md border border-indigo-100 flex items-center gap-1.5 text-xs font-semibold backdrop-blur-xs transition-transform active:scale-95"
              title="เลื่อนไปยังพิกัดของคุณ"
            >
              <Navigation className="w-4 h-4 text-indigo-600 animate-pulse" />
              <span className="hidden sm:inline">พิกัดฉัน</span>
            </button>
          )}
          <button
            type="button"
            onClick={recenterToWorkplace}
            className="bg-white/95 hover:bg-white text-pink-700 p-2.5 rounded-xl shadow-md border border-pink-100 flex items-center gap-1.5 text-xs font-semibold backdrop-blur-xs transition-transform active:scale-95"
            title="เลื่อนไปยังที่ทำงาน"
          >
            <Crosshair className="w-4 h-4 text-pink-600" />
            <span className="hidden sm:inline">ที่ทำงาน</span>
          </button>
        </div>

        {/* Geofence notice helper */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl shadow-sm border border-purple-100 text-[11px] text-slate-700 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Google Maps พิกัดทำงานแบบเรียลไทม์</span>
          {isEditable && <span className="text-pink-600 font-semibold">(คลิกบนแผนที่เพื่อเปลี่ยนพิกัด)</span>}
        </div>
      </div>

      {/* Geofence explanation bottom bar */}
      <div className="p-2.5 bg-slate-50 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-purple-600" />
          <span>
            พิกัดอ้างอิง: {activeWp.lat.toFixed(5)}, {activeWp.lng.toFixed(5)}
          </span>
        </div>
        {userCoords && (
          <div className="text-slate-600 font-medium">
            ความแม่นยำ GPS: ±{Math.round(userCoords.accuracy || 10)} เมตร
          </div>
        )}
      </div>
    </div>
  );
};
