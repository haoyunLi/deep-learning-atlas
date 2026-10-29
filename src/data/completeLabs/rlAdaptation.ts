import { type CompleteLabMap, fmt, softmax, sigmoid, sum } from "./types";
import { control, stage, result, make, entropy } from "./rlShared";
export const rlAdaptationLabs: CompleteLabMap = {
  "matching-networks": make(
    "matching-networks",
    "Support attention 与一个 class prototype 有何不同？",
    "Query 对三个 support 的 cosine similarity=[.8,.6,.7]，support labels=[A,A,B]。",
    control(
      "Attention temperature τ",
      0.1,
      2,
      0.1,
      0.5,
      "从.5开始；降低τ会集中到最近单个support，而不是先平均每类embedding。",
    ),
    (t) => {
      const s = [0.8, 0.6, 0.7],
        z = s.map((x) => x / t),
        w = softmax(z),
        p = [w[0] + w[1], w[2]];
      return result(
        [
          stage(
            "Compare every support",
            "两个A各保留自己的相似度，不先合并成prototype。",
            `similarities=[${s.join(",")}]; τ=${fmt(t)}`,
            ["A1", "A2", "B1"],
            s,
            "cosine",
          ),
          stage(
            "Scale and normalize",
            "softmax分母包括全部三个support。",
            `a_i=exp(sim_i/${fmt(t)}) / Σ_j exp(sim_j/${fmt(t)})`,
            ["A1 weight", "A2 weight", "B1 weight"],
            w,
            "probability",
          ),
          stage(
            "Vote by class",
            "同类support的attention相加；标签本身不参与similarity计算。",
            `P(A)=${fmt(w[0])}+${fmt(w[1])}=${fmt(p[0])}`,
            ["P(A)", "P(B)"],
            p,
            "probability",
          ),
          stage(
            "Query loss",
            "假设query真标签为A，训练时才据此算loss。",
            `L=−log P(A)=${fmt(-Math.log(p[0]))}`,
            ["A loss", "attention entropy"],
            [-Math.log(p[0]), entropy(w)],
            "nats",
          ),
        ],
        "Class A probability",
        p[0],
      );
    },
    {
      use: [
        "每个新task只有少量support且可逐个比较时，Matching Networks适合做non-parametric分类。",
        "与ProtoNet比较：support多时保存和比较每个实例更贵，class imbalance也会改变attention总票数。",
      ],
      tune: [
        "先固定embedding、τ=.5和balanced N-way K-shot；attention太平再减τ，并看held-out task accuracy。",
        "若一个outlier吸走多数weight，提高τ或改善embedding；不要根据同一query标签反复调τ。",
      ],
      debug: [
        "某类几乎总获胜",
        "检查support数量是否失衡及是否按实例softmax",
        "使用balanced episode，另报告真实class prior下的表现。",
        "同个query结果不稳定",
        "检查support抽样和feature normalization",
        "固定episode seed，重复多个support draw并报告区间。",
      ],
      boundary:
        "这里仅重现attention-weighted label vote；不训练原论文contextual embedding，温度是显式教学扩展。",
    },
  ),
  "relation-networks": make(
    "relation-networks",
    "Learned relation score 如何不同于固定Euclidean distance？",
    "固定pair feature φ=[.5,−.5]，一个toy relation head r=σ(wφ)，target=[1,0]。",
    control(
      "Relation head weight w",
      -4,
      4,
      0.25,
      2,
      "从w=2开始，观察learned scorer方向反转时两类关系分数如何交换。",
    ),
    (w) => {
      const phi = [0.5, -0.5],
        z = phi.map((x) => w * x),
        r = z.map(sigmoid),
        err = r.map((x, i) => (x - (i === 0 ? 1 : 0)) ** 2),
        g = sum(
          r.map((x, i) => (x - (i === 0 ? 1 : 0)) * x * (1 - x) * phi[i]),
        );
      return result(
        [
          stage(
            "Construct pair features",
            "φ代表已提取的support-query pair特征，不能把它当固定distance。",
            `φ=[.5,−.5]; w=${fmt(w)}`,
            ["pair A", "pair B"],
            phi,
            "feature",
          ),
          stage(
            "Learned scorer",
            "关系head可以学到哪个pair特征方向有意义。",
            `r=σ(wφ)=[${r.map((v) => fmt(v)).join(", ")}]`,
            ["relation A", "relation B"],
            r,
            "score",
          ),
          stage(
            "Supervised relation loss",
            "用binary relation target监督score；两个score并不强制和为1，此fixture对称才碰巧如此。",
            `L=mean((r−[1,0])²)=${fmt(sum(err) / 2)}`,
            ["A squared error", "B squared error"],
            err,
            "squared error",
          ),
          stage(
            "Head gradient",
            "MSE mean的2与样本数2相消，沿gradient descent更新w。",
            `dL/dw=Σ(r−y)r(1−r)φ=${fmt(g)}; w′=w−.1g`,
            ["current w", "updated w"],
            [w, w - 0.1 * g],
            "weight",
          ),
        ],
        "Relation MSE",
        sum(err) / 2,
      );
    },
    {
      use: [
        "距离度量不足以表达support-query关系、且有足够training episodes时，可学习Relation Network。",
        "与固定metric相比，多了可学习比较器，也多了overfit和domain shift风险；小数据先保留ProtoNet baseline。",
      ],
      tune: [
        "先用小relation head和MSE baseline；训练好、held-out classes差时减head容量并加强episode多样性。",
        "从统一feature scale开始；sigmoid饱和且gradient接近0时检查logit量级并降低head learning rate。",
      ],
      debug: [
        "score全部接近0或1",
        "检查pair feature幅值、head logit和初始化",
        "标准化输入并缩小初始weights；查看gradients再重训。",
        "support顺序改变预测",
        "检查拼接/aggregation是否引入未预期顺序依赖",
        "按task固定label mapping并测试support permutation。",
      ],
      boundary:
        "只计算一个固定pair-feature的scalar relation head，不代表完整CNN Relation Network训练或已学得的相似性。",
    },
  ),
  "siamese-triplet": make(
    "siamese-triplet",
    "Triplet margin 多大时才会产生gradient？",
    "一维anchor=0、positive=.4、negative=1；使用squared Euclidean distance。",
    control(
      "Triplet margin m",
      0,
      2,
      0.1,
      1,
      "从m=1开始；只有d_ap²−d_an²+m>0的triplet被激活。",
    ),
    (m) => {
      const dp = 0.16,
        dn = 1,
        raw = dp - dn + m,
        L = Math.max(0, raw),
        active = raw > 0,
        grad = active ? 1.2 : 0;
      return result(
        [
          stage(
            "Choose a triplet",
            "同类positive应比异类negative更近，三者使用共享encoder。",
            `a=0; p=.4; n=1; margin=${fmt(m)}`,
            ["anchor", "positive", "negative"],
            [0, 0.4, 1],
            "embedding",
          ),
          stage(
            "Squared distances",
            "此公式的margin单位是squared distance。",
            `d_ap²=.16; d_an²=1; gap=.84`,
            ["positive distance²", "negative distance²", "required margin"],
            [dp, dn, m],
            "distance²",
          ),
          stage(
            "Hinge activation",
            "满足margin后loss为0，不会继续拉开这个triplet。",
            `L=max(0,.16−1+${fmt(m)})=${fmt(L)}`,
            ["raw violation", "hinge loss"],
            [raw, L],
            "loss",
          ),
          stage(
            "Anchor gradient",
            "active时∂L/∂a=2(a−p)−2(a−n)=1.2；descent将a向左移动。",
            `active=${Number(active)}; a′=0−.1×${fmt(grad)}`,
            ["anchor gradient", "new anchor"],
            [grad, -0.1 * grad],
            "value",
          ),
        ],
        "Triplet loss",
        L,
      );
    },
    {
      use: [
        "需要retrieval、verification或跨类embedding时，可用Siamese/Triplet objective。",
        "Triplet mining决定训练信号；只挑极难negative可能挑中错标签，contrastive batch objectives也值得比较。",
      ],
      tune: [
        "以normalized embeddings和小margin如.2作起点；active triplet比例太低才逐步增margin或换semi-hard mining。",
        "先保持batch内足够同类和异类样本；loss长期高时检查negative污染，不直接无限增加margin。",
      ],
      debug: [
        "loss为0但retrieval差",
        "检查triplet是否全太容易和evaluation candidate难度",
        "加入semi-hard negatives并按held-out identities评估。",
        "embedding norm持续增加",
        "检查是否未normalize且通过缩放满足margin",
        "采用L2 normalization，明确squared或unsquared distance。",
      ],
      boundary:
        "三点是synthetic固定embedding；m=.84处hinge不可微，此demo选择0作为subgradient，不模拟encoder训练。",
    },
  ),
  "meta-sgd-anil": make(
    "meta-sgd-anil",
    "Inner learning rate 怎样通过query loss被meta-learn？",
    "θ=0；support loss=.5(θ−2)²；query loss=.5(θ′−3)²；一次inner update。",
    control(
      "Learned inner step α",
      -1,
      2,
      0.1,
      0.5,
      "从.5开始；Meta-SGD的α可按parameter学习甚至带符号，此处只有一个parameter。",
    ),
    (a) => {
      const g = -2,
        next = 2 * a,
        L = 0.5 * (next - 3) ** 2,
        meta = 2 * (next - 3);
      return result(
        [
          stage(
            "Support gradient",
            "support只用于inner adaptation，query不能泄漏进这一步。",
            `∂Lsupport/∂θ=θ−2=−2`,
            ["initial θ", "support target", "inner gradient"],
            [0, 2, g],
            "value",
          ),
          stage(
            "Inner update",
            "α决定更新幅度与方向。",
            `θ′=0−α(−2)=2×${fmt(a)}=${fmt(next)}`,
            ["initial parameter", "adapted parameter"],
            [0, next],
            "parameter",
          ),
          stage(
            "Held-out query objective",
            "在同一个task的另一个example检验adaptation。",
            `Lquery=.5(${fmt(next)}−3)²=${fmt(L)}`,
            ["support loss after", "query loss"],
            [0.5 * (next - 2) ** 2, L],
            "loss",
          ),
          stage(
            "Meta gradient",
            "保留inner计算图，才能对α求导。",
            `dLquery/dα=(θ′−3)×2=${fmt(meta)}; αnew=α−.05g`,
            ["meta gradient", "updated α"],
            [meta, a - 0.05 * meta],
            "value",
          ),
        ],
        "Query loss after adaptation",
        L,
      );
    },
    {
      use: [
        "任务相关且每个新task有少量labels时，用Meta-SGD学习适配初始化与step。",
        "ANIL主要在inner loop更新head；需要更低adaptation成本时，与全parameter adaptation比较。",
      ],
      tune: [
        "从α=.1或小的per-layer值开始，扫inner step数；support改善但query变差时减α和steps。",
        "先用1-step、明确support/query split；meta-gradient爆炸时减outer learning rate并检查高阶图。",
      ],
      debug: [
        "α完全不更新",
        "检查inner update是否detach或in-place覆盖parameter",
        "用functional update保留计算图，并验证finite-difference meta-gradient。",
        "新task拟合但泛化差",
        "检查query是否和support同源重复、任务分布是否变化",
        "按task/source留出，比较frozen backbone与ANIL。",
      ],
      boundary:
        "只演示scalar Meta-SGD链式求导；不是完整ANIL实验，也不说明学得α对任意新task有效。",
    },
  ),
  "learned-optimizers": make(
    "learned-optimizers",
    "Optimizer 的memory怎样改变下一次更新？",
    "Toy update policy m_t=βm_(t−1)+(1−β)g_t；θ_t=θ_(t−1)−.2m_t；L=.5(θ−2)²，θ0=0。",
    control(
      "Optimizer memory β",
      0,
      0.9,
      0.1,
      0.5,
      "从.5开始；把β看作可由outer loop选择的optimizer参数，当前不训练RNN。",
    ),
    (b) => {
      let th = 0,
        mem = 0;
      const gs: number[] = [],
        ms: number[] = [],
        ts: number[] = [],
        ls: number[] = [];
      for (let i = 0; i < 3; i++) {
        const g = th - 2;
        mem = b * mem + (1 - b) * g;
        th -= 0.2 * mem;
        gs.push(g);
        ms.push(mem);
        ts.push(th);
        ls.push(0.5 * (th - 2) ** 2);
      }
      return result(
        [
          stage(
            "Observe gradients",
            "gradient来自当前inner parameter，后续gradient会随更新而变。",
            `g_t=θ_(t−1)−2; β=${fmt(b)}`,
            ["g1", "g2", "g3"],
            gs,
            "gradient",
          ),
          stage(
            "Update optimizer state",
            "memory组合历史与当前gradient；这是优化算法的state。",
            `m_t=${fmt(b)}m_(t−1)+${fmt(1 - b)}g_t`,
            ["m1", "m2", "m3"],
            ms,
            "state",
          ),
          stage(
            "Apply updates",
            "每步使用自己的memory；没有重复套用initial gradient。",
            `θ_t=θ_(t−1)−.2m_t`,
            ["θ1", "θ2", "θ3"],
            ts,
            "parameter",
          ),
          stage(
            "Outer objective",
            "outer loop可以比较整段optimization trace的final loss。",
            `J(β)=L(θ3)=${fmt(ls[2])}`,
            ["loss1", "loss2", "loss3"],
            ls,
            "loss",
          ),
        ],
        "Final inner loss",
        ls[2],
      );
    },
    {
      use: [
        "重复解决相似optimization任务、outer training成本可以摊销时，可考虑Learned Optimizer。",
        "常规Adam/SGD是必要baseline；跨architecture、scale和horizon泛化通常是额外难点。",
      ],
      tune: [
        "先用短unroll和固定gradient scale验证meta objective，再延长horizon检查short-horizon bias。",
        "此toy从β=.5开始；更新过慢时降低β，震荡时同时检查step size，而非认为memory越长越好。",
      ],
      debug: [
        "short unroll好、长训练发散",
        "检查outer training horizon和部署horizon差距",
        "加入更长unroll评估并约束更新幅度。",
        "meta-gradient占满显存",
        "检查是否保存了全部inner graph",
        "使用truncated unroll或checkpointing，明确梯度估计的偏差。",
      ],
      boundary:
        "展示有state的可参数化optimizer及outer目标；该EMA不是论文LSTM optimizer，也没有实际meta-training。",
    },
  ),
  "hypernetworks-meta-gradients": make(
    "hypernetworks-meta-gradients",
    "Hypernetwork生成weight后，gradient怎么回到generator？",
    "Hypernetwork w=az+b，a=2,b=1；downstream x=2，yhat=wx，target=4。",
    control(
      "Task code z",
      -1,
      2,
      0.1,
      0.5,
      "从z=.5开始；task code改变生成的weight，不直接充当模型输出。",
    ),
    (z) => {
      const w = 2 * z + 1,
        y = 2 * w,
        L = 0.5 * (y - 4) ** 2,
        dw = 2 * (y - 4),
        da = dw * z,
        dz = dw * 2;
      return result(
        [
          stage(
            "Condition generator",
            "task embedding z传入Hypernetwork。",
            `w=2×${fmt(z)}+1=${fmt(w)}`,
            ["task code", "generated weight"],
            [z, w],
            "value",
          ),
          stage(
            "Run generated model",
            "预测由生成的weight和input共同决定。",
            `ŷ=w×2=${fmt(y)}`,
            ["prediction", "target"],
            [y, 4],
            "output",
          ),
          stage(
            "Downstream gradient",
            "loss先对generated weight求导。",
            `L=.5(ŷ−4)²=${fmt(L)}; dL/dw=2(ŷ−4)=${fmt(dw)}`,
            ["loss", "dL/dw"],
            [L, dw],
            "value",
          ),
          stage(
            "Chain into generator",
            "dL/da=(dL/dw)z；dL/dz=(dL/dw)a。",
            `dL/da=${fmt(da)}; dL/dz=${fmt(dz)}`,
            ["generator a gradient", "task code gradient"],
            [da, dz],
            "gradient",
          ),
        ],
        "Downstream loss",
        L,
      );
    },
    {
      use: [
        "多个task需要不同weights且可共享generator时，Hypernetwork可做conditional parameter generation。",
        "生成整个大模型weights很贵；先比较生成adapter、low-rank factors或小head。",
      ],
      tune: [
        "先限制生成head的规模和weight norm；task code轻微变化导致预测剧烈跳变时加regularization并检查scale。",
        "从稳定的base weights加小delta开始；query loss没改善时比较直接fine-tuning与generator容量。",
      ],
      debug: [
        "generator没有gradient",
        "检查generated weights是否被复制到detached Parameter",
        "用functional调用维持loss到generator的路径。",
        "新task code表现很差",
        "检查code是否落在training task分布外",
        "按held-out task评估，限制外推并增加task覆盖。",
      ],
      boundary:
        "一个linear Hypernetwork的精确chain rule；没有证明生成weight优于直接学习，z也不是通用生物学latent。",
    },
  ),
  "memory-augmented-meta-learning": make(
    "memory-augmented-meta-learning",
    "External memory如何按content读取而不改network weights？",
    "两个memory key=[1,0]与[0,1]，values=[2,8]；query=[q,1−q]，dot-product addressing。",
    control(
      "Query first coordinate q",
      0,
      1,
      0.05,
      0.5,
      "从.5开始；控制query方向，用fixed temperature .2观察soft read。",
    ),
    (q) => {
      const scores = [q, 1 - q],
        w = softmax(scores.map((x) => x / 0.2)),
        contrib = [2 * w[0], 8 * w[1]],
        read = sum(contrib);
      return result(
        [
          stage(
            "Address memory",
            "固定keys与query计算content score。",
            `s=[q,1−q]=[${scores.map((v) => fmt(v)).join(", ")}]`,
            ["slot1 score", "slot2 score"],
            scores,
            "dot product",
          ),
          stage(
            "Read weights",
            "softmax让两个slot贡献连续变化。",
            `a=softmax(s/.2)`,
            ["slot1 weight", "slot2 weight"],
            w,
            "probability",
          ),
          stage(
            "Retrieve values",
            "read是value的weighted sum，不是key本身。",
            `r=${fmt(w[0])}×2+${fmt(w[1])}×8=${fmt(read)}`,
            ["slot1 contribution", "slot2 contribution"],
            contrib,
            "value",
          ),
          stage(
            "Distinguish state from weights",
            "query改变读取结果；本次forward没有gradient update或memory write。",
            `read=${fmt(read)}; network updates=0`,
            ["retrieved value", "parameter updates"],
            [read, 0],
            "value",
          ),
        ],
        "Memory read",
        read,
      );
    },
    {
      use: [
        "同task内需要快速记住新example且不想每次做gradient update时，可用external memory。",
        "Memory capacity、write policy、key collision都影响表现；它与把所有历史塞入context有不同成本。",
      ],
      tune: [
        "先从少量slots和明确episode reset开始；不同task互相污染时检查memory生命周期。",
        "从适中的addressing temperature开始；read过于平均就检查key separation，再考虑降temperature。",
      ],
      debug: [
        "新task沿用旧答案",
        "检查memory是否跨episode保留以及是否含label泄漏",
        "按任务重置memory，明确允许持久化的部分。",
        "所有query读到同一slot",
        "检查keys collapse、normalization和temperature",
        "画read weights并检查write覆盖，别只增memory容量。",
      ],
      boundary:
        "展示soft content-based read，dot-product为教学选择；不模拟原论文完整write allocation或meta-trained controller。",
    },
  ),
  "meta-reinforcement-learning": make(
    "meta-reinforcement-learning",
    "Fast adaptation可以只改变hidden state吗？",
    "固定Beta(1,1) prior，某arm前4次reward中有s次success；以count memory构造Bayesian fast-adaptation baseline。",
    control(
      "Observed successes s",
      0,
      4,
      1,
      2,
      "从2开始；观察history改变belief而非network parameter。",
    ),
    (s) => {
      const a = 1 + s,
        b = 1 + 4 - s,
        p = a / (a + b),
        varp = (a * b) / ((a + b) ** 2 * (a + b + 1));
      return result(
        [
          stage(
            "Collect task history",
            "reward history属于当前task；下个task应重置task state。",
            `4 observations: success=${s}, failure=${4 - s}`,
            ["success", "failure"],
            [s, 4 - s],
            "count",
          ),
          stage(
            "Update fast state",
            "这里state是conjugate counts，起到RNN hidden state的可解释baseline作用。",
            `α=1+s=${a}; β=1+4−s=${b}`,
            ["posterior α", "posterior β"],
            [a, b],
            "count",
          ),
          stage(
            "Predict reward",
            "使用posterior mean比较arm；prior未通过SGD改变。",
            `E[p]=α/(α+β)=${fmt(p)}`,
            ["arm expected reward", "reference arm mean"],
            [p, 0.5],
            "probability",
          ),
          stage(
            "State uncertainty",
            "posterior uncertainty与parameter training是两件事。",
            `Var[p]=αβ/((α+β)²(α+β+1))=${fmt(varp)}`,
            ["posterior variance", "slow parameter updates"],
            [varp, 0],
            "value",
          ),
        ],
        "Posterior reward mean",
        p,
      );
    },
    {
      use: [
        "很多相关bandit/MDP任务上需要利用少量interaction快速适应时，Meta-RL可以学习fast adaptation机制。",
        "与online RL比较，Meta-RL的快适应依赖training task分布；新reward结构可能超出经验。",
      ],
      tune: [
        "先用Bayesian bandit和recurrent policy baseline检查history是否被利用，再扩展复杂MDP。",
        "起点是跨同task episodes保留hidden state、跨task清零；适应过慢时检查history长度和探索覆盖。",
      ],
      debug: [
        "episode结束后每次重学",
        "检查done与task_done是否混用",
        "同MDP内保留允许的hidden state，换task再reset。",
        "训练任务很好新任务很差",
        "检查task generator覆盖和task-level split",
        "留出reward/transition families，比较Bayesian或standard RL baseline。",
      ],
      boundary:
        "这是精确Beta-Bernoulli baseline解释history-based adaptation；不是RL² RNN输出，也不声称其hidden state必然表示Bayesian posterior。",
    },
  ),
  "cross-domain-few-shot": make(
    "cross-domain-few-shot",
    "Domain scale shift怎样改变Euclidean few-shot判断？",
    "两个class prototype A=[0,0]、B=[2,2]，query=[.5,1.8]；第二feature被domain scale s放大。",
    control(
      "Second-feature scale s",
      0.25,
      3,
      0.25,
      1,
      "从1开始；同时变换support与query，再比较raw和scale-corrected metric。",
    ),
    (s) => {
      const raw = [0.5 ** 2 + (1.8 * s) ** 2, 1.5 ** 2 + (0.2 * s) ** 2],
        corr = [0.25 + 3.24, 2.25 + 0.04],
        p = softmax(raw.map((x) => -x));
      return result(
        [
          stage(
            "Apply domain transform",
            "同domain中的query与prototype一起变换，避免造出不一致坐标。",
            `q=[.5,1.8s]; B=[2,2s]; s=${fmt(s)}`,
            ["query feature1", "query feature2", "B feature2"],
            [0.5, 1.8 * s, 2 * s],
            "feature",
          ),
          stage(
            "Raw metric",
            "feature scale会变成distance中的隐式权重s²。",
            `d_A²=.25+3.24s²; d_B²=2.25+.04s²`,
            ["A distance²", "B distance²"],
            raw,
            "distance²",
          ),
          stage(
            "Soft classification",
            "metric改变会影响排序和confidence。",
            `P(A)=softmax(−d²)_A=${fmt(p[0])}`,
            ["P(A)", "P(B)"],
            p,
            "probability",
          ),
          stage(
            "Known-scale correction",
            "如果s是已知measurement calibration，除以s后恢复原metric；未知target统计不能偷看test labels。",
            `corrected distances=[3.49,2.29]`,
            ["corrected A distance²", "corrected B distance²"],
            corr,
            "distance²",
          ),
        ],
        "Raw class A probability",
        p[0],
      );
    },
    {
      use: [
        "Single-cell跨platform、Spatial跨staining流程时，feature scale shift会破坏预训练metric，可用此例诊断。",
        "Cross-domain few-shot需要target support；不能把有target labels的设定报告成zero-shot domain generalization。",
      ],
      tune: [
        "先检查normalization、feature scale和domain-wise baseline；以source-fitted preprocessing开始并记录是否使用target unlabeled数据。",
        "从frozen embedding+prototype开始；support足够且domain差距大时再逐步unfreeze，并在held-out domains选择设置。",
      ],
      debug: [
        "同类型跨批次分开",
        "检查batch是否支配distance以及biology与batch是否confounded",
        "比较calibration、integration和raw baseline，不能盲目去除真实生物差异。",
        "target准确率过于理想",
        "检查normalization或tuning是否用了test labels",
        "把support、validation和query严格分开并按donor/domain切分。",
      ],
      boundary:
        "已知diagonal scale transform的metric敏感性实验；不是完整domain adaptation，也不保证standardization保留biological signal。",
    },
  ),
  "transfer-learning-strategies": make(
    "transfer-learning-strategies",
    "只训练head与unfreeze backbone的一步更新有什么差别？",
    "Scalar backbone b=1、head h=1、input x=2、target y=4；L=.5(hbx−y)²，learning rate=.1。",
    control(
      "Unfreeze backbone (0/1)",
      0,
      1,
      1,
      0,
      "0为head-only，1为同时更新；每个gradient来自同一次forward。",
    ),
    (u) => {
      const pred = 2,
        gh = -4,
        gb = -4,
        h = 1 - 0.1 * gh,
        b = 1 - u * 0.1 * gb,
        next = h * b * 2,
        L = 0.5 * (next - 4) ** 2;
      return result(
        [
          stage(
            "Forward pass",
            "两个策略共用同一个起点和initial loss，便于公平比较。",
            `ŷ=hbx=2; L=.5(2−4)²=2`,
            ["prediction", "target", "initial loss"],
            [pred, 4, 2],
            "value",
          ),
          stage(
            "Compute both gradients",
            "freeze不表示backbone mathematically无gradient，而是optimizer不更新它。",
            `dL/dh=(ŷ−y)bx=−4; dL/db=(ŷ−y)hx=−4`,
            ["head gradient", "applied backbone gradient"],
            [gh, u * gb],
            "gradient",
          ),
          stage(
            "Update trainable parameters",
            "先算全部gradient，再同时update，避免sequential update混淆。",
            `h′=1.4; b′=1+.4×${u}=${fmt(b)}`,
            ["head after", "backbone after", "trainable scalar count"],
            [h, b, 1 + u],
            "value",
          ),
          stage(
            "Recompute loss",
            "在这个单example上full update更接近target，但不能从training loss判断泛化。",
            `ŷ′=${fmt(next)}; L′=.5(ŷ′−4)²=${fmt(L)}`,
            ["new prediction", "new loss"],
            [next, L],
            "value",
          ),
        ],
        "Loss after transfer update",
        L,
      );
    },
    {
      use: [
        "labels少且pretrained domain接近时，先训练head可减少overfit和算力成本。",
        "domain差距大、label较多时再逐层unfreeze；代价包括更多显存和遗忘风险。",
      ],
      tune: [
        "先跑head-only baseline；validation改善停滞才解冻高层，并让backbone learning rate低于head。",
        "从较小backbone learning rate和early stopping开始；training继续改善但validation下降就减解冻范围或加强regularization。",
      ],
      debug: [
        "freeze后BN统计仍变化",
        "检查train/eval模式与running statistics",
        "根据任务明确冻结weights是否也冻结BN stats，记录设置。",
        "解冻后性能骤降",
        "检查新optimizer parameter groups和learning rate",
        "降低backbone learning rate并确认没有重置错误的optimizer state。",
      ],
      boundary:
        "一对scalar权重的一次SGD，所有数值是training example；不能据此推断full fine-tuning总优于linear probe。",
    },
  ),
  "domain-adaptation-dann": make(
    "domain-adaptation-dann",
    "Gradient Reversal 究竟反转哪条gradient？",
    "固定local task gradient g_y=1，domain loss对feature gradient g_d=.6；feature θ=1，step=.1。",
    control(
      "Domain weight λ",
      0,
      3,
      0.1,
      1,
      "从较小λ开始；此处只改变feature侧adversarial gradient权重。",
    ),
    (l) => {
      const reverse = -l * 0.6,
        g = 1 + reverse,
        next = 1 - 0.1 * g;
      return result(
        [
          stage(
            "Two objectives",
            "task predictor要保留label信息；domain classifier尝试识别domain。",
            `g_task=1; g_domain=.6; λ=${fmt(l)}`,
            ["task gradient", "domain gradient"],
            [1, 0.6],
            "gradient",
          ),
          stage(
            "Reverse feature gradient",
            "feature extractor收到−λg_domain；domain classifier自身仍最小化domain loss。",
            `g_domain→feature=−${fmt(l)}×.6=${fmt(reverse)}`,
            ["before reversal", "after reversal"],
            [0.6, reverse],
            "gradient",
          ),
          stage(
            "Combine at extractor",
            "domain weight过大会压过task梯度，不能只追求domain accuracy为chance。",
            `g_feature=1−.6λ=${fmt(g)}`,
            ["task contribution", "domain contribution", "total gradient"],
            [1, reverse, g],
            "gradient",
          ),
          stage(
            "Feature parameter update",
            "gradient descent沿total gradient反方向。",
            `θ′=1−.1×${fmt(g)}=${fmt(next)}`,
            ["before θ", "after θ"],
            [1, next],
            "parameter",
          ),
        ],
        "Feature parameter after update",
        next,
      );
    },
    {
      use: [
        "有source labels与target unlabeled data、目标label语义相同但domain偏移时，DANN可学习domain-insensitive features。",
        "Single-cell batch correction若batch和cell type混杂，adversarial removal可能删掉biology；保留cell-type metrics和raw baseline。",
      ],
      tune: [
        "从λ=0的task baseline开始，再warm up到小正值；task validation明显下降时减λ而非只看domain accuracy。",
        "同时监控label performance、domain confusion和per-class alignment；两边gradient量级失衡时调λ或learning rates。",
      ],
      debug: [
        "domain classifier loss持续增大但task变差",
        "检查gradient reversal是否误加在domain classifier参数上",
        "只在feature路径反转，classifier仍按正常descent训练。",
        "domain不可区分但target错很多",
        "检查label shift或不同class被强行混合",
        "加class-conditional诊断，必要时停止global adversarial alignment。",
      ],
      boundary:
        "固定local gradients的一步更新，用于审计sign与weight；不是完整DANN训练，不保证domain confusion意味着target risk下降。",
    },
  ),
  "domain-generalization-irm": make(
    "domain-generalization-irm",
    "IRM penalty为何要看各environment对同一classifier的gradient？",
    "两个environment各一个点：φ=[1,2]、y=[1,1]；dummy classifier w=1，R_e=.5(wφ_e−y_e)²。",
    control(
      "IRM penalty λ",
      0,
      2,
      0.1,
      0.5,
      "从λ=0对照ERM，再增加penalty观察objective组成；features此处固定。",
    ),
    (l) => {
      const r = [0, 0.5],
        g = [0, 2],
        pen = sum(g.map((x) => x * x)),
        erm = sum(r) / 2,
        J = erm + l * pen;
      return result(
        [
          stage(
            "Shared classifier",
            "相同w应用到两个environment；不是为每个environment单独拟合w。",
            `w=1; predictions=[1,2]`,
            ["env1 prediction", "env2 prediction"],
            [1, 2],
            "prediction",
          ),
          stage(
            "Environment risks",
            "本例ERM用environment平均；penalty用sum，明确normalization才能比较λ。",
            `R=[0,.5]; mean R=.25`,
            ["env1 risk", "env2 risk"],
            r,
            "loss",
          ),
          stage(
            "Classifier gradients",
            "每个environment若都偏好同一w，其risk gradient应接近0。",
            `g_e=(wφ_e−y_e)φ_e=[0,2]; Σg_e²=4`,
            ["env1 gradient²", "env2 gradient²"],
            g.map((x) => x * x),
            "gradient²",
          ),
          stage(
            "IRMv1-style objective",
            "优化representation时会通过penalty反传；本沙盘只拆分objective。",
            `J=.25+${fmt(l)}×4=${fmt(J)}`,
            ["ERM mean", "weighted penalty", "total objective"],
            [erm, l * pen, J],
            "objective",
          ),
        ],
        "IRM objective",
        J,
      );
    },
    {
      use: [
        "训练有多个有意义的environment且希望跨environment泛化时，可研究IRM的invariance约束。",
        "environment划分不是随意batch切分；在biology中要解释不同donor/protocol怎样改变spurious correlation。",
      ],
      tune: [
        "从ERM λ=0开始，先warm up再增加penalty；risk恶化而penalty趋零时检查feature collapse。",
        "固定risk与penalty的sum/mean定义再扫λ；按held-out environment调参，不能直接看test environment labels。",
      ],
      debug: [
        "penalty为0但预测没信息",
        "检查representation是否全部接近0",
        "同时检查ERM risk和feature variance，避免退化解。",
        "实现结果对batch size极敏感",
        "检查是否错误地先平均gradient再平方",
        "分别算environment gradient和squared norm，再按声明规则汇总。",
      ],
      boundary:
        "IRMv1-style scalar gradient penalty，使用明确sum convention；不是IRM理论约束的完整求解，也不能保证OOD泛化。",
    },
  ),
  "continual-learning": make(
    "continual-learning",
    "EWC如何在旧知识和新任务之间折中？",
    "Old optimum θ*=0，Fisher diagonal F=2；new loss=.5(θ−2)²；EWC penalty=λFθ²/2。",
    control(
      "EWC strength λ",
      0,
      5,
      0.25,
      1,
      "从λ=1开始；解出这个quadratic问题的精确optimum，而非画虚构训练曲线。",
    ),
    (l) => {
      const theta = 2 / (1 + 2 * l),
        newLoss = 0.5 * (theta - 2) ** 2,
        pen = l * theta ** 2,
        old = 0.5 * theta ** 2;
      return result(
        [
          stage(
            "Remember importance",
            "F大表示旧任务认为该weight重要；F不是每个parameter同样的常数，toy只取一个。",
            `θ*=0; F=2; λ=${fmt(l)}`,
            ["old optimum", "new optimum", "Fisher diagonal"],
            [0, 2, 2],
            "value",
          ),
          stage(
            "Balance gradients",
            "new-task gradient与EWC restoring gradient相互平衡。",
            `(θ−2)+2λθ=0 → θ=2/(1+2λ)=${fmt(theta)}`,
            ["new-task gradient", "EWC gradient"],
            [theta - 2, 2 * l * theta],
            "gradient",
          ),
          stage(
            "Loss tradeoff",
            "减轻旧任务偏移通常意味着牺牲部分new-task fit。",
            `Lnew=${fmt(newLoss)}; penalty=${fmt(pen)}`,
            ["new-task loss", "EWC penalty", "old-task proxy loss"],
            [newLoss, pen, old],
            "loss",
          ),
          stage(
            "Resulting parameter",
            "λ越大，本fixture的θ越靠近旧optimum。",
            `θEWC=${fmt(theta)} versus θnew-only=2`,
            ["old θ", "EWC θ", "new-only θ"],
            [0, theta, 2],
            "parameter",
          ),
        ],
        "EWC optimum θ",
        theta,
      );
    },
    {
      use: [
        "任务顺序到达、无法总是保留全部旧数据时，EWC可限制重要weights漂移。",
        "Fisher diagonal只是local approximation；任务冲突或长sequence时应比较replay、adapters与其他continual strategies。",
      ],
      tune: [
        "先记录new-only λ=0的forgetting，再扫λ并同时看old/new task metrics；旧任务掉得多才加大λ。",
        "检查Fisher估计sample数和loss scaling；所有参数都冻结似的学不动时减λ或修正F归一化。",
      ],
      debug: [
        "EWC几乎无作用",
        "检查旧θ snapshot是否被当前parameter alias覆盖",
        "deep-copy旧parameter与F，并验证penalty gradient。",
        "旧任务仍严重忘记",
        "检查Fisher估计和任务分布是否超出local neighborhood",
        "增加replay baseline或parameter isolation，别假设EWC必然有效。",
      ],
      boundary:
        "一个已知quadratic问题的closed-form optimum；old-task proxy loss不是真实accuracy，F=2是synthetic输入。",
    },
  ),
  "multi-task-learning": make(
    "multi-task-learning",
    "共享参数上的task gradients何时互相抵消？",
    "同一shared parameter vector θ=[0,0]，task gradients g1=[1,0]，g2=[−1,1]，总loss=L1+λL2。",
    control(
      "Task 2 weight λ",
      0,
      2,
      0.1,
      1,
      "从1开始；观察gradient方向而非只比较不同单位的raw losses。",
    ),
    (l) => {
      const g = [1 - l, l],
        update = g.map((x) => -0.1 * x),
        dot = -1,
        cos = -1 / Math.sqrt(2);
      return result(
        [
          stage(
            "Measure task gradients",
            "g1与g2第一坐标相反，存在local gradient conflict。",
            `g1=[1,0], g2=[−1,1]; dot=${dot}`,
            ["g1 coordinate1", "g2 coordinate1", "g2 coordinate2"],
            [1, -1, 1],
            "gradient",
          ),
          stage(
            "Weight contributions",
            "λ同时改变第二task在所有shared coordinates的影响。",
            `λg2=[${fmt(-l)},${fmt(l)}]`,
            ["weighted task2 x", "weighted task2 y"],
            [-l, l],
            "gradient",
          ),
          stage(
            "Combine",
            "λ=1时x方向抵消，但y方向仍有更新。",
            `g_total=[1−λ,λ]=[${g.map((v) => fmt(v)).join(", ")}]`,
            ["total gradient x", "total gradient y"],
            g,
            "gradient",
          ),
          stage(
            "Take shared step",
            "learning rate=.1；cosine conflict是诊断，不直接决定哪个task更重要。",
            `Δθ=−.1g; cosine(g1,g2)=${fmt(cos)}`,
            ["parameter Δx", "parameter Δy"],
            update,
            "parameter",
          ),
        ],
        "Shared gradient x",
        g[0],
      );
    },
    {
      use: [
        "任务共享部分information且label资源可互补时，Multi-task Learning可以共用encoder、保留task heads。",
        "若任务目标冲突，shared representation可能negative transfer；单任务模型是必要对照。",
      ],
      tune: [
        "先统一loss reduction并以λ=1作baseline；某task gradient远大于其他task时再调weight或用adaptive weighting。",
        "按每个task分别看validation和gradient norm；平均metric变好但关键task退化时调整共享层或task priority。",
      ],
      debug: [
        "一个task下降另一个上升",
        "检查gradient cosine、loss scale和sampling比例",
        "比较shared/private layers或gradient-balancing方法。",
        "增加task后training变慢",
        "检查batch sampler是否让原task有效updates减少",
        "对齐训练预算与每task样本数，再判断negative transfer。",
      ],
      boundary:
        "固定local gradients说明linear loss weighting；不实现论文uncertainty weighting，也不把gradient conflict等同于最终性能下降。",
    },
  ),
  "automl-hpo-nas": make(
    "automl-hpo-nas",
    "DARTS为什么能对architecture choice求gradient？",
    "一个edge有identity op(x)=2与square op(x)=4；architecture logits=[a,0]，mixed output，target=3。",
    control(
      "Architecture logit a",
      -3,
      3,
      0.25,
      0,
      "从0开始为两个op各.5；soft mixture使architecture参数可微。",
    ),
    (a) => {
      const w = softmax([a, 0]),
        y = 2 * w[0] + 4 * w[1],
        L = 0.5 * (y - 3) ** 2,
        dy = -2 * w[0] * (1 - w[0]),
        g = (y - 3) * dy,
        hard = w[0] >= w[1] ? 2 : 4;
      return result(
        [
          stage(
            "Relax discrete choices",
            "两个operation输出是声明的toy函数，不是测量的NAS benchmark。",
            `π=softmax([${fmt(a)},0])`,
            ["identity weight", "square weight"],
            w,
            "probability",
          ),
          stage(
            "Mixed operation",
            "search阶段保留weighted mixture。",
            `y=2πidentity+4πsquare=${fmt(y)}`,
            ["identity contribution", "square contribution", "mixed output"],
            [2 * w[0], 4 * w[1], y],
            "output",
          ),
          stage(
            "Architecture gradient",
            "只固定operation weights求architecture gradient，完整DARTS还需bilevel optimization。",
            `dL/da=(y−3)(−2π(1−π))=${fmt(g)}`,
            ["validation toy loss", "architecture gradient"],
            [L, g],
            "value",
          ),
          stage(
            "Discretization gap",
            "最终只选一个op，mixed optimum不一定等于discrete optimum；tie按identity。",
            `hard output=${hard}; hard loss=.5(${hard}−3)²=.5`,
            ["mixed loss", "discrete loss"],
            [L, 0.5],
            "loss",
          ),
        ],
        "Relaxed architecture loss",
        L,
      );
    },
    {
      use: [
        "要搜索network building blocks且可承担supernet训练时，可研究differentiable NAS。",
        "普通HPO先用random/Bayesian search建立baseline；NAS增加weight sharing和discretization bias。",
      ],
      tune: [
        "从小search space、独立train/validation split开始；architecture过早collapse时检查architecture learning rate与warmup。",
        "search后重新训练选中architecture，多seed验证；supernet ranking差时别只延长search预算。",
      ],
      debug: [
        "mixture很好discrete model很差",
        "检查softmax权重是否依赖多个op混合",
        "报告discretization gap并单独训练离散architecture。",
        "validation score异常好",
        "检查architecture update是否接触test data",
        "保留独立test set，并把整个search budget计入实验。",
      ],
      boundary:
        "单edge continuous relaxation与精确gradient；不是完整DARTS bilevel训练、HPO性能预测或真实architecture benchmark。",
    },
  ),
  "curriculum-self-paced": make(
    "curriculum-self-paced",
    "Self-paced threshold选择哪些examples？",
    "固定per-example losses=[.1,.4,.9,1.6]，selection v_i=1[loss_i<λ]；objective Σ(v_i loss_i−λv_i)。",
    control(
      "Pace threshold λ",
      0.2,
      2,
      0.2,
      0.8,
      "从.8开始；threshold提高允许更难的example进入当前训练。",
    ),
    (l) => {
      const losses = [0.1, 0.4, 0.9, 1.6],
        mask = losses.map((x) => Number(x < l)),
        terms = losses.map((x, i) => mask[i] * (x - l)),
        selected = sum(mask),
        weighted = sum(losses.map((x, i) => x * mask[i]));
      return result(
        [
          stage(
            "Observe current losses",
            "loss只是当前model难度信号，不保证高loss一定是有用难例。",
            `losses=[.1,.4,.9,1.6]; λ=${fmt(l)}`,
            ["example1", "example2", "example3", "example4"],
            losses,
            "loss",
          ),
          stage(
            "Choose binary weights",
            "对v∈{0,1}逐个最小化v(loss−λ)，得loss<λ时选入。",
            `v=1[loss<${fmt(l)}]=[${mask.join(",")}]`,
            ["select1", "select2", "select3", "select4"],
            mask,
            "0/1",
          ),
          stage(
            "Selected training loss",
            "这里报告sum，若改mean必须明确denominator；未选sample不贡献gradient。",
            `Σ v_i loss_i=${fmt(weighted)}; selected=${selected}`,
            ["selected loss sum", "selected count"],
            [weighted, selected],
            "value",
          ),
          stage(
            "Self-paced objective",
            "−λv鼓励随pace提高纳入更多sample；objective可为负。",
            `Σ v_i(loss_i−λ)=${fmt(sum(terms))}`,
            ["term1", "term2", "term3", "term4"],
            terms,
            "objective",
          ),
        ],
        "Selected examples",
        selected,
        "examples",
      );
    },
    {
      use: [
        "例子难度有合理顺序或noisy labels需要先学稳定模式时，可比较curriculum/self-paced策略。",
        "稀有cell type可能天然高loss，永远排除hard sample会加剧bias；需监控每class入选率。",
      ],
      tune: [
        "先与均匀sampling比较，λ从覆盖一部分easy samples开始并逐渐提高；长期只选少数时加快pace。",
        "用validation曲线和per-class coverage决定pace；高loss主要是错标时优先数据审计。",
      ],
      debug: [
        "rare class一直没被学到",
        "检查selection rate是否和class frequency相关",
        "给每class覆盖约束或混入一定uniform samples。",
        "后期纳入难例后loss暴涨",
        "检查hard examples是否是label错误或distribution shift",
        "审计sample，减小pace增量并保留robust baseline。",
      ],
      boundary:
        "固定loss下binary self-paced subproblem；不模拟loss随训练变化，也不声称easy-to-hard总优于uniform sampling。",
    },
  ),
  "test-time-adaptation": make(
    "test-time-adaptation",
    "降低test entropy为什么不等于提高accuracy？",
    "binary logit z=1，p=σ(z)，一次entropy descent；此toy直接更新z代理可适配parameter。",
    control(
      "Entropy step η",
      0,
      4,
      0.25,
      1,
      "从小η开始；检查confidence提升但没有使用任何test label。",
    ),
    (eta) => {
      const p = sigmoid(1),
        h = entropy([p, 1 - p]),
        g = -p * (1 - p),
        next = 1 - eta * g,
        p2 = sigmoid(next),
        h2 = entropy([p2, 1 - p2]);
      return result(
        [
          stage(
            "Predict unlabeled target",
            "不知道真标签，只能观测prediction与entropy。",
            `p=σ(1)=${fmt(p)}; H=${fmt(h)}`,
            ["P(class1)", "P(class0)"],
            [p, 1 - p],
            "probability",
          ),
          stage(
            "Entropy gradient",
            "binary sigmoid下dH/dz=−z p(1−p)。",
            `dH/dz=−1×p(1−p)=${fmt(g)}`,
            ["entropy gradient", "step size"],
            [g, eta],
            "value",
          ),
          stage(
            "Adapt",
            "把z向当前预测更确信的方向推；当前预测若错误也会更确信。",
            `z′=1−ηg=${fmt(next)}; p′=${fmt(p2)}`,
            ["old logit", "new logit"],
            [1, next],
            "logit",
          ),
          stage(
            "Re-evaluate entropy",
            "entropy下降是optimization结果，不是unlabeled accuracy证明。",
            `Hbefore=${fmt(h)}; Hafter=${fmt(h2)}`,
            ["before entropy", "after entropy"],
            [h, h2],
            "nats",
          ),
        ],
        "Entropy after step",
        h2,
      );
    },
    {
      use: [
        "部署target分布变化且可访问unlabeled batches时，可研究Tent-style Test-time Adaptation。",
        "Tiny batch、class imbalance和连续drift可能让entropy minimization确认错误；保留frozen baseline和reset机制。",
      ],
      tune: [
        "从小learning rate、1 adaptation step、只允许指定normalization参数开始；confidence骤升但audit下降时停用或reset。",
        "比较episodic reset与continual adaptation，按真实stream顺序评估；不要拿target labels反复优化设置再称unsupervised。",
      ],
      debug: [
        "所有sample预测同一类",
        "检查prediction marginal entropy与batch class分布",
        "停止adaptation并恢复checkpoint，调整batch构成或regularization。",
        "运行后源domain性能下降",
        "检查是否意外更新全部weights或保留跨用户state",
        "限制可训练参数，明确state生命周期。",
      ],
      boundary:
        "scalar entropy gradient代理；原Tent常调整normalization affine参数与统计，本沙盘不实现BatchNorm或证明accuracy改善。",
    },
  ),
  "semi-supervised-self-training": make(
    "semi-supervised-self-training",
    "FixMatch confidence threshold怎样改变unsupervised loss？",
    "三个unlabeled例子的weak-view置信度=[.6,.8,.95]；strong-view对对应pseudo-label的概率=[.4,.7,.8]。",
    control(
      "Pseudo-label threshold τ",
      0.5,
      0.95,
      0.05,
      0.8,
      "从.8开始；mask用weak prediction，loss用strong prediction，并除以全部3例。",
    ),
    (t) => {
      const weak = [0.6, 0.8, 0.95],
        strong = [0.4, 0.7, 0.8],
        mask = weak.map((x) => Number(x + 1e-12 >= t)),
        loss = strong.map((x) => -Math.log(x)),
        terms = loss.map((x, i) => x * mask[i]),
        L = sum(terms) / 3;
      return result(
        [
          stage(
            "Weak-view pseudo-label",
            "stop-gradient取weak prediction的argmax与confidence；本例已给出对应label的confidence。",
            `confidence=[.6,.8,.95]; τ=${fmt(t)}`,
            ["weak1", "weak2", "weak3"],
            weak,
            "probability",
          ),
          stage(
            "Apply confidence mask",
            "等于threshold的sample也通过。",
            `mask=1[confidence≥τ]=[${mask.join(",")}]`,
            ["accept1", "accept2", "accept3"],
            mask,
            "0/1",
          ),
          stage(
            "Strong-view consistency loss",
            "strong augmentation须保留任务语义；使用weak pseudo-label作target。",
            `CE_i=−log p_strong(pseudo-label)`,
            ["masked CE1", "masked CE2", "masked CE3"],
            terms,
            "nats",
          ),
          stage(
            "Batch normalization of loss",
            "FixMatch形式按全部unlabeled batch size归一，而非只除以accepted count。",
            `L_u=(${terms.map((v) => fmt(v)).join("+")})/3=${fmt(L)}`,
            ["unsupervised mean", "accepted fraction"],
            [L, sum(mask) / 3],
            "value",
          ),
        ],
        "Unsupervised batch loss",
        L,
      );
    },
    {
      use: [
        "少量labels+大量同分布unlabeled data且有合理weak/strong augmentation时，可用FixMatch。",
        "生物数据augmentation要保留cell identity或tissue语义；置信度高不代表pseudo-label正确。",
      ],
      tune: [
        "以论文常见高confidence阈值如.95为起点并监控acceptance；几乎无sample通过时检查模型warmup与校准再谨慎降低。",
        "从小unsupervised weight开始；错误pseudo-label被放大时提高threshold、修正augmentation或增加labeled supervision。",
      ],
      debug: [
        "只有多数class获得pseudo-label",
        "检查每class acceptance、label prior与confidence",
        "调整sampling或class-aware策略，并独立评估rare class。",
        "调threshold后loss比例异常",
        "检查分母是否从batch size换成accepted count",
        "固定实现约定并与unsupervised weight一起审计。",
      ],
      boundary:
        "固定weak/strong probabilities的mask与CE计算；threshold不是正确率保证，未训练模型也未模拟augmentation。",
    },
  ),
  "online-learning-drift": make(
    "online-learning-drift",
    "Drift发生后，快更新和慢更新会怎样改变prequential error？",
    "stream=[0,0,0,1,1,1]；先predict m，再观察y，再EMA update m←(1−α)m+αy，m0=0。",
    control(
      "Adaptation rate α",
      0,
      1,
      0.1,
      0.5,
      "从.5开始；必须predict-before-update，不能把刚看到的label提前用于评分。",
    ),
    (a) => {
      const ys = [0, 0, 0, 1, 1, 1],
        pred: number[] = [],
        err: number[] = [],
        after: number[] = [];
      let m = 0;
      for (const y of ys) {
        pred.push(m);
        err.push((m - y) ** 2);
        m = (1 - a) * m + a * y;
        after.push(m);
      }
      return result(
        [
          stage(
            "Incoming stream",
            "第4个sample发生declared abrupt mean shift。",
            `y=[0,0,0,1,1,1]; α=${fmt(a)}`,
            ["t1", "t2", "t3", "t4", "t5", "t6"],
            ys,
            "observation",
          ),
          stage(
            "Predict before seeing label",
            "predictions只依赖过去observations。",
            `ŷ_t=m_(t−1)`,
            [
              "prediction1",
              "prediction2",
              "prediction3",
              "prediction4",
              "prediction5",
              "prediction6",
            ],
            pred,
            "prediction",
          ),
          stage(
            "Update stream state",
            "较大α快速追踪，但有noise时会更敏感；本fixture没有noise。",
            `m_t=(1−${fmt(a)})m_(t−1)+${fmt(a)}y_t`,
            ["state1", "state2", "state3", "state4", "state5", "state6"],
            after,
            "state",
          ),
          stage(
            "Prequential scoring",
            "错误在update之前计算，包含drift刚发生时不可预知的一次误差。",
            `MSE=Σ(ŷ_t−y_t)²/6=${fmt(sum(err) / 6)}`,
            ["error1", "error2", "error3", "error4", "error5", "error6"],
            err,
            "squared error",
          ),
        ],
        "Prequential MSE",
        sum(err) / 6,
      );
    },
    {
      use: [
        "数据逐个到达且规律可能变化时，online learning需联合评估学习速度、retention和时间顺序。",
        "有标签delay或反馈偏差时要显式模拟；普通random split会掩盖真实drift。",
      ],
      tune: [
        "先用α=.1与.5比较实际time-ordered validation；drift后恢复慢可增α，noise中震荡则减α或加window。",
        "从predict-then-update协议开始，分别报告pre/post drift误差；别仅看适配完的末尾窗口。",
      ],
      debug: [
        "online指标好得离谱",
        "检查是否先update再用同个sample评分",
        "恢复prequential order，按真实label delay重放。",
        "老pattern回来时再次失败",
        "检查短memory是否忘掉seasonal regime",
        "比较replay、multi-window或context features，保留时间切分。",
      ],
      boundary:
        "EMA mean predictor是online adaptation的可算baseline；无noise的6点stream不能代表真实concept drift detection或classifier表现。",
    },
  ),
  "bayesian-optimization": make(
    "bayesian-optimization",
    "Bayesian Optimization为什么会选择mean较差但uncertainty高的candidate？",
    "固定surrogate posterior候选μ=[.7,.6,.4]、σ=[.1,.3,.6]；maximization UCB=μ+κσ。",
    control(
      "UCB exploration weight κ",
      0,
      3,
      0.25,
      1,
      "从κ=1开始；这里surrogate posterior已给定，调exploration-exploitation。",
    ),
    (k) => {
      const mu = [0.7, 0.6, 0.4],
        sd = [0.1, 0.3, 0.6],
        bonus = sd.map((x) => k * x),
        ucb = mu.map((x, i) => x + bonus[i]),
        ix = ucb.indexOf(Math.max(...ucb));
      return result(
        [
          stage(
            "Posterior beliefs",
            "μ与σ不是已测性能；只有选中点被实际实验后才能更新surrogate。",
            `μ=[.7,.6,.4]; κ=${fmt(k)}`,
            ["candidate A mean", "candidate B mean", "candidate C mean"],
            mu,
            "objective",
          ),
          stage(
            "Exploration bonus",
            "不确定性高的candidate获得更大bonus。",
            `bonus=κσ=[${bonus.map((v) => fmt(v)).join(", ")}]`,
            ["A bonus", "B bonus", "C bonus"],
            bonus,
            "objective",
          ),
          stage(
            "Acquisition",
            "UCB用于挑下一个experiment，不是最终performance estimate。",
            `a(x)=μ(x)+κσ(x)`,
            ["A UCB", "B UCB", "C UCB"],
            ucb,
            "acquisition",
          ),
          stage(
            "Select one evaluation",
            "tie取首个candidate；maximization规则与minimization需区分符号。",
            `next candidate=${["A", "B", "C"][ix]}; acquisition=${fmt(ucb[ix])}`,
            ["selected posterior mean", "selected uncertainty", "selected UCB"],
            [mu[ix], sd[ix], ucb[ix]],
            "value",
          ),
        ],
        "Candidate C UCB",
        ucb[2],
      );
    },
    {
      use: [
        "每次训练或实验昂贵且search space适中时，Bayesian Optimization能利用已有evaluation选下一点。",
        "高维、离散条件复杂或预算很小时需与random search、multi-fidelity方法比较；surrogate也可能失配。",
      ],
      tune: [
        "先做覆盖空间的initial design，再从适度κ开始；反复选相邻点而忽略未知区时增探索。",
        "noise大时记录replicates或noise model；最终best configuration应独立复训，多seed确认，不把acquisition当accuracy。",
      ],
      debug: [
        "总在边界选点",
        "检查scaling、kernel lengthscale和边界uncertainty",
        "规范化search space并审计prior，增加initial覆盖。",
        "每次推荐完全不同且不进步",
        "检查observation noise与objective方向",
        "固定maximize/minimize定义并估计noise，必要时增加replicates。",
      ],
      boundary:
        "给定posterior上的UCB acquisition计算；不拟合Gaussian Process，不是EI，也不承诺该candidate实际最优。",
    },
  ),
};
