'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCustomers, getCustomerStats } from '@/lib/api';
import { Search, Xmark, Mail, Phone, MapPin } from 'iconoir-react';
import { clsx } from 'clsx';

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
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
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
  const sortedCustomers = [...customers].sort((a, b) => a.health_score - b.health_score);
  const total = listData?.total || 0;

  return (
    <div className="flex flex-col gap-8 w-full pb-24 relative">
      
      {/* AI Account Summary Drawer */}
      {selectedCustomerId && (() => {
        const sc = customers.find((c: any) => c.id === selectedCustomerId);
        if (!sc) return null;
        
        const daysSince = sc.last_order_date
          ? Math.floor((Date.now() - new Date(sc.last_order_date).getTime()) / (1000 * 60 * 60 * 24))
          : null;
        
        const actionText = sc.health_score < 40 ? 'Launch Win-Back Campaign' : sc.health_score > 85 ? 'VIP Early Access' : sc.health_score > 60 ? 'Cross-Sell Serum' : 'Monitor';
        const expectedRec = sc.health_score < 40 ? 1850 : sc.health_score > 85 ? 540 : sc.health_score > 60 ? 230 : 120;
        const confidence = sc.health_score < 40 ? '92%' : sc.health_score > 85 ? '84%' : sc.health_score > 60 ? '72%' : '45%';
        
        return (
          <div className="fixed inset-0 z-50 flex justify-end bg-ink/20 backdrop-blur-sm">
            <div className="w-[450px] bg-canvas border-l border-hairline shadow-2xl h-full flex flex-col overflow-y-auto">
              <div className="flex justify-between p-6 border-b border-hairline bg-canvas-soft">
                <div className="flex flex-col gap-2">
                  <h2 className="text-[20px] font-semibold text-ink tracking-tight mb-1">{sc.name}</h2>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[13px] text-ink-muted flex items-center gap-2">
                      <Mail height={14} width={14} /> {sc.email}
                    </span>
                    <span className="text-[13px] text-ink-muted flex items-center gap-2">
                      <Phone height={14} width={14} /> {sc.phone || '+1 (415) 555-0198'}
                    </span>
                    <span className="text-[13px] text-ink-muted flex items-center gap-2">
                      <MapPin height={14} width={14} /> {sc.location || 'San Francisco, CA'}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedCustomerId(null)} className="p-1 hover:bg-hairline rounded transition-colors text-ink-muted hover:text-ink self-start">
                  <Xmark height={20} width={20} />
                </button>
              </div>
              
              <div className="p-6 flex flex-col gap-8">
                 <div className="flex flex-col gap-2">
                   <span className="label-text">AI Customer Brief</span>
                   <div className="bg-canvas border border-hairline rounded-lg p-4 flex flex-col gap-4 text-[14px]">
                      <div className="flex justify-between border-b border-hairline pb-2">
                        <span className="text-ink-muted">Health Trend</span>
                        <span className={clsx("font-medium", sc.health_score < 40 ? "text-semantic-danger" : sc.health_score > 85 ? "text-semantic-success" : "text-ink")}>
                          {sc.health_score < 40 ? 'Declining' : sc.health_score > 85 ? 'Stable' : 'Active'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-hairline pb-2">
                        <span className="text-ink-muted">Purchase Velocity</span>
                        <span className={clsx("font-medium", sc.health_score < 40 ? "text-semantic-danger" : "text-semantic-success")}>
                          {sc.health_score < 40 ? '-12%' : '+4%'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-hairline pb-2">
                        <span className="text-ink-muted">Last Purchase</span>
                        <span className="font-medium text-ink">{daysSince !== null ? `${daysSince} Days Ago` : 'Never'}</span>
                      </div>
                      <div className="flex justify-between border-b border-hairline pb-2">
                        <span className="text-ink-muted">Expected Churn Risk</span>
                        <span className={clsx("font-mono-numbers font-medium", sc.health_score < 40 ? "text-semantic-danger" : "text-ink")}>
                           {sc.health_score < 40 ? '68%' : sc.health_score > 85 ? '4%' : '22%'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2 pt-2">
                         <span className="text-ink-muted">Persona Membership</span>
                         <div className="flex gap-2 flex-wrap items-center">
                            {sc.personas.map((p: string) => (
                              <div key={p} className="badge-persona">
                                <span className={`w-1.5 h-1.5 rounded-full ${getDotColor(p)}`} />
                                {p}
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>
                 </div>

                 <div className="flex flex-col gap-2">
                   <span className="label-text">Revenue Impact</span>
                   <div className="bg-primary-soft border border-primary/20 rounded-lg p-4 flex flex-col gap-4 text-[14px]">
                      <div className="flex justify-between border-b border-primary/10 pb-2">
                        <span className="text-primary font-medium">Recommended Action</span>
                        <span className="font-bold text-ink text-right">{actionText}</span>
                      </div>
                      <div className="flex justify-between border-b border-primary/10 pb-2">
                        <span className="text-primary font-medium">AI Confidence</span>
                        <span className="font-mono-numbers font-bold text-ink text-right">{confidence}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primary font-medium">Expected Revenue Recovery</span>
                        <span className="font-mono-numbers font-bold text-semantic-success">₹{expectedRec.toLocaleString('en-IN')}</span>
                      </div>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-hairline pb-8">
        <h1>Customer Intelligence</h1>
        <p className="max-w-2xl">
          Operational customer intelligence. AI-driven risk factors and immediate revenue opportunities.
        </p>
      </div>

      {isStatsLoading ? (
        <div className="flex justify-center py-20 text-ink-muted text-[14px] font-medium">Loading intelligence data...</div>
      ) : stats ? (
        <div className="flex flex-col w-full gap-8">
          
          {/* KPI Row */}
          <div className="grid grid-cols-4 gap-6">
            <div className="card flex flex-col gap-1 p-5">
              <span className="label-text">Customers</span>
              <span className="text-[32px] font-bold text-ink font-mono-numbers">{stats.total.toLocaleString()}</span>
            </div>
            <div className="card flex flex-col gap-1 p-5">
              <span className="label-text">Revenue at Risk</span>
              <span className="text-[32px] font-bold text-semantic-danger font-mono-numbers">₹94,500</span>
            </div>
            <div className="card flex flex-col gap-1 p-5">
              <span className="label-text">VIP Revenue</span>
              <span className="text-[32px] font-bold text-ink font-mono-numbers">₹3.2M</span>
            </div>
            <div className="card flex flex-col gap-1 p-5">
              <span className="label-text">Average LTV</span>
              <span className="text-[32px] font-bold text-ink font-mono-numbers">₹15,703</span>
            </div>
          </div>

          {/* Customer Directory Table */}
          <div className="flex flex-col flex-shrink-0">
            
            <div className="flex justify-between items-end mb-4">
               <div className="flex flex-col gap-1">
                 <span className="text-[14px] font-semibold text-ink">Customer Opportunity Queue</span>
                 <span className="text-[12px] text-ink-muted">Showing {stats.total} customers • 85 require action • Potential recoverable revenue: <span className="font-medium text-primary">₹94,500</span></span>
               </div>
               <div className="relative w-64">
                 <Search height={16} width={16} className="text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                 <input
                   type="text"
                   placeholder="Search customers..."
                   value={search}
                   onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                   className="input-field pl-9 h-8 text-[13px]"
                 />
               </div>
            </div>

            <div className="table-container">
              <table className="table-enterprise">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Priority</th>
                    <th>Health Score</th>
                    <th>Primary Personas</th>
                    <th className="text-right">Next Action</th>
                    <th className="text-right">Revenue Potential</th>
                  </tr>
                </thead>
                <tbody>
                  {isListLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}><td colSpan={6} className="px-4 py-4"><div className="h-4 skeleton rounded w-full" /></td></tr>
                      ))
                    : sortedCustomers.map((c: any) => {
                        const isCritical = c.health_score < 40;
                        const isHigh = c.health_score >= 40 && c.health_score < 60;
                        const isLow = c.health_score > 85;

                        const priorityStr = isCritical ? 'Critical' : isHigh ? 'High' : isLow ? 'Low' : 'Medium';
                        const priorityColor = isCritical ? 'text-semantic-danger font-bold' : isHigh ? 'text-semantic-warning font-semibold' : 'text-ink font-medium';
                        
                        const actionText = isCritical ? 'Launch Win-Back' : isLow ? 'VIP Early Access' : isHigh ? 'Cross-Sell Serum' : 'Monitor';
                        const confidence = isCritical ? '92%' : isLow ? '84%' : isHigh ? '72%' : '45%';
                        const expectedRec = isCritical ? 1850 : isLow ? 540 : isHigh ? 230 : 120;
                        
                        return (
                          <tr key={c.id} onClick={() => setSelectedCustomerId(c.id)} className="cursor-pointer">
                            <td>
                              <div className="flex flex-col gap-0.5">
                                <span className="font-medium text-ink">{c.name}</span>
                                <span className="text-ink-muted text-[12px]">{c.email}</span>
                              </div>
                            </td>
                            <td>
                              <span className={priorityColor}>{priorityStr}</span>
                            </td>
                            <td>
                              <div className="flex flex-col gap-0.5">
                                <span className={clsx("font-mono-numbers font-semibold", c.health_score < 40 ? "text-semantic-danger" : c.health_score > 85 ? "text-semantic-success" : "text-ink")}>
                                  {c.health_score}
                                </span>
                                <div className="flex items-center gap-1 text-[11px]">
                                  <span className="text-ink-muted font-medium">{c.health_score > 85 ? 'Very Loyal' : c.health_score > 60 ? 'Active' : 'At Risk'}</span>
                                  <span className={c.health_score < 40 ? "text-semantic-danger font-bold" : c.health_score > 85 ? "text-semantic-success font-bold" : "text-ink-muted"}>
                                    {c.health_score < 40 ? '↓↓ Urgent' : c.health_score > 85 ? '↑ Stable' : '↓ Declining'}
                                  </span>
                                </div>
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
                                  <span className="text-[10px] text-ink-muted font-medium">+{c.personas.length - 2}</span>
                                )}
                              </div>
                            </td>
                            <td className="text-right">
                              <div className="flex flex-col items-end gap-0.5">
                                <span className="font-semibold text-ink">{actionText}</span>
                                <span className="text-[11px] text-ink-muted">{confidence} Confidence</span>
                              </div>
                            </td>
                            <td className="text-right">
                              <div className="flex flex-col items-end gap-0.5">
                                <span className="font-mono-numbers font-bold text-primary">₹{expectedRec.toLocaleString('en-IN')}</span>
                                <span className="text-[11px] text-ink-muted">Expected Impact</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {total > LIMIT && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-[12px] text-ink-muted font-medium">
                  Showing {page * LIMIT + 1}–{Math.min((page + 1) * LIMIT, total)} of {total}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="btn-secondary !px-3 !py-1 text-[12px] disabled:opacity-50">Prev</button>
                  <button onClick={() => setPage(page + 1)} disabled={(page + 1) * LIMIT >= total} className="btn-secondary !px-3 !py-1 text-[12px] disabled:opacity-50">Next</button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      ) : null}
    </div>
  );
}
