
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import advanced from 'dayjs/plugin/advancedFormat.js';

dayjs.extend(customParseFormat);
dayjs.extend(advanced);

export const SHIFTS = {
  '1': { label: '08:30-17:30', start: '08:30', end: '17:30' },
  '2': { label: '09:00-18:00', start: '09:00', end: '18:00' },
  '3': { label: '09:30-18:30', start: '09:30', end: '18:30' },
  '4': { label: '09:45-18:45', start: '09:45', end: '18:45' },
  '5': { label: '10:00-19:00', start: '10:00', end: '19:00' },
  '6': { label: 'ยังไม่มีกะงาน', start: null, end: null },
  '7': { label: '10:30-19:30', start: '10:30', end: '19:30' },
  '8': { label: '11:00-20:00', start: '11:00', end: '20:00' },
  '9': { label: '11:45-20:45', start: '11:45', end: '20:45' },
  '10': { label: '12:00-21:00', start: '12:00', end: '21:00' },
  '11': { label: '12:30-21:30', start: '12:30', end: '21:30' },
  '12': { label: '13:00-22:00', start: '13:00', end: '22:00' },
  'A': { label: 'ยังไม่มีกะงาน', start: null, end: null },
  'X': { label: 'วันหยุด', start: null, end: null },
};

const MONTHS = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

export function expandMonthTitle(title) {
  const m = title.trim();
  const parts = m.split(/\s+/);
  if (parts.length < 2) throw new Error('หัวเรื่องเดือน/ปี ไม่ครบ');
  const monthName = parts[0].toLowerCase();
  const year = parseInt(parts[1], 10);
  const month = MONTHS[monthName];
  if (!month || !year) throw new Error('ไม่รู้จักเดือน/ปี');
  return { title: `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`, month, year };
}

export function parseScheduleText(text) {
  const lines = text.split(/\n|\r/).map(s => s.trim()).filter(Boolean);
  const { month, year, title } = expandMonthTitle(lines[0]);
  const codes = lines.slice(1).join(' ').replace(/\t/g, ' ').split(/\s+/).filter(Boolean);

  const daysInMonth = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).daysInMonth();
  if (codes.length < daysInMonth) throw new Error(`จำนวนรหัสกะ (${codes.length}) น้อยกว่าวันในเดือน (${daysInMonth})`);

  const days = Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, code: codes[i].toUpperCase() }));

  const invalid = days.map(d => d.code).filter(c => !SHIFTS[c]);
  if (invalid.length) throw new Error(`พบรหัสไม่รู้จัก: ${[...new Set(invalid)].join(', ')}`);

  return { title, month, year, days };
}
