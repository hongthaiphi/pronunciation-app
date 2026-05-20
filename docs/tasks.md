# Tasks — English Shadowing & Dictation Website

> Dựa trên `requirements.md`. Ưu tiên: 🔴 Must → 🟡 Should → 🟢 Could

---

## PHASE 1 — Project Setup

### T-01 Khởi tạo dự án
- [ ] T-01-1 Tạo Next.js 14 + TypeScript + Tailwind CSS
- [ ] T-01-2 Cấu hình ESLint, Prettier, tsconfig
- [ ] T-01-3 Cài đặt Supabase client (`@supabase/supabase-js`)
- [ ] T-01-4 Cấu hình biến môi trường `.env.local`
- [ ] T-01-5 Thiết lập cấu trúc thư mục (`app/`, `components/`, `lib/`, `data/`)
- [ ] T-01-6 Deploy skeleton lên Vercel

### T-02 Database Schema (Supabase)
- [ ] T-02-1 Tạo bảng `users` (id, email, role, created_at)
- [ ] T-02-2 Tạo bảng `lessons` (id, title, level, topic, type, transcript, chunking, image_url, audio_url, audio_slow_url, notes, created_at)
- [ ] T-02-3 Tạo bảng `progress` (id, user_id, lesson_id, completed_at, time_spent, score)
- [ ] T-02-4 Tạo bảng `dictation_attempts` (id, user_id, lesson_id, input_text, accuracy, created_at)
- [ ] T-02-5 Tạo bảng `streaks` (id, user_id, current_streak, last_practice_date)
- [ ] T-02-6 Cấu hình Row Level Security (RLS) Supabase
- [ ] T-02-7 Tạo Supabase Storage bucket cho audio và image

---

## PHASE 2 — Authentication (FR-01)

- [ ] T-03-1 🔴 Trang đăng ký `/register` — form email + password
- [ ] T-03-2 🔴 Trang đăng nhập `/login` — Supabase Auth
- [ ] T-03-3 🔴 Đăng xuất + clear session
- [ ] T-03-4 🔴 Middleware bảo vệ route (redirect nếu chưa login)
- [ ] T-03-5 🔴 Phân quyền role: student / teacher / admin
- [ ] T-03-6 🟡 Forgot password — gửi email reset
- [ ] T-03-7 🟢 Đăng nhập Google OAuth

---

## PHASE 3 — Layout & Navigation

- [ ] T-04-1 🔴 Layout chung: header + main + footer
- [ ] T-04-2 🔴 Navigation: Home / Shadowing / Dictation / My Progress / Login
- [ ] T-04-3 🔴 Mobile-responsive navigation (hamburger menu)
- [ ] T-04-4 🔴 Active link highlight
- [ ] T-04-5 🟡 Teacher/Admin link (chỉ hiện với role phù hợp)

---

## PHASE 4 — Trang Home (FR-02)

- [ ] T-05-1 🔴 Hero section: headline + subheadline + nút "Start Practising"
- [ ] T-05-2 🔴 4 Feature cards: Shadowing / Dictation / Speaking / Progress
- [ ] T-05-3 🟡 Demo preview: audio player + record button + transcript + dictation box
- [ ] T-05-4 🟡 Responsive layout (1 cột mobile / 2 cột desktop)

---

## PHASE 5 — Lesson List (FR-03-1)

- [ ] T-06-1 🔴 Trang `/lessons` — hiển thị danh sách bài học
- [ ] T-06-2 🔴 Filter theo **level** (Starter / Level 1 / Level 2 / IELTS)
- [ ] T-06-3 🔴 Filter theo **topic** (school / hobbies / family / food / daily routine)
- [ ] T-06-4 🔴 Filter theo **type** (shadowing / dictation)
- [ ] T-06-5 🟡 Filter theo **trạng thái** (New / Completed)
- [ ] T-06-6 🟡 Lesson card: thumbnail + tiêu đề + level + thời lượng + badge completed
- [ ] T-06-7 🟡 Pagination hoặc infinite scroll

---

## PHASE 6 — Shadowing Lesson (FR-03)

- [ ] T-07-1 🔴 Trang `/shadowing/[id]` — layout bài học
- [ ] T-07-2 🔴 Hiển thị tiêu đề, hình ảnh, transcript
- [ ] T-07-3 🔴 Audio player — normal speed
- [ ] T-07-4 🔴 Audio player — slow speed (toggle 0.75x)
- [ ] T-07-5 🔴 Chunk display: hiển thị từng chunk, highlight chunk đang luyện
- [ ] T-07-6 🔴 Nút Record — ghi âm giọng học sinh (MediaRecorder API)
- [ ] T-07-7 🔴 Replay bản ghi âm của học sinh
- [ ] T-07-8 🔴 Nút Try Again (xoá bản ghi, ghi lại)
- [ ] T-07-9 🔴 Nút Mark Complete — lưu progress vào DB
- [ ] T-07-10 🟡 Auto-advance: tự chuyển chunk tiếp theo sau khi ghi xong
- [ ] T-07-11 🟡 Progress bar trong bài (chunk x/y)
- [ ] T-07-12 🟢 AI pronunciation assessment (Azure Speech) sau khi ghi âm

---

## PHASE 7 — Dictation Lesson (FR-04)

- [ ] T-08-1 🔴 Trang `/dictation/[id]` — layout bài học
- [ ] T-08-2 🔴 Step 1: Nghe audio (player có replay + slow speed)
- [ ] T-08-3 🔴 Step 2: Text input — học sinh gõ nội dung nghe được
- [ ] T-08-4 🔴 Step 3: Nút Submit — kiểm tra đáp án
- [ ] T-08-5 🔴 Step 4: Highlight lỗi sai (từ sai = đỏ, đúng = xanh, thiếu = xám)
- [ ] T-08-6 🔴 Hiển thị đáp án đúng bên dưới
- [ ] T-08-7 🔴 Nút Retry — thử lại bài
- [ ] T-08-8 🔴 Lưu accuracy (%) vào DB sau mỗi lần làm
- [ ] T-08-9 🟡 Show answer button (xem đáp án trước khi nộp)
- [ ] T-08-10 🟡 Số lần đã thử + accuracy tốt nhất
- [ ] T-08-11 🟡 Hỗ trợ 3 dạng: sentence / dialogue / paragraph

---

## PHASE 8 — Speaking Practice (FR-05) *(optional MVP)*

- [ ] T-09-1 🟡 Trang `/speaking/[id]` — hiển thị prompt
- [ ] T-09-2 🟡 Học sinh record câu trả lời và replay
- [ ] T-09-3 🟢 AI phân tích phát âm (Azure Speech Assessment)

---

## PHASE 9 — Progress Tracking (FR-06)

- [ ] T-10-1 🔴 Trang `/progress` — dashboard học sinh
- [ ] T-10-2 🔴 Hiển thị số bài đã hoàn thành (shadowing + dictation)
- [ ] T-10-3 🔴 Tổng thời gian luyện tập (phút)
- [ ] T-10-4 🔴 Độ chính xác dictation trung bình (%)
- [ ] T-10-5 🔴 Current streak — tính từ DB, reset nếu bỏ 1 ngày
- [ ] T-10-6 🟡 Thông điệp động viên theo streak
- [ ] T-10-7 🟡 Current level (tự động tính theo số bài hoàn thành)
- [ ] T-10-8 🟡 Chart/calendar hiển thị ngày có luyện tập

---

## PHASE 10 — Admin/Teacher Panel (FR-07)

- [ ] T-11-1 🔴 Route `/admin` — bảo vệ bằng role teacher/admin
- [ ] T-11-2 🔴 Danh sách bài học + tìm kiếm + filter
- [ ] T-11-3 🔴 Form tạo bài học mới: title, level, topic, type, transcript, chunking, notes
- [ ] T-11-4 🔴 Upload audio normal speed lên Supabase Storage
- [ ] T-11-5 🔴 Upload audio slow speed lên Supabase Storage
- [ ] T-11-6 🔴 Upload hình ảnh bài học
- [ ] T-11-7 🔴 Chỉnh sửa / xoá bài học
- [ ] T-11-8 🔴 Tổ chức content theo level / topic / unit
- [ ] T-11-9 🟡 Dashboard thống kê học sinh: số bài, thời gian, accuracy, hoạt động
- [ ] T-11-10 🟡 Bulk import lessons từ file CSV/JSON

---

## PHASE 11 — Content (CR-01, CR-02)

- [ ] T-12-1 🔴 Soạn 50 Shadowing lessons (school / hobbies / family / food / daily routine)
- [ ] T-12-2 🔴 Ghi âm hoặc tạo TTS audio (normal + slow) cho 50 shadowing lessons
- [ ] T-12-3 🔴 Soạn 50 Dictation lessons (sentence / dialogue / paragraph)
- [ ] T-12-4 🔴 Ghi âm hoặc tạo TTS audio cho 50 dictation lessons
- [ ] T-12-5 🟡 Tìm / tạo hình ảnh minh họa cho từng bài
- [ ] T-12-6 🟡 Chia chunking cho 50 shadowing lessons

---

## PHASE 12 — Testing & Polish

- [ ] T-13-1 🔴 Test toàn bộ flow: register → login → shadowing → dictation → progress
- [ ] T-13-2 🔴 Test responsive trên mobile
- [ ] T-13-3 🔴 Test audio playback trên các browser (Chrome, Safari, Firefox)
- [ ] T-13-4 🔴 Test MediaRecorder trên iOS Safari (cần polyfill)
- [ ] T-13-5 🟡 Kiểm tra performance (Lighthouse score > 80)
- [ ] T-13-6 🟡 Error handling: audio lỗi, microphone bị từ chối, network lỗi
- [ ] T-13-7 🟡 Loading states và skeleton UI

---

## PHASE 13 — Deploy Production

- [ ] T-14-1 🔴 Cấu hình environment variables trên Vercel
- [ ] T-14-2 🔴 Deploy production lên Vercel
- [ ] T-14-3 🔴 Cấu hình custom domain (nếu có)
- [ ] T-14-4 🟡 Cấu hình Supabase connection pooling
- [ ] T-14-5 🟡 Set up monitoring / error tracking (Sentry)

---

## Tổng kết

| Phase | Mô tả | Tasks | Ưu tiên |
|---|---|---|---|
| 1 | Project Setup | 11 | 🔴 |
| 2 | Authentication | 7 | 🔴 |
| 3 | Layout & Nav | 5 | 🔴 |
| 4 | Home Page | 4 | 🔴 |
| 5 | Lesson List | 7 | 🔴 |
| 6 | Shadowing Lesson | 12 | 🔴 |
| 7 | Dictation Lesson | 11 | 🔴 |
| 8 | Speaking Practice | 3 | 🟡 |
| 9 | Progress Tracking | 8 | 🔴 |
| 10 | Admin Panel | 10 | 🔴 |
| 11 | Content | 6 | 🔴 |
| 12 | Testing & Polish | 7 | 🔴 |
| 13 | Deploy | 5 | 🔴 |
| **Tổng** | | **96 tasks** | |
