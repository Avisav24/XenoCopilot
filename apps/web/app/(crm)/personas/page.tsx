'use client';

import { useQuery } from '@tanstack/react-query';
import { getDynamicPersonas } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Spark, ArrowRight, WarningTriangle, ArrowUp, ArrowDown } from 'iconoir-react';
import { clsx } from 'clsx';

export default function PersonasPage() {
  const router = useRouter();

  const { data: personas, isLoading } = useQuery({
    queryKey: ['dynamic-personas'],
    queryFn: getDynamicPersonas,
  });

  if (isLoading) {
    return (
      <div className="p-12 min-h-screen flex items-center justify-center gap-3 text-muted font-medium">
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        Generating dynamic behavioral personas...
      </div>
    );
  }

  return (
    <div className="p-10 w-full flex flex-col gap-10 min-h-screen bg-canvas pb-24">
      
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-hairline pb-8">
        <h1>Persona Discovery Engine</h1>
        <p className="text-[14px] text-muted max-w-2xl leading-relaxed mt-2">
          The AI engine analyzes behavioral data to generate dynamic customer segments and uncover their business story.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 w-full max-w-5xl">
        {personas?.map((p: any) => (
          <div key={p.id} className="card bg-surface-card border border-hairline hover:border-primary/50 transition-colors flex flex-col overflow-hidden">
            
            <div className="p-8 border-b border-hairline flex flex-col gap-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-[24px] font-semibold text-ink flex items-center gap-3">
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-[13px] font-medium text-muted">Audience: <span className="text-ink font-semibold">{p.customerCount.toLocaleString()}</span></span>
                  </div>
                </div>
              </div>

              {/* Persona Story Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="p-4 bg-surface-soft border border-hairline rounded-lg flex flex-col gap-1">
                    <span className="text-[11px] font-medium text-muted uppercase tracking-wider">Revenue Contribution</span>
                    <span className="text-[20px] font-mono-numbers font-semibold text-ink">₹{p.revenueContribution.toLocaleString()}</span>
                 </div>
                 <div className="p-4 bg-surface-soft border border-hairline rounded-lg flex flex-col gap-1">
                    <span className="text-[11px] font-medium text-muted uppercase tracking-wider">Monthly Trend</span>
                    <div className="flex items-center gap-2">
                       <span className={clsx("text-[20px] font-mono-numbers font-semibold", p.monthlyTrend.startsWith('-') ? "text-semantic-down" : "text-semantic-up")}>
                          {p.monthlyTrend}
                       </span>
                       {p.monthlyTrend.startsWith('-') ? <ArrowDown height={16} width={16} className="text-semantic-down" /> : <ArrowUp height={16} width={16} className="text-semantic-up" />}
                    </div>
                 </div>
                 <div className="p-4 bg-surface-soft border border-hairline rounded-lg flex flex-col gap-1">
                    <span className="text-[11px] font-medium text-muted uppercase tracking-wider">Risk Level</span>
                    <span className={clsx("text-[20px] font-semibold", p.churnRisk.includes('High') ? "text-semantic-down" : p.churnRisk === 'Medium' ? "text-semantic-warning" : "text-semantic-up")}>
                       {p.churnRisk}
                    </span>
                 </div>
                 <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Revenue Opportunity</span>
                    <span className="text-[20px] font-mono-numbers font-semibold text-primary">₹{p.revenueOpportunity.toLocaleString()}</span>
                 </div>
              </div>

              {/* AI Insight */}
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center gap-2">
                  <Spark height={16} width={16} className="text-primary" />
                  <span className="text-[12px] font-bold text-ink uppercase tracking-wider">AI Insight</span>
                </div>
                <p className="text-[15px] text-ink font-medium leading-relaxed pl-6 border-l-2 border-primary/20">
                  {p.aiSummary}
                </p>
              </div>

              {/* Recommended Action */}
              <div className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-surface-soft border border-hairline rounded-xl mt-2 gap-4">
                 <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Recommended Action</span>
                    <span className="text-[16px] font-semibold text-ink">{p.recommendedAction}</span>
                 </div>
                 <div className="flex flex-col md:items-end gap-1">
                    <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Expected Impact</span>
                    <span className="text-[18px] font-mono-numbers font-semibold text-semantic-up">+₹{p.expectedImpact?.toLocaleString()}</span>
                 </div>
                 <button 
                  onClick={() => router.push('/chat')}
                  className="btn-primary flex items-center gap-2 flex-shrink-0"
                >
                  Strategize Campaign <ArrowRight height={16} width={16} />
                </button>
              </div>

            </div>

          </div>
        ))}

        {!personas || personas.length === 0 ? (
          <div className="p-16 border border-hairline rounded-xl bg-surface-card text-center flex flex-col items-center justify-center gap-4">
            <Spark height={32} width={32} className="text-muted" />
            <p className="text-[15px] text-ink font-medium">No personas generated yet.</p>
          </div>
        ) : null}
      </div>

    </div>
  );
}
