'use client';

import React, { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';
import useSWR from 'swr';
import { Megaphone, ArrowLeft, Send, CheckCircle, Eye, HandCard, ShoppingBag, Spark } from 'iconoir-react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

const fetcher = (url: string) => fetchAPI(url);

export default function CampaignDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  
  const { data: campaign, error: cError } = useSWR<any>(`/api/campaigns/${params.id}`, fetcher, { refreshInterval: 5000 });
  const { data: insights, error: iError } = useSWR<any>(`/api/campaigns/${params.id}/insights`, fetcher, { refreshInterval: 5000 });
  
  const [learning, setLearning] = useState<any>(null);

  useEffect(() => {
    if (campaign?.status === 'completed' && !learning) {
      fetchAPI(`/api/campaigns/${params.id}/learn`, { method: 'POST', body: '{}' }).then(setLearning).catch(() => {});
    }
  }, [campaign?.status, learning, params.id]);

  if (!campaign && !cError) {
    return <div className="flex h-screen items-center justify-center text-[14px] text-gray-500">Loading campaign...</div>;
  }

  if (cError) {
    return <div className="p-10 text-red-500 text-[14px]">Error loading campaign details.</div>;
  }

  const funnel = insights?.funnel || { sent: 0, delivered: 0, opened: 0, clicked: 0, purchased: 0 };
  const audienceTotal = campaign.audience_size || funnel.sent || 1;

  const timelineEvents = [
    { label: 'Campaign Created', date: new Date(campaign.created_at).toLocaleString(), status: 'done' },
    { label: 'Audience Segmented', date: new Date(campaign.created_at).toLocaleString(), status: 'done' },
    { label: 'Launched', date: campaign.launched_at ? new Date(campaign.launched_at).toLocaleString() : 'Pending', status: campaign.launched_at ? 'done' : 'pending' },
    { label: 'Delivery Completed', date: campaign.status === 'completed' ? new Date().toLocaleString() : 'Pending', status: campaign.status === 'completed' ? 'done' : 'pending' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa] pb-20 font-sans">
      
      {/* Header */}
      <div className="px-8 py-8 border-b border-[#E5E7EB] bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/campaigns')} className="text-gray-400 hover:text-gray-900 transition-colors flex items-center justify-center p-1">
            <ArrowLeft width={18} height={18} />
          </button>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-[22px] font-[600] text-gray-900 tracking-tight leading-none">{campaign.name}</h1>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-[600] text-gray-600 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded-sm">
                <span className={clsx("w-1.5 h-1.5 rounded-full", 
                  campaign.status === 'active' ? "bg-emerald-500 animate-pulse" : 
                  campaign.status === 'completed' ? "bg-blue-500" :
                  "bg-gray-400"
                )} />
                {campaign.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-[12px] text-gray-500 font-[500]">
              <span className="flex items-center gap-1"><span className="text-gray-400">Channel:</span> {campaign.channel}</span>
              <span className="flex items-center gap-1"><span className="text-gray-400">Launched:</span> {campaign.launched_at ? new Date(campaign.launched_at).toLocaleString() : 'Pending'}</span>
            </div>
          </div>
        </div>
        
        {campaign.status === 'review' && (
          <button onClick={async () => {
            await fetchAPI(`/api/campaigns/${campaign.id}/launch`, { method: 'POST', body: '{}' });
          }} className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-md text-[13px] font-[600] flex items-center gap-2 transition-colors shadow-sm">
            <Megaphone width={16} height={16}/> Launch Campaign
          </button>
        )}
      </div>

      <div className="p-8 flex flex-col gap-10 max-w-[1200px] mx-auto w-full">
        
        {/* Metrics Row */}
        <div className="flex flex-col md:flex-row bg-white border border-[#E5E7EB] rounded-[8px] overflow-hidden shadow-sm">
          <div className="flex-1 p-6 flex flex-col gap-1.5 border-b md:border-b-0 md:border-r border-[#E5E7EB]">
            <span className="text-[11px] font-[600] text-gray-500 uppercase tracking-widest">Audience</span>
            <div className="flex items-baseline gap-2">
              <span className="text-[20px] font-[600] text-gray-900 tracking-tight">{campaign.audience_type}</span>
              <span className="text-[13px] text-gray-400 font-[500]">({audienceTotal})</span>
            </div>
          </div>
          <div className="flex-1 p-6 flex flex-col gap-1.5 border-b md:border-b-0 md:border-r border-[#E5E7EB]">
            <span className="text-[11px] font-[600] text-gray-500 uppercase tracking-widest">Predicted Rev</span>
            <span className="text-[20px] font-[600] text-gray-900 tracking-tight font-mono">₹{Number(campaign.predicted_revenue || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex-1 p-6 flex flex-col gap-1.5 border-b md:border-b-0 md:border-r border-[#E5E7EB] relative overflow-hidden bg-[#f0fdf4]/30">
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-500" />
            <span className="text-[11px] font-[600] text-emerald-600 uppercase tracking-widest">Actual Rev</span>
            <span className="text-[20px] font-[600] text-emerald-600 tracking-tight font-mono">₹{Number(campaign.actual_revenue || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex-1 p-6 flex flex-col gap-1.5 border-b md:border-b-0 md:border-r border-[#E5E7EB]">
            <span className="text-[11px] font-[600] text-gray-500 uppercase tracking-widest">Conversion</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[20px] font-[600] text-gray-900 tracking-tight font-mono">{Number(campaign.actual_conversion || 0).toFixed(1)}%</span>
              <span className="text-[13px] text-gray-400 font-[500] font-mono">/ {Number(campaign.predicted_conversion || 0).toFixed(1)}%</span>
            </div>
          </div>
          <div className="flex-1 p-6 flex flex-col gap-1.5">
            <span className="text-[11px] font-[600] text-gray-500 uppercase tracking-widest">Purchasers</span>
            <span className="text-[20px] font-[600] text-gray-900 tracking-tight font-mono">{funnel.purchased.toLocaleString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Funnel */}
          <div className="col-span-2 flex flex-col gap-4">
            <h2 className="text-[14px] font-[600] text-gray-900 tracking-tight">Delivery Funnel</h2>
            <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-8 flex flex-col gap-6 relative shadow-sm">
              {campaign.status !== 'completed' && campaign.status !== 'draft' && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-[8px]">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin text-gray-900 mb-3">
                    <line x1="12" y1="2" x2="12" y2="6"></line>
                    <line x1="12" y1="18" x2="12" y2="22"></line>
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                    <line x1="2" y1="12" x2="6" y2="12"></line>
                    <line x1="18" y1="12" x2="22" y2="12"></line>
                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                  </svg>
                  <span className="text-[14px] font-[600] text-gray-900">Simulating Delivery...</span>
                  <span className="text-[12px] text-gray-500 mt-1">Real-time stats updating</span>
                </div>
              )}
              <FunnelRow icon={<Send />} label="Sent" value={funnel.sent} total={audienceTotal} color="bg-gray-900" />
              <FunnelRow icon={<CheckCircle />} label="Delivered" value={funnel.delivered} total={audienceTotal} color="bg-blue-600" />
              <FunnelRow icon={<Eye />} label="Read / Opened" value={funnel.opened} total={audienceTotal} color="bg-purple-600" />
              <FunnelRow icon={<HandCard />} label="Clicked CTA" value={funnel.clicked} total={audienceTotal} color="bg-gray-400" />
              <FunnelRow icon={<ShoppingBag />} label="Purchased" value={funnel.purchased} total={audienceTotal} color="bg-emerald-500" />
            </div>
          </div>

          {/* Timeline & Learnings */}
          <div className="col-span-1 flex flex-col gap-4">
            <h2 className="text-[14px] font-[600] text-gray-900 tracking-tight">Timeline</h2>
            <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-8 shadow-sm h-full">
              <div className="flex flex-col gap-8 relative">
                <div className="absolute left-[5px] top-2 bottom-2 w-px bg-[#E5E7EB]" />
                {timelineEvents.map((evt, i) => (
                  <div key={i} className="flex gap-5 relative z-10 items-start">
                    <div className={clsx("w-3 h-3 rounded-full mt-1 border-[2px]", evt.status === 'done' ? "bg-white border-gray-900" : "bg-white border-gray-300")} />
                    <div className="flex flex-col gap-1 -mt-0.5">
                      <span className={clsx("text-[13px] font-[600] tracking-tight", evt.status === 'done' ? "text-gray-900" : "text-gray-400")}>{evt.label}</span>
                      <span className="text-[11px] font-[500] text-gray-400 uppercase tracking-widest">{evt.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Big Centered Operational Learnings */}
        <div className="w-full flex flex-col items-center mt-8 mb-12">
          
          <div className="bg-white border border-[#E5E7EB] rounded-[8px] flex flex-col w-full max-w-[800px] shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-8 py-5 border-b border-[#E5E7EB] flex flex-col gap-1 bg-white">
               <h2 className="text-[14px] font-[600] text-gray-900 tracking-tight">Operational Learnings</h2>
               <span className="text-[12px] text-gray-500 font-[500]">Prediction vs Actual</span>
            </div>

            {campaign.status === 'completed' && learning ? (
              <>
                {/* Stats Row */}
                <div className="grid grid-cols-3 divide-x divide-[#E5E7EB] border-b border-[#E5E7EB] bg-white">
                  <div className="flex flex-col gap-1.5 p-8">
                    <span className="text-[11px] font-[600] text-gray-500 uppercase tracking-widest">Revenue Generated</span>
                    <span className="text-[20px] font-[600] text-gray-900 font-mono tracking-tight">₹{Number(campaign.actual_revenue || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 p-8">
                    <span className="text-[11px] font-[600] text-gray-500 uppercase tracking-widest">Prediction Accuracy</span>
                    <span className="text-[20px] font-[600] text-gray-900 font-mono tracking-tight">
                      {(() => {
                        const actual = Number(campaign.actual_revenue || 0);
                        const predicted = Number(campaign.predicted_revenue || 0);
                        if (actual === 0 && predicted === 0) return '100%';
                        if (predicted === 0 || actual === 0) return '0%';
                        return (Math.min(actual, predicted) / Math.max(actual, predicted) * 100).toFixed(1).replace('.0', '') + '%';
                      })()}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5 p-8">
                    <span className="text-[11px] font-[600] text-gray-500 uppercase tracking-widest">Variance</span>
                    <span className="text-[20px] font-[600] text-gray-900 font-mono tracking-tight">{Number(insights?.performance_pct || 0) > 0 ? '+' : ''}{insights?.performance_pct || '0'}%</span>
                  </div>
                </div>

                {/* Key Learnings List */}
                <div className="p-8 flex flex-col gap-5 bg-white">
                  <span className="text-[12px] font-[600] text-gray-900 uppercase tracking-widest">Key Learnings</span>
                  <ul className="flex flex-col gap-4">
                    {(() => {
                       let bulletPoints: string[] = [];
                       
                       if (learning && learning.learning) {
                         const parts = learning.learning.split('). ');
                         if (parts.length > 1) {
                           bulletPoints.push(parts[1].trim());
                         }
                       }
                       if (insights?.ai_summary && !insights.ai_summary.includes('analyzed')) {
                         const aiBullets = insights.ai_summary.split(/(?<=\.)\s+/).filter((s: string) => s.length > 10);
                         bulletPoints = [...bulletPoints, ...aiBullets];
                       }
                       
                       if (bulletPoints.length === 0) {
                          bulletPoints = ["Campaign reached target audience efficiently."];
                       }

                       return bulletPoints.map((bp, i) => (
                         <li key={i} className="flex items-start gap-3 text-[14px] text-gray-700 leading-relaxed font-[400]">
                           <span className="text-gray-400 font-bold mt-[2px] text-[12px]">✓</span>
                           <span>{bp.replace(/^[✓\-•]\s*/, '')}</span>
                         </li>
                       ));
                    })()}
                  </ul>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 gap-5 w-full bg-white">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin text-gray-400">
                  <line x1="12" y1="2" x2="12" y2="6"></line>
                  <line x1="12" y1="18" x2="12" y2="22"></line>
                  <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                  <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                  <line x1="2" y1="12" x2="6" y2="12"></line>
                  <line x1="18" y1="12" x2="22" y2="12"></line>
                  <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                  <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                </svg>
                <div className="flex flex-col gap-1.5 items-center">
                  <span className="text-[14px] font-[600] text-gray-900 tracking-tight">Analyzing performance...</span>
                  <span className="text-[13px] text-gray-500">Insights will appear here once the campaign finishes.</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function FunnelRow({ icon, label, value, total, color }: { icon: React.ReactNode, label: string, value: number, total: number, color: string }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  return (
    <div className="flex items-center gap-5">
      <div className="w-5 h-5 flex items-center justify-center text-gray-400">
        {React.cloneElement(icon as React.ReactElement, { width: 14, height: 14, strokeWidth: 2 })}
      </div>
      <div className="flex-1 flex flex-col gap-2.5">
        <div className="flex justify-between items-center text-[11px] font-[600] text-gray-900 uppercase tracking-widest">
          <span>{label}</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[13px] tracking-tight">{value.toLocaleString()}</span>
            <span className="text-gray-400 font-sans font-[500]">({percentage.toFixed(1)}%)</span>
          </div>
        </div>
        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
          <div className={clsx("h-full rounded-full transition-all duration-1000 ease-out", color)} style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
    </div>
  );
}
