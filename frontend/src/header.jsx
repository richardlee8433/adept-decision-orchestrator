import React, { useState } from 'react';
import { Icon, Pill, IconButton, Button } from './primitives';

export const Header = ({ dirty, onDeploy, env, setEnv }) => {
  return (
    <header className="h-14 border-b border-ink-700/70 bg-ink-900/95 backdrop-blur sticky top-0 z-30">
      <div className="h-full px-5 flex items-center justify-between">
        {/* Left: brand + breadcrumbs */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5">
            {/* Original mark: two intersecting rings — generic decisioning brand */}
            <div className="relative w-7 h-7 flex items-center justify-center">
              <span className="absolute left-0 w-4 h-4 rounded-full bg-signal-red"></span>
              <span className="absolute right-0 w-4 h-4 rounded-full bg-signal-orange mix-blend-screen"></span>
            </div>
            <div className="flex items-center gap-2 leading-none">
              <span className="font-semibold text-ink-100 tracking-tight text-[15px]">ADEPT</span>
              <span className="text-ink-500">·</span>
              <span className="text-ink-200 text-[14px]">Strategy Orchestrator</span>
            </div>
          </div>

          <div className="h-5 w-px bg-ink-700/80" />

          <nav className="flex items-center gap-1 text-[12.5px]">
            <button className="px-2.5 py-1.5 rounded-md text-ink-100 bg-ink-800 border border-ink-700">Strategies</button>
            <button className="px-2.5 py-1.5 rounded-md text-ink-300 hover:text-ink-100 hover:bg-ink-850">Models</button>
            <button className="px-2.5 py-1.5 rounded-md text-ink-300 hover:text-ink-100 hover:bg-ink-850">Datasets</button>
            <button className="px-2.5 py-1.5 rounded-md text-ink-300 hover:text-ink-100 hover:bg-ink-850">Audit</button>
            <button className="px-2.5 py-1.5 rounded-md text-ink-300 hover:text-ink-100 hover:bg-ink-850">Approvals</button>
          </nav>
        </div>

        {/* Right: status pill, env switcher, deploy */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-ink-700 bg-ink-850">
            <span className="relative flex w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-signal-green pulse-dot"></span>
            </span>
            <span className="text-[11.5px] text-ink-200 font-medium">Gateway</span>
            <span className="text-ink-500 text-[11px]">·</span>
            <span className="text-[11.5px] font-mono text-ink-100">100ms target active</span>
          </div>

          <div className="flex items-center rounded-md border border-ink-700 bg-ink-850 p-0.5 text-[11px]">
            {['Sandbox', 'Staging', 'Prod'].map((e) => (
              <button
                key={e}
                onClick={() => setEnv(e)}
                className={`px-2 py-1 rounded ${
                  env === e ? 'bg-ink-700 text-ink-100' : 'text-ink-400 hover:text-ink-200'
                }`}
              >
                {e}
              </button>
            ))}
          </div>

          <button className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-ink-700 bg-ink-850 text-ink-300 hover:text-ink-100">
            <Icon name="bell" className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-ink-700 bg-ink-850 text-ink-300 hover:text-ink-100">
            <Icon name="search" className="w-4 h-4" />
          </button>

          <div className="h-6 w-px bg-ink-700/80 mx-1" />

          <button
            onClick={onDeploy}
            className="deploy-shine inline-flex items-center gap-2 px-3.5 h-8 rounded-md text-white text-[12.5px] font-semibold tracking-tight"
          >
            <Icon name="rocket" className="w-3.5 h-3.5" strokeWidth={2.25} />
            Deploy changes
            {dirty > 0 && (
              <span className="ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-white/20 text-[10.5px] font-mono">
                {dirty}
              </span>
            )}
          </button>

          <div className="ml-1 w-8 h-8 rounded-full bg-gradient-to-br from-ink-600 to-ink-800 border border-ink-700 inline-flex items-center justify-center text-[11px] font-semibold text-ink-100">
            JR
          </div>
        </div>
      </div>
    </header>
  );
};



