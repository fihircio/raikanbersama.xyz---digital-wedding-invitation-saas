# Organic Page posts (prepared, not yet published)

Page audience at time of writing: **0 followers** (IG: 6, 0 posts). These posts
exist to make the Page look legitimate for ad traffic, and to give boostable
post IDs — not for organic reach.

| # | Asset | Caption theme |
|---|---|---|
| 1 | `01_invite_reveal.mp4` | Full invitation, RM29 |
| 2 | `02_catalog_filter.mp4` | 122 themes |
| 3 | `04_elite_hadiah_qr.mp4` | DuitNow gift + wishlist (Elite) |
| 4 | `06_rsvp_flow.mp4` | Guests RSVP themselves |

## Publishing

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
