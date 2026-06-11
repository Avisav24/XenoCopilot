'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCustomerStats, strategizeCampaign, launchCampaign } from '@/lib/api';
import { Sun, Moon, Clock, Heart, WarningCircle, Sparkle, User, PaperPlaneRight } from '@phosphor-icons/react';
import Loader from '@/components/Loader';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AIHubPage() {
  const router = useRouter();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['customer-stats'],
    queryFn: getCustomerStats,
  });

  const [goal, setGoal] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [campaignData, setCampaignData] = useState<any>(null);
  const [greeting, setGreeting] = useState('Welcome back');
  const [GreetingIcon, setGreetingIcon] = useState<any>(Sun);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
      setGreetingIcon(() => Sun);
    } else if (hour < 18) {
      setGreeting('Good afternoon');
      setGreetingIcon(() => Sun);
    } else {
      setGreeting('Good evening');
      setGreetingIcon(() => Moon);
    }
  }, []);

  const handleStartWorkflow = async () => {
    if (!goal.trim()) return;
    setIsProcessing(true);
    setReport(null);
    setCampaignData(null);
    
    try {
      const res = await strategizeCampaign(goal);
      setReport(res.markdownReport);
      setCampaignData(res.campaignData);
    } catch (err) {
      console.error(err);
      alert('AI Strategist failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLaunch = async () => {
    if (!campaignData) return;
    setIsProcessing(true);
    try {
      const res = await launchCampaign(campaignData);
      if (res.success) {
        router.push(`/engagement/${res.campaign_id}`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to launch campaign');
      setIsProcessing(false);
    }
  };

  const handleCardClick = (presetGoal: string) => {
    setGoal(presetGoal);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto flex flex-col gap-6 h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="flex items-center justify-center gap-3 mt-2 mb-0 shrink-0">
        <GreetingIcon size={54} className="text-[#d48166]" />
        <h1 className="text-[32px] md:text-[36px] leading-[1.09] tracking-[-1px] font-display text-ink text-center">
          {greeting}, Abhinav
        </h1>
      </div>

      {/* 3 STATS Cards - Made smaller and compact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
          <div 
            className="card p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border border-hairline flex flex-col cursor-pointer bg-canvas"
            onClick={() => handleCardClick('Launch Win-Back Campaign for Dormant Customers')}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#0052ff]/10 flex items-center justify-center">
                  <Clock size={24} className="text-[#0052ff]" />
                </div>
                <h3 className="text-[14px] font-semibold text-ink">Dormant Customers</h3>
              </div>
              <span className="bg-[#0052ff]/10 text-[#0052ff] px-2 py-0.5 rounded-[8px] text-[9px] font-bold tracking-wider">ACTION</span>
            </div>
            <p className="text-[12px] text-body mb-3">428 customers inactive for 45+ days.</p>
            <div className="mt-auto pt-2 border-t border-hairline/50 flex justify-between items-end">
              <p className="text-[10px] text-muted font-semibold uppercase tracking-wider">Recovery</p>
              <p className="text-[16px] font-mono-numbers text-semantic-up leading-none">₹17,200</p>
            </div>
          </div>
          
          <div 
            className="card p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border border-hairline flex flex-col cursor-pointer bg-canvas"
            onClick={() => handleCardClick('Launch Exclusive VIP Campaign for Retention')}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart size={24} className="text-primary" />
                </div>
                <h3 className="text-[14px] font-semibold text-ink">VIP Retention</h3>
              </div>
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-[8px] text-[9px] font-bold tracking-wider">ACTION</span>
            </div>
            <p className="text-[12px] text-body mb-3">98 high-value customers slipping.</p>
            <div className="mt-auto pt-2 border-t border-hairline/50 flex justify-between items-end">
              <p className="text-[10px] text-muted font-semibold uppercase tracking-wider">Revenue</p>
              <p className="text-[16px] font-mono-numbers text-semantic-up leading-none">₹12,500</p>
            </div>
          </div>

          <div 
            className="card p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border border-hairline flex flex-col bg-canvas cursor-pointer" 
            onClick={() => handleCardClick('Analyze churn risk for Rahul Sharma')}
          >
             <div className="flex justify-between items-start mb-2">
               <div className="flex items-center gap-2">
                 <div className="w-10 h-10 rounded-full bg-semantic-down/10 flex items-center justify-center">
                   <WarningCircle size={24} className="text-semantic-down" />
                 </div>
                 <h3 className="text-[14px] font-semibold text-ink">Rahul Sharma</h3>
               </div>
               <span className="bg-semantic-down/10 text-semantic-down px-2 py-0.5 rounded-[8px] text-[9px] font-bold tracking-wider">HEALTH</span>
             </div>
             <p className="text-[12px] text-body mb-3">High churn probability. Last purchase 90 days ago.</p>
             <div className="mt-auto pt-2 border-t border-hairline/50 flex justify-between items-end">
               <p className="text-[10px] text-muted font-semibold uppercase tracking-wider">Score</p>
               <div className="flex items-end gap-1">
                 <span className="text-[16px] font-mono-numbers text-semantic-down leading-none">32</span>
                 <span className="text-[10px] text-muted font-semibold">/100</span>
               </div>
             </div>
          </div>
      </div>

      {/* Chatbot Interface - Takes up remaining space */}
      <div className="card flex flex-col bg-canvas border border-hairline overflow-hidden flex-1 shadow-sm">
        {/* Chat Header */}
        <div className="p-3 border-b border-hairline bg-surface-soft flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shrink-0 shadow-sm">
              <Sparkle size={54} />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-ink leading-tight">Revenue Growth Strategist</h2>
              <p className="text-[11px] text-primary font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Online
              </p>
            </div>
          </div>
          {(report || isProcessing) && (
            <button 
              onClick={() => { setReport(null); setCampaignData(null); setGoal(''); setIsProcessing(false); }} 
              className="text-[12px] text-muted hover:text-ink font-semibold px-3 py-1.5 rounded-md hover:bg-surface-strong transition-colors"
            >
              Reset Chat
            </button>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 relative bg-canvas">
          
          {(!report && !isProcessing) && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shrink-0 shadow-sm mt-1">
                <Sparkle size={54} />
              </div>
              <div className="bg-surface-soft p-4 rounded-2xl rounded-tl-sm border border-hairline shadow-sm text-[14px] text-ink">
                Hi Abhinav! I'm ready to help you grow your revenue. What's your campaign goal today? You can select a suggestion above or type your own below.
              </div>
            </div>
          )}

          {(isProcessing || report) && (
            <div className="flex gap-3 max-w-[85%] ml-auto justify-end">
              <div className="bg-ink text-canvas p-4 rounded-2xl rounded-tr-sm shadow-sm text-[14px] whitespace-pre-wrap">
                {goal}
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shrink-0 shadow-sm mt-1">
                <Sparkle size={54} />
              </div>
              <div className="bg-surface-soft p-4 rounded-2xl rounded-tl-sm border border-hairline shadow-sm w-full flex items-center justify-center py-8">
                <Loader text="Analyzing Customers & Strategizing" />
              </div>
            </div>
          )}

          {report && !isProcessing && (
            <div className="flex gap-3 max-w-full md:max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shrink-0 shadow-sm mt-1">
                <Sparkle size={54} />
              </div>
              <div className="bg-surface-soft p-6 rounded-2xl rounded-tl-sm border border-hairline shadow-sm w-full">
                <div className="prose prose-sm prose-blue max-w-none text-ink">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {report}
                  </ReactMarkdown>
                </div>

                {campaignData && (
                  <div className="mt-8 pt-6 border-t border-hairline">
                    <button
                      onClick={handleLaunch}
                      disabled={isProcessing}
                      className="btn-primary w-full py-3 text-[14px] flex justify-center items-center gap-2 shadow-sm"
                    >
                      {isProcessing ? 'Launching...' : `Approve & Launch: ${campaignData.name}`}
                      {!isProcessing && <PaperPlaneRight size={54} />}
                    </button>
                    <p className="text-[11px] text-muted text-center mt-3">
                      This will queue messages via {campaignData.channel}.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Input Box Bottom */}
        <div className="p-4 bg-canvas border-t border-hairline shrink-0">
          <div className="relative max-w-4xl mx-auto flex items-end gap-2">
            <textarea
              value={goal}
              onChange={e => setGoal(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleStartWorkflow();
                }
              }}
              placeholder="Ask Copilot to create a campaign..."
              className="input-field w-full resize-none bg-surface-soft border-transparent hover:border-hairline focus:bg-canvas text-[14px] py-3 pl-4 pr-12 rounded-2xl min-h-[50px] max-h-[150px]"
              rows={1}
              disabled={isProcessing || report !== null}
            />
            <button 
              onClick={handleStartWorkflow}
              disabled={isProcessing || !goal.trim() || report !== null} 
              className="absolute right-2 bottom-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-active disabled:opacity-50 disabled:bg-surface-strong transition-colors"
            >
              <PaperPlaneRight size={54} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
