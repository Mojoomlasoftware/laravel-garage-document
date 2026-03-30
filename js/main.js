(function () {
    'use strict';

    var NAV_OFFSET = 80;

    /* ── Progress bar ── */
    var pgbar = document.getElementById('progress-bar');
    function updateProgress() {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        if (pgbar) pgbar.style.width = (h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0) + '%';
    }

    /* ── Navbar scroll effect ── */
    var navbar = document.getElementById('gm-navbar');
    window.addEventListener('scroll', function () {
        updateProgress();
        if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 30);
        var btt = document.getElementById('back-to-top');
        if (btt) btt.classList.toggle('visible', window.scrollY > 300);
        updateScrollSpy();
    }, { passive: true });
    updateProgress();

    /* ── Back to top ── */
    var btt = document.getElementById('back-to-top');
    if (btt) btt.addEventListener('click', function () {
        // Close all open dropdowns and suppress scroll-spy auto-open during smooth scroll
        document.querySelectorAll('.snav-dropdown.open').forEach(function (el) {
            el.classList.remove('open');
            var prev = el.previousElementSibling;
            if (prev) prev.classList.remove('open');
        });
        window._bttScrolling = true;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(function () { window._bttScrolling = false; }, 800);
    });

    /* ── Mobile sidebar ── */
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('mob-overlay');
    var mobBtn = document.getElementById('mob-toggle');
    function openSidebar() { if (sidebar) sidebar.classList.add('open'); if (overlay) overlay.classList.add('show'); }
    function closeSidebar() { if (sidebar) sidebar.classList.remove('open'); if (overlay) overlay.classList.remove('show'); }
    if (mobBtn) mobBtn.addEventListener('click', function () { sidebar && sidebar.classList.contains('open') ? closeSidebar() : openSidebar(); });
    if (overlay) overlay.addEventListener('click', closeSidebar);

    /* ── Smooth scroll for ALL anchor links ── */
    document.addEventListener('click', function (e) {
        var a = e.target.closest('a[href^="#"]');
        if (!a) return;
        var href = a.getAttribute('href');
        if (!href || href === '#') return;
        var id = href.slice(1);
        var el = document.getElementById(id);
        if (el) {
            e.preventDefault();
            var top = el.getBoundingClientRect().top + window.pageYOffset - NAV_OFFSET;
            window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
            if (window.innerWidth <= 992) closeSidebar();
            // Auto-open parent dropdown if link is inside one
            var dropBody = a.closest('.snav-dropdown');
            if (dropBody && !dropBody.classList.contains('open')) {
                var toggle = dropBody.previousElementSibling;
                if (toggle) toggleDrop(toggle);
            }
        }
    });

    /* ── Scroll Spy ── */
    var navLinks = [];
    var spySections = [];
    document.querySelectorAll('.gm-sidebar a[href^="#"], .snav-dropdown a[href^="#"]').forEach(function (a) {
        var id = a.getAttribute('href').slice(1);
        var el = document.getElementById(id);
        if (el) { navLinks.push(a); spySections.push({ el: el, link: a }); }
    });

    var topNavSections = [];
    document.querySelectorAll('.gm-nav-links a[href^="#"]').forEach(function (a) {
        var id = a.getAttribute('href').slice(1);
        var el = document.getElementById(id);
        if (el) topNavSections.push({ el: el, link: a });
    });

    function updateScrollSpy() {
        var scrollY = window.scrollY + NAV_OFFSET + 30;
        var current = null;

        // Detect current section
        for (var i = 0; i < spySections.length; i++) {
            var elTop = spySections[i].el.getBoundingClientRect().top + window.pageYOffset;
            if (elTop <= scrollY) current = spySections[i];
        }

        // =========================
        // RESET EVERYTHING FIRST
        // =========================

        // Remove active from all links
        navLinks.forEach(function (l) {
            l.classList.remove('active');
        });

        // Remove active & open from all dropdown buttons
        document.querySelectorAll('.snav-dropdown-btn').forEach(function (btn) {
            btn.classList.remove('active');
            btn.classList.remove('open');
        });

        // Close all dropdowns
        document.querySelectorAll('.snav-dropdown').forEach(function (drop) {
            drop.classList.remove('open');
        });

        // If no section found → stop
        if (!current) return;

        // =========================
        // ACTIVATE CURRENT LINK
        // =========================

        current.link.classList.add('active');

        // =========================
        // HANDLE DROPDOWN (ONLY ONCE)
        // =========================

        var dropBody = current.link.closest('.snav-dropdown');

        if (dropBody && !window._bttScrolling) {
            dropBody.classList.add('open');

            var toggle = dropBody.previousElementSibling;

            if (toggle && toggle.classList.contains('snav-dropdown-btn')) {
                toggle.classList.add('open');
                toggle.classList.add('active');
            }
        }

        // =========================
        // UPDATE TOP NAVBAR ACTIVE
        // =========================

        var topNavLinks = document.querySelectorAll('.gm-nav-links a');
        topNavLinks.forEach(function (l) { l.classList.remove('active'); });

        var currentTopNav = null;
        for (var j = 0; j < topNavSections.length; j++) {
            var elTop2 = topNavSections[j].el.getBoundingClientRect().top + window.pageYOffset;
            if (elTop2 <= scrollY) currentTopNav = topNavSections[j];
        }
        if (currentTopNav) {
            currentTopNav.link.classList.add('active');
        } else {
            var homeLink = document.querySelector('.gm-nav-links a[href="#home"]');
            if (homeLink) homeLink.classList.add('active');
        }

        // =========================
        // AUTO SCROLL SIDEBAR
        // =========================

        var sidebarEl = document.querySelector('.gm-sidebar');

        if (sidebarEl && !sidebarEl._userScrolling) {
            var lRect = current.link.getBoundingClientRect();
            var nRect = sidebarEl.getBoundingClientRect();

            if (lRect.top < nRect.top + 40 || lRect.bottom > nRect.bottom - 40) {
                sidebarEl.scrollTop =
                    sidebarEl.scrollTop +
                    lRect.top -
                    nRect.top -
                    sidebarEl.clientHeight / 2;
            }
        }
    }
    var sidebarNav = document.querySelector('.gm-sidebar');
    if (sidebarNav) {
        sidebarNav.addEventListener('scroll', function () {
            sidebarNav._userScrolling = true;
            clearTimeout(sidebarNav._scrollTimer);
            sidebarNav._scrollTimer = setTimeout(function () { sidebarNav._userScrolling = false; }, 1200);
        }, { passive: true });
    }
    updateScrollSpy();

    /* ── Sidebar search ── */
    var searchInput = document.getElementById('searchDocs');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            var q = this.value.toLowerCase().trim();
            var groups = document.querySelectorAll('.snav-group');
            groups.forEach(function (grp) {
                var links = grp.querySelectorAll('a');
                var anyVisible = false;
                links.forEach(function (a) {
                    var match = !q || a.textContent.toLowerCase().includes(q);
                    a.style.display = match ? '' : 'none';
                    if (match) anyVisible = true;
                });
                grp.style.display = anyVisible ? '' : 'none';

                // Open dropdown if it has matching results; close when search cleared
                var dropBtn = grp.querySelector('.snav-dropdown-btn');
                var dropBody = grp.querySelector('.snav-dropdown');
                if (dropBtn && dropBody) {
                    if (q && anyVisible) {
                        dropBody.classList.add('open');
                        dropBtn.classList.add('open');
                    } else if (!q) {
                        dropBody.classList.remove('open');
                        dropBtn.classList.remove('open');
                    }
                }
            });
        });
    }

    /* ── Stat counter ── */
    var counted = false;
    function animateCounters() {
        if (counted) return;
        var nums = document.querySelectorAll('[data-count]');
        if (!nums.length) return;
        var hero = document.querySelector('.gm-hero');
        if (hero && hero.getBoundingClientRect().top > window.innerHeight) return;
        counted = true;
        nums.forEach(function (el) {
            var target = parseInt(el.getAttribute('data-count'));
            var current = 0;
            var step = Math.ceil(target / 40);
            var timer = setInterval(function () {
                current += step;
                if (current >= target) { el.textContent = target; clearInterval(timer); }
                else el.textContent = current;
            }, 30);
        });
    }
    window.addEventListener('scroll', animateCounters, { passive: true });
    animateCounters();

    /* ── Lightbox ── */
    var lb = document.getElementById('lightbox');
    var lbImg = document.getElementById('lb-img');
    var lbClose = document.getElementById('lb-close');
    document.addEventListener('click', function (e) {
        var img = e.target.closest('.gm-content img, .content-area img');
        if (img && lb && lbImg && !e.target.closest('#lightbox')) {
            lbImg.src = img.src;
            lb.classList.add('open');
        }
    });
    if (lbClose) lbClose.addEventListener('click', function () { lb && lb.classList.remove('open'); });
    if (lb) lb.addEventListener('click', function (e) { if (e.target === lb) lb.classList.remove('open'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lb) lb.classList.remove('open'); });

    /* ── FAQ toggles ── */
    document.addEventListener('click', function (e) {
        var head = e.target.closest('.faq-header');
        if (!head) return;
        var body = head.nextElementSibling;
        if (!body) return;
        var isOpen = body.classList.contains('open');
        body.classList.toggle('open', !isOpen);
        head.classList.toggle('open', !isOpen);
    });

    /* ── Copy code buttons ── */
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.copy-btn-code,.copy-btn');
        if (!btn) return;
        var wrap = btn.closest('.code-block-wrap,.copy-wrap');
        var pre = wrap ? wrap.querySelector('pre') : null;
        if (!pre) return;
        navigator.clipboard.writeText(pre.textContent).then(function () {
            var orig = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(function () { btn.textContent = orig; }, 1800);
        }).catch(function () { });
    });

    /* ── Navbar active links — handled by updateScrollSpy ── */

})();

/* ── toggleDrop — global ── */
function toggleDrop(btn) {
    var allDropdowns = document.querySelectorAll('.snav-dropdown');
    var allButtons = document.querySelectorAll('.snav-dropdown-btn');

    // CLOSE ALL FIRST
    allDropdowns.forEach(function (el) {
        el.classList.remove('open');
    });
    allButtons.forEach(function (b) {
        b.classList.remove('open');
    });

    // OPEN CURRENT
    var drop = btn.nextElementSibling;
    if (drop) {
        drop.classList.add('open');
        btn.classList.add('open');
    }
}

/* ── Alias for original code references ── */
function toggleNavDropdown(btn) { toggleDrop(btn); }

(function(){
  var INST_TOTAL = 5;
  var instCurrent = 0;

  function instGoTo(idx) {
    if (idx < 0 || idx >= INST_TOTAL) return;

    // Hide all slides
    for (var i = 0; i < INST_TOTAL; i++) {
      var slide = document.getElementById('inst-slide-' + i);
      if (slide) slide.classList.remove('active');
    }

    // Show target
    var target = document.getElementById('inst-slide-' + idx);
    if (target) target.classList.add('active');

    // Update stepper
    var steps = document.querySelectorAll('#inst-stepper .wstep');
    steps.forEach(function(step, i) {
      step.classList.remove('active', 'completed');
      if (i < idx) step.classList.add('completed');
      else if (i === idx) step.classList.add('active');
    });

    // Update all dot sets in the visible slide
    var dots = target ? target.querySelectorAll('.wizard-progress-dots') : [];
    dots.forEach(function(dotsEl) {
      dotsEl.innerHTML = '';
      for (var d = 0; d < INST_TOTAL; d++) {
        var span = document.createElement('span');
        if (d === idx) span.classList.add('active');
        (function(di){
          span.addEventListener('click', function(){ instGoTo(di); });
        })(d);
        dotsEl.appendChild(span);
      }
    });

    instCurrent = idx;
  }

  // expose globally
  window.instGoTo = instGoTo;

  // init on load
  document.addEventListener('DOMContentLoaded', function(){ instGoTo(0); });
})();

function openLightbox(src) {
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lb-img');
  if (lb && lbImg) { lbImg.src = src; lb.classList.add('open'); }
}

