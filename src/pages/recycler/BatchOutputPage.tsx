import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { WasteBatch } from "../../types";
import { ArrowLeft, CheckCircle2, ShieldCheck, ArrowRight, Loader2, Sparkles, Cpu } from "lucide-react";

interface BatchOutputPageProps {
  batchId: string;
  onNavigate: (path: string) => void;
}

export const BatchOutputPage: React.FC<BatchOutputPageProps> = ({ batchId, onNavigate }) => {
  const [batch, setBatch] = useState<WasteBatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getBatchByIdOrHash(batchId);
        setBatch(res.batch);
      } catch (err: any) {
        setError(err.message || "Failed to load batch");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [batchId]);

  const handleRequestCheck = async () => {
    if (!batch) return;
    setRequesting(true);
    setError(null);
    try {
      const res = await api.requestCheck(batch.id);
      setBatch(res.batch);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit for auditor check");
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-white/50 text-xs font-mono">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-cyan-400" />
        Loading finished product summary...
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center text-xs text-red-400 font-mono">
        {error || "Batch not found"}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <button
        onClick={() => onNavigate("/recycler/dashboard")}
        className="flex items-center gap-1.5 text-xs font-mono text-white/50 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Recycler Dashboard</span>
      </button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 uppercase">
            STEP 3: CONVERSION RUN COMPLETE
          </span>
          <span className="font-mono text-xs text-white/50">{batch.id}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white font-sans mt-1">
          Finished Bio-Product Output Summary
        </h1>
        <p className="text-xs text-white/50 mt-1">
          Thermal conversion logs validated. Submit batch into the independent ISO 14064 Checker audit queue.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-[#8FF075]/15 border border-[#8FF075]/30 text-white text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#8FF075] font-mono">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Batch submitted for independent verification! Status: PENDING_CHECK.</span>
          </div>
          <button
            onClick={() => onNavigate("/market")}
            className="px-3 py-1.5 rounded-lg bg-[#8FF075] text-[#0B0D10] font-semibold text-xs flex items-center gap-1 font-sans"
          >
            <span>Proceed to Auditor Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Product Summary Grid */}
      <div className="p-6 rounded-2xl bg-[#12151A] border border-white/8 space-y-6">
        <div className="flex items-center justify-between border-b border-white/8 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-sans uppercase">
                {batch.processing?.method.replace("_", " ") || "Thermal Pyrolysis"}
              </h3>
              <p className="text-[11px] font-mono text-white/40">
                Facility: {batch.recyclerName || "BioVeda Pyrolysis Unit #4"}
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-lg text-xs font-mono uppercase bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold">
            {batch.status.replace("_", " ")}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-[#161A20] border border-white/5">
            <span className="text-white/40 text-[10px] block">Raw Input Mass</span>
            <span className="text-white font-bold text-base mt-1 block">
              {batch.weightKg.toLocaleString()} kg
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#161A20] border border-white/5">
            <span className="text-white/40 text-[10px] block">Biochar Yield</span>
            <span className="text-[#8FF075] font-bold text-base mt-1 block">
              {batch.processing?.outputAmount.toLocaleString()} kg
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#161A20] border border-white/5">
            <span className="text-white/40 text-[10px] block">Parasitic Energy</span>
            <span className="text-cyan-400 font-bold text-base mt-1 block">
              {batch.processing?.energyUsedKwh} kWh
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#161A20] border border-white/5">
            <span className="text-white/40 text-[10px] block">Conversion Efficiency</span>
            <span className="text-white font-bold text-base mt-1 block">
              {(((batch.processing?.outputAmount || 1) / batch.weightKg) * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0B0D10] border border-white/8 space-y-2 text-xs">
          <div className="flex items-center justify-between text-white/70">
            <span>Declared Product Type:</span>
            <span className="text-white font-mono uppercase font-bold">
              {batch.processing?.outputType}
            </span>
          </div>
          <div className="flex items-center justify-between text-white/70">
            <span>Batch Hash:</span>
            <span className="text-[#8FF075] font-mono">{batch.trackingHash}</span>
          </div>
          <div className="flex items-center justify-between text-white/70">
            <span>Pyrolysis Completion Timestamp:</span>
            <span className="text-white font-mono">
              {batch.processing?.processedAt ? new Date(batch.processing.processedAt).toLocaleString() : "Just now"}
            </span>
          </div>
        </div>

        {/* Action Button */}
        {batch.status === "processed" && (
          <div className="pt-4 border-t border-white/8 flex items-center justify-between">
            <span className="text-xs text-white/40 font-mono">
              Next Step: Independent Lab Spectrometry & Credit Minting
            </span>

            <button
              type="button"
              onClick={handleRequestCheck}
              disabled={requesting}
              className="px-6 py-3 rounded-xl bg-[#8FF075] hover:bg-[#8FF075]/90 text-[#0B0D10] font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#8FF075]/15 transition-all disabled:opacity-40"
            >
              {requesting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting to Auditor...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Ask for Independent Check</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
