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

    // Lấy access token từ Azure
    const tokenRes = await fetch(
      `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      { method: 'POST', headers: { 'Ocp-Apim-Subscription-Key': key } }
    );
    if (!tokenRes.ok) throw new Error('Failed to get Azure token');
    const token = await tokenRes.text();

    // Pronunciation Assessment qua REST API
    const pronunciationConfig = JSON.stringify({
      ReferenceText: referenceText,
      GradingSystem: 'HundredMark',
      Granularity: 'Phoneme',
      EnableMiscue: true,
      EnableProsodyAssessment: true,
    });
    const pronunciationConfigB64 = Buffer.from(pronunciationConfig).toString('base64');

    const speechRes = await fetch(
      `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
          'Pronunciation-Assessment': pronunciationConfigB64,
        },
        body: audioBuffer,
      }
    );

    if (!speechRes.ok) {
      const errText = await speechRes.text();
      throw new Error(`Azure STT error: ${errText}`);
    }

    const speechJson = await speechRes.json();
    const nBest = speechJson?.NBest?.[0];

    if (!nBest) {
      return NextResponse.json({ error: 'No recognition result' }, { status: 422 });
    }

    const pa = nBest.PronunciationAssessment;
    return NextResponse.json({
      accuracyScore: pa?.AccuracyScore ?? 0,
      fluencyScore: pa?.FluencyScore ?? 0,
      completenessScore: pa?.CompletenessScore ?? 0,
      prosodyScore: pa?.ProsodyScore ?? 0,
      words: (nBest.Words ?? []).map((w: AzureWord) => ({
        word: w.Word,
        accuracyScore: w.PronunciationAssessment?.AccuracyScore ?? 0,
        errorType: w.PronunciationAssessment?.ErrorType ?? 'None',
        phonemes: (w.Phonemes ?? []).map((p: AzurePhoneme) => ({
          phoneme: p.Phoneme,
          accuracyScore: p.PronunciationAssessment?.AccuracyScore ?? 0,
        })),
      })),
    });
  } catch (error) {
    console.error('Assessment error:', error);
    return NextResponse.json({ error: 'Failed to assess pronunciation' }, { status: 500 });
  }
}

interface AzureWord {
  Word: string;
  PronunciationAssessment?: { AccuracyScore: number; ErrorType: string };
  Phonemes?: AzurePhoneme[];
}

interface AzurePhoneme {
  Phoneme: string;
  PronunciationAssessment?: { AccuracyScore: number };
}
