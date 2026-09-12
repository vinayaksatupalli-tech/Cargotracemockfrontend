import React, { useRef } from "react";
import { LedgerEvent } from "../types";
import { Layers, Activity, ExternalLink } from "lucide-react";

interface LiveLedgerProps {
  events: LedgerEvent[];
  onSelectEvent?: (event: LedgerEvent) => void;
  maxItems?: number;
}

export const LiveLedger: React.FC<LiveLedgerProps> = ({ events, onSelectEvent, maxItems = 10 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const displayedEvents = maxItems ? events.slice(0, maxItems) : events;

  const getTypeBadge = (type: LedgerEvent["type"]) => {
    switch (type) {
      case "Waste Logged":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      case "Batch Claimed":
        return "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
      case "Processed":
        return "bg-purple-500/15 text-purple-300 border-purple-500/30";
      case "Credit Minted":
        return "bg-[#8FF075]/15 text-[#8FF075] border-[#8FF075]/30";
      case "Credit Sold":
        return "bg-blue-500/15 text-blue-300 border-blue-500/30";
      case "Credit Retired":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      default:
        return "bg-white/10 text-white/70 border-white/15";
    }
  };

  const formatTime = (ts: string) => {
    try {
      const date = new Date(ts);
      return date.toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return "00:00:00";
    }
  };

  return (
    <div className="w-full rounded-2xl bg-[#12151A] border border-white/8 p-5 shadow-2xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-[#8FF075]/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#8FF075]/10 border border-[#8FF075]/20 flex items-center justify-center text-[#8FF075]">
            <Activity className="w-4 h-4 text-[#8FF075]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white tracking-wide font-sans">
                Live Transaction Ledger
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#8FF075]/10 text-[#8FF075] border border-[#8FF075]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8FF075] animate-ping" />
                REAL-TIME STREAM
              </span>
            </div>
            <p className="text-xs text-white/50">
              Immutable provenance blocks emitted across supplier, recycling, and audit operations
            </p>
          </div>
        </div>

        <div className="text-right font-mono text-xs text-white/40">
          Total Blocks: <span className="text-[#8FF075] font-semibold">{events.length}</span>
        </div>
      </div>

      {/* Ledger Feed Table */}
      <div
        ref={containerRef}
        className="mt-3 overflow-x-auto divide-y divide-white/5 font-mono text-xs max-h-[380px] overflow-y-auto"
      >
        {displayedEvents.length === 0 ? (
          <div className="py-8 text-center text-white/40">
            Awaiting new transaction blocks from network...
          </div>
        ) : (
          displayedEvents.map((ev, index) => (
            <div
              key={ev.id || index}
              onClick={() => onSelectEvent?.(ev)}
              className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-white/[0.03] transition-colors rounded-lg cursor-pointer group"
            >
              {/* Left col: Timestamp & Hash */}
              <div className="flex items-center gap-3 min-w-[200px]">
                <span className="text-white/40 text-[11px] tabular-nums">
                  {formatTime(ev.timestamp)}
                </span>
                <span className="text-[#8FF075]/90 font-medium group-hover:text-[#8FF075] transition-colors">
                  {ev.hash}
                </span>
              </div>

              {/* Middle col: Type & Details */}
              <div className="flex-1 flex items-center gap-3">
                <span
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium border uppercase tracking-wider whitespace-nowrap ${getTypeBadge(
                    ev.type
                  )}`}
                >
                  {ev.type}
                </span>
                <span className="text-white/70 truncate text-xs hidden sm:inline">
                  {ev.details || `Batch ${ev.relatedBatchId || "CT"}`}
                </span>
              </div>

              {/* Right col: Tonnage & Auditor / Verification */}
              <div className="flex items-center gap-4 text-right">
                <div className="text-right">
                  <span className="text-white font-semibold tabular-nums">
                    {ev.tonnage > 0 ? `${ev.tonnage.toFixed(2)}t` : "—"}
                  </span>
                  {ev.verifiedBy && (
                    <div className="text-[10px] text-white/40 truncate max-w-[140px] hidden md:block">
                      {ev.verifiedBy}
                    </div>
                  )}
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-white/30 group-hover:text-white/80 transition-colors" />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-3 mt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40 font-mono">
        <span>Append-only hash chain • ISO 14064 MRV</span>
        <span>Click any row to inspect full provenance audit trail</span>
      </div>
    </div>
  );
};
