# DownUnder Removals

Landing page concept for DownUnder Removals (Hobart, Tasmania). Plain HTML, CSS and vanilla JS — no build step, no dependencies.

## Files

- `index.html` — page markup and an inline SVG icon sprite (each icon defined once, reused via `<use>`)
- `styles.css` — all styling
- `script.js` — mobile menu, animated stats, 2-step quote form; mounts the review carousel
- `review-carousel.js` — the Google-reviews carousel component (paging, infinite loop, native mobile scroll, the "full review" dialog). Data-driven — it doesn't know about any specific review.
- `reviews.js` — the real review content. Edit this to add/update reviews (see "Reviews" below).
- `reviews.mock.js` — dev-only edge-case fixtures (very long/short text, 1 star, half stars, no avatar, a long name, non-Latin text, emoji). **Never imported by `index.html`.**
- `dev-review-mocks.html`, `dev-review-few.html` — local-only harness pages that mount the carousel against `reviews.mock.js` / a 3-review slice, for checking edge cases without touching real content. Not linked from the site.
- `favicon.svg` — browser tab icon

## Run locally

Any static file server works, for example:

```bash
npx serve .
```

or just open `index.html` directly in a browser.

## Deploy to GitHub Pages

1. Push this branch (or merge it into your default branch).
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Pick the branch and `/ (root)` folder, then save.

No build step required — GitHub Pages serves the static files as-is.

## Reviews

The carousel reads `reviews.js` — a plain array, no build step, no CMS. To add or edit a review:

1. Open `reviews.js` and add an object to the `reviews` array. Follow the shape already there: `id`, `author`, `rating` (1–5, halves allowed), `text`, `publishedAt` (`YYYY-MM-DD`), and optionally `reviewUrl`, `avatarUrl`, `languageCode`.
2. **Copy the review text literally** — no fixing typos, no trimming, no removing emoji. Rewriting or inventing a customer review is prohibited under EU law (the Omnibus Directive, transposed into Spain's consumer protection law) and in the US (the FTC's fake-reviews rule), both with real penalties. If a review needs to look shorter on the card, that's handled visually by the 4-line clamp in CSS — the text in `reviews.js` stays whole either way, and the full text is always in the DOM and in the "read more" dialog.
3. Give it a **hand-written, stable `id`** (e.g. `"maria-g-2025-03"`), never reuse another review's id or leave it to array position. The id is what the DOM keys off, so a stable id is what keeps a newly-inserted review from being confused with an existing one.
4. Reload the page — nothing else needs to change. Ratings and review count shown in the intro panel are computed from the array, not hardcoded.

Before publishing any of this as "reviews from Google," every card needs to correspond to an actual published review on the business's Google Business Profile — see point 2.

### Connecting the real Google Places API later

Right now reviews are entered by hand. When/if this switches to pulling live from Google, keep in mind:

- The API call has to happen **server-side** — an API key embedded in this static site's JS would be public to anyone who views source.
- Places API (New) returns **at most 5 reviews** per request, order and selection vary between calls, and its terms don't allow pre-caching/storing results beyond specific narrow exceptions — so there's no legitimate way to accumulate a bigger set over time. The carousel already has to look right with only 5 cards (see the "3 reviews, no arrows" case), so this isn't a problem for the UI — just don't build a "review database" behind it. Going over 5 requires the separate Google Business Profile API, which needs its own request/approval process.
- Displaying Places data without a map still requires showing the Google logo and linking attribution back to the reviewer, which the card design already does (the small "G" badge, and `reviewUrl` when present).
- Once wired up, the API response gets normalized into the same `Review` shape `reviews.js` uses today — `review-carousel.js` doesn't need to change at all.

## Notes

- The quote form is a front-end preview only; wire the `submit` handler in `script.js` up to an email service or CRM before launch.
- Stats in the stats bar are placeholder content — replace with real numbers before publishing.
- The hero and "why us" photos load from Unsplash and the map from Google Maps embed; both need normal internet access to render (they won't load in network-restricted sandboxes).
- `styles.css` and `script.js` are linked with a `?v=N` query string. Browsers (and GitHub Pages' CDN) cache plain filenames aggressively, so after editing either file (or `review-carousel.js`/`reviews.js`, which `script.js` imports) bump `N` in `index.html` — otherwise visitors can see new markup paired with a stale cached stylesheet/script.
