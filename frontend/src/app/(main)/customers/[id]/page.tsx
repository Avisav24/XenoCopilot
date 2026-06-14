'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';
import { clsx } from 'clsx';
import { 
  NavArrowLeft, Activity, GraphUp, UserStar, Clock, FastArrowRight,
  ShieldAlert, RefreshDouble, Star, DataTransferBoth, HandCard, SendSolid, Mail, ChatBubble, Spark
} from 'iconoir-react';

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
  const { data: ledger } = useQuery({ queryKey: ['decision-ledger', id], queryFn: () => fetchAPI<any[]>(`/api/customers/${id}/decision-ledger`) });
  
  // Scenarios will be static or derived locally for interaction
  const simulateAction = (action: string) => {
    // For MVP, just return static derived mapping from nextAction
    if (action === 'whatsapp') return { rev: '₹6,800', conv: '8.4%', margin: 'High' };
    if (action === 'email') return { rev: '₹3,100', conv: '3.2%', margin: 'High' };
    if (action === 'discount') return { rev: '₹8,200', conv: '12.1%', margin: 'Low (15% Off)' };
    return { rev: '₹0', conv: '0%', margin: '-' };
  };

  if (!customer || !intelligence || !purchaseInt || !behaviorInt || !nextAction) {
    return <div className="p-10 flex justify-center text-slate-500 font-medium">Loading AI Intelligence...</div>;
  }

  const { executiveBrief, summary } = intelligence;

  return (
    <div className="w-full flex flex-col gap-8 pb-32 max-w-[1400px]">
      <button 
        onClick={() => router.push('/')}
        className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-[13px] font-medium w-fit transition-colors"
      >
        <NavArrowLeft height={18} width={18} /> Back
      </button>

      {/* SECTION 1: CUSTOMER EXECUTIVE BRIEF */}
      <div className="flex flex-col gap-6">
        <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Customer Executive Brief</h2>
        <div className="bg-slate-900 rounded-[16px] p-8 flex flex-col gap-8 shadow-xl text-white relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-10 translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="flex flex-col gap-2 relative z-10">
            <h1 className="text-[32px] font-bold tracking-tight leading-none">{customer.name}</h1>
            <div className="flex items-center gap-3">
              <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-[12px] font-bold tracking-wider uppercase border border-slate-700">
                {executiveBrief.persona}
              </span>
              <span className="text-slate-400 text-[14px] flex items-center gap-1"><HandCard height={16} width={16} /> LTV: ₹{executiveBrief.ltv.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10 border-t border-slate-800 pt-8">
            <div className="flex flex-col gap-1">
              <span className="text-[12px] text-slate-400 uppercase tracking-wider font-bold">Health Score</span>
              <div className="flex items-end gap-2">
                <span className={clsx("text-[24px] font-mono font-bold leading-none", executiveBrief.health > 70 ? 'text-emerald-400' : executiveBrief.health > 40 ? 'text-amber-400' : 'text-red-400')}>
                  {executiveBrief.health}
                </span>
                <span className="text-[12px] text-slate-500 mb-0.5">/ 100</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[12px] text-slate-400 uppercase tracking-wider font-bold">Revenue At Risk</span>
              <span className={clsx("text-[24px] font-mono font-bold leading-none", executiveBrief.revenueAtRisk > 0 ? 'text-red-400' : 'text-slate-300')}>
                ₹{executiveBrief.revenueAtRisk.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[12px] text-slate-400 uppercase tracking-wider font-bold">Next Purchase</span>
              <span className="text-[16px] font-bold text-slate-200 mt-1">{executiveBrief.predictedNextPurchase}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[12px] text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1"><Spark height={12} width={12} className="text-emerald-400" /> Action Required</span>
              <span className="text-[16px] font-bold text-emerald-400 mt-1">{executiveBrief.recommendedAction}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: CORE INTELLIGENCE */}
        <div className="md:col-span-2 flex flex-col gap-8">
          
          {/* SECTION 2: AI CUSTOMER SUMMARY */}
          <div className="flex flex-col gap-4">
            <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">AI Customer Summary</h2>
            <div className="bg-white border border-slate-200 rounded-[12px] p-6 shadow-sm">
              <p className="text-[15px] text-slate-700 leading-relaxed font-medium">
                {summary}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* SECTION 4: PURCHASE INTELLIGENCE */}
            <div className="flex flex-col gap-4">
              <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Purchase Intelligence</h2>
              <div className="bg-white border border-slate-200 rounded-[12px] p-6 shadow-sm flex flex-col gap-6">
                <div className="flex justify-between items-end pb-4 border-b border-slate-100">
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] text-slate-500 font-bold uppercase tracking-wider">AOV</span>
                    <span className="text-[20px] font-mono font-bold text-slate-900">₹{purchaseInt.aov.value.toFixed(0)}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[11px] text-slate-400 font-medium">vs Avg ₹{purchaseInt.aov.average.toFixed(0)}</span>
                    <span className={clsx("text-[13px] font-bold", purchaseInt.aov.delta.startsWith('+') ? 'text-emerald-600' : 'text-red-600')}>{purchaseInt.aov.delta}</span>
                  </div>
                </div>
                <div className="flex justify-between items-end pb-4 border-b border-slate-100">
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] text-slate-500 font-bold uppercase tracking-wider">Frequency</span>
                    <span className="text-[20px] font-mono font-bold text-slate-900">{purchaseInt.frequency.value} Orders</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[11px] text-slate-400 font-medium">vs Avg {purchaseInt.frequency.average.toFixed(1)}</span>
                    <span className={clsx("text-[13px] font-bold", purchaseInt.frequency.delta.startsWith('+') ? 'text-emerald-600' : 'text-red-600')}>{purchaseInt.frequency.delta}</span>
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] text-slate-500 font-bold uppercase tracking-wider">Reorder Cycle</span>
                    <span className="text-[20px] font-mono font-bold text-slate-900">{purchaseInt.historicalReorderCycle} Days</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[11px] text-slate-400 font-medium">Last order</span>
                    <span className={clsx("text-[13px] font-bold", purchaseInt.daysSinceLastPurchase > purchaseInt.historicalReorderCycle ? 'text-red-600' : 'text-emerald-600')}>
                      {purchaseInt.daysSinceLastPurchase} days ago
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 5: BEHAVIOR INTELLIGENCE */}
            <div className="flex flex-col gap-4">
              <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Behavior Intelligence</h2>
              <div className="bg-white border border-slate-200 rounded-[12px] p-6 shadow-sm flex flex-col gap-6 h-full">
                <div className="flex flex-col gap-1">
                  <span className="text-[12px] text-slate-500 font-bold uppercase tracking-wider">Preferred Channel</span>
                  <div className="flex items-center gap-2 mt-1">
                    {behaviorInt.preferredChannel === 'WhatsApp' ? <SendSolid height={20} width={20} className="text-emerald-500" /> : <Mail height={20} width={20} className="text-blue-500" />}
                    <span className="text-[18px] font-bold text-slate-900">{behaviorInt.preferredChannel}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-slate-600 flex items-center gap-2"><SendSolid height={14} width={14}/> WhatsApp</span>
                    <div className="flex items-center gap-4 text-[12px] font-mono font-bold">
                      <span className="text-slate-400 w-12 text-right">{behaviorInt.channels.whatsapp.open}% O</span>
                      <span className="text-slate-900 w-12 text-right">{behaviorInt.channels.whatsapp.conv}% C</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-slate-600 flex items-center gap-2"><Mail height={14} width={14}/> Email</span>
                    <div className="flex items-center gap-4 text-[12px] font-mono font-bold">
                      <span className="text-slate-400 w-12 text-right">{behaviorInt.channels.email.open}% O</span>
                      <span className="text-slate-900 w-12 text-right">{behaviorInt.channels.email.conv}% C</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-slate-600 flex items-center gap-2"><ChatBubble height={14} width={14}/> SMS</span>
                    <div className="flex items-center gap-4 text-[12px] font-mono font-bold">
                      <span className="text-slate-400 w-12 text-right">{behaviorInt.channels.sms.open}% O</span>
                      <span className="text-slate-900 w-12 text-right">{behaviorInt.channels.sms.conv}% C</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Best Time</span>
                    <span className="text-[13px] font-bold text-slate-900">{behaviorInt.bestEngagementTime}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 items-end">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Best Campaign</span>
                    <span className="text-[13px] font-bold text-slate-900">{behaviorInt.bestCampaignType}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 6: NEXT BEST ACTION ENGINE */}
          <div className="flex flex-col gap-4 mt-4">
            <h2 className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-2">
              <Spark height={14} width={14} /> Next Best Action
            </h2>
            <div className="bg-emerald-50 border border-emerald-200 rounded-[12px] p-6 shadow-sm flex flex-col md:flex-row gap-8">
              
              <div className="flex flex-col gap-4 flex-1">
                <span className="text-[20px] font-bold text-slate-900">{nextAction.recommendedAction}</span>
                <div className="flex items-center gap-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Expected Revenue</span>
                    <span className="text-[18px] font-mono font-bold text-emerald-700">₹{nextAction.expectedRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Confidence</span>
                    <span className="text-[18px] font-mono font-bold text-slate-900">{nextAction.confidence}%</span>
                  </div>
                </div>
                <button className="bg-slate-900 text-white px-6 py-3 rounded-[8px] font-bold text-[13px] mt-2 w-fit flex items-center gap-2 hover:bg-slate-800 transition-colors">
                  Draft Campaign <FastArrowRight height={16} width={16} />
                </button>
              </div>

              <div className="flex flex-col gap-3 flex-1 border-t md:border-t-0 md:border-l border-emerald-200 pt-6 md:pt-0 md:pl-8">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Recommendation Provenance</span>
                <ul className="flex flex-col gap-3">
                  {nextAction.why.slice(0,3).map((w: string, i: number) => (
                     <li key={i} className="flex items-start gap-2 text-[13px] font-medium text-slate-700 leading-tight">
                       <span className="text-emerald-500 font-bold">•</span> {w}
                     </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

          {/* SECTION 7: SCENARIO SIMULATOR */}
          <div className="flex flex-col gap-4 mt-4">
            <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <RefreshDouble height={14} width={14} className="text-purple-600"/> Scenario Simulator
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-slate-200 bg-white rounded-[8px] p-5 flex flex-col gap-3 shadow-sm hover:border-purple-300 transition-colors cursor-pointer">
                <span className="text-[13px] font-bold text-slate-900">Send WhatsApp Today</span>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Revenue</span>
                  <span className="text-[14px] font-mono font-bold text-emerald-600">{simulateAction('whatsapp').rev}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Conversion</span>
                  <span className="text-[14px] font-mono font-bold text-slate-900">{simulateAction('whatsapp').conv}</span>
                </div>
              </div>
              <div className="border border-slate-200 bg-white rounded-[8px] p-5 flex flex-col gap-3 shadow-sm hover:border-purple-300 transition-colors cursor-pointer">
                <span className="text-[13px] font-bold text-slate-900">Send Email</span>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Revenue</span>
                  <span className="text-[14px] font-mono font-bold text-emerald-600">{simulateAction('email').rev}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Conversion</span>
                  <span className="text-[14px] font-mono font-bold text-slate-900">{simulateAction('email').conv}</span>
                </div>
              </div>
              <div className="border border-slate-200 bg-white rounded-[8px] p-5 flex flex-col gap-3 shadow-sm hover:border-purple-300 transition-colors cursor-pointer">
                <span className="text-[13px] font-bold text-slate-900">Offer 15% Discount</span>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Revenue</span>
                  <span className="text-[14px] font-mono font-bold text-emerald-600">{simulateAction('discount').rev}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Margin</span>
                  <span className="text-[14px] font-bold text-red-600">{simulateAction('discount').margin}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: TIMELINE & CONTEXT */}
        <div className="flex flex-col gap-8">
          
          {/* SECTION 8: REVENUE MEMORY */}
          {memory && memory.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">System Learnings</h2>
              <div className="flex flex-col gap-3">
                {memory.map((mem, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-200 rounded-[8px] p-4 flex gap-3">
                    <div className="text-indigo-500 mt-0.5"><Star height={16} width={16} /></div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[12px] font-bold text-slate-900">{mem.title}</span>
                      <span className="text-[12px] text-slate-600 leading-tight">{mem.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: CUSTOMER TIMELINE */}
          <div className="flex flex-col gap-4">
            <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Activity Feed</h2>
            <div className="bg-white border border-slate-200 rounded-[12px] shadow-sm flex flex-col max-h-[500px] overflow-y-auto">
              {timeline && timeline.length > 0 ? (
                timeline.map((event, i) => (
                  <div key={i} className="flex gap-4 p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <div className="mt-1">
                      {event.type === 'order' && <HandCard height={16} width={16} className="text-emerald-500" />}
                      {event.type === 'comm' && <SendSolid height={16} width={16} className="text-blue-500" />}
                      {event.type === 'open' && <DataTransferBoth height={16} width={16} className="text-indigo-500" />}
                      {event.type === 'click' && <FastArrowRight height={16} width={16} className="text-purple-500" />}
                      {event.type === 'segment' && <UserStar height={16} width={16} className="text-amber-500" />}
                    </div>
                    <div className="flex flex-col flex-1 gap-1">
                      <div className="flex justify-between items-start">
                        <span className="text-[13px] font-bold text-slate-900">{event.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap ml-2">
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      {event.amount && <span className="text-[13px] font-mono font-bold text-emerald-600">₹{event.amount.toLocaleString()}</span>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-[13px] text-slate-500">No activity recorded.</div>
              )}
            </div>
          </div>

          {/* SECTION 9: RELATED CUSTOMERS */}
          {similar && similar.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Similar Customers</h2>
              <div className="bg-white border border-slate-200 rounded-[12px] p-4 shadow-sm flex flex-col gap-3">
                {similar.map(s => (
                  <div key={s.id} onClick={() => router.push(`/customers/${s.id}`)} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[13px] font-bold text-slate-900">{s.name}</span>
                      <span className="text-[11px] text-slate-500">{s.similarity}% Match</span>
                    </div>
                    <span className="text-[13px] font-mono font-bold text-slate-700">₹{s.revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* SECTION 10: CUSTOMER DECISION LEDGER */}
      {ledger && ledger.length > 0 && (
        <div className="flex flex-col gap-4 mt-8 pt-8 border-t border-slate-200">
          <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Customer Decision Ledger</h2>
          <div className="bg-white border border-slate-200 rounded-[12px] shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">AI Recommendation</th>
                  <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Accepted</th>
                  <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Predicted Rev</th>
                  <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actual Rev</th>
                  <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledger.map((log, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-5 text-[13px] font-mono text-slate-500">{new Date(log.date).toLocaleDateString()}</td>
                    <td className="py-4 px-5 text-[13px] font-bold text-slate-900">{log.recommendation}</td>
                    <td className="py-4 px-5 text-center">
                      <span className={clsx("text-[11px] font-bold px-2 py-1 rounded-full uppercase tracking-wider", log.accepted === 'Yes' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600')}>
                        {log.accepted}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-[13px] font-mono font-bold text-slate-900 text-right">₹{log.predictedRevenue.toLocaleString()}</td>
                    <td className="py-4 px-5 text-[13px] font-mono font-bold text-emerald-600 text-right">₹{log.actualRevenue.toLocaleString()}</td>
                    <td className="py-4 px-5 text-[13px] font-mono font-bold text-slate-900 text-right">{log.accuracy}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
