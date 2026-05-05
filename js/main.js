/* ============================================================
   SAVG ESPORTS -- Main JS | savgesports.com
   ============================================================ */
'use strict';

/* -- Nav scroll -- */
const nav = document.getElementById('nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* -- Mobile burger -- */
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

/* -- Scroll reveal -- */
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  revealEls.forEach(el => io.observe(el));
}

/* -- Smooth anchor scroll -- */
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

/* -- Apply page: track selector -- */
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

/* -- Merch: size button selector -- */
document.querySelectorAll('.size-selector').forEach(group => {
  group.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      group.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  const first = group.querySelector('.size-btn');
  if (first) first.classList.add('active');
});
