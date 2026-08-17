/* =============================================================
   APEX AUTO DETAILING — main.js
   - nav scroll state + accessible mobile menu (Escape, focus, scroll lock)
   - FAQ accordion
   - scroll reveal (native IntersectionObserver)
   - hero card scroll-lag parallax (trails scroll; glow drift is CSS)
   - stat counter on scroll
   - quote calculator (shareable via URL params)
   - before / after comparison slider
   - gallery filters + accessible lightbox (focus trap, restore, arrows)
   - booking form (per-field validation, endpoint POST, success/error states)
   - newsletter
   ============================================================= */
(function () {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- nav scroll state + mobile menu ---------------- */
  const nav       = $('#nav');
  const menuBtn   = $('#navMenuBtn');
  const drawer    = $('#navDrawer');

  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (menuBtn && drawer) {
    const openDrawer = () => {
      drawer.classList.add('is-open');
      drawer.hidden = false;
      menuBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      const first = drawer.querySelector('a');
      if (first) first.focus();
    };
    const closeDrawer = () => {
      drawer.classList.remove('is-open');
      drawer.hidden = true;
      menuBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      menuBtn.focus();
    };
    menuBtn.addEventListener('click', () => {
      if (drawer.classList.contains('is-open')) closeDrawer();
      else openDrawer();
    });
    $$('a', drawer).forEach(a => a.addEventListener('click', closeDrawer));
    document.addEventListener('keydown', (e) => {
      if (drawer.classList.contains('is-open') && e.key === 'Escape') closeDrawer();
    });
  }

  /* ---------------- hero card scroll-lag (parallax) ---------------- */
  /* The featured card used to float (bounce) on its own; instead it now   */
  /* trails the page slightly while scrolling — a smooth "lag" that        */
  /* catches up, with no idle motion. Off for reduced motion / small    */
  /* screens; one compositor-only transform, rAF only while moving.    */
  const heroCard = $('.hero__card');
  if (heroCard && !reduceMotion && window.matchMedia('(min-width: 720px)').matches) {
    let current = 0, target = 0, raf = null;
    const FACTOR = 0.10;   // card moves 10% of the scroll distance
    const MAX    = 42;     // px, so it never detaches from its frame
    const update = () => {
      current += (target - current) * 0.12;
      if (Math.abs(target - current) < 0.05) {
        current = target; // settle exactly (no sub-pixel residue)
        heroCard.style.transform = 'translateY(' + current.toFixed(2) + 'px)';
        raf = null;
        return;
      }
      heroCard.style.transform = 'translateY(' + current.toFixed(2) + 'px)';
      raf = requestAnimationFrame(update);
    };
    const onScrollP = () => {
      target = Math.max(-MAX, Math.min(MAX, -window.scrollY * FACTOR));
      if (raf === null) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScrollP, { passive: true });
    onScrollP();
  }

  /* ---------------- FAQ accordion ---------------- */
  $$('.faq__q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item  = btn.closest('.faq__item');
      const panel = item.querySelector('.faq__a');
      const open  = btn.getAttribute('aria-expanded') === 'true';

      // close siblings
      $$('.faq__q').forEach(other => {
        if (other === btn) return;
        other.setAttribute('aria-expanded', 'false');
        const sib = other.closest('.faq__item').querySelector('.faq__a');
        sib.style.maxHeight = '0px';
      });

      btn.setAttribute('aria-expanded', String(!open));
      if (!open) {
        panel.style.maxHeight = panel.scrollHeight + 'px';
      } else {
        panel.style.maxHeight = '0px';
      }
    });
  });

  // re-measure on resize so open panels don't clip
  window.addEventListener('resize', () => {
    $$('.faq__q[aria-expanded="true"]').forEach(btn => {
      const panel = btn.closest('.faq__item').querySelector('.faq__a');
      panel.style.maxHeight = panel.scrollHeight + 'px';
    });
  });

  /* ---------------- scroll reveal ---------------- */
  // Pure IntersectionObserver — no animation library required. The CSS
  // transition on .is-in handles the motion (and prefers-reduced-motion).
  const revealEls = $$('[data-reveal]');
  if (reduceMotion) {
    revealEls.forEach(el => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseInt(el.dataset.revealDelay || '0', 10);
          setTimeout(() => el.classList.add('is-in'), delay);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  /* ---------------- hero parallax ---------------- */
  // Card float + glow drift are CSS keyframe animations; only the subtle
  // scroll parallax needs JS. Skipped for reduced motion and small screens.
  if (!reduceMotion && typeof window.innerWidth !== 'undefined' && window.innerWidth > 880) {
    const heroInner = $('.hero__inner');
    if (heroInner) {
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = Math.min(window.scrollY, 500);
          heroInner.style.transform = 'translateY(' + (y * 0.06).toFixed(1) + 'px)';
          ticking = false;
        });
      }, { passive: true });
    }
  }

  /* ---------------- stat counter ---------------- */
  const statNums = $$('.stat [data-count]');
  if (statNums.length) {
    const animateNum = (el) => {
      const target    = parseFloat(el.dataset.count);
      const decimal   = parseInt(el.dataset.decimal || '0', 10);
      const duration  = 1600;
      const startTime = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const val = target * eased;
        el.textContent = decimal
          ? val.toFixed(decimal)
          : Math.floor(val).toLocaleString();
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = decimal ? target.toFixed(decimal) : target.toLocaleString();
      };
      requestAnimationFrame(tick);
    };
    const seen = new WeakSet();
    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !seen.has(entry.target)) {
          seen.add(entry.target);
          animateNum(entry.target);
        }
      });
    }, { threshold: 0.4 });
    statNums.forEach(el => counterIO.observe(el));
  }

  /* ---------------- quote calculator ---------------- */
  const calcRoot = $('#calculator');
  if (calcRoot) {
    const state = { vehicle: null, condition: null, service: 0, vehicleName: null, conditionName: null, serviceName: null, addons: 0, addonNames: [] };
    const priceEl  = $('[data-price]', calcRoot);
    const resultEl = $('[data-result]', calcRoot);
    const progEls  = $$('.calc__progress [data-prog]', calcRoot);
    const escSel   = (s) => String(s).replace(/["\\]/g, '\\$&');

    // steps complete in order — a step only counts once all previous are done
    const stepDone = () => {
      const order = [() => !!state.vehicle, () => !!state.condition, () => !!state.service, () => state.addons > 0];
      let done = 0;
      for (const f of order) { if (f()) done++; else break; }
      return done;
    };

    // shareable quotes: the selection lives in the URL (?v=&c=&s=&a=)
    const syncUrl = () => {
      if (typeof history === 'undefined' || typeof location === 'undefined') return;
      const p = new URLSearchParams();
      if (state.vehicleName)    p.set('v', state.vehicleName);
      if (state.conditionName)  p.set('c', state.conditionName);
      if (state.serviceName)    p.set('s', state.serviceName);
      if (state.addonNames.length) p.set('a', state.addonNames.join(','));
      const qs = p.toString();
      if (qs) history.replaceState(null, '', location.pathname + '?' + qs);
      else if (location.search) history.replaceState(null, '', location.pathname);
    };

    const render = () => {
      // progress indicator
      const done = stepDone();
      progEls.forEach((p, i) => {
        p.classList.toggle('is-done', i + 1 <= done && (i + 1 < 4 || done === 4));
        p.classList.toggle('is-active', i + 1 === done + 1 || (i === 3 && done === 3));
      });

      // price (multipliers default to 1x until chosen)
      if (state.service && state.vehicle && state.condition) {
        const total = Math.round(state.service * state.vehicle * state.condition) + state.addons;
        priceEl.textContent = '$' + total.toLocaleString();
        resultEl.hidden = false;
      } else {
        resultEl.hidden = true;
      }
      syncUrl();
    };

    // restore a shared quote from the URL (?v=&c=&s=&a=)
    const applyUrlParams = () => {
      if (typeof location === 'undefined') return;
      try {
        const p = new URLSearchParams(location.search);
        const pick = (key, attr) => {
          const val = p.get(key);
          if (!val) return null;
          const el = $('[' + attr + '="' + escSel(val) + '"]', calcRoot);
          if (!el) return null;
          el.classList.add('is-selected');
          return el;
        };
        const vEl = pick('v', 'data-vehicle');
        if (vEl) { state.vehicle = parseFloat(vEl.dataset.mult); state.vehicleName = vEl.dataset.vehicle; }
        const cEl = pick('c', 'data-condition');
        if (cEl) { state.condition = parseFloat(cEl.dataset.mult); state.conditionName = cEl.dataset.condition; }
        const sEl = pick('s', 'data-service');
        if (sEl) { state.service = parseFloat(sEl.dataset.price); state.serviceName = sEl.dataset.service; }
        (p.get('a') || '').split(',').map(x => x.trim()).filter(Boolean).forEach(name => {
          const cb = $('[data-addon="' + escSel(name) + '"]', calcRoot);
          if (cb) { cb.checked = true; cb.closest('.calc__opt').classList.add('is-selected'); state.addonNames.push(name); }
        });
        state.addons = $$('[data-addon]:checked', calcRoot).reduce((sum, c) => sum + parseFloat(c.dataset.price), 0);
      } catch (e) { /* malformed params are ignored */ }
    };

    // single-select option buttons (vehicle / condition / service)
    $$('.calc__opt[data-vehicle], .calc__opt[data-condition], .calc__opt[data-service]', calcRoot).forEach(btn => {
      btn.addEventListener('click', () => {
        const group = btn.parentElement;
        $$('.calc__opt', group).forEach(o => o.classList.remove('is-selected'));
        btn.classList.add('is-selected');

        if (btn.dataset.vehicle)   { state.vehicle   = parseFloat(btn.dataset.mult);  state.vehicleName   = btn.dataset.vehicle; }
        if (btn.dataset.condition) { state.condition = parseFloat(btn.dataset.mult);  state.conditionName = btn.dataset.condition; }
        if (btn.dataset.service)   { state.service   = parseFloat(btn.dataset.price); state.serviceName   = btn.dataset.service; }
        render();
      });
    });

    // multi-select add-ons
    $$('[data-addon]', calcRoot).forEach(cb => {
      cb.addEventListener('change', () => {
        cb.closest('.calc__opt').classList.toggle('is-selected', cb.checked);
        state.addonNames = $$('[data-addon]:checked', calcRoot).map(c => c.dataset.addon);
        state.addons = state.addonNames.reduce((sum, n) => {
          const box = $('[data-addon="' + escSel(n) + '"]', calcRoot);
          return sum + (box ? parseFloat(box.dataset.price) : 0);
        }, 0);
        render();
      });
    });

    // copy a shareable link to the clipboard
    const shareBtn = $('[data-share]', calcRoot);
    if (shareBtn) {
      const fallbackCopy = (text, done) => {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) {}
        document.body.removeChild(ta);
      };
      shareBtn.addEventListener('click', () => {
        const qs = typeof location !== 'undefined' ? location.search : '';
        const url = (typeof location !== 'undefined' ? location.origin + location.pathname : '') + qs;
        const done = () => {
          shareBtn.classList.add('is-copied');
          const orig = shareBtn.innerHTML;
          shareBtn.innerHTML = 'Link copied ✓';
          setTimeout(() => { shareBtn.innerHTML = orig; shareBtn.classList.remove('is-copied'); }, 2200);
        };
        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(done, () => fallbackCopy(url, done));
        } else fallbackCopy(url, done);
      });
    }

    applyUrlParams();
    render();
  }

  /* ---------------- before / after slider ---------------- */
  $$('.ba__range').forEach(range => {
    const frame = range.closest('[data-ba-frame]');
    const apply = (v) => frame.style.setProperty('--pos', v + '%');
    range.addEventListener('input', () => apply(range.value));
    apply(range.value);
  });

  /* ---------------- gallery: filters + lightbox ---------------- */
  const galleryGrid = $('#galleryGrid');
  const filtersWrap = $('#galleryFilters');
  const lightbox    = $('#lightbox');

  if (galleryGrid && filtersWrap) {
    const tiles = $$('.gal__tile', galleryGrid);
    const cats  = [...new Set(tiles.map(t => t.dataset.cat))];

    filtersWrap.innerHTML = ['All', ...cats].map((c, i) =>
      `<button class="gal__filter${i === 0 ? ' is-active' : ''}" type="button" data-filter="${c}">${c}</button>`
    ).join('');

    filtersWrap.addEventListener('click', (e) => {
      const btn = e.target.closest('.gal__filter');
      if (!btn) return;
      $$('.gal__filter', filtersWrap).forEach(f => f.classList.toggle('is-active', f === btn));
      const f = btn.dataset.filter;
      tiles.forEach(t => t.classList.toggle('is-hidden', f !== 'All' && t.dataset.cat !== f));
    });
  }

  if (galleryGrid && lightbox) {
    const lbMedia  = $('.lb__media', lightbox);
    const lbCat    = $('[data-lb-cat]', lightbox);
    const lbTitle  = $('[data-lb-title]', lightbox);
    const lbCount  = $('[data-lb-count]', lightbox);
    const lbPrev   = $('.lb__prev', lightbox);
    const lbNext   = $('.lb__next', lightbox);
    let items = [];
    let current = 0;
    let lastFocus = null;

    const show = (i) => {
      current = (i + items.length) % items.length;
      const tile = items[current];
      const media = tile.querySelector('.gal__media').cloneNode(true);
      lbMedia.replaceChildren(media);
      lbCat.textContent = tile.dataset.cat;
      const cap = tile.querySelector('.gal__cap span');
      lbTitle.textContent = cap ? cap.textContent : '';
      lbCount.textContent = (current + 1) + ' / ' + items.length;
    };

    const open = (tile) => {
      items = $$('.gal__tile', galleryGrid).filter(t => !t.classList.contains('is-hidden'));
      const idx = items.indexOf(tile);
      if (idx === -1) return;
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      lastFocus = document.activeElement;
      const closeBtn = $('.lb__close', lightbox);
      if (closeBtn) closeBtn.focus();
      show(idx);
    };

    const close = () => {
      lightbox.hidden = true;
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };

    galleryGrid.addEventListener('click', (e) => {
      const tile = e.target.closest('.gal__tile');
      if (tile) open(tile);
    });
    lbPrev.addEventListener('click', () => show(current - 1));
    lbNext.addEventListener('click', () => show(current + 1));
    $$('[data-lb-close]', lightbox).forEach(el => el.addEventListener('click', close));

    // keep Tab cycling inside the dialog while it is open
    lightbox.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const items2 = $$('.lb__btn', lightbox).filter(el => !el.disabled);
      if (!items2.length) return;
      const first = items2[0];
      const last  = items2[items2.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    document.addEventListener('keydown', (e) => {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft')  show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  /* ---------------- booking form ---------------- */
  const bookForm = $('#bookingForm');
  if (bookForm) {
    const btn      = bookForm.querySelector('button[type=submit]');
    const label    = btn.querySelector('.btn__label');
    const success  = $('#bookingSuccess');
    const again    = $('#bookingAgain');
    const dateIn   = $('#bookDate');
    const errorBox = $('#bookingError');
    const endpoint = window.APEX_CONFIG && window.APEX_CONFIG.booking ? window.APEX_CONFIG.booking.endpoint : '';

    // prevent past dates
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    if (dateIn) dateIn.min = today.toISOString().slice(0, 10);

    const setError = (msg) => {
      if (!errorBox) return;
      errorBox.textContent = msg || '';
      errorBox.hidden = !msg;
    };

    /* per-field validation — the same rules as api/book.js, surfaced
       inline per field (blur + live re-check) instead of only on submit */
    const validators = {
      name: (v) => (v.trim().length >= 2 ? '' : 'Please enter your name — 2+ characters.'),
      contact: (v) => {
        const val = v.trim();
        if (!val) return 'Please enter a phone number or email.';
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        const digits = val.replace(/\D/g, '');
        const isPhone = digits.length >= 7 && digits.length <= 15;
        return isEmail || isPhone ? '' : 'Enter a valid email or phone number.';
      },
      date: (v) => {
        if (!v) return 'Please choose a preferred date.';
        const d = new Date(v + 'T00:00:00');
        const t = new Date();
        t.setHours(0, 0, 0, 0);
        return d < t ? 'Please choose a date in the future.' : '';
      }
    };

    const fieldMeta = new Map();
    const errorElFor = (field) => {
      let meta = fieldMeta.get(field);
      if (!meta) {
        const err = document.createElement('small');
        err.className = 'field__err';
        err.id = field.name + '-err';
        err.hidden = true;
        err.setAttribute('aria-live', 'polite');
        const parent = field.closest('.field');
        if (parent) parent.appendChild(err);
        meta = { errorEl: err };
        fieldMeta.set(field, meta);
      }
      return meta.errorEl;
    };

    const validateField = (field) => {
      const fn = validators[field.name];
      const err = fn ? fn(field.value) : '';
      const errEl = errorElFor(field);
      errEl.textContent = err;
      errEl.hidden = !err;
      field.setAttribute('aria-invalid', err ? 'true' : 'false');
      if (err) field.setAttribute('aria-describedby', errEl.id);
      else field.removeAttribute('aria-describedby');
      field.style.borderColor = err ? '#D96C5F' : '';
      return !err;
    };

    const validateForm = () => {
      let ok = true;
      let first = null;
      ['name', 'contact', 'date'].forEach((n) => {
        const f = bookForm.elements[n];
        if (f && !validateField(f)) { ok = false; first = first || f; }
      });
      return { ok, first };
    };

    // validate on blur; once a field has an error, re-check as the user types
    ['name', 'contact', 'date'].forEach((n) => {
      const f = bookForm.elements[n];
      if (!f) return;
      f.addEventListener('blur', () => validateField(f));
      f.addEventListener('input', () => {
        if (f.getAttribute('aria-invalid') === 'true') validateField(f);
      });
    });

    const showSuccess = () => {
      bookForm.querySelectorAll('input, select, textarea, button').forEach(el => el.disabled = true);
      btn.style.display = 'none';
      success.hidden = false;
      success.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    };

    bookForm.addEventListener('submit', (e) => {
      e.preventDefault();
      setError('');

      const check = validateForm();
      if (!check.ok) {
        check.first.focus();
        return;
      }

      btn.disabled = true;
      label.textContent = 'Sending…';

      // serialize the form
      const payload = {};
      Array.from(bookForm.elements).forEach(el => { if (el.name) payload[el.name] = el.value; });

      if (endpoint) {
        // real backend — POST JSON, surface success or error states
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.message || 'Something went wrong — please try again.');
          }
          showSuccess();
        }).catch((err) => {
          btn.disabled = false;
          label.textContent = 'Request appointment';
          setError(err.message);
          if (errorBox) errorBox.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        });
      } else {
        // demo mode — no endpoint configured; simulate a successful submit
        setTimeout(showSuccess, 900);
      }
    });

    again.addEventListener('click', () => {
      bookForm.reset();
      bookForm.querySelectorAll('input, select, textarea, button').forEach(el => el.disabled = false);
      btn.style.display = '';
      label.textContent = 'Request appointment';
      success.hidden = true;
      setError('');
      // clear inline field errors
      bookForm.querySelectorAll('.field__err').forEach(el => { el.hidden = true; el.textContent = ''; });
      bookForm.querySelectorAll('[aria-invalid="true"]').forEach(el => {
        el.removeAttribute('aria-invalid');
        el.removeAttribute('aria-describedby');
        el.style.borderColor = '';
      });
      if (dateIn) dateIn.min = today.toISOString().slice(0, 10);
      bookForm.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  }

  /* ---------------- newsletter ---------------- */
  const news = $('#newsForm');
  if (news) {
    news.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = news.querySelector('input');
      const btn   = news.querySelector('button');
      if (!input.value.includes('@')) {
        input.style.borderColor = '#D96C5F';
        input.focus();
        return;
      }
      input.style.borderColor = '';
      input.value = '';
      input.placeholder = 'Subscribed ✓';
      input.disabled = true;
      btn.disabled = true;
      btn.style.opacity = '.5';
    });
  }

  /* ---------------- smooth-scroll hash offsets for sticky nav ---------------- */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      if (a.hasAttribute('data-instant')) return; // e.g. skip link — native jump
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const tgt = document.querySelector(id);
      if (!tgt) return;
      e.preventDefault();
      const y = tgt.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: Math.max(y, 0), behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------------- year stamp (footer) ---------------- */
  $$('.foot__bot p').forEach(p => {
    p.innerHTML = p.innerHTML.replace(/©\s*\d{4}/, '© ' + new Date().getFullYear());
  });
})();
