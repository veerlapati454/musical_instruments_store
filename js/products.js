/* Products page. Loaded BEFORE script.js so the cards exist when script.js binds cart / quick view. */
(function () {
  /* Local image path (ends with .webp/.jpg/...) is used as-is; otherwise treated as an Unsplash ID */
  const U = (id) => /\.(jpe?g|png|webp|gif|svg)$/i.test(id)
    ? id
    : `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;
  const P = [
    [1, 'Aura Deluxe Acoustic Guitar', 799, 899, 'Guitars', '../assets/m11.webp', 5, 48, 'Best Seller'],
    [2, 'Pro 88-Key Stage Keyboard', 1249, 0, 'Keyboards', '../assets/m12.webp', 4.5, 32, 'Hot'],
    [3, 'Master Custom Drum Kit', 1599, 0, 'Drums', '../assets/m13.webp', 5, 19, ''],
    [4, 'Vintage Electric Sunburst Guitar', 949, 1099, 'Guitars', '../assets/m14.webp', 5, 64, 'Sale'],
    [5, 'Studio Condenser Mic', 299, 0, 'Studio', '../assets/m15.webp', 4.5, 53, ''],
    [6, 'Classic Violin Master Series', 680, 0, 'Orchestral', '../assets/m23.webp', 5, 27, ''],
    [7, 'Aura Studio Wireless Headphones', 199, 299, 'Studio', '../assets/m24.webp', 4.5, 88, 'Sale'],
    [8, 'Stage Pro Electric Guitar', 1149, 0, 'Guitars', '../assets/m22.webp', 4.5, 21, 'New']
  ];
  const fmt = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2 });
  const stars = (r) => '<i class="fa-solid fa-star"></i>'.repeat(Math.floor(r)) + (r % 1 ? '<i class="fa-solid fa-star-half-stroke"></i>' : '');
  const grid = document.getElementById('prGrid');

  grid.innerHTML = P.map(([id, t, pr, old, cat, img, r, n, tag], i) => `
    <div class="product-card" data-id="${id}" data-title="${t}" data-price="${pr}" data-category="${cat}" data-image="${U(img)}" data-rate="${r}" data-idx="${i}">
      <div class="product-img-box">${tag ? `<span class="product-tag${tag === 'Hot' ? ' hot' : ''}">${tag}</span>` : ''}
        <img src="${U(img)}" alt="${t}" loading="lazy">
        <div class="product-actions">
          <button class="action-btn quick-view" aria-label="Quick View"><i class="fa-regular fa-eye"></i></button>
          <button class="action-btn add-favorite" aria-label="Add to Wishlist"><i class="fa-regular fa-heart"></i></button>
        </div></div>
      <div class="product-content">
        <div class="product-rating">${stars(r)}<span>(${n})</span></div>
        <h3 class="product-title">${t}</h3>
        <p class="product-price">${fmt(pr)}${old ? ` <span class="old-price">${fmt(old)}</span>` : ''}</p>
        <button type="button" class="btn btn-primary btn-block add-to-cart-btn"><i class="fa-solid fa-bag-shopping"></i> Add to Cart</button>
      </div></div>`).join('');

  /* Logo goes home (script.js would only scroll to top) */
  document.addEventListener('click', (e) => {
    if (e.target.closest('a.logo')) { e.stopPropagation(); e.preventDefault(); location.href = '../index.html'; }
  }, true);

  const $ = (s) => document.getElementById(s);
  const cards = Array.from(grid.children);
  let cat = 'all', q = '';

  /* Filter + search (toggle visibility so script.js listeners stay bound) */
  function apply() {
    let shown = 0;
    cards.forEach((c) => {
      const ok = (cat === 'all' || c.dataset.category === cat) && c.dataset.title.toLowerCase().includes(q);
      c.classList.toggle('is-hidden', !ok);
      if (ok) { shown++; c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); c.style.animationDelay = shown * 50 + 'ms'; }
    });
    $('prCount').textContent = shown;
    $('prEmpty').hidden = shown > 0;
  }
  $('prChips').addEventListener('click', (e) => {
    const b = e.target.closest('.pchip'); if (!b) return;
    document.querySelectorAll('.pchip').forEach((x) => x.classList.remove('active'));
    b.classList.add('active'); cat = b.dataset.f; apply();
  });
  $('prSearch').addEventListener('input', (e) => { q = e.target.value.trim().toLowerCase(); apply(); });
  $('prSort').addEventListener('change', (e) => {
    const v = e.target.value, key = { def: (a, b) => a.dataset.idx - b.dataset.idx, lo: (a, b) => a.dataset.price - b.dataset.price,
      hi: (a, b) => b.dataset.price - a.dataset.price, rate: (a, b) => b.dataset.rate - a.dataset.rate }[v];
    cards.slice().sort(key).forEach((c) => grid.appendChild(c));
    apply();
  });

  /* Wishlist hearts */
  grid.addEventListener('click', (e) => {
    const b = e.target.closest('.add-favorite'); if (!b) return;
    const on = b.classList.toggle('on'); b.querySelector('i').className = on ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
  });

  document.addEventListener('DOMContentLoaded', () => {
    /* Sticky offset = real header height */
    const hdr = $('header'), set = () => document.documentElement.style.setProperty('--hdr', hdr.offsetHeight + 'px');
    set(); addEventListener('resize', set); addEventListener('load', set);

    /* Scroll reveal (staggered by sibling index) */
    const io = new IntersectionObserver((en) => en.forEach((x) => {
      if (!x.isIntersecting) return;
      const el = x.target; el.style.transitionDelay = Math.min(Array.from(el.parentElement.children).indexOf(el), 5) * 90 + 'ms';
      el.classList.add('in'); io.unobserve(el);
    }), { threshold: .12 });
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

    /* Editor's pick reuses the grid card's cart button */
    $('pickAdd').addEventListener('click', () => document.querySelector('[data-id="3"] .add-to-cart-btn').click());

    /* Newsletter */
    $('prNews').addEventListener('submit', (e) => { e.preventDefault(); e.target.innerHTML = '<p><i class="fa-solid fa-circle-check"></i> You are subscribed. Watch your inbox!</p>'; });
  });
})();