# Crash or Cash 产品开发计划（基于 247 Games 流量矩阵）

> 版本：v1.0  
> 日期：2026-03-04  
> 依据：你提供的 SimilarWeb 近 3 个月数据（247 系列）

---

## 1. 战略目标（先产品、后流量）

### 北极星目标（6 个月）
1. 建立可复用的游戏引擎体系（不是单个游戏项目）
2. 形成「高流量基础盘 + 高CPC变现盘」双引擎
3. 支持 AI 辅助快速复制竞品：新游戏从立项到上线 ≤ 7 天

### 双引擎策略
- **流量盘（Volume）**：Solitaire / Mahjong / Sudoku / FreeCell / Hearts
- **变现盘（Revenue）**：Poker / Blackjack / Roulette / Slots / Video Poker

---

## 2. 产品组合优先级（按你的数据）

## 2.1 P0（立即做，0-30天）

### P0-A：Solitaire 引擎 + 3个变体
- **目标游戏**：Klondike、Spider（1花色起）、Yukon/Scorpion 二选一
- **原因**：纸牌类是 38.7% 大盘；Solitaire 单品月均 439万
- **技术收益**：后续 FreeCell/Hearts/Spades 可复用 60%+ 组件

### P0-B：Sudoku（含难度系统）
- **目标游戏**：4档难度 + 每日挑战
- **原因**：开发简单、时长长、广告可见时间高
- **技术收益**：Puzzle 框架可复用到 Word/Crossword

### P0-C：Mahjong（连连看型）
- **目标游戏**：经典布局 + 计时模式
- **原因**：月均 283万，且中文市场天然优势
- **技术收益**：Tile 系统可复用到后续匹配类玩法

---

## 2.2 P1（30-60天）

### P1-A：FreeCell（复用 Solitaire 内核）
- **原因**：月均 155万，边际成本极低
- **预期**：上线速度快，承接纸牌长尾词

### P1-B：Hearts / Spades（二选一先上 Hearts）
- **原因**：Windows 经典盘，老用户稳定
- **注意**：先做单机 AI，后续再加多人

### P1-C：Poker（高CPC）
- **原因**：Casino 类流量不大，但 CPC 高
- **策略**：先做单机快节奏版，后续加变体（Texas / Draw）

---

## 2.3 P2（60-90天）

### P2-A：Backgammon（谨慎）
- **流量高**，但中文认知较弱；先做 MVP 验证再加深

### P2-B：WordSearch / Crossword（SEO 补位）
- 利于长尾覆盖，开发成本低，广告稳定

### P2-C：Casino 扩展
- 将已有 Blackjack / Roulette / Slots / Video Poker 做内容化、策略页化、主题化版本

---

## 3. 研发架构（AI 时代必须模块化）

## 3.1 引擎分层
1. **Core Layer**
   - RNG、计分、状态机、回合控制、存档协议
2. **Game Logic Layer**
   - Card Engine（洗牌/发牌/判型）
   - Puzzle Engine（生成器/难度器）
   - Board Engine（落子/规则/AI）
3. **UI Shell Layer**
   - 响应式布局、广告位、SEO 区块、事件埋点
4. **Ops Layer**
   - A/B 开关、配置中心、版本灰度

## 3.2 配置驱动原则
每个游戏都拆成配置：
- rules.json
- paytable.json（若有）
- seo-content.md
- ui-theme.json

目标：**新游戏=复用引擎+替换配置**。

---

## 4. 90天交付排期（建议）

## Sprint 1-2（第1-2周）
- 搭建 Solitaire Core
- 完成 Klondike 上线
- 建立统一事件埋点（start/restart/win/exit/ad-view）

## Sprint 3-4（第3-4周）
- 上线 Spider（1花色）
- 上线 Sudoku v1
- 完成首页分类导航（Card / Puzzle / Casino）

## Sprint 5-6（第5-6周）
- 上线 Mahjong v1
- 上线 FreeCell（复用 Solitaire）
- 接入每周自动竞品对标报告（Similarweb）

## Sprint 7-8（第7-8周）
- 上线 Hearts v1（单机）
- Poker v1（单机）
- 建立每个游戏的 SEO Landing 模板

## Sprint 9-10（第9-10周）
- 做 A/B：广告位、首屏布局、按钮密度
- 低表现页面重写与下线机制

## Sprint 11-12（第11-12周）
- P2 立项评审（Backgammon / WordSearch）
- 启动第二批增长型玩法

---

## 5. KPI 体系（按游戏类型）

### 共通 KPI
- D1 留存
- 平均时长
- 每次会话页数
- 广告可见率（viewability）
- eRPM

### 立项门槛（上线后14天）
- 日 UV > 300（自然流量）
- 平均时长 > 4 分钟
- 跳出率 < 60%
- 广告可见率 > 65%

### 淘汰/冻结条件
- 连续 21 天低于门槛
- 无关键词增长趋势
- 引擎复用价值低

---

## 6. 与现有 16 款游戏的整合原则

1. 保留已上线的高CPC Casino 游戏作为收入底盘
2. 新增高流量品类（Solitaire/Sudoku/Mahjong）作为流量入口
3. 首页做双入口：
   - 「热门休闲」(流量)
   - 「真钱风格」(变现)
4. 所有老游戏补齐：
   - 统一移动端体验
   - 统一广告位策略
   - 统一 SEO 区块模板

---

## 7. AI 协作开发流程（执行标准）

1. 竞品拆解 Agent：提取玩法/交互/信息结构
2. 规则实现 Agent：输出规则与状态机代码
3. UI 适配 Agent：桌面+移动双端样式
4. QA Agent：边界测试 + 自动回归
5. SEO Agent：页面文案与内链模板

交付要求：每个新游戏必须带
- `README`（规则+实现）
- `TESTS`（关键规则测试）
- `SEO BLOCK`（独立内容）

---

## 8. 本周可立即执行（Next Actions）

1. 立项 `Solitaire Core`（P0-A）
2. 拆分当前 Video Poker 为可复用 Card Engine 子模块
3. 建立 `games-manifest.json`（全站游戏配置清单）
4. 起草游戏模板脚手架（新游戏一天内可拉起）
5. 建立每周对标模板（cardgames.io / solitaired / 247 系列）

---

## 9. Cardgames.io 差异化产品线（新增）

> 目的：在复制 247 流量模型之外，补上 cardgames.io 的“经典牌类深度”优势，避免同质化。

### 9.1 值得纳入的特有游戏池

#### A) Trick-taking（高粘性）
- Euchre
- Oh Hell
- Pinochle
- Skat
- Whist

#### B) 经典多人纸牌
- Gin Rummy
- Canasta
- Cribbage
- Rummy
- Crazy Eights
- Spit
- War
- Go Fish

#### C) 接龙长尾变体（可模板化批量）
- Canfield
- Golf Solitaire
- Pyramid Solitaire
- Tri Peaks Solitaire
- Clock Solitaire
- Crescent Solitaire
- Addiction
- Kings in the Corners

### 9.2 新增优先级（在原 P0/P1/P2 之后）

#### P1.5（优先新增，30-60天并行）
1. Gin Rummy（中等开发难度，用户面最广）
2. Cribbage（北美高粘性）
3. Euchre（区域强势）
4. Canasta（家庭向长时长）

#### P2.5（60-90天）
- Pinochle / Skat / Whist / Oh Hell（择2先上）
- Pyramid / Tri Peaks / Golf（接龙变体批量发布）

### 9.3 模块复用设计

- `Card-Trick Engine`：出牌顺序、跟牌规则、吃墩计分
- `Meld Engine`：Rummy/Canasta 组牌与结算
- `Solitaire Variant Kit`：布局 + 发牌 + 过牌规则配置化

目标：每新增一个同类游戏，代码增量 < 30%。

### 9.4 三段式增长公式（最终版）

**总收益 =**
1) 流量入口（Solitaire + Sudoku + Mahjong + FreeCell）
2) 高CPC变现（Blackjack + Roulette + Slots + Poker）
3) 差异化留存（Gin Rummy + Cribbage + Euchre + Pinochle + Skat + 长尾Solitaire）

---

## 结论

你的方向完全正确：**先产品矩阵，再增长放大**。  
按照该路线，Crash or Cash 将从“单项目开发”升级为“游戏工厂”，并且通过 cardgames.io 式经典牌类深度建立差异化护城河。