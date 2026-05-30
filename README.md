# Summer VAT Calculator — marketing site

Static site for the Summer VAT Calculator iOS app. Plain HTML, CSS, and a
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

Live on `summervatcalculator.co.uk` (CNAME committed at the root of
the public mirror). To move to a different domain:

1. In the registrar (Cloudflare/Porkbun/Namecheap), point the domain at
   GitHub Pages:
   - Apex (`example.com`): `A` records to `185.199.108.153`,
     `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (or
     `AAAA` for IPv6).
   - Subdomain (`www`): `CNAME` to `<user>.github.io`.
2. In the repo's Pages settings, set the custom domain and tick
   "Enforce HTTPS". GitHub will create/update the `CNAME` file on the
   branch.
3. Replace `summervatcalculator.co.uk` with the new origin in:
   - `<link rel="canonical">`, `og:url`, `og:image`, `twitter:image`
     in `index.html`, `maths/index.html`, `privacy/index.html`,
     `terms/index.html`, `support/index.html`
   - `url`, `image`, `logo` and every `@id` in the JSON-LD blocks
   - `<loc>` in `sitemap.xml`
   - `Sitemap:` line in `robots.txt`
   - All links in `llms.txt` and `llms-full.txt`
   - The iOS app's `LegalLinks` (`Features/Paywall/UpgradePromptFooter.swift`)
     and `SettingsView.supportURL`

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
