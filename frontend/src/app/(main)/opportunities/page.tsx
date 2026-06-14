'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Xmark, ArrowRight, Activity, DatabaseScript, Spark, Check, Clock } from 'iconoir-react';
import { clsx } from 'clsx';
import { setCampaignContext } from '@/lib/campaignContext';

// Mock Data Source
const MOCK_OPPORTUNITIES = [
  {
    id: '1',
    name: 'Cart Abandonment Recovery',
    audience: 1240,
    revenue: '₹2.10L',
    expectedLift: '+12.1%',
    channel: 'WhatsApp',
    priority: 'Critical',
    confidence: '92%',
    confidenceBasis: '34 similar campaigns',
    status: 'Active',
    lastUpdated: '1 hour ago',
    type: 'growth_opportunity',
    evidence: [
      '1,240 high-intent carts abandoned this week',
      'Immediate action required to prevent churn',
      'Historical 12% recovery via WhatsApp'
    ],
    historical: { campaign: 'CMP-110', revenue: '₹1.8L', conversion: '12.4%', source: 'Checkout Events' },
    prediction: { revenue: '₹2.10L', audience: '1,240 Customers', confidence: '92%', bestChannel: 'WhatsApp' },
    simulation: { whatsapp: '₹2.10L', email: '₹1.4L', sms: '₹1.9L' }
  },
  {
    id: '2',
    name: 'Dormant VIP Win-Back',
    audience: 428,
    revenue: '₹2.12L',
    expectedLift: '+8.4%',
    channel: 'Email',
    priority: 'Critical',
    confidence: '88%',
    confidenceBasis: '12 similar campaigns',
    status: 'Draft',
    lastUpdated: '2 hours ago',
    type: 'growth_opportunity',
    evidence: [
      '428 VIP customers inactive for 90+ days',
      'High risk of losing high LTV segment'
    ],
    historical: { campaign: 'CMP-104', revenue: '₹1.4L', conversion: '8.2%', source: 'Orders, Campaigns' },
    prediction: { revenue: '₹2.12L', audience: '428 Customers', confidence: '88%', bestChannel: 'Email' },
    simulation: { whatsapp: '₹1.8L', email: '₹2.12L', sms: '₹82K' }
  },
  {
    id: '3',
    name: 'Cross-Sell: Winter Accessories',
    audience: 820,
    revenue: '₹1.15L',
    expectedLift: '+5.2%',
    channel: 'SMS',
    priority: 'Medium',
    confidence: '79%',
    confidenceBasis: '8 similar campaigns',
    status: 'Draft',
    lastUpdated: '5 hours ago',
    type: 'growth_opportunity',
    evidence: [
      '820 customers bought Winter Jackets',
      '62% correlation with accessory purchase'
    ],
    historical: { campaign: 'CMP-092', revenue: '₹68K', conversion: '4.5%', source: 'Catalog' },
    prediction: { revenue: '₹1.15L', audience: '820 Customers', confidence: '79%', bestChannel: 'SMS' },
    simulation: { whatsapp: '₹95K', email: '₹1.1L', sms: '₹1.15L' }
  },
  {
    id: '4',
    name: 'Subscription Auto-Renewal Reminder',
    audience: 350,
    revenue: '₹4.50L',
    expectedLift: '+15.0%',
    channel: 'Email',
    priority: 'Critical',
    confidence: '95%',
    confidenceBasis: 'Automated workflow data',
    status: 'Active',
    lastUpdated: '10 mins ago',
    type: 'growth_opportunity',
    evidence: [
      '350 subscriptions expiring next week',
      'Requires immediate opt-in for continuity'
    ],
    historical: { campaign: 'CMP-SUB', revenue: '₹4.1L', conversion: '85%', source: 'Subscriptions' },
    prediction: { revenue: '₹4.50L', audience: '350 Customers', confidence: '95%', bestChannel: 'Email' },
    simulation: { whatsapp: '₹3.9L', email: '₹4.50L', sms: '₹3.2L' }
  },
  {
    id: '5',
    name: 'Flash Sale: Excess Inventory',
    audience: 2500,
    revenue: '₹3.80L',
    expectedLift: '+6.1%',
    channel: 'WhatsApp',
    priority: 'Medium',
    confidence: '82%',
    confidenceBasis: 'Previous flash sales',
    status: 'Draft',
    lastUpdated: '1 day ago',
    type: 'growth_opportunity',
    evidence: [
      'High inventory holding cost for SKU-882',
      'Targeting discount hunters'
    ],
    historical: { campaign: 'CMP-041', revenue: '₹2.8L', conversion: '5.2%', source: 'Inventory' },
    prediction: { revenue: '₹3.80L', audience: '2,500 Customers', confidence: '82%', bestChannel: 'WhatsApp' },
    simulation: { whatsapp: '₹3.80L', email: '₹2.5L', sms: '₹3.1L' }
  }
];

export default function OpportunitiesPage() {
  const router = useRouter();
  const [selectedOppId, setSelectedOppId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Keyboard shortcut to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedOppId(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleGenerateCampaign = (opp: typeof MOCK_OPPORTUNITIES[0]) => {
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
    return MOCK_OPPORTUNITIES.find(o => o.id === selectedOppId);
  }, [selectedOppId]);

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
          <span className="text-[16px] font-medium text-slate-900">₹3.27L</span>
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
          <span className="text-[16px] font-medium text-slate-900">3</span>
        </div>
      </div>

      <div className="flex flex-1 items-start px-8 py-8 w-full max-w-[1400px] mx-auto">
        {/* MAIN TABLE */}
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
                {MOCK_OPPORTUNITIES.map((opp) => {
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
                    <Activity width={16} height={16} className="animate-spin" />
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
