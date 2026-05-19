# Pronunciation Practice App

> Webapp luyện phát âm tiếng Anh miễn phí — tương tự ELSA Speak, chạy trên trình duyệt, không cần cài đặt.

**Live:** https://pronunciation-app-beta.vercel.app

---

## Tính Năng Hiện Tại

| Tính năng | Trạng thái |
|---|---|
| Ghi âm từ mic (MediaRecorder) | ✅ |
| Chuyển đổi WAV PCM 16kHz mono (browser-side) | ✅ |
| Đánh giá phát âm phoneme-level (Azure Speech) | ✅ |
| Hiển thị điểm tổng + 4 sub-scores | ✅ |
| Highlight từng âm vị sai theo IPA chuẩn | ✅ |
| Modal chi tiết từng âm vị khi click vào từ | ✅ |
| Phát âm mẫu TTS (Azure Jenny Neural) | ✅ |
| Feedback tiếng Việt từ Gemini AI | ✅ |
| Skeleton loading animation trong khi AI xử lý | ✅ |
| Trang luyện câu đơn với lọc theo trình độ A1–C1 | ✅ |
| Trang đọc đoạn văn với lọc theo trình độ A1–C1 | ✅ |
| Click từng từ để nghe phát âm riêng lẻ | ✅ |
| Thư viện 60 câu luyện (A1×10, A2×10, B1×10, B2×10, C1×10) | ✅ |
| Thư viện 25 đoạn văn (A1×5, A2×5, B1×5, B2×5, C1×5) | ✅ |
| Badge phoneme focus trên mỗi câu/đoạn | ✅ |
| Deploy Vercel (CI/CD tự động) | ✅ |
| Pitch contour chart | 🔄 |
| Lịch sử luyện tập + chart tiến bộ | 🔄 |
| Trang drill từng phoneme `/drill/[phoneme]` | 🔄 |
| Auth / User account | 🔄 |
| Gamification (streak, điểm tích lũy) | 🔄 |

---

## Tech Stack

| Layer | Công nghệ |
|---|---|
| Frontend | Next.js 14 App Router, TypeScript, Tailwind CSS |
| Speech Assessment | Azure Speech Service REST API (southeastasia) |
| AI Feedback | Google Gemini 2.5 Flash (`@google/generative-ai`) |
| Text-to-Speech | Azure TTS (en-US-JennyNeural) |
| Audio Processing | Web Audio API + OfflineAudioContext (browser-side) |
| Deploy | Vercel (free tier) |

---

## Cài Đặt & Chạy Local

### Yêu cầu
- Node.js 18+
- Tài khoản [Azure Speech Service](https://azure.microsoft.com/services/cognitive-services/speech-services/) (free: 5h audio/tháng)
- [Google AI Studio API key](https://aistudio.google.com/) (Gemini — free tier 1500 req/ngày)

### 1. Clone & cài dependencies

```bash
git clone <repo-url>
cd pronunciation-app
npm install
```

### 2. Tạo file `.env.local`

```env
AZURE_SPEECH_KEY=your_azure_speech_key
AZURE_SPEECH_REGION=southeastasia
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Chạy dev server

```bash
npm run dev
```

Truy cập: http://localhost:3000

### 4. Build production

```bash
npm run build
npm start
```

---

## Cấu Trúc Thư Mục

```
pronunciation-app/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── practice/
│   │   └── page.tsx                # Luyện câu đơn (3 bước: chọn→ghi âm→kết quả)
│   ├── passage/
│   │   └── page.tsx                # Đọc đoạn văn (3 bước: chọn→ghi âm→kết quả)
│   ├── api/
│   │   ├── assess/route.ts         # Azure Speech REST API wrapper
│   │   ├── feedback/route.ts       # Gemini AI feedback generator
│   │   └── tts/route.ts            # Azure TTS (Jenny Neural)
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── Recorder.tsx                # MediaRecorder + volume meter realtime
│   ├── ScoreDisplay.tsx            # Điểm tổng + 4 sub-scores + phoneme badges IPA
│   ├── PassageResult.tsx           # Kết quả đọc đoạn văn (word-level coloring)
│   └── PhonemeDetail.tsx           # Modal IPA chi tiết khi click vào từ
├── lib/
│   ├── audio.ts                    # audioToWav(): WebM → WAV PCM 16kHz mono
│   ├── azure.ts                    # Type definitions (PronunciationResult, WordResult…)
│   ├── claude.ts                   # Gemini fetch helper
│   └── phoneme.ts                  # Azure SAPI → IPA mapping (aa→ɑː, th→θ…)
├── data/
│   ├── sentences.json              # 60 câu luyện (10 câu × 5 cấp độ)
│   └── passages.json               # 25 đoạn văn (5 đoạn × 5 cấp độ)
├── docs/
│   ├── CHANGELOG.md                # Lịch sử tính năng theo thứ tự
│   └── claude_context.md           # Context snapshot cho AI session
└── .env.local                      # API keys (không commit)
```

---

## Luồng Dữ Liệu

```
User mic
  → MediaRecorder (WebM/Opus, browser)
  → lib/audio.ts: audioToWav()
     → AudioContext.decodeAudioData()
     → OfflineAudioContext resample → 16kHz mono
     → bufferToWav() → ArrayBuffer
  → POST /api/assess (FormData: audio.wav + referenceText)
     → Azure REST: southeastasia.stt.speech.microsoft.com
     → Header: Pronunciation-Assessment (base64 JSON config)
     → Response: flat JSON {NBest[0].AccuracyScore, Words[], Phonemes[]}
     → Map: Azure SAPI phoneme → IPA (lib/phoneme.ts)
  → POST /api/feedback (JSON scores + referenceText)
     → Gemini 2.5 Flash
     → Vietnamese feedback text
  → UI:
     → ScoreDisplay: 4 vòng tròn điểm + từng âm vị
     → PhonemeDetail: modal IPA khi click từ
     → AI feedback block (skeleton → text)
```

---

## Lưu Ý Kỹ Thuật Quan Trọng

### Azure REST API (không dùng SDK)
Azure Speech SDK dùng native binary — không chạy được trên Vercel serverless. Thay bằng REST API trực tiếp:
- Auth: `Ocp-Apim-Subscription-Key` header (không cần token exchange)
- Config: `Pronunciation-Assessment` header = base64(JSON config)
- **Không dùng** `EnableProsodyAssessment` trong REST config (SDK-only, gây scores = 0)

### Azure Response Format (flat, không phải nested)
```json
{
  "NBest": [{
    "AccuracyScore": 87,
    "FluencyScore": 91,
    "Words": [{
      "Word": "hello",
      "AccuracyScore": 95,
      "Phonemes": [{ "Phoneme": "hh", "AccuracyScore": 98 }]
    }]
  }]
}
```
`AccuracyScore` nằm thẳng trên `NBest[0]` và `Words[]`, **không** có sub-object `PronunciationAssessment`.

### Gemini Model
Dùng `gemini-2.5-flash`. Các model khác lỗi với free API key:
- `gemini-1.5-flash` → 404 (deprecated)
- `gemini-2.0-flash-lite` → 429 quota=0

---

## Deploy lên Vercel

```bash
npx vercel --prod
```

Environment variables cần set trên Vercel Dashboard:
```
AZURE_SPEECH_KEY
AZURE_SPEECH_REGION
GEMINI_API_KEY
```

---

## Roadmap

### Ưu tiên cao
- [ ] **Pitch contour chart** — Web Audio API phân tích pitch, vẽ bằng Chart.js, overlay với TTS
- [ ] **Lịch sử luyện tập** — lưu kết quả vào Supabase, hiển thị chart tiến bộ
- [ ] **Drill phoneme** — trang `/drill/[phoneme]` luyện riêng âm `/θ/`, `/ð/`, `/æ/`...

### Ưu tiên trung bình
- [ ] **Auth** — NextAuth.js + Supabase (lưu lịch sử theo user)
- [ ] **Mobile polish** — layout responsive, touch-friendly recorder
- [ ] **TTS per-word** — Azure TTS thay browser SpeechSynthesis cho phát âm từng từ

### Ưu tiên thấp
- [ ] Gamification (streak, điểm tích lũy, leaderboard)
- [ ] Admin panel thêm/sửa nội dung luyện
- [ ] PWA (offline support)

---

## Tài Liệu Tham Khảo

- [Azure Pronunciation Assessment REST API](https://learn.microsoft.com/azure/ai-services/speech-service/rest-speech-to-text-short)
- [Azure Pronunciation Assessment Concepts](https://learn.microsoft.com/azure/ai-services/speech-service/how-to-pronunciation-assessment)
- [Google Generative AI SDK](https://ai.google.dev/gemini-api/docs)
- [Next.js 14 App Router](https://nextjs.org/docs/app)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

---

*Powered by Azure Speech Service + Google Gemini AI*
