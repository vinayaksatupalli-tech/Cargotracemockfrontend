import React from "react";
import { BookOpen, ShieldCheck, Scale, Flame, Lock, CheckCircle2, ArrowRight } from "lucide-react";

export const MethodologyPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#12151A] border border-[#8FF075]/30 text-xs font-mono text-[#8FF075]">
          <BookOpen className="w-3.5 h-3.5" />
          <span>MRV SPECIFICATION & AUDIT RIGOR</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-sans">
          Carbon Verification Methodology
        </h1>
        <p className="text-xs sm:text-sm text-white/50">
          Governed by ISO 14064-2 standard protocols, elemental stoichiometry, and unalterable on-chain retirement mechanics.
        </p>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#12151A] border border-white/8 space-y-3">
          <div className="flex items-center gap-2 text-[#8FF075] text-xs font-mono font-bold uppercase">
            <Scale className="w-4 h-4" />
            <span>1. Baseline & Additionality</span>
          </div>
          <h3 className="text-base font-bold text-white font-sans">
            Avoided Open-Air Stubble Burning
          </h3>
          <p className="text-xs text-white/70 leading-relaxed font-sans">
            In standard agricultural practices across Northern India, rice paddy straw is burned openly in fields, releasing severe PM2.5 particulates, methane (CH4), and nitrous oxide (N2O). CarboTrace establishes additionality by verifying feedstock pickup through GPS geofencing and overhead Gemini segregation scans prior to field clearing.
          </p>
          <div className="p-3 rounded-xl bg-[#161A20] font-mono text-[11px] text-white/60">
            Baseline Emission Factor: <span className="text-amber-400 font-bold">1.46 kg CO2e / kg paddy straw burned</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#12151A] border border-white/8 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase">
            <Flame className="w-4 h-4" />
            <span>2. Thermal Conversion & Stoichiometry</span>
          </div>
          <h3 className="text-base font-bold text-white font-sans">
            Biochar Mineralization Durability
          </h3>
          <p className="text-xs text-white/70 leading-relaxed font-sans">
            Continuous retort kilns subject clean biomass to oxygen-depleted thermal environments (&gt;500°C). Lab spectrometry confirms an elemental carbon content exceeding 75% with a molar H:Corg ratio &lt; 0.70, satisfying European Biochar Certificate (EBC) criteria for permanent geological storage (&gt;100 years).
          </p>
          <div className="p-3 rounded-xl bg-[#161A20] font-mono text-[11px] text-white/60">
            Formula: <span className="text-[#8FF075] font-bold">tCO2e = Yield(kg) × %C × (44/12) ÷ 1000 - Parasitic</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#12151A] border border-white/8 space-y-3">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-mono font-bold uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>3. Multimodal AI & Independent MRV</span>
          </div>
          <h3 className="text-base font-bold text-white font-sans">
            Gemini Multimodal Quality Assurance
          </h3>
          <p className="text-xs text-white/70 leading-relaxed font-sans">
            Gemini Flash inspects overhead bin photography to reject non-biodegradable synthetic polymers and PVC before transport. Following processing, accredited ISO 14064 auditors verify elemental spectrometry, moisture stabilization, and volatile matter before Gemini synthesizes a formal Compliance Certificate.
          </p>
          <div className="p-3 rounded-xl bg-[#161A20] font-mono text-[11px] text-white/60">
            MRV Standard: <span className="text-blue-400 font-bold">ISO 14064-2 & 14064-3 Third-Party Audit</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#12151A] border border-white/8 space-y-3">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-mono font-bold uppercase">
            <Lock className="w-4 h-4" />
            <span>4. Zero Double-Counting Guarantee</span>
          </div>
          <h3 className="text-base font-bold text-white font-sans">
            Cryptographic Burn & Registry Locking
          </h3>
          <p className="text-xs text-white/70 leading-relaxed font-sans">
            Each carbon credit token is uniquely identified with an ISO-compliant serial number. When a corporate buyer exercises an offset claim, the token status irreversibly updates to 'retired', producing a SHA-256 retirement hash with named corporate beneficiary that is permanently blocked from further trading.
          </p>
          <div className="p-3 rounded-xl bg-[#161A20] font-mono text-[11px] text-white/60">
            Custody State: <span className="text-[#8FF075] font-bold">Irreversible Token Burn Proof</span>
          </div>
        </div>
      </div>
    </div>
  );
};
