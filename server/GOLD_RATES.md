# Gold rate cache

Set `GOLDAPI_KEY` in the backend environment, then start the backend normally. Existing
`GOLD_API_KEY` values are also supported. Never put either key in Vite environment variables.

- `GET /api/v1/gold-rates` returns `{ success, data, meta }`.
- `data`: `goldRate` (24K INR/g), `silverRate` (INR/g), `usdInr`, `goldMCX` (goldRate × 10).
- `meta`: `cached`, `stale`, `lastUpdated` (last successful refresh), `lastApiCall`
  (last attempt), `nextUpdateIn` (whole minutes until eligible refresh).
- The `goldMCX` field is a calculated 10g spot value, **not an actual MCX futures quote**.
- USD/INR is derived from contemporaneous XAU/INR and XAU/USD spot prices.
- Existing `/api/v1/rates` and `/api/v1/rates/live` use the same singleton cache through
  a compatibility adapter. Client refresh buttons do not bypass the server cache.

The first request starts a refresh. Concurrent callers await the same promise. Successful
data remains fresh for 4 hours. After expiry, the next visitor triggers a refresh; there
is no background schedule when nobody visits. Failures keep the previous data and return
`meta.stale: true`. With no successful cache, errors return HTTP 503 with an error code.
Failed attempts also receive a 4-hour cooldown, including with an empty cache, so an API
outage cannot produce a request storm. No fabricated prices are returned.

## Provider request budget and hosting

XAU/INR only supplies gold. A complete refresh fetches **XAU/INR, XAG/INR, XAU/USD**:
three billable requests. At a 4-hour interval, continuously active traffic can consume
540 requests in 30 days (558 in 31 days), even with one server. This cannot fit a
300-request plan. An 8-hour interval would use 270 requests/30 days; that alternative is
not applied because the requested interval is 4 hours. A gold-only refresh could use one
request but would not supply the requested silver/exchange-rate data.

Cache and in-flight lock exist **only inside one Node.js process**. Node restarts, Vercel
cold starts, PM2 cluster workers, autoscaling and multiple replicas create independent
caches. For predictable request volume with the requested in-memory-only design, use a
single long-running backend process. Global guarantees across serverless instances need
shared storage and distributed locking; an in-memory-only solution cannot provide them.

## Admin

Open **Gold API & Rates** (`/gold-rates`) in the standalone admin app.
`GET/PUT /api/v1/gold-rates/settings` require a real authenticated administrator. Legacy
demo admin tokens are rejected. MongoDB persists only settings, **never the rate cache**.
Keys are write-only, encrypted with AES-256-GCM using `GOLDAPI_CONFIG_SECRET` (or existing
`JWT_SECRET`), omitted from all public responses and never logged. Keep the encryption
secret stable; changing it requires saving a new API key.

Save an empty key to retain the current key; “Use the server environment key” removes the
admin key override. OFF stops new provider refreshes; any existing rates are marked stale
and disabled. An already-started request may finish. ON and key changes preserve the
current 4-hour schedule/cooldown so toggling cannot exhaust quota. Settings are memoized
for 30 seconds per process and updated immediately in the process handling the save.

`npm run test:gold-rates` tests concurrency, expiry, failures, stale data, OFF/ON and
response contracts without spending provider quota.
