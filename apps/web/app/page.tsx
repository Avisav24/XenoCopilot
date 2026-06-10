'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getCustomerStats, getCampaigns } from '@/lib/api';

export default function LandingPage() {
  const { data: stats } = useQuery({
    queryKey: ['customer-stats'],
    queryFn: getCustomerStats,
  });

  const { data: campaigns } = useQuery({
    queryKey: ['campaigns'],
    queryFn: getCampaigns,
  });

  const campaignsList = (campaigns as any[]) || [];

  return (
    <div className="min-h-screen bg-canvas">
      {/* Hero Band Dark */}
      <section className="hero-band-dark min-h-[600px] flex-col md:flex-row relative overflow-hidden">
        <div className="w-full md:w-1/2 z-10">
          <h1 className="text-[80px] font-display font-normal leading-[1.0] tracking-[-2px] mb-6">
            The next generation of marketing.
          </h1>
          <p className="text-[18px] text-on-darkSoft max-w-md mb-8 leading-[1.5]">
            An AI-first campaign platform that connects directly to your customer database. Select a goal, and we handle the rest.
          </p>
          <Link href="/chat" className="btn-primary-large inline-flex">
            Open Copilot
          </Link>
        </div>

        {/* Product UI Mockup */}
        <div className="w-full md:w-1/2 mt-12 md:mt-0 relative z-10 flex justify-end pr-8">
          <div className="product-ui-card-dark w-full max-w-md transform rotate-[-2deg] translate-y-8 relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 rounded-full bg-semantic-down" />
              <div className="w-3 h-3 rounded-full bg-accent-yellow" />
              <div className="w-3 h-3 rounded-full bg-semantic-up" />
            </div>
            <p className="text-[13px] text-muted mb-2 font-semibold">Recommended Campaign</p>
            <p className="text-[32px] font-mono-numbers text-on-dark mb-1">₹145,200</p>
            <p className="text-[14px] text-semantic-up font-mono-numbers mb-6">+3.4% Est. Conversion</p>
            <div className="h-px bg-white/10 w-full mb-6" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-on-darkSoft text-[14px]">Channel</span>
              <span className="text-on-dark font-medium text-[14px]">WhatsApp</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-darkSoft text-[14px]">Target</span>
              <span className="bg-primary/20 text-primary px-2 py-1 rounded text-[12px] font-bold">Beauty Loyalists</span>
            </div>
          </div>
          
          <div className="product-ui-card-dark w-full max-w-sm absolute top-32 -left-12 transform rotate-[4deg] shadow-2xl opacity-90 border border-white/5">
             <div className="flex items-start gap-4">
               <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold">A</div>
               <div>
                 <p className="text-[14px] font-semibold text-on-dark">Generating Variants</p>
                 <p className="text-[13px] text-on-darkSoft mt-1">Drafting 2 high-conversion messages...</p>
                 <div className="w-3/4 h-2 bg-white/10 rounded-full mt-4 overflow-hidden">
                    <div className="w-1/2 h-full bg-primary rounded-full" />
                 </div>
               </div>
             </div>
          </div>
        </div>
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </section>

      {/* Feature Band Light */}
      <section className="bg-canvas px-8 py-section text-ink max-w-[1200px] mx-auto">
        <h2 className="text-[52px] font-display leading-[1.0] tracking-[-1.3px] mb-16 text-center">
          Institutional-grade infrastructure.
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card p-[32px] hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-surface-strong flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-[18px] font-semibold mb-3">Live Audience Syncer</h3>
            <p className="text-[16px] text-body">
              Syncs with your active customer base in real-time. Currently tracking <strong className="font-mono-numbers text-ink">{stats?.total || 500}</strong> high-value shoppers.
            </p>
          </div>
          
          <div className="card p-[32px] hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-surface-strong flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-[18px] font-semibold mb-3">Persona Intelligence</h3>
            <p className="text-[16px] text-body">
              Stop guessing segments. Our Gemini-powered engine maps business goals to exact historical customer profiles.
            </p>
          </div>

          <div className="card p-[32px] hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-surface-strong flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-[18px] font-semibold mb-3">Deterministic Analytics</h3>
            <p className="text-[16px] text-body">
              True conversion attribution. Watch <strong className="font-mono-numbers text-ink">{campaignsList.length}</strong> campaigns flow from Sent to Delivered to Purchased.
            </p>
          </div>
        </div>
      </section>
      
      {/* CTA Band */}
      <section className="bg-surface-dark text-on-dark py-section px-8 text-center border-t border-white/5">
        <h2 className="text-[44px] font-display leading-[1.09] tracking-[-1px] mb-8">
          Take control of your growth.
        </h2>
        <div className="flex justify-center gap-4">
          <Link href="/chat" className="btn-primary-large">
            Get Started
          </Link>
          <Link href="/customers" className="btn-ghost !text-on-dark !border-white/20 hover:!bg-white/10">
            View Customers
          </Link>
        </div>
      </section>
    </div>
  );
}
