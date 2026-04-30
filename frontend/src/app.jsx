import React, { useState, useMemo } from 'react';
import { Header } from './header';
import { StrategyBuilder } from './strategy-builder';
import { ModelWeighting } from './model-weighting';
import { LatencyMonitor } from './latency-monitor';
import { AuditPanel } from './audit-panel';
import { Card, Icon, Pill, IconButton, Divider } from './primitives';

// App shell: composes Header + main grid (Strategy + Right rail) + Audit panel.

// Extract components from window for global scope reference


const initialRulesApp = [
  {
    id: 'r1', name: 'High-value cross-border step-up', enabled: true, priority: 1,
    conditions: [
      { id: 'tx_amount',    field: 'Transaction.amount',  op: '>', value: '$2,500', icon: 'dollar-sign', tone: 'orange', join: null },
      { id: 'geo_mismatch', field: 'Geo.ipCountry',       op: '≠', value: 'Card.bin.country', icon: 'globe', tone: 'blue', join: 'AND' },
    ],
    action: { id: 'step_up', label: 'Step-up · 3DS2', tone: 'blue', icon: 'shield-check' },
    coverage: 4.8, falsePos: 0.31,
  },
  {
    id: 'r2', name: 'Composite risk hard-decline', enabled: true, priority: 2,
    conditions: [
      { id: 'risk_score', field: 'Risk.compositeScore', op: '≥', value: '0.78', icon: 'shield-alert', tone: 'red', join: null },
      { id: 'velocity',   field: 'Velocity.txPerHour',  op: '>', value: '12',   icon: 'gauge', tone: 'amber', join: 'AND' },
    ],
    action: { id: 'decline', label: 'Decline', tone: 'red', icon: 'ban' },
    coverage: 1.2, falsePos: 0.14,
  },
  {
    id: 'r3', name: 'New-device gambling MCC review', enabled: false, priority: 3,
    conditions: [
      { id: 'mcc',        field: 'Merchant.MCC',       op: 'IN', value: '[5967, 7995]', icon: 'store', tone: 'purple', join: null },
      { id: 'device_new', field: 'Device.firstSeen',   op: '<',  value: '24h', icon: 'smartphone', tone: 'amber', join: 'AND' },
    ],
    action: { id: 'review', label: 'Manual review', tone: 'amber', icon: 'user-search' },
    coverage: 0.6, falsePos: 0.22,
  },
];

export default function App() {
  const [rules, setRules] = React.useState(initialRulesApp);
  const [weights, setWeights] = React.useState({ base: 45, geo: 25, behavior: 30 });
  const [dirty, setDirty] = React.useState(3);
  const [env, setEnv] = React.useState('Sandbox');
  const [toast, setToast] = React.useState(null);

  const onDirty = () => setDirty((d) => d + 1);

    // Projected metrics for the latency monitor (mirrors the math in ModelWeighting)
    const projectedAcc = React.useMemo(() => {
    const baseF1 = 0.8111; 
    // Simulate marginal gains from auxiliary models
    const geoContribution = (weights.geo / 100) * 0.025; 
    const behaviorContribution = (weights.behavior / 100) * 0.042;
    // Simulate slight instability penalty when Base model weight is reduced
    const basePenalty = ((100 - weights.base) / 100) * 0.015;
    
    return baseF1 + geoContribution + behaviorContribution - basePenalty;
  }, [weights]);

    const projectedLat = React.useMemo(() => {
    return (weights.base * 0.000202 + weights.geo * 0.000173 + weights.behavior * 0.000192) / 100;
  }, [weights]);

  const handleDeploy = () => {
    // Since this is a buildless setup, we determine the environment via window.location
    const isLocalhost = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";
    // Replace with your actual Render URL later
    const API_BASE_URL = isLocalhost ? "http://127.0.0.1:8000" : "https://adept-backend-xyz.onrender.com";

    // Example fetch call targeting the backend decision engine
    fetch(`${API_BASE_URL}/v1/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tx: { id: "tx_123", amount: 2600, merchant_name: "Apple Store", merchant_mcc: "5732", ip_country: "US", bin_country: "GB" },
        features: { velocity_tx_per_hour: 5, device_first_seen_hours: 240, risk_composite_score: 0.12 },
        strategy: { weights }
      })
    })
    .then(res => res.json())
    .then(data => console.log("Decision result:", data))
    .catch(err => console.error("Deployment request failed:", err));

    setToast({ kind: 'queued', text: `Deployment queued to ${env} · ${dirty} change${dirty === 1 ? '' : 's'}` });
    setTimeout(() => setToast(null), 3500);
    setDirty(0);
  };

  return (
    <div className="min-h-screen bg-ink-950">
      <Header dirty={dirty} onDeploy={handleDeploy} env={env} setEnv={setEnv} />

      {/* Sub-bar with strategy meta */}
      <div className="border-b border-ink-700/60 bg-ink-900/60 px-5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[12px] text-ink-300">
          <Icon name="layers" className="w-3.5 h-3.5 text-signal-orange" />
          <span className="text-ink-400">Strategy</span>
          <span className="text-ink-100 font-medium">CNP Auth · NA + EU</span>
          <span className="text-ink-700">/</span>
          <span className="font-mono text-[11px] text-ink-400">branch: <span className="text-ink-200">strat/cnp-tighter-velocity</span></span>
          <span className="text-ink-700">/</span>
          <span className="font-mono text-[11px] text-ink-400">based on <span className="text-ink-200">prod@v4.11</span></span>
        </div>
        <div className="flex items-center gap-3 text-[11.5px]">
          <span className="text-ink-400">Owner</span>
          <span className="text-ink-100 font-medium">J. Reyes · Risk Strategy</span>
          <span className="text-ink-700">·</span>
          <span className="text-ink-400">Last edit</span>
          <span className="text-ink-100 font-mono">2m ago</span>
        </div>
      </div>

      <div className="grid-bg">
        <main className="max-w-[1440px] mx-auto px-5 py-5 space-y-4">
          {/* KPI strip */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Decisions / 24h', val: '4.18M', delta: '+3.2%', tone: 'green', icon: 'sigma' },
              { label: 'Approval rate',   val: '94.07%', delta: '−0.04%', tone: 'amber', icon: 'check' },
              { label: 'Fraud caught',    val: '$1.42M', delta: '+$118k', tone: 'green', icon: 'shield-alert' },
              { label: 'Avg. p95 latency', val: '42.1ms', delta: 'within SLA', tone: 'green', icon: 'gauge' },
            ].map((k) => (
              <Card key={k.label} className="px-4 py-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10.5px] uppercase tracking-[0.18em] text-ink-400 font-medium">{k.label}</div>
                    <div className="text-[22px] font-semibold text-ink-100 tabular-nums tracking-tight mt-1">{k.val}</div>
                  </div>
                  <div className="w-7 h-7 rounded-md bg-ink-850 border border-ink-700 inline-flex items-center justify-center">
                    <Icon name={k.icon} className="w-3.5 h-3.5 text-ink-300" />
                  </div>
                </div>
                <div className={`mt-1.5 text-[11px] font-mono ${k.tone === 'green' ? 'text-signal-green' : 'text-signal-amber'}`}>
                  {k.delta}
                </div>
              </Card>
            ))}
          </div>

          {/* Main two-column area */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8 space-y-4">
              <StrategyBuilder rules={rules} setRules={setRules} onRulesDirty={onDirty} />
              <ModelWeighting weights={weights} setWeights={setWeights} onDirty={onDirty} />
            </div>
            <div className="col-span-4">
              <LatencyMonitor weights={weights} projectedAcc={projectedAcc} projectedLat={projectedLat} />
            </div>
          </div>

          {/* Audit panel */}
          <AuditPanel />

          <footer className="pt-2 pb-6 flex items-center justify-between text-[10.5px] font-mono text-ink-500">
            <span>ADEPT runtime v4.12.3 · region: us-east-1, eu-west-1, ap-south-1</span>
            <span>SOC2 · PCI-DSS · ISO 27001 · model card refreshed 14m ago</span>
          </footer>
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-4 py-3 rounded-lg border border-signal-orange/40 bg-ink-900 shadow-card">
          <span className="w-2 h-2 rounded-full bg-signal-orange pulse-dot" />
          <div>
            <div className="text-[12.5px] font-semibold text-ink-100">Deployment queued</div>
            <div className="text-[11px] text-ink-400 font-mono">{toast.text} · awaiting 2/2 approvals</div>
          </div>
        </div>
      )}
    </div>
  );
}







