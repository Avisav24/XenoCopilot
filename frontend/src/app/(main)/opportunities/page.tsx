'use client';

import { useQuery } from '@tanstack/react-query';
import { getOpportunities } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { setCampaignContext } from '@/lib/campaignContext';
import { FastArrowRight, Spark, WarningTriangle } from 'iconoir-react';
import { clsx } from 'clsx';

export default function RevenueOpportunityCenterPage() {
  const router = useRouter();

  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['revenue-opportunities'],
    queryFn: getOpportunities,
  });

  if (isLoading) {
    return <div className="p-10 min-h-screen flex items-center justify-center text-muted font-medium bg-canvas">Scanning customer database for revenue opportunities...</div>;
  }

  if (!opportunities || opportunities.length === 0) {
    return <div className="p-10 text-center text-ink bg-canvas">No immediate revenue opportunities detected.</div>;
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-24 max-w-[1400px] bg-canvas">
      
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-bold text-ink leading-none">Revenue Opportunity Center</h1>
          <p className="max-w-2xl text-[15px] text-muted">
            AI-surfaced opportunities sorted by potential impact and urgency. Act on these recommendations to maximize revenue recovery.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8 mt-4">
        {opportunities.map((opp) => (
          <div key={opp.id} className="border border-hairline rounded-xl bg-surface-card shadow-sm flex flex-col md:flex-row overflow-hidden">
            
            {/* Left: Key Metrics */}
            <div className="md:w-1/3 bg-surface-soft p-6 border-b md:border-b-0 md:border-r border-hairline flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={clsx(
                    "text-[11px] font-bold px-2 py-1 rounded uppercase tracking-wider",
                    opp.urgency === 'High' ? "bg-red-100 text-red-800" :
                    opp.urgency === 'Medium' ? "bg-amber-100 text-amber-800" :
                    "bg-emerald-100 text-emerald-800"
                  )}>
                    {opp.urgency} Urgency
                  </span>
                  <span className="text-[12px] font-bold text-muted uppercase tracking-wider flex items-center gap-1">
                    <Spark height={12} width={12} className="text-primary"/> AI Score: {opp.score}
                  </span>
                </div>
                <h3 className="text-[20px] font-bold text-ink mt-2">{opp.title}</h3>
              </div>

              <div className="flex flex-col gap-4 mt-2">
                <div className="flex flex-col">
                  <span className="label-text">Expected Revenue</span>
                  <span className="text-[24px] font-mono-numbers font-bold text-semantic-up">₹{opp.potentialRevenue.toLocaleString()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="label-text flex items-center gap-1"><WarningTriangle height={12} width={12}/> Revenue At Risk</span>
                  <span className="text-[18px] font-mono-numbers font-semibold text-semantic-down">₹{opp.revenueAtRisk.toLocaleString()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="label-text">Audience Size</span>
                  <span className="text-[18px] font-mono-numbers font-semibold text-ink">{opp.audience} Customers</span>
                </div>
              </div>
            </div>

            {/* Right: AI Explanation & Action */}
            <div className="md:w-2/3 p-6 flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <span className="text-[13px] font-bold text-ink flex items-center gap-1.5 border-b border-hairline pb-2">
                    <Spark height={16} width={16} className="text-primary"/> Why is this an opportunity?
                  </span>
                  <p className="text-[14px] text-slate-700 leading-relaxed font-medium mt-1">
                    {opp.aiExplanation}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-[12px] font-bold text-muted uppercase tracking-wider">Signals</span>
                    <ul className="flex flex-col gap-1.5">
                      {opp.reasoning.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-[13px] text-slate-700 font-medium">
                          <span className="text-primary mt-1">•</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <span className="text-[12px] font-bold text-muted uppercase tracking-wider">Activation Mix</span>
                    <ul className="flex flex-col gap-1.5">
                      {opp.activationMix?.map((mix, i) => (
                        <li key={i} className="flex items-center justify-between text-[13px] text-slate-700 font-medium">
                          <span>{mix.channel}</span>
                          <span className="font-mono-numbers font-bold">{mix.percentage}%</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-[12px] text-slate-500 mt-1 italic">{opp.mixReason}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-hairline">
                <div className="flex items-center gap-2">
                  <FastArrowRight height={18} width={18} className="text-primary" />
                  <span className="text-[14px] font-bold text-primary uppercase tracking-wider">Next Best Action: {opp.recommendedAction}</span>
                </div>
                
                <button 
                  onClick={() => {
                    setCampaignContext({
                      sourcePage: 'Revenue Opportunity Center',
                      audienceName: opp.title,
                      audienceSize: opp.audience,
                      expectedRevenue: `₹${opp.potentialRevenue}`,
                      recommendedChannel: opp.recommendedChannels?.[0] || 'WhatsApp',
                      autoTriggerPrompt: `Create a campaign for the ${opp.title} opportunity targeting ${opp.audience} customers. The goal is ${opp.recommendedAction} to recover ₹${opp.potentialRevenue}. Reason: ${opp.aiExplanation}`
                    });
                    router.push('/chat');
                  }}
                  className="btn-primary w-full md:w-auto self-start flex items-center justify-center gap-2"
                >
                  Generate Campaign
                </button>
              </div>

            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
