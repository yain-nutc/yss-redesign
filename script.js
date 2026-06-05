/* ====================================================
   script.js — 永興證券 YSS Redesign
   ==================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================
  // 1. NAVBAR — scroll effect + mobile toggle
  // =========================================================
  const navbar    = document.getElementById('navbar');
  const navToggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  navToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    const isOpen = mobileMenu.classList.contains('open');
    navToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
    // Animate hamburger
    const spans = navToggle.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    }
  });

  // Close mobile menu on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
      const spans = navToggle.querySelectorAll('span');
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });

  // =========================================================
  // 2. PARTICLE CANVAS
  // =========================================================
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, particles;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x  = Math.random() * W;
        this.y  = Math.random() * H;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.r  = Math.random() * 1.8 + 0.4;
        this.alpha = Math.random() * 0.5 + 0.1;
        this.color = Math.random() > 0.5
          ? `rgba(212,168,67,${this.alpha})`
          : `rgba(30,144,255,${this.alpha * 0.7})`;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    function initParticles() {
      const count = Math.min(120, Math.floor((W * H) / 12000));
      particles = Array.from({ length: count }, () => new Particle());
    }

    function drawLines() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(212,168,67,${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth   = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });
      drawLines();
      requestAnimationFrame(animate);
    }

    resize();
    initParticles();
    animate();
    window.addEventListener('resize', () => { resize(); initParticles(); }, { passive: true });
  }

  // =========================================================
  // 3. COUNTER ANIMATION (Hero stats)
  // =========================================================
  function animateCounter(el) {
    const target   = +el.dataset.target;
    const duration = 1800;
    const start    = performance.now();
    const ease = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      el.textContent = Math.round(ease(progress) * target);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Trigger counter when hero is visible
  const heroStats = document.querySelectorAll('.stat-num');
  let countersStarted = false;

  const heroObs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !countersStarted) {
      countersStarted = true;
      setTimeout(() => heroStats.forEach(animateCounter), 300);
    }
  });
  const heroEl = document.getElementById('hero');
  if (heroEl) heroObs.observe(heroEl);

  // =========================================================
  // 4. SCROLL REVEAL
  // =========================================================
  const revealTargets = document.querySelectorAll(
    '.quick-card, .news-card, .service-card, .info-card, ' +
    '.sustain-link, .sustain-badge, .info-list-item'
  );

  revealTargets.forEach((el, i) => {
    el.classList.add('reveal');
    // Stagger within parent groups
    const siblings = el.parentElement.children;
    const idx = Array.from(siblings).indexOf(el);
    if (idx < 5) el.classList.add(`reveal-delay-${idx + 1}`);
  });

  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  // Section headers
  document.querySelectorAll('.section-header, .sustain-content, .sustain-visual').forEach(el => {
    el.classList.add('reveal');
    const revObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); revObs.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    revObs.observe(el);
  });

  // =========================================================
  // 5. SCROLL TO TOP BUTTON
  // =========================================================
  const scrollTopBtn = document.getElementById('scroll-top-btn');
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // =========================================================
  // 6. HERO SCROLL INDICATOR
  // =========================================================
  const scrollIndicator = document.getElementById('hero-scroll');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      const quickAccess = document.getElementById('quick-access');
      quickAccess?.scrollIntoView({ behavior: 'smooth' });
    });
    scrollIndicator.style.cursor = 'pointer';
  }

  // =========================================================
  // 7. CURRENT DATE — highlight news items
  // =========================================================
  const today = new Date();
  const threeMonthsAgo = new Date(today);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  document.querySelectorAll('.news-date').forEach(el => {
    const dateText = el.textContent.replace(/[^\d-]/g, '').trim();
    const itemDate = new Date(dateText);
    if (itemDate >= threeMonthsAgo) {
      const badge = el.closest('.news-meta')?.querySelector('.news-badge');
      if (badge) badge.style.animation = 'pulse 3s ease infinite';
    }
  });

  // =========================================================
  // 8. SMOOTH NAV ACTIVE STATE
  // =========================================================
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href === currentPath) {
      link.style.color = 'var(--gold)';
    }
  });

});
