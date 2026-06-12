'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import { Search, Play, EditPencil, Clock, CheckCircle, Plus, Filter, LayoutRight, MessageText, ArrowRight, ShieldCheck, Mail, SmartphoneDevice, HeadsetHelp, Phone, VideoCamera, MoreHoriz, Emoji, Camera, Attachment, SendDiagonal, Xmark } from 'iconoir-react';
import { clsx } from 'clsx';

function HighlightedMessage({ text }: { text: string }) {
  if (!text) return null;
  const parts = text.split(/(\{\{[^}]+\}\})/g);
  
  const mockDataMap: Record<string, string> = {
    first_name: 'Rahul',
    favorite_category: 'Skincare Serums',
    last_purchase_days: '64',
  };

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('{{') && part.endsWith('}}')) {
          const variable = part.slice(2, -2).trim();
          const mockValue = mockDataMap[variable] || '...';
          return (
            <span
              key={i}
              className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200 font-semibold text-[0.95em] mx-0.5 whitespace-nowrap"
              title={`Variable: {{${variable}}}`}
            >
              {mockValue}
            </span>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
}

function CampaignStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const audienceParam = searchParams.get('audience');

  const [goal, setGoal] = useState(audienceParam || '');
  const [submittedGoal, setSubmittedGoal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeVariant, setActiveVariant] = useState('A');
  const hasAutoSubmitted = useRef(false);

  useEffect(() => {
    if (audienceParam && !hasAutoSubmitted.current && !isGenerating && !submittedGoal) {
      hasAutoSubmitted.current = true;
      handleCommandSubmit();
    }
  }, [audienceParam]);
  const [selectedChannel, setSelectedChannel] = useState('WhatsApp');
  const [isLaunching, setIsLaunching] = useState(false);
  const [strategyResult, setStrategyResult] = useState<any>(null);

  const handleCommandSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!goal.trim() || isGenerating) return;
    setIsGenerating(true);

    try {
      // 1. Dynamic Segmentation & SQL Query
      const segmentRes = await fetchAPI<any>('/api/ai/segment', {
        method: 'POST',
        body: JSON.stringify({ goal })
      });
      
      const count = segmentRes.count;

      // 2. Draft Messages
      const msgRes = await fetchAPI<any>('/api/ai/draft-messages', {
        method: 'POST',
        body: JSON.stringify({ persona_name: segmentRes.name, channel: segmentRes.channel })
      });

      setStrategyResult({
        persona: { name: segmentRes.name, id: segmentRes.id },
        count,
        channel: segmentRes.channel,
        expectedRevenue: segmentRes.expectedRevenue,
        expectedPurchasers: segmentRes.expectedPurchasers,
        conversionRate: segmentRes.conversionRate,
        audienceMatch: segmentRes.audienceMatch,
        variants: [
          { version: 'A', text: msgRes.variantA || "Your favorite products are back in stock." },
          { version: 'B', text: msgRes.variantB || "Special offer inside for our best customers." }
        ]
      });
      setSelectedChannel(segmentRes.channel);
      setActiveVariant('A');
      setSubmittedGoal(true);
    } catch (err: any) {
      console.error(err);
      alert(`Failed to generate campaign strategy: ${err.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpportunityClick = (opportunityTitle: string) => {
    setGoal(opportunityTitle);
    // Note: React state setter for `goal` is async. We pass the explicit title here.
    const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
    // We need to bypass the `goal` state dependency for the immediate click, 
    // so we temporarily set goal then call submit, but to avoid race conditions, 
    // we'll let a useEffect handle it or we could pass the string. 
    // To keep it simple, we just set the goal and user presses enter. 
    // Actually, I'll update the handleCommandSubmit to optionally take a string, or we just let it use state.
    // Let's just set the goal and simulate submit safely.
  };

  // We will run the submit when `goal` changes from opportunity click
  React.useEffect(() => {
    if (goal && submittedGoal === false && isGenerating === false && document.activeElement?.tagName !== 'INPUT' && !hasAutoSubmitted.current) {
        // If a preset was clicked (focus not on input), we can submit it.
        handleCommandSubmit();
    }
  }, [goal, submittedGoal, isGenerating]);

  // Real launch handler
  const handleLaunch = async () => {
    setIsLaunching(true);
    try {
      const activeMessage = strategyResult?.variants?.find((v: any) => v.version === activeVariant)?.text || "Hello";
      const data = await fetchAPI<any>('/api/ai/launch-campaign', {
        method: 'POST',
        body: JSON.stringify({
          name: goal || 'Generated Campaign',
          channel: selectedChannel,
          message: activeMessage,
          persona_id: strategyResult?.persona?.id
        })
      });
      if (data.campaign_id) {
        router.push(`/engagement/${data.campaign_id}`);
      } else {
        setIsLaunching(false);
        alert('Failed to launch campaign. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setIsLaunching(false);
      alert('Network error occurred.');
    }
  };

  const handleReset = () => {
    setGoal('');
    setSubmittedGoal(false);
    setStrategyResult(null);
    setSelectedChannel('WhatsApp');
    setActiveVariant('A');
    hasAutoSubmitted.current = false;
  };

  return (
    <div className="flex w-full min-h-screen bg-slate-50 justify-center">
      <div className="w-full max-w-[1300px] px-8 py-8 flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col gap-1">
            <h1 className="text-[32px] font-bold text-slate-900 leading-none tracking-tight">Campaign Studio</h1>
            <p className="text-[14px] text-slate-500">Plan, personalize, and launch revenue campaigns.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-[13px] font-semibold text-slate-600 hover:text-slate-900 transition-colors">Recent Campaigns</button>
            <button className="text-[13px] font-semibold text-slate-600 hover:text-slate-900 transition-colors">Saved Audiences</button>
            <button className="flex items-center gap-1.5 text-[13px] font-bold bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-md transition-colors shadow-sm">
              <Plus height={16} width={16} /> New Campaign
            </button>
          </div>
        </div>

        {/* ── IMPROVEMENT 1: Goal Command Bar with Send Button ── */}
        <div className="w-full mb-2">
          <form onSubmit={handleCommandSubmit} className="relative group">
            <Search height={18} width={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="What are you trying to achieve? (e.g. Recover dormant VIP customers)"
              className="w-full bg-white border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl pl-12 pr-16 py-4 text-[15px] text-slate-900 font-medium placeholder-slate-400 transition-all outline-none shadow-sm"
            />
            {/* Send button */}
            <button
              type="submit"
              disabled={!goal.trim() || isGenerating}
              className={clsx(
                "absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm",
                goal.trim() && !isGenerating
                  ? "bg-blue-600 hover:bg-blue-700 active:scale-95 text-white"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              )}
            >
              {isGenerating ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <SendDiagonal height={16} width={16} />
              )}
            </button>
          </form>
        </div>

        {!submittedGoal ? (
          /* Empty State: Recommended Opportunities */
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <span className="text-[12px] font-bold text-slate-900 uppercase tracking-wider">Recommended Opportunities</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Dormant VIP Recovery', rev: '₹1,72,000', cust: 428, conf: '82%' },
                { title: 'VIP Retention', rev: '₹1,25,000', cust: 98, conf: '89%' },
                { title: 'Cross-Sell Expansion', rev: '₹81,000', cust: 126, conf: '74%' }
              ].map((opp, idx) => (
                <div key={idx} onClick={() => handleOpportunityClick(opp.title)} className="border border-slate-200 rounded-xl p-5 flex flex-col gap-4 bg-white hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex justify-between items-start">
                    <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{opp.title}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase">Revenue</span>
                      <span className="text-[15px] font-bold text-slate-900 font-mono">{opp.rev}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase">Customers</span>
                      <span className="text-[15px] font-bold text-slate-900 font-mono">{opp.cust}</span>
                    </div>
                  </div>
                  <div className="pt-4 mt-auto border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[12px] font-bold text-slate-500 font-mono">{opp.conf} Confidence</span>
                    <span className="text-[12px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1">Create <ArrowRight height={12} width={12} /></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Active State: 12-Column Grid Layout */
          <div className="grid grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">

            {/* ── 8-Column Campaign Workspace ── */}
            <div className="col-span-8 flex flex-col gap-8 pb-12">

              {/* Command Bar Intent */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-center shadow-sm justify-between">
                 <div className="flex gap-8 items-center">
                   <div className="flex flex-col gap-1 border-r border-blue-200 pr-8">
                      <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">Goal</span>
                      <span className="text-[14px] font-bold text-slate-900 line-clamp-1">{goal}</span>
                   </div>
                   <div className="flex flex-col gap-1 border-r border-blue-200 pr-8">
                      <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">Detected Audience</span>
                      <span className="text-[14px] font-medium text-slate-800">{strategyResult?.persona?.name || 'Loading...'}</span>
                   </div>
                   <div className="flex flex-col gap-1 border-r border-blue-200 pr-8">
                      <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">Matched Customers</span>
                      <span className="text-[14px] font-bold text-slate-900 font-mono-numbers">{strategyResult?.count || 0}</span>
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">Recommended Channel</span>
                      <span className="text-[14px] font-medium text-slate-800">{strategyResult?.channel || '...'}</span>
                   </div>
                 </div>
                 <button 
                   onClick={handleReset} 
                   className="bg-blue-100/70 hover:bg-blue-200 text-blue-700 font-bold px-3 py-1.5 rounded-lg text-[12px] transition-colors flex items-center gap-1.5 shadow-sm ml-4 whitespace-nowrap"
                 >
                   <Xmark height={14} width={14} /> Reset Session
                 </button>
              </div>

              {/* Strategy Summary */}
              <div className="flex flex-col gap-3">
                <span className="text-[12px] font-bold text-slate-900 uppercase tracking-wider">Strategy Summary</span>
                <div className="grid grid-cols-5 gap-4">
                  <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">Target Audience</span>
                    <span className="text-[16px] font-bold text-slate-900">{strategyResult?.persona?.name || '...'}</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">Audience Size</span>
                    <span className="text-[20px] font-bold text-slate-900 font-mono">{strategyResult?.count || 0}</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">Potential Revenue</span>
                    <span className="text-[20px] font-bold text-emerald-600 font-mono">₹{(strategyResult?.expectedRevenue || 0).toLocaleString()}</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">Recommended Channel</span>
                    <span className="text-[18px] font-bold text-slate-900">{strategyResult?.channel || '...'}</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">Expected Conversion</span>
                    <span className="text-[20px] font-bold text-slate-900 font-mono">{strategyResult ? (strategyResult.count > 0 ? ((strategyResult.expectedPurchasers / strategyResult.count) * 100).toFixed(1) : 0) : 0}%</span>
                  </div>
                </div>
              </div>

              {/* Channel Planner Table */}
              <div className="flex flex-col gap-3">
                <span className="text-[12px] font-bold text-slate-900 uppercase tracking-wider">Channel Planner</span>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Channel</th>
                        <th className="py-2.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Expected Revenue</th>
                        <th className="py-2.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Expected Conv.</th>
                        <th className="py-2.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Audience Match</th>
                        <th className="py-2.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Cost Estimate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { ch: 'WhatsApp', icon: MessageText, color: 'text-[#25D366]', rev: strategyResult?.expectedRevenue || 0, conv: strategyResult && strategyResult.count > 0 ? ((strategyResult.expectedPurchasers / strategyResult.count) * 100) : 0, match: 'High', cost: '₹4,500' },
                        { ch: 'Email',    icon: Mail, color: 'text-[#7C3AED]', rev: Math.round((strategyResult?.expectedRevenue || 0) * 0.4), conv: strategyResult && strategyResult.count > 0 ? (((strategyResult.expectedPurchasers / strategyResult.count) * 100) * 0.4) : 0, match: 'Medium', cost: '₹120' },
                        { ch: 'SMS',      icon: SmartphoneDevice, color: 'text-[#2563EB]', rev: Math.round((strategyResult?.expectedRevenue || 0) * 0.2), conv: strategyResult && strategyResult.count > 0 ? (((strategyResult.expectedPurchasers / strategyResult.count) * 100) * 0.2) : 0, match: 'Low', cost: '₹1,200' },
                      ].map(row => {
                        const isRecommended = row.ch === (strategyResult?.channel || 'WhatsApp');
                        return (
                          <tr key={row.ch} className={clsx(selectedChannel === row.ch ? 'bg-blue-50/30' : 'hover:bg-slate-50/60', 'cursor-pointer transition-colors')} onClick={() => setSelectedChannel(row.ch)}>
                            <td className="py-3 px-4 text-[13px] font-bold text-slate-900 flex items-center gap-2">
                              <row.icon height={16} width={16} className={isRecommended ? row.color : "text-slate-400"} />
                              {row.ch}
                              {isRecommended && <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Rec</span>}
                            </td>
                            <td className="py-3 px-4 text-[13px] font-bold text-slate-900 font-mono text-right">₹{row.rev.toLocaleString('en-IN')}</td>
                            <td className="py-3 px-4 text-[13px] font-bold text-slate-900 font-mono text-right">{row.conv.toFixed(1)}%</td>
                            <td className="py-3 px-4 text-[13px] font-bold text-slate-500 font-mono text-right">{row.match}</td>
                            <td className="py-3 px-4 text-[13px] font-bold text-slate-500 font-mono text-right">{row.cost}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Message Experience Hero */}
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-[12px] font-bold text-slate-900 uppercase tracking-wider">Message Experience</span>
                </div>

                {/* Top Control Bar */}
                <div className="flex flex-col gap-3 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-6">
                    {/* Channel Tabs */}
                    <div className="flex items-center gap-5 border-r border-slate-200 pr-6">
                      {[
                        { id: 'WhatsApp', icon: MessageText, color: 'text-[#25D366]' },
                        { id: 'Email',    icon: Mail,        color: 'text-[#7C3AED]' },
                        { id: 'SMS',      icon: SmartphoneDevice, color: 'text-[#2563EB]' },
                        { id: 'Call Script', icon: HeadsetHelp, color: 'text-[#F59E0B]' },
                      ].map(c => {
                        const Icon = c.icon;
                        const isActive = selectedChannel === c.id;
                        return (
                          <button
                            key={c.id}
                            onClick={() => setSelectedChannel(c.id)}
                            className={clsx(
                              "flex items-center gap-1.5 pb-1.5 text-[13px] font-semibold border-b-2 transition-colors",
                              isActive
                                ? `border-slate-900 text-slate-900`
                                : "border-transparent text-slate-500 hover:text-slate-800"
                            )}
                          >
                            <Icon height={15} width={15} className={isActive ? c.color : ''} /> {c.id}
                          </button>
                        );
                      })}
                    </div>

                    {/* Variant Tabs */}
                    <div className="inline-flex bg-slate-100 p-1 rounded-lg">
                      {['A', 'B', 'C'].map(v => {
                        const isActive = activeVariant === v;
                        return (
                          <button
                            key={v}
                            onClick={() => setActiveVariant(v)}
                            className={clsx(
                              "px-4 py-1.5 text-[13px] font-semibold rounded-md transition-all flex items-center gap-1.5",
                              isActive ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"
                            )}
                          >
                            Variant {v}
                            {v === 'A' && <span className="text-[10px] bg-slate-200 text-slate-700 px-1 py-0.5 rounded font-bold uppercase tracking-wider">Rec</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Variant Metrics Row */}
                  <div className="flex items-center gap-6 bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase">Revenue Potential</span>
                      <span className="text-[14px] font-bold text-slate-900 font-mono">₹{(strategyResult?.expectedRevenue || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex flex-col pl-6 border-l border-slate-200">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase">Expected Conversion</span>
                      <span className="text-[14px] font-bold text-slate-900 font-mono">{strategyResult ? (strategyResult.count > 0 ? ((strategyResult.expectedPurchasers / strategyResult.count) * 100).toFixed(1) : 0) : 0}%</span>
                    </div>
                    <div className="flex flex-col pl-6 border-l border-slate-200">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase">Audience Match</span>
                      <span className="text-[14px] font-bold text-emerald-600 font-mono">High</span>
                    </div>
                  </div>
                </div>

                {/* ── CHANNEL PREVIEWS ── */}
                <div className="bg-slate-100 border border-slate-200 rounded-xl flex items-start justify-center p-8 overflow-hidden min-h-[480px]">

                  {/* ── IMPROVEMENT 2: WhatsApp ── */}
                  {selectedChannel === 'WhatsApp' && (
                    <div className="w-full max-w-[340px] bg-white rounded-2xl shadow-md border border-slate-200 flex flex-col overflow-hidden">
                      {/* WA Header */}
                      <div className="bg-[#128C7E] px-4 py-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0">BC</div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-[14px] font-bold text-white flex items-center gap-1">
                            Beauty Co.
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#25D366" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="white" /></svg>
                          </span>
                          <span className="text-[11px] text-white/70">Business Account</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/80">
                          <Phone height={17} width={17} />
                          <VideoCamera height={17} width={17} />
                          <MoreHoriz height={17} width={17} />
                        </div>
                      </div>

                      {/* Chat Background */}
                      <div
                        className="flex-1 p-4 flex flex-col gap-3 min-h-[280px]"
                        style={{ background: '#e5ddd5', backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
                      >
                        <div className="self-center bg-[#ffffffcc] px-3 py-1 rounded-full">
                          <span className="text-[11px] font-semibold text-slate-600">TODAY 11:32 AM</span>
                        </div>

                        {/* Incoming bubble */}
                        <div className="self-start bg-white rounded-xl rounded-tl-sm p-3 max-w-[85%] shadow-sm flex flex-col gap-2">
                          <p className="text-[13px] text-slate-800 leading-relaxed whitespace-pre-wrap">
                            <HighlightedMessage text={strategyResult?.variants?.find((v: any) => v.version === activeVariant)?.text || "Your favorite products are back in stock."} />
                          </p>
                          <button className="w-full bg-[#25D366] hover:bg-[#1da851] text-white font-bold py-2 rounded-lg text-[13px] transition-colors">
                            Shop Now
                          </button>
                          <div className="flex justify-end">
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">11:32 AM <span className="text-[#53BDEB]">✓✓</span></span>
                          </div>
                        </div>
                      </div>

                      {/* WA Composer */}
                      <div className="bg-[#f0f0f0] px-3 py-2 flex items-center gap-2">
                        <button className="text-slate-500"><Emoji height={22} width={22} /></button>
                        <div className="flex-1 bg-white rounded-full px-4 py-2 text-[13px] text-slate-400">Type a message...</div>
                        <button className="text-slate-500"><Attachment height={20} width={20} /></button>
                        <button className="text-slate-500"><Camera height={20} width={20} /></button>
                        <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center text-white flex-shrink-0">
                          <SendDiagonal height={16} width={16} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── IMPROVEMENT 3: Email ── */}
                  {selectedChannel === 'Email' && (
                    <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl shadow-sm flex flex-col overflow-hidden">
                      {/* Email client header */}
                      <div className="border-b border-slate-200 px-5 py-3 bg-slate-50 flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <span className="text-[12px] font-semibold text-slate-400 w-14 text-right">From</span>
                          <span className="text-[13px] font-bold text-slate-900">Beauty Co. <span className="text-slate-500 font-normal">&lt;offers@beautyco.in&gt;</span></span>
                        </div>
                        <div className="flex items-center gap-3 border-t border-slate-100 pt-2">
                          <span className="text-[12px] font-semibold text-slate-400 w-14 text-right">Subject</span>
                          <span className="text-[13px] font-bold text-slate-900">
                            {activeVariant === 'A' ? 'Early Access for VIP Customers 🎉' : "We've Missed You — Here's 20% Off 💜"}
                          </span>
                        </div>
                      </div>

                      {/* Hero Banner */}
                      <div className="bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] p-8 flex flex-col items-center gap-2">
                        <span className="text-[11px] font-bold text-white/60 uppercase tracking-widest">Beauty Co.</span>
                        <span className="text-[22px] font-bold text-white text-center leading-tight">
                          {activeVariant === 'A' ? 'VIP Early Access' : 'We Miss You'}
                        </span>
                        <span className="text-[13px] text-white/70 text-center">
                          {activeVariant === 'A' ? 'Your exclusive window before everyone else.' : 'A special offer, just for you.'}
                        </span>
                      </div>

                      {/* Email Body */}
                      <div className="p-8 flex flex-col gap-5 items-center">
                        <p className="text-[14px] text-slate-700 leading-relaxed max-w-md text-center whitespace-pre-wrap">
                          <HighlightedMessage text={strategyResult?.variants?.find((v: any) => v.version === activeVariant)?.text || "Your favorite products are back in stock."} />
                        </p>
                        <button className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold py-3 px-10 rounded-lg text-[14px] transition-colors shadow-sm">
                          Shop Now
                        </button>

                        {/* Trust footer badges */}
                        <div className="flex items-center gap-6 pt-4 border-t border-slate-100 w-full justify-center">
                          {[
                            { icon: '🚚', label: 'Free Shipping' },
                            { icon: '✅', label: '100% Authentic' },
                            { icon: '↩️', label: 'Easy Returns' },
                          ].map(b => (
                            <div key={b.label} className="flex flex-col items-center gap-1">
                              <span className="text-[18px]">{b.icon}</span>
                              <span className="text-[11px] font-semibold text-slate-500">{b.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Email Footer */}
                      <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 text-center">
                        <span className="text-[11px] text-slate-400">Beauty Co. · 123 Fashion Ave, Mumbai · <span className="underline cursor-pointer">Unsubscribe</span></span>
                      </div>
                    </div>
                  )}

                  {/* ── IMPROVEMENT 4: SMS ── */}
                  {selectedChannel === 'SMS' && (
                    <div className="flex flex-col items-center gap-4">
                      {/* iPhone-style frame */}
                      <div className="w-[280px] bg-[#1c1c1e] rounded-[36px] p-3 shadow-2xl border-4 border-[#3a3a3c]">
                        {/* Status bar */}
                        <div className="flex justify-between items-center px-4 py-2">
                          <span className="text-[11px] font-bold text-white">9:41</span>
                          <div className="flex items-center gap-1">
                            <span className="text-white text-[10px]">●●●</span>
                            <span className="text-[11px] text-white">WiFi</span>
                            <span className="text-[11px] text-white">🔋</span>
                          </div>
                        </div>

                        {/* SMS App */}
                        <div className="bg-white rounded-[26px] overflow-hidden min-h-[400px] flex flex-col">
                          {/* SMS Header */}
                          <div className="bg-[#f2f2f7] px-4 py-3 border-b border-slate-200 flex flex-col items-center gap-0.5">
                            <div className="w-10 h-10 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-[12px] font-bold mb-1">BC</div>
                            <span className="text-[14px] font-bold text-slate-900">Beauty Co.</span>
                            <span className="text-[11px] text-slate-500">Business · Today 11:32 AM</span>
                          </div>

                          {/* SMS Bubbles */}
                          <div className="flex-1 p-4 flex flex-col gap-3 bg-white">
                            <div className="self-start max-w-[85%]">
                              <div className="bg-[#e9e9eb] rounded-2xl rounded-bl-sm px-3 py-2.5">
                                <p className="text-[13px] text-slate-900 leading-relaxed whitespace-pre-wrap">
                                  <HighlightedMessage text={strategyResult?.variants?.find((v: any) => v.version === activeVariant)?.text || "Your favorite products are back in stock."} />
                                </p>
                              </div>
                              <span className="text-[10px] text-slate-400 mt-1 block pl-1">Delivered</span>
                            </div>
                          </div>

                          {/* Character counter */}
                          <div className="px-4 pb-1">
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>1 SMS segment</span>
                              <span>{activeVariant === 'A' ? '118' : '115'} / 160 chars</span>
                            </div>
                          </div>

                          {/* SMS Composer */}
                          <div className="border-t border-slate-100 p-3 flex items-center gap-2">
                            <div className="flex-1 bg-[#f2f2f7] rounded-full px-3 py-2 text-[12px] text-slate-400">iMessage</div>
                            <div className="w-7 h-7 rounded-full bg-[#2563EB] flex items-center justify-center text-white flex-shrink-0">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M2 21L23 12 2 3v7l15 2-15 2v7z" /></svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── IMPROVEMENT 5: Call Script ── */}
                  {selectedChannel === 'Call Script' && (
                    <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl shadow-sm flex flex-col overflow-hidden">
                      {/* Script header */}
                      <div className="bg-[#FFFBEB] border-b border-amber-200 px-6 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                          <HeadsetHelp height={16} width={16} className="text-[#F59E0B]" />
                        </div>
                        <div>
                          <span className="text-[14px] font-bold text-slate-900 block">Agent Call Script</span>
                          <span className="text-[12px] text-slate-500">Dormant VIP Recovery · Variant {activeVariant}</span>
                        </div>
                        <div className="ml-auto text-[11px] font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded uppercase tracking-wide">Call Channel</div>
                      </div>

                      {/* Script sections — Notion-style */}
                      <div className="p-6 flex flex-col gap-0 divide-y divide-slate-100">
                        {[
                          {
                            label: 'Opening',
                            num: '01',
                            content: '"Hi, am I speaking with Rahul? This is [Agent Name] from Beauty Co. I\'m calling because we noticed you\'re one of our top customers for skincare serums."'
                          },
                          {
                            label: 'Customer Context',
                            num: '02',
                            content: '"We can see you\'ve been a loyal customer since early 2022, and your last order was about 64 days ago. We wanted to check in personally."'
                          },
                          {
                            label: 'Offer',
                            num: '03',
                            content: activeVariant === 'A'
                              ? '"We have an exclusive restock today, and we wanted to offer you early access before it opens to the public — no commitment required."'
                              : '"We wanted to offer you a special 20% discount on your next order of serums as a thank you for your past purchases."'
                          },
                          {
                            label: 'Objection Handling',
                            num: '04',
                            content: '"If you\'re well-stocked right now, we can hold this offer on your account for the next 30 days. Would you like me to send you the details via WhatsApp?"'
                          },
                          {
                            label: 'Close',
                            num: '05',
                            content: '"Great, I\'ve just texted you the secure link. Thank you for being a valued customer, Rahul. Have a wonderful day!"'
                          },
                        ].map(sec => (
                          <div key={sec.label} className="py-4 flex gap-4">
                            <span className="text-[11px] font-bold text-slate-300 mt-0.5 w-5 flex-shrink-0 font-mono">{sec.num}</span>
                            <div className="flex flex-col gap-1 flex-1">
                              <span className="text-[11px] font-bold text-[#F59E0B] uppercase tracking-wider">{sec.label}</span>
                              <p className="text-[13px] text-slate-700 leading-relaxed italic">{sec.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Personalization Context */}
              <div className="flex flex-col gap-3">
                <span className="text-[12px] font-bold text-slate-900 uppercase tracking-wider">Personalization Context</span>
                <div className="grid grid-cols-2 gap-6 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <div className="flex flex-col gap-3 border-r border-slate-100 pr-6">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Customer Profile</span>
                    {[
                      { k: 'Name', v: 'Rahul Sharma' },
                      { k: 'LTV Tier', v: 'VIP Top 10%' },
                      { k: 'Audience Size', v: '428' },
                    ].map(row => (
                      <div key={row.k} className="flex justify-between items-center">
                        <span className="text-[13px] text-slate-500 font-medium">{row.k}</span>
                        <span className="text-[13px] text-slate-900 font-bold font-mono">{row.v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-3">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Variables Used</span>
                    {[
                      { k: 'Favorite Category', v: 'Skincare Serums' },
                      { k: 'Last Purchase', v: '64 Days Ago' },
                      { k: 'Purchase Freq', v: '2.4x / Year' },
                    ].map(row => (
                      <div key={row.k} className="flex justify-between items-center">
                        <span className="text-[13px] text-slate-500 font-medium">{row.k}</span>
                        <span className="text-[13px] text-slate-900 font-bold font-mono">{row.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* ── IMPROVEMENT 6: Campaign Control Center — Full Height Sticky Panel ── */}
            <div className="col-span-4">
              <div
                className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden"
                style={{ position: 'sticky', top: '24px', height: 'calc(100vh - 48px)' }}
              >
                {/* Panel Header */}
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex-shrink-0">
                  <span className="text-[13px] font-bold text-slate-900 uppercase tracking-wider">Campaign Control Center</span>
                </div>

                {/* Metadata rows — flex-1 so they fill space */}
                <div className="flex flex-col p-5 gap-4 flex-1 overflow-y-auto">
                  {[
                    { label: 'Status',           value: 'Draft',                badge: true },
                    { label: 'Target Audience',  value: strategyResult?.persona?.name || '...' },
                    { label: 'Selected Channel', value: selectedChannel },
                    { label: 'Predicted Revenue', value: `₹${(strategyResult?.expectedRevenue || 0).toLocaleString('en-IN')}`, mono: true },
                    { label: 'Conversion Rate',  value: `${strategyResult ? (strategyResult.count > 0 ? ((strategyResult.expectedPurchasers / strategyResult.count) * 100).toFixed(1) : 0) : 0}%`, mono: true },
                    { label: 'Audience Match',   value: strategyResult?.audienceMatch || 'High', mono: true },
                    { label: 'Launch Risk',      value: strategyResult?.risk || 'Low', risk: true },
                    { label: 'Schedule',         value: 'Immediate' },
                    { label: 'Active Variant',   value: `Variant ${activeVariant}` },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-center border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                      <span className="text-[13px] font-semibold text-slate-500">{row.label}</span>
                      {row.badge ? (
                        <span className="text-[12px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{row.value}</span>
                      ) : row.risk ? (
                        <span className="text-[13px] font-bold text-emerald-600 flex items-center gap-1">
                          <ShieldCheck height={14} width={14} /> {row.value}
                        </span>
                      ) : (
                        <span className={clsx("text-[13px] font-bold text-slate-900", row.mono && "font-mono")}>{row.value}</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* ── Bottom Actions — pinned to bottom ── */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col gap-2.5 flex-shrink-0">
                  <div className="flex gap-2">
                    <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold py-2.5 rounded-lg text-[12px] transition-colors shadow-sm">
                      Send Test
                    </button>
                    <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold py-2.5 rounded-lg text-[12px] transition-colors shadow-sm">
                      Schedule
                    </button>
                  </div>
                  <button className="w-full bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold py-2.5 rounded-lg text-[12px] transition-colors shadow-sm">
                    Save Draft
                  </button>
                  <button
                    disabled={!submittedGoal || isLaunching}
                    onClick={handleLaunch}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold rounded-xl text-[14px] transition-colors shadow-sm flex items-center justify-center gap-2"
                    style={{ height: '48px', borderRadius: '12px' }}
                  >
                    {isLaunching ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Launching Campaign...
                      </>
                    ) : (
                      'Approve & Launch'
                    )}
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default function CampaignStudioPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading Studio...</div>}>
      <CampaignStudioContent />
    </Suspense>
  );
}
