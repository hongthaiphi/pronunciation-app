// Wrapper cho Gemini API (thay thế Claude)

export interface FeedbackRequest {
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  prosodyScore: number;
  incorrectPhonemes: string[];
  referenceText: string;
}

export async function generateVietnameseFeedback(
  request: FeedbackRequest
): Promise<string> {
  const response = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Failed to generate feedback');
  }

  const data = await response.json();
  return data.feedback;
}
