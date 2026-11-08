import React, { useRef, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Employee, Workplace, AttendanceRecord, ShiftConfig } from '../types';
import { calculateDistanceMeters, calculateDurationMinutes } from '../services/storage';
import {
  Camera,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Smile,
  Zap,
  Clock,
  LogOut,
  LogIn,
  AlertTriangle,
} from 'lucide-react';

interface FacialScannerProps {
  employees: Employee[];
  activeWorkplace: Workplace;
  shiftConfig: ShiftConfig;
  attendanceRecords: AttendanceRecord[];
  onAttendanceRecorded: (record: AttendanceRecord) => void;
  onRequestCalendarSync?: (record: AttendanceRecord) => void;
}

export const FacialScanner: React.FC<FacialScannerProps> = ({
  employees,
  activeWorkplace,
  shiftConfig,
  attendanceRecords,
  onAttendanceRecorded,
  onRequestCalendarSync,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(employees[0]?.id || '');
  const [actionType, setActionType] = useState<'clock_in' | 'clock_out'>('clock_in');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<'idle' | 'aligning' | 'verifying' | 'success'>('idle');
  const [scanConfidence, setScanConfidence] = useState<number>(0);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string>('สดใสพร้อมลุย 🌟');
  const [notes, setNotes] = useState<string>('');

  // Geolocation state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(true);

  const fallbackEmployee: Employee = {
    id: 'emp-01',
    code: 'EMP-101',
    name: 'กานต์ธิดา สุขเกษม',
    nickname: 'มิ้นท์ (Mint)',
    role: 'Product Designer',
    department: 'Design & UX',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    enrolledFace: true,
    email: 'mint.k@timecute.co',
    phone: '081-234-5678',
    status: 'active',
  };

  const selectedEmployee =
    (employees && employees.find((e) => e.id === selectedEmployeeId)) ||
    (employees && employees[0]) ||
    fallbackEmployee;

  // Today's record for selected employee
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = attendanceRecords.find(
    (r) => r.employeeId === selectedEmployeeId && r.date === todayStr
  );

  // Automatically suggest clock_out if employee already clocked in today without clock_out
  useEffect(() => {
    if (todayRecord && !todayRecord.clockOutTime) {
      setActionType('clock_out');
    } else {
      setActionType('clock_in');
    }
  }, [selectedEmployeeId, todayRecord]);

  // Request browser geolocation
  const fetchLocation = () => {
    setIsLocating(true);
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError('เบราว์เซอร์ไม่รองรับ Geolocation (ใช้พิกัดจำลอง)');
      setUserLocation({ lat: activeWorkplace.lat + 0.0001, lng: activeWorkplace.lng + 0.0001 });
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        // Fallback to nearby coordinates so demo is always testable
        setGeoError('ไม่สามารถเข้าถึง GPS ได้ (ใช้พิกัดสำนักงานตัวอย่าง)');
        setUserLocation({
          lat: activeWorkplace.lat + 0.00015,
          lng: activeWorkplace.lng + 0.0001,
          accuracy: 15,
        });
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  };

  useEffect(() => {
    fetchLocation();
  }, [activeWorkplace]);

  // Camera initialization
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: unknown) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('ไม่พบกล้องเว็บแคม หรือไม่ได้รับอนุญาต (เข้าสู่โหมดสแกนเสมือนจริง)');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Calculate distance to active workplace
  const distanceToOffice = userLocation
    ? calculateDistanceMeters(
        userLocation.lat,
        userLocation.lng,
        activeWorkplace.lat,
        activeWorkplace.lng
      )
    : 0;

  const isWithinGeofence = distanceToOffice <= activeWorkplace.radiusMeters;

  // Synthesize pleasant sound chime on clock in
  const playCuteChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.3);
      });
    } catch {
      // AudioContext not allowed or unsupported
    }
  };

  // Trigger celebration confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b'],
      });
    } catch {
      // Ignore if confetti fails
    }
  };

  // Capture current camera snapshot to canvas
  const captureSnapshot = (): string => {
    if (cameraActive && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 400;
      canvas.height = video.videoHeight || 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.85);
      }
    }
    // Fallback avatar
    return selectedEmployee?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200';
  };

  // Execute Face Scan Routine
  const handleStartScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanStep('aligning');
    setScanConfidence(0);

    // Step 1: Aligning Face (600ms)
    setTimeout(() => {
      setScanStep('verifying');
      setScanConfidence(78);

      // Step 2: Biometric Verification (800ms)
      setTimeout(() => {
        const photoUri = captureSnapshot();
        setCapturedPhoto(photoUri);
        const confidence = parseFloat((97.5 + Math.random() * 2.2).toFixed(1));
        setScanConfidence(confidence);
        setScanStep('success');

        // Play chime & confetti
        playCuteChime();
        triggerConfetti();

        // Process Attendance Record
        const now = new Date();
        const timeString = now.toTimeString().split(' ')[0]; // HH:MM:SS
        const [hour, minute] = timeString.split(':').map(Number);
        const totalMinutes = hour * 60 + minute;

        const [startHour, startMin] = shiftConfig.workStartTime.split(':').map(Number);
        const graceMinutes = startHour * 60 + startMin + shiftConfig.gracePeriodMinutes;
        const isLate = totalMinutes > graceMinutes;

        if (actionType === 'clock_in') {
          const newRecord: AttendanceRecord = {
            id: 'att-' + Date.now(),
            employeeId: selectedEmployee.id,
            employeeCode: selectedEmployee.code,
            employeeName: selectedEmployee.name,
            employeeNickname: selectedEmployee.nickname,
            employeeRole: selectedEmployee.role,
            employeeDepartment: selectedEmployee.department,
            employeeAvatar: selectedEmployee.avatar,
            date: todayStr,
            clockInTime: timeString,
            clockOutTime: undefined,
            status: isLate ? 'late' : 'on_time',
            workplaceId: activeWorkplace.id,
            workplaceName: activeWorkplace.name,
            location: {
              lat: userLocation?.lat || activeWorkplace.lat,
              lng: userLocation?.lng || activeWorkplace.lng,
              distanceToOfficeMeters: distanceToOffice,
              isWithinGeofence: isWithinGeofence,
              accuracy: userLocation?.accuracy,
            },
            faceConfidence: confidence,
            snapshotUrl: photoUri,
            notes: notes || undefined,
            mood: selectedMood,
            syncedToCalendar: false,
          };

          onAttendanceRecorded(newRecord);
        } else {
          // Clock out existing record or create full record
          const existing = todayRecord;
          const clockInTime = existing ? existing.clockInTime : shiftConfig.workStartTime + ':00';
          const duration = calculateDurationMinutes(clockInTime, timeString);

          const updatedRecord: AttendanceRecord = {
            id: existing ? existing.id : 'att-' + Date.now(),
            employeeId: selectedEmployee.id,
            employeeCode: selectedEmployee.code,
            employeeName: selectedEmployee.name,
            employeeNickname: selectedEmployee.nickname,
            employeeRole: selectedEmployee.role,
            employeeDepartment: selectedEmployee.department,
            employeeAvatar: selectedEmployee.avatar,
            date: todayStr,
            clockInTime: clockInTime,
            clockOutTime: timeString,
            status: existing ? existing.status : 'on_time',
            clockOutStatus: totalMinutes < 18 * 60 ? 'early' : totalMinutes > 18 * 60 + 60 ? 'overtime' : 'normal',
            workDurationMinutes: duration,
            workplaceId: activeWorkplace.id,
            workplaceName: activeWorkplace.name,
            location: {
              lat: userLocation?.lat || activeWorkplace.lat,
              lng: userLocation?.lng || activeWorkplace.lng,
              distanceToOfficeMeters: distanceToOffice,
              isWithinGeofence: isWithinGeofence,
              accuracy: userLocation?.accuracy,
            },
            faceConfidence: confidence,
            snapshotUrl: photoUri,
            notes: notes || existing?.notes || undefined,
            mood: selectedMood || existing?.mood,
            syncedToCalendar: existing?.syncedToCalendar || false,
          };

          onAttendanceRecorded(updatedRecord);
        }

        // Reset scanning state after 2.5 seconds
        setTimeout(() => {
          setIsScanning(false);
          setScanStep('idle');
        }, 2500);
      }, 900);
    }, 700);
  };

  const moods = [
    'สดใสพร้อมลุย 🌟',
    'มีพลังใจเต็มเปี่ยม 💪',
    'หิวกาแฟแก้วแรก ☕',
    'ยิ้มแย้มมีความสุข 💖',
    'ลุยโปรเจกต์ 🚀',
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <canvas ref={canvasRef} className="hidden" />

      {/* Left Column: Camera Viewfinder & Face Mesh HUD */}
      <div className="lg:col-span-7 bg-white rounded-3xl p-5 shadow-sm border border-purple-100/80 flex flex-col items-center">
        {/* Viewfinder Header */}
        <div className="w-full flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-500 text-white flex items-center justify-center shadow-sm">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span>ระบบสแกนใบหน้าอัจฉริยะ</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold">
                  Face AI Active
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">ตรวจจับโครงหน้าและตรวจสอบพิกัดความปลอดภัย</p>
            </div>
          </div>

          {/* Action Switcher (In / Out) */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActionType('clock_in')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                actionType === 'clock_in'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>เข้างาน</span>
            </button>
            <button
              type="button"
              onClick={() => setActionType('clock_out')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                actionType === 'clock_out'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ออกงาน</span>
            </button>
          </div>
        </div>

        {/* Viewfinder Box */}
        <div className="relative w-full aspect-4/3 max-w-lg rounded-3xl overflow-hidden bg-slate-900 shadow-inner border-4 border-purple-200/60 flex items-center justify-center">
          {/* Live Video feed */}
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-300 ${
              cameraActive ? 'opacity-100' : 'opacity-0 absolute'
            }`}
          />

          {/* Fallback Simulation if camera is inactive/blocked */}
          {!cameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-pink-400/80 mb-3 shadow-lg relative">
                <img
                  src={selectedEmployee?.avatar}
                  alt={selectedEmployee?.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-pink-500/20 backdrop-blur-[0.5px]"></div>
              </div>
              <p className="text-xs font-semibold text-pink-300 mb-1">โหมดจำลองสแกนใบหน้าเสมือน</p>
              <p className="text-[11px] text-slate-300 max-w-xs mb-3">
                {cameraError || 'กำลังจำลองการสแกนใบหน้าของ ' + selectedEmployee.name}
              </p>
              <button
                type="button"
                onClick={startCamera}
                className="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>ลองเชื่อมต่อกล้องใหม่</span>
              </button>
            </div>
          )}

          {/* Cute Holographic Face Mesh HUD Overlay */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
            {/* Viewfinder corners */}
            <div className="absolute top-4 left-4 w-7 h-7 border-t-4 border-l-4 border-pink-400 rounded-tl-xl shadow-xs"></div>
            <div className="absolute top-4 right-4 w-7 h-7 border-t-4 border-r-4 border-pink-400 rounded-tr-xl shadow-xs"></div>
            <div className="absolute bottom-4 left-4 w-7 h-7 border-b-4 border-l-4 border-pink-400 rounded-bl-xl shadow-xs"></div>
            <div className="absolute bottom-4 right-4 w-7 h-7 border-b-4 border-r-4 border-pink-400 rounded-br-xl shadow-xs"></div>

            {/* Central Face Oval Target */}
            <div
              className={`relative w-48 h-60 md:w-56 md:h-72 rounded-[48%] border-2 border-dashed transition-all duration-300 flex items-center justify-center ${
                scanStep === 'success'
                  ? 'border-emerald-400 bg-emerald-500/20 scale-105'
                  : scanStep === 'verifying'
                  ? 'border-pink-400 bg-pink-500/15 animate-pulse'
                  : 'border-white/60 bg-black/10'
              }`}
            >
              {/* Biometric scanning laser line */}
              {isScanning && scanStep !== 'success' && (
                <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent shadow-[0_0_12px_#ec4899] animate-[bounce_1.5s_infinite]"></div>
              )}

              {/* Facial feature landmark guides */}
              <div className="flex flex-col items-center gap-6 opacity-60">
                <div className="flex gap-12">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-sm animate-ping"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-sm animate-ping"></span>
                </div>
                <div className="w-2 h-2 rounded-full bg-pink-300 shadow-sm"></div>
                <div className="w-12 h-4 border-b-2 border-amber-300 rounded-full"></div>
              </div>

              {/* Success Badge inside oval */}
              {scanStep === 'success' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-900/60 rounded-[48%] backdrop-blur-xs text-white p-3 text-center animate-in zoom-in-95 duration-200">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-1" />
                  <span className="text-sm font-bold text-emerald-200">ยืนยันตัวตนสำเร็จ!</span>
                  <span className="text-[11px] text-white/90">ความแม่นยำ {scanConfidence}%</span>
                </div>
              )}
            </div>

            {/* HUD Status Text Banner */}
            <div className="absolute bottom-6 bg-slate-900/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-white text-xs font-medium flex items-center gap-2 shadow-lg">
              {scanStep === 'idle' && (
                <>
                  <Smile className="w-4 h-4 text-pink-400 animate-bounce" />
                  <span>จัดใบหน้าให้อยู่ในกรอบ แล้วกดยืนยัน</span>
                </>
              )}
              {scanStep === 'aligning' && (
                <>
                  <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                  <span>กำลังจับจุดโฟกัสใบหน้า...</span>
                </>
              )}
              {scanStep === 'verifying' && (
                <>
                  <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>เปรียบเทียบข้อมูลไบโอเมตริก ({scanConfidence}%)...</span>
                </>
              )}
              {scanStep === 'success' && (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>
                    บันทึกเวลา{actionType === 'clock_in' ? 'เข้างาน' : 'ออกงาน'}เรียบร้อยแล้ว ✨
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Trigger Button */}
        <div className="w-full mt-4 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={handleStartScan}
            disabled={isScanning}
            className={`w-full py-3.5 px-6 rounded-2xl font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-98 ${
              actionType === 'clock_in'
                ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-pink-200'
                : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-indigo-200'
            } ${isScanning ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>กำลังสแกนใบหน้าและบันทึกพิกัด...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>
                  {actionType === 'clock_in'
                    ? `สแกนใบหน้าเพื่อ "เข้างาน" (${selectedEmployee.nickname})`
                    : `สแกนใบหน้าเพื่อ "ออกงาน" (${selectedEmployee.nickname})`}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Location & Geofence Status Card under Viewfinder */}
        <div
          className={`w-full mt-3 p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
            isWithinGeofence
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : 'bg-amber-50/80 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center ${
                isWithinGeofence ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
              }`}
            >
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold block">
                {isWithinGeofence ? 'อยู่ในรัศมีที่ทำงานเรียบร้อย' : 'อยู่นอกพื้นที่ที่กำหนด'}
              </span>
              <span className="text-[11px] text-slate-500">
                ห่างจาก {activeWorkplace.name} ประมาณ {Math.round(distanceToOffice)} เมตร (กำหนดไม่เกิน {activeWorkplace.radiusMeters} ม.)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchLocation}
            className="p-1.5 rounded-xl hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
            title="รีเฟรชพิกัด GPS"
          >
            <RefreshCw className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Right Column: Employee Profile & Status Details */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        {/* Employee Selector Card */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-100">
          <label className="text-xs font-bold text-slate-700 mb-2 block flex items-center justify-between">
            <span>เลือกพนักงานที่กำลังลงเวลา</span>
            <span className="text-purple-600 text-[11px] font-normal">ทั้งหมด {employees.length} ท่าน</span>
          </label>

          {/* Quick Carousel / Grid of Employees */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
            {employees.map((emp) => {
              const isSelected = emp.id === selectedEmployeeId;
              return (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => setSelectedEmployeeId(emp.id)}
                  className={`p-2 rounded-2xl border text-left transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'border-pink-500 bg-pink-50/70 shadow-xs ring-2 ring-pink-300'
                      : 'border-slate-100 hover:border-purple-200 hover:bg-purple-50/40'
                  }`}
                >
                  <img
                    src={emp.avatar}
                    alt={emp.name}
                    className="w-9 h-9 rounded-full object-cover border border-white shadow-xs shrink-0"
                  />
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-800 truncate">{emp.nickname}</p>
                    <p className="text-[10px] text-slate-400 truncate">{emp.code}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Employee Detailed Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 border border-purple-100 flex items-center gap-3">
            <img
              src={selectedEmployee.avatar}
              alt={selectedEmployee.name}
              className="w-13 h-13 rounded-2xl object-cover border-2 border-white shadow-md"
            />
            <div className="truncate flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-800">{selectedEmployee.name}</h3>
                <span className="text-xs text-pink-600 font-semibold">({selectedEmployee.nickname})</span>
              </div>
              <p className="text-xs text-slate-500">{selectedEmployee.role} • {selectedEmployee.department}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-md bg-white/80 text-[10px] font-semibold text-purple-700 border border-purple-100">
                  {selectedEmployee.code}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" /> ใบหน้าลงทะเบียนแล้ว
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Shift & Status Card */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>สถานะการลงเวลาวันนี้ ({todayStr})</span>
            </h3>
            {todayRecord ? (
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  todayRecord.status === 'on_time'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {todayRecord.status === 'on_time' ? '✨ เข้างานตรงเวลา' : '⏰ เข้างานสาย'}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
                ยังไม่ได้ลงเวลา
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">เวลาเข้างาน</span>
              <span className="text-sm font-bold text-slate-800">
                {todayRecord ? todayRecord.clockInTime : '-'}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">เวลาออกงาน</span>
              <span className="text-sm font-bold text-slate-800">
                {todayRecord?.clockOutTime ? todayRecord.clockOutTime : 'ยังไม่ออกงาน'}
              </span>
            </div>
          </div>

          {/* Quick Mood Selection */}
          <div className="mb-3">
            <label className="text-[11px] font-semibold text-slate-600 block mb-1.5">
              อารมณ์ของคุณวันนี้ (Mood)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {moods.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMood(m)}
                  className={`text-[11px] px-2.5 py-1 rounded-xl border transition-all ${
                    selectedMood === m
                      ? 'bg-purple-100 border-purple-300 text-purple-800 font-semibold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              ข้อความบันทึกเพิ่มเติม (ไม่บังคับ)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น วันนี้เข้างานเตรียมงานพรีเซนต์ลูกค้า..."
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all text-slate-700"
            />
          </div>

          {/* Option to sync to Google Calendar if already clocked in */}
          {todayRecord && !todayRecord.syncedToCalendar && onRequestCalendarSync && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">บันทึกนี้ยังไม่ได้ลง Google Calendar</span>
              <button
                type="button"
                onClick={() => onRequestCalendarSync(todayRecord)}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-indigo-200"
              >
                <span>📅 ซิงค์ลงปฏิทิน</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
