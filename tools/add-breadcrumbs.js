#!/usr/bin/env node
/**
 * Breadcrumb Injector for Video Poker Classic
 * Adds visual breadcrumb nav + BreadcrumbList JSON-LD schema to all 120 game pages.
 * Safe to run multiple times — uses marker comments.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const GAMES_DIR = path.join(ROOT, 'games');
const SITE = 'https://videopoker-web.pages.dev';

const BC_START = '<!-- BREADCRUMB-START -->';
const BC_END = '<!-- BREADCRUMB-END -->';
const BC_SCHEMA_START = '<!-- BREADCRUMB-SCHEMA-START -->';
const BC_SCHEMA_END = '<!-- BREADCRUMB-SCHEMA-END -->';

// ─── Category mapping ─────────────────────────────────────────────
const CATEGORIES = {
  classic: { name: 'Classic Video Poker', slug: 'category-classic.html',
    match: id => /^(jacks-or-better|tens-or-better|nines-or-better|kings-or-better|queens-or-better|eights-or-better|sixes-or-better|aces-or-better|two-pair-or-better)/.test(id) },
  bonus: { name: 'Bonus Poker Games', slug: 'category-bonus.html',
    match: id => /^(bonus-poker|double-bonus|double-double-bonus|triple-bonus|triple-double-bonus|bonus-poker-deluxe|super-double-bonus|aces-and-faces|aces-and-eights|white-hot-aces|super-aces|all-american|nevada-bonus|royal-aces|ultra-bonus)/.test(id) },
  wild: { name: 'Wild Card Games', slug: 'category-wild.html',
    match: id => /^(deuces-wild|bonus-deuces|loose-deuces|double-deuces|short-pay-deuces|illinois-deuces|colorado-deuces|airport-deuces|nsu-deuces|downtown-deuces|vegas-strip-deuces|reno-deuces|atlantic-city-deuces|missouri-deuces|sevens-wild|threes-wild|fours-wild|fives-wild|eights-wild|tens-wild)/.test(id) },
  joker: { name: 'Joker Poker Games', slug: 'category-joker.html',
    match: id => /^(joker-poker|double-joker|deuces-and-joker)/.test(id) }
};

function getCategory(gameId) {
  for (const [, cat] of Object.entries(CATEGORIES)) {
    if (cat.match(gameId)) return cat;
  }
  return CATEGORIES.classic; // fallback
}

function extractTitle(html) {
  const m = html.match(/<title>([^<]+)<\/title>/);
  return m ? m[1].replace(/ Video Poker.*$/, '').replace(/ - .*$/, '') : 'Video Poker';
}

function processFile(filePath, gameId) {
  let html = fs.readFileSync(filePath, 'utf-8');
  const gameName = extractTitle(html);
  const cat = getCategory(gameId);
  const gameUrl = `${SITE}/games/${gameId}.html`;

  // Remove old breadcrumbs
  html = html.replace(new RegExp(`${BC_START}[\\s\\S]*?${BC_END}\\n?`, 'g'), '');
  html = html.replace(new RegExp(`${BC_SCHEMA_START}[\\s\\S]*?${BC_SCHEMA_END}\\n?`, 'g'), '');

  // BreadcrumbList schema
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: cat.name, item: `${SITE}/${cat.slug}` },
      { '@type': 'ListItem', position: 3, name: gameName, item: gameUrl }
    ]
  };

  // Inject schema before </head>
  const schemaBlock = `${BC_SCHEMA_START}\n<script type="application/ld+json">\n${JSON.stringify(schema)}\n</script>\n${BC_SCHEMA_END}`;
  html = html.replace('</head>', `${schemaBlock}\n</head>`);

  // Visual breadcrumb CSS + HTML — inject after <header>...</header>
  const bcCSS = `<style>.bc{padding:6px 12px;font-size:.7rem;color:#7f91b9;letter-spacing:.5px;max-width:680px;margin:0 auto}.bc a{color:#ffe033;text-decoration:none}.bc a:hover{text-decoration:underline}</style>`;
  const bcHTML = `<nav class="bc" aria-label="Breadcrumb"><a href="../index.html">Home</a> &rsaquo; <a href="../${cat.slug}">${cat.name}</a> &rsaquo; ${gameName}</nav>`;
  const bcBlock = `${BC_START}\n${bcCSS}\n${bcHTML}\n${BC_END}`;

  // Insert after closing </header>
  html = html.replace(/<\/header>/, `</header>\n${bcBlock}`);

  fs.writeFileSync(filePath, html, 'utf-8');
}

// ─── Main ────────────────────────────────────────────────────────
const gameFiles = fs.readdirSync(GAMES_DIR).filter(f => f.endsWith('.html')).sort();
let count = 0;
for (const gf of gameFiles) {
  const gameId = gf.replace('.html', '');
  processFile(path.join(GAMES_DIR, gf), gameId);
  count++;
}
console.log(`Breadcrumbs added to ${count} game files`);
