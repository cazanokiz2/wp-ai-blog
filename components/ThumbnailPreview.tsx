"use client";

interface ThumbnailPreviewProps {
  url: string;
  onRegenerate: () => void;
  loading?: boolean;
}

export default function ThumbnailPreview({ url, onRegenerate, loading }: ThumbnailPreviewProps) {
  return (
    <div className="space-y-2">
      {url ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={url}
          alt="블로그 썸네일"
          className="w-full rounded-xl border border-gray-200 object-cover aspect-video"
        />
      ) : (
        <div className="w-full aspect-video bg-gray-100 rounded-xl flex items-center justify-center border border-dashed border-gray-300">
          <span className="text-gray-400 text-sm">썸네일 없음</span>
        </div>
      )}
      <button
        onClick={onRegenerate}
        disabled={loading}
        className="w-full py-2 text-sm text-indigo-600 border border-indigo-300 rounded-xl hover:bg-indigo-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading && <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />}
        {loading ? "생성 중..." : "썸네일 재생성"}
      </button>
    </div>
  );
}
