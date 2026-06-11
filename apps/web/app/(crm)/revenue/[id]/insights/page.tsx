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
  const trendColor = trend === 'up' ? 'text-semantic-up' : trend === 'down' ? 'text-semantic-down' : 'text-muted';
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-2">
        <p className="text-[13px] font-semibold text-muted">{label}</p>
      </div>
      <p className="text-[28px] font-mono-numbers text-ink leading-none">{value}</p>
      {sub && <p className="text-[13px] text-muted mt-2">{sub}</p>}
    </div>
  );
}

export default function InsightsPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const { data: insights, isLoading } = useQuery({
    queryKey: ['campaign-insights', id],
    queryFn: () => getCampaignInsights(id) as Promise<Insights>,
    refetchInterval: 5000,
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
        <p className="text-body">No insights found.</p>
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
      <div className="flex items-start justify-between mb-8 border-b border-hairline pb-8">
        <div>
          <h1 className="text-[32px] font-display font-normal text-ink mb-3">{insights.campaign_name}</h1>
          <div className="flex items-center gap-3 text-[14px]">
            <span className="font-semibold text-ink bg-surface-strong px-3 py-1 rounded">
              {insights.persona}
            </span>
            <span className="font-medium text-ink bg-surface-strong px-3 py-1 rounded">
              {insights.channel}
            </span>
          </div>
        </div>
      </div>

      {/* ROW 1 — KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Funnel Chart */}
        <div className="card p-8 col-span-2">
          <h2 className="text-[18px] font-semibold text-ink mb-6">Campaign Funnel</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={funnelData} layout="vertical" barSize={24} margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eef0f3" />
              <XAxis type="number" tick={{ fontSize: 13, fill: '#7c828a' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 13, fill: '#5b616e' }} width={80} />
              <Tooltip
                contentStyle={{ fontSize: 14, borderRadius: 8, border: '1px solid #dee1e6', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)' }}
                cursor={{ fill: '#f7f7f7' }}
              />
              <Bar dataKey="value" fill="#0052ff" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AI Insight Card */}
        <div className="card p-8 border-l-4 border-l-primary flex flex-col justify-center">
          <div className="flex items-start gap-3 mb-4">
            <div>
              <p className="text-[13px] font-bold text-primary uppercase tracking-wider">
                XenoCopilot Insight
              </p>
            </div>
          </div>
          <p className="text-ink text-[16px] leading-[1.5] mb-6">
            {insights.ai_summary}
          </p>
          <div className="mt-auto pt-6 border-t border-hairline">
            <div className="flex justify-between items-center text-[13px] font-semibold text-muted">
              <span>Delivery Status</span>
              <span className="text-ink">{insights.funnel.delivery_rate}</span>
            </div>
            <div className="flex justify-between items-center text-[13px] font-semibold text-muted mt-2">
              <span>Conversion Rate</span>
              <span className="text-ink">{insights.funnel.conversion_rate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
