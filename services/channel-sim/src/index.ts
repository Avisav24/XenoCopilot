import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const CRM_API_URL = process.env.CRM_API_URL || 'http://localhost:3001';
const PORT = process.env.PORT || 3002;

// ── Fire and forget: simulate delivery lifecycle ──────────
async function simulateDelivery(communicationId: string): Promise<void> {
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  // Random initial delay 2–5 seconds
  await delay(2000 + Math.random() * 3000);

  // 8% chance of failure
  if (Math.random() < 0.08) {
    await sendWebhook(communicationId, 'failed');
    return;
  }

  // 92% Delivered
  await sendWebhook(communicationId, 'delivered');

  // 35% chance of opened
  if (Math.random() < 0.35) {
    await delay(1000 + Math.random() * 2000);
    await sendWebhook(communicationId, 'opened');

    // 20% of opened -> clicked
    if (Math.random() < 0.20) {
      await delay(500 + Math.random() * 1500);
      await sendWebhook(communicationId, 'clicked');

      // 5% of clicked -> purchased
      if (Math.random() < 0.05) {
        await delay(2000 + Math.random() * 3000);
        await sendWebhook(communicationId, 'purchased');
      }
    }
  }
}

async function sendWebhook(communicationId: string, event: string): Promise<void> {
  try {
    const resp = await fetch(`${CRM_API_URL}/api/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ communicationId, event }),
    });

    if (!resp.ok) {
      console.error(`[sim] Webhook POST failed for ${communicationId}: ${resp.status}`);
    } else {
      console.log(`[sim] ${event.toUpperCase()} → ${communicationId}`);
    }
  } catch (err) {
    console.error(`[sim] Failed to send webhook for ${communicationId}:`, err);
  }
}

// ── Routes ────────────────────────────────────────────────

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'channel-sim' });
});

interface Recipient {
  communicationId: string;
  channel: string;
  phoneOrEmail: string;
}

interface SendBody {
  campaignId: string;
  recipients: Recipient[];
}

app.post('/simulate', (req: Request<{}, {}, SendBody>, res: Response) => {
  const { campaignId, recipients } = req.body;

  if (!campaignId || !recipients || !Array.isArray(recipients)) {
    return res.status(400).json({ error: 'campaignId and recipients array required' });
  }

  console.log(`[sim] Received campaign ${campaignId} with ${recipients.length} recipients`);

  // Accept immediately
  res.json({ accepted: true });

  // Fire-and-forget simulation for each recipient
  for (const r of recipients) {
    simulateDelivery(r.communicationId).catch((err) =>
      console.error(`[sim] Simulation error for ${r.communicationId}:`, err)
    );
  }
});

// Alias /send to /simulate to match user spec precisely if needed
app.post('/send', (req: Request<{}, {}, SendBody>, res: Response) => {
  // Reroute to same handler
  req.url = '/simulate';
  app.handle(req, res);
});

// ── Start ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n📡 Channel Simulator running at http://localhost:${PORT}`);
  console.log(`   Webhooks → ${CRM_API_URL}/api/webhook\n`);
});
