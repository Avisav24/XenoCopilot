'use client';

import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { DataTable, Column } from '@/components/ui/DataTable';
import { RightPanel, PanelSection, PanelMetric } from '@/components/ui/RightPanel';
import { Spark, Play, Activity } from 'iconoir-react';

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

  const combinedData = [
    ...leaks.map(l => ({
      type: 'Leak',
      title: l.leakName,
      audience: l.audience,
      impact: l.revenueAtRisk,
      confidence: l.confidence,
      action: l.recommendedAction,
      urgency: 'High'
    })),
    ...opportunities.map(o => ({
      type: 'Opportunity',
      title: o.opportunity,
      audience: o.audience,
      impact: o.potentialRevenue,
      confidence: o.confidence,
      action: o.action || 'Launch Campaign',
      urgency: 'Medium'
    }))
  ];

  const columns: Column<any>[] = [
    { key: 'title', label: 'Initiative' },
    { key: 'type', label: 'Type', render: (item) => (
      <span className={clsx(
        "px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider",
        item.type === 'Leak' ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
      )}>{item.type}</span>
    )},
    { key: 'audience', label: 'Audience', render: (item) => `${item.audience} Users` },
    { key: 'impact', label: 'Revenue Impact', render: (item) => `₹${item.impact.toLocaleString()}` },
    { key: 'confidence', label: 'Confidence', render: (item) => `${item.confidence}%` },
    { key: 'action', label: 'Recommended Action' },
    { key: 'launch', label: '', render: (item) => (
      <button 
        onClick={() => runSimulation(item.title)}
        className="text-[12px] font-semibold text-primary hover:text-primary-press transition-colors"
      >
        Simulate
      </button>
    )}
  ];

  const topImpact = combinedData.reduce((acc, curr) => curr.impact > acc.impact ? curr : acc, { impact: 0 } as any);
  const totalLeak = leaks.reduce((sum, l) => sum + l.revenueAtRisk, 0);
  const totalOpp = opportunities.reduce((sum, o) => sum + o.potentialRevenue, 0);

  return (
    <div className="flex w-full h-full">
      {/* Main Workspace */}
      <div className="flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="max-w-[1000px] mx-auto">
          
          <div className="mb-10">
            <h1 className="mb-2">Revenue Command Center</h1>
            <p className="italic text-ink-muted">"XenoCopilot does not optimize campaigns. XenoCopilot optimizes revenue decisions."</p>
          </div>

          {/* Revenue Brief */}
          <div className="mb-12 border-l-2 border-primary pl-5">
            <h2 className="text-[16px] font-semibold text-ink mb-4 uppercase tracking-wider">Revenue Brief</h2>
            <div className="grid grid-cols-4 gap-6">
              <div>
                <span className="block text-[12px] text-ink-muted mb-1">Revenue At Risk</span>
                <span className="block text-[20px] font-semibold text-danger">₹{totalLeak.toLocaleString()}</span>
              </div>
              <div>
                <span className="block text-[12px] text-ink-muted mb-1">Potential Recovery</span>
                <span className="block text-[20px] font-semibold text-success">₹{totalOpp.toLocaleString()}</span>
              </div>
              <div>
                <span className="block text-[12px] text-ink-muted mb-1">Top Opportunity</span>
                <span className="block text-[14px] font-semibold text-ink mt-1 truncate">{topImpact?.title || '-'}</span>
              </div>
              <div>
                <span className="block text-[12px] text-ink-muted mb-1">Recommended Action</span>
                <span className="block text-[14px] font-semibold text-primary mt-1 truncate">{topImpact?.action || '-'}</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-[18px] mb-4">Action Items</h2>
            <DataTable columns={columns} data={combinedData} searchPlaceholder="Search initiatives..." />
          </div>
          
        </div>
      </div>

      {/* Right Context Panel */}
      <RightPanel title="AI Intelligence">
        <PanelSection title="System Accuracy">
          {ledger ? (
            <div className="flex flex-col gap-2 mt-2">
              <PanelMetric label="Model Architecture" value="XenoCopilot v4" />
              <PanelMetric label="Revenue Prediction" value={`${ledger.revenuePredictionAccuracy.toFixed(1)}%`} trend="positive" />
              <PanelMetric label="System Accuracy" value={ledger.systemAccuracy} />
              <PanelMetric label="Predictions Audited" value={ledger.totalPredictionsAudited.toString()} />
            </div>
          ) : (
            <p className="text-ink-muted italic">Connecting to Ledger...</p>
          )}
        </PanelSection>

        {simResults && (
          <PanelSection title="Simulation Results" noBorder>
            <div className="bg-primary/5 border border-primary/20 rounded p-4 mb-4">
              <div className="text-[11px] font-bold text-primary uppercase mb-1">Best Option</div>
              <div className="text-[14px] font-semibold text-ink">{simResults.bestOption}</div>
            </div>
            <div className="flex flex-col gap-4">
              {simResults.scenarios.map((scen: any, idx: number) => (
                <div key={idx} className="border border-hairline rounded p-3 bg-canvas-soft">
                  <div className="font-semibold text-[13px] mb-2">{scen.scenarioName}</div>
                  <PanelMetric label="Expected Revenue" value={`₹${Math.round(scen.expectedRevenue).toLocaleString()}`} />
                  <PanelMetric label="Expected Profit" value={`₹${Math.round(scen.expectedProfit).toLocaleString()}`} trend={scen.scenarioName === simResults.bestOption ? 'positive' : 'neutral'} />
                  <div className="mt-3 text-[12px] text-ink-muted border-t border-hairline pt-2">
                    <span className="font-semibold block mb-1">Memory Provenance:</span>
                    <ul className="list-disc pl-4 space-y-1">
                      {scen.reasoning.map((r: string, i: number) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 bg-ink text-white py-2 rounded text-[13px] font-semibold hover:bg-ink-muted transition-colors flex justify-center items-center gap-2">
              <Play height={14} width={14} /> Execute Best Option
            </button>
          </PanelSection>
        )}
      </RightPanel>
    </div>
  );
}
