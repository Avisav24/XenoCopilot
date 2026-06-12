'use client';

import { ArrowUpRight, FastArrowRight, ShieldCheck, Play } from 'iconoir-react';
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        
        {/* Left Column (Hero Area - 70% width) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
           <h2 className="text-[18px] font-bold text-slate-900">Revenue Command Center</h2>
           
           <div className="border border-slate-200 rounded-xl bg-white shadow-sm p-10 flex flex-col gap-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
              
              <div className="flex flex-col gap-2">
                 <span className="text-[13px] font-bold text-blue-600 uppercase tracking-wider">Active Recommendation</span>
                 <span className="text-[32px] font-bold text-slate-900 leading-tight tracking-tight">Launch VIP Win-Back Campaign</span>
              </div>
              
              <div className="grid grid-cols-4 gap-8 bg-slate-50 rounded-xl p-6 border border-slate-100">
                 <div className="flex flex-col">
                    <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Potential Revenue</span>
                    <span className="text-[24px] font-bold text-slate-900 font-mono-numbers">₹1.72L</span>
                 </div>
                 <div className="flex flex-col border-l border-slate-200 pl-8">
                    <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Audience Size</span>
                    <span className="text-[24px] font-bold text-slate-900 font-mono-numbers">428</span>
                    <span className="text-[12px] text-slate-500 mt-1">Customers</span>
                 </div>
                 <div className="flex flex-col border-l border-slate-200 pl-8">
                    <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Expected Conversion</span>
                    <span className="text-[24px] font-bold text-slate-900 font-mono-numbers">4.8%</span>
                 </div>
                 <div className="flex flex-col border-l border-slate-200 pl-8">
                    <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Confidence</span>
                    <span className="text-[24px] font-bold text-emerald-600 font-mono-numbers flex items-center gap-1.5">
                       82% <ShieldCheck height={20} width={20} />
                    </span>
                 </div>
              </div>

              <div className="flex flex-col gap-3">
                 <span className="text-[13px] font-bold text-slate-900 uppercase tracking-wider">Business Reason</span>
                 <div className="flex flex-col gap-2">
                    <p className="text-[16px] text-slate-600 leading-relaxed font-medium">VIP engagement has declined 11% over the last 14 days.</p>
                    <p className="text-[16px] text-slate-600 leading-relaxed font-medium">184 customers have not purchased in over 60 days.</p>
                    <p className="text-[16px] text-slate-600 leading-relaxed font-medium">Historical win-back campaigns generated ₹8.4L in recovered revenue.</p>
                 </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                 <button 
                    onClick={() => router.push('/chat')} 
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-8 rounded-lg transition-colors shadow-sm text-[15px] flex items-center gap-2"
                 >
                    <Play height={18} width={18} /> Open Campaign Studio
                 </button>
                 <button 
                    onClick={() => router.push('/intelligence')} 
                    className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-8 rounded-lg transition-colors shadow-sm text-[15px]"
                 >
                    Review Audience
                 </button>
              </div>
           </div>
        </div>

        {/* Right Column (Secondary Opportunities - 30% width) */}
        <div className="lg:col-span-1 flex flex-col gap-4">
           <h2 className="text-[18px] font-bold text-slate-900">Other Opportunities</h2>
           
           <div className="flex flex-col gap-4">
              {/* Secondary Opportunity 1 */}
              <div className="border border-slate-200 rounded-xl bg-white shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-shadow cursor-pointer group" onClick={() => router.push('/chat')}>
                 <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Medium Priority</span>
                    <h3 className="text-[16px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Post Purchase Cross-Sell</h3>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div className="flex flex-col">
                       <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Revenue</span>
                       <span className="text-[15px] font-bold text-emerald-600 font-mono-numbers">₹94K</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Audience</span>
                       <span className="text-[15px] font-bold text-slate-900 font-mono-numbers">1240</span>
                    </div>
                 </div>

                 <div className="flex justify-between items-center pt-2">
                    <span className="text-[13px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded">Email Cross-Sell</span>
                    <FastArrowRight height={16} width={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                 </div>
              </div>

              {/* Secondary Opportunity 2 */}
              <div className="border border-slate-200 rounded-xl bg-white shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-shadow cursor-pointer group" onClick={() => router.push('/chat')}>
                 <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Medium Priority</span>
                    <h3 className="text-[16px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Weekend Shopper Activation</h3>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div className="flex flex-col">
                       <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Revenue</span>
                       <span className="text-[15px] font-bold text-emerald-600 font-mono-numbers">₹48K</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Audience</span>
                       <span className="text-[15px] font-bold text-slate-900 font-mono-numbers">812</span>
                    </div>
                 </div>

                 <div className="flex justify-between items-center pt-2">
                    <span className="text-[13px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded">SMS Campaign</span>
                    <FastArrowRight height={16} width={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                 </div>
              </div>
           </div>
        </div>

      </div>

    </div>
  );
}
