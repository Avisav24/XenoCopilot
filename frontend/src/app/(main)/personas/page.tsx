'use client';

import { useQuery } from '@tanstack/react-query';
import { getDynamicPersonas } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Spark, ArrowUp, ArrowDown, Xmark, Group, Filter, GraphUp, WarningTriangle, User, DataTransferBoth, FastArrowRight, Sparks } from 'iconoir-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import { setCampaignContext } from '@/lib/campaignContext';

export default function PersonasPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [nlSegmentQuery, setNlSegmentQuery] = useState('');
  const [nlResult, setNlResult] = useState<any>(null);

  const { data: personas, isLoading } = useQuery({
    queryKey: ['dynamic-personas'],
    queryFn: getDynamicPersonas,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px] text-slate-500 font-medium">
        Loading business segments...
      </div>
    );
  }

  const handleNlSegmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlSegmentQuery) return;
    setNlResult('loading');
    setTimeout(() => {
      setNlResult({
         filters: [
            { field: 'Total Spend', operator: '>', value: '₹5000' },
            { field: 'Last Purchase', operator: '>', value: '90 Days' }
         ],
         audienceSize: 428,
         revenuePotential: '₹1.72L'
      });
    }, 1200);
  };

  const selectedPersona = personas?.find((p: any) => p.id === selectedId);

  return (
    <div className="flex flex-col gap-8 w-full pb-24 max-w-[1400px]">
      
      {/* Side Drawer */}
      {selectedPersona && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 backdrop-blur-sm">
          <div className="w-[500px] bg-white border-l border-slate-200 shadow-2xl h-full flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
              <div className="flex flex-col gap-1">
                <h2 className="text-[20px] font-bold text-slate-900 leading-none">{selectedPersona.name}</h2>
                <span className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{(selectedPersona.customerCount || 0).toLocaleString()} Customers</span>
              </div>
              <button onClick={() => setSelectedId(null)} className="p-1.5 hover:bg-slate-200 rounded-md transition-colors text-slate-500 hover:text-slate-900">
                <Xmark height={20} width={20} />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-8">
               <div className="flex flex-col gap-2">
                 <span className="text-[13px] font-bold text-slate-900 uppercase">Business Entity Profile</span>
                 <div className="border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <span className="text-[13px] font-semibold text-slate-600">Revenue Contribution</span>
                      <span className="font-mono-numbers font-bold text-slate-900 text-[15px]">₹{(selectedPersona.revenueContribution || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <span className="text-[13px] font-semibold text-slate-600">Monthly Trend</span>
                      <span className={clsx("font-bold text-[14px]", selectedPersona.monthlyTrend.startsWith('-') ? "text-red-600" : "text-emerald-600")}>
                        {selectedPersona.monthlyTrend}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors">
                      <span className="text-[13px] font-semibold text-slate-600">Risk Level</span>
                      <span className={clsx("font-bold text-[13px] px-2.5 py-1 rounded uppercase tracking-wider", selectedPersona.churnRisk.includes('High') ? "bg-red-100 text-red-800" : selectedPersona.churnRisk === 'Medium' ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800")}>
                         {selectedPersona.churnRisk} Risk
                      </span>
                    </div>
                 </div>
               </div>

               <div className="flex flex-col gap-2">
                 <span className="text-[13px] font-bold text-slate-900 uppercase">Economics & Strategy</span>
                 <div className="border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <span className="text-[13px] font-semibold text-slate-600">Average Order Value (AOV)</span>
                      <span className="font-mono-numbers font-bold text-slate-900 text-[15px]">₹{selectedPersona.avgAOV?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <span className="text-[13px] font-semibold text-slate-600">Average Lifetime Value (LTV)</span>
                      <span className="font-mono-numbers font-bold text-slate-900 text-[15px]">₹{selectedPersona.avgLTV?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <span className="text-[13px] font-semibold text-slate-600">Best Channel</span>
                      <span className="font-bold text-slate-900 text-[14px]">{selectedPersona.bestChannels?.[0]?.channel || 'Email'}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors bg-blue-50/50">
                      <span className="text-[13px] font-semibold text-blue-800">Best Campaign Type</span>
                      <span className="font-bold text-blue-900 text-[14px]">Win-Back Sequence</span>
                    </div>
                 </div>
               </div>

               <div className="flex flex-col gap-2">
                  <span className="text-[13px] font-bold text-slate-900 uppercase">Business Summary</span>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                     <p className="text-[14px] text-slate-700 leading-relaxed font-medium">
                        This audience represents a high-value cohort contributing significantly to overall LTV. They are highly responsive to {selectedPersona.bestChannels?.[0]?.channel || 'Email'} campaigns, specifically reacting well to exclusivity triggers rather than raw discounts.
                     </p>
                  </div>
               </div>

               <div className="flex justify-end pt-4 border-t border-slate-100 mt-auto">
                  <button onClick={() => {
                     setCampaignContext({
                        sourcePage: 'Personas',
                        audienceName: selectedPersona.name,
                        audienceSize: selectedPersona.customerCount,
                        expectedRevenue: selectedPersona.revenueContribution,
                        recommendedChannel: selectedPersona.bestChannels?.[0]?.channel || 'Email',
                        autoTriggerPrompt: `Create a ${selectedPersona.bestChannels?.[0]?.channel || 'Email'} campaign for ${selectedPersona.name}. Audience size ${selectedPersona.customerCount}. Average order value ₹${selectedPersona.avgAOV}. Generate the best campaign strategy.`
                     });
                     router.push('/chat');
                  }} className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-lg transition-colors shadow-sm w-full">
                     Generate Campaign for Audience
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-bold text-slate-900 leading-none">Personas & Segments</h1>
          <p className="max-w-2xl text-[15px] text-slate-500">
            Understand the economics, behavior, and revenue potential of your customer cohorts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Left Col (Segment Builder) */}
         <div className="lg:col-span-1 flex flex-col gap-8">
            
            {/* Natural Language Builder */}
            <div className="flex flex-col gap-4">
               <h2 className="text-[18px] font-bold text-slate-900">Segment Builder</h2>
               <div className="border border-slate-200 rounded-xl bg-white shadow-sm p-5 flex flex-col gap-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-slate-900" />
                  
                  <form onSubmit={handleNlSegmentSubmit} className="flex flex-col gap-3">
                     <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1.5"><Filter height={16} width={16} className="text-slate-900"/> Natural Language Query</label>
                     <textarea 
                        value={nlSegmentQuery}
                        onChange={e => setNlSegmentQuery(e.target.value)}
                        placeholder="e.g., Show customers who spent more than ₹5000 and have not purchased in 90 days."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-[14px] text-slate-900 focus:outline-none focus:border-slate-400 min-h-[100px] resize-none"
                     />
                     <button 
                        type="submit"
                        disabled={nlResult === 'loading' || !nlSegmentQuery.trim()}
                        className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-lg transition-colors text-[14px]"
                     >
                        {nlResult === 'loading' ? 'Analyzing Query...' : 'Generate Audience'}
                     </button>
                  </form>

                  {nlResult && nlResult !== 'loading' && (
                     <div className="mt-2 border-t border-slate-100 pt-4 flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                           <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Detected Filters</span>
                           {nlResult.filters.map((f: any, idx: number) => (
                              <div key={idx} className="bg-slate-100 border border-slate-200 px-3 py-2 rounded-md flex items-center gap-2 text-[13px] font-mono">
                                 <span className="font-bold text-slate-700">{f.field}</span>
                                 <span className="text-slate-600 font-bold">{f.operator}</span>
                                 <span className="font-bold text-slate-900">{f.value}</span>
                              </div>
                           ))}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                           <div className="flex flex-col gap-0.5">
                              <span className="text-[11px] font-semibold text-slate-500 uppercase">Audience Size</span>
                              <span className="text-[18px] font-bold text-slate-900 font-mono-numbers">{nlResult.audienceSize}</span>
                           </div>
                           <div className="flex flex-col gap-0.5">
                              <span className="text-[11px] font-semibold text-slate-500 uppercase">Revenue Potential</span>
                              <span className="text-[18px] font-bold text-emerald-600 font-mono-numbers">{nlResult.revenuePotential}</span>
                           </div>
                        </div>
                        <button onClick={() => {
                           setCampaignContext({
                              sourcePage: 'Segment Builder',
                              audienceName: 'Custom Segment',
                              audienceSize: nlResult.audienceSize,
                              expectedRevenue: nlResult.revenuePotential,
                              autoTriggerPrompt: `Create a campaign for a custom segment of ${nlResult.audienceSize} customers. Expected revenue is ${nlResult.revenuePotential}. Generate the best campaign strategy.`
                           });
                           router.push('/chat');
                        }} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg transition-colors text-[13px]">
                           Generate Campaign
                        </button>
                     </div>
                  )}
               </div>
            </div>

            {/* Rule-Based Builder (Static Preview) */}
            <div className="border border-slate-200 rounded-xl bg-white shadow-sm p-5 flex flex-col gap-4">
               <span className="text-[13px] font-bold text-slate-900 uppercase">Rule-Based Segment</span>
               
               <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                     <select className="bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-[13px] flex-1">
                        <option>Total Spend</option>
                     </select>
                     <select className="bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-[13px] w-16 text-center">
                        <option>&gt;</option>
                     </select>
                     <input type="text" value="₹5000" readOnly className="bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-[13px] w-20 font-mono" />
                  </div>
                  <div className="flex items-center gap-2 pl-4 border-l-2 border-slate-200 ml-2 py-1">
                     <span className="text-[11px] font-bold text-slate-400">AND</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <select className="bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-[13px] flex-1">
                        <option>Last Purchase</option>
                     </select>
                     <select className="bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-[13px] w-16 text-center">
                        <option>&gt;</option>
                     </select>
                     <input type="text" value="60 Days" readOnly className="bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-[13px] w-20 font-mono" />
                  </div>
                  <div className="flex items-center gap-2 pl-4 border-l-2 border-slate-200 ml-2 py-1">
                     <span className="text-[11px] font-bold text-slate-400">AND</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <select className="bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-[13px] flex-1">
                        <option>Orders</option>
                     </select>
                     <select className="bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-[13px] w-16 text-center">
                        <option>&gt;</option>
                     </select>
                     <input type="text" value="3" readOnly className="bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-[13px] w-20 font-mono" />
                  </div>
               </div>

               <div className="flex justify-between mt-2 pt-4 border-t border-slate-100">
                  <button className="text-[13px] font-bold text-slate-600 hover:text-slate-900 transition-colors">Save Segment</button>
                  <button className="text-[13px] font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">Preview <FastArrowRight height={14} width={14} /></button>
               </div>
            </div>

         </div>

         {/* Right Col (Business Entities) */}
         <div className="lg:col-span-2 flex flex-col gap-6">
            <h2 className="text-[18px] font-bold text-slate-900">Business Entities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {personas?.map((p: any) => (
                  <div 
                     key={p.id} 
                     onClick={() => setSelectedId(p.id)}
                     className="border border-slate-200 rounded-xl bg-white shadow-sm p-6 flex flex-col gap-4 cursor-pointer hover:border-slate-400 hover:shadow-md transition-all group"
                  >
                     <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                           <h3 className="text-[16px] font-bold text-slate-900 group-hover:text-slate-700 transition-colors">{p.name}</h3>
                           <span className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider">{(p.customerCount || 0).toLocaleString()} Customers</span>
                        </div>
                        <span className={clsx("text-[11px] font-bold px-2 py-1 rounded uppercase", p.churnRisk.includes('High') ? "bg-red-100 text-red-800" : p.churnRisk === 'Medium' ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800")}>
                           {p.churnRisk} Risk
                        </span>
                     </div>

                     <div className="grid grid-cols-2 gap-4 mt-1">
                        <div className="flex flex-col gap-1">
                           <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Revenue Contribution</span>
                           <span className="text-[18px] font-bold text-slate-900 font-mono-numbers">₹{(p.revenueContribution || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                           <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Average Order Value</span>
                           <span className="text-[18px] font-bold text-slate-900 font-mono-numbers">₹{p.avgAOV?.toLocaleString() || 0}</span>
                        </div>
                     </div>

                     <div className="flex flex-col gap-1 mt-2">
                        <span className="text-[11px] font-bold text-slate-900 uppercase">Business Summary</span>
                        <p className="text-[13px] text-slate-600 font-medium leading-snug line-clamp-2">This audience represents a high-value cohort contributing significantly to overall LTV. They are highly responsive to {p.bestChannels?.[0] || 'Email'} campaigns.</p>
                     </div>

                     <div className="border-t border-slate-100 pt-4 mt-2 flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                           <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Best Channel</span>
                           <span className="text-[12px] font-bold text-slate-900">{p.bestChannels?.[0] || 'Email'}</span>
                        </div>
                        <span className="text-[12px] font-bold text-slate-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                           Analyze Entity <FastArrowRight height={14} width={14} />
                        </span>
                     </div>
                  </div>
               ))}
            </div>
         </div>

      </div>

    </div>
  );
}
