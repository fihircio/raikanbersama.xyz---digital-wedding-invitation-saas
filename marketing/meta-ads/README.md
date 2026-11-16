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
