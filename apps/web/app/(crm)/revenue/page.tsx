'use client';

import { useQuery } from '@tanstack/react-query';
import { getRevenueStats } from '@/lib/api';
import { Sparkle, Megaphone, Users, CurrencyCircleDollar, PaperPlaneRight, Pulse, User } from '@phosphor-icons/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

const COLORS = ['#0052ff', '#319795', '#d48166', '#dd6b20', '#805ad5', '#e53e3e'];

const WhatsAppIcon = ({ size = 54 }: { size?: number }) => (
  <img 
    src="https://cdn-icons-png.flaticon.com/512/124/124034.png" 
    alt="WhatsApp" 
    width={size} 
    height={size} 
    className="shrink-0 object-contain drop-shadow-sm" 
  />
);

export default function RevenueIntelligencePage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['revenue-stats'],
    queryFn: getRevenueStats,
  });

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8 h-[calc(100vh-4rem)] overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col items-center justify-center py-10 bg-canvas rounded-xl border border-hairline relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <h1 className="text-[32px] font-display font-normal text-ink mb-2 z-10">Revenue Intelligence</h1>
        <p className="text-body text-[16px] z-10">Executive Command Center for Campaign Attribution & Revenue Discovery</p>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">Loading Executive Dashboard...</div>
      ) : stats ? (
        <>
          {/* Executive KPI Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-6 flex flex-col justify-between border-primary/20" style={{ backgroundColor: '#f0eaff' }}>
              <div className="flex justify-between items-start mb-4">
                <p className="text-[12px] font-bold text-primary uppercase tracking-wider">Revenue Influenced</p>
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <CurrencyCircleDollar size={32} className="text-primary" />
                </div>
              </div>
              <p className="text-[36px] font-mono-numbers text-ink leading-none">₹{stats.totalRevenueInfluenced.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
            
            <div className="card p-6 flex flex-col justify-between bg-surface-soft border-hairline">
              <div className="flex justify-between items-start mb-4">
                <p className="text-[12px] font-bold text-muted uppercase tracking-wider">Top Persona</p>
                <User size={48} className="text-muted" />
              </div>
              <p className="text-[20px] font-bold text-ink leading-tight">{stats.topPersona}</p>
            </div>
            
            <div className="card p-6 flex flex-col justify-between bg-surface-soft border-hairline">
              <div className="flex justify-between items-start mb-4">
                <p className="text-[12px] font-bold text-muted uppercase tracking-wider">Top Channel</p>
                {stats.topChannel === 'WhatsApp' ? <WhatsAppIcon size={48} /> : <PaperPlaneRight size={48} className="text-muted" />}
              </div>
              <p className="text-[24px] font-bold text-ink leading-none">{stats.topChannel}</p>
            </div>
            
            <div className="card p-6 flex flex-col justify-between bg-surface-soft border-hairline">
              <div className="flex justify-between items-start mb-4">
                <p className="text-[12px] font-bold text-muted uppercase tracking-wider">At-Risk Saved</p>
                <Pulse size={48} className="text-muted" />
              </div>
              <p className="text-[32px] font-mono-numbers text-semantic-up leading-none">{stats.atRiskSaved}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue By Opportunity Type */}
            <div className="card p-6 flex flex-col">
              <h2 className="text-[16px] font-semibold text-ink mb-6">Revenue by Opportunity Type</h2>
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.revenueByOpportunity} margin={{ top: 0, right: 0, left: 10, bottom: 20 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} angle={-15} textAnchor="end" />
                    <YAxis tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: '1px solid #eee' }} formatter={(val: number) => `₹${val.toLocaleString()}`} />
                    <Bar dataKey="value" fill="#0052ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue By Persona */}
            <div className="card p-6 flex flex-col">
              <h2 className="text-[16px] font-semibold text-ink mb-6">Revenue Attribution by Persona</h2>
              <div className="flex-1 min-h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.revenueByPersona} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={60} stroke="none">
                      {stats.revenueByPersona.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #eee' }} formatter={(val: number) => `₹${val.toLocaleString()}`} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Channel Intelligence */}
          <div className="card flex flex-col overflow-hidden mb-10">
            <div className="p-6 border-b border-hairline bg-canvas flex justify-between items-center">
              <div>
                <h2 className="text-[18px] font-semibold text-ink">Channel Intelligence</h2>
                <p className="text-[13px] text-muted mt-1">AI Recommendation: For {stats.topPersona}, {stats.topChannel} performs best. Prioritize {stats.topChannel} campaigns.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-soft border-b border-hairline text-left">
                  <tr>
                    <th className="px-6 py-4 text-[12px] font-bold text-muted uppercase tracking-wider">Channel</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-muted uppercase tracking-wider">Attributed Revenue</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-muted uppercase tracking-wider">Click-Through Rate</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-muted uppercase tracking-wider">Conversion Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline bg-canvas">
                  {stats.channelIntelligence.map((ch, idx) => (
                    <tr key={ch.channel} className="hover:bg-surface-soft transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full bg-[${COLORS[idx % COLORS.length]}]`} />
                          <span className="font-semibold text-ink">{ch.channel}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[15px] font-mono-numbers font-medium text-ink">
                        ₹{ch.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-6 py-4 text-[15px] font-mono-numbers text-ink">
                        {ch.ctr}%
                      </td>
                      <td className="px-6 py-4 text-[15px] font-mono-numbers text-semantic-up font-medium">
                        {ch.conversion}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </>
      ) : null}
    </div>
  );
}
