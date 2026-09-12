import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";
import { Flame, Cpu, ShieldCheck, ShoppingBag, Layers, ArrowRight, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

interface SignInPageProps {
  onNavigate: (path: string) => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onNavigate }) => {
  const { signIn, signUp, switchRole } = useAuth();
  const [tab, setTab] = useState<"demo" | "custom">("demo");
  const [isSignUp, setIsSignUp] = useState(false);

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [role, setRole] = useState<UserRole>("supplier");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoPersonas: {
    role: UserRole;
    name: string;
    org: string;
    email: string;
    icon: any;
    color: string;
    path: string;
    desc: string;
  }[] = [
    {
      role: "supplier",
      name: "Vikram Singh",
      org: "GreenHarvest Agri Farms (Punjab)",
      email: "supplier@carbotrace.org",
      icon: Flame,
      color: "border-amber-500/40 text-amber-400 bg-amber-500/10",
      path: "/supplier/dashboard",
      desc: "Log paddy & bagasse waste, perform Gemini photo segregation check, dispatch batches with QR tracking.",
    },
    {
      role: "recycler",
      name: "Dr. Ananya Roy",
      org: "BioVeda Pyrolysis & Biogas Unit #4",
      email: "recycler@carbotrace.org",
      icon: Cpu,
      color: "border-cyan-500/40 text-cyan-400 bg-cyan-500/10",
      path: "/recycler/dashboard",
      desc: "Claim incoming waste deliveries, execute 550°C biochar pyrolysis runs, record energy & submit for audit.",
    },
    {
      role: "checker",
      name: "Marcus Vance",
      org: "Apex Carbon Verification (ISO 14064)",
      email: "checker@carbotrace.org",
      icon: ShieldCheck,
      color: "border-[#8FF075]/40 text-[#8FF075] bg-[#8FF075]/10",
      path: "/market",
      desc: "Audit lab spectrometry data, generate Gemini verification certificates, mint digital carbon removal credits.",
    },
    {
      role: "buyer",
      name: "Elena Rostova",
      org: "Nordic Tech ESG Ventures",
      email: "buyer@carbotrace.org",
      icon: ShoppingBag,
      color: "border-blue-500/40 text-blue-400 bg-blue-500/10",
      path: "/wallet",
      desc: "Browse certified credits, execute corporate purchase checkout, and permanently retire credits with proof.",
    },
    {
      role: "admin",
      name: "Protocol Lead",
      org: "CarboTrace Foundation",
      email: "admin@carbotrace.org",
      icon: Layers,
      color: "border-purple-500/40 text-purple-400 bg-purple-500/10",
      path: "/admin",
      desc: "Monitor network activity, reset demo sandbox, supervise global trust scores and registry balances.",
    },
  ];

  const handleDemoLogin = async (persona: (typeof demoPersonas)[0]) => {
    setLoading(true);
    setError(null);
    try {
      await switchRole(persona.role);
      onNavigate(persona.path);
    } catch (err: any) {
      setError(err.message || "Failed to switch persona");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        await signUp({
          email: email.trim(),
          role,
          displayName: displayName.trim() || email.split("@")[0],
          organizationName: organizationName.trim() || "Independent Operator",
        });
      } else {
        await signIn(email.trim());
      }
      // Route to appropriate role dashboard
      if (role === "supplier") onNavigate("/supplier/dashboard");
      else if (role === "recycler") onNavigate("/recycler/dashboard");
      else if (role === "checker") onNavigate("/market");
      else if (role === "buyer") onNavigate("/wallet");
      else onNavigate("/admin");
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#12151A] border border-[#8FF075]/30 text-xs font-mono text-[#8FF075] mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ROLE-BASED AUTHENTICATION</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white font-sans">
          Access CarboTrace Protocol
        </h1>
        <p className="text-sm text-white/50 mt-1">
          Select an instant demo persona to evaluate role-specific workflows, or sign in with custom credentials.
        </p>

        {/* Tab Switcher */}
        <div className="mt-6 inline-flex p-1 rounded-xl bg-[#12151A] border border-white/10">
          <button
            onClick={() => setTab("demo")}
            className={`px-5 py-2 rounded-lg text-xs font-medium transition-colors ${
              tab === "demo" ? "bg-[#8FF075] text-[#0B0D10] font-semibold" : "text-white/60 hover:text-white"
            }`}
          >
            ⚡ 1-Click Demo Personas (Recommended)
          </button>
          <button
            onClick={() => setTab("custom")}
            className={`px-5 py-2 rounded-lg text-xs font-medium transition-colors ${
              tab === "custom" ? "bg-[#8FF075] text-[#0B0D10] font-semibold" : "text-white/60 hover:text-white"
            }`}
          >
            Custom Sign In / Register
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs">
          {error}
        </div>
      )}

      {tab === "demo" ? (
        /* Demo Persona Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {demoPersonas.map((persona) => {
            const Icon = persona.icon;
            return (
              <div
                key={persona.role}
                className="p-5 rounded-2xl bg-[#12151A] border border-white/8 hover:border-white/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${persona.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white capitalize font-sans">
                          {persona.role} Persona
                        </h3>
                        <p className="text-[11px] font-mono text-white/50">{persona.email}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/70">
                      {persona.name}
                    </span>
                  </div>

                  <p className="text-xs text-white/80 font-medium mt-3">
                    {persona.org}
                  </p>
                  <p className="text-[11px] text-white/50 mt-1 leading-relaxed">
                    {persona.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/5">
                  <button
                    onClick={() => handleDemoLogin(persona)}
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#161A20] hover:bg-[#8FF075] hover:text-[#0B0D10] text-white border border-white/10 text-xs font-semibold flex items-center justify-center gap-2 transition-all group"
                  >
                    <span>Log in as {persona.role.toUpperCase()}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Custom Auth Form */
        <div className="max-w-md mx-auto p-6 rounded-2xl bg-[#12151A] border border-white/10 shadow-2xl">
          <h3 className="text-lg font-bold text-white mb-1 font-sans">
            {isSignUp ? "Create Protocol Account" : "Sign In with Credentials"}
          </h3>
          <p className="text-xs text-white/50 mb-6">
            Enter your organization details to connect to the decentralized ledger.
          </p>

          <form onSubmit={handleSubmitCustom} className="space-y-4 text-xs">
            <div>
              <label className="block text-white/70 font-mono mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@organization.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#161A20] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#8FF075]"
              />
            </div>

            {isSignUp && (
              <>
                <div>
                  <label className="block text-white/70 font-mono mb-1">Full Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Vikram Singh"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#161A20] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#8FF075]"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-mono mb-1">Organization / Farm / Facility</label>
                  <input
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="e.g. GreenHarvest Organics Ltd"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#161A20] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#8FF075]"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-mono mb-1">Select Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#161A20] border border-white/10 text-white focus:outline-none focus:border-[#8FF075]"
                  >
                    <option value="supplier">Supplier (Waste Origin & Dispatch)</option>
                    <option value="recycler">Recycler (Pyrolysis & Biogas Unit)</option>
                    <option value="checker">Checker (Independent ISO Auditor)</option>
                    <option value="buyer">Buyer (Carbon Credit Retirement)</option>
                    <option value="admin">Protocol Governance / Admin</option>
                  </select>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-[#8FF075] hover:bg-[#8FF075]/90 text-[#0B0D10] font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isSignUp ? (
                "Register & Connect"
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-white/5 text-center text-xs text-white/50">
            {isSignUp ? (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="text-[#8FF075] hover:underline"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Need a new account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="text-[#8FF075] hover:underline"
                >
                  Sign Up with Role
                </button>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
