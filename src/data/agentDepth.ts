import type { Lesson } from "./lessons";

export const agentDepthLessons: Lesson[] = [
  {
    id: "mcts-uct-search",
    source: {
      label: "Kocsis & Szepesvári: Bandit based Monte-Carlo Planning (2006)",
      url: "https://sites.ualberta.ca/~szepesva/papers/ecml06.pdf",
    },
    title: "MCTS 与 UCT：把计算预算花在哪条分支？",
    englishTitle: "Monte Carlo Tree Search, UCT and Value Backup",
    category: "reasoning",
    level: "进阶",
    duration: "31 分钟",
    icon: "♧",
    summary:
      "沿 selection、expansion、simulation、backup 四步手算树统计量，理解探索分数、估计回报与最终执行动作为什么不是同一个量。",
    intuition:
      "你只有十次试走机会，不能把每条迷宫路线全部走完。MCTS 一边模拟，一边把更多预算分给有希望或还没看清的分支；多试一条路线，是为改善决策，不代表已经在真实世界执行它。",
    core: "输入是当前 state、可用 actions、可采样的 transition/reward model、horizon 与预算；输出为 root action 及搜索统计。Node/edge 维护 visit count N、累计 return W 和 Q=W/N。UCT 用平均回报加 exploration bonus 选择下一次模拟分支。本课使用单一决策者、有限 horizon、[0,1] return 的 toy；不进行神经网络训练。MuZero 则额外学习 representation/dynamics/value，常用带 policy prior 的搜索规则，不能将 UCT 与所有 MCTS 实现等同。",
    equation:
      "UCT(s,a)=Q(s,a)+c√[ln N(s)/N(s,a)]; W←W+G; N←N+1; G_t=r_t+γG_{t+1}",
    mechanicsSteps: [
      "先定义 state identity、合法动作、terminal condition 与 return 视角。用模拟器展开 hypothetical transitions，不把一个想象结果当真实 tool observation。",
      "Selection：root 已访问 N=10；A 有 N_A=8、W_A=4.8、Q_A=.6，B 有 N_B=2、W_B=.8、Q_B=.4。统计量来自前十次模拟，是教学快照。",
      "令 c=1，A 的 UCT=.6+√(ln10/8)≈1.13649；B=.4+√(ln10/2)≈1.47298。因此选择 B 来继续搜索，即使它当前均值较低。",
      "Expansion：遇到未展开的合法动作，创建对应 edge/node；N=0 时先尝试未访问分支或用显式 infinity priority，不直接计算除零。",
      "Simulation：从新 leaf 用 rollout policy 采样到 terminal，或在 depth limit 用 value estimate。此例得到 G=.9；它是模拟的一次 return，不是成功概率，也不是已证明的最优值。",
      "Backup：经过 B 的路径更新一次，N_B=3、W_B=1.7、Q_B=1.7/3≈.566667，root N=11。多步奖励需沿路径反向算 G_t=r_t+γG_{t+1}，不能每层重复加入同一 reward。",
      "重复直到 simulation count 或 wall-time budget 耗尽。两人零和游戏需一致的 player perspective/符号变换；stochastic environment 要采样 chance outcomes，不能把偶然好结果视为确定路径。",
      "结束后用预先声明的 root rule 选真实动作，例如 maximum visit count 或 maximum Q。此快照 max-visits 仍选 A；用于探索的 UCT 不能直接解释为最终动作概率。",
      "检查多个 seeds、预算曲线、真实环境回报与模型误差。更多模拟只改善当前 model 下的搜索，不能消除 simulator 的系统性错误；有限预算也没有自动最优保证。",
    ],
    whenToUse: [
      "有可信 simulator 或可采样 dynamics，分支很多且难以穷举时，用有限模拟预算做 online planning。",
      "需要理解 MuZero/AlphaZero 类系统的 search component，先把搜索与网络训练拆开。",
      "可以建立明确 terminal reward 与 state transitions 的游戏、资源规划或可验证程序搜索；优势是按需分配计算。",
    ],
    limits: [
      "只有自然语言猜测、没有可靠 transitions/reward 时，树变大可能放大模型错误。",
      "稀疏奖励、很深的有效路径和巨大 action branching 会使 rollout 预算消耗很快。",
      "UCT 的理论性质依赖问题与奖励条件；一次有限运行、任意 learned value 或任意 c 不自动获得同样保证。",
    ],
    howToUse: [
      "在可穷举的小树上先核对合法动作、return 与 root optimum，再加入采样。",
      "保存每次 selection 分数、leaf evaluation、backup path 和 root counts，确保同一次 rollout 不被重复记账。",
      "比较 uniform rollouts、UCT、固定 heuristic 与无搜索 policy，并固定模型访问和总时间预算。",
      "把 search simulations 与真实 environment actions 分开计数；在真实新 episodes 上评估最终 policy。",
    ],
    tuning: [
      "c 随 return scale 改变意义；先统一回报量纲，再比较 c=0、.5、1 等教学候选。",
      "Budget 增加但结果不改善时，检查 rollout bias、terminal handling 与重复状态，而非只继续加次数。",
      "Depth 增加会减少 truncation bias，也会增加采样方差和 model error；用独立 episodes 比较。",
    ],
    settings: [
      {
        name: "simulation / wall-time budget",
        start: "Toy 比较 16、64、256 次模拟，同时记录耗时。",
        adjust:
          "root action 已稳定但成本快速增长时减少预算；稀有有价值分支仍未访问时检查分支策略。",
      },
      {
        name: "exploration c",
        start: "return 缩放至 [0,1] 后对照 c=.5 与 1；c=0 作为纯利用反例。",
        adjust:
          "大量分支一次都未访问时检查冷启动与 c；低价值分支持续占预算时降低并复测。",
      },
      {
        name: "rollout horizon / discount",
        start: "小图先用完整 terminal rollout、γ=1，再测试 depth cap。",
        adjust:
          "短 horizon 漏掉延迟收益时扩大；长 rollout 不稳定时改善 leaf value 并检查 bias。",
      },
      {
        name: "backup / root action rule",
        start: "单人 toy 全程 root return，结束按 max-visits；同分用固定规则。",
        adjust:
          "切换两人游戏或不同根策略时重写 perspective tests，不能只沿用旧 backup。",
      },
    ],
    modifications: [
      "PUCT 把 policy prior 放进 exploration term；与 UCT 的 count-based bonus 分别验证，不混写公式。",
      "用 learned value 替代昂贵 rollout，分别测 value bias 与搜索收益。",
      "Transposition table 合并重复 states，需保留正确 path/state statistics；continuous actions 可研究 progressive widening。",
    ],
    pitfalls: [
      "把 UCT=1.47 解释为 147% 成功概率。",
      "执行动作时仍用 exploration bonus，又把它称为最优 action estimate。",
      "在多层 backup 中重复 reward，或在 adversarial game 中忘记切换 value perspective。",
    ],
    example:
      "Synthetic root N=10 的 A/B 快照中，c=1 选 B 继续模拟；G=.9 使 B 的 Q 从 .4 变成 .566667，而最大访问数的 root execution rule 仍选 A。它演示计算分配与执行决策的区别，不是任何模型的 benchmark。",
    compareTo: [
      "planning-search-astar",
      "multi-armed-bandit",
      "muzero",
      "model-based-rl",
    ],
  },
  {
    id: "contextual-bandits-linucb",
    source: {
      label:
        "Li, Chu, Langford & Schapire: A Contextual-Bandit Approach to Personalized News Article Recommendation (2010)",
      url: "https://www.schapire.net/papers/www10.pdf",
    },
    title: "LinUCB：为当前 context 选择值得探索的动作",
    englishTitle: "Contextual Bandits, Ridge Estimates and LinUCB",
    category: "reinforcement",
    level: "进阶",
    duration: "32 分钟",
    icon: "◉",
    summary:
      "把每个 arm 的平均数升级为依 context 变化的预测，逐步计算 ridge statistics、uncertainty bonus 与 feedback update，并检查 logged-policy support。",
    intuition:
      "给所有人推荐同一家餐厅只学到总体均值；若知道当前人偏爱哪类食物，可以按特征作预测。但一个很少给这类人试过的选项仍不确定，LinUCB 为这种未充分测量的方向留探索空间。",
    core: "输入是每轮各可用 arm 的 feature vector x_t,a、已选动作的 reward 与当前模型统计；输出为一个 action，观察反馈后更新对应 arm。Disjoint LinUCB 为每个 arm 保存 A_a=λI+Σxxᵀ、b_a=Σrx，ridge estimate θ_a=A_a⁻¹b_a。Score=预测均值+α×方向性 uncertainty。它假设 conditional expected reward 可由线性特征近似，不是概率分类器，也不估计动作改变长期状态后的完整 MDP return。",
    equation:
      "θ_a=A_a⁻¹b_a; score_a=x_aᵀθ_a+α√(x_aᵀA_a⁻¹x_a); A_a←A_a+x_ax_aᵀ; b_a←b_a+r x_a",
    mechanicsSteps: [
      "确定 context 在做决定前可见，feature dimension d=2；只观察 chosen arm 的 reward，不把未选 arm 的缺失 reward 写成 0。",
      "Toy λ=1。Arm A 已有三次 x=[1,0] 反馈，总 reward=2，所以 A_A=diag(4,1)、b_A=[2,0]；Arm B 尚未尝试，A_B=I、b_B=[0,0]。",
      "求解 θ_A=[.5,0]、θ_B=[0,0]。当前两个 arms 的 x 都为 [1,0]，预测均值分别 .5 与 0；这不是比较两种 context 的总体 click rate。",
      "方向性 uncertainty 为 √(xᵀA_A⁻¹x)=.5 与 √(xᵀA_B⁻¹x)=1。A 只在第一个 feature 方向获得测量，矩阵描述的信息不是一个全局 count。",
      "取 α=1.2，scores 为 A:.5+1.2×.5=1.1，B:0+1.2×1=1.2，因此选 B；α=.6 时 A=.8、B=.6，会选 A。Score 超过 1 完全可能，它不是 calibrated probability。",
      "收到 B 的真实 reward r=1：A_B′=diag(2,1)、b_B′=[1,0]，θ_B′=[.5,0]。同 context 下 uncertainty 变成 1/√2，score≈1.348528；未选 A 的统计不更新。",
      "换 context x=[0,1] 时，两 arms 均值仍为 0、uncertainty 都为 1；只测第一维不会自动学会第二维。若 feature scale 改变，λ 与 α 的相对含义也会改变。",
      "原始 argmax LinUCB 对给定 history 可是 deterministic policy，未选动作的 propensity 为 0。若教学加入 ε=.1、K=2 的 uniform exploration mixture，则 greedy arm probability=.95、另一 arm=.05；这是额外随机化，不是 UCB bonus 自带的概率。",
      "离线评估要保存当时 available arms、features、action、reward maturity 与真实 selection probability。不能在只有一个动作支持的日志上无条件评估另一个策略，也不能把延迟未到达 reward 当失败。",
    ],
    whenToUse: [
      "当前可见 context 影响即时 reward，且动作对未来状态的影响可忽略的个性化选择。",
      "标签只来自已采取动作，既要学预测也要主动收集信息；优势是轻量、可检查的在线线性 baseline。",
      "固定随机分配与 context-free bandit 已建立后，检验个性化是否带来真实收益。",
    ],
    limits: [
      "非线性 response、隐藏 confounding、强分布变化会使线性模型和 confidence interpretation 失配。",
      "若动作改变后续资源、健康状态或用户偏好，需要显式 sequential model，不能只最大化即时 reward。",
      "Disjoint models 不共享不同 arm 的参数，冷启动多且 arms 快速更换时可能低效。",
    ],
    howToUse: [
      "先冻结 context extraction 与 reward window，检查特征在决策时确实已知。",
      "用小维度矩阵手算一轮，生产实现用稳定 linear solve/Cholesky，避免反复直接求逆。",
      "比较 random、context-free、greedy linear 与 LinUCB；预算相同且按时间评估。",
      "记录实际 propensity 与可用动作集合，对 OPE 单独审查 support、反馈缺失与时间漂移。",
    ],
    tuning: [
      "α 较大鼓励信息不足的方向；若收益差先检查 reward scale 与 feature scaling，再改 exploration。",
      "λ 增大让 cold-start estimate 更收缩，并改变 bonus；不要把 λ 只看成一个数值稳定开关。",
      "Drift 时可比较 sliding window 或 discounting，但它们改变 estimator/理论条件，需时间回测。",
    ],
    settings: [
      {
        name: "ridge λ / feature scaling",
        start: "Toy d=2、λ=1，连续 feature 只用历史数据估计尺度。",
        adjust:
          "矩阵 ill-conditioned 或极端 feature 主导选择时核标准化、共线性与 regularization。",
      },
      {
        name: "exploration α",
        start: "Toy 对照 α=.6 与 1.2，记录每个 context slice 的选择次数。",
        adjust:
          "少见 context 从不尝试替代项时增大并监控成本；持续过度探索时缩小。",
      },
      {
        name: "randomization / propensity",
        start:
          "如实验需正 support，可另设 ε=.1 uniform mixture；准确记录 .95/.05 等实际概率。",
        adjust:
          "若权重极端或某些 eligible arms probability=0，先解决支持问题，不靠 estimator 美化。",
      },
      {
        name: "reward maturity / drift window",
        start:
          "例设固定 24h feedback window；只用已经成熟的 observations 更新比较。",
        adjust:
          "反馈速度随 arm 变化时分层检查 censoring；概念变化时用时间验证选择窗口。",
      },
    ],
    modifications: [
      "Hybrid LinUCB 同时使用 shared 与 arm-specific features，需要对应 block-matrix update。",
      "Linear Thompson Sampling 用参数 posterior sampling 探索，假设与 uncertainty 表达应另核对。",
      "非线性 representation 可先固定 encoder 再做线性 bandit；encoder 更新后应检查统计量与特征空间兼容性。",
    ],
    pitfalls: [
      "把 uncertainty bonus 当一个已经校准的选择概率记录。",
      "把未展示、未测量的 arm reward 填 0，制造反事实标签。",
      "按全量未来数据标准化 context，或把 reward 发生后的特征提前提供给 policy。",
    ],
    example:
      "Synthetic x=[1,0]、α=1.2：熟悉的 A score=1.1，未知 B score=1.2，故探索 B。B 收到 r=1 后 θ=[.5,0]；x=[0,1] 仍缺信息。它说明 exploration 是方向性的，不是‘样本多就处处确定’。",
    compareTo: [
      "multi-armed-bandit",
      "bayesian-updating",
      "off-policy-evaluation",
      "reinforcement-learning",
    ],
  },
  {
    id: "beam-search-decoding",
    source: {
      label:
        "Wu et al.: Google's Neural Machine Translation System — Section 7, beam scores and length normalization (2016)",
      url: "https://arxiv.org/abs/1609.08144",
    },
    title: "Beam Search：局部最大 token 为什么会错过更高分序列？",
    englishTitle: "Beam Search, Sequence Scores and Length Normalization",
    category: "sequence",
    level: "进阶",
    duration: "30 分钟",
    icon: "⋔",
    summary:
      "在已有 sampling 课之后，用两步反例比较 greedy 与 beam；再拆开累计 log probability、EOS、length normalization、finished hypotheses 与任务质量。",
    intuition:
      "两条路线第一段 A 稍顺，B 稍难；但 B 后面几乎一马平川。Greedy 一开始就丢掉 B，beam 暂留几个前缀，看到下一段再比较。它保留的是有限候选，不是穷举所有未来。",
    core: "输入为 autoregressive model 的 conditional logits、prompt、beam width B、score definition 与 stopping rule；输出为若干完成序列及其分数。原始 sequence log score 是每步 log probability 之和。Beam 每轮扩展 active prefixes，再保留全局 top-B hypotheses；B=1 在同等规则下为 greedy。Sampling 从分布抽样，beam 是有限宽度的 score search，二者并不优化同一个输出目标。",
    equation:
      "log P(y|x)=Σ_t log p(y_t|x,y_<t); toy score_α=log P(y|x)/L^α; larger is better",
    mechanicsSteps: [
      "固定 toy 两个内容 tokens 后接 probability=1 的 EOS，暂不做 length normalization。首 token P(A)=.6、P(B)=.4；这是小词表概率表，不是训练后的实际语言模型。",
      "下一步 A→x=.51、A→y=.49；B→x=.1、B→y=.9。每个条件分布分别归一化，不能把所有四条边一起当一份 next-token distribution。",
      "Greedy 第一步选 A，第二步选 x，完整 AxEOS probability=.6×.51×1=.306，log score≈−1.184170。首步 B 已永久剪掉。",
      "Beam width=2 首轮保留 A、B；下一轮展开 Ax=.306、Ay=.294、Bx=.04、By=.36，在四个候选中全局保留 By 与 Ax。",
      "EOS 后按同一 raw score 返回 ByEOS=.36，log≈−1.021651，高于 greedy 的 .306。这只证明此 toy 中 beam 找到更高 model probability，不证明内容更正确。",
      "比较不同长度会改变问题。另设已完成候选 short:P=.30,L=2 与 long:P=.24,L=4；α=0 时 short 的 log≈−1.203973 高于 −1.427116，α=1 时分数≈−.601986 与 −.356779，long 反而优先。这里 L 显式包括 EOS、排除 prompt。",
      "本课长度例用 logP/L^α；GNMT 原文另有 ((5+L)/6)^α 与 coverage term。Library 的 length_penalty、EOS 计数、beam finalization 可不同，不能只凭参数同名就说目标一致。",
      "将 active 与 finished hypotheses 分开；遇到首个 EOS 不意味着所有其它路径必然更差。若采用 early stopping，需要与实际 score 的上界/termination rule 一致，避免剪掉尚可能更好的长序列。",
      "固定 model、tokenizer、prompt、budget 比较 B=1/2/4 的 sequence score、task accuracy、length、latency 与 memory。扩大 beam 不保证全局最优，也不保证每次都提高最终 task quality。",
    ],
    whenToUse: [
      "翻译、转录、结构化转换等有明确输入约束，且多候选 search 可用任务指标验证。",
      "需要定位回答是 model distribution 本身偏好，还是 decoder 早期剪枝造成。",
      "想理解 constrained decoding、sequence-level objectives 与 search/learning 的区别；优势是显式保留多个前缀。",
    ],
    limits: [
      "有限 beam 会丢失潜在最优路径；更宽 beam 也不是 exhaustive search。",
      "Model probability 不等于事实正确或任务效用，扩大搜索可能更稳定地找到高概率但不合适的文本。",
      "Beam 的计算与 KV-cache 分支成本随宽度增长；开放式创作的多样性也可能下降。",
    ],
    howToUse: [
      "先用小概率树列出所有完成路径，核对 greedy、beam 和 exhaustive oracle。",
      "明确 raw score、length normalization、EOS/stop、finished-beam handling 与 token-count convention。",
      "在相同模型和任务集上比较 beam 与 sampling，报告所有设置及生成成本。",
      "对失败分别检查 premature EOS、重复、高概率空泛答案、tokenizer/template 错误与证据缺失。",
    ],
    tuning: [
      "先固定 α=0 比较 B，再固定 B 比较长度项，避免同时改变两个因素。",
      "答案过短不应直接无上限加 length penalty；先查 EOS 概率、数据和任务本来所需长度。",
      "输出高度相似时可研究 diverse beam 或 sampling，但 diversity 与正确性需分开测。",
    ],
    settings: [
      {
        name: "beam width B",
        start: "Toy B=1、2；任务验证从 1/2/4 小范围比较。",
        adjust:
          "更大 B 仅增加重复与成本时停止扩张；若 oracle candidate 好而 top1 差，检查 scoring。",
      },
      {
        name: "length normalization α",
        start: "先 raw log score α=0，再以本课约定比较 α=.5、1。",
        adjust:
          "short/long bias 出现时同时看任务质量和长度分布；移植 library 前核公式。",
      },
      {
        name: "EOS / max generated length",
        start:
          "Toy 固定 2 个内容 tokens+EOS；真实任务使用配套 EOS 并设明确预算。",
        adjust:
          "大量截断时检查 max_new_tokens 与 stop；大量空答时检查 EOS 和训练模板。",
      },
      {
        name: "finished hypotheses / stopping",
        start: "保留 finished candidates，toy 到固定 horizon 后统一比较。",
        adjust: "改变 score 后重测 early stopping，不能沿用原始 logP 的界。",
      },
    ],
    modifications: [
      "加入 grammar mask 限制合法 continuation，同时明确修改后的 scoring 与 renormalization。",
      "Diverse beam search 在候选间加 diversity term，产生不同目标，不等同更准确 likelihood search。",
      "以可执行 verifier rerank 完成候选，分别报告 candidate generation 与 verifier 的错误。",
    ],
    pitfalls: [
      "把每个前缀各保留 B 个后继，忘记随后全局 top-B，导致候选指数膨胀。",
      "混用 probabilities 的和与 log probabilities 的和。",
      "把 length-normalized score 当 normalized sequence probability，或用最好一例代替完整测试。",
    ],
    example:
      "Synthetic two-token tree：greedy 产生 Ax=.306，beam2 保留并最终选择 By=.36。另一个长度例中 raw P 偏好 short=.30，logP/L 偏好 long=.24；因此必须说明究竟优化什么 score。",
    compareTo: [
      "autoregressive-inference",
      "language-model-evaluation",
      "grammar-constrained-decoding",
      "speculative-decoding",
    ],
  },
  {
    id: "grammar-constrained-decoding",
    source: {
      label:
        "Scholak, Schucher & Bahdanau: PICARD — Parsing Incrementally for Constrained Auto-Regressive Decoding (2021)",
      url: "https://aclanthology.org/2021.emnlp-main.779/",
    },
    title: "Constrained Decoding：在生成时阻止不合法的下一步",
    englishTitle: "Grammar Masks, Incremental Parsing and Structured Outputs",
    category: "sequence",
    level: "进阶",
    duration: "31 分钟",
    icon: "{}",
    summary:
      "从两位 binary string 的 token mask 手算合法概率，再区分 prefix validity、完整 parse、schema compliance、语义正确与授权。",
    intuition:
      "填写一个只能输入两位 0/1 的格子，与先随便写一段话再检查是两回事。Constrained decoding 在每一步只开放能继续组成合法结果的选项，但它仍不知道你写的两位是不是题目的正确答案。",
    core: "输入为 model logits、当前 prefix、tokenizer 和 grammar/schema state；输出是受约束的 token 或显式失败。Incremental parser/FSM 判断哪些 token 的解码片段能继续形成合法输出。Sampling 可对允许集合重新归一化；beam-style constrained search 也可保留原 log scores 后屏蔽非法候选，其目标不同。PICARD 展示了逐步 parsing checks 对 text-to-SQL 的用途；本课完整小词表 mask 不是 PICARD 的具体 top-k SQL implementation。",
    equation:
      "p_mask(t|prefix)=p(t|prefix)·1[t∈Allowed(prefix)] / Σ_{u∈Allowed(prefix)}p(u|prefix); denominator>0",
    mechanicsSteps: [
      "Toy vocabulary 为 ['0','1','x','EOS']，grammar 为恰好两个 binary symbols 后 EOS。每个未完成内容位置的原始 probabilities=[.1,.2,.6,.1]；四个 token IDs 在这里恰好对应单个符号。",
      "在空 prefix，Allowed={'0','1'}；'x' 不属于语言，EOS 会过早结束。保留质量 Z=.1+.2=.3，mask 后 probabilities=[1/3,2/3,0,0]。",
      "若采到 '1'，prefix='1' 仍只开放 0/1；此例模型再次给同一概率表，因此第二位为 1 的概率仍为 2/3。Mask 是在当前 prefix 下重算，不是沿用旧 parser state。",
      "prefix='11' 后只允许 EOS；即使原始 EOS probability=.1，归一化后也是 1。完整 toy 输出 '11EOS' 的 masked probability=(2/3)²=4/9。",
      "每一步区分 prefix 可继续、完整 grammar acceptance 与 token budget。'1' 是合法 prefix，却不是完整输出；预算用完不能把未闭合 JSON 或半个 sequence 标记成功。",
      "真实 tokenizer 的一个 token 可能跨越标点、空格或多字符。应把 decoded token fragment 交给正确的 incremental parser，不能按 token name 只检查首字符，也不能假设一个 token 等于一个字符。",
      "若 Allowed 为空或所有允许项概率质量为 0，返回可诊断的 constraint failure，检查 grammar、模型支持、候选预截断与长度预算；不能除以 0 或悄悄取消约束。",
      "Local masking 通常不等于原模型在‘最终输出合法’事件上的全局条件分布。反例：首步 A/B 各 .5，A 后合法结束概率 .9，B 后仅 .1；全局 conditional valid masses 为 .9/.1，而逐步 mask 首步仍给 .5/.5。",
      "最后执行 full parse/schema validation，再检查字段事实、单位、跨字段约束和实际 authorization。格式正确的 SQL 仍可能查错表，格式正确的 tool request 仍可能无权限执行。",
    ],
    whenToUse: [
      "输出必须被 parser 或下游程序消费，如固定 enum、JSON schema、SQL 或受限 DSL。",
      "模型常生成语法无效输出，且可明确合法空间；优势是把可验证约束提前到生成过程。",
      "需要比较 generate-then-validate 与 constrained generation 的 valid-output rate、任务正确率和成本。",
    ],
    limits: [
      "Grammar 保证只覆盖实际实现支持的语法/约束，不自动保证语义、事实、执行结果或授权。",
      "过窄 grammar 可能排除正确答案；不支持的 schema features 不能被描述为完全保证。",
      "Local renormalization 会改变分布，且可能偏向后续难完成的合法 prefix；不是免费得到全局 conditional sampling。",
    ],
    howToUse: [
      "从少量合法/非法字符串和最小 grammar 开始，枚举检查所有 prefix 的 Allowed sets。",
      "测试 tokenizer fragments、escaped quotes、Unicode、多 token stop、EOS 与长度边界。",
      "固定模型和任务比较 validity、semantic correctness、latency、constraint failures 与 retry 数。",
      "在执行前仍做 independent full validation；把 unsupported constraint 与模型答错分开记录。",
    ],
    tuning: [
      "候选 top-k 先截断可能删掉全部合法项；明确先 mask 还是先 filter，并测试空集合。",
      "Beam width 和 grammar complexity 会同时影响延迟；先用最小足够约束，再看额外 checks 的收益。",
      "结构正确率提高但事实错误不变时，修数据/证据/任务说明，不反复收紧格式。",
    ],
    settings: [
      {
        name: "grammar / schema scope",
        start:
          "Toy exactly 2 binary symbols；真实应用先列 required fields、enum 与 supported features。",
        adjust:
          "正确结果被拒时检查 grammar coverage；非法结果通过时定位未实现的规则。",
      },
      {
        name: "mask / filter order",
        start: "Toy 对全词表先计算 allowed mask，再归一化 sampling。",
        adjust: "加入 top-k/top-p 后若合法集合变空，记录各阶段候选并核对顺序。",
      },
      {
        name: "parser acceptance / EOS",
        start: "只有完整 acceptance state 才允许 EOS；保留独立 final parse。",
        adjust:
          "截断或未闭合结构增多时检查 token budget 与 parser state，而非默认补字符。",
      },
      {
        name: "scoring / fallback budget",
        start:
          "明确选择 masked sampling 或保留原 log scores 的 search；toy 无自动放松约束。",
        adjust:
          "若业务允许修复，最多设一次有日志的 repair，并重新验证，不无限循环。",
      },
    ],
    modifications: [
      "FSM 适合有限状态格式；嵌套语言需相应 stack/parser 表达能力，不能把所有 grammar 都说成有限状态。",
      "结合 beam search，在多个合法 prefixes 中搜索；记录究竟保留原 score 还是重新归一化 score。",
      "加入 schema-aware semantic guards 或执行 verifier；它们增加的保证必须逐项说明。",
    ],
    pitfalls: [
      "把 valid JSON 当成 true facts，或当成获得 tool permission。",
      "在 tokenizer 边界直接用 character-level regex 检查一个 token，漏掉跨边界非法组合。",
      "以为过滤非法下一步就精确等价于从原模型的所有合法完整序列中条件抽样。",
    ],
    example:
      "Synthetic grammar 'two bits then EOS'：未完成时 mask 将 [.1,.2,.6,.1] 变成 [1/3,2/3,0,0]，11EOS 的生成概率为 4/9。它保证此 toy 的形式，不保证两位值回答了任何真实问题。",
    compareTo: [
      "tool-calling-contracts",
      "beam-search-decoding",
      "tokenization",
      "agent-security-boundaries",
    ],
  },
  {
    id: "speculative-decoding",
    source: {
      label:
        "Leviathan, Kalman & Matias: Fast Inference from Transformers via Speculative Decoding (ICML 2023)",
      url: "https://proceedings.mlr.press/v202/leviathan23a.html",
    },
    title: "Speculative Decoding：接受草稿，但不偷偷换目标分布",
    englishTitle:
      "Draft–Verify Sampling, Acceptance Ratios and Residual Correction",
    category: "sequence",
    level: "高级",
    duration: "33 分钟",
    icon: "⇉",
    summary:
      "逐项计算 draft/target overlap、接受概率和 residual distribution，理解为什么‘拒绝后直接从 target 抽’仍会偏，以及加速依赖哪些硬件和实现条件。",
    intuition:
      "便宜的助手先写几个候选，昂贵的编辑一次核对。如果只保留看起来顺眼的草稿，会悄悄改变文风分布；正确的接受与补抽规则要精确补回草稿少提到的 token。",
    core: "输入为目标模型分布 p、便宜 draft 分布 q、共享可比较的 token space、当前 prefix 与 draft length m；输出在规定校正算法与数值条件下服从 target sampling distribution 的 tokens。Draft 顺序提出候选，target 可在一次 batched/parallel verification 中计算这些 prefix 的概率；接受最长合法前缀，在首个拒绝处从 normalized positive residual 补抽。它改变执行方式，不是 distillation，也不增加目标模型的知识。",
    equation:
      "x∼q; accept with min(1,p(x)/q(x)); on rejection sample r(t)∝max(p(t)−q(t),0); acceptance mass=Σ_t min(p_t,q_t)",
    mechanicsSteps: [
      "固定同一 prefix 上的三 token toy distributions：target p=[.5,.3,.2]，draft q=[.2,.5,.3]。p/q 都是应用各自实际 temperature/filter 后的归一化分布，不能拿 raw logits 比值。",
      "Draft 提出的 token 从 q 采样。对应 acceptance probabilities 为 [1,.3/.5,.2/.3]=[1,.6,2/3]；q(t)=0 的 token 不会被 draft 提出，无需对该事件做 0 除法。",
      "被接受且输出各 token 的联合概率为 q×accept=[.2,.3,.2]，总 acceptance=.7，rejection=.3。不是把 acceptance=.7 当作目标模型准确率。",
      "Residual positive mass=max(p−q,0)=[.3,0,0]，归一化得到 r=[1,0,0]。拒绝后必补抽第一个 token，修复草稿对它提议不足的问题。",
      "总输出质量为 accepted mass + .3×r=[.5,.3,.2]=p。若错误地在拒绝后直接从 p 抽，结果会是 [.2,.3,.2]+.3×[.5,.3,.2]=[.35,.39,.26]，已不是 target distribution。",
      "多 token block 的每个 p_i/q_i 必须对应同一个已接受 prefix。首个拒绝后的 draft suffix 要丢弃并正确回滚 cache；若 m 个都接受，再从 target 的下一个分布抽一个额外 token。",
      "用简化独立 constant acceptance α=.7、m=3、忽略 EOS 的 toy 估算每轮输出：1+α+α²+α³=2.533 tokens，最多 4。真实 acceptance 随 prefix 和位置变化，不能默认此式总成立。",
      "再假设 target verification=10ms、每个 draft step=1ms、三步 draft 共3ms且无其它开销，预计 per-block cost=13ms，speedup≈2.533×10/13=1.948。这是假设成本模型，不是实测硬件结论。",
      "核对 EOS、padding、batch、tokenizer alignment、logits processors 与 cache rollback；先用枚举/统计分布验证 correctness，再报告 acceptance、TTFT、decode latency、throughput 和峰值显存。",
    ],
    whenToUse: [
      "目标模型逐 token decode 是性能瓶颈，且有足够便宜、与目标较一致的 draft mechanism。",
      "希望在保持指定 sampling distribution 的前提下优化推理，而不是以质量变化换速度。",
      "需要理解 parallel verification 与 autoregressive dependency 如何共存，作为 KV-cache 之后的系统课。",
    ],
    limits: [
      "Draft 成本、低 acceptance、短输出或 target verification 随 block 变贵都可能抵消加速。",
      "数学分布保持不等于相同 seed 必须生成逐 token 相同文本；随机数消耗与数值实现会不同。",
      "不正确的 residual、过滤顺序、token mapping 或 cache handling 会破坏保证；不是所有名为 speculative 的变体都保留完整分布。",
    ],
    howToUse: [
      "先在有限 toy distributions 上枚举接受/拒绝分支，确认输出概率恰等于 target。",
      "固定 tokenizer、target distribution 与所有 sampling processors，记录 draft 真正使用的 q。",
      "比较 target-only 与 draft-verify 的质量分布和硬件指标，分别测 prefill 与 decode。",
      "按任务类型/长度画 acceptance 和成本曲线，再选择 draft size 与 block length。",
    ],
    tuning: [
      "m 增大提供更多潜在并行 tokens，也增加被丢弃 suffix 的开销；用实测而非最大化 m。",
      "更强 draft 通常更慢且未必更贴近 target；优化的是 acceptance 与成本的组合。",
      "目标高并发已 compute-bound 时，额外 verification 可能降低 throughput，即使某些单请求更快。",
    ],
    settings: [
      {
        name: "draft length m",
        start: "Toy m=3；硬件测试从 m=1/2/4 比较，并保留 target-only。",
        adjust: "后半 block 大量被拒或验证时间超线性增长时缩短。",
      },
      {
        name: "draft / target alignment",
        start: "本课假定共享 token space，每个 prefix 对齐且 p/q 可比。",
        adjust:
          "不同 tokenizer 不可直接复用公式中的 token IDs；需经过验证的对齐算法。",
      },
      {
        name: "accept / residual implementation",
        start: "保存 min(1,p/q)、positive residual 与归一化常数的 toy trace。",
        adjust: "分布差异超采样误差时先查修正、零质量、dtype 和过滤顺序。",
      },
      {
        name: "cache / stop semantics",
        start:
          "拒绝即截断未接受 suffix，EOS 立即遵守模型约定，记录 accepted token count。",
        adjust:
          "出现重复/缺 token 或长度偏差时检查 cache positions、rollback 与 batch finished mask。",
      },
    ],
    modifications: [
      "Adaptive draft length 根据近期 acceptance 与成本调整，但 correctness 仍需逐 token 接受规则。",
      "N-gram 或 retrieval proposal 可作 draft，只要算法能给出所需提议分布并满足实现条件。",
      "Tree-based proposals 或 auxiliary heads 属于不同验证布局，不能直接照搬线性 block 的成本公式。",
    ],
    pitfalls: [
      "拒绝后从 p 直接抽，忽略应补偿 draft/target 差异的 residual。",
      "用 acceptance rate 或 tokens/sec 代替 task accuracy，并宣称模型变聪明。",
      "把 target 一次批量核验误写成所有后续 token 都不再依赖 prefix。",
    ],
    example:
      "Synthetic p=[.5,.3,.2]、q=[.2,.5,.3]：接受质量 [.2,.3,.2]，剩余 .3 全补到第一个 token，恢复 p。此处证明的是概率记账；加速是否成立需另测实际 compute、memory 与通信。",
    compareTo: [
      "autoregressive-inference",
      "kv-cache",
      "beam-search-decoding",
      "model-serving-monitoring",
    ],
  },
  {
    id: "agent-state-checkpoints",
    source: {
      label:
        "LangGraph official documentation: Checkpointers, super-step boundaries and pending writes (accessed 2026-10-29)",
      url: "https://docs.langchain.com/oss/python/langgraph/checkpointers",
    },
    title: "Agent Checkpoint：恢复进度，不重复制造外部结果",
    englishTitle:
      "State Machines, Checkpoints, Effect Receipts and Crash Recovery",
    category: "agents",
    level: "进阶",
    duration: "32 分钟",
    icon: "▣",
    summary:
      "把聊天历史、运行状态和外部 effect receipt 分开，用一次‘服务器成功但本地尚未记账就崩溃’的 trace 解释恢复、replay 与 idempotency。",
    intuition:
      "实验记录写到‘已准备试剂’，不等于机器已经完成测量；机器完成但电脑突然断电，也不等于应该再测一次。Checkpoint 记住流程进度，外部 receipt 才能证明某个 effect 已经发生。",
    core: "输入是 versioned task state、node contracts、durable checkpoints 与真实外部结果；输出是可恢复的下一步和经核验的最终 artifact。聊天 transcript 记录说过什么，state machine 定义允许转移，checkpoint 保存可恢复快照，effect ledger 关联请求 identity 与外部 receipt。不同 runtime 的持久化边界不同；本课以 LangGraph 官方概念作参考，toy 状态名不是它的固定 API，也不将某个 checkpoint 功能宣称为跨系统 exactly-once transaction。",
    equation:
      "state_{t+1}=reduce(state_t,event_t); effect_key=(run,operation,input_revision); completion requires verified receipt + postcondition",
    mechanicsSteps: [
      "定义 toy nodes：retrieve 2s→analyze 3s→write 5s→verify 1s。State 记录 run ID、completed nodes、artifact references、input/config versions、next node 与累计预算，不只保存自然语言总结。",
      "retrieve/analyze 完成后保存 durable checkpoint，elapsed=5s。准备 write 时先持久化 intent 与稳定 key K=(run7,write,v2)，状态进入 dispatched；key 表达同一次逻辑操作，不随 transport retry 随机改变。",
      "服务器在第10秒写入 artifact 并保存 K 对应 receipt，但客户端在记录 confirmed 前崩溃。Local checkpoint 不能判断 write 是未执行还是已完成，这个状态是 unknown outcome。",
      "恢复时加载 checkpoint 与同一 K，先向服务查询 receipt，假设耗时1s。若找到匹配 artifact revision，则执行 verify 1s 后标记 confirmed/completed，总用时为10+1+1=12s；external effect count=1。",
      "若直接从头重跑并生成新 key K2，重复 retrieve/analyze/write/verify 需11s，总计21s，且 toy server 会保留两个 artifacts。时间与 effect counts 都要检查，不能只看最终回答是否写着成功。",
      "如果 outcome 查询没有确定结果，只有在服务明确支持稳定 key 的原子去重等条件下，才按同一 K 安全重试；read-before-write 本身可能有 race，不提供通用 exactly-once 保证。",
      "恢复后重新检查当前权限、资源版本与尚未执行的操作。旧 checkpoint 的授权文字不等于新时刻仍可执行；若 input revision 已变化，先明确重算范围，不能把旧结果当新输入的输出。",
      "并行 workers 还需防止 lost update：两者都读取 state revision=7，worker A 原子提交后为8，worker B 的 expected_revision=7 应被拒绝并重新读状态。Checkpoint version 与外部 effect key 解决不同问题。",
      "注入 crash 点：发请求前、服务完成后、本地提交前后、verify 前后；检查每条恢复路径的 effects、预算和 provenance。Replay 应恢复已记录的 nondeterministic results，重新采样模型结果则是新的执行分支。",
    ],
    whenToUse: [
      "任务跨多个工具、运行较久、可能暂停或进程重启，需要保留已经完成的可验证工作。",
      "有写入文件/数据库等 side effects，不能把每次 timeout 都当成安全从头再来。",
      "多 workers 或异步反馈共享状态，需要明确 ownership、version 与恢复边界；优势是可回放、可诊断。",
    ],
    limits: [
      "Checkpoint 只保证其存储系统承诺的持久化范围，不能自动与任意远程 API 组成原子事务。",
      "外部服务没有 idempotency/receipt 查询时，unknown outcome 可能需要人工或专用对账，不能凭模型猜测。",
      "频繁快照增加存储、序列化和延迟；保存 transcript 也不自动捕获代码、数据、工具版本。",
    ],
    howToUse: [
      "将每个 node 写成明确 input/output/error contract，标记 pure computation 与 external effect。",
      "在小 fixture 中建立 intent、request identity、receipt、verification 与 state commit 的完整 trace。",
      "选择可持久化的 checkpoint store，并实测 crash/restart；仅内存保存不能跨进程故障恢复。",
      "对恢复、并发、取消、版本升级和过期权限做故障注入，检查状态与外部结果同时一致。",
    ],
    tuning: [
      "Checkpoint interval 应按重算成本与恢复要求设置；太粗会重做昂贵节点，太细增加 I/O。",
      "把多次独立 side effects 放进一个不可区分 node 会扩大恢复歧义，按 effect identity 拆开。",
      "State 过大时存 artifact URI/hash/version，保留数据访问与版本验证，避免把整个大文件复制进每次快照。",
    ],
    settings: [
      {
        name: "checkpoint boundary / durability",
        start: "Toy 每个完成 node 后落盘，显式记录 store commit 成功。",
        adjust:
          "重启丢进度时先检查持久化时机与 store；高 I/O 时评估更小state或合适批次。",
      },
      {
        name: "effect key / receipt",
        start: "稳定 key=(run,operation,input_revision)，同逻辑 retry 复用它。",
        adjust:
          "出现重复 effects 时检查服务端去重原子性、key scope/保留期，而非只加 local flag。",
      },
      {
        name: "state revision / concurrency",
        start: "Toy expected revision=7，原子 compare-and-set 成功后为8。",
        adjust: "检测冲突后 reload/merge；不能让后到 worker 覆盖先前完整结果。",
      },
      {
        name: "resume budget / validation",
        start:
          "恢复保留原累计 attempts/time，query receipt 后执行独立 postcondition。",
        adjust:
          "反复重启绕过预算时将计数持久化；外部版本变化时重新确认数据依赖。",
      },
    ],
    modifications: [
      "Event log 加 periodic snapshots 可以重建 state；reducer 必须处理重复 event IDs 与版本。",
      "跨服务流程可设计补偿操作，但 compensation 是新的业务动作，不自动回到原状态。",
      "人工决策点可保存待审批的具体 action/state revision，恢复时确认其仍适用；不是所有只读步骤都需要人工介入。",
    ],
    pitfalls: [
      "看到 checkpoint 已保存，就声称外部写入 exactly once。",
      "每次 resume 生成新 effect key，使服务无法识别同一逻辑请求。",
      "把旧模型输出重新生成一遍称为 deterministic replay，或在恢复时重置已消费预算。",
    ],
    example:
      "Synthetic crash trace：前两步5s，write在10s外部完成后本地崩溃；receipt查询1s+verify1s，总12s且一个effect。新key整条重跑则21s且两个effects。这些是人为设定耗时，展示状态账与外部事实要分开验证。",
    compareTo: [
      "agent-workflows",
      "tool-calling-contracts",
      "agent-reliability-budgets",
      "multi-agent-orchestration",
    ],
  },
];
