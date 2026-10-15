import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

/**
 * Per-shop owner tokens are configured server-side as a JSON object:
 * { "stl-comfort-hvac": "<random token>", "stl-metro-plumb": "<random token>" }.
 * Use separate, randomly generated secrets of at least 32 characters per shop.
 */
export function requireShopOwner(req: NextRequest, shopId: string): NextResponse | null {
  let configured: unknown;
  try {
    configured = JSON.parse(process.env.MUSE_OWNER_TOKENS_JSON ?? "null");
  } catch {
    configured = null;
  }

  if (!configured || typeof configured !== "object" || Array.isArray(configured)) {
    return NextResponse.json(
      { error: "Owner access is not configured." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const expected = (configured as Record<string, unknown>)[shopId];
  if (typeof expected !== "string" || expected.length < 32) {
    return NextResponse.json(
      { error: "Owner access is not configured for this shop." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const header = req.headers.get("authorization") ?? "";
  const match = /^Bearer ([^\s]+)$/i.exec(header);
  if (!match) return unauthorized();

  const actualBytes = Buffer.from(match[1], "utf8");
  const expectedBytes = Buffer.from(expected, "utf8");
  if (actualBytes.length !== expectedBytes.length || !timingSafeEqual(actualBytes, expectedBytes)) {
    return unauthorized();
  }
  return null;
}

function unauthorized() {
  return NextResponse.json(
    { error: "Owner authentication required." },
    { status: 401, headers: { "Cache-Control": "no-store", "WWW-Authenticate": "Bearer" } },
  );
}
