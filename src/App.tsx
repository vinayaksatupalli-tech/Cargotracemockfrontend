import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LiveDataProvider } from "./context/LiveDataContext";
import { GlobeBackground } from "./components/GlobeBackground";
import { TopNav } from "./components/TopNav";
import { AssistantPanel } from "./components/AssistantPanel";

// Pages
import { HomePage } from "./pages/HomePage";
import { SignInPage } from "./pages/SignInPage";
import { SupplierDashboard } from "./pages/supplier/SupplierDashboard";
import { NewWastePage } from "./pages/supplier/NewWastePage";
import { DeliveryTrackingPage } from "./pages/supplier/DeliveryTrackingPage";
import { RecyclerDashboard } from "./pages/recycler/RecyclerDashboard";
import { ProcessBatchPage } from "./pages/recycler/ProcessBatchPage";
import { BatchOutputPage } from "./pages/recycler/BatchOutputPage";
import { CheckerMarketPage } from "./pages/checker/CheckerMarketPage";
import { ReviewBatchPage } from "./pages/checker/ReviewBatchPage";
import { MarketplacePage } from "./pages/buyer/MarketplacePage";
import { WalletPage } from "./pages/buyer/WalletPage";
import { ProvenancePage } from "./pages/ProvenancePage";
import { MethodologyPage } from "./pages/MethodologyPage";
import { AdminPage } from "./pages/AdminPage";

import { MessageSquareText, X, Sparkles } from "lucide-react";

function AppContent() {
  // Simple, robust path-based client-side router
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || "/";
  });
  const [assistantOpen, setAssistantOpen] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || "/");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path !== currentPath) {
      window.history.pushState({}, "", path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Route resolver
  const renderRoute = () => {
    // 1. Static routes
    if (currentPath === "/" || currentPath === "") {
      return <HomePage onNavigate={navigate} />;
    }
    if (currentPath === "/signin") {
      return <SignInPage onNavigate={navigate} />;
    }
    if (currentPath === "/supplier/dashboard") {
      return <SupplierDashboard onNavigate={navigate} />;
    }
    if (currentPath === "/supplier/new-waste") {
      return <NewWastePage onNavigate={navigate} />;
    }
    if (currentPath === "/recycler/dashboard") {
      return <RecyclerDashboard onNavigate={navigate} />;
    }
    if (currentPath === "/market") {
      return <CheckerMarketPage onNavigate={navigate} />;
    }
    if (currentPath === "/marketplace") {
      return <MarketplacePage onNavigate={navigate} />;
    }
    if (currentPath === "/wallet") {
      return <WalletPage onNavigate={navigate} />;
    }
    if (currentPath === "/provenance") {
      return <ProvenancePage />;
    }
    if (currentPath === "/methodology") {
      return <MethodologyPage />;
    }
    if (currentPath === "/admin") {
      return <AdminPage />;
    }

    // 2. Dynamic parameterized routes
    // Delivery tracking: /supplier/delivery/:id
    if (currentPath.startsWith("/supplier/delivery/")) {
      const batchId = currentPath.replace("/supplier/delivery/", "");
      return <DeliveryTrackingPage batchId={batchId} onNavigate={navigate} />;
    }

    // Recycler process: /recycler/process/:id
    if (currentPath.startsWith("/recycler/process/")) {
      const batchId = currentPath.replace("/recycler/process/", "");
      return <ProcessBatchPage batchId={batchId} onNavigate={navigate} />;
    }

    // Recycler output: /recycler/output/:id
    if (currentPath.startsWith("/recycler/output/")) {
      const batchId = currentPath.replace("/recycler/output/", "");
      return <BatchOutputPage batchId={batchId} onNavigate={navigate} />;
    }

    // Checker review: /checker/review/:id
    if (currentPath.startsWith("/checker/review/")) {
      const batchId = currentPath.replace("/checker/review/", "");
      return <ReviewBatchPage batchId={batchId} onNavigate={navigate} />;
    }

    // Default fallback to Home
    return <HomePage onNavigate={navigate} />;
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#E1E4EA] flex flex-col relative selection:bg-[#8FF075] selection:text-[#0B0D10]">
      {/* Cinematic dark canvas background with globe visualization */}
      <GlobeBackground />

      {/* Persistent sticky navigation bar */}
      <TopNav currentPath={currentPath} onNavigate={navigate} />

      {/* Main Routed Content Area */}
      <main className="flex-1 w-full relative z-10 pt-4">
        {renderRoute()}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/8 bg-[#0B0D10]/80 backdrop-blur-md py-6 text-xs text-white/40 text-center font-mono relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8FF075]" />
            <span>CarboTrace MRV Protocol • ISO 14064-2 Compliant Ledger</span>
          </div>
          <div className="flex items-center gap-4 text-white/60">
            <button onClick={() => navigate("/methodology")} className="hover:text-white">
              Methodology
            </button>
            <button onClick={() => navigate("/provenance")} className="hover:text-white">
              Provenance
            </button>
            <button onClick={() => navigate("/admin")} className="hover:text-white">
              Admin Sandbox
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Grounded AI Assistant Drawer */}
      <div className="fixed bottom-5 right-5 z-50">
        {assistantOpen ? (
          <div className="w-[360px] sm:w-[440px] shadow-2xl rounded-2xl overflow-hidden relative animate-in fade-in slide-in-from-bottom-5 duration-200">
            <button
              onClick={() => setAssistantOpen(false)}
              className="absolute top-4 right-4 z-10 w-6 h-6 rounded-full bg-black/40 hover:bg-black/70 text-white/70 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <AssistantPanel />
          </div>
        ) : (
          <button
            onClick={() => setAssistantOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#12151A] hover:bg-[#161A20] text-white border border-[#8FF075]/40 shadow-[0_4px_24px_rgba(143,240,117,0.25)] transition-all group hover:scale-[1.03]"
          >
            <div className="w-7 h-7 rounded-xl bg-[#8FF075] text-[#0B0D10] flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-left font-sans">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Ask CarboTrace</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#8FF075] animate-ping" />
              </div>
              <div className="text-[10px] text-white/50 font-mono">Grounded AI Protocol Agent</div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LiveDataProvider>
        <AppContent />
      </LiveDataProvider>
    </AuthProvider>
  );
}
