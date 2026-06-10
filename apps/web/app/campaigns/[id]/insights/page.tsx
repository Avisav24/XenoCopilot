'use client';

import { useQuery } from '@tanstack/react-query';
import { getCampaign, getCampaignInsights, getCampaignMessages } from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import Link from 'next/link';
import { useState } from 'react';

type Insights = {
  campaign_id: string;
  campaign_name: string;
  audience_count: number;
  funnel: {
    sent: number; delivered: number; opened: number;
    clicked: number; converted: number; failed: number;
    delivery_rate: string; open_rate: string; click_rate: string; conversion_rate: string;
  };
  by_channel: Array<{ channel: string; sent: number; delivered: number; opened: number; clicked: number; converted: number }>;
  by_persona: Array<{ persona_tag: string; sent: number; converted: number; conversion_rate: string }>;
  estimated_revenue: string;
  top_converting_channel: string;
  ai_summary: string;
};

type Campaign = { name: string; status: string; sent_at: string | null };
type Message = {
  id: string; channel: string; status: string; message_text: string;
  customer: { name: string; email: string | null };
  sent_at: string | null; converted_at: string | null; failed_reason: string | null;
};

const CHANNEL_COLORS: Record<string, string> = {
  email: '#60a5fa',
  whatsapp: '#34d399',
  sms: '#a78bfa',
};

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  sending: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
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

function downloadCSV(messages: Message[], campaignName: string) {
  const headers = ['id', 'channel', 'status', 'customer_name', 'customer_email', 'sent_at', 'converted_at', 'failed_reason'];
  const rows = messages.map((m) => [
    m.id, m.channel, m.status,
    m.customer.name, m.customer.email || '',
    m.sent_at || '', m.converted_at || '', m.failed_reason || '',
  ]);
  const csv = [headers, ...rows].map((row) => row.map((v) => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${campaignName.replace(/\s+/g, '_')}_report.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function InsightsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [sortField, setSortField] = useState<'sent' | 'converted' | 'conversion_rate'>('conversion_rate');

  const { data: campaign } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => getCampaign(id) as Promise<Campaign>,
  });

  const { data: insights, isLoading } = useQuery({
    queryKey: ['campaign-insights', id],
    queryFn: () => getCampaignInsights(id) as Promise<Insights>,
    refetchInterval: campaign?.status === 'sending' ? 10000 : false,
  });

  const { data: allMessages } = useQuery({
    queryKey: ['all-messages', id],
    queryFn: () => getCampaignMessages(id, 500) as Promise<Message[]>,
    enabled: !!insights,
  });

  if (isLoading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-6 h-32 skeleton" />
        ))}
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">No insights yet. Send the campaign first.</p>
      </div>
    );
  }

  // Funnel chart data
  const funnelData = [
    { name: 'Sent', value: insights.funnel.sent },
    { name: 'Delivered', value: insights.funnel.delivered },
    { name: 'Opened', value: insights.funnel.opened },
    { name: 'Clicked', value: insights.funnel.clicked },
    { name: 'Converted', value: insights.funnel.converted },
  ];

  // Donut chart data
  const donutData = insights.by_channel.map((ch) => ({
    name: ch.channel,
    value: ch.sent,
    color: CHANNEL_COLORS[ch.channel] || '#94a3b8',
  }));

  // Sorted personas
  const sortedPersonas = [...insights.by_persona].sort((a, b) => {
    if (sortField === 'conversion_rate') {
      return parseFloat(b.conversion_rate) - parseFloat(a.conversion_rate);
    }
    return b[sortField] - a[sortField];
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-800">{insights.campaign_name}</h1>
            <span className={`status-badge ${STATUS_STYLES[campaign?.status || 'draft'] || 'bg-slate-100 text-slate-600'}`}>
              {campaign?.status}
            </span>
          </div>
          {campaign?.sent_at && (
            <p className="text-slate-500 text-sm">
              Sent {new Date(campaign.sent_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Link
            href={`/campaigns/${id}/live`}
            className="btn-ghost text-sm border border-slate-200"
          >
            Live View
          </Link>
          {allMessages && (
            <button
              id="download-report-btn"
              onClick={() => downloadCSV(allMessages, insights.campaign_name)}
              className="btn-primary text-sm flex items-center gap-1.5"
            >
              ↓ Download Report
            </button>
          )}
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
          sub={`${insights.funnel.converted} conversions`}
          trend="up"
        />
      </div>

      {/* ROW 2 — Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Funnel Chart */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-700 mb-5">Delivery Funnel</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={funnelData} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} width={70} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar dataKey="value" fill="#0d9488" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Channel Donut */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-700 mb-5">By Channel</h2>
          {donutData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donutData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-xs text-slate-600 capitalize">{value}</span>
                  )}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-400 text-sm">
              No channel data yet
            </div>
          )}

          {/* Top channel callout */}
          {insights.top_converting_channel && (
            <div className="mt-3 p-3 bg-teal-50 rounded-lg text-center">
              <p className="text-xs text-teal-600 font-medium">
                Top converting channel: <span className="font-bold capitalize">{insights.top_converting_channel}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ROW 3 — Persona Table */}
      <div className="card mb-6">
        <div className="p-5 border-b border-slate-100">
          <h2 className="font-semibold text-slate-700">Persona Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {[
                  { label: 'Persona', field: null },
                  { label: 'Sent', field: 'sent' as const },
                  { label: 'Converted', field: 'converted' as const },
                  { label: 'Conv. Rate', field: 'conversion_rate' as const },
                ].map(({ label, field }) => (
                  <th
                    key={label}
                    className={`px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider ${
                      field ? 'cursor-pointer hover:text-teal-600' : ''
                    } ${sortField === field ? 'text-teal-600' : ''}`}
                    onClick={() => field && setSortField(field)}
                  >
                    {label} {sortField === field && '↓'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sortedPersonas.map((p) => (
                <tr key={p.persona_tag} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{p.persona_tag}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{p.sent}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{p.converted}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-sm font-semibold ${
                      parseFloat(p.conversion_rate) > 15 ? 'text-emerald-600' :
                      parseFloat(p.conversion_rate) > 5 ? 'text-teal-600' : 'text-slate-600'
                    }`}>
                      {p.conversion_rate}
                    </span>
                  </td>
                </tr>
              ))}
              {sortedPersonas.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-400 text-sm">
                    No persona data yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ROW 4 — AI Insight Card */}
      <div className="card p-6 border-l-4 border-l-teal-500">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-xl">✨</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">
              Campaign Intelligence
            </p>
            <p className="text-slate-700 leading-relaxed">{insights.ai_summary}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
