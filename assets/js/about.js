/* ═══════════════════════════════════════════════════════
   BEAR MY BRAND — about.js
   Self-contained — all functions duplicated from main.js,
   targeting about-page-specific element IDs.
   Sections: noise · cosmic bg · cursor · nav · magnetic ·
             reveal · counters · footer bg · hero reveal · loader
═══════════════════════════════════════════════════════ */
'use strict';

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════
   NOISE CANVAS  (throttled to ~12fps)
   Targets #abtNoise
═══════════════════════════════════════════════════════ */
function initAbtNoise() {
  const c = document.getElementById('abtNoise');
  if (!c) return;
  const ctx = c.getContext('2d');
  let w, h, img, d;

  function resize() {
    w   = c.width  = c.offsetWidth;
    h   = c.height = c.offsetHeight;
    img = ctx.createImageData(w, h);
    d   = img.data;
  }

  function draw() {
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.random() * 255 | 0;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    setTimeout(() => requestAnimationFrame(draw), 80); // ~12fps
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
}

/* ═══════════════════════════════════════════════════════
   COSMIC WAVE BACKGROUND — shared engine
   Used by hero canvas (#abtBg) AND origin card canvas
   Sine waves · stars · nebula · shooting stars · travellers
═══════════════════════════════════════════════════════ */
function initCosmicBg(canvasId) {
  const c = document.getElementById(canvasId);
  if (!c) return;
  const ctx = c.getContext('2d');
  let W, H, t = 0, stars = [];

  /* Wave definitions: yRatio, amplitude, frequency, speed, opacity */
  const WV = [
    { yr: .30, a: 80,  f: .0058, s:  .22, op: .052 },
    { yr: .42, a: 55,  f: .0082, s: -.16, op: .038 },
    { yr: .54, a: 92,  f: .0044, s:  .18, op: .048 },
    { yr: .24, a: 38,  f: .0118, s:  .40, op: .026 },
    { yr: .64, a: 65,  f: .0066, s: -.23, op: .036 },
    { yr: .18, a: 28,  f: .0140, s:  .55, op: .018 },
  ];

  /* ── Shooting stars ─────────────────────────────────── */
  const shooters = [];
  let nextShootAt = 0;

  function spawnShooter(now) {
    if (now < nextShootAt) return;
    nextShootAt = now + 2800 + Math.random() * 5000;

    const fromTop = Math.random() < .65;
    const sx  = fromTop ? Math.random() * W * .85 : W + 10;
    const sy  = fromTop ? -10 : Math.random() * H * .45;
    const spd = 9 + Math.random() * 9;
    const ang = fromTop
      ? (.28 + Math.random() * .55) * Math.PI
      : Math.PI + (Math.random() - .5) * .5;

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

  /* ── Cosmic travellers ──────────────────────────────── */
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
      arc : (Math.random() - .5) * H * .18,
      trail   : [],
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
      if (tr.prog < 1) {
        const hg = ctx.createRadialGradient(tr.x, tr.y, 0, tr.x, tr.y, 10);
        hg.addColorStop(0,  `rgba(${tr.col},.9)`);
        hg.addColorStop(.4, `rgba(${tr.col},.3)`);
        hg.addColorStop(1,  `rgba(${tr.col},0)`);
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

  /* ── Stars ─────────────────────────────────────────── */
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
        sp: Math.random() * .45 + .15,
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

    /* Twinkling stars */
    stars.forEach(s => {
      const a = s.a * (.5 + .5 * Math.sin(t * s.sp + s.ph));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, 6.283);
      ctx.fillStyle = `rgba(185,215,255,${a})`;
      ctx.fill();
    });

    /* Nebula glow — upper-right */
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

    /* Sine wave layers */
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

    /* Cosmic travellers & shooting stars */
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

function initAbtBg()        { initCosmicBg('abtBg'); }
function initOriginCardBg() { initCosmicBg('originCardCanvas'); }

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

  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });
})();

/* ═══════════════════════════════════════════════════════
   NAV — scroll state
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
  const hbg   = document.getElementById('hbg');
  const mm    = document.getElementById('mmenu');
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
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });
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

    el.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf);
      el.textContent = orig;
    });
  });
})();

/* ═══════════════════════════════════════════════════════
   MAGNETIC BUTTONS
═══════════════════════════════════════════════════════ */
function initMagnetic() {
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      gsap.to(el, {
        x: (e.clientX - r.left - r.width  / 2) * .35,
        y: (e.clientY - r.top  - r.height / 2) * .35,
        duration: .4,
        ease: 'power2.out',
      });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1,.5)' });
    });
  });
}

/* ═══════════════════════════════════════════════════════
   SCROLL REVEAL
   data-reveal           → single element fade + rise
   data-reveal-stagger   → parent that triggers children
   data-reveal-child     → child inside stagger parent
═══════════════════════════════════════════════════════ */
function initReveal() {
  const EASE_OUT  = 'power3.out';
  const EASE_SOFT = 'power2.out';

  /* Single-element reveals */
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

  /* Stagger groups */
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

  /* Section eyebrows / lines */
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
}

/* ═══════════════════════════════════════════════════════
   MANIFESTO IN-VIEW — adds .in-view class when section
   enters viewport to trigger CSS clip-path animation
═══════════════════════════════════════════════════════ */
function initManifestoReveal() {
  const section = document.getElementById('abtManifesto');
  if (!section) return;

  const lines  = section.querySelectorAll('.mf-typed-line');
  const cursor = section.querySelector('.mf-cursor');

  /* Type one line character by character, then move to next */
  function typeLine(el, text, i, onDone) {
    if (i > text.length) {
      setTimeout(onDone, 220);
      return;
    }
    el.textContent = text.slice(0, i);
    /* Slight random jitter for human-feel */
    const delay = 28 + Math.random() * 24;
    setTimeout(() => typeLine(el, text, i + 1, onDone), delay);
  }

  function typeAll(index) {
    if (index >= lines.length) {
      /* Blink cursor a couple times then hide */
      setTimeout(() => { if (cursor) cursor.style.display = 'none'; }, 1200);
      return;
    }
    typeLine(lines[index], lines[index].dataset.text, 0, () => typeAll(index + 1));
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      en.target.classList.add('in-view');
      typeAll(0);
    });
  }, { threshold: .25 });

  io.observe(section);
}

/* ═══════════════════════════════════════════════════════
   COUNTER ANIMATION — RAF-based, power4 ease-out
   Targets .acount elements (data-t attribute)
═══════════════════════════════════════════════════════ */
function animAbtCounters() {
  document.querySelectorAll('.acount').forEach(el => {
    const target = parseInt(el.dataset.t, 10);
    const dur    = 2400; // ms
    let start    = null;

    function step(ts) {
      if (!start) start = ts;
      const elapsed  = ts - start;
      const progress = Math.min(elapsed / dur, 1);
      /* Power-4 ease-out */
      const eased    = 1 - Math.pow(1 - progress, 4);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }

    requestAnimationFrame(step);
  });
}

/* ═══════════════════════════════════════════════════════
   STATS SECTION — fire counters when strip enters view
═══════════════════════════════════════════════════════ */
function initAbtCounters() {
  const strip = document.getElementById('abtStats');
  if (!strip) return;

  let fired = false;
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting || fired) return;
      fired = true;
      io.disconnect();
      animAbtCounters();
    });
  }, { threshold: .3 });

  io.observe(strip);
}

/* ═══════════════════════════════════════════════════════
   FOOTER COSMIC BACKGROUND
   4 sine wave layers · 55 twinkling stars · 2 nebula glows
   Shooting stars · 1 cosmic traveller
   Lazy-started via IntersectionObserver
═══════════════════════════════════════════════════════ */
function initFooterBg() {
  const c = document.getElementById('footerCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  let W, H, t = 0, stars = [], started = false;

  /* Calmer wave layers than the hero */
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
    const sx  = fromTop ? Math.random() * W * .8 : W + 10;
    const sy  = fromTop ? -10 : Math.random() * H * .5;
    const spd = 7 + Math.random() * 8;
    const ang = fromTop
      ? (.3 + Math.random() * .5) * Math.PI
      : Math.PI + (Math.random() - .5) * .4;

    shooters.push({
      x: sx, y: sy,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd,
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
        const [x1, y1] = s.trail[i - 1];
        const [x2, y2] = s.trail[i];
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(${s.col},${p * .7})`;
        ctx.lineWidth   = p * 1.8;
        ctx.stroke();
      }
      if (!s.done) {
        const [hx, hy] = s.trail[s.trail.length - 1];
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
      sx, sy, ex, ey, x: sx, y: sy,
      prog: 0,
      spd : .0004 + Math.random() * .0007,
      arc : (Math.random() - .5) * H * .14,
      trail   : [],
      maxTrail: 80,
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
        const [x1, y1] = tr.trail[i - 1];
        const [x2, y2] = tr.trail[i];
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(${tr.col},${p * .28})`;
        ctx.lineWidth   = p * 1.4;
        ctx.stroke();
      }
      if (tr.prog < 1) {
        const rg = ctx.createRadialGradient(tr.x, tr.y, 0, tr.x, tr.y, 8);
        rg.addColorStop(0, `rgba(${tr.col},.8)`);
        rg.addColorStop(1, `rgba(${tr.col},0)`);
        ctx.beginPath(); ctx.arc(tr.x, tr.y, 8, 0, 6.283);
        ctx.fillStyle = rg; ctx.fill();

        ctx.beginPath(); ctx.arc(tr.x, tr.y, 2, 0, 6.283);
        ctx.fillStyle   = 'rgba(255,255,255,.85)';
        ctx.shadowBlur  = 14;
        ctx.shadowColor = `rgba(${tr.col},1)`;
        ctx.fill(); ctx.shadowBlur = 0;
      }
    });
  }

  /* 55 twinkling stars */
  function buildStars() {
    const n = Math.min(55, (W * H / 16000) | 0);
    stars = [];
    for (let i = 0; i < n; i++) {
      stars.push({
        x : Math.random() * W,
        y : Math.random() * H,
        r : Math.random() * .9 + .2,
        a : Math.random() * .22 + .05,
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

    /* Nebula glow 1 — upper-right */
    const ng = ctx.createRadialGradient(W * .75, H * .2, 0, W * .75, H * .2, W * .35);
    ng.addColorStop(0, 'rgba(18,50,125,.08)');
    ng.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = ng; ctx.fillRect(0, 0, W, H);

    /* Nebula glow 2 — lower-left */
    const ng2 = ctx.createRadialGradient(W * .18, H * .8, 0, W * .18, H * .8, W * .25);
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
   HERO STAT COUNTERS — RAF-based, power4 ease-out
═══════════════════════════════════════════════════════ */
function animHeroCounters() {
  document.querySelectorAll('.hcount').forEach(el => {
    const target = parseInt(el.dataset.t, 10);
    const dur    = 2400;
    let start    = null;

    function step(ts) {
      if (!start) start = ts;
      const elapsed  = ts - start;
      const progress = Math.min(elapsed / dur, 1);
      const eased    = 1 - Math.pow(1 - progress, 4);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }

    requestAnimationFrame(step);
  });
}

/* ═══════════════════════════════════════════════════════
   HERO ENTRANCE ANIMATIONS
   Runs after loader exits
═══════════════════════════════════════════════════════ */
function revealAbtHero() {
  const words  = document.querySelectorAll('.h1w');
  const info   = document.getElementById('abtInfo');
  const stats  = document.getElementById('abtInfo2');

  /* Navbar slides in from top */
  gsap.from('#nav', { y: -28, opacity: 0, duration: .9, ease: 'power3.out', delay: .1 });

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl
    .to(words,  { y: '0%', duration: .85, stagger: .14, ease: 'power4.out' })
    .to(info,   { opacity: 1, x: 0,  duration: .65 }, '-=.4')
    .to(stats,  { opacity: 1, y: 0,  duration: .55 }, '-=.35')
    .call(animHeroCounters, [], '-=.5');

  /* Init all scroll-driven systems */
  initReveal();
  initManifestoReveal();
  initAbtCounters();
  initFooterBg();
}

/* ═══════════════════════════════════════════════════════
   BOOT — no preloader, init everything on DOM ready
═══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
  initAbtNoise();
  initAbtBg();
  initOriginCardBg();
  initMagnetic();
  revealAbtHero();
});
