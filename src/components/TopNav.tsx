import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLiveData } from "../context/LiveDataContext";
import { UserRole } from "../types";
import {
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  ChevronDown,
  UserCheck,
  RefreshCw,
  Search,
  ExternalLink,
  Flame,
  Scale,
  ShoppingBag,
  Info
} from "lucide-react";

interface TopNavProps {
  onOpenSearch?: () => void;
  currentPath?: string;
  onNavigate: (path: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({ currentPath = "/", onNavigate }) => {
  const { currentUser, switchRole, signOut } = useAuth();
  const { isConnected, latestNotification, clearNotification } = useLiveData();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const roles: { role: UserRole; label: string; icon: any; color: string; path: string }[] = [
    { role: "supplier", label: "Supplier (Farm/Waste)", icon: Flame, color: "text-amber-400", path: "/supplier/dashboard" },
    { role: "recycler", label: "Recycler (Pyrolysis/Biogas)", icon: Cpu, color: "text-cyan-400", path: "/recycler/dashboard" },
    { role: "checker", label: "Checker (ISO Auditor)", icon: ShieldCheck, color: "text-[#8FF075]", path: "/market" },
    { role: "buyer", label: "Buyer (ESG Portfolio)", icon: ShoppingBag, color: "text-blue-400", path: "/wallet" },
    { role: "admin", label: "Protocol Governance", icon: Layers, color: "text-purple-400", path: "/admin" },
  ];

  const handleRoleSelect = async (role: UserRole, targetPath: string) => {
    setRoleDropdownOpen(false);
    await switchRole(role);
    onNavigate(targetPath);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0B0D10]/90 backdrop-blur-md border-b border-white/8">
      {/* Live notification ribbon */}
      {latestNotification && (
        <div className="bg-[#8FF075]/10 border-b border-[#8FF075]/20 px-4 py-1 flex items-center justify-between text-xs text-[#8FF075] font-mono">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8FF075] animate-ping" />
            <span>{latestNotification}</span>
          </div>
          <button
            onClick={clearNotification}
            className="text-white/40 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate("/")}
            className="flex items-center gap-3 text-left focus:outline-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8FF075]/20 to-[#3B82F6]/20 border border-[#8FF075]/40 flex items-center justify-center text-[#8FF075] shadow-[0_0_15px_rgba(143,240,117,0.15)] group-hover:border-[#8FF075] transition-all">
              <Sparkles className="w-5 h-5 text-[#8FF075]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white font-sans">
                  Carbo<span className="text-[#8FF075]">Trace</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-white/5 border border-white/10 text-white/60">
                  MRV v2.4
                </span>
              </div>
              <p className="text-[10px] font-mono text-white/40 tracking-wider">
                WASTE-TO-CARBON VALUE CHAIN
              </p>
            </div>
          </button>

          {/* Primary Nav Items */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
            <button
              onClick={() => onNavigate("/")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                currentPath === "/" ? "bg-white/10 text-[#8FF075]" : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              Live Feed
            </button>

            {currentUser?.role === "supplier" && (
              <button
                onClick={() => onNavigate("/supplier/dashboard")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  currentPath.startsWith("/supplier") ? "bg-white/10 text-[#8FF075]" : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                Supplier Hub
              </button>
            )}

            {currentUser?.role === "recycler" && (
              <button
                onClick={() => onNavigate("/recycler/dashboard")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  currentPath.startsWith("/recycler") ? "bg-white/10 text-[#8FF075]" : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                Pyrolysis Facility
              </button>
            )}

            {currentUser?.role === "checker" && (
              <button
                onClick={() => onNavigate("/market")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  currentPath === "/market" || currentPath.startsWith("/checker")
                    ? "bg-white/10 text-[#8FF075]"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                Auditor Desk
              </button>
            )}

            <button
              onClick={() => onNavigate("/wallet")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                currentPath === "/wallet" || currentPath.startsWith("/buyer")
                  ? "bg-white/10 text-[#8FF075]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              Carbon Market
            </button>

            <button
              onClick={() => onNavigate("/assistant")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                currentPath === "/assistant" ? "bg-[#8FF075]/15 text-[#8FF075]" : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8FF075]" />
              <span>Ask AI</span>
            </button>

            <button
              onClick={() => onNavigate("/methodology")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                currentPath === "/methodology" ? "bg-white/10 text-[#8FF075]" : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              Methodology
            </button>
          </nav>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* Real-time Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#12151A] border border-white/8 text-[11px] font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-[#8FF075] animate-pulse shadow-[0_0_8px_#8FF075]" : "bg-amber-400"
              }`}
            />
            <span className="text-white/60">{isConnected ? "SYNCED" : "CONNECTING"}</span>
          </div>

          {/* Quick Persona Role Switcher for Judges */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#12151A] hover:bg-[#161A20] border border-white/10 text-xs text-white transition-all shadow-sm"
              title="Click to switch persona role"
            >
              <span className="w-2 h-2 rounded-full bg-[#8FF075]" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase font-mono text-white/40 leading-none">Role</span>
                <span className="font-semibold text-white capitalize leading-tight">
                  {currentUser?.role || "Select"}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-white/50" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#12151A] border border-white/15 shadow-2xl p-2 z-50 animate-in fade-in-50 zoom-in-95">
                <div className="px-2 py-1.5 border-b border-white/8 mb-1">
                  <p className="text-[10px] font-mono text-white/40 uppercase">1-Click Persona Demo</p>
                  <p className="text-xs text-white/80 font-medium">Switch perspective to test flows</p>
                </div>
                <div className="space-y-1">
                  {roles.map((r) => {
                    const Icon = r.icon;
                    const isActive = currentUser?.role === r.role;
                    return (
                      <button
                        key={r.role}
                        onClick={() => handleRoleSelect(r.role, r.path)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                          isActive
                            ? "bg-[#8FF075]/15 text-[#8FF075] border border-[#8FF075]/30 font-semibold"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${r.color}`} />
                          <span>{r.label}</span>
                        </div>
                        {isActive && <span className="text-[10px] font-mono">ACTIVE</span>}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 pt-2 border-t border-white/8 flex items-center justify-between px-1">
                  <button
                    onClick={() => {
                      setRoleDropdownOpen(false);
                      onNavigate("/admin");
                    }}
                    className="text-[11px] text-white/50 hover:text-white flex items-center gap-1"
                  >
                    <Layers className="w-3 h-3" />
                    <span>Admin Controls</span>
                  </button>
                  <button
                    onClick={() => {
                      setRoleDropdownOpen(false);
                      onNavigate("/sign-in");
                    }}
                    className="text-[11px] text-[#8FF075] hover:underline"
                  >
                    All Accounts →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
