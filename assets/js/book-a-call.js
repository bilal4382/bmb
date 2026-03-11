'use strict';

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════
   NOISE CANVAS
═══════════════════════════════════════════════════════ */
function initBacNoise() {
  const c = document.getElementById('bacNoise');
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
    setTimeout(() => requestAnimationFrame(draw), 80);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
}

/* ═══════════════════════════════════════════════════════
   COSMIC BG — hero canvas
═══════════════════════════════════════════════════════ */
function initBacBg() {
  const c = document.getElementById('bacBg');
  if (!c) return;
  const ctx = c.getContext('2d');
  let W, H, t = 0, stars = [];

  const WV = [
    { yr: .30, a: 80,  f: .0058, s:  .22, op: .052 },
    { yr: .42, a: 55,  f: .0082, s: -.16, op: .038 },
    { yr: .54, a: 92,  f: .0044, s:  .18, op: .048 },
    { yr: .24, a: 38,  f: .0118, s:  .40, op: .026 },
    { yr: .64, a: 65,  f: .0066, s: -.23, op: .036 },
  ];

  const shooters = [];
  let nextShootAt = 0;

  function spawnShooter(now) {
    if (now < nextShootAt) return;
    nextShootAt = now + 3000 + Math.random() * 6000;
    const fromTop = Math.random() < .65;
    const sx  = fromTop ? Math.random() * W * .85 : W + 10;
    const sy  = fromTop ? -10 : Math.random() * H * .45;
    const spd = 9 + Math.random() * 9;
    const ang = fromTop ? (.28 + Math.random() * .55) * Math.PI : Math.PI + (Math.random() - .5) * .5;
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
        const [x1,y1] = s.trail[i-1]; const [x2,y2] = s.trail[i];
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
        ctx.strokeStyle = `rgba(${s.col},${p*.8})`; ctx.lineWidth = p*2.2; ctx.stroke();
      }
      if (!s.done) {
        const [hx,hy] = s.trail[s.trail.length-1];
        ctx.beginPath(); ctx.arc(hx,hy,2.2,0,6.283);
        ctx.fillStyle = 'rgba(255,255,255,.95)';
        ctx.shadowBlur = 14; ctx.shadowColor = `rgba(${s.col},1)`; ctx.fill(); ctx.shadowBlur = 0;
      }
    });
  }

  function buildStars() {
    const n = Math.min(70, (W * H / 14000) | 0);
    stars = [];
    for (let i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * W, y: Math.random() * H * .72,
        r: Math.random() * 1.1 + .2,
        a: Math.random() * .28 + .06,
        ph: Math.random() * 6.28, sp: Math.random() * .45 + .15,
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

    stars.forEach(s => {
      const a = s.a * (.5 + .5 * Math.sin(t * s.sp + s.ph));
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283);
      ctx.fillStyle = `rgba(185,215,255,${a})`; ctx.fill();
    });

    const ng = ctx.createRadialGradient(W*.70, H*.14, 0, W*.70, H*.14, W*.40);
    ng.addColorStop(0, 'rgba(18,50,125,.10)');
    ng.addColorStop(.55,'rgba(8,25,75,.04)');
    ng.addColorStop(1,  'rgba(0,0,0,0)');
    ctx.fillStyle = ng; ctx.fillRect(0, 0, W, H);

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
      ctx.stroke(); ctx.shadowBlur = 0;
    });

    updateShooters(now); drawShooters();
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
  let mx = -300, my = -300, rx = -300, ry = -300;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  });
  (function loop() {
    rx += (mx - rx) * .12; ry += (my - ry) * .12;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(loop);
  })();
  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
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
  const hbg  = document.getElementById('hbg');
  const mm   = document.getElementById('mmenu');
  if (!hbg || !mm) return;
  const links = mm.querySelectorAll('.mm-link');
  const foot  = mm.querySelector('.mm-foot');
  let isOpen  = false;

  function openMenu() {
    isOpen = true; hbg.classList.add('open'); hbg.setAttribute('aria-expanded','true');
    mm.classList.add('open'); document.body.style.overflow = 'hidden';
    gsap.to(links, { opacity:1, y:0, duration:.55, stagger:.07, ease:'power3.out', delay:.3 });
    gsap.to(foot,  { opacity:1, y:0, duration:.5,  ease:'power3.out', delay:.58 });
  }
  function closeMenu() {
    isOpen = false; hbg.classList.remove('open'); hbg.setAttribute('aria-expanded','false');
    mm.classList.remove('open'); document.body.style.overflow = '';
    gsap.set(links, { opacity:0, y:24 }); gsap.set(foot, { opacity:0, y:12 });
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
      cancelAnimationFrame(raf); frame = 0;
      (function loop() {
        const p = frame / 10;
        el.textContent = orig.split('').map((c,i) => {
          if (c === ' ') return ' ';
          if (i < p * orig.length) return orig[i];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('');
        frame++;
        if (frame <= 12) raf = requestAnimationFrame(loop); else el.textContent = orig;
      })();
    });
    el.addEventListener('mouseleave', () => { cancelAnimationFrame(raf); el.textContent = orig; });
  });
})();

/* ═══════════════════════════════════════════════════════
   MAGNETIC BUTTONS
═══════════════════════════════════════════════════════ */
function initMagnetic() {
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x:(e.clientX - r.left - r.width/2)*.35, y:(e.clientY - r.top - r.height/2)*.35, duration:.4, ease:'power2.out' });
    });
    el.addEventListener('mouseleave', () => { gsap.to(el, { x:0, y:0, duration:.7, ease:'elastic.out(1,.5)' }); });
  });
}

/* ═══════════════════════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════════════════════ */
function initReveal() {
  const singles = document.querySelectorAll('[data-reveal]');
  gsap.set(singles, { opacity:0, y:44 });
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      gsap.to(en.target, { opacity:1, y:0, duration:.75, ease:'power3.out', delay: parseFloat(en.target.dataset.revealDelay||0) });
    });
  }, { threshold: .18 });
  singles.forEach(el => io.observe(el));
}

/* ═══════════════════════════════════════════════════════
   FOOTER BG
═══════════════════════════════════════════════════════ */
function initFooterBg() {
  const c = document.getElementById('footerCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  let W, H, t = 0, stars = [], started = false;
  const WV = [
    { yr:.25, a:40, f:.006,  s: .18, op:.045 },
    { yr:.55, a:60, f:.0045, s:-.13, op:.038 },
    { yr:.75, a:28, f:.009,  s: .28, op:.028 },
    { yr:.40, a:50, f:.0072, s:-.20, op:.032 },
  ];

  function buildStars() {
    const n = Math.min(55, (W*H/16000)|0); stars = [];
    for (let i = 0; i < n; i++) stars.push({ x:Math.random()*W, y:Math.random()*H, r:Math.random()*.9+.2, a:Math.random()*.22+.05, ph:Math.random()*6.28, sp:Math.random()*.4+.1 });
  }
  function resize() { W = c.width = c.offsetWidth; H = c.height = c.offsetHeight; buildStars(); }
  function draw(now) {
    ctx.clearRect(0,0,W,H); t += .007;
    stars.forEach(s => { const a = s.a*(.5+.5*Math.sin(t*s.sp+s.ph)); ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,6.283); ctx.fillStyle=`rgba(175,210,255,${a})`; ctx.fill(); });
    const ng = ctx.createRadialGradient(W*.75,H*.2,0,W*.75,H*.2,W*.35); ng.addColorStop(0,'rgba(18,50,125,.08)'); ng.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=ng; ctx.fillRect(0,0,W,H);
    WV.forEach(w => { ctx.beginPath(); for (let x=0;x<=W;x+=4){const y=H*w.yr+Math.sin(x*w.f+t*w.s)*w.a; x?ctx.lineTo(x,y):ctx.moveTo(x,y);} ctx.strokeStyle=`rgba(27,112,187,${w.op})`; ctx.lineWidth=1.4; ctx.shadowBlur=14; ctx.shadowColor=`rgba(27,112,187,${w.op*3})`; ctx.stroke(); ctx.shadowBlur=0; });
    requestAnimationFrame(draw);
  }
  const io = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting || started) return;
    started = true; io.disconnect(); resize(); window.addEventListener('resize', resize); requestAnimationFrame(draw);
  }, { threshold: 0.05 });
  io.observe(c.closest('.footer') || c);
}

/* ═══════════════════════════════════════════════════════
   HERO STAT COUNTERS
═══════════════════════════════════════════════════════ */
function animHeroCounters() {
  document.querySelectorAll('.hcount').forEach(el => {
    const target = parseInt(el.dataset.t, 10);
    const dur    = 2400;
    let start    = null;
    function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / dur, 1);
      const eased    = 1 - Math.pow(1 - progress, 4);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  });
}

/* ═══════════════════════════════════════════════════════
   HERO ENTRANCE
═══════════════════════════════════════════════════════ */
function revealBacHero() {
  const words = document.querySelectorAll('.h1w');
  const sub   = document.getElementById('bacSub');
  const stats = document.getElementById('bacStats');

  gsap.from('#nav', { y:-28, opacity:0, duration:.9, ease:'power3.out', delay:.1 });

  const tl = gsap.timeline({ defaults: { ease:'power3.out' } });
  tl
    .to(words, { y:'0%', duration:.85, stagger:.14, ease:'power4.out' })
    .to(sub,   { opacity:1, y:0, duration:.65 }, '-=.4')
    .to(stats, { opacity:1, y:0, duration:.55 }, '-=.35')
    .call(animHeroCounters, [], '-=.5');

  initReveal();
  initFooterBg();
}

/* ═══════════════════════════════════════════════════════
   BOOT
═══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
  initBacNoise();
  initBacBg();
  initMagnetic();
  revealBacHero();
});
