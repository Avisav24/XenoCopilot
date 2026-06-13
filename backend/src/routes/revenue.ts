import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';
import { GoogleGenAI } from '@google/genai';
import { Groq } from 'groq-sdk';
import { z } from 'zod';
import { generateWithFallback } from './ai';

export async function revenueRoutes(fastify: FastifyInstance) {
  fastify.get('/api/revenue/stats', async (_request, reply) => {
    // Fetch all campaigns with their orders
    const campaigns = await prisma.campaign.findMany({
      include: {
        orders: true,
        persona: true
      }
    });

    const channelMetrics = await prisma.channelMetric.findMany();

    let totalRevenueInfluenced = 0;
    
    const revenueByCampaign: Record<string, number> = {};
    const revenueByPersona: Record<string, number> = {};
    const revenueByChannel: Record<string, { revenue: number, ctr: number, conversion: number }> = {};
    const revenueByOpportunity: Record<string, number> = {};

    // Initialize channels
    for (const ch of channelMetrics) {
      revenueByChannel[ch.channel] = {
        revenue: 0,
        ctr: Number(ch.ctr),
        conversion: Number(ch.conversion_rate)
      };
    }
    
    // Inject Outbound Calls
    if (!revenueByChannel['Outbound Calls']) {
      revenueByChannel['Outbound Calls'] = {
        revenue: 28400,
        ctr: 0,
        conversion: 1.8
      };
    }

    let customersReactivated = 0;
    let atRiskSaved = 0;
    
    // We can simulate reactivated/saved for MVP based on opportunity types
    for (const c of campaigns) {
      const campRev = c.orders.reduce((sum, o) => sum + Number(o.amount), 0);
      totalRevenueInfluenced += campRev;

      if (campRev > 0) {
        revenueByCampaign[c.name] = (revenueByCampaign[c.name] || 0) + campRev;
        revenueByPersona[c.persona.name] = (revenueByPersona[c.persona.name] || 0) + campRev;
        
        if (c.channel && revenueByChannel[c.channel]) {
          revenueByChannel[c.channel].revenue += campRev;
        }

        if (c.opportunity_type) {
          revenueByOpportunity[c.opportunity_type] = (revenueByOpportunity[c.opportunity_type] || 0) + campRev;
          
          if (c.opportunity_type.includes('Dormant')) {
             customersReactivated += c.orders.length; // rough estimate
          }
          if (c.opportunity_type.includes('Retention') || c.opportunity_type.includes('Risk')) {
             atRiskSaved += c.orders.length;
          }
        }
      }
    }

    const formatTop = (dict: Record<string, number>) => Object.entries(dict).sort((a,b) => b[1]-a[1]).slice(0, 5).map(([name, value]) => ({ name, value }));

    const topPersona = Object.entries(revenueByPersona).sort((a,b) => b[1]-a[1])[0]?.[0] || 'Unknown';
    const topChannel = Object.entries(revenueByChannel).sort((a,b) => b[1].revenue-a[1].revenue)[0]?.[0] || 'Unknown';

    return reply.send({
      totalRevenueInfluenced: totalRevenueInfluenced + 28400,
      customersReactivated,
      atRiskSaved,
      topPersona,
      topChannel,
      revenueByCampaign: formatTop(revenueByCampaign),
      revenueByPersona: formatTop(revenueByPersona),
      revenueByOpportunity: formatTop(revenueByOpportunity),
      channelIntelligence: Object.entries(revenueByChannel).map(([channel, stats]) => {
        let roi = 0;
        if (channel === 'Email') roi = 1200;
        else if (channel === 'WhatsApp') roi = 450;
        else if (channel === 'Outbound Calls') roi = 320;
        else if (channel === 'SMS') roi = 180;
        
        return {
          channel,
          revenue: stats.revenue,
          ctr: stats.ctr,
          conversion: stats.conversion,
          roi
        };
      }).sort((a, b) => b.revenue - a.revenue),
      keyInsight: `${topChannel} campaigns targeting top personas generated ${totalRevenueInfluenced > 0 ? Math.round((revenueByChannel[topChannel]?.revenue / totalRevenueInfluenced) * 100) : 0}% of attributed revenue this month. This indicates a strong preference for direct conversational channels.`,
      keyRisk: `428 customers who previously contributed significant revenue have not purchased in 45+ days, creating an estimated recovery gap of ₹17,200.`,
      keyOpportunity: `Dormant high-spenders exhibit a historical 3.1% reactivation rate. A targeted win-back sequence could yield immediate positive ROI.`,
      revenueTrend: [
        { date: '1', value: 45000 },
        { date: '5', value: 52000 },
        { date: '10', value: 38000 },
        { date: '15', value: 65000 },
        { date: '20', value: 89000 },
        { date: '25', value: 72000 },
        { date: '30', value: 95000 }
      ],
      aiInsights: [
        {
          insight: 'Dormant VIP engagement declined 11% over 14 days.',
          metric: 'Estimated revenue at risk:',
          value: '₹42,000',
          actionLabel: 'View Opportunity'
        },
        {
          insight: 'WhatsApp generated 56% of attributed revenue.',
          metric: 'Channel growth:',
          value: '+14% MoM',
          actionLabel: 'View Campaigns'
        },
        {
          insight: 'Beauty Loyalists produced 18% higher AOV.',
          metric: 'Average Order Value:',
          value: '₹2,450',
          actionLabel: 'Explore Segment'
        }
      ],
      opportunities: [
        {
          name: 'Recoverable Revenue',
          value: '₹1.72L',
          audience: '428 dormant customers',
          confidence: 82,
          actionLabel: 'Generate Campaign'
        },
        {
          name: 'VIP Retention',
          value: '₹1.25L',
          audience: '98 customers',
          confidence: 89,
          actionLabel: 'Launch Retention Flow'
        }
      ]
    });
  });

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

  // 1. REVENUE LEAKS ENGINE
  fastify.get('/api/revenue/leaks', async (request, reply) => {
    try {
      const customers = await prisma.customer.findMany({
        include: {
          customer_personas: { include: { persona: true } },
          orders: { orderBy: { order_date: 'desc' } }
        }
      });

      const now = Date.now();
      
      const dormantBucket = {
        id: 'dormant-leak',
        title: 'Dormant Customers',
        customersAffected: 0,
        revenueAtRisk: 0,
        recoverableRevenue: 0,
        evidence: ['Last purchase > 60 days', 'Engagement dropping'],
        recommendation: 'Launch Reactivation Campaign',
        confidenceReason: 'Based on Purchase Cycle',
        predictedLossDate: '21 Days'
      };

      const atRiskBucket = {
        id: 'at-risk-leak',
        title: 'High Risk Customers',
        customersAffected: 0,
        revenueAtRisk: 0,
        recoverableRevenue: 0,
        evidence: ['Health Score < 60', 'High Churn Probability (> 0.5)'],
        recommendation: 'Launch VIP Retention',
        confidenceReason: 'Based on Health Score',
        predictedLossDate: '14 Days'
      };

      customers.forEach(c => {
        const daysSince = c.last_order_date ? (now - c.last_order_date.getTime()) / (1000 * 60 * 60 * 24) : 999;
        const churnProb = 1 - (c.health_score / 100);
        const ltv = Number(c.total_spent);
        
        let isLeak = false;
        let revAtRisk = ltv * churnProb;

        if (c.health_score < 60 || churnProb > 0.5) {
          atRiskBucket.customersAffected += 1;
          atRiskBucket.revenueAtRisk += revAtRisk;
          isLeak = true;
        } else if (daysSince > 60) {
          dormantBucket.customersAffected += 1;
          dormantBucket.revenueAtRisk += revAtRisk;
          isLeak = true;
        }
      });

      atRiskBucket.recoverableRevenue = atRiskBucket.revenueAtRisk * 0.4;
      dormantBucket.recoverableRevenue = dormantBucket.revenueAtRisk * 0.4;

      const leaks = [];
      if (atRiskBucket.customersAffected > 0) leaks.push(atRiskBucket);
      if (dormantBucket.customersAffected > 0) leaks.push(dormantBucket);

      console.log(`[Revenue Leaks] Customers Loaded: ${customers.length}`);
      console.log(`[Revenue Leaks] At Risk Found: ${atRiskBucket.customersAffected + dormantBucket.customersAffected}`);
      console.log(`[Revenue Leaks] Total Rev At Risk: ${atRiskBucket.revenueAtRisk + dormantBucket.revenueAtRisk}`);
      console.log("LEAKS API RESPONSE:", JSON.stringify(leaks, null, 2));
      
      return reply.send(leaks);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: 'Failed to detect revenue leaks' });
    }
  });

  // 2. AI DECISION SIMULATOR
  const SimulateSchema = z.object({
    segmentId: z.string().optional(),
    audienceName: z.string().optional(),
    channel: z.string(),
    offer: z.string().optional(),
    discount: z.string().optional(),
    sendTime: z.string().optional(),
    campaignGoal: z.string()
  });

  fastify.post('/api/revenue/simulate', async (request, reply) => {
    try {
      const input = SimulateSchema.parse(request.body);

      // Fetch Campaign Memories for the memory engine
      const memories = await prisma.campaignMemory.findMany({
        take: 5,
        orderBy: { created_at: 'desc' }
      });

      const dbContext = {
        historicalConversion: {
          'WhatsApp': 6.8,
          'Email': 2.1,
          'SMS': 3.5
        },
        avgAOV: 3200,
        recentMemories: memories
      };

      const systemPrompt = `You are the XenoCopilot AI Decision Simulator.
Model the expected business outcome of launching this specific campaign.
Do not generate arbitrary values; use the provided historical conversion baselines to formulate your math.

Output ONLY a JSON object with:
{
  "audienceSize": 425,
  "expectedOpenRate": 65.5,
  "expectedCTR": 12.4,
  "expectedConversionRate": 6.8,
  "expectedPurchasers": 28,
  "expectedRevenue": 342000,
  "expectedROI": 4.2,
  "risk": "Low",
  "reasoning": ["Reason 1", "Reason 2"]
}`;

      const userPrompt = `Simulate this scenario:
Audience: ${input.audienceName || input.segmentId || 'Target Audience'}
Channel: ${input.channel}
Offer: ${input.offer || 'Standard'}
Discount: ${input.discount || 'None'}
Send Time: ${input.sendTime || 'Any'}
Goal: ${input.campaignGoal}

Historical Baselines: ${JSON.stringify(dbContext)}`;

      const aiResponse = await generateWithFallback(
        genaiInstances,
        groqInstances,
        systemPrompt,
        userPrompt,
        0.2,
        true
      );

      const simulation = JSON.parse(aiResponse.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim());
      return reply.send(simulation);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: 'Simulation failed' });
    }
  });

  // 3. AUTONOMOUS REVENUE GOAL PLANNER
  const PlannerSchema = z.object({
    revenueGoal: z.string() // e.g. "10,00,000"
  });

  fastify.post('/api/revenue/planner', async (request, reply) => {
    try {
      const { revenueGoal } = PlannerSchema.parse(request.body);

      const systemPrompt = `You are the XenoCopilot Autonomous Revenue Goal Planner.
The marketer has input a total revenue target they must hit this month.
You must break this total goal down into 3-4 distinct audience campaign opportunities.
The sum of 'potentialRevenue' across opportunities should roughly equal or slightly exceed the goal.

Output ONLY a JSON object:
{
  "projectedTotalRevenue": 1040000,
  "gapAnalysis": "Slightly over target.",
  "expectedCompletionDate": "Month End",
  "status": "Goal Achievable",
  "opportunities": [
    {
      "title": "Campaign Name",
      "audienceSize": 400,
      "potentialRevenue": 320000,
      "recommendedChannel": "WhatsApp",
      "messageStrategy": "What to say",
      "estimatedConversionRate": 5.5
    }
  ]
}`;

      const aiResponse = await generateWithFallback(
        genaiInstances,
        groqInstances,
        systemPrompt,
        `Revenue Goal: ${revenueGoal}`,
        0.4,
        true
      );

      const plan = JSON.parse(aiResponse.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim());
      return reply.send(plan);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: 'Planner failed' });
    }
  });

  // 4. REVENUE OPPORTUNITIES (Merged)
  fastify.get('/api/revenue/opportunities', async (request, reply) => {
    try {
      const customers = await prisma.customer.findMany({
        include: {
          customer_personas: { include: { persona: true } },
          orders: true
        }
      });
      
      const frequentBuyersBucket = {
        opportunity: "High Frequency Cross-Sell",
        potentialRevenue: 0,
        audience: 0,
        confidence: 85,
        channel: "WhatsApp",
        reasoning: ["Frequent buyers (>3 orders)", "High engagement"],
        action: "Launch Cross-Sell Campaign"
      };

      const highLtvBucket = {
        opportunity: "VIP Upsell",
        potentialRevenue: 0,
        audience: 0,
        confidence: 78,
        channel: "Email",
        reasoning: ["High LTV (>₹10k)", "Brand loyalists"],
        action: "Launch VIP Exclusive Offer"
      };

      let avgOrderValueTotal = 0;
      let orderCount = 0;

      customers.forEach(c => {
        const ltv = Number(c.total_spent);
        const orders = c.orders.length;
        
        c.orders.forEach(o => {
          avgOrderValueTotal += Number(o.total_amount);
          orderCount += 1;
        });

        if (orders > 3) {
          frequentBuyersBucket.audience += 1;
        } else if (ltv > 10000) {
          highLtvBucket.audience += 1;
        }
      });

      const globalAOV = orderCount > 0 ? avgOrderValueTotal / orderCount : 3000;
      const expectedConv = 0.05;

      frequentBuyersBucket.potentialRevenue = Math.round(frequentBuyersBucket.audience * globalAOV * expectedConv);
      highLtvBucket.potentialRevenue = Math.round(highLtvBucket.audience * globalAOV * expectedConv);

      const opps = [];
      if (frequentBuyersBucket.audience > 0) opps.push(frequentBuyersBucket);
      if (highLtvBucket.audience > 0) opps.push(highLtvBucket);

      console.log(`[Revenue Opps] Customers Loaded: ${customers.length}`);
      console.log(`[Revenue Opps] Total Orders: ${orderCount}`);
      console.log("OPPS API RESPONSE:", JSON.stringify(opps, null, 2));
      return reply.send(opps);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: 'Failed to find opportunities' });
    }
  });

  // 5. CAMPAIGN MEMORIES
  const MemorySchema = z.object({
    campaignName: z.string(),
    audienceSegment: z.string(),
    channel: z.string(),
    revenue: z.number(),
    conversionRate: z.number(),
    learnings: z.array(z.string())
  });

  fastify.post('/api/revenue/memories', async (request, reply) => {
    try {
      const input = MemorySchema.parse(request.body);
      const memory = await prisma.campaignMemory.create({
        data: {
          campaign_name: input.campaignName,
          audience_segment: input.audienceSegment,
          channel: input.channel,
          revenue: input.revenue,
          conversion_rate: input.conversionRate,
          learnings: input.learnings
        }
      });
      return reply.send(memory);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: 'Failed to save memory' });
    }
  });
}
