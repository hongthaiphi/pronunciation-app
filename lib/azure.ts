// Wrapper cho Azure Speech Service SDK
// Sẽ được implement chi tiết sau

export interface PronunciationResult {
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  prosodyScore: number;
  words: WordResult[];
}

export interface WordResult {
  word: string;
  accuracyScore: number;
  errorType: string;
  phonemes: PhonemeResult[];
}

export interface PhonemeResult {
  phoneme: string;
  accuracyScore: number;
}

export async function assessPronunciation(
  audioData: ArrayBuffer,
  referenceText: string
): Promise<PronunciationResult> {
  const formData = new FormData();
  formData.append('audio', new Blob([audioData], { type: 'audio/wav' }));
  formData.append('referenceText', referenceText);

  const response = await fetch('/api/assess', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to assess pronunciation');
  }

  return response.json();
}

export function generateFeedback(result: PronunciationResult): Promise<string> {
  return fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result),
  }).then(res => res.json()).then(data => data.feedback);
}
