'use client';

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import DotGrid from '@/components/ui/DotGrid';
import { clsx } from 'clsx';
import { Search, Spark, ArrowRight, ArrowUp, ArrowDown } from 'iconoir-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

// Premium Enterprise Background
const GridBackground = () => (
  <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
    <div 
      className="absolute inset-0"
      style={{
        maskImage: 'linear-gradient(to bottom, black 0%, transparent 65%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 65%)',
      }}
    >
      <DotGrid
        dotSize={4}
        gap={32}
        baseColor="#E2E8F0"
        activeColor="#2563EB"
        proximity={150}
        shockRadius={250}
        shockStrength={4}
        resistance={700}
        returnDuration={1.2}
      />
    </div>
    <div 
      className="absolute bottom-0 left-1/2 -translate-x-1/2"
      style={{
        width: '800px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, rgba(37,99,235,0.04) 40%, transparent 70%)',
        filter: 'blur(80px)',
      }}
    />
  </div>
);

export default function LandingPage() {
  const container = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useGSAP(() => {
    // Sticky Header Reveal (after 150px)
    ScrollTrigger.create({
      start: 150,
      onEnter: () => gsap.to('.sticky-header', { opacity: 1, pointerEvents: 'auto', duration: 0.3 }),
      onLeaveBack: () => gsap.to('.sticky-header', { opacity: 0, pointerEvents: 'none', duration: 0.3 }),
    });

    // Hero Entry Animation (Lightweight)
    gsap.fromTo('.hero-fade', 
      { opacity: 0, y: 15 }, 
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out' }
    );

    // Number Tickers
    const counters = gsap.utils.toArray('.counter-val') as HTMLElement[];
    counters.forEach((el) => {
      const target = parseFloat(el.getAttribute('data-target') || '0');
      const prefix = el.getAttribute('data-prefix') || '';
      const suffix = el.getAttribute('data-suffix') || '';
      
      gsap.to(el, {
        innerHTML: target,
        duration: 2,
        ease: 'power3.out',
        snap: { innerHTML: target > 100 ? 1 : 0.1 },
        onUpdate: function() {
          let val = Number(this.targets()[0].innerHTML);
          if (target === 17.2) {
            this.targets()[0].innerHTML = prefix + val.toFixed(1) + suffix;
          } else {
            this.targets()[0].innerHTML = prefix + Math.round(val).toLocaleString('en-US') + suffix;
          }
        },
        delay: 0.5
      });
    });

    // Fade up sections on scroll
    gsap.utils.toArray('.scroll-fade-up').forEach((el: any) => {
      gsap.fromTo(el, 
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } }
      );
    });

  }, { scope: container });

  const handleLaunch = (e: React.MouseEvent) => {
    e.preventDefault();
    gsap.to('.hero-fade', {
      opacity: 0, y: -15, duration: 0.4, stagger: 0.05, ease: 'power2.in',
      onComplete: () => router.push('/opportunities')
    });
  };

  const handleScrollToOpp = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('opportunity-engine');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div ref={container} className="bg-canvas min-h-screen font-sans selection:bg-[#2563EB]/20 overflow-x-hidden">
      
      {/* ---------------------------------------- */}
      {/* STICKY HEADER */}
      {/* ---------------------------------------- */}
      <header className="sticky-header opacity-0 pointer-events-none fixed top-0 left-0 right-0 h-[64px] bg-canvas/90 backdrop-blur-md border-b border-hairline z-50 flex items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <img src="/XC.png" alt="XC Logo" className="h-6 w-auto" />
          <span className="font-semibold text-[15px] tracking-tight text-ink">XenoCopilot</span>
        </div>
        <button onClick={handleLaunch} className="btn-primary">
          Launch XenoCopilot
        </button>
      </header>

      {/* ---------------------------------------- */}
      {/* SECTION 1: HERO */}
      {/* ---------------------------------------- */}
      <section className="relative flex flex-col items-center justify-start px-8 md:px-24 pt-32 pb-24 text-center">
        <GridBackground />
        
        <div className="relative z-10 max-w-[1400px] flex flex-col items-center w-full">
          
          {/* Label */}
          <div className="hero-fade text-primary text-[12px] font-bold tracking-[0.15em] uppercase mb-8">
            AI Revenue Intelligence Platform
          </div>

          {/* Headline */}
          <h1 className="hero-fade text-[52px] md:text-[72px] lg:text-[88px] font-bold leading-[1.05] text-ink mb-10 w-full max-w-5xl tracking-tight">
            Your data hides <span className="text-primary">growth</span>.
            <br />
            <span className="text-primary">XenoCopilot</span> finds it.
          </h1>
          
          {/* Supporting Copy */}
          <div className="hero-fade max-w-[700px] mb-12">
            <p className="text-[20px] text-ink-muted leading-relaxed">
              Discover dormant revenue, identify churn risks, predict campaign performance, and uncover high-value customer opportunities before they are missed.
            </p>
          </div>

          {/* CTA Row */}
          <div className="hero-fade flex flex-col sm:flex-row justify-center gap-4 w-full max-w-[480px] mb-16">
            <button onClick={handleLaunch} className="flex-1 btn-primary py-4 text-[16px]">
              Launch XenoCopilot
            </button>
            <button onClick={handleScrollToOpp} className="flex-1 btn-secondary py-4 text-[16px]">
              View Opportunity Analysis
            </button>
          </div>

          {/* Trust Metrics Row */}
          <div className="hero-fade grid grid-cols-2 md:grid-cols-4 w-full max-w-5xl border-y border-hairline py-8 bg-canvas-soft/80 backdrop-blur-md rounded-2xl relative z-20">
            <div className="px-8 border-r border-hairline flex flex-col items-center">
              <div className="text-[40px] font-bold text-ink flex items-baseline gap-1 tracking-tight">
                <span className="counter-val font-mono-numbers" data-target="17.2" data-prefix="₹" data-suffix="L">₹0</span>
              </div>
              <div className="text-[13px] font-semibold text-ink-muted mt-1">Recoverable Revenue</div>
            </div>
            <div className="px-8 md:border-r border-hairline flex flex-col items-center">
              <div className="text-[40px] font-bold text-ink counter-val font-mono-numbers tracking-tight" data-target="428">0</div>
              <div className="text-[13px] font-semibold text-ink-muted mt-1">Dormant Customers</div>
            </div>
            <div className="px-8 border-r border-hairline flex flex-col items-center">
              <div className="text-[40px] font-bold text-ink counter-val font-mono-numbers tracking-tight" data-target="98">0</div>
              <div className="text-[13px] font-semibold text-ink-muted mt-1">At-Risk VIPs</div>
            </div>
            <div className="px-8 flex flex-col items-center">
              <div className="text-[40px] font-bold text-ink counter-val font-mono-numbers tracking-tight" data-target="126">0</div>
              <div className="text-[13px] font-semibold text-ink-muted mt-1">Cross-Sell Opportunities</div>
            </div>
          </div>
          
        </div>
      </section>

      {/* ---------------------------------------- */}
      {/* SECTION 2: PRODUCT PREVIEW SHOWCASE */}
      {/* ---------------------------------------- */}
      <section className="scroll-fade-up relative z-20 -mt-10 mb-32 px-4 md:px-12 flex justify-center w-full">
        <div className="w-full max-w-[1200px] bg-canvas rounded-xl shadow-2xl border border-hairline overflow-hidden flex flex-col h-[700px]">
          {/* Browser Header */}
          <div className="h-12 bg-canvas-soft border-b border-hairline flex items-center px-4 gap-2">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-semantic-danger/80"></div>
              <div className="w-3 h-3 rounded-full bg-semantic-warning/80"></div>
              <div className="w-3 h-3 rounded-full bg-semantic-success/80"></div>
            </div>
            <div className="mx-auto flex items-center justify-center h-7 px-4 rounded bg-canvas border border-hairline w-[300px] text-[12px] text-ink-muted shadow-sm">
              app.xenocopilot.com/revenue
            </div>
          </div>
          
          {/* App Layout Replica */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <div className="w-[280px] bg-surface-card border-r border-hairline flex flex-col py-6 px-4 shrink-0">
               <div className="text-primary font-bold text-[18px] mb-8 px-2 tracking-tight">XenoCopilot</div>
               <div className="flex flex-col gap-1 mb-6">
                 <div className="text-[12px] font-bold text-ink-muted/70 uppercase tracking-wider mb-2 px-2">Growth</div>
                 <div className="px-2 py-2 bg-primary/10 text-primary font-semibold rounded-md text-[14px]">Revenue Opportunities</div>
                 <div className="px-2 py-2 text-ink-muted hover:bg-hairline rounded-md text-[14px] font-medium">Campaign Copilot</div>
               </div>
               <div className="flex flex-col gap-1">
                 <div className="text-[12px] font-bold text-ink-muted/70 uppercase tracking-wider mb-2 px-2">Customers</div>
                 <div className="px-2 py-2 text-ink-muted hover:bg-hairline rounded-md text-[14px] font-medium">Customer Intelligence</div>
                 <div className="px-2 py-2 text-ink-muted hover:bg-hairline rounded-md text-[14px] font-medium">Personas</div>
               </div>
            </div>
            {/* Main Content (Opportunities Replica) */}
            <div className="flex-1 bg-canvas p-8 overflow-hidden flex flex-col gap-6">
               <div className="flex items-end justify-between border-b border-hairline pb-4">
                 <div>
                   <h1 className="text-[28px] font-bold text-ink">Revenue Opportunities</h1>
                   <p className="text-[14px] text-ink-muted mt-1">High-conviction audiences with expected revenue impact.</p>
                 </div>
                 <button className="btn-primary">Generate Campaigns</button>
               </div>

               <div className="grid grid-cols-3 gap-6">
                 <div className="card flex flex-col gap-1 p-5">
                   <span className="label-text">Total Potential Revenue</span>
                   <span className="text-[28px] font-bold text-ink font-mono-numbers">₹34,500</span>
                 </div>
                 <div className="card flex flex-col gap-1 p-5">
                   <span className="label-text">Active Opportunities</span>
                   <span className="text-[28px] font-bold text-ink font-mono-numbers">12</span>
                 </div>
                 <div className="card flex flex-col gap-1 p-5">
                   <span className="label-text">High Confidence (&gt;80%)</span>
                   <span className="text-[28px] font-bold text-ink font-mono-numbers">5</span>
                 </div>
               </div>

               <div className="table-container flex-1">
                 <table className="table-enterprise">
                   <thead>
                     <tr>
                       <th>Opportunity Goal</th>
                       <th>Target Audience</th>
                       <th>Confidence</th>
                       <th className="text-right">Expected Revenue</th>
                     </tr>
                   </thead>
                   <tbody>
                     <tr className="cursor-pointer hover:bg-canvas-soft">
                       <td className="font-semibold text-ink">Recover Dormant VIPs</td>
                       <td className="font-mono-numbers">428 Users</td>
                       <td><span className="text-semantic-success font-semibold">92%</span></td>
                       <td className="text-right font-mono-numbers font-medium text-ink">₹17,200</td>
                     </tr>
                     <tr className="cursor-pointer hover:bg-canvas-soft">
                       <td className="font-semibold text-ink">Cross-Sell Premium Skincare</td>
                       <td className="font-mono-numbers">126 Users</td>
                       <td><span className="text-semantic-success font-semibold">86%</span></td>
                       <td className="text-right font-mono-numbers font-medium text-ink">₹8,100</td>
                     </tr>
                     <tr className="cursor-pointer hover:bg-canvas-soft">
                       <td className="font-semibold text-ink">Prevent Churn - Discount Seekers</td>
                       <td className="font-mono-numbers">1,240 Users</td>
                       <td><span className="text-semantic-warning font-semibold">74%</span></td>
                       <td className="text-right font-mono-numbers font-medium text-ink">₹5,400</td>
                     </tr>
                     <tr className="cursor-pointer hover:bg-canvas-soft">
                       <td className="font-semibold text-ink">Upsell Subscription - Beauty Loyalists</td>
                       <td className="font-mono-numbers">85 Users</td>
                       <td><span className="text-semantic-warning font-semibold">68%</span></td>
                       <td className="text-right font-mono-numbers font-medium text-ink">₹2,300</td>
                     </tr>
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------- */}
      {/* SECTION 3: SOCIAL PROOF / CAPABILITIES */}
      {/* ---------------------------------------- */}
      <section className="scroll-fade-up py-16 bg-white border-y border-hairline">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center text-[13px] font-bold text-ink-muted uppercase tracking-widest mb-8">
            Platform Core Capabilities
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {['AI Opportunity Discovery', 'Campaign Simulation', 'Customer Intelligence', 'Revenue Attribution', 'Persona Analytics', 'Predictive Retention'].map(cap => (
              <div key={cap} className="px-5 py-3 border border-hairline rounded-lg bg-canvas text-[14px] font-medium text-ink shadow-sm flex items-center gap-2">
                <Spark height={16} width={16} className="text-primary" />
                {cap}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------- */}
      {/* SECTION 4: OPPORTUNITY ENGINE DEEP DIVE */}
      {/* ---------------------------------------- */}
      <section id="opportunity-engine" className="scroll-fade-up py-32 px-8 md:px-24 bg-canvas-soft">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1">
             <h2 className="text-[40px] font-bold text-ink tracking-tight mb-6">
               Stop guessing.<br/>Start generating.
             </h2>
             <p className="text-[18px] text-ink-muted leading-relaxed mb-8">
               Our AI continuously analyzes transactional and behavioral data to uncover your most profitable segments. We don't just give you data—we give you actionable revenue opportunities.
             </p>
             <button onClick={handleLaunch} className="btn-primary text-[15px] px-6 py-3">Explore Opportunities</button>
          </div>

          <div className="flex-1 flex flex-col gap-4 w-full">
            <div className="bg-canvas border border-hairline rounded-xl p-6 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-semantic-success"></div>
               <div className="flex justify-between items-start mb-6">
                 <div>
                   <h3 className="text-[18px] font-semibold text-ink">Dormant Customer Recovery</h3>
                   <p className="text-[14px] text-ink-muted mt-1">High-value customers who haven't purchased in 90+ days.</p>
                 </div>
                 <div className="bg-semantic-success/10 text-semantic-success px-2.5 py-1 rounded text-[13px] font-bold">92% Confidence</div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <div className="text-[12px] font-bold text-ink-muted uppercase tracking-wider mb-1">Target Audience</div>
                   <div className="text-[20px] font-mono-numbers font-semibold text-ink">428</div>
                 </div>
                 <div>
                   <div className="text-[12px] font-bold text-primary uppercase tracking-wider mb-1">Expected Revenue</div>
                   <div className="text-[20px] font-mono-numbers font-bold text-primary">₹17,200</div>
                 </div>
               </div>
            </div>

            <div className="bg-canvas border border-hairline rounded-xl p-6 shadow-sm relative overflow-hidden opacity-70 scale-[0.98] origin-top">
               <div className="absolute top-0 left-0 w-1 h-full bg-semantic-success"></div>
               <div className="flex justify-between items-start mb-6">
                 <div>
                   <h3 className="text-[18px] font-semibold text-ink">VIP Cross-Sell Expansion</h3>
                   <p className="text-[14px] text-ink-muted mt-1">Loyal buyers highly likely to purchase premium bundles.</p>
                 </div>
                 <div className="bg-semantic-success/10 text-semantic-success px-2.5 py-1 rounded text-[13px] font-bold">86% Confidence</div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <div className="text-[12px] font-bold text-ink-muted uppercase tracking-wider mb-1">Target Audience</div>
                   <div className="text-[20px] font-mono-numbers font-semibold text-ink">126</div>
                 </div>
                 <div>
                   <div className="text-[12px] font-bold text-primary uppercase tracking-wider mb-1">Expected Revenue</div>
                   <div className="text-[20px] font-mono-numbers font-bold text-primary">₹8,100</div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------- */}
      {/* SECTION 5: FINAL CTA */}
      {/* ---------------------------------------- */}
      <section className="scroll-fade-up py-40 px-8 flex flex-col items-center justify-center text-center bg-white border-t border-hairline">
        <h2 className="text-[48px] md:text-[64px] font-bold text-ink tracking-tight mb-8 max-w-3xl leading-[1.05]">
          428 dormant customers.<br/>
          <span className="text-primary">₹17.2L recoverable revenue.</span>
        </h2>
        <p className="text-[20px] text-ink-muted mb-12 max-w-xl font-medium">
          Your database already knows where growth exists. Let AI uncover it.
        </p>
        
        <button onClick={handleLaunch} className="bg-primary text-white px-10 py-5 rounded-xl font-semibold text-[18px] hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
          Enter Revenue Intelligence Portal
        </button>
      </section>

    </div>
  );
}
