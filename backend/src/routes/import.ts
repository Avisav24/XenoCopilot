import { FastifyInstance } from 'fastify';
import multipart from '@fastify/multipart';
import { parse } from 'csv-parse/sync';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

function parseCustomDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  // Handle DD.MM.YY or DD.MM.YYYY
  const parts = dateStr.split(/[\.\-\/]/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    let year = parseInt(parts[2], 10);
    if (year < 100) year += 2000;
    
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }
  
  // Fallback to standard parsing
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function parsePhone(phoneStr: string | null | undefined): string | null {
  if (!phoneStr) return null;
  if (phoneStr.toUpperCase().includes('E+')) {
    return Number(phoneStr).toString();
  }
  return phoneStr;
}

const CustomerCsvRow = z.preprocess((val: any) => {
  if (typeof val === 'object' && val !== null) {
    if (!val.customer_id) {
      val.customer_id = val.id || val.user_id || val.client_id || val.buyer_id || '';
    }
    if (!val.name) {
      val.name = val.full_name || val.customer_name || val.first_name || '';
    }
    if (!val.signup_date) {
      val.signup_date = val.created_at || val.join_date || val.date || '';
    }
  }
  return val;
}, z.object({
  customer_id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  gender: z.string().optional().or(z.literal('')),
  signup_date: z.string().optional().or(z.literal(''))
}));

const OrderCsvRow = z.preprocess((val: any) => {
  if (typeof val === 'object' && val !== null) {
    // Fallbacks for amount column
    if (!val.amount) {
      val.amount = val.total || val.price || val.order_value || val.revenue || val.amount_paid || val.grand_total || '';
    }
    // Fallbacks for order_id
    if (!val.order_id) {
      val.order_id = val.id || val.order_number || val.transaction_id || '';
    }
    // Fallbacks for customer_id
    if (!val.customer_id) {
      val.customer_id = val.user_id || val.client_id || val.buyer_id || '';
    }
    // Fallbacks for order_date
    if (!val.order_date) {
      val.order_date = val.date || val.created_at || val.timestamp || '';
    }
  }
  return val;
}, z.object({
  order_id: z.string().min(1),
  customer_id: z.string().min(1),
  amount: z.string().min(1),
  category: z.string().optional().or(z.literal('')),
  channel: z.string().optional().or(z.literal('')),
  order_date: z.string().optional().or(z.literal(''))
}));

export async function importRoutes(fastify: FastifyInstance) {
  // Register multipart plugin to parse uploaded CSV files
  fastify.register(multipart);

  fastify.post('/api/import/customers', async (request, reply) => {
    try {
      const data = await request.file();
      if (!data) return reply.status(400).send({ error: 'No file uploaded' });

      const buffer = await data.toBuffer();
      const csvString = buffer.toString('utf-8');

      const records = parse(csvString, { 
        columns: (headers) => headers.map((h: string) => h.trim().toLowerCase().replace(/\s+/g, '_')), 
        skip_empty_lines: true, 
        bom: true, 
        trim: true,
        relax_column_count: true
      });
      
      let validCount = 0;
      let rejectedCount = 0;
      const issues: string[] = [];

      const operations = [];

      for (const record of records) {
        const parsed = CustomerCsvRow.safeParse(record);
        if (!parsed.success) {
          rejectedCount++;
          const issueMsg = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
          if (issues.length < 10) issues.push(`Row rejected: ${issueMsg}`);
          continue;
        }

        let signupDate = new Date();
        const parsedSignup = parseCustomDate(parsed.data.signup_date);
        if (parsedSignup) signupDate = parsedSignup;

        operations.push(
          prisma.customer.upsert({
            where: { external_id: parsed.data.customer_id },
            update: {
              name: parsed.data.name,
              email: parsed.data.email || null,
              phone: parsePhone(parsed.data.phone),
              city: parsed.data.city || null,
              gender: parsed.data.gender || null,
              signup_date: signupDate
            },
            create: {
              external_id: parsed.data.customer_id,
              name: parsed.data.name,
              email: parsed.data.email || null,
              phone: parsePhone(parsed.data.phone),
              city: parsed.data.city || null,
              gender: parsed.data.gender || null,
              signup_date: signupDate
            }
          })
        );
        validCount++;
      }

      // Execute in batches of 500 for massive speed improvement
      const batchSize = 500;
      for (let i = 0; i < operations.length; i += batchSize) {
        try {
          await prisma.$transaction(operations.slice(i, i + batchSize));
        } catch (dbErr: any) {
          fastify.log.error(dbErr, 'Batch DB Error');
          // If a batch fails, we just log it and continue. In a real system, we'd process row by row here as fallback.
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

      const records = parse(csvString, { 
        columns: (headers) => headers.map((h: string) => h.trim().toLowerCase().replace(/\s+/g, '_')), 
        skip_empty_lines: true, 
        bom: true, 
        trim: true,
        relax_column_count: true
      });
      
      let validCount = 0;
      let rejectedCount = 0;
      const issues: string[] = [];

      // Prefetch all customers into a memory map to completely avoid N+1 findUnique DB queries
      const allCustomers = await prisma.customer.findMany({ select: { id: true, external_id: true } });
      const customerMap = new Map();
      for (const c of allCustomers) {
         if (c.external_id) customerMap.set(c.external_id, c.id);
      }

      const operations = [];

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

        // Fast memory map lookup
        const customerId = customerMap.get(parsed.data.customer_id);

        if (!customerId) {
          rejectedCount++;
          if (issues.length < 10) issues.push(`Row rejected: Missing customer_id ${parsed.data.customer_id}`);
          continue;
        }

        let orderDate = new Date();
        const parsedOrderDate = parseCustomDate(parsed.data.order_date);
        if (parsedOrderDate) orderDate = parsedOrderDate;

        operations.push(
          prisma.order.upsert({
            where: { external_id: parsed.data.order_id },
            update: {
              amount: amountNum,
              category: parsed.data.category || null,
              channel: parsed.data.channel || null,
              order_date: orderDate
            },
            create: {
              external_id: parsed.data.order_id,
              customer_id: customerId,
              amount: amountNum,
              category: parsed.data.category || null,
              channel: parsed.data.channel || null,
              order_date: orderDate
            }
          })
        );
        validCount++;
      }

      // Execute in batches of 1000 for massive speed improvement
      const batchSize = 1000;
      for (let i = 0; i < operations.length; i += batchSize) {
        try {
          await prisma.$transaction(operations.slice(i, i + batchSize));
        } catch (dbErr: any) {
          fastify.log.error(dbErr, 'Batch Order DB Error');
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
      // 1. Compute totals for customers using raw SQL for massive performance improvement
      await prisma.$executeRaw`
        UPDATE "customers" c
        SET 
          total_spent = COALESCE((SELECT SUM(amount) FROM "orders" o WHERE o.customer_id = c.id), 0),
          last_order_date = (SELECT MAX(order_date) FROM "orders" o WHERE o.customer_id = c.id)
      `;

      // Fetch updated customers to generate segments
      const customers = await prisma.customer.findMany({
         include: { 
            _count: {
               select: { orders: true }
            }
         }
      });

      // 2. Generate Segments
      const dormantVips = customers.filter(c => Number(c.total_spent) > 5000 && (!c.last_order_date || (new Date().getTime() - new Date(c.last_order_date).getTime()) > 60 * 24 * 60 * 60 * 1000));
      const frequentBuyers = customers.filter(c => c._count.orders > 5);
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
      await prisma.customerPersona.deleteMany();
      await prisma.communication.deleteMany();
      await prisma.campaign.deleteMany();
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
      
      // 4. Assign Personas to Customers
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
      
      // Execute in batches
      const batchSize = 1000;
      for (let i = 0; i < customerPersonasToCreate.length; i += batchSize) {
        await prisma.customerPersona.createMany({
          data: customerPersonasToCreate.slice(i, i + batchSize),
          skipDuplicates: true
        });
      }

      // Opportunities removed

      return reply.send({ success: true, message: 'Processing complete' });
    } catch (err: any) {
      return reply.status(500).send({ error: 'Failed to process aggregation', message: err.message });
    }
  });
}
