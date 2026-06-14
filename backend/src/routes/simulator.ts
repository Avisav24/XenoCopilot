import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';
import { redis } from '../lib/redis';

export async function simulatorRoutes(fastify: FastifyInstance) {
  fastify.post('/api/simulator/run', async (request, reply) => {
    const { campaign_id } = request.body as any;

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaign_id },
      include: { persona: true }
    });

    if (!campaign) {
      return reply.status(404).send({ error: 'Campaign not found' });
    }

    // Acknowledge immediately
    reply.send({ status: 'simulator started' });

    // Run simulator in background
    setTimeout(async () => {
      try {
        await runSimulation(campaign);
      } catch (e) {
        console.error('Simulator error:', e);
      }
    }, 0);
  });
}

export async function runSimulation(campaign: any) {
  // Step 1: Create Communications (fetch target audience limit to 200 to not overload)
  // Assuming persona_id is what we use, or audience_type.
  let customers: any[] = [];
  
  if (campaign.persona_id) {
    const personas = await prisma.customerPersona.findMany({
      where: { persona_id: campaign.persona_id },
      take: campaign.audience_size || 200,
      include: { customer: true }
    });
    customers = personas.map(p => p.customer);
  } else {
    customers = await prisma.customer.findMany({
      take: campaign.audience_size || 200
    });
  }

  if (customers.length === 0) return;

  // FIX: Sync the real number of found customers back to the campaign, overwriting the fake LLM prediction
  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { audience_size: customers.length }
  });

  // Create initial communications
  const commsToCreate = customers.map(c => ({
    campaign_id: campaign.id,
    customer_id: c.id,
    status: 'pending'
  }));

  await prisma.communication.createMany({
    data: commsToCreate
  });

  const comms = await prisma.communication.findMany({
    where: { campaign_id: campaign.id }
  });

  // Base metrics
  const total = comms.length;
  let sent = 0;
  let delivered = 0;
  let opened = 0;
  let clicked = 0;
  let purchased = 0;

  // Define conversion targets from predicted, else default
  const targetConversionRate = campaign.predicted_conversion ? Number(campaign.predicted_conversion) / 100 : 0.05;
  
  // We simulate delivery across a few "ticks"
  // Tick 1: Sent (immediately)
  // Tick 2: Delivered (1s later)
  // Tick 3: Opened (2s later)
  // Tick 4: Clicked (3s later)
  // Tick 5: Purchased (4s later)

  // -- Tick 1: Sent --
  const sentIds = comms.map(c => c.id);
  await updateComms(sentIds, 'sent', 'sent_at');
  sent = sentIds.length;
  await updateCampaignAggregates(campaign.id);
  await sleep(1000);

  // -- Tick 2: Delivered --
  const deliveredIds = getRandomSubset(sentIds, 0.98); // 98% delivery rate
  await updateComms(deliveredIds, 'delivered', 'delivered_at');
  delivered = deliveredIds.length;
  await updateCampaignAggregates(campaign.id);
  await sleep(1500);

  // -- Tick 3: Opened --
  const openedIds = getRandomSubset(deliveredIds, 0.35); // 35% open rate
  await updateComms(openedIds, 'opened', 'opened_at');
  opened = openedIds.length;
  await updateCampaignAggregates(campaign.id);
  await sleep(2000);

  // -- Tick 4: Clicked --
  const clickedIds = getRandomSubset(openedIds, 0.15); // 15% click rate
  await updateComms(clickedIds, 'clicked', 'clicked_at');
  clicked = clickedIds.length;
  await updateCampaignAggregates(campaign.id);
  await sleep(2000);

  // -- Tick 5: Purchased --
  // We want to hit the target conversion rate overall, but let's add some realistic noise (±20%)
  const noise = 0.8 + (Math.random() * 0.4);
  const targetPurchases = Math.ceil(total * (targetConversionRate * noise));
  const purchasedIds = getRandomSubset(clickedIds, targetPurchases / Math.max(1, clickedIds.length)); 
  
  await updateComms(purchasedIds, 'purchased', 'purchased_at');
  purchased = purchasedIds.length;
  await updateCampaignAggregates(campaign.id);

  // Mark campaign completed
  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { status: 'completed' }
  });
}

async function updateComms(ids: string[], status: string, dateField: string) {
  if (ids.length === 0) return;
  await prisma.communication.updateMany({
    where: { id: { in: ids } },
    data: { 
      status,
      [dateField]: new Date()
    }
  });
}

async function updateCampaignAggregates(campaignId: string) {
  // Clear insights cache so UI sees updates
  await redis.del(`insights:${campaignId}`).catch(() => {});

  const stats = await prisma.communication.groupBy({
    by: ['status'],
    where: { campaign_id: campaignId },
    _count: { id: true }
  });

  const statuses = Object.fromEntries(stats.map(s => [s.status, s._count.id]));
  
  const purchasedCount = statuses['purchased'] || 0;

  // Actual Revenue calculation (AOV = 1500 for simplicity of simulator)
  const actualRevenue = purchasedCount * 1500;
  
  // Calculate conversion: purchases / total
  const total = await prisma.communication.count({ where: { campaign_id: campaignId }});
  const actualConversion = total > 0 ? (purchasedCount / total) * 100 : 0;

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      actual_revenue: actualRevenue,
      actual_conversion: actualConversion,
      actual_purchasers: purchasedCount
    }
  });
}

function getRandomSubset(array: string[], ratio: number): string[] {
  // if ratio > 1, cap at 1
  const target = Math.min(array.length, Math.round(array.length * ratio));
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, target);
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
