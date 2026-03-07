#!/usr/bin/env node
/**
 * Category Hub Page Generator for Pure Video Poker
 * Generates 5 category pages matching the index.html visual style.
 * Each page: category intro, game grid, full meta tags, ItemList schema.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const GAMES_DIR = path.join(ROOT, 'games');
const SITE = 'https://purevideopoker.com';

// ─── Category definitions ─────────────────────────────────────────
const CATEGORIES = {
  classic: {
    title: 'Classic Video Poker',
    slug: 'category-classic.html',
    badge: 'CLASSIC',
    description: 'Traditional draw poker games with standard payouts. Jacks or Better, Tens or Better, and other pair-based minimum hand games.',
    intro: 'Classic video poker is the foundation of the game. These variants use a standard 52-card deck with no wild cards and no bonus payouts for specific four-of-a-kind hands. The minimum qualifying hand varies — from the beginner-friendly Sixes or Better to the challenging Aces or Better and Two Pair or Better.',
    // Match by game ID prefixes/patterns
    match: id => /^(jacks-or-better|tens-or-better|nines-or-better|kings-or-better|queens-or-better|eights-or-better|sixes-or-better|aces-or-better|two-pair-or-better)/.test(id)
  },
  bonus: {
    title: 'Bonus Poker Games',
    slug: 'category-bonus.html',
    badge: 'BONUS',
    description: 'Enhanced four-of-a-kind payouts with bonus multipliers. Double Bonus, Triple Bonus, Aces and Faces, and more.',
    intro: 'Bonus poker games offer enhanced payouts for specific four-of-a-kind hands. From the classic Bonus Poker with its boosted Aces quads to the extreme Triple Double Bonus with 800x kicker bonuses, these games reward aggressive play and quad-chasing strategies. Higher variance but bigger potential wins.',
    match: id => /^(bonus-poker|double-bonus|double-double-bonus|triple-bonus|triple-double-bonus|bonus-poker-deluxe|super-double-bonus|aces-and-faces|aces-and-eights|white-hot-aces|super-aces|all-american|nevada-bonus|royal-aces|ultra-bonus)/.test(id)
  },
  wild: {
    title: 'Deuces Wild & Wild Card Games',
    slug: 'category-wild.html',
    badge: 'WILD',
    description: 'Wild card games where Deuces (or other ranks) substitute for any card. Includes Deuces Wild variants, Bonus Deuces, Loose Deuces, and Rank Wild games.',
    intro: 'Wild card games add excitement by designating one or more card ranks as wild — they can substitute for any card to complete a winning hand. Deuces Wild is the most popular, but this collection includes Sevens Wild, Threes Wild, and other rank-wild variants. Five of a Kind and Wild Royal Flush become possible, and the strategy shifts dramatically around counting and using wild cards.',
    match: id => /^(deuces-wild|bonus-deuces|loose-deuces|double-deuces|short-pay-deuces|illinois-deuces|colorado-deuces|airport-deuces|nsu-deuces|downtown-deuces|vegas-strip-deuces|reno-deuces|atlantic-city-deuces|missouri-deuces|sevens-wild|threes-wild|fours-wild|fives-wild|eights-wild|tens-wild)/.test(id)
  },
  joker: {
    title: 'Joker Poker Games',
    slug: 'category-joker.html',
    badge: 'JOKER',
    description: 'Poker games featuring one or two Joker wild cards in the deck. Joker Poker, Double Joker, and Deuces & Joker Wild.',
    intro: 'Joker Poker games add one or two Joker cards to the deck as wild cards. With a 53-card (or 54-card) deck, the probabilities shift and new hands like Five of a Kind become available. Strategy varies dramatically depending on whether you hold the Joker or not, making these games uniquely engaging.',
    match: id => /^(joker-poker|double-joker|deuces-and-joker)/.test(id)
  }
};

// ─── RTP data for all games ───────────────────────────────────────
const RTP_DATA = {
  'jacks-or-better': { rtp: '99.54', payTable: '9/6', variance: 'Low', minHand: 'Jacks or Better' },
  'jacks-or-better-95': { rtp: '98.45', payTable: '9/5', variance: 'Low', minHand: 'Jacks or Better' },
  'jacks-or-better-86': { rtp: '98.39', payTable: '8/6', variance: 'Low', minHand: 'Jacks or Better' },
  'jacks-or-better-85': { rtp: '97.30', payTable: '8/5', variance: 'Low', minHand: 'Jacks or Better' },
  'jacks-or-better-75': { rtp: '96.15', payTable: '7/5', variance: 'Low', minHand: 'Jacks or Better' },
  'jacks-or-better-65': { rtp: '95.00', payTable: '6/5', variance: 'Low', minHand: 'Jacks or Better' },
  'tens-or-better': { rtp: '99.14', payTable: '6/5', variance: 'Low', minHand: 'Tens or Better' },
  'tens-or-better-75': { rtp: '96.08', payTable: '7/5', variance: 'Low', minHand: 'Tens or Better' },
  'nines-or-better': { rtp: '98.80', payTable: '8/5', variance: 'Low', minHand: 'Nines or Better' },
  'nines-or-better-75': { rtp: '96.00', payTable: '7/5', variance: 'Low', minHand: 'Nines or Better' },
  'kings-or-better': { rtp: '98.60', payTable: '9/6', variance: 'Low', minHand: 'Kings or Better' },
  'kings-or-better-75': { rtp: '95.80', payTable: '7/5', variance: 'Low', minHand: 'Kings or Better' },
  'queens-or-better': { rtp: '99.00', payTable: '9/6', variance: 'Low', minHand: 'Queens or Better' },
  'eights-or-better': { rtp: '98.50', payTable: '8/5', variance: 'Low', minHand: 'Eights or Better' },
  'sixes-or-better': { rtp: '98.40', payTable: '8/5', variance: 'Low', minHand: 'Sixes or Better' },
  'aces-or-better': { rtp: '98.20', payTable: '8/5', variance: 'Low', minHand: 'Aces or Better' },
  'two-pair-or-better': { rtp: '97.00', payTable: '9/6', variance: 'Very Low', minHand: 'Two Pair' },
  'bonus-poker': { rtp: '99.17', payTable: '8/5', variance: 'Medium', minHand: 'Jacks or Better' },
  'bonus-poker-107': { rtp: '99.90', payTable: '10/7', variance: 'Medium', minHand: 'Jacks or Better' },
  'bonus-poker-75': { rtp: '98.01', payTable: '7/5', variance: 'Medium', minHand: 'Jacks or Better' },
  'bonus-poker-65': { rtp: '96.87', payTable: '6/5', variance: 'Medium', minHand: 'Jacks or Better' },
  'double-bonus-poker': { rtp: '100.17', payTable: '10/7', variance: 'High', minHand: 'Jacks or Better' },
  'double-bonus-106': { rtp: '100.17', payTable: '10/6', variance: 'High', minHand: 'Jacks or Better' },
  'double-bonus-97': { rtp: '99.11', payTable: '9/7', variance: 'High', minHand: 'Jacks or Better' },
  'double-bonus-96': { rtp: '97.81', payTable: '9/6', variance: 'High', minHand: 'Jacks or Better' },
  'double-bonus-95': { rtp: '96.38', payTable: '9/5', variance: 'High', minHand: 'Jacks or Better' },
  'double-bonus-85': { rtp: '94.82', payTable: '8/5', variance: 'High', minHand: 'Jacks or Better' },
  'double-double-bonus-poker': { rtp: '98.98', payTable: '9/6', variance: 'Very High', minHand: 'Jacks or Better' },
  'double-double-bonus-106': { rtp: '100.07', payTable: '10/6', variance: 'Very High', minHand: 'Jacks or Better' },
  'double-double-bonus-96': { rtp: '97.87', payTable: '9/6', variance: 'Very High', minHand: 'Jacks or Better' },
  'double-double-bonus-85': { rtp: '96.79', payTable: '8/5', variance: 'Very High', minHand: 'Jacks or Better' },
  'double-double-bonus-75': { rtp: '95.71', payTable: '7/5', variance: 'Very High', minHand: 'Jacks or Better' },
  'double-double-bonus-65': { rtp: '94.66', payTable: '6/5', variance: 'Very High', minHand: 'Jacks or Better' },
  'triple-bonus-poker': { rtp: '99.58', payTable: '9/7', variance: 'Very High', minHand: 'Jacks or Better' },
  'triple-bonus-96': { rtp: '98.46', payTable: '9/6', variance: 'Very High', minHand: 'Jacks or Better' },
  'triple-bonus-85': { rtp: '97.02', payTable: '8/5', variance: 'Very High', minHand: 'Jacks or Better' },
  'triple-bonus-75': { rtp: '95.97', payTable: '7/5', variance: 'Very High', minHand: 'Jacks or Better' },
  'triple-double-bonus-poker': { rtp: '99.58', payTable: '9/7', variance: 'Extreme', minHand: 'Jacks or Better' },
  'triple-double-bonus-97': { rtp: '99.58', payTable: '9/7', variance: 'Extreme', minHand: 'Jacks or Better' },
  'triple-double-bonus-95': { rtp: '98.15', payTable: '9/5', variance: 'Extreme', minHand: 'Jacks or Better' },
  'triple-double-bonus-85': { rtp: '96.73', payTable: '8/5', variance: 'Extreme', minHand: 'Jacks or Better' },
  'triple-double-bonus-75': { rtp: '95.34', payTable: '7/5', variance: 'Extreme', minHand: 'Jacks or Better' },
  'bonus-poker-deluxe': { rtp: '99.64', payTable: '9/6', variance: 'Medium', minHand: 'Jacks or Better' },
  'bonus-poker-deluxe-96': { rtp: '98.49', payTable: '9/6', variance: 'Medium', minHand: 'Jacks or Better' },
  'bonus-poker-deluxe-85': { rtp: '97.40', payTable: '8/5', variance: 'Medium', minHand: 'Jacks or Better' },
  'bonus-poker-deluxe-75': { rtp: '96.25', payTable: '7/5', variance: 'Medium', minHand: 'Jacks or Better' },
  'bonus-poker-deluxe-65': { rtp: '95.36', payTable: '6/5', variance: 'Medium', minHand: 'Jacks or Better' },
  'super-double-bonus': { rtp: '99.69', payTable: '9/5', variance: 'Very High', minHand: 'Jacks or Better' },
  'super-double-bonus-96': { rtp: '98.69', payTable: '9/6', variance: 'Very High', minHand: 'Jacks or Better' },
  'super-double-bonus-75': { rtp: '96.24', payTable: '7/5', variance: 'Very High', minHand: 'Jacks or Better' },
  'aces-and-faces': { rtp: '99.26', payTable: '8/5', variance: 'Medium', minHand: 'Jacks or Better' },
  'aces-and-faces-85': { rtp: '97.46', payTable: '8/5', variance: 'Medium', minHand: 'Jacks or Better' },
  'aces-and-faces-76': { rtp: '96.31', payTable: '7/6', variance: 'Medium', minHand: 'Jacks or Better' },
  'aces-and-faces-75': { rtp: '95.71', payTable: '7/5', variance: 'Medium', minHand: 'Jacks or Better' },
  'aces-and-eights': { rtp: '99.78', payTable: '8/5', variance: 'Medium', minHand: 'Jacks or Better' },
  'aces-and-eights-86': { rtp: '98.40', payTable: '8/6', variance: 'Medium', minHand: 'Jacks or Better' },
  'aces-and-eights-75': { rtp: '96.16', payTable: '7/5', variance: 'Medium', minHand: 'Jacks or Better' },
  'white-hot-aces': { rtp: '99.57', payTable: '9/5', variance: 'High', minHand: 'Jacks or Better' },
  'white-hot-aces-85': { rtp: '97.95', payTable: '8/5', variance: 'High', minHand: 'Jacks or Better' },
  'white-hot-aces-65': { rtp: '95.94', payTable: '6/5', variance: 'High', minHand: 'Jacks or Better' },
  'super-aces-bonus': { rtp: '99.94', payTable: '8/5', variance: 'Very High', minHand: 'Jacks or Better' },
  'super-aces-bonus-85': { rtp: '97.78', payTable: '8/5', variance: 'Very High', minHand: 'Jacks or Better' },
  'super-aces-bonus-65': { rtp: '95.89', payTable: '6/5', variance: 'Very High', minHand: 'Jacks or Better' },
  'all-american-poker': { rtp: '100.72', payTable: '8/8/8', variance: 'Medium', minHand: 'Jacks or Better' },
  'all-american-poker-86': { rtp: '98.49', payTable: '8/6', variance: 'Medium', minHand: 'Jacks or Better' },
  'all-american-poker-66': { rtp: '96.26', payTable: '6/6', variance: 'Medium', minHand: 'Jacks or Better' },
  'nevada-bonus-poker': { rtp: '99.15', payTable: '10/7', variance: 'Medium', minHand: 'Jacks or Better' },
  'royal-aces-bonus': { rtp: '99.58', payTable: '8/5', variance: 'Very High', minHand: 'Jacks or Better' },
  'ultra-bonus-poker': { rtp: '99.17', payTable: '8/5', variance: 'Medium', minHand: 'Jacks or Better' },
  'deuces-wild': { rtp: '100.76', payTable: 'Full Pay', variance: 'Medium', minHand: 'Three of a Kind', wildCard: 'Deuces (2s)' },
  'nsu-deuces-wild': { rtp: '99.73', payTable: 'NSU', variance: 'Medium', minHand: 'Three of a Kind', wildCard: 'Deuces (2s)' },
  'short-pay-deuces-wild': { rtp: '98.91', payTable: 'Short Pay', variance: 'Medium', minHand: 'Three of a Kind', wildCard: 'Deuces (2s)' },
  'downtown-deuces-wild': { rtp: '98.54', payTable: 'Downtown', variance: 'Medium', minHand: 'Three of a Kind', wildCard: 'Deuces (2s)' },
  'illinois-deuces-wild': { rtp: '98.91', payTable: 'Illinois', variance: 'Medium', minHand: 'Three of a Kind', wildCard: 'Deuces (2s)' },
  'colorado-deuces-wild': { rtp: '98.14', payTable: 'Colorado', variance: 'Medium', minHand: 'Three of a Kind', wildCard: 'Deuces (2s)' },
  'airport-deuces-wild': { rtp: '96.77', payTable: 'Airport', variance: 'Medium', minHand: 'Three of a Kind', wildCard: 'Deuces (2s)' },
  'vegas-strip-deuces-wild': { rtp: '97.58', payTable: 'Vegas Strip', variance: 'Medium', minHand: 'Three of a Kind', wildCard: 'Deuces (2s)' },
  'reno-deuces-wild': { rtp: '97.06', payTable: 'Reno', variance: 'Medium', minHand: 'Three of a Kind', wildCard: 'Deuces (2s)' },
  'atlantic-city-deuces-wild': { rtp: '97.58', payTable: 'Atlantic City', variance: 'Medium', minHand: 'Three of a Kind', wildCard: 'Deuces (2s)' },
  'missouri-deuces-wild': { rtp: '96.77', payTable: 'Missouri', variance: 'Medium', minHand: 'Three of a Kind', wildCard: 'Deuces (2s)' },
  'bonus-deuces-wild': { rtp: '99.45', payTable: 'Full Pay', variance: 'High', minHand: 'Three of a Kind', wildCard: 'Deuces (2s)' },
  'bonus-deuces-wild-1343': { rtp: '98.80', payTable: '13/4/3', variance: 'High', minHand: 'Three of a Kind', wildCard: 'Deuces (2s)' },
  'bonus-deuces-wild-1243': { rtp: '98.07', payTable: '12/4/3', variance: 'High', minHand: 'Three of a Kind', wildCard: 'Deuces (2s)' },
  'bonus-deuces-wild-1043': { rtp: '96.22', payTable: '10/4/3', variance: 'High', minHand: 'Three of a Kind', wildCard: 'Deuces (2s)' },
  'loose-deuces-wild': { rtp: '100.15', payTable: 'Full Pay', variance: 'Very High', minHand: 'Three of a Kind', wildCard: 'Deuces (2s)' },
  'loose-deuces-wild-1510': { rtp: '99.20', payTable: '15/10', variance: 'Very High', minHand: 'Three of a Kind', wildCard: 'Deuces (2s)' },
  'loose-deuces-wild-128': { rtp: '97.38', payTable: '12/8', variance: 'Very High', minHand: 'Three of a Kind', wildCard: 'Deuces (2s)' },
  'double-deuces-wild': { rtp: '99.62', payTable: 'Full Pay', variance: 'Very High', minHand: 'Three of a Kind', wildCard: 'Deuces (2s)' },
  'double-deuces-wild-1510': { rtp: '98.60', payTable: '15/10', variance: 'Very High', minHand: 'Three of a Kind', wildCard: 'Deuces (2s)' },
  'double-deuces-wild-128': { rtp: '96.70', payTable: '12/8', variance: 'Very High', minHand: 'Three of a Kind', wildCard: 'Deuces (2s)' },
  'deuces-wild-bonus': { rtp: '99.86', payTable: 'Full Pay', variance: 'High', minHand: 'Three of a Kind', wildCard: 'Deuces (2s)' },
  'deuces-wild-bonus-1643': { rtp: '99.11', payTable: '16/4/3', variance: 'High', minHand: 'Three of a Kind', wildCard: 'Deuces (2s)' },
  'deuces-wild-bonus-1243': { rtp: '97.36', payTable: '12/4/3', variance: 'High', minHand: 'Three of a Kind', wildCard: 'Deuces (2s)' },
  'deuces-wild-deluxe': { rtp: '99.73', payTable: 'Full Pay', variance: 'Medium', minHand: 'Three of a Kind', wildCard: 'Deuces (2s)' },
  'deuces-wild-deluxe-1643': { rtp: '98.96', payTable: '16/4/3', variance: 'Medium', minHand: 'Three of a Kind', wildCard: 'Deuces (2s)' },
  'deuces-wild-deluxe-1243': { rtp: '96.03', payTable: '12/4/3', variance: 'Medium', minHand: 'Three of a Kind', wildCard: 'Deuces (2s)' },
  'sevens-wild': { rtp: '100.14', payTable: '25/15', variance: 'Medium', minHand: 'Three of a Kind', wildCard: 'Sevens (7s)' },
  'sevens-wild-2515': { rtp: '100.14', payTable: '25/15', variance: 'Medium', minHand: 'Three of a Kind', wildCard: 'Sevens (7s)' },
  'sevens-wild-2010': { rtp: '97.66', payTable: '20/10', variance: 'Medium', minHand: 'Three of a Kind', wildCard: 'Sevens (7s)' },
  'threes-wild': { rtp: '99.33', payTable: 'Full Pay', variance: 'Medium', minHand: 'Three of a Kind', wildCard: 'Threes (3s)' },
  'fours-wild': { rtp: '99.20', payTable: 'Full Pay', variance: 'Medium', minHand: 'Three of a Kind', wildCard: 'Fours (4s)' },
  'fives-wild': { rtp: '99.10', payTable: 'Full Pay', variance: 'Medium', minHand: 'Three of a Kind', wildCard: 'Fives (5s)' },
  'eights-wild': { rtp: '99.40', payTable: 'Full Pay', variance: 'Medium', minHand: 'Three of a Kind', wildCard: 'Eights (8s)' },
  'tens-wild': { rtp: '99.50', payTable: 'Full Pay', variance: 'Medium', minHand: 'Three of a Kind', wildCard: 'Tens (10s)' },
  'joker-poker': { rtp: '100.64', payTable: 'Full Pay', variance: 'Medium', minHand: 'Kings or Better', wildCard: 'Joker', deck: 53 },
  'joker-poker-85': { rtp: '98.09', payTable: '8/5', variance: 'Medium', minHand: 'Kings or Better', wildCard: 'Joker', deck: 53 },
  'joker-poker-75': { rtp: '96.38', payTable: '7/5', variance: 'Medium', minHand: 'Kings or Better', wildCard: 'Joker', deck: 53 },
  'joker-poker-65': { rtp: '95.46', payTable: '6/5', variance: 'Medium', minHand: 'Kings or Better', wildCard: 'Joker', deck: 53 },
  'joker-poker-aces': { rtp: '99.07', payTable: 'Full Pay', variance: 'Medium', minHand: 'Pair of Aces', wildCard: 'Joker', deck: 53 },
  'joker-poker-aces-75': { rtp: '97.19', payTable: '7/5', variance: 'Medium', minHand: 'Pair of Aces', wildCard: 'Joker', deck: 53 },
  'joker-poker-aces-65': { rtp: '95.43', payTable: '6/5', variance: 'Medium', minHand: 'Pair of Aces', wildCard: 'Joker', deck: 53 },
  'joker-poker-twopair': { rtp: '99.92', payTable: 'Full Pay', variance: 'Low', minHand: 'Two Pair', wildCard: 'Joker', deck: 53 },
  'joker-poker-twopair-85': { rtp: '98.44', payTable: '8/5', variance: 'Low', minHand: 'Two Pair', wildCard: 'Joker', deck: 53 },
  'joker-poker-twopair-75': { rtp: '96.39', payTable: '7/5', variance: 'Low', minHand: 'Two Pair', wildCard: 'Joker', deck: 53 },
  'double-joker-poker': { rtp: '99.97', payTable: 'Full Pay', variance: 'Medium', minHand: 'Two Pair', wildCard: '2 Jokers', deck: 54 },
  'double-joker-poker-75': { rtp: '98.10', payTable: '7/5', variance: 'Medium', minHand: 'Two Pair', wildCard: '2 Jokers', deck: 54 },
  'double-joker-poker-55': { rtp: '95.33', payTable: '5/5', variance: 'Medium', minHand: 'Two Pair', wildCard: '2 Jokers', deck: 54 },
  'deuces-and-joker-wild': { rtp: '99.07', payTable: 'Full Pay', variance: 'High', minHand: 'Three of a Kind', wildCard: 'Deuces + Joker', deck: 53 },
  'deuces-and-joker-wild-85': { rtp: '97.56', payTable: '8/5', variance: 'High', minHand: 'Three of a Kind', wildCard: 'Deuces + Joker', deck: 53 },
  'deuces-and-joker-wild-65': { rtp: '95.28', payTable: '6/5', variance: 'High', minHand: 'Three of a Kind', wildCard: 'Deuces + Joker', deck: 53 },
};

// ─── Read game card data from game files ──────────────────────────
function parseGameCards() {
  const gameFiles = fs.readdirSync(GAMES_DIR).filter(f => f.endsWith('.html')).sort();
  const cards = [];
  for (const file of gameFiles) {
    const id = file.replace('.html', '');
    const html = fs.readFileSync(path.join(GAMES_DIR, file), 'utf-8');

    // Extract title from <title> tag and clean up
    const titleMatch = html.match(/<title>([^<]+)/);
    let name = titleMatch ? titleMatch[1].replace(/ Video Poker.*$/, '').trim() : id;

    // Determine badge from category
    let badge = 'CLASSIC';
    for (const [key, cat] of Object.entries(CATEGORIES)) {
      if (cat.match(id)) {
        badge = cat.badge;
        break;
      }
    }

    // Determine logo
    let logo = 'assets/logos/jacks-or-better.png';
    if (/deuces|wild|sevens|threes|fours|fives|eights-wild|tens-wild|joker/.test(id)) logo = 'assets/logos/deuces-wild.png';
    else if (/bonus-poker(?!.*deluxe)|triple-bonus|nevada-bonus|ultra-bonus/.test(id)) logo = 'assets/logos/bonus-poker.png';
    else if (/double-bonus|double-double|triple-double|super-double|white-hot/.test(id)) logo = 'assets/logos/double-bonus-poker.png';
    else if (/aces-and|super-aces|royal-aces/.test(id)) logo = 'assets/logos/aces-and-faces.png';
    else if (/all-american/.test(id)) logo = 'assets/logos/all-american-poker.png';
    else if (/tens-or-better/.test(id)) logo = 'assets/logos/tens-or-better.png';
    else if (/nines-or-better/.test(id)) logo = 'assets/logos/nines-or-better.png';

    cards.push({ id, file, badge, logo, name });
  }
  return cards;
}

// ─── Read meta description from game file ─────────────────────────
function getDescription(file) {
  const html = fs.readFileSync(path.join(GAMES_DIR, file), 'utf-8');
  const m = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
  return m ? m[1] : '';
}

// ─── Generate category page HTML ──────────────────────────────────
function generateCategoryPage(catKey, cat, games) {
  const url = `${SITE}/${cat.slug}`;

  // Schema: ItemList
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: cat.title,
    description: cat.description,
    numberOfItems: games.length,
    itemListElement: games.map((g, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: g.name,
      url: `${SITE}/games/${g.file}`
    }))
  };

  // Schema: CollectionPage
  const collectionPage = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: cat.title,
    description: cat.description,
    url: url,
    isPartOf: { '@type': 'WebSite', name: 'Pure Video Poker', url: `${SITE}/` },
    inLanguage: 'en'
  };

  // BreadcrumbList schema
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: cat.title, item: url }
    ]
  };

  const gameCards = games.map(g => {
    const desc = getDescription(g.file);
    const rtpEntry = RTP_DATA[g.id];
    const rtp = rtpEntry ? rtpEntry.rtp : '99.00';
    return `        <a class="game-card" href="games/${g.file}">
          <div class="topline"><span class="badge">${g.badge}</span><span class="rtp">${rtp}%</span></div>
          <div class="row"><img class="logo" src="${g.logo}" alt="${g.name} logo"><div><h3>${g.name}</h3></div></div>
          <p>${desc.replace(/Play free .+?\. /, '').substring(0, 100)}</p>
          <span class="play-btn">PLAY NOW</span>
        </a>`;
  }).join('\n\n');

  // Category nav links
  const catNavLinks = Object.entries(CATEGORIES).map(([k, c]) => {
    const active = k === catKey ? ' cat-active' : '';
    return `<a class="cat-link${active}" href="${c.slug}">${c.title.replace(' Games', '').replace(' & Wild Card Games', ' & Wild')}</a>`;
  }).join('\n          ');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${cat.title} - Free Video Poker Games | Pure Video Poker</title>
<meta name="description" content="${cat.description}">
<!-- SEO-META-START -->
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${cat.title} - Free Video Poker Games">
<meta property="og:description" content="${cat.description}">
<meta property="og:image" content="${SITE}/assets/hero/hero-vp-premium.png">
<meta property="og:site_name" content="Pure Video Poker">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${cat.title} - Free Video Poker Games">
<meta name="twitter:description" content="${cat.description}">
<meta name="twitter:image" content="${SITE}/assets/hero/hero-vp-premium.png">
<!-- SEO-META-END -->
<script type="application/ld+json">
${JSON.stringify(collectionPage)}
</script>
<script type="application/ld+json">
${JSON.stringify(itemList)}
</script>
<script type="application/ld+json">
${JSON.stringify(breadcrumb)}
</script>
<style>
*{box-sizing:border-box}
:root{--bg:#020816;--panel-border:#3f62c9;--gold:#ffe033;--muted:#9eb0d8;--red1:#ff5a37;--red2:#bf2100}
body{margin:0;font-family:Arial Black,Arial,sans-serif;background:radial-gradient(1200px 700px at 50% -120px,#1a1406 0,#070c1a 40%,var(--bg) 85%);color:#fff}
.wrap{max-width:1080px;margin:0 auto;padding:18px 14px 34px}
.marquee{text-align:center;padding:12px 10px;border:2px solid #a98a00;border-radius:8px;background:linear-gradient(180deg,#1a1200,#0b0700);box-shadow:0 0 18px rgba(255,208,0,.24),inset 0 1px 0 rgba(255,255,255,.15)}
.marquee h1{margin:0;letter-spacing:3px;color:var(--gold);font-size:1.35rem;text-shadow:0 0 12px rgba(255,224,51,.5)}
.marquee p{margin:8px 0 0;color:#c5b47a;font-size:.78rem;letter-spacing:1px}
.breadcrumb{margin:10px 0 0;font-size:.72rem;color:#7f91b9;letter-spacing:1px}
.breadcrumb a{color:var(--gold);text-decoration:none}.breadcrumb a:hover{text-decoration:underline}
.cat-nav{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
.cat-link{display:inline-block;padding:6px 12px;background:#000418;border:1px solid #1d2e5f;border-radius:6px;color:#9eb0d8;font-size:.72rem;text-decoration:none;letter-spacing:1px;transition:all .15s ease}
.cat-link:hover{background:#001048;border-color:var(--gold);color:var(--gold)}
.cat-active{background:#001048;border-color:var(--gold);color:var(--gold)}
.intro{margin:12px 0;padding:14px;background:#000418;border:1px solid #1d2e5f;border-radius:8px;color:#9eb0d8;font-size:.82rem;line-height:1.6;font-family:Arial,sans-serif}
.cabinet{margin-top:14px;background:#000418;border:2px solid #1d2e5f;border-radius:10px;padding:14px}
.panel-head{display:flex;justify-content:space-between;align-items:center;background:#000;border:1px solid #2c2c2c;border-radius:6px;padding:8px 12px;margin-bottom:12px}
.panel-head .label{color:#78839b;font-size:.72rem;letter-spacing:2px}.panel-head .value{color:var(--gold);font-size:1.2rem}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px}
.game-card{display:flex;flex-direction:column;gap:10px;text-decoration:none;color:#fff;background:linear-gradient(180deg,#00018a 0%,#00006e 52%,#00045b 100%);border:2px solid var(--panel-border);border-radius:8px;padding:12px;box-shadow:inset 0 1px 0 rgba(255,255,255,.25),0 5px 16px rgba(0,0,0,.45);transition:transform .12s ease,filter .12s ease,box-shadow .12s ease;min-height:138px}
.game-card:hover{transform:translateY(-3px);filter:brightness(1.08);box-shadow:inset 0 1px 0 rgba(255,255,255,.25),0 10px 22px rgba(0,0,0,.55)}
.game-card:active{transform:translateY(-1px) scale(.985)}
.topline{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.rtp{color:#4ade80;font-size:.68rem;letter-spacing:.5px;font-family:Arial,sans-serif}
.badge{font-size:.62rem;color:#001018;background:linear-gradient(180deg,#ffe75a,#d6ad00);border:1px solid #8f7200;border-radius:3px;padding:2px 6px;letter-spacing:1px}
.logo{width:54px;height:54px;border-radius:8px;border:1px solid rgba(255,255,255,.25);display:block;object-fit:cover;box-shadow:0 4px 10px rgba(0,0,0,.45)}
.row{display:flex;gap:10px;align-items:flex-start;min-height:54px}
.game-card h3{margin:2px 0 4px;color:var(--gold);letter-spacing:1px;font-size:1.02rem;line-height:1.15}
.game-card p{margin:0;color:var(--muted);font-size:.72rem;line-height:1.3;font-family:Arial,sans-serif}
.play-btn{margin-top:auto;display:inline-block;align-self:flex-start;background:linear-gradient(180deg,var(--red1),var(--red2));border:1px solid #7d1600;border-radius:4px;padding:6px 12px;color:#fff;font-size:.74rem;letter-spacing:1px}
.footer-nav{margin-top:24px;padding:16px;background:#000418;border:1px solid #1d2e5f;border-radius:8px;text-align:center}
.footer-nav .ft-row{margin:4px 0}.footer-nav a{color:#9eb0d8;text-decoration:none;font-size:.72rem;letter-spacing:1px;margin:0 10px}.footer-nav a:hover{color:var(--gold)}.footer-nav .ft-info a{color:#6b7fa8;font-size:.66rem}.footer-nav .ft-info a:hover{color:var(--gold)}.footer-nav .ft-legal a{color:#556b8a;font-size:.62rem}.footer-nav .ft-legal a:hover{color:var(--gold)}
.footer-note{text-align:center;color:#7f91b9;font-size:.72rem;letter-spacing:1px;margin-top:14px}
@media(max-width:640px){
  .wrap{padding:12px 10px 26px}.marquee h1{font-size:1.04rem}.cabinet{padding:10px}
  .grid{grid-template-columns:1fr;gap:10px}.game-card{min-height:126px;padding:10px;gap:8px}
  .cat-nav{gap:6px}.cat-link{padding:5px 8px;font-size:.64rem}
}
</style>
</head>
<body>
  <div class="wrap">
    <div class="marquee">
      <h1>${cat.title.toUpperCase()}</h1>
      <p>${games.length} GAMES AVAILABLE</p>
    </div>

    <div class="breadcrumb">
      <a href="index.html">Home</a> &rsaquo; ${cat.title}
    </div>

    <div class="cat-nav">
      <a class="cat-link" href="index.html">All Games</a>
      ${catNavLinks}
    </div>

    <div class="intro">${cat.intro}</div>

    <div class="cabinet">
      <div class="panel-head"><div><span class="label">${cat.title.toUpperCase()}</span></div><div class="value">${games.length} VARIANTS</div></div>
      <div class="grid">
${gameCards}
      </div>
    </div>

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
    <div class="footer-note">VIDEO POKER CLASSIC &bull; 120 FREE GAMES</div>
  </div>
</body>
</html>
`;
}

// ─── Main ────────────────────────────────────────────────────────
const allCards = parseGameCards();
console.log(`Found ${allCards.length} game cards in games/ directory`);

let totalCategorized = 0;
for (const [catKey, cat] of Object.entries(CATEGORIES)) {
  const games = allCards.filter(g => cat.match(g.id));
  totalCategorized += games.length;

  const html = generateCategoryPage(catKey, cat, games);
  const outPath = path.join(ROOT, cat.slug);
  fs.writeFileSync(outPath, html, 'utf-8');
  console.log(`  ${cat.slug}: ${games.length} games`);
}

console.log(`\nTotal categorized: ${totalCategorized} / ${allCards.length}`);
if (totalCategorized !== allCards.length) {
  const categorized = new Set();
  for (const cat of Object.values(CATEGORIES)) {
    allCards.filter(g => cat.match(g.id)).forEach(g => categorized.add(g.id));
  }
  const uncategorized = allCards.filter(g => !categorized.has(g.id));
  if (uncategorized.length > 0) {
    console.log('Uncategorized games:');
    uncategorized.forEach(g => console.log(`  - ${g.id}`));
  }
}
