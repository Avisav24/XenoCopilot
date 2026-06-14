'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { NavArrowRight, NavArrowDown, InfoCircle, Spark, DatabaseScript, ArrowRight, Activity } from 'iconoir-react';
import { clsx } from 'clsx';
import { setCampaignContext } from '@/lib/campaignContext';

// Impact Calculation Logic
function calculateImpactLevel(revenue: number, confidence: number, urgency: 'High' | 'Medium' | 'Low'): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
  // Score Formula = (Revenue * 0.5) + (Confidence * 0.3) + (Urgency * 0.2)
  // Simplified deterministic tiering as per requirements:
  if (revenue > 200000 && confidence > 85 && urgency === 'High') return 'CRITICAL';
  if (revenue > 100000 && confidence > 75) return 'HIGH';
  if (revenue > 50000) return 'MEDIUM';
  return 'LOW';
}

const MOCK_OPPORTUNITIES_BASE = [
  {
    id: '1',
    name: 'Dormant VIP Recovery',
    audience: '428 Customers',
    audienceSize: 428,
    revenue: '₹2.12L',
    revenueNum: 212000,
    channel: 'WhatsApp',
    confidence: '88%',
    confidenceNum: 88,
    urgency: 'High' as const,
    status: 'READY',
    type: 'revenue_opportunity',
    evidence: [
      '428 VIP customers inactive for 60+ days',
      'Historical reorder cycle exceeded',
      'Similar campaign generated ₹1.4L',
      'WhatsApp converts 2.1x better'
    ],
    historical: {
      segment: 'VIP Dormant',
      campaign: 'CMP-104',
      revenue: '₹1.4L',
      conversion: '8.2%',
      dataConfidence: '88%'
    },
    prediction: {
      revenue: '₹2.12L',
      conversion: '9.1%',
      purchasers: 39
    },
    simulation: {
      whatsapp: '₹2.12L',
      email: '₹1.05L',
      sms: '₹82K'
    }
  },
  {
    id: '2',
    name: 'Cross-Sell Recent Buyers',
    audience: '820 Customers',
    audienceSize: 820,
    revenue: '₹1.15L',
    revenueNum: 115000,
    channel: 'Email',
    confidence: '79%',
    confidenceNum: 79,
    urgency: 'Medium' as const,
    status: 'RUNNING',
    type: 'revenue_opportunity',
    evidence: [
      '820 customers bought Core Product in last 14 days',
      'High correlation (62%) with Accessory purchase',
      'Email drives highest incremental AOV'
    ],
    historical: {
      segment: 'Recent Buyers',
      campaign: 'CMP-092',
      revenue: '₹68K',
      conversion: '4.5%',
      dataConfidence: '79%'
    },
    prediction: {
      revenue: '₹1.15L',
      conversion: '5.2%',
      purchasers: 42
    },
    simulation: {
      whatsapp: '₹95K',
      email: '₹1.15L',
      sms: '₹60K'
    }
  },
  {
    id: '3',
    name: 'Cart Recovery',
    audience: '1240 Customers',
    audienceSize: 1240,
    revenue: '₹2.1L',
    revenueNum: 210000,
    channel: 'SMS',
    confidence: '92%',
    confidenceNum: 92,
    urgency: 'High' as const,
    status: 'READY',
    type: 'at_risk',
    evidence: [
      '1,240 high-intent carts abandoned this week',
      'SMS reminder generates 3x recovery rate',
      'No discount required for 40% of this segment'
    ],
    historical: {
      segment: 'Cart Abandoners',
      campaign: 'CMP-110',
      revenue: '₹1.8L',
      conversion: '12.4%',
      dataConfidence: '92%'
    },
    prediction: {
      revenue: '₹2.1L',
      conversion: '14.1%',
      purchasers: 174
    },
    simulation: {
      whatsapp: '₹1.9L',
      email: '₹1.4L',
      sms: '₹2.1L'
    }
  }
];

const MOCK_OPPORTUNITIES = MOCK_OPPORTUNITIES_BASE.map(opp => ({
  ...opp,
  impact: calculateImpactLevel(opp.revenueNum, opp.confidenceNum, opp.urgency)
}));

const IMPACT_COLORS = {
  CRITICAL: 'bg-[#DC2626]/10 text-[#DC2626]',
  HIGH: 'bg-[#F59E0B]/10 text-[#F59E0B]',
  MEDIUM: 'bg-[#2563EB]/10 text-[#2563EB]',
  LOW: 'bg-[#6B7280]/10 text-[#6B7280]',
};

const STATUS_COLORS: Record<string, string> = {
  READY: 'bg-gray-100 text-gray-700',
  RUNNING: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
};

export default function OpportunitiesPage() {
  const router = useRouter();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set([])); // Collapsed by default
  const [filterType, setFilterType] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedRows(newSet);
  };

  const handleLaunchCampaign = (name: string, desc: string, audienceSize: number, channel: string) => {
    setCampaignContext({ audienceName: name, recommendedAction: desc, audienceSize, recommendedChannel: channel });
    router.push('/chat');
  };

  const filteredOpportunities = useMemo(() => {
    if (!filterType) return MOCK_OPPORTUNITIES;
    return MOCK_OPPORTUNITIES.filter(o => o.type === filterType);
  }, [filterType]);

  const topOpportunity = useMemo(() => {
    // Top opportunity is the first CRITICAL, else HIGH, etc.
    return MOCK_OPPORTUNITIES.find(o => o.impact === 'CRITICAL') || MOCK_OPPORTUNITIES[0];
  }, []);

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 pb-24 text-slate-900">
      
      {/* HEADER */}
      <div className="px-8 pt-8 pb-6 border-b border-gray-200 bg-white">
        <h1 className="text-[22px] font-bold tracking-tight">Revenue Opportunities</h1>
        <p className="text-[13px] text-slate-500 mt-1">
          Deterministically evaluated business impact based on predictive modeling.
        </p>
      </div>

      {/* KPI STRIP - Interactive */}
      <div className="border-b border-gray-200 flex h-[90px] divide-x divide-gray-200 bg-white">
        <button 
          onClick={() => setFilterType(filterType === 'revenue_opportunity' ? null : 'revenue_opportunity')}
          className={clsx(
            "flex-1 px-8 py-4 flex flex-col justify-center text-left transition-colors relative hover:bg-slate-50",
            filterType === 'revenue_opportunity' ? "bg-slate-50" : ""
          )}
        >
          {filterType === 'revenue_opportunity' && <div className="absolute top-0 left-0 w-full h-1 bg-slate-800" />}
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Revenue Opportunity</span>
          <span className="text-[22px] font-bold text-slate-900 font-mono tracking-tight mt-0.5">₹3.27L</span>
        </button>
        <button 
          onClick={() => setFilterType(filterType === 'at_risk' ? null : 'at_risk')}
          className={clsx(
            "flex-1 px-8 py-4 flex flex-col justify-center text-left transition-colors relative hover:bg-slate-50",
            filterType === 'at_risk' ? "bg-slate-50" : ""
          )}
        >
          {filterType === 'at_risk' && <div className="absolute top-0 left-0 w-full h-1 bg-slate-800" />}
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">At Risk Revenue</span>
          <span className="text-[22px] font-bold text-slate-900 font-mono tracking-tight mt-0.5">₹2.1L</span>
        </button>
        <div className="flex-1 px-8 py-4 flex flex-col justify-center bg-white cursor-default">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Recoverable Customers</span>
          <span className="text-[22px] font-bold text-slate-900 font-mono tracking-tight mt-0.5">1,668</span>
        </div>
        <div className="flex-1 px-8 py-4 flex flex-col justify-center bg-white cursor-default">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Evaluated Channels</span>
          <span className="text-[22px] font-bold text-slate-900 font-mono tracking-tight mt-0.5">3</span>
        </div>
      </div>

      <div className="flex flex-1 items-start px-8 py-8 gap-8 max-w-[1600px] mx-auto w-full">
        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-[14px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Activity width={16} height={16} /> Prioritized Execution Backlog
            </h2>
            {filterType && (
              <button 
                onClick={() => setFilterType(null)}
                className="text-[12px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm"
              >
                Clear Filter
              </button>
            )}
          </div>

          <div className="border border-gray-200 rounded-[8px] overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100 border-b border-gray-200">
                <tr>
                  <th className="w-8"></th>
                  <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Opportunity</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Impact</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Audience</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Expected Revenue</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Best Channel</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Confidence</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredOpportunities.map((opp) => {
                  const isExpanded = expandedRows.has(opp.id);
                  return (
                    <React.Fragment key={opp.id}>
                      <tr className={clsx("hover:bg-slate-50/50 transition-colors group", isExpanded ? "bg-slate-50/50" : "")}>
                        <td className="pl-4 py-4 w-8 cursor-pointer" onClick={() => toggleRow(opp.id)}>
                          <div className="text-slate-400 hover:text-slate-800 transition-colors">
                            {isExpanded ? <NavArrowDown height={16} width={16} /> : <NavArrowRight height={16} width={16} />}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-[14px] font-bold text-slate-900">{opp.name}</td>
                        <td className="py-4 px-4">
                          <span className={clsx("px-2.5 py-1 rounded-[4px] text-[10px] font-bold uppercase tracking-wider border border-transparent", IMPACT_COLORS[opp.impact])}>
                            {opp.impact}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-[13px] text-slate-600 font-medium">{opp.audience}</td>
                        <td className="py-4 px-4 text-[14px] font-mono font-bold text-slate-900">{opp.revenue}</td>
                        <td className="py-4 px-4 text-[13px] text-slate-600 font-medium">{opp.channel}</td>
                        <td className="py-4 px-4 text-[13px] text-slate-600 font-mono font-semibold">{opp.confidence}</td>
                        <td className="py-4 px-4">
                          <span className={clsx("px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider", STATUS_COLORS[opp.status])}>
                            {opp.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button 
                            onClick={() => handleLaunchCampaign(opp.name, `Target ${opp.name}`, opp.audienceSize, opp.channel)}
                            className="bg-white border border-gray-300 hover:border-gray-400 hover:bg-slate-100 text-slate-800 px-4 py-2 rounded-[6px] text-[12px] font-bold transition-all shadow-sm flex items-center gap-1.5 ml-auto opacity-0 group-hover:opacity-100 focus:opacity-100"
                          >
                            Review <ArrowRight width={14} height={14} />
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-50 border-t border-gray-100">
                          <td colSpan={9} className="p-0">
                            <div className="px-12 py-8 grid grid-cols-4 gap-8">
                              
                              {/* 1. Why This Recommendation? */}
                              <div className="flex flex-col gap-3 col-span-1 border-r border-gray-200 pr-6">
                                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                  <InfoCircle width={14} height={14} /> Why This Recommendation?
                                </h4>
                                <ul className="flex flex-col gap-2.5">
                                  {opp.evidence.map((item, i) => (
                                    <li key={i} className="text-[13px] text-slate-700 flex items-start gap-2 leading-tight">
                                      <span className="text-slate-400 font-bold mt-0.5">-</span>
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* 2. Recommendation Provenance */}
                              <div className="flex flex-col gap-3 col-span-1 border-r border-gray-200 pr-6">
                                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                  <DatabaseScript width={14} height={14} /> Recommendation Provenance
                                </h4>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                                  <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 uppercase">Customer Segment</span>
                                    <span className="text-[13px] font-semibold text-slate-900">{opp.historical.segment}</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 uppercase">Historical Campaign</span>
                                    <span className="text-[13px] font-semibold text-slate-900">{opp.historical.campaign}</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 uppercase">Historical Revenue</span>
                                    <span className="text-[13px] font-mono font-semibold text-slate-900">{opp.historical.revenue}</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 uppercase">Historical Conv.</span>
                                    <span className="text-[13px] font-mono font-semibold text-slate-900">{opp.historical.conversion}</span>
                                  </div>
                                  <div className="flex flex-col col-span-2">
                                    <span className="text-[10px] text-slate-500 uppercase">Data Confidence</span>
                                    <span className="text-[13px] font-mono font-semibold text-slate-900">{opp.historical.dataConfidence}</span>
                                  </div>
                                </div>
                              </div>

                              {/* 3. Predicted Outcome */}
                              <div className="flex flex-col gap-3 col-span-1 border-r border-gray-200 pr-6">
                                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                  <Spark width={14} height={14} /> Predicted Outcome
                                </h4>
                                <div className="flex flex-col gap-3">
                                  <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 uppercase">Expected Revenue</span>
                                    <span className="text-[16px] font-mono font-bold text-slate-900">{opp.prediction.revenue}</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 uppercase">Expected Conversion</span>
                                    <span className="text-[16px] font-mono font-bold text-slate-900">{opp.prediction.conversion}</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 uppercase">Expected Purchasers</span>
                                    <span className="text-[16px] font-mono font-bold text-slate-900">{opp.prediction.purchasers}</span>
                                  </div>
                                </div>
                              </div>

                              {/* 4. Simulation */}
                              <div className="flex flex-col gap-3 col-span-1">
                                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Simulation (Revenue)</h4>
                                <div className="flex flex-col gap-2.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[13px] text-slate-600 font-medium">WhatsApp</span>
                                    <span className="text-[13px] font-mono font-semibold text-slate-900">{opp.simulation.whatsapp}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[13px] text-slate-600 font-medium">Email</span>
                                    <span className="text-[13px] font-mono font-semibold text-slate-900">{opp.simulation.email}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[13px] text-slate-600 font-medium">SMS</span>
                                    <span className="text-[13px] font-mono font-semibold text-slate-900">{opp.simulation.sms}</span>
                                  </div>
                                </div>
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT SIDEBAR - Top Opportunity Focus */}
        <div className="w-[340px] flex flex-col gap-4 flex-shrink-0">
          <h3 className="text-[14px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            Top Opportunity
          </h3>
          <div className="bg-white border border-gray-200 rounded-[12px] p-6 shadow-md flex flex-col gap-5 border-t-4 border-t-slate-900">
            <h4 className="text-[18px] font-bold text-slate-900 leading-tight">{topOpportunity.name}</h4>
            
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <span className="text-[12px] text-slate-500 font-semibold uppercase">Expected Revenue</span>
                <span className="text-[18px] font-mono font-bold text-slate-900">{topOpportunity.revenue}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <span className="text-[12px] text-slate-500 font-semibold uppercase">Expected Purchasers</span>
                <span className="text-[18px] font-mono font-bold text-slate-900">{topOpportunity.prediction.purchasers}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <span className="text-[12px] text-slate-500 font-semibold uppercase">Confidence</span>
                <span className="text-[16px] font-mono font-semibold text-slate-900">{topOpportunity.confidence}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-slate-500 font-semibold uppercase">Recommended Channel</span>
                <span className="text-[14px] font-bold text-slate-900">{topOpportunity.channel}</span>
              </div>
            </div>

            <button 
              onClick={() => handleLaunchCampaign(topOpportunity.name, `Target ${topOpportunity.name}`, topOpportunity.audienceSize, topOpportunity.channel)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-[8px] text-[14px] font-bold transition-all shadow-sm mt-2 flex items-center justify-center gap-2"
            >
              Launch Campaign <ArrowRight width={16} height={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
