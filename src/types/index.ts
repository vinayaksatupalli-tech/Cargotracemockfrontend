export type UserRole = "supplier" | "recycler" | "checker" | "buyer" | "admin";

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
  organizationName?: string;
  createdAt: string;
}

export type WasteType = "organic" | "food" | "agri" | "other";

export type BatchStatus = 
  | "booked" 
  | "picked_up" 
  | "in_transit" 
  | "delivered" 
  | "claimed" 
  | "processing" 
  | "processed" 
  | "pending_check" 
  | "verified" 
  | "rejected";

export interface WasteBatch {
  id: string;
  trackingHash: string;
  supplierId: string;
  supplierName: string;
  wasteType: WasteType;
  weightKg: number;
  moisturePct: number;
  photoUrl: string;
  photoCheck: {
    passed: boolean;
    confidence: number;
    reason: string;
  };
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: BatchStatus;
  recyclerId?: string;
  recyclerName?: string;
  processing?: {
    method: "biochar_kiln" | "biogas_digestor" | "composting";
    energyUsedKwh: number;
    outputAmount: number;
    outputType: "biochar" | "green_gas" | "clean_fuel";
    processedAt: string;
  };
  checkerId?: string;
  checkerName?: string;
  checkResult?: {
    moistureReductionPct: number;
    carbonContentPct: number;
    contaminationFlag: boolean;
    checklistPassed: boolean;
    certificateText?: string;
    verifiedAt: string;
  };
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreditStatus = "available" | "sold" | "retired";
export type CreditType = "Carbon Removal" | "Methane Capture" | "Biomass Conversion" | "Reforestation";

export interface CarbonCredit {
  id: string;
  batchId: string;
  batchTrackingHash: string;
  tonnage: number;
  type: CreditType;
  verifiedBy: string;
  checkerName: string;
  mintedAt: string;
  status: CreditStatus;
  priceUsd: number;
  ownerId?: string;
  ownerName?: string;
  soldAt?: string;
  retiredAt?: string;
  retirementBeneficiary?: string;
  retirementReason?: string;
  certificateText?: string;
}

export type LedgerEventType = 
  | "Waste Logged" 
  | "Batch Claimed" 
  | "Processed" 
  | "Credit Minted" 
  | "Credit Sold" 
  | "Credit Retired";

export interface LedgerEvent {
  id: string;
  hash: string;
  type: LedgerEventType;
  tonnage: number;
  verifiedBy?: string;
  relatedBatchId?: string;
  relatedCreditId?: string;
  details?: string;
  timestamp: string;
}

export interface GlobalStats {
  totalVerifiedOffsetsTonnes: number;
  activeNodes: number;
  totalRetiredCreditsTonnes: number;
  platformSecurityScorePct: number;
  totalWasteProcessedTonnes: number;
  activeBatchesCount: number;
  updatedAt: string;
}

export interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  groundedBatches?: string[];
  groundedCredits?: string[];
}
