import test from "node:test";
import assert from "node:assert/strict";
import { requireShopOwner } from "../lib/owner-auth.ts";

const shopId = "stl-comfort-hvac";
const validToken = "a".repeat(48);

function request(authorization) {
  return new Request("https://example.test/api/v1/owner?shopId=" + shopId, {
    headers: authorization ? { authorization } : {},
  });
}

test("owner data fails closed when the token map is missing or malformed", () => {
  const prior = process.env.MUSE_OWNER_TOKENS_JSON;
  try {
    delete process.env.MUSE_OWNER_TOKENS_JSON;
    assert.equal(requireShopOwner(request(), shopId)?.status, 503);
    process.env.MUSE_OWNER_TOKENS_JSON = "{";
    assert.equal(requireShopOwner(request(), shopId)?.status, 503);
  } finally {
    if (prior === undefined) delete process.env.MUSE_OWNER_TOKENS_JSON;
    else process.env.MUSE_OWNER_TOKENS_JSON = prior;
  }
});

test("shop owner data requires the correct per-shop bearer token", () => {
  const prior = process.env.MUSE_OWNER_TOKENS_JSON;
  try {
    process.env.MUSE_OWNER_TOKENS_JSON = JSON.stringify({
      [shopId]: validToken,
      "stl-metro-plumb": "b".repeat(48),
    });
    assert.equal(requireShopOwner(request(), shopId)?.status, 401);
    assert.equal(requireShopOwner(request("Bearer " + "c".repeat(48)), shopId)?.status, 401);
    assert.equal(requireShopOwner(request("Bearer " + validToken), shopId), null);
  } finally {
    if (prior === undefined) delete process.env.MUSE_OWNER_TOKENS_JSON;
    else process.env.MUSE_OWNER_TOKENS_JSON = prior;
  }
});

test("one shop token cannot authorize another shop", () => {
  const prior = process.env.MUSE_OWNER_TOKENS_JSON;
  try {
    process.env.MUSE_OWNER_TOKENS_JSON = JSON.stringify({
      [shopId]: validToken,
      "stl-metro-plumb": "b".repeat(48),
    });
    assert.equal(requireShopOwner(request("Bearer " + validToken), "stl-metro-plumb")?.status, 401);
  } finally {
    if (prior === undefined) delete process.env.MUSE_OWNER_TOKENS_JSON;
    else process.env.MUSE_OWNER_TOKENS_JSON = prior;
  }
});
