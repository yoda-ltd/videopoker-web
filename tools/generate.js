#!/usr/bin/env node
/**
 * Video Poker Game Generator v2
 * Generates new variants by replacing PAY tables and titles in template files.
 * Uses existing game files as templates — each template defines the eval logic,
 * wild card handling, and game mechanics. Variants only change payouts and names.
 */
const fs = require('fs');
const path = require('path');

const GAMES_DIR = path.join(__dirname, '..', 'games');

// ─── Template definitions ─────────────────────────────────────────
// Each template maps to an existing game file + its default config
const TPL = {
  // Standard (no wild, no bonus)
  'job':  { file: 'jacks-or-better.html',  mode: 'jacks',   pl: 'Jacks or Better',  po: ['J','Q','K','A'], logo: 'jacks-or-better.png' },
  'tob':  { file: 'tens-or-better.html',   mode: 'jacks',   pl: 'Tens or Better',   po: ['10','J','Q','K','A'], logo: 'tens-or-better.png' },
  'nob':  { file: 'nines-or-better.html',  mode: 'jacks',   pl: 'Nines or Better',  po: ['9','10','J','Q','K','A'], logo: 'nines-or-better.png' },
  'kob':  { file: 'kings-or-better.html',  mode: 'kings',   pl: 'Kings or Better',  po: ['K','A'], logo: 'jacks-or-better.png' },
  // Bonus family
  'bp':   { file: 'bonus-poker.html',      mode: 'bonus',   pl: 'Jacks or Better',  po: ['J','Q','K','A'], logo: 'bonus-poker.png' },
  'db':   { file: 'double-bonus-poker.html', mode: 'bonus', pl: 'Jacks or Better',  po: ['J','Q','K','A'], logo: 'double-bonus-poker.png' },
  'ddb':  { file: 'double-double-bonus-poker.html', mode: 'ddb', pl: 'Jacks or Better', po: ['J','Q','K','A'], logo: 'double-bonus-poker.png' },
  'tb':   { file: 'triple-bonus-poker.html', mode: 'triplebonus', pl: 'Jacks or Better', po: ['J','Q','K','A'], logo: 'bonus-poker.png' },
  'tdb':  { file: 'triple-double-bonus-poker.html', mode: 'tdb', pl: 'Jacks or Better', po: ['J','Q','K','A'], logo: 'double-bonus-poker.png' },
  'bpd':  { file: 'bonus-poker-deluxe.html', mode: 'bpdeluxe', pl: 'Jacks or Better', po: ['J','Q','K','A'], logo: 'bonus-poker.png' },
  'sdb':  { file: 'super-double-bonus.html', mode: 'superdbl', pl: 'Jacks or Better', po: ['J','Q','K','A'], logo: 'double-bonus-poker.png' },
  'af':   { file: 'aces-and-faces.html',   mode: 'acesfaces', pl: 'Jacks or Better', po: ['J','Q','K','A'], logo: 'aces-and-faces.png' },
  'ae':   { file: 'aces-and-eights.html',  mode: 'a8',      pl: 'Jacks or Better',  po: ['J','Q','K','A'], logo: 'aces-and-faces.png' },
  'wha':  { file: 'white-hot-aces.html',   mode: 'wha',     pl: 'Jacks or Better',  po: ['J','Q','K','A'], logo: 'double-bonus-poker.png' },
  'sa':   { file: 'super-aces-bonus.html', mode: 'superaces', pl: 'Jacks or Better', po: ['J','Q','K','A'], logo: 'aces-and-faces.png' },
  'aa':   { file: 'all-american-poker.html', mode: 'allameri', pl: 'Jacks or Better', po: ['J','Q','K','A'], logo: 'all-american-poker.png' },
  // Deuces Wild family
  'dw':   { file: 'deuces-wild.html',      mode: 'deuces',  pl: 'Three of a Kind',  po: ['J','Q','K','A'], logo: 'deuces-wild.png' },
  'bdw':  { file: 'bonus-deuces-wild.html', mode: 'bonusdeuces', pl: 'Three of a Kind', po: ['J','Q','K','A'], logo: 'deuces-wild.png' },
  'ld':   { file: 'loose-deuces-wild.html', mode: 'loosedeuces', pl: 'Three of a Kind', po: ['J','Q','K','A'], logo: 'deuces-wild.png' },
  'ddw':  { file: 'double-deuces-wild.html', mode: 'doubledeuces', pl: 'Three of a Kind', po: ['J','Q','K','A'], logo: 'deuces-wild.png' },
  'dwb':  { file: 'deuces-wild-bonus.html', mode: 'dwbonus', pl: 'Three of a Kind',  po: ['J','Q','K','A'], logo: 'deuces-wild.png' },
  'dwd':  { file: 'deuces-wild-deluxe.html', mode: 'deucesdeluxe', pl: 'Three of a Kind', po: ['J','Q','K','A'], logo: 'deuces-wild.png' },
  // Joker family
  'jp':   { file: 'joker-poker.html',      mode: 'joker',   pl: 'Kings or Better',  po: ['K','A'], logo: 'jacks-or-better.png' },
  'jpa':  { file: 'joker-poker-aces.html', mode: 'jokeraces', pl: 'Aces or Better', po: ['A'], logo: 'jacks-or-better.png' },
  'jpt':  { file: 'joker-poker-twopair.html', mode: 'joker2p', pl: '',              po: [], logo: 'jacks-or-better.png' },
  'djp':  { file: 'double-joker-poker.html', mode: 'dbljoker', pl: 'Kings or Better', po: ['K','A'], logo: 'jacks-or-better.png' },
  'djw':  { file: 'deuces-and-joker-wild.html', mode: 'deucesjoker', pl: 'Three of a Kind', po: ['J','Q','K','A'], logo: 'deuces-wild.png' },
  // Rank Wild
  'rw':   { file: 'sevens-wild.html',      mode: 'sevenswild', pl: 'Three of a Kind', po: ['J','Q','K','A'], logo: 'deuces-wild.png' },
};

// ─── Game definitions ─────────────────────────────────────────────
// Each game: { id, name, tpl (key in TPL), badge, pay, desc }
// Optional: wildRank, fourWildsName (for rankwild only)
// mode/pairLabel/pairOk/logo inherited from TPL defaults
const GAMES = [

  // ═══ BATCH 5 (already generated, will be skipped) ═══

  // Standard variants
  { id:'queens-or-better', name:'Queens or Better', tpl:'job', badge:'CLASSIC', mode:'queens', pl:'Queens or Better', po:['Q','K','A'],
    pay:{'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[25,125],'Full House':[8,40],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Queens or Better':[1,5]},
    desc:'Classic draw poker requiring a pair of Queens or higher to win.' },
  { id:'eights-or-better', name:'Eights or Better', tpl:'job', badge:'EASY', mode:'eights', pl:'Eights or Better', po:['8','9','10','J','Q','K','A'],
    pay:{'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[25,125],'Full House':[6,30],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Eights or Better':[1,5]},
    desc:'Easy video poker — any pair of 8s or higher wins.' },
  { id:'sixes-or-better', name:'Sixes or Better', tpl:'job', badge:'EASY+', mode:'sixes', pl:'Sixes or Better', po:['6','7','8','9','10','J','Q','K','A'],
    pay:{'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[20,100],'Full House':[5,25],'Flush':[4,20],'Straight':[3,15],'Three of a Kind':[2,10],'Two Pair':[1,5],'Sixes or Better':[1,5]},
    desc:'Very easy video poker — pair of 6s or higher pays.' },
  { id:'aces-or-better', name:'Aces or Better', tpl:'job', badge:'HARD', mode:'acesonly', pl:'Aces or Better', po:['A'],
    pay:{'Royal Flush':[250,4000],'Straight Flush':[80,400],'Four of a Kind':[40,200],'Full House':[8,40],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Aces or Better':[1,5]},
    desc:'Challenge mode — only a pair of Aces qualifies as the minimum winning hand.' },
  { id:'two-pair-or-better', name:'Two Pair or Better', tpl:'job', badge:'HARD+', mode:'twopair', pl:'Two Pair or Better', po:[],
    pay:{'Royal Flush':[250,4000],'Straight Flush':[100,500],'Four of a Kind':[50,250],'Full House':[12,60],'Flush':[8,40],'Straight':[5,25],'Three of a Kind':[4,20],'Two Pair':[1,5]},
    desc:'Minimum winning hand is Two Pair. No single pair pays.' },
  { id:'jacks-or-better-85', name:'Jacks or Better 8/5', tpl:'job', badge:'CLASSIC', mode:'jacks85',
    pay:{'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[25,125],'Full House':[8,40],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Jacks or Better':[1,5]},
    desc:'The 8/5 pay table variant of Jacks or Better.' },
  { id:'jacks-or-better-75', name:'Jacks or Better 7/5', tpl:'job', badge:'CLASSIC', mode:'jacks75',
    pay:{'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[25,125],'Full House':[7,35],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Jacks or Better':[1,5]},
    desc:'The 7/5 pay table variant. Short-pay version common at airports and bars.' },
  { id:'jacks-or-better-65', name:'Jacks or Better 6/5', tpl:'job', badge:'CLASSIC', mode:'jacks65',
    pay:{'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[25,125],'Full House':[6,30],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Jacks or Better':[1,5]},
    desc:'The 6/5 pay table — most common in dollar denomination machines.' },
  // Bonus variants
  { id:'nevada-bonus-poker', name:'Nevada Bonus Poker', tpl:'bp', badge:'BONUS',
    pay:{'Royal Flush':[250,4000],'Four Aces':[80,400],'Straight Flush':[50,250],'Four 2s-4s':[40,200],'Four of a Kind':[25,125],'Full House':[7,35],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Jacks or Better':[1,5]},
    desc:'Nevada-style bonus poker with enhanced Four Aces (80x) and Four 2s-4s (40x) payouts.' },
  { id:'royal-aces-bonus', name:'Royal Aces Bonus', tpl:'bp', badge:'MEGA', logo:'aces-and-faces.png',
    pay:{'Royal Flush':[250,4000],'Four Aces':[400,2000],'Straight Flush':[50,250],'Four 2s-4s':[40,200],'Four of a Kind':[25,125],'Full House':[6,30],'Flush':[4,20],'Straight':[3,15],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]},
    desc:'Massive Four Aces payout at 400x your bet.' },
  { id:'ultra-bonus-poker', name:'Ultra Bonus Poker', tpl:'bp', badge:'HI-VAR',
    pay:{'Royal Flush':[250,4000],'Four Aces':[240,1200],'Straight Flush':[80,400],'Four 2s-4s':[120,600],'Four of a Kind':[50,250],'Full House':[6,30],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]},
    desc:'Ultra-high variance bonus poker. Four Aces pay 240x and Four 2s-4s pay 120x.' },
  // Deuces Wild variants
  { id:'short-pay-deuces-wild', name:'Short Pay Deuces Wild', tpl:'dw', badge:'WILD',
    pay:{'Natural Royal Flush':[800,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[16,80],'Straight Flush':[10,50],'Four of a Kind':[4,20],'Full House':[4,20],'Flush':[3,15],'Straight':[2,10],'Three of a Kind':[1,5]},
    desc:'Short-pay version of Deuces Wild commonly found in casino bars.' },
  { id:'illinois-deuces-wild', name:'Illinois Deuces Wild', tpl:'dw', badge:'WILD',
    pay:{'Natural Royal Flush':[800,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[10,50],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[2,10],'Three of a Kind':[1,5]},
    desc:'Illinois-style Deuces Wild. Common in Midwest riverboat casinos.' },
  { id:'colorado-deuces-wild', name:'Colorado Deuces Wild', tpl:'dw', badge:'WILD',
    pay:{'Natural Royal Flush':[800,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[9,45],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[2,10],'Three of a Kind':[1,5]},
    desc:'Colorado mountain casino variant.' },
  { id:'airport-deuces-wild', name:'Airport Deuces Wild', tpl:'dw', badge:'WILD',
    pay:{'Natural Royal Flush':[800,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[20,100],'Five of a Kind':[12,60],'Straight Flush':[9,45],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[2,10],'Three of a Kind':[1,5]},
    desc:'The notoriously tight pay table found in airports.' },
  { id:'nsu-deuces-wild', name:'NSU Deuces Wild', tpl:'dw', badge:'PRO',
    pay:{'Natural Royal Flush':[800,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[16,80],'Straight Flush':[13,65],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[2,10],'Three of a Kind':[1,5]},
    desc:'The "Not So Ugly" Deuces Wild — nearly full-pay with 99.73% RTP.' },
  { id:'downtown-deuces-wild', name:'Downtown Deuces Wild', tpl:'dw', badge:'WILD',
    pay:{'Natural Royal Flush':[800,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[16,80],'Straight Flush':[10,50],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[2,10],'Three of a Kind':[1,5]},
    desc:'The downtown Las Vegas Fremont Street variant.' },
  // Rank Wild variants
  { id:'threes-wild', name:'Threes Wild', tpl:'rw', badge:'WILD', mode:'threeswild', wildRank:'3', fourWildsName:'Four Threes',
    pay:{'Natural Royal Flush':[250,4000],'Four Threes':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[9,45],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]},
    desc:'All four 3s are wild cards.' },
  { id:'fours-wild', name:'Fours Wild', tpl:'rw', badge:'WILD', mode:'fourswild', wildRank:'4', fourWildsName:'Four Fours',
    pay:{'Natural Royal Flush':[250,4000],'Four Fours':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[9,45],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]},
    desc:'All four 4s are wild cards.' },
  { id:'fives-wild', name:'Fives Wild', tpl:'rw', badge:'WILD', mode:'fiveswild', wildRank:'5', fourWildsName:'Four Fives',
    pay:{'Natural Royal Flush':[250,4000],'Four Fives':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[9,45],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]},
    desc:'All four 5s are wild.' },
  { id:'eights-wild', name:'Eights Wild', tpl:'rw', badge:'WILD', mode:'eightswild', wildRank:'8', fourWildsName:'Four Eights',
    pay:{'Natural Royal Flush':[250,4000],'Four Eights':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[9,45],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]},
    desc:'All four 8s are wild.' },
  { id:'tens-wild', name:'Tens Wild', tpl:'rw', badge:'WILD', mode:'tenswild', wildRank:'10', fourWildsName:'Four Tens',
    pay:{'Natural Royal Flush':[250,4000],'Four Tens':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[9,45],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]},
    desc:'All four 10s are wild cards.' },

  // ═══ BATCH 6 — 70 new common casino variants ═══

  // ── Jacks or Better pay table variants ──
  { id:'jacks-or-better-86', name:'Jacks or Better 8/6', tpl:'job', badge:'CLASSIC', mode:'jacks86',
    pay:{'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[25,125],'Full House':[8,40],'Flush':[6,30],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Jacks or Better':[1,5]},
    desc:'The 8/6 Jacks or Better pay table — 98.39% RTP. Common in mid-range casino floors.' },
  { id:'jacks-or-better-95', name:'Jacks or Better 9/5', tpl:'job', badge:'CLASSIC', mode:'jacks95',
    pay:{'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[25,125],'Full House':[9,45],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Jacks or Better':[1,5]},
    desc:'The 9/5 Jacks or Better — Full House 9x but Flush only 5x. 98.45% RTP.' },

  // ── Bonus Poker pay table variants ──
  { id:'bonus-poker-75', name:'Bonus Poker 7/5', tpl:'bp', badge:'BONUS',
    pay:{'Royal Flush':[250,4000],'Four Aces':[80,400],'Straight Flush':[50,250],'Four 2s-4s':[40,200],'Four of a Kind':[25,125],'Full House':[7,35],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Jacks or Better':[1,5]},
    desc:'Bonus Poker 7/5 — Full House 7x, Flush 5x. 98.02% RTP. Very common on casino floors.' },
  { id:'bonus-poker-65', name:'Bonus Poker 6/5', tpl:'bp', badge:'BONUS',
    pay:{'Royal Flush':[250,4000],'Four Aces':[80,400],'Straight Flush':[50,250],'Four 2s-4s':[40,200],'Four of a Kind':[25,125],'Full House':[6,30],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Jacks or Better':[1,5]},
    desc:'Bonus Poker 6/5 — the tighter pay table. 96.87% RTP. Common at bar-top machines.' },
  { id:'bonus-poker-107', name:'Bonus Poker 10/7', tpl:'bp', badge:'PRO',
    pay:{'Royal Flush':[250,4000],'Four Aces':[80,400],'Straight Flush':[50,250],'Four 2s-4s':[40,200],'Four of a Kind':[25,125],'Full House':[10,50],'Flush':[7,35],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Jacks or Better':[1,5]},
    desc:'Bonus Poker 10/7 — full-pay version with 99.17% RTP. The best Bonus Poker pay table available.' },

  // ── Double Bonus pay table variants ──
  { id:'double-bonus-97', name:'Double Bonus 9/7', tpl:'db', badge:'BONUS',
    pay:{'Royal Flush':[250,4000],'Four Aces':[160,800],'Four 2s-4s':[80,400],'Straight Flush':[50,250],'Four of a Kind':[50,250],'Full House':[9,45],'Flush':[7,35],'Straight':[5,25],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]},
    desc:'Double Bonus 9/7 — 99.11% RTP. A popular full-pay variant with enhanced quad payouts.' },
  { id:'double-bonus-96', name:'Double Bonus 9/6', tpl:'db', badge:'BONUS',
    pay:{'Royal Flush':[250,4000],'Four Aces':[160,800],'Four 2s-4s':[80,400],'Straight Flush':[50,250],'Four of a Kind':[50,250],'Full House':[9,45],'Flush':[6,30],'Straight':[5,25],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]},
    desc:'Double Bonus 9/6 — 97.81% RTP. Common in Las Vegas casinos with good Four of a Kind payouts.' },
  { id:'double-bonus-95', name:'Double Bonus 9/5', tpl:'db', badge:'BONUS',
    pay:{'Royal Flush':[250,4000],'Four Aces':[160,800],'Four 2s-4s':[80,400],'Straight Flush':[50,250],'Four of a Kind':[50,250],'Full House':[9,45],'Flush':[5,25],'Straight':[5,25],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]},
    desc:'Double Bonus 9/5 — 96.50% RTP. Found in many Strip casinos.' },
  { id:'double-bonus-85', name:'Double Bonus 8/5', tpl:'db', badge:'BONUS',
    pay:{'Royal Flush':[250,4000],'Four Aces':[160,800],'Four 2s-4s':[80,400],'Straight Flush':[50,250],'Four of a Kind':[50,250],'Full House':[8,40],'Flush':[5,25],'Straight':[5,25],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]},
    desc:'Double Bonus 8/5 — short-pay version. Still offers big quad bonuses.' },

  // ── Double Double Bonus pay table variants ──
  { id:'double-double-bonus-96', name:'Double Double Bonus 9/6', tpl:'ddb', badge:'BONUS',
    pay:{'Royal Flush':[250,4000],'Four Aces + 2/3/4':[400,2000],'Four 2/3/4 + A/2/3/4':[160,800],'Four Aces':[160,800],'Four 2s-4s':[80,400],'Four of a Kind':[50,250],'Straight Flush':[50,250],'Full House':[9,45],'Flush':[6,30],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]},
    desc:'Double Double Bonus 9/6 — full-pay version at 98.98% RTP. The most popular bonus poker variant in casinos.' },
  { id:'double-double-bonus-85', name:'Double Double Bonus 8/5', tpl:'ddb', badge:'BONUS',
    pay:{'Royal Flush':[250,4000],'Four Aces + 2/3/4':[400,2000],'Four 2/3/4 + A/2/3/4':[160,800],'Four Aces':[160,800],'Four 2s-4s':[80,400],'Four of a Kind':[50,250],'Straight Flush':[50,250],'Full House':[8,40],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]},
    desc:'Double Double Bonus 8/5 — 96.79% RTP. Common mid-range pay table.' },
  { id:'double-double-bonus-75', name:'Double Double Bonus 7/5', tpl:'ddb', badge:'BONUS',
    pay:{'Royal Flush':[250,4000],'Four Aces + 2/3/4':[400,2000],'Four 2/3/4 + A/2/3/4':[160,800],'Four Aces':[160,800],'Four 2s-4s':[80,400],'Four of a Kind':[50,250],'Straight Flush':[50,250],'Full House':[7,35],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]},
    desc:'Double Double Bonus 7/5 — 95.71% RTP. Short-pay version found at bar-top machines.' },
  { id:'double-double-bonus-65', name:'Double Double Bonus 6/5', tpl:'ddb', badge:'BONUS',
    pay:{'Royal Flush':[250,4000],'Four Aces + 2/3/4':[400,2000],'Four 2/3/4 + A/2/3/4':[160,800],'Four Aces':[160,800],'Four 2s-4s':[80,400],'Four of a Kind':[50,250],'Straight Flush':[50,250],'Full House':[6,30],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]},
    desc:'Double Double Bonus 6/5 — tightest common DDB pay table at 94.66% RTP.' },

  // ── Triple Double Bonus pay table variants ──
  { id:'triple-double-bonus-97', name:'Triple Double Bonus 9/7', tpl:'tdb', badge:'HI-VAR',
    pay:{'Royal Flush':[250,4000],'Four Aces + 2/3/4':[800,4000],'Four 2/3/4 + A/2/3/4':[400,2000],'Four Aces':[400,2000],'Four 2s-4s':[160,800],'Four of a Kind':[50,250],'Straight Flush':[50,250],'Full House':[9,45],'Flush':[7,35],'Straight':[4,20],'Three of a Kind':[2,10],'Two Pair':[1,5],'Jacks or Better':[1,5]},
    desc:'Triple Double Bonus 9/7 — full-pay at 99.58% RTP. Massive kicker bonuses on quads.' },
  { id:'triple-double-bonus-85', name:'Triple Double Bonus 8/5', tpl:'tdb', badge:'HI-VAR',
    pay:{'Royal Flush':[250,4000],'Four Aces + 2/3/4':[800,4000],'Four 2/3/4 + A/2/3/4':[400,2000],'Four Aces':[400,2000],'Four 2s-4s':[160,800],'Four of a Kind':[50,250],'Straight Flush':[50,250],'Full House':[8,40],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[2,10],'Two Pair':[1,5],'Jacks or Better':[1,5]},
    desc:'Triple Double Bonus 8/5 — 96.39% RTP. Common casino floor version.' },
  { id:'triple-double-bonus-75', name:'Triple Double Bonus 7/5', tpl:'tdb', badge:'HI-VAR',
    pay:{'Royal Flush':[250,4000],'Four Aces + 2/3/4':[800,4000],'Four 2/3/4 + A/2/3/4':[400,2000],'Four Aces':[400,2000],'Four 2s-4s':[160,800],'Four of a Kind':[50,250],'Straight Flush':[50,250],'Full House':[7,35],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[2,10],'Two Pair':[1,5],'Jacks or Better':[1,5]},
    desc:'Triple Double Bonus 7/5 — short-pay version at 95.17% RTP.' },

  // ── Triple Bonus Poker pay table variants ──
  { id:'triple-bonus-96', name:'Triple Bonus Plus 9/6', tpl:'tb', badge:'HI-VAR',
    pay:{'Royal Flush':[250,4000],'Straight Flush':[100,500],'Four Aces':[240,1200],'Four 2s-4s':[120,600],'Four 5s-Ks':[75,375],'Full House':[9,45],'Flush':[6,30],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]},
    desc:'Triple Bonus Plus 9/6 — enhanced Full House/Flush. Three tiers of quad payouts.' },
  { id:'triple-bonus-85', name:'Triple Bonus Plus 8/5', tpl:'tb', badge:'HI-VAR',
    pay:{'Royal Flush':[250,4000],'Straight Flush':[100,500],'Four Aces':[240,1200],'Four 2s-4s':[120,600],'Four 5s-Ks':[75,375],'Full House':[8,40],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]},
    desc:'Triple Bonus Plus 8/5 — common casino version with three-tier quad bonuses.' },
  { id:'triple-bonus-75', name:'Triple Bonus Plus 7/5', tpl:'tb', badge:'HI-VAR',
    pay:{'Royal Flush':[250,4000],'Straight Flush':[100,500],'Four Aces':[240,1200],'Four 2s-4s':[120,600],'Four 5s-Ks':[75,375],'Full House':[7,35],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]},
    desc:'Triple Bonus Plus 7/5 — short-pay triple bonus with reduced Full House.' },

  // ── Bonus Poker Deluxe pay table variants ──
  { id:'bonus-poker-deluxe-85', name:'Bonus Poker Deluxe 8/5', tpl:'bpd', badge:'DELUXE',
    pay:{'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[80,400],'Full House':[8,40],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]},
    desc:'Bonus Poker Deluxe 8/5 — all quads pay 80x. 97.40% RTP. Simple and straightforward.' },
  { id:'bonus-poker-deluxe-75', name:'Bonus Poker Deluxe 7/5', tpl:'bpd', badge:'DELUXE',
    pay:{'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[80,400],'Full House':[7,35],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]},
    desc:'Bonus Poker Deluxe 7/5 — short-pay version. 96.25% RTP.' },
  { id:'bonus-poker-deluxe-65', name:'Bonus Poker Deluxe 6/5', tpl:'bpd', badge:'DELUXE',
    pay:{'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[80,400],'Full House':[6,30],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]},
    desc:'Bonus Poker Deluxe 6/5 — tightest pay table. 95.36% RTP.' },

  // ── Super Double Bonus pay table variants ──
  { id:'super-double-bonus-96', name:'Super Double Bonus 9/6', tpl:'sdb', badge:'MEGA',
    pay:{'Royal Flush':[250,4000],'Four Aces + 2/3/4':[400,2000],'Four 2/3/4 + A/2/3/4':[160,800],'Four Aces':[160,800],'Four 2s-4s':[80,400],'Four of a Kind':[50,250],'Straight Flush':[50,250],'Full House':[9,45],'Flush':[6,30],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]},
    desc:'Super Double Bonus 9/6 — full-pay version at 99.69% RTP. Top-tier kicker bonus game.' },
  { id:'super-double-bonus-75', name:'Super Double Bonus 7/5', tpl:'sdb', badge:'MEGA',
    pay:{'Royal Flush':[250,4000],'Four Aces + 2/3/4':[400,2000],'Four 2/3/4 + A/2/3/4':[160,800],'Four Aces':[160,800],'Four 2s-4s':[80,400],'Four of a Kind':[50,250],'Straight Flush':[50,250],'Full House':[7,35],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]},
    desc:'Super Double Bonus 7/5 — short-pay casino floor version.' },

  // ── Aces and Faces pay table variants ──
  { id:'aces-and-faces-85', name:'Aces and Faces 8/5', tpl:'af', badge:'BONUS',
    pay:{'Royal Flush':[250,4000],'Four Aces':[80,400],'Straight Flush':[50,250],'Four Faces (J/Q/K)':[40,200],'Four of a Kind':[25,125],'Full House':[8,40],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Jacks or Better':[1,5]},
    desc:'Aces and Faces 8/5 — bonuses for quad Aces and quad face cards. 97.40% RTP.' },
  { id:'aces-and-faces-75', name:'Aces and Faces 7/5', tpl:'af', badge:'BONUS',
    pay:{'Royal Flush':[250,4000],'Four Aces':[80,400],'Straight Flush':[50,250],'Four Faces (J/Q/K)':[40,200],'Four of a Kind':[25,125],'Full House':[7,35],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Jacks or Better':[1,5]},
    desc:'Aces and Faces 7/5 — short-pay version. 96.28% RTP.' },
  { id:'aces-and-faces-76', name:'Aces and Faces 7/6', tpl:'af', badge:'BONUS',
    pay:{'Royal Flush':[250,4000],'Four Aces':[80,400],'Straight Flush':[50,250],'Four Faces (J/Q/K)':[40,200],'Four of a Kind':[25,125],'Full House':[7,35],'Flush':[6,30],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Jacks or Better':[1,5]},
    desc:'Aces and Faces 7/6 — balanced mid-range pay table. 97.14% RTP.' },

  // ── Aces and Eights pay table variants ──
  { id:'aces-and-eights-75', name:'Aces and Eights 7/5', tpl:'ae', badge:'BONUS',
    pay:{'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four Aces':[80,400],'Four Eights':[80,400],'Four Sevens':[50,250],'Four of a Kind':[25,125],'Full House':[7,35],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Jacks or Better':[1,5]},
    desc:'Aces and Eights 7/5 — short-pay version with bonus for quad Aces and Eights.' },
  { id:'aces-and-eights-86', name:'Aces and Eights 8/6', tpl:'ae', badge:'BONUS',
    pay:{'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four Aces':[80,400],'Four Eights':[80,400],'Four Sevens':[50,250],'Four of a Kind':[25,125],'Full House':[8,40],'Flush':[6,30],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Jacks or Better':[1,5]},
    desc:'Aces and Eights 8/6 — mid-range pay table. 98.14% RTP.' },

  // ── White Hot Aces pay table variants ──
  { id:'white-hot-aces-85', name:'White Hot Aces 8/5', tpl:'wha', badge:'MEGA',
    pay:{'Royal Flush':[250,4000],'Four Aces + 2/3/4':[800,4000],'Four 2/3/4 + A/2/3/4':[400,2000],'Four Aces':[400,2000],'Four 2s-4s':[80,400],'Four of a Kind':[50,250],'Straight Flush':[50,250],'Full House':[8,40],'Flush':[5,25],'Straight':[3,15],'Three of a Kind':[2,10],'Two Pair':[1,5],'Jacks or Better':[1,5]},
    desc:'White Hot Aces 8/5 — higher Full House than standard WHA. 96.72% RTP.' },
  { id:'white-hot-aces-65', name:'White Hot Aces 6/5', tpl:'wha', badge:'MEGA',
    pay:{'Royal Flush':[250,4000],'Four Aces + 2/3/4':[800,4000],'Four 2/3/4 + A/2/3/4':[400,2000],'Four Aces':[400,2000],'Four 2s-4s':[80,400],'Four of a Kind':[50,250],'Straight Flush':[50,250],'Full House':[6,30],'Flush':[5,25],'Straight':[3,15],'Three of a Kind':[2,10],'Two Pair':[1,5],'Jacks or Better':[1,5]},
    desc:'White Hot Aces 6/5 — short-pay version. Massive Aces kicker bonuses.' },

  // ── Super Aces pay table variants ──
  { id:'super-aces-bonus-85', name:'Super Aces Bonus 8/5', tpl:'sa', badge:'MEGA',
    pay:{'Royal Flush':[250,4000],'Four Aces':[400,2000],'Straight Flush':[60,300],'Four 2s-4s':[80,400],'Four of a Kind':[50,250],'Full House':[8,40],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]},
    desc:'Super Aces Bonus 8/5 — higher Full House pay for the mega Aces bonus game.' },
  { id:'super-aces-bonus-65', name:'Super Aces Bonus 6/5', tpl:'sa', badge:'MEGA',
    pay:{'Royal Flush':[250,4000],'Four Aces':[400,2000],'Straight Flush':[60,300],'Four 2s-4s':[80,400],'Four of a Kind':[50,250],'Full House':[6,30],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]},
    desc:'Super Aces Bonus 6/5 — tighter pay table with 400x Four Aces bonus.' },

  // ── All American pay table variants ──
  { id:'all-american-poker-86', name:'All American Poker 8/6', tpl:'aa', badge:'ALL-PAY',
    pay:{'Royal Flush':[250,4000],'Straight Flush':[200,1000],'Four of a Kind':[40,200],'Full House':[8,40],'Flush':[6,30],'Straight':[6,30],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]},
    desc:'All American Poker 8/6 — Flush and Straight both pay 6x. Equal pay for all drawing hands.' },
  { id:'all-american-poker-66', name:'All American Poker 6/6', tpl:'aa', badge:'ALL-PAY',
    pay:{'Royal Flush':[250,4000],'Straight Flush':[200,1000],'Four of a Kind':[40,200],'Full House':[6,30],'Flush':[6,30],'Straight':[6,30],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]},
    desc:'All American Poker 6/6 — all medium hands pay the same. Simplified strategy.' },

  // ── Deuces Wild pay table variants ──
  { id:'vegas-strip-deuces-wild', name:'Vegas Strip Deuces Wild', tpl:'dw', badge:'WILD',
    pay:{'Natural Royal Flush':[800,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[16,80],'Straight Flush':[10,50],'Four of a Kind':[4,20],'Full House':[4,20],'Flush':[3,15],'Straight':[1,5],'Three of a Kind':[1,5]},
    desc:'Vegas Strip Deuces Wild — found on the Las Vegas Strip. Full House pays 4x.' },
  { id:'reno-deuces-wild', name:'Reno Deuces Wild', tpl:'dw', badge:'WILD',
    pay:{'Natural Royal Flush':[800,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[11,55],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[2,10],'Three of a Kind':[1,5]},
    desc:'Reno Deuces Wild — the Reno, Nevada variant. Straight Flush pays 11x.' },
  { id:'atlantic-city-deuces-wild', name:'Atlantic City Deuces Wild', tpl:'dw', badge:'WILD',
    pay:{'Natural Royal Flush':[800,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[9,45],'Four of a Kind':[5,25],'Full House':[3,15],'Flush':[2,10],'Straight':[2,10],'Three of a Kind':[1,5]},
    desc:'Atlantic City Deuces Wild — the New Jersey boardwalk variant. Balanced payouts.' },
  { id:'missouri-deuces-wild', name:'Missouri Deuces Wild', tpl:'dw', badge:'WILD',
    pay:{'Natural Royal Flush':[800,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[12,60],'Straight Flush':[9,45],'Four of a Kind':[4,20],'Full House':[4,20],'Flush':[3,15],'Straight':[2,10],'Three of a Kind':[1,5]},
    desc:'Missouri Deuces Wild — found in Missouri riverboat casinos. Tight Five of a Kind.' },

  // ── Bonus Deuces Wild pay table variants ──
  { id:'bonus-deuces-wild-1343', name:'Bonus Deuces Wild 13/4/3', tpl:'bdw', badge:'WILD+',
    pay:{'Natural Royal Flush':[250,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[13,65],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]},
    desc:'Bonus Deuces Wild 13/4/3 — high Straight Flush payout at 13x. 99.45% RTP.' },
  { id:'bonus-deuces-wild-1043', name:'Bonus Deuces Wild 10/4/3', tpl:'bdw', badge:'WILD+',
    pay:{'Natural Royal Flush':[250,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[10,50],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]},
    desc:'Bonus Deuces Wild 10/4/3 — standard Straight Flush payout. 98.80% RTP.' },
  { id:'bonus-deuces-wild-1243', name:'Bonus Deuces Wild 12/4/3', tpl:'bdw', badge:'WILD+',
    pay:{'Natural Royal Flush':[250,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[12,60],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]},
    desc:'Bonus Deuces Wild 12/4/3 — 99.15% RTP. High Straight Flush variant.' },

  // ── Loose Deuces pay table variants ──
  { id:'loose-deuces-wild-1510', name:'Loose Deuces 15/10', tpl:'ld', badge:'LOOSE',
    pay:{'Natural Royal Flush':[250,4000],'Four Deuces':[500,2500],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[10,50],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]},
    desc:'Loose Deuces 15/10 — Four Deuces pays 500x. Straight Flush 10x. 99.93% RTP.' },
  { id:'loose-deuces-wild-128', name:'Loose Deuces 12/8', tpl:'ld', badge:'LOOSE',
    pay:{'Natural Royal Flush':[250,4000],'Four Deuces':[500,2500],'Wild Royal Flush':[25,125],'Five of a Kind':[12,60],'Straight Flush':[8,40],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]},
    desc:'Loose Deuces 12/8 — short-pay version with reduced Five of a Kind. Still huge 500x Four Deuces.' },

  // ── Double Deuces Wild pay table variants ──
  { id:'double-deuces-wild-128', name:'Double Deuces Wild 12/8', tpl:'ddw', badge:'WILD',
    pay:{'Natural Royal Flush':[250,4000],'Four Deuces':[400,2000],'Wild Royal Flush':[25,125],'Five of a Kind':[12,60],'Straight Flush':[8,40],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]},
    desc:'Double Deuces Wild 12/8 — Four Deuces pays double (400x). Reduced other payouts.' },
  { id:'double-deuces-wild-1510', name:'Double Deuces Wild 15/10', tpl:'ddw', badge:'WILD',
    pay:{'Natural Royal Flush':[250,4000],'Four Deuces':[400,2000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[10,50],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]},
    desc:'Double Deuces Wild 15/10 — balanced Double Deuces variant. 400x Four Deuces.' },

  // ── Deuces Wild Bonus pay table variants ──
  { id:'deuces-wild-bonus-1243', name:'Deuces Wild Bonus 12/4/3', tpl:'dwb', badge:'WILD+',
    pay:{'Natural Royal Flush':[250,4000],'Four Deuces + Ace':[400,2000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[12,60],'Straight Flush':[8,40],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]},
    desc:'Deuces Wild Bonus 12/4/3 — bonus for Four Deuces with Ace kicker. Short-pay version.' },
  { id:'deuces-wild-bonus-1643', name:'Deuces Wild Bonus 16/4/3', tpl:'dwb', badge:'WILD+',
    pay:{'Natural Royal Flush':[250,4000],'Four Deuces + Ace':[400,2000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[16,80],'Straight Flush':[13,65],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]},
    desc:'Deuces Wild Bonus 16/4/3 — full-pay version. High Five of a Kind and Straight Flush payouts.' },

  // ── Deuces Wild Deluxe pay table variants ──
  { id:'deuces-wild-deluxe-1243', name:'Deuces Wild Deluxe 12/4/3', tpl:'dwd', badge:'DELUXE',
    pay:{'Natural Royal Flush':[250,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[12,60],'Straight Flush':[8,40],'Four of a Kind':[4,20],'Full House':[4,20],'Flush':[3,15],'Straight':[2,10],'Three of a Kind':[1,5]},
    desc:'Deuces Wild Deluxe 12/4/3 — deluxe version with Full House paying 4x.' },
  { id:'deuces-wild-deluxe-1643', name:'Deuces Wild Deluxe 16/4/3', tpl:'dwd', badge:'DELUXE',
    pay:{'Natural Royal Flush':[250,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[16,80],'Straight Flush':[12,60],'Four of a Kind':[4,20],'Full House':[4,20],'Flush':[3,15],'Straight':[2,10],'Three of a Kind':[1,5]},
    desc:'Deuces Wild Deluxe 16/4/3 — full-pay deluxe version. High Five of a Kind at 16x.' },

  // ── Joker Poker (Kings or Better) pay table variants ──
  { id:'joker-poker-75', name:'Joker Poker 7/5', tpl:'jp', badge:'JOKER',
    pay:{'Natural Royal Flush':[250,4000],'Five of a Kind':[200,1000],'Wild Royal Flush':[100,500],'Straight Flush':[50,250],'Four of a Kind':[20,100],'Full House':[7,35],'Flush':[5,25],'Straight':[3,15],'Three of a Kind':[2,10],'Two Pair':[1,5],'Kings or Better':[1,5]},
    desc:'Joker Poker 7/5 — one Joker wild in 53-card deck. Full House 7x, Flush 5x. 98.60% RTP.' },
  { id:'joker-poker-65', name:'Joker Poker 6/5', tpl:'jp', badge:'JOKER',
    pay:{'Natural Royal Flush':[250,4000],'Five of a Kind':[200,1000],'Wild Royal Flush':[100,500],'Straight Flush':[50,250],'Four of a Kind':[20,100],'Full House':[6,30],'Flush':[5,25],'Straight':[3,15],'Three of a Kind':[2,10],'Two Pair':[1,5],'Kings or Better':[1,5]},
    desc:'Joker Poker 6/5 — short-pay Joker Poker. 97.19% RTP.' },
  { id:'joker-poker-85', name:'Joker Poker 8/5', tpl:'jp', badge:'JOKER',
    pay:{'Natural Royal Flush':[250,4000],'Five of a Kind':[200,1000],'Wild Royal Flush':[100,500],'Straight Flush':[50,250],'Four of a Kind':[20,100],'Full House':[8,40],'Flush':[5,25],'Straight':[3,15],'Three of a Kind':[2,10],'Two Pair':[1,5],'Kings or Better':[1,5]},
    desc:'Joker Poker 8/5 — higher Full House payout. 98.94% RTP.' },

  // ── Joker Poker (Aces or Better) pay table variants ──
  { id:'joker-poker-aces-75', name:'Joker Poker Aces 7/5', tpl:'jpa', badge:'JOKER',
    pay:{'Natural Royal Flush':[250,4000],'Five of a Kind':[200,1000],'Wild Royal Flush':[100,500],'Straight Flush':[50,250],'Four of a Kind':[20,100],'Full House':[7,35],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[2,10],'Two Pair':[1,5],'Aces or Better':[1,5]},
    desc:'Joker Poker Aces 7/5 — minimum qualifying hand is Aces. Short-pay version.' },
  { id:'joker-poker-aces-65', name:'Joker Poker Aces 6/5', tpl:'jpa', badge:'JOKER',
    pay:{'Natural Royal Flush':[250,4000],'Five of a Kind':[200,1000],'Wild Royal Flush':[100,500],'Straight Flush':[50,250],'Four of a Kind':[20,100],'Full House':[6,30],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[2,10],'Two Pair':[1,5],'Aces or Better':[1,5]},
    desc:'Joker Poker Aces 6/5 — tightest Aces-or-Better Joker Poker variant.' },

  // ── Joker Poker (Two Pair) pay table variants ──
  { id:'joker-poker-twopair-85', name:'Joker Poker Two Pair 8/5', tpl:'jpt', badge:'JOKER',
    pay:{'Natural Royal Flush':[250,4000],'Five of a Kind':[100,500],'Wild Royal Flush':[50,250],'Straight Flush':[50,250],'Four of a Kind':[20,100],'Full House':[8,40],'Flush':[5,25],'Straight':[5,25],'Three of a Kind':[2,10],'Two Pair':[1,5]},
    desc:'Joker Poker Two Pair 8/5 — no pair minimum, Two Pair is the lowest win. Higher Full House.' },
  { id:'joker-poker-twopair-75', name:'Joker Poker Two Pair 7/5', tpl:'jpt', badge:'JOKER',
    pay:{'Natural Royal Flush':[250,4000],'Five of a Kind':[100,500],'Wild Royal Flush':[50,250],'Straight Flush':[50,250],'Four of a Kind':[20,100],'Full House':[7,35],'Flush':[5,25],'Straight':[5,25],'Three of a Kind':[2,10],'Two Pair':[1,5]},
    desc:'Joker Poker Two Pair 7/5 — short-pay version with Two Pair minimum.' },

  // ── Double Joker Poker pay table variants ──
  { id:'double-joker-poker-75', name:'Double Joker Poker 7/5', tpl:'djp', badge:'JOKER',
    pay:{'Natural Royal Flush':[250,4000],'Two Jokers':[100,500],'Wild Royal Flush':[50,250],'Five of a Kind':[50,250],'Straight Flush':[25,125],'Four of a Kind':[10,50],'Full House':[7,35],'Flush':[5,25],'Straight':[3,15],'Three of a Kind':[2,10],'Two Pair':[1,5],'Kings or Better':[1,5]},
    desc:'Double Joker Poker 7/5 — two Jokers in 54-card deck. Higher Full House payout.' },
  { id:'double-joker-poker-55', name:'Double Joker Poker 5/5', tpl:'djp', badge:'JOKER',
    pay:{'Natural Royal Flush':[250,4000],'Two Jokers':[100,500],'Wild Royal Flush':[50,250],'Five of a Kind':[50,250],'Straight Flush':[25,125],'Four of a Kind':[10,50],'Full House':[5,25],'Flush':[5,25],'Straight':[3,15],'Three of a Kind':[2,10],'Two Pair':[1,5],'Kings or Better':[1,5]},
    desc:'Double Joker Poker 5/5 — short-pay version of the two-Joker variant.' },

  // ── Deuces and Joker Wild pay table variants ──
  { id:'deuces-and-joker-wild-85', name:'Deuces and Joker Wild 8/5', tpl:'djw', badge:'WILD',
    pay:{'Natural Royal Flush':[250,4000],'Five Wilds':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[8,40],'Four of a Kind':[3,15],'Full House':[3,15],'Flush':[3,15],'Straight':[2,10],'Three of a Kind':[1,5]},
    desc:'Deuces and Joker Wild 8/5 — all four 2s plus Joker as wilds. Reduced Straight Flush.' },
  { id:'deuces-and-joker-wild-65', name:'Deuces and Joker Wild 6/5', tpl:'djw', badge:'WILD',
    pay:{'Natural Royal Flush':[250,4000],'Five Wilds':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[6,30],'Four of a Kind':[3,15],'Full House':[3,15],'Flush':[3,15],'Straight':[2,10],'Three of a Kind':[1,5]},
    desc:'Deuces and Joker Wild 6/5 — tighter version of the 5-wild-card game.' },

  // ── Sevens Wild pay table variants ──
  { id:'sevens-wild-2515', name:'Sevens Wild 25/15', tpl:'rw', badge:'WILD', mode:'sevenswild',
    pay:{'Natural Royal Flush':[250,4000],'Four Sevens':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[12,60],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]},
    desc:'Sevens Wild 25/15 — full-pay version with higher Straight Flush at 12x.' },
  { id:'sevens-wild-2010', name:'Sevens Wild 20/10', tpl:'rw', badge:'WILD', mode:'sevenswild',
    pay:{'Natural Royal Flush':[250,4000],'Four Sevens':[200,1000],'Wild Royal Flush':[20,100],'Five of a Kind':[10,50],'Straight Flush':[8,40],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]},
    desc:'Sevens Wild 20/10 — short-pay version. Reduced Wild Royal and Five of a Kind.' },

  // ── Additional common pay table variants ──
  { id:'tens-or-better-75', name:'Tens or Better 7/5', tpl:'tob', badge:'EASY',
    pay:{'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[25,125],'Full House':[7,35],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Tens or Better':[1,5]},
    desc:'Tens or Better 7/5 — short-pay version. Pair of 10s or higher wins.' },
  { id:'nines-or-better-75', name:'Nines or Better 7/5', tpl:'nob', badge:'EASY',
    pay:{'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[25,125],'Full House':[7,35],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Nines or Better':[1,5]},
    desc:'Nines or Better 7/5 — short-pay version. Any pair of 9s or higher wins.' },
  { id:'kings-or-better-75', name:'Kings or Better 7/5', tpl:'kob', badge:'HARD',
    pay:{'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[25,125],'Full House':[7,35],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Kings or Better':[1,5]},
    desc:'Kings or Better 7/5 — short-pay version. Only Kings or Aces qualify as minimum pair.' },
  { id:'bonus-poker-deluxe-96', name:'Bonus Poker Deluxe 9/6', tpl:'bpd', badge:'DELUXE',
    pay:{'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[80,400],'Full House':[9,45],'Flush':[6,30],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]},
    desc:'Bonus Poker Deluxe 9/6 — full-pay version. All quads pay 80x. 99.64% RTP.' },
  { id:'double-double-bonus-106', name:'Double Double Bonus 10/6', tpl:'ddb', badge:'PRO',
    pay:{'Royal Flush':[250,4000],'Four Aces + 2/3/4':[400,2000],'Four 2/3/4 + A/2/3/4':[160,800],'Four Aces':[160,800],'Four 2s-4s':[80,400],'Four of a Kind':[50,250],'Straight Flush':[50,250],'Full House':[10,50],'Flush':[6,30],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]},
    desc:'Double Double Bonus 10/6 — full-pay at 100.07% RTP. The best DDB pay table — player-favorable.' },
  { id:'triple-double-bonus-95', name:'Triple Double Bonus 9/5', tpl:'tdb', badge:'HI-VAR',
    pay:{'Royal Flush':[250,4000],'Four Aces + 2/3/4':[800,4000],'Four 2/3/4 + A/2/3/4':[400,2000],'Four Aces':[400,2000],'Four 2s-4s':[160,800],'Four of a Kind':[50,250],'Straight Flush':[50,250],'Full House':[9,45],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[2,10],'Two Pair':[1,5],'Jacks or Better':[1,5]},
    desc:'Triple Double Bonus 9/5 — 97.02% RTP. Reduced Flush but strong Full House.' },
  { id:'double-bonus-106', name:'Double Bonus 10/6', tpl:'db', badge:'BONUS',
    pay:{'Royal Flush':[250,4000],'Four Aces':[160,800],'Four 2s-4s':[80,400],'Straight Flush':[50,250],'Four of a Kind':[50,250],'Full House':[10,50],'Flush':[6,30],'Straight':[5,25],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]},
    desc:'Double Bonus 10/6 — nearly full-pay at 99.61% RTP. Strong Full House and quad bonuses.' },
];

// ─── Generator logic ───────────────────────────────────────────────

function generatePayTableHTML(pay) {
  let rows = '<tr><th>Hand</th><th>BET 1</th><th>BET 2</th><th>BET 3</th><th>BET 4</th><th>BET 5</th></tr>';
  for (const [hand, [b1, b5]] of Object.entries(pay)) {
    rows += `<tr><td>${hand}</td><td>${b1}</td><td>${b1*2}</td><td>${b1*3}</td><td>${b1*4}</td><td>${b5}</td></tr>`;
  }
  return `<table>${rows}</table>`;
}

function generateSEO(game, tplKey) {
  const payTableHTML = generatePayTableHTML(game.pay);
  const handNames = Object.keys(game.pay);
  const minHand = handNames[handNames.length - 1];
  const tplType = tplKey;

  let wildNote = '';
  if (['dw','bdw','ld','ddw','dwb','dwd'].includes(tplType)) wildNote = ' All four 2s (Deuces) act as wild cards, substituting for any card you need.';
  else if (['jp','jpa','jpt'].includes(tplType)) wildNote = ' Includes one Joker as a wild card in a 53-card deck.';
  else if (['djp'].includes(tplType)) wildNote = ' Includes two Jokers as wild cards in a 54-card deck.';
  else if (['djw'].includes(tplType)) wildNote = ' All four Deuces and one Joker act as wild cards.';
  else if (tplType === 'rw' && game.wildRank) wildNote = ` All four ${game.wildRank}s act as wild cards, substituting for any card you need.`;

  return `<div id="seo-sep" style="width:100%;max-width:680px;padding:16px 16px 0;text-align:center;color:rgba(255,255,255,.25);font-size:.75rem;letter-spacing:2px">▼ &nbsp; GAME GUIDE &nbsp; ▼</div>
<div id="seo">
<h2>How to Play ${game.name} Video Poker — Free Online Casino Game</h2>
  <p>${game.desc}${wildNote}</p>

  <h2>Basic Rules — How to Play</h2>
  <p>1. <strong>Place your bet</strong>: Choose BET 1 through BET 5. Always play BET 5 (max bet) — it unlocks the enhanced Royal Flush jackpot.</p>
  <p>2. <strong>Receive 5 cards</strong>: You're dealt 5 cards from the deck.</p>
  <p>3. <strong>Select cards to HOLD</strong>: Click the cards you want to keep. The goal is to build the strongest possible poker hand.</p>
  <p>4. <strong>Press DRAW</strong>: Discarded cards are replaced from the remaining deck. Your final hand is evaluated against the payout table.</p>
  <p>5. <strong>Minimum winning hand</strong>: ${minHand} pays 1× your bet.</p>

  <h2>Payout Table</h2>
  ${payTableHTML}
</div>`;
}

function generateGame(game) {
  const tpl = TPL[game.tpl];
  const templatePath = path.join(GAMES_DIR, tpl.file);
  let html = fs.readFileSync(templatePath, 'utf8');

  // Use game-specific overrides or template defaults
  const mode = game.mode || tpl.mode;
  const pairLabel = game.pl || tpl.pl;
  const pairOk = game.po || tpl.po;
  const logo = game.logo || tpl.logo;

  // 1. Replace <title>
  html = html.replace(/<title>.*?<\/title>/, `<title>${game.name} Video Poker - Play Free Online | No Download</title>`);

  // 2. Replace meta description
  html = html.replace(
    /(<meta name="description" content=").*?(")/,
    `$1Play free ${game.name} video poker online. No download, no registration. Classic casino video poker in your browser.$2`
  );

  // 3. Replace schema JSON
  html = html.replace(/"name":".*?Video Poker"/, `"name":"${game.name} Video Poker"`);
  html = html.replace(
    /"description":"Free online .*?"/,
    `"description":"Free online ${game.name} video poker. No download required."`
  );

  // 4. Replace header h1
  html = html.replace(
    /(<h1>)&#9824; .*? &#9829;(<\/h1>)/,
    `$1&#9824; ${game.name} &#9829;$2`
  );

  // 5. Replace SEO section
  html = html.replace(
    /<div id="seo-sep"[\s\S]*?<\/div>\s*<script>/,
    generateSEO(game, game.tpl) + '\n<script>'
  );

  // 6. Replace PAY constant
  const payStr = JSON.stringify(game.pay).replace(/"/g, "'");
  html = html.replace(/const PAY=\{.*?\};/, `const PAY=${payStr};`);

  // 7. Replace MODE
  html = html.replace(/const MODE='.*?';/, `const MODE='${mode}';`);

  // 8. Replace PAIR_LABEL
  html = html.replace(/const PAIR_LABEL='.*?';/, `const PAIR_LABEL='${pairLabel}';`);

  // 9. Replace PAIR_OK
  html = html.replace(/const PAIR_OK=\[.*?\];/, `const PAIR_OK=${JSON.stringify(pairOk)};`);

  // 10. For rank-wild variants, update wild card logic
  if (game.tpl === 'rw' && game.wildRank) {
    const wr = game.wildRank;
    const m = mode;

    // Update evalWild isWild check
    html = html.replace(/kind==='sevenswild'\?c\.r==='7'/g, `kind==='${m}'?c.r==='${wr}'`);

    // Update Four Wilds name
    html = html.replace(/'Four Sevens'/g, `'${game.fourWildsName}'`);

    // Update kind check
    html = html.replace(/kind==='sevenswild'/g, `kind==='${m}'`);

    // Update evalHand call
    html = html.replace(/evalWild\(h,'sevenswild'\)/g, `evalWild(h,'${m}')`);

    // Update cardHTML wild check (BEFORE generic MODE replacement)
    html = html.replace(/MODE==='sevenswild'&&c\.r==='7'/g, `MODE==='${m}'&&c.r==='${wr}'`);

    // Update remaining MODE check
    html = html.replace(/MODE==='sevenswild'/g, `MODE==='${m}'`);
  }

  const outPath = path.join(GAMES_DIR, `${game.id}.html`);
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`  ✅ ${game.id}.html`);
}

// ─── Main ──────────────────────────────────────────────────────────

console.log('\n🎰 Video Poker Game Generator v2\n');

// Filter out games that already exist
const toGenerate = GAMES.filter(g => {
  const outPath = path.join(GAMES_DIR, `${g.id}.html`);
  if (fs.existsSync(outPath)) {
    console.log(`  ⏭️  ${g.id}.html already exists, skipping`);
    return false;
  }
  return true;
});

if (toGenerate.length === 0) {
  console.log('\nNo new games to generate. All games already exist.');
  process.exit(0);
}

console.log(`\nGenerating ${toGenerate.length} new games...\n`);
toGenerate.forEach(generateGame);
console.log(`\n✅ Generated ${toGenerate.length} new game files`);

const totalFiles = fs.readdirSync(GAMES_DIR).filter(f => f.endsWith('.html')).length;
console.log(`\n🎉 Done! Total game files: ${totalFiles}`);
