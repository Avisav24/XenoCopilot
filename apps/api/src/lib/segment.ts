import { prisma } from './prisma';
import type { SegmentRule } from '../types';

/**
 * Converts AI-generated segment rules into Prisma WHERE clauses
 * and queries matching customers.
 */
export async function querySegment(rules: SegmentRule[]) {
  const where: Record<string, unknown> = { brand_id: 'drape-co' };

  const now = new Date();

  for (const rule of rules) {
    switch (rule.field) {
      case 'last_order_days_ago': {
        const days = Number(rule.value);
        const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        if (rule.operator === 'gt') {
          where.last_order_at = { lt: cutoff };
        } else if (rule.operator === 'lt') {
          where.last_order_at = { gt: cutoff };
        } else if (rule.operator === 'gte') {
          where.last_order_at = { lte: cutoff };
        } else if (rule.operator === 'lte') {
          where.last_order_at = { gte: cutoff };
        }
        break;
      }
      case 'total_orders': {
        const val = Number(rule.value);
        where.total_orders = buildNumericFilter(rule.operator, val);
        break;
      }
      case 'total_spend': {
        const val = Number(rule.value);
        where.total_spend = buildNumericFilter(rule.operator, val);
        break;
      }
      case 'favorite_category': {
        if (rule.operator === 'eq') {
          where.favorite_category = String(rule.value);
        } else if (rule.operator === 'in') {
          where.favorite_category = { in: rule.value as string[] };
        }
        break;
      }
      case 'preferred_channel': {
        if (rule.operator === 'eq') {
          where.preferred_channel = String(rule.value);
        } else if (rule.operator === 'in') {
          where.preferred_channel = { in: rule.value as string[] };
        }
        break;
      }
      case 'discount_affinity': {
        where.discount_affinity = rule.value === true || rule.value === 'true';
        break;
      }
    }
  }

  return prisma.customer.findMany({ where });
}

function buildNumericFilter(operator: string, value: number) {
  switch (operator) {
    case 'gt': return { gt: value };
    case 'lt': return { lt: value };
    case 'gte': return { gte: value };
    case 'lte': return { lte: value };
    case 'eq': return { equals: value };
    default: return { equals: value };
  }
}

/**
 * Substitutes template variables in a message body.
 */
export function renderMessage(
  template: string,
  customer: { name: string; favorite_category?: string | null; last_order_at?: Date | null }
): string {
  const daysSince = customer.last_order_at
    ? Math.floor((Date.now() - customer.last_order_at.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return template
    .replace(/\{\{name\}\}/g, customer.name)
    .replace(/\{\{favorite_category\}\}/g, customer.favorite_category || 'fashion')
    .replace(/\{\{days_since_purchase\}\}/g, String(daysSince));
}
