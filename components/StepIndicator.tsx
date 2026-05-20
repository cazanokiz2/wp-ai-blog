"use client";

import type { Step } from "@/lib/types";

interface StepIndicatorProps {
  steps: Step[];
  onRetry?: (stepId: number) => void;
  disabled?: boolean;
}

export default function StepIndicator({ steps, onRetry, disabled }: StepIndicatorProps) {
  return (
    <div className="space-y-1">
      {steps.map((step) => (
        <div key={step.id}>
          <div className="flex items-center gap-3 py-1.5">
            {/* Status icon */}
            <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
              {step.status === "running" && (
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              )}
              {step.status === "done" && (
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              {step.status === "error" && (
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              {step.status === "idle" && (
                <div className="w-5 h-5 border-2 border-gray-200 rounded-full" />
              )}
            </div>

            {/* Step number + label */}
            <div className="flex-1 min-w-0">
              <span
                className={`text-sm ${
                  step.status === "running" ? "text-indigo-600 font-semibold" :
                  step.status === "done"    ? "text-green-700 font-medium" :
                  step.status === "error"   ? "text-red-700 font-medium" :
                  "text-gray-400"
                }`}
              >
                <span className="text-xs opacity-60 mr-1.5">{step.id}.</span>
                {step.status === "running" ? `${step.label}...` : step.label}
              </span>
            </div>

            {/* Retry button */}
            {step.status === "error" && onRetry && (
              <button
                onClick={() => onRetry(step.id)}
                disabled={disabled}
                className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                재시도
              </button>
            )}
          </div>

          {/* Error message */}
          {step.status === "error" && step.error && (
            <div className="ml-9 mb-1">
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5 break-all">
                {step.error}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
