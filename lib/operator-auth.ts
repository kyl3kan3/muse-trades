/** Server-only operator authentication. Never import this module from client code. */
type Operator = { password_sha256: string; shop_id: string; };
export type OperatorAccess =
  | { ok: true; username: string; shopId: string; }
  | { ok: false; response: Response };

function denied(status: number): OperatorAccess {
  return { ok: false, response: Response.json(
    { error: status === 503 ? "Operator access is not configured." : "Operator sign-in required." },
    { status, headers: {
      "Cache-Control": "private, no-store",
      ...(status === 401 ? { "WWW-Authenticate": 'Basic realm="Muse Trades owner", charset="UTF-8"' } : {}),
    } },
  ) };
}

/** Passwords are supplied by the operator over HTTPS; only hashes live in server configuration. */
export async function authenticateOperator(
  headers: Headers,
  rawConfig = process.env.OPERATOR_AUTH_JSON,
): Promise<OperatorAccess> {
  let operators: Record<string, Operator>;
  try {
    const parsed: unknown = JSON.parse(rawConfig || "");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return denied(503);
    const entries = Object.entries(parsed);
    if (!entries.length || entries.some(([name, value]) =>
      !/^[A-Za-z0-9._-]{1,80}$/.test(name) || !value || typeof value !== "object" ||
      !/^[a-f0-9]{64}$/.test(value.password_sha256 ?? "") || typeof value.shop_id !== "string" || !/^[a-z0-9-]{1,80}$/.test(value.shop_id)
    )) return denied(503);
    operators = parsed as Record<string, Operator>;
  } catch { return denied(503); }

  const header = headers.get("authorization") || "";
  if (header.length > 4096 || !/^Basic [A-Za-z0-9+/]+={0,2}$/i.test(header)) return denied(401);
  let credentials: string;
  try { credentials = new TextDecoder("utf-8", { fatal: true }).decode(
    Uint8Array.from(atob(header.slice(6)), (character) => character.charCodeAt(0)),
  ); } catch { return denied(401); }
  const separator = credentials.indexOf(":");
  if (separator < 1) return denied(401);
  const username = credentials.slice(0, separator);
  const password = credentials.slice(separator + 1);
  if (password.length < 20 || password.length > 256) return denied(401);
  const operator = Object.hasOwn(operators, username) ? operators[username] : undefined;
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password)));
  const expected = operator?.password_sha256 || "0".repeat(64);
  let difference = 0;
  for (let index = 0; index < digest.length; index += 1) {
    difference |= digest[index] ^ Number.parseInt(expected.slice(index * 2, index * 2 + 2), 16);
  }
  if (!operator || difference !== 0) return denied(401);
  return { ok: true, username, shopId: operator.shop_id };
}

/** The credential supplies tenant scope; a query string can only narrow to that same shop. */
export function requestedShopAllowed(access: { shopId: string }, requested: string | null) {
  return requested === null || requested === access.shopId;
}
