/* ============================================================================
   APEX AUTO DETAILING — render.js
   Renders every config-driven section from js/config.js into the static HTML
   shells. Edit config.js — not this file — to change the business content.

   Sections rendered here:
     nav links · hero · trust bar · services · packages · quote calculator
     before/after · gallery · process · why choose us · vehicle types · testimonials
     · FAQ · contact · footer · mobile action bar · booking form options · SEO data
   ========================================================================== */
(function () {
  'use strict';

  const C = window.APEX_CONFIG;
  if (!C) return;

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  /* ------------------------------------------------------------------ */
  /* PHOTOS — auto-detection with graceful fallback                      */
  /* When an item has no explicit `img`, the renderer keeps its built-in */
  /* art and probes conventional paths under assets/img/ (named after    */
  /* the item's title, and by index). The first file that loads replaces */
  /* the art; if nothing exists, the art simply stays.                   */
  /* ------------------------------------------------------------------ */
  const PHOTO_EXTS = ['jpg', 'jpeg', 'webp'];
  const slugify = (s) => String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const photoCandidates = (name, indexKey) => {
    const seen = new Set();
    const out = [];
    const push = (base) => {
      if (!base || seen.has(base)) return;
      seen.add(base);
      out.push(base);
    };
    const s = slugify(name);
    const k = indexKey ? String(indexKey).replace(/^assets\/img\//, '') : '';
    for (const e of PHOTO_EXTS) { if (s) push('assets/img/' + s + '.' + e); }
    for (const e of PHOTO_EXTS) { if (k) push('assets/img/' + k + '.' + e); }
    return out;
  };

  /* Photo probing is a single serialized queue across the whole page.    */
  /* One request in flight at a time; after three consecutive misses we   */
  /* stop, so a template with no photos yet costs exactly 3 requests      */
  /* instead of ~100. URLs are deduped. A found photo resets the counter. */
  const photoProbe = {
    queue: [],
    active: false,
    misses: 0,
    MAX_MISSES: 3,
    probed: new Set()
  };

  const probeNext = () => {
    if (photoProbe.active || photoProbe.misses >= photoProbe.MAX_MISSES) return;
    while (photoProbe.queue.length) {
      const item = photoProbe.queue[0];
      let src = null;
      while (item.names.length && src === null) {
        const cand = item.names.shift();
        if (!photoProbe.probed.has(cand)) { src = cand; photoProbe.probed.add(cand); }
      }
      if (!src) { photoProbe.queue.shift(); continue; } // nothing left for this element

      photoProbe.active = true;
      const img = new Image();
      img.onload = () => {
        photoProbe.misses = 0;
        img.alt = item.alt;
        img.loading = 'lazy';
        img.decoding = 'async';
        item.el.innerHTML = '';
        item.el.appendChild(img);
        item.el.classList.add('has-photo');
        photoProbe.active = false;
        photoProbe.queue.shift(); // photo found — this element is done
        probeNext();
      };
      img.onerror = () => {
        photoProbe.misses++;
        photoProbe.active = false;
        probeNext();
      };
      img.src = src;
      return;
    }
  };

  const probePhoto = (el, names) => {
    if (!el || !names || !names.length || typeof Image === 'undefined') return;
    if (photoProbe.misses >= photoProbe.MAX_MISSES) return;
    photoProbe.queue.push({ el, names: names.slice(), alt: el.dataset.alt || '' });
    probeNext();
  };

  /* Probe every element carrying [data-photo] inside a rendered region.  */
  const probeRegion = (root) => {
    $$('[data-photo]', root).forEach(el => {
      probePhoto(el, photoCandidates(el.dataset.photo, el.dataset.photoKey));
    });
  };

  /* ------------------------------------------------------------------ */
  /* ICONS — inline stroke icons (lucide-style)                         */
  /* ------------------------------------------------------------------ */
  const ICONS = {
    arrow: 'M5 12h14M13 5l7 7-7 7',
    check: 'M20 6 9 17l-5-5',
    plus: 'M12 5v14M5 12h14',
    phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z',
    mail: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z',
    pin: 'M20 10c0 4.99-5.54 10.19-7.4 11.8a1 1 0 0 1-1.2 0C9.54 20.19 4 14.99 4 10a8 8 0 0 1 16 0z',
    pinDot: 'M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z',
    clockHand: 'M12 6v6l4 2',
    shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    shieldCheck: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    shieldCheckTick: 'm9 12 2 2 4-4',
    users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
    usersHead: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    usersBody: 'M22 21v-2a4 4 0 0 0-3-3.87',
    search: 'M21 21l-4.35-4.35',
    searchGlass: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z',
    dollar: 'M12 1v22',
    dollarCurve: 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
    calendar: 'M8 2v4M16 2v4',
    calendarRect: 'M3 4h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z',
    calendarLine: 'M3 10h18',
    wrench: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
    sparkles: 'M12 3l1.9 5.7L19.6 10l-5.7 1.9L12 17.6l-1.9-5.7L4.4 10l5.7-1.9L12 3z',
    star: 'm12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    quote: 'M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zM15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z',
    car: 'M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11m-14 0h14m-14 0v4m14-4v4m-14 0h-1a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h1m14 0h1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-1m-14 0v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1m10 0v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1',
    gauge: 'M12 14l4-4',
    gaugeDial: 'M3.34 19a10 10 0 1 1 17.32 0',
    award: 'M7 21h10M9 17h6',
    awardCircle: 'M12 16a5 5 0 1 0 0-10 5 5 0 0 0 0 10z',
    awardRibbon: 'M8 21l4-3 4 3V12',
    flame: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z',
    x: 'M18 6 6 18M6 6l12 12',
    menu: 'M4 6h16M4 12h16M4 18h16',
    chevron: 'm6 9 6 6 6-6',
    link: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71|M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
    instagram: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    instagramInner: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM17.5 6.5h.01',
    youtube: 'M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z',
    youtubePlay: 'm10 15 5-3-5-3z',
    facebook: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z'
  };

  const icon = (name, cls) => {
    const paths = ICONS[name];
    if (!paths) return '';
    return `<svg class="${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths.split('|').map(p => `<path d="${p}"/>`).join('')}</svg>`;
  };

  /* ------------------------------------------------------------------ */
  /* CAR SCENE ART — premium stylised visuals, replaces photos until      */
  /* config items get real `img` paths.                                  */
  /* ------------------------------------------------------------------ */
  const sceneSVG = (opts) => {
    const o = opts || {};
    const a = o.accent || '#C9A45C';
    const mode = o.mode || 'gloss'; // 'gloss' | 'dull' | 'icon'
    const label = o.label || '';

    let carBody;
    if (mode === 'dull') {
      // before-state: flat, dusty, with visible swirl / haze marks
      carBody = `
        <path d="M55 190 L80 160 Q120 130 200 130 Q280 130 320 160 L345 190 Z" fill="#4d4a44"/>
        <path d="M150 135 Q180 115 220 115 Q260 115 290 135 Z" fill="#33302c"/>
        <path d="M150 138 Q180 119 220 119 Q260 119 290 138 Z" fill="rgba(255,255,255,.05)"/>
        <path d="M95 175 Q120 160 145 172" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="1.2"/>
        <path d="M185 170 Q210 158 235 168" fill="none" stroke="rgba(255,255,255,.11)" stroke-width="1.2"/>
        <path d="M250 180 Q275 165 300 176" fill="none" stroke="rgba(255,255,255,.11)" stroke-width="1.2"/>
        <path d="M130 185 Q155 172 180 182" fill="none" stroke="rgba(255,255,255,.09)" stroke-width="1.2"/>`;
    } else {
      // gloss state: studio light, deep metallic body, specular sweep
      const c1 = a, c2 = shade(a, -0.5);
      carBody = `
        <defs>
          <linearGradient id="g${o.uid || 'x'}" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="${c1}"/>
            <stop offset="1" stop-color="${c2}"/>
          </linearGradient>
          <linearGradient id="s${o.uid || 'x'}" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stop-color="rgba(255,255,255,0)"/>
            <stop offset=".45" stop-color="rgba(255,255,255,.65)"/>
            <stop offset=".55" stop-color="rgba(255,255,255,.22)"/>
            <stop offset="1" stop-color="rgba(255,255,255,0)"/>
          </linearGradient>
          <radialGradient id="h${o.uid || 'x'}" cx=".5" cy=".35" r=".75">
            <stop offset="0" stop-color="${c1}" stop-opacity=".5"/>
            <stop offset="1" stop-color="${c1}" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="200" cy="150" rx="130" ry="60" fill="url(#h${o.uid || 'x'})"/>
        <path d="M55 190 L80 160 Q120 130 200 130 Q280 130 320 160 L345 190 Z" fill="url(#g${o.uid || 'x'})"/>
        <path d="M150 135 Q180 115 220 115 Q260 115 290 135 Z" fill="rgba(10,12,22,.6)"/>
        <path d="M150 138 Q180 119 220 119 Q260 119 290 138 Z" fill="rgba(255,255,255,.22)"/>
        <path d="M60 176 Q200 160 340 176 L340 182 Q200 168 60 182 Z" fill="url(#s${o.uid || 'x'})" opacity=".6"/>
        <path d="M64 168 Q200 152 336 168 L336 171 Q200 155 64 171 Z" fill="rgba(255,255,255,.28)" opacity=".5"/>`;
    }

    const wheels = `
      <g>
        <circle cx="115" cy="192" r="17" fill="#0a0a0e" stroke="#26262e" stroke-width="2"/>
        <circle cx="115" cy="192" r="10.5" fill="none" stroke="${a}" stroke-width="1.4" opacity=".9"/>
        <circle cx="115" cy="192" r="4" fill="#141418" stroke="${a}" stroke-width="1"/>
        <path d="M115 183v18M106 192h18M107.3 184.3l15.4 15.4M122.7 184.3l-15.4 15.4" stroke="${a}" stroke-width="1" opacity=".55"/>
      </g>
      <g>
        <circle cx="285" cy="192" r="17" fill="#0a0a0e" stroke="#26262e" stroke-width="2"/>
        <circle cx="285" cy="192" r="10.5" fill="none" stroke="${a}" stroke-width="1.4" opacity=".9"/>
        <circle cx="285" cy="192" r="4" fill="#141418" stroke="${a}" stroke-width="1"/>
        <path d="M285 183v18M276 192h18M277.3 184.3l15.4 15.4M292.7 184.3l-15.4 15.4" stroke="${a}" stroke-width="1" opacity=".55"/>
      </g>`;

    const floor = `
      <ellipse cx="200" cy="202" rx="180" ry="9" fill="${a}" opacity=".12"/>
      <ellipse cx="200" cy="202" rx="120" ry="5" fill="${a}" opacity=".22"/>`;

    const iconBlock = mode === 'icon' && o.iconName
      ? `<g transform="translate(164 92) scale(1.4)">${ICON_PATHS[o.iconName] || ''}</g>`
      : '';

    const labelBlock = label
      ? `<text x="200" y="228" text-anchor="middle" fill="rgba(255,255,255,.55)" font-family="Space Grotesk, sans-serif" font-size="12" letter-spacing="3" font-weight="600">${label.toUpperCase()}</text>`
      : '';

    return `<svg class="${o.cls || ''}" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      ${carBody}${wheels}${floor}${iconBlock}${labelBlock}
    </svg>`;
  };

  const shade = (hex, amt) => {
    const h = hex.replace('#', '');
    const num = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + Math.round(255 * amt)));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * amt)));
    const b = Math.max(0, Math.min(255, (num & 0xff) + Math.round(255 * amt)));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  /* icon paths usable inside scenes (single-color, stroke-based) */
  const ICON_PATHS = {
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="1.6"/>',
    sparkles: '<path d="M12 3l1.9 5.7L19.6 10l-5.7 1.9L12 17.6l-1.9-5.7L4.4 10l5.7-1.9L12 3z" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="1.6"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="1.6"/>',
    users: '<circle cx="9" cy="8" r="3.4" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="1.6"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="1.6"/><path d="M16 8.5a3.4 3.4 0 1 1 1 6.7M20.5 19a5.5 5.5 0 0 0-3.4-5" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="1.6"/>',
    dollar: '<path d="M12 3v18M17 6.5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="1.6"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="1.6"/><path d="M3 10h18M8 3v4M16 3v4" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="1.6"/>',
    search: '<circle cx="11" cy="11" r="7" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="1.6"/><path d="m20 20-3.5-3.5" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="1.6"/>',
    car: '<path d="M5 12l1.6-4.6A2 2 0 0 1 8.5 6h7a2 2 0 0 1 1.9 1.4L19 12m-14 0h14m-14 0v3m14-3v3m-14 0H5a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1h1m14 0h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-1m-14 0v1h2m12-1v1h-2" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="1.6"/>'
  };

  /* ------------------------------------------------------------------ */
  /* NAV                                                                 */
  /* ------------------------------------------------------------------ */
  function renderNav() {
    const linksWrap = $('#navLinks');
    const drawer = $('#navDrawerLinks');
    if (!C.nav) return;
    const html = C.nav.map(l => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join('');
    if (linksWrap) linksWrap.innerHTML = html;
    if (drawer) drawer.innerHTML = html;
  }

  /* ------------------------------------------------------------------ */
  /* HERO                                                                */
  /* ------------------------------------------------------------------ */
  function renderHero() {
    const h = C.hero; if (!h) return;
    const set = (id, val) => { const el = $(id); if (el && val) el.innerHTML = val; };

    set('#heroEyebrow', `<span class="dot"></span>${esc(h.eyebrow)}`);
    set('#heroTitleA', esc(h.titleA));
    set('#heroTitleB', `<span class="grad">${esc(h.titleB)}</span>`);
    set('#heroSub', esc(h.sub));
    set('#heroCtaPrimary', `${esc(h.primaryCta.label)} ${icon('arrow', 'btn-arr')}`);
    const pc = $('#heroCtaPrimary');
    if (pc) pc.setAttribute('href', h.primaryCta.href);
    set('#heroCtaSecondary', `${esc(h.secondaryCta.label)} ${icon('arrow', 'btn-arr')}`);
    const sc = $('#heroCtaSecondary');
    if (sc) sc.setAttribute('href', h.secondaryCta.href);

    const bullets = $('#heroBullets');
    if (bullets && h.bullets) {
      bullets.innerHTML = h.bullets.map(b => `<li>${icon('check')} ${esc(b)}</li>`).join('');
    }

    const ticker = $('#tickerTrack');
    if (ticker && h.ticker) {
      const seq = h.ticker.map(t => `<span>${esc(t)}</span><span aria-hidden="true">·</span>`).join('');
      ticker.innerHTML = seq + seq; // duplicated for seamless loop
    }
  }

  /* ------------------------------------------------------------------ */
  /* TRUST BAR                                                           */
  /* ------------------------------------------------------------------ */
  function renderTrust() {
    const lead = $('#trustLead');
    if (lead && C.trust.lead) lead.textContent = C.trust.lead;
    const grid = $('#trustStats');
    if (!grid || !C.trust || !C.trust.stats) return;
    grid.innerHTML = C.trust.stats.map((s, i) => `
      <div class="stat" data-reveal${i ? ` data-reveal-delay="${i * 60}"` : ''}>
        <b><span data-count="${s.value}"${s.decimal ? ` data-decimal="${s.decimal}"` : ''}>0</span>${esc(s.suffix || '')}</b>
        <span>${esc(s.label)}</span>
      </div>`).join('');

    const products = $('#trustProducts');
    if (products) {
      if (C.trust.products && C.trust.products.length) {
        products.innerHTML = `
          <span class="proof__label">The studio works with</span>
          <span class="proof__names">${C.trust.products.map(p => `<span>${esc(p)}</span>`).join('')}</span>`;
      } else {
        products.hidden = true;
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /* SERVICES                                                            */
  /* ------------------------------------------------------------------ */
  function renderServices() {
    const grid = $('#servicesGrid');
    if (!grid || !C.services) return;
    grid.innerHTML = C.services.map((s, i) => {
      const art = s.img
        ? `<img src="${esc(s.img)}" alt="${esc(s.name)} — ${esc(s.desc)}" loading="lazy" decoding="async" />`
        : sceneSVG({ accent: s.accent, mode: 'icon', iconName: 'car', uid: 'svc' + i, cls: 'svc__art' });
      const mediaAttrs = s.img
        ? ''
        : ` data-photo="${esc(s.name)}" data-photo-key="svc-${String(i + 1).padStart(2, '0')}" data-alt="${esc(s.name)} — ${esc(s.desc)}"`;
      return `
      <article class="svc__card" data-reveal${i ? ` data-reveal-delay="${(i % 3) * 70}"` : ''}>
        <div class="svc__media" style="--accent:${esc(s.accent)}"${mediaAttrs}>${art}</div>
        <div class="svc__body">
          <div class="svc__meta">
            <span class="svc__price">From $${esc(s.price)}</span>
            <span class="svc__time">${icon('clock')} ${esc(s.duration)}</span>
          </div>
          <h3>${esc(s.name)}</h3>
          <p>${esc(s.desc)}</p>
          <ul class="svc__list">
            ${s.features.map(f => `<li>${icon('check')} ${esc(f)}</li>`).join('')}
          </ul>
          <a class="btn btn--ghost btn--sm btn--block" href="#booking">Book this detail ${icon('arrow', 'btn-arr')}</a>
        </div>
      </article>`;
    }).join('');
    probeRegion(grid);
  }

  /* ------------------------------------------------------------------ */
  /* PACKAGES                                                            */
  /* ------------------------------------------------------------------ */
  function renderPackages() {
    const grid = $('#packagesGrid');
    if (!grid || !C.packages) return;
    grid.innerHTML = C.packages.map((p, i) => `
      <article class="pkg${p.tag ? ' pkg--hot' : ''}" data-reveal${i ? ` data-reveal-delay="${i * 70}"` : ''}>
        ${p.tag ? `<div class="pkg__tag">${icon('star')} ${esc(p.tag)}</div>` : ''}
        <div class="pkg__head">
          <h3>${esc(p.name)}</h3>
          <div class="pkg__price"><b>$${esc(p.price)}</b><span>starting at</span></div>
        </div>
        <p class="pkg__blurb">${esc(p.blurb)}</p>
        <ul class="pkg__list">
          ${p.features.map(f => `<li>${icon('check')} ${esc(f)}</li>`).join('')}
        </ul>
        <a class="btn ${p.tag ? 'btn--primary' : 'btn--ghost'} btn--block" href="#calculator">Get my quote ${icon('arrow', 'btn-arr')}</a>
      </article>`).join('');

    const note = $('#packagesNote');
    if (note) note.textContent = 'Starting prices vary by vehicle size and condition.';
  }

  /* ------------------------------------------------------------------ */
  /* QUOTE CALCULATOR                                                    */
  /* ------------------------------------------------------------------ */
  function renderCalculator() {
    const cal = C.calculator; if (!cal) return;
    const root = $('#calculator');
    if (!root) return;

    const step = (n, label) => `
      <div class="calc__step" data-step="${n}" role="tabpanel" aria-label="${esc(label)}">
        <p class="calc__prompt">${esc(label)}</p>
        <div class="calc__options" data-options="${n}"></div>
      </div>`;

    root.insertAdjacentHTML('beforeend', `
      <div class="calc__progress" role="tablist" aria-label="Calculator steps">
        <span data-prog="1">Vehicle</span><span data-prog="2">Condition</span><span data-prog="3">Service</span><span data-prog="4">Add-ons</span>
      </div>
      ${step(1, 'What type of vehicle?')}
      ${step(2, 'What condition is it in?')}
      ${step(3, 'Which service do you need?')}
      ${step(4, 'Any add-ons?')}
      <div class="calc__result" data-result hidden>
        <span class="calc__result-label">YOUR ESTIMATED STARTING PRICE</span>
        <span class="calc__result-price" data-price>$0</span>
        <p class="calc__result-note">${esc(cal.disclaimer || '')}</p>
        <a class="btn btn--primary btn--lg" href="#booking">Request my final quote ${icon('arrow', 'btn-arr')}</a>
        <button class="btn btn--ghost btn--sm btn--share" type="button" data-share>${icon('link')} Copy share link</button>
      </div>`);

    const opts = (n, items, tmpl) => {
      const box = $(`[data-options="${n}"]`, root);
      if (!box) return;
      box.innerHTML = items.map((it, i) => tmpl(it, i)).join('');
    };

    opts(1, cal.vehicles, (v) => `<button class="calc__opt" type="button" data-vehicle="${esc(v.name)}" data-mult="${v.multiplier}">${esc(v.name)}</button>`);
    opts(2, cal.conditions, (c) => `
      <button class="calc__opt" type="button" data-condition="${esc(c.name)}" data-mult="${c.multiplier}">
        <b>${esc(c.name)}</b><span>${esc(c.hint || '')}</span>
      </button>`);
    opts(3, cal.services, (s) => `
      <button class="calc__opt calc__opt--price" type="button" data-service="${esc(s.name)}" data-price="${s.price}">
        <b>${esc(s.name)}</b><span>from $${esc(s.price)}</span>
      </button>`);
    opts(4, cal.addons, (a) => `
      <label class="calc__opt calc__opt--check">
        <input type="checkbox" data-addon="${esc(a.name)}" data-price="${a.price}" />
        <span><b>${esc(a.name)}</b><em>+$${esc(a.price)}</em></span>
      </label>`);
  }

  /* ------------------------------------------------------------------ */
  /* BEFORE / AFTER                                                       */
  /* ------------------------------------------------------------------ */
  function renderBeforeAfter() {
    const root = $('#beforeAfterStage');
    if (!root) return;
    const ba = C.beforeAfter || {};
    const bLabel = ba.beforeLabel || 'BEFORE';
    const aLabel = ba.afterLabel || 'AFTER';
    const beforeArt = ba.beforeImg
      ? `<img src="${esc(ba.beforeImg)}" alt="${esc(bLabel)}" loading="lazy" />`
      : sceneSVG({ mode: 'dull', accent: '#5b6170', uid: 'ba-b', cls: 'ba__img' });
    const afterArt = ba.afterImg
      ? `<img src="${esc(ba.afterImg)}" alt="${esc(aLabel)}" loading="lazy" />`
      : sceneSVG({ mode: 'gloss', accent: '#C9A45C', uid: 'ba-a', cls: 'ba__img' });
    const beforeAttrs = ba.beforeImg ? '' : ` data-photo="${esc(bLabel)}" data-photo-key="before" data-alt="${esc(bLabel)}"`;
    const afterAttrs  = ba.afterImg  ? '' : ` data-photo="${esc(aLabel)}" data-photo-key="after"  data-alt="${esc(aLabel)}"`;

    root.innerHTML = `
      <div data-ba>
        <div class="ba__frame" data-ba-frame style="--pos: 50%">
          <div class="ba__layer ba__layer--before">
            <div class="ba__media"${beforeAttrs}>${beforeArt}</div>
            <span class="ba__tag ba__tag--before">${esc(bLabel)}</span>
          </div>
          <div class="ba__layer ba__layer--after">
            <div class="ba__media"${afterAttrs}>${afterArt}</div>
            <span class="ba__tag ba__tag--after">${esc(aLabel)}</span>
          </div>
          <div class="ba__handle" aria-hidden="true"><span class="ba__grip"></span></div>
          <input class="ba__range" type="range" min="0" max="100" value="50" aria-label="Drag to compare before and after" />
        </div>
      </div>`;
    probeRegion(root);
  }

  /* ------------------------------------------------------------------ */
  /* GALLERY                                                             */
  /* ------------------------------------------------------------------ */
  function renderGallery() {
    const grid = $('#galleryGrid');
    if (!grid || !C.gallery) return;
    const accents = ['#C9A45C', '#B0813F', '#8A90A6', '#E3C88E', '#A67C3D', '#D9C59A'];
    grid.innerHTML = C.gallery.map((g, i) => {
      const a = accents[i % accents.length];
      const art = g.img
        ? `<img src="${esc(g.img)}" alt="${esc(g.title)}" loading="lazy" decoding="async" />`
        : sceneSVG({ accent: a, mode: 'gloss', uid: 'gal' + i });
      const mediaAttrs = g.img
        ? ''
        : ` data-photo="${esc(g.title)}" data-photo-key="gallery-${String(i + 1).padStart(2, '0')}" data-alt="${esc(g.title)}"`;
      return `
      <button class="gal__tile" type="button" data-cat="${esc(g.category)}" data-index="${i}" aria-label="Open photo: ${esc(g.title)}">
        <span class="gal__media"${mediaAttrs}>${art}</span>
        <span class="gal__cap"><b>${esc(g.category)}</b><span>${esc(g.title)}</span></span>
      </button>`;
    }).join('');
    probeRegion(grid);
  }

  /* ------------------------------------------------------------------ */
  /* PROCESS                                                             */
  /* ------------------------------------------------------------------ */
  function renderProcess() {
    const list = $('#processList');
    if (!list || !C.process) return;
    list.innerHTML = C.process.map((p, i) => `
      <li class="step" data-reveal${i ? ` data-reveal-delay="${i * 70}"` : ''}>
        <div class="step__num">0${i + 1}</div>
        <div class="step__body">
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.desc)}</p>
        </div>
      </li>`).join('');
  }

  /* ------------------------------------------------------------------ */
  /* WHY CHOOSE US                                                        */
  /* ------------------------------------------------------------------ */
  function renderWhy() {
    const grid = $('#whyGrid');
    if (!grid || !C.whyChooseUs) return;
    const iconMap = {
      wrench: 'wrench', sparkles: 'sparkles', shield: 'shieldCheck',
      users: 'users', dollar: 'dollar', calendar: 'calendar', search: 'search'
    };
    grid.innerHTML = C.whyChooseUs.map((w, i) => `
      <div class="why__card" data-reveal${i ? ` data-reveal-delay="${(i % 4) * 60}"` : ''}>
        <div class="why__icon">${icon(iconMap[w.icon] || 'check')}</div>
        <h3>${esc(w.title)}</h3>
        <p>${esc(w.desc)}</p>
      </div>`).join('');
  }

  /* ------------------------------------------------------------------ */
  /* VEHICLE TYPES                                                        */
  /* ------------------------------------------------------------------ */
  function renderVehicles() {
    const grid = $('#vehiclesGrid');
    if (!grid || !C.vehicleTypes) return;
    grid.innerHTML = `
      <div class="veh__chips" data-reveal>
        ${C.vehicleTypes.map(v => `<span class="veh__chip">${esc(v)}</span>`).join('')}
      </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* TESTIMONIALS                                                         */
  /* ------------------------------------------------------------------ */
  function renderTestimonials() {
    const grid = $('#testimonialsGrid');
    if (!grid || !C.testimonials) return;
    const stars = `<span class="t-card__stars" aria-label="5 out of 5 stars">${icon('star')}${icon('star')}${icon('star')}${icon('star')}${icon('star')}</span>`;
    grid.innerHTML = C.testimonials.map((t, i) => `
      <article class="t-card" data-reveal${i ? ` data-reveal-delay="${i * 80}"` : ''}>
        ${stars}
        ${icon('quote', 't-card__quote')}
        <p>${esc(t.quote)}</p>
        <div class="t-card__who">
          <div class="avatar" style="--av:${esc(t.avatar)}">${esc(t.initials)}</div>
          <div><b>${esc(t.name)}</b><span>${esc(t.detail)}</span></div>
        </div>
      </article>`).join('');

    const note = $('#testimonialsNote');
    if (note) note.innerHTML = 'Reviews shown are demo placeholders. Genuine client reviews (with permission) replace them from <code>js/config.js</code>.';
  }

  /* ------------------------------------------------------------------ */
  /* FAQ                                                                 */
  /* ------------------------------------------------------------------ */
  function renderFaq() {
    const list = $('#faqList');
    if (!list || !C.faqs) return;
    list.innerHTML = C.faqs.map((f, i) => `
      <li class="faq__item" data-reveal${i ? ` data-reveal-delay="${Math.min(i, 4) * 50}"` : ''}>
        <button class="faq__q" aria-expanded="false" aria-controls="faq-panel-${i}" id="faq-q-${i}">
          <span>${esc(f.q)}</span>
          <span class="faq__icon" aria-hidden="true">${icon('plus')}</span>
        </button>
        <div class="faq__a" id="faq-panel-${i}" role="region" aria-labelledby="faq-q-${i}">
          <p>${esc(f.a)}</p>
        </div>
      </li>`).join('');
  }

  /* ------------------------------------------------------------------ */
  /* CONTACT                                                             */
  /* ------------------------------------------------------------------ */
  function renderContact() {
    const b = C.business; if (!b) return;

    const phone = $('#contactPhone');   if (phone) phone.setAttribute('href', b.phone.href);
    const phoneTxt = $('#contactPhoneNum'); if (phoneTxt) phoneTxt.textContent = b.phone.display;
    const email = $('#contactEmail');   if (email) email.setAttribute('href', 'mailto:' + b.email);
    const emailTxt = $('#contactEmailTxt'); if (emailTxt) emailTxt.textContent = b.email;
    const addr = $('#contactAddress');  if (addr) addr.textContent = `${b.address.line1}, ${b.address.line2} — ${b.address.city}, ${b.address.state} ${b.address.zip}`;
    const area = $('#contactArea');     if (area) area.textContent = b.serviceArea;

    const hours = $('#contactHours');
    if (hours && b.hours) {
      hours.innerHTML = b.hours.map(h => `<div class="hours__row"><span>${esc(h.days)}</span><b>${esc(h.time)}</b></div>`).join('');
    }

    const mapLink = $('#contactMapLink');
    if (mapLink) mapLink.setAttribute('href', b.mapsLink);
    const mapFrame = $('#contactMap');
    if (mapFrame && b.mapsEmbedUrl) mapFrame.src = b.mapsEmbedUrl;

    const demo = $('#demoNotice');
    if (demo && b.isDemo) {
      demo.textContent = 'This is a demo website. Business details shown are placeholders and must be replaced before going live.';
    }
  }

  /* ------------------------------------------------------------------ */
  /* BOOKING FORM options                                                */
  /* ------------------------------------------------------------------ */
  function renderBooking() {
    const cal = C.calculator;
    const vt = $('#bookVehicleType');
    if (vt && cal && cal.vehicles) {
      vt.innerHTML = cal.vehicles.map(v => `<option value="${esc(v.name)}">${esc(v.name)}</option>`).join('');
    }
    const sv = $('#bookService');
    if (sv) {
      const list = C.services ? C.services.map(s => s.name) : (cal && cal.services ? cal.services.map(s => s.name) : []);
      sv.innerHTML = list.map(n => `<option value="${esc(n)}">${esc(n)}</option>`).join('');
    }
  }

  /* ------------------------------------------------------------------ */
  /* FOOTER                                                              */
  /* ------------------------------------------------------------------ */
  function renderFooter() {
    const b = C.business; if (!b) return;

    const blurb = $('#footBlurb');
    if (blurb) blurb.textContent = `${b.name} — ${b.tagline} Serving ${b.serviceArea}.`;

    const socials = $('#footSocials');
    if (socials && C.socials) {
      socials.innerHTML = C.socials.map(s => `
        <a href="${esc(s.href)}" aria-label="${esc(s.label)}">${icon(s.icon)}</a>`).join('');
    }

    const cols = $('#footCols');
    if (cols) {
      cols.innerHTML = `
        <div class="foot__col">
          <h4>Services</h4>
          ${(C.services || []).slice(0, 5).map(s => `<a href="#services">${esc(s.name)}</a>`).join('')}
        </div>
        <div class="foot__col">
          <h4>Explore</h4>
          <a href="#packages">Packages</a>
          <a href="#calculator">Quote calculator</a>
          <a href="#gallery">Gallery</a>
          <a href="#process">Our process</a>
          <a href="#faq">FAQ</a>
        </div>
        <div class="foot__col">
          <h4>Contact</h4>
          <a href="${esc(b.phone.href)}">${esc(b.phone.display)}</a>
          <a href="mailto:${esc(b.email)}">${esc(b.email)}</a>
          <a href="${esc(b.mapsLink)}" target="_blank" rel="noopener">${esc(b.address.city)}, ${esc(b.address.state)}</a>
          <a href="#booking">Book an appointment</a>
        </div>`;
    }

    const legal = $('#footLegal');
    if (legal) legal.textContent = `© ${new Date().getFullYear()} ${b.name} · ${b.address.line1}, ${b.address.city}, ${b.address.state} ${b.address.zip}${b.isDemo ? ' · Demo site — fictional business info' : ''}`;
  }

  /* ------------------------------------------------------------------ */
  /* MOBILE ACTION BAR                                                   */
  /* ------------------------------------------------------------------ */
  function renderMobileBar() {
    const bar = $('#mobileBar');
    if (!bar || !C.business) return;
    bar.innerHTML = `
      <a href="${esc(C.business.phone.href)}" class="mbar__btn">${icon('phone')}<span>Call</span></a>
      <a href="${esc(C.business.text.href)}" class="mbar__btn">${icon('mail')}<span>Text</span></a>
      <a href="#booking" class="mbar__btn mbar__btn--cta">${icon('calendar')}<span>Book</span></a>`;
  }

  /* ------------------------------------------------------------------ */
  /* RUN                                                                */
  /* ------------------------------------------------------------------ */
  renderNav();
  renderHero();
  renderTrust();
  renderServices();
  renderPackages();
  renderCalculator();
  renderBeforeAfter();
  renderGallery();
  renderProcess();
  renderWhy();
  renderVehicles();
  renderTestimonials();
  renderFaq();
  renderContact();
  renderBooking();
  renderFooter();
  renderMobileBar();
})();
