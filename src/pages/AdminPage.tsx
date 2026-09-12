import React, { useState } from "react";
import { api } from "../lib/api";
import { useLiveData } from "../context/LiveDataContext";
import { Layers, RotateCcw, CheckCircle2, ShieldCheck, Database, Loader2, Globe } from "lucide-react";

export const AdminPage: React.FC = () => {
  const { stats, refresh } = useLiveData();
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleResetDb = async () => {
    if (!confirm("Reset database to initial seed batches and credits?")) return;
    setResetting(true);
    setMessage(null);
    try {
      await api.resetDatabase();
      await refresh();
      setMessage("Database successfully restored to clean seed demonstration state.");
    } catch (err: any) {
      setMessage(`Reset failed: ${err.message}`);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-purple-500/15 text-purple-400 border border-purple-500/30 uppercase">
              PROTOCOL GOVERNANCE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-sans mt-1">
            System Administration & Sandbox Controls
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Supervise global ledger integrity, network nodes, and re-seed demonstration state.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-[#8FF075]/15 border border-[#8FF075]/30 text-white text-xs flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-4 h-4 text-[#8FF075]" />
          <span>{message}</span>
        </div>
      )}

      {/* Global telemetry snapshot */}
      <div className="p-6 rounded-2xl bg-[#12151A] border border-white/8 space-y-4">
        <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <span>Current In-Memory Ledger Telemetry</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-[#161A20] border border-white/5">
            <span className="text-white/40 text-[10px] block">Verified Offsets</span>
            <span className="text-xl font-bold text-white mt-1 block">
              {stats.totalVerifiedOffsetsTonnes} tCO2e
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#161A20] border border-white/5">
            <span className="text-white/40 text-[10px] block">Permanently Retired</span>
            <span className="text-xl font-bold text-blue-400 mt-1 block">
              {stats.totalRetiredCreditsTonnes} tCO2e
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#161A20] border border-white/5">
            <span className="text-white/40 text-[10px] block">Active Network Nodes</span>
            <span className="text-xl font-bold text-cyan-400 mt-1 block">
              {stats.activeNodes}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#161A20] border border-white/5">
            <span className="text-white/40 text-[10px] block">Security Score</span>
            <span className="text-xl font-bold text-[#8FF075] mt-1 block">
              {stats.platformSecurityScorePct}%
            </span>
          </div>
        </div>
      </div>

      {/* Sandbox Reset Utility */}
      <div className="p-6 rounded-2xl bg-[#12151A] border border-white/8 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-purple-400" />
              <span>Reset Demonstration Sandbox</span>
            </h3>
            <p className="text-xs text-white/50 mt-1 max-w-lg">
              Resets the database file to factory demo seeds, clearing created test batches and restoring the original 4-party value chain scenario for fresh testing.
            </p>
          </div>

          <button
            onClick={handleResetDb}
            disabled={resetting}
            className="px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold flex items-center gap-2 transition-colors disabled:opacity-40"
          >
            {resetting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            <span>Reset to Demo Seeds</span>
          </button>
        </div>
      </div>
    </div>
  );
};
