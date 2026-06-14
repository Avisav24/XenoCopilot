import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { redis } from './src/lib/redis';

async function check() {
  const c = await prisma.campaign.findFirst({ orderBy: { created_at: 'desc' }});
  if (!c) return;
  
  const res = await fetch(`http://localhost:3000/api/campaigns/${c.id}/insights`);
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text.substring(0, 500));
}

check().catch(console.error).finally(() => { prisma.$disconnect(); redis.quit(); });
