// tools/create-richmenu.js
import fs from 'fs';
import path from 'path';
import line from '@line/bot-sdk';
import 'dotenv/config';

const client = new line.Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
});

const richmenu = {
  size: { width: 2500, height: 1686 },
  selected: true,
  name: 'shiba_main_v1',
  chatBarText: 'Shiba Menu 🐕',
  areas: [
    { bounds: { x: 0,    y: 0,   width: 833, height: 843 },  action: { type: 'message', text: 'Start', label: 'Submit Schedule' } },
    { bounds: { x: 833,  y: 0,   width: 834, height: 843 },  action: { type: 'message', text: 'Today', label: 'Today Shift' } },
    { bounds: { x: 1667, y: 0,   width: 833, height: 843 },  action: { type: 'message', text: 'Tomorrow', label: 'Tomorrow Shift' } },
    { bounds: { x: 0,    y: 843, width: 833, height: 843 },  action: { type: 'message', text: 'My Schedule', label: 'My Calendar' } },
    { bounds: { x: 833,  y: 843, width: 834, height: 843 },  action: { type: 'message', text: 'Team Info', label: 'Team Info' } },
    { bounds: { x: 1667, y: 843, width: 833, height: 843 },  action: { type: 'message', text: 'ICS Link', label: 'Export .ics' } },
  ],
};

async function main() {
  console.log('Creating rich menu...');
  const richMenuId = await client.createRichMenu(richmenu);
  console.log('RichMenuID:', richMenuId);
  const imgPath = path.resolve('richmenu-v1.png');
  const stream = fs.createReadStream(imgPath);
  await client.setRichMenuImage(richMenuId, stream, 'image/png');
  console.log('Image uploaded');
  await client.setDefaultRichMenu(richMenuId);
  console.log('Set as default rich menu ✅');
}

main().catch(err => { console.error(err); process.exit(1); });
