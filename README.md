# DownUnder Removals

Landing page concept for DownUnder Removals (Hobart, Tasmania). Plain HTML, CSS and vanilla JS — no build step, no dependencies.

## Files

- `index.html` — page markup and an inline SVG icon sprite (each icon defined once, reused via `<use>`)
- `styles.css` — all styling
- `script.js` — mobile menu, animated stats, 2-step quote form, review carousel
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

## Notes

- The quote form is a front-end preview only; wire the `submit` handler in `script.js` up to an email service or CRM before launch.
- Stats in the stats bar and the review carousel are placeholder content — replace with real numbers and real Google reviews before publishing.
- The hero and "why us" photos load from Unsplash and the map from Google Maps embed; both need normal internet access to render (they won't load in network-restricted sandboxes).
