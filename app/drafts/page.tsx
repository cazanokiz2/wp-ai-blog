"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Draft } from "@/lib/types";
import { setBlogState } from "@/lib/types";

export default function DraftsPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadDrafts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/drafts");
      if (!res.ok) throw new Error();
      const data = await res.json() as Draft[];
      setDrafts(data.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDrafts(); }, [loadDrafts]);

  const handleRestore = (draft: Draft) => {
    setBlogState(draft.data);
    router.push("/editor");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 임시저장을 삭제하시겠습니까?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/drafts?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    } catch {
      alert("삭제 실패");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">임시저장 목록</h1>
            <p className="text-sm text-gray-500 mt-1">{drafts.length}개의 임시저장</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-semibold"
          >
            새 글 작성
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : drafts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-4xl mb-3">📂</p>
            <p className="text-gray-500">임시저장된 글이 없습니다</p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm"
            >
              첫 번째 글 작성하기
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {drafts.map((draft) => (
              <div key={draft.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-indigo-200 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-gray-800 truncate">{draft.selectedTitle || draft.keyword}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium">
                        {draft.keyword}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(draft.updatedAt)}
                      </span>
                    </div>
                    {draft.data?.content && (
                      <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                        {draft.data.content.slice(0, 120)}...
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleRestore(draft)}
                      className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                      불러오기
                    </button>
                    <button
                      onClick={() => handleDelete(draft.id)}
                      disabled={deleting === draft.id}
                      className="px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {deleting === draft.id ? "..." : "삭제"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return "방금 전";
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffHour < 24) return `${diffHour}시간 전`;
    if (diffDay < 7) return `${diffDay}일 전`;
    return date.toLocaleDateString("ko-KR");
  } catch {
    return dateStr;
  }
}
