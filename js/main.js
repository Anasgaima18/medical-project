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

/* ---- Interview Carousel: auto-scroll 3s, infinite loop, no scrollbar ---- */
function initInterviewCarousel() {
  document.querySelectorAll('.interview-carousel').forEach((carousel) => {
    initOneInterviewCarousel(carousel);
  });
}

function initOneInterviewCarousel(carousel) {
  if (carousel.dataset.sliderInit === 'true') return;

  const cards = Array.from(carousel.querySelectorAll('.interview-card'));
  if (cards.length < 2) return;

  carousel.dataset.sliderInit = 'true';

  // Remove manual indicators if present
  const indicator = carousel.parentElement?.querySelector('.carousel-scroll-indicator, .scroll-indicator, .interview-scroll-line');
  if (indicator) indicator.remove();

  const firstClone = cards[0].cloneNode(true);
  firstClone.setAttribute('aria-hidden', 'true');
  firstClone.dataset.clone = 'first';

  const lastClone = cards[cards.length - 1].cloneNode(true);
  lastClone.setAttribute('aria-hidden', 'true');
  lastClone.dataset.clone = 'last';

  carousel.insertBefore(lastClone, cards[0]);
  carousel.appendChild(firstClone);

  let currentIndex = 1;
  let autoScrollTimer = null;
  let scrollStopTimer = null;

  const getStepWidth = () => {
    const item = carousel.querySelector('.interview-card');
    if (!item) return 0;
    const styles = getComputedStyle(carousel);
    const gap = parseFloat(styles.columnGap || styles.gap || '0');
    return item.getBoundingClientRect().width + gap;
  };

  const scrollToIndex = (index, behavior = 'smooth') => {
    const stepWidth = getStepWidth();
    if (!stepWidth) return;
    carousel.scrollTo({
      left: stepWidth * index,
      behavior
    });
  };

  const moveNext = () => {
    currentIndex += 1;
    scrollToIndex(currentIndex, 'smooth');
  };

  const movePrev = () => {
    currentIndex -= 1;
    scrollToIndex(currentIndex, 'smooth');
  };

  const normalizeInfinitePosition = () => {
    const totalSlides = carousel.querySelectorAll('.interview-card').length;
    if (currentIndex === 0) {
      currentIndex = totalSlides - 2;
      scrollToIndex(currentIndex, 'auto');
    } else if (currentIndex === totalSlides - 1) {
      currentIndex = 1;
      scrollToIndex(currentIndex, 'auto');
    }
  };

  const stopAutoScroll = () => {
    if (autoScrollTimer) {
      clearInterval(autoScrollTimer);
      autoScrollTimer = null;
    }
  };

  const startAutoScroll = () => {
    stopAutoScroll();
    autoScrollTimer = setInterval(moveNext, 3000);
  };

  requestAnimationFrame(() => {
    scrollToIndex(currentIndex, 'auto');
    startAutoScroll();
  });

  carousel.addEventListener('scroll', () => {
    if (scrollStopTimer) clearTimeout(scrollStopTimer);
    scrollStopTimer = setTimeout(() => {
      const stepWidth = getStepWidth();
      if (!stepWidth) return;
      currentIndex = Math.round(carousel.scrollLeft / stepWidth);
      normalizeInfinitePosition();
    }, 220);
  }, { passive: true });

  const navScope = carousel.closest('section') || carousel.parentElement;
  const prevBtn = navScope?.querySelector('.carousel-nav__btn[aria-label="前へ"]');
  const nextBtn = navScope?.querySelector('.carousel-nav__btn[aria-label="次へ"]');

  if (prevBtn) {
    prevBtn.addEventListener('click', (event) => {
      event.preventDefault();
      stopAutoScroll();
      movePrev();
      setTimeout(startAutoScroll, 3000);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (event) => {
      event.preventDefault();
      stopAutoScroll();
      moveNext();
      setTimeout(startAutoScroll, 3000);
    });
  }

  carousel.addEventListener('mouseenter', stopAutoScroll);
  carousel.addEventListener('mouseleave', startAutoScroll);
  carousel.addEventListener('touchstart', stopAutoScroll, { passive: true });
  carousel.addEventListener('touchend', () => setTimeout(startAutoScroll, 3000), { passive: true });

  window.addEventListener('resize', () => {
    scrollToIndex(currentIndex, 'auto');
  });
}
