import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';

export async function customerRoutes(fastify: FastifyInstance) {
  // GET /api/customers
  fastify.get<{
    Querystring: { limit?: string; offset?: string; search?: string };
  }>('/api/customers', async (request, reply) => {
    const limit = Math.min(Number(request.query.limit || 50), 200);
    const offset = Number(request.query.offset || 0);
    const search = request.query.search;

    const where: Record<string, unknown> = {};
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
      })),
      total,
      limit,
      offset,
    });
  });

  // GET /api/customers/stats
  fastify.get('/api/customers/stats', async (_request, reply) => {
    const [total, avgSpend] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.aggregate({
        _avg: { total_spent: true },
      }),
    ]);

    // get top personas
    const personas = await prisma.persona.findMany({
      include: {
        _count: { select: { customer_personas: true } }
      }
    });

    return reply.send({
      total,
      avg_spend: Math.round(Number(avgSpend._avg.total_spent) || 0),
      personas: personas.map(p => ({
        name: p.name,
        count: p._count.customer_personas
      })).sort((a, b) => b.count - a.count)
    });
  });
}
