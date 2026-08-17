# APEX AUTO DETAILING — Resellable Website Template

A premium, single-page website for an auto detailing business. Luxury "champagne noir"
design — deep charcoal base, champagne-gold accents, Fraunces serif display type paired
with Inter — and a centralized config file: **every piece of business content lives in
one place**, so the template can be rebranded for any detailing company in minutes.

> ⚠️ **Demo data notice.** All business details (name, phone, address, reviews,
> prices) are fictional placeholders, clearly marked in the config. Replace them
> with the client's real information before going live. The live site displays a
> "demo" notice in the contact section and footer until `isDemo: false`.

---

## What's included

| File | Purpose |
| --- | --- |
| `index.html` | Page structure, SEO head, JSON-LD structured data |
| `css/style.css` | Full design system (tokens, sections, responsive) |
| `js/config.js` | ⭐ **Single source of truth** — all business content & pricing |
| `js/render.js` | Renders config → DOM (do not edit for content changes) |
| `js/main.js` | Interactivity: calculator, before/after, gallery, booking, FAQ |
| `legal.html` | Privacy policy, terms & accessibility statement |
| `sitemap.xml` / `robots.txt` | SEO essentials |

### Features

- **Quote calculator** — vehicle × condition × service + add-ons, live estimate,
  **shareable links** (`?v=&c=&s=&a=` — a quote survives reload and can be sent
  to a client as a link)
- **Before / after slider** — drag to compare; real photos auto-load from
  `assets/img/` with built-in art as fallback
- **Gallery with filters + lightbox** — keyboard navigable, category filters
- **Booking form** — service/vehicle selects, date & time, success confirmation,
  and an optional **real backend** (Formspree or the bundled Vercel function)
  with proper error states
- **FAQ accordion, scroll reveals, stat counters**
- **Mobile action bar** — Call / Text / Book always one tap away on phones
- **SEO** — meta tags, Open Graph, JSON-LD `AutoDetail` local-business schema,
  sitemap, robots.txt
- **Accessibility** — skip link, ARIA on accordion/lightbox/drawer, keyboard
  support, `prefers-reduced-motion` respected
- **Zero build step** — plain HTML/CSS/JS, deploys anywhere

---

## Rebranding for a client (the 10-minute version)

### 1. Edit `js/config.js` — everything is here

```js
window.APEX_CONFIG = {
  business: { name: 'YOUR CLIENT NAME', phone: { ... }, email: '...', address: { ... }, hours: [...] },
  services: [...],        // each: name, desc, price, duration, features, accent
  packages: [...],        // each: name, price, tag, blurb, features
  calculator: { ... },    // pricing multipliers & add-ons
  gallery: [...],         // each: category, title, img
  testimonials: [...],    // each: quote, name, detail, initials, avatar
  faqs: [...],
  seo: { title, description, canonical, ogImage, localBusiness }
};
```

Key switches:

| Setting | Where | Notes |
| --- | --- | --- |
| Business name/phone/address/hours | `config.business` | Also updates nav, contact, footer, JSON-LD |
| Phone number shown in nav/mobile bar | `config.business.phone` | |
| Prices & duration | `config.services` / `config.packages` | |
| Calculator math | `config.calculator` | `price × vehicle × condition + add-ons` |
| Map embed | `config.business.mapsEmbedUrl` | Paste the client's Google Maps embed URL |
| SEO / structured data | `config.seo` | Title, description, canonical, geo coords |
| Demo notice | `config.business.isDemo` | Set `false` to remove "demo site" labels |

### 2. Replace the demo photos with the client's own

The template ships with a **complete demo photo pack** (17 photos) wired into
`config.js` — so the site looks like a real business out of the box:

| Where | Files |
| --- | --- |
| Services (6) | `assets/img/interior-detail.webp` · `exterior-detail.webp` · `full-detail.webp` · `paint-correction.webp` · `ceramic-coating.webp` · `maintenance-detail.webp` |
| Gallery (9) | `assets/img/gallery-interior-1.webp` … `gallery-ceramic-2.webp` |
| Before / after | `assets/img/before.webp` · `after.webp` — the **same car** (16:9, pixel-aligned): the "before" is a digitally dusted variant of the "after", so dragging the slider cleans one identical vehicle |

The demo photos are stock shots from [Pexels](https://www.pexels.com) — free
for commercial use, no attribution required (see *Photo credits* below). They
are placeholders: replace them with the client's real work before delivery, and
the `img` fields in `js/config.js` are the one place to point.

**Photo credits (Pexels — free license, no attribution required):**

| File | Pexels photo |
| --- | --- |
| interior-detail.webp | [Car wash professional cleaning vehicle interior](https://www.pexels.com/photo/29504462/) |
| exterior-detail.webp | [Luxury SUV in modern car wash with foam](https://www.pexels.com/photo/29922284/) |
| full-detail.webp | [Car detailing professional at work in garage](https://www.pexels.com/photo/29504461/) |
| paint-correction.webp | [Man polishing car with electric buffer in workshop](https://www.pexels.com/photo/28571826/) |
| ceramic-coating.webp | [Close-up of sleek car hood with water droplets](https://www.pexels.com/photo/29909550/) |
| maintenance-detail.webp | [Person washing car with soap and sponge](https://www.pexels.com/photo/29922283/) |
| gallery-interior-1.webp | [Luxury car steering wheel interior shot](https://www.pexels.com/photo/33825765/) |
| gallery-exterior-1.webp | [Luxury SUV covered with soap at car wash](https://www.pexels.com/photo/28995189/) |
| gallery-paint-1.webp | [Auto detailing professional polishing car](https://www.pexels.com/photo/37809558/) |
| gallery-ceramic-1.webp | [Sprays and cloths on table near sports cars](https://www.pexels.com/photo/20042048/) |
| gallery-interior-2.webp | [Luxury car interior — McLaren 765LT](https://www.pexels.com/photo/30479265/) |
| gallery-exterior-2.webp | [Close-up of a car wheel during a car wash](https://www.pexels.com/photo/32667420/) |
| gallery-paint-2.webp | [Man polishing car door with electric buffer](https://www.pexels.com/photo/35149469/) |
| gallery-ceramic-2.webp | [Close-up of car logo with rain drops](https://www.pexels.com/photo/37676549/) |
| gallery-interior-3.webp | [Luxury car interior with sleek design features](https://www.pexels.com/photo/36806219/) |
| after.webp | [Sleek car hood with reflective surface and trees](https://www.pexels.com/photo/38827316/) |
| before.webp | Derived from `after.webp` — the **same car**, digitally dusted (dull warm-gray film + grime mottling) so the slider shows one vehicle being cleaned. Replace with a real photo of the client's dirty car before delivery. |
| hero-card.webp | [Luxury black car hood with reflection in showroom](https://www.pexels.com/photo/29566864/) — hero "Ultimate Standard" card |

> The demo photos are licensed under the Pexels License for the *template* —
> the client's real site should use their own photography so the images match
> their actual work. If the client supplies their own photos, drop them into
> `assets/img/` and update the `img` fields in `config.js`.

### (Optional) Auto-detected photos

If you delete an `img` field, the site **auto-detects** photos again: drop a
file into `assets/img/` named after the item — no config editing required.

| Where | Auto-detected filename |
| --- | --- |
| Services | `assets/img/<service-name>.jpg` e.g. `ceramic-coating.jpg`, `interior-detail.jpg` |
| Gallery | `assets/img/<photo-title>.jpg` or `assets/img/gallery-01.webp` … `gallery-09.jpg` |
| Before / after | `assets/img/before.webp` and `assets/img/after.webp` |

`.jpg`, `.jpeg` and `.webp` are all tried, in that order. The demo pack ships as **WebP** (`assets/img/*.webp`). For each item the site
probes the conventional filenames; the first file that exists replaces the
built-in art automatically. If no file exists, the stylised art simply stays —
so the template never looks broken while photos are being gathered.

For full control, set an explicit `img` field instead (skips auto-detection):

```js
// services & gallery
{ name: 'Ceramic Coating', img: 'assets/img/custom/custom-name.jpg', ... }

// before/after comparison
beforeAfter: {
  beforeImg: 'assets/img/custom/before.jpg',
  afterImg:  'assets/img/custom/after.jpg',
}
```

### 3. Replace logo & favicon

- Logo: swap the inline SVG in `index.html` (`.nav__logo`) and the footer brand block.
- Favicon: replace the `data:image/svg+xml` favicon link in the `<head>`.

### 4. Update `index.html` head

- `<title>` / meta description (or just edit `config.seo` — the head is pre-filled
  with the same demo values).
- The JSON-LD `AutoDetail` block (address, phone, geo) — keep it in sync with
  `config.seo.localBusiness`.
- `sitemap.xml` / `robots.txt` domain.

### 5. Update the legal page

`legal.html` ships with professional placeholder privacy / terms / accessibility
copy (linked from the footer). Replace the demo details — business name, address,
contact email, and any third-party services in use (Formspree, map embeds,
analytics) — and have the text reviewed by legal counsel before going live.

### 6. Connect the booking form (optional)

By default the form simulates success (demo mode — nothing is sent anywhere).
To receive real submissions, set a backend in `js/config.js`:

```js
booking: { endpoint: 'https://formspree.io/f/yourFormId' }  // or any JSON POST URL
```

**Option A — Formspree (no code):** create a free form at formspree.io, paste its
URL into `booking.endpoint`. The site POSTs JSON; Formspree emails you each
submission. Success and error states (including Formspree's returned messages)
are handled automatically.

**Option B — bundled Vercel function:** the `api/` folder contains a ready
serverless function (`api/book.js`) that validates name/contact/date server-side
and can email bookings via [Resend](https://resend.com). Deploy the folder to
Vercel, then set:

```js
booking: { endpoint: 'https://<your-project>.vercel.app/api/book' }
```

Optionally add the Vercel env vars `RESEND_API_KEY` and `BOOKING_TO_EMAIL` to
forward submissions by email. Copy `.env.example` to `.env` locally (or set the
vars in the Vercel/Netlify dashboard) — **never commit real secrets**; `.env` is
gitignored. See the comments at the top of `api/book.js`.

The bundled endpoint is hardened for production:

- **JSON-only** — requests without `Content-Type: application/json` are
  rejected, which also blocks cross-site form-submission abuse.
- **Validation** — required fields, contact format, future date, per-field
  length caps, and a 16 KB body limit, all enforced server-side.
- **Honeypot trap** — an invisible `website` field; bots that fill it are
  silently discarded.
- **Rate limiting** — in-memory sliding window (5 requests / 10 min per IP).
  This is a per-instance deterrent on serverless; for a hard global limit put
  an Upstash / Vercel KV-backed limiter in front of the function.
- **Origin gate** — set `ALLOWED_ORIGIN` to restrict cross-origin callers;
  unset means same-origin only (no CORS headers emitted).
- **Safe failure** — the Resend email forward is best-effort with an 8s
  timeout, never rejects a booking, and never leaks internals in responses.

### 7. Set `isDemo: false` and go live

---

## Deployment

No build step — upload the folder as-is.

**Vercel** (free):
1. `vercel` in the project root, or import the folder from GitHub.
2. Set the production domain in project settings.
3. Done — static files are served as-is. The optional `api/` folder is
   auto-detected as serverless functions (no config needed).

**Netlify** (free):
1. Drag-and-drop the folder into app.netlify.com, or connect the repo.
2. Build command: *(none)* · Publish directory: `.` (the project root).
3. Set the custom domain in **Domain settings**.

**Any static host / CDN** works the same way (GitHub Pages, Cloudflare Pages, nginx…).

Update the canonical URL, `sitemap.xml`, `robots.txt`, and JSON-LD `url` fields to
the client's real domain after deploying.

### Security headers (served automatically on Vercel & Netlify)

`vercel.json` (Vercel) and `_headers` (Netlify) ship a production header set:

- **Content-Security-Policy** — scripts are same-origin only; styles allow
  Google Fonts + inline style attributes (the renderer sets per-card accent
  colors); images allow `data:` (favicon) and `https:` (client photos); frames
  are limited to Google Maps; the page cannot be framed by other sites
  (`frame-ancestors 'none'`).
- **`X-Content-Type-Options: nosniff`** · **`X-Frame-Options: DENY`**
- **`Referrer-Policy`** · **`Permissions-Policy`** (camera/mic/geo/payment off)
- **`Strict-Transport-Security`** (HSTS, 1 year)

Notes:
- If you switch the map embed to a provider other than Google Maps, update
  `frame-src` in both files (and `mapsEmbedUrl` in `js/config.js`).
- `upgrade-insecure-requests` is intentionally *not* set so the template keeps
  working when previewed over plain HTTP; production traffic is HTTPS.
- Hosts other than Vercel/Netlify (nginx, Apache…) need these headers
  configured at the server level — see `_headers` for the exact values.
- `api/book.js` also sets `nosniff`, `DENY`, `no-referrer`, and `no-store` on
  every API response.

---

## Project structure

```
apexauto/
├── index.html          # page shell + SEO head + JSON-LD
├── css/style.css       # design system
├── js/
│   ├── config.js       # ⭐ all business content & pricing
│   ├── render.js       # config → DOM renderer
│   └── main.js         # interactivity (calculator, photos, booking…)

├── api/book.js         # optional Vercel booking endpoint (hardened: validate + email)
├── vercel.json         # Vercel config + security headers
├── _headers            # Netlify security headers (same set)
├── .env.example        # server-side env vars template (RESEND_API_KEY etc.)
├── legal.html          # privacy / terms / accessibility
├── assets/img/         # demo photo pack (Pexels) — swap in client photos
├── sitemap.xml
├── robots.txt
└── README.md
```

## Local preview

```bash
# from this folder
python -m http.server 8000
# or
npx serve .
```

Then open `http://localhost:8000`.
