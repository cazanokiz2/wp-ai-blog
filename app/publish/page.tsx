"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SeoChecklist from "@/components/SeoChecklist";
import type { BlogState } from "@/lib/types";
import { getBlogState } from "@/lib/types";

interface PublishResult {
  postId: number;
  postUrl: string;
  status: "draft" | "publish";
}

export default function PublishPage() {
  const router = useRouter();
  const [state, setState] = useState<BlogState | null>(null);
  const [showChecklist, setShowChecklist] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState<PublishResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = getBlogState();
    if (!s) { router.replace("/"); return; }
    if (!s.selectedTitle) { router.replace("/titles"); return; }
    setState(s);
  }, [router]);

  const handlePublish = async (status: "draft" | "publish") => {
    if (!state) return;
    setPublishing(true);
    setError(null);

    try {
      const res = await fetch("/api/wordpress/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: state.selectedTitle,
          content: state.content,
          metaDescription: state.metaDescription,
          tags: state.tags,
          slug: state.slug,
          thumbnailUrl: state.thumbnailUrl,
          status,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "발행 실패");
      }

      const data = await res.json() as PublishResult;
      setResult(data);
      setShowChecklist(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setPublishing(false);
    }
  };

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Success screen
  if (result) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">{result.status === "publish" ? "🎉" : "📝"}</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {result.status === "publish" ? "발행 완료!" : "임시저장 완료!"}
          </h1>
          <p className="text-gray-500 text-sm mb-1">포스트 ID: #{result.postId}</p>
          <a
            href={result.postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 text-sm underline block mb-6 break-all"
          >
            {result.postUrl}
          </a>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/")}
              className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm"
            >
              새 글 작성
            </button>
            <button
              onClick={() => router.push("/drafts")}
              className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm"
            >
              임시저장 목록
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.push("/editor")}
            className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1"
          >
            ← 에디터로 돌아가기
          </button>
          <h1 className="text-2xl font-bold text-gray-900">발행 준비</h1>
          <p className="text-gray-500 text-sm mt-1">{state.selectedTitle}</p>
        </div>

        {/* Summary card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 space-y-4">
          <h2 className="font-semibold text-gray-700">글 요약</h2>

          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="본문 길이" value={`${state.content?.length ?? 0}자`}
              ok={(state.content?.length ?? 0) >= 2000} />
            <InfoCard label="메타 설명" value={`${state.metaDescription?.length ?? 0}자`}
              ok={(state.metaDescription?.length ?? 0) >= 120 && (state.metaDescription?.length ?? 0) <= 160} />
            <InfoCard label="태그" value={`${state.tags?.length ?? 0}개`}
              ok={(state.tags?.length ?? 0) >= 1} />
            <InfoCard label="썸네일" value={state.thumbnailUrl ? "있음" : "없음"}
              ok={!!state.thumbnailUrl} />
            <InfoCard label="슬러그" value={state.slug || "없음"}
              ok={/^[a-z0-9-]+$/.test(state.slug ?? "")} />
            <InfoCard label="키워드 포함" value={
              state.selectedTitle?.toLowerCase().includes(state.keyword?.toLowerCase()) ? "포함" : "미포함"
            }
              ok={state.selectedTitle?.toLowerCase().includes(state.keyword?.toLowerCase())} />
          </div>
        </div>

        {/* Thumbnail preview */}
        {state.thumbnailUrl && (
          <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={state.thumbnailUrl}
              alt="썸네일"
              className="w-full rounded-xl aspect-video object-cover"
            />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setShowChecklist(true)}
            className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold"
          >
            SEO 체크 후 발행하기
          </button>
        </div>
      </div>

      {showChecklist && (
        <SeoChecklist
          state={state}
          onClose={() => setShowChecklist(false)}
          onPublish={handlePublish}
          publishing={publishing}
        />
      )}
    </main>
  );
}

function InfoCard({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className={`rounded-xl p-3 border ${ok ? "border-green-100 bg-green-50" : "border-red-100 bg-red-50"}`}>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <div className="flex items-center gap-1.5">
        <span className="text-sm">{ok ? "✅" : "❌"}</span>
        <span className={`text-sm font-medium truncate ${ok ? "text-green-800" : "text-red-700"}`}>{value}</span>
      </div>
    </div>
  );
}
