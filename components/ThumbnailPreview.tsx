"use client";

interface ThumbnailPreviewProps {
  url: string;
  onRegenerate: (provider: "openai" | "free") => void;
  loading?: boolean;
}

export default function ThumbnailPreview({ url, onRegenerate, loading }: ThumbnailPreviewProps) {
  return (
    <div className="space-y-3">
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

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onRegenerate("openai")}
          disabled={loading}
          className="py-2 text-sm text-indigo-600 border border-indigo-300 rounded-xl hover:bg-indigo-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          {loading && (
            <span className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          )}
          OpenAI 생성
        </button>
        <button
          onClick={() => onRegenerate("free")}
          disabled={loading}
          className="py-2 text-sm text-emerald-600 border border-emerald-300 rounded-xl hover:bg-emerald-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          {loading && (
            <span className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          )}
          무료 생성
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center">
        OpenAI 실패 시 무료 생성으로 자동 전환됩니다
      </p>
    </div>
  );
}
