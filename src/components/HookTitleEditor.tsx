'use client';

import React from 'react';
import { Tag, Sparkles } from 'lucide-react';
import { HookSettings } from '@/types/editor';

interface HookTitleEditorProps {
  hook: HookSettings;
  onChange: (hook: HookSettings) => void;
}

export const HookTitleEditor: React.FC<HookTitleEditorProps> = ({ hook, onChange }) => {
  const PRESET_HOOKS = [
    'THIS CHANGED EVERYTHING!',
    'INSANE VIRAL SECRETS',
    'DON’T MISS THIS MOMENT',
    'WATCH TILL THE VERY END!',
  ];

  return (
    <div className="space-y-3">
      {/* Header with Hook Enable/Disable Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-yellow-400" />
          Hook / Big Title Badge
        </label>
        <button
          type="button"
          onClick={() => onChange({ ...hook, enabled: !hook.enabled })}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
            hook.enabled
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
              : 'bg-white/5 text-gray-400 border border-white/10'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full transition-colors ${
              hook.enabled ? 'bg-yellow-400 shadow-sm shadow-yellow-400' : 'bg-gray-500'
            }`}
          />
          {hook.enabled ? 'Hook ON' : 'Hook OFF'}
        </button>
      </div>

      <div className={`space-y-2.5 transition-opacity ${hook.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        {/* Input Text */}
        <div className="relative">
          <input
            type="text"
            value={hook.text}
            onChange={(e) => onChange({ ...hook, text: e.target.value })}
            placeholder="Type your viral hook title..."
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-bold text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
          />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap gap-1.5">
          {PRESET_HOOKS.map((preset) => (
            <button
              key={preset}
              onClick={() => onChange({ ...hook, text: preset, enabled: true })}
              className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 hover:border-white/20 transition flex items-center gap-1"
            >
              <Sparkles className="w-2.5 h-2.5 text-yellow-400" />
              {preset}
            </button>
          ))}
        </div>

        {/* Position Y Slider */}
        <div className="pt-1 flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
          <span className="text-[10px] font-semibold text-gray-400 whitespace-nowrap">Vertical Position:</span>
          <input
            type="range"
            min="-10"
            max="15"
            step="1"
            value={hook.yOffsetPercent}
            onChange={(e) => onChange({ ...hook, yOffsetPercent: Number(e.target.value) })}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="text-[10px] font-mono text-cyan-400 w-8 text-right">
            {hook.yOffsetPercent > 0 ? `+${hook.yOffsetPercent}%` : `${hook.yOffsetPercent}%`}
          </span>
        </div>
      </div>
    </div>
  );
};
