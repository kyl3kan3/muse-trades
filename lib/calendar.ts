import type { Shop, Slot } from "./types";
import { store, expireHolds } from "./store";

function atTime(day: Date, hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(day);
  d.setHours(h, m, 0, 0);
  return d;
}

export function listSlots(shop: Shop, fromISO?: string, days = 5): Slot[] {
  expireHolds();
  const start = fromISO ? new Date(fromISO) : new Date();
  start.setHours(0, 0, 0, 0);
  const slots: Slot[] = [];

  for (let i = 0; i < 10 && slots.length < days * 6; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    if (!shop.days.includes(day.getDay())) continue;

    const open = atTime(day, shop.hours.start);
    const close = atTime(day, shop.hours.end);
    for (let t = open.getTime(); t + 90 * 60 * 1000 <= close.getTime(); t += 90 * 60 * 1000) {
      const slotStart = new Date(t);
      const slotEnd = new Date(t + 90 * 60 * 1000);
      const taken =
        [...store.holds.values()].some(
          (h) => h.shopId === shop.id && h.status === "held" && h.slotStart === slotStart.toISOString()
        ) ||
        [...store.bookings.values()].some(
          (b) => b.shopId === shop.id && b.slotStart === slotStart.toISOString() && b.status !== "needs_human"
        );
      slots.push({
        start: slotStart.toISOString(),
        end: slotEnd.toISOString(),
        available: !taken && slotStart.getTime() > Date.now() + 60 * 60 * 1000,
      });
    }
  }
  return slots;
}
