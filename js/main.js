/* ══════════════════════════════════════════════════════════
   Happy Birthday, Yorm — motion and atmosphere. Vanilla JS.
   Envelope · reveals · drifting light · confetti · music · replay
   ══════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const rand = (a, b) => a + Math.random() * (b - a);

  const body = document.body;
  const gate = $('#gate');
  const main = $('#card');
  const veil = $('#veil');
  const intro = $('#intro');
  const rail = $('.rail');

  body.classList.add('is-closed');

  /* ───────── Atmosphere: slow motes of light and a few drifting paper flecks ───────── */
  const atmosphere = (() => {
    const canvas = $('#atmosphere');
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, dpr = 1, last = 0, running = false;
    let motes = [], flecks = [], fleckTarget = 0;
    const FLECK = ['#171717', '#A88A55', '#CDB88E', '#8C8883'];

    const makeMote = () => ({
      x: Math.random() * W, y: Math.random() * H, r: rand(.5, 1.7),
      vy: rand(-7, -1.5), vx: rand(-2.5, 2.5), phase: rand(0, 6.28), speed: rand(.4, 1.3), alpha: rand(.25, .6)
    });
    const makeFleck = (anywhere) => {
      const depth = Math.random();
      return {
        x: rand(-.05, 1.05) * W, y: anywhere ? rand(-.1, 1) * H : -30,
        w: 2 + depth * 3, h: 5 + depth * 7,
        vy: 10 + depth * 20, vx: rand(-6, 8),
        rot: rand(0, 6.28), vr: rand(-.6, .6), flip: rand(0, 6.28), vflip: rand(.6, 1.6),
        sway: rand(.25, .7), phase: rand(0, 6.28),
        alpha: .12 + depth * .3, c: FLECK[Math.floor(Math.random() * FLECK.length)]
      };
    };

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const want = Math.round(Math.min(60, Math.max(22, (W * H) / 24000)));
      while (motes.length < want) motes.push(makeMote());
      motes.length = want;
      if (!running) draw(0, 0);
    }
    function setFlecks(n) {
      fleckTarget = n;
      while (flecks.length < n) flecks.push(makeFleck(true));
    }
    function draw(t, dt) {
      ctx.clearRect(0, 0, W, H);
      for (const m of motes) {
        m.x += m.vx * dt; m.y += m.vy * dt;
        if (m.y < -6) { m.y = H + 6; m.x = Math.random() * W; }
        if (m.x < -6) m.x = W + 6; else if (m.x > W + 6) m.x = -6;
        ctx.globalAlpha = m.alpha * (.45 + .55 * Math.sin(t * m.speed + m.phase));
        ctx.fillStyle = '#C4A975';
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 6.283); ctx.fill();
      }
      for (let i = flecks.length - 1; i >= 0; i--) {
        const f = flecks[i];
        f.y += f.vy * dt;
        f.x += (f.vx + Math.sin(t * f.sway + f.phase) * 14) * dt;
        f.rot += f.vr * dt; f.flip += f.vflip * dt;
        if (f.y > H + 30) {
          if (flecks.length > fleckTarget) { flecks.splice(i, 1); continue; }
          flecks[i] = makeFleck(false); continue;
        }
        ctx.save();
        ctx.translate(f.x, f.y); ctx.rotate(f.rot); ctx.scale(1, Math.cos(f.flip));
        ctx.globalAlpha = f.alpha; ctx.fillStyle = f.c;
        ctx.fillRect(-f.w / 2, -f.h / 2, f.w, f.h);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }
    function frame(now) {
      if (!running) return;
      const t = now / 1000, dt = Math.min(.05, t - last || 0);
      last = t; draw(t, dt);
      requestAnimationFrame(frame);
    }
    const start = () => { if (running || reduceMotion) return; running = true; last = performance.now() / 1000; requestAnimationFrame(frame); };
    const stop = () => { running = false; };
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    resize();
    return { start, setFlecks, flecksFor: () => (W < 700 ? 9 : 16) };
  })();
  atmosphere.setFlecks(atmosphere.flecksFor());
  atmosphere.start();

  /* ───────── Confetti for the final wish: ink, gold and paper ───────── */
  const confetti = (() => {
    const canvas = $('#confetti');
    const ctx = canvas.getContext('2d');
    const colours = ['#171717', '#474542', '#A88A55', '#CDB88E', '#E8E5DF', '#8C8883'];
    let pieces = [], raf = 0, w = 0, h = 0, dpr = 1, last = 0;
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = canvas.offsetWidth; h = canvas.offsetHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
    };
    const frame = (now) => {
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      pieces = pieces.filter((p) => p.y < h + 30 && p.life > 0);
      for (const p of pieces) {
        p.vy = Math.min(p.vy + 70 * dt, p.max); p.vx *= .985; p.sway += dt * 2.2;
        p.x += (p.vx + Math.sin(p.sway) * 20) * dt; p.y += p.vy * dt;
        p.rot += p.vr * dt; p.tilt += p.vt * dt;
        if (p.y > h * .85) p.life -= dt * 1.5;
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, Math.cos(p.tilt));
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life)) * p.a;
        ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (pieces.length) raf = requestAnimationFrame(frame);
      else { ctx.clearRect(0, 0, w, h); raf = 0; }
    };
    function burst() {
      if (reduceMotion) return;
      resize();
      const n = w < 700 ? 70 : 140;
      for (let i = 0; i < n; i++) {
        pieces.push({
          x: Math.random() * w, y: -10 - Math.random() * h * .6,
          vx: (Math.random() - .5) * 40, vy: Math.random() * 40 + 30, max: Math.random() * 60 + 80,
          w: Math.random() * 3 + 2.5, h: Math.random() * 8 + 7,
          rot: Math.random() * 6.28, vr: (Math.random() - .5) * 5,
          tilt: Math.random() * 6.28, vt: Math.random() * 5 + 3, sway: Math.random() * 6.28,
          c: colours[i % colours.length], a: Math.random() * .3 + .6, life: 1
        });
      }
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
    }
    window.addEventListener('resize', () => { if (raf) resize(); });
    return { burst };
  })();

  /* ───────── Optional music: only if the file exists; starts inside the Open tap ───────── */
  const music = (() => {
    const audio = $('#song');
    const button = $('#sound');
    const hint = $('#soundHint');
    const LEVEL = .7;
    let failed = false, wanted = false, fadeTimer = 0;

    const render = () => {
      button.classList.toggle('off', !wanted);
      button.setAttribute('aria-pressed', String(wanted));
      button.setAttribute('aria-label', wanted ? 'Pause music' : 'Play music');
    };
    const fadeTo = (target, ms, done) => {
      clearInterval(fadeTimer);
      const from = audio.volume, steps = Math.max(1, Math.round(ms / 50));
      let n = 0;
      fadeTimer = setInterval(() => {
        n += 1;
        audio.volume = Math.min(1, Math.max(0, from + (target - from) * (n / steps)));
        if (n >= steps) { clearInterval(fadeTimer); if (done) done(); }
      }, 50);
    };
    function play(ms = 3500) {
      if (failed) return;
      wanted = true; render();
      audio.volume = 0;
      const p = audio.play();
      if (p && p.catch) p.catch(() => { if (audio.error) fail(); else { wanted = false; render(); } });
      fadeTo(LEVEL, ms);
    }
    function pause() { wanted = false; render(); fadeTo(0, 600, () => audio.pause()); }
    function show() { if (failed) return; button.hidden = false; requestAnimationFrame(() => button.classList.add('on')); }
    function fail() { failed = true; wanted = false; clearInterval(fadeTimer); button.hidden = true; hint.hidden = true; }
    function ready() { if (!failed && !gate.classList.contains('is-opening')) hint.hidden = false; }

    if (audio.error || audio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) fail();
    else if (audio.readyState >= 3) ready();
    audio.addEventListener('error', fail);
    audio.addEventListener('canplay', ready, { once: true });
    button.addEventListener('click', () => (wanted ? pause() : play(1200)));
    document.addEventListener('visibilitychange', () => {
      if (!wanted) return;
      if (document.hidden) audio.pause(); else audio.play().catch(() => {});
    });
    return { play, show };
  })();

  /* ───────── Scroll choreography ───────── */
  let io = null;
  let observersStarted = false;

  function startReveals() {
    const items = $$('[data-reveal]');
    if (!('IntersectionObserver' in window)) { items.forEach((el) => el.classList.add('in')); return; }
    io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }, { threshold: .16, rootMargin: '0px 0px -7% 0px' });
    items.forEach((el) => io.observe(el));
  }

  function startObservers() {
    startReveals();
    if (observersStarted) return;
    observersStarted = true;

    // Progress thread + a gentle parallax inside the photograph
    const fill = $('#railFill');
    const photo = $('.print__img img');
    const printBox = $('.print');
    let ticking = false;
    const update = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      fill.style.transform = `scaleY(${p})`;
      if (!reduceMotion && photo) {
        const r = printBox.getBoundingClientRect();
        const c = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight; // -1 … 1
        photo.style.setProperty('--py', `${Math.max(-1, Math.min(1, c)) * -6}%`);
      }
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();

    // Confetti each time the final wish comes into view
    if ('IntersectionObserver' in window) {
      let inside = false;
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !inside && !body.classList.contains('is-closed')) { inside = true; setTimeout(confetti.burst, 900); }
        else if (!e.isIntersecting) inside = false;
      }, { threshold: .45 }).observe($('#finale'));
    }
  }

  /* ───────── Opening the envelope ───────── */
  let opened = false;

  function enterCard() {
    gate.classList.add('gone');
    main.hidden = false;
    body.classList.remove('is-closed');
    rail.classList.add('on');
    music.show();
    atmosphere.setFlecks(Math.round(atmosphere.flecksFor() * .45));
    startObservers();
  }

  async function openEnvelope() {
    if (opened) return;
    opened = true;
    music.play(); // must start inside the tap, or browsers block it

    if (reduceMotion) {
      veil.classList.remove('out'); veil.classList.add('on');
      await wait(700);
      enterCard(); window.scrollTo(0, 0);
      veil.classList.add('out'); veil.classList.remove('on');
      intro.classList.add('in');
      $('#hello').focus({ preventScroll: true });
      return;
    }

    gate.classList.add('is-opening');     // words fade, the seal breaks
    await wait(650);
    gate.classList.add('flap-open');      // the flap lifts
    await wait(575);
    gate.classList.add('flap-behind');    // …and tucks behind the card
    await wait(500);
    gate.classList.add('card-out');       // the card rises
    await wait(1500);
    gate.classList.add('is-leaving');     // lean in toward the card
    await wait(350);
    veil.classList.remove('out'); veil.classList.add('on');
    await wait(1450);

    enterCard();
    window.scrollTo(0, 0);
    await wait(120);
    veil.classList.add('out'); veil.classList.remove('on');
    await wait(500);
    intro.classList.add('in');
    $('#hello').focus({ preventScroll: true });
  }

  $('#open').addEventListener('click', openEnvelope);
  $('#envelope').addEventListener('click', openEnvelope);

  /* ───────── One more thing ───────── */
  const ps = $('#ps');
  const psSeal = $('#psSeal');
  psSeal.addEventListener('click', () => {
    ps.classList.add('open');
    psSeal.setAttribute('aria-expanded', 'true');
    psSeal.disabled = true;
    setTimeout(confetti.burst, 1400);
  });

  $('#celebrate').addEventListener('click', () => confetti.burst());

  /* ───────── Read it again: close the card and start over ───────── */
  $('#again').addEventListener('click', async () => {
    if (io) io.disconnect();
    veil.classList.remove('out'); veil.classList.add('on');
    await wait(reduceMotion ? 300 : 1200);

    window.scrollTo({ top: 0, behavior: 'instant' });
    main.hidden = true;
    rail.classList.remove('on');
    intro.classList.remove('in');
    $$('[data-reveal]').forEach((el) => el.classList.remove('in'));
    ps.classList.remove('open'); psSeal.disabled = false; psSeal.setAttribute('aria-expanded', 'false');
    body.classList.add('is-closed');
    atmosphere.setFlecks(atmosphere.flecksFor());

    gate.classList.add('is-resetting');
    gate.classList.remove('gone', 'ready', 'is-opening', 'flap-open', 'flap-behind', 'card-out', 'is-leaving');
    void gate.offsetWidth;
    gate.classList.remove('is-resetting');
    opened = false;

    veil.classList.add('out'); veil.classList.remove('on');
    requestAnimationFrame(() => requestAnimationFrame(() => gate.classList.add('ready')));
    setTimeout(() => $('#open').focus({ preventScroll: true }), reduceMotion ? 0 : 1800);
  });

  /* ───────── Begin ───────── */
  // `?card` skips the envelope (handy while editing the words).
  if (new URLSearchParams(location.search).has('card')) {
    opened = true;
    enterCard();
    intro.classList.add('in');
    if (location.hash) {
      const target = document.getElementById(location.hash.slice(1));
      if (target) requestAnimationFrame(() => target.scrollIntoView());
    }
  } else {
    const ready = () => requestAnimationFrame(() => gate.classList.add('ready'));
    if (document.fonts && document.fonts.ready) Promise.race([document.fonts.ready, wait(1800)]).then(ready);
    else ready();
  }
})();
