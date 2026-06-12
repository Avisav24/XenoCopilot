'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCampaignInsights } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { NavArrowLeft, Play, Pause, Copy, Download, User, ArrowRight, CheckCircle } from 'iconoir-react';

export default function EngagementInsightsPage() {
  const { id } = useParams();
  const router = useRouter();
  // Make "Messages" the default tab per requirements
  const [activeTab, setActiveTab] = useState('Messages');

  const { data: insights, isLoading } = useQuery({
    queryKey: ['campaign-insights', id],
    queryFn: () => getCampaignInsights(id as string),
    refetchInterval: 5000, // Reduced polling frequency to feel less like a real-time stream
  });

  if (isLoading) {
    return <div className="p-10 min-h-[60vh] flex items-center justify-center text-slate-500 font-medium">Loading campaign data...</div>;
  }

  if (!insights) {
    return <div className="p-10 text-center text-slate-900">Campaign not found.</div>;
  }

  const { funnel } = insights;
  const tabs = ['Messages', 'Analytics', 'Audience', 'Overview'];

  return (
    <div className="w-full flex flex-col gap-8 pb-24 max-w-[1400px]">
      
      {/* Navigation */}
      <button 
        onClick={() => router.push('/engagement')}
        className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-[13px] font-medium w-fit transition-colors"
      >
        <NavArrowLeft height={18} width={18} /> Back to Campaigns
      </button>

      {/* 1. Campaign Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        <div className="flex flex-col gap-3">
          <h1 className="text-[28px] font-bold text-slate-900 leading-none">
            {insights.campaign_name || 'New Arrivals Campaign'}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider">
              <Play height={12} width={12} /> Running
            </span>
            <span className="text-[12px] px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-bold uppercase tracking-wider">
              {insights.channel || 'WhatsApp'}
            </span>
            <span className="text-[14px] font-semibold text-slate-700 ml-2">
              {insights.persona || 'Beauty Loyalists'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[14px] text-slate-600">
              {insights.audience_count || 90} Customers
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[14px] text-slate-500">
              Started 4 Days Ago
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-[13px] font-semibold text-slate-700 transition-colors">
            <User height={16} width={16} /> View Audience
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-[13px] font-semibold text-slate-700 transition-colors">
            <Copy height={16} width={16} /> Duplicate
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-[13px] font-semibold text-slate-700 transition-colors">
            <Pause height={16} width={16} /> Pause
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-[13px] font-semibold text-slate-700 transition-colors">
            <Download height={16} width={16} /> Export
          </button>
        </div>
      </div>

      {/* 2. Campaign Health Summary */}
      <div className="flex flex-col gap-3">
         <h3 className="text-[16px] font-bold text-slate-900">Campaign Health</h3>
         <div className="grid grid-cols-2 md:grid-cols-5 gap-0 border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden divide-x divide-slate-200">
            <div className="p-5 flex flex-col gap-1 cursor-pointer hover:bg-slate-50 transition-colors group">
               <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider group-hover:text-slate-900 transition-colors">Status</span>
               <span className="text-[18px] font-bold text-emerald-600">Performing Above Target</span>
               <span className="text-[12px] font-medium text-slate-500 mt-1">Exceeding baseline by 14%</span>
            </div>
            <div className="p-5 flex flex-col gap-1 cursor-pointer hover:bg-slate-50 transition-colors group">
               <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider group-hover:text-slate-900 transition-colors">Revenue Generated</span>
               <span className="text-[20px] font-bold text-slate-900 font-mono-numbers">{insights.actual_revenue || '₹27,385'}</span>
               <span className="text-[12px] font-medium text-slate-500 mt-1">From 90 customers</span>
            </div>
            <div className="p-5 flex flex-col gap-1 cursor-pointer hover:bg-slate-50 transition-colors group">
               <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider group-hover:text-slate-900 transition-colors">Conversion Rate</span>
               <span className="text-[20px] font-bold text-slate-900 font-mono-numbers">{funnel.conversion_rate || '8.9%'}</span>
               <span className="text-[12px] font-medium text-slate-500 mt-1">Industry avg: 2.1%</span>
            </div>
            <div className="p-5 flex flex-col gap-1 cursor-pointer hover:bg-slate-50 transition-colors group">
               <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider group-hover:text-slate-900 transition-colors">Top Audience</span>
               <span className="text-[16px] font-bold text-slate-900 mt-1">{insights.persona || 'Beauty Loyalists'}</span>
               <span className="text-[12px] font-medium text-slate-500 mt-1">Highest CTR group</span>
            </div>
            <div className="p-5 flex flex-col gap-1 cursor-pointer hover:bg-slate-50 transition-colors group bg-slate-50">
               <span className="text-[12px] font-semibold text-slate-900 uppercase tracking-wider">Best Action</span>
               <span className="text-[16px] font-bold text-slate-900 mt-1 flex items-center gap-1">Increase audience 2x <ArrowRight height={16} width={16} className="text-blue-600"/></span>
               <span className="text-[12px] font-medium text-slate-500 mt-1 hover:text-blue-600">Review Audience Builder →</span>
            </div>
         </div>
      </div>

      {/* 3. Campaign Timeline & Cadence Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Timeline */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <h3 className="text-[16px] font-bold text-slate-900">Campaign Timeline</h3>
          <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 flex items-center gap-8 border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <div className="flex flex-col gap-0.5 min-w-[100px]">
                <span className="text-[14px] font-bold text-slate-900">18 Jun 2026</span>
                <span className="text-[12px] text-slate-500 font-semibold uppercase">Current</span>
              </div>
              <div className="flex flex-col gap-0.5 flex-1">
                <span className="text-[15px] font-bold text-blue-600">New Arrivals Campaign</span>
                <span className="text-[13px] text-slate-600">WhatsApp • Beauty Loyalists</span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[15px] font-bold text-slate-900 font-mono-numbers">₹27,385</span>
                <span className="text-[12px] text-slate-500">8.9% Conversion</span>
              </div>
            </div>
            
            <div className="px-6 py-4 flex items-center gap-8 border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <div className="flex flex-col gap-0.5 min-w-[100px]">
                <span className="text-[14px] font-semibold text-slate-700">09 Jun 2026</span>
              </div>
              <div className="flex flex-col gap-0.5 flex-1">
                <span className="text-[15px] font-semibold text-slate-900">VIP Loyalty Campaign</span>
                <span className="text-[13px] text-slate-500">Email • Top Spenders</span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[15px] font-semibold text-slate-700 font-mono-numbers">₹18,200</span>
                <span className="text-[12px] text-slate-500">4.1% Conversion</span>
              </div>
            </div>
            
            <div className="px-6 py-4 flex items-center gap-8 border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <div className="flex flex-col gap-0.5 min-w-[100px]">
                <span className="text-[14px] font-semibold text-slate-700">28 May 2026</span>
              </div>
              <div className="flex flex-col gap-0.5 flex-1">
                <span className="text-[15px] font-semibold text-slate-900">Skincare Bundle Promotion</span>
                <span className="text-[13px] text-slate-500">WhatsApp • Beauty Loyalists</span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[15px] font-semibold text-slate-700 font-mono-numbers">₹31,100</span>
                <span className="text-[12px] text-slate-500">11.2% Conversion</span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Recommendation & Cadence */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <h3 className="text-[16px] font-bold text-slate-900">Next Recommended Campaign</h3>
          <div className="border border-slate-200 rounded-xl bg-white shadow-sm p-5 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-900" />
            
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Optimal Send Window</span>
                <span className="text-[18px] font-bold text-slate-900">25 Jun 2026</span>
              </div>
              <span className="text-[11px] font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded uppercase tracking-wider">87% Confidence</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-1">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Audience</span>
                <span className="text-[13px] font-bold text-slate-900">Beauty Loyalists</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Channel</span>
                <span className="text-[13px] font-bold text-slate-900">WhatsApp</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Expected Rev</span>
                <span className="text-[13px] font-bold text-emerald-600">₹32,000</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Expected Conv</span>
                <span className="text-[13px] font-bold text-slate-900">9.2%</span>
              </div>
            </div>

            <div className="flex flex-col gap-1 border-t border-slate-100 pt-3">
               <span className="text-[12px] font-bold text-slate-900">Reason</span>
               <p className="text-[13px] text-slate-600 leading-tight">Historical engagement peaks occur 6-8 days after previous campaign engagement.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 mt-1">
               <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Audience Fatigue Risk</span>
                  <span className="text-[13px] font-bold text-emerald-600">Low</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Campaign Cadence</span>
                  <span className="text-[13px] font-bold text-slate-900">Every 9 Days</span>
               </div>
            </div>
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-slate-200 mt-4">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "pb-4 text-[15px] font-bold transition-colors border-b-[3px]",
              activeTab === tab ? "text-slate-900 border-slate-900" : "text-slate-500 border-transparent hover:text-slate-900"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex flex-col mt-4">
        
        {activeTab === 'Messages' && (
          <div className="flex flex-col gap-6">
            <h3 className="text-[18px] font-bold text-slate-900">Variant Performance Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               
               {/* Variant A (Winner) */}
               <div className="border-2 border-emerald-500 rounded-xl bg-white shadow-sm flex flex-col overflow-hidden relative">
                  <div className="bg-emerald-50 py-2 px-4 border-b border-emerald-100 flex items-center justify-between">
                     <span className="text-[13px] font-bold text-emerald-800">Variant A</span>
                     <span className="text-[12px] font-bold text-emerald-700 flex items-center gap-1"><CheckCircle height={14} width={14} /> Winning Variant</span>
                  </div>
                  <div className="p-5 flex flex-col gap-4">
                     <div className="flex flex-col gap-1">
                        <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Revenue</span>
                        <span className="text-[24px] font-bold text-slate-900 font-mono-numbers">₹27,385</span>
                     </div>
                     <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 text-[14px] text-slate-800 leading-relaxed font-medium">
                        "Hey [Name], your favorite beauty products are back in stock. As a loyalist, use code VIP10 for early access today."
                     </div>
                  </div>
               </div>

               {/* Variant B */}
               <div className="border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col overflow-hidden">
                  <div className="bg-slate-50 py-2 px-4 border-b border-slate-200 flex items-center justify-between">
                     <span className="text-[13px] font-bold text-slate-700">Variant B</span>
                  </div>
                  <div className="p-5 flex flex-col gap-4">
                     <div className="flex flex-col gap-1">
                        <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Revenue</span>
                        <span className="text-[24px] font-bold text-slate-900 font-mono-numbers">₹23,120</span>
                     </div>
                     <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-[14px] text-slate-800 leading-relaxed">
                        "New arrivals are here! Check out the latest beauty trends before they sell out."
                     </div>
                  </div>
               </div>

               {/* Variant C */}
               <div className="border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col overflow-hidden">
                  <div className="bg-slate-50 py-2 px-4 border-b border-slate-200 flex items-center justify-between">
                     <span className="text-[13px] font-bold text-slate-700">Variant C</span>
                  </div>
                  <div className="p-5 flex flex-col gap-4">
                     <div className="flex flex-col gap-1">
                        <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Revenue</span>
                        <span className="text-[24px] font-bold text-slate-900 font-mono-numbers">₹19,800</span>
                     </div>
                     <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-[14px] text-slate-800 leading-relaxed">
                        "Restock Alert: Your previous purchases are available now. Click to order."
                     </div>
                  </div>
               </div>

            </div>
          </div>
        )}

        {activeTab === 'Analytics' && (
          <div className="flex flex-col gap-10">
            
            {/* Revenue Breakdown */}
            <div className="flex flex-col gap-5">
               <h3 className="text-[18px] font-bold text-slate-900">Revenue Breakdown</h3>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="p-6 border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col gap-1.5 cursor-pointer hover:border-blue-300 transition-colors">
                     <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Direct Purchases</span>
                     <span className="text-[24px] font-mono-numbers font-bold text-slate-900">₹18,200</span>
                  </div>
                  <div className="p-6 border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col gap-1.5 cursor-pointer hover:border-blue-300 transition-colors">
                     <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Repeat Purchases</span>
                     <span className="text-[24px] font-mono-numbers font-bold text-slate-900">₹6,100</span>
                  </div>
                  <div className="p-6 border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col gap-1.5 cursor-pointer hover:border-blue-300 transition-colors">
                     <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Cross-Sell Revenue</span>
                     <span className="text-[24px] font-mono-numbers font-bold text-slate-900">₹2,400</span>
                  </div>
                  <div className="p-6 border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col gap-1.5 cursor-pointer hover:border-blue-300 transition-colors">
                     <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Upsell Revenue</span>
                     <span className="text-[24px] font-mono-numbers font-bold text-slate-900">₹685</span>
                  </div>
               </div>
            </div>

            {/* Revenue Attribution */}
            <div className="flex flex-col gap-5">
               <div className="flex flex-col gap-1">
                 <h3 className="text-[18px] font-bold text-slate-900">Revenue Attribution</h3>
                 <p className="text-[14px] text-slate-500">Orders placed as a direct result of clicking this campaign.</p>
               </div>
               <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                 <table className="w-full text-left border-collapse">
                   <thead className="bg-slate-50 border-b border-slate-200">
                     <tr>
                       <th className="py-4 px-6 text-[13px] font-semibold text-slate-600 uppercase tracking-wider">Order ID</th>
                       <th className="py-4 px-6 text-[13px] font-semibold text-slate-600 uppercase tracking-wider">Customer</th>
                       <th className="py-4 px-6 text-[13px] font-semibold text-slate-600 uppercase tracking-wider text-right">Attributed Revenue</th>
                       <th className="py-4 px-6 text-[13px] font-semibold text-slate-600 uppercase tracking-wider">Timeline Context</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     <tr className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                       <td className="py-4 px-6 text-[14px] font-bold text-blue-600 font-mono-numbers">#8932</td>
                       <td className="py-4 px-6 text-[14px] font-medium text-slate-900">Rahul Sharma</td>
                       <td className="py-4 px-6 text-[15px] font-mono-numbers font-bold text-emerald-700 text-right">₹2,100</td>
                       <td className="py-4 px-6 text-[13px] text-slate-600">Purchased 47 minutes after click</td>
                     </tr>
                     <tr className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                       <td className="py-4 px-6 text-[14px] font-bold text-blue-600 font-mono-numbers">#8914</td>
                       <td className="py-4 px-6 text-[14px] font-medium text-slate-900">Priya Singh</td>
                       <td className="py-4 px-6 text-[15px] font-mono-numbers font-bold text-emerald-700 text-right">₹4,250</td>
                       <td className="py-4 px-6 text-[13px] text-slate-600">Purchased 1 hour 12 minutes after click</td>
                     </tr>
                     <tr className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                       <td className="py-4 px-6 text-[14px] font-bold text-blue-600 font-mono-numbers">#8890</td>
                       <td className="py-4 px-6 text-[14px] font-medium text-slate-900">Amit Kumar</td>
                       <td className="py-4 px-6 text-[15px] font-mono-numbers font-bold text-emerald-700 text-right">₹1,800</td>
                       <td className="py-4 px-6 text-[13px] text-slate-600">Purchased 2 hours 40 minutes after click</td>
                     </tr>
                   </tbody>
                 </table>
               </div>
            </div>

            {/* Communication Logs */}
            <div className="flex flex-col gap-5">
               <div className="flex flex-col gap-1">
                 <h3 className="text-[18px] font-bold text-slate-900">Communication Logs</h3>
                 <p className="text-[14px] text-slate-500">Real-time webhook events simulated from channel services.</p>
               </div>
               <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                 <table className="w-full text-left border-collapse">
                   <thead className="bg-slate-50 border-b border-slate-200">
                     <tr>
                       <th className="py-4 px-6 text-[13px] font-semibold text-slate-600 uppercase tracking-wider">Customer</th>
                       <th className="py-4 px-6 text-[13px] font-semibold text-slate-600 uppercase tracking-wider">Channel</th>
                       <th className="py-4 px-6 text-[13px] font-semibold text-slate-600 uppercase tracking-wider">Event Stream</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     <tr className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                       <td className="py-4 px-6 text-[14px] font-medium text-slate-900 w-48 align-top">Rahul Sharma</td>
                       <td className="py-4 px-6 text-[14px] font-medium text-slate-600 w-32 align-top">WhatsApp</td>
                       <td className="py-4 px-6 text-[13px] font-mono text-slate-600 flex flex-col gap-1">
                         <div className="flex justify-between w-64"><span>Sent</span><span className="font-bold">09:41 AM</span></div>
                         <div className="flex justify-between w-64"><span>Delivered</span><span className="font-bold">09:42 AM</span></div>
                         <div className="flex justify-between w-64"><span>Opened</span><span className="font-bold text-blue-600">09:43 AM</span></div>
                         <div className="flex justify-between w-64"><span>Clicked</span><span className="font-bold text-blue-600">09:45 AM</span></div>
                         <div className="flex justify-between w-64"><span>Purchased</span><span className="font-bold text-emerald-600">10:12 AM</span></div>
                       </td>
                     </tr>
                     <tr className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                       <td className="py-4 px-6 text-[14px] font-medium text-slate-900 w-48 align-top">Priya Singh</td>
                       <td className="py-4 px-6 text-[14px] font-medium text-slate-600 w-32 align-top">WhatsApp</td>
                       <td className="py-4 px-6 text-[13px] font-mono text-slate-600 flex flex-col gap-1">
                         <div className="flex justify-between w-64"><span>Sent</span><span className="font-bold">09:41 AM</span></div>
                         <div className="flex justify-between w-64"><span>Delivered</span><span className="font-bold">09:41 AM</span></div>
                         <div className="flex justify-between w-64"><span>Opened</span><span className="font-bold text-blue-600">11:05 AM</span></div>
                         <div className="flex justify-between w-64"><span>Clicked</span><span className="font-bold text-blue-600">11:08 AM</span></div>
                         <div className="flex justify-between w-64"><span>Purchased</span><span className="font-bold text-emerald-600">12:20 PM</span></div>
                       </td>
                     </tr>
                   </tbody>
                 </table>
               </div>
            </div>

            {/* Campaign Funnel */}
            <div className="flex flex-col gap-5">
              <h3 className="text-[18px] font-bold text-slate-900">Communication Funnel</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="py-4 px-6 text-[13px] font-semibold text-slate-600 uppercase tracking-wider">Stage</th>
                      <th className="py-4 px-6 text-[13px] font-semibold text-slate-600 uppercase tracking-wider text-right">Volume</th>
                      <th className="py-4 px-6 text-[13px] font-semibold text-slate-600 uppercase tracking-wider text-right">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                      <td className="py-4 px-6 text-[14px] font-medium text-slate-900">Sent</td>
                      <td className="py-4 px-6 text-[15px] font-mono-numbers text-right text-slate-700">{funnel.sent}</td>
                      <td className="py-4 px-6 text-[15px] font-mono-numbers text-right text-slate-700">100%</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                      <td className="py-4 px-6 text-[14px] font-medium text-slate-900">Delivered</td>
                      <td className="py-4 px-6 text-[15px] font-mono-numbers text-right text-slate-700">{funnel.delivered}</td>
                      <td className="py-4 px-6 text-[15px] font-mono-numbers text-right text-slate-700">{funnel.delivery_rate}</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                      <td className="py-4 px-6 text-[14px] font-medium text-slate-900">Opened</td>
                      <td className="py-4 px-6 text-[15px] font-mono-numbers text-right text-slate-700">{funnel.opened}</td>
                      <td className="py-4 px-6 text-[15px] font-mono-numbers text-right text-slate-700">{funnel.open_rate}</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                      <td className="py-4 px-6 text-[14px] font-medium text-slate-900">Clicked</td>
                      <td className="py-4 px-6 text-[15px] font-mono-numbers text-right text-slate-700">{funnel.clicked}</td>
                      <td className="py-4 px-6 text-[15px] font-mono-numbers text-right text-slate-700">{funnel.click_rate}</td>
                    </tr>
                    <tr className="bg-emerald-50/30 hover:bg-emerald-50/60 transition-colors cursor-pointer">
                      <td className="py-4 px-6 text-[14px] font-bold text-emerald-800">Purchased</td>
                      <td className="py-4 px-6 text-[15px] font-mono-numbers font-bold text-emerald-700 text-right">{funnel.purchased}</td>
                      <td className="py-4 px-6 text-[15px] font-mono-numbers font-bold text-emerald-700 text-right">{funnel.conversion_rate}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Audience' && (
          <div className="p-12 border border-slate-200 rounded-xl bg-slate-50 text-center flex flex-col items-center justify-center gap-2">
             <h4 className="text-[15px] font-semibold text-slate-900">Audience Segment: Beauty Loyalists</h4>
             <p className="text-[14px] text-slate-500">Breakdown unavailable for this specific campaign sandbox.</p>
          </div>
        )}

        {activeTab === 'Overview' && (
          <div className="flex flex-col gap-6 max-w-[800px]">
             <h3 className="text-[18px] font-bold text-slate-900">Recent Campaign Events</h3>
             <div className="border border-slate-200 rounded-xl bg-white shadow-sm p-6 flex flex-col gap-6">
                
                <div className="flex items-start gap-4">
                   <div className="text-[13px] font-bold text-slate-500 w-20 pt-0.5">09:42 AM</div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[14px] font-bold text-slate-900">8 new conversions recorded</span>
                      <span className="text-[13px] text-slate-500">Driven by Variant A in WhatsApp</span>
                   </div>
                </div>

                <div className="flex items-start gap-4">
                   <div className="text-[13px] font-bold text-slate-500 w-20 pt-0.5">09:18 AM</div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[14px] font-bold text-slate-900">Revenue crossed ₹25,000</span>
                      <span className="text-[13px] text-slate-500">Milestone achieved earlier than predicted</span>
                   </div>
                </div>

                <div className="flex items-start gap-4">
                   <div className="text-[13px] font-bold text-slate-500 w-20 pt-0.5">08:56 AM</div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[14px] font-bold text-slate-900">WhatsApp CTR increased 12%</span>
                      <span className="text-[13px] text-slate-500">Surge observed after morning commute window</span>
                   </div>
                </div>

                <div className="flex items-start gap-4">
                   <div className="text-[13px] font-bold text-slate-500 w-20 pt-0.5">08:15 AM</div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[14px] font-bold text-slate-900">Highest engagement from Beauty Loyalists</span>
                      <span className="text-[13px] text-slate-500">Segment is outperforming expected baseline</span>
                   </div>
                </div>

             </div>
          </div>
        )}

      </div>

    </div>
  );
}
