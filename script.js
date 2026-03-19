document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     TOUCH DETECTION — disable cursor on touch devices
     ============================================================ */
  const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  if (isTouch) {
    document.body.style.cursor = 'auto';
    const cursorEl     = document.getElementById('cursor');
    const cursorRingEl = document.getElementById('cursor-ring');
    if (cursorEl)     cursorEl.style.display    = 'none';
    if (cursorRingEl) cursorRingEl.style.display = 'none';
  }

  /* ============================================================
     THEME TOGGLE  (Dark / Light)
     ============================================================ */
  const themeBtn = document.getElementById('theme-toggle');
  const root     = document.documentElement;
  let isDark     = true;

  function applyTheme(dark) {
    if (dark) {
      root.classList.remove('light-mode');
      if (themeBtn) {
        themeBtn.setAttribute('aria-label', 'Switch to light mode');
        themeBtn.innerHTML = `<span class="theme-icon">☀️</span><span class="theme-label">Light</span>`;
      }
    } else {
      root.classList.add('light-mode');
      if (themeBtn) {
        themeBtn.setAttribute('aria-label', 'Switch to dark mode');
        themeBtn.innerHTML = `<span class="theme-icon">🌙</span><span class="theme-label">Dark</span>`;
      }
    }
  }

  if (themeBtn) {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') isDark = false;
    applyTheme(isDark);
    themeBtn.addEventListener('click', () => {
      isDark = !isDark;
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      applyTheme(isDark);
    });
  }

  /* ============================================================
     NAVIGATION + GLIDING PILL + PAGE TRANSITIONS
     ============================================================ */
  const navLinks    = document.querySelectorAll('.nav-link');
  const sections    = document.querySelectorAll('.page-section');
  const mainContent = document.querySelector('.main-content');
  const navPill     = document.getElementById('nav-pill');

  function moveNavPill(activeLink) {
    if (!navPill || !activeLink) return;
    const navEl  = activeLink.closest('nav');
    if (!navEl) return;
    const navRect  = navEl.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    navPill.style.left   = (linkRect.left - navRect.left) + 'px';
    navPill.style.width  = linkRect.width + 'px';
    navPill.style.height = linkRect.height + 'px';
    navPill.style.top    = (linkRect.top - navRect.top) + 'px';
    navPill.style.opacity = '1';
  }

  function navigateTo(pageId, skipTransition) {
    navLinks.forEach(link => {
      const active = link.dataset.page === pageId;
      link.classList.toggle('active', active);
      link.setAttribute('aria-current', active ? 'page' : 'false');
      if (active) moveNavPill(link);
    });
    // Also update mobile nav
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.page === pageId);
    });

    const incoming = document.getElementById('page-' + pageId);
    if (!incoming) return;

    if (skipTransition) {
      sections.forEach(s => s.classList.remove('active', 'page-exit'));
      incoming.classList.add('active');
    } else {
      const current = document.querySelector('.page-section.active');
      if (current && current !== incoming) {
        current.classList.add('page-exit');
        setTimeout(() => current.classList.remove('active', 'page-exit'), 340);
      }
      setTimeout(() => {
        sections.forEach(s => { if (s !== incoming) s.classList.remove('active'); });
        incoming.classList.add('active');
      }, current && current !== incoming ? 120 : 0);
    }

    window.scrollTo(0, 0); if (mainContent) mainContent.scrollTop = 0;
    setTimeout(triggerReveal, 160);
    if (pageId === 'Skills') setTimeout(animateSkillBars, 280);
  }

  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(link.dataset.page);
    });
  });

  const ctaProjects = document.getElementById('cta_projects');
  if (ctaProjects) ctaProjects.addEventListener('click', e => { e.preventDefault(); navigateTo('Projects'); });
  const ctaContact = document.getElementById('cta_contact');
  if (ctaContact)  ctaContact.addEventListener('click', e => { e.preventDefault(); navigateTo('Contact'); });

  /* ============================================================
     HAMBURGER / MOBILE MENU
     ============================================================ */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('active', open);
      hamburger.setAttribute('aria-expanded', String(open));
    });

    mobileMenu.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        navigateTo(link.dataset.page);
      });
    });

    document.addEventListener('click', e => {
      if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ============================================================
     PROJECT FILTER
     ============================================================ */
  const projectFilter = document.getElementById('project_filter');
  if (projectFilter) {
    projectFilter.addEventListener('change', e => {
      const category = e.target.value;
      const cards    = document.querySelectorAll('.proj-card-container');
      let count      = 0;
      cards.forEach(card => {
        const show = category === 'All' || card.dataset.category === category;
        card.style.display = show ? 'block' : 'none';
        if (show) count++;
      });
      const countEl = document.getElementById('project_count');
      if (countEl) countEl.innerText = '📁 ' + count + ' project' + (count !== 1 ? 's' : '');
    });
  }

  /* ============================================================
     TOAST NOTIFICATIONS
     ============================================================ */
  function showToast(message, type, duration) {
    type     = type     || 'success';
    duration = duration || 4200;
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');

    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    toast.innerHTML =
      '<span class="toast-icon">' + (icons[type] || icons.info) + '</span>' +
      '<span class="toast-msg">'  + message + '</span>' +
      '<button class="toast-close" aria-label="Close notification">✕</button>';

    container.appendChild(toast);
    requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('toast-show')));

    function dismiss() {
      toast.classList.remove('toast-show');
      toast.classList.add('toast-hide');
      setTimeout(() => toast.remove(), 380);
    }
    toast.querySelector('.toast-close').addEventListener('click', dismiss);
    setTimeout(dismiss, duration);
  }

  /* ============================================================
     CONTACT FORM
     ============================================================ */
  const contactForm = document.getElementById('contact_form');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const name  = (document.getElementById('cf_name')?.value  || '').trim() || 'Guest';
      const email = (document.getElementById('cf_email')?.value || '').trim();

      if (!email) {
        showToast('Please enter your email address.', 'error');
        return;
      }

      const btn  = contactForm.querySelector('button[type=submit]');
      const orig = btn.textContent;
      btn.textContent = '✅ Message Sent!';
      btn.disabled    = true;
      btn.style.background = 'linear-gradient(135deg,#059669,#00b87a)';

      showToast("Message received! Thanks, " + name.split(' ')[0] + ". I'll reply to " + email + " within 24 hours.", 'success', 5000);

      setTimeout(() => {
        btn.textContent      = orig;
        btn.disabled         = false;
        btn.style.background = '';
        contactForm.reset();
      }, 3200);
    });
  }

  /* ============================================================
     CUSTOM CURSOR  (desktop only, via event delegation)
     ============================================================ */
  const cursor     = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursor-ring');

  if (!isTouch && cursor && cursorRing) {
    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    function animCursor() {
      cursor.style.left = mx + 'px';
      cursor.style.top  = my + 'px';
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      cursorRing.style.left = rx + 'px';
      cursorRing.style.top  = ry + 'px';
      requestAnimationFrame(animCursor);
    }
    animCursor();

    var hoverSel = 'a,button,.nav-link,.stat-card,.proj-card,.proj-card-pro,.skill-card,.cert-card,.contact-card-pro,.core-tag,.tool-badge,.interest-card,.ach-item,.tl-item';
    document.addEventListener('mouseover', e => {
      if (e.target.closest(hoverSel)) {
        cursor.classList.add('cursor-hover');
        cursorRing.classList.add('ring-hover');
      }
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(hoverSel)) {
        cursor.classList.remove('cursor-hover');
        cursorRing.classList.remove('ring-hover');
      }
    });
  }

  /* ============================================================
     PARTICLE CANVAS  (reduced on mobile)
     ============================================================ */
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx        = canvas.getContext('2d');
    const isMobile   = window.innerWidth < 768;
    const PCOUNT     = isMobile ? 35 : 90;
    const CDIST      = isMobile ? 80 : 110;
    let W, H, particles = [], frameCount = 0;

    function resizeCanvas() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function Particle() { this.reset(true); }
    Particle.prototype.reset = function(init) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : (Math.random() < 0.5 ? -5 : H + 5);
      this.vx = (Math.random() - 0.5) * 0.28;
      this.vy = (Math.random() - 0.5) * 0.28;
      this.r  = Math.random() * 1.2 + 0.3;
      this.a  = Math.random() * 0.45 + 0.1;
      var c   = Math.random();
      this.color = c < 0.5  ? 'rgba(167,139,250,' + this.a + ')'
                 : c < 0.75 ? 'rgba(251,191,36,'  + this.a + ')'
                             : 'rgba(110,231,183,' + this.a + ')';
    };
    Particle.prototype.update = function() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < -10 || this.x > W + 10 || this.y < -10 || this.y > H + 10) this.reset(false);
    };
    Particle.prototype.draw = function() {
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color; ctx.fill();
    };

    for (var i = 0; i < PCOUNT; i++) particles.push(new Particle());

    function drawConnections() {
      if (isMobile && frameCount % 2 !== 0) return;
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          var d  = Math.sqrt(dx*dx + dy*dy);
          if (d < CDIST) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(167,139,250,' + (0.07 * (1 - d / CDIST)) + ')';
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
    }

    function animParticles() {
      ctx.clearRect(0, 0, W, H); frameCount++;
      particles.forEach(function(p) { p.update(); p.draw(); });
      drawConnections();
      requestAnimationFrame(animParticles);
    }
    animParticles();
  }

  /* ============================================================
     TYPEWRITER EFFECT
     ============================================================ */
  var twEl = document.getElementById('tw-text');
  if (twEl) {
    var lines = ['Exploring Data Science...','Building ML Models...','Visualizing Insights...','Querying Databases...','Open to Opportunities!'];
    var li = 0, ci = 0, deleting = false;
    function typewriter() {
      var current = lines[li];
      if (!deleting) {
        twEl.textContent = current.slice(0, ++ci);
        if (ci === current.length) { deleting = true; setTimeout(typewriter, 1800); return; }
      } else {
        twEl.textContent = current.slice(0, --ci);
        if (ci === 0) { deleting = false; li = (li + 1) % lines.length; setTimeout(typewriter, 400); return; }
      }
      setTimeout(typewriter, deleting ? 45 : 80);
    }
    typewriter();
  }

  /* ============================================================
     SCROLL REVEAL
     ============================================================ */
  function triggerReveal() {
    var active = document.querySelector('.page-section.active');
    if (!active) return;
    active.querySelectorAll('.reveal').forEach(function(el, i) {
      el.classList.remove('visible');
      setTimeout(function() { el.classList.add('visible'); }, 60 + i * 75);
    });
  }

  /* ============================================================
     SKILL BARS — animate on page enter
     ============================================================ */
  function animateSkillBars() {
    var active = document.querySelector('.page-section.active');
    if (!active) return;
    active.querySelectorAll('.skill-bar-fill').forEach(function(bar, i) {
      var target = bar.dataset.target || bar.style.width;
      if (!bar.dataset.target) bar.dataset.target = bar.style.width;
      bar.style.transition = 'none';
      bar.style.width = '0%';
      setTimeout(function() {
        bar.style.transition = 'width 1.1s cubic-bezier(0.4,0,0.2,1)';
        bar.style.width = target;
      }, 100 + i * 55);
    });
  }

  /* ============================================================
     ADVANCED SCROLL WIDGET — progress ring + pct + keyboard shortcut
     NOTE: page scrolls via window (main-content has no overflow-y)
     ============================================================ */
  var scrollWidget  = document.getElementById('scroll-widget');
  var backTopBtn    = document.getElementById('back-to-top');
  var ringFill      = document.getElementById('ring-fill');
  var scrollPctEl   = document.getElementById('scroll-pct');
  var CIRCUMFERENCE = 138.23; // 2 * Math.PI * 22

  function easeInOutCubic(t) {
    return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3) / 2;
  }

  function smoothScrollToTop(duration) {
    var startY    = window.scrollY || document.documentElement.scrollTop;
    var startTime = null;
    if (startY < 1) return;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed  = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, startY * (1 - easeInOutCubic(progress)));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // Pulse on arrival
        if (backTopBtn) {
          backTopBtn.classList.remove('at-top');
          void backTopBtn.offsetWidth;
          backTopBtn.classList.add('at-top');
          setTimeout(function() { backTopBtn.classList.remove('at-top'); }, 600);
        }
      }
    }
    requestAnimationFrame(step);
  }

  function updateScrollWidget() {
    if (!scrollWidget) return;
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var scrollH   = document.documentElement.scrollHeight - window.innerHeight;
    var pct       = scrollH > 0 ? Math.round((scrollTop / scrollH) * 100) : 0;

    // Show / hide
    scrollWidget.classList.toggle('visible', scrollTop > 280);

    // Gradient ring
    if (ringFill) {
      var offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;
      ringFill.style.strokeDashoffset = offset;
    }

    // Percentage label
    if (scrollPctEl) {
      scrollPctEl.textContent = pct + '%';
      scrollPctEl.style.opacity = pct > 5 ? '1' : '0.7';
    }
  }

  // Listen on WINDOW scroll
  window.addEventListener('scroll', updateScrollWidget, { passive: true });

  if (backTopBtn) {
    backTopBtn.addEventListener('click', function() {
      smoothScrollToTop(650);
    });
  }

  // Keyboard shortcut T → scroll to top
  document.addEventListener('keydown', function(e) {
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 't' || e.key === 'T') {
      smoothScrollToTop(650);
      if (scrollWidget) {
        scrollWidget.style.transform = 'translateY(0) scale(1.12)';
        setTimeout(function() { scrollWidget.style.transform = ''; }, 280);
      }
    }
  });

  // Initialise on load
  updateScrollWidget();

  /* ============================================================
     SKIP LINK (Accessibility)
     ============================================================ */
  var skipLink = document.getElementById('skip-to-content');
  if (skipLink) {
    skipLink.addEventListener('click', function(e) {
      e.preventDefault();
      var target = document.getElementById('main-content');
      if (target) { target.setAttribute('tabindex', '-1'); target.focus(); }
    });
  }

  /* ============================================================
     INITIAL STATE
     ============================================================ */
  navigateTo('Home', true);

});