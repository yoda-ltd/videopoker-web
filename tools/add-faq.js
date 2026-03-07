#!/usr/bin/env node
/**
 * FAQ Section Injector for Pure Video Poker
 * Adds 3-5 game-specific FAQ items with FAQPage schema to each game page.
 * FAQPage schema enables Google FAQ rich snippets.
 * Safe to run multiple times — uses marker comments.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const GAMES_DIR = path.join(ROOT, 'games');
const SITE = 'https://purevideopoker.com';

const FAQ_START = '<!-- FAQ-SECTION-START -->';
const FAQ_END = '<!-- FAQ-SECTION-END -->';
const FAQ_SCHEMA_START = '<!-- FAQ-SCHEMA-START -->';
const FAQ_SCHEMA_END = '<!-- FAQ-SCHEMA-END -->';

// ─── Category mapping ────────────────────────────────────────────
const CATEGORIES = {
  classic: { name: 'Classic Video Poker', slug: 'category-classic.html',
    match: id => /^(jacks-or-better|tens-or-better|nines-or-better|kings-or-better|queens-or-better|eights-or-better|sixes-or-better|aces-or-better|two-pair-or-better)/.test(id) },
  bonus: { name: 'Bonus Poker', slug: 'category-bonus.html',
    match: id => /^(bonus-poker|double-bonus|double-double-bonus|triple-bonus|triple-double-bonus|bonus-poker-deluxe|super-double-bonus|aces-and-faces|aces-and-eights|white-hot-aces|super-aces|all-american|nevada-bonus|royal-aces|ultra-bonus)/.test(id) },
  wild: { name: 'Wild Card', slug: 'category-wild.html',
    match: id => /^(deuces-wild|bonus-deuces|loose-deuces|double-deuces|short-pay-deuces|illinois-deuces|colorado-deuces|airport-deuces|nsu-deuces|downtown-deuces|vegas-strip-deuces|reno-deuces|atlantic-city-deuces|missouri-deuces|sevens-wild|threes-wild|fours-wild|fives-wild|eights-wild|tens-wild)/.test(id) },
  joker: { name: 'Joker Poker', slug: 'category-joker.html',
    match: id => /^(joker-poker|double-joker|deuces-and-joker)/.test(id) }
};

function getCategory(gameId) {
  for (const [key, cat] of Object.entries(CATEGORIES)) {
    if (cat.match(gameId)) return { key, ...cat };
  }
  return { key: 'classic', ...CATEGORIES.classic };
}

// ─── RTP data for known games ────────────────────────────────────
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

// ─── Extract game name from file ─────────────────────────────────
function extractTitle(html) {
  const m = html.match(/<title>([^<]+)<\/title>/);
  return m ? m[1].replace(/ Video Poker.*$/, '').replace(/ - .*$/, '') : 'Video Poker';
}

// ─── Generate FAQ items for a game ───────────────────────────────
function generateFAQ(gameId, gameName) {
  const data = RTP_DATA[gameId];
  const cat = getCategory(gameId);
  const faqs = [];

  // Q1: What is the RTP?
  if (data) {
    faqs.push({
      q: `What is the RTP of ${gameName}?`,
      a: `${gameName} returns ${data.rtp}% to the player (RTP) with optimal strategy. This means for every $100 wagered over the long run, the expected return is $${data.rtp}. ${parseFloat(data.rtp) >= 100 ? 'This is one of the few video poker games with a positive expected return for the player.' : parseFloat(data.rtp) >= 99 ? 'This is considered a very competitive return among video poker games.' : 'Using proper strategy is essential to achieve this return rate.'}`
    });
  }

  // Q2: How do I play this game?
  const deckSize = data && data.deck ? data.deck : 52;
  const wildInfo = data && data.wildCard ? ` ${data.wildCard} serve as wild cards, substituting for any other card to form the best possible hand.` : '';
  const minHandInfo = data ? ` The minimum winning hand is ${data.minHand}.` : '';
  faqs.push({
    q: `How do I play ${gameName}?`,
    a: `Place your bet (1-5 coins), then press Deal to receive 5 cards from a ${deckSize}-card deck.${wildInfo} Select which cards to hold, then press Draw to replace the rest. Your final hand is evaluated against the pay table.${minHandInfo} Always bet max coins (5) to qualify for the enhanced Royal Flush jackpot of 4,000 coins.`
  });

  // Q3: Category-specific question
  if (cat.key === 'wild') {
    const wildName = data && data.wildCard ? data.wildCard : 'wild cards';
    faqs.push({
      q: `What are wild cards in ${gameName}?`,
      a: `In ${gameName}, ${wildName} act as wild cards — they can substitute for any other card to complete the best possible hand. This means hands like Five of a Kind become possible. Wild card games typically require Three of a Kind as the minimum winning hand, since pairs are much easier to form with wilds.`
    });
  } else if (cat.key === 'bonus') {
    faqs.push({
      q: `What makes ${gameName} different from standard video poker?`,
      a: `${gameName} offers enhanced payouts for specific Four of a Kind hands. Unlike standard Jacks or Better where all quads pay the same, bonus games have tiered payouts — typically paying more for Four Aces and Four 2s-4s. This creates higher variance but bigger potential wins. The tradeoff is usually a reduced payout for Two Pair (1:1 instead of 2:1).`
    });
  } else if (cat.key === 'joker') {
    faqs.push({
      q: `How does the Joker work in ${gameName}?`,
      a: `${gameName} uses a ${deckSize}-card deck that includes ${data && data.wildCard === '2 Jokers' ? 'two Joker cards' : 'one Joker card'} as ${data && data.wildCard === '2 Jokers' ? 'wild cards' : 'a wild card'}. The Joker substitutes for any card to make the best possible hand, enabling hands like Five of a Kind. Because the Joker makes winning hands easier to form, the minimum qualifying hand is typically higher than in standard games.`
    });
  } else {
    faqs.push({
      q: `Is ${gameName} good for beginners?`,
      a: `Yes! ${cat.key === 'classic' ? `${gameName} is one of the best games for beginners because of its straightforward strategy and low variance. The consistent payouts mean your bankroll lasts longer while you learn.` : `${gameName} is accessible to beginners, though studying the optimal strategy will significantly improve your returns.`} Start by learning which hands to hold and always play max bet for the Royal Flush bonus. Practice here for free to build your skills before playing in a casino.`
    });
  }

  // Q4: Variance question
  if (data) {
    faqs.push({
      q: `What is the variance of ${gameName}?`,
      a: `${gameName} has ${data.variance.toLowerCase()} variance. ${
        data.variance === 'Low' ? 'This means relatively steady, predictable results with smaller swings in your bankroll. Ideal for beginners and players who prefer consistent returns.' :
        data.variance === 'Medium' ? 'This means a balanced mix of frequent small wins and occasional larger payouts. A good choice for players who want some excitement without extreme bankroll swings.' :
        data.variance === 'High' ? 'This means larger swings in your bankroll — you may experience longer losing streaks, but the potential for big payouts is greater. A larger bankroll is recommended.' :
        data.variance === 'Very High' ? 'This means significant bankroll swings with potential for large payouts on premium hands. You need a substantial bankroll and patience to ride out the dry spells.' :
        'This means extreme bankroll volatility. While the potential for massive payouts exists, extended losing streaks are common. Only recommended for experienced players with large bankrolls.'
      }`
    });
  }

  // Q5: Free play question
  faqs.push({
    q: `Can I play ${gameName} for free?`,
    a: `Yes! ${gameName} is completely free to play on Pure Video Poker. No download, no registration, and no real money required. You get 1,000 practice credits to play with. It works in any modern web browser on desktop computers, tablets, and smartphones. Use it to practice strategy and learn the game before playing at a real casino.`
  });

  return faqs;
}

// ─── Process a single game file ──────────────────────────────────
function processFile(filePath, gameId) {
  let html = fs.readFileSync(filePath, 'utf-8');
  const gameName = extractTitle(html);

  // Remove old FAQ section and schema
  html = html.replace(new RegExp(`${FAQ_START}[\\s\\S]*?${FAQ_END}\\n?`, 'g'), '');
  html = html.replace(new RegExp(`${FAQ_SCHEMA_START}[\\s\\S]*?${FAQ_SCHEMA_END}\\n?`, 'g'), '');

  const faqs = generateFAQ(gameId, gameName);

  // Build FAQ HTML
  const faqItems = faqs.map(f =>
    `<div class="faq-item"><h3 class="faq-q">${f.q}</h3><p class="faq-a">${f.a}</p></div>`
  ).join('\n    ');

  const faqBlock = `${FAQ_START}
<div class="faq-section">
  <h2>Frequently Asked Questions</h2>
  <div class="faq-list">
    ${faqItems}
  </div>
</div>
<style>.faq-section{max-width:680px;margin:16px auto;padding:14px}.faq-section h2{color:#ffe033;font-size:.95rem;letter-spacing:1px;margin:0 0 12px;text-align:center}.faq-list{display:flex;flex-direction:column;gap:10px}.faq-item{background:rgba(0,4,24,.85);border:1px solid #1d2e5f;border-radius:6px;padding:10px 14px}.faq-q{color:#ffe033;font-size:.82rem;margin:0 0 6px;letter-spacing:.5px}.faq-a{color:#99aacc;font-size:.78rem;line-height:1.6;margin:0;font-family:Arial,sans-serif}</style>
${FAQ_END}`;

  // Build FAQ schema
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a
      }
    }))
  };

  const schemaBlock = `${FAQ_SCHEMA_START}\n<script type="application/ld+json">\n${JSON.stringify(schemaData)}\n</script>\n${FAQ_SCHEMA_END}`;

  // Inject schema before </head>
  html = html.replace('</head>', `${schemaBlock}\n</head>`);

  // Inject FAQ section before </body>  (before related games if present, otherwise before </body>)
  if (html.includes('<!-- RELATED-GAMES-START -->')) {
    html = html.replace('<!-- RELATED-GAMES-START -->', `${faqBlock}\n<!-- RELATED-GAMES-START -->`);
  } else {
    html = html.replace('</body>', `${faqBlock}\n</body>`);
  }

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
console.log(`FAQ sections + schema added to ${count} game files`);
