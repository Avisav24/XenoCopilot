'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FastArrowRight, Spark, NavArrowRight, NavArrowDown } from 'iconoir-react';
import { clsx } from 'clsx';
import { setCampaignContext } from '@/lib/campaignContext';

const MOCK_OPPORTUNITIES = [
  {
    id: '1',
    priority: 1,
    name: 'Dormant VIP Recovery',
    audience: '428 Customers',
    audienceSize: 428,
    revenue: '₹1.72L',
    channel: 'WhatsApp',
    confidence: '84%',
    status: 'Ready',
    evidence: [
      '428 VIP customers inactive for 60+ days',
      'Historical reorder cycle exceeded',
      'Similar campaign generated ₹1.4L'
    ],
    historical: {
      revenue: '₹1.4L',
      conversion: '8.2%'
    },
    prediction: {
      revenue: '₹1.72L',
      conversion: '9.1%'
    }
  },
  {
    id: '2',
    priority: 2,
    name: 'Cross-Sell Recent Buyers',
    audience: '820 Customers',
    audienceSize: 820,
    revenue: '₹94K',
    channel: 'Email',
    confidence: '79%',
    status: 'Ready',
    evidence: [
      '820 customers bought Core Product in last 14 days',
      'High correlation (62%) with Accessory purchase',
      'Email drives highest incremental AOV'
    ],
    historical: {
      revenue: '₹68K',
      conversion: '4.5%'
    },
    prediction: {
      revenue: '₹94K',
      conversion: '5.2%'
    }
  },
  {
    id: '3',
    priority: 3,
    name: 'Cart Recovery',
    audience: '1240 Customers',
    audienceSize: 1240,
    revenue: '₹2.1L',
    channel: 'SMS',
    confidence: '87%',
    status: 'Ready',
    evidence: [
      '1,240 high-intent carts abandoned this week',
      'SMS reminder generates 3x recovery rate',
      'No discount required for 40% of this segment'
    ],
    historical: {
      revenue: '₹1.8L',
      conversion: '12.4%'
    },
    prediction: {
      revenue: '₹2.1L',
      conversion: '14.1%'
    }
  }
];

export default function OpportunitiesPage() {
  const router = useRouter();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set(['1']));

  const toggleRow = (id: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedRows(newSet);
  };

  const handleLaunchCampaign = (name: string, desc: string, audienceSize: number, channel: string) => {
    setCampaignContext({ audienceName: name, recommendedAction: desc, audienceSize, recommendedChannel: channel });
    router.push('/chat');
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-white pb-24 text-slate-900">
      
      {/* HEADER */}
      <div className="px-8 pt-8 pb-6 border-b border-gray-200">
        <h1 className="text-[22px] font-bold tracking-tight">Revenue Opportunities</h1>
        <p className="text-[13px] text-slate-500 mt-1">
          AI-ranked customer opportunities based on purchase behavior and campaign performance.
        </p>
      </div>

      {/* KPI STRIP */}
      <div className="border-b border-gray-200 flex h-[80px] divide-x divide-gray-200">
        <div className="flex-1 px-8 py-4 flex flex-col justify-center">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Revenue Opportunity</span>
          <span className="text-[20px] font-bold text-emerald-600 font-mono tracking-tight mt-0.5">₹4.8L</span>
        </div>
        <div className="flex-1 px-8 py-4 flex flex-col justify-center">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">At Risk Revenue</span>
          <span className="text-[20px] font-bold text-red-600 font-mono tracking-tight mt-0.5">₹2.1L</span>
        </div>
        <div className="flex-1 px-8 py-4 flex flex-col justify-center">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Recoverable Customers</span>
          <span className="text-[20px] font-bold text-slate-900 font-mono tracking-tight mt-0.5">428</span>
        </div>
        <div className="flex-1 px-8 py-4 flex flex-col justify-center">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Recommended Campaigns</span>
          <span className="text-[20px] font-bold text-slate-900 font-mono tracking-tight mt-0.5">3</span>
        </div>
      </div>

      <div className="flex flex-1 items-start">
        {/* MAIN CONTENT */}
        <div className="flex-1 p-8 border-r border-gray-200 min-h-[calc(100vh-170px)]">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-[14px] font-bold uppercase tracking-wider text-slate-700">Recommended Revenue Actions</h2>
          </div>

          <div className="border border-gray-200 rounded-[8px] overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-gray-200">
                <tr>
                  <th className="w-8"></th>
                  <th className="py-2.5 px-3 text-[12px] font-semibold text-slate-500">Priority</th>
                  <th className="py-2.5 px-3 text-[12px] font-semibold text-slate-500">Opportunity</th>
                  <th className="py-2.5 px-3 text-[12px] font-semibold text-slate-500">Audience</th>
                  <th className="py-2.5 px-3 text-[12px] font-semibold text-slate-500 text-right">Revenue Impact</th>
                  <th className="py-2.5 px-3 text-[12px] font-semibold text-slate-500">Channel</th>
                  <th className="py-2.5 px-3 text-[12px] font-semibold text-slate-500">Confidence</th>
                  <th className="py-2.5 px-3 text-[12px] font-semibold text-slate-500">Status</th>
                  <th className="py-2.5 px-3 text-[12px] font-semibold text-slate-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {MOCK_OPPORTUNITIES.map((opp) => {
                  const isExpanded = expandedRows.has(opp.id);
                  return (
                    <React.Fragment key={opp.id}>
                      <tr className={clsx("hover:bg-slate-50 transition-colors group", isExpanded ? "bg-slate-50" : "")}>
                        <td className="pl-3 py-3 w-8 cursor-pointer" onClick={() => toggleRow(opp.id)}>
                          <div className="text-slate-400 hover:text-slate-700 transition-colors">
                            {isExpanded ? <NavArrowDown height={16} width={16} /> : <NavArrowRight height={16} width={16} />}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-[13px] font-medium text-slate-500">{opp.priority}</td>
                        <td className="py-3 px-3 text-[13px] font-semibold text-slate-900">{opp.name}</td>
                        <td className="py-3 px-3 text-[13px] text-slate-600">{opp.audience}</td>
                        <td className="py-3 px-3 text-[13px] font-mono font-semibold text-emerald-600 text-right">{opp.revenue}</td>
                        <td className="py-3 px-3 text-[13px] text-slate-600">{opp.channel}</td>
                        <td className="py-3 px-3 text-[13px] text-slate-600 font-mono">{opp.confidence}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">{opp.status}</span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button 
                            onClick={() => handleLaunchCampaign(opp.name, "Target recommended opportunity", opp.audienceSize, opp.channel)}
                            className="bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-slate-800 px-3 py-1.5 rounded-[6px] text-[12px] font-bold transition-all shadow-sm flex items-center gap-1.5 ml-auto opacity-0 group-hover:opacity-100 focus:opacity-100"
                          >
                            Generate Campaign
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-50 border-t-0">
                          <td colSpan={9} className="p-0">
                            <div className="px-12 py-6 border-b border-gray-100 flex gap-12">
                              {/* Evidence */}
                              <div className="flex-1">
                                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Evidence</h4>
                                <ul className="flex flex-col gap-2">
                                  {opp.evidence.map((item, i) => (
                                    <li key={i} className="text-[13px] text-slate-700 flex items-start gap-2 leading-tight">
                                      <span className="text-slate-400 mt-0.5">•</span>
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Historical */}
                              <div className="w-[180px]">
                                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Historical Results</h4>
                                <div className="flex flex-col gap-3">
                                  <div>
                                    <div className="text-[11px] text-slate-500 font-medium">Revenue:</div>
                                    <div className="text-[13px] font-mono font-semibold text-slate-900">{opp.historical.revenue}</div>
                                  </div>
                                  <div>
                                    <div className="text-[11px] text-slate-500 font-medium">Conversion:</div>
                                    <div className="text-[13px] font-mono font-semibold text-slate-900">{opp.historical.conversion}</div>
                                  </div>
                                </div>
                              </div>

                              {/* Prediction */}
                              <div className="w-[180px]">
                                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                                  <Spark height={12} width={12} className="text-purple-600" />
                                  Prediction
                                </h4>
                                <div className="flex flex-col gap-3">
                                  <div>
                                    <div className="text-[11px] text-slate-500 font-medium">Expected Revenue:</div>
                                    <div className="text-[13px] font-mono font-semibold text-emerald-600">{opp.prediction.revenue}</div>
                                  </div>
                                  <div>
                                    <div className="text-[11px] text-slate-500 font-medium">Expected Conversion:</div>
                                    <div className="text-[13px] font-mono font-semibold text-emerald-600">{opp.prediction.conversion}</div>
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

        {/* RIGHT SIDEBAR */}
        <div className="w-[320px] bg-slate-50 border-l border-gray-200 min-h-[calc(100vh-170px)] p-6 flex flex-col gap-8 flex-shrink-0">
          
          {/* Section 1 */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Highest Priority Opportunity</h3>
            <div className="bg-white border border-gray-200 rounded-[8px] p-4 shadow-sm flex flex-col gap-4">
              <h4 className="text-[14px] font-bold text-slate-900">Dormant VIP Recovery</h4>
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[11px] text-slate-500 font-medium">Revenue Impact</span>
                  <span className="text-[14px] font-mono font-bold text-emerald-600">₹1.72L</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[11px] text-slate-500 font-medium">Audience</span>
                  <span className="text-[14px] font-mono font-bold text-slate-900">428</span>
                </div>
              </div>
              <button 
                onClick={() => handleLaunchCampaign("Dormant VIP Recovery", "Target VIPs inactive for 60+ days", 428, "WhatsApp")}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-[6px] text-[13px] font-bold transition-all shadow-sm mt-1"
              >
                Generate Campaign
              </button>
            </div>
          </div>

          <div className="w-full h-[1px] bg-gray-200" />

          {/* Section 2 */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Spark height={12} width={12} className="text-purple-600" />
              Recent Campaign Learnings
            </h3>
            <ul className="flex flex-col gap-3">
              <li className="text-[13px] text-slate-700 leading-tight">
                <span className="font-semibold text-slate-900">WhatsApp</span> converts 2.1x higher for dormant customers
              </li>
              <li className="text-[13px] text-slate-700 leading-tight">
                <span className="font-semibold text-slate-900">8 PM</span> produced highest conversion rate
              </li>
              <li className="text-[13px] text-slate-700 leading-tight">
                <span className="font-semibold text-slate-900">15% discount</span> generated best profit margin
              </li>
            </ul>
          </div>

          <div className="w-full h-[1px] bg-gray-200" />

          {/* Section 3 */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Campaign Accuracy</h3>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-slate-600">Prediction Accuracy</span>
                <span className="text-[13px] font-mono font-bold text-slate-900">94.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-slate-600">Revenue Accuracy</span>
                <span className="text-[13px] font-mono font-bold text-emerald-600">92.1%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-slate-600">Conversion Accuracy</span>
                <span className="text-[13px] font-mono font-bold text-slate-900">89.4%</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
