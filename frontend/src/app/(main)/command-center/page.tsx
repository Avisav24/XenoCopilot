'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getRevenueLeaks, getRevenueOpportunities, simulateCampaign, generateRevenuePlan, getRevenueDebug } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { DatabaseScript, FastArrowRight, Spark, WarningTriangle } from 'iconoir-react';
import { setCampaignContext } from '@/lib/campaignContext';
import { clsx } from 'clsx';

export default function CommandCenterPage() {
  const router = useRouter();

  const { data: debugInfo } = useQuery({
    queryKey: ['revenue-debug'],
    queryFn: getRevenueDebug
  });

  const { data: leaks, isLoading: leaksLoading, isError: leaksError, refetch: refetchLeaks } = useQuery({
    queryKey: ['revenue-leaks'],
    queryFn: getRevenueLeaks
  });

  const { data: opportunities, isLoading: oppsLoading, isError: oppsError, refetch: refetchOpps } = useQuery({
    queryKey: ['revenue-opportunities'],
    queryFn: getRevenueOpportunities
  });

  // State for Goal Planner
  const [goalInput, setGoalInput] = useState('');
  const plannerMutation = useMutation({
    mutationFn: (goal: string) => generateRevenuePlan(goal)
  });

  // State for Simulator
  const [simAudience, setSimAudience] = useState('');
  const [simChannel, setSimChannel] = useState('WhatsApp');
  const [simOffer, setSimOffer] = useState('');
  const [simDiscount, setSimDiscount] = useState('');
  const [simSendTime, setSimSendTime] = useState('');
  const [simGoal, setSimGoal] = useState('');

  const simulateMutation = useMutation({
    mutationFn: (data: any) => simulateCampaign(data)
  });

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const totalAtRisk = leaks?.reduce((sum: number, l: any) => sum + l.revenueAtRisk, 0) || 0;
  const totalOpp = opportunities?.reduce((sum: number, o: any) => sum + o.potentialRevenue, 0) || 0;
  const predictedRecovery = leaks?.reduce((sum: number, l: any) => sum + l.recoverableRevenue, 0) || 0;
  
  const topLeak = leaks?.[0];

  const handleLaunchCampaign = (name: string, size: number, expectedRev: number, prompt: string, channel?: string) => {
    setCampaignContext({
      sourcePage: 'Revenue Command Center',
      audienceName: name,
      audienceSize: size,
      expectedRevenue: expectedRev,
      autoTriggerPrompt: prompt,
      ...(channel && { channel })
    });
    router.push('/chat');
  };

  return (
    <div className="p-8 w-full flex flex-col gap-12 min-h-screen bg-white text-ink font-sans selection:bg-primary/20">
      
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-hairline pb-4">
        <h1 className="text-[24px] font-semibold flex items-center gap-2 tracking-tight">
          Revenue Command Center
        </h1>
        <p className="text-[14px] text-ink-muted">AI-Powered Revenue Operating System</p>
      </div>

      {debugInfo?.warning && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded text-[13px] flex items-center gap-2">
          <WarningTriangle className="w-4 h-4 text-amber-500" />
          <span>{debugInfo.warning}</span>
        </div>
      )}

      {(leaksError || oppsError) && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded flex flex-col items-start gap-3">
          <div className="flex items-center gap-2 text-[14px] font-medium">
            <WarningTriangle className="w-4 h-4" />
            <span>Revenue engine unavailable.</span>
          </div>
          <button 
            onClick={() => { refetchLeaks(); refetchOpps(); }}
            className="btn-primary text-[12px] py-1.5 px-3"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* SECTION 1: EXECUTIVE BRIEFING STRIP */}
      <div className="grid grid-cols-4 border border-hairline bg-white shadow-sm">
        <div className="p-5 border-r border-hairline flex flex-col gap-1">
          <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">Revenue At Risk</span>
          <span className="text-[28px] font-mono-numbers font-semibold text-semantic-down">{formatCurrency(totalAtRisk)}</span>
        </div>
        <div className="p-5 border-r border-hairline flex flex-col gap-1">
          <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">Revenue Opportunity</span>
          <span className="text-[28px] font-mono-numbers font-semibold text-semantic-up">{formatCurrency(totalOpp)}</span>
        </div>
        <div className="p-5 border-r border-hairline flex flex-col gap-1">
          <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">Predicted Recovery</span>
          <span className="text-[28px] font-mono-numbers font-semibold text-ink">{formatCurrency(predictedRecovery)}</span>
        </div>
        <div className="p-5 flex flex-col justify-center bg-canvas-soft">
          <span className="text-[11px] font-bold text-primary uppercase tracking-wider mb-2">Highest Priority Action</span>
          <button 
            className="btn-primary text-[13px] py-2 w-full truncate"
            onClick={() => handleLaunchCampaign(topLeak?.title || 'VIP Recovery', topLeak?.customersAffected || 0, topLeak?.recoverableRevenue || 0, 'Launch top priority campaign')}
          >
            Launch {topLeak?.title || 'Recovery'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        
        {/* LEFT COLUMN: Leaks & Opportunities */}
        <div className="xl:col-span-7 flex flex-col gap-12">
          
          {/* SECTION 2: REVENUE LEAK ENGINE */}
          <div className="flex flex-col gap-4">
            <h2 className="text-[15px] font-semibold border-b border-hairline pb-2 flex items-center gap-2 tracking-tight">
               Revenue Leak Engine
            </h2>
            
            {leaksLoading ? (
              <div className="flex flex-col gap-4">
                {[1, 2].map((n) => (
                  <div key={n} className="border border-hairline bg-white shadow-sm p-5 flex flex-col gap-4 animate-pulse">
                    <div className="flex justify-between items-start border-b border-hairline pb-4">
                      <div className="flex flex-col gap-2 w-1/2">
                        <div className="h-4 bg-canvas-soft w-3/4 rounded"></div>
                        <div className="h-3 bg-canvas-soft w-1/2 rounded"></div>
                      </div>
                      <div className="h-8 bg-canvas-soft w-24 rounded"></div>
                    </div>
                    <div className="h-20 bg-canvas-soft w-full rounded"></div>
                  </div>
                ))}
              </div>
            ) : leaks?.length === 0 ? (
              <div className="p-8 border border-hairline bg-white flex flex-col items-center justify-center gap-2">
                <span className="text-[14px] font-semibold text-ink">No revenue leaks detected</span>
                <span className="text-[13px] text-ink-muted">Your customer base is currently healthy.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {leaks?.map((leak: any, i: number) => (
                  <div key={i} className="border border-hairline bg-white shadow-sm p-0 flex flex-col">
                    <div className="p-5 flex justify-between items-start border-b border-hairline">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-[16px] font-semibold tracking-tight">{leak.title}</h3>
                        <div className="flex gap-4 text-[13px] mt-1">
                          <span className="text-ink-muted"><strong className="text-ink font-mono-numbers">{leak.customersAffected}</strong> Customers</span>
                          <span className="text-ink-muted"><strong className="text-ink font-mono-numbers">{leak.confidenceReason}</strong></span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-semantic-down">Revenue At Risk</span>
                        <span className="text-[20px] font-mono-numbers font-semibold text-semantic-down">{formatCurrency(leak.revenueAtRisk)}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2">
                      <div className="p-5 border-r border-hairline flex flex-col gap-3">
                        <span className="text-[12px] font-bold text-ink-muted uppercase tracking-wider">Why This Exists</span>
                        <ul className="flex flex-col gap-2">
                          {leak.evidence.map((ev: string, idx: number) => (
                            <li key={idx} className="text-[13px] text-ink flex items-start gap-2">
                              <span className="text-ink-muted mt-0.5">•</span> <span>{ev}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-5 flex flex-col justify-between bg-canvas-soft">
                        <div className="flex justify-between items-center">
                          <span className="text-[12px] font-bold text-ink-muted uppercase tracking-wider">Predicted Loss</span>
                          <span className="text-[13px] font-semibold text-semantic-warning bg-semantic-warning/10 px-2 py-0.5 rounded">{leak.predictedLossDate || '14 Days'}</span>
                        </div>
                        <div className="mt-4 flex flex-col gap-2">
                          <span className="text-[12px] font-bold text-primary uppercase tracking-wider">Recommended Action</span>
                          <span className="text-[14px] font-medium text-ink">{leak.recommendation}</span>
                          <button 
                            onClick={() => handleLaunchCampaign(leak.title, leak.customersAffected, leak.recoverableRevenue, `Target audience: ${leak.title}. Action: ${leak.recommendation}`)}
                            className="btn-primary text-[12px] py-1.5 mt-2"
                          >
                            Execute Action
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 3: REVENUE OPPORTUNITY ENGINE */}
          <div className="flex flex-col gap-4">
            <h2 className="text-[15px] font-semibold border-b border-hairline pb-2 flex items-center gap-2 tracking-tight">
               Revenue Opportunity Engine
            </h2>
            
            <div className="border border-hairline bg-white shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-canvas-soft border-b border-hairline">
                    <th className="p-3 text-[11px] font-bold text-ink-muted uppercase tracking-wider">Opportunity</th>
                    <th className="p-3 text-[11px] font-bold text-ink-muted uppercase tracking-wider text-right">Potential Revenue</th>
                    <th className="p-3 text-[11px] font-bold text-ink-muted uppercase tracking-wider">Audience</th>
                    <th className="p-3 text-[11px] font-bold text-ink-muted uppercase tracking-wider">Channel</th>
                    <th className="p-3 text-[11px] font-bold text-ink-muted uppercase tracking-wider text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-[13px]">
                  {oppsLoading ? (
                    <>
                      {[1, 2, 3].map((n) => (
                        <tr key={n} className="border-b border-hairline animate-pulse">
                          <td className="p-3"><div className="h-4 bg-canvas-soft w-3/4 rounded"></div></td>
                          <td className="p-3"><div className="h-4 bg-canvas-soft w-full rounded"></div></td>
                          <td className="p-3"><div className="h-4 bg-canvas-soft w-1/2 rounded"></div></td>
                          <td className="p-3"><div className="h-4 bg-canvas-soft w-3/4 rounded"></div></td>
                          <td className="p-3"><div className="h-6 bg-canvas-soft w-full rounded"></div></td>
                        </tr>
                      ))}
                    </>
                  ) : opportunities?.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-[13px] text-ink-muted bg-white">No revenue opportunities detected.</td></tr>
                  ) : opportunities?.map((opp: any, idx: number) => (
                    <tr key={idx} className="border-b border-hairline hover:bg-canvas-soft transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-ink">{opp.opportunity}</div>
                        <div className="text-[11px] text-ink-muted mt-1">{opp.reasoning.join(' • ')}</div>
                      </td>
                      <td className="p-3 text-right font-mono-numbers font-semibold text-semantic-up">{formatCurrency(opp.potentialRevenue)}</td>
                      <td className="p-3 font-mono-numbers">{opp.audience} Users</td>
                      <td className="p-3">{opp.channel}</td>
                      <td className="p-3 text-center">
                        <button 
                          onClick={() => handleLaunchCampaign(opp.opportunity, opp.audience, opp.potentialRevenue, `Build a campaign for ${opp.opportunity}. Strategy: ${opp.action}`, opp.channel)}
                          className="btn-secondary text-[11px] py-1 px-3"
                        >
                          Launch
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Simulator & Planner */}
        <div className="xl:col-span-5 flex flex-col gap-12">
          
          {/* SECTION 4: AI DECISION SIMULATOR */}
          <div className="flex flex-col gap-4">
            <h2 className="text-[15px] font-semibold border-b border-hairline pb-2 flex items-center gap-2 tracking-tight">
               AI Decision Simulator
            </h2>
            
            <div className="border border-hairline bg-white shadow-sm flex flex-col">
              <div className="p-5 flex flex-col gap-4 border-b border-hairline bg-canvas-soft">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Audience</label>
                    <input type="text" value={simAudience} onChange={e=>setSimAudience(e.target.value)} placeholder="e.g. Dormant VIPs" className="w-full bg-white border border-hairline rounded px-3 py-1.5 text-[13px] focus:outline-none focus:border-ink transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Channel</label>
                    <select value={simChannel} onChange={e=>setSimChannel(e.target.value)} className="w-full bg-white border border-hairline rounded px-3 py-1.5 text-[13px] focus:outline-none focus:border-ink transition-colors">
                      <option>WhatsApp</option>
                      <option>Email</option>
                      <option>SMS</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Offer / Message</label>
                    <input type="text" value={simOffer} onChange={e=>setSimOffer(e.target.value)} placeholder="e.g. Free shipping" className="w-full bg-white border border-hairline rounded px-3 py-1.5 text-[13px] focus:outline-none focus:border-ink transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Discount %</label>
                    <input type="text" value={simDiscount} onChange={e=>setSimDiscount(e.target.value)} placeholder="e.g. 20%" className="w-full bg-white border border-hairline rounded px-3 py-1.5 text-[13px] focus:outline-none focus:border-ink transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Objective</label>
                    <input type="text" value={simGoal} onChange={e=>setSimGoal(e.target.value)} placeholder="e.g. Reactivation" className="w-full bg-white border border-hairline rounded px-3 py-1.5 text-[13px] focus:outline-none focus:border-ink transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Send Time</label>
                    <input type="text" value={simSendTime} onChange={e=>setSimSendTime(e.target.value)} placeholder="e.g. 8 PM" className="w-full bg-white border border-hairline rounded px-3 py-1.5 text-[13px] focus:outline-none focus:border-ink transition-colors" />
                  </div>
                </div>
                <button 
                  onClick={() => simulateMutation.mutate({ audienceName: simAudience, channel: simChannel, offer: simOffer, discount: simDiscount, sendTime: simSendTime, campaignGoal: simGoal })}
                  disabled={!simAudience || simulateMutation.isPending}
                  className="btn-primary w-full mt-2 py-2"
                >
                  {simulateMutation.isPending ? 'Simulating...' : 'Run Simulation'}
                </button>
              </div>

              {simulateMutation.isSuccess && simulateMutation.data && (
                <div className="flex flex-col">
                  <div className="grid grid-cols-3 border-b border-hairline text-center divide-x divide-hairline bg-white">
                    <div className="p-4 flex flex-col gap-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Expected Rev</span>
                      <span className="text-[16px] font-mono-numbers font-semibold text-semantic-up">{formatCurrency(simulateMutation.data.expectedRevenue)}</span>
                    </div>
                    <div className="p-4 flex flex-col gap-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Est. ROI</span>
                      <span className="text-[16px] font-mono-numbers font-semibold text-ink">{simulateMutation.data.expectedROI}x</span>
                    </div>
                    <div className="p-4 flex flex-col gap-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Purchasers</span>
                      <span className="text-[16px] font-mono-numbers font-semibold text-ink">{simulateMutation.data.expectedPurchasers}</span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col gap-4 bg-white">
                    <div className="flex justify-between items-center">
                       <span className="text-[12px] font-bold uppercase tracking-wider text-ink-muted">Conversion Rate</span>
                       <span className="text-[14px] font-mono-numbers font-semibold text-ink">{simulateMutation.data.expectedConversionRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[12px] font-bold uppercase tracking-wider text-ink-muted">Revenue Risk</span>
                       <span className={clsx("text-[13px] font-bold px-2 py-0.5 rounded", simulateMutation.data.risk === 'Low' ? 'bg-semantic-success/10 text-semantic-success' : 'bg-semantic-warning/10 text-semantic-warning')}>{simulateMutation.data.risk}</span>
                    </div>
                    <div className="mt-2 pt-4 border-t border-hairline flex flex-col gap-2">
                      <span className="text-[12px] font-bold uppercase tracking-wider text-primary">System Memory Reasoning</span>
                      <ul className="flex flex-col gap-2">
                        {simulateMutation.data.reasoning.map((r: string, idx: number) => (
                          <li key={idx} className="text-[13px] text-ink flex items-start gap-2">
                            <Spark height={14} width={14} className="text-primary mt-0.5 shrink-0" /> <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 6: AUTONOMOUS REVENUE GOAL PLANNER */}
          <div className="flex flex-col gap-4">
            <h2 className="text-[15px] font-semibold border-b border-hairline pb-2 flex items-center gap-2 tracking-tight">
               Autonomous Goal Planner
            </h2>
            
            <div className="border border-hairline bg-white shadow-sm flex flex-col">
              <div className="p-5 bg-canvas-soft border-b border-hairline flex flex-col gap-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Set Revenue Goal</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    placeholder="e.g. ₹10,00,000"
                    className="flex-1 bg-white border border-hairline rounded px-3 py-1.5 text-[14px] font-mono-numbers focus:outline-none focus:border-ink"
                  />
                  <button 
                    onClick={() => plannerMutation.mutate(goalInput)}
                    disabled={!goalInput || plannerMutation.isPending}
                    className="btn-primary"
                  >
                    {plannerMutation.isPending ? 'Planning...' : 'Generate Plan'}
                  </button>
                </div>
              </div>

              {plannerMutation.isSuccess && plannerMutation.data && (
                <div className="flex flex-col">
                  <div className="p-5 flex justify-between items-center border-b border-hairline">
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">Projected Total</span>
                      <span className="text-[20px] font-mono-numbers font-bold text-ink">{formatCurrency(plannerMutation.data.projectedTotalRevenue)}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">Status</span>
                      <span className="text-[13px] font-bold text-semantic-success bg-semantic-success/10 px-2 py-0.5 rounded">{plannerMutation.data.status}</span>
                    </div>
                  </div>
                  
                  <div className="p-5 flex flex-col gap-2 border-b border-hairline">
                    <span className="text-[12px] font-bold uppercase tracking-wider text-ink-muted">Gap Analysis</span>
                    <span className="text-[13px] text-ink">{plannerMutation.data.gapAnalysis} (Exp: {plannerMutation.data.expectedCompletionDate})</span>
                  </div>

                  <table className="w-full text-left border-collapse text-[13px]">
                    <thead>
                      <tr className="bg-canvas-soft border-b border-hairline">
                        <th className="p-3 text-[11px] font-bold text-ink-muted uppercase tracking-wider">Campaign</th>
                        <th className="p-3 text-[11px] font-bold text-ink-muted uppercase tracking-wider text-right">Revenue</th>
                        <th className="p-3 text-[11px] font-bold text-ink-muted uppercase tracking-wider text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plannerMutation.data.opportunities.map((opp: any, i: number) => (
                        <tr key={i} className="border-b border-hairline">
                          <td className="p-3 font-medium text-ink">{opp.title}</td>
                          <td className="p-3 text-right font-mono-numbers font-semibold text-semantic-up">{formatCurrency(opp.potentialRevenue)}</td>
                          <td className="p-3 text-center">
                            <button 
                              onClick={() => handleLaunchCampaign(opp.title, opp.audienceSize, opp.potentialRevenue, `Execute plan: ${opp.title} via ${opp.recommendedChannel}.`, opp.recommendedChannel)}
                              className="text-[11px] font-bold text-primary hover:underline"
                            >
                              Launch
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
