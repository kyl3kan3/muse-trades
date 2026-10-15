import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { authenticateOperator, requestedShopAllowed } from "./operator-auth.ts";
const password = "test-only-operator-password-at-least-20-characters";
const config = JSON.stringify({ alice: { password_sha256: createHash("sha256").update(password).digest("hex"), shop_id: "shop-a" } });
const headers = (value = `alice:${password}`) => new Headers({ authorization: `Basic ${Buffer.from(value).toString("base64")}` });
test("missing and invalid configuration fail closed", async () => {
  for (const config of [undefined, "", "{}", "[]", '{"alice":{"password_sha256":"short"}}']) {
    const result = await authenticateOperator(headers(), config ?? "");
    assert.equal(result.ok, false);
    assert.equal(result.response.status, 503);
  }
});
test("anonymous, malformed, incorrect and unknown credentials cannot access data", async () => {
  for (const request of [new Headers(), new Headers({authorization: "Bearer untrusted"}), new Headers({authorization:"Basic %"}), headers("alice:wrong-password-long-enough"), headers(`bob:${password}`), headers(`__proto__:${password}`)]) {
    const result = await authenticateOperator(request, config);
    assert.equal(result.ok, false);
    assert.equal(result.response.status, 401);
    assert.match(result.response.headers.get("www-authenticate"), /^Basic /);
    assert.equal(result.response.headers.get("cache-control"), "private, no-store");
  }
});
test("valid credentials resolve a server-configured operator", async () => {
  const result = await authenticateOperator(headers(), config);
  assert.deepEqual(result, {ok:true, username:"alice", shopId:"shop-a"});
});
test("tenant query cannot select another shop or all shops", () => {
  const access = {shopId:"shop-a"};
  assert.equal(requestedShopAllowed(access,null),true);
  assert.equal(requestedShopAllowed(access,"shop-a"),true);
  assert.equal(requestedShopAllowed(access,"shop-b"),false);
  assert.equal(requestedShopAllowed(access,""),false);
});
