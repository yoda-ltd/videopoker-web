import Foundation
import SwiftUI

// MARK: - PlayingCard Data Model
struct PlayingCard: Identifiable {
    let id = UUID()
    let suit: String // "hearts", "diamonds", "clubs", "spades"
    let rank: String // "A", "2"..."10", "J", "Q", "K"
    
    var suitSymbol: String {
        switch suit {
        case "hearts": return "♥️"
        case "diamonds": return "♦️"
        case "clubs": return "♣️"
        case "spades": return "♠️"
        default: return "?"
        }
    }
    
    var color: Color {
        switch suit {
        case "hearts", "diamonds":
            return .red
        case "clubs", "spades":
            return .black
        default:
            return .black
        }
    }
    
    var value: Int {
        switch rank {
        case "A": return 1
        case "2": return 2
        case "3": return 3
        case "4": return 4
        case "5": return 5
        case "6": return 6
        case "7": return 7
        case "8": return 8
        case "9": return 9
        case "10": return 10
        case "J": return 11
        case "Q": return 12
        case "K": return 13
        default: return 0
        }
    }
}

// MARK: - Game States
enum VideoPokerGameState {
    case betting        // 下注阶段
    case selectHold     // 选择保留卡牌
    case gameOver       // 游戏结束
}

// MARK: - Game View Model
class GameViewModel: ObservableObject {
    static let shared = GameViewModel()
    
    @Published var credits: Int {
        didSet {
            UserDefaults.standard.set(credits, forKey: "videopoker_credits")
            print("💰 Credits changed: \(oldValue) -> \(credits)")
        }
    }
    
    private init() {
        // Load saved credits or start with default 1000
        let savedCredits = UserDefaults.standard.integer(forKey: "videopoker_credits")
        self.credits = savedCredits > 0 ? savedCredits : 1000
        print("🎯 GameViewModel initialized with \(credits) credits")
    }
    
    func addCredits(_ amount: Int) {
        credits += amount
    }
    
    func deductCredits(_ amount: Int) -> Bool {
        if credits >= amount {
            credits -= amount
            return true
        }
        return false
    }
    
    func resetCredits() {
        credits = 1000
    }
}

// MARK: - Video Poker Game States
enum VPState { 
    case betting, selectHold, gameOver 
}

// MARK: - Simple Video Poker Game Logic
@MainActor
class SimpleVideoPokerGame: ObservableObject {
    @Published var state = VPState.betting
    @Published var hand: [PlayingCard] = []
    @Published var held: Set<Int> = []
    @Published var message = ""
    @Published var result = ""
    @Published var winnings = 0
    @Published var currentBet = 0
    @Published var dealingAnimation = false
    @Published var cardAnimationStates: [Bool] = Array(repeating: false, count: 5)
    
    var gameViewModel: GameViewModel?
    private var deck: [PlayingCard] = []
    
    func startGame(_ gvm: GameViewModel, bet: Int) {
        guard gvm.credits >= bet else { 
            print("🚫 [VideoPoker] 余额不足: 需要\(bet), 当前\(gvm.credits)")
            return 
        }
        
        let beforeCredits = gvm.credits
        gvm.credits -= bet
        currentBet = bet
        
        print("🎰 [VideoPoker] 游戏开始")
        print("💰 [VideoPoker] 下注档位: \(bet == 100 ? "BET 1" : "BET 5") (\(bet) credits)")
        print("💰 [VideoPoker] Credits: \(beforeCredits) → \(gvm.credits) (扣除\(bet))")
        
        // 重置状态
        held.removeAll()
        result = ""
        winnings = 0
        cardAnimationStates = Array(repeating: false, count: 5)
        
        // 创建牌组
        deck = createDeck().shuffled()
        hand = Array(deck.prefix(5))
        deck.removeFirst(5)
        
        print("🎴 [VideoPoker] 发牌完成: \(hand.map { "\($0.rank)\($0.suitSymbol)" }.joined(separator: " "))")
        
        // 🎬 启动发牌动画
        dealingAnimation = true
        startDealingAnimation()
        
        state = .selectHold
    }
    
    func toggleHold(_ index: Int) {
        let card = hand[index]
        
        if held.contains(index) {
            held.remove(index)
            print("🎯 [VideoPoker] 取消保留: \(card.rank)\(card.suitSymbol) (位置\(index))")
        } else {
            held.insert(index)
            print("🎯 [VideoPoker] 保留卡牌: \(card.rank)\(card.suitSymbol) (位置\(index))")
        }
        
        print("🎯 [VideoPoker] 当前保留: \(held.sorted().map { hand[$0].rank + hand[$0].suitSymbol }.joined(separator: " "))")
    }
    
    func drawCards() {
        print("🔄 [VideoPoker] 开始换牌")
        
        // 🎬 先播放换牌动画：隐藏要换的牌
        var cardsToChange: [Int] = []
        for i in 0..<5 {
            if !held.contains(i) {
                cardsToChange.append(i)
                withAnimation(.easeOut(duration: 0.2)) {
                    cardAnimationStates[i] = false
                }
            }
        }
        
        // 0.3秒后换牌并显示新牌
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            // 换牌
            var changedCards: [String] = []
            for i in cardsToChange {
                if !self.deck.isEmpty {
                    let oldCard = self.hand[i]
                    self.hand[i] = self.deck.removeFirst()
                    changedCards.append("位置\(i): \(oldCard.rank)\(oldCard.suitSymbol) → \(self.hand[i].rank)\(self.hand[i].suitSymbol)")
                }
            }
            
            print("🔄 [VideoPoker] 换牌详情: \(changedCards.joined(separator: ", "))")
            print("🎴 [VideoPoker] 最终手牌: \(self.hand.map { "\($0.rank)\($0.suitSymbol)" }.joined(separator: " "))")
            
            // 🎬 显示新牌动画 - 更紧凑
            for (index, i) in cardsToChange.enumerated() {
                DispatchQueue.main.asyncAfter(deadline: .now() + Double(index) * 0.08) {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                        self.cardAnimationStates[i] = true
                    }
                }
            }
            
            // 0.5秒后完成换牌和结算
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                self.evaluateAndFinish()
            }
        }
    }
    
    // 分离结算逻辑
    private func evaluateAndFinish() {
        let handType = evaluateHand()
        result = handType
        winnings = getWinnings(handType, bet: currentBet)
        
        print("🏆 [VideoPoker] 手牌类型: \(handType)")
        print("🏆 [VideoPoker] 下注金额: \(currentBet)")
        print("🏆 [VideoPoker] 奖金计算: \(winnings)")
        
        if winnings > 0 {
            let beforeCredits = gameViewModel?.credits ?? 0
            gameViewModel?.credits += winnings
            let afterCredits = gameViewModel?.credits ?? 0
            print("💰 [VideoPoker] Credits: \(beforeCredits) → \(afterCredits) (奖励+\(winnings))")
            
            // 特殊奖励提示
            if handType == "Royal Flush" && currentBet >= 500 {
                print("🎉 [VideoPoker] 🚨 MEGA JACKPOT! BET 5 Royal Flush特殊奖励!")
            }
        } else {
            print("😔 [VideoPoker] 无获奖手牌")
        }
        
        state = .gameOver
    }
    
    func reset() {
        state = .betting
        hand.removeAll()
        held.removeAll()
        result = ""
        winnings = 0
        currentBet = 0
        dealingAnimation = false
        cardAnimationStates = Array(repeating: false, count: 5)
    }
    
    private func createDeck() -> [PlayingCard] {
        var cards: [PlayingCard] = []
        let suits = ["hearts", "diamonds", "clubs", "spades"]
        let ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
        
        for suit in suits {
            for rank in ranks {
                cards.append(PlayingCard(suit: suit, rank: rank))
            }
        }
        return cards
    }
    
    private func evaluateHand() -> String {
        let ranks = hand.map { $0.rank }
        let suits = hand.map { $0.suit }
        
        let rankCounts = Dictionary(grouping: ranks, by: { $0 }).mapValues { $0.count }
        let counts = rankCounts.values.sorted(by: >)
        
        let isFlush = Set(suits).count == 1
        let isStraight = checkStraight(ranks)
        
        if isFlush && isStraight && Set(ranks) == Set(["10", "J", "Q", "K", "A"]) {
            return "Royal Flush"
        } else if isFlush && isStraight {
            return "Straight Flush"
        } else if counts == [4, 1] {
            return "Four of a Kind"
        } else if counts == [3, 2] {
            return "Full House"
        } else if isFlush {
            return "Flush"
        } else if isStraight {
            return "Straight"
        } else if counts == [3, 1, 1] {
            return "Three of a Kind"
        } else if counts == [2, 2, 1] {
            return "Two Pair"
        } else if counts == [2, 1, 1, 1] {
            let pairRank = rankCounts.first { $0.value == 2 }?.key
            if pairRank == "J" || pairRank == "Q" || pairRank == "K" || pairRank == "A" {
                return "Jacks or Better"
            }
        }
        return "No Pair"
    }
    
    private func checkStraight(_ ranks: [String]) -> Bool {
        let values: [String: Int] = ["A": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, "J": 11, "Q": 12, "K": 13]
        let sorted = ranks.compactMap { values[$0] }.sorted()
        
        // A-2-3-4-5
        if sorted == [1, 2, 3, 4, 5] { return true }
        // 普通顺子
        if sorted.count == 5 && sorted == Array(sorted[0]...sorted[0]+4) { return true }
        // 10-J-Q-K-A
        if Set(sorted) == Set([1, 10, 11, 12, 13]) { return true }
        
        return false
    }
    
    private func getWinnings(_ handType: String, bet: Int) -> Int {
        // 97% RTP赔率倍数
        let multipliers: [String: Double] = [
            "Royal Flush": 750.0,      // 最高奖
            "Straight Flush": 45.0,
            "Four of a Kind": 22.0,
            "Full House": 8.0,
            "Flush": 5.0,
            "Straight": 4.0,
            "Three of a Kind": 3.0,
            "Two Pair": 2.0,
            "Jacks or Better": 1.0
        ]
        
        // 特殊处理：BET 5时Royal Flush有额外奖励
        if handType == "Royal Flush" && bet >= 500 {
            print("💎 [VideoPoker] 🎰 Royal Flush + BET 5 = MEGA JACKPOT!")
            print("💎 [VideoPoker] 特殊计算: \(bet) × 800 = \(bet * 800)")
            return bet * 800  // BET 5时额外奖励
        }
        
        let multiplier = multipliers[handType] ?? 0.0
        let payout = Int(Double(bet) * multiplier)
        
        print("💎 [VideoPoker] 赔率计算: \(handType)")
        print("💎 [VideoPoker] 倍数: \(multiplier)x")
        print("💎 [VideoPoker] 计算: \(bet) × \(multiplier) = \(payout)")
        
        return payout
    }
    
    // 🎬 发牌动画方法 - 紧凑版本
    private func startDealingAnimation() {
        // 依次显示每张牌，间隔0.08秒（紧凑快速）
        for i in 0..<5 {
            DispatchQueue.main.asyncAfter(deadline: .now() + Double(i) * 0.08) {
                withAnimation(.spring(response: 0.25, dampingFraction: 0.85)) {
                    self.cardAnimationStates[i] = true
                }
            }
        }
        
        // 0.6秒后结束动画状态
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
            self.dealingAnimation = false
        }
    }
}

// MARK: - Payout Table Row
struct PayoutTableRow: View {
    let hand: String
    let bet1: String
    let bet5: String
    let isHighlighted: Bool
    
    var body: some View {
        HStack(spacing: 0) {
            Text(hand)
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(isHighlighted ? .black : .white)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.leading, 10)
            
            Text(bet1)
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(isHighlighted ? .black : .white)
                .frame(width: 80, alignment: .trailing)
            
            Text(bet5)
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(isHighlighted ? .black : (hand == "ROYAL FLUSH" ? .red : .white))
                .frame(width: 80, alignment: .trailing)
                .padding(.trailing, 10)
        }
        .frame(height: 16)
        .background(isHighlighted ? Color.yellow.opacity(0.9) : Color.clear)
        .overlay(
            Rectangle()
                .stroke(Color.gray.opacity(0.3), lineWidth: 0.5)
        )
    }
}

// MARK: - Premium Casino Button
struct PremiumCasinoButton: View {
    let title: String
    let width: CGFloat
    let height: CGFloat
    let gradientColors: [Color]
    let shadowColor: Color
    let disabled: Bool
    let action: () -> Void
    
    @State private var isPressed = false
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(disabled ? .gray : .white)
                .frame(width: width, height: height)
                .background(
                    ZStack {
                        // 外层发光效果
                        RoundedRectangle(cornerRadius: 12)
                            .fill(
                                LinearGradient(
                                    colors: disabled ? [.gray.opacity(0.3), .gray.opacity(0.1)] : gradientColors,
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .blur(radius: disabled ? 0 : (isPressed ? 2 : 4))
                            .opacity(disabled ? 0.3 : (isPressed ? 0.6 : 0.8))
                        
                        // 主体按钮
                        RoundedRectangle(cornerRadius: 10)
                            .fill(
                                LinearGradient(
                                    colors: disabled ? [.gray.opacity(0.4), .gray.opacity(0.2)] : gradientColors,
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .overlay(
                                // 高光效果
                                RoundedRectangle(cornerRadius: 10)
                                    .stroke(
                                        LinearGradient(
                                            colors: disabled ? [.clear] : [.white.opacity(0.6), .clear, .clear, shadowColor.opacity(0.3)],
                                            startPoint: .topLeading,
                                            endPoint: .bottomTrailing
                                        ),
                                        lineWidth: 1.5
                                    )
                            )
                            .overlay(
                                // 内层高光
                                RoundedRectangle(cornerRadius: 8)
                                    .stroke(disabled ? .clear : .white.opacity(0.3), lineWidth: 1)
                                    .padding(1)
                            )
                    }
                )
                .scaleEffect(disabled ? 0.95 : (isPressed ? 0.92 : 1.0))
                .shadow(
                    color: disabled ? .clear : shadowColor.opacity(0.5),
                    radius: isPressed ? 2 : 8,
                    x: 0,
                    y: isPressed ? 1 : 4
                )
                .shadow(
                    color: disabled ? .clear : .black.opacity(0.3),
                    radius: isPressed ? 1 : 4,
                    x: 0,
                    y: isPressed ? 0.5 : 2
                )
        }
        .disabled(disabled)
        .scaleEffect(disabled ? 0.9 : 1.0)
        .opacity(disabled ? 0.5 : 1.0)
        .animation(.spring(response: 0.3, dampingFraction: 0.6), value: isPressed)
        .animation(.easeInOut(duration: 0.2), value: disabled)
        .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity, pressing: { pressing in
            isPressed = pressing
        }, perform: {})
    }
}

// MARK: - Original Video Poker Game (Legacy)
@MainActor  
class VideoPokerGame: ObservableObject {
    @Published var gameState: VideoPokerGameState = .betting
    @Published var playerHand: [PlayingCard] = []
    @Published var heldCards: Set<Int> = []
    @Published var message = "Welcome to Video Poker!"
    @Published var resultMessage = ""
    @Published var winnings = 0
    @Published var currentBet = 0
    
    // 游戏数据
    var gameViewModel: GameViewModel?
    private var deck: [PlayingCard] = []
    
    func startNewGame(bet: Int) {
        guard let gameViewModel = gameViewModel else { return }
        guard bet <= gameViewModel.credits else {
            message = "Not enough credits!"
            return
        }
        
        // 扣除下注
        gameViewModel.credits -= bet
        currentBet = bet
        
        // 重置状态
        heldCards.removeAll()
        resultMessage = ""
        winnings = 0
        
        // 创建和洗牌
        createDeck()
        shuffleDeck()
        
        // 发初始5张牌
        playerHand = Array(deck.prefix(5))
        deck.removeFirst(5)
        
        gameState = .selectHold
        message = "Select cards to hold, then draw new cards"
        
        print("🎴 [VideoPoker] 新游戏开始，下注: \(bet)")
    }
    
    func toggleHold(_ index: Int) {
        guard gameState == .selectHold else { return }
        
        if heldCards.contains(index) {
            heldCards.remove(index)
        } else {
            heldCards.insert(index)
        }
        
        print("🎯 [VideoPoker] 保留卡牌: \(heldCards.sorted())")
    }
    
    func drawNewCards() {
        guard gameState == .selectHold else { return }
        
        // 换掉未保留的牌
        for i in 0..<playerHand.count {
            if !heldCards.contains(i) {
                if !deck.isEmpty {
                    playerHand[i] = deck.removeFirst()
                }
            }
        }
        
        // 评估手牌并结算
        evaluateHandAndPayout()
        gameState = .gameOver
        
        print("🎴 [VideoPoker] 换牌完成，最终手牌: \(playerHand.map { "\($0.rank)\($0.suitSymbol)" })")
    }
    
    func resetGame() {
        gameState = .betting
        playerHand.removeAll()
        heldCards.removeAll()
        message = "Place your bet to start!"
        resultMessage = ""
        winnings = 0
        currentBet = 0
    }
    
    private func createDeck() {
        deck.removeAll()
        let suits: [(String, String, Color)] = [
            ("♠️", "spades", .black),
            ("♥️", "hearts", .red),
            ("♦️", "diamonds", .red),
            ("♣️", "clubs", .black)
        ]
        let ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
        
        for suit in suits {
            for rank in ranks {
                let card = PlayingCard(
                    suit: suit.1,
                    rank: rank
                )
                deck.append(card)
            }
        }
    }
    
    private func shuffleDeck() {
        deck.shuffle()
    }
    
    private func evaluateHandAndPayout() {
        let handType = evaluateHand(playerHand)
        let payout = getPayoutForHand(handType, bet: currentBet)
        
        resultMessage = handType
        winnings = payout
        
        if winnings > 0 {
            gameViewModel?.credits += winnings
            message = "You won \(winnings) credits!"
        } else {
            message = "Better luck next time!"
        }
        
        print("🏆 [VideoPoker] \(handType) - 奖金: \(winnings)")
    }
    
    // 简化的手牌评估
    private func evaluateHand(_ hand: [PlayingCard]) -> String {
        let ranks = hand.map { $0.rank }
        let suits = hand.map { $0.suit }
        let rankCounts = Dictionary(grouping: ranks, by: { $0 }).mapValues { $0.count }
        let counts = rankCounts.values.sorted(by: >)
        
        // 检查同花
        let isFlush = Set(suits).count == 1
        
        // 检查顺子
        let isStraight = checkStraight(ranks)
        
        // 简化的手牌类型判断
        if isFlush && isStraight {
            return "Straight Flush"
        } else if counts == [4, 1] {
            return "Four of a Kind"
        } else if counts == [3, 2] {
            return "Full House"
        } else if isFlush {
            return "Flush"
        } else if isStraight {
            return "Straight"
        } else if counts == [3, 1, 1] {
            return "Three of a Kind"
        } else if counts == [2, 2, 1] {
            return "Two Pair"
        } else if counts == [2, 1, 1, 1] {
            // 检查是否是Jacks or Better
            let pairRank = rankCounts.first { $0.value == 2 }?.key
            if pairRank == "J" || pairRank == "Q" || pairRank == "K" || pairRank == "A" {
                return "Jacks or Better"
            } else {
                return "Low Pair"
            }
        } else {
            return "High Card"
        }
    }
    
    private func checkStraight(_ ranks: [String]) -> Bool {
        let rankValues: [String: Int] = [
            "A": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7,
            "8": 8, "9": 9, "10": 10, "J": 11, "Q": 12, "K": 13
        ]
        
        let values = ranks.compactMap { rankValues[$0] }.sorted()
        
        // 检查连续5个数字
        if values == Array(values[0]...values[0]+4) {
            return true
        }
        
        // 检查A-10-J-Q-K (高位A)
        if Set(values) == Set([1, 10, 11, 12, 13]) {
            return true
        }
        
        return false
    }
    
    // 简化的赔率表（97% RTP调整）
    private func getPayoutForHand(_ handType: String, bet: Int) -> Int {
        let multipliers: [String: Double] = [
            "Royal Flush": 750.0,      // 调整后97% RTP
            "Straight Flush": 45.0,
            "Four of a Kind": 22.0,
            "Full House": 8.0,
            "Flush": 5.0,
            "Straight": 4.0,
            "Three of a Kind": 3.0,
            "Two Pair": 2.0,
            "Jacks or Better": 1.0,
            "Low Pair": 0.0,           // 不赔付
            "High Card": 0.0           // 不赔付
        ]
        
        let multiplier = multipliers[handType] ?? 0.0
        return Int(Double(bet) * multiplier)
    }
}