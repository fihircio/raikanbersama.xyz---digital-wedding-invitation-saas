# Marketing tracking — Meta, GA4, TikTok

Three platforms, one event vocabulary. Call sites import from
`src/utils/analytics.ts` and never touch a vendor module directly, so adding or
removing a platform means editing one file.

## What is wired

| Funnel step | Meta | GA4 | TikTok |
|---|---|---|---|
| Page view | `PageView` | `page_view` | `page` |
| Catalog / pricing view | `ViewContent` | `view_item` | `ViewContent` |
| Plan selected | `AddToCart` | `add_to_cart` | `AddToCart` |
| Checkout opened | `InitiateCheckout` | `begin_checkout` | `InitiateCheckout` |
| Paid | `Purchase` (CAPI) | `purchase` (MP) | `CompletePayment` (Events API) |

Client-side events are best-effort. **Paid orders are sent server-side** from the
payment webhook, because a customer can close the Billplz tab and never return
to the success page:

- `backend/src/services/metaConversionsService.ts` — Meta CAPI
- `backend/src/services/ga4MeasurementService.ts` — GA4 Measurement Protocol
- `backend/src/services/tiktokEventsService.ts` — TikTok Events API

All three are attempted independently in `paymentService.sendPurchaseConversion`,
so one vendor being down or unconfigured cannot suppress the others.

## Configuration

Every integration **no-ops with a warning** when its ID is unset, so local dev and
preview deploys make zero third-party requests. Verified: with no IDs set, the
page injects no vendor scripts at all.

### Frontend (root `.env`)

```bash
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX     # GA4 > Admin > Data streams > Web
VITE_TIKTOK_PIXEL_ID=CXXXXXXXXXXXXXXXX   # TikTok Events Manager > Data sources
```

### Backend (`backend/.env`)

```bash
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
GA4_API_SECRET=...        # GA4 > Admin > Data streams > Measurement Protocol API secrets
GA4_MP_DEBUG=false        # true = validate payloads, rejects bad ones

TIKTOK_PIXEL_ID=CXXXXXXXXXXXXXXXX
TIKTOK_EVENTS_ACCESS_TOKEN=...   # TikTok Events Manager > Data sources > Events API
TIKTOK_TEST_EVENT_CODE=          # set while QAing, clear for production
```

## Verification

Browser side (with test IDs, vendor scripts blocked so nothing leaves the
machine): `dataLayer` receives `config` then `page_view` / `view_item` /
`add_to_cart`, and `window.ttq` queues `page` / `track`. Verified both the
configured and unconfigured paths.

Server side: 20/20 assertions on the outgoing payloads — GA4 `client_id` derived
per order, `transaction_id` for dedupe, and TikTok PII hashed (email lowercased,
`0123456789` → `60123456789`) with a deterministic `payment-<orderId>` event_id.

## Design notes worth keeping

- **GA4 needs a `client_id`.** On the webhook path there is no browser identifier,
  so `syntheticClientId(orderId)` derives a stable one — repeat sends for the same
  order collapse onto one client instead of creating ghosts.
- **TikTok dedupes on `event_id`**; the deterministic order-based id means a
  Billplz webhook retry cannot double count.
- **TikTok's loader expects `window.ttq` to be an array** with every method
  deferred (`load`, `page`, `track`, …). A bare function stub silently throws and
  events never queue — this was caught in testing, not in review.
- **The TikTok stub must stay an array.** Do not "simplify" it to an object.

## Not yet done (deliberately)

- No consent/CMP layer. Malaysia PDPA applies and there are now four trackers
  (Meta, GA4, TikTok, plus reCAPTCHA). Add a consent gate before scaling spend.
- Google Ads conversion tag is not installed; it comes with the Search campaign.
- GA4 `purchase` is sent from the webhook only. If a client-side purchase event is
  ever added on the success page, it must reuse the same `transaction_id` so GA4
  deduplicates rather than double counting.
