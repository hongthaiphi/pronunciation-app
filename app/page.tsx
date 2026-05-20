export default function Home() {
  return (
    <div className="min-h-screen px-4 py-10 sm:py-16">
      <div className="max-w-2xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg mb-5">
            <span className="text-3xl">🎤</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 leading-tight">
            Luyện Phát Âm{' '}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Tiếng Anh
            </span>
          </h1>
          <p className="text-gray-500 text-sm sm:text-base max-w-sm mx-auto">
            AI phân tích từng âm vị — cải thiện nhanh hơn, đúng hơn
          </p>
        </div>

        {/* Main CTAs */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <a
            href="/practice"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 p-6 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
            <div className="relative">
              <div className="text-4xl mb-3">🎤</div>
              <h2 className="text-xl font-bold text-white mb-1">Luyện Từng Câu</h2>
              <p className="text-blue-100 text-sm">60 câu · A1 → C1 · AI feedback</p>
              <div className="mt-4 inline-flex items-center gap-1 text-white/80 text-sm font-medium group-hover:gap-2 transition-all">
                Bắt đầu <span>→</span>
              </div>
            </div>
          </a>

          <a
            href="/passage"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-6 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
            <div className="relative">
              <div className="text-4xl mb-3">📖</div>
              <h2 className="text-xl font-bold text-white mb-1">Đọc Đoạn Văn</h2>
              <p className="text-violet-100 text-sm">25 đoạn · A1 → C1 · Chi tiết từng từ</p>
              <div className="mt-4 inline-flex items-center gap-1 text-white/80 text-sm font-medium group-hover:gap-2 transition-all">
                Bắt đầu <span>→</span>
              </div>
            </div>
          </a>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
              <span className="text-lg">🎯</span>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm mb-0.5">Đánh giá Phát âm</h3>
            <p className="text-xs text-gray-400">Điểm chính xác từng âm vị</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center mb-3">
              <span className="text-lg">🤖</span>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm mb-0.5">AI Nhận xét</h3>
            <p className="text-xs text-gray-400">Mẹo sửa khẩu hình, lưỡi</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center mb-3">
              <span className="text-lg">🔊</span>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm mb-0.5">Nghe Mẫu Neural</h3>
            <p className="text-xs text-gray-400">Giọng Jenny Neural TTS</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center mb-3">
              <span className="text-lg">📊</span>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm mb-0.5">Điểm Chi tiết</h3>
            <p className="text-xs text-gray-400">Accuracy · Fluency · Prosody</p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Powered by Azure Speech · Gemini AI
        </p>
      </div>
    </div>
  );
}
