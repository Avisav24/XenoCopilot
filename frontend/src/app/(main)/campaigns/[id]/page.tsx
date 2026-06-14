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
    return <div className="flex h-screen items-center justify-center text-[14px] text-ink-muted">Loading campaign...</div>;
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
    <div className="flex flex-col min-h-screen bg-canvas pb-20">
      
      {/* Header */}
      <div className="px-6 py-6 border-b border-hairline flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/campaigns')} className="text-ink-muted hover:text-ink transition-colors">
            <ArrowLeft width={20} height={20} />
          </button>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-[24px] font-[700] text-ink leading-tight">{campaign.name}</h1>
              <span className="inline-flex items-center gap-1.5 text-[13px] font-[500] text-ink capitalize">
                <span className={clsx("w-2 h-2 rounded-full", 
                  campaign.status === 'active' ? "bg-green-500 animate-pulse" : 
                  campaign.status === 'completed' ? "bg-blue-500" :
                  "bg-slate-400"
                )} />
                {campaign.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-[13px] text-ink-muted font-medium">
              <span>Channel: {campaign.channel}</span>
              <span>Launched: {campaign.launched_at ? new Date(campaign.launched_at).toLocaleString() : 'Not launched'}</span>
            </div>
          </div>
        </div>
        
        {campaign.status === 'review' && (
          <button onClick={async () => {
            await fetchAPI(`/api/campaigns/${campaign.id}/launch`, { method: 'POST', body: '{}' });
          }} className="btn-primary">
            <Megaphone width={16} height={16}/> Launch Campaign
          </button>
        )}
      </div>

      <div className="p-6 flex flex-col gap-8 max-w-[1400px]">
        
        {/* Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="card !p-4 flex flex-col gap-1">
            <span className="text-[12px] font-[600] text-ink-muted uppercase tracking-wider">Audience</span>
            <span className="text-[20px] font-[600] text-ink">{campaign.audience_type} <span className="text-[14px] text-ink-muted">({audienceTotal})</span></span>
          </div>
          <div className="card !p-4 flex flex-col gap-1">
            <span className="text-[12px] font-[600] text-ink-muted uppercase tracking-wider">Predicted Rev</span>
            <span className="text-[20px] font-mono-numbers font-[600] text-ink">₹{Number(campaign.predicted_revenue || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="card !p-4 flex flex-col gap-1 border-l-2 border-l-green-500">
            <span className="text-[12px] font-[600] text-green-600 uppercase tracking-wider">Actual Rev</span>
            <span className="text-[20px] font-mono-numbers font-[600] text-green-600">₹{Number(campaign.actual_revenue || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="card !p-4 flex flex-col gap-1">
            <span className="text-[12px] font-[600] text-ink-muted uppercase tracking-wider">Conversion</span>
            <div className="flex items-end gap-2">
              <span className="text-[20px] font-mono-numbers font-[600] text-ink">{Number(campaign.actual_conversion || 0).toFixed(1)}%</span>
              <span className="text-[13px] text-ink-muted mb-1">/ {Number(campaign.predicted_conversion || 0).toFixed(1)}%</span>
            </div>
          </div>
          <div className="card !p-4 flex flex-col gap-1">
            <span className="text-[12px] font-[600] text-ink-muted uppercase tracking-wider">Purchasers</span>
            <span className="text-[20px] font-mono-numbers font-[600] text-ink">{funnel.purchased.toLocaleString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Funnel */}
          <div className="col-span-2 flex flex-col gap-4">
            <h2 className="text-[18px] font-[600] text-ink">Delivery Funnel</h2>
            <div className="card !p-6 flex flex-col gap-5">
              <FunnelRow icon={<Send />} label="Sent" value={funnel.sent} total={audienceTotal} color="bg-ink" />
              <FunnelRow icon={<CheckCircle />} label="Delivered" value={funnel.delivered} total={audienceTotal} color="bg-blue-500" />
              <FunnelRow icon={<Eye />} label="Read / Opened" value={funnel.opened} total={audienceTotal} color="bg-purple-500" />
              <FunnelRow icon={<HandCard />} label="Clicked CTA" value={funnel.clicked} total={audienceTotal} color="bg-orange-500" />
              <FunnelRow icon={<ShoppingBag />} label="Purchased" value={funnel.purchased} total={audienceTotal} color="bg-green-500" />
            </div>
          </div>

          {/* Timeline & Learnings */}
          <div className="col-span-1 flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h2 className="text-[18px] font-[600] text-ink">Timeline</h2>
              <div className="card !p-6">
                <div className="flex flex-col gap-6 relative">
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-hairline" />
                  {timelineEvents.map((evt, i) => (
                    <div key={i} className="flex gap-4 relative z-10">
                      <div className={clsx("w-3.5 h-3.5 rounded-full mt-1 border-2", evt.status === 'done' ? "bg-canvas border-ink" : "bg-canvas border-hairline")} />
                      <div className="flex flex-col">
                        <span className={clsx("text-[14px] font-[600]", evt.status === 'done' ? "text-ink" : "text-ink-muted")}>{evt.label}</span>
                        <span className="text-[12px] text-ink-muted">{evt.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="text-[18px] font-[600] text-ink flex items-center gap-2">
                <Spark height={18} width={18} className={campaign.status === 'completed' && learning ? "text-ink" : "text-ink-muted"} /> Operational Learnings
              </h2>
              <div className="card !p-0 overflow-hidden">
                {campaign.status === 'completed' && learning ? (
                  <table className="table-enterprise !m-0">
                    <tbody className="divide-y divide-hairline">
                      <tr>
                        <th className="w-[120px] !text-[12px] whitespace-nowrap bg-canvas-soft border-r border-hairline align-top">Prediction</th>
                        <td className="!text-[13px] leading-relaxed whitespace-pre-wrap p-4">{learning.learning.split('.')[0]}.</td>
                      </tr>
                      <tr>
                        <th className="!text-[12px] whitespace-nowrap bg-canvas-soft border-r border-hairline align-top">Actual Output</th>
                        <td className="!text-[13px] leading-relaxed p-4">₹{Number(campaign.actual_revenue || 0).toLocaleString('en-IN')} revenue generated</td>
                      </tr>
                      <tr>
                        <th className="!text-[12px] whitespace-nowrap bg-canvas-soft border-r border-hairline align-top">Key Insight</th>
                        <td className="!text-[13px] font-[500] leading-relaxed whitespace-pre-wrap p-4">{learning.learning.substring(learning.learning.indexOf('.') + 1).trim() || 'No additional insights.'}</td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 gap-4 text-center h-[200px]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin text-ink-muted">
                      <line x1="12" y1="2" x2="12" y2="6"></line>
                      <line x1="12" y1="18" x2="12" y2="22"></line>
                      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                      <line x1="2" y1="12" x2="6" y2="12"></line>
                      <line x1="18" y1="12" x2="22" y2="12"></line>
                      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                    </svg>
                    <div className="flex flex-col gap-1">
                      <span className="text-[13px] font-[600] text-ink">Analyzing performance...</span>
                      <span className="text-[12px] text-ink-muted">Insights will appear here once the campaign finishes.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function FunnelRow({ icon, label, value, total, color }: { icon: React.ReactNode, label: string, value: number, total: number, color: string }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  return (
    <div className="flex items-center gap-4">
      <div className="w-8 h-8 rounded-[6px] bg-canvas-soft border border-hairline flex items-center justify-center text-ink-muted">
        {React.cloneElement(icon as React.ReactElement, { width: 14, height: 14 })}
      </div>
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-[12px] font-[600] text-ink">
          <span className="uppercase tracking-wider">{label}</span>
          <span className="font-mono-numbers">{value.toLocaleString()} <span className="text-ink-muted font-normal ml-1">({percentage.toFixed(1)}%)</span></span>
        </div>
        <div className="h-2 w-full bg-canvas-soft border border-hairline rounded-full overflow-hidden">
          <div className={clsx("h-full rounded-full transition-all duration-1000 ease-out", color)} style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
    </div>
  );
}
