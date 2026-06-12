'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import { Search, Play, EditPencil, Clock, CheckCircle, Plus, Filter, LayoutRight, MessageText, ArrowRight, ShieldCheck, Mail, SmartphoneDevice, HeadsetHelp } from 'iconoir-react';
import { clsx } from 'clsx';

export default function CampaignStudioPage() {
  const router = useRouter();
  
  const [goal, setGoal] = useState('');
  const [submittedGoal, setSubmittedGoal] = useState(false);
  const [activeVariant, setActiveVariant] = useState('A');
  const [selectedChannel, setSelectedChannel] = useState('WhatsApp');
  const [isLaunching, setIsLaunching] = useState(false);

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

  const handleLaunch = async () => {
    setIsLaunching(true);
    try {
      const data = await fetchAPI<any>('/api/ai/launch-campaign', {
        method: 'POST',
        body: JSON.stringify({
          name: goal || 'Dormant VIP Recovery',
          channel: selectedChannel,
          message: activeVariant === 'A' 
            ? "Your favorite skincare products are back in stock. As one of our most loyal customers, we're giving you early access before everyone else." 
            : "It's been a while since we saw you. Here's a special 20% off your next purchase of serums.",
        })
      });
      if (data.campaign_id) {
         router.push(`/engagement/${data.campaign_id}`);
      } else {
         setIsLaunching(false);
         alert('Failed to launch campaign. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setIsLaunching(false);
      alert('Network error occurred.');
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-slate-50 justify-center">
      
      <div className="w-full max-w-[1300px] px-8 py-8 flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
           <div className="flex flex-col gap-1">
              <h1 className="text-[32px] font-bold text-slate-900 leading-none tracking-tight">Campaign Studio</h1>
              <p className="text-[14px] text-slate-500">Plan, personalize, and launch revenue campaigns.</p>
           </div>
           <div className="flex items-center gap-4">
             <button className="text-[13px] font-semibold text-slate-600 hover:text-slate-900 transition-colors">Recent Campaigns</button>
             <button className="text-[13px] font-semibold text-slate-600 hover:text-slate-900 transition-colors">Saved Audiences</button>
             <button className="flex items-center gap-1.5 text-[13px] font-bold bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-md transition-colors shadow-sm">
               <Plus height={16} width={16} /> New Campaign
             </button>
           </div>
        </div>

        {/* Goal Command Bar */}
        <div className="w-full mb-2">
          <form onSubmit={handleCommandSubmit} className="relative group">
            <Search height={20} width={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="What are you trying to achieve? (e.g. Recover dormant customers)"
              className="w-full bg-white border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl pl-12 pr-4 py-4 text-[16px] text-slate-900 font-medium placeholder-slate-400 transition-all outline-none shadow-sm"
            />
          </form>
        </div>

        {!submittedGoal ? (
          /* Empty State: Recommended Opportunities */
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <span className="text-[12px] font-bold text-slate-900 uppercase tracking-wider">Recommended Opportunities</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Dormant VIP Recovery', rev: '₹1,72,000', cust: 428, conf: '82%' },
                { title: 'VIP Retention', rev: '₹1,25,000', cust: 98, conf: '89%' },
                { title: 'Cross-Sell Expansion', rev: '₹81,000', cust: 126, conf: '74%' }
              ].map((opp, idx) => (
                <div key={idx} onClick={() => handleOpportunityClick(opp.title)} className="border border-slate-200 rounded-xl p-5 flex flex-col gap-4 bg-white hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group">
                   <div className="flex justify-between items-start">
                     <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{opp.title}</h3>
                   </div>
                   <div className="grid grid-cols-2 gap-2 mt-2">
                     <div className="flex flex-col">
                       <span className="text-[11px] font-semibold text-slate-500 uppercase">Revenue</span>
                       <span className="text-[15px] font-bold text-slate-900 font-mono">{opp.rev}</span>
                     </div>
                     <div className="flex flex-col">
                       <span className="text-[11px] font-semibold text-slate-500 uppercase">Customers</span>
                       <span className="text-[15px] font-bold text-slate-900 font-mono">{opp.cust}</span>
                     </div>
                   </div>
                   <div className="pt-4 mt-auto border-t border-slate-100 flex justify-between items-center">
                     <span className="text-[12px] font-bold text-slate-500 font-mono">{opp.conf} Confidence</span>
                     <span className="text-[12px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1">Create <ArrowRight height={12} width={12} /></span>
                   </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Active State: 12-Column Grid Layout */
          <div className="grid grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
            
            {/* 8-Column Campaign Workspace */}
            <div className="col-span-8 flex flex-col gap-8">
               
               {/* Strategy Summary (Executive Briefing) */}
               <div className="flex flex-col gap-3">
                  <span className="text-[12px] font-bold text-slate-900 uppercase tracking-wider">Strategy Summary</span>
                  <div className="grid grid-cols-3 gap-4">
                     <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
                        <span className="text-[12px] font-semibold text-slate-500 uppercase">Expected Revenue</span>
                        <span className="text-[20px] font-bold text-slate-900 font-mono">₹1,72,000</span>
                        <span className="text-[11px] text-slate-500 mt-1">Based on similar campaigns</span>
                     </div>
                     <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
                        <span className="text-[12px] font-semibold text-slate-500 uppercase">Conversion Rate</span>
                        <span className="text-[20px] font-bold text-slate-900 font-mono">4.8%</span>
                        <span className="text-[11px] text-slate-500 mt-1">Expected completion rate</span>
                     </div>
                     <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
                        <span className="text-[12px] font-semibold text-slate-500 uppercase">Rec. Channel</span>
                        <div className="flex items-center gap-1">
                           <span className="text-[20px] font-bold text-slate-900">WhatsApp</span>
                        </div>
                        <span className="text-[11px] text-slate-500 mt-1">Highest historical match</span>
                     </div>
                  </div>
               </div>

               {/* Channel Planner Table */}
               <div className="flex flex-col gap-3">
                  <span className="text-[12px] font-bold text-slate-900 uppercase tracking-wider">Channel Planner</span>
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                     <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                           <tr>
                              <th className="py-2.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Channel</th>
                              <th className="py-2.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Revenue</th>
                              <th className="py-2.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Conversion</th>
                              <th className="py-2.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Confidence</th>
                              <th className="py-2.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">ROI</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           <tr className="bg-slate-50/50">
                              <td className="py-3 px-4 text-[13px] font-bold text-slate-900 flex items-center gap-2">WhatsApp <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Rec</span></td>
                              <td className="py-3 px-4 text-[13px] font-bold text-slate-900 font-mono text-right">₹1,72,000</td>
                              <td className="py-3 px-4 text-[13px] font-bold text-slate-900 font-mono text-right">4.8%</td>
                              <td className="py-3 px-4 text-[13px] font-bold text-slate-900 font-mono text-right">82%</td>
                              <td className="py-3 px-4 text-[13px] font-bold text-slate-900 font-mono text-right">14.2x</td>
                           </tr>
                           <tr>
                              <td className="py-3 px-4 text-[13px] font-medium text-slate-700">Email</td>
                              <td className="py-3 px-4 text-[13px] font-medium text-slate-600 font-mono text-right">₹84,000</td>
                              <td className="py-3 px-4 text-[13px] font-medium text-slate-600 font-mono text-right">2.1%</td>
                              <td className="py-3 px-4 text-[13px] font-medium text-slate-600 font-mono text-right">76%</td>
                              <td className="py-3 px-4 text-[13px] font-medium text-slate-600 font-mono text-right">38.0x</td>
                           </tr>
                           <tr>
                              <td className="py-3 px-4 text-[13px] font-medium text-slate-700">SMS</td>
                              <td className="py-3 px-4 text-[13px] font-medium text-slate-600 font-mono text-right">₹42,000</td>
                              <td className="py-3 px-4 text-[13px] font-medium text-slate-600 font-mono text-right">1.2%</td>
                              <td className="py-3 px-4 text-[13px] font-medium text-slate-600 font-mono text-right">60%</td>
                              <td className="py-3 px-4 text-[13px] font-medium text-slate-600 font-mono text-right">4.8x</td>
                           </tr>
                        </tbody>
                     </table>
                  </div>
               </div>

               {/* Message Experience Hero */}
               <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                     <span className="text-[12px] font-bold text-slate-900 uppercase tracking-wider">Message Experience</span>
                  </div>

                  {/* Top Control Bar: Channels + Variants */}
                  <div className="flex flex-col gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                     
                     <div className="flex items-center gap-6">
                        {/* Channel Selection Tabs */}
                        <div className="flex items-center gap-4 border-r border-slate-200 pr-6">
                           {[
                              { id: 'WhatsApp', icon: MessageText },
                              { id: 'Email', icon: Mail },
                              { id: 'SMS', icon: SmartphoneDevice },
                              { id: 'Call Script', icon: HeadsetHelp },
                           ].map(c => {
                              const Icon = c.icon;
                              const isActive = selectedChannel === c.id;
                              return (
                                 <button 
                                    key={c.id}
                                    onClick={() => setSelectedChannel(c.id)}
                                    className={clsx(
                                       "flex items-center gap-1.5 pb-1 text-[13px] font-semibold border-b-2 transition-colors",
                                       isActive ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"
                                    )}
                                 >
                                    <Icon height={16} width={16} /> {c.id}
                                 </button>
                              );
                           })}
                        </div>

                        {/* Linear Style Segmented Controls for Variants */}
                        <div className="inline-flex bg-slate-100 p-1 rounded-lg">
                           {['A', 'B', 'C'].map(v => {
                              const isActive = activeVariant === v;
                              return (
                                 <button 
                                    key={v}
                                    onClick={() => setActiveVariant(v)}
                                    className={clsx(
                                       "px-4 py-1.5 text-[13px] font-semibold rounded-md transition-all flex items-center gap-1.5",
                                       isActive ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"
                                    )}
                                 >
                                    Variant {v}
                                    {v === 'A' && <span className="text-[10px] bg-slate-200 text-slate-700 px-1 py-0.5 rounded font-bold uppercase tracking-wider">Rec</span>}
                                 </button>
                              );
                           })}
                        </div>
                     </div>

                     {/* Variant Specific Metrics */}
                     {activeVariant === 'A' && (
                        <div className="flex items-center gap-6 bg-slate-50 rounded-lg p-3">
                           <div className="flex flex-col">
                              <span className="text-[11px] font-semibold text-slate-500 uppercase">Revenue</span>
                              <span className="text-[14px] font-bold text-slate-900 font-mono">
                                 {selectedChannel === 'WhatsApp' ? '₹1,72,000' : selectedChannel === 'Email' ? '₹84,000' : '₹42,000'}
                              </span>
                           </div>
                           <div className="flex flex-col pl-6 border-l border-slate-200">
                              <span className="text-[11px] font-semibold text-slate-500 uppercase">Conversion</span>
                              <span className="text-[14px] font-bold text-slate-900 font-mono">
                                 {selectedChannel === 'WhatsApp' ? '4.8%' : selectedChannel === 'Email' ? '2.1%' : '1.2%'}
                              </span>
                           </div>
                           <div className="flex flex-col pl-6 border-l border-slate-200">
                              <span className="text-[11px] font-semibold text-slate-500 uppercase">Confidence</span>
                              <span className="text-[14px] font-bold text-slate-900 font-mono">
                                 {selectedChannel === 'WhatsApp' ? '82%' : selectedChannel === 'Email' ? '76%' : '60%'}
                              </span>
                           </div>
                        </div>
                     )}
                  </div>

                  {/* Realistic Previews */}
                  <div className="bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center p-8 overflow-hidden min-h-[400px]">
                     
                     {selectedChannel === 'WhatsApp' && (
                        <div className="bg-white rounded-2xl w-full max-w-sm shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                           <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                                 <MessageText height={16} width={16} />
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-[14px] font-bold text-slate-900 flex items-center gap-1">
                                    Beauty Co. <ShieldCheck height={14} width={14} className="text-slate-400" />
                                 </span>
                                 <span className="text-[11px] font-medium text-slate-500">Official Business Account</span>
                              </div>
                           </div>
                           <div className="p-5 flex flex-col gap-2">
                              <span className="text-[10px] text-slate-400 font-bold self-center mb-2">TODAY 11:32 AM</span>
                              <p className="text-[14px] text-slate-800 leading-relaxed whitespace-pre-wrap">
                                 {activeVariant === 'A' 
                                    ? "Hi Rahul,\n\nYour favorite skincare products are back in stock. As one of our most loyal customers, we're giving you early access before everyone else."
                                    : "Hi Rahul,\n\nIt's been a while since we saw you. Here's a special 20% off your next purchase of serums."}
                              </p>
                              <button className="w-full mt-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 font-bold py-2 rounded-lg text-[13px] transition-colors shadow-sm">
                                 Shop Now
                              </button>
                           </div>
                        </div>
                     )}

                     {selectedChannel === 'Email' && (
                        <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl shadow-sm flex flex-col">
                           <div className="border-b border-slate-200 px-5 py-4 flex flex-col gap-2 bg-slate-50/50">
                              <div className="flex items-center gap-4">
                                 <span className="text-[12px] font-semibold text-slate-500 w-12 text-right">From</span>
                                 <span className="text-[13px] font-bold text-slate-900">Beauty Co. &lt;hello@beautyco.com&gt;</span>
                              </div>
                              <div className="flex items-center gap-4 border-t border-slate-100 pt-2 mt-1">
                                 <span className="text-[12px] font-semibold text-slate-500 w-12 text-right">Subject</span>
                                 <span className="text-[13px] font-bold text-slate-900">{activeVariant === 'A' ? "Exclusive Early Access" : "We've Missed You"}</span>
                              </div>
                           </div>
                           <div className="p-8 flex flex-col gap-6 items-center">
                              <p className="text-[15px] text-slate-800 leading-relaxed max-w-lg text-center">
                                 {activeVariant === 'A' 
                                 ? "Your favorite skincare products are back in stock. As one of our most loyal customers, we're giving you early access before everyone else."
                                 : "It's been a while since we saw you. Here's a special 20% off your next purchase of serums."}
                              </p>
                              <button className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-lg text-[14px] transition-colors shadow-sm">
                                 View Collection
                              </button>
                           </div>
                           <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-center">
                              <span className="text-[11px] text-slate-400">Beauty Co. | 123 Fashion Ave, NY | Unsubscribe</span>
                           </div>
                        </div>
                     )}

                     {selectedChannel === 'SMS' && (
                        <div className="bg-white border border-slate-200 rounded-[28px] p-2 w-[280px] shadow-sm">
                           <div className="bg-slate-100 rounded-[20px] rounded-bl-sm p-4 text-[14px] text-slate-900 leading-snug">
                              {activeVariant === 'A' 
                                 ? "Beauty Co: Hi Rahul, enjoy early access to your favorite serums before they sell out! VIPs only. Shop: bc.co/vip"
                                 : "Beauty Co: Hi Rahul, enjoy 20% off your next skincare purchase. Valid for 3 days. SHOP: bc.co/offer"}
                           </div>
                        </div>
                     )}

                     {selectedChannel === 'Call Script' && (
                        <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl shadow-sm flex flex-col p-8 gap-6">
                           <div className="flex flex-col gap-2">
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">Opening</span>
                              <span className="text-[14px] text-slate-800">"Hi, am I speaking with Rahul? This is [Agent Name] from Beauty Co. I'm calling because we noticed you're one of our top customers for skincare serums."</span>
                           </div>
                           <div className="flex flex-col gap-2">
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">Offer</span>
                              <span className="text-[14px] text-slate-800 font-semibold bg-blue-50/50 p-2 rounded">
                                 {activeVariant === 'A' 
                                    ? '"We have an exclusive restock today, and we wanted to offer you early access before it opens to the public."'
                                    : '"We wanted to offer you a special 20% discount on your next order of serums as a thank you for your past purchases."'}
                              </span>
                           </div>
                           <div className="flex flex-col gap-2">
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">Objection Handling</span>
                              <span className="text-[14px] text-slate-800">"If you're well-stocked right now, we can hold this offer on your account for the next 30 days. Would you like me to send you the details?"</span>
                           </div>
                           <div className="flex flex-col gap-2">
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">Closing CTA</span>
                              <span className="text-[14px] text-slate-800">"Great, I've just texted you the secure link. Thank you for being a valued customer, Rahul. Have a wonderful day!"</span>
                           </div>
                        </div>
                     )}
                  </div>
               </div>

               {/* Personalization Panel (Structured Metadata) */}
               <div className="flex flex-col gap-3">
                  <span className="text-[12px] font-bold text-slate-900 uppercase tracking-wider">Personalization Context</span>
                  <div className="grid grid-cols-2 gap-6 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                     
                     <div className="flex flex-col gap-4 border-r border-slate-100 pr-6">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Customer Profile</span>
                        <div className="flex justify-between items-center">
                           <span className="text-[13px] text-slate-500 font-medium">Name</span>
                           <span className="text-[13px] text-slate-900 font-bold">Rahul Sharma</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-[13px] text-slate-500 font-medium">LTV Tier</span>
                           <span className="text-[13px] text-slate-900 font-mono font-bold">VIP Top 10%</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-[13px] text-slate-500 font-medium">Audience Size</span>
                           <span className="text-[13px] text-slate-900 font-mono font-bold">428</span>
                        </div>
                     </div>

                     <div className="flex flex-col gap-4 pl-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Variables Used</span>
                        <div className="flex justify-between items-center">
                           <span className="text-[13px] text-slate-500 font-medium">Favorite Category</span>
                           <span className="text-[13px] text-slate-900 font-bold">Skincare Serums</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-[13px] text-slate-500 font-medium">Last Purchase</span>
                           <span className="text-[13px] text-slate-900 font-mono font-bold">64 Days Ago</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-[13px] text-slate-500 font-medium">Purchase Freq</span>
                           <span className="text-[13px] text-slate-900 font-mono font-bold">2.4x / Year</span>
                        </div>
                     </div>

                  </div>
               </div>

            </div>

            {/* 4-Column Campaign Control Center (Sticky) */}
            <div className="col-span-4 relative">
               <div className="sticky top-8 flex flex-col gap-4">
                  
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                     <div className="bg-slate-50 border-b border-slate-200 px-5 py-4">
                        <span className="text-[14px] font-bold text-slate-900 uppercase tracking-wider">Campaign Control Center</span>
                     </div>
                     
                     <div className="flex flex-col p-5 gap-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                           <span className="text-[13px] font-semibold text-slate-500">Status</span>
                           <span className="text-[13px] font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">Draft</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                           <span className="text-[13px] font-semibold text-slate-500">Target Audience</span>
                           <span className="text-[13px] font-bold text-slate-900">{submittedGoal ? 'Beauty Loyalists' : '--'}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                           <span className="text-[13px] font-semibold text-slate-500">Selected Channel</span>
                           <span className="text-[13px] font-bold text-slate-900">{submittedGoal ? selectedChannel : '--'}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                           <span className="text-[13px] font-semibold text-slate-500">Predicted Revenue</span>
                           <span className="text-[13px] font-bold text-slate-900 font-mono">
                              {submittedGoal ? (selectedChannel === 'WhatsApp' ? '₹1,72,000' : selectedChannel === 'Email' ? '₹84,000' : selectedChannel === 'SMS' ? '₹42,000' : '₹21,000') : '--'}
                           </span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                           <span className="text-[13px] font-semibold text-slate-500">Confidence</span>
                           <span className="text-[13px] font-bold text-slate-900 font-mono">
                              {submittedGoal ? (selectedChannel === 'WhatsApp' ? '82%' : selectedChannel === 'Email' ? '76%' : selectedChannel === 'SMS' ? '60%' : '45%') : '--'}
                           </span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                           <span className="text-[13px] font-semibold text-slate-500">Launch Risk</span>
                           <span className="text-[13px] font-bold text-slate-900 flex items-center gap-1">Low <ShieldCheck height={14} width={14} className="text-slate-400" /></span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-[13px] font-semibold text-slate-500">Schedule</span>
                           <span className="text-[13px] font-bold text-slate-900">Immediate</span>
                        </div>
                     </div>
                     
                     <div className="p-5 border-t border-slate-200 bg-slate-50 flex flex-col gap-3">
                        <div className="flex gap-2">
                           <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold py-2 rounded-lg text-[13px] transition-colors shadow-sm">
                              Send Test
                           </button>
                           <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold py-2 rounded-lg text-[13px] transition-colors shadow-sm">
                              Schedule
                           </button>
                        </div>
                        <button className="w-full bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold py-2 rounded-lg text-[13px] transition-colors shadow-sm mb-2">
                           Save Draft
                        </button>
                        <button 
                           disabled={!submittedGoal || isLaunching}
                           onClick={handleLaunch}
                           className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold py-3 rounded-lg text-[14px] transition-colors shadow-sm flex items-center justify-center gap-2"
                        >
                           {isLaunching ? 'Launching...' : 'Approve & Launch'}
                        </button>
                     </div>
                  </div>

               </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
