
import { lineClient, lineMiddleware } from './client.js';
import { ensureUser, handleText } from '../logic/handler.js';

export { lineMiddleware };

export async function handleLineWebhook(req, res) {
  const events = req.body.events || [];
  const results = await Promise.all(
    events.map(async (event) => {
      try {
        if (event.type === 'follow' || event.type === 'memberJoined') {
          await ensureUser(event.source.userId);
          return reply(event.replyToken, welcomeMessage());
        }
        if (event.type === 'message' && event.message.type === 'text') {
          await ensureUser(event.source.userId);
          const messages = await handleText(event.source.userId, event.message.text, event);
          return reply(event.replyToken, messages);
        }
        return Promise.resolve(null);
      } catch (e) {
        console.error('webhook error', e);
        return reply(event.replyToken, [{ type: 'text', text: 'อุ๋ง.. มีอะไรสะดุดนิดนึง ลองใหม่อีกครั้งได้ไหมครับ 🐶💦' }]);
      }
    })
  );
  res.json(results);
}

function reply(replyToken, messages) {
  const arr = Array.isArray(messages) ? messages : [messages];
  return lineClient.replyMessage(replyToken, arr);
}

function welcomeMessage() {
  return [
    { type: 'text', text: 'โฮ่ว~ ชิบะผู้ช่วยกะงานมาแล้วครับ! 🐕✨\nพิมพ์ Start เพื่อดูคำสั่งทั้งหมดได้เลย' },
  ];
}
