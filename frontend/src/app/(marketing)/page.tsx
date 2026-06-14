'use client';

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Spark, ArrowRight, Activity, Cpu, CloudSync } from 'iconoir-react';

export default function MarketingPage() {
  const router = useRouter();

  const handleLaunch = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/opportunities');
  };

  return (
    <div className="bg-canvas min-h-screen text-body font-sans font-normal antialiased selection:bg-primary/10 selection:text-ink">
      
      {/* TOP NAVIGATION */}
      <nav className="h-16 flex items-center justify-between px-8 bg-canvas border-b border-hairline sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="font-display text-[20px] text-ink font-semibold tracking-tight">XenoCopilot</div>
          <div className="hidden md:flex items-center gap-6 text-[15px] font-medium text-body">
            <button className="hover:text-ink transition-colors">Platform</button>
            <button className="hover:text-ink transition-colors">Agents</button>
            <button className="hover:text-ink transition-colors">Use Cases</button>
            <button className="hover:text-ink transition-colors">Pricing</button>
            <button className="hover:text-ink transition-colors">Enterprise</button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-[15px] font-medium text-body hover:text-ink transition-colors hidden sm:block">Sign In</button>
          <button 
            onClick={handleLaunch}
            className="bg-primary text-on-primary rounded-pill px-5 py-2 text-[15px] font-medium hover:bg-primary-active transition-colors shadow-sm"
          >
            Try free
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-[120px] pb-[96px] flex flex-col items-center justify-center overflow-hidden">
        {/* Atmospheric Gradient Orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-lavender rounded-full blur-[100px] opacity-40 pointer-events-none z-0"></div>

        <div className="relative z-10 max-w-[800px] mx-auto text-center px-6 flex flex-col items-center">
          <h1 className="font-display text-[48px] md:text-[64px] font-normal text-ink leading-[1.05] tracking-[-1.92px] mb-6">
            Intelligence that uncovers revenue.
          </h1>
          <p className="text-[16px] text-body max-w-[600px] leading-[1.5] tracking-[0.16px] mb-10">
            XenoCopilot analyzes transactional data to discover dormant revenue, cross-sell paths, and churn risks—empowering growth teams to launch precision campaigns instantly.
          </p>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLaunch}
              className="bg-primary text-on-primary rounded-pill px-6 py-3 text-[15px] font-medium hover:bg-primary-active transition-colors shadow-sm"
            >
              Start analyzing data
            </button>
            <button className="border border-hairline-strong text-ink rounded-pill px-6 py-3 text-[15px] font-medium hover:bg-surface-strong transition-colors">
              Talk to sales
            </button>
          </div>
        </div>
      </section>

      {/* FEATURE CARDS (3-up) */}
      <section className="py-[96px] px-6 md:px-12 bg-canvas-soft border-y border-hairline">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="font-display text-[36px] font-normal text-ink leading-[1.17] tracking-[-0.36px] mb-12 text-center">
            The opportunity engine
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-card rounded-xl border border-hairline p-6 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-shadow duration-300">
              <div className="w-10 h-10 rounded-full bg-surface-strong flex items-center justify-center mb-6 text-ink">
                <Spark width={20} height={20} />
              </div>
              <h3 className="text-[20px] font-medium text-ink leading-[1.35] mb-2">Automated Discovery</h3>
              <p className="text-[16px] text-body leading-[1.5] tracking-[0.16px]">
                Scan millions of rows of historical purchase data to identify hidden high-value segments without writing SQL.
              </p>
            </div>
            <div className="bg-surface-card rounded-xl border border-hairline p-6 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-shadow duration-300">
              <div className="w-10 h-10 rounded-full bg-surface-strong flex items-center justify-center mb-6 text-ink">
                <Activity width={20} height={20} />
              </div>
              <h3 className="text-[20px] font-medium text-ink leading-[1.35] mb-2">Predictive Impact</h3>
              <p className="text-[16px] text-body leading-[1.5] tracking-[0.16px]">
                Know the expected ROI before launching. XenoCopilot calculates projected revenue and audience confidence dynamically.
              </p>
            </div>
            <div className="bg-surface-card rounded-xl border border-hairline p-6 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-shadow duration-300">
              <div className="w-10 h-10 rounded-full bg-surface-strong flex items-center justify-center mb-6 text-ink">
                <Cpu width={20} height={20} />
              </div>
              <h3 className="text-[20px] font-medium text-ink leading-[1.35] mb-2">Generative Campaigns</h3>
              <p className="text-[16px] text-body leading-[1.5] tracking-[0.16px]">
                Move from insight to action in seconds. Let the AI draft multi-channel copy tailored perfectly to the discovered segment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ATMOSPHERIC GRADIENT ORB CARD */}
      <section className="py-[96px] px-6 md:px-12 bg-canvas">
        <div className="max-w-[1200px] mx-auto relative overflow-hidden bg-canvas-soft rounded-xxl p-12 md:p-24 border border-hairline flex flex-col items-center justify-center text-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-mint rounded-full blur-[120px] opacity-30 pointer-events-none z-0"></div>
          
          <div className="relative z-10 max-w-[600px]">
            <div className="inline-block bg-surface-strong text-ink text-[12px] font-semibold uppercase tracking-[0.96px] rounded-pill px-3 py-1 mb-6">
              Data Pipeline
            </div>
            <h2 className="font-display text-[48px] font-normal text-ink leading-[1.08] tracking-[-0.96px] mb-6">
              Connect your infrastructure natively.
            </h2>
            <p className="text-[16px] text-body leading-[1.5] tracking-[0.16px]">
              Seamless integrations with Shopify, Postgres, and core CRM platforms ensure your opportunity intelligence is always running on real-time data.
            </p>
          </div>
        </div>
      </section>

      {/* PRE-FOOTER CTA */}
      <section className="py-[96px] px-6 text-center bg-canvas">
        <h2 className="font-display text-[36px] font-normal text-ink leading-[1.17] tracking-[-0.36px] mb-8">
          Find your hidden growth.
        </h2>
        <button 
          onClick={handleLaunch}
          className="bg-primary text-on-primary rounded-pill px-8 py-4 text-[15px] font-medium hover:bg-primary-active transition-colors shadow-sm"
        >
          Try free
        </button>
      </section>

      {/* FOOTER */}
      <footer className="bg-canvas border-t border-hairline py-16 px-6 md:px-12">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <div className="font-display text-[20px] text-ink font-semibold tracking-tight">XenoCopilot</div>
            <p className="text-[15px] text-body tracking-[0.15px]">© 2026 XenoCopilot Inc.</p>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-[15px] font-medium text-ink">Product</h4>
            <a href="#" className="text-[15px] text-body hover:text-ink transition-colors">Platform</a>
            <a href="#" className="text-[15px] text-body hover:text-ink transition-colors">Opportunity Engine</a>
            <a href="#" className="text-[15px] text-body hover:text-ink transition-colors">Campaign Drafts</a>
            <a href="#" className="text-[15px] text-body hover:text-ink transition-colors">Integrations</a>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-[15px] font-medium text-ink">Company</h4>
            <a href="#" className="text-[15px] text-body hover:text-ink transition-colors">About</a>
            <a href="#" className="text-[15px] text-body hover:text-ink transition-colors">Blog</a>
            <a href="#" className="text-[15px] text-body hover:text-ink transition-colors">Careers</a>
            <a href="#" className="text-[15px] text-body hover:text-ink transition-colors">Contact</a>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-[15px] font-medium text-ink">Resources</h4>
            <a href="#" className="text-[15px] text-body hover:text-ink transition-colors">Documentation</a>
            <a href="#" className="text-[15px] text-body hover:text-ink transition-colors">API Reference</a>
            <a href="#" className="text-[15px] text-body hover:text-ink transition-colors">Community</a>
            <a href="#" className="text-[15px] text-body hover:text-ink transition-colors">Help Center</a>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-[15px] font-medium text-ink">Legal</h4>
            <a href="#" className="text-[15px] text-body hover:text-ink transition-colors">Privacy</a>
            <a href="#" className="text-[15px] text-body hover:text-ink transition-colors">Terms</a>
            <a href="#" className="text-[15px] text-body hover:text-ink transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
