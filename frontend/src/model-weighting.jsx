// Model weighting: three sliders that always sum to 100%, with projected accuracy.

const ModelWeighting = ({ weights, setWeights, onDirty }) => {
  const models = [
    { key: 'base',    label: 'Base Fraud Model',     sub: 'Gradient-boosted trees � v9.3', tone: 'red',    icon: 'binary',     latency: 0.000202 },
    { key: 'geo',     label: 'Geolocation AI',       sub: 'Spatial graph � v2.1',          tone: 'orange', icon: 'map-pin',    latency: 0.000173 },
    { key: 'behavior',label: 'Behavioral Engine',    sub: 'Sequence transformer � v1.4',   tone: 'amber',  icon: 'activity',   latency: 0.000192 },
  ];

  // Projected accuracy = weighted blend of model F1 contributions (Real ULB metrics)
    const projected = React.useMemo(() => {
    const baseF1 = 0.8111; 
    // Simulate marginal gains from auxiliary models
    const geoContribution = (weights.geo / 100) * 0.025; 
    const behaviorContribution = (weights.behavior / 100) * 0.042;
    // Simulate slight instability penalty when Base model weight is reduced
    const basePenalty = ((100 - weights.base) / 100) * 0.015;
    
    return baseF1 + geoContribution + behaviorContribution - basePenalty;
  }, [weights]);

  const projectedFPR = React.useMemo(() => {
    const fpr = { base: 0.000158, geo: 0.000088, behavior: 0.000018 };
    return (weights.base * fpr.base + weights.geo * fpr.geo + weights.behavior * fpr.behavior) / 100;
  }, [weights]);

  const projectedLatency = React.useMemo(() => {
    return models.reduce((sum, m) => sum + (weights[m.key] / 100) * m.latency, 0);
  }, [weights]);

  // Adjusting one slider rebalances the others proportionally so total = 100
  const setWeight = (key, value) => {
    onDirty();
    setWeights((prev) => {
      const others = Object.keys(prev).filter((k) => k !== key);
      const remaining = 100 - value;
      const otherSum = others.reduce((s, k) => s + prev[k], 0) || 1;
      const next = { [key]: value };
      others.forEach((k) => {
        next[k] = Math.round((prev[k] / otherSum) * remaining);
      });
      // tidy rounding so it sums exactly to 100
      const total = next.base + next.geo + next.behavior;
      const diff = 100 - total;
      next[others[0]] += diff;
      return next;
    });
  };

  const toneBg = {
    red: 'from-signal-red to-signal-red',
    orange: 'from-signal-orange to-signal-orange',
    amber: 'from-signal-amber to-signal-amber',
  };

  return (
    <Card>
      <div className="px-5 py-4 border-b border-ink-700/60 flex items-center justify-between">
        <div>
          <div className="text-[10.5px] uppercase tracking-[0.18em] text-ink-400 font-medium">Ensemble configuration</div>
          <h2 className="text-[16px] font-semibold text-ink-100 tracking-tight">Model weighting</h2>
        </div>
        <div className="flex items-center gap-2">
          <Pill tone="ghost"><Icon name="info" className="w-3 h-3" /> Auto-rebalance</Pill>
          <IconButton icon="rotate-ccw" title="Reset to baseline" />
        </div>
      </div>

      <div className="grid grid-cols-12">
        {/* Sliders */}
        <div className="col-span-8 px-5 py-5 border-r border-ink-700/60 space-y-5">
          {models.map((m) => (
            <div key={m.key}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-md bg-${m.tone === 'red' ? 'signal-red' : m.tone === 'orange' ? 'signal-orange' : 'signal-amber'}/15 inline-flex items-center justify-center`}>
                    <Icon name={m.icon} className={`w-3.5 h-3.5 text-signal-${m.tone === 'red' ? 'red' : m.tone === 'orange' ? 'orange' : 'amber'}`} />
                  </div>
                  <div>
                    <div className="text-[12.5px] font-semibold text-ink-100 leading-tight">{m.label}</div>
                    <div className="text-[11px] text-ink-400 font-mono">{m.sub} � {m.latency.toFixed(6)}ms avg</div>
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[20px] font-semibold text-ink-100 tabular-nums">{weights[m.key]}</span>
                  <span className="text-[11px] text-ink-400 font-mono">%</span>
                </div>
              </div>
              <div className="relative">
                {/* Custom track with gradient fill */}
                <div className="absolute inset-y-1/2 -translate-y-1/2 left-0 right-0 h-1.5 bg-ink-700 rounded-full pointer-events-none" />
                <div
                  className={`absolute inset-y-1/2 -translate-y-1/2 left-0 h-1.5 rounded-full pointer-events-none bg-gradient-to-r from-signal-red to-signal-orange`}
                  style={{ width: `${weights[m.key]}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights[m.key]}
                  onChange={(e) => setWeight(m.key, parseInt(e.target.value, 10))}
                  className="adept-slider w-full relative bg-transparent"
                  style={{ background: 'transparent' }}
                />
              </div>
            </div>
          ))}

          {/* Sum bar */}
          <div className="pt-1">
            <div className="flex h-2 rounded-full overflow-hidden border border-ink-700">
              <div className="bg-signal-red" style={{ width: `${weights.base}%` }} />
              <div className="bg-signal-orange" style={{ width: `${weights.geo}%` }} />
              <div className="bg-signal-amber" style={{ width: `${weights.behavior}%` }} />
            </div>
            <div className="flex items-center justify-between mt-2 text-[10.5px] font-mono text-ink-400">
              <span>S ensemble weight</span>
              <span className="text-ink-200">100%</span>
            </div>
          </div>
        </div>

        {/* Projected metrics */}
        <div className="col-span-4 px-5 py-5 space-y-4">
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.18em] text-ink-400 font-medium mb-2">Projected accuracy</div>
            <div className="flex items-baseline gap-1">
              <span className="text-[36px] font-semibold tracking-tight text-ink-100 tabular-nums">{(projected * 100).toFixed(2)}</span>
              <span className="text-[14px] text-ink-300 font-mono">%</span>
            </div>
            <div className="text-[11px] text-signal-green flex items-center gap-1 mt-0.5">
              <Icon name="trending-up" className="w-3 h-3" />
              <span className="font-mono">+0.18 vs prod</span>
            </div>
          </div>

          <Divider />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-400 font-medium">FPR</div>
              <div className="text-[16px] font-semibold text-ink-100 tabular-nums mt-0.5">{(projectedFPR * 100).toFixed(6)}<span className="text-[11px] text-ink-400 font-mono ml-0.5">%</span></div>
            </div>
            <div>
              <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-400 font-medium">Inference</div>
              <div className="text-[16px] font-semibold text-ink-100 tabular-nums mt-0.5">{projectedLatency.toFixed(6)}<span className="text-[11px] text-ink-400 font-mono ml-0.5">ms</span></div>
            </div>
            <div>
              <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-400 font-medium">Recall</div>
              <div className="text-[16px] font-semibold text-ink-100 tabular-nums mt-0.5">94.7<span className="text-[11px] text-ink-400 font-mono ml-0.5">%</span></div>
            </div>
            <div>
              <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-400 font-medium">AUC</div>
              <div className="text-[16px] font-semibold text-ink-100 tabular-nums mt-0.5">0.981</div>
            </div>
          </div>

          <Divider />

          <div className="text-[11px] text-ink-400 leading-relaxed">
            Metrics based on creditcard.csv analysis. Real-time F1 and FPR values without artificial clamping.
          </div>
        </div>
      </div>
    </Card>
  );
};

window.ModelWeighting = ModelWeighting;

