'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { getCampaigns } from '@/lib/api';

type Campaign = {
  id: string;
  name: string;
  persona: string;
  channel: string;
  status: string;
  created_at: string;
};

export default function CampaignsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: getCampaigns,
  });

  const campaigns = (data as Campaign[]) || [];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[32px] font-display font-normal text-ink">Campaigns</h1>
          <p className="text-body text-[16px] mt-1">{campaigns.length} total campaigns</p>
        </div>
        <Link href="/chat" className="btn-primary flex items-center gap-2 h-[44px]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Campaign
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-6 h-24 skeleton" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 bg-surface-strong rounded-full flex items-center justify-center mx-auto mb-4 text-ink">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <p className="text-ink font-semibold text-[18px]">No campaigns yet</p>
          <p className="text-body text-[16px] mt-2">Create your first AI-powered campaign in minutes</p>
          <Link href="/chat" className="btn-primary inline-flex mt-6 h-[44px]">
            Open Copilot
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((c) => (
            <div key={c.id} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-[18px] font-semibold text-ink truncate">{c.name}</h3>
                    <span className="status-badge">
                      {c.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[14px] text-body">
                    <span className="font-medium text-ink bg-surface-strong px-2 py-0.5 rounded">
                      {c.persona}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-ink">
                      {c.channel}
                    </span>
                    <span className="text-muted text-[13px]">
                      {new Date(c.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {(c.status === 'sending' || c.status === 'completed') && (
                    <Link
                      href={`/campaigns/${c.id}/insights`}
                      className="btn-ghost !py-2 !px-4 text-[14px]"
                    >
                      View Analytics
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
