import React from "react";
import { BatchStatus } from "../types";
import { Check, Clock, AlertCircle } from "lucide-react";

interface StatusTimelineProps {
  status: BatchStatus;
}

const STEPS: { status: BatchStatus; label: string; stage: string }[] = [
  { status: "booked", label: "Logged & AI Checked", stage: "Supplier" },
  { status: "picked_up", label: "Dispatched", stage: "Logistics" },
  { status: "in_transit", label: "In Transit", stage: "Logistics" },
  { status: "delivered", label: "Delivered at Facility", stage: "Logistics" },
  { status: "claimed", label: "Facility Claimed", stage: "Recycler" },
  { status: "processing", label: "Thermal Conversion", stage: "Recycler" },
  { status: "processed", label: "Bio-Product Synthesized", stage: "Recycler" },
  { status: "pending_check", label: "Submitted for Audit", stage: "Auditor" },
  { status: "verified", label: "ISO Verified & Minted", stage: "Carbon Credit" },
];

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ status }) => {
  if (status === "rejected") {
    return (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-xs font-mono">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <div>
          <span className="font-bold">STATUS: REJECTED BY AUDITOR</span>
          <p className="text-white/60 text-[11px] mt-0.5">
            Feedstock or conversion parameters did not satisfy ISO 14064 MRV thresholds.
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.status === status);

  return (
    <div className="w-full py-3 overflow-x-auto">
      <div className="flex items-center min-w-[680px]">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <div key={step.status} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1 relative group">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                    isCompleted
                      ? "bg-[#8FF075] text-[#0B0D10] shadow-[0_0_10px_rgba(143,240,117,0.4)]"
                      : isCurrent
                      ? "bg-[#3B82F6] text-white border-2 border-white shadow-[0_0_12px_rgba(59,130,246,0.6)] animate-pulse"
                      : "bg-[#161A20] text-white/30 border border-white/10"
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                </div>

                <span
                  className={`mt-1.5 text-[10px] font-mono text-center tracking-tight leading-tight ${
                    isCurrent
                      ? "text-white font-bold"
                      : isCompleted
                      ? "text-[#8FF075]/80"
                      : "text-white/30"
                  }`}
                >
                  {step.label}
                </span>
                <span className="text-[9px] text-white/40 uppercase tracking-widest font-mono">
                  {step.stage}
                </span>
              </div>

              {idx < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-8 sm:w-12 -mt-6 transition-colors ${
                    idx < currentIndex ? "bg-[#8FF075]" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
