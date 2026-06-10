import { Queue } from 'bullmq';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const SEND_QUEUE_NAME = 'send-queue';

export const sendQueue = new Queue(SEND_QUEUE_NAME, {
  connection: { url: REDIS_URL, maxRetriesPerRequest: null },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 500 },
  },
});

export interface SendJobData {
  campaign_message_id: string;
  campaign_id: string;
  channel: string;
  recipient: string;
  message_text: string;
}
