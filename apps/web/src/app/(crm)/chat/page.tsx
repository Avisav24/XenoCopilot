'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Play, EditPencil, Clock, CheckCircle, Plus, Filter, LayoutRight, MessageText, ArrowRight } from 'iconoir-react';
import { clsx } from 'clsx';

export default function CampaignStudioPage() {
  const router = useRouter();
  
  const [goal, setGoal] = useState('');
  const [submittedGoal, setSubmittedGoal] = useState(false);
  const [activeVariant, setActiveVariant] = useState('A');

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goal.trim()) {
      setSubmittedGoal(true);
    }
  };

  const handleOpportunityClick = (opportunityTitle: string) => {
    setGoal(opportunityTitle);
    setSubmittedGoal(true);
  };

  return (
    <div className="flex w-full min-h-screen bg-white">
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col pt-8 pb-32 px-8 lg:px-12 max-w-[1200px] border-r border-slate-200">
        
        {/* Header */}
        <div className="flex flex-col gap-2 mb-8">
          <div className="flex items-center justify-between">
             <h1 className="text-[32px] font-bold text-slate-900 leading-none tracking-tight">Campaign Studio</h1>
             <div className="flex items-center gap-4">
               <button className="text-[13px] font-semibold text-slate-500 hover:text-slate-900 transition-colors">Recent Campaigns</button>
               <button className="text-[13px] font-semibold text-slate-500 hover:text-slate-900 transition-colors">Saved Audiences</button>
               <button className="text-[13px] font-semibold text-slate-500 hover:text-slate-900 transition-colors">Templates</button>
               <button className="flex items-center gap-1.5 text-[13px] font-bold bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-md transition-colors ml-2">
                 <Plus height={16} width={16} /> New Campaign
               </button>
             </div>
          </div>
          <p className="text-[15px] text-slate-500">Plan, personalize, and launch revenue campaigns.</p>
        </div>

        {/* Goal Command Bar */}
        <div className="w-full mb-10">
          <form onSubmit={handleCommandSubmit} className="relative group">
            <Search height={20} width={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="What are you trying to achieve? (e.g. Recover dormant customers)"
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl pl-12 pr-4 py-4 text-[16px] text-slate-900 font-medium placeholder-slate-400 transition-all outline-none shadow-sm"
            />
          </form>
        </div>

        {!submittedGoal ? (
          /* Empty State: Recommended Opportunities */
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <span className="text-[13px] font-bold text-slate-900 uppercase tracking-wider">Recommended Opportunities</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Dormant VIP Recovery', rev: '₹1.72L', cust: 428, conf: '82%' },
                { title: 'VIP Retention', rev: '₹1.25L', cust: 98, conf: '89%' },
                { title: 'Cross-Sell Expansion', rev: '₹81K', cust: 126, conf: '74%' }
              ].map((opp, idx) => (
                <div key={idx} onClick={() => handleOpportunityClick(opp.title)} className="border border-slate-200 rounded-lg p-5 flex flex-col gap-4 bg-white hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group">
                   <div className="flex justify-between items-start">
                     <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{opp.title}</h3>
                   </div>
                   <div className="grid grid-cols-2 gap-2 mt-2">
                     <div className="flex flex-col">
                       <span className="text-[11px] font-semibold text-slate-500 uppercase">Revenue</span>
                       <span className="text-[15px] font-bold text-emerald-600 font-mono">{opp.rev}</span>
                     </div>
                     <div className="flex flex-col">
                       <span className="text-[11px] font-semibold text-slate-500 uppercase">Customers</span>
                       <span className="text-[15px] font-bold text-slate-900 font-mono">{opp.cust}</span>
                     </div>
                   </div>
                   <div className="pt-4 mt-auto border-t border-slate-100 flex justify-between items-center">
                     <span className="text-[12px] font-bold text-slate-500">{opp.conf} Confidence</span>
                     <span className="text-[12px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1">Create <ArrowRight height={12} width={12} /></span>
                   </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Active State: Strategy & Preview */
          <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            
            {/* Strategy Summary & Audience Intelligence */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="flex flex-col gap-3">
                  <span className="text-[12px] font-bold text-slate-900 uppercase tracking-wider">Strategy Summary</span>
                  <div className="border border-slate-200 rounded-lg bg-white p-5 flex flex-col gap-4">
                     <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-[13px] font-semibold text-slate-500">Goal</span>
                        <span className="text-[13px] font-bold text-slate-900">{goal || 'Dormant VIP Recovery'}</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-[13px] font-semibold text-slate-500">Expected Revenue</span>
                        <span className="text-[14px] font-bold text-emerald-600 font-mono">₹1,72,000</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-[13px] font-semibold text-slate-500">Expected Conversion</span>
                        <span className="text-[14px] font-bold text-slate-900 font-mono">4.8%</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-[13px] font-semibold text-slate-500">Confidence</span>
                        <span className="text-[14px] font-bold text-slate-900 font-mono">82%</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-[13px] font-semibold text-slate-500">Recommended Channel</span>
                        <span className="text-[13px] font-bold text-slate-900">WhatsApp</span>
                     </div>
                  </div>
               </div>

               <div className="flex flex-col gap-3">
                  <span className="text-[12px] font-bold text-slate-900 uppercase tracking-wider">Audience Intelligence</span>
                  <div className="border border-slate-200 rounded-lg bg-white p-5 flex flex-col gap-4">
                     <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-[13px] font-semibold text-slate-500">Audience</span>
                        <span className="text-[13px] font-bold text-slate-900">Beauty Loyalists</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-[13px] font-semibold text-slate-500">Customer Count</span>
                        <span className="text-[14px] font-bold text-slate-900 font-mono">428</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-[13px] font-semibold text-slate-500">Average Order Value</span>
                        <span className="text-[14px] font-bold text-slate-900 font-mono">₹4,200</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-[13px] font-semibold text-slate-500">Purchase Frequency</span>
                        <span className="text-[14px] font-bold text-slate-900 font-mono">2.4x / Year</span>
                     </div>
                     <div className="flex flex-col pt-1">
                        <span className="text-[13px] text-slate-700 font-medium leading-snug line-clamp-2">High-value cohort exhibiting a 60-day lapse in typical purchasing behavior. Highly responsive to new product drops.</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Channel Planner */}
            <div className="flex flex-col gap-3">
               <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-slate-900 uppercase tracking-wider">Channel Planner</span>
                  <span className="text-[12px] font-medium text-slate-500">WhatsApp has the highest historical conversion rate among similar audiences.</span>
               </div>
               <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
                  <table className="w-full text-left border-collapse">
                     <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                           <th className="py-2.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Channel</th>
                           <th className="py-2.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Expected Revenue</th>
                           <th className="py-2.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Expected Conversion</th>
                           <th className="py-2.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Audience Match</th>
                           <th className="py-2.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Confidence</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        <tr className="bg-emerald-50/30">
                           <td className="py-3 px-4 text-[13px] font-bold text-slate-900 flex items-center gap-2">WhatsApp <CheckCircle height={14} width={14} className="text-emerald-600"/></td>
                           <td className="py-3 px-4 text-[13px] font-bold text-emerald-600 font-mono text-right">₹1,72,000</td>
                           <td className="py-3 px-4 text-[13px] font-bold text-slate-900 font-mono text-right">4.8%</td>
                           <td className="py-3 px-4 text-[13px] font-bold text-slate-900 text-center">High</td>
                           <td className="py-3 px-4 text-[13px] font-bold text-slate-900 font-mono text-right">82%</td>
                        </tr>
                        <tr>
                           <td className="py-3 px-4 text-[13px] font-semibold text-slate-700">Email</td>
                           <td className="py-3 px-4 text-[13px] font-medium text-slate-600 font-mono text-right">₹84,000</td>
                           <td className="py-3 px-4 text-[13px] font-medium text-slate-600 font-mono text-right">2.1%</td>
                           <td className="py-3 px-4 text-[13px] font-medium text-slate-600 text-center">Medium</td>
                           <td className="py-3 px-4 text-[13px] font-medium text-slate-600 font-mono text-right">76%</td>
                        </tr>
                        <tr>
                           <td className="py-3 px-4 text-[13px] font-semibold text-slate-700">SMS</td>
                           <td className="py-3 px-4 text-[13px] font-medium text-slate-600 font-mono text-right">₹42,000</td>
                           <td className="py-3 px-4 text-[13px] font-medium text-slate-600 font-mono text-right">1.2%</td>
                           <td className="py-3 px-4 text-[13px] font-medium text-slate-600 text-center">Low</td>
                           <td className="py-3 px-4 text-[13px] font-medium text-slate-600 font-mono text-right">60%</td>
                        </tr>
                     </tbody>
                  </table>
               </div>
            </div>

            {/* Campaign Variants & Message Preview */}
            <div className="flex flex-col gap-4 mt-4">
               <span className="text-[12px] font-bold text-slate-900 uppercase tracking-wider">Campaign Variants</span>
               
               {/* Tabs */}
               <div className="flex items-center gap-6 border-b border-slate-200">
                  {['A', 'B', 'C'].map(v => (
                     <button 
                        key={v}
                        onClick={() => setActiveVariant(v)}
                        className={clsx(
                           "pb-3 text-[14px] font-bold transition-colors border-b-2",
                           activeVariant === v ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"
                        )}
                     >
                        Variant {v}
                     </button>
                  ))}
               </div>

               {/* Winning Variant Metrics */}
               {activeVariant === 'A' && (
                  <div className="flex items-center gap-6 bg-slate-50 border border-slate-200 rounded-lg p-4">
                     <div className="flex items-center gap-2 border-r border-slate-200 pr-6">
                        <CheckCircle height={16} width={16} className="text-emerald-600" />
                        <span className="text-[13px] font-bold text-slate-900">Recommended Variant</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase">Expected Revenue</span>
                        <span className="text-[15px] font-bold text-emerald-600 font-mono">₹1,72,000</span>
                     </div>
                     <div className="flex flex-col pl-6 border-l border-slate-200">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase">Expected Conversion</span>
                        <span className="text-[15px] font-bold text-slate-900 font-mono">4.8%</span>
                     </div>
                     <div className="flex flex-col pl-6 border-l border-slate-200">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase">Confidence</span>
                        <span className="text-[15px] font-bold text-slate-900 font-mono">82%</span>
                     </div>
                  </div>
               )}

               {/* Message Experience Area */}
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Channel Preview Panel (WhatsApp Style) */}
                  <div className="lg:col-span-2 border border-slate-200 rounded-xl bg-slate-100 flex flex-col overflow-hidden h-[450px]">
                     <div className="bg-[#075E54] text-white px-4 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-300 overflow-hidden flex items-center justify-center text-slate-600">
                           <MessageText height={16} width={16} />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[14px] font-bold leading-tight">Beauty Co.</span>
                           <span className="text-[11px] opacity-80">Official Business Account</span>
                        </div>
                     </div>
                     <div className="flex-1 bg-[#E5DDD5] p-6 flex flex-col gap-4 overflow-y-auto" style={{ backgroundImage: 'url("https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-whatsapp-background-solid-color-thumbnail.jpg")', backgroundBlendMode: 'soft-light' }}>
                        
                        <div className="bg-white rounded-lg p-3 max-w-[85%] self-start shadow-sm flex flex-col gap-1 relative">
                           <span className="text-[#075E54] font-bold text-[13px]">{activeVariant === 'A' ? "Early Access" : "We Miss You"}</span>
                           <span className="text-[14px] text-slate-800 leading-snug whitespace-pre-wrap">
                              {activeVariant === 'A' 
                                 ? "Hi Rahul,\n\nYour favorite skincare products are back in stock.\n\nAs one of our most loyal customers, we're giving you early access before everyone else."
                                 : "Hi Rahul,\n\nIt's been a while since we saw you. Here's a special 20% off your next purchase of serums."}
                           </span>
                           <span className="text-[10px] text-slate-400 self-end mt-1">11:32 AM</span>
                        </div>
                        
                        <div className="bg-white rounded-lg py-2.5 px-4 max-w-[85%] self-start shadow-sm flex justify-center items-center border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
                           <span className="text-[14px] font-bold text-[#00A884]">Shop Now</span>
                        </div>

                     </div>
                  </div>

                  {/* Personalization Panel */}
                  <div className="border border-slate-200 rounded-xl bg-white p-5 flex flex-col gap-4">
                     <span className="text-[12px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">Personalization Context</span>
                     <div className="flex flex-col gap-3">
                        <div className="flex justify-between">
                           <span className="text-[13px] font-semibold text-slate-500">Customer Name</span>
                           <span className="text-[13px] font-bold text-slate-900">Rahul Sharma</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-[13px] font-semibold text-slate-500">Favorite Category</span>
                           <span className="text-[13px] font-bold text-slate-900">Skincare Serums</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-[13px] font-semibold text-slate-500">Last Purchase</span>
                           <span className="text-[13px] font-bold text-slate-900">64 Days Ago</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-[13px] font-semibold text-slate-500">LTV Tier</span>
                           <span className="text-[13px] font-bold text-emerald-600">VIP Top 10%</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-[13px] font-semibold text-slate-500">Preferred Channel</span>
                           <span className="text-[13px] font-bold text-slate-900">WhatsApp</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-[13px] font-semibold text-slate-500">Purchase Freq</span>
                           <span className="text-[13px] font-bold text-slate-900">High (2.4x)</span>
                        </div>
                     </div>
                     <div className="mt-auto pt-4 border-t border-slate-100">
                        <span className="text-[12px] font-medium text-slate-500 leading-snug block">Variables applied accurately for 428 profiles in the selected audience.</span>
                     </div>
                  </div>

               </div>
            </div>

            {/* Revenue Simulator */}
            <div className="flex flex-col gap-3 mt-4">
               <span className="text-[12px] font-bold text-slate-900 uppercase tracking-wider">Revenue Simulator</span>
               <div className="border border-slate-200 rounded-lg bg-white overflow-hidden p-6 grid grid-cols-4 lg:grid-cols-8 gap-4 divide-x divide-slate-100">
                  <div className="flex flex-col pl-4 first:pl-0 first:border-0 border-slate-100">
                     <span className="text-[11px] font-semibold text-slate-500 uppercase">Audience</span>
                     <span className="text-[16px] font-bold text-slate-900 font-mono mt-1">428</span>
                  </div>
                  <div className="flex flex-col pl-4 first:pl-0 border-slate-100">
                     <span className="text-[11px] font-semibold text-slate-500 uppercase">Deliveries</span>
                     <span className="text-[16px] font-bold text-slate-900 font-mono mt-1">410</span>
                  </div>
                  <div className="flex flex-col pl-4 first:pl-0 border-slate-100">
                     <span className="text-[11px] font-semibold text-slate-500 uppercase">Opens</span>
                     <span className="text-[16px] font-bold text-slate-900 font-mono mt-1">295</span>
                  </div>
                  <div className="flex flex-col pl-4 first:pl-0 border-slate-100">
                     <span className="text-[11px] font-semibold text-slate-500 uppercase">Clicks</span>
                     <span className="text-[16px] font-bold text-slate-900 font-mono mt-1">84</span>
                  </div>
                  <div className="flex flex-col pl-4 first:pl-0 border-slate-100">
                     <span className="text-[11px] font-semibold text-slate-500 uppercase">Purchases</span>
                     <span className="text-[16px] font-bold text-slate-900 font-mono mt-1">20</span>
                  </div>
                  <div className="flex flex-col pl-4 first:pl-0 border-slate-100">
                     <span className="text-[11px] font-semibold text-slate-500 uppercase">Revenue</span>
                     <span className="text-[16px] font-bold text-emerald-600 font-mono mt-1">₹1.72L</span>
                  </div>
                  <div className="flex flex-col pl-4 first:pl-0 border-slate-100">
                     <span className="text-[11px] font-semibold text-slate-500 uppercase">ROI</span>
                     <span className="text-[16px] font-bold text-slate-900 font-mono mt-1">412%</span>
                  </div>
                  <div className="flex flex-col pl-4 first:pl-0 border-slate-100">
                     <span className="text-[11px] font-semibold text-slate-500 uppercase">Confidence</span>
                     <span className="text-[16px] font-bold text-slate-900 font-mono mt-1">82%</span>
                  </div>
               </div>
            </div>

          </div>
        )}

      </div>

      {/* Approval Panel (Sticky Sidebar) */}
      <div className="w-[340px] border-l border-slate-200 bg-slate-50 flex flex-col h-screen sticky top-0">
         <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <span className="text-[14px] font-bold text-slate-900 uppercase tracking-wider">Approval Panel</span>
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
         </div>
         
         <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
            <div className="flex flex-col gap-4">
               <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Campaign Summary</span>
               <div className="flex flex-col gap-3">
                  <div className="flex flex-col">
                     <span className="text-[12px] font-semibold text-slate-500">Target Audience</span>
                     <span className="text-[14px] font-bold text-slate-900">{submittedGoal ? 'Beauty Loyalists' : '--'}</span>
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[12px] font-semibold text-slate-500">Selected Channel</span>
                     <span className="text-[14px] font-bold text-slate-900">{submittedGoal ? 'WhatsApp' : '--'}</span>
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[12px] font-semibold text-slate-500">Predicted Revenue</span>
                     <span className="text-[14px] font-bold text-emerald-600 font-mono">{submittedGoal ? '₹1.72L' : '--'}</span>
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[12px] font-semibold text-slate-500">Confidence</span>
                     <span className="text-[14px] font-bold text-slate-900 font-mono">{submittedGoal ? '82%' : '--'}</span>
                  </div>
                  <div className="flex flex-col mt-2">
                     <span className="text-[12px] font-semibold text-slate-500">Launch Risk</span>
                     <span className="text-[13px] font-bold text-slate-900 bg-white border border-slate-200 px-3 py-2 rounded-md mt-1 shadow-sm">Low Fatigue Risk</span>
                  </div>
                  <div className="flex flex-col mt-2">
                     <span className="text-[12px] font-semibold text-slate-500">Schedule</span>
                     <span className="text-[13px] font-bold text-slate-900 bg-white border border-slate-200 px-3 py-2 rounded-md mt-1 shadow-sm">Send Immediately</span>
                  </div>
               </div>
            </div>
         </div>

         <div className="p-6 border-t border-slate-200 bg-white flex flex-col gap-3">
            <div className="flex gap-2">
               <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2.5 rounded-lg text-[13px] transition-colors shadow-sm">
                  Edit
               </button>
               <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2.5 rounded-lg text-[13px] transition-colors shadow-sm">
                  Send Test
               </button>
            </div>
            <button 
               disabled={!submittedGoal}
               onClick={() => router.push('/engagement/mock-campaign-id')}
               className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold py-3 rounded-lg text-[14px] transition-colors shadow-sm"
            >
               Approve & Launch
            </button>
         </div>
      </div>

    </div>
  );
}
