// ============================================================================
// APEX AUTO DETAILING — optional booking endpoint (Vercel serverless function)
// ============================================================================
// Deploying this folder to Vercel gives you a real POST endpoint at:
//     https://<your-project>.vercel.app/api/book
//
// Then set it in js/config.js:
//     booking: { endpoint: 'https://<your-project>.vercel.app/api/book' }
//
// What it does:
//   1. Accepts ONLY application/json POSTs (this also blocks cross-site
//      form-submission abuse — plain HTML forms can't send JSON).
//   2. Validates required fields, contact format, date, field lengths, and
//      total body size (server-side — the form's checks are just UX).
//   3. Rejects suspicious traffic: honeypot fields, unknown origins (when
//      ALLOWED_ORIGIN is configured), and rapid repeats (in-memory rate
//      limit, best-effort per serverless instance).
//   4. Returns 400/403/413/429 with a human-readable `message` the site
//      shows in the form's error box. No internals are ever leaked.
//   5. Returns 200 on success. Optionally forwards the booking by email
//      (best-effort — failures never reject a booking; guarded by a timeout).
//
// Environment variables (set these in Vercel — NEVER in source code):
//   RESEND_API_KEY     : API key from https://resend.com
//   BOOKING_TO_EMAIL   : inbox that should receive bookings
//   ALLOWED_ORIGIN     : (optional) comma-separated origins allowed to call
//                        this endpoint, e.g. "https://apexauto.example"
//                        Cross-origin calls (including CORS preflights)
//                        from any other origin are rejected.
//
// Security notes:
//   - The rate limit is in-memory, so it is per serverless instance and is
//     a deterrent, not a guarantee. For a hard global limit, put an
//     Upstash/Vercel KV-backed limiter in front of this function.
//   - Without ALLOWED_ORIGIN the endpoint is same-origin only (no CORS
//     headers are emitted), which is the correct default for a site that
//     ships its backend alongside its frontend on the same domain.
// ============================================================================

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const MAX_BODY_BYTES = 16 * 1024;            // 16 KB of JSON is plenty for a booking
const MAX_FIELD = {
  name: 120,
  contact: 320,
  vehicle: 120,
  service: 120,
  date: 32,
  time: 32,
  notes: 2000
};
const EMAIL_FETCH_TIMEOUT_MS = 8000;          // don't let a slow upstream pin the function
const HONEYPOT_FIELD = 'website';             // invisible to humans; bots fill it
const RATE = { windowMs: 10 * 60 * 1000, max: 5 }; // 5 requests / 10 min per IP

// Sliding-window limiter keyed by client IP (best-effort, see header note).
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE.windowMs);
  if (recent.length >= RATE.max) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  // Opportunistic pruning so the map never grows without bound.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (!v.some((t) => now - t < RATE.windowMs)) hits.delete(k);
    }
  }
  return false;
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  const first = Array.isArray(fwd) ? fwd[0] : String(fwd || '').split(',')[0].trim();
  return first || (req.socket && req.socket.remoteAddress) || 'unknown';
}

const header = (req, name) => {
  const v = req.headers[name];
  return Array.isArray(v) ? v[0] : v;
};

// Strip control characters (incl. CR/LF — email header-injection hygiene)
// and trim. Does NOT escape HTML: email bodies are sent as plain text.
const clean = (s) => String(s == null ? '' : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();

const respond = (res, status, payload, extraHeaders) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cache-Control', 'no-store');
  for (const [k, v] of Object.entries(extraHeaders || {})) res.setHeader(k, v);
  res.status(status).json(payload);
};

function isAllowedOrigin(req) {
  const allowed = (process.env.ALLOWED_ORIGIN || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (!allowed.length) return null; // no restriction configured → same-origin only via CORS
  const origin = (header(req, 'origin') || header(req, 'referer') || '')
    .trim().toLowerCase().replace(/\/$/, '');
  // Referer carries a path; origin never does. Compare against every allowed origin.
  const host = origin.replace(/^https?:\/\//, '').split(/[/?#]/)[0];
  return allowed.some((a) => origin === a || host === a.replace(/^https?:\/\//, ''));
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
export default async function handler(req, res) {
  // --- Method gate --------------------------------------------------------
  if (req.method === 'OPTIONS') {
    // Only answer preflights for a configured allowed origin (never wildcard).
    const allowed = (process.env.ALLOWED_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean);
    const origin = header(req, 'origin') || '';
    if (allowed.length && allowed.includes(origin)) {
      return respond(res, 204, {}, {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
      });
    }
    return respond(res, 204, {}, { Allow: 'POST' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return respond(res, 405, { message: 'Method not allowed — use POST.' });
  }

  // --- Rate limit (before any parsing work) --------------------------------
  if (rateLimited(clientIp(req))) {
    return respond(res, 429, { message: 'Too many requests — please wait a few minutes and try again.' });
  }

  // --- JSON-only gate -------------------------------------------------------
  // Blocks cross-site form-submission abuse: HTML forms can only send
  // urlencoded/multipart bodies, which we reject outright.
  const contentType = String(header(req, 'content-type') || '').split(';')[0].trim().toLowerCase();
  if (contentType !== 'application/json') {
    return respond(res, 415, { message: 'Content-Type must be application/json.' });
  }

  // --- Origin gate (only when ALLOWED_ORIGIN is configured) -----------------
  const originCheck = isAllowedOrigin(req);
  if (originCheck === false) {
    return respond(res, 403, { message: 'Request origin is not allowed.' });
  }

  // --- Parse + size gate -----------------------------------------------------
  let body;
  const raw = typeof req.body === 'string' ? req.body : null;
  if (raw && Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) {
    return respond(res, 413, { message: 'Request body is too large.' });
  }
  try {
    body = raw ? JSON.parse(raw) : (req.body || {});
  } catch {
    return respond(res, 400, { message: 'Request body must be valid JSON.' });
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return respond(res, 400, { message: 'Request body must be a JSON object.' });
  }
  if (JSON.stringify(body).length > MAX_BODY_BYTES) {
    return respond(res, 413, { message: 'Request body is too large.' });
  }

  // --- Honeypot: bots fill invisible fields ----------------------------------
  if (clean(body[HONEYPOT_FIELD])) {
    // Pretend success, do nothing. The bot learns nothing.
    return respond(res, 200, { ok: true, message: 'Booking received — we will confirm shortly.' });
  }

  // --- Required fields + length caps ------------------------------------------
  const required = ['name', 'contact', 'vehicle', 'service', 'date', 'time'];
  const missing = required.filter((k) => !clean(body[k]));
  if (missing.length) {
    return respond(res, 400, { message: 'Missing required fields: ' + missing.join(', ') + '.' });
  }
  for (const [k, max] of Object.entries(MAX_FIELD)) {
    if (body[k] !== undefined && clean(body[k]).length > max) {
      return respond(res, 400, { message: 'Field "' + k + '" is too long.' });
    }
  }

  // --- Contact format -----------------------------------------------------------
  const contact = clean(body.contact);
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  const digits = contact.replace(/\D/g, '');
  const isPhone = digits.length >= 7 && digits.length <= 15;
  if (!isEmail && !isPhone) {
    return respond(res, 400, { message: 'Please enter a valid email or phone number.' });
  }

  // --- Date must be today or later ------------------------------------------------
  const date = new Date(clean(body.date));
  if (isNaN(date.getTime())) {
    return respond(res, 400, { message: 'Please choose a valid date.' });
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) {
    return respond(res, 400, { message: 'Please choose a date in the future.' });
  }

  // --- Optional email forwarding (best-effort, timed, sanitized) -------------------
  if (process.env.RESEND_API_KEY && process.env.BOOKING_TO_EMAIL) {
    const name = clean(body.name).slice(0, MAX_FIELD.name);
    const service = clean(body.service).slice(0, MAX_FIELD.service);
    const notes = clean(body.notes).slice(0, MAX_FIELD.notes);
    const subject = ('New booking: ' + service + ' — ' + name).slice(0, 120);

    const lines = [
      'New booking request from ' + name,
      '',
      'Vehicle: ' + clean(body.vehicle).slice(0, MAX_FIELD.vehicle),
      'Service: ' + service,
      'Date:    ' + clean(body.date).slice(0, MAX_FIELD.date) + ' ' + clean(body.time).slice(0, MAX_FIELD.time),
      'Contact: ' + contact,
      notes ? 'Notes:   ' + notes : '',
      '',
      'Sent from the APEX AUTO DETAILING website.'
    ].filter(Boolean).join('\n');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), EMAIL_FETCH_TIMEOUT_MS);
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + process.env.RESEND_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Bookings <onboarding@resend.dev>',
          to: [process.env.BOOKING_TO_EMAIL],
          subject,
          text: lines
        }),
        signal: controller.signal
      });
    } catch {
      // email is best-effort — still accept the booking
    } finally {
      clearTimeout(timer);
    }
  }

  return respond(res, 200, { ok: true, message: 'Booking received — we will confirm shortly.' });
}
