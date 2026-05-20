import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pronunciation Practice",
  description: "Webapp luyện phát âm tiếng Anh",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="antialiased">
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50">
          {children}
        </main>
      </body>
    </html>
  );
}
