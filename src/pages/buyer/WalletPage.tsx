import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { CarbonCredit } from "../../types";
import { ProvenanceTrailModal } from "../../components/ProvenanceTrailModal";
import {
  Lock,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Printer,
  FileCheck,
  ExternalLink,
  Award,
  Loader2,
  Calendar,
  Building
} from "lucide-react";

interface WalletPageProps {
  onNavigate: (path: string) => void;
}

export const WalletPage: React.FC<WalletPageProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [credits, setCredits] = useState<CarbonCredit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"owned" | "retired">("owned");

  // Retiring state
  const [retiringCredit, setRetiringCredit] = useState<CarbonCredit | null>(null);
  const [beneficiaryName, setBeneficiaryName] = useState("Nordic Tech Ventures - Scope 3 Offset");
  const [retiringLoading, setRetiringLoading] = useState(false);

  // Certificate Modal state
  const [viewCertCredit, setViewCertCredit] = useState<CarbonCredit | null>(null);
  const [auditModalCredit, setAuditModalCredit] = useState<CarbonCredit | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const list = await api.getCredits();
        setCredits(list);
      } catch (err) {
        console.warn("Failed to load credits for wallet:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const ownedCredits = credits.filter(
    (c) => c.status === "transferred" && (c.buyerId === currentUser?.uid || !c.buyerId)
  );
  const retiredCredits = credits.filter((c) => c.status === "retired");

  const totalRetiredTonnes = retiredCredits.reduce((acc, c) => acc + c.tonnesCO2e, 0);

  const handleExecuteRetirement = async () => {
    if (!retiringCredit) return;
    setRetiringLoading(true);
    try {
      const res = await api.retireCredit(
        retiringCredit.id,
        beneficiaryName.trim() || "Corporate Net-Zero Commitment"
      );
      setCredits((prev) => prev.map((c) => (c.id === retiringCredit.id ? res.credit : c)));
      setRetiringCredit(null);
      setViewCertCredit(res.credit);
    } catch (err: any) {
      alert(err.message || "Failed to retire credit");
    } finally {
      setRetiringLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-blue-500/15 text-blue-400 border border-blue-500/30 uppercase">
              CARBON CUSTODY & RETIREMENT WALLET
            </span>
            <span className="text-xs text-white/40 font-mono">
              {currentUser?.organizationName || "Nordic Tech ESG Ventures"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-sans mt-1">
            Corporate Carbon Balance & Retrospective
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Permanently retire digital carbon tokens to fulfill ESG disclosures with unalterable cryptographic proofs.
          </p>
        </div>

        <button
          onClick={() => onNavigate("/marketplace")}
          className="px-5 py-2.5 rounded-xl bg-[#8FF075] hover:bg-[#8FF075]/90 text-[#0B0D10] font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#8FF075]/15 transition-all self-start sm:self-auto"
        >
          <span>Browse Available Credits</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Summary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#12151A] border border-white/8">
          <span className="text-xs font-mono text-white/50 uppercase">Active Holdings</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">
              {ownedCredits.reduce((acc, c) => acc + c.tonnesCO2e, 0).toFixed(2)}
            </span>
            <span className="text-xs font-mono text-cyan-400">tCO2e Pending</span>
          </div>
          <p className="text-[11px] text-white/40 mt-1">Eligible for transfer or permanent retirement</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#12151A] border border-white/8">
          <span className="text-xs font-mono text-white/50 uppercase">Permanently Retired</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono text-[#8FF075]">
              {totalRetiredTonnes.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-[#8FF075]">tCO2e Burned</span>
          </div>
          <p className="text-[11px] text-white/40 mt-1">Zero double-counting on-chain registry lock</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#12151A] border border-white/8">
          <span className="text-xs font-mono text-white/50 uppercase">Audit Standard</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono text-blue-400">ISO 14064</span>
            <span className="text-xs font-mono text-white/40">MRV Compliant</span>
          </div>
          <p className="text-[11px] text-white/40 mt-1">100-Year Permanent Mineralized Biochar Sinks</p>
        </div>
      </div>

      {/* Tab Controls */}
      <div className="flex gap-2 p-1 rounded-xl bg-[#12151A] border border-white/8 w-fit text-xs font-mono">
        <button
          onClick={() => setActiveTab("owned")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === "owned"
              ? "bg-blue-500 text-white font-bold"
              : "text-white/60 hover:text-white"
          }`}
        >
          Active Holdings ({ownedCredits.length})
        </button>
        <button
          onClick={() => setActiveTab("retired")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === "retired"
              ? "bg-[#8FF075] text-[#0B0D10] font-bold"
              : "text-white/60 hover:text-white"
          }`}
        >
          Permanently Retired ({retiredCredits.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "owned" ? (
        <div className="space-y-4">
          {ownedCredits.length === 0 ? (
            <div className="p-12 text-center text-white/40 text-xs font-mono rounded-2xl bg-[#12151A] border border-white/8">
              No active purchased credits in your balance. Visit the Marketplace to purchase verified carbon units.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ownedCredits.map((c) => (
                <div
                  key={c.id}
                  className="p-6 rounded-2xl bg-[#12151A] border border-white/8 hover:border-blue-500/40 transition-all flex flex-col justify-between shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#8FF075] font-bold">{c.serialNumber}</span>
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] uppercase">
                        Active Custody
                      </span>
                    </div>

                    <div className="mt-3 flex items-baseline justify-between">
                      <div className="text-3xl font-extrabold font-mono text-white">
                        {c.tonnesCO2e.toFixed(2)}{" "}
                        <span className="text-xs font-mono text-white/50">tCO2e</span>
                      </div>
                      <span className="text-xs font-mono text-white/40">
                        ${c.pricePerTonUsd}/t
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-white/70 leading-relaxed font-sans line-clamp-2">
                      {c.certificateSummary}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/8 flex items-center justify-between gap-3">
                    <button
                      onClick={() => {
                        setAuditModalCredit(c);
                      }}
                      className="text-xs font-mono text-white/50 hover:text-white flex items-center gap-1"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Audit Trail</span>
                    </button>

                    <button
                      onClick={() => setRetiringCredit(c)}
                      className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#8FF075] to-emerald-400 hover:opacity-90 text-[#0B0D10] font-bold text-xs font-sans flex items-center gap-1.5 shadow-md"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Retire Permanently</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Retired Credits Grid */
        <div className="space-y-4">
          {retiredCredits.length === 0 ? (
            <div className="p-12 text-center text-white/40 text-xs font-mono rounded-2xl bg-[#12151A] border border-white/8">
              No retired credits yet. Execute a permanent retirement on any owned credit to lock in your ESG offset.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {retiredCredits.map((c) => (
                <div
                  key={c.id}
                  className="p-6 rounded-2xl bg-[#12151A] border border-[#8FF075]/30 flex flex-col justify-between shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#8FF075] font-bold">{c.serialNumber}</span>
                      <span className="px-2 py-0.5 rounded bg-[#8FF075]/15 text-[#8FF075] border border-[#8FF075]/30 text-[10px] uppercase font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Permanently Retired
                      </span>
                    </div>

                    <div className="mt-3 text-3xl font-extrabold font-mono text-white">
                      {c.tonnesCO2e.toFixed(2)}{" "}
                      <span className="text-xs font-mono text-[#8FF075]">tCO2e</span>
                    </div>

                    <div className="mt-3 p-3 rounded-xl bg-[#161A20] border border-white/5 space-y-1 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-white/40">Beneficiary:</span>
                        <span className="text-white font-bold">{c.beneficiary}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">Retirement Hash:</span>
                        <span className="text-[#8FF075] truncate max-w-[200px]">
                          {c.retirementHash}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/8 flex items-center justify-between">
                    <button
                      onClick={() => setAuditModalCredit(c)}
                      className="text-xs font-mono text-white/50 hover:text-white flex items-center gap-1"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>View Provenance</span>
                    </button>

                    <button
                      onClick={() => setViewCertCredit(c)}
                      className="py-2 px-4 rounded-xl bg-[#161A20] hover:bg-white/10 text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors font-sans"
                    >
                      <Award className="w-4 h-4 text-[#8FF075]" />
                      <span>View Certificate</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Retiring Modal Prompt */}
      {retiringCredit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#12151A] border border-white/15 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-[#8FF075] uppercase">
              <Lock className="w-4 h-4" />
              <span>IRREVERSIBLE ON-CHAIN RETIREMENT</span>
            </div>
            <h3 className="text-lg font-bold text-white font-sans">
              Retire {retiringCredit.tonnesCO2e.toFixed(2)} tCO2e Permanently
            </h3>
            <p className="text-xs text-white/60 leading-relaxed font-sans">
              Retirement locks this credit token permanently. It can never be resold or re-allocated, establishing zero double-counting proof for corporate scope 1-3 audit.
            </p>

            <div>
              <label className="block text-xs font-mono text-white/70 mb-1">
                Designated Beneficiary Organization or Claim
              </label>
              <input
                type="text"
                value={beneficiaryName}
                onChange={(e) => setBeneficiaryName(e.target.value)}
                placeholder="e.g. Acme Corp Scope 3 Net-Zero FY2026"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#161A20] border border-white/10 text-white text-xs focus:outline-none focus:border-[#8FF075]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/8">
              <button
                type="button"
                onClick={() => setRetiringCredit(null)}
                className="px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:text-white text-xs font-sans"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteRetirement}
                disabled={retiringLoading}
                className="px-5 py-2.5 rounded-xl bg-[#8FF075] hover:bg-[#8FF075]/90 text-[#0B0D10] font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-[#8FF075]/15 font-sans disabled:opacity-40"
              >
                {retiringLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                <span>Execute Permanent Retirement</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Certificate of Retirement View Modal */}
      {viewCertCredit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#0F1217] border-2 border-[#8FF075]/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-white font-sans">
            {/* Elegant watermark */}
            <div className="absolute -right-16 -bottom-16 opacity-5 pointer-events-none text-[#8FF075]">
              <Award className="w-96 h-96" />
            </div>

            {/* Certificate Header */}
            <div className="text-center pb-6 border-b border-white/10 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8FF075]/10 border border-[#8FF075]/30 text-xs font-mono text-[#8FF075] mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>CARBOTRACE MRV PROTOCOL & REGISTRY</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
                Certificate of Carbon Retirement
              </h2>
              <p className="text-xs font-mono text-white/50 mt-1">
                Zero Double-Counting Proof • Serial #{viewCertCredit.serialNumber}
              </p>
            </div>

            {/* Certificate Body */}
            <div className="py-6 space-y-4 text-center relative z-10">
              <p className="text-xs text-white/60 uppercase tracking-widest font-mono">
                This certifies that
              </p>
              <div className="text-4xl font-extrabold text-[#8FF075] font-mono">
                {viewCertCredit.tonnesCO2e.toFixed(2)} METRIC TONNES CO2e
              </div>
              <p className="text-xs text-white/60">
                have been permanently sequestered and retired on behalf of:
              </p>
              <div className="text-xl font-bold text-white underline decoration-[#8FF075] decoration-2 underline-offset-4">
                {viewCertCredit.beneficiary || "Corporate Net-Zero Participant"}
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-[#161A20]/80 border border-white/5 text-xs text-white/70 text-left leading-relaxed">
                {viewCertCredit.certificateSummary}
              </div>

              {/* Cryptographic Hashes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left text-[10px] font-mono pt-2">
                <div className="p-2.5 rounded-xl bg-[#12151A] border border-white/5">
                  <span className="text-white/40 block">Retirement Hash</span>
                  <span className="text-[#8FF075] break-all">{viewCertCredit.retirementHash}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#12151A] border border-white/5">
                  <span className="text-white/40 block">Audit Date</span>
                  <span className="text-white">
                    {viewCertCredit.retiredAt ? new Date(viewCertCredit.retiredAt).toUTCString() : "March 2026"}
                  </span>
                </div>
              </div>
            </div>

            {/* Certificate Footer */}
            <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono relative z-10">
              <div className="flex items-center gap-2 text-white/50">
                <CheckCircle2 className="w-4 h-4 text-[#8FF075]" />
                <span>Auditor: {viewCertCredit.checkerName}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Certificate</span>
                </button>
                <button
                  onClick={() => setViewCertCredit(null)}
                  className="px-4 py-1.5 rounded-xl bg-[#8FF075] text-[#0B0D10] font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Provenance Trail Modal */}
      <ProvenanceTrailModal
        credit={auditModalCredit}
        isOpen={!!auditModalCredit}
        onClose={() => setAuditModalCredit(null)}
      />
    </div>
  );
};
