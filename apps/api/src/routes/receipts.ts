import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

// Status priority — higher = more advanced in lifecycle
const STATUS_PRIORITY: Record<string, number> = {
  pending: 0,
  sent: 1,
  delivered: 2,
  opened: 3,
  read: 4,
  clicked: 5,
  converted: 6,
  failed: 7,
};

// Terminal states (no further progression)
const TERMINAL_STATES = new Set(['delivered', 'opened', 'read', 'clicked', 'converted', 'failed']);

const ReceiptSchema = z.object({
  message_id: z.string().uuid(),
  event: z.enum(['delivered', 'failed', 'opened', 'clicked', 'converted']),
  timestamp: z.string(),
  reason: z.string().optional(),
});

export async function receiptRoutes(fastify: FastifyInstance) {
  fastify.post('/api/receipts', async (request, reply) => {
    let body: z.infer<typeof ReceiptSchema>;
    try {
      body = ReceiptSchema.parse(request.body);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', issues: err.flatten() });
      }
      return reply.status(400).send({ error: 'Invalid request body' });
    }

    // Find message
    const message = await prisma.campaignMessage.findUnique({
      where: { id: body.message_id },
    });
    if (!message) {
      // Silently accept to avoid channel-sim retry storms
      return reply.send({ ok: true, note: 'message_not_found' });
    }

    const currentPriority = STATUS_PRIORITY[message.status] ?? 0;
    const newPriority = STATUS_PRIORITY[body.event] ?? 0;

    // Forward-only rule: never downgrade status
    if (newPriority <= currentPriority && body.event !== 'failed') {
      return reply.send({ ok: true, note: 'status_not_upgraded' });
    }

    // Build update payload
    const ts = new Date(body.timestamp);
    const updateData: Record<string, unknown> = { status: body.event };

    switch (body.event) {
      case 'delivered':
        updateData.delivered_at = ts;
        break;
      case 'failed':
        updateData.failed_reason = body.reason || 'Unknown error';
        break;
      case 'opened':
        updateData.opened_at = ts;
        break;
      case 'clicked':
        updateData.clicked_at = ts;
        break;
      case 'converted':
        updateData.converted_at = ts;
        break;
    }

    await prisma.campaignMessage.update({
      where: { id: body.message_id },
      data: updateData,
    });

    // Check if all messages in campaign are in terminal state
    const allMessages = await prisma.campaignMessage.findMany({
      where: { campaign_id: message.campaign_id },
      select: { status: true },
    });

    const allTerminal = allMessages.every((m) => TERMINAL_STATES.has(m.status));
    if (allTerminal) {
      await prisma.campaign.update({
        where: { id: message.campaign_id },
        data: { status: 'completed' },
      });
    }

    return reply.send({ ok: true });
  });
}
