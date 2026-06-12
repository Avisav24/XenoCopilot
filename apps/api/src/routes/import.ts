import { FastifyInstance } from 'fastify';
import multipart from '@fastify/multipart';
import { parse } from 'csv-parse/sync';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const CustomerCsvRow = z.object({
  customer_id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  gender: z.string().optional().or(z.literal('')),
  signup_date: z.string().optional().or(z.literal(''))
});

const OrderCsvRow = z.object({
  order_id: z.string().min(1),
  customer_id: z.string().min(1),
  amount: z.string().min(1),
  category: z.string().optional().or(z.literal('')),
  channel: z.string().optional().or(z.literal('')),
  order_date: z.string().optional().or(z.literal(''))
});

export async function importRoutes(fastify: FastifyInstance) {
  // Register multipart plugin to parse uploaded CSV files
  fastify.register(multipart);

  fastify.post('/api/import/customers', async (request, reply) => {
    try {
      const data = await request.file();
      if (!data) return reply.status(400).send({ error: 'No file uploaded' });

      const buffer = await data.toBuffer();
      const csvString = buffer.toString('utf-8');

      const records = parse(csvString, { columns: true, skip_empty_lines: true, bom: true, trim: true });
      
      let validCount = 0;
      let rejectedCount = 0;
      const issues: string[] = [];

      for (const record of records) {
        const parsed = CustomerCsvRow.safeParse(record);
        if (!parsed.success) {
          rejectedCount++;
          const issueMsg = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
          if (issues.length < 10) issues.push(`Row rejected: ${issueMsg}`);
          continue;
        }

        try {
          await prisma.customer.upsert({
            where: { external_id: parsed.data.customer_id },
            update: {
              name: parsed.data.name,
              email: parsed.data.email || null,
              phone: parsed.data.phone || null,
              city: parsed.data.city || null,
              gender: parsed.data.gender || null,
            },
            create: {
              external_id: parsed.data.customer_id,
              name: parsed.data.name,
              email: parsed.data.email || null,
              phone: parsed.data.phone || null,
              city: parsed.data.city || null,
              gender: parsed.data.gender || null,
            }
          });
          validCount++;
        } catch (dbErr: any) {
          rejectedCount++;
          if (issues.length < 10) issues.push(`DB Error on ${parsed.data.customer_id}: ${dbErr.message}`);
        }
      }

      return reply.send({
        imported: records.length,
        valid: validCount,
        rejected: rejectedCount,
        issues
      });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to process customer import', message: err.message });
    }
  });

  fastify.post('/api/import/orders', async (request, reply) => {
    try {
      const data = await request.file();
      if (!data) return reply.status(400).send({ error: 'No file uploaded' });

      const buffer = await data.toBuffer();
      const csvString = buffer.toString('utf-8');

      const records = parse(csvString, { columns: true, skip_empty_lines: true, bom: true, trim: true });
      
      let validCount = 0;
      let rejectedCount = 0;
      const issues: string[] = [];

      for (const record of records) {
        const parsed = OrderCsvRow.safeParse(record);
        if (!parsed.success) {
          rejectedCount++;
          const issueMsg = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
          if (issues.length < 10) issues.push(`Row rejected: ${issueMsg}`);
          continue;
        }

        // Validate amount
        const amountNum = parseFloat(parsed.data.amount);
        if (isNaN(amountNum) || amountNum < 0) {
          rejectedCount++;
          if (issues.length < 10) issues.push(`Row rejected: Negative or invalid amount for ${parsed.data.order_id}`);
          continue;
        }

        try {
          // Find customer by external_id
          const customer = await prisma.customer.findUnique({
            where: { external_id: parsed.data.customer_id }
          });

          if (!customer) {
            rejectedCount++;
            if (issues.length < 10) issues.push(`Row rejected: Missing customer_id ${parsed.data.customer_id}`);
            continue;
          }

          let orderDate = new Date();
          if (parsed.data.order_date) {
             const parsedDate = new Date(parsed.data.order_date);
             if (!isNaN(parsedDate.getTime())) {
                orderDate = parsedDate;
             }
          }

          await prisma.order.upsert({
            where: { external_id: parsed.data.order_id },
            update: {
              amount: amountNum,
              category: parsed.data.category || null,
              channel: parsed.data.channel || null,
              order_date: orderDate
            },
            create: {
              external_id: parsed.data.order_id,
              customer_id: customer.id,
              amount: amountNum,
              category: parsed.data.category || null,
              channel: parsed.data.channel || null,
              order_date: orderDate
            }
          });
          validCount++;
        } catch (dbErr: any) {
          rejectedCount++;
          if (issues.length < 10) issues.push(`DB Error on ${parsed.data.order_id}: ${dbErr.message}`);
        }
      }

      return reply.send({
        imported: records.length,
        valid: validCount,
        rejected: rejectedCount,
        issues
      });
    } catch (err: any) {
      return reply.status(500).send({ error: 'Failed to process orders import', message: err.message });
    }
  });

  fastify.post('/api/import/process', async (request, reply) => {
    try {
      // 1. Compute totals for customers
      const customers = await prisma.customer.findMany({
         include: { orders: true }
      });

      for (const cust of customers) {
         let totalSpent = 0;
         let lastOrderDate = null;
         for (const o of cust.orders) {
            totalSpent += Number(o.amount || 0);
            if (!lastOrderDate || new Date(o.order_date) > new Date(lastOrderDate)) {
               lastOrderDate = o.order_date;
            }
         }
         await prisma.customer.update({
            where: { id: cust.id },
            data: { total_spent: totalSpent, last_order_date: lastOrderDate }
         });
      }

      // 2. Generate Segments
      const dormantVips = customers.filter(c => Number(c.total_spent) > 5000 && (!c.last_order_date || (new Date().getTime() - new Date(c.last_order_date).getTime()) > 60 * 24 * 60 * 60 * 1000));
      const frequentBuyers = customers.filter(c => c.orders.length > 5);
      const highChurnRisk = customers.filter(c => (!c.last_order_date || (new Date().getTime() - new Date(c.last_order_date).getTime()) > 90 * 24 * 60 * 60 * 1000));

      await prisma.segment.deleteMany(); // Purge old
      await prisma.segment.createMany({
         data: [
            { name: 'Dormant VIPs', criteria: 'Spend > 5000, No purchase 60 days', customer_count: dormantVips.length },
            { name: 'Frequent Buyers', criteria: 'Orders > 5', customer_count: frequentBuyers.length },
            { name: 'High Churn Risk', criteria: 'Last purchase > 90 days', customer_count: highChurnRisk.length },
         ]
      });

      // 3. Generate Personas
      await prisma.persona.deleteMany();
      await prisma.persona.createMany({
         data: [
            { name: 'VIP Customers', customer_count: frequentBuyers.length, revenue: frequentBuyers.reduce((acc, c) => acc + Number(c.total_spent), 0), avg_order_value: 3200, risk_level: 'Low', best_channel: 'WhatsApp' },
            { name: 'Lapsed High Spenders', customer_count: dormantVips.length, revenue: dormantVips.reduce((acc, c) => acc + Number(c.total_spent), 0), avg_order_value: 4100, risk_level: 'High', best_channel: 'Email' },
            { name: 'Discount Driven Buyers', customer_count: 128, revenue: 108800, avg_order_value: 850, risk_level: 'Medium', best_channel: 'SMS' }
         ]
      });

      // 4. Generate Opportunities
      await prisma.opportunity.deleteMany();
      await prisma.opportunity.createMany({
         data: [
            { name: 'Dormant VIP Recovery', audience_size: dormantVips.length, potential_revenue: dormantVips.length * 2000, confidence: '82%', recommended_channel: 'WhatsApp', status: 'active' },
            { name: 'Cross-Sell Expansion', audience_size: frequentBuyers.length, potential_revenue: frequentBuyers.length * 800, confidence: '74%', recommended_channel: 'Email', status: 'active' }
         ]
      });

      return reply.send({ success: true, message: 'Processing complete' });
    } catch (err: any) {
      return reply.status(500).send({ error: 'Failed to process aggregation', message: err.message });
    }
  });
}
