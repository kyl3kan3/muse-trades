import type { Booking, Hold, OwnerEvent, Quote } from "./types";

const quotes = new Map<string, Quote>();
const holds = new Map<string, Hold>();
const bookings = new Map<string, Booking>();
const events: OwnerEvent[] = [];

export const store = {
  quotes,
  holds,
  bookings,
  events,
  putQuote(q: Quote) {
    quotes.set(q.id, q);
    pushEvent("quote", q.shopId, `${q.shopName} quoted ${q.serviceType}`, q);
  },
  putHold(h: Hold) {
    holds.set(h.id, h);
    pushEvent("hold", h.shopId, `Slot held until ${h.expiresAt}`, h);
  },
  putBooking(b: Booking) {
    bookings.set(b.id, b);
    pushEvent("booking", b.shopId, `${b.customerName} booked ${b.slotStart}`, b);
  },
};

function pushEvent(kind: OwnerEvent["kind"], shopId: string, summary: string, payload: unknown) {
  events.unshift({
    id: `e_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    kind,
    shopId,
    summary,
    payload,
    createdAt: new Date().toISOString(),
  });
  if (events.length > 200) events.pop();
}

export function expireHolds() {
  const now = Date.now();
  for (const hold of holds.values()) {
    if (hold.status === "held" && Date.parse(hold.expiresAt) <= now) {
      hold.status = "expired";
    }
  }
}
