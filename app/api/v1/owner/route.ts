import { NextRequest, NextResponse } from "next/server";
import { store, expireHolds } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  expireHolds();
  const shopId = req.nextUrl.searchParams.get("shopId") ?? undefined;
  const events = store.events.filter((e) => !shopId || e.shopId === shopId).slice(0, 50);
  const bookings = [...store.bookings.values()].filter((b) => !shopId || b.shopId === shopId);
  const holds = [...store.holds.values()].filter((h) => !shopId || h.shopId === shopId);
  const quotes = [...store.quotes.values()].filter((q) => !shopId || q.shopId === shopId);
  return NextResponse.json({ quotes, holds, bookings, events });
}
