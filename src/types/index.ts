export interface Employee {
  id: string;
  code: string;
  name: string;
  nickname: string;
  role: string;
  department: string;
  avatar: string;
  enrolledFace: boolean;
  email: string;
  phone: string;
  status: 'active' | 'leave';
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  employeeNickname: string;
  employeeRole: string;
  employeeDepartment: string;
  employeeAvatar: string;
  date: string; // YYYY-MM-DD
  clockInTime: string; // HH:MM:SS
  clockOutTime?: string; // HH:MM:SS
  status: 'on_time' | 'late';
  clockOutStatus?: 'normal' | 'early' | 'overtime';
  workDurationMinutes?: number;
  workplaceId: string;
  workplaceName: string;
  location: {
    lat: number;
    lng: number;
    distanceToOfficeMeters: number;
    isWithinGeofence: boolean;
    accuracy?: number;
  };
  faceConfidence: number; // 0-100%
  snapshotUrl?: string; // Captured selfie photo URI
  notes?: string;
  mood?: string;
  googleCalendarEventId?: string;
  syncedToCalendar: boolean;
  syncedAt?: string;
}

export interface Workplace {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  isDefault: boolean;
}

export interface ShiftConfig {
  workStartTime: string; // e.g. "09:00"
  workEndTime: string;   // e.g. "18:00"
  gracePeriodMinutes: number; // 15 mins
}
