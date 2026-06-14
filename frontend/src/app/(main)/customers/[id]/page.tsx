'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';
import { clsx } from 'clsx';
import { 
  NavArrowLeft, Activity, UserStar, FastArrowRight, 
  DatabaseScript, HandCard, SendSolid, Mail, ChatBubble, Spark, Star
} from 'iconoir-react';
import { setCampaignContext } from '@/lib/campaignContext';

export default function CustomerIntelligenceHub() {
  const { id } = useParams();
  const router = useRouter();

  const { data: customer } = useQuery({ queryKey: ['customer', id], queryFn: () => fetchAPI<any>(`/api/customers/${id}`) });
  const { data: intelligence } = useQuery({ queryKey: ['intelligence', id], queryFn: () => fetchAPI<any>(`/api/customers/${id}/intelligence`) });
  const { data: timeline } = useQuery({ queryKey: ['timeline', id], queryFn: () => fetchAPI<any[]>(`/api/customers/${id}/timeline`) });
  const { data: purchaseInt } = useQuery({ queryKey: ['purchase-int', id], queryFn: () => fetchAPI<any>(`/api/customers/${id}/purchase-intelligence`) });
  const { data: behaviorInt } = useQuery({ queryKey: ['behavior-int', id], queryFn: () => fetchAPI<any>(`/api/customers/${id}/behavior-intelligence`) });
  const { data: nextAction } = useQuery({ queryKey: ['next-action', id], queryFn: () => fetchAPI<any>(`/api/customers/${id}/next-best-action`) });
  const { data: memory } = useQuery({ queryKey: ['revenue-memory', id], queryFn: () => fetchAPI<any[]>(`/api/customers/${id}/revenue-memory`) });
  const { data: similar } = useQuery({ queryKey: ['similar-customers', id], queryFn: () => fetchAPI<any[]>(`/api/customers/${id}/similar-customers`) });
  const { data: simulate } = useQuery({ queryKey: ['simulate-scenarios', id], queryFn: () => fetchAPI<any>(`/api/customers/${id}/simulate`) });
  const { data: predictions } = useQuery({ queryKey: ['predictions', id], queryFn: () => fetchAPI<any>(`/api/customers/${id}/predictions`) });

  if (!customer || !intelligence || !purchaseInt || !behaviorInt || !nextAction || !predictions) {
    return <div className="p-10 flex justify-center text-slate-500 font-medium">Loading Intelligence Workspace...</div>;
  }

  const { executiveBrief, health } = intelligence;

  const handleCreateCampaign = () => {
    setCampaignContext({ 
      audienceName: customer.name, 
      recommendedAction: nextAction.recommendedAction, 
      audienceSize: 1, 
      recommendedChannel: nextAction.channel 
    });
    router.push('/chat');
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-32 max-w-[1400px] bg-[#F9FAFB] min-h-screen">
      
      {/* Top Nav */}
      <div className="px-8 pt-8 pb-4">
        <button 
          onClick={() => router.push('/customers')}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-[13px] font-medium w-fit transition-colors"
        >
          <NavArrowLeft height={18} width={18} /> Back to Customer Index
        </button>
      </div>

      {/* HEADER SECTION */}
      <div className="px-8 flex flex-col gap-6">
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-[24px] font-semibold text-slate-900 tracking-tight">{customer.name}</h1>
            <div className="text-[13px] text-slate-500 font-mono">ID: {customer.id}</div>
          </div>
          
          <div className="flex gap-8 border-l border-[#E5E7EB] pl-8">
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Persona</span>
              <span className="text-[14px] font-medium text-slate-900 mt-0.5">{executiveBrief.persona}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">LTV</span>
              <span className="text-[14px] font-mono font-medium text-slate-900 mt-0.5">₹{executiveBrief.ltv.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Status</span>
              <span className={clsx("text-[14px] font-medium mt-0.5", 
                executiveBrief.status === 'Healthy' ? 'text-slate-900' : 'text-amber-600'
              )}>
                {executiveBrief.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row px-8 gap-6 items-start">
        
        {/* MAIN INTELLIGENCE COLUMN */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* HEALTH / RETENTION RISK */}
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] p-6 shadow-sm flex flex-col gap-4">
            <h2 className="text-[12px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Activity height={14} width={14} /> Retention Risk
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className={clsx("px-3 py-1 rounded-[6px] text-[13px] font-medium", 
                  health.riskLevel === 'Low' ? 'bg-slate-100 text-slate-800' : 
                  health.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 
                  'bg-red-50 text-red-800 border border-red-200'
                )}>
                  {health.riskLevel} Risk
                </span>
                <span className="text-[13px] text-slate-500 font-mono">Calculation Method: Days Since Purchase vs Historical Cycle</span>
              </div>
              <div className="flex flex-col gap-2 border-t border-[#E5E7EB] pt-4">
                <span className="text-[12px] font-medium text-slate-700">Evidence:</span>
                <ul className="flex flex-col gap-1.5">
                  {health.evidence.map((ev: string, i: number) => (
                    <li key={i} className="text-[13px] text-slate-600 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> {ev}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* NEXT BEST ACTION */}
          <div className="bg-[#FFFFFF] border border-slate-900 rounded-[12px] p-6 shadow-sm flex flex-col gap-6">
            <h2 className="text-[12px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Spark height={14} width={14} /> Recommended Next Best Action
            </h2>
            
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <h3 className="text-[20px] font-semibold text-slate-900">{nextAction.recommendedAction}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2 text-[13px] text-slate-600">
                      <span className="text-slate-500">Expected Revenue:</span>
                      <span className="font-mono font-medium text-slate-900">₹{nextAction.expectedRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[13px] text-slate-600">
                      <span className="text-slate-500">Confidence:</span>
                      <span className="font-mono font-medium text-slate-900">{nextAction.confidence}%</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleCreateCampaign}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-[8px] text-[13px] font-medium transition-colors flex items-center gap-2"
                >
                  Create Campaign <FastArrowRight height={14} width={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-[#E5E7EB] pt-5">
                <div className="flex flex-col gap-3">
                  <h4 className="text-[12px] font-medium text-slate-500 uppercase">Why?</h4>
                  <ul className="flex flex-col gap-2">
                    {nextAction.why.map((w: string, i: number) => (
                      <li key={i} className="text-[13px] text-slate-700 flex items-start gap-2">
                         <span className="text-slate-400 mt-0.5">•</span> {w}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-3 pl-0 md:pl-6 border-l-0 md:border-l border-[#E5E7EB]">
                  <h4 className="text-[12px] font-medium text-slate-500 uppercase">Provenance</h4>
                  <div className="flex flex-col gap-4">
                    {nextAction.provenance.map((p: any, i: number) => (
                      <div key={i} className="flex flex-col gap-1">
                        <span className="text-[13px] text-slate-900">{p.evidence}</span>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                          <span>Source: {p.source}</span>
                          <span>•</span>
                          <span className="text-slate-700">Impact: {p.impact}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* SCENARIO SIMULATOR */}
          {simulate && (
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] p-0 shadow-sm flex flex-col overflow-hidden">
              <div className="p-5 border-b border-[#E5E7EB] bg-[#F9FAFB] flex justify-between items-center">
                <h2 className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">Scenario Simulator</h2>
                <span className="text-[11px] text-slate-400">Calculated from historical conversion data</span>
              </div>
              <table className="w-full text-left">
                <thead className="bg-[#FFFFFF] border-b border-[#E5E7EB]">
                  <tr>
                    <th className="py-3 px-5 text-[11px] font-medium text-slate-500 uppercase">Action</th>
                    <th className="py-3 px-5 text-[11px] font-medium text-slate-500 uppercase">Expected Revenue</th>
                    <th className="py-3 px-5 text-[11px] font-medium text-slate-500 uppercase">Conversion</th>
                    <th className="py-3 px-5 text-[11px] font-medium text-slate-500 uppercase">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {simulate.scenarios.map((s: any, i: number) => (
                    <tr key={i} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="py-3 px-5 text-[13px] font-medium text-slate-900">{s.action}</td>
                      <td className="py-3 px-5 text-[13px] font-mono text-slate-900">₹{s.expectedRevenue.toLocaleString()}</td>
                      <td className="py-3 px-5 text-[13px] font-mono text-slate-900">{s.conversion}</td>
                      <td className="py-3 px-5 text-[13px] text-slate-600">
                        {s.confidence} <span className="text-[11px] text-slate-400 ml-1">({s.basis})</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* RIGHT SIDEBAR */}
        <div className="w-[360px] flex flex-col gap-6 flex-shrink-0">

          {/* PREDICTIONS */}
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] p-5 shadow-sm flex flex-col gap-4">
            <h2 className="text-[12px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Activity height={14} width={14} /> Predictions
            </h2>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center py-1">
                <span className="text-[13px] text-slate-600">Next Purchase Date</span>
                <span className="text-[13px] font-medium text-slate-900">{predictions.nextPurchaseDate}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-[#E5E7EB]">
                <span className="text-[13px] text-slate-600">Predicted Revenue (30d)</span>
                <span className="text-[13px] font-mono font-medium text-slate-900">₹{predictions.predictedRevenueNext30Days.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-[#E5E7EB]">
                <span className="text-[13px] text-slate-600">Churn Probability</span>
                <span className={clsx("text-[13px] font-mono font-medium", predictions.churnProbability > 50 ? 'text-red-600' : 'text-slate-900')}>
                  {predictions.churnProbability}%
                </span>
              </div>
            </div>
          </div>

          {/* AI LEARNING MEMORY */}
          {memory && memory.length > 0 && (
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] p-5 shadow-sm flex flex-col gap-4">
              <h2 className="text-[12px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Star height={14} width={14} /> AI Learning Memory
              </h2>
              <div className="flex flex-col gap-3">
                {memory.map((mem: any, i: number) => (
                  <div key={i} className="flex flex-col gap-1 border-l-2 border-slate-300 pl-3 py-1">
                    <span className="text-[12px] font-medium text-slate-500">{mem.title}</span>
                    <span className="text-[13px] text-slate-900 leading-tight">{mem.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TIMELINE */}
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] flex flex-col shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#E5E7EB] bg-[#F9FAFB]">
              <h2 className="text-[12px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <DatabaseScript height={14} width={14} /> Intelligence Timeline
              </h2>
            </div>
            <div className="flex flex-col max-h-[400px] overflow-y-auto p-5 gap-5">
              {timeline && timeline.length > 0 ? (
                timeline.map((event: any, i: number) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-0.5 flex-shrink-0">
                      {event.type === 'order' && <HandCard height={14} width={14} className="text-emerald-600" />}
                      {event.type === 'comm' && <SendSolid height={14} width={14} className="text-slate-500" />}
                      {event.type === 'open' && <Mail height={14} width={14} className="text-indigo-500" />}
                      {event.type === 'click' && <FastArrowRight height={14} width={14} className="text-purple-500" />}
                      {event.type === 'learning' && <Star height={14} width={14} className="text-amber-500" />}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[13px] font-medium text-slate-900 leading-tight">{event.title}</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[13px] text-slate-500 text-center py-4">No events found.</div>
              )}
            </div>
          </div>

          {/* SIMILAR CUSTOMERS */}
          {similar && similar.length > 0 && (
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] p-5 shadow-sm flex flex-col gap-4">
              <h2 className="text-[12px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <UserStar height={14} width={14} /> Similar Customers
              </h2>
              <div className="flex flex-col gap-3">
                {similar.map((s: any) => (
                  <div key={s.id} onClick={() => router.push(`/customers/${s.id}`)} className="flex justify-between items-center p-2 -mx-2 hover:bg-[#F9FAFB] rounded-lg cursor-pointer transition-colors border border-transparent hover:border-[#E5E7EB]">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[13px] font-medium text-slate-900">{s.name}</span>
                      <span className="text-[11px] text-slate-500">{s.similarity}% Similarity</span>
                    </div>
                    <span className="text-[13px] font-mono text-slate-700">₹{s.revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
