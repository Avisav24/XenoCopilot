import { FastifyInstance } from 'fastify';
import { GoogleGenAI } from '@google/genai';
import { Groq } from 'groq-sdk';
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
  persona_id: z.string().optional(),
  individual_id: z.string().uuid().optional(),
  channel: z.string(),
  message: z.string(),
  audience_size: z.number().optional(),
});

// Helper function to try Gemini keys in sequence, then fallback to Groq keys
export async function generateWithFallback(genaiInstances: GoogleGenAI[], groqInstances: Groq[], systemInstruction: string, userPrompt: string, temperature: number, isJson: boolean = false) {
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  let lastGeminiError;

  for (let i = 0; i < genaiInstances.length; i++) {
    try {
      const config: any = { systemInstruction, temperature };
      if (isJson) {
        config.responseMimeType = "application/json";
      }
      const response = await genaiInstances[i].models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        config,
      });
      return response?.text ?? '';
    } catch (error: any) {
      console.warn(`[Gemini API] Key ${i + 1} Failed: ${error.message}. Trying next...`);
      lastGeminiError = error;
    }
  }

  // Fallback to Groq keys
  console.warn(`[Gemini API] All keys failed. Falling back to Groq...`);
  
  let lastGroqError;
  const groqModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  
  for (let i = 0; i < groqInstances.length; i++) {
    try {
      const params: any = {
        model: groqModel,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: userPrompt }
        ],
        temperature: temperature,
      };
      if (isJson) {
        params.response_format = { type: 'json_object' };
      }
      const response = await groqInstances[i].chat.completions.create(params);
      return response.choices[0]?.message?.content ?? '';
    } catch (groqError: any) {
      console.warn(`[Groq API] Key ${i + 1} Failed: ${groqError.message}. Trying next...`);
      lastGroqError = groqError;
    }
  }

  throw new Error(`Both Gemini and Groq failed. Groq Error: ${lastGroqError?.message}`);
}

export async function aiRoutes(fastify: FastifyInstance) {
  const geminiKeys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3
  ].filter(Boolean) as string[];

  const groqKeys = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3
  ].filter(Boolean) as string[];

  const genaiInstances = geminiKeys.map(key => new GoogleGenAI({ apiKey: key }));
  const groqInstances = groqKeys.map(key => new Groq({ apiKey: key }));

  // ── 1.5 Universal CRM Copilot ─────────────────────────────────────────
  fastify.post('/api/ai/segment', async (request, reply) => {
    try {
      const { goal } = request.body as { goal: string };
      
      // STEP 1: QUERY PLANNER
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
        genaiInstances, 
        groqInstances, 
        queryPlannerPrompt, 
        `Goal: "${goal}"`, 
        0.1,
        true
      );

      const parsed = JSON.parse(plannerText.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim());
      const hasUnsupportedFilters = parsed.unsupported_filters && parsed.unsupported_filters.length > 0;
      
      let aiResponseText = '';
      let count = 0;
      let totalRevenue = 0;
      let aov = 0;
      let convRate = 5;
      let risk = 'Low';
      let expectedPurchasers = 0;
      const channelName = 'WhatsApp'; // Default fallback
      let databaseMetrics: any = {};

        // STEP 2: DATA RETRIEVAL
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

        // STEP 3: MASTER SYSTEM PROMPT
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
          genaiInstances, 
          groqInstances, 
          universalPrompt, 
          `Context:\n${JSON.stringify(contextPayload, null, 2)}\n\nGenerate the business insight. Return ONLY valid JSON matching the schema.`, 
          0.5,
          true
        );
        
        let structuredInsight = null;
        try {
            structuredInsight = JSON.parse(rawJsonText.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim());
            aiResponseText = structuredInsight.summary || structuredInsight.observation;
            
            // Override metrics if AI calculated them based on fallback logic
            if (structuredInsight.audienceSize !== undefined && structuredInsight.audienceSize !== null) {
                count = structuredInsight.audienceSize;
            }
            if (structuredInsight.expectedRevenue !== undefined && structuredInsight.expectedRevenue !== null) {
                totalRevenue = structuredInsight.expectedRevenue;
            }
        } catch (e) {
            console.error("Failed to parse JSON from AI response", e);
            aiResponseText = rawJsonText;
        }

      // Return unified structure
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
        const text = await generateWithFallback(
          genaiInstances, 
          groqInstances, 
          systemPrompt, 
          `Personas:\n${personaListStr}\n\nMarketer Goal: "${goal}"`, 
          0.1,
          true
        );

        const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
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
      let conversionRate = Number(bestChannel.conversion_rate);
      if (conversionRate === 0) {
        conversionRate = 5; // Default to 5% if no historical data exists
      }
      let expectedPurchasers = Math.round(customerPersonas.length * (conversionRate / 100));
      if (customerPersonas.length > 0 && expectedPurchasers === 0) {
        expectedPurchasers = 1; // Ensure at least 1 expected purchaser if audience > 0
      }
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

      const systemPrompt = `You are a data-driven CRM copywriter. Draft 2 message variants for a campaign targeting the "${persona_name}" persona via ${channel}.
      
      ## Copy Constraints
      - Messages must be short (maximum 3-5 lines).
      - Never use generic marketing language (e.g., "Valued Customer", "Dear Customer", "We Miss You", "Special Offer Just For You").
      - Instead, write as if referencing actual database attributes (Customer Name, Last Purchase, Favorite Category).
      - (e.g., "Hi {{first_name}}, your last skincare purchase was 42 days ago", "You typically reorder every 35 days", "You are among our top VIPs").
      - Messages must feel directly generated from a live CRM database.

      Return ONLY a JSON object with this exact structure:
      {
        "variantA": "<message text>",
        "variantB": "<message text>"
      }`;

      let variants;
      try {
        const text = await generateWithFallback(
          genaiInstances, 
          groqInstances, 
          systemPrompt, 
          `Persona: ${persona_name}, Channel: ${channel}`, 
          0.7,
          true
        );

        const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
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
      const { name, persona_id, individual_id, channel, message, audience_size } = LaunchCampaignSchema.parse(request.body);

      // Check if persona_id is a valid UUID, if not fallback
      let finalPersonaId = persona_id;
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(finalPersonaId || '');
      if (!isUUID) {
        const anyPersona = await prisma.persona.findFirst();
        finalPersonaId = anyPersona?.id;
      }

      if (!finalPersonaId) {
        return reply.status(400).send({ error: 'Missing persona_id or valid fallback' });
      }

      const campaign = await prisma.campaign.create({
        data: {
          name,
          persona_id: finalPersonaId,
          channel,
          message,
          status: 'sending',
        },
      });

      let commData: any[] = [];
      if (individual_id) {
        commData.push({
          campaign_id: campaign.id,
          customer_id: individual_id,
          status: 'delivered',
        });
      } else {
        let targetCustomerIds: string[] = [];
        
        if (audience_size && !isUUID) {
          const randomCustomers = await prisma.$queryRawUnsafe<{id: string}[]>(
            `SELECT id FROM "customers" ORDER BY random() LIMIT ${audience_size}`
          );
          targetCustomerIds = randomCustomers.map(c => c.id);
        } else {
          const customerPersonas = await prisma.customerPersona.findMany({
            where: { persona_id: finalPersonaId },
          });
          targetCustomerIds = customerPersonas.map(cp => cp.customer_id);
        }

        if (targetCustomerIds.length === 0) {
          const fallbackSize = audience_size || 50; 
          const randomCustomers = await prisma.$queryRawUnsafe<{id: string}[]>(
            `SELECT id FROM "customers" ORDER BY random() LIMIT ${fallbackSize}`
          );
          targetCustomerIds = randomCustomers.map(c => c.id);
        }

        const chanMetric = await prisma.channelMetric.findFirst({ where: { channel } });
        const openRate = chanMetric?.open_rate ? Number(chanMetric.open_rate) / 100 : 0.45;
        const clickRate = chanMetric?.ctr ? Number(chanMetric.ctr) / 100 : 0.15;
        const convRate = chanMetric?.conversion_rate ? Number(chanMetric.conversion_rate) / 100 : 0.03;

        const now = new Date();
        const baseTime = now.getTime() - 2 * 60 * 60 * 1000;

        commData = targetCustomerIds.map((custId) => {
          const r = Math.random();
          let status = 'sent';
          if (r < 0.98) status = 'delivered';
          if (r < openRate) status = 'opened';
          if (r < clickRate) status = 'clicked';
          if (r < convRate) status = 'purchased';

          const sent_at = new Date(baseTime + Math.random() * 30 * 60 * 1000);
          let delivered_at = null, opened_at = null, clicked_at = null, purchased_at = null;

          if (['delivered', 'opened', 'clicked', 'purchased'].includes(status)) {
            delivered_at = new Date(sent_at.getTime() + Math.random() * 5 * 60 * 1000);
          }
          if (['opened', 'clicked', 'purchased'].includes(status)) {
            opened_at = new Date((delivered_at || sent_at).getTime() + Math.random() * 15 * 60 * 1000);
          }
          if (['clicked', 'purchased'].includes(status)) {
            clicked_at = new Date((opened_at || sent_at).getTime() + Math.random() * 10 * 60 * 1000);
          }
          if (status === 'purchased') {
            purchased_at = new Date((clicked_at || sent_at).getTime() + Math.random() * 30 * 60 * 1000);
          }

          return {
            campaign_id: campaign.id,
            customer_id: custId,
            status,
            sent_at,
            delivered_at,
            opened_at,
            clicked_at,
            purchased_at
          };
        });
      }

      await prisma.communication.createMany({ data: commData });

      const comms = await prisma.communication.findMany({
        where: { campaign_id: campaign.id },
      });

      // Collect recipients for channel simulator
      const recipients = comms.map((comm) => ({
        communicationId: comm.id,
        channel: channel,
        phoneOrEmail: 'customer@example.com', // mock email
      }));

      // Call channel simulator directly
      try {
        const simUrl = process.env.CHANNEL_SIM_URL || 'http://localhost:3002';
        const simResp = await fetch(`${simUrl}/simulate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaignId: campaign.id,
            recipients,
          }),
        });

        if (!simResp.ok) {
          console.error(`Failed to push to channel simulator: ${simResp.status}`);
        } else {
          console.log(`Pushed ${recipients.length} communications to simulator`);
        }
      } catch (simErr) {
        console.error('Channel simulator is down or unreachable', simErr);
      }

      return reply.send({
        success: true,
        campaign_id: campaign.id,
        queued_count: comms.length,
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

      const systemPrompt = `You are the backend engine for an enterprise Marketing Platform.
Your responsibility is to generate actual campaign variants ready to send.

You must return a JSON object with the following exact structure:
{
  "executiveSummary": {
    "recommendedVariant": "Variant Name",
    "expectedRevenue": 22800,
    "audienceSize": 98,
    "estimatedConversion": 3.1,
    "launchRisk": "Low",
    "recommendedChannel": "WhatsApp",
    "whyThisCampaign": [
      "Customers have not purchased in 60+ days",
      "Average reorder cycle is 35 days",
      "Previous WhatsApp campaigns generated highest ROI"
    ]
  },
  "variants": [
    {
      "id": "recovery",
      "type": "Recovery Campaign",
      "subject": "Subject line (max 1 line)...",
      "previewText": "Preview text (max 1 line)...",
      "messageBody": "Message body (3-5 lines max)...",
      "expectedConversion": 2.8,
      "expectedRevenue": 18400,
      "audienceSize": 98
    },
    {
      "id": "cross_sell",
      "type": "Cross-Sell Campaign",
      "subject": "Subject line...",
      "previewText": "Preview text...",
      "messageBody": "Message body...",
      "expectedConversion": 2.2,
      "expectedRevenue": 14200,
      "audienceSize": 98
    },
    {
      "id": "vip",
      "type": "VIP Campaign",
      "subject": "Subject line...",
      "previewText": "Preview text...",
      "messageBody": "Message body...",
      "expectedConversion": 3.1,
      "expectedRevenue": 22800,
      "audienceSize": 98
    }
  ]
}

## Copy Constraints
Messages must be short:
- Subject: Maximum 1 line.
- Preview: Maximum 1 line.
- Body: Maximum 3-5 lines.

## Personalization Rules
Never use generic marketing language (e.g., "Valued Customer", "Dear Customer", "We Miss You", "Special Offer Just For You").
Instead reference actual attributes (Customer Name, Last Purchase, Favorite Category, Purchase Frequency, LTV Tier).
(e.g., "Hi Sarah,", "Your last skincare purchase was 42 days ago", "You typically reorder every 35 days", "You are among our top skincare customers").
Messages should feel generated from CRM database records.`;

      const personaListStr = personas
        .map((p) => `ID: ${p.id} | Name: ${p.name} | Count: ${p.customer_count}`)
        .join('\n');

      const userPrompt = `Overall DB Health Avg: ${Math.round(stats._avg.health_score || 0)}
Target Personas context:
${personaListStr}

User Objective: "${goal}"

Generate the structured JSON campaign variants for this objective.`;

      let aiResult;
      try {
        const text = await generateWithFallback(
          genaiInstances, 
          groqInstances, 
          systemPrompt, 
          userPrompt, 
          0.2,
          true // Force JSON
        );

        aiResult = JSON.parse(text);
      } catch (aiErr) {
        console.error('AI strategize failed:', aiErr);
        // Fallback mock data if AI fails
        aiResult = {
          executiveSummary: {
            recommendedVariant: "Dormant Customer Recovery",
            expectedRevenue: 19500,
            audienceSize: 428,
            estimatedConversion: 2.5,
            launchRisk: "Low",
            recommendedChannel: "WhatsApp",
            whyThisCampaign: [
              "Customers have not purchased in 60+ days",
              "Average reorder cycle is 35 days",
              "Previous WhatsApp campaigns generated highest ROI",
              "Estimated recoverable revenue: ₹19,500"
            ]
          },
          variants: [
            {
              id: "recovery",
              type: "Recovery Campaign",
              subject: "Time to restock your skincare essentials",
              previewText: "Your last purchase was 60 days ago",
              messageBody: "Hi Sarah,\n\nYour Vitamin C Serum may be running low.\n\nWe've selected products based on your previous purchases.\n\nExplore your personalized recommendations today.",
              expectedConversion: 2.8,
              expectedRevenue: 18400,
              audienceSize: 428
            },
            {
              id: "cross_sell",
              type: "Cross-Sell Campaign",
              subject: "Recommended based on your skincare routine",
              previewText: "Perfect additions to your regimen",
              messageBody: "Hi Sarah,\n\nYou typically reorder every 35 days.\n\nBased on your past orders, Hydration Booster pairs perfectly with your routine.\n\nDiscover these customized suggestions.",
              expectedConversion: 2.2,
              expectedRevenue: 14200,
              audienceSize: 428
            },
            {
              id: "vip",
              type: "VIP Campaign",
              subject: "Early access for our top customers",
              previewText: "Exclusive preview of the new collection",
              messageBody: "Hi Sarah,\n\nYou are among our top skincare customers.\n\nWe're giving you priority access to our upcoming line.\n\nNo discount needed, just early access.",
              expectedConversion: 3.1,
              expectedRevenue: 22800,
              audienceSize: 428
            }
          ]
        };
      }

      return reply.send(aiResult);
    } catch (err) {
      console.error('strategize error:', err);
      return reply.status(500).send({ error: 'Failed to strategize' });
    }
  });

  // ── 6. Dynamic Chat Suggestions ───────────────────────────────
  fastify.get('/api/ai/suggestions', async (request, reply) => {
    try {
      // Get a quick snapshot of customer data
      const stats = await prisma.customer.aggregate({
        _avg: { health_score: true },
        _count: { id: true }
      });
      
      const atRiskCount = await prisma.customer.count({
        where: { health_score: { lt: 40 } }
      });

      const systemPrompt = `You are an AI Campaign Strategist. 
Your goal is to suggest 3 quick, actionable campaign goals to a marketer based on their customer database health.
Database Health: ${Math.round(stats._avg.health_score || 0)}/100
At Risk Customers: ${atRiskCount}

Return ONLY a JSON array of exactly 3 strings. Each string should be a short, punchy campaign goal (max 8 words).
Example format:
["Launch Win-Back for Dormant Users", "Upsell VIPs on New Arrivals", "Engage At-Risk Segment with Discounts"]`;

      let suggestions = [
        "Launch Win-Back Campaign for Dormant Customers",
        "Engage High-Value VIP Customers",
        "Prevent Churn for At-Risk Segment"
      ]; // fallback

      try {
        const text = await generateWithFallback(
          genaiInstances, 
          groqInstances, 
          systemPrompt, 
          "Generate 3 campaign goal suggestions.", 
          0.7,
          true
        );
        const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length === 3) {
          suggestions = parsed;
        } else if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
          suggestions = parsed.suggestions.slice(0, 3);
        }
      } catch (aiErr) {
        console.warn('AI suggestions failed, using fallback:', aiErr);
      }

      return reply.send(suggestions);
    } catch (err) {
      console.error('suggestions error:', err);
      return reply.status(500).send({ error: 'Failed to fetch suggestions' });
    }
  });

  // ── 7. Dynamic Personas (Priority 0) ─────────────────────────
  fastify.get('/api/ai/dynamic-personas', async (request, reply) => {
    try {
      const customers = await prisma.customer.findMany({
        include: { orders: true }
      });

      let vipCount = 0, vipRev = 0;
      let dormantCount = 0, dormantRev = 0;
      let regularCount = 0, regularRev = 0;

      const now = Date.now();

      for (const c of customers) {
        const spent = Number(c.total_spent);
        const daysSince = c.last_order_date ? (now - c.last_order_date.getTime()) / (1000 * 60 * 60 * 24) : 999;
        
        if (spent > 2000 && daysSince <= 60) {
          vipCount++; vipRev += spent;
        } else if (daysSince > 90 && spent > 500) {
          dormantCount++; dormantRev += spent;
        } else {
          regularCount++; regularRev += spent;
        }
      }

      const personas = [
        {
          id: 'dyn-vip',
          name: 'VIP Fashion Enthusiasts',
          customerCount: vipCount,
          revenueContribution: vipRev,
          avgLTV: vipCount > 0 ? Math.round(vipRev / vipCount) : 0,
          avgAOV: 1850,
          churnRisk: 'Low',
          bestChannels: ['Outbound Calls', 'WhatsApp', 'Email'],
          channelConfidence: 89,
          bestCampaignType: 'Early Access Drops',
          revenueOpportunity: Math.round(vipRev * 0.15),
          monthlyTrend: '-8%',
          recommendedAction: 'VIP Early Access Campaign',
          expectedImpact: Math.round(vipRev * 0.05),
          purchaseFrequency: 'Every 2-3 weeks',
          discountAffinity: 'Low',
          primaryTraits: ['Brand Loyalist', 'Early Adopter', 'High AOV'],
          aiSummary: 'VIP customers represent a large portion of revenue, but purchasing velocity has declined by 8% over the last 30 days. Action is required to maintain LTV.'
        },
        {
          id: 'dyn-dormant',
          name: 'Lapsed High-Spenders',
          customerCount: dormantCount,
          revenueContribution: dormantRev,
          avgLTV: dormantCount > 0 ? Math.round(dormantRev / dormantCount) : 0,
          avgAOV: 1200,
          churnRisk: 'Very High',
          bestChannels: ['Email', 'Outbound Calls', 'SMS'],
          channelConfidence: 76,
          bestCampaignType: 'Win-Back Offers',
          revenueOpportunity: Math.round(dormantRev * 0.25),
          monthlyTrend: '-12%',
          recommendedAction: 'Aggressive Win-Back Sequence',
          expectedImpact: Math.round(dormantRev * 0.10),
          purchaseFrequency: 'Every 6-8 months',
          discountAffinity: 'High',
          primaryTraits: ['Price Sensitive', 'Seasonal Buyer', 'High Churn Risk'],
          aiSummary: 'These customers previously contributed significantly but have not purchased in 90+ days. The historical recovery rate drops off sharply after 120 days, making immediate intervention critical.'
        },
        {
          id: 'dyn-regular',
          name: 'Discount Driven Buyers',
          customerCount: regularCount,
          revenueContribution: regularRev,
          avgLTV: regularCount > 0 ? Math.round(regularRev / regularCount) : 0,
          avgAOV: 850,
          churnRisk: 'Medium',
          bestChannels: ['SMS', 'Email', 'WhatsApp'],
          channelConfidence: 92,
          bestCampaignType: 'Flash Sales',
          revenueOpportunity: Math.round(regularRev * 0.10),
          monthlyTrend: '+2%',
          recommendedAction: 'Volume Flash Sale',
          expectedImpact: Math.round(regularRev * 0.04),
          purchaseFrequency: 'Every 1-2 months',
          discountAffinity: 'Very High',
          primaryTraits: ['Deal Seeker', 'Impulse Buyer', 'Volume Shopper'],
          aiSummary: 'This segment exhibits price sensitivity but reliable volume during promotional periods. Engaging them with structured sales drives predictable revenue spikes.'
        },
        {
          id: 'dyn-new',
          name: 'Recent First-Time Buyers',
          customerCount: Math.max(15, Math.floor(regularCount * 0.2)),
          revenueContribution: Math.max(15000, Math.floor(regularRev * 0.15)),
          avgLTV: 1100,
          avgAOV: 1100,
          churnRisk: 'Medium',
          bestChannels: ['Email', 'WhatsApp', 'Outbound Calls'],
          channelConfidence: 81,
          bestCampaignType: 'Welcome Series',
          revenueOpportunity: 18000,
          monthlyTrend: '+14%',
          recommendedAction: 'Post-Purchase Nurture Sequence',
          expectedImpact: 4500,
          purchaseFrequency: 'First Time',
          discountAffinity: 'Medium',
          primaryTraits: ['Brand Curious', 'High Potential', 'Needs Nurturing'],
          aiSummary: 'This segment recently made their first purchase. Historically, the second purchase is the hardest to secure, making a strong onboarding experience critical.'
        },
        {
          id: 'dyn-window',
          name: 'High-Intent Window Shoppers',
          customerCount: Math.max(45, Math.floor(regularCount * 0.4)),
          revenueContribution: 0,
          avgLTV: 0,
          avgAOV: 0,
          churnRisk: 'Low',
          bestChannels: ['SMS', 'WhatsApp', 'Email'],
          channelConfidence: 68,
          bestCampaignType: 'First-Purchase Discount',
          revenueOpportunity: 12000,
          monthlyTrend: '+5%',
          recommendedAction: 'Trigger First-Time Buyer Discount',
          expectedImpact: 2400,
          purchaseFrequency: 'Never',
          discountAffinity: 'High',
          primaryTraits: ['High Engagement', 'Hesitant', 'Price Sensitive'],
          aiSummary: 'Users who frequently interact with campaigns or the platform but have not completed a purchase. They exhibit high intent but require a compelling catalyst to convert.'
        }
      ];

      return reply.send(personas);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: 'Failed to generate dynamic personas' });
    }
  });

  // ── 8. Revenue Opportunities (Priority 1 & 2) ──────────────────
  fastify.get('/api/ai/opportunities', async (request, reply) => {
    try {
      const getStats = async (where: any) => {
        const agg = await prisma.customer.aggregate({
          where,
          _count: true,
          _avg: { total_spent: true }
        });
        return { count: agg._count, avgSpend: Number(agg._avg.total_spent || 2000) };
      };

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000);

      const [dormantVips, recentBuyers, highRisk, premium, inactive, frequent] = await Promise.all([
        getStats({ health_score: { lt: 40 }, total_spent: { gt: 5000 } }),
        getStats({ last_order_date: { gt: thirtyDaysAgo } }),
        getStats({ health_score: { lt: 20 } }),
        getStats({ health_score: { gt: 80 }, total_spent: { gt: 8000 } }),
        getStats({ last_order_date: { lt: sixtyDaysAgo } }),
        getStats({ health_score: { gt: 60, lt: 90 } })
      ]);

      const createOpp = (id: string, title: string, stats: any, conf: number, channel: string, multiplier: number, reason1: string, reason2: string) => {
        const rev = Math.round(stats.count * stats.avgSpend * multiplier);
        return {
          id,
          title,
          expectedRevenue: rev,
          audience: stats.count,
          confidence: conf,
          channel: channel,
          score: rev * conf * stats.count, // Expected Revenue × Confidence × Audience Impact
          reasoning: [reason1, reason2, `Historical conversion rate ~${Math.round(multiplier * 100)}%`]
        };
      };

      let opportunities = [
        createOpp('opp-1', 'Recover Dormant VIP Customers', dormantVips, 84, 'WhatsApp', 0.15, 'High historical LTV', 'Last purchase > 60 days'),
        createOpp('opp-2', 'Cross-Sell Recent Buyers', recentBuyers, 72, 'Email', 0.08, 'High recent engagement', 'Ready for complementary products'),
        createOpp('opp-3', 'Retain High Churn Risk Customers', highRisk, 89, 'SMS', 0.12, 'Health score critically low', 'Immediate intervention required'),
        createOpp('opp-4', 'Upsell Premium Customers', premium, 91, 'WhatsApp', 0.20, 'Top 10% spenders', 'Highly responsive to exclusive offers'),
        createOpp('opp-5', 'Reactivate Inactive Users', inactive, 65, 'Email', 0.05, 'No activity in 2+ months', 'Low cost of re-acquisition'),
        createOpp('opp-6', 'Increase Repeat Purchase Rate', frequent, 78, 'WhatsApp', 0.10, 'Consistent buying patterns', 'Due for next purchase cycle')
      ];

      // Filter out zero audience
      opportunities = opportunities.filter(o => o.audience > 0);
      
      // If we don't have 6, add some fallbacks so UI always has 6-10
      if (opportunities.length < 6) {
         const fallbackAudience = await getStats({}); // all users
         const fallbacks = [
           createOpp('fb-1', 'Drive Festival Sales', fallbackAudience, 75, 'WhatsApp', 0.1, 'Seasonal timing', 'Broad appeal'),
           createOpp('fb-2', 'Recover Cart Abandoners', {count: Math.round(fallbackAudience.count * 0.2), avgSpend: fallbackAudience.avgSpend}, 88, 'SMS', 0.25, 'High intent detected', 'Items left in cart'),
           createOpp('fb-3', 'Promote New Collection', fallbackAudience, 60, 'Email', 0.04, 'Product launch', 'Engage entire base'),
           createOpp('fb-4', 'Win-Back Campaign', {count: Math.round(fallbackAudience.count * 0.3), avgSpend: fallbackAudience.avgSpend}, 70, 'Email', 0.06, 'Re-engage lost customers', 'Special discount offer'),
           createOpp('fb-5', 'Loyalty Program Invite', {count: Math.round(fallbackAudience.count * 0.15), avgSpend: fallbackAudience.avgSpend}, 82, 'WhatsApp', 0.18, 'Reward top shoppers', 'Increase LTV'),
           createOpp('fb-6', 'Referral Push', fallbackAudience, 55, 'Email', 0.02, 'Leverage existing base', 'Low CAC')
         ];
         opportunities.push(...fallbacks);
      }

      // Sort by priority score (descending)
      opportunities.sort((a, b) => b.score - a.score);
      
      // Deduplicate by title just in case
      const uniqueOpps = [];
      const seen = new Set();
      for (const opp of opportunities) {
        if (!seen.has(opp.title)) {
          seen.add(opp.title);
          uniqueOpps.push(opp);
        }
      }

      return reply.send(uniqueOpps.slice(0, 10)); // return top up to 10

    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: 'Failed to fetch opportunities' });
    }
  });

  // ── 9. Next Best Action (Priority 3) ───────────────────────────
  fastify.post('/api/ai/next-best-action', async (request, reply) => {
    try {
      const { customer_id } = request.body as { customer_id: string };
      const customer = await prisma.customer.findUnique({ 
        where: { id: customer_id },
        include: { orders: { orderBy: { order_date: 'desc' }, take: 5 }, customer_personas: { include: { persona: true } } }
      });
      
      if (!customer) {
        return reply.status(404).send({ error: 'Customer not found' });
      }

      const daysSince = customer.last_order_date
        ? Math.floor((Date.now() - new Date(customer.last_order_date).getTime()) / (1000 * 60 * 60 * 24))
        : 999;
        
      const systemPrompt = `You are a Principal CRM Intelligence Agent. Analyze the customer's transaction history, LTV, Recency, and Profile to generate a strict Next Best Action recommendation.
      
      ## Constraints
      - Summary MUST be < 120 words. It must be data-driven.
      - Never use generic marketing buzzwords.
      
      Return ONLY a JSON object with this exact structure:
      {
        "aiSummary": "Summary text here...",
        "churnRiskAnalysis": "Analysis text here...",
        "revenuePotential": "₹45,000",
        "behavioralInsights": ["Insight 1", "Insight 2", "Insight 3"],
        "nextBestAction": {
          "recommendedAction": "Action text here",
          "reason": "Reason text here",
          "expectedRevenue": 2400,
          "confidence": "85%",
          "priority": "Critical" // One of: Critical, High, Medium, Low
        }
      }`;

      const userPrompt = `Customer Data:
      Name: ${customer.name}
      Total Spent: ₹${customer.total_spent}
      Health Score: ${customer.health_score}/100
      Days Since Last Order: ${daysSince === 999 ? 'Never' : daysSince}
      Personas: ${customer.customer_personas.map(cp => cp.persona.name).join(', ')}
      Recent Orders (max 5):
      ${customer.orders.map(o => `- Date: ${o.order_date.toISOString().split('T')[0]}, Amount: ₹${o.amount}, Category: ${o.category || 'N/A'}`).join('\n')}
      
      Generate the AI Intelligence payload.`;

      let aiResult;
      try {
        const text = await generateWithFallback(
          genaiInstances, 
          groqInstances, 
          systemPrompt, 
          userPrompt, 
          0.3,
          true
        );
        const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
        aiResult = JSON.parse(cleaned);
      } catch (aiErr) {
        console.error('AI next-best-action failed:', aiErr);
        // Fallback
        aiResult = {
          aiSummary: "The customer shows signs of decreased engagement recently. Based on historical LTV and recent order velocity, immediate intervention is recommended.",
          churnRiskAnalysis: "High risk due to 60+ days of inactivity compared to their historical 30-day purchasing cycle.",
          revenuePotential: "₹" + Math.round(Number(customer.total_spent) * 0.15).toLocaleString('en-IN'),
          behavioralInsights: [
            "Responds well to weekend sales",
            "Primarily purchases skincare category",
            "Declining click-through rate over last 3 weeks"
          ],
          nextBestAction: {
            recommendedAction: "Launch Win-Back Offer",
            reason: "Immediate action required due to health score.",
            expectedRevenue: Math.round(Number(customer.total_spent) * 0.15),
            confidence: "84%",
            priority: customer.health_score < 40 ? "Critical" : "High"
          }
        };
      }

      return reply.send(aiResult);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: 'Failed' });
    }
  });

  // ── 10. Simulate Campaign (Priority 4 & 6) ─────────────────────
  fastify.post('/api/ai/simulate-campaign', async (request, reply) => {
    try {
      const { audience_size } = request.body as { audience_size: number };
      const baseAudience = audience_size || 500;

      const channels = [
        {
          channel: 'WhatsApp',
          expectedDelivery: 98,
          expectedOpens: Math.round(baseAudience * 0.65),
          expectedClicks: Math.round(baseAudience * 0.15),
          expectedPurchases: Math.round(baseAudience * 0.024),
          expectedRevenue: Math.round(baseAudience * 0.024 * 1500),
          conversion: 2.4,
          audienceMatch: 'High',
          confidence: 'High',
          reasoning: 'Highest predicted revenue and strongest engagement among similar audiences. WhatsApp yields 2.4x conversion rate versus Email for this cohort.'
        },
        {
          channel: 'Email',
          expectedDelivery: 99,
          expectedOpens: Math.round(baseAudience * 0.25),
          expectedClicks: Math.round(baseAudience * 0.05),
          expectedPurchases: Math.round(baseAudience * 0.011),
          expectedRevenue: Math.round(baseAudience * 0.011 * 1200),
          conversion: 1.1,
          audienceMatch: 'Medium',
          confidence: 'Medium',
          reasoning: 'Lower conversion than WhatsApp. Recommended only as a secondary or fallback channel due to historically weak open rates for this segment.'
        },
        {
          channel: 'SMS',
          expectedDelivery: 95,
          expectedOpens: Math.round(baseAudience * 0.80),
          expectedClicks: Math.round(baseAudience * 0.08),
          expectedPurchases: Math.round(baseAudience * 0.008),
          expectedRevenue: Math.round(baseAudience * 0.008 * 800),
          conversion: 0.8,
          audienceMatch: 'Low',
          confidence: 'High',
          reasoning: 'High delivery but very low click-through. Not recommended for revenue generation campaigns unless paired with significant discounts.'
        },
        {
          channel: 'Outbound Calls',
          expectedDelivery: 90,
          expectedCalls: Math.round(baseAudience * 0.3),
          connectedCalls: Math.round(baseAudience * 0.144),
          interestedCustomers: Math.round(baseAudience * 0.05),
          expectedPurchases: Math.round(baseAudience * 0.018),
          expectedRevenue: Math.round(baseAudience * 0.018 * 1650),
          conversion: 1.8,
          audienceMatch: 'High',
          confidence: 'High',
          reasoning: 'Outbound calling provides the highest qualitative conversion rate for high-value segments, although limited by capacity.'
        }
      ];

      channels.sort((a, b) => b.expectedRevenue - a.expectedRevenue);
      return reply.send(channels);
    } catch (err) {
      return reply.status(500).send({ error: 'Failed' });
    }
  });

  // ── 11. Campaign Autopsy (Priority 4) ─────────────────────────
  fastify.get('/api/ai/campaign-autopsy/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      
      const campaign = await prisma.campaign.findUnique({
        where: { id },
        include: { persona: true }
      });

      if (!campaign) {
        return reply.status(404).send({ error: 'Campaign not found' });
      }

      const comms = await prisma.communication.findMany({
        where: { campaign_id: id }
      });

      const total = comms.length;
      if (total === 0) {
        return reply.status(400).send({ error: 'No communications found for this campaign' });
      }

      const delivered = comms.filter(c => c.delivered_at).length;
      const opened = comms.filter(c => c.opened_at).length;
      const clicked = comms.filter(c => c.clicked_at).length;
      const purchased = comms.filter(c => c.purchased_at).length;

      const systemPrompt = `You are a Principal Revenue Operations Analyst. Generate a post-campaign "Autopsy" report analyzing why a campaign succeeded or failed.
      
      Return ONLY a JSON object with this exact structure:
      {
        "executiveSummary": "Max 3 sentences summarizing performance...",
        "whatWorked": ["Point 1", "Point 2"],
        "whatFailed": ["Point 1", "Point 2"],
        "rootCauseAnalysis": "Why did we get these specific results...",
        "revenueAttribution": "Explanation of revenue driven...",
        "recommendedImprovements": ["Improvement 1", "Improvement 2"],
        "recommendedNextCampaign": "Specific recommendation for next action"
      }`;

      const userPrompt = `Campaign Name: ${campaign.name}
      Channel: ${campaign.channel}
      Message: ${campaign.message}
      Target Persona: ${campaign.persona?.name || 'Unknown'}
      
      Metrics:
      Sent: ${total}
      Delivered: ${delivered} (${Math.round((delivered/total)*100)}%)
      Opened: ${opened} (${Math.round((opened/total)*100)}%)
      Clicked: ${clicked} (${Math.round((clicked/total)*100)}%)
      Purchased: ${purchased} (${Math.round((purchased/total)*100)}%)
      
      Generate the autopsy report JSON.`;

      let aiResult;
      try {
        const text = await generateWithFallback(
          genaiInstances, 
          groqInstances, 
          systemPrompt, 
          userPrompt, 
          0.3,
          true
        );
        const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
        aiResult = JSON.parse(cleaned);
      } catch (aiErr) {
        console.error('AI campaign-autopsy failed:', aiErr);
        aiResult = {
          executiveSummary: "The campaign achieved moderate engagement but fell short on conversion. The message resonated well with the audience, but friction in the purchase funnel likely caused drop-offs.",
          whatWorked: [
            "Strong delivery rate indicating healthy channel data",
            "Initial open rates aligned with industry benchmarks"
          ],
          whatFailed: [
            "Click-to-purchase ratio was lower than expected",
            "Revenue attribution missed the primary target"
          ],
          rootCauseAnalysis: "The discrepancy between click rates and purchase rates suggests that while the offer generated interest, the landing page experience or product availability hindered final conversions.",
          revenueAttribution: "Generated partial revenue from highly engaged VIPs, but failed to activate the broader segment.",
          recommendedImprovements: [
            "A/B test a stronger call-to-action in the message",
            "Ensure landing page continuity with the campaign offer"
          ],
          recommendedNextCampaign: "Launch a re-engagement sequence specifically targeting users who clicked but did not purchase, featuring a time-sensitive incentive."
        };
      }

      return reply.send(aiResult);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: 'Failed' });
    }
  });

  fastify.post('/api/ai/revenue-strategy', async (request, reply) => {
    try {
      const { goal } = request.body as { goal: string };

      // 1. Audience Discovery
      const customers = await prisma.customer.findMany();
      let dormantVipCount = 0;
      let crossSellCount = 0;
      let loyalCount = 0;

      const now = Date.now();
      for (const c of customers) {
        const spent = Number(c.total_spent);
        const daysSince = c.last_order_date ? (now - c.last_order_date.getTime()) / (1000 * 60 * 60 * 24) : 999;
        
        if (spent > 2000 && daysSince > 60) dormantVipCount++;
        else if (daysSince <= 30) crossSellCount++;
        else if (spent > 1000) loyalCount++;
      }
      
      if (dormantVipCount === 0) dormantVipCount = 412; // Fallback for UI if db is empty
      if (crossSellCount === 0) crossSellCount = 200;
      if (loyalCount === 0) loyalCount = 150;

      // 2. Opportunity Ranking & 3. Channel Selection
      const channels = await prisma.channelMetric.findMany({ orderBy: { conversion_rate: 'desc' } });
      const bestChannel = channels[0]?.channel || 'WhatsApp';
      const bestConv = Number(channels[0]?.conversion_rate || 5);
      const secondChannel = channels[1]?.channel || 'Email';
      const secondConv = Number(channels[1]?.conversion_rate || 2);

      const aovDormant = 1500;
      const aovCross = 800;
      const aovLoyal = 1200;

      // Deterministic math
      const revDormant = Math.round(dormantVipCount * aovDormant * (bestConv / 100));
      const revCross = Math.round(crossSellCount * aovCross * (secondConv / 100));
      const revLoyal = Math.round(loyalCount * aovLoyal * (bestConv / 100));

      const totalProjected = revDormant + revCross + revLoyal;

      // 4. Offer Recommendation & LLM Reasoning
      const systemPrompt = `You are a Revenue Strategy AI. Generate the reasoning and executive summary for these specific campaigns based on the user's goal. Do not calculate numbers. Use the provided data.
Return JSON:
{
  "executiveSummary": "...",
  "campaign1_reasoning": ["Source 1: ...", "Source 2: ..."],
  "campaign2_reasoning": ["Source 1: ...", "Source 2: ..."],
  "campaign3_reasoning": ["Source 1: ...", "Source 2: ..."]
}`;
      const userPrompt = `Goal: ${goal}
C1: Dormant VIP Recovery (Audience: ${dormantVipCount}, Rev: ₹${revDormant}, Channel: ${bestChannel} - ${bestConv}% conv)
C2: Cross Sell Recent Buyers (Audience: ${crossSellCount}, Rev: ₹${revCross}, Channel: ${secondChannel} - ${secondConv}% conv)
C3: Loyal Customer Upsell (Audience: ${loyalCount}, Rev: ₹${revLoyal}, Channel: ${bestChannel} - ${bestConv}% conv)
`;
      let aiResult: any = {};
      try {
        const aiText = await generateWithFallback(genaiInstances, groqInstances, systemPrompt, userPrompt, 0.2, true);
        aiResult = JSON.parse(aiText.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim());
      } catch(e) {
        console.warn("AI generation for reasoning failed, using fallback.");
      }

      const campaigns = [
        {
          name: 'Dormant VIP Recovery',
          audience: 'Dormant VIPs',
          audienceSize: dormantVipCount,
          channel: bestChannel,
          offer: '15% VIP Coupon',
          expectedRevenue: revDormant,
          confidence: 84,
          reasoning: aiResult.campaign1_reasoning || [
             `Source 1: ${dormantVipCount} dormant VIPs detected.`,
             `Source 2: ₹${revDormant.toLocaleString('en-IN')} revenue opportunity.`,
             `Source 3: ${bestChannel} conversion ${bestConv}%.`
          ]
        },
        {
          name: 'Cross Sell Recent Buyers',
          audience: 'Recent Buyers',
          audienceSize: crossSellCount,
          channel: secondChannel,
          offer: 'Complementary Product',
          expectedRevenue: revCross,
          confidence: 78,
          reasoning: aiResult.campaign2_reasoning || [
            `Source 1: ${crossSellCount} recent buyers detected.`,
            `Source 2: ₹${revCross.toLocaleString('en-IN')} revenue opportunity.`,
            `Source 3: ${secondChannel} conversion ${secondConv}%.`
          ]
        },
        {
          name: 'Loyal Customer Upsell',
          audience: 'Loyal Buyers',
          audienceSize: loyalCount,
          channel: bestChannel,
          offer: 'Premium Upgrade',
          expectedRevenue: revLoyal,
          confidence: 88,
          reasoning: aiResult.campaign3_reasoning || [
            `Source 1: ${loyalCount} loyal customers detected.`,
            `Source 2: ₹${revLoyal.toLocaleString('en-IN')} revenue opportunity.`,
            `Source 3: ${bestChannel} conversion ${bestConv}%.`
          ]
        }
      ].sort((a, b) => b.expectedRevenue - a.expectedRevenue); // Opportunity ranking

      return reply.send({
        campaigns,
        projectedRevenue: totalProjected,
        confidence: 83,
        executiveSummary: aiResult.executiveSummary || "Strategy generated successfully."
      });
    } catch (err: any) {
       console.error(err);
       return reply.status(500).send({ error: "Failed to generate strategy" });
    }
  });

  fastify.post('/api/ai/campaign-review', async (request, reply) => {
    try {
       const { campaignId, expectedRevenue, expectedConversion } = request.body as any;
       // Mock actuals deterministically slightly off from expected
       const actualRevenue = expectedRevenue * (0.9 + Math.random() * 0.2);
       const actualConversion = expectedConversion * (0.85 + Math.random() * 0.3);
       const accuracy = 100 - Math.abs((actualRevenue - expectedRevenue) / expectedRevenue * 100);

       const systemPrompt = `You are an AI Campaign Reviewer. Based on the metrics, generate narratives for "whatWorked", "whatFailed", and a reusable "learning".
Return JSON:
{
  "whatWorked": "...",
  "whatFailed": "...",
  "learning": "..."
}`;
       const userPrompt = `Expected Rev: ${expectedRevenue}, Actual Rev: ${actualRevenue}. Expected Conv: ${expectedConversion}, Actual Conv: ${actualConversion}.`;

       let aiResult: any = {};
       try {
         const aiText = await generateWithFallback(genaiInstances, groqInstances, systemPrompt, userPrompt, 0.2, true);
         aiResult = JSON.parse(aiText.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim());
       } catch (e) {
         console.warn("AI review fallback");
       }

       // Ensure campaign_id is a valid UUID or fallback
       let validId = campaignId;
       if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(validId)) {
         const dummy = await prisma.campaign.findFirst();
         validId = dummy?.id || "00000000-0000-0000-0000-000000000000";
       }

       // Save to CampaignReview
       let review;
       try {
         review = await prisma.campaignReview.create({
           data: {
             campaign_id: validId,
             predicted_revenue: expectedRevenue,
             actual_revenue: actualRevenue,
             predicted_conversion: expectedConversion,
             actual_conversion: actualConversion,
             prediction_accuracy: accuracy,
             what_worked: aiResult.whatWorked || "Channel delivery and open rates met expectations.",
             what_failed: aiResult.whatFailed || "Conversion dropped at the checkout stage.",
             learning: aiResult.learning || "Focus more on follow-up reminders to recover abandoned carts."
           }
         });
       } catch (dbErr) {
         console.warn("Could not save to DB, mocking response", dbErr);
         review = {
             id: "mock-id",
             campaign_id: validId,
             predicted_revenue: expectedRevenue,
             actual_revenue: actualRevenue,
             predicted_conversion: expectedConversion,
             actual_conversion: actualConversion,
             prediction_accuracy: accuracy,
             what_worked: aiResult.whatWorked || "Channel delivery and open rates met expectations.",
             what_failed: aiResult.whatFailed || "Conversion dropped at the checkout stage.",
             learning: aiResult.learning || "Focus more on follow-up reminders to recover abandoned carts."
         };
       }

       return reply.send(review);
    } catch (e) {
       console.error(e);
       return reply.status(500).send({ error: "Failed to review" });
    }
  });
  fastify.post('/api/copilot/analyze-goal', async (request, reply) => {
    try {
       const { goal } = request.body as any;
       
       const totalCustomers = await prisma.customer.count();
       
       // Simulate fetching RevenueMemory and DB Context
       // In a real scenario we'd do: await prisma.revenueMemory.findMany({ limit: 5 })
       
       const systemPrompt = `You are the XenoCopilot AI Decision Engine. The user has provided a business goal.
Analyze the goal and recommend: 
1) Audience (Name and Count)
2) Channel (Choose ONLY ONE from: "WhatsApp", "Email", "SMS", "Email & SMS")
3) Offer
4) Expected Revenue (in ₹)
5) Expected Conversion (%)
6) Expected Purchasers (number)
7) Evidence for Audience (3 bullet points referencing data/history)
8) Evidence for Channel (3 bullet points)
9) Evidence for Offer (3 bullet points)

CRITICAL: The database currently has a total of ${totalCustomers} customers. Your recommended audience count MUST NOT exceed ${totalCustomers}. Be realistic based on this maximum cap.

Return ONLY valid JSON matching this structure:
{
  "audience": { "name": "...", "count": 0 },
  "channel": "...",
  "offer": "...",
  "expectedRevenue": "...",
  "expectedConversion": "...",
  "expectedPurchasers": 0,
  "evidence": {
    "audience": ["...", "..."],
    "channel": ["...", "..."],
    "offer": ["...", "..."]
  }
}`;
       
       let aiResult: any = null;
       try {
         const aiText = await generateWithFallback(genaiInstances, groqInstances, systemPrompt, `Goal: ${goal}`, 0.2, true);
         aiResult = JSON.parse(aiText.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim());
       } catch (e) {
         console.warn("AI generation failed for analyze-goal, using deterministic fallback", e);
       }

       if (!aiResult) {
         // Deterministic Fallback if LLM fails
         aiResult = {
           audience: { name: "Target Audience", count: Math.min(428, totalCustomers) },
           channel: "WhatsApp",
           offer: "15% Recovery Offer",
           expectedRevenue: "₹1.72L",
           expectedConversion: "8.2%",
           expectedPurchasers: Math.min(35, totalCustomers),
           evidence: {
             audience: [
               "428 VIP customers inactive for 60+ days",
               "Historical reorder cycle exceeded",
               "Revenue at risk ₹4.2L"
             ],
             channel: [
               "12 historical campaigns analyzed",
               "WhatsApp generated 2.1x higher revenue than email",
               "Historical conversion rate of 8.2%"
             ],
             offer: [
               "Similar campaign generated ₹1.4L",
               "15% discount produced highest profit margin",
               "Higher discounts reduced margin without increasing volume"
             ]
           }
         };
       }

       return reply.send(aiResult);
    } catch (e) {
       console.error(e);
       return reply.status(500).send({ error: "Failed to analyze goal" });
    }
  });

  fastify.post('/api/copilot/simulate', async (request, reply) => {
    try {
      const { channel, offer } = request.body as any;
      
      // Simulate different outcomes based on channel
      let revenue = "₹1.72L";
      let roi = "3.2x";
      let conversion = "8.2%";
      
      if (channel === "Email") {
        revenue = "₹1.05L"; roi = "2.0x"; conversion = "4.1%";
      } else if (channel === "SMS") {
        revenue = "₹82K"; roi = "1.4x"; conversion = "3.2%";
      } else if (channel === "Email & SMS") {
        revenue = "₹2.2L"; roi = "4.1x"; conversion = "10.5%";
      }

      const defaultScenarios = [
        { channel: "WhatsApp", revenue: "₹1.72L", roi: "3.2x", conversion: "8.2%" },
        { channel: "Email", revenue: "₹1.05L", roi: "2.0x", conversion: "4.1%" },
        { channel: "SMS", revenue: "₹82K", roi: "1.4x", conversion: "3.2%" },
        { channel: "Email & SMS", revenue: "₹2.2L", roi: "4.1x", conversion: "10.5%" }
      ];

      // If the AI recommended a channel not in our standard list, ensure it's included
      if (!defaultScenarios.find(s => s.channel === channel)) {
        defaultScenarios.unshift({
          channel: channel,
          revenue: "₹" + (Math.random() * 2 + 1).toFixed(1) + "L",
          roi: (Math.random() * 2 + 1.5).toFixed(1) + "x",
          conversion: (Math.random() * 5 + 4).toFixed(1) + "%"
        });
      }

      return reply.send({
        scenarios: defaultScenarios,
        selected: { revenue, roi, conversion }
      });
    } catch (e) {
      console.error(e);
      return reply.status(500).send({ error: "Simulation failed" });
    }
  });

  fastify.post('/api/copilot/learn', async (request, reply) => {
    try {
      const { goal, audience, channel, offer, predictedRevenueStr, conversionRateStr } = request.body as any;
      
      // Mock the reality for the demo
      const actualRevenueStr = "₹1.61L";
      const errorRate = "6.3%";
      const learning = `${channel} converted 2.1x better; 8 PM generated highest conversion; ${offer} maximized profit`;

      // Clean up string to decimal for DB
      const revNum = parseFloat(actualRevenueStr.replace(/[^0-9.]/g, '')) * 100000; // assuming L=lakh
      const convNum = parseFloat(conversionRateStr) || 8.2;

      // Save to RevenueMemory
      await prisma.revenueMemory.create({
        data: {
          audience_type: audience,
          channel: channel,
          offer: offer,
          revenue: revNum,
          conversion_rate: convNum,
          learning: learning
        }
      });

      return reply.send({
        predictedRevenue: predictedRevenueStr,
        actualRevenue: actualRevenueStr,
        predictionError: errorRate,
        learnings: [
          `${channel} converted 2.1x better`,
          `8 PM generated highest conversion`,
          `${offer} maximized profit`
        ]
      });
    } catch (e) {
      console.error("Learning failed", e);
      return reply.status(500).send({ error: "Failed to generate learnings" });
    }
  });

  fastify.post('/api/copilot/message-preview', async (request, reply) => {
    try {
      const { channel, offer, goal, audience } = request.body as any;

      // Mock variants based on the requested channel
      let variantA = { type: "urgency", copy: "", preview: "" };
      let variantB = { type: "reward", copy: "", preview: "" };

      if (channel === "WhatsApp") {
        variantA = {
          type: "urgency",
          copy: `Hi <var>Rahul</var>,\nYou've been one of our most valued customers at <var>StyleCo</var>. We noticed you haven't shopped recently.\nEnjoy <var>${offer}</var> off your next order.\nOffer expires in 48 hours.\n[ Shop Now ]`,
          preview: "WhatsApp Preview Text"
        };
        variantB = {
          type: "reward",
          copy: `Hi <var>Rahul</var>,\nExclusive offer for our valued customers!\nWe noticed you haven't shopped recently. Enjoy <var>${offer}</var> off your next order.\n[ Shop Now ]`,
          preview: "WhatsApp Preview Text"
        };
      } else if (channel === "Email") {
        variantA = {
          type: "urgency",
          copy: `Subject: <var>Rahul</var>, an exclusive <var>${offer}</var> offer expiring soon\n\nHi <var>Rahul</var>,\nWe've missed you at <var>StyleCo</var>. As one of our top customers we reserved an exclusive <var>${offer}</var> offer.\nOffer expires in 48 hours.\n[ Redeem Offer ]`,
          preview: `${offer} off your next order - Expiring soon`
        };
        variantB = {
          type: "reward",
          copy: `Subject: <var>Rahul</var>, a special <var>${offer}</var> offer just for you\n\nHi <var>Rahul</var>,\nWe've missed you. As one of our top customers we reserved an exclusive <var>${offer}</var> offer.\n[ Redeem Offer ]`,
          preview: `${offer} off your next order`
        };
      } else if (channel === "SMS") {
        variantA = {
          type: "urgency",
          copy: `<var>Rahul</var>, enjoy <var>${offer}</var> OFF your next purchase at <var>StyleCo</var>. Offer valid for 48 hours. Shop now: <var>styleco.com/recover</var>`,
          preview: "SMS Preview"
        };
        variantB = {
          type: "reward",
          copy: `Exclusive offer for valued customers! <var>Rahul</var>, enjoy <var>${offer}</var> OFF your next purchase. Shop now: <var>styleco.com/recover</var>`,
          preview: "SMS Preview"
        };
      } else if (channel === "Email & SMS") {
        variantA = {
          type: "urgency",
          copy: `[Email]\nSubject: <var>Rahul</var>, an exclusive <var>${offer}</var> offer expiring soon\n\nHi <var>Rahul</var>,\nWe've missed you at <var>StyleCo</var>. As one of our top customers we reserved an exclusive <var>${offer}</var> offer.\nOffer expires in 48 hours.\n[ Redeem Offer ]\n\n[SMS]\n<var>Rahul</var>, enjoy <var>${offer}</var> OFF your next purchase at <var>StyleCo</var>. Offer valid for 48 hours. Shop now: <var>styleco.com/recover</var>`,
          preview: "Email & SMS Preview"
        };
        variantB = {
          type: "reward",
          copy: `[Email]\nSubject: <var>Rahul</var>, a special <var>${offer}</var> offer just for you\n\nHi <var>Rahul</var>,\nWe've missed you. As one of our top customers we reserved an exclusive <var>${offer}</var> offer.\n[ Redeem Offer ]\n\n[SMS]\nExclusive offer for valued customers! <var>Rahul</var>, enjoy <var>${offer}</var> OFF your next purchase. Shop now: <var>styleco.com/recover</var>`,
          preview: "Email & SMS Preview"
        };
      }

      return reply.send({
        channel,
        variantA,
        variantB,
        reasoning: [
          `Similar campaign generated ₹1.4L`,
          `Urgency messaging improved CTR by 22%`,
          `VIP customers respond better to reward framing`
        ],
        historicalPerformance: {
          campaign: "Dormant VIP Recovery",
          revenue: "₹1.4L",
          conversion: "8.2%",
          ctr: "12.4%"
        }
      });
    } catch (e) {
      console.error("Message preview failed", e);
      return reply.status(500).send({ error: "Failed to generate message preview" });
    }
  });

  fastify.get('/api/ai/recommendations', async (request, reply) => {
    try {
      const totalCustomers = await prisma.customer.count();
      const totalOrders = await prisma.order.count();

      const recommendations = [];

      // 1. Dormant VIP Customers
      // Approximation: health_score < 50 AND last_order_date < 60 days ago
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      const dormantVipCount = await prisma.customer.count({
        where: {
          health_score: { lt: 50 },
          last_order_date: { lt: sixtyDaysAgo },
          total_spent: { gt: 5000 }
        }
      });
      if (dormantVipCount > 0) {
        recommendations.push({
          id: 'dormant-vip',
          title: 'Recover Dormant VIP Customers',
          type: 'Recovery',
          audienceSize: dormantVipCount,
          expectedRevenue: dormantVipCount * 1500 * 0.05,
          confidence: 84,
          reasoning: `${dormantVipCount} VIP customers inactive for 60+ days`,
          channel: 'WhatsApp',
          urgency: 0.9
        });
      }

      // 2. Cross-Sell Recent Buyers
      // Approximation: last_order_date between 1 and 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const crossSellCount = await prisma.customer.count({
        where: {
          last_order_date: {
            gte: thirtyDaysAgo,
            lte: oneDayAgo
          }
        }
      });
      if (crossSellCount > 0) {
        recommendations.push({
          id: 'cross-sell',
          title: 'Cross-Sell Recent Buyers',
          type: 'Cross-Sell',
          audienceSize: crossSellCount,
          expectedRevenue: crossSellCount * 800 * 0.08,
          confidence: 79,
          reasoning: `${crossSellCount} customers recently purchased`,
          channel: 'Email',
          urgency: 0.6
        });
      }

      // 3. Prevent High Value Customer Churn
      const churnRiskCount = await prisma.customer.count({
        where: {
          health_score: { gte: 50, lte: 70 },
          total_spent: { gt: 10000 }
        }
      });
      if (churnRiskCount > 0) {
        recommendations.push({
          id: 'prevent-churn',
          title: 'Prevent High Value Customer Churn',
          type: 'Retention',
          audienceSize: churnRiskCount,
          expectedRevenue: churnRiskCount * 2500 * 0.10, // Higher revenue protected
          confidence: 88,
          reasoning: `${churnRiskCount} VIP customers showing declining engagement`,
          channel: 'Email & SMS',
          urgency: 0.95
        });
      }

      // 4. Recover Cart Abandoners (Proxy: Orders exactly 14-21 days ago with no recent purchase)
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      const twentyOneDaysAgo = new Date();
      twentyOneDaysAgo.setDate(twentyOneDaysAgo.getDate() - 21);
      const abandonerCount = await prisma.customer.count({
        where: {
          last_order_date: {
            gte: twentyOneDaysAgo,
            lte: fourteenDaysAgo
          }
        }
      });
      if (abandonerCount > 0) {
        recommendations.push({
          id: 'recover-cart',
          title: 'Recover Potential Drop-offs',
          type: 'Recovery',
          audienceSize: abandonerCount,
          expectedRevenue: abandonerCount * 1200 * 0.06,
          confidence: 87,
          reasoning: `${abandonerCount} users stalled in last 14 days`,
          channel: 'SMS',
          urgency: 0.8
        });
      }

      // 5. Upsell Loyal Customers
      const loyalCount = await prisma.customer.count({
        where: {
          health_score: { gte: 85 }
        }
      });
      if (loyalCount > 0) {
        recommendations.push({
          id: 'upsell-loyal',
          title: 'Upsell Loyal Customers',
          type: 'Upsell',
          audienceSize: loyalCount,
          expectedRevenue: loyalCount * 2000 * 0.12,
          confidence: 82,
          reasoning: `${loyalCount} repeat customers likely to upgrade`,
          channel: 'Email',
          urgency: 0.4
        });
      }

      // Calculate score and format numbers
      const scored = recommendations.map(r => {
        const score = (r.expectedRevenue * 0.5) + (r.confidence * 0.3) + (r.urgency * 0.2);
        return {
          ...r,
          score,
          expectedRevenueFormatted: '₹' + (r.expectedRevenue > 100000 ? (r.expectedRevenue/100000).toFixed(2) + 'L' : Math.round(r.expectedRevenue).toLocaleString('en-IN'))
        };
      });

      // Sort by score desc and take top 5
      scored.sort((a, b) => b.score - a.score);
      const top5 = scored.slice(0, 5);

      return reply.send({
        recommendations: top5,
        globalStats: {
          totalCustomers,
          totalOrders,
          updatedAgo: '12 seconds ago'
        }
      });
    } catch (e) {
      console.error("Recommendations failed", e);
      return reply.status(500).send({ error: "Failed to generate recommendations" });
    }
  });

}

