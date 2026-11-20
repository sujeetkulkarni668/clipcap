'use client';

import React, { useState } from 'react';
import { SubtitleWord } from '@/types/editor';
import { Plus, Trash2, Star, Wand2, Clock, Play } from 'lucide-react';

interface SubtitleTimelineProps {
  words: SubtitleWord[];
  currentTime: number;
  duration: number;
  onUpdateWords: (words: SubtitleWord[]) => void;
  onSeek: (time: number) => void;
}

export const SubtitleTimeline: React.FC<SubtitleTimelineProps> = ({
  words,
  currentTime,
  duration,
  onUpdateWords,
  onSeek,
}) => {
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [autoText, setAutoText] = useState('');

  const handleWordTextChange = (id: string, newText: string) => {
    onUpdateWords(words.map((w) => (w.id === id ? { ...w, w: newText } : w)));
  };

  const handleStartTimeChange = (id: string, newStart: number) => {
    onUpdateWords(
      words.map((w) => (w.id === id ? { ...w, s: Math.max(0, Number(newStart)) } : w))
    );
  };

  const handleEndTimeChange = (id: string, newEnd: number) => {
    onUpdateWords(
      words.map((w) => (w.id === id ? { ...w, e: Math.max(w.s + 0.1, Number(newEnd)) } : w))
    );
  };

  const toggleHighlight = (id: string) => {
    onUpdateWords(words.map((w) => (w.id === id ? { ...w, highlight: !w.highlight } : w)));
  };

  const deleteWord = (id: string) => {
    onUpdateWords(words.filter((w) => w.id !== id));
  };

  const addWord = () => {
    const lastWord = words[words.length - 1];
    const newStart = lastWord ? Number((lastWord.e + 0.1).toFixed(2)) : Number(currentTime.toFixed(2));
    const newEnd = Number((newStart + 0.5).toFixed(2));

    const newWord: SubtitleWord = {
      id: `word_${Date.now()}`,
      w: 'NewWord',
      s: newStart,
      e: newEnd,
    };
    onUpdateWords([...words, newWord].sort((a, b) => a.s - b.s));
  };

  const handleGenerateAutoSubtitles = () => {
    const rawText = autoText.trim() || 'This viral video editor creates stunning automated captions and 9:16 layout fills instantly';
    const splitWords = rawText.split(/\s+/).filter(Boolean);
    if (splitWords.length === 0) return;

    const totalDur = Math.max(4, duration || 8);
    const timePerWord = totalDur / (splitWords.length + 1);

    const generated: SubtitleWord[] = splitWords.map((word, i) => {
      const s = Number((i * timePerWord + 0.15).toFixed(2));
      const e = Number((s + Math.min(0.55, timePerWord * 0.9)).toFixed(2));
      const isImportant = i % 4 === 0 || word.length > 7;
      return {
        id: `auto_${i}_${Date.now()}`,
        w: word,
        s,
        e,
        highlight: isImportant,
      };
    });

    onUpdateWords(generated);
    setShowAutoModal(false);
    setAutoText('');
  };

  return (
    <div className="space-y-3">
      {/* Subtitle Editor Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Transcript & Word Editor
          </label>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-cyan-300">
            {words.length} words
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowAutoModal(true)}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/60 transition flex items-center gap-1.5"
            title="Auto generate rhythmic subtitle timing"
          >
            <Wand2 className="w-3 h-3 text-cyan-400" />
            <span>Auto Subtitles</span>
          </button>
          <button
            onClick={addWord}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition flex items-center gap-1.5"
            title="Add a new word"
          >
            <Plus className="w-3 h-3" />
            <span>Add Word</span>
          </button>
        </div>
      </div>

      {/* Auto Subtitles Modal / Drawer */}
      {showAutoModal && (
        <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5" /> Auto-Timed Subtitle Generator
            </span>
            <button
              onClick={() => setShowAutoModal(false)}
              className="text-xs text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-[11px] text-gray-300">
            Paste spoken speech or script text below. It will automatically calculate synced word timestamps across the video duration ({duration.toFixed(1)}s):
          </p>
          <textarea
            value={autoText}
            onChange={(e) => setAutoText(e.target.value)}
            placeholder="e.g. This changes everything watch till the end to see the result..."
            className="w-full h-16 bg-black/50 border border-white/10 rounded-lg p-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowAutoModal(false)}
              className="px-3 py-1 rounded-lg text-xs text-gray-400 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateAutoSubtitles}
              className="px-3 py-1 rounded-lg text-xs font-bold bg-cyan-400 text-black hover:bg-cyan-300 transition"
            >
              Generate Subtitles
            </button>
          </div>
        </div>
      )}

      {/* Words List with live timeline highlighting */}
      <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
        {words.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-xs bg-white/5 rounded-xl border border-white/5">
            No subtitles yet. Click &quot;Auto Subtitles&quot; or &quot;Add Word&quot; to begin.
          </div>
        ) : (
          words.map((item) => {
            const isCurrentlyActive = currentTime >= item.s && currentTime <= item.e;
            return (
              <div
                key={item.id}
                className={`p-2 rounded-xl transition-all border flex items-center justify-between gap-2 ${
                  isCurrentlyActive
                    ? 'bg-cyan-950/60 border-cyan-400 shadow-sm shadow-cyan-400/20'
                    : 'bg-white/5 border-white/5 hover:border-white/10'
                }`}
              >
                {/* Seek / Playhead Button */}
                <button
                  onClick={() => onSeek(item.s)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isCurrentlyActive ? 'bg-cyan-400 text-black font-bold' : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                  title="Jump playback to this word"
                >
                  <Play className="w-3 h-3 fill-current" />
                </button>

                {/* Word Text Input */}
                <input
                  type="text"
                  value={item.w}
                  onChange={(e) => handleWordTextChange(item.id, e.target.value)}
                  className="flex-1 min-w-0 bg-transparent text-xs font-bold text-white focus:outline-none focus:bg-white/10 px-2 py-1 rounded"
                />

                {/* Start / End Timestamp inputs */}
                <div className="flex items-center gap-1 text-[11px] font-mono text-gray-400">
                  <input
                    type="number"
                    step="0.05"
                    value={item.s}
                    onChange={(e) => handleStartTimeChange(item.id, parseFloat(e.target.value))}
                    className="w-12 bg-black/40 border border-white/10 rounded px-1.5 py-0.5 text-center text-gray-300 focus:outline-none focus:border-cyan-400"
                    title="Start time (seconds)"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    step="0.05"
                    value={item.e}
                    onChange={(e) => handleEndTimeChange(item.id, parseFloat(e.target.value))}
                    className="w-12 bg-black/40 border border-white/10 rounded px-1.5 py-0.5 text-center text-gray-300 focus:outline-none focus:border-cyan-400"
                    title="End time (seconds)"
                  />
                  <span className="text-[9px] text-gray-500">s</span>
                </div>

                {/* Star Highlight Toggle */}
                <button
                  onClick={() => toggleHighlight(item.id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    item.highlight
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                  title="Toggle highlight accent"
                >
                  <Star className={`w-3.5 h-3.5 ${item.highlight ? 'fill-current' : ''}`} />
                </button>

                {/* Delete Word */}
                <button
                  onClick={() => deleteWord(item.id)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                  title="Delete word"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
