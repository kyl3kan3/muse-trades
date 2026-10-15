import { NextRequest, NextResponse } from "next/server";
import { store, expireHolds } from "@/lib/store";
import { getShop } from "@/lib/shops";
import { requireShopOwner } from "@/lib/owner-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  expireHolds();
  const shopId = req.nextUrl.searchParams.get("shopId");
  if (!shopId) return NextResponse.json({ error: "shopId is required." }, { status: 400 });
  if (!getShop(shopId)) return NextResponse.json({ error: "Unknown shop." }, { status: 404 });
  const authError = requireShopOwner(req, shopId);
  if (authError) return authError;
  const events = store.events.filter((e) => e.shopId === shopId).slice(0, 50);
  const bookings = [...store.bookings.values()].filter((b) => b.shopId === shopId);
  const holds = [...store.holds.values()].filter((h) => h.shopId === shopId);
  const quotes = [...store.quotes.values()].filter((q) => q.shopId === shopId);
  return NextResponse.json({ quotes, holds, bookings, events }, { headers: { "Cache-Control": "private, no-store" } });
}
