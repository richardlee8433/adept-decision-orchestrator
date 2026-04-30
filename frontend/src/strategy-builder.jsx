import React, { useState } from 'react';
import { Card, Pill, IconButton, Button, Divider, Icon } from './primitives';

// Visual rule-chain: each rule is "IF [conditions] THEN [action]" with chained AND/OR logic.

const CONDITION_TEMPLATES = [
  { id: 'tx_amount',  field: 'Transaction.amount',     op: '>',     value: '$2,500',     icon: 'dollar-sign', tone: 'orange' },
  { id: 'risk_score', field: 'Risk.compositeScore',    op: '≥',     value: '0.78',       icon: 'shield-alert', tone: 'red' },
  { id: 'velocity',   field: 'Velocity.txPerHour',     op: '>',     value: '12',         icon: 'gauge',       tone: 'amber' },
  { id: 'geo_mismatch', field: 'Geo.ipCountry',         op: '≠',     value: 'Card.bin.country', icon: 'globe', tone: 'blue' },
  { id: 'mcc',        field: 'Merchant.MCC',           op: 'IN',    value: '[5967, 7995]', icon: 'store',     tone: 'purple' },
  { id: 'device_new', field: 'Device.firstSeen',       op: '<',     value: '24h',        icon: 'smartphone',  tone: 'amber' },
];

const ACTIONS = [
  { id: 'approve',  label: 'Approve',          tone: 'green',  icon: 'check' },
  { id: 'step_up',  label: 'Step-up · 3DS2',   tone: 'blue',   icon: 'shield-check' },
  { id: 'review',   label: 'Manual review',    tone: 'amber',  icon: 'user-search' },
  { id: 'decline',  label: 'Decline',          tone: 'red',    icon: 'ban' },
];

const initialRules = [
  {
    id: 'r1',
    name: 'High-value cross-border step-up',
    enabled: true,
    priority: 1,
    conditions: [
      { ...CONDITION_TEMPLATES[0], join: null },
      { ...CONDITION_TEMPLATES[3], join: 'AND' },
    ],
    action: ACTIONS[1],
    coverage: 4.8,
    falsePos: 0.31,
  },
  {
    id: 'r2',
    name: 'Composite risk hard-decline',
    enabled: true,
    priority: 2,
    conditions: [
      { ...CONDITION_TEMPLATES[1], join: null },
      { ...CONDITION_TEMPLATES[2], join: 'AND' },
    ],
    action: ACTIONS[3],
    coverage: 1.2,
    falsePos: 0.14,
  },
  {
    id: 'r3',
    name: 'New-device gambling MCC review',
    enabled: false,
    priority: 3,
    conditions: [
      { ...CONDITION_TEMPLATES[4], join: null },
      { ...CONDITION_TEMPLATES[5], join: 'AND' },
    ],
    action: ACTIONS[2],
    coverage: 0.6,
    falsePos: 0.22,
  },
];

const Condition = ({ c, onRemove }) => (
  <div className="group flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-ink-850 border border-ink-700/80 hover:border-ink-600">
    <Icon name={c.icon} className="w-3.5 h-3.5 text-ink-300" />
    <span className="font-mono text-[11.5px] text-ink-100">{c.field}</span>
    <span className="font-mono text-[11px] text-signal-orange">{c.op}</span>
    <span className="font-mono text-[11.5px] text-ink-100">{c.value}</span>
    <button
      onClick={onRemove}
      className="ml-1 opacity-0 group-hover:opacity-100 text-ink-400 hover:text-signal-red"
    >
      <Icon name="x" className="w-3 h-3" />
    </button>
  </div>
);

const RuleCard = ({ rule, onToggle, onRemove, onAddCondition, onChangeAction, dragHandlers }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [actionOpen, setActionOpen] = React.useState(false);

  return (
    <div
      className="relative bg-ink-900 border border-ink-700/70 rounded-xl shadow-card overflow-hidden"
      {...dragHandlers}
    >
      {/* Left priority spine */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${rule.enabled ? 'bg-gradient-to-b from-signal-red to-signal-orange' : 'bg-ink-700'}`} />

      <div className="px-4 py-3 flex items-center justify-between border-b border-ink-700/60">
        <div className="flex items-center gap-3">
          <button className="text-ink-500 hover:text-ink-200 cursor-grab" title="Drag to reorder">
            <Icon name="grip-vertical" className="w-3.5 h-3.5" />
          </button>
          <div className="font-mono text-[10.5px] text-ink-400">R-{String(rule.priority).padStart(3, '0')}</div>
          <div className="text-[13px] font-semibold text-ink-100 tracking-tight">{rule.name}</div>
          {rule.enabled ? (
            <Pill tone="green"><span className="w-1.5 h-1.5 rounded-full bg-signal-green" />Active</Pill>
          ) : (
            <Pill tone="ghost">Disabled</Pill>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3 text-[11px] text-ink-400 font-mono">
            <span>Coverage <span className="text-ink-100">{rule.coverage.toFixed(1)}%</span></span>
            <span className="text-ink-700">|</span>
            <span>FPR <span className="text-ink-100">{rule.falsePos.toFixed(2)}%</span></span>
          </div>
          <Switch on={rule.enabled} onChange={() => onToggle(rule.id)} label="" />
          <div className="relative">
            <IconButton icon="more-horizontal" onClick={() => setMenuOpen((o) => !o)} />
            {menuOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-ink-850 border border-ink-700 rounded-md shadow-card text-[12px] z-20">
                <button className="w-full text-left px-3 py-2 hover:bg-ink-800 text-ink-200">Duplicate rule</button>
                <button className="w-full text-left px-3 py-2 hover:bg-ink-800 text-ink-200">Run shadow test</button>
                <button className="w-full text-left px-3 py-2 hover:bg-ink-800 text-ink-200">View history</button>
                <div className="h-px bg-ink-700" />
                <button onClick={() => { setMenuOpen(false); onRemove(rule.id); }} className="w-full text-left px-3 py-2 hover:bg-signal-red/15 text-signal-red">Delete</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body: IF / THEN */}
      <div className="px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="w-9 pt-1.5 text-[10px] uppercase tracking-[0.18em] text-ink-400 font-semibold">IF</div>
          <div className="flex-1 flex flex-wrap items-center gap-1.5">
            {rule.conditions.map((c, i) => (
              <React.Fragment key={c.id + i}>
                {c.join && (
                  <span className="font-mono text-[10px] text-ink-400 px-1.5 py-0.5 rounded bg-ink-850 border border-ink-700">
                    {c.join}
                  </span>
                )}
                <Condition c={c} onRemove={() => {}} />
              </React.Fragment>
            ))}
            <button
              onClick={() => onAddCondition(rule.id)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-dashed border-ink-600 text-ink-400 hover:text-ink-100 hover:border-ink-500 text-[11.5px]"
            >
              <Icon name="plus" className="w-3 h-3" /> condition
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 my-2 ml-9">
          <div className="arrow-down h-4" />
        </div>

        <div className="flex items-start gap-3">
          <div className="w-9 pt-1.5 text-[10px] uppercase tracking-[0.18em] text-ink-400 font-semibold">THEN</div>
          <div className="relative">
            <button
              onClick={() => setActionOpen((o) => !o)}
              className={`inline-flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-md border text-[12px] font-semibold ${
                rule.action.tone === 'red' ? 'bg-signal-red/15 border-signal-red/30 text-signal-red' :
                rule.action.tone === 'green' ? 'bg-signal-green/15 border-signal-green/30 text-signal-green' :
                rule.action.tone === 'amber' ? 'bg-signal-amber/15 border-signal-amber/30 text-signal-amber' :
                'bg-signal-blue/15 border-signal-blue/30 text-signal-blue'
              }`}
            >
              <Icon name={rule.action.icon} className="w-3.5 h-3.5" />
              {rule.action.label}
              <Icon name="chevron-down" className="w-3 h-3 opacity-70" />
            </button>
            {actionOpen && (
              <div className="absolute mt-1 w-52 bg-ink-850 border border-ink-700 rounded-md shadow-card text-[12px] z-20">
                {ACTIONS.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => { onChangeAction(rule.id, a); setActionOpen(false); }}
                    className="w-full text-left px-3 py-2 hover:bg-ink-800 text-ink-200 flex items-center gap-2"
                  >
                    <Icon name={a.icon} className="w-3.5 h-3.5" />
                    {a.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-1.5 text-[11px] text-ink-400">
            <Icon name="zap" className="w-3 h-3 text-signal-amber" />
            <span className="font-mono">est. <span className="text-ink-100">2.{rule.priority}ms</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const StrategyBuilder = ({ rules, setRules, onRulesDirty }) => {
  const [filter, setFilter] = React.useState('all');

  const updateRules = (updater) => {
    setRules((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      onRulesDirty();
      return next;
    });
  };

  const toggle = (id) => updateRules((r) => r.map((x) => (x.id === id ? { ...x, enabled: !x.enabled } : x)));
  const remove = (id) => updateRules((r) => r.filter((x) => x.id !== id));
  const addCondition = (id) => updateRules((r) =>
    r.map((x) => x.id === id
      ? { ...x, conditions: [...x.conditions, { ...CONDITION_TEMPLATES[Math.floor(Math.random() * CONDITION_TEMPLATES.length)], join: 'AND' }] }
      : x)
  );
  const changeAction = (id, action) => updateRules((r) => r.map((x) => (x.id === id ? { ...x, action } : x)));

  const addRule = () => {
    const id = 'r' + (rules.length + 1) + '_' + Date.now().toString(36);
    const newRule = {
      id,
      name: 'Untitled rule',
      enabled: true,
      priority: rules.length + 1,
      conditions: [{ ...CONDITION_TEMPLATES[0], join: null }],
      action: ACTIONS[1],
      coverage: 0.0,
      falsePos: 0.0,
    };
    updateRules((r) => [...r, newRule]);
  };

  const filtered = rules.filter((r) => filter === 'all' || (filter === 'active' ? r.enabled : !r.enabled));

  return (
    <Card className="overflow-hidden">
      {/* header */}
      <div className="px-5 py-4 border-b border-ink-700/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.18em] text-ink-400 font-medium">Decision graph</div>
            <h2 className="text-[16px] font-semibold text-ink-100 tracking-tight">Strategy: <span className="text-ink-100">CNP-Auth · v4.12</span></h2>
          </div>
          <Pill tone="amber">
            <Icon name="git-branch" className="w-3 h-3" /> 3 uncommitted edits
          </Pill>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-ink-700 bg-ink-850 p-0.5 text-[11px]">
            {[['all','All'],['active','Active'],['off','Disabled']].map(([k, l]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`px-2 py-1 rounded ${filter === k ? 'bg-ink-700 text-ink-100' : 'text-ink-400 hover:text-ink-200'}`}
              >
                {l}
              </button>
            ))}
          </div>
          <IconButton icon="play" title="Shadow test" />
          <IconButton icon="git-pull-request" title="Open PR" />
          <button
            onClick={addRule}
            className="inline-flex items-center gap-1.5 px-2.5 h-8 rounded-md border border-ink-700 bg-ink-850 hover:bg-ink-800 text-[12px] text-ink-100"
          >
            <Icon name="plus" className="w-3.5 h-3.5" /> New rule
          </button>
        </div>
      </div>

      {/* Entry node */}
      <div className="px-5 pt-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-ink-700 bg-ink-850 stripe-bg">
            <div className="w-1.5 h-1.5 rounded-full bg-signal-orange" />
            <span className="text-[11px] uppercase tracking-[0.16em] text-ink-300 font-semibold">Inbound · Auth request</span>
            <span className="font-mono text-[11px] text-ink-500">/v1/decision</span>
          </div>
          <div className="flex-1 h-px bg-ink-700/60" />
          <span className="font-mono text-[10.5px] text-ink-500">priority chain · evaluated top-down</span>
        </div>
      </div>

      {/* Rules */}
      <div className="px-5 py-4 space-y-3">
        {filtered.map((rule, i) => (
          <React.Fragment key={rule.id}>
            <RuleCard
              rule={rule}
              onToggle={toggle}
              onRemove={remove}
              onAddCondition={addCondition}
              onChangeAction={changeAction}
            />
            {i < filtered.length - 1 && (
              <div className="flex items-center gap-3 pl-4">
                <div className="arrow-down h-5" />
                <span className="font-mono text-[10px] text-ink-500 tracking-wider">↓ FALL-THROUGH</span>
              </div>
            )}
          </React.Fragment>
        ))}

        {/* Terminal node */}
        <div className="flex items-center gap-3 pl-4 pt-1">
          <div className="arrow-down h-5" />
        </div>
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-ink-700/70 bg-ink-850">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-signal-green/15 border border-signal-green/30 inline-flex items-center justify-center text-signal-green">
              <Icon name="check" className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[12.5px] font-semibold text-ink-100">Default · Approve</div>
              <div className="text-[11px] text-ink-400">Fallback when no rule matches. Covers 92.7% of traffic.</div>
            </div>
          </div>
          <Pill tone="ghost"><Icon name="lock" className="w-3 h-3" /> Locked</Pill>
        </div>
      </div>
    </Card>
  );
};



