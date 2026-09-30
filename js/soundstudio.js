/* Sound Studio page (cart / login / menu come from script.js) */
document.addEventListener('click', (e) => {
  if (e.target.closest('a.logo')) { e.stopPropagation(); e.preventDefault(); location.href = '../index.html'; }
}, true);

document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id), $$ = (s) => Array.from(document.querySelectorAll(s));

  /* ---------- AUDIO ENGINE ---------- */
  let ctx, master, analyser, noiseBuf, inst = 'piano';
  function init() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = .8;
      analyser = ctx.createAnalyser(); analyser.fftSize = 128;
      master.connect(analyser); analyser.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
  }
  function env(g, t, peak, dur) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + .01); g.gain.exponentialRampToValueAtTime(0.001, t + dur); }
  function osc(type, f, t, dur, peak, dest) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
    env(g, t, peak, dur); o.connect(g); g.connect(dest || master); o.start(t); o.stop(t + dur + .05); return o;
  }
  function noise(dur, ftype, f, peak, t) {
    const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; fl.type = ftype; fl.frequency.value = f; env(g, t, peak, dur);
    s.connect(fl); fl.connect(g); g.connect(master); s.start(t, Math.random()); s.stop(t + dur + .05);
  }
  function tone(f, kind) {
    init(); const t = ctx.currentTime;
    if (kind === 'piano') { osc('triangle', f, t, 1.5, .4); osc('sine', f * 2, t, .8, .12); }
    else if (kind === 'synth') { const l = ctx.createBiquadFilter(); l.type = 'lowpass'; l.frequency.value = 1800; l.connect(master); osc('sawtooth', f, t, .9, .25, l); osc('sawtooth', f * 1.005, t, .9, .18, l); }
    else if (kind === 'organ') { osc('square', f, t, 1, .12); osc('sine', f * 2, t, 1, .15); }
    else { const l = ctx.createBiquadFilter(); l.type = 'lowpass'; l.frequency.setValueAtTime(3500, t); l.frequency.exponentialRampToValueAtTime(300, t + .6); l.connect(master); osc('sawtooth', f, t, .8, .35, l); }
  }
  const drums = {
    kick: (t) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(40, t + .35); env(g, t, 1, .4); o.connect(g); g.connect(master); o.start(t); o.stop(t + .45); },
    snare: (t) => { noise(.2, 'bandpass', 1800, .6, t); osc('triangle', 190, t, .15, .4); },
    hat: (t) => noise(.06, 'highpass', 7000, .35, t),
    open: (t) => noise(.35, 'highpass', 6500, .3, t),
    clap: (t) => [0, .015, .03].forEach((d) => noise(.09, 'bandpass', 1300, .5, t + d)),
    tom: (t) => { const o = osc('sine', 220, t, .35, .8); o.frequency.exponentialRampToValueAtTime(90, t + .3); },
    crash: (t) => noise(1.3, 'highpass', 4500, .35, t),
    bell: (t) => { osc('square', 560, t, .35, .18); osc('square', 845, t, .35, .18); }
  };
  const hit = (n) => { init(); drums[n](ctx.currentTime); };

  /* ---------- PIANO ---------- */
  const W = [['C', 261.63], ['D', 293.66], ['E', 329.63], ['F', 349.23], ['G', 392], ['A', 440], ['B', 493.88], ['C', 523.25]];
  const B = [[0, 277.18, 'W'], [1, 311.13, 'E'], [3, 369.99, 'T'], [4, 415.3, 'Y'], [5, 466.16, 'U']];
  const wkeys = 'ASDFGHJK'.split(''), keyEls = {};
  const kw = document.createElement('div'); kw.className = 'kw'; $('piano-keys').appendChild(kw);
  W.forEach(([n, f], i) => { const b = document.createElement('button'); b.className = 'wk'; b.textContent = wkeys[i]; b.setAttribute('aria-label', n); b.dataset.f = f; kw.appendChild(b); keyEls[wkeys[i]] = b; });
  B.forEach(([i, f, k]) => { const b = document.createElement('button'); b.className = 'bk'; b.textContent = k; b.style.left = `calc(${(i + 1) * 12.5}% - 4%)`; b.dataset.f = f; kw.appendChild(b); keyEls[k] = b; });
  function press(el) { tone(+el.dataset.f, inst); el.classList.add('on'); setTimeout(() => el.classList.remove('on'), 180); }
  kw.addEventListener('pointerdown', (e) => { const k = e.target.closest('.wk,.bk'); if (k) { e.preventDefault(); press(k); } });
  $('tones').addEventListener('click', (e) => { const b = e.target.closest('.tone'); if (!b) return; $$('.tone').forEach((t) => t.classList.remove('active')); b.classList.add('active'); inst = b.dataset.inst; tone(261.63, inst); });

  /* ---------- DRUM PADS ---------- */
  const P = [['kick', 'Kick', 'fa-drum'], ['snare', 'Snare', 'fa-drum-steelpan'], ['hat', 'Hi-Hat', 'fa-compact-disc'], ['open', 'Open Hat', 'fa-circle-notch'],
    ['clap', 'Clap', 'fa-hands-clapping'], ['tom', 'Tom', 'fa-circle-dot'], ['crash', 'Crash', 'fa-burst'], ['bell', 'Cowbell', 'fa-bell']];
  const padEls = P.map(([id, label, icon], i) => {
    const b = document.createElement('button'); b.className = 'ss-pad'; b.dataset.d = id;
    b.innerHTML = `<small>${i + 1}</small><i class="fa-solid ${icon}"></i><span>${label}</span>`; $('padGrid').appendChild(b); return b;
  });
  function padHit(b, e) {
    hit(b.dataset.d); b.classList.add('hit'); setTimeout(() => b.classList.remove('hit'), 110);
    const r = b.getBoundingClientRect(), s = r.width * 1.6, rp = document.createElement('span'); rp.className = 'rp';
    const x = e && e.clientX ? e.clientX - r.left : r.width / 2, y = e && e.clientY ? e.clientY - r.top : r.height / 2;
    Object.assign(rp.style, { width: s + 'px', height: s + 'px', left: x - s / 2 + 'px', top: y - s / 2 + 'px' }); b.appendChild(rp); setTimeout(() => rp.remove(), 700);
  }
  $('padGrid').addEventListener('pointerdown', (e) => { const b = e.target.closest('.ss-pad'); if (b) { e.preventDefault(); padHit(b, e); } });

  document.addEventListener('keydown', (e) => {
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    const k = e.key.toUpperCase();
    if (keyEls[k]) press(keyEls[k]); else if (/^[1-8]$/.test(k)) padHit(padEls[k - 1]);
  });

  /* ---------- SEQUENCER ---------- */
  const rows = [['kick', 'Kick', [0, 3, 4]], ['snare', 'Snare', [2, 6]], ['hat', 'Hi-Hat', [0, 1, 2, 3, 4, 5, 6, 7]], ['clap', 'Clap', [6]]];
  const steps = [];
  rows.forEach(([id, label, on]) => {
    const l = document.createElement('span'); l.textContent = label; $('seqGrid').appendChild(l);
    const row = [];
    for (let i = 0; i < 8; i++) { const b = document.createElement('button'); b.className = 'st' + (on.includes(i) ? ' on' : '') + (i % 4 === 0 ? ' q' : ''); b.setAttribute('aria-label', `${label} step ${i + 1}`);
      b.addEventListener('click', () => { b.classList.toggle('on'); if (b.classList.contains('on')) hit(id); }); $('seqGrid').appendChild(b); row.push(b); }
    steps.push([id, row]);
  });
  let timer = null, cur = 0;
  function tick() {
    steps.forEach(([id, row]) => { row.forEach((b) => b.classList.remove('now')); row[cur].classList.add('now'); if (row[cur].classList.contains('on')) drums[id](ctx.currentTime); });
    cur = (cur + 1) % 8;
  }
  function run() { clearInterval(timer); timer = setInterval(tick, 30000 / +$('bpm').value); }
  function stop() { clearInterval(timer); timer = null; cur = 0; $$('.st.now').forEach((b) => b.classList.remove('now')); }
  function setBtn() { $('seqPlay').innerHTML = timer ? '<i class="fa-solid fa-stop"></i> <span>Stop</span>' : '<i class="fa-solid fa-play"></i> <span>Play</span>'; }
  $('seqPlay').addEventListener('click', () => { init(); timer ? stop() : run(); setBtn(); });
  $('bpm').addEventListener('input', (e) => { $('bpmVal').textContent = e.target.value; if (timer) run(); });
  $('seqClear').addEventListener('click', () => $$('.st.on').forEach((b) => b.classList.remove('on')));

  /* ---------- HERO VISUALIZER ---------- */
  const cv = $('viz'), c2 = cv.getContext('2d'); let data;
  function draw(t) {
    const w = cv.width = cv.clientWidth * (devicePixelRatio || 1), h = cv.height = cv.clientHeight * (devicePixelRatio || 1), n = 56, bw = w / n;
    if (analyser) { data = data || new Uint8Array(analyser.frequencyBinCount); analyser.getByteFrequencyData(data); }
    const g = c2.createLinearGradient(0, h, 0, 0); g.addColorStop(0, '#7C3AED'); g.addColorStop(1, '#FBBF24'); c2.fillStyle = g;
    for (let i = 0; i < n; i++) {
      const idle = .14 + .1 * Math.sin(t / 500 + i * .45), live = data ? data[Math.floor(i * data.length / n)] / 255 : 0, v = Math.max(idle, live);
      const bh = v * h * .95; c2.fillRect(i * bw + bw * .18, h - bh, bw * .64, bh);
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
  $('startBtn').addEventListener('click', () => { init(); [261.63, 329.63, 392].forEach((f, i) => setTimeout(() => tone(f, 'piano'), i * 120)); });

  /* ---------- GSAP: SCROLL-DRIVEN FLIP CARDS + REVEALS ---------- */
  $$('.fc-try').forEach((b) => b.addEventListener('click', () => { tone(261.63, b.dataset.inst); setTimeout(() => tone(329.63, b.dataset.inst), 140); setTimeout(() => tone(392, b.dataset.inst), 280); }));
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    $$('.fc').forEach((c) => {
      const inner = c.querySelector('.fc-in');
      if (calm) { gsap.set(inner, { rotationY: 180 }); return; }
      gsap.to(inner, { rotationY: 180, ease: 'none', scrollTrigger: { trigger: c, start: 'top 88%', end: 'top 38%', scrub: .6 } });
    });
    if (!calm) {
      const sel = '.gear-card, .ss-tipgrid > div, .faq, .ss-piano, .ss-seq';
      gsap.set(sel, { opacity: 0, y: 40 });
      ScrollTrigger.batch(sel, { start: 'top 90%', once: true,
        onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: .8, stagger: .12, ease: 'power3.out', clearProps: 'opacity,transform' }) });
      gsap.from('.ss-pad', { scale: .6, opacity: 0, duration: .5, stagger: { each: .07, from: 'center' }, ease: 'back.out(1.8)', clearProps: 'all',
        scrollTrigger: { trigger: '#padGrid', start: 'top 85%', once: true } });
    }
  }
});