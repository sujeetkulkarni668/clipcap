import { CaptionStyle, LayoutMode } from '@/types/editor';

export const CANVAS_OUT_W = 1080;
export const CANVAS_OUT_H = 1920;

export interface StyleConfig {
  name: CaptionStyle;
  label: string;
  fontFamily: string;
  fontSize: number; // in px for 1080w
  baseColor: string;
  activeColor: string;
  strongColor: string;
  outlineColor: string;
  outlineWidth: number;
  popScale: number; // e.g. 1.12
  uppercase: boolean;
  wordsPerGroup: number;
  description: string;
  badge: string;
}

export const CAPTION_STYLES: Record<CaptionStyle, StyleConfig> = {
  bounce: {
    name: 'bounce',
    label: 'Bounce',
    fontFamily: '"Poppins ExtraBold", sans-serif',
    fontSize: 94,
    baseColor: '#FFFFFF',
    activeColor: '#FFF000', // PeakCut electric yellow
    strongColor: '#00F0FF', // PeakCut cyan
    outlineColor: '#000000',
    outlineWidth: 8,
    popScale: 1.12,
    uppercase: true,
    wordsPerGroup: 3,
    description: 'Poppins ExtraBold, yellow highlight, 112% pop scale, 3 words',
    badge: 'POPULAR',
  },
  hype: {
    name: 'hype',
    label: 'Hype',
    fontFamily: '"Anton", sans-serif',
    fontSize: 110,
    baseColor: '#FFFFFF',
    activeColor: '#FF3C3C', // PeakCut punchy red
    strongColor: '#FFD700', // PeakCut bright gold
    outlineColor: '#000000',
    outlineWidth: 8,
    popScale: 1.14,
    uppercase: true,
    wordsPerGroup: 2,
    description: 'Anton Bold, energetic red & gold highlight, 114% pop scale, 2 words',
    badge: 'HIGH ENERGY',
  },
  clean: {
    name: 'clean',
    label: 'Clean',
    fontFamily: '"Poppins ExtraBold", sans-serif',
    fontSize: 76,
    baseColor: '#FFFFFF',
    activeColor: '#6BD7FF', // PeakCut soft cyan
    strongColor: '#FFFFFF',
    outlineColor: '#000000',
    outlineWidth: 6,
    popScale: 1.06,
    uppercase: false,
    wordsPerGroup: 4,
    description: 'Poppins ExtraBold, soft cyan accent, 106% subtle pop, 4 words',
    badge: 'MINIMAL',
  },
};

export interface LayoutConfig {
  id: LayoutMode;
  name: string;
  description: string;
  tag: string;
  iconName: string;
}

export const LAYOUT_MODES: Record<LayoutMode, LayoutConfig> = {
  original: {
    id: 'original',
    name: 'Default Frame (Original)',
    description: 'Keep source aspect ratio, no vertical fill. Pure overlay.',
    tag: 'ORIGINAL',
    iconName: 'Maximize2',
  },
  blur: {
    id: 'blur',
    name: 'Blur Fill (9:16 Vertical)',
    description: 'Full frame centered foreground with blurred dimmed background.',
    tag: 'CLASSIC 9:16',
    iconName: 'Layers',
  },
  zoom: {
    id: 'zoom',
    name: 'Zoomed Fill (9:16 Vertical)',
    description: 'Zoomed-in foreground (1000px height) over blurred background.',
    tag: 'FOCUSED',
    iconName: 'ZoomIn',
  },
  crop: {
    id: 'crop',
    name: 'Crop Fill (9:16 Vertical)',
    description: 'Full-frame center crop to edge-to-edge 1080x1920.',
    tag: 'FULL SCREEN',
    iconName: 'Crop',
  },
};

export const HOOK_CONFIG = {
  fontFamily: '"Poppins ExtraBold", sans-serif',
  fontSize: 62,
  textColor: '#14100E',
  bgColor: '#FFFFFF',
  paddingX: 36,
  paddingY: 20,
  borderRadius: 24,
  maxWidth: 880,
};
