import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Fetching customers...");
  const customers = await prisma.customer.findMany({
    include: { _count: { select: { orders: true } } }
  });

  const frequentBuyers = customers.filter(c => c._count.orders > 5);
  const dormantVips = customers.filter(c => Number(c.total_spent) > 5000 && (!c.last_order_date || (new Date().getTime() - new Date(c.last_order_date).getTime()) > 60 * 24 * 60 * 60 * 1000));

  console.log("Generating personas...");
  await prisma.customerPersona.deleteMany();
  await prisma.persona.deleteMany();
  
  const newPersonas = [
    { name: 'VIP Customers', customer_count: frequentBuyers.length, revenue: frequentBuyers.reduce((acc, c) => acc + Number(c.total_spent), 0), avg_order_value: 3200, risk_level: 'Low', best_channel: 'WhatsApp' },
    { name: 'Lapsed High Spenders', customer_count: dormantVips.length, revenue: dormantVips.reduce((acc, c) => acc + Number(c.total_spent), 0), avg_order_value: 4100, risk_level: 'High', best_channel: 'Email' },
    { name: 'Discount Hunters', customer_count: 128, revenue: 108800, avg_order_value: 850, risk_level: 'Medium', best_channel: 'SMS' },
    { name: 'Beauty Loyalists', customer_count: Math.floor(customers.length * 0.2), revenue: 150000, avg_order_value: 2000, risk_level: 'Low', best_channel: 'WhatsApp' },
    { name: 'Bluemoon Shoppers', customer_count: Math.floor(customers.length * 0.15), revenue: 45000, avg_order_value: 900, risk_level: 'High', best_channel: 'Email' },
    { name: 'Trendsetters', customer_count: Math.floor(customers.length * 0.1), revenue: 210000, avg_order_value: 4500, risk_level: 'Low', best_channel: 'WhatsApp' }
  ];
  
  await prisma.persona.createMany({ data: newPersonas });
  
  const savedPersonas = await prisma.persona.findMany();
  const pMap: Record<string, string> = {};
  savedPersonas.forEach(p => pMap[p.name] = p.id);
  
  const customerPersonasToCreate: any[] = [];
  
  for (const c of customers) {
    const spent = Number(c.total_spent);
    const orderCount = c._count.orders;
    const daysSince = c.last_order_date ? (new Date().getTime() - new Date(c.last_order_date).getTime()) / (1000 * 3600 * 24) : 999;
    
    let assigned = 0;
    
    if (orderCount >= 5 && spent > 5000) {
      customerPersonasToCreate.push({ customer_id: c.id, persona_id: pMap['VIP Customers'] });
      assigned++;
    }
    if (daysSince > 90 && spent > 2000) {
      customerPersonasToCreate.push({ customer_id: c.id, persona_id: pMap['Lapsed High Spenders'] });
      assigned++;
    }
    if (spent < 3000 || assigned === 0) {
      customerPersonasToCreate.push({ customer_id: c.id, persona_id: pMap['Discount Hunters'] });
    }
    if (orderCount >= 2 && spent >= 2000 && Math.random() > 0.5) {
      customerPersonasToCreate.push({ customer_id: c.id, persona_id: pMap['Beauty Loyalists'] });
    }
    if (orderCount === 1 && daysSince > 60) {
      customerPersonasToCreate.push({ customer_id: c.id, persona_id: pMap['Bluemoon Shoppers'] });
    }
    if (spent > 8000) {
      customerPersonasToCreate.push({ customer_id: c.id, persona_id: pMap['Trendsetters'] });
    }
  }
  
  console.log(`Assigning ${customerPersonasToCreate.length} personas...`);
  const batchSize = 1000;
  for (let i = 0; i < customerPersonasToCreate.length; i += batchSize) {
    await prisma.customerPersona.createMany({
      data: customerPersonasToCreate.slice(i, i + batchSize),
      skipDuplicates: true
    });
  }
  
  console.log("Done.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
