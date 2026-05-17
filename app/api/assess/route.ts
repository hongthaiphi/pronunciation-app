import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;

  if (!key || !region) {
    return NextResponse.json({ error: 'Azure credentials not configured' }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const audio = formData.get('audio') as File | null;
    const referenceText = formData.get('referenceText') as string | null;

    if (!audio || !referenceText) {
      return NextResponse.json({ error: 'Missing audio or referenceText' }, { status: 400 });
    }

    const audioBuffer = Buffer.from(await audio.arrayBuffer());

    const pronunciationConfig = JSON.stringify({
      ReferenceText: referenceText,
      GradingSystem: 'HundredMark',
      Granularity: 'Phoneme',
      EnableMiscue: true,
    });
    const pronunciationConfigB64 = Buffer.from(pronunciationConfig).toString('base64');

    const speechRes = await fetch(
      `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': key,
          'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
          'Pronunciation-Assessment': pronunciationConfigB64,
        },
        body: audioBuffer,
      }
    );

    const rawText = await speechRes.text();
    if (!speechRes.ok) {
      throw new Error(`Azure STT error ${speechRes.status}: ${rawText}`);
    }

    const speechJson = JSON.parse(rawText);
    const nBest = speechJson?.NBest?.[0];

    if (!nBest) {
      return NextResponse.json({ error: 'No recognition result' }, { status: 422 });
    }

    // Azure REST API trả về flat format: scores nằm thẳng trên object, không phải trong PronunciationAssessment
    const words: AzureWord[] = nBest.Words ?? [];
    const spokenWords = words.filter((w) => w.Duration > 0);
    const totalWords = words.length;

    const accuracyScore = nBest.AccuracyScore ?? 0;
    const fluencyScore = nBest.FluencyScore ?? accuracyScore;
    const completenessScore = nBest.CompletenessScore ??
      (totalWords > 0 ? Math.round((spokenWords.length / totalWords) * 100) : 0);
    const prosodyScore = nBest.PronScore ?? accuracyScore;

    return NextResponse.json({
      accuracyScore,
      fluencyScore,
      completenessScore,
      prosodyScore,
      words: words.map((w) => ({
        word: w.Word,
        accuracyScore: w.AccuracyScore ?? 0,
        errorType: w.Duration === 0 ? 'Omission' : 'None',
        phonemes: (w.Phonemes ?? []).map((p) => ({
          phoneme: p.Phoneme,
          accuracyScore: p.AccuracyScore ?? 0,
        })),
      })),
    });
  } catch (error) {
    console.error('[assess] error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

interface AzureWord {
  Word: string;
  AccuracyScore?: number;
  Duration: number;
  Phonemes?: AzurePhoneme[];
}

interface AzurePhoneme {
  Phoneme: string;
  AccuracyScore?: number;
}
