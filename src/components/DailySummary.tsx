import React, { useState } from 'react';
import { AttendanceRecord, Employee, Workplace } from '../types';
import { exportToCSV, exportToJSON, formatDuration } from '../services/storage';
import {
  Calendar,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Copy,
  Check,
  FileSpreadsheet,
  FileCode,
  MapPin,
  Camera,
  CalendarCheck,
  CalendarPlus,
  Trash2,
  Users,
} from 'lucide-react';

interface DailySummaryProps {
  records: AttendanceRecord[];
  employees: Employee[];
  workplaces: Workplace[];
  onDeleteRecord: (recordId: string) => void;
  onRequestCalendarSync: (record: AttendanceRecord) => void;
  isCalendarConnected: boolean;
}

export const DailySummary: React.FC<DailySummaryProps> = ({
  records,
  employees,
  workplaces,
  onDeleteRecord,
  onRequestCalendarSync,
  isCalendarConnected,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [previewPhotoRecord, setPreviewPhotoRecord] = useState<AttendanceRecord | null>(null);

  // Filter records by selected date
  const dateRecords = records.filter((r) => r.date === selectedDate);

  // Departments list for filter dropdown
  const departments = Array.from(new Set(employees.map((e) => e.department)));

  // Calculate statistics for the selected day
  const totalEmployees = employees.length;
  const clockedInCount = dateRecords.length;
  const onTimeCount = dateRecords.filter((r) => r.status === 'on_time').length;
  const lateCount = dateRecords.filter((r) => r.status === 'late').length;
  const clockedOutCount = dateRecords.filter((r) => !!r.clockOutTime).length;
  const pendingCount = Math.max(0, totalEmployees - clockedInCount);

  // Filter records by search query and filters
  const filteredRecords = dateRecords.filter((r) => {
    const matchesSearch =
      r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.employeeNickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.employeeCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'all' || r.employeeDepartment === departmentFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'on_time' && r.status === 'on_time') ||
      (statusFilter === 'late' && r.status === 'late') ||
      (statusFilter === 'clocked_out' && !!r.clockOutTime) ||
      (statusFilter === 'working' && !r.clockOutTime);

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Copy formatted daily attendance summary to clipboard (ready for LINE / Slack)
  const handleCopySummary = () => {
    const header = `📋 สรุปเวลาเข้า-ออกงานประจำวันที่ ${selectedDate}\n==================================\n`;
    const stats = `👥 มาทำงานทั้งหมด: ${clockedInCount}/${totalEmployees} คน\n✨ ตรงเวลา: ${onTimeCount} คน | ⏰ สาย: ${lateCount} คน\n🚪 ออกงานแล้ว: ${clockedOutCount} คน | ⏳ ยังไม่ลงเวลา: ${pendingCount} คน\n----------------------------------\n`;

    const details = dateRecords
      .map(
        (r, idx) =>
          `${idx + 1}. ${r.employeeCode} ${r.employeeName} (${r.employeeNickname})\n` +
          `   - เวลาเข้า: ${r.clockInTime} [${r.status === 'on_time' ? 'ตรงเวลา' : 'สาย'}]\n` +
          `   - เวลาออก: ${r.clockOutTime || 'ยังไม่ออกงาน'}\n` +
          `   - พิกัด: ${r.workplaceName} (${r.location.isWithinGeofence ? 'ในรัศมี' : 'นอกรัศมี'})\n`
      )
      .join('\n');

    const fullText = header + stats + details + `\nสร้างโดยระบบ TimeCute 🕒✨`;

    navigator.clipboard.writeText(fullText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Employees */}
        <div className="bg-white p-4 rounded-3xl border border-purple-100 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">พนักงานทั้งหมด</span>
            <span className="text-xl font-extrabold text-slate-800">{totalEmployees} ท่าน</span>
          </div>
        </div>

        {/* On Time */}
        <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">เข้างานตรงเวลา</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-emerald-600">{onTimeCount}</span>
              <span className="text-[10px] text-emerald-500 font-semibold">
                ({clockedInCount > 0 ? Math.round((onTimeCount / clockedInCount) * 100) : 0}%)
              </span>
            </div>
          </div>
        </div>

        {/* Late */}
        <div className="bg-white p-4 rounded-3xl border border-amber-100 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">เข้างานสาย</span>
            <span className="text-xl font-extrabold text-amber-600">{lateCount} ท่าน</span>
          </div>
        </div>

        {/* Clocked Out */}
        <div className="bg-white p-4 rounded-3xl border border-indigo-100 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">ออกงานแล้ว</span>
            <span className="text-xl font-extrabold text-indigo-600">{clockedOutCount} ท่าน</span>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">ยังไม่ลงเวลา</span>
            <span className="text-xl font-extrabold text-slate-500">{pendingCount} ท่าน</span>
          </div>
        </div>
      </div>

      {/* Control Toolbar: Date Picker, Search & Export Actions */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left side: Date Switcher & Search */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Date buttons */}
          <div className="flex items-center gap-1 bg-purple-50/70 p-1 rounded-2xl border border-purple-100">
            <button
              type="button"
              onClick={() => setSelectedDate(todayStr)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedDate === todayStr
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-purple-700 hover:bg-purple-100/60'
              }`}
            >
              วันนี้ (Today)
            </button>
            <button
              type="button"
              onClick={() => {
                const y = new Date();
                y.setDate(y.getDate() - 1);
                setSelectedDate(y.toISOString().split('T')[0]);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedDate !== todayStr
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-purple-700 hover:bg-purple-100/60'
              }`}
            >
              เมื่อวาน
            </button>
          </div>

          {/* Custom Date Input */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200 text-xs">
            <Calendar className="w-4 h-4 text-purple-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none"
            />
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, รหัส, แผนก..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white text-slate-700 w-44 sm:w-56"
            />
          </div>
        </div>

        {/* Right side: Export buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* CSV Export */}
          <button
            type="button"
            onClick={() => exportToCSV(dateRecords, selectedDate)}
            disabled={dateRecords.length === 0}
            className="px-3.5 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 border border-emerald-200 transition-colors disabled:opacity-50"
            title="ส่งออกไฟล์ Excel / CSV รองรับภาษาไทย"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Excel / CSV</span>
          </button>

          {/* JSON Export */}
          <button
            type="button"
            onClick={() => exportToJSON(dateRecords, selectedDate)}
            disabled={dateRecords.length === 0}
            className="px-3 py-2 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors disabled:opacity-50"
            title="ส่งออกไฟล์ JSON สำหรับระบบ HR"
          >
            <FileCode className="w-4 h-4 text-indigo-600" />
            <span>JSON</span>
          </button>

          {/* Copy Summary */}
          <button
            type="button"
            onClick={handleCopySummary}
            className="px-3 py-2 rounded-2xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-semibold flex items-center gap-1.5 border border-pink-200 transition-colors"
            title="คัดลอกสรุปข้อความสำหรับส่งเข้ากลุ่ม LINE"
          >
            {copiedSummary ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-pink-600" />}
            <span>{copiedSummary ? 'คัดลอกแล้ว!' : 'คัดลอกสรุปส่ง LINE'}</span>
          </button>

          {/* Print */}
          <button
            type="button"
            onClick={handlePrint}
            className="p-2 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
            title="พิมพ์รายงานสรุป"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-purple-100 overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 border-b border-purple-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800">
              บันทึกเวลาประจำวัน ({selectedDate})
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
              {filteredRecords.length} รายการ
            </span>
          </div>

          {/* Status & Dept Filter Tabs */}
          <div className="flex items-center gap-2">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="text-xs bg-white border border-purple-200 rounded-xl px-2.5 py-1 text-slate-700 focus:outline-none"
            >
              <option value="all">ทุกแผนก</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-white border border-purple-200 rounded-xl px-2.5 py-1 text-slate-700 focus:outline-none"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="on_time">เข้างานตรงเวลา</option>
              <option value="late">เข้างานสาย</option>
              <option value="clocked_out">ออกงานแล้ว</option>
              <option value="working">กำลังปฏิบัติงาน</option>
            </select>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Clock className="w-12 h-12 mx-auto mb-2 text-purple-200" />
            <p className="text-sm font-semibold text-slate-600">ไม่พบบันทึกการลงเวลาในวันที่เลือก</p>
            <p className="text-xs text-slate-400 mt-1">
              {dateRecords.length === 0
                ? 'ยังไม่มีพนักงานสแกนลงเวลาในวันนี้ สามารถสลับไปที่แท็บ "สแกนลงเวลา" ได้'
                : 'ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองแผนก'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-500 font-semibold border-b border-slate-100 uppercase text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">พนักงาน</th>
                  <th className="py-3.5 px-3">เวลาเข้างาน</th>
                  <th className="py-3.5 px-3">เวลาออกงาน</th>
                  <th className="py-3.5 px-3">ระยะเวลาทำงาน</th>
                  <th className="py-3.5 px-3">พิกัดสถานที่</th>
                  <th className="py-3.5 px-3">สแกนใบหน้า</th>
                  <th className="py-3.5 px-3">Google Calendar</th>
                  <th className="py-3.5 px-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-purple-50/20 transition-colors">
                    {/* Employee Profile */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.employeeAvatar}
                          alt={r.employeeName}
                          className="w-10 h-10 rounded-full object-cover border border-purple-100 shadow-xs shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            <span>{r.employeeName}</span>
                            <span className="text-pink-600 font-semibold">({r.employeeNickname})</span>
                          </div>
                          <span className="text-[11px] text-slate-400 block">
                            {r.employeeCode} • {r.employeeDepartment}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Clock In */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-bold text-slate-800">{r.clockInTime}</div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'on_time'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {r.status === 'on_time' ? '✨ ตรงเวลา' : '⏰ สาย'}
                      </span>
                    </td>

                    {/* Clock Out */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {r.clockOutTime ? (
                        <div>
                          <div className="font-bold text-slate-800">{r.clockOutTime}</div>
                          <span className="text-[10px] text-slate-400 font-medium">ออกงานแล้ว</span>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium">
                          กำลังปฏิบัติงาน
                        </span>
                      )}
                    </td>

                    {/* Work Duration */}
                    <td className="py-3.5 px-3 whitespace-nowrap font-medium text-slate-600">
                      {formatDuration(r.workDurationMinutes)}
                    </td>

                    {/* Geolocation status */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 text-xs">
                        <MapPin
                          className={`w-3.5 h-3.5 shrink-0 ${
                            r.location.isWithinGeofence ? 'text-emerald-500' : 'text-amber-500'
                          }`}
                        />
                        <span className="font-semibold truncate max-w-[130px]">{r.workplaceName}</span>
                      </div>
                      <span
                        className={`text-[10px] block font-medium ${
                          r.location.isWithinGeofence ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {r.location.isWithinGeofence
                          ? `ในพื้นที่ (${Math.round(r.location.distanceToOfficeMeters)} ม.)`
                          : `นอกพื้นที่ (${Math.round(r.location.distanceToOfficeMeters)} ม.)`}
                      </span>
                    </td>

                    {/* Facial Scan Snapshot */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setPreviewPhotoRecord(r)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-semibold transition-colors"
                        title="ดูภาพถ่ายและผลสแกนใบหน้า"
                      >
                        <Camera className="w-3.5 h-3.5 text-purple-500" />
                        <span>{r.faceConfidence}%</span>
                      </button>
                    </td>

                    {/* Calendar Sync Status */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {r.syncedToCalendar ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100">
                          <CalendarCheck className="w-3.5 h-3.5 text-indigo-600" />
                          <span>ซิงค์แล้ว</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onRequestCalendarSync(r)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white hover:bg-indigo-50 text-indigo-600 text-[11px] font-semibold border border-indigo-200 transition-colors shadow-2xs"
                        >
                          <CalendarPlus className="w-3.5 h-3.5" />
                          <span>ซิงค์ลงปฏิทิน</span>
                        </button>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`ลบบันทึกเวลาของ ${r.employeeName} (${r.date}) หรือไม่?`)) {
                            onDeleteRecord(r.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="ลบบันทึกนี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal to view captured face snapshot */}
      {previewPhotoRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-purple-100 text-center animate-in zoom-in-95 duration-150">
            <h4 className="text-sm font-bold text-slate-800 mb-1">
              ภาพถ่ายสแกนใบหน้า (Face Snapshot)
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              {previewPhotoRecord.employeeName} • {previewPhotoRecord.date} {previewPhotoRecord.clockInTime}
            </p>

            <div className="relative rounded-2xl overflow-hidden border-2 border-purple-200 shadow-md mb-3 aspect-4/3 bg-slate-900">
              <img
                src={previewPhotoRecord.snapshotUrl || previewPhotoRecord.employeeAvatar}
                alt="Captured Face"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <CheckCircle2 className="w-3 h-3" />
                <span>ความแม่นยำ {previewPhotoRecord.faceConfidence}%</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-left">
              <div>📍 สถานที่: {previewPhotoRecord.workplaceName}</div>
              <div>🕒 เข้างาน: {previewPhotoRecord.clockInTime}</div>
              {previewPhotoRecord.mood && <div>😊 อารมณ์: {previewPhotoRecord.mood}</div>}
              {previewPhotoRecord.notes && <div>📝 บันทึก: {previewPhotoRecord.notes}</div>}
            </div>

            <button
              type="button"
              onClick={() => setPreviewPhotoRecord(null)}
              className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
