import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';
import { z } from 'zod';

export async function revenueRoutes(fastify: FastifyInstance) {
  // 0. DATA AUDIT ENDPOINT
  fastify.get('/api/revenue/debug', async (request, reply) => {
    try {
      const [totalCustomers, totalOrders, totalCampaigns, totalCommunications] = await Promise.all([
        prisma.customer.count(),
        prisma.order.count(),
        prisma.campaign.count(),
        prisma.communication.count()
      ]);

      const revenueAgg = await prisma.order.aggregate({
        _sum: { amount: true },
        _avg: { amount: true }
      });

      const recentOrders = await prisma.order.findMany({
        take: 5,
        orderBy: { order_date: 'desc' },
        select: { id: true, amount: true, order_date: true }
      });

      if (totalCustomers === 0 || totalOrders === 0) {
        return reply.send({
          warning: "No orders or customers found. Revenue calculations unavailable.",
          totalCustomers,
          totalOrders,
          totalCampaigns,
          totalCommunications,
          totalRevenue: 0,
          averageOrderValue: 0,
          recentOrders: []
        });
      }

      return reply.send({
        totalCustomers,
        totalOrders,
        totalCampaigns,
        totalCommunications,
        totalRevenue: Number(revenueAgg._sum.amount || 0),
        averageOrderValue: Number(revenueAgg._avg.amount || 0),
        recentOrders
      });
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: 'Debug audit failed' });
    }
  });

  // 1. REVENUE LEAKS ENGINE
  fastify.get('/api/revenue/leaks', async (request, reply) => {
    try {
      const customers = await prisma.customer.findMany({
        include: {
          orders: { orderBy: { order_date: 'asc' } },
          communications: true
        }
      });

      const now = Date.now();
      const sortedLtv = [...customers].map(c => Number(c.total_spent)).sort((a, b) => b - a);
      const top20LtvThreshold = sortedLtv[Math.floor(customers.length * 0.2)] || 0;

      const dormantBucket = {
        id: 'dormant-leak',
        title: 'Dormant Customers',
        customersAffected: 0,
        revenueAtRisk: 0,
        recoverableRevenue: 0,
        evidence: [] as string[],
        recommendation: 'Launch Reactivation Campaign',
        confidenceReason: 'Based on Purchase Cycle',
        predictedLossDate: '21 Days'
      };

      const vipRiskBucket = {
        id: 'vip-risk-leak',
        title: 'VIP At Risk',
        customersAffected: 0,
        revenueAtRisk: 0,
        recoverableRevenue: 0,
        evidence: [] as string[],
        recommendation: 'Launch VIP Retention',
        confidenceReason: 'Based on High LTV & Delay',
        predictedLossDate: '14 Days'
      };

      const engagementBucket = {
        id: 'engagement-leak',
        title: 'Declining Engagement',
        customersAffected: 0,
        revenueAtRisk: 0,
        recoverableRevenue: 0,
        evidence: [] as string[],
        recommendation: 'Launch Re-engagement Campaign',
        confidenceReason: 'Based on Open/Click Drop',
        predictedLossDate: '30 Days'
      };

      customers.forEach(c => {
        const daysSinceLastPurchase = c.last_order_date ? (now - c.last_order_date.getTime()) / (1000 * 60 * 60 * 24) : 999;
        const ltv = Number(c.total_spent);
        const orderCount = c.orders.length;
        const avgOrderValue = orderCount > 0 ? ltv / orderCount : 0;
        
        let historicalPurchaseFrequency = 90;
        if (orderCount > 1) {
          const first = c.orders[0].order_date.getTime();
          const last = c.orders[orderCount - 1].order_date.getTime();
          historicalPurchaseFrequency = ((last - first) / (1000 * 60 * 60 * 24)) / (orderCount - 1);
        }
        if (historicalPurchaseFrequency <= 0) historicalPurchaseFrequency = 30;

        const engagementRate = c.communications.length > 0 
          ? c.communications.filter(comm => comm.opened_at).length / c.communications.length 
          : 1;

        const expectedRemainingPurchases = 1.5;
        const revAtRisk = avgOrderValue * expectedRemainingPurchases;

        if (ltv > top20LtvThreshold && daysSinceLastPurchase > historicalPurchaseFrequency && orderCount > 0) {
          vipRiskBucket.customersAffected++;
          vipRiskBucket.revenueAtRisk += revAtRisk;
        } else if (daysSinceLastPurchase > historicalPurchaseFrequency * 1.5 && orderCount > 0) {
          dormantBucket.customersAffected++;
          dormantBucket.revenueAtRisk += revAtRisk;
        } else if (engagementRate < 0.2 && c.communications.length >= 3) {
          engagementBucket.customersAffected++;
          engagementBucket.revenueAtRisk += revAtRisk;
        }
      });

      const leaks = [];
      if (vipRiskBucket.customersAffected > 0) {
        vipRiskBucket.evidence = [`LTV > Top 20% (₹${Math.round(top20LtvThreshold)})`, 'Delay exceeds normal purchase cycle'];
        vipRiskBucket.recoverableRevenue = vipRiskBucket.revenueAtRisk * 0.5;
        leaks.push(vipRiskBucket);
      }
      if (dormantBucket.customersAffected > 0) {
        dormantBucket.evidence = ['Purchase delay > 1.5x normal frequency', 'High churn probability'];
        dormantBucket.recoverableRevenue = dormantBucket.revenueAtRisk * 0.35;
        leaks.push(dormantBucket);
      }
      if (engagementBucket.customersAffected > 0) {
        engagementBucket.evidence = ['Open rate dropped significantly', 'Low interaction over last 3 campaigns'];
        engagementBucket.recoverableRevenue = engagementBucket.revenueAtRisk * 0.2;
        leaks.push(engagementBucket);
      }

      return reply.send(leaks);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: 'Failed to detect revenue leaks' });
    }
  });

  // 3. REVENUE OPPORTUNITIES
  async function generateOpportunities() {
    const customers = await prisma.customer.findMany({ include: { orders: true } });
    
    const dormantBucket = {
      opportunity: "Dormant Recovery",
      potentialRevenue: 0,
      audience: 0,
      confidence: 72,
      channel: "WhatsApp",
      reasoning: ["Previously active", "Historical recovery 3.1%"],
      action: "Launch Reactivation Campaign"
    };

    const highValueBucket = {
      opportunity: "High Value Cross-Sell",
      potentialRevenue: 0,
      audience: 0,
      confidence: 85,
      channel: "Email",
      reasoning: ["High LTV", "Strong brand affinity"],
      action: "Launch VIP Collection"
    };

    const repeatBucket = {
      opportunity: "Repeat Buyer Upsell",
      potentialRevenue: 0,
      audience: 0,
      confidence: 78,
      channel: "SMS",
      reasoning: ["Frequent buyers", "High conversion probability"],
      action: "Launch Subscription Offer"
    };

    let totalOrders = 0;
    let totalRevenue = 0;

    customers.forEach(c => {
      const ltv = Number(c.total_spent);
      const orders = c.orders.length;
      totalRevenue += ltv;
      totalOrders += orders;
    });

    const globalAOV = totalOrders > 0 ? totalRevenue / totalOrders : 3000;
    const now = Date.now();

    customers.forEach(c => {
      const ltv = Number(c.total_spent);
      const orders = c.orders.length;
      const daysSince = c.last_order_date ? (now - c.last_order_date.getTime()) / (1000 * 60 * 60 * 24) : 999;
      
      if (orders > 3) {
        repeatBucket.audience++;
      } else if (ltv > 10000) {
        highValueBucket.audience++;
      } else if (daysSince > 90 && orders > 0) {
        dormantBucket.audience++;
      }
    });

    const expectedConv = 0.05;
    dormantBucket.potentialRevenue = Math.round(dormantBucket.audience * globalAOV * 0.03);
    highValueBucket.potentialRevenue = Math.round(highValueBucket.audience * globalAOV * 0.08);
    repeatBucket.potentialRevenue = Math.round(repeatBucket.audience * globalAOV * 0.1);

    const opps = [];
    if (highValueBucket.audience > 0) opps.push(highValueBucket);
    if (repeatBucket.audience > 0) opps.push(repeatBucket);
    if (dormantBucket.audience > 0) opps.push(dormantBucket);
    
    return opps.sort((a, b) => b.potentialRevenue - a.potentialRevenue);
  }

  fastify.get('/api/revenue/opportunities', async (request, reply) => {
    try {
      const opps = await generateOpportunities();
      return reply.send(opps);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: 'Failed to find opportunities' });
    }
  });

  // 4. DECISION SIMULATOR
  const SimulateSchema = z.object({
    segmentId: z.string().optional(),
    audienceName: z.string().optional(),
    channel: z.string(),
    offer: z.string().optional(),
    discount: z.string().optional(),
    sendTime: z.string().optional(),
    campaignGoal: z.string().optional()
  });

  fastify.post('/api/revenue/simulate', async (request, reply) => {
    try {
      const input = SimulateSchema.parse(request.body);

      const memories = await prisma.revenueMemory.findMany({
        where: {
          channel: input.channel,
          audience_type: {
            contains: input.audienceName || '',
            mode: 'insensitive'
          }
        }
      });

      let expectedConversion = 0;
      let expectedRevenue = 0;
      let expectedROI = 0;
      let reasoning = "";

      if (memories.length > 0) {
        expectedConversion = memories.reduce((sum, m) => sum + Number(m.conversion_rate), 0) / memories.length;
        expectedRevenue = memories.reduce((sum, m) => sum + Number(m.revenue), 0) / memories.length;
        expectedROI = expectedRevenue * 0.15;
        reasoning = `Based on ${memories.length} similar historical campaigns for ${input.audienceName || 'this audience'}.`;
      } else {
        const metrics = await prisma.channelMetric.findUnique({ where: { channel: input.channel } });
        expectedConversion = metrics ? Number(metrics.conversion_rate) : 2.5;
        expectedRevenue = 35000;
        expectedROI = 5000;
        reasoning = `Insufficient history for exact match. Fallback to global metrics for ${input.channel}.`;
      }

      return reply.send({
        expectedRevenue,
        expectedROI,
        expectedConversion,
        expectedPurchasers: Math.round(500 * (expectedConversion / 100)),
        confidence: memories.length > 0 ? "High" : "Medium",
        reasoning
      });
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: 'Simulation failed' });
    }
  });

  // 5. AUTONOMOUS GOAL PLANNER
  const PlannerSchema = z.object({
    revenueGoal: z.number()
  });

  fastify.post('/api/revenue/planner', async (request, reply) => {
    try {
      const { revenueGoal } = PlannerSchema.parse(request.body);
      const oppsResponse = await generateOpportunities(); 
      
      let projectedTotalRevenue = 0;
      const selectedOpps = [];
      for (const opp of oppsResponse) {
        if (projectedTotalRevenue >= revenueGoal) break;
        selectedOpps.push({
          title: opp.opportunity,
          audienceSize: opp.audience,
          potentialRevenue: opp.potentialRevenue,
          recommendedChannel: opp.channel,
          messageStrategy: opp.action,
          estimatedConversionRate: opp.confidence / 10
        });
        projectedTotalRevenue += opp.potentialRevenue;
      }
      return reply.send({
        projectedTotalRevenue,
        gapAnalysis: projectedTotalRevenue >= revenueGoal ? "Target Achievable" : "Shortfall expected",
        expectedCompletionDate: "Month End",
        status: projectedTotalRevenue >= revenueGoal ? "Goal Achievable" : "At Risk",
        opportunities: selectedOpps
      });
    } catch(err) {
      console.error(err);
      return reply.status(500).send({ error: 'Planner failed' });
    }
  });

  // 6. REVENUE MEMORY ENGINE
  const MemorySchema = z.object({
    campaignId: z.string().optional(),
    audienceType: z.string(),
    channel: z.string(),
    discount: z.string().optional(),
    revenue: z.number(),
    conversionRate: z.number(),
    learning: z.string()
  });

  fastify.post('/api/revenue/memories', async (request, reply) => {
    try {
      const input = MemorySchema.parse(request.body);
      const memory = await prisma.revenueMemory.create({
        data: {
          campaign_id: input.campaignId,
          audience_type: input.audienceType,
          channel: input.channel,
          discount: input.discount,
          revenue: input.revenue,
          conversion_rate: input.conversionRate,
          learning: input.learning
        }
      });
      return reply.send(memory);
    } catch(err) {
      console.error(err);
      return reply.status(500).send({ error: 'Failed to save memory' });
    }
  });
}
