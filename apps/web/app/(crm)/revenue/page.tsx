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
          
          {/* Executive Brief */}
          {stats.keyInsight && (
            <div className="flex flex-col gap-4 border-b border-hairline pb-8">
              <span className="label-text">Executive Brief</span>
              <div className="flex flex-col gap-1 text-[16px] text-ink">
                <div className="flex items-center gap-2 font-semibold">Revenue <span className="text-semantic-up">↑ 12%</span></div>
                <div><span className="text-muted">Best Channel:</span> {stats.topChannel}</div>
                <div><span className="text-muted">Largest Risk:</span> Dormant VIPs</div>
                <div><span className="text-muted">Largest Opportunity:</span> {stats.revenueByPersona[0]?.name || 'Beauty Loyalists'}</div>
              </div>
            </div>
          )}

          {/* Top KPI Row */}
          <div className="flex flex-wrap gap-x-12 gap-y-8 justify-between border-b border-hairline pb-8 w-full">
            <div className="flex flex-col gap-1 min-w-0 flex-shrink-0">
              <span className="label-text">Revenue Influenced</span>
              <div className="flex items-center gap-3 whitespace-nowrap">
                <span className="text-[36px] font-mono-numbers font-bold text-ink truncate">₹{stats.totalRevenueInfluenced.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                <span className="text-[13px] font-semibold text-semantic-up bg-semantic-up/10 px-1.5 py-0.5 rounded">↑ 12%</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 min-w-0 flex-shrink-0">
              <span className="label-text">Top Channel</span>
              <div className="flex items-center gap-3 whitespace-nowrap">
                <span className="text-[36px] font-bold text-ink truncate">{stats.topChannel}</span>
                <span className="text-[13px] font-semibold text-semantic-up bg-semantic-up/10 px-1.5 py-0.5 rounded">↑ 4%</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 min-w-0 flex-shrink-0">
              <span className="label-text">Reactivated Customers</span>
              <div className="flex items-center gap-3 whitespace-nowrap">
                <span className="text-[36px] font-mono-numbers font-bold text-ink truncate">{stats.customersReactivated.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                <span className="text-[13px] font-semibold text-semantic-up bg-semantic-up/10 px-1.5 py-0.5 rounded">↑ 22%</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 min-w-0 flex-shrink-0">
              <span className="label-text">At-Risk Saved</span>
              <div className="flex items-center gap-3 whitespace-nowrap">
                <span className="text-[36px] font-mono-numbers font-bold text-ink truncate">{stats.atRiskSaved.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
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
                        <td className="text-right font-mono-numbers text-ink">₹{p.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
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
                        <td className="text-right font-mono-numbers text-ink">₹{ch.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
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
                          <td className="text-right font-mono-numbers text-ink">₹{opp.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
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
