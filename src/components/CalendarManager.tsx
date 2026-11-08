import React, { useState } from 'react';
import { AttendanceRecord, Workplace } from '../types';
import { createCalendarAttendanceEvent } from '../services/calendar';
import {
  Calendar,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  LogIn,
  LogOut,
  MapPin,
  Clock,
  UserCheck,
} from 'lucide-react';
import { User } from 'firebase/auth';

interface CalendarManagerProps {
  currentUser: User | null;
  accessToken: string | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  syncModalRecord: AttendanceRecord | null;
  onCloseSyncModal: () => void;
  onRecordSynced: (recordId: string, eventId: string) => void;
  workplaces: Workplace[];
  records: AttendanceRecord[];
}

export const CalendarManager: React.FC<CalendarManagerProps> = ({
  currentUser,
  accessToken,
  onLogin,
  onLogout,
  isLoggingIn,
  syncModalRecord,
  onCloseSyncModal,
  onRecordSynced,
  workplaces,
  records,
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ id: string; htmlLink?: string } | null>(null);

  // Filter unsynced records
  const unsyncedRecords = records.filter((r) => !r.syncedToCalendar);

  const handleConfirmSync = async () => {
    if (!syncModalRecord) return;
    if (!accessToken) {
      setErrorMessage('กรุณาเข้าสู่ระบบ Google เพื่อเชื่อมต่อกับ Google Calendar');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const workplace =
        workplaces.find((w) => w.id === syncModalRecord.workplaceId) || workplaces[0];
      const result = await createCalendarAttendanceEvent(accessToken, syncModalRecord, workplace);
      setSuccessInfo(result);
      onRecordSynced(syncModalRecord.id, result.id);
      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessInfo(null);
        onCloseSyncModal();
      }, 1600);
    } catch (err: unknown) {
      console.error('Error creating Google Calendar event:', err);
      setErrorMessage((err as Error)?.message || 'เกิดข้อผิดพลาดในการสร้าง Event บน Google Calendar');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Google Calendar Connection Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-800">เชื่อมต่อ Google Calendar</h3>
              {currentUser ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> เชื่อมต่อแล้ว
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
                  ยังไม่ได้เชื่อมต่อ
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-lg">
              บันทึกเวลาเข้างาน กะการทำงาน และประวัติการเช็คอินลงใน Google Calendar ของพนักงานโดยอัตโนมัติ เพื่อให้แจ้งเตือนและจัดตารางงานได้แม่นยำ
            </p>
          </div>
        </div>

        {/* Auth Button */}
        <div>
          {currentUser ? (
            <div className="flex items-center gap-3 bg-purple-50/60 p-2 rounded-2xl border border-purple-100">
              {currentUser.photoURL && (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Google User'}
                  className="w-9 h-9 rounded-full object-cover border border-purple-200"
                />
              )}
              <div className="text-left text-xs pr-2">
                <span className="font-bold text-slate-800 block truncate max-w-[140px]">
                  {currentUser.displayName || 'Google Account'}
                </span>
                <span className="text-[10px] text-slate-500 truncate block max-w-[140px]">
                  {currentUser.email}
                </span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-white transition-colors"
                title="ออกจากระบบ Google"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Official Google Sign-In Button as mandated by Workspace skill */
            <button
              type="button"
              onClick={onLogin}
              disabled={isLoggingIn}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm border border-slate-200 hover:border-slate-300 transition-all flex items-center gap-3 active:scale-98"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              <span>{isLoggingIn ? 'กำลังเข้าสู่ระบบ...' : 'Sign in with Google'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Sync Status & Queue */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-100">
        <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-indigo-600" />
            <span>รายการบันทึกเวลาทำงานที่พร้อมซิงค์ลง Google Calendar</span>
          </span>
          <span className="text-xs text-purple-600 font-normal">
            ยังไม่ได้ซิงค์ {unsyncedRecords.length} รายการ
          </span>
        </h4>
        <p className="text-xs text-slate-400 mb-4">
          ตามนโยบายความปลอดภัยของ Google Workspace การสร้างหรือแก้ไข Event บน Google Calendar จะต้องมีการแสดงกล่องข้อความยืนยันก่อนบันทึกเสมอ
        </p>

        {unsyncedRecords.length === 0 ? (
          <div className="p-8 text-center bg-purple-50/30 rounded-2xl border border-purple-100">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">บันทึกเวลาทำงานทั้งหมดถูกซิงค์เรียบร้อยแล้ว!</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              เมื่อมีการสแกนใบหน้าเข้างานใหม่ คุณสามารถเลือกซิงค์ลง Google Calendar ได้ทันที
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {unsyncedRecords.map((r) => (
              <div
                key={r.id}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-purple-200 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={r.employeeAvatar}
                    alt={r.employeeName}
                    className="w-10 h-10 rounded-full object-cover border border-purple-100"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-800">
                      {r.employeeName} ({r.employeeNickname})
                    </div>
                    <div className="text-[11px] text-slate-500">
                      วันที่ {r.date} • เวลาเข้า {r.clockInTime}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!currentUser) {
                      onLogin();
                    } else {
                      // Trigger confirmation dialog
                      const targetRecord = r;
                      onRecordSynced(targetRecord.id, ''); // sets target or triggers modal
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors border border-indigo-200"
                >
                  ซิงค์รายการนี้
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Workspace Explicit Confirmation Dialog (Mandatory per Workspace Skill) */}
      {syncModalRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
              <Calendar className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-800 mb-1">
              ยืนยันการเพิ่ม Event ลง Google Calendar
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              แอปพลิเคชันจะทำการสร้างบันทึกเวลาทำงานบน Google Calendar หลักของบัญชีผู้ใช้งาน โดยมีรายละเอียดดังต่อไปนี้:
            </p>

            <div className="bg-purple-50/50 p-3.5 rounded-2xl border border-purple-100 text-xs space-y-2 mb-4 text-slate-700">
              <div className="font-bold text-purple-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-pink-500" />
                <span>
                  🕒 เข้างาน: {syncModalRecord.employeeName} ({syncModalRecord.workplaceName})
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>
                  วันที่: {syncModalRecord.date} เวลา: {syncModalRecord.clockInTime} น.
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-pink-500" />
                <span>
                  สถานที่: {syncModalRecord.workplaceName}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-purple-100">
                ระบบจะกำหนดสีเหตุการณ์ตามสถานะการเข้างาน (เขียว = ตรงเวลา, ส้ม = สาย)
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successInfo && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>เพิ่ม Event ลง Google Calendar สำเร็จเรียบร้อยแล้ว!</span>
              </div>
            )}

            {/* Action buttons with explicit Confirm / Cancel as required by Workspace guidelines */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCloseSyncModal}
                disabled={isSubmitting}
                className="w-1/2 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                ยกเลิก (Cancel)
              </button>

              <button
                type="button"
                onClick={handleConfirmSync}
                disabled={isSubmitting}
                className="w-1/2 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <span>กำลังบันทึก...</span>
                ) : (
                  <>
                    <CalendarCheck className="w-4 h-4" />
                    <span>ยืนยันบันทึกลงปฏิทิน</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
