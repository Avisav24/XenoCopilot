import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const CRM_API_URL = process.env.CRM_API_URL || 'http://localhost:3001';
const PORT = process.env.PORT || 3002;

// ── Failure reasons ───────────────────────────────────────
const FAIL_REASONS = ['Invalid number', 'Opted out', 'Network error'];

// ── Fire and forget: simulate delivery lifecycle ──────────
async function simulateDelivery(message_id: string): Promise<void> {
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  // Random initial delay 2–8 seconds before first callback
  await delay(2000 + Math.random() * 6000);

  // 10% chance of failure
  if (Math.random() < 0.10) {
    await sendReceipt(message_id, 'failed', FAIL_REASONS[Math.floor(Math.random() * FAIL_REASONS.length)]);
    return;
  }

  // Delivered
  await sendReceipt(message_id, 'delivered');

  // 65% chance of opened (after 1–3s)
  if (Math.random() < 0.65) {
    await delay(1000 + Math.random() * 2000);
    await sendReceipt(message_id, 'opened');

    // 40% of opened → clicked (after 0.5–2s)
    if (Math.random() < 0.40) {
      await delay(500 + Math.random() * 1500);
      await sendReceipt(message_id, 'clicked');

      // 20% of clicked → converted (after 2–5s)
      if (Math.random() < 0.20) {
        await delay(2000 + Math.random() * 3000);
        await sendReceipt(message_id, 'converted');
      }
    }
  }
}

async function sendReceipt(
  message_id: string,
  event: 'delivered' | 'failed' | 'opened' | 'clicked' | 'converted',
  reason?: string
): Promise<void> {
  try {
    const body: Record<string, unknown> = {
      message_id,
      event,
      timestamp: new Date().toISOString(),
    };
    if (reason) body.reason = reason;

    const resp = await fetch(`${CRM_API_URL}/api/receipts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      console.error(`[sim] Receipt POST failed for ${message_id}: ${resp.status}`);
    } else {
      console.log(`[sim] ${event.toUpperCase()} → ${message_id}`);
    }
  } catch (err) {
    console.error(`[sim] Failed to send receipt for ${message_id}:`, err);
  }
}

// ── Routes ────────────────────────────────────────────────

// GET /health
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'channel-sim', timestamp: new Date().toISOString() });
});

// POST /simulate
interface SimulateBody {
  message_id: string;
  channel: string;
  recipient: string;
  message_text: string;
}

app.post('/simulate', (req: Request<{}, {}, SimulateBody>, res: Response) => {
  const { message_id, channel, recipient } = req.body;

  if (!message_id || !channel) {
    return res.status(400).json({ error: 'message_id and channel are required' });
  }

  console.log(`[sim] Received: ${channel} → ${recipient} (${message_id})`);

  // Accept immediately, fire-and-forget the simulation
  simulateDelivery(message_id).catch((err) =>
    console.error(`[sim] Simulation error for ${message_id}:`, err)
  );

  return res.json({ accepted: true });
});

// ── Start ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n📡 Channel Simulator running at http://localhost:${PORT}`);
  console.log(`   Callbacks → ${CRM_API_URL}/api/receipts\n`);
});
