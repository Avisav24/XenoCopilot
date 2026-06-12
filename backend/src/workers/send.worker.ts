import 'dotenv/config';
import { Worker, Job } from 'bullmq';
import prisma from '../lib/prisma';
import { SEND_QUEUE_NAME, SendJobData } from '../lib/queue';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const CHANNEL_SIM_URL = process.env.CHANNEL_SIM_URL || 'http://localhost:3002';

async function processJob(job: Job<SendJobData>): Promise<void> {
  const { communication_id } = job.data;

  console.log(`[worker] Processing job ${job.id} for communication ${communication_id}`);

  // Fetch communication data
  const comm = await prisma.communication.findUnique({
    where: { id: communication_id },
    include: {
      campaign: true,
      customer: true,
    },
  });

  if (!comm) {
    console.error(`[worker] Communication ${communication_id} not found`);
    return;
  }

  // Update to 'sent'
  await prisma.communication.update({
    where: { id: communication_id },
    data: { status: 'sent', sent_at: new Date() },
  });

  // POST to channel simulator
  try {
    const resp = await fetch(`${CHANNEL_SIM_URL}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId: comm.campaign_id,
        recipients: [
          {
            communicationId: comm.id,
            channel: comm.campaign.channel || 'whatsapp',
            phoneOrEmail: comm.customer.phone || comm.customer.email,
          }
        ]
      }),
    });

    if (!resp.ok) {
      throw new Error(`Channel sim returned ${resp.status}`);
    }

    console.log(`[worker] Communication ${communication_id} dispatched to channel sim`);
  } catch (err) {
    console.error(`[worker] Failed to dispatch communication ${communication_id}:`, err);
    await prisma.communication.update({
      where: { id: communication_id },
      data: {
        status: 'failed',
      },
    });
  }
}

const worker = new Worker(SEND_QUEUE_NAME, processJob, {
  connection: { url: REDIS_URL, maxRetriesPerRequest: null },
  concurrency: 10,
});

worker.on('completed', (job) => {
  console.log(`[worker] Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`[worker] Job ${job?.id} failed:`, err.message);
});

worker.on('error', (err) => {
  console.error('[worker] Worker error:', err);
});

console.log(`🔧 BullMQ worker started — listening on queue "${SEND_QUEUE_NAME}"`);

process.on('SIGTERM', async () => {
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});
