import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const c = await prisma.campaign.findFirst({ orderBy: { created_at: 'desc' }});
  if (!c) return;
  console.log("Campaign:", c.name, "Status:", c.status);
  const comms = await prisma.communication.findMany({ where: { campaign_id: c.id }});
  console.log("Comms count:", comms.length);
  const sent = comms.filter(x => x.status === 'sent').length;
  const delivered = comms.filter(x => x.status === 'delivered').length;
  const opened = comms.filter(x => x.status === 'opened').length;
  const clicked = comms.filter(x => x.status === 'clicked').length;
  const purchased = comms.filter(x => x.status === 'purchased').length;
  console.log({sent, delivered, opened, clicked, purchased});
  console.log("Actual rev:", c.actual_revenue, "Purchasers:", c.actual_purchasers);
}

check().catch(console.error).finally(() => prisma.$disconnect());
