import { FastifyInstance } from 'fastify';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { queueSendJob } from '../lib/queue';

const QueryPersonasSchema = z.object({
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

export async function aiRoutes(fastify: FastifyInstance) {
  const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  // ── 1. Query Personas ─────────────────────────────────────────
  fastify.post('/api/ai/query-personas', async (request, reply) => {
    try {
      const { goal } = QueryPersonasSchema.parse(request.body);
      
      // Fetch all personas from DB
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

      const response = await genai.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              { text: `Personas:\n${personaListStr}\n\nMarketer Goal: "${goal}"` },
            ],
          },
        ],
        config: { systemInstruction: systemPrompt, temperature: 0.1 },
      });

      const cleaned = (response.text ?? '').replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
      const aiResult = JSON.parse(cleaned);

      const matchedPersona = personas.find((p) => p.id === aiResult.persona_id) || personas[0];

      // Count audience
      const count = await prisma.customerPersona.count({
        where: { persona_id: matchedPersona.id },
      });

      return reply.send({
        persona: matchedPersona,
        count,
      });
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: 'Failed to query personas' });
    }
  });

  // ── 2. Recommend Campaign ─────────────────────────────────────
  fastify.post('/api/ai/recommend-campaign', async (request, reply) => {
    try {
      const { persona_id } = RecommendCampaignSchema.parse(request.body);

      // Find best channel
      const channels = await prisma.channelMetric.findMany({
        orderBy: { conversion_rate: 'desc' },
      });
      const bestChannel = channels[0] || { channel: 'WhatsApp', conversion_rate: 5 };

      // Calculate AOV for this persona
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
      console.error(err);
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

      const response = await genai.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [{ text: `Persona: ${persona_name}, Channel: ${channel}` }],
          },
        ],
        config: { systemInstruction: systemPrompt, temperature: 0.7 },
      });

      const cleaned = (response.text ?? '').replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
      const variants = JSON.parse(cleaned);

      return reply.send(variants);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: 'Failed to draft messages' });
    }
  });

  // ── 4. Launch Campaign ────────────────────────────────────────
  fastify.post('/api/ai/launch-campaign', async (request, reply) => {
    try {
      const { name, persona_id, channel, message } = LaunchCampaignSchema.parse(request.body);

      // Create Campaign
      const campaign = await prisma.campaign.create({
        data: {
          name,
          persona_id,
          channel,
          message,
          status: 'sending',
        },
      });

      // Find all customers in persona
      const customerPersonas = await prisma.customerPersona.findMany({
        where: { persona_id },
      });

      // Create Communications
      const commData = customerPersonas.map((cp) => ({
        campaign_id: campaign.id,
        customer_id: cp.customer_id,
        status: 'pending',
      }));

      await prisma.communication.createMany({ data: commData });

      // Fetch created communications to queue them
      const comms = await prisma.communication.findMany({
        where: { campaign_id: campaign.id },
      });

      // Enqueue Jobs
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
      console.error(err);
      return reply.status(500).send({ error: 'Failed to launch campaign' });
    }
  });
}
