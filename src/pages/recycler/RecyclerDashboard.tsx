import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { WasteBatch } from "../../types";
import { ProvenanceTrailModal } from "../../components/ProvenanceTrailModal";
import { Cpu, Flame, ArrowRight, Loader2, CheckCircle2, ShieldCheck, Clock, Zap } from "lucide-react";

interface RecyclerDashboardProps {
  onNavigate: (path: string) => void;
}

export const RecyclerDashboard: React.FC<RecyclerDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [batches, setBatches] = useState<WasteBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<WasteBatch | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const list = await api.getBatches({ role: "recycler", uid: currentUser?.uid });
        setBatches(list);
      } catch (err) {
        console.warn("Failed to load recycler batches:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentUser]);

  const unclaimedBatches = batches.filter((b) => b.status === "delivered");
  const myFacilityBatches = batches.filter((b) => b.recyclerId === currentUser?.uid || b.status !== "delivered");

  const handleClaim = async (batchId: string) => {
    setClaimingId(batchId);
    try {
      const res = await api.claimBatch(batchId);
      setBatches((prev) => prev.map((b) => (b.id === batchId ? res.batch : b)));
      onNavigate(`/recycler/process/${batchId}`);
    } catch (err: any) {
      alert(err.message || "Failed to claim batch");
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 uppercase">
              RECYCLING & CONVERSION UNIT
            </span>
            <span className="text-xs text-white/40 font-mono">
              {currentUser?.organizationName || "BioVeda Pyrolysis & Biogas Unit #4"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-sans mt-1">
            Biochar Kiln & Pyrolysis Operations
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Claim verified delivered feedstock, execute controlled thermal conversion runs, and submit product logs for independent lab certification.
          </p>
        </div>
      </div>

      {/* 1. Unclaimed Feedstock Queue */}
      <div className="rounded-2xl bg-[#12151A] border border-white/8 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-base font-bold text-white font-sans">
              Unclaimed Incoming Deliveries
            </h3>
          </div>
          <span className="text-xs font-mono text-cyan-400">
            {unclaimedBatches.length} Batches Ready for Intake
          </span>
        </div>

        {unclaimedBatches.length === 0 ? (
          <div className="py-8 text-center text-white/40 text-xs font-mono">
            No unclaimed deliveries at gate. All dispatched batches currently assigned.
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {unclaimedBatches.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-xl bg-[#161A20] border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-white">{b.id}</span>
                    <span className="text-[#8FF075]">{b.trackingHash}</span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-white/60 capitalize">{b.wasteType} Feedstock</span>
                    <span className="text-white font-bold font-mono">
                      {b.weightKg.toLocaleString()} kg ({(b.weightKg / 1000).toFixed(2)}t)
                    </span>
                  </div>

                  <p className="mt-1 text-[11px] text-white/40 truncate">
                    Supplier: {b.supplierName}
                  </p>

                  <div className="mt-2 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded inline-block">
                    ✓ Gemini Segregation: {(b.photoCheck.confidence * 100).toFixed(0)}% Pass
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedBatch(b);
                      setModalOpen(true);
                    }}
                    className="text-xs text-white/50 hover:text-white font-mono"
                  >
                    Inspect Details →
                  </button>

                  <button
                    onClick={() => handleClaim(b.id)}
                    disabled={claimingId === b.id}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#0B0D10] font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-40"
                  >
                    {claimingId === b.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Cpu className="w-3.5 h-3.5" />
                    )}
                    <span>Claim for Facility</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Facility Active & Processed Batches */}
      <div className="rounded-2xl bg-[#12151A] border border-white/8 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/8">
          <div>
            <h3 className="text-base font-bold text-white font-sans">Facility Processing Queue</h3>
            <p className="text-xs text-white/50">Conversion runs, biochar outputs, and auditor submission</p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/8 text-white/40 text-[11px] uppercase">
                <th className="py-3 px-3">Batch ID</th>
                <th className="py-3 px-3">Feedstock</th>
                <th className="py-3 px-3">Method & Output</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {myFacilityBatches.map((b) => (
                <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-3">
                    <span className="text-white font-semibold">{b.id}</span>
                    <div className="text-[11px] text-cyan-400">{b.trackingHash}</div>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="text-white capitalize">{b.wasteType}</div>
                    <div className="text-[11px] text-white/50">{b.weightKg.toLocaleString()} kg</div>
                  </td>

                  <td className="py-3.5 px-3">
                    {b.processing ? (
                      <div>
                        <span className="text-white uppercase font-bold">
                          {b.processing.method.replace("_", " ")}
                        </span>
                        <div className="text-[11px] text-[#8FF075]">
                          {b.processing.outputAmount} kg {b.processing.outputType}
                        </div>
                      </div>
                    ) : (
                      <span className="text-white/40 italic">Not processed</span>
                    )}
                  </td>

                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-medium border ${
                        b.status === "verified"
                          ? "bg-[#8FF075]/15 text-[#8FF075] border-[#8FF075]/30"
                          : b.status === "pending_check"
                          ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                          : b.status === "processed"
                          ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                          : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                      }`}
                    >
                      {b.status.replace("_", " ")}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {b.status === "claimed" && (
                        <button
                          onClick={() => onNavigate(`/recycler/process/${b.id}`)}
                          className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#0B0D10] font-semibold text-xs font-sans transition-colors"
                        >
                          Run Pyrolysis
                        </button>
                      )}

                      {b.status === "processed" && (
                        <button
                          onClick={() => onNavigate(`/recycler/output/${b.id}`)}
                          className="px-3 py-1 rounded-lg bg-[#8FF075] hover:bg-[#8FF075]/90 text-[#0B0D10] font-semibold text-xs font-sans transition-colors"
                        >
                          Submit to Auditor
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedBatch(b);
                          setModalOpen(true);
                        }}
                        className="px-2 py-1 rounded-lg bg-[#161A20] hover:bg-white/10 text-white/70 text-xs"
                      >
                        Trail
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
