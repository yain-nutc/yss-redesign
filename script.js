/* ====================================================
   script.js — 永興證券 YSS Redesign
   ==================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================
  // 1. 裝置偵測 — 依裝置顯示 App 下載按鈕
  //    · iOS     → 顯示 App Store 按鈕
  //    · Android → 顯示 Google Play 按鈕
  //    · 桌機 PC → 兩個都不顯示
  //
  //  ★ 加強版偵測：同時比對 UA、touch points、platform
  //    解決部分 Android 瀏覽器 UA 未含 "Android" 的誤判
  // =========================================================
  const ua       = (navigator.userAgent || navigator.vendor || window.opera).toLowerCase();
  const platform = (navigator.platform || '').toLowerCase();

  // iOS：iPhone / iPad / iPod（含 iPadOS 13+ 模擬桌機 UA 的特例）
  const isIOS = (
    /iphone|ipad|ipod/.test(ua) ||
    // iPadOS 13+ 的 UA 變成 Mac，但有觸控且 platform 是 MacIntel
    (platform === 'macintel' && navigator.maxTouchPoints > 1)
  );

  // Android：多重判斷
  //  1. UA 含 "android"（大多數情況）
  //  2. UA 含 "linux" + 有觸控 + 非桌機 platform（部分廠牌定製機）
  const isAndroid = (
    /android/.test(ua) ||
    (!isIOS && /linux/.test(platform) && navigator.maxTouchPoints > 0 && !/win|mac/.test(platform))
  );

  const btnIOS     = document.getElementById('btn-ios');
  const btnAndroid = document.getElementById('btn-android');

  if (btnIOS && btnAndroid) {
    if (isIOS) {
      btnIOS.style.display = 'inline-flex';
    } else if (isAndroid) {
      btnAndroid.style.display = 'inline-flex';
    }
    // 桌機：兩個按鈕都保持 display:none
  }

  // =========================================================
  // 2. 手機選單 toggle
  // =========================================================
  const navToggle  = document.getElementById('nav-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');

  if (navToggle && mobileDrawer) {
    navToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);

      // Hamburger → X 動畫
      const spans = navToggle.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.cssText = 'transform:translateY(7px) rotate(45deg)';
        spans[1].style.opacity = '0';
        spans[2].style.cssText = 'transform:translateY(-7px) rotate(-45deg)';
      } else {
        spans.forEach(s => { s.style.cssText = ''; });
      }
    });

    // 點連結後關閉
    mobileDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.querySelectorAll('span').forEach(s => { s.style.cssText = ''; });
      });
    });
  }

  // =========================================================
  // 3. Scroll — 回頂按鈕
  // =========================================================
  const scrollTopBtn = document.getElementById('scroll-top-btn');

  window.addEventListener('scroll', () => {
    if (scrollTopBtn) {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
    }
  }, { passive: true });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // =========================================================
  // 4. Scroll Reveal（fade-up）
  // =========================================================
  const fadeEls = document.querySelectorAll('.fade-up');

  if (fadeEls.length > 0) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    fadeEls.forEach(el => revealObs.observe(el));
  }

  // =========================================================
  // 5. Hero 數字計數動畫
  // =========================================================
  const counters = document.querySelectorAll('.num[data-target]');

  if (counters.length > 0) {
    let started = false;
    const heroEl = document.getElementById('hero');

    const countObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !started) {
        started = true;
        counters.forEach(el => {
          const target   = +el.dataset.target;
          const duration = 1600;
          const startTime = performance.now();

          const easeOut = t => 1 - Math.pow(1 - t, 3);

          function tick(now) {
            const elapsed  = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            el.textContent = Math.round(easeOut(progress) * target);
            if (progress < 1) requestAnimationFrame(tick);
          }
          setTimeout(() => requestAnimationFrame(tick), 200);
        });
      }
    }, { threshold: 0.3 });

    if (heroEl) countObs.observe(heroEl);
  }

  // =========================================================
  // 6. Active nav link（依當前頁面路徑標示）
  // =========================================================
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = (link.getAttribute('href') || '').split('#')[0].split('/').pop();
    if (href && href === currentPage) {
      link.classList.add('active');
    } else if (currentPage === 'index.html' && href === '') {
      link.classList.add('active');
    }
  });

});
