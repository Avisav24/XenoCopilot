'use client';

import React, { useState, useEffect, Suspense } from 'react';
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

  const handleLaunchCampaign = async () => {
    setIsProcessing(true);
    try {
      const selectedSim = simulations?.scenarios?.find((s: any) => s.channel === selectedChannel) || recommendation;
      
      const res = await fetchAPI<any>('/api/copilot/learn', {
        method: 'POST',
        body: JSON.stringify({
          goal: goalInput,
          audience: recommendation.audience.name,
          channel: selectedChannel,
          offer: recommendation.offer,
          predictedRevenueStr: selectedSim.revenue || recommendation.expectedRevenue,
          conversionRateStr: selectedSim.conversion || recommendation.expectedConversion
        })
      });
      
      setLearnings(res);
      setStep('LEARN');
    } catch (e) {
      console.error(e);
      alert('Launch simulation failed.');
    } finally {
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
          <div className={clsx("flex flex-col gap-4 transition-all duration-500", step !== 'GOAL' && "opacity-60")}>
            <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Business Goal</label>
            <form onSubmit={handleAnalyzeGoal} className="relative flex items-center">
              <input
                type="text"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="e.g. Increase revenue by ₹10 lakh this month"
                disabled={step !== 'GOAL' || isProcessing}
                className="w-full bg-white border border-gray-300 rounded-[8px] pl-4 pr-32 py-4 text-[15px] font-medium focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 disabled:bg-slate-50 shadow-sm"
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
                             <div className="bg-[#E5DDD5] w-full max-w-[280px] rounded-[12px] p-4 flex flex-col gap-2 shadow-sm border border-gray-300">
                               <div className="bg-white rounded-[8px] rounded-tl-none p-3 shadow-sm flex flex-col relative">
                                 <div className="text-[#075E54] text-[12px] font-bold mb-1">Xeno Fashion</div>
                                 <div className="text-[13px] text-slate-800 whitespace-pre-wrap">{messagePreview[selectedVariant === 'A' ? 'variantA' : 'variantB']?.copy}</div>
                                 <div className="text-[10px] text-slate-400 self-end mt-1">8:00 PM</div>
                               </div>
                             </div>
                           )}
                           {messagePreview.channel === 'Email' && (
                             <div className="bg-white w-full max-w-[320px] rounded-[8px] p-0 shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                               <div className="bg-slate-100 p-3 border-b border-gray-200">
                                 <div className="text-[11px] font-bold text-slate-500 mb-1">Subject:</div>
                                 <div className="text-[13px] font-bold text-slate-900 line-clamp-1">{messagePreview[selectedVariant === 'A' ? 'variantA' : 'variantB']?.copy?.split('\n\n')[0]?.replace('Subject: ', '')}</div>
                               </div>
                               <div className="p-4 text-[13px] text-slate-700 whitespace-pre-wrap leading-relaxed">
                                 {messagePreview[selectedVariant === 'A' ? 'variantA' : 'variantB']?.copy?.split('\n\n').slice(1).join('\n\n')}
                               </div>
                             </div>
                           )}
                           {messagePreview.channel === 'SMS' && (
                             <div className="bg-white w-full max-w-[260px] rounded-[16px] p-4 shadow-sm border border-gray-200 flex flex-col">
                               <div className="bg-gray-100 rounded-[12px] rounded-bl-none p-3 text-[13px] text-slate-800 whitespace-pre-wrap leading-relaxed">
                                 {messagePreview[selectedVariant === 'A' ? 'variantA' : 'variantB']?.copy}
                               </div>
                               <div className="text-[10px] text-slate-400 mt-2 ml-1">
                                 {messagePreview[selectedVariant === 'A' ? 'variantA' : 'variantB']?.copy?.length} / 160 characters
                               </div>
                             </div>
                           )}
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
