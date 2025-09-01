
import dayjs from 'dayjs';
import { SHIFTS } from '../logic/parser.js';

export function scheduleToICS({ year, month, days, title = '' }) {
  const prodId = '-//shiba-shift-bot//ics 1.0//EN';
  const tz = 'Asia/Bangkok';
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${prodId}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  for (const d of days) {
    const code = d.code;
    const meta = SHIFTS[code];
    const date = dayjs(`${year}-${String(month).padStart(2,'0')}-${String(d.day).padStart(2,'0')}`);
    if (!meta || !meta.start) continue;
    const start = dayjs(`${date.format('YYYY-MM-DD')}T${meta.start}:00`);
    const end = dayjs(`${date.format('YYYY-MM-DD')}T${meta.end}:00`);

    const uid = `${year}${String(month).padStart(2,'0')}${String(d.day).padStart(2,'0')}-${code}@shiba-shift-bot`;
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${dayjs().utc().format('YYYYMMDDTHHmmss')}Z`);
    lines.push(`DTSTART;TZID=${tz}:${start.format('YYYYMMDDTHHmmss')}`);
    lines.push(`DTEND;TZID=${tz}:${end.format('YYYYMMDDTHHmmss')}`);
    lines.push(`SUMMARY:Shift ${code} (${meta.start}-${meta.end})`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
