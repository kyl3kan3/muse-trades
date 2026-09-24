import type { Shop } from "./types";

export const SHOPS: Shop[] = [
  {
    id: "stl-comfort-hvac",
    name: "River City Comfort",
    trade: "hvac",
    city: "Columbia",
    state: "IL",
    serviceArea: [
      "Columbia",
      "Waterloo",
      "Valmeyer",
      "Dupo",
      "Millstadt",
      "Belleville",
      "St. Louis",
      "Kirkwood",
      "Webster Groves",
      "Affton",
    ],
    phone: "618-555-0142",
    depositCents: 15000,
    holdMinutes: 15,
    hours: { start: "08:00", end: "17:00" },
    days: [1, 2, 3, 4, 5],
  },
  {
    id: "stl-metro-plumb",
    name: "Metro East Plumbing",
    trade: "plumbing",
    city: "Belleville",
    state: "IL",
    serviceArea: [
      "Belleville",
      "O'Fallon",
      "Collinsville",
      "Fairview Heights",
      "Swansea",
      "Columbia",
      "Waterloo",
      "St. Louis",
    ],
    phone: "618-555-0198",
    depositCents: 10000,
    holdMinutes: 15,
    hours: { start: "07:30", end: "16:30" },
    days: [1, 2, 3, 4, 5, 6],
  },
];

export function getShop(id: string) {
  return SHOPS.find((s) => s.id === id);
}

export function findShops(opts: { trade?: string; city?: string }) {
  return SHOPS.filter((s) => {
    if (opts.trade && s.trade !== opts.trade) return false;
    if (opts.city) {
      const city = opts.city.toLowerCase();
      const hit =
        s.city.toLowerCase() === city ||
        s.serviceArea.some((a) => a.toLowerCase() === city);
      if (!hit) return false;
    }
    return true;
  });
}
