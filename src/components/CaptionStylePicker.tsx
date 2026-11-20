'use client';

import React from 'react';
import { Type, Check, Flame, Activity, Sparkles } from 'lucide-react';
import { CaptionStyle } from '@/types/editor';
import { CAPTION_STYLES } from '@/lib/constants';

interface CaptionStylePickerProps {
  currentStyle: CaptionStyle;
  showCaptions: boolean;
  onSelectStyle: (style: CaptionStyle) => void;
  onToggleCaptions: (enabled: boolean) => void;
}

export const CaptionStylePicker: React.FC<CaptionStylePickerProps> = ({
  currentStyle,
  showCaptions,
  onSelectStyle,
  onToggleCaptions,
}) => {
  const stylesList: CaptionStyle[] = ['bounce', 'hype', 'clean'];

  const getStyleIcon = (style: CaptionStyle) => {
    switch (style) {
      case 'bounce':
        return <Activity className="w-4 h-4 text-yellow-400" />;
      case 'hype':
        return <Flame className="w-4 h-4 text-red-400" />;
      case 'clean':
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-3">
      {/* Header with Captions Enable/Disable Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <Type className="w-3.5 h-3.5 text-cyan-400" />
          Caption Style
        </label>
        <button
          type="button"
          onClick={() => onToggleCaptions(!showCaptions)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
            showCaptions
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              : 'bg-white/5 text-gray-400 border border-white/10'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full transition-colors ${
              showCaptions ? 'bg-cyan-400 shadow-sm shadow-cyan-400' : 'bg-gray-500'
            }`}
          />
          {showCaptions ? 'Captions ON' : 'Captions OFF'}
        </button>
      </div>

      {/* Style Cards */}
      <div className={`grid grid-cols-3 gap-2 transition-opacity ${showCaptions ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        {stylesList.map((key) => {
          const cfg = CAPTION_STYLES[key];
          const isSelected = currentStyle === key;

          return (
            <button
              key={key}
              onClick={() => onSelectStyle(key)}
              className={`p-3 rounded-xl text-left transition-all border relative flex flex-col justify-between group ${
                isSelected
                  ? 'bg-gradient-to-b from-cyan-950/50 to-slate-900 border-cyan-400 shadow-lg shadow-cyan-500/15'
                  : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/[0.08]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-1 rounded-lg bg-black/40 border border-white/10">
                  {getStyleIcon(key)}
                </span>
                {isSelected && (
                  <span className="w-4 h-4 rounded-full bg-cyan-400 text-black flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs font-extrabold text-white">{cfg.label}</span>
                  <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-white/10 text-gray-300">
                    {cfg.wordsPerGroup}W
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 line-clamp-1">{cfg.fontFamily.split(',')[0].replace(/"/g, '')}</div>
              </div>

              {/* Mini visual preview */}
              <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-center">
                <div
                  className="text-xs font-black tracking-tight"
                  style={{
                    fontFamily: cfg.fontFamily,
                    color: cfg.activeColor,
                    textTransform: cfg.uppercase ? 'uppercase' : 'none',
                    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                  }}
                >
                  POP!
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
