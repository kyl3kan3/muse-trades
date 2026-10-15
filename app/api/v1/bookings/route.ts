import { NextRequest, NextResponse } from "next/server";
import { getShop } from "@/lib/shops";
import { requireShopOwner } from "@/lib/owner-auth";
import { store, expireHolds } from "@/lib/store";
import type { Booking } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  expireHolds();
  let body: {
    shopId?: string;
    quoteId?: string;
    holdId?: string;
    slotStart?: string;
    slotEnd?: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    address?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Send JSON." }, { status: 400 });
  }

  if (!body.shopId || !body.customerName || !body.address) {
    return NextResponse.json(
      { error: "shopId, customerName, and address are required." },
      { status: 400 }
    );
  }

  const shop = getShop(body.shopId);
  if (!shop) return NextResponse.json({ error: "Unknown shop." }, { status: 404 });

  const quote = body.quoteId ? store.quotes.get(body.quoteId) : undefined;
  if (body.quoteId && (!quote || quote.shopId !== shop.id)) {
    return NextResponse.json({ error: "Quote is missing or does not belong to this shop." }, { status: 404 });
  }

  let slotStart = body.slotStart;
  let slotEnd = body.slotEnd;
  if (body.holdId) {
    const hold = store.holds.get(body.holdId);
    if (!hold || hold.status !== "held" || hold.shopId !== shop.id) {
      return NextResponse.json({ error: "Hold expired, missing, or not valid for this shop. Get a new slot." }, { status: 409 });
    }
    if (hold.quoteId && body.quoteId !== hold.quoteId) {
      return NextResponse.json({ error: "Hold and quote do not match." }, { status: 409 });
    }
    slotStart = hold.slotStart;
    slotEnd = hold.slotEnd;
    hold.status = "converted";
  }
  if (!slotStart || !slotEnd) {
    return NextResponse.json({ error: "Pass holdId or slotStart and slotEnd." }, { status: 400 });
  }

  const origin = req.nextUrl.origin;
  const booking: Booking = {
    id: `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    shopId: shop.id,
    quoteId: body.quoteId ?? "",
    holdId: body.holdId,
    slotStart,
    slotEnd,
    customerName: body.customerName,
    customerPhone: body.customerPhone,
    customerEmail: body.customerEmail,
    address: body.address,
    depositCents: quote?.depositCents ?? shop.depositCents,
    paymentUrl: `${origin}/pay/${shop.id}`,
    status: quote?.needsHuman ? "needs_human" : "pending_deposit",
    createdAt: new Date().toISOString(),
  };
  store.putBooking(booking);
  return NextResponse.json({
    ...booking,
    nextStep:
      "Send the customer to paymentUrl (Stripe Link in production). After deposit, the slot is booked and the shop sees it on /owner.",
  });
}

export async function GET(req: NextRequest) {
  const shopId = req.nextUrl.searchParams.get("shopId");
  if (!shopId) return NextResponse.json({ error: "shopId is required." }, { status: 400 });
  if (!getShop(shopId)) return NextResponse.json({ error: "Unknown shop." }, { status: 404 });
  const authError = requireShopOwner(req, shopId);
  if (authError) return authError;
  const rows = [...store.bookings.values()].filter((b) => b.shopId === shopId);
  return NextResponse.json({ bookings: rows }, { headers: { "Cache-Control": "private, no-store" } });
}
