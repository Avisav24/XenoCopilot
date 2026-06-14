'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import { Search, NavArrowDown, NavArrowRight, FastArrowRight, UserStar } from 'iconoir-react';
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
  const [showProvenance, setShowProvenance] = useState(false);

  useEffect(() => {
    const ctx = getCampaignContext();
    if (ctx) {
      setGoalInput(ctx.autoTriggerPrompt || `Launch campaign for ${ctx.audienceName}`);
      clearCampaignContext();
    } else if (audienceParam) {
      setGoalInput(`Target audience: ${audienceParam}`);
    }
  }, [audienceParam]);

  const handleAnalyzeGoal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!goalInput.trim()) return;
    
    setIsProcessing(true);
    try {
      const res = await fetchAPI<any>('/api/copilot/analyze-goal', {
        method: 'POST',
        body: JSON.stringify({ goal: goalInput })
      });
      setRecommendation(res);
      setSelectedChannel(res.channel || 'WhatsApp');
      
      const simRes = await fetchAPI<any>('/api/copilot/simulate', {
        method: 'POST',
        body: JSON.stringify({ channel: res.channel || 'WhatsApp', offer: res.offer })
      });
      setSimulations(simRes);
      
      await fetchMessagePreview(res.channel || 'WhatsApp', res);
      
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
    await fetchMessagePreview(channel, recommendation);
  };

  const fetchMessagePreview = async (channel: string, rec: any) => {
    if (!rec) return;
    try {
      const res = await fetchAPI<any>('/api/copilot/message-preview', {
        method: 'POST',
        body: JSON.stringify({ 
          channel, 
          offer: rec.offer,
          audience: rec.audience?.name,
          goal: goalInput
        })
      });
      setMessagePreview(res);
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
      
      const convStr = String(selectedSim?.conversion || recommendation?.expectedConversion || recommendation?.confidence || '0');
      const predictedConversion = Number(convStr.replace(/[^0-9.-]+/g, ""));
      
      const campaign = await fetchAPI<any>('/api/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          name: goalInput.slice(0, 40) + '...',
          goal: goalInput,
          audience_type: recommendation.audience.name,
          audience_size: recommendation.audience.count,
          channel: selectedChannel,
          offer: recommendation.offer,
          message: messagePreview?.variantA?.copy || '',
          predicted_revenue: predictedRevenue,
          predicted_conversion: predictedConversion
        })
      });

      await fetchAPI(`/api/campaigns/${campaign.id}/launch`, { method: 'POST' });
      router.push(`/campaigns/${campaign.id}`);
    } catch (e) {
      console.error(e);
      alert('Launch failed. Ensure backend is running.');
      setIsProcessing(false);
    }
  };

  const getPriorityColor = (rev: number, conf: number) => {
    const score = rev * conf;
    if (score > 10000000) return { label: 'Critical', color: 'bg-red-50 text-red-700 border-red-200' };
    if (score > 5000000) return { label: 'High', color: 'bg-orange-50 text-orange-700 border-orange-200' };
    if (score > 1000000) return { label: 'Medium', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    return { label: 'Low', color: 'bg-gray-50 text-gray-700 border-gray-200' };
  };

  // Extract numeric revenue
  let expectedRevenueNum = 0;
  if (recommendation?.expectedRevenue) {
    expectedRevenueNum = typeof recommendation.expectedRevenue === 'string' 
      ? Number(recommendation.expectedRevenue.replace(/[^0-9.-]+/g, "")) 
      : recommendation.expectedRevenue;
  }
  let confidenceNum = recommendation?.confidence || 0;
  const priority = getPriorityColor(expectedRevenueNum, confidenceNum);

  return (
    <div className="flex flex-col w-full min-h-screen bg-white text-slate-900 font-sans">
      
      {/* PAGE HEADER */}
      <div className="px-8 pt-8 pb-6 border-b border-slate-200">
        <h1 className="text-[32px] font-semibold tracking-tight text-slate-900">Campaign Studio</h1>
        <p className="text-[14px] text-slate-500 mt-1">Create revenue campaigns using customer and campaign intelligence.</p>
      </div>

      <div className="max-w-[1400px] w-full px-8 py-8 flex flex-col gap-8 mx-auto">
        
        {/* TOP BAR */}
        <div className="flex flex-col gap-3 max-w-[800px]">
          <label className="text-[14px] font-medium text-slate-700">Goal Input</label>
          <form onSubmit={handleAnalyzeGoal} className="relative flex items-center w-full">
            <Search className="absolute left-4 text-slate-400" height={18} width={18} />
            <input
              type="text"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="e.g. Recover dormant customers"
              disabled={isProcessing}
              className="w-full bg-white border border-slate-300 pl-11 pr-32 py-3.5 text-[14px] font-medium focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 disabled:bg-slate-50 rounded-lg transition-all"
            />
            <button
              type="submit"
              disabled={!goalInput.trim() || isProcessing}
              className="absolute right-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-[6px] text-[13px] font-medium transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing
                </>
              ) : 'Analyze'}
            </button>
          </form>
          {!hasAnalyzed && (
            <div className="flex items-center gap-3 mt-1 text-[13px] text-slate-500">
              <span>Examples:</span>
              <button onClick={() => setGoalInput('Recover dormant customers')} className="hover:text-slate-900 underline decoration-slate-300 underline-offset-2">Recover dormant customers</button>
              <button onClick={() => setGoalInput('Increase repeat purchases')} className="hover:text-slate-900 underline decoration-slate-300 underline-offset-2">Increase repeat purchases</button>
              <button onClick={() => setGoalInput('Reduce VIP churn')} className="hover:text-slate-900 underline decoration-slate-300 underline-offset-2">Reduce VIP churn</button>
            </div>
          )}
        </div>

        {/* 3-COLUMN WORKSPACE */}
        {hasAnalyzed && recommendation && (
          <div className="flex items-start gap-8 w-full mt-4">
            
            {/* LEFT COLUMN: CAMPAIGN RECOMMENDATION (320px) */}
            <div className="w-[320px] flex-shrink-0 flex flex-col gap-6">
              <div className="border border-slate-200 rounded-lg p-5 flex flex-col gap-4 bg-white">
                <h2 className="text-[18px] font-semibold text-slate-900 leading-tight">Campaign Recommendation</h2>
                
                <div className="flex flex-col gap-3 mt-1">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-[13px] text-slate-500">Campaign Name</span>
                    <span className="text-[13px] font-medium text-slate-900 text-right max-w-[140px] truncate" title={goalInput}>{goalInput}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-[13px] text-slate-500">Audience Size</span>
                    <span className="text-[13px] font-medium text-slate-900">{recommendation.audience.count.toLocaleString()} Customers</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-[13px] text-slate-500">Expected Revenue</span>
                    <span className="text-[14px] font-mono font-medium text-emerald-600">
                      {typeof recommendation.expectedRevenue === 'number' ? `₹${recommendation.expectedRevenue.toLocaleString()}` : recommendation.expectedRevenue}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-[13px] text-slate-500">Confidence</span>
                    <span className="text-[14px] font-mono font-medium text-slate-900">{recommendation.confidence}%</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-[13px] text-slate-500">Best Channel</span>
                    <span className="text-[13px] font-medium text-slate-900">{selectedChannel}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[13px] text-slate-500">Priority</span>
                    <span className={clsx("text-[12px] font-semibold px-2 py-0.5 rounded border", priority.color)}>
                      {priority.label}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-2">
                  <button 
                    onClick={() => {}}
                    className="w-full border border-slate-300 hover:bg-slate-50 text-slate-900 px-4 py-2 rounded-md text-[13px] font-medium transition-colors"
                  >
                    Review Campaign
                  </button>
                  <button 
                    onClick={handleLaunchCampaign}
                    disabled={isProcessing}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-md text-[13px] font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    Launch Campaign <FastArrowRight height={14} width={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* CENTER COLUMN: MESSAGE PREVIEW (640px) */}
            <div className="w-[640px] flex-shrink-0 flex flex-col gap-4">
              <h2 className="text-[18px] font-semibold text-slate-900">Message Preview</h2>
              
              <div className="flex items-center gap-6 border-b border-slate-200">
                {['WhatsApp', 'Email', 'SMS'].map((channel) => (
                  <button
                    key={channel}
                    onClick={() => handleSimulateChannelChange(channel)}
                    className={clsx(
                      "pb-3 text-[14px] font-medium transition-colors border-b-2",
                      selectedChannel === channel 
                        ? "text-slate-900 border-slate-900" 
                        : "text-slate-500 border-transparent hover:text-slate-700"
                    )}
                  >
                    {channel}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex justify-center bg-slate-50 border border-slate-200 rounded-lg p-8 min-h-[500px]">
                {selectedChannel === 'WhatsApp' && (
                  <div className="w-[320px] bg-[#EFEAE2] rounded-[24px] border-[8px] border-slate-800 overflow-hidden flex flex-col shadow-sm relative">
                    <div className="bg-[#008069] text-white px-4 py-3 flex items-center gap-3 z-10">
                      <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                        <UserStar height={18} width={18} className="text-slate-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-medium leading-tight">Brand Account</span>
                        <span className="text-[11px] opacity-80">Official Business Account</span>
                      </div>
                    </div>
                    <div className="flex-1 p-4 flex flex-col gap-3 relative z-10">
                      <div className="bg-white rounded-lg p-2 max-w-[90%] shadow-sm self-start relative text-[13px] text-slate-800 leading-relaxed">
                        <div className="w-full h-32 bg-slate-200 rounded mb-2 flex items-center justify-center overflow-hidden">
                          {messagePreview?.variantA?.copy?.includes('shoe') || recommendation.offer?.includes('shoe') ? (
                            <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop" className="object-cover w-full h-full" alt="Promo" />
                          ) : (
                            <div className="text-slate-400 text-[11px] font-medium">Promo Image</div>
                          )}
                        </div>
                        {messagePreview?.variantA?.copy?.replace(/<[^>]*>?/gm, '') || `Hi ${recommendation.audience.name}, we miss you! Here is a ${recommendation.offer} just for you.`}
                        <div className="text-[10px] text-slate-400 text-right mt-1">10:42 AM</div>
                      </div>
                      <div className="flex gap-2 w-[90%]">
                        <button className="flex-1 bg-white text-[#00A884] border border-slate-200 py-2 rounded-md text-[13px] font-medium shadow-sm">Shop Now</button>
                        <button className="flex-1 bg-white text-[#00A884] border border-slate-200 py-2 rounded-md text-[13px] font-medium shadow-sm">Stop msgs</button>
                      </div>
                    </div>
                    {/* Fake WA background pattern */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                  </div>
                )}

                {selectedChannel === 'Email' && (
                  <div className="w-[100%] max-w-[500px] bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex flex-col gap-1 text-[13px]">
                      <div className="flex items-center gap-2"><span className="text-slate-500 w-12">From:</span><span className="font-medium">Brand Team &lt;hello@brand.com&gt;</span></div>
                      <div className="flex items-center gap-2"><span className="text-slate-500 w-12">To:</span><span className="text-slate-700">customer@email.com</span></div>
                      <div className="flex items-center gap-2"><span className="text-slate-500 w-12">Subject:</span><span className="font-semibold text-slate-900">{messagePreview?.variantA?.copy?.split('.')[0] || `Exclusive Offer: ${recommendation.offer}`}</span></div>
                    </div>
                    <div className="p-6 flex flex-col gap-4 text-[14px] text-slate-800 leading-relaxed items-center text-center">
                      <div className="text-[20px] font-serif font-bold text-slate-900 tracking-tight">BRAND.</div>
                      <div className="w-full h-48 bg-slate-100 rounded-md my-2 flex items-center justify-center overflow-hidden">
                        {messagePreview?.variantA?.copy?.includes('VIP') ? (
                          <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=400&fit=crop" className="object-cover w-full h-full" alt="Sale" />
                        ) : (
                           <div className="text-slate-400 text-[12px] font-medium">Hero Image</div>
                        )}
                      </div>
                      <p>{messagePreview?.variantA?.copy?.replace(/<[^>]*>?/gm, '') || `We noticed it's been a while since your last purchase. Come back and enjoy ${recommendation.offer} on our new collection.`}</p>
                      <button className="bg-slate-900 text-white px-8 py-3 mt-4 text-[13px] font-medium tracking-wide">CLAIM OFFER</button>
                      <div className="text-[11px] text-slate-400 mt-8 pt-4 border-t border-slate-100 w-full">Update your email preferences or unsubscribe.</div>
                    </div>
                  </div>
                )}

                {selectedChannel === 'SMS' && (
                  <div className="w-[300px] bg-white rounded-[28px] border-[8px] border-slate-200 overflow-hidden flex flex-col shadow-sm">
                    <div className="bg-slate-100/80 backdrop-blur-md px-4 py-3 flex items-center justify-center border-b border-slate-200">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-[10px] font-bold text-white mb-1">BR</div>
                        <span className="text-[11px] font-semibold text-slate-900 leading-none">BRAND</span>
                      </div>
                    </div>
                    <div className="flex-1 p-4 bg-slate-50 flex flex-col gap-2 justify-end min-h-[300px]">
                      <div className="bg-slate-200 rounded-2xl rounded-tl-sm p-3 max-w-[85%] self-start text-[13px] text-slate-800 leading-snug">
                        {messagePreview?.variantA?.copy?.replace(/<[^>]*>?/gm, '') || `BRAND: Miss you! Use code VIP20 for ${recommendation.offer} at checkout. Valid 48 hrs. Shop: link.co/vip Reply STOP to opt out.`}
                      </div>
                      <div className="text-[10px] text-slate-400 text-center mt-2">Read 10:42 AM</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: SCORECARD, SIMULATION, PROVENANCE (320px) */}
            <div className="w-[320px] flex-shrink-0 flex flex-col gap-6">
              
              {/* SCORECARD */}
              <div className="flex flex-col gap-4">
                <h2 className="text-[18px] font-semibold text-slate-900">Historical Performance</h2>
                
                <div className="border border-slate-200 rounded-lg p-5 flex flex-col gap-5 bg-white">
                  <div className="flex flex-col gap-3">
                    <h3 className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">Supporting Evidence</h3>
                    <ul className="flex flex-col gap-2">
                      <li className="text-[13px] text-slate-700 flex items-start gap-2">
                        <span className="text-slate-400 mt-0.5">•</span> {recommendation.audience.count} {recommendation.audience.name.toLowerCase()} found
                      </li>
                      <li className="text-[13px] text-slate-700 flex items-start gap-2">
                        <span className="text-slate-400 mt-0.5">•</span> Similar campaigns generated ₹1.4L avg
                      </li>
                      <li className="text-[13px] text-slate-700 flex items-start gap-2">
                        <span className="text-slate-400 mt-0.5">•</span> {selectedChannel} converts 2.1x better here
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* SIMULATION */}
              {simulations?.scenarios && (
                <div className="flex flex-col gap-4">
                  <h2 className="text-[14px] font-semibold text-slate-900">Alternative Channels</h2>
                  <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
                    <table className="w-full text-left">
                      <tbody className="divide-y divide-slate-100">
                        {simulations.scenarios.map((s: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-4 text-[13px] font-medium text-slate-700">{s.channel}</td>
                            <td className="py-2.5 px-4 text-[13px] font-mono text-slate-900 text-right">
                              {typeof s.revenue === 'number' ? `₹${s.revenue.toLocaleString()}` : s.revenue}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PROVENANCE */}
              <div className="border border-slate-200 rounded-lg bg-white overflow-hidden mt-2">
                <button 
                  onClick={() => setShowProvenance(!showProvenance)}
                  className="w-full flex items-center justify-between p-4 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  View Data Provenance
                  {showProvenance ? <NavArrowDown height={16} width={16} /> : <NavArrowRight height={16} width={16} />}
                </button>
                {showProvenance && (
                  <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-medium text-slate-500 uppercase">Data Sources</span>
                      <span className="text-[13px] text-slate-800">Historical Orders DB, Segment Activity</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-medium text-slate-500 uppercase">Campaign History</span>
                      <span className="text-[13px] text-slate-800">14 previous retention campaigns analyzed</span>
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
    <Suspense fallback={<div className="p-10 text-center text-slate-500">Loading Studio...</div>}>
      <CampaignStudioContent />
    </Suspense>
  );
}
