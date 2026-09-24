import { NextRequest, NextResponse } from "next/server";
import { buildQuote } from "@/lib/quotes";
import { store } from "@/lib/store";
import type { QuoteRequest } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: QuoteRequest;
  try {
    body = (await req.json()) as QuoteRequest;
  } catch {
    return NextResponse.json({ error: "Send JSON." }, { status: 400 });
  }

  if (!body.serviceType) {
    return NextResponse.json(
      {
        error: "serviceType is required.",
        allowed: [
          "ac_replace",
          "ac_repair",
          "furnace_replace",
          "furnace_repair",
          "maintenance",
          "water_heater",
          "drain",
          "leak",
          "repipe",
          "other",
        ],
      },
      { status: 400 }
    );
  }

  const quote = buildQuote(body);
  if ("error" in quote) {
    return NextResponse.json(quote, { status: 404 });
  }
  store.putQuote(quote);
  return NextResponse.json(quote);
}
