import React, { useState, useEffect } from 'react';
import { Card, Divider, Icon } from './primitives';

// Right sidebar: Latency budget breakdown + Accuracy/Latency trade-off chart + live throughput.

const LatencyBar = ({ label, ms, budget, tone, sub }) => {
  const pct = Math.min(100, (ms / budget) * 100);
  const over = ms > budget;
  const toneClass = tone === 'red' ? 'bg-signal-red' : tone === 'orange' ? 'bg-signal-orange' : tone === 'amber' ? 'bg-signal-amber' : 'bg-signal-green';
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${toneClass}`} />
          <span className="text-[11.5px] text-ink-100 font-medium">{label}</span>
          <span className="text-[10.5px] text-ink-400">{sub}</span>
        </div>
        <div className="text-[11px] font-mono">
          <span className={over ? 'text-signal-red' : 'text-ink-100'}>{ms.toFixed(1)}</span>
          <span className="text-ink-500"> / {budget}ms</span>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-ink-700 overflow-hidden">
        <div className={`h-full ${toneClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

// Tiny SVG scatter for accuracy vs latency trade-off
const TradeoffChart = ({ currentAcc, currentLat }) => {
  // Pareto frontier of historical configs
  const points = [
    { acc: 0.962, lat: 32, label: 'A' },
    { acc: 0.971, lat: 48, label: 'B' },
    { acc: 0.948, lat: 22, label: 'C' },
    { acc: 0.978, lat: 62, label: 'D' },
    { acc: 0.955, lat: 28, label: 'E' },
    { acc: 0.967, lat: 41, label: 'F' },
    { acc: 0.974, lat: 55, label: 'G' },
  ];
  const W = 280, H = 130, P = 18;
  const xMin = 0, xMax = 100; // Scaled for wider visibility
  const yMin = 0, yMax = 1.0;  // Real-world range
  const x = (lat) => P + ((lat - xMin) / (xMax - xMin)) * (W - P * 2);
  const y = (acc) => H - P - ((acc - yMin) / (yMax - yMin)) * (H - P * 2);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <line key="h1" x1={P} x2={W - P} y1={P} y2={P} stroke="#27272C" strokeDasharray="2 3" />
      <line key="h2" x1={P} x2={W - P} y1={P + (H - P * 2) / 2} y2={P + (H - P * 2) / 2} stroke="#27272C" strokeDasharray="2 3" />
      <text x={P} y={H - 2} fill="#6B6B75" fontSize="9" fontFamily="JetBrains Mono">latency ?</text>
      <text x={P} y={10} fill="#6B6B75" fontSize="9" fontFamily="JetBrains Mono">accuracy</text>
      <line x1={x(50)} x2={x(50)} y1={P} y2={H - P} stroke="#EB001B" strokeOpacity="0.4" strokeDasharray="3 3" />
      <text x={x(50) + 3} y={P + 8} fill="#EB001B" fontSize="9" fontFamily="JetBrains Mono">SLA 50ms</text>
      {points.map((p) => (
        <circle key={p.label} cx={x(p.lat)} cy={y(p.acc)} r="3" fill="#34343A" />
      ))}
      {/* Current point with pulse */}
      <circle cx={x(Math.max(xMin, Math.min(xMax, currentLat)))} cy={y(Math.max(yMin, Math.min(yMax, currentAcc)))} r="6" fill="#FF5F00" />
      <circle cx={x(Math.max(xMin, Math.min(xMax, currentLat)))} cy={y(Math.max(yMin, Math.min(yMax, currentAcc)))} r="11" fill="none" stroke="#FF5F00" strokeOpacity="0.4" />
      <text x={x(Math.max(xMin, Math.min(xMax, currentLat))) + 12} y={y(Math.max(yMin, Math.min(yMax, currentAcc))) - 8} fill="#FFFFFF" fontSize="10" fontFamily="JetBrains Mono" fontWeight="600">CURRENT</text>
    </svg>
  );
};

const Sparkline = ({ data, color = '#FF5F00' }) => {
  const W = 100, H = 28;
  const max = Math.max(...data), min = Math.min(...data);
  const path = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / (max - min || 1)) * H;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-7">
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
};

export const LatencyMonitor = ({ weights, projectedAcc, projectedLat }) => {
  const [tick, setTick] = React.useState(0);
  const [series, setSeries] = React.useState(() => Array.from({ length: 24 }, () => 12 + Math.random() * 5));
  React.useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
      setSeries((s) => [...s.slice(1), 12 + Math.random() * 5]);
    }, 1500);
    return () => clearInterval(id);
  }, []);

  const t1 = 3.2 + Math.sin(tick / 3) * 0.6;
  const t2 = projectedLat;
  const network = 11.4;
  const total = t1 + t2 + network;
  const totalBudget = 100;

  return (
    <div className="space-y-4">
      <Card>
        <div className="px-4 py-3.5 border-b border-ink-700/60 flex items-center justify-between">
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.18em] text-ink-400 font-medium">Live</div>
            <h3 className="text-[14px] font-semibold text-ink-100 tracking-tight">Latency budget</h3>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[22px] font-semibold tabular-nums text-ink-100">{total.toFixed(1)}</span>
            <span className="text-[10.5px] font-mono text-ink-400">/ {totalBudget}ms</span>
          </div>
        </div>
        <div className="px-4 py-4 space-y-3.5">
          <LatencyBar label="Tier 1" sub="Hard rules" ms={t1} budget={5} tone="green" />
          <LatencyBar label="Tier 2" sub="AI inference" ms={t2} budget={45} tone="orange" />
          <LatencyBar label="Network" sub="Gateway · egress" ms={network} budget={20} tone="amber" />
          <Divider className="my-1" />
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-ink-400">Headroom</span>
            <span className="font-mono text-signal-green">+{(totalBudget - total).toFixed(1)}ms</span>
          </div>
          <div>
            <div className="flex items-center justify-between text-[10.5px] text-ink-400 mb-0.5">
              <span className="font-mono">p99 · last 30s</span>
              <span className="font-mono text-ink-200">{series[series.length-1].toFixed(1)}ms</span>
            </div>
            <Sparkline data={series} />
          </div>
        </div>
      </Card>

      <Card>
        <div className="px-4 py-3.5 border-b border-ink-700/60">
          <div className="text-[10.5px] uppercase tracking-[0.18em] text-ink-400 font-medium">Pareto</div>
          <h3 className="text-[14px] font-semibold text-ink-100 tracking-tight">Accuracy vs. latency</h3>
        </div>
        
        <div className="px-4 pb-4">
          <div className="relative h-40 mt-4 border-l border-b border-ink-700 overflow-hidden bg-ink-900/20">
            <div className="absolute inset-0 px-3 py-3">
              <TradeoffChart currentAcc={projectedAcc} currentLat={total} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 text-[11px]">
            <div className="rounded-md bg-ink-850 border border-ink-700 px-2.5 py-2">
              <div className="text-ink-400 text-[10px] uppercase tracking-wider">Accuracy</div>
              <div className="font-mono text-ink-100 tabular-nums text-[13px] mt-0.5">{(projectedAcc * 100).toFixed(2)}%</div>
            </div>
            <div className="rounded-md bg-ink-850 border border-ink-700 px-2.5 py-2">
              <div className="text-ink-400 text-[10px] uppercase tracking-wider">AI Latency</div>
              <div className="font-mono text-ink-100 tabular-nums text-[13px] mt-0.5">{projectedLat.toFixed(6)}ms</div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="px-4 py-3.5 border-b border-ink-700/60">
          <div className="text-[10.5px] uppercase tracking-[0.18em] text-ink-400 font-medium">Throughput</div>
          <h3 className="text-[14px] font-semibold text-ink-100 tracking-tight">Decisions / sec</h3>
        </div>
        <div className="px-4 py-4 space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-semibold tabular-nums text-ink-100">{(48230 + tick * 14).toLocaleString()}</span>
            <span className="text-[11px] font-mono text-ink-400">tps</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded bg-ink-850 border border-ink-700 px-2 py-1.5">
              <div className="text-[9.5px] text-signal-green uppercase tracking-wider">Approve</div>
              <div className="text-[12.5px] font-mono text-ink-100 mt-0.5">94.1%</div>
            </div>
            <div className="rounded bg-ink-850 border border-ink-700 px-2 py-1.5">
              <div className="text-[9.5px] text-signal-amber uppercase tracking-wider">Step-up</div>
              <div className="text-[12.5px] font-mono text-ink-100 mt-0.5">4.6%</div>
            </div>
            <div className="rounded bg-ink-850 border border-ink-700 px-2 py-1.5">
              <div className="text-[9.5px] text-signal-red uppercase tracking-wider">Decline</div>
              <div className="text-[12.5px] font-mono text-ink-100 mt-0.5">1.3%</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};



