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
    
    if (purchasedComms.length > 0) {
      const customerIds = purchasedComms.map((c) => c.customer_id);
      
      // Perform a single query to get order aggregates for all converted customers (fixes N+1 query performance issue)
      const orderAggregates = await prisma.order.groupBy({
        by: ['customer_id'],
        where: { customer_id: { in: customerIds } },
        _sum: { amount: true },
        _count: { id: true }
      });
      
      const orderMap = new Map(orderAggregates.map(o => [o.customer_id, o]));
      
      for (const comm of purchasedComms) {
        const orderData = orderMap.get(comm.customer_id);
        const aov = (orderData && orderData._count.id > 0) 
            ? Number(orderData._sum.amount) / orderData._count.id 
            : 1500;
        totalRevenue += aov;
      }
    }
    const actualRevenue = Math.round(totalRevenue);
    
    // Revenue Attribution Engine
    const predictedRevenue = Math.round(total * 0.02 * 1500); // Mock baseline prediction
    const difference = actualRevenue - predictedRevenue;
    const performanceVsPrediction = predictedRevenue > 0 ? ((difference / predictedRevenue) * 100).toFixed(1) : '0';
    
    // Aggregate revenue by persona for this campaign
    const revenueSources: Record<string, number> = {};
    if (purchasedComms.length > 0) {
      // Fetch personas for converted customers
      const convertedIds = purchasedComms.map(c => c.customer_id);
      const convertedPersonas = await prisma.customerPersona.findMany({
        where: { customer_id: { in: convertedIds } },
        include: { persona: true }
      });
      
      const orderAggregates = await prisma.order.groupBy({
        by: ['customer_id'],
        where: { customer_id: { in: convertedIds } },
        _sum: { amount: true },
        _count: { id: true }
      });
      const orderMap = new Map(orderAggregates.map(o => [o.customer_id, o]));
      
      for (const comm of purchasedComms) {
        const orderData = orderMap.get(comm.customer_id);
        const aov = (orderData && orderData._count.id > 0) ? Number(orderData._sum.amount) / orderData._count.id : 1500;
        
        // Find persona for this customer
        const cps = convertedPersonas.filter(cp => cp.customer_id === comm.customer_id);
        const pName = cps.length > 0 ? cps[0].persona.name : 'Unknown';
        revenueSources[pName] = (revenueSources[pName] || 0) + aov;
      }
    }

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
Estimated revenue: ${formatRupees(actualRevenue)}.

You are a Senior Growth Strategist reporting to executives. Write exactly 2 sentences of high-level insight.
Do NOT simply list metrics (e.g. "open rate increased").
DO focus on business impact, revenue multipliers, and strategic findings.
Example: "WhatsApp campaigns targeting dormant VIP customers generated 2.3x more attributed revenue than email campaigns during the same period. This indicates a strong preference for direct conversational channels for high-ticket reactivations."
Do not use markdown formatting.`;

        // Fire and forget AI generation so we don't block the UI
        Promise.resolve().then(async () => {
          try {
            const resp = await genai.models.generateContent({
              model,
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              config: { temperature: 0.7 },
            });
            const text = resp.text?.trim();
            if (text) {
              await redis.set(summaryKey, text, 'EX', 3600).catch(() => {});
            }
          } catch (aiErr) {
            console.error('Async AI summary error:', aiErr);
          }
        });
        aiSummary = 'Campaign performance data is being analyzed...';
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
      actual_revenue: formatRupees(actualRevenue),
      predicted_revenue: formatRupees(predictedRevenue),
      revenue_difference: difference > 0 ? `+${formatRupees(difference)}` : formatRupees(difference),
      performance_pct: performanceVsPrediction,
      revenue_sources: Object.entries(revenueSources).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value),
      ai_summary: aiSummary,
    };

    // Cache insights for 5s (so UI updates faster during simulation)
    await redis.set(cacheKey, JSON.stringify(insights), 'EX', 5).catch(() => {});

    return reply.send(insights);
  });
}
