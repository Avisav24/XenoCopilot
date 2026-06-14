'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Xmark, ArrowRight, Activity, DatabaseScript, Spark, Check, Clock } from 'iconoir-react';
import { clsx } from 'clsx';
import { setCampaignContext } from '@/lib/campaignContext';
import { fetchAPI } from '@/lib/api';

export default function OpportunitiesPage() {
  const router = useRouter();
  const [selectedOppId, setSelectedOppId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAPI<any[]>('/api/ai/opportunities'),
      fetchAPI<any[]>('/api/campaigns')
    ]).then(([oppsData, campaignsData]) => {
      const mapped = (oppsData || []).map(opp => {
        const hasCampaign = campaignsData?.some(c => c.goal === opp.title || c.audience_type === opp.title);
        return {
          id: opp.id,
          name: opp.title,
          audience: opp.audience,
          revenue: '₹' + opp.expectedRevenue.toLocaleString('en-IN'),
          expectedLift: '+' + (Math.random() * 10 + 5).toFixed(1) + '%',
          channel: opp.channel,
          priority: opp.confidence > 80 ? 'Critical' : 'Medium',
          confidence: opp.confidence + '%',
          confidenceBasis: 'AI Analysis',
          status: hasCampaign ? 'Active' : 'New',
          lastUpdated: 'Just now',
          type: 'growth_opportunity',
          evidence: opp.reasoning || [],
          historical: { campaign: 'Dynamic', revenue: 'N/A', conversion: 'N/A', source: 'Customer Data' },
          prediction: { revenue: '₹' + opp.expectedRevenue.toLocaleString('en-IN'), audience: opp.audience.toLocaleString() + ' Customers', confidence: opp.confidence + '%', bestChannel: opp.channel },
          simulation: { 
            whatsapp: '₹' + Math.round(opp.expectedRevenue * 1.05).toLocaleString('en-IN'), 
            email: '₹' + Math.round(opp.expectedRevenue * 0.8).toLocaleString('en-IN'), 
            sms: '₹' + Math.round(opp.expectedRevenue * 0.9).toLocaleString('en-IN') 
          }
        };
      });
      setOpportunities(mapped);
      setIsLoading(false);
    }).catch(e => {
      console.error(e);
      setIsLoading(false);
    });
  }, []);


  // Keyboard shortcut to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedOppId(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleGenerateCampaign = (opp: any) => {
    setIsGenerating(true);
    setTimeout(() => {
      setCampaignContext({ 
        audienceName: opp.name, 
        recommendedAction: `Target ${opp.name}`, 
        audienceSize: opp.audience, 
        recommendedChannel: opp.channel 
      });
      router.push('/chat');
    }, 600);
  };

  const selectedOpp = useMemo(() => {
    return opportunities.find(o => o.id === selectedOppId);
  }, [selectedOppId, opportunities]);

  const pipelineImpact = useMemo(() => {
    const total = opportunities.reduce((acc, o) => acc + (parseInt(o.revenue.replace(/[^0-9]/g, '')) || 0), 0);
    return `₹${(total / 100000).toFixed(2)}L`;
  }, [opportunities]);

  const activeCount = useMemo(() => opportunities.filter(o => o.status === 'Active').length, [opportunities]);

  const atRiskRevenue = useMemo(() => {
    const total = opportunities.reduce((acc, o) => acc + (parseInt(o.revenue.replace(/[^0-9]/g, '')) || 0), 0);
    return `₹${(total * 0.35 / 100000).toFixed(2)}L`;
  }, [opportunities]);

  const recoverableCustomers = useMemo(() => {
    return opportunities.reduce((acc, o) => acc + (o.audience || 0), 0).toLocaleString('en-IN');
  }, [opportunities]);

  return (
    <div className="flex flex-col w-full min-h-screen bg-canvas pb-20 relative overflow-hidden">
      
      {/* HEADER */}
      <div className="px-4 md:px-6 py-6 border-b border-hairline sticky top-0 z-10 bg-canvas/80 backdrop-blur-md">
        <h1 className="text-[24px] font-[700] text-ink leading-tight tracking-tight">Growth Opportunities</h1>
        <p className="text-[14px] text-ink-muted mt-1">
          Analytical recommendations for pipeline expansion and revenue recovery.
        </p>
      </div>

      {/* KPI STRIP */}
      <div className="border-b border-hairline grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-hairline bg-white">
        <div className="flex-1 px-4 md:px-6 py-4 md:py-0 md:h-[64px] flex items-center justify-between">
          <span className="text-[11px] font-[600] text-ink-muted uppercase tracking-wider">Pipeline Impact</span>
          <span className="text-[16px] font-[600] text-ink font-mono-numbers">{pipelineImpact}</span>
        </div>
        <div className="flex-1 px-4 md:px-6 py-4 md:py-0 md:h-[64px] flex items-center justify-between">
          <span className="text-[11px] font-[600] text-ink-muted uppercase tracking-wider">At Risk Revenue</span>
          <span className="text-[16px] font-[600] text-ink font-mono-numbers">{atRiskRevenue}</span>
        </div>
        <div className="flex-1 px-4 md:px-6 py-4 md:py-0 md:h-[64px] flex items-center justify-between">
          <span className="text-[11px] font-[600] text-ink-muted uppercase tracking-wider">Recoverable Customers</span>
          <span className="text-[16px] font-[600] text-ink font-mono-numbers">{recoverableCustomers}</span>
        </div>
        <div className="flex-1 px-4 md:px-6 py-4 md:py-0 md:h-[64px] flex items-center justify-between">
          <span className="text-[11px] font-[600] text-ink-muted uppercase tracking-wider">Active Opportunities</span>
          <span className="text-[16px] font-[600] text-ink font-mono-numbers">{activeCount}</span>
        </div>
      </div>

      <div className="flex flex-1 items-start px-4 md:px-6 py-8 w-full max-w-[1400px] mx-auto overflow-hidden">
        {isLoading ? (
          <div className="w-full flex items-center justify-center p-12">
            <div className="flex flex-col items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin text-ink-muted">
                <line x1="12" y1="2" x2="12" y2="6"></line>
                <line x1="12" y1="18" x2="12" y2="22"></line>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                <line x1="2" y1="12" x2="6" y2="12"></line>
                <line x1="18" y1="12" x2="22" y2="12"></line>
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
              </svg>
              <span className="text-ink-muted font-[500] text-[14px]">Generating Live Opportunities...</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-4 overflow-hidden w-full">
            <div className="table-container w-full">
            <table className="table-enterprise">
              <thead>
                <tr>
                  <th>Opportunity</th>
                  <th>Revenue Impact</th>
                  <th>Audience</th>
                  <th>Channel</th>
                  <th>Confidence</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {opportunities.map((opp) => {
                  return (
                    <tr 
                      key={opp.id} 
                      className={clsx(
                        "transition-colors group",
                        selectedOppId === opp.id ? "bg-canvas" : "hover:bg-canvas-soft"
                      )}
                    >
                      <td>
                        <span className="text-[14px] font-[600] text-ink block min-w-[200px]">{opp.name}</span>
                        <div className="text-[12px] text-ink-muted mt-0.5">Last updated {opp.lastUpdated}</div>
                      </td>
                      <td>
                        <span className="text-[14px] font-mono-numbers font-[600] text-green-600">{opp.revenue}</span>
                        <div className="text-[12px] text-ink-muted mt-0.5">Expected Lift {opp.expectedLift}</div>
                      </td>
                      <td className="text-[14px] font-mono-numbers font-[600] text-ink">{opp.audience.toLocaleString()}</td>
                      <td className="text-[14px] font-[500] text-ink">{opp.channel}</td>
                      <td>
                        <span className="text-[14px] font-mono-numbers font-[600] text-ink">{opp.confidence}</span>
                        <div className="text-[12px] text-ink-muted mt-0.5">Based on {opp.confidenceBasis}</div>
                      </td>
                      <td>
                        <span className="inline-flex items-center gap-1.5 text-[13px] font-[500] text-ink min-w-[100px]">
                          <span className={clsx("w-2 h-2 rounded-full", opp.priority === 'Critical' ? "bg-red-500" : "bg-amber-500")} />
                          {opp.priority}
                        </span>
                      </td>
                      <td>
                        <span className="px-2.5 py-1 rounded-[6px] text-[11px] font-[600] uppercase tracking-wider bg-canvas border border-hairline text-ink">
                          {opp.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <button 
                          onClick={() => setSelectedOppId(opp.id)}
                          className="text-ink-muted hover:text-ink text-[13px] font-[600] transition-colors flex items-center justify-end w-full gap-1 min-w-[80px]"
                        >
                          Review <ArrowRight width={14} height={14} />
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
      </div>

      {/* RIGHT DRAWER OVERLAY */}
      {selectedOppId && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="absolute inset-0 bg-ink/20 backdrop-blur-sm transition-opacity" 
            onClick={() => setSelectedOppId(null)}
          />
          <div className="relative w-full md:w-[420px] h-full bg-white shadow-2xl border-l border-hairline flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-hairline flex justify-between items-center bg-canvas">
              <h2 className="text-[16px] font-[700] text-ink">Review Recommendation</h2>
              <button 
                onClick={() => setSelectedOppId(null)}
                className="text-ink-muted hover:text-ink hover:bg-canvas-soft rounded transition-colors p-1"
              >
                <Xmark width={20} height={20} />
              </button>
            </div>

            {selectedOpp && (
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 flex flex-col gap-8">
                  
                  {/* Title & Core Metrics */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-[20px] font-[700] text-ink">{selectedOpp.name}</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col border border-hairline rounded-[8px] p-3 bg-canvas-soft">
                        <span className="text-[11px] font-[600] text-ink-muted uppercase tracking-wider">Expected Revenue</span>
                        <span className="text-[18px] font-mono-numbers font-[600] text-green-600 mt-1">{selectedOpp.prediction.revenue}</span>
                      </div>
                      <div className="flex flex-col border border-hairline rounded-[8px] p-3 bg-canvas-soft">
                        <span className="text-[11px] font-[600] text-ink-muted uppercase tracking-wider">Audience</span>
                        <span className="text-[18px] font-mono-numbers font-[600] text-ink mt-1">{selectedOpp.prediction.audience}</span>
                      </div>
                      <div className="flex flex-col border border-hairline rounded-[8px] p-3 bg-canvas-soft">
                        <span className="text-[11px] font-[600] text-ink-muted uppercase tracking-wider">Confidence</span>
                        <span className="text-[18px] font-mono-numbers font-[600] text-ink mt-1">{selectedOpp.prediction.confidence}</span>
                      </div>
                      <div className="flex flex-col border border-hairline rounded-[8px] p-3 bg-canvas-soft">
                        <span className="text-[11px] font-[600] text-ink-muted uppercase tracking-wider">Best Channel</span>
                        <span className="text-[18px] font-[600] text-ink mt-1">{selectedOpp.prediction.bestChannel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="h-px w-full bg-hairline" />

                  {/* Why This Recommendation */}
                  <div className="flex flex-col gap-3">
                    <h4 className="text-[12px] font-[600] text-ink uppercase tracking-wider">Why This Recommendation</h4>
                    <ul className="flex flex-col gap-2.5">
                      {selectedOpp.evidence.map((item, i) => (
                        <li key={i} className="text-[14px] text-ink-muted flex items-start gap-3 leading-snug">
                          <span className="mt-1.5 flex-shrink-0 text-ink-muted w-1.5 h-1.5 rounded-full bg-ink-muted/50" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="h-px w-full bg-hairline" />

                  {/* Simulation */}
                  <div className="flex flex-col gap-3">
                    <h4 className="text-[12px] font-[600] text-ink uppercase tracking-wider">Simulation</h4>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-[14px] text-ink-muted">WhatsApp</span>
                        <span className="text-[14px] font-mono-numbers font-[600] text-ink">{selectedOpp.simulation.whatsapp}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-[14px] text-ink-muted">Email</span>
                        <span className="text-[14px] font-mono-numbers font-[600] text-ink">{selectedOpp.simulation.email}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-[14px] text-ink-muted">SMS</span>
                        <span className="text-[14px] font-mono-numbers font-[600] text-ink">{selectedOpp.simulation.sms}</span>
                      </div>
                    </div>
                  </div>

                  <div className="h-px w-full bg-hairline" />

                  {/* Provenance */}
                  <div className="flex flex-col gap-3">
                    <h4 className="text-[12px] font-[600] text-ink uppercase tracking-wider">Recommendation Provenance</h4>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-[600] text-ink-muted uppercase tracking-wider mb-0.5">Historical Campaign:</span>
                        <span className="text-[14px] font-[600] text-ink">{selectedOpp.historical.campaign}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-[600] text-ink-muted uppercase tracking-wider mb-0.5">Historical Revenue:</span>
                        <span className="text-[14px] font-[600] text-ink">{selectedOpp.historical.revenue}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-[600] text-ink-muted uppercase tracking-wider mb-0.5">Historical Conversion:</span>
                        <span className="text-[14px] font-[600] text-ink">{selectedOpp.historical.conversion}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-[600] text-ink-muted uppercase tracking-wider mb-0.5">Source Data:</span>
                        <span className="text-[14px] font-[500] text-ink">{selectedOpp.historical.source}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Drawer Footer Actions */}
            <div className="p-6 border-t border-hairline bg-white flex gap-3">
              <button 
                onClick={() => setSelectedOppId(null)}
                className="btn-secondary flex-1 flex justify-center py-2.5 rounded-[8px]"
              >
                Cancel
              </button>
              <button 
                onClick={() => selectedOpp && handleGenerateCampaign(selectedOpp)}
                disabled={isGenerating}
                className="btn-primary flex-[2] py-2.5 rounded-[8px] flex justify-center items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                      <line x1="12" y1="2" x2="12" y2="6"></line>
                      <line x1="12" y1="18" x2="12" y2="22"></line>
                      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                      <line x1="2" y1="12" x2="6" y2="12"></line>
                      <line x1="18" y1="12" x2="22" y2="12"></line>
                      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    Generate Campaign <ArrowRight width={16} height={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
