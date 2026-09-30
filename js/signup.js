// STACKLY MUSIC — signup.js
(function () {
  'use strict';
  var form = document.getElementById('signupForm');
  if (!form) return;

  var LOGIN_PAGE = './login.html';
  var GMAIL = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
  var $ = function (id) { return document.getElementById(id); };
  var els = { username: $('username'), fullName: $('fullName'), email: $('email'),
              password: $('password'), confirmPassword: $('confirmPassword'), agreeTerms: $('agreeTerms') };
  var btn = $('signupBtn'), meter = $('meter'), meterText = $('meterText');
  var hasGsap = typeof window.gsap !== 'undefined';
  var animate = hasGsap && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* hints */
  var hints = {};
  [].forEach.call(form.querySelectorAll('.hint'), function (h) { hints[h.getAttribute('data-for')] = { el: h, text: h.textContent }; });
  function wrapOf(el) { return el.closest('.field') || el.closest('.terms-wrap'); }
  function setState(el, msg) {
    var w = wrapOf(el), h = hints[el.id], ok = !msg;
    w.classList.toggle('invalid', !ok);
    w.classList.toggle('valid', ok && el.type !== 'checkbox' && el.value !== '');
    el.setAttribute('aria-invalid', ok ? 'false' : 'true');
    h.el.textContent = ok ? h.text : msg;
    return ok;
  }

  /* rules */
  var rules = {
    username: function () {
      var v = els.username.value.trim();
      if (!v) return 'Please choose a username.';
      return /^[A-Za-z]{2,24}$/.test(v) ? '' : 'Username must be 2\u201324 letters, no numbers or spaces.';
    },
    fullName: function () {
      var v = els.fullName.value.trim();
      if (!v) return 'Please enter your full name.';
      return (/^[A-Za-z]+( [A-Za-z]+)*$/.test(v) && v.replace(/ /g, '').length >= 2) ? '' : 'Use letters only (at least 2).';
    },
    email: function () {
      var v = els.email.value.trim();
      if (!v) return 'Please enter your email address.';
      return GMAIL.test(v) ? '' : 'Please enter a valid @gmail.com address.';
    },
    password: function () {
      if (!els.password.value) return 'Please create a password.';
      return els.password.value.length >= 6 ? '' : 'Password must be at least 6 characters.';
    },
    confirmPassword: function () {
      if (!els.confirmPassword.value) return 'Please re-enter your password.';
      return els.confirmPassword.value === els.password.value ? '' : 'Passwords do not match.';
    },
    agreeTerms: function () { return els.agreeTerms.checked ? '' : 'You must accept the Terms and Conditions to sign up.'; }
  };
  function check(name) { return setState(els[name], rules[name]()); }

  Object.keys(els).forEach(function (name) {
    var el = els[name];
    el.addEventListener('blur', function () { check(name); });
    el.addEventListener(el.type === 'checkbox' ? 'change' : 'input', function () {
      if (wrapOf(el).classList.contains('invalid')) check(name);
      if (name === 'password' && els.confirmPassword.value) check('confirmPassword');
    });
  });

  /* live filtering: letters only */
  function restrict(el, re, tidy) {
    el.addEventListener('input', function () {
      var clean = el.value.replace(re, '');
      if (tidy) clean = tidy(clean);
      if (clean !== el.value) el.value = clean;
    });
  }
  restrict(els.username, /[^A-Za-z]/g);
  restrict(els.fullName, /[^A-Za-z ]/g, function (s) { return s.replace(/^ +/, '').replace(/ {2,}/g, ' '); });
  els.fullName.addEventListener('blur', function () {
    els.fullName.value = els.fullName.value.trim().toLowerCase().replace(/\b[a-z]/g, function (c) { return c.toUpperCase(); });
    check('fullName');
  });
  els.email.addEventListener('input', function () { els.email.value = els.email.value.replace(/\s/g, ''); });

  /* show / hide password */
  [].forEach.call(form.querySelectorAll('.eye'), function (eye) {
    eye.addEventListener('click', function () {
      var input = $(eye.getAttribute('data-target')), show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      eye.innerHTML = '<i class="fa-solid ' + (show ? 'fa-eye-slash' : 'fa-eye') + '"></i>';
      eye.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      input.focus();
    });
  });

  /* strength meter */
  var labels = ['', 'Weak', 'Fair', 'Good', 'Strong'], colors = ['', '#e5484d', '#b9770e', '#4a9d55', '#2fae66'];
  function score(p) {
    var s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
    if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) s++;
    return Math.max(1, s);
  }
  els.password.addEventListener('input', function () {
    var s = els.password.value ? score(els.password.value) : 0;
    meter.setAttribute('data-s', s);
    meterText.textContent = labels[s];
    meterText.style.color = colors[s];
  });

  /* music-note burst on success */
  function burst() {
    var r = btn.getBoundingClientRect(), icons = ['fa-music', 'fa-guitar', 'fa-drum', 'fa-headphones'];
    for (var i = 0; i < 12; i++) {
      var n = document.createElement('i');
      n.className = 'burst fa-solid ' + icons[i % icons.length];
      n.style.left = r.left + r.width / 2 + 'px'; n.style.top = r.top + r.height / 2 + 'px';
      document.body.appendChild(n);
      gsap.to(n, { x: (Math.random() - .5) * 320, y: -60 - Math.random() * 180, rotation: (Math.random() - .5) * 120, opacity: 0,
        scale: .6 + Math.random(), duration: 1.1, ease: 'power2.out', onComplete: (function (el) { return function () { el.remove(); }; })(n) });
    }
  }

  /* submit */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var firstBad = null;
    Object.keys(els).forEach(function (name) { if (!check(name) && !firstBad) firstBad = els[name]; });
    if (firstBad) {
      var w = wrapOf(firstBad);
      if (animate) gsap.fromTo(w, { x: -10 }, { x: 0, duration: .7, ease: 'elastic.out(1,.25)', clearProps: 'transform' });
      else { w.classList.remove('shake'); void w.offsetWidth; w.classList.add('shake'); }
      firstBad.focus();
      return;
    }
    btn.disabled = true; btn.classList.add('loading');
    try {
      localStorage.setItem('registeredUser', JSON.stringify({
        username: els.username.value.trim(), fullName: els.fullName.value.trim(), email: els.email.value.trim() }));
    } catch (err) {}
    setTimeout(function () {
      btn.classList.remove('loading'); btn.classList.add('ok');
      if (animate) burst();
      setTimeout(function () { window.location.href = LOGIN_PAGE; }, 1100);
    }, 800);
  });

  /* ---------- GSAP: same music effects as the login page ---------- */
  if (!animate) return;
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

  gsap.to('.vinyl', { rotation: 360, duration: 10, repeat: -1, ease: 'none' });
  gsap.utils.toArray('.note').forEach(function (n, i) {
    gsap.to(n, { y: 'random(-30,30)', x: 'random(-16,16)', rotation: 'random(-18,18)', duration: 'random(3,5)', repeat: -1, yoyo: true, ease: 'sine.inOut', delay: i * .3 });
  });
  var eq = document.querySelector('.eq');
  for (var i = 0; i < 40; i++) eq.appendChild(document.createElement('i'));
  gsap.utils.toArray('.eq i').forEach(function (b, k) {
    gsap.to(b, { scaleY: 'random(.15,1)', duration: 'random(.35,.9)', repeat: -1, yoyo: true, repeatRefresh: true, ease: 'sine.inOut', delay: k * .02 });
  });
})();