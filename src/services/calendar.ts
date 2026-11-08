import { AttendanceRecord, Workplace } from '../types';

export interface CalendarEventPayload {
  summary: string;
  description: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  colorId?: string;
}

export const createCalendarAttendanceEvent = async (
  accessToken: string,
  record: AttendanceRecord,
  workplace: Workplace
): Promise<{ id: string; htmlLink?: string }> => {
  // Construct event times
  // If clockOutTime exists, use it; otherwise use clockIn + 9 hours or standard shift end
  const startDateTime = `${record.date}T${record.clockInTime.length === 5 ? record.clockInTime + ':00' : record.clockInTime}`;
  
  let endDateTime: string;
  if (record.clockOutTime) {
    endDateTime = `${record.date}T${record.clockOutTime.length === 5 ? record.clockOutTime + ':00' : record.clockOutTime}`;
  } else {
    // Default estimated end time (9 hours later or 18:00)
    endDateTime = `${record.date}T18:00:00`;
  }

  const statusEmoji = record.status === 'on_time' ? '✨ ตรงเวลา' : '⏰ สาย';
  const outInfo = record.clockOutTime ? `\n🚪 ออกงานเวลา: ${record.clockOutTime}` : '\n⏳ ยังไม่ออกงาน';
  const moodInfo = record.mood ? `\n😊 อารมณ์วันนี้: ${record.mood}` : '';
  const noteInfo = record.notes ? `\n📝 บันทึกเพิ่มเติม: ${record.notes}` : '';

  const summary = `🕒 เข้างาน: ${record.employeeName} (${workplace.name}) - ${statusEmoji}`;
  const description = `ระบบบันทึกเวลาทำงาน TimeCute (สแกนใบหน้าและระบุพิกัด)
--------------------------------------
👤 รหัสพนักงาน: ${record.employeeCode} (${record.employeeRole})
🏢 สถานที่ทำงาน: ${workplace.name} (${workplace.address})
📍 พิกัดเช็คอิน: ${record.location.lat.toFixed(5)}, ${record.location.lng.toFixed(5)} (${record.location.isWithinGeofence ? 'อยู่ในรัศมีที่ทำงาน' : 'อยู่นอกรัศมี'} ${Math.round(record.location.distanceToOfficeMeters)} ม.)
📸 ตรวจจับใบหน้า: ความแม่นยำ ${record.faceConfidence}%
🕒 เข้างานเวลา: ${record.clockInTime}${outInfo}${moodInfo}${noteInfo}
✨ ซิงค์อัตโนมัติเมื่อ: ${new Date().toLocaleString('th-TH')}`;

  const payload: CalendarEventPayload = {
    summary,
    description,
    location: `${workplace.name}, ${workplace.address}`,
    start: {
      dateTime: new Date(startDateTime).toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Bangkok',
    },
    end: {
      dateTime: new Date(endDateTime).toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Bangkok',
    },
    colorId: record.status === 'on_time' ? '2' : '11', // Sage green or Tomato red
  };

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to create calendar event (${response.status})`);
  }

  const result = await response.json();
  return { id: result.id, htmlLink: result.htmlLink };
};
