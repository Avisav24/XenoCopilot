'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCustomerStats, queryPersonas, recommendCampaign, draftMessages, launchCampaign } from '@/lib/api';

export default function AIHubPage() {
  const router = useRouter();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['customer-stats'],
    queryFn: getCustomerStats,
  });

  const [goal, setGoal] = useState('');
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Workflow State
  const [personaResult, setPersonaResult] = useState<any>(null);
  const [recResult, setRecResult] = useState<any>(null);
  const [variants, setVariants] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<'variantA' | 'variantB'>('variantA');
  const [campaignName, setCampaignName] = useState('');

  const handleStartWorkflow = async () => {
    if (!goal.trim()) return;
    setIsProcessing(true);
    setStep(1);
    
    try {
      const pRes = await queryPersonas(goal);
      setPersonaResult(pRes);
      
      setStep(2);
      const rRes = await recommendCampaign(pRes.persona.id);
      setRecResult(rRes);

      setStep(3);
      const vRes = await draftMessages(pRes.persona.name, rRes.channel);
      setVariants(vRes);
      setCampaignName(`${pRes.persona.name} - ${rRes.channel} Campaign`);

      setStep(4);
    } catch (err) {
      console.error(err);
      alert('AI workflow failed.');
      setStep(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLaunch = async () => {
    if (!campaignName.trim()) return;
    setIsProcessing(true);
    try {
      const res = await launchCampaign({
        name: campaignName,
        persona_id: personaResult.persona.id,
        channel: recResult.channel,
        message: variants[selectedVariant],
      });
      if (res.success) {
        router.push(`/campaigns/${res.campaign_id}/insights`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to launch campaign');
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col gap-8 h-[calc(100vh-4rem)]">
      {/* Header */}
      <div>
        <h1 className="text-[44px] leading-[1.09] tracking-[-1px] font-display text-ink mb-4">Intelligence Hub</h1>
        <p className="text-body text-[16px] max-w-xl">Describe your goal, and XenoCopilot will automatically find the best audience, recommend channels, and launch the campaign.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
        {/* Left Column: Discovered Personas */}
        <div className="col-span-1 flex flex-col gap-4">
          <h2 className="text-[18px] font-semibold text-ink">Top Personas</h2>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-20 skeleton" />)}
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto pr-2 pb-8">
              {stats?.personas?.map((p: any) => (
                <div key={p.name} className="card p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-ink">{p.name}</h3>
                    <span className="badge-pill font-mono-numbers">
                      {p.count}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-surface-strong rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (p.count / stats.total) * 100)}%` }} />
                  </div>
                </div>
              ))}
              
              <div className="card p-6 bg-surface-darkElevated text-on-dark border-none mt-4">
                <p className="text-[13px] text-on-darkSoft font-semibold mb-2 uppercase tracking-wide">Total Revenue</p>
                <p className="text-[32px] font-mono-numbers mb-1 leading-none">₹{(stats?.total * stats?.avg_spend).toLocaleString('en-IN')}</p>
                <p className="text-[13px] text-on-darkSoft font-medium">From {stats?.total} active shoppers</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Chat & Workflow */}
        <div className="col-span-2 card flex flex-col bg-surface-soft border-hairline overflow-hidden relative">
          <div className="p-6 border-b border-hairline bg-canvas">
            <h2 className="text-[18px] font-semibold text-ink">Campaign Copilot</h2>
          </div>

          <div className="flex-1 p-8 overflow-y-auto flex flex-col gap-8 relative">
            
            {/* Step 0: Input */}
            <div className="bg-canvas p-6 rounded-xl border border-hairline">
              <label className="block text-[14px] font-semibold text-ink mb-3">What is your goal?</label>
              <textarea
                value={goal}
                onChange={e => setGoal(e.target.value)}
                placeholder="e.g. Sell our excess inventory of dresses..."
                className="input-field h-auto resize-none mb-4"
                rows={3}
                disabled={step > 0}
              />
              {step === 0 && (
                <button
                  onClick={handleStartWorkflow}
                  disabled={!goal.trim() || isProcessing}
                  className="btn-primary w-full"
                >
                  {isProcessing ? 'Thinking...' : 'Generate Campaign'}
                </button>
              )}
            </div>

            {/* Step 1 & 2: Persona & Recommendation */}
            {step >= 1 && (
              <div className={`transition-all duration-500 ${step === 1 ? 'opacity-50 animate-pulse' : 'opacity-100'}`}>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-surface-strong text-ink flex items-center justify-center shrink-0 mt-1 font-bold">A</div>
                  <div className="bg-canvas p-6 rounded-xl border border-hairline flex-1">
                    {step === 1 ? (
                      <p className="text-body text-[14px]">Analyzing your goal to find the best persona...</p>
                    ) : (
                      <>
                        <p className="text-ink text-[16px] mb-6">
                          Based on your goal, I recommend targeting <strong className="text-primary">{personaResult?.persona.name}</strong>.
                        </p>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="p-4 bg-surface-soft rounded-lg border border-hairline-soft">
                            <p className="text-[13px] text-muted font-semibold mb-1">Audience Size</p>
                            <p className="text-[20px] font-mono-numbers text-ink">{personaResult?.count} shoppers</p>
                          </div>
                          <div className="p-4 bg-surface-soft rounded-lg border border-hairline-soft">
                            <p className="text-[13px] text-muted font-semibold mb-1">Best Channel</p>
                            <p className="text-[20px] font-semibold text-ink">{recResult?.channel}</p>
                          </div>
                        </div>
                        <div className="p-5 border border-hairline rounded-lg">
                          <p className="text-[13px] text-muted font-semibold mb-2">Expected Revenue Impact</p>
                          <p className="text-[28px] font-mono-numbers text-semantic-up leading-none mb-2">₹{recResult?.expectedRevenue.toLocaleString('en-IN')}</p>
                          <p className="text-[13px] text-muted">Based on historical {recResult?.channel} conversion rates and persona AOV.</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Drafting & Review */}
            {step >= 3 && (
              <div className={`transition-all duration-500 ${step === 3 ? 'opacity-50 animate-pulse' : 'opacity-100'}`}>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-surface-strong text-ink flex items-center justify-center shrink-0 mt-1 font-bold">A</div>
                  <div className="bg-canvas p-6 rounded-xl border border-hairline flex-1">
                    {step === 3 ? (
                      <p className="text-body text-[14px]">Drafting personalized message variants...</p>
                    ) : (
                      <>
                        <div className="mb-6">
                          <label className="block text-[14px] font-semibold text-ink mb-2">Campaign Name</label>
                          <input 
                            value={campaignName}
                            onChange={e => setCampaignName(e.target.value)}
                            className="input-field"
                          />
                        </div>
                        <p className="text-[14px] font-semibold text-ink mb-3">Select a Message Variant:</p>
                        <div className="space-y-4">
                          <div 
                            onClick={() => setSelectedVariant('variantA')}
                            className={`p-5 rounded-xl border cursor-pointer transition-all ${selectedVariant === 'variantA' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-hairline hover:border-muted-soft'}`}
                          >
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[13px] font-bold text-primary">Variant A</span>
                            </div>
                            <p className="text-[14px] text-ink whitespace-pre-wrap leading-[1.5]">{variants?.variantA}</p>
                          </div>
                          
                          <div 
                            onClick={() => setSelectedVariant('variantB')}
                            className={`p-5 rounded-xl border cursor-pointer transition-all ${selectedVariant === 'variantB' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-hairline hover:border-muted-soft'}`}
                          >
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[13px] font-bold text-primary">Variant B</span>
                            </div>
                            <p className="text-[14px] text-ink whitespace-pre-wrap leading-[1.5]">{variants?.variantB}</p>
                          </div>
                        </div>

                        <button
                          onClick={handleLaunch}
                          disabled={isProcessing}
                          className="mt-8 btn-primary w-full"
                        >
                          {isProcessing ? 'Launching...' : `Launch to ${personaResult?.count} Shoppers`}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
