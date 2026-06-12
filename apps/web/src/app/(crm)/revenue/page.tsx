'use client';

import { useState } from 'react';
import { Strategy, Play, ArrowUpRight, ArrowDownRight, FastArrowRight, CheckCircle, WarningTriangle, Spark } from 'iconoir-react';
import { clsx } from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function GrowthOSPage() {
  const router = useRouter();
  const [goalText, setGoalText] = useState('');
  const [agentGenerating, setAgentGenerating] = useState(false);
  const [agentResult, setAgentResult] = useState<any>(null);

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalText.trim()) return;
    setAgentGenerating(true);
    // Simulate natural language agent processing
    setTimeout(() => {
      setAgentResult({
        opportunities: [
          'Dormant VIP Recovery',
          'Cross-Sell Expansion',
          'VIP Retention'
        ]
      });
      setAgentGenerating(false);
    }, 1200);
  };

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

      {/* SECTION 1: Executive Briefing Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-0 border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden divide-x divide-slate-200">
         <div className="p-5 flex flex-col gap-1">
            <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Revenue Influenced</span>
            <span className="text-[22px] font-bold text-slate-900 font-mono-numbers">₹18.4L</span>
            <span className="text-[12px] font-medium text-emerald-600 mt-1 flex items-center gap-1"><ArrowUpRight height={12} width={12}/> 12% vs last month</span>
         </div>
         <div className="p-5 flex flex-col gap-1">
            <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Revenue At Risk</span>
            <span className="text-[22px] font-bold text-slate-900 font-mono-numbers">₹4.2L</span>
            <span className="text-[12px] font-medium text-slate-500 mt-1">184 customers inactive 60+ days</span>
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
            <span className="text-[12px] font-medium text-slate-500 mt-1 hover:text-blue-600 cursor-pointer transition-colors">Review Strategy →</span>
         </div>
      </div>

      {/* SECTION 6: Goal -> Campaign Agent (Growth Planner) */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm flex flex-col gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-slate-900" />
        <div className="flex flex-col gap-1">
          <h2 className="text-[18px] font-bold text-slate-900 flex items-center gap-2">
            <Strategy height={20} width={20} className="text-slate-900" /> Growth Planner
          </h2>
          <p className="text-[14px] text-slate-500">What are you trying to achieve?</p>
        </div>
        
        <form onSubmit={handleGoalSubmit} className="flex gap-4">
           <input 
             type="text" 
             value={goalText}
             onChange={e => setGoalText(e.target.value)}
             placeholder="Increase repeat purchases this month"
             className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3.5 text-[15px] text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all shadow-sm font-medium"
           />
           <button 
             type="submit"
             disabled={agentGenerating || !goalText.trim()}
             className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold px-8 py-3.5 rounded-lg transition-colors whitespace-nowrap shadow-sm"
           >
             {agentGenerating ? 'Analyzing Strategy...' : 'Generate Strategy'}
           </button>
        </form>

        {agentResult && (
           <div className="mt-4 border-t border-slate-100 pt-6 flex flex-col gap-5">
              <h3 className="text-[14px] font-bold text-slate-900 uppercase tracking-wider">Recommended Opportunities</h3>
              <ul className="flex flex-col gap-3">
                 {agentResult.opportunities.map((opp: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2 text-[15px] font-medium text-slate-700">
                       <CheckCircle height={18} width={18} className="text-emerald-600" /> {opp}
                    </li>
                 ))}
              </ul>
              <div className="flex justify-start mt-2">
                 <button onClick={() => router.push('/chat')} className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-lg transition-colors shadow-sm text-[14px]">
                   Open in Campaign Studio
                 </button>
              </div>
           </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Opp Cards + Channel Table) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
           
           {/* SECTION 2: Revenue Opportunities (Cards) */}
           <div className="flex flex-col gap-4">
              <h2 className="text-[18px] font-bold text-slate-900">Revenue Opportunities</h2>
              
              <div className="flex flex-col gap-4">
                 {/* Card 1 */}
                 <div className="border border-slate-200 rounded-xl bg-white shadow-sm p-6 hover:shadow-md transition-shadow flex flex-col gap-5">
                    <div className="flex justify-between items-start">
                       <div className="flex flex-col gap-1">
                          <h3 className="text-[18px] font-bold text-slate-900">Dormant VIP Recovery</h3>
                          <span className="text-[14px] text-slate-500">428 Customers • High Priority</span>
                       </div>
                       <span className="text-[12px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded uppercase tracking-wider">82% Confidence</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6 pt-2">
                       <div className="flex flex-col gap-1 border-l-2 border-emerald-500 pl-3">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Potential Revenue</span>
                          <span className="text-[20px] font-bold text-slate-900 font-mono-numbers">₹1.72L</span>
                       </div>
                       <div className="flex flex-col gap-1 border-l-2 border-slate-200 pl-3">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Expected Conv</span>
                          <span className="text-[20px] font-bold text-slate-900 font-mono-numbers">4.8%</span>
                       </div>
                       <div className="flex flex-col gap-1 border-l-2 border-slate-200 pl-3">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Recommended Flow</span>
                          <span className="text-[14px] font-bold text-slate-900 mt-1">Win-Back WhatsApp</span>
                       </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100 mt-2">
                       <button onClick={() => router.push('/chat')} className="text-[13px] font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">Generate Campaign <FastArrowRight height={14} width={14}/></button>
                    </div>
                 </div>

                 {/* Card 2 */}
                 <div className="border border-slate-200 rounded-xl bg-white shadow-sm p-6 hover:shadow-md transition-shadow flex flex-col gap-5">
                    <div className="flex justify-between items-start">
                       <div className="flex flex-col gap-1">
                          <h3 className="text-[18px] font-bold text-slate-900">Post-Purchase Cross-Sell</h3>
                          <span className="text-[14px] text-slate-500">1,240 Customers • Medium Priority</span>
                       </div>
                       <span className="text-[12px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded uppercase tracking-wider">86% Confidence</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6 pt-2">
                       <div className="flex flex-col gap-1 border-l-2 border-emerald-500 pl-3">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Potential Revenue</span>
                          <span className="text-[20px] font-bold text-slate-900 font-mono-numbers">₹94,000</span>
                       </div>
                       <div className="flex flex-col gap-1 border-l-2 border-slate-200 pl-3">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Expected Conv</span>
                          <span className="text-[20px] font-bold text-slate-900 font-mono-numbers">2.4%</span>
                       </div>
                       <div className="flex flex-col gap-1 border-l-2 border-slate-200 pl-3">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Recommended Flow</span>
                          <span className="text-[14px] font-bold text-slate-900 mt-1">Related Products Email</span>
                       </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100 mt-2">
                       <button onClick={() => router.push('/chat')} className="text-[13px] font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">Generate Campaign <FastArrowRight height={14} width={14}/></button>
                    </div>
                 </div>
              </div>
           </div>

           {/* SECTION 4: Channel Performance */}
           <div className="flex flex-col gap-4 mt-2">
              <h2 className="text-[18px] font-bold text-slate-900">Channel Performance</h2>
              <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                       <tr>
                          <th className="py-4 px-6 text-[12px] font-bold text-slate-600 uppercase tracking-wider">Channel</th>
                          <th className="py-4 px-6 text-[12px] font-bold text-slate-600 uppercase tracking-wider text-right">Revenue</th>
                          <th className="py-4 px-6 text-[12px] font-bold text-slate-600 uppercase tracking-wider text-right">ROI</th>
                          <th className="py-4 px-6 text-[12px] font-bold text-slate-600 uppercase tracking-wider text-right">Conversion</th>
                          <th className="py-4 px-6 text-[12px] font-bold text-slate-600 uppercase tracking-wider">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-5 px-6 font-bold text-slate-900 text-[14px]">WhatsApp</td>
                          <td className="py-5 px-6 text-[14px] font-mono-numbers text-right">₹8.4L</td>
                          <td className="py-5 px-6 text-[14px] font-mono-numbers font-bold text-emerald-600 text-right">412%</td>
                          <td className="py-5 px-6 text-[14px] font-mono-numbers text-right">6.4%</td>
                          <td className="py-5 px-6">
                             <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded uppercase tracking-wider">Primary Driver</span>
                          </td>
                       </tr>
                       <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-5 px-6 font-bold text-slate-900 text-[14px]">Email</td>
                          <td className="py-5 px-6 text-[14px] font-mono-numbers text-right">₹6.2L</td>
                          <td className="py-5 px-6 text-[14px] font-mono-numbers font-bold text-emerald-600 text-right">285%</td>
                          <td className="py-5 px-6 text-[14px] font-mono-numbers text-right">2.1%</td>
                          <td className="py-5 px-6">
                             <span className="text-[11px] font-bold bg-slate-50 text-slate-500 border border-slate-200 px-2.5 py-1 rounded uppercase tracking-wider">Stable</span>
                          </td>
                       </tr>
                       <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-5 px-6 font-bold text-slate-900 text-[14px]">SMS</td>
                          <td className="py-5 px-6 text-[14px] font-mono-numbers text-right">₹2.1L</td>
                          <td className="py-5 px-6 text-[14px] font-mono-numbers font-bold text-slate-700 text-right">140%</td>
                          <td className="py-5 px-6 text-[14px] font-mono-numbers text-right">1.8%</td>
                          <td className="py-5 px-6">
                             <span className="text-[11px] font-bold bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded uppercase tracking-wider">Declining</span>
                          </td>
                       </tr>
                    </tbody>
                 </table>
              </div>
           </div>

        </div>

        {/* Right Column (Decision Center + Top Drivers) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
           
           {/* SECTION 3: Decision Center */}
           <div className="flex flex-col gap-4">
              <h2 className="text-[18px] font-bold text-slate-900">Decision Center</h2>
              <div className="border border-slate-200 rounded-xl bg-white shadow-sm p-6 flex flex-col gap-5">
                 <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Highest Priority Action</span>
                    <span className="text-[20px] font-bold text-slate-900 leading-tight">Launch VIP Win-Back Flow</span>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                       <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Potential Revenue</span>
                       <span className="text-[16px] font-bold text-slate-900 font-mono-numbers">₹1.72L</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Audience Size</span>
                       <span className="text-[16px] font-bold text-slate-900 font-mono-numbers">428</span>
                    </div>
                    <div className="flex flex-col col-span-2">
                       <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Expected Conversion</span>
                       <span className="text-[16px] font-bold text-slate-900 font-mono-numbers">4.8%</span>
                    </div>
                 </div>

                 <div className="flex flex-col gap-2 border-t border-slate-100 pt-5">
                    <span className="text-[12px] font-bold text-slate-900 uppercase tracking-wider">Business Reason</span>
                    <p className="text-[14px] text-slate-600 leading-relaxed font-medium">VIP engagement dropped 11% over the last 14 days. Historic data shows a 4.8% conversion rate if engaged within the 60-day window.</p>
                 </div>

                 <button onClick={() => router.push('/chat')} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg mt-2 transition-colors shadow-sm">
                    Open Campaign Studio
                 </button>
              </div>
           </div>

           {/* SECTION 5: Top Revenue Drivers */}
           <div className="flex flex-col gap-4">
              <h2 className="text-[18px] font-bold text-slate-900">Top Revenue Drivers</h2>
              <div className="border border-slate-200 rounded-xl bg-white shadow-sm p-6 flex flex-col gap-6">
                 
                 <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <div className="flex flex-col">
                       <span className="text-[15px] font-bold text-slate-900">VIP Customers</span>
                       <span className="text-[13px] text-slate-500 mt-0.5">₹84,000 Opportunity</span>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-[16px] font-bold text-slate-900 font-mono-numbers">₹4.2L</span>
                       <span className="text-[12px] font-bold text-emerald-600 mt-0.5">↑ 12%</span>
                    </div>
                 </div>

                 <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <div className="flex flex-col">
                       <span className="text-[15px] font-bold text-slate-900">Beauty Loyalists</span>
                       <span className="text-[13px] text-slate-500 mt-0.5">₹32,500 Opportunity</span>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-[16px] font-bold text-slate-900 font-mono-numbers">₹2.8L</span>
                       <span className="text-[12px] font-bold text-emerald-600 mt-0.5">↑ 8%</span>
                    </div>
                 </div>

                 <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <div className="flex flex-col">
                       <span className="text-[15px] font-bold text-slate-900">Weekend Shoppers</span>
                       <span className="text-[13px] text-slate-500 mt-0.5">₹18,000 Opportunity</span>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-[16px] font-bold text-slate-900 font-mono-numbers">₹1.4L</span>
                       <span className="text-[12px] font-bold text-slate-500 mt-0.5">↑ 2%</span>
                    </div>
                 </div>

                 <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                       <span className="text-[15px] font-bold text-slate-900">Premium Buyers</span>
                       <span className="text-[13px] text-slate-500 mt-0.5">₹45,000 Opportunity</span>
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
