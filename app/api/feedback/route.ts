import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accuracyScore, fluencyScore, completenessScore, prosodyScore, words, referenceText } = body;

    const incorrectWords = words
      .filter((w: { accuracyScore: number; errorType: string }) => w.accuracyScore < 80 || w.errorType !== 'None')
      .map((w: { word: string; accuracyScore: number; errorType: string; phonemes: { phoneme: string; accuracyScore: number }[] }) => ({
        word: w.word,
        score: Math.round(w.accuracyScore),
        errorType: w.errorType,
        badPhonemes: w.phonemes
          .filter((p: { accuracyScore: number }) => p.accuracyScore < 70)
          .map((p: { phoneme: string; accuracyScore: number }) => `/${p.phoneme}/ (${Math.round(p.accuracyScore)})`),
      }));

    const prompt = `Bạn là giáo viên tiếng Anh chuyên dạy phát âm cho học sinh Việt Nam.

Học sinh vừa luyện đọc câu: "${referenceText}"

Kết quả đánh giá:
- Chính xác (Accuracy): ${Math.round(accuracyScore)}/100
- Trôi chảy (Fluency): ${Math.round(fluencyScore)}/100
- Hoàn chỉnh (Completeness): ${Math.round(completenessScore)}/100
- Ngữ điệu (Prosody): ${Math.round(prosodyScore)}/100

Các từ cần cải thiện:
${incorrectWords.length > 0
  ? incorrectWords.map((w: { word: string; score: number; errorType: string; badPhonemes: string[] }) =>
      `- "${w.word}": điểm ${w.score}, lỗi "${w.errorType}"${w.badPhonemes.length > 0 ? `, phoneme yếu: ${w.badPhonemes.join(', ')}` : ''}`
    ).join('\n')
  : '- Không có từ nào cần cải thiện đặc biệt'}

Hãy viết feedback ngắn gọn bằng tiếng Việt (3-5 câu), bao gồm:
1. Nhận xét tổng quan (1 câu)
2. Chỉ ra 1-2 lỗi cụ thể nhất kèm mẹo sửa (khẩu hình miệng, vị trí lưỡi, cách thở)
3. Một lời động viên ngắn

Chỉ viết feedback, không cần tiêu đề hay danh sách.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const feedback = result.response.text();

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Feedback error:', error);
    return NextResponse.json({ error: 'Failed to generate feedback' }, { status: 500 });
  }
}
