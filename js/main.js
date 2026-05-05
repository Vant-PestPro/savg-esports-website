/* ============================================================
   SΛVG ESPORTS — Main JS | savgesports.com
   ============================================================ */
'use strict';

/* ── Particle Network ── */
class ParticleNetwork {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: -9999, y: -9999 };
    this.raf = null;

    this._onResize = () => { this.resize(); this.init(); };
    this._onMove   = e => {
      const r = canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - r.left;
      this.mouse.y = e.clientY - r.top;
    };
    this._onLeave  = () => { this.mouse.x = -9999; this.mouse.y = -9999; };

    window.addEventListener('resize', this._onResize, { passive: true });
    canvas.addEventListener('mousemove', this._onMove, { passive: true });
    canvas.addEventListener('mouseleave', this._onLeave);

    this.resize();
    this.init();
  }

  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    const n = Math.min(Math.floor(this.canvas.width * this.canvas.height / 9000), 120);
    this.particles = Array.from({ length: n }, () => ({
      x:  Math.random() * this.canvas.width,
      y:  Math.random() * this.canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r:  Math.random() * 1.2 + 0.4,
      a:  Math.random() * 0.3 + 0.1,
    }));
  }

  draw() {
    const { ctx, canvas, particles, mouse } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const L = 140, ML = 180;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < L * L) {
          ctx.strokeStyle = `rgba(37,99,235,${(1 - Math.sqrt(d2) / L) * 0.1})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }

      const mx = p.x - mouse.x, my = p.y - mouse.y;
      const md2 = mx * mx + my * my;
      if (md2 < ML * ML) {
        ctx.strokeStyle = `rgba(6,182,212,${(1 - Math.sqrt(md2) / ML) * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(37,99,235,${p.a})`;
      ctx.fill();

      p.x += p.vx; p.y += p.vy;
      if (p.x <= 0 || p.x >= canvas.width)  p.vx *= -1;
      if (p.y <= 0 || p.y >= canvas.height) p.vy *= -1;
    }

    this.raf = requestAnimationFrame(() => this.draw());
  }

  start() { this.draw(); }
  destroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this._onResize);
  }
}

/* ── Init particles ── */
const particleCanvas = document.getElementById('particles');
if (particleCanvas) {
  const pn = new ParticleNetwork(particleCanvas);
  pn.start();
}

/* ── Nav scroll ── */
const nav = document.getElementById('nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── Mobile burger ── */
const burger   = document.getElementById('burger');
const navLinks = document.querySelector('.nav-links');
if (burger && navLinks) {
  burger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
  document.addEventListener('click', e => {
    if (nav && !nav.contains(e.target)) {
      navLinks.classList.remove('open');
      burger.classList.remove('open');
    }
  });
}

/* ── Scroll reveal ── */
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  revealEls.forEach(el => io.observe(el));
}

/* ── Smooth anchor scroll ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) {
      e.preventDefault();
      const off = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - off - 16, behavior: 'smooth' });
    }
  });
});

/* ── Apply page: track selector ── */
const tracks = document.querySelectorAll('.track-option');
const trackSections = document.querySelectorAll('.track-section');
if (tracks.length) {
  tracks.forEach(btn => {
    btn.addEventListener('click', () => {
      tracks.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      const target = btn.dataset.track;
      trackSections.forEach(s => {
        s.style.display = (s.dataset.track === target || s.dataset.track === 'all') ? 'block' : 'none';
      });
    });
  });
  if (tracks[0]) tracks[0].click();
}
