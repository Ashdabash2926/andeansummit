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

  function wireCatPreview() {
    const list = document.querySelector('.cat-list');
    if (!list) return;
    const preview = list.querySelector('.cat-preview');
    const inner = preview && preview.querySelector('.cat-preview-inner');
    if (!preview || !inner) return;
    if (!window.matchMedia('(min-width: 1024px) and (hover: hover)').matches) return;
    const rows = list.querySelectorAll('.cat-row');
    let activeRow = null;
    list.addEventListener('mousemove', (e) => {
      if (!activeRow) return;
      const rect = list.getBoundingClientRect();
      preview.style.left = (e.clientX - rect.left) + 'px';
      preview.style.top  = (e.clientY - rect.top) + 'px';
    });
    rows.forEach(row => {
      row.addEventListener('mouseenter', () => {
        activeRow = row;
        const img = row.getAttribute('data-img');
        if (img) inner.style.backgroundImage = `url("${img}")`;
        preview.classList.add('is-on');
      });
      row.addEventListener('mouseleave', () => {
        activeRow = null;
        preview.classList.remove('is-on');
      });
    });
  }

  function init() {
    applyLang(detectLang());
    wireLangButtons();
    wireMobileMenu();
    wireNavScroll();
    wireCounters();
    wireCatPreview();
    wireReveal();
  }

  document.addEventListener('components:ready', init);
})();
