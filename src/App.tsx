import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Navbar } from './components/Navbar';
import { FacialScanner } from './components/FacialScanner';
import { DailySummary } from './components/DailySummary';
import { WorkplaceSettings } from './components/WorkplaceSettings';
import { EmployeeManager } from './components/EmployeeManager';
import { CalendarManager } from './components/CalendarManager';
import { WorkplaceMap } from './components/WorkplaceMap';
import {
  getEmployees,
  saveEmployees,
  getWorkplaces,
  saveWorkplaces,
  getAttendanceRecords,
  saveAttendanceRecords,
  getShiftConfig,
  saveShiftConfig,
  getActiveWorkplaceId,
  saveActiveWorkplaceId,
} from './services/storage';
import { initAuth, googleSignIn, googleSignOut } from './services/firebase';
import { AttendanceRecord, Employee, Workplace, ShiftConfig } from './types';
import {
  Sparkles,
  Heart,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Building2,
  Smile,
  ShieldCheck,
} from 'lucide-react';

export default function App() {
  // Google Maps Quota Exceeded State (Mandatory per Section 8 Case A of google-maps-platform skill)
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState<boolean>(false);

  // App Data States - initialized synchronously on initial render
  const [employees, setEmployees] = useState<Employee[]>(() => getEmployees());
  const [workplaces, setWorkplaces] = useState<Workplace[]>(() => getWorkplaces());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => getAttendanceRecords());
  const [shiftConfig, setShiftConfig] = useState<ShiftConfig>(() => getShiftConfig());
  const [activeWorkplaceId, setActiveWorkplaceId] = useState<string>(() => getActiveWorkplaceId());

  // Navigation State
  const [activeTab, setActiveTab] = useState<'scan' | 'summary' | 'map' | 'employees' | 'calendar'>('scan');

  // Google Calendar Auth States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Modal Record for Google Calendar Sync Confirmation
  const [syncModalRecord, setSyncModalRecord] = useState<AttendanceRecord | null>(null);

  // Success Notification Toast
  const [toastMessage, setToastMessage] = useState<{ title: string; subtitle?: string } | null>(null);

  // Event Listeners and Firebase Auth setup
  useEffect(() => {

    // Listen for Google Maps quota exceeded event
    const handleQuotaExceeded = () => {
      setMapsQuotaExceeded(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);

    // Initialize Firebase Auth listener for Google Workspace Calendar
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );

    return () => {
      window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
      unsubscribe();
    };
  }, []);

  // Save changes to LocalStorage
  const handleEmployeesUpdate = (updated: Employee[]) => {
    setEmployees(updated);
    saveEmployees(updated);
  };

  const handleWorkplacesUpdate = (updated: Workplace[]) => {
    setWorkplaces(updated);
    saveWorkplaces(updated);
  };

  const handleAttendanceRecorded = (newRecord: AttendanceRecord) => {
    const existingIndex = attendanceRecords.findIndex((r) => r.id === newRecord.id);
    let updated: AttendanceRecord[];
    if (existingIndex >= 0) {
      updated = [...attendanceRecords];
      updated[existingIndex] = newRecord;
    } else {
      updated = [newRecord, ...attendanceRecords];
    }

    setAttendanceRecords(updated);
    saveAttendanceRecords(updated);

    // Trigger toast notification
    const actionText = newRecord.clockOutTime ? 'ออกงาน' : 'เข้างาน';
    setToastMessage({
      title: `บันทึกเวลา${actionText}สำเร็จ! ✨`,
      subtitle: `${newRecord.employeeName} (${newRecord.employeeNickname}) • เวลา ${newRecord.clockOutTime || newRecord.clockInTime} น.`,
    });
    setTimeout(() => setToastMessage(null), 4000);

    // If user has Google Calendar connected, offer instant sync
    if (currentUser && accessToken && !newRecord.syncedToCalendar) {
      setSyncModalRecord(newRecord);
    }
  };

  const handleDeleteRecord = (id: string) => {
    const updated = attendanceRecords.filter((r) => r.id !== id);
    setAttendanceRecords(updated);
    saveAttendanceRecords(updated);
  };

  const handleRecordSynced = (recordId: string, eventId: string) => {
    const updated = attendanceRecords.map((r) =>
      r.id === recordId
        ? {
            ...r,
            syncedToCalendar: true,
            googleCalendarEventId: eventId,
            syncedAt: new Date().toISOString(),
          }
        : r
    );
    setAttendanceRecords(updated);
    saveAttendanceRecords(updated);

    setToastMessage({
      title: 'ซิงค์ลง Google Calendar สำเร็จเรียบร้อย! 📅',
      subtitle: 'เปิดดูในแอป Google Calendar ได้ทันที',
    });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Google Login Handler
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
        setToastMessage({
          title: `ยินดีต้อนรับ ${res.user.displayName || 'Google User'}! 🎉`,
          subtitle: 'เชื่อมต่อ Google Calendar เรียบร้อยแล้ว',
        });
        setTimeout(() => setToastMessage(null), 3500);
      }
    } catch (err: unknown) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    await googleSignOut();
    setCurrentUser(null);
    setAccessToken(null);
    setToastMessage({
      title: 'ออกจากระบบ Google แล้ว',
    });
    setTimeout(() => setToastMessage(null), 2500);
  };

  const activeWorkplace =
    workplaces.find((w) => w.id === activeWorkplaceId) || workplaces[0] || {
      id: 'wp-1',
      name: 'สำนักงานใหญ่',
      address: 'กรุงเทพฯ',
      lat: 13.736717,
      lng: 100.560638,
      radiusMeters: 250,
      isDefault: true,
    };

  return (
    <div className="min-h-screen flex flex-col font-['Prompt',sans-serif]">
      {/* 1. Mandatory Google Maps Quota Defense Banner (google-maps-platform Skill Section 8 Case A) */}
      {mapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Floating Success Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-white/95 backdrop-blur-md border border-purple-200 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 max-w-sm">
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">{toastMessage.title}</h4>
            {toastMessage.subtitle && (
              <p className="text-[11px] text-slate-500 mt-0.5">{toastMessage.subtitle}</p>
            )}
          </div>
        </div>
      )}

      {/* Header & Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        workplaces={workplaces}
        activeWorkplaceId={activeWorkplaceId}
        onSelectWorkplace={(id) => {
          setActiveWorkplaceId(id);
          saveActiveWorkplaceId(id);
        }}
        currentUser={currentUser}
        onLogin={handleGoogleLogin}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab 1: Facial Scan & Location Check-In */}
        {activeTab === 'scan' && (
          <div className="space-y-6">
            <FacialScanner
              employees={employees}
              activeWorkplace={activeWorkplace}
              shiftConfig={shiftConfig}
              attendanceRecords={attendanceRecords}
              onAttendanceRecorded={handleAttendanceRecorded}
              onRequestCalendarSync={(record) => {
                if (!currentUser) {
                  handleGoogleLogin();
                } else {
                  setSyncModalRecord(record);
                }
              }}
            />

            {/* Quick Live Map Preview underneath Scanner */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">
                      พิกัดสำนักงานบน Google Maps: {activeWorkplace.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      ระบบคำนวณระยะห่างระหว่างอุปกรณ์กับจุดเช็คอินอัตโนมัติ
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('map')}
                  className="text-xs font-bold text-purple-600 hover:text-purple-700 hover:underline"
                >
                  ดูแผนที่เต็มจอ & ตั้งค่าพิกัด &rarr;
                </button>
              </div>

              <WorkplaceMap
                workplace={activeWorkplace}
                userCoords={null}
                distanceMeters={null}
                isWithinGeofence={true}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Daily Summary & Analytics */}
        {activeTab === 'summary' && (
          <DailySummary
            records={attendanceRecords}
            employees={employees}
            workplaces={workplaces}
            onDeleteRecord={handleDeleteRecord}
            onRequestCalendarSync={(record) => {
              if (!currentUser) {
                handleGoogleLogin();
              } else {
                setSyncModalRecord(record);
              }
            }}
            isCalendarConnected={!!currentUser}
          />
        )}

        {/* Tab 3: Workplace Maps & Geofence Settings */}
        {activeTab === 'map' && (
          <WorkplaceSettings
            workplaces={workplaces}
            activeWorkplaceId={activeWorkplaceId}
            onSelectActiveWorkplace={(id) => {
              setActiveWorkplaceId(id);
              saveActiveWorkplaceId(id);
            }}
            onAddWorkplace={(wp) => handleWorkplacesUpdate([...workplaces, wp])}
            onUpdateWorkplace={(wp) =>
              handleWorkplacesUpdate(workplaces.map((w) => (w.id === wp.id ? wp : w)))
            }
            onDeleteWorkplace={(id) =>
              handleWorkplacesUpdate(workplaces.filter((w) => w.id !== id))
            }
            shiftConfig={shiftConfig}
            onUpdateShiftConfig={(cfg) => {
              setShiftConfig(cfg);
              saveShiftConfig(cfg);
            }}
          />
        )}

        {/* Tab 4: Employee Directory & Profiles */}
        {activeTab === 'employees' && (
          <EmployeeManager
            employees={employees}
            onAddEmployee={(emp) => handleEmployeesUpdate([...employees, emp])}
            onDeleteEmployee={(id) =>
              handleEmployeesUpdate(employees.filter((e) => e.id !== id))
            }
          />
        )}

        {/* Tab 5: Google Calendar Integration */}
        {activeTab === 'calendar' && (
          <CalendarManager
            currentUser={currentUser}
            accessToken={accessToken}
            onLogin={handleGoogleLogin}
            onLogout={handleGoogleLogout}
            isLoggingIn={isLoggingIn}
            syncModalRecord={syncModalRecord}
            onCloseSyncModal={() => setSyncModalRecord(null)}
            onRecordSynced={handleRecordSynced}
            workplaces={workplaces}
            records={attendanceRecords}
          />
        )}
      </main>

      {/* Global Calendar Sync Modal if opened outside Calendar tab */}
      {syncModalRecord && activeTab !== 'calendar' && (
        <CalendarManager
          currentUser={currentUser}
          accessToken={accessToken}
          onLogin={handleGoogleLogin}
          onLogout={handleGoogleLogout}
          isLoggingIn={isLoggingIn}
          syncModalRecord={syncModalRecord}
          onCloseSyncModal={() => setSyncModalRecord(null)}
          onRecordSynced={handleRecordSynced}
          workplaces={workplaces}
          records={attendanceRecords}
        />
      )}

      {/* Cute Footer */}
      <footer className="mt-12 bg-white/70 border-t border-purple-100 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🐰</span>
            <span className="font-bold text-slate-700">TimeCute</span>
            <span className="text-slate-400">| ระบบลงเวลาสแกนใบหน้าและระบุพิกัดที่ทำงาน</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>ขับเคลื่อนด้วย Google Maps Platform & Google Calendar</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-pink-500 font-medium">
              สดใส ทันสมัย ใช้งานง่าย <Heart className="w-3.5 h-3.5 fill-pink-500" />
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
