import React, { useState, useEffect } from "react";
import { api } from "../lib/api";
import { WasteBatch, CarbonCredit } from "../types";
import { ProvenanceTrailModal } from "../components/ProvenanceTrailModal";
import { BatchLookupBar } from "../components/BatchLookupBar";
import { Search, ShieldCheck, ArrowRight, ExternalLink, Hash, CheckCircle2 } from "lucide-react";

export const ProvenancePage: React.FC = () => {
  const [batches, setBatches] = useState<WasteBatch[]>([]);
  const [credits, setCredits] = useState<CarbonCredit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<WasteBatch | null>(null);
  const [selectedCredit, setSelectedCredit] = useState<CarbonCredit | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [bList, cList] = await Promise.all([api.getBatches(), api.getCredits()]);
        setBatches(bList);
        setCredits(cList);
      } catch (err) {
        console.warn("Failed to load provenance records:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const openBatchModal = (b: WasteBatch) => {
    const linkedCredit = credits.find((c) => c.batchId === b.id) || null;
    setSelectedBatch(b);
    setSelectedCredit(linkedCredit);
    setModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#12151A] border border-[#8FF075]/30 text-xs font-mono text-[#8FF075]">
          <Hash className="w-3.5 h-3.5" />
          <span>PUBLIC PROVENANCE & AUDIT TRAIL EXPLORER</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-sans">
          Immutable Chain of Custody
        </h1>
        <p className="text-xs sm:text-sm text-white/50">
          Enter any Batch ID, Cryptographic Tracking Hash, or Carbon Serial Number to reconstruct the complete provenance trail.
        </p>

        <div className="pt-4 max-w-2xl mx-auto">
          <BatchLookupBar />
        </div>
      </div>

      {/* Batches Explorer Table */}
      <div className="rounded-2xl bg-[#12151A] border border-white/8 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/8">
          <div>
            <h3 className="text-base font-bold text-white font-sans">All Registry Batches</h3>
            <p className="text-xs text-white/50">Real-time state across every stage of value transformation</p>
          </div>
          <span className="text-xs font-mono text-[#8FF075]">{batches.length} Tracked Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/8 text-white/40 text-[11px] uppercase">
                <th className="py-3 px-3">Batch & Hash</th>
                <th className="py-3 px-3">Feedstock Origin</th>
                <th className="py-3 px-3">Mass Diverted</th>
                <th className="py-3 px-3">Gemini Vision</th>
                <th className="py-3 px-3">Pyrolysis Unit</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Audit Trail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {batches.map((b) => (
                <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3">
                    <span className="text-white font-semibold">{b.id}</span>
                    <div className="text-[11px] text-[#8FF075]">{b.trackingHash}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-white capitalize">{b.wasteType}</div>
                    <div className="text-[11px] text-white/50 truncate max-w-[150px]">
                      {b.location.address}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-white">
                    {b.weightKg.toLocaleString()} kg
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-emerald-400 font-bold text-[11px]">
                      {(b.photoCheck.confidence * 100).toFixed(0)}% Passed
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {b.recyclerName ? (
                      <span className="text-white/90 truncate max-w-[140px] block">
                        {b.recyclerName}
                      </span>
                    ) : (
                      <span className="text-white/30 italic">In transit / Unclaimed</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                        b.status === "verified"
                          ? "bg-[#8FF075]/15 text-[#8FF075] border-[#8FF075]/30"
                          : "bg-blue-500/15 text-blue-400 border-blue-500/30"
                      }`}
                    >
                      {b.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => openBatchModal(b)}
                      className="px-2.5 py-1 rounded-lg bg-[#161A20] hover:bg-white/10 text-white font-sans inline-flex items-center gap-1 text-xs transition-colors"
                    >
                      <span>Trail</span>
                      <ArrowRight className="w-3 h-3 text-[#8FF075]" />
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
        credit={selectedCredit}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};
