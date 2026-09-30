/* Contact page. Loaded BEFORE script.js. */
(function () {
  document.documentElement.classList.add('js-on');

  /* Logo goes home (script.js would only scroll to top) */
  document.addEventListener('click', (e) => {
    if (e.target.closest('a.logo')) { e.stopPropagation(); e.preventDefault(); location.href = '../index.html'; }
  }, true);

  document.addEventListener('DOMContentLoaded', () => {
    const $ = (id) => document.getElementById(id), $$ = (s) => Array.from(document.querySelectorAll(s));
    const toast = (msg) => { const t = $('toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2800); };

    /* Equalizer bars in the hero */
    const eq = $('eq');
    for (let i = 0; i < 28; i++) {
      const b = document.createElement('i');
      b.style.animationDuration = (0.5 + Math.random() * 0.9).toFixed(2) + 's';
      b.style.animationDelay = (-Math.random()).toFixed(2) + 's';
      eq.appendChild(b);
    }

    /* Scroll reveal (staggered by sibling index) */
    const io = new IntersectionObserver((en) => en.forEach((x) => {
      if (!x.isIntersecting) return;
      const el = x.target;
      el.style.transitionDelay = Math.min(Array.from(el.parentElement.children).indexOf(el), 4) * 90 + 'ms';
      el.classList.add('in'); io.unobserve(el);
    }), { threshold: .12 });
    $$('.rv').forEach((el) => io.observe(el));

    /* Open now / closed badge (store time, India) */
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const day = now.getDay(), hr = now.getHours() + now.getMinutes() / 60;
    const open = day !== 0 && hr >= 8 && hr < 18;
    const pill = $('openNow');
    pill.textContent = open ? 'Open now' : 'Closed now';
    pill.classList.add(open ? 'on' : 'off');

    /* Contact form */
    const form = $('ctForm'), count = $('count'), msg = $('message');
    const rules = {
      name: (v) => (v.trim().length >= 2 && /^\p{L}+(?:\s+\p{L}+)*$/u.test(v.trim())) || 'Name must be at least 2 letters and contain only alphabets.',
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Please enter a valid email address.',
      phone: (v) => /^\+?[0-9\s-]{7,15}$/.test(v.trim()) || 'Please enter a valid phone number.',
      subject: (v) => !!v || 'Please choose a topic.',
      message: (v) => v.trim().length >= 10 || 'Message must be at least 10 characters.',
      consent: (v, el) => el.checked || 'Please tick this box to continue.'
    };
    const touched = {};
    function check(name) {
      const el = form.elements[name], wrap = form.querySelector(`[data-field="${name}"]`);
      const res = rules[name](el.value, el), ok = res === true;
      wrap.classList.toggle('err', !ok);
      wrap.querySelector('.err-msg').textContent = ok ? '' : res;
      return ok;
    }

    /* Name: strip digits and symbols as the user types (letters and spaces only) */
    form.elements['name'].addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^\p{L}\s]/gu, '');
    });

    Object.keys(rules).forEach((n) => {
      const el = form.elements[n];
      el.addEventListener('blur', () => { touched[n] = true; check(n); });
      el.addEventListener(el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input', () => { if (touched[n]) check(n); });
    });
    msg.addEventListener('input', () => { count.textContent = msg.value.length + ' / 500'; });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let firstBad = null;
      Object.keys(rules).forEach((n) => { touched[n] = true; if (!check(n) && !firstBad) firstBad = form.elements[n]; });
      if (firstBad) { firstBad.focus(); toast('Please fix the highlighted fields.'); return; }

      const btn = $('ctSubmit'); btn.classList.add('busy'); btn.querySelector('span').textContent = 'Sending...';
      /* Valid form -> redirect to 404 page (no success message) */
      setTimeout(() => { location.href = './404.html'; }, 900);
    });
    $('ctAgain').addEventListener('click', () => {
      form.reset(); count.textContent = '0 / 500';
      $$('#ctForm .field').forEach((f) => { f.classList.remove('err'); f.querySelector('.err-msg').textContent = ''; });
      Object.keys(touched).forEach((k) => delete touched[k]);
      $('ctOk').hidden = true; form.hidden = false;
    });

    /* Newsletter: valid email -> straight to 404, invalid -> error message */
    const ctNews = $('ctNews');
    ctNews.setAttribute('novalidate', '');            // hide the browser's own popup

    document.addEventListener('submit', (e) => {
      if (e.target !== ctNews) return;
      e.preventDefault();
      e.stopImmediatePropagation();                   // blocks any other submit handler

      const input = ctNews.querySelector('input[type="email"]');
      let err = ctNews.querySelector('.news-err');
      if (!err) {
        err = document.createElement('p');
        err.className = 'news-err';
        err.setAttribute('aria-live', 'polite');
        ctNews.appendChild(err);
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim())) {
        err.textContent = 'Not a valid email address.';
        input.classList.add('invalid');
        input.focus();
        return;
      }
      location.href = './404.html';                   // valid -> redirect, no message
    }, true);                                         // capture phase = runs first

    ctNews.addEventListener('input', () => {          // clear the error while typing
      const err = ctNews.querySelector('.news-err');
      if (err) err.textContent = '';
      ctNews.querySelector('input').classList.remove('invalid');
    });
  });
})();