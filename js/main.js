// Andean Summit — global behavior. Runs after components.js dispatches `components:ready`.

(function () {
  const SUPPORTED = ['en', 'es', 'fr', 'de'];

  function detectLang() {
    const saved = localStorage.getItem('lang');
    if (saved && SUPPORTED.includes(saved)) return saved;
    const browser = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return SUPPORTED.includes(browser) ? browser : 'en';
  }

  function applyLang(lang) {
    if (!SUPPORTED.includes(lang)) lang = 'en';
    const dict = (window.TRANSLATIONS && window.TRANSLATIONS[lang]) || {};
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] != null) {
        // Preserve newlines: convert \n to <br> for headings; plain text for inputs/placeholder fallback.
        const value = dict[key];
        if (el.dataset.i18nMode === 'plain') {
          el.textContent = value;
        } else {
          el.innerHTML = value.replace(/\n/g, '<br>');
        }
      }
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      // Format: "attr:key,attr:key"
      const spec = el.getAttribute('data-i18n-attr');
      spec.split(',').forEach(pair => {
        const [attr, key] = pair.trim().split(':');
        if (dict[key] != null) el.setAttribute(attr, dict[key]);
      });
    });
    document.querySelectorAll('.lang-switch button').forEach(btn => {
      btn.classList.toggle('is-active', btn.getAttribute('data-lang') === lang);
    });
    localStorage.setItem('lang', lang);
    document.dispatchEvent(new CustomEvent('lang:changed', { detail: { lang } }));
  }

  function wireLangButtons() {
    document.querySelectorAll('.lang-switch button').forEach(btn => {
      btn.addEventListener('click', () => applyLang(btn.getAttribute('data-lang')));
    });
  }

  function wireMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const close = document.getElementById('navClose');
    const menu = document.getElementById('mobileMenu');
    if (!toggle || !menu) return;
    const open = () => {
      menu.classList.add('is-open');
      menu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };
    const shut = () => {
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };
    toggle.addEventListener('click', open);
    if (close) close.addEventListener('click', shut);
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', shut));
  }

  function wireNavScroll() {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    const hasHero = document.querySelector('[data-hero]');
    const setState = () => {
      const scrolled = window.scrollY > 24;
      nav.classList.toggle('is-scrolled', scrolled);
      if (!hasHero) nav.classList.add('is-solid');
    };
    setState();
    window.addEventListener('scroll', setState, { passive: true });
  }

  function wireReveal() {
    const els = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window) || !els.length) {
      els.forEach(el => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(el => io.observe(el));
  }

  function formatNumber(n, format) {
    if (format === 'thousands') {
      // 6768 → "6 768" (thin space, matches site convention used in nav coords / address)
      return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
    return Math.round(n).toString();
  }

  function wireCounters() {
    const targets = document.querySelectorAll('[data-count]');
    if (!targets.length) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      targets.forEach(el => {
        el.textContent = formatNumber(parseFloat(el.getAttribute('data-count')), el.getAttribute('data-format'));
      });
      return;
    }
    const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
    const animate = (el) => {
      const target = parseFloat(el.getAttribute('data-count'));
      const format = el.getAttribute('data-format');
      const duration = 1600;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const v = easeOutCubic(t) * target;
        el.textContent = formatNumber(v, format);
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = formatNumber(target, format);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animate(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    targets.forEach(el => io.observe(el));
  }

  function splitHeroTitle(el) {
    if (!el || el.dataset.wordSplit === '1') return;
    // Walks children — text becomes word spans, <br> stays, <em> wraps inner words but keeps emphasis class
    const wrap = (word, idx, klass) => {
      const m = document.createElement('span');
      m.className = 'w' + (klass ? ' ' + klass : '');
      m.style.setProperty('--i', idx);
      const inner = document.createElement('span');
      inner.className = 'wi';
      inner.textContent = word;
      m.appendChild(inner);
      return m;
    };
    let i = 0;
    const processNode = (node, klass) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        node.textContent.split(/\s+/).filter(Boolean).forEach((w, j, arr) => {
          frag.appendChild(wrap(w, i++, klass));
          if (j < arr.length - 1) frag.appendChild(document.createTextNode(' '));
        });
        return frag;
      }
      if (node.tagName === 'BR') return node.cloneNode();
      if (node.tagName === 'EM') {
        const frag = document.createDocumentFragment();
        Array.from(node.childNodes).forEach(child => {
          const out = processNode(child, 'w--em');
          if (out) frag.appendChild(out);
        });
        return frag;
      }
      return null;
    };
    const next = document.createDocumentFragment();
    Array.from(el.childNodes).forEach(child => {
      const out = processNode(child);
      if (out) next.appendChild(out);
    });
    el.innerHTML = '';
    el.appendChild(next);
    el.dataset.wordSplit = '1';
    // Trigger animation on next frame
    requestAnimationFrame(() => el.classList.add('is-revealed'));
  }

  function wireHeroReveal() {
    document.querySelectorAll('[data-word-reveal]').forEach(splitHeroTitle);
    document.addEventListener('lang:changed', () => {
      document.querySelectorAll('[data-word-reveal]').forEach(el => {
        el.dataset.wordSplit = '';
        el.classList.remove('is-revealed');
        splitHeroTitle(el);
      });
      wireTodayDate();
    });
  }

  function wireTodayDate() {
    const el = document.getElementById('todayDate');
    if (!el) return;
    const lang = (localStorage.getItem('lang') || 'en');
    const fmt = new Intl.DateTimeFormat(lang, { day: '2-digit', month: 'short' });
    el.textContent = fmt.format(new Date()).toUpperCase();
  }

  function wireSlideshow() {
    const slides = document.querySelectorAll('.hero-slideshow .hero-slide');
    if (slides.length < 2) return;
    let i = 0;
    setInterval(() => {
      slides[i].classList.remove('is-active');
      i = (i + 1) % slides.length;
      slides[i].classList.add('is-active');
    }, 5500);
  }

  function wireScrollProgress() {
    const bar = document.querySelector('.scroll-progress-bar');
    if (!bar) return;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = pct + '%';
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  // Map scroll percentage to a faux elevation reading 3100 → 6768
  function wireElevTrack() {
    const track = document.querySelector('.elev-track');
    const val = document.getElementById('elevVal');
    const loc = document.getElementById('elevLoc');
    if (!track || !val) return;
    const BASE = 3100;
    const SUMMIT = 6768;
    const ZONES = [
      { p: 0,    name: 'Base · Huaraz' },
      { p: .15,  name: 'Cebollapampa' },
      { p: .30,  name: 'Camp 1 · Refugio' },
      { p: .45,  name: 'Llanganuco' },
      { p: .60,  name: 'Camp 2' },
      { p: .75,  name: 'High camp' },
      { p: .90,  name: 'Summit ridge' },
      { p: 1,    name: 'Huascarán summit' }
    ];
    const format = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const elev = BASE + (SUMMIT - BASE) * pct;
      val.textContent = format(elev);
      // Show only after scrolling past the hero
      track.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
      // Pick zone label
      let zone = ZONES[0];
      for (const z of ZONES) { if (pct >= z.p) zone = z; }
      if (loc.textContent !== zone.name) loc.textContent = zone.name;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  function wireCursor() {
    if (!window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)').matches) return;
    const cursor = document.querySelector('.cursor');
    if (!cursor) return;
    let x = 0, y = 0, tx = 0, ty = 0;
    document.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
      cursor.classList.add('is-on');
    });
    document.addEventListener('mouseleave', () => cursor.classList.remove('is-on'));
    const tick = () => {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    const HOVER_SELECTOR = 'a, button, .tour-card, .cat-row, .stat, .marquee-item';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(HOVER_SELECTOR)) cursor.classList.add('is-hover');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(HOVER_SELECTOR)) cursor.classList.remove('is-hover');
    });
  }

  function init() {
    applyLang(detectLang());
    wireHeroReveal();
    wireTodayDate();
    wireLangButtons();
    wireMobileMenu();
    wireNavScroll();
    wireCounters();
    wireSlideshow();
    wireScrollProgress();
    wireElevTrack();
    wireCursor();
    wireReveal();
  }

  document.addEventListener('components:ready', init);
})();
