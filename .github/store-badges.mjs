// Badges App Store automatiques : dès qu'un jeu est en vente (API publique iTunes Lookup),
// remplace « Bientôt sur l'App Store » par un lien vers le jeu (badge maison du site).
// Lancé chaque jour par .github/workflows/store-badges.yml ; aussi à lancer avant de republier le site depuis idle-zoo/site (sources du site depuis le jeu n°3).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const APPS = { park: '6819715394', museum: '6820851219' }; // ponytail: ajouter zoo: '<identifiant>' dès que l'app Lulu Zoo existe dans App Store Connect
let changed = false;
for (const [game, id] of Object.entries(APPS)) {
  const r = await (await fetch(`https://itunes.apple.com/lookup?id=${id}&country=us`)).json();
  if (!r.resultCount) { console.log(game, 'pas encore en vente'); continue; }
  const url = `https://apps.apple.com/app/id${id}`;
  // page du jeu : le badge maison devient un lien « Download on the App Store » ; accueil : « Available on the App Store »
  const blocks = {
    'index.html': () => `<span class="tag"><span data-i="t77">Available on the App Store</span></span>`,
    [`lulu-${game}.html`]: (old) => old.replace('<span class="store" data-r>', `<a class="store" data-r href="${url}">`)
      .replace(/<span data-i="t37">[^<]*<\/span>/, '<span data-i="t78">Download on the</span>').replace(/<\/span><\/span>$/, '</span></a>'),
  };
  for (const [file, html] of Object.entries(blocks)) {
    const path = ROOT + file, s = readFileSync(path, 'utf8');
    const re = new RegExp(`<!--store:${game}-->[\\s\\S]*?<!--/store:${game}-->`);
    const out = s.replace(re, (m) => `<!--store:${game}-->${html(m.slice(`<!--store:${game}-->`.length, -`<!--/store:${game}-->`.length))}<!--/store:${game}-->`);
    if (out !== s) { writeFileSync(path, out); changed = true; console.log(game, '→', file); }
  }
}
console.log(changed ? 'modifié' : 'rien à changer');
