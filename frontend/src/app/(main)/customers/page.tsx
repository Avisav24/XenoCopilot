'use client';

import React, { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchAPI, getDynamicPersonas } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Search, UserStar, NavArrowRight, Filter, Xmark, FastArrowRight, Spark } from 'iconoir-react';
import { setCampaignContext } from '@/lib/campaignContext';
import { clsx } from 'clsx';

export default function CustomersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [nlQuery, setNlQuery] = useState('');
  const [nlResult, setNlResult] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, searchTerm],
    queryFn: () => fetchAPI<any>(`/api/customers?limit=20&offset=${page * 20}&search=${encodeURIComponent(searchTerm)}`),
    placeholderData: keepPreviousData
  });

  const { data: personas } = useQuery({
    queryKey: ['dynamic-personas'],
    queryFn: getDynamicPersonas,
  });

  const handleNlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlQuery) return;
    setNlResult('loading');
    setTimeout(() => {
      setNlResult({
         filters: [{ field: 'Total Spend', operator: '>', value: '₹5000' }, { field: 'Last Purchase', operator: '>', value: '90 Days' }],
         audienceSize: 428,
         revenuePotential: '₹1.72L'
      });
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-canvas pb-20">
      
      {/* HEADER */}
      <div className="px-6 py-6 border-b border-hairline flex items-center justify-between sticky top-0 z-10 bg-canvas/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-hairline flex items-center justify-center bg-white text-ink">
            <UserStar height={16} width={16} />
          </div>
          <h1 className="text-[24px] font-[700] text-ink leading-tight tracking-tight">Customer Intelligence</h1>
        </div>
      </div>

      <div className="w-full max-w-[1200px] mx-auto p-6 flex flex-col gap-6">
        
        {/* ACTION BAR */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 rounded-[8px] border border-hairline">
           <div className="relative w-full md:max-w-md">
             <Search height={18} width={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
             <input 
               type="text"
               value={searchTerm}
               onChange={(e) => {
                 setSearchTerm(e.target.value);
                 setPage(0);
               }}
               placeholder="Search by name, email, phone or city..."
               className="w-full pl-10 pr-4 py-2 border border-hairline rounded-[6px] text-[13px] bg-white text-ink focus:outline-none focus:border-ink transition-colors"
             />
           </div>
           
           <button 
             onClick={() => setIsBuilderOpen(true)}
             className="btn-primary flex items-center justify-center gap-2 w-full md:w-auto"
           >
             <Filter height={16} width={16} />
             Segment Builder
           </button>
        </div>

        {/* DATA TABLE */}
        <div className="table-container">
           <table className="table-enterprise">
             <thead>
               <tr>
                 <th>Customer</th>
                 <th>Health</th>
                 <th>Lifetime Value</th>
                 <th>Personas</th>
                 <th className="text-right">Action</th>
               </tr>
             </thead>
             <tbody className="bg-white">
               {isLoading ? (
                 <tr>
                   <td colSpan={5} className="py-8 text-center text-ink-muted text-[14px]">Loading intelligence profiles...</td>
                 </tr>
               ) : data?.customers?.length === 0 ? (
                 <tr>
                   <td colSpan={5} className="py-8 text-center text-ink-muted text-[14px]">No customers found matching criteria.</td>
                 </tr>
               ) : (
                 data?.customers?.map((customer: any) => (
                   <tr key={customer.id} className="hover:bg-canvas-soft transition-colors cursor-pointer group" onClick={() => router.push(`/customers/${customer.id}`)}>
                     <td>
                       <div className="flex flex-col">
                         <span className="text-[14px] font-[600] text-ink group-hover:text-primary transition-colors">{customer.name}</span>
                         <span className="text-[12px] text-ink-muted">{customer.email || customer.phone || 'No contact info'}</span>
                       </div>
                     </td>
                     <td>
                       <div className="flex items-center gap-2">
                         <div className={clsx("w-2 h-2 rounded-full", customer.health_score > 70 ? 'bg-green-500' : customer.health_score > 40 ? 'bg-amber-500' : 'bg-red-500')} />
                         <span className="text-[13px] font-mono-numbers font-[600] text-ink">{customer.health_score}</span>
                       </div>
                     </td>
                     <td className="text-[14px] font-mono-numbers font-[600] text-ink">
                       ₹{customer.total_spent.toLocaleString()}
                     </td>
                     <td>
                       <div className="flex gap-1 flex-wrap">
                         {customer.personas?.slice(0, 2).map((p: string, i: number) => (
                           <span key={i} className="bg-canvas text-ink px-2 py-0.5 rounded-[4px] text-[11px] font-[600] border border-hairline">
                             {p}
                           </span>
                         ))}
                         {customer.personas?.length > 2 && (
                           <span className="bg-canvas text-ink px-2 py-0.5 rounded-[4px] text-[11px] font-[600] border border-hairline">
                             +{customer.personas.length - 2}
                           </span>
                         )}
                       </div>
                     </td>
                     <td className="text-right">
                        <button className="text-ink-muted group-hover:text-ink transition-colors inline-flex justify-end">
                           <NavArrowRight height={20} width={20} />
                        </button>
                     </td>
                   </tr>
                 ))
               )}
             </tbody>
           </table>
           
           {/* PAGINATION */}
           {data && data.total > 0 && (
             <div className="p-4 border-t border-hairline flex items-center justify-between bg-canvas-soft">
               <span className="text-[12px] text-ink-muted font-[500]">
                 Showing {page * 20 + 1} to {Math.min((page + 1) * 20, data.total)} of {data.total}
               </span>
               <div className="flex gap-2">
                 <button 
                   disabled={page === 0} 
                   onClick={(e) => { e.stopPropagation(); setPage(p => p - 1); }}
                   className="px-3 py-1 bg-white border border-hairline rounded-[6px] text-[12px] font-[600] disabled:opacity-50 hover:bg-canvas transition-colors text-ink"
                 >
                   Prev
                 </button>
                 <button 
                   disabled={(page + 1) * 20 >= data.total} 
                   onClick={(e) => { e.stopPropagation(); setPage(p => p + 1); }}
                   className="px-3 py-1 bg-white border border-hairline rounded-[6px] text-[12px] font-[600] disabled:opacity-50 hover:bg-canvas transition-colors text-ink"
                 >
                   Next
                 </button>
               </div>
             </div>
           )}
        </div>

      </div>

      {/* SEGMENT BUILDER SLIDE-OVER */}
      {isBuilderOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-ink/20 backdrop-blur-sm">
          <div className="w-[600px] max-w-full bg-white border-l border-hairline shadow-2xl h-full flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300">
            
            <div className="flex items-center justify-between p-6 border-b border-hairline bg-white sticky top-0 z-10">
              <div className="flex flex-col gap-1">
                <h2 className="text-[18px] font-[700] text-ink">Segment Builder</h2>
                <span className="text-[13px] text-ink-muted">Target specific customer cohorts</span>
              </div>
              <button onClick={() => setIsBuilderOpen(false)} className="p-2 hover:bg-canvas-soft rounded-[6px] transition-colors text-ink-muted">
                <Xmark height={20} width={20} />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-10">
               
               {/* NLP QUERY */}
               <div className="flex flex-col gap-4">
                  <span className="text-[12px] font-[600] text-ink uppercase tracking-wider">Natural Language Generation</span>
                  <div className="card !p-5 flex flex-col gap-4">
                     <form onSubmit={handleNlSubmit} className="flex flex-col gap-3">
                        <textarea 
                           value={nlQuery}
                           onChange={e => setNlQuery(e.target.value)}
                           placeholder="e.g., Show VIPs who haven't purchased in 90 days."
                           className="w-full bg-canvas-soft border border-hairline rounded-[8px] px-4 py-3 text-[14px] text-ink focus:outline-none focus:border-ink min-h-[90px] resize-none"
                        />
                        <button 
                           type="submit"
                           disabled={nlResult === 'loading' || !nlQuery.trim()}
                           className="btn-primary py-2.5 rounded-[8px] text-[13px] flex justify-center items-center gap-2"
                        >
                           {nlResult === 'loading' ? <><Spark className="animate-pulse"/> Analyzing...</> : 'Generate Segment'}
                        </button>
                     </form>

                     {nlResult && nlResult !== 'loading' && (
                        <div className="mt-2 border-t border-hairline pt-4 flex flex-col gap-4">
                           <div className="grid grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1 border-r border-hairline">
                                 <span className="text-[11px] font-[600] text-ink-muted uppercase tracking-wider">Audience</span>
                                 <span className="text-[20px] font-[600] text-ink font-mono-numbers">{nlResult.audienceSize}</span>
                              </div>
                              <div className="flex flex-col gap-1">
                                 <span className="text-[11px] font-[600] text-ink-muted uppercase tracking-wider">Revenue</span>
                                 <span className="text-[20px] font-[600] text-green-600 font-mono-numbers">{nlResult.revenuePotential}</span>
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
                           }} className="btn-secondary py-2.5 rounded-[8px] text-[13px] w-full text-center">
                              Send to Campaign Studio
                           </button>
                        </div>
                     )}
                  </div>
               </div>

               <div className="h-px bg-hairline w-full" />

               {/* PERSONAS */}
               <div className="flex flex-col gap-4">
                  <span className="text-[12px] font-[600] text-ink uppercase tracking-wider">AI Generated Personas</span>
                  <div className="flex flex-col gap-4">
                     {personas?.map((p: any) => (
                        <div key={p.id} className="card !p-5 flex flex-col gap-4 hover:border-ink transition-all group">
                           <div className="flex justify-between items-start">
                              <div className="flex flex-col gap-1">
                                 <h3 className="text-[15px] font-[700] text-ink">{p.name}</h3>
                                 <span className="text-[12px] font-[600] text-ink-muted uppercase tracking-wider">{(p.customerCount || 0).toLocaleString()} Customers</span>
                              </div>
                              <span className="text-[11px] font-[600] text-ink-muted border border-hairline px-2 py-0.5 rounded-[4px] uppercase bg-canvas-soft">{p.churnRisk} Risk</span>
                           </div>

                           <div className="grid grid-cols-2 gap-4 pt-4 border-t border-hairline">
                              <div className="flex flex-col gap-1">
                                 <span className="text-[11px] font-[600] text-ink-muted uppercase tracking-wider">Est. Revenue</span>
                                 <span className="text-[16px] font-[600] text-green-600 font-mono-numbers">₹{(p.revenueContribution || 0).toLocaleString()}</span>
                              </div>
                              <div className="flex flex-col gap-1">
                                 <span className="text-[11px] font-[600] text-ink-muted uppercase tracking-wider">Best Channel</span>
                                 <span className="text-[14px] font-[600] text-ink">{p.bestChannels?.[0] || 'Email'}</span>
                              </div>
                           </div>

                           <button onClick={() => {
                              setCampaignContext({
                                 sourcePage: 'Personas',
                                 audienceName: p.name,
                                 audienceSize: p.customerCount,
                                 expectedRevenue: p.revenueContribution,
                                 recommendedChannel: p.bestChannels?.[0] || 'Email',
                                 autoTriggerPrompt: `Create a ${p.bestChannels?.[0] || 'Email'} campaign for ${p.name}. Generate strategy.`
                              });
                              router.push('/chat');
                           }} className="mt-2 w-full flex items-center justify-center gap-2 text-[13px] font-[600] text-ink hover:bg-canvas-soft bg-canvas py-2.5 rounded-[8px] transition-colors border border-hairline">
                              Launch Campaign <FastArrowRight height={14} width={14} />
                           </button>
                        </div>
                     ))}
                  </div>
               </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
