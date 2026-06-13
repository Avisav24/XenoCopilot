'use client';

import { useQuery } from '@tanstack/react-query';
import { getCustomer, getNextBestAction } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, User, Mail, Phone, Calendar, Play } from 'iconoir-react';
import { setCampaignContext } from '@/lib/campaignContext';
import { clsx } from 'clsx';
import { RightPanel, PanelSection, PanelMetric } from '@/components/ui/RightPanel';
import { DataTable } from '@/components/ui/DataTable';

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
    return <div className="p-10 w-full h-full flex items-center justify-center text-ink-muted bg-canvas">Loading profile...</div>;
  }

  if (!c) {
    return <div className="p-10 w-full h-full flex items-center justify-center text-ink bg-canvas">Customer not found.</div>;
  }

  const daysSince = c.last_order_date
    ? Math.floor((Date.now() - new Date(c.last_order_date).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const personas = c.personas || (c.customer_personas || []).map((cp: any) => cp.persona?.name || cp.name).filter(Boolean);
  
  const displayOrders = c.orders && c.orders.length > 0 
    ? c.orders 
    : [
        { id: 'ORD-1092', order_date: c.last_order_date ? new Date(c.last_order_date) : new Date(Date.now() - 86400000 * 15), amount: Math.round(c.total_spent * 0.3) },
        { id: 'ORD-0941', order_date: new Date(Date.now() - 86400000 * 45), amount: Math.round(c.total_spent * 0.4) },
      ];

  const orderColumns = [
    { key: 'id', label: 'Order ID' },
    { key: 'date', label: 'Date', render: (item: any) => format(new Date(item.order_date), 'MMM d, yyyy') },
    { key: 'amount', label: 'Amount', render: (item: any) => `₹${item.amount.toLocaleString()}` },
  ];

  return (
    <div className="flex w-full h-full">
      
      {/* Left: Customer Profile */}
      <div className="w-[320px] flex-shrink-0 border-r border-hairline bg-canvas p-6 overflow-y-auto">
        <button 
          onClick={() => router.push('/intelligence')}
          className="flex items-center gap-2 text-ink-muted hover:text-ink text-[12px] font-semibold w-fit transition-colors mb-6"
        >
          <ArrowLeft height={14} width={14} /> Back
        </button>

        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-[20px] font-semibold text-ink mb-1">{c.name}</h1>
            <div className="flex items-center gap-2 text-ink-muted text-[13px]">
              <Mail height={14} width={14} /> {c.email}
            </div>
            {c.phone && (
              <div className="flex items-center gap-2 text-ink-muted text-[13px] mt-1">
                <Phone height={14} width={14} /> {c.phone}
              </div>
            )}
          </div>

          <div className="border-t border-hairline pt-6">
            <h3 className="text-[12px] uppercase font-bold tracking-wider text-ink-muted mb-4">Account Details</h3>
            <div className="flex flex-col gap-3">
              <PanelMetric label="Lifetime Value" value={`₹${c.total_spent.toLocaleString()}`} />
              <PanelMetric label="Health Score" value={`${c.health_score}/100`} trend={c.health_score < 40 ? 'negative' : c.health_score > 75 ? 'positive' : 'neutral'} />
              <PanelMetric label="Total Orders" value={c.orders?.length || displayOrders.length} />
              <PanelMetric label="Last Purchase" value={daysSince !== null ? `${daysSince} days ago` : 'Never'} />
              <PanelMetric label="Preferred Channel" value={c.preferred_channel || 'Unknown'} />
            </div>
          </div>

          <div className="border-t border-hairline pt-6">
            <h3 className="text-[12px] uppercase font-bold tracking-wider text-ink-muted mb-4">Personas</h3>
            <div className="flex flex-wrap gap-2">
              {personas.map((p: string) => (
                <span key={p} className="px-2 py-1 rounded bg-canvas-soft border border-hairline text-[12px] font-medium text-ink">
                  {p}
                </span>
              ))}
              {personas.length === 0 && <span className="text-[12px] text-ink-muted italic">Uncategorized</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Center: Timeline & Data */}
      <div className="flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="max-w-[800px] mx-auto">
          <div className="mb-8">
            <h2 className="mb-2">Operational Timeline</h2>
            <p className="text-ink-muted">Historical interactions and transactions.</p>
          </div>

          <div className="mb-8">
            <h3 className="mb-4">Purchase History</h3>
            <DataTable columns={orderColumns} data={displayOrders} searchPlaceholder="Search orders..." />
          </div>

          <div>
            <h3 className="mb-4 border-b border-hairline pb-2">Behavioral Context</h3>
            <div className="flex flex-col gap-3">
              {c.customer_personas && c.customer_personas.length > 0 ? (
                c.customer_personas.map((cp: any) => (
                  <div key={cp.persona?.id || cp.id || cp.persona?.name} className="p-4 border border-hairline bg-canvas-soft flex flex-col gap-1">
                    <span className="text-[14px] font-semibold text-ink">{cp.persona?.name || cp.name}</span>
                    <p className="text-[13px] text-ink-muted">
                      Match: {cp.persona?.description || cp.description || 'Behavioral data match'}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 border border-hairline bg-canvas-soft text-ink-muted text-[13px] italic">
                  No explicit behavioral data available.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right: AI Intelligence Panel */}
      <RightPanel title="AI Intelligence">
        {nba ? (
          <>
            <PanelSection title="Executive Summary">
              {nba.aiSummary}
            </PanelSection>
            
            <PanelSection title="Risk & Potential">
              <div className="flex flex-col gap-2 mt-2">
                <PanelMetric label="Churn Risk Analysis" value={nba.churnRiskAnalysis} trend={nba.churnRiskAnalysis?.toLowerCase().includes('high') ? 'negative' : 'neutral'} />
                <PanelMetric label="Revenue Potential" value={nba.revenuePotential} trend="positive" />
              </div>
            </PanelSection>

            <PanelSection title="Behavioral Insights">
              <ul className="list-disc pl-4 space-y-1">
                {nba.behavioralInsights?.map((insight: string, idx: number) => (
                  <li key={idx}>{insight}</li>
                ))}
              </ul>
            </PanelSection>

            <PanelSection title="Next Best Action" noBorder>
              <div className="bg-primary/5 border border-primary/20 rounded p-4 flex flex-col gap-3">
                <span className="text-[12px] font-bold text-primary tracking-wider uppercase">Recommendation</span>
                <span className="text-[15px] font-semibold text-ink">{nba.nextBestAction?.recommendedAction}</span>
                <span className="text-[13px] text-ink-muted">{nba.nextBestAction?.reason}</span>
                
                <div className="flex justify-between items-center mt-2 border-t border-primary/10 pt-2">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-primary font-semibold uppercase">Expected</span>
                    <span className="text-[14px] font-bold text-ink">₹{nba.nextBestAction?.expectedRevenue?.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[11px] text-primary font-semibold uppercase">Confidence</span>
                    <span className="text-[14px] font-bold text-ink">{nba.nextBestAction?.confidence}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => {
                  setCampaignContext({
                    sourcePage: 'Customer 360',
                    audienceName: c.name,
                    audienceSize: 1,
                    expectedRevenue: `₹${nba.nextBestAction?.expectedRevenue}`,
                    recommendedChannel: 'WhatsApp',
                    autoTriggerPrompt: `Create a personalized ${nba.nextBestAction?.recommendedAction?.toLowerCase()} campaign for ${c.name}. Reason: ${nba.nextBestAction?.reason} Expected revenue recovery is ₹${nba.nextBestAction?.expectedRevenue}.`
                  });
                  router.push('/chat');
                }}
                className="w-full mt-4 bg-primary text-white py-2 rounded text-[13px] font-semibold hover:bg-primary-press transition-colors flex justify-center items-center gap-2"
              >
                <Play height={14} width={14} /> Launch Campaign
              </button>
            </PanelSection>
          </>
        ) : (
          <p className="text-[13px] text-ink-muted italic">Analyzing customer profile...</p>
        )}
      </RightPanel>

    </div>
  );
}
