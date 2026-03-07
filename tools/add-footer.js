#!/usr/bin/env node
/**
 * Footer Navigation Injector for Video Poker Classic
 * Adds consistent footer links to all pages (game pages + index.html + category pages).
 * Creates site-wide internal linking structure.
 * Safe to run multiple times — uses marker comments.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const GAMES_DIR = path.join(ROOT, 'games');

const FT_START = '<!-- FOOTER-NAV-START -->';
const FT_END = '<!-- FOOTER-NAV-END -->';

// Footer for game pages (need ../ prefix for links)
function getGameFooter() {
  return `${FT_START}
<footer class="site-footer">
  <nav class="ft-cats">
    <a href="../index.html">Home</a>
    <a href="../category-classic.html">Classic</a>
    <a href="../category-bonus.html">Bonus</a>
    <a href="../category-wild.html">Wild</a>
    <a href="../category-joker.html">Joker</a>
  </nav>
  <nav class="ft-info">
    <a href="../how-to-play.html">How to Play</a>
    <a href="../strategy.html">Strategy</a>
    <a href="../odds.html">Odds</a>
    <a href="../glossary.html">Glossary</a>
    <a href="../faq.html">FAQ</a>
    <a href="../sitemap.html">Sitemap</a>
  </nav>
  <nav class="ft-legal">
    <a href="../about.html">About</a>
    <a href="../privacy.html">Privacy</a>
    <a href="../terms.html">Terms</a>
  </nav>
  <p>Video Poker Classic &bull; 120 Free Games &bull; No Download Required</p>
</footer>
<style>.site-footer{max-width:680px;margin:20px auto 0;padding:16px;text-align:center;border-top:1px solid #ffe033}.site-footer nav{display:flex;flex-wrap:wrap;justify-content:center;gap:6px 16px;margin-bottom:6px}.site-footer a{color:#c5d4f0;text-decoration:none;font-size:.72rem;letter-spacing:1px}.site-footer a:hover{color:#ffe033}.site-footer .ft-info a{color:#8899bb;font-size:.66rem}.site-footer .ft-info a:hover{color:#ffe033}.site-footer .ft-legal a{color:#667799;font-size:.62rem}.site-footer .ft-legal a:hover{color:#ffe033}.site-footer p{color:#8899bb;font-size:.64rem;letter-spacing:.5px;margin:4px 0 0}</style>
${FT_END}`;
}

// Footer for root-level pages (no prefix needed)
function getRootFooter() {
  return `${FT_START}
<div class="footer-nav">
  <div class="ft-row">
    <a href="index.html">Home</a>
    <a href="category-classic.html">Classic</a>
    <a href="category-bonus.html">Bonus</a>
    <a href="category-wild.html">Wild</a>
    <a href="category-joker.html">Joker</a>
  </div>
  <div class="ft-row ft-info">
    <a href="how-to-play.html">How to Play</a>
    <a href="strategy.html">Strategy</a>
    <a href="odds.html">Odds</a>
    <a href="glossary.html">Glossary</a>
    <a href="faq.html">FAQ</a>
    <a href="sitemap.html">Sitemap</a>
  </div>
  <div class="ft-row ft-legal">
    <a href="about.html">About</a>
    <a href="privacy.html">Privacy</a>
    <a href="terms.html">Terms</a>
  </div>
</div>
<style>.footer-nav{margin-top:16px;padding:14px;background:#000418;border:1px solid #1d2e5f;border-radius:8px;text-align:center}.footer-nav .ft-row{margin:4px 0}.footer-nav a{color:#9eb0d8;text-decoration:none;font-size:.72rem;letter-spacing:1px;margin:0 10px}.footer-nav a:hover{color:#ffe033}.footer-nav .ft-info a{color:#6b7fa8;font-size:.66rem}.footer-nav .ft-info a:hover{color:#ffe033}.footer-nav .ft-legal a{color:#556b8a;font-size:.62rem}.footer-nav .ft-legal a:hover{color:#ffe033}</style>
${FT_END}`;
}

function processFile(filePath, isGame) {
  let html = fs.readFileSync(filePath, 'utf-8');

  // Remove old footer
  html = html.replace(new RegExp(`${FT_START}[\\s\\S]*?${FT_END}\\n?`, 'g'), '');

  const footer = isGame ? getGameFooter() : getRootFooter();

  // Insert before </body>
  html = html.replace(/<\/body>/, `${footer}\n</body>`);

  fs.writeFileSync(filePath, html, 'utf-8');
}

// ─── Main ────────────────────────────────────────────────────────
let count = 0;

// Game files
const gameFiles = fs.readdirSync(GAMES_DIR).filter(f => f.endsWith('.html')).sort();
for (const gf of gameFiles) {
  processFile(path.join(GAMES_DIR, gf), true);
  count++;
}
console.log(`  ${gameFiles.length} game files`);

// Index.html
processFile(path.join(ROOT, 'index.html'), false);
count++;
console.log(`  index.html`);

// Category pages (they already have footers from generate-categories, but this makes them consistent)
// Skip category pages since they already have footers built in
// But let's update them too for consistency
const catFiles = fs.readdirSync(ROOT).filter(f => f.startsWith('category-') && f.endsWith('.html'));
// Skip category files — they have footers built into the template
// for (const cf of catFiles) { processFile(path.join(ROOT, cf), false); count++; }

// Other root pages (info pages + sitemap)
const otherPages = ['sitemap.html', 'how-to-play.html', 'strategy.html', 'glossary.html', 'odds.html', 'faq.html', 'about.html', 'privacy.html', 'terms.html'];
for (const op of otherPages) {
  const fp = path.join(ROOT, op);
  if (fs.existsSync(fp)) {
    processFile(fp, false);
    count++;
  }
}

console.log(`\nFooter navigation added to ${count} files`);
