# Pronunciation Practice App

Webapp luyện phát âm tiếng Anh tương tự ELSA Speak nhưng miễn phí, sử dụng:
- **Azure Speech Service** cho đánh giá phát âm (Pronunciation Assessment)
- **Claude AI** để sinh feedback tiếng Việt

## Yêu cầu Hệ thống

- Node.js 18+
- npm hoặc yarn
- Azure Speech Service account (free tier: 5 giờ audio/tháng)
- Anthropic API key (Claude API)

## Cài đặt

```bash
npm install
# hoặc
yarn install
```

## Cấu hình Environment

Tạo file `.env.local` (mẫu đã có):

```
AZURE_SPEECH_KEY=your_key_here
AZURE_SPEECH_REGION=southeastasia
ANTHROPIC_API_KEY=your_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Lấy keys từ:
- [Azure Speech Service](https://azure.microsoft.com/services/cognitive-services/speech-services/)
- [Anthropic Console](https://console.anthropic.com/)

## Chạy Dev Server

```bash
npm run dev
```

Truy cập http://localhost:3000

## Cấu trúc Dự án

```
pronunciation-app/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Trang chính
│   ├── practice/          # Trang luyện
│   ├── api/
│   │   ├── assess/        # POST audio → Azure
│   │   └── feedback/      # POST result → Claude
│   └── globals.css
├── components/            # React components
│   ├── Recorder.tsx       # Ghi âm
│   ├── ScoreDisplay.tsx   # Hiển thị điểm
│   ├── PitchChart.tsx     # Pitch contour
│   └── PhonemeDetail.tsx
├── lib/
│   ├── azure.ts           # Wrapper Azure SDK
│   ├── claude.ts          # Wrapper Claude API
│   └── audio.ts           # Xử lý audio
├── data/
│   └── sentences.json     # Thư viện câu
└── public/                # Assets

```

## Các Tính Năng Chính

- ✅ Ghi âm từ mic
- ✅ Hiển thị native audio (TTS)
- ✅ Đánh giá phát âm chi tiết (phoneme-level)
- ✅ Highlight từ: xanh (đúng) / vàng (gần đúng) / đỏ (sai)
- ✅ Feedback tiếng Việt từ Claude AI
- 🔄 Pitch contour (đang phát triển)
- 🔄 Lịch sử luyện tập (đang phát triển)

## Roadmap

### Tuần 1 - MVP Core
- [x] Setup Next.js + Tailwind
- [ ] Component Recorder
- [ ] API /assess (Azure integration)
- [ ] Score display + highlight

### Tuần 2 - Polish
- [ ] Pitch chart
- [ ] Claude feedback VN
- [ ] Thư viện câu (50+ câu)
- [ ] Deploy Vercel

### Sau MVP
- [ ] Drill phoneme cụ thể
- [ ] Lịch sử + chart tiến bộ
- [ ] Voice cloning
- [ ] Gamification

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI Services**: Azure Speech Service, Claude API
- **Audio**: Web Audio API, MediaRecorder
- **Visualization**: WaveSurfer.js, Plotly.js

## Tài liệu Tham khảo

- [Azure Pronunciation Assessment](https://learn.microsoft.com/azure/ai-services/speech-service/how-to-pronunciation-assessment)
- [Claude API Docs](https://docs.anthropic.com/)
- [Next.js Documentation](https://nextjs.org/docs)

## License

MIT
