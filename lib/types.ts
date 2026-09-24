export type Trade = "hvac" | "plumbing";

export type ServiceType =
  | "ac_replace"
  | "ac_repair"
  | "furnace_replace"
  | "furnace_repair"
  | "maintenance"
  | "water_heater"
  | "drain"
  | "leak"
  | "repipe"
  | "other";

export type Shop = {
  id: string;
  name: string;
  trade: Trade;
  city: string;
  state: string;
  serviceArea: string[];
  phone: string;
  depositCents: number;
  holdMinutes: number;
  hours: { start: string; end: string };
  days: number[];
};

export type QuoteRequest = {
  shopId?: string;
  trade?: Trade;
  serviceType: ServiceType;
  city?: string;
  zip?: string;
  squareFootage?: number;
  tonnage?: number;
  unitYear?: number;
  description?: string;
};

export type Quote = {
  id: string;
  shopId: string;
  shopName: string;
  serviceType: ServiceType;
  lowCents: number;
  highCents: number;
  depositCents: number;
  currency: "usd";
  includes: string[];
  excludes: string[];
  needsHuman: boolean;
  rationale: string;
  createdAt: string;
  expiresAt: string;
};

export type Slot = {
  start: string;
  end: string;
  available: boolean;
};

export type Hold = {
  id: string;
  shopId: string;
  quoteId: string;
  slotStart: string;
  slotEnd: string;
  status: "held" | "expired" | "converted";
  expiresAt: string;
  createdAt: string;
};

export type Booking = {
  id: string;
  shopId: string;
  quoteId: string;
  holdId?: string;
  slotStart: string;
  slotEnd: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  address: string;
  depositCents: number;
  paymentUrl: string;
  status: "pending_deposit" | "booked" | "needs_human";
  createdAt: string;
};

export type OwnerEvent = {
  id: string;
  kind: "quote" | "hold" | "booking";
  shopId: string;
  summary: string;
  payload: unknown;
  createdAt: string;
};
