/* Categories page: logo link, filters, reveal, counters (cart/login/menu come from script.js) */
document.addEventListener('click', (e) => {
  if (e.target.closest('a.logo')) { e.stopPropagation(); e.preventDefault(); location.href = '../index.html'; }
}, true);

document.addEventListener('DOMContentLoaded', () => {
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  /* Keep filter bar glued right under the header at any header height */
  const hdr = document.getElementById('header');
  const setHdr = () => document.documentElement.style.setProperty('--hdr', hdr.offsetHeight + 'px');
  setHdr(); addEventListener('resize', setHdr); addEventListener('load', setHdr);

  /* Filter chips */
  const chips = $$('.chip'), cards = $$('.cx-card');
  chips.forEach(chip => chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const f = chip.dataset.filter;
    cards.forEach(card => {
      const show = f === 'all' || card.dataset.cat === f;
      card.classList.toggle('is-hidden', !show);
      if (show && window.gsap) gsap.fromTo(card, { opacity: 0, y: 30, scale: .96 }, { opacity: 1, y: 0, scale: 1, duration: .5, ease: 'power3.out', clearProps: 'all' });
    });
  }));

  /* Scroll reveal with stagger for siblings */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target, i = Array.from(el.parentElement.children).indexOf(el);
      el.style.transitionDelay = Math.min(i, 5) * 80 + 'ms';
      el.classList.add('in');
      io.unobserve(el);
    });
  }, { threshold: .12 });
  $$('.reveal').forEach(el => io.observe(el));

  /* Count-up stats */
  const cio = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target, to = +el.dataset.to, suf = el.dataset.suffix || '', t0 = performance.now();
      (function tick(now) {
        const p = Math.min((now - t0) / 1800, 1), v = Math.round(to * (1 - Math.pow(1 - p, 3)));
        el.textContent = v.toLocaleString() + suf;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
      cio.unobserve(el);
    });
  }, { threshold: .5 });
  $$('.count').forEach(el => cio.observe(el));

  /* Card image parallax follows cursor (desktop only) */
  if (window.matchMedia('(hover: hover)').matches) {
    cards.forEach(card => {
      const img = card.querySelector('img');
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        img.style.transformOrigin = `${(e.clientX - r.left) / r.width * 100}% ${(e.clientY - r.top) / r.height * 100}%`;
      });
    });
  }
});