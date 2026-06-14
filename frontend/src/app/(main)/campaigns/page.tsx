'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';
import { Search, Filter, FastArrowRight, Trash } from 'iconoir-react';
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
    <div className="flex flex-col w-full min-h-screen bg-canvas pb-20">
      
      {/* HEADER */}
      <div className="px-6 py-6 border-b border-hairline flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[24px] font-[700] text-ink leading-tight">All Campaigns</h1>
          <p className="text-[14px] text-ink-muted">Manage and monitor all active and past marketing campaigns.</p>
        </div>
        <button onClick={() => router.push('/chat')} className="btn-primary">
          New Campaign
        </button>
      </div>

      <div className="p-6 flex flex-col gap-8 max-w-[1400px]">
        
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card !p-4 flex flex-col gap-1">
            <span className="text-[12px] font-[600] text-ink-muted uppercase tracking-wider">Total Campaigns</span>
            <span className="text-[20px] font-mono-numbers font-[600] text-ink">{metrics.total}</span>
          </div>
          <div className="card !p-4 flex flex-col gap-1">
            <span className="text-[12px] font-[600] text-ink-muted uppercase tracking-wider">Active Campaigns</span>
            <span className="text-[20px] font-mono-numbers font-[600] text-ink">{metrics.active}</span>
          </div>
          <div className="card !p-4 flex flex-col gap-1">
            <span className="text-[12px] font-[600] text-ink-muted uppercase tracking-wider">Predicted Revenue</span>
            <span className="text-[20px] font-mono-numbers font-[600] text-green-600">₹{metrics.predictedRevenue.toLocaleString('en-IN')}</span>
          </div>
          <div className="card !p-4 flex flex-col gap-1">
            <span className="text-[12px] font-[600] text-ink-muted uppercase tracking-wider">Avg Conversion</span>
            <span className="text-[20px] font-mono-numbers font-[600] text-ink">{metrics.avgConversion.toFixed(1)}%</span>
          </div>
        </div>

        {/* Table List */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" width={16} height={16} />
              <input type="text" placeholder="Search campaigns..." className="pl-9 pr-4 py-2 bg-white border border-hairline rounded-[6px] text-[13px] w-full md:w-[300px] outline-none focus:border-ink transition-all" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select className="bg-white border border-hairline rounded-[6px] text-[13px] px-3 py-2 outline-none focus:border-ink flex-1 md:flex-none">
                <option>All Statuses</option>
                <option>Active</option>
                <option>Completed</option>
                <option>Draft</option>
              </select>
              <select className="bg-white border border-hairline rounded-[6px] text-[13px] px-3 py-2 outline-none focus:border-ink flex-1 md:flex-none">
                <option>All Channels</option>
                <option>WhatsApp</option>
                <option>Email</option>
                <option>SMS</option>
              </select>
              <button className="btn-secondary !px-3 w-full md:w-auto mt-2 md:mt-0">
                <Filter width={14} height={14} /> Filter
              </button>
            </div>
          </div>
          
          <div className="table-container">
            <table className="table-enterprise">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Status</th>
                  <th>Audience</th>
                  <th>Channel</th>
                  <th className="text-right">Predicted Rev</th>
                  <th className="text-right">Actual Rev</th>
                  <th className="text-right">Conv.</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {loading ? (
                  <tr><td colSpan={9} className="py-10 text-center text-[14px] text-ink-muted font-medium">Loading campaigns...</td></tr>
                ) : campaigns.length === 0 ? (
                  <tr><td colSpan={9} className="py-10 text-center text-[14px] text-ink-muted font-medium">No campaigns found. Create one to get started!</td></tr>
                ) : (
                  campaigns.map((c) => (
                    <tr key={c.id} className="group cursor-pointer" onClick={() => router.push(`/campaigns/${c.id}`)}>
                      <td className="font-[600] text-ink max-w-[200px] truncate">{c.name}</td>
                      <td>
                        <span className="inline-flex items-center gap-1.5 text-[13px] font-[500] text-ink capitalize">
                          <span className={clsx("w-1.5 h-1.5 rounded-full", 
                            c.status === 'active' ? "bg-green-500" : 
                            c.status === 'completed' ? "bg-blue-500" :
                            c.status === 'draft' || c.status === 'review' ? "bg-slate-400" :
                            "bg-orange-500"
                          )} />
                          {c.status}
                        </span>
                      </td>
                      <td className="text-ink-muted truncate max-w-[150px]">{c.persona}</td>
                      <td className="text-ink-muted">{c.channel || '-'}</td>
                      <td className="font-mono-numbers font-[500] text-ink text-right">₹{c.predicted_revenue.toLocaleString('en-IN')}</td>
                      <td className="font-mono-numbers font-[600] text-green-600 text-right">₹{c.actual_revenue.toLocaleString('en-IN')}</td>
                      <td className="font-mono-numbers font-[500] text-ink text-right">{c.conversion.toFixed(1)}%</td>
                      <td className="text-[13px] text-ink-muted">{new Date(c.created_at).toLocaleDateString()}</td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => handleDelete(c.id)} className="p-1.5 text-ink-muted hover:text-red-600 transition-colors">
                            <Trash width={14} height={14} />
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
