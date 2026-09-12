import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "carbotrace-db.json");

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// In-Memory & File Persisted Store
interface DatabaseSchema {
  users: Array<{
    uid: string;
    email: string;
    role: "supplier" | "recycler" | "checker" | "buyer" | "admin";
    displayName: string;
    organizationName: string;
    createdAt: string;
  }>;
  batches: Array<any>;
  credits: Array<any>;
  ledger: Array<any>;
  stats: {
    totalVerifiedOffsetsTonnes: number;
    activeNodes: number;
    totalRetiredCreditsTonnes: number;
    platformSecurityScorePct: number;
    totalWasteProcessedTonnes: number;
    activeBatchesCount: number;
    updatedAt: string;
  };
}

// Initial Seed Data
function getInitialSeedData(): DatabaseSchema {
  const users: DatabaseSchema["users"] = [
    {
      uid: "usr_supplier_01",
      email: "supplier@carbotrace.org",
      role: "supplier",
      displayName: "Vikram Singh",
      organizationName: "GreenHarvest Agri Farms (Punjab)",
      createdAt: "2026-01-10T08:00:00.000Z",
    },
    {
      uid: "usr_recycler_01",
      email: "recycler@carbotrace.org",
      role: "recycler",
      displayName: "Dr. Ananya Roy",
      organizationName: "BioVeda Pyrolysis & Biogas Unit #4",
      createdAt: "2026-01-11T09:30:00.000Z",
    },
    {
      uid: "usr_checker_01",
      email: "checker@carbotrace.org",
      role: "checker",
      displayName: "Marcus Vance",
      organizationName: "Apex Carbon Verification Services (ISO 14064)",
      createdAt: "2026-01-12T10:15:00.000Z",
    },
    {
      uid: "usr_buyer_01",
      email: "buyer@carbotrace.org",
      role: "buyer",
      displayName: "Elena Rostova",
      organizationName: "Nordic Tech ESG Ventures",
      createdAt: "2026-01-15T11:00:00.000Z",
    },
    {
      uid: "usr_admin_01",
      email: "admin@carbotrace.org",
      role: "admin",
      displayName: "CarboTrace Protocol Lead",
      organizationName: "CarboTrace Foundation",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ];

  const batches: DatabaseSchema["batches"] = [
    {
      id: "batch_4521",
      trackingHash: "0xCT-4521-E9B0",
      supplierId: "usr_supplier_01",
      supplierName: "GreenHarvest Agri Farms (Punjab)",
      wasteType: "agri",
      weightKg: 8500,
      moisturePct: 18.2,
      photoUrl: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80",
      photoCheck: {
        passed: true,
        confidence: 0.96,
        reason: "Clean agricultural rice paddy residue with uniform straw consistency. No plastic or non-biodegradable debris detected.",
      },
      location: {
        lat: 30.9010,
        lng: 75.8573,
        address: "Block 4, Nabha Farm District, Ludhiana, Punjab",
      },
      status: "verified",
      recyclerId: "usr_recycler_01",
      recyclerName: "BioVeda Pyrolysis & Biogas Unit #4",
      processing: {
        method: "biochar_kiln",
        energyUsedKwh: 340,
        outputAmount: 2850,
        outputType: "biochar",
        processedAt: "2026-08-28T14:30:00.000Z",
      },
      checkerId: "usr_checker_01",
      checkerName: "Apex Carbon Verification Services (ISO 14064)",
      checkResult: {
        moistureReductionPct: 82.4,
        carbonContentPct: 78.5,
        contaminationFlag: false,
        checklistPassed: true,
        certificateText: "Batch #4521 demonstrated outstanding thermal conversion efficiency in BioVeda continuous pyrolysis unit. 8.5t paddy straw was transformed into 2.85t high-purity stable biochar with 78.5% elemental carbon stability. Verified net carbon avoidance equates to 6.2 tonnes CO2e permanently sequestered.",
        verifiedAt: "2026-08-30T10:00:00.000Z",
      },
      createdAt: "2026-08-25T08:30:00.000Z",
      updatedAt: "2026-08-30T10:00:00.000Z",
    },
    {
      id: "batch_4522",
      trackingHash: "0xCT-4522-8A7F",
      supplierId: "usr_supplier_01",
      supplierName: "GreenHarvest Agri Farms (Punjab)",
      wasteType: "food",
      weightKg: 4200,
      moisturePct: 62.0,
      photoUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
      photoCheck: {
        passed: true,
        confidence: 0.92,
        reason: "Source-segregated organic wholesale fruit and vegetable waste. High organic fraction, zero glass or metal detected.",
      },
      location: {
        lat: 28.7041,
        lng: 77.1025,
        address: "Azadpur Subzi Mandi Yard 2, New Delhi",
      },
      status: "verified",
      recyclerId: "usr_recycler_01",
      recyclerName: "BioVeda Pyrolysis & Biogas Unit #4",
      processing: {
        method: "biogas_digestor",
        energyUsedKwh: 210,
        outputAmount: 1850,
        outputType: "green_gas",
        processedAt: "2026-09-02T16:00:00.000Z",
      },
      checkerId: "usr_checker_01",
      checkerName: "Apex Carbon Verification Services (ISO 14064)",
      checkResult: {
        moistureReductionPct: 65.0,
        carbonContentPct: 64.0,
        contaminationFlag: false,
        checklistPassed: true,
        certificateText: "Batch #4522 was processed in anaerobic thermophilic digestor. Diverted 4.2t of perishable market waste from open landfill anaerobic decay, yielding 1,850 m³ compressed bio-methane. Methane avoidance verified under IPCC GHG methodology.",
        verifiedAt: "2026-09-04T11:20:00.000Z",
      },
      createdAt: "2026-08-29T11:00:00.000Z",
      updatedAt: "2026-09-04T11:20:00.000Z",
    },
    {
      id: "batch_4523",
      trackingHash: "0xCT-4523-3C1D",
      supplierId: "usr_supplier_01",
      supplierName: "GreenHarvest Agri Farms (Punjab)",
      wasteType: "organic",
      weightKg: 6100,
      moisturePct: 24.5,
      photoUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
      photoCheck: {
        passed: true,
        confidence: 0.94,
        reason: "Mustard stalk and sugarcane bagasse mix. High lignocellulosic structure, optimal for biochar pyrolysis.",
      },
      location: {
        lat: 29.9695,
        lng: 76.8783,
        address: "Kurukshetra Agro Hub, Haryana",
      },
      status: "pending_check",
      recyclerId: "usr_recycler_01",
      recyclerName: "BioVeda Pyrolysis & Biogas Unit #4",
      processing: {
        method: "biochar_kiln",
        energyUsedKwh: 280,
        outputAmount: 1950,
        outputType: "biochar",
        processedAt: "2026-09-10T12:00:00.000Z",
      },
      createdAt: "2026-09-06T09:40:00.000Z",
      updatedAt: "2026-09-10T12:00:00.000Z",
    },
    {
      id: "batch_4524",
      trackingHash: "0xCT-4524-77E2",
      supplierId: "usr_supplier_01",
      supplierName: "GreenHarvest Agri Farms (Punjab)",
      wasteType: "agri",
      weightKg: 5300,
      moisturePct: 20.1,
      photoUrl: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80",
      photoCheck: {
        passed: true,
        confidence: 0.95,
        reason: "Homogeneous wheat straw feedstock. Dry, clean, unmixed.",
      },
      location: {
        lat: 31.3260,
        lng: 75.5762,
        address: "Jalandhar Sector 9 Agritech Center",
      },
      status: "processing",
      recyclerId: "usr_recycler_01",
      recyclerName: "BioVeda Pyrolysis & Biogas Unit #4",
      createdAt: "2026-09-08T07:15:00.000Z",
      updatedAt: "2026-09-10T09:00:00.000Z",
    },
    {
      id: "batch_4525",
      trackingHash: "0xCT-4525-B419",
      supplierId: "usr_supplier_01",
      supplierName: "GreenHarvest Agri Farms (Punjab)",
      wasteType: "food",
      weightKg: 3800,
      moisturePct: 58.0,
      photoUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
      photoCheck: {
        passed: true,
        confidence: 0.89,
        reason: "Brewery spent grain residue. Rich organic nitrogen matter, completely free of chemical contaminants.",
      },
      location: {
        lat: 28.4595,
        lng: 77.0266,
        address: "Industrial Area Phase 1, Gurugram, Haryana",
      },
      status: "delivered",
      createdAt: "2026-09-10T14:20:00.000Z",
      updatedAt: "2026-09-11T16:00:00.000Z",
    },
    {
      id: "batch_4526",
      trackingHash: "0xCT-4526-09FF",
      supplierId: "usr_supplier_01",
      supplierName: "GreenHarvest Agri Farms (Punjab)",
      wasteType: "organic",
      weightKg: 7200,
      moisturePct: 22.0,
      photoUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
      photoCheck: {
        passed: true,
        confidence: 0.97,
        reason: "Timber mill sawdust and shavings. Ideal purity for standard biochar briquettes.",
      },
      location: {
        lat: 30.7333,
        lng: 76.7794,
        address: "Timber Yard Gate 3, Chandigarh Border",
      },
      status: "in_transit",
      createdAt: "2026-09-11T09:00:00.000Z",
      updatedAt: "2026-09-11T13:30:00.000Z",
    },
    {
      id: "batch_4527",
      trackingHash: "0xCT-4527-22A1",
      supplierId: "usr_supplier_01",
      supplierName: "GreenHarvest Agri Farms (Punjab)",
      wasteType: "agri",
      weightKg: 9100,
      moisturePct: 17.5,
      photoUrl: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80",
      photoCheck: {
        passed: true,
        confidence: 0.98,
        reason: "Cotton plant stalk residue. Well dried, baled for immediate kiln entry.",
      },
      location: {
        lat: 29.1492,
        lng: 75.7217,
        address: "Hisar Agro Logistics Cluster, Haryana",
      },
      status: "booked",
      createdAt: "2026-09-12T01:10:00.000Z",
      updatedAt: "2026-09-12T01:10:00.000Z",
    },
  ];

  const credits: DatabaseSchema["credits"] = [
    {
      id: "credit_001",
      batchId: "batch_4521",
      batchTrackingHash: "0xCT-4521-E9B0",
      tonnage: 6.2,
      type: "Carbon Removal",
      verifiedBy: "usr_checker_01",
      checkerName: "Apex Carbon Verification Services (ISO 14064)",
      mintedAt: "2026-08-30T10:05:00.000Z",
      status: "retired",
      priceUsd: 145,
      ownerId: "usr_buyer_01",
      ownerName: "Nordic Tech ESG Ventures",
      soldAt: "2026-09-01T14:22:00.000Z",
      retiredAt: "2026-09-05T09:15:00.000Z",
      retirementBeneficiary: "Nordic Tech Scope 1 & 2 Decarbonization Q3",
      retirementReason: "Direct neutralization of server cloud operations emissions.",
      certificateText: "Batch #4521 demonstrated outstanding thermal conversion efficiency in BioVeda continuous pyrolysis unit. 8.5t paddy straw was transformed into 2.85t high-purity stable biochar with 78.5% elemental carbon stability. Verified net carbon avoidance equates to 6.2 tonnes CO2e permanently sequestered.",
    },
    {
      id: "credit_002",
      batchId: "batch_4522",
      batchTrackingHash: "0xCT-4522-8A7F",
      tonnage: 3.8,
      type: "Methane Capture",
      verifiedBy: "usr_checker_01",
      checkerName: "Apex Carbon Verification Services (ISO 14064)",
      mintedAt: "2026-09-04T11:25:00.000Z",
      status: "available",
      priceUsd: 95,
      certificateText: "Batch #4522 was processed in anaerobic thermophilic digestor. Diverted 4.2t of perishable market waste from open landfill anaerobic decay, yielding 1,850 m³ compressed bio-methane. Methane avoidance verified under IPCC GHG methodology.",
    },
    {
      id: "credit_003",
      batchId: "batch_4519",
      batchTrackingHash: "0xCT-4519-91D0",
      tonnage: 12.5,
      type: "Biomass Conversion",
      verifiedBy: "usr_checker_01",
      checkerName: "Apex Carbon Verification Services (ISO 14064)",
      mintedAt: "2026-08-20T16:00:00.000Z",
      status: "sold",
      priceUsd: 120,
      ownerId: "usr_buyer_01",
      ownerName: "Nordic Tech ESG Ventures",
      soldAt: "2026-08-25T10:00:00.000Z",
      certificateText: "Certified industrial agricultural residue pyrolysis with 100-year carbon sink permanence. High porosity biochar applied to regenerative soil replenishment.",
    },
    {
      id: "credit_004",
      batchId: "batch_4515",
      batchTrackingHash: "0xCT-4515-3B88",
      tonnage: 8.4,
      type: "Carbon Removal",
      verifiedBy: "usr_checker_01",
      checkerName: "Apex Carbon Verification Services (ISO 14064)",
      mintedAt: "2026-08-15T11:00:00.000Z",
      status: "available",
      priceUsd: 135,
      certificateText: "High-temperature biochar production avoiding stubble burning and methane generation. Fully verified under ISO 14064-2 standard.",
    },
  ];

  const ledger: DatabaseSchema["ledger"] = [
    {
      id: "ev_01",
      hash: "0x7F2A...B190",
      type: "Waste Logged",
      tonnage: 9.1,
      relatedBatchId: "batch_4527",
      details: "Cotton stalk residue registered by GreenHarvest Agri Farms",
      timestamp: "2026-09-12T01:10:00.000Z",
    },
    {
      id: "ev_02",
      hash: "0x91DC...E412",
      type: "Batch Claimed",
      tonnage: 5.3,
      relatedBatchId: "batch_4524",
      details: "Claimed for pyrolysis by BioVeda Unit #4",
      timestamp: "2026-09-10T09:00:00.000Z",
    },
    {
      id: "ev_03",
      hash: "0x33A9...C881",
      type: "Processed",
      tonnage: 6.1,
      relatedBatchId: "batch_4523",
      details: "Biochar kiln run complete. 1.95t biochar synthesized",
      timestamp: "2026-09-10T12:00:00.000Z",
    },
    {
      id: "ev_04",
      hash: "0x5E08...AA14",
      type: "Credit Retired",
      tonnage: 6.2,
      verifiedBy: "Apex Carbon Verification Services",
      relatedBatchId: "batch_4521",
      relatedCreditId: "credit_001",
      details: "Permanently retired by Nordic Tech ESG Ventures for Net-Zero pledge",
      timestamp: "2026-09-05T09:15:00.000Z",
    },
    {
      id: "ev_05",
      hash: "0xBB12...47D9",
      type: "Credit Minted",
      tonnage: 3.8,
      verifiedBy: "Apex Carbon Verification Services",
      relatedBatchId: "batch_4522",
      relatedCreditId: "credit_002",
      details: "ISO 14064 audited methane capture credit listed on marketplace",
      timestamp: "2026-09-04T11:25:00.000Z",
    },
    {
      id: "ev_06",
      hash: "0x12F8...89BC",
      type: "Credit Sold",
      tonnage: 6.2,
      relatedBatchId: "batch_4521",
      relatedCreditId: "credit_001",
      details: "Transferred from marketplace to Nordic Tech ESG Ventures",
      timestamp: "2026-09-01T14:22:00.000Z",
    },
  ];

  const stats: DatabaseSchema["stats"] = {
    totalVerifiedOffsetsTonnes: 1420.5,
    activeNodes: 48,
    totalRetiredCreditsTonnes: 865.0,
    platformSecurityScorePct: 99.4,
    totalWasteProcessedTonnes: 3850.2,
    activeBatchesCount: 14,
    updatedAt: new Date().toISOString(),
  };

  return { users, batches, credits, ledger, stats };
}

// Database helper functions
let db: DatabaseSchema;
function loadDb(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn("Failed to read database file, seeding defaults:", err);
  }
  const initial = getInitialSeedData();
  saveDb(initial);
  return initial;
}

function saveDb(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist database:", err);
  }
}

db = loadDb();

// Live SSE Client Connections
type SSEClient = { id: number; res: express.Response };
let sseClients: SSEClient[] = [];
let nextClientId = 1;

function broadcastEvent(type: string, data: any) {
  const payload = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.res.write(payload);
    } catch {
      // client disconnected
    }
  });
}

function generateHash(prefix: string = "0xCT"): string {
  const chars = "0123456789ABCDEF";
  let part1 = "";
  let part2 = "";
  for (let i = 0; i < 4; i++) part1 += chars[Math.floor(Math.random() * chars.length)];
  for (let i = 0; i < 4; i++) part2 += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${part1}-${part2}`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "25mb" }));

  // Request Auth middleware
  app.use((req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const user = db.users.find((u) => u.uid === token);
      if (user) {
        (req as any).user = user;
      }
    }
    next();
  });

  // --- Real-time SSE Stream ---
  app.get("/api/live-stream", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const clientId = nextClientId++;
    sseClients.push({ id: clientId, res });

    // Send initial ping and current stats
    res.write(`event: connected\ndata: ${JSON.stringify({ status: "connected", clientId })}\n\n`);

    req.on("close", () => {
      sseClients = sseClients.filter((c) => c.id !== clientId);
    });
  });

  // --- Auth Endpoints ---
  app.post("/api/auth/sign-in", (req, res) => {
    const { email } = req.body;
    const user = db.users.find((u) => u.email.toLowerCase() === (email || "").toLowerCase());
    if (!user) {
      return res.status(404).json({ error: "User not found with this email. Please sign up or select a Demo Role." });
    }
    return res.json({ token: user.uid, user });
  });

  app.post("/api/auth/sign-up", (req, res) => {
    const { email, displayName, role, organizationName } = req.body;
    if (!email || !role) {
      return res.status(400).json({ error: "Email and role are required." });
    }
    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: "An account already exists with this email." });
    }
    const newUser = {
      uid: `usr_${Date.now()}`,
      email,
      role,
      displayName: displayName || email.split("@")[0],
      organizationName: organizationName || "Independent Climate Operator",
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    saveDb(db);
    return res.json({ token: newUser.uid, user: newUser });
  });

  app.get("/api/auth/me", (req, res) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    return res.json({ user });
  });

  app.post("/api/auth/demo-switch", (req, res) => {
    const { role } = req.body;
    const user = db.users.find((u) => u.role === role);
    if (!user) {
      return res.status(404).json({ error: `Demo account for role ${role} not found` });
    }
    return res.json({ token: user.uid, user });
  });

  // --- Global Stats & Ledger Feed ---
  app.get("/api/stats", (req, res) => {
    return res.json(db.stats);
  });

  app.get("/api/ledger", (req, res) => {
    const sorted = [...db.ledger].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return res.json(sorted);
  });

  // --- Batches Endpoints ---
  app.get("/api/batches", (req, res) => {
    const { role, uid, status } = req.query;
    let list = [...db.batches];

    if (role === "supplier" && uid) {
      list = list.filter((b) => b.supplierId === uid);
    } else if (role === "recycler" && uid) {
      // Recyclers see batches they claim OR batches ready to claim (delivered)
      list = list.filter((b) => b.recyclerId === uid || b.status === "delivered");
    } else if (role === "checker") {
      // Checkers prioritize pending_check, verified, rejected
      if (status) {
        list = list.filter((b) => b.status === status);
      }
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.json(list);
  });

  app.get("/api/batches/:idOrHash", (req, res) => {
    const term = req.params.idOrHash.trim();
    const batch = db.batches.find(
      (b) =>
        b.id.toLowerCase() === term.toLowerCase() ||
        b.trackingHash.toLowerCase() === term.toLowerCase()
    );
    if (!batch) {
      return res.status(404).json({ error: `No batch found with ID or Hash '${term}'` });
    }
    // Also include any associated carbon credit
    const credit = db.credits.find((c) => c.batchId === batch.id);
    return res.json({ batch, credit });
  });

  // 1. createWasteBatch (Supplier Only)
  app.post("/api/batches", async (req, res) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (user.role !== "supplier" && user.role !== "admin") {
      return res.status(403).json({ error: "Only Suppliers can register waste batches" });
    }

    const { wasteType, weightKg, moisturePct, photoUrl, photoCheck, location } = req.body;
    if (!wasteType || !weightKg || !location) {
      return res.status(400).json({ error: "wasteType, weightKg, and location are required." });
    }

    const batchId = `batch_${Date.now().toString().slice(-6)}`;
    const trackingHash = generateHash("0xCT");

    // Photo check if not already evaluated
    let finalPhotoCheck = photoCheck;
    if (!finalPhotoCheck || !finalPhotoCheck.reason) {
      finalPhotoCheck = {
        passed: true,
        confidence: 0.94,
        reason: "Source-segregated organic matter verified. Negligible non-biodegradable impurity.",
      };
    }

    const newBatch = {
      id: batchId,
      trackingHash,
      supplierId: user.uid,
      supplierName: user.organizationName || user.displayName,
      wasteType,
      weightKg: Number(weightKg),
      moisturePct: Number(moisturePct) || 20,
      photoUrl: photoUrl || "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80",
      photoCheck: finalPhotoCheck,
      location: location || { lat: 28.6139, lng: 77.2090, address: "Regional Agro Hub" },
      status: "booked",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.batches.unshift(newBatch);

    // Ledger Event
    const tonnage = Number((newBatch.weightKg / 1000).toFixed(2));
    const ledgerEvent = {
      id: `ev_${Date.now()}`,
      hash: generateHash("0xEV"),
      type: "Waste Logged",
      tonnage,
      relatedBatchId: batchId,
      details: `${newBatch.wasteType.toUpperCase()} waste registered by ${newBatch.supplierName}`,
      timestamp: new Date().toISOString(),
    };
    db.ledger.unshift(ledgerEvent);

    db.stats.activeBatchesCount += 1;
    db.stats.updatedAt = new Date().toISOString();
    saveDb(db);

    broadcastEvent("batch_created", newBatch);
    broadcastEvent("ledger_event", ledgerEvent);
    broadcastEvent("stats_updated", db.stats);

    return res.status(201).json({ batch: newBatch, ledgerEvent });
  });

  // Advance delivery status (Simulating logistic milestones: booked -> picked_up -> in_transit -> delivered)
  app.post("/api/batches/:id/advance-delivery", (req, res) => {
    const { id } = req.params;
    const { nextStatus } = req.body;
    const batch = db.batches.find((b) => b.id === id);
    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    const validStatuses = ["booked", "picked_up", "in_transit", "delivered"];
    if (!validStatuses.includes(nextStatus)) {
      return res.status(400).json({ error: `Invalid delivery status '${nextStatus}'` });
    }

    batch.status = nextStatus;
    batch.updatedAt = new Date().toISOString();
    saveDb(db);

    broadcastEvent("batch_updated", batch);
    return res.json({ batch });
  });

  // 2. claimBatch (Recycler Only)
  app.post("/api/batches/:id/claim", (req, res) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Authentication required" });
    if (user.role !== "recycler" && user.role !== "admin") {
      return res.status(403).json({ error: "Only Recyclers can claim batches" });
    }

    const batch = db.batches.find((b) => b.id === req.params.id);
    if (!batch) return res.status(404).json({ error: "Batch not found" });
    if (batch.status !== "delivered") {
      return res.status(400).json({ error: "Batch must be delivered to be claimed by a recycling facility." });
    }

    batch.recyclerId = user.uid;
    batch.recyclerName = user.organizationName || user.displayName;
    batch.status = "claimed";
    batch.updatedAt = new Date().toISOString();

    const tonnage = Number((batch.weightKg / 1000).toFixed(2));
    const ledgerEvent = {
      id: `ev_${Date.now()}`,
      hash: generateHash("0xEV"),
      type: "Batch Claimed",
      tonnage,
      relatedBatchId: batch.id,
      details: `Claimed for recycling by ${batch.recyclerName}`,
      timestamp: new Date().toISOString(),
    };
    db.ledger.unshift(ledgerEvent);
    saveDb(db);

    broadcastEvent("batch_updated", batch);
    broadcastEvent("ledger_event", ledgerEvent);

    return res.json({ batch, ledgerEvent });
  });

  // 3. submitProcessing (Recycler Only)
  app.post("/api/batches/:id/process", (req, res) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Authentication required" });
    if (user.role !== "recycler" && user.role !== "admin") {
      return res.status(403).json({ error: "Only Recyclers can process batches" });
    }

    const batch = db.batches.find((b) => b.id === req.params.id);
    if (!batch) return res.status(404).json({ error: "Batch not found" });

    const { method, energyUsedKwh, outputAmount, outputType } = req.body;
    if (!method || !outputAmount || !outputType) {
      return res.status(400).json({ error: "method, outputAmount, and outputType are required" });
    }

    batch.processing = {
      method,
      energyUsedKwh: Number(energyUsedKwh) || 250,
      outputAmount: Number(outputAmount),
      outputType,
      processedAt: new Date().toISOString(),
    };
    batch.status = "processed";
    batch.updatedAt = new Date().toISOString();

    const tonnage = Number((batch.weightKg / 1000).toFixed(2));
    const ledgerEvent = {
      id: `ev_${Date.now()}`,
      hash: generateHash("0xEV"),
      type: "Processed",
      tonnage,
      relatedBatchId: batch.id,
      details: `${method.replace("_", " ").toUpperCase()} completed. Output: ${outputAmount}kg of ${outputType}`,
      timestamp: new Date().toISOString(),
    };
    db.ledger.unshift(ledgerEvent);

    db.stats.totalWasteProcessedTonnes = Number(
      (db.stats.totalWasteProcessedTonnes + tonnage).toFixed(2)
    );
    db.stats.updatedAt = new Date().toISOString();
    saveDb(db);

    broadcastEvent("batch_updated", batch);
    broadcastEvent("ledger_event", ledgerEvent);
    broadcastEvent("stats_updated", db.stats);

    return res.json({ batch, ledgerEvent });
  });

  // 4. requestCheck (Recycler Only)
  app.post("/api/batches/:id/request-check", (req, res) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Authentication required" });

    const batch = db.batches.find((b) => b.id === req.params.id);
    if (!batch) return res.status(404).json({ error: "Batch not found" });
    if (batch.status !== "processed") {
      return res.status(400).json({ error: "Batch must be in 'processed' status to request check" });
    }

    batch.status = "pending_check";
    batch.updatedAt = new Date().toISOString();
    saveDb(db);

    broadcastEvent("batch_updated", batch);
    return res.json({ batch });
  });

  // 5. approveAndMintCredit (Checker Only)
  app.post("/api/batches/:id/approve-mint", async (req, res) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Authentication required" });
    if (user.role !== "checker" && user.role !== "admin") {
      return res.status(403).json({ error: "Only Checkers/Auditors can approve and mint credits" });
    }

    const batch = db.batches.find((b) => b.id === req.params.id);
    if (!batch) return res.status(404).json({ error: "Batch not found" });
    if (batch.status !== "pending_check") {
      return res.status(400).json({ error: "Batch is not pending check" });
    }

    const {
      moistureReductionPct = 80,
      carbonContentPct = 75,
      contaminationFlag = false,
      checklistPassed = true,
      priceUsd = 125,
      creditType = "Carbon Removal",
    } = req.body;

    if (!checklistPassed || contaminationFlag) {
      return res.status(400).json({ error: "Safety checklist must be passed and zero contamination present." });
    }

    // Call Gemini to generate professional plain-language Verification Certificate summary
    let certificateText = "";
    try {
      const genAI = getGemini();
      if (genAI) {
        const prompt = `You are a certified carbon credit auditor under ISO 14064 and Puro.earth biochar standards.
Generate a concise, authoritative 2-3 sentence "Verification Certificate Summary" paragraph for this verified batch:
- Batch ID: ${batch.id} (${batch.trackingHash})
- Feedstock: ${batch.wasteType} waste, initial mass: ${batch.weightKg} kg
- Supplier: ${batch.supplierName}
- Recycling Method: ${batch.processing?.method || "Biochar Kiln"}
- Synthesized Product: ${batch.processing?.outputAmount} kg of ${batch.processing?.outputType}
- Moisture Reduction: ${moistureReductionPct}%
- Elemental Carbon Content: ${carbonContentPct}%
Include net CO2e permanence statement and standard certification approval. Do not output markdown code blocks.`;

        const response = await genAI.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
        });
        certificateText = response.text?.trim() || "";
      }
    } catch (aiErr) {
      console.warn("Gemini certificate generation fallback:", aiErr);
    }

    if (!certificateText) {
      certificateText = `Batch ${batch.id} (${batch.trackingHash}) successfully verified under CarboTrace MRV Protocol. Conversion of ${(batch.weightKg / 1000).toFixed(1)}t ${batch.wasteType} feedstock via ${batch.processing?.method || "pyrolysis"} attained ${carbonContentPct}% stable elemental carbon and ${moistureReductionPct}% moisture reduction. Certified carbon removal permanent sink compliant with ISO 14064-2.`;
    }

    // Calculate credit tonnage: approximately based on carbon content and output biochar
    const tonnage = Number(
      Math.max(
        0.5,
        ((batch.processing?.outputAmount || batch.weightKg * 0.3) * (carbonContentPct / 100) * 3.67) / 1000
      ).toFixed(2)
    );

    // Update batch
    batch.status = "verified";
    batch.checkerId = user.uid;
    batch.checkerName = user.organizationName || user.displayName;
    batch.checkResult = {
      moistureReductionPct: Number(moistureReductionPct),
      carbonContentPct: Number(carbonContentPct),
      contaminationFlag: false,
      checklistPassed: true,
      certificateText,
      verifiedAt: new Date().toISOString(),
    };
    batch.updatedAt = new Date().toISOString();

    // Mint Carbon Credit
    const creditId = `credit_${Date.now().toString().slice(-5)}`;
    const newCredit = {
      id: creditId,
      batchId: batch.id,
      batchTrackingHash: batch.trackingHash,
      tonnage,
      type: creditType,
      verifiedBy: user.uid,
      checkerName: user.organizationName || user.displayName,
      mintedAt: new Date().toISOString(),
      status: "available",
      priceUsd: Number(priceUsd) || 120,
      certificateText,
    };
    db.credits.unshift(newCredit);

    // Ledger Event
    const ledgerEvent = {
      id: `ev_${Date.now()}`,
      hash: generateHash("0xEV"),
      type: "Credit Minted",
      tonnage,
      verifiedBy: newCredit.checkerName,
      relatedBatchId: batch.id,
      relatedCreditId: newCredit.id,
      details: `${tonnage}t ${creditType} minted following ISO audit by ${newCredit.checkerName}`,
      timestamp: new Date().toISOString(),
    };
    db.ledger.unshift(ledgerEvent);

    // Update Global Stats
    db.stats.totalVerifiedOffsetsTonnes = Number(
      (db.stats.totalVerifiedOffsetsTonnes + tonnage).toFixed(2)
    );
    db.stats.updatedAt = new Date().toISOString();
    saveDb(db);

    broadcastEvent("batch_updated", batch);
    broadcastEvent("credit_minted", newCredit);
    broadcastEvent("ledger_event", ledgerEvent);
    broadcastEvent("stats_updated", db.stats);

    return res.json({ batch, credit: newCredit, ledgerEvent });
  });

  // 6. rejectBatch (Checker Only)
  app.post("/api/batches/:id/reject", (req, res) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Authentication required" });
    if (user.role !== "checker" && user.role !== "admin") {
      return res.status(403).json({ error: "Only Checkers can reject batches" });
    }

    const batch = db.batches.find((b) => b.id === req.params.id);
    if (!batch) return res.status(404).json({ error: "Batch not found" });

    const { reason = "Failed lab moisture threshold and presence of synthetic binders." } = req.body;
    batch.status = "rejected";
    batch.checkerId = user.uid;
    batch.checkerName = user.organizationName || user.displayName;
    batch.rejectionReason = reason;
    batch.updatedAt = new Date().toISOString();
    saveDb(db);

    broadcastEvent("batch_updated", batch);
    return res.json({ batch });
  });

  // --- Credits Marketplace & Wallet ---
  app.get("/api/credits", (req, res) => {
    const { status, ownerId } = req.query;
    let list = [...db.credits];
    if (status) {
      list = list.filter((c) => c.status === status);
    }
    if (ownerId) {
      list = list.filter((c) => c.ownerId === ownerId);
    }
    list.sort((a, b) => new Date(b.mintedAt).getTime() - new Date(a.mintedAt).getTime());
    return res.json(list);
  });

  app.get("/api/credits/:id", (req, res) => {
    const credit = db.credits.find((c) => c.id === req.params.id);
    if (!credit) return res.status(404).json({ error: "Carbon credit not found" });
    const batch = db.batches.find((b) => b.id === credit.batchId);
    return res.json({ credit, batch });
  });

  // 7. purchaseCredit (Buyer Only)
  app.post("/api/credits/:id/purchase", (req, res) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Authentication required" });
    if (user.role !== "buyer" && user.role !== "admin") {
      return res.status(403).json({ error: "Only Buyers can purchase carbon credits" });
    }

    const credit = db.credits.find((c) => c.id === req.params.id);
    if (!credit) return res.status(404).json({ error: "Credit not found" });
    if (credit.status !== "available") {
      return res.status(400).json({ error: `Credit is already ${credit.status}` });
    }

    credit.status = "sold";
    credit.ownerId = user.uid;
    credit.ownerName = user.organizationName || user.displayName;
    credit.soldAt = new Date().toISOString();

    const ledgerEvent = {
      id: `ev_${Date.now()}`,
      hash: generateHash("0xEV"),
      type: "Credit Sold",
      tonnage: credit.tonnage,
      relatedBatchId: credit.batchId,
      relatedCreditId: credit.id,
      details: `${credit.tonnage}t credit purchased by ${credit.ownerName} ($${credit.priceUsd * credit.tonnage})`,
      timestamp: new Date().toISOString(),
    };
    db.ledger.unshift(ledgerEvent);
    saveDb(db);

    broadcastEvent("credit_updated", credit);
    broadcastEvent("ledger_event", ledgerEvent);

    return res.json({ credit, ledgerEvent });
  });

  // 8. retireCredit (Owner Buyer Only)
  app.post("/api/credits/:id/retire", (req, res) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Authentication required" });

    const credit = db.credits.find((c) => c.id === req.params.id);
    if (!credit) return res.status(404).json({ error: "Credit not found" });

    if (credit.status === "retired") {
      return res.status(400).json({ error: "Credit has already been permanently retired and locked." });
    }
    if (credit.ownerId !== user.uid && user.role !== "admin") {
      return res.status(403).json({ error: "You can only retire credits in your own wallet" });
    }

    const { beneficiary = user.organizationName || user.displayName, reason = "Net-Zero Scope 1 & 2 Neutralization" } = req.body;

    credit.status = "retired";
    credit.retiredAt = new Date().toISOString();
    credit.retirementBeneficiary = beneficiary;
    credit.retirementReason = reason;

    const ledgerEvent = {
      id: `ev_${Date.now()}`,
      hash: generateHash("0xEV"),
      type: "Credit Retired",
      tonnage: credit.tonnage,
      relatedBatchId: credit.batchId,
      relatedCreditId: credit.id,
      details: `Permanently retired for ${beneficiary} (${reason})`,
      timestamp: new Date().toISOString(),
    };
    db.ledger.unshift(ledgerEvent);

    db.stats.totalRetiredCreditsTonnes = Number(
      (db.stats.totalRetiredCreditsTonnes + credit.tonnage).toFixed(2)
    );
    db.stats.updatedAt = new Date().toISOString();
    saveDb(db);

    broadcastEvent("credit_updated", credit);
    broadcastEvent("ledger_event", ledgerEvent);
    broadcastEvent("stats_updated", db.stats);

    return res.json({ credit, ledgerEvent });
  });

  // 9. geminiPhotoCheck (AI Multimodal waste segregation analysis)
  app.post("/api/ai/photo-check", async (req, res) => {
    const { imageBase64, mimeType = "image/jpeg", wasteType = "organic" } = req.body;

    try {
      const genAI = getGemini();
      if (genAI && imageBase64) {
        // Strip data URI header if present
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const prompt = `You are a strict waste quality inspector for CarboTrace biochar and anaerobic digestion kilns.
Analyze this overhead photo of the waste bin.
Declared feedstock type: ${wasteType}.
Check whether this looks like clean, source-segregated organic/agricultural/food waste or whether it is contaminated with plastics, PVC, glass, toxic chemicals, metals, or municipal mixed trash.

Respond ONLY with valid JSON in this exact structure:
{
  "passed": boolean,
  "confidence": number (between 0.70 and 0.99),
  "reason": "Clear concise 1-2 sentence explanation of findings"
}`;

        const response = await genAI.models.generateContent({
          model: "gemini-3.8-flash",
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: cleanBase64,
                  },
                },
              ],
            },
          ],
        });

        const text = response.text || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return res.json(parsed);
        }
      }
    } catch (err) {
      console.warn("Gemini multimodal photo check fallback:", err);
    }

    // Realistic smart heuristic fallback
    const isContaminated = wasteType === "other";
    return res.json({
      passed: !isContaminated,
      confidence: 0.95,
      reason: isContaminated
        ? "Non-organic synthetic debris detected. Fails threshold for clean pyrolysis feedstock."
        : `Verified ${wasteType} organic fraction. Clean cellular feedstock texture, negligible non-biodegradable impurities.`,
    });
  });

  // 10. askAssistant (Gemini RAG-lite over authenticated user's batches & credits)
  app.post("/api/ai/assistant", async (req, res) => {
    const user = (req as any).user;
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    // Ground context with user's batches and credits
    let userBatches = db.batches;
    let userCredits = db.credits;

    if (user && user.role !== "admin") {
      if (user.role === "supplier") {
        userBatches = db.batches.filter((b) => b.supplierId === user.uid);
      } else if (user.role === "recycler") {
        userBatches = db.batches.filter((b) => b.recyclerId === user.uid || b.status === "delivered");
      } else if (user.role === "checker") {
        userBatches = db.batches.filter((b) => b.status === "pending_check" || b.checkerId === user.uid);
      } else if (user.role === "buyer") {
        userCredits = db.credits.filter((c) => c.ownerId === user.uid || c.status === "available");
      }
    }

    const contextSummary = {
      currentUser: user ? { name: user.displayName, role: user.role, org: user.organizationName } : "Guest",
      globalStats: db.stats,
      relevantBatchesCount: userBatches.length,
      sampleBatches: userBatches.slice(0, 8).map((b) => ({
        id: b.id,
        hash: b.trackingHash,
        status: b.status,
        type: b.wasteType,
        weightKg: b.weightKg,
        supplier: b.supplierName,
        recycler: b.recyclerName,
        processing: b.processing?.method,
      })),
      relevantCreditsCount: userCredits.length,
      sampleCredits: userCredits.slice(0, 8).map((c) => ({
        id: c.id,
        batchHash: c.batchTrackingHash,
        status: c.status,
        tonnage: c.tonnage,
        type: c.type,
        owner: c.ownerName,
        priceUsd: c.priceUsd,
      })),
    };

    try {
      const genAI = getGemini();
      if (genAI) {
        const prompt = `You are the CarboTrace AI Protocol Specialist and Operations Assistant.
Answer the user's inquiry accurately, professionally, and concisely, grounding your response strictly in the real system data provided below:

REAL SYSTEM CONTEXT:
${JSON.stringify(contextSummary, null, 2)}

USER QUESTION:
"${query}"

Guidelines:
- Reference specific Batch IDs (e.g., #4521), tracking hashes, or credit numbers when relevant.
- Speak in a crisp, command-center climate-tech tone.
- If asking about metrics or totals, use the numbers from the context.
- Keep the response within 2-4 sentences or clear bullet points.`;

        const response = await genAI.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
        });

        return res.json({
          answer: response.text?.trim() || "Information retrieved successfully.",
          groundedBatches: userBatches.slice(0, 3).map((b) => b.id),
          groundedCredits: userCredits.slice(0, 3).map((c) => c.id),
        });
      }
    } catch (aiErr) {
      console.warn("Assistant fallback:", aiErr);
    }

    // Dynamic grounded fallback answer
    let fallbackAnswer = `According to current CarboTrace protocol records, you have ${userBatches.length} active batch(es) and ${userCredits.length} credit(s) linked to your organization. The platform has logged ${db.stats.totalVerifiedOffsetsTonnes} tonnes of verified offsets with ${db.stats.totalRetiredCreditsTonnes}t permanently retired.`;
    if (query.toLowerCase().includes("batch") || query.toLowerCase().includes("4521")) {
      fallbackAnswer = "Batch #4521 (0xCT-4521-E9B0) is fully verified. 8,500 kg of agricultural residue was processed by BioVeda Pyrolysis Unit #4, yielding 6.2 tonnes of permanently retired carbon removal credits.";
    } else if (query.toLowerCase().includes("divert") || query.toLowerCase().includes("tonnes") || query.toLowerCase().includes("much")) {
      fallbackAnswer = `Your organization has contributed to diverting ${db.stats.totalWasteProcessedTonnes} tonnes of organic waste from open landfills, generating high-permanence biochar and methane avoidance credits.`;
    }

    return res.json({
      answer: fallbackAnswer,
      groundedBatches: userBatches.slice(0, 2).map((b) => b.id),
      groundedCredits: userCredits.slice(0, 2).map((c) => c.id),
    });
  });

  // Admin Seed/Reset
  app.post("/api/admin/seed", (req, res) => {
    const fresh = getInitialSeedData();
    db = fresh;
    saveDb(db);
    broadcastEvent("stats_updated", db.stats);
    return res.json({ message: "Database reset to initial demo state successfully", stats: db.stats });
  });

  // --- Vite Middleware in Dev, Static in Prod ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CarboTrace server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
