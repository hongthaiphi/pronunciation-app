# Requirements — English Shadowing & Dictation Website

## 1. Tổng quan

**Mục tiêu:** Website giúp học sinh Việt Nam luyện tập tiếng Anh tại nhà thông qua 2 phương pháp: **Shadowing** và **Dictation**.

**Đối tượng:** Học sinh lớp 2 → IELTS, đã có nền grammar cơ bản, còn yếu nghe-nói.

---

## 2. Functional Requirements

### FR-01 — Authentication
| ID | Yêu cầu | Mức độ |
|---|---|---|
| FR-01-1 | Đăng ký tài khoản bằng email/password | Must |
| FR-01-2 | Đăng nhập / Đăng xuất | Must |
| FR-01-3 | Phân quyền: Student / Teacher / Admin | Must |
| FR-01-4 | Quên mật khẩu / reset qua email | Should |
| FR-01-5 | Đăng nhập bằng Google (OAuth) | Could |

---

### FR-02 — Trang Home
| ID | Yêu cầu | Mức độ |
|---|---|---|
| FR-02-1 | Hero section: headline + subheadline + CTA "Start Practising" | Must |
| FR-02-2 | 4 Feature cards: Shadowing / Dictation / Speaking / Progress | Must |
| FR-02-3 | Demo preview: audio player + record button + transcript + dictation box | Should |

---

### FR-03 — Shadowing Practice
| ID | Yêu cầu | Mức độ |
|---|---|---|
| FR-03-1 | Danh sách bài học có filter theo level / topic / trạng thái (new/completed) | Must |
| FR-03-2 | Trang bài học hiển thị: tiêu đề, hình ảnh, audio player, transcript | Must |
| FR-03-3 | Audio normal speed + slow speed | Must |
| FR-03-4 | Chunk display: chia câu thành chunk ngắn, luyện từng chunk trước | Must |
| FR-03-5 | Ghi âm giọng học sinh (Record button) | Must |
| FR-03-6 | Replay bản ghi âm của học sinh | Must |
| FR-03-7 | Nút Try Again và Mark Complete | Must |
| FR-03-8 | AI phân tích và chỉ ra các âm sai sau khi ghi âm | Could |

---

### FR-04 — Dictation Practice
| ID | Yêu cầu | Mức độ |
|---|---|---|
| FR-04-1 | Nghe audio và gõ lại nội dung vào text input | Must |
| FR-04-2 | Replay audio, slow speed | Must |
| FR-04-3 | Kiểm tra đáp án: highlight lỗi sai từng từ | Must |
| FR-04-4 | Show full answer sau khi nộp | Must |
| FR-04-5 | Retry: thử lại bài đó | Must |
| FR-04-6 | 3 dạng bài: sentence / dialogue / paragraph | Must |

---

### FR-05 — Speaking Practice *(optional MVP)*
| ID | Yêu cầu | Mức độ |
|---|---|---|
| FR-05-1 | Hiển thị prompt câu hỏi (vd: "Tell me about your best friend") | Should |
| FR-05-2 | Học sinh ghi âm câu trả lời và nghe lại | Should |
| FR-05-3 | AI phát hiện lỗi phát âm (tích hợp Azure Speech) | Could |

---

### FR-06 — Progress Tracking
| ID | Yêu cầu | Mức độ |
|---|---|---|
| FR-06-1 | Hiển thị số bài đã hoàn thành | Must |
| FR-06-2 | Tổng thời gian luyện tập (phút) | Must |
| FR-06-3 | Độ chính xác dictation (%) | Must |
| FR-06-4 | Current streak (chuỗi ngày liên tiếp) | Must |
| FR-06-5 | Current level | Should |
| FR-06-6 | Thông điệp động viên (vd: "Great job! 5 days in a row") | Should |

---

### FR-07 — Teacher/Admin Panel
| ID | Yêu cầu | Mức độ |
|---|---|---|
| FR-07-1 | Tạo/chỉnh sửa/xoá bài học (title, level, topic, transcript, notes) | Must |
| FR-07-2 | Upload audio 2 phiên bản: normal speed + slow speed | Must |
| FR-07-3 | Upload hình ảnh cho bài học | Must |
| FR-07-4 | Nhập chunking thủ công (chia câu thành các chunk) | Must |
| FR-07-5 | Tổ chức content theo level / topic / unit / story series | Must |
| FR-07-6 | Xem thống kê học sinh: số bài, thời gian, độ chính xác, hoạt động | Should |

---

## 3. Content Requirements

### CR-01 — Shadowing Lessons (MVP: 50 bài)
- Topics: school, hobbies, family, food, daily routine
- 3 loại: Mini Sentences | Story-based (6–10 câu) | Chunk Drills
- Mỗi bài có: hình ảnh, audio, transcript, chunking, context

### CR-02 — Dictation Lessons (MVP: 50 bài)
- Dạng: sentence (dễ) → dialogue (trung bình) → paragraph (khó)
- Mỗi bài có: audio (normal + slow), đáp án

---

## 4. Non-Functional Requirements

| ID | Yêu cầu | Chi tiết |
|---|---|---|
| NFR-01 | Responsive | Mobile-first, chạy tốt trên điện thoại |
| NFR-02 | Performance | Load trang < 3s, audio load nhanh |
| NFR-03 | Accessibility | Font dễ đọc, nút bấm đủ lớn cho học sinh nhỏ |
| NFR-04 | Navigation | Tối giản, dễ hiểu cho học sinh từ lớp 2 |
| NFR-05 | Audio | Hỗ trợ format MP3/WAV, có fallback |
| NFR-06 | Security | Auth JWT/session, route bảo vệ theo role |

---

## 5. Pages (MVP Scope)

| Trang | Route | Role |
|---|---|---|
| Home | `/` | Public |
| Đăng nhập/Đăng ký | `/login`, `/register` | Public |
| Danh sách bài học | `/lessons` | Student |
| Shadowing lesson | `/shadowing/[id]` | Student |
| Dictation lesson | `/dictation/[id]` | Student |
| My Progress | `/progress` | Student |
| Admin Panel | `/admin` | Teacher/Admin |

---

## 6. Tech Stack (đề xuất)

| Layer | Công nghệ |
|---|---|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| Backend/API | Next.js API Routes hoặc separate Express |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| Audio storage | Supabase Storage / Cloudinary |
| AI Speech | Azure Speech Service (pronunciation assessment) |
| Deployment | Vercel (frontend) |

---

## 7. Out of Scope (v1)

- Social features (bình luận, chia sẻ)
- Gamification / leaderboard
- Mobile app (iOS/Android)
- Video content
- Live class / real-time
- Payment / subscription
