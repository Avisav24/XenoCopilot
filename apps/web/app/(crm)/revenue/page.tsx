'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRevenueStats } from '@/lib/api';

export default function RevenueIntelligencePage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['revenue-stats'],
    queryFn: getRevenueStats,
  });

  return (
    <div className="flex flex-col gap-8 w-full pb-24">
      
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-hairline pb-8">
        <h1>Revenue Intelligence</h1>
        <p className="max-w-2xl">
          Executive performance dashboard. Attributed campaign revenue and high-level ROI metrics.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20 text-ink-muted text-[14px] font-medium">
          Loading revenue intelligence...
        </div>
      ) : stats ? (
        <div className="flex flex-col gap-10 w-full">
          
          {/* Executive Brief */}
          {stats.keyInsight && (
            <div className="card flex flex-col gap-4 bg-primary-soft border-primary/20">
              <span className="label-text text-primary">Executive Brief</span>
              <div className="grid grid-cols-4 gap-4 text-[14px] text-ink">
                <div className="flex flex-col gap-1 font-semibold text-[16px]">Total Impact <span className="text-semantic-success">↑ 12%</span></div>
                <div className="flex flex-col gap-1"><span className="text-ink-muted text-[12px] uppercase tracking-wider font-bold">Best Channel</span> {stats.topChannel}</div>
                <div className="flex flex-col gap-1"><span className="text-ink-muted text-[12px] uppercase tracking-wider font-bold">Largest Risk</span> Dormant VIPs</div>
                <div className="flex flex-col gap-1"><span className="text-ink-muted text-[12px] uppercase tracking-wider font-bold">Top Opportunity</span> {stats.revenueByPersona[0]?.name || 'Beauty Loyalists'}</div>
              </div>
            </div>
          )}

          {/* Top KPI Row */}
          <div className="grid grid-cols-4 gap-6">
            <div className="card flex flex-col gap-1 p-5">
              <span className="label-text">Revenue Influenced</span>
              <div className="flex items-center gap-3">
                <span className="text-[32px] font-mono-numbers font-bold text-ink">₹{stats.totalRevenueInfluenced.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                <span className="text-[13px] font-bold text-semantic-success bg-semantic-success/10 px-1.5 py-0.5 rounded">↑ 12%</span>
              </div>
            </div>
            <div className="card flex flex-col gap-1 p-5">
              <span className="label-text">Top Channel</span>
              <div className="flex items-center gap-3">
                <span className="text-[32px] font-bold text-ink truncate">{stats.topChannel}</span>
                <span className="text-[13px] font-bold text-semantic-success bg-semantic-success/10 px-1.5 py-0.5 rounded">↑ 4%</span>
              </div>
            </div>
            <div className="card flex flex-col gap-1 p-5">
              <span className="label-text">Reactivated Customers</span>
              <div className="flex items-center gap-3">
                <span className="text-[32px] font-mono-numbers font-bold text-ink">{stats.customersReactivated.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                <span className="text-[13px] font-bold text-semantic-success bg-semantic-success/10 px-1.5 py-0.5 rounded">↑ 22%</span>
              </div>
            </div>
            <div className="card flex flex-col gap-1 p-5">
              <span className="label-text">At-Risk Saved</span>
              <div className="flex items-center gap-3">
                <span className="text-[32px] font-mono-numbers font-bold text-ink">{stats.atRiskSaved.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            
            {/* Top Personas Table */}
            <div className="flex flex-col gap-4">
              <h3 className="text-[16px] font-semibold text-ink">Revenue by Persona</h3>
              <div className="table-container">
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
                        <td className="text-right font-mono-numbers text-ink">₹{p.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Channels Table */}
            <div className="flex flex-col gap-4">
              <h3 className="text-[16px] font-semibold text-ink">Channel Performance</h3>
              <div className="table-container">
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
                        <td className="text-right font-mono-numbers text-ink">₹{ch.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                        <td className="text-right font-mono-numbers text-ink">{ch.conversion}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Revenue By Opportunity */}
            <div className="flex flex-col col-span-2 gap-4">
              <h3 className="text-[16px] font-semibold text-ink">Revenue by Opportunity</h3>
              <div className="table-container">
                <table className="table-enterprise">
                  <thead>
                    <tr>
                      <th>Campaign Objective</th>
                      <th className="text-right">Attributed Revenue</th>
                      <th className="w-1/3">Performance Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.revenueByOpportunity.map((opp) => {
                      const pct = Math.max(1, Math.round((opp.value / stats.totalRevenueInfluenced) * 100));
                      return (
                        <tr key={opp.name}>
                          <td className="font-medium text-ink">{opp.name}</td>
                          <td className="text-right font-mono-numbers text-ink">₹{opp.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                          <td>
                            <div className="w-full h-1.5 bg-canvas-soft rounded-full overflow-hidden">
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
