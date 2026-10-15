import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { registerHooks } from "node:module";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const hooks = registerHooks({ resolve(specifier, context, next) {
  if (specifier === "next/server") return next("next/server.js", context);
  if (specifier.startsWith("@/")) return next(path.join(root, specifier.slice(2)) + ".ts", context);
  if (specifier.startsWith(".") && !path.extname(specifier) && context.parentURL?.endsWith(".ts")) return next(specifier + ".ts", context);
  return next(specifier, context);
}});
const { NextRequest } = await import("next/server.js");
const { GET: bookings } = await import("../app/api/v1/bookings/route.ts");
const { GET: owner } = await import("../app/api/v1/owner/route.ts");
const { store } = await import("./store.ts");
const password = "test-only-secret-at-least-twenty-characters";
const authorization = `Basic ${Buffer.from(`alice:${password}`).toString("base64")}`;
test("private API handlers enforce authentication and tenant scope before reading customer records", async () => {
  const previous = process.env.OPERATOR_AUTH_JSON;
  const config = JSON.stringify({alice:{password_sha256:createHash("sha256").update(password).digest("hex"),shop_id:"shop-a"}});
  process.env.OPERATOR_AUTH_JSON = config;
  for (const shopId of ["shop-a", "shop-b"]) {
    const value = {id:shopId,shopId,customerName:`Private ${shopId}`,address:`Private address ${shopId}`};
    store.bookings.set(shopId,value); store.quotes.set(shopId,value);
    store.holds.set(shopId,{...value,status:"converted"});store.events.push(value);
  }
  try {
    for (const handler of [bookings, owner]) {
      let response = await handler(new NextRequest("https://fixture.invalid/api"));
      assert.equal(response.status,401);
      assert.equal((await response.text()).includes("Private"),false);
      response = await handler(new NextRequest("https://fixture.invalid/api?shopId=shop-b",{headers:{authorization}}));
      assert.equal(response.status,403);
      assert.equal((await response.text()).includes("Private"),false);
      for (const suffix of ["", "?shopId=shop-a"]) {
        response = await handler(new NextRequest(`https://fixture.invalid/api${suffix}`,{headers:{authorization}}));
        assert.equal(response.status,200);
        assert.equal(response.headers.get("cache-control"),"private, no-store");
        const payload = await response.json();
        for (const rows of Object.values(payload)) {
          assert.equal(rows.length,1); assert.equal(rows[0].shopId,"shop-a");
        }
      }
      delete process.env.OPERATOR_AUTH_JSON;
      response = await handler(new NextRequest("https://fixture.invalid/api",{headers:{authorization}}));
      assert.equal(response.status,503);
      process.env.OPERATOR_AUTH_JSON = config;
    }
  } finally {
    if (previous === undefined) delete process.env.OPERATOR_AUTH_JSON; else process.env.OPERATOR_AUTH_JSON = previous;
    store.bookings.clear();store.quotes.clear();store.holds.clear();store.events.length=0;hooks.deregister();
  }
});
