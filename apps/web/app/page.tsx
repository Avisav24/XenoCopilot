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
    setStep(1); // querying persona
    
    try {
      const pRes = await queryPersonas(goal);
      setPersonaResult(pRes);
      
      setStep(2); // recommending
      const rRes = await recommendCampaign(pRes.persona.id);
      setRecResult(rRes);

      setStep(3); // drafting
      const vRes = await draftMessages(pRes.persona.name, rRes.channel);
      setVariants(vRes);
      setCampaignName(`${pRes.persona.name} - ${rRes.channel} Campaign`);

      setStep(4); // ready for review
    } catch (err) {
      console.error(err);
      alert('AI workflow failed. Make sure the API is running.');
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
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">AI Persona Intelligence Hub</h1>
        <p className="text-slate-500 mt-2 text-lg">Describe your goal, and XenoCopilot will automatically find the best audience, recommend channels, and launch the campaign.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
        {/* Left Column: Discovered Personas */}
        <div className="col-span-1 flex flex-col gap-4">
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">Top Customer Personas</h2>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-20 skeleton rounded-xl" />)}
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto pr-2 pb-8">
              {stats?.personas?.map((p: any) => (
                <div key={p.name} className="card p-5 border-l-4 border-teal-500 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-800">{p.name}</h3>
                    <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2.5 py-1 rounded-full">
                      {p.count} shoppers
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${Math.min(100, (p.count / stats.total) * 100)}%` }} />
                  </div>
                </div>
              ))}
              
              <div className="card p-5 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white mt-4">
                <p className="text-sm font-semibold opacity-90 uppercase tracking-wide">Total Revenue</p>
                <p className="text-3xl font-bold mt-1">₹{(stats?.total * stats?.avg_spend).toLocaleString('en-IN')}</p>
                <p className="text-sm opacity-80 mt-1">From {stats?.total} active shoppers</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Chat & Workflow */}
        <div className="col-span-2 card flex flex-col bg-slate-50 overflow-hidden border border-slate-200 shadow-sm relative">
          <div className="p-6 border-b border-slate-200 bg-white">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <span className="text-indigo-600">✨</span> Campaign Copilot
            </h2>
          </div>

          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 relative">
            
            {/* Step 0: Input */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <label className="block text-sm font-medium text-slate-700 mb-2">What is your goal?</label>
              <textarea
                value={goal}
                onChange={e => setGoal(e.target.value)}
                placeholder="e.g. Sell our excess inventory of dresses, or Increase repeat purchases from loyalists..."
                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all"
                rows={3}
                disabled={step > 0}
              />
              {step === 0 && (
                <button
                  onClick={handleStartWorkflow}
                  disabled={!goal.trim() || isProcessing}
                  className="mt-3 btn-primary w-full py-3 bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 shadow-lg text-white font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isProcessing ? 'Thinking...' : 'Generate Campaign'} 
                  {!isProcessing && <span>→</span>}
                </button>
              )}
            </div>

            {/* Step 1 & 2: Persona & Recommendation */}
            {step >= 1 && (
              <div className={`transition-all duration-500 ${step === 1 ? 'opacity-50 animate-pulse' : 'opacity-100'}`}>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-1">✨</div>
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex-1">
                    {step === 1 ? (
                      <p className="text-slate-600">Analyzing your goal to find the best persona...</p>
                    ) : (
                      <>
                        <p className="text-slate-800 mb-4">
                          Based on your goal, I recommend targeting <strong className="text-indigo-600">{personaResult?.persona.name}</strong>.
                        </p>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-xs text-slate-500 uppercase font-semibold">Audience Size</p>
                            <p className="text-xl font-bold text-slate-800">{personaResult?.count} shoppers</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-xs text-slate-500 uppercase font-semibold">Best Channel</p>
                            <p className="text-xl font-bold text-slate-800">{recResult?.channel}</p>
                          </div>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800">
                          <p className="text-sm font-semibold mb-1">Expected Revenue Impact</p>
                          <p className="text-2xl font-bold">₹{recResult?.expectedRevenue.toLocaleString('en-IN')}</p>
                          <p className="text-xs mt-1 opacity-80">Based on historical {recResult?.channel} conversion rates and persona AOV.</p>
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
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-1">✏️</div>
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex-1">
                    {step === 3 ? (
                      <p className="text-slate-600">Drafting personalized message variants...</p>
                    ) : (
                      <>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Campaign Name</label>
                          <input 
                            value={campaignName}
                            onChange={e => setCampaignName(e.target.value)}
                            className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"
                          />
                        </div>
                        <p className="text-sm font-medium text-slate-700 mb-3">Select a Message Variant:</p>
                        <div className="space-y-3">
                          <div 
                            onClick={() => setSelectedVariant('variantA')}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedVariant === 'variantA' ? 'border-indigo-500 bg-indigo-50 shadow-sm ring-1 ring-indigo-500' : 'border-slate-200 hover:border-indigo-300'}`}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Variant A</span>
                            </div>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{variants?.variantA}</p>
                          </div>
                          
                          <div 
                            onClick={() => setSelectedVariant('variantB')}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedVariant === 'variantB' ? 'border-indigo-500 bg-indigo-50 shadow-sm ring-1 ring-indigo-500' : 'border-slate-200 hover:border-indigo-300'}`}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Variant B</span>
                            </div>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{variants?.variantB}</p>
                          </div>
                        </div>

                        <button
                          onClick={handleLaunch}
                          disabled={isProcessing}
                          className="mt-6 w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isProcessing ? 'Launching...' : `Launch to ${personaResult?.count} Shoppers`}
                          {!isProcessing && <span>🚀</span>}
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
