'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { Upload, Download, Image as ImageIcon, Sparkles, Video, Check } from 'lucide-react';
import { VideoPreset } from '@/types/editor';

interface StudioHeaderProps {
  presets: VideoPreset[];
  activePresetId: string;
  onSelectPreset: (preset: VideoPreset) => void;
  onFileUpload: (file: File) => void;
  onExportClick: () => void;
  onSavePoster: () => void;
  isExporting: boolean;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  presets,
  activePresetId,
  onSelectPreset,
  onFileUpload,
  onExportClick,
  onSavePoster,
  isExporting,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <header className="h-16 border-b border-white/10 bg-[#0d1017]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Brand Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 overflow-hidden">
          <Image
            src="/brand/favicon.svg"
            alt="EditingCation Logo"
            width={24}
            height={24}
            className="w-6 h-6 invert drop-shadow"
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5 font-['Poppins_ExtraBold',sans-serif]">
              Editing<span className="text-cyan-400">Cation</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 uppercase">
              PeakCut Engine
            </span>
          </div>
          <p className="text-[11px] text-gray-400 hidden sm:block">Client-Side Video & Caption Studio</p>
        </div>
      </div>

      {/* Center: Preset Selector */}
      <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
        <span className="text-xs font-medium text-gray-400 px-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Presets:
        </span>
        {presets.map((preset) => {
          const isActive = preset.id === activePresetId;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/25 font-bold'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {isActive && <Check className="w-3 h-3 stroke-[3]" />}
              {preset.name}
            </button>
          );
        })}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-200 bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center gap-2 shadow-sm"
          title="Upload MP4 or WebM video"
        >
          <Upload className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">Upload Video</span>
        </button>

        {/* Save Poster Button */}
        <button
          onClick={onSavePoster}
          className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center gap-2"
          title="Save Cover Snapshot (.jpg)"
        >
          <ImageIcon className="w-4 h-4 text-yellow-400" />
          <span className="hidden md:inline">Save Cover</span>
        </button>

        {/* Export Video Button */}
        <button
          onClick={onExportClick}
          disabled={isExporting}
          className={`px-4 py-1.5 sm:px-5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold text-black transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/25 ${
            isExporting
              ? 'bg-cyan-700 cursor-not-allowed opacity-75'
              : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:brightness-110 active:scale-95'
          }`}
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>{isExporting ? 'Exporting...' : 'Export Video'}</span>
        </button>
      </div>
    </header>
  );
};
