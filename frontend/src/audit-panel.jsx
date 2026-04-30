import React, { useState } from 'react';
import { Card, Icon, Pill, Tag, IconButton } from './primitives';

// Audit & traceability panel: last 5 transactions with decision path + governance hash.

const TRANSACTIONS = [
  {
    id: 'tx_8H2dN91kQXr', amount: '$3,420.00', merchant: 'NORD/CIRC ONLINE · DK',
    ts: '14:02:11.847', decision: 'STEP-UP', tone: 'blue', icon: 'shield-check',
    risk: 0.74, latency: 41.2,
    path: [
      { step: 'R-001', label: 'High-value cross-border step-up', match: true, ms: 2.1 },
      { step: 'R-002', label: 'Composite risk hard-decline', match: false, ms: 1.4 },
    ],
    why: 'Amount > $2,500 ∧ Geo.ipCountry ≠ Card.bin.country',
    hash: 'a91f6c…03e2',
  },
  {
    id: 'tx_8H2dN91kQXk', amount: '$48.20', merchant: 'BLUE BOTTLE COFFEE · SF',
    ts: '14:02:11.523', decision: 'APPROVE', tone: 'green', icon: 'check',
    risk: 0.04, latency: 18.7,
    path: [
      { step: 'R-001', label: 'High-value cross-border step-up', match: false, ms: 0.8 },
      { step: 'R-002', label: 'Composite risk hard-decline', match: false, ms: 1.1 },
      { step: 'DEFAULT', label: 'Approve fallback', match: true, ms: 0.3 },
    ],
    why: 'No rule matched · default approve',
    hash: 'd33b9a…71fe',
  },
  {
    id: 'tx_8H2dN91kQXh', amount: '$899.99', merchant: 'STEAMGAMES.NET · IE',
    ts: '14:02:11.201', decision: 'DECLINE', tone: 'red', icon: 'ban',
    risk: 0.91, latency: 36.8,
    path: [
      { step: 'R-001', label: 'High-value cross-border step-up', match: false, ms: 1.9 },
      { step: 'R-002', label: 'Composite risk hard-decline', match: true, ms: 2.4 },
    ],
    why: 'Risk.compositeScore ≥ 0.78 ∧ Velocity.txPerHour > 12',
    hash: '5cf188…a209',
  },
  {
    id: 'tx_8H2dN91kQXc', amount: '$210.00', merchant: 'AMAZON DIGITAL · US',
    ts: '14:02:10.997', decision: 'APPROVE', tone: 'green', icon: 'check',
    risk: 0.12, latency: 21.3,
    path: [
      { step: 'R-001', label: 'High-value cross-border step-up', match: false, ms: 0.6 },
      { step: 'R-002', label: 'Composite risk hard-decline', match: false, ms: 1.2 },
      { step: 'DEFAULT', label: 'Approve fallback', match: true, ms: 0.2 },
    ],
    why: 'No rule matched · default approve',
    hash: '0a72ee…4c81',
  },
  {
    id: 'tx_8H2dN91kQX9', amount: '$5,780.00', merchant: 'LUXOR JEWELRY · UAE',
    ts: '14:02:10.612', decision: 'REVIEW', tone: 'amber', icon: 'user-search',
    risk: 0.62, latency: 44.0,
    path: [
      { step: 'R-001', label: 'High-value cross-border step-up', match: true, ms: 2.0 },
    ],
    why: 'Amount > $2,500 ∧ MCC ∈ flagged set · routed to manual queue',
    hash: 'e1740b…9d52',
  },
];

const decisionToneMap = {
  green: { bg: 'bg-signal-green/15', border: 'border-signal-green/30', text: 'text-signal-green' },
  red:   { bg: 'bg-signal-red/15',   border: 'border-signal-red/30',   text: 'text-signal-red' },
  amber: { bg: 'bg-signal-amber/15', border: 'border-signal-amber/30', text: 'text-signal-amber' },
  blue:  { bg: 'bg-signal-blue/15',  border: 'border-signal-blue/30',  text: 'text-signal-blue' },
};

const TraceRow = ({ tx, expanded, onToggle }) => {
  const t = decisionToneMap[tx.tone];
  return (
    <div className={`border-b border-ink-700/60 last:border-b-0 ${expanded ? 'bg-ink-850/60' : ''}`}>
      <button onClick={onToggle} className="w-full grid grid-cols-12 gap-3 items-center px-5 py-3 text-left hover:bg-ink-850/60">
        <div className="col-span-1 font-mono text-[11px] text-ink-400">{tx.ts}</div>
        <div className="col-span-3 font-mono text-[11.5px] text-ink-200 truncate">{tx.id}</div>
        <div className="col-span-1 font-mono text-[11.5px] text-ink-100 tabular-nums">{tx.amount}</div>
        <div className="col-span-3 text-[11.5px] text-ink-300 truncate">{tx.merchant}</div>
        <div className="col-span-1">
          <span className="font-mono text-[11px] text-ink-200 tabular-nums">{tx.risk.toFixed(2)}</span>
        </div>
        <div className="col-span-1 font-mono text-[11px] text-ink-400 tabular-nums">{tx.latency.toFixed(1)}ms</div>
        <div className="col-span-2 flex items-center justify-end gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10.5px] font-semibold ${t.bg} ${t.border} ${t.text}`}>
            <Icon name={tx.icon} className="w-3 h-3" />
            {tx.decision}
          </span>
          <Icon name={expanded ? 'chevron-up' : 'chevron-down'} className="w-3.5 h-3.5 text-ink-400" />
        </div>
      </button>
      {expanded && (
        <div className="px-5 pb-4 pt-1 grid grid-cols-12 gap-4">
          {/* Decision path */}
          <div className="col-span-7">
            <div className="text-[10px] uppercase tracking-[0.16em] text-ink-400 font-medium mb-2">Decision path</div>
            <div className="space-y-1.5">
              {tx.path.map((p, i) => (
                <div key={i} className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md border ${p.match ? 'bg-signal-orange/10 border-signal-orange/30' : 'bg-ink-900 border-ink-700/70'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${p.match ? 'bg-signal-orange' : 'bg-ink-500'}`} />
                  <span className="font-mono text-[10.5px] text-ink-300 w-16">{p.step}</span>
                  <span className="text-[11.5px] text-ink-100 flex-1 truncate">{p.label}</span>
                  <span className="font-mono text-[10.5px] text-ink-400">{p.ms.toFixed(1)}ms</span>
                  {p.match ? (
                    <Tag tone="orange" mono>MATCH</Tag>
                  ) : (
                    <Tag tone="neutral" mono>SKIP</Tag>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 text-[11.5px] text-ink-300">
              <span className="text-[10px] uppercase tracking-[0.16em] text-ink-400 font-medium mr-2">Why</span>
              <span className="font-mono">{tx.why}</span>
            </div>
          </div>

          {/* Governance hash */}
          <div className="col-span-5">
            <div className="text-[10px] uppercase tracking-[0.16em] text-ink-400 font-medium mb-2">Governance log · SHA-256</div>
            <div className="rounded-md border border-ink-700 bg-ink-900 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Icon name="lock" className="w-3.5 h-3.5 text-signal-green" />
                <span className="text-[11px] text-ink-300">Sealed · immutable ledger</span>
                <Tag tone="green" mono className="ml-auto">VERIFIED</Tag>
              </div>
              <div className="font-mono text-[10.5px] text-ink-200 leading-relaxed break-all">
                {makeFullHash(tx.id)}
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-ink-700/60">
                <span className="font-mono text-[10px] text-ink-400">block #{4_182_910 + Math.floor(Math.random() * 99)}</span>
                <button className="inline-flex items-center gap-1 text-[10.5px] text-ink-300 hover:text-ink-100">
                  <Icon name="external-link" className="w-3 h-3" /> View on ledger
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function makeFullHash(seed) {
  // deterministic-ish pseudo-hash — xorshift32 + sample high bits for proper hex distribution
  const chars = '0123456789abcdef';
  let s = '';
  let n = 0x9e3779b9;
  for (let i = 0; i < seed.length; i++) {
    n = (n ^ seed.charCodeAt(i)) >>> 0;
    n = Math.imul(n, 0x85ebca6b) >>> 0;
  }
  for (let i = 0; i < 64; i++) {
    n ^= n << 13; n >>>= 0;
    n ^= n >>> 17;
    n ^= n << 5; n >>>= 0;
    s += chars[(n >>> 28) & 0xf];
  }
  return s;
}

export const AuditPanel = () => {
  const [openId, setOpenId] = React.useState(TRANSACTIONS[0].id);
  const [tab, setTab] = React.useState('trace');

  return (
    <Card>
      <div className="px-5 py-3.5 border-b border-ink-700/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.18em] text-ink-400 font-medium">Audit · last 5 minutes</div>
            <h2 className="text-[15px] font-semibold text-ink-100 tracking-tight">Decision path trace</h2>
          </div>
          <div className="flex rounded-md border border-ink-700 bg-ink-850 p-0.5 text-[11px] ml-2">
            {[['trace','Trace'],['decline','Declines'],['stepup','Step-ups'],['flagged','Flagged']].map(([k, l]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`px-2 py-1 rounded ${tab === k ? 'bg-ink-700 text-ink-100' : 'text-ink-400 hover:text-ink-200'}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Pill tone="green"><span className="w-1.5 h-1.5 rounded-full bg-signal-green pulse-dot" /> Streaming</Pill>
          <IconButton icon="filter" title="Filter" />
          <IconButton icon="download" title="Export" />
        </div>
      </div>

      {/* column headers */}
      <div className="grid grid-cols-12 gap-3 px-5 py-2 border-b border-ink-700/60 bg-ink-850/40 text-[10px] uppercase tracking-[0.14em] text-ink-400 font-semibold">
        <div className="col-span-1">Time</div>
        <div className="col-span-3">Transaction</div>
        <div className="col-span-1">Amount</div>
        <div className="col-span-3">Merchant</div>
        <div className="col-span-1">Risk</div>
        <div className="col-span-1">Latency</div>
        <div className="col-span-2 text-right">Decision</div>
      </div>

      <div>
        {TRANSACTIONS.map((tx) => (
          <TraceRow
            key={tx.id}
            tx={tx}
            expanded={openId === tx.id}
            onToggle={() => setOpenId(openId === tx.id ? null : tx.id)}
          />
        ))}
      </div>

      <div className="px-5 py-2.5 border-t border-ink-700/60 flex items-center justify-between text-[10.5px] text-ink-400 font-mono">
        <span>Showing 5 of 24,182 in window</span>
        <span>Hash chain integrity · <span className="text-signal-green">OK</span> · last verified 2s ago</span>
      </div>
    </Card>
  );
};



