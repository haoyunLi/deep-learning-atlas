import type { Lesson } from "./lessons";

// The generic RL lesson introduces the loop; these cards unpack distinct algorithms.
export const rlLessons: Lesson[] = [
  {
    id: "multi-armed-bandit",
    source: {
      label: "Sutton & Barto, Reinforcement Learning, Ch. 2",
      url: "https://mitpress.mit.edu/9780262039246/reinforcement-learning/",
    },
    title: "先学会探索：多臂老虎机",
    englishTitle: "Multi-Armed Bandits",
    category: "reinforcement",
    level: "入门",
    duration: "7 分钟",
    icon: "◎",
    summary:
      "每次只选一个动作并看即时收益，练习 exploration 与 exploitation 的取舍。",
    intuition:
      "像在几家餐厅间选晚饭：常去已知好店会错过更好的店；一直试新店又浪费机会。Bandit 把这个矛盾缩成最小实验。",
    core: "为每个动作估计平均 reward。ε-greedy 以小概率随机探索、其余时间选当前最优；UCB 则给尝试较少的动作加不确定性奖励。没有会影响下一步的 state，因此还不是完整的 MDP。",
    equation: "aₜ = argmaxₐ Qₜ(a)（概率 1−ε）；其余时间随机探索",
    whenToUse: [
      "A/B 测试、推荐位等即时反馈决策，且动作不改变未来状态。",
      "先理解 RL 探索，再进入 Q-learning。",
    ],
    howToUse: [
      "明确每个 arm 和可观测 reward，先跑随机策略作基线。",
      "分别记录累计回报与各 arm 的选择次数，避免只看最后一次收益。",
    ],
    tuning: [
      "ε 太小易早熟，太大浪费样本；可比较固定 ε 与随时间下降的 ε。",
      "非平稳环境用滑动窗口或指数加权估计，别无限累积旧反馈。",
    ],
    modifications: [
      "有用户特征时用 contextual bandit。",
      "动作会改变后续状态时升级到完整 RL。",
    ],
    pitfalls: [
      "将即时点击量当长期满意度。",
      "在线实验忘了记录选择概率，后续难做无偏离线评估。",
    ],
    example:
      "在三个标题之间分配展示流量；bandit 边试边把更多流量给表现较好的标题。",
    compareTo: ["q-learning", "reinforcement-learning"],
  },
  {
    id: "q-learning",
    source: {
      label: "Sutton & Barto, Reinforcement Learning, Ch. 6",
      url: "https://mitpress.mit.edu/9780262039246/reinforcement-learning/",
    },
    title: "用 Q 表学最优行动",
    englishTitle: "Tabular Q-Learning",
    category: "reinforcement",
    level: "入门",
    duration: "9 分钟",
    icon: "▦",
    summary: "对每个 state-action 估计未来累计回报，用 Bellman backup 更新。",
    intuition:
      "给地图上每个位置和动作记一个分数：现在走一步得到的奖励，加上下一站最有希望的未来。反复修正后，选最高分动作。",
    core: "Q-learning 用实际执行的动作收集数据，却用下一状态的最大 Q 值构造目标，因此是 off-policy value-based 方法。有限状态/动作可用表格；大状态空间需函数近似。",
    equation: "Q(s,a) ← Q(s,a)+α[r+γ maxₐ′ Q(s′,a′)−Q(s,a)]",
    whenToUse: [
      "状态与离散动作都较少、可以枚举时。",
      "作为检验环境 reward 和终止逻辑的透明 baseline。",
    ],
    howToUse: [
      "定义 state、合法动作、reward 与终止条件。",
      "用 ε-greedy 收集轨迹；对 terminal transition 不加未来价值。",
    ],
    tuning: [
      "α 控制每次更新幅度，γ 控制未来回报权重。",
      "ε 随训练下降仍需保留一定探索，并跨随机种子评估。",
    ],
    modifications: [
      "用神经网络近似 Q 得到 DQN。",
      "希望目标跟随真实行为策略时看 SARSA。",
    ],
    pitfalls: [
      "把 off-policy 理解为完全不需要探索。",
      "在巨大或连续状态空间创建无法维护的 Q 表。",
    ],
    example: "网格迷宫中，Q 表逐渐学到在每个格子向哪走能更快到出口。",
    compareTo: ["sarsa", "dqn", "multi-armed-bandit"],
  },
  {
    id: "sarsa",
    source: {
      label: "Sutton & Barto, Reinforcement Learning, Ch. 6",
      url: "https://mitpress.mit.edu/9780262039246/reinforcement-learning/",
    },
    title: "按真实下一步更新：SARSA",
    englishTitle: "SARSA",
    category: "reinforcement",
    level: "入门",
    duration: "8 分钟",
    icon: "↪",
    summary:
      "更新目标使用实际将执行的下一动作，因此学习的是当前行为策略的价值。",
    intuition:
      "Q-learning 问‘下一站最佳情况下怎样’，SARSA 问‘按我现在还会探索的习惯怎样’。后者会把探索可能造成的风险算进来。",
    core: "名字来自 State–Action–Reward–State–Action。SARSA 是 on-policy temporal-difference control：下一步 a′ 必须从当前行为策略中取，再用于更新 Q(s,a)。",
    equation: "Q(s,a) ← Q(s,a)+α[r+γQ(s′,a′)−Q(s,a)]",
    whenToUse: [
      "探索动作本身有明显风险，想学当前 ε-greedy 行为的价值。",
      "教学中对照 Q-learning 的 on/off-policy 区别。",
    ],
    howToUse: [
      "在当前 state 采样 a，执行后在下一 state 依同一策略采样 a′。",
      "用这五元组更新，再把 a′ 当作下一轮实际动作。",
    ],
    tuning: [
      "与 Q-learning 一样先调 α、γ 和探索计划。",
      "比较不同 ε 下的实际执行回报，而不只比较贪心评估。",
    ],
    modifications: [
      "Expected SARSA 用下一策略的期望 Q 降低采样方差。",
      "较大状态空间可用函数近似，但稳定性需要额外关注。",
    ],
    pitfalls: [
      "误将 maxₐ′Q 写进目标，结果变成 Q-learning。",
      "训练和评估使用不同探索策略却直接比较学到的 Q。",
    ],
    example:
      "悬崖漫步任务里，持续随机探索会让贴着悬崖走的路线危险；SARSA 更可能选安全的绕路。",
    compareTo: ["q-learning", "reinforce"],
  },
  {
    id: "dqn",
    source: {
      label: "Mnih et al., Nature 2015",
      url: "https://www.nature.com/articles/nature14236",
    },
    title: "让神经网络估 Q：DQN",
    englishTitle: "Deep Q-Network",
    category: "reinforcement",
    level: "进阶",
    duration: "11 分钟",
    icon: "▤",
    summary:
      "用网络预测各离散动作的 Q 值，以 replay buffer 和 target network 稳住训练。",
    intuition:
      "像 Q 表的压缩版：相似画面共享特征，不必为每张图单独存一个格子；但网络一边学习一边改变目标，所以要把目标网络暂时冻结。",
    core: "DQN 是 off-policy、value-based、model-free。经验回放打散相邻样本相关性，目标网络让 bootstrap target 在一段时间内较稳定；原方法适合有限离散动作。",
    equation: "L = E[(Qθ(s,a) − (r + γ maxₐ′ Qθ⁻(s′,a′)))²]",
    whenToUse: [
      "图像或高维状态，动作数有限且离散。",
      "需要从 value-based 方法学习表示时。",
    ],
    howToUse: [
      "建立 replay buffer，先收集足够多样的经验再开始更新。",
      "线上网络选动作并训练；目标网络定期复制或缓慢跟随。",
    ],
    tuning: [
      "优先检查探索 ε、replay 容量、目标网络同步频率。",
      "观察 TD error、Q 值尺度和每个随机种子的回报。",
    ],
    modifications: [
      "高估值严重时加 Double DQN。",
      "动作价值相似时可加 dueling head；多个改进可参考 Rainbow。",
    ],
    pitfalls: [
      "把连续动作直接塞进必须枚举 max 的标准 DQN。",
      "终止状态仍 bootstrap，或对同一轨迹顺序训练导致强相关。",
    ],
    example:
      "Atari 画面进 CNN，网络输出每个按钮的 Q 值，智能体依 ε-greedy 选择按钮。",
    compareTo: ["q-learning", "double-dqn", "ppo"],
  },
  {
    id: "double-dqn",
    source: {
      label: "van Hasselt et al., Double Q-Learning",
      url: "https://arxiv.org/abs/1509.06461",
    },
    title: "拆开选择与打分：Double DQN",
    englishTitle: "Double DQN",
    category: "reinforcement",
    level: "进阶",
    duration: "9 分钟",
    icon: "⚖",
    summary:
      "用 online network 选择下一动作，再用 target network 估值，减轻 max 带来的高估。",
    intuition:
      "若同一个人既挑最高分答案又给它打分，随机误差会被‘取最大’放大；换另一个人评估能减少这种偏差。",
    core: "Double DQN 沿用 DQN 的 replay 与 target network，只改 bootstrap target。它仍是离散动作、off-policy、value-based；‘Double’ 不意味着训练两套完全独立的策略。",
    equation: "y = r + γ Qtarget(s′, argmaxₐ Qonline(s′,a))",
    whenToUse: [
      "DQN 的 Q 值明显高估、训练不稳或贪心策略表现差。",
      "希望以很小实现改动获得更稳健的离散动作 baseline。",
    ],
    howToUse: [
      "保留 DQN 的 replay buffer 和 target 更新。",
      "检查 argmax 由 online 网络算，最终 Q 数值由 target 网络算。",
    ],
    tuning: [
      "先沿用 DQN 超参数，再评估目标更新速度和探索计划。",
      "同时画 Q 预测与实际回报，确认高估是否改善。",
    ],
    modifications: [
      "可与 dueling architecture、prioritized replay 组合。",
      "需要连续动作时考虑 TD3 或 SAC。",
    ],
    pitfalls: [
      "把两个网络的职责写反或两个步骤都用同一网络。",
      "认为减轻高估就能解决稀疏奖励、探索不足等其他难题。",
    ],
    example:
      "游戏中有几个得分接近的按钮，Double DQN 避免总挑被噪声偶然抬高的那个。",
    compareTo: ["dqn", "dueling-dqn", "td3"],
  },
  {
    id: "dueling-dqn",
    source: {
      label: "Wang et al., Dueling Networks",
      url: "https://arxiv.org/abs/1511.06581",
    },
    title: "状态好坏与动作差别分开学",
    englishTitle: "Dueling DQN",
    category: "reinforcement",
    level: "进阶",
    duration: "9 分钟",
    icon: "⋈",
    summary: "把 Q 拆成 state value V 与 action advantage A 两条网络分支。",
    intuition:
      "在危险路段，先知道‘这个位置很糟’比立刻精确比较每个转向更重要。Dueling 让网络分别学位置本身和动作间的细微差异。",
    core: "共享特征后分成 V(s) 与 A(s,a)，再组合成 Q(s,a)。减去所有动作 advantage 的均值，处理 V 和 A 可任意平移的不可辨识性。它是网络架构改造，可叠加 DQN 或 Double DQN。",
    equation: "Q(s,a) = V(s) + A(s,a) − meanₐ′ A(s,a′)",
    whenToUse: [
      "同一状态下有许多价值接近的离散动作。",
      "已有可靠 DQN/Double DQN baseline，想改进价值表示。",
    ],
    howToUse: [
      "在共享 encoder 后接 value head 和 advantage head。",
      "组合 Q 后仍按原 DQN 的 TD loss 与 replay 训练。",
    ],
    tuning: [
      "对照普通 head 的回报和学习速度，不只看参数量。",
      "注意分支宽度、目标更新与探索超参数。",
    ],
    modifications: [
      "可叠加 Double DQN；Rainbow 将多种 DQN 改进组合。",
      "有动作 mask 时只在合法动作上选择与评估。",
    ],
    pitfalls: [
      "直接令 Q=V+A 而无约束，会让分解不唯一。",
      "误以为 dueling 是两个智能体对抗。",
    ],
    example: "棋盘上暂时无论走哪步都差不多时，V 先学会‘当前局面对我有利’。",
    compareTo: ["dqn", "double-dqn", "rainbow-dqn"],
  },
  {
    id: "rainbow-dqn",
    source: {
      label: "Hessel et al., Rainbow",
      url: "https://arxiv.org/abs/1710.02298",
    },
    title: "组合式 DQN：Rainbow",
    englishTitle: "Rainbow DQN",
    category: "reinforcement",
    level: "高级",
    duration: "11 分钟",
    icon: "◈",
    summary: "把 Double、Dueling、优先回放、分布式价值等 DQN 改进组合评估。",
    intuition:
      "DQN 的问题不止一种：高估、样本利用率、探索和回报分布都可能影响表现。Rainbow 像工具箱，把针对不同问题的零件装到一起。",
    core: "原论文组合 Double Q-learning、prioritized replay、dueling networks、multi-step learning、distributional RL 与 noisy networks。仍是离散动作的 model-free value-based 路线。",
    equation: "DQN backbone + Double + Dueling + PER + n-step + C51 + NoisyNet",
    whenToUse: [
      "想研究高性能离散动作 value-based agent 的组合设计。",
      "已理解各组件作用，能做 ablation。",
    ],
    howToUse: [
      "先复现稳定 DQN，再逐项接入组件并做消融。",
      "核对 n-step target、优先回放权重和 distributional projection 实现。",
    ],
    tuning: [
      "优先回放强度与重要性采样修正需共同调。",
      "NoisyNet 探索与 ε-greedy 的组合要明确，避免重复或不足。",
    ],
    modifications: [
      "可换其他 distributional value 表示。",
      "资源有限时先选对当前失败模式最有用的组件。",
    ],
    pitfalls: [
      "把组合结果误归功于单个组件。",
      "同时改六处却没有逐项测试，难以排查错误。",
    ],
    example:
      "Atari 任务里，先用 DQN 作基线，再逐项加入 Double、Dueling 和优先回放比较收益。",
    compareTo: ["dqn", "double-dqn", "dueling-dqn"],
  },
  {
    id: "reinforce",
    source: {
      label: "Williams, REINFORCE (1992)",
      url: "https://link.springer.com/article/10.1007/BF00992696",
    },
    title: "直接学动作概率：REINFORCE",
    englishTitle: "REINFORCE / Monte Carlo Policy Gradient",
    category: "reinforcement",
    level: "入门",
    duration: "9 分钟",
    icon: "↗",
    summary: "通过整条轨迹的回报，提高好动作的概率、降低差动作的概率。",
    intuition:
      "一次游戏赢了，就让过程中做过的动作更可能出现；输了则反向调整。但这很粗糙：一次赢可能只是运气，所以梯度方差大。",
    core: "REINFORCE 是 on-policy、policy-based、Monte Carlo 方法。用 log-probability trick 估计 policy gradient，通常等一个 episode 结束才能算完整回报；减去不依赖动作的 baseline 可降方差。",
    equation: "∇θJ ≈ Σₜ ∇θ log πθ(aₜ|sₜ) · (Gₜ − b(sₜ))",
    whenToUse: [
      "学习 policy gradient 的最小完整实现。",
      "动作可微地参数化为概率分布而 Q 枚举不方便。",
    ],
    howToUse: [
      "让策略输出合法动作概率，从当前策略采集完整轨迹。",
      "从后向前计算折扣回报，乘 log-probability 后更新参数。",
    ],
    tuning: [
      "先做 reward normalization 或 baseline 来减小方差。",
      "调学习率和 batch 内轨迹数；报告跨随机种子的波动。",
    ],
    modifications: [
      "用 learned value baseline 发展为 actor-critic。",
      "用 PPO 的限制更新幅度降低大步更新的风险。",
    ],
    pitfalls: [
      "用旧策略数据直接重复很多轮当作标准 on-policy REINFORCE。",
      "把整局总回报给每一步，忽略 action 后才发生的奖励。",
    ],
    example:
      "智能体学习走迷宫：成功轨迹上的动作整体被提高概率，但最开始会很不稳定。",
    compareTo: ["actor-critic", "ppo", "q-learning"],
  },
  {
    id: "actor-critic",
    source: {
      label: "Mnih et al., A3C",
      url: "https://arxiv.org/abs/1602.01783",
    },
    title: "一个行动，一个评分：Actor-Critic",
    englishTitle: "Actor-Critic / A2C / A3C",
    category: "reinforcement",
    level: "进阶",
    duration: "11 分钟",
    icon: "◐",
    summary:
      "Actor 学 policy；Critic 学 value，用 advantage 提供更细的训练信号。",
    intuition:
      "Actor 像运动员选动作，Critic 像教练说‘这次比预期好多少’。比 REINFORCE 只看比赛最终输赢更及时，但教练也可能评错。",
    core: "A2C/A3C 通常用当前策略采样，是 on-policy actor-critic。Critic 的 V(s) 估计 baseline，advantage A≈return−V(s) 训练 Actor；A3C 异步并行采样，A2C 同步汇总。Actor-Critic 本身是更广泛结构，SAC/TD3 则是 off-policy 版本。",
    equation: "Lactor = −log πθ(a|s) Â；Lcritic = (Vφ(s)−return)²",
    whenToUse: [
      "REINFORCE 方差过大，需要更及时的价值反馈。",
      "理解 PPO、SAC 等更复杂算法的共同结构。",
    ],
    howToUse: [
      "并行环境收集 rollout，计算 n-step return 或 advantage。",
      "分别监控策略损失、value loss、entropy 与真实 episode return。",
    ],
    tuning: [
      "critic loss 权重过大可压制 actor，过小则 advantage 噪声高。",
      "rollout 长度、entropy bonus、梯度裁剪影响稳定性。",
    ],
    modifications: [
      "GAE 平衡 advantage 的偏差与方差。",
      "加 PPO clipping 管理多轮 policy 更新。",
    ],
    pitfalls: [
      "把所有 actor-critic 都称为 on-policy。",
      "critic 错得很离谱时，actor 会跟着错误 advantage 更新。",
    ],
    example:
      "机器人学习平衡时，Actor 决定力矩，Critic 判断刚才动作是否比当前状态的平均水平更好。",
    compareTo: ["reinforce", "ppo", "sac"],
  },
  {
    id: "trpo",
    source: {
      label: "Schulman et al., TRPO",
      url: "https://arxiv.org/abs/1502.05477",
    },
    title: "限制策略走太远：TRPO",
    englishTitle: "Trust Region Policy Optimization",
    category: "reinforcement",
    level: "高级",
    duration: "10 分钟",
    icon: "◌",
    summary: "在新旧策略差异受限的条件下优化 policy surrogate objective。",
    intuition:
      "新策略看起来更好，但若一步改得太猛，旧数据就不再能可靠预测结果。TRPO 给每次改动划一个可信的小范围。",
    core: "TRPO 属于 on-policy policy optimization，使用 KL divergence 约束新旧策略距离。理论动机是受限更新可能更稳；实际实现依赖近似、共轭梯度等步骤，不能把理论单调性当作任意实现保证。",
    equation: "maxθ E[πθ(a|s)/πold(a|s) · Â]，使 E[DKL(πold∥πθ)] ≤ δ",
    whenToUse: [
      "研究 trust region 更新与 policy 稳定性的原理。",
      "已有 TRPO 工具链，愿意承担较高实现复杂度。",
    ],
    howToUse: [
      "从当前策略采样，估计 advantage。",
      "在 KL 约束下求候选更新，并用 line search 核验改进与约束。",
    ],
    tuning: [
      "δ 过大易不稳，过小则学习缓慢。",
      "监控实际 KL、回报与 advantage 估计误差。",
    ],
    modifications: [
      "PPO-Clip 用更易实现的 surrogate 近似‘不要走太远’。",
      "可配合 GAE 改善 advantage 估计。",
    ],
    pitfalls: [
      "把近似实现当成严格收益单调保证。",
      "用过期轨迹长期更新，破坏 on-policy 假设。",
    ],
    example:
      "学机器人步态时，TRPO 会避免一次更新就把尚能行走的策略推到完全不同的动作分布。",
    compareTo: ["ppo", "reinforce", "actor-critic"],
  },
  {
    id: "ppo",
    source: {
      label: "Schulman et al., PPO",
      url: "https://arxiv.org/abs/1707.06347",
    },
    title: "稳健更新策略：PPO",
    englishTitle: "Proximal Policy Optimization",
    category: "reinforcement",
    level: "进阶",
    duration: "12 分钟",
    icon: "⊙",
    summary:
      "对同一批新采集数据做多轮更新，同时用 clipped objective 限制策略变化。",
    intuition:
      "把旧策略当作出发点。新策略可以根据好坏经验调整，但如果对某个动作的概率一下变太多，就截住这部分收益诱惑。",
    core: "PPO-Clip 是常见的 on-policy actor-critic 路线。概率比 r=πnew/πold 衡量更新程度，clip(r,1−ε,1+ε) 限制 surrogate 激励；它不是对策略变化的硬性保证。通常用 value critic 和 GAE 估 advantage。",
    equation: "Lclip = E[min(rₜÂₜ, clip(rₜ,1−ε,1+ε)Âₜ)]",
    whenToUse: [
      "有模拟器可持续采新数据，想要通用 policy optimization baseline。",
      "动作可离散或连续，且需要较易实现的策略更新。",
    ],
    howToUse: [
      "用当前 policy 收集 rollout，保存 old log-prob，计算 returns 与 advantage。",
      "对 rollout 做有限 epoch 的 minibatch 更新，随后丢弃旧数据重新采样。",
    ],
    tuning: [
      "重点监控 clip fraction、approx KL、entropy、value loss。",
      "调 clip ε、epoch 数、学习率、GAE λ 与每批采样步数。",
    ],
    modifications: [
      "可加 KL early stopping，防止实际更新仍过大。",
      "语言模型 RLHF 中常把 PPO 与 reward model、reference KL 结合。",
    ],
    pitfalls: [
      "以为 clipping 一定保证 KL 有上界。",
      "用同批旧数据更新太久，导致估计与当前策略脱节。",
    ],
    example: "在模拟机器人里，PPO 每轮采样若干动作轨迹，再谨慎调整控制策略。",
    compareTo: ["trpo", "sac", "rlhf"],
  },
  {
    id: "ddpg",
    source: {
      label: "Lillicrap et al., DDPG",
      url: "https://arxiv.org/abs/1509.02971",
    },
    title: "连续动作的确定性策略：DDPG",
    englishTitle: "Deep Deterministic Policy Gradient",
    category: "reinforcement",
    level: "进阶",
    duration: "10 分钟",
    icon: "↝",
    summary:
      "Actor 直接输出连续动作，Critic 给 state-action 打分，用旧经验反复训练。",
    intuition:
      "机械臂角度无法像 DQN 一样枚举所有可能值。DDPG 让 Actor 直接给出一个具体角度，再问 Critic：这个角度值多少？",
    core: "DDPG 是 off-policy、model-free actor-critic，结合 deterministic policy gradient、replay buffer 和 target networks。探索靠在 actor 输出上加噪声；critic 估计偏差容易被 actor 利用。",
    equation: "a=μθ(s)+noise；∇θJ≈E[∇aQφ(s,a)|a=μθ(s) ∇θμθ(s)]",
    whenToUse: [
      "连续动作控制，想理解 TD3 的直接前身。",
      "可反复使用历史交互、环境采样成本较高。",
    ],
    howToUse: [
      "对 actor 和 critic 都建立缓慢更新的 target network。",
      "在 replay buffer 上更新 critic，再沿 critic 对动作的梯度更新 actor。",
    ],
    tuning: [
      "探索噪声尺度、actor/critic 学习率与 target 更新速度很关键。",
      "观察 critic 估值是否远高于实际回报；跨种子评估。",
    ],
    modifications: [
      "TD3 用双 critic、延迟 actor 更新和目标动作平滑减轻误差。",
      "需要随机策略与显式 entropy 探索时看 SAC。",
    ],
    pitfalls: [
      "不加探索噪声，确定性 actor 只重复已知动作。",
      "把 replay buffer 中旧样本误当作 on-policy 样本。",
    ],
    example:
      "控制机械臂连续力矩时，Actor 直接输出每个关节力矩，Critic 评估这组力矩的长期回报。",
    compareTo: ["td3", "sac", "dqn"],
  },
  {
    id: "td3",
    source: {
      label: "Fujimoto et al., TD3",
      url: "https://arxiv.org/abs/1802.09477",
    },
    title: "修正 DDPG 高估：TD3",
    englishTitle: "Twin Delayed DDPG",
    category: "reinforcement",
    level: "进阶",
    duration: "11 分钟",
    icon: "⋄",
    summary: "两个 critic 取较小估值，延迟更新 actor，并平滑目标动作。",
    intuition:
      "如果 Actor 总是去找 Critic 最乐观的漏洞，两个评分者取较保守的值，可以少被偶然高估带偏。",
    core: "TD3 是 off-policy、确定性 actor-critic，继承 DDPG 的 replay。三项关键改动是 clipped double-Q、delayed policy updates、target policy smoothing；原方法面向连续动作。",
    equation: "y = r + γ minᵢ Qtarget,i(s′, μtarget(s′)+clipped noise)",
    whenToUse: [
      "连续动作任务，DDPG critic 估值偏高或训练易崩。",
      "想要不以随机 actor 为核心的 off-policy baseline。",
    ],
    howToUse: [
      "实现两个独立 critic，目标中取较小值。",
      "critic 每步更新，actor 与 target network 按设定间隔更新，并给目标动作加裁剪噪声。",
    ],
    tuning: [
      "检查 policy delay、target noise 与 noise clip 是否匹配动作尺度。",
      "监控两位 critic 的分歧，外加真实环境回报。",
    ],
    modifications: [
      "较难探索时可与行为克隆或其他探索策略结合。",
      "若希望通过随机策略维持探索，转向 SAC。",
    ],
    pitfalls: [
      "把目标动作平滑噪声误加到执行动作上，混淆两种噪声。",
      "连续动作没有正确缩放到环境允许区间。",
    ],
    example:
      "机器人抓取时，两个 critic 防止 actor 被一个偶然过高的抓取角度评分吸引。",
    compareTo: ["ddpg", "sac", "double-dqn"],
  },
  {
    id: "sac",
    source: {
      label: "Haarnoja et al., SAC",
      url: "https://arxiv.org/abs/1801.01290",
    },
    title: "既拿高分也保留探索：SAC",
    englishTitle: "Soft Actor-Critic",
    category: "reinforcement",
    level: "进阶",
    duration: "12 分钟",
    icon: "♨",
    summary: "off-policy 随机 actor-critic，同时优化回报与策略 entropy。",
    intuition:
      "只贪眼前最高分，可能很快卡在一个还行的动作。SAC 奖励‘保持一些选择余地’，让策略仍会尝试别的动作。",
    core: "SAC 在最大熵 RL 目标中加入 αH(π)。它借 replay buffer 重用旧样本，通常用双 Q 网络缓解高估；随机 actor 便于持续探索。原论文和常见实现主要针对连续动作，离散 SAC 需相应改写。",
    equation: "J(π)=E[Σₜ γᵗ(rₜ+α H(π(·|sₜ)))]",
    whenToUse: [
      "连续控制、环境交互昂贵，希望重用样本。",
      "需要显式控制探索与利用的平衡。",
    ],
    howToUse: [
      "从 replay buffer 采样，训练双 Q 与随机 actor。",
      "对 tanh-squashed Gaussian 等策略正确计算 log-prob 修正与动作缩放。",
    ],
    tuning: [
      "温度 α 决定 entropy 权重；可使用自动温度调节变体。",
      "观察 Q 值、policy entropy、成功率与动作分布，不只看训练 reward。",
    ],
    modifications: [
      "离散动作要重写期望或求和，不能直接套连续版实现。",
      "可与视觉 encoder 或离线数据结合，但要处理分布外动作问题。",
    ],
    pitfalls: [
      "误以为 entropy 越大越好，探索会压过任务目标。",
      "tanh 变换后忘记 log-prob Jacobian 修正。",
    ],
    example:
      "机械臂学习抓取，SAC 一边利用已有成功经验，一边保持一定动作多样性。",
    compareTo: ["td3", "ppo", "ddpg"],
  },
  {
    id: "model-based-rl",
    source: {
      label: "Janner et al., Model-Based Policy Optimization",
      url: "https://arxiv.org/abs/1906.08253",
    },
    title: "先想象再行动：Model-Based RL",
    englishTitle: "Model-Based Reinforcement Learning",
    category: "reinforcement",
    level: "进阶",
    duration: "11 分钟",
    icon: "◍",
    summary: "学习环境的 dynamics/reward 模型，在模型中规划或生成额外经验。",
    intuition:
      "真实世界每次试错都贵；先学一个‘如果这样做，大概会发生什么’的模型，再在脑中试几步。模型越不准，想得越远越可能跑偏。",
    core: "学 p(s′,r|s,a) 或对规划足够的 latent dynamics，再用 planning、MPC 或短 imagined rollouts 改进决策。MBPO 以短 rollout 缓解模型误差累积；这是一类方法，不是单一网络。",
    equation: "ŝₜ₊₁ = fθ(sₜ,aₜ)；规划 aₜ:ₜ₊H 以最大化预测累计回报",
    whenToUse: [
      "环境采样昂贵，或需要规划/预测未来后果。",
      "有足够数据学到有用的短期动力学。",
    ],
    howToUse: [
      "先用真实 transition 拟合 dynamics，并在留出轨迹上验证多步误差。",
      "从短规划视界开始，比较真实环境与模型中的回报。",
    ],
    tuning: [
      "规划 horizon 太长会放大模型偏差；先短后长。",
      "用模型 ensemble 或不确定性估计识别不可靠预测。",
    ],
    modifications: [
      "MPC 每步重规划以减少远期预测误差。",
      "MuZero 在 latent space 学用于搜索的模型，不必像素级还原环境。",
    ],
    pitfalls: [
      "把模型预测的高分等同于真实环境高分。",
      "在模型不熟悉的动作上规划，找到模型漏洞而非好策略。",
    ],
    example: "无人车在模拟环境里预演几种转向；每走一步重新感知并重规划。",
    compareTo: ["muzero", "sac", "reinforcement-learning"],
  },
  {
    id: "muzero",
    source: {
      label: "Schrittwieser et al., MuZero",
      url: "https://www.nature.com/articles/s41586-020-03051-4",
    },
    title: "在隐空间规划：MuZero",
    englishTitle: "MuZero",
    category: "reinforcement",
    level: "高级",
    duration: "12 分钟",
    icon: "♞",
    summary: "学习适合规划的隐状态、动力学、奖励与价值，再用树搜索选动作。",
    intuition:
      "下棋不用在脑中重新渲染完整棋盘图像；只需保留对选择下一步有用的信息。MuZero 学的也是这种‘可用于推演’的内部状态。",
    core: "representation 把观测编码成隐状态，dynamics 预测下一隐状态与 reward，prediction 输出 policy 和 value。Monte Carlo tree search 在 learned model 上规划；它不要求事先提供游戏规则，但需要可交互环境、奖励与已知动作集合。",
    equation: "h₀=hθ(o₀)；(hₜ₊₁,r̂ₜ)=gθ(hₜ,aₜ)；(p̂ₜ,v̂ₜ)=fθ(hₜ)",
    whenToUse: [
      "想理解 learned dynamics 与 search 如何联合。",
      "有大量模拟交互和算力支持复杂规划时。",
    ],
    howToUse: [
      "准备可采样环境与明确 reward；先实现并验证简化树搜索。",
      "分别监控 reward、value、policy 预测与真实对局表现。",
    ],
    tuning: [
      "搜索模拟次数与训练数据量直接影响成本。",
      "unroll 长度过长使隐状态误差累积；按验证表现设定。",
    ],
    modifications: [
      "较小任务可用更简单的 model-based/MPC 方法。",
      "随机或部分可观测环境需要相应动态建模改造。",
    ],
    pitfalls: [
      "把‘不知道规则’理解为无环境交互或无需定义动作。",
      "把 latent model 当成必须能重建原始画面的生成模型。",
    ],
    example:
      "棋类中 MuZero 搜索不同落子在隐空间里的后续结果，再按搜索策略选择行动。",
    compareTo: ["model-based-rl", "ppo", "reinforcement-learning"],
  },
  {
    id: "behavior-cloning",
    source: {
      label: "Ross et al., DAgger",
      url: "https://arxiv.org/abs/1011.0686",
    },
    title: "先模仿专家：Behavior Cloning",
    englishTitle: "Imitation Learning / Behavior Cloning",
    category: "reinforcement",
    level: "入门",
    duration: "9 分钟",
    icon: "☷",
    summary: "把专家 state-action 示例当监督数据，直接学习策略。",
    intuition:
      "先照着老师开车的视频学打方向盘，比随机撞车起步容易；但一旦自己偏离老师走过的路，模型可能不知道怎样纠错。",
    core: "BC 通常最小化专家动作的监督损失，无需 reward 或 RL 更新。顺序决策中的 covariate shift 会让小错误逐步累积；DAgger 让当前策略访问的状态重新由专家标注。",
    equation: "minθ E(s,a*)∼Dexpert [−log πθ(a*|s)]",
    whenToUse: [
      "有高质量专家示例，在线试错昂贵或不安全。",
      "给 RL 策略一个可靠初始点。",
    ],
    howToUse: [
      "按完整轨迹切分训练与评估，避免相邻帧泄漏。",
      "部署前在闭环环境里测试偏离专家轨迹后的恢复能力。",
    ],
    tuning: [
      "关注专家覆盖的状态范围和动作标注一致性。",
      "比较 teacher-forced 预测准确率与闭环任务成功率。",
    ],
    modifications: [
      "可用 DAgger 迭代收集策略实际访问状态的专家动作。",
      "有可用 reward 后可接 RL 微调。",
    ],
    pitfalls: [
      "把 BC 称为需要 reward 的强化学习算法。",
      "只看离线动作准确率，忽略闭环误差累积。",
    ],
    example:
      "让机械臂模仿人工抓取示范，之后在真实闭环里检验是否能从轻微偏差中恢复。",
    compareTo: ["ppo", "rlhf", "reinforcement-learning"],
  },
  {
    id: "offline-rl",
    source: {
      label: "Levine et al., Offline RL Tutorial",
      url: "https://arxiv.org/abs/2005.01643",
    },
    title: "只用已有轨迹：Offline RL",
    englishTitle: "Offline / Batch Reinforcement Learning",
    category: "reinforcement",
    level: "进阶",
    duration: "10 分钟",
    icon: "▥",
    summary: "只从固定数据集学决策，不在训练中继续和环境交互。",
    intuition:
      "像只看过去的驾驶记录学开车：可以反复研究旧经验，但不能随时试一个新动作；数据没覆盖的选择尤其危险。",
    core: "与 online RL 不同，训练时数据集 D 固定。普通 off-policy 算法虽能重用旧数据，仍可继续采新样本；直接在固定 D 上最大化 Q 往往选到数据外动作，其估值缺乏支持。Offline RL 用保守估值、策略约束或序列建模缓解这个问题。",
    equation: "D = {(s,a,r,s′)} 固定；学习 π 时不向环境请求新 transition",
    whenToUse: [
      "真实交互贵、慢或有风险，但已有历史轨迹。",
      "需要先从日志学习候选策略再谨慎验证。",
    ],
    howToUse: [
      "先审计数据覆盖、行为策略、reward、终止标记与轨迹切分。",
      "以 behavior cloning 作基线，再与 CQL 等 offline 方法比较。",
    ],
    tuning: [
      "覆盖不足时算法再复杂也难推断未见动作的结果。",
      "关注保守强度与数据质量；有环境时用在线 rollout 验证。",
    ],
    modifications: [
      "CQL 显式压低数据外动作的 Q。",
      "Decision Transformer 把轨迹当条件序列做监督学习。",
    ],
    pitfalls: [
      "把 off-policy 和 offline 当同义词。",
      "只用同一份日志里的估计 reward 宣称新策略必定更好。",
    ],
    example:
      "医院有历史治疗决策记录却不能任意在线试错，可先离线研究候选策略并严格评估。",
    compareTo: ["cql", "decision-transformer", "behavior-cloning"],
  },
  {
    id: "cql",
    source: {
      label: "Kumar et al., Conservative Q-Learning",
      url: "https://arxiv.org/abs/2006.04779",
    },
    title: "对数据外动作保持保守：CQL",
    englishTitle: "Conservative Q-Learning",
    category: "reinforcement",
    level: "高级",
    duration: "11 分钟",
    icon: "⬖",
    summary: "在固定数据上训练 Q 时，惩罚未被数据支持动作的过高估值。",
    intuition:
      "日志从未试过某个动作，模型却凭外推说它收益极高；CQL 会对这种‘没证据的自信’扣分。",
    core: "CQL 是 offline RL 的 value-based 家族，在 Bellman 误差之外加保守正则，使策略可能选择的数据外动作 Q 值相对数据动作更低。不同动作空间有不同近似与实现；保守过度也可能压低真正有用的动作。",
    equation: "L = LBellman + α(Eₛ log Σₐ exp Q(s,a) − E(s,a)∼D Q(s,a))",
    whenToUse: [
      "只能用固定日志，普通 Q-learning 选出明显脱离数据的动作。",
      "希望学习比 BC 更好的策略，同时限制外推高估。",
    ],
    howToUse: [
      "先建立 BC 与普通 Q 基线，确认数据中存在可利用的质量差异。",
      "实现 Bellman loss 加保守项，并在 held-out 轨迹与环境评估。",
    ],
    tuning: [
      "α 太小仍高估数据外动作，太大会过度保守。",
      "观察策略动作与数据动作的距离、Q 尺度和最终回报。",
    ],
    modifications: [
      "连续动作需采样近似 log-sum-exp。",
      "数据覆盖很好时可降低保守强度；覆盖差时应先改进采集。",
    ],
    pitfalls: [
      "把公式中的所有动作求和直接搬到不可枚举的连续空间。",
      "认为保守估值能凭空弥补日志里没有高质量示范。",
    ],
    example:
      "固定机器人操作日志里没有极端力矩，CQL 抑制对这些未见力矩的虚高评价。",
    compareTo: ["offline-rl", "q-learning", "decision-transformer"],
  },
  {
    id: "decision-transformer",
    source: {
      label: "Chen et al., Decision Transformer",
      url: "https://arxiv.org/abs/2106.01345",
    },
    title: "把轨迹当语言来建模",
    englishTitle: "Decision Transformer",
    category: "reinforcement",
    level: "高级",
    duration: "11 分钟",
    icon: "⫷",
    summary: "把目标回报、状态和动作排成序列，以条件预测下一个动作。",
    intuition:
      "像语言模型根据前文续写下一个词：给它‘希望总回报有多高’和先前经历，让它续写下一个动作。",
    core: "Decision Transformer 属于 offline RL 的 sequence-modeling 路线。训练时对轨迹中的 return-to-go、state、action 做因果序列建模，用监督损失预测动作；没有显式 Bellman backup。目标回报条件不保证模型能做出数据中不存在的高回报行为。",
    equation: "aₜ ~ πθ(aₜ | Rtarget, s₁,a₁,…,sₜ)",
    whenToUse: [
      "已有覆盖不同表现水平的完整轨迹，想试序列建模路线。",
      "需对照 CQL 的价值学习与 BC 的直接模仿。",
    ],
    howToUse: [
      "保留轨迹时序，计算每个时刻的 return-to-go。",
      "输入目标回报与历史状态/动作，训练 causal model 预测动作。",
    ],
    tuning: [
      "上下文长度影响长期信息与计算成本。",
      "目标回报必须与数据可达到的范围一致，并做闭环评估。",
    ],
    modifications: [
      "可替换更适合图像或连续动作的 encoder/head。",
      "数据更简单时先试 BC，避免 Transformer 成本无收益。",
    ],
    pitfalls: [
      "把高目标回报提示当成性能保证。",
      "训练时泄漏未来动作或未来状态，导致虚高离线结果。",
    ],
    example:
      "从游戏历史轨迹学动作序列，推理时指定合理的目标分数并逐步更新剩余回报。",
    compareTo: ["offline-rl", "cql", "behavior-cloning"],
  },
  {
    id: "reward-model",
    source: {
      label: "Ouyang et al., InstructGPT",
      url: "https://arxiv.org/abs/2203.02155",
    },
    title: "RM：把偏好变成可学习的分数",
    englishTitle: "Reward Model",
    category: "reinforcement",
    level: "进阶",
    duration: "10 分钟",
    icon: "♡",
    summary: "从偏好成对比较中学习评分函数，给后续策略优化提供代理奖励。",
    intuition:
      "人工不容易给一篇答案打‘精确 7.3 分’，却容易在两篇答案中挑较好的一篇。RM 学的是这种相对偏好。",
    core: "对同一 prompt 的 chosen/rejected 回复分别输出标量 reward，通常以 Bradley–Terry 式 pairwise loss 训练。分数只是标注者偏好的代理，会受数据覆盖、偏差和模型利用影响；它不是语言模型本身，也不等于真实人类价值。",
    equation: "L = −log σ(rθ(x,y⁺) − rθ(x,y⁻))",
    whenToUse: [
      "有人类或可信偏好成对标注，且需要给新回复打分。",
      "RLHF 训练或 reranking 需要可学习的偏好信号。",
    ],
    howToUse: [
      "对相同 prompt 收集成对候选与偏好标签，并保证标注规范。",
      "训练后检查 held-out pair accuracy、跨任务泛化与人工评估。",
    ],
    tuning: [
      "关注数据多样性、标注者一致性和模型对长度等捷径的偏好。",
      "评分数值的绝对尺度通常不如排序、校准和稳健性重要。",
    ],
    modifications: [
      "可用多个 RM 检查分歧，或对不同偏好维度分别建模。",
      "DPO 直接用偏好对优化策略，不显式训练独立 RM。",
    ],
    pitfalls: [
      "把 RM 分高误当人类一定更喜欢。",
      "让策略反复优化固定 RM 而不复核真实偏好，产生 reward hacking。",
    ],
    example:
      "给同一问题生成两个答复，人工选较好的一个；RM 从大量这样的比较中学习排序。",
    compareTo: ["rlhf", "dpo", "loss-functions"],
  },
  {
    id: "rlhf",
    source: {
      label: "Ouyang et al., InstructGPT",
      url: "https://arxiv.org/abs/2203.02155",
    },
    title: "RLHF：用人类偏好微调语言模型",
    englishTitle: "Reinforcement Learning from Human Feedback",
    category: "reinforcement",
    level: "高级",
    duration: "12 分钟",
    icon: "✦",
    summary: "从示范、偏好比较与奖励模型出发，优化语言模型的回复策略。",
    intuition:
      "预训练会续写文本；示范告诉模型‘怎样答’，偏好比较告诉它‘两个答案哪个更好’，RL 再让它多生成受偏好的回答。",
    core: "经典 InstructGPT 流程是 SFT → 偏好数据训练 RM → 用 PPO 优化 policy，同时约束相对 reference model 的偏移。RLHF 是训练流程，不是某个单独模型；RM 的误差和标注分布都会影响结果。",
    equation: "maxπ E[y∼π(·|x)] [rRM(x,y)] − β DKL(π(·|x)∥πref(·|x))",
    whenToUse: [
      "有充足高质量示范/偏好数据、评估资源与在线采样能力。",
      "希望优化难以直接写成 token-level 监督标签的回复偏好。",
    ],
    howToUse: [
      "先建立强 SFT baseline，并用独立偏好集评估 RM。",
      "PPO 训练时监控真实人工偏好、KL、回复长度与 reward，而不只看 RM 分数。",
    ],
    tuning: [
      "KL 系数 β 控制远离 reference 的程度，过低易利用 RM 漏洞。",
      "奖励归一化、PPO update 步数和采样批量影响稳定性。",
    ],
    modifications: [
      "资源或流程约束下可比较 DPO。",
      "偏好目标变化时应重新审查标注和评估，而非只重调 PPO。",
    ],
    pitfalls: [
      "把 RM 奖励提高当作最终质量保证。",
      "把所有 post-training 都叫 RLHF；SFT 和 DPO 各有不同优化机制。",
    ],
    example:
      "对客服回答标注‘更清楚、更有帮助’的偏好，再用 RM 和 PPO 调整回答风格。",
    compareTo: ["reward-model", "ppo", "dpo"],
  },
  {
    id: "dpo",
    source: {
      label: "Rafailov et al., DPO",
      url: "https://arxiv.org/abs/2305.18290",
    },
    title: "DPO：直接用偏好对训练",
    englishTitle: "Direct Preference Optimization",
    category: "reinforcement",
    level: "进阶",
    duration: "11 分钟",
    icon: "⇄",
    summary:
      "从 chosen/rejected 回复直接优化 policy，无需独立 RM 与在线 PPO rollout。",
    intuition:
      "RLHF 先训练裁判 RM 再让选手跟着裁判练；DPO 从‘A 比 B 好’的记录直接调整选手，让 A 相对 B 更有可能出现。",
    core: "DPO 从 KL 约束的奖励最大化目标推导出 pairwise classification loss，以 reference policy 的 log-prob 差为基准。它是 preference optimization，不执行标准环境交互式 RL；效果依赖偏好数据覆盖与 reference 模型。",
    equation:
      "L = −E log σ(β[(logπθ(y⁺|x)−logπref(y⁺|x))−(logπθ(y⁻|x)−logπref(y⁻|x))])",
    whenToUse: [
      "有可靠偏好对，希望简化 LM 偏好微调流程。",
      "训练资源不适合独立 RM 加在线 PPO。",
    ],
    howToUse: [
      "先准备 SFT policy 和冻结的 reference policy。",
      "对同 prompt 的 chosen/rejected 分别计算序列 log-prob，按 DPO loss 更新 policy。",
    ],
    tuning: [
      "β 控制相对 reference 的偏好强度；结合人工评估调。",
      "检查偏好对质量、长度偏差与训练/验证分布差异。",
    ],
    modifications: [
      "噪声偏好明显时可研究针对噪声的稳健目标。",
      "若需要在线探索和独立可复用的 RM，可回到 RLHF 流程。",
    ],
    pitfalls: [
      "把 DPO 说成训练了显式 reward model。",
      "只看离线偏好 loss 下降，忽略开放式生成质量与分布外提示。",
    ],
    example: "同一提问有较好和较差两个回答，DPO 提高前者相对后者的条件概率。",
    compareTo: ["rlhf", "reward-model", "ppo"],
  },
];
