// Andean Summit — nav + footer injected per page. Every page has:
//   <div id="nav-mount"></div> ... <div id="footer-mount"></div>
// `data-page` on <body> marks the active link.

(function () {
  const WHATSAPP = 'https://wa.me/51990221361?text=Hola%20Andean%20Summit';
  const PAGES = [
    { id: 'home',          href: 'index.html',         i18n: 'nav.home',          label: 'Home' },
    { id: 'tours',         href: 'tours.html',         i18n: 'nav.tours',         label: 'Tours' },
    { id: 'about',         href: 'about.html',         i18n: 'nav.about',         label: 'About' },
    { id: 'history',       href: 'history.html',       i18n: 'nav.history',       label: 'Peru & Huaraz' },
    { id: 'accommodation', href: 'accommodation.html', i18n: 'nav.accommodation', label: 'Stay' },
    { id: 'contact',       href: 'contact.html',       i18n: 'nav.contact',       label: 'Contact' }
  ];

  function navHTML(currentPage) {
    const linksDesktop = PAGES.map(p => `
      <a href="${p.href}" class="nav-link ${p.id === currentPage ? 'is-active' : ''}" data-i18n="${p.i18n}">${p.label}</a>
    `).join('');
    const linksMobile = PAGES.map(p => `
      <a href="${p.href}" class="mob-link ${p.id === currentPage ? 'is-active' : ''}" data-i18n="${p.i18n}">${p.label}</a>
    `).join('');

    const langSwitch = `
      <div class="lang-switch">
        <button data-lang="en">EN</button>
        <span>·</span>
        <button data-lang="es">ES</button>
        <span>·</span>
        <button data-lang="fr">FR</button>
        <span>·</span>
        <button data-lang="de">DE</button>
      </div>`;

    return `
      <nav id="navbar" class="navbar">
        <div class="nav-inner">
          <a href="index.html" class="nav-logo" aria-label="Andean Summit home">
            <svg width="36" height="36" viewBox="0 0 40 40" aria-hidden="true">
              <path d="M3 33 L13 14 L19 22 L26 9 L37 33 Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
              <circle cx="29" cy="9" r="1.8" fill="currentColor"/>
            </svg>
            <div class="nav-wordmark">
              <span class="wm-1">Andean</span>
              <span class="wm-2">Summit</span>
            </div>
          </a>

          <div class="nav-links">${linksDesktop}</div>

          <div class="nav-right">
            ${langSwitch}
            <a href="${WHATSAPP}" target="_blank" rel="noopener" class="nav-cta" data-i18n="nav.book">Book on WhatsApp</a>
            <button id="navToggle" class="nav-toggle" aria-label="Open menu" aria-expanded="false">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </nav>

      <div id="mobileMenu" class="mobile-menu" aria-hidden="true">
        <div class="mob-head">
          <span class="mob-mark">Andean Summit</span>
          <button id="navClose" aria-label="Close menu">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M6 6l12 12M6 18L18 6"/>
            </svg>
          </button>
        </div>
        <div class="mob-links">${linksMobile}</div>
        <div class="mob-foot">
          ${langSwitch}
          <a href="${WHATSAPP}" target="_blank" rel="noopener" class="mob-cta" data-i18n="nav.book">Book on WhatsApp</a>
        </div>
      </div>
    `;
  }

  function footerHTML() {
    const year = new Date().getFullYear();
    return `
      <footer class="site-footer">
        <div class="footer-inner">
          <div class="ft-col ft-brand">
            <a href="index.html" class="ft-logo">Andean<span>Summit</span></a>
            <p class="ft-tagline" data-i18n="footer.tagline">Travel & adventure agency · Huaraz, Peru · Est. 2012</p>
            <div class="ft-socials">
              <a href="https://www.facebook.com/andean.summit" target="_blank" rel="noopener" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.9V15h-2.5v-3h2.5V9.8c0-2.5 1.5-3.8 3.7-3.8 1 0 2.1.2 2.1.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12H16l-.5 3h-2.4v6.9A10 10 0 0 0 22 12Z"/></svg>
              </a>
              <a href="https://www.instagram.com/andeansummit/" target="_blank" rel="noopener" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>
              </a>
              <a href="http://www.tripadvisor.es/Attraction_Review-g304039-d3202294-Reviews-Andean_Summit-Huaraz_Ancash_Region.html" target="_blank" rel="noopener" aria-label="TripAdvisor">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm-6 0a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm12 0a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM12 5C8.7 5 5.7 5.7 3.3 6.9L1 5v4.6A6.5 6.5 0 0 0 6 19a6.5 6.5 0 0 0 5.5-3 6.5 6.5 0 0 0 5.5 3 6.5 6.5 0 0 0 6-9.4V5l-2.3 1.9C18.3 5.7 15.3 5 12 5Z"/></svg>
              </a>
            </div>
          </div>

          <div class="ft-col">
            <h4 data-i18n="footer.site">Site</h4>
            <ul>
              ${PAGES.map(p => `<li><a href="${p.href}" data-i18n="${p.i18n}">${p.label}</a></li>`).join('')}
            </ul>
          </div>

          <div class="ft-col">
            <h4 data-i18n="footer.reach">Get in touch</h4>
            <ul>
              <li><a href="${WHATSAPP}" target="_blank" rel="noopener">WhatsApp · +51 990 221 361</a></li>
              <li><a href="tel:+51990221361">+51 990 221 361</a></li>
              <li><a href="mailto:info@andeansummit.com">info@andeansummit.com</a></li>
            </ul>
          </div>

          <div class="ft-col">
            <h4 data-i18n="footer.base">Base</h4>
            <p class="ft-addr" data-i18n="footer.address">Pasaje Wuamashraju 692
Parque Ginebra, Huaraz</p>
            <p class="ft-coord" data-i18n="footer.coord">9°31′S · 77°31′W · 3 100 m</p>
          </div>
        </div>

        <div class="footer-bottom">
          <span>© ${year} Andean Summit.</span>
          <span class="dot">·</span>
          <span data-i18n="footer.rights">All rights reserved.</span>
        </div>
      </footer>
    `;
  }

  function init() {
    const body = document.body;
    const page = body.getAttribute('data-page') || 'home';
    const navMount = document.getElementById('nav-mount');
    const footMount = document.getElementById('footer-mount');
    if (navMount) navMount.innerHTML = navHTML(page);
    if (footMount) footMount.innerHTML = footerHTML();
    // Defer to main.js for behavior wiring (lang toggle, mobile menu, scroll states).
    document.dispatchEvent(new Event('components:ready'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
