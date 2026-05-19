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

  function cardHTML(t, i) {
    const lang = getLang();
    const dayLabel = t.days === 1 ? trans('tours.card.day') : trans('tours.card.days');
    const catLabel = (CATEGORY_LABEL[t.category] || {})[lang] || t.category;
    const diffLabel = (DIFFICULTY_LABEL[t.difficulty] || {})[lang] || t.difficulty;
    const idx = String((i || 0) + 1).padStart(2, '0');
    const viewLabel = trans('tours.modal.viewDates') || 'View dates';
    return `
      <article class="tour-card" data-cat="${t.category}" data-slug="${t.slug}" data-reveal tabindex="0" role="button" aria-label="${t.nameEN} — view dates">
        <header class="tc-head">
          <span class="tc-num">№ ${idx}</span>
          <span class="tc-alt"><span class="tc-alt-num">${t.altitudeM.toLocaleString()}</span><span class="tc-alt-unit">m</span></span>
        </header>
        <div class="tour-media">
          <img src="${t.image}" alt="${t.nameEN}" loading="lazy" width="1100" height="780">
          <span class="tour-badge">${catLabel}</span>
        </div>
        <div class="tour-body">
          <div class="tc-meta">
            <span class="tc-meta-item">${t.days} ${dayLabel}</span>
            <span class="tc-meta-sep">·</span>
            <span class="diff" data-d="${t.difficulty}" aria-label="${diffLabel}"><i></i><i></i><i></i></span>
            <span class="tc-meta-item tc-meta-diff">${diffLabel}</span>
          </div>
          <h3 class="tour-name"><span class="tc-lead">—</span>${t.nameEN}</h3>
          <p class="tour-sum">${t.summaryEN}</p>
          <div class="tc-foot">
            <span class="tc-view">
              <span>${viewLabel}</span>
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="square"><path d="M0.5 5h11M9 1l4 4-4 4"/></svg>
            </span>
          </div>
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
    const start = parseDate(startStr);
    const end = endStr ? parseDate(endStr) : start;
    const dayMonth = new Intl.DateTimeFormat(lang || 'en', { day: '2-digit', month: 'short' });
    const yr = String(start.getFullYear()).slice(-2);
    const sDM = dayMonth.format(start);
    const eDM = dayMonth.format(end);
    if (start.toDateString() === end.toDateString()) return `${sDM}<span class="tt-yr">'${yr}</span>`;
    return `${sDM} – ${eDM}<span class="tt-yr">'${yr}</span>`;
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

    const tmNum = document.getElementById('tmNum');
    if (tmNum) {
      const all = window.TOURS || [];
      const idx = all.findIndex(t => t.slug === slug);
      tmNum.textContent = idx >= 0 ? `№ ${String(idx + 1).padStart(2, '0')} / ${all.length}` : '';
    }
    const tmStamp = document.getElementById('tmStamp');
    if (tmStamp) {
      tmStamp.textContent = `${catLabel.toUpperCase()} · ${tour.altitudeM.toLocaleString()}M`;
    }

    const deps = upcomingForSlug(slug);
    const depsEl = document.getElementById('tmDeps');
    if (!deps.length) {
      depsEl.innerHTML = `<li class="tm-ticket tour-modal-empty" data-i18n="tours.modal.noDates">No fixed departures listed — message us on WhatsApp for custom dates.</li>`;
    } else {
      depsEl.innerHTML = deps.map(d => {
        const status = (STATUS_LABEL[d.status] || {})[lang] || d.status || '';
        const spotsLabel = trans('tours.modal.spots') || 'spots';
        const metaParts = [];
        if (d.spotsLeft != null && d.status !== 'full') metaParts.push(`<span>${d.spotsLeft} ${spotsLabel}</span>`);
        if (d.priceUSD) metaParts.push(`<span class="tt-price">$${d.priceUSD} USD</span>`);
        const meta = metaParts.length
          ? metaParts.join('<span class="tt-sep">·</span>')
          : '';
        return `<li class="tm-ticket" data-status="${d.status || 'open'}">
          <span class="tt-date">${fmtRange(d.startDate, d.endDate)}</span>
          <span class="tt-status">${status}</span>
          ${meta ? `<span class="tt-meta">${meta}</span>` : ''}
          ${d.notes ? `<p class="tt-notes">${d.notes.replace(/[<>]/g, '')}</p>` : ''}
        </li>`;
      }).join('');
    }

    const wa = WHATSAPP_BASE + encodeURIComponent(`Hola Andean Summit, me interesa el ${tour.nameEN}.`);
    document.getElementById('tmCta').href = wa;

    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const modal = document.getElementById('tourModal');
    if (!modal || !modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
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
    grid.innerHTML = filtered.map((t, i) => cardHTML(t, i)).join('');
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

  function updateFilterCounts() {
    const tours = window.TOURS || [];
    const counts = { all: tours.length };
    tours.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1; });
    document.querySelectorAll('[data-cat-count]').forEach(el => {
      const cat = el.getAttribute('data-cat-count');
      el.textContent = String(counts[cat] || 0).padStart(2, '0');
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
    updateFilterCounts();
    render();
    wireFilters();
    wireModal();
    document.addEventListener('lang:changed', () => { updateFilterCounts(); render(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
