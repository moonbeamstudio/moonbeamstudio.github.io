// Langue du site : choix mémorisé, sinon langue de l'appareil (7 langues, comme les jeux), sinon anglais.
// L'anglais est écrit dans les pages ; les autres langues viennent de i18n.js (éléments data-i="tN").
(function () {
  var SUP = ['en', 'fr', 'es', 'pt', 'de', 'it', 'ja'], de = document.documentElement, l;
  try { l = localStorage.getItem('l'); } catch (e) {}
  if (SUP.indexOf(l) < 0) {
    l = 'en';
    var ls = navigator.languages || [navigator.language || 'en'];
    for (var i = 0; i < ls.length; i++) { var c = (ls[i] || '').slice(0, 2).toLowerCase(); if (SUP.indexOf(c) >= 0) { l = c; break; } }
  }
  function apply() {
    var t = (window.I18N || {})[l];
    document.querySelectorAll('[data-i]').forEach(function (e) {
      if (e.dataset.en == null) e.dataset.en = e.innerHTML;
      var v = l !== 'en' && t ? t[e.dataset.i] : null;
      e.innerHTML = v != null ? v : e.dataset.en;
    });
    document.querySelectorAll('.lang select').forEach(function (s) { s.value = l; });
    de.lang = l; de.dataset.l = l;
  }
  de.lang = l; de.dataset.l = l;
  window.setLang = function (x) { l = x; try { localStorage.setItem('l', l); } catch (e) {} apply(); };
  document.addEventListener('DOMContentLoaded', apply);
  document.addEventListener('change', function (e) { if (e.target.closest && e.target.closest('.lang')) window.setLang(e.target.value); });
})();
