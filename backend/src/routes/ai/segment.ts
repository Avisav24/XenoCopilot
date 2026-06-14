import { FastifyInstance } from 'fastify';
import prisma from '../../lib/prisma';
import { generateWithFallback, cleanJsonResponse } from '../../lib/ai-client';

/**
 * Segment routes — Universal CRM Copilot.
 *
 * Handles natural-language audience discovery by translating marketer
 * goals into Prisma queries via a two-stage LLM pipeline:
 *   Stage 1 (Query Planner): goal → structured filters
 *   Stage 2 (Insight Engine): filters + data → business recommendation
 */
export async function segmentRoutes(fastify: FastifyInstance) {

  // ── POST /api/ai/segment ──────────────────────────────────────────
  fastify.post('/api/ai/segment', async (request, reply) => {
    try {
      const { goal } = request.body as { goal: string };
      
      // STEP 1: QUERY PLANNER — translate natural language to structured filters
      const queryPlannerPrompt = `You are the XenoCopilot Query Planner.
Your job is to understand the marketer's natural language goal and determine the required data.
The "customers" table supports ONLY these filters:
- city (string)
- gender (string)
- min_spent (numeric)
- max_spent (numeric)
- days_since_last_order (integer)
- health_score_less_than (integer)

Rules:
- Output ONLY a JSON object containing:
  "goal_category": One of ["Audience Discovery", "Revenue Analysis", "Campaign Recommendation", "General Insight"]
  "filters": { "city": "Delhi", "min_spent": 5000 }
  "unsupported_filters": A list of requested filters that DO NOT exist in the allowed list (e.g. "age", "birthday").
- If the query is about revenue dropping, trends, or generic business advice, use "Revenue Analysis" or "General Insight" and return empty filters.`;

      const plannerText = await generateWithFallback(
        queryPlannerPrompt,
        `Goal: "${goal}"`,
        0.1,
        true
      );

      const parsed = JSON.parse(cleanJsonResponse(plannerText));
      const hasUnsupportedFilters = parsed.unsupported_filters && parsed.unsupported_filters.length > 0;
      
      let aiResponseText = '';
      let count = 0;
      let totalRevenue = 0;
      let aov = 0;
      let convRate = 5;
      let risk = 'Low';
      let expectedPurchasers = 0;
      const channelName = 'WhatsApp';
      let databaseMetrics: any = {};

      // STEP 2: DATA RETRIEVAL — execute query against the database
      let activeFilters: any = null;
      if (parsed.goal_category === "Audience Discovery" || !parsed.goal_category) {
        let prismaWhere: any = {};
        if (parsed.filters) {
          if (parsed.filters.city) prismaWhere.city = { contains: parsed.filters.city, mode: 'insensitive' };
          if (parsed.filters.gender) prismaWhere.gender = { equals: parsed.filters.gender, mode: 'insensitive' };
          if (parsed.filters.min_spent || parsed.filters.max_spent) {
            prismaWhere.total_spent = {};
            if (parsed.filters.min_spent) prismaWhere.total_spent.gte = parsed.filters.min_spent;
            if (parsed.filters.max_spent) prismaWhere.total_spent.lte = parsed.filters.max_spent;
          }
          if (parsed.filters.days_since_last_order) {
            const date = new Date();
            date.setDate(date.getDate() - parsed.filters.days_since_last_order);
            prismaWhere.last_order_date = { lte: date };
          }
          if (parsed.filters.health_score_less_than) {
            prismaWhere.health_score = { lt: parsed.filters.health_score_less_than };
          }
        }
        activeFilters = prismaWhere;

        const customers = await prisma.customer.findMany({ where: prismaWhere });
        count = customers.length;
        totalRevenue = customers.reduce((sum, c) => sum + Number(c.total_spent), 0);
        aov = count > 0 ? Math.round(totalRevenue / count) : 0;
        
        if (count > 0) {
          const channelMetric = await prisma.channelMetric.findFirst({ where: { channel: channelName } });
          convRate = channelMetric ? Number(channelMetric.conversion_rate) : 5;
          expectedPurchasers = Math.max(1, Math.round(count * (convRate / 100)));
        }

        databaseMetrics = {
          audienceSize: count,
          potentialRevenue: totalRevenue,
          averageOrderValue: aov
        };
      } else if (parsed.goal_category === "Revenue Analysis") {
        const allCustomers = await prisma.customer.findMany();
        totalRevenue = allCustomers.reduce((sum, c) => sum + Number(c.total_spent), 0);
        databaseMetrics = {
          totalDatabaseRevenue: totalRevenue,
          insight: "Overall CRM health is stable. Revenue drops usually correlate with dormant VIPs."
        };
      } else if (parsed.goal_category === "Campaign Recommendation") {
        databaseMetrics = { topOpportunities: [] };
      } else {
        databaseMetrics = { status: "System Operational" };
      }

      // STEP 3: INSIGHT GENERATION — LLM synthesizes business recommendation
      const universalPrompt = `# XenoCopilot Universal CRM Copilot

You are XenoCopilot.
An enterprise CRM operating system for marketers.
You are not a chatbot.
You are not an intent classifier.
You are a business reasoning engine.

Your responsibility is to understand ANY marketer request and convert it into a useful business action.

---

PRIMARY GOAL
Help marketers answer:
Who should I target?
Why should I target them?
What should I send?
Which channel should I use?
When should I send it?
How much revenue can I generate?
What action should I take next?

---

NEVER FORCE INTENTS
Do not force user input into internal concepts like "Segmentation", "Retention". 
Understand the request naturally.

---

STEP 1: UNDERSTAND USER GOAL
Determine what the user is trying to achieve (Find audience, Analyze revenue, Recommend campaigns).

STEP 2: EXTRACT ENTITIES (Done by Query Planner)
STEP 3: BUILD QUERY (Done by Query Planner)

STEP 4: FETCH DATA (Provided in context)
Use customer records, campaign records, revenue records.
Never invent numbers. Never assume results.

STEP 5: GENERATE BUSINESS INSIGHT
The AI must analyze:
Audience size
Revenue impact
Customer quality
Purchase frequency
Churn risk
Channel performance
Campaign history

and derive conclusions.

The AI should answer:
What is happening?
Why is it happening?
What should the marketer do next?

Every answer must include:
Observation
Business Impact
Recommended Action

---

UNSUPPORTED DATA HANDLING

If requested data does not exist (e.g. unsupported filters):
1. Explain what is unavailable.
2. Suggest the closest available strategy.
3. Continue helping the marketer.

Example:
"Age is not currently available in the CRM.
To approximate this audience, consider targeting:
• High-value customers
• Repeat purchasers
• Premium product buyers"

Never terminate the conversation.
Never return empty states.

---

RESPONSE RULES

Never output:
Intent:
Segment:
Classification:
Entity:

Never expose internal system logic.
Speak like an enterprise CRM analyst.
Use concise executive language.
Maximum 2-3 sentences per insight.
No AI buzzwords.
No generic marketing advice.
Every recommendation must be tied to actual CRM data.

---

RESPONSE STRUCTURE

Return strictly structured JSON.

{
  "title": "",
  "summary": "",
  "observation": "",
  "businessImpact": "",
  "recommendedAction": "",
  "audienceSize": 0,
  "expectedRevenue": 0,
  "confidence": 0,
  "bestChannel": "",
  "nextSteps": [],
  "segmentReasoning": "Explain exactly why these filters were chosen based on the marketer's request."
}`;

      const contextPayload = {
        userQuery: goal,
        goalCategory: parsed.goal_category,
        extractedFilters: parsed.filters,
        unsupportedFilters: parsed.unsupported_filters || [],
        databaseMetrics
      };

      const rawJsonText = await generateWithFallback(
        universalPrompt,
        `Context:\n${JSON.stringify(contextPayload, null, 2)}\n\nGenerate the business insight. Return ONLY valid JSON matching the schema.`,
        0.5,
        true
      );
      
      let structuredInsight = null;
      try {
        structuredInsight = JSON.parse(cleanJsonResponse(rawJsonText));
        aiResponseText = structuredInsight.summary || structuredInsight.observation;
        
        // Removed the lines where the LLM's hallucinated audienceSize and expectedRevenue 
        // would overwrite the real database metrics. We must trust the real DB calculation.
      } catch (e) {
        console.error("Failed to parse JSON from AI response", e);
        aiResponseText = rawJsonText;
      }

      return reply.send({
        id: 'dyn_' + Date.now(),
        name: parsed.goal_category || 'Audience Discovery',
        description: goal,
        count: count,
        revenue: '₹' + (totalRevenue > 100000 ? (totalRevenue/100000).toFixed(2) + 'L' : totalRevenue.toLocaleString('en-IN')),
        revenueRaw: totalRevenue,
        expectedRevenue: Math.round(expectedPurchasers * aov) || totalRevenue,
        expectedPurchasers: expectedPurchasers,
        conversionRate: convRate,
        audienceMatch: count > 200 ? 'High' : (count > 50 ? 'Medium' : 'Low'),
        aov: '₹' + aov.toLocaleString('en-IN'),
        risk: risk,
        channel: structuredInsight?.bestChannel || channelName,
        goal: parsed.goal_category || 'Insight',
        ai_response_text: aiResponseText,
        structuredInsight: structuredInsight,
        prismaLogic: activeFilters ? JSON.stringify(activeFilters, null, 2) : null,
        segmentReasoning: structuredInsight?.segmentReasoning || "Segment built based on direct filter mapping from user query."
      });

    } catch (err) {
      console.error('segment error:', err);
      return reply.status(500).send({ error: 'Failed to segment audience' });
    }
  });
}
