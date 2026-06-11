'use client';

import { useQuery } from '@tanstack/react-query';
import { getOpportunities } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ArrowRight, Spark, WarningTriangle } from 'iconoir-react';
import { clsx } from 'clsx';

export default function OpportunitiesPage() {
  const router = useRouter();
  
  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['opportunities'],
    queryFn: getOpportunities,
  });

  if (isLoading) {
    return (
      <div className="p-12 min-h-screen flex items-center justify-center gap-3 text-muted font-medium">
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        Scanning database for revenue opportunities...
      </div>
    );
  }

  return (
    <div className="p-10 w-full flex flex-col gap-10 min-h-screen bg-canvas pb-24">
      
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-hairline pb-8">
        <h1>Revenue Opportunities</h1>
        <p className="text-[14px] text-muted max-w-2xl leading-relaxed mt-2">
          The AI engine continuously scans customer behavior and personas to surface high-impact revenue opportunities and calculate the cost of inaction.
        </p>
      </div>

      {/* Opportunities List View */}
      <div className="flex flex-col gap-8 w-full max-w-5xl">
        {opportunities?.map((opp: any) => (
          <div 
            key={opp.id} 
            className="flex flex-col border-t border-hairline pt-8 cursor-pointer group relative overflow-hidden transition-all duration-200 hover:bg-[#F8FAFC]" 
            onClick={() => router.push('/chat')}
          >
            <div className="flex flex-col gap-6">
              
              {/* Top Meta & Revenue */}
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-2">
                  <h3 className="text-[24px] font-bold text-ink tracking-tight flex items-center gap-3">
                    {opp.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[13px] font-medium text-muted">
                    <span>{opp.audience.toLocaleString()} customers</span>
                    <span className="text-hairline-input">|</span>
                    <span>{opp.score}/100 Score</span>
                    <span className="text-hairline-input">|</span>
                    <span>{opp.confidence}% Confidence</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                   <span className="metric-large text-semantic-up">₹{opp.potentialRevenue.toLocaleString()}</span>
                   <span className="text-[13px] font-medium text-muted uppercase tracking-wider">Potential Recovery</span>
                </div>
              </div>

              {/* Action vs Risk Row */}
              <div className="flex flex-col md:flex-row gap-12 border-t border-b border-hairline py-6 my-2">
                 
                 {/* Revenue Risk */}
                 <div className="flex-1 flex flex-col gap-3">
                    <span className="label-text">Revenue At Risk</span>
                    <div className="flex flex-col gap-1">
                       <span className="text-[24px] font-bold text-semantic-down">₹{opp.noActionScenario?.value?.toLocaleString() || opp.revenueAtRisk?.toLocaleString()}</span>
                       <span className="text-[14px] text-muted">Projected Loss (30 Days)</span>
                    </div>
                    <div className="mt-2 text-[13px] text-muted">
                      Customer Churn Risk: <span className="font-semibold text-ink">{opp.noActionScenario?.churnImpact || 'High'}</span>
                    </div>
                 </div>

                 {/* Recommended Action */}
                 <div className="flex-1 flex flex-col gap-3">
                    <span className="label-text text-primary">Recommended Action</span>
                    <div className="flex flex-col gap-1">
                       <span className="text-[20px] font-semibold text-ink">{opp.recommendedAction}</span>
                       <span className="text-[14px] text-muted">Target: {opp.actionScenario?.description || 'Expected Revenue'}</span>
                    </div>
                    <button className="btn-primary w-fit mt-2">
                      Draft Strategy <ArrowRight height={16} width={16} />
                    </button>
                 </div>
              </div>

              {/* AI Insight (Structured) */}
              <div className="flex flex-col md:flex-row gap-12 pb-6">
                <div className="flex-1 flex flex-col gap-4">
                  <span className="label-text">AI Insight</span>
                  <div className="flex flex-col gap-2 text-[14px]">
                    <div className="flex justify-between border-b border-hairline pb-2">
                      <span className="text-muted">Revenue Risk</span>
                      <span className="font-medium text-ink">{opp.aiExplanation || 'Purchasing velocity declining'}</span>
                    </div>
                    <div className="flex justify-between border-b border-hairline pb-2">
                      <span className="text-muted">Potential loss</span>
                      <span className="font-medium text-semantic-down">₹{opp.revenueAtRisk?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-hairline pb-2">
                      <span className="text-muted">Likely cause</span>
                      <span className="font-medium text-ink">Reduced engagement</span>
                    </div>
                    <div className="flex justify-between border-b border-hairline pb-2">
                      <span className="text-muted">Recommended action</span>
                      <span className="font-medium text-primary">{opp.recommendedAction}</span>
                    </div>
                  </div>
                </div>
                
                {/* Supporting Metrics */}
                <div className="flex-1 flex flex-col gap-4">
                  <span className="label-text">Supporting Metrics</span>
                  <ul className="flex flex-col gap-2">
                    {opp.reasoning.map((reason: string, idx: number) => (
                      <li key={idx} className="flex items-start justify-between border-b border-hairline pb-2 text-[14px]">
                        <span className="text-muted">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          </div>
        ))}

        {!opportunities || opportunities.length === 0 ? (
          <div className="p-16 border border-hairline rounded-xl bg-surface-card text-center flex flex-col items-center justify-center gap-4">
            <Spark height={32} width={32} className="text-muted" />
            <p className="text-[15px] text-ink font-medium">No immediate opportunities detected.</p>
            <p className="text-[14px] text-muted max-w-sm">The engine is gathering more behavioral data. Check back soon for new revenue insights.</p>
          </div>
        ) : null}
      </div>

    </div>
  );
}
