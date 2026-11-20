'use client';

import React from 'react';
import { Maximize2, Layers, ZoomIn, Crop } from 'lucide-react';
import { LayoutMode } from '@/types/editor';
import { LAYOUT_MODES } from '@/lib/constants';

interface LayoutPickerProps {
  currentLayout: LayoutMode;
  onSelectLayout: (layout: LayoutMode) => void;
}

export const LayoutPicker: React.FC<LayoutPickerProps> = ({ currentLayout, onSelectLayout }) => {
  const icons: Record<LayoutMode, React.ReactNode> = {
    original: <Maximize2 className="w-4 h-4" />,
    blur: <Layers className="w-4 h-4" />,
    zoom: <ZoomIn className="w-4 h-4" />,
    crop: <Crop className="w-4 h-4" />,
  };

  const layoutOrder: LayoutMode[] = ['original', 'blur', 'zoom', 'crop'];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          Frame / Layout Mode
        </label>
        <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
          {LAYOUT_MODES[currentLayout].tag}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {layoutOrder.map((key) => {
          const cfg = LAYOUT_MODES[key];
          const isSelected = currentLayout === key;

          return (
            <button
              key={key}
              onClick={() => onSelectLayout(key)}
              className={`p-3 rounded-xl text-left transition-all border relative flex flex-col justify-between group ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-400 shadow-md shadow-cyan-500/10'
                  : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/[0.08]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`p-1.5 rounded-lg transition-colors ${
                    isSelected ? 'bg-cyan-400 text-black' : 'bg-white/10 text-gray-300 group-hover:text-white'
                  }`}
                >
                  {icons[key]}
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/5 text-gray-400'
                  }`}
                >
                  {cfg.tag}
                </span>
              </div>

              <div>
                <div
                  className={`text-xs font-bold transition-colors ${
                    isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'
                  }`}
                >
                  {cfg.name}
                </div>
                <div className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{cfg.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
