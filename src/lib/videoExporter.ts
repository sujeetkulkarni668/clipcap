import { CaptionStyle, HookSettings, LayoutMode, SubtitleWord } from '@/types/editor';
import { CANVAS_OUT_H, CANVAS_OUT_W } from './constants';
import { renderCompositeFrame } from './canvasEngine';

export interface ExportVideoOptions {
  videoSrc: string;
  duration: number;
  layout: LayoutMode;
  captionStyle: CaptionStyle;
  showCaptions: boolean;
  hook: HookSettings;
  words: SubtitleWord[];
  onProgress: (progress: number, status: string) => void;
}

export function getSupportedMimeType(): string {
  const types = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=h264,opus',
    'video/webm',
    'video/mp4;codecs=avc1,mp4a.40.2',
    'video/mp4',
  ];

  for (const type of types) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return 'video/webm';
}

export async function exportVideoClientSide({
  videoSrc,
  duration,
  layout,
  captionStyle,
  showCaptions,
  hook,
  words,
  onProgress,
}: ExportVideoOptions): Promise<{ blob: Blob; url: string; fileName: string }> {
  return new Promise(async (resolve, reject) => {
    try {
      onProgress(2, 'Preparing export canvas and audio pipeline...');

      // Create an offscreen video element for real-time capture
      const video = document.createElement('video');
      video.src = videoSrc;
      video.crossOrigin = 'anonymous';
      video.playsInline = true;
      video.muted = false;

      await new Promise<void>((res, rej) => {
        video.onloadedmetadata = () => res();
        video.onerror = () => rej(new Error('Failed to load video for export'));
      });

      const videoDuration = duration || video.duration || 10;
      const srcW = video.videoWidth || 1920;
      const srcH = video.videoHeight || 1080;

      // Target canvas resolution
      let exportW = CANVAS_OUT_W;
      let exportH = CANVAS_OUT_H;
      if (layout === 'original') {
        exportW = srcW;
        exportH = srcH;
      }

      const canvas = document.createElement('canvas');
      canvas.width = exportW;
      canvas.height = exportH;
      const ctx = canvas.getContext('2d', { alpha: false });

      if (!ctx) {
        throw new Error('Canvas 2D context not available');
      }

      // Audio setup using Web Audio API
      let audioStreamDestination: MediaStreamAudioDestinationNode | null = null;
      let audioCtx: AudioContext | null = null;
      let audioTracks: MediaStreamTrack[] = [];

      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          audioCtx = new AudioContextClass();
          const sourceNode = audioCtx.createMediaElementSource(video);
          audioStreamDestination = audioCtx.createMediaStreamDestination();
          sourceNode.connect(audioStreamDestination);
          // Do NOT connect to audioCtx.destination so user doesn't hear the video at full blast during export
          audioTracks = audioStreamDestination.stream.getAudioTracks();
        }
      } catch (err) {
        console.warn('Web Audio capture failed or restricted; exporting video stream only:', err);
      }

      // Video canvas stream at 30 FPS
      const canvasStream = canvas.captureStream(30);
      const videoTracks = canvasStream.getVideoTracks();

      const combinedStream = new MediaStream([...videoTracks, ...audioTracks]);
      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 6_000_000, // 6 Mbps for crisp 1080p output
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      let animationFrameId: number;
      let isDone = false;

      const finishExport = () => {
        if (isDone) return;
        isDone = true;
        cancelAnimationFrame(animationFrameId);

        try {
          video.pause();
          if (audioCtx && audioCtx.state !== 'closed') {
            audioCtx.close();
          }
        } catch {
          // ignore
        }

        recorder.onstop = () => {
          onProgress(100, 'Finalizing video file...');
          const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
          const blob = new Blob(chunks, { type: mimeType });
          const url = URL.createObjectURL(blob);
          const fileName = `editingcation_${layout}_${Date.now()}.${ext}`;
          resolve({ blob, url, fileName });
        };

        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
      };

      recorder.onerror = (err) => {
        cancelAnimationFrame(animationFrameId);
        reject(err);
      };

      // Frame rendering loop
      const renderLoop = () => {
        if (isDone) return;

        const currentT = video.currentTime;
        const pct = Math.min(99, Math.round((currentT / videoDuration) * 98));
        onProgress(Math.max(5, pct), `Rendering frames... ${pct}% (${currentT.toFixed(1)}s / ${videoDuration.toFixed(1)}s)`);

        renderCompositeFrame({
          ctx,
          video,
          currentTime: currentT,
          layout,
          captionStyle,
          showCaptions,
          hook,
          words,
          canvasWidth: exportW,
          canvasHeight: exportH,
        });

        if (video.ended || currentT >= videoDuration - 0.05) {
          finishExport();
        } else {
          animationFrameId = requestAnimationFrame(renderLoop);
        }
      };

      onProgress(5, 'Starting playback render...');
      recorder.start(100);
      video.currentTime = 0;

      await video.play();
      renderLoop();

      // Fallback timeout in case video stalls
      const maxWait = (videoDuration + 5) * 1000;
      setTimeout(() => {
        if (!isDone) {
          finishExport();
        }
      }, maxWait);
    } catch (error) {
      reject(error);
    }
  });
}

export function savePosterSnapshot(
  video: HTMLVideoElement,
  currentTime: number,
  layout: LayoutMode,
  captionStyle: CaptionStyle,
  showCaptions: boolean,
  hook: HookSettings,
  words: SubtitleWord[]
): string {
  const srcW = video.videoWidth || 1920;
  const srcH = video.videoHeight || 1080;
  let exportW = CANVAS_OUT_W;
  let exportH = CANVAS_OUT_H;
  if (layout === 'original') {
    exportW = srcW;
    exportH = srcH;
  }

  const canvas = document.createElement('canvas');
  canvas.width = exportW;
  canvas.height = exportH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas 2D context');

  renderCompositeFrame({
    ctx,
    video,
    currentTime,
    layout,
    captionStyle,
    showCaptions,
    hook,
    words,
    canvasWidth: exportW,
    canvasHeight: exportH,
  });

  return canvas.toDataURL('image/jpeg', 0.95);
}
