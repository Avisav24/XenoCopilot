'use client';

import { useQuery } from '@tanstack/react-query';
import { getCampaignInsights } from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

type Insights = {
  campaign_id: string;
  campaign_name: string;
  persona: string;
  channel: string;
  audience_count: number;
  funnel: {
    sent: number; delivered: number; opened: number;
    clicked: number; purchased: number; failed: number;
    delivery_rate: string; open_rate: string; click_rate: string; conversion_rate: string;
  };
  estimated_revenue: string;
  ai_summary: string;
};

function KpiCard({ label, value, sub, trend }: { label: string; value: string; sub?: string; trend?: 'up' | 'down' | 'neutral' }) {
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  const trendColor = trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-slate-400';
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <span className={`text-sm font-bold ${trendColor}`}>{trendIcon}</span>
      </div>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function InsightsPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const { data: insights, isLoading } = useQuery({
    queryKey: ['campaign-insights', id],
    queryFn: () => getCampaignInsights(id) as Promise<Insights>,
    refetchInterval: 5000, // keep updating during sim
  });

  if (isLoading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card p-6 h-32 skeleton" />
        ))}
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">No insights found.</p>
      </div>
    );
  }

  // Funnel chart data
  const funnelData = [
    { name: 'Sent', value: insights.funnel.sent },
    { name: 'Delivered', value: insights.funnel.delivered },
    { name: 'Opened', value: insights.funnel.opened },
    { name: 'Clicked', value: insights.funnel.clicked },
    { name: 'Purchased', value: insights.funnel.purchased },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">{insights.campaign_name}</h1>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
              {insights.persona}
            </span>
            <span className="font-medium bg-slate-100 px-2.5 py-0.5 rounded-md">
              {insights.channel === 'WhatsApp' ? '💬' : insights.channel === 'Email' ? '📧' : '📱'} {insights.channel}
            </span>
          </div>
        </div>
      </div>

      {/* ROW 1 — KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total Reached"
          value={insights.funnel.sent.toLocaleString()}
          sub={`of ${insights.audience_count} audience`}
          trend="neutral"
        />
        <KpiCard
          label="Open Rate"
          value={insights.funnel.open_rate}
          sub={`${insights.funnel.opened} opened`}
          trend={parseFloat(insights.funnel.open_rate) > 30 ? 'up' : 'neutral'}
        />
        <KpiCard
          label="Click Rate"
          value={insights.funnel.click_rate}
          sub={`${insights.funnel.clicked} clicked`}
          trend={parseFloat(insights.funnel.click_rate) > 10 ? 'up' : 'neutral'}
        />
        <KpiCard
          label="Est. Revenue"
          value={insights.estimated_revenue}
          sub={`${insights.funnel.purchased} purchases`}
          trend="up"
        />
      </div>

      {/* ROW 2 — Chart and AI Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Funnel Chart */}
        <div className="card p-6 col-span-2">
          <h2 className="font-semibold text-slate-700 mb-5">Campaign Funnel</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={funnelData} layout="vertical" barSize={20} margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} width={80} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar dataKey="value" fill="#4f46e5" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AI Insight Card */}
        <div className="card p-6 bg-indigo-50 border-none flex flex-col justify-center">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm text-indigo-600 text-xl">
              ✨
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mt-1.5">
                XenoCopilot Insight
              </p>
            </div>
          </div>
          <p className="text-slate-800 leading-relaxed font-medium">
            {insights.ai_summary}
          </p>
          <div className="mt-6 pt-4 border-t border-indigo-100/50">
            <div className="flex justify-between items-center text-xs text-indigo-600/70 font-semibold">
              <span>Delivery Status</span>
              <span>{insights.funnel.delivery_rate}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-indigo-600/70 font-semibold mt-1">
              <span>Conversion Rate</span>
              <span>{insights.funnel.conversion_rate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
