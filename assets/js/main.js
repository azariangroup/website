/* Azarian Inc — site interactions */
(function () {
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const nav = document.getElementById('site-nav');
  const toggle = document.querySelector('.nav-toggle');

  // Header shadow on scroll
  const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile navigation
  if (toggle && nav) {
    const setOpen = (open) => {
      if (open) nav.style.top = header.getBoundingClientRect().bottom + 'px';
      root.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', () => setOpen(!root.classList.contains('nav-open')));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    window.matchMedia('(min-width: 921px)').addEventListener('change', (e) => { if (e.matches) { setOpen(false); nav.style.top = ''; } });
  }

  // Mark the current page in the nav
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach((a) => {
    if (a.getAttribute('href') === path || (path === '' && a.getAttribute('href') === 'index.html')) {
      a.setAttribute('aria-current', 'page');
    }
  });

  // Reveal on scroll
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  // Count-up stats
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const co = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const end = parseFloat(el.dataset.count);
        const decimals = (el.dataset.count.split('.')[1] || '').length;
        co.unobserve(el);
        if (reduce) { el.textContent = end.toFixed(decimals); return; }
        const start = performance.now();
        const dur = 1400;
        const tick = (now) => {
          const p = Math.min((now - start) / dur, 1);
          el.textContent = (end * (1 - Math.pow(1 - p, 3))).toFixed(decimals);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => co.observe(el));
  }

  // Project filters
  const filters = document.querySelectorAll('.filter');
  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.filter;
      filters.forEach((b) => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-pressed', String(b === btn)); });
      document.querySelectorAll('.project').forEach((p) => {
        p.classList.toggle('is-hidden', cat !== 'all' && p.dataset.category !== cat);
      });
    });
  });

  // Quote forms post to FormSubmit, which emails each request to the address in the
  // form's action URL. The first submission triggers a one-time activation email.
  document.querySelectorAll('form.quote-form').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const success = form.querySelector('.form-success');
      const btn = form.querySelector('button[type="submit"]');
      const action = form.getAttribute('action');
      btn.disabled = true;
      try {
        if (action && action !== '#') {
          const res = await fetch(action, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(Object.fromEntries(new FormData(form)))
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || String(data.success) === 'false') throw new Error(data.message || 'Request failed');
        }
        form.reset();
        success.textContent = 'Thank you! Your request was received. A member of our team will contact you within one business day.';
      } catch (err) {
        success.textContent = 'Something went wrong. Please call us directly and we will be happy to help.';
      }
      success.classList.add('is-visible');
      btn.disabled = false;
    });
  });

  // Footer year
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
