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
      <article class="tour-card" data-cat="${t.category}" data-slug="${t.slug}" data-reveal tabindex="0" role="button" aria-label="${t.nameEN} — view dates">
        <div class="tour-media">
          <img src="${t.image}" alt="${t.nameEN}" loading="lazy" width="1100" height="780">
          <span class="tour-badge">${catLabel}</span>
        </div>
        <div class="tour-body">
          <h3 class="tour-name">${t.nameEN}</h3>
          <p class="tour-sum">${t.summaryEN}</p>
          <div class="tour-meta">
            <span class="meta-chip"><strong>${t.days}</strong> ${dayLabel}</span>
            <span class="meta-chip">${t.altitudeM.toLocaleString()} m</span>
            <span class="meta-chip">${diffLabel}</span>
          </div>
          <a href="${wa}" target="_blank" rel="noopener" class="tour-cta" data-i18n="tours.card.inquire" data-stop>${trans('tours.card.inquire') || 'Enquire on WhatsApp'}</a>
        </div>
      </article>
    `;
  }

  // ============ MODAL ============
  const STATUS_LABEL = {
    open:        { en: 'Open',             es: 'Abierto',        fr: 'Ouvert',         de: 'Offen' },
    'few-spots': { en: 'Few spots left',   es: 'Pocas plazas',   fr: 'Places limitées', de: 'Wenige Plätze' },
    full:        { en: 'Fully booked',     es: 'Completo',       fr: 'Complet',         de: 'Ausgebucht' },
    cancelled:   { en: 'Cancelled',        es: 'Cancelado',      fr: 'Annulé',          de: 'Abgesagt' }
  };

  function parseDate(s) {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  function fmtRange(startStr, endStr) {
    const lang = getLang();
    const fmt = new Intl.DateTimeFormat(lang || 'en', { day: 'numeric', month: 'short', year: 'numeric' });
    const start = parseDate(startStr);
    const end = endStr ? parseDate(endStr) : start;
    if (start.toDateString() === end.toDateString()) return fmt.format(start);
    return fmt.format(start) + ' – ' + fmt.format(end);
  }

  function upcomingForSlug(slug) {
    const now = new Date(); now.setHours(0, 0, 0, 0);
    return (window.DEPARTURES || [])
      .filter(d => d.tourSlug === slug)
      .filter(d => d.status !== 'cancelled')
      .filter(d => parseDate(d.startDate) >= now)
      .sort((a, b) => parseDate(a.startDate) - parseDate(b.startDate));
  }

  function openModal(slug) {
    const tour = (window.TOURS || []).find(t => t.slug === slug);
    if (!tour) return;
    const modal = document.getElementById('tourModal');
    const lang = getLang();
    const catLabel = (CATEGORY_LABEL[tour.category] || {})[lang] || tour.category;

    document.getElementById('tmImg').src = tour.image;
    document.getElementById('tmImg').alt = tour.nameEN;
    document.getElementById('tmCat').textContent = catLabel;
    document.getElementById('tmTitle').textContent = tour.nameEN;
    document.getElementById('tmSum').textContent = tour.summaryEN;

    const deps = upcomingForSlug(slug);
    const depsEl = document.getElementById('tmDeps');
    if (!deps.length) {
      depsEl.innerHTML = `<li class="tour-modal-empty" data-i18n="tours.modal.noDates">No fixed departures listed — message us on WhatsApp for custom dates.</li>`;
    } else {
      depsEl.innerHTML = deps.map(d => {
        const status = (STATUS_LABEL[d.status] || {})[lang] || d.status || '';
        const spots = (d.spotsLeft != null && d.status !== 'full') ? `${d.spotsLeft} ${trans('tours.modal.spots') || 'spots'}` : '';
        const price = d.priceUSD ? `$${d.priceUSD} USD` : '';
        const meta = [status, spots, price].filter(Boolean).join(' · ');
        return `<li>
          <span class="tm-date">${fmtRange(d.startDate, d.endDate)}</span>
          <span class="tm-meta">${meta}</span>
          ${d.notes ? `<span class="tm-notes">${d.notes.replace(/[<>]/g, '')}</span>` : ''}
        </li>`;
      }).join('');
    }

    const wa = WHATSAPP_BASE + encodeURIComponent(`Hola Andean Summit, me interesa el ${tour.nameEN}.`);
    document.getElementById('tmCta').href = wa;

    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('is-open'));
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const modal = document.getElementById('tourModal');
    if (!modal || modal.hidden) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => { modal.hidden = true; }, 200);
  }

  function wireModal() {
    const grid = document.getElementById('toursGrid');
    if (grid) {
      grid.addEventListener('click', (e) => {
        if (e.target.closest('[data-stop]')) return;
        const card = e.target.closest('.tour-card');
        if (card) openModal(card.getAttribute('data-slug'));
      });
      grid.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const card = e.target.closest('.tour-card');
        if (!card) return;
        e.preventDefault();
        openModal(card.getAttribute('data-slug'));
      });
    }
    const modal = document.getElementById('tourModal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target.closest('[data-close]')) closeModal();
      });
    }
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
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

  async function loadJSONArray(path, key) {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    return Array.isArray(data) ? data : (data && Array.isArray(data[key]) ? data[key] : []);
  }

  async function loadData() {
    try {
      const [tours, deps] = await Promise.all([
        loadJSONArray('data/tours.json', 'tours'),
        loadJSONArray('data/departures.json', 'departures').catch(() => [])
      ]);
      window.TOURS = tours;
      window.DEPARTURES = deps;
    } catch (e) {
      console.error('Failed to load tours/departures', e);
      window.TOURS = window.TOURS || [];
      window.DEPARTURES = window.DEPARTURES || [];
    }
  }

  async function init() {
    if (!document.getElementById('toursGrid')) return;
    await loadData();
    render();
    wireFilters();
    wireModal();
    document.addEventListener('lang:changed', render);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
