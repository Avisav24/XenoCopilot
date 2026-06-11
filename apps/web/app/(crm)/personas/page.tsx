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
        {personas?.map((p: any) => {
          const expectedGain = p.expectedImpact || p.revenueOpportunity || 0;
          const expectedLoss = Math.round(expectedGain * 0.38); // Mocking risk multiplier
          const netImpact = expectedGain + expectedLoss;
          
          return (
          <div key={p.id} className="flex flex-col border-t border-hairline pt-8 transition-colors overflow-hidden hover:bg-[#F8FAFC]">
            
            <div className="flex flex-col gap-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-[24px] font-bold text-ink tracking-tight flex items-center gap-3">
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-[13px] font-medium text-muted">Audience: <span className="text-ink font-semibold">{p.customerCount.toLocaleString()}</span></span>
                  </div>
                </div>
              </div>

              {/* Persona Story Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-4 border-y border-hairline">
                 <div className="flex flex-col gap-1">
                    <span className="label-text">Revenue Generated</span>
                    <span className="text-[20px] font-mono-numbers font-semibold text-ink">₹{p.revenueContribution.toLocaleString()}</span>
                 </div>
                 <div className="flex flex-col gap-1">
                    <span className="label-text">Revenue Growth</span>
                    <div className="flex items-center gap-2">
                       <span className={clsx("text-[20px] font-mono-numbers font-semibold", p.monthlyTrend.startsWith('-') ? "text-semantic-down" : "text-semantic-up")}>
                          {p.monthlyTrend}
                       </span>
                       {p.monthlyTrend.startsWith('-') ? <ArrowDown height={16} width={16} className="text-semantic-down" /> : <ArrowUp height={16} width={16} className="text-semantic-up" />}
                    </div>
                 </div>
                 <div className="flex flex-col gap-1">
                    <span className="label-text">Risk Exposure</span>
                    <span className={clsx("text-[20px] font-semibold", p.churnRisk.includes('High') ? "text-semantic-down" : p.churnRisk === 'Medium' ? "text-semantic-warning" : "text-semantic-up")}>
                       {p.churnRisk}
                    </span>
                 </div>
                 <div className="flex flex-col gap-1">
                    <span className="label-text text-primary">Revenue Potential</span>
                    <span className="text-[20px] font-mono-numbers font-semibold text-primary">₹{p.revenueOpportunity.toLocaleString()}</span>
                 </div>
              </div>

              {/* Persona Economics */}
              <div className="flex flex-col md:flex-row gap-12 mt-2">
                <div className="flex-1 flex flex-col gap-4">
                  <span className="label-text">Persona Economics</span>
                  <div className="flex flex-col gap-2 text-[14px]">
                    <div className="flex justify-between border-b border-hairline pb-2">
                      <span className="text-muted">If No Action (Loss)</span>
                      <span className="font-medium text-semantic-down">₹{expectedLoss.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-hairline pb-2">
                      <span className="text-muted">If Recommended Action (Gain)</span>
                      <span className="font-medium text-semantic-up">₹{expectedGain.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-hairline pb-2">
                      <span className="text-muted">Net Impact</span>
                      <span className="font-medium text-primary font-bold">₹{netImpact.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-4">
                  <span className="label-text">Action Plan</span>
                  <div className="flex flex-col gap-2 text-[14px]">
                    <span className="font-medium text-ink">{p.recommendedAction}</span>
                    <span className="text-muted">{p.aiSummary}</span>
                    <button 
                      onClick={() => router.push('/chat')}
                      className="btn-primary w-fit mt-2"
                    >
                      Strategize Campaign <ArrowRight height={16} width={16} />
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )})}

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
