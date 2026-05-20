"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { BlogState, TitleOption, OutlineItem } from "@/lib/types";
import { getBlogState, setBlogState } from "@/lib/types";

export default function TitlesPage() {
  const router = useRouter();
  const [state, setState] = useState<BlogState | null>(null);
  const [selected, setSelected] = useState<string>("");
  const [regeneratingOutline, setRegeneratingOutline] = useState(false);

  useEffect(() => {
    const s = getBlogState();
    if (!s) { router.replace("/"); return; }
    setState(s);
    setSelected(s.selectedTitle || s.titleOptions?.[0]?.title || "");
  }, [router]);

  const handleConfirm = async () => {
    if (!state || !selected) return;
    setRegeneratingOutline(true);

    try {
      // Regenerate outline for the newly selected title
      const res = await fetch("/api/outline/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: state.keyword,
          title: selected,
          articleType: state.articleType,
        }),
      });

      let outline: OutlineItem[] = state.outline;
      if (res.ok) {
        const data = await res.json() as { outline: OutlineItem[] };
        outline = data.outline;
      }

      const updated: BlogState = { ...state, selectedTitle: selected, outline };
      setBlogState(updated);
      router.push("/editor");
    } catch {
      // Use existing outline if regeneration fails
      const updated: BlogState = { ...state, selectedTitle: selected };
      setBlogState(updated);
      router.push("/editor");
    } finally {
      setRegeneratingOutline(false);
    }
  };

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1"
          >
            ← 다시 시작
          </button>
          <h1 className="text-2xl font-bold text-gray-900">제목을 선택하세요</h1>
          <p className="text-gray-500 text-sm mt-1">
            키워드: <span className="font-semibold text-indigo-600">{state.keyword}</span>
            {state.articleType && (
              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {state.articleType === "informational" && "정보성"}
                {state.articleType === "comparison" && "비교형"}
                {state.articleType === "issue-analysis" && "이슈분석"}
              </span>
            )}
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {state.titleOptions?.map((option: TitleOption, i: number) => (
            <button
              key={i}
              onClick={() => setSelected(option.title)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                selected === option.title
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/30"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className={`font-medium text-sm leading-snug ${
                    selected === option.title ? "text-indigo-900" : "text-gray-800"
                  }`}>
                    {option.title}
                  </p>
                </div>
                <div className="flex-shrink-0 flex flex-col items-center">
                  <SeoScoreBadge score={option.seoScore} />
                  {selected === option.title && (
                    <span className="mt-1.5 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Custom title input */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8">
          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
            직접 입력
          </label>
          <input
            type="text"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            placeholder="원하는 제목을 직접 입력하거나 위에서 선택하세요"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <button
          onClick={handleConfirm}
          disabled={!selected.trim() || regeneratingOutline}
          className="w-full py-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
        >
          {regeneratingOutline && (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {regeneratingOutline ? "아웃라인 생성 중..." : "이 제목으로 계속하기 →"}
        </button>
      </div>
    </main>
  );
}

function SeoScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "bg-green-100 text-green-700" :
    score >= 60 ? "bg-yellow-100 text-yellow-700" :
    "bg-red-100 text-red-700";

  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
      {score}점
    </span>
  );
}
