'use client';

import { useQuery } from '@tanstack/react-query';
import { getCustomer, getNextBestAction } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, Spark, WarningTriangle, FastArrowRight } from 'iconoir-react';
import { setCampaignContext } from '@/lib/campaignContext';

const PERSONA_COLORS: Record<string, string> = {
  'VIP Customer': 'bg-primary',
  'Beauty Loyalist': 'bg-pink-500',
  'Discount Hunter': 'bg-semantic-warning',
  'Weekend Shopper': 'bg-emerald-500',
  'Dormant': 'bg-muted',
};

function getDotColor(persona: string) {
  if (PERSONA_COLORS[persona]) return PERSONA_COLORS[persona];
  return 'bg-primary';
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
  
  // Mock Purchase History
  const mockPurchases = [
    { id: 'ORD-1092', date: c.last_order_date ? new Date(c.last_order_date) : new Date(Date.now() - 86400000 * 15), amount: Math.round(c.total_spent * 0.3), items: 'Luxury Silk Scarf, Essential T-Shirt' },
    { id: 'ORD-0941', date: new Date(Date.now() - 86400000 * 45), amount: Math.round(c.total_spent * 0.4), items: 'Cashmere Blend Sweater' },
    { id: 'ORD-0812', date: new Date(Date.now() - 86400000 * 110), amount: Math.round(c.total_spent * 0.3), items: 'Classic Straight Denim, Cotton Socks' },
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
              <span className="label-text">Health Score</span>
              <span className={`text-[24px] font-mono-numbers font-semibold ${isAtRisk ? 'text-semantic-down' : c.health_score > 75 ? 'text-semantic-up' : 'text-semantic-warning'}`}>{c.health_score}/100</span>
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
              {c.customer_personas.slice(0, 2).map((cp: any) => (
                <div key={cp.persona.id} className="badge-persona">
                  <span className={`w-1.5 h-1.5 rounded-full ${getDotColor(cp.persona.name)}`} />
                  {cp.persona.name}
                </div>
              ))}
              {c.customer_personas.length === 0 && <span className="text-[12px] text-muted font-medium">Uncategorized</span>}
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
            <span className="text-[14px] font-medium text-ink">{c.orders?.length || mockPurchases.length}</span>
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
                  {mockPurchases.map((order) => (
                    <tr key={order.id}>
                      <td className="font-mono-numbers text-muted font-medium">{order.id}</td>
                      <td>{format(order.date, 'MMM d, yyyy')}</td>
                      <td className="font-mono-numbers text-right text-ink">₹{order.amount.toLocaleString()}</td>
                      <td className="text-muted truncate max-w-[200px]">{order.items}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col">
            <h2 className="mb-4 border-b border-hairline pb-2">Behavioral Personas</h2>
            <div className="flex flex-col gap-3">
              {c.customer_personas.map((cp: any) => (
                <div key={cp.persona.id} className="p-4 border border-hairline rounded-xl bg-surface-card flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getDotColor(cp.persona.name)}`} />
                    <span className="text-[14px] font-semibold text-ink">{cp.persona.name}</span>
                  </div>
                  <p className="text-[13px] text-muted leading-relaxed">
                    Matched based on: {cp.persona.description}
                  </p>
                </div>
              ))}
              {c.customer_personas.length === 0 && (
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
                <div className="p-6 border border-hairline rounded-xl bg-surface-card flex flex-col gap-5">
                  <div className="flex items-center gap-2 border-b border-hairline pb-3">
                    <FastArrowRight height={18} width={18} className="text-primary" />
                    <span className="text-[14px] font-bold text-ink uppercase tracking-wider">Next Best Action</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <h3 className="text-[18px] font-semibold text-ink">{nba.action}</h3>
                    
                    <div className="grid grid-cols-3 gap-4 mt-2 mb-2 bg-surface-soft p-3 rounded-lg border border-hairline">
                      <div className="flex flex-col">
                        <span className="label-text">Expected Revenue</span>
                        <span className="text-[16px] font-mono-numbers font-semibold text-semantic-up">+₹{nba.expectedRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="label-text">Revenue At Risk</span>
                        <span className="text-[16px] font-mono-numbers font-semibold text-semantic-down">₹{nba.revenueAtRisk?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="label-text">Confidence</span>
                        <span className="text-[16px] font-mono-numbers font-semibold text-ink">{nba.confidence}%</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                      <span className="text-[12px] font-semibold text-muted uppercase tracking-wider">Reasoning</span>
                      <ul className="flex flex-col gap-1.5">
                        {nba.reasoning.map((r: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-[13px] text-muted">
                            <span className="text-primary mt-1">•</span> {r}
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>

                  <button className="btn-primary w-full mt-2" onClick={() => {
                    setCampaignContext({
                      sourcePage: 'Customer 360',
                      audienceName: c.name,
                      audienceSize: 1,
                      expectedRevenue: nba.expectedRevenue,
                      churnRisk: isAtRisk ? 'High' : 'Low',
                      recommendedAction: nba.action,
                      autoTriggerPrompt: `Create a personalized campaign for ${c.name}. Customer health score is ${c.health_score} with ${isAtRisk ? 'High' : 'Low'} churn risk. Expected revenue recovery is ₹${nba.expectedRevenue}.`
                    });
                    router.push('/chat');
                  }}>
                    Execute Strategy
                  </button>
                </div>
              ) : (
                <div className="p-6 border border-hairline rounded-xl bg-surface-card flex items-center justify-center text-muted text-[13px]">
                  Generating Next Best Action...
                </div>
              )}

              {/* Legacy Insights */}
              <div className="p-5 border border-hairline rounded-xl bg-surface-card">
                <span className="label-text mb-2 block">Churn Risk</span>
                <p className="text-[14px] text-ink leading-relaxed font-medium">
                  {isAtRisk 
                    ? `High risk detected. Customer has deviated from their standard 45-day purchase cycle. Immediate retention required.` 
                    : `Low risk. Customer exhibits stable purchasing cadence consistent with the "${c.customer_personas[0]?.persona?.name || 'average'}" segment.`}
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
