'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';
import { Megaphone, Search, Filter, MoreHoriz, CheckCircle, WarningTriangle, FastArrowRight, Trash } from 'iconoir-react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';

export default function AllCampaigns() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [metrics, setMetrics] = useState({
    total: 0,
    active: 0,
    predictedRevenue: 0,
    avgConversion: 0
  });

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetchAPI<any[]>('/api/campaigns');
      setCampaigns(res);

      let active = 0;
      let totalRev = 0;
      let totalConv = 0;
      
      res.forEach(c => {
        if (c.status === 'active' || c.status === 'completed') active++;
        totalRev += Number(c.predicted_revenue || 0);
        totalConv += Number(c.conversion || 0);
      });

      setMetrics({
        total: res.length,
        active,
        predictedRevenue: totalRev,
        avgConversion: res.length ? totalConv / res.length : 0
      });

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete Campaign?\nThis action cannot be undone.')) return;
    try {
      await fetchAPI(`/api/campaigns/${id}`, { method: 'DELETE' });
      loadCampaigns();
    } catch(e) {
      alert('Failed to delete campaign');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="flex flex-col px-10 py-10 max-w-[1400px] w-full mx-auto gap-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-[28px] font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <Megaphone height={28} width={28} className="text-emerald-600" /> All Campaigns
            </h1>
            <p className="text-[15px] text-slate-500">Manage and monitor all your active and past marketing campaigns.</p>
          </div>
          <button onClick={() => router.push('/chat')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-[8px] font-bold text-[14px] shadow-sm transition-colors">
            + New Campaign
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white border border-gray-200 rounded-[12px] p-5 shadow-sm flex flex-col gap-2">
            <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Total Campaigns</span>
            <span className="text-[28px] font-mono font-bold text-slate-900">{metrics.total}</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-[12px] p-5 shadow-sm flex flex-col gap-2">
            <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Active Campaigns</span>
            <span className="text-[28px] font-mono font-bold text-emerald-600">{metrics.active}</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-[12px] p-5 shadow-sm flex flex-col gap-2">
            <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Predicted Revenue</span>
            <span className="text-[28px] font-mono font-bold text-slate-900">₹{metrics.predictedRevenue.toLocaleString('en-IN')}</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-[12px] p-5 shadow-sm flex flex-col gap-2">
            <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Avg Conversion</span>
            <span className="text-[28px] font-mono font-bold text-blue-600">{metrics.avgConversion.toFixed(1)}%</span>
          </div>
        </div>

        {/* Table List */}
        <div className="bg-white border border-gray-200 rounded-[12px] shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width={16} height={16} />
              <input type="text" placeholder="Search campaigns..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-[8px] text-[13px] w-[300px] outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
            </div>
            <button className="flex items-center gap-2 text-[13px] font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-[6px] hover:bg-slate-100 transition-colors">
              <Filter width={16} height={16} /> Filter
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-slate-50/50">
                  <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Campaign</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Audience</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Channel</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Predicted Rev</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actual Rev</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Conv.</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Created</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={9} className="py-10 text-center text-[14px] text-slate-500 font-medium">Loading campaigns...</td></tr>
                ) : campaigns.length === 0 ? (
                  <tr><td colSpan={9} className="py-10 text-center text-[14px] text-slate-500 font-medium">No campaigns found. Create one to get started!</td></tr>
                ) : (
                  campaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4 px-6 text-[14px] font-bold text-slate-900 max-w-[200px] truncate">{c.name}</td>
                      <td className="py-4 px-6">
                        <span className={clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider", 
                          c.status === 'active' ? "bg-emerald-100 text-emerald-700" : 
                          c.status === 'completed' ? "bg-blue-100 text-blue-700" :
                          c.status === 'draft' || c.status === 'review' ? "bg-slate-100 text-slate-700" :
                          "bg-orange-100 text-orange-700"
                        )}>
                          {c.status === 'active' && <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse" />}
                          {c.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-[13px] font-medium text-slate-600">{c.persona}</td>
                      <td className="py-4 px-6 text-[13px] font-medium text-slate-600">{c.channel || '-'}</td>
                      <td className="py-4 px-6 text-[13px] font-mono font-semibold text-slate-900 text-right">₹{c.predicted_revenue.toLocaleString('en-IN')}</td>
                      <td className="py-4 px-6 text-[13px] font-mono font-bold text-emerald-600 text-right">₹{c.actual_revenue.toLocaleString('en-IN')}</td>
                      <td className="py-4 px-6 text-[13px] font-mono font-semibold text-slate-900 text-right">{c.conversion.toFixed(1)}%</td>
                      <td className="py-4 px-6 text-[12px] font-medium text-slate-400 text-center">{new Date(c.created_at).toLocaleDateString()}</td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/campaigns/${c.id}`} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-[4px] transition-colors">
                            <FastArrowRight width={16} height={16} />
                          </Link>
                          <button onClick={() => handleDelete(c.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-[4px] transition-colors">
                            <Trash width={16} height={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
