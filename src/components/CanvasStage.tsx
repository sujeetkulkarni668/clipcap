'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize } from 'lucide-react';
import { CaptionStyle, HookSettings, LayoutMode, SubtitleWord } from '@/types/editor';
import { renderCompositeFrame } from '@/lib/canvasEngine';
import { CANVAS_OUT_H, CANVAS_OUT_W } from '@/lib/constants';

interface CanvasStageProps {
  videoSrc: string;
  layout: LayoutMode;
  captionStyle: CaptionStyle;
  showCaptions: boolean;
  hook: HookSettings;
  words: SubtitleWord[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (dur: number) => void;
  onPlayPauseToggle: (playing: boolean) => void;
  onSeek: (time: number) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export const CanvasStage: React.FC<CanvasStageProps> = ({
  videoSrc,
  layout,
  captionStyle,
  showCaptions,
  hook,
  words,
  currentTime,
  duration,
  isPlaying,
  onTimeUpdate,
  onDurationChange,
  onPlayPauseToggle,
  onSeek,
  videoRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [aspectRatioInfo, setAspectRatioInfo] = useState('9:16 (1080x1920)');
  const [canvasDimensions, setCanvasDimensions] = useState({ width: CANVAS_OUT_W, height: CANVAS_OUT_H });

  // Update canvas dimensions when layout or source metadata changes
  const updateDimensions = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (layout === 'original' && video.videoWidth && video.videoHeight) {
      setCanvasDimensions({ width: video.videoWidth, height: video.videoHeight });
      setAspectRatioInfo(`Original (${video.videoWidth}x${video.videoHeight})`);
    } else {
      setCanvasDimensions({ width: CANVAS_OUT_W, height: CANVAS_OUT_H });
      setAspectRatioInfo('9:16 Vertical (1080x1920)');
    }
  }, [layout, videoRef]);

  useEffect(() => {
    updateDimensions();
  }, [layout, updateDimensions]);

  // Main render loop on requestAnimationFrame
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (canvas && video && video.readyState >= 2) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          renderCompositeFrame({
            ctx,
            video,
            currentTime: video.currentTime,
            layout,
            captionStyle,
            showCaptions,
            hook,
            words,
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
          });
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [layout, captionStyle, showCaptions, hook, words, videoRef]);

  // Video event handlers
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      onDurationChange(videoRef.current.duration || 0);
      updateDimensions();
    }
  };

  const handleEnded = () => {
    onPlayPauseToggle(false);
  };

  const handleSliderSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    onSeek(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      onPlayPauseToggle(false);
    } else {
      videoRef.current.play().then(() => onPlayPauseToggle(true)).catch(console.error);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const restartVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      onSeek(0);
      videoRef.current.play().then(() => onPlayPauseToggle(true)).catch(console.error);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col items-center justify-between p-4 sm:p-6 bg-radial-gradient relative overflow-hidden"
    >
      {/* Hidden Source Video */}
      <video
        ref={videoRef}
        src={videoSrc}
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        className="hidden"
      />

      {/* Top Bar above preview */}
      <div className="w-full max-w-sm flex items-center justify-between text-xs text-gray-400 mb-2">
        <span className="flex items-center gap-1.5 font-semibold bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot" />
          Realtime Compositor
        </span>
        <span className="font-mono text-[11px] bg-white/5 px-2.5 py-1 rounded-full border border-white/5 text-gray-300">
          {aspectRatioInfo}
        </span>
      </div>

      {/* Video Canvas Stage with responsive aspect container */}
      <div
        className="relative group rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black flex items-center justify-center cursor-pointer transition-transform hover:scale-[1.005]"
        onClick={togglePlay}
        style={{
          width: 'min(100%, 360px)',
          aspectRatio: layout === 'original' && canvasDimensions.width && canvasDimensions.height
            ? `${canvasDimensions.width} / ${canvasDimensions.height}`
            : '9 / 16',
          maxHeight: 'calc(100vh - 230px)',
        }}
      >
        <canvas
          ref={canvasRef}
          width={canvasDimensions.width}
          height={canvasDimensions.height}
          className="w-full h-full object-contain"
        />

        {/* Big Center Play/Pause Overlay Icon */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/35 flex items-center justify-center backdrop-blur-[2px] transition-all">
            <div className="w-16 h-16 rounded-full bg-cyan-400/90 text-black flex items-center justify-center shadow-xl shadow-cyan-400/30 transform transition hover:scale-110">
              <Play className="w-8 h-8 fill-current ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* Playback Controls & Time Scrubber */}
      <div className="w-full max-w-sm mt-3 space-y-2 bg-[#0e121b]/80 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-lg">
        {/* Scrubber Range Bar */}
        <div className="relative group flex items-center">
          <input
            type="range"
            min="0"
            max={duration || 10}
            step="0.02"
            value={currentTime}
            onChange={handleSliderSeek}
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
          />
        </div>

        {/* Buttons & Timecode */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-lg bg-cyan-400 text-black hover:bg-cyan-300 transition"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
            <button
              onClick={restartVideo}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition"
              title="Restart"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          <div className="font-mono text-[11px] text-gray-300">
            <span className="text-cyan-400 font-bold">{formatTime(currentTime)}</span>
            <span className="text-gray-500"> / {formatTime(duration)}</span>
          </div>

          <button
            onClick={() => {
              if (canvasRef.current?.requestFullscreen) {
                canvasRef.current.requestFullscreen();
              }
            }}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
            title="Fullscreen Canvas"
          >
            <Maximize className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
