'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCustomers, getCustomerStats } from '@/lib/api';
import Link from 'next/link';
import { Search } from 'iconoir-react';

const PERSONA_COLORS: Record<string, string> = {
  'VIP Customer': 'bg-primary',
  'Beauty Loyalist': 'bg-pink-500',
  'Discount Hunter': 'bg-semantic-warning',
  'Weekend Shopper': 'bg-emerald-500',
  'Dormant': 'bg-muted',
};

function getDotColor(persona: string) {
  if (PERSONA_COLORS[persona]) return PERSONA_COLORS[persona];
  let hash = 0;
  for (let i = 0; i < persona.length; i++) {
    hash = persona.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ['bg-primary', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500', 'bg-teal-500'];
  return colors[Math.abs(hash) % colors.length];
}

export default function IntelligencePage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const LIMIT = 20;

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['customer-stats-full'],
    queryFn: getCustomerStats,
  });

  const { data: listData, isLoading: isListLoading } = useQuery({
    queryKey: ['customers', search, page],
    queryFn: () => getCustomers({ limit: LIMIT, offset: page * LIMIT, search: search || undefined }) as any,
  });

  const customers = listData?.customers || [];
  const total = listData?.total || 0;

  return (
    <div className="p-10 w-full flex flex-col gap-10 min-h-screen bg-canvas">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-hairline pb-8">
        <h1>Customer Intelligence</h1>
        <p className="text-[14px] text-muted max-w-2xl leading-relaxed">
          Centralized customer database and behavioral analytics.
        </p>
      </div>

      {isStatsLoading ? (
        <div className="flex justify-center py-20 text-muted text-[14px] font-medium">Loading intelligence data...</div>
      ) : stats ? (
        <div className="flex flex-col gap-10 max-w-6xl">
          
          {/* Top Summary Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-hairline rounded-xl overflow-hidden bg-surface-card">
            <div className="p-5 border-r border-hairline flex flex-col gap-1">
              <span className="label-text">Total Customers</span>
              <span className="text-[20px] font-mono-numbers font-semibold text-ink">{stats.total.toLocaleString()}</span>
            </div>
            <div className="p-5 border-r border-hairline flex flex-col gap-1">
              <span className="label-text">VIP Customers</span>
              <span className="text-[20px] font-mono-numbers font-semibold text-ink">{stats.vip.toLocaleString()}</span>
            </div>
            <div className="p-5 border-r border-hairline flex flex-col gap-1">
              <span className="label-text">At Risk</span>
              <span className="text-[20px] font-mono-numbers font-semibold text-semantic-down">{stats.atRisk.toLocaleString()}</span>
            </div>
            <div className="p-5 flex flex-col gap-1 bg-surface-soft">
              <span className="label-text">Average LTV</span>
              <span className="text-[20px] font-mono-numbers font-semibold text-ink">₹{stats.avgLTV.toLocaleString()}</span>
            </div>
          </div>

          {/* Customer Directory Table */}
          <div className="flex flex-col flex-shrink-0 table-container shadow-none">
            <div className="p-4 border-b border-hairline flex justify-between items-center bg-surface-card">
              <div className="relative w-72">
                <Search height={16} width={16} className="text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customers by name or email..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                  className="input-field pl-9 h-9 text-[13px]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="table-enterprise">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Health Score</th>
                    <th>Primary Personas</th>
                    <th className="text-right">Lifetime Value</th>
                    <th className="text-right">Last Order</th>
                    <th>Next Action</th>
                  </tr>
                </thead>
                <tbody className="bg-surface-card">
                  {isListLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}><td colSpan={7} className="px-4 py-4"><div className="h-4 skeleton rounded w-full" /></td></tr>
                      ))
                    : customers.map((c: any) => {
                        const daysSince = c.last_order_date
                          ? Math.floor((Date.now() - new Date(c.last_order_date).getTime()) / (1000 * 60 * 60 * 24))
                          : null;
                        return (
                          <tr key={c.id}>
                            <td>
                              <Link href={`/intelligence/${c.id}`} className="font-medium text-ink hover:text-primary">
                                {c.name}
                              </Link>
                            </td>
                            <td className="text-muted">{c.email}</td>
                            <td>
                              <div className="flex flex-col">
                                <span className={`font-mono-numbers font-semibold ${c.health_score < 40 ? 'text-semantic-down' : c.health_score > 75 ? 'text-semantic-up' : 'text-ink'}`}>
                                  {c.health_score}
                                </span>
                                <span className="text-[12px] text-muted">
                                  {c.health_score > 85 ? 'Very Loyal' : c.health_score > 60 ? 'Active' : c.health_score > 40 ? 'At Risk' : 'Churn Risk'}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="flex gap-2 flex-wrap items-center">
                                {c.personas.slice(0, 2).map((p: string) => (
                                  <div key={p} className="badge-persona">
                                    <span className={`w-1.5 h-1.5 rounded-full ${getDotColor(p)}`} />
                                    {p}
                                  </div>
                                ))}
                                {c.personas.length > 2 && (
                                  <span className="text-[11px] text-muted font-medium">+{c.personas.length - 2}</span>
                                )}
                              </div>
                            </td>
                            <td className="font-mono-numbers text-right text-ink">
                              ₹{c.total_spent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </td>
                            <td className="text-muted text-right">
                              {daysSince !== null ? `${daysSince}d ago` : '—'}
                            </td>
                            <td>
                              <span className="status-badge bg-surface-soft border-hairline whitespace-nowrap">
                                {c.health_score < 40 ? 'Launch Win-Back' : c.health_score > 85 ? 'VIP Early Access' : c.health_score > 60 ? 'Cross-Sell Serum' : 'Monitor'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {total > LIMIT && (
              <div className="p-3 border-t border-hairline flex items-center justify-between bg-surface-card">
                <p className="text-[12px] text-muted font-medium">
                  Showing {page * LIMIT + 1}–{Math.min((page + 1) * LIMIT, total)} of {total}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="btn-ghost !px-3 !py-1 text-[12px] disabled:opacity-50">Prev</button>
                  <button onClick={() => setPage(page + 1)} disabled={(page + 1) * LIMIT >= total} className="btn-ghost !px-3 !py-1 text-[12px] disabled:opacity-50">Next</button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
