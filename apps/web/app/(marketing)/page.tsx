'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getCustomerStats, getCampaigns } from '@/lib/api';
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Rocket, Database, Brain, StatsReport } from 'iconoir-react';

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
  
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Hero Text Animations
    gsap.from('.hero-title', { 
      y: 40, 
      opacity: 0, 
      duration: 1, 
      stagger: 0.15, 
      ease: 'power3.out',
      delay: 0.2
    });
    
    gsap.from('.hero-subtitle', { 
      y: 20, 
      opacity: 0, 
      duration: 1, 
      delay: 0.6, 
      ease: 'power3.out' 
    });
    
    gsap.from('.hero-btn', { 
      y: 20, 
      opacity: 0, 
      duration: 1, 
      delay: 0.8, 
      ease: 'power3.out' 
    });

    // Decorative floating cards
    gsap.from('.hero-card-1', {
      x: 50,
      opacity: 0,
      duration: 1.2,
      delay: 0.4,
      ease: 'power3.out'
    });

    gsap.from('.hero-card-2', {
      x: -30,
      y: 50,
      opacity: 0,
      duration: 1.2,
      delay: 0.6,
      ease: 'power3.out'
    });

    // Continuous floating
    gsap.to('.hero-card-1', { 
      y: '-=15', 
      duration: 2, 
      yoyo: true, 
      repeat: -1, 
      ease: 'sine.inOut',
      delay: 1.6
    });
    
    gsap.to('.hero-card-2', { 
      y: '+=10', 
      duration: 2.5, 
      yoyo: true, 
      repeat: -1, 
      ease: 'sine.inOut', 
      delay: 1.8 
    });

    // Features Section Stagger
    gsap.from('.feature-card', {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power2.out',
      delay: 1.2
    });

  }, { scope: container });

  return (
    <div ref={container} className="min-h-screen bg-canvas overflow-x-hidden">
      {/* Navbar */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <Rocket className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[18px] text-white tracking-tight">XenoCopilot</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[14px] font-medium text-white/80">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#infrastructure" className="hover:text-white transition-colors">Infrastructure</a>
          <a href="#analytics" className="hover:text-white transition-colors">Analytics</a>
        </div>
        <div>
          <Link href="/chat" className="btn-primary px-5 py-2 hover:-translate-y-0.5 transition-transform">
            Go to CRM
          </Link>
        </div>
      </nav>

      {/* Hero Band Dark */}
      <section className="hero-band-dark min-h-[70vh] flex flex-col md:flex-row relative overflow-hidden items-center pt-20">
        <div className="w-full md:w-1/2 z-10 pl-8 md:pl-16 lg:pl-24">
          <h1 className="text-[64px] md:text-[80px] font-display font-bold leading-[1.0] tracking-[-2px] mb-6 flex flex-col">
            <span className="hero-title">Meet</span>
            <span className="hero-title bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">XenoCopilot.</span>
          </h1>
          <p className="hero-subtitle text-[18px] text-on-darkSoft max-w-md mb-8 leading-[1.5]">
            An AI-first campaign platform that connects directly to your customer database. Select a goal, and we handle the rest.
          </p>
          <div className="hero-btn">
            <Link href="/chat" className="btn-primary-large inline-flex shadow-lg hover:shadow-primary/20 transition-all hover:-translate-y-1">
              Start Building
            </Link>
          </div>
        </div>

        {/* Product UI Mockup */}
        <div className="w-full md:w-1/2 mt-12 md:mt-0 relative z-10 flex justify-end pr-8 md:pr-16">
          <div className="hero-card-1 product-ui-card-dark w-full max-w-md transform rotate-[-2deg] translate-y-8 relative shadow-2xl">
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
          
          <div className="hero-card-2 product-ui-card-dark w-full max-w-sm absolute top-32 -left-4 md:-left-12 transform rotate-[4deg] shadow-2xl opacity-90 border border-white/5 backdrop-blur-md">
             <div className="flex items-start gap-4">
               <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-white shadow-inner">A</div>
               <div>
                 <p className="text-[14px] font-semibold text-on-dark">Generating Variants</p>
                 <p className="text-[13px] text-on-darkSoft mt-1">Drafting 2 high-conversion messages...</p>
                 <div className="w-3/4 h-2 bg-white/10 rounded-full mt-4 overflow-hidden">
                    <div className="w-1/2 h-full bg-primary rounded-full relative overflow-hidden">
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </div>
                 </div>
               </div>
             </div>
          </div>
        </div>
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </section>

      {/* Feature Band Light */}
      <section id="features" className="features-section bg-canvas px-8 py-section text-ink max-w-[1200px] mx-auto">
        <h2 className="text-[40px] md:text-[52px] font-display leading-[1.0] tracking-[-1.3px] mb-16 text-center">
          Institutional-grade infrastructure.
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div id="infrastructure" className="feature-card card p-[32px] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-hairline">
            <div className="w-12 h-12 rounded-full bg-surface-strong flex items-center justify-center mb-6 text-primary">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-[18px] font-semibold mb-3">Live Audience Syncer</h3>
            <p className="text-[16px] text-body">
              Syncs with your active customer base in real-time. Currently tracking <strong className="font-mono-numbers text-ink">{stats?.total || 500}</strong> high-value shoppers.
            </p>
          </div>
          
          <div className="feature-card card p-[32px] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-hairline">
            <div className="w-12 h-12 rounded-full bg-surface-strong flex items-center justify-center mb-6 text-primary">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-[18px] font-semibold mb-3">Persona Intelligence</h3>
            <p className="text-[16px] text-body">
              Stop guessing segments. Our Gemini-powered engine maps business goals to exact historical customer profiles.
            </p>
          </div>

          <div id="analytics" className="feature-card card p-[32px] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-hairline">
            <div className="w-12 h-12 rounded-full bg-surface-strong flex items-center justify-center mb-6 text-primary">
              <StatsReport className="w-6 h-6" />
            </div>
            <h3 className="text-[18px] font-semibold mb-3">Deterministic Analytics</h3>
            <p className="text-[16px] text-body">
              True conversion attribution. Watch <strong className="font-mono-numbers text-ink">{campaignsList.length}</strong> campaigns flow from Sent to Delivered to Purchased.
            </p>
          </div>
        </div>
      </section>
      
      {/* CTA Band */}
      <section className="bg-surface-dark text-on-dark py-section px-8 text-center border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-[36px] md:text-[44px] font-display leading-[1.09] tracking-[-1px] mb-8">
            Take control of your growth.
          </h2>
          <div className="flex justify-center gap-4">
            <Link href="/chat" className="btn-primary-large hover:-translate-y-1 transition-transform shadow-lg">
              Go to CRM
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
