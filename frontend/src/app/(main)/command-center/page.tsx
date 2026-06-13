'use client';

import React, { useState } from 'react';
import { Search, Spark, Play, ShieldCheck, Activity, ArrowRight, WarningCircle, CheckCircle, RefreshDouble, NavArrowDown } from 'iconoir-react';
import { clsx } from 'clsx';
import { fetchAPI } from '@/lib/api';

export default function CommandCenter() {
  const [goal, setGoal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [activeSimulation, setActiveSimulation] = useState<number | null>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!goal.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setPlan(null);
    setIsApproved(false);

    try {
      const response = await fetch('/api/ai/revenue-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal })
      });
      if (response.ok) {
        const data = await response.json();
        setPlan(data);
      } else {
        alert("Failed to generate plan.");
      }
    } catch (err) {
      console.error(err);
      alert("Error generating plan.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = () => {
    setIsApproved(true);
    // Real implementation would queue the campaigns here.
  };

  return (
    <div className="flex w-full h-full bg-slate-50">
      {/* Main Column */}
      <div className="flex-1 overflow-y-auto px-10 py-12">
        <div className="max-w-[800px] mx-auto flex flex-col gap-8">

          {/* Header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-[28px] font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <Spark className="text-blue-600" /> AI Revenue Commander
            </h1>
            <p className="text-[15px] text-slate-500">
              Define a business outcome. The AI determines who to target, what to run, and how to execute.
            </p>
          </div>

          {/* Massive Command Input */}
          <div className="relative group shadow-sm transition-all rounded-2xl">
            <form onSubmit={handleGenerate}>
              <Search height={24} width={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="What revenue outcome do you want? (e.g. Generate ₹10 lakh additional revenue this month)"
                disabled={isGenerating || (plan && isApproved)}
                className="w-full bg-white border-2 border-slate-200 focus:border-blue-600 focus:ring-0 rounded-2xl pl-16 pr-32 py-6 text-[18px] text-slate-900 font-medium placeholder-slate-400 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
              />
              <button
                type="submit"
                disabled={!goal.trim() || isGenerating || (plan && isApproved)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white px-5 py-3 rounded-xl text-[14px] font-bold transition-all shadow-sm flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshDouble className="animate-spin" height={18} width={18} /> Strategizing...
                  </>
                ) : (
                  <>Generate Plan <ArrowRight height={18} width={18} /></>
                )}
              </button>
            </form>
          </div>

          {/* Generating State */}
          {isGenerating && (
            <div className="flex flex-col gap-4 py-8 animate-in fade-in duration-500">
              <div className="flex items-center gap-3 text-blue-600 font-medium">
                <RefreshDouble className="animate-spin" height={20} width={20} />
                <span className="text-[15px]">Analyzing Customers, Orders, and Historical Campaigns...</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 font-medium animate-pulse delay-150">
                <span className="w-5 h-5 rounded-full border-2 border-slate-300"></span>
                <span className="text-[15px]">Identifying High-Probability Revenue Opportunities...</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 font-medium animate-pulse delay-300">
                <span className="w-5 h-5 rounded-full border-2 border-slate-300"></span>
                <span className="text-[15px]">Estimating ROI and Confidence...</span>
              </div>
            </div>
          )}

          {/* The Revenue Plan */}
          {plan && !isGenerating && (
            <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
              
              {/* Plan Summary */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex justify-between items-center">
                <div className="flex flex-col gap-1">
                  <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Revenue Objective</span>
                  <span className="text-[20px] font-bold text-slate-900">{plan.revenueObjective}</span>
                </div>
                <div className="flex items-center gap-8">
                  <div className="flex flex-col items-end">
                    <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Projected Revenue</span>
                    <span className="text-[24px] font-bold text-emerald-600 font-mono tracking-tight">₹{plan.projectedTotalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Status</span>
                    <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-[13px] font-bold mt-1">
                      {plan.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommended Campaigns Stack */}
              <div className="flex flex-col gap-4">
                <h3 className="text-[14px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Activity height={18} width={18} /> Recommended Campaigns
                </h3>
                
                {plan.campaigns.map((camp: any, idx: number) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden group">
                    {/* Campaign Header */}
                    <div className="p-6 pb-4 border-b border-slate-100">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-[14px]">
                            {idx + 1}
                          </div>
                          <h4 className="text-[18px] font-bold text-slate-900">{camp.name}</h4>
                        </div>
                        <div className="text-right">
                          <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider block">Projected Revenue</span>
                          <span className="text-[18px] font-bold text-emerald-600 font-mono">₹{camp.projectedRevenue.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Metrics Row */}
                      <div className="grid grid-cols-3 gap-4 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-slate-500 uppercase">Audience</span>
                          <span className="text-[15px] font-bold text-slate-900">{camp.audienceSize} customers</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-slate-500 uppercase">Channel</span>
                          <span className="text-[15px] font-bold text-slate-900">{camp.channel}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-slate-500 uppercase">Confidence</span>
                          <span className="text-[15px] font-bold text-slate-900">{camp.confidence}%</span>
                        </div>
                      </div>

                      {/* Provenance */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                          <ShieldCheck height={14} width={14} /> Recommendation Provenance
                        </span>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {camp.provenance.map((prov: string, i: number) => (
                            <li key={i} className="text-[12px] text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                              {prov}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Simulation Toggle */}
                    <div className="bg-slate-50 px-6 py-3 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setActiveSimulation(activeSimulation === idx ? null : idx)}>
                      <span className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                        <Activity height={16} width={16} /> Decision Simulation
                      </span>
                      <NavArrowDown height={16} width={16} className={clsx("text-slate-500 transition-transform", activeSimulation === idx && "rotate-180")} />
                    </div>

                    {/* Simulation Panel */}
                    {activeSimulation === idx && (
                      <div className="p-6 bg-slate-900 text-white animate-in slide-in-from-top-2 fade-in duration-200">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-4">What happens if...</span>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                            <span className="text-[13px] font-medium text-slate-300 block mb-2">We change channel to Email?</span>
                            <div className="flex justify-between items-end">
                              <span className="text-[18px] font-bold text-emerald-400 font-mono">₹{camp.simulation.ifChannelEmail.revenue.toLocaleString()}</span>
                              <span className="text-[12px] text-red-400 font-bold bg-red-400/10 px-2 py-0.5 rounded">Drops by {Math.round((1 - camp.simulation.ifChannelEmail.revenue / camp.projectedRevenue) * 100)}%</span>
                            </div>
                          </div>
                          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                            <span className="text-[13px] font-medium text-slate-300 block mb-2">We increase discount by 5%?</span>
                            <div className="flex justify-between items-end">
                              <span className="text-[18px] font-bold text-emerald-400 font-mono">₹{camp.simulation.ifDiscountIncreased.revenue.toLocaleString()}</span>
                              <span className="text-[12px] text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded">Increases, but ROI falls to {camp.simulation.ifDiscountIncreased.roi}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* One Click Execution Bottom Bar */}
              <div className="sticky bottom-8 mt-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl flex items-center justify-between">
                <div className="flex flex-col ml-2">
                  <span className="text-[15px] font-bold text-slate-900">Total Execution Plan</span>
                  <span className="text-[13px] text-slate-500">{plan.campaigns.length} Campaigns · {plan.timeline}</span>
                </div>
                {isApproved ? (
                  <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-sm">
                    <CheckCircle height={20} width={20} /> Campaigns Queued Successfully
                  </div>
                ) : (
                  <button 
                    onClick={handleApprove}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl text-[15px] font-bold transition-all shadow-md flex items-center gap-2"
                  >
                    <Play height={18} width={18} /> Approve Strategy
                  </button>
                )}
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Right Column: Ledger */}
      <div className="w-[360px] bg-white border-l border-slate-200 flex flex-col h-full sticky top-0">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-[15px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
            <ShieldCheck height={18} width={18} className="text-blue-600" /> Revenue Decision Ledger
          </h2>
          <p className="text-[13px] text-slate-500 mt-1">Real-time accuracy tracking.</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Overall System Accuracy</span>
            <span className="text-[32px] font-bold text-emerald-600 font-mono">94.2%</span>
            <span className="text-[12px] text-emerald-700 font-medium bg-emerald-50 self-start px-2 py-0.5 rounded mt-1">+1.2% this month</span>
          </div>

          <div className="border-t border-slate-100 my-2"></div>

          <span className="text-[12px] font-bold text-slate-900 uppercase tracking-wider">Recent Executions</span>
          
          <div className="flex flex-col gap-3">
            {[
              { name: "Cart Abandonment", pred: "₹1.2L", act: "₹1.15L", acc: "96%" },
              { name: "Winback Flow", pred: "₹2.4L", act: "₹2.5L", acc: "98%" },
              { name: "VIP Early Access", pred: "₹8.0L", act: "₹7.1L", acc: "89%" }
            ].map((exec, i) => (
              <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col gap-2">
                <span className="text-[13px] font-bold text-slate-900">{exec.name}</span>
                <div className="flex justify-between text-[12px] font-mono text-slate-600">
                  <span>Pred: {exec.pred}</span>
                  <span>Act: {exec.act}</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-blue-500 h-full" style={{ width: exec.acc }}></div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}
