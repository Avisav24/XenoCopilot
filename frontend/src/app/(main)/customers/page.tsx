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
    <div className="flex flex-col w-full min-h-screen bg-slate-50 text-slate-900">
      
      {/* HEADER */}
      <div className="px-8 pt-8 pb-6 bg-white border-b border-gray-200 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center bg-slate-50 text-slate-700">
            <UserStar height={16} width={16} />
          </div>
          <h1 className="text-[20px] font-bold tracking-tight">Customer Intelligence</h1>
        </div>
      </div>

      <div className="w-full max-w-[1200px] mx-auto p-8 flex flex-col gap-6">
        
        {/* ACTION BAR */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 rounded-[12px] shadow-sm border border-gray-200">
           <div className="relative w-full md:max-w-md">
             <Search height={18} width={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
               type="text"
               value={searchTerm}
               onChange={(e) => {
                 setSearchTerm(e.target.value);
                 setPage(0);
               }}
               placeholder="Search by name, email, phone or city..."
               className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-[8px] text-[14px] focus:outline-none focus:border-slate-800 transition-colors"
             />
           </div>
           
           <button 
             onClick={() => setIsBuilderOpen(true)}
             className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-[8px] text-[13px] font-bold transition-colors flex items-center justify-center gap-2 shadow-sm w-full md:w-auto"
           >
             <Filter height={16} width={16} />
             Segment Builder
           </button>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white border border-gray-200 rounded-[12px] shadow-sm overflow-x-auto flex flex-col w-full">
           <table className="w-full text-left whitespace-nowrap md:whitespace-normal">
             <thead className="bg-slate-50 border-b border-gray-200">
               <tr>
                 <th className="py-3 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                 <th className="py-3 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Health</th>
                 <th className="py-3 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Lifetime Value</th>
                 <th className="py-3 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Personas</th>
                 <th className="py-3 px-6 w-10 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {isLoading ? (
                 <tr>
                   <td colSpan={5} className="py-8 text-center text-slate-500 text-[14px]">Loading intelligence profiles...</td>
                 </tr>
               ) : data?.customers?.length === 0 ? (
                 <tr>
                   <td colSpan={5} className="py-8 text-center text-slate-500 text-[14px]">No customers found matching criteria.</td>
                 </tr>
               ) : (
                 data?.customers?.map((customer: any) => (
                   <tr key={customer.id} className="hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => router.push(`/customers/${customer.id}`)}>
                     <td className="py-4 px-6">
                       <div className="flex flex-col">
                         <span className="text-[14px] font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{customer.name}</span>
                         <span className="text-[12px] text-slate-500">{customer.email || customer.phone || 'No contact info'}</span>
                       </div>
                     </td>
                     <td className="py-4 px-6">
                       <div className="flex items-center gap-2">
                         <div className={clsx("w-2 h-2 rounded-full", customer.health_score > 70 ? 'bg-emerald-500' : customer.health_score > 40 ? 'bg-amber-500' : 'bg-red-500')} />
                         <span className="text-[13px] font-mono font-bold">{customer.health_score}</span>
                       </div>
                     </td>
                     <td className="py-4 px-6 text-[14px] font-mono font-bold text-slate-900">
                       ₹{customer.total_spent.toLocaleString()}
                     </td>
                     <td className="py-4 px-6">
                       <div className="flex gap-1 flex-wrap">
                         {customer.personas?.slice(0, 2).map((p: string, i: number) => (
                           <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-[4px] text-[11px] font-bold">
                             {p}
                           </span>
                         ))}
                         {customer.personas?.length > 2 && (
                           <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-[4px] text-[11px] font-bold">
                             +{customer.personas.length - 2}
                           </span>
                         )}
                       </div>
                     </td>
                     <td className="py-4 px-6">
                        <button className="text-slate-400 group-hover:text-emerald-600 transition-colors flex justify-end w-full">
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
             <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-slate-50">
               <span className="text-[12px] text-slate-500 font-medium">
                 Showing {page * 20 + 1} to {Math.min((page + 1) * 20, data.total)} of {data.total}
               </span>
               <div className="flex gap-2">
                 <button 
                   disabled={page === 0} 
                   onClick={(e) => { e.stopPropagation(); setPage(p => p - 1); }}
                   className="px-3 py-1 bg-white border border-gray-200 rounded-[6px] text-[12px] font-bold disabled:opacity-50"
                 >
                   Prev
                 </button>
                 <button 
                   disabled={(page + 1) * 20 >= data.total} 
                   onClick={(e) => { e.stopPropagation(); setPage(p => p + 1); }}
                   className="px-3 py-1 bg-white border border-gray-200 rounded-[6px] text-[12px] font-bold disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-sm">
          <div className="w-[600px] bg-white border-l border-[#E5E7EB] shadow-2xl h-full flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300">
            
            <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB] bg-white sticky top-0 z-10">
              <div className="flex flex-col">
                <h2 className="text-[18px] font-[600] text-gray-900">Segment Builder</h2>
                <span className="text-[13px] text-gray-500">Target specific customer cohorts</span>
              </div>
              <button onClick={() => setIsBuilderOpen(false)} className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-500">
                <Xmark height={20} width={20} />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-10">
               
               {/* NLP QUERY */}
               <div className="flex flex-col gap-4">
                  <span className="text-[13px] font-[600] text-gray-900 uppercase tracking-wider">Natural Language Generation</span>
                  <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-5 flex flex-col gap-4 shadow-sm">
                     <form onSubmit={handleNlSubmit} className="flex flex-col gap-3">
                        <textarea 
                           value={nlQuery}
                           onChange={e => setNlQuery(e.target.value)}
                           placeholder="e.g., Show VIPs who haven't purchased in 90 days."
                           className="w-full bg-slate-50 border border-[#E5E7EB] rounded-[8px] px-4 py-3 text-[14px] text-gray-900 focus:outline-none focus:border-gray-400 min-h-[90px] resize-none"
                        />
                        <button 
                           type="submit"
                           disabled={nlResult === 'loading' || !nlQuery.trim()}
                           className="bg-gray-900 hover:bg-black disabled:bg-gray-300 text-white font-[600] py-2.5 rounded-[8px] transition-colors text-[13px] flex justify-center items-center gap-2"
                        >
                           {nlResult === 'loading' ? <><Spark className="animate-pulse"/> Analyzing...</> : 'Generate Segment'}
                        </button>
                     </form>

                     {nlResult && nlResult !== 'loading' && (
                        <div className="mt-2 border-t border-[#E5E7EB] pt-4 flex flex-col gap-4">
                           <div className="grid grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1 border-r border-[#E5E7EB]">
                                 <span className="text-[11px] font-[500] text-gray-500 uppercase tracking-widest">Audience</span>
                                 <span className="text-[20px] font-[600] text-gray-900 font-mono tracking-tight">{nlResult.audienceSize}</span>
                              </div>
                              <div className="flex flex-col gap-1">
                                 <span className="text-[11px] font-[500] text-gray-500 uppercase tracking-widest">Revenue</span>
                                 <span className="text-[20px] font-[600] text-gray-900 font-mono tracking-tight">{nlResult.revenuePotential}</span>
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
                           }} className="w-full bg-white border border-[#E5E7EB] hover:bg-gray-50 text-gray-900 font-[600] py-2.5 rounded-[8px] transition-colors text-[13px]">
                              Send to Campaign Studio
                           </button>
                        </div>
                     )}
                  </div>
               </div>

               <div className="h-px bg-[#E5E7EB] w-full" />

               {/* PERSONAS */}
               <div className="flex flex-col gap-4">
                  <span className="text-[13px] font-[600] text-gray-900 uppercase tracking-wider">AI Generated Personas</span>
                  <div className="flex flex-col gap-4">
                     {personas?.map((p: any) => (
                        <div key={p.id} className="bg-white border border-[#E5E7EB] rounded-[12px] p-5 flex flex-col gap-4 shadow-sm hover:border-gray-400 transition-all group">
                           <div className="flex justify-between items-start">
                              <div className="flex flex-col gap-0.5">
                                 <h3 className="text-[15px] font-[600] text-gray-900">{p.name}</h3>
                                 <span className="text-[12px] font-[500] text-gray-500 uppercase tracking-widest">{(p.customerCount || 0).toLocaleString()} Customers</span>
                              </div>
                              <span className="text-[11px] font-[600] text-gray-500 border border-[#E5E7EB] px-2 py-0.5 rounded-[4px] uppercase bg-slate-50">{p.churnRisk} Risk</span>
                           </div>

                           <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E5E7EB]">
                              <div className="flex flex-col gap-1">
                                 <span className="text-[11px] font-[500] text-gray-500 uppercase tracking-widest">Est. Revenue</span>
                                 <span className="text-[16px] font-[600] text-gray-900 font-mono tracking-tight">₹{(p.revenueContribution || 0).toLocaleString()}</span>
                              </div>
                              <div className="flex flex-col gap-1">
                                 <span className="text-[11px] font-[500] text-gray-500 uppercase tracking-widest">Best Channel</span>
                                 <span className="text-[14px] font-[600] text-gray-900 pt-0.5">{p.bestChannels?.[0] || 'Email'}</span>
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
                           }} className="mt-2 w-full flex items-center justify-center gap-2 text-[13px] font-[600] text-gray-600 hover:text-gray-900 bg-slate-50 hover:bg-slate-100 py-2.5 rounded-[8px] transition-colors border border-[#E5E7EB]">
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
