import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';

export async function customerRoutes(fastify: FastifyInstance) {
  // GET /api/customers
  fastify.get<{
    Querystring: { limit?: string; offset?: string; search?: string };
  }>('/api/customers', async (request, reply) => {
    const limit = Math.min(Number(request.query.limit || 50), 200);
    const offset = Number(request.query.offset || 0);
    const search = request.query.search;

    const where: Record<string, unknown> = { brand_id: 'drape-co' };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { total_spend: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.customer.count({ where }),
    ]);

    return reply.send({
      customers: customers.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        preferred_channel: c.preferred_channel,
        favorite_category: c.favorite_category,
        discount_affinity: c.discount_affinity,
        preferred_shopping_day: c.preferred_shopping_day,
        total_orders: c.total_orders,
        total_spend: Number(c.total_spend),
        last_order_at: c.last_order_at?.toISOString() ?? null,
        created_at: c.created_at.toISOString(),
      })),
      total,
      limit,
      offset,
    });
  });

  // GET /api/customers/stats
  fastify.get('/api/customers/stats', async (_request, reply) => {
    const [total, channels, avgSpend] = await Promise.all([
      prisma.customer.count({ where: { brand_id: 'drape-co' } }),
      prisma.customer.groupBy({
        by: ['preferred_channel'],
        where: { brand_id: 'drape-co' },
        _count: { preferred_channel: true },
      }),
      prisma.customer.aggregate({
        where: { brand_id: 'drape-co' },
        _avg: { total_spend: true },
      }),
    ]);

    return reply.send({
      total,
      by_channel: channels.map((c) => ({
        channel: c.preferred_channel,
        count: c._count.preferred_channel,
      })),
      avg_spend: Math.round(Number(avgSpend._avg.total_spend) || 0),
    });
  });
}
