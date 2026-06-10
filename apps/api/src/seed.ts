import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// ── Config ────────────────────────────────────────────────
const BRAND_ID = 'drape-co';
const CUSTOMER_COUNT = 500;
const ORDER_COUNT = 2500;

// Distribution weights
const CATEGORIES = [
  { name: 'dresses', weight: 30 },
  { name: 'tops', weight: 25 },
  { name: 'denim', weight: 20 },
  { name: 'accessories', weight: 15 },
  { name: 'footwear', weight: 10 },
];

const CHANNELS = [
  { name: 'email', weight: 40 },
  { name: 'whatsapp', weight: 35 },
  { name: 'sms', weight: 25 },
];

const SHOPPING_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Indian first + last names
const FIRST_NAMES = [
  'Aisha', 'Priya', 'Divya', 'Neha', 'Ananya', 'Kavya', 'Shreya', 'Riya', 'Pooja', 'Meera',
  'Sanya', 'Tanvi', 'Ishaan', 'Arjun', 'Rohan', 'Vikram', 'Amit', 'Rahul', 'Kiran', 'Sunita',
  'Anjali', 'Deepika', 'Nisha', 'Aarav', 'Vihaan', 'Saanvi', 'Diya', 'Aditya', 'Siddharth', 'Zara',
  'Lavanya', 'Kritika', 'Megha', 'Swati', 'Pallavi', 'Rekha', 'Mansi', 'Preeti', 'Shweta', 'Ritika',
  'Akash', 'Nikhil', 'Varun', 'Kunal', 'Harsh', 'Ankit', 'Mohit', 'Saurabh', 'Gaurav', 'Vivek',
];

const LAST_NAMES = [
  'Sharma', 'Gupta', 'Patel', 'Singh', 'Kumar', 'Verma', 'Joshi', 'Agarwal', 'Mehta', 'Shah',
  'Reddy', 'Nair', 'Iyer', 'Pillai', 'Menon', 'Rao', 'Bose', 'Das', 'Mukherjee', 'Chatterjee',
  'Kapoor', 'Malhotra', 'Khanna', 'Chopra', 'Bhatia', 'Bajaj', 'Tiwari', 'Pandey', 'Mishra', 'Dubey',
];

// ── Helpers ───────────────────────────────────────────────
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

// Power distribution: most customers have 2-4 orders, some have 7-8
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

function randomSpend(): number {
  // Simulate a semi-normal distribution between ₹1000 and ₹50000
  const base = 1000 + Math.random() * 24000;
  const boost = Math.random() < 0.1 ? Math.random() * 26000 : 0;
  return Math.round(base + boost);
}

// ── Main ──────────────────────────────────────────────────
async function main() {
  console.log('🌱 Starting seed...\n');

  // Wipe existing drape-co data
  console.log('🧹 Cleaning existing data...');
  await prisma.campaignMessage.deleteMany({ where: { campaign: { brand_id: BRAND_ID } } });
  await prisma.campaign.deleteMany({ where: { brand_id: BRAND_ID } });
  await prisma.order.deleteMany({ where: { brand_id: BRAND_ID } });
  await prisma.customer.deleteMany({ where: { brand_id: BRAND_ID } });

  // ── Seed Customers ─────────────────────────────────────
  console.log(`👤 Seeding ${CUSTOMER_COUNT} customers...`);

  const customerData = Array.from({ length: CUSTOMER_COUNT }, () => {
    const channel = weightedRandom(CHANNELS);
    const category = weightedRandom(CATEGORIES);

    // last_order_at: heavier weight between 30-90 days
    const daysBucket = Math.random();
    let daysAgo: number;
    if (daysBucket < 0.15) daysAgo = Math.random() * 30;          // 15% recent (0-30 days)
    else if (daysBucket < 0.60) daysAgo = 30 + Math.random() * 60; // 45% moderate (30-90 days)
    else daysAgo = 90 + Math.random() * 90;                         // 40% lapsed (90-180 days)

    return {
      brand_id: BRAND_ID,
      name: randomIndianName(),
      email: faker.internet.email().toLowerCase(),
      phone: `+91${faker.string.numeric(10)}`,
      preferred_channel: channel,
      favorite_category: category,
      discount_affinity: Math.random() < 0.40,
      preferred_shopping_day: SHOPPING_DAYS[Math.floor(Math.random() * SHOPPING_DAYS.length)],
      total_orders: 0,
      total_spend: 0,
      last_order_at: randomDaysAgo(daysAgo, daysAgo + 5),
    };
  });

  const customers = await prisma.$transaction(
    customerData.map((c) => prisma.customer.create({ data: c }))
  );

  console.log(`  ✅ ${customers.length} customers created`);

  // ── Seed Orders ────────────────────────────────────────
  console.log(`📦 Seeding ${ORDER_COUNT} orders...`);

  // Distribute orders across customers using power distribution
  const customerOrderCounts = customers.map((c) => ({
    customer: c,
    count: randomOrderCount(),
  }));

  // Normalize to exactly ORDER_COUNT
  let totalOrders = customerOrderCounts.reduce((sum, c) => sum + c.count, 0);
  while (totalOrders < ORDER_COUNT) {
    const idx = Math.floor(Math.random() * customerOrderCounts.length);
    customerOrderCounts[idx].count++;
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
    brand_id: string;
    amount: number;
    category: string;
    channel: string;
    ordered_at: Date;
  }> = [];

  for (const { customer, count } of customerOrderCounts) {
    for (let i = 0; i < count; i++) {
      // Category: 70% matches customer's favorite, 30% random
      const usesFav = Math.random() < 0.70;
      const category = usesFav
        ? (customer.favorite_category || weightedRandom(CATEGORIES))
        : weightedRandom(CATEGORIES);

      orderData.push({
        customer_id: customer.id,
        brand_id: BRAND_ID,
        amount: 300 + Math.random() * 7700, // ₹300–₹8000
        category,
        channel: Math.random() < 0.65 ? 'online' : 'store',
        ordered_at: randomDaysAgo(0, 18 * 30), // spread over 18 months
      });
    }
  }

  // Batch insert orders in chunks of 100
  const CHUNK = 100;
  for (let i = 0; i < orderData.length; i += CHUNK) {
    const chunk = orderData.slice(i, i + CHUNK);
    await prisma.order.createMany({ data: chunk });
    process.stdout.write(`\r  Orders: ${Math.min(i + CHUNK, orderData.length)}/${ORDER_COUNT}`);
  }
  console.log(`\n  ✅ ${orderData.length} orders created`);

  // ── Update Customer Aggregates ─────────────────────────
  console.log('🔄 Updating customer aggregates...');
  for (const customer of customers) {
    const agg = await prisma.order.aggregate({
      where: { customer_id: customer.id },
      _count: { id: true },
      _sum: { amount: true },
    });
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        total_orders: agg._count.id,
        total_spend: agg._sum.amount || 0,
      },
    });
  }

  console.log('\n✅ Seed complete!\n');
  console.log('📊 Summary:');
  console.log(`   Customers: ${customers.length}`);
  console.log(`   Orders:    ${orderData.length}`);
  console.log(`   Brand:     ${BRAND_ID}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
