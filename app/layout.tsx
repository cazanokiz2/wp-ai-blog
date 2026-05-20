import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WP AI 블로그 자동화",
  description: "AI를 활용한 워드프레스 블로그 자동 발행 도구",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-indigo-600">
              WP AI 블로그
            </a>
            <div className="flex gap-4 text-sm">
              <a href="/drafts" className="text-gray-600 hover:text-indigo-600 transition-colors">
                임시저장
              </a>
              <a href="/settings" className="text-gray-600 hover:text-indigo-600 transition-colors">
                설정
              </a>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
