import React, { useState } from 'react';
import { Workplace, ShiftConfig } from '../types';
import { WorkplaceMap } from './WorkplaceMap';
import {
  MapPin,
  Building2,
  CheckCircle2,
  Sliders,
  Clock,
  Plus,
  Trash2,
  Navigation,
  Compass,
} from 'lucide-react';

interface WorkplaceSettingsProps {
  workplaces: Workplace[];
  activeWorkplaceId: string;
  onSelectActiveWorkplace: (id: string) => void;
  onAddWorkplace: (workplace: Workplace) => void;
  onUpdateWorkplace: (workplace: Workplace) => void;
  onDeleteWorkplace: (id: string) => void;
  shiftConfig: ShiftConfig;
  onUpdateShiftConfig: (config: ShiftConfig) => void;
}

export const WorkplaceSettings: React.FC<WorkplaceSettingsProps> = ({
  workplaces,
  activeWorkplaceId,
  onSelectActiveWorkplace,
  onAddWorkplace,
  onUpdateWorkplace,
  onDeleteWorkplace,
  shiftConfig,
  onUpdateShiftConfig,
}) => {
  const activeWorkplace =
    (workplaces && workplaces.find((w) => w.id === activeWorkplaceId)) ||
    (workplaces && workplaces[0]) || {
      id: 'wp-1',
      name: 'สำนักงานใหญ่',
      address: 'กรุงเทพมหานคร',
      lat: 13.736717,
      lng: 100.560638,
      radiusMeters: 250,
      isDefault: true,
    };

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newAddress, setNewAddress] = useState<string>('');
  const [newLat, setNewLat] = useState<number>(13.7563);
  const [newLng, setNewLng] = useState<number>(100.5018);
  const [newRadius, setNewRadius] = useState<number>(250);

  // Shift config inputs
  const [startTime, setStartTime] = useState<string>(shiftConfig.workStartTime);
  const [endTime, setEndTime] = useState<string>(shiftConfig.workEndTime);
  const [gracePeriod, setGracePeriod] = useState<number>(shiftConfig.gracePeriodMinutes);

  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateShiftConfig({
      workStartTime: startTime,
      workEndTime: endTime,
      gracePeriodMinutes: gracePeriod,
    });
    alert('บันทึกการตั้งค่าเวลากะทำงานเรียบร้อยแล้ว');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newWp: Workplace = {
      id: 'wp-' + Date.now(),
      name: newName.trim(),
      address: newAddress.trim() || 'พิกัดที่ระบุเอง',
      lat: Number(newLat),
      lng: Number(newLng),
      radiusMeters: Number(newRadius),
      isDefault: false,
    };

    onAddWorkplace(newWp);
    setShowAddModal(false);
    setNewName('');
    setNewAddress('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-600" />
            <span>ตั้งค่าพิกัดสถานที่ทำงาน และรัศมี Geofence</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            กำหนดตำแหน่งของสาขาและระยะรัศมีที่อนุญาตให้พนักงานลงเวลาเข้า-ออกงาน
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-2 border border-indigo-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มสาขา / สถานที่ใหม่</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Workplace list and radius adjustments */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-100">
            <h3 className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center justify-between">
              <span>เลือกสถานที่ทำงานปัจจุบัน</span>
              <span className="text-purple-600 font-semibold">{workplaces.length} สาขา</span>
            </h3>

            <div className="space-y-2.5">
              {workplaces.map((wp) => {
                const isActive = wp.id === activeWorkplaceId;
                return (
                  <div
                    key={wp.id}
                    onClick={() => onSelectActiveWorkplace(wp.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isActive
                        ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-200 shadow-xs'
                        : 'border-slate-100 hover:border-purple-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            isActive
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">{wp.name}</h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{wp.address}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 font-medium text-[10px]">
                              รัศมี {wp.radiusMeters} ม.
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {workplaces.length > 1 && !wp.isDefault && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`ต้องการลบสถานที่ ${wp.name} หรือไม่?`)) {
                              onDeleteWorkplace(wp.id);
                            }
                          }}
                          className="p-1 rounded-lg text-slate-300 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shift Time Configuration */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-100">
            <h3 className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>กำหนดเวลากะทำงาน & การมาสาย</span>
            </h3>

            <form onSubmit={handleSaveShift} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">เวลาเริ่มงาน (Start)</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">เวลาเลิกงาน (End)</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">
                  ช่วงเวลาอนุโลมการมาสาย (นาที)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="5"
                    value={gracePeriod}
                    onChange={(e) => setGracePeriod(Number(e.target.value))}
                    className="flex-1 accent-purple-600"
                  />
                  <span className="font-bold text-purple-700 w-16 text-right">
                    {gracePeriod} นาที
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  ลงเวลาหลัง {startTime} ไม่เกิน {gracePeriod} นาที จะยังถือว่า "ตรงเวลา"
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold border border-purple-200 transition-colors"
              >
                บันทึกเวลากะทำงาน
              </button>
            </form>
          </div>
        </div>

        {/* Right: Interactive Google Map showing active workplace */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-100">
            <h3 className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center justify-between">
              <span>แผนที่แสดงพิกัดและรัศมี Geofence: {activeWorkplace.name}</span>
              <span className="text-xs font-normal text-slate-400">Google Maps Platform</span>
            </h3>

            <WorkplaceMap
              workplace={activeWorkplace}
              userCoords={null}
              distanceMeters={null}
              isWithinGeofence={true}
              isEditable={true}
              onSelectCoordinates={(coords) => {
                onUpdateWorkplace({
                  ...activeWorkplace,
                  lat: coords.lat,
                  lng: coords.lng,
                });
              }}
            />

            {/* Quick radius slider for the active workplace */}
            <div className="mt-4 p-4 rounded-2xl bg-purple-50/50 border border-purple-100 flex items-center justify-between gap-4">
              <div className="text-xs">
                <span className="font-bold text-slate-800 block">
                  ปรับรัศมี Geofence ของ {activeWorkplace.name}
                </span>
                <span className="text-[11px] text-slate-500">
                  พนักงานต้องอยู่ในรัศมีนี้จึงจะเช็คอินว่า "อยู่ในพื้นที่"
                </span>
              </div>
              <div className="flex items-center gap-2">
                {[100, 250, 500, 1000].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() =>
                      onUpdateWorkplace({
                        ...activeWorkplace,
                        radiusMeters: r,
                      })
                    }
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                      activeWorkplace.radiusMeters === r
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-white border border-purple-200 text-purple-700 hover:bg-purple-100'
                    }`}
                  >
                    {r} ม.
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Workplace Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100 animate-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>เพิ่มสถานที่ทำงาน / สาขาใหม่</span>
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  ชื่อสาขา / สถานที่ *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="เช่น สาขาอารีย์ (Ari Office)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-700"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  ที่อยู่โดยสังเขป
                </label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="เช่น อาคารเพิร์ล แบงค็อก ถ.พหลโยธิน"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Latitude (ละติจูด)
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={newLat}
                    onChange={(e) => setNewLat(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Longitude (ลองจิจูด)
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={newLng}
                    onChange={(e) => setNewLng(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  รัศมี Geofence (เมตร)
                </label>
                <input
                  type="number"
                  min="50"
                  max="10000"
                  required
                  value={newRadius}
                  onChange={(e) => setNewRadius(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-700"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-md"
                >
                  บันทึกสาขา
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
