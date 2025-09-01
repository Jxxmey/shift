
import dayjs from 'dayjs';
import { Schedule } from '../models/Schedule.js';
import { SHIFTS } from './parser.js';
import { User } from '../models/User.js';

export function codeToTime(code) {
  const s = SHIFTS[code];
  return s?.start ? `${s.start}-${s.end}` : s?.label || code;
}

export async function renderTodayTomorrow(userId, isTomorrow) {
  const now = dayjs();
  const d = isTomorrow ? now.add(1, 'day') : now;
  const u = await User.findOne({ userId });
  const sched = await Schedule.findOne({ userId, team: u?.currentTeam || 'default', branch: u?.currentBranch || 'main', month: d.month() + 1, year: d.year() });
  const code = sched?.days?.find(x => x.day === d.date())?.code;
  const text = code
    ? `กะ${isTomorrow ? 'พรุ่งนี้' : 'วันนี้'} (${d.format('DD/MM/YYYY')}) คือ: ${code} ${codeToTime(code)} \nสู้ๆ นะคับ! 🐕💪`
    : `ยังไม่มีข้อมูลกะ${isTomorrow ? 'พรุ่งนี้' : 'วันนี้'} (${d.format('DD/MM/YYYY')}) เลยน้า~`;
  return { type: 'text', text };
}

export async function renderMonthSummary(userId, month, year) {
  const u2 = await User.findOne({ userId });
  const sched = await Schedule.findOne({ userId, team: u2?.currentTeam || 'default', branch: u2?.currentBranch || 'main', month, year });
  if (!sched) return { type: 'text', text: `ยังไม่มีตารางของ ${month}/${year} เลยฮะ ลองส่งใหม่อีกครั้งนะ 🐾` };

  const header = `สรุปกะงาน ${month}/${year} ของคุณ (ทีม: ${sched?.team || 'default'} / สาขา: ${sched?.branch || 'main'})\n`;
  const lines = sched.days.map(d => `${String(d.day).padStart(2,'0')}: ${d.code} ${codeToTime(d.code)}`).join('\n');
  return { type: 'text', text: header + lines };
}
