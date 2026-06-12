'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCustomers, getCustomerStats, getDynamicPersonas } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Search, Xmark, Mail, Phone, MapPin, Group, WarningTriangle, GraphUp, Strategy, Filter, FastArrowRight } from 'iconoir-react';
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
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'directory' | 'audience'>('directory');
  const LIMIT = 20;

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['customer-stats-full'],
    queryFn: getCustomerStats,
  });

  const { data: listData, isLoading: isListLoading } = useQuery({
    queryKey: ['customers', search, page],
    queryFn: () => getCustomers({ limit: LIMIT, offset: page * LIMIT, search: search || undefined }) as any,
  });

  const { data: personas } = useQuery({
    queryKey: ['dynamic-personas'],
    queryFn: getDynamicPersonas,
  });

  const customers = listData?.customers || [];
  const sortedCustomers = [...customers].sort((a, b) => a.health_score - b.health_score);
  const total = listData?.total || 0;

  return (
    <div className="flex flex-col gap-8 w-full pb-24 relative">
      
      {/* Account Intelligence Drawer */}
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
                   <span className="text-[13px] font-bold text-slate-900 uppercase tracking-wider">Account Brief</span>
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
                        <span className="text-slate-700 font-medium">Confidence Score</span>
                        <span className="font-mono-numbers font-bold text-ink text-right">{confidence}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primary font-medium">Expected Revenue Recovery</span>
                        <span className="font-mono-numbers font-bold text-semantic-success">₹{expectedRec.toLocaleString('en-IN')}</span>
                      </div>
                   </div>
                 </div>

                 <div className="flex flex-col gap-2">
                   <span className="label-text">Contact Channels</span>
                   <div className="flex gap-2 flex-wrap">
                     <span className="text-[12px] bg-canvas-soft border border-hairline px-2 py-1 rounded text-ink font-medium">WhatsApp</span>
                     <span className="text-[12px] bg-canvas-soft border border-hairline px-2 py-1 rounded text-ink font-medium">Email</span>
                     <span className="text-[12px] bg-canvas-soft border border-hairline px-2 py-1 rounded text-ink font-medium">Outbound Call</span>
                   </div>
                 </div>

                 <div className="flex flex-col gap-2">
                   <span className="label-text">Recent Call Activity</span>
                   <div className="bg-canvas border border-hairline rounded-lg p-4 flex flex-col gap-3 text-[13px]">
                     <div className="flex justify-between border-b border-hairline pb-2">
                       <span className="text-ink-muted">Last Call</span>
                       <span className="font-medium text-ink">3 days ago</span>
                     </div>
                     <div className="flex justify-between border-b border-hairline pb-2">
                       <span className="text-ink-muted">Outcome</span>
                       <span className="font-medium text-semantic-success">Interested</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-ink-muted">Next Follow Up</span>
                       <span className="font-medium text-ink">Tomorrow</span>
                     </div>
                   </div>
                 </div>

                 <div className="flex flex-col gap-2">
                   <span className="label-text">Customer Timeline</span>
                   <div className="flex flex-col gap-0 border-l-2 border-hairline ml-2 pl-4 py-1 relative">
                     <div className="relative mb-6">
                       <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-canvas" />
                       <span className="block text-[13px] font-bold text-emerald-600">Purchased Order #8932 (₹2,100)</span>
                       <span className="block text-[11px] font-bold text-ink-muted">10:12 AM today • 47 mins after click</span>
                     </div>
                     <div className="relative mb-6">
                       <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-primary ring-4 ring-canvas" />
                       <span className="block text-[13px] font-medium text-ink">Clicked WhatsApp Link</span>
                       <span className="block text-[11px] font-bold text-ink-muted">09:45 AM today</span>
                     </div>
                     <div className="relative mb-6">
                       <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-primary ring-4 ring-canvas" />
                       <span className="block text-[13px] font-medium text-ink">Opened WhatsApp Message</span>
                       <span className="block text-[11px] font-bold text-ink-muted">09:43 AM today</span>
                     </div>
                     <div className="relative mb-6">
                       <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-muted ring-4 ring-canvas" />
                       <span className="block text-[13px] font-medium text-ink">Delivered via WhatsApp</span>
                       <span className="block text-[11px] font-bold text-ink-muted">09:42 AM today</span>
                     </div>
                     <div className="relative">
                       <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-muted ring-4 ring-canvas" />
                       <span className="block text-[13px] font-medium text-ink">Sent "Dormant VIP Recovery"</span>
                       <span className="block text-[11px] font-bold text-ink-muted">09:41 AM today</span>
                     </div>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-hairline pb-6">
        <div className="flex flex-col gap-1">
          <h1>Customer 360</h1>
          <p className="max-w-2xl">
            Customer-level operational intelligence. Identify at-risk accounts, build audiences, and generate campaigns.
          </p>
        </div>
        {/* Tab Navigation */}
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('directory')}
            className={clsx(
              'px-4 py-2 text-[13px] font-semibold rounded-md transition-colors',
              activeTab === 'directory'
                ? 'bg-ink text-canvas'
                : 'text-ink-muted hover:bg-canvas-soft hover:text-ink'
            )}
          >
            Customer Directory
          </button>
          <button
            onClick={() => setActiveTab('audience')}
            className={clsx(
              'px-4 py-2 text-[13px] font-semibold rounded-md transition-colors',
              activeTab === 'audience'
                ? 'bg-ink text-canvas'
                : 'text-ink-muted hover:bg-canvas-soft hover:text-ink'
            )}
          >
            Audience Builder
          </button>
        </div>
      </div>

      {activeTab === 'audience' ? (
        /* ── AUDIENCE BUILDER TAB ── */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Audience Definition */}
          <div className="lg:col-span-1 flex flex-col gap-6">
             <h2 className="text-[16px] font-semibold text-ink">Audience Definition</h2>
             
             {/* Audience Details & Filters */}
             <div className="border border-hairline rounded-xl bg-canvas shadow-sm p-6 flex flex-col gap-6">
                
                <div className="flex flex-col gap-4">
                   <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-bold text-ink-muted uppercase tracking-wider">Audience Name</label>
                      <input type="text" defaultValue="Dormant High Value Customers" className="bg-canvas-soft border border-hairline rounded-lg px-3 py-2 text-[14px] font-bold text-ink w-full focus:outline-none focus:border-ink-muted" />
                   </div>
                   
                   <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-bold text-ink-muted uppercase tracking-wider">Description</label>
                      <textarea defaultValue="Customers inactive for 60+ days with spend > ₹5000" className="bg-canvas-soft border border-hairline rounded-lg px-3 py-2 text-[13px] text-ink w-full focus:outline-none focus:border-ink-muted resize-none h-16" />
                   </div>
                </div>

                <div className="border-t border-hairline pt-5 flex flex-col gap-4">
                   <span className="text-[12px] font-bold text-ink-muted uppercase tracking-wider">Filters</span>
                   
                   <div className="flex flex-col gap-2">
                     <div className="flex items-center gap-2">
                       <select className="bg-canvas-soft border border-hairline rounded px-2 py-1.5 text-[13px] flex-1 font-medium text-ink">
                         <option>Total Spend</option>
                       </select>
                       <select className="bg-canvas-soft border border-hairline rounded px-2 py-1.5 text-[13px] w-16 text-center">
                         <option>&gt;</option>
                       </select>
                       <input type="text" defaultValue="₹5000" className="bg-canvas-soft border border-hairline rounded px-2 py-1.5 text-[13px] w-20 font-mono" />
                     </div>
                     <div className="flex items-center gap-2 pl-4 border-l-2 border-hairline ml-2 py-1">
                       <span className="text-[11px] font-bold text-ink-muted">AND</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <select className="bg-canvas-soft border border-hairline rounded px-2 py-1.5 text-[13px] flex-1 font-medium text-ink">
                         <option>Last Purchase</option>
                       </select>
                       <select className="bg-canvas-soft border border-hairline rounded px-2 py-1.5 text-[13px] w-16 text-center">
                         <option>&gt;</option>
                       </select>
                       <input type="text" defaultValue="60 Days" className="bg-canvas-soft border border-hairline rounded px-2 py-1.5 text-[13px] w-20 font-mono" />
                     </div>
                     <button className="text-[12px] font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 mt-2 self-start">
                        + Add Condition
                     </button>
                   </div>
                </div>

             </div>

             {/* Audience Snapshot */}
             <div className="border border-hairline rounded-xl bg-canvas shadow-sm p-6 flex flex-col gap-5">
                <span className="text-[13px] font-bold text-ink uppercase tracking-wider">Audience Snapshot</span>
                
                <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                   <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">Customers</span>
                      <span className="text-[18px] font-bold text-ink font-mono-numbers">428</span>
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">Revenue Potential</span>
                      <span className="text-[18px] font-bold text-semantic-success font-mono-numbers">₹1.72L</span>
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">Average Order Value</span>
                      <span className="text-[16px] font-bold text-ink font-mono-numbers">₹4,200</span>
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">Last Purchase Avg</span>
                      <span className="text-[16px] font-bold text-ink font-mono-numbers">78 Days</span>
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">Expected Conversion</span>
                      <span className="text-[16px] font-bold text-ink font-mono-numbers">4.8%</span>
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">Best Channel</span>
                      <span className="text-[14px] font-bold text-ink">WhatsApp</span>
                   </div>
                </div>

                <div className="border-t border-hairline pt-5 mt-1">
                   <button onClick={() => router.push('/chat?audience=dormant_vip')} className="w-full bg-ink hover:bg-ink/90 text-canvas font-bold py-3.5 rounded-lg transition-colors text-[14px] shadow-sm">
                      Generate Campaign
                   </button>
                </div>
             </div>

          </div>

          {/* Right: Recommended Audiences */}
          <div className="lg:col-span-2 flex flex-col gap-6">
             <h2 className="text-[16px] font-semibold text-ink">Recommended Audiences</h2>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {[
                  {
                     id: 'dormant_vip',
                     name: 'Dormant VIP Recovery',
                     count: 428,
                     revenue: '₹1.72L',
                     aov: '₹4200',
                     risk: 'High',
                     channel: 'WhatsApp',
                     goal: 'Win-back'
                  },
                  {
                     id: 'post_purchase',
                     name: 'Post-Purchase Cross-Sell',
                     count: 1240,
                     revenue: '₹94,000',
                     aov: '₹1850',
                     risk: 'Low',
                     channel: 'Email',
                     goal: 'Expansion'
                  },
                  {
                     id: 'weekend_activation',
                     name: 'Weekend Activation',
                     count: 812,
                     revenue: '₹48,000',
                     aov: '₹850',
                     risk: 'Medium',
                     channel: 'SMS',
                     goal: 'Conversion'
                  },
                  {
                     id: 'abandoned_cart',
                     name: 'High-Intent Cart Abandoners',
                     count: 156,
                     revenue: '₹2.1L',
                     aov: '₹8500',
                     risk: 'High',
                     channel: 'WhatsApp',
                     goal: 'Recovery'
                  }
               ].map((aud) => (
                 <div
                   key={aud.id}
                   className="border border-hairline rounded-xl bg-canvas shadow-sm p-6 flex flex-col gap-5 hover:border-ink-muted hover:shadow-md transition-all group"
                 >
                   <div className="flex justify-between items-start">
                     <div className="flex flex-col gap-1.5">
                       <h3 className="text-[16px] font-bold text-ink">{aud.name}</h3>
                       <span className="text-[12px] font-semibold text-ink-muted uppercase tracking-wider">{aud.count.toLocaleString()} Customers</span>
                     </div>
                     <span className={clsx(
                       'text-[11px] font-bold px-2 py-1 rounded uppercase tracking-wider',
                       aud.risk === 'High' ? 'bg-red-50 text-red-700 border border-red-100' : aud.risk === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                     )}>
                       {aud.risk} Risk
                     </span>
                   </div>

                   <div className="grid grid-cols-2 gap-4 bg-canvas-soft rounded-lg p-4 border border-hairline">
                     <div className="flex flex-col gap-1">
                       <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">Revenue Potential</span>
                       <span className="text-[18px] font-bold text-semantic-success font-mono-numbers">{aud.revenue}</span>
                     </div>
                     <div className="flex flex-col gap-1 pl-4 border-l border-hairline">
                       <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">Avg. Order Value</span>
                       <span className="text-[18px] font-bold text-ink font-mono-numbers">{aud.aov}</span>
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 mt-1">
                      <div className="flex flex-col gap-1">
                         <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">Best Channel</span>
                         <span className="text-[13px] font-bold text-ink">{aud.channel}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                         <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">Primary Goal</span>
                         <span className="text-[13px] font-bold text-ink">{aud.goal}</span>
                      </div>
                   </div>

                   <div className="border-t border-hairline pt-4 mt-1 flex justify-between items-center">
                     <span className="text-[13px] font-bold text-ink-muted hover:text-ink cursor-pointer transition-colors">
                        View Audience
                     </span>
                     <button onClick={() => router.push(`/chat?audience=${aud.id}`)} className="text-[13px] font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                       Generate Campaign <FastArrowRight height={14} width={14} />
                     </button>
                   </div>
                 </div>
               ))}
             </div>
          </div>

        </div>
      ) : isStatsLoading ? (
        <div className="flex justify-center py-20 text-ink-muted text-[14px] font-medium">Loading intelligence data...</div>
      ) : stats ? (
        <div className="flex flex-col w-full gap-8">
          
          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200 rounded-[16px] p-6 hover:-translate-y-[2px] hover:shadow-sm transition-all duration-200 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                 <Group height={18} width={18} className="text-slate-500" />
                 <h3 className="text-[14px] font-medium text-slate-600">Customers</h3>
              </div>
              <div className="flex flex-col">
                <span className="text-[40px] font-bold tracking-tight text-slate-950 font-mono-numbers leading-none">{stats.total.toLocaleString()}</span>
              </div>
              <div className="flex flex-col gap-1 pt-4 border-t border-slate-100">
                <span className="text-[13px] text-slate-500 font-medium">100% profiles enriched • ↑ 12% this month</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[16px] p-6 hover:-translate-y-[2px] hover:shadow-sm transition-all duration-200 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                 <WarningTriangle height={18} width={18} className="text-slate-500" />
                 <h3 className="text-[14px] font-medium text-slate-600">Revenue at Risk</h3>
              </div>
              <div className="flex flex-col">
                <span className="text-[40px] font-bold tracking-tight text-slate-950 font-mono-numbers leading-none text-semantic-danger">₹94,500</span>
              </div>
              <div className="flex flex-col gap-1 pt-4 border-t border-slate-100">
                <span className="text-[13px] text-slate-500 font-medium">85 customers require immediate engagement</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[16px] p-6 hover:-translate-y-[2px] hover:shadow-sm transition-all duration-200 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                 <GraphUp height={18} width={18} className="text-slate-500" />
                 <h3 className="text-[14px] font-medium text-slate-600">VIP Revenue</h3>
              </div>
              <div className="flex flex-col">
                <span className="text-[40px] font-bold tracking-tight text-slate-950 font-mono-numbers leading-none">₹3.2M</span>
              </div>
              <div className="flex flex-col gap-1 pt-4 border-t border-slate-100">
                <span className="text-[13px] text-slate-500 font-medium">Top decile retention stable at 94%</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[16px] p-6 hover:-translate-y-[2px] hover:shadow-sm transition-all duration-200 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                 <Strategy height={18} width={18} className="text-slate-500" />
                 <h3 className="text-[14px] font-medium text-slate-600">Average LTV</h3>
              </div>
              <div className="flex flex-col">
                <span className="text-[40px] font-bold tracking-tight text-slate-950 font-mono-numbers leading-none">₹15,703</span>
              </div>
              <div className="flex flex-col gap-1 pt-4 border-t border-slate-100">
                <span className="text-[13px] text-slate-500 font-medium">↑ 8% vs previous quarter</span>
              </div>
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

            <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-5 text-[12px] font-bold text-slate-600 uppercase tracking-wider">Customer</th>
                    <th className="py-3 px-5 text-[12px] font-bold text-slate-600 uppercase tracking-wider">Priority</th>
                    <th className="py-3 px-5 text-[12px] font-bold text-slate-600 uppercase tracking-wider">Health Score</th>
                    <th className="py-3 px-5 text-[12px] font-bold text-slate-600 uppercase tracking-wider">Primary Personas</th>
                    <th className="py-3 px-5 text-[12px] font-bold text-slate-600 uppercase tracking-wider text-right">Next Action</th>
                    <th className="py-3 px-5 text-[12px] font-bold text-slate-600 uppercase tracking-wider text-right">Revenue Potential</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
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
                          <tr key={c.id} onClick={() => setSelectedCustomerId(c.id)} className="cursor-pointer hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-5">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-slate-900 text-[14px]">{c.name}</span>
                                <span className="text-slate-500 text-[13px]">{c.email}</span>
                              </div>
                            </td>
                            <td className="py-4 px-5">
                              <span className={clsx("text-[11px] font-bold px-2 py-1 rounded uppercase", isCritical ? "bg-red-100 text-red-800" : isHigh ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700")}>{priorityStr}</span>
                            </td>
                            <td className="py-4 px-5">
                              <div className="flex flex-col gap-0.5">
                                <span className={clsx("font-mono-numbers font-bold text-[14px]", c.health_score < 40 ? "text-red-600" : c.health_score > 85 ? "text-emerald-600" : "text-slate-900")}>
                                  {c.health_score}
                                </span>
                                <div className="flex items-center gap-1 text-[11px]">
                                  <span className="text-slate-500 font-semibold uppercase">{c.health_score > 85 ? 'Very Loyal' : c.health_score > 60 ? 'Active' : 'At Risk'}</span>
                                  <span className={c.health_score < 40 ? "text-red-600 font-bold" : c.health_score > 85 ? "text-emerald-600 font-bold" : "text-slate-500"}>
                                    {c.health_score < 40 ? '↓↓ Urgent' : c.health_score > 85 ? '↑ Stable' : '↓ Declining'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-5">
                              <div className="flex gap-2 flex-wrap items-center">
                                {c.personas.slice(0, 2).map((p: string) => (
                                  <div key={p} className="badge-persona">
                                    <span className={`w-1.5 h-1.5 rounded-full ${getDotColor(p)}`} />
                                    {p}
                                  </div>
                                ))}
                                {c.personas.length > 2 && (
                                  <span className="text-[10px] text-slate-500 font-bold">+{c.personas.length - 2}</span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-5 text-right">
                              <div className="flex flex-col items-end gap-0.5">
                                <span className="font-bold text-slate-900 text-[14px]">{actionText}</span>
                                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">{confidence} Confidence</span>
                              </div>
                            </td>
                            <td className="py-4 px-5 text-right">
                              <div className="flex flex-col items-end gap-0.5">
                                <span className="font-mono-numbers font-bold text-emerald-600 text-[14px]">₹{expectedRec.toLocaleString('en-IN')}</span>
                                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Expected Impact</span>
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
