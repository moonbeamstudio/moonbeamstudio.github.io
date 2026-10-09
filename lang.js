// Langue : anglais par défaut, français si l'iPhone/le navigateur est en français ; bouton FR/EN mémorisé.
(function () {
  var l; try { l = localStorage.getItem('l'); } catch (e) {}
  l = l || ((navigator.language || 'en').slice(0, 2) === 'fr' ? 'fr' : 'en');
  document.documentElement.dataset.l = l;
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.lang')) return;
    l = l === 'fr' ? 'en' : 'fr';
    document.documentElement.dataset.l = l;
    try { localStorage.setItem('l', l); } catch (e) {}
  });
})();
