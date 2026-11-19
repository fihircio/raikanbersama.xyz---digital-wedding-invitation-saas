# Organic Page posts — PUBLISHED

Page audience at time of writing: **0 followers**. Instagram `raikanbersamaxyz`
has **6 followers and 11 feed posts** (verified with `instagram_basic`).

> Correction: an earlier check reported IG as "0 posts". That reading was taken
> with a token lacking `instagram_basic`, and the API returns a misleading
> `media_count: 0` in that case. With the scope granted, the real count is 11.

Crossposting is real and working: IG posts mirror the Facebook Page with a
~2 second offset (FB 14:32:02 → IG 14:32:04), same content, same schedule.
All 11 IG items are `FEED` — there are **no Reels yet**.

API video uploads to the Page do **not** crosspost to IG (the Reel published
2026-11-17 is Facebook-only; IG's newest item is still 2026-06-17). These posts
exist to make the Page look legitimate for ad traffic, and to give boostable
post IDs — not for organic reach.

| # | Asset | Caption theme |
|---|---|---|
| 1 | `01_invite_reveal.mp4` | Full invitation, RM29 |
| 2 | `02_catalog_filter.mp4` | 122 themes |
| 3 | `04_elite_hadiah_qr.mp4` | DuitNow gift + wishlist (Elite) |
| 4 | `06_rsvp_flow.mp4` | Guests RSVP themselves |

## Live status

| # | Video ID | State |
|---|---|---|
| 1 reveal | `29487071090916483` | **live** — https://www.facebook.com/reel/29487071090916483/ |
| 2 katalog | `1672896914539519` | scheduled 2026-11-18 19:00 MYT |
| 3 hadiah | `1847064959938140` | scheduled 2026-11-19 19:00 MYT |
| 4 rsvp | `2120259278600718` | scheduled 2026-11-20 19:00 MYT |

Post 1 is `979562428571695_122150446635244956`; it published as a Reel.
The page had 12 posts before this, the newest from 2026-06-17.

## Publishing (for future posts)

```bash
cd marketing/meta-ads
./publish-posts.sh check   # verify permissions, publishes nothing
./publish-posts.sh now     # post #1 live, #2-#4 scheduled daily 19:00 MYT
./publish-posts.sh all     # all four immediately
```

**Requires `pages_manage_posts` on the system user token.** The current token
has `pages_manage_ads`, `pages_show_list`, `pages_read_engagement` — but not
`pages_manage_posts`, so posting fails with:

```
(#200) ... requires pages_manage_posts permission
```

An existing token cannot gain scopes; it has to be regenerated in Business
settings → Users → System users → **Generate new token**, ticking
`pages_manage_posts`. Add `instagram_basic` + `instagram_content_publish` as
well if you want IG cross-posting later.

Instagram publishing is not covered here: the IG account has 0 posts and the
token has no IG scopes, so cross-post from Meta Business Suite instead.


## Instagram — 4 Reels published 2026-11-17

Instagram ingests video by **public URL**, so clips were uploaded to S3
(`raikanbersamaxyz` bucket, `marketing/ig-reels/*.mp4`) and passed as short-lived
signed URLS. Publishing is in `backend/publish-ig-reels.mjs`.

| Slot | Reel |
|---|---|
| reveal | https://www.instagram.com/reel/Df1DDe9lQlP/ |
| katalog | https://www.instagram.com/reel/Df1DLo5lY7Q/ |
| hadiah | https://www.instagram.com/reel/Df1DX1nmebh/ |
| rsvp | https://www.instagram.com/reel/Df1DdnYiqRH/ |

Before this the account had 11 FEED posts and **zero Reels**.

### Known limitation: profile cannot be edited via API

Updating bio/website is not supported by the Instagram Graph API:

```
Unsupported post request ... does not support this operation
```

Editing `biography` or `website` must be done manually in the Instagram app
(Edit profile). The profile's `website` field is currently **null**; the link
lives inside the bio text and points at a sample invitation:
`raikanbersama.xyz/i/sample-pakej-kayangan`.

Recommended replacement (single destination, tracked):

```
https://www.raikanbersama.xyz/pricing?utm_source=instagram&utm_medium=social&utm_campaign=bio
```

Why not Linktree: it inserts a redirect and an intermediate page between an
interested visitor and the product, hides the real domain, and breaks UTM
attribution unless configured carefully. If multiple links are genuinely needed
(catalog, pricing, affiliates), host a link page on the project's own domain
rather than a third-party.


## Organic calendar — Facebook Page

| Date (MYT) | Post | Form | Link |
|---|---|---|---|
| 17 Nov 11:55 | Invitation reveal | Reel | facebook.com/reel/29487071090916483 |
| 18 Nov 19:00 | Catalog / 122 themes | Reel | facebook.com/reel/1672896914539519 |
| 18 Nov 13:01 | 5-step tutorial (images) | Carousel | facebook.com/122150446917244956/posts/122150548617244956 |
| 19 Nov 19:00 | DuitNow QR + wishlist | Reel | scheduled |
| 20 Nov 19:00 | RSVP flow | Reel | scheduled |
| 21 Nov 19:00 | Lokasi / Waze | Reel | scheduled (video 2231591007485786) |

## Organic calendar — Instagram

| Date (MYT) | Post | Form | Link |
|---|---|---|---|
| 17 Nov 12:14 | Invitation reveal | Reel | instagram.com/reel/Df1DDe9lQlP/ |
| 17 Nov 12:15 | Catalog | Reel | instagram.com/reel/Df1DLo5lY7Q/ |
| 17 Nov 12:17 | DuitNow QR | Reel | instagram.com/reel/Df1DX1nmebh/ |
| 17 Nov 12:18 | RSVP flow | Reel | instagram.com/reel/Df1DdnYiqRH/ |
| 18 Nov 13:01 | 5-step tutorial (images) | Carousel | instagram.com/p/Df3tOg_GInU/ |

Instagram has no scheduling API, so the Lokasi Reel has to be published by hand
(or via `backend/publish-ig-reels.mjs`) to match the Page post on 21 Nov.

## Deliberately not posted

`03_pricing_pro.mp4` is 3.9s — too short for Reels. It is reserved for the
retargeting campaign (D2), where a price anchor suits people who already started
checkout. It also exists as an ad creative already (see assets-uploaded.json).
