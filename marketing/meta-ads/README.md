# meta-ads — a Meta Marketing API helper

Meta ships **no** official "Facebook CLI". Managing Ads Manager from a terminal
just means calling the Graph API with an access token, so this is a thin,
read-only wrapper around the handful of endpoints needed for a launch.

## Setup

1. Get a token (see below) and save it:

```bash
echo 'META_ACCESS_TOKEN=paste_token_here' > .env.local
```

2. Check it:

```bash
node meta.mjs doctor
node meta.mjs assets
```

Requires Node 18+ (uses global `fetch`). No dependencies.

## What the system user must have assigned

A system user only sees what is assigned to it. For ads management you need
**five** asset types, not two:

| Asset | Permission needed | Why |
|---|---|---|
| Ad account | **Full control** (or Manage campaigns) | without it the token cannot create anything |
| Facebook Page | Advertise / Manage Page | the Page is the ad identity in feed and Reels |
| Instagram account | Manage / Create content | IG placements |
| Pixel | View / Manage | conversion attribution |
| App | at minimum Partial access | the token is issued through the app |

The Conversions API system user typically only has **App + Pixel** assigned,
which is enough to send server events but cannot touch campaigns. That is why
`node meta.mjs doctor` reports `ads_read` / `ads_management` / `business_management`
as missing no matter how many times a token is regenerated.

Check with: Business settings → Users → System users → (select user) →
**Assigned assets**. The counter should read 5+ assets and list the ad account.

## Getting a token that can manage ads

The Conversions API token cannot do this — its only scope is
`read_ads_dataset_quality`.

1. `business.facebook.com` → **Business settings** → **Users** → **System users**
2. Pick the system user that owns the ad account (or add one)
3. **Add assets** → Ad accounts → assign the RaikanBersama ad account
   (also assign the Facebook Page and Instagram account)
4. **Generate new token** → select the app → tick:
   - `ads_read`
   - `ads_management`
   - `business_management`
   - `pages_read_engagement`
5. Copy the token — it is shown once.

If the app does not offer `ads_management`, add the **Marketing API** product to
that app in `developers.facebook.com` first.

## Commands

| Command | Purpose |
|---|---|
| `node meta.mjs doctor` | token validity, expiry, granted scopes, missing ads scopes |
| `node meta.mjs assets` | business portfolios → ad accounts, pages, IG accounts |
| `node meta.mjs accounts` | ad accounts |
| `node meta.mjs pages` | pages |
| `node meta.mjs campaigns act_<id>` | existing campaigns |

Everything here is **read-only**. Creating campaigns is deliberately not
implemented yet: the first launch should be done by hand in Ads Manager so the
audience and creative decisions get human review.
