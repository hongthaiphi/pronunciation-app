import { NextRequest, NextResponse } from 'next/server';

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function POST(req: NextRequest) {
  const { text, rate = '-10%' } = await req.json();
  if (!text) return NextResponse.json({ error: 'Missing text' }, { status: 400 });

  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) {
    return NextResponse.json({ error: 'Azure credentials missing' }, { status: 500 });
  }

  const ssml = `<speak version='1.0' xml:lang='en-US'>
  <voice name='en-US-JennyNeural'>
    <prosody rate='${rate}'>${escapeXml(text)}</prosody>
  </voice>
</speak>`;

  const res = await fetch(
    `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
      },
      body: ssml,
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    console.error('Azure TTS error:', res.status, errText);
    return NextResponse.json({ error: 'TTS failed' }, { status: 502 });
  }

  const audio = await res.arrayBuffer();
  return new NextResponse(audio, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
