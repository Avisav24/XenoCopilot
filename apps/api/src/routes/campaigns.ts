import { FastifyInstance } from 'fastify';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { sendQueue } from '../lib/queue';
import { querySegment, renderMessage } from '../lib/segment';
import type { CampaignPlan, MessageVariant, SegmentRule } from '../types';

// ── Helpers ───────────────────────────────────────────────
function formatRate(num: number, den: number): string {
  if (den === 0) return '0%';
  return `${((num / den) * 100).toFixed(1)}%`;
}

function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

/** Pick the best message variant for a customer */
function pickVariant(variants: MessageVariant[], customer: {
  favorite_category?: string | null;
  preferred_channel?: string | null;
}): MessageVariant {
  // Try to match both category and channel
  const exact = variants.find(
    (v) =>
      v.channel === customer.preferred_channel &&
      v.persona_tag.toLowerCase().includes((customer.favorite_category || '').toLowerCase())
  );
  if (exact) return exact;

  // Match by channel
  const byChannel = variants.find((v) => v.channel === customer.preferred_channel);
  if (byChannel) return byChannel;

  // Match by category
  const byCat = variants.find((v) =>
    v.persona_tag.toLowerCase().includes((customer.favorite_category || '').toLowerCase())
  );
  if (byCat) return byCat;

  return variants[0];
}

// ── Status priority for forward-only updates ──────────────
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

export async function campaignRoutes(fastify: FastifyInstance) {
  const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  // ── GET /api/campaigns ───────────────────────────────────
  fastify.get('/api/campaigns', async (request, reply) => {
    const campaigns = await prisma.campaign.findMany({
      where: { brand_id: 'drape-co' },
      orderBy: { created_at: 'desc' },
    });
    return reply.send(campaigns.map(serializeCampaign));
  });

  // ── POST /api/campaigns ──────────────────────────────────
  const CreateCampaignSchema = z.object({
    name: z.string().min(1),
    goal: z.string().min(1),
    ai_plan: z.any().optional(),
    segment_rules: z.any().optional(),
  });

  fastify.post('/api/campaigns', async (request, reply) => {
    const body = CreateCampaignSchema.parse(request.body);
    const campaign = await prisma.campaign.create({
      data: {
        name: body.name,
        goal: body.goal,
        ai_plan: body.ai_plan ?? undefined,
        segment_rules: body.segment_rules ?? undefined,
        status: 'draft',
        brand_id: 'drape-co',
      },
    });
    return reply.status(201).send(serializeCampaign(campaign));
  });

  // ── GET /api/campaigns/:id ───────────────────────────────
  fastify.get<{ Params: { id: string } }>('/api/campaigns/:id', async (request, reply) => {
    const campaign = await prisma.campaign.findUnique({ where: { id: request.params.id } });
    if (!campaign) return reply.status(404).send({ error: 'Campaign not found' });
    return reply.send(serializeCampaign(campaign));
  });

  // ── POST /api/campaigns/:id/send ─────────────────────────
  fastify.post<{ Params: { id: string } }>('/api/campaigns/:id/send', async (request, reply) => {
    const campaign = await prisma.campaign.findUnique({ where: { id: request.params.id } });
    if (!campaign) return reply.status(404).send({ error: 'Campaign not found' });
    if (campaign.status !== 'draft') {
      return reply.status(400).send({ error: 'Campaign is not in draft status' });
    }

    const segmentRules = campaign.segment_rules as SegmentRule[];
    if (!segmentRules || segmentRules.length === 0) {
      return reply.status(400).send({ error: 'Campaign has no segment rules' });
    }

    const aiPlan = campaign.ai_plan as CampaignPlan;
    const variants = aiPlan?.message_variants || [];
    if (!variants.length) {
      return reply.status(400).send({ error: 'Campaign has no message variants' });
    }

    // Re-apply segment rules
    const customers = await querySegment(segmentRules);

    // Create campaign_messages and queue jobs
    const messageInserts = customers.map((customer) => {
      const variant = pickVariant(variants, customer);
      const channel = customer.preferred_channel && variants.some(v => v.channel === customer.preferred_channel)
        ? customer.preferred_channel
        : variants[0].channel;

      const message_text = renderMessage(variant.body, {
        name: customer.name,
        favorite_category: customer.favorite_category,
        last_order_at: customer.last_order_at,
      });

      return {
        campaign_id: campaign.id,
        customer_id: customer.id,
        channel,
        message_text,
        status: 'pending' as const,
      };
    });

    // Batch insert messages
    await prisma.campaignMessage.createMany({ data: messageInserts });

    // Fetch inserted messages to get their IDs
    const messages = await prisma.campaignMessage.findMany({
      where: { campaign_id: campaign.id, status: 'pending' },
      include: { customer: { select: { email: true, phone: true } } },
    });

    // Update campaign status
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        status: 'sending',
        audience_count: customers.length,
        sent_at: new Date(),
      },
    });

    // Queue all jobs
    const jobs = messages.map((msg) => ({
      name: 'send-message',
      data: {
        campaign_message_id: msg.id,
        campaign_id: campaign.id,
        channel: msg.channel,
        recipient: msg.customer.email || msg.customer.phone || 'unknown',
        message_text: msg.message_text,
      },
    }));
    await sendQueue.addBulk(jobs);

    return reply.send({
      campaign_id: campaign.id,
      queued_count: messages.length,
      status: 'sending',
    });
  });

  // ── GET /api/campaigns/:id/messages ─────────────────────
  fastify.get<{
    Params: { id: string };
    Querystring: { limit?: string; offset?: string };
  }>('/api/campaigns/:id/messages', async (request, reply) => {
    const { id } = request.params;
    const limit = Math.min(Number(request.query.limit || 50), 100);
    const offset = Number(request.query.offset || 0);

    const messages = await prisma.campaignMessage.findMany({
      where: { campaign_id: id },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true, favorite_category: true } },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    });

    return reply.send(messages.map(serializeMessage));
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

    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) return reply.status(404).send({ error: 'Campaign not found' });

    const messages = await prisma.campaignMessage.findMany({
      where: { campaign_id: id },
      include: {
        customer: { select: { total_spend: true } },
      },
    });

    const total = messages.length;
    const sent = messages.filter((m) => STATUS_PRIORITY[m.status] >= STATUS_PRIORITY.sent).length;
    const delivered = messages.filter((m) => STATUS_PRIORITY[m.status] >= STATUS_PRIORITY.delivered).length;
    const opened = messages.filter((m) => STATUS_PRIORITY[m.status] >= STATUS_PRIORITY.opened).length;
    const clicked = messages.filter((m) => STATUS_PRIORITY[m.status] >= STATUS_PRIORITY.clicked).length;
    const converted = messages.filter((m) => STATUS_PRIORITY[m.status] >= STATUS_PRIORITY.converted).length;
    const failed = messages.filter((m) => m.status === 'failed').length;

    // By channel
    const channels = ['email', 'whatsapp', 'sms'] as const;
    const by_channel = channels.map((ch) => {
      const chMsgs = messages.filter((m) => m.channel === ch);
      return {
        channel: ch,
        sent: chMsgs.filter((m) => STATUS_PRIORITY[m.status] >= STATUS_PRIORITY.sent).length,
        delivered: chMsgs.filter((m) => STATUS_PRIORITY[m.status] >= STATUS_PRIORITY.delivered).length,
        opened: chMsgs.filter((m) => STATUS_PRIORITY[m.status] >= STATUS_PRIORITY.opened).length,
        clicked: chMsgs.filter((m) => STATUS_PRIORITY[m.status] >= STATUS_PRIORITY.clicked).length,
        converted: chMsgs.filter((m) => STATUS_PRIORITY[m.status] >= STATUS_PRIORITY.converted).length,
      };
    }).filter((ch) => ch.sent > 0);

    // By persona (from ai_plan)
    const aiPlan = campaign.ai_plan as CampaignPlan | null;
    const variants = aiPlan?.message_variants || [];
    const by_persona = variants.map((v) => {
      const personaMsgs = messages.filter(
        (m) => m.channel === v.channel
      );
      const personaSent = personaMsgs.length;
      const personaConverted = personaMsgs.filter((m) => STATUS_PRIORITY[m.status] >= STATUS_PRIORITY.converted).length;
      return {
        persona_tag: v.persona_tag,
        sent: personaSent,
        converted: personaConverted,
        conversion_rate: formatRate(personaConverted, personaSent),
      };
    });

    // Revenue estimate: avg spend of converted customers * conversion count
    const convertedMsgs = messages.filter((m) => STATUS_PRIORITY[m.status] >= STATUS_PRIORITY.converted);
    const avgSpend = convertedMsgs.length > 0
      ? convertedMsgs.reduce((sum, m) => sum + Number(m.customer.total_spend), 0) / convertedMsgs.length
      : 0;
    const estimatedRevenue = Math.round(avgSpend * 0.15 * convertedMsgs.length);

    // Top converting channel
    const topChannel = by_channel.reduce(
      (best, ch) => ch.converted > best.converted ? ch : best,
      by_channel[0] || { channel: 'email', converted: 0 }
    );

    // AI summary — check cache, else generate
    let aiSummary = 'Campaign performance data is being analyzed.';
    try {
      const summaryKey = `ai_summary:${id}`;
      const cachedSummary = await redis.get(summaryKey).catch(() => null);
      
      if (cachedSummary) {
        aiSummary = cachedSummary;
      } else if (process.env.GEMINI_API_KEY && sent > 0) {
        const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        const prompt = `Campaign: "${campaign.name}" for Drape & Co.
Goal: ${campaign.goal}
Results: ${sent} sent, ${delivered} delivered (${formatRate(delivered, sent)}), ${opened} opened (${formatRate(opened, delivered)}), ${clicked} clicked (${formatRate(clicked, opened)}), ${converted} converted (${formatRate(converted, sent)}).
Top channel: ${topChannel.channel} with ${topChannel.converted} conversions.
Estimated revenue: ${formatRupees(estimatedRevenue)}.

Write exactly 2 sentences of marketing insight: what worked and why.`;

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
      audience_count: campaign.audience_count,
      funnel: {
        sent,
        delivered,
        opened,
        clicked,
        converted,
        failed,
        delivery_rate: formatRate(delivered, total),
        open_rate: formatRate(opened, delivered),
        click_rate: formatRate(clicked, opened),
        conversion_rate: formatRate(converted, sent),
      },
      by_channel,
      by_persona,
      estimated_revenue: formatRupees(estimatedRevenue),
      top_converting_channel: topChannel?.channel || 'N/A',
      ai_summary: aiSummary,
    };

    // Cache insights for 60s
    await redis.set(cacheKey, JSON.stringify(insights), 'EX', 60).catch(() => {});

    return reply.send(insights);
  });
}

// ── Serializers ───────────────────────────────────────────
function serializeCampaign(c: {
  id: string; brand_id: string; name: string; goal: string;
  ai_plan: unknown; segment_rules: unknown; status: string;
  audience_count: number; created_at: Date; sent_at: Date | null;
}) {
  return {
    id: c.id,
    brand_id: c.brand_id,
    name: c.name,
    goal: c.goal,
    ai_plan: c.ai_plan,
    segment_rules: c.segment_rules,
    status: c.status,
    audience_count: c.audience_count,
    created_at: c.created_at.toISOString(),
    sent_at: c.sent_at?.toISOString() ?? null,
  };
}

function serializeMessage(m: {
  id: string; campaign_id: string; customer_id: string; channel: string;
  message_text: string; status: string; sent_at: Date | null;
  delivered_at: Date | null; opened_at: Date | null; clicked_at: Date | null;
  converted_at: Date | null; failed_reason: string | null; created_at: Date;
  customer: { id: string; name: string; email: string | null; phone: string | null; favorite_category: string | null };
}) {
  return {
    id: m.id,
    campaign_id: m.campaign_id,
    customer_id: m.customer_id,
    channel: m.channel,
    message_text: m.message_text,
    status: m.status,
    sent_at: m.sent_at?.toISOString() ?? null,
    delivered_at: m.delivered_at?.toISOString() ?? null,
    opened_at: m.opened_at?.toISOString() ?? null,
    clicked_at: m.clicked_at?.toISOString() ?? null,
    converted_at: m.converted_at?.toISOString() ?? null,
    failed_reason: m.failed_reason,
    created_at: m.created_at.toISOString(),
    customer: m.customer,
  };
}
