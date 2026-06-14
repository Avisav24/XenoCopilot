import { FastifyInstance } from 'fastify';
import { segmentRoutes } from './ai/segment';
import { campaignRoutes } from './ai/campaign';
import { intelligenceRoutes } from './ai/intelligence';
import { copilotRoutes } from './ai/copilot';

/**
 * AI route registrar — registers all AI-related sub-modules.
 *
 * Module split rationale:
 *   segment.ts      — Natural language → Prisma query engine (CRM Copilot)
 *   campaign.ts     — Campaign lifecycle: plan, draft, launch, simulate, review
 *   intelligence.ts — Proactive AI insights: opportunities, personas, recommendations
 *   copilot.ts      — Guided campaign creation flow (Campaign Studio)
 *
 * Shared AI client lives in lib/ai-client.ts with multi-provider failover.
 */
export async function aiRoutes(fastify: FastifyInstance) {
  await segmentRoutes(fastify);
  await campaignRoutes(fastify);
  await intelligenceRoutes(fastify);
  await copilotRoutes(fastify);
}
