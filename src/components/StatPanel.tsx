import React from "react";
import { GlobalStats } from "../types";
import { TrendingUp, ShieldCheck, Globe, CheckCircle2 } from "lucide-react";

interface StatPanelProps {
  stats: GlobalStats;
}

export const StatPanel: React.FC<StatPanelProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* 1. Total Verified Offsets */}
      <div className="p-5 rounded-2xl bg-[#12151A] border border-white/8 relative overflow-hidden group hover:border-[#8FF075]/30 transition-all shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-white/50 uppercase tracking-wider">
            Total Verified Offsets
          </span>
          <span className="flex items-center gap-1 text-[11px] font-mono text-[#8FF075] bg-[#8FF075]/10 px-2 py-0.5 rounded-full">
            <TrendingUp className="w-3 h-3" />
            +18.4%
          </span>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white font-mono tracking-tight">
            {stats.totalVerifiedOffsetsTonnes.toLocaleString()}
          </span>
          <span className="text-xs font-mono text-[#8FF075]">tCO2e</span>
        </div>
        <p className="text-[11px] text-white/40 mt-1">
          Diverted from open burning & landfills
        </p>

        {/* SVG Sparkline Area Chart */}
        <div className="mt-4 h-12 w-full">
          <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
            <defs>
              <linearGradient id="offsetGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8FF075" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#8FF075" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 0 50 Q 30 45, 60 38 T 120 28 T 170 15 L 200 8 L 200 60 L 0 60 Z"
              fill="url(#offsetGrad)"
            />
            <path
              d="M 0 50 Q 30 45, 60 38 T 120 28 T 170 15 L 200 8"
              fill="none"
              stroke="#8FF075"
              strokeWidth="2.5"
            />
          </svg>
        </div>
      </div>

      {/* 2. Global Network Nodes */}
      <div className="p-5 rounded-2xl bg-[#12151A] border border-white/8 relative overflow-hidden group hover:border-cyan-500/30 transition-all shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-white/50 uppercase tracking-wider">
            Network Nodes
          </span>
          <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full">
            <Globe className="w-3 h-3" />
            4 Regions
          </span>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white font-mono tracking-tight">
            {stats.activeNodes}
          </span>
          <span className="text-xs font-mono text-cyan-400">Hubs Active</span>
        </div>
        <p className="text-[11px] text-white/40 mt-1">
          Farms, kilns & accredited labs connected
        </p>

        {/* Mini Grid Node Visualization */}
        <div className="mt-4 h-12 w-full flex items-center justify-between px-2 bg-[#0B0D10]/50 rounded-lg border border-white/5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[10px] font-mono text-white/60">PB / DEL / HR</span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <span
                key={i}
                className={`w-1.5 h-6 rounded-sm ${
                  i < 5 ? "bg-cyan-400/70" : "bg-cyan-400/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 3. Total Retired Credits */}
      <div className="p-5 rounded-2xl bg-[#12151A] border border-white/8 relative overflow-hidden group hover:border-blue-500/30 transition-all shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-white/50 uppercase tracking-wider">
            Permanently Retired
          </span>
          <span className="flex items-center gap-1 text-[11px] font-mono text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            Locked
          </span>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white font-mono tracking-tight">
            {stats.totalRetiredCreditsTonnes.toLocaleString()}
          </span>
          <span className="text-xs font-mono text-blue-400">tCO2e</span>
        </div>
        <p className="text-[11px] text-white/40 mt-1">
          Burned token proof with zero double-counting
        </p>

        {/* SVG Mini Bar Chart */}
        <div className="mt-4 h-12 w-full flex items-end justify-between gap-1 px-1">
          {[35, 50, 42, 65, 55, 78, 92, 100].map((val, idx) => (
            <div key={idx} className="flex-1 bg-blue-500/20 hover:bg-blue-400 rounded-t transition-colors" style={{ height: `${val}%` }} />
          ))}
        </div>
      </div>

      {/* 4. Platform Trust / Security Score */}
      <div className="p-5 rounded-2xl bg-[#12151A] border border-white/8 relative overflow-hidden group hover:border-[#8FF075]/30 transition-all shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-white/50 uppercase tracking-wider">
            Trust & Security Score
          </span>
          <span className="flex items-center gap-1 text-[11px] font-mono text-[#8FF075] bg-[#8FF075]/10 px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3" />
            Audited
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white font-mono tracking-tight">
                {stats.platformSecurityScorePct}
              </span>
              <span className="text-xs font-mono text-[#8FF075]">%</span>
            </div>
            <p className="text-[11px] text-white/40 mt-1">
              ISO 14064 MRV Compliance
            </p>
          </div>

          {/* Radial Gauge SVG */}
          <div className="relative w-14 h-14 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/10"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#8FF075]"
                strokeDasharray="99.4, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-white">
              99%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
