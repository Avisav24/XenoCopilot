'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import { Spark, ArrowRight, Play, CheckCircle } from 'iconoir-react';
import { clsx } from 'clsx';

export default function CampaignStudioPage() {
  const router = useRouter();

  const [goal, setGoal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [strategyResult, setStrategyResult] = useState<any>(null);
  const [isLaunching, setIsLaunching] = useState(false);

  const examples = [
    "Generate ₹10L additional revenue",
    "Recover dormant VIP customers",
    "Increase repeat purchases by 20%",
    "Reduce churn among high-value buyers"
  ];

  const handleGenerateStrategy = async (e?: React.FormEvent, presetGoal?: string) => {
    if (e) e.preventDefault();
    const targetGoal = presetGoal || goal;
    if (!targetGoal.trim() || isGenerating) return;
    
    setGoal(targetGoal);
    setIsGenerating(true);
    setStrategyResult(null);

    try {
      const result = await fetchAPI<any>('/api/ai/revenue-strategy', {
        method: 'POST',
        body: JSON.stringify({ goal: targetGoal })
      });
      setStrategyResult(result);
    } catch (err: any) {
      console.error(err);
      alert(`Failed to generate strategy: ${err.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLaunch = async (campaign: any) => {
    setIsLaunching(true);
    try {
      // Create campaign in the backend
      const data = await fetchAPI<any>('/api/ai/launch-campaign', {
        method: 'POST',
        body: JSON.stringify({
          name: campaign.name,
          channel: campaign.channel,
          message: campaign.offer || 'Here is a special offer for you!',
          audience_size: campaign.audienceSize
        })
      });
      if (data.campaign_id) {
        // Redirect to AI Review Mode instead of standard engagement
        router.push(`/campaigns/${data.campaign_id}/review`);
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
    <div className="flex w-full min-h-screen bg-slate-50 justify-center">
      <div className="w-full max-w-[1000px] px-8 py-12 flex flex-col gap-10">

        {/* Hero Header */}
        <div className="flex flex-col items-center justify-center text-center gap-4 py-10">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-2">
            <Spark width={32} height={32} />
          </div>
          <h1 className="text-[40px] font-bold text-slate-900 leading-tight tracking-tight">
            Revenue Goal Studio
          </h1>
          <p className="text-[18px] text-slate-500 max-w-2xl">
            What business outcome do you want? Describe your objective in plain English, and XenoCopilot will build the perfect campaign strategy.
          </p>
        </div>

        {/* Goal Input Section */}
        {!strategyResult && !isGenerating && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <form onSubmit={handleGenerateStrategy} className="flex flex-col gap-4">
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Generate ₹10L revenue this month"
                className="w-full min-h-[120px] text-[24px] font-medium text-slate-900 placeholder:text-slate-300 resize-none outline-none border-none p-4 bg-transparent focus:ring-0"
                autoFocus
              />
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={!goal.trim()}
                  className={clsx(
                    "px-8 py-4 rounded-xl font-bold text-[16px] transition-all flex items-center gap-2",
                    goal.trim()
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  )}
                >
                  Generate Strategy <ArrowRight height={20} width={20} />
                </button>
              </div>
            </form>
            
            <div className="pt-4 flex flex-col gap-3">
              <span className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">Or try an example:</span>
              <div className="flex flex-wrap gap-2">
                {examples.map((ex, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleGenerateStrategy(undefined, ex)}
                    className="px-4 py-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg text-[14px] font-medium text-slate-600 hover:text-blue-700 transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-20 gap-6 animate-pulse">
            <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"></div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[20px] font-bold text-slate-900">Analyzing Opportunities...</span>
              <span className="text-[15px] text-slate-500">Calculating audience potential, channel performance, and expected revenue.</span>
            </div>
          </div>
        )}

        {/* Strategy Output */}
        {strategyResult && !isGenerating && (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[13px] font-bold text-blue-600 uppercase tracking-wider">Recommended Strategy</span>
                <h2 className="text-[24px] font-bold text-slate-900 flex items-center gap-2">
                  Goal: {goal}
                </h2>
              </div>
              <button onClick={() => setStrategyResult(null)} className="text-[14px] font-semibold text-slate-500 hover:text-slate-900 transition-colors">
                Start Over
              </button>
            </div>

            {/* Projected Revenue Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 shadow-lg text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Spark width={120} height={120} />
              </div>
              <div className="flex flex-col gap-2 relative z-10">
                <span className="text-[14px] font-bold text-slate-400 uppercase tracking-wider">Projected Revenue</span>
                <span className="text-[48px] font-bold font-mono tracking-tight leading-none text-emerald-400">
                  ₹{strategyResult.projectedRevenue?.toLocaleString('en-IN') || 0}
                </span>
                <div className="flex items-center gap-2 mt-2">
                  <CheckCircle height={18} width={18} className="text-blue-400" />
                  <span className="text-[15px] font-medium text-slate-300">Goal Achievable ({strategyResult.confidence || 85}% Confidence)</span>
                </div>
              </div>
            </div>

            {/* Campaigns List */}
            <div className="flex flex-col gap-6">
              {strategyResult.campaigns?.map((camp: any, idx: number) => (
                <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col gap-6 relative overflow-hidden">
                  
                  {/* Campaign Header */}
                  <div className="flex justify-between items-start pb-6 border-b border-slate-100">
                    <div className="flex flex-col gap-1">
                      <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Campaign {idx + 1}</span>
                      <h3 className="text-[20px] font-bold text-slate-900">{camp.name}</h3>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Expected Revenue</span>
                      <span className="text-[24px] font-bold text-emerald-600 font-mono leading-none">₹{camp.expectedRevenue?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Campaign Details */}
                  <div className="grid grid-cols-3 gap-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[12px] font-semibold text-slate-500">Audience</span>
                      <span className="text-[16px] font-bold text-slate-900">{camp.audienceSize} Customers</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[12px] font-semibold text-slate-500">Channel</span>
                      <span className="text-[16px] font-bold text-slate-900">{camp.channel}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[12px] font-semibold text-slate-500">Offer</span>
                      <span className="text-[16px] font-bold text-slate-900">{camp.offer || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Recommendation Provenance */}
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                    <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-3 block flex items-center gap-1.5">
                      <Spark height={14} width={14} className="text-blue-500"/> Why This Recommendation Exists
                    </span>
                    <ul className="flex flex-col gap-2">
                      {camp.reasoning?.map((reason: string, i: number) => {
                        const parts = reason.split(':');
                        const source = parts[0];
                        const text = parts.slice(1).join(':');
                        return (
                          <li key={i} className="text-[14px] text-slate-700 flex items-start gap-2">
                            <span className="font-bold text-slate-900 shrink-0 bg-white border border-slate-200 px-2 rounded-md text-[11px] uppercase mt-0.5">{source}</span>
                            <span>{text}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Launch Action */}
                  <div className="flex justify-end pt-4">
                     <button
                        onClick={() => handleLaunch(camp)}
                        disabled={isLaunching}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-xl text-[15px] transition-all flex items-center gap-2 shadow-sm"
                     >
                       {isLaunching ? 'Launching...' : 'Approve & Launch'} <Play fill="currentColor" height={16} width={16} />
                     </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
