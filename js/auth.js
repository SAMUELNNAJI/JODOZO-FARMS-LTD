/* ============================================================
   JODOZO FARMS LTD — Sign-in page logic
   Validates the admin credentials, then redirects to admin.html
   ============================================================ */
(function () {
  'use strict';

  /* Already signed in? Straight to the dashboard. */
  if (JF.isLogged()) { window.location.replace('admin.html'); return; }

  var form = document.getElementById('loginForm');
  var err = document.getElementById('lgErr');
  var busy = false;

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (busy) return;

      var email = document.getElementById('lgEmail').value.trim();
      var pass = document.getElementById('lgPass').value;
      var card = form;

      if (!email || !pass) { fail('Please enter both your email and password.'); return; }

      if (JF.login(email, pass)) {
        busy = true;
        card.classList.add('granted');
        var btn = form.querySelector('.btn-grad');
        if (btn) btn.innerHTML = 'Access granted — loading dashboard...';
        if (window.gsap) {
          gsap.to(card, { scale: 1.02, duration: .35, ease: 'power2.out' });
          setTimeout(function () { window.location.href = 'admin.html'; }, 620);
        } else {
          setTimeout(function () { window.location.href = 'admin.html'; }, 350);
        }
      } else {
        fail('Incorrect email or password. Please try again.');
      }
    });
  }

  function fail(msg) {
    if (!err) return;
    err.textContent = msg;
    err.classList.add('show');
    err.style.animation = 'none';
    void err.offsetWidth;
    err.style.animation = '';
    var pass = document.getElementById('lgPass');
    if (pass) pass.select();
  }

  var eye = document.getElementById('pwEye');
  if (eye) {
    eye.addEventListener('click', function () {
      var p = document.getElementById('lgPass');
      if (!p) return;
      var show = p.type === 'password';
      p.type = show ? 'text' : 'password';
      eye.classList.toggle('on', show);
      eye.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
  }

  /* Entrance animation */
  if (window.gsap) {
    gsap.fromTo('.login-panel h1', { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', delay: .1 });
    gsap.fromTo('.login-panel p, .l-chips span', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .7, stagger: .07, ease: 'power3.out', delay: .3 });
    gsap.fromTo('.login-card', { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', delay: .25 });
  }
})();