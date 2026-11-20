# ClipCap (EditingCation) 🎬✨

> Modern AI-powered short video captioning and vertical layout studio built for content creators. Fully optimized for instant **Vercel** deployment with zero-server client-side rendering.

Inspired by **PeakCut / CLIPPING OG**, ClipCap brings professional short-form video editing into the browser. It combines real-time layout transformations, word-by-word animated captions, and timeline subtitle editing with client-side canvas rendering.

---

## 🚀 Features

### 1. 📐 Frame & Layout Modes
- **Default Frame (Original)**: *"Only add caption"* mode — preserves the source video's natural aspect ratio without cropping, simply overlaying animated captions and hook headings.
- **Blur Fill (9:16 Vertical)**: Centers horizontal 16:9 video and fills the vertical backdrop with a real-time blurred, brightness-dimmed, and saturation-boosted reflection.
- **Zoomed Fill (9:16 Vertical)**: Scales the foreground video to a 1000px height with a blurred vertical fill.
- **Crop Fill (9:16 Vertical)**: Full-bleed center-cropped 1080×1920 vertical format.

### 2. 💬 Caption Styles (PeakCut Engine)
- **Bounce**: Built on *Poppins ExtraBold*, bright yellow/cyan active highlight, 112% animated pop scale, 3 words per group, uppercase.
- **Hype**: Built on *Anton*, punchy neon red active highlight, gold secondary emphasis, 114% pop scale, 2 words per group, uppercase.
- **Clean**: Built on *Poppins ExtraBold*, soft cyan active highlight, subtle 106% pop scale, 4 words per group, sentence case.
- **Captions Toggle**: Easily switch captions ON or OFF with a single click.

### 3. 🎯 Big Text (Hook Heading Pill)
- Add attention-grabbing headline boxes with rounded pill styling (`\p1` bezier curve look).
- Position controls: Above video, top of frame, or below video.

### 4. ⏱️ Interactive Word-by-Word Subtitle Editor
- Edit spoken words, adjust precise start/end timestamps, add/remove words, and toggle emphasis highlights.
- Pre-loaded with demo samples or auto-generate timed words with speech detection.
- Optional `/api/transcribe` endpoint for OpenAI / Groq Whisper.

### 5. ⚡ In-Browser Video Export (Vercel-Friendly)
- **Zero Server Compute / Zero Timeouts**: Uses HTML5 Canvas 2D + Web Audio API + MediaRecorder to composite and export `.webm` / `.mp4` video directly in the browser!
- **Cover / Poster Exporter**: Generate high-quality JPEG poster frames for social media thumbnails with one click.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with dark studio palette
- **Icons**: [Lucide React](https://lucide.dev/)
- **Typography**: Poppins ExtraBold, Anton, Archivo Black (bundled TTF fonts with `@font-face`)
- **Video Engine**: HTML5 Canvas 2D + Web Audio API + MediaRecorder

---

## 📦 Getting Started

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

Verify the production build locally:
```bash
npm run build
npm start
```

---

## ☁️ Deploy to Vercel

ClipCap is built to deploy seamlessly to Vercel without requiring complex FFmpeg binaries or background worker setups:

1. Push this repository to GitHub.
2. Go to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import your `clipcap` repository.
4. Click **Deploy**. (No environment variables required for basic operation; optionally set `OPENAI_API_KEY` or `GROQ_API_KEY` for Whisper transcription API).

---

## 📄 License

MIT License. Designed with inspiration from PeakCut.
