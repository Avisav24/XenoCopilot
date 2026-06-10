import { FastifyInstance } from 'fastify';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { querySegment } from '../lib/segment';
import type { SegmentRule } from '../types';

// ── Zod Schemas ───────────────────────────────────────────
const PlanRequestSchema = z.object({
  goal: z.string().min(10, 'Goal must be at least 10 characters'),
});

const SegmentRuleSchema = z.object({
  field: z.enum(['last_order_days_ago', 'total_orders', 'total_spend', 'favorite_category', 'preferred_channel', 'discount_affinity']),
  operator: z.enum(['gt', 'lt', 'eq', 'gte', 'lte', 'in']),
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
});

const MessageVariantSchema = z.object({
  persona_tag: z.string(),
  channel: z.enum(['email', 'whatsapp', 'sms']),
  subject: z.string().optional(),
  body: z.string(),
});

const CampaignPlanSchema = z.object({
  segment_rules: z.array(SegmentRuleSchema),
  rationale: z.string(),
  message_variants: z.array(MessageVariantSchema),
  recommended_channels: z.string(),
  estimated_audience_description: z.string(),
});

// ── Gemini System Prompt ──────────────────────────────────
const SYSTEM_PROMPT = `You are a retail CRM campaign planner for a fashion brand called "Drape & Co."
You receive a marketer's campaign goal in natural language.

Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "segment_rules": [
    { "field": "<field>", "operator": "<operator>", "value": <value> }
  ],
  "rationale": "<1 sentence explaining why this segment makes sense>",
  "message_variants": [
    {
      "persona_tag": "<e.g. High Value / Dress Buyer>",
      "channel": "<email|whatsapp|sms>",
      "subject": "<only for email>",
      "body": "<message text using {{name}}, {{favorite_category}}, {{days_since_purchase}}>"
    }
  ],
  "recommended_channels": "<reasoning for channel selection per persona>",
  "estimated_audience_description": "<1 sentence about who this segment targets>"
}

Valid segment rule fields: last_order_days_ago, total_orders, total_spend, favorite_category, preferred_channel, discount_affinity
Valid operators: gt, lt, eq, gte, lte, in
For "in" operator, value should be an array of strings.
For "last_order_days_ago", value is an integer number of days.
For "total_spend", value is a number in INR.
For "discount_affinity", value is boolean (true/false).

Create 2-3 message variants targeting different personas within the segment.
Make the messages feel warm, personalized, and brand-appropriate for a fashion label.`;

export async function aiRoutes(fastify: FastifyInstance) {
  const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  fastify.post('/api/ai/plan-campaign', async (request, reply) => {
    try {
      // Validate request
      const body = PlanRequestSchema.parse(request.body);

      if (!process.env.GEMINI_API_KEY) {
        return reply.status(503).send({
          error: 'AI service unavailable',
          message: 'GEMINI_API_KEY is not configured',
        });
      }

      // Call Gemini
      const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
      
      let rawText = '';
      try {
        const response = await genai.models.generateContent({
          model,
          contents: [
            {
              role: 'user',
              parts: [{ text: `Campaign goal: ${body.goal}` }],
            },
          ],
          config: {
            systemInstruction: SYSTEM_PROMPT,
            temperature: 0.7,
          },
        });
        rawText = response.text ?? '';
      } catch (geminiErr: unknown) {
        console.error('Gemini API error:', geminiErr);
        return reply.status(502).send({
          error: 'AI generation failed',
          message: geminiErr instanceof Error ? geminiErr.message : 'Unknown Gemini error',
        });
      }

      // Parse and validate JSON response
      let planData: unknown;
      try {
        // Strip markdown code fences if present
        const cleaned = rawText
          .replace(/^```(?:json)?\n?/m, '')
          .replace(/\n?```$/m, '')
          .trim();
        planData = JSON.parse(cleaned);
      } catch {
        console.error('Failed to parse Gemini JSON:', rawText);
        return reply.status(502).send({
          error: 'Invalid AI response',
          message: 'AI returned non-JSON response',
          raw: rawText.substring(0, 500),
        });
      }

      // Validate with Zod
      const planResult = CampaignPlanSchema.safeParse(planData);
      if (!planResult.success) {
        console.error('Zod validation failed:', planResult.error.flatten());
        return reply.status(502).send({
          error: 'AI response validation failed',
          issues: planResult.error.flatten(),
        });
      }

      const plan = planResult.data;

      // Query matching customers
      const customers = await querySegment(plan.segment_rules as SegmentRule[]);
      const audience_count = customers.length;
      const audience_preview = customers.slice(0, 5).map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        favorite_category: c.favorite_category,
        preferred_channel: c.preferred_channel,
        last_order_at: c.last_order_at?.toISOString() ?? null,
        total_spend: Number(c.total_spend),
        total_orders: c.total_orders,
        brand_id: c.brand_id,
        discount_affinity: c.discount_affinity,
        preferred_shopping_day: c.preferred_shopping_day,
        created_at: c.created_at.toISOString(),
      }));

      return reply.send({
        plan,
        audience_count,
        audience_preview,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Validation error',
          issues: err.flatten(),
        });
      }
      console.error('Unexpected error in /api/ai/plan-campaign:', err);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
