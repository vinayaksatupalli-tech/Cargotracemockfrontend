import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { GlobalStats, LedgerEvent } from "../types";
import { api } from "../lib/api";

interface LiveDataContextType {
  stats: GlobalStats;
  ledger: LedgerEvent[];
  isConnected: boolean;
  refreshData: () => Promise<void>;
  latestNotification: string | null;
  clearNotification: () => void;
}

const defaultStats: GlobalStats = {
  totalVerifiedOffsetsTonnes: 1420.5,
  activeNodes: 48,
  totalRetiredCreditsTonnes: 865.0,
  platformSecurityScorePct: 99.4,
  totalWasteProcessedTonnes: 3850.2,
  activeBatchesCount: 14,
  updatedAt: new Date().toISOString(),
};

const LiveDataContext = createContext<LiveDataContextType | undefined>(undefined);

export const LiveDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<GlobalStats>(defaultStats);
  const [ledger, setLedger] = useState<LedgerEvent[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [latestNotification, setLatestNotification] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    try {
      const [fetchedStats, fetchedLedger] = await Promise.all([
        api.getStats(),
        api.getLedger(),
      ]);
      setStats(fetchedStats);
      setLedger(fetchedLedger);
    } catch (err) {
      console.warn("Failed to fetch initial live data:", err);
    }
  }, []);

  useEffect(() => {
    refreshData();

    // Server-Sent Events real-time connection
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/live-stream");

      eventSource.addEventListener("connected", () => {
        setIsConnected(true);
      });

      eventSource.addEventListener("ledger_event", (e) => {
        try {
          const newEvent: LedgerEvent = JSON.parse(e.data);
          setLedger((prev) => [newEvent, ...prev.filter((item) => item.id !== newEvent.id)]);
          setLatestNotification(`New Ledger Block: ${newEvent.type} (${newEvent.tonnage}t)`);
        } catch (err) {
          console.error("Error parsing ledger event:", err);
        }
      });

      eventSource.addEventListener("stats_updated", (e) => {
        try {
          const newStats: GlobalStats = JSON.parse(e.data);
          setStats(newStats);
        } catch (err) {
          console.error("Error parsing stats:", err);
        }
      });

      eventSource.onerror = () => {
        setIsConnected(false);
      };
    } catch {
      setIsConnected(false);
    }

    // Secondary fallback poll interval to guarantee fresh metrics even if SSE blips
    const interval = setInterval(refreshData, 12000);

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      clearInterval(interval);
    };
  }, [refreshData]);

  const clearNotification = () => setLatestNotification(null);

  return (
    <LiveDataContext.Provider
      value={{
        stats,
        ledger,
        isConnected,
        refreshData,
        latestNotification,
        clearNotification,
      }}
    >
      {children}
    </LiveDataContext.Provider>
  );
};

export function useLiveData() {
  const context = useContext(LiveDataContext);
  if (!context) {
    throw new Error("useLiveData must be used within a LiveDataProvider");
  }
  return context;
}
