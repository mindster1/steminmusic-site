// Stemin site: mobile menu, slideshow, photo lightbox.
(function () {
  var btn = document.querySelector('.menu'), nav = document.querySelector('.nav');
  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
  function closeMenu() { nav.classList.remove('open'); btn.setAttribute('aria-expanded', false); document.body.style.overflow = ''; }
  btn.addEventListener('click', function () { document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : ''; });
  nav.addEventListener('click', function (e) { if (e.target === nav) closeMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  document.querySelectorAll('.slideshow').forEach(function (s) {
    var imgs = s.querySelectorAll('img'), i = 0;
    function show(n) { imgs[i].classList.remove('on'); i = (n + imgs.length) % imgs.length; imgs[i].classList.add('on'); }
    s.querySelector('.prev').addEventListener('click', function () { show(i - 1); });
    s.querySelector('.next').addEventListener('click', function () { show(i + 1); });
    var timer = setInterval(function () { show(i + 1); }, 5000), x0 = null;
    s.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; clearInterval(timer); }, { passive: true });
    s.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) show(dx < 0 ? i + 1 : i - 1);
      x0 = null;
    });
  });

  var lb = document.querySelector('.lightbox'), lbImg = lb.querySelector('img');
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a.lb');
    if (!a) return;
    e.preventDefault();
    lbImg.src = a.getAttribute('href');
    lb.hidden = false;
  });
  function close() { lb.hidden = true; lbImg.src = ''; }
  lb.addEventListener('click', function (e) { if (e.target !== lbImg) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
})();

// Cookie consent: YouTube videos and the Bandsintown widget load only after "Accept".
(function () {
  var KEY = 'stemin-consent';
  var banner = document.querySelector('.cookie-banner');
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function loadEmbeds() {
    document.querySelectorAll('.video[data-yt]').forEach(function (v) {
      if (v.querySelector('iframe')) return;
      v.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + v.getAttribute('data-yt') +
        '?rel=0" title="Stemin video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    });
    if (document.querySelector('.bit-widget-initializer') && !document.getElementById('bit-js')) {
      document.querySelectorAll('.bit-ph').forEach(function (p) { p.remove(); });
      var s = document.createElement('script');
      s.id = 'bit-js'; s.charset = 'utf-8'; s.src = 'https://widgetv3.bandsintown.com/main.min.js';
      document.body.appendChild(s);
    }
  }
  function accept() { set('accepted'); banner.hidden = true; loadEmbeds(); }
  function decline() { set('declined'); banner.hidden = true; }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-consent-accept]')) { e.preventDefault(); accept(); }
    else if (e.target.closest('[data-consent-decline]')) { e.preventDefault(); decline(); }
    else if (e.target.closest('[data-consent-open]')) { e.preventDefault(); banner.hidden = false; }
  });

  var c = get();
  if (c === 'accepted') loadEmbeds();
  else if (c !== 'declined') banner.hidden = false;
})();

// Hide the "next show" strip once the show has passed.
(function () {
  document.querySelectorAll('.next-show[data-until]').forEach(function (el) {
    var until = new Date(el.getAttribute('data-until') + 'T00:00:00');
    if (new Date() >= until) { var sec = el.closest('.sec'); (sec || el).hidden = true; if (sec) sec.style.display = 'none'; }
  });
})();
