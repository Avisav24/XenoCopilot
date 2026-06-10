import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const CUSTOMER_COUNT = 500;
const ORDER_COUNT = 2500;

// Distribution weights
const CATEGORIES = [
  { name: 'Beauty', weight: 40 },
  { name: 'Apparel', weight: 30 },
  { name: 'Footwear', weight: 20 },
  { name: 'Accessories', weight: 10 },
];

const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune'];

// Indian first + last names
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
  if (rand < 0.05) return 1;
  if (rand < 0.30) return 2;
  if (rand < 0.55) return 3;
  if (rand < 0.75) return 4;
  if (rand < 0.88) return 5;
  if (rand < 0.96) return 6;
  if (rand < 0.99) return 7;
  return 8;
}

async function main() {
  console.log('🌱 Starting seed...\n');

  console.log('🧹 Cleaning existing data...');
  await prisma.communication.deleteMany({});
  await prisma.campaign.deleteMany({});
  await prisma.customerPersona.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.persona.deleteMany({});
  await prisma.channelMetric.deleteMany({});

  // ── Seed Personas ─────────────────────────────────────
  console.log('🎭 Seeding personas...');
  const beautyLoyalists = await prisma.persona.create({
    data: { name: 'Beauty Loyalists', description: '70%+ purchases from Beauty category' }
  });
  const discountHunters = await prisma.persona.create({
    data: { name: 'Discount Hunters', description: 'Frequently purchase when discount exists' }
  });
  const weekendShoppers = await prisma.persona.create({
    data: { name: 'Weekend Shoppers', description: 'Majority of orders placed Saturday/Sunday' }
  });

  // ── Seed Channel Metrics ───────────────────────────────
  console.log('📈 Seeding channel metrics...');
  await prisma.channelMetric.createMany({
    data: [
      { channel: 'WhatsApp', ctr: 12.0, open_rate: 65.0, conversion_rate: 5.0 },
      { channel: 'Email', ctr: 5.0, open_rate: 35.0, conversion_rate: 2.0 },
      { channel: 'SMS', ctr: 3.0, open_rate: 20.0, conversion_rate: 1.0 },
    ]
  });

  // ── Seed Customers ─────────────────────────────────────
  console.log(`👤 Seeding ${CUSTOMER_COUNT} customers...`);
  const customerData = Array.from({ length: CUSTOMER_COUNT }, () => {
    return {
      name: randomIndianName(),
      email: faker.internet.email().toLowerCase(),
      phone: `+91${faker.string.numeric(10)}`,
      city: CITIES[Math.floor(Math.random() * CITIES.length)],
      signup_date: randomDaysAgo(300, 700),
      total_spent: 0,
      last_order_date: null,
    };
  });

  const customers = await prisma.$transaction(
    customerData.map((c) => prisma.customer.create({ data: c }))
  );
  console.log(`  ✅ ${customers.length} customers created`);

  // ── Seed Orders ────────────────────────────────────────
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

  const orderData: Array<{
    customer_id: string;
    amount: number;
    category: string;
    discount_used: boolean;
    order_date: Date;
  }> = [];

  for (const { customer, count } of customerOrderCounts) {
    // Determine user's biases to make them fall into personas
    const isBeautyLoyalist = Math.random() < 0.25;
    const isDiscountHunter = Math.random() < 0.20;
    const isWeekendShopper = Math.random() < 0.15;

    for (let i = 0; i < count; i++) {
      let category = weightedRandom(CATEGORIES);
      if (isBeautyLoyalist && Math.random() < 0.8) category = 'Beauty';

      let discount_used = Math.random() < 0.2;
      if (isDiscountHunter && Math.random() < 0.8) discount_used = true;

      // Force weekend dates for weekend shoppers
      let ordered_at = randomDaysAgo(0, 180);
      if (isWeekendShopper && Math.random() < 0.8) {
        // adjust to nearest saturday
        const day = ordered_at.getDay();
        const diff = 6 - day; // diff to saturday
        ordered_at = new Date(ordered_at.getTime() + diff * 24 * 60 * 60 * 1000);
      }

      orderData.push({
        customer_id: customer.id,
        amount: 300 + Math.random() * 7700,
        category,
        discount_used,
        order_date: ordered_at,
      });
    }
  }

  const CHUNK = 500;
  for (let i = 0; i < orderData.length; i += CHUNK) {
    const chunk = orderData.slice(i, i + CHUNK);
    await prisma.order.createMany({ data: chunk });
  }
  console.log(`  ✅ ${orderData.length} orders created`);

  // ── Compute Personas & Aggregates ────────────────────────
  console.log('🧠 Computing personas and aggregates...');
  
  // Fetch all orders
  const allOrders = await prisma.order.findMany();
  const ordersByCustomer = new Map<string, typeof allOrders>();
  for (const o of allOrders) {
    if (!ordersByCustomer.has(o.customer_id)) ordersByCustomer.set(o.customer_id, []);
    ordersByCustomer.get(o.customer_id)!.push(o);
  }

  let beautyCount = 0;
  let discountCount = 0;
  let weekendCount = 0;

  for (const customer of customers) {
    const orders = ordersByCustomer.get(customer.id) || [];
    if (orders.length === 0) continue;

    const totalSpent = orders.reduce((sum, o) => sum + Number(o.amount), 0);
    const maxDate = new Date(Math.max(...orders.map(o => o.order_date.getTime())));

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        total_spent: totalSpent,
        last_order_date: maxDate,
      }
    });

    // Rule 1: Beauty Loyalists (>=70% Beauty)
    const beautyOrders = orders.filter(o => o.category === 'Beauty').length;
    if (beautyOrders / orders.length >= 0.7) {
      await prisma.customerPersona.create({ data: { customer_id: customer.id, persona_id: beautyLoyalists.id } });
      beautyCount++;
    }

    // Rule 2: Discount Hunters (>=50% discount_used)
    const discountOrders = orders.filter(o => o.discount_used).length;
    if (discountOrders / orders.length >= 0.5) {
      await prisma.customerPersona.create({ data: { customer_id: customer.id, persona_id: discountHunters.id } });
      discountCount++;
    }

    // Rule 3: Weekend Shoppers (>=50% Saturday/Sunday)
    const weekendOrders = orders.filter(o => {
      const day = o.order_date.getDay();
      return day === 0 || day === 6;
    }).length;
    if (weekendOrders / orders.length >= 0.5) {
      await prisma.customerPersona.create({ data: { customer_id: customer.id, persona_id: weekendShoppers.id } });
      weekendCount++;
    }
  }

  console.log('\n✅ Seed complete!\n');
  console.log('📊 Summary:');
  console.log(`   Customers: ${customers.length}`);
  console.log(`   Orders:    ${orderData.length}`);
  console.log(`   Beauty Loyalists: ${beautyCount}`);
  console.log(`   Discount Hunters: ${discountCount}`);
  console.log(`   Weekend Shoppers: ${weekendCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
