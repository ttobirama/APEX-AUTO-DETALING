# SECURITY AUDIT — APEX AUTO DETAILING template

**Date:** 2026-08-17
**Scope:** All files in the repo (static site + `api/book.js` serverless endpoint)
**Stack:** Zero-dependency vanilla HTML/CSS/JS · optional Vercel/Netlify deployment

> Security is an ongoing process. This audit covers the current state of the
> repository; re-run it after any change to the booking endpoint, config
> schema, or deployment setup. Nothing here claims the site is "100% secure".

---

## Findings summary

| # | Severity | Finding | Status |
|---|----------|---------|--------|
| 1 | **High** | Booking endpoint had no abuse protection (spam, email-credit burn) | ✅ Fixed |
| 2 | **High** | Endpoint accepted any Content-Type → cross-site form-submission (CSRF) vector | ✅ Fixed |
| 3 | Medium | No body-size or field-length limits on the endpoint | ✅ Fixed |
| 4 | Medium | No timeout on the Resend email call (slow upstream pins the function) | ✅ Fixed |
| 5 | Medium | No security headers (CSP, nosniff, frame protection, etc.) on static hosting | ✅ Fixed |
| 6 | Low | User input flowed into the notification email un-sanitized (control chars / length) | ✅ Fixed |
| 7 | Low | No `.gitignore` / `.env.example` — `.env` could be committed by the buyer | ✅ Fixed |
| 8 | Low | A few config `href`s interpolated without escaping in `render.js` | ✅ Fixed |
| 9 | Info | Newsletter form is client-side only (demo) — no backend, no data leaves the browser | ⚠️ By design (documented) |
| 10 | Info | No secrets, keys, or credentials found anywhere in the repo | ✅ Confirmed clean |

No **Critical** findings. The site is static with no database, no sessions, no
user accounts, and no file uploads, which removes entire vulnerability classes
(SQL/NoSQL injection, auth bypass, IDOR, path traversal, unsafe file ops).

---

## Details

### 1. HIGH — No abuse protection on the booking endpoint (`api/book.js`)

**Before:** The endpoint validated fields but accepted unlimited requests. With
`RESEND_API_KEY` configured, each spam POST would consume an email credit and
waste function time.

**Fixed:**
- In-memory sliding-window rate limit — **5 requests / 10 minutes per IP**
  (applied before any parsing work), returning HTTP 429 with a user-friendly
  message.
- **Honeypot trap:** invisible `website` field in the form; bots that fill it
  receive a fake 200 and the submission is discarded before validation/email.
- **Body size cap** (16 KB) and **per-field length caps** (name ≤ 120, contact
  ≤ 320, vehicle/service ≤ 120, notes ≤ 2000, …) — both return 400/413.
- Body must be a plain JSON object (arrays/strings/null rejected).

**Remains:** the limiter is in-memory, so on serverless it is per-instance —
a deterrent, not a guarantee. A hard global limit needs a shared store
(Upstash / Vercel KV). See *Future improvements*.

### 2. HIGH — Cross-site form-submission abuse (CSRF on the booking endpoint)

**Before:** a malicious page could embed a plain HTML form posting
`application/x-www-form-urlencoded` to `/api/book`; the handler parsed
Vercel's pre-parsed body and accepted the fake booking.

**Fixed:**
- The endpoint now **requires `Content-Type: application/json`** (HTTP 415
  otherwise). HTML forms cannot send JSON, which closes the browser CSRF
  vector entirely.
- **Origin gate:** optional `ALLOWED_ORIGIN` env var (comma-separated). When
  set, requests whose `Origin`/`Referer` don't match are rejected (403), and
  CORS preflights are answered only for that origin. Unset = same-origin only
  (no CORS headers emitted) — the correct default when the site and function
  ship together on Vercel.
- `OPTIONS` preflights are handled explicitly (never a wildcard `*`).

### 3. MEDIUM — Unbounded request body / fields

Fixed with the 16 KB body cap and per-field length caps above; oversized
requests are rejected before any processing or email work.

### 4. MEDIUM — Hanging email upstream

Fixed with an `AbortController` timeout (**8 s**) around the Resend fetch;
failures and aborts never reject a booking (best-effort semantics preserved).

### 5. MEDIUM — No security headers on static hosting

**Before:** Vercel/Netlify served the site with default headers.

**Fixed:** `vercel.json` (Vercel) and `_headers` (Netlify) now ship:

- `Content-Security-Policy` — `default-src 'self'`; scripts same-origin only;
  styles allow Google Fonts + inline style attributes (the renderer sets
  per-card accent colors via `style` attributes); fonts from `fonts.gstatic.com`;
  images allow `data:` (favicon) and `https:` (client photos); `connect-src`
  allows `self` + `https:` (booking endpoint / Formspree); frames limited to
  Google Maps (`frame-src https://www.google.com https://maps.google.com`);
  `object-src 'none'`; `base-uri 'self'`; `form-action 'self' https:`;
  **`frame-ancestors 'none'`** (clickjacking).
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` (older-browser fallback for frame protection)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` (HTTPS-only hosts)

The CSP was checked against every resource the pages actually load (3 local
scripts, Google Fonts, Google Maps embed, data-URI favicon) so it does **not**
break the site. Deliberate omission: `upgrade-insecure-requests` — it would
break plain-HTTP preview/hosting; production traffic is HTTPS via both hosts.
`api/book.js` additionally sets `nosniff`, `DENY`, `no-referrer`, and
`Cache-Control: no-store` on every API response.

**Remains:** other hosts (nginx, Apache, GitHub Pages…) must apply the same
headers at the server level — `_headers` contains the exact values to copy.
Switching the map provider requires updating `frame-src` in both files.

### 6. LOW — Email content hygiene

The notification email is plain text (no HTML injection risk), but user input
is now **control-character-stripped** (including CR/LF — email header-injection
hygiene), trimmed, length-capped, and the subject is truncated to 120 chars.
The honeypot field is excluded from the email.

### 7. LOW — Git hygiene for a resellable deliverable

Added `.gitignore` (`.env`, `*.pem`/`*.key`, `.vercel/`, `.netlify/`,
`node_modules/`, build output, editor files) and `.env.example` documenting
`RESEND_API_KEY`, `BOOKING_TO_EMAIL`, `ALLOWED_ORIGIN`. The repo is not yet a
git repository, so there is no history to scrub — the guardrail now exists for
when the buyer runs `git init`.

### 8. LOW — Unescaped config hrefs in `render.js`

`phone.href`, `text.href`, and the footer phone link were interpolated without
`esc()`. Config is trusted (edited by the site owner), but every config value
is now escaped consistently — defense in depth if config ever becomes
CMS-editable. All other interpolations already ran through `esc()`.

### 9. INFO — Newsletter form

`#newsForm` validates email format and shows "Subscribed ✓" but has **no
backend** — nothing is sent or stored. This is intentional demo behavior, but
a buyer could assume it works. Documented in this audit and the README;
wire it to a real service or remove it before delivery if the client expects
functional signups.

### 10. INFO — Secrets scan

Pattern-scanned all `.js`, `.html`, `.md`, `.json`, `.xml`, `.txt` files for
API keys, tokens, passwords, private keys, and credential patterns (including
AWS `AKIA`, Google `AIza`, `sk-`/`pk-`, `BEGIN … PRIVATE KEY`). **No secrets
found.** The only key-like strings are environment variable *names* referenced
in code/docs (`process.env.RESEND_API_KEY`), never values. No `.env` file
exists in the repo. Not a git repo → no history to audit.

---

## Code-review checklist results (security-focused)

| Check | Result |
|-------|--------|
| SQL / NoSQL injection | N/A — no database |
| Command injection | N/A — no shell execution |
| `eval` / `new Function` / `document.write` | None present (verified by scan) |
| XSS sinks (`innerHTML` with untrusted input) | None — all rendered content is `esc()`-escaped config; user input (booking form) is sent to the API, never rendered back; server errors shown via `textContent` |
| Insecure redirects (`target="_blank"` without `rel="noopener"`) | None — all external links have `rel="noopener"` |
| Client-side-only authorization | N/A — no authorization model |
| Insecure direct object references / IDOR | N/A — no per-user resources |
| Sensitive data in client bundle | None — secrets are server-side env vars only |
| Debug mode / verbose errors in production | None — API errors are generic, human-readable messages |
| Insecure defaults | Endpoint defaults to same-origin, JSON-only, rate-limited, honeypot-guarded |

---

## What remains / future improvements

1. **Global rate limiting** (recommended before heavy traffic): put an
   Upstash or Vercel KV-backed limiter in front of `/api/book` — the in-memory
   limiter is per serverless instance.
2. **Captcha** (Turnstile/hCaptcha) on the booking form if spam becomes an
   issue despite the honeypot + rate limit.
3. **Webhook delivery** (Slack/CRM) instead of email would remove the Resend
   dependency and add delivery confirmation.
4. **Subresource Integrity** for the Google Fonts stylesheet if you want to
   defend against a compromised CDN (the CSS is versioned via `css2` API;
   current browsers accept `sri` on stylesheets).
5. **Legal review** of `legal.html` before a real business goes live
   (privacy policy must reflect actual data processing).
6. **Newsletter backend** decision (wire to a real ESP or remove the form).
7. **Re-run this audit** after the buyer replaces demo content with real
   business data, since config values become production-facing.

---

## Verification performed after the fixes

- All JS parses (config, render, main, api/book).
- `api/book.js` behavior harness: 405 method gate · 415 non-JSON gate ·
  400 missing fields / bad contact / past date / over-long field ·
  413 oversized body · 403 wrong origin (with `ALLOWED_ORIGIN` set) ·
  200 valid booking · honeypot short-circuit returns 200 with no processing ·
  429 after exceeding the rate window.
- Full site regression harness: all JS-referenced IDs exist, all used CSS
  classes covered, DOM balanced, local links resolve, no unsafe remnants.
- All pages and assets serve HTTP 200 (index, legal, css, js, headers files).
- `vercel.json` validated as JSON; header set cross-checked against every
  resource the pages load (scripts, fonts, map iframe, favicon).
