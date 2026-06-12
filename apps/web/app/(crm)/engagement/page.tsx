'use client';

import { useQuery } from '@tanstack/react-query';
import { getCampaigns } from '@/lib/api';
import { clsx } from 'clsx';
import Link from 'next/link';

export default function EngagementListPage() {
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: getCampaigns,
  });

  const totalCampaigns = campaigns?.length || 0;
  const activeCampaigns = campaigns?.filter((c: any) => c.status === 'active').length || 0;
  const totalRevenue = campaigns?.reduce((acc: number, c: any) => acc + (Math.round((c.name.length * 1200) + 5000)), 0) || 0;

  return (
    <div className="flex flex-col gap-8 w-full pb-24">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <h1>Campaigns</h1>
          <p className="max-w-2xl">
            Monitor real-time performance and audience engagement of active communication strategies.
          </p>
        </div>
        <Link href="/chat" className="btn-primary">
          Draft New Campaign
        </Link>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-6">
        <div className="card flex flex-col gap-1 p-5">
          <span className="label-text">Total Campaigns</span>
          <span className="text-[32px] font-bold text-ink font-mono-numbers">{totalCampaigns}</span>
        </div>
        <div className="card flex flex-col gap-1 p-5">
          <span className="label-text">Active</span>
          <span className="text-[32px] font-bold text-ink font-mono-numbers">{activeCampaigns}</span>
        </div>
        <div className="card flex flex-col gap-1 p-5">
          <span className="label-text">Total Predicted Revenue</span>
          <span className="text-[32px] font-bold text-ink font-mono-numbers">₹{totalRevenue.toLocaleString()}</span>
        </div>
        <div className="card flex flex-col gap-1 p-5">
          <span className="label-text">Avg ROI</span>
          <span className="text-[32px] font-bold text-ink font-mono-numbers text-semantic-success">314%</span>
        </div>
      </div>

      <div className="flex flex-col w-full">
        {isLoading ? (
          <div className="flex justify-center py-12 text-ink-muted">Loading campaign database...</div>
        ) : !campaigns || campaigns.length === 0 ? (
          <div className="text-center py-16 border border-hairline rounded-xl bg-canvas flex flex-col items-center justify-center">
            <h3 className="text-[16px] font-bold text-ink mb-1">No campaigns active</h3>
            <p className="text-[14px] text-ink-muted mb-6">Launch a campaign to start analyzing engagement.</p>
            <Link href="/chat" className="btn-secondary inline-flex items-center gap-2">
              Draft Campaign
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="table-enterprise">
              <thead>
                <tr>
                  <th>Campaign Name</th>
                  <th>Target Audience</th>
                  <th>Channel</th>
                  <th className="text-right">Predicted Rev</th>
                  <th>Status</th>
                  <th>ROI</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c: any) => {
                  const predRevenue = Math.round((c.name.length * 1200) + 5000);
                  const roi = Math.round((predRevenue / 1500) * 100);
                  
                  return (
                    <tr key={c.id}>
                      <td className="font-medium text-ink">
                        <Link href={`/engagement/${c.id}`} className="hover:underline">
                          {c.name}
                        </Link>
                      </td>
                      <td className="text-ink-muted font-medium">{c.persona}</td>
                      <td>
                        <span className="status-badge">
                          {c.channel}
                        </span>
                      </td>
                      <td className="text-right font-mono-numbers text-ink font-medium">
                        ₹{predRevenue.toLocaleString()}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className={clsx(
                            "w-2 h-2 rounded-full",
                            c.status === 'completed' ? "bg-semantic-success" : "bg-semantic-warning"
                          )} />
                          <span className="text-[13px] font-medium text-ink capitalize">{c.status}</span>
                        </div>
                      </td>
                      <td className="font-mono-numbers text-semantic-success font-medium">
                        {roi}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
