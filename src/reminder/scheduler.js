
import cron from 'node-cron';
import dayjs from 'dayjs';
import { User } from '../models/User.js';
import { Schedule } from '../models/Schedule.js';
import { lineClient } from '../line/client.js';
import { codeToTime } from '../logic/renderer.js';

let task = null;

export async function scheduleAllReminders() {
  if (task) { task.stop(); task = null; }
  task = cron.schedule('0 20 * * *', async () => {
    try {
      const now = dayjs();
      const tmr = now.add(1, 'day');
      const users = await User.find({ notifyEnabled: true });
      for (const u of users) {
        const sched = await Schedule.findOne({ userId: u.userId, team: u.currentTeam || 'default', branch: u.currentBranch || 'main', month: tmr.month()+1, year: tmr.year() });
        const code = sched?.days?.find(x => x.day === tmr.date())?.code;
        if (!code) continue;
        const text = `แจ้งเตือนกะงานพรุ่งนี้ (${tmr.format('DD/MM/YYYY')}) 🐕🔔\nกะ: ${code} ${codeToTime(code)}\nนอนได้แล้วน้า~ 😴`;
        await lineClient.pushMessage(u.userId, { type: 'text', text });
      }
      console.log(`[Shiba] reminder sent for ${tmr.format('YYYY-MM-DD')} to ${users.length} users`);
    } catch (e) {
      console.error('reminder task error', e);
    }
  }, { timezone: process.env.APP_TZ || 'Asia/Bangkok' });
}
