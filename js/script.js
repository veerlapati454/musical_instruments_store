/* ===== PRELOADER ===== */
(function () {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;
  const MIN_TIME = 1500, MAX_TIME = 6000, start = Date.now();
  let done = false;
  function hidePreloader() {
    if (done) return;
    done = true;
    preloader.classList.add('hide');
    document.body.classList.remove('is-loading');
    setTimeout(() => preloader.remove(), 700);
  }
  function scheduleHide() {
    setTimeout(hidePreloader, Math.max(0, MIN_TIME - (Date.now() - start)));
  }
  if (document.readyState === 'complete') scheduleHide();
  else window.addEventListener('load', scheduleHide);
  setTimeout(hidePreloader, MAX_TIME);
})();

/* ===== LOGIN REDIRECT (works for <button> or <a>, desktop and mobile) ===== */
(function () {
  /* Pages inside /html/ use ./login.html, the home page uses ./html/login.html */
  const inHtmlFolder = /\/html\/[^\/]*$/.test(location.pathname);
  const LOGIN_URL = inHtmlFolder ? './login.html' : './html/login.html';

  function goLogin(e) {
    const target = e.target.closest && e.target.closest('#loginBtn, #mobileLoginBtn');
    if (!target) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation(); // blocks the old popup handlers below
    window.location.href = LOGIN_URL;
  }
  /* capture phase = runs before any other click handler */
  document.addEventListener('click', goLogin, true);
})();

/* Always open at the very top */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

document.addEventListener('DOMContentLoaded', () => {

  /* 0. PAGE START & LOGO -> TOP */
  function clearHash() {
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  }
  const navEntry = performance.getEntriesByType('navigation')[0];
  if (navEntry && navEntry.type === 'reload') clearHash();
  function goTop() { if (!location.hash) window.scrollTo(0, 0); }
  goTop();
  window.addEventListener('load', goTop);

  /* 1. MOBILE DRAWER */
  const hamburger = document.getElementById('hamburger');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const closeDrawer = document.getElementById('closeDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function openMobileMenu() {
    mobileDrawer.classList.add('active');
    drawerOverlay.classList.add('active');
  }
  function closeMobileMenu() {
    mobileDrawer.classList.remove('active');
    drawerOverlay.classList.remove('active');
  }
  if (hamburger) hamburger.addEventListener('click', openMobileMenu);
  if (closeDrawer) closeDrawer.addEventListener('click', closeMobileMenu);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeMobileMenu);
  mobileNavLinks.forEach(l => l.addEventListener('click', closeMobileMenu));

  document.querySelectorAll('.logo').forEach(logo => {
    logo.addEventListener('click', (e) => {
      e.preventDefault();
      closeMobileMenu();
      clearHash();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  /* 2. LOGIN / REGISTER MODAL */
  const loginBtn = document.getElementById('loginBtn');
  const mobileLoginBtn = document.getElementById('mobileLoginBtn');
  const loginModal = document.getElementById('loginModal');
  const closeLoginModal = document.getElementById('closeLoginModal');
  const authForm = document.getElementById('authForm');
  const toggleAuthMode = document.getElementById('toggleAuthMode');
  const modalTitle = document.getElementById('modalTitle');
  const modalSubtitle = document.getElementById('modalSubtitle');
  const nameGroup = document.getElementById('nameGroup');
  const authSubmitBtn = document.getElementById('authSubmitBtn');
  const toggleAuthText = document.getElementById('toggleAuthText');
  let isRegisterMode = false;

  function openModal() {
    loginModal.classList.add('active');
    document.body.classList.add('modal-open');
  }
  function closeModal() {
    loginModal.classList.remove('active');
    document.body.classList.remove('modal-open');
  }

  if (loginBtn) loginBtn.addEventListener('click', openModal);
  if (mobileLoginBtn) {
    mobileLoginBtn.addEventListener('click', () => {
      closeMobileMenu();
      setTimeout(openModal, 150);
    });
  }
  if (closeLoginModal) closeLoginModal.addEventListener('click', closeModal);
  if (loginModal) loginModal.addEventListener('click', (e) => { if (e.target === loginModal) closeModal(); });

  if (toggleAuthMode) {
    toggleAuthMode.addEventListener('click', () => {
      isRegisterMode = !isRegisterMode;
      if (isRegisterMode) {
        modalTitle.textContent = 'Create an Account';
        modalSubtitle.textContent = 'Join Stackly for exclusive gear discounts';
        nameGroup.style.display = 'block';
        authSubmitBtn.textContent = 'Register';
        toggleAuthText.textContent = 'Already have an account?';
        toggleAuthMode.textContent = 'Log In';
      } else {
        modalTitle.textContent = 'Welcome Back';
        modalSubtitle.textContent = 'Please log in to your Stackly account';
        nameGroup.style.display = 'none';
        authSubmitBtn.textContent = 'Log In';
        toggleAuthText.textContent = "Don't have an account?";
        toggleAuthMode.textContent = 'Register Now';
      }
    });
  }
  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast(isRegisterMode ? 'Account registered successfully!' : 'Logged in successfully!');
      closeModal();
    });
  }

  /* 3. SHOPPING CART */
  let cart = [];
  const cartBtn = document.getElementById('cartBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const closeCart = document.getElementById('closeCart');
  const cartBadge = document.getElementById('cartBadge');
  const cartCount = document.getElementById('cartCount');
  const cartItemsContainer = document.getElementById('cartItemsContainer');
  const cartTotalPrice = document.getElementById('cartTotalPrice');

  function toggleCart() { cartDrawer.classList.toggle('active'); }
  if (cartBtn) cartBtn.addEventListener('click', toggleCart);
  if (closeCart) closeCart.addEventListener('click', toggleCart);

  document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const card = e.target.closest('.product-card');
      addToCart(
        card.getAttribute('data-id'),
        card.getAttribute('data-title'),
        parseFloat(card.getAttribute('data-price')),
        card.getAttribute('data-image')
      );
    });
  });

  function addToCart(id, title, price, image) {
    const existing = cart.find(item => item.id === id);
    if (existing) existing.qty += 1;
    else cart.push({ id, title, price, image, qty: 1 });
    updateCartUI();
    showToast(`${title} added to cart!`);
  }

  function updateCartUI() {
    const totalItems = cart.reduce((a, i) => a + i.qty, 0);
    const totalPrice = cart.reduce((a, i) => a + i.price * i.qty, 0);
    cartBadge.textContent = totalItems;
    cartCount.textContent = totalItems;
    cartTotalPrice.textContent = `$${totalPrice.toFixed(2)}`;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Your shopping cart is currently empty.</div>';
    } else {
      cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.title}">
          <div class="cart-item-details">
            <h4>${item.title}</h4>
            <p>$${item.price.toFixed(2)} x ${item.qty}</p>
          </div>
        </div>
      `).join('');
    }
    if (window.gsap) {
      gsap.fromTo(cartBadge, { scale: 1.8 }, { scale: 1, duration: .5, ease: 'back.out(3)' });
    }
  }

  /* 4. QUICK VIEW */
  const quickViewModal = document.getElementById('quickViewModal');
  const closeQuickView = document.getElementById('closeQuickView');
  const qvImage = document.getElementById('qvImage');
  const qvTitle = document.getElementById('qvTitle');
  const qvPrice = document.getElementById('qvPrice');
  const qvCategory = document.getElementById('qvCategory');
  const qvAddToCartBtn = document.getElementById('qvAddToCartBtn');
  let currentQVProduct = null;

  function openQuickView() {
    quickViewModal.classList.add('active');
    document.body.classList.add('modal-open');
  }
  function closeQuickViewModal() {
    quickViewModal.classList.remove('active');
    document.body.classList.remove('modal-open');
  }

  document.querySelectorAll('.quick-view').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.product-card');
      currentQVProduct = {
        id: card.getAttribute('data-id'),
        title: card.getAttribute('data-title'),
        price: parseFloat(card.getAttribute('data-price')),
        category: card.getAttribute('data-category'),
        image: card.getAttribute('data-image')
      };
      qvImage.src = currentQVProduct.image;
      qvTitle.textContent = currentQVProduct.title;
      qvPrice.textContent = `$${currentQVProduct.price.toFixed(2)}`;
      qvCategory.textContent = currentQVProduct.category;
      openQuickView();
      if (window.gsap) gsap.fromTo('.quickview-card', { scale: .9, y: 30 }, { scale: 1, y: 0, duration: .5, ease: 'back.out(1.5)' });
    });
  });

  if (closeQuickView) closeQuickView.addEventListener('click', closeQuickViewModal);
  if (quickViewModal) quickViewModal.addEventListener('click', (e) => { if (e.target === quickViewModal) closeQuickViewModal(); });
  if (qvAddToCartBtn) {
    qvAddToCartBtn.addEventListener('click', () => {
      if (currentQVProduct) {
        addToCart(currentQVProduct.id, currentQVProduct.title, currentQVProduct.price, currentQVProduct.image);
        closeQuickViewModal();
      }
    });
  }

  /* Escape key closes any open modal */
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeModal();
    closeQuickViewModal();
  });

  /* 5. WEB AUDIO SOUND STUDIO */
  let audioCtx = null;
  function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }

  document.querySelectorAll('.sound-pad').forEach(pad => {
    pad.addEventListener('click', () => {
      initAudio();
      const freq = pad.getAttribute('data-note');
      const soundType = pad.getAttribute('data-sound');
      if (freq) playTone(parseFloat(freq));
      else if (soundType === 'kick') playKick();
      else if (soundType === 'snare') playSnare();
    });
  });

  function playTone(freq) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 1);
  }

  function playKick() {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.setValueAtTime(120, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.8, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  }

  function playSnare() {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(250, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  }

  /* 6. COUNTDOWN */
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minsEl = document.getElementById('minutes');
  const secsEl = document.getElementById('seconds');
  const targetTime = Date.now() + 2 * 24 * 60 * 60 * 1000;

  function updateCountdown() {
    const diff = targetTime - Date.now();
    if (diff <= 0) return;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minsEl) minsEl.textContent = String(mins).padStart(2, '0');
    if (secsEl) secsEl.textContent = String(secs).padStart(2, '0');
  }
  setInterval(updateCountdown, 1000);

  /* 7. TOAST */
  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

});

/* ==========================================================================
   ANIMATIONS (GSAP) — reveals use IntersectionObserver so content can never
   get stuck hidden; ScrollTrigger is only used for parallax.
   ========================================================================== */
(function () {
  if (typeof gsap === 'undefined') return;
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const q = (s, c = document) => Array.from(c.querySelectorAll(s));
  const hoverCapable = window.matchMedia('(hover: hover)').matches;

  /* Scroll progress bar + header state */
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);
  const header = document.getElementById('header');
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    gsap.set(bar, { scaleX: max > 0 ? scrollY / max : 0 });
    if (header) header.classList.toggle('scrolled', scrollY > 60);
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Reveal helper: hide now, animate in when the trigger enters the viewport */
  function reveal(targets, from, trigger, opts) {
    opts = opts || {};
    const els = typeof targets === 'string' ? q(targets) : targets;
    const trg = typeof trigger === 'string' ? document.querySelector(trigger) : trigger;
    if (!els.length || !trg) return;
    els.forEach(e => e.classList.add('gsap-pending'));
    gsap.set(els, Object.assign({ opacity: 0 }, from));
    let played = false;
    function play() {
      if (played) return; played = true;
      gsap.to(els, { x: 0, y: 0, scale: 1, rotateX: 0, opacity: 1,
        duration: opts.duration || .9, stagger: opts.stagger || 0, ease: opts.ease || 'power3.out',
        delay: opts.delay || 0,
        onComplete: () => els.forEach(e => { e.classList.remove('gsap-pending'); gsap.set(e, { clearProps: 'opacity,transform' }); }) });
    }
    const io = new IntersectionObserver(en => {
      if (en.some(e => e.isIntersecting)) { io.disconnect(); play(); }
    }, { threshold: 0.12 });
    io.observe(trg);
    setTimeout(() => { if (!played && trg.getBoundingClientRect().top < innerHeight) { io.disconnect(); play(); } }, 2500);
  }

  /* 1. HERO — one orchestrated entrance after the preloader */
  function heroIntro() {
    q('.hero [data-reveal]').forEach(e => e.removeAttribute('data-reveal'));
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.hero .badge', { y: 20, opacity: 0, duration: .6 })
      .from('.hero-title', { y: 50, opacity: 0, duration: .9 }, '-=.3')
      .from('.hero-subtitle', { y: 30, opacity: 0, duration: .7 }, '-=.5')
      .from('.hero-buttons .btn', { y: 20, opacity: 0, stagger: .12, duration: .6, clearProps: 'all' }, '-=.4')
      .from('.hero-stats .stat-item', { y: 20, opacity: 0, stagger: .1, duration: .6 }, '-=.3')
      .from('.hero-img', { clipPath: 'inset(0 100% 0 0 round 20px)', scale: 1.12, duration: 1.2, ease: 'power4.inOut', clearProps: 'clipPath' }, 0.1)
      .from('.hero-floating-card', { x: -40, opacity: 0, duration: .8, ease: 'back.out(1.6)' }, '-=.4');
    q('.stat-num').forEach(el => {
      const m = el.textContent.match(/(\d+)(.*)/); if (!m) return;
      const o = { v: 0 };
      gsap.to(o, { v: +m[1], duration: 1.8, delay: .8, ease: 'power2.out', onUpdate: () => el.textContent = Math.round(o.v) + m[2] });
    });
    gsap.to('.hero-floating-card', { y: -8, duration: 2.2, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1.6 });
  }
  if (document.body.classList.contains('is-loading')) {
    const mo = new MutationObserver(() => {
      if (!document.body.classList.contains('is-loading')) { mo.disconnect(); heroIntro(); }
    });
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  } else heroIntro();

  if (window.ScrollTrigger) {
    gsap.to('.hero .image-wrapper', { yPercent: -6, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* 2. Section headers */
  q('.section-header').forEach(h => reveal(Array.from(h.children), { y: 30 }, h, { stagger: .12, duration: .8 }));

  /* 3. Flip cards */
  reveal('.flip-card', { y: 60 }, '.categories-grid', { stagger: .15 });
  q('.flip-card').forEach(card => card.addEventListener('click', e => {
    if (!hoverCapable && !e.target.closest('a')) card.classList.toggle('is-flipped');
  }));

  /* 4. Products + 3D tilt */
  reveal('.product-card', { y: 70 }, '.products-grid', { stagger: .12 });
  if (hoverCapable) {
    q('.product-card').forEach(card => {
      gsap.set(card, { transformPerspective: 900 });
      const rx = gsap.quickTo(card, 'rotationX', { duration: .4 });
      const ry = gsap.quickTo(card, 'rotationY', { duration: .4 });
      card.addEventListener('mousemove', e => {
        if (card.classList.contains('gsap-pending')) return;
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        ry((x - .5) * 10); rx((.5 - y) * 10);
        card.style.setProperty('--mx', x * 100 + '%'); card.style.setProperty('--my', y * 100 + '%');
      });
      card.addEventListener('mouseleave', () => { rx(0); ry(0); });
    });
  }

  /* 5. Sound studio */
  reveal('.studio-card', { scale: .95 }, '.studio-card', { duration: 1 });
  reveal('.sound-pad', { y: 40 }, '.studio-pads', { stagger: .1, duration: .7, ease: 'back.out(1.7)' });
  q('.sound-pad').forEach(pad => pad.addEventListener('click', e => {
    const r = pad.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2;
    const rp = document.createElement('span');
    rp.className = 'ripple';
    Object.assign(rp.style, { width: s + 'px', height: s + 'px', left: e.clientX - r.left - s / 2 + 'px', top: e.clientY - r.top - s / 2 + 'px' });
    pad.appendChild(rp);
    gsap.to(rp, { scale: 1, opacity: 0, duration: .8, ease: 'power2.out', onComplete: () => rp.remove() });
    gsap.fromTo(pad.querySelector('i'), { scale: 1 }, { scale: 1.5, yoyo: true, repeat: 1, duration: .15 });
  }));

  /* 6. Deals — slide in sideways on desktop, from below on mobile
        (horizontal offsets are what cause sideways scrolling on phones) */
  const isMobile = window.matchMedia('(max-width: 992px)').matches;
  reveal('.deals-content', isMobile ? { y: 40 } : { x: -60 }, '.deals-wrapper', { duration: 1 });
  reveal('.deals-img-box', isMobile ? { y: 40 } : { x: 60 }, '.deals-wrapper', { duration: 1 });

  /* 7. Reviews */
  reveal('.reviews-grid > *', { y: 60 }, '.reviews-grid', { stagger: .15 });
  const score = document.querySelector('.rating-score');
  if (score) {
    const o = { v: 0 };
    new IntersectionObserver((en, io) => { if (en[0].isIntersecting) { io.disconnect();
      gsap.to(o, { v: 4.9, duration: 1.6, ease: 'power2.out', onUpdate: () => score.firstChild.nodeValue = o.v.toFixed(1) }); } }, { threshold: .3 }).observe(score);
  }

  /* 8. Features, CTA, footer */
  reveal('.feature-box', { y: 30 }, '.features-bar', { stagger: .1, duration: .7 });
  reveal('.cta-inner > *', { y: 40 }, '.cta', { stagger: .2 });
  reveal('.footer-top > *', { y: 30 }, '.footer', { stagger: .12, duration: .8 });

  /* Springy login modal */
  const loginTrigger = document.getElementById('loginBtn');
  if (loginTrigger) loginTrigger.addEventListener('click', () => {
    gsap.fromTo('#loginModal .modal-card', { scale: .9, y: 30 }, { scale: 1, y: 0, duration: .5, ease: 'back.out(1.5)' });
  });
  const mobileLoginTrigger = document.getElementById('mobileLoginBtn');
  if (mobileLoginTrigger) mobileLoginTrigger.addEventListener('click', () => {
    setTimeout(() => gsap.fromTo('#loginModal .modal-card', { scale: .9, y: 30 }, { scale: 1, y: 0, duration: .5, ease: 'back.out(1.5)' }), 150);
  });
})();