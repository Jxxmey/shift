
import dayjs from 'dayjs';
import { User } from '../models/User.js';
import { Schedule } from '../models/Schedule.js';
import { parseScheduleText, SHIFTS, expandMonthTitle } from './parser.js';
import { renderMonthSummary, renderTodayTomorrow } from './renderer.js';
import { chatWithOpenRouter } from '../openrouter/chat.js';

export async function ensureUser(userId) {
  const user = await User.findOneAndUpdate(
    { userId },
    {},
    { upsert: true, new: true }
  );
  return user;
}

export async function handleText(userId, text, event) {
  const t = text.trim();

  if (/^(start|help)$/i.test(t)) return helpMessages();
  if (/^ตั้งเตือน\s*(on|off)?$/i.test(t)) {
    const m = t.match(/(on|off)/i);
    const notifyEnabled = !m || m[1].toLowerCase() === 'on';
    await User.updateOne({ userId }, { notifyEnabled });
    return { type: 'text', text: notifyEnabled ? 'เปิดการแจ้งเตือนแล้วจ้า 🐾 (ทุกวัน 20:00 น.)' : 'ปิดการแจ้งเตือนให้แล้วนะ 💤' };
  }
  if (/^ข้อมูลทีม$/i.test(t)) {
    const u = await User.findOne({ userId });
    return { type: 'text', text: `ทีมปัจจุบัน: ${u?.currentTeam || 'default'}\nสาขา: ${u?.currentBranch || 'main'}` };
  }
  if (/^ตั้งทีม\s+(.+)/i.test(t)) {
    const [, team] = t.match(/^ตั้งทีม\s+(.+)/i);
    await User.updateOne({ userId }, { currentTeam: team.trim() });
    return { type: 'text', text: `โอเค เปลี่ยนทีมเป็น "${team.trim()}" แล้วนะ 🐕🤝` };
  }
  if (/^ตั้งสาขา\s+(.+)/i.test(t)) {
    const [, branch] = t.match(/^ตั้งสาขา\s+(.+)/i);
    await User.updateOne({ userId }, { currentBranch: branch.trim() });
    return { type: 'text', text: `รับทราบ เปลี่ยนสาขาเป็น "${branch.trim()}" แล้วค้าบ 🌸` };
  }
  if (/^กะ(วันนี้|พรุ่งนี้)$/i.test(t)) {
    return renderTodayTomorrow(userId, t.includes('พรุ่งนี้'));
  }
  if (/^ตารางของฉัน$/i.test(t)) {
    const now = dayjs();
    return renderMonthSummary(userId, now.month() + 1, now.year());
  }
  if (/^ลบตาราง\s+(.+)/i.test(t)) {
    const [, title] = t.match(/^ลบตาราง\s+(.+)/i);
    const { month, year } = expandMonthTitle(title);
    const u = await User.findOne({ userId });
    await Schedule.deleteOne({ userId, team: u?.currentTeam || 'default', branch: u?.currentBranch || 'main', month, year });
    return { type: 'text', text: `ลบตารางของ ${title} แล้วนะคับ 🗑️` };
  }

  const lines = t.split(/\n|\r/).map(s => s.trim()).filter(Boolean);
  if (lines.length >= 2) {
    try {
      const parsed = parseScheduleText(lines.join('\n'));
      const u = await User.findOne({ userId });
      await Schedule.findOneAndUpdate(
        { userId: userId, team: u?.currentTeam || 'default', branch: u?.currentBranch || 'main', month: parsed.month, year: parsed.year },
        { $set: { days: parsed.days, rawText: t, team: u?.currentTeam || 'default', branch: u?.currentBranch || 'main' } },
        { upsert: true }
      );
      return [
        { type: 'text', text: `รับตารางของ ${parsed.title} แล้วฮับ! 🐶✅ (ทีม: ${u?.currentTeam || 'default'} / สาขา: ${u?.currentBranch || 'main'})` },
        await renderMonthSummary(userId, parsed.month, parsed.year)
      ];
    } catch (e) {
      return { type: 'text', text: `งืออ อ่านตารางไม่เข้าใจนิดนึง ลองรูปแบบนี้นะครับ:\n\nSeptember 2025\nX\t11\t11\t4\t2 ... (เรียงวันที่ 1 ถึงวันสุดท้าย)\n\nรายละเอียด: ${e.message}` };
    }
  }

  try {
    const reply = await chatWithOpenRouter(t, event.source?.userId);
    return { type: 'text', text: reply };
  } catch (e) {
    return { type: 'text', text: 'เมี๊ยวว เอ้ย เห่าๆ 🐕 ถ้าจะคุยเล่นเปิด OpenRouter ให้ชิบะก่อนน้า~' };
  }
}

function helpMessages() {
  const commands = [
    '• Start – แสดงคำสั่งทั้งหมด 🧾',
    '• ส่งตาราง – วางแบบนี้:\n  September 2025\n  X 11 11 4 2 12 ...',
    '• กะวันนี้ / กะพรุ่งนี้ – ดูกะของตัวเองวันนี้/พรุ่งนี้ ⏰',
    '• ตารางของฉัน – ดูสรุปทั้งเดือน 📅',
    '• ตั้งเตือน on|off – เปิด/ปิด แจ้งเตือน 20:00 ของวันก่อนหน้า 🔔',
    '• ลบตาราง <Month Year> – ลบตารางเดือนนั้น 🗑️',
    '• ตั้งทีม <ชื่อทีม> – เปลี่ยนทีมปัจจุบัน 👥',
    '• ตั้งสาขา <ชื่อสาขา> – เปลี่ยนสาขาปัจจุบัน 🏢',
    '• ข้อมูลทีม – ดูทีม/สาขาที่ใช้งานอยู่ 📌'
  ].join('\n');

  const legend = Object.entries(SHIFTS)
    .map(([k, v]) => `${k} → ${v.label}${v.start ? ` (${v.start}-${v.end})` : ''}`)
    .join('\n');

  return [
    { type: 'text', text: `หวัดดีฮับ! ผมชิบะผู้ช่วยกะงาน 🐕🍡\n\nคำสั่งพื้นฐาน:\n${commands}` },
    { type: 'text', text: `รหัสกะงาน:\n${legend}` },
  ];
}
