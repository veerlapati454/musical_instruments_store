/* Deals page. Loaded BEFORE script.js so the cards exist when script.js binds cart buttons. */
(function () {
  /* Accepts either an Unsplash photo ID or a local/absolute path (e.g. ../assets/m30.webp) */
  const U = (id) => /^(\.{0,2}\/|https?:)/.test(id) || /\.(webp|jpe?g|png|avif)$/i.test(id)
    ? id
    : `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;
  const D = [
    [1, 'Aura Deluxe Acoustic Guitar', 799, 899, 'Guitars', '../assets/m30.webp', 5, 48],
    [2, 'Pro 88-Key Stage Keyboard', 1249, 1499, 'Keyboards', '../assets/m31.webp', 4.5, 32],
    [3, 'Master Custom Drum Kit', 1599, 1899, 'Drums', '../assets/m32.webp', 5, 19],
    [4, 'Vintage Electric Sunburst Guitar', 949, 1099, 'Guitars', '../assets/m33.webp', 5, 64],
    [5, 'Studio Condenser Mic', 299, 399, 'Studio', '../assets/m34.webp', 4.5, 53],
    [6, 'Classic Violin Master Series', 680, 799, 'Orchestral', '../assets/m35.webp', 5, 27],
    [7, 'Aura Studio Wireless Headphones', 199, 299, 'Studio', '../assets/m36.webp', 4.5, 88],
    [8, 'Stage Pro Electric Guitar', 1149, 1349, 'Guitars', '../assets/m37.webp', 4.5, 21]
  ];
  const m = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2 });
  const stars = (r) => '<i class="fa-solid fa-star"></i>'.repeat(Math.floor(r)) + (r % 1 ? '<i class="fa-solid fa-star-half-stroke"></i>' : '');
  const grid = document.getElementById('dlGrid');
  grid.innerHTML = D.map(([id, t, p, o, c, img, r, n]) => `
    <div class="product-card" data-id="${id}" data-title="${t}" data-price="${p}" data-category="${c}" data-image="${U(img)}">
      <div class="product-img-box"><span class="product-tag">-${Math.round((o - p) / o * 100)}%</span>
        <img src="${U(img)}" alt="${t}" loading="lazy">
        <div class="product-actions"><button class="action-btn add-favorite" aria-label="Add to Wishlist"><i class="fa-regular fa-heart"></i></button></div></div>
      <div class="product-content">
        <div class="product-rating">${stars(r)}<span>(${n})</span></div>
        <h3 class="product-title">${t}</h3>
        <p class="product-price">${m(p)} <span class="old-price">${m(o)}</span></p>
        <span class="save">You save ${m(o - p)}</span>
        <button type="button" class="btn btn-primary btn-block add-to-cart-btn"><i class="fa-solid fa-bag-shopping"></i> Add to Cart</button>
      </div></div>`).join('');

  document.addEventListener('click', (e) => {
    if (e.target.closest('a.logo')) { e.stopPropagation(); e.preventDefault(); location.href = '../index.html'; }
  }, true);

  document.addEventListener('DOMContentLoaded', () => {
    const $ = (id) => document.getElementById(id), $$ = (s) => Array.from(document.querySelectorAll(s));
    const toast = (msg) => { const t = $('toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2500); };

    /* Countdown to Sunday 23:59:59 */
    const end = new Date(); end.setDate(end.getDate() + (7 - end.getDay()) % 7); end.setHours(23, 59, 59, 0);
    if (end < new Date()) end.setDate(end.getDate() + 7);
    const pad = (n) => String(n).padStart(2, '0');
    function tick() {
      let s = Math.max(0, Math.floor((end - Date.now()) / 1000));
      const v = { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
      $$('[data-cd] b').forEach((b) => { const nv = pad(v[b.dataset.u]); if (b.textContent !== nv) { b.textContent = nv; if (b.dataset.u === 's' && window.gsap) gsap.fromTo(b, { y: -8, opacity: .4 }, { y: 0, opacity: 1, duration: .3 }); } });
    }
    tick(); setInterval(tick, 1000);

    /* Filter tabs */
    const cards = Array.from(grid.children);
    $('dTabs').addEventListener('click', (e) => {
      const b = e.target.closest('.dtab'); if (!b) return;
      $$('.dtab').forEach((x) => x.classList.remove('active')); b.classList.add('active');
      let i = 0;
      cards.forEach((c) => { const ok = b.dataset.f === 'all' || c.dataset.category === b.dataset.f; c.classList.toggle('is-hidden', !ok);
        if (ok) { c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); c.style.animationDelay = (i++) * 60 + 'ms'; } });
    });
    grid.addEventListener('click', (e) => { const b = e.target.closest('.add-favorite'); if (!b) return;
      const on = b.classList.toggle('on'); b.querySelector('i').className = on ? 'fa-solid fa-heart' : 'fa-regular fa-heart'; });
    $('dotwAdd').addEventListener('click', () => document.querySelector('[data-id="7"] .add-to-cart-btn').click());

    /* Coupon copy + confetti */
    $$('.copy').forEach((b) => b.addEventListener('click', (e) => {
      const code = b.dataset.code;
      (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject()).catch(() => {}).finally(() => toast(`Code ${code} copied!`));
      if (!window.gsap) return;
      const r = b.getBoundingClientRect();
      for (let i = 0; i < 16; i++) {
        const d = document.createElement('i'); d.className = 'dot'; d.style.background = ['#FBBF24', '#7C3AED', '#fff', '#E11D48'][i % 4];
        d.style.left = r.left + r.width / 2 + 'px'; d.style.top = r.top + r.height / 2 + 'px'; document.body.appendChild(d);
        gsap.to(d, { x: (Math.random() - .5) * 220, y: -Math.random() * 160 - 20, opacity: 0, rotation: 360, duration: 1, ease: 'power2.out', onComplete: () => d.remove() });
      }
    }));

    $('dlForm').addEventListener('submit', (e) => { e.preventDefault(); e.target.innerHTML = '<p style="font-weight:700"><i class="fa-solid fa-circle-check"></i> You are on the list!</p>'; });

    /* ---------- GSAP ---------- */
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const num = document.querySelector('.num'), o = { v: 0 };
    gsap.to(o, { v: +num.dataset.to, duration: 1.8, delay: .3, ease: 'power2.out', onUpdate: () => num.textContent = Math.round(o.v) });

    /* Scroll-scrubbed flip cards */
    $$('.dc').forEach((c) => {
      const inner = c.querySelector('.dc-in');
      if (calm) return void gsap.set(inner, { rotationY: 180 });
      gsap.to(inner, { rotationY: 180, ease: 'none', scrollTrigger: { trigger: c, start: 'top 88%', end: 'top 38%', scrub: .6 } });
    });

    /* Claimed progress bar */
    const cl = { v: 0 };
    ScrollTrigger.create({ trigger: '.claimed', start: 'top 90%', once: true, onEnter: () => {
      gsap.to('#claimBar', { width: '72%', duration: 1.6, ease: 'power2.out' });
      gsap.to(cl, { v: 72, duration: 1.6, ease: 'power2.out', onUpdate: () => $('claimNum').textContent = Math.round(cl.v) }); } });

    if (calm) return;
    const sel = '.rv, .bundle, .dl-grid .product-card';
    gsap.set(sel, { opacity: 0, y: 50 });
    ScrollTrigger.batch(sel, { start: 'top 90%', once: true,
      onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: .8, stagger: .12, ease: 'power3.out', clearProps: 'opacity,transform' }) });
  });
})();