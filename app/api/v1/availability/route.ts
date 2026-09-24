import { NextRequest, NextResponse } from "next/server";
import { getShop } from "@/lib/shops";
import { listSlots } from "@/lib/calendar";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const shopId = req.nextUrl.searchParams.get("shopId");
  const from = req.nextUrl.searchParams.get("from") ?? undefined;
  if (!shopId) {
    return NextResponse.json({ error: "shopId is required." }, { status: 400 });
  }
  const shop = getShop(shopId);
  if (!shop) {
    return NextResponse.json({ error: "Unknown shop." }, { status: 404 });
  }
  return NextResponse.json({
    shopId: shop.id,
    holdMinutes: shop.holdMinutes,
    slots: listSlots(shop, from),
  });
}
