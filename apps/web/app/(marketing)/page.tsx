'use client';

import { useQuery } from '@tanstack/react-query';
import { getCustomerStats, getRevenueStats } from '@/lib/api';
import { Sparkle, ArrowRight, Pulse, WarningCircle, User, ArrowsClockwise } from '@phosphor-icons/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OpportunitiesPage() {
  const router = useRouter();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['customer-stats'],
    queryFn: getCustomerStats,
  });

  const { data: revenue } = useQuery({
    queryKey: ['revenue-stats'],
    queryFn: getRevenueStats,
  });

  if (isLoading) {
    return <div className="p-8 h-[calc(100vh-4rem)] flex items-center justify-center">Analyzing Customer Base for Opportunities...</div>;
  }

  // Create dynamic opportunities based on stats
  const opportunities = [];

  if (stats && revenue) {
    // Opportunity 1: At-Risk VIPs
    if (stats.atRisk > 0) {
      opportunities.push({
        id: 'risk-vips',
        title: 'Save At-Risk Customers',
        description: `${stats.atRisk} customers are showing severe drop-off in engagement. Historically, engaging this cohort yields an average order value of ₹${stats.avgAOV}.`,
        impact: `₹${(stats.atRisk * stats.avgAOV).toLocaleString()}`,
        tag: 'Urgent',
        tagColor: 'bg-semantic-down/10 text-semantic-down',
        icon: <WarningCircle size={54} className="text-semantic-down" />,
        action: 'Draft Win-Back Campaign'
      });
    }

    // Opportunity 2: Dormant Reactivation
    if (stats.dormant > 0) {
      opportunities.push({
        id: 'dormant-reactivation',
        title: 'Reactivate Dormant Buyers',
        description: `${stats.dormant} customers haven't purchased in 90+ days. Based on previous behavior, targeted SMS campaigns can recover ~12% of these users.`,
        impact: `₹${Math.round(stats.dormant * 0.12 * stats.avgLTV).toLocaleString()}`,
        tag: 'Growth',
        tagColor: 'bg-primary/10 text-primary',
        icon: <ArrowsClockwise size={54} className="text-primary" />,
        action: 'Generate Offers'
      });
    }

    // Opportunity 3: Top Persona Upsell
    if (revenue.topPersona !== 'Unknown') {
      const topP = revenue.topPersona;
      opportunities.push({
        id: 'persona-upsell',
        title: `Upsell ${topP}s`,
        description: `${topP}s are your highest revenue drivers. They are 3x more likely to convert on WhatsApp early access campaigns.`,
        impact: `₹${Math.round(stats.vip * stats.avgAOV * 0.4).toLocaleString()}`,
        tag: 'High Intent',
        tagColor: 'bg-emerald-500/10 text-emerald-600',
        icon: <User size={54} className="text-emerald-600" />,
        action: 'Launch Exclusive Drop'
      });
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col gap-8 h-[calc(100vh-4rem)] overflow-y-auto pb-20">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-[32px] font-display font-normal text-ink">Good morning.</h1>
        <p className="text-[16px] text-muted max-w-2xl">
          The Copilot engine has analyzed your customer database. Here are the top revenue opportunities identified today.
        </p>
      </div>

      {/* Opportunities List */}
      <div className="flex flex-col gap-6 mt-4">
        {opportunities.map((opp, idx) => (
          <div key={opp.id} className="card p-6 bg-canvas border border-hairline hover:border-primary/30 transition-all flex flex-col md:flex-row gap-6 items-start justify-between group cursor-pointer" onClick={() => router.push('/chat')}>
            
            <div className="flex gap-5">
              <div className="w-12 h-12 rounded-full bg-surface-strong flex items-center justify-center flex-shrink-0">
                {opp.icon}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-[20px] font-semibold text-ink leading-none">{opp.title}</h2>
                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${opp.tagColor}`}>
                    {opp.tag}
                  </span>
                </div>
                <p className="text-[14px] text-muted max-w-xl leading-relaxed">
                  {opp.description}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3 flex-shrink-0">
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-bold text-muted uppercase tracking-wider mb-1">Potential Revenue</span>
                <span className="text-[24px] font-mono-numbers font-bold text-ink leading-none group-hover:text-primary transition-colors">{opp.impact}</span>
              </div>
              <button className="flex items-center gap-2 text-[13px] font-bold text-primary group-hover:bg-primary group-hover:text-white px-4 py-2 rounded-lg transition-all">
                {opp.action} <ArrowRight size={54} />
              </button>
            </div>

          </div>
        ))}

        {opportunities.length === 0 && (
          <div className="p-10 border border-hairline rounded-xl bg-canvas text-center flex flex-col items-center justify-center gap-4">
            <Sparkle size={54} className="text-muted" />
            <p className="text-[14px] text-muted">No immediate opportunities detected. The engine is still learning from recent data.</p>
          </div>
        )}
      </div>

      {/* Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="card p-6 border-hairline bg-surface-soft">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[14px] font-bold text-ink uppercase tracking-wider">Customer Health Snapshot</h3>
            <Link href="/intelligence" className="text-[12px] text-primary font-bold hover:underline">View Intelligence →</Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[28px] font-mono-numbers text-ink">{stats?.total.toLocaleString()}</p>
              <p className="text-[13px] text-muted">Total Active Profiles</p>
            </div>
            <div className="text-right">
              <p className="text-[28px] font-mono-numbers text-semantic-down">{stats?.atRisk.toLocaleString()}</p>
              <p className="text-[13px] text-muted">Profiles At Risk</p>
            </div>
          </div>
        </div>

        <div className="card p-6 border-hairline bg-surface-soft">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[14px] font-bold text-ink uppercase tracking-wider">Revenue Snapshot</h3>
            <Link href="/revenue" className="text-[12px] text-primary font-bold hover:underline">View Executive Dash →</Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[28px] font-mono-numbers text-ink">₹{revenue?.totalRevenueInfluenced.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || 0}</p>
              <p className="text-[13px] text-muted">Total Revenue Influenced</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
