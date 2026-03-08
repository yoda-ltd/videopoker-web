#!/usr/bin/env node
/**
 * gen_1000_stubs.js
 * Target: ~1000 articles based on 120 actual game files
 * Categories:
 *   1. Variant Guides: 120 games × 6 themes = 720
 *   2. Comparisons:    120 games × 2 pairs   = 240  (neighboring variants)
 *   3. Expert/Tech:    10 evergreen articles
 * Total: ~970 articles
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'articles');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ── 120 games from /games/*.html ──────────────────────────────────────────
const GAMES = [
  { slug: 'aces-and-eights',            name: 'Aces and Eights' },
  { slug: 'aces-and-eights-75',         name: 'Aces and Eights (7/5)' },
  { slug: 'aces-and-eights-86',         name: 'Aces and Eights (8/6)' },
  { slug: 'aces-and-faces',             name: 'Aces and Faces' },
  { slug: 'aces-and-faces-75',          name: 'Aces and Faces (7/5)' },
  { slug: 'aces-and-faces-76',          name: 'Aces and Faces (7/6)' },
  { slug: 'aces-and-faces-85',          name: 'Aces and Faces (8/5)' },
  { slug: 'aces-or-better',             name: 'Aces or Better' },
  { slug: 'airport-deuces-wild',        name: 'Airport Deuces Wild' },
  { slug: 'all-american-poker',         name: 'All American Poker' },
  { slug: 'all-american-poker-66',      name: 'All American Poker (6/6)' },
  { slug: 'all-american-poker-86',      name: 'All American Poker (8/6)' },
  { slug: 'atlantic-city-deuces-wild',  name: 'Atlantic City Deuces Wild' },
  { slug: 'bonus-deuces-wild',          name: 'Bonus Deuces Wild' },
  { slug: 'bonus-deuces-wild-1043',     name: 'Bonus Deuces Wild (10/4/3)' },
  { slug: 'bonus-deuces-wild-1243',     name: 'Bonus Deuces Wild (12/4/3)' },
  { slug: 'bonus-deuces-wild-1343',     name: 'Bonus Deuces Wild (13/4/3)' },
  { slug: 'bonus-poker',                name: 'Bonus Poker' },
  { slug: 'bonus-poker-107',            name: 'Bonus Poker (10/7)' },
  { slug: 'bonus-poker-65',             name: 'Bonus Poker (6/5)' },
  { slug: 'bonus-poker-75',             name: 'Bonus Poker (7/5)' },
  { slug: 'bonus-poker-deluxe',         name: 'Bonus Poker Deluxe' },
  { slug: 'bonus-poker-deluxe-65',      name: 'Bonus Poker Deluxe (6/5)' },
  { slug: 'bonus-poker-deluxe-75',      name: 'Bonus Poker Deluxe (7/5)' },
  { slug: 'bonus-poker-deluxe-85',      name: 'Bonus Poker Deluxe (8/5)' },
  { slug: 'bonus-poker-deluxe-96',      name: 'Bonus Poker Deluxe (9/6)' },
  { slug: 'colorado-deuces-wild',       name: 'Colorado Deuces Wild' },
  { slug: 'deuces-and-joker-wild',      name: 'Deuces and Joker Wild' },
  { slug: 'deuces-and-joker-wild-65',   name: 'Deuces and Joker Wild (6/5)' },
  { slug: 'deuces-and-joker-wild-85',   name: 'Deuces and Joker Wild (8/5)' },
  { slug: 'deuces-wild',                name: 'Deuces Wild' },
  { slug: 'deuces-wild-bonus',          name: 'Deuces Wild Bonus' },
  { slug: 'deuces-wild-bonus-1243',     name: 'Deuces Wild Bonus (12/4/3)' },
  { slug: 'deuces-wild-bonus-1643',     name: 'Deuces Wild Bonus (16/4/3)' },
  { slug: 'deuces-wild-deluxe',         name: 'Deuces Wild Deluxe' },
  { slug: 'deuces-wild-deluxe-1243',    name: 'Deuces Wild Deluxe (12/4/3)' },
  { slug: 'deuces-wild-deluxe-1643',    name: 'Deuces Wild Deluxe (16/4/3)' },
  { slug: 'double-bonus-106',           name: 'Double Bonus Poker (10/6)' },
  { slug: 'double-bonus-85',            name: 'Double Bonus Poker (8/5)' },
  { slug: 'double-bonus-95',            name: 'Double Bonus Poker (9/5)' },
  { slug: 'double-bonus-96',            name: 'Double Bonus Poker (9/6)' },
  { slug: 'double-bonus-97',            name: 'Double Bonus Poker (9/7)' },
  { slug: 'double-bonus-poker',         name: 'Double Bonus Poker' },
  { slug: 'double-deuces-wild',         name: 'Double Deuces Wild' },
  { slug: 'double-deuces-wild-128',     name: 'Double Deuces Wild (12/8)' },
  { slug: 'double-deuces-wild-1510',    name: 'Double Deuces Wild (15/10)' },
  { slug: 'double-double-bonus-106',    name: 'Double Double Bonus (10/6)' },
  { slug: 'double-double-bonus-65',     name: 'Double Double Bonus (6/5)' },
  { slug: 'double-double-bonus-75',     name: 'Double Double Bonus (7/5)' },
  { slug: 'double-double-bonus-85',     name: 'Double Double Bonus (8/5)' },
  { slug: 'double-double-bonus-96',     name: 'Double Double Bonus (9/6)' },
  { slug: 'double-double-bonus-poker',  name: 'Double Double Bonus Poker' },
  { slug: 'double-joker-poker',         name: 'Double Joker Poker' },
  { slug: 'double-joker-poker-55',      name: 'Double Joker Poker (5/5)' },
  { slug: 'double-joker-poker-75',      name: 'Double Joker Poker (7/5)' },
  { slug: 'downtown-deuces-wild',       name: 'Downtown Deuces Wild' },
  { slug: 'eights-or-better',           name: 'Eights or Better' },
  { slug: 'eights-wild',                name: 'Eights Wild' },
  { slug: 'fives-wild',                 name: 'Fives Wild' },
  { slug: 'fours-wild',                 name: 'Fours Wild' },
  { slug: 'illinois-deuces-wild',       name: 'Illinois Deuces Wild' },
  { slug: 'jacks-or-better',            name: 'Jacks or Better' },
  { slug: 'jacks-or-better-65',         name: 'Jacks or Better (6/5)' },
  { slug: 'jacks-or-better-75',         name: 'Jacks or Better (7/5)' },
  { slug: 'jacks-or-better-85',         name: 'Jacks or Better (8/5)' },
  { slug: 'jacks-or-better-86',         name: 'Jacks or Better (8/6)' },
  { slug: 'jacks-or-better-95',         name: 'Jacks or Better (9/5)' },
  { slug: 'joker-poker',                name: 'Joker Poker' },
  { slug: 'joker-poker-65',             name: 'Joker Poker (6/5)' },
  { slug: 'joker-poker-75',             name: 'Joker Poker (7/5)' },
  { slug: 'joker-poker-85',             name: 'Joker Poker (8/5)' },
  { slug: 'joker-poker-aces',           name: 'Joker Poker Aces' },
  { slug: 'joker-poker-aces-65',        name: 'Joker Poker Aces (6/5)' },
  { slug: 'joker-poker-aces-75',        name: 'Joker Poker Aces (7/5)' },
  { slug: 'joker-poker-twopair',        name: 'Joker Poker Two Pair' },
  { slug: 'joker-poker-twopair-75',     name: 'Joker Poker Two Pair (7/5)' },
  { slug: 'joker-poker-twopair-85',     name: 'Joker Poker Two Pair (8/5)' },
  { slug: 'kings-or-better',            name: 'Kings or Better' },
  { slug: 'kings-or-better-75',         name: 'Kings or Better (7/5)' },
  { slug: 'loose-deuces-wild',          name: 'Loose Deuces Wild' },
  { slug: 'loose-deuces-wild-128',      name: 'Loose Deuces Wild (12/8)' },
  { slug: 'loose-deuces-wild-1510',     name: 'Loose Deuces Wild (15/10)' },
  { slug: 'missouri-deuces-wild',       name: 'Missouri Deuces Wild' },
  { slug: 'nevada-bonus-poker',         name: 'Nevada Bonus Poker' },
  { slug: 'nines-or-better',            name: 'Nines or Better' },
  { slug: 'nines-or-better-75',         name: 'Nines or Better (7/5)' },
  { slug: 'nsu-deuces-wild',            name: 'NSU Deuces Wild' },
  { slug: 'queens-or-better',           name: 'Queens or Better' },
  { slug: 'reno-deuces-wild',           name: 'Reno Deuces Wild' },
  { slug: 'royal-aces-bonus',           name: 'Royal Aces Bonus' },
  { slug: 'sevens-wild',                name: 'Sevens Wild' },
  { slug: 'sevens-wild-2010',           name: 'Sevens Wild (20/10)' },
  { slug: 'sevens-wild-2515',           name: 'Sevens Wild (25/15)' },
  { slug: 'short-pay-deuces-wild',      name: 'Short Pay Deuces Wild' },
  { slug: 'sixes-or-better',            name: 'Sixes or Better' },
  { slug: 'super-aces-bonus',           name: 'Super Aces Bonus' },
  { slug: 'super-aces-bonus-65',        name: 'Super Aces Bonus (6/5)' },
  { slug: 'super-aces-bonus-85',        name: 'Super Aces Bonus (8/5)' },
  { slug: 'super-double-bonus',         name: 'Super Double Bonus' },
  { slug: 'super-double-bonus-75',      name: 'Super Double Bonus (7/5)' },
  { slug: 'super-double-bonus-96',      name: 'Super Double Bonus (9/6)' },
  { slug: 'tens-or-better',             name: 'Tens or Better' },
  { slug: 'tens-or-better-75',          name: 'Tens or Better (7/5)' },
  { slug: 'tens-wild',                  name: 'Tens Wild' },
  { slug: 'threes-wild',                name: 'Threes Wild' },
  { slug: 'triple-bonus-75',            name: 'Triple Bonus Poker (7/5)' },
  { slug: 'triple-bonus-85',            name: 'Triple Bonus Poker (8/5)' },
  { slug: 'triple-bonus-96',            name: 'Triple Bonus Poker (9/6)' },
  { slug: 'triple-bonus-poker',         name: 'Triple Bonus Poker' },
  { slug: 'triple-double-bonus-75',     name: 'Triple Double Bonus (7/5)' },
  { slug: 'triple-double-bonus-85',     name: 'Triple Double Bonus (8/5)' },
  { slug: 'triple-double-bonus-95',     name: 'Triple Double Bonus (9/5)' },
  { slug: 'triple-double-bonus-97',     name: 'Triple Double Bonus (9/7)' },
  { slug: 'triple-double-bonus-poker',  name: 'Triple Double Bonus Poker' },
  { slug: 'two-pair-or-better',         name: 'Two Pair or Better' },
  { slug: 'ultra-bonus-poker',          name: 'Ultra Bonus Poker' },
  { slug: 'vegas-strip-deuces-wild',    name: 'Vegas Strip Deuces Wild' },
  { slug: 'white-hot-aces',             name: 'White Hot Aces' },
  { slug: 'white-hot-aces-65',          name: 'White Hot Aces (6/5)' },
  { slug: 'white-hot-aces-85',          name: 'White Hot Aces (8/5)' },
];

// ── Article themes per variant (6 themes = 720 articles) ─────────────────
const VARIANT_THEMES = [
  { tpl: 'How to Play {name}: Complete Beginner\'s Guide',           cat: 'Variant Guide' },
  { tpl: '{name} Strategy Chart: Optimal Holds for Every Hand',      cat: 'Strategy' },
  { tpl: '{name} Pay Table Analysis: Return-to-Player Explained',    cat: 'Strategy' },
  { tpl: 'Common Mistakes to Avoid When Playing {name}',             cat: 'Variant Guide' },
  { tpl: '{name} Odds: Probability of Royal Flush and Key Hands',    cat: 'Math' },
  { tpl: '{name} Bankroll Management: How Much to Bring',            cat: 'Bankroll' },
];

// ── Comparison themes (2 per game vs next 2 neighbors = ~240) ────────────
const COMP_THEMES = [
  { tpl: '{v1} vs {v2}: Which Has the Better Return to Player?',    cat: 'Comparison' },
  { tpl: '{v1} vs {v2}: Strategy Differences Explained',            cat: 'Comparison' },
];

// ── Expert/evergreen (10 articles) ───────────────────────────────────────
const EXPERT_ARTICLES = [
  { title: 'Video Poker RTP Guide: How Return to Player Works',              cat: 'Expert' },
  { title: 'Full Pay vs Short Pay Video Poker: What Every Player Must Know', cat: 'Expert' },
  { title: 'Video Poker vs Slots: Which Has Better Odds?',                   cat: 'Expert' },
  { title: 'How to Read a Video Poker Pay Table',                            cat: 'Expert' },
  { title: 'Video Poker Variance Explained: Low vs High Volatility Games',   cat: 'Expert' },
  { title: 'Best Video Poker Games for Beginners in 2026',                   cat: 'Expert' },
  { title: 'Video Poker Comps and Rewards: Maximizing Casino Points',        cat: 'Expert' },
  { title: 'The Mathematics Behind Video Poker: RNG and Probability',        cat: 'Expert' },
  { title: 'Video Poker Tournaments: How to Win in 2026',                    cat: 'Expert' },
  { title: 'Responsible Gambling in Video Poker: Bankroll and Limits',       cat: 'Expert' },
];

// ── Helper ────────────────────────────────────────────────────────────────
let total = 0;
const skipped = [];

function toSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function saveStub(title, category) {
  const fileName = toSlug(title) + '.md';
  const filePath = path.join(OUTPUT_DIR, fileName);
  if (fs.existsSync(filePath)) {
    // Skip if already has real content (file > 500 bytes)
    if (fs.statSync(filePath).size > 500) { skipped.push(fileName); return; }
  }
  const content = `# ${title}\nCategory: ${category}\n\n[STUB] Draft content for: ${title}\n`;
  fs.writeFileSync(filePath, content);
  total++;
}

// ── Phase 1: Variant Guides (120 × 6 = 720) ──────────────────────────────
GAMES.forEach(game => {
  VARIANT_THEMES.forEach(theme => {
    const title = theme.tpl.replace(/{name}/g, game.name);
    saveStub(title, theme.cat);
  });
});

// ── Phase 2: Comparisons (120 × 2 neighbors × 2 themes ≈ 240) ───────────
GAMES.forEach((game, i) => {
  const neighbors = GAMES.slice(i + 1, i + 3); // next 2 games
  neighbors.forEach(other => {
    COMP_THEMES.forEach(theme => {
      const title = theme.tpl.replace(/{v1}/g, game.name).replace(/{v2}/g, other.name);
      saveStub(title, theme.cat);
    });
  });
});

// ── Phase 3: Expert/Evergreen (10) ───────────────────────────────────────
EXPERT_ARTICLES.forEach(a => saveStub(a.title, a.cat));

console.log(`✅ Generated ${total} new stubs`);
console.log(`⏭  Skipped ${skipped.length} already-complete articles`);
console.log(`📁 Total in directory: ${fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.md')).length}`);
