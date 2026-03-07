#!/usr/bin/env node
/**
 * Meta Tags Injector for Video Poker Classic
 * Adds canonical URLs, Open Graph, and Twitter Card meta tags to all HTML pages.
 *
 * Injects after the <meta name="description"> tag in each file.
 * Safe to run multiple times — removes old injected tags before re-injecting.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const GAMES_DIR = path.join(ROOT, 'games');
const SITE = 'https://videopoker-web.pages.dev';
const OG_IMAGE = `${SITE}/assets/hero/hero-vp-premium.png`;

// Marker comments for idempotent injection
const START_MARKER = '<!-- SEO-META-START -->';
const END_MARKER = '<!-- SEO-META-END -->';

function extractMeta(html) {
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
  return {
    title: titleMatch ? titleMatch[1] : 'Video Poker Classic',
    description: descMatch ? descMatch[1] : 'Play free video poker online.'
  };
}

function buildMetaTags(url, title, description) {
  return `${START_MARKER}
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${OG_IMAGE}">
<meta property="og:site_name" content="Video Poker Classic">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${OG_IMAGE}">
${END_MARKER}`;
}

function processFile(filePath, url) {
  let html = fs.readFileSync(filePath, 'utf-8');

  // Remove old injected tags if present
  const markerRegex = new RegExp(`${START_MARKER}[\\s\\S]*?${END_MARKER}\\n?`, 'g');
  html = html.replace(markerRegex, '');

  const { title, description } = extractMeta(html);
  const metaTags = buildMetaTags(url, title, description);

  // Insert after <meta name="description" ...> line
  const descRegex = /(<meta\s+name="description"\s+content="[^"]+">)\n/;
  if (descRegex.test(html)) {
    html = html.replace(descRegex, `$1\n${metaTags}\n`);
  } else {
    // Fallback: insert after <meta name="viewport" ...>
    const vpRegex = /(<meta\s+name="viewport"[^>]+>)\n/;
    html = html.replace(vpRegex, `$1\n${metaTags}\n`);
  }

  fs.writeFileSync(filePath, html, 'utf-8');
  return title;
}

// Process index.html
let count = 0;
processFile(path.join(ROOT, 'index.html'), `${SITE}/`);
count++;
console.log(`  index.html`);

// Process all game files
const gameFiles = fs.readdirSync(GAMES_DIR).filter(f => f.endsWith('.html')).sort();
for (const gf of gameFiles) {
  const url = `${SITE}/games/${gf}`;
  processFile(path.join(GAMES_DIR, gf), url);
  count++;
}
console.log(`  ${gameFiles.length} game files`);

// Process any category pages
const categoryFiles = fs.readdirSync(ROOT).filter(f => f.startsWith('category-') && f.endsWith('.html'));
for (const cf of categoryFiles) {
  processFile(path.join(ROOT, cf), `${SITE}/${cf}`);
  count++;
}

// Process info pages
const infoPages = ['how-to-play.html', 'strategy.html', 'glossary.html', 'odds.html', 'faq.html',
                   'about.html', 'privacy.html', 'terms.html', 'sitemap.html'];
for (const ip of infoPages) {
  const fp = path.join(ROOT, ip);
  if (fs.existsSync(fp)) {
    processFile(fp, `${SITE}/${ip}`);
    count++;
  }
}

console.log(`\nMeta tags injected into ${count} files`);
