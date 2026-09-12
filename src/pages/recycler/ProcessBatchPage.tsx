import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { WasteBatch } from "../../types";
import { ArrowLeft, Cpu, Zap, ArrowRight, Loader2, AlertTriangle, Sparkles } from "lucide-react";

interface ProcessBatchPageProps {
  batchId: string;
  onNavigate: (path: string) => void;
}

export const ProcessBatchPage: React.FC<ProcessBatchPageProps> = ({ batchId, onNavigate }) => {
  const [batch, setBatch] = useState<WasteBatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [method, setMethod] = useState<"biochar_kiln" | "biogas_digestor" | "composting">("biochar_kiln");
  const [energyUsedKwh, setEnergyUsedKwh] = useState<number>(310);
  const [outputAmount, setOutputAmount] = useState<number>(2450);
  const [outputType, setOutputType] = useState<"biochar" | "green_gas" | "clean_fuel">("biochar");

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getBatchByIdOrHash(batchId);
        setBatch(res.batch);
        // Estimate outputs based on input feedstock mass
        const initialOutput = Math.round(res.batch.weightKg * 0.32);
        setOutputAmount(initialOutput);
        setEnergyUsedKwh(Math.round(res.batch.weightKg * 0.04));
      } catch (err: any) {
        setError(err.message || "Failed to load batch");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [batchId]);

  const handleMethodChange = (newMethod: typeof method) => {
    setMethod(newMethod);
    if (newMethod === "biochar_kiln") {
      setOutputType("biochar");
      if (batch) setOutputAmount(Math.round(batch.weightKg * 0.32));
    } else if (newMethod === "biogas_digestor") {
      setOutputType("green_gas");
      if (batch) setOutputAmount(Math.round(batch.weightKg * 0.45));
    } else {
      setOutputType("clean_fuel");
      if (batch) setOutputAmount(Math.round(batch.weightKg * 0.5));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batch) return;
    setSubmitting(true);
    setError(null);

    try {
      await api.submitProcessing(batch.id, {
        method,
        energyUsedKwh,
        outputAmount,
        outputType,
      });

      onNavigate(`/recycler/output/${batch.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to submit processing logs");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-white/50 text-xs font-mono">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-cyan-400" />
        Loading facility intake record...
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

  const estimatedOffsets = Number(((outputAmount * 0.78 * 3.67) / 1000).toFixed(2));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <button
        onClick={() => onNavigate("/recycler/dashboard")}
        className="flex items-center gap-1.5 text-xs font-mono text-white/50 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Recycler Facility</span>
      </button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 uppercase">
            STEP 2: PYROLYSIS & VALORIZATION RUN
          </span>
          <span className="font-mono text-xs text-white/50">{batch.id}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white font-sans mt-1">
          Record Thermal Conversion Run
        </h1>
        <p className="text-xs text-white/50 mt-1">
          Log operational telemetry for Batch {batch.id} ({batch.trackingHash}) converting {batch.weightKg.toLocaleString()}kg of raw organic feedstock.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 font-mono">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Intake summary card */}
      <div className="p-4 rounded-xl bg-[#12151A] border border-white/8 grid grid-cols-3 gap-3 text-xs font-mono">
        <div>
          <span className="text-white/40 block text-[10px]">Feedstock Mass</span>
          <span className="text-white font-bold">{batch.weightKg.toLocaleString()} kg</span>
        </div>
        <div>
          <span className="text-white/40 block text-[10px]">Feedstock Type</span>
          <span className="text-cyan-400 uppercase font-bold">{batch.wasteType}</span>
        </div>
        <div>
          <span className="text-white/40 block text-[10px]">Raw Moisture</span>
          <span className="text-white font-bold">{batch.moisturePct}%</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-[#12151A] border border-white/8 space-y-6">
        <div>
          <label className="block text-xs font-mono text-white/70 mb-2">
            Conversion Method
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleMethodChange("biochar_kiln")}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                method === "biochar_kiln"
                  ? "bg-cyan-500/15 border-cyan-500/50 text-white shadow-sm"
                  : "bg-[#161A20] border-white/10 text-white/60 hover:text-white"
              }`}
            >
              <div className="text-xs font-bold uppercase font-mono">Continuous Biochar Kiln</div>
              <p className="text-[10px] opacity-70 mt-1">High-heat pyrolysis (550°C) with 100-yr stability</p>
            </button>

            <button
              type="button"
              onClick={() => handleMethodChange("biogas_digestor")}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                method === "biogas_digestor"
                  ? "bg-cyan-500/15 border-cyan-500/50 text-white shadow-sm"
                  : "bg-[#161A20] border-white/10 text-white/60 hover:text-white"
              }`}
            >
              <div className="text-xs font-bold uppercase font-mono">Biogas Digestor</div>
              <p className="text-[10px] opacity-70 mt-1">Methane capture & compressed green gas</p>
            </button>

            <button
              type="button"
              onClick={() => handleMethodChange("composting")}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                method === "composting"
                  ? "bg-cyan-500/15 border-cyan-500/50 text-white shadow-sm"
                  : "bg-[#161A20] border-white/10 text-white/60 hover:text-white"
              }`}
            >
              <div className="text-xs font-bold uppercase font-mono">Aerobic Digestion</div>
              <p className="text-[10px] opacity-70 mt-1">Refined organic humic soil conditioner</p>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-white/70 mb-1">
              Parasitic Electricity Consumed (kWh)
            </label>
            <input
              type="number"
              required
              min="10"
              max="5000"
              value={energyUsedKwh}
              onChange={(e) => setEnergyUsedKwh(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#161A20] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
            />
            <span className="text-[10px] text-white/40 mt-1 block">
              Direct electrical meter reading for kiln blower & heaters
            </span>
          </div>

          <div>
            <label className="block text-xs font-mono text-white/70 mb-1">
              Finished Yield Mass (kg)
            </label>
            <input
              type="number"
              required
              min="50"
              max="50000"
              value={outputAmount}
              onChange={(e) => setOutputAmount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#161A20] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
            />
            <span className="text-[10px] text-cyan-400 font-mono mt-1 block">
              Yield Ratio: {((outputAmount / batch.weightKg) * 100).toFixed(1)}% of feedstock
            </span>
          </div>
        </div>

        {/* Expected Offset Calculation Preview */}
        <div className="p-4 rounded-xl bg-[#0B0D10] border border-cyan-500/20 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-cyan-400 uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Projected Carbon Removal Value</span>
            </span>
            <p className="text-xs text-white/70 mt-0.5">
              Based on ISO 14064 elemental carbon multiplier (~78% carbon content)
            </p>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold font-mono text-[#8FF075]">~{estimatedOffsets} tCO2e</span>
            <span className="text-[10px] text-white/40 block">Permanent Sink Potential</span>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-white/8 flex items-center justify-between">
          <span className="text-xs text-white/40 font-mono">
            Advances batch status to "processed"
          </span>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#0B0D10] font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-40"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Recording Run on Ledger...</span>
              </>
            ) : (
              <>
                <span>Complete Run & Review Output</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
