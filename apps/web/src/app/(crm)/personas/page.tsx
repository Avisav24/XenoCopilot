'use client';

import { useQuery } from '@tanstack/react-query';
import { getDynamicPersonas } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Spark, ArrowUp, ArrowDown, Xmark } from 'iconoir-react';
import { useState } from 'react';
import { clsx } from 'clsx';

export default function PersonasPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: personas, isLoading } = useQuery({
    queryKey: ['dynamic-personas'],
    queryFn: getDynamicPersonas,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px] text-ink-muted">
        Generating dynamic behavioral personas...
      </div>
    );
  }

  const totalPersonas = personas?.length || 0;
  const totalAudience = personas?.reduce((acc: number, p: any) => acc + (p.customerCount || 0), 0) || 0;
  const highestRevenue = personas?.reduce((max: any, p: any) => (p.revenueContribution || 0) > (max.revenueContribution || 0) ? p : max, personas?.[0]);
  const highestRisk = personas?.find((p: any) => p.churnRisk === 'High') || personas?.[0];

  const selectedPersona = personas?.find((p: any) => p.id === selectedId);

  return (
    <div className="flex flex-col gap-8 w-full pb-24 relative">
      
      {/* Side Drawer */}
      {selectedPersona && (
        <div className="fixed inset-0 z-50 flex justify-end bg-ink/20 backdrop-blur-sm">
          <div className="w-[450px] bg-canvas border-l border-hairline shadow-2xl h-full flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-hairline bg-canvas-soft">
              <div className="flex flex-col gap-1">
                <h2 className="text-[20px] font-semibold text-ink tracking-tight">{selectedPersona.name}</h2>
                <span className="text-[13px] text-ink-muted">{selectedPersona.customerCount.toLocaleString()} Customers</span>
              </div>
              <button onClick={() => setSelectedId(null)} className="p-1 hover:bg-hairline rounded transition-colors text-ink-muted hover:text-ink">
                <Xmark height={20} width={20} />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-8">
               <div className="flex flex-col gap-2">
                 <span className="label-text">Persona Profile</span>
                 <div className="bg-canvas border border-hairline rounded-lg p-4 flex flex-col gap-4 text-[14px]">
                    <div className="flex justify-between border-b border-hairline pb-2">
                      <span className="text-ink-muted">Revenue Generated</span>
                      <span className="font-mono-numbers font-medium text-ink">₹{selectedPersona.revenueContribution.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-hairline pb-2">
                      <span className="text-ink-muted">Monthly Trend</span>
                      <span className={clsx("font-medium", selectedPersona.monthlyTrend.startsWith('-') ? "text-semantic-danger" : "text-semantic-success")}>
                        {selectedPersona.monthlyTrend}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-hairline pb-2">
                      <span className="text-ink-muted">Risk Exposure</span>
                      <span className={clsx("font-medium", selectedPersona.churnRisk.includes('High') ? "text-semantic-danger" : selectedPersona.churnRisk === 'Medium' ? "text-semantic-warning" : "text-semantic-success")}>
                         {selectedPersona.churnRisk}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 pt-2">
                       <span className="text-ink-muted">AI Summary</span>
                       <p className="text-ink text-[13px] leading-relaxed">{selectedPersona.aiSummary}</p>
                    </div>
                 </div>
               </div>

               <div className="flex flex-col gap-2">
                 <span className="label-text">Engagement & Behavior</span>
                 <div className="bg-canvas border border-hairline rounded-lg p-4 flex flex-col gap-4 text-[14px]">
                    <div className="flex justify-between border-b border-hairline pb-2">
                      <span className="text-ink-muted">Avg. Order Value</span>
                      <span className="font-mono-numbers font-medium text-ink">₹{selectedPersona.avgAOV?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between border-b border-hairline pb-2">
                      <span className="text-ink-muted">Avg. Lifetime Value</span>
                      <span className="font-mono-numbers font-medium text-ink">₹{selectedPersona.avgLTV?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between border-b border-hairline pb-2">
                      <span className="text-ink-muted">Purchase Frequency</span>
                      <span className="font-medium text-ink">{selectedPersona.purchaseFrequency || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-hairline pb-2">
                      <span className="text-ink-muted">Discount Affinity</span>
                      <span className="font-medium text-ink">{selectedPersona.discountAffinity || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-hairline pb-2">
                      <span className="text-ink-muted">Best Channel</span>
                      <span className="font-medium text-ink">{selectedPersona.bestChannel || '-'}</span>
                    </div>
                    {selectedPersona.primaryTraits && selectedPersona.primaryTraits.length > 0 && (
                      <div className="flex flex-col gap-2 pt-2">
                         <span className="text-ink-muted">Key Traits</span>
                         <div className="flex flex-wrap gap-2 mt-1">
                           {selectedPersona.primaryTraits.map((trait: string, idx: number) => (
                             <span key={idx} className="bg-surface-soft border border-hairline px-2 py-1 rounded text-[12px] font-medium text-ink">{trait}</span>
                           ))}
                         </div>
                      </div>
                    )}
                 </div>
               </div>

               <div className="flex flex-col gap-2">
                 <span className="label-text">Action Plan</span>
                 <div className="bg-primary-soft border border-primary/20 rounded-lg p-4 flex flex-col gap-4 text-[14px]">
                    <div className="flex flex-col gap-1 border-b border-primary/10 pb-3">
                      <span className="text-primary font-medium">Recommended Action</span>
                      <span className="font-bold text-ink">{selectedPersona.recommendedAction}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-primary/10 pb-3">
                      <span className="text-primary font-medium">Revenue Opportunity</span>
                      <span className="font-mono-numbers font-bold text-semantic-success">₹{selectedPersona.revenueOpportunity?.toLocaleString()}</span>
                    </div>
                    <button onClick={() => router.push(`/chat?goal=${encodeURIComponent(selectedPersona.recommendedAction)}&persona=${selectedPersona.id}`)} className="btn-primary w-full mt-2">
                      Strategize Campaign
                    </button>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-hairline pb-8">
        <h1>Persona Discovery</h1>
        <p className="max-w-2xl">
          The AI engine analyzes behavioral data to generate dynamic customer segments and uncover their business story.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-6">
        <div className="card flex flex-col gap-1 p-5">
          <span className="label-text">Total Personas</span>
          <span className="text-[32px] font-bold text-ink font-mono-numbers">{totalPersonas}</span>
        </div>
        <div className="card flex flex-col gap-1 p-5">
          <span className="label-text">Addressable Audience</span>
          <span className="text-[32px] font-bold text-ink font-mono-numbers">{totalAudience.toLocaleString()}</span>
        </div>
        <div className="card flex flex-col gap-1 p-5">
          <span className="label-text">Highest Revenue Segment</span>
          <span className="text-[32px] font-bold text-ink truncate" title={highestRevenue?.name}>{highestRevenue?.name || '-'}</span>
        </div>
        <div className="card flex flex-col gap-1 p-5">
          <span className="label-text">Highest Risk Segment</span>
          <span className="text-[32px] font-bold text-semantic-danger truncate" title={highestRisk?.name}>{highestRisk?.name || '-'}</span>
        </div>
      </div>

      <div className="flex flex-col w-full">
        {!personas || personas.length === 0 ? (
          <div className="p-16 border border-hairline rounded-xl bg-canvas text-center flex flex-col items-center justify-center gap-4">
            <Spark height={32} width={32} className="text-ink-muted" />
            <p className="text-[15px] text-ink font-bold">No personas generated yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table-enterprise">
              <thead>
                <tr>
                  <th>Persona Name</th>
                  <th>Audience Size</th>
                  <th className="text-right">Revenue Generated</th>
                  <th>Growth</th>
                  <th>Risk</th>
                  <th>Recommended Action</th>
                </tr>
              </thead>
              <tbody>
                {personas.map((p: any) => {
                  return (
                    <tr key={p.id} onClick={() => setSelectedId(p.id)} className="cursor-pointer">
                      <td className="font-medium text-ink max-w-[200px] truncate" title={p.name}>{p.name}</td>
                      <td className="font-mono-numbers">{p.customerCount.toLocaleString()}</td>
                      <td className="text-right font-mono-numbers font-medium text-ink">₹{p.revenueContribution.toLocaleString()}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <span className={clsx("font-mono-numbers", p.monthlyTrend.startsWith('-') ? "text-semantic-danger" : "text-semantic-success")}>
                            {p.monthlyTrend}
                          </span>
                          {p.monthlyTrend.startsWith('-') ? <ArrowDown height={12} width={12} className="text-semantic-danger" /> : <ArrowUp height={12} width={12} className="text-semantic-success" />}
                        </div>
                      </td>
                      <td>
                        <span className={clsx("font-medium text-[13px]", p.churnRisk.includes('High') ? "text-semantic-danger" : p.churnRisk === 'Medium' ? "text-semantic-warning" : "text-semantic-success")}>
                           {p.churnRisk}
                        </span>
                      </td>
                      <td className="max-w-[200px] truncate text-ink-muted text-[13px]" title={p.recommendedAction}>
                        {p.recommendedAction}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
