/* ========================================
   Main JS — Nav, Scroll, Shared Logic
   Enterprise-level interactions
======================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initScrollProgress();
  initScrollReveal();
  initAccordion();
  initTabs();
  initCounters();
  initStatBars();
  initInterviewCarousel();
});

/* ---- Navigation ---- */
function initNav() {
  const nav = document.querySelector('.nav');
  const hamburger = document.querySelector('.nav__hamburger');
  const drawer = document.querySelector('.nav__drawer');
  const overlay = document.querySelector('.nav__drawer-overlay');

  if (!nav) return;

  // Scroll effect
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  // Mobile menu
  if (hamburger && drawer && overlay) {
    hamburger.addEventListener('click', () => {
      const isOpen = drawer.classList.contains('open');
      hamburger.classList.toggle('open');
      drawer.classList.toggle('open');
      overlay.classList.toggle('open');
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    overlay.addEventListener('click', () => {
      hamburger.classList.remove('open');
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    });

    // Close on link click
    drawer.querySelectorAll('.nav__drawer-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        drawer.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // Active link
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav__link, .nav__drawer-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath.endsWith('/') && href === 'index.html') ||
        currentPath.endsWith(href)) {
      link.classList.add('active');
    }
  });
}

/* ---- Scroll Progress Bar ---- */
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  Object.assign(bar.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    height: '3px',
    width: '0%',
    background: 'var(--primary)',
    zIndex: '1001',
    transition: 'width 50ms linear',
    borderRadius: '0 2px 2px 0'
  });
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = progress + '%';
  }, { passive: true });
}

/* ---- Scroll Reveal (IntersectionObserver) ---- */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.reveal, .reveal-stagger, .reveal-fade, .reveal-scale, .reveal-left, .reveal-right').forEach(el => {
    observer.observe(el);
  });
}

/* ---- Accordion ---- */
function initAccordion() {
  document.querySelectorAll('.accordion__trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion__item');
      const content = item.querySelector('.accordion__content');
      const isOpen = item.classList.contains('open');

      // Close all accordion items in the same group
      const group = item.closest('.accordion');
      if (group) {
        group.querySelectorAll('.accordion__item.open').forEach(openItem => {
          if (openItem !== item) {
            openItem.classList.remove('open');
            openItem.querySelector('.accordion__content').style.maxHeight = '0';
          }
        });
      }

      // Toggle current
      item.classList.toggle('open');
      if (isOpen) {
        content.style.maxHeight = '0';
      } else {
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
}

/* ---- Tabs ---- */
function initTabs() {
  document.querySelectorAll('.tabs').forEach(tabContainer => {
    const tabs = tabContainer.querySelectorAll('.tab');
    const panelContainer = tabContainer.nextElementSibling?.closest('.tab-panels') ||
                           document.querySelector('.tab-panels');

    if (!panelContainer) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;

        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        panelContainer.querySelectorAll('.tab-panel').forEach(panel => {
          panel.classList.toggle('active', panel.dataset.panel === target);
        });
      });
    });
  });
}

/* ---- Animated Counters (spring easing) ---- */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        animateCount(el, 0, target, 1800, suffix);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

function animateCount(el, start, end, duration, suffix) {
  const range = end - start;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Spring-like ease out
    const eased = 1 - Math.pow(1 - progress, 4);
    const current = Math.floor(start + range * eased);
    el.textContent = current + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/* ---- Stat Bar Animation ---- */
function initStatBars() {
  const bars = document.querySelectorAll('.stat__bar-fill[data-width]');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        bar.style.width = bar.dataset.width + '%';
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.5 });

  bars.forEach(bar => observer.observe(bar));
}

/* ---- Interview Carousel Auto-Scroll ---- */
function initInterviewCarousel() {
  const carousel = document.querySelector('.interview-carousel');
  if (!carousel) return;

  const cards = carousel.querySelectorAll('.interview-card');
  if (cards.length <= 1) return;

  let currentIndex = 0;
  let autoScrollInterval = null;
  let isScrolling = false;

  function getCardWidth() {
    if (cards.length === 0) return 340;
    const card = cards[0];
    const cardStyle = getComputedStyle(card);
    const gap = parseInt(getComputedStyle(carousel).gap) || 24;
    return card.offsetWidth + gap;
  }

  function scrollToIndex(index) {
    if (isScrolling) return;
    isScrolling = true;
    const cardWidth = getCardWidth();
    const scrollPosition = index * cardWidth;
    
    carousel.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });

    setTimeout(() => {
      isScrolling = false;
    }, 500);
  }

  function nextSlide() {
    if (isScrolling) return;
    currentIndex = (currentIndex + 1) % cards.length;
    scrollToIndex(currentIndex);
    
    // Loop back to start seamlessly
    if (currentIndex === 0) {
      setTimeout(() => {
        carousel.scrollTo({ left: 0, behavior: 'auto' });
      }, 300);
    }
  }

  function startAutoScroll() {
    if (autoScrollInterval) return;
    autoScrollInterval = setInterval(nextSlide, 3000);
  }

  function stopAutoScroll() {
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      autoScrollInterval = null;
    }
  }

  // Start auto-scroll after initial load
  setTimeout(startAutoScroll, 1000);

  // Pause on hover or touch
  carousel.addEventListener('mouseenter', stopAutoScroll);
  carousel.addEventListener('mouseleave', startAutoScroll);
  carousel.addEventListener('touchstart', stopAutoScroll, { passive: true });
  carousel.addEventListener('touchend', () => {
    setTimeout(startAutoScroll, 3000);
  }, { passive: true });

  // Update current index on manual scroll
  let scrollTimeout;
  carousel.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const cardWidth = getCardWidth();
      const scrollLeft = carousel.scrollLeft;
      currentIndex = Math.round(scrollLeft / cardWidth);
    }, 100);
  }, { passive: true });

  // Handle navigation buttons
  const prevBtn = document.querySelector('.carousel-nav__btn[aria-label="前へ"]');
  const nextBtn = document.querySelector('.carousel-nav__btn[aria-label="次へ"]');

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      stopAutoScroll();
      currentIndex = currentIndex > 0 ? currentIndex - 1 : cards.length - 1;
      scrollToIndex(currentIndex);
      setTimeout(startAutoScroll, 3000);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      stopAutoScroll();
      nextSlide();
      setTimeout(startAutoScroll, 3000);
    });
  }

  // Reset on window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      stopAutoScroll();
      const cardWidth = getCardWidth();
      currentIndex = Math.round(carousel.scrollLeft / cardWidth);
      scrollToIndex(currentIndex);
      setTimeout(startAutoScroll, 1000);
    }, 250);
  });
}
