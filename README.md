# VAT Summer Saver — marketing site

Static site for the VAT Summer Saver iOS app. Plain HTML, CSS, and a
single JavaScript file for the in-page calculator. No build step.

## Local preview

```bash
cd web
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Designed to deploy on GitHub Pages, Cloudflare Pages, Netlify or any
static host. No build configuration required — point the host at this
folder.

### GitHub Pages

This folder is mirrored to a public repo with Pages enabled on the
`main` branch (root). The `.nojekyll` file disables Jekyll processing
so paths starting with `_` are served correctly.

### Custom domain

1. Add the domain in the Pages settings (creates a `CNAME` file).
2. At the registrar, add a `CNAME` record pointing the domain to
   `<user>.github.io`, or `A`/`AAAA` records to GitHub's Pages IPs.
3. Update `og:url`, `canonical`, the sitemap and `robots.txt` to the
   final domain.

## Structure

- `index.html` — landing page with calculator
- `styles.css` — design tokens mirror the iOS app's `AppBrand` palette
- `calculator.js` — VAT logic mirroring `VATEngine.swift` with HMRC
  penny rounding
- `images/` — hero, beach photo, app icon, favicons, OG image
- `site.webmanifest`, `robots.txt`, `sitemap.xml`, `404.html` — SEO/PWA

## Updating VAT logic

If the iOS app's `VATEngine` or `SupplyCategory` rules change, mirror
the changes in `calculator.js` (rates, eligibility set, category
hints) and the wording in `index.html`.
