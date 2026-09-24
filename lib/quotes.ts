import type { Quote, QuoteRequest, ServiceType, Shop } from "./types";
import { findShops, getShop } from "./shops";

const HVAC: Record<string, { low: number; high: number; includes: string[]; excludes: string[] }> = {
  ac_replace: {
    low: 480000,
    high: 920000,
    includes: ["Remove old condenser", "Set new 14-16 SEER unit", "Line-set reconnection", "Startup and charge"],
    excludes: ["Duct redesign", "Electrical panel upgrade", "Permit fees if city-required", "Indoor coil if incompatible"],
  },
  ac_repair: {
    low: 18900,
    high: 78000,
    includes: ["Diagnostic", "First hour on site", "Standard capacitor or contactor if that is the fail"],
    excludes: ["Compressor", "Coil replacement", "Refrigerant beyond 2 lb"],
  },
  furnace_replace: {
    low: 380000,
    high: 780000,
    includes: ["Remove old furnace", "Set 80-96% unit", "Vent and gas reconnect", "Safety test"],
    excludes: ["New flue chase", "Gas line upsize", "Humidifier"],
  },
  furnace_repair: {
    low: 16900,
    high: 64000,
    includes: ["Diagnostic", "First hour", "Ignitor or flame sensor if that is the fail"],
    excludes: ["Heat exchanger", "Control board special-order"],
  },
  maintenance: {
    low: 12900,
    high: 21900,
    includes: ["16-point inspection", "Filter check", "Coil rinse if accessible", "Amp draw"],
    excludes: ["New filter stock beyond one", "Refrigerant"],
  },
};

const PLUMBING: Record<string, { low: number; high: number; includes: string[]; excludes: string[] }> = {
  water_heater: {
    low: 160000,
    high: 380000,
    includes: ["Pull old tank", "Set 40-50 gal gas or electric", "Pan and expansion if code", "Startup"],
    excludes: ["Tankless conversion", "Vent redesign", "Permit if city-required"],
  },
  drain: {
    low: 14900,
    high: 42000,
    includes: ["Camera or snake through the reported fixture", "Clear common blockage"],
    excludes: ["Main line excavation", "Broken clay replacement"],
  },
  leak: {
    low: 18900,
    high: 64000,
    includes: ["Locate accessible leak", "Repair one joint or supply"],
    excludes: ["Slab leak", "Full wall demo"],
  },
  repipe: {
    low: 650000,
    high: 1800000,
    includes: ["Estimate range only", "Site visit required"],
    excludes: ["Finish carpentry", "Tile reset"],
  },
  other: {
    low: 12900,
    high: 89000,
    includes: ["Diagnostic visit"],
    excludes: ["Parts not identified until on site"],
  },
};

function baseFor(trade: Shop["trade"], service: ServiceType) {
  const table = trade === "hvac" ? HVAC : PLUMBING;
  return table[service] ?? table.other ?? PLUMBING.other;
}

function ageMultiplier(unitYear?: number) {
  if (!unitYear) return 1;
  const age = new Date().getFullYear() - unitYear;
  if (age >= 18) return 1.18;
  if (age >= 12) return 1.08;
  return 1;
}

function sizeMultiplier(sqft?: number, tonnage?: number) {
  if (tonnage) {
    if (tonnage >= 5) return 1.35;
    if (tonnage >= 4) return 1.2;
    if (tonnage <= 2) return 0.88;
  }
  if (sqft) {
    if (sqft >= 2800) return 1.28;
    if (sqft >= 2200) return 1.12;
    if (sqft <= 1200) return 0.9;
  }
  return 1;
}

export function pickShop(req: QuoteRequest): Shop | undefined {
  if (req.shopId) return getShop(req.shopId);
  const matches = findShops({ trade: req.trade, city: req.city });
  return matches[0];
}

export function buildQuote(req: QuoteRequest): Quote | { error: string } {
  const shop = pickShop(req);
  if (!shop) {
    return { error: "No shop covers that trade and city yet. Name a St. Louis metro city or a shopId." };
  }

  const base = baseFor(shop.trade, req.serviceType);
  const factor = ageMultiplier(req.unitYear) * sizeMultiplier(req.squareFootage, req.tonnage);
  const low = Math.round(base.low * factor);
  const high = Math.round(base.high * factor);
  const spread = high - low;
  const needsHuman = spread > 400000 || req.serviceType === "repipe" || !req.serviceType;

  const id = `q_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const createdAt = new Date().toISOString();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString();

  return {
    id,
    shopId: shop.id,
    shopName: shop.name,
    serviceType: req.serviceType,
    lowCents: low,
    highCents: high,
    depositCents: shop.depositCents,
    currency: "usd",
    includes: base.includes,
    excludes: base.excludes,
    needsHuman,
    rationale: needsHuman
      ? "Range is wide. Book a diagnostic slot and a tech will lock the number on site."
      : "Range is from the shop's current sheet for this spec in the St. Louis metro.",
    createdAt,
    expiresAt: expires,
  };
}

export function money(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}
