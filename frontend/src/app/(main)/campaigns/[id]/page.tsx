'use client';

import React, { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';
import useSWR from 'swr';
import { Megaphone, ArrowLeft, Send, CheckCircle, Eye, HandCard, ShoppingCart, RefreshDouble, Spark } from 'iconoir-react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import Link from 'next/link';

const fetcher = (url: string) => fetchAPI(url);

export default function CampaignDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  
  // Real-time polling via SWR every 5 seconds
  const { data: campaign, error: cError } = useSWR<any>(`/api/campaigns/${params.id}`, fetcher, { refreshInterval: 5000 });
  const { data: insights, error: iError } = useSWR<any>(`/api/campaigns/${params.id}/insights`, fetcher, { refreshInterval: 5000 });
  
  const [learning, setLearning] = useState<any>(null);

  useEffect(() => {
    if (campaign?.status === 'completed' && !learning) {
      // Auto-generate learning when completed (could also be done automatically by backend, but we trigger it here)
      fetchAPI(`/api/campaigns/${params.id}/learn`, { method: 'POST' }).then(setLearning).catch(() => {});
    }
  }, [campaign?.status, learning, params.id]);

  if (!campaign && !cError) {
    return <div className="flex h-screen items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div></div>;
  }

  if (cError) {
    return <div className="p-10 text-red-500">Error loading campaign details.</div>;
  }

  const funnel = insights?.funnel || { sent: 0, delivered: 0, opened: 0, clicked: 0, purchased: 0 };
  const audienceTotal = campaign.audience_size || funnel.sent || 1;

  const getFunnelWidth = (value: number) => {
    if (audienceTotal === 0) return '0%';
    return `${Math.min(100, Math.max(2, (value / audienceTotal) * 100))}%`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="flex flex-col px-10 py-10 max-w-[1200px] w-full mx-auto gap-8 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/campaigns" className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <ArrowLeft width={20} height={20} />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-[24px] font-bold text-slate-900 tracking-tight">{campaign.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={clsx("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", 
                campaign.status === 'active' ? "bg-emerald-100 text-emerald-700" : 
                campaign.status === 'completed' ? "bg-blue-100 text-blue-700" :
                "bg-slate-200 text-slate-700"
              )}>
                {campaign.status === 'active' && <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse" />}
                {campaign.status}
              </span>
              <span className="text-[12px] text-slate-500 font-medium">Started: {campaign.launched_at ? new Date(campaign.launched_at).toLocaleString() : 'Not launched'}</span>
            </div>
          </div>
          
          {campaign.status === 'review' && (
            <div className="ml-auto">
              <button onClick={async () => {
                await fetchAPI(`/api/campaigns/${campaign.id}/launch`, { method: 'POST' });
                // Revalidate SWR automatically via interval
              }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-[8px] font-bold text-[14px] transition-colors flex items-center gap-2">
                <Megaphone width={18} height={18}/> Launch Now
              </button>
            </div>
          )}
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white border border-gray-200 rounded-[12px] p-5 shadow-sm flex flex-col gap-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Audience</span>
            <span className="text-[16px] font-bold text-slate-900">{campaign.audience_type} ({audienceTotal})</span>
            <span className="text-[12px] text-slate-500 mt-2">Channel: <span className="font-semibold text-slate-700">{campaign.channel}</span></span>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-[12px] p-5 shadow-sm flex flex-col gap-1 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-16 h-16 bg-slate-50 rounded-bl-[100px] -z-0"></div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider z-10">Predicted Revenue</span>
            <span className="text-[24px] font-mono font-bold text-slate-400 z-10">₹{Number(campaign.predicted_revenue || 0).toLocaleString('en-IN')}</span>
          </div>

          <div className="bg-white border border-emerald-200 rounded-[12px] p-5 shadow-sm flex flex-col gap-1 relative overflow-hidden bg-emerald-50/20">
            <div className="absolute right-0 top-0 w-16 h-16 bg-emerald-100 rounded-bl-[100px] -z-0"></div>
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider z-10 flex items-center gap-1">Actual Revenue {campaign.status === 'active' && <RefreshDouble width={12} height={12} className="animate-spin" />}</span>
            <span className="text-[24px] font-mono font-bold text-emerald-700 z-10">₹{Number(campaign.actual_revenue || 0).toLocaleString('en-IN')}</span>
          </div>

          <div className="bg-white border border-gray-200 rounded-[12px] p-5 shadow-sm flex flex-col gap-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">Conversion</span>
            <div className="flex items-end gap-3 mt-1">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase">Predicted</span>
                <span className="text-[16px] font-mono font-bold text-slate-400">{Number(campaign.predicted_conversion || 0).toFixed(1)}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-emerald-600 uppercase">Actual</span>
                <span className="text-[20px] font-mono font-bold text-slate-900">{Number(campaign.actual_conversion || 0).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Funnel */}
          <div className="col-span-2 bg-white border border-gray-200 rounded-[12px] p-8 shadow-sm flex flex-col gap-6">
            <h3 className="text-[14px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-4">
              <RefreshDouble width={18} height={18} className="text-blue-500" /> Real-time Delivery Funnel
            </h3>
            
            <div className="flex flex-col gap-5">
              <FunnelRow icon={<Send />} label="Sent" value={funnel.sent} total={audienceTotal} color="bg-slate-800" />
              <FunnelRow icon={<CheckCircle />} label="Delivered" value={funnel.delivered} total={audienceTotal} color="bg-blue-500" />
              <FunnelRow icon={<Eye />} label="Read / Opened" value={funnel.opened} total={audienceTotal} color="bg-purple-500" />
              <FunnelRow icon={<HandCard />} label="Clicked CTA" value={funnel.clicked} total={audienceTotal} color="bg-orange-500" />
              <FunnelRow icon={<ShoppingCart />} label="Purchased" value={funnel.purchased} total={audienceTotal} color="bg-emerald-500" />
            </div>
          </div>

          {/* AI Learning / History */}
          <div className="col-span-1 flex flex-col gap-6">
            {campaign.status === 'completed' && learning ? (
               <div className="bg-emerald-50 border border-emerald-200 rounded-[12px] p-6 shadow-sm flex flex-col gap-4 animate-in slide-in-from-right-8 duration-500">
                 <h3 className="text-[13px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                   <Spark width={16} height={16} className="text-emerald-600" /> Post-Campaign Learning
                 </h3>
                 <p className="text-[14px] text-emerald-900 leading-relaxed font-medium">
                   {learning.learning}
                 </p>
                 <div className="text-[11px] text-emerald-600 font-semibold bg-emerald-100 px-3 py-1.5 rounded-[4px] self-start mt-2">
                   Stored in RevenueMemory
                 </div>
               </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-[12px] p-6 flex flex-col items-center justify-center text-center h-full min-h-[200px] gap-3">
                 <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                   <Spark width={20} height={20} />
                 </div>
                 <span className="text-[13px] font-bold text-slate-500">Awaiting Completion</span>
                 <p className="text-[12px] text-slate-400 leading-relaxed px-4">Post-campaign insights will be generated automatically once the simulation finishes.</p>
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
    <div className="flex items-center gap-4 group">
      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
        {React.cloneElement(icon as React.ReactElement, { width: 14, height: 14 })}
      </div>
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-[12px] font-bold text-slate-700">
          <span className="uppercase tracking-wider">{label}</span>
          <span className="font-mono">{value.toLocaleString()} <span className="text-slate-400 font-normal ml-1">({percentage.toFixed(1)}%)</span></span>
        </div>
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className={clsx("h-full rounded-full transition-all duration-1000 ease-out", color)} style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
    </div>
  );
}
