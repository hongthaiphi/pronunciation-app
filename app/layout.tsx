import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pronunciation Practice",
  description: "Webapp luyện phát âm tiếng Anh",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="antialiased">
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
          {children}
        </main>
      </body>
    </html>
  );
}
