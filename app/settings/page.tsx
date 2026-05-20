"use client";

import WpConnectionChecker from "@/components/WpConnectionChecker";

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">설정</h1>
          <p className="text-sm text-gray-500 mt-1">WordPress 연결 및 환경변수를 확인하세요</p>
        </div>

        {/* WordPress connection checker */}
        <WpConnectionChecker />

        {/* Environment variables guide */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-700 mb-4">환경변수 설정 가이드</h2>
          <div className="space-y-3">
            <EnvItem
              name="ANTHROPIC_API_KEY"
              desc="Anthropic Console에서 발급"
              link="https://console.anthropic.com"
              required
            />
            <EnvItem
              name="OPENAI_API_KEY"
              desc="OpenAI Platform에서 발급 (DALL-E 3 썸네일용)"
              link="https://platform.openai.com"
              required
            />
            <EnvItem
              name="WP_URL"
              desc="WordPress 사이트 URL (예: https://example.com)"
              required
            />
            <EnvItem
              name="WP_USERNAME"
              desc="WordPress 관리자 아이디"
              required
            />
            <EnvItem
              name="WP_APP_PASSWORD"
              desc="WordPress → 사용자 → 프로필 → 애플리케이션 비밀번호에서 생성"
              required
            />
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              프로젝트 루트의 <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">.env.local</code> 파일에
              위 환경변수를 설정하고 개발 서버를 재시작하세요.
            </p>
          </div>
        </div>

        {/* App info */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-700 mb-3">앱 정보</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>AI 모델</span>
              <span className="font-medium">Claude Sonnet 4.6</span>
            </div>
            <div className="flex justify-between">
              <span>썸네일 모델</span>
              <span className="font-medium">DALL-E 3 (1792×1024)</span>
            </div>
            <div className="flex justify-between">
              <span>권장 본문 길이</span>
              <span className="font-medium">2,000자 이상</span>
            </div>
            <div className="flex justify-between">
              <span>메타 설명 권장</span>
              <span className="font-medium">120–160자</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function EnvItem({
  name,
  desc,
  link,
  required,
}: {
  name: string;
  desc: string;
  link?: string;
  required?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <code className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-mono whitespace-nowrap flex-shrink-0 mt-0.5">
        {name}
      </code>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-600">{desc}</p>
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-600 hover:underline"
          >
            {link}
          </a>
        )}
      </div>
      {required && (
        <span className="text-xs text-red-500 flex-shrink-0 font-medium">필수</span>
      )}
    </div>
  );
}
