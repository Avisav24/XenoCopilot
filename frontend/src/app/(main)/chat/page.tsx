'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import { Spark, ArrowRight, CheckCircle, DatabaseScript, Presentation, FastArrowRight, NavArrowRight, RefreshDouble, GraphUp, Eye } from 'iconoir-react';
import { getCampaignContext, clearCampaignContext } from '@/lib/campaignContext';
import { clsx } from 'clsx';

type Step = 'GOAL' | 'RECOMMENDATION' | 'REVIEW' | 'LEARN';

function CampaignStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const audienceParam = searchParams.get('audience');
  
  const [step, setStep] = useState<Step>('GOAL');
  const [goalInput, setGoalInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Data State
  const [recommendation, setRecommendation] = useState<any>(null);
  const [simulations, setSimulations] = useState<any>(null);
  const [selectedChannel, setSelectedChannel] = useState('WhatsApp');
  const [learnings, setLearnings] = useState<any>(null);
  const [messagePreview, setMessagePreview] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<'A'|'B'>('A');

  const [recommendationsData, setRecommendationsData] = useState<any>(null);

  useEffect(() => {
    fetchAPI<any>('/api/ai/recommendations').then(setRecommendationsData).catch(console.error);
  }, []);

  // Initialize from Context (e.g. clicking from Revenue Opportunities)
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
      setSelectedChannel(res.channel);
      
      // Auto fetch initial simulation table
      const simRes = await fetchAPI<any>('/api/copilot/simulate', {
        method: 'POST',
        body: JSON.stringify({ channel: res.channel, offer: res.offer })
      });
      setSimulations(simRes);
      
      setSimulations(simRes);
      
      // Fetch initial message preview
      await fetchMessagePreview(res.channel, res);

      setStep('RECOMMENDATION');
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
    setPreviewLoading(true);
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
      setSelectedVariant('A');
    } catch (e) {
      console.error(e);
    } finally {
      setPreviewLoading(false);
    }
  };

  const renderMessageWithVars = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(<var>.*?<\/var>)/g);
    return parts.map((part, i) => {
      if (part.startsWith('<var>') && part.endsWith('</var>')) {
         const val = part.slice(5, -6);
         return <span key={i} className="inline-block bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-[4px] font-bold text-[11px] mx-0.5 shadow-sm border border-indigo-200">{val}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const handleLaunchCampaign = async () => {
    setIsProcessing(true);
    try {
      const selectedSim = simulations?.scenarios?.find((s: any) => s.channel === selectedChannel) || recommendation;
      
      // Parse predicted values to numbers
      const revStr = selectedSim.revenue || recommendation.expectedRevenue;
      const convStr = selectedSim.conversion || recommendation.expectedConversion;
      const predictedRevenue = Number(revStr.replace(/[^0-9.-]+/g, ""));
      const predictedConversion = Number(convStr.replace(/[^0-9.-]+/g, ""));
      
      // 1. Create Campaign
      const campaign = await fetchAPI<any>('/api/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          name: goalInput.slice(0, 40) + '...',
          goal: goalInput,
          audience_type: recommendation.audience.name,
          audience_size: recommendation.audience.count,
          channel: selectedChannel,
          offer: recommendation.offer,
          message: messagePreview?.[selectedVariant === 'A' ? 'variantA' : 'variantB']?.copy || '',
          predicted_revenue: predictedRevenue,
          predicted_conversion: predictedConversion
        })
      });

      // 2. Launch Campaign
      await fetchAPI(`/api/campaigns/${campaign.id}/launch`, { method: 'POST' });
      
      // 3. Redirect to Detail Page
      router.push(`/campaigns/${campaign.id}`);
      
    } catch (e) {
      console.error(e);
      alert('Launch failed. Ensure backend is running.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-white text-slate-900 pb-24">
      
      {/* HEADER */}
      <div className="px-8 pt-8 pb-6 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center bg-slate-50 text-slate-700">
            <Spark height={16} width={16} />
          </div>
          <h1 className="text-[20px] font-bold tracking-tight">AI Campaign Studio</h1>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto w-full px-8 py-10 flex flex-col gap-12">
        
        {/* SECTION 1: GOAL MODE */}
        {true && (
          <div className={clsx("flex flex-col gap-6 transition-all duration-500", step !== 'GOAL' && "opacity-60")}>
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Business Goal Input</label>
              <form onSubmit={handleAnalyzeGoal} className="relative flex items-center w-full">
                <input
                  type="text"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  placeholder="e.g. Increase revenue by ₹10 lakh this month"
                  disabled={step !== 'GOAL' || isProcessing}
                  className={clsx(
                    "w-full bg-white border border-[#E5E7EB] pl-4 pr-32 py-4 text-[15px] font-medium focus:outline-none disabled:bg-slate-50 transition-all rounded-[12px] focus:border-slate-800"
                  )}
                />
                {step === 'GOAL' && (
                  <button
                    type="submit"
                    disabled={!goalInput.trim() || isProcessing}
                    className="absolute right-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-[6px] text-[13px] font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isProcessing ? 'Analyzing...' : 'Analyze'} <ArrowRight height={16} width={16} />
                  </button>
                )}
              </form>
            </div>

            {/* SUGGESTED OPPORTUNITIES (Always Visible in GOAL step) */}
            {step === 'GOAL' && recommendationsData && (
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <h3 className="text-[12px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Spark height={14} width={14} className="text-emerald-600" />
                    Recommended Opportunities
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Updated {recommendationsData.globalStats?.updatedAgo} • Based on {recommendationsData.globalStats?.totalCustomers?.toLocaleString()} customers
                  </span>
                </div>
                
                <div className="flex flex-col gap-3">
                  {recommendationsData.recommendations
                    .filter((r: any) => r.title.toLowerCase().includes(goalInput.toLowerCase()) || r.type.toLowerCase().includes(goalInput.toLowerCase()))
                    .map((r: any) => (
                      <div 
                        key={r.id}
                        onClick={() => {
                          setGoalInput(r.title);
                        }}
                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-[12px] hover:border-emerald-300 hover:shadow-sm cursor-pointer transition-all group"
                      >
                         <div className="flex flex-col gap-1.5 flex-1">
                           <div className="text-[14px] font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{r.title}</div>
                           <div className="text-[13px] text-slate-500">{r.reasoning}</div>
                         </div>
                         <div className="flex items-center gap-8 ml-6">
                           <div className="flex flex-col items-end gap-1">
                             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expected Revenue</div>
                             <div className="text-[15px] font-mono font-bold text-emerald-600">{r.expectedRevenueFormatted}</div>
                           </div>
                           <div className="flex flex-col items-end gap-1 w-16">
                             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confidence</div>
                             <div className="text-[15px] font-mono font-bold text-slate-900">{r.confidence}%</div>
                           </div>
                           <div className="w-8 flex justify-end text-slate-300 group-hover:text-emerald-500 transition-colors">
                             <ArrowRight height={18} width={18} />
                           </div>
                         </div>
                      </div>
                    ))}
                  {recommendationsData.recommendations.filter((r: any) => r.title.toLowerCase().includes(goalInput.toLowerCase()) || r.type.toLowerCase().includes(goalInput.toLowerCase())).length === 0 && (
                     <div className="p-8 text-center bg-slate-50 border border-gray-200 rounded-[12px] text-[13px] text-slate-500 font-medium">No matching opportunities found.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 2, 3, 4: RECOMMENDATION MODE */}
        {step === 'RECOMMENDATION' && recommendation && (
          <div className="flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="flex flex-col gap-4">
               <h2 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                 <Spark height={14} width={14} className="text-emerald-600" /> AI Recommendation
               </h2>
               <div className="border border-gray-200 rounded-[8px] bg-white shadow-sm overflow-hidden">
                 <table className="w-full text-left">
                   <tbody className="divide-y divide-gray-100">
                     <tr>
                       <td className="w-1/3 py-4 px-6 text-[13px] font-semibold text-slate-500 bg-slate-50 border-r border-gray-100">Audience</td>
                       <td className="py-4 px-6 text-[14px] font-bold text-slate-900">{recommendation.audience?.name} <span className="text-slate-500 font-medium text-[13px] ml-2">({recommendation.audience?.count} Customers)</span></td>
                     </tr>
                     <tr>
                       <td className="w-1/3 py-4 px-6 text-[13px] font-semibold text-slate-500 bg-slate-50 border-r border-gray-100">Channel</td>
                       <td className="py-4 px-6 text-[14px] font-bold text-slate-900">{recommendation.channel}</td>
                     </tr>
                     <tr>
                       <td className="w-1/3 py-4 px-6 text-[13px] font-semibold text-slate-500 bg-slate-50 border-r border-gray-100">Offer</td>
                       <td className="py-4 px-6 text-[14px] font-bold text-slate-900">{recommendation.offer}</td>
                     </tr>
                     <tr>
                       <td className="w-1/3 py-4 px-6 text-[13px] font-semibold text-slate-500 bg-slate-50 border-r border-gray-100">Expected Revenue</td>
                       <td className="py-4 px-6 text-[15px] font-mono font-bold text-emerald-600">{recommendation.expectedRevenue}</td>
                     </tr>
                     <tr>
                       <td className="w-1/3 py-4 px-6 text-[13px] font-semibold text-slate-500 bg-slate-50 border-r border-gray-100">Expected Conversion</td>
                       <td className="py-4 px-6 text-[15px] font-mono font-bold text-slate-900">{recommendation.expectedConversion}</td>
                     </tr>
                     <tr>
                       <td className="w-1/3 py-4 px-6 text-[13px] font-semibold text-slate-500 bg-slate-50 border-r border-gray-100">Expected Purchasers</td>
                       <td className="py-4 px-6 text-[14px] font-bold text-slate-900">{recommendation.expectedPurchasers}</td>
                     </tr>
                   </tbody>
                 </table>
               </div>
            </div>

            {/* SECTION 3: PROVENANCE / EVIDENCE */}
            <div className="flex flex-col gap-4">
               <h2 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                 <DatabaseScript height={14} width={14} className="text-blue-600" /> Recommendation Provenance
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 
                 <div className="flex flex-col gap-3">
                   <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider border-b border-gray-200 pb-2">Why This Audience?</h3>
                   <ul className="flex flex-col gap-2.5">
                     {recommendation.evidence?.audience?.map((ev: string, i: number) => (
                       <li key={i} className="text-[13px] text-slate-600 leading-snug flex items-start gap-2">
                         <span className="text-slate-300 mt-0.5">•</span> {ev}
                       </li>
                     ))}
                   </ul>
                 </div>

                 <div className="flex flex-col gap-3">
                   <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider border-b border-gray-200 pb-2">Why {recommendation.channel}?</h3>
                   <ul className="flex flex-col gap-2.5">
                     {recommendation.evidence?.channel?.map((ev: string, i: number) => (
                       <li key={i} className="text-[13px] text-slate-600 leading-snug flex items-start gap-2">
                         <span className="text-slate-300 mt-0.5">•</span> {ev}
                       </li>
                     ))}
                   </ul>
                 </div>

                 <div className="flex flex-col gap-3">
                   <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider border-b border-gray-200 pb-2">Why This Offer?</h3>
                   <ul className="flex flex-col gap-2.5">
                     {recommendation.evidence?.offer?.map((ev: string, i: number) => (
                       <li key={i} className="text-[13px] text-slate-600 leading-snug flex items-start gap-2">
                         <span className="text-slate-300 mt-0.5">•</span> {ev}
                       </li>
                     ))}
                   </ul>
                 </div>

               </div>
            </div>

            {/* SECTION 4: SIMULATION MODE */}
            {simulations && (
              <div className="flex flex-col gap-4 border-t border-gray-200 pt-12">
                 <h2 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                   <RefreshDouble height={14} width={14} className="text-purple-600" /> Scenario Comparison
                 </h2>
                 <p className="text-[13px] text-slate-500 mb-2">Simulate alternative channels based on historical memory before launching.</p>
                 
                 <div className="border border-gray-200 rounded-[8px] bg-white shadow-sm overflow-hidden">
                   <table className="w-full text-left">
                     <thead className="bg-slate-50 border-b border-gray-200">
                       <tr>
                         <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Channel</th>
                         <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Expected Revenue</th>
                         <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">ROI</th>
                         <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Conversion</th>
                         <th className="py-3 px-5 w-10"></th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                       {simulations.scenarios?.map((sc: any, i: number) => {
                         const isSelected = selectedChannel === sc.channel;
                         return (
                           <tr 
                             key={i} 
                             onClick={() => handleSimulateChannelChange(sc.channel)}
                             className={clsx("cursor-pointer transition-colors", isSelected ? "bg-emerald-50/50" : "hover:bg-slate-50")}
                           >
                             <td className="py-4 px-5">
                               <div className="flex items-center gap-2">
                                 <div className={clsx("w-3 h-3 rounded-full border flex items-center justify-center", isSelected ? "border-emerald-600 bg-emerald-600" : "border-gray-300")}>
                                   {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                 </div>
                                 <span className={clsx("text-[14px] font-bold", isSelected ? "text-emerald-800" : "text-slate-900")}>{sc.channel}</span>
                               </div>
                             </td>
                             <td className="py-4 px-5 text-[14px] font-mono font-semibold text-right text-slate-900">{sc.revenue}</td>
                             <td className="py-4 px-5 text-[14px] font-mono font-semibold text-right text-slate-900">{sc.roi}</td>
                             <td className="py-4 px-5 text-[14px] font-mono font-semibold text-right text-slate-900">{sc.conversion}</td>
                           </tr>
                         );
                       })}
                     </tbody>
                   </table>
                 </div>
              </div>
            )}

             {/* SECTION 4.5: MESSAGE EXPERIENCE PREVIEW */}
             {messagePreview && (
               <div className="flex flex-col gap-4 border-t border-gray-200 pt-12">
                 <h2 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                   <Eye height={14} width={14} className="text-blue-600" /> Customer Experience Preview
                 </h2>
                 <p className="text-[13px] text-slate-500 mb-2">See exactly how customers will experience this campaign across every channel.</p>
                 
                 {previewLoading ? (
                   <div className="flex justify-center items-center h-32 text-slate-400 text-[13px] font-medium">Generating realistic preview...</div>
                 ) : (
                   <div className="flex flex-col gap-6">
                     {/* TABS */}
                     <div className="flex gap-1 border-b border-gray-200">
                       <button className="px-4 py-2 border-b-2 border-slate-900 text-[13px] font-bold text-slate-900">{messagePreview.channel}</button>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-8">
                       {/* LEFT: PREVIEW */}
                       <div className="flex flex-col gap-4">
                         <div className="bg-slate-50 border border-gray-200 rounded-[8px] p-6 flex items-center justify-center min-h-[300px]">
                           {messagePreview.channel === 'WhatsApp' && (
                             <div className="w-full max-w-[320px] rounded-[16px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.1)] flex flex-col bg-[#e5ddd5] relative" style={{ backgroundImage: "url('https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')", backgroundSize: 'cover' }}>
                               
                               {/* HEADER */}
                               <div className="bg-[#095E54] px-4 py-3 flex items-center justify-between relative z-10">
                                 <div className="flex items-center gap-3">
                                   <div className="relative">
                                     <img src="https://i.pravatar.cc/100?img=5" alt="Avatar" className="w-10 h-10 rounded-full border border-white/20" />
                                     <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] border-2 border-[#095E54] rounded-full"></div>
                                   </div>
                                   <div className="flex flex-col text-white">
                                     <span className="font-bold text-[15px] leading-tight">Xeno Fashion</span>
                                     <span className="text-[11px] text-white/80">Typically replies within a day</span>
                                   </div>
                                 </div>
                                 <button className="text-white/60 hover:text-white transition-colors">
                                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                 </button>
                               </div>

                               {/* CHAT BODY */}
                               <div className="p-4 flex flex-col gap-3 relative z-10 min-h-[140px]">
                                 {/* CHAT BUBBLE */}
                                 <div className="bg-white max-w-[90%] self-start rounded-[12px] rounded-tl-none px-3 pt-2.5 pb-2 shadow-sm relative">
                                   {/* Fake tail */}
                                   <div className="absolute top-0 -left-2 w-0 h-0 border-[6px] border-transparent border-t-white border-r-white"></div>
                                   <div className="text-[13px] text-[#111b21] leading-snug whitespace-pre-wrap pr-10">
                                     {renderMessageWithVars(messagePreview[selectedVariant === 'A' ? 'variantA' : 'variantB']?.copy)}
                                   </div>
                                   <div className="text-[10px] text-slate-400 text-right mt-1.5 float-right -mb-1">
                                     8:00 PM
                                   </div>
                                 </div>
                               </div>

                               {/* CTA BUTTON */}
                               <div className="px-4 pb-4 relative z-10">
                                 <button className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 px-4 rounded-[24px] flex items-center justify-center gap-2 shadow-md transition-all text-[14px]">
                                   <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.052 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                                   Chat on WhatsApp
                                 </button>
                               </div>
                             </div>
                           )}
                           {messagePreview.channel === 'Email' && (
                             <div className="bg-[#f4f5f7] w-full max-w-[320px] rounded-[16px] shadow-[0_5px_20px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden border border-gray-200">
                               {/* Mock Browser/Email Client Header */}
                               <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
                                 <div className="text-[12px] font-bold text-slate-800 line-clamp-1">{messagePreview[selectedVariant === 'A' ? 'variantA' : 'variantB']?.copy?.split('\n\n')[0]?.replace('Subject: ', '')}</div>
                               </div>
                               
                               {/* Email Body Area */}
                               <div className="p-6 flex flex-col items-center">
                                 <div className="bg-white w-full rounded-[8px] p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
                                   <div className="text-[14px] font-bold text-slate-900">
                                     {renderMessageWithVars(messagePreview[selectedVariant === 'A' ? 'variantA' : 'variantB']?.copy?.split('\n\n')[1]?.split('\n')[0] || "Hi there,")}
                                   </div>
                                   <div className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                                     {renderMessageWithVars(messagePreview[selectedVariant === 'A' ? 'variantA' : 'variantB']?.copy?.split('\n\n').slice(1).join('\n\n').replace(/^.*?\n/, ''))}
                                   </div>
                                   <button className="mt-2 w-full bg-[#3b5998] hover:bg-[#344e86] text-white font-semibold py-2.5 rounded-[4px] text-[13px] transition-colors">
                                     Redeem Offer
                                   </button>
                                 </div>
                               </div>
                             </div>
                           )}
                           {messagePreview.channel === 'SMS' && (
                             <div className="bg-white w-full max-w-[280px] rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden border border-gray-200 relative pb-2">
                               {/* iOS Top Bar */}
                               <div className="bg-[#F9F9F9] border-b border-gray-200 px-3 py-2 flex items-center justify-between z-10">
                                 <div className="text-[#007AFF] text-[20px] font-light">&lt;</div>
                                 <div className="flex flex-col items-center">
                                   <div className="w-8 h-8 rounded-full bg-gradient-to-b from-gray-300 to-gray-400 flex items-center justify-center text-white mb-0.5 shadow-sm">
                                     <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                   </div>
                                   <div className="text-[10px] text-slate-900 font-medium tracking-wide">Your Brand</div>
                                 </div>
                                 <div className="w-5 h-5 rounded-full border border-[#007AFF] text-[#007AFF] flex items-center justify-center text-[12px] font-serif font-bold italic">i</div>
                               </div>

                               {/* Chat Body */}
                               <div className="px-4 py-4 flex flex-col flex-1 bg-white min-h-[160px]">
                                 <div className="text-[10px] text-gray-400 text-center mb-4 uppercase tracking-wider font-medium">Text Message<br/><span className="text-[9px] font-normal lowercase">Today 12:56</span></div>
                                 
                                 {/* Incoming Bubble */}
                                 <div className="relative self-start max-w-[85%]">
                                   <div className="bg-[#E9E9EB] text-black text-[14px] leading-snug px-4 py-2.5 rounded-[18px] rounded-bl-sm">
                                     {renderMessageWithVars(messagePreview[selectedVariant === 'A' ? 'variantA' : 'variantB']?.copy)}
                                   </div>
                                   <div className="text-[9px] text-gray-400 mt-1 ml-1">{messagePreview[selectedVariant === 'A' ? 'variantA' : 'variantB']?.copy?.length} / 160 char</div>
                                 </div>
                               </div>

                               {/* Bottom Input Bar */}
                               <div className="border-t border-gray-200 bg-white px-3 py-2 flex items-center gap-2">
                                 <div className="flex text-gray-400 gap-2">
                                   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="8" width="18" height="12" rx="2" ry="2"/><circle cx="12" cy="14" r="3"/><path d="M8 8v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                 </div>
                                 <div className="flex-1 border border-gray-300 rounded-full h-8 px-3 flex items-center justify-between bg-white">
                                   <span className="text-gray-300 text-[13px]">Text Message</span>
                                   <div className="w-5 h-5 rounded-full bg-[#007AFF] text-white flex items-center justify-center font-bold text-[10px]">↑</div>
                                 </div>
                               </div>
                             </div>
                           )}
                           {messagePreview.channel === 'Email & SMS' && (() => {
                             const fullCopy = messagePreview[selectedVariant === 'A' ? 'variantA' : 'variantB']?.copy || '';
                             const emailCopyRaw = fullCopy.split('[SMS]')[0]?.replace('[Email]\n', '').trim() || '';
                             const smsCopyRaw = fullCopy.split('[SMS]')[1]?.trim() || '';
                             
                             return (
                               <div className="flex gap-4 w-full justify-center">
                                 {/* Email Preview Compact */}
                                 <div className="bg-[#f4f5f7] flex-1 max-w-[280px] rounded-[16px] shadow-[0_5px_20px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden border border-gray-200">
                                   <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
                                     <div className="text-[11px] font-bold text-slate-800 line-clamp-1">
                                       {renderMessageWithVars(emailCopyRaw.split('\n\n')[0]?.replace('Subject: ', ''))}
                                     </div>
                                   </div>
                                   <div className="p-4 flex flex-col items-center flex-1">
                                     <div className="bg-white w-full rounded-[8px] p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
                                       <div className="text-[13px] font-bold text-slate-900">
                                         {renderMessageWithVars(emailCopyRaw.split('\n\n')[1]?.split('\n')[0] || "Hi there,")}
                                       </div>
                                       <div className="text-[12px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                                         {renderMessageWithVars(emailCopyRaw.split('\n\n').slice(1).join('\n\n').replace(/^.*?\n/, ''))}
                                       </div>
                                       <button className="mt-1 w-full bg-[#3b5998] text-white font-semibold py-2 rounded-[4px] text-[12px]">Redeem Offer</button>
                                     </div>
                                   </div>
                                 </div>
                                 
                                 {/* SMS Preview Compact */}
                                 <div className="bg-white flex-1 max-w-[240px] rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden border border-gray-200 relative pb-2">
                                   <div className="bg-[#F9F9F9] border-b border-gray-200 px-3 py-2 flex items-center justify-center z-10">
                                     <div className="text-[10px] text-slate-900 font-medium tracking-wide">Your Brand</div>
                                   </div>
                                   <div className="px-3 py-4 flex flex-col flex-1 bg-white min-h-[140px]">
                                     <div className="relative self-start max-w-[90%]">
                                       <div className="bg-[#E9E9EB] text-black text-[13px] leading-snug px-3 py-2 rounded-[16px] rounded-bl-sm">
                                         {renderMessageWithVars(smsCopyRaw)}
                                       </div>
                                     </div>
                                   </div>
                                 </div>
                               </div>
                             );
                           })()}
                         </div>
                       </div>

                       {/* RIGHT: VARIANTS & REASONING */}
                       <div className="flex flex-col gap-6">
                         <div className="flex flex-col gap-3">
                           <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider border-b border-gray-200 pb-2">Variants</h3>
                           <div className="flex rounded-[6px] overflow-hidden border border-gray-200 w-full">
                             <button onClick={() => setSelectedVariant('A')} className={clsx("flex-1 py-2 text-[12px] font-bold text-center transition-colors", selectedVariant === 'A' ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100")}>
                               Variant A ({messagePreview.variantA?.type})
                             </button>
                             <button onClick={() => setSelectedVariant('B')} className={clsx("flex-1 py-2 text-[12px] font-bold text-center border-l border-gray-200 transition-colors", selectedVariant === 'B' ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100")}>
                               Variant B ({messagePreview.variantB?.type})
                             </button>
                           </div>
                         </div>
                         
                         <div className="flex flex-col gap-3">
                           <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider border-b border-gray-200 pb-2">Why This Copy?</h3>
                           <ul className="flex flex-col gap-2.5">
                             {messagePreview.reasoning?.map((ev: string, i: number) => (
                               <li key={i} className="text-[13px] text-slate-600 leading-snug flex items-start gap-2">
                                 <span className="text-emerald-500 font-bold mt-0.5">✓</span> {ev}
                               </li>
                             ))}
                           </ul>
                         </div>

                         <div className="border border-gray-200 rounded-[8px] bg-slate-50 p-4 mt-auto">
                           <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Similar Campaign Performance</h4>
                           <div className="flex justify-between items-center">
                             <div>
                               <div className="text-[10px] text-slate-400 uppercase">Revenue</div>
                               <div className="text-[14px] font-mono font-bold text-emerald-600">{messagePreview.historicalPerformance?.revenue}</div>
                             </div>
                             <div>
                               <div className="text-[10px] text-slate-400 uppercase">Conv.</div>
                               <div className="text-[14px] font-mono font-bold text-slate-900">{messagePreview.historicalPerformance?.conversion}</div>
                             </div>
                             <div>
                               <div className="text-[10px] text-slate-400 uppercase">CTR</div>
                               <div className="text-[14px] font-mono font-bold text-slate-900">{messagePreview.historicalPerformance?.ctr}</div>
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                 )}
               </div>
             )}

            <div className="flex justify-end pt-6 border-t border-gray-200">
               <button 
                 onClick={() => setStep('REVIEW')}
                 className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-[6px] text-[14px] font-bold transition-all flex items-center gap-2"
               >
                 Continue to Review <FastArrowRight height={18} width={18} />
               </button>
            </div>
            
          </div>
        )}

        {/* SECTION 5: REVIEW MODE */}
        {step === 'REVIEW' && (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-[24px] font-bold text-slate-900 tracking-tight">Review Campaign</h2>
            
            <div className="border border-gray-200 rounded-[8px] p-8 flex flex-col gap-6 bg-slate-50">
               
               <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                 <div className="flex flex-col gap-1">
                   <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Goal</span>
                   <span className="text-[15px] font-bold text-slate-900">{goalInput}</span>
                 </div>
                 <div className="flex flex-col gap-1">
                   <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Expected Revenue</span>
                   <span className="text-[20px] font-mono font-bold text-emerald-600">
                     {simulations?.scenarios?.find((s:any)=>s.channel === selectedChannel)?.revenue || recommendation?.expectedRevenue}
                   </span>
                 </div>
                 <div className="flex flex-col gap-1">
                   <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Audience</span>
                   <span className="text-[15px] font-bold text-slate-900">{recommendation?.audience?.count} {recommendation?.audience?.name}</span>
                 </div>
                 <div className="flex flex-col gap-1">
                   <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Channel</span>
                   <span className="text-[15px] font-bold text-slate-900">{selectedChannel}</span>
                 </div>
               </div>
            </div>

            <div className="flex justify-end gap-4">
               <button 
                 onClick={() => setStep('RECOMMENDATION')}
                 className="bg-white border border-gray-300 text-slate-700 px-6 py-3 rounded-[6px] text-[14px] font-bold hover:bg-gray-50 transition-all"
               >
                 Back
               </button>
               <button 
                 onClick={handleLaunchCampaign}
                 disabled={isProcessing}
                 className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-[6px] text-[14px] font-bold transition-all flex items-center gap-2"
               >
                 {isProcessing ? 'Launching...' : 'Launch Campaign'}
               </button>
            </div>
          </div>
        )}

        {/* SECTION 6 & 7: LEARNING MODE (Post-Launch Simulation) */}
        {step === 'LEARN' && learnings && (
          <div className="flex flex-col gap-10 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex flex-col items-center justify-center py-8 text-center border-b border-gray-200">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle height={32} width={32} />
              </div>
              <h2 className="text-[24px] font-bold text-slate-900 tracking-tight">Campaign Completed</h2>
              <p className="text-[15px] text-slate-500 mt-2 max-w-[500px]">
                The campaign has been executed. The AI has analyzed the final outcomes and stored the learnings in RevenueMemory to improve future recommendations.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* Prediction vs Reality */}
              <div className="flex flex-col gap-4">
                <h3 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <GraphUp height={14} width={14} className="text-blue-600" /> Prediction vs Reality
                </h3>
                <div className="border border-gray-200 rounded-[8px] overflow-hidden">
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="py-3 px-4 text-[13px] font-semibold text-slate-500 bg-slate-50 w-1/2">Predicted Revenue</td>
                        <td className="py-3 px-4 text-[14px] font-mono font-bold text-slate-900">{learnings.predictedRevenue}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-[13px] font-semibold text-slate-500 bg-slate-50">Actual Revenue</td>
                        <td className="py-3 px-4 text-[14px] font-mono font-bold text-emerald-600">{learnings.actualRevenue}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-[13px] font-semibold text-slate-500 bg-slate-50">Prediction Error</td>
                        <td className="py-3 px-4 text-[14px] font-mono font-bold text-orange-600">{learnings.predictionError}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* What The System Learned */}
              <div className="flex flex-col gap-4">
                <h3 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Presentation height={14} width={14} className="text-purple-600" /> What The System Learned
                </h3>
                <div className="border border-gray-200 rounded-[8px] p-5 bg-white shadow-sm flex-1">
                  <ul className="flex flex-col gap-3">
                    {learnings.learnings.map((l: string, i: number) => (
                      <li key={i} className="text-[14px] text-slate-700 flex items-start gap-2 leading-tight">
                        <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                        {l}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <p className="text-[12px] text-slate-500 flex items-center gap-1.5">
                      <DatabaseScript height={12} width={12} /> Stored securely in <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[11px] font-semibold">RevenueMemory</span> for future decision weighting.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-8">
              <button 
                onClick={() => {
                  setStep('GOAL');
                  setGoalInput('');
                  setRecommendation(null);
                  setSimulations(null);
                }}
                className="bg-white border border-gray-300 text-slate-700 px-8 py-3 rounded-[6px] text-[14px] font-bold hover:bg-gray-50 transition-all shadow-sm"
              >
                Start New Goal
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default function CampaignStudioV5() {
  return (
    <Suspense fallback={<div className="flex w-full h-screen items-center justify-center bg-white"><div className="w-6 h-6 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>}>
      <CampaignStudioContent />
    </Suspense>
  );
}
