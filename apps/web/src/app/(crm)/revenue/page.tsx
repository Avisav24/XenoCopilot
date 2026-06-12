'use client';

import { useState } from 'react';
import { Spark, GraphUp, Strategy, Play, ArrowUpRight, ArrowDownRight, Megaphone, Check } from 'iconoir-react';
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
        recommendedAudience: 'Dormant VIPs (Last purchase > 60 days)',
        recommendedChannel: 'WhatsApp',
        expectedRevenue: '₹2.4L',
        expectedConversion: '6.2%',
        recommendedCampaign: 'Win-Back Exclusive Offer',
        generatedMessage: 'Hi [Customer Name], we miss you! As one of our top customers, we unlocked a 20% discount on your favorite [Favorite Category]. Valid for 48 hours.',
      });
      setAgentGenerating(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-8 w-full pb-24 max-w-[1400px]">
      
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-bold text-slate-900 leading-none">Growth OS</h1>
          <p className="max-w-2xl text-[15px] text-slate-500">
            Identify revenue opportunities and generate campaigns directly from your customer data.
          </p>
        </div>
      </div>

      {/* SECTION 6: Goal -> Campaign Agent (Natural Language) */}
      <div className="bg-white border-2 border-blue-600/20 rounded-xl p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
        <h2 className="text-[16px] font-bold text-slate-900 flex items-center gap-2">
          <Spark height={20} width={20} className="text-blue-600" /> AI Growth Agent
        </h2>
        <form onSubmit={handleGoalSubmit} className="flex gap-3">
           <input 
             type="text" 
             value={goalText}
             onChange={e => setGoalText(e.target.value)}
             placeholder="Describe a business goal (e.g., 'Increase repeat purchases this month' or 'Reduce VIP churn')"
             className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-[15px] text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all shadow-sm"
           />
           <button 
             type="submit"
             disabled={agentGenerating || !goalText.trim()}
             className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-lg transition-colors whitespace-nowrap shadow-sm"
           >
             {agentGenerating ? 'Generating Strategy...' : 'Generate Campaign'}
           </button>
        </form>

        {agentResult && (
           <div className="mt-4 border-t border-slate-100 pt-5 flex flex-col gap-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Recommended Audience</span>
                    <span className="text-[15px] font-bold text-slate-900">{agentResult.recommendedAudience}</span>
                 </div>
                 <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Recommended Channel</span>
                    <span className="text-[15px] font-bold text-slate-900">{agentResult.recommendedChannel}</span>
                 </div>
                 <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Expected Revenue</span>
                    <span className="text-[15px] font-bold text-emerald-600">{agentResult.expectedRevenue}</span>
                 </div>
                 <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Expected Conversion</span>
                    <span className="text-[15px] font-bold text-slate-900">{agentResult.expectedConversion}</span>
                 </div>
              </div>
              <div className="flex flex-col gap-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                 <span className="text-[13px] font-bold text-slate-900">{agentResult.recommendedCampaign} Copy</span>
                 <p className="text-[14px] text-slate-700 italic">"{agentResult.generatedMessage}"</p>
              </div>
              <div className="flex justify-end">
                 <button onClick={() => router.push('/chat')} className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-lg transition-colors shadow-sm text-[14px]">
                   Open in Campaign Copilot
                 </button>
              </div>
           </div>
        )}
      </div>

      {/* SECTION 1: Executive Briefing Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-0 border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden divide-x divide-slate-200">
         <div className="p-5 flex flex-col gap-1">
            <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Revenue Influenced</span>
            <span className="text-[22px] font-bold text-slate-900 font-mono-numbers">₹18.4L</span>
         </div>
         <div className="p-5 flex flex-col gap-1">
            <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Revenue At Risk</span>
            <span className="text-[22px] font-bold text-red-600 font-mono-numbers">₹4.2L</span>
         </div>
         <div className="p-5 flex flex-col gap-1">
            <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Largest Opportunity</span>
            <span className="text-[16px] font-bold text-slate-900 mt-1">Dormant VIP Recovery</span>
         </div>
         <div className="p-5 flex flex-col gap-1">
            <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Best Channel</span>
            <span className="text-[16px] font-bold text-slate-900 mt-1">WhatsApp (6.4% Conv)</span>
         </div>
         <div className="p-5 flex flex-col gap-1 bg-blue-50/50">
            <span className="text-[12px] font-semibold text-blue-600 uppercase tracking-wider">Recommended Action</span>
            <span className="text-[16px] font-bold text-blue-800 mt-1 flex items-center gap-1">Launch VIP Recovery</span>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Opp Table + Channel Table) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
           
           {/* SECTION 2: Revenue Opportunities */}
           <div className="flex flex-col gap-4">
              <h2 className="text-[18px] font-bold text-slate-900">Revenue Opportunities</h2>
              <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                       <tr>
                          <th className="py-3 px-5 text-[12px] font-bold text-slate-600 uppercase tracking-wider">Opportunity</th>
                          <th className="py-3 px-5 text-[12px] font-bold text-slate-600 uppercase tracking-wider">Audience</th>
                          <th className="py-3 px-5 text-[12px] font-bold text-slate-600 uppercase tracking-wider">Potential Rev</th>
                          <th className="py-3 px-5 text-[12px] font-bold text-slate-600 uppercase tracking-wider">Score</th>
                          <th className="py-3 px-5 text-[12px] font-bold text-slate-600 uppercase tracking-wider">Action</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-5">
                             <div className="flex flex-col">
                                <span className="font-bold text-slate-900 text-[14px]">Dormant VIP Recovery</span>
                                <span className="text-[13px] text-slate-500">Win-Back WhatsApp Campaign</span>
                             </div>
                          </td>
                          <td className="py-4 px-5 text-[14px] text-slate-700 font-mono-numbers">428</td>
                          <td className="py-4 px-5 text-[14px] font-bold text-emerald-600 font-mono-numbers">₹1.72L</td>
                          <td className="py-4 px-5">
                             <div className="flex flex-col">
                                <span className="text-[14px] font-bold text-slate-900">92</span>
                                <span className="text-[11px] text-slate-500 font-semibold uppercase">82% Conf</span>
                             </div>
                          </td>
                          <td className="py-4 px-5">
                             <button onClick={() => router.push('/chat')} className="text-[12px] font-bold bg-slate-900 text-white px-3 py-1.5 rounded hover:bg-slate-800 transition-colors">Launch</button>
                          </td>
                       </tr>
                       <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-5">
                             <div className="flex flex-col">
                                <span className="font-bold text-slate-900 text-[14px]">Post-Purchase Cross-Sell</span>
                                <span className="text-[13px] text-slate-500">Related Products Email</span>
                             </div>
                          </td>
                          <td className="py-4 px-5 text-[14px] text-slate-700 font-mono-numbers">1,240</td>
                          <td className="py-4 px-5 text-[14px] font-bold text-emerald-600 font-mono-numbers">₹94,000</td>
                          <td className="py-4 px-5">
                             <div className="flex flex-col">
                                <span className="text-[14px] font-bold text-slate-900">88</span>
                                <span className="text-[11px] text-slate-500 font-semibold uppercase">86% Conf</span>
                             </div>
                          </td>
                          <td className="py-4 px-5">
                             <button onClick={() => router.push('/chat')} className="text-[12px] font-bold bg-slate-900 text-white px-3 py-1.5 rounded hover:bg-slate-800 transition-colors">Launch</button>
                          </td>
                       </tr>
                       <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-5">
                             <div className="flex flex-col">
                                <span className="font-bold text-slate-900 text-[14px]">Cart Abandonment Push</span>
                                <span className="text-[13px] text-slate-500">High-Intent SMS Flow</span>
                             </div>
                          </td>
                          <td className="py-4 px-5 text-[14px] text-slate-700 font-mono-numbers">85</td>
                          <td className="py-4 px-5 text-[14px] font-bold text-emerald-600 font-mono-numbers">₹62,500</td>
                          <td className="py-4 px-5">
                             <div className="flex flex-col">
                                <span className="text-[14px] font-bold text-slate-900">85</span>
                                <span className="text-[11px] text-slate-500 font-semibold uppercase">94% Conf</span>
                             </div>
                          </td>
                          <td className="py-4 px-5">
                             <button onClick={() => router.push('/chat')} className="text-[12px] font-bold bg-slate-900 text-white px-3 py-1.5 rounded hover:bg-slate-800 transition-colors">Launch</button>
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
                          <th className="py-3 px-5 text-[12px] font-bold text-slate-600 uppercase tracking-wider">Channel</th>
                          <th className="py-3 px-5 text-[12px] font-bold text-slate-600 uppercase tracking-wider text-right">Revenue</th>
                          <th className="py-3 px-5 text-[12px] font-bold text-slate-600 uppercase tracking-wider text-right">ROI</th>
                          <th className="py-3 px-5 text-[12px] font-bold text-slate-600 uppercase tracking-wider text-right">Conversion</th>
                          <th className="py-3 px-5 text-[12px] font-bold text-slate-600 uppercase tracking-wider text-right">Growth</th>
                          <th className="py-3 px-5 text-[12px] font-bold text-slate-600 uppercase tracking-wider">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-5 font-bold text-slate-900 text-[14px]">WhatsApp</td>
                          <td className="py-4 px-5 text-[14px] font-mono-numbers text-right">₹8.4L</td>
                          <td className="py-4 px-5 text-[14px] font-mono-numbers font-bold text-emerald-600 text-right">412%</td>
                          <td className="py-4 px-5 text-[14px] font-mono-numbers text-right">6.4%</td>
                          <td className="py-4 px-5 text-[14px] font-mono-numbers text-emerald-600 font-semibold text-right">+18%</td>
                          <td className="py-4 px-5">
                             <span className="text-[11px] font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded uppercase">Primary Driver</span>
                          </td>
                       </tr>
                       <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-5 font-bold text-slate-900 text-[14px]">Email</td>
                          <td className="py-4 px-5 text-[14px] font-mono-numbers text-right">₹6.2L</td>
                          <td className="py-4 px-5 text-[14px] font-mono-numbers font-bold text-emerald-600 text-right">285%</td>
                          <td className="py-4 px-5 text-[14px] font-mono-numbers text-right">2.1%</td>
                          <td className="py-4 px-5 text-[14px] font-mono-numbers text-slate-500 text-right">+2%</td>
                          <td className="py-4 px-5">
                             <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded uppercase">Stable</span>
                          </td>
                       </tr>
                       <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-5 font-bold text-slate-900 text-[14px]">SMS</td>
                          <td className="py-4 px-5 text-[14px] font-mono-numbers text-right">₹2.1L</td>
                          <td className="py-4 px-5 text-[14px] font-mono-numbers font-bold text-slate-700 text-right">140%</td>
                          <td className="py-4 px-5 text-[14px] font-mono-numbers text-right">1.8%</td>
                          <td className="py-4 px-5 text-[14px] font-mono-numbers text-red-500 font-semibold text-right">-4%</td>
                          <td className="py-4 px-5">
                             <span className="text-[11px] font-bold bg-red-100 text-red-800 px-2 py-1 rounded uppercase">Declining</span>
                          </td>
                       </tr>
                       <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-5 font-bold text-slate-900 text-[14px]">Promotional Calls</td>
                          <td className="py-4 px-5 text-[14px] font-mono-numbers text-right">₹1.7L</td>
                          <td className="py-4 px-5 text-[14px] font-mono-numbers font-bold text-slate-700 text-right">110%</td>
                          <td className="py-4 px-5 text-[14px] font-mono-numbers text-right">8.2%</td>
                          <td className="py-4 px-5 text-[14px] font-mono-numbers text-slate-500 text-right">+1%</td>
                          <td className="py-4 px-5">
                             <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded uppercase">Stable</span>
                          </td>
                       </tr>
                    </tbody>
                 </table>
              </div>
           </div>

        </div>

        {/* Right Column (Decision Center + Top Drivers) */}
        <div className="lg:col-span-1 flex flex-col gap-8">
           
           {/* SECTION 3: Decision Center */}
           <div className="flex flex-col gap-4">
              <h2 className="text-[18px] font-bold text-slate-900">Decision Center</h2>
              <div className="border-2 border-slate-900 rounded-xl bg-white shadow-sm p-6 flex flex-col gap-5">
                 <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-bold text-blue-600 uppercase tracking-wider">Highest Priority Action</span>
                    <span className="text-[20px] font-bold text-slate-900 leading-tight">Launch VIP Win-Back Flow</span>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                       <span className="text-[11px] font-semibold text-slate-500 uppercase">Potential Revenue</span>
                       <span className="text-[16px] font-bold text-emerald-600 font-mono-numbers">₹1.72L</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[11px] font-semibold text-slate-500 uppercase">Audience Size</span>
                       <span className="text-[16px] font-bold text-slate-900 font-mono-numbers">428</span>
                    </div>
                    <div className="flex flex-col col-span-2">
                       <span className="text-[11px] font-semibold text-slate-500 uppercase">Expected Conversion</span>
                       <span className="text-[16px] font-bold text-slate-900 font-mono-numbers">4.8%</span>
                    </div>
                 </div>

                 <div className="flex flex-col gap-1 border-t border-slate-100 pt-4">
                    <span className="text-[12px] font-bold text-slate-900">Reason</span>
                    <p className="text-[13px] text-slate-600 leading-relaxed">VIP engagement dropped 11% over the last 14 days. Historic data shows a 4.8% conversion rate if engaged within the 60-day window.</p>
                 </div>

                 <button onClick={() => router.push('/chat')} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg mt-2 transition-colors">
                    Generate Campaign
                 </button>
              </div>
           </div>

           {/* SECTION 5: Top Revenue Drivers */}
           <div className="flex flex-col gap-4">
              <h2 className="text-[18px] font-bold text-slate-900">Top Revenue Drivers</h2>
              <div className="border border-slate-200 rounded-xl bg-white shadow-sm p-5 flex flex-col gap-5">
                 
                 <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <div className="flex flex-col">
                       <span className="text-[14px] font-bold text-slate-900">VIP Customers</span>
                       <span className="text-[12px] text-slate-500">₹84,000 Opportunity</span>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-[15px] font-bold text-slate-900 font-mono-numbers">₹4.2L</span>
                       <span className="text-[12px] font-bold text-emerald-600 flex items-center gap-0.5"><ArrowUpRight height={12} width={12} /> 12%</span>
                    </div>
                 </div>

                 <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <div className="flex flex-col">
                       <span className="text-[14px] font-bold text-slate-900">Beauty Loyalists</span>
                       <span className="text-[12px] text-slate-500">₹32,500 Opportunity</span>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-[15px] font-bold text-slate-900 font-mono-numbers">₹2.8L</span>
                       <span className="text-[12px] font-bold text-emerald-600 flex items-center gap-0.5"><ArrowUpRight height={12} width={12} /> 8%</span>
                    </div>
                 </div>

                 <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <div className="flex flex-col">
                       <span className="text-[14px] font-bold text-slate-900">Weekend Shoppers</span>
                       <span className="text-[12px] text-slate-500">₹18,000 Opportunity</span>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-[15px] font-bold text-slate-900 font-mono-numbers">₹1.4L</span>
                       <span className="text-[12px] font-bold text-slate-500 flex items-center gap-0.5"><ArrowUpRight height={12} width={12} /> 2%</span>
                    </div>
                 </div>

                 <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                       <span className="text-[14px] font-bold text-slate-900">Premium Buyers</span>
                       <span className="text-[12px] text-slate-500">₹45,000 Opportunity</span>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-[15px] font-bold text-slate-900 font-mono-numbers">₹1.1L</span>
                       <span className="text-[12px] font-bold text-red-500 flex items-center gap-0.5"><ArrowDownRight height={12} width={12} /> 4%</span>
                    </div>
                 </div>

              </div>
           </div>

        </div>

      </div>

    </div>
  );
}
