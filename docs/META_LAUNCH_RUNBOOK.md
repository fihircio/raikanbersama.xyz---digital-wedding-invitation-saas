# Meta Launch Runbook — Campaign #1

Advertiser: **RaikanBersama**. Pixel/dataset: `968435972628878`.
Publishing by hand in Ads Manager (no Marketing API token exists — see the end).

---

## 0. Pre-flight (do these first, ~5 min)

- [ ] You are in the **right ad account**: `business.facebook.com` → confirm the
      ad account is under the RaikanBersama portfolio, not EEELABVISUAL.
- [ ] **Payment method** present: Billing → payment settings. Ads will not publish without it.
- [ ] **Page + Instagram connected** to the ad account (the June audit found only
      IG + pixel were connected, no Page — if the ad creator hides the Page, fix it at
      Business Settings → Accounts → Ad accounts → Connected assets).
- [ ] **Domain verified** — `facebook-domain-verification` meta tag is live on production.
- [ ] **Events firing** — Events Manager → `968435972628878` → Test Events, load
      `raikanbersama.xyz`, expect `PageView`, `AddToCart`, `InitiateCheckout`, `Purchase`.
- [ ] Footage ready in `marketing/footage/` (all 1080x2340, 9:16).

---

## 1. Campaign (C1 — Pro Hero)

| Field | Value |
|---|---|
| Name | `RB \| C1 Pro Hero \| Sales \| 2026-11` |
| Buying type | Auction |
| Objective | **Sales** |
| Campaign budget | **Off** (we budget at ad set level for control) |
| Advantage+ campaign budget | Off for week 1 |
| Special ad categories | **None** (wedding stationery is not credit/housing/employment/social) |

## 2. Ad set

| Field | Value |
|---|---|
| Name | `AS1 Profil Malaysia 22-38` |
| Conversion location | **Website** |
| Pixel | `968435972628878` |
| Conversion event | **InitiateCheckout** |
| Performance goal | Maximise number of conversions |
| Budget | **RM30/day**, no end date |
| Audience | Malaysia · age 22–38 · all genders |
| Detailed targeting | Weddings, Wedding planning, Bride, Engagement, Bridal shower, Photography |
| Audience expansion | **On** (lets Meta find similar people) |
| Placements | **Advantage+ placements ON**, then exclude Audience Network |
| Optimisation | Highest volume (lowest cost per result) |

**Why `InitiateCheckout` and not `Purchase`:** Meta needs ~50 events per ad set per
week to exit learning. At RM30/day you will not get 50 purchases. `InitiateCheckout`
fires far more often, so the ad set can actually learn. Switch to `Purchase` once you
see 2+ purchases per day sustained — the CAPI event is already live and deduplicated.

## 3. Ads (3 creatives, same ad set)

Landing page for all three:

`https://www.raikanbersama.xyz/pricing?utm_source=facebook&utm_medium=cpc&utm_campaign=c1_pro_hero&utm_content=<SLOT>`

> Use the **clean path** (`/pricing`), not the old hash form (`/#/pricing`).
> Hash URLs are still supported, but they bounce through a redirect first, which
> costs a round trip. Vercel rewrites unknown paths to `index.html`, so
> `/pricing` serves the app directly.

| Slot | Video | Primary text | Headline | Description | CTA |
|---|---|---|---|---|---|
| `reveal` | `01_invite_reveal.mp4` | A | `Kad Kahwin Digital, RM29` | `Siap dalam beberapa minit` | Ketahui Lebih Lanjut |
| `hadiah` | `04_elite_hadiah_qr.mp4` | B | `RSVP & Hadiah Digital` | `Cuba percuma, bayar bila sedia` | Ketahui Lebih Lanjut |
| `katalog` | `02_catalog_filter.mp4` | C | `122 Tema Eksklusif` | `Siap dalam beberapa minit` | Ketahui Lebih Lanjut |

**Primary text A** (106 chars)
> Kad kahwin digital lengkap: RSVP, peta Waze, kiraan detik, buku ucapan & hadiah DuitNow. Mula RM29 sahaja.

**Primary text B** (112 chars)
> Tetamu RSVP sendiri, dapat peta terus ke dewan, dan boleh beri hadiah digital. Semua dalam satu link. Mula RM29.

**Primary text C** (104 chars)
> 122 tema eksklusif. Pilih, isi butiran, dan kongsi link kad kahwin anda dalam beberapa minit. Mula RM29.

Notes:
- Upload each MP4 as **video**, not image. Use the 9:16 asset for Reels/Stories placements.
- Set **"Optimise text per placement"** on — Meta will trim to the placement.
- Do **not** add the price in the visual; it is already in the copy and the pricing
  clip is reserved for retargeting.

## 4. Publish and verify (do not skip)

1. Click **Publish**. Expect "In review" — usually minutes, sometimes 24h.
2. Check **Ad review**: any rejection for "Misleading claims" usually means wording
   like "paling murah" — we use none.
3. After ~1 hour, open Events Manager → confirm `InitiateCheckout` now shows both
   **Browser** and **Server** for the same event (this proves the CAPI mirror works
   and dedupe is active).
4. Confirm the ad link opens `/pricing` and the pixel fires `ViewContent`
   (wired and verified; see section 9).

## 9. Verified event coverage

Checked against production with the pixel intercepted, one landing each:

| URL | PageView | ViewContent |
|---|---|---|
| `/pricing?utm_source=facebook` | 1 | 1 (`Pricing`) |
| `/catalog` | 1 | 1 (`Catalog`) |
| `/#/pricing` (legacy hash) | 1 | 1 (`Pricing`) |
| `/` | 1 | 0 (correct — home is not a product view) |

Funnel sequence on `/pricing` → tapping "Pilih Sekarang":
`PageView` → `ViewContent(Pricing)` → `AddToCart(Lite, RM29)` → `SelectPlan` →
`PageView(Catalog)` → `ViewContent(Catalog)`.

Two duplicate-counting bugs were fixed before launch:
- Legacy hash URLs fired **two** PageViews (redirect + resolved path).
- The route tracker remounted and fired twice for the same path; dedupe now lives
  in the pixel helper, keyed by pathname+search, so remounts cannot double-count.

## 5. Day 1–3: what to watch

| Metric | Healthy | Action if bad |
|---|---|---|
| CPM | RM15–35 | > RM60 → audience too narrow, widen or broaden |
| CTR (link) | 1.5–3% | < 0.8% after RM30 spend on one ad → kill that ad |
| CPC | RM0.40–1.50 | > RM3 → creative or audience mismatch |
| Cost per InitiateCheckout | RM8–20 | > RM30 → pause, rethink hook |
| Purchase | any | 0 after RM300 spend → offer or landing problem |

**Kill rules:** pause any ad with CTR < 0.8% after RM30, or cost per IC > RM30 after
RM60. Do not "give it more time" — at this budget that is how the money goes.

## 6. Campaign #2 — only after 72 hours and ≥20 `InitiateCheckout`

Retargeting (highest ROI, but needs audience to exist first):

| Field | Value |
|---|---|
| Name | `RB \| D2 Retarget IC \| Sales` |
| Objective | Sales → Website → `Purchase` |
| Audience | Custom audience: `InitiateCheckout` in last 7 days, **excluded**: `Purchase` 30 days |
| Budget | RM15/day |
| Creative | `03_pricing_pro.mp4` with headline `Pro RM49 — Pilihan Popular` |

The price-anchor clip belongs here: people who already started checkout need
reassurance about the plan, not another feature tour.

## 7. Common rejections and fixes

| Rejection | Fix |
|---|---|
| "Ad set is not delivering" — audience too small | Widen age to 20–45, remove interest stacking |
| "Unsupported special ad category" | Confirm category is **None** |
| Video too short for Reels | Clips under 4s: `03_pricing_pro.mp4` is 3.9s — pair it with another clip or use in feed only |
| Landing page mismatch | The ad says RM29 and `/pricing` shows RM29 first — that is consistent |

## 7b. Verified account identifiers (from `meta` CLI, 2026-11-17)

| Asset | ID | State |
|---|---|---|
| Ad account | `act_4244078779240218` | **ACTIVE** (`account_status` 1), MYR, Asia/Kuala_Lumpur |
| Facebook Page | `979562428571695` | RaikanBersama — *Wedding planning service* |
| Instagram | `17841480083586425` | `raikanbersamaxyz` |
| Dataset / Pixel | `968435972628878` | last fired 2026-11-16 21:36 — events flowing |
| Business portfolio | `1937706830452016` | RaikanBersama |

Current spend: RM0. No campaigns, no ad sets, no creatives on the account — this
is a genuine greenfield launch, not a re-launch.

The earlier "Primary Page: None" in Business settings was misleading: the Page
**is** reachable from the ad account, so feed and Reels placements are available.

### Running the CLI

```bash
export PATH="/opt/homebrew/bin:$PATH"     # brew prefix, not on nvm PATH
cd marketing/meta-ads                      # .env lives here
meta auth status
meta ads campaign list
```

`meta ads campaign create` **defaults to `--status PAUSED`** and supports
`--dry-run`, so a campaign can be built and inspected on the account without
spending anything until it is deliberately activated.

Token lifetime: expires **2027-01-16** (~60 days). Regenerate before then —
`meta auth status` names the expiry date.

## 7c. CLI build attempt — blocked on advertiser verification

Campaign was created on the ad account and left **PAUSED**:

| Object | ID | Status |
|---|---|---|
| Campaign `RB \| C1 Pro Hero \| Sales \| 2026-11` | `120251351270700214` | PAUSED, `OUTCOME_SALES`, no budget (ABO) |
| Ad sets | none | blocked |
| Creatives | none | not built |

**The blocker:** creating the ad set with Malaysia targeting returns

```
API error (100): Invalid parameter
Provide a verified advertiser so that ads in this ad set can be delivered to
audiences in the selected locations.
```

Diagnosis:
- The same ad set with `--targeting-countries US` **was accepted** (then deleted),
  so this is **location-specific**, not an account-wide failure.
- Business portfolio `1937706830452016` reports `verification_status: pending`
  (it was `not_verified`; verification has been submitted and is in review).

So Malaysian delivery now requires a **verified advertiser**. Fix (days, not minutes):

1. Business settings → **Security Center** → *Start verification* — upload the
   business registration for `RaikanBersamaxyz` (SSM/SSB).
2. And/or ad account → **Advertiser verification** (identity confirmation).

Until that clears, no ad set for MY can be saved, by CLI or by hand.

**Second issue — video creatives via CLI.** `meta ads creative create --video`
fails with `Please specify one of image_hash or image_url in the video_data
field`, and `--image` cannot be combined with `--video` ("Provide --image or
--video, not both"). The CLI has no thumbnail flag, so video creatives must be
built either in the Ads Manager UI or through `--object-story-spec` with a
pre-uploaded `image_hash` + `video_id`.

## 8. API automation — what exists now

Meta ships an **official Ads CLI** (documented Apr 29 2026) and an **Ads MCP
server**. The CLI is installed on this machine:

```
brew tap facebook/fb && brew trust facebook/fb && brew install facebook/fb/meta-ads
meta --version   # 1.3.1
```

It needs a system user token with these scopes:

`business_management`, `ads_management`, `pages_show_list`,
`pages_read_engagement`, `pages_manage_ads`, `read_insights`

Configured via `.env` in the working directory:

```
ACCESS_TOKEN=<system user token>
AD_ACCOUNT_ID=4244078779240218
APP_ID=1640196200491938
BUSINESS_ID=1937706830452016
```

Then:

```
meta auth status
meta ads adaccount list
meta ads campaign list
```

**Current blocker:** the only token on Railway is the Conversions API token whose
entire scope list is `read_ads_dataset_quality`. It cannot read
`act_4244078779240218` — the Graph API answers
"Ad account owner has NOT grant ads_management or ads_read permission". Assigning
assets to the system user does not change an existing token; a **new token** must
be generated with the scopes above.

Keep the first launch manual regardless: audience and creative decisions deserve
human review, and `ads_management` mistakes are expensive to unwind.
