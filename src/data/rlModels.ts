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
    mechanicsSteps: [
      "为每个 arm 维护选择次数 N(a) 与收益估计 Q(a)，先定义 reward 的时间窗口和延迟。",
      "每轮依据 ε-greedy 或 UCB 选 arm；UCB 的探索项随次数增加而缩小。",
      "观察反馈后，只更新所选 arm 的估计；平稳环境可用样本均值，非平稳环境用常数步长。",
      "用累计 regret、分组收益和流量分配评估；记录每次被选概率以支持离线校正。",
    ],
    limits: [
      "假定动作不会显著改变下一轮状态；若广告会改变用户长期偏好，应考虑 MDP。",
      "反馈延迟且缺失模式随动作或用户变化时，直接把未到达的结果当零会有偏差。",
    ],
    settings: [
      {
        name: "探索率 ε",
        start: "先做随机与固定 ε 基线，再用递减 ε 对照。",
        adjust: "早期长期锁定一个 arm 就增加探索；流量持续浪费就降低后期 ε。",
      },
      {
        name: "价值更新步长",
        start: "稳定收益用 1/N(a)；随时间漂移用常数步长。",
        adjust: "旧活动持续主导估计时增大新反馈权重；估计抖动太大则减小。",
      },
      {
        name: "UCB 探索系数",
        start: "先按各 arm 收益量纲归一化后进行小范围比较。",
        adjust: "冷门 arm 几乎不被访问时提高；低价值 arm 被反复尝试时降低。",
      },
    ],
    whenToUse: [
      "A/B 测试、推荐位等即时反馈决策，且动作不改变未来状态。",
      "先理解 RL 探索，再进入 Q-learning。",
    ],
    howToUse: [
      "明确每个 arm 和可观测 reward，先跑随机策略作基线。",
      "分别记录累计回报与各 arm 的选择次数，避免只看最后一次收益。",
      "随机分流冷启动，确认各 arm 反馈和延迟定义一致。",
      "逐时段画出每个 arm 的样本数、置信区间与策略分流比例。",
    ],
    tuning: [
      "ε 太小易早熟，太大浪费样本；可比较固定 ε 与随时间下降的 ε。",
      "非平稳环境用滑动窗口或指数加权估计，别无限累积旧反馈。",
      "反馈延迟导致近期 arm 被误判时，按成熟样本窗口更新，别把未到达奖励当零。",
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
    compareTo: [
      "q-learning",
      "reinforcement-learning",
      "off-policy-evaluation",
    ],
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
    equation:
      "Q(s,a)←Q(s,a)+α[r+γ(1−d)maxₐ′Q(s′,a′)−Q(s,a)];  d=1 仅表示任务真正终止",
    mechanicsSteps: [
      "建离散 Q(s,a) 表并只允许合法动作；未访问状态用一致的初值。",
      "用 ε-greedy 行为策略取 a，环境返回 r、s′、terminated 与 truncated。",
      "构造 target：真正终止时 y=r；非终止时 y=r+γ max Q(s′,a′)，时间截断需按任务语义处理 bootstrap。",
      "对访问的格子做 Q←Q+α(y−Q)，重复交互并用独立贪心评估回报。",
    ],
    limits: [
      "状态与动作必须可枚举且覆盖足够；高维图像或连续动作不能直接开表。",
      "off-policy 的 max target 可能高估噪声；危险探索任务可比较 SARSA。",
    ],
    settings: [
      {
        name: "学习率 α",
        start: "平稳小表可用随访问次数递减的步长。",
        adjust: "Q 值来回震荡就减小；新数据长期不起作用就提高或放慢衰减。",
      },
      {
        name: "折扣 γ",
        start: "根据任务关键奖励相隔的步数选，使相应 γ^H 有实际权重。",
        adjust: "只贪即时奖励就提高；回报目标高方差且训练不稳就降低。",
      },
      {
        name: "探索 ε",
        start: "先保证各 state-action 被访问，再逐渐转向贪心。",
        adjust: "状态覆盖低就延长探索；后期策略仍随机犯错就减低评估 ε。",
      },
    ],
    whenToUse: [
      "状态与离散动作都较少、可以枚举时。",
      "作为检验环境 reward 和终止逻辑的透明 baseline。",
    ],
    howToUse: [
      "定义 state、合法动作、reward 与终止条件。",
      "用 ε-greedy 收集轨迹；对 terminal transition 不加未来价值。",
      "先用小型确定性环境手算一条 Bellman 更新，核对代码。",
      "分别记录训练行为策略与独立贪心策略的回报，避免把探索成本当学习失败。",
    ],
    tuning: [
      "α 控制每次更新幅度，γ 控制未来回报权重。",
      "ε 随训练下降仍需保留一定探索，并跨随机种子评估。",
      "Q 值异常偏高时核查 terminal/truncated 处理与 max target，再考虑 Double Q。",
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
    equation:
      "Q(s,a)←Q(s,a)+α[r+γ(1−d)Q(s′,a′)−Q(s,a)];  d=1 时目标为 r，无需采 a′",
    mechanicsSteps: [
      "初始化 Q 和当前行为策略 π，例如 ε-greedy(Q)。",
      "在 s 采样并执行 a，观察 r、s′；若未终止，再按同一 π 在 s′ 采样 a′。",
      "用 r+γQ(s′,a′) 更新 Q(s,a)；真正终止时目标只含 r。",
      "把已采样的 a′ 作为下一轮要执行的动作，策略随 Q 更新后继续。",
    ],
    limits: [
      "学的是当前探索策略的价值；ε 变化时目标策略也在变，需分别评价训练与最终执行策略。",
      "表格 SARSA 仍需有限可覆盖状态动作；高维空间需函数近似与稳定化。",
    ],
    settings: [
      {
        name: "探索 ε",
        start: "有危险动作时先采用可控探索计划并定义安全边界。",
        adjust: "风险暴露过高就减少或约束探索；覆盖不足就增加。",
      },
      {
        name: "学习率 α",
        start: "先按访问次数递减，观察每个状态的更新量。",
        adjust: "回报大幅摆动时降低；几乎不改进时减慢衰减。",
      },
      {
        name: "折扣 γ",
        start: "按任务的有效决策跨度选，使未来风险能进入目标。",
        adjust: "策略只看眼前时提高；长远价值估计噪声太大时降低。",
      },
    ],
    whenToUse: [
      "探索动作本身有明显风险，想学当前 ε-greedy 行为的价值。",
      "教学中对照 Q-learning 的 on/off-policy 区别。",
    ],
    howToUse: [
      "在当前 state 采样 a，执行后在下一 state 依同一策略采样 a′。",
      "用这五元组更新，再把 a′ 当作下一轮实际动作。",
      "将采样 a′ 与下一轮执行 a′ 写成同一个变量，避免代码偏离 on-policy。",
      "在有风险边界的环境同时比较 SARSA 与 Q-learning 的实际探索回报。",
    ],
    tuning: [
      "与 Q-learning 一样先调 α、γ 和探索计划。",
      "比较不同 ε 下的实际执行回报，而不只比较贪心评估。",
      "训练表现不错而贪心部署退化时，检查 ε 调度与部署策略的分布差异。",
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
    equation:
      "y=r+γ(1−d)maxₐ′Qθ⁻(s′,a′);  L=E[(Qθ(s,a)−stopgrad(y))²];  d=1 表示真正终止",
    mechanicsSteps: [
      "online Q 网络输出每个离散动作的估值；ε-greedy 选动作并写入 replay。",
      "从 replay 随机抽 transition，明确 terminated 与 time-limit truncated 的不同 bootstrap 语义。",
      "用冻结的 target 网络计算 y=r+γ max Qtarget(s′,·)，终止状态去掉后半项。",
      "最小化 TD loss，定期同步 target；用独立评估环境追踪贪心回报和 Q 尺度。",
    ],
    limits: [
      "标准 DQN 需枚举 max 的离散动作；连续控制通常选 TD3/SAC。",
      "replay 不能凭空解决稀疏奖励、覆盖不足或环境非平稳。",
    ],
    settings: [
      {
        name: "replay 容量与预热",
        start: "先收集覆盖基本状态的样本再更新，容量能覆盖多种轨迹。",
        adjust:
          "批次高度重复就增加多样性；环境变化后旧数据拖累学习就缩短保留窗口。",
      },
      {
        name: "target 同步间隔",
        start: "用冻结 target 作基线，再比较软更新。",
        adjust: "Q 目标急剧漂移就减慢同步；长期跟不上改善的 Q 则加快。",
      },
      {
        name: "探索 ε",
        start: "在早期保持较广状态覆盖，随后衰减；评估时单独设定。",
        adjust: "同一动作垄断回放就提高探索；后期回报被随机动作拖低则降低。",
      },
    ],
    whenToUse: [
      "图像或高维状态，动作数有限且离散。",
      "需要从 value-based 方法学习表示时。",
    ],
    howToUse: [
      "建立 replay buffer，先收集足够多样的经验再开始更新。",
      "线上网络选动作并训练；目标网络定期复制或缓慢跟随。",
      "先在低维环境验证 Q target 与动作索引，再接图像 encoder。",
      "画 episode return、平均/最大 Q、TD error 和 replay 中动作频率，定位失败来源。",
    ],
    tuning: [
      "优先检查探索 ε、replay 容量、目标网络同步频率。",
      "观察 TD error、Q 值尺度和每个随机种子的回报。",
      "Q 发散时先核查 reward 尺度、target 与终止 mask，再降低学习率或放慢 target 更新。",
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
    equation: "y=r+γ(1−d)Qtarget(s′,argmaxₐQonline(s′,a));  d=1 表示真正终止",
    mechanicsSteps: [
      "沿用 DQN 的 online、target 网络与 replay。",
      "在 s′ 用 online 网络 argmax 选择 a*，不要在此步读 target 的最大值。",
      "用 target 网络只评估 Qtarget(s′,a*)；真正终止时 target=y=r。",
      "以同样 TD loss 更新 online，比较 Q 预测与实际折扣回报的校准。",
    ],
    limits: [
      "主要缓解 max 运算造成的高估，不能修复探索不足或奖励设计错误。",
      "仍要求有限离散动作；连续动作可看 TD3 的双 critic 方案。",
    ],
    settings: [
      {
        name: "target 同步速度",
        start: "先继承验证过的 DQN 设置，只改选择与评估分工。",
        adjust: "Q 值震荡就放慢；target 过旧而学习停滞就加快。",
      },
      {
        name: "探索计划",
        start: "与 DQN 使用同样 ε 调度，便于公平对照。",
        adjust: "高估下降但覆盖仍差，就延长探索。",
      },
      {
        name: "学习率与损失",
        start: "先沿用 DQN 的优化器与 TD loss，再观察 Q 尺度。",
        adjust: "估值仍漂移就减小步长或采用稳健误差损失。",
      },
    ],
    whenToUse: [
      "DQN 的 Q 值明显高估、训练不稳或贪心策略表现差。",
      "希望以很小实现改动获得更稳健的离散动作 baseline。",
    ],
    howToUse: [
      "保留 DQN 的 replay buffer 和 target 更新。",
      "检查 argmax 由 online 网络算，最终 Q 数值由 target 网络算。",
      "用一个两动作小样本手算 online 选、target 评，做单元核对。",
      "固定相同环境步数和随机种子，对照 DQN 的回报与高估程度。",
    ],
    tuning: [
      "先沿用 DQN 超参数，再评估目标更新速度和探索计划。",
      "同时画 Q 预测与实际回报，确认高估是否改善。",
      "若 Double DQN 的回报无提升，先确认任务是否真的受高估主导。",
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
    core: "共享特征后分成 V(s) 与 A(s,a)，再组合成 Q(s,a)。减去所有动作 advantage 的均值，处理 V 和 A 可任意平移的不可辨识性。采用此均值中心化时，V 等于各动作 Q 的算术均值，不应直接当成任意策略的 Vπ；原始 A 分支也不是已经中心化的优势。它是网络架构改造，可叠加 DQN 或 Double DQN。",
    equation: "Q(s,a)=V(s)+A(s,a)−meanₐ′A(s,a′);  因而 V(s)=meanₐQ(s,a)",
    mechanicsSteps: [
      "共享 encoder 提取状态表征，之后分为标量 V(s) 和动作向量 A(s,·)。",
      "对动作维度中心化 advantage，再组合 Q(s,a)=V+A−mean A。",
      "用组合后的 Q 做 ε-greedy、TD target 与 loss；其余 DQN 流程不变。",
      "在相同训练预算下与普通 Q head 比较学习曲线，特别观察相近动作的状态。",
    ],
    limits: [
      "当各动作优势差异很明确时，增加双 head 不一定带来收益。",
      "只是 Q 网络结构，不能替代 replay、target 或探索机制。",
    ],
    settings: [
      {
        name: "共享层容量",
        start: "先与原 DQN 使用同规模 encoder，保持比较公平。",
        adjust: "两 head 均欠拟合再增大；训练成本上涨而收益不变则缩小。",
      },
      {
        name: "V/A head 宽度",
        start: "从相近宽度的轻量 head 开始。",
        adjust: "V 稳定但动作区分差时增加 A 表达能力；反之检查 V。",
      },
      {
        name: "target 与探索",
        start: "先继承可工作的 DQN/Double DQN 配置。",
        adjust: "回报震荡或状态覆盖差时分别调整 target 频率或 ε。",
      },
    ],
    whenToUse: [
      "同一状态下有许多价值接近的离散动作。",
      "已有可靠 DQN/Double DQN baseline，想改进价值表示。",
    ],
    howToUse: [
      "在共享 encoder 后接 value head 和 advantage head。",
      "组合 Q 后仍按原 DQN 的 TD loss 与 replay 训练。",
      "检查输出形状：V 为每状态一个值，A 为每状态每动作一个值。",
      "比较同一状态的动作 Q 差与平均状态价值，避免只看训练 loss。",
    ],
    tuning: [
      "对照普通 head 的回报和学习速度，不只看参数量。",
      "注意分支宽度、目标更新与探索超参数。",
      "两条分支输出尺度失衡时，查看归一化、初始化和学习率再调整 head。",
    ],
    modifications: [
      "可叠加 Double DQN；Rainbow 将多种 DQN 改进组合。",
      "有动作 mask 时只在合法动作上选择与评估。",
    ],
    pitfalls: [
      "把原始 A 分支当成真实 Aπ，或把均值中心化得到的 V 当成 maxₐQ；训练直接约束的是组合后的 Q。",
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
    mechanicsSteps: [
      "先确定可复现的 DQN 基线，再加入 Double target 与 dueling head。",
      "按 TD error 优先采样 replay，并对采样偏差使用 importance weight。",
      "用 n-step return 传播较远奖励；distributional head 预测固定支持上的回报分布并投影 Bellman target。",
      "以 NoisyNet 提供参数噪声探索；逐组件消融并报告每环境步的实际收益。",
    ],
    limits: [
      "组件相互作用复杂，样本或算力少时可能难以定位失败。",
      "原组合面向有限离散动作，并不直接解决连续控制。",
    ],
    settings: [
      {
        name: "PER 优先指数",
        start: "先关闭 PER 建基线，再小幅增加对大 TD error 的偏好。",
        adjust: "少数异常样本反复占据 batch 就降低；重要转移学得慢则提高。",
      },
      {
        name: "importance 修正",
        start: "引入 PER 时同步设置采样偏差修正并随训练检查。",
        adjust: "估计偏差明显时加强修正；权重方差过高时检查优先分布。",
      },
      {
        name: "n-step 与 value support",
        start: "n 从短回报跨度开始，support 按任务回报范围覆盖。",
        adjust: "稀疏奖励传得慢就增加 n；分布卡在边界就扩大 support。",
      },
    ],
    whenToUse: [
      "想研究高性能离散动作 value-based agent 的组合设计。",
      "已理解各组件作用，能做 ablation。",
    ],
    howToUse: [
      "先复现稳定 DQN，再逐项接入组件并做消融。",
      "核对 n-step target、优先回放权重和 distributional projection 实现。",
      "每加一个组件只改变对应代码路径，并保留训练预算相同的对照。",
      "检查 C51 投影后的概率和为 1、回报极值没有被支持边界错误截断。",
    ],
    tuning: [
      "优先回放强度与重要性采样修正需共同调。",
      "NoisyNet 探索与 ε-greedy 的组合要明确，避免重复或不足。",
      "回报改善但 wall-clock 变差时，按环境步和真实运行时间分别比较。",
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
    equation: "J=E[Σₜγᵗrₜ], Gₜ=Σₖ≥ₜγᵏ⁻ᵗrₖ;  ∇θJ≈Σₜγᵗ∇θlogπθ(aₜ|sₜ)·(Gₜ−b(sₜ))",
    mechanicsSteps: [
      "从当前 πθ 采完整轨迹并保存每步 log πθ(a|s)、reward 与有效动作 mask。",
      "从后向前算每一步 action 后的 return-to-go Gt，而不是所有步共用整局总回报。",
      "把 γᵗ(Gₜ−b(sₜ)) 当作固定权重乘 log-prob 构造负损失；baseline 不依赖当前动作，actor loss 对该权重 stop-gradient，另行拟合 baseline。",
      "按 batch 轨迹更新策略，立即废弃旧 on-policy 轨迹并独立评估。",
    ],
    limits: [
      "整条轨迹的 Monte Carlo 估计方差高，长时延和稀疏奖励时样本效率低。",
      "每次更新需新轨迹；重用大量旧数据更适合 off-policy 方法。",
    ],
    settings: [
      {
        name: "轨迹 batch 数",
        start: "先让每批含多个完整 episode，观察梯度方差。",
        adjust: "跨批更新方向乱跳就增大；收集成本过高则考虑 actor-critic。",
      },
      {
        name: "baseline",
        start:
          "先用历史批次的移动均值或 leave-one-out 均值作基线，再试状态价值 V(s)。",
        adjust:
          "回报波动主导梯度时改进 baseline；有系统偏差时核查是否依赖动作。",
      },
      {
        name: "学习率",
        start: "从能稳定改进小任务的保守步长起。",
        adjust:
          "policy entropy 突然坍塌就降低；梯度信号很弱则检查 reward 尺度后再提高。",
      },
    ],
    whenToUse: [
      "学习 policy gradient 的最小完整实现。",
      "动作可微地参数化为概率分布而 Q 枚举不方便。",
    ],
    howToUse: [
      "让策略输出合法动作概率，从当前策略采集完整轨迹。",
      "从后向前计算折扣回报，乘 log-probability 后更新参数。",
      "用手写短轨迹核对每步 Gt，确认折扣与终止位置。",
      "记录每轮策略 entropy 和 episode return，以区分探索耗尽与梯度噪声。",
    ],
    tuning: [
      "先做 reward normalization 或 baseline 来减小方差。",
      "调学习率和 batch 内轨迹数；报告跨随机种子的波动。",
      "若奖励稀疏导致几乎全零更新，先做奖励诊断或加入可解释的中间信号。",
    ],
    modifications: [
      "用 learned value baseline 发展为 actor-critic。",
      "用 PPO 的限制更新幅度降低大步更新的风险。",
    ],
    pitfalls: [
      "用旧策略数据直接重复很多轮当作标准 on-policy REINFORCE。",
      "把整局总回报版本误判为数学上无效：它也是合法的 score-function 估计，但过去奖励增加无用噪声，return-to-go 通常更合适。",
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
    mechanicsSteps: [
      "Actor π(a|s) 从当前策略采 rollout，Critic V(s) 预测同一状态的期望回报。",
      "用 n-step bootstrap 或 GAE 计算 advantage：实际后果相对 V(s) 高多少。",
      "以 advantage 加权 log-prob 更新 Actor，以 return target 回归 Critic；可加入 entropy bonus。",
      "丢弃或按具体算法处理旧 rollout，分别检查 actor、critic 与真实回报是否同向改善。",
    ],
    limits: [
      "A2C/A3C 是 on-policy，不能把 replay 旧轨迹直接当同分布数据反复更新。",
      "Critic 估错会把错误 advantage 传给 Actor；难学的长时延任务需特别检查价值误差。",
    ],
    settings: [
      {
        name: "rollout 长度",
        start: "从能看到关键反馈的短 rollout 开始，末端用 V bootstrap。",
        adjust:
          "长期奖励传不回来就加长；方差和采样成本过大则缩短并改进 critic。",
      },
      {
        name: "value loss 权重",
        start: "先让 actor 与 critic 损失规模都可监控。",
        adjust: "V 几乎不学就提高；policy 停滞且 critic 主导梯度则降低。",
      },
      {
        name: "entropy bonus",
        start: "训练早期保持适量探索，评估时使用规定的动作选择规则。",
        adjust: "动作分布过早坍塌就提高；长期随机无进展就降低。",
      },
    ],
    whenToUse: [
      "REINFORCE 方差过大，需要更及时的价值反馈。",
      "理解 PPO、SAC 等更复杂算法的共同结构。",
    ],
    howToUse: [
      "并行环境收集 rollout，计算 n-step return 或 advantage。",
      "分别监控策略损失、value loss、entropy 与真实 episode return。",
      "先单独验证 V(s) 对 held-out rollout 回报的校准，避免坏 critic 指挥 actor。",
      "比较完整 return 与 n-step advantage 的方差和学习速度。",
    ],
    tuning: [
      "critic loss 权重过大可压制 actor，过小则 advantage 噪声高。",
      "rollout 长度、entropy bonus、梯度裁剪影响稳定性。",
      "Actor loss 数值变好但真实回报变差时，核查 advantage 方向、采样策略和 entropy 权重。",
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
    mechanicsSteps: [
      "用旧策略收集 rollout 并估计每步 advantage。",
      "定义重要性比率 surrogate 与旧、新策略的平均 KL 约束。",
      "用 Fisher-vector product 与共轭梯度近似受约束的更新方向。",
      "line search 检查候选参数的实际 surrogate 改进与 KL，再采新数据。",
    ],
    limits: [
      "二阶近似、line search 与策略分布 KL 实现复杂，工程成本高于 PPO。",
      "理论改进界依赖假设与精确优化，有限样本近似不能保证每轮真实回报上涨。",
    ],
    settings: [
      {
        name: "KL 预算 δ",
        start: "以保守信任域开始，记录每轮实际 KL。",
        adjust: "更新后回报骤降就收紧；学习极慢且 KL 总远低预算可放宽。",
      },
      {
        name: "共轭梯度迭代",
        start: "先让线性系统残差达到稳定可接受水平。",
        adjust: "方向不稳就增加迭代或阻尼；计算开销过高且收益不变就减少。",
      },
      {
        name: "line search 回退",
        start: "候选步需同时满足 KL 和 surrogate 改进。",
        adjust: "频繁拒绝更新就检查 advantage、阻尼和初始步长。",
      },
    ],
    whenToUse: [
      "研究 trust region 更新与 policy 稳定性的原理。",
      "已有 TRPO 工具链，愿意承担较高实现复杂度。",
    ],
    howToUse: [
      "从当前策略采样，估计 advantage。",
      "在 KL 约束下求候选更新，并用 line search 核验改进与约束。",
      "在已验证 PPO/简单环境上核对 KL 计算与方向，再启用高维策略。",
      "将近似 KL、实际 KL、接受率、真实回报画在同一训练轴上。",
    ],
    tuning: [
      "δ 过大易不稳，过小则学习缓慢。",
      "监控实际 KL、回报与 advantage 估计误差。",
      "line search 总失败时先检查 advantage 标准化和共轭梯度数值误差。",
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
    mechanicsSteps: [
      "以当前 policy 收集 rollout，保存 old log-prob、V(s)、reward、terminated/truncated。",
      "按 GAE/return 计算 advantage 与 critic target；真正终止时不 bootstrap，时间截断视环境语义处理。",
      "计算 r=exp(logπnew−logπold)，对正负 advantage 都使用 min(rA,clip(r)A) surrogate。",
      "做有限 minibatch epoch，监控 KL/clip fraction；随后重新采样而非无限重用旧轨迹。",
    ],
    limits: [
      "on-policy 需要按当前策略持续采样；固定环境轨迹应比较 offline RL。语言模型的固定偏好对是另一种数据设定，可比较 DPO。",
      "clipping 只限制 surrogate 激励，不是 KL 或回报的硬保证。",
    ],
    settings: [
      {
        name: "clip ε",
        start: "可从论文常用的 0.2 作实验基线，并监控实际 KL。",
        adjust: "KL/clip fraction 偏大且回报掉落就减小；更新过弱可适度增大。",
      },
      {
        name: "update epoch",
        start: "少量 epoch 利用新 rollout，随后重采。",
        adjust: "训练过拟合一批轨迹或 KL 快速上升就减少；数据利用不足再增加。",
      },
      {
        name: "GAE λ 与 rollout",
        start: "先以常见 λ≈0.95 和覆盖关键反馈的 rollout 作基线。",
        adjust: "advantage 方差大可减 λ；长程收益传不回可加长 rollout 或增 λ。",
      },
    ],
    whenToUse: [
      "有模拟器可持续采新数据，想要通用 policy optimization baseline。",
      "动作可离散或连续，且需要较易实现的策略更新。",
    ],
    howToUse: [
      "用当前 policy 收集 rollout，保存 old log-prob，计算 returns 与 advantage。",
      "对 rollout 做有限 epoch 的 minibatch 更新，随后丢弃旧数据重新采样。",
      "分别核对连续动作的 log-prob 与动作裁剪/变换是否一致。",
      "定义独立评估回合，报告平均回报、波动、KL 和任务成功率。",
    ],
    tuning: [
      "重点监控 clip fraction、approx KL、entropy、value loss。",
      "调 clip ε、epoch 数、学习率、GAE λ 与每批采样步数。",
      "value loss 暴涨时先检查 reward normalization、bootstrap mask 与 critic target。",
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
    mechanicsSteps: [
      "Actor μ(s) 输出环境允许范围内的连续动作；收集时加入探索噪声。",
      "将 transition 存 replay，从 batch 以 target actor 产生下一动作。",
      "target critic 构造 Bellman 目标训练 critic，终止状态不加未来 Q。",
      "沿 ∇aQ(s,a) 对 Actor 参数反传，并软更新 actor/critic 的 target 网络。",
    ],
    limits: [
      "确定性策略需要外加探索噪声；稀疏奖励环境仍可能找不到有效动作。",
      "Actor 会放大 Critic 的估值错误；若高估明显，TD3/SAC 通常是更稳的起点。",
    ],
    settings: [
      {
        name: "行动探索噪声",
        start: "按动作允许范围设置相对尺度，确保随机动作仍合法。",
        adjust: "replay 动作几乎相同就增大；控制频繁撞边界就减小。",
      },
      {
        name: "target 软更新 τ",
        start: "先让 target 慢于 online 变化。",
        adjust: "Q target 快速震荡就减小 τ；target 长期落后而学习慢就增大。",
      },
      {
        name: "Actor/Critic 步长",
        start: "先让 critic 能预测有区分度的 Q，再更新 Actor。",
        adjust: "Actor 钻估值漏洞就减慢 Actor；Critic 长期拟合差先修 Critic。",
      },
    ],
    whenToUse: [
      "连续动作控制，想理解 TD3 的直接前身。",
      "可反复使用历史交互、环境采样成本较高。",
    ],
    howToUse: [
      "对 actor 和 critic 都建立缓慢更新的 target network。",
      "在 replay buffer 上更新 critic，再沿 critic 对动作的梯度更新 actor。",
      "明确模型输出归一化范围到真实动作范围的缩放，测试上下界。",
      "每次评估关闭训练探索噪声，分别报告执行回报与 critic 预测。",
    ],
    tuning: [
      "探索噪声尺度、actor/critic 学习率与 target 更新速度很关键。",
      "观察 critic 估值是否远高于实际回报；跨种子评估。",
      "Q 远高于经验回报时，检查 target 和 reward 尺度，并优先尝试 TD3。",
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
    equation:
      "ã=clip动作(μtarget(s′)+clip(ε,−c,c));  y=r+γ(1−d)minᵢQtarget,i(s′,ã);  d=1 表示真正终止",
    mechanicsSteps: [
      "在 DDPG 基础上维护两个独立 critic，写入 replay 的动作含执行探索噪声。",
      "下一 target action 加裁剪后的平滑噪声，再限制在合法动作范围。",
      "非终止 transition 的 target 用两个 target Q 的较小值；真正终止时 y=r。停止 target 梯度后分别训练两个 critic，外部时间截断通常仍保留 bootstrap。",
      "隔若干 critic 更新才训练 Actor，并在 Actor 更新后软更新所有 target。",
    ],
    limits: [
      "双 critic 的 min 可能偏保守，稀疏奖励或低质量 replay 仍难探索。",
      "面向连续动作；离散动作高估更直接对照 Double DQN。",
    ],
    settings: [
      {
        name: "policy delay",
        start: "先让 critic 更新频于 Actor，确认价值学习追得上策略。",
        adjust: "Actor 被噪声 critic 带偏就加大间隔；策略变化过慢可缩小。",
      },
      {
        name: "target smoothing",
        start: "按动作归一化尺度设小幅噪声和裁剪。",
        adjust: "Q 对极窄动作峰值过敏就加大；细动作被过度模糊就减小。",
      },
      {
        name: "探索噪声",
        start: "与 target smoothing 分开设置，按可执行动作范围定。",
        adjust: "replay 覆盖差就增大；越界裁剪太频繁就减小。",
      },
    ],
    whenToUse: [
      "连续动作任务，DDPG critic 估值偏高或训练易崩。",
      "想要不以随机 actor 为核心的 off-policy baseline。",
    ],
    howToUse: [
      "实现两个独立 critic，目标中取较小值。",
      "critic 每步更新，actor 与 target network 按设定间隔更新，并给目标动作加裁剪噪声。",
      "单独测试执行噪声与 target 噪声进入正确代码路径。",
      "比较两个 critic 的预测差、min 估值和环境实际回报。",
    ],
    tuning: [
      "检查 policy delay、target noise 与 noise clip 是否匹配动作尺度。",
      "监控两位 critic 的分歧，外加真实环境回报。",
      "两 critic 同时发散时，先检查共同 Bellman target、终止 mask 和 reward 尺度。",
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
    mechanicsSteps: [
      "随机 Actor 输出动作分布；连续版常用 Gaussian 采样后 tanh 压到合法范围。",
      "从 replay batch 更新双 Q，soft target 含下一动作 Q 与 −α logπ(a′|s′)。",
      "更新 Actor，使采样动作兼顾较高 Q 与较高 entropy；正确计入 tanh 的 log-prob Jacobian。",
      "固定 α 或对目标 entropy 自动调节 α，软更新 target 并用真实回报评估。",
    ],
    limits: [
      "连续动作 SAC 的公式不能原样用于离散动作，离散版需对动作概率求和。",
      "entropy 鼓励随机性但不保证有意义探索；极稀疏奖励仍需要额外设计。",
    ],
    settings: [
      {
        name: "温度 α / target entropy",
        start: "先用自动温度版本并按动作维度设目标熵，再做敏感性对照。",
        adjust: "长期随机无进展就降低目标熵；策略早熟坍塌就提高。",
      },
      {
        name: "replay 与更新比",
        start: "先使每批含多样状态，环境步与梯度步保持可监控比例。",
        adjust: "旧数据主导且环境变了就缩短窗口；样本利用不足可增加更新。",
      },
      {
        name: "target 软更新 τ",
        start: "让 target 比 Q 网络平缓变化。",
        adjust: "Q 震荡就减小；长期学习迟缓且 target 落后就增大。",
      },
    ],
    whenToUse: [
      "连续控制、环境交互昂贵，希望重用样本。",
      "需要显式控制探索与利用的平衡。",
    ],
    howToUse: [
      "从 replay buffer 采样，训练双 Q 与随机 actor。",
      "对 tanh-squashed Gaussian 等策略正确计算 log-prob 修正与动作缩放。",
      "用数值测试确认 tanh 前后 log-prob 与动作缩放计算一致。",
      "同时画策略 entropy、α、Q 值和无噪声/采样策略的任务回报。",
    ],
    tuning: [
      "温度 α 决定 entropy 权重；可使用自动温度调节变体。",
      "观察 Q 值、policy entropy、成功率与动作分布，不只看训练 reward。",
      "出现极大负 log-prob 或 NaN 时，优先查动作分布的标准差限制与 Jacobian 数值稳定性。",
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
    mechanicsSteps: [
      "从真实环境收集 (s,a,r,s′)，明确观测是否足够决定下一状态。",
      "在真实数据上拟合 dynamics/reward，并按完整轨迹验证 one-step 与多步预测。",
      "用 learned model 做短 rollout、MPC 规划或生成 synthetic transitions；按不确定性限制外推。",
      "在真实环境执行首个动作后重新观测、更新数据与模型，比较真实而非想象回报。",
    ],
    limits: [
      "多步 rollout 的模型误差会累积，长 horizon 可能优化模型漏洞。",
      "隐藏状态、随机转移或分布外动作需要概率模型、记忆或不确定性估计。",
    ],
    settings: [
      {
        name: "规划 horizon",
        start: "先用验证集仍可信的短多步跨度。",
        adjust: "重要后果看不到就加长；想象高分而真实失败就缩短。",
      },
      {
        name: "模型 ensemble",
        start: "若可负担，训练多个独立模型估计预测分歧。",
        adjust: "分歧高仍频繁规划到该区域就加大惩罚或收集真实数据。",
      },
      {
        name: "真实/模拟数据比例",
        start: "以真实 transition 为训练锚点，少量短 rollout 起步。",
        adjust: "政策只在模型里变好就减少模拟样本；模型可靠且交互贵可增加。",
      },
    ],
    whenToUse: [
      "环境采样昂贵，或需要规划/预测未来后果。",
      "有足够数据学到有用的短期动力学。",
    ],
    howToUse: [
      "先用真实 transition 拟合 dynamics，并在留出轨迹上验证多步误差。",
      "从短规划视界开始，比较真实环境与模型中的回报。",
      "将预测误差按规划步长和状态区域分桶，找出模型失效区。",
      "对比无模型 baseline，在相同真实环境交互次数下衡量价值。",
    ],
    tuning: [
      "规划 horizon 太长会放大模型偏差；先短后长。",
      "用模型 ensemble 或不确定性估计识别不可靠预测。",
      "规划总挑训练数据边缘动作时，增加 uncertainty penalty 或让候选动作靠近数据覆盖区。",
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
    mechanicsSteps: [
      "representation h 把观测历史映射为隐状态；prediction f 输出 policy prior 和 value。",
      "MCTS 在当前隐状态展开动作；dynamics g 为树中每一步预测下一隐状态与 reward。",
      "用搜索访问次数产生改进 policy target，同时用真实奖励与 n-step value target 监督网络 unroll。",
      "执行搜索选出的真实动作，回收环境数据入 replay，重复训练与搜索。",
    ],
    limits: [
      "搜索与训练开销大；动作空间过大或严格实时系统需改造搜索。",
      "学到的 latent 只需服务决策，不保证可解释或正确复原物理状态。",
    ],
    settings: [
      {
        name: "每步搜索次数",
        start: "按响应时间预算设置可承受的 MCTS 模拟数。",
        adjust: "搜索策略明显优于裸网络且延迟允许就增大；收益有限则缩小。",
      },
      {
        name: "unroll 长度",
        start: "从能稳定拟合 reward/value 的短跨度开始。",
        adjust: "长程价值学不到就增加；隐状态预测误差累积严重则缩短。",
      },
      {
        name: "探索噪声/温度",
        start: "训练时为根节点保持多样搜索，评估时采用更稳定选择。",
        adjust: "树总访问同一路径就提高探索；优质动作被噪声淹没则降低。",
      },
    ],
    whenToUse: [
      "想理解 learned dynamics 与 search 如何联合。",
      "有大量模拟交互和算力支持复杂规划时。",
    ],
    howToUse: [
      "准备可采样环境与明确 reward；先实现并验证简化树搜索。",
      "分别监控 reward、value、policy 预测与真实对局表现。",
      "先在已知规则的小环境核对搜索备份、奖励和访问次数 target。",
      "分别报告裸 policy、搜索 policy 的表现与每步规划耗时。",
    ],
    tuning: [
      "搜索模拟次数与训练数据量直接影响成本。",
      "unroll 长度过长使隐状态误差累积；按验证表现设定。",
      "价值预测好但搜索反而变差时，核查 dynamics reward、备份符号和探索先验。",
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
    mechanicsSteps: [
      "收集专家 (观测,动作) 轨迹，保留时间顺序、动作合法范围和元数据。",
      "按整条轨迹或场景划分 train/validation/test，处理不同专家间标注冲突。",
      "最小化离散动作 cross-entropy 或连续动作的合适概率/回归损失。",
      "在闭环环境滚动执行，专测偏离专家轨迹后的恢复；需要时用 DAgger 请求专家标注这些新状态。",
    ],
    limits: [
      "无法自动优于示范质量，专家覆盖窄时分布外状态会连锁失误。",
      "没有 reward 优化信号；若目标是超越专家可考虑在线 RL 或偏好训练。",
    ],
    settings: [
      {
        name: "轨迹覆盖",
        start: "先覆盖成功、失败边缘和恢复场景，而非只收理想状态。",
        adjust: "闭环失误集中在某类状态就定向补采该类示范。",
      },
      {
        name: "动作损失",
        start: "离散动作先用分类损失，连续动作按多峰性选分布头。",
        adjust: "均值动作无法执行时改用多模态策略或序列动作模型。",
      },
      {
        name: "DAgger 标注轮数",
        start: "先跑纯 BC 闭环并记录偏离状态。",
        adjust:
          "偏离后持续失败就对这些状态多轮专家重标；已稳定则停止昂贵采集。",
      },
    ],
    whenToUse: [
      "有高质量专家示例，在线试错昂贵或不安全。",
      "给 RL 策略一个可靠初始点。",
    ],
    howToUse: [
      "按完整轨迹切分训练与评估，避免相邻帧泄漏。",
      "部署前在闭环环境里测试偏离专家轨迹后的恢复能力。",
      "训练数据记录专家身份与场景，避免一个高频专家支配模型。",
      "比较开环动作准确率与闭环成功率，并分析首次失败后的状态分布。",
    ],
    tuning: [
      "关注专家覆盖的状态范围和动作标注一致性。",
      "比较 teacher-forced 预测准确率与闭环任务成功率。",
      "验证准确率高但闭环差时先补恢复数据，不要只增加网络宽度。",
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
    compareTo: [
      "ppo",
      "rlhf",
      "reinforcement-learning",
      "offline-rl",
      "decision-transformer",
    ],
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
    mechanicsSteps: [
      "冻结日志数据，审计每条 transition 的 reward、终止标志、行为策略与覆盖范围。",
      "以 BC 作为监督学习基线，并区分日志动作分布与候选策略动作分布；BC 不是其他离线算法的性能下限，复杂方法也可能更差。",
      "选择保守 Q、行为约束或序列建模方法；不要将未观测动作的 Q 当可靠事实。",
      "用独立环境或可信 off-policy evaluation 加不确定性区间评估，再考虑受控部署。",
    ],
    limits: [
      "数据未覆盖的动作及状态无法凭算法可靠识别后果；严重缺口需采集新数据。",
      "离线指标存在模型与选择偏差，特别在高风险场景不能替代前瞻验证。",
    ],
    settings: [
      {
        name: "策略约束强度",
        start: "以 BC 行为分布为锚，先限制远离日志的动作。",
        adjust:
          "策略退化为 BC 且数据有高质量变异时放宽；O.O.D. 动作增多时收紧。",
      },
      {
        name: "数据覆盖阈值",
        start: "按 state-action 密度与来源分层评估，标出低支持区域。",
        adjust: "目标策略常进入低支持区则回退或补数，不应只调 optimizer。",
      },
      {
        name: "评估置信度",
        start: "报告多种估计与区间，并检查有效样本量。",
        adjust: "估计分歧大或权重集中时降低结论强度，优先做小规模在线验证。",
      },
    ],
    whenToUse: [
      "真实交互贵、慢或有风险，但已有历史轨迹。",
      "需要先从日志学习候选策略再谨慎验证。",
    ],
    howToUse: [
      "先审计数据覆盖、行为策略、reward、终止标记与轨迹切分。",
      "以 behavior cloning 作基线，再与 CQL 等 offline 方法比较。",
      "按轨迹而非随机 transition 切分，防止相邻状态泄漏。",
      "先复现行为策略性能和数据质量，再判断复杂离线算法是否增加价值。",
    ],
    tuning: [
      "覆盖不足时算法再复杂也难推断未见动作的结果。",
      "关注保守强度与数据质量；有环境时用在线 rollout 验证。",
      "候选策略价值远高于数据中可见回报时，优先怀疑分布外外推或评价偏差。",
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
    compareTo: [
      "cql",
      "decision-transformer",
      "behavior-cloning",
      "off-policy-evaluation",
    ],
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
    mechanicsSteps: [
      "从固定数据集抽 batch，先训练标准 Bellman 目标与 critic。",
      "为每个状态比较 policy/候选动作的 Q 与数据动作的 Q。",
      "加入 log-sum-exp 式保守惩罚，压低数据外动作相对于数据动作的过高估值。",
      "由保守 Q 改进策略，检查策略动作离数据支持有多远并做独立评估。",
    ],
    limits: [
      "过度保守会忽略数据里少量好动作，无法制造日志没有的高质量行为。",
      "连续动作空间中的 log-sum-exp 只能采样近似，采样分布会影响结果。",
    ],
    settings: [
      {
        name: "保守系数 α",
        start: "从能抑制明显 O.O.D. 高 Q、又不退化到 BC 的范围搜索。",
        adjust: "虚高动作仍被选就增大；策略几乎不离开低质量行为就降低。",
      },
      {
        name: "候选动作采样",
        start: "连续版同时覆盖当前 policy 与较广动作候选。",
        adjust: "保守项漏掉异常高 Q 区域就增加或改善采样；计算成本过高则减少。",
      },
      {
        name: "Bellman 更新",
        start: "先确保普通 critic 在数据动作上能拟合再加正则。",
        adjust: "数据动作 Q 也被全面压低时检查 α 与 target 计算。",
      },
    ],
    whenToUse: [
      "只能用固定日志，普通 Q-learning 选出明显脱离数据的动作。",
      "希望学习比 BC 更好的策略，同时限制外推高估。",
    ],
    howToUse: [
      "先建立 BC 与普通 Q 基线，确认数据中存在可利用的质量差异。",
      "实现 Bellman loss 加保守项，并在 held-out 轨迹与环境评估。",
      "在不同数据质量子集上分别验证，不只报告混合日志平均回报。",
      "画数据动作 Q、策略动作 Q 与分布外程度，确认保守惩罚作用方向。",
    ],
    tuning: [
      "α 太小仍高估数据外动作，太大会过度保守。",
      "观察策略动作与数据动作的距离、Q 尺度和最终回报。",
      "若目标策略与 BC 完全相同且 BC 表现差，检查数据是否有可利用的高回报覆盖，再调 α。",
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
    equation:
      "πθ(aₜ | R₁,s₁,a₁,…,Rₜ,sₜ);  Rₜ=Σₖ≥ₜrₖ（训练）；Rₜ₊₁=Rₜ−rₜ（推理时更新目标）",
    mechanicsSteps: [
      "保留完整离线轨迹，逐步计算 return-to-go，并只用可见历史组成 causal context。",
      "按 (RTG,state,action) 顺序输入 Transformer；仅对目标 action token/向量计算监督损失。",
      "推理时给可由数据支持的目标 RTG，采动作后根据实际 reward 更新剩余目标。",
      "闭环评估不同目标回报与上下文长度，检查模型是否只是模仿数据高频动作。",
    ],
    limits: [
      "目标 RTG 是条件输入，无法让模型凭空产生数据中未见的成功轨迹。",
      "长上下文成本高；部分可观测任务若历史信息仍不足，序列模型也会失败。",
    ],
    settings: [
      {
        name: "目标 RTG",
        start: "从数据中较好但真实出现过的轨迹回报范围选。",
        adjust:
          "目标远高于数据且行为失真就降低；不同目标无行为差异时检查条件注入。",
      },
      {
        name: "context 长度",
        start: "先覆盖任务关键决策跨度的短窗口。",
        adjust: "长时依赖丢失就增加；训练成本高而效果不变就缩短。",
      },
      {
        name: "return/action 缩放",
        start: "将 RTG 与连续动作按训练数据稳定归一化，并保留推理同一变换。",
        adjust: "模型忽略 RTG 或输出越界动作时先检查量纲与缩放。",
      },
    ],
    whenToUse: [
      "已有覆盖不同表现水平的完整轨迹，想试序列建模路线。",
      "需对照 CQL 的价值学习与 BC 的直接模仿。",
    ],
    howToUse: [
      "保留轨迹时序，计算每个时刻的 return-to-go。",
      "输入目标回报与历史状态/动作，训练 causal model 预测动作。",
      "用 causal mask 测试遮挡未来 token，确认没有训练时序泄漏。",
      "与同架构 BC 对照，判断 RTG 条件带来的真实闭环收益。",
    ],
    tuning: [
      "上下文长度影响长期信息与计算成本。",
      "目标回报必须与数据可达到的范围一致，并做闭环评估。",
      "训练 loss 很低但目标回报不随提示变化时，检查数据中回报跨度与条件表达是否足够。",
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
    mechanicsSteps: [
      "对同一 prompt 收集多个候选，按清晰标准得到 chosen/rejected 偏好对。",
      "RM 对完整 prompt-response 输出一个标量，用分数差的 logistic pairwise loss 学相对排序。",
      "按 prompt 与来源隔离验证集，检查 pair accuracy、长度/格式偏好和人评一致性。",
      "把 RM 用作 reranking 或 RLHF 奖励时，持续抽样审查策略是否利用 RM 漏洞。",
    ],
    limits: [
      "成对标签通常只能确定相对差异，分数的平移与绝对刻度没有天然含义。",
      "标注分布与规范限制泛化；RM 高分不保证事实正确或满足未标注的目标。",
    ],
    settings: [
      {
        name: "候选差异与标签质量",
        start: "同 prompt 包含质量可辨又不只是长度差异的候选，并审查分歧标签。",
        adjust: "模型只认格式/长度就重平衡候选和标注规范。",
      },
      {
        name: "损失与采样权重",
        start: "先按 prompt 均衡采样 pair，不让高频主题主导。",
        adjust: "小众任务错误率高就增加该类样本或分组权重。",
      },
      {
        name: "RM 容量/训练轮数",
        start: "从能优于简单启发式且验证排序稳定的模型起。",
        adjust: "训练准确率高而 held-out 低就早停、减小容量或扩数据。",
      },
    ],
    whenToUse: [
      "有人类或可信偏好成对标注，且需要给新回复打分。",
      "RLHF 训练或 reranking 需要可学习的偏好信号。",
    ],
    howToUse: [
      "对相同 prompt 收集成对候选与偏好标签，并保证标注规范。",
      "训练后检查 held-out pair accuracy、跨任务泛化与人工评估。",
      "先固定偏好定义，例如正确性、帮助程度与安全性怎样权衡。",
      "分组查看 RM 对长答、拒答、不同语言与事实性问题的误差。",
    ],
    tuning: [
      "关注数据多样性、标注者一致性和模型对长度等捷径的偏好。",
      "评分数值的绝对尺度通常不如排序、校准和稳健性重要。",
      "RM 分数上升但人工偏好下降时，立即审查 reward hacking 样本并更新标签覆盖。",
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
    mechanicsSteps: [
      "先用示范做 SFT，建立参考策略与独立的人评基线。",
      "对同 prompt 候选收集偏好对，训练并验证 Reward Model。",
      "从当前 policy 采回复，以 RM 分数减去相对冻结 reference 的 KL 惩罚构造优化信号。",
      "用 PPO 等方法更新 policy，并用盲测人评与任务指标检查 RM 之外的真实质量。",
    ],
    limits: [
      "需要生成采样、偏好标注、RM 和策略优化，多阶段成本高。",
      "优化固定 RM 可能利用偏好盲点；监控 RM 分数本身不足以证明质量改善。",
    ],
    settings: [
      {
        name: "reference KL 系数 β",
        start: "从 SFT 附近的保守偏移开始，并画 reward-KL 曲线。",
        adjust:
          "回复长度、风格或事实性快速漂移就提高；几乎无偏好增益且 KL 极低可降低。",
      },
      {
        name: "PPO 更新强度",
        start: "每批新采回复只做有限更新，监控实际 KL。",
        adjust: "回报突然塌陷或旧数据反复使用就减小 epoch/学习率。",
      },
      {
        name: "RM 更新频率",
        start: "用冻结 RM 建可复现基线，定期做人评抽查。",
        adjust: "策略生成分布变了且 RM 与人评分歧加大时补标并重训 RM。",
      },
    ],
    whenToUse: [
      "有充足高质量示范/偏好数据、评估资源与在线采样能力。",
      "希望优化难以直接写成 token-level 监督标签的回复偏好。",
    ],
    howToUse: [
      "先建立强 SFT baseline，并用独立偏好集评估 RM。",
      "PPO 训练时监控真实人工偏好、KL、回复长度与 reward，而不只看 RM 分数。",
      "把 held-out 人评、RM 胜率、KL 和回复长度同时作为训练仪表盘。",
      "保留 SFT 与 DPO 对照，在相同偏好数据和评估集上比较复杂流程是否值得。",
    ],
    tuning: [
      "KL 系数 β 控制远离 reference 的程度，过低易利用 RM 漏洞。",
      "奖励归一化、PPO update 步数和采样批量影响稳定性。",
      "RM 奖励上升而人工胜率不升时，先停止加强 PPO，回看 RM 盲点与采样偏差。",
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
    mechanicsSteps: [
      "准备同 prompt 的 chosen/rejected 对，先确保 SFT policy 与冻结 reference 可计算序列 log-prob。",
      "对每个完整回复只累加回复 token 的 log-prob，屏蔽 prompt 与 padding。",
      "比较 policy 与 reference 的 chosen-minus-rejected log-prob 差，乘 β 后进入 log-sigmoid loss。",
      "更新 policy 不更新 reference；用开放式生成的人评、长度和分布外提示检验。",
    ],
    limits: [
      "固定偏好对没有在线探索，数据未覆盖的行为不能凭目标函数可靠优化。",
      "偏好标签噪声、长度偏差或过近/过远的 reference 均会影响结果。",
    ],
    settings: [
      {
        name: "β",
        start: "以使 policy 相对 reference 有可测但不过度的偏好变化为起点。",
        adjust:
          "回复变窄或偏好过拟合就提高约束意义上的 β/检查实现；改善太弱则做小范围敏感性实验。",
      },
      {
        name: "reference 选择",
        start: "先冻结与训练初始 policy 相同的 SFT checkpoint。",
        adjust:
          "reference 与数据风格严重不匹配时先改进 SFT 或数据，而非只改 β。",
      },
      {
        name: "pair 质量与长度控制",
        start: "同 prompt 配对并平衡长度、主题与标注来源。",
        adjust: "模型偏爱冗长/简短答案时补对照 pair 并分组评估。",
      },
    ],
    whenToUse: [
      "有可靠偏好对，希望简化 LM 偏好微调流程。",
      "训练资源不适合独立 RM 加在线 PPO。",
    ],
    howToUse: [
      "先准备 SFT policy 和冻结的 reference policy。",
      "对同 prompt 的 chosen/rejected 分别计算序列 log-prob，按 DPO loss 更新 policy。",
      "单独输出 chosen/rejected 的四个 log-prob 与最终 margin，核对符号。",
      "从训练分布外主题抽样生成人评，不只看 pairwise loss 或训练集胜率。",
    ],
    tuning: [
      "β 控制相对 reference 的偏好强度；结合人工评估调。",
      "检查偏好对质量、长度偏差与训练/验证分布差异。",
      "loss 降低但生成质量下降时，检查序列 log-prob 的长度效应、标签噪声和 β。",
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
