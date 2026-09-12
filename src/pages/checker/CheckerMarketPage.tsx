import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { WasteBatch } from "../../types";
import { ProvenanceTrailModal } from "../../components/ProvenanceTrailModal";
import { ShieldCheck, ArrowRight, Loader2, Clock, CheckCircle2, AlertTriangle, FileCheck, Sparkles } from "lucide-react";

interface CheckerMarketPageProps {
  onNavigate: (path: string) => void;
}

export const CheckerMarketPage: React.FC<CheckerMarketPageProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [batches, setBatches] = useState<WasteBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<WasteBatch | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const list = await api.getBatches();
        setBatches(list);
      } catch (err) {
        console.warn("Failed to load auditor market batches:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const pendingBatches = batches.filter((b) => b.status === "pending_check");
  const recentlyVerified = batches.filter((b) => b.status === "verified" || b.status === "rejected");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-[#8FF075]/15 text-[#8FF075] border border-[#8FF075]/30 uppercase">
              INDEPENDENT AUDIT DESK
            </span>
            <span className="text-xs text-white/40 font-mono">
              {currentUser?.organizationName || "Apex Carbon Verification Services (ISO 14064)"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-sans mt-1">
            MRV Lab Verification & Credit Minting Queue
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Independent third-party verification of pyrolysis lab spectrometry data, safety compliance checklists, and ISO certification.
          </p>
        </div>
      </div>

      {/* 1. Pending Audit Queue */}
      <div className="rounded-2xl bg-[#12151A] border border-white/8 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#8FF075] animate-ping" />
            <h3 className="text-base font-bold text-white font-sans">
              Batches Awaiting Audit & Credit Mint
            </h3>
          </div>
          <span className="text-xs font-mono text-[#8FF075]">
            {pendingBatches.length} Batches in Queue
          </span>
        </div>

        {pendingBatches.length === 0 ? (
          <div className="py-12 text-center text-white/40 text-xs font-mono">
            No batches currently awaiting audit. Check back once recycling runs are submitted.
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingBatches.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-xl bg-[#161A20] border border-[#8FF075]/25 hover:border-[#8FF075] transition-all flex flex-col justify-between group shadow-lg shadow-black/40"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-white">{b.id}</span>
                    <span className="text-[#8FF075]">{b.trackingHash}</span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/50">Feedstock:</span>
                      <span className="text-white font-medium capitalize">{b.wasteType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Raw Mass:</span>
                      <span className="text-white font-mono">{b.weightKg.toLocaleString()} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Biochar Yield:</span>
                      <span className="text-[#8FF075] font-mono font-bold">
                        {b.processing?.outputAmount.toLocaleString()} kg
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Recycler Facility:</span>
                      <span className="text-white/90 truncate max-w-[170px]">
                        {b.recyclerName || "BioVeda Unit #4"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-white/40">Gemini Ingest Check:</span>
                    <span className="text-emerald-400 font-bold">
                      {(b.photoCheck.confidence * 100).toFixed(0)}% PASSED
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-white/5">
                  <button
                    onClick={() => onNavigate(`/checker/review/${b.id}`)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#8FF075] hover:bg-[#8FF075]/90 text-[#0B0D10] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md font-sans"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Audit Lab Data & Mint Credit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Recently Audited Batches */}
      <div className="rounded-2xl bg-[#12151A] border border-white/8 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/8">
          <div>
            <h3 className="text-base font-bold text-white font-sans">Recently Certified Batches</h3>
            <p className="text-xs text-white/50">Permanent ISO 14064 MRV audit records and certificates</p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/8 text-white/40 text-[11px] uppercase">
                <th className="py-3 px-3">Batch & Hash</th>
                <th className="py-3 px-3">Mass Diverted</th>
                <th className="py-3 px-3">Elemental Carbon</th>
                <th className="py-3 px-3">Auditor Verification</th>
                <th className="py-3 px-3 text-right">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {recentlyVerified.map((b) => (
                <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-3">
                    <span className="text-white font-semibold">{b.id}</span>
                    <div className="text-[11px] text-[#8FF075]">{b.trackingHash}</div>
                  </td>

                  <td className="py-3.5 px-3 font-semibold text-white">
                    {(b.weightKg / 1000).toFixed(2)} tonnes
                  </td>

                  <td className="py-3.5 px-3">
                    {b.checkResult ? (
                      <span className="text-[#8FF075] font-bold">
                        {b.checkResult.carbonContentPct}% C
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                        b.status === "verified"
                          ? "bg-[#8FF075]/15 text-[#8FF075] border-[#8FF075]/30"
                          : "bg-red-500/15 text-red-400 border-red-500/30"
                      }`}
                    >
                      {b.status === "verified" ? "ISO 14064 PASSED" : "REJECTED"}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedBatch(b);
                        setModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#161A20] hover:bg-white/10 text-white/80 text-xs font-sans inline-flex items-center gap-1"
                    >
                      <span>View Provenance</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ProvenanceTrailModal
        batch={selectedBatch}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};
