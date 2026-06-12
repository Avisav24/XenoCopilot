'use client';

import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCampaign, getCampaignMessages, getCampaignInsights } from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import Link from 'next/link';

type Message = {
  id: string;
  channel: string;
  status: string;
  customer: { name: string; favorite_category: string | null };
  updated_at?: string;
  created_at: string;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  converted_at: string | null;
  failed_reason: string | null;
};

type Campaign = {
  id: string;
  name: string;
  goal: string;
  status: string;
  audience_count: number;
  sent_at: string | null;
};

type Insights = {
  funnel: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    failed: number;
  };
};

const STATUS_STYLES: Record<string, string> = {
  delivered: 'bg-blue-100 text-blue-700',
  opened: 'bg-emerald-100 text-emerald-700',
  clicked: 'bg-teal-100 text-teal-700',
  converted: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700',
  sent: 'bg-slate-100 text-slate-600',
  pending: 'bg-slate-100 text-slate-400',
};

const CHANNEL_ICONS: Record<string, string> = { email: '📧', whatsapp: '💬', sms: '📱' };

function EventCard({ message, isNew }: { message: Message; isNew: boolean }) {
  const initials = message.customer.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const latest = message.converted_at || message.clicked_at || message.opened_at || message.delivered_at;
  const timeAgo = latest
    ? `${Math.max(1, Math.round((Date.now() - new Date(latest).getTime()) / 1000))}s ago`
    : '';

  return (
    <div
      className={`flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100 shadow-sm transition-all duration-300 ${
        isNew ? 'animate-slide-in ring-1 ring-teal-200' : ''
      }`}
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{message.customer.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs">{CHANNEL_ICONS[message.channel] || '📨'}</span>
          {message.customer.favorite_category && (
            <span className="text-xs text-slate-400">{message.customer.favorite_category}</span>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className={`status-badge ${STATUS_STYLES[message.status] || 'bg-slate-100 text-slate-500'}`}>
          {message.status}
        </span>
        {timeAgo && <span className="text-xs text-slate-400">{timeAgo}</span>}
      </div>
    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value?: number; color: string }) {
  return (
    <div className={`flex-1 text-center px-4 py-3 rounded-xl ${color}`}>
      <p className="text-2xl font-bold">{(value || 0).toLocaleString()}</p>
      <p className="text-xs font-medium mt-0.5 opacity-75">{label}</p>
    </div>
  );
}

export default function LivePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const feedRef = useRef<HTMLDivElement>(null);

  const { data: campaign } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => getCampaign(id) as Promise<Campaign>,
    refetchInterval: 5000,
  });

  const { data: messagesData } = useQuery({
    queryKey: ['campaign-messages', id],
    queryFn: () => getCampaignMessages(id, 50) as Promise<Message[]>,
    refetchInterval: 3000,
  });

  const { data: insights } = useQuery({
    queryKey: ['campaign-insights', id],
    queryFn: () => getCampaignInsights(id) as Promise<Insights>,
    refetchInterval: 5000,
  });

  const messages = messagesData || [];

  // Track new messages for animation
  useEffect(() => {
    if (!messages.length) return;
    const incoming = new Set(messages.map((m: Message) => m.id));
    const fresh = new Set([...incoming].filter((id) => !seenIds.has(id)));
    if (fresh.size > 0) {
      setNewIds(fresh);
      setSeenIds(incoming);
      setTimeout(() => setNewIds(new Set()), 2000);
    }
  }, [messages]); // eslint-disable-line react-hooks/exhaustive-deps

  // Funnel chart data
  const funnel = insights?.funnel;
  const chartData = funnel
    ? [
        { name: 'Sent', value: funnel.sent, fill: '#94a3b8' },
        { name: 'Delivered', value: funnel.delivered, fill: '#60a5fa' },
        { name: 'Opened', value: funnel.opened, fill: '#34d399' },
        { name: 'Clicked', value: funnel.clicked, fill: '#2dd4bf' },
        { name: 'Converted', value: funnel.purchased, fill: '#f59e0b' },
      ]
    : [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800">{campaign?.name || 'Campaign'}</h1>
            {campaign?.status === 'completed' && (
              <span className="bg-emerald-100 text-emerald-700 text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                ✓ Completed
              </span>
            )}
            {campaign?.status === 'sending' && (
              <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                Live
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm mt-1 line-clamp-1 max-w-xl">{campaign?.goal}</p>
        </div>
        <Link
          href={`/campaigns/${id}/insights`}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          View Insights →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── LEFT: Stats + Chart ─────────────────────────── */}
        <div className="space-y-4">
          {/* Stat Pills */}
          {funnel && (
            <div className="flex gap-3">
              <StatPill label="Sent" value={funnel.sent} color="bg-slate-100 text-slate-700" />
              <StatPill label="Delivered" value={funnel.delivered} color="bg-blue-50 text-blue-700" />
              <StatPill label="Opened" value={funnel.opened} color="bg-emerald-50 text-emerald-700" />
              <StatPill label="Converted" value={funnel.purchased} color="bg-amber-50 text-amber-700" />
            </div>
          )}

          {!funnel && (
            <div className="flex gap-3">
              {['Sent', 'Delivered', 'Opened', 'Converted'].map((l) => (
                <div key={l} className="flex-1 h-20 skeleton rounded-xl" />
              ))}
            </div>
          )}

          {/* Mini Funnel Chart */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Delivery Funnel</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} layout="vertical" barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} width={65} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, i) => (
                      <rect key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-40 skeleton rounded" />
            )}
          </div>

          {/* Campaign Info */}
          <div className="card p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total audience</span>
              <span className="font-semibold text-slate-800">{campaign?.audience_count || 0}</span>
            </div>
            {campaign?.sent_at && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Sent at</span>
                <span className="font-semibold text-slate-800">
                  {new Date(campaign.sent_at).toLocaleTimeString('en-IN', {
                    hour: '2-digit', minute: '2-digit', hour12: true,
                  })}
                </span>
              </div>
            )}
            {funnel && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Failed</span>
                <span className="font-semibold text-red-600">{funnel.failed}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Live Event Feed ──────────────────────── */}
        <div className="card flex flex-col" style={{ maxHeight: '600px' }}>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 text-sm">Live Event Feed</h3>
            <span className="text-xs text-slate-400">{messages.length} events</span>
          </div>
          <div ref={feedRef} className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
                <p className="text-sm text-slate-400">Waiting for events…</p>
              </div>
            ) : (
              messages.slice(0, 50).map((msg: Message) => (
                <EventCard
                  key={msg.id}
                  message={msg}
                  isNew={newIds.has(msg.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
