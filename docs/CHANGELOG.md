# Changelog — Pronunciation Practice App

> Ghi nhận toàn bộ tính năng theo đúng thứ tự phát triển.

---

## Phase 1 — Khởi tạo dự án (2026-05-18)

### Cấu trúc dự án
- Tạo project Next.js 14 App Router với TypeScript và Tailwind CSS
- Cấu hình `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `.eslintrc.json`
- Tạo cấu trúc thư mục: `app/`, `components/`, `lib/`, `data/`, `docs/`
- Downgrade React 18 (`^18.2.0`) để tránh peer dep conflict với Next.js 14
- Bỏ `@shadcn/ui` (không phải npm package thực), giữ lại `clsx`, `class-variance-authority`, `tailwind-merge`

### Type definitions (`lib/azure.ts`)
- Định nghĩa interface `PhonemeResult`, `WordResult`, `PronunciationResult`
- Các type được dùng xuyên suốt toàn bộ components và API routes

### Xử lý audio (`lib/audio.ts`)
- Hàm `audioToWav(blob, targetSampleRate)`: chuyển WebM/Opus → WAV PCM 16kHz mono
- Dùng `AudioContext.decodeAudioData()` để decode audio blob
- Dùng `OfflineAudioContext` để resample về 16kHz
- Hàm `bufferToWav()`: viết WAV header chuẩn (RIFF/PCM) + interleave channels
- Xử lý hoàn toàn ở client-side (không cần server-side processing)

---

## Phase 2 — Trang chủ & Component Recorder (2026-05-18)

### Landing page (`app/page.tsx`)
- Grid 2×2 giới thiệu 4 tính năng: Đánh giá phát âm, Biểu đồ Ngữ điệu, Hướng dẫn Chi tiết, Theo dõi Tiến bộ
- 2 nút CTA: "Luyện từng câu" (`/practice`) và "Đọc đoạn văn" (`/passage`)
- Responsive: 1 cột trên mobile, 2 cột trên desktop

### Component Recorder (`components/Recorder.tsx`)
- Ghi âm qua mic sử dụng `MediaRecorder` Web API
- Volume meter realtime (AnalyserNode + requestAnimationFrame)
- Nút toggle: bắt đầu/dừng ghi âm
- Playback audio sau khi ghi
- Callback `onRecordingComplete(blob: Blob)` sau khi dừng ghi

---

## Phase 3 — Azure Speech Assessment API (2026-05-18)

### API `/api/assess` (`app/api/assess/route.ts`)
- Nhận FormData: `audio` (WAV file) + `referenceText`
- Gọi Azure Speech Service REST endpoint trực tiếp (thay SDK):
  - URL: `https://{region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed`
  - Auth: `Ocp-Apim-Subscription-Key` header (không cần token exchange)
  - Config: `Pronunciation-Assessment` header = base64(JSON) với `GradingSystem: HundredMark`, `Granularity: Phoneme`, `EnableMiscue: true`
- **Phát hiện quan trọng:** Azure trả về flat format — `AccuracyScore` nằm thẳng trên `NBest[0]`, không có sub-object `PronunciationAssessment`
- **Fix lỗi:** Loại bỏ `EnableProsodyAssessment` khỏi REST config (SDK-only property, gây tất cả scores về 0)
- Parse `FluencyScore`, `CompletenessScore` với fallback từ word duration
- Map `Duration === 0` → `errorType: "Omission"`

### Lý do dùng REST thay SDK
- `microsoft-cognitiveservices-speech-sdk` chứa native binary
- Vercel serverless không cho phép native binary
- REST API đơn giản hơn, không cần dependency nặng

---

## Phase 4 — AI Feedback (Gemini) (2026-05-18)

### API `/api/feedback` (`app/api/feedback/route.ts`)
- Nhận JSON: scores + `referenceText`
- Gọi Google Gemini API để sinh feedback tiếng Việt
- Prompt: chỉ ra những âm nào sai, gợi ý cách sửa cụ thể (khẩu hình, vị trí lưỡi)
- **Model cuối cùng:** `gemini-2.5-flash` (các model khác lỗi với free API key)
  - `gemini-1.5-flash` → 404 (deprecated)
  - `gemini-2.0-flash-lite` → 429 quota=0

### Gemini thay Claude
- Ban đầu spec dùng Claude API (Anthropic)
- Đổi sang Gemini vì free tier 1500 req/ngày (Claude tính phí từ đầu)

---

## Phase 5 — Trang Luyện Câu & ScoreDisplay (2026-05-18)

### Trang luyện câu (`app/practice/page.tsx`)
- Flow 3 bước: `select` → `record` → `result`
- **Bước 1 (select):** Chọn câu từ thư viện hoặc tự nhập
- **Bước 2 (record):** Nghe mẫu TTS + ghi âm
- **Bước 3 (result):** Xem điểm + AI feedback

### Component ScoreDisplay (`components/ScoreDisplay.tsx`)
- 4 vòng tròn điểm: Accuracy, Fluency, Completeness, Prosody
- Màu sắc theo ngưỡng: xanh lá (≥80), vàng (60–79), đỏ (<60)
- Danh sách từng từ với badge âm vị sai

### Component PhonemeDetail (`components/PhonemeDetail.tsx`)
- Modal slide-up khi click vào từ bất kỳ
- Hiển thị từng phoneme của từ đó với điểm và màu sắc
- Đóng modal bằng nút × hoặc click backdrop

---

## Phase 6 — TTS & Deploy lần đầu (2026-05-18)

### API `/api/tts` (`app/api/tts/route.ts`)
- Nhận `{ text }`, gọi Azure TTS với giọng `en-US-JennyNeural`
- Trả về audio blob
- Fallback sang browser `SpeechSynthesis` nếu Azure lỗi

### Deploy lên Vercel
- Kết nối GitHub repo với Vercel project
- Set environment variables trên Vercel Dashboard
- URL sản xuất: **https://pronunciation-app-beta.vercel.app**

---

## Phase 7 — Skeleton Loading Animation cho AI Feedback (2026-05-18)

### Cải thiện UX khi chờ Gemini
- Thêm 3 chấm nhảy (`animate-bounce`) bên cạnh label "🤖 Nhận xét từ AI"
- Skeleton placeholder 3 dòng (`animate-pulse`) trong khi chờ response
- Feedback fetch chạy song song (non-blocking): UI hiện kết quả âm thanh trước, AI feedback điền vào sau
- Xử lý `fetch('/api/feedback')` riêng với `.then()/.catch()` để không block `setStep('result')`

---

## Phase 8 — Phoneme IPA Mapping (2026-05-18)

### Vấn đề
Azure trả về phoneme codes theo SAPI notation (`th`, `ae`, `ow`...) — không phải ký hiệu IPA quốc tế người dùng quen thấy.

### Giải pháp (`lib/phoneme.ts`)
- Tạo bảng mapping `AZURE_TO_IPA` 37 entries: toàn bộ âm vị tiếng Anh Mỹ
- Nguyên âm: `aa→ɑː`, `ae→æ`, `ah→ʌ`, `ao→ɔː`, `aw→aʊ`, `ax→ə`, `ay→aɪ`, `eh→ɛ`, `er→ɜːr`, `ey→eɪ`, `ih→ɪ`, `iy→iː`, `ow→oʊ`, `oy→ɔɪ`, `uh→ʊ`, `uw→uː`
- Phụ âm: `ch→tʃ`, `dh→ð`, `hh→h`, `jh→dʒ`, `ng→ŋ`, `sh→ʃ`, `th→θ`, `zh→ʒ` (cùng các phụ âm đơn)
- Export `toIPA(p: string)`: tra bảng, fallback về code gốc nếu không tìm thấy
- Áp dụng vào `ScoreDisplay.tsx` và `PhonemeDetail.tsx`

---

## Phase 9 — Level Filter + Mở Rộng Thư Viện Câu (2026-05-19)

### Mở rộng `data/sentences.json`
- Từ 8 câu → **60 câu** (10 câu × 5 cấp độ)
- **A1 (id 1–10, 51–53):** Chủ đề greeting, daily, food, feeling — cấu trúc đơn giản
- **A2 (id 11–20, 54–56):** Chủ đề weather, travel, school, hobby — câu có mệnh đề phụ
- **B1 (id 21–30, 57–58):** Chủ đề opinion, work, school — câu phức, có focus `/θ/`, `/ð/`, `/ʃ/`
- **B2 (id 31–40, 59):** Chủ đề academic, social, culture — từ vựng học thuật
- **C1 (id 41–50, 60):** Chủ đề formal, academic — ngôn ngữ phức tạp, focus `/θ/` `/ð/`
- Mỗi câu có: `id`, `text`, `level`, `category`, `focus[]` (mảng phoneme cần chú ý)

### Level Filter trên trang `/practice`
- Thêm `type Level = 'All' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1'`
- Constants `LEVEL_COLOR` và `LEVEL_ACTIVE` cho màu theo cấp (xanh lá/teal/xanh/indigo/tím)
- State `activeLevel` + tab buttons với count (số câu từng cấp)
- Filter: `sentences.filter(s => activeLevel === 'All' || s.level === activeLevel)`
- Scrollable list `max-h-72 overflow-y-auto`
- Badge phoneme focus màu cam (`/θ/`, `/ð/`...) trên mỗi câu
- Badge level màu theo cấp độ trên mỗi câu

---

## Phase 10 — Trang Đọc Đoạn Văn (2026-05-19)

### Tạo trang `/passage` (`app/passage/page.tsx`)
- Flow 3 bước: `select` → `record` → `result`
- **Bước record:** Hiển thị đoạn văn với từng từ có thể click để nghe phát âm riêng lẻ
  - `playWord(token)`: gọi `SpeechSynthesis` cho từng từ đơn
  - State `playingWord`: highlight từ đang được phát
  - Tip nhắc nhở "💡 Chạm vào từ để nghe phát âm"
- **Không có** AI feedback (đoạn văn dài, khác với luyện câu)

### Component PassageResult (`components/PassageResult.tsx`)
- Hiển thị kết quả word-level cho đoạn văn dài
- Mỗi từ được tô màu theo điểm accuracy
- Click từ để mở PhonemeDetail modal
- Callback `onPlayWord` và `onWordDetails`

### Mở rộng `data/passages.json`
- Từ 4 đoạn → **25 đoạn** (5 đoạn × 5 cấp độ)
- **A1 (id 1–5):** My Family, My Pet, A School Day, My Room, Weekend Fun — câu ngắn đơn giản, 3–5 câu/đoạn
- **A2 (id 6–10):** Morning Routine, My Favorite Food, A Trip to the Market, Learning English, My Neighborhood — kể chuyện hàng ngày
- **B1 (id 11–15):** The Weather, Social Media, Healthy Habits, Working from Home, Difficult Sounds — có phoneme drill, focus `/θ/` `/ð/` `/ʃ/`
- **B2 (id 16–20):** Technology Today, Climate Change, The Value of Reading, Urban vs Rural Life, The Science of Sleep — văn học thuật nhẹ
- **C1 (id 21–25):** The Ethics of AI, Language and Identity, Economic Inequality, The Philosophy of Memory, Biodiversity and Ecosystems — học thuật nâng cao, focus `/θ/` `/ð/`
- Mỗi đoạn có: `id`, `title`, `level`, `category`, `focus[]`, `text`

---

## Phase 11 — Level Filter cho Trang Đọc Đoạn Văn (2026-05-20)

### Thêm level filter vào `/passage` (`app/passage/page.tsx`)
- Reuse toàn bộ pattern từ trang `/practice`:
  - `type Level`, `LEVELS`, `LEVEL_COLOR`, `LEVEL_ACTIVE` constants
  - State `activeLevel`
  - Tab buttons với count
- Passage list: filter theo level, scrollable `max-h-72 overflow-y-auto`
- Badge phoneme focus màu cam trên mỗi đoạn
- Badge level màu theo cấp độ
- Reset `selectedText` khi đổi level
- Deploy lên Vercel production

---

## Tóm Tắt Số Liệu

| | Lúc bắt đầu | Hiện tại |
|---|---|---|
| Câu luyện (`sentences.json`) | 0 | 60 câu |
| Đoạn văn (`passages.json`) | 0 | 25 đoạn |
| Trang | 1 | 3 (home, practice, passage) |
| API routes | 0 | 3 (assess, feedback, tts) |
| Components | 0 | 4 (Recorder, ScoreDisplay, PassageResult, PhonemeDetail) |
| Lib utilities | 0 | 4 (audio, azure, claude, phoneme) |
| Deploy | ❌ | ✅ Vercel (https://pronunciation-app-beta.vercel.app) |

---

## Lỗi Đã Xử Lý

| Lỗi | Nguyên nhân | Fix |
|---|---|---|
| Build failed (peer deps) | React 19 conflict với Next.js 14 | Downgrade về React 18 |
| Scores = 0 | `EnableProsodyAssessment` trong REST config | Xóa property đó |
| Scores = 0 (tiếp) | Parse nested format sai — Azure dùng flat format | Sửa parser |
| Azure SDK crash | Native binary không chạy trên Vercel serverless | Thay bằng REST API |
| Gemini 404 | `gemini-1.5-flash` deprecated | Dùng `gemini-2.5-flash` |
| Gemini 429 | `gemini-2.0-flash-lite` quota=0 trên key này | Dùng `gemini-2.5-flash` |
| Phoneme hiển thị sai | Azure SAPI codes (không phải IPA) | Tạo `lib/phoneme.ts` mapping |
| TypeScript error | `useState` unused import | Xóa import |
| TypeScript error | `resampleAudio` return type | Đổi sang `Promise<ArrayBuffer>`, `async` |
