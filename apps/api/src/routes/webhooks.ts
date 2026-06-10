import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma';

// Status priority — higher = more advanced in lifecycle
const STATUS_PRIORITY: Record<string, number> = {
  pending: 0,
  sent: 1,
  delivered: 2,
  opened: 3,
  clicked: 4,
  purchased: 5,
  failed: 6,
};

const TERMINAL_STATES = new Set(['delivered', 'opened', 'clicked', 'purchased', 'failed']);

const WebhookSchema = z.object({
  communicationId: z.string().uuid(),
  event: z.enum(['delivered', 'failed', 'opened', 'clicked', 'purchased']),
  timestamp: z.string().optional(),
});

export async function webhookRoutes(fastify: FastifyInstance) {
  fastify.post('/api/webhook', async (request, reply) => {
    let body: z.infer<typeof WebhookSchema>;
    try {
      body = WebhookSchema.parse(request.body);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', issues: err.flatten() });
      }
      return reply.status(400).send({ error: 'Invalid request body' });
    }

    const comm = await prisma.communication.findUnique({
      where: { id: body.communicationId },
    });
    
    if (!comm) {
      return reply.send({ ok: true, note: 'communication_not_found' });
    }

    const currentPriority = STATUS_PRIORITY[comm.status] ?? 0;
    const newPriority = STATUS_PRIORITY[body.event] ?? 0;

    // Forward-only rule
    if (newPriority <= currentPriority && body.event !== 'failed') {
      return reply.send({ ok: true, note: 'status_not_upgraded' });
    }

    const ts = body.timestamp ? new Date(body.timestamp) : new Date();
    const updateData: Record<string, unknown> = { status: body.event };

    switch (body.event) {
      case 'delivered': updateData.delivered_at = ts; break;
      case 'opened': updateData.opened_at = ts; break;
      case 'clicked': updateData.clicked_at = ts; break;
      case 'purchased': updateData.purchased_at = ts; break;
    }

    await prisma.communication.update({
      where: { id: body.communicationId },
      data: updateData,
    });

    // Check if campaign is completed
    const allComms = await prisma.communication.findMany({
      where: { campaign_id: comm.campaign_id },
      select: { status: true },
    });

    const allTerminal = allComms.every((m) => TERMINAL_STATES.has(m.status));
    if (allTerminal) {
      await prisma.campaign.update({
        where: { id: comm.campaign_id },
        data: { status: 'completed' },
      });
    }

    return reply.send({ ok: true });
  });
}
