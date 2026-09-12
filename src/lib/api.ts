import { CarbonCredit, GlobalStats, LedgerEvent, UserProfile, WasteBatch } from "../types";

const TOKEN_KEY = "carbotrace_auth_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(path, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const errorData = await res.json();
      message = errorData.error || message;
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }

  return res.json();
}

export const api = {
  getToken,
  setToken,
  clearToken,
  request,

  // Auth
  async signIn(email: string): Promise<{ token: string; user: UserProfile }> {
    const data = await request<{ token: string; user: UserProfile }>("/api/auth/sign-in", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    setToken(data.token);
    return data;
  },

  async signUp(body: {
    email: string;
    role: string;
    displayName: string;
    organizationName: string;
  }): Promise<{ token: string; user: UserProfile }> {
    const data = await request<{ token: string; user: UserProfile }>("/api/auth/sign-up", {
      method: "POST",
      body: JSON.stringify(body),
    });
    setToken(data.token);
    return data;
  },

  async getMe(): Promise<{ user: UserProfile }> {
    return request<{ user: UserProfile }>("/api/auth/me");
  },

  async switchRole(role: string): Promise<{ token: string; user: UserProfile }> {
    const data = await request<{ token: string; user: UserProfile }>("/api/auth/switch-role", {
      method: "POST",
      body: JSON.stringify({ role }),
    });
    setToken(data.token);
    return data;
  },

  // Stats & Ledger
  async getStats(): Promise<GlobalStats> {
    return request<GlobalStats>("/api/stats");
  },

  async getLedger(limit = 50): Promise<LedgerEvent[]> {
    return request<LedgerEvent[]>(`/api/ledger?limit=${limit}`);
  },

  // Batches
  async getBatches(params?: { role?: string; uid?: string; status?: string }): Promise<WasteBatch[]> {
    const query = new URLSearchParams(params as any).toString();
    return request<WasteBatch[]>(`/api/batches${query ? `?${query}` : ""}`);
  },

  async getBatchByIdOrHash(idOrHash: string): Promise<{ batch: WasteBatch; credit?: CarbonCredit }> {
    return request<{ batch: WasteBatch; credit?: CarbonCredit }>(`/api/batches/${idOrHash}`);
  },

  async createBatch(batchData: Partial<WasteBatch>): Promise<{ batch: WasteBatch; ledgerEvent: LedgerEvent }> {
    return request<{ batch: WasteBatch; ledgerEvent: LedgerEvent }>("/api/batches", {
      method: "POST",
      body: JSON.stringify(batchData),
    });
  },

  async advanceDelivery(batchId: string, status: string): Promise<{ batch: WasteBatch; ledgerEvent: LedgerEvent }> {
    return request<{ batch: WasteBatch; ledgerEvent: LedgerEvent }>(`/api/batches/${batchId}/advance-delivery`, {
      method: "POST",
      body: JSON.stringify({ status }),
    });
  },

  async claimBatch(batchId: string): Promise<{ batch: WasteBatch; ledgerEvent: LedgerEvent }> {
    return request<{ batch: WasteBatch; ledgerEvent: LedgerEvent }>(`/api/batches/${batchId}/claim`, {
      method: "POST",
    });
  },

  async submitProcessing(
    batchId: string,
    processingData: {
      method: string;
      energyUsedKwh: number;
      outputAmount: number;
      outputType: string;
    }
  ): Promise<{ batch: WasteBatch; ledgerEvent: LedgerEvent }> {
    return request<{ batch: WasteBatch; ledgerEvent: LedgerEvent }>(`/api/batches/${batchId}/processing`, {
      method: "POST",
      body: JSON.stringify(processingData),
    });
  },

  async requestCheck(batchId: string): Promise<{ batch: WasteBatch; ledgerEvent: LedgerEvent }> {
    return request<{ batch: WasteBatch; ledgerEvent: LedgerEvent }>(`/api/batches/${batchId}/request-check`, {
      method: "POST",
    });
  },

  async approveAndMint(
    batchId: string,
    payload: {
      labData: {
        moistureReductionPct: number;
        carbonContentPct: number;
        contaminationFlag: boolean;
        safetyChecklist: {
          temperatureVerified: boolean;
          heavyMetalsPassed: boolean;
          volatileMatterStabilized: boolean;
          originTraceable: boolean;
        };
      };
      creditPricePerTonUsd?: number;
      creditType?: string;
    }
  ): Promise<{ batch: WasteBatch; credit: CarbonCredit; ledgerEvent: LedgerEvent }> {
    return request<{ batch: WasteBatch; credit: CarbonCredit; ledgerEvent: LedgerEvent }>(
      `/api/batches/${batchId}/approve-mint`,
      {
        method: "POST",
        body: JSON.stringify({
          moistureReductionPct: payload.labData.moistureReductionPct,
          carbonContentPct: payload.labData.carbonContentPct,
          contaminationFlag: payload.labData.contaminationFlag,
          checklistPassed: Object.values(payload.labData.safetyChecklist).every(Boolean),
          priceUsd: payload.creditPricePerTonUsd,
          creditType: payload.creditType,
        }),
      }
    );
  },

  async approveAndMintCredit(
    batchId: string,
    auditData: {
      moistureReductionPct: number;
      carbonContentPct: number;
      contaminationFlag: boolean;
      checklistPassed: boolean;
      priceUsd?: number;
      creditType?: string;
    }
  ): Promise<{ batch: WasteBatch; credit: CarbonCredit; ledgerEvent: LedgerEvent }> {
    return request<{ batch: WasteBatch; credit: CarbonCredit; ledgerEvent: LedgerEvent }>(
      `/api/batches/${batchId}/approve-mint`,
      {
        method: "POST",
        body: JSON.stringify(auditData),
      }
    );
  },

  async rejectBatch(batchId: string, reason: string): Promise<{ batch: WasteBatch }> {
    return request<{ batch: WasteBatch }>(`/api/batches/${batchId}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  // Credits
  async getCredits(params?: { status?: string; ownerId?: string }): Promise<CarbonCredit[]> {
    const query = new URLSearchParams(params as any).toString();
    return request<CarbonCredit[]>(`/api/credits${query ? `?${query}` : ""}`);
  },

  async getCreditById(creditId: string): Promise<{ credit: CarbonCredit; batch?: WasteBatch }> {
    return request<{ credit: CarbonCredit; batch?: WasteBatch }>(`/api/credits/${creditId}`);
  },

  async buyCredit(creditId: string): Promise<{ credit: CarbonCredit; ledgerEvent: LedgerEvent }> {
    return request<{ credit: CarbonCredit; ledgerEvent: LedgerEvent }>(`/api/credits/${creditId}/purchase`, {
      method: "POST",
    });
  },

  async purchaseCredit(creditId: string): Promise<{ credit: CarbonCredit; ledgerEvent: LedgerEvent }> {
    return request<{ credit: CarbonCredit; ledgerEvent: LedgerEvent }>(`/api/credits/${creditId}/purchase`, {
      method: "POST",
    });
  },

  async retireCredit(
    creditId: string,
    beneficiary: string,
    reason?: string
  ): Promise<{ credit: CarbonCredit; ledgerEvent: LedgerEvent }> {
    return request<{ credit: CarbonCredit; ledgerEvent: LedgerEvent }>(`/api/credits/${creditId}/retire`, {
      method: "POST",
      body: JSON.stringify({ beneficiary, reason: reason || "Permanent corporate ESG carbon offset retirement" }),
    });
  },

  // AI Helpers
  async checkWastePhoto(imageBase64: string, wasteType: string): Promise<{ passed: boolean; confidence: number; reason: string }> {
    return request<{ passed: boolean; confidence: number; reason: string }>("/api/ai/photo-check", {
      method: "POST",
      body: JSON.stringify({ imageBase64, wasteType }),
    });
  },

  async askAssistant(query: string): Promise<{ answer: string; groundedBatches?: string[]; groundedCredits?: string[] }> {
    return request<{ answer: string; groundedBatches?: string[]; groundedCredits?: string[] }>(
      "/api/ai/assistant",
      {
        method: "POST",
        body: JSON.stringify({ query }),
      }
    );
  },

  async resetDatabase(): Promise<{ message: string; stats: GlobalStats }> {
    return request<{ message: string; stats: GlobalStats }>("/api/admin/seed", {
      method: "POST",
    });
  },

  async resetSeedData(): Promise<{ message: string; stats: GlobalStats }> {
    return request<{ message: string; stats: GlobalStats }>("/api/admin/seed", {
      method: "POST",
    });
  },
};
