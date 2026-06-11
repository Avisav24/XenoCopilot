'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCustomers, getCustomerStats } from '@/lib/api';
import { MagnifyingGlass, Heart, User, Clock, WarningCircle, Pulse, Users } from '@phosphor-icons/react';
import { clsx } from 'clsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Link from 'next/link';

// Minimal background/text color combos for personas
const PERSONA_COLORS = [
  'bg-blue-50 text-blue-700 border-blue-100',
  'bg-emerald-50 text-emerald-700 border-emerald-100',
  'bg-purple-50 text-purple-700 border-purple-100',
  'bg-orange-50 text-orange-700 border-orange-100',
  'bg-pink-50 text-pink-700 border-pink-100',
  'bg-teal-50 text-teal-700 border-teal-100',
];

function getPersonaColor(persona: string) {
  let hash = 0;
  for (let i = 0; i < persona.length; i++) {
    hash = persona.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PERSONA_COLORS[Math.abs(hash) % PERSONA_COLORS.length];
}

export default function IntelligencePage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const LIMIT = 20;

  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['customer-stats-full'],
    queryFn: getCustomerStats,
  });

  const { data: listData, isLoading: isListLoading } = useQuery({
    queryKey: ['customers', search, page],
    queryFn: () => getCustomers({ limit: LIMIT, offset: page * LIMIT, search: search || undefined }) as any,
  });

  const stats = statsData;
  const customers = listData?.customers || [];
  const total = listData?.total || 0;

  const healthChartData = stats ? [
    { name: '0-20 (Critical)', value: stats.healthDist['0-20'], color: '#e53e3e' },
    { name: '21-40 (At Risk)', value: stats.healthDist['21-40'], color: '#dd6b20' },
    { name: '41-60 (Fair)', value: stats.healthDist['41-60'], color: '#d69e2e' },
    { name: '61-80 (Good)', value: stats.healthDist['61-80'], color: '#319795' },
    { name: '81-100 (Excellent)', value: stats.healthDist['81-100'], color: '#05b169' },
  ] : [];

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8 h-[calc(100vh-4rem)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Users size={54} className="text-primary" />
        <h1 className="text-[32px] font-display font-normal text-ink">Customer Intelligence</h1>
      </div>

      {isStatsLoading ? (
        <div className="h-64 flex items-center justify-center">Loading Intelligence...</div>
      ) : stats ? (
        <>
          {/* Top KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="card p-4 flex flex-col justify-between">
              <p className="text-[12px] font-bold text-muted uppercase tracking-wider mb-2">Total Base</p>
              <p className="text-[28px] font-mono-numbers text-ink leading-none">{stats.total.toLocaleString()}</p>
            </div>
            <div className="card p-4 flex flex-col justify-between">
              <p className="text-[12px] font-bold text-muted uppercase tracking-wider mb-2">Active</p>
              <p className="text-[28px] font-mono-numbers text-semantic-up leading-none">{stats.active.toLocaleString()}</p>
            </div>
            <div className="card p-4 flex flex-col justify-between">
              <p className="text-[12px] font-bold text-muted uppercase tracking-wider mb-2">VIPs</p>
              <p className="text-[28px] font-mono-numbers text-[#d48166] leading-none">{stats.vip.toLocaleString()}</p>
            </div>
            <div className="card p-4 flex flex-col justify-between bg-semantic-down/5 border-semantic-down/20">
              <p className="text-[12px] font-bold text-semantic-down uppercase tracking-wider mb-2">At Risk</p>
              <p className="text-[28px] font-mono-numbers text-semantic-down leading-none">{stats.atRisk.toLocaleString()}</p>
            </div>
            <div className="card p-4 flex flex-col justify-between">
              <p className="text-[12px] font-bold text-muted uppercase tracking-wider mb-2">Dormant</p>
              <p className="text-[28px] font-mono-numbers text-ink leading-none">{stats.dormant.toLocaleString()}</p>
            </div>
            <div className="card p-4 flex flex-col justify-between">
              <p className="text-[12px] font-bold text-muted uppercase tracking-wider mb-2">Avg LTV</p>
              <p className="text-[24px] font-mono-numbers text-ink leading-none">₹{stats.avgLTV.toLocaleString()}</p>
            </div>
            <div className="card p-4 flex flex-col justify-between">
              <p className="text-[12px] font-bold text-muted uppercase tracking-wider mb-2">Avg Order</p>
              <p className="text-[24px] font-mono-numbers text-ink leading-none">₹{stats.avgAOV.toLocaleString()}</p>
            </div>
          </div>

          {/* Deep Insights Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Health Distribution */}
            <div className="card p-6 col-span-1 lg:col-span-1 flex flex-col">
              <h2 className="text-[16px] font-semibold text-ink mb-6 flex items-center gap-2">
                <Pulse size={54} className="text-primary" /> Health Distribution
              </h2>
              <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={healthChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: '1px solid #eee' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {healthChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Personas (Volume) */}
            <div className="card p-6 flex flex-col">
              <h2 className="text-[16px] font-semibold text-ink mb-6 flex items-center gap-2">
                <User size={54} className="text-primary" /> Top Personas (by Volume)
              </h2>
              <div className="flex flex-col gap-4">
                {stats.topPersonas.map((p, i) => (
                  <div key={p.name} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] font-bold text-muted w-4">{i + 1}</span>
                      <span className={clsx("text-[13px] px-2.5 py-1 rounded-md font-medium", getPersonaColor(p.name))}>
                        {p.name}
                      </span>
                    </div>
                    <span className="text-[14px] font-mono-numbers font-medium text-ink">{p.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Personas (Revenue) */}
            <div className="card p-6 flex flex-col">
              <h2 className="text-[16px] font-semibold text-ink mb-6 flex items-center gap-2">
                <Heart size={54} className="text-primary" /> Top Personas (by Revenue)
              </h2>
              <div className="flex flex-col gap-4">
                {stats.topRevenuePersonas.map((p, i) => (
                  <div key={p.name} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] font-bold text-muted w-4">{i + 1}</span>
                      <span className={clsx("text-[13px] px-2.5 py-1 rounded-md font-medium", getPersonaColor(p.name))}>
                        {p.name}
                      </span>
                    </div>
                    <span className="text-[14px] font-mono-numbers font-bold text-semantic-up">₹{p.revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </>
      ) : null}

      {/* Customer Directory Table */}
      <div className="card flex flex-col flex-shrink-0 mt-4 mb-10 overflow-hidden">
        <div className="p-4 border-b border-hairline bg-surface-soft flex justify-between items-center">
          <h2 className="text-[16px] font-semibold text-ink">Customer Database</h2>
          <div className="relative w-64">
            <MagnifyingGlass size={54} className="text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-hairline text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-soft border-b border-hairline text-left">
              <tr>
                <th className="px-6 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Health</th>
                <th className="px-6 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Personas</th>
                <th className="px-6 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">LTV</th>
                <th className="px-6 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Last Order</th>
                <th className="px-6 py-3 text-[11px] font-bold text-muted uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline bg-canvas">
              {isListLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="px-6 py-4"><div className="h-4 skeleton rounded w-full" /></td></tr>
                  ))
                : customers.map((c: any) => {
                    const initials = c.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                    const daysSince = c.last_order_date
                      ? Math.floor((Date.now() - new Date(c.last_order_date).getTime()) / (1000 * 60 * 60 * 24))
                      : null;
                    return (
                      <tr key={c.id} className="hover:bg-surface-soft transition-colors group">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-surface-strong flex items-center justify-center text-ink text-[11px] font-bold flex-shrink-0">
                              {initials}
                            </div>
                            <div>
                              <p className="text-[13px] font-semibold text-ink leading-tight">{c.name}</p>
                              <p className="text-[11px] text-muted">{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <span className={clsx(
                              "text-[14px] font-mono-numbers font-bold",
                              c.health_score < 40 ? "text-semantic-down" : c.health_score > 75 ? "text-semantic-up" : "text-ink"
                            )}>
                              {c.health_score}
                            </span>
                            {c.health_score < 40 && <WarningCircle size={54} className="text-semantic-down" />}
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex gap-1.5 flex-wrap">
                            {c.personas.slice(0, 2).map((p: string) => (
                              <span key={p} className={clsx("text-[10px] px-2 py-0.5 rounded border font-medium", getPersonaColor(p))}>
                                {p}
                              </span>
                            ))}
                            {c.personas.length > 2 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-strong text-muted font-medium">+{c.personas.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-3 text-[13px] font-mono-numbers font-medium text-ink">
                          ₹{c.total_spent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-6 py-3 text-[12px] text-muted">
                          {daysSince !== null ? `${daysSince}d ago` : '—'}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <Link href={`/intelligence/${c.id}`} className="text-[12px] font-semibold text-primary hover:text-primary-active">
                            View 360 →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {total > LIMIT && (
          <div className="p-3 border-t border-hairline flex items-center justify-between bg-surface-soft">
            <p className="text-[12px] text-muted font-medium">
              Showing {page * LIMIT + 1}–{Math.min((page + 1) * LIMIT, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="btn-ghost !px-2 !py-1 text-[12px] disabled:opacity-50">Prev</button>
              <button onClick={() => setPage(page + 1)} disabled={(page + 1) * LIMIT >= total} className="btn-ghost !px-2 !py-1 text-[12px] disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
