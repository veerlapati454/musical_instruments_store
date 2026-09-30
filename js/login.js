// STACKLY MUSIC — login.js
// Gmail-only email, min-length password, show/hide toggle, caps-lock warning,
// loading + success state, role-based redirect, and GSAP animations.
(function () {
  'use strict';
  var form = document.getElementById('loginForm');
  if (!form) return;

  /* ---- Config: change these to your real pages ---- */
  var USER_PAGE = './user-dashboard.html';
  var ADMIN_PAGE = './admin-dashboard.html';
  var GMAIL = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;

  var emailInput = document.getElementById('email');
  var passwordInput = document.getElementById('password');
  var btn = document.getElementById('loginBtn');
  var caps = document.getElementById('capsWarn');
  var hasGsap = typeof window.gsap !== 'undefined';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var animate = hasGsap && !reduce;

  /* Prefill remembered email */
  try {
    var saved = localStorage.getItem('rememberedEmail');
    if (saved) { emailInput.value = saved; document.getElementById('rememberMe').checked = true; }
  } catch (e) {}

  /* Password show / hide */
  var eye = form.querySelector('.eye');
  eye.addEventListener('click', function () {
    var show = passwordInput.type === 'password';
    passwordInput.type = show ? 'text' : 'password';
    eye.innerHTML = '<i class="fa-solid ' + (show ? 'fa-eye-slash' : 'fa-eye') + '"></i>';
    eye.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    passwordInput.focus();
  });

  /* Caps Lock warning */
  function checkCaps(e) { if (e.getModifierState) caps.hidden = !e.getModifierState('CapsLock'); }
  passwordInput.addEventListener('keyup', checkCaps);
  passwordInput.addEventListener('keydown', checkCaps);
  passwordInput.addEventListener('blur', function () { caps.hidden = true; });

  /* Validation with inline hints */
  var hints = {};
  [].forEach.call(form.querySelectorAll('.hint'), function (h) { hints[h.getAttribute('data-for')] = { el: h, text: h.textContent }; });

  function setState(input, message) {
    var wrap = input.closest('.field'), h = hints[input.id], ok = !message;
    wrap.classList.toggle('invalid', !ok);
    wrap.classList.toggle('valid', ok && input.value !== '');
    input.setAttribute('aria-invalid', ok ? 'false' : 'true');
    h.el.textContent = ok ? h.text : message;
    return ok;
  }
  function checkEmail() {
    var v = emailInput.value.trim();
    if (!v) return setState(emailInput, 'Please enter your email address.');
    if (!GMAIL.test(v)) return setState(emailInput, 'Please enter a valid @gmail.com address.');
    return setState(emailInput, '');
  }
  function checkPassword() {
    var v = passwordInput.value;
    if (!v) return setState(passwordInput, 'Please enter your password.');
    if (v.length < 6) return setState(passwordInput, 'Password must be at least 6 characters.');
    return setState(passwordInput, '');
  }
  emailInput.addEventListener('blur', checkEmail);
  passwordInput.addEventListener('blur', checkPassword);
  emailInput.addEventListener('input', function () { if (emailInput.closest('.field').classList.contains('invalid')) checkEmail(); });
  passwordInput.addEventListener('input', function () { if (passwordInput.closest('.field').classList.contains('invalid')) checkPassword(); });

  function shake(input) {
    var w = input.closest('.field');
    if (animate) { gsap.fromTo(w, { x: -10 }, { x: 0, duration: .7, ease: 'elastic.out(1,.25)', clearProps: 'transform' }); }
    else { w.classList.remove('shake'); void w.offsetWidth; w.classList.add('shake'); }
  }

  /* Role switch: update heading label */
  var eyebrow = document.getElementById('eyebrow');
  [].forEach.call(form.querySelectorAll('input[name="role"]'), function (r) {
    r.addEventListener('change', function () {
      eyebrow.textContent = r.value === 'admin' ? 'Admin access' : 'Secure sign in';
      if (animate) gsap.fromTo(eyebrow, { y: -8, opacity: 0 }, { y: 0, opacity: 1, duration: .35 });
    });
  });

  /* Music-note burst from the button on success */
  function burst() {
    var r = btn.getBoundingClientRect(), icons = ['fa-music', 'fa-guitar', 'fa-drum', 'fa-headphones'];
    for (var i = 0; i < 12; i++) {
      var n = document.createElement('i');
      n.className = 'burst fa-solid ' + icons[i % icons.length];
      n.style.left = r.left + r.width / 2 + 'px'; n.style.top = r.top + r.height / 2 + 'px';
      document.body.appendChild(n);
      gsap.to(n, { x: (Math.random() - .5) * 320, y: -60 - Math.random() * 180, rotation: (Math.random() - .5) * 120, opacity: 0, scale: .6 + Math.random(),
        duration: 1.1, ease: 'power2.out', onComplete: (function (el) { return function () { el.remove(); }; })(n) });
    }
  }

  /* Submit */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var okE = checkEmail(), okP = checkPassword();
    if (!okE || !okP) { var first = !okE ? emailInput : passwordInput; shake(first); first.focus(); return; }

    var role = form.querySelector('input[name="role"]:checked').value, email = emailInput.value.trim();
    btn.classList.add('loading'); btn.disabled = true;

    try {
      localStorage.setItem('user', JSON.stringify({ email: email, role: role }));
      localStorage.setItem('isAuthenticated', 'true');
      if (document.getElementById('rememberMe').checked) localStorage.setItem('rememberedEmail', email);
      else localStorage.removeItem('rememberedEmail');
    } catch (err) {}

    setTimeout(function () {
      btn.classList.remove('loading'); btn.classList.add('ok');
      if (animate) { burst(); gsap.fromTo(btn, { scale: .96 }, { scale: 1, duration: .5, ease: 'back.out(3)' }); }
    }, 700);
    setTimeout(function () { window.location.href = role === 'admin' ? ADMIN_PAGE : USER_PAGE; }, 1600);
  });

  /* ================= GSAP ================= */
  if (!animate) return;

  /* Entrance timeline */
  var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.lg-logo', { y: -20, opacity: 0, duration: .6 })
    .from('.tag', { y: 20, opacity: 0, duration: .5 }, '-=.3')
    .from('.ln > span', { yPercent: 110, duration: .9, stagger: .15 }, '-=.2')
    .from('.lg-brand p', { y: 20, opacity: 0, duration: .6 }, '-=.5')
    .from('.perks li', { x: -26, opacity: 0, duration: .6, stagger: .12 }, '-=.35')
    .from('.lg-stats > div', { y: 20, opacity: 0, duration: .5, stagger: .1 }, '-=.4')
    .from('.lg-card', { y: 50, opacity: 0, scale: .96, duration: .9, ease: 'power4.out', clearProps: 'transform' }, .2)
    .from('.lg-card > *', { y: 18, opacity: 0, duration: .5, stagger: .07, clearProps: 'transform' }, .5)
    .from('.note', { scale: 0, opacity: 0, duration: .7, stagger: .1, ease: 'back.out(2)' }, .4);

  /* Spinning record */
  gsap.to('.vinyl', { rotation: 360, duration: 10, repeat: -1, ease: 'none' });

  /* Floating instrument icons */
  gsap.utils.toArray('.note').forEach(function (n, i) {
    gsap.to(n, { y: 'random(-30,30)', x: 'random(-16,16)', rotation: 'random(-18,18)', duration: 'random(3,5)', repeat: -1, yoyo: true, ease: 'sine.inOut', delay: i * .3 });
  });

  /* Equalizer bars */
  var eq = document.querySelector('.eq');
  for (var i = 0; i < 40; i++) eq.appendChild(document.createElement('i'));
  gsap.utils.toArray('.eq i').forEach(function (b, k) {
    gsap.to(b, { scaleY: 'random(.15,1)', duration: 'random(.35,.9)', repeat: -1, yoyo: true, repeatRefresh: true, ease: 'sine.inOut', delay: k * .02 });
  });

  /* Mouse parallax on the brand panel (pointer devices) */
  var panel = document.getElementById('brandPanel');
  if (window.matchMedia('(hover: hover)').matches) {
    var notes = gsap.utils.toArray('.notes .note');
    panel.addEventListener('mousemove', function (e) {
      var r = panel.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      gsap.to('.vinyl', { x: x * -30, y: y * -30, duration: .8, ease: 'power2.out', overwrite: 'auto' });
      notes.forEach(function (n) { var d = +n.dataset.depth; gsap.to(n, { xPercent: x * d, yPercent: y * d, duration: .8, ease: 'power2.out', overwrite: 'auto' }); });
    });
  }
})();