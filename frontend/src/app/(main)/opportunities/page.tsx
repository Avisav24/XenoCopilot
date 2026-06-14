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

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F9FAFB] text-slate-900 pb-24 relative overflow-hidden">
      
      {/* HEADER */}
      <div className="px-8 pt-8 pb-6 border-b border-[#E5E7EB] bg-[#FFFFFF]">
        <h1 className="text-[20px] font-semibold text-slate-900 tracking-tight">Growth Opportunities</h1>
        <p className="text-[14px] text-slate-500 mt-1">
          Analytical recommendations for pipeline expansion and revenue recovery.
        </p>
      </div>

      {/* KPI STRIP */}
      <div className="border-b border-[#E5E7EB] flex h-[64px] divide-x divide-[#E5E7EB] bg-[#FFFFFF]">
        <div className="flex-1 px-8 flex items-center justify-between">
          <span className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">Pipeline Impact</span>
          <span className="text-[16px] font-medium text-slate-900">{pipelineImpact}</span>
        </div>
        <div className="flex-1 px-8 flex items-center justify-between">
          <span className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">At Risk Revenue</span>
          <span className="text-[16px] font-medium text-slate-900">₹2.1L</span>
        </div>
        <div className="flex-1 px-8 flex items-center justify-between">
          <span className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">Recoverable Customers</span>
          <span className="text-[16px] font-medium text-slate-900">1,668</span>
        </div>
        <div className="flex-1 px-8 flex items-center justify-between">
          <span className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">Active Opportunities</span>
          <span className="text-[16px] font-medium text-slate-900">{activeCount}</span>
        </div>
      </div>

      <div className="flex flex-1 items-start px-8 py-8 w-full max-w-[1400px] mx-auto">
        {isLoading ? (
          <div className="w-full flex items-center justify-center p-12">
            <div className="flex flex-col items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin text-slate-400">
                <line x1="12" y1="2" x2="12" y2="6"></line>
                <line x1="12" y1="18" x2="12" y2="22"></line>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                <line x1="2" y1="12" x2="6" y2="12"></line>
                <line x1="18" y1="12" x2="22" y2="12"></line>
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
              </svg>
              <span className="text-slate-500 font-medium">Generating Live Opportunities...</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-4">
            <div className="border border-[#E5E7EB] bg-[#FFFFFF] rounded-[12px] shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  <th className="py-3 px-5 text-[12px] font-medium text-slate-500 uppercase tracking-wider">Opportunity</th>
                  <th className="py-3 px-5 text-[12px] font-medium text-slate-500 uppercase tracking-wider">Revenue Impact</th>
                  <th className="py-3 px-5 text-[12px] font-medium text-slate-500 uppercase tracking-wider">Audience</th>
                  <th className="py-3 px-5 text-[12px] font-medium text-slate-500 uppercase tracking-wider">Channel</th>
                  <th className="py-3 px-5 text-[12px] font-medium text-slate-500 uppercase tracking-wider">Confidence</th>
                  <th className="py-3 px-5 text-[12px] font-medium text-slate-500 uppercase tracking-wider">Priority</th>
                  <th className="py-3 px-5 text-[12px] font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-5 text-[12px] font-medium text-slate-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {opportunities.map((opp) => {
                  return (
                    <tr 
                      key={opp.id} 
                      className={clsx(
                        "transition-colors group",
                        selectedOppId === opp.id ? "bg-[#F3F4F6]" : "hover:bg-[#F9FAFB]"
                      )}
                    >
                      <td className="py-4 px-5">
                        <span className="text-[14px] font-medium text-slate-900">{opp.name}</span>
                        <div className="text-[12px] text-slate-500 mt-0.5">Last updated {opp.lastUpdated}</div>
                      </td>
                      <td className="py-4 px-5">
                        <span className="text-[14px] font-medium text-slate-900">{opp.revenue}</span>
                        <div className="text-[12px] text-slate-500 mt-0.5">Expected Lift {opp.expectedLift}</div>
                      </td>
                      <td className="py-4 px-5 text-[14px] text-slate-700">{opp.audience.toLocaleString()}</td>
                      <td className="py-4 px-5 text-[14px] text-slate-700">{opp.channel}</td>
                      <td className="py-4 px-5">
                        <span className="text-[14px] text-slate-700">{opp.confidence}</span>
                        <div className="text-[12px] text-slate-500 mt-0.5">Based on {opp.confidenceBasis}</div>
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-700">
                          <span className={clsx("w-2 h-2 rounded-full", opp.priority === 'Critical' ? "bg-red-500" : "bg-amber-500")} />
                          {opp.priority}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <span className="px-2.5 py-1 rounded-[6px] text-[12px] font-medium bg-[#F3F4F6] text-slate-700">
                          {opp.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button 
                          onClick={() => setSelectedOppId(opp.id)}
                          className="text-slate-600 hover:text-slate-900 text-[13px] font-medium transition-colors flex items-center justify-end w-full gap-1"
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
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" 
            onClick={() => setSelectedOppId(null)}
          />
          <div className="relative w-[420px] h-full bg-[#FFFFFF] shadow-2xl border-l border-[#E5E7EB] flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-[#E5E7EB] flex justify-between items-center bg-[#F9FAFB]">
              <h2 className="text-[16px] font-semibold text-slate-900">Review Recommendation</h2>
              <button 
                onClick={() => setSelectedOppId(null)}
                className="text-slate-400 hover:text-slate-700 transition-colors p-1"
              >
                <Xmark width={20} height={20} />
              </button>
            </div>

            {selectedOpp && (
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 flex flex-col gap-8">
                  
                  {/* Title & Core Metrics */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-[20px] font-medium text-slate-900">{selectedOpp.name}</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col border border-[#E5E7EB] rounded-[8px] p-3 bg-[#F9FAFB]">
                        <span className="text-[12px] font-medium text-slate-500 uppercase">Expected Revenue</span>
                        <span className="text-[18px] font-medium text-slate-900 mt-1">{selectedOpp.prediction.revenue}</span>
                      </div>
                      <div className="flex flex-col border border-[#E5E7EB] rounded-[8px] p-3 bg-[#F9FAFB]">
                        <span className="text-[12px] font-medium text-slate-500 uppercase">Audience</span>
                        <span className="text-[18px] font-medium text-slate-900 mt-1">{selectedOpp.prediction.audience}</span>
                      </div>
                      <div className="flex flex-col border border-[#E5E7EB] rounded-[8px] p-3 bg-[#F9FAFB]">
                        <span className="text-[12px] font-medium text-slate-500 uppercase">Confidence</span>
                        <span className="text-[18px] font-medium text-slate-900 mt-1">{selectedOpp.prediction.confidence}</span>
                      </div>
                      <div className="flex flex-col border border-[#E5E7EB] rounded-[8px] p-3 bg-[#F9FAFB]">
                        <span className="text-[12px] font-medium text-slate-500 uppercase">Best Channel</span>
                        <span className="text-[18px] font-medium text-slate-900 mt-1">{selectedOpp.prediction.bestChannel}</span>
                      </div>
                    </div>
                  </div>

                  <hr className="border-[#E5E7EB]" />

                  {/* Why This Recommendation */}
                  <div className="flex flex-col gap-3">
                    <h4 className="text-[13px] font-medium text-slate-500 uppercase tracking-wider">Why This Recommendation</h4>
                    <ul className="flex flex-col gap-2.5">
                      {selectedOpp.evidence.map((item, i) => (
                        <li key={i} className="text-[14px] text-slate-700 flex items-start gap-3 leading-snug">
                          <span className="mt-1 flex-shrink-0 text-slate-400 w-1.5 h-1.5 rounded-full bg-slate-300" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <hr className="border-[#E5E7EB]" />

                  {/* Simulation */}
                  <div className="flex flex-col gap-3">
                    <h4 className="text-[13px] font-medium text-slate-500 uppercase tracking-wider">Simulation</h4>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-[14px] text-slate-600">WhatsApp</span>
                        <span className="text-[14px] font-medium text-slate-900">{selectedOpp.simulation.whatsapp}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-[14px] text-slate-600">Email</span>
                        <span className="text-[14px] font-medium text-slate-900">{selectedOpp.simulation.email}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-[14px] text-slate-600">SMS</span>
                        <span className="text-[14px] font-medium text-slate-900">{selectedOpp.simulation.sms}</span>
                      </div>
                    </div>
                  </div>

                  <hr className="border-[#E5E7EB]" />

                  {/* Provenance */}
                  <div className="flex flex-col gap-3">
                    <h4 className="text-[13px] font-medium text-slate-500 uppercase tracking-wider">Recommendation Provenance</h4>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col">
                        <span className="text-[12px] text-slate-500 mb-0.5">Historical Campaign:</span>
                        <span className="text-[14px] font-medium text-slate-900">{selectedOpp.historical.campaign}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[12px] text-slate-500 mb-0.5">Historical Revenue:</span>
                        <span className="text-[14px] font-medium text-slate-900">{selectedOpp.historical.revenue}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[12px] text-slate-500 mb-0.5">Historical Conversion:</span>
                        <span className="text-[14px] font-medium text-slate-900">{selectedOpp.historical.conversion}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[12px] text-slate-500 mb-0.5">Source Data:</span>
                        <span className="text-[14px] text-slate-700">{selectedOpp.historical.source}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Drawer Footer Actions */}
            <div className="p-6 border-t border-[#E5E7EB] bg-[#FFFFFF] flex gap-3">
              <button 
                onClick={() => setSelectedOppId(null)}
                className="flex-1 py-2.5 rounded-[8px] text-[14px] font-medium text-slate-700 bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => selectedOpp && handleGenerateCampaign(selectedOpp)}
                disabled={isGenerating}
                className="flex-[2] py-2.5 rounded-[8px] text-[14px] font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors flex justify-center items-center gap-2"
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
