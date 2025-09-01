
import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { initMongo } from './lib/db.js';
import { lineMiddleware, handleLineWebhook } from './line/webhook.js';
import { scheduleAllReminders } from './reminder/scheduler.js';
import { Schedule } from './models/Schedule.js';
import { scheduleToICS } from './lib/ics.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(process.env.APP_TZ || 'Asia/Bangkok');

const app = express();


app.get('/', (req, res) => res.send('Shiba Shift Bot is running 🐕‍🦺'));
app.get('/healthz', (req, res) => res.json({status:'ok', name:'shiba-shift-bot', tz: process.env.APP_TZ || 'Asia/Bangkok'}));
app.post(
  '/webhook',
  express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }),
  lineMiddleware,
  handleLineWebhook
);
app.use(bodyParser.json());

// .ics export (month)
app.get('/ics/:userId/:year/:month', async (req, res) => {
  const { userId, year, month } = req.params;
  const y = parseInt(year, 10);
  const m = parseInt(month, 10);
  const sched = await Schedule.findOne({ userId, month: m, year: y });
  if (!sched) return res.status(404).send('Not found');
  const ics = scheduleToICS({ year: y, month: m, days: sched.days, title: `${m}/${y}` });
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="shift-${userId}-${y}-${m}.ics"`);
  return res.send(ics);
});

const PORT = process.env.PORT || 3000;

await initMongo();

app.listen(PORT, () => {
  console.log(`[Shiba] server at :${PORT}`);
});

scheduleAllReminders().catch(err => console.error('scheduler error', err));
