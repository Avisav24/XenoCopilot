'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCustomers } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Search, FastArrowRight, Spark, ArrowRight } from 'iconoir-react';
import { clsx } from 'clsx';
import { setCampaignContext } from '@/lib/campaignContext';

const PERSONA_COLORS: Record<string, string> = {
  'VIP Customer': 'bg-blue-600',
  'Beauty Loyalist': 'bg-pink-600',
  'Discount Hunter': 'bg-amber-600',
  'Weekend Shopper': 'bg-emerald-600',
  'Dormant': 'bg-slate-400',
};

function getDotColor(persona: string) {
  if (PERSONA_COLORS[persona]) return PERSONA_COLORS[persona];
  let hash = 0;
  for (let i = 0; i < persona.length; i++) {
    hash = persona.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-orange-600', 'bg-teal-600'];
  return colors[Math.abs(hash) % colors.length];
}

export default function IntelligencePage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const LIMIT = 20;

  const { data: listData, isLoading: isListLoading } = useQuery({
    queryKey: ['customers', search, '', page],
    queryFn: () => getCustomers({ limit: LIMIT, offset: page * LIMIT, search: search || undefined }) as any,
  });

  const customers = listData?.customers || [];
  const sortedCustomers = [...customers].sort((a, b) => a.health_score - b.health_score);
  const total = listData?.total || 0;

  const handleLaunchCampaign = (name: string, desc: string, audienceSize: number, channel: string) => {
    setCampaignContext({ audienceName: name, recommendedAction: desc, audienceSize, recommendedChannel: channel });
    router.push('/chat');
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 pb-24">
      
      {/* SECTION 1: CUSTOMER INTELLIGENCE HERO */}
      <div className="bg-white border-b border-slate-200 px-10 py-12">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Customer Intelligence</h1>
            <p className="text-[15px] text-slate-500">Highest priority revenue opportunities based on real-time customer behavior.</p>
          </div>

          <div className="border border-emerald-200 bg-emerald-50/50 rounded-2xl p-8 flex flex-col gap-6 relative overflow-hidden shadow-sm mt-4">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Spark height={120} width={120} className="text-emerald-600" />
            </div>
            
            <div className="flex justify-between items-start z-10">
              <div className="flex flex-col gap-2">
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full w-fit">🔥 Highest Revenue Opportunity</span>
                <h2 className="text-[32px] font-bold text-slate-900 tracking-tight leading-none mt-2">Dormant VIP Recovery</h2>
                <div className="flex items-center gap-6 mt-3">
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Audience Size</span>
                    <span className="text-[18px] font-medium text-slate-900">428 Customers</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Potential Revenue</span>
                    <span className="text-[18px] font-bold text-emerald-600 font-mono tracking-tight">₹1.72L</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Recommended Channel</span>
                    <span className="text-[18px] font-medium text-slate-900">WhatsApp</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 mt-4">
                <button 
                  onClick={() => handleLaunchCampaign("Dormant VIP Recovery", "Recover high LTV customers inactive for 60+ days", 428, "WhatsApp")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl text-[14px] font-bold transition-all shadow-sm flex items-center gap-2"
                >
                  Generate Campaign <FastArrowRight height={18} width={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: RECOMMENDED ACTIONS */}
      <div className="px-10 py-12">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
          <h2 className="text-[20px] font-bold text-slate-900 flex items-center gap-2">
            Recommended Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Action 1 */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between group hover:border-blue-300 transition-colors">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-[16px] font-bold text-slate-900 leading-tight">Recover Dormant VIPs</h3>
                  <span className="text-[16px] font-bold text-emerald-600 font-mono">₹1.72L</span>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col gap-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Why This Recommendation?</span>
                  <ul className="flex flex-col gap-1.5">
                    <li className="text-[13px] text-slate-600 flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                      428 high-value customers inactive for 60+ days.
                    </li>
                    <li className="text-[13px] text-slate-600 flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                      Similar recovery campaign generated ₹1.4L.
                    </li>
                    <li className="text-[13px] text-slate-600 flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                      WhatsApp historically converts 2.1x better.
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6">
                <button 
                  onClick={() => handleLaunchCampaign("Recover Dormant VIPs", "Target VIPs inactive for 60 days via WhatsApp", 428, "WhatsApp")}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg text-[13px] font-bold transition-all flex items-center justify-center gap-2"
                >
                  Launch <ArrowRight height={16} width={16} />
                </button>
              </div>
            </div>

            {/* Action 2 */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between group hover:border-blue-300 transition-colors">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-[16px] font-bold text-slate-900 leading-tight">Cross Sell Recent Buyers</h3>
                  <span className="text-[16px] font-bold text-emerald-600 font-mono">₹94K</span>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col gap-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Why This Recommendation?</span>
                  <ul className="flex flex-col gap-1.5">
                    <li className="text-[13px] text-slate-600 flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                      820 customers bought Core Product in last 14 days.
                    </li>
                    <li className="text-[13px] text-slate-600 flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                      High correlation (62%) with Accessory purchase.
                    </li>
                    <li className="text-[13px] text-slate-600 flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                      Email drives highest incremental AOV.
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6">
                <button 
                   onClick={() => handleLaunchCampaign("Cross Sell Recent Buyers", "Email sequence for accessory cross-sell", 820, "Email")}
                  className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 py-2.5 rounded-lg text-[13px] font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  Launch <ArrowRight height={16} width={16} />
                </button>
              </div>
            </div>

            {/* Action 3 */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between group hover:border-blue-300 transition-colors">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-[16px] font-bold text-slate-900 leading-tight">Cart Abandoner Recovery</h3>
                  <span className="text-[16px] font-bold text-emerald-600 font-mono">₹2.1L</span>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col gap-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Why This Recommendation?</span>
                  <ul className="flex flex-col gap-1.5">
                    <li className="text-[13px] text-slate-600 flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                      1,240 high-intent carts abandoned this week.
                    </li>
                    <li className="text-[13px] text-slate-600 flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                      SMS reminder generates 3x recovery rate.
                    </li>
                    <li className="text-[13px] text-slate-600 flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                      No discount required for 40% of this segment.
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6">
                <button 
                  onClick={() => handleLaunchCampaign("Cart Abandoner Recovery", "SMS flow for recent cart abandoners", 1240, "SMS")}
                  className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 py-2.5 rounded-lg text-[13px] font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  Launch <ArrowRight height={16} width={16} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto w-full border-t border-slate-200 my-8"></div>

      {/* SECTION 3: AUDIENCE EXPLORER */}
      <div className="px-10">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-[20px] font-bold text-slate-900">Audience Explorer</h2>
            <div className="relative w-[300px]">
              <Search height={16} width={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-[13px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-5 text-[12px] font-bold text-slate-600 uppercase tracking-wider">Customer</th>
                  <th className="py-3 px-5 text-[12px] font-bold text-slate-600 uppercase tracking-wider">Health Score</th>
                  <th className="py-3 px-5 text-[12px] font-bold text-slate-600 uppercase tracking-wider">Days Since Last Purchase</th>
                  <th className="py-3 px-5 text-[12px] font-bold text-slate-600 uppercase tracking-wider">Primary Personas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isListLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}><td colSpan={4} className="px-4 py-4"><div className="h-4 bg-slate-100 animate-pulse rounded w-full" /></td></tr>
                    ))
                  : sortedCustomers.map((c: any) => {
                      const daysSince = c.last_order_date
                        ? Math.floor((Date.now() - new Date(c.last_order_date).getTime()) / (1000 * 60 * 60 * 24))
                        : 999;
                        
                      let healthLabel = '';
                      if (c.health_score >= 91) healthLabel = 'Very Loyal';
                      else if (c.health_score >= 76) healthLabel = 'Healthy';
                      else if (c.health_score >= 51) healthLabel = 'Needs Attention';
                      else if (c.health_score >= 31) healthLabel = 'At Risk';
                      else healthLabel = 'Critical';
                      
                      return (
                        <tr key={c.id} onClick={() => router.push(`/intelligence/${c.id}`)} className="cursor-pointer hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-slate-900 text-[14px]">{c.name}</span>
                              <span className="text-slate-500 text-[13px]">{c.email}</span>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex flex-col gap-0.5">
                              <span className={clsx("font-mono-numbers font-bold text-[14px]", c.health_score < 40 ? "text-red-600" : c.health_score > 85 ? "text-emerald-600" : "text-slate-900")}>
                                {c.health_score}
                              </span>
                              <div className="flex items-center gap-1 text-[11px]">
                                <span className="text-slate-500 font-semibold uppercase">{healthLabel}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                              <span className="text-[14px] font-medium text-slate-700">
                                {daysSince === 999 ? 'Never' : `${daysSince} Days`}
                              </span>
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex gap-2 flex-wrap items-center">
                              {c.personas.length === 0 && <span className="text-[12px] text-slate-400 font-medium italic">No Persona</span>}
                              {c.personas.slice(0, 2).map((p: string) => (
                                <div key={p} className="flex items-center gap-1.5 border border-slate-200 bg-white px-2 py-0.5 rounded text-[12px] font-medium text-slate-700 shadow-sm">
                                  <span className={`w-1.5 h-1.5 rounded-full ${getDotColor(p)}`} />
                                  {p}
                                </div>
                              ))}
                              {c.personas.length > 2 && (
                                <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded">+{c.personas.length - 2}</span>
                              )}
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
            <div className="mt-2 flex items-center justify-between">
              <p className="text-[12px] text-slate-500 font-medium">
                Showing {page * LIMIT + 1}–{Math.min((page + 1) * LIMIT, total)} of {total}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded text-[12px] font-bold hover:bg-slate-50 disabled:opacity-50">Prev</button>
                <button onClick={() => setPage(page + 1)} disabled={(page + 1) * LIMIT >= total} className="bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded text-[12px] font-bold hover:bg-slate-50 disabled:opacity-50">Next</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
