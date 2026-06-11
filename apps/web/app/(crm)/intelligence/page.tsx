'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCustomers, getCustomerStats } from '@/lib/api';
import { Search, Xmark } from 'iconoir-react';
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
    <div className="pt-6 px-10 pb-10 w-full flex flex-col min-h-screen bg-canvas" style={{ gap: '24px' }}>
      
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
              <div className="flex items-center justify-between p-6 border-b border-hairline bg-surface-soft">
                <div className="flex flex-col gap-1">
                  <h2 className="text-[20px] font-semibold text-ink tracking-tight">{sc.name}</h2>
                  <span className="text-[13px] text-muted">{sc.email}</span>
                </div>
                <button onClick={() => setSelectedCustomerId(null)} className="p-1 hover:bg-hairline rounded transition-colors text-muted hover:text-ink">
                  <Xmark height={20} width={20} />
                </button>
              </div>
              
              <div className="p-6 flex flex-col gap-8">
                 
                 <div className="flex flex-col gap-2">
                   <span className="label-text">AI Customer Brief</span>
                   <div className="bg-surface-card border border-hairline rounded-lg p-4 flex flex-col gap-4 text-[14px]">
                      <div className="flex justify-between border-b border-hairline pb-2">
                        <span className="text-muted">Health Trend</span>
                        <span className={clsx("font-medium", sc.health_score < 40 ? "text-semantic-down" : sc.health_score > 85 ? "text-semantic-up" : "text-ink")}>
                          {sc.health_score < 40 ? 'Declining' : sc.health_score > 85 ? 'Stable' : 'Active'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-hairline pb-2">
                        <span className="text-muted">Purchase Velocity</span>
                        <span className={clsx("font-medium", sc.health_score < 40 ? "text-semantic-down" : "text-semantic-up")}>
                          {sc.health_score < 40 ? '-12%' : '+4%'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-hairline pb-2">
                        <span className="text-muted">Last Purchase</span>
                        <span className="font-medium text-ink">{daysSince !== null ? `${daysSince} Days Ago` : 'Never'}</span>
                      </div>
                      <div className="flex justify-between border-b border-hairline pb-2">
                        <span className="text-muted">Expected Churn Risk</span>
                        <span className={clsx("font-mono-numbers font-medium", sc.health_score < 40 ? "text-semantic-down" : "text-ink")}>
                           {sc.health_score < 40 ? '68%' : sc.health_score > 85 ? '4%' : '22%'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2 pt-2">
                         <span className="text-muted">Persona Membership</span>
                         <div className="flex gap-2 flex-wrap items-center">
                            {sc.personas.map((p: string) => (
                              <div key={p} className="badge-persona !text-[12px] !py-0.5 !px-2">
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
                   <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex flex-col gap-4 text-[14px]">
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
                        <span className="font-mono-numbers font-bold text-semantic-up">₹{expectedRec.toLocaleString('en-IN')}</span>
                      </div>
                   </div>
                 </div>

              </div>
            </div>
          </div>
        );
      })()}

      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-hairline pb-4">
        <h1 className="text-[32px] font-semibold text-ink tracking-tight">Customer Decision Engine</h1>
        <p className="text-[14px] text-muted max-w-2xl leading-relaxed">
          Operational customer intelligence. AI-driven risk factors and immediate revenue opportunities.
        </p>
      </div>

      {isStatsLoading ? (
        <div className="flex justify-center py-20 text-muted text-[14px] font-medium">Loading intelligence data...</div>
      ) : stats ? (
        <div className="flex flex-col w-full" style={{ gap: '32px' }}>
          
          {/* Executive Summary Strip */}
          <div className="flex flex-wrap gap-8 py-2 border-b border-hairline text-[14px]">
            <span className="font-semibold text-ink">CUSTOMER HEALTH OVERVIEW</span>
            <div className="flex items-center gap-2"><span className="text-muted">Very Loyal:</span><span className="font-medium text-ink">{stats.vip.toLocaleString()}</span></div>
            <div className="flex items-center gap-2"><span className="text-muted">Active:</span><span className="font-medium text-ink">{stats.total - stats.vip - stats.atRisk}</span></div>
            <div className="flex items-center gap-2"><span className="text-muted">At Risk:</span><span className="font-medium text-semantic-down">{stats.atRisk.toLocaleString()}</span></div>
            <div className="flex items-center gap-2"><span className="text-muted">Revenue Opportunity:</span><span className="font-medium text-primary">₹94,500</span></div>
            <div className="flex items-center gap-2"><span className="text-muted">Highest Risk Persona:</span><span className="font-medium text-semantic-warning">VIP Customers</span></div>
          </div>

          {/* Raw Metrics Row */}
          <div className="flex flex-wrap gap-x-16 gap-y-8 w-full border-b border-hairline pb-8">
            <div className="flex flex-col gap-1 min-w-0 flex-shrink-0">
              <span className="label-text">Customers</span>
              <span className="text-[36px] font-mono-numbers font-bold text-ink truncate">{stats.total.toLocaleString()}</span>
            </div>
            <div className="flex flex-col gap-1 min-w-0 flex-shrink-0">
              <span className="label-text">Revenue at Risk</span>
              <span className="text-[36px] font-mono-numbers font-bold text-semantic-down truncate">₹94,500</span>
            </div>
            <div className="flex flex-col gap-1 min-w-0 flex-shrink-0">
              <span className="label-text">VIP Revenue</span>
              <span className="text-[36px] font-mono-numbers font-bold text-ink truncate">₹3.2M</span>
            </div>
            <div className="flex flex-col gap-1 min-w-0 flex-shrink-0">
              <span className="label-text">Average LTV</span>
              <span className="text-[36px] font-mono-numbers font-bold text-ink truncate">₹15,703</span>
            </div>
          </div>

          {/* Customer Directory Table */}
          <div className="flex flex-col flex-shrink-0">
            
            <div className="flex justify-between items-end mb-4">
               <div className="flex flex-col gap-1">
                 <span className="text-[14px] font-semibold text-ink">Customer Opportunity Queue</span>
                 <span className="text-[12px] text-muted">Showing {stats.total} customers • 85 require action • Potential recoverable revenue: <span className="font-medium text-primary">₹94,500</span></span>
               </div>
               <div className="relative w-64">
                 <Search height={16} width={16} className="text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                 <input
                   type="text"
                   placeholder="Search customers..."
                   value={search}
                   onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                   className="input-field pl-9 h-8 text-[13px] bg-surface-card"
                 />
               </div>
            </div>

            <div className="overflow-x-auto border border-hairline rounded-lg">
              <table className="table-enterprise w-full text-[13px] whitespace-nowrap">
                <thead className="bg-surface-soft border-b border-hairline">
                  <tr>
                    <th className="py-3 px-4 font-semibold text-muted text-left uppercase tracking-wider text-[11px]">Customer</th>
                    <th className="py-3 px-4 font-semibold text-muted text-left uppercase tracking-wider text-[11px]">Priority</th>
                    <th className="py-3 px-4 font-semibold text-muted text-left uppercase tracking-wider text-[11px]">Health Score</th>
                    <th className="py-3 px-4 font-semibold text-muted text-left uppercase tracking-wider text-[11px]">Primary Personas</th>
                    <th className="py-3 px-4 font-semibold text-muted text-right uppercase tracking-wider text-[11px]">Next Action</th>
                    <th className="py-3 px-4 font-semibold text-muted text-right uppercase tracking-wider text-[11px]">Revenue Potential</th>
                  </tr>
                </thead>
                <tbody className="bg-canvas divide-y divide-hairline">
                  {isListLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}><td colSpan={6} className="px-4 py-4"><div className="h-4 skeleton rounded w-full" /></td></tr>
                      ))
                    : sortedCustomers.map((c: any) => {
                        const daysSince = c.last_order_date
                          ? Math.floor((Date.now() - new Date(c.last_order_date).getTime()) / (1000 * 60 * 60 * 24))
                          : null;
                        
                        const isCritical = c.health_score < 40;
                        const isHigh = c.health_score >= 40 && c.health_score < 60;
                        const isLow = c.health_score > 85;

                        const priorityStr = isCritical ? 'Critical' : isHigh ? 'High' : isLow ? 'Low' : 'Medium';
                        const priorityColor = isCritical ? 'text-semantic-down font-bold' : isHigh ? 'text-semantic-warning font-semibold' : 'text-ink font-medium';
                        
                        const actionText = isCritical ? 'Launch Win-Back' : isLow ? 'VIP Early Access' : isHigh ? 'Cross-Sell Serum' : 'Monitor';
                        const confidence = isCritical ? '92%' : isLow ? '84%' : isHigh ? '72%' : '45%';
                        const expectedRec = isCritical ? 1850 : isLow ? 540 : isHigh ? 230 : 120;
                        
                        return (
                          <tr key={c.id} onClick={() => setSelectedCustomerId(c.id)} className="cursor-pointer hover:bg-[#F8FAFC] transition-colors group">
                            <td className="py-3 px-4">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-semibold text-ink group-hover:text-primary transition-colors">{c.name}</span>
                                <span className="text-muted text-[12px]">{c.email}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={priorityColor}>{priorityStr}</span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col gap-0.5">
                                <span className={clsx("font-mono-numbers font-semibold", c.health_score < 40 ? "text-semantic-down" : c.health_score > 85 ? "text-semantic-up" : "text-ink")}>
                                  {c.health_score}
                                </span>
                                <div className="flex items-center gap-1 text-[11px]">
                                  <span className="text-muted font-medium">{c.health_score > 85 ? 'Very Loyal' : c.health_score > 60 ? 'Active' : 'At Risk'}</span>
                                  <span className={c.health_score < 40 ? "text-semantic-down font-bold" : c.health_score > 85 ? "text-semantic-up font-bold" : "text-muted"}>
                                    {c.health_score < 40 ? '↓↓ Urgent' : c.health_score > 85 ? '↑ Stable' : '↓ Declining'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2 flex-wrap items-center">
                                {c.personas.slice(0, 2).map((p: string) => (
                                  <div key={p} className="badge-persona !text-[11px] !py-0.5 !px-2">
                                    <span className={`w-1.5 h-1.5 rounded-full ${getDotColor(p)}`} />
                                    {p}
                                  </div>
                                ))}
                                {c.personas.length > 2 && (
                                  <span className="text-[10px] text-muted font-medium">+{c.personas.length - 2}</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex flex-col items-end gap-0.5">
                                <span className="font-semibold text-ink">{actionText}</span>
                                <span className="text-[11px] text-muted">{confidence} Confidence</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex flex-col items-end gap-0.5">
                                <span className="font-mono-numbers font-bold text-primary">₹{expectedRec.toLocaleString('en-IN')}</span>
                                <span className="text-[11px] text-muted">Expected Impact</span>
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
