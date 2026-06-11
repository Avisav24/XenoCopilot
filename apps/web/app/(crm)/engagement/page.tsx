'use client';

import { useQuery } from '@tanstack/react-query';
import { getCampaigns } from '@/lib/api';
import { ChartBar, PaperPlaneRight, Sparkle, Clock } from '@phosphor-icons/react';
import { clsx } from 'clsx';
import Link from 'next/link';
import { format } from 'date-fns';
import Loader from '@/components/Loader';

export default function EngagementListPage() {
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: getCampaigns,
  });

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8 h-[calc(100vh-4rem)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ChartBar size={54} className="text-primary" />
          <h1 className="text-[32px] md:text-[36px] leading-[1.09] tracking-[-1px] font-display text-ink">
            Communication Insights
          </h1>
        </div>
        <Link href="/chat" className="btn-primary flex items-center gap-2">
          <Sparkle size={20} />
          <span>New Strategy</span>
        </Link>
      </div>

      <div className="bg-canvas border border-hairline rounded-md p-6">
        <p className="text-[14px] text-body max-w-3xl mb-8 leading-relaxed">
          Track the real-time performance and audience engagement of your AI-driven communication strategies. Every message sent is tracked across delivery, opens, clicks, and resulting revenue.
        </p>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader text="Loading insights..." /></div>
        ) : !campaigns || campaigns.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-hairline rounded-md bg-surface-soft">
            <ChartBar size={48} className="text-muted mx-auto mb-4" />
            <h3 className="text-[16px] font-bold text-ink mb-2">No communications found</h3>
            <p className="text-[14px] text-body mb-4">Use the Revenue Strategist to launch your first campaign.</p>
            <Link href="/chat" className="btn-primary inline-flex items-center gap-2">
              <Sparkle size={20} /> Let's strategize
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {campaigns.map((c: any) => (
              <Link 
                key={c.id} 
                href={`/engagement/${c.id}`}
                className="group card p-5 flex items-center justify-between border border-hairline hover:border-primary/50 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={clsx(
                    "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                    c.status === 'sending' ? 'bg-accent-yellow/10 text-accent-yellow' : 'bg-semantic-up/10 text-semantic-up'
                  )}>
                    {c.status === 'sending' ? <Clock size={24} /> : <PaperPlaneRight size={24} />}
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-ink group-hover:text-primary transition-colors">
                      {c.name}
                    </h3>
                    <div className="flex items-center gap-3 text-[12px] text-muted mt-1 font-medium">
                      <span className="bg-surface-strong px-2 py-0.5 rounded text-ink uppercase tracking-wider text-[10px]">
                        {c.channel}
                      </span>
                      <span>Target: <strong className="text-ink">{c.persona}</strong></span>
                      <span>•</span>
                      <span>{format(new Date(c.created_at), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={clsx(
                    "px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider",
                    c.status === 'completed' ? 'bg-semantic-up/10 text-semantic-up' : 'bg-accent-yellow/10 text-accent-yellow'
                  )}>
                    {c.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
