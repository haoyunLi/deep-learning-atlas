import { type CompleteLabMap, sum, mean, fmt, softmax, metric } from "./types";
import { make, control, stage, result, kl, logsumexp } from "./rlShared";

export const rlControlLabs: CompleteLabMap = {
  "double-dqn": make(
    "double-dqn",
    "选择动作与给动作估值，分开后 target 变了多少？",
    "online Q=[2,1]，target Q=[1,3]，reward=1，nonterminal。",
    control(
      "Discount γ",
      0,
      1,
      0.05,
      0.9,
      "只改变bootstrap权重，online选择保持固定。",
    ),
    (g) => {
      const dd = 1 + g,
        dqn = 1 + 3 * g;
      return result(
        [
          stage(
            "Online selection",
            "online网络选择argmax a1。",
            "argmax[2,1]=a1",
            ["a1", "a2"],
            [2, 1],
            "online Q",
          ),
          stage(
            "Target evaluation",
            "target网络只给online选中的a1估值，不能重新argmax。",
            "Qtarget(a1)=1",
            ["a1", "a2"],
            [1, 3],
            "target Q",
          ),
          stage(
            "Two bootstrap targets",
            "普通DQN在target网络上直接取max=3。",
            `DDQN=1+γ×1; DQN=1+γ×3`,
            ["Double DQN", "DQN"],
            [dd, dqn],
            "target return",
          ),
          stage(
            "Difference",
            "差异来自selection/evaluation分离，而不是改变reward。",
            `DQN−DDQN=2γ=${fmt(dqn - dd)}`,
            ["reward part", "DDQN bootstrap", "DQN bootstrap"],
            [1, g, 3 * g],
            "return",
          ),
        ],
        "Double DQN target",
        dd,
        "return",
      );
    },
    {
      use: [
        "Discrete-action Q-learning出现max-induced overestimation时，比较Double DQN。",
        "可在保持replay、network和采样相同的条件下单独消融target规则。",
      ],
      tune: [
        "先固定target update schedule和γ，再比较普通DQN与Double DQN的Q/return偏差。",
        "γ反映任务时域；不要只为缩小Q数值而随意降低γ。",
      ],
      debug: [
        "实现与DQN没有区别",
        "检查argmax来自online而取值来自target",
        "用本Q数组验证target=1+γ而非1+3γ",
        "Terminal transition仍bootstrap",
        "检查terminated与time-limit truncation定义",
        "真正terminal置bootstrap0，截断按环境定义处理",
      ],
      boundary:
        "单transition、给定Q的target比较；不证明Double DQN在任意数据都不高估。",
    },
  ),
  "dueling-dqn": make(
    "dueling-dqn",
    "Advantage 改变时，为什么平均 Q 仍等于 V？",
    "V=2，raw advantages=[a,1,−1]；使用mean-centering聚合。",
    control(
      "First raw advantage a",
      0,
      4,
      0.25,
      2,
      "改变一个advantage会通过均值影响所有Q，不能只看第一项。",
    ),
    (a) => {
      const A = [a, 1, -1],
        m = mean(A),
        c = A.map((x) => x - m),
        q = c.map((x) => 2 + x);
      return result(
        [
          stage(
            "State value",
            "V描述共同state-level基线。",
            "V=2",
            ["a1 baseline", "a2 baseline", "a3 baseline"],
            [2, 2, 2],
            "value",
          ),
          stage(
            "Raw advantages",
            "raw A具有加常数的不确定性，需聚合约束。",
            `A=[${a},1,−1]`,
            ["a1", "a2", "a3"],
            A,
            "advantage",
          ),
          stage(
            "Center advantages",
            "每个A减去同一个mean，sum centered A=0。",
            `mean(A)=${fmt(m)}; A′=A−mean(A)`,
            ["a1", "a2", "a3"],
            c,
            "advantage",
          ),
          stage(
            "Compose Q",
            "这个mean-centering约定使mean(Q)=V。",
            `Q=V+A′; mean(Q)=${fmt(mean(q))}`,
            ["Q1", "Q2", "Q3"],
            q,
            "Q",
          ),
        ],
        "Q(a1)",
        q[0],
        "Q",
      );
    },
    {
      use: [
        "多个动作价值相近、state value共享性强时，可用Dueling head。",
        "它是architecture分解，能与Double DQN等target方法组合。",
      ],
      tune: [
        "先保留相同backbone/replay，单独比较value/advantage head容量。",
        "核对mean还是max aggregation，不能把两种约定的raw A直接比较。",
      ],
      debug: [
        "Value和Advantage数值任意漂移",
        "检查是否漏了centering",
        "按固定约定聚合并验证mean(Q)=V",
        "修改一个advantage却意外改所有Q",
        "确认centering的coupling是否预期",
        "查看完整Q向量，而不是把raw A解释为独立Q",
      ],
      boundary:
        "给定V/A的聚合运算，不训练Dueling网络；centered advantage不是因果收益。",
    },
  ),
  "rainbow-dqn": make(
    "rainbow-dqn",
    "n-step target 在 immediate reward 与 bootstrap 之间怎么分配？",
    "rewards=[1,0,2,−1]，γ=.9，截取前n步，末端bootstrap V=3。",
    control(
      "Return horizon n",
      1,
      4,
      1,
      3,
      "这是Rainbow中的n-step组件；不同时模拟distributional/PER/noisy等其它组件。",
    ),
    (n) => {
      const r = [1, 0, 2, -1].slice(0, n),
        d = r.map((x, i) => x * 0.9 ** i),
        boot = 0.9 ** n * 3,
        target = sum(d) + boot;
      return result(
        [
          stage(
            "Reward prefix",
            "只读取本条transition sequence的前n步。",
            `r=${r}`,
            r.map((_, i) => `r${i + 1}`),
            r,
            "reward",
          ),
          stage(
            "Discount rewards",
            "第一个reward系数1，之后依次乘γ。",
            "discounted r_i=γ^i r_i",
            r.map((_, i) => `term${i + 1}`),
            d,
            "return contribution",
          ),
          stage(
            "Bootstrap at n",
            "没有terminal时才包含末端bootstrap。",
            `bootstrap=.9^${n}×3=${fmt(boot)}`,
            ["observed rewards", "bootstrap"],
            [sum(d), boot],
            "return",
          ),
          stage(
            "Assemble target",
            "n增大并不保证target更接近真实value，误差来源变了。",
            `Y_n=Σγ^i r_i+γ^nV=${fmt(target)}`,
            ["1-step target", "selected n-step"],
            [3.7, target],
            "target",
          ),
        ],
        "n-step target",
        target,
        "return",
      );
    },
    {
      use: [
        "需要将多项DQN改进组合时，以Rainbow作为可消融基线。",
        "n-step可更快传播reward，但较长轨迹带来更多variance与off-policy问题。",
      ],
      tune: [
        "从实现默认n开始比较1/3/5，保持其它Rainbow组件不变。",
        "Replay priority、importance weight和distribution support分别记录，不把组合收益归于单一组件。",
      ],
      debug: [
        "Target跨episode累加",
        "检查sequence sampling与terminal mask",
        "在terminal截断reward和bootstrap",
        "更大n训练不稳",
        "比较reward尺度、行为策略变化和target variance",
        "先回到1-step并逐项恢复组件",
      ],
      boundary: "只精确展示Rainbow中的n-step return，未实现完整Rainbow训练。",
    },
  ),
  trpo: make(
    "trpo",
    "Surrogate improvement 增大时，KL constraint 何时先被破坏？",
    "old policy=[.5,.5]，advantages=[1,−1]，candidate policy=[p,1−p]，δ=.02。",
    control(
      "Candidate P(a1)",
      0.1,
      0.9,
      0.05,
      0.6,
      "对比surrogate gain与KL；本例没有自然梯度求解。",
    ),
    (p) => {
      const old = [0.5, 0.5],
        now = [p, 1 - p],
        ratio = now.map((x) => x / 0.5),
        con = [p, -(1 - p)],
        K = kl(old, now);
      return result(
        [
          stage(
            "Likelihood ratios",
            "用old-policy样本上的ratio修正candidate权重。",
            "ratio=πnew/πold",
            ["a1", "a2"],
            ratio,
            "ratio",
          ),
          stage(
            "Surrogate objective",
            "old sampling mass .5乘ratio与advantage。",
            `L=.5×2p×1+.5×2(1−p)×(−1)=${fmt(sum(con))}`,
            ["a1 contribution", "a2 contribution"],
            con,
            "advantage",
          ),
          stage(
            "Trust-region check",
            "采用KL(old||new)，方向不可随意调换。",
            `KL=${fmt(K)}; δ=.02`,
            ["measured KL", "limit δ"],
            [K, 0.02],
            "nats",
          ),
          stage(
            "Feasibility",
            "改善surrogate但超过KL时仍须拒绝或缩短step。",
            `feasible=${K <= 0.02 ? "yes" : "no"}`,
            ["old a1", "candidate a1"],
            [0.5, p],
            "probability",
          ),
        ],
        "KL(old || new)",
        K,
        "nats",
        [metric("Surrogate", sum(con))],
      );
    },
    {
      use: [
        "On-policy policy optimization希望显式限制平均policy变化时，可学习TRPO。",
        "适合对比PPO clipping与真正的KL约束；两者不是同一保证。",
      ],
      tune: [
        "从实现约定的δ起，记录actual KL、surrogate和line-search接受率。",
        "调整δ前先核advantage normalization、batch大小和value baseline质量。",
      ],
      debug: [
        "Surrogate涨但return降",
        "检查sample reuse、actual KL与模型误差",
        "缩小更新并用新rollouts验证",
        "KL计算异常小",
        "核旧policy冻结、action distribution和KL方向",
        "用两动作toy对照解析KL",
      ],
      boundary:
        "两个动作的精确surrogate/KL检查；不执行TRPO conjugate gradient、line search或单调改进定理的全部条件。",
    },
  ),
  ddpg: make(
    "ddpg",
    "Deterministic actor 是沿 critic 的哪一个梯度移动？",
    "actor action a=θ，critic Q(a)=−(a−.5)²，actor ascent learning rate=.1。",
    control(
      "Actor parameter θ",
      -1,
      1,
      0.1,
      0,
      "调当前θ，观察dQ/da和一次actor update；Q是固定toycritic。",
    ),
    (a) => {
      const Q = -((a - 0.5) ** 2),
        g = -2 * (a - 0.5),
        next = a + 0.1 * g,
        nextQ = -((next - 0.5) ** 2);
      return result(
        [
          stage(
            "Actor action",
            "在这个identity actor中da/dθ=1。",
            `a=θ=${fmt(a)}`,
            ["current action", "critic optimum"],
            [a, 0.5],
            "action",
          ),
          stage(
            "Critic gradient",
            "critic估计连续action的局部value slope。",
            `dQ/da=−2(a−.5)=${fmt(g)}`,
            ["dQ/da", "da/dθ"],
            [g, 1],
            "derivative",
          ),
          stage(
            "Chain rule ascent",
            "最大化Q，等价最小化−Q；别写反方向。",
            `θ′=θ+.1×dQ/da×da/dθ=${fmt(next)}`,
            ["before θ", "after θ"],
            [a, next],
            "parameter",
          ),
          stage(
            "Re-evaluate critic",
            "在固定正确toycritic中，本次小step改善Q。",
            `Qbefore=${fmt(Q)}; Qafter=${fmt(nextQ)}`,
            ["before Q", "after Q"],
            [Q, nextQ],
            "Q",
          ),
        ],
        "Updated actor parameter",
        next,
        "parameter",
      );
    },
    {
      use: [
        "连续action且需要off-policy replay时，DDPG是deterministic actor-critic基础。",
        "理解它有助于看懂TD3为何加twin critics、target smoothing和delay。",
      ],
      tune: [
        "先对齐action bounds、reward尺度与target-update τ，再调actor/critic learning rates。",
        "探索noise作用于environment actions；与target smoothing或policy entropy不同。",
      ],
      debug: [
        "Actor朝更差action移动",
        "核loss是否为−Q、是否误detach action",
        "用固定二次critic检查gradient方向",
        "Q不断升但真实return不升",
        "检查critic extrapolation与replay coverage",
        "比较TD3 twin-critic或更保守更新",
      ],
      boundary:
        "固定解析critic的一步actor gradient，不训练DDPG或估计真实return。",
    },
  ),
  td3: make(
    "td3",
    "Target noise 与 twin-critic min 怎么一起进入 Bellman target？",
    "target actor=.4；ε加到action后clip到[−1,1]；Q1=1−(a−.3)²，Q2=.8−(a+.1)²；r=.2,γ=.9。",
    control(
      "Target smoothing noise ε",
      -0.5,
      0.5,
      0.05,
      0.2,
      "噪声已限制在[−.5,.5]；action bounds仍需再clip。",
    ),
    (e) => {
      const a = Math.max(-1, Math.min(1, 0.4 + e)),
        q = [1 - (a - 0.3) ** 2, 0.8 - (a + 0.1) ** 2],
        v = Math.min(...q),
        Y = 0.2 + 0.9 * v;
      return result(
        [
          stage(
            "Smooth target action",
            "先加已clipped的noise，再clip action。",
            `a′=clip(.4+${fmt(e)},−1,1)=${fmt(a)}`,
            ["actor", "smoothed"],
            [0.4, a],
            "action",
          ),
          stage(
            "Twin evaluation",
            "两critics对同一smoothed action评分。",
            "Q1=1−(a−.3)²; Q2=.8−(a+.1)²",
            ["Q1", "Q2"],
            q,
            "Q",
          ),
          stage(
            "Clipped double target",
            "取较小Q是TD3 target规则，不是取较小action。",
            `minQ=${fmt(v)}`,
            ["reward", "discounted minQ"],
            [0.2, 0.9 * v],
            "return",
          ),
          stage(
            "Bellman target",
            "terminal mask在此固定nonterminal。",
            `Y=.2+.9×minQ=${fmt(Y)}`,
            ["single Q1 target", "twin-min target"],
            [0.2 + 0.9 * q[0], Y],
            "target",
          ),
        ],
        "TD3 target",
        Y,
        "return",
      );
    },
    {
      use: [
        "连续控制中DDPG critic出现尖峰与过估计时，TD3提供三项针对性改进。",
        "适合对比actor更新频率、twin-min与target smoothing各自影响。",
      ],
      tune: [
        "按action尺度设置noise/std/clip，先用规范化action区间。",
        "Actor delay从参考实现起，监控critic拟合和actor/target更新次数。",
      ],
      debug: [
        "Noise大到action经常卡边界",
        "统计clipping比例和实际action单位",
        "按action范围重标定noise，而非照抄数值",
        "Q过低导致policy停滞",
        "检查两个critics相关偏差、reward尺度和噪声",
        "分别消融min和smoothing并看真实rollout",
      ],
      boundary:
        "两个解析critic的target运算；不证明min消除了所有偏差，也未模拟delayed updates。",
    },
  ),
  "model-based-rl": make(
    "model-based-rl",
    "Model rollout 变长时，小 dynamics bias 如何累积？",
    "真实toy x_{t+1}=x_t+1；模型预测x_{t+1}=x_t+1.1；x0=0，reward=−x_next²。",
    control(
      "Planning horizon H",
      1,
      6,
      1,
      3,
      "每步bias=.1固定，比较真实与model轨迹和累计reward。",
    ),
    (h) => {
      const xs = Array.from({ length: h }, (_, i) => i + 1),
        model = xs.map((x) => 1.1 * x),
        r = xs.map((x) => -x * x),
        rm = model.map((x) => -x * x);
      return result(
        [
          stage(
            "One-step dynamics",
            "这个环境可解析知道truth；真实任务通常只能用held-out transitions评估。",
            "true step=+1; model step=+1.1",
            ["true increment", "model increment"],
            [1, 1.1],
            "state",
          ),
          stage(
            "Roll out states",
            "同方向bias随step累积。",
            `x_H=${h}; x̂_H=${fmt(1.1 * h)}`,
            xs.map((x) => `t${x}`),
            model.map((x, i) => x - xs[i]),
            "state error",
          ),
          stage(
            "Propagate reward error",
            "reward非线性，所以state bias会改变return。",
            "r=−x²",
            xs.map((x) => `t${x}`),
            rm.map((x, i) => x - r[i]),
            "reward error",
          ),
          stage(
            "Planning bias",
            "更长H带来更多未来信息，也累计更多model error。",
            `true R=${fmt(sum(r))}; model R=${fmt(sum(rm))}`,
            ["true return", "model return"],
            [sum(r), sum(rm)],
            "return",
          ),
        ],
        "Return prediction error",
        sum(rm) - sum(r),
        "return",
      );
    },
    {
      use: [
        "环境交互昂贵而learned dynamics可复用时，model-based RL可提升样本利用。",
        "需要planning前，先建立one-step和multi-step validation来判断模型在哪些state可信。",
      ],
      tune: [
        "从短rollout horizon起，对照held-out multi-step误差再增加H。",
        "区分model uncertainty与aleatoric noise；ensemble disagreement仍需校准和coverage检查。",
      ],
      debug: [
        "Imagined reward高真实reward低",
        "检查policy是否探索到model训练支持外",
        "缩短rollouts、增加真实数据或惩罚不可靠regions",
        "One-step误差小但长rollout发散",
        "比较teacher-forced与free-running状态分布",
        "记录误差随horizon并限制planning范围",
      ],
      boundary:
        "已知truth的线性bias反例；没有训练dynamics或声称误差总按本速度增长。",
    },
  ),
  muzero: make(
    "muzero",
    "Policy prior 在 PUCT 中怎样改变搜索偏好？",
    "root visits=5；children N=[4,1],Q=[.3,.6],P=[.8,.2]；演示fixed-c PUCT score。",
    control(
      "Prior exploration coefficient c",
      0,
      3,
      0.25,
      1,
      "c改变prior bonus；这是简化PUCT，MuZero原实现还用visit-dependent系数。",
    ),
    (c) => {
      const P = [0.8, 0.2],
        N = [4, 1],
        Q = [0.3, 0.6],
        b = P.map((p, i) => (c * p * Math.sqrt(5)) / (1 + N[i])),
        s = Q.map((x, i) => x + b[i]);
      return result(
        [
          stage(
            "Learned prediction outputs",
            "prior P与value estimates来自model；toy中给定固定值。",
            "P=[.8,.2]; Q=[.3,.6]",
            ["P(A)", "P(B)"],
            P,
            "prior probability",
          ),
          stage(
            "Search counts",
            "visit counts控制探索衰减；不是新的environment feedback。",
            "Nroot=5; Nchildren=[4,1]",
            ["N(A)", "N(B)"],
            N,
            "visits",
          ),
          stage(
            "Prior-weighted bonus",
            "这与UCT的sqrt(logN/n)公式不同。",
            `bonus=cP√N/(1+n)`,
            ["bonus A", "bonus B"],
            b,
            "score",
          ),
          stage(
            "Select by PUCT",
            "搜索阶段score最大child未必是最终按visits执行的动作。",
            `score=Q+bonus; selected=${s[0] >= s[1] ? "A" : "B"}`,
            ["A score", "B score"],
            s,
            "score",
          ),
        ],
        "PUCT score A",
        s[0],
        "score",
        [metric("A minus B", s[0] - s[1])],
      );
    },
    {
      use: [
        "能用learned latent dynamics预测reward/value并在其中搜索时，MuZero是model-based planning路线。",
        "先掌握MCTS统计与PUCT，再研究representation/dynamics/prediction三部分训练。",
      ],
      tune: [
        "先对齐return尺度、value normalization和PUCT实现，再比较simulation budget。",
        "Policy prior不准时增加c可能放大偏见；同时检查搜索visits与真实return。",
      ],
      debug: [
        "搜索一直追随错误prior",
        "记录Q、P、N和bonus各分量",
        "比较减小c、更多真实数据和prior质量",
        "模拟很多但执行仍差",
        "检查latent model rollout误差与training target构造",
        "分开消融model误差与search budget",
      ],
      boundary:
        "仅fixed-c PUCT的一个node选择；不复现MuZero动态系数、reward backup、训练或完整tree。",
    },
  ),
  "behavior-cloning": make(
    "behavior-cloning",
    "Imbalanced demonstrations 下，BC 的最优概率是什么？",
    "同一state有4条demonstrations，labels=[A,A,A,B]；policy给P(A)=p。",
    control(
      "Policy P(A)",
      0.05,
      0.95,
      0.05,
      0.5,
      "比较p=.5与.75；dataset frequency决定此toy的CE最优点。",
    ),
    (p) => {
      const l = [-Math.log(p), -Math.log(1 - p)],
        L = 0.75 * l[0] + 0.25 * l[1],
        g = p - 0.75;
      return result(
        [
          stage(
            "Demonstration counts",
            "频率来自所收集的demonstrations，不自动代表最优policy。",
            "nA=3;nB=1",
            ["A", "B"],
            [3, 1],
            "examples",
          ),
          stage(
            "Policy probabilities",
            "两个action共享sum-to-one约束。",
            `π=[${fmt(p)},${fmt(1 - p)}]`,
            ["A", "B"],
            [p, 1 - p],
            "probability",
          ),
          stage(
            "Supervised imitation loss",
            "每条demo的negative log likelihood求mean。",
            "L=.75(−ln p)+.25(−ln(1−p))",
            ["A weighted term", "B weighted term"],
            [0.75 * l[0], 0.25 * l[1]],
            "nats",
          ),
          stage(
            "Logit gradient",
            "令p=σ(z)，gradient为p−label frequency。",
            `dL/dz=p−.75=${fmt(g)}`,
            ["current p", "dataset frequency"],
            [p, 0.75],
            "probability",
          ),
        ],
        "BC mean loss",
        L,
        "nats",
        [metric("Logit gradient", g)],
      );
    },
    {
      use: [
        "有expert state-action demonstrations时，BC是简单的supervised policy baseline。",
        "适合先验证action encoding和observation pipeline，再考虑RL或DAgger。",
      ],
      tune: [
        "先优化closed-loop成功率；learning rate/regularization用独立trajectories而非随机frames验证。",
        "Dataset imbalance时记录state coverage与每类action，避免只报总体accuracy。",
      ],
      debug: [
        "Offline accuracy高而rollout失败",
        "检查policy自己访问的states是否在demo支持内",
        "收集纠正demonstrations或比较DAgger",
        "少数action几乎不出现",
        "检查标签频率和loss权重",
        "按任务代价验证重采样/weighting，别把输出概率当原频率",
      ],
      boundary:
        "单state分类loss；没有模拟covariate shift、expert最优性或真实closed-loop控制。",
    },
  ),
  "offline-rl": make(
    "offline-rl",
    "Dataset 没出现的 action，为什么高 Q 也不能证明有效？",
    "只记录action A的10次reward=1；B没有记录，网络却可给它任意Q_B。",
    control(
      "Unsupported Q(B)",
      -1,
      5,
      0.25,
      2,
      "改Q_B不增加任何真实证据；观察greedy policy何时离开dataset support。",
    ),
    (q) => {
      const chosen = q > 1 ? 1 : 0,
        support = chosen ? 0 : 1;
      return result(
        [
          stage(
            "Logged support",
            "B没有样本，无法从本dataset直接估计其reward。",
            "counts=[10,0]",
            ["A count", "B count"],
            [10, 0],
            "transitions",
          ),
          stage(
            "Estimated values",
            "固定Q_A=1；unsupported Q_B仅是模型输出。",
            `Q=[1,${fmt(q)}]`,
            ["A Q", "B Q"],
            [1, q],
            "estimated Q",
          ),
          stage(
            "Greedy improvement",
            "argmax可以偏向数据外动作；max操作不会创造证据。",
            `selected=${chosen ? "B" : "A"}`,
            ["π(A)", "π(B)"],
            [1 - chosen, chosen],
            "policy probability",
          ),
          stage(
            "Support audit",
            "这个toy中的支持质量只能告诉你有没有数据，不告诉你B真实好坏。",
            `supported policy mass=${support}`,
            ["supported mass", "unsupported mass"],
            [support, 1 - support],
            "probability",
          ),
        ],
        "Estimated greedy Q",
        Math.max(1, q),
        "Q",
        [metric("Supported policy mass", support)],
      );
    },
    {
      use: [
        "只能使用固定logged data且不能随意探索时，需要offline RL而非直接照搬online RL。",
        "如果action coverage不足，BC或保守policy可能比激进value improvement更可检验。",
      ],
      tune: [
        "先统计state-action support、behavior policy与reward记录，再选择conservative或constraint方法。",
        "调conservatism时同时看OPE、support和独立测试；不能凭训练Q最高选policy。",
      ],
      debug: [
        "Learned Q极高但离线评价不稳",
        "检查policy是否选择rare/unseen actions",
        "限制policy偏离并报告support缺口",
        "OPE给出巨大importance weights",
        "核logged propensity与positivity",
        "缩小目标policy范围或补数据，不把clipping当无偏修复",
      ],
      boundary:
        "B的真实reward刻意未知；这里不伪造offline policy真实性能，也不实现完整offline RL算法。",
    },
  ),
  cql: make(
    "cql",
    "CQL 的 log-sum-exp 为什么会压低未记录 action？",
    "两个actions，dataset只含A，Q_A=1；改变Q_B，α=1，只演示conservative regularizer。",
    control(
      "Unsupported Q(B)",
      -2,
      4,
      0.25,
      2,
      "观察penalty及对B的positive gradient；gradient descent会压低B。",
    ),
    (q) => {
      const Q = [1, q],
        lse = logsumexp(Q),
        p = softmax(Q),
        pen = lse - 1,
        gr = [p[0] - 1, p[1]],
        updated = [1 - 0.1 * gr[0], q - 0.1 * gr[1]];
      return result(
        [
          stage(
            "Action values",
            "dataset action=A，未观测B也参与log-sum-exp。",
            `Q=[1,${fmt(q)}]`,
            ["A", "B"],
            Q,
            "Q",
          ),
          stage(
            "Conservative objective",
            "减dataset action Q；并非简单把所有Q向0压。",
            `L_CQL=logsumexp(Q)−Q_A=${fmt(pen)}`,
            ["logsumexp", "dataset Q"],
            [lse, 1],
            "Q",
          ),
          stage(
            "Action gradients",
            "logsumexp gradient是softmax；A还要减1。",
            "dL/dQ=softmax(Q)−[1,0]",
            ["A gradient", "B gradient"],
            gr,
            "gradient",
          ),
          stage(
            "One penalty-only update",
            "只显示此regularizer的step；真实目标还包含Bellman loss。",
            "Q′=Q−.1∇L_CQL",
            ["A updated", "B updated"],
            updated,
            "Q",
          ),
        ],
        "Conservative penalty",
        pen,
        "Q",
      );
    },
    {
      use: [
        "Offline RL中需要抑制数据外动作的过高value，可比较CQL。",
        "离散toy可精确求logsumexp；continuous CQL需要sampling/importance修正等实现细节。",
      ],
      tune: [
        "固定reward scale后从参考α起，分别记录Bellman与conservative loss。",
        "α大不必然安全；检查policy是否退化为过度保守、support是否改善。",
      ],
      debug: [
        "所有Q下降且policy无收益",
        "检查α与reward尺度，确认dataset subtraction项",
        "分别消融两项并重新校准α",
        "Continuous实现penalty异常",
        "检查action proposal分布与log-density correction",
        "先复现离散枚举toy，再验证continuous estimator",
      ],
      boundary:
        "仅离散CQL(H)-style regularizer的一步；不是完整CQL，也不宣称给定任意α都成立真实value lower bound。",
    },
  ),
  "decision-transformer": make(
    "decision-transformer",
    "收到 reward 后，desired Return-to-Go 应怎样更新？",
    "desired G0可调；实际观察rewards=[2,1,3]，使用undiscounted RTG convention。",
    control(
      "Initial desired RTG G0",
      5,
      15,
      1,
      10,
      "RTG是conditioning input，不是保证能实现的reward。",
    ),
    (g) => {
      const remaining = [g, g - 2, g - 3, g - 6];
      return result(
        [
          stage(
            "Condition on target",
            "model读取RTG/state/action序列；这里只追踪RTG token。",
            `G0=${g}`,
            ["initial desired return"],
            [g],
            "return",
          ),
          stage(
            "Observe first reward",
            "执行action后才知道真实reward，不能用愿望替代observation。",
            `G1=G0−r0=${g}−2`,
            ["before RTG", "reward", "after RTG"],
            [g, 2, g - 2],
            "return",
          ),
          stage(
            "Continue token updates",
            "每步减实际reward；需要保持训练的scale/convention。",
            "G2=G1−1; G3=G2−3",
            ["G1", "G2", "G3"],
            remaining.slice(1),
            "return",
          ),
          stage(
            "Residual goal",
            "remaining可为负，表示已超过最初目标，而非自动terminal。",
            `G3=G0−Σr=${g}−6`,
            ["desired total", "achieved sum", "remaining"],
            [g, 6, g - 6],
            "return",
          ),
        ],
        "Remaining RTG",
        g - 6,
        "return",
      );
    },
    {
      use: [
        "固定trajectory dataset中，将行为作为return-conditioned sequence建模时使用Decision Transformer。",
        "适合对比BC和value-based offline RL，但需要覆盖有价值的行为trajectory。",
      ],
      tune: [
        "先对齐reward/RTG scaling和context length；target RTG从dataset支持范围选择。",
        "比较多个target RTG并记录真实achieved return，不能只把target设得越高越好。",
      ],
      debug: [
        "Target很高但行为无改善",
        "检查训练数据是否包含相关return与state支持",
        "回到数据支持内的target，补高质量trajectories",
        "RTG token一路漂移",
        "检查reward时间索引、discount及normalization",
        "用三步手算对齐训练与推理更新",
      ],
      boundary:
        "只演示RTG bookkeeping，不生成actions、不训练Transformer或保证达到desired return。",
    },
  ),
  rlhf: make(
    "rlhf",
    "Reward gain 与 reference KL 是怎样加权的？",
    "policy=[.8,.2]，reference=[.5,.5]，两个response的RM rewards=[2,0]。",
    control(
      "KL coefficient β",
      0,
      2,
      0.1,
      0.5,
      "policy固定，只改变目标函数中的reference penalty权重。",
    ),
    (b) => {
      const p = [0.8, 0.2],
        ref = [0.5, 0.5],
        rat = p.map((x, i) => Math.log(x / ref[i])),
        terms = rat.map((x, i) => p[i] * x),
        K = sum(terms),
        R = 1.6,
        J = R - b * K;
      return result(
        [
          stage(
            "Reward expectation",
            "用policy probability加权RM分数。",
            "Eπ[r]=.8×2+.2×0=1.6",
            ["response A", "response B"],
            [1.6, 0],
            "reward contribution",
          ),
          stage(
            "Reference log ratios",
            "单response log ratio可负，整体KL不负。",
            "log(π/πref)",
            ["A log ratio", "B log ratio"],
            rat,
            "nats",
          ),
          stage(
            "Expected KL",
            "KL对policy distribution求expectation。",
            `KL=Σπ log ratio=${fmt(K)}`,
            ["A KL term", "B KL term"],
            terms,
            "nats",
          ),
          stage(
            "Regularized objective",
            "β控制reward与偏离reference之间的tradeoff。",
            `J=1.6−β×${fmt(K)}=${fmt(J)}`,
            ["reward", "KL penalty", "objective"],
            [R, b * K, J],
            "objective",
          ),
        ],
        "Regularized objective",
        J,
      );
    },
    {
      use: [
        "有偏好数据和RM时，RLHF用reward反馈调整生成policy并限制reference偏移。",
        "RM只是proxy，需要独立human/task评价防止reward hacking。",
      ],
      tune: [
        "先对齐reward normalization、sequence/token KL convention，再比较β敏感性。",
        "记录KL、length、RM score和独立quality；不能只优化RM分数。",
      ],
      debug: [
        "RM分数升但回答质量降",
        "检查长回复偏好、style捷径与RM分布外输入",
        "增加独立评估并限制policy偏移",
        "KL出现负的总值",
        "区分单样本log ratio与分布期望KL",
        "用完整两response枚举核对公式和权重",
      ],
      boundary:
        "固定两response distribution的目标值，不执行PPO/RLHF训练，也不等同于DPO的β作用。",
    },
  ),
  "off-policy-evaluation": make(
    "off-policy-evaluation",
    "Logging probability 小时，一条 reward 会被放大多少？",
    "四条bandit日志actions=[A,A,B,B], rewards=[1,0,1,0]；target π(A)=.8，logging μ(A)=m。",
    control(
      "Logging propensity μ(A)",
      0.1,
      0.9,
      0.05,
      0.5,
      "日志fixture固定；改变其已知logging propensity作为what-if，观察IS与ESS。",
    ),
    (m) => {
      const w = [0.8 / m, 0.8 / m, 0.2 / (1 - m), 0.2 / (1 - m)],
        rw = [w[0], 0, w[2], 0],
        is = sum(rw) / 4,
        sn = sum(rw) / sum(w),
        ess = sum(w) ** 2 / sum(w.map((x) => x * x));
      return result(
        [
          stage(
            "Probability contract",
            "μ是当时真实选择概率，不能拿UCB bonus或policy score代替。",
            `μ(A)=${fmt(m)}; π(A)=.8`,
            ["μ(A)", "μ(B)", "π(A)", "π(B)"],
            [m, 1 - m, 0.8, 0.2],
            "probability",
          ),
          stage(
            "Importance ratios",
            "每条日志只对实际action计算ratio。",
            "w=π(a|x)/μ(a|x)",
            ["log1 A", "log2 A", "log3 B", "log4 B"],
            w,
            "ratio",
          ),
          stage(
            "Weighted rewards",
            "Ordinary IS除以n；SNIS除以sum weights。",
            `IS=${fmt(is)}; SNIS=${fmt(sn)}`,
            ["log1", "log2", "log3", "log4"],
            rw,
            "weighted reward",
          ),
          stage(
            "Weight concentration",
            "ESS是权重集中度诊断，不是独立样本数保证。",
            `ESS=(Σw)²/Σw²=${fmt(ess)}`,
            ["IS estimate", "SNIS estimate"],
            [is, sn],
            "reward estimate",
          ),
        ],
        "Ordinary IS estimate",
        is,
        "reward",
        [metric("Weight ESS", ess, "effective count")],
      );
    },
    {
      use: [
        "有known logged propensity与target-policy support时，用OPE估计新policy价值。",
        "Bandit IS适合逐轮即时reward；trajectory RL需要相应序列或value-model estimator。",
      ],
      tune: [
        "先检查positivity与propensity logging，再比较IS/SNIS/DR及confidence intervals。",
        "Weight clipping降低variance但引入bias；阈值必须做敏感性分析，不能宣称仍无偏。",
      ],
      debug: [
        "估计被单条日志主导",
        "检查max weight、ESS和reward outliers",
        "缩小policy偏移、增加覆盖或报告宽interval",
        "历史日志没有propensity",
        "检查是否可从真实部署policy可靠重建",
        "不可重建就明确识别限制，不编造概率",
      ],
      boundary:
        "固定四条合成bandit日志的what-if；SNIS在此恰为.5不代表一般恒定或无偏，也未估计置信区间。",
    },
  ),
  "imitation-learning": make(
    "imitation-learning",
    "DAgger 的 learner roll-in 会把标注预算花到哪些 states？",
    "20个独立toy回合：expert branch到state E，learner branch到state L；每个visited state都请求expert label。",
    control(
      "Expert roll-in mixture β",
      0,
      1,
      0.1,
      0.5,
      "β用于roll-in选policy；expert仍给所有visited states提供监督。",
    ),
    (b) => {
      const counts = [20 * b, 20 * (1 - b)];
      return result(
        [
          stage(
            "Mixed roll-in",
            "以β选expert policy，否则选当前learner；这是toy的episode级混合。",
            "P(expert)=β; P(learner)=1−β",
            ["expert branch", "learner branch"],
            [b, 1 - b],
            "probability",
          ),
          stage(
            "Visited distribution",
            "Learner犯错后到的state可能不在原expert demos中。",
            "E[count]=20×branch probability",
            ["state E", "state L"],
            counts,
            "expected visits",
          ),
          stage(
            "Expert relabeling",
            "DAgger查询visited states的expert action，不拿learner action当label。",
            "expert query count=20",
            ["expert labels at E", "expert labels at L"],
            counts,
            "expected labels",
          ),
          stage(
            "Aggregate coverage",
            "与仅含expert-state的BC数据对照，新增加learner-state监督。",
            `new learner-state labels=${fmt(counts[1])}`,
            ["BC learner-state labels", "DAgger learner-state labels"],
            [0, counts[1]],
            "expected labels",
          ),
        ],
        "Learner-state expert labels",
        counts[1],
        "expected labels",
      );
    },
    {
      use: [
        "BC闭环进入expert demos未覆盖的states时，DAgger收集纠正监督。",
        "需要能向expert查询learner访问状态；若无法可靠标注，不能直接假设DAgger条件成立。",
      ],
      tune: [
        "先比较pure expert与mixed roll-in，逐轮降低β并固定expert查询预算。",
        "按实际closed-loop trajectory评价；本toy的episode-level混合与实现的step-level schedule要区分。",
      ],
      debug: [
        "收集更多数据却只是重复原states",
        "检查roll-in始终由expert控制",
        "降低expert mixture并记录learner-state覆盖",
        "用learner动作当expert标签",
        "核label来源和query trace",
        "保留expert纠正动作并聚合历史数据",
      ],
      boundary:
        "两个branch的expected coverage bookkeeping，不训练DAgger/GAIL，也不代表真实探索的state分布。",
    },
  ),
  "safe-rl-pomdp": make(
    "safe-rl-pomdp",
    "看到危险信号后，belief 与 action cost 会怎样变化？",
    "latent hazard prior=p；P(signal|hazard)=.8,P(signal|safe)=.2；risky action hazard cost=10，safe action固定cost=1。",
    control(
      "Hazard prior p",
      0.05,
      0.95,
      0.05,
      0.5,
      "观测signal固定；改变prior后重算posterior与expected cost。",
    ),
    (p) => {
      const masses = [0.8 * p, 0.2 * (1 - p)],
        post = masses[0] / sum(masses),
        cost = 10 * post;
      return result(
        [
          stage(
            "Observation likelihood",
            "同一signal在hazard和safe下都可能出现。",
            "likelihood=[.8,.2]",
            ["hazard", "safe"],
            [0.8, 0.2],
            "likelihood",
          ),
          stage(
            "Unnormalized belief",
            "先prior×likelihood，不能直接把.8当posterior。",
            "mass=[.8p,.2(1−p)]",
            ["hazard mass", "safe mass"],
            masses,
            "joint probability",
          ),
          stage(
            "Bayesian belief update",
            "belief是基于模型的状态不确定性，不是直接观测state。",
            `b(hazard|signal)=${fmt(post)}`,
            ["hazard", "safe"],
            [post, 1 - post],
            "posterior probability",
          ),
          stage(
            "Cost constraint",
            "若risky expected cost>2，则违反本toy约束；safe action仍有cost1。",
            `E[c_risky]=10b=${fmt(cost)}`,
            ["risky expected cost", "safe cost", "limit"],
            [cost, 1, 2],
            "cost",
          ),
        ],
        "Risky expected cost",
        cost,
        "cost",
      );
    },
    {
      use: [
        "部分可观测状态影响决策时，需要belief或recurrent state；safety还要显式cost约束。",
        "适合区别reward maximization、expected cost constraint与逐轨迹安全。",
      ],
      tune: [
        "先校验observation model和cost单位，再设置risk budget；不要把reward penalty当硬约束。",
        "检查tail事件、model misspecification和shift，而非只看平均cost。",
      ],
      debug: [
        "信号一来就把hazard概率设为.8",
        "检查prior和Bayes normalization",
        "用两个joint masses重算posterior",
        "平均cost合格仍有严重事件",
        "检查per-trajectory tails及模型外场景",
        "加入约束检查、fallback与压力测试",
      ],
      boundary:
        "一次Bayesian belief/cost检查；没有规划POMDP或提供真实系统的安全保证。",
    },
  ),
  "contextual-bandits-linucb": make(
    "contextual-bandits-linucb",
    "Directional uncertainty 何时让新 arm 值得尝试？",
    "x=[1,0]；arm A ridge A=diag(4,1),b=[2,0]；arm B A=I,b=0。",
    control(
      "Exploration coefficient α",
      0,
      2,
      0.1,
      1.2,
      "比较预测mean与confidence width；UCB score不是selection probability。",
    ),
    (a) => {
      const means = [0.5, 0],
        width = [0.5, 1],
        bonus = width.map((x) => a * x),
        scores = means.map((x, i) => x + bonus[i]),
        chosen = scores[1] > scores[0] ? 1 : 0;
      const st = stage(
        "Ridge statistics",
        "每个arm有独立A和b；这里只看x方向。",
        "θ_A=A_A⁻¹b_A=[.5,0]; θ_B=[0,0]",
        ["A mean", "B mean"],
        means,
        "predicted reward",
      );
      return result(
        [
          st,
          stage(
            "Directional uncertainty",
            "xᵀA⁻¹x依方向而变，并非只由总sample count决定。",
            "width=√(xᵀA⁻¹x)",
            ["A width", "B width"],
            width,
            "width",
          ),
          stage(
            "Optimistic scores",
            "用α在exploitation与exploration之间调节。",
            `score=mean+α×width`,
            ["A score", "B score"],
            scores,
            "score",
          ),
          stage(
            "Chosen-arm update",
            "只给所选arm加xxᵀ；未选arm保持不变。",
            `selected=${chosen ? "B" : "A"}; A_selected←A_selected+xxᵀ`,
            ["A first diagonal", "B first diagonal"],
            [4 + (chosen === 0 ? 1 : 0), 1 + (chosen === 1 ? 1 : 0)],
            "ridge statistic",
          ),
        ],
        "B minus A UCB score",
        scores[1] - scores[0],
        "score",
      );
    },
    {
      use: [
        "每轮有context但action不显著改变未来state机会时，可用contextual bandit。",
        "Ridge+linear reward假设较合理且需要可检查uncertainty时，LinUCB是清晰baseline。",
      ],
      tune: [
        "标准化features，先核regularization λ与reward尺度，再调α。",
        "真实部署若需要OPE，需记录实际randomization propensity；deterministic UCB不是概率。",
      ],
      debug: [
        "某feature尺度大导致bonus异常",
        "检查x norm及A条件数",
        "按训练流程scale features并增加ridge regularization",
        "所有arms都被同一feedback更新",
        "检查chosen-arm index与日志",
        "只更新chosen arm，保留完整context/action/reward",
      ],
      boundary:
        "两个arms的二维disjoint LinUCB score及一次A更新；没有长期regret或真实reward保证。",
    },
  ),
};
