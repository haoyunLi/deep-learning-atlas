import {
  type CompleteLabMap,
  metric,
  line,
  matrix,
  fmt,
  mean,
  sum,
} from "./types";
import { make, control, stage, sq, range } from "./mlHelpers";
export const mlClassicalLabs: CompleteLabMap = {
  "random-forest": make(
    "random-forest",
    "多加一棵 tree，ensemble probability 怎样变化？",
    "固定9个trees对一个样本的positive probabilities=[.8,.7,.4,.6,.3,.8,.2,.9,.55]，每次纳入前M个trees。",
    control(
      "Tree count M",
      1,
      9,
      1,
      5,
      "树的预测已固定；只计算aggregation，不假装在浏览器训练森林。",
    ),
    (m) => {
      const ps = [0.8, 0.7, 0.4, 0.6, 0.3, 0.8, 0.2, 0.9, 0.55].slice(0, m),
        avg = mean(ps),
        prefix = ps.map((_, i) => mean(ps.slice(0, i + 1))),
        variance = mean(ps.map((v) => sq(v - avg)));
      return {
        stages: [
          stage(
            "读取各tree概率",
            "概率来自leaf中训练class频率；此toy直接给定。",
            "p_1:M fixed",
            ps.map((_, i) => "tree" + (i + 1)),
            ps,
            "probability",
          ),
          stage(
            "求和而非多数硬标签",
            "平均probability与threshold后的hard vote可能不同。",
            `sum=${fmt(sum(ps))}; M=${m}`,
            ["sum probabilities"],
            [sum(ps)],
            "probability sum",
          ),
          stage(
            "形成ensemble预测",
            "这里采用等权概率平均。",
            `pbar=sum/M=${fmt(avg)}`,
            ["positive", "negative"],
            [avg, 1 - avg],
            "probability",
          ),
          stage(
            "观察逐tree变化",
            "更多tree使估计更稳定并不保证每一步都提高真实accuracy。",
            "prefix mean(M)",
            ["member variance"],
            [variance],
            "variance",
            line(
              range(m).map((i) => i + 1),
              prefix,
              "trees used",
              "mean probability",
            ),
          ),
        ],
        outcomes: [
          metric("Ensemble probability", avg),
          metric("Member variance", variance),
        ],
      };
    },
    {
      use: [
        "表格数据需要非线性、feature interactions且希望少量预处理时，可作为强baseline。",
        "需要比较bagging聚合机制时，先检查单树预测和ensemble聚合契约。",
      ],
      tune: [
        "先从有限tree数观察validation/OOB曲线，再增加直到收益与时间平衡。",
        "训练好验证差时比较min_samples_leaf和max_features；树数不能修复所有过拟合。",
      ],
      fail: [
        [
          "OOB看起来很好但新donor很差",
          "检查bootstrap是否在相关cells层做，OOB仍见同donor。",
          "按独立group做外部validation。",
        ],
        [
          "增加trees仍一致犯错",
          "检查feature信息、标签偏差与domain shift。",
          "改数据/特征和验证设计，不只增tree count。",
        ],
      ],
      limit:
        "固定树输出聚合；未执行bootstrap或split学习，member variance不是置信区间。",
    },
  ),
  xgboost: make(
    "xgboost",
    "Leaf 的最优 weight 为什么受 λ 抑制？",
    "固定某叶子的gradient sum G=−4、Hessian sum H=2；另有candidate split: left(G,H)=(−3,1)，right=(−1,1)，γ=0。",
    control(
      "L2 leaf regularization λ",
      0,
      10,
      0.5,
      1,
      "采用second-order objective；H>0，未模拟tree grower。",
    ),
    (l) => {
      const w = 4 / (2 + l),
        wl = 3 / (1 + l),
        wr = 1 / (1 + l),
        gain = 0.5 * (10 / (1 + l) - 16 / (2 + l)),
        obj = -4 * w + 0.5 * (2 + l) * w * w;
      return {
        stages: [
          stage(
            "汇总一阶二阶量",
            "每叶G和H来自当前预测的loss导数。",
            "G=−4; H=2",
            ["G", "H"],
            [-4, 2],
            "derivative sum",
          ),
          stage(
            "解regularized optimum",
            "令G+(H+λ)w=0。",
            `w*=−G/(H+λ)=${fmt(w)}`,
            ["parent weight", "left weight", "right weight"],
            [w, wl, wr],
            "leaf weight",
          ),
          stage(
            "计算split gain",
            "Gain<0说明给定λ下此split不值得采用；还可减γ。",
            `gain=.5[9/(1+λ)+1/(1+λ)−16/(2+λ)]=${fmt(gain)}`,
            ["split gain", "leaf objective"],
            [gain, obj],
            "objective",
          ),
          stage(
            "应用shrinkage",
            "Learning rate η=.3是另一个参数，不等于λ。",
            "prediction increment=.3w*",
            ["full leaf weight", "η-scaled increment"],
            [w, 0.3 * w],
            "prediction",
          ),
        ],
        outcomes: [
          metric("Optimal leaf weight", w),
          metric("Split gain", gain),
        ],
      };
    },
    {
      use: [
        "表格监督任务、有非线性或缺失值时比较boosted trees baseline。",
        "需要理解regularization如何影响leaf output及split时使用此二阶算例。",
      ],
      tune: [
        "先固定max_depth/min_child_weight，比较λ=0/1/5，并验证早停曲线。",
        "Leaf weights过大时核H和sample weights；不能只用更小η掩盖错误loss尺度。",
      ],
      fail: [
        [
          "Gain与库结果不一致",
          "核λ、γ、Hessian、sample weighting和.5 convention。",
          "打印同一小leaf的G/H并对照实现。",
        ],
        [
          "训练误差迅速低而validation恶化",
          "检查tree depth、搜索budget和leakage。",
          "降低复杂度并按独立group早停。",
        ],
      ],
      limit:
        "固定G/H的局部二阶近似；真实boosting每轮会重新计算导数和tree结构。",
    },
  ),
  "matrix-factorization": make(
    "matrix-factorization",
    "Rank 增加后，一次 user–item dot product 多了什么？",
    "User vector=[1,.5,−.5]、item vector=[.2,.8,.4]、global bias=3；观察前r个latent coordinates的贡献。",
    control(
      "Latent rank r",
      1,
      3,
      1,
      2,
      "这里截取已给定coordinates，不声称训练rank更大必然更好。",
    ),
    (r) => {
      const u = [1, 0.5, -0.5].slice(0, r),
        v = [0.2, 0.8, 0.4].slice(0, r),
        parts = u.map((x, i) => x * v[i]),
        score = 3 + sum(parts),
        error = score - 3.4;
      return {
        stages: [
          stage(
            "取同维embedding",
            "同一coordinate的user/item weights相乘。",
            "u,v∈R^r",
            u.map((_, i) => "u" + (i + 1)),
            u,
            "latent coordinate",
          ),
          stage(
            "逐维贡献",
            "正负贡献取决于两个embedding坐标乘积。",
            "contribution_j=u_j v_j",
            parts.map((_, i) => "dim" + (i + 1)),
            parts,
            "rating contribution",
          ),
          stage(
            "加bias得到预测",
            "Bias与dot product分开，方便发现全局偏置。",
            `rating=3+${fmt(sum(parts))}=${fmt(score)}`,
            ["bias", "dot contribution", "prediction"],
            [3, sum(parts), score],
            "rating",
          ),
          stage(
            "核对观测与代价",
            "目标rating为3.4；只显示这一个已知pair的误差。",
            "squared error=(prediction−3.4)²",
            ["prediction", "observed"],
            [score, 3.4],
            "rating",
          ),
        ],
        outcomes: [
          metric("Predicted rating", score),
          metric("Squared error", error * error),
        ],
      };
    },
    {
      use: [
        "稀疏user–item矩阵需要低秩baseline时使用；区分explicit ratings与implicit feedback。",
        "冷启动item/user缺少交互时，应加入side features或比较two-tower。",
      ],
      tune: [
        "从小rank和L2 penalty起，按用户/时间切分验证。",
        "Train提升而held-out下降时降低rank或加强regularization，并核negative sampling。",
      ],
      fail: [
        [
          "未交互样本全当negative",
          "检查missing是否等于dislike。",
          "为implicit反馈设计sampling/weighting并声明假设。",
        ],
        [
          "离线分数高线上召回差",
          "检查candidate pool、时间泄漏和冷启动。",
          "按实际retrieval流程评价。",
        ],
      ],
      limit:
        "仅计算给定embeddings的dot product；不训练factorization，不推断各维含义。",
    },
  ),
  "learning-to-rank": make(
    "learning-to-rank",
    "一个 score 跨过另一个，NDCG 为什么突然变？",
    "三篇文档relevance=[3,0,2]，scores=[2,s,0]；使用gain=2^rel−1、discount=log₂(rank+1)。",
    control(
      "Score of irrelevant document B",
      -1,
      3,
      0.25,
      1,
      "分数平移不改变ranking；这里改变一个document相对分数。",
    ),
    (s) => {
      const scores = [2, s, 0],
        rel = [3, 0, 2],
        order = [0, 1, 2].sort((a, b) => scores[b] - scores[a] || a - b),
        gains = order.map((i) => 2 ** rel[i] - 1),
        dc = order.map((_, i) => gains[i] / Math.log2(i + 2)),
        ideal = 7 + 3 / Math.log2(3),
        ndcg = sum(dc) / ideal;
      return {
        stages: [
          stage(
            "模型给score",
            "Scores用于相对排序，不自动是probabilities。",
            "scores=[2,s,0]",
            ["A", "B", "C"],
            scores,
            "score",
          ),
          stage(
            "排序后看labels",
            "按score降序，同分按原ID。",
            `order=${order.map((i) => "ABC"[i]).join("→")}`,
            order.map((i) => "ABC"[i]),
            order.map((i) => rel[i]),
            "relevance",
          ),
          stage(
            "位置折扣",
            "越靠前的位置，同一gain贡献越大。",
            "DCG=Σ(2^rel−1)/log₂(rank+1)",
            order.map((i, j) => "rank" + (j + 1) + " " + "ABC"[i]),
            dc,
            "discounted gain",
          ),
          stage(
            "按理想排序归一化",
            "IDCG对应A,C,B。NDCG是分段常数，不是score的普通光滑loss。",
            `NDCG=${fmt(sum(dc))}/${fmt(ideal)}=${fmt(ndcg)}`,
            ["NDCG"],
            [ndcg],
            "fraction",
          ),
        ],
        outcomes: [
          metric("NDCG@3", ndcg),
          metric("Irrelevant B rank", order.indexOf(1) + 1),
        ],
      };
    },
    {
      use: [
        "问题是“把更相关的候选放前面”时，使用query-level ranking评价。",
        "先保证candidate recall，再优化reranker顺序。",
      ],
      tune: [
        "固定query split、k和gain convention；按query平均指标。",
        "Top-k差时比较hard negatives与pair/listwise objective，而非只增score幅度。",
      ],
      fail: [
        [
          "训练loss下降NDCG不动",
          "检查score变动是否跨越相关document，以及loss是否匹配目标k。",
          "查看query级错排pair并对齐目标。",
        ],
        [
          "候选里根本没有正确文档",
          "检查retrieval recall upper bound。",
          "改召回，reranker不能创造缺失候选。",
        ],
      ],
      limit:
        "固定三个labels计算evaluation；不执行LambdaMART优化，也不以NDCG当可直接反传的光滑函数。",
    },
  ),
  "survival-analysis": make(
    "survival-analysis",
    "风险集里的 event 会怎样乘到 Survival Curve？",
    "两个event times：t1风险集10、events2；t2风险集6、events d。其余离开风险集的观测视为在t2前censoring。",
    control(
      "Events at second time d",
      1,
      4,
      1,
      2,
      "d不能超过risk set；censoring不计作event。",
    ),
    (d) => {
      const factors = [0.8, 1 - d / 6],
        s1 = 0.8,
        s2 = 0.8 * (1 - d / 6),
        naive = 1 - (2 + d) / 10;
      return {
        stages: [
          stage(
            "逐时刻risk sets",
            "在该时刻之前尚在观察且未event者进入risk set。",
            "n=[10,6]; d=[2,d]",
            ["risk t1", "risk t2"],
            [10, 6],
            "people",
          ),
          stage(
            "Conditional survival",
            "每个event time乘上1−d_j/n_j。",
            `factors=[.8,1−${d}/6]`,
            ["factor t1", "factor t2"],
            factors,
            "probability",
          ),
          stage(
            "乘积形成KM",
            "第二时刻的probability相对起点，不只相对当前risk set。KM是阶梯函数，只在event time跳变。",
            `S(t2)=.8×${fmt(factors[1])}=${fmt(s2)}`,
            ["S0", "S1", "S2"],
            [1, s1, s2],
            "survival",
            line(
              [0, 1, 1, 2, 2],
              [1, 1, s1, s1, s2],
              "event-time index",
              "KM survival",
            ),
          ),
          stage(
            "比较错误分母",
            "把所有events除以初始N忽略不同随访。",
            "naive=1−total events/10",
            ["KM survival", "naive fraction"],
            [s2, naive],
            "survival",
          ),
        ],
        outcomes: [
          metric("KM survival after t2", s2),
          metric("Naive survival fraction", naive),
        ],
      };
    },
    {
      use: [
        "不同个体随访长度不同且有right censoring时，用risk-set方法。",
        "需要covariate effects时比较Cox/DeepSurv，并检验其额外假设。",
      ],
      tune: [
        "先核time origin、event编码和censoring时间，再设置模型。",
        "Cox proportional-hazards偏离时比较time interactions/stratification，别直接换更深网络。",
      ],
      fail: [
        [
          "将失访都编码成未发生",
          "检查结局和随访记录。",
          "保留event indicator与观察截止时间。",
        ],
        [
          "把hazard ratio当risk ratio",
          "核预测量与时间窗口。",
          "分别计算绝对survival/risk并说明baseline hazard。",
        ],
      ],
      limit: "两个时刻的KM算术；独立/非信息censoring等假设不能由图验证。",
    },
  ),
  "causal-treatment-effects": make(
    "causal-treatment-effects",
    "极端 propensity 为什么让一个样本主导 IPW？",
    "四个synthetic observations：A=[1,1,0,0]、Y=[1,0,1,0]；propensity=[e,.5,.5,.5]。计算Horvitz–Thompson ATE。",
    control(
      "First treated propensity e",
      0.1,
      0.9,
      0.05,
      0.5,
      "Propensity是P(A=1|X)，不是outcome probability。",
    ),
    (e) => {
      const a = [1, 1, 0, 0],
        y = [1, 0, 1, 0],
        ps = [e, 0.5, 0.5, 0.5],
        weights = a.map((v, i) => (v ? 1 / ps[i] : 1 / (1 - ps[i]))),
        terms = a.map((v, i) => (v ? 1 : -1) * weights[i] * y[i]),
        ate = mean(terms),
        ess = sq(sum(weights)) / sum(weights.map(sq));
      return {
        stages: [
          stage(
            "检查treatment support",
            "极小e表示该treated observation在自身covariates下稀少。",
            "propensities=[e,.5,.5,.5]",
            ["e1", "e2", "e3", "e4"],
            ps,
            "probability",
          ),
          stage(
            "反概率权重",
            "Treated用1/e，control用1/(1−e)。",
            "w=A/e+(1−A)/(1−e)",
            ["w1", "w2", "w3", "w4"],
            weights,
            "weight",
          ),
          stage(
            "逐样本贡献",
            "这个HT估计量可超出outcome范围；不是单个个体的treatment effect。",
            "term=AY/e−(1−A)Y/(1−e)",
            ["term1", "term2", "term3", "term4"],
            terms,
            "weighted outcome",
          ),
          stage(
            "平均并检查集中度",
            "ESS是weight集中程度诊断，不能检验无未测混杂。",
            `ATE=mean(terms)=${fmt(ate)}; ESS=${fmt(ess)}`,
            ["HT ATE"],
            [ate],
            "outcome difference",
          ),
        ],
        outcomes: [metric("HT ATE estimate", ate), metric("Weight ESS", ess)],
      };
    },
    {
      use: [
        "Consistency、exchangeability、positivity等可论证时，比较IPW等因果估计。",
        "先画DAG和明确estimand，不把预测准确率当causal identification。",
      ],
      tune: [
        "先看propensity overlap和weights分布，再决定stabilization/trimming。",
        "截断weights会改变bias/estimand；报告阈值敏感性及被排除人群。",
      ],
      fail: [
        [
          "估计由一个样本决定",
          "查看最大weight、ESS和treatment support。",
          "检查模型与overlap，并考虑改变target population。",
        ],
        [
          "拟合propensity AUC很高就认为很好",
          "高可区分性可能表示overlap差。",
          "优先检查balance与positivity，不追分类AUC。",
        ],
      ],
      limit:
        "小样本HT算例；给定propensities，不识别真实causal effect，也不证明无混杂。",
    },
  ),
  "optimal-transport": make(
    "optimal-transport",
    "Entropy regularization 怎样让匹配变软？",
    "2×2 cost=[[0,1],[1,0]]，source/target masses均[.5,.5]；求该对称问题的精确entropic transport。",
    control(
      "Entropy regularization ε",
      0.1,
      2,
      0.1,
      0.5,
      "ε与cost同尺度；增大ε使plan更分散，仍保持marginals。",
    ),
    (e) => {
      const k = Math.exp(-1 / e),
        diag = 0.5 / (1 + k),
        off = 0.5 - diag,
        plan = [
          [diag, off],
          [off, diag],
        ],
        cost = 2 * off,
        reg = e * plan.flat().reduce((s, p) => s + p * (Math.log(p) - 1), 0);
      return {
        stages: [
          stage(
            "Cost不等于probability",
            "Diagonal cheaper，但必须同时满足两侧mass。",
            "C=[[0,1],[1,0]]",
            ["diagonal cost", "off-diagonal cost"],
            [0, 1],
            "cost",
            matrix(
              ["source1", "source2"],
              ["target1", "target2"],
              [
                [0, 1],
                [1, 0],
              ],
              "cost",
            ),
          ),
          stage(
            "Gibbs kernel",
            "Kij=exp(−Cij/ε)，尚未满足mass constraints。",
            `koff=exp(−1/${fmt(e, 1)})=${fmt(k)}`,
            ["K diagonal", "K off"],
            [1, k],
            "kernel",
            matrix(
              ["s1", "s2"],
              ["t1", "t2"],
              [
                [1, k],
                [k, 1],
              ],
              "kernel",
            ),
          ),
          stage(
            "对称缩放满足marginals",
            "这里闭式scale=.5/(1+k)；一般问题需迭代Sinkhorn。",
            "P=.5 K/(1+k)",
            ["P11", "P12"],
            [diag, off],
            "mass",
            matrix(["s1", "s2"], ["t1", "t2"], plan, "transport mass"),
          ),
          stage(
            "拆开transport与entropy",
            "正则目标变化不等于任务质量改善；row/column sum都为.5。",
            `transport cost=${fmt(cost)}; entropy term=${fmt(reg)}`,
            ["Transport cost", "Regularized objective"],
            [cost, cost + reg],
            "objective",
          ),
        ],
        outcomes: [
          metric("Off-diagonal transport mass", 2 * off),
          metric("Unregularized cost", cost),
        ],
      };
    },
    {
      use: [
        "两组对象有mass/capacity约束且需要全局软对应时比较OT。",
        "一对一hard matching或多对一模型需要明确不同约束。",
      ],
      tune: [
        "先把cost量级统一，再比较ε相对median cost的尺度。",
        "ε过小数值下溢时采用log-domain Sinkhorn；同时监测marginal residual。",
      ],
      fail: [
        [
          "每row softmax后当成OT",
          "核column marginal是否满足。",
          "使用双侧约束solver并打印row/column sums。",
        ],
        [
          "图很集中就说assignment可信",
          "检查cost建模与真实对应证据。",
          "评估扰动、unmatched mass和标注对照。",
        ],
      ],
      limit:
        "对称2×2闭式解；未运行通用Sinkhorn，transport mass不是自动校准的identity posterior。",
    },
  ),
  "bayesian-updating": make(
    "bayesian-updating",
    "同样10次试验，successes 怎样移动 posterior？",
    "Prior=Beta(2,2)，Binomial trials n=10，观察s successes；比较prior、MLE与posterior predictive。",
    control("Success count s", 0, 10, 1, 7, "n固定10，failures=10−s。"),
    (s) => {
      const a = 2 + s,
        b = 12 - s,
        post = a / (a + b),
        v = (a * b) / (sq(a + b) * (a + b + 1));
      return {
        stages: [
          stage(
            "Prior pseudo-counts",
            "Beta形状参数不是实际观测人数；本例prior mean=.5。",
            "α=2; β=2",
            ["α prior", "β prior"],
            [2, 2],
            "shape",
          ),
          stage(
            "加入likelihood evidence",
            "Success与failure分别更新shape。",
            "αpost=2+s; βpost=2+(10−s)",
            ["successes", "failures"],
            [s, 10 - s],
            "observations",
          ),
          stage(
            "得到posterior",
            "Posterior只在该conjugate model下有此形式。",
            `Beta(${a},${b})`,
            ["α posterior", "β posterior"],
            [a, b],
            "shape",
          ),
          stage(
            "预测下一次",
            "Bernoulli posterior predictive=posterior mean，区别于点估计的plug-in不确定性。",
            "P(next success)=αpost/(αpost+βpost)",
            ["Prior mean", "MLE", "Posterior predictive"],
            [0.5, s / 10, post],
            "probability",
          ),
        ],
        outcomes: [
          metric("Posterior predictive", post),
          metric("Posterior variance", v),
        ],
      };
    },
    {
      use: [
        "可交换binary trials且需要把prior和有限evidence结合时使用。",
        "有重复donors或时间依赖时，需要扩展层级或时序模型。",
      ],
      tune: [
        "先固定prior mean与strength并做prior predictive检查。",
        "样本少时比较合理prior strengths，报告posterior sensitivity。",
      ],
      fail: [
        [
          "把所有cells当独立trials",
          "核共同donor和测量依赖。",
          "按层级建模，别只增加Binomial n。",
        ],
        [
          "posterior很窄却外部预测差",
          "检查likelihood失配和population shift。",
          "做posterior predictive与外部校准检查。",
        ],
      ],
      limit: "Beta–Binomial独立同分布toy；不自动适用于相关生物样本。",
    },
  ),
  "gaussian-processes": make(
    "gaussian-processes",
    "Length scale 决定一个点的证据传多远吗？",
    "Zero-mean GP，RBF amplitude=1，唯一观测x=0,y=1，noise variance=.1；预测latent f(1)。",
    control(
      "RBF length scale ℓ",
      0.2,
      2,
      0.1,
      0.8,
      "ℓ按输入坐标单位解释；输出variance是latent function variance。",
    ),
    (l) => {
      const k = Math.exp(-1 / (2 * l * l)),
        m = k / 1.1,
        v = 1 - (k * k) / 1.1,
        xs = range(21).map((i) => -2 + i * 0.2),
        ms = xs.map((x) => Math.exp((-x * x) / (2 * l * l)) / 1.1);
      return {
        stages: [
          stage(
            "Kernel关联",
            "相同距离在不同length scale下有不同covariance。",
            `k(0,1)=exp(−1/(2ℓ²))=${fmt(k)}`,
            ["self covariance", "cross covariance"],
            [1, k],
            "covariance",
          ),
          stage(
            "观测covariance加noise",
            "求逆的是K+σ²I，而不是仅K。",
            "Kobs=1+.1=1.1",
            ["signal variance", "noise variance"],
            [1, 0.1],
            "variance",
          ),
          stage(
            "Gaussian conditioning",
            "一维情况下mean=k/1.1，variance=1−k²/1.1。",
            `m=${fmt(m)}; v=${fmt(v)}`,
            ["prior variance", "posterior variance"],
            [1, v],
            "variance",
          ),
          stage(
            "查看mean function",
            "远离观测时回到zero prior mean；更长ℓ传播更远。",
            "m(x)=k(x,0)/(1+.1)",
            ["mean at x=1"],
            [m],
            "function value",
            line(xs, ms, "x", "posterior mean"),
          ),
        ],
        outcomes: [
          metric("Latent mean at1", m),
          metric("Latent variance at1", v),
        ],
      };
    },
    {
      use: [
        "样本不多且kernel相似性合理时，用GP做回归或Bayesian Optimization surrogate。",
        "需要uncertainty时区分latent function和noisy observation predictive variance。",
      ],
      tune: [
        "先标准化输入单位并比较kernel/length-scale prior。",
        "ℓ跑到极端时检查noise、trend和feature scaling，而非只收紧optimizer。",
      ],
      fail: [
        [
          "区间窄却偏差大",
          "检查kernel/mean function失配与超出训练支持。",
          "做held-out residual和kernel sensitivity。",
        ],
        [
          "矩阵Cholesky失败",
          "核重复点、noise和数值conditioning。",
          "增加合理jitter并记录其用途，不把jitter当观测噪声估计。",
        ],
      ],
      limit: "单观测解析GP；不是多维GP训练，区间依赖已给定kernel和noise假设。",
    },
  ),
  "mcmc-hmc": make(
    "mcmc-hmc",
    "Leapfrog step 太大会怎样改变 acceptance？",
    "目标N(0,1)，起点x=1、momentum=0，unit mass，执行一次Leapfrog后作Metropolis correction。",
    control(
      "Leapfrog step size ε",
      0.1,
      3,
      0.1,
      1,
      "这里只做一个integrator step；真实HMC还要随机momentum、多步轨迹和chain diagnostics。",
    ),
    (e) => {
      const ph = -e / 2,
        x = 1 + e * ph,
        p = ph - (e * x) / 2,
        h0 = 0.5,
        h1 = 0.5 * (x * x + p * p),
        accept = Math.min(1, Math.exp(h0 - h1));
      return {
        stages: [
          stage(
            "Hamiltonian起点",
            "Potential=x²/2，kinetic=p²/2。",
            "H0=.5",
            ["x0", "p0"],
            [1, 0],
            "state",
          ),
          stage(
            "Half momentum + position",
            "Leapfrog使用gradient U′(x)=x。",
            `p½=−ε/2=${fmt(ph)}; x′=1+εp½=${fmt(x)}`,
            ["p half", "x proposal"],
            [ph, x],
            "state",
          ),
          stage(
            "完成momentum",
            "第二次half-step使用新位置的gradient。",
            `p′=p½−εx′/2=${fmt(p)}`,
            ["potential proposal", "kinetic proposal"],
            [0.5 * x * x, 0.5 * p * p],
            "energy",
          ),
          stage(
            "Metropolis correction",
            "能量误差大时acceptance下降；高acceptance单独不证明mixing好。",
            `ΔH=${fmt(h1 - h0)}; a=min(1,exp(−ΔH))=${fmt(accept)}`,
            ["acceptance probability"],
            [accept],
            "probability",
          ),
        ],
        outcomes: [
          metric("Acceptance probability", accept),
          metric("Energy error", h1 - h0),
          metric("Proposed position", x),
        ],
      };
    },
    {
      use: [
        "Posterior可微且需要积分/不确定性时考虑HMC/NUTS。",
        "多峰、不连续或强几何病态时需要特别诊断和建模处理。",
      ],
      tune: [
        "先用warmup适配step size与mass matrix，检查divergences、ESS和R-hat。",
        "出现divergence优先检查parameterization，再比较更小step size/更高target acceptance。",
      ],
      fail: [
        [
          "Acceptance高就认为采样成功",
          "检查轨迹移动、autocorrelation和不同chains。",
          "联合ESS、R-hat与posterior geometry诊断。",
        ],
        [
          "少量divergence集中某区域",
          "检查funnel等模型几何。",
          "重新parameterize并做prior predictive检查。",
        ],
      ],
      limit:
        "固定momentum单步演示，不生成posterior samples，也不声称验证MCMC收敛。",
    },
  ),
  "importance-sampling": make(
    "importance-sampling",
    "Proposal 很少抽到重要状态，权重会怎样爆大？",
    "Binary target P(X=1)=.8；proposal Q(X=1)=q，估Etarget[X]=.8。直接计算single-draw IS estimator的population moments。",
    control(
      "Proposal probability q",
      0.1,
      0.9,
      0.05,
      0.5,
      "两状态都保留positive support；这里只算期望/方差，不随机抽样。",
    ),
    (q) => {
      const w = [0.2 / (1 - q), 0.8 / q],
        ew2 = (1 - q) * w[0] * w[0] + q * w[1] * w[1],
        variance = 0.64 / q - 0.64;
      return {
        stages: [
          stage(
            "Target与proposal",
            "Proposal改变抽样频率，不能直接当target。",
            "P1=.8; Q1=q",
            ["P(X=1)", "Q(X=1)"],
            [0.8, q],
            "probability",
          ),
          stage(
            "计算density ratio",
            "两状态的weights都要计算。",
            "w(x)=P(x)/Q(x)",
            ["w0", "w1"],
            w,
            "weight",
          ),
          stage(
            "Expectation保持不变",
            "对proposal求E[wX]，才恢复target expectation。",
            `E_Q[wX]=(1−q)×w0×0+q×w1×1=.8`,
            ["state0 contribution", "state1 contribution"],
            [0, 0.8],
            "expected value",
          ),
          stage(
            "方差与weight集中",
            "wX只有两种值：0与.8/q。ESS fraction近似1/E[w²]。",
            `Var(wX)=.64/q−.64=${fmt(variance)}`,
            ["IS single-draw variance"],
            [variance],
            "variance",
          ),
        ],
        outcomes: [
          metric("IS variance", variance),
          metric("Population ESS fraction", 1 / ew2),
        ],
      };
    },
    {
      use: [
        "能计算target/proposal ratio且proposal覆盖target support时使用IS。",
        "OPE、积分和distribution correction需要先检查support。",
      ],
      tune: [
        "让proposal多覆盖高贡献区域，比较weight tail与ESS。",
        "Weight clipping可降方差但引入bias；报告阈值敏感性。",
      ],
      fail: [
        [
          "ESS高就认为estimate可靠",
          "核target是否遗漏mode或ratio有误。",
          "联合support、独立reference与重复实验检查。",
        ],
        [
          "偶尔出现极大估计",
          "检查rare states的q是否太小。",
          "改善proposal而非仅增加少量samples。",
        ],
      ],
      limit:
        "Population moments算例；不是finite-sample ESS，也不自动验证self-normalized estimator的bias。",
    },
  ),
  "linear-regression-ols": make(
    "linear-regression-ols",
    "一个 observation 移动后，OLS line 怎样跟着转？",
    "x=[0,1,2]，y=[0,1,b]，拟合带intercept的一元OLS。",
    control(
      "Third observed outcome b",
      0,
      8,
      0.5,
      3,
      "只改一个观测，展示least-squares系数和residual变化。",
    ),
    (b) => {
      const xs = [0, 1, 2],
        ys = [0, 1, b],
        ym = mean(ys),
        cx = xs.map((x) => x - 1),
        cy = ys.map((y) => y - ym),
        sxy = sum(cx.map((x, i) => x * cy[i])),
        sxx = 2,
        slope = sxy / sxx,
        intercept = ym - slope,
        pred = xs.map((x) => intercept + slope * x),
        res = ys.map((y, i) => y - pred[i]);
      return {
        stages: [
          stage(
            "中心化数据",
            "带intercept模型的line通过样本均值点。",
            `xbar=1; ybar=${fmt(ym)}`,
            ["y1", "y2", "y3"],
            ys,
            "outcome",
          ),
          stage(
            "求cross-product",
            "Slope来自covariation除以x的变化。",
            `Sxy=${fmt(sxy)}; Sxx=2`,
            ["center product1", "center product2", "center product3"],
            cx.map((x, i) => x * cy[i]),
            "x×y",
          ),
          stage(
            "解系数",
            "β1=Sxy/Sxx，β0=ybar−β1xbar。",
            `β1=${fmt(slope)}; β0=${fmt(intercept)}`,
            ["β0", "β1"],
            [intercept, slope],
            "coefficient",
          ),
          stage(
            "检查residual",
            "Residual sum=0是带intercept的OLS正常方程结果。",
            `SSE=${fmt(sum(res.map(sq)))}`,
            ["residual1", "residual2", "residual3"],
            res,
            "outcome error",
          ),
        ],
        outcomes: [
          metric("Slope", slope),
          metric("Intercept", intercept),
          metric("Training MSE", mean(res.map(sq))),
        ],
      };
    },
    {
      use: [
        "需要透明、可检查的连续outcome baseline时先试OLS。",
        "关系明显非线性时可比较feature transforms，仍需独立验证。",
      ],
      tune: [
        "先检查residual pattern、influential observations和feature scaling。",
        "高维共线时比较Ridge/Lasso，不通过删掉不顺眼的点改善拟合。",
      ],
      fail: [
        [
          "训练拟合好但外推离谱",
          "检查预测是否超出x支持范围。",
          "限制用途并收集目标范围数据。",
        ],
        [
          "系数符号不稳定",
          "检查multicollinearity和small-n uncertainty。",
          "报告敏感性并比较regularization。",
        ],
      ],
      limit:
        "三点解析OLS，无显著性检验或causal interpretation；training MSE不等于generalization。",
    },
  ),
  "naive-bayes": make(
    "naive-bayes",
    "一个没见过的 word，为什么需要 smoothing？",
    "两个classes各有3个word tokens。Class1 counts=[3,0]，Class0=[1,2]；prior均.5，待判文档仅含word B。",
    control(
      "Additive smoothing α",
      0.1,
      3,
      0.1,
      1,
      "Multinomial NB用(count+α)/(total+αV)，V=2。",
    ),
    (a) => {
      const probs = [a / (3 + 2 * a), (2 + a) / (3 + 2 * a)],
        joint = probs.map((p) => 0.5 * p),
        post = joint[0] / sum(joint);
      return {
        stages: [
          stage(
            "原始counts",
            "Class1的B为0，未经smoothing会给任何含B文档零likelihood。",
            "B counts=[0,2]",
            ["Class1 B count", "Class0 B count"],
            [0, 2],
            "tokens",
          ),
          stage(
            "加入pseudo-count",
            "分子与分母都必须加对应smoothing。",
            `P(B|C1)=α/(3+2α); P(B|C0)=(2+α)/(3+2α)`,
            ["P(B|C1)", "P(B|C0)"],
            probs,
            "probability",
          ),
          stage(
            "乘class prior",
            "这里两class prior相同，因此比值由likelihood决定。",
            "joint=.5×likelihood",
            ["joint C1", "joint C0"],
            joint,
            "joint mass",
          ),
          stage(
            "归一化posterior",
            "使用log-space计算长文档时避免直接连乘下溢。",
            `P(C1|B)=${fmt(post)}`,
            ["posterior C1", "posterior C0"],
            [post, 1 - post],
            "probability",
          ),
        ],
        outcomes: [
          metric("Class1 posterior", post),
          metric("Class1 word likelihood", probs[0]),
        ],
      };
    },
    {
      use: [
        "高维稀疏text/count features且需要快速baseline时可试Multinomial NB。",
        "Feature distribution不同要选Gaussian/Bernoulli等相应likelihood。",
      ],
      tune: [
        "从α=1比较.1/1/3，保持vocabulary和preprocessing固定。",
        "大α过度抹平稀有word证据时看held-out NLL及每class错误。",
      ],
      fail: [
        [
          "重复相关word导致过度自信",
          "检查conditional independence是否严重失配。",
          "做calibration并比较discriminative baseline。",
        ],
        [
          "出现log(0)或全零posterior",
          "核smoothing和log-sum-exp实现。",
          "保证已声明support并用log-space归一化。",
        ],
      ],
      limit: "只计算单word文档；不把Naive independence假设视为现实保证。",
    },
  ),
  "boosting-families": make(
    "boosting-families",
    "Shrinkage 怎样决定一棵新 tree 修正多少 residual？",
    "Squared-error toy：y=[1,3,5]，initial prediction均3，新stump输出h=[−2,0,2]。",
    control(
      "Boosting learning rate η",
      0.1,
      1,
      0.1,
      0.3,
      "树h已经给定；实际每轮会重新fit当前residual/gradient。",
    ),
    (eta) => {
      const y = [1, 3, 5],
        h = [-2, 0, 2],
        pred = h.map((v) => 3 + eta * v),
        r = y.map((v, i) => v - pred[i]),
        before = 8 / 3,
        after = mean(r.map(sq));
      return {
        stages: [
          stage(
            "当前residual",
            "Squared loss的negative gradient与residual成比例。",
            "r0=y−3=[−2,0,2]",
            ["r1", "r2", "r3"],
            h,
            "outcome",
          ),
          stage(
            "新tree的拟合输出",
            "本stump恰好拟合三点residual；真实树可能受结构约束。",
            "h=[−2,0,2]",
            ["h1", "h2", "h3"],
            h,
            "tree output",
          ),
          stage(
            "加上η倍修正",
            "Boosting是累加新函数，不是把各树简单平均。",
            "Fnew=Fold+ηh",
            ["prediction1", "prediction2", "prediction3"],
            pred,
            "outcome",
          ),
          stage(
            "重新计算loss",
            "η小使本轮修正更保守；不能由此toy确定最佳真实η。",
            `MSE before=${fmt(before)}; after=${fmt(after)}`,
            ["Before MSE", "After MSE"],
            [before, after],
            "squared error",
          ),
        ],
        outcomes: [
          metric("After-step MSE", after),
          metric("Third prediction", pred[2]),
        ],
      };
    },
    {
      use: [
        "理解GBDT、XGBoost和其他boosting工具共通的加法修正思想。",
        "工具还在growth policy、categorical handling和regularization上不同，不能只比名字。",
      ],
      tune: [
        "减小η时通常要同时增加rounds并用validation早停。",
        "差模型先检查loss/target/feature泄漏，再调depth、leaf count和η。",
      ],
      fail: [
        [
          "把boosting输出除以tree数",
          "核累计函数定义和初始bias。",
          "按实现的additive prediction重算。",
        ],
        [
          "小η训练一直欠拟合",
          "检查rounds和early-stopping patience是否太少。",
          "按预算联合比较η与rounds。",
        ],
      ],
      limit:
        "给定stump的一次精确算例；不模拟LightGBM/CatBoost的各自split和categorical机制。",
    },
  ),
  "dbscan-density": make(
    "dbscan-density",
    "ε变大，core points 怎样把区域连起来？",
    "一维points=[0,.2,.4,1.4,1.6,3]，min_samples=3且包含自己；按固定index顺序扩展clusters。",
    control(
      "Neighborhood radius ε",
      0.1,
      1.5,
      0.1,
      0.3,
      "距离以输入单位计算；包含距离恰为ε的点。",
    ),
    (eps) => {
      const x = [0, 0.2, 0.4, 1.4, 1.6, 3],
        adj = x.map((a) => x.map((b) => +(Math.abs(a - b) <= eps + 1e-10))),
        ns = adj.map(sum),
        core = ns.map((n) => n >= 3),
        labels = range(6).map(() => -1);
      let cid = 0;
      for (let i = 0; i < 6; i++) {
        if (!core[i] || labels[i] >= 0) continue;
        const queue = [i];
        labels[i] = cid;
        while (queue.length) {
          const j = queue.shift()!;
          for (let k = 0; k < 6; k++)
            if (adj[j][k] && labels[k] < 0) {
              labels[k] = cid;
              if (core[k]) queue.push(k);
            }
        }
        cid++;
      }
      return {
        stages: [
          stage(
            "距离邻接",
            "邻接包含self；feature scale会直接改变ε含义。",
            "Aij=1[|xi−xj|≤ε]",
            ["x1", "x2", "x3", "x4", "x5", "x6"],
            x,
            "coordinate",
            matrix(
              x.map((_, i) => "p" + i),
              x.map((_, i) => "p" + i),
              adj,
              "neighbor",
            ),
          ),
          stage(
            "判断core",
            "至少3个neighbors（含自己）才是core。",
            "core_i=1[sum_j Aij≥3]",
            ns.map((_, i) => "p" + i),
            ns,
            "neighbors",
          ),
          stage(
            "沿core扩展",
            "Border可被分配但不继续扩展；index顺序用于解决border ties。",
            "connect through core points",
            labels.map((_, i) => "p" + i),
            labels,
            "cluster ID; −1=noise",
          ),
          stage(
            "查看cluster/noise数量",
            "更多连接可把不同密度区域合并，不自动更正确。",
            `clusters=${cid}; noise=${labels.filter((v) => v < 0).length}`,
            ["clusters", "noise points"],
            [cid, labels.filter((v) => v < 0).length],
            "count",
          ),
        ],
        outcomes: [
          metric("Cluster count", cid),
          metric("Noise count", labels.filter((v) => v < 0).length),
        ],
      };
    },
    {
      use: [
        "cluster形状非球形、存在noise且无需预先指定K时可比较DBSCAN。",
        "不同区域density相差很大时比较HDBSCAN/OPTICS并做稳定性检查。",
      ],
      tune: [
        "先按物理或统计含义确定distance/scale，再看k-distance范围。",
        "ε增大导致多个区域突然连通时检查bridge points，不直接把noise减少当改善。",
      ],
      fail: [
        [
          "全部变noise",
          "检查ε是否过小、min_samples是否过大或high-dimensional距离退化。",
          "核scale和neighbor-count分布。",
        ],
        [
          "几个cluster变一个",
          "检查ε桥接和density差异。",
          "做参数稳定性图并验证外部语义。",
        ],
      ],
      limit:
        "六点一维exact DBSCAN；border ties按顺序解决，cluster ID只是编号不具数值距离意义。",
    },
  ),
  "anomaly-detection": make(
    "anomaly-detection",
    "同一 anomaly score，threshold 会怎样改变 review workload？",
    "Scores=[.1,.2,.4,.6,.8,.9]，核验labels=[0,0,1,0,1,1]；score越大越异常。",
    control(
      "Alert threshold",
      0.1,
      0.9,
      0.1,
      0.5,
      "先固定score方向；这里不是contamination训练参数。",
    ),
    (t) => {
      const scores = [0.1, 0.2, 0.4, 0.6, 0.8, 0.9],
        truth = [0, 0, 1, 0, 1, 1],
        flags = scores.map((x) => +(x >= t - 1e-12)),
        tp = sum(flags.map((v, i) => v * truth[i])),
        fp = sum(flags.map((v, i) => v * (1 - truth[i]))),
        count = sum(flags);
      return {
        stages: [
          stage(
            "Score排序",
            "异常分数不是事件概率；必须另有核验标签评价真正危害。",
            "larger score = more unusual",
            scores.map((_, i) => "sample" + (i + 1)),
            scores,
            "score",
          ),
          stage(
            "Threshold产生alerts",
            "改变阈值影响workload，而不改变ranking。",
            `alert=1[score≥${fmt(t, 1)}]`,
            flags.map((_, i) => "sample" + (i + 1)),
            flags,
            "alert",
          ),
          stage(
            "核验alerts",
            "有些罕见样本无害；有些真实异常分数不高。",
            "TP=Σalert×truth; FP=Σalert×(1−truth)",
            ["TP", "FP", "missed anomalies"],
            [tp, fp, 3 - tp],
            "samples",
          ),
          stage(
            "对照capacity",
            "本例每个alert都占一次review，不假定review无限。",
            `alerts=${count}; recall=${fmt(tp / 3)}`,
            ["Recall", "False positive rate"],
            [tp / 3, fp / 3],
            "fraction",
          ),
        ],
        outcomes: [
          metric("Alerts requiring review", count),
          metric("Anomaly recall", tp / 3),
        ],
      };
    },
    {
      use: [
        "需要发现不常见或训练分布外样本时，先定义outlier/novelty与业务异常区别。",
        "正常训练集可信时可比较novelty detector；污染训练集需单独处理。",
      ],
      tune: [
        "用固定review budget选择验证threshold，并报告已核验positive率。",
        "Contamination只影响训练或阈值规则，不是已知真实异常率。",
      ],
      fail: [
        [
          "稀有group全部被报异常",
          "检查scale、group base rate和training coverage。",
          "分层验证，避免把正常minority当错误。",
        ],
        [
          "线上alert数量暴增",
          "检查input shift、score方向和preprocessing版本。",
          "先冻结pipeline定位变化，再决定是否recalibrate。",
        ],
      ],
      limit:
        "给定scores与labels，未拟合Isolation Forest/LOF；threshold实验不证明某detector性能。",
    },
  ),
  "hierarchical-partial-pooling": make(
    "hierarchical-partial-pooling",
    "小 group 的均值应借多少 population 信息？",
    "Normal–Normal model：population mean0、between-group variance4、within variance9，group observed mean6。",
    control(
      "Group sample size n",
      1,
      20,
      1,
      3,
      "Hyperparameters固定；样本量越大该group的likelihood precision越高。",
    ),
    (n) => {
      const pp = 0.25,
        lp = n / 9,
        varpost = 1 / (pp + lp),
        w = lp / (pp + lp),
        m = 6 * w;
      return {
        stages: [
          stage(
            "Likelihood均值的不确定性",
            "Independent observations下sample mean variance=9/n。",
            "Var(ybar)=σ²/n",
            ["prior variance", "mean sampling variance"],
            [4, 9 / n],
            "variance",
          ),
          stage(
            "加precision",
            "Precision是variance的倒数，不直接平均variances。",
            "posterior precision=1/4+n/9",
            ["prior precision", "data precision"],
            [pp, lp],
            "precision",
          ),
          stage(
            "解posterior",
            "Posterior mean是按precision加权的平均。",
            `w=${fmt(w)}; μpost=w×6=${fmt(m)}`,
            ["population weight", "group weight"],
            [1 - w, w],
            "weight",
          ),
          stage(
            "比较pooling策略",
            "No pooling=6，complete pooling=0，partial在两者之间。",
            "μpost=(0/4+6n/9)/(1/4+n/9)",
            ["Complete pool", "Partial pool", "No pool"],
            [0, m, 6],
            "mean",
          ),
        ],
        outcomes: [
          metric("Posterior group mean", m),
          metric("Posterior group variance", varpost),
        ],
      };
    },
    {
      use: [
        "多个groups样本量不一且共享总体结构时比较partial pooling。",
        "已有group与新group预测要区分；new group仍有between-group variance。",
      ],
      tune: [
        "先做prior predictive检查，明确group定义和τ的尺度。",
        "Shrinkage过强时检查τ prior与group exchangeability，而非直接禁止pooling。",
      ],
      fail: [
        [
          "小group都被拉成一样",
          "检查between-group variance是否被低估。",
          "比较合理hyperpriors及group-level验证。",
        ],
        [
          "新增cells后认为population参数已精确",
          "核独立group数量与多样性。",
          "分开within-group和hyperparameter uncertainty。",
        ],
      ],
      limit:
        "固定hyperparameters的解析posterior；Full Bayes还要积分population参数的不确定性。",
    },
  ),
  "quantile-regression": make(
    "quantile-regression",
    "为什么上分位数需要对低估罚得更重？",
    "Outcomes=[1,2,4,8]，constant prediction q在0…9整数grid上比较Pinball Loss。",
    control(
      "Quantile τ",
      0.1,
      0.9,
      0.05,
      0.75,
      "选择最小grid minimizer；平坦区间内可能有多个同样好的q。",
    ),
    (tau) => {
      const y = [1, 2, 4, 8],
        qs = range(10),
        loss = (q: number) =>
          mean(
            y.map((v) => {
              const r = v - q;
              return r >= 0 ? tau * r : (tau - 1) * r;
            }),
          ),
        ls = qs.map(loss),
        best = Math.min(...ls),
        indices = qs.filter((_, i) => Math.abs(ls[i] - best) < 1e-10),
        q = indices[0],
        r = y.map((v) => v - q),
        terms = r.map((v) => (v >= 0 ? tau * v : (tau - 1) * v));
      return {
        stages: [
          stage(
            "正负residual的不同代价",
            "正residual表示低估，斜率为τ；负residual对应1−τ。",
            "ρτ(r)=τr if r≥0 else (τ−1)r",
            ["Underestimate slope", "Overestimate magnitude"],
            [tau, 1 - tau],
            "loss slope",
          ),
          stage(
            "对所有q计算objective",
            "均值loss的最低点可能是区间，不一定唯一。",
            "L(q)=mean ρτ(y−q)",
            ["minimum loss"],
            [best],
            "loss",
            line(qs, ls, "prediction q", "mean pinball loss"),
          ),
          stage(
            "查看选中q的逐样本项",
            "选取最小grid minimizer只是tie rule，不代表唯一true quantile。",
            `q=${q}; grid minimizers=${indices.join(",")}`,
            terms.map((_, i) => "sample" + (i + 1)),
            terms,
            "pinball loss",
          ),
          stage(
            "与mean目标区分",
            "Mean minimizes squared error，τ quantile minimizes expected pinball。",
            "mean(y)=3.75",
            ["Quantile grid optimum", "Sample mean"],
            [q, 3.75],
            "outcome",
          ),
        ],
        outcomes: [
          metric("Smallest grid minimizer", q),
          metric("Minimum mean pinball", best),
          metric("Grid minimizer count", indices.length),
        ],
      };
    },
    {
      use: [
        "需要median、tail forecast或asymmetric under/overprediction成本时使用。",
        "预测区间可由两个quantiles构造，但coverage要独立验证。",
      ],
      tune: [
        "先固定τ对应的业务目标，例如.1/.5/.9，并报告每个quantile误差。",
        "出现quantile crossing时考虑联合约束/rearrangement，仍要检验conditional coverage。",
      ],
      fail: [
        [
          "把quantile区间当参数置信区间",
          "检查区间表示未来Y还是模型参数。",
          "明确prediction interval和estimation uncertainty。",
        ],
        [
          "同一τ有多个最优q",
          "检查有限样本CDF跳跃和平坦loss区间。",
          "报告tie convention，不把数值差别误判成算法错误。",
        ],
      ],
      limit:
        "Constant model和有限grid的精确loss；非训练feature-dependent QuantileRegressor，也不保证finite-sample coverage。",
    },
  ),
};
