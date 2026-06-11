import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';

export async function customerRoutes(fastify: FastifyInstance) {
  fastify.get<{
    Querystring: { limit?: string; offset?: string; search?: string };
  }>('/api/customers', async (request, reply) => {
    const limit = Math.min(Number(request.query.limit || 50), 200);
    const offset = Number(request.query.offset || 0);
    const search = request.query.search;

    const where: any = {};
    if (search) {
      const numSearch = !isNaN(Number(search)) && search.trim() !== '' ? Number(search) : undefined;

      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { customer_personas: { some: { persona: { name: { contains: search, mode: 'insensitive' } } } } },
      ];

      if (numSearch !== undefined) {
        where.OR.push({ total_spent: { equals: numSearch } });
      }
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { total_spent: 'desc' },
        take: limit,
        skip: offset,
        include: {
          customer_personas: {
            include: { persona: true }
          }
        }
      }),
      prisma.customer.count({ where }),
    ]);

    return reply.send({
      customers: customers.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        city: c.city,
        personas: c.customer_personas.map(cp => cp.persona.name),
        total_spent: Number(c.total_spent),
        last_order_date: c.last_order_date?.toISOString() ?? null,
        signup_date: c.signup_date.toISOString(),
        health_score: c.health_score,
        preferred_channel: c.preferred_channel
      })),
      total,
      limit,
      offset,
    });
  });

  fastify.get('/api/customers/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        customer_personas: { include: { persona: true } },
        orders: { orderBy: { order_date: 'desc' } }
      }
    });

    if (!customer) return reply.status(404).send({ error: 'Not found' });

    return reply.send({
      ...customer,
      total_spent: Number(customer.total_spent),
      orders: customer.orders.map(o => ({ ...o, amount: Number(o.amount) }))
    });
  });

  fastify.get('/api/personas', async (_request, reply) => {
    const personas = await prisma.persona.findMany({
      orderBy: { name: 'asc' }
    });
    return reply.send(personas);
  });

  fastify.get('/api/customers/stats', async (_request, reply) => {
    // We can compute everything from all customers for this MVP
    const customers = await prisma.customer.findMany({
      include: {
        customer_personas: { include: { persona: true } },
        orders: true
      }
    });

    const now = Date.now();
    let active = 0, atRisk = 0, vip = 0, dormant = 0;
    let totalSpend = 0;
    let totalOrders = 0;
    
    const healthDist = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
    const personaRevenue: Record<string, number> = {};
    const personaCount: Record<string, number> = {};

    for (const c of customers) {
      totalSpend += Number(c.total_spent);
      totalOrders += c.orders.length;

      const daysSince = c.last_order_date ? (now - c.last_order_date.getTime()) / (1000 * 60 * 60 * 24) : 999;
      
      if (daysSince <= 90) active++;
      if (daysSince > 90) dormant++;
      if (c.health_score < 40) atRisk++;

      if (c.health_score <= 20) healthDist['0-20']++;
      else if (c.health_score <= 40) healthDist['21-40']++;
      else if (c.health_score <= 60) healthDist['41-60']++;
      else if (c.health_score <= 80) healthDist['61-80']++;
      else healthDist['81-100']++;

      for (const cp of c.customer_personas) {
        if (cp.persona.name === 'VIP Customer') vip++;
        
        personaCount[cp.persona.name] = (personaCount[cp.persona.name] || 0) + 1;
        personaRevenue[cp.persona.name] = (personaRevenue[cp.persona.name] || 0) + Number(c.total_spent);
      }
    }

    const topPersonas = Object.entries(personaCount)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))
      .slice(0, 5);

    const topRevenuePersonas = Object.entries(personaRevenue)
      .sort((a, b) => b[1] - a[1])
      .map(([name, revenue]) => ({ name, revenue }))
      .slice(0, 5);

    return reply.send({
      total: customers.length,
      active,
      atRisk,
      vip,
      dormant,
      avgLTV: customers.length > 0 ? Math.round(totalSpend / customers.length) : 0,
      avgAOV: totalOrders > 0 ? Math.round(totalSpend / totalOrders) : 0,
      healthDist,
      topPersonas,
      topRevenuePersonas
    });
  });
}
