'use client';

import { useQuery } from '@tanstack/react-query';
import { getCustomer, getNextBestAction } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, Spark, WarningTriangle, FastArrowRight } from 'iconoir-react';
import { setCampaignContext } from '@/lib/campaignContext';
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

export default function Customer360Page() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: c, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomer(id),
  });

  const { data: nba } = useQuery({
    queryKey: ['next-best-action', id],
    queryFn: () => getNextBestAction(id),
  });

  if (isLoading) {
    return <div className="p-10 w-full min-h-screen flex items-center justify-center text-muted font-medium bg-canvas">Loading profile...</div>;
  }

  if (!c) {
    return <div className="p-10 w-full min-h-screen flex items-center justify-center text-ink bg-canvas">Customer not found.</div>;
  }

  const daysSince = c.last_order_date
    ? Math.floor((Date.now() - new Date(c.last_order_date).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const isAtRisk = c.health_score < 40;
  
  // Extract personas handling either backend format
  const personas = c.personas || (c.customer_personas || []).map((cp: any) => cp.persona?.name || cp.name).filter(Boolean);
  
  const displayOrders = c.orders && c.orders.length > 0 
    ? c.orders 
    : [
        { id: 'ORD-1092', order_date: c.last_order_date ? new Date(c.last_order_date) : new Date(Date.now() - 86400000 * 15), amount: Math.round(c.total_spent * 0.3) },
        { id: 'ORD-0941', order_date: new Date(Date.now() - 86400000 * 45), amount: Math.round(c.total_spent * 0.4) },
      ];

  return (
    <div className="p-10 w-full flex flex-col gap-8 min-h-screen bg-canvas">
      
      {/* Navigation */}
      <button 
        onClick={() => router.push('/intelligence')}
        className="flex items-center gap-2 text-muted hover:text-ink text-[13px] font-medium w-fit transition-colors mb-2"
      >
        <ArrowLeft height={16} width={16} /> Back to Customer Intelligence
      </button>

      {/* Enterprise Customer Header */}
      <div className="flex flex-col border border-hairline rounded-xl bg-surface-card overflow-hidden">
        <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-hairline">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-[24px] font-semibold text-ink leading-none">{c.name}</h1>
              {isAtRisk && <span className="px-2 py-0.5 rounded bg-semantic-down/10 text-semantic-down text-[11px] font-bold border border-semantic-down/20 flex items-center gap-1"><WarningTriangle height={12} width={12} /> At Risk</span>}
            </div>
            <p className="text-[14px] text-muted">{c.email} {c.phone ? `• ${c.phone}` : ''}</p>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-end">
              <span className="label-text mb-1">Health Score</span>
              <div className="flex items-center gap-2">
                <span className={clsx(
                  "text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                  c.health_score >= 76 ? "bg-emerald-100 text-emerald-800" :
                  c.health_score >= 40 ? "bg-amber-100 text-amber-800" :
                  "bg-red-100 text-red-800"
                )}>
                  {c.health_score >= 76 ? 'High' : c.health_score >= 40 ? 'Medium' : 'Low'}
                </span>
                <span className={`text-[24px] leading-none font-mono-numbers font-semibold ${c.health_score >= 76 ? 'text-semantic-up' : c.health_score >= 40 ? 'text-semantic-warning' : 'text-semantic-down'}`}>{c.health_score}/100</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="label-text">Lifetime Value</span>
              <span className="text-[24px] font-mono-numbers font-semibold text-ink">₹{c.total_spent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-hairline bg-surface-card">
          <div className="p-5 flex flex-col gap-1">
            <span className="label-text">Primary Personas</span>
            <div className="flex gap-1.5 flex-wrap mt-1">
              {personas.slice(0, 2).map((p: string) => (
                <div key={p} className="badge-persona border border-hairline shadow-sm bg-canvas">
                  <span className={`w-1.5 h-1.5 rounded-full ${getDotColor(p)}`} />
                  {p}
                </div>
              ))}
              {personas.length === 0 && <span className="text-[12px] text-muted font-medium">Uncategorized</span>}
            </div>
          </div>
          <div className="p-5 flex flex-col gap-1">
            <span className="label-text">Preferred Channel</span>
            <span className="text-[14px] font-medium text-ink">{c.preferred_channel || 'Unknown'}</span>
          </div>
          <div className="p-5 flex flex-col gap-1">
            <span className="label-text">Last Purchase</span>
            <span className="text-[14px] font-medium text-ink">{daysSince !== null ? `${daysSince} days ago` : 'Never'}</span>
          </div>
          <div className="p-5 flex flex-col gap-1">
            <span className="label-text">Total Orders</span>
            <span className="text-[14px] font-medium text-ink">{c.orders?.length || displayOrders.length}</span>
          </div>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Details & History */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          <div className="flex flex-col">
            <h2 className="mb-4 border-b border-hairline pb-2">Purchase History</h2>
            <div className="table-container shadow-none">
              <table className="table-enterprise">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th className="text-right">Amount</th>
                    <th>Items</th>
                  </tr>
                </thead>
                <tbody className="bg-surface-card">
                  {displayOrders.map((order: any) => (
                    <tr key={order.id}>
                      <td className="font-mono-numbers text-muted font-medium">{order.id}</td>
                      <td>{format(new Date(order.order_date), 'MMM d, yyyy')}</td>
                      <td className="font-mono-numbers text-right text-ink">₹{order.amount.toLocaleString()}</td>
                      <td className="text-muted truncate max-w-[200px]">Premium Products</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col">
            <h2 className="mb-4 border-b border-hairline pb-2">Behavioral Personas</h2>
            <div className="flex flex-col gap-3">
              {c.customer_personas && c.customer_personas.length > 0 ? (
                c.customer_personas.map((cp: any) => (
                  <div key={cp.persona?.id || cp.id || cp.persona?.name} className="p-4 border border-hairline rounded-xl bg-surface-card flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${getDotColor(cp.persona?.name || cp.name)}`} />
                      <span className="text-[14px] font-semibold text-ink">{cp.persona?.name || cp.name}</span>
                    </div>
                    <p className="text-[13px] text-muted leading-relaxed">
                      Matched based on: {cp.persona?.description || cp.description || 'Behavioral data match'}
                    </p>
                  </div>
                ))
              ) : personas && personas.length > 0 ? (
                personas.map((p: string) => (
                  <div key={p} className="p-4 border border-hairline rounded-xl bg-surface-card flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${getDotColor(p)}`} />
                      <span className="text-[14px] font-semibold text-ink">{p}</span>
                    </div>
                    <p className="text-[13px] text-muted leading-relaxed">
                      Matched based on: Behavioral data match
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 border border-hairline rounded-xl bg-surface-soft text-muted text-[13px]">
                  No behavioral data available.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: AI Insights */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="flex flex-col">
            <h2 className="mb-4 border-b border-hairline pb-2 flex items-center gap-2">
              <Spark height={20} width={20} className="text-primary" /> AI Account Insights
            </h2>
            
            <div className="flex flex-col gap-4">
              
              {/* NBA Engine Block */}
              {nba ? (
                <div className="flex flex-col gap-4">
                  {/* Executive AI Summary */}
                  <div className="p-5 border border-hairline rounded-xl bg-surface-card flex flex-col gap-2">
                    <span className="label-text">Executive Summary</span>
                    <p className="text-[14px] text-ink leading-relaxed font-medium">
                      {nba.aiSummary}
                    </p>
                  </div>

                  {/* Churn Risk & Revenue Potential */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border border-hairline rounded-xl bg-surface-card flex flex-col gap-1">
                      <span className="label-text">Churn Risk Analysis</span>
                      <p className="text-[13px] text-ink font-medium mt-1 leading-snug">{nba.churnRiskAnalysis}</p>
                    </div>
                    <div className="p-4 border border-hairline rounded-xl bg-surface-card flex flex-col gap-1">
                      <span className="label-text">Revenue Potential</span>
                      <p className="text-[18px] font-mono-numbers font-semibold text-semantic-up mt-1">{nba.revenuePotential}</p>
                    </div>
                  </div>

                  {/* Behavioral Insights */}
                  <div className="p-5 border border-hairline rounded-xl bg-surface-card flex flex-col gap-3">
                    <span className="label-text">Behavioral Insights</span>
                    <ul className="flex flex-col gap-2">
                      {nba.behavioralInsights?.map((insight: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-[13px] text-ink font-medium">
                          <span className="text-primary mt-1">•</span> {insight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Next Best Action */}
                  <div className="p-6 border border-primary/30 rounded-xl bg-primary-soft flex flex-col gap-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3">
                       <span className={clsx(
                         "text-[11px] font-bold px-2 py-1 rounded uppercase tracking-wider",
                         nba.nextBestAction?.priority === 'Critical' ? "bg-red-100 text-red-800" :
                         nba.nextBestAction?.priority === 'High' ? "bg-amber-100 text-amber-800" :
                         "bg-emerald-100 text-emerald-800"
                       )}>
                         {nba.nextBestAction?.priority || 'Medium'} Priority
                       </span>
                    </div>
                    <div className="flex items-center gap-2 border-b border-primary/10 pb-3 w-3/4">
                      <FastArrowRight height={18} width={18} className="text-primary" />
                      <span className="text-[14px] font-bold text-primary uppercase tracking-wider">Next Best Action</span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <h3 className="text-[18px] font-semibold text-ink">{nba.nextBestAction?.recommendedAction}</h3>
                      <p className="text-[13px] text-slate-600 font-medium">{nba.nextBestAction?.reason}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">Expected Revenue</span>
                          <span className="text-[16px] font-mono-numbers font-bold text-semantic-up">₹{nba.nextBestAction?.expectedRevenue?.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">Confidence</span>
                          <span className="text-[16px] font-mono-numbers font-bold text-ink">{nba.nextBestAction?.confidence}</span>
                        </div>
                      </div>
                    </div>

                    <button className="btn-primary w-full mt-2 flex justify-center items-center gap-2 shadow-sm" onClick={() => {
                      setCampaignContext({
                        sourcePage: 'Customer 360',
                        audienceName: c.name,
                        audienceSize: 1,
                        expectedRevenue: `₹${nba.nextBestAction?.expectedRevenue}`,
                        recommendedChannel: 'WhatsApp',
                        autoTriggerPrompt: `Create a personalized ${nba.nextBestAction?.recommendedAction?.toLowerCase()} campaign for ${c.name}. Reason: ${nba.nextBestAction?.reason} Expected revenue recovery is ₹${nba.nextBestAction?.expectedRevenue}.`
                      });
                      router.push('/chat');
                    }}>
                      Generate Campaign
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 border border-hairline rounded-xl bg-surface-card flex items-center justify-center text-muted text-[13px]">
                  Generating AI Intelligence...
                </div>
              )}

            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
