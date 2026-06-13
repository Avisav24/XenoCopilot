'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle, GraphUp, Spark, WarningCircle, ArrowRight, Activity, Flash } from 'iconoir-react';
import { clsx } from 'clsx';

export default function CommandCenter() {
  const [ledger, setLedger] = useState<any>(null);
  const [leaks, setLeaks] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [simResults, setSimResults] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ledgerRes, leaksRes, oppsRes] = await Promise.all([
          fetch('/api/revenue/ledger'),
          fetch('/api/revenue/leaks'),
          fetch('/api/revenue/opportunities')
        ]);
        
        if (ledgerRes.ok) setLedger(await ledgerRes.json());
        if (leaksRes.ok) setLeaks(await leaksRes.json());
        if (oppsRes.ok) setOpportunities(await oppsRes.json());
      } catch (err) {
        console.error("Failed to load RCC data:", err);
      }
    }
    fetchData();
  }, []);

  const runSimulation = async (audienceName: string) => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/revenue/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarios: [
            { name: "Scenario A", audienceName, channel: "WhatsApp", discount: "10" },
            { name: "Scenario B", audienceName, channel: "Email", discount: "15" },
            { name: "Scenario C", audienceName, channel: "SMS", discount: "0" }
          ]
        })
      });
      if (res.ok) {
        setSimResults(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto w-full max-w-[1200px] mx-auto pb-24">
      {/* HUD Header */}
      <div className="mb-12">
        <h1 className="text-[28px] font-bold text-ink tracking-tight mb-2 flex items-center gap-3">
          <Activity className="text-primary" />
          Revenue Command Center
        </h1>
        <p className="text-[16px] text-ink-muted font-medium italic">
          "XenoCopilot does not optimize campaigns. XenoCopilot optimizes revenue decisions."
        </p>

        {ledger && (
          <div className="mt-8 grid grid-cols-3 gap-6">
            <div className="bg-canvas-soft border border-hairline p-5 rounded-lg shadow-sm">
              <p className="text-[12px] uppercase font-bold text-ink-muted tracking-wider mb-1 flex items-center gap-2">
                <ShieldCheck height={16} width={16} /> System Accuracy
              </p>
              <p className="text-[24px] font-bold text-ink">{ledger.systemAccuracy}</p>
            </div>
            <div className="bg-canvas-soft border border-hairline p-5 rounded-lg shadow-sm">
              <p className="text-[12px] uppercase font-bold text-ink-muted tracking-wider mb-1 flex items-center gap-2">
                <CheckCircle height={16} width={16} /> Revenue Prediction Accuracy
              </p>
              <p className="text-[24px] font-bold text-success">{ledger.revenuePredictionAccuracy.toFixed(1)}%</p>
            </div>
            <div className="bg-canvas-soft border border-hairline p-5 rounded-lg shadow-sm">
              <p className="text-[12px] uppercase font-bold text-ink-muted tracking-wider mb-1 flex items-center gap-2">
                <Activity height={16} width={16} /> Predictions Audited
              </p>
              <p className="text-[24px] font-bold text-ink">{ledger.totalPredictionsAudited}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-8 mb-12">
        {/* LEAK ENGINE */}
        <div>
          <h2 className="text-[18px] font-bold text-ink mb-4 flex items-center gap-2 border-b border-hairline pb-2">
            <WarningCircle className="text-danger" /> Revenue Leak Engine
          </h2>
          <div className="flex flex-col gap-4">
            {leaks.map((leak, idx) => (
              <div key={idx} className="bg-canvas-soft border border-hairline rounded-lg p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-ink text-[16px]">{leak.leakName}</h3>
                    <p className="text-danger font-medium text-[14px]">₹{leak.revenueAtRisk.toLocaleString()} At Risk</p>
                  </div>
                  <span className="bg-canvas border border-hairline px-3 py-1 rounded-full text-[12px] font-bold text-ink-muted">
                    {leak.confidence}% Confidence
                  </span>
                </div>
                
                <div className="bg-canvas rounded p-3 mb-4 border border-hairline">
                  <p className="text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-2">Recommendation Provenance</p>
                  <ul className="flex flex-col gap-1">
                    {leak.evidence.map((ev: string, i: number) => (
                      <li key={i} className="text-[13px] text-ink flex items-start gap-2">
                        <span className="text-primary font-bold">Source {i+1}:</span> {ev}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-between items-center mt-2 pt-4 border-t border-hairline">
                  <div>
                    <p className="text-[11px] font-bold text-ink-muted uppercase">Recommended Action</p>
                    <p className="text-[14px] font-medium text-ink">{leak.recommendedAction}</p>
                  </div>
                  <button className="bg-ink text-canvas px-4 py-2 rounded-md text-[13px] font-bold flex items-center gap-2 hover:bg-ink-muted transition-colors">
                    Launch
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* OPPORTUNITY ENGINE */}
        <div>
          <h2 className="text-[18px] font-bold text-ink mb-4 flex items-center gap-2 border-b border-hairline pb-2">
            <GraphUp className="text-success" /> Revenue Opportunity Engine
          </h2>
          <div className="flex flex-col gap-4">
            {opportunities.map((opp, idx) => (
              <div key={idx} className="bg-canvas-soft border border-hairline rounded-lg p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-ink text-[16px]">{opp.opportunity}</h3>
                    <p className="text-success font-medium text-[14px]">₹{opp.potentialRevenue.toLocaleString()} Potential</p>
                  </div>
                  <span className="bg-canvas border border-hairline px-3 py-1 rounded-full text-[12px] font-bold text-ink-muted">
                    {opp.confidence}% Confidence
                  </span>
                </div>
                
                <div className="bg-canvas rounded p-3 mb-4 border border-hairline">
                  <p className="text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-2">Recommendation Provenance</p>
                  <ul className="flex flex-col gap-1">
                    {opp.reasoning.map((reason: string, i: number) => (
                      <li key={i} className="text-[13px] text-ink flex items-start gap-2">
                        <span className="text-primary font-bold">Source {i+1}:</span> {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-between items-center mt-2 pt-4 border-t border-hairline">
                  <button 
                    onClick={() => runSimulation(opp.opportunity)}
                    disabled={isSimulating}
                    className="bg-canvas border border-hairline px-4 py-2 rounded-md text-[13px] font-bold flex items-center gap-2 hover:bg-canvas-soft transition-colors disabled:opacity-50"
                  >
                    <Spark height={16} width={16} /> Simulate Multi-Scenario
                  </button>
                  <button className="bg-primary text-white px-4 py-2 rounded-md text-[13px] font-bold flex items-center gap-2 hover:bg-primary-soft transition-colors">
                    Execute <ArrowRight height={16} width={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SIMULATOR HUD */}
      {simResults && (
        <div className="bg-canvas-soft border border-hairline rounded-lg p-6 shadow-sm mb-12">
          <h2 className="text-[20px] font-bold text-ink mb-2 flex items-center gap-2">
            <Flash className="text-warning" /> Multi-Scenario Decision Simulator
          </h2>
          <p className="text-[14px] text-ink-muted mb-6">Evaluating multiple execution paths based on historical memory ranking.</p>

          <div className="grid grid-cols-3 gap-6">
            {simResults.scenarios.map((scenario: any, idx: number) => {
              const isBest = scenario.scenarioName === simResults.bestOption;
              return (
                <div key={idx} className={clsx(
                  "border rounded-lg p-5 relative",
                  isBest ? "border-primary bg-primary/5 shadow-md" : "border-hairline bg-canvas"
                )}>
                  {isBest && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      Best Option
                    </div>
                  )}
                  <h3 className="font-bold text-[16px] text-ink mb-4">{scenario.scenarioName}</h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center border-b border-hairline pb-2">
                      <span className="text-[13px] text-ink-muted">Expected Revenue</span>
                      <span className="font-bold text-ink">₹{Math.round(scenario.expectedRevenue).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-hairline pb-2">
                      <span className="text-[13px] text-ink-muted">Expected Profit</span>
                      <span className={clsx("font-bold", isBest ? "text-success" : "text-ink")}>
                        ₹{Math.round(scenario.expectedProfit).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-2">
                      <span className="text-[13px] text-ink-muted">Conversion Rate</span>
                      <span className="font-bold text-ink">{scenario.expectedConversion.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-hairline">
                    <p className="text-[11px] font-bold text-ink-muted uppercase mb-2">Memory Provenance</p>
                    <ul className="text-[12px] text-ink-muted list-disc pl-4">
                      {scenario.reasoning.map((r: string, i: number) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
