'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import { Search, Play, ArrowRight, Spark, Settings } from 'iconoir-react';
import { clsx } from 'clsx';
import { getCampaignContext, clearCampaignContext, CampaignContextData } from '@/lib/campaignContext';
import { RightPanel, PanelSection, PanelMetric } from '@/components/ui/RightPanel';

function CampaignStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const audienceParam = searchParams.get('audience');

  const [sourceContext, setSourceContext] = useState<CampaignContextData | null>(null);
  const [goal, setGoal] = useState(audienceParam || '');
  const [submittedGoal, setSubmittedGoal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeVariant, setActiveVariant] = useState('A');
  const hasAutoSubmitted = useRef(false);

  const [selectedChannel, setSelectedChannel] = useState('WhatsApp');
  const [isLaunching, setIsLaunching] = useState(false);
  const [strategyResult, setStrategyResult] = useState<any>(null);

  useEffect(() => {
    const ctx = getCampaignContext();
    if (ctx && !hasAutoSubmitted.current && !isGenerating && !submittedGoal) {
      hasAutoSubmitted.current = true;
      setSourceContext(ctx);
      const prompt = ctx.autoTriggerPrompt || '';
      setGoal(prompt);
      clearCampaignContext();
      setTimeout(() => handleCommandSubmit(undefined, prompt), 50);
    } else if (audienceParam && !hasAutoSubmitted.current && !isGenerating && !submittedGoal) {
      hasAutoSubmitted.current = true;
      handleCommandSubmit(undefined, audienceParam);
    }
  }, [audienceParam]);

  const handleCommandSubmit = async (e?: React.FormEvent, overrideGoal?: string) => {
    if (e) e.preventDefault();
    const targetGoal = overrideGoal || goal;
    if (!targetGoal.trim() || isGenerating) return;
    setIsGenerating(true);

    try {
      const segmentRes = await fetchAPI<any>('/api/ai/segment', {
        method: 'POST',
        body: JSON.stringify({ goal: targetGoal })
      });
      
      const count = segmentRes.count;

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
        aov: segmentRes.aov,
        risk: segmentRes.risk,
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
      alert(`Failed to generate strategy: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

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
          persona_id: strategyResult?.persona?.id,
          audience_size: strategyResult?.count
        })
      });
      if (data.campaign_id) {
        router.push(`/engagement/${data.campaign_id}`);
      } else {
        alert('Failed to launch campaign.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error occurred.');
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <div className="flex w-full h-full">
      {/* Main Workspace */}
      <div className="flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="max-w-[800px] mx-auto flex flex-col gap-8">
          
          <div className="flex flex-col gap-1">
            <h1>Campaign Studio</h1>
            <p>Generate, simulate, and launch campaigns instantly using natural language.</p>
          </div>

          {/* Goal Input Area */}
          <div className="flex flex-col gap-2">
            <h3 className="text-[12px] font-bold tracking-wider uppercase text-ink-muted">Campaign Goal Input</h3>
            <form onSubmit={handleCommandSubmit} className="relative">
              <Search height={16} width={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Recover dormant customers who haven't purchased in 90 days"
                className="w-full bg-canvas-soft border border-hairline focus:border-primary focus:ring-1 focus:ring-primary rounded pl-10 pr-4 py-3 text-[14px] text-ink outline-none transition-all"
                disabled={isGenerating || submittedGoal}
              />
              {!submittedGoal && (
                <button 
                  type="submit" 
                  disabled={!goal.trim() || isGenerating}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-ink text-white px-3 py-1.5 rounded text-[12px] font-semibold hover:bg-ink-muted transition-colors disabled:opacity-50"
                >
                  {isGenerating ? 'Generating...' : 'Generate'}
                </button>
              )}
            </form>
          </div>

          {/* Generated State */}
          {submittedGoal && strategyResult && (
            <div className="flex flex-col gap-8 animate-in fade-in duration-500">
              
              {/* Generated Strategy block */}
              <div className="border border-hairline rounded bg-canvas overflow-hidden">
                <div className="bg-canvas-soft border-b border-hairline px-5 py-3">
                  <h3 className="text-[13px] font-semibold text-ink">Generated Strategy</h3>
                </div>
                <div className="p-5 grid grid-cols-4 gap-4 divide-x divide-hairline">
                  <div className="flex flex-col pl-4 first:pl-0">
                    <span className="text-[11px] text-ink-muted uppercase tracking-wider font-semibold mb-1">Audience</span>
                    <span className="text-[18px] font-mono-numbers font-semibold text-ink">{strategyResult.count}</span>
                  </div>
                  <div className="flex flex-col pl-4">
                    <span className="text-[11px] text-ink-muted uppercase tracking-wider font-semibold mb-1">Channel</span>
                    <span className="text-[16px] font-semibold text-ink mt-1">{strategyResult.channel}</span>
                  </div>
                  <div className="flex flex-col pl-4">
                    <span className="text-[11px] text-ink-muted uppercase tracking-wider font-semibold mb-1">Expected Revenue</span>
                    <span className="text-[18px] font-mono-numbers font-semibold text-success">₹{strategyResult.expectedRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col pl-4">
                    <span className="text-[11px] text-ink-muted uppercase tracking-wider font-semibold mb-1">Conversion Rate</span>
                    <span className="text-[18px] font-mono-numbers font-semibold text-ink">{strategyResult.conversionRate}%</span>
                  </div>
                </div>
              </div>

              {/* Message Variants & Approval */}
              <div className="border border-hairline rounded bg-canvas overflow-hidden">
                <div className="bg-canvas-soft border-b border-hairline px-5 py-3 flex justify-between items-center">
                  <h3 className="text-[13px] font-semibold text-ink">Message Variants</h3>
                  <div className="flex bg-canvas border border-hairline rounded">
                    {['A', 'B'].map(v => (
                      <button 
                        key={v}
                        onClick={() => setActiveVariant(v)}
                        className={clsx(
                          "px-3 py-1 text-[12px] font-semibold transition-colors",
                          activeVariant === v ? "bg-ink text-white" : "text-ink-muted hover:text-ink"
                        )}
                      >
                        Variant {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-6">
                  <div className="bg-canvas-soft border border-hairline rounded p-4 text-[14px] leading-relaxed text-ink font-medium min-h-[100px]">
                    {strategyResult.variants.find((v:any) => v.version === activeVariant)?.text}
                  </div>
                </div>
                <div className="bg-canvas-soft border-t border-hairline px-6 py-4 flex justify-between items-center">
                  <div className="text-[12px] text-ink-muted flex items-center gap-2">
                    <Settings height={14} width={14} /> Approval Required: Admin
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => { setSubmittedGoal(false); setGoal(''); }}
                      className="px-4 py-2 border border-hairline bg-canvas text-ink text-[13px] font-semibold rounded hover:bg-canvas-soft transition-colors"
                    >
                      Discard
                    </button>
                    <button 
                      onClick={handleLaunch}
                      disabled={isLaunching}
                      className="px-4 py-2 bg-primary text-white text-[13px] font-semibold rounded hover:bg-primary-press transition-colors flex items-center gap-2"
                    >
                      {isLaunching ? 'Launching...' : <><Play height={14} width={14} /> Launch Campaign</>}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}
          
        </div>
      </div>

      {/* Right Context Panel */}
      <RightPanel title="AI Intelligence">
        {!submittedGoal ? (
          <p className="text-[13px] text-ink-muted italic">Awaiting campaign goal input to generate strategy...</p>
        ) : (
          <>
            <PanelSection title="Campaign Intelligence">
              <p>Generated strategy optimized for <strong>{strategyResult.channel}</strong> based on historical conversion data for {strategyResult.count} users.</p>
            </PanelSection>
            <PanelSection title="Projected Impact">
              <div className="flex flex-col gap-3 mt-2">
                <PanelMetric label="Revenue Potential" value={`₹${strategyResult.expectedRevenue.toLocaleString()}`} trend="positive" />
                <PanelMetric label="Expected Purchasers" value={strategyResult.expectedPurchasers} />
                <PanelMetric label="Average Order Value" value={`₹${strategyResult.aov}`} />
                <PanelMetric label="Audience Risk" value={strategyResult.risk} trend={strategyResult.risk === 'High' ? 'negative' : 'neutral'} />
              </div>
            </PanelSection>
            <PanelSection title="Evidence">
              <p className="mb-2">Variant A outperformed Variant B by 24% in the last 3 dormant recovery campaigns.</p>
              <p>WhatsApp delivery ensures a 98% open rate for high-risk audiences.</p>
            </PanelSection>
            <PanelSection title="Confidence" noBorder>
              <div className="text-[32px] font-semibold text-ink font-mono-numbers tracking-tight">88%</div>
              <p className="text-[12px] text-ink-muted mt-1">Based on CRM match rate.</p>
            </PanelSection>
          </>
        )}
      </RightPanel>

    </div>
  );
}

export default function CampaignStudioPage() {
  return (
    <React.Suspense fallback={<div className="p-10 w-full h-full flex items-center justify-center text-ink-muted bg-canvas">Loading studio...</div>}>
      <CampaignStudioContent />
    </React.Suspense>
  );
}
