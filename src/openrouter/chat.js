
import axios from 'axios';

export async function chatWithOpenRouter(userText, userId) {
  if (!process.env.OPENROUTER_API_KEY) throw new Error('no openrouter key');
  const model = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat';
  const res = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
    model,
    messages: [
      { role: 'system', content: 'คุณเป็นชิบะบอทผู้ช่วยกะงาน พูดสุภาพ สดใส แทรกอิโมจิน่ารัก ตอบกระชับ' },
      { role: 'user', content: userText }
    ],
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.BASE_URL || 'http://localhost:3000',
      'X-Title': 'Shiba Shift Bot',
    }
  });
  return res.data?.choices?.[0]?.message?.content || 'เห่าๆ~';
}
