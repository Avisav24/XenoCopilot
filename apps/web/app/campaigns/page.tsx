'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { getCampaigns } from '@/lib/api';

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  sending: 'bg-blue-100 text-blue-700',
  sent: 'bg-teal-100 text-teal-700',
  completed: 'bg-emerald-100 text-emerald-700',
};

type Campaign = {
  id: string;
  name: string;
  goal: string;
  status: string;
  audience_count: number;
  created_at: string;
  sent_at: string | null;
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
          <h1 className="text-2xl font-bold text-slate-800">Campaigns</h1>
          <p className="text-slate-500 mt-1">{campaigns.length} total campaigns</p>
        </div>
        <Link href="/campaigns/new" id="create-campaign-btn" className="btn-primary flex items-center gap-2">
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
          <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <p className="text-slate-600 font-semibold text-lg">No campaigns yet</p>
          <p className="text-slate-400 mt-2">Create your first AI-powered campaign in minutes</p>
          <Link href="/campaigns/new" className="btn-primary inline-flex mt-6">
            🚀 Create First Campaign
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((c) => (
            <div key={c.id} className="card p-6 hover:border-teal-200 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-slate-800 truncate">{c.name}</h3>
                    <span className={`status-badge ${STATUS_STYLES[c.status] || 'bg-slate-100 text-slate-600'}`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-1">{c.goal}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                    {c.audience_count > 0 && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {c.audience_count} recipients
                      </span>
                    )}
                    <span>
                      Created {new Date(c.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                    {c.sent_at && (
                      <span>
                        Sent {new Date(c.sent_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short',
                        })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {(c.status === 'sending' || c.status === 'completed') && (
                    <Link
                      href={`/campaigns/${c.id}/live`}
                      className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600 transition-colors"
                    >
                      Live View
                    </Link>
                  )}
                  {(c.status === 'sending' || c.status === 'completed') && (
                    <Link
                      href={`/campaigns/${c.id}/insights`}
                      className="text-xs px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors font-medium"
                    >
                      Insights
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
