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


// Shows: read data/shows.json (updated from Bandsintown every 6 hours by GitHub)
// and fill the "next show" strip and the show lists. No third-party cookies.
(function () {
  var lists = document.querySelectorAll('[data-shows]'), slots = document.querySelectorAll('[data-next-show]');
  if (!lists.length && !slots.length) return;
  var DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  function parse(s) { // "2026-11-27T22:00:00" = local time at the venue; keep it as written
    var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(s || '');
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    return { date: d, end: new Date(+m[1], +m[2] - 1, +m[3] + 1, 6),
             day: DAYS[d.getDay()] + ' ' + (+m[3]) + ' ' + MONTHS[+m[2] - 1], time: m[4] + ':' + m[5] };
  }
  function esc(t) { var e = document.createElement('span'); e.textContent = t || ''; return e.innerHTML; }
  function render(shows) {
    var now = new Date();
    shows = shows.map(function (s) { s.p = parse(s.datetime); return s; })
                 .filter(function (s) { return s.p && s.p.end > now; })
                 .sort(function (a, b) { return a.p.date - b.p.date; });
    lists.forEach(function (el) {
      if (!shows.length) { el.innerHTML = '<p class="shows-empty">No upcoming shows announced right now.</p>'; return; }
      el.innerHTML = '<ul class="shows">' + shows.map(function (s) {
        var title = s.title || ('Stemin @ ' + s.venue);
        var place = [s.venue, s.city].filter(Boolean).join(', ');
        var btn = s.free ? '<a class="button small" href="' + esc(s.url) + '" target="_blank" rel="noopener">Free · RSVP</a>'
                         : '<a class="button small" href="' + esc(s.ticket || s.url) + '" target="_blank" rel="noopener">Tickets</a>';
        return '<li><span class="sh-date"><strong>' + esc(s.p.day) + '</strong> · ' + esc(s.p.time) + '</span>' +
               '<span class="sh-title">' + esc(title) + '</span><span class="sh-place">' + esc(place) + '</span>' + btn + '</li>';
      }).join('') + '</ul>';
    });
    slots.forEach(function (el) {
      var sec = el.closest('.sec');
      if (!shows.length) { if (sec) sec.style.display = 'none'; return; }
      var s = shows[0], title = s.title || ('Stemin @ ' + s.venue);
      el.innerHTML = '<a class="next-show" href="' + esc(s.url) + '" target="_blank" rel="noopener">' +
        '<span class="ns-label">Next show</span><span class="ns-date">' + esc(s.p.day) + ' · ' + esc(s.p.time) + '</span>' +
        '<span class="ns-title">' + esc(title) + '</span><span class="ns-place">' + esc([s.venue, s.city].filter(Boolean).join(', ')) + '</span>' +
        (s.free ? '<span class="ns-note">Free</span>' : '') + '</a>';
      if (sec) sec.style.display = '';
    });
  }
  slots.forEach(function (el) { var sec = el.closest('.sec'); if (sec) sec.style.display = 'none'; });
  fetch('/data/shows.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(render)
    .catch(function () { lists.forEach(function (el) {
      el.innerHTML = '<p class="shows-empty"><a href="https://www.bandsintown.com/a/stemin" target="_blank" rel="noopener">See all dates on Bandsintown</a></p>'; }); });
})();

// Tell search engines about upcoming shows (structured data built from data/shows.json).
(function () {
  fetch('/data/shows.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (shows) {
    var now = new Date();
    var ev = shows.filter(function (s) { return s.datetime && new Date(s.datetime) > now; }).map(function (s) {
      return { '@type': 'MusicEvent', name: s.title || ('Stemin @ ' + s.venue), startDate: s.datetime,
        eventStatus: 'https://schema.org/EventScheduled', eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: { '@type': 'Place', name: s.venue, address: [s.city, s.country].filter(Boolean).join(', ') },
        performer: { '@type': 'MusicGroup', name: 'Stemin', url: 'https://steminmusic.com/' },
        image: 'https://steminmusic.com/img/og-image.jpg', url: s.url,
        offers: { '@type': 'Offer', url: s.ticket || s.url, price: s.free ? 0 : undefined, priceCurrency: 'EUR', availability: 'https://schema.org/InStock' } };
    });
    if (!ev.length) return;
    var el = document.createElement('script'); el.type = 'application/ld+json';
    el.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': ev });
    document.head.appendChild(el);
  }).catch(function () {});
})();
