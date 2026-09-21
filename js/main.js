/* ============================================================
   JODOZO FARMS LTD — Page behaviours
   ============================================================ */
(function () {
  'use strict';

  /* ----- Sticky header shadow + back-to-top visibility ----- */
  var header = document.getElementById('siteHeader');
  var toTop = document.getElementById('toTop');
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 10);
    if (toTop) toTop.classList.toggle('show', window.scrollY > 520);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ----- Navigation: hamburger + click-to-toggle dropdowns ----- */
  function closeAllDrops(except) {
    document.querySelectorAll('.has-drop.open').forEach(function (li) {
      if (li !== except) {
        li.classList.remove('open');
        var l = li.querySelector('a');
        if (l) l.setAttribute('aria-expanded', 'false');
      }
    });
  }
  function setNav(open) {
    document.body.classList.toggle('nav-open', open);
    var t = document.getElementById('navToggle');
    if (t) {
      t.classList.toggle('open', open);
      t.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    if (!open) closeAllDrops(null);
  }
  /* Mark each dropdown parent as a toggle control */
  document.querySelectorAll('.has-drop > a').forEach(function (a) {
    a.setAttribute('aria-haspopup', 'true');
    a.setAttribute('aria-expanded', 'false');
  });
  document.addEventListener('click', function (e) {
    /* 1. Hamburger */
    var burger = e.target.closest('#navToggle');
    if (burger) {
      e.preventDefault();
      setNav(!document.body.classList.contains('nav-open'));
      return;
    }
    /* 2. Dropdown parents — toggle open/close on click, on every screen size */
    var parentLink = e.target.closest('.has-drop > a');
    if (parentLink) {
      var li = parentLink.parentElement;
      var isOpen = li.classList.contains('open');
      e.preventDefault();
      closeAllDrops(li);
      li.classList.toggle('open', !isOpen);
      parentLink.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      return;
    }
    /* 3. A real page link inside the nav — close the panel and dropdowns */
    var navLink = e.target.closest('.main-nav a');
    if (navLink) { closeAllDrops(null); setNav(false); return; }
    /* 4. Click anywhere outside the nav closes open dropdowns */
    if (!e.target.closest('.has-drop')) closeAllDrops(null);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === 'Esc') { closeAllDrops(null); setNav(false); }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1080) setNav(false);
  });

  /* ----- Hero slider ----- */
  var heroEl = document.querySelector('.hero');
  if (heroEl) {
    var slides = heroEl.querySelectorAll('.hero-slide');
    var dotsWrap = heroEl.querySelector('.hero-dots');
    var idx = 0, timer = null, first = true;
    function go(n) {
      slides[idx].classList.remove('active');
      if (dotsWrap) dotsWrap.children[idx].classList.remove('active');
      idx = (n + slides.length) % slides.length;
      slides[idx].classList.add('active');
      if (dotsWrap) dotsWrap.children[idx].classList.add('active');
      if (window.gsap && first) {
        first = false;
        gsap.fromTo(slides[idx], { scale: 1.06 }, { scale: 1, duration: 1.4, ease: 'power2.out' });
      } else if (window.gsap) {
        gsap.fromTo(slides[idx], { opacity: .25 }, { opacity: 1, duration: .8, ease: 'power1.inOut' });
      }
    }
    function play() { timer = setInterval(function () { go(idx + 1); }, 6500); }
    if (slides.length > 1) {
      slides[0].classList.add('active');
      if (dotsWrap) dotsWrap.children[0].classList.add('active');
      if (dotsWrap) {
        Array.prototype.forEach.call(dotsWrap.children, function (b, n) {
          b.addEventListener('click', function () { clearInterval(timer); go(n); play(); });
        });
      }
      heroEl.addEventListener('mouseenter', function () { clearInterval(timer); });
      heroEl.addEventListener('mouseleave', play);
      play();
    }
  }

  /* ----- Animations: GSAP-enhanced with graceful fallback ----- */
  function initCountersIO() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('[data-count]').forEach(function (el) {
        el.firstChild.nodeValue = (parseInt(el.getAttribute('data-count'), 10) || 0).toLocaleString();
      });
      return;
    }
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        co.unobserve(en.target);
        var el = en.target, end = parseInt(el.getAttribute('data-count'), 10) || 0;
        var dur = 1600, start = performance.now();
        function tick(now) {
          var p = Math.min((now - start) / dur, 1), eased = p * p * (3 - 2 * p);
          el.firstChild.nodeValue = Math.floor(end * eased).toLocaleString();
          if (p < 1) requestAnimationFrame(tick); else el.firstChild.nodeValue = end.toLocaleString();
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('[data-count]').forEach(function (el) { co.observe(el); });
  }
  function initFallbackReveal() {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
    } else {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
    }
    initCountersIO();
  }
  function splitWords(el) {
    var frag = document.createDocumentFragment();
    function process(node, accent) {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span'); w.className = 'w';
          var i = document.createElement('span'); i.className = 'wi' + (accent ? ' accent' : '');
          i.textContent = part; w.appendChild(i); frag.appendChild(w);
        });
      } else if (node.nodeType === 1) {
        var acc = accent || (node.classList && node.classList.contains('accent'));
        Array.prototype.slice.call(node.childNodes).forEach(function (n) { process(n, acc); });
      }
    }
    Array.prototype.slice.call(el.childNodes).forEach(function (n) { process(n, false); });
    el.textContent = '';
    el.appendChild(frag);
    return el.querySelectorAll('.wi');
  }
  function initGsap() {
    document.documentElement.classList.add('gsap-on');
    gsap.registerPlugin(ScrollTrigger);

    /* Scroll-triggered batch reveals */
    gsap.set('.reveal', { opacity: 0, y: 34 });
    ScrollTrigger.batch('.reveal', {
      start: 'top 88%', once: true,
      onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .09, overwrite: true }); }
    });

    /* Animated counters */
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var end = parseInt(el.getAttribute('data-count'), 10) || 0, obj = { v: 0 };
      gsap.to(obj, {
        v: end, duration: 1.8, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onUpdate: function () { el.firstChild.nodeValue = Math.floor(obj.v).toLocaleString(); }
      });
    });

    /* Inner-page hero curtain intro */
    var ph = document.querySelector('.page-hero');
    if (ph) {
      var t = gsap.timeline({ defaults: { ease: 'power3.out' } });
      t.from('.page-hero .bgimg', { scale: 1.25, duration: 1.5, ease: 'power2.out' }, 0)
       .from('.page-hero .crumbs', { y: 18, opacity: 0, duration: .6 }, .15)
       .from('.page-hero h1', { y: 34, opacity: 0, filter: 'blur(8px)', duration: .8 }, .25)
       .from('.page-hero p', { y: 26, opacity: 0, duration: .7 }, .45);
    }

    /* Home hero — word-mask intro */
    var hero = document.querySelector('.hero');
    if (hero) {
      var words = splitWords(hero.querySelector('h1'));
      var h = gsap.timeline({ defaults: { ease: 'power4.out' } });
      h.from('.hero-content .eyebrow', { y: 22, opacity: 0, duration: .6 })
       .from(words, { yPercent: 120, duration: 1.05, stagger: .055 }, '-=.25')
       .from('.hero-content p', { y: 26, opacity: 0, filter: 'blur(6px)', duration: .8 }, '-=.55')
       .from('.hero-btns .btn', { y: 22, opacity: 0, duration: .65, stagger: .12 }, '-=.5')
       .from('.hero-badge', { y: 20, opacity: 0, scale: .9, duration: .6 }, '-=.45')
       .from('.hero-dots button', { opacity: 0, y: 8, duration: .4, stagger: .06 }, '-=.5');
    }

    /* Value-chain chips light up on scroll */
    var panel = document.querySelector('.vc-panel');
    if (panel) {
      var vt = gsap.timeline({ scrollTrigger: { trigger: panel, start: 'top 72%', end: 'bottom 45%', scrub: 1 } });
      panel.querySelectorAll('.vc-ic').forEach(function (c) {
        vt.to(c, { backgroundColor: '#22c55e', borderColor: '#22c55e', color: '#fff', duration: .4 }, '+=.18');
      });
    }

    /* Partner image parallax */
    var pimg = document.querySelector('.partner-img');
    if (pimg) {
      gsap.to(pimg, { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.partner', start: 'top bottom', end: 'bottom top', scrub: true } });
    }
  }
  if (window.gsap && window.ScrollTrigger) { initGsap(); } else { initFallbackReveal(); }

  /* ----- Project / news filtering ----- */
  var bar = document.querySelector('.filter-bar');
  if (bar) {
    var cards = document.querySelectorAll('[data-cat]');
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('.fchip');
      if (!b) return;
      bar.querySelectorAll('.fchip').forEach(function (c) { c.classList.remove('active'); });
      b.classList.add('active');
      var f = b.getAttribute('data-filter');
      cards.forEach(function (c) {
        var show = f === 'all' || (c.getAttribute('data-cat') || '').split(' ').indexOf(f) > -1;
        c.style.display = show ? '' : 'none';
      });
    });
  }

  /* ----- Contact tabs (Enquiry / Quote / Distributor / Partner) ----- */
  var tabs = document.querySelector('.tabs');
  if (tabs) {
    var panels = document.querySelectorAll('.tab-panel');
    tabs.addEventListener('click', function (e) {
      var t = e.target.closest('.tab');
      if (!t) return;
      tabs.querySelectorAll('.tab').forEach(function (x) { x.classList.remove('active'); });
      t.classList.add('active');
      var id = t.getAttribute('data-tab');
      panels.forEach(function (p) { p.classList.toggle('active', p.id === id); });
    });
    var q = new URLSearchParams(location.search).get('form');
    var map = { enquiry: 'tab-enquiry', quote: 'tab-quote', distributor: 'tab-distributor', partner: 'tab-partner' };
    if (q && map[q]) {
      var btn = tabs.querySelector('[data-tab="' + map[q] + '"]');
      if (btn) setTimeout(function () { btn.click(); }, 60);
    }
  }

  /* ----- Contact form validation + email composer ----- */
  document.querySelectorAll('form[data-form]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      f.querySelectorAll('[required]').forEach(function (inp) {
        var fl = inp.closest('.field') || inp.closest('.pill-field');
        var bad = !inp.value.trim();
        if (inp.type === 'email' && inp.value && !/^\S+@\S+\.\S+$/.test(inp.value)) bad = true;
        if (inp.type === 'tel' && inp.value && !/^[\d+\-\s()]{7,}$/.test(inp.value)) bad = true;
        if (fl) fl.classList.toggle('invalid', bad);
        if (bad) ok = false;
      });
      var s = f.querySelector('.form-success');
      if (ok && s) {
        f.querySelectorAll('.field, .pill-field').forEach(function (x) { x.classList.remove('invalid'); });
        var kind = f.getAttribute('data-form') || 'enquiry';
        var titles = { enquiry: 'General Enquiry', quote: 'Request a Quote', distributor: 'Distributor Application', partner: 'Partnership Proposal' };
        var lines = [];
        f.querySelectorAll('input, select, textarea').forEach(function (input) {
          if (!input.value.trim()) return;
          var label = f.querySelector('label[for="' + input.id + '"]');
          var name = label ? label.textContent.replace('*', '').trim() : input.name || input.id;
          lines.push(name + ': ' + input.value.trim());
        });
        var subject = (titles[kind] || 'Website Enquiry') + ' — Jodozo Farms website';
        var body = 'Hello Jodozo Farms,\n\n' + lines.join('\n') + '\n\nSent from the Jodozo Farms website.';
        window.location.href = 'mailto:info@jodozofarms.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        s.querySelector('span').innerHTML = '<b>Your email app has opened.</b> Review the message and press Send to deliver it to our team.';
        s.classList.add('show');
        s.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });
})();
