'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import { Search, FastArrowRight, UserStar, Xmark, Check } from 'iconoir-react';
import { getCampaignContext, clearCampaignContext } from '@/lib/campaignContext';
import { clsx } from 'clsx';

function CampaignStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const audienceParam = searchParams.get('audience');
  
  const [goalInput, setGoalInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  
  const [recommendation, setRecommendation] = useState<any>(null);
  const [simulations, setSimulations] = useState<any>(null);
  const [selectedChannel, setSelectedChannel] = useState('WhatsApp');
  const [messagePreview, setMessagePreview] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [editableMessage, setEditableMessage] = useState('');

  useEffect(() => {
    fetchAPI<any[]>('/api/ai/opportunities').then(res => setOpportunities(res || [])).catch(console.error);
    const ctx = getCampaignContext();
    if (ctx) {
      setGoalInput(ctx.autoTriggerPrompt || `Launch campaign for ${ctx.audienceName}`);
      clearCampaignContext();
    } else if (audienceParam) {
      setGoalInput(`Target audience: ${audienceParam}`);
    }
  }, [audienceParam]);

  const handleAnalyzeGoal = async (e?: React.FormEvent, goalOverride?: string) => {
    if (e) e.preventDefault();
    const query = goalOverride || goalInput;
    if (!query.trim()) return;
    if (goalOverride) setGoalInput(goalOverride);
    
    setIsProcessing(true);
    try {
      const res = await fetchAPI<any>('/api/copilot/analyze-goal', {
        method: 'POST',
        body: JSON.stringify({ goal: query })
      });
      setRecommendation(res);
      
      const defaultChannel = ['WhatsApp', 'Email', 'SMS'].includes(res.channel) ? res.channel : 'WhatsApp';
      setSelectedChannel(defaultChannel);
      
      const simRes = await fetchAPI<any>('/api/copilot/simulate', {
        method: 'POST',
        body: JSON.stringify({ channel: defaultChannel, offer: res.offer })
      });
      setSimulations(simRes);
      
      await fetchMessagePreview(defaultChannel, res, query);
      
      setHasAnalyzed(true);
    } catch (e) {
      console.error(e);
      alert('Analysis failed. Ensure backend is running.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulateChannelChange = async (channel: string) => {
    setSelectedChannel(channel);
    await fetchMessagePreview(channel, recommendation, goalInput);
  };

  const fetchMessagePreview = async (channel: string, rec: any, query?: string) => {
    if (!rec) return;
    try {
      const res = await fetchAPI<any>('/api/copilot/message-preview', {
        method: 'POST',
        body: JSON.stringify({ 
          channel, 
          offer: rec.offer,
          audience: rec.audience?.name,
          goal: query || goalInput
        })
      });
      setMessagePreview(res);
      
      const rawMsg = res?.variantA?.copy || '';
      const cleanMsg = rawMsg.replace(/<[^>]*>?/gm, '').replace(/\[(?:Customer )?Name\]/gi, 'Sarah');
      setEditableMessage(cleanMsg || `Hi Sarah, we miss you! Here is a ${rec.offer} just for you.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLaunchCampaign = async () => {
    setIsProcessing(true);
    try {
      const selectedSim = simulations?.scenarios?.find((s: any) => s.channel === selectedChannel) || recommendation;
      
      let revStr = String(selectedSim?.revenue || recommendation?.expectedRevenue || '0');
      let predictedRevenue = 0;
      if (revStr.includes('L')) {
        predictedRevenue = Number(revStr.replace(/[^0-9.-]+/g, "")) * 100000;
      } else if (revStr.includes('K')) {
        predictedRevenue = Number(revStr.replace(/[^0-9.-]+/g, "")) * 1000;
      } else {
        predictedRevenue = Number(revStr.replace(/[^0-9.-]+/g, ""));
      }
      if (isNaN(predictedRevenue)) predictedRevenue = 0;
      
      const convStr = String(selectedSim?.conversion || recommendation?.expectedConversion || recommendation?.confidence || '0');
      let predictedConversion = Number(convStr.replace(/[^0-9.-]+/g, ""));
      if (isNaN(predictedConversion)) predictedConversion = 0;
      
      const campaign = await fetchAPI<any>('/api/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          name: goalInput.slice(0, 40) + (goalInput.length > 40 ? '...' : ''),
          goal: goalInput,
          audience_type: recommendation.audience?.name || 'Target Audience',
          audience_size: recommendation.audience?.count || 0,
          channel: selectedChannel,
          offer: recommendation.offer || 'Promo',
          message: editableMessage,
          predicted_revenue: predictedRevenue,
          predicted_conversion: predictedConversion
        })
      });

      await fetchAPI(`/api/campaigns/${campaign.id}/launch`, { 
        method: 'POST',
        body: JSON.stringify({}) 
      });
      router.push(`/campaigns/${campaign.id}`);
    } catch (e) {
      console.error(e);
      alert('Launch failed: ' + (e instanceof Error ? e.message : String(e)));
      setIsProcessing(false);
    }
  };

  const handleResetSearch = () => {
    setGoalInput('');
    setHasAnalyzed(false);
    setRecommendation(null);
    setSimulations(null);
    setMessagePreview(null);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-canvas pb-20">
      
      {/* PAGE HEADER */}
      <div className="px-6 py-6 border-b border-hairline flex flex-col gap-1">
        <h1 className="text-[24px] font-[700] text-ink leading-tight">Campaign Studio</h1>
        <p className="text-[14px] text-ink-muted">AI-assisted campaign creation and intelligence.</p>
      </div>

      <div className="flex flex-col p-6 max-w-[1000px]">
        
        {/* COMMAND BAR */}
        <form onSubmit={handleAnalyzeGoal} className="relative flex items-center w-full mb-6">
          <Search className="absolute left-4 text-ink-muted" height={16} width={16} />
          <input
            type="text"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            placeholder="e.g. Recover dormant customers or clear winter inventory"
            disabled={isProcessing}
            className="w-full bg-white border border-hairline pl-10 pr-32 py-3 text-[14px] font-[500] focus:outline-none focus:border-ink rounded-[8px] transition-all"
          />
          {hasAnalyzed && (
            <button
              type="button"
              onClick={handleResetSearch}
              className="absolute right-28 p-2 text-ink-muted hover:text-ink transition-colors"
            >
              <Xmark height={16} width={16} />
            </button>
          )}
          <button
            type="submit"
            disabled={!goalInput.trim() || isProcessing}
            className="absolute right-2 bg-ink hover:bg-ink-muted text-canvas px-4 py-1.5 rounded-[6px] text-[13px] font-[600] transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-spin text-canvas">
                  <line x1="12" y1="2" x2="12" y2="6"></line>
                  <line x1="12" y1="18" x2="12" y2="22"></line>
                  <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                  <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                  <line x1="2" y1="12" x2="6" y2="12"></line>
                  <line x1="18" y1="12" x2="22" y2="12"></line>
                  <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                  <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                </svg>
                Analyzing...
              </>
            ) : 'Generate'}
          </button>
        </form>

        {/* PRE-ANALYSIS: RECOMMENDATION ROWS */}
        {!hasAnalyzed && (
          <div className="flex flex-col gap-4">
            <h2 className="text-[14px] font-[600] text-ink uppercase tracking-wider">Suggested Automations</h2>
            <div className="table-container">
              <table className="table-enterprise">
                <thead>
                  <tr>
                    <th>Opportunity</th>
                    <th>Reason</th>
                    <th>Audience</th>
                    <th>Est. Revenue</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {(Array.isArray(opportunities) ? opportunities : []).slice(0, 4).map((opp, i) => {
                    if (!opp) return null;
                    return (
                      <tr key={i} className="hover:bg-canvas-soft group transition-colors">
                        <td className="font-[500] text-ink">{opp.title}</td>
                        <td className="text-ink-muted truncate max-w-[200px]">{opp.reasoning?.[0] || 'Data-driven insight'}</td>
                        <td className="text-ink">{opp.audience?.toLocaleString() || '0'}</td>
                        <td className="font-mono-numbers text-green-600 font-[500]">₹{opp.expectedRevenue?.toLocaleString() || '0'}</td>
                        <td className="text-right">
                          <button 
                            onClick={() => handleAnalyzeGoal(undefined, opp.title)}
                            className="text-[13px] font-[600] text-primary hover:text-primary-press"
                          >
                            Apply
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* POST-ANALYSIS: SPLIT VIEW */}
        {hasAnalyzed && recommendation && (
          <div className="flex flex-col gap-8">
            
            {/* Metrics Row */}
            <div className="grid grid-cols-4 gap-4">
              <div className="card !p-4 flex flex-col gap-1">
                <span className="text-[12px] font-[600] text-ink-muted uppercase tracking-wider">Audience</span>
                <span className="text-[16px] font-[600] text-ink">{recommendation.audience?.count?.toLocaleString() || '0'}</span>
              </div>
              <div className="card !p-4 flex flex-col gap-1">
                <span className="text-[12px] font-[600] text-ink-muted uppercase tracking-wider">Expected Rev</span>
                <span className="text-[16px] font-mono-numbers font-[600] text-green-600">
                  {typeof recommendation.expectedRevenue === 'number' ? `₹${recommendation.expectedRevenue.toLocaleString()}` : recommendation.expectedRevenue}
                </span>
              </div>
              <div className="card !p-4 flex flex-col gap-1">
                <span className="text-[12px] font-[600] text-ink-muted uppercase tracking-wider">Confidence</span>
                <span className="text-[16px] font-mono-numbers font-[600] text-ink">{recommendation.confidence || '85%'}</span>
              </div>
              <div className="card !p-4 flex flex-col gap-1">
                <span className="text-[12px] font-[600] text-ink-muted uppercase tracking-wider">Channel Lift</span>
                <span className="text-[16px] font-mono-numbers font-[600] text-ink">+12% via {selectedChannel}</span>
              </div>
            </div>

            {/* Split Message Editor / Preview */}
            <div className="flex flex-col md:flex-row gap-6 items-stretch">
              
              {/* Left: Editor */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex items-center gap-4 border-b border-hairline">
                  {['WhatsApp', 'Email', 'SMS'].map((channel) => (
                    <button
                      key={channel}
                      onClick={() => handleSimulateChannelChange(channel)}
                      className={clsx(
                        "pb-2 text-[14px] font-[600] transition-colors border-b-2",
                        selectedChannel === channel 
                          ? "border-ink text-ink" 
                          : "border-transparent text-ink-muted hover:text-ink"
                      )}
                    >
                      {channel}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-[13px] font-[600] text-ink">Message Content</label>
                  <textarea
                    value={editableMessage}
                    onChange={(e) => setEditableMessage(e.target.value)}
                    className="w-full flex-1 min-h-[200px] border border-hairline rounded-[8px] p-4 text-[14px] leading-relaxed resize-none focus:outline-none focus:border-ink bg-white font-sans"
                  />
                  <div className="flex items-center justify-between text-[12px] text-ink-muted mt-1">
                    <span>Variables: [Name], [Offer], [Link]</span>
                    <span>{editableMessage.length} chars</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-hairline">
                  <button 
                    onClick={handleLaunchCampaign}
                    disabled={isProcessing}
                    className="btn-primary w-full py-3 text-[14px]"
                  >
                    {isProcessing ? 'Launching...' : 'Launch Campaign'} <FastArrowRight height={16} width={16} />
                  </button>
                </div>
              </div>

              {/* Right: Actual Mockup */}
              <div className="flex-1 bg-canvas-soft border border-hairline rounded-[8px] flex items-center justify-center p-8 min-h-[400px]">
                {selectedChannel === 'WhatsApp' && (
                  <div className="w-[320px] bg-[#EFEAE2] rounded-[24px] border-[8px] border-slate-800 overflow-hidden flex flex-col shadow-sm relative">
                    <div className="bg-[#008069] text-white px-4 py-3 flex items-center gap-3 z-10">
                      <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                        <UserStar height={18} width={18} className="text-slate-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-[500] leading-tight">Brand Account</span>
                        <span className="text-[11px] opacity-80">Official Business</span>
                      </div>
                    </div>
                    <div className="flex-1 p-4 flex flex-col gap-3 relative z-10">
                      <div className="bg-white rounded-[8px] rounded-tl-none p-3 max-w-[90%] shadow-sm self-start relative text-[14px] text-slate-800 leading-relaxed whitespace-pre-wrap">
                        {editableMessage}
                        <div className="text-[10px] text-slate-400 text-right mt-1">10:42 AM</div>
                      </div>
                      <div className="flex gap-2 w-[90%]">
                        <button className="flex-1 bg-white text-[#00A884] border border-slate-200 py-2 rounded-md text-[13px] font-[500] shadow-sm">Shop Now</button>
                      </div>
                    </div>
                    <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                  </div>
                )}

                {selectedChannel === 'Email' && (
                  <div className="w-full max-w-[400px] bg-white rounded-lg border border-hairline shadow-sm flex flex-col overflow-hidden">
                    <div className="bg-canvas-soft border-b border-hairline px-4 py-3 flex flex-col gap-1 text-[13px]">
                      <div className="flex items-center gap-2"><span className="text-ink-muted w-12">From:</span><span className="font-[500] text-ink">Brand Team</span></div>
                      <div className="flex items-center gap-2"><span className="text-ink-muted w-12">Subject:</span><span className="font-[600] text-ink">Exclusive Offer</span></div>
                    </div>
                    <div className="p-6 flex flex-col gap-4 text-[14px] text-ink leading-relaxed items-center text-center">
                      <div className="text-[20px] font-serif font-bold tracking-tight">BRAND.</div>
                      <p className="whitespace-pre-wrap text-left w-full">{editableMessage}</p>
                      <button className="bg-ink text-white px-8 py-3 mt-4 text-[13px] font-[600] tracking-wide w-full">CLAIM OFFER</button>
                    </div>
                  </div>
                )}

                {selectedChannel === 'SMS' && (
                  <div className="w-[300px] bg-white rounded-[28px] border-[8px] border-slate-200 overflow-hidden flex flex-col shadow-sm">
                    <div className="bg-canvas-soft px-4 py-3 flex items-center justify-center border-b border-hairline">
                      <span className="text-[11px] font-[600] text-ink leading-none">BRAND</span>
                    </div>
                    <div className="flex-1 p-4 bg-canvas flex flex-col gap-2 justify-end min-h-[300px]">
                      <div className="bg-slate-200 rounded-2xl rounded-tl-sm p-3 max-w-[85%] self-start text-[14px] text-ink leading-snug whitespace-pre-wrap">
                        {editableMessage}
                      </div>
                      <div className="text-[10px] text-ink-muted text-center mt-2">Read 10:42 AM</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default function CampaignStudio() {
  return (
    <Suspense fallback={<div className="p-6 text-ink-muted">Loading Studio...</div>}>
      <CampaignStudioContent />
    </Suspense>
  );
}
