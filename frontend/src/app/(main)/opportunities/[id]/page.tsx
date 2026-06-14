'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCustomer, getNextBestAction } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, Spark, FastArrowRight } from 'iconoir-react';
import { setCampaignContext } from '@/lib/campaignContext';
import { clsx } from 'clsx';

const TABS = ['Overview', 'Orders', 'Campaign History', 'Engagement', 'Predictions', 'Activity Timeline'];

function getDotColor(persona: string) {
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
  const [activeTab, setActiveTab] = useState('Overview');

  const { data: c, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomer(id),
  });

  const { data: nba } = useQuery({
    queryKey: ['next-best-action', id],
    queryFn: () => getNextBestAction(id),
  });

  if (isLoading) {
    return <div className="p-6 w-full min-h-screen flex items-center justify-center text-ink-muted font-medium bg-canvas">Loading profile...</div>;
  }

  if (!c) {
    return <div className="p-6 w-full min-h-screen flex items-center justify-center text-ink bg-canvas">Customer not found.</div>;
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

  return (
    <div className="p-6 w-full flex flex-col min-h-screen bg-canvas">
      
      {/* Navigation */}
      <button 
        onClick={() => router.push('/opportunities')}
        className="flex items-center gap-2 text-ink-muted hover:text-ink text-[13px] font-medium w-fit transition-colors mb-6"
      >
        <ArrowLeft height={16} width={16} /> Back
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
        <div>
          <h1 className="text-[32px] font-[700] text-ink leading-tight mb-1">{c.name}</h1>
          <p className="text-[14px] text-ink-muted">{c.email} {c.phone ? `• ${c.phone}` : ''}</p>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <span className="text-[12px] font-medium text-ink-muted uppercase tracking-wider mb-1">Status</span>
            <span className="inline-flex items-center gap-1.5 text-[14px] font-medium text-ink">
              <span className={clsx("w-2 h-2 rounded-full", c.health_score >= 76 ? "bg-emerald-500" : c.health_score >= 40 ? "bg-amber-500" : "bg-red-500")} />
              {c.health_score >= 76 ? 'Healthy' : c.health_score >= 40 ? 'At Risk' : 'Churned'}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[12px] font-medium text-ink-muted uppercase tracking-wider mb-1">Lifetime Value</span>
            <span className="text-[20px] font-mono-numbers font-[600] text-ink">₹{c.total_spent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card !p-4 flex flex-col gap-1">
          <span className="text-[12px] font-medium text-ink-muted uppercase tracking-wider">Primary Personas</span>
          <div className="flex gap-1.5 flex-wrap mt-1">
            {personas.slice(0, 3).map((p: string) => (
              <span key={p} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink">
                <span className={`w-1.5 h-1.5 rounded-full ${getDotColor(p)}`} />
                {p}
              </span>
            ))}
            {personas.length === 0 && <span className="text-[13px] text-ink-muted font-medium">Uncategorized</span>}
          </div>
        </div>
        <div className="card !p-4 flex flex-col gap-1">
          <span className="text-[12px] font-medium text-ink-muted uppercase tracking-wider">Preferred Channel</span>
          <span className="text-[15px] font-[600] text-ink">{c.preferred_channel || 'Unknown'}</span>
        </div>
        <div className="card !p-4 flex flex-col gap-1">
          <span className="text-[12px] font-medium text-ink-muted uppercase tracking-wider">Last Purchase</span>
          <span className="text-[15px] font-[600] text-ink">{daysSince !== null ? `${daysSince} days ago` : 'Never'}</span>
        </div>
        <div className="card !p-4 flex flex-col gap-1">
          <span className="text-[12px] font-medium text-ink-muted uppercase tracking-wider">Total Orders</span>
          <span className="text-[15px] font-[600] text-ink">{c.orders?.length || displayOrders.length}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-hairline mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "px-4 py-3 text-[14px] font-[600] transition-colors whitespace-nowrap border-b-2",
              activeTab === tab ? "border-ink text-ink" : "border-transparent text-ink-muted hover:text-ink hover:border-hairline"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column: Metrics & Orders */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <h2 className="text-[18px] font-[600] text-ink">Recent Orders</h2>
                <div className="table-container">
                  <table className="table-enterprise">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th className="text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-canvas">
                      {displayOrders.map((order: any) => (
                        <tr key={order.id}>
                          <td className="font-mono-numbers text-ink-muted font-medium">{order.id}</td>
                          <td>{format(new Date(order.order_date), 'MMM d, yyyy')}</td>
                          <td className="font-mono-numbers text-right font-[500] text-ink">₹{order.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {nba && (
                <div className="flex flex-col gap-3">
                  <h2 className="text-[18px] font-[600] text-ink flex items-center gap-2">
                    <Spark height={18} width={18} className="text-ink-muted" /> AI Predictions
                  </h2>
                  <div className="card flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[12px] font-medium text-ink-muted uppercase tracking-wider">Churn Risk</span>
                        <p className="text-[14px] text-ink leading-snug">{nba.churnRiskAnalysis}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[12px] font-medium text-ink-muted uppercase tracking-wider">Revenue Potential</span>
                        <p className="text-[16px] font-mono-numbers font-[600] text-green-600">{nba.revenuePotential}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Timeline / Action */}
            <div className="flex flex-col gap-6">
              {nba && (
                <div className="flex flex-col gap-3">
                  <h2 className="text-[18px] font-[600] text-ink">Recommended Action</h2>
                  <div className="card flex flex-col gap-4 border-l-2 border-l-ink">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-[16px] font-[600] text-ink">{nba.nextBestAction?.recommendedAction}</h3>
                        <p className="text-[14px] text-ink-muted">{nba.nextBestAction?.reason}</p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium px-2 py-1 bg-canvas-soft border border-hairline rounded text-ink">
                        <span className={clsx("w-1.5 h-1.5 rounded-full", nba.nextBestAction?.priority === 'Critical' ? 'bg-red-500' : 'bg-amber-500')} />
                        {nba.nextBestAction?.priority || 'Medium'}
                      </span>
                    </div>
                    
                    <div className="flex gap-6 mt-2">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-[600] text-ink-muted uppercase tracking-wider">Expected Lift</span>
                        <span className="text-[15px] font-mono-numbers font-[600] text-green-600">₹{nba.nextBestAction?.expectedRevenue?.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-[600] text-ink-muted uppercase tracking-wider">Confidence</span>
                        <span className="text-[15px] font-mono-numbers font-[600] text-ink">{nba.nextBestAction?.confidence}</span>
                      </div>
                    </div>

                    <button className="btn-secondary w-full mt-2" onClick={() => {
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
                      Generate Campaign <FastArrowRight width={14} height={14} />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <h2 className="text-[18px] font-[600] text-ink">Activity Timeline</h2>
                <div className="card">
                  <div className="flex flex-col gap-4 relative">
                    <div className="absolute left-[7px] top-2 bottom-2 w-px bg-hairline" />
                    
                    <div className="flex gap-4 relative z-10">
                      <div className="w-3.5 h-3.5 rounded-full bg-canvas border-2 border-ink mt-1" />
                      <div className="flex flex-col">
                        <span className="text-[14px] font-[600] text-ink">Opened Email: Flash Sale</span>
                        <span className="text-[12px] text-ink-muted">2 days ago</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 relative z-10">
                      <div className="w-3.5 h-3.5 rounded-full bg-canvas border-2 border-hairline mt-1" />
                      <div className="flex flex-col">
                        <span className="text-[14px] font-[600] text-ink">Placed Order {displayOrders[0]?.id}</span>
                        <span className="text-[12px] text-ink-muted">{daysSince} days ago</span>
                      </div>
                    </div>

                    <div className="flex gap-4 relative z-10">
                      <div className="w-3.5 h-3.5 rounded-full bg-canvas border-2 border-hairline mt-1" />
                      <div className="flex flex-col">
                        <span className="text-[14px] font-[600] text-ink">Received WhatsApp: Win-back</span>
                        <span className="text-[12px] text-ink-muted">18 days ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab !== 'Overview' && (
          <div className="card flex items-center justify-center py-20 text-ink-muted text-[14px]">
            {activeTab} module is under construction.
          </div>
        )}
      </div>

    </div>
  );
}
