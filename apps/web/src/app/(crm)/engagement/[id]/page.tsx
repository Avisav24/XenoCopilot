'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCampaignInsights } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { ArrowLeft, Spark } from 'iconoir-react';

export default function EngagementInsightsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Overview');

  const { data: insights, isLoading } = useQuery({
    queryKey: ['campaign-insights', id],
    queryFn: () => getCampaignInsights(id as string),
    refetchInterval: 2000,
  });

  if (isLoading) {
    return <div className="p-10 min-h-screen flex items-center justify-center text-muted font-medium bg-canvas">Analyzing campaign...</div>;
  }

  if (!insights) {
    return <div className="p-10 text-center text-ink bg-canvas">Campaign not found.</div>;
  }

  const { funnel } = insights;
  const tabs = ['Overview', 'Analytics', 'Audience', 'Messages'];

  return (
    <div className="p-10 w-full flex flex-col gap-6 min-h-screen bg-canvas">
      
      {/* Navigation */}
      <button 
        onClick={() => router.push('/engagement')}
        className="flex items-center gap-2 text-muted hover:text-ink text-[13px] font-medium w-fit transition-colors"
      >
        <ArrowLeft height={16} width={16} /> Back to Campaigns
      </button>

      {/* Header */}
      <div className="flex flex-col gap-6 bg-surface-card border border-hairline rounded-xl p-6">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <h1 className="text-[24px] font-semibold text-ink leading-none mb-1">
              {insights.campaign_name}
            </h1>
            <p className="text-[14px] text-muted">
              Target Audience: <span className="font-medium text-ink">{insights.persona} ({insights.audience_count} customers)</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] px-2.5 py-1 rounded-md border border-hairline bg-surface-soft text-ink font-medium uppercase tracking-wider">
              {insights.channel}
            </span>
            <span className={clsx(
              "text-[12px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider border",
              insights.status === 'completed' ? "bg-semantic-up/10 text-semantic-up border-semantic-up/20" : "bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20"
            )}>
              {insights.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-hairline">
          <div className="flex flex-col gap-1">
            <span className="text-[12px] font-medium text-muted uppercase tracking-wider">Attributed Revenue</span>
            <span className="text-[20px] font-mono-numbers font-semibold text-ink">{insights.actual_revenue || insights.estimated_revenue}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[12px] font-medium text-muted uppercase tracking-wider">Prediction Accuracy</span>
            <span className="text-[20px] font-mono-numbers font-semibold text-ink">94%</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[12px] font-medium text-muted uppercase tracking-wider">Conversion Rate</span>
            <span className="text-[20px] font-mono-numbers font-semibold text-ink">{funnel.conversion_rate}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[12px] font-medium text-muted uppercase tracking-wider">Delivery Rate</span>
            <span className="text-[20px] font-mono-numbers font-semibold text-ink">{funnel.delivery_rate}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-hairline">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "pb-3 text-[14px] font-medium transition-colors border-b-2",
              activeTab === tab ? "text-ink border-ink" : "text-muted border-transparent hover:text-ink"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex flex-col mt-4 max-w-4xl">
        
        {activeTab === 'Overview' && (
          <div className="flex flex-col gap-6">
            <div className="p-6 border border-hairline rounded-lg bg-surface-card flex flex-col gap-4">
              <h3 className="text-[16px] font-semibold text-ink flex items-center gap-2">
                <Spark height={18} width={18} /> Executive Summary
              </h3>
              <p className="text-[14px] text-ink leading-relaxed">
                This {insights.channel} campaign targeted "{insights.persona}" ({insights.audience_count} customers). It has driven {insights.actual_revenue || insights.estimated_revenue} in attributed revenue so far from {funnel.purchased} direct conversions, achieving an overall conversion rate of {funnel.conversion_rate}. The message reached {funnel.delivered} customers, representing a {funnel.delivery_rate} delivery rate. Engagement was robust, with {funnel.opened} opens ({funnel.open_rate}) and {funnel.clicked} clicks ({funnel.click_rate}).
              </p>
            </div>
            <div className="p-6 border border-hairline rounded-lg bg-surface-card flex flex-col gap-4">
              <h3 className="text-[16px] font-semibold text-ink flex items-center gap-2">
                <Spark height={18} width={18} className="text-muted" /> Real-Time AI Stream
              </h3>
              <p className="text-[14px] text-ink font-mono bg-surface-soft p-4 rounded-md border border-hairline">
                {insights.ai_summary}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'Analytics' && (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h3 className="text-[16px] font-semibold text-ink">Communication Funnel</h3>
              <div className="table-container shadow-none">
                <table className="table-enterprise">
                  <thead>
                    <tr>
                      <th>Stage</th>
                      <th className="text-right">Volume</th>
                      <th className="text-right">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-medium text-ink">Sent</td>
                      <td className="text-right font-mono-numbers">{funnel.sent}</td>
                      <td className="text-right font-mono-numbers">100%</td>
                    </tr>
                    <tr>
                      <td className="font-medium text-ink">Delivered</td>
                      <td className="text-right font-mono-numbers">{funnel.delivered}</td>
                      <td className="text-right font-mono-numbers">{funnel.delivery_rate}</td>
                    </tr>
                    <tr>
                      <td className="font-medium text-ink">Opened</td>
                      <td className="text-right font-mono-numbers">{funnel.opened}</td>
                      <td className="text-right font-mono-numbers">{funnel.open_rate}</td>
                    </tr>
                    <tr>
                      <td className="font-medium text-ink">Clicked</td>
                      <td className="text-right font-mono-numbers">{funnel.clicked}</td>
                      <td className="text-right font-mono-numbers">{funnel.click_rate}</td>
                    </tr>
                    <tr>
                      <td className="font-medium text-ink">Purchased</td>
                      <td className="text-right font-mono-numbers">{funnel.purchased}</td>
                      <td className="text-right font-mono-numbers">{funnel.conversion_rate}</td>
                    </tr>
                    {funnel.failed > 0 && (
                      <tr>
                        <td className="font-medium text-semantic-down">Failed</td>
                        <td className="text-right font-mono-numbers text-semantic-down">{funnel.failed}</td>
                        <td className="text-right font-mono-numbers text-semantic-down">—</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col gap-4">
               <h3 className="text-[16px] font-semibold text-ink">Revenue Attribution Engine</h3>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-5 border border-hairline rounded-lg bg-surface-card flex flex-col gap-1">
                     <span className="text-[11px] font-medium text-muted uppercase tracking-wider">Predicted Revenue</span>
                     <span className="text-[18px] font-mono-numbers font-medium text-muted">{insights.predicted_revenue}</span>
                  </div>
                  <div className="p-5 border border-primary/20 rounded-lg bg-primary/5 flex flex-col gap-1">
                     <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Actual Revenue</span>
                     <span className="text-[18px] font-mono-numbers font-semibold text-primary">{insights.actual_revenue}</span>
                  </div>
                  <div className="p-5 border border-hairline rounded-lg bg-surface-card flex flex-col gap-1">
                     <span className="text-[11px] font-medium text-muted uppercase tracking-wider">Difference</span>
                     <span className={clsx("text-[18px] font-mono-numbers font-medium", insights.revenue_difference?.startsWith('+') ? 'text-semantic-up' : 'text-semantic-down')}>
                        {insights.revenue_difference}
                     </span>
                  </div>
                  <div className="p-5 border border-hairline rounded-lg bg-surface-card flex flex-col gap-1">
                     <span className="text-[11px] font-medium text-muted uppercase tracking-wider">Performance vs Prediction</span>
                     <span className="text-[18px] font-mono-numbers font-medium text-ink">{insights.performance_pct}%</span>
                  </div>
               </div>

               <div className="mt-4 flex flex-col gap-4">
                  <h3 className="text-[14px] font-semibold text-ink">Revenue Sources</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {insights.revenue_sources?.map((source: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-4 border border-hairline bg-surface-soft rounded-lg">
                           <span className="text-[13px] font-medium text-ink">{source.name}</span>
                           <span className="text-[14px] font-mono-numbers font-semibold text-primary">₹{source.value.toLocaleString()}</span>
                        </div>
                     ))}
                     {(!insights.revenue_sources || insights.revenue_sources.length === 0) && (
                        <div className="col-span-full p-4 border border-hairline rounded-lg text-center text-[13px] text-muted">
                           No revenue attributed yet.
                        </div>
                     )}
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'Audience' && (
          <div className="p-10 border border-hairline rounded-lg bg-surface-card text-center text-[14px] text-muted font-medium">
             Audience segmentation breakdown unavailable for this campaign.
          </div>
        )}

        {activeTab === 'Messages' && (
          <div className="p-10 border border-hairline rounded-lg bg-surface-card text-center text-[14px] text-muted font-medium">
             Message logs and A/B test splits are archived.
          </div>
        )}

      </div>

    </div>
  );
}
