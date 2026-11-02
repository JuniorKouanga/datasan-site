(function () {
  // Menu mobile
  var btn = document.querySelector('.menu-btn');
  var menu = document.getElementById('menu');
  if (btn && menu) {
    btn.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' && e.target.getAttribute('href').indexOf('#') !== -1) {
        menu.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Onglets (projets) avec ancre dans l'URL
  document.querySelectorAll('[data-tabs]').forEach(function (root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    function select(tab, focus, push) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
      if (push && history.replaceState) history.replaceState(null, '', '#' + tab.getAttribute('aria-controls'));
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t, false, true); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') n = tabs[0];
        if (e.key === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true, true); }
      });
    });
    function fromHash() {
      var id = location.hash.slice(1);
      var t = tabs.filter(function (x) { return x.getAttribute('aria-controls') === id; })[0];
      if (t) { select(t, false, false); root.scrollIntoView({ block: 'start' }); }
    }
    window.addEventListener('hashchange', fromHash);
    fromHash();
  });

  // Galerie photo
  var lb = document.querySelector('.lightbox');
  var gallery = document.querySelectorAll('.gallery button');
  if (lb && typeof lb.showModal === 'function') {
    var img = lb.querySelector('img');
    gallery.forEach(function (b) {
      b.addEventListener('click', function () {
        var t = b.querySelector('img');
        img.src = b.getAttribute('data-full');
        img.alt = t ? t.alt : '';
        lb.showModal();
      });
    });
    lb.querySelector('.lb-close').addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  } else {
    gallery.forEach(function (b) {
      b.addEventListener('click', function () { window.open(b.getAttribute('data-full'), '_blank'); });
    });
  }

  // Sommaire des textes juridiques : section en cours
  var toc = document.querySelector('.toc');
  if (toc && 'IntersectionObserver' in window) {
    var links = {};
    toc.querySelectorAll('a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var current = null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && links[en.target.id]) {
          if (current) current.classList.remove('current');
          current = links[en.target.id];
          current.classList.add('current');
          var aside = toc.closest('.legal-aside');
          if (aside && getComputedStyle(aside).position === 'sticky') {
            var r = current.getBoundingClientRect(), ar = aside.getBoundingClientRect();
            if (r.top < ar.top || r.bottom > ar.bottom) aside.scrollTop += r.top - ar.top - ar.height / 3;
          }
        }
      });
    }, { rootMargin: '-110px 0px -70% 0px' });
    document.querySelectorAll('.legal .article, .legal .legal-title').forEach(function (s) { io.observe(s); });
  }
})();
