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
            className="card bg-surface-card flex flex-col border border-hairline hover:border-primary/50 cursor-pointer group relative overflow-hidden transition-all duration-200" 
            onClick={() => router.push('/chat')}
          >
            <div className={clsx(
              "absolute left-0 top-0 bottom-0 w-[4px]",
              opp.urgency === 'High' ? "bg-semantic-down" : opp.urgency === 'Medium' ? "bg-semantic-warning" : "bg-primary"
            )} />
            
            <div className="p-8 flex flex-col gap-6">
              
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[20px] font-semibold text-ink flex items-center gap-3">
                    {opp.title}
                    {opp.urgency === 'High' && (
                      <span className="px-2 py-0.5 rounded bg-semantic-down/10 text-semantic-down text-[11px] font-bold border border-semantic-down/20 flex items-center gap-1">
                        <WarningTriangle height={12} width={12} /> High Urgency
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-medium text-muted uppercase tracking-wider">Opportunity Score</span>
                      <span className="text-[16px] font-mono-numbers font-semibold text-ink">{opp.score}/100</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                   <span className="text-[12px] font-medium text-muted uppercase tracking-wider">Revenue Opportunity</span>
                   <span className="text-[24px] font-mono-numbers font-bold text-semantic-up">₹{opp.potentialRevenue.toLocaleString()}</span>
                </div>
              </div>

              {/* Action vs No Action Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-hairline rounded-xl overflow-hidden mt-2">
                 {/* Recommended Action */}
                 <div className="bg-surface-soft p-6 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-hairline relative">
                    <div className="flex items-center justify-between">
                       <span className="text-[11px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-1 rounded">Recommended Action</span>
                    </div>
                    <div>
                       <p className="text-[16px] font-semibold text-ink">{opp.recommendedAction}</p>
                       <p className="text-[14px] text-muted mt-1">{opp.actionScenario?.description}: <span className="font-semibold font-mono-numbers text-ink">₹{opp.actionScenario?.value?.toLocaleString()}</span></p>
                    </div>
                    <button className="btn-primary flex items-center gap-2 w-fit mt-2">
                      Draft Strategy <ArrowRight height={16} width={16} />
                    </button>
                 </div>

                 {/* No Action */}
                 <div className="bg-surface-card p-6 flex flex-col gap-4 relative">
                    <div className="flex items-center justify-between">
                       <span className="text-[11px] font-bold text-muted uppercase tracking-wider bg-surface-soft border border-hairline px-2 py-1 rounded">No Action</span>
                    </div>
                    <div>
                       <p className="text-[16px] font-semibold text-ink text-semantic-down">Do Nothing</p>
                       <div className="flex flex-col gap-1 mt-1">
                          <p className="text-[14px] text-muted">{opp.noActionScenario?.description}: <span className="font-semibold font-mono-numbers text-semantic-down">₹{opp.noActionScenario?.value?.toLocaleString()}</span></p>
                          <p className="text-[14px] text-muted">Estimated Customer Churn: <span className="font-semibold font-mono-numbers text-ink">{opp.noActionScenario?.churnImpact}</span></p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="flex flex-col md:flex-row gap-8 mt-2">
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Spark height={16} width={16} className="text-primary" />
                    <span className="text-[13px] font-semibold text-ink uppercase tracking-wider">AI Business Insight</span>
                  </div>
                  <p className="text-[14px] text-ink font-medium leading-relaxed">
                    {opp.aiExplanation}
                  </p>
                </div>
                <div className="flex-1 flex flex-col gap-3 border-l border-hairline pl-8">
                  <span className="text-[13px] font-semibold text-muted uppercase tracking-wider">Supporting Metrics</span>
                  <ul className="flex flex-col gap-2">
                    {opp.reasoning.map((reason: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-[13px] text-muted">
                        <span className="text-primary mt-1">•</span>
                        {reason}
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
