import { FastifyInstance } from 'fastify';
import { GoogleGenAI } from '@google/genai';
import prisma from '../lib/prisma';
import { redis } from '../lib/redis';

function formatRate(num: number, den: number): string {
  if (den === 0) return '0%';
  return `${((num / den) * 100).toFixed(1)}%`;
}

function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

const STATUS_PRIORITY: Record<string, number> = {
  pending: 0,
  sent: 1,
  delivered: 2,
  opened: 3,
  clicked: 4,
  purchased: 5,
  failed: 6,
};

export async function campaignRoutes(fastify: FastifyInstance) {
  const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  // ── GET /api/campaigns ───────────────────────────────────
  fastify.get('/api/campaigns', async (request, reply) => {
    const campaigns = await prisma.campaign.findMany({
      include: { persona: true },
      orderBy: { created_at: 'desc' },
    });
    
    return reply.send(campaigns.map((c) => ({
      id: c.id,
      name: c.name,
      persona: c.persona.name,
      channel: c.channel,
      status: c.status,
      created_at: c.created_at.toISOString(),
    })));
  });

  // ── GET /api/campaigns/:id ───────────────────────────────
  fastify.get<{ Params: { id: string } }>('/api/campaigns/:id', async (request, reply) => {
    const campaign = await prisma.campaign.findUnique({ 
      where: { id: request.params.id },
      include: { persona: true },
    });
    if (!campaign) return reply.status(404).send({ error: 'Campaign not found' });
    
    return reply.send({
      id: campaign.id,
      name: campaign.name,
      persona: campaign.persona.name,
      channel: campaign.channel,
      status: campaign.status,
      message: campaign.message,
      created_at: campaign.created_at.toISOString(),
    });
  });

  // ── GET /api/campaigns/:id/insights ─────────────────────
  fastify.get<{ Params: { id: string } }>('/api/campaigns/:id/insights', async (request, reply) => {
    const { id } = request.params;

    // Check Redis cache (60s)
    const cacheKey = `insights:${id}`;
    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) {
      return reply.send(JSON.parse(cached));
    }

    const campaign = await prisma.campaign.findUnique({ 
      where: { id },
      include: { persona: true }
    });
    
    if (!campaign) return reply.status(404).send({ error: 'Campaign not found' });

    const communications = await prisma.communication.findMany({
      where: { campaign_id: id },
      include: {
        customer: true,
      },
    });

    const total = communications.length;
    const sent = communications.filter((m) => STATUS_PRIORITY[m.status] >= STATUS_PRIORITY.sent).length;
    const delivered = communications.filter((m) => STATUS_PRIORITY[m.status] >= STATUS_PRIORITY.delivered).length;
    const opened = communications.filter((m) => STATUS_PRIORITY[m.status] >= STATUS_PRIORITY.opened).length;
    const clicked = communications.filter((m) => STATUS_PRIORITY[m.status] >= STATUS_PRIORITY.clicked).length;
    const purchased = communications.filter((m) => STATUS_PRIORITY[m.status] >= STATUS_PRIORITY.purchased).length;
    const failed = communications.filter((m) => m.status === 'failed').length;

    // Revenue estimate: sum of total_spend of converted customers?
    // Wait, let's use the average order value of these specific customers.
    let totalRevenue = 0;
    const purchasedComms = communications.filter((m) => STATUS_PRIORITY[m.status] >= STATUS_PRIORITY.purchased);
    
    // To estimate revenue, we multiply purchased count by average order value.
    // Let's get actual orders for purchased customers.
    for (const comm of purchasedComms) {
      const orders = await prisma.order.aggregate({
        where: { customer_id: comm.customer_id },
        _sum: { amount: true },
        _count: { id: true }
      });
      const aov = orders._count.id > 0 ? Number(orders._sum.amount) / orders._count.id : 1500;
      totalRevenue += aov;
    }
    const estimatedRevenue = Math.round(totalRevenue);

    // AI summary — check cache, else generate
    let aiSummary = 'Campaign performance data is being analyzed.';
    try {
      const summaryKey = `ai_summary:${id}`;
      const cachedSummary = await redis.get(summaryKey).catch(() => null);
      
      if (cachedSummary) {
        aiSummary = cachedSummary;
      } else if (process.env.GEMINI_API_KEY && sent > 0) {
        const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        const prompt = `Campaign: "${campaign.name}" targeting ${campaign.persona.name}.
Results: ${sent} sent, ${delivered} delivered (${formatRate(delivered, sent)}), ${opened} opened (${formatRate(opened, delivered)}), ${clicked} clicked (${formatRate(clicked, opened)}), ${purchased} purchased (${formatRate(purchased, sent)}).
Channel: ${campaign.channel}
Estimated revenue: ${formatRupees(estimatedRevenue)}.

Write exactly 2 sentences of marketing insight: what worked and why. Do not use markdown formatting.`;

        const resp = await genai.models.generateContent({
          model,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: { temperature: 0.7 },
        });
        aiSummary = resp.text?.trim() || aiSummary;
        await redis.set(summaryKey, aiSummary, 'EX', 3600).catch(() => {});
      }
    } catch (err) {
      console.error('AI summary error:', err);
    }

    const insights = {
      campaign_id: id,
      campaign_name: campaign.name,
      persona: campaign.persona.name,
      channel: campaign.channel,
      audience_count: total,
      funnel: {
        sent,
        delivered,
        opened,
        clicked,
        purchased,
        failed,
        delivery_rate: formatRate(delivered, total),
        open_rate: formatRate(opened, delivered),
        click_rate: formatRate(clicked, opened),
        conversion_rate: formatRate(purchased, sent),
      },
      estimated_revenue: formatRupees(estimatedRevenue),
      ai_summary: aiSummary,
    };

    // Cache insights for 5s (so UI updates faster during simulation)
    await redis.set(cacheKey, JSON.stringify(insights), 'EX', 5).catch(() => {});

    return reply.send(insights);
  });
}
