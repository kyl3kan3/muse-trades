# Muse Trades

Quote-and-book API for HVAC and plumbing shops in the St. Louis metro. Built so a Meta Muse agent can finish the job without a phone call.

Live contract:

- `GET /openapi.json`
- `GET /llms.txt`
- `GET /api/v1/shops`
- `POST /api/v1/quote`
- `GET /api/v1/availability?shopId=`
- `POST /api/v1/holds`
- `POST /api/v1/bookings`
- `GET /owner`

## What an agent does

1. Customer: "My 2014 AC died, 1,800 square foot house in Columbia, Illinois."
2. Agent posts a quote, reads the range and inclusions.
3. Agent pulls availability, holds a slot for 15 minutes.
4. Agent collects name, phone, address, posts a booking.
5. Customer pays the deposit on the returned `paymentUrl` (Stripe Link in production).

## Seed shops

- `stl-comfort-hvac` — River City Comfort (Columbia, IL)
- `stl-metro-plumb` — Metro East Plumbing (Belleville, IL)

Replace the JSON in `lib/shops.ts` with a real sheet when the first shop says yes.

## Run

```bash
npm install
npm run dev
```

## Muse

Submit the public URL at https://muse.ai/platform. Until review lands, a user can still say:

Add my custom connector: https://YOUR-HOST/openapi.json

Muse reads the spec and `/llms.txt`.

Persistence: quotes, holds, and bookings live in memory on this MVP. Next step is Postgres so holds survive deploys.

## Operator access (required before deployment)

Private data fails closed until `OPERATOR_AUTH_JSON` is set in **server-only** environment variables. Never prefix it with `NEXT_PUBLIC_`, put credentials in source, or embed them in client code. Configure HTTPS at the deployment boundary. An operator visits `/owner` and signs in through the browser's HTTP Basic prompt; same-origin API requests reuse those credentials. Supply an Authorization Basic header for scripts. Browsers retain Basic credentials until closed; use a private browser window on shared computers.

Generate a unique random password of at least 20 characters (32 random bytes recommended), distribute it privately to the operator, and store only its SHA-256 hex digest in this JSON:

```json
{"operator-name":{"password_sha256":"<64 lowercase hex characters>","shop_id":"stl-comfort-hvac"}}
```

Each operator sees only the shop_id assigned in server configuration. The private booking/owner GET endpoints independently check credentials and scope; a shopId query cannot broaden access. Public quote, availability and booking creation APIs remain public. Missing/malformed configuration returns 503; absent/incorrect credentials return 401. Rotate a password by replacing its hash or revoke access by removing the operator. Deployment-level access protection is recommended as defense in depth. Keep the number of provisioned operators small; this gate is for trusted operations, not customer registration.

Focused offline security tests: `node --test lib/operator-auth.test.mjs lib/private-routes.test.mjs` (Node 24 or newer; no network or production data).
