export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Luyện Phát Âm Tiếng Anh
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Cải thiện cách phát âm của bạn với AI feedback tức thì
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🎯</div>
            <h2 className="text-2xl font-semibold mb-2 text-gray-900">
              Đánh giá Phát âm
            </h2>
            <p className="text-gray-600">
              Ghi âm và nhận phản hồi chi tiết về từng âm tiếng
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-2xl font-semibold mb-2 text-gray-900">
              Biểu đồ Ngữ điệu
            </h2>
            <p className="text-gray-600">
              So sánh pitch contour của bạn với native speaker
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🗣️</div>
            <h2 className="text-2xl font-semibold mb-2 text-gray-900">
              Hướng dẫn Chi tiết
            </h2>
            <p className="text-gray-600">
              Nhận mẹo sửa khẩu hình, vị trí lưỡi từ AI
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">📈</div>
            <h2 className="text-2xl font-semibold mb-2 text-gray-900">
              Theo dõi Tiến bộ
            </h2>
            <p className="text-gray-600">
              Xem lịch sử luyện tập và sự cải thiện theo thời gian
            </p>
          </div>
        </div>

        <div className="mt-12">
          <a
            href="/practice"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Bắt đầu Luyện tập
          </a>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Powered by Azure Speech Service + Claude AI
        </p>
      </div>
    </div>
  );
}
