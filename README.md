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


## Owner dashboard access

The owner board and booking-list API are private. Configure `MUSE_OWNER_TOKENS_JSON` in the hosting environment as a JSON object keyed by shop ID. Use a different cryptographically random token of at least 32 characters for each shop, and distribute each token only to that shop's authorized owner. Example shape (replace every placeholder with a fresh random secret):

```json
{"stl-comfort-hvac":"REPLACE_WITH_RANDOM_32_PLUS_CHARACTER_TOKEN","stl-metro-plumb":"REPLACE_WITH_A_DIFFERENT_RANDOM_32_PLUS_CHARACTER_TOKEN"}
```

The token is entered into the owner page for the selected shop and is not saved to browser storage. If the environment variable is missing or malformed, owner data APIs fail closed. Do not commit real tokens to Git.
