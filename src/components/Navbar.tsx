import React, { useState, useEffect } from 'react';
import { Workplace } from '../types';
import { User } from 'firebase/auth';
import {
  Clock,
  Camera,
  BarChart3,
  MapPin,
  Users,
  Calendar,
  Sparkles,
  Building2,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'scan' | 'summary' | 'map' | 'employees' | 'calendar';
  onSelectTab: (tab: 'scan' | 'summary' | 'map' | 'employees' | 'calendar') => void;
  workplaces: Workplace[];
  activeWorkplaceId: string;
  onSelectWorkplace: (id: string) => void;
  currentUser: User | null;
  onLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  workplaces,
  activeWorkplaceId,
  onSelectWorkplace,
  currentUser,
  onLogin,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('th-TH', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDateStr(
        now.toLocaleDateString('th-TH', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const navItems = [
    { id: 'scan', label: 'สแกนลงเวลา', icon: Camera, color: 'text-pink-500' },
    { id: 'summary', label: 'สรุปเวลาประจำวัน', icon: BarChart3, color: 'text-indigo-500' },
    { id: 'map', label: 'พิกัดที่ทำงาน', icon: MapPin, color: 'text-purple-500' },
    { id: 'employees', label: 'รายชื่อพนักงาน', icon: Users, color: 'text-emerald-500' },
    { id: 'calendar', label: 'ซิงค์ Google Calendar', icon: Calendar, color: 'text-blue-500' },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-purple-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => onSelectTab('scan')}
              className="cursor-pointer flex items-center gap-2 group"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-pink-200 group-hover:scale-105 transition-transform">
                <span className="text-xl">🐰</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    TimeCute
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-bold">
                    Face & GPS
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                  ระบบลงเวลาสแกนใบหน้าและระบุพิกัด
                </p>
              </div>
            </div>

            {/* Quick Workplace Branch Dropdown */}
            <div className="hidden md:flex items-center ml-2 pl-3 border-l border-slate-200">
              <div className="relative group">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50/70 hover:bg-purple-100/70 text-purple-800 text-xs font-semibold cursor-pointer border border-purple-200/80 transition-colors">
                  <Building2 className="w-3.5 h-3.5 text-purple-600" />
                  <span className="max-w-[130px] truncate">{activeWorkplace.name}</span>
                  <ChevronDown className="w-3 h-3 text-purple-500" />
                </div>
                <div className="absolute left-0 top-full mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-purple-100 py-1.5 hidden group-hover:block z-50">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase">
                    เลือกสถานที่ทำงาน
                  </div>
                  {(workplaces || []).map((wp) => (
                    <button
                      key={wp.id}
                      type="button"
                      onClick={() => onSelectWorkplace(wp.id)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-purple-50 ${
                        wp.id === activeWorkplaceId
                          ? 'font-bold text-purple-700 bg-purple-50/50'
                          : 'text-slate-700'
                      }`}
                    >
                      <span className="truncate">{wp.name}</span>
                      <span className="text-[10px] text-slate-400">รัศมี {wp.radiusMeters} ม.</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Center/Right: Live Clock & Thai Date */}
          <div className="hidden lg:flex items-center gap-3 bg-gradient-to-r from-pink-50/70 via-purple-50/70 to-indigo-50/70 px-4 py-2 rounded-2xl border border-purple-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
            <div className="text-right">
              <div className="text-xs font-bold text-slate-800 tracking-wider font-mono">
                {currentTime || '00:00:00'} น.
              </div>
              <div className="text-[10px] text-slate-500 font-medium">{currentDateStr}</div>
            </div>
          </div>

          {/* Right: Google Profile / Calendar Connect Button */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <button
                type="button"
                onClick={() => onSelectTab('calendar')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                title="จัดการ Google Calendar"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Google User'}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <Calendar className="w-4 h-4 text-indigo-600" />
                )}
                <span className="text-xs font-bold text-indigo-800 hidden sm:inline truncate max-w-[100px]">
                  {currentUser.displayName?.split(' ')[0] || 'Calendar'}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition-all active:scale-95"
              >
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span className="hidden sm:inline">Google Calendar</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2 sm:pb-3 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white shadow-md shadow-purple-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-purple-50/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
