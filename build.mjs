// Génère le site statique dans public/ à partir de src/.
// Aucune dépendance : `node build.mjs` (lancé aussi par `npm run build` sur Cloudflare).
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';

const SRC = 'src';
const OUT = 'public';
const layout = readFileSync(join(SRC, 'layout.html'), 'utf8');
const news = JSON.parse(readFileSync(join(SRC, 'data', 'news.json'), 'utf8'));
const legal = {
  statuts: JSON.parse(readFileSync(join(SRC, 'data', 'statuts.json'), 'utf8')),
  ri: JSON.parse(readFileSync(join(SRC, 'data', 'ri.json'), 'utf8')),
};
const version = '20261104';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmtDate = (iso) => new Date(iso + 'T12:00:00Z').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

function newsCard(n, cls = '') {
  const img = n.image
    ? `<img src="${n.image}" alt="" loading="lazy" width="800" height="600">`
    : `<div class="card-ph" aria-hidden="true"><span>${esc(n.category)}</span></div>`;
  return `<article class="news-card ${cls}">
  <a href="${n.url}" class="news-card-link">
    <div class="news-card-media">${img}</div>
    <div class="news-card-body">
      <p class="meta"><span class="cat">${esc(n.category)}</span><time datetime="${n.date}">${fmtDate(n.date)}</time></p>
      <h3>${esc(n.title)}</h3>
      <p>${esc(n.summary)}</p>
      <span class="more">Lire l'article</span>
    </div>
  </a>
</article>`;
}

const tokens = {
  news_all: news.map((n) => newsCard(n)).join('\n'),
  news_latest: news.slice(1, 4).map((n) => newsCard(n)).join('\n'),
  news_others: (path) => news.filter((n) => n.url !== path).slice(0, 3).map((n) => newsCard(n, 'compact')).join('\n'),
  statuts_toc: legal.statuts.toc,
  statuts_body: legal.statuts.body,
  ri_toc: legal.ri.toc,
  ri_body: legal.ri.body,
};

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const navKeys = ['accueil', 'association', 'projets', 'expertise', 'statuts', 'ri', 'actualites', 'contact'];
let count = 0;
for (const file of walk(join(SRC, 'pages')).filter((f) => f.endsWith('.html'))) {
  let raw = readFileSync(file, 'utf8');
  const m = raw.match(/^<!--meta\s*([\s\S]*?)-->\s*/);
  if (!m) throw new Error(`Métadonnées manquantes : ${file}`);
  const meta = JSON.parse(m[1]);
  let content = raw.slice(m[0].length);
  const rel = relative(join(SRC, 'pages'), file).replace(/\\/g, '/');
  const path = '/' + rel.replace(/index\.html$/, '').replace(/\.html$/, '');

  content = content.replace(/\{\{(\w+)\}\}/g, (all, k) => {
    if (k === 'news_others') return tokens.news_others(path);
    return k in tokens ? tokens[k] : all;
  });

  const vars = {
    title: meta.title === 'DataSan Systems' ? meta.title : `${meta.title} — DataSan Systems`,
    description: meta.description,
    path,
    ogtype: meta.ogtype || 'website',
    ogimage: meta.ogimage || '/assets/img/og.jpg',
    head: meta.head || '',
    bodyclass: meta.nav || 'page',
    version,
    year: '2026',
    content,
  };
  for (const k of navKeys) vars['nav_' + k] = meta.nav === k ? 'active' : '';
  const html = layout.replace(/\{\{(\w+)\}\}/g, (all, k) => (k in vars ? vars[k] : all));
  const leftover = html.match(/\{\{\w+\}\}/);
  if (leftover) throw new Error(`Jeton non remplacé ${leftover[0]} dans ${file}`);

  const out = join(OUT, rel);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  count++;
}

// Plan du site
const urls = walk(join(SRC, 'pages'))
  .filter((f) => f.endsWith('index.html'))
  .map((f) => '/' + relative(join(SRC, 'pages'), f).replace(/\\/g, '/').replace(/index\.html$/, ''));
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>https://www.datasan.net${u}</loc></url>`).join('\n')}
</urlset>
`);
console.log(`${count} pages générées dans ${OUT}/`);
