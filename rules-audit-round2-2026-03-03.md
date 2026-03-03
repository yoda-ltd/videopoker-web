# Round 2 Rules Alignment Audit (iOS → Web)

Date: 2026-03-03
Branch: v9-next

## Scope
Second-pass validation for 10 web variants against iOS rule intent (family-level engines: Jacks/Bonus/Deuces/Joker).

## Key fixes in Round 2
1. **Joker Wild fallback fixed**
   - If no joker card is present, evaluator now uses `Kings or Better` classic threshold directly.
   - Prevents false `No Win` for plain `KKxxx` hands.

2. **Regression pass completed** on critical scenarios:
   - Deuces Wild `2,2,K,7,9` ⇒ `Three of a Kind`
   - Deuces Wild `2,2,2,2,9` ⇒ `Four Deuces`
   - Deuces Wild natural royal (no wild) ⇒ `Natural Royal Flush`
   - Bonus Poker `AAAAx` ⇒ `Four Aces`
   - Bonus Poker `2222x` ⇒ `Four 2s-4s`
   - Nines or Better pair 9s ⇒ `Nines or Better`
   - Tens or Better pair 9s ⇒ `No Win`
   - Joker Wild pair Kings (no joker present) ⇒ `Kings or Better`

Result: **8/8 test cases PASS**

## Variant status (Round 2)
- Jacks or Better: PASS (core)
- Deuces Wild: PASS (core wild behavior + top categories)
- Bonus Poker family: PASS (quad split categories)
- Nines/Tens thresholds: PASS
- Joker Wild core threshold: PASS

## Remaining work (Round 3 candidate)
- Full exhaustive parity suite for edge hand ties/ordering (all 10 variants)
- Add browser-playable hidden QA panel for deterministic hand injection
- Snapshot payout-table parity export (csv) vs iOS calculators
