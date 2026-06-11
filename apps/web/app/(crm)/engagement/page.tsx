'use client';

import { useQuery } from '@tanstack/react-query';
import { getCampaigns } from '@/lib/api';
import { clsx } from 'clsx';
import Link from 'next/link';
import { format } from 'date-fns';
import { Spark } from 'iconoir-react';

export default function EngagementListPage() {
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: getCampaigns,
  });

  return (
    <div className="p-10 w-full flex flex-col gap-8 min-h-screen bg-canvas">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-hairline pb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-[32px] font-display font-semibold text-ink tracking-tight">
            Campaigns
          </h1>
          <p className="text-[14px] text-muted max-w-2xl leading-relaxed">
            Monitor real-time performance and audience engagement of active communication strategies.
          </p>
        </div>
        <Link href="/chat" className="btn-primary flex items-center gap-2">
          <Spark height={16} width={16} />
          <span>New Campaign</span>
        </Link>
      </div>

      <div className="flex flex-col max-w-6xl w-full">
        {isLoading ? (
          <div className="flex justify-center py-12 text-muted text-[14px] font-medium">Loading campaign database...</div>
        ) : !campaigns || campaigns.length === 0 ? (
          <div className="text-center py-16 border border-hairline rounded-xl bg-surface-card flex flex-col items-center justify-center">
            <Spark height={32} width={32} className="text-muted mb-4" />
            <h3 className="text-[16px] font-semibold text-ink mb-1">No campaigns active</h3>
            <p className="text-[14px] text-muted mb-6">Launch a campaign to start analyzing engagement.</p>
            <Link href="/chat" className="btn-ghost inline-flex items-center gap-2">
              Draft Campaign
            </Link>
          </div>
        ) : (
          <div className="table-container shadow-none border border-hairline rounded-xl overflow-hidden bg-surface-card">
            <table className="table-enterprise w-full">
              <thead>
                <tr>
                  <th>Campaign Name</th>
                  <th>Target Audience</th>
                  <th>Channel</th>
                  <th className="text-right">Predicted Rev</th>
                  <th>Status</th>
                  <th>Created Date</th>
                </tr>
              </thead>
              <tbody className="bg-surface-card divide-y divide-hairline">
                {campaigns.map((c: any) => {
                  // Mocked prediction for UI purposes
                  const predRevenue = Math.round((c.name.length * 1200) + 5000);
                  
                  return (
                    <tr key={c.id} className="group">
                      <td>
                        <Link href={`/engagement/${c.id}`} className="font-semibold text-ink group-hover:underline">
                          {c.name}
                        </Link>
                      </td>
                      <td className="text-muted font-medium">{c.persona}</td>
                      <td>
                        <span className="text-[12px] px-2 py-0.5 rounded border border-hairline bg-surface-soft text-ink font-medium">
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
                            c.status === 'completed' ? "bg-semantic-up" : "bg-accent-yellow"
                          )} />
                          <span className="text-[13px] font-medium text-ink capitalize">{c.status}</span>
                        </div>
                      </td>
                      <td className="text-muted text-[13px]">
                        {format(new Date(c.created_at), 'MMM d, yyyy h:mm a')}
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
