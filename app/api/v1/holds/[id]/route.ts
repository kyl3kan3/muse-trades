import { NextRequest, NextResponse } from "next/server";
import { store, expireHolds } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  expireHolds();
  const { id } = await ctx.params;
  const hold = store.holds.get(id);
  if (!hold) return NextResponse.json({ error: "Unknown hold." }, { status: 404 });
  return NextResponse.json(hold);
}
