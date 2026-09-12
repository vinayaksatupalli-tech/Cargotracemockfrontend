import React, { useState } from "react";
import { useLiveData } from "../context/LiveDataContext";
import { useAuth } from "../context/AuthContext";
import { StatPanel } from "../components/StatPanel";
import { LiveLedger } from "../components/LiveLedger";
import { BatchLookupBar } from "../components/BatchLookupBar";
import { ProvenanceTrailModal } from "../components/ProvenanceTrailModal";
import { WasteBatch, CarbonCredit, LedgerEvent, UserRole } from "../types";
import { api } from "../lib/api";
import {
  Flame,
  Cpu,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  ExternalLink,
  Layers,
  FileCheck
} from "lucide-react";

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { stats, ledger } = useLiveData();
  const { switchRole } = useAuth();
  const [selectedBatch, setSelectedBatch] = useState<WasteBatch | null>(null);
  const [selectedCredit, setSelectedCredit] = useState<CarbonCredit | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSelectLedgerEvent = async (event: LedgerEvent) => {
    if (event.relatedBatchId) {
      try {
        const data = await api.getBatchByIdOrHash(event.relatedBatchId);
        setSelectedBatch(data.batch);
        setSelectedCredit(data.credit || null);
        setModalOpen(true);
      } catch (err) {
        console.warn("Could not load batch for event:", err);
      }
    }
  };

  const handleRoleQuickStart = async (role: UserRole, path: string) => {
    await switchRole(role);
    onNavigate(path);
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-10 text-center max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#12151A] border border-[#8FF075]/30 text-xs font-mono text-[#8FF075] mb-6 shadow-[0_0_20px_rgba(143,240,117,0.15)]">
          <span className="w-2 h-2 rounded-full bg-[#8FF075] animate-ping" />
          <span>AUDIT-READY MRV PROTOCOL & VALUE CHAIN</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-sans leading-tight">
          Transforming Organic Waste into{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8FF075] via-[#B6FF6E] to-[#3B82F6]">
            Verified Carbon Value
          </span>
        </h1>

        <p className="mt-5 text-sm sm:text-base text-white/60 max-w-2xl mx-auto leading-relaxed">
          From farm residue and urban food waste to high-temperature biochar and clean biogas.
          Verified by independent ISO 14064 auditors, backed by Gemini multimodal AI, and permanently retired on-chain.
        </p>

        {/* Floating Batch Lookup Bar */}
        <div className="mt-8">
          <BatchLookupBar />
        </div>

        {/* Quick Launch Action Cards */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
          <button
            onClick={() => handleRoleQuickStart("supplier", "/supplier/new-waste")}
            className="p-4 rounded-xl bg-[#12151A] hover:bg-[#161A20] border border-amber-500/20 hover:border-amber-500/50 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 mb-2">
              <Flame className="w-4 h-4" />
            </div>
            <div className="text-xs font-semibold text-white group-hover:text-amber-300">1. Log Waste</div>
            <div className="text-[11px] text-white/40 mt-0.5">Farms & Municipalities</div>
          </button>

          <button
            onClick={() => handleRoleQuickStart("recycler", "/recycler/dashboard")}
            className="p-4 rounded-xl bg-[#12151A] hover:bg-[#161A20] border border-cyan-500/20 hover:border-cyan-500/50 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-2">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="text-xs font-semibold text-white group-hover:text-cyan-300">2. Pyrolysis Run</div>
            <div className="text-[11px] text-white/40 mt-0.5">Biochar & Biogas Units</div>
          </button>

          <button
            onClick={() => handleRoleQuickStart("checker", "/market")}
            className="p-4 rounded-xl bg-[#12151A] hover:bg-[#161A20] border border-[#8FF075]/20 hover:border-[#8FF075]/50 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#8FF075]/10 flex items-center justify-center text-[#8FF075] mb-2">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xs font-semibold text-white group-hover:text-[#8FF075]">3. Audit & Mint</div>
            <div className="text-[11px] text-white/40 mt-0.5">ISO 14064 Checkers</div>
          </button>

          <button
            onClick={() => handleRoleQuickStart("buyer", "/wallet")}
            className="p-4 rounded-xl bg-[#12151A] hover:bg-[#161A20] border border-blue-500/20 hover:border-blue-500/50 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-2">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="text-xs font-semibold text-white group-hover:text-blue-300">4. Buy & Retire</div>
            <div className="text-[11px] text-white/40 mt-0.5">Corporate Net-Zero</div>
          </button>
        </div>
      </section>

      {/* Real Aggregate Stats Panels */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <StatPanel stats={stats} />
      </section>

      {/* Live Transaction Ledger Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LiveLedger events={ledger} onSelectEvent={handleSelectLedgerEvent} maxItems={12} />
      </section>

      {/* Protocol Architecture: 4-Party Coordination */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-[#12151A] border border-white/8 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/8">
            <div>
              <span className="text-xs font-mono text-[#8FF075] uppercase">
                Zero Double-Counting Architecture
              </span>
              <h3 className="text-xl font-bold text-white font-sans mt-1">
                How CarboTrace Governs the Full Lifecycle
              </h3>
            </div>
            <button
              onClick={() => onNavigate("/methodology")}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-white flex items-center gap-1.5 transition-colors"
            >
              <span>Audit Methodology</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#8FF075]" />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-4 rounded-xl bg-[#161A20] border border-white/5">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold">
                <Flame className="w-4 h-4" />
                <span>1. INPUT VERIFICATION</span>
              </div>
              <p className="mt-2 text-xs text-white/70 leading-relaxed">
                Suppliers upload overhead bin imagery. Gemini multimodal vision validates segregation quality and rejects non-organic contaminants prior to transport.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#161A20] border border-white/5">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold">
                <Cpu className="w-4 h-4" />
                <span>2. THERMAL RUN & LOGS</span>
              </div>
              <p className="mt-2 text-xs text-white/70 leading-relaxed">
                Pyrolysis facilities log parasitic electricity, kiln temperatures (550°C+), and net biochar output, proving high carbon sequestration durability.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#161A20] border border-white/5">
              <div className="flex items-center gap-2 text-[#8FF075] text-xs font-mono font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>3. INDEPENDENT AUDIT</span>
              </div>
              <p className="mt-2 text-xs text-white/70 leading-relaxed">
                Accredited Checkers verify moisture and elemental carbon spectrometry, and Gemini generates a standardized ISO 14064 Compliance Certificate.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#161A20] border border-white/5">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-mono font-bold">
                <Lock className="w-4 h-4" />
                <span>4. ON-CHAIN RETIREMENT</span>
              </div>
              <p className="mt-2 text-xs text-white/70 leading-relaxed">
                Buyers purchase credits and execute permanent retirement. Tokens are immutably locked with non-fungible beneficiary certificates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Provenance Modal when clicking ledger event */}
      <ProvenanceTrailModal
        batch={selectedBatch}
        credit={selectedCredit}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};
