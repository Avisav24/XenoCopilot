'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCampaigns } from '@/lib/api';
import { clsx } from 'clsx';
import Link from 'next/link';
import { Megaphone, Activity, GraphUp, ArrowUpRight, ViewGrid, Calendar } from 'iconoir-react';

export default function EngagementListPage() {
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: getCampaigns,
  });

  const [activeTab, setActiveTab] = useState('List');

  const totalCampaigns = campaigns?.length || 0;
  const activeCampaigns = campaigns?.filter((c: any) => c.status === 'active').length || 0;
  const totalRevenue = campaigns?.reduce((acc: number, c: any) => acc + (Math.round((c.name.length * 1200) + 5000)), 0) || 0;

  // Mock Calendar Events for June 2026
  const calendarDays = Array.from({ length: 30 }, (_, i) => i + 1);
  const getEventsForDay = (day: number) => {
    if (day === 4) return [{ title: 'Summer Sale Kickoff', type: 'completed' }];
    if (day === 9) return [{ title: 'VIP Loyalty Campaign', type: 'completed' }];
    if (day === 18) return [{ title: 'New Arrivals Campaign', type: 'scheduled' }]; // Assume current day
    if (day === 22) return [{ title: 'Cart Abandonment Sweep', type: 'opportunity' }];
    if (day === 25) return [{ title: 'Beauty Loyalists Flow', type: 'recommended' }];
    if (day === 28) return [{ title: 'End of Month Push', type: 'scheduled' }];
    return [];
  };

  return (
    <div className="flex flex-col gap-8 w-full pb-24 max-w-[1400px]">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-bold text-slate-900 leading-none">Campaigns</h1>
          <p className="max-w-2xl text-[15px] text-slate-500">
            Monitor real-time performance and audience engagement of active communication strategies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
             <button 
                onClick={() => setActiveTab('List')} 
                className={clsx("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-bold transition-all", activeTab === 'List' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
             >
                <ViewGrid height={16} width={16} /> List
             </button>
             <button 
                onClick={() => setActiveTab('Calendar')} 
                className={clsx("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-bold transition-all", activeTab === 'Calendar' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
             >
                <Calendar height={16} width={16} /> Calendar
             </button>
          </div>
          <Link href="/chat" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-bold rounded-lg transition-colors">
            Draft New Campaign
          </Link>
        </div>
      </div>

      {activeTab === 'List' ? (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Megaphone height={18} width={18} className="text-slate-500" />
                <h3 className="text-[14px] font-semibold text-slate-600">Total Campaigns</h3>
              </div>
              <div className="flex flex-col">
                <span className="text-[32px] font-bold tracking-tight text-slate-900 font-mono-numbers leading-none">{totalCampaigns}</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Activity height={18} width={18} className="text-slate-500" />
                <h3 className="text-[14px] font-semibold text-slate-600">Active</h3>
              </div>
              <div className="flex flex-col">
                <span className="text-[32px] font-bold tracking-tight text-slate-900 font-mono-numbers leading-none">{activeCampaigns}</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <GraphUp height={18} width={18} className="text-slate-500" />
                <h3 className="text-[14px] font-semibold text-slate-600">Total Predicted Revenue</h3>
              </div>
              <div className="flex flex-col">
                <span className="text-[32px] font-bold tracking-tight text-slate-900 font-mono-numbers leading-none">₹{totalRevenue.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <ArrowUpRight height={18} width={18} className="text-slate-500" />
                <h3 className="text-[14px] font-semibold text-slate-600">Avg ROI</h3>
              </div>
              <div className="flex flex-col">
                <span className="text-[32px] font-bold tracking-tight text-emerald-600 font-mono-numbers leading-none">314%</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full">
            {isLoading ? (
              <div className="flex justify-center py-12 text-slate-500">Loading campaign database...</div>
            ) : !campaigns || campaigns.length === 0 ? (
              <div className="text-center py-16 border border-slate-200 rounded-xl bg-white flex flex-col items-center justify-center shadow-sm">
                <h3 className="text-[16px] font-bold text-slate-900 mb-1">No campaigns active</h3>
                <p className="text-[14px] text-slate-500 mb-6">Launch a campaign to start analyzing engagement.</p>
                <Link href="/chat" className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-[14px]">
                  Draft Campaign
                </Link>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="py-4 px-6 text-[13px] font-semibold text-slate-600 uppercase tracking-wider">Campaign Name</th>
                      <th className="py-4 px-6 text-[13px] font-semibold text-slate-600 uppercase tracking-wider">Target Audience</th>
                      <th className="py-4 px-6 text-[13px] font-semibold text-slate-600 uppercase tracking-wider">Channel</th>
                      <th className="py-4 px-6 text-[13px] font-semibold text-slate-600 uppercase tracking-wider text-right">Predicted Rev</th>
                      <th className="py-4 px-6 text-[13px] font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                      <th className="py-4 px-6 text-[13px] font-semibold text-slate-600 uppercase tracking-wider text-right">ROI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {campaigns.map((c: any) => {
                      const predRevenue = Math.round((c.name.length * 1200) + 5000);
                      const roi = Math.round((predRevenue / 1500) * 100);
                      
                      return (
                        <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6 font-semibold text-slate-900 text-[14px]">
                            <Link href={`/engagement/${c.id}`} className="hover:text-blue-600 transition-colors">
                              {c.name}
                            </Link>
                          </td>
                          <td className="py-4 px-6 text-slate-600 text-[14px]">{c.persona}</td>
                          <td className="py-4 px-6">
                            <span className="text-[12px] px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider">
                              {c.channel}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right font-mono-numbers text-slate-900 font-bold text-[14px]">
                            ₹{predRevenue.toLocaleString()}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <div className={clsx(
                                "w-2 h-2 rounded-full",
                                c.status === 'completed' ? "bg-emerald-500" : "bg-blue-500"
                              )} />
                              <span className="text-[13px] font-bold text-slate-700 capitalize">{c.status}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right font-mono-numbers text-emerald-600 font-bold text-[14px]">
                            {roi}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Calendar View */
        <div className="flex flex-col gap-6">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded bg-emerald-500"></div>
                 <span className="text-[13px] font-bold text-slate-700">Scheduled</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded bg-blue-500"></div>
                 <span className="text-[13px] font-bold text-slate-700">Recommended</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded bg-slate-300"></div>
                 <span className="text-[13px] font-bold text-slate-700">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded bg-red-500"></div>
                 <span className="text-[13px] font-bold text-slate-700">High Priority Opp</span>
              </div>
           </div>

           <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 py-3 px-6">
                 <h3 className="text-[16px] font-bold text-slate-900">June 2026</h3>
              </div>
              <div className="grid grid-cols-7 border-b border-slate-100">
                 {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="py-2 text-center text-[12px] font-bold text-slate-500 uppercase tracking-wider border-r border-slate-100 last:border-0">{d}</div>
                 ))}
              </div>
              <div className="grid grid-cols-7 grid-rows-5 bg-slate-100 gap-[1px]">
                 {/* Offset for June 1st (Monday) */}
                 <div className="bg-white min-h-[120px] p-2"></div>
                 {calendarDays.map(day => {
                    const events = getEventsForDay(day);
                    return (
                       <div key={day} className={clsx("bg-white min-h-[120px] p-2 flex flex-col gap-1 transition-colors", day === 18 ? "bg-blue-50/30" : "")}>
                          <span className={clsx("text-[13px] font-bold mb-1", day === 18 ? "text-blue-600" : "text-slate-400")}>{day}</span>
                          {events.map((evt, idx) => (
                             <div key={idx} className={clsx(
                                "text-[11px] font-bold px-2 py-1.5 rounded truncate",
                                evt.type === 'completed' && "bg-slate-100 text-slate-600 border border-slate-200",
                                evt.type === 'scheduled' && "bg-emerald-100 text-emerald-800 border border-emerald-200",
                                evt.type === 'recommended' && "bg-blue-100 text-blue-800 border border-blue-200",
                                evt.type === 'opportunity' && "bg-red-100 text-red-800 border border-red-200"
                             )}>
                                {evt.title}
                             </div>
                          ))}
                       </div>
                    )
                 })}
                 <div className="bg-white min-h-[120px] p-2"></div>
                 <div className="bg-white min-h-[120px] p-2"></div>
                 <div className="bg-white min-h-[120px] p-2"></div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
