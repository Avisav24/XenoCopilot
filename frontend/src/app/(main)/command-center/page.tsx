'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getRevenueLeaks, simulateCampaign, generateRevenuePlan, getRevenueFeed } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Spark, WarningTriangle, FastArrowRight, Target, Activity, Check, Plus, DatabaseScript, TrendingUp, Search } from 'iconoir-react';
import { setCampaignContext } from '@/lib/campaignContext';

export default function CommandCenterPage() {
  const router = useRouter();

  // Queries
  const { data: leaks, isLoading: leaksLoading } = useQuery({
    queryKey: ['revenue-leaks'],
    queryFn: getRevenueLeaks
  });

  const { data: feed, isLoading: feedLoading } = useQuery({
    queryKey: ['revenue-feed'],
    queryFn: getRevenueFeed
  });

  // State for Goal Planner
  const [goalInput, setGoalInput] = useState('');
  const [plannerOpen, setPlannerOpen] = useState(true);

  const plannerMutation = useMutation({
    mutationFn: (goal: string) => generateRevenuePlan(goal)
  });

  // State for Simulator
  const [simAudience, setSimAudience] = useState('');
  const [simChannel, setSimChannel] = useState('WhatsApp');
  const [simOffer, setSimOffer] = useState('');
  const [simGoal, setSimGoal] = useState('');
  const [simulatorOpen, setSimulatorOpen] = useState(true);

  const simulateMutation = useMutation({
    mutationFn: (data: any) => simulateCampaign(data)
  });

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const totalAtRisk = leaks?.reduce((sum: number, l: any) => sum + l.revenueAtRisk, 0) || 0;

  const handleLaunchCampaign = (name: string, size: number, expectedRev: number, prompt: string) => {
    setCampaignContext({
      sourcePage: 'Revenue Command Center',
      audienceName: name,
      audienceSize: size,
      expectedRevenue: expectedRev,
      autoTriggerPrompt: prompt
    });
    router.push('/chat');
  };

  return (
    <div className="p-8 w-full flex flex-col gap-8 min-h-screen bg-canvas text-ink">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] font-semibold flex items-center gap-2">
          <DatabaseScript height={28} width={28} className="text-primary" />
          Revenue Command Center
        </h1>
        <p className="text-[14px] text-muted">AI-Powered Revenue Leak Detection & Opportunity Planning</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Leaks & Planner */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Revenue At Risk Hero */}
          <div className="p-8 border border-hairline rounded-xl bg-surface-card flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <WarningTriangle height={120} width={120} />
            </div>
            <span className="text-[14px] font-bold uppercase tracking-wider text-semantic-down flex items-center gap-2">
              <WarningTriangle height={16} width={16} /> Revenue At Risk
            </span>
            <div className="mt-4 flex flex-col gap-1">
              {leaksLoading ? (
                <div className="h-12 w-48 bg-surface-soft animate-pulse rounded"></div>
              ) : (
                <>
                  <span className="text-[48px] font-mono-numbers font-semibold leading-none">{formatCurrency(totalAtRisk)}</span>
                  <p className="text-[14px] text-muted max-w-lg mt-2">
                    Identified across {leaks?.length || 0} active leaks in the database based on expected future spend vs. churn probability.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Revenue Leak Cards */}
          <div className="flex flex-col gap-4">
            <h2 className="text-[16px] font-semibold border-b border-hairline pb-2 flex items-center gap-2">
              <Search height={18} width={18} /> Leak Detection Engine
            </h2>
            
            {leaksLoading ? (
              <div className="p-6 border border-hairline rounded-xl bg-surface-card flex items-center justify-center text-muted">Scanning database for anomalies...</div>
            ) : leaks?.length === 0 ? (
              <div className="p-6 border border-hairline rounded-xl bg-surface-card flex items-center justify-center text-muted">No revenue leaks detected.</div>
            ) : (
              <div className="flex flex-col gap-4">
                {leaks?.map((leak: any, i: number) => (
                  <div key={i} className="p-6 border border-hairline rounded-xl bg-surface-card flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-[18px] font-semibold">{leak.title}</h3>
                        <span className="text-[13px] text-muted font-medium">Confidence: {leak.confidenceReason}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[18px] font-mono-numbers font-semibold text-semantic-down">{formatCurrency(leak.revenueAtRisk)}</span>
                        <span className="text-[12px] text-muted uppercase tracking-wider font-bold">At Risk</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="flex flex-col gap-2">
                        <span className="text-[12px] font-bold uppercase tracking-wider text-muted">Evidence</span>
                        <ul className="flex flex-col gap-1.5">
                          {leak.evidence.map((ev: string, idx: number) => (
                            <li key={idx} className="text-[13px] text-ink flex items-start gap-2">
                              <span className="text-semantic-down mt-1">•</span> {ev}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex flex-col justify-center items-end bg-surface-soft p-4 rounded-lg border border-hairline">
                        <span className="text-[12px] font-bold uppercase tracking-wider text-muted">Recoverable</span>
                        <span className="text-[24px] font-mono-numbers font-semibold text-semantic-up">{formatCurrency(leak.recoverableRevenue)}</span>
                        <span className="text-[13px] font-medium text-ink mt-1">{leak.customersAffected} Customers Affected</span>
                      </div>
                    </div>

                    <div className="mt-2 pt-4 border-t border-hairline flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Spark height={16} width={16} className="text-primary" />
                        <span className="text-[13px] font-medium text-ink">Action: {leak.recommendation}</span>
                      </div>
                      <button 
                        onClick={() => handleLaunchCampaign(leak.title, leak.customersAffected, leak.recoverableRevenue, `Target this audience to recover revenue: ${leak.title}. Focus on ${leak.recommendation}`)}
                        className="btn-primary text-[12px] py-1.5 px-3"
                      >
                        Generate Campaign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Autonomous Goal Planner */}
          <div className="flex flex-col gap-4 mt-4">
            <h2 className="text-[16px] font-semibold border-b border-hairline pb-2 flex items-center gap-2">
              <Target height={18} width={18} /> Autonomous Revenue Goal Planner
            </h2>
            
            <div className="p-6 border border-hairline rounded-xl bg-surface-card flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-bold uppercase tracking-wider text-muted">Set Revenue Target</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    placeholder="e.g. ₹10,00,000"
                    className="flex-1 bg-canvas border border-hairline rounded-lg px-4 py-2 text-[15px] focus:outline-none focus:border-primary font-mono-numbers"
                  />
                  <button 
                    onClick={() => plannerMutation.mutate(goalInput)}
                    disabled={!goalInput || plannerMutation.isPending}
                    className="btn-primary"
                  >
                    {plannerMutation.isPending ? 'Generating Plan...' : 'Generate Plan'}
                  </button>
                </div>
              </div>

              {plannerMutation.isSuccess && plannerMutation.data && (
                <div className="flex flex-col gap-4 mt-4 pt-4 border-t border-hairline">
                  <div className="flex justify-between items-center bg-surface-soft p-4 rounded-lg border border-hairline">
                    <span className="text-[14px] font-bold text-ink">Total Forecasted Revenue</span>
                    <span className="text-[24px] font-mono-numbers font-bold text-semantic-up">{formatCurrency(plannerMutation.data.totalForecast)}</span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {plannerMutation.data.opportunities.map((opp: any, i: number) => (
                      <div key={i} className="p-4 border border-hairline rounded-lg bg-canvas flex justify-between items-center">
                        <div className="flex flex-col gap-1">
                          <span className="text-[15px] font-semibold text-ink">{opp.title}</span>
                          <span className="text-[13px] text-muted">Audience: {opp.audienceSize} | {opp.recommendedChannel} | Est. CR: {opp.estimatedConversionRate}%</span>
                          <span className="text-[12px] text-ink mt-1">Strategy: {opp.messageStrategy}</span>
                        </div>
                        <div className="flex flex-col items-end gap-2 min-w-[120px]">
                          <span className="text-[16px] font-mono-numbers font-bold text-semantic-up">+{formatCurrency(opp.potentialRevenue)}</span>
                          <button 
                            onClick={() => handleLaunchCampaign(opp.title, opp.audienceSize, opp.potentialRevenue, `Build a campaign for ${opp.title} via ${opp.recommendedChannel}. Strategy: ${opp.messageStrategy}`)}
                            className="btn-secondary text-[11px] py-1 px-2 flex items-center gap-1"
                          >
                            Launch <FastArrowRight height={12} width={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Simulator & Feed */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Decision Simulator */}
          <div className="flex flex-col gap-4">
            <h2 className="text-[16px] font-semibold border-b border-hairline pb-2 flex items-center gap-2">
              <Strategy height={18} width={18} /> AI Decision Simulator
            </h2>
            
            <div className="p-5 border border-hairline rounded-xl bg-surface-card flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-bold uppercase tracking-wider text-muted">Audience Segment</label>
                  <input type="text" value={simAudience} onChange={e=>setSimAudience(e.target.value)} placeholder="e.g. Dormant VIPs" className="input-field text-[13px]" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-bold uppercase tracking-wider text-muted">Channel</label>
                  <select value={simChannel} onChange={e=>setSimChannel(e.target.value)} className="input-field text-[13px]">
                    <option>WhatsApp</option>
                    <option>Email</option>
                    <option>SMS</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-bold uppercase tracking-wider text-muted">Offer / Discount</label>
                  <input type="text" value={simOffer} onChange={e=>setSimOffer(e.target.value)} placeholder="e.g. 20% off" className="input-field text-[13px]" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-bold uppercase tracking-wider text-muted">Goal</label>
                  <input type="text" value={simGoal} onChange={e=>setSimGoal(e.target.value)} placeholder="e.g. Reactivation" className="input-field text-[13px]" />
                </div>
                <button 
                  onClick={() => simulateMutation.mutate({ audienceName: simAudience, channel: simChannel, offer: simOffer, campaignGoal: simGoal })}
                  disabled={!simAudience || !simGoal || simulateMutation.isPending}
                  className="btn-primary mt-2"
                >
                  {simulateMutation.isPending ? 'Simulating...' : 'Run Simulation'}
                </button>
              </div>

              {simulateMutation.isSuccess && simulateMutation.data && (
                <div className="mt-2 flex flex-col gap-4 border-t border-hairline pt-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col p-3 bg-surface-soft rounded border border-hairline">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Expected Rev</span>
                      <span className="text-[16px] font-mono-numbers font-bold text-semantic-up">{formatCurrency(simulateMutation.data.expectedRevenue)}</span>
                    </div>
                    <div className="flex flex-col p-3 bg-surface-soft rounded border border-hairline">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Est. ROI</span>
                      <span className="text-[16px] font-mono-numbers font-bold text-ink">{simulateMutation.data.expectedROI}x</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-bold uppercase tracking-wider text-muted">Reasoning</span>
                    <ul className="flex flex-col gap-1">
                      {simulateMutation.data.reasoning.map((r: string, idx: number) => (
                        <li key={idx} className="text-[12px] text-ink">• {r}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-bold uppercase tracking-wider text-semantic-warning">Risk Factors</span>
                    <ul className="flex flex-col gap-1">
                      {simulateMutation.data.risks.map((r: string, idx: number) => (
                        <li key={idx} className="text-[12px] text-ink">• {r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Revenue Feed */}
          <div className="flex flex-col gap-4 mt-4">
            <h2 className="text-[16px] font-semibold border-b border-hairline pb-2 flex items-center gap-2">
              <Activity height={18} width={18} /> Command Feed
            </h2>
            <div className="flex flex-col gap-3">
              {feedLoading ? (
                <div className="text-[13px] text-muted p-4 bg-surface-card rounded-xl border border-hairline">Loading live feed...</div>
              ) : feed?.map((item: any, i: number) => (
                <div key={i} className="p-4 border border-hairline rounded-lg bg-surface-card flex flex-col gap-1 hover:border-primary/50 transition-colors cursor-default">
                  <div className="flex justify-between items-center">
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      item.category.includes('Opportunity') ? 'bg-emerald-100 text-emerald-800' :
                      item.category.includes('Risk') ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {item.category}
                    </span>
                    <span className="text-[11px] text-muted">{item.timestamp}</span>
                  </div>
                  <p className="text-[13px] font-medium text-ink mt-1">{item.message}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
