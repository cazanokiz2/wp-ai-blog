"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StepIndicator from "@/components/StepIndicator";
import ProgressBar from "@/components/ProgressBar";
import type { Step, BlogState, ArticleType, TitleOption, OutlineItem } from "@/lib/types";
import { setBlogState } from "@/lib/types";

const INITIAL_STEPS: Step[] = [
  { id: 1, label: "연관 키워드 추천", status: "idle" },
  { id: 2, label: "키워드 분석 & 글 유형", status: "idle" },
  { id: 3, label: "SEO 제목 5개 생성", status: "idle" },
  { id: 4, label: "H2/H3 아웃라인 생성", status: "idle" },
  { id: 5, label: "본문 작성 (~2,000자)", status: "idle" },
  { id: 6, label: "메타디스크립션 생성", status: "idle" },
  { id: 7, label: "태그 & 슬러그 생성", status: "idle" },
  { id: 8, label: "DALL-E 3 썸네일 생성", status: "idle" },
  { id: 9, label: "WordPress 업로드 준비", status: "idle" },
  { id: 10, label: "에디터 이동", status: "idle" },
];

function applyStep(
  steps: Step[],
  id: number,
  status: Step["status"],
  error?: string,
): Step[] {
  return steps.map((s) => (s.id === id ? { ...s, status, error } : s));
}

export default function HomePage() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [progress, setProgress] = useState(0);
  const [relatedKeywords, setRelatedKeywords] = useState<string[]>([]);
  const [stateSnapshot, setStateSnapshot] = useState<Partial<BlogState>>({});

  const runPipeline = async (kw: string, fromStep = 1, partialState: Partial<BlogState> = {}) => {
    setRunning(true);

    const state: Partial<BlogState> = { keyword: kw, ...partialState };

    // Reset steps at and after fromStep; keep completed ones intact
    setSteps((prev) =>
      prev.map((s) =>
        s.id >= fromStep ? { ...s, status: "idle" as const, error: undefined } : s,
      ),
    );

    // Helpers that mutate a local copy and push to React state
    let local = steps.map((s) =>
      s.id >= fromStep ? { ...s, status: "idle" as const, error: undefined } : s,
    );

    const mark = (id: number, status: Step["status"], error?: string) => {
      local = applyStep(local, id, status, error);
      setSteps([...local]);
    };

    const run  = (id: number) => mark(id, "running");
    const done = (id: number) => { mark(id, "done"); setProgress(Math.round((id / 10) * 100)); };
    const fail = (id: number, msg: string) => {
      mark(id, "error", msg);
      setStateSnapshot({ ...state });
      setRunning(false);
    };

    try {
      // Step 1: Related keywords
      if (fromStep <= 1) {
        run(1);
        const res = await fetch("/api/keywords/suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyword: kw }),
        });
        if (!res.ok) { fail(1, await res.text()); return; }
        const data = await res.json() as { keywords: string[] };
        state.relatedKeywords = data.keywords;
        setRelatedKeywords(data.keywords);
        done(1);
      }

      // Step 2: Keyword analysis
      if (fromStep <= 2) {
        run(2);
        const res = await fetch("/api/keywords/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyword: kw, relatedKeywords: state.relatedKeywords }),
        });
        if (!res.ok) { fail(2, await res.text()); return; }
        const data = await res.json() as { articleType: ArticleType };
        state.articleType = data.articleType;
        done(2);
      }

      // Step 3: SEO titles
      if (fromStep <= 3) {
        run(3);
        const res = await fetch("/api/titles/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyword: kw, articleType: state.articleType, relatedKeywords: state.relatedKeywords ?? [] }),
        });
        if (!res.ok) { fail(3, await res.text()); return; }
        const data = await res.json() as { titles: TitleOption[] };
        state.titleOptions = data.titles;
        done(3);
      }

      // Step 4: Outline
      if (fromStep <= 4) {
        run(4);
        const defaultTitle = state.titleOptions?.[0]?.title ?? kw;
        const res = await fetch("/api/outline/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyword: kw, title: defaultTitle, articleType: state.articleType }),
        });
        if (!res.ok) { fail(4, await res.text()); return; }
        const data = await res.json() as { outline: OutlineItem[] };
        state.outline = data.outline;
        done(4);
      }

      // Step 5: Content
      if (fromStep <= 5) {
        run(5);
        const res = await fetch("/api/content/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            keyword: kw,
            title: state.titleOptions?.[0]?.title ?? kw,
            outline: state.outline,
            articleType: state.articleType,
          }),
        });
        if (!res.ok) { fail(5, await res.text()); return; }
        const data = await res.json() as { content: string };
        state.content = data.content;
        done(5);
      }

      // Step 6 & 7: SEO meta
      if (fromStep <= 6) {
        run(6); run(7);
        const res = await fetch("/api/seo/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyword: kw, title: state.titleOptions?.[0]?.title ?? kw, content: state.content }),
        });
        if (!res.ok) { fail(6, await res.text()); return; }
        const data = await res.json() as { metaDescription: string; tags: string[]; slug: string };
        state.metaDescription = data.metaDescription;
        state.tags = data.tags;
        state.slug = data.slug;
        done(6); done(7);
      }

      // Step 8: Thumbnail — NON-FATAL: failure shows error but pipeline continues
      if (fromStep <= 8) {
        run(8);
        try {
          const res = await fetch("/api/image/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ keyword: kw, title: state.titleOptions?.[0]?.title ?? kw }),
          });
          if (!res.ok) throw new Error(await res.text());
          const data = await res.json() as { imageUrl: string };
          state.thumbnailUrl = data.imageUrl;
          done(8);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "썸네일 생성 실패";
          mark(8, "error", msg);
          // Save snapshot so step 8 retry works later, then continue
          setStateSnapshot({ ...state });
        }
      }

      // Step 9: Prepare
      run(9);
      await new Promise((r) => setTimeout(r, 200));
      done(9);

      // Step 10: Navigate to title selection
      run(10);
      setBlogState(state as BlogState);
      done(10);
      await new Promise((r) => setTimeout(r, 200));
      router.push("/titles");
    } catch (err) {
      // Unexpected error outside individual step handlers
      const msg = err instanceof Error ? err.message : "알 수 없는 오류";
      const failedStep = local.find((s) => s.status === "running");
      if (failedStep) fail(failedStep.id, msg);
      else setRunning(false);
    } finally {
      setRunning(false);
    }
  };

  const handleStart = () => {
    if (!keyword.trim() || running) return;
    setSteps(INITIAL_STEPS);
    setProgress(0);
    setRelatedKeywords([]);
    setStateSnapshot({});
    runPipeline(keyword.trim());
  };

  const handleRetry = (stepId: number) => {
    if (running) return;
    runPipeline(keyword.trim(), stepId, stateSnapshot);
  };

  const hasAnyError = steps.some((s) => s.status === "error");
  const hasStarted  = steps.some((s) => s.status !== "idle");

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">WP AI 블로그 생성기</h1>
          <p className="text-gray-500">키워드 하나로 SEO 최적화 블로그 글을 자동 생성합니다</p>
        </div>

        {/* Keyword input */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">메인 키워드</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleStart(); }}
              placeholder="예: 재테크 방법, 다이어트 식단, ChatGPT 활용법"
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              disabled={running}
            />
            <button
              onClick={handleStart}
              disabled={running || !keyword.trim()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm font-semibold whitespace-nowrap"
            >
              {running ? "생성 중..." : "글 생성 시작"}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {hasStarted && (
          <div className="mb-4">
            <ProgressBar progress={progress} />
          </div>
        )}

        {/* Related keywords */}
        {relatedKeywords.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">연관 키워드</p>
            <div className="flex flex-wrap gap-2">
              {relatedKeywords.map((kw) => (
                <span key={kw} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Step indicator */}
        {hasStarted && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-700 text-sm">진행 상황</h2>
              {hasAnyError && !running && (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                  오류 단계의 재시도 버튼을 클릭하세요
                </span>
              )}
            </div>
            <StepIndicator steps={steps} onRetry={handleRetry} disabled={running} />
          </div>
        )}
      </div>
    </main>
  );
}
