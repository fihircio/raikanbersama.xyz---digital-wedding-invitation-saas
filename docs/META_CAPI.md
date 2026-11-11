# Meta Conversions API (CAPI) — Server-Side Tracking

Status: implemented, pending production credentials.

## Why this exists

Before this change, `Purchase` was never tracked. The browser Pixel only fires
after Billplz redirects the customer back to `/orders?status=success`. A large
share of Malaysian mobile checkouts close the Billplz app and never return,
so revenue was invisible to Meta — and the ad account was optimising on
`InitiateCheckout` rather than sales.

Now the authoritative `Purchase` is sent **server-side from the payment
webhook**, which runs whether or not the customer returns to the site.

## What is sent

| Event | Source | When | `event_id` |
|---|---|---|---|
| `PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout` | Browser Pixel (existing) | On page/route | client-generated (InitiateCheckout now shared) |
| `InitiateCheckout` | Server (CAPI mirror) | `POST /api/payments/checkout` | **same** id as the browser event → Meta dedupes |
| `Purchase` | Server (CAPI) | Billplz webhook `state=paid` | `purchase-{orderId}` (deterministic) |

The server `InitiateCheckout` only fires when the browser explicitly sends
`metaEventId`. If an older client doesn't send it, the event is skipped rather
than double-counted.

## Environment variables (backend)

```bash
META_PIXEL_ID=968435972628878
META_CAPI_ACCESS_TOKEN=          # from Events Manager > Settings > Conversions API > Generate access token
META_CAPI_TEST_EVENT_CODE=       # set while QAing, remove in production
META_CAPI_API_VERSION=v23.0
META_CAPI_ENABLED=true
```

If `META_CAPI_ACCESS_TOKEN` is empty the service logs a warning and no-ops.
It never throws, so a Meta outage cannot block a paid order.

## Setup

1. **Events Manager → your dataset (Pixel `968435972628878`) → Settings**
2. Under *Conversions API*, click **Generate access token**.
3. Paste it into Railway (`META_CAPI_ACCESS_TOKEN`) and redeploy.
4. While testing, also paste the **Test Events code** into
   `META_CAPI_TEST_EVENT_CODE`.

```bash
# backend/
npm run test:capi                          # fake Purchase with default QA identity
npm run test:capi -- you@example.com 0123456789
```

A successful run logs `events_received=1` and the event appears in
Events Manager → Test Events (when a test code is set).

## QA checklist

1. `npm run test:capi` returns success.
2. Open the site, go to `/pricing`, pick a plan → confirm one
   `InitiateCheckout` arrives in Test Events, not two.
3. Complete a sandbox Billplz payment.
4. Confirm `Purchase` arrives with the correct `value` (coupon-adjusted) and
   `currency: MYR`.
5. Replay the Billplz webhook (`POST /api/payments/webhook` again with the same
   payload) → confirm **no** second `Purchase` is counted.
6. Only then switch the ad set optimisation event from `InitiateCheckout` to
   `Purchase`.

## Privacy and matching

- PII is normalized then SHA-256 hashed: email (lowercased/trimmed),
  phone (digits only, `0123456789` → `60123456789`), first/last name,
  `external_id`, country.
- `fbp`, `fbc`, client IP and user agent are sent **unhashed** — Meta requires
  them raw. They are forwarded from the browser at checkout.
- No raw email/phone ever appears in the request or in logs.

## Known limitation

`Purchase` is sent from the webhook, where the browser's `_fbc` click cookie is
not available, so the Purchase carries email/phone/name but not `fbc`.
Ad-click attribution therefore relies on Meta's identity matching. If
attribution quality turns out to be poor, the next step is persisting
`_fbp`/`_fbc` on the order at checkout time (requires a DB migration on
`orders`). Not implemented deliberately: adding columns without running
`npm run migrate` on production would break order inserts.

## Files

- `backend/src/services/metaConversionsService.ts` — transport, hashing, event builders
- `backend/src/services/paymentService.ts` — `sendPurchaseConversion`, idempotency guard
- `backend/src/controllers/paymentController.ts` — server `InitiateCheckout` mirror
- `src/utils/metaPixel.ts` — shared `event_id`, `_fbp`/`_fbc` readout
- `components/Pricing/PaymentModal.tsx` — passes `metaEventId`, `fbp`, `fbc`
- `backend/src/scripts/test-meta-capi.ts` — QA sender
