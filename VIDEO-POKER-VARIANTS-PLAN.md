# Video Poker Variants Master Plan
*Created: 2026-03-06 | Branch: v52-next*

## Current Games (8 existing)
1. ✅ Jacks or Better
2. ✅ Deuces Wild
3. ✅ Bonus Poker
4. ✅ Double Bonus Poker
5. ✅ Aces and Faces
6. ✅ Nines or Better
7. ✅ Tens or Better
8. ✅ All American Poker

---

## Phase 1 — High Priority (Most Popular, High SEO Value) [10 games]

9.  [ ] **Double Double Bonus Poker** — Extra bonus for Four Aces w/ 2/3/4 kicker (400x), Four 2/3/4 w/ A/2/3/4 kicker (160x)
10. [ ] **Triple Double Bonus Poker** — Even higher bonus for quads with kickers
11. [ ] **Joker Poker (Kings or Better)** — 53-card deck, Joker as wild, Kings or Better to win
12. [ ] **Deuces Wild Bonus** — Deuces Wild with extra bonuses for Four Deuces + kicker
13. [ ] **Loose Deuces Wild** — Four Deuces pays 200x (higher than standard 25x)
14. [ ] **Super Times Pay** — Multiplier (2x-10x) randomly applied before deal
15. [ ] **Pick 'Em Poker** — Deal 2 cards + 2 face-down pairs; pick one pair (Shevegas-style)
16. [ ] **Bonus Deuces Wild** — Combines Deuces Wild mechanics with Bonus Poker bonuses
17. [ ] **Double Bonus Poker Deluxe** — Simplified Double Bonus: no kicker bonuses, higher base quads
18. [ ] **White Hot Aces** — Four Aces pays 800x, Four 2/3/4 pays 400x (ultra premium quad bonuses)

---

## Phase 2 — Mid Priority (Popular Variants) [10 games]

19. [ ] **5-Play Poker (Jacks or Better)** — Play 5 simultaneous hands
20. [ ] **3-Play Poker (Jacks or Better)** — Play 3 simultaneous hands
21. [ ] **10-Play Poker (Jacks or Better)** — Play 10 simultaneous hands
22. [ ] **Super Aces** — Enhanced Aces payouts: Four Aces 400x, Four 2/3/4 160x
23. [ ] **Shockwave Poker** — Progressive multipliers on winning hands
24. [ ] **Double Double Jackpot** — Progressive jackpot overlay on Jacks or Better
25. [ ] **Sevens Wild** — Sevens act as wilds (rare variant)
26. [ ] **Aces & Eights** — Bonus for Four Aces (80x), Four 8s (80x), Four 7s (50x)
27. [ ] **One Eyed Jacks** — One-eyed Jacks (J♥, J♠) are wild
28. [ ] **Nevada Bonus Poker** — Nevada-style paytable with high Straight Flush (100x)

---

## Phase 3 — SEO Long-tail Variants [10 games]

29. [ ] **Joker Poker (Two Pair or Better)** — Joker wild, Two Pair to qualify
30. [ ] **Deuces and Joker Wild** — 5 wild cards (4 Deuces + 1 Joker)
31. [ ] **Four Card Poker** — 4-card variant (different hand rankings)
32. [ ] **Tens or Better Bonus** — Tens or Better with quad bonuses
33. [ ] **Royal Aces Bonus** — Extra bonus specifically for Royal Flush + Four Aces
34. [ ] **Double Jackpot Poker** — Sequential Royal bonus (progressive-style)
35. [ ] **Triple Bonus Poker Plus** — Three-tier bonus system for quads
36. [ ] **Deuces Wild Deluxe** — Premium Deuces Wild with deluxe quad payouts
37. [ ] **Aces & Faces Bonus** — Extended Aces & Faces with extra kicker bonus
38. [ ] **Super Draw 6** — 6-card draw poker (player discards the worst card)

---

## Phase 4 — Advanced / Exotic Variants [10 games]

39. [ ] **Ultimate X Poker** — Random multipliers (2x-12x) on next hand after win
40. [ ] **Fortune Pai Gow Video Poker** — Poker scoring meets Pai Gow splitting
41. [ ] **Mystery Wild** — Random card each hand becomes wild
42. [ ] **Spin Poker** — 9-hand poker arranged in a 3×3 grid
43. [ ] **Power Poker (4-Play)** — IGT-style 4-hand simultaneous play
44. [ ] **Deuces Wild (Full Pay)** — 100.76% RTP "full pay" paytable version
45. [ ] **Royal Deuces Wild** — Extra bonus for Natural Royal Flush in Deuces Wild
46. [ ] **Caribbean Draw Poker** — Multi-hand with ante bonus structure
47. [ ] **Pyramid Poker** — Hands arranged in pyramid (1-2-3 cards)
48. [ ] **VideoPoker Progressive** — Shared progressive jackpot for Royal Flush

---

## Phase 5 — Regional / Specialty Variants [10 games]

49. [ ] **Australian Poker** — Popular Australian casino variant (different paytable structure)
50. [ ] **Spanish Video Poker** — Uses Spanish deck (no 8s, 9s, 10s, different hands)
51. [ ] **Joker Wild (Microgaming)** — Online casino standard, Two Pair min qualifier
52. [ ] **Vegas Strip Poker** — Las Vegas Strip standard paytable
53. [ ] **Atlantic City Poker** — East Coast casino standard
54. [ ] **Multihand Aces & Faces** — 5-hand version of Aces & Faces
55. [ ] **Double Double Aces** — Ultra high quad bonuses stacked
56. [ ] **Lucky Ladies Poker** — Queen-focused bonuses
57. [ ] **9/6 Jacks or Better** — Full pay 9/6 version (99.54% RTP) — premium paytable
58. [ ] **8/5 Bonus Poker** — Classic casino Bonus Poker with 8/5 paytable

---

## Implementation Priority Order

### Batch 1 (implement first, most SEO value):
9, 10, 11, 26 → Double Double Bonus, Triple Double Bonus, Joker Poker, Aces & Eights

### Batch 2:
12, 13, 22, 29 → Deuces Wild variants

### Batch 3:
19, 20, 21 → Multi-hand poker (same logic, different UI)

### Batch 4+:
Continue by phase order

---

## Technical Notes

### New paytable patterns needed:
- **Kicker bonus**: quads pay more with specific kicker card (e.g., Four Aces + 2/3/4 kicker)
- **Wild joker**: 53-card deck with joker
- **Multi-hand**: share initial deal, independent draws
- **Multiplier overlay**: post-result multiplier applied to win

### Files to create per game:
`games/[game-name].html` — self-contained HTML (same pattern as existing games)

### Index.html updates:
- Add new game cards in category groups (Standard / Wild / Bonus / Multi-hand / Exotic)
