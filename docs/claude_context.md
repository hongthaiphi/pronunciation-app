# Project Context Snapshot — pronunciation-app
> Generated: 2026-05-18 | Session summary for AI context continuity

---

## 1. Project Status

### ✅ Đã hoàn thành
- Cấu trúc thư mục Next.js 14 App Router đầy đủ
- Trang chủ (`/`) và trang luyện tập (`/practice`)
- Component `Recorder` — ghi âm qua mic, volume meter realtime, playback
- Component `ScoreDisplay` — điểm tổng + 4 sub-scores + phoneme badges theo IPA
- Component `PhonemeDetail` — modal click vào từ để xem từng âm vị
- API `/api/assess` — gọi Azure Speech REST API (flat format), trả điểm phoneme-level
- API `/api/feedback` — gọi Gemini 2.5 Flash, sinh feedback tiếng Việt
- Mapping Azure SAPI → IPA chuẩn (`lib/phoneme.ts`)
- Skeleton loading animation cho phần AI feedback
- Deploy lên Vercel: **https://pronunciation-app-beta.vercel.app**
- Env vars đã set trên Vercel (AZURE_SPEECH_KEY, AZURE_SPEECH_REGION, GEMINI_API_KEY)

### 🔄 Chưa làm (từ spec gốc)
- Pitch contour chart (WaveSurfer.js / Plotly)
- Lịch sử luyện tập + chart tiến bộ (cần DB: SQLite hoặc Supabase)
- Trang luyện riêng từng phoneme (`/drill/[phoneme]`)
- Gamification (streak, điểm tích lũy)
- Mobile responsive polish
- Auth / user account

---

## 2. Architecture & Tech Stack

```
pronunciation-app/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── practice/page.tsx         # Main practice flow (3 steps: select→record→result)
│   ├── api/assess/route.ts       # Azure Speech REST API wrapper
│   ├── api/feedback/route.ts     # Gemini feedback generator
│   └── globals.css
├── components/
│   ├── Recorder.tsx              # MediaRecorder + volume analyser
│   ├── ScoreDisplay.tsx          # Scores + phoneme-level word chips
│   └── PhonemeDetail.tsx         # Modal with IPA display
├── lib/
│   ├── audio.ts                  # WAV conversion (browser-side, 16kHz mono)
│   ├── azure.ts                  # Type definitions + client-side fetch helpers
│   ├── claude.ts                 # (stub) Gemini fetch helper
│   └── phoneme.ts                # Azure SAPI → IPA mapping table
├── data/sentences.json           # 8 câu luyện mẫu (A1–C1)
└── .env.local                    # Keys (không commit)
```

**Tech Stack:**
| Layer | Choice |
|---|---|
| Frontend | Next.js 14 App Router, TypeScript, Tailwind CSS |
| Speech Assessment | Azure Speech Service REST API (southeastasia) |
| AI Feedback | Google Gemini 2.5 Flash (`@google/generative-ai`) |
| Audio Processing | Web Audio API + OfflineAudioContext (browser-side) |
| Deploy | Vercel free tier |

**Data flow chính:**
```
User mic → MediaRecorder (WebM/Opus)
  → lib/audio.ts: audioToWav() → WAV PCM 16kHz mono (browser)
  → POST /api/assess (FormData: audio + referenceText)
  → Azure REST API (Pronunciation-Assessment header, base64 JSON config)
  → Flat JSON response: nBest[0].AccuracyScore, Words[].AccuracyScore, Phonemes[].AccuracyScore
  → POST /api/feedback (JSON scores)
  → Gemini 2.5 Flash → Vietnamese feedback text
  → UI render: ScoreDisplay + PhonemeDetail + feedback
```

---

## 3. Key Decisions

### Azure SDK → REST API trực tiếp
**Vấn đề:** `microsoft-cognitiveservices-speech-sdk` dùng native binary, không chạy trên Vercel serverless.  
**Giải pháp:** Gọi Azure REST endpoint trực tiếp với `Ocp-Apim-Subscription-Key` header + `Pronunciation-Assessment` header (base64-encoded JSON).  
**Lưu ý:** Dùng subscription key thay vì token-based auth (đơn giản hơn, đủ dùng cho MVP).

### Azure response là flat format (không phải nested)
**Phát hiện từ debug:** Azure trả về scores thẳng tại `nBest[0].AccuracyScore`, `Words[].AccuracyScore`, `Phonemes[].AccuracyScore` — **không** có sub-object `PronunciationAssessment`.  
**Fix:** Parse trực tiếp từ flat keys. FluencyScore/CompletenessScore đôi khi không có → tính fallback từ words.Duration.

### Gemini thay Claude
**Lý do:** Gemini có free tier 1500 req/ngày, Claude API tính phí từ đầu.  
**Model:** `gemini-2.5-flash` (model mới nhất hoạt động với API key; `gemini-1.5-flash` và `gemini-2.0-flash-lite` đều lỗi với key này).

### Audio conversion ở client-side
**Lý do:** Tránh gửi WebM/Opus raw lên server rồi convert (tốn bandwidth, phức tạp). Convert WAV PCM 16kHz mono bằng `OfflineAudioContext` ngay trên browser trước khi POST.

### `EnableProsodyAssessment` bị loại khỏi config
**Lý do:** Đây là SDK-specific property, không hợp lệ trong REST API JSON config. Giữ nguyên gây Azure bỏ qua cả config → tất cả scores về 0.

---

## 4. Core Code Snippets

### Azure REST API call (`app/api/assess/route.ts`)
```typescript
const pronunciationConfig = JSON.stringify({
  ReferenceText: referenceText,
  GradingSystem: 'HundredMark',
  Granularity: 'Phoneme',
  EnableMiscue: true,
  // KHÔNG thêm EnableProsodyAssessment — invalid cho REST API
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

// Parse flat format (không nested PronunciationAssessment)
const nBest = speechJson?.NBest?.[0];
const words: AzureWord[] = nBest.Words ?? [];
const spokenWords = words.filter((w) => w.Duration > 0);

return {
  accuracyScore: nBest.AccuracyScore ?? 0,
  fluencyScore: nBest.FluencyScore ?? nBest.AccuracyScore ?? 0,
  completenessScore: nBest.CompletenessScore ??
    Math.round((spokenWords.length / words.length) * 100),
  prosodyScore: nBest.PronScore ?? nBest.AccuracyScore ?? 0,
  words: words.map((w) => ({
    word: w.Word,
    accuracyScore: w.AccuracyScore ?? 0,
    errorType: w.Duration === 0 ? 'Omission' : 'None',
    phonemes: (w.Phonemes ?? []).map((p) => ({
      phoneme: p.Phoneme,
      accuracyScore: p.AccuracyScore ?? 0,
    })),
  })),
};
```

### Audio WAV conversion (`lib/audio.ts`)
```typescript
export async function audioToWav(audioBlob: Blob, targetSampleRate = 16000): Promise<ArrayBuffer> {
  const arrayBuffer = await audioBlob.arrayBuffer();
  const audioContext = new AudioContext({ sampleRate: targetSampleRate });
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  if (audioBuffer.sampleRate !== targetSampleRate) {
    return resampleAudio(audioBuffer, targetSampleRate);
  }
  return bufferToWav(audioBuffer);
}

async function resampleAudio(audioBuffer: AudioBuffer, newSampleRate: number): Promise<ArrayBuffer> {
  const offlineContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    Math.ceil(audioBuffer.duration * newSampleRate),
    newSampleRate
  );
  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineContext.destination);
  source.start();
  const rendered = await offlineContext.startRendering();
  return bufferToWav(rendered);
}
```

### Azure SAPI → IPA mapping (`lib/phoneme.ts`)
```typescript
const AZURE_TO_IPA: Record<string, string> = {
  aa:'ɑː', ae:'æ',  ah:'ʌ',  ao:'ɔː', aw:'aʊ', ax:'ə',
  ay:'aɪ', eh:'ɛ',  er:'ɜːr',ey:'eɪ', ih:'ɪ',  iy:'iː',
  ow:'oʊ', oy:'ɔɪ', uh:'ʊ',  uw:'uː',
  b:'b', ch:'tʃ', d:'d', dh:'ð', f:'f', g:'ɡ', hh:'h',
  jh:'dʒ', k:'k', l:'l', m:'m', n:'n', ng:'ŋ',  p:'p',
  r:'r', s:'s', sh:'ʃ', t:'t', th:'θ', v:'v', w:'w',
  y:'j', z:'z', zh:'ʒ',
};
export const toIPA = (p: string) => AZURE_TO_IPA[p.toLowerCase()] ?? p;
```

---

## 5. Next Steps

Ưu tiên cao:
- [ ] **Pitch contour chart** — dùng Web Audio API phân tích pitch từ recording, vẽ bằng Plotly hoặc Chart.js, overlay với native TTS
- [ ] **Lịch sử luyện tập** — lưu kết quả vào Supabase (free tier), hiển thị chart tiến bộ theo thời gian
- [ ] **Thêm câu luyện** — mở rộng `data/sentences.json` lên 50+ câu, phân loại theo chủ đề và cấp độ A1–C1

Ưu tiên trung bình:
- [ ] **Drill phoneme cụ thể** — trang `/drill/[phoneme]` cho phép luyện riêng âm `/θ/`, `/ð/`, `/æ/`...
- [ ] **Mobile polish** — test và fix layout trên điện thoại
- [ ] **Native TTS chất lượng cao** — thay browser SpeechSynthesis bằng Azure TTS (giọng `en-US-JennyNeural`)

Ưu tiên thấp:
- [ ] Auth / user account (NextAuth.js + Supabase)
- [ ] Gamification (streak, leaderboard)
- [ ] Admin panel thêm/sửa câu luyện

---

## Env Variables (đã set cả local lẫn Vercel)
```
AZURE_SPEECH_KEY=...
AZURE_SPEECH_REGION=southeastasia
GEMINI_API_KEY=...
```

## Vercel Project
- URL: https://pronunciation-app-beta.vercel.app
- Project: phihongthaiit-9660s-projects/pronunciation-app
- Account: phihongthaiit-9660
