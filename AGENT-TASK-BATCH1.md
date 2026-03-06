You are working on the video poker web project (branch v53-next).

TASK: Implement 4 new video poker game variants as new HTML files.

## HOW TO CREATE EACH GAME
Use `games/double-bonus-poker.html` as the BASE template for all 4 games.
Copy it exactly, then change ONLY:
1. The `<title>` and `<meta name="description">`
2. The payout table HTML rows (`.pr` elements in `#payout-table`)
3. The JavaScript `PAYS` object
4. The `evalHand()` function (for kicker-based games, add kicker detection AFTER the base eval)
5. The schema.org name/description in the JSON-LD block

DO NOT change the CSS, card rendering, game loop, swipe logic, or UI structure.

---

## GAME 1: Double Double Bonus Poker
File: `games/double-double-bonus-poker.html`
Title tag: `Double Double Bonus Poker - Play Free Online | No Download`
Meta description: `Play free Double Double Bonus Poker online. Extra bonus payouts for four aces with a 2/3/4 kicker. No download required.`

Paytable rows (hand name → payout per 1 credit, max 5 credits):
- Royal Flush: 250 / 500 / 750 / 1000 / 4000
- Four Aces + 2,3,4: 400 / 800 / 1200 / 1600 / 2000
- Four 2,3,4 + A,2,3,4: 160 / 320 / 480 / 640 / 800
- Four Aces: 160 / 320 / 480 / 640 / 800
- Four 2s, 3s, 4s: 80 / 160 / 240 / 320 / 400
- Four 5s - Ks: 50 / 100 / 150 / 200 / 250
- Straight Flush: 50 / 100 / 150 / 200 / 250
- Full House: 9 / 18 / 27 / 36 / 45
- Flush: 6 / 12 / 18 / 24 / 30
- Straight: 4 / 8 / 12 / 16 / 20
- Three of a Kind: 3 / 6 / 9 / 12 / 15
- Two Pair: 1 / 2 / 3 / 4 / 5
- Jacks or Better: 1 / 2 / 3 / 4 / 5

JS PAYS object (replace the existing PAYS entirely):
```
const PAYS = {
  royalFlush:      [250,500,750,1000,4000],
  fourAcesKicker:  [400,800,1200,1600,2000],
  fourLowKicker:   [160,320,480,640,800],
  fourAces:        [160,320,480,640,800],
  fourLow:         [80,160,240,320,400],
  fourHigh:        [50,100,150,200,250],
  straightFlush:   [50,100,150,200,250],
  fullHouse:       [9,18,27,36,45],
  flush:           [6,12,18,24,30],
  straight:        [4,8,12,16,20],
  threeOfAKind:    [3,6,9,12,15],
  twoPair:         [1,2,3,4,5],
  jacksOrBetter:   [1,2,3,4,5],
};
```

evalHand changes: After the existing hand detection logic determines the result, ADD this kicker check at the end of evalHand (before the return):
```
// Kicker upgrade for Double Double Bonus
if (result === 'fourAces') {
  // find the non-quad card
  const nonQuad = hand.find(c => c.rank !== 'A');
  if (nonQuad && ['2','3','4'].includes(nonQuad.rank)) result = 'fourAcesKicker';
}
if (result === 'fourLow') {
  // fourLow = four 2s, 3s, or 4s
  const quadRank = hand.find(c => {
    const same = hand.filter(x => x.rank === c.rank);
    return same.length === 4;
  })?.rank;
  const nonQuad = hand.find(c => c.rank !== quadRank);
  if (nonQuad && ['A','2','3','4'].includes(nonQuad.rank)) result = 'fourLowKicker';
}
```

Note: The existing double-bonus-poker.html already has fourAces, fourLow, fourHigh keys in PAYS and evalHand. Just copy that file and add the kicker logic on top.

---

## GAME 2: Triple Double Bonus Poker
File: `games/triple-double-bonus-poker.html`
Title: `Triple Double Bonus Poker - Play Free Online | No Download`
Meta description: `Play free Triple Double Bonus Poker online. Massive bonuses for four aces or low quads with kicker cards. No download required.`

Same kicker detection as Game 1.

PAYS:
```
const PAYS = {
  royalFlush:      [200,400,600,800,4000],
  fourAcesKicker:  [800,1600,2400,3200,4000],
  fourLowKicker:   [400,800,1200,1600,2000],
  fourAces:        [160,320,480,640,800],
  fourLow:         [80,160,240,320,400],
  fourHigh:        [50,100,150,200,250],
  straightFlush:   [50,100,150,200,250],
  fullHouse:       [9,18,27,36,45],
  flush:           [7,14,21,28,35],
  straight:        [4,8,12,16,20],
  threeOfAKind:    [2,4,6,8,10],
  twoPair:         [1,2,3,4,5],
  jacksOrBetter:   [1,2,3,4,5],
};
```

Paytable rows:
- Royal Flush: 200/400/600/800/4000
- Four Aces + 2,3,4: 800/1600/2400/3200/4000
- Four 2,3,4 + A,2,3,4: 400/800/1200/1600/2000
- Four Aces: 160/320/480/640/800
- Four 2s,3s,4s: 80/160/240/320/400
- Four 5s-Ks: 50/100/150/200/250
- Straight Flush: 50/100/150/200/250
- Full House: 9/18/27/36/45
- Flush: 7/14/21/28/35
- Straight: 4/8/12/16/20
- Three of a Kind: 2/4/6/8/10
- Two Pair: 1/2/3/4/5
- Jacks or Better: 1/2/3/4/5

---

## GAME 3: Aces and Eights
File: `games/aces-and-eights.html`

IMPORTANT: This file already EXISTS (check with ls games/). If it exists, READ IT FIRST. If it already has the correct paytable below, skip this game. If it doesn't exist or has wrong paytable, create/fix it.

Title: `Aces & Eights Video Poker - Play Free Online | No Download`
Meta description: `Play free Aces and Eights video poker online. Big bonuses for four aces, four eights, and four sevens. No download required.`

PAYS:
```
const PAYS = {
  royalFlush:    [250,500,750,1000,4000],
  straightFlush: [50,100,150,200,250],
  fourAces:      [80,160,240,320,400],
  fourEights:    [80,160,240,320,400],
  fourSevens:    [50,100,150,200,250],
  fourOfAKind:   [25,50,75,100,125],
  fullHouse:     [8,16,24,32,40],
  flush:         [5,10,15,20,25],
  straight:      [4,8,12,16,20],
  threeOfAKind:  [3,6,9,12,15],
  twoPair:       [2,4,6,8,10],
  jacksOrBetter: [1,2,3,4,5],
};
```

evalHand: After detecting fourOfAKind, check which rank:
```
if (result === 'fourOfAKind') {
  const quadRank = hand.find(c => hand.filter(x=>x.rank===c.rank).length===4)?.rank;
  if (quadRank === 'A') result = 'fourAces';
  else if (quadRank === '8') result = 'fourEights';
  else if (quadRank === '7') result = 'fourSevens';
}
```

Paytable rows:
- Royal Flush: 250/500/750/1000/4000
- Straight Flush: 50/100/150/200/250
- Four Aces: 80/160/240/320/400
- Four Eights: 80/160/240/320/400
- Four Sevens: 50/100/150/200/250
- Four of a Kind: 25/50/75/100/125
- Full House: 8/16/24/32/40
- Flush: 5/10/15/20/25
- Straight: 4/8/12/16/20
- Three of a Kind: 3/6/9/12/15
- Two Pair: 2/4/6/8/10
- Jacks or Better: 1/2/3/4/5

---

## GAME 4: Joker Poker (Kings or Better)
File: `games/joker-poker.html`
Title: `Joker Poker - Kings or Better - Play Free Online | No Download`
Meta description: `Play free Joker Poker online with wild Joker card. Kings or better to win. No download required.`

Special rules:
- 53-card deck: standard 52 + 1 Joker (rank='JK', suit='JOKER')
- Joker is wild (substitutes any card)
- Minimum qualifying hand: Kings or Better (pair of K or A only)

PAYS:
```
const PAYS = {
  naturalRoyal:  [250,500,750,1000,4000],
  fiveOfAKind:   [200,400,600,800,1000],
  wildRoyal:     [100,200,300,400,500],
  straightFlush: [50,100,150,200,250],
  fourOfAKind:   [20,40,60,80,100],
  fullHouse:     [7,14,21,28,35],
  flush:         [5,10,15,20,25],
  straight:      [3,6,9,12,15],
  threeOfAKind:  [2,4,6,8,10],
  twoPair:       [1,2,3,4,5],
  kingsOrBetter: [1,2,3,4,5],
};
```

Implementation of Joker Poker:
1. In deck creation, add after the 52-card loop:
   `deck.push({rank:'JK', suit:'JOKER'});`

2. In card rendering (the function that draws card faces), add special case:
   - if rank === 'JK': show '🃏' as the center suit symbol, rank text 'JK', gold border

3. evalHand for Joker:
   - Count jokers in hand (cards where rank === 'JK')
   - If 0 jokers: evaluate normally, but change 'jacksOrBetter' → 'kingsOrBetter' (pair of K or A only qualifies, not J or Q)
   - If 1+ joker:
     - The joker substitutes optimally
     - With 1 joker: check best possible hand from the 4 natural cards
     - Five of a Kind: 4 natural cards all same rank
     - Natural/Wild Royal: check if 4 naturals + joker = royal straight flush
     - naturalRoyal key only for hands with 0 jokers
     - wildRoyal for royal flush made with joker
     - straightFlush, fourOfAKind, fullHouse, flush, straight, threeOfAKind follow standard rules with joker filling in optimally

Since Joker Poker eval is complex, implement it step by step:
```javascript
function evalHand(hand) {
  const jokerCount = hand.filter(c => c.rank === 'JK').length;
  const naturals = hand.filter(c => c.rank !== 'JK');
  
  if (jokerCount === 0) {
    // Standard eval but kingsOrBetter instead of jacksOrBetter
    const base = evalStandard(naturals);
    if (base === 'jacksOrBetter') {
      // check if pair is K or A only
      const ranks = naturals.map(c=>c.rank);
      const pairs = ranks.filter((r,i)=>ranks.indexOf(r)!==i);
      if (pairs.some(r=>r==='K'||r==='A')) return 'kingsOrBetter';
      return null; // no win
    }
    return base;
  }
  
  // With joker(s) - evaluate best possible hand
  if (jokerCount >= 1) {
    const ranks = naturals.map(c=>c.rank);
    const suits = naturals.map(c=>c.suit);
    const rankCounts = {};
    ranks.forEach(r => rankCounts[r] = (rankCounts[r]||0)+1);
    const maxCount = Math.max(...Object.values(rankCounts));
    
    // Five of a kind (4 naturals same rank + joker)
    if (maxCount === 4) return 'fiveOfAKind';
    
    // Check for wild royal flush (10,J,Q,K,A of same suit with joker filling)
    const royalRanks = ['10','J','Q','K','A'];
    const sameSuitNaturals = suits.filter((s,i,a)=>a.indexOf(s)===i).length === 1 || naturals.length <= 1;
    if (sameSuitNaturals && naturals.length >= 1) {
      // check if naturals are subset of royal ranks (all same suit)
      const naturalSuit = suits[0];
      const allSameSuit = suits.every(s=>s===naturalSuit);
      const allRoyal = ranks.every(r=>royalRanks.includes(r));
      const naturalCount = naturals.length;
      if (allSameSuit && allRoyal) {
        // Can complete a royal flush
        if (naturalCount + jokerCount === 5) {
          return 'wildRoyal';
        }
      }
    }
    
    // Straight flush check (simplified: all same suit + consecutive with joker filling)
    // Four of a kind (3 naturals same rank + joker, or with 2 jokers: 2 same rank)
    if (maxCount === 3) return 'fourOfAKind';
    if (jokerCount === 2 && maxCount === 2) return 'fourOfAKind';
    
    // Full house with joker is actually better achieved as four of a kind, skip
    
    // Flush (all 4 naturals same suit + joker makes 5th)
    const allSameSuit = suits.length > 0 && suits.every(s=>s===suits[0]);
    if (allSameSuit && naturals.length === 4) return 'flush';
    
    // Straight check
    // Three of a kind (1 joker + pair in naturals, or just joker + any)  
    if (maxCount === 2) return 'threeOfAKind';
    
    // Default: joker gives at least three of a kind
    return 'threeOfAKind';
  }
  
  return null;
}
```

Note: For simplicity, implement a clean Joker Poker that handles the main cases correctly. The evalStandard function should be the existing evalHand logic extracted into a helper.

Paytable rows for Joker Poker:
- Natural Royal Flush: 250/500/750/1000/4000
- Five of a Kind: 200/400/600/800/1000
- Wild Royal Flush: 100/200/300/400/500
- Straight Flush: 50/100/150/200/250
- Four of a Kind: 20/40/60/80/100
- Full House: 7/14/21/28/35
- Flush: 5/10/15/20/25
- Straight: 3/6/9/12/15
- Three of a Kind: 2/4/6/8/10
- Two Pair: 1/2/3/4/5
- Kings or Better: 1/2/3/4/5

---

## AFTER ALL GAMES:

1. Open `index.html` and add 4 new game cards following the EXACT same HTML pattern as existing game cards. Place them logically in the games grid.

2. Commit everything:
   ```
   git add games/double-double-bonus-poker.html games/triple-double-bonus-poker.html games/joker-poker.html games/aces-and-eights.html index.html
   git commit -m "feat: add Double Double Bonus, Triple Double Bonus, Joker Poker, Aces & Eights (#batch1)"
   ```

3. When completely done, run:
   `openclaw system event --text "Done: Batch 1 complete — 4 new video poker games added" --mode now`
