'use client';

import { ArrowUpRight, FastArrowRight, Plus, Group, DatabaseScript, Megaphone } from 'iconoir-react';
import { useRouter } from 'next/navigation';

export default function RevenueOperationsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 w-full pb-24 max-w-[1400px]">
      
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-bold text-slate-900 leading-none">Revenue Operations</h1>
          <p className="max-w-2xl text-[15px] text-slate-500">
            Identify revenue opportunities, plan strategies, and execute campaigns to maximize customer LTV.
          </p>
        </div>
      </div>

      {/* SECTION 1: KPI Row (Exactly 5 cards) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-0 border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden divide-x divide-slate-200">
         <div className="p-5 flex flex-col gap-1">
            <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Revenue Influenced</span>
            <span className="text-[22px] font-bold text-slate-900 font-mono-numbers">₹18.4L</span>
            <span className="text-[12px] font-medium text-emerald-600 mt-1 flex items-center gap-1"><ArrowUpRight height={12} width={12}/> 12% vs last month</span>
         </div>
         <div className="p-5 flex flex-col gap-1">
            <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Revenue At Risk</span>
            <span className="text-[22px] font-bold text-slate-900 font-mono-numbers">₹4.2L</span>
            <span className="text-[12px] font-medium text-slate-500 mt-1 leading-snug">184 customers inactive 60+ days</span>
         </div>
         <div className="p-5 flex flex-col gap-1">
            <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Top Opportunity</span>
            <span className="text-[16px] font-bold text-slate-900 mt-1">Dormant VIP Recovery</span>
            <span className="text-[12px] font-medium text-slate-500 mt-1">₹1.72L potential</span>
         </div>
         <div className="p-5 flex flex-col gap-1">
            <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Best Channel</span>
            <span className="text-[16px] font-bold text-slate-900 mt-1">WhatsApp</span>
            <span className="text-[12px] font-medium text-slate-500 mt-1">6.4% conversion rate</span>
         </div>
         <div className="p-5 flex flex-col gap-1 bg-slate-50">
            <span className="text-[12px] font-semibold text-slate-900 uppercase tracking-wider">Recommended Action</span>
            <span className="text-[16px] font-bold text-slate-900 mt-1">Launch VIP Recovery</span>
            <span className="text-[12px] font-medium text-slate-500 mt-1">Highest ROI opportunity</span>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-2">
        
        {/* Left Column (Opportunities Table - 70% width) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
           <h2 className="text-[18px] font-bold text-slate-900">Revenue Opportunities</h2>
           
           <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                 <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                       <th className="py-4 px-6 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Opportunity</th>
                       <th className="py-4 px-6 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-right">Audience</th>
                       <th className="py-4 px-6 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-right">Revenue</th>
                       <th className="py-4 px-6 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Priority</th>
                       <th className="py-4 px-6 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {[
                       { opp: 'Dormant VIP Recovery', aud: '428', rev: '₹1.72L', prio: 'High' },
                       { opp: 'VIP Retention', aud: '98', rev: '₹1.25L', prio: 'High' },
                       { opp: 'Cross-Sell Expansion', aud: '126', rev: '₹81K', prio: 'Medium' },
                       { opp: 'Weekend Activation', aud: '812', rev: '₹48K', prio: 'Medium' }
                    ].map(row => (
                       <tr key={row.opp} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-5 px-6 font-bold text-slate-900 text-[14px]">{row.opp}</td>
                          <td className="py-5 px-6 text-[14px] font-mono-numbers text-right text-slate-600">{row.aud}</td>
                          <td className="py-5 px-6 text-[14px] font-mono-numbers text-right font-bold text-emerald-600">{row.rev}</td>
                          <td className="py-5 px-6">
                             <span className={`text-[12px] font-bold px-2.5 py-1 rounded uppercase tracking-wider ${row.prio === 'High' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                                {row.prio}
                             </span>
                          </td>
                          <td className="py-5 px-6 text-right">
                             <button onClick={() => router.push('/chat')} className="text-[13px] font-bold text-blue-600 hover:text-blue-800 transition-colors">
                                Generate Campaign
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Right Column (Recent Activity & Quick Actions - 30% width) */}
        <div className="lg:col-span-1 flex flex-col gap-8">

           {/* Quick Actions */}
           <div className="flex flex-col gap-4">
              <h2 className="text-[18px] font-bold text-slate-900">Quick Actions</h2>
              
              <div className="border border-slate-200 rounded-xl bg-white shadow-sm p-3 flex flex-col gap-1">
                 <button onClick={() => router.push('/chat')} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 rounded-lg transition-colors group">
                    <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                       <Megaphone height={16} width={16} />
                    </div>
                    <span className="text-[14px] font-bold text-slate-900">Generate Campaign</span>
                 </button>
                 <button onClick={() => router.push('/intelligence')} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 rounded-lg transition-colors group">
                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                       <Plus height={16} width={16} />
                    </div>
                    <span className="text-[14px] font-bold text-slate-900">Create Audience</span>
                 </button>
                 <button onClick={() => router.push('/import')} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 rounded-lg transition-colors group">
                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                       <DatabaseScript height={16} width={16} />
                    </div>
                    <span className="text-[14px] font-bold text-slate-900">Import Data</span>
                 </button>
                 <button onClick={() => router.push('/intelligence')} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 rounded-lg transition-colors group">
                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                       <Group height={16} width={16} />
                    </div>
                    <span className="text-[14px] font-bold text-slate-900">Review Customers</span>
                 </button>
              </div>
           </div>

        </div>

      </div>

    </div>
  );
}
