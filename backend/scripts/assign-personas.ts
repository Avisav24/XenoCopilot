import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const customers = await prisma.customer.findMany({
    include: { customer_personas: true }
  });

  const personas = await prisma.persona.findMany();
  if (personas.length === 0) {
    console.log("No personas in DB!");
    return;
  }

  const vip = personas.find(p => p.name === 'VIP Customer') || personas[0];
  const dormant = personas.find(p => p.name === 'Dormant Customer') || personas.find(p => p.name.includes('Dormant')) || personas[0];
  const discount = personas.find(p => p.name === 'Discount Hunter') || personas[0];

  let added = 0;
  for (const c of customers) {
    if (c.customer_personas.length === 0) {
      let pId = discount.id;
      if (c.health_score > 80) pId = vip.id;
      else if (c.health_score < 40) pId = dormant.id;

      try {
        await prisma.customerPersona.create({
          data: { customer_id: c.id, persona_id: pId }
        });
        added++;
      } catch (err) {
        // ignore unique constraint
      }
    }
  }

  console.log(`Assigned personas to ${added} customers.`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
