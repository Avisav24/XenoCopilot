import { Queue } from 'bullmq';
import prisma from './prisma';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const SEND_QUEUE_NAME = 'send-queue';

export const sendQueue = new Queue(SEND_QUEUE_NAME, {
  connection: { url: REDIS_URL, maxRetriesPerRequest: null },
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 500 },
  },
});

export interface SendJobData {
  communication_id: string;
}

export async function queueSendJob(communication_id: string) {
  await sendQueue.add('send-communication', { communication_id });
}
