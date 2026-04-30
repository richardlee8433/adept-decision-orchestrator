import React from 'react';
import * as LucideIcons from 'lucide-react';

// Small reusable primitives: Card, Pill, Switch, Tag, SectionHeader, Button.

export const Icon = ({ name, size = 18, className, ...props }) => {
  const pascalName = name
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
  const Comp = LucideIcons[pascalName] || LucideIcons[name];
  if (!Comp) return null;
  return <Comp size={size} className={className} {...props} />;
};

export const Card = ({ children, className = '', as: As = 'div', ...rest }) => (
  <As
    className={`bg-ink-900 border border-ink-700/70 rounded-xl shadow-card ${className}`}
    {...rest}
  >
    {children}
  </As>
);

export const Pill = ({ children, tone = 'neutral', className = '' }) => {
  const tones = {
    neutral: 'bg-ink-800 border-ink-700 text-ink-200',
    green: 'bg-signal-green/10 border-signal-green/30 text-signal-green',
    red: 'bg-signal-red/10 border-signal-red/30 text-signal-red',
    orange: 'bg-signal-orange/10 border-signal-orange/30 text-signal-orange',
    amber: 'bg-signal-amber/10 border-signal-amber/30 text-signal-amber',
    blue: 'bg-signal-blue/10 border-signal-blue/30 text-signal-blue',
    ghost: 'bg-transparent border-ink-700 text-ink-300',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full text-[11px] font-medium border ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
};

export const Switch = ({ on, onChange, label, sub }) => (
  <label className="flex items-center gap-3 cursor-pointer select-none">
    <span
      className="adept-switch"
      data-on={on ? 'true' : 'false'}
      onClick={() => onChange(!on)}
    />
    <span className="leading-tight">
      <span className="block text-[12px] text-ink-100">{label}</span>
      {sub && <span className="block text-[11px] text-ink-400">{sub}</span>}
    </span>
  </label>
);

export const Tag = ({ children, tone = 'neutral', mono = false, className = '' }) => {
  const tones = {
    neutral: 'bg-ink-800 text-ink-200 border-ink-700',
    red: 'bg-signal-red/15 text-signal-red border-signal-red/30',
    orange: 'bg-signal-orange/15 text-signal-orange border-signal-orange/30',
    green: 'bg-signal-green/15 text-signal-green border-signal-green/30',
    amber: 'bg-signal-amber/15 text-signal-amber border-signal-amber/30',
    blue: 'bg-signal-blue/15 text-signal-blue border-signal-blue/30',
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10.5px] ${mono ? 'font-mono' : 'font-medium'} ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
};

export const SectionHeader = ({ eyebrow, title, sub, right }) => (
  <div className="flex items-end justify-between">
    <div>
      {eyebrow && (
        <div className="text-[10.5px] uppercase tracking-[0.18em] text-ink-400 font-medium mb-1.5">
          {eyebrow}
        </div>
      )}
      <h3 className="text-[15px] font-semibold text-ink-100 leading-tight">{title}</h3>
      {sub && <p className="text-[12px] text-ink-400 mt-0.5">{sub}</p>}
    </div>
    {right}
  </div>
);

export const Button = ({ children, className = '', ...rest }) => (
  <button
    className={`inline-flex items-center gap-1.5 px-2.5 h-8 rounded-md border border-ink-700 bg-ink-850 hover:bg-ink-800 text-[12px] text-ink-100 transition ${className}`}
    {...rest}
  >
    {children}
  </button>
);

export const IconButton = ({ icon, onClick, className = '', title }) => (
  <button
    onClick={onClick}
    title={title}
    className={`w-7 h-7 inline-flex items-center justify-center rounded-md border border-ink-700 bg-ink-850 text-ink-300 hover:text-ink-100 hover:border-ink-600 transition ${className}`}
  >
    <Icon name={icon} className="w-3.5 h-3.5" />
  </button>
);

export const Divider = ({ className = '' }) => <div className={`h-px bg-ink-700/60 ${className}`} />;

window.Switch = Switch;
window.Tag = Tag;
window.SectionHeader = SectionHeader;
