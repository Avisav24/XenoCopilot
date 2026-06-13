'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCampaignInsights, getCampaignAutopsy } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { setCampaignContext } from '@/lib/campaignContext';
import { clsx } from 'clsx';
import { NavArrowLeft, Play, Pause, Copy, Download, User, ArrowRight, CheckCircle } from 'iconoir-react';

export default function EngagementInsightsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Messages');

  const { data: insights, isLoading } = useQuery({
    queryKey: ['campaign-insights', id],
    queryFn: () => getCampaignInsights(id as string),
    refetchInterval: 5000,
  });

  const { data: autopsy, isLoading: isAutopsyLoading } = useQuery({
    queryKey: ['campaign-autopsy', id],
    queryFn: () => getCampaignAutopsy(id as string),
    enabled: !!insights,
    staleTime: Infinity
  });

  if (isLoading) {
    return <div className="p-10 min-h-[60vh] flex items-center justify-center text-slate-500 font-medium">Loading campaign data...</div>;
  }

  if (!insights) {
    return <div className="p-10 text-center text-slate-900">Campaign not found.</div>;
  }

  const { funnel } = insights;
  const tabs = ['Messages', 'Intelligence Report', 'Audience'];

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
          <button onClick={() => {
            setCampaignContext({
               sourcePage: 'Campaign Detail',
               audienceName: insights.persona || 'Audience',
               audienceSize: insights.audience_count || 90,
               expectedRevenue: funnel.revenue || 0,
               recommendedChannel: insights.channel || 'WhatsApp',
               autoTriggerPrompt: `Duplicate the "${insights.name}" campaign for ${insights.audience_count || 90} customers in the ${insights.persona || 'Audience'} segment via ${insights.channel || 'WhatsApp'}. Optimize the messaging based on the previous performance.`
            });
            router.push('/chat');
          }} className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-[13px] font-semibold text-slate-700 transition-colors">
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

      {/* 2. Real Funnel Metrics */}
      <div className="flex flex-col gap-3">
         <h3 className="text-[16px] font-bold text-slate-900">Communication Funnel</h3>
         <div className="grid grid-cols-2 md:grid-cols-6 gap-0 border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden divide-x divide-slate-200">
            <div className="p-5 flex flex-col gap-1 cursor-pointer hover:bg-slate-50 transition-colors">
               <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Recipients</span>
               <span className="text-[20px] font-bold text-slate-900 font-mono-numbers">{funnel.sent}</span>
            </div>
            <div className="p-5 flex flex-col gap-1 cursor-pointer hover:bg-slate-50 transition-colors relative group">
               <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Delivered</span>
               <span className="text-[20px] font-bold text-slate-900 font-mono-numbers">{funnel.delivered}</span>
               <span className="text-[12px] font-medium text-slate-500 mt-1">{funnel.delivery_rate} Delivery Rate</span>
               <div className="hidden md:block absolute top-1/2 -left-3 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-l-[8px] border-l-slate-200 border-b-[8px] border-b-transparent z-10"></div>
               <div className="hidden md:block absolute top-1/2 -left-[10px] -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-l-[8px] border-l-white border-b-[8px] border-b-transparent z-20 group-hover:border-l-slate-50 transition-colors"></div>
            </div>
            <div className="p-5 flex flex-col gap-1 cursor-pointer hover:bg-slate-50 transition-colors relative group">
               <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Opened</span>
               <span className="text-[20px] font-bold text-slate-900 font-mono-numbers">{funnel.opened}</span>
               <span className="text-[12px] font-medium text-slate-500 mt-1">{funnel.open_rate} Open Rate</span>
               <div className="hidden md:block absolute top-1/2 -left-3 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-l-[8px] border-l-slate-200 border-b-[8px] border-b-transparent z-10"></div>
               <div className="hidden md:block absolute top-1/2 -left-[10px] -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-l-[8px] border-l-white border-b-[8px] border-b-transparent z-20 group-hover:border-l-slate-50 transition-colors"></div>
            </div>
            <div className="p-5 flex flex-col gap-1 cursor-pointer hover:bg-slate-50 transition-colors relative group">
               <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Clicked</span>
               <span className="text-[20px] font-bold text-slate-900 font-mono-numbers">{funnel.clicked}</span>
               <span className="text-[12px] font-medium text-slate-500 mt-1">{funnel.click_rate} Click Rate</span>
               <div className="hidden md:block absolute top-1/2 -left-3 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-l-[8px] border-l-slate-200 border-b-[8px] border-b-transparent z-10"></div>
               <div className="hidden md:block absolute top-1/2 -left-[10px] -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-l-[8px] border-l-white border-b-[8px] border-b-transparent z-20 group-hover:border-l-slate-50 transition-colors"></div>
            </div>
            <div className="p-5 flex flex-col gap-1 cursor-pointer transition-colors bg-emerald-50/50 hover:bg-emerald-50 relative group">
               <span className="text-[12px] font-semibold text-emerald-800 uppercase tracking-wider">Purchased</span>
               <span className="text-[20px] font-bold text-emerald-700 font-mono-numbers">{funnel.purchased}</span>
               <span className="text-[12px] font-medium text-emerald-600 mt-1">{funnel.conversion_rate} Purchase Rate</span>
               <div className="hidden md:block absolute top-1/2 -left-3 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-l-[8px] border-l-slate-200 border-b-[8px] border-b-transparent z-10"></div>
               <div className="hidden md:block absolute top-1/2 -left-[10px] -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-l-[8px] border-l-white border-b-[8px] border-b-transparent z-20 group-hover:border-l-emerald-50 transition-colors"></div>
            </div>
            <div className="p-5 flex flex-col gap-1 cursor-pointer transition-colors bg-blue-50/50 hover:bg-blue-50 relative group">
               <span className="text-[12px] font-semibold text-blue-800 uppercase tracking-wider">Revenue Attributed</span>
               <span className="text-[20px] font-bold text-blue-700 font-mono-numbers">{insights.actual_revenue || '₹0'}</span>
               <div className="hidden md:block absolute top-1/2 -left-3 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-l-[8px] border-l-slate-200 border-b-[8px] border-b-transparent z-10"></div>
               <div className="hidden md:block absolute top-1/2 -left-[10px] -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-l-[8px] border-l-emerald-50 border-b-[8px] border-b-transparent z-20 group-hover:border-l-emerald-50 transition-colors"></div>
            </div>
         </div>
      </div>

      {/* 3. Recent Communication Events */}
      <div className="flex flex-col gap-3">
         <h3 className="text-[16px] font-bold text-slate-900">Recent Communication Events</h3>
         <div className="border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            {insights.recent_events && insights.recent_events.length > 0 ? (
               insights.recent_events.map((ev: any, idx: number) => {
                  const timeStr = new Date(ev.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                  return (
                     <div key={idx} className="px-6 py-4 flex items-center gap-6 hover:bg-slate-50 transition-colors">
                        <div className="text-[13px] font-bold text-slate-500 w-24">{timeStr}</div>
                        <div className="flex-1 flex flex-col">
                           <span className="text-[14px] font-semibold text-slate-900">
                              {ev.type === 'Purchase recorded' ? `${ev.type} ${ev.revenue}` : `${ev.type} ${ev.customer}`}
                           </span>
                        </div>
                     </div>
                  );
               })
            ) : (
               <div className="p-8 text-center text-[14px] text-slate-500">No events recorded yet.</div>
            )}
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

        {activeTab === 'Intelligence Report' && (
          <div className="flex flex-col gap-6">
            <h3 className="text-[18px] font-bold text-slate-900">Campaign Intelligence Report</h3>
            {isAutopsyLoading ? (
              <div className="p-12 border border-slate-200 rounded-xl bg-slate-50 text-center text-slate-500 font-medium">Generating AI Autopsy Report...</div>
            ) : autopsy ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 p-6 border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col gap-2">
                  <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Executive Summary</span>
                  <p className="text-[15px] text-slate-800 leading-relaxed font-medium">{autopsy.executiveSummary}</p>
                </div>
                
                <div className="p-6 border border-slate-200 rounded-xl bg-emerald-50/30 flex flex-col gap-3">
                  <span className="text-[12px] font-semibold text-emerald-700 uppercase tracking-wider">What Worked</span>
                  <ul className="flex flex-col gap-2">
                    {autopsy.whatWorked?.map((w: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-[14px] text-slate-700 font-medium">
                        <span className="text-emerald-500 mt-1">•</span> {w}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 border border-slate-200 rounded-xl bg-red-50/30 flex flex-col gap-3">
                  <span className="text-[12px] font-semibold text-red-700 uppercase tracking-wider">What Failed</span>
                  <ul className="flex flex-col gap-2">
                    {autopsy.whatFailed?.map((f: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-[14px] text-slate-700 font-medium">
                        <span className="text-red-500 mt-1">•</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col gap-2">
                  <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Root Cause Analysis</span>
                  <p className="text-[14px] text-slate-700 leading-relaxed font-medium">{autopsy.rootCauseAnalysis}</p>
                </div>

                <div className="p-6 border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col gap-2">
                  <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Revenue Attribution</span>
                  <p className="text-[14px] text-slate-700 leading-relaxed font-medium">{autopsy.revenueAttribution}</p>
                </div>

                <div className="md:col-span-2 p-6 border border-primary/20 bg-primary-soft rounded-xl flex flex-col gap-4">
                  <span className="text-[12px] font-semibold text-primary uppercase tracking-wider">Strategic Recommendations</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <span className="text-[13px] font-bold text-slate-900">Improvements for Next Time</span>
                      <ul className="flex flex-col gap-2">
                        {autopsy.recommendedImprovements?.map((imp: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-[14px] text-slate-700 font-medium">
                            <span className="text-primary mt-1">•</span> {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-[13px] font-bold text-slate-900">Recommended Next Campaign</span>
                      <p className="text-[14px] text-slate-700 leading-relaxed font-medium">{autopsy.recommendedNextCampaign}</p>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-12 border border-slate-200 rounded-xl bg-slate-50 text-center text-slate-500 font-medium">Autopsy report not available.</div>
            )}
          </div>
        )}

        {activeTab === 'Audience' && (
          <div className="p-12 border border-slate-200 rounded-xl bg-slate-50 text-center flex flex-col items-center justify-center gap-2">
             <h4 className="text-[15px] font-semibold text-slate-900">Audience Segment: {insights.persona || 'Beauty Loyalists'}</h4>
             <p className="text-[14px] text-slate-500">Breakdown unavailable for this specific campaign sandbox.</p>
          </div>
        )}

      </div>

    </div>
  );
}
