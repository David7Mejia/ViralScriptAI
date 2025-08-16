"use client";

import { CheckCircle, Loader2, Circle, X } from "lucide-react";

type StepKey = "idle" | "get-video" | "transcript" | "upload" | "analyze" | "streaming" | "complete" | "error";

const STEP_ORDER: { key: StepKey; label: string }[] = [
  { key: "get-video", label: "Fetching video" },
  { key: "transcript", label: "Transcribing audio" },
  { key: "analyze", label: "Preparing analysis" },
  { key: "streaming", label: "Streaming results" },
  { key: "complete", label: "All Done!" },
];

function statusFor(index: number, currentIndex: number, currentStep: StepKey) {
  if (currentStep === "error") return index < currentIndex ? "done" : index === currentIndex ? "error" : "pending";
  if (index < currentIndex) return "done";
  if (index === currentIndex) return currentStep === "complete" ? "done" : "active";
  return "pending";
}

export default function ProgressModal({ open, step, onClose }: { open: boolean; step: StepKey; onClose: () => void }) {
  if (!open) return null;

  const currentIndex = Math.max(
    0,
    STEP_ORDER.findIndex(s => s.key === step)
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* modal */}
      <div className="relative z-[101] w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Processing</h2>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:text-gray-600 focus:outline-none" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {STEP_ORDER.map((s, i) => {
            const st = statusFor(i, currentIndex, step);
            const isDone = st === "done";
            const isActive = st === "active";
            const isPending = st === "pending";
            const isError = st === "error";

            return (
              <div key={s.key} className="flex items-center gap-3">
                <div className="w-6 h-6 flex items-center justify-center">
                  {isDone && <CheckCircle className="h-6 w-6 text-green-600" />}
                  {isActive && <Loader2 className="h-6 w-6 animate-spin text-blue-600" />}
                  {isPending && <Circle className="h-6 w-6 text-gray-300" />}
                  {isError && <Circle className="h-6 w-6 text-red-500" />}
                </div>
                <div className="text-sm font-medium text-gray-800">{s.label}</div>
              </div>
            );
          })}
        </div>

        {step === "complete" && <div className="mt-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">All Done!</div>}

        {step === "error" && <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">Something went wrong. Please try again.</div>}
      </div>
    </div>
  );
}
