import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { WasteBatch } from "../../types";
import { QRCodeBlock } from "../../components/QRCodeBlock";
import { StatusTimeline } from "../../components/StatusTimeline";
import { ArrowLeft, MapPin, Truck, CheckCircle2, ShieldCheck, RefreshCw, Loader2, ArrowRight } from "lucide-react";

interface DeliveryTrackingPageProps {
  batchId: string;
  onNavigate: (path: string) => void;
}

export const DeliveryTrackingPage: React.FC<DeliveryTrackingPageProps> = ({ batchId, onNavigate }) => {
  const [batch, setBatch] = useState<WasteBatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getBatchByIdOrHash(batchId);
        setBatch(res.batch);
      } catch (err: any) {
        setError(err.message || "Batch not found");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [batchId]);

  const handleAdvanceStatus = async (nextStatus: string) => {
    if (!batch) return;
    setUpdating(true);
    try {
      const res = await api.advanceDelivery(batch.id, nextStatus);
      setBatch(res.batch);
    } catch (err: any) {
      setError(err.message || "Could not update status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-white/50 text-xs font-mono">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#8FF075]" />
        Loading batch tracking data...
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-mono">
          {error || "Batch not found"}
        </div>
        <button
          onClick={() => onNavigate("/supplier/dashboard")}
          className="mt-4 px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-mono"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <button
        onClick={() => onNavigate("/supplier/dashboard")}
        className="flex items-center gap-1.5 text-xs font-mono text-white/50 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Supplier Dashboard</span>
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-blue-500/15 text-blue-400 border border-blue-500/30 uppercase">
              LIVE DISPATCH TELEMETRY
            </span>
            <span className="font-mono text-xs text-white/50">{batch.id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-sans mt-1">
            Carrier Delivery & Geofence Status
          </h1>
          <p className="text-xs text-white/50 mt-1 font-mono">
            Tracking Hash: <span className="text-[#8FF075]">{batch.trackingHash}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-lg text-xs font-mono uppercase font-bold border ${
              batch.status === "delivered" || batch.status === "claimed" || batch.status === "verified"
                ? "bg-[#8FF075]/15 text-[#8FF075] border-[#8FF075]/30"
                : "bg-blue-500/15 text-blue-400 border-blue-500/30"
            }`}
          >
            {batch.status.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Lifecycle Progress Timeline */}
      <div className="p-5 rounded-2xl bg-[#12151A] border border-white/8">
        <StatusTimeline status={batch.status} />
      </div>

      {/* Main Grid: QR Handshake & Geofence */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* QR Code Container */}
        <div className="p-6 rounded-2xl bg-[#12151A] border border-white/8 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-mono text-white/50 uppercase mb-4">
            Custody Handshake QR
          </span>
          <QRCodeBlock value={batch.trackingHash} size={150} label={batch.trackingHash} />
          <p className="text-[11px] text-white/40 mt-3 max-w-[200px]">
            Scan with logistics scanner to verify custody handover at facility gate.
          </p>
        </div>

        {/* Geofence & Route Telemetry */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-[#12151A] border border-white/8 space-y-4">
          <div className="flex items-center justify-between border-b border-white/8 pb-3">
            <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>Geofence Coordinates & Transit</span>
            </h3>
            <span className="text-[10px] font-mono text-[#8FF075] bg-[#8FF075]/10 px-2 py-0.5 rounded">
              GPS ACTIVE
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-white/50">Origin Location:</span>
              <span className="text-white font-medium text-right">{batch.location.address}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-white/50">Coordinates:</span>
              <span className="text-white font-medium">
                {batch.location.lat.toFixed(4)}° N, {batch.location.lng.toFixed(4)}° E
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-white/50">Feedstock Mass:</span>
              <span className="text-[#8FF075] font-bold">
                {batch.weightKg.toLocaleString()} kg ({(batch.weightKg / 1000).toFixed(2)}t)
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-white/50">Gemini Verification:</span>
              <span className="text-emerald-400 font-bold">
                PASSED ({(batch.photoCheck.confidence * 100).toFixed(0)}% confidence)
              </span>
            </div>
          </div>

          {/* Delivery Milestone Stepper for Judges / Demonstration */}
          <div className="mt-4 p-4 rounded-xl bg-[#161A20] border border-white/5 space-y-2">
            <span className="text-[10px] font-mono text-white/50 uppercase block">
              Simulate Transit Milestones:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleAdvanceStatus("picked_up")}
                disabled={updating || batch.status !== "booked"}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white text-xs font-mono transition-colors"
              >
                1. Driver Picked Up
              </button>
              <button
                type="button"
                onClick={() => handleAdvanceStatus("in_transit")}
                disabled={updating || (batch.status !== "picked_up" && batch.status !== "booked")}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white text-xs font-mono transition-colors"
              >
                2. En Route
              </button>
              <button
                type="button"
                onClick={() => handleAdvanceStatus("delivered")}
                disabled={updating || batch.status === "delivered"}
                className="px-3 py-1.5 rounded-lg bg-[#8FF075] hover:bg-[#8FF075]/90 text-[#0B0D10] font-bold text-xs font-mono transition-colors disabled:opacity-40"
              >
                3. Mark Delivered to Facility
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recycler handoff notice */}
      {batch.status === "delivered" && (
        <div className="p-4 rounded-xl bg-[#8FF075]/10 border border-[#8FF075]/25 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#8FF075] font-mono">
            <CheckCircle2 className="w-4 h-4" />
            <span>Batch delivered! Now available in the Recycler facility queue.</span>
          </div>
          <button
            onClick={() => onNavigate("/recycler/dashboard")}
            className="px-3 py-1.5 rounded-lg bg-[#8FF075] text-[#0B0D10] font-semibold flex items-center gap-1 font-sans"
          >
            <span>Go to Recycler View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
