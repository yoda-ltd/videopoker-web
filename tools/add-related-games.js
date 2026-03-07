#!/usr/bin/env node
/**
 * Related Games Cross-Linker for Pure Video Poker
 * Adds a "Related Games" section with 4-6 links after the SEO content on each game page.
 * Links to: same-family variants + same-category siblings.
 * Safe to run multiple times — uses marker comments.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const GAMES_DIR = path.join(ROOT, 'games');
const SITE = 'https://purevideopoker.com';

const RG_START = '<!-- RELATED-GAMES-START -->';
const RG_END = '<!-- RELATED-GAMES-END -->';

// ─── Family grouping (same base game, different pay tables) ──────
const FAMILIES = {
  'jacks-or-better': ['jacks-or-better', 'jacks-or-better-95', 'jacks-or-better-86', 'jacks-or-better-85', 'jacks-or-better-75', 'jacks-or-better-65'],
  'tens-or-better': ['tens-or-better', 'tens-or-better-75'],
  'nines-or-better': ['nines-or-better', 'nines-or-better-75'],
  'kings-or-better': ['kings-or-better', 'kings-or-better-75'],
  'bonus-poker': ['bonus-poker', 'bonus-poker-107', 'bonus-poker-75', 'bonus-poker-65'],
  'double-bonus': ['double-bonus-poker', 'double-bonus-106', 'double-bonus-97', 'double-bonus-96', 'double-bonus-95', 'double-bonus-85'],
  'double-double-bonus': ['double-double-bonus-poker', 'double-double-bonus-106', 'double-double-bonus-96', 'double-double-bonus-85', 'double-double-bonus-75', 'double-double-bonus-65'],
  'triple-bonus': ['triple-bonus-poker', 'triple-bonus-96', 'triple-bonus-85', 'triple-bonus-75'],
  'triple-double-bonus': ['triple-double-bonus-poker', 'triple-double-bonus-97', 'triple-double-bonus-95', 'triple-double-bonus-85', 'triple-double-bonus-75'],
  'bonus-poker-deluxe': ['bonus-poker-deluxe', 'bonus-poker-deluxe-96', 'bonus-poker-deluxe-85', 'bonus-poker-deluxe-75', 'bonus-poker-deluxe-65'],
  'super-double-bonus': ['super-double-bonus', 'super-double-bonus-96', 'super-double-bonus-75'],
  'aces-and-faces': ['aces-and-faces', 'aces-and-faces-85', 'aces-and-faces-76', 'aces-and-faces-75'],
  'aces-and-eights': ['aces-and-eights', 'aces-and-eights-86', 'aces-and-eights-75'],
  'white-hot-aces': ['white-hot-aces', 'white-hot-aces-85', 'white-hot-aces-65'],
  'super-aces-bonus': ['super-aces-bonus', 'super-aces-bonus-85', 'super-aces-bonus-65'],
  'all-american-poker': ['all-american-poker', 'all-american-poker-86', 'all-american-poker-66'],
  'deuces-wild': ['deuces-wild', 'nsu-deuces-wild', 'short-pay-deuces-wild', 'downtown-deuces-wild', 'illinois-deuces-wild', 'colorado-deuces-wild', 'airport-deuces-wild', 'vegas-strip-deuces-wild', 'reno-deuces-wild', 'atlantic-city-deuces-wild', 'missouri-deuces-wild'],
  'bonus-deuces-wild': ['bonus-deuces-wild', 'bonus-deuces-wild-1343', 'bonus-deuces-wild-1243', 'bonus-deuces-wild-1043'],
  'loose-deuces-wild': ['loose-deuces-wild', 'loose-deuces-wild-1510', 'loose-deuces-wild-128'],
  'double-deuces-wild': ['double-deuces-wild', 'double-deuces-wild-1510', 'double-deuces-wild-128'],
  'deuces-wild-bonus': ['deuces-wild-bonus', 'deuces-wild-bonus-1643', 'deuces-wild-bonus-1243'],
  'deuces-wild-deluxe': ['deuces-wild-deluxe', 'deuces-wild-deluxe-1643', 'deuces-wild-deluxe-1243'],
  'sevens-wild': ['sevens-wild', 'sevens-wild-2515', 'sevens-wild-2010'],
  'joker-poker': ['joker-poker', 'joker-poker-85', 'joker-poker-75', 'joker-poker-65'],
  'joker-poker-aces': ['joker-poker-aces', 'joker-poker-aces-75', 'joker-poker-aces-65'],
  'joker-poker-twopair': ['joker-poker-twopair', 'joker-poker-twopair-85', 'joker-poker-twopair-75'],
  'double-joker-poker': ['double-joker-poker', 'double-joker-poker-75', 'double-joker-poker-55'],
  'deuces-and-joker-wild': ['deuces-and-joker-wild', 'deuces-and-joker-wild-85', 'deuces-and-joker-wild-65'],
};

// Siblings: related but different game types within same category
const CATEGORY_SIBLINGS = {
  classic: ['jacks-or-better', 'tens-or-better', 'nines-or-better', 'kings-or-better', 'queens-or-better', 'eights-or-better', 'sixes-or-better', 'aces-or-better', 'two-pair-or-better'],
  bonus: ['bonus-poker', 'double-bonus-poker', 'double-double-bonus-poker', 'triple-bonus-poker', 'triple-double-bonus-poker', 'bonus-poker-deluxe', 'super-double-bonus', 'aces-and-faces', 'aces-and-eights', 'white-hot-aces', 'super-aces-bonus', 'all-american-poker', 'nevada-bonus-poker', 'royal-aces-bonus', 'ultra-bonus-poker'],
  wild: ['deuces-wild', 'bonus-deuces-wild', 'loose-deuces-wild', 'double-deuces-wild', 'deuces-wild-bonus', 'deuces-wild-deluxe', 'nsu-deuces-wild', 'sevens-wild', 'threes-wild', 'fours-wild'],
  joker: ['joker-poker', 'joker-poker-aces', 'joker-poker-twopair', 'double-joker-poker', 'deuces-and-joker-wild'],
};

// Map game ID to category
function getGameCategory(gameId) {
  const cats = {
    classic: id => /^(jacks-or-better|tens-or-better|nines-or-better|kings-or-better|queens-or-better|eights-or-better|sixes-or-better|aces-or-better|two-pair-or-better)/.test(id),
    bonus: id => /^(bonus-poker|double-bonus|double-double-bonus|triple-bonus|triple-double-bonus|bonus-poker-deluxe|super-double-bonus|aces-and-faces|aces-and-eights|white-hot-aces|super-aces|all-american|nevada-bonus|royal-aces|ultra-bonus)/.test(id),
    wild: id => /^(deuces-wild|bonus-deuces|loose-deuces|double-deuces|short-pay-deuces|illinois-deuces|colorado-deuces|airport-deuces|nsu-deuces|downtown-deuces|vegas-strip-deuces|reno-deuces|atlantic-city-deuces|missouri-deuces|sevens-wild|threes-wild|fours-wild|fives-wild|eights-wild|tens-wild)/.test(id),
    joker: id => /^(joker-poker|double-joker|deuces-and-joker)/.test(id)
  };
  for (const [cat, fn] of Object.entries(cats)) if (fn(gameId)) return cat;
  return 'classic';
}

// Find family for a game ID
function getFamily(gameId) {
  for (const [, members] of Object.entries(FAMILIES)) {
    if (members.includes(gameId)) return members;
  }
  return [gameId];
}

// Get game name from file
function getGameName(gameId) {
  const fp = path.join(GAMES_DIR, gameId + '.html');
  if (!fs.existsSync(fp)) return gameId;
  const html = fs.readFileSync(fp, 'utf-8');
  const m = html.match(/<title>([^<]+)<\/title>/);
  return m ? m[1].replace(/ Video Poker.*$/, '').replace(/ - .*$/, '') : gameId;
}

// Build related games list (max 6)
function getRelatedGames(gameId) {
  const related = new Set();
  const family = getFamily(gameId);
  const category = getGameCategory(gameId);

  // Add family variants (excluding self)
  for (const fid of family) {
    if (fid !== gameId) related.add(fid);
  }

  // Add category siblings (up to 6 total)
  const siblings = CATEGORY_SIBLINGS[category] || [];
  for (const sid of siblings) {
    if (related.size >= 6) break;
    if (sid !== gameId && !related.has(sid) && fs.existsSync(path.join(GAMES_DIR, sid + '.html'))) {
      related.add(sid);
    }
  }

  // Trim to 6
  return [...related].slice(0, 6);
}

function processFile(filePath, gameId) {
  let html = fs.readFileSync(filePath, 'utf-8');

  // Remove old related games
  html = html.replace(new RegExp(`${RG_START}[\\s\\S]*?${RG_END}\\n?`, 'g'), '');

  const related = getRelatedGames(gameId);
  if (related.length === 0) {
    fs.writeFileSync(filePath, html, 'utf-8');
    return;
  }

  const links = related.map(rid => {
    const name = getGameName(rid);
    return `<a href="${rid}.html">${name}</a>`;
  }).join('\n      ');

  const rgBlock = `${RG_START}
<div class="rg">
  <h2>Related Games</h2>
  <div class="rg-links">
    ${links}
  </div>
</div>
<style>.rg{max-width:680px;margin:16px auto;padding:14px;background:rgba(0,4,24,.85);border:1px solid #ffe033;border-radius:8px}.rg h2{color:#ffe033;font-size:.9rem;letter-spacing:1px;margin:0 0 10px}.rg-links{display:flex;flex-wrap:wrap;gap:8px}.rg-links a{display:inline-block;padding:6px 12px;background:rgba(0,16,72,.9);border:1px solid #3f62c9;border-radius:5px;color:#c5d4f0;font-size:.75rem;text-decoration:none;letter-spacing:.5px;transition:all .15s}.rg-links a:hover{background:#002078;border-color:#ffe033;color:#ffe033}</style>
${RG_END}`;

  // Insert before the closing </body> or before the final </div> of game wrapper
  // Best place: before the <script> that starts the game logic, which is right before </body>
  // Actually, insert after the SEO div section (which ends with </div>\n<script>)
  // Let's insert before the very last </body>
  html = html.replace(/<\/body>/, `${rgBlock}\n</body>`);

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
console.log(`Related games added to ${count} files`);
