# Task: Build Video Poker Web Game (Jacks or Better)

## Reference
The file `VideoPokerComplete.swift` contains the complete iOS game logic. Port it to a modern web game.

## Goal
Build a single HTML5 video poker game: **Jacks or Better**, modeled after:
- Game logic: VideoPokerComplete.swift (Swift → JavaScript)
- Visual style: cardgames.io (clean, simple, no login, instant play)
- Target: SEO-friendly standalone page, works on mobile + desktop

## Tech Stack
- **Single file**: `index.html` with embedded CSS + JS (no build step, pure static)
- **Card rendering**: Use CSS for card faces (suits + ranks as text, styled divs) — no images needed initially
- **No frameworks**: Vanilla JS only (like cardgames.io original approach)
- **No backend**: All state in memory / localStorage

## Game Spec (from Swift source)

### States
1. `betting` — show BET 1 (100 credits) / BET 5 (500 credits) / MAX BET buttons
2. `selectHold` — 5 cards shown, click to toggle HOLD, then DRAW button
3. `gameOver` — show result, WIN amount, DEAL AGAIN button

### Cards
- 52 cards: 4 suits × 13 ranks (A 2 3 4 5 6 7 8 9 10 J Q K)
- Hearts ♥ / Diamonds ♦ = red; Clubs ♣ / Spades ♠ = black

### Hand Evaluation (port exactly from Swift)
- Royal Flush: 10 J Q K A same suit
- Straight Flush: 5 consecutive same suit
- Four of a Kind
- Full House
- Flush
- Straight (including A-2-3-4-5 and 10-J-Q-K-A)
- Three of a Kind
- Two Pair
- Jacks or Better: pair of J, Q, K, or A only

### Payout Table (BET 1 / BET 5)
| Hand | BET 1 | BET 5 |
|------|-------|-------|
| Royal Flush | 250 | **4000** (special jackpot!) |
| Straight Flush | 50 | 250 |
| Four of a Kind | 25 | 125 |
| Full House | 9 | 45 |
| Flush | 6 | 30 |
| Straight | 4 | 20 |
| Three of a Kind | 3 | 15 |
| Two Pair | 2 | 10 |
| Jacks or Better | 1 | 5 |

Note: BET 1 means betting 1 credit; BET 5 = 5 credits. These are standard casino payout multipliers (not the Swift iOS version's multipliers).

### Starting Credits
1000 credits (localStorage persisted)

## Visual Design
- **Background**: Dark blue/navy casino feel (#0a1628 or similar)
- **Layout**: Desktop centered, mobile-friendly
  - Top: Payout table (compact, highlighted winning row)
  - Middle: 5 card slots, large and clear
  - Bottom: credits display + action buttons
- **Cards**: 
  - White/cream background
  - Large rank + suit symbol centered
  - Red for hearts/diamonds, black for clubs/spades
  - "HELD" banner when selected (yellow/gold overlay)
  - Deal animation: cards flip in one by one
- **Buttons**: Casino-style, gradient colors
  - BET 1: blue gradient
  - BET 5 / MAX BET: gold/yellow gradient  
  - DEAL / DRAW: green gradient
  - HOLD toggle: highlighted border

## SEO Requirements
- `<title>`: "Jacks or Better Video Poker - Play Free Online | No Download"
- `<meta description>`: "Play free Jacks or Better video poker online. No download, no registration. Classic casino video poker in your browser."
- `<h1>` visible on page: "Jacks or Better Video Poker"
- Add rules section below the game (for SEO content)
- Schema.org markup for Game type

## File Structure
Just ONE file: `index.html`

## Quality Bar
- Must be actually fun to play (smooth animations, satisfying feedback)
- Winning hands: show flash/glow animation on winning cards
- Royal Flush: special celebration effect
- Sound: skip for now
- Mobile: cards must be touch-friendly (large enough tap targets)

When completely done, run:
openclaw system event --text "Done: Video Poker web game built at ~/Projects/videopoker-web/index.html" --mode now
