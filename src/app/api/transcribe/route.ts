import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const apiKey = (formData.get('apiKey') as string) || process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY;
    const provider = (formData.get('provider') as string) || 'openai'; // 'openai' or 'groq'

    if (!file) {
      return NextResponse.json({ error: 'No audio/video file provided' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'No API key provided. Please provide an OpenAI or Groq API key, or use the built-in auto-transcribe generator.',
          fallbackAvailable: true,
        },
        { status: 400 }
      );
    }

    // Call OpenAI Whisper or Groq Whisper API
    const whisperFormData = new FormData();
    whisperFormData.append('file', file, file.name || 'audio.mp4');
    whisperFormData.append('model', provider === 'groq' ? 'whisper-large-v3' : 'whisper-1');
    whisperFormData.append('response_format', 'verbose_json');
    whisperFormData.append('timestamp_granularities[]', 'word');

    const endpoint =
      provider === 'groq'
        ? 'https://api.groq.com/openai/v1/audio/transcriptions'
        : 'https://api.openai.com/v1/audio/transcriptions';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: whisperFormData,
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Transcription API error (${response.status}): ${errText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Map verbose_json word array to SubtitleWord[]
    const words = (data.words || []).map((w: { word: string; start: number; end: number }, i: number) => ({
      id: `word_${i}_${Date.now()}`,
      w: w.word.trim(),
      s: Number(w.start.toFixed(2)),
      e: Number(w.end.toFixed(2)),
    }));

    return NextResponse.json({
      text: data.text,
      words,
      duration: data.duration,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown transcription error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
