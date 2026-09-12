import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { WasteBatch } from "../../types";
import { ProvenanceTrailModal } from "../../components/ProvenanceTrailModal";
import { Flame, Plus, ArrowRight, MapPin, Sparkles, Clock, CheckCircle2, AlertTriangle, QrCode } from "lucide-react";

interface SupplierDashboardProps {
  onNavigate: (path: string) => void;
}

export const SupplierDashboard: React.FC<SupplierDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [batches, setBatches] = useState<WasteBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<WasteBatch | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const list = await api.getBatches({ role: "supplier", uid: currentUser?.uid });
        setBatches(list);
      } catch (err) {
        console.warn("Failed to load supplier batches:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentUser]);

  const totalDivertedTonnes = batches.reduce((acc, b) => acc + b.weightKg, 0) / 1000;
  const verifiedCount = batches.filter((b) => b.status === "verified").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase">
              SUPPLIER CONSOLE
            </span>
            <span className="text-xs text-white/40 font-mono">
              {currentUser?.organizationName || "GreenHarvest Agri Farms"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-sans mt-1">
            Feedstock & Waste Diversion Hub
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Log agricultural & food waste, run Gemini segregation checks, and monitor delivery to accredited recycling units.
          </p>
        </div>

        <button
          onClick={() => onNavigate("/supplier/new-waste")}
          className="px-5 py-2.5 rounded-xl bg-[#8FF075] hover:bg-[#8FF075]/90 text-[#0B0D10] font-semibold text-xs flex items-center gap-2 shadow-lg shadow-[#8FF075]/10 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Waste Batch</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#12151A] border border-white/8">
          <span className="text-xs font-mono text-white/50 uppercase">Total Diverted Mass</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">{totalDivertedTonnes.toFixed(2)}</span>
            <span className="text-xs font-mono text-amber-400">Tonnes</span>
          </div>
          <p className="text-[11px] text-white/40 mt-1">Across {batches.length} registered batches</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#12151A] border border-white/8">
          <span className="text-xs font-mono text-white/50 uppercase">Verified Offsets</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono text-[#8FF075]">{verifiedCount}</span>
            <span className="text-xs font-mono text-white/40">Batches Audited</span>
          </div>
          <p className="text-[11px] text-white/40 mt-1">Converted into high-permanence biochar</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#12151A] border border-white/8">
          <span className="text-xs font-mono text-white/50 uppercase">AI Pass Rate</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono text-emerald-400">97.8%</span>
            <span className="text-xs font-mono text-white/40">Gemini Purity</span>
          </div>
          <p className="text-[11px] text-white/40 mt-1">Zero toxic/non-biodegradable infractions</p>
        </div>
      </div>

      {/* Batches Table */}
      <div className="rounded-2xl bg-[#12151A] border border-white/8 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/8">
          <div>
            <h3 className="text-base font-bold text-white font-sans">Active & Past Batches</h3>
            <p className="text-xs text-white/50">Tracking custody from farm dispatch through ISO auditor sign-off</p>
          </div>
          <span className="text-xs font-mono text-[#8FF075]">{batches.length} Records</span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/8 text-white/40 text-[11px] uppercase">
                <th className="py-3 px-3">Batch & Hash</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Weight (kg)</th>
                <th className="py-3 px-3">Gemini Check</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {batches.map((b) => (
                <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-white">{b.id}</div>
                    <div className="text-[11px] text-[#8FF075]">{b.trackingHash}</div>
                  </td>
                  <td className="py-3.5 px-3 uppercase text-white/70">
                    {b.wasteType}
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-white">
                    {b.weightKg.toLocaleString()} kg
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        b.photoCheck.passed
                          ? "bg-[#8FF075]/15 text-[#8FF075] border border-[#8FF075]/30"
                          : "bg-red-500/15 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {b.photoCheck.passed ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      {(b.photoCheck.confidence * 100).toFixed(0)}% Pass
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-medium border ${
                        b.status === "verified"
                          ? "bg-[#8FF075]/15 text-[#8FF075] border-[#8FF075]/30"
                          : b.status === "rejected"
                          ? "bg-red-500/15 text-red-400 border-red-500/30"
                          : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                      }`}
                    >
                      {b.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onNavigate(`/supplier/delivery/${b.id}`)}
                        className="px-2.5 py-1 rounded-lg bg-[#161A20] hover:bg-white/10 text-white flex items-center gap-1 text-[11px] transition-colors"
                      >
                        <QrCode className="w-3 h-3 text-[#8FF075]" />
                        <span>Tracking</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedBatch(b);
                          setModalOpen(true);
                        }}
                        className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white"
                        title="View Provenance"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
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
