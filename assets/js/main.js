/* ═══════════════════════════════════════════════════════
   BEAR MY BRAND — main.js  v9
   Preloader · Cursor · Cosmic BG · Brand Orbital · GSAP
═══════════════════════════════════════════════════════ */
'use strict';

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════
   NOISE CANVAS  (throttled to ~12fps for perf)
   Called after preloader so it doesn't compete with GSAP
═══════════════════════════════════════════════════════ */
function initNoise() {
  const c = document.getElementById('heroNoise');
  if (!c) return;
  const ctx = c.getContext('2d');
  let w, h, img, d;
  function resize() {
    w = c.width  = c.offsetWidth;
    h = c.height = c.offsetHeight;
    img = ctx.createImageData(w, h);
    d   = img.data;
  }
  function draw() {
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.random() * 255 | 0;
      d[i] = d[i+1] = d[i+2] = v;
      d[i+3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    setTimeout(() => requestAnimationFrame(draw), 80); // ~12fps
  }
  resize();
  window.addEventListener('resize', resize);
  draw();
}

/* ═══════════════════════════════════════════════════════
   COSMIC WAVE BACKGROUND
   Sea-of-space: flowing sine waves · stars · nebula
   + Shooting stars   (fast diagonal streaks)
   + Cosmic travellers (slow point-to-point voyagers)
   Called after preloader exits — zero competition with GSAP
═══════════════════════════════════════════════════════ */
function initHeroBg() {
  const c = document.getElementById('heroBg');
  if (!c) return;
  const ctx = c.getContext('2d');
  let W, H, t = 0, stars = [];

  /* Wave definitions: yRatio, amplitude, frequency, speed, opacity */
  const WV = [
    { yr: .30, a: 80, f: .0058, s:  .22, op: .052 },
    { yr: .42, a: 55, f: .0082, s: -.16, op: .038 },
    { yr: .54, a: 92, f: .0044, s:  .18, op: .048 },
    { yr: .24, a: 38, f: .0118, s:  .40, op: .026 },
    { yr: .64, a: 65, f: .0066, s: -.23, op: .036 },
    { yr: .18, a: 28, f: .0140, s:  .55, op: .018 },
  ];

  /* ── Shooting stars ─────────────────────────────────
     Fast diagonal streaks with a tapering glowing tail
  ──────────────────────────────────────────────────── */
  const shooters = [];
  let nextShootAt = 0;

  function spawnShooter(now) {
    if (now < nextShootAt) return;
    nextShootAt = now + 2800 + Math.random() * 5000;

    const fromTop = Math.random() < .65;
    const sx  = fromTop ? Math.random() * W * .85  : W + 10;
    const sy  = fromTop ? -10                        : Math.random() * H * .45;
    const spd = 9 + Math.random() * 9;
    /* Angle: from-top travels down-right/down-left; from-right travels left */
    const ang = fromTop
      ? (.28 + Math.random() * .55) * Math.PI        // ~50–130° (downward arc)
      : Math.PI + (Math.random() - .5) * .5;          // ~left ± 15°

    shooters.push({
      x: sx, y: sy,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd,
      trail: [[sx, sy]],
      maxLen: 55 + (Math.random() * 45 | 0),
      col: Math.random() < .6 ? '200,225,255' : '80,155,220',
      done: false,
    });
  }

  function updateShooters(now) {
    spawnShooter(now);
    for (let i = shooters.length - 1; i >= 0; i--) {
      const s = shooters[i];
      if (!s.done) {
        s.x += s.vx; s.y += s.vy;
        s.trail.push([s.x, s.y]);
        if (s.trail.length > s.maxLen) s.trail.shift();
        if (s.x < -80 || s.x > W + 80 || s.y > H + 80 || s.y < -80) s.done = true;
      } else {
        s.trail.shift();
        if (!s.trail.length) shooters.splice(i, 1);
      }
    }
  }

  function drawShooters() {
    shooters.forEach(s => {
      if (s.trail.length < 2) return;
      /* Tapering gradient trail */
      for (let i = 1; i < s.trail.length; i++) {
        const p = i / s.trail.length;
        const [x1, y1] = s.trail[i - 1];
        const [x2, y2] = s.trail[i];
        ctx.beginPath();
        ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(${s.col},${p * .8})`;
        ctx.lineWidth   = p * 2.2;
        ctx.stroke();
      }
      /* Bright head */
      if (!s.done) {
        const [hx, hy] = s.trail[s.trail.length - 1];
        ctx.beginPath();
        ctx.arc(hx, hy, 2.2, 0, 6.283);
        ctx.fillStyle   = 'rgba(255,255,255,.95)';
        ctx.shadowBlur  = 14;
        ctx.shadowColor = `rgba(${s.col},1)`;
        ctx.fill();
        ctx.shadowBlur  = 0;
      }
    });
  }

  /* ── Cosmic travellers ──────────────────────────────
     Slow-moving orbs that drift all the way across
     the canvas — like a spacecraft crossing deep space.
     They leave a long, softly glowing trail behind.
  ──────────────────────────────────────────────────── */
  const travellers = [];
  let nextTravelAt = 500;

  function spawnTraveller(now) {
    if (travellers.length >= 2 || now < nextTravelAt) return;
    nextTravelAt = now + 9000 + Math.random() * 14000;

    const goRight = Math.random() < .5;
    const sx = goRight ? -20 : W + 20;
    const ex = goRight ? W + 20 : -20;
    const sy = H * .08 + Math.random() * H * .58;
    const ey = H * .08 + Math.random() * H * .58;

    travellers.push({
      sx, sy, ex, ey,
      x: sx, y: sy,
      prog: 0,
      spd : .00055 + Math.random() * .0009,
      arc : (Math.random() - .5) * H * .18,  // vertical arc deviation
      trail: [],
      maxTrail: 100,
      col: Math.random() < .55 ? '27,112,187' : '80,155,220',
    });
  }

  function updateTravellers(now) {
    spawnTraveller(now);
    for (let i = travellers.length - 1; i >= 0; i--) {
      const tr = travellers[i];
      if (tr.prog < 1) {
        tr.prog += tr.spd;
        const p   = tr.prog;
        /* Straight line + sine arc for a gentle curved path */
        const arc = Math.sin(p * Math.PI) * tr.arc;
        tr.x = tr.sx + (tr.ex - tr.sx) * p;
        tr.y = tr.sy + (tr.ey - tr.sy) * p + arc;
        tr.trail.push([tr.x, tr.y]);
        if (tr.trail.length > tr.maxTrail) tr.trail.shift();
      } else {
        tr.trail.shift();
        if (!tr.trail.length) travellers.splice(i, 1);
      }
    }
  }

  function drawTravellers() {
    travellers.forEach(tr => {
      if (tr.trail.length < 2) return;
      /* Fading trail */
      for (let i = 1; i < tr.trail.length; i++) {
        const p = i / tr.trail.length;
        const [x1, y1] = tr.trail[i - 1];
        const [x2, y2] = tr.trail[i];
        ctx.beginPath();
        ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(${tr.col},${p * .35})`;
        ctx.lineWidth   = p * 1.8;
        ctx.stroke();
      }
      /* Glowing head (while still travelling) */
      if (tr.prog < 1) {
        const hg = ctx.createRadialGradient(tr.x, tr.y, 0, tr.x, tr.y, 10);
        hg.addColorStop(0,   `rgba(${tr.col},.9)`);
        hg.addColorStop(.4,  `rgba(${tr.col},.3)`);
        hg.addColorStop(1,   `rgba(${tr.col},0)`);
        ctx.beginPath();
        ctx.arc(tr.x, tr.y, 10, 0, 6.283);
        ctx.fillStyle = hg;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(tr.x, tr.y, 2.5, 0, 6.283);
        ctx.fillStyle   = 'rgba(255,255,255,.9)';
        ctx.shadowBlur  = 18;
        ctx.shadowColor = `rgba(${tr.col},1)`;
        ctx.fill();
        ctx.shadowBlur  = 0;
      }
    });
  }

  /* ── Stars ──────────────────────────────────────────── */
  function buildStars() {
    const n = Math.min(85, (W * H / 13000) | 0);
    stars = [];
    for (let i = 0; i < n; i++) {
      stars.push({
        x : Math.random() * W,
        y : Math.random() * H * .72,
        r : Math.random() * 1.1 + .2,
        a : Math.random() * .28 + .06,
        ph: Math.random() * 6.28,
        sp: Math.random() * .45 + .15
      });
    }
  }

  function resize() {
    W = c.width  = c.offsetWidth;
    H = c.height = c.offsetHeight;
    buildStars();
  }

  function draw(now) {
    ctx.clearRect(0, 0, W, H);
    t += .007;

    /* ── Twinkling stars ─────────────────────────────── */
    stars.forEach(s => {
      const a = s.a * (.5 + .5 * Math.sin(t * s.sp + s.ph));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, 6.283);
      ctx.fillStyle = `rgba(185,215,255,${a})`;
      ctx.fill();
    });

    /* ── Nebula glow (upper-right) ─────────────────── */
    const ng = ctx.createRadialGradient(W * .70, H * .14, 0, W * .70, H * .14, W * .40);
    ng.addColorStop(0,   'rgba(18,50,125,.10)');
    ng.addColorStop(.55, 'rgba(8,25,75,.04)');
    ng.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = ng; ctx.fillRect(0, 0, W, H);

    /* Second nebula — bottom-left */
    const ng2 = ctx.createRadialGradient(W * .12, H * .78, 0, W * .12, H * .78, W * .28);
    ng2.addColorStop(0, 'rgba(10,35,90,.07)');
    ng2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = ng2; ctx.fillRect(0, 0, W, H);

    /* ── Sine wave layers ────────────────────────────── */
    WV.forEach(w => {
      ctx.beginPath();
      for (let x = 0; x <= W; x += 4) {
        const y = H * w.yr + Math.sin(x * w.f + t * w.s) * w.a;
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.strokeStyle = `rgba(27,112,187,${w.op})`;
      ctx.lineWidth   = 1.8;
      ctx.shadowBlur  = 18;
      ctx.shadowColor = `rgba(27,112,187,${w.op * 3.2})`;
      ctx.stroke();
      ctx.shadowBlur  = 0;
    });

    /* ── Cosmic travellers & shooting stars ─────────── */
    updateTravellers(now);
    drawTravellers();
    updateShooters(now);
    drawShooters();

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(draw);
}

/* ═══════════════════════════════════════════════════════
   CUSTOM CURSOR
═══════════════════════════════════════════════════════ */
(function initCursor() {
  const dot  = document.getElementById('curDot');
  const ring = document.getElementById('curRing');
  if (!dot || !ring) return;

  let mx = -300, my = -300;
  let rx = -300, ry = -300;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function loop() {
    rx += (mx - rx) * .12;
    ry += (my - ry) * .12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();

  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
})();

/* ═══════════════════════════════════════════════════════
   MAGNETIC BUTTONS
═══════════════════════════════════════════════════════ */
function initMagnetic() {
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r  = el.getBoundingClientRect();
      gsap.to(el, {
        x: (e.clientX - r.left - r.width  / 2) * .35,
        y: (e.clientY - r.top  - r.height / 2) * .35,
        duration: .4, ease: 'power2.out'
      });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1,.5)' });
    });
  });
}

/* ═══════════════════════════════════════════════════════
   PRELOADER — Cinematic Big Bang
   Phase 1: Singularity — logo born from a glowing point
   Phase 2: Tension — glow + logo breathe and grow
   Phase 3: Big Bang — explosion, flash, shockwaves, nebula
   Phase 4: Cosmic settle — universe fades, site revealed
   All heavy canvas work starts only AFTER this exits.
═══════════════════════════════════════════════════════ */
(function initPreloader() {
  const pl     = document.getElementById('preloader');
  const logo   = document.getElementById('plLogo');
  const center = document.getElementById('plCenter');
  const glowEl = document.getElementById('plGlow');
  const flash  = document.getElementById('plFlash');
  const canvas = document.getElementById('plCanvas');
  const rings  = ['.pl-r1','.pl-r2','.pl-r3'].map(s => document.querySelector(s));

  if (!pl || !logo || !canvas) return;

  /* ── Canvas setup ─────────────────────────────────── */
  const ctx = canvas.getContext('2d');
  let W = canvas.width  = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  let cx = W * .5, cy = H * .5;

  const isMobile = W < 768;

  /* ── Build particles ──────────────────────────────── */
  const COUNT    = isMobile ? 65 : 130;
  const STREAK_N = isMobile ? 14 : 24;
  const NEBULA_N = isMobile ?  5 :  9;

  const particles = [];
  for (let i = 0; i < COUNT; i++) {
    const ang  = Math.random() * 6.283;
    const dist = (.12 + Math.random() * .88) * Math.min(W, H) * .56;
    const col  = Math.random() < .38 ? '27,112,187'
               : Math.random() < .55 ? '70,148,218'
               : '195,225,255';
    particles.push({
      x: cx, y: cy,
      tx: cx + Math.cos(ang) * dist,
      ty: cy + Math.sin(ang) * dist,
      size: .5 + Math.random() * 2.4,
      alpha: 0,
      maxA : .28 + Math.random() * .72,
      col, live: false,
    });
  }

  /* ── Build light streaks ───────────────────────────── */
  const streaks = [];
  for (let i = 0; i < STREAK_N; i++) {
    const ang = (i / STREAK_N) * 6.283 + (Math.random() - .5) * .35;
    streaks.push({
      ang,
      len : (.22 + Math.random() * .78) * Math.min(W, H) * .72,
      alpha: 0,
      w   : .3 + Math.random() * 1.8,
      col : Math.random() < .5 ? '27,112,187' : '90,172,255',
    });
  }

  /* ── Build nebula blobs ────────────────────────────── */
  const nebulae = [];
  for (let i = 0; i < NEBULA_N; i++) {
    const ang  = (i / NEBULA_N) * 6.283 + Math.random() * .8;
    const dist = (.04 + Math.random() * .28) * Math.min(W, H);
    nebulae.push({
      x    : cx + Math.cos(ang) * dist,
      y    : cy + Math.sin(ang) * dist,
      r    : 0,
      maxR : (.14 + Math.random() * .22) * Math.min(W, H),
      alpha: 0,
      col  : Math.random() < .55 ? '27,112,187' : '12,48,140',
      live : false,
    });
  }

  /* ── Draw loop — pure RAF physics, zero GSAP tweens ── */
  let rafRunning = false;
  let bangFrame  = -1; // -1 = not started; 0+ = frames since bang

  function draw() {
    if (!rafRunning) return;
    ctx.clearRect(0, 0, W, H);

    if (bangFrame >= 0) bangFrame++;

    /* ── Nebula clouds ─────────────────────────────────── */
    nebulae.forEach(n => {
      if (!n.live) return;
      if (bangFrame < n.delayF) return;          // pre-delay

      /* Expand radius with expo.out feel */
      if (n.r < n.maxR) {
        n.r += (n.maxR - n.r) * .18;             // exponential approach
        if (n.maxR - n.r < .5) n.r = n.maxR;
      }

      /* Alpha: rise then fall */
      if (!n.falling) {
        n.alpha = Math.min(.75, n.alpha + n.aRise);
        if (bangFrame >= n.fallStartF) n.falling = true;
      } else {
        n.alpha = Math.max(0, n.alpha - n.aFall);
      }

      if (n.alpha < .005) return;
      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r || 1);
      g.addColorStop(0,   `rgba(${n.col},${(n.alpha * .55).toFixed(3)})`);
      g.addColorStop(.45, `rgba(${n.col},${(n.alpha * .22).toFixed(3)})`);
      g.addColorStop(1,   `rgba(${n.col},0)`);
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r || 1, 0, 6.283);
      ctx.fillStyle = g;
      ctx.fill();
    });

    /* ── Light streaks ─────────────────────────────────── */
    streaks.forEach(s => {
      if (bangFrame < s.riseStartF) return;      // staggered start

      if (bangFrame < s.fallStartF) {
        /* Rise phase — power3.out feel via exponential approach */
        s.alpha += (.92 - s.alpha) * .28;
      } else {
        /* Fall phase — power2.in feel */
        s.alpha *= .91;
      }

      if (s.alpha < .005) return;
      const ex = cx + Math.cos(s.ang) * s.len * (s.alpha / .92);
      const ey = cy + Math.sin(s.ang) * s.len * (s.alpha / .92);
      const g  = ctx.createLinearGradient(cx, cy, ex, ey);
      g.addColorStop(0, `rgba(${s.col},${Math.min(s.alpha * .9, 1).toFixed(3)})`);
      g.addColorStop(1, `rgba(${s.col},0)`);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = g;
      ctx.lineWidth   = s.w;
      ctx.stroke();
    });

    /* ── Particles ─────────────────────────────────────── */
    particles.forEach(p => {
      if (!p.live || p.alpha < .005) return;

      /* Position: power2.out via progress */
      if (p.prog < 1) {
        p.prog  = Math.min(1, p.prog + p.spd);
        const e = 1 - (1 - p.prog) * (1 - p.prog); // power2.out
        p.x = cx + (p.tx - cx) * e;
        p.y = cy + (p.ty - cy) * e;
      }

      /* Alpha: delay then linear decay */
      if (bangFrame >= p.alphaStartF) {
        p.alpha = Math.max(0, p.alpha - p.alphaDecay);
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, 6.283);
      ctx.fillStyle = `rgba(${p.col},${p.alpha.toFixed(3)})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  /* ── Trigger all cosmic elements at Bang moment ─────── */
  function triggerBang() {
    bangFrame  = 0;
    rafRunning = true;

    /* Particles — progress-based movement, no GSAP */
    particles.forEach(p => {
      p.live       = true;
      p.alpha      = p.maxA;
      p.prog       = 0;
      const dur    = 1.1 + Math.random() * 1.5;        // seconds
      p.spd        = 1 / (dur * 60);                   // progress per frame
      const delay  = .2 + Math.random() * .55;
      p.alphaStartF = Math.floor(delay * 60);
      p.alphaDecay = p.maxA / (dur * .65 * 60);
    });

    /* Streaks — frame-indexed rise/fall, no GSAP */
    streaks.forEach((s, i) => {
      s.alpha      = 0;
      s.riseStartF = Math.floor(i * .006 * 60);        // stagger onset
      s.fallStartF = Math.floor((.38 + i * .01) * 60); // absolute fall frame
    });

    /* Nebulae — expand + fade, no GSAP */
    nebulae.forEach((n, i) => {
      n.live       = true;
      n.alpha      = 0;
      n.r          = 0;
      n.falling    = false;
      const fadeDur = .5 + Math.random() * .6;
      n.delayF     = Math.floor(i * .02 * 60);
      n.aRise      = .75 / (.38 * 60);                 // reach 0.75 in 0.38s
      n.aFall      = .75 / (fadeDur * 60);
      n.fallStartF = Math.floor((.35 + i * .03) * 60);
    });

    draw();
  }

  /* ── Master timeline ───────────────────────────────── */
  function runAnimation() {
    /* Initial states — everything invisible at singularity point */
    gsap.set(center, { scale: .008, opacity: 0 });
    gsap.set(glowEl,  { scale: 0,    opacity: 0 });
    gsap.set(flash,   { opacity: 0 });
    rings.forEach(r => r && gsap.set(r, { scale: 0, opacity: 0 }));

    const tl = gsap.timeline({
      onComplete() {
        rafRunning = false;
        ctx.clearRect(0, 0, W, H);
        pl.style.display = 'none';
        /* All canvases start fresh — zero competition */
        initNoise();
        initHeroBg();
        initBrandVis();
        initMagnetic();
        revealHero();
      }
    });

    /* ─── Phase 1: Singularity ───
       Logo materialises from a near-invisible point.
       Only the glow betrays its presence. */
    tl
      .to(center, { scale: .055, opacity: 1, duration: .55, ease: 'power2.out' })
      .to(glowEl,  { scale: 1, opacity: .42, duration: .75, ease: 'power2.out' }, '-=.3')

    /* ─── Phase 2: Tension ───
       Slow, inevitable growth — like a star being born. */
      .to(center, { scale: .22, duration: 1.1, ease: 'power1.inOut' })
      .to(glowEl,  { scale: 2.2, opacity: .72, duration: .9, ease: 'power1.inOut' }, '-=.8')
      .to(center, { scale: .58, duration: .9, ease: 'power2.inOut' })
      .to(glowEl,  { scale: 3.6, opacity: .95, duration: .7, ease: 'power2.in' }, '-=.65')
      /* Glow filter intensifies */
      .to(logo, { filter: 'drop-shadow(0 0 40px rgba(27,112,187,.9)) drop-shadow(0 0 80px rgba(27,112,187,.4))', duration: .6 }, '-=.5')

    /* ─── Micro-implosion pause ───
       The universe inhales 0.22s before detonation. */
      .to(center, { scale: .47, duration: .22, ease: 'power3.in' })
      .to(glowEl,  { scale: 2.6, opacity: .88, duration: .22, ease: 'power3.in' }, '<')

    /* ─── Phase 3: Big Bang ─── */
      .call(triggerBang)
      .to(center, { scale: 55, opacity: 0, duration: .72, ease: 'expo.in' })
      /* Flash erupts at moment of detonation */
      .to(flash,  { opacity: 1, duration: .13, ease: 'power4.out' }, '-=.68')
      .to(glowEl,  { scale: 9, opacity: 0, duration: .58, ease: 'power2.out' }, '-=.68')

      /* Shockwave rings radiate outward */
      .to(rings[0], { scale: 1, opacity: .85, duration: .55, ease: 'expo.out' }, '-=.62')
      .to(rings[1], { scale: 1, opacity: .55, duration: .72, ease: 'expo.out' }, '-=.58')
      .to(rings[2], { scale: 1, opacity: .35, duration: .90, ease: 'expo.out' }, '-=.55')

    /* ─── Phase 4: Cosmic settle ───
       Everything dissolves into the dark universe. */
      .to(flash,  { opacity: 0, duration: .58, ease: 'power2.out' }, '-=.28')
      .to(rings,  { opacity: 0, duration: .7, stagger: .12, ease: 'power2.in' }, '-=.42')
      .to(pl,     { opacity: 0, duration: .6, ease: 'power2.inOut' }, '-=.38');
  }

  /* Wait for logo asset — zero flicker guarantee */
  if (logo.complete && logo.naturalWidth > 0) {
    runAnimation();
  } else {
    logo.addEventListener('load',  runAnimation);
    logo.addEventListener('error', runAnimation);
  }
})();

/* ═══════════════════════════════════════════════════════
   HERO ENTRANCE ANIMATIONS
═══════════════════════════════════════════════════════ */
function revealHero() {
  const words   = document.querySelectorAll('.h1w');
  const sub     = document.getElementById('heroSubWrap');
  const info    = document.getElementById('heroInfo');
  const stats   = document.getElementById('heroStats');
  const vis     = document.getElementById('heroVis');

  /* Navbar slides in from top */
  gsap.from('#nav', { y: -28, opacity: 0, duration: .9, ease: 'power3.out', delay: .1 });

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl
    .to(words, { y: '0%', duration: .85, stagger: .14, ease: 'power4.out' })
    .to(sub,   { opacity: 1, y: 0, duration: .65 }, '-=.4')
    .to(info,  { opacity: 1, x: 0, duration: .65 }, '-=.5')
    .to(stats, { opacity: 1, y: 0, duration: .55 }, '-=.4')
    .to(vis,   { opacity: 1, duration: 1.8, ease: 'power1.out' }, '-=.8')
    .call(animCounters, [], '-=.8');

  setTimeout(initHeroGlow, 1400);

  /* Init scroll-driven sections */
  initReveal();
  initServicesAccordion();
  initTestimonials();
  initFooterBg();
}

/* Animated counters — RAF-based, power4 ease-out */
function animCounters() {
  document.querySelectorAll('.hcount').forEach(el => {
    const target = parseInt(el.dataset.t, 10);
    const dur    = 2400; // ms
    let start    = null;

    function step(ts) {
      if (!start) start = ts;
      const elapsed  = ts - start;
      const progress = Math.min(elapsed / dur, 1);
      /* Power-4 ease-out: rushes up then decelerates dramatically */
      const eased    = 1 - Math.pow(1 - progress, 4);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }

    requestAnimationFrame(step);
  });
}

/* ═══════════════════════════════════════════════════════
   HERO MOUSE GLOW
═══════════════════════════════════════════════════════ */
function initHeroGlow() {
  const glow = document.getElementById('heroGlow');
  const hero = document.querySelector('.hero');
  if (!glow || !hero) return;

  let tx = window.innerWidth * .5;
  let ty = window.innerHeight * .45;
  let cx = tx, cy = ty;
  let live = false;

  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    tx = e.clientX - r.left;
    ty = e.clientY - r.top;
    if (!live) { live = true; glow.classList.add('active'); }
  });

  hero.addEventListener('mouseleave', () => {
    live = false;
    glow.classList.remove('active');
  });

  (function loop() {
    cx += (tx - cx) * .06;
    cy += (ty - cy) * .06;
    glow.style.left = cx + 'px';
    glow.style.top  = cy + 'px';
    requestAnimationFrame(loop);
  })();
}

/* ═══════════════════════════════════════════════════════
   BRAND ORBITAL ANIMATION
   Three rings of orbiting particles around a glowing core
   — represents interconnected branding ecosystem
═══════════════════════════════════════════════════════ */
function initBrandVis() {
  const c = document.getElementById('heroVis');
  if (!c) return;
  const ctx = c.getContext('2d');
  let W, H, t = 0, particles = [];

  /* Ring definitions: radiusFraction, count, orbitSpeed */
  const RINGS = [
    { rf: .18, n: 5,  sp:  .32, phase: 0    },
    { rf: .30, n: 9,  sp: -.19, phase: 1.1  },
    { rf: .42, n: 13, sp:  .11, phase: 0.65 },
  ];

  function buildParticles() {
    const base = Math.min(W, H) * .5;
    particles = [];
    RINGS.forEach(ring => {
      for (let i = 0; i < ring.n; i++) {
        particles.push({
          orbitR: base * ring.rf,
          sp    : ring.sp,
          angle : (i / ring.n) * 6.283 + ring.phase,
          size  : ring.rf < .2 ? 2.8 : ring.rf < .35 ? 2.2 : 1.6,
          ph    : Math.random() * 6.283,
        });
      }
    });
  }

  function resize() {
    W = c.width  = c.offsetWidth;
    H = c.height = c.offsetHeight;
    buildParticles();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += .009;

    const cx = W * .5, cy = H * .5;

    /* Update angles, collect screen positions */
    const pos = particles.map(p => {
      p.angle += p.sp * .009;
      return {
        x : cx + Math.cos(p.angle) * p.orbitR,
        y : cy + Math.sin(p.angle) * p.orbitR,
        sz: p.size,
        ph: p.ph
      };
    });

    /* ── Orbit ring traces ─────────────────────────── */
    RINGS.forEach(ring => {
      const base = Math.min(W, H) * .5;
      ctx.beginPath();
      ctx.arc(cx, cy, base * ring.rf, 0, 6.283);
      ctx.strokeStyle = 'rgba(27,112,187,0.05)';
      ctx.lineWidth   = 0.5;
      ctx.stroke();
    });

    /* ── Connecting lines between close particles ──── */
    const CONNECT_DIST = Math.min(W, H) * .15;
    for (let i = 0; i < pos.length; i++) {
      for (let j = i + 1; j < pos.length; j++) {
        const dx = pos[i].x - pos[j].x;
        const dy = pos[i].y - pos[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < CONNECT_DIST) {
          ctx.beginPath();
          ctx.moveTo(pos[i].x, pos[i].y);
          ctx.lineTo(pos[j].x, pos[j].y);
          ctx.strokeStyle = `rgba(27,112,187,${(1 - d / CONNECT_DIST) * .16})`;
          ctx.lineWidth   = 0.6;
          ctx.stroke();
        }
      }
    }

    /* ── Center orb glow ───────────────────────────── */
    const pulse = .72 + .28 * Math.sin(t * 1.8);
    const orbR  = Math.min(W, H) * .065 * pulse;
    const cg    = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbR);
    cg.addColorStop(0,   'rgba(27,112,187,.65)');
    cg.addColorStop(.4,  'rgba(27,112,187,.18)');
    cg.addColorStop(1,   'rgba(27,112,187,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, orbR, 0, 6.283);
    ctx.fillStyle = cg;
    ctx.fill();

    /* Center dot */
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, 6.283);
    ctx.fillStyle   = 'rgba(27,112,187,.95)';
    ctx.shadowBlur  = 20;
    ctx.shadowColor = 'rgba(27,112,187,.8)';
    ctx.fill();
    ctx.shadowBlur  = 0;

    /* ── Orbiting particles ────────────────────────── */
    pos.forEach(p => {
      const glow = .45 + .55 * Math.sin(t * 2.2 + p.ph);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.sz, 0, 6.283);
      ctx.fillStyle   = `rgba(27,112,187,${.35 + .65 * glow})`;
      ctx.shadowBlur  = 10;
      ctx.shadowColor = `rgba(27,112,187,.55)`;
      ctx.fill();
      ctx.shadowBlur  = 0;
    });

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
}

/* ═══════════════════════════════════════════════════════
   SCROLL REVEAL — IntersectionObserver + GSAP
   data-reveal           → fade + rise on element
   data-reveal-stagger   → parent: triggers children
   data-reveal-child     → child elements inside stagger parent
   data-reveal-line      → single line slide-up (e.g. section titles)
═══════════════════════════════════════════════════════ */
function initReveal() {
  /* Helpers */
  const EASE_OUT  = 'power3.out';
  const EASE_SOFT = 'power2.out';

  /* ── Single-element reveals ─────────────────────────── */
  const singles = document.querySelectorAll('[data-reveal]');
  singles.forEach(el => {
    gsap.set(el, { opacity: 0, y: 44 });
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      gsap.to(en.target, {
        opacity : 1,
        y       : 0,
        duration: .75,
        ease    : EASE_OUT,
        delay   : parseFloat(en.target.dataset.revealDelay || 0),
      });
    });
  }, { threshold: .18 });

  singles.forEach(el => io.observe(el));

  /* ── Stagger groups ─────────────────────────────────── */
  const staggerParents = document.querySelectorAll('[data-reveal-stagger]');
  staggerParents.forEach(parent => {
    const children = parent.querySelectorAll('[data-reveal-child]');
    gsap.set(children, { opacity: 0, y: 36 });

    const ioS = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        ioS.unobserve(en.target);
        gsap.to(children, {
          opacity : 1,
          y       : 0,
          duration: .7,
          stagger : .11,
          ease    : EASE_OUT,
        });
      });
    }, { threshold: .12 });

    ioS.observe(parent);
  });

  /* ── Section eyebrows / lines ───────────────────────── */
  const lines = document.querySelectorAll('[data-reveal-line]');
  lines.forEach(el => {
    gsap.set(el, { opacity: 0, y: 28 });
    const ioL = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        ioL.unobserve(en.target);
        gsap.to(en.target, { opacity: 1, y: 0, duration: .65, ease: EASE_SOFT });
      });
    }, { threshold: .4 });
    ioL.observe(el);
  });

  /* ── Work cards: scale + fade ───────────────────────── */
  const workCards = document.querySelectorAll('.work-card');
  workCards.forEach((card, i) => {
    gsap.set(card, { opacity: 0, scale: .96, y: 30 });
    const ioW = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        ioW.unobserve(en.target);
        gsap.to(en.target, {
          opacity : 1,
          scale   : 1,
          y       : 0,
          duration: .75,
          ease    : EASE_OUT,
          delay   : (i % 2) * .12,
        });
      });
    }, { threshold: .15 });
    ioW.observe(card);
  });
}

/* ═══════════════════════════════════════════════════════
   SERVICES ACCORDION
   Click a .svc-item → expands its .svc-body, closes others
   Smooth max-height CSS transition handles the visual ease.
═══════════════════════════════════════════════════════ */
function initServicesAccordion() {
  const items = document.querySelectorAll('.svc-item');
  if (!items.length) return;

  /* Open the first item by default */
  items[0].classList.add('open');
  const firstBtn = items[0].querySelector('.svc-row');
  if (firstBtn) firstBtn.setAttribute('aria-expanded', 'true');

  items.forEach(item => {
    const header = item.querySelector('.svc-row');
    if (!header) return;

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      /* Close all */
      items.forEach(i => {
        i.classList.remove('open');
        const btn = i.querySelector('.svc-row');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });

      /* Toggle clicked — stays closed if it was already open */
      if (!isOpen) {
        item.classList.add('open');
        header.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ═══════════════════════════════════════════════════════
   FOOTER COSMIC BACKGROUND
   Same visual language as the hero — sine waves, stars,
   shooting streaks, travellers — but more intimate/subtle.
   Lazy-started via IntersectionObserver so it doesn't
   burn CPU until the user actually scrolls to the footer.
═══════════════════════════════════════════════════════ */
function initFooterBg() {
  const c = document.getElementById('footerCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  let W, H, t = 0, stars = [], started = false;

  /* Fewer, calmer wave layers than the hero */
  const WV = [
    { yr: .25, a: 40, f: .006,  s:  .18, op: .045 },
    { yr: .55, a: 60, f: .0045, s: -.13, op: .038 },
    { yr: .75, a: 28, f: .009,  s:  .28, op: .028 },
    { yr: .40, a: 50, f: .0072, s: -.20, op: .032 },
  ];

  /* Shooting stars */
  const shooters = [];
  let nextShootAt = 0;

  function spawnShooter(now) {
    if (now < nextShootAt) return;
    nextShootAt = now + 3500 + Math.random() * 7000;
    const fromTop = Math.random() < .6;
    const sx = fromTop ? Math.random() * W * .8 : W + 10;
    const sy = fromTop ? -10 : Math.random() * H * .5;
    const spd = 7 + Math.random() * 8;
    const ang = fromTop
      ? (.3 + Math.random() * .5) * Math.PI
      : Math.PI + (Math.random() - .5) * .4;
    shooters.push({
      x: sx, y: sy,
      vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
      trail: [[sx, sy]],
      maxLen: 45 + (Math.random() * 35 | 0),
      col: Math.random() < .6 ? '180,215,255' : '60,140,210',
      done: false,
    });
  }

  function updateShooters(now) {
    spawnShooter(now);
    for (let i = shooters.length - 1; i >= 0; i--) {
      const s = shooters[i];
      if (!s.done) {
        s.x += s.vx; s.y += s.vy;
        s.trail.push([s.x, s.y]);
        if (s.trail.length > s.maxLen) s.trail.shift();
        if (s.x < -60 || s.x > W + 60 || s.y > H + 60 || s.y < -60) s.done = true;
      } else {
        s.trail.shift();
        if (!s.trail.length) shooters.splice(i, 1);
      }
    }
  }

  function drawShooters() {
    shooters.forEach(s => {
      if (s.trail.length < 2) return;
      for (let i = 1; i < s.trail.length; i++) {
        const p = i / s.trail.length;
        const [x1,y1] = s.trail[i-1], [x2,y2] = s.trail[i];
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
        ctx.strokeStyle = `rgba(${s.col},${p * .7})`;
        ctx.lineWidth   = p * 1.8;
        ctx.stroke();
      }
      if (!s.done) {
        const [hx,hy] = s.trail[s.trail.length-1];
        ctx.beginPath(); ctx.arc(hx, hy, 1.8, 0, 6.283);
        ctx.fillStyle   = 'rgba(255,255,255,.9)';
        ctx.shadowBlur  = 10;
        ctx.shadowColor = `rgba(${s.col},1)`;
        ctx.fill(); ctx.shadowBlur = 0;
      }
    });
  }

  /* Cosmic traveller */
  const travellers = [];
  let nextTravelAt = 2000;

  function spawnTraveller(now) {
    if (travellers.length >= 1 || now < nextTravelAt) return;
    nextTravelAt = now + 14000 + Math.random() * 18000;
    const goRight = Math.random() < .5;
    const sx = goRight ? -20 : W + 20;
    const ex = goRight ? W + 20 : -20;
    const sy = H * .1 + Math.random() * H * .7;
    const ey = H * .1 + Math.random() * H * .7;
    travellers.push({
      sx, sy, ex, ey, x: sx, y: sy, prog: 0,
      spd : .0004 + Math.random() * .0007,
      arc : (Math.random() - .5) * H * .14,
      trail: [], maxTrail: 80,
      col: '27,112,187',
    });
  }

  function updateTravellers(now) {
    spawnTraveller(now);
    for (let i = travellers.length - 1; i >= 0; i--) {
      const tr = travellers[i];
      if (tr.prog < 1) {
        tr.prog += tr.spd;
        const p = tr.prog;
        tr.x = tr.sx + (tr.ex - tr.sx) * p;
        tr.y = tr.sy + (tr.ey - tr.sy) * p + Math.sin(p * Math.PI) * tr.arc;
        tr.trail.push([tr.x, tr.y]);
        if (tr.trail.length > tr.maxTrail) tr.trail.shift();
      } else {
        tr.trail.shift();
        if (!tr.trail.length) travellers.splice(i, 1);
      }
    }
  }

  function drawTravellers() {
    travellers.forEach(tr => {
      if (tr.trail.length < 2) return;
      for (let i = 1; i < tr.trail.length; i++) {
        const p = i / tr.trail.length;
        const [x1,y1] = tr.trail[i-1], [x2,y2] = tr.trail[i];
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
        ctx.strokeStyle = `rgba(${tr.col},${p * .28})`;
        ctx.lineWidth   = p * 1.4; ctx.stroke();
      }
      if (tr.prog < 1) {
        const rg = ctx.createRadialGradient(tr.x, tr.y, 0, tr.x, tr.y, 8);
        rg.addColorStop(0, `rgba(${tr.col},.8)`);
        rg.addColorStop(1, `rgba(${tr.col},0)`);
        ctx.beginPath(); ctx.arc(tr.x, tr.y, 8, 0, 6.283);
        ctx.fillStyle = rg; ctx.fill();
        ctx.beginPath(); ctx.arc(tr.x, tr.y, 2, 0, 6.283);
        ctx.fillStyle = 'rgba(255,255,255,.85)';
        ctx.shadowBlur = 14; ctx.shadowColor = `rgba(${tr.col},1)`;
        ctx.fill(); ctx.shadowBlur = 0;
      }
    });
  }

  function buildStars() {
    const n = Math.min(55, (W * H / 16000) | 0);
    stars = [];
    for (let i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * .9 + .2,
        a: Math.random() * .22 + .05,
        ph: Math.random() * 6.28,
        sp: Math.random() * .4 + .1,
      });
    }
  }

  function resize() {
    W = c.width  = c.offsetWidth;
    H = c.height = c.offsetHeight;
    buildStars();
  }

  function draw(now) {
    ctx.clearRect(0, 0, W, H);
    t += .007;

    /* Stars */
    stars.forEach(s => {
      const a = s.a * (.5 + .5 * Math.sin(t * s.sp + s.ph));
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283);
      ctx.fillStyle = `rgba(175,210,255,${a})`; ctx.fill();
    });

    /* Nebula glow */
    const ng = ctx.createRadialGradient(W*.75, H*.2, 0, W*.75, H*.2, W*.35);
    ng.addColorStop(0, 'rgba(18,50,125,.08)');
    ng.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = ng; ctx.fillRect(0, 0, W, H);

    const ng2 = ctx.createRadialGradient(W*.18, H*.8, 0, W*.18, H*.8, W*.25);
    ng2.addColorStop(0, 'rgba(10,35,90,.06)');
    ng2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = ng2; ctx.fillRect(0, 0, W, H);

    /* Sine waves */
    WV.forEach(w => {
      ctx.beginPath();
      for (let x = 0; x <= W; x += 4) {
        const y = H * w.yr + Math.sin(x * w.f + t * w.s) * w.a;
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.strokeStyle = `rgba(27,112,187,${w.op})`;
      ctx.lineWidth   = 1.4;
      ctx.shadowBlur  = 14;
      ctx.shadowColor = `rgba(27,112,187,${w.op * 3})`;
      ctx.stroke(); ctx.shadowBlur = 0;
    });

    updateTravellers(now); drawTravellers();
    updateShooters(now);   drawShooters();

    requestAnimationFrame(draw);
  }

  /* Only boot when footer enters the viewport */
  const io = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting || started) return;
    started = true;
    io.disconnect();
    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(draw);
  }, { threshold: 0.05 });

  io.observe(c.closest('.footer') || c);
}

/* ═══════════════════════════════════════════════════════
   TESTIMONIAL SLIDER
   Auto-advances every 5s · touch swipe · dot nav
═══════════════════════════════════════════════════════ */
function initTestimonials() {
  const track = document.getElementById('testiTrack');
  const dots  = document.querySelectorAll('.testi-dot');
  if (!track || !dots.length) return;

  const total = track.querySelectorAll('.testi-slide').length;
  let cur = 0, timer;

  function goTo(idx) {
    cur = (idx + total) % total;
    gsap.to(track, { x: `-${cur * 100}%`, duration: .7, ease: 'power3.inOut' });
    dots.forEach((d, i) => d.classList.toggle('active', i === cur));
  }

  function play() {
    clearInterval(timer);
    timer = setInterval(() => goTo(cur + 1), 5200);
  }

  dots.forEach(d => {
    d.addEventListener('click', () => { goTo(+d.dataset.idx); play(); });
  });

  /* Touch swipe */
  let sx = 0;
  track.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const diff = sx - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 48) goTo(diff > 0 ? cur + 1 : cur - 1);
    play();
  }, { passive: true });

  /* Pause on hover */
  track.addEventListener('mouseenter', () => clearInterval(timer));
  track.addEventListener('mouseleave', play);

  play();
}

/* ═══════════════════════════════════════════════════════
   NAVBAR — scroll state
═══════════════════════════════════════════════════════ */
(function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
})();

/* ═══════════════════════════════════════════════════════
   MOBILE MENU
═══════════════════════════════════════════════════════ */
(function initMobileMenu() {
  const hbg  = document.getElementById('hbg');
  const mm   = document.getElementById('mmenu');
  if (!hbg || !mm) return;

  const links = mm.querySelectorAll('.mm-link');
  const foot  = mm.querySelector('.mm-foot');
  let isOpen  = false;

  function openMenu() {
    isOpen = true;
    hbg.classList.add('open');
    hbg.setAttribute('aria-expanded', 'true');
    mm.classList.add('open');
    document.body.style.overflow = 'hidden';
    gsap.to(links, { opacity: 1, y: 0, duration: .55, stagger: .07, ease: 'power3.out', delay: .3 });
    gsap.to(foot,  { opacity: 1, y: 0, duration: .5,  ease: 'power3.out', delay: .58 });
  }

  function closeMenu() {
    isOpen = false;
    hbg.classList.remove('open');
    hbg.setAttribute('aria-expanded', 'false');
    mm.classList.remove('open');
    document.body.style.overflow = '';
    gsap.set(links, { opacity: 0, y: 24 });
    gsap.set(foot,  { opacity: 0, y: 12 });
  }

  hbg.addEventListener('click', () => isOpen ? closeMenu() : openMenu());
  links.forEach(l => l.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) closeMenu(); });
})();

/* ═══════════════════════════════════════════════════════
   NAV — letter scramble hover
═══════════════════════════════════════════════════════ */
(function initScramble() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  document.querySelectorAll('.navlink').forEach(el => {
    const orig = el.textContent.trim();
    let raf, frame;
    el.addEventListener('mouseenter', () => {
      cancelAnimationFrame(raf);
      frame = 0;
      (function loop() {
        const p = frame / 10;
        el.textContent = orig.split('').map((c, i) => {
          if (c === ' ') return ' ';
          if (i < p * orig.length) return orig[i];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('');
        frame++;
        if (frame <= 12) raf = requestAnimationFrame(loop);
        else el.textContent = orig;
      })();
    });
    el.addEventListener('mouseleave', () => { cancelAnimationFrame(raf); el.textContent = orig; });
  });
})();
