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

  const { data: fullProfile, isLoading } = useQuery({ 
    queryKey: ['customer-full-profile', id], 
    queryFn: () => fetchAPI<any>(`/api/customers/${id}/full-profile`) 
  });

  if (isLoading || !fullProfile) {
    return <div className="p-10 flex justify-center text-slate-500 font-medium">Loading Intelligence Workspace...</div>;
  }

  const customer = fullProfile;
  const intelligence = fullProfile.intelligence;
  const timeline = fullProfile.timeline;
  const nextAction = fullProfile.nextBestAction;
  const memory = fullProfile.revenueMemory;
  const similar = fullProfile.similarCustomers;
  const simulate = fullProfile.simulations;
  const predictions = fullProfile.predictions;

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
    <div className="w-full flex flex-col gap-6 pb-32 max-w-[1400px] bg-canvas min-h-screen">
      
      {/* Top Nav */}
      <div className="px-8 pt-8 pb-4">
        <button 
          onClick={() => router.push('/customers')}
          className="flex items-center gap-1.5 text-ink-muted hover:text-ink text-[13px] font-[600] w-fit transition-colors"
        >
          <NavArrowLeft height={18} width={18} /> Back to Customer Index
        </button>
      </div>

      {/* HEADER SECTION */}
      <div className="px-8 flex flex-col gap-6">
        <div className="card !p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-[24px] font-[700] text-ink tracking-tight">{customer.name}</h1>
            <div className="text-[13px] text-ink-muted font-mono-numbers">ID: {customer.id}</div>
          </div>
          
          <div className="flex gap-8 border-l border-hairline pl-8">
            <div className="flex flex-col gap-1.5 max-w-[240px]">
              <span className="text-[11px] font-[600] text-ink-muted uppercase tracking-wider">Personas</span>
              <div className="flex flex-wrap gap-1.5">
                {customer.personas && customer.personas.length > 0 ? customer.personas.map((p: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 bg-canvas-soft text-ink text-[11px] font-[600] rounded-[4px] border border-hairline whitespace-nowrap">
                    {p}
                  </span>
                )) : (
                  <span className="text-[13px] font-[600] text-ink">{executiveBrief.persona}</span>
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-[600] text-ink-muted uppercase tracking-wider">LTV</span>
              <span className="text-[14px] font-mono-numbers font-[600] text-ink mt-0.5">₹{executiveBrief.ltv.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-[600] text-ink-muted uppercase tracking-wider">Status</span>
              <span className={clsx("text-[14px] font-[600] mt-0.5", 
                executiveBrief.status === 'Healthy' ? 'text-ink' : 'text-amber-600'
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
          <div className="card !p-6 flex flex-col gap-4">
            <h2 className="text-[12px] font-[600] text-ink-muted uppercase tracking-wider flex items-center gap-2">
              <Activity height={14} width={14} /> Retention Risk
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className={clsx("px-3 py-1 rounded-[6px] text-[13px] font-[600] border", 
                  health.riskLevel === 'Low' ? 'bg-canvas text-ink border-hairline' : 
                  health.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-800 border-amber-200' : 
                  'bg-red-50 text-red-800 border-red-200'
                )}>
                  {health.riskLevel} Risk
                </span>
                <span className="text-[13px] text-ink-muted font-mono-numbers">Calculation Method: Days Since Purchase vs Historical Cycle</span>
              </div>
              <div className="flex flex-col gap-2 border-t border-hairline pt-4">
                <span className="text-[12px] font-[600] text-ink">Evidence:</span>
                <ul className="flex flex-col gap-1.5">
                  {health.evidence.map((ev: string, i: number) => (
                    <li key={i} className="text-[13px] text-ink-muted flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-ink-muted/50" /> {ev}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* NEXT BEST ACTION */}
          <div className="bg-white border border-ink rounded-[8px] p-6 shadow-sm flex flex-col gap-6">
            <h2 className="text-[12px] font-[600] text-ink uppercase tracking-wider flex items-center gap-2">
              <Spark height={14} width={14} /> Recommended Next Best Action
            </h2>
            
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <h3 className="text-[20px] font-[700] text-ink">{nextAction.recommendedAction}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2 text-[13px] text-ink-muted">
                      <span>Expected Revenue:</span>
                      <span className="font-mono-numbers font-[600] text-ink">₹{nextAction.expectedRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[13px] text-ink-muted">
                      <span>Confidence:</span>
                      <span className="font-mono-numbers font-[600] text-ink">{nextAction.confidence}%</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleCreateCampaign}
                  className="btn-primary flex items-center gap-2 py-2.5"
                >
                  Create Campaign <FastArrowRight height={14} width={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-hairline pt-5">
                <div className="flex flex-col gap-3">
                  <h4 className="text-[12px] font-[600] text-ink-muted uppercase tracking-wider">Why?</h4>
                  <ul className="flex flex-col gap-2">
                    {nextAction.why.map((w: string, i: number) => (
                      <li key={i} className="text-[13px] text-ink flex items-start gap-2">
                         <span className="text-ink-muted mt-0.5">•</span> {w}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-3 pl-0 md:pl-6 border-l-0 md:border-l border-hairline">
                  <h4 className="text-[12px] font-[600] text-ink-muted uppercase tracking-wider">Provenance</h4>
                  <div className="flex flex-col gap-4">
                    {nextAction.provenance.map((p: any, i: number) => (
                      <div key={i} className="flex flex-col gap-1">
                        <span className="text-[13px] font-[500] text-ink">{p.evidence}</span>
                        <div className="flex items-center gap-3 text-[11px] text-ink-muted font-[600]">
                          <span>Source: {p.source}</span>
                          <span>•</span>
                          <span className="text-ink">Impact: {p.impact}</span>
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
            <div className="card !p-0 flex flex-col overflow-hidden table-container">
              <div className="p-5 border-b border-hairline bg-canvas flex justify-between items-center">
                <h2 className="text-[12px] font-[600] text-ink-muted uppercase tracking-wider">Scenario Simulator</h2>
                <span className="text-[11px] text-ink-muted font-[500]">Calculated from historical conversion data</span>
              </div>
              <table className="table-enterprise">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Expected Revenue</th>
                    <th>Conversion</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {simulate.scenarios.map((s: any, i: number) => (
                    <tr key={i} className="hover:bg-canvas-soft transition-colors">
                      <td className="text-[13px] font-[600] text-ink">{s.action}</td>
                      <td className="text-[13px] font-mono-numbers font-[600] text-ink">₹{s.expectedRevenue.toLocaleString()}</td>
                      <td className="text-[13px] font-mono-numbers font-[600] text-ink">{s.conversion}</td>
                      <td className="text-[13px] font-[500] text-ink">
                        {s.confidence} <span className="text-[11px] text-ink-muted ml-1">({s.basis})</span>
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
          <div className="card !p-5 flex flex-col gap-4">
            <h2 className="text-[12px] font-[600] text-ink-muted uppercase tracking-wider flex items-center gap-2">
              <Activity height={14} width={14} /> Predictions
            </h2>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center py-1">
                <span className="text-[13px] text-ink-muted font-[500]">Next Purchase Date</span>
                <span className="text-[13px] font-[600] text-ink">{predictions.nextPurchaseDate}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-hairline">
                <span className="text-[13px] text-ink-muted font-[500]">Predicted Revenue (30d)</span>
                <span className="text-[13px] font-mono-numbers font-[600] text-ink">₹{predictions.predictedRevenueNext30Days.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-hairline">
                <span className="text-[13px] text-ink-muted font-[500]">Churn Probability</span>
                <span className={clsx("text-[13px] font-mono-numbers font-[600]", predictions.churnProbability > 50 ? 'text-red-600' : 'text-ink')}>
                  {predictions.churnProbability}%
                </span>
              </div>
            </div>
          </div>

          {/* AI LEARNING MEMORY */}
          {memory && memory.length > 0 && (
            <div className="card !p-5 flex flex-col gap-4">
              <h2 className="text-[12px] font-[600] text-ink-muted uppercase tracking-wider flex items-center gap-2">
                <Star height={14} width={14} /> AI Learning Memory
              </h2>
              <div className="flex flex-col gap-3">
                {memory.map((mem: any, i: number) => (
                  <div key={i} className="flex flex-col gap-1 border-l-2 border-hairline pl-3 py-1">
                    <span className="text-[12px] font-[600] text-ink-muted">{mem.title}</span>
                    <span className="text-[13px] text-ink leading-tight font-[500]">{mem.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TIMELINE */}
          <div className="card !p-0 flex flex-col overflow-hidden">
            <div className="p-5 border-b border-hairline bg-canvas">
              <h2 className="text-[12px] font-[600] text-ink-muted uppercase tracking-wider flex items-center gap-2">
                <DatabaseScript height={14} width={14} /> Intelligence Timeline
              </h2>
            </div>
            <div className="flex flex-col max-h-[400px] overflow-y-auto p-5 gap-5">
              {timeline && timeline.length > 0 ? (
                timeline.map((event: any, i: number) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-0.5 flex-shrink-0">
                      {event.type === 'order' && <HandCard height={14} width={14} className="text-green-600" />}
                      {event.type === 'comm' && <SendSolid height={14} width={14} className="text-ink-muted" />}
                      {event.type === 'open' && <Mail height={14} width={14} className="text-primary" />}
                      {event.type === 'click' && <FastArrowRight height={14} width={14} className="text-purple-500" />}
                      {event.type === 'learning' && <Star height={14} width={14} className="text-amber-500" />}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[13px] font-[600] text-ink leading-tight">{event.title}</span>
                      <span className="text-[11px] text-ink-muted font-mono-numbers font-[500]">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[13px] text-ink-muted text-center py-4">No events found.</div>
              )}
            </div>
          </div>

          {/* SIMILAR CUSTOMERS */}
          {similar && similar.length > 0 && (
            <div className="card !p-5 flex flex-col gap-4">
              <h2 className="text-[12px] font-[600] text-ink-muted uppercase tracking-wider flex items-center gap-2">
                <UserStar height={14} width={14} /> Similar Customers
              </h2>
              <div className="flex flex-col gap-3">
                {similar.map((s: any) => (
                  <div key={s.id} onClick={() => router.push(`/customers/${s.id}`)} className="flex justify-between items-center p-2 -mx-2 hover:bg-canvas-soft rounded-[8px] cursor-pointer transition-colors border border-transparent hover:border-hairline">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[13px] font-[600] text-ink">{s.name}</span>
                      <span className="text-[11px] text-ink-muted font-[500]">{s.similarity}% Similarity</span>
                    </div>
                    <span className="text-[13px] font-mono-numbers font-[600] text-ink">₹{s.revenue.toLocaleString()}</span>
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
