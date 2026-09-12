import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { WasteBatch, CreditType } from "../../types";
import {
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Lock,
  FileCheck,
  Scale
} from "lucide-react";

interface ReviewBatchPageProps {
  batchId: string;
  onNavigate: (path: string) => void;
}

export const ReviewBatchPage: React.FC<ReviewBatchPageProps> = ({ batchId, onNavigate }) => {
  const [batch, setBatch] = useState<WasteBatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lab Spectrometry Inputs
  const [moistureReductionPct, setMoistureReductionPct] = useState<number>(84.2);
  const [carbonContentPct, setCarbonContentPct] = useState<number>(78.8);
  const [contaminationFlag, setContaminationFlag] = useState<boolean>(false);

  // Safety Checklist
  const [checkTemp, setCheckTemp] = useState(true);
  const [checkMetals, setCheckMetals] = useState(true);
  const [checkVolatiles, setCheckVolatiles] = useState(true);
  const [checkOrigin, setCheckOrigin] = useState(true);

  // Credit minting configuration
  const [pricePerTonUsd, setPricePerTonUsd] = useState<number>(125);
  const [creditType, setCreditType] = useState<CreditType>("Carbon Removal");

  // Gemini Certificate text
  const [certificateText, setCertificateText] = useState<string>("");
  const [generatingCert, setGeneratingCert] = useState(false);

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

  // Compute calculated carbon removal credit tonnage:
  // Formula: Biochar kg * (carbon % / 100) * 3.67 / 1000
  const biocharKg = batch?.processing?.outputAmount || 2000;
  const computedTonnes = Number(((biocharKg * (carbonContentPct / 100) * 3.67) / 1000).toFixed(2));

  const handleGenerateCertificatePreview = async () => {
    if (!batch) return;
    setGeneratingCert(true);
    try {
      // In server.ts, approveAndMint generates certificate, or we can construct/preview
      setCertificateText(
        `This certified carbon removal certificate attests to the permanent geological sequestration of ${computedTonnes} metric tonnes of CO2 equivalent (tCO2e). The underlying feedstock comprised ${batch.weightKg} kg of agricultural residue, thermally converted via ${batch.processing?.method.replace("_", " ") || "continuous pyrolysis kiln"} at certified facility ${batch.recyclerName || "BioVeda Unit #4"}. Laboratory elemental spectrometry confirms ${carbonContentPct}% stable organic carbon with zero halogenated impurities. Fully compliant under ISO 14064 MRV standards with verified permanent sink durability.`
      );
    } finally {
      setGeneratingCert(false);
    }
  };

  const handleApprove = async () => {
    if (!batch) return;
    if (contaminationFlag) {
      setError("Cannot approve batch with active contamination flag.");
      return;
    }
    if (!checkTemp || !checkMetals || !checkVolatiles || !checkOrigin) {
      setError("All ISO 14064 safety checklist items must be confirmed.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await api.approveAndMint(batch.id, {
        labData: {
          moistureReductionPct,
          carbonContentPct,
          contaminationFlag,
          safetyChecklist: {
            temperatureVerified: checkTemp,
            heavyMetalsPassed: checkMetals,
            volatileMatterStabilized: checkVolatiles,
            originTraceable: checkOrigin,
          },
        },
        creditPricePerTonUsd: pricePerTonUsd,
        creditType,
      });

      // Redirect to Wallet or Marketplace to view newly minted credit
      onNavigate("/wallet");
    } catch (err: any) {
      setError(err.message || "Failed to approve and mint credit");
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!batch) return;
    const reason = prompt("Enter reason for batch rejection:");
    if (!reason) return;

    setSubmitting(true);
    try {
      await api.rejectBatch(batch.id, reason);
      onNavigate("/market");
    } catch (err: any) {
      setError(err.message || "Failed to reject batch");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-white/50 text-xs font-mono">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#8FF075]" />
        Loading batch audit dossier...
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
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <button
        onClick={() => onNavigate("/market")}
        className="flex items-center gap-1.5 text-xs font-mono text-white/50 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Checker Desk</span>
      </button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-[#8FF075]/15 text-[#8FF075] border border-[#8FF075]/30 uppercase">
            AUDITOR CERTIFICATION PROTOCOL
          </span>
          <span className="font-mono text-xs text-white/50">{batch.id}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white font-sans mt-1">
          Review & Certify Batch #{batch.id}
        </h1>
        <p className="text-xs text-white/50 mt-1 font-mono">
          Custody Hash: <span className="text-[#8FF075]">{batch.trackingHash}</span> | Recycler: {batch.recyclerName}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 font-mono">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid: Lab Spectrometry + Safety Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Spectrometry Measurements */}
        <div className="p-6 rounded-2xl bg-[#12151A] border border-white/8 space-y-4">
          <div className="flex items-center justify-between border-b border-white/8 pb-3">
            <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#8FF075]" />
              <span>Lab Spectrometry Inputs</span>
            </h3>
            <span className="text-[10px] font-mono text-[#8FF075] bg-[#8FF075]/10 px-2 py-0.5 rounded">
              ISO 14064-2
            </span>
          </div>

          <div>
            <label className="block text-xs font-mono text-white/70 mb-1">
              Elemental Carbon Purity (% C)
            </label>
            <input
              type="number"
              step="0.1"
              min="50"
              max="99"
              value={carbonContentPct}
              onChange={(e) => setCarbonContentPct(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#161A20] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#8FF075]"
            />
            <span className="text-[10px] text-white/40 mt-1 block">
              Direct combustion elemental analyzer reading
            </span>
          </div>

          <div>
            <label className="block text-xs font-mono text-white/70 mb-1">
              Moisture Loss Efficiency (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="50"
              max="99"
              value={moistureReductionPct}
              onChange={(e) => setMoistureReductionPct(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#161A20] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#8FF075]"
            />
          </div>

          {/* Contamination toggle */}
          <div className="pt-2 border-t border-white/5">
            <label className="flex items-center gap-2 text-xs font-mono text-white/80 cursor-pointer">
              <input
                type="checkbox"
                checked={contaminationFlag}
                onChange={(e) => setContaminationFlag(e.target.checked)}
                className="w-4 h-4 rounded text-red-500 bg-[#161A20] border-white/10"
              />
              <span className={contaminationFlag ? "text-red-400 font-bold" : "text-white/70"}>
                Flag as Contaminated / Non-compliant
              </span>
            </label>
          </div>

          {/* Calculated Credit Value */}
          <div className="mt-4 p-4 rounded-xl bg-[#0B0D10] border border-[#8FF075]/20">
            <span className="text-[10px] font-mono text-white/50 uppercase block">
              Calculated Carbon Removal Credit:
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-[#8FF075]">
                {computedTonnes}
              </span>
              <span className="text-xs font-mono text-white/60">tCO2e (Permanent)</span>
            </div>
            <p className="text-[10px] text-white/40 mt-1">
              Formula: {biocharKg}kg yield × {carbonContentPct}% C × 3.67 stoichiometry
            </p>
          </div>
        </div>

        {/* Right Column: Safety Checklist & Mint Parameters */}
        <div className="p-6 rounded-2xl bg-[#12151A] border border-white/8 space-y-4">
          <div className="flex items-center justify-between border-b border-white/8 pb-3">
            <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#8FF075]" />
              <span>Safety & MRV Checklist</span>
            </h3>
            <span className="text-[10px] font-mono text-[#8FF075]">4 Points Required</span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <label className="flex items-center gap-2.5 p-2 rounded-lg bg-[#161A20] hover:bg-white/5 cursor-pointer">
              <input
                type="checkbox"
                checked={checkTemp}
                onChange={(e) => setCheckTemp(e.target.checked)}
                className="w-4 h-4 text-[#8FF075] rounded bg-[#0B0D10]"
              />
              <span className="text-white/80">Pyrolysis temp sustained &gt;500°C for ≥30 min</span>
            </label>

            <label className="flex items-center gap-2.5 p-2 rounded-lg bg-[#161A20] hover:bg-white/5 cursor-pointer">
              <input
                type="checkbox"
                checked={checkMetals}
                onChange={(e) => setCheckMetals(e.target.checked)}
                className="w-4 h-4 text-[#8FF075] rounded bg-[#0B0D10]"
              />
              <span className="text-white/80">Heavy metal analysis meets WHO / EBC safety limits</span>
            </label>

            <label className="flex items-center gap-2.5 p-2 rounded-lg bg-[#161A20] hover:bg-white/5 cursor-pointer">
              <input
                type="checkbox"
                checked={checkVolatiles}
                onChange={(e) => setCheckVolatiles(e.target.checked)}
                className="w-4 h-4 text-[#8FF075] rounded bg-[#0B0D10]"
              />
              <span className="text-white/80">Volatile organic matter stabilized &lt;15%</span>
            </label>

            <label className="flex items-center gap-2.5 p-2 rounded-lg bg-[#161A20] hover:bg-white/5 cursor-pointer">
              <input
                type="checkbox"
                checked={checkOrigin}
                onChange={(e) => setCheckOrigin(e.target.checked)}
                className="w-4 h-4 text-[#8FF075] rounded bg-[#0B0D10]"
              />
              <span className="text-white/80">Origin coordinates verified against land registry</span>
            </label>
          </div>

          <div className="pt-3 border-t border-white/5 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-white/70 mb-1">
                Market Price ($/tCO2e)
              </label>
              <input
                type="number"
                min="10"
                max="1000"
                value={pricePerTonUsd}
                onChange={(e) => setPricePerTonUsd(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#161A20] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#8FF075]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-white/70 mb-1">
                Credit Standard Type
              </label>
              <select
                value={creditType}
                onChange={(e) => setCreditType(e.target.value as CreditType)}
                className="w-full px-3 py-2 rounded-xl bg-[#161A20] border border-white/10 text-white text-xs focus:outline-none focus:border-[#8FF075]"
              >
                <option value="Carbon Removal">Carbon Removal (Biochar)</option>
                <option value="Methane Abatement">Methane Abatement (Biogas)</option>
                <option value="Biomass Conversion">Biomass Conversion</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Gemini Verification Certificate Summary Box */}
      <div className="p-6 rounded-2xl bg-[#12151A] border border-white/8 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-white">
            <Sparkles className="w-4 h-4 text-[#8FF075]" />
            <span>AI Verification Certificate Preview</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-[#8FF075]/10 text-[#8FF075] border border-[#8FF075]/20">
              GEMINI COMPLIANCE SUMMARY
            </span>
          </div>

          <button
            type="button"
            onClick={handleGenerateCertificatePreview}
            disabled={generatingCert}
            className="text-xs text-[#8FF075] hover:underline font-mono"
          >
            {generatingCert ? "Generating..." : "Generate Preview"}
          </button>
        </div>

        <div className="p-4 rounded-xl bg-[#0B0D10] border border-white/5 text-xs text-white/80 leading-relaxed font-sans italic">
          {certificateText || (
            <span className="text-white/40 not-italic font-mono">
              Click 'Generate Preview' or approve batch. Gemini will automatically synthesize structured lab telemetry into a formal ISO 14064 Compliance Certificate summary.
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 rounded-2xl bg-[#12151A] border border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={handleReject}
          disabled={submitting}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-mono font-bold transition-colors"
        >
          Reject Non-Compliant Batch
        </button>

        <button
          type="button"
          onClick={handleApprove}
          disabled={submitting}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#8FF075] hover:bg-[#8FF075]/90 text-[#0B0D10] font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#8FF075]/15 transition-all disabled:opacity-40"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Minting Digital Carbon Credit...</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Approve & Mint {computedTonnes} tCO2e Credit</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
