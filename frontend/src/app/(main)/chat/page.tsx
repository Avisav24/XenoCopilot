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
      let cleanMsg = rawMsg.replace(/<[^>]*>?/gm, '').replace(/\[(?:Customer )?Name\]/gi, '{{Name}}');
      
      // Aggressive replacement of hallucinated names in greetings
      cleanMsg = cleanMsg.replace(/(Hi|Hey|Dear)\s+[A-Z][a-z]+,/g, '$1 {{Name}},');

      setEditableMessage(cleanMsg || `Hi {{Name}},\n\nWe miss you! Here is a ${rec.offer} just for you.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLaunchCampaign = async () => {
    setIsProcessing(true);
    try {
      const selectedSim = simulations?.scenarios?.find((s: any) => s.channel === selectedChannel) || recommendation;
      
      const convStr = String(selectedSim?.conversion || recommendation?.expectedConversion || recommendation?.confidence || '0');
      let predictedConversion = Number(convStr.replace(/[^0-9.-]+/g, ""));
      if (isNaN(predictedConversion)) predictedConversion = 0;

      const audienceCount = recommendation.audience?.count || 0;
      const realisticAov = 1500; // Historical average AOV
      const predictedPurchasers = Math.ceil(audienceCount * (predictedConversion / 100));
      const predictedRevenue = Math.round(predictedPurchasers * realisticAov);
      
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

  const renderMessagePreview = (text: string) => {
    const isSingleCustomer = recommendation?.audience?.count === 1;
    const singleCustomerName = isSingleCustomer && recommendation?.audience?.name 
      ? recommendation.audience.name.split(' ')[0] 
      : 'Customer Name';
    
    const parts = text.split(/(\{\{Name\}\}|\[(?:Customer )?Name\]|\[\s*First Name\s*\]|\[\s*Shop Now\s*\]|\{\{Link\}\})/gi);
    return parts.map((part, i) => {
      if (i % 2 === 0) return part;

      const p = part.toLowerCase();
      if (p.includes('name')) {
        if (isSingleCustomer) {
          return <span key={i}>{singleCustomerName}</span>;
        } else {
          return (
            <span key={i} className="inline-flex items-center bg-canvas-soft text-ink border border-hairline rounded-[4px] px-1.5 py-px mx-0.5 text-[11px] font-[600] uppercase tracking-wider leading-none align-baseline shadow-sm">
              Customer Name
            </span>
          );
        }
      }
      if (p.includes('shop') || p.includes('link')) {
        return (
          <span key={i} className="inline-flex items-center bg-ink text-white border border-ink rounded-[4px] px-1.5 py-px mx-0.5 text-[12px] font-[600] uppercase tracking-wider leading-none align-baseline shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
            Shop Now
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-canvas pb-20">
      
      {/* PAGE HEADER */}
      <div className="px-4 md:px-6 py-6 border-b border-hairline flex flex-col gap-1">
        <h1 className="text-[24px] font-[700] text-ink leading-tight">Campaign Studio</h1>
        <p className="text-[14px] text-ink-muted">AI-assisted campaign creation and intelligence.</p>
      </div>

      <div className="flex flex-col p-4 md:p-6 max-w-[1000px]">
        
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <span className="text-[12px] font-[600] text-ink-muted uppercase tracking-wider break-words line-clamp-1">Channel</span>
                <span className="text-[16px] font-[600] text-ink truncate">{recommendation.channel || 'Based on customer data'}</span>
              </div>
            </div>

            {/* Split Message Editor / Preview */}
            <div className="flex flex-col md:flex-row gap-6 items-stretch">
              
              {/* Left: Editor */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex items-center gap-4 border-b border-hairline overflow-x-auto pb-1">
                  {['WhatsApp', 'Email', 'SMS', 'Instagram', 'Facebook'].map((channel) => (
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
                    className="btn-primary w-full py-3 text-[14px] flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-spin text-white">
                          <line x1="12" y1="2" x2="12" y2="6"></line>
                          <line x1="12" y1="18" x2="12" y2="22"></line>
                          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                          <line x1="2" y1="12" x2="6" y2="12"></line>
                          <line x1="18" y1="12" x2="22" y2="12"></line>
                          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                        </svg>
                        Launching...
                      </>
                    ) : (
                      <>
                        Launch Campaign <FastArrowRight height={16} width={16} />
                      </>
                    )}
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
                      <div className="bg-white rounded-[8px] rounded-tl-none p-1 max-w-[90%] shadow-sm self-start relative text-[14px] text-slate-800 leading-relaxed whitespace-pre-wrap">
                        <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=400" className="w-full h-[140px] object-cover rounded-[6px] mb-2" alt="Preview" />
                        <div className="px-2 pb-2">
                           {renderMessagePreview(editableMessage)}
                           <div className="text-[10px] text-slate-400 text-right mt-1">10:42 AM</div>
                        </div>
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
                    <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=800" className="w-full h-[180px] object-cover" alt="Email Header" />
                    <div className="p-6 flex flex-col gap-4 text-[14px] text-ink leading-relaxed items-center text-center">
                      <div className="text-[20px] font-serif font-bold tracking-tight">BRAND.</div>
                      <p className="whitespace-pre-wrap text-left w-full">{renderMessagePreview(editableMessage)}</p>
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
                        {renderMessagePreview(editableMessage)}
                      </div>
                      <div className="text-[10px] text-ink-muted text-center mt-2">Read 10:42 AM</div>
                    </div>
                  </div>
                )}

                {selectedChannel === 'Instagram' && (
                  <div className="w-[320px] bg-black rounded-[24px] border-[8px] border-slate-800 overflow-hidden flex flex-col shadow-sm relative text-white">
                    {/* Header */}
                    <div className="px-4 py-3 flex items-center justify-between border-b border-white/10 z-10">
                       <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 p-[2px]">
                             <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                               <span className="text-[10px] font-bold">B</span>
                             </div>
                          </div>
                          <span className="text-[13px] font-[600]">brand_official</span>
                       </div>
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                    </div>
                    {/* Image Area */}
                    <div className="w-full aspect-square bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
                       <img src={messagePreview?.imageUrl || "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=800"} className="w-full h-full object-cover" alt="Post" />
                    </div>
                    {/* Actions & Caption */}
                    <div className="flex-1 p-4 flex flex-col gap-3 relative z-10 bg-black">
                       <div className="flex items-center gap-4 text-white">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                       </div>
                       <div className="text-[13px] leading-snug whitespace-pre-wrap">
                          <span className="font-[600] mr-2">brand_official</span>
                          <span className="opacity-90">{renderMessagePreview(editableMessage)}</span>
                       </div>
                    </div>
                  </div>
                )}

                {selectedChannel === 'Facebook' && (
                  <div className="w-[320px] bg-white rounded-[24px] border-[8px] border-slate-800 overflow-hidden flex flex-col shadow-sm relative text-slate-900">
                    {/* Header */}
                    <div className="px-4 py-3 flex items-center gap-2 z-10">
                        <div className="w-10 h-10 rounded-full bg-[#0866FF] flex items-center justify-center text-white shrink-0">
                          <span className="text-[16px] font-bold">B</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-[600] leading-tight">Brand Page</span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">Sponsored <span className="text-[8px]">•</span> <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></span>
                        </div>
                    </div>
                    {/* Caption */}
                    <div className="px-4 pb-3 text-[14px] leading-snug whitespace-pre-wrap relative z-10">
                       {renderMessagePreview(editableMessage)}
                    </div>
                    {/* Image Area */}
                    <div className="w-full h-[200px] bg-slate-100 flex flex-col items-center justify-center border-y border-hairline overflow-hidden">
                       <img src={messagePreview?.imageUrl || "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=800"} className="w-full h-full object-cover" alt="Ad Creative" />
                    </div>
                    {/* Actions */}
                    <div className="px-4 py-3 bg-slate-50 flex items-center justify-between border-b border-hairline">
                       <div className="flex flex-col">
                          <span className="text-[11px] text-slate-500 uppercase tracking-wide">brand.com</span>
                          <span className="text-[14px] font-[600]">Shop the collection today</span>
                       </div>
                       <button className="bg-slate-200 hover:bg-slate-300 text-slate-900 px-3 py-1.5 rounded-[4px] text-[13px] font-[600] transition-colors">Shop Now</button>
                    </div>
                    <div className="px-4 py-2 flex items-center justify-between text-slate-500">
                       <div className="flex items-center gap-1">
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-sm border border-white"><svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg></div>
                          <span className="text-[12px] ml-1">1.2K</span>
                       </div>
                       <span className="text-[12px]">45 Comments • 12 Shares</span>
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
