(function () {
  var y = document.getElementById('y');
  if (y) y.textContent = new Date().getFullYear();

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
      if (e.target.tagName === 'A') {
        menu.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Galerie
  var lb = document.querySelector('.lightbox');
  if (lb && typeof lb.showModal === 'function') {
    var img = lb.querySelector('img');
    document.querySelectorAll('.gallery button').forEach(function (b) {
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
    document.querySelectorAll('.gallery button').forEach(function (b) {
      b.addEventListener('click', function () { window.open(b.getAttribute('data-full'), '_blank'); });
    });
  }
})();
