import { CaptionStyle, HookSettings, LayoutMode, SubtitleWord } from '@/types/editor';
import { CANVAS_OUT_H, CANVAS_OUT_W, CAPTION_STYLES, HOOK_CONFIG } from './constants';

export interface RenderFrameOptions {
  ctx: CanvasRenderingContext2D;
  video: HTMLVideoElement;
  currentTime: number;
  layout: LayoutMode;
  captionStyle: CaptionStyle;
  showCaptions: boolean;
  hook: HookSettings;
  words: SubtitleWord[];
  canvasWidth: number;
  canvasHeight: number;
}

export function computeGeometry(srcW: number, srcH: number, layout: LayoutMode, outW: number, outH: number) {
  if (layout === 'original') {
    return {
      canvasW: srcW,
      canvasH: srcH,
      fgX: 0,
      fgY: 0,
      fgW: srcW,
      fgH: srcH,
      hookY: Math.round(srcH * 0.12),
      capY: Math.round(srcH * 0.82),
      scaleFactor: srcW / 1080,
    };
  }

  // Vertical layouts (1080x1920)
  const isVerticalOrSquare = srcH >= srcW;
  let activeLayout = layout;
  if (isVerticalOrSquare && activeLayout !== 'crop') {
    activeLayout = 'crop';
  }

  let fgH = outH;
  let fgW = outW;
  let fgX = 0;
  let fgY = 0;

  if (activeLayout === 'blur') {
    fgH = Math.min(outH, Math.round(outW * (srcH / srcW) / 2) * 2);
    fgW = outW;
    fgX = 0;
    fgY = Math.round((outH - fgH) / 2);
  } else if (activeLayout === 'zoom') {
    fgH = 1000;
    fgW = Math.round(fgH * (srcW / srcH));
    fgX = Math.round((outW - fgW) / 2);
    fgY = Math.round((outH - fgH) / 2);
  } else {
    // crop fill
    const srcAspect = srcW / srcH;
    const targetAspect = outW / outH;
    if (srcAspect > targetAspect) {
      // Source is wider than 9:16 -> match height, crop sides
      fgH = outH;
      fgW = Math.round(outH * srcAspect);
      fgX = Math.round((outW - fgW) / 2);
      fgY = 0;
    } else {
      // Source is taller than 9:16 -> match width, crop top/bottom
      fgW = outW;
      fgH = Math.round(outW / srcAspect);
      fgX = 0;
      fgY = Math.round((outH - fgH) / 2);
    }
  }

  let hookY: number;
  let capY: number;

  if (activeLayout === 'crop') {
    hookY = 280;
    capY = 1420;
  } else {
    hookY = Math.max(220, fgY - 180);
    capY = Math.min(1660, fgY + fgH + 180);
  }

  return {
    canvasW: outW,
    canvasH: outH,
    fgX,
    fgY,
    fgW,
    fgH,
    hookY,
    capY,
    scaleFactor: 1.0,
  };
}

export function groupWords(words: SubtitleWord[], perGroup: number): SubtitleWord[][] {
  const sorted = [...words].filter((w) => w.w.trim().length > 0).sort((a, b) => a.s - b.s);
  const groups: SubtitleWord[][] = [];
  let current: SubtitleWord[] = [];

  for (const w of sorted) {
    if (current.length > 0) {
      const prev = current[current.length - 1];
      const gap = w.s - prev.e;
      const totalChars = current.reduce((sum, item) => sum + item.w.length, 0) + w.w.length;
      const endsWithPunct = /[.!?]$/.test(prev.w);

      if (current.length >= perGroup || totalChars > 18 || gap > 0.45 || endsWithPunct) {
        groups.push(current);
        current = [];
      }
    }
    current.push(w);
  }

  if (current.length > 0) {
    groups.push(current);
  }

  return groups;
}

export function drawHookTitle(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  centerY: number,
  scale: number = 1.0
) {
  if (!text.trim()) return;

  ctx.save();
  const fontSize = Math.round(HOOK_CONFIG.fontSize * scale);
  ctx.font = `800 ${fontSize}px ${HOOK_CONFIG.fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const words = text.trim().split(/\s+/);
  const maxW = HOOK_CONFIG.maxWidth * scale;
  let lines = [words.join(' ')];

  // If text is wider than maxW, split into 2 lines
  if (ctx.measureText(lines[0]).width > maxW && words.length > 1) {
    const mid = Math.ceil(words.length / 2);
    lines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
  }

  let widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
  let actualFontSize = fontSize;
  if (widest > maxW) {
    actualFontSize = Math.max(Math.round(24 * scale), Math.round((fontSize * maxW) / widest));
    ctx.font = `800 ${actualFontSize}px ${HOOK_CONFIG.fontFamily}`;
    widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
  }

  const lineH = actualFontSize * 1.22;
  const padX = HOOK_CONFIG.paddingX * scale;
  const padY = HOOK_CONFIG.paddingY * scale;
  const badgeW = widest + padX * 2;
  const badgeH = lineH * lines.length + padY * 2;
  const r = Math.min(HOOK_CONFIG.borderRadius * scale, badgeH / 2);

  const x0 = centerX - badgeW / 2;
  const y0 = centerY - badgeH / 2;

  // Shadow for pill badge
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 18 * scale;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 6 * scale;

  // Draw rounded pill background
  ctx.fillStyle = HOOK_CONFIG.bgColor;
  ctx.beginPath();
  ctx.roundRect(x0, y0, badgeW, badgeH, r);
  ctx.fill();

  // Reset shadow for text
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Draw Hook text
  ctx.fillStyle = HOOK_CONFIG.textColor;
  const startY = centerY - (lineH * (lines.length - 1)) / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, centerX, startY + i * lineH);
  });

  ctx.restore();
}

export function drawCaptions(
  ctx: CanvasRenderingContext2D,
  words: SubtitleWord[],
  currentTime: number,
  styleName: CaptionStyle,
  centerX: number,
  centerY: number,
  scale: number = 1.0
) {
  const cfg = CAPTION_STYLES[styleName];
  const groups = groupWords(words, cfg.wordsPerGroup);

  // Find active group at currentTime
  const activeGroup = groups.find((g) => {
    const gStart = g[0].s;
    const gEnd = g[g.length - 1].e + 0.35;
    return currentTime >= gStart && currentTime <= gEnd;
  });

  if (!activeGroup || activeGroup.length === 0) return;

  ctx.save();
  const fontSize = Math.round(cfg.fontSize * scale);
  ctx.font = `800 ${fontSize}px ${cfg.fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Format words according to uppercase preference
  const formattedWords = activeGroup.map((w) => {
    const raw = w.w.trim();
    return {
      ...w,
      display: cfg.uppercase ? raw.toUpperCase() : raw,
    };
  });

  // Calculate widths of each word
  const wordWidths = formattedWords.map((w) => ctx.measureText(w.display).width);
  const gap = Math.round(28 * scale);
  const totalW = wordWidths.reduce((a, b) => a + b, 0) + gap * (formattedWords.length - 1);

  // Fit into frame if too wide
  let currentScale = scale;
  let fittedFontSize = fontSize;
  const maxW = 960 * scale;
  if (totalW > maxW) {
    const ratio = maxW / totalW;
    fittedFontSize = Math.max(Math.round(28 * scale), Math.round(fontSize * ratio));
    ctx.font = `800 ${fittedFontSize}px ${cfg.fontFamily}`;
    currentScale = scale * ratio;
  }

  // Recalculate with fitted font
  const adjustedWidths = formattedWords.map((w) => ctx.measureText(w.display).width);
  const adjustedGap = Math.round(28 * currentScale);
  const adjustedTotalW = adjustedWidths.reduce((a, b) => a + b, 0) + adjustedGap * (formattedWords.length - 1);

  let currentX = centerX - adjustedTotalW / 2;

  formattedWords.forEach((word, idx) => {
    const wWidth = adjustedWidths[idx];
    const wordCenterX = currentX + wWidth / 2;
    const isSpoken = currentTime >= word.s;
    const isCurrent = currentTime >= word.s && currentTime < word.e + 0.12;

    // Determine scale pop
    let wordScale = 1.0;
    if (isCurrent) {
      const elapsed = currentTime - word.s;
      const targetPop = cfg.popScale;
      if (elapsed < 0.08) {
        wordScale = 0.95 + (targetPop - 0.95) * (elapsed / 0.08);
      } else if (elapsed < 0.18) {
        wordScale = targetPop - 0.04 * ((elapsed - 0.08) / 0.1);
      } else {
        wordScale = targetPop - 0.04;
      }
    }

    // Determine color
    let fill = cfg.baseColor;
    if (word.highlight) {
      fill = cfg.strongColor;
    }
    if (isCurrent) {
      fill = cfg.activeColor;
    }

    ctx.save();
    ctx.translate(wordCenterX, centerY);
    if (wordScale !== 1.0) {
      ctx.scale(wordScale, wordScale);
    }

    // Outline stroke
    ctx.lineWidth = Math.round(cfg.outlineWidth * 2 * currentScale);
    ctx.strokeStyle = cfg.outlineColor;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeText(word.display, 0, 0);

    // Text Fill
    ctx.fillStyle = fill;
    ctx.fillText(word.display, 0, 0);

    ctx.restore();

    currentX += wWidth + adjustedGap;
  });

  ctx.restore();
}

export function renderCompositeFrame({
  ctx,
  video,
  currentTime,
  layout,
  captionStyle,
  showCaptions,
  hook,
  words,
  canvasWidth,
  canvasHeight,
}: RenderFrameOptions) {
  const geom = computeGeometry(
    video.videoWidth || 1920,
    video.videoHeight || 1080,
    layout,
    canvasWidth,
    canvasHeight
  );

  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  if (layout === 'original') {
    // Just draw video directly
    ctx.drawImage(video, 0, 0, canvasWidth, canvasHeight);
  } else if (layout === 'crop') {
    // Edge-to-edge center cropped video
    ctx.drawImage(video, geom.fgX, geom.fgY, geom.fgW, geom.fgH);
  } else {
    // Blur fill or Zoom fill:
    // 1. Draw blurred & dimmed background
    ctx.save();
    // Fast blur via canvas filter (supported in modern browsers)
    try {
      ctx.filter = 'blur(36px) brightness(0.48) saturate(1.2)';
    } catch {
      // fallback
    }
    // Stretch video to fill background
    ctx.drawImage(video, -40, -40, canvasWidth + 80, canvasHeight + 80);
    ctx.restore();

    // 2. Add subtle vignette/dim overlay over background
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();

    // 3. Draw sharp foreground video
    ctx.save();
    // Subtle drop shadow behind foreground
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 30 * geom.scaleFactor;
    ctx.shadowOffsetY = 10 * geom.scaleFactor;
    ctx.drawImage(video, geom.fgX, geom.fgY, geom.fgW, geom.fgH);
    ctx.restore();
  }

  // Draw Hook pill badge if enabled
  if (hook.enabled && hook.text.trim()) {
    const hookYOffset = (canvasHeight * (hook.yOffsetPercent || 0)) / 100;
    const finalHookY = geom.hookY + hookYOffset;
    drawHookTitle(ctx, hook.text, canvasWidth / 2, finalHookY, geom.scaleFactor);
  }

  // Draw Captions if enabled
  if (showCaptions && words.length > 0) {
    drawCaptions(ctx, words, currentTime, captionStyle, canvasWidth / 2, geom.capY, geom.scaleFactor);
  }
}
