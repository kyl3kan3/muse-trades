import { NextRequest, NextResponse } from "next/server";
import { findShops, SHOPS } from "@/lib/shops";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const trade = req.nextUrl.searchParams.get("trade") ?? undefined;
  const city = req.nextUrl.searchParams.get("city") ?? undefined;
  const shops = trade || city ? findShops({ trade, city }) : SHOPS;
  return NextResponse.json({
    shops: shops.map((s) => ({
      id: s.id,
      name: s.name,
      trade: s.trade,
      city: s.city,
      state: s.state,
      serviceArea: s.serviceArea,
      depositCents: s.depositCents,
      holdMinutes: s.holdMinutes,
    })),
  });
}
