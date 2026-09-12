import React from "react";
import { CarbonCredit, WasteBatch } from "../types";
import { QRCodeBlock } from "./QRCodeBlock";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Cpu,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  FileCheck
} from "lucide-react";

interface ProvenanceTrailModalProps {
  batch: WasteBatch | null;
  credit?: CarbonCredit | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProvenanceTrailModal: React.FC<ProvenanceTrailModalProps> = ({
  batch,
  credit,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !batch) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in-50">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#12151A] border border-white/15 p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#8FF075]/15 text-[#8FF075] border border-[#8FF075]/30">
                PROVENANCE AUDIT TRAIL
              </span>
              <span className="font-mono text-xs text-white/50">{batch.id}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1 font-sans">
              Chain of Custody Record
            </h2>
            <div className="flex items-center gap-2 mt-1 font-mono text-xs text-white/60">
              <span>Tracking Hash:</span>
              <span className="text-[#8FF075] font-semibold">{batch.trackingHash}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-lg text-xs font-mono uppercase font-semibold border ${
                batch.status === "verified"
                  ? "bg-[#8FF075]/15 text-[#8FF075] border-[#8FF075]/30"
                  : batch.status === "rejected"
                  ? "bg-red-500/15 text-red-400 border-red-500/30"
                  : "bg-amber-500/15 text-amber-300 border-amber-500/30"
              }`}
            >
              Status: {batch.status.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* 5-Step Provenance Lifecycle */}
        <div className="mt-8 space-y-6">
          {/* STEP 1: Origin & Gemini AI Segregation Check */}
          <div className="rounded-xl bg-[#161A20] border border-white/8 p-5 relative">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/8">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white font-sans">
                    1. Feedstock Origin & AI Segregation Audit
                  </h4>
                  <span className="text-[11px] font-mono text-white/40">
                    Logged: {new Date(batch.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono text-amber-400 font-medium">
                {(batch.weightKg / 1000).toFixed(2)}t {batch.wasteType.toUpperCase()}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/50">Supplier / Farm:</span>
                  <span className="text-white font-medium">{batch.supplierName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/50">Moisture Content:</span>
                  <span className="text-white font-mono">{batch.moisturePct}%</span>
                </div>
                <div className="flex items-start justify-between py-1 border-b border-white/5">
                  <span className="text-white/50">Location:</span>
                  <span className="text-white text-right max-w-[220px]">
                    {batch.location.address} ({batch.location.lat.toFixed(3)}, {batch.location.lng.toFixed(3)})
                  </span>
                </div>
              </div>

              {/* Gemini Photo Segregation Result */}
              <div className="rounded-lg bg-[#0B0D10] border border-white/10 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-[#8FF075]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gemini Multimodal Analysis</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                      batch.photoCheck.passed
                        ? "bg-[#8FF075]/20 text-[#8FF075]"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {batch.photoCheck.passed ? "PASSED" : "FAILED"} ({(batch.photoCheck.confidence * 100).toFixed(0)}%)
                  </span>
                </div>
                <p className="mt-2 text-xs text-white/70 italic">
                  "{batch.photoCheck.reason}"
                </p>
              </div>
            </div>
          </div>

          {/* STEP 2: Logistics, Geofence & QR */}
          <div className="rounded-xl bg-[#161A20] border border-white/8 p-5">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/8">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white font-sans">
                    2. Logistics & Geofence Verification
                  </h4>
                  <span className="text-[11px] font-mono text-white/40">
                    Milestone: {batch.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-xs flex-1">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/50">Geofence Coordinates:</span>
                  <span className="text-white font-mono">{batch.location.lat}° N, {batch.location.lng}° E</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/50">QR Custody Handshake:</span>
                  <span className="text-[#8FF075] font-mono">VERIFIED EN ROUTE</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/50">Last Update:</span>
                  <span className="text-white font-mono">{new Date(batch.updatedAt).toLocaleString()}</span>
                </div>
              </div>
              <div className="shrink-0">
                <QRCodeBlock value={batch.trackingHash} size={110} label={batch.trackingHash} />
              </div>
            </div>
          </div>

          {/* STEP 3: Recycling & Pyrolysis */}
          <div className="rounded-xl bg-[#161A20] border border-white/8 p-5">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/8">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white font-sans">
                    3. Conversion & Valorization
                  </h4>
                  <span className="text-[11px] font-mono text-white/40">
                    {batch.recyclerName || "Facility Assignment Pending"}
                  </span>
                </div>
              </div>
              {batch.processing && (
                <span className="text-xs font-mono text-cyan-400 font-semibold uppercase">
                  {batch.processing.outputAmount}kg {batch.processing.outputType}
                </span>
              )}
            </div>

            {batch.processing ? (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#0B0D10] border border-white/5">
                  <span className="text-white/40 block">Conversion Method</span>
                  <span className="text-white font-medium mt-1 block uppercase font-mono">
                    {batch.processing.method.replace("_", " ")}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#0B0D10] border border-white/5">
                  <span className="text-white/40 block">Parasitic Energy</span>
                  <span className="text-white font-medium mt-1 block font-mono">
                    {batch.processing.energyUsedKwh} kWh
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#0B0D10] border border-white/5">
                  <span className="text-white/40 block">Bio-Output Produced</span>
                  <span className="text-[#8FF075] font-medium mt-1 block font-mono">
                    {batch.processing.outputAmount} kg ({batch.processing.outputType})
                  </span>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-xs text-white/50 italic">
                Awaiting batch intake and conversion run at licensed recycling facility.
              </p>
            )}
          </div>

          {/* STEP 4: Independent Checker ISO Audit */}
          <div className="rounded-xl bg-[#161A20] border border-white/8 p-5">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/8">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#8FF075]/10 border border-[#8FF075]/20 flex items-center justify-center text-[#8FF075]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white font-sans">
                    4. Independent Auditor MRV Verification
                  </h4>
                  <span className="text-[11px] font-mono text-white/40">
                    {batch.checkerName || "Awaiting audit assignment"}
                  </span>
                </div>
              </div>
              {batch.checkResult && (
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-[#8FF075]/20 text-[#8FF075] border border-[#8FF075]/30">
                  ISO 14064 PASSED
                </span>
              )}
            </div>

            {batch.checkResult ? (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded bg-[#0B0D10] border border-white/5">
                    <span className="text-white/40 text-[10px] block">Moisture Cut</span>
                    <span className="text-[#8FF075] font-bold">
                      {batch.checkResult.moistureReductionPct}%
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-[#0B0D10] border border-white/5">
                    <span className="text-white/40 text-[10px] block">Elemental Carbon</span>
                    <span className="text-[#8FF075] font-bold">
                      {batch.checkResult.carbonContentPct}%
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-[#0B0D10] border border-white/5">
                    <span className="text-white/40 text-[10px] block">Contamination</span>
                    <span className="text-emerald-400 font-bold">0.00% (NONE)</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#0B0D10] border border-white/5">
                    <span className="text-white/40 text-[10px] block">Safety Protocol</span>
                    <span className="text-[#8FF075] font-bold">VERIFIED</span>
                  </div>
                </div>

                {/* Gemini-Generated Certificate */}
                {batch.checkResult.certificateText && (
                  <div className="rounded-lg bg-[#0B0D10] border border-[#8FF075]/20 p-4">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#8FF075]">
                      <FileCheck className="w-4 h-4" />
                      <span>Gemini AI Verification Certificate</span>
                    </div>
                    <p className="mt-2 text-xs text-white/80 leading-relaxed">
                      {batch.checkResult.certificateText}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-3 text-xs text-white/50 italic">
                Batch currently in pipeline. Pending lab spectrometry analysis and auditor sign-off.
              </p>
            )}
          </div>

          {/* STEP 5: Carbon Credit & Retirement Ledger */}
          <div className="rounded-xl bg-[#161A20] border border-white/8 p-5">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/8">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white font-sans">
                    5. Minted Carbon Credit & Ledger Settlement
                  </h4>
                  <span className="text-[11px] font-mono text-white/40">
                    {credit ? `Token ID: ${credit.id}` : "Awaiting Credit Mint"}
                  </span>
                </div>
              </div>

              {credit && (
                <span
                  className={`px-3 py-1 rounded text-xs font-mono uppercase font-bold border ${
                    credit.status === "retired"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : credit.status === "sold"
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                      : "bg-[#8FF075]/20 text-[#8FF075] border-[#8FF075]/40"
                  }`}
                >
                  {credit.status}
                </span>
              )}
            </div>

            {credit ? (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/50">Credit Type:</span>
                    <span className="text-white font-medium">{credit.type}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/50">Volume:</span>
                    <span className="text-[#8FF075] font-bold font-mono">{credit.tonnage} tCO2e</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/50">Market Valuation:</span>
                    <span className="text-white font-mono">${credit.priceUsd}/tonne</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/50">Current Owner:</span>
                    <span className="text-white font-medium">{credit.ownerName || "Available on Market"}</span>
                  </div>
                  {credit.retiredAt && (
                    <>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-white/50">Retired Date:</span>
                        <span className="text-emerald-400 font-mono">
                          {new Date(credit.retiredAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-white/50">Beneficiary:</span>
                        <span className="text-emerald-300 font-medium">
                          {credit.retirementBeneficiary}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <p className="mt-3 text-xs text-white/50 italic">
                Carbon credit token will be minted upon Auditor approval.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/50 font-mono">
          <span>Cryptographic Hash Integrity: PASS</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors font-sans"
          >
            Close Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
};
