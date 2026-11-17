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
