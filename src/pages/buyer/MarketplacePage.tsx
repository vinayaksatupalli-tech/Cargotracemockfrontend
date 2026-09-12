import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { CarbonCredit, CreditType } from "../../types";
import { ProvenanceTrailModal } from "../../components/ProvenanceTrailModal";
import {
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Filter,
  Loader2,
  FileCheck,
  Layers
} from "lucide-react";

interface MarketplacePageProps {
  onNavigate: (path: string) => void;
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [credits, setCredits] = useState<CarbonCredit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedCredit, setSelectedCredit] = useState<CarbonCredit | null>(null);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const list = await api.getCredits();
        setCredits(list);
      } catch (err) {
        console.warn("Failed to load credits:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const availableCredits = credits.filter(
    (c) => c.status === "available" && (filterType === "all" || c.creditType === filterType)
  );

  const handleBuy = async (credit: CarbonCredit) => {
    setBuyingId(credit.id);
    try {
      await api.buyCredit(credit.id);
      // Refresh or navigate to wallet
      onNavigate("/wallet");
    } catch (err: any) {
      alert(err.message || "Failed to purchase credit");
      setBuyingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-blue-500/15 text-blue-400 border border-blue-500/30 uppercase">
              CARBON REMOVAL MARKETPLACE
            </span>
            <span className="text-xs text-white/40 font-mono">
              ISO 14064 MRV Standardized Tokens
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-sans mt-1">
            Verified Waste-to-Carbon Credits
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Every credit links immutably to farm feedstock origin, thermal kiln energy telemetry, and independent auditor sign-off.
          </p>
        </div>

        <button
          onClick={() => onNavigate("/wallet")}
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-mono flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Lock className="w-4 h-4 text-[#8FF075]" />
          <span>My Carbon Portfolio & Retirement</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#12151A] border border-white/8 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white/40" />
          <span className="text-white/60">Standard:</span>
          {["all", "Carbon Removal", "Methane Abatement", "Biomass Conversion"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                filterType === type
                  ? "bg-[#8FF075] text-[#0B0D10] font-bold"
                  : "bg-[#161A20] text-white/60 hover:text-white"
              }`}
            >
              {type === "all" ? "All Standards" : type}
            </button>
          ))}
        </div>

        <span className="text-white/40">
          Showing <span className="text-[#8FF075] font-bold">{availableCredits.length}</span> verified units
        </span>
      </div>

      {/* Credits Grid */}
      {availableCredits.length === 0 ? (
        <div className="p-12 text-center text-white/40 text-xs font-mono rounded-2xl bg-[#12151A] border border-white/8">
          No available credits match this filter. Check the Auditor Desk to verify and mint new batches.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableCredits.map((c) => {
            const totalPrice = Math.round(c.tonnesCO2e * c.pricePerTonUsd);
            return (
              <div
                key={c.id}
                className="p-6 rounded-2xl bg-[#12151A] border border-white/8 hover:border-[#8FF075]/40 transition-all flex flex-col justify-between group shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] uppercase font-bold">
                      {c.creditType}
                    </span>
                    <span className="text-[#8FF075]">{c.serialNumber}</span>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl font-extrabold text-white font-mono">
                        {c.tonnesCO2e.toFixed(2)}
                      </span>
                      <span className="text-xs font-mono text-white/50 ml-1">tCO2e</span>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-bold text-white font-mono">${totalPrice}</span>
                      <span className="text-[10px] text-white/40 block font-mono">
                        ${c.pricePerTonUsd}/tonne
                      </span>
                    </div>
                  </div>

                  {/* Gemini Compliance Summary Paragraph */}
                  <div className="mt-4 p-3 rounded-xl bg-[#161A20] border border-white/5 text-[11px] text-white/70 leading-relaxed font-sans line-clamp-3">
                    {c.certificateSummary}
                  </div>

                  <div className="mt-4 space-y-1.5 text-[11px] font-mono border-t border-white/5 pt-3">
                    <div className="flex justify-between">
                      <span className="text-white/40">Feedstock:</span>
                      <span className="text-white capitalize">{c.wasteBatchSnapshot?.wasteType || "Agri Residue"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Facility:</span>
                      <span className="text-white truncate max-w-[170px]">{c.recyclerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Auditor:</span>
                      <span className="text-emerald-400 font-semibold">{c.checkerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Permanence:</span>
                      <span className="text-blue-400 font-bold">100+ Years (Biochar Sink)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/8 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCredit(c);
                      setModalOpen(true);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#161A20] hover:bg-white/10 text-white text-xs font-mono flex items-center justify-center gap-1 transition-colors"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-[#8FF075]" />
                    <span>Audit Trail</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBuy(c)}
                    disabled={buyingId === c.id}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#8FF075] hover:bg-[#8FF075]/90 text-[#0B0D10] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-[#8FF075]/10 font-sans disabled:opacity-40"
                  >
                    {buyingId === c.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ShoppingBag className="w-3.5 h-3.5" />
                    )}
                    <span>Purchase</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ProvenanceTrailModal
        credit={selectedCredit}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};
