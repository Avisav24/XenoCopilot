import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';

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
      totalRevenueInfluenced,
      customersReactivated,
      atRiskSaved,
      topPersona,
      topChannel,
      revenueByCampaign: formatTop(revenueByCampaign),
      revenueByPersona: formatTop(revenueByPersona),
      revenueByOpportunity: formatTop(revenueByOpportunity),
      channelIntelligence: Object.entries(revenueByChannel).map(([channel, stats]) => ({
        channel,
        revenue: stats.revenue,
        ctr: stats.ctr,
        conversion: stats.conversion
      })).sort((a, b) => b.revenue - a.revenue)
    });
  });
}
