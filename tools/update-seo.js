#!/usr/bin/env node
/**
 * SEO Content Updater for Video Poker Games
 * Replaces minimal SEO sections with rich, category-specific game guides.
 * Matches the quality of hand-written guides in the original 8 games.
 */
const fs = require('fs');
const path = require('path');

const GAMES_DIR = path.join(__dirname, '..', 'games');

// ─── Game definitions (same as generate.js) ────────────────────────
const GAMES = [
  // BATCH 5
  { id:'queens-or-better', name:'Queens or Better', tpl:'job', pay:{'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[25,125],'Full House':[8,40],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Queens or Better':[1,5]}, desc:'Classic draw poker requiring a pair of Queens or higher to win. This slightly tighter minimum-hand requirement changes basic strategy — low pairs below Queens no longer pay, making flush and straight draws relatively more valuable.' },
  { id:'eights-or-better', name:'Eights or Better', tpl:'job', pay:{'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[25,125],'Full House':[6,30],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Eights or Better':[1,5]}, desc:'Easy video poker where any pair of 8s or higher wins. The lower pair threshold means more frequent wins, making this an ideal game for beginners learning video poker strategy.' },
  { id:'sixes-or-better', name:'Sixes or Better', tpl:'job', pay:{'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[20,100],'Full House':[5,25],'Flush':[4,20],'Straight':[3,15],'Three of a Kind':[2,10],'Two Pair':[1,5],'Sixes or Better':[1,5]}, desc:'Very easy video poker where a pair of 6s or higher pays. Most pairs you are dealt will already be winners, though individual hand payouts are reduced to compensate for the higher hit frequency.' },
  { id:'aces-or-better', name:'Aces or Better', tpl:'job', pay:{'Royal Flush':[250,4000],'Straight Flush':[80,400],'Four of a Kind':[40,200],'Full House':[8,40],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Aces or Better':[1,5]}, desc:'Challenge mode where only a pair of Aces qualifies as the minimum winning hand. Higher-ranking hands pay significantly more to compensate for the difficulty, with Straight Flush at 80x and Four of a Kind at 40x.' },
  { id:'two-pair-or-better', name:'Two Pair or Better', tpl:'job', pay:{'Royal Flush':[250,4000],'Straight Flush':[100,500],'Four of a Kind':[50,250],'Full House':[12,60],'Flush':[8,40],'Straight':[5,25],'Three of a Kind':[4,20],'Two Pair':[1,5]}, desc:'The toughest standard variant — no single pair pays at all. You need at least Two Pair to win. Higher hands are boosted significantly: Straight Flush at 100x and Full House at 12x.' },
  { id:'jacks-or-better-85', name:'Jacks or Better 8/5', tpl:'job', pay:{'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[25,125],'Full House':[8,40],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Jacks or Better':[1,5]}, desc:'The 8/5 Jacks or Better pay table returns approximately 97.30% with optimal play. Full House pays 8x and Flush pays 5x — a step down from the full-pay 9/6 version but still one of the better games on most casino floors.' },
  { id:'jacks-or-better-75', name:'Jacks or Better 7/5', tpl:'job', pay:{'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[25,125],'Full House':[7,35],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Jacks or Better':[1,5]}, desc:'The 7/5 Jacks or Better is a short-pay version returning about 96.15% RTP, commonly found at airport terminals and bar-top machines. Despite the lower return, it remains the most-played video poker variant worldwide.' },
  { id:'jacks-or-better-65', name:'Jacks or Better 6/5', tpl:'job', pay:{'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[25,125],'Full House':[6,30],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Jacks or Better':[1,5]}, desc:'The 6/5 Jacks or Better is the most common variant found on dollar-denomination machines. While the 95.00% RTP makes it one of the tighter pay tables, it remains popular due to its simplicity and widespread availability.' },
  // Bonus variants
  { id:'nevada-bonus-poker', name:'Nevada Bonus Poker', tpl:'bp', pay:{'Royal Flush':[250,4000],'Four Aces':[80,400],'Straight Flush':[50,250],'Four 2s-4s':[40,200],'Four of a Kind':[25,125],'Full House':[7,35],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Jacks or Better':[1,5]}, desc:'Nevada-style bonus poker with enhanced quad payouts: Four Aces pay 80x and Four 2s-4s pay 40x. This classic Las Vegas variant adds excitement to standard Jacks or Better without drastically changing the basic strategy.' },
  { id:'royal-aces-bonus', name:'Royal Aces Bonus', tpl:'bp', pay:{'Royal Flush':[250,4000],'Four Aces':[400,2000],'Straight Flush':[50,250],'Four 2s-4s':[40,200],'Four of a Kind':[25,125],'Full House':[6,30],'Flush':[4,20],'Straight':[3,15],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]}, desc:'Royal Aces Bonus offers a massive 400x payout for Four Aces — among the highest ace-quad bonuses in any video poker variant. The tradeoff is reduced Full House (6x) and Flush (4x) payouts, creating extreme variance.' },
  { id:'ultra-bonus-poker', name:'Ultra Bonus Poker', tpl:'bp', pay:{'Royal Flush':[250,4000],'Four Aces':[240,1200],'Straight Flush':[80,400],'Four 2s-4s':[120,600],'Four of a Kind':[50,250],'Full House':[6,30],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]}, desc:'Ultra-high variance bonus poker where Four Aces pay 240x and Four 2s-4s pay an enormous 120x. Straight Flush is boosted to 80x. This game rewards patient players willing to endure longer losing streaks for massive quad payouts.' },
  // Deuces Wild variants
  { id:'short-pay-deuces-wild', name:'Short Pay Deuces Wild', tpl:'dw', pay:{'Natural Royal Flush':[800,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[16,80],'Straight Flush':[10,50],'Four of a Kind':[4,20],'Full House':[4,20],'Flush':[3,15],'Straight':[2,10],'Three of a Kind':[1,5]}, desc:'Short-pay Deuces Wild commonly found in casino bars and lounges. While the payouts are reduced from full-pay, it maintains Full House at 4x and Five of a Kind at 16x. All four 2s are wild cards.' },
  { id:'illinois-deuces-wild', name:'Illinois Deuces Wild', tpl:'dw', pay:{'Natural Royal Flush':[800,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[10,50],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[2,10],'Three of a Kind':[1,5]}, desc:'The Illinois-style Deuces Wild, common on Midwest riverboat casinos. Slightly reduced Five of a Kind (15x) but solid Straight Flush at 10x. All four deuces act as wild cards.' },
  { id:'colorado-deuces-wild', name:'Colorado Deuces Wild', tpl:'dw', pay:{'Natural Royal Flush':[800,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[9,45],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[2,10],'Three of a Kind':[1,5]}, desc:'Colorado mountain casino variant of Deuces Wild with Straight Flush at 9x. A common pay table in Colorado limited-stakes casinos where all four 2s act as wild cards.' },
  { id:'airport-deuces-wild', name:'Airport Deuces Wild', tpl:'dw', pay:{'Natural Royal Flush':[800,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[20,100],'Five of a Kind':[12,60],'Straight Flush':[9,45],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[2,10],'Three of a Kind':[1,5]}, desc:'The notoriously tight pay table commonly found at airport terminal machines. Wild Royal reduced to 20x and Five of a Kind to 12x. Despite lower returns, it remains Deuces Wild with four wild cards.' },
  { id:'nsu-deuces-wild', name:'NSU Deuces Wild', tpl:'dw', pay:{'Natural Royal Flush':[800,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[16,80],'Straight Flush':[13,65],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[2,10],'Three of a Kind':[1,5]}, desc:'The "Not So Ugly" Deuces Wild offers near-full-pay returns at 99.73% RTP. Straight Flush pays 13x and Five of a Kind pays 16x. One of the best Deuces Wild pay tables available with all four 2s wild.' },
  { id:'downtown-deuces-wild', name:'Downtown Deuces Wild', tpl:'dw', pay:{'Natural Royal Flush':[800,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[16,80],'Straight Flush':[10,50],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[2,10],'Three of a Kind':[1,5]}, desc:'The downtown Las Vegas Fremont Street variant of Deuces Wild. Five of a Kind pays 16x with Straight Flush at 10x. A popular choice among serious players in old Vegas downtown casinos.' },
  // Rank Wild variants
  { id:'threes-wild', name:'Threes Wild', tpl:'rw', wildRank:'3', fourWildsName:'Four Threes', pay:{'Natural Royal Flush':[250,4000],'Four Threes':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[9,45],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]}, desc:'All four 3s act as wild cards in this rank-wild variant. Strategy closely mirrors Deuces Wild but with a key difference — 3s appear in different straight combinations than 2s, subtly affecting flush and straight draw calculations.' },
  { id:'fours-wild', name:'Fours Wild', tpl:'rw', wildRank:'4', fourWildsName:'Four Fours', pay:{'Natural Royal Flush':[250,4000],'Four Fours':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[9,45],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]}, desc:'All four 4s are wild cards. The mid-range wild rank affects straight draw possibilities differently than Deuces Wild, as 4s participate in more straight combinations (A-5, 2-6, 3-7, 4-8).' },
  { id:'fives-wild', name:'Fives Wild', tpl:'rw', wildRank:'5', fourWildsName:'Four Fives', pay:{'Natural Royal Flush':[250,4000],'Four Fives':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[9,45],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]}, desc:'All four 5s are wild cards. Since 5s are central to many straight combinations, this variant creates unique strategic considerations. The wild 5s remove a key straight connector from the natural deck.' },
  { id:'eights-wild', name:'Eights Wild', tpl:'rw', wildRank:'8', fourWildsName:'Four Eights', pay:{'Natural Royal Flush':[250,4000],'Four Eights':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[9,45],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]}, desc:'All four 8s are wild cards. With the 8s removed as natural cards, mid-range straight draws are disrupted while high and low straight possibilities remain largely intact.' },
  { id:'tens-wild', name:'Tens Wild', tpl:'rw', wildRank:'10', fourWildsName:'Four Tens', pay:{'Natural Royal Flush':[250,4000],'Four Tens':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[9,45],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]}, desc:'All four 10s are wild cards. This high-rank wild variant significantly impacts Royal Flush and high straight possibilities, since 10s are a key component of natural Royals.' },
  // BATCH 6
  { id:'jacks-or-better-86', name:'Jacks or Better 8/6', tpl:'job', pay:{'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[25,125],'Full House':[8,40],'Flush':[6,30],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Jacks or Better':[1,5]}, desc:'The 8/6 Jacks or Better returns approximately 98.39% RTP with perfect strategy. The enhanced Flush payout at 6x makes flush draws slightly more valuable than in the 8/5 version, while Full House remains at 8x.' },
  { id:'jacks-or-better-95', name:'Jacks or Better 9/5', tpl:'job', pay:{'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[25,125],'Full House':[9,45],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Jacks or Better':[1,5]}, desc:'The 9/5 Jacks or Better features full-pay Full House at 9x but a reduced Flush at 5x, returning approximately 98.45% RTP. This pay table shifts strategy slightly away from flush draws compared to the standard 9/6 game.' },
  { id:'bonus-poker-75', name:'Bonus Poker 7/5', tpl:'bp', pay:{'Royal Flush':[250,4000],'Four Aces':[80,400],'Straight Flush':[50,250],'Four 2s-4s':[40,200],'Four of a Kind':[25,125],'Full House':[7,35],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Jacks or Better':[1,5]}, desc:'Bonus Poker 7/5 returns approximately 98.02% RTP. The most common Bonus Poker pay table found on casino floors, featuring enhanced quad payouts — Four Aces at 80x and Four 2s-4s at 40x.' },
  { id:'bonus-poker-65', name:'Bonus Poker 6/5', tpl:'bp', pay:{'Royal Flush':[250,4000],'Four Aces':[80,400],'Straight Flush':[50,250],'Four 2s-4s':[40,200],'Four of a Kind':[25,125],'Full House':[6,30],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Jacks or Better':[1,5]}, desc:'Bonus Poker 6/5 is the tighter pay table version at 96.87% RTP, commonly found at bar-top machines. Despite the reduced Full House (6x), the bonus quad payouts still make it more exciting than standard Jacks or Better.' },
  { id:'bonus-poker-107', name:'Bonus Poker 10/7', tpl:'bp', pay:{'Royal Flush':[250,4000],'Four Aces':[80,400],'Straight Flush':[50,250],'Four 2s-4s':[40,200],'Four of a Kind':[25,125],'Full House':[10,50],'Flush':[7,35],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Jacks or Better':[1,5]}, desc:'Bonus Poker 10/7 is the full-pay version returning 99.17% RTP — one of the best bonus poker pay tables. With Full House at 10x and Flush at 7x, plus the enhanced quad bonuses, this is a favorite among advantage players.' },
  { id:'double-bonus-97', name:'Double Bonus 9/7', tpl:'db', pay:{'Royal Flush':[250,4000],'Four Aces':[160,800],'Four 2s-4s':[80,400],'Straight Flush':[50,250],'Four of a Kind':[50,250],'Full House':[9,45],'Flush':[7,35],'Straight':[5,25],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]}, desc:'Double Bonus 9/7 returns 99.11% RTP with optimal play. Four Aces pay an impressive 160x and Four 2s-4s pay 80x. The tradeoff is Two Pair paying only 1x, creating higher variance than standard Jacks or Better.' },
  { id:'double-bonus-96', name:'Double Bonus 9/6', tpl:'db', pay:{'Royal Flush':[250,4000],'Four Aces':[160,800],'Four 2s-4s':[80,400],'Straight Flush':[50,250],'Four of a Kind':[50,250],'Full House':[9,45],'Flush':[6,30],'Straight':[5,25],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]}, desc:'Double Bonus 9/6 at 97.81% RTP is one of the most common Double Bonus pay tables found in Las Vegas casinos. Enhanced quad payouts with Four Aces at 160x and Two Pair paying only 1x drive the high-variance gameplay.' },
  { id:'double-bonus-95', name:'Double Bonus 9/5', tpl:'db', pay:{'Royal Flush':[250,4000],'Four Aces':[160,800],'Four 2s-4s':[80,400],'Straight Flush':[50,250],'Four of a Kind':[50,250],'Full House':[9,45],'Flush':[5,25],'Straight':[5,25],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]}, desc:'Double Bonus 9/5 at 96.50% RTP is found in many Las Vegas Strip casinos. While the Flush is reduced to 5x, the big quad bonuses — Four Aces at 160x and standard quads at 50x — keep players coming back.' },
  { id:'double-bonus-85', name:'Double Bonus 8/5', tpl:'db', pay:{'Royal Flush':[250,4000],'Four Aces':[160,800],'Four 2s-4s':[80,400],'Straight Flush':[50,250],'Four of a Kind':[50,250],'Full House':[8,40],'Flush':[5,25],'Straight':[5,25],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]}, desc:'Double Bonus 8/5 is the short-pay version with a reduced Full House at 8x. Despite lower returns, it maintains the signature big quad bonuses: Four Aces at 160x, Four 2s-4s at 80x, and all other quads at 50x.' },
  { id:'double-double-bonus-96', name:'Double Double Bonus 9/6', tpl:'ddb', pay:{'Royal Flush':[250,4000],'Four Aces + 2/3/4':[400,2000],'Four 2/3/4 + A/2/3/4':[160,800],'Four Aces':[160,800],'Four 2s-4s':[80,400],'Four of a Kind':[50,250],'Straight Flush':[50,250],'Full House':[9,45],'Flush':[6,30],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]}, desc:'Double Double Bonus 9/6 at 98.98% RTP is the most popular bonus poker variant in casinos. It adds kicker bonuses: Four Aces with a 2, 3, or 4 kicker pays a massive 400x, making the fifth card matter for quad Aces.' },
  { id:'double-double-bonus-85', name:'Double Double Bonus 8/5', tpl:'ddb', pay:{'Royal Flush':[250,4000],'Four Aces + 2/3/4':[400,2000],'Four 2/3/4 + A/2/3/4':[160,800],'Four Aces':[160,800],'Four 2s-4s':[80,400],'Four of a Kind':[50,250],'Straight Flush':[50,250],'Full House':[8,40],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]}, desc:'Double Double Bonus 8/5 at 96.79% RTP is a common mid-range pay table. The kicker bonuses still offer excitement — Four Aces with a 2/3/4 kicker pays 400x, making every dealt Ace trio a heart-pounding moment.' },
  { id:'double-double-bonus-75', name:'Double Double Bonus 7/5', tpl:'ddb', pay:{'Royal Flush':[250,4000],'Four Aces + 2/3/4':[400,2000],'Four 2/3/4 + A/2/3/4':[160,800],'Four Aces':[160,800],'Four 2s-4s':[80,400],'Four of a Kind':[50,250],'Straight Flush':[50,250],'Full House':[7,35],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]}, desc:'Double Double Bonus 7/5 at 95.71% RTP is the short-pay version found at bar-top machines. Despite tighter Full House/Flush payouts, the 400x Four Aces kicker bonus keeps the game thrilling.' },
  { id:'double-double-bonus-65', name:'Double Double Bonus 6/5', tpl:'ddb', pay:{'Royal Flush':[250,4000],'Four Aces + 2/3/4':[400,2000],'Four 2/3/4 + A/2/3/4':[160,800],'Four Aces':[160,800],'Four 2s-4s':[80,400],'Four of a Kind':[50,250],'Straight Flush':[50,250],'Full House':[6,30],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]}, desc:'Double Double Bonus 6/5 at 94.66% RTP is the tightest common DDB pay table. Full House drops to 6x but the signature kicker bonuses remain — Four Aces with 2/3/4 still pays 400x.' },
  { id:'triple-double-bonus-97', name:'Triple Double Bonus 9/7', tpl:'tdb', pay:{'Royal Flush':[250,4000],'Four Aces + 2/3/4':[800,4000],'Four 2/3/4 + A/2/3/4':[400,2000],'Four Aces':[400,2000],'Four 2s-4s':[160,800],'Four of a Kind':[50,250],'Straight Flush':[50,250],'Full House':[9,45],'Flush':[7,35],'Straight':[4,20],'Three of a Kind':[2,10],'Two Pair':[1,5],'Jacks or Better':[1,5]}, desc:'Triple Double Bonus 9/7 at 99.58% RTP features the most extreme kicker bonuses in any standard video poker game. Four Aces with a 2/3/4 kicker pays an incredible 800x — the same as a Royal Flush at max bet.' },
  { id:'triple-double-bonus-85', name:'Triple Double Bonus 8/5', tpl:'tdb', pay:{'Royal Flush':[250,4000],'Four Aces + 2/3/4':[800,4000],'Four 2/3/4 + A/2/3/4':[400,2000],'Four Aces':[400,2000],'Four 2s-4s':[160,800],'Four of a Kind':[50,250],'Straight Flush':[50,250],'Full House':[8,40],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[2,10],'Two Pair':[1,5],'Jacks or Better':[1,5]}, desc:'Triple Double Bonus 8/5 at 96.39% RTP is the common casino floor version. Four Aces with a low kicker pays 800x, making it one of the highest-variance games available.' },
  { id:'triple-double-bonus-75', name:'Triple Double Bonus 7/5', tpl:'tdb', pay:{'Royal Flush':[250,4000],'Four Aces + 2/3/4':[800,4000],'Four 2/3/4 + A/2/3/4':[400,2000],'Four Aces':[400,2000],'Four 2s-4s':[160,800],'Four of a Kind':[50,250],'Straight Flush':[50,250],'Full House':[7,35],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[2,10],'Two Pair':[1,5],'Jacks or Better':[1,5]}, desc:'Triple Double Bonus 7/5 at 95.17% RTP is the short-pay version. Despite lower base returns, the 800x Four Aces kicker bonus makes every hand exciting.' },
  { id:'triple-bonus-96', name:'Triple Bonus Plus 9/6', tpl:'tb', pay:{'Royal Flush':[250,4000],'Straight Flush':[100,500],'Four Aces':[240,1200],'Four 2s-4s':[120,600],'Four 5s-Ks':[75,375],'Full House':[9,45],'Flush':[6,30],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]}, desc:'Triple Bonus Plus 9/6 features three distinct tiers of quad payouts: Four Aces at 240x, Four 2s-4s at 120x, and Four 5s-Ks at 75x. Combined with enhanced Straight Flush at 100x, this is a high-variance favorite.' },
  { id:'triple-bonus-85', name:'Triple Bonus Plus 8/5', tpl:'tb', pay:{'Royal Flush':[250,4000],'Straight Flush':[100,500],'Four Aces':[240,1200],'Four 2s-4s':[120,600],'Four 5s-Ks':[75,375],'Full House':[8,40],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]}, desc:'Triple Bonus Plus 8/5 is the common casino version with three-tier quad bonuses. Four Aces at 240x, Four 2s-4s at 120x, and Four 5s-Ks at 75x keep the variance high and the excitement real.' },
  { id:'triple-bonus-75', name:'Triple Bonus Plus 7/5', tpl:'tb', pay:{'Royal Flush':[250,4000],'Straight Flush':[100,500],'Four Aces':[240,1200],'Four 2s-4s':[120,600],'Four 5s-Ks':[75,375],'Full House':[7,35],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]}, desc:'Triple Bonus Plus 7/5 is the short-pay version with reduced Full House at 7x. The three-tier quad system still delivers: Four Aces (240x), Four 2s-4s (120x), Four 5s-Ks (75x).' },
  { id:'bonus-poker-deluxe-85', name:'Bonus Poker Deluxe 8/5', tpl:'bpd', pay:{'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[80,400],'Full House':[8,40],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]}, desc:'Bonus Poker Deluxe 8/5 at 97.40% RTP simplifies the bonus concept: all Four of a Kind hands pay a uniform 80x regardless of rank. No tiered bonuses, just straightforward quad hunting with a higher-than-standard payout.' },
  { id:'bonus-poker-deluxe-75', name:'Bonus Poker Deluxe 7/5', tpl:'bpd', pay:{'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[80,400],'Full House':[7,35],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]}, desc:'Bonus Poker Deluxe 7/5 at 96.25% RTP is the short-pay version. All quads still pay 80x — three times higher than standard Jacks or Better. The uniform quad payout simplifies strategy decisions.' },
  { id:'bonus-poker-deluxe-65', name:'Bonus Poker Deluxe 6/5', tpl:'bpd', pay:{'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[80,400],'Full House':[6,30],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]}, desc:'Bonus Poker Deluxe 6/5 at 95.36% RTP is the tightest BPD pay table. Despite the lower Full House, the 80x quad bonus on every Four of a Kind makes it more exciting than standard draw poker.' },
  { id:'super-double-bonus-96', name:'Super Double Bonus 9/6', tpl:'sdb', pay:{'Royal Flush':[250,4000],'Four Aces + 2/3/4':[400,2000],'Four 2/3/4 + A/2/3/4':[160,800],'Four Aces':[160,800],'Four 2s-4s':[80,400],'Four of a Kind':[50,250],'Straight Flush':[50,250],'Full House':[9,45],'Flush':[6,30],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]}, desc:'Super Double Bonus 9/6 at 99.69% RTP is one of the best returning video poker games. Combines Double Double Bonus kicker mechanics with enhanced base payouts for a top-tier player experience.' },
  { id:'super-double-bonus-75', name:'Super Double Bonus 7/5', tpl:'sdb', pay:{'Royal Flush':[250,4000],'Four Aces + 2/3/4':[400,2000],'Four 2/3/4 + A/2/3/4':[160,800],'Four Aces':[160,800],'Four 2s-4s':[80,400],'Four of a Kind':[50,250],'Straight Flush':[50,250],'Full House':[7,35],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]}, desc:'Super Double Bonus 7/5 is the short-pay casino floor version. The kicker bonus mechanics remain: Four Aces with 2/3/4 pays 400x, making kicker awareness essential to optimal play.' },
  { id:'aces-and-faces-85', name:'Aces and Faces 8/5', tpl:'af', pay:{'Royal Flush':[250,4000],'Four Aces':[80,400],'Straight Flush':[50,250],'Four Faces (J/Q/K)':[40,200],'Four of a Kind':[25,125],'Full House':[8,40],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Jacks or Better':[1,5]}, desc:'Aces and Faces 8/5 at 97.40% RTP features bonuses for two specific quad types: Four Aces (80x) and Four Face Cards — Jacks, Queens, or Kings (40x). This clean two-tier bonus system is easy to learn.' },
  { id:'aces-and-faces-75', name:'Aces and Faces 7/5', tpl:'af', pay:{'Royal Flush':[250,4000],'Four Aces':[80,400],'Straight Flush':[50,250],'Four Faces (J/Q/K)':[40,200],'Four of a Kind':[25,125],'Full House':[7,35],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Jacks or Better':[1,5]}, desc:'Aces and Faces 7/5 at 96.28% RTP is the short-pay version. Four Aces still pay 80x and Four Face Cards pay 40x, offering a simpler bonus structure than most bonus poker variants.' },
  { id:'aces-and-faces-76', name:'Aces and Faces 7/6', tpl:'af', pay:{'Royal Flush':[250,4000],'Four Aces':[80,400],'Straight Flush':[50,250],'Four Faces (J/Q/K)':[40,200],'Four of a Kind':[25,125],'Full House':[7,35],'Flush':[6,30],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Jacks or Better':[1,5]}, desc:'Aces and Faces 7/6 at 97.14% RTP is the balanced mid-range pay table. Enhanced Flush at 6x with the clean Aces/Faces bonus structure makes for an enjoyable playing experience.' },
  { id:'aces-and-eights-75', name:'Aces and Eights 7/5', tpl:'ae', pay:{'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four Aces':[80,400],'Four Eights':[80,400],'Four Sevens':[50,250],'Four of a Kind':[25,125],'Full House':[7,35],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Jacks or Better':[1,5]}, desc:'Aces and Eights 7/5 features unique quad bonuses: both Four Aces and Four Eights pay 80x (the "dead man\'s hand"), plus Four Sevens pay 50x. This three-tier bonus on specific ranks adds a thematic twist.' },
  { id:'aces-and-eights-86', name:'Aces and Eights 8/6', tpl:'ae', pay:{'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four Aces':[80,400],'Four Eights':[80,400],'Four Sevens':[50,250],'Four of a Kind':[25,125],'Full House':[8,40],'Flush':[6,30],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Jacks or Better':[1,5]}, desc:'Aces and Eights 8/6 at 98.14% RTP is the mid-range version. Four Aces and Four Eights both pay 80x, Four Sevens pay 50x, with solid Full House (8x) and Flush (6x) base payouts.' },
  { id:'white-hot-aces-85', name:'White Hot Aces 8/5', tpl:'wha', pay:{'Royal Flush':[250,4000],'Four Aces + 2/3/4':[800,4000],'Four 2/3/4 + A/2/3/4':[400,2000],'Four Aces':[400,2000],'Four 2s-4s':[80,400],'Four of a Kind':[50,250],'Straight Flush':[50,250],'Full House':[8,40],'Flush':[5,25],'Straight':[3,15],'Three of a Kind':[2,10],'Two Pair':[1,5],'Jacks or Better':[1,5]}, desc:'White Hot Aces 8/5 at 96.72% RTP features the most extreme Aces bonuses. Four Aces with a 2/3/4 kicker pays 800x — equal to a Royal Flush. Four Aces alone pay 400x. An ultra-high variance game.' },
  { id:'white-hot-aces-65', name:'White Hot Aces 6/5', tpl:'wha', pay:{'Royal Flush':[250,4000],'Four Aces + 2/3/4':[800,4000],'Four 2/3/4 + A/2/3/4':[400,2000],'Four Aces':[400,2000],'Four 2s-4s':[80,400],'Four of a Kind':[50,250],'Straight Flush':[50,250],'Full House':[6,30],'Flush':[5,25],'Straight':[3,15],'Three of a Kind':[2,10],'Two Pair':[1,5],'Jacks or Better':[1,5]}, desc:'White Hot Aces 6/5 is the short-pay version with reduced Full House (6x). The massive Aces kicker bonuses remain: 800x for Aces + low kicker, 400x for Aces alone. Extreme variance, extreme rewards.' },
  { id:'super-aces-bonus-85', name:'Super Aces Bonus 8/5', tpl:'sa', pay:{'Royal Flush':[250,4000],'Four Aces':[400,2000],'Straight Flush':[60,300],'Four 2s-4s':[80,400],'Four of a Kind':[50,250],'Full House':[8,40],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]}, desc:'Super Aces Bonus 8/5 features a massive 400x payout for Four Aces — the centerpiece of this high-variance game. Straight Flush is enhanced to 60x and Full House pays a solid 8x.' },
  { id:'super-aces-bonus-65', name:'Super Aces Bonus 6/5', tpl:'sa', pay:{'Royal Flush':[250,4000],'Four Aces':[400,2000],'Straight Flush':[60,300],'Four 2s-4s':[80,400],'Four of a Kind':[50,250],'Full House':[6,30],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]}, desc:'Super Aces Bonus 6/5 has the tighter pay table with reduced Full House at 6x, but the 400x Four Aces bonus and 60x Straight Flush remain, creating a volatile but exciting playing experience.' },
  { id:'all-american-poker-86', name:'All American Poker 8/6', tpl:'aa', pay:{'Royal Flush':[250,4000],'Straight Flush':[200,1000],'Four of a Kind':[40,200],'Full House':[8,40],'Flush':[6,30],'Straight':[6,30],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]}, desc:'All American Poker 8/6 features equalized Flush and Straight payouts at 6x each, with a massive 200x Straight Flush bonus. This unique pay structure makes straight and flush draws equally valuable.' },
  { id:'all-american-poker-66', name:'All American Poker 6/6', tpl:'aa', pay:{'Royal Flush':[250,4000],'Straight Flush':[200,1000],'Four of a Kind':[40,200],'Full House':[6,30],'Flush':[6,30],'Straight':[6,30],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]}, desc:'All American Poker 6/6 takes the equalized concept to the extreme: Full House, Flush, and Straight all pay 6x. With Straight Flush at 200x, this simplified pay structure makes for an easy-to-learn game.' },
  { id:'vegas-strip-deuces-wild', name:'Vegas Strip Deuces Wild', tpl:'dw', pay:{'Natural Royal Flush':[800,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[16,80],'Straight Flush':[10,50],'Four of a Kind':[4,20],'Full House':[4,20],'Flush':[3,15],'Straight':[1,5],'Three of a Kind':[1,5]}, desc:'Vegas Strip Deuces Wild is the version found along the famous Las Vegas Strip. Full House pays an enhanced 4x (same as Four of a Kind), making full house draws more valuable. All four 2s are wild.' },
  { id:'reno-deuces-wild', name:'Reno Deuces Wild', tpl:'dw', pay:{'Natural Royal Flush':[800,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[11,55],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[2,10],'Three of a Kind':[1,5]}, desc:'Reno Deuces Wild is the Nevada variant from the Biggest Little City in the World. Straight Flush is uniquely boosted to 11x, rewarding wild straight flush draws. All four deuces act as wild cards.' },
  { id:'atlantic-city-deuces-wild', name:'Atlantic City Deuces Wild', tpl:'dw', pay:{'Natural Royal Flush':[800,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[9,45],'Four of a Kind':[5,25],'Full House':[3,15],'Flush':[2,10],'Straight':[2,10],'Three of a Kind':[1,5]}, desc:'Atlantic City Deuces Wild is the New Jersey boardwalk variant featuring balanced payouts. Four of a Kind is enhanced to 5x while other hands remain standard. All four deuces act as wild cards.' },
  { id:'missouri-deuces-wild', name:'Missouri Deuces Wild', tpl:'dw', pay:{'Natural Royal Flush':[800,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[12,60],'Straight Flush':[9,45],'Four of a Kind':[4,20],'Full House':[4,20],'Flush':[3,15],'Straight':[2,10],'Three of a Kind':[1,5]}, desc:'Missouri Deuces Wild is the riverboat casino variant. Five of a Kind is reduced to 12x but Full House is enhanced to 4x. All four deuces act as wild cards in this Midwestern variant.' },
  { id:'bonus-deuces-wild-1343', name:'Bonus Deuces Wild 13/4/3', tpl:'bdw', pay:{'Natural Royal Flush':[250,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[13,65],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]}, desc:'Bonus Deuces Wild 13/4/3 at 99.45% RTP features an enhanced Straight Flush at 13x. The Bonus Deuces format starts Natural Royal at 250x (vs. 800x in standard DW). All four 2s are wild cards.' },
  { id:'bonus-deuces-wild-1043', name:'Bonus Deuces Wild 10/4/3', tpl:'bdw', pay:{'Natural Royal Flush':[250,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[10,50],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]}, desc:'Bonus Deuces Wild 10/4/3 at 98.80% RTP offers standard Straight Flush at 10x. The Natural Royal starts at 250x base, with Four Deuces paying 200x. All four 2s act as wild cards.' },
  { id:'bonus-deuces-wild-1243', name:'Bonus Deuces Wild 12/4/3', tpl:'bdw', pay:{'Natural Royal Flush':[250,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[12,60],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]}, desc:'Bonus Deuces Wild 12/4/3 at 99.15% RTP splits the difference with Straight Flush at 12x. A solid near-full-pay variant where all four deuces serve as wild cards.' },
  { id:'loose-deuces-wild-1510', name:'Loose Deuces 15/10', tpl:'ld', pay:{'Natural Royal Flush':[250,4000],'Four Deuces':[500,2500],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[10,50],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]}, desc:'Loose Deuces 15/10 at 99.93% RTP features the most generous Four Deuces payout: a massive 500x. This near-100% return rate makes it one of the best Deuces Wild variants for advantage players.' },
  { id:'loose-deuces-wild-128', name:'Loose Deuces 12/8', tpl:'ld', pay:{'Natural Royal Flush':[250,4000],'Four Deuces':[500,2500],'Wild Royal Flush':[25,125],'Five of a Kind':[12,60],'Straight Flush':[8,40],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]}, desc:'Loose Deuces 12/8 is the short-pay version with reduced Five of a Kind (12x) and Straight Flush (8x). The signature 500x Four Deuces payout remains, making deuce-hunting the primary strategy.' },
  { id:'double-deuces-wild-128', name:'Double Deuces Wild 12/8', tpl:'ddw', pay:{'Natural Royal Flush':[250,4000],'Four Deuces':[400,2000],'Wild Royal Flush':[25,125],'Five of a Kind':[12,60],'Straight Flush':[8,40],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]}, desc:'Double Deuces Wild 12/8 features Four Deuces paying 400x — double the standard 200x payout. Other hands are reduced to compensate: Five of a Kind at 12x and Straight Flush at 8x.' },
  { id:'double-deuces-wild-1510', name:'Double Deuces Wild 15/10', tpl:'ddw', pay:{'Natural Royal Flush':[250,4000],'Four Deuces':[400,2000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[10,50],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]}, desc:'Double Deuces Wild 15/10 is the balanced variant with Four Deuces at 400x, Five of a Kind at 15x, and Straight Flush at 10x. All four 2s act as wild cards in this enhanced-jackpot game.' },
  { id:'deuces-wild-bonus-1243', name:'Deuces Wild Bonus 12/4/3', tpl:'dwb', pay:{'Natural Royal Flush':[250,4000],'Four Deuces + Ace':[400,2000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[12,60],'Straight Flush':[8,40],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]}, desc:'Deuces Wild Bonus 12/4/3 adds a kicker bonus: Four Deuces with an Ace pays 400x vs. 200x for Four Deuces alone. This creates an interesting decision point when holding three or four deuces.' },
  { id:'deuces-wild-bonus-1643', name:'Deuces Wild Bonus 16/4/3', tpl:'dwb', pay:{'Natural Royal Flush':[250,4000],'Four Deuces + Ace':[400,2000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[16,80],'Straight Flush':[13,65],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]}, desc:'Deuces Wild Bonus 16/4/3 is the full-pay version with high Five of a Kind (16x) and Straight Flush (13x) payouts. The Ace kicker on Four Deuces (400x vs. 200x) adds strategic depth.' },
  { id:'deuces-wild-deluxe-1243', name:'Deuces Wild Deluxe 12/4/3', tpl:'dwd', pay:{'Natural Royal Flush':[250,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[12,60],'Straight Flush':[8,40],'Four of a Kind':[4,20],'Full House':[4,20],'Flush':[3,15],'Straight':[2,10],'Three of a Kind':[1,5]}, desc:'Deuces Wild Deluxe 12/4/3 features an enhanced Full House at 4x (vs. 3x in standard). The "Deluxe" branding signals slightly better mid-range payouts at the cost of reduced Straight Flush (8x).' },
  { id:'deuces-wild-deluxe-1643', name:'Deuces Wild Deluxe 16/4/3', tpl:'dwd', pay:{'Natural Royal Flush':[250,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[16,80],'Straight Flush':[12,60],'Four of a Kind':[4,20],'Full House':[4,20],'Flush':[3,15],'Straight':[2,10],'Three of a Kind':[1,5]}, desc:'Deuces Wild Deluxe 16/4/3 is the full-pay deluxe version with Five of a Kind at 16x, Straight Flush at 12x, and the enhanced Full House at 4x. All four 2s act as wild cards.' },
  { id:'joker-poker-75', name:'Joker Poker 7/5', tpl:'jp', pay:{'Natural Royal Flush':[250,4000],'Five of a Kind':[200,1000],'Wild Royal Flush':[100,500],'Straight Flush':[50,250],'Four of a Kind':[20,100],'Full House':[7,35],'Flush':[5,25],'Straight':[3,15],'Three of a Kind':[2,10],'Two Pair':[1,5],'Kings or Better':[1,5]}, desc:'Joker Poker 7/5 at 98.60% RTP uses a 53-card deck with one Joker as wild. The minimum winning hand is Kings or Better. Strategy changes dramatically depending on whether the Joker is in your hand.' },
  { id:'joker-poker-65', name:'Joker Poker 6/5', tpl:'jp', pay:{'Natural Royal Flush':[250,4000],'Five of a Kind':[200,1000],'Wild Royal Flush':[100,500],'Straight Flush':[50,250],'Four of a Kind':[20,100],'Full House':[6,30],'Flush':[5,25],'Straight':[3,15],'Three of a Kind':[2,10],'Two Pair':[1,5],'Kings or Better':[1,5]}, desc:'Joker Poker 6/5 at 97.19% RTP is the short-pay version with reduced Full House at 6x. The 53-card deck with one wild Joker still delivers exciting gameplay with Five of a Kind at 200x.' },
  { id:'joker-poker-85', name:'Joker Poker 8/5', tpl:'jp', pay:{'Natural Royal Flush':[250,4000],'Five of a Kind':[200,1000],'Wild Royal Flush':[100,500],'Straight Flush':[50,250],'Four of a Kind':[20,100],'Full House':[8,40],'Flush':[5,25],'Straight':[3,15],'Three of a Kind':[2,10],'Two Pair':[1,5],'Kings or Better':[1,5]}, desc:'Joker Poker 8/5 at 98.94% RTP features an enhanced Full House at 8x. The single Joker wild in a 53-card deck creates unique strategy where having or not having the Joker changes every decision.' },
  { id:'joker-poker-aces-75', name:'Joker Poker Aces 7/5', tpl:'jpa', pay:{'Natural Royal Flush':[250,4000],'Five of a Kind':[200,1000],'Wild Royal Flush':[100,500],'Straight Flush':[50,250],'Four of a Kind':[20,100],'Full House':[7,35],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[2,10],'Two Pair':[1,5],'Aces or Better':[1,5]}, desc:'Joker Poker Aces 7/5 combines the Joker wild card with an Aces-or-Better minimum hand. Only a pair of Aces qualifies for the minimum payout, making this a tighter but more rewarding variant.' },
  { id:'joker-poker-aces-65', name:'Joker Poker Aces 6/5', tpl:'jpa', pay:{'Natural Royal Flush':[250,4000],'Five of a Kind':[200,1000],'Wild Royal Flush':[100,500],'Straight Flush':[50,250],'Four of a Kind':[20,100],'Full House':[6,30],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[2,10],'Two Pair':[1,5],'Aces or Better':[1,5]}, desc:'Joker Poker Aces 6/5 is the tightest Aces-or-Better Joker variant. The higher minimum hand (Aces only) combined with reduced Full House (6x) creates a challenging game for experienced players.' },
  { id:'joker-poker-twopair-85', name:'Joker Poker Two Pair 8/5', tpl:'jpt', pay:{'Natural Royal Flush':[250,4000],'Five of a Kind':[100,500],'Wild Royal Flush':[50,250],'Straight Flush':[50,250],'Four of a Kind':[20,100],'Full House':[8,40],'Flush':[5,25],'Straight':[5,25],'Three of a Kind':[2,10],'Two Pair':[1,5]}, desc:'Joker Poker Two Pair 8/5 has no minimum pair — Two Pair is the lowest paying hand. The 53-card deck with one Joker wild means Three of a Kind is very common with the Joker, shifting strategy toward higher hands.' },
  { id:'joker-poker-twopair-75', name:'Joker Poker Two Pair 7/5', tpl:'jpt', pay:{'Natural Royal Flush':[250,4000],'Five of a Kind':[100,500],'Wild Royal Flush':[50,250],'Straight Flush':[50,250],'Four of a Kind':[20,100],'Full House':[7,35],'Flush':[5,25],'Straight':[5,25],'Three of a Kind':[2,10],'Two Pair':[1,5]}, desc:'Joker Poker Two Pair 7/5 is the short-pay version where Two Pair is the minimum win. No single pair pays, making the Joker even more critical for transforming weak hands into winners.' },
  { id:'double-joker-poker-75', name:'Double Joker Poker 7/5', tpl:'djp', pay:{'Natural Royal Flush':[250,4000],'Two Jokers':[100,500],'Wild Royal Flush':[50,250],'Five of a Kind':[50,250],'Straight Flush':[25,125],'Four of a Kind':[10,50],'Full House':[7,35],'Flush':[5,25],'Straight':[3,15],'Three of a Kind':[2,10],'Two Pair':[1,5],'Kings or Better':[1,5]}, desc:'Double Joker Poker 7/5 uses a 54-card deck with two Jokers as wild cards. Having both Jokers is an automatic 100x win. The extra wild card creates more frequent winning hands and unique dual-Joker strategy.' },
  { id:'double-joker-poker-55', name:'Double Joker Poker 5/5', tpl:'djp', pay:{'Natural Royal Flush':[250,4000],'Two Jokers':[100,500],'Wild Royal Flush':[50,250],'Five of a Kind':[50,250],'Straight Flush':[25,125],'Four of a Kind':[10,50],'Full House':[5,25],'Flush':[5,25],'Straight':[3,15],'Three of a Kind':[2,10],'Two Pair':[1,5],'Kings or Better':[1,5]}, desc:'Double Joker Poker 5/5 is the short-pay two-Joker variant with Full House reduced to 5x. The 54-card deck with two wild Jokers still provides high hit frequency and the exciting 100x Two Jokers bonus.' },
  { id:'deuces-and-joker-wild-85', name:'Deuces and Joker Wild 8/5', tpl:'djw', pay:{'Natural Royal Flush':[250,4000],'Five Wilds':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[8,40],'Four of a Kind':[3,15],'Full House':[3,15],'Flush':[3,15],'Straight':[2,10],'Three of a Kind':[1,5]}, desc:'Deuces and Joker Wild 8/5 features five wild cards: all four deuces plus one Joker in a 53-card deck. With 5 wilds out of 53 cards, nearly 40% of dealt hands contain at least one wild, making Three of a Kind extremely common.' },
  { id:'deuces-and-joker-wild-65', name:'Deuces and Joker Wild 6/5', tpl:'djw', pay:{'Natural Royal Flush':[250,4000],'Five Wilds':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[6,30],'Four of a Kind':[3,15],'Full House':[3,15],'Flush':[3,15],'Straight':[2,10],'Three of a Kind':[1,5]}, desc:'Deuces and Joker Wild 6/5 is the tighter version of the 5-wild-card game. Straight Flush drops to 6x, but with 5 wild cards in a 53-card deck, winning hands remain very frequent.' },
  { id:'sevens-wild-2515', name:'Sevens Wild 25/15', tpl:'rw', wildRank:'7', fourWildsName:'Four Sevens', pay:{'Natural Royal Flush':[250,4000],'Four Sevens':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[12,60],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]}, desc:'Sevens Wild 25/15 is the full-pay version with Straight Flush at 12x. All four 7s are wild, removing a key mid-range card from natural straights and creating distinctive strategy considerations.' },
  { id:'sevens-wild-2010', name:'Sevens Wild 20/10', tpl:'rw', wildRank:'7', fourWildsName:'Four Sevens', pay:{'Natural Royal Flush':[250,4000],'Four Sevens':[200,1000],'Wild Royal Flush':[20,100],'Five of a Kind':[10,50],'Straight Flush':[8,40],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]}, desc:'Sevens Wild 20/10 is the short-pay version with reduced Wild Royal (20x) and Five of a Kind (10x). All four 7s act as wild cards in this rank-specific wild variant.' },
  { id:'tens-or-better-75', name:'Tens or Better 7/5', tpl:'tob', pay:{'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[25,125],'Full House':[7,35],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Tens or Better':[1,5]}, desc:'Tens or Better 7/5 is the short-pay version where any pair of 10s or higher wins. The lower minimum hand creates more frequent wins, making this an excellent choice for extended play sessions.' },
  { id:'nines-or-better-75', name:'Nines or Better 7/5', tpl:'nob', pay:{'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[25,125],'Full House':[7,35],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Nines or Better':[1,5]}, desc:'Nines or Better 7/5 is the short-pay version where any pair of 9s or higher wins. The very low minimum hand means most pairs you are dealt will qualify as winners.' },
  { id:'kings-or-better-75', name:'Kings or Better 7/5', tpl:'kob', pay:{'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[25,125],'Full House':[7,35],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Kings or Better':[1,5]}, desc:'Kings or Better 7/5 is the short-pay version where only Kings or Aces qualify as minimum pairs. This hard variant dramatically reduces the frequency of minimum-pair wins, boosting higher hand payouts.' },
  { id:'bonus-poker-deluxe-96', name:'Bonus Poker Deluxe 9/6', tpl:'bpd', pay:{'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[80,400],'Full House':[9,45],'Flush':[6,30],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]}, desc:'Bonus Poker Deluxe 9/6 at 99.64% RTP is the full-pay version — one of the best-returning bonus games. All Four of a Kind hands pay a uniform 80x with solid Full House (9x) and Flush (6x) base payouts.' },
  { id:'double-double-bonus-106', name:'Double Double Bonus 10/6', tpl:'ddb', pay:{'Royal Flush':[250,4000],'Four Aces + 2/3/4':[400,2000],'Four 2/3/4 + A/2/3/4':[160,800],'Four Aces':[160,800],'Four 2s-4s':[80,400],'Four of a Kind':[50,250],'Straight Flush':[50,250],'Full House':[10,50],'Flush':[6,30],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]}, desc:'Double Double Bonus 10/6 at 100.07% RTP is the holy grail of video poker — a player-favorable game where perfect strategy yields a positive expected return. Full House at 10x with the full kicker bonus system.' },
  { id:'triple-double-bonus-95', name:'Triple Double Bonus 9/5', tpl:'tdb', pay:{'Royal Flush':[250,4000],'Four Aces + 2/3/4':[800,4000],'Four 2/3/4 + A/2/3/4':[400,2000],'Four Aces':[400,2000],'Four 2s-4s':[160,800],'Four of a Kind':[50,250],'Straight Flush':[50,250],'Full House':[9,45],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[2,10],'Two Pair':[1,5],'Jacks or Better':[1,5]}, desc:'Triple Double Bonus 9/5 at 97.02% RTP trades Flush payout (5x) for a strong Full House (9x). The massive 800x Four Aces kicker and 400x low-card kicker bonuses deliver extreme variance.' },
  { id:'double-bonus-106', name:'Double Bonus 10/6', tpl:'db', pay:{'Royal Flush':[250,4000],'Four Aces':[160,800],'Four 2s-4s':[80,400],'Straight Flush':[50,250],'Four of a Kind':[50,250],'Full House':[10,50],'Flush':[6,30],'Straight':[5,25],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]}, desc:'Double Bonus 10/6 at 99.61% RTP is the near-full-pay version. Full House at 10x and Flush at 6x provide solid base returns while Four Aces (160x) and Four 2s-4s (80x) deliver big bonus wins.' },
];

// ─── Category detection ────────────────────────────────────────────

function getCategory(tpl) {
  if (['job','tob','nob','kob'].includes(tpl)) return 'standard';
  if (['bp','db','ddb','tb','tdb','bpd','sdb','af','ae','wha','sa'].includes(tpl)) return 'bonus';
  if (tpl === 'aa') return 'allamerican';
  if (['dw','bdw','ld','ddw','dwb','dwd'].includes(tpl)) return 'deuces';
  if (['jp','jpa','jpt'].includes(tpl)) return 'joker';
  if (tpl === 'djp') return 'doublejoker';
  if (tpl === 'djw') return 'deucesjoker';
  if (tpl === 'rw') return 'rankwild';
  return 'standard';
}

// ─── Probability tables by category ────────────────────────────────

function getProbabilityTable(game, category) {
  const hands = Object.keys(game.pay);
  const b1 = Object.values(game.pay).map(v => v[0]);

  if (category === 'standard') {
    const minHand = hands[hands.length - 1];
    const rows = [];
    // Standard frequencies based on JoB analysis
    const stdFreq = {
      'Royal Flush': ['1 in 40,391', '0.0025%'],
      'Straight Flush': ['1 in 9,148', '0.011%'],
      'Four of a Kind': ['1 in 423', '0.24%'],
      'Full House': ['1 in 87', '1.15%'],
      'Flush': ['1 in 91', '1.10%'],
      'Straight': ['1 in 89', '1.12%'],
      'Three of a Kind': ['1 in 14', '7.44%'],
      'Two Pair': ['1 in 8', '12.9%'],
    };
    for (const hand of hands) {
      if (stdFreq[hand]) {
        rows.push(`    <tr><td>${hand}</td><td>${stdFreq[hand][0]}</td><td>${stdFreq[hand][1]}</td></tr>`);
      } else if (hand === minHand) {
        // Varies by minimum pair
        if (minHand.includes('Two Pair')) {
          rows.push(`    <tr><td>${hand}</td><td>1 in 8</td><td>12.9%</td></tr>`);
        } else if (minHand.includes('Aces')) {
          rows.push(`    <tr><td>${hand}</td><td>1 in 13</td><td>7.7%</td></tr>`);
        } else if (minHand.includes('Kings')) {
          rows.push(`    <tr><td>${hand}</td><td>1 in 8</td><td>12.3%</td></tr>`);
        } else if (minHand.includes('Queens')) {
          rows.push(`    <tr><td>${hand}</td><td>1 in 6</td><td>16.8%</td></tr>`);
        } else if (minHand.includes('Tens') || minHand.includes('Nines') || minHand.includes('Eights') || minHand.includes('Sixes')) {
          rows.push(`    <tr><td>${hand}</td><td>1 in 4</td><td>28.5%</td></tr>`);
        } else {
          rows.push(`    <tr><td>${hand}</td><td>1 in 5</td><td>21.5%</td></tr>`);
        }
      }
    }
    rows.push('    <tr><td>No Win</td><td>—</td><td>~55%</td></tr>');
    return `  <table>\n    <tr><th>Hand</th><th>Frequency</th><th>Probability</th></tr>\n${rows.join('\n')}\n  </table>`;
  }

  if (category === 'bonus') {
    const rows = [];
    const bonusFreq = {
      'Royal Flush': ['1 in 40,391', '0.0025%'],
      'Four Aces + 2/3/4': ['1 in 136,189', '0.0007%'],
      'Four 2/3/4 + A/2/3/4': ['1 in 54,601', '0.0018%'],
      'Four Aces': ['1 in 5,761', '0.017%'],
      'Four 2s-4s': ['1 in 1,905', '0.052%'],
      'Four 5s-Ks': ['1 in 622', '0.16%'],
      'Four Faces (J/Q/K)': ['1 in 1,905', '0.052%'],
      'Four Eights': ['1 in 5,761', '0.017%'],
      'Four Sevens': ['1 in 5,761', '0.017%'],
      'Straight Flush': ['1 in 9,148', '0.011%'],
      'Four of a Kind': ['1 in 423', '0.24%'],
      'Full House': ['1 in 87', '1.15%'],
      'Flush': ['1 in 91', '1.10%'],
      'Straight': ['1 in 89', '1.12%'],
      'Three of a Kind': ['1 in 14', '7.44%'],
      'Two Pair': ['1 in 8', '12.9%'],
      'Jacks or Better': ['1 in 5', '21.5%'],
    };
    for (const hand of hands) {
      if (bonusFreq[hand]) {
        rows.push(`    <tr><td>${hand}</td><td>${b1[hands.indexOf(hand)]}×</td><td>${bonusFreq[hand][0]}</td></tr>`);
      }
    }
    return `  <table>\n    <tr><th>Hand</th><th>Payout (BET 1)</th><th>Frequency</th></tr>\n${rows.join('\n')}\n  </table>`;
  }

  if (category === 'deuces' || category === 'rankwild') {
    const rows = [];
    const dwFreq = {
      'Natural Royal Flush': '1 in ~45,000',
      'Four Deuces': '1 in ~4,900',
      'Four Threes': '1 in ~4,900',
      'Four Fours': '1 in ~4,900',
      'Four Fives': '1 in ~4,900',
      'Four Sevens': '1 in ~4,900',
      'Four Eights': '1 in ~4,900',
      'Four Tens': '1 in ~4,900',
      'Five Wilds': '1 in ~130,000',
      'Wild Royal Flush': '1 in ~600',
      'Five of a Kind': '1 in ~300',
      'Straight Flush': '1 in ~90',
      'Four of a Kind': '1 in ~15',
      'Full House': '1 in ~40',
      'Flush': '1 in ~60',
      'Straight': '1 in ~18',
      'Three of a Kind': '1 in ~3',
      'Four Deuces + Ace': '1 in ~24,000',
    };
    for (const hand of hands) {
      const freq = dwFreq[hand] || '1 in ~100';
      rows.push(`    <tr><td>${hand}</td><td>${b1[hands.indexOf(hand)]}×</td><td>${freq}</td></tr>`);
    }
    return `  <table>\n    <tr><th>Hand</th><th>Payout (BET 1)</th><th>Frequency</th></tr>\n${rows.join('\n')}\n  </table>`;
  }

  if (category === 'joker' || category === 'doublejoker') {
    const rows = [];
    const jkFreq = category === 'doublejoker' ? {
      'Natural Royal Flush': '1 in ~41,000',
      'Two Jokers': '1 in ~1,400',
      'Wild Royal Flush': '1 in ~5,000',
      'Five of a Kind': '1 in ~5,500',
      'Straight Flush': '1 in ~1,200',
      'Four of a Kind': '1 in ~85',
      'Full House': '1 in ~50',
      'Flush': '1 in ~55',
      'Straight': '1 in ~35',
      'Three of a Kind': '1 in ~6',
      'Two Pair': '1 in ~8',
      'Kings or Better': '1 in ~5',
    } : {
      'Natural Royal Flush': '1 in ~41,000',
      'Five of a Kind': '1 in ~10,800',
      'Wild Royal Flush': '1 in ~9,500',
      'Straight Flush': '1 in ~1,800',
      'Four of a Kind': '1 in ~120',
      'Full House': '1 in ~65',
      'Flush': '1 in ~65',
      'Straight': '1 in ~50',
      'Three of a Kind': '1 in ~8',
      'Two Pair': '1 in ~10',
      'Kings or Better': '1 in ~5',
      'Aces or Better': '1 in ~8',
    };
    for (const hand of hands) {
      const freq = jkFreq[hand] || '1 in ~100';
      rows.push(`    <tr><td>${hand}</td><td>${b1[hands.indexOf(hand)]}×</td><td>${freq}</td></tr>`);
    }
    return `  <table>\n    <tr><th>Hand</th><th>Payout (BET 1)</th><th>Frequency</th></tr>\n${rows.join('\n')}\n  </table>`;
  }

  if (category === 'deucesjoker') {
    const rows = [];
    const freq = {
      'Natural Royal Flush': '1 in ~48,000',
      'Five Wilds': '1 in ~130,000',
      'Wild Royal Flush': '1 in ~450',
      'Five of a Kind': '1 in ~180',
      'Straight Flush': '1 in ~60',
      'Four of a Kind': '1 in ~10',
      'Full House': '1 in ~30',
      'Flush': '1 in ~45',
      'Straight': '1 in ~14',
      'Three of a Kind': '1 in ~2.5',
    };
    for (const hand of hands) {
      const f = freq[hand] || '1 in ~50';
      rows.push(`    <tr><td>${hand}</td><td>${b1[hands.indexOf(hand)]}×</td><td>${f}</td></tr>`);
    }
    return `  <table>\n    <tr><th>Hand</th><th>Payout (BET 1)</th><th>Frequency</th></tr>\n${rows.join('\n')}\n  </table>`;
  }

  if (category === 'allamerican') {
    const rows = [];
    const freq = {
      'Royal Flush': ['1 in 40,391', '0.0025%'],
      'Straight Flush': ['1 in 9,148', '0.011%'],
      'Four of a Kind': ['1 in 423', '0.24%'],
      'Full House': ['1 in 87', '1.15%'],
      'Flush': ['1 in 91', '1.10%'],
      'Straight': ['1 in 89', '1.12%'],
      'Three of a Kind': ['1 in 14', '7.44%'],
      'Two Pair': ['1 in 8', '12.9%'],
      'Jacks or Better': ['1 in 5', '21.5%'],
    };
    for (const hand of hands) {
      if (freq[hand]) {
        rows.push(`    <tr><td>${hand}</td><td>${b1[hands.indexOf(hand)]}×</td><td>${freq[hand][0]}</td></tr>`);
      }
    }
    return `  <table>\n    <tr><th>Hand</th><th>Payout (BET 1)</th><th>Frequency</th></tr>\n${rows.join('\n')}\n  </table>`;
  }

  return '';
}

// ─── Strategy content by category ──────────────────────────────────

function getBasicStrategy(game, category, tpl) {
  if (category === 'standard') {
    const minHand = Object.keys(game.pay).pop();
    return `  <p><strong>Always hold</strong>: Any made hand (${minHand}+, two pair, three of a kind, straight, flush, full house, four of a kind). Never break a winning hand unless chasing a Royal Flush with 4 cards to a Royal.</p>
  <p><strong>Drawing priority</strong> (highest to lowest):</p>
  <p>1. Four of a kind, straight flush, royal flush — hold all 5</p>
  <p>2. Four cards to a royal flush (discard even a paying pair)</p>
  <p>3. Three of a kind, straight, flush, full house — hold made hand</p>
  <p>4. Four cards to a straight flush</p>
  <p>5. Two pair — hold both pairs, draw one card</p>
  <p>6. High pair (${minHand} qualifying cards) — hold the pair</p>
  <p>7. Three cards to a royal flush</p>
  <p>8. Four cards to a flush</p>
  <p>9. Low pair (non-qualifying) — hold the pair, draw three</p>
  <p>10. Four cards to an outside straight (open-ended)</p>`;
  }

  if (category === 'bonus') {
    const hasKicker = ['ddb','tdb','sdb','wha'].includes(tpl);
    const hasAces = Object.keys(game.pay).some(h => h.includes('Four Aces'));
    let strategy = `  <p><strong>Quad hunting is key</strong>: Enhanced Four of a Kind payouts change the strategy. When holding three of a kind, always draw two cards — the chance of hitting quads is worth more than keeping a kicker.</p>
  <p><strong>Drawing priority</strong> (highest to lowest):</p>
  <p>1. Royal Flush, Straight Flush, Four of a Kind — hold all winning cards</p>
  <p>2. Four cards to a Royal Flush — break any hand except a made straight flush or quads</p>
  <p>3. Three of a Kind — always draw two cards to maximize quad chances</p>
  <p>4. Full House, Flush, Straight — hold the made hand</p>
  <p>5. Four cards to a straight flush</p>`;

    if (hasAces) {
      strategy += `\n  <p>6. Pair of Aces — more valuable than other high pairs due to bonus quad payout</p>`;
    }
    if (hasKicker) {
      strategy += `\n  <p>7. <strong>Kicker awareness</strong>: With Three Aces, keep a 2, 3, or 4 kicker if you have one — the kicker bonus is worth holding</p>`;
    }
    strategy += `\n  <p>8. Two Pair — note that Two Pair often pays only 1× in bonus games, so don't overvalue it</p>
  <p>9. High pair (Jacks+) — hold the pair, draw three</p>
  <p>10. Low pair — hold and draw, hoping for trips or quads</p>`;
    return strategy;
  }

  if (category === 'allamerican') {
    return `  <p><strong>Equal-pay advantage</strong>: Since Flush and Straight pay the same (both 6×), straight draws and flush draws have equal value. This simplifies many common decisions.</p>
  <p><strong>Drawing priority</strong> (highest to lowest):</p>
  <p>1. Royal Flush, Straight Flush (200×!) — always hold</p>
  <p>2. Four cards to a Royal Flush — break any hand except straight flush</p>
  <p>3. Four of a Kind — hold all four</p>
  <p>4. Full House, Flush, Straight — hold the made hand (all pay similarly)</p>
  <p>5. Four cards to a straight flush — very valuable with the 200× payout</p>
  <p>6. Three of a Kind — draw two cards</p>
  <p>7. Two Pair — draw one (note: Two Pair only pays 1×)</p>
  <p>8. Four cards to a flush OR four cards to an outside straight — equally valuable</p>
  <p>9. High pair (Jacks+) — hold and draw three</p>
  <p>10. Three cards to a Royal Flush — worth holding over a low pair</p>`;
  }

  if (category === 'deuces' || category === 'rankwild') {
    const wildName = category === 'rankwild' ? (game.wildRank + 's') : 'deuces';
    const WildName = category === 'rankwild' ? (game.wildRank + 's') : 'Deuces';
    return `  <p><strong>Always hold ${wildName}</strong>: Never discard a wild card under any circumstances. Wild cards are the most valuable cards in the deck.</p>
  <p><strong>No-wild hands</strong>: With no wild cards, hold any paying hand (Three of a Kind or better), or draw to 4-card Royal Flush, Straight Flush, or Flush.</p>
  <p><strong>One wild card</strong>: Look for 4-card Royal Flush draws first, then keep made hands (full house, straight, flush, three of a kind). With one wild, Three of a Kind is your baseline.</p>
  <p><strong>Two wild cards</strong>: You already have a strong hand. Draw to Royal Flush, Five of a Kind, or Straight Flush. Otherwise discard non-wild cards and draw.</p>
  <p><strong>Three wild cards</strong>: Only hold a natural Royal or Five of a Kind alongside. Otherwise discard the 2 non-wild cards.</p>
  <p><strong>Four ${wildName}</strong>: You've already won the ${WildName} jackpot. Hold all four, draw one card.</p>`;
  }

  if (category === 'joker') {
    const minHand = Object.keys(game.pay).pop();
    return `  <p><strong>Always hold the Joker</strong>: Never discard the Joker under any circumstances. It is the most valuable card in the 53-card deck.</p>
  <p><strong>With Joker</strong>: Look for 4-card Royal Flush draws first, then made hands (straight flush, four of a kind, full house). With the Joker, you are guaranteed at least a pair — aim for Three of a Kind or better.</p>
  <p><strong>Without Joker</strong>: Play similar to standard draw poker but with ${minHand} as the minimum qualifying pair. Hold any paying hand or strong draw.</p>
  <p><strong>Two Pair caution</strong>: Two Pair pays the same as the minimum pair (1×). Don't chase Two Pair over better draws — prioritize straight and flush draws instead.</p>`;
  }

  if (category === 'doublejoker') {
    return `  <p><strong>Always hold Jokers</strong>: Never discard either Joker. Having both Jokers is an automatic 100× win — the "Two Jokers" bonus.</p>
  <p><strong>With one Joker</strong>: Look for 4-card Royal Flush draws first, then made hands. With one Joker, you are guaranteed at least a pair. Aim for Three of a Kind or better.</p>
  <p><strong>With two Jokers</strong>: You already have the 100× Two Jokers bonus locked in. Only hold additional cards if you have 3+ cards to a Wild Royal Flush or Five of a Kind.</p>
  <p><strong>Without Jokers</strong>: Play standard Kings or Better strategy. Hold paying hands and strong draws. The 54-card deck slightly reduces hand frequencies compared to 52-card games.</p>`;
  }

  if (category === 'deucesjoker') {
    return `  <p><strong>Always hold wild cards</strong>: Never discard a deuce (2) or the Joker. These five wild cards are the most valuable cards in the deck.</p>
  <p><strong>No wilds</strong>: With no wild cards, hold any paying hand (Three of a Kind or better). Also hold 4-card Royal Flush, Straight Flush, or Flush draws.</p>
  <p><strong>One wild</strong>: You have at least a pair. Look for 4-card Royal or Straight Flush draws, then hold made hands.</p>
  <p><strong>Two+ wilds</strong>: Extremely strong position. Draw to Five of a Kind, Royal Flush, or Straight Flush. With 3+ wilds, hold only wilds and draw for top hands.</p>
  <p><strong>Five Wilds</strong>: Hitting all five wilds (four deuces + Joker) is the ultimate jackpot at 200×. Incredibly rare at ~1 in 130,000 hands.</p>`;
  }

  return '';
}

function getAdvancedStrategy(game, category, tpl) {
  if (category === 'standard') {
    const topPay = Object.values(game.pay)[0][1];
    return `  <p><strong>The Royal Flush jackpot</strong>: With BET 5, a Royal Flush pays ${topPay} credits vs. ${Object.values(game.pay)[0][0] * 5} at proportional rate. This jackpot bonus increases the RTP by ~2%, making max bet essential.</p>
  <p><strong>Never hold a kicker</strong>: When holding a pair, always discard the remaining 3 cards — holding an "ace kicker" with a pair reduces your expected value.</p>
  <p><strong>Inside vs. outside straights</strong>: Prefer open-ended straight draws (e.g., 5-6-7-8) over gutshot straights (e.g., 5-6-8-9). Open-ended straights have twice the outs (8 vs. 4).</p>
  <p><strong>Suited high cards</strong>: Three suited high cards (e.g., A♠ K♠ Q♠) are worth holding over an unsuited high pair — the Royal Flush premium justifies the risk.</p>
  <p><strong>Expected Value (EV)</strong>: Holding a low pair (EV: ~0.82) beats holding two unsuited high cards (EV: ~0.49). When in doubt, the pair wins.</p>`;
  }

  if (category === 'bonus') {
    const hasKicker = ['ddb','tdb','sdb','wha'].includes(tpl);
    let adv = `  <p><strong>Max bet is critical</strong>: The Royal Flush jackpot bonus at BET 5 significantly increases RTP. Never play bonus poker without max bet.</p>
  <p><strong>Two Pair trap</strong>: In most bonus variants, Two Pair only pays 1× (same as minimum pair). This means breaking Two Pair for a better draw is sometimes correct — especially with three to a Royal Flush.</p>
  <p><strong>Three of a Kind decisions</strong>: Always draw two cards to Three of a Kind. The quad bonus makes drawing for Four of a Kind more valuable than holding a full house draw with a kicker.</p>`;

    if (hasKicker) {
      adv += `\n  <p><strong>Kicker strategy</strong>: With Three Aces, hold a 2, 3, or 4 kicker if present. The kicker bonus (often 400×+) makes this fifth card extremely valuable. With Three 2s-4s, hold an Ace or matching rank kicker.</p>`;
    }

    adv += `\n  <p><strong>Aces are premium</strong>: Pairs of Aces are significantly more valuable than other high pairs due to the enhanced Four Aces bonus. Hold a pair of Aces over a 4-card flush draw.</p>`;

    const acesPay = game.pay['Four Aces'];
    if (acesPay && acesPay[0] >= 200) {
      adv += `\n  <p><strong>Variance management</strong>: With Four Aces paying ${acesPay[0]}×, this is a high-variance game. Expect longer losing streaks between big wins. Proper bankroll management (200+ bets minimum) is essential.</p>`;
    }

    return adv;
  }

  if (category === 'allamerican') {
    return `  <p><strong>Straight Flush priority</strong>: With Straight Flush paying 200× (8x higher than standard), 3-card straight flush draws become very valuable — hold them over single high cards.</p>
  <p><strong>Equal draw value</strong>: Since Flush and Straight both pay 6×, a 4-card open-ended straight draw is nearly as good as a 4-card flush draw. Don't automatically prefer flushes.</p>
  <p><strong>Two Pair is weak</strong>: At only 1×, Two Pair is the weakest win. Break Two Pair if you have 4 cards to a straight or flush — the 6× payout on either makes this a positive EV play.</p>
  <p><strong>Three-card Royal draws</strong>: Three suited high cards are extremely valuable here, as both the Royal Flush (250×) and Straight Flush (200×) are premium payouts.</p>
  <p><strong>Full House strategy</strong>: Full House pays the same as Flush and Straight. Don't hold a kicker with Three of a Kind — draw two cards for the quad chance (40×).</p>`;
  }

  if (category === 'deuces' || category === 'rankwild') {
    const wildName = category === 'rankwild' ? (game.wildRank + 's') : 'deuces';
    const natRoyal = game.pay['Natural Royal Flush'];
    return `  <p><strong>Natural Royal priority</strong>: With 4 cards to a Natural Royal Flush (no wilds), always break any made hand to draw — the ${natRoyal[0]}× payout justifies it completely.</p>
  <p><strong>Wild card counting</strong>: The more wild cards in your hand, the more aggressively you should draw. With 2+ wilds, you can make almost any hand with just 2-3 draws.</p>
  <p><strong>Straight Flush draws</strong>: With one wild and 3 cards to a Straight Flush, drawing 2 cards is often correct — Five of a Kind and Straight Flush are both achievable.</p>
  <p><strong>No low pairs</strong>: Without wild cards, low pairs are weaker than flush or straight draws. Unlike standard poker, there is no "low pair" win in wild card games.</p>
  <p><strong>Bankroll expectations</strong>: Expect to hit Four ${wildName} approximately once every 5,000 hands. Track your sessions and manage your bankroll for the long run.</p>`;
  }

  if (category === 'joker') {
    return `  <p><strong>Natural Royal priority</strong>: With 4 cards to a Natural Royal Flush, always break any made hand to draw — the premium payout justifies the risk.</p>
  <p><strong>Joker frequency</strong>: The Joker appears in roughly 9.4% of dealt hands (1 in ~10.6). Strategy changes dramatically when the Joker is present vs. absent.</p>
  <p><strong>With Joker strategy</strong>: When you have the Joker, you already have at minimum a pair. Focus on improving to Three of a Kind or better rather than chasing flushes/straights.</p>
  <p><strong>Flush draws</strong>: A 4-card flush draw (without Joker) is worth holding — the Flush payout makes it a positive expected value play.</p>
  <p><strong>Low pairs don't pay</strong>: Pairs below the minimum qualifying rank don't pay. Only hold them if you have Three of a Kind or a strong draw alongside.</p>`;
  }

  if (category === 'doublejoker') {
    return `  <p><strong>Two Jokers jackpot</strong>: Being dealt both Jokers is an automatic 100× win. This happens roughly once every 1,400 hands — a unique feature of Double Joker Poker.</p>
  <p><strong>54-card deck effect</strong>: The extra 2 cards reduce the probability of natural hands by about 4% compared to 52-card games. Adjust expectations for flush and straight frequencies accordingly.</p>
  <p><strong>Single Joker play</strong>: With one Joker, you guaranteed a pair minimum. Prioritize 4-card Royal draws, then Straight Flush draws, then Three of a Kind or better.</p>
  <p><strong>Natural Royal rarity</strong>: Natural Royals are slightly rarer in a 54-card deck. Four cards to a Natural Royal is still the highest-priority draw.</p>
  <p><strong>Bankroll planning</strong>: Double Joker Poker has moderate variance. Budget for 150-200 bets per session for optimal play.</p>`;
  }

  if (category === 'deucesjoker') {
    return `  <p><strong>Five wild cards</strong>: With 5 wilds in a 53-card deck (~9.4%), expect at least one wild card in about 40% of dealt hands. This makes Three of a Kind extremely common.</p>
  <p><strong>Natural Royal is rare</strong>: With 5 cards removed from natural play, Natural Royal Flush is approximately 1 in 48,000 hands. The premium payout reflects this rarity.</p>
  <p><strong>Aggressive drawing</strong>: With 2+ wilds, draw aggressively for Five of a Kind and Straight Flush. The high wild card count makes these hands much more achievable.</p>
  <p><strong>Five Wilds</strong>: Holding all five wild cards (four deuces + Joker) pays 200×. This is the signature hand at roughly 1 in 130,000 — the ultimate jackpot.</p>
  <p><strong>Minimum hand shift</strong>: Three of a Kind is so common (~1 in 2.5 hands) that it only pays 1×. Your real target is Four of a Kind and above.</p>`;
  }

  return '';
}

// ─── RTP analysis intro ────────────────────────────────────────────

function getRTPIntro(game, category) {
  // Extract RTP from desc if available
  const rtpMatch = game.desc.match(/([\d.]+)% RTP/);
  const rtp = rtpMatch ? rtpMatch[1] + '% RTP' : null;

  if (category === 'standard') {
    const minHand = Object.keys(game.pay).pop();
    const fhPay = game.pay['Full House'] ? game.pay['Full House'][0] : '?';
    const flPay = game.pay['Flush'] ? game.pay['Flush'][0] : '?';
    return `  <p>This ${fhPay}/${flPay} pay table (Full House ${fhPay}×, Flush ${flPay}×)${rtp ? ` returns <strong>${rtp}</strong> with perfect strategy` : ' offers competitive returns with perfect strategy'} — making it one of the more accessible casino games. Key hand probabilities for a standard 52-card deck:</p>`;
  }

  if (category === 'bonus') {
    return `  <p>${rtp ? `This variant returns <strong>${rtp}</strong> with optimal play. ` : ''}The enhanced Four of a Kind payouts shift the variance higher than standard Jacks or Better. Key hand frequencies:</p>`;
  }

  if (category === 'allamerican') {
    return `  <p>${rtp ? `Returns <strong>${rtp}</strong> with optimal play. ` : ''}The equal-pay structure for Flush, Straight, and Full House simplifies probability analysis. Standard 52-card deck frequencies:</p>`;
  }

  if (category === 'deuces' || category === 'rankwild') {
    const wildName = category === 'rankwild' ? (game.wildRank + 's') : 'deuces';
    return `  <p>${rtp ? `Returns <strong>${rtp}</strong> with optimal play. ` : ''}With four wild ${wildName} in the deck (~7.7% of cards), hands occur far more frequently than in standard poker. Strategy must account for wild card probability:</p>`;
  }

  if (category === 'joker') {
    return `  <p>${rtp ? `Returns <strong>${rtp}</strong> with optimal play. ` : ''}With one Joker in a 53-card deck, the wild card appears in roughly 9.4% of dealt hands. Strategy changes dramatically depending on Joker presence:</p>`;
  }

  if (category === 'doublejoker') {
    return `  <p>${rtp ? `Returns <strong>${rtp}</strong> with optimal play. ` : ''}With two Jokers in a 54-card deck, at least one wild card appears in roughly 18% of dealt hands. The dual-Joker mechanic creates unique probability distributions:</p>`;
  }

  if (category === 'deucesjoker') {
    return `  <p>${rtp ? `Returns <strong>${rtp}</strong> with optimal play. ` : ''}With five wild cards (four deuces + one Joker) in a 53-card deck, roughly 40% of dealt hands contain at least one wild. Hands occur at dramatically higher frequencies:</p>`;
  }

  return `  <p>${rtp ? `Returns <strong>${rtp}</strong> with optimal play. ` : ''}Key hand probabilities:</p>`;
}

// ─── Rules section ─────────────────────────────────────────────────

function getRules(game, category, tpl) {
  const minHand = Object.keys(game.pay).pop();
  const topHand = Object.keys(game.pay)[0];
  const topPay = Object.values(game.pay)[0];

  if (category === 'standard') {
    return `  <h2>Basic Rules — How to Play</h2>
  <p>1. <strong>Place your bet</strong>: Choose BET 1 through BET 5. Always play BET 5 (max bet) — it unlocks the ${topPay[1]}-credit Royal Flush jackpot instead of the standard ${topPay[0] * 5}.</p>
  <p>2. <strong>Receive 5 cards</strong>: You're dealt 5 cards from a standard 52-card deck.</p>
  <p>3. <strong>Select cards to HOLD</strong>: Click the cards you want to keep. The goal is to build the strongest possible poker hand.</p>
  <p>4. <strong>Press DRAW</strong>: Discarded cards are replaced from the remaining deck. Your final hand is evaluated against the payout table.</p>
  <p>5. <strong>Minimum winning hand</strong>: ${minHand} pays 1× your bet.</p>`;
  }

  if (category === 'bonus') {
    const hasKicker = ['ddb','tdb','sdb','wha'].includes(tpl);
    let rules = `  <h2>Basic Rules — How to Play</h2>
  <p>1. <strong>Place your bet</strong>: Choose BET 1 through BET 5. Always play BET 5 (max bet) for the enhanced Royal Flush jackpot.</p>
  <p>2. <strong>Receive 5 cards</strong>: You're dealt 5 cards from a standard 52-card deck.</p>
  <p>3. <strong>Select cards to HOLD</strong>: Click the cards you want to keep. Target the highest-paying hand combination.</p>
  <p>4. <strong>Press DRAW</strong>: Discarded cards are replaced. Your final hand is evaluated with bonus payouts for specific Four of a Kind hands.</p>
  <p>5. <strong>Bonus payouts</strong>: Different Four of a Kind ranks pay different bonus amounts. Check the payout table for the specific bonus tiers.</p>`;
    if (hasKicker) {
      rules += `\n  <p>6. <strong>Kicker bonus</strong>: Some Four of a Kind hands pay extra when accompanied by a specific "kicker" card (the fifth card matters!).</p>`;
    }
    return rules;
  }

  if (category === 'allamerican') {
    return `  <h2>Basic Rules — How to Play</h2>
  <p>1. <strong>Place your bet</strong>: Choose BET 1 through BET 5. Always play BET 5 for the Royal Flush jackpot bonus.</p>
  <p>2. <strong>Receive 5 cards</strong>: You're dealt 5 cards from a standard 52-card deck.</p>
  <p>3. <strong>Equal-pay system</strong>: Flush and Straight pay the same amount, simplifying draw decisions.</p>
  <p>4. <strong>Straight Flush premium</strong>: The massive 200× Straight Flush payout makes straight flush draws extremely valuable.</p>
  <p>5. <strong>Minimum winning hand</strong>: ${minHand} pays 1× your bet. Two Pair also pays 1×.</p>`;
  }

  if (category === 'deuces' || category === 'rankwild') {
    const wildName = category === 'rankwild' ? `${game.wildRank}s` : '2s (deuces)';
    const WildName = category === 'rankwild' ? `${game.wildRank}s` : 'Deuces';
    return `  <h2>Basic Rules — How to Play ${game.name}</h2>
  <p>1. <strong>Four wild cards</strong>: All four ${wildName} substitute for any card of any suit to complete the best possible hand.</p>
  <p>2. <strong>Minimum winning hand</strong>: Three of a Kind (pairs and two-pair do not pay in wild card games).</p>
  <p>3. <strong>Special hands</strong>: Five of a Kind (five cards of same rank using wilds), Wild Royal Flush (Royal with wild cards), Four ${WildName} (the jackpot hand), Natural Royal Flush (no wilds — maximum payout).</p>
  <p>4. <strong>Always bet max (BET 5)</strong> for the Natural Royal Flush bonus payout.</p>`;
  }

  if (category === 'joker') {
    const deckSize = '53';
    return `  <h2>Basic Rules — How to Play ${game.name}</h2>
  <p>1. <strong>One wild card</strong>: The Joker substitutes for any card of any suit to make the best hand.</p>
  <p>2. <strong>${deckSize}-card deck</strong>: Standard 52 cards plus the Joker — slightly different odds than standard poker.</p>
  <p>3. <strong>Minimum winning hand</strong>: ${minHand}. Check the payout table for the minimum qualifying hand.</p>
  <p>4. <strong>Special hands</strong>: Five of a Kind (four of a kind + Joker), Wild Royal Flush (Royal using the Joker), Natural Royal Flush (no Joker — maximum payout).</p>
  <p>5. <strong>Always bet max (BET 5)</strong> for the Natural Royal Flush jackpot bonus.</p>`;
  }

  if (category === 'doublejoker') {
    return `  <h2>Basic Rules — How to Play ${game.name}</h2>
  <p>1. <strong>Two wild cards</strong>: Two Jokers in a 54-card deck, both act as wild cards substituting for any card.</p>
  <p>2. <strong>Two Jokers bonus</strong>: Being dealt both Jokers is an automatic 100× win — the signature hand.</p>
  <p>3. <strong>Minimum winning hand</strong>: ${minHand} pays 1× your bet.</p>
  <p>4. <strong>Special hands</strong>: Five of a Kind, Wild Royal Flush, Two Jokers (both Jokers in one hand), Natural Royal Flush (maximum payout).</p>
  <p>5. <strong>Always bet max (BET 5)</strong> for the Natural Royal Flush jackpot bonus.</p>`;
  }

  if (category === 'deucesjoker') {
    return `  <h2>Basic Rules — How to Play ${game.name}</h2>
  <p>1. <strong>Five wild cards</strong>: All four deuces (2s) plus one Joker act as wild cards in a 53-card deck.</p>
  <p>2. <strong>Minimum winning hand</strong>: Three of a Kind (pairs do not pay).</p>
  <p>3. <strong>Five Wilds jackpot</strong>: Holding all five wild cards (four deuces + Joker) pays the Five Wilds bonus — 200×.</p>
  <p>4. <strong>Special hands</strong>: Five Wilds, Wild Royal Flush, Five of a Kind, Natural Royal Flush (no wilds — top payout).</p>
  <p>5. <strong>Always bet max (BET 5)</strong> for the enhanced Natural Royal Flush payout.</p>`;
  }

  return '';
}

// ─── Main SEO generator ───────────────────────────────────────────

function generatePayTableHTML(pay) {
  let rows = '<tr><th>Hand</th><th>BET 1</th><th>BET 2</th><th>BET 3</th><th>BET 4</th><th>BET 5</th></tr>';
  for (const [hand, [b1, b5]] of Object.entries(pay)) {
    rows += `<tr><td>${hand}</td><td>${b1}</td><td>${b1*2}</td><td>${b1*3}</td><td>${b1*4}</td><td>${b5}</td></tr>`;
  }
  return `<table>${rows}</table>`;
}

function generateFullSEO(game) {
  const category = getCategory(game.tpl);
  const payTableHTML = generatePayTableHTML(game.pay);

  // Title
  let subtitle = 'Free Online Casino Game';
  if (category === 'deuces' || category === 'rankwild' || category === 'deucesjoker') subtitle = 'Wild Card Strategy Guide';
  else if (category === 'joker' || category === 'doublejoker') subtitle = 'Wild Card Strategy Guide';
  else if (category === 'bonus') subtitle = 'Bonus Poker Strategy Guide';
  else if (category === 'allamerican') subtitle = 'Equal-Pay Strategy Guide';

  const intro = `<h2>How to Play ${game.name} Video Poker — ${subtitle}</h2>\n  <p>${game.desc}</p>`;
  const rules = getRules(game, category, game.tpl);
  const rtpIntro = getRTPIntro(game, category);
  const probTable = getProbabilityTable(game, category);
  const basicStrategy = getBasicStrategy(game, category, game.tpl);
  const advancedStrategy = getAdvancedStrategy(game, category, game.tpl);

  return `<div id="seo-sep" style="width:100%;max-width:680px;padding:16px 16px 0;text-align:center;color:rgba(255,255,255,.25);font-size:.75rem;letter-spacing:2px">▼ &nbsp; GAME GUIDE &nbsp; ▼</div>
<div id="seo">
${intro}

${rules}

  <h2>Probability & Return to Player Analysis</h2>
${rtpIntro}
${probTable}

  <h2>Basic Strategy — Beginner Tips</h2>
${basicStrategy}

  <h2>Advanced Strategy — Expert Play</h2>
${advancedStrategy}

  <h2>Payout Table</h2>
  ${payTableHTML}
</div>`;
}

// ─── File update logic ─────────────────────────────────────────────

function updateFile(game) {
  const filePath = path.join(GAMES_DIR, `${game.id}.html`);
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  ${game.id}.html not found, skipping`);
    return false;
  }

  let html = fs.readFileSync(filePath, 'utf8');

  // Replace entire SEO section (from seo-sep to closing </div> before <script>)
  const seoRegex = /<div id="seo-sep"[\s\S]*?<\/div>\s*<script>/;
  if (!seoRegex.test(html)) {
    console.log(`  ⚠️  ${game.id}.html: SEO section not found, skipping`);
    return false;
  }

  const newSEO = generateFullSEO(game);
  html = html.replace(seoRegex, newSEO + '\n<script>');

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`  ✅ ${game.id}.html`);
  return true;
}

// ─── Main ──────────────────────────────────────────────────────────

console.log('\n📝 Video Poker SEO Content Updater\n');
console.log(`Updating ${GAMES.length} game files with rich SEO content...\n`);

let updated = 0;
let skipped = 0;

for (const game of GAMES) {
  if (updateFile(game)) {
    updated++;
  } else {
    skipped++;
  }
}

console.log(`\n✅ Updated: ${updated} files`);
if (skipped > 0) console.log(`⚠️  Skipped: ${skipped} files`);
console.log('\n🎉 SEO update complete!');
