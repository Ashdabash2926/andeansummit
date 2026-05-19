// Andean Summit — home page "Departing soon" widget.
// Fetches data/departures.json + data/tours.json, picks the soonest upcoming
// non-full entry, renders the widget and runs the countdown.

(function () {
  const WHATSAPP_BASE = 'https://wa.me/51990221361?text=';
  const SECTION = document.getElementById('departure');
  if (!SECTION) return;

  const els = {
    status: document.getElementById('depStatus'),
    title:  document.getElementById('depTitle'),
    meta:   document.getElementById('depMeta'),
    cta:    document.getElementById('depCta'),
    days:   document.getElementById('cdDays'),
    hrs:    document.getElementById('cdHrs'),
    min:    document.getElementById('cdMin'),
    sec:    document.getElementById('cdSec')
  };

  const STATUS_LABEL = {
    open:        'Open for booking',
    'few-spots': 'Few spots remaining',
    full:        'Fully booked',
    cancelled:   'Cancelled'
  };

  const pad = n => String(n).padStart(2, '0');

  function parseDate(s) {
    // Parse YYYY-MM-DD as local date at 06:00 (departures usually leave early)
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d, 6, 0, 0);
  }

  function formatRange(startStr, endStr, lang) {
    const start = parseDate(startStr);
    const end = endStr ? parseDate(endStr) : start;
    const fmt = new Intl.DateTimeFormat(lang || 'en', { day: 'numeric', month: 'short' });
    if (start.toDateString() === end.toDateString()) return fmt.format(start);
    return fmt.format(start) + ' – ' + fmt.format(end);
  }

  function pickSoonest(departures) {
    const now = new Date();
    return departures
      .filter(d => d.status !== 'full' && d.status !== 'cancelled')
      .map(d => ({ ...d, _date: parseDate(d.startDate) }))
      .filter(d => d._date > now)
      .sort((a, b) => a._date - b._date)[0];
  }

  async function loadJSON(path, key) {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error(path + ' → HTTP ' + res.status);
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data[key])) return data[key];
    return [];
  }

  async function init() {
    let departures, tours;
    try {
      [departures, tours] = await Promise.all([
        loadJSON('data/departures.json', 'departures'),
        loadJSON('data/tours.json', 'tours')
      ]);
    } catch (e) {
      console.warn('Departures: data load failed', e);
      return; // section stays hidden — graceful degradation
    }

    const dep = pickSoonest(departures);
    if (!dep) return; // nothing upcoming → keep hidden

    const tour = tours.find(t => t.slug === dep.tourSlug);
    if (!tour) {
      console.warn('Departures: tour not found for slug', dep.tourSlug);
      return;
    }

    const lang = (localStorage.getItem('lang') || document.documentElement.lang || 'en');
    els.title.textContent = tour.nameEN;
    els.status.textContent = STATUS_LABEL[dep.status] || 'Departing soon';
    const metaBits = [
      tour.days + (tour.days === 1 ? ' day' : ' days'),
      tour.altitudeM.toLocaleString() + 'm max',
      tour.difficulty.charAt(0).toUpperCase() + tour.difficulty.slice(1),
      formatRange(dep.startDate, dep.endDate, lang),
      (dep.spotsLeft != null ? dep.spotsLeft + ' spots left' : '')
    ].filter(Boolean);
    els.meta.textContent = metaBits.join(' · ');

    // Update CTA WhatsApp message with tour name + start date
    const msg = `Hola Andean Summit, quiero unirme al próximo ${tour.nameEN} (${dep.startDate}).`;
    els.cta.href = WHATSAPP_BASE + encodeURIComponent(msg);

    SECTION.hidden = false;

    // Countdown
    const target = parseDate(dep.startDate);
    const tick = () => {
      const diff = target - new Date();
      if (diff <= 0) {
        els.days.textContent = els.hrs.textContent = els.min.textContent = els.sec.textContent = '00';
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      els.days.textContent = pad(d);
      els.hrs.textContent  = pad(h);
      els.min.textContent  = pad(m);
      els.sec.textContent  = pad(s);
    };
    tick();
    setInterval(tick, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
