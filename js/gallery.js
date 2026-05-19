// Andean Summit — populate the home page marquee from data/gallery.json.
// Renders each image twice for seamless infinite scroll.

(function () {
  const track = document.querySelector('.marquee .marquee-track');
  if (!track) return;

  const itemHTML = (g, aria) => `
    <a href="tours.html" class="marquee-item"${aria ? ' aria-hidden="true"' : ''}>
      <img src="${g.src}" alt="${aria ? '' : (g.caption || '')}" loading="lazy">
      <span class="m-cap">${String(g.caption || '').replace(/[<>]/g, '')}</span>
    </a>`;

  async function init() {
    let gallery;
    try {
      const res = await fetch('data/gallery.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      gallery = Array.isArray(data) ? data : (data && Array.isArray(data.gallery) ? data.gallery : []);
    } catch (e) {
      // Fall back to whatever is already in the HTML (the existing hardcoded set)
      console.warn('Gallery: data load failed, leaving static items', e);
      return;
    }
    if (!Array.isArray(gallery) || !gallery.length) return;
    // Number each caption with a leading "NN ·" if not already present
    const numbered = gallery.map((g, i) => ({
      ...g,
      caption: /^\d+\s*·/.test(g.caption || '') ? g.caption : `${String(i + 1).padStart(2, '0')} · ${g.caption || ''}`
    }));
    const original = numbered.map(g => itemHTML(g, false)).join('');
    const duped = numbered.map(g => itemHTML(g, true)).join('');
    track.innerHTML = original + duped;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
