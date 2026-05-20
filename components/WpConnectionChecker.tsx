"use client";

import { useState } from "react";
import type { WpCheckResult } from "@/lib/types";

interface CheckItemProps {
  label: string;
  status: "idle" | "checking" | "ok" | "fail";
}

function CheckItem({ label, status }: CheckItemProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="w-6 text-lg">
        {status === "checking" && <span className="inline-block w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />}
        {status === "ok" && "✅"}
        {status === "fail" && "❌"}
        {status === "idle" && <span className="w-4 h-4 border-2 border-gray-300 rounded-full inline-block" />}
      </span>
      <span className={`text-sm ${status === "fail" ? "text-red-600" : status === "ok" ? "text-green-700" : "text-gray-600"}`}>
        {label}
      </span>
    </div>
  );
}

type CheckStatus = "idle" | "checking" | "ok" | "fail";

export default function WpConnectionChecker() {
  const [checking, setChecking] = useState(false);
  const [statuses, setStatuses] = useState<Record<keyof WpCheckResult, CheckStatus>>({
    siteAccess: "idle",
    restApi: "idle",
    auth: "idle",
    draftTest: "idle",
    imageTest: "idle",
    categories: "idle",
  });

  const run = async () => {
    setChecking(true);
    setStatuses({ siteAccess: "checking", restApi: "idle", auth: "idle", draftTest: "idle", imageTest: "idle", categories: "idle" });

    try {
      const res = await fetch("/api/wordpress/check", { method: "POST" });
      if (!res.ok) throw new Error();
      const result = await res.json() as WpCheckResult;

      const keys: Array<keyof WpCheckResult> = ["siteAccess", "restApi", "auth", "draftTest", "imageTest", "categories"];
      for (const key of keys) {
        setStatuses((prev) => ({ ...prev, [key]: result[key] ? "ok" : "fail" }));
        await new Promise((r) => setTimeout(r, 150));
      }
    } catch {
      setStatuses((prev) => {
        const next = { ...prev };
        (Object.keys(next) as Array<keyof WpCheckResult>).forEach((k) => {
          if (next[k] === "checking" || next[k] === "idle") next[k] = "fail";
        });
        return next;
      });
    } finally {
      setChecking(false);
    }
  };

  const labels: Record<keyof WpCheckResult, string> = {
    siteAccess: "사이트 접속 가능",
    restApi: "REST API 응답",
    auth: "인증 확인",
    draftTest: "글 임시저장 테스트",
    imageTest: "이미지 업로드 테스트",
    categories: "카테고리 조회",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="font-semibold text-gray-700 mb-3">WordPress 연결 점검</h3>
      <div className="divide-y divide-gray-100">
        {(Object.keys(labels) as Array<keyof WpCheckResult>).map((key) => (
          <CheckItem key={key} label={labels[key]} status={statuses[key]} />
        ))}
      </div>
      <button
        onClick={run}
        disabled={checking}
        className="mt-4 w-full py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm font-medium"
      >
        {checking ? "점검 중..." : "연결 점검 시작"}
      </button>
    </div>
  );
}
