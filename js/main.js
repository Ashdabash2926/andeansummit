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

  function init() {
    applyLang(detectLang());
    wireLangButtons();
    wireMobileMenu();
    wireNavScroll();
    wireReveal();
  }

  document.addEventListener('components:ready', init);
})();
