'use client';

import { ArrowUpRight, FastArrowRight, CheckCircle, WarningTriangle, ShieldCheck } from 'iconoir-react';
import { clsx } from 'clsx';
import { useRouter } from 'next/navigation';

export default function GrowthOSPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 w-full pb-24 max-w-[1400px]">
      
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-bold text-slate-900 leading-none">Growth OS</h1>
          <p className="max-w-2xl text-[15px] text-slate-500">
            Identify revenue opportunities, plan strategies, and execute campaigns to maximize customer LTV.
          </p>
        </div>
      </div>

      {/* SECTION 1: Executive Briefing Strip (KPI Summary) */}
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
            <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Largest Opportunity</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-8">
           
           {/* SECTION 2: Decision Center (Main Hero) */}
           <div className="flex flex-col gap-4">
              <h2 className="text-[18px] font-bold text-slate-900">Decision Center</h2>
              <div className="border border-slate-200 rounded-xl bg-white shadow-sm p-8 flex flex-col gap-8 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
                 
                 <div className="flex flex-col gap-2">
                    <span className="text-[13px] font-bold text-blue-600 uppercase tracking-wider">Highest Priority Action</span>
                    <span className="text-[28px] font-bold text-slate-900 leading-tight">Launch VIP Win-Back Flow</span>
                 </div>
                 
                 <div className="grid grid-cols-4 gap-6 bg-slate-50 rounded-lg p-5 border border-slate-100">
                    <div className="flex flex-col">
                       <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Potential Revenue</span>
                       <span className="text-[20px] font-bold text-slate-900 font-mono-numbers">₹1.72L</span>
                    </div>
                    <div className="flex flex-col border-l border-slate-200 pl-6">
                       <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Audience Size</span>
                       <span className="text-[20px] font-bold text-slate-900 font-mono-numbers">428</span>
                    </div>
                    <div className="flex flex-col border-l border-slate-200 pl-6">
                       <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Expected Conv</span>
                       <span className="text-[20px] font-bold text-slate-900 font-mono-numbers">4.8%</span>
                    </div>
                    <div className="flex flex-col border-l border-slate-200 pl-6">
                       <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Confidence</span>
                       <span className="text-[20px] font-bold text-emerald-600 font-mono-numbers flex items-center gap-1">
                          82% <ShieldCheck height={16} width={16} />
                       </span>
                    </div>
                 </div>

                 <div className="flex flex-col gap-2">
                    <span className="text-[13px] font-bold text-slate-900 uppercase tracking-wider">Business Reason</span>
                    <p className="text-[15px] text-slate-600 leading-relaxed font-medium max-w-3xl">
                       VIP engagement dropped 11% over the last 14 days.<br/>
                       Historical data shows 4.8% conversion when engaged within the 60-day window.
                    </p>
                 </div>

                 <div className="pt-2">
                    <button 
                       onClick={() => router.push('/chat')} 
                       className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-8 rounded-lg transition-colors shadow-sm text-[15px]"
                    >
                       Open Campaign Studio
                    </button>
                 </div>
              </div>
           </div>

           {/* SECTION 3: Revenue Opportunities (Table) */}
           <div className="flex flex-col gap-4">
              <h2 className="text-[18px] font-bold text-slate-900">Revenue Opportunities</h2>
              
              <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                       <tr>
                          <th className="py-3 px-5 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Opportunity</th>
                          <th className="py-3 px-5 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-right">Audience</th>
                          <th className="py-3 px-5 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-right">Potential Rev</th>
                          <th className="py-3 px-5 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-right">Exp. Conv</th>
                          <th className="py-3 px-5 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-right">Confidence</th>
                          <th className="py-3 px-5 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Recommended Flow</th>
                          <th className="py-3 px-5 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-5 font-bold text-slate-900 text-[14px]">Dormant VIP Recovery</td>
                          <td className="py-4 px-5 text-[14px] font-mono-numbers text-right">428</td>
                          <td className="py-4 px-5 text-[14px] font-mono-numbers text-right text-emerald-600 font-semibold">₹1.72L</td>
                          <td className="py-4 px-5 text-[14px] font-mono-numbers text-right">4.8%</td>
                          <td className="py-4 px-5 text-[14px] font-mono-numbers text-right">82%</td>
                          <td className="py-4 px-5 text-[14px] font-medium text-slate-700">WhatsApp Win-Back</td>
                          <td className="py-4 px-5 text-right">
                             <button onClick={() => router.push('/chat')} className="text-[13px] font-bold text-blue-600 hover:text-blue-800 transition-colors">
                                View Opportunity &rarr;
                             </button>
                          </td>
                       </tr>
                       <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-5 font-bold text-slate-900 text-[14px]">Post Purchase Cross-Sell</td>
                          <td className="py-4 px-5 text-[14px] font-mono-numbers text-right">1240</td>
                          <td className="py-4 px-5 text-[14px] font-mono-numbers text-right text-emerald-600 font-semibold">₹94K</td>
                          <td className="py-4 px-5 text-[14px] font-mono-numbers text-right">2.4%</td>
                          <td className="py-4 px-5 text-[14px] font-mono-numbers text-right">86%</td>
                          <td className="py-4 px-5 text-[14px] font-medium text-slate-700">Email Cross-Sell</td>
                          <td className="py-4 px-5 text-right">
                             <button onClick={() => router.push('/chat')} className="text-[13px] font-bold text-blue-600 hover:text-blue-800 transition-colors">
                                View Opportunity &rarr;
                             </button>
                          </td>
                       </tr>
                    </tbody>
                 </table>
              </div>
           </div>

           {/* SECTION 4: Channel Performance */}
           <div className="flex flex-col gap-4">
              <h2 className="text-[18px] font-bold text-slate-900">Channel Performance</h2>
              <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                       <tr>
                          <th className="py-4 px-6 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Channel</th>
                          <th className="py-4 px-6 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-right">Revenue</th>
                          <th className="py-4 px-6 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-right">ROI</th>
                          <th className="py-4 px-6 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-right">Conversion</th>
                          <th className="py-4 px-6 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-right">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-5 px-6 font-bold text-slate-900 text-[14px]">WhatsApp</td>
                          <td className="py-5 px-6 text-[14px] font-mono-numbers text-right font-medium">₹8.4L</td>
                          <td className="py-5 px-6 text-[14px] font-mono-numbers font-bold text-emerald-600 text-right">412%</td>
                          <td className="py-5 px-6 text-[14px] font-mono-numbers text-right font-medium">6.4%</td>
                          <td className="py-5 px-6 text-right">
                             <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded uppercase tracking-wider inline-block">Primary Driver</span>
                          </td>
                       </tr>
                       <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-5 px-6 font-bold text-slate-900 text-[14px]">Email</td>
                          <td className="py-5 px-6 text-[14px] font-mono-numbers text-right font-medium">₹6.2L</td>
                          <td className="py-5 px-6 text-[14px] font-mono-numbers font-bold text-emerald-600 text-right">285%</td>
                          <td className="py-5 px-6 text-[14px] font-mono-numbers text-right font-medium">2.1%</td>
                          <td className="py-5 px-6 text-right">
                             <span className="text-[11px] font-bold bg-slate-50 text-slate-500 border border-slate-200 px-2.5 py-1 rounded uppercase tracking-wider inline-block">Stable</span>
                          </td>
                       </tr>
                       <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-5 px-6 font-bold text-slate-900 text-[14px]">SMS</td>
                          <td className="py-5 px-6 text-[14px] font-mono-numbers text-right font-medium">₹2.1L</td>
                          <td className="py-5 px-6 text-[14px] font-mono-numbers font-bold text-slate-700 text-right">140%</td>
                          <td className="py-5 px-6 text-[14px] font-mono-numbers text-right font-medium">1.8%</td>
                          <td className="py-5 px-6 text-right">
                             <span className="text-[11px] font-bold bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded uppercase tracking-wider inline-block">Declining</span>
                          </td>
                       </tr>
                    </tbody>
                 </table>
              </div>
           </div>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
           
           {/* SECTION 5: Top Revenue Drivers */}
           <div className="flex flex-col gap-4">
              <h2 className="text-[18px] font-bold text-slate-900">Top Revenue Drivers</h2>
              <div className="border border-slate-200 rounded-xl bg-white shadow-sm p-6 flex flex-col gap-5">
                 
                 <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <div className="flex flex-col">
                       <span className="text-[15px] font-bold text-slate-900">VIP Customers</span>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-[16px] font-bold text-slate-900 font-mono-numbers">₹4.2L</span>
                       <span className="text-[12px] font-bold text-emerald-600 mt-0.5">↑ 12%</span>
                    </div>
                 </div>

                 <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <div className="flex flex-col">
                       <span className="text-[15px] font-bold text-slate-900">Beauty Loyalists</span>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-[16px] font-bold text-slate-900 font-mono-numbers">₹2.8L</span>
                       <span className="text-[12px] font-bold text-emerald-600 mt-0.5">↑ 8%</span>
                    </div>
                 </div>

                 <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <div className="flex flex-col">
                       <span className="text-[15px] font-bold text-slate-900">Weekend Shoppers</span>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-[16px] font-bold text-slate-900 font-mono-numbers">₹1.4L</span>
                       <span className="text-[12px] font-bold text-emerald-600 mt-0.5">↑ 2%</span>
                    </div>
                 </div>

                 <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                       <span className="text-[15px] font-bold text-slate-900">Premium Buyers</span>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-[16px] font-bold text-slate-900 font-mono-numbers">₹1.1L</span>
                       <span className="text-[12px] font-bold text-red-600 mt-0.5">↓ 4%</span>
                    </div>
                 </div>

              </div>
           </div>

        </div>

      </div>

    </div>
  );
}
