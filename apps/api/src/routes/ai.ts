import { FastifyInstance } from 'fastify';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { queueSendJob } from '../lib/queue';

const QueryPersonasSchema = z.object({
  goal: z.string(),
});

const StrategizeSchema = z.object({
  goal: z.string(),
});

const RecommendCampaignSchema = z.object({
  persona_id: z.string().uuid(),
});

const DraftMessagesSchema = z.object({
  persona_name: z.string(),
  channel: z.string(),
});

const LaunchCampaignSchema = z.object({
  name: z.string(),
  persona_id: z.string().uuid(),
  channel: z.string(),
  message: z.string(),
});

// Helper function to retry Gemini API calls on 503 errors
async function generateContentWithRetry(genai: GoogleGenAI, model: string, options: any, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await genai.models.generateContent({
        model,
        ...options,
      });
    } catch (error: any) {
      if (error.message && error.message.includes('503') && attempt < maxRetries) {
        console.warn(`[Gemini API] 503 Service Unavailable on attempt ${attempt}. Retrying in ${attempt * 2}s...`);
        await new Promise(res => setTimeout(res, attempt * 2000));
      } else {
        throw error;
      }
    }
  }
}

export async function aiRoutes(fastify: FastifyInstance) {
  const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  // ── 1. Query Personas ─────────────────────────────────────────
  fastify.post('/api/ai/query-personas', async (request, reply) => {
    try {
      const { goal } = QueryPersonasSchema.parse(request.body);
      
      const personas = await prisma.persona.findMany();
      if (personas.length === 0) {
        return reply.status(400).send({ error: 'No personas defined in DB' });
      }

      const personaListStr = personas
        .map((p) => `ID: ${p.id} | Name: ${p.name} | Desc: ${p.description}`)
        .join('\n');

      const systemPrompt = `You are an AI Persona Engine. You must match the marketer's goal to the single most relevant Persona from the provided list.
      Return ONLY a JSON object with this exact structure:
      { "persona_id": "<matched_uuid>" }`;

      let aiResult;
      try {
        const response = await generateContentWithRetry(genai, model, {
          contents: [
            {
              role: 'user',
              parts: [{ text: `Personas:\n${personaListStr}\n\nMarketer Goal: "${goal}"` }],
            },
          ],
          config: { systemInstruction: systemPrompt, temperature: 0.1 },
        });

        const cleaned = (response?.text ?? '').replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
        aiResult = JSON.parse(cleaned);
      } catch (aiErr) {
        console.warn('AI query-personas failed, using fallback:', aiErr);
        aiResult = { persona_id: personas[0].id };
      }

      const matchedPersona = personas.find((p) => p.id === aiResult.persona_id) || personas[0];

      const count = await prisma.customerPersona.count({
        where: { persona_id: matchedPersona.id },
      });

      return reply.send({
        persona: matchedPersona,
        count,
      });
    } catch (err) {
      console.error('query-personas error:', err);
      return reply.status(500).send({ error: 'Failed to query personas' });
    }
  });

  // ── 2. Recommend Campaign ─────────────────────────────────────
  fastify.post('/api/ai/recommend-campaign', async (request, reply) => {
    try {
      const { persona_id } = RecommendCampaignSchema.parse(request.body);

      const channels = await prisma.channelMetric.findMany({
        orderBy: { conversion_rate: 'desc' },
      });
      const bestChannel = channels[0] || { channel: 'WhatsApp', conversion_rate: 5 };

      const customerPersonas = await prisma.customerPersona.findMany({
        where: { persona_id },
        include: { customer: true },
      });

      let totalRevenue = 0;
      let totalOrders = 0;
      for (const cp of customerPersonas) {
        const orders = await prisma.order.aggregate({
          where: { customer_id: cp.customer_id },
          _sum: { amount: true },
          _count: { id: true },
        });
        totalRevenue += Number(orders._sum.amount || 0);
        totalOrders += orders._count.id;
      }

      const aov = totalOrders > 0 ? totalRevenue / totalOrders : 1500;
      const expectedPurchasers = Math.round(customerPersonas.length * (Number(bestChannel.conversion_rate) / 100));
      const expectedRevenue = Math.round(expectedPurchasers * aov);

      return reply.send({
        channel: bestChannel.channel,
        expectedRevenue,
        expectedPurchasers,
        audienceCount: customerPersonas.length,
      });
    } catch (err) {
      console.error('recommend-campaign error:', err);
      return reply.status(500).send({ error: 'Failed to recommend campaign' });
    }
  });

  // ── 3. Draft Messages ─────────────────────────────────────────
  fastify.post('/api/ai/draft-messages', async (request, reply) => {
    try {
      const { persona_name, channel } = DraftMessagesSchema.parse(request.body);

      const systemPrompt = `You are an expert fashion copywriter. Draft 2 message variants for a campaign targeting the "${persona_name}" persona via ${channel}.
      Return ONLY a JSON object with this exact structure:
      {
        "variantA": "<message text>",
        "variantB": "<message text>"
      }`;

      let variants;
      try {
        const response = await generateContentWithRetry(genai, model, {
          contents: [
            {
              role: 'user',
              parts: [{ text: `Persona: ${persona_name}, Channel: ${channel}` }],
            },
          ],
          config: { systemInstruction: systemPrompt, temperature: 0.7 },
        });

        const cleaned = (response?.text ?? '').replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
        variants = JSON.parse(cleaned);
      } catch (aiErr) {
        console.warn('AI draft-messages failed, using fallback:', aiErr);
        variants = {
          variantA: `Hi! We noticed you might be interested in our new collection perfectly suited for ${persona_name}. Check it out now!`,
          variantB: `Exclusive offer for our best ${persona_name} customers. Don't miss out on these specially curated items for you.`
        };
      }

      return reply.send(variants);
    } catch (err) {
      console.error('draft-messages error:', err);
      return reply.status(500).send({ error: 'Failed to draft messages' });
    }
  });

  // ── 4. Launch Campaign ────────────────────────────────────────
  fastify.post('/api/ai/launch-campaign', async (request, reply) => {
    try {
      const { name, persona_id, channel, message } = LaunchCampaignSchema.parse(request.body);

      const campaign = await prisma.campaign.create({
        data: {
          name,
          persona_id,
          channel,
          message,
          status: 'sending',
        },
      });

      const customerPersonas = await prisma.customerPersona.findMany({
        where: { persona_id },
      });

      const commData = customerPersonas.map((cp) => ({
        campaign_id: campaign.id,
        customer_id: cp.customer_id,
        status: 'pending',
      }));

      await prisma.communication.createMany({ data: commData });

      const comms = await prisma.communication.findMany({
        where: { campaign_id: campaign.id },
      });

      let queued = 0;
      for (const comm of comms) {
        await queueSendJob(comm.id);
        queued++;
      }

      return reply.send({
        success: true,
        campaign_id: campaign.id,
        queued_count: queued,
      });
    } catch (err) {
      console.error('launch-campaign error:', err);
      return reply.status(500).send({ error: 'Failed to launch campaign' });
    }
  });

  // ── 5. Strategize (Full Revenue Agent) ────────────────────────
  fastify.post('/api/ai/strategize', async (request, reply) => {
    try {
      const { goal } = StrategizeSchema.parse(request.body);

      const personas = await prisma.persona.findMany();
      const stats = await prisma.customer.aggregate({
        _avg: { health_score: true },
        _count: { id: true }
      });

      const systemPrompt = `You are XenoCopilot, an AI Revenue Growth Strategist for retail and D2C brands.

Your purpose is NOT to generate generic marketing campaigns.

Your purpose is to identify revenue opportunities, understand customer behavior, explain reasoning, and recommend actions that maximize revenue and customer retention.

Always think like a senior CRM manager responsible for revenue growth.

Before recommending any campaign:
1. Analyze customer behavior.
2. Analyze purchase patterns.
3. Analyze customer personas.
4. Analyze health scores.
5. Analyze channel performance.
6. Explain why the opportunity exists.
7. Estimate business impact.

Never provide generic recommendations. Always personalize recommendations using actual customer data.

Return ONLY a JSON object with this EXACT structure:
{
  "markdownReport": "Your full, massive markdown report responding to the user's goal, matching the format below.",
  "campaignData": {
    "name": "Short Campaign Name",
    "persona_id": "UUID of the targeted persona",
    "channel": "WhatsApp",
    "message": "The text of Variant A"
  }
}

The markdownReport MUST follow this exact structure:
## Opportunity
Name: <opportunity>
Priority: High | Medium | Low
Audience: <number>
Potential Revenue: ₹<amount>
Confidence: <number>%

---
## Why This Matters
Explain: Customer behavior, Revenue potential, Risk of doing nothing.

---
## Audience Summary
Describe: Average spend, Purchase frequency, Preferred categories, Health score trends, Dominant personas.

---
## Channel Recommendation
Recommended Channel: WhatsApp | Email | SMS
Reason: Use actual channel performance data.

---
## Message Strategy
Explain: Why this message should work, What customer motivation is being targeted, Why this audience is likely to respond.

---
## Campaign Variants
Variant A
Variant B
Variant C

---
## Revenue Simulation
Expected Deliveries: <number>
Expected Opens: <number>
Expected Clicks: <number>
Expected Purchases: <number>
Expected Revenue: ₹<amount>
Explain how these estimates were calculated.

---
## Executive Recommendation
Summarize in 2-3 sentences. Focus on business outcomes rather than campaign metrics.`;

      const personaListStr = personas
        .map((p) => `ID: ${p.id} | Name: ${p.name} | Desc: ${p.description}`)
        .join('\n');

      let aiResult;
      try {
        const response = await generateContentWithRetry(genai, model, {
          contents: [
            {
              role: 'user',
              parts: [{ text: `Available Personas:\n${personaListStr}\n\nOverall DB Health Avg: ${Math.round(stats._avg.health_score || 0)}\n\nMarketer Goal: "${goal}"\n\nGenerate the strategy.` }],
            },
          ],
          config: { systemInstruction: systemPrompt, temperature: 0.2 },
        });

        const cleaned = (response?.text ?? '').replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
        aiResult = JSON.parse(cleaned);
      } catch (aiErr) {
        console.error('AI strategize failed:', aiErr);
        return reply.status(500).send({ error: 'AI failed to generate strategy' });
      }

      return reply.send(aiResult);
    } catch (err) {
      console.error('strategize error:', err);
      return reply.status(500).send({ error: 'Failed to strategize' });
    }
  });
}
