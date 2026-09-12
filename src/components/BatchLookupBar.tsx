import React, { useState } from "react";
import { Search, Loader2, Sparkles, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { api } from "../lib/api";
import { CarbonCredit, WasteBatch } from "../types";
import { ProvenanceTrailModal } from "./ProvenanceTrailModal";

export const BatchLookupBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<WasteBatch | null>(null);
  const [selectedCredit, setSelectedCredit] = useState<CarbonCredit | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const sampleChips = [
    { label: "Batch #4521 (Agri Biochar)", id: "batch_4521" },
    { label: "Batch #4522 (Biogas)", id: "batch_4522" },
    { label: "Batch #4523 (Pending Audit)", id: "batch_4523" },
    { label: "Hash: 0xCT-4521-E9B0", id: "0xCT-4521-E9B0" },
  ];

  const handleSearch = async (termToLookup?: string) => {
    const term = (termToLookup || searchTerm).trim();
    if (!term) return;

    setLoading(true);
    setError(null);

    try {
      const data = await api.getBatchByIdOrHash(term);
      setSelectedBatch(data.batch);
      setSelectedCredit(data.credit || null);
      setModalOpen(true);
    } catch (err: any) {
      setError(err.message || `No batch found matching '${term}'`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="relative flex items-center shadow-[0_0_30px_rgba(0,0,0,0.5)] rounded-2xl bg-[#12151A] border border-white/15 focus-within:border-[#8FF075] transition-all"
      >
        <div className="pl-4 text-[#8FF075]">
          <Search className="w-5 h-5" />
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Enter any Batch ID or Tracking Hash to inspect source → (e.g. batch_4521 or 0xCT-4521-E9B0)"
          className="w-full py-4 pl-3 pr-28 bg-transparent text-sm text-white placeholder-white/40 focus:outline-none font-mono"
        />

        <div className="absolute right-2 flex items-center">
          <button
            type="submit"
            disabled={loading || !searchTerm.trim()}
            className="px-4 py-2 rounded-xl bg-[#8FF075] hover:bg-[#8FF075]/90 text-[#0B0D10] font-semibold text-xs transition-all disabled:opacity-40 flex items-center gap-1.5 shadow-sm"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <span>Inspect</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div className="mt-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Click Sample Chips */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-white/40 font-mono text-[11px]">Quick inspect:</span>
        {sampleChips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => {
              setSearchTerm(chip.id);
              handleSearch(chip.id);
            }}
            className="px-2.5 py-1 rounded-lg bg-[#161A20] hover:bg-white/10 border border-white/8 text-white/70 hover:text-white font-mono text-[11px] transition-colors"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Provenance Modal */}
      <ProvenanceTrailModal
        batch={selectedBatch}
        credit={selectedCredit}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};
