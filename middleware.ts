import { NextResponse, type NextRequest } from "next/server";
import { authenticateOperator } from "@/lib/operator-auth";
export async function middleware(request: NextRequest) {
  const access = await authenticateOperator(request.headers);
  if (!access.ok) return access.response;
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
export const config = { matcher: ["/owner/:path*"] };
