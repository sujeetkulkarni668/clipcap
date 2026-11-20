'use client';

import React from 'react';
import { Download, CheckCircle, AlertCircle, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { ExportProgress } from '@/types/editor';

interface ExportModalProps {
  exportState: ExportProgress;
  onClose: () => void;
  onSavePoster: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  exportState,
  onClose,
  onSavePoster,
}) => {
  if (!exportState.isExporting && !exportState.downloadUrl && !exportState.error) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-[#0f1420] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {exportState.isExporting ? (
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : exportState.error ? (
              <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
                <AlertCircle className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="text-base font-bold text-white">
                {exportState.isExporting
                  ? 'Rendering Video in Browser'
                  : exportState.error
                  ? 'Export Error'
                  : 'Video Ready for Download!'}
              </h3>
              <p className="text-xs text-gray-400">
                {exportState.isExporting
                  ? '100% Client-Side Canvas 2D & Web Audio encoding'
                  : exportState.error
                  ? 'Something went wrong during canvas capture'
                  : 'Hardware-accelerated client encoding complete'}
              </p>
            </div>
          </div>

          {!exportState.isExporting && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-lg p-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Progress Bar & Status Text */}
        {exportState.isExporting && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-cyan-400 font-bold">{exportState.statusText}</span>
              <span className="text-white font-bold">{exportState.progress}%</span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${exportState.progress}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-400 text-center italic">
              Rendering in real-time right inside your browser with zero server timeouts or limits.
            </p>
          </div>
        )}

        {/* Success Action Buttons */}
        {exportState.downloadUrl && (
          <div className="space-y-3 pt-2">
            <a
              href={exportState.downloadUrl}
              download={exportState.fileName || 'editingcation_clip.webm'}
              className="w-full py-3 px-4 rounded-xl font-extrabold text-sm text-black bg-gradient-to-r from-cyan-400 to-blue-500 hover:brightness-110 active:scale-95 transition shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Download Video ({exportState.fileName})</span>
            </a>

            <div className="flex gap-2">
              <button
                onClick={onSavePoster}
                className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold text-gray-200 bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center justify-center gap-1.5"
              >
                <ImageIcon className="w-3.5 h-3.5 text-yellow-400" />
                <span>Save Poster (.jpg)</span>
              </button>

              <button
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Error Action */}
        {exportState.error && (
          <div className="space-y-3 pt-2">
            <p className="text-xs text-red-300 bg-red-950/40 border border-red-900/50 p-3 rounded-xl font-mono">
              {exportState.error}
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
