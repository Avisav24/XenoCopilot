'use client';

import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  strategizeCampaign, 
  launchCampaign,
  getDynamicSuggestions,
  getDynamicPersonas,
  simulateCampaign
} from '@/lib/api';

import { Spark, Check, Send, User, WarningTriangle, ShieldCheck, Xmark } from 'iconoir-react';
import { clsx } from 'clsx';

export default function CommandCenterPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-muted">Loading copilot...</div>}>
      <CommandCenterContent />
    </React.Suspense>
  );
}

function CommandCenterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { data: suggestions, isLoading: isLoadingSuggestions } = useQuery({
    queryKey: ['dynamic-suggestions'],
    queryFn: getDynamicSuggestions,
  });

  const { data: personas } = useQuery({
    queryKey: ['dynamic-personas'],
    queryFn: getDynamicPersonas,
  });

  const [goal, setGoal] = useState(searchParams?.get('goal') || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiReport, setAiReport] = useState<any | null>(null);
  
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [previewVariant, setPreviewVariant] = useState<any | null>(null);
  
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(searchParams?.get('persona') || '');
  
  // Simulation State
  const [simData, setSimData] = useState<any[] | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string>('');

  const handleStartWorkflow = async (presetGoal?: string) => {
    const targetGoal = presetGoal || goal;
    if (!targetGoal.trim()) return;
    if (!selectedPersonaId) {
      alert('Please select a target persona first.');
      return;
    }
    
    if (!presetGoal) setGoal(targetGoal);

    setIsProcessing(true);
    setAiReport(null);
    setVariants([]);
    setSelectedVariantId(null);
    setSimData(null);
    setSelectedChannel('');
    
    try {
      const selectedP = personas?.find((p: any) => p.id === selectedPersonaId);
      let audienceCount = 300;
      if (selectedPersonaId === 'all-customers') {
        audienceCount = personas ? personas.reduce((acc: number, p: any) => acc + p.customerCount, 0) : 300;
      } else if (selectedP) {
        audienceCount = selectedP.customerCount;
      }

      // 1. Fetch simulation
      const sim = await simulateCampaign(audienceCount);
      setSimData(sim);
      if (sim && sim.length > 0) {
        setSelectedChannel(sim[0].channel); // Best channel usually first
      }

      // 2. Fetch strategy & variants
      const res = await strategizeCampaign(targetGoal);
      setAiReport(res);
      if (res.variants && res.variants.length > 0) {
        setVariants(res.variants);
        setSelectedVariantId(res.variants[0].id);
      }
    } catch (err) {
      console.error(err);
      alert('AI Strategist failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLaunch = async () => {
    const selectedVariant = variants.find(v => v.id === selectedVariantId);
    if (!selectedVariant || !selectedChannel || !selectedPersonaId) return;

    setIsProcessing(true);
    try {
      const payload: any = {
        name: selectedVariant.name,
        channel: selectedChannel,
        message: selectedVariant.message,
        persona_id: selectedPersonaId
      };

      const res = await launchCampaign(payload);
      if (res.success) {
        router.push(`/engagement/${res.campaign_id}`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to launch campaign');
      setIsProcessing(false);
    }
  };

  const resetSession = () => {
    setAiReport(null);
    setVariants([]);
    setSimData(null);
    setSelectedVariantId(null);
    setGoal('');
    setIsProcessing(false);
  };

  const selectedSim = simData?.find(s => s.channel === selectedChannel);
  const activeVariant = variants.find(v => v.id === selectedVariantId);
  const audienceSize = selectedPersonaId === 'all-customers' 
    ? (personas ? personas.reduce((acc: number, p: any) => acc + p.customerCount, 0) : 300)
    : (personas?.find((p: any) => p.id === selectedPersonaId)?.customerCount || 0);
  const audienceName = selectedPersonaId === 'all-customers'
    ? 'All Customers'
    : personas?.find((p: any) => p.id === selectedPersonaId)?.name;

  return (
    <div className="w-full flex flex-col pb-24 gap-6">
      
      {/* Full Message Modal */}
      {previewVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 backdrop-blur-sm p-4">
          <div className="bg-surface-card rounded-xl border border-hairline shadow-lg w-full max-w-lg flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-hairline bg-surface-soft">
              <h3 className="text-[18px] font-semibold text-ink">{previewVariant.name}</h3>
              <button onClick={() => setPreviewVariant(null)} className="p-1 hover:bg-hairline rounded transition-colors text-muted hover:text-ink">
                <Xmark height={20} width={20} />
              </button>
            </div>
            <div className="p-6 bg-canvas">
              <div className="bg-white p-5 rounded-xl border border-hairline shadow-sm relative">
                {/* Tail for chat bubble effect */}
                <div className="absolute -left-2 top-4 w-4 h-4 bg-white border-l border-b border-hairline transform rotate-45"></div>
                <p className="text-[15px] text-ink leading-relaxed whitespace-pre-wrap font-medium relative z-10">
                  {previewVariant.message}
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-hairline bg-surface-soft flex justify-end">
               <button 
                 onClick={() => {
                   setSelectedVariantId(previewVariant.id);
                   setPreviewVariant(null);
                 }}
                 className="btn-primary"
               >
                 Select This Variant
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col border-b border-hairline pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>Campaign Copilot</h1>
            <p className="text-[15px] text-muted max-w-2xl leading-relaxed mt-1">
              Business command center for campaign strategy and revenue forecasting.
            </p>
          </div>
          {(aiReport || isProcessing) && (
            <button 
              onClick={resetSession} 
              className="btn-secondary"
            >
              Reset Session
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 w-full max-w-[1400px]">
        
        {/* Left Column: Input & AI Analysis */}
        <div className="xl:col-span-2 flex flex-col gap-8">
          
          {/* Goal Input Section */}
          <div className="flex flex-col gap-4">
            <h2 className="text-[18px] font-semibold text-ink">Objective & Audience</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <select 
                className="bg-white border-2 border-primary/20 hover:border-primary/50 focus:border-primary shadow-sm rounded-xl py-4 px-4 text-[15px] outline-none transition-all text-ink md:w-1/3 cursor-pointer"
                value={selectedPersonaId}
                onChange={(e) => setSelectedPersonaId(e.target.value)}
                disabled={isProcessing || aiReport !== null}
              >
                <option value="">Select Target Audience...</option>
                <option value="all-customers">
                  All Customers ({personas ? personas.reduce((acc: number, p: any) => acc + p.customerCount, 0).toLocaleString() : '...'} users)
                </option>
                {personas?.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.customerCount} users)</option>
                ))}
              </select>

              <div className="relative flex-1 mt-1 mb-2">
                <input
                  type="text"
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleStartWorkflow();
                  }}
                  placeholder="e.g. Recover dormant spenders with an aggressive win-back..."
                  className="w-full bg-white border-2 border-primary/20 hover:border-primary/50 focus:border-primary shadow-sm rounded-xl py-4 pl-4 pr-16 text-[15px] outline-none transition-all placeholder:text-muted/70 text-ink"
                  disabled={isProcessing || aiReport !== null}
                />
                <button 
                  onClick={() => handleStartWorkflow()}
                  disabled={isProcessing || !goal.trim() || !selectedPersonaId || aiReport !== null} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
                >
                  <Send height={20} width={20} className="ml-1" />
                </button>
              </div>
            </div>

            {/* Suggested Goals */}
            {!aiReport && !isProcessing && (
              <div className="flex gap-2 flex-wrap mt-1">
                {isLoadingSuggestions ? (
                  <span className="text-[13px] text-muted">Analyzing metrics...</span>
                ) : suggestions?.map((sug: string, idx: number) => (
                  <button 
                    key={idx}
                    onClick={() => handleStartWorkflow(sug)}
                    disabled={!selectedPersonaId}
                    className="text-[13px] font-medium text-ink bg-surface-card border border-hairline px-3 py-1.5 rounded-md hover:border-primary transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* AI Processing State */}
          {isProcessing && (
            <div className="card p-8 flex items-center justify-center border-dashed bg-surface-soft mt-8">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-[15px] font-medium text-ink">Simulating revenue impact and drafting message variants...</span>
              </div>
            </div>
          )}

          {/* Structured Output */}
          {aiReport && !isProcessing && (
            <div className="flex flex-col gap-10">
              
              {/* Opportunity Analysis */}
              <div className="flex flex-col gap-4">
                <h2 className="text-[18px] font-semibold text-ink">Opportunity Analysis</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                   <div className="p-4 bg-surface-card border border-hairline rounded-lg flex flex-col gap-1">
                      <span className="text-[13px] font-medium text-muted uppercase tracking-wider">Opportunity Score</span>
                      <span className="text-[28px] font-mono-numbers font-semibold text-ink">{aiReport.opportunityAnalysis?.score || 0}</span>
                   </div>
                   <div className="p-4 bg-surface-card border border-hairline rounded-lg flex flex-col gap-1">
                      <span className="text-[13px] font-medium text-muted uppercase tracking-wider">Potential Revenue</span>
                      <span className="text-[28px] font-mono-numbers font-semibold text-semantic-success">₹{aiReport.opportunityAnalysis?.potentialRevenue?.toLocaleString() || 0}</span>
                   </div>
                   <div className="p-4 bg-surface-card border border-hairline rounded-lg flex flex-col gap-1">
                      <span className="text-[13px] font-medium text-muted uppercase tracking-wider">Revenue At Risk</span>
                      <span className="text-[28px] font-mono-numbers font-semibold text-semantic-danger">₹{aiReport.opportunityAnalysis?.revenueAtRisk?.toLocaleString() || 0}</span>
                   </div>
                   <div className="p-4 bg-surface-card border border-hairline rounded-lg flex flex-col gap-1">
                      <span className="text-[13px] font-medium text-muted uppercase tracking-wider">Audience Size</span>
                      <span className="text-[28px] font-mono-numbers font-medium text-ink">{audienceSize.toLocaleString()}</span>
                   </div>
                   <div className="p-4 bg-surface-card border border-hairline rounded-lg flex flex-col gap-1">
                      <span className="text-[13px] font-medium text-muted uppercase tracking-wider">Hist. Conversion</span>
                      <span className="text-[28px] font-mono-numbers font-medium text-ink">{aiReport.opportunityAnalysis?.historicalConversion || 0}%</span>
                   </div>
                   <div className="p-4 bg-surface-card border border-hairline rounded-lg flex flex-col gap-1">
                      <span className="text-[13px] font-medium text-muted uppercase tracking-wider">AI Confidence</span>
                      <span className="text-[28px] font-mono-numbers font-medium text-ink">{aiReport.opportunityAnalysis?.confidence || 0}%</span>
                   </div>
                </div>
              </div>

              {/* AI Recommendation */}
              {aiReport.aiRecommendation && (
                <div className="flex flex-col gap-4">
                  <h2 className="text-[18px] font-semibold text-ink flex items-center gap-2">
                     <Spark height={20} width={20} className="text-primary" /> AI Recommendation
                  </h2>
                  <div className="p-5 bg-surface-soft border border-hairline rounded-xl flex flex-col gap-4">
                     <div>
                        <span className="text-[13px] font-semibold text-muted uppercase tracking-wider mb-2 block">Recommended Variant</span>
                        <span className="text-[16px] font-semibold text-ink">{variants.find(v => v.id === aiReport.aiRecommendation.recommendedVariantId)?.name || 'Emotional Reconnection'}</span>
                     </div>
                     <div className="flex flex-col gap-2">
                        <span className="text-[13px] font-semibold text-muted uppercase tracking-wider">Why</span>
                        <ul className="flex flex-col gap-1.5">
                           {aiReport.aiRecommendation.why?.slice(0, 3).map((w: string, idx: number) => (
                             <li key={idx} className="flex items-start gap-2 text-[14px] text-ink">
                               <span className="text-primary mt-1 text-[18px] leading-none">•</span> {w}
                             </li>
                           ))}
                        </ul>
                     </div>
                     <div className="grid grid-cols-3 gap-4 border-t border-hairline pt-4 mt-2">
                        <div className="flex flex-col gap-1">
                           <span className="text-[13px] text-muted">Revenue</span>
                           <span className="text-[20px] font-mono-numbers font-semibold text-semantic-success">₹{aiReport.aiRecommendation.expectedOutcome?.revenue?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                           <span className="text-[13px] text-muted">Purchases</span>
                           <span className="text-[20px] font-mono-numbers font-medium text-ink">{aiReport.aiRecommendation.expectedOutcome?.purchases || 0}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                           <span className="text-[13px] text-muted">Conversion</span>
                           <span className="text-[20px] font-mono-numbers font-medium text-ink">{aiReport.aiRecommendation.expectedOutcome?.conversion || 0}%</span>
                        </div>
                     </div>
                  </div>
                </div>
              )}

              {/* Message Variants */}
              <div className="flex flex-col gap-4">
                <h2 className="text-[18px] font-semibold text-ink">Message Variants</h2>
                <div className="flex flex-col gap-4">
                  {variants.map((variant) => (
                    <div 
                      key={variant.id}
                      className={clsx(
                        "p-4 rounded-xl border transition-all duration-200 flex flex-col lg:flex-row gap-6 relative",
                        selectedVariantId === variant.id 
                          ? "border-primary bg-primary/5 shadow-[0_0_0_1px_rgba(37,99,235,0.2)]" 
                          : "border-hairline bg-surface-card hover:border-primary/50"
                      )}
                    >
                      <div className="flex-1 flex flex-col gap-4">
                         <div className="flex items-center justify-between">
                            <h4 className="text-[16px] font-semibold text-ink">{variant.name}</h4>
                            {selectedVariantId === variant.id && (
                              <span className="bg-primary text-white text-[11px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                                <Check height={12} width={12} /> Selected
                              </span>
                            )}
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                               <span className="text-[12px] font-medium text-muted uppercase tracking-wider">Expected Revenue</span>
                               <span className="text-[20px] font-mono-numbers font-semibold text-semantic-success">₹{variant.expectedRevenue?.toLocaleString() || 0}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 border-l border-hairline pl-4">
                               <div className="flex flex-col gap-1">
                                  <span className="text-[12px] text-muted">Open Rate</span>
                                  <span className="text-[14px] font-mono-numbers font-medium text-ink">{variant.openRate || 0}%</span>
                               </div>
                               <div className="flex flex-col gap-1">
                                  <span className="text-[12px] text-muted">Purchase Rate</span>
                                  <span className="text-[14px] font-mono-numbers font-medium text-ink">{variant.purchaseRate || 0}%</span>
                               </div>
                               <div className="flex flex-col gap-1">
                                  <span className="text-[12px] text-muted">Confidence</span>
                                  <span className="text-[14px] font-mono-numbers font-medium text-ink">{variant.confidence || 0}%</span>
                               </div>
                            </div>
                         </div>

                         <div className="flex flex-col gap-2 mt-2">
                            {variant.strengths && variant.strengths.length > 0 && (
                               <div className="flex gap-2 items-start text-[13px]">
                                 <span className="font-semibold text-ink w-20">Strengths</span>
                                 <ul className="flex flex-wrap gap-x-4 gap-y-1 text-muted">
                                    {variant.strengths.map((s: string, i: number) => <li key={i}>• {s}</li>)}
                                 </ul>
                               </div>
                            )}
                            {variant.risks && variant.risks.length > 0 && (
                               <div className="flex gap-2 items-start text-[13px]">
                                 <span className="font-semibold text-ink w-20">Risks</span>
                                 <ul className="flex flex-wrap gap-x-4 gap-y-1 text-semantic-warning">
                                    {variant.risks.map((s: string, i: number) => <li key={i}>• {s}</li>)}
                                 </ul>
                               </div>
                            )}
                         </div>
                      </div>

                      <div className="w-full lg:w-[280px] bg-surface-soft border border-hairline p-4 rounded-lg flex flex-col justify-between gap-4">
                         <div className="flex flex-col gap-2">
                           <span className="text-[12px] font-semibold text-muted uppercase tracking-wider">Preview</span>
                           <p className="text-[14px] text-ink leading-relaxed line-clamp-3 italic">"{variant.message}"</p>
                         </div>
                         <div className="flex items-center gap-2 mt-2">
                           <button onClick={() => setPreviewVariant(variant)} className="btn-secondary flex-1 text-[13px]">View Full</button>
                           <button onClick={() => setSelectedVariantId(variant.id)} className={clsx("flex-1 text-[13px]", selectedVariantId === variant.id ? "btn-primary opacity-50 cursor-not-allowed" : "btn-primary")}>
                             {selectedVariantId === variant.id ? 'Selected' : 'Use Variant'}
                           </button>
                         </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Channel Decision Engine */}
              <div className="flex flex-col gap-4">
                <h2 className="text-[18px] font-semibold text-ink">Channel Investment Comparison</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {simData?.map((sim: any, idx: number) => (
                    <div 
                      key={sim.channel}
                      onClick={() => setSelectedChannel(sim.channel)}
                      className={clsx(
                        "cursor-pointer p-4 rounded-xl border transition-all duration-200 flex flex-col gap-4 relative",
                        selectedChannel === sim.channel 
                          ? "border-primary bg-primary/5 shadow-[0_0_0_1px_rgba(37,99,235,0.2)]" 
                          : "border-hairline bg-surface-card hover:border-primary/50"
                      )}
                    >
                      {idx === 0 && selectedChannel !== sim.channel && (
                        <span className="absolute -top-2.5 right-4 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">Recommended</span>
                      )}
                      {selectedChannel === sim.channel && (
                        <div className="absolute top-4 right-4 text-primary">
                          <Check height={16} width={16} />
                        </div>
                      )}
                      <h3 className="text-[16px] font-semibold text-ink flex items-center gap-2">
                         {sim.channel}
                      </h3>
                      
                      <div className="flex flex-col gap-1">
                        <span className="text-[12px] font-medium text-muted uppercase tracking-wider">Expected Revenue</span>
                        <span className="text-[24px] font-mono-numbers font-semibold text-semantic-success">
                          ₹{sim.expectedRevenue.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2 pt-2 border-t border-hairline">
                        <div className="flex justify-between items-center text-[13px]">
                           <span className="text-muted">Conversion</span>
                           <span className="font-mono-numbers font-medium text-ink">{sim.conversion}%</span>
                        </div>
                        <div className="flex justify-between items-center text-[13px]">
                           <span className="text-muted">Audience Match</span>
                           <span className="font-medium text-ink">{idx === 0 ? 'High' : idx === 1 ? 'Medium' : 'Low'}</span>
                        </div>
                        <div className="flex justify-between items-center text-[13px]">
                           <span className="text-muted">Confidence</span>
                           <span className="font-mono-numbers font-medium text-ink">{sim.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Right Column: Execution & Approval */}
        <div className="xl:col-span-1 flex flex-col gap-8">
          
          {aiReport && !isProcessing && (
            <div className="flex flex-col gap-6 sticky top-8">
              
              {/* Executive Summary Approval Panel */}
              <div className="flex flex-col gap-4">
                <h2 className="text-[18px] font-semibold text-ink">Approval Panel</h2>
                <div className="card p-5 flex flex-col bg-surface-card border-2 border-primary/20 shadow-sm">
                  
                  <h3 className="text-[16px] font-semibold text-ink mb-4 border-b border-hairline pb-4">Campaign Summary</h3>

                  <div className="flex flex-col gap-3 border-b border-hairline pb-5">
                     <div className="flex justify-between items-center">
                        <span className="text-[13px] text-muted">Audience</span>
                        <span className="text-[14px] font-medium text-ink">{audienceSize.toLocaleString()} {audienceName}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-[13px] text-muted">Channel</span>
                        <span className="text-[14px] font-medium text-ink">{selectedChannel}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-[13px] text-muted">Variant</span>
                        <span className="text-[14px] font-medium text-ink truncate max-w-[150px]" title={activeVariant?.name}>{activeVariant?.name || 'None Selected'}</span>
                     </div>
                  </div>

                  <div className="flex flex-col gap-3 py-5 border-b border-hairline">
                     <div className="flex justify-between items-center">
                        <span className="text-[13px] text-muted">Expected Revenue</span>
                        <span className="text-[16px] font-mono-numbers font-bold text-semantic-success">₹{selectedSim?.expectedRevenue?.toLocaleString() || 0}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-[13px] text-muted">Opportunity Score</span>
                        <span className="text-[14px] font-mono-numbers font-medium text-ink">{aiReport.opportunityAnalysis?.score || 0}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-[13px] text-muted">Confidence</span>
                        <span className="text-[14px] font-mono-numbers font-medium text-ink">{activeVariant?.confidence || selectedSim?.confidence || 0}%</span>
                     </div>
                  </div>

                  <div className="flex flex-col gap-3 py-5">
                     <div className="flex justify-between items-center">
                        <span className="text-[13px] text-muted">Launch Risk</span>
                        <span className="text-[13px] font-medium text-semantic-success px-2 py-0.5 bg-semantic-success/10 rounded">Low</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-[13px] text-muted">Estimated Duration</span>
                        <span className="text-[14px] font-medium text-ink">7 Days</span>
                     </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-4">
                     <button
                       onClick={handleLaunch}
                       disabled={isProcessing || !selectedVariantId || !selectedChannel}
                       className="btn-primary w-full py-4 text-[15px] font-bold"
                     >
                       Approve & Launch Campaign
                     </button>
                  </div>

                </div>
              </div>

            </div>
          )}

          {!aiReport && !isProcessing && (
            <div className="card p-6 bg-surface-soft border-dashed flex flex-col items-center justify-center text-center gap-3 h-full min-h-[300px]">
              <Spark height={24} width={24} className="text-muted" />
              <p className="text-[14px] text-muted leading-relaxed max-w-sm">
                Define an objective and select an audience to generate strategy, message variants, and revenue forecasts.
              </p>
            </div>
          )}
          
        </div>
      </div>
      
    </div>
  );
}
