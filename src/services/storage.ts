import { Employee, AttendanceRecord, Workplace, ShiftConfig } from '../types';

export const DEFAULT_WORKPLACES: Workplace[] = [
  {
    id: 'wp-1',
    name: 'สำนักงานใหญ่ (Headquarters)',
    address: 'อาคารเอ็กซ์เชนจ์ ทาวเวอร์ ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110',
    lat: 13.736717,
    lng: 100.560638,
    radiusMeters: 250,
    isDefault: true,
  },
  {
    id: 'wp-2',
    name: 'สาขาสยาม (Siam Creative Hub)',
    address: 'สยามพารากอน ถ.พระราม 1 แขวงปทุมวัน เขตปทุมวัน กรุงเทพมหานคร 10330',
    lat: 13.746241,
    lng: 100.534740,
    radiusMeters: 300,
    isDefault: false,
  },
  {
    id: 'wp-3',
    name: 'สาขาไอคอนสยาม (Riverside Branch)',
    address: 'ไอคอนสยาม ถ.เจริญนคร แขวงคลองต้นไทร เขตคลองสาน กรุงเทพมหานคร 10600',
    lat: 13.726664,
    lng: 100.510906,
    radiusMeters: 350,
    isDefault: false,
  },
  {
    id: 'wp-4',
    name: 'Work From Home (WFH ทุกพื้นที่)',
    address: 'พิกัดยืดหยุ่นสำหรับปฏิบัติงานที่พักอาศัย',
    lat: 13.756331,
    lng: 100.501765,
    radiusMeters: 50000,
    isDefault: false,
  },
];

export const DEFAULT_EMPLOYEES: Employee[] = [
  {
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
  },
  {
    id: 'emp-02',
    code: 'EMP-102',
    name: 'ชานนท์ วรโชติ',
    nickname: 'กานต์ (Karn)',
    role: 'Senior Frontend Dev',
    department: 'Technology',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    enrolledFace: true,
    email: 'karn.w@timecute.co',
    phone: '089-876-5432',
    status: 'active',
  },
  {
    id: 'emp-03',
    code: 'EMP-103',
    name: 'พลอยไพลิน ศรีสวัสดิ์',
    nickname: 'มายด์ (Mind)',
    role: 'People & Culture (HR)',
    department: 'Human Resources',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    enrolledFace: true,
    email: 'mind.p@timecute.co',
    phone: '086-555-1234',
    status: 'active',
  },
  {
    id: 'emp-04',
    code: 'EMP-104',
    name: 'ธนภูมิ รัตนศิลป์',
    nickname: 'โก้ (Ko)',
    role: 'Full Stack Engineer',
    department: 'Technology',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    enrolledFace: true,
    email: 'ko.t@timecute.co',
    phone: '082-999-4321',
    status: 'active',
  },
  {
    id: 'emp-05',
    code: 'EMP-105',
    name: 'วรัญญา บุญส่ง',
    nickname: 'แนน (Nan)',
    role: 'Marketing Lead',
    department: 'Marketing',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    enrolledFace: true,
    email: 'nan.w@timecute.co',
    phone: '084-111-2233',
    status: 'active',
  },
];

export const DEFAULT_SHIFT_CONFIG: ShiftConfig = {
  workStartTime: '09:00',
  workEndTime: '18:00',
  gracePeriodMinutes: 15, // Up to 09:15 is considered on-time
};

// Calculate distance in meters between two lat/lng coordinates (Haversine formula)
export const calculateDistanceMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const getTodayString = (offsetDays = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-01',
    employeeId: 'emp-01',
    employeeCode: 'EMP-101',
    employeeName: 'กานต์ธิดา สุขเกษม',
    employeeNickname: 'มิ้นท์ (Mint)',
    employeeRole: 'Product Designer',
    employeeDepartment: 'Design & UX',
    employeeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    date: getTodayString(0),
    clockInTime: '08:42:15',
    clockOutTime: undefined,
    status: 'on_time',
    workplaceId: 'wp-1',
    workplaceName: 'สำนักงานใหญ่ (Headquarters)',
    location: {
      lat: 13.73685,
      lng: 100.56071,
      distanceToOfficeMeters: 22,
      isWithinGeofence: true,
      accuracy: 8,
    },
    faceConfidence: 99.2,
    mood: 'สดใสพร้อมลุย 🌟',
    notes: 'มาเช้าเตรียมประชุมสปรินต์',
    syncedToCalendar: true,
  },
  {
    id: 'att-02',
    employeeId: 'emp-02',
    employeeCode: 'EMP-102',
    employeeName: 'ชานนท์ วรโชติ',
    employeeNickname: 'กานต์ (Karn)',
    employeeRole: 'Senior Frontend Dev',
    employeeDepartment: 'Technology',
    employeeAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    date: getTodayString(0),
    clockInTime: '09:22:04',
    clockOutTime: undefined,
    status: 'late',
    workplaceId: 'wp-1',
    workplaceName: 'สำนักงานใหญ่ (Headquarters)',
    location: {
      lat: 13.73665,
      lng: 100.56055,
      distanceToOfficeMeters: 18,
      isWithinGeofence: true,
      accuracy: 10,
    },
    faceConfidence: 98.7,
    mood: 'หิวกาแฟสุดๆ ☕',
    notes: 'BTS สายสุขุมวิทดีเลย์เล็กน้อย',
    syncedToCalendar: false,
  },
  {
    id: 'att-03',
    employeeId: 'emp-03',
    employeeCode: 'EMP-103',
    employeeName: 'พลอยไพลิน ศรีสวัสดิ์',
    employeeNickname: 'มายด์ (Mind)',
    employeeRole: 'People & Culture (HR)',
    employeeDepartment: 'Human Resources',
    employeeAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    date: getTodayString(0),
    clockInTime: '08:50:30',
    clockOutTime: undefined,
    status: 'on_time',
    workplaceId: 'wp-1',
    workplaceName: 'สำนักงานใหญ่ (Headquarters)',
    location: {
      lat: 13.7369,
      lng: 100.5604,
      distanceToOfficeMeters: 35,
      isWithinGeofence: true,
      accuracy: 5,
    },
    faceConfidence: 99.6,
    mood: 'มีความสุขมาก 💖',
    notes: 'จัดเตรียมเอกสารสัมภาษณ์งาน',
    syncedToCalendar: true,
  },
  // Yesterday's complete records
  {
    id: 'att-04',
    employeeId: 'emp-01',
    employeeCode: 'EMP-101',
    employeeName: 'กานต์ธิดา สุขเกษม',
    employeeNickname: 'มิ้นท์ (Mint)',
    employeeRole: 'Product Designer',
    employeeDepartment: 'Design & UX',
    employeeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    date: getTodayString(1),
    clockInTime: '08:35:10',
    clockOutTime: '18:15:20',
    status: 'on_time',
    clockOutStatus: 'normal',
    workDurationMinutes: 580,
    workplaceId: 'wp-1',
    workplaceName: 'สำนักงานใหญ่ (Headquarters)',
    location: {
      lat: 13.73671,
      lng: 100.56063,
      distanceToOfficeMeters: 5,
      isWithinGeofence: true,
    },
    faceConfidence: 99.4,
    mood: 'สดใส 🌟',
    syncedToCalendar: true,
  },
  {
    id: 'att-05',
    employeeId: 'emp-02',
    employeeCode: 'EMP-102',
    employeeName: 'ชานนท์ วรโชติ',
    employeeNickname: 'กานต์ (Karn)',
    employeeRole: 'Senior Frontend Dev',
    employeeDepartment: 'Technology',
    employeeAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    date: getTodayString(1),
    clockInTime: '08:58:45',
    clockOutTime: '19:30:10',
    status: 'on_time',
    clockOutStatus: 'overtime',
    workDurationMinutes: 631,
    workplaceId: 'wp-1',
    workplaceName: 'สำนักงานใหญ่ (Headquarters)',
    location: {
      lat: 13.73678,
      lng: 100.56069,
      distanceToOfficeMeters: 12,
      isWithinGeofence: true,
    },
    faceConfidence: 98.9,
    mood: 'สู้ตาย 💪',
    syncedToCalendar: true,
  },
  {
    id: 'att-06',
    employeeId: 'emp-04',
    employeeCode: 'EMP-104',
    employeeName: 'ธนภูมิ รัตนศิลป์',
    employeeNickname: 'โก้ (Ko)',
    employeeRole: 'Full Stack Engineer',
    employeeDepartment: 'Technology',
    employeeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    date: getTodayString(1),
    clockInTime: '09:05:00',
    clockOutTime: '18:00:00',
    status: 'on_time',
    clockOutStatus: 'normal',
    workDurationMinutes: 535,
    workplaceId: 'wp-2',
    workplaceName: 'สาขาสยาม (Siam Creative Hub)',
    location: {
      lat: 13.7462,
      lng: 100.5348,
      distanceToOfficeMeters: 15,
      isWithinGeofence: true,
    },
    faceConfidence: 99.1,
    syncedToCalendar: false,
  },
];

const STORAGE_KEYS = {
  EMPLOYEES: 'timecute_employees_v1',
  WORKPLACES: 'timecute_workplaces_v1',
  ATTENDANCE: 'timecute_attendance_v1',
  SHIFT: 'timecute_shift_config_v1',
  ACTIVE_WORKPLACE: 'timecute_active_workplace_v1',
};

export const getEmployees = (): Employee[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    return raw ? JSON.parse(raw) : DEFAULT_EMPLOYEES;
  } catch {
    return DEFAULT_EMPLOYEES;
  }
};

export const saveEmployees = (employees: Employee[]) => {
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
};

export const getWorkplaces = (): Workplace[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKPLACES);
    return raw ? JSON.parse(raw) : DEFAULT_WORKPLACES;
  } catch {
    return DEFAULT_WORKPLACES;
  }
};

export const saveWorkplaces = (workplaces: Workplace[]) => {
  localStorage.setItem(STORAGE_KEYS.WORKPLACES, JSON.stringify(workplaces));
};

export const getAttendanceRecords = (): AttendanceRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return raw ? JSON.parse(raw) : INITIAL_ATTENDANCE;
  } catch {
    return INITIAL_ATTENDANCE;
  }
};

export const saveAttendanceRecords = (records: AttendanceRecord[]) => {
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
};

export const getShiftConfig = (): ShiftConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SHIFT);
    return raw ? JSON.parse(raw) : DEFAULT_SHIFT_CONFIG;
  } catch {
    return DEFAULT_SHIFT_CONFIG;
  }
};

export const saveShiftConfig = (config: ShiftConfig) => {
  localStorage.setItem(STORAGE_KEYS.SHIFT, JSON.stringify(config));
};

export const getActiveWorkplaceId = (): string => {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKPLACE) || 'wp-1';
};

export const saveActiveWorkplaceId = (id: string) => {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKPLACE, id);
};

// Calculate minutes between two HH:MM:SS times
export const calculateDurationMinutes = (start: string, end: string): number => {
  const [h1, m1] = start.split(':').map(Number);
  const [h2, m2] = end.split(':').map(Number);
  const totalMin1 = h1 * 60 + m1;
  const totalMin2 = h2 * 60 + m2;
  return Math.max(0, totalMin2 - totalMin1);
};

export const formatDuration = (minutes?: number): string => {
  if (!minutes || minutes <= 0) return '-';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs} ชม. ${mins} นาที`;
  if (hrs > 0) return `${hrs} ชม.`;
  return `${mins} นาที`;
};

// Export records to CSV with UTF-8 BOM so Microsoft Excel renders Thai text perfectly
export const exportToCSV = (records: AttendanceRecord[], selectedDate: string) => {
  const headers = [
    'วันที่ (Date)',
    'รหัสพนักงาน (ID)',
    'ชื่อ-นามสกุล (Name)',
    'ชื่อเล่น (Nickname)',
    'ตำแหน่ง (Role)',
    'แผนก (Department)',
    'เวลาเข้างาน (Clock In)',
    'เวลาออกงาน (Clock Out)',
    'สถานะเข้างาน (Status)',
    'รวมระยะเวลาทำงาน (Duration)',
    'สถานที่ทำงาน (Workplace)',
    'อยู่ในพื้นที่ (In Geofence)',
    'ระยะห่างจากที่ทำงาน ม. (Distance)',
    'ความแม่นยำสแกนใบหน้า % (Face Confidence)',
    'อารมณ์/ข้อความ (Notes)',
    'ซิงค์ Google Calendar (Calendar Synced)',
  ];

  const rows = records.map((r) => [
    r.date,
    r.employeeCode,
    `"${r.employeeName.replace(/"/g, '""')}"`,
    r.employeeNickname,
    `"${r.employeeRole.replace(/"/g, '""')}"`,
    `"${r.employeeDepartment.replace(/"/g, '""')}"`,
    r.clockInTime,
    r.clockOutTime || 'ยังไม่ออกงาน',
    r.status === 'on_time' ? 'ตรงเวลา' : 'มาสาย',
    formatDuration(r.workDurationMinutes),
    `"${r.workplaceName.replace(/"/g, '""')}"`,
    r.location.isWithinGeofence ? 'อยู่ในพื้นที่' : 'อยู่นอกพื้นที่',
    Math.round(r.location.distanceToOfficeMeters),
    `${r.faceConfidence}%`,
    `"${(r.notes || r.mood || '-').replace(/"/g, '""')}"`,
    r.syncedToCalendar ? 'ซิงค์แล้ว' : 'ยังไม่ซิงค์',
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `TimeCute_Attendance_${selectedDate}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export records to JSON
export const exportToJSON = (records: AttendanceRecord[], selectedDate: string) => {
  const jsonContent = JSON.stringify(records, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `TimeCute_Attendance_${selectedDate}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
