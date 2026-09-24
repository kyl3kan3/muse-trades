import { NextRequest, NextResponse } from "next/server";
import { getShop } from "@/lib/shops";
import { store, expireHolds } from "@/lib/store";
import { listSlots } from "@/lib/calendar";
import type { Hold } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  expireHolds();
  let body: { shopId?: string; quoteId?: string; slotStart?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Send JSON." }, { status: 400 });
  }
  if (!body.shopId || !body.slotStart) {
    return NextResponse.json({ error: "shopId and slotStart are required." }, { status: 400 });
  }
  const shop = getShop(body.shopId);
  if (!shop) return NextResponse.json({ error: "Unknown shop." }, { status: 404 });

  const slots = listSlots(shop);
  const slot = slots.find((s) => s.start === body.slotStart);
  if (!slot || !slot.available) {
    return NextResponse.json({ error: "That slot is gone. Pull availability again." }, { status: 409 });
  }

  const hold: Hold = {
    id: `h_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    shopId: shop.id,
    quoteId: body.quoteId ?? "",
    slotStart: slot.start,
    slotEnd: slot.end,
    status: "held",
    expiresAt: new Date(Date.now() + shop.holdMinutes * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  };
  store.putHold(hold);
  return NextResponse.json(hold);
}
