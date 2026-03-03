# Video Poker 规则对照清单（iOS vs Web）

日期：2026-03-03
分支：`v9-next`

## 审核范围
- Web: `games/*.html` 10个变体
- iOS: `yoda-ltd/videopoker-ios`（重点核查 `feature/top-menu-layout-optimization`）

## 先说结论
- ✅ **Jacks or Better**：基本对齐
- ⚠️ **Deuces Wild**：已修复“2作为Wild可成牌”，但**整体仍未完全对齐 iOS 规则**
- ⚠️ **Bonus Poker**：赔率主框架接近，但**未实现 iOS 的特殊四条分类（Aces / 2-4 / 其他）**
- ❓ 其余7个变体：在 iOS 当前可查配置中没有完整规则实现（仅看到大量生成视图/命名），因此只能算“名称对齐”，不是“规则已对齐”

---

## 1) iOS 侧可确认的规则来源

### A. Jacks / Deuces / Bonus 的正式配置
- `videopoker/Core/VideoPokerGameConfiguration.swift`
  - 注册配置：`jacksOrBetter`, `deucesWild`, `bonusPoker`
- `videopoker/Core/ExtendedPayoutCalculators.swift`
  - `DeucesWildPayoutCalculator`
  - `BonusPokerPayoutCalculator`
- `videopoker/Core/DeucesWildHandEvaluator.swift`
  - 明确 Deuces Wild 的牌型体系（Natural Royal / Four Deuces / Wild Royal / Five of a Kind ...）

### B. 你提到的 Nines or Better / 更多变体
- 在 `Views/Generated/*` 能看到命名（如 `Ninesorbetter...`）
- 但在当前可查“正式规则配置”里，未找到对应完整 evaluator + payout config 的明确实现（至少不是和上面3个一样可直接落地的配置路径）

---

## 2) Web 10个页面规则检查结果

| 变体 | 页面存在 | 玩法门槛 | Wild逻辑 | 赔率对齐 iOS | 结论 |
|---|---:|---|---|---|---|
| Jacks or Better | ✅ | JQKA 对子 | 无 | 基本一致 | ✅ 可用 |
| Deuces Wild | ✅ | JQKA 对子（占位） | 2为Wild（已实现） | **不一致**（iOS有独立牌型） | ⚠️ 需深修 |
| Bonus Poker | ✅ | JQKA 对子 | 无 | 部分不一致 | ⚠️ 需深修 |
| Double Bonus Poker | ✅ | JQKA 对子 | 无 | iOS缺正式对照配置 | ❓ 待确认 |
| Double Double Bonus | ✅ | JQKA 对子 | 无 | iOS缺正式对照配置 | ❓ 待确认 |
| Bonus Poker Deluxe | ✅ | JQKA 对子 | 无 | iOS缺正式对照配置 | ❓ 待确认 |
| Nines or Better | ✅ | 9+ 对子（已实现） | 无 | iOS侧规则源不完整 | ⚠️ 名称对齐、规则待证 |
| Tens or Better | ✅ | 10+ 对子（已实现） | 无 | iOS侧规则源不完整 | ⚠️ 名称对齐、规则待证 |
| Joker Wild Poker | ✅ | JQKA 对子（占位） | Joker为Wild（已实现） | iOS侧规则源不完整 | ⚠️ 需定义正式牌型 |
| Triple Double Bonus | ✅ | JQKA 对子 | 无 | iOS侧规则源不完整 | ❓ 待确认 |

---

## 3) 你指出的 Deuces Wild 问题（已修）

问题：`2 + 2 + K` 未判定为 Three of a Kind

状态：✅ 已修复
- 已加入 `WILD_MODE='deuces'`
- 评估时把 `2` 当作 wildcard，搜索最优成牌
- 实测该案例现在返回 `Three of a Kind`

---

## 4) 当前仍存在的关键偏差（必须修）

### Deuces Wild（核心偏差）
iOS 规则是独立牌型体系，至少包括：
- Natural Royal Flush
- Four Deuces
- Wild Royal Flush
- Five of a Kind
- Straight Flush
- Four of a Kind
- Full House
- Flush
- Straight
- Three of a Kind

而 Web 当前还是“Jacks框架 + Wild补丁”，**牌型与赔率体系不完整**。

### Bonus Poker（核心偏差）
iOS 有特殊四条分类：
- Four Aces
- Four 2s/3s/4s
- Other Four of a Kind

Web 当前把四条合并，未分档。

---

## 5) 建议的修复优先级（按价值）

1. **Deuces Wild 全量对齐（最高优先）**
   - 新建独立 evaluator，不复用 Jacks evaluator
   - 实装 iOS 同级牌型与赔率表

2. **Bonus Poker 全量对齐**
   - 四条分档赔率
   - BET5 特殊奖励逻辑核对

3. **其余7变体先做“可验证规则清单”**
   - 若 iOS 仓库有明确规则源：按源实现
   - 若 iOS 无明确规则源：先冻结页面为“占位玩法”，避免误导“已对齐”

---

## 6) 我对本次审核的结论（一句话）

**现在这10个页面是“菜单与框架已成型”，但“严格规则对齐”只完成了部分（Jacks基本OK、Deuces关键问题已修一条），离“全部按 iOS 规则逐个一致”还有明显差距。**
