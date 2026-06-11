'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRevenueStats } from '@/lib/api';

import { Megaphone } from 'iconoir-react';
import Loader from '@/components/Loader';

export default function RevenueIntelligencePage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['revenue-stats'],
    queryFn: getRevenueStats,
  });

  return (
    <div className="p-10 w-full flex flex-col gap-10 min-h-screen bg-canvas">
      
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-hairline pb-8">
        <h1 className="text-[32px] font-display font-semibold text-ink tracking-tight flex items-center gap-3">
          Revenue Intelligence
        </h1>
        <p className="text-[14px] text-muted max-w-2xl leading-relaxed">
          Executive performance dashboard. Attributed campaign revenue and high-level ROI metrics.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20 text-muted text-[14px] font-medium">
          Loading revenue intelligence...
        </div>
      ) : stats ? (
        <div className="flex flex-col gap-10 max-w-5xl">
          
          {/* Executive Insights Block */}
          {stats.keyInsight && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
              <div className="p-6 border border-hairline rounded-xl bg-surface-card flex flex-col gap-3">
                <span className="text-[11px] font-bold text-ink uppercase tracking-wider">Key Insight</span>
                <p className="text-[14px] text-ink leading-relaxed font-medium">{stats.keyInsight}</p>
              </div>
              <div className="p-6 border border-semantic-down/20 rounded-xl bg-semantic-down/5 flex flex-col gap-3">
                <span className="text-[11px] font-bold text-semantic-down uppercase tracking-wider">Key Risk</span>
                <p className="text-[14px] text-ink leading-relaxed font-medium">{stats.keyRisk}</p>
              </div>
              <div className="p-6 border border-primary/20 rounded-xl bg-primary/5 flex flex-col gap-3">
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Key Opportunity</span>
                <p className="text-[14px] text-ink leading-relaxed font-medium">{stats.keyOpportunity}</p>
              </div>
            </div>
          )}

          {/* Top KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-hairline rounded-lg overflow-hidden bg-surface-card">
            <div className="p-5 border-r border-hairline flex flex-col gap-1 bg-surface-soft">
              <span className="text-[12px] font-medium text-muted uppercase tracking-wider">Revenue Influenced</span>
              <span className="text-[24px] font-mono-numbers font-semibold text-ink">₹{stats.totalRevenueInfluenced.toLocaleString()}</span>
            </div>
            <div className="p-5 border-r border-hairline flex flex-col gap-1">
              <span className="text-[12px] font-medium text-muted uppercase tracking-wider">Top Channel</span>
              <span className="text-[24px] font-medium text-ink">{stats.topChannel}</span>
            </div>
            <div className="p-5 border-r border-hairline flex flex-col gap-1">
              <span className="text-[12px] font-medium text-muted uppercase tracking-wider">Reactivated Customers</span>
              <span className="text-[24px] font-mono-numbers font-semibold text-ink">{stats.customersReactivated.toLocaleString()}</span>
            </div>
            <div className="p-5 flex flex-col gap-1">
              <span className="text-[12px] font-medium text-muted uppercase tracking-wider">At-Risk Saved</span>
              <span className="text-[24px] font-mono-numbers font-semibold text-ink">{stats.atRiskSaved.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Top Personas Table */}
            <div className="flex flex-col">
              <h3 className="text-[16px] font-semibold text-ink mb-4 border-b border-hairline pb-2">Revenue by Persona</h3>
              <div className="table-container shadow-none">
                <table className="table-enterprise">
                  <thead>
                    <tr>
                      <th>Persona</th>
                      <th className="text-right">Attributed Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.revenueByPersona.map((p) => (
                      <tr key={p.name}>
                        <td className="font-medium text-ink">{p.name}</td>
                        <td className="text-right font-mono-numbers text-ink">₹{p.value.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Channels Table */}
            <div className="flex flex-col">
              <h3 className="text-[16px] font-semibold text-ink mb-4 border-b border-hairline pb-2">Channel Performance</h3>
              <div className="table-container shadow-none">
                <table className="table-enterprise">
                  <thead>
                    <tr>
                      <th>Channel</th>
                      <th className="text-right">Revenue</th>
                      <th className="text-right">Conversion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.channelIntelligence.map((ch) => (
                      <tr key={ch.channel}>
                        <td className="font-medium text-ink">{ch.channel}</td>
                        <td className="text-right font-mono-numbers text-ink">₹{ch.revenue.toLocaleString()}</td>
                        <td className="text-right font-mono-numbers text-ink">{ch.conversion}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Revenue By Opportunity */}
            <div className="flex flex-col lg:col-span-2 mt-4">
              <h3 className="text-[16px] font-semibold text-ink mb-4 border-b border-hairline pb-2">Revenue by Opportunity</h3>
              <div className="table-container shadow-none">
                <table className="table-enterprise">
                  <thead>
                    <tr>
                      <th>Campaign Objective</th>
                      <th className="text-right">Attributed Revenue</th>
                      <th className="w-1/2">Performance Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.revenueByOpportunity.map((opp) => {
                      const pct = Math.max(1, Math.round((opp.value / stats.totalRevenueInfluenced) * 100));
                      return (
                        <tr key={opp.name}>
                          <td className="font-medium text-ink">{opp.name}</td>
                          <td className="text-right font-mono-numbers text-ink">₹{opp.value.toLocaleString()}</td>
                          <td>
                            <div className="w-full h-1.5 bg-surface-strong rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      ) : null}
    </div>
  );
}
