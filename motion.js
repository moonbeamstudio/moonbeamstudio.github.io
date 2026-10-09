// Motion design du site : apparitions au défilement, titres mot à mot, inclinaison 3D, étoiles filantes,
// compteurs, défilement horizontal des captures piloté par le scroll, halo qui suit le curseur.
(function () {
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(pointer: fine)').matches;
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  document.addEventListener('DOMContentLoaded', function () {
    document.documentElement.classList.add('js');

    // titres découpés en mots qui montent un par un
    $$('[data-words]').forEach(function (h) {
      var tw = document.createTreeWalker(h, NodeFilter.SHOW_TEXT), nodes = [];
      while (tw.nextNode()) if (tw.currentNode.textContent.trim()) nodes.push(tw.currentNode);
      nodes.forEach(function (n) {
        var f = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (w) {
          if (!w) return;
          if (/^\s+$/.test(w)) { f.appendChild(document.createTextNode(w)); return; }
          var o = document.createElement('span'); o.className = 'w';
          var i = document.createElement('span'); i.textContent = w; o.appendChild(i); f.appendChild(o);
        });
        n.replaceWith(f);
      });
      // délai par langue, pour que la version affichée commence tout de suite
      $$('[lang]', h).concat([h]).forEach(function (el) { $$(':scope .w > span', el).forEach(function (s, k) { s.style.transitionDelay = k * 70 + 'ms'; }); });
    });

    // apparitions au défilement (avec décalage entre frères)
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); count(e.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    $$('[data-r], [data-words]').forEach(function (el) {
      var sib = el.parentElement ? $$(':scope > [data-r]', el.parentElement) : [];
      el.style.setProperty('--d', Math.max(0, sib.indexOf(el)) * 110 + 'ms');
      io.observe(el);
    });

    // compteurs
    function count(root) {
      $$('[data-count]', root).concat(root.dataset && root.dataset.count ? [root] : []).forEach(function (el) {
        var to = +el.dataset.count, t0 = null;
        if (still) { el.textContent = to; return; }
        requestAnimationFrame(function step(t) {
          t0 = t0 || t; var p = Math.min(1, (t - t0) / 1400);
          el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        });
      });
    }

    // barre de progression de lecture
    var bar = document.querySelector('.progress');
    function onScroll() {
      var h = document.documentElement, p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
      if (bar) bar.style.transform = 'scaleX(' + p + ')';
      document.documentElement.style.setProperty('--sy', h.scrollTop);
      // captures : défilement horizontal piloté par le scroll vertical (ordinateur)
      $$('.rail').forEach(function (rail) {
        var track = rail.querySelector('.shots'); if (!track || !rail.classList.contains('on')) return;
        var r = rail.getBoundingClientRect(), max = track.scrollWidth - innerWidth;
        var q = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
        track.style.transform = 'translate3d(' + (-q * max) + 'px,0,0)';
        rail.style.setProperty('--q', q);
      });
    }
    function sizeRails() {
      $$('.rail').forEach(function (rail) {
        var track = rail.querySelector('.shots');
        var on = !still && innerWidth > 860 && track.scrollWidth > innerWidth;
        rail.classList.toggle('on', on);
        rail.style.height = on ? ((track.scrollWidth - innerWidth) * 1.6 + innerHeight) + 'px' : '';
        if (!on) track.style.transform = '';
      });
      onScroll();
    }
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', sizeRails);
    addEventListener('load', sizeRails); sizeRails();

    if (still) return;

    // étoiles filantes
    var sky = document.querySelector('.sky');
    (function shoot() {
      if (sky && !document.hidden) {
        var s = document.createElement('i'); s.className = 'shoot';
        s.style.left = 30 + Math.random() * 70 + '%'; s.style.top = Math.random() * 40 + '%';
        sky.appendChild(s); setTimeout(function () { s.remove(); }, 1600);
      }
      setTimeout(shoot, 2500 + Math.random() * 4000);
    })();

    if (!fine) return;

    // halo qui suit le curseur + parallaxe du héros
    var glow = document.querySelector('.glow'), stage = document.querySelector('.stage');
    addEventListener('pointermove', function (e) {
      if (glow) glow.style.transform = 'translate(' + (e.clientX - 300) + 'px,' + (e.clientY - 300) + 'px)';
      if (stage) {
        var x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
        stage.style.setProperty('--mx', x); stage.style.setProperty('--my', y);
      }
    });

    // inclinaison 3D + reflet sur les cartes et téléphones
    $$('[data-tilt]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--rx', (0.5 - y) * 10 + 'deg'); el.style.setProperty('--ry', (x - 0.5) * 12 + 'deg');
        el.style.setProperty('--gx', x * 100 + '%'); el.style.setProperty('--gy', y * 100 + '%');
        el.classList.add('tilting');
      });
      el.addEventListener('pointerleave', function () { el.classList.remove('tilting'); el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
  });
})();
