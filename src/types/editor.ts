export type LayoutMode = 'original' | 'blur' | 'zoom' | 'crop';

export type CaptionStyle = 'bounce' | 'hype' | 'clean';

export interface SubtitleWord {
  id: string;
  w: string;       // word text
  s: number;       // start time in seconds
  e: number;       // end time in seconds
  highlight?: boolean; // strong highlight override
}

export interface HookSettings {
  enabled: boolean;
  text: string;
  yOffsetPercent: number; // percentage offset from default hook position (0 means default)
}

export interface VideoPreset {
  id: string;
  name: string;
  videoUrl: string;
  coverUrl: string;
  defaultHook: string;
  defaultStyle: CaptionStyle;
  defaultLayout: LayoutMode;
  words: SubtitleWord[];
}

export interface ExportProgress {
  isExporting: boolean;
  progress: number; // 0 to 100
  statusText: string;
  downloadUrl: string | null;
  fileName: string | null;
  error: string | null;
}
