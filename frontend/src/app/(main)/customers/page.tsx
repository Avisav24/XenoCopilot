'use client';

import React, { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Search, UserStar, FastArrowRight, Spark, NavArrowRight } from 'iconoir-react';
import { clsx } from 'clsx';

export default function CustomersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, searchTerm],
    queryFn: () => fetchAPI<any>(`/api/customers?limit=20&offset=${page * 20}&search=${encodeURIComponent(searchTerm)}`),
    placeholderData: keepPreviousData
  });

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
        
        {/* SEARCH BAR */}
        <div className="flex justify-between items-center bg-white p-4 rounded-[12px] shadow-sm border border-gray-200">
           <div className="relative w-full max-w-md">
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
        </div>

        {/* DATA TABLE */}
        <div className="bg-white border border-gray-200 rounded-[12px] shadow-sm overflow-hidden flex flex-col">
           <table className="w-full text-left">
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
    </div>
  );
}
