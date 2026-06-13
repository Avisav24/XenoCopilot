import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const CUSTOMER_COUNT = 300;
const ORDER_COUNT = 1500;

const CATEGORIES = [
  { name: 'Beauty', weight: 40 },
  { name: 'Apparel', weight: 30 },
  { name: 'Footwear', weight: 20 },
  { name: 'Accessories', weight: 10 },
];

const CHANNELS = ['WhatsApp', 'Email', 'SMS'];
const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune'];

const FIRST_NAMES = [
  'Aisha', 'Priya', 'Divya', 'Neha', 'Ananya', 'Kavya', 'Shreya', 'Riya', 'Pooja', 'Meera',
  'Sanya', 'Tanvi', 'Ishaan', 'Arjun', 'Rohan', 'Vikram', 'Amit', 'Rahul', 'Kiran', 'Sunita',
  'Anjali', 'Deepika', 'Nisha', 'Aarav', 'Vihaan', 'Saanvi', 'Diya', 'Aditya', 'Siddharth', 'Zara',
];

const LAST_NAMES = [
  'Sharma', 'Gupta', 'Patel', 'Singh', 'Kumar', 'Verma', 'Joshi', 'Agarwal', 'Mehta', 'Shah',
  'Reddy', 'Nair', 'Iyer', 'Pillai', 'Menon', 'Rao', 'Bose', 'Das', 'Mukherjee', 'Chatterjee',
];

function weightedRandom<T>(items: { name: T; weight: number }[]): T {
  const total = items.reduce((sum, i) => sum + i.weight, 0);
  let rand = Math.random() * total;
  for (const item of items) {
    rand -= item.weight;
    if (rand <= 0) return item.name;
  }
  return items[items.length - 1].name;
}

function randomIndianName(): string {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${first} ${last}`;
}

function randomDaysAgo(minDays: number, maxDays: number): Date {
  const days = minDays + Math.random() * (maxDays - minDays);
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function randomOrderCount(): number {
  const rand = Math.random();
  if (rand < 0.10) return 1;
  if (rand < 0.40) return 2;
  if (rand < 0.65) return 3;
  if (rand < 0.80) return 4;
  if (rand < 0.90) return 5;
  if (rand < 0.96) return 8;
  if (rand < 0.99) return 12;
  return 15;
}

async function main() {
  console.log('🌱 Starting seed...\n');

  console.log('🧹 Cleaning existing data...');
  await prisma.communication.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.campaign.deleteMany({});
  await prisma.customerPersona.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.persona.deleteMany({});
  await prisma.channelMetric.deleteMany({});

  console.log('🎭 Seeding personas...');
  const beautyLoyalists = await prisma.persona.create({ data: { name: 'Beauty Loyalist', description: '70%+ purchases from Beauty category' } });
  const discountHunters = await prisma.persona.create({ data: { name: 'Discount Hunter', description: 'Uses discount in 60%+ of purchases' } });
  const weekendShoppers = await prisma.persona.create({ data: { name: 'Weekend Shopper', description: '70%+ purchases occur Saturday or Sunday' } });
  const vipCustomers = await prisma.persona.create({ data: { name: 'VIP Customer', description: 'Top 5% spenders' } });
  const atRiskCustomers = await prisma.persona.create({ data: { name: 'At Risk Customer', description: 'Health Score below 40' } });
  const newCustomers = await prisma.persona.create({ data: { name: 'New Customer', description: 'Recent first-time buyer' } });

  console.log('📈 Seeding channel metrics...');
  await prisma.channelMetric.createMany({
    data: [
      { channel: 'WhatsApp', ctr: 12.0, open_rate: 65.0, conversion_rate: 2.4 },
      { channel: 'Email', ctr: 5.0, open_rate: 35.0, conversion_rate: 1.2 },
      { channel: 'SMS', ctr: 3.0, open_rate: 20.0, conversion_rate: 0.8 },
    ]
  });

  console.log(`👤 Seeding ${CUSTOMER_COUNT} customers...`);
  const customerData = Array.from({ length: CUSTOMER_COUNT }, () => {
    const name = randomIndianName();
    return {
      name,
      email: `${name.replace(/\s+/g, '.').toLowerCase()}${Math.floor(Math.random() * 100)}@gmail.com`,
      phone: `+91${faker.string.numeric(10)}`,
      city: CITIES[Math.floor(Math.random() * CITIES.length)],
      signup_date: randomDaysAgo(300, 700),
      total_spent: 0,
      last_order_date: null,
      health_score: 100,
      preferred_channel: CHANNELS[Math.floor(Math.random() * CHANNELS.length)]
    };
  });

  const customers = await prisma.$transaction(
    customerData.map((c) => prisma.customer.create({ data: c }))
  );
  console.log(`  ✅ ${customers.length} customers created`);

  // Simulate past campaigns for attribution
  const pastCampaigns = [
    { name: 'Diwali Beauty Bonanza', persona_id: beautyLoyalists.id, channel: 'WhatsApp', opportunity_type: 'Cross-Sell Opportunity' },
    { name: 'Weekend Flash Sale', persona_id: weekendShoppers.id, channel: 'SMS', opportunity_type: 'Discount Conversion' },
    { name: 'VIP Exclusive Preview', persona_id: vipCustomers.id, channel: 'Email', opportunity_type: 'VIP Retention Opportunity' },
    { name: 'We miss you - 20% Off', persona_id: atRiskCustomers.id, channel: 'WhatsApp', opportunity_type: 'Dormant Customer Opportunity' },
  ];

  const dbCampaigns = await Promise.all(
    pastCampaigns.map(c => prisma.campaign.create({ data: { ...c, status: 'sent', created_at: randomDaysAgo(30, 90) } }))
  );

  console.log(`📦 Seeding ${ORDER_COUNT} orders...`);
  const customerOrderCounts = customers.map((c) => ({
    customer: c,
    count: randomOrderCount(),
  }));

  let totalOrders = customerOrderCounts.reduce((sum, c) => sum + c.count, 0);
  while (totalOrders < ORDER_COUNT) {
    customerOrderCounts[Math.floor(Math.random() * customerOrderCounts.length)].count++;
    totalOrders++;
  }
  while (totalOrders > ORDER_COUNT) {
    const idx = Math.floor(Math.random() * customerOrderCounts.length);
    if (customerOrderCounts[idx].count > 1) {
      customerOrderCounts[idx].count--;
      totalOrders--;
    }
  }

  const orderData: any[] = [];
  
  for (const { customer, count } of customerOrderCounts) {
    const isBeautyLoyalist = Math.random() < 0.25;
    const isDiscountHunter = Math.random() < 0.20;
    const isWeekendShopper = Math.random() < 0.15;

    for (let i = 0; i < count; i++) {
      let category = weightedRandom(CATEGORIES);
      if (isBeautyLoyalist && Math.random() < 0.8) category = 'Beauty';

      let discount_used = Math.random() < 0.2;
      if (isDiscountHunter && Math.random() < 0.8) discount_used = true;

      let ordered_at = randomDaysAgo(0, 365);
      if (isWeekendShopper && Math.random() < 0.8) {
        const day = ordered_at.getDay();
        const diff = 6 - day; 
        ordered_at = new Date(ordered_at.getTime() + diff * 24 * 60 * 60 * 1000);
      }

      // Attribute ~40% of orders to a campaign
      let campaign_id = null;
      if (Math.random() < 0.40) {
        campaign_id = dbCampaigns[Math.floor(Math.random() * dbCampaigns.length)].id;
      }

      orderData.push({
        customer_id: customer.id,
        amount: 300 + Math.random() * 5700, // Range 300 to 6000
        category,
        discount_used,
        order_date: ordered_at,
        campaign_id
      });
    }
  }

  const CHUNK = 500;
  for (let i = 0; i < orderData.length; i += CHUNK) {
    const chunk = orderData.slice(i, i + CHUNK);
    await prisma.order.createMany({ data: chunk });
  }
  console.log(`  ✅ ${orderData.length} orders created`);

  console.log('🧠 Computing personas, health scores, and aggregates...');
  
  const allOrders = await prisma.order.findMany();
  const ordersByCustomer = new Map<string, typeof allOrders>();
  for (const o of allOrders) {
    if (!ordersByCustomer.has(o.customer_id)) ordersByCustomer.set(o.customer_id, []);
    ordersByCustomer.get(o.customer_id)!.push(o);
  }

  // Pre-calculate to find VIP threshold
  const customerSpends = customers.map(c => {
    const orders = ordersByCustomer.get(c.id) || [];
    return { id: c.id, spent: orders.reduce((sum, o) => sum + Number(o.amount), 0) };
  }).sort((a, b) => b.spent - a.spent);
  const vipThreshold = customerSpends[Math.floor(customerSpends.length * 0.05)]?.spent || 10000;

  for (const customer of customers) {
    const orders = ordersByCustomer.get(customer.id) || [];
    if (orders.length === 0) continue;

    const totalSpent = orders.reduce((sum, o) => sum + Number(o.amount), 0);
    // Enforce realistic health score distribution:
    // 10% Critical (0-30), 20% At Risk (31-50), 30% Moderate (51-75), 30% Healthy (76-90), 10% Loyal (91-100)
    const randHealth = Math.random();
    let health = 100;
    let targetDaysSince = 0;
    
    if (randHealth < 0.1) {
      health = Math.floor(Math.random() * 31); // 0-30
      targetDaysSince = 120 + Math.floor(Math.random() * 100);
    } else if (randHealth < 0.3) {
      health = Math.floor(31 + Math.random() * 20); // 31-50
      targetDaysSince = 60 + Math.floor(Math.random() * 40);
    } else if (randHealth < 0.6) {
      health = Math.floor(51 + Math.random() * 25); // 51-75
      targetDaysSince = 30 + Math.floor(Math.random() * 25);
    } else if (randHealth < 0.9) {
      health = Math.floor(76 + Math.random() * 15); // 76-90
      targetDaysSince = 15 + Math.floor(Math.random() * 14);
    } else {
      health = Math.floor(91 + Math.random() * 10); // 91-100
      targetDaysSince = Math.floor(Math.random() * 14);
    }

    // Force the max order date to match the target days since last purchase
    const forcedMaxDate = new Date(Date.now() - targetDaysSince * 24 * 60 * 60 * 1000);
    
    // Update the database orders so the actual max date matches
    const latestOrder = orders.sort((a, b) => b.order_date.getTime() - a.order_date.getTime())[0];
    if (latestOrder) {
       await prisma.order.update({
         where: { id: latestOrder.id },
         data: { order_date: forcedMaxDate }
       });
    }

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        total_spent: totalSpent,
        last_order_date: forcedMaxDate,
        health_score: health
      }
    });

    let assignedPersonaCount = 0;

    // Beauty Loyalist
    const beautyOrders = orders.filter(o => o.category === 'Beauty').length;
    if (beautyOrders / orders.length >= 0.7) {
      await prisma.customerPersona.create({ data: { customer_id: customer.id, persona_id: beautyLoyalists.id } });
      assignedPersonaCount++;
    }

    // Discount Hunter
    const discountOrders = orders.filter(o => o.discount_used).length;
    if (discountOrders / orders.length >= 0.6) {
      await prisma.customerPersona.create({ data: { customer_id: customer.id, persona_id: discountHunters.id } });
      assignedPersonaCount++;
    }

    // Weekend Shopper
    const weekendOrders = orders.filter(o => {
      const day = o.order_date.getDay();
      return day === 0 || day === 6;
    }).length;
    if (weekendOrders / orders.length >= 0.7) {
      await prisma.customerPersona.create({ data: { customer_id: customer.id, persona_id: weekendShoppers.id } });
      assignedPersonaCount++;
    }

    // VIP Customer
    if (totalSpent >= vipThreshold) {
      await prisma.customerPersona.create({ data: { customer_id: customer.id, persona_id: vipCustomers.id } });
      assignedPersonaCount++;
    }

    // At Risk Customer
    if (health < 40) {
      await prisma.customerPersona.create({ data: { customer_id: customer.id, persona_id: atRiskCustomers.id } });
      assignedPersonaCount++;
    }
    
    // Fallback: Ensure no blank personas
    if (assignedPersonaCount === 0) {
       await prisma.customerPersona.create({ data: { customer_id: customer.id, persona_id: newCustomers.id } });
    }
  }

  console.log('\n✅ Seed complete!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
