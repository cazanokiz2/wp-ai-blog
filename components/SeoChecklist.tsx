"use client";

import type { BlogState } from "@/lib/types";

interface SeoChecklistProps {
  state: BlogState;
  onClose: () => void;
  onPublish: (status: "draft" | "publish") => void;
  publishing: boolean;
}

interface CheckItem {
  label: string;
  ok: boolean;
  tip?: string;
}

function buildChecklist(state: BlogState): CheckItem[] {
  const metaLen = state.metaDescription?.length ?? 0;
  const titleHasKeyword = state.selectedTitle
    ?.toLowerCase()
    .includes(state.keyword?.toLowerCase());

  return [
    {
      label: `메타디스크립션 길이 (${metaLen}자)`,
      ok: metaLen >= 120 && metaLen <= 160,
      tip: "120-160자가 최적입니다",
    },
    {
      label: "제목에 키워드 포함",
      ok: !!titleHasKeyword,
      tip: `제목에 '${state.keyword}'을(를) 포함하세요`,
    },
    {
      label: "URL 슬러그 형식 (영문 소문자/하이픈)",
      ok: /^[a-z0-9-]+$/.test(state.slug ?? ""),
      tip: "영문 소문자와 하이픈(-)만 사용하세요",
    },
    {
      label: `본문 길이 (${state.content?.length ?? 0}자)`,
      ok: (state.content?.length ?? 0) >= 2000,
      tip: "최소 2,000자 이상 권장",
    },
    {
      label: `태그 등록 (${state.tags?.length ?? 0}개)`,
      ok: (state.tags?.length ?? 0) >= 1,
      tip: "최소 1개 이상 태그 필요",
    },
    {
      label: "썸네일 이미지",
      ok: !!state.thumbnailUrl,
      tip: "썸네일 이미지를 생성하세요",
    },
  ];
}

export default function SeoChecklist({ state, onClose, onPublish, publishing }: SeoChecklistProps) {
  const checks = buildChecklist(state);
  const allPassed = checks.every((c) => c.ok);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">SEO 체크리스트</h2>
        <div className="space-y-3 mb-6">
          {checks.map((check, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className={`mt-0.5 text-lg ${check.ok ? "text-green-500" : "text-red-500"}`}>
                {check.ok ? "✅" : "❌"}
              </span>
              <div>
                <p className={`text-sm font-medium ${check.ok ? "text-gray-700" : "text-red-700"}`}>
                  {check.label}
                </p>
                {!check.ok && check.tip && (
                  <p className="text-xs text-gray-500 mt-0.5">{check.tip}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {!allPassed && (
          <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-4">
            일부 항목이 최적화되지 않았습니다. 그래도 발행하시겠습니까?
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            disabled={publishing}
          >
            돌아가기
          </button>
          <button
            onClick={() => onPublish("draft")}
            className="flex-1 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50"
            disabled={publishing}
          >
            {publishing ? "처리 중..." : "임시저장"}
          </button>
          <button
            onClick={() => onPublish("publish")}
            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
            disabled={publishing}
          >
            {publishing ? "발행 중..." : "즉시발행"}
          </button>
        </div>
      </div>
    </div>
  );
}
