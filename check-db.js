const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const p = new PrismaClient();
async function main() {
  const finalPersonaId = 'f6d7817d-4b8a-495a-a149-644ef0ab0dd9';
  const campaign = await p.campaign.findFirst({ where: { persona_id: finalPersonaId } });
  
  const fallbackSize = 50; 
  const randomCustomers = await p.$queryRawUnsafe(`SELECT id FROM "customers" ORDER BY random() LIMIT ${fallbackSize}`);
  const targetCustomerIds = randomCustomers.map(c => c.id);
  
  const baseTime = new Date().getTime() - 2 * 60 * 60 * 1000;
  
  const commData = targetCustomerIds.map((custId) => {
    let status = 'sent';
    const r = Math.random();
    if (r < 0.98) status = 'delivered';
    const sent_at = new Date(baseTime + Math.random() * 30 * 60 * 1000);
    return {
      campaign_id: campaign.id,
      customer_id: custId,
      status,
      sent_at
    };
  });
  
  try {
    const result = await p.communication.createMany({ data: commData });
    console.log('Created communications:', result.count);
  } catch (e) {
    console.error('Error creating communications:', e.message);
  }
}
main().catch(console.error).finally(() => p.$disconnect());
