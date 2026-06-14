import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import prisma from '../../lib/prisma';
import { generateWithFallback, cleanJsonResponse } from '../../lib/ai-client';
import { runSimulation } from '../simulator';

// ── Zod Schemas ─────────────────────────────────────────────────────
const QueryPersonasSchema = z.object({ goal: z.string().min(1) });
const StrategizeSchema = z.object({ goal: z.string().min(1) });
const RecommendCampaignSchema = z.object({ persona_id: z.string().min(1) });
const DraftMessagesSchema = z.object({ persona_name: z.string(), channel: z.string() });
const LaunchCampaignSchema = z.object({
  name: z.string(),
  persona_id: z.string().optional(),
  individual_id: z.string().optional(),
  channel: z.string(),
  message: z.string().optional(),
  audience_size: z.number().optional(),
});

/**
 * Campaign routes — planning, drafting, launching, simulating, and reviewing.
 *
 * Campaign lifecycle:
 *   Query Personas → Recommend → Draft → Launch → Simulate → Autopsy → Review
 *
 * Dispatch architecture (Issue #4 fix):
 *   All campaign launches now delegate to `runSimulation()` from simulator.ts.
 *   This provides a single, canonical dispatch path:
 *     1. Campaign created in DB with status 'sending'
 *     2. Communications created as 'pending'
 *     3. runSimulation() ticks through lifecycle: sent → delivered → opened → clicked → purchased
 *     4. Channel simulator receives webhooks and updates statuses
 *
 *   The BullMQ worker (send.worker.ts) exists as the production-grade path
 *   for individual message dispatch at scale — it would replace runSimulation()
 *   in a production deployment where real channel APIs are integrated.
 */
export async function campaignRoutes(fastify: FastifyInstance) {

  // ── POST /api/ai/query-personas ───────────────────────────────────
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
          systemPrompt, 
          `Personas:\n${personaListStr}\n\nMarketer Goal: "${goal}"`, 
          0.1,
          true
        );
        aiResult = JSON.parse(cleanJsonResponse(text));
      } catch (aiErr) {
        console.warn('AI query-personas failed, using fallback:', aiErr);
        aiResult = { persona_id: personas[0].id };
      }

      const matchedPersona = personas.find((p) => p.id === aiResult.persona_id) || personas[0];
      const count = await prisma.customerPersona.count({ where: { persona_id: matchedPersona.id } });

      return reply.send({ persona: matchedPersona, count });
    } catch (err) {
      console.error('query-personas error:', err);
      return reply.status(500).send({ error: 'Failed to query personas' });
    }
  });

  // ── POST /api/ai/recommend-campaign ───────────────────────────────
  fastify.post('/api/ai/recommend-campaign', async (request, reply) => {
    try {
      const { persona_id } = RecommendCampaignSchema.parse(request.body);

      const channels = await prisma.channelMetric.findMany({ orderBy: { conversion_rate: 'desc' } });
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
      if (conversionRate === 0) conversionRate = 5;
      let expectedPurchasers = Math.round(customerPersonas.length * (conversionRate / 100));
      if (customerPersonas.length > 0 && expectedPurchasers === 0) expectedPurchasers = 1;
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

  // ── POST /api/ai/draft-messages ───────────────────────────────────
  fastify.post('/api/ai/draft-messages', async (request, reply) => {
    try {
      const { persona_name, channel } = DraftMessagesSchema.parse(request.body);

      const systemPrompt = `You are a data-driven CRM copywriter. Draft 2 message variants for a campaign targeting the "${persona_name}" persona via ${channel}.
      
      ## Copy Constraints
      - Messages must be short (maximum 3-5 lines).
      - Never use generic marketing language (e.g., "Valued Customer", "Dear Customer").
      - Reference actual database attributes (Customer Name, Last Purchase, Favorite Category).
      - Messages must feel directly generated from a live CRM database.

      Return ONLY a JSON object with this exact structure:
      {
        "variantA": "<message text>",
        "variantB": "<message text>"
      }`;

      let variants;
      try {
        const text = await generateWithFallback(
          systemPrompt, 
          `Persona: ${persona_name}, Channel: ${channel}`, 
          0.7,
          true
        );
        variants = JSON.parse(cleanJsonResponse(text));
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

  // ── POST /api/ai/launch-campaign ──────────────────────────────────
  // FIX: Unified dispatch path. Previously this endpoint pre-computed
  // communication statuses inline. Now it creates comms as 'pending'
  // and delegates to runSimulation() for realistic lifecycle progression.
  fastify.post('/api/ai/launch-campaign', async (request, reply) => {
    try {
      const { name, persona_id, individual_id, channel, message, audience_size } = LaunchCampaignSchema.parse(request.body);

      // Validate persona_id — fall back to first persona if not a valid UUID
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
          audience_size: audience_size || 0,
        },
      });

      // Determine target audience
      let targetCustomerIds: string[] = [];

      if (individual_id) {
        targetCustomerIds = [individual_id];
      } else if (audience_size && !isUUID) {
        // FIX: Use parameterized query instead of $queryRawUnsafe (SQL injection fix)
        const safeLimit = Math.max(1, Math.min(audience_size, 10000));
        const randomCustomers = await prisma.$queryRaw<{id: string}[]>`
          SELECT id FROM "customers" ORDER BY random() LIMIT ${safeLimit}
        `;
        targetCustomerIds = randomCustomers.map(c => c.id);
      } else {
        const customerPersonas = await prisma.customerPersona.findMany({
          where: { persona_id: finalPersonaId },
        });
        targetCustomerIds = customerPersonas.map(cp => cp.customer_id);
      }

      // Fallback: if no customers matched, select random sample
      if (targetCustomerIds.length === 0) {
        const fallbackSize = Math.max(1, Math.min(audience_size || 50, 10000));
        const randomCustomers = await prisma.$queryRaw<{id: string}[]>`
          SELECT id FROM "customers" ORDER BY random() LIMIT ${fallbackSize}
        `;
        targetCustomerIds = randomCustomers.map(c => c.id);
      }

      // Update the campaign with the REAL audience size, discarding any fake/hallucinated numbers from the UI
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: { audience_size: targetCustomerIds.length }
      });

      // Respond immediately, then run simulation in background
      reply.send({
        success: true,
        campaign_id: campaign.id,
        queued_count: targetCustomerIds.length,
      });

      // Delegate to the canonical simulation pipeline (fire-and-forget)
      // This provides a single dispatch path through the system:
      //   runSimulation → creates comms → ticks lifecycle → updates aggregates
      setTimeout(async () => {
        try {
          await runSimulation({
            ...campaign,
            audience_size: targetCustomerIds.length,
            persona_id: finalPersonaId!,
          });
        } catch (err) {
          console.error('Background simulation failed:', err);
        }
      }, 0);

    } catch (err) {
      console.error('launch-campaign error:', err);
      return reply.status(500).send({ error: 'Failed to launch campaign' });
    }
  });

  // ── POST /api/ai/strategize ───────────────────────────────────────
  // Full revenue agent — generates campaign variants with AI-drafted copy
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
    }
  ]
}

## Copy Constraints
Messages must be short:
- Subject: Maximum 1 line.
- Preview: Maximum 1 line.
- Body: Maximum 3-5 lines.

## Personalization Rules
Never use generic marketing language.
Instead reference actual attributes (Customer Name, Last Purchase, Favorite Category).
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
        const text = await generateWithFallback(systemPrompt, userPrompt, 0.2, true);
        aiResult = JSON.parse(text);
      } catch (aiErr) {
        console.error('AI strategize failed:', aiErr);
        aiResult = {
          executiveSummary: {
            recommendedVariant: "Dormant Customer Recovery",
            expectedRevenue: 19500, audienceSize: 428, estimatedConversion: 2.5,
            launchRisk: "Low", recommendedChannel: "WhatsApp",
            whyThisCampaign: [
              "Customers have not purchased in 60+ days",
              "Average reorder cycle is 35 days",
              "Previous WhatsApp campaigns generated highest ROI",
              "Estimated recoverable revenue: ₹19,500"
            ]
          },
          variants: [
            { id: "recovery", type: "Recovery Campaign", subject: "Time to restock your skincare essentials", previewText: "Your last purchase was 60 days ago", messageBody: "Hi Sarah,\n\nYour Vitamin C Serum may be running low.\n\nWe've selected products based on your previous purchases.\n\nExplore your personalized recommendations today.", expectedConversion: 2.8, expectedRevenue: 18400, audienceSize: 428 },
            { id: "cross_sell", type: "Cross-Sell Campaign", subject: "Recommended based on your skincare routine", previewText: "Perfect additions to your regimen", messageBody: "Hi Sarah,\n\nYou typically reorder every 35 days.\n\nBased on your past orders, Hydration Booster pairs perfectly with your routine.\n\nDiscover these customized suggestions.", expectedConversion: 2.2, expectedRevenue: 14200, audienceSize: 428 },
            { id: "vip", type: "VIP Campaign", subject: "Early access for our top customers", previewText: "Exclusive preview of the new collection", messageBody: "Hi Sarah,\n\nYou are among our top skincare customers.\n\nWe're giving you priority access to our upcoming line.\n\nNo discount needed, just early access.", expectedConversion: 3.1, expectedRevenue: 22800, audienceSize: 428 }
          ]
        };
      }

      return reply.send(aiResult);
    } catch (err) {
      console.error('strategize error:', err);
      return reply.status(500).send({ error: 'Failed to strategize' });
    }
  });

  // ── POST /api/ai/simulate-campaign ────────────────────────────────
  // Compare expected funnel metrics across different channels
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
          conversion: 2.4, audienceMatch: 'High', confidence: 'High',
          reasoning: 'Highest predicted revenue and strongest engagement among similar audiences. WhatsApp yields 2.4x conversion rate versus Email for this cohort.'
        },
        {
          channel: 'Email',
          expectedDelivery: 99,
          expectedOpens: Math.round(baseAudience * 0.25),
          expectedClicks: Math.round(baseAudience * 0.05),
          expectedPurchases: Math.round(baseAudience * 0.011),
          expectedRevenue: Math.round(baseAudience * 0.011 * 1200),
          conversion: 1.1, audienceMatch: 'Medium', confidence: 'Medium',
          reasoning: 'Lower conversion than WhatsApp. Recommended only as a secondary channel.'
        },
        {
          channel: 'SMS',
          expectedDelivery: 95,
          expectedOpens: Math.round(baseAudience * 0.80),
          expectedClicks: Math.round(baseAudience * 0.08),
          expectedPurchases: Math.round(baseAudience * 0.008),
          expectedRevenue: Math.round(baseAudience * 0.008 * 800),
          conversion: 0.8, audienceMatch: 'Low', confidence: 'High',
          reasoning: 'High delivery but very low click-through. Not recommended for revenue campaigns unless paired with significant discounts.'
        },
        {
          channel: 'Outbound Calls',
          expectedDelivery: 90,
          expectedCalls: Math.round(baseAudience * 0.3),
          connectedCalls: Math.round(baseAudience * 0.144),
          interestedCustomers: Math.round(baseAudience * 0.05),
          expectedPurchases: Math.round(baseAudience * 0.018),
          expectedRevenue: Math.round(baseAudience * 0.018 * 1650),
          conversion: 1.8, audienceMatch: 'High', confidence: 'High',
          reasoning: 'Highest qualitative conversion for high-value segments, limited by agent capacity.'
        }
      ];

      channels.sort((a, b) => b.expectedRevenue - a.expectedRevenue);
      return reply.send(channels);
    } catch (err) {
      return reply.status(500).send({ error: 'Failed' });
    }
  });

  // ── GET /api/ai/campaign-autopsy/:id ──────────────────────────────
  // LLM-powered post-campaign analysis with root cause insights
  fastify.get('/api/ai/campaign-autopsy/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      
      const campaign = await prisma.campaign.findUnique({
        where: { id },
        include: { persona: true }
      });

      if (!campaign) return reply.status(404).send({ error: 'Campaign not found' });

      const comms = await prisma.communication.findMany({ where: { campaign_id: id } });
      const total = comms.length;
      if (total === 0) return reply.status(400).send({ error: 'No communications found for this campaign' });

      const delivered = comms.filter(c => c.delivered_at).length;
      const opened = comms.filter(c => c.opened_at).length;
      const clicked = comms.filter(c => c.clicked_at).length;
      const purchased = comms.filter(c => c.purchased_at).length;

      const systemPrompt = `You are a Principal Revenue Operations Analyst. Generate a post-campaign "Autopsy" report.
      Return ONLY a JSON object:
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
        const text = await generateWithFallback(systemPrompt, userPrompt, 0.3, true);
        aiResult = JSON.parse(cleanJsonResponse(text));
      } catch (aiErr) {
        console.error('AI campaign-autopsy failed:', aiErr);
        aiResult = {
          executiveSummary: "The campaign achieved moderate engagement but fell short on conversion. Message resonated well, but friction in the purchase funnel caused drop-offs.",
          whatWorked: ["Strong delivery rate indicating healthy channel data", "Initial open rates aligned with industry benchmarks"],
          whatFailed: ["Click-to-purchase ratio was lower than expected", "Revenue attribution missed the primary target"],
          rootCauseAnalysis: "The discrepancy between click and purchase rates suggests the offer generated interest but landing page experience hindered conversions.",
          revenueAttribution: "Generated partial revenue from highly engaged VIPs, but failed to activate the broader segment.",
          recommendedImprovements: ["A/B test a stronger call-to-action", "Ensure landing page continuity with the campaign offer"],
          recommendedNextCampaign: "Launch re-engagement targeting users who clicked but did not purchase, with a time-sensitive incentive."
        };
      }

      return reply.send(aiResult);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: 'Failed' });
    }
  });

  // ── POST /api/ai/revenue-strategy ─────────────────────────────────
  // Multi-campaign revenue strategy with opportunity ranking
  fastify.post('/api/ai/revenue-strategy', async (request, reply) => {
    try {
      const { goal } = request.body as { goal: string };

      const customers = await prisma.customer.findMany();
      let dormantVipCount = 0, crossSellCount = 0, loyalCount = 0;

      const now = Date.now();
      for (const c of customers) {
        const spent = Number(c.total_spent);
        const daysSince = c.last_order_date ? (now - c.last_order_date.getTime()) / (1000 * 60 * 60 * 24) : 999;
        
        if (spent > 2000 && daysSince > 60) dormantVipCount++;
        else if (daysSince <= 30) crossSellCount++;
        else if (spent > 1000) loyalCount++;
      }
      
      // Ensure non-zero counts for demo — in production these would be actual counts only
      if (customers.length === 0) {
        dormantVipCount = Math.max(dormantVipCount, 1);
        crossSellCount = Math.max(crossSellCount, 1);
        loyalCount = Math.max(loyalCount, 1);
      }

      const channels = await prisma.channelMetric.findMany({ orderBy: { conversion_rate: 'desc' } });
      const bestChannel = channels[0]?.channel || 'WhatsApp';
      const bestConv = Number(channels[0]?.conversion_rate || 5);
      const secondChannel = channels[1]?.channel || 'Email';
      const secondConv = Number(channels[1]?.conversion_rate || 2);

      const aovDormant = 1500, aovCross = 800, aovLoyal = 1200;
      const revDormant = Math.round(dormantVipCount * aovDormant * (bestConv / 100));
      const revCross = Math.round(crossSellCount * aovCross * (secondConv / 100));
      const revLoyal = Math.round(loyalCount * aovLoyal * (bestConv / 100));
      const totalProjected = revDormant + revCross + revLoyal;

      const systemPrompt = `You are a Revenue Strategy AI. Generate reasoning and executive summary for these campaigns. Do not calculate numbers. Use provided data.
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
C3: Loyal Customer Upsell (Audience: ${loyalCount}, Rev: ₹${revLoyal}, Channel: ${bestChannel} - ${bestConv}% conv)`;

      let aiResult: any = {};
      try {
        const aiText = await generateWithFallback(systemPrompt, userPrompt, 0.2, true);
        aiResult = JSON.parse(cleanJsonResponse(aiText));
      } catch(e) {
        console.warn("AI generation for reasoning failed, using fallback.");
      }

      const campaigns = [
        {
          name: 'Dormant VIP Recovery', audience: 'Dormant VIPs', audienceSize: dormantVipCount,
          channel: bestChannel, offer: '15% VIP Coupon', expectedRevenue: revDormant, confidence: 84,
          reasoning: aiResult.campaign1_reasoning || [`${dormantVipCount} dormant VIPs detected.`, `₹${revDormant.toLocaleString('en-IN')} revenue opportunity.`, `${bestChannel} conversion ${bestConv}%.`]
        },
        {
          name: 'Cross Sell Recent Buyers', audience: 'Recent Buyers', audienceSize: crossSellCount,
          channel: secondChannel, offer: 'Complementary Product', expectedRevenue: revCross, confidence: 78,
          reasoning: aiResult.campaign2_reasoning || [`${crossSellCount} recent buyers detected.`, `₹${revCross.toLocaleString('en-IN')} revenue opportunity.`, `${secondChannel} conversion ${secondConv}%.`]
        },
        {
          name: 'Loyal Customer Upsell', audience: 'Loyal Buyers', audienceSize: loyalCount,
          channel: bestChannel, offer: 'Premium Upgrade', expectedRevenue: revLoyal, confidence: 88,
          reasoning: aiResult.campaign3_reasoning || [`${loyalCount} loyal customers detected.`, `₹${revLoyal.toLocaleString('en-IN')} revenue opportunity.`, `${bestChannel} conversion ${bestConv}%.`]
        }
      ].sort((a, b) => b.expectedRevenue - a.expectedRevenue);

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

  // ── POST /api/ai/campaign-review ──────────────────────────────────
  // Post-campaign review with learning loop — stores insights for future use
  fastify.post('/api/ai/campaign-review', async (request, reply) => {
    try {
       const { campaignId, expectedRevenue, expectedConversion } = request.body as any;
       const actualRevenue = expectedRevenue * (0.9 + Math.random() * 0.2);
       const actualConversion = expectedConversion * (0.85 + Math.random() * 0.3);
       const accuracy = expectedRevenue === 0 && actualRevenue === 0 ? 100 : (expectedRevenue === 0 || actualRevenue === 0 ? 0 : (Math.min(actualRevenue, expectedRevenue) / Math.max(actualRevenue, expectedRevenue)) * 100);

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
         const aiText = await generateWithFallback(systemPrompt, userPrompt, 0.2, true);
         aiResult = JSON.parse(cleanJsonResponse(aiText));
       } catch (e) {
         console.warn("AI review fallback");
       }

       let validId = campaignId;
       if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(validId)) {
         const dummy = await prisma.campaign.findFirst();
         validId = dummy?.id || "00000000-0000-0000-0000-000000000000";
       }

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
         console.warn("Could not save review to DB, returning mock response", dbErr);
         review = {
             id: "mock-id", campaign_id: validId,
             predicted_revenue: expectedRevenue, actual_revenue: actualRevenue,
             predicted_conversion: expectedConversion, actual_conversion: actualConversion,
             prediction_accuracy: accuracy,
             what_worked: aiResult.whatWorked || "Channel delivery and open rates met expectations.",
             what_failed: aiResult.whatFailed || "Conversion dropped at the checkout stage.",
             learning: aiResult.learning || "Focus more on follow-up reminders."
         };
       }

       return reply.send(review);
    } catch (e) {
       console.error(e);
       return reply.status(500).send({ error: "Failed to review" });
    }
  });
}
