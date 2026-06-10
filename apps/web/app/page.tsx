'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { getCampaigns, getCustomerStats } from '@/lib/api';

function StatCard({
  label,
  value,
  sub,
  color = 'teal',
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: 'teal' | 'blue' | 'gold' | 'green';
}) {
  const colors = {
    teal: 'from-teal-500 to-teal-600',
    blue: 'from-blue-500 to-blue-600',
    gold: 'from-amber-400 to-amber-500',
    green: 'from-emerald-500 to-emerald-600',
  };
  return (
    <div className="stat-card">
      <div className={`w-8 h-1 rounded-full bg-gradient-to-r ${colors[color]} mb-3`} />
      <p className="text-3xl font-bold text-slate-800">{value}</p>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600',
    sending: 'bg-blue-100 text-blue-700',
    sent: 'bg-teal-100 text-teal-700',
    completed: 'bg-emerald-100 text-emerald-700',
  };
  return (
    <span className={`status-badge ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const { data: campaigns, isLoading: loadingCampaigns } = useQuery({
    queryKey: ['campaigns'],
    queryFn: getCampaigns,
  });

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['customer-stats'],
    queryFn: getCustomerStats,
  });

  const campaignList = (campaigns as { id: string; name: string; status: string; audience_count: number; created_at: string }[]) || [];
  const statsData = stats as { total: number; avg_spend: number; by_channel: { channel: string; count: number }[] } | undefined;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Campaign Dashboard</h1>
          <p className="text-slate-500 mt-1">Drape & Co. — AI-powered CRM</p>
        </div>
        <Link href="/campaigns/new" id="new-campaign-btn" className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Campaign
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loadingStats ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5 h-28 skeleton" />
          ))
        ) : (
          <>
            <StatCard
              label="Total Customers"
              value={statsData?.total?.toLocaleString() || '500'}
              sub="Drape & Co. shoppers"
              color="teal"
            />
            <StatCard
              label="Avg. Spend"
              value={`₹${(statsData?.avg_spend || 0).toLocaleString('en-IN')}`}
              sub="per customer"
              color="gold"
            />
            <StatCard
              label="Campaigns"
              value={campaignList.length}
              sub="total created"
              color="blue"
            />
            <StatCard
              label="Email Reach"
              value={`${statsData?.by_channel?.find((c) => c.channel === 'email')?.count || 0}`}
              sub="email subscribers"
              color="green"
            />
          </>
        )}
      </div>

      {/* Channel Breakdown */}
      {statsData?.by_channel && (
        <div className="card p-6 mb-8">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Audience by Channel
          </h2>
          <div className="flex gap-6">
            {statsData.by_channel.map((ch) => {
              const icons: Record<string, string> = { email: '📧', whatsapp: '💬', sms: '📱' };
              const pct = statsData.total ? Math.round((ch.count / statsData.total) * 100) : 0;
              return (
                <div key={ch.channel} className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                      <span>{icons[ch.channel] || '📨'}</span>
                      {ch.channel}
                    </span>
                    <span className="text-sm font-bold text-slate-800">{pct}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{ch.count.toLocaleString()} customers</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Campaigns */}
      <div className="card">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Recent Campaigns</h2>
          <Link href="/campaigns" className="text-teal-600 text-sm font-medium hover:text-teal-500">
            View all →
          </Link>
        </div>
        {loadingCampaigns ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 skeleton rounded-lg" />
            ))}
          </div>
        ) : campaignList.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <p className="text-slate-500 font-medium">No campaigns yet</p>
            <p className="text-slate-400 text-sm mt-1">Create your first AI-powered campaign</p>
            <Link href="/campaigns/new" className="btn-primary inline-flex mt-4">
              Create Campaign
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {campaignList.slice(0, 5).map((c) => (
              <Link
                key={c.id}
                href={c.status === 'completed' || c.status === 'sending'
                  ? `/campaigns/${c.id}/insights`
                  : `/campaigns`}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-slate-800 text-sm">{c.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {c.audience_count > 0 ? `${c.audience_count} recipients` : 'Draft'} ·{' '}
                    {new Date(c.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>
                <StatusBadge status={c.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
