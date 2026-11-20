'use client';

import React, { useState, useRef } from 'react';
import { StudioHeader } from '@/components/StudioHeader';
import { CanvasStage } from '@/components/CanvasStage';
import { LayoutPicker } from '@/components/LayoutPicker';
import { CaptionStylePicker } from '@/components/CaptionStylePicker';
import { HookTitleEditor } from '@/components/HookTitleEditor';
import { SubtitleTimeline } from '@/components/SubtitleTimeline';
import { ExportModal } from '@/components/ExportModal';
import { DEMO_PRESETS } from '@/lib/demoData';
import { CaptionStyle, ExportProgress, HookSettings, LayoutMode, SubtitleWord, VideoPreset } from '@/types/editor';
import { exportVideoClientSide, savePosterSnapshot } from '@/lib/videoExporter';

export default function StudioPage() {
  const [activePreset, setActivePreset] = useState<VideoPreset>(DEMO_PRESETS[0]);
  const [videoSrc, setVideoSrc] = useState<string>(DEMO_PRESETS[0].videoUrl);
  const [layout, setLayout] = useState<LayoutMode>(DEMO_PRESETS[0].defaultLayout);
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>(DEMO_PRESETS[0].defaultStyle);
  const [showCaptions, setShowCaptions] = useState<boolean>(true);
  const [hook, setHook] = useState<HookSettings>({
    enabled: true,
    text: DEMO_PRESETS[0].defaultHook,
    yOffsetPercent: 0,
  });
  const [words, setWords] = useState<SubtitleWord[]>(DEMO_PRESETS[0].words);

  // Playback state
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Export State
  const [exportState, setExportState] = useState<ExportProgress>({
    isExporting: false,
    progress: 0,
    statusText: '',
    downloadUrl: null,
    fileName: null,
    error: null,
  });

  // Handle Preset selection
  const handleSelectPreset = (preset: VideoPreset) => {
    setActivePreset(preset);
    setVideoSrc(preset.videoUrl);
    setLayout(preset.defaultLayout);
    setCaptionStyle(preset.defaultStyle);
    setHook({
      enabled: true,
      text: preset.defaultHook,
      yOffsetPercent: 0,
    });
    setWords([...preset.words]);
    setCurrentTime(0);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  // Handle File Upload
  const handleFileUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    setActivePreset({
      id: `custom_${Date.now()}`,
      name: file.name.slice(0, 16),
      videoUrl: url,
      coverUrl: '',
      defaultHook: 'AMAZING VIDEO MOMENT',
      defaultStyle: captionStyle,
      defaultLayout: layout,
      words: [],
    });
    setHook({
      enabled: true,
      text: 'AMAZING VIDEO MOMENT',
      yOffsetPercent: 0,
    });
    setWords([
      { id: 'w1', w: 'Welcome', s: 0.2, e: 0.6 },
      { id: 'w2', w: 'to', s: 0.65, e: 0.85 },
      { id: 'w3', w: 'your', s: 0.9, e: 1.15 },
      { id: 'w4', w: 'custom', s: 1.2, e: 1.6, highlight: true },
      { id: 'w5', w: 'clip', s: 1.65, e: 2.1, highlight: true },
    ]);
    setCurrentTime(0);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  // Seek video
  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  // Save Cover snapshot
  const handleSavePoster = () => {
    if (!videoRef.current) return;
    try {
      const dataUrl = savePosterSnapshot(
        videoRef.current,
        currentTime,
        layout,
        captionStyle,
        showCaptions,
        hook,
        words
      );
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `editingcation_cover_${layout}_${Date.now()}.jpg`;
      a.click();
    } catch (err) {
      console.error('Failed to save cover image:', err);
    }
  };

  // Trigger Client-side Video Export
  const handleExportClick = async () => {
    if (!videoSrc) return;
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }

    setExportState({
      isExporting: true,
      progress: 0,
      statusText: 'Initializing Canvas & Audio Encoder...',
      downloadUrl: null,
      fileName: null,
      error: null,
    });

    try {
      const result = await exportVideoClientSide({
        videoSrc,
        duration: duration || 8,
        layout,
        captionStyle,
        showCaptions,
        hook,
        words,
        onProgress: (progress, statusText) => {
          setExportState((prev) => ({
            ...prev,
            progress,
            statusText,
          }));
        },
      });

      setExportState({
        isExporting: false,
        progress: 100,
        statusText: 'Export completed!',
        downloadUrl: result.url,
        fileName: result.fileName,
        error: null,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Export failed';
      setExportState({
        isExporting: false,
        progress: 0,
        statusText: 'Failed',
        downloadUrl: null,
        fileName: null,
        error: message,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090b10] text-gray-100">
      {/* Top Header */}
      <StudioHeader
        presets={DEMO_PRESETS}
        activePresetId={activePreset.id}
        onSelectPreset={handleSelectPreset}
        onFileUpload={handleFileUpload}
        onExportClick={handleExportClick}
        onSavePoster={handleSavePoster}
        isExporting={exportState.isExporting}
      />

      {/* Main Studio Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left / Center Viewport: Video Preview & Canvas Stage */}
        <CanvasStage
          videoSrc={videoSrc}
          layout={layout}
          captionStyle={captionStyle}
          showCaptions={showCaptions}
          hook={hook}
          words={words}
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          onTimeUpdate={setCurrentTime}
          onDurationChange={setDuration}
          onPlayPauseToggle={setIsPlaying}
          onSeek={handleSeek}
          videoRef={videoRef}
        />

        {/* Right Sidebar: Controls & Transcript Editor */}
        <aside className="w-full lg:w-[480px] xl:w-[520px] bg-[#0c0f17] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col h-auto lg:h-[calc(100vh-64px)] overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Layout Mode Selector */}
          <section className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 space-y-3">
            <LayoutPicker currentLayout={layout} onSelectLayout={setLayout} />
          </section>

          {/* Caption Style Selector */}
          <section className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 space-y-3">
            <CaptionStylePicker
              currentStyle={captionStyle}
              showCaptions={showCaptions}
              onSelectStyle={setCaptionStyle}
              onToggleCaptions={setShowCaptions}
            />
          </section>

          {/* Big Text Hook Title Editor */}
          <section className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 space-y-3">
            <HookTitleEditor hook={hook} onChange={setHook} />
          </section>

          {/* Subtitle Words Timeline & Editor */}
          <section className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 space-y-3">
            <SubtitleTimeline
              words={words}
              currentTime={currentTime}
              duration={duration}
              onUpdateWords={setWords}
              onSeek={handleSeek}
            />
          </section>
        </aside>
      </main>

      {/* Export Progress & Download Modal */}
      <ExportModal
        exportState={exportState}
        onClose={() => setExportState((prev) => ({ ...prev, downloadUrl: null, error: null }))}
        onSavePoster={handleSavePoster}
      />
    </div>
  );
}
