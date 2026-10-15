/* MedDonate — animations.js
   Global animation engine linked on every page.
   Runs after inline scripts (deferred) so dynamic content is already rendered.
*/
(function () {
  'use strict';

  /* ============================================================
     1. PAGE PROGRESS BAR
     ============================================================ */
  function initProgressBar() {
    var bar = document.createElement('div');
    bar.id = 'md-progress-bar';
    document.body.appendChild(bar);

    // Grow to 85% quickly, then stall until window.load
    var pct = 0;
    var raf;
    function grow() {
      pct += (84 - pct) * 0.09;
      bar.style.width = pct + '%';
      if (pct < 83) raf = requestAnimationFrame(grow);
    }
    requestAnimationFrame(grow);

    window.addEventListener('load', function () {
      cancelAnimationFrame(raf);
      bar.style.width = '100%';
      setTimeout(function () {
        bar.classList.add('md-bar-done');
        setTimeout(function () { if (bar.parentNode) bar.remove(); }, 400);
      }, 180);
    });
  }

  /* ============================================================
     2. SCROLL REVEAL — IntersectionObserver
     ============================================================ */
  function initScrollReveal() {
    if (!window.IntersectionObserver) return;

    // Selectors auto-tagged for reveal
    var TARGETS = [
      '.card', '.stat-card',
      '.donation-card', '.listing-card',
      '.notice-strip', '.review-meta-box',
      '.steps-timeline .timeline-item',
      '.upload-box', '.profile-section',
      '.form-subtitle', '.two-col',
      '.radio-option', '.doc-preview-badge'
    ];

    var staggerClasses = ['md-d1','md-d2','md-d3','md-d4','md-d5','md-d6'];

    TARGETS.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el, i) {
        // Don't re-tag elements already animated in CSS by name
        if (el.classList.contains('md-reveal')) return;
        el.classList.add('md-reveal');
        el.classList.add(staggerClasses[Math.min(i, 5)]);
      });
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('md-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.07, rootMargin: '0px 0px -24px 0px' });

    document.querySelectorAll('.md-reveal').forEach(function (el) {
      observer.observe(el);
    });

    // Watch for dynamically added cards (dashboards re-render)
    var mutObs = new MutationObserver(function (mutations) {
      mutations.forEach(function (mut) {
        mut.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          TARGETS.forEach(function (sel) {
            var matches = [];
            try { if (node.matches(sel)) matches.push(node); } catch(e) {}
            if (node.querySelectorAll) {
              node.querySelectorAll(sel).forEach(function (el) { matches.push(el); });
            }
            matches.forEach(function (el) {
              if (!el.classList.contains('md-reveal')) {
                el.classList.add('md-reveal');
              }
              // immediately visible if already in viewport
              var rect = el.getBoundingClientRect();
              if (rect.top < window.innerHeight) {
                el.classList.add('md-visible');
              } else {
                observer.observe(el);
              }
            });
          });
        });
      });
    });

    mutObs.observe(document.body, { childList: true, subtree: true });
  }

  /* ============================================================
     3. BUTTON RIPPLE
     ============================================================ */
  function initRipple() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.btn');
      if (!btn || btn.disabled || btn.hasAttribute('disabled')) return;

      var rect = btn.getBoundingClientRect();
      var r = document.createElement('span');
      r.className = 'md-ripple-el';
      r.style.left = (e.clientX - rect.left) + 'px';
      r.style.top  = (e.clientY - rect.top)  + 'px';
      btn.appendChild(r);
      r.addEventListener('animationend', function () { r.remove(); });
    }, true);
  }

  /* ============================================================
     4. STAT CARD ENTRANCE STAGGER
     ============================================================ */
  function initStatStagger() {
    var cards = document.querySelectorAll('.stats-grid .stat-card');
    if (!cards.length) return;

    cards.forEach(function (card, i) {
      card.style.opacity   = '0';
      card.style.transform = 'translateY(20px)';
      setTimeout(function () {
        card.style.transition = 'opacity 0.42s ease, transform 0.42s cubic-bezier(0.22,1,0.36,1)';
        card.style.opacity    = '1';
        card.style.transform  = 'translateY(0)';
      }, 440 + i * 90);
    });
  }

  /* ============================================================
     5. ACCEPT / REJECT CARD FEEDBACK
     ============================================================ */
  function initActionFeedback() {
    document.addEventListener('click', function (e) {
      // Accept
      var acceptBtn = e.target.closest('[data-action="accept"]');
      if (acceptBtn) {
        var id   = acceptBtn.getAttribute('data-id');
        var card = document.getElementById('card-' + id);
        if (card) {
          card.classList.add('md-accept-flash');
          setTimeout(function () { card.classList.remove('md-accept-flash'); }, 700);
          // Confetti burst from card centre
          var rect = card.getBoundingClientRect();
          fireConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
      }

      // Reject
      var rejectBtn = e.target.closest('[data-action="reject"]');
      if (rejectBtn) {
        var rid   = rejectBtn.getAttribute('data-id');
        var rCard = document.getElementById('card-' + rid);
        if (rCard) {
          rCard.classList.add('md-reject-shake');
          setTimeout(function () { rCard.classList.remove('md-reject-shake'); }, 500);
        }
      }

      // Mark picked-up confetti
      var pickupBtn = e.target.closest('[data-action="mark-pickedup"]');
      if (pickupBtn) {
        fireConfetti(e.clientX, e.clientY);
      }

      // Filter / range pill re-pop
      var pill = e.target.closest('.filter-btn, .range-pill');
      if (pill) {
        pill.style.animation = 'none';
        pill.offsetHeight;  /* reflow */
        pill.style.animation = '';
      }
    });
  }

  /* ============================================================
     6. BADGE POP — watch DOM for new verified badges
     ============================================================ */
  function initBadgePop() {
    if (!window.MutationObserver) return;
    var obs = new MutationObserver(function (mutations) {
      mutations.forEach(function (mut) {
        mut.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          var badges = [];
          try {
            if (node.matches && node.matches('.badge-verified, .badge-accepted, .badge-new')) {
              badges.push(node);
            }
          } catch(e) {}
          if (node.querySelectorAll) {
            node.querySelectorAll('.badge-verified, .badge-accepted, .badge-new').forEach(function (b) {
              badges.push(b);
            });
          }
          badges.forEach(function (b) {
            b.classList.add('md-badge-pop');
          });
        });
      });
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  /* ============================================================
     7. STEP TRANSITION HELPER (signup pages)
        Wraps the app container in a slide animation when step changes.
        Works by observing the #app container for full replaces.
     ============================================================ */
  function initStepTransitions() {
    var app = document.getElementById('app');
    if (!app) return;

    var lastStep = 1;

    var obs = new MutationObserver(function () {
      // Detect direction from step-track active dot position
      var dots  = app.querySelectorAll('.step-dot');
      var active = -1;
      dots.forEach(function (d, i) { if (d.classList.contains('active')) active = i + 1; });
      if (active === -1) return;

      var dir = active >= lastStep ? 'forward' : 'backward';
      lastStep = active;

      var enterClass = dir === 'forward' ? 'md-step-enter-right' : 'md-step-enter-left';
      app.style.animation = 'none';
      app.offsetHeight;
      app.style.animation = '';
      app.classList.remove('md-step-enter-right','md-step-enter-left');
      void app.offsetWidth;
      app.classList.add(enterClass);
      app.addEventListener('animationend', function clean() {
        app.classList.remove(enterClass);
        app.removeEventListener('animationend', clean);
      });
    });

    obs.observe(app, { childList: true });
  }

  /* ============================================================
     8. CHAT TYPING INDICATOR UPGRADE
        Patches the donor auto-reply to show a typing bubble first.
     ============================================================ */
  function initTypingIndicator() {
    // Expose helpers on window for dashboard scripts to call
    window.mdShowTyping = function (container) {
      if (!container) return;
      var existing = container.querySelector('.md-typing');
      if (existing) return existing;

      var wrap = document.createElement('div');
      wrap.className = 'msg from-donor md-typing';
      wrap.innerHTML =
        '<div class="msg-bubble" style="padding:10px 14px; display:inline-flex; gap:5px; align-items:center;">' +
          '<span class="md-typing-dot"></span>' +
          '<span class="md-typing-dot"></span>' +
          '<span class="md-typing-dot"></span>' +
        '</div>';
      container.appendChild(wrap);
      container.scrollTop = container.scrollHeight;
      return wrap;
    };

    window.mdHideTyping = function (container) {
      if (!container) return;
      var t = container.querySelector('.md-typing');
      if (t) t.remove();
    };
  }

  /* ============================================================
     9. CONFETTI BURST
     ============================================================ */
  var CONFETTI_COLORS = [
    '#1F5C4E','#2A7663','#E3A23F','#C8862A',
    '#DCEAE3','#FBEBD2','#fff','#2C6E91'
  ];

  function fireConfetti(cx, cy) {
    for (var i = 0; i < 22; i++) {
      (function (i) {
        setTimeout(function () {
          var p = document.createElement('div');
          p.className = 'md-confetti-particle';
          p.style.left       = (cx + (Math.random() - 0.5) * 140) + 'px';
          p.style.top        = (cy - 10) + 'px';
          p.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
          p.style.width      = (6 + Math.random() * 6) + 'px';
          p.style.height     = (6 + Math.random() * 6) + 'px';
          p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
          p.style.animationDuration = (0.7 + Math.random() * 0.5) + 's';
          p.style.animationDelay    = (Math.random() * 0.15) + 's';
          document.body.appendChild(p);
          p.addEventListener('animationend', function () { p.remove(); });
        }, i * 18);
      })(i);
    }
  }

  window.mdFireConfetti = fireConfetti;  // expose for dashboard scripts

  /* ============================================================
     10. SMOOTH PAGE EXIT FADE
     ============================================================ */
  function initPageExit() {
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented) return;
      var link = e.target.closest('a[href]');
      if (!link) return;
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#' || href.startsWith('mailto')
          || href.startsWith('tel') || link.target === '_blank') return;
      if (!href.endsWith('.html') && href !== 'index.html') return;

      e.preventDefault();
      document.body.classList.add('md-page-exit');
      setTimeout(function () { window.location.href = href; }, 210);
    });
  }

  /* ============================================================
     11. HERO FLOATING ORBS on index only
     ============================================================ */
  function initHeroOrbs() {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    hero.style.position = 'relative';
    hero.style.overflow = 'visible';
  }

  /* ============================================================
     BOOT
     ============================================================ */
  function boot() {
    initProgressBar();
    initRipple();
    initActionFeedback();
    initBadgePop();
    initStepTransitions();
    initTypingIndicator();
    initPageExit();
    initHeroOrbs();

    // Small delay so any dynamic render() calls in inline scripts finish first
    setTimeout(function () {
      initScrollReveal();
      initStatStagger();
    }, 90);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
