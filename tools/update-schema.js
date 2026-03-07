#!/usr/bin/env node
/**
 * Enhanced Schema.org Updater for Pure Video Poker
 *
 * - Game pages: upgrades basic "Game" to rich "VideoGame" schema
 * - Homepage: adds WebSite + ItemList schema listing all 120 games
 *
 * Safe to run multiple times — replaces entire ld+json block.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const GAMES_DIR = path.join(ROOT, 'games');
const SITE = 'https://purevideopoker.com';

// ─── Helper: extract existing title & description ────────────────
function extractMeta(html) {
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
  return {
    title: titleMatch ? titleMatch[1].replace(/ - Play Free Online \| No Download$/, '') : 'Video Poker',
    description: descMatch ? descMatch[1] : 'Play free video poker online.'
  };
}

// ─── Build VideoGame schema for game pages ───────────────────────
function buildGameSchema(filename, title, description) {
  const url = `${SITE}/games/${filename}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    'name': title,
    'description': description,
    'url': url,
    'image': `${SITE}/assets/hero/hero-vp-premium.png`,
    'gamePlatform': ['Web Browser', 'Mobile Web'],
    'applicationCategory': 'GameApplication',
    'genre': ['Casino', 'Card Game', 'Video Poker'],
    'inLanguage': 'en',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
      'availability': 'https://schema.org/InStock'
    },
    'author': {
      '@type': 'Organization',
      'name': 'Pure Video Poker'
    },
    'datePublished': '2026-03-01',
    'operatingSystem': 'Any'
  };
}

// ─── Build homepage schemas ──────────────────────────────────────
function buildHomepageSchemas(gameFiles) {
  const webSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Pure Video Poker',
    'url': `${SITE}/`,
    'description': '120 classic video poker variants with casino-style UI. Play free online — no download, no registration.',
    'inLanguage': 'en',
    'author': {
      '@type': 'Organization',
      'name': 'Pure Video Poker'
    }
  };

  const items = gameFiles.map((gf, i) => {
    const html = fs.readFileSync(path.join(GAMES_DIR, gf), 'utf-8');
    const { title } = extractMeta(html);
    return {
      '@type': 'ListItem',
      'position': i + 1,
      'name': title,
      'url': `${SITE}/games/${gf}`
    };
  });

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'Video Poker Games',
    'description': 'All 120 video poker variants available for free play',
    'numberOfItems': items.length,
    'itemListElement': items
  };

  return [webSite, itemList];
}

// ─── Process a game file ─────────────────────────────────────────
function processGameFile(filePath, filename) {
  let html = fs.readFileSync(filePath, 'utf-8');
  const { title, description } = extractMeta(html);

  const schema = buildGameSchema(filename, title, description);
  const jsonLd = JSON.stringify(schema);

  // Replace existing ld+json script block
  const ldRegex = /<script type="application\/ld\+json">\s*[\s\S]*?<\/script>/;
  if (ldRegex.test(html)) {
    html = html.replace(ldRegex, `<script type="application/ld+json">\n${jsonLd}\n</script>`);
  }

  fs.writeFileSync(filePath, html, 'utf-8');
}

// ─── Process homepage ────────────────────────────────────────────
function processHomepage(gameFiles) {
  const filePath = path.join(ROOT, 'index.html');
  let html = fs.readFileSync(filePath, 'utf-8');

  const schemas = buildHomepageSchemas(gameFiles);
  const scriptBlocks = schemas.map(s => `<script type="application/ld+json">\n${JSON.stringify(s)}\n</script>`).join('\n');

  // Check if ld+json already exists on homepage
  const ldRegex = /<script type="application\/ld\+json">\s*[\s\S]*?<\/script>/g;
  const existingMatches = html.match(ldRegex);

  if (existingMatches && existingMatches.length > 0) {
    // Remove ALL existing ld+json blocks
    html = html.replace(ldRegex, '');
    // Clean up empty lines left behind
    html = html.replace(/\n{3,}/g, '\n');
  }

  // Insert before </head>
  html = html.replace('</head>', `${scriptBlocks}\n</head>`);

  fs.writeFileSync(filePath, html, 'utf-8');
}

// ─── Main ────────────────────────────────────────────────────────
const gameFiles = fs.readdirSync(GAMES_DIR).filter(f => f.endsWith('.html')).sort();

// Process all game files
let count = 0;
for (const gf of gameFiles) {
  processGameFile(path.join(GAMES_DIR, gf), gf);
  count++;
}
console.log(`  ${count} game files updated with VideoGame schema`);

// Process homepage
processHomepage(gameFiles);
console.log(`  index.html updated with WebSite + ItemList schema (${gameFiles.length} games)`);

console.log(`\nSchema.org updated for ${count + 1} files`);
