#!/usr/bin/env node
/**
 * Sitemap Generator for Video Poker Classic
 * Scans all HTML files and generates sitemap.xml with proper priorities.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const GAMES_DIR = path.join(ROOT, 'games');
const SITE = 'https://videopoker-web.pages.dev';

function getLastMod(filePath) {
  const stat = fs.statSync(filePath);
  return stat.mtime.toISOString().split('T')[0]; // YYYY-MM-DD
}

function buildEntries() {
  const entries = [];

  // Homepage — highest priority
  entries.push({
    loc: `${SITE}/`,
    lastmod: getLastMod(path.join(ROOT, 'index.html')),
    changefreq: 'weekly',
    priority: '1.0'
  });

  // Category pages (if they exist)
  const categoryFiles = fs.readdirSync(ROOT).filter(f => f.startsWith('category-') && f.endsWith('.html'));
  for (const cf of categoryFiles) {
    entries.push({
      loc: `${SITE}/${cf}`,
      lastmod: getLastMod(path.join(ROOT, cf)),
      changefreq: 'weekly',
      priority: '0.9'
    });
  }

  // Informational pages
  const infoPages = ['how-to-play.html', 'strategy.html', 'glossary.html', 'odds.html', 'faq.html', 'sitemap.html'];
  for (const ip of infoPages) {
    const fp = path.join(ROOT, ip);
    if (fs.existsSync(fp)) {
      entries.push({
        loc: `${SITE}/${ip}`,
        lastmod: getLastMod(fp),
        changefreq: 'monthly',
        priority: '0.8'
      });
    }
  }

  // Game pages — high priority content pages
  const gameFiles = fs.readdirSync(GAMES_DIR).filter(f => f.endsWith('.html')).sort();
  for (const gf of gameFiles) {
    entries.push({
      loc: `${SITE}/games/${gf}`,
      lastmod: getLastMod(path.join(GAMES_DIR, gf)),
      changefreq: 'monthly',
      priority: '0.7'
    });
  }

  // Trust pages
  const trustPages = ['about.html', 'privacy.html', 'terms.html'];
  for (const tp of trustPages) {
    const fp = path.join(ROOT, tp);
    if (fs.existsSync(fp)) {
      entries.push({
        loc: `${SITE}/${tp}`,
        lastmod: getLastMod(fp),
        changefreq: 'yearly',
        priority: '0.3'
      });
    }
  }

  return entries;
}

function generateXML(entries) {
  const urls = entries.map(e => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

// Run
const entries = buildEntries();
const xml = generateXML(entries);
const outPath = path.join(ROOT, 'sitemap.xml');
fs.writeFileSync(outPath, xml, 'utf-8');
console.log(`sitemap.xml generated with ${entries.length} URLs`);
