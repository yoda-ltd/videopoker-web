#!/usr/bin/env node
/**
 * Video Poker Game Generator
 * Reads existing game files as templates and generates new variants
 * by replacing game-specific configuration (PAY, MODE, PAIR, title, etc.)
 */
const fs = require('fs');
const path = require('path');

const GAMES_DIR = path.join(__dirname, '..', 'games');

// ─── Template categories ───────────────────────────────────────────
// Each new game uses an existing game file as its template base
const TEMPLATES = {
  standard: 'jacks-or-better.html',
  bonus: 'bonus-poker.html',       // has evalClassic(..., true)
  deuces: 'deuces-wild.html',
  joker: 'joker-poker.html',
  rankwild: 'sevens-wild.html',    // rank-based wild card
};

// ─── New game definitions ──────────────────────────────────────────
const NEW_GAMES = [
  // ── Standard variants (no wild, no bonus) ──
  {
    id: 'queens-or-better', name: 'Queens or Better', template: 'standard',
    badge: 'CLASSIC', logo: 'jacks-or-better.png',
    mode: 'queens', pairLabel: 'Queens or Better', pairOk: ['Q','K','A'],
    pay: {'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[25,125],'Full House':[8,40],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Queens or Better':[1,5]},
    desc: 'Classic draw poker requiring a pair of Queens or higher to win. Tighter than Jacks or Better with adjusted payouts.',
  },
  {
    id: 'eights-or-better', name: 'Eights or Better', template: 'standard',
    badge: 'EASY', logo: 'jacks-or-better.png',
    mode: 'eights', pairLabel: 'Eights or Better', pairOk: ['8','9','10','J','Q','K','A'],
    pay: {'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[25,125],'Full House':[6,30],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Eights or Better':[1,5]},
    desc: 'Easy video poker — any pair of 8s or higher wins. More frequent payouts with adjusted pay table.',
  },
  {
    id: 'sixes-or-better', name: 'Sixes or Better', template: 'standard',
    badge: 'EASY+', logo: 'jacks-or-better.png',
    mode: 'sixes', pairLabel: 'Sixes or Better', pairOk: ['6','7','8','9','10','J','Q','K','A'],
    pay: {'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[20,100],'Full House':[5,25],'Flush':[4,20],'Straight':[3,15],'Three of a Kind':[2,10],'Two Pair':[1,5],'Sixes or Better':[1,5]},
    desc: 'Very easy video poker — pair of 6s or higher pays. Great for beginners who want frequent wins.',
  },
  {
    id: 'aces-or-better', name: 'Aces or Better', template: 'standard',
    badge: 'HARD', logo: 'jacks-or-better.png',
    mode: 'acesonly', pairLabel: 'Aces or Better', pairOk: ['A'],
    pay: {'Royal Flush':[250,4000],'Straight Flush':[80,400],'Four of a Kind':[40,200],'Full House':[8,40],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Aces or Better':[1,5]},
    desc: 'Challenge mode — only a pair of Aces qualifies as the minimum winning hand. Higher payouts for big hands to compensate.',
  },
  {
    id: 'two-pair-or-better', name: 'Two Pair or Better', template: 'standard',
    badge: 'HARD+', logo: 'jacks-or-better.png',
    mode: 'twopair', pairLabel: 'Two Pair or Better', pairOk: [],
    pay: {'Royal Flush':[250,4000],'Straight Flush':[100,500],'Four of a Kind':[50,250],'Full House':[12,60],'Flush':[8,40],'Straight':[5,25],'Three of a Kind':[4,20],'Two Pair':[1,5]},
    desc: 'High-stakes variant — minimum winning hand is Two Pair. No single pair pays, but all higher hands pay significantly more.',
  },
  {
    id: 'jacks-or-better-85', name: 'Jacks or Better 8/5', template: 'standard',
    badge: 'CLASSIC', logo: 'jacks-or-better.png',
    mode: 'jacks85', pairLabel: 'Jacks or Better', pairOk: ['J','Q','K','A'],
    pay: {'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[25,125],'Full House':[8,40],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Jacks or Better':[1,5]},
    desc: 'The 8/5 pay table variant of Jacks or Better — Full House pays 8x, Flush pays 5x. Common in many casinos.',
  },
  {
    id: 'jacks-or-better-75', name: 'Jacks or Better 7/5', template: 'standard',
    badge: 'CLASSIC', logo: 'jacks-or-better.png',
    mode: 'jacks75', pairLabel: 'Jacks or Better', pairOk: ['J','Q','K','A'],
    pay: {'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[25,125],'Full House':[7,35],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Jacks or Better':[1,5]},
    desc: 'The 7/5 pay table variant — Full House pays 7x, Flush pays 5x. Short-pay version common at airports and bars.',
  },
  {
    id: 'jacks-or-better-65', name: 'Jacks or Better 6/5', template: 'standard',
    badge: 'CLASSIC', logo: 'jacks-or-better.png',
    mode: 'jacks65', pairLabel: 'Jacks or Better', pairOk: ['J','Q','K','A'],
    pay: {'Royal Flush':[250,4000],'Straight Flush':[50,250],'Four of a Kind':[25,125],'Full House':[6,30],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Jacks or Better':[1,5]},
    desc: 'The 6/5 pay table — most common in dollar denomination machines. Lower house edge than slot machines.',
  },

  // ── Bonus variants (no wild, bonus four-of-a-kind payouts) ──
  {
    id: 'nevada-bonus-poker', name: 'Nevada Bonus Poker', template: 'bonus',
    badge: 'BONUS', logo: 'bonus-poker.png',
    mode: 'bonus', pairLabel: 'Jacks or Better', pairOk: ['J','Q','K','A'],
    pay: {'Royal Flush':[250,4000],'Four Aces':[80,400],'Straight Flush':[50,250],'Four 2s-4s':[40,200],'Four of a Kind':[25,125],'Full House':[7,35],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[2,10],'Jacks or Better':[1,5]},
    desc: 'Nevada-style bonus poker with enhanced Four Aces (80x) and Four 2s-4s (40x) payouts.',
  },
  {
    id: 'royal-aces-bonus', name: 'Royal Aces Bonus', template: 'bonus',
    badge: 'MEGA', logo: 'aces-and-faces.png',
    mode: 'bonus', pairLabel: 'Jacks or Better', pairOk: ['J','Q','K','A'],
    pay: {'Royal Flush':[250,4000],'Four Aces':[400,2000],'Straight Flush':[50,250],'Four 2s-4s':[40,200],'Four of a Kind':[25,125],'Full House':[6,30],'Flush':[4,20],'Straight':[3,15],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]},
    desc: 'Massive Four Aces payout at 400x your bet. Lower payouts on common hands to fund the jackpot premium.',
  },
  {
    id: 'ultra-bonus-poker', name: 'Ultra Bonus Poker', template: 'bonus',
    badge: 'HI-VAR', logo: 'bonus-poker.png',
    mode: 'bonus', pairLabel: 'Jacks or Better', pairOk: ['J','Q','K','A'],
    pay: {'Royal Flush':[250,4000],'Four Aces':[240,1200],'Straight Flush':[80,400],'Four 2s-4s':[120,600],'Four of a Kind':[50,250],'Full House':[6,30],'Flush':[5,25],'Straight':[4,20],'Three of a Kind':[3,15],'Two Pair':[1,5],'Jacks or Better':[1,5]},
    desc: 'Ultra-high variance bonus poker. Four Aces pay 240x and Four 2s-4s pay 120x. Big swings, big rewards.',
  },

  // ── Deuces Wild variants (different pay tables) ──
  {
    id: 'short-pay-deuces-wild', name: 'Short Pay Deuces Wild', template: 'deuces',
    badge: 'WILD', logo: 'deuces-wild.png',
    mode: 'deuces', pairLabel: 'Three of a Kind', pairOk: ['J','Q','K','A'],
    pay: {'Natural Royal Flush':[800,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[16,80],'Straight Flush':[10,50],'Four of a Kind':[4,20],'Full House':[4,20],'Flush':[3,15],'Straight':[2,10],'Three of a Kind':[1,5]},
    desc: 'Short-pay version of Deuces Wild commonly found in casino bars. Higher pays for Five of a Kind and Straight Flush.',
  },
  {
    id: 'illinois-deuces-wild', name: 'Illinois Deuces Wild', template: 'deuces',
    badge: 'WILD', logo: 'deuces-wild.png',
    mode: 'deuces', pairLabel: 'Three of a Kind', pairOk: ['J','Q','K','A'],
    pay: {'Natural Royal Flush':[800,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[10,50],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[2,10],'Three of a Kind':[1,5]},
    desc: 'Illinois-style Deuces Wild with a 10x Straight Flush payout. Common in Midwest riverboat casinos.',
  },
  {
    id: 'colorado-deuces-wild', name: 'Colorado Deuces Wild', template: 'deuces',
    badge: 'WILD', logo: 'deuces-wild.png',
    mode: 'deuces', pairLabel: 'Three of a Kind', pairOk: ['J','Q','K','A'],
    pay: {'Natural Royal Flush':[800,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[9,45],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[2,10],'Three of a Kind':[1,5]},
    desc: 'Colorado mountain casino variant. Same Straight Flush as full-pay but reduced Four of a Kind payout.',
  },
  {
    id: 'airport-deuces-wild', name: 'Airport Deuces Wild', template: 'deuces',
    badge: 'WILD', logo: 'deuces-wild.png',
    mode: 'deuces', pairLabel: 'Three of a Kind', pairOk: ['J','Q','K','A'],
    pay: {'Natural Royal Flush':[800,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[20,100],'Five of a Kind':[12,60],'Straight Flush':[9,45],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[2,10],'Three of a Kind':[1,5]},
    desc: 'The notoriously tight pay table found in airports. Wild Royal and Five of a Kind pay less, but all Deuces are still wild.',
  },
  {
    id: 'nsu-deuces-wild', name: 'NSU Deuces Wild', template: 'deuces',
    badge: 'PRO', logo: 'deuces-wild.png',
    mode: 'deuces', pairLabel: 'Three of a Kind', pairOk: ['J','Q','K','A'],
    pay: {'Natural Royal Flush':[800,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[16,80],'Straight Flush':[13,65],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[2,10],'Three of a Kind':[1,5]},
    desc: 'The "Not So Ugly" Deuces Wild — nearly full-pay with 99.73% RTP. Favored by serious video poker players.',
  },
  {
    id: 'downtown-deuces-wild', name: 'Downtown Deuces Wild', template: 'deuces',
    badge: 'WILD', logo: 'deuces-wild.png',
    mode: 'deuces', pairLabel: 'Three of a Kind', pairOk: ['J','Q','K','A'],
    pay: {'Natural Royal Flush':[800,4000],'Four Deuces':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[16,80],'Straight Flush':[10,50],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[2,10],'Three of a Kind':[1,5]},
    desc: 'The downtown Las Vegas Fremont Street variant. Slightly better Straight Flush payout than short-pay.',
  },

  // ── Rank-based Wild variants (template: sevens-wild) ──
  {
    id: 'threes-wild', name: 'Threes Wild', template: 'rankwild',
    badge: 'WILD', logo: 'deuces-wild.png',
    mode: 'threeswild', wildRank: '3', fourWildsName: 'Four Threes',
    pairLabel: 'Three of a Kind', pairOk: ['J','Q','K','A'],
    pay: {'Natural Royal Flush':[250,4000],'Four Threes':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[9,45],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]},
    desc: 'All four 3s are wild cards. Similar to Deuces Wild but with 3s substituting for any card.',
  },
  {
    id: 'fours-wild', name: 'Fours Wild', template: 'rankwild',
    badge: 'WILD', logo: 'deuces-wild.png',
    mode: 'fourswild', wildRank: '4', fourWildsName: 'Four Fours',
    pairLabel: 'Three of a Kind', pairOk: ['J','Q','K','A'],
    pay: {'Natural Royal Flush':[250,4000],'Four Fours':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[9,45],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]},
    desc: 'All four 4s are wild cards. Four wild cards change the strategy dramatically.',
  },
  {
    id: 'fives-wild', name: 'Fives Wild', template: 'rankwild',
    badge: 'WILD', logo: 'deuces-wild.png',
    mode: 'fiveswild', wildRank: '5', fourWildsName: 'Four Fives',
    pairLabel: 'Three of a Kind', pairOk: ['J','Q','K','A'],
    pay: {'Natural Royal Flush':[250,4000],'Four Fives':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[9,45],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]},
    desc: 'All four 5s are wild. Middle-of-the-deck wild cards create unique straight possibilities.',
  },
  {
    id: 'eights-wild', name: 'Eights Wild', template: 'rankwild',
    badge: 'WILD', logo: 'deuces-wild.png',
    mode: 'eightswild', wildRank: '8', fourWildsName: 'Four Eights',
    pairLabel: 'Three of a Kind', pairOk: ['J','Q','K','A'],
    pay: {'Natural Royal Flush':[250,4000],'Four Eights':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[9,45],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]},
    desc: 'All four 8s are wild. Higher wild rank means more natural low pairs remain available.',
  },
  {
    id: 'tens-wild', name: 'Tens Wild', template: 'rankwild',
    badge: 'WILD', logo: 'deuces-wild.png',
    mode: 'tenswild', wildRank: '10', fourWildsName: 'Four Tens',
    pairLabel: 'Three of a Kind', pairOk: ['J','Q','K','A'],
    pay: {'Natural Royal Flush':[250,4000],'Four Tens':[200,1000],'Wild Royal Flush':[25,125],'Five of a Kind':[15,75],'Straight Flush':[9,45],'Four of a Kind':[4,20],'Full House':[3,15],'Flush':[2,10],'Straight':[1,5],'Three of a Kind':[1,5]},
    desc: 'All four 10s are wild cards. Wild 10s affect straight draws uniquely since 10 is part of the Royal Flush.',
  },
];

// ─── Generator logic ───────────────────────────────────────────────

function generatePayTableHTML(pay) {
  let rows = '<tr><th>Hand</th><th>BET 1</th><th>BET 2</th><th>BET 3</th><th>BET 4</th><th>BET 5</th></tr>';
  for (const [hand, [b1, b5]] of Object.entries(pay)) {
    rows += `<tr><td>${hand}</td><td>${b1}</td><td>${b1*2}</td><td>${b1*3}</td><td>${b1*4}</td><td>${b5}</td></tr>`;
  }
  return `<table>${rows}</table>`;
}

function generateSEO(game) {
  const payTableHTML = generatePayTableHTML(game.pay);
  const handNames = Object.keys(game.pay);
  const minHand = handNames[handNames.length - 1];

  let wildNote = '';
  if (game.template === 'deuces') wildNote = ' All four 2s (Deuces) act as wild cards, substituting for any card you need.';
  else if (game.template === 'joker') wildNote = ' Includes one Joker as a wild card in a 53-card deck.';
  else if (game.template === 'rankwild') wildNote = ` All four ${game.wildRank}s act as wild cards, substituting for any card you need.`;

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
  const templateFile = TEMPLATES[game.template];
  const templatePath = path.join(GAMES_DIR, templateFile);
  let html = fs.readFileSync(templatePath, 'utf8');

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

  // 5. Replace SEO section (from seo-sep to end of seo div)
  html = html.replace(
    /<div id="seo-sep"[\s\S]*?<\/div>\s*<script>/,
    generateSEO(game) + '\n<script>'
  );

  // 6. Replace PAY constant
  const payStr = JSON.stringify(game.pay).replace(/"/g, "'");
  html = html.replace(/const PAY=\{.*?\};/, `const PAY=${payStr};`);

  // 7. Replace MODE
  html = html.replace(/const MODE='.*?';/, `const MODE='${game.mode}';`);

  // 8. Replace PAIR_LABEL
  html = html.replace(/const PAIR_LABEL='.*?';/, `const PAIR_LABEL='${game.pairLabel}';`);

  // 9. Replace PAIR_OK
  html = html.replace(/const PAIR_OK=\[.*?\];/, `const PAIR_OK=${JSON.stringify(game.pairOk)};`);

  // 10. For rank-wild variants, update the wild card logic
  if (game.template === 'rankwild' && game.wildRank) {
    const wr = game.wildRank;
    const mode = game.mode;

    // Update evalWild isWild check: kind==='sevenswild'?c.r==='7' → kind==='MODE'?c.r==='RANK'
    html = html.replace(
      /kind==='sevenswild'\?c\.r==='7'/g,
      `kind==='${mode}'?c.r==='${wr}'`
    );

    // Update Four Wilds name: 'Four Sevens' → 'Four Xs'
    html = html.replace(/'Four Sevens'/g, `'${game.fourWildsName}'`);

    // Update kind check: kind==='sevenswild' → kind==='MODE'
    html = html.replace(/kind==='sevenswild'/g, `kind==='${mode}'`);

    // Update evalHand call: evalWild(h,'sevenswild') → evalWild(h,'MODE')
    html = html.replace(
      /evalWild\(h,'sevenswild'\)/g,
      `evalWild(h,'${mode}')`
    );

    // Update cardHTML wild card check (MUST be before generic MODE replacement)
    // At this point MODE==='sevenswild' still exists in cardHTML
    html = html.replace(
      /MODE==='sevenswild'&&c\.r==='7'/g,
      `MODE==='${mode}'&&c.r==='${wr}'`
    );

    // Update remaining evalHand MODE check
    html = html.replace(/MODE==='sevenswild'/g, `MODE==='${mode}'`);
  }

  // 11. For confetti triggers - also trigger on Natural Royal Flush
  if (!html.includes("ht==='Natural Royal Flush'") && html.includes("ht==='Royal Flush'")) {
    // Already handled by template
  }

  const outPath = path.join(GAMES_DIR, `${game.id}.html`);
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`  ✅ ${game.id}.html`);
}

// ─── Index.html updater ────────────────────────────────────────────

function updateIndex(allGames) {
  const indexPath = path.join(__dirname, '..', 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  // Build game card entries for new games
  const newEntries = allGames.map(g => {
    return `        <a class="game-card" href="games/${g.id}.html"><div class="topline"><span class="badge">${g.badge}</span></div><div class="row"><img class="logo" src="assets/logos/${g.logo}" alt="${g.name} logo"><div><h3>${g.name}</h3></div></div><span class="play-btn">PLAY NOW</span></a>`;
  });

  // Find the last game-card entry and append after it
  const lastCardIdx = html.lastIndexOf('</a>', html.indexOf('</div>', html.indexOf('id="variants"')) );

  // Insert before closing </div> of #variants
  html = html.replace(
    /(<\/a>\s*\n\s*<\/div>\s*\n\s*<\/div>)/,
    (match) => {
      // Find the insertion point
      return newEntries.join('\n\n') + '\n\n' + match;
    }
  );

  // Update variant count
  const totalGames = 28 + allGames.length;
  html = html.replace(
    /(\d+) VARIANTS/,
    `${totalGames} VARIANTS`
  );
  html = html.replace(
    /(\d+) classic video poker variants/,
    `${totalGames} classic video poker variants`
  );

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log(`\n  📋 index.html updated — ${totalGames} variants total`);
}

// ─── Main ──────────────────────────────────────────────────────────

console.log('\n🎰 Video Poker Game Generator\n');
console.log(`Generating ${NEW_GAMES.length} new games...\n`);

// Filter out games that already exist
const toGenerate = NEW_GAMES.filter(g => {
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

toGenerate.forEach(generateGame);

console.log(`\n✅ Generated ${toGenerate.length} new game files`);

// Update index.html
updateIndex(toGenerate);

console.log('\n🎉 Done! Total games: ' + (28 + toGenerate.length));
