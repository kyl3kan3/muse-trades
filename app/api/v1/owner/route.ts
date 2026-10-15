import { authenticateOperator, requestedShopAllowed } from "@/lib/operator-auth";
import { NextRequest, NextResponse } from "next/server";
import { store, expireHolds } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const access = await authenticateOperator(req.headers);
  if (!access.ok) return access.response;
  if (!requestedShopAllowed(access, req.nextUrl.searchParams.get("shopId"))) {
    return NextResponse.json({error:"Shop access denied."}, {status:403, headers:{"Cache-Control":"private, no-store"}});
  }
  expireHolds();
  const shopId = access.shopId;
  const events = store.events.filter((e) => e.shopId === shopId).slice(0, 50);
  const bookings = [...store.bookings.values()].filter((b) => b.shopId === shopId);
  const holds = [...store.holds.values()].filter((h) => h.shopId === shopId);
  const quotes = [...store.quotes.values()].filter((q) => q.shopId === shopId);
  return NextResponse.json({ quotes, holds, bookings, events }, {headers:{"Cache-Control":"private, no-store"}});
}
