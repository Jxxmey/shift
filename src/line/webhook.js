import { lineClient, lineMiddleware } from './client.js';
import { ensureUser, handleText } from '../logic/handler.js';

export { lineMiddleware };

export async function handleLineWebhook(req, res) {
  try {
    const events = Array.isArray(req.body?.events) ? req.body.events : [];
    if (!events.length) return res.status(200).json({ ok: true, events: 0 });

    const results = await Promise.all(
      events.map(async (event) => {
        try {
          const replyToken = event.replyToken;
          if (event?.source?.userId) await ensureUser(event.source.userId);

          if (event.type === 'follow' || event.type === 'memberJoined') {
            if (replyToken) return reply(replyToken, welcomeMessage());
            return null;
          }

          if (event.type === 'message' && event.message?.type === 'text') {
            const msg = await handleText(event.source?.userId, event.message.text ?? '', event);
            if (replyToken) return reply(replyToken, msg);
            return null;
          }

          return null;
        } catch (e) {
          console.error('webhook per-event error', e);
          if (event?.replyToken) {
            try {
              await reply(event.replyToken, [
                { type: 'text', text: 'อุ๋ง.. มีอะไรสะดุดนิดนึง ลองใหม่อีกครั้งได้ไหมครับ 🐶💦' },
              ]);
            } catch (e2) {
              console.error('reply fallback failed', e2);
            }
          }
          return null;
        }
      })
    );

    return res.status(200).json(results);
  } catch (e) {
    console.error('webhook top-level error', e);
    return res.status(200).json({ ok: true });
  }
}

function reply(replyToken, messages) {
  const arr = Array.isArray(messages) ? messages : [messages];
  return lineClient.replyMessage(replyToken, arr);
}

function welcomeMessage() {
  return [{ type: 'text', text: 'โฮ่ว~ ชิบะผู้ช่วยกะงานมาแล้วครับ! 🐕✨\nพิมพ์ Start เพื่อดูคำสั่งทั้งหมดได้เลย' }];
}
