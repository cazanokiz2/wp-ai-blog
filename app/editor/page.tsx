"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import OutlineEditor from "@/components/OutlineEditor";
import ThumbnailPreview from "@/components/ThumbnailPreview";
import type { BlogState, OutlineItem } from "@/lib/types";
import { getBlogState, setBlogState, updateBlogState } from "@/lib/types";

const MarkdownEditor = dynamic(() => import("@/components/MarkdownEditor"), { ssr: false });

type ActiveTab = "outline" | "content" | "seo" | "thumbnail";

export default function EditorPage() {
  const router = useRouter();
  const [state, setState] = useState<BlogState | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("content");
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [regeneratingContent, setRegeneratingContent] = useState(false);
  const [regeneratingThumbnail, setRegeneratingThumbnail] = useState(false);

  useEffect(() => {
    const s = getBlogState();
    if (!s) { router.replace("/"); return; }
    if (!s.selectedTitle) { router.replace("/titles"); return; }
    setState(s);
  }, [router]);

  const persist = useCallback((updates: Partial<BlogState>) => {
    setState((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      setBlogState(next);
      return next;
    });
  }, []);

  const handleRegenerateContent = async () => {
    if (!state) return;
    setRegeneratingContent(true);
    try {
      const res = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: state.keyword,
          title: state.selectedTitle,
          outline: state.outline,
          articleType: state.articleType,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json() as { content: string };
      persist({ content: data.content });
    } catch (err) {
      alert(`본문 재생성 실패: ${err instanceof Error ? err.message : "오류"}`);
    } finally {
      setRegeneratingContent(false);
    }
  };

  const handleRegenerateThumbnail = async (provider: "openai" | "free" = "openai") => {
    if (!state) return;
    setRegeneratingThumbnail(true);
    try {
      const res = await fetch("/api/image/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: state.keyword, title: state.selectedTitle, provider }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json() as { imageUrl: string };
      persist({ thumbnailUrl: data.imageUrl });
    } catch (err) {
      alert(`썸네일 재생성 실패: ${err instanceof Error ? err.message : "오류"}`);
    } finally {
      setRegeneratingThumbnail(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!state) return;
    setSaving(true);
    try {
      const method = state.draftId ? "POST" : "POST";
      const res = await fetch("/api/drafts", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json() as { id: string };
      persist({ draftId: data.id });
    } catch (err) {
      alert(`임시저장 실패: ${err instanceof Error ? err.message : "오류"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleProceedToPublish = () => {
    if (!state) return;
    updateBlogState(state);
    router.push("/publish");
  };

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs: { id: ActiveTab; label: string }[] = [
    { id: "outline", label: "아웃라인" },
    { id: "content", label: "본문" },
    { id: "seo", label: "SEO" },
    { id: "thumbnail", label: "썸네일" },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.push("/titles")}
              className="text-sm text-gray-500 hover:text-gray-700 flex-shrink-0"
            >
              ← 제목 선택
            </button>
            <span className="text-gray-300 flex-shrink-0">|</span>
            <h1 className="font-semibold text-gray-800 text-sm truncate">{state.selectedTitle}</h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {saving ? "저장 중..." : "임시저장"}
            </button>
            <button
              onClick={handleProceedToPublish}
              className="px-4 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
            >
              발행하기 →
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Tab navigation */}
        <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 mb-4 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Outline tab */}
        {activeTab === "outline" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-700">아웃라인 편집</h2>
              <span className="text-xs text-gray-400">{state.outline?.length ?? 0}개 섹션</span>
            </div>
            <OutlineEditor
              items={state.outline ?? []}
              onChange={(items: OutlineItem[]) => persist({ outline: items })}
            />
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={handleRegenerateContent}
                disabled={regeneratingContent}
                className="w-full py-2.5 text-sm text-indigo-600 border border-indigo-300 rounded-xl hover:bg-indigo-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {regeneratingContent && (
                  <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                )}
                {regeneratingContent ? "본문 재생성 중..." : "이 아웃라인으로 본문 재생성"}
              </button>
            </div>
          </div>
        )}

        {/* Content tab */}
        {activeTab === "content" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewMode(false)}
                  className={`px-3 py-1 text-xs rounded-lg ${!previewMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600"}`}
                >
                  편집
                </button>
                <button
                  onClick={() => setPreviewMode(true)}
                  className={`px-3 py-1 text-xs rounded-lg ${previewMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600"}`}
                >
                  미리보기
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">{state.content?.length ?? 0}자</span>
                <button
                  onClick={handleRegenerateContent}
                  disabled={regeneratingContent}
                  className="text-xs text-indigo-600 border border-indigo-300 px-3 py-1 rounded-lg hover:bg-indigo-50 disabled:opacity-50 flex items-center gap-1"
                >
                  {regeneratingContent && (
                    <span className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  )}
                  재생성
                </button>
              </div>
            </div>

            {previewMode ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 prose prose-sm max-w-none min-h-96">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {state.content ?? ""}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <MarkdownEditor
                  value={state.content ?? ""}
                  onChange={(v: string) => persist({ content: v })}
                  height={500}
                />
              </div>
            )}
          </div>
        )}

        {/* SEO tab */}
        {activeTab === "seo" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-5">
            <h2 className="font-semibold text-gray-700">SEO 정보 편집</h2>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                메타디스크립션 ({state.metaDescription?.length ?? 0}자 / 권장 120-160자)
              </label>
              <textarea
                value={state.metaDescription ?? ""}
                onChange={(e) => persist({ metaDescription: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
              <div className={`text-xs mt-1 ${
                (state.metaDescription?.length ?? 0) >= 120 && (state.metaDescription?.length ?? 0) <= 160
                  ? "text-green-600" : "text-amber-600"
              }`}>
                {(state.metaDescription?.length ?? 0) < 120 && "120자 이상 입력하세요"}
                {(state.metaDescription?.length ?? 0) > 160 && "160자 이하로 줄이세요"}
                {(state.metaDescription?.length ?? 0) >= 120 && (state.metaDescription?.length ?? 0) <= 160 && "✓ 최적 길이"}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                URL 슬러그
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">your-site.com/</span>
                <input
                  value={state.slug ?? ""}
                  onChange={(e) => persist({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                  className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              {!/^[a-z0-9-]+$/.test(state.slug ?? "") && state.slug && (
                <p className="text-xs text-red-500 mt-1">영문 소문자와 하이픈(-)만 사용하세요</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                태그
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {state.tags?.map((tag, i) => (
                  <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                    {tag}
                    <button
                      onClick={() => persist({ tags: state.tags?.filter((_, j) => j !== i) })}
                      className="hover:text-red-500 transition-colors"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <input
                placeholder="태그 입력 후 Enter"
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value.trim()) {
                    persist({ tags: [...(state.tags ?? []), e.currentTarget.value.trim()] });
                    e.currentTarget.value = "";
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Thumbnail tab */}
        {activeTab === "thumbnail" && (
          <div className="max-w-lg">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-700 mb-4">썸네일 이미지</h2>
              <ThumbnailPreview
                url={state.thumbnailUrl ?? ""}
                onRegenerate={handleRegenerateThumbnail}
                loading={regeneratingThumbnail}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
