// Andean Summit — tours page: render and filter.

(function () {
  const WHATSAPP_BASE = 'https://wa.me/51990221361?text=';
  let activeCategory = 'all';

  const CATEGORY_LABEL = {
    trekking:  { en: 'Trek',      es: 'Trek',       fr: 'Trek',       de: 'Trekking' },
    climbing:  { en: 'Climb',     es: 'Escalada',   fr: 'Alpinisme',  de: 'Bergsteigen' },
    adventure: { en: 'Adventure', es: 'Aventura',   fr: 'Aventure',   de: 'Abenteuer' },
    tour:      { en: 'Tour',      es: 'Tour',       fr: 'Excursion',  de: 'Tour' },
    course:    { en: 'Course',    es: 'Curso',      fr: 'Cours',      de: 'Kurs' }
  };

  const DIFFICULTY_LABEL = {
    easy:     { en: 'Easy',     es: 'Fácil',     fr: 'Facile',  de: 'Leicht' },
    moderate: { en: 'Moderate', es: 'Moderado',  fr: 'Modéré',  de: 'Mittel' },
    hard:     { en: 'Hard',     es: 'Exigente',  fr: 'Difficile', de: 'Schwer' },
    all:      { en: 'All levels', es: 'Todos los niveles', fr: 'Tous niveaux', de: 'Alle Stufen' }
  };

  function getLang() {
    return localStorage.getItem('lang') || document.documentElement.lang || 'en';
  }

  function trans(key) {
    const lang = getLang();
    const dict = (window.TRANSLATIONS && window.TRANSLATIONS[lang]) || {};
    return dict[key] || (window.TRANSLATIONS && window.TRANSLATIONS.en[key]) || '';
  }

  function cardHTML(t) {
    const lang = getLang();
    const dayLabel = t.days === 1 ? trans('tours.card.day') : trans('tours.card.days');
    const catLabel = (CATEGORY_LABEL[t.category] || {})[lang] || t.category;
    const diffLabel = (DIFFICULTY_LABEL[t.difficulty] || {})[lang] || t.difficulty;
    const wa = WHATSAPP_BASE + encodeURIComponent(`Hola Andean Summit, me interesa el ${t.nameEN}.`);
    return `
      <article class="tour-card" data-cat="${t.category}" data-reveal>
        <a class="tour-media" href="${wa}" target="_blank" rel="noopener" aria-label="${t.nameEN}">
          <img src="${t.image}" alt="${t.nameEN}" loading="lazy" width="1100" height="780">
          <span class="tour-badge">${catLabel}</span>
        </a>
        <div class="tour-body">
          <h3 class="tour-name">${t.nameEN}</h3>
          <p class="tour-sum">${t.summaryEN}</p>
          <div class="tour-meta">
            <span class="meta-chip"><strong>${t.days}</strong> ${dayLabel}</span>
            <span class="meta-chip">${t.altitudeM.toLocaleString()} m</span>
            <span class="meta-chip">${diffLabel}</span>
          </div>
          <a href="${wa}" target="_blank" rel="noopener" class="tour-cta" data-i18n="tours.card.inquire">${trans('tours.card.inquire') || 'Enquire on WhatsApp'}</a>
        </div>
      </article>
    `;
  }

  function render() {
    const grid = document.getElementById('toursGrid');
    if (!grid) return;
    const list = window.TOURS || [];
    const filtered = activeCategory === 'all'
      ? list
      : list.filter(t => t.category === activeCategory);
    grid.innerHTML = filtered.map(cardHTML).join('');
    const count = document.getElementById('toursCount');
    if (count) count.textContent = filtered.length;
    // Re-observe reveal targets
    if (typeof IntersectionObserver !== 'undefined') {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
        });
      }, { threshold: 0.08 });
      grid.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
    }
  }

  function wireFilters() {
    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        activeCategory = chip.getAttribute('data-cat');
        render();
      });
    });
  }

  function init() {
    if (!document.getElementById('toursGrid')) return;
    render();
    wireFilters();
    document.addEventListener('lang:changed', render);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
