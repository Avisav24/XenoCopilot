'use client';

import { useQuery } from '@tanstack/react-query';
import { getCampaignInsights } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { ChartBar, ArrowLeft, PaperPlaneRight, EnvelopeOpen, CursorClick, CurrencyCircleDollar, WarningCircle, Sparkle } from '@phosphor-icons/react';
import { clsx } from 'clsx';
import Loader from '@/components/Loader';
import { useEffect, useState } from 'react';

export default function EngagementInsightsPage() {
  const { id } = useParams();
  const router = useRouter();

  // Polling every 2s to show live simulation updates
  const { data: insights, isLoading } = useQuery({
    queryKey: ['campaign-insights', id],
    queryFn: () => getCampaignInsights(id as string),
    refetchInterval: 2000,
  });

  if (isLoading) {
    return <div className="p-12 flex justify-center"><Loader text="Analyzing audience engagement..." /></div>;
  }

  if (!insights) {
    return <div className="p-12 text-center text-ink">Campaign not found.</div>;
  }

  const { funnel } = insights;

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8 h-[calc(100vh-4rem)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.push('/engagement')}
          className="w-10 h-10 rounded-full border border-hairline flex items-center justify-center text-ink hover:bg-surface-strong transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-[32px] md:text-[36px] leading-[1.09] tracking-[-1px] font-display text-ink">
              {insights.campaign_name}
            </h1>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider">
              {insights.channel}
            </span>
          </div>
          <p className="text-[14px] text-body mt-1">
            Target Audience: <strong className="text-ink">{insights.persona}</strong> ({insights.audience_count} customers)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Funnel Stats */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="card p-6 border border-hairline flex flex-col">
            <h2 className="text-[16px] font-semibold text-ink mb-6 flex items-center gap-2">
              <ChartBar size={24} className="text-primary" /> Delivery & Engagement Funnel
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <FunnelStep 
                icon={<PaperPlaneRight size={32} />} 
                label="Sent" 
                value={funnel.sent} 
                subValue={`100%`} 
                color="text-primary" 
                bg="bg-primary/10" 
              />
              <FunnelStep 
                icon={<PaperPlaneRight size={32} />} 
                label="Delivered" 
                value={funnel.delivered} 
                subValue={`${funnel.delivery_rate} rate`} 
                color="text-[#319795]" 
                bg="bg-[#319795]/10" 
              />
              <FunnelStep 
                icon={<EnvelopeOpen size={32} />} 
                label="Opened" 
                value={funnel.opened} 
                subValue={`${funnel.open_rate} rate`} 
                color="text-[#d48166]" 
                bg="bg-[#d48166]/10" 
              />
              <FunnelStep 
                icon={<CursorClick size={32} />} 
                label="Clicked" 
                value={funnel.clicked} 
                subValue={`${funnel.click_rate} rate`} 
                color="text-[#805ad5]" 
                bg="bg-[#805ad5]/10" 
              />
              <FunnelStep 
                icon={<CurrencyCircleDollar size={32} />} 
                label="Converted" 
                value={funnel.purchased} 
                subValue={`${funnel.conversion_rate} rate`} 
                color="text-semantic-up" 
                bg="bg-semantic-up/10" 
              />
            </div>

            {funnel.failed > 0 && (
              <div className="mt-6 p-4 bg-semantic-down/10 border border-semantic-down/20 rounded-md flex items-center justify-between">
                <div className="flex items-center gap-2 text-semantic-down">
                  <WarningCircle size={24} />
                  <span className="text-[14px] font-bold">Delivery Failures</span>
                </div>
                <span className="text-[16px] font-mono-numbers text-semantic-down">{funnel.failed} messages bounced</span>
              </div>
            )}
          </div>

          <div className="card p-6 border border-hairline flex flex-col bg-surface-dark text-canvas">
            <h2 className="text-[16px] font-semibold text-on-dark mb-4 flex items-center gap-2">
              <Sparkle size={24} className="text-accent-yellow" /> AI Strategist Analysis
            </h2>
            <p className="text-[14px] text-on-darkSoft leading-relaxed whitespace-pre-wrap font-mono">
              {insights.ai_summary}
            </p>
          </div>
        </div>

        {/* Impact */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="card p-6 border border-hairline bg-canvas flex flex-col h-full">
            <h2 className="text-[16px] font-semibold text-ink mb-6 flex items-center gap-2">
              <CurrencyCircleDollar size={24} className="text-semantic-up" /> Attributed Revenue
            </h2>
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <p className="text-[12px] font-bold text-muted uppercase tracking-wider mb-2">Estimated Gross Impact</p>
              <h3 className="text-[48px] font-mono-numbers text-semantic-up leading-none mb-4">
                {insights.estimated_revenue}
              </h3>
              <p className="text-[14px] text-body">
                Derived from {funnel.purchased} converted customers.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function FunnelStep({ icon, label, value, subValue, color, bg }: any) {
  return (
    <div className="flex flex-col items-center p-4 bg-surface-soft border border-hairline rounded-md text-center">
      <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center mb-3", color, bg)}>
        {icon}
      </div>
      <h4 className="text-[12px] font-bold text-ink uppercase tracking-wider mb-1">{label}</h4>
      <p className="text-[24px] font-mono-numbers text-ink leading-none mb-1">{value}</p>
      <p className="text-[11px] font-medium text-muted">{subValue}</p>
    </div>
  );
}
