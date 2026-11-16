# Ad footage — portal screen recordings

Real UI capture of raikanbersama.xyz, recorded headlessly at iPhone size
(390x844 CSS px), upscaled to 1080x2340, H.264, 30fps.

| Clip | Content | Length | Suggested use |
|---|---|---|---|
| `01_invite_reveal.mp4` | Buka reveal → invitation body, countdown, guest dock | 8.6s | A1, B1 hook |
| `02_catalog_filter.mp4` | Catalog, 2-up design grid (real production data) | 10.2s | B1 Catalog Explorer |
| `03_pricing_pro.mp4` | Pro RM49 card, PILIHAN POPULAR badge | 3.9s | C1 Pro Hero |
| `04_elite_hadiah_qr.mp4` | HADIAH modal: DuitNow QR, Maybank, copy-account, wishlist | 9.0s | B3 / B5 Elite, retargeting |
| `05_elite_lokasi.mp4` | LOKASI modal: map, Waze + Google Maps | 6.0s | B3 feature deep-dive |
| `06_rsvp_flow.mp4` | SAHKAN KEHADIRAN: RSVP form | 6.0s | B2 RSVP deep-dive |

Recorded against the Elite sample invitation `sample-pakej-kayangan`
(real production data: Maybank `1234567890` "Ahmad & Sarah", 2 wishlist items).

## Re-recording

    cd marketing/recorder
    npm i playwright-core
    npx playwright install ffmpeg   # needed for video capture
    node record-invitation-flows.js # needs Node >= 20

The script asserts on modal content (e.g. waits for "Maybank") before it
records, and ends each flow with a 4 second still hold. That hold is what makes
trimming deterministic: cut the last N seconds and you are guaranteed to land on
a fully settled modal, not a mid-fade frame.

## Known quirks

- Playwright records video at CSS pixels regardless of `deviceScaleFactor`, so
  the video canvas must equal the viewport or you get grey voids.
- The site ignores `window.scrollTo`; scrolling must be driven with
  `page.mouse.wheel`.
- The dock sits under a floating CTA, so a forced Playwright click is
  intercepted. Dispatch `element.click()` instead.
- Fine serif text is slightly soft from the 1x upscale. For hero shots, capture
  on the real device via Openscreen at Retina.
