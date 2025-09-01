
import line from '@line/bot-sdk';

export const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

export const lineClient = new line.Client({
  channelAccessToken: lineConfig.channelAccessToken,
});

export const lineMiddleware = line.middleware({
  channelSecret: lineConfig.channelSecret,
});
