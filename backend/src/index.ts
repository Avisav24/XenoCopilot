import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { aiRoutes } from './routes/ai';
import { campaignRoutes } from './routes/campaigns';
import { webhookRoutes } from './routes/webhooks';
import { customerRoutes } from './routes/customers';
import { importRoutes } from './routes/import';
import { prisma } from './lib/prisma';

const server = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true },
    },
  },
});

async function main() {
  // CORS
  await server.register(cors, {
    origin: (origin, cb) => cb(null, true), // Reflect request origin
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Routes
  await server.register(aiRoutes);
  await server.register(campaignRoutes);
  await server.register(webhookRoutes);
  await server.register(customerRoutes);
  await server.register(importRoutes);

  // Health check
  server.get('/health', async () => ({
    status: 'ok',
    service: 'xenocopilot-api',
    timestamp: new Date().toISOString(),
  }));

  // Start
  const port = Number(process.env.PORT || 3001);
  const host = process.env.HOST || '0.0.0.0';

  try {
    await server.listen({ port, host });
    console.log(`\n🚀 XenoCopilot API running at http://${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main().catch(console.error);
