import type { Exercise } from "./exerciseTypes";

export const mlBreadthExercises: Record<string, Exercise[]> = {
  "linear-regression-ols": [
    {
      id: "linear-regression-ols-mechanism",
      kind: "mechanism",
      question:
        "Synthetic OLS：x=[0,1,2]、y=[1,2,2]，含 intercept，slope=1/2。训练 SSE 是多少？",
      options: ["1/18", "1/6", "1/3", "0"],
      answer: 1,
      explanation:
        "Intercept=5/3−1/2=7/6；residual=[−1/6,1/3,−1/6]，SSE=1/36+1/9+1/36=1/6。1/18 是除以 N=3 后的 training MSE。",
    },
    {
      id: "linear-regression-ols-decision",
      kind: "decision",
      question:
        "两个高度相关 features 的 coefficients 随 fold 变化很大，但 predictions 很稳定。首先如何处理？",
      options: [
        "宣布最大的 coefficient 是 causal driver",
        "移除 intercept，使两个系数变稳定",
        "检查 collinearity，比较 Ridge 与 grouped validation，并避免把单个 coefficient 当 causal effect",
        "用训练 R² 选择最漂亮的一组 coefficients",
      ],
      answer: 2,
      explanation:
        "近共线 design columns 允许许多 β 组合产生相似预测。Ridge 可稳定参数，但改变了估计目标；还需检查 feature units、独立评估和解释假设。",
    },
  ],
  "naive-bayes": [
    {
      id: "naive-bayes-mechanism",
      kind: "mechanism",
      question:
        "Spam prior=.2、Ham prior=.8；两个已出现的 binary features 的 likelihood 分别为 Spam [.8,.6]、Ham [.1,.2]。NB posterior Spam 是多少？",
      options: [".096", ".6", "6/7", "1/2"],
      answer: 2,
      explanation:
        "未归一化 scores 为 .2×.8×.6=.096 和 .8×.1×.2=.016；posterior=.096/.112=6/7。该值依赖 conditional independence 与 likelihood assumptions，不是外部 calibration 的保证。",
    },
    {
      id: "naive-bayes-decision",
      kind: "decision",
      question:
        "将同一个强相关 token 特征复制多次后，NB posterior 极端自信但验证 accuracy 没改善，如何解释？",
      options: [
        "更多重复 features 提供了独立证据，所以必然可靠",
        "重复 features 会在 conditional-independence factorization 中重复计证据；检查 feature design 与 held-out calibration",
        "NB 的 posterior 从来不需要归一化",
        "只把 α 设为零，必然修复相关性",
      ],
      answer: 1,
      explanation:
        "NB 把各 feature likelihood 相乘，重复证据可能使 log odds 被重复放大。Smoothing 防止 zero likelihood，不会自动解决 conditional dependence。",
    },
  ],
  "decision-tree-splits": [
    {
      id: "decision-tree-splits-mechanism",
      kind: "mechanism",
      question:
        "x=[1,2,3,4]，y=[0,0,1,1]。用 threshold=1.5 分裂，Gini decrease 是多少？",
      options: ["1/2", "4/9", "1/6", "1/3"],
      answer: 2,
      explanation:
        "Parent Gini=.5；左叶纯、右叶 label proportions=[1/3,2/3]，Gini=4/9。Weighted child impurity=(3/4)×4/9=1/3，所以 gain=1/2−1/3=1/6。",
    },
    {
      id: "decision-tree-splits-decision",
      kind: "decision",
      question:
        "一棵深树 training accuracy=100%，但小叶节点只有一个样本，grouped validation 很差。合理下一步是什么？",
      options: [
        "只增加 max_depth",
        "把 test labels 用来挑 split",
        "提高 min_samples_leaf、限制 depth 或比较 cost-complexity pruning，并保留相同分组验证",
        "认为树模型没有 training parameters，所以只能换数据",
      ],
      answer: 2,
      explanation:
        "深树容易在小样本叶中拟合噪声；限制 leaf size/depth 或剪枝是在控制复杂度。仍需排除 group leakage 和 deployment shift，不能只靠剪枝保证泛化。",
    },
  ],
  "boosting-families": [
    {
      id: "boosting-families-mechanism",
      kind: "mechanism",
      question:
        "Binary AdaBoost：4 个样本初始 weights 均为 .25，weak learner 错 1 个。用 α=.5 ln((1−ε)/ε) 后，错误样本的 normalized weight 是多少？",
      options: [".25", ".5", ".75", "1"],
      answer: 1,
      explanation:
        "ε=.25，α=.5 ln 3。错误点乘 exp(α)=√3，正确点各乘 1/√3；归一化后错误点 .5、每个正确点 1/6。这是 classic binary AdaBoost convention，不是直接套用 multiclass SAMME。",
    },
    {
      id: "boosting-families-decision",
      kind: "decision",
      question:
        "高 cardinality category 的表格数据，同时对比 LightGBM 与 CatBoost。哪种实验设计最合理？",
      options: [
        "先对全数据 target-encode，再切分以保持映射统一",
        "固定 split 与 compute budget，分别记录 category handling、leaf/regularization 设置与 early stopping",
        "两者 num_leaves 相同就意味着模型完全相同",
        "CatBoost 使用 ordered statistics，所以任何时间泄漏都自动消失",
      ],
      answer: 1,
      explanation:
        "不同 boosting 实现的 tree growth、category handling 与 objective 设置不同。Ordered statistics 处理特定 target leakage 风险，并不能替代按时间/实体切分；验证集不能参与 target statistics。",
    },
  ],
  "dbscan-density": [
    {
      id: "dbscan-density-mechanism",
      kind: "mechanism",
      question:
        "一维 x=[0,.1,.2,.3,.4,2]，eps=.11、min_samples=3，neighborhood 包括自己。哪些点是 Core Points？",
      options: ["全部六点", "只有 .1、.2、.3", "只有 0、.4", "只有 2"],
      answer: 1,
      explanation:
        "Neighborhood counts=[2,3,3,3,2,1]，因此中间三个是 Core Points；0 和 .4 在 Core Point 的半径内，是 Border Points；2 为 Noise。",
    },
    {
      id: "dbscan-density-decision",
      kind: "decision",
      question:
        "两个真实群体密度差别很大：eps 小时稀疏群体全成 Noise，eps 大时密集群体又连接到背景。下一步怎样做？",
      options: [
        "把 Noise 一律删除，继续分析",
        "为得到指定簇数，持续增大 eps",
        "检查尺度与 metric，并比较 OPTICS/HDBSCAN 或其他密度假设；用独立证据评估稳定性",
        "把 min_samples 设为 1 能证明所有群体真实存在",
      ],
      answer: 2,
      explanation:
        "单一 eps 对应一个全局密度尺度，可能无法同时表达不同密度。替代方法也有假设与参数；不能把任何算法生成的簇数直接当作语义真值。",
    },
  ],
  "manifold-embeddings": [
    {
      id: "manifold-embeddings-mechanism",
      kind: "mechanism",
      question:
        "t-SNE 中一个点对两个 neighbors 的条件概率为 [.5,.5]，用 natural log 定义 entropy，perplexity=exp(H) 是多少？",
      options: [".5", "1", "2", "4"],
      answer: 2,
      explanation:
        "H=−2×.5 ln(.5)=ln2，因此 exp(H)=2。Perplexity 是 effective neighborhood size，不是固定包含几个 neighbors 的硬阈值，也不是目标 cluster 数。",
    },
    {
      id: "manifold-embeddings-decision",
      kind: "decision",
      question:
        "UMAP 图中 A/B 两团相距很远，但换 seed 与 min_dist 后相对距离改变。能作何解释？",
      options: [
        "远距离证明两群在原空间上具有相同比例的距离",
        "只要点不重叠，就证明没有 continuous trajectory",
        "检查原空间邻域、稳定性及外部 labels；2D 全局距离与面积不自动保留原结构",
        "把 min_dist 调到最小即可获得真实 cluster 数",
      ],
      answer: 2,
      explanation:
        "UMAP/t-SNE 优化低维结构的特定目标，显示布局受参数、sampling 与 seed 影响。应回到原 representation 检查 neighbors，并避免把可视化间隔当作效应量或因果证据。",
    },
  ],
  "anomaly-detection": [
    {
      id: "anomaly-detection-mechanism",
      kind: "mechanism",
      question:
        "1000 次检测中 anomaly prevalence=1%，TPR=.8、FPR=.05。按期望计数，告警 precision 约为多少？",
      options: ["80%", "95%", "13.9%", "50%"],
      answer: 2,
      explanation:
        "Expected TP=1000×.01×.8=8，FP=1000×.99×.05=49.5，precision=8/(8+49.5)≈13.9%。49.5 是期望，不是某次实验的整数 count。低 base rate 可使低 FPR 仍产生许多 false alarms。",
    },
    {
      id: "anomaly-detection-decision",
      kind: "decision",
      question:
        "用 mostly clean training data 拟合 LOF，未来要对未见事件打分。哪种做法正确？",
      options: [
        "使用默认 outlier-detection 模式，并把 training scores 当未来性能",
        "明确 novelty-detection protocol，使用 novelty=True 并在未见验证事件上设 threshold 和检查 drift",
        "只要 contamination=.01，线上 precision 必然为99%",
        "任何负 score 都表示事件危险",
      ],
      answer: 1,
      explanation:
        "LOF 的 novelty 模式需要在拟合时显式启用，评估要用未见数据。Contamination 与 score threshold 不是事件 posterior；须考虑 base rate、review budget 与 delayed labels。",
    },
  ],
  "probabilistic-graphical-models": [
    {
      id: "probabilistic-graphical-models-mechanism",
      kind: "mechanism",
      question:
        "Bayesian Network R→W：P(R=1)=.2、P(W=1|R=1)=.9、P(W=1|R=0)=.1。观察 W=1 后，P(R=1|W=1) 为多少？",
      options: [".9", ".18", "9/13", ".2"],
      answer: 2,
      explanation:
        "Joint weights 为 .2×.9=.18 和 .8×.1=.08，总 evidence=.26。Posterior=.18/.26=9/13。沿 arrow 反向推断是 Bayes inference，不是自动反向 causal intervention。",
    },
    {
      id: "probabilistic-graphical-models-decision",
      kind: "decision",
      question:
        "有一个定义 conditional probability 的 directed graph，团队想从中声称改动一个节点必然改变下游变量。首先需补什么？",
      options: [
        "只需运行 GNN 学 node embeddings",
        "声明并论证 causal assumptions / SCM，区分 observational factorization 与 intervention semantics",
        "把所有 posterior 取 argmax",
        "提高 variational iterations 即可自动变成 causal model",
      ],
      answer: 1,
      explanation:
        "普通 Bayesian Network 描述 joint distribution 的 factorization；因果解释需要额外结构、机制与 confounding assumptions。高 likelihood 或 inference convergence 不会赋予 causal meaning。",
    },
  ],
  "hidden-markov-models": [
    {
      id: "hidden-markov-models-mechanism",
      kind: "mechanism",
      question:
        "HMM 的四条两步路径 joint weights 为 AA=.105、AB=.081、BA=.004、BB=.0288。Viterbi path 与第二步 marginal MAP state 分别是什么？",
      options: ["AA 与 A", "BB 与 B", "AA 与 B", "AB 与 A"],
      answer: 2,
      explanation:
        "Viterbi 选择 joint weight 最大的 AA。第二步 A 的 marginal weight=.105+.004=.109，B=.081+.0288=.1098，因此 marginal MAP 是 B；这说明 joint MAP path 与逐点 marginal MAP 不相同。",
    },
    {
      id: "hidden-markov-models-decision",
      kind: "decision",
      question:
        "将来自 20 个独立 subjects 的 sequence 直接拼接训练 HMM，模型学到了 subject 末尾到另一 subject 开头的转移。如何修正？",
      options: [
        "使用 lengths/sequence boundaries，按 subject 做 validation，必要时独立设 initial-state likelihood",
        "增加 state 数就会消除伪转移",
        "用 Viterbi 替代 forward algorithm 就没有边界问题",
        "将所有 sequences 打乱时点以提高随机性",
      ],
      answer: 0,
      explanation:
        "HMM likelihood 必须在每条独立 sequence 的起点重新使用 initial distribution；拼接产生不存在的 transitions。Group split 还可防止同一主体轨迹泄漏到验证集。",
    },
  ],
  "kalman-filtering": [
    {
      id: "kalman-filtering-mechanism",
      kind: "mechanism",
      question:
        "Scalar Kalman：prior m=10、P=4，F=H=1、Q=1，observation z=12、R=4。更新后的 mean 与 variance 是多少？",
      options: ["m=11，P=2", "m=100/9，P=20/9", "m=12，P=4", "m=10.4，P=4"],
      answer: 1,
      explanation:
        "Prediction P⁻=4+1=5；K=P⁻/(P⁻+R)=5/9；m⁺=10+(5/9)×2=100/9；P⁺=(1−5/9)×5=20/9。R=20 时才会得到 m=10.4、P=4。",
    },
    {
      id: "kalman-filtering-decision",
      kind: "decision",
      question:
        "位置传感器变嘈杂，measurement noise variance 从 4 增至20。保持同一 predicted state，合理变化是什么？",
      options: [
        "Kalman gain 增大，更相信 observation",
        "Kalman gain 降低，更相信 prediction，同时更新后 uncertainty 较大",
        "必须减小 Q，直到所有 residual 为零",
        "把 R 填成 standard deviation，不改变任何其他单位",
      ],
      answer: 1,
      explanation:
        "同一 predicted variance P⁻=5 时，K 从5/9降至5/25=.2，posterior variance 从20/9升至4。Q/R 是 covariance；不能混用 standard deviation，也不能单纯以 residual 最小来校准。",
    },
  ],
  "causal-graphs-identifiability": [
    {
      id: "causal-graphs-identifiability-mechanism",
      kind: "mechanism",
      question:
        "SCM：U~Bernoulli(.5)、A=U、Y=U，没有 A→Y。Observed E[Y|A=1]−E[Y|A=0]=1；do(A=1)−do(A=0) 的 mean outcome effect 是多少？",
      options: ["1", "0", ".5", "无法从给定 SCM 计算任何值"],
      answer: 1,
      explanation:
        "Intervention 只替换 A 的 equation，Y 仍等于 U；两种 intervention 下 E[Y]=.5，effect=0。这个值来自已指定 SCM；观察数据里 A=U 导致 positivity failure，不能说该 effect 可仅由此数据非参数识别。",
    },
    {
      id: "causal-graphs-identifiability-decision",
      kind: "decision",
      question:
        "A 与 B 独立且均为 Bernoulli(.5)，C=A OR B。只纳入 C=1 的样本后，A 与 B 的关系发生什么？",
      options: [
        "仍然独立，因为分析前独立",
        "条件化 Collider 引入关联；P(B=1|A=0,C=1)=1，而 P(B=1|A=1,C=1)=.5",
        "只要样本足够多，关联就必然消失",
        "C 是所有问题中都应调整的 Confounder",
      ],
      answer: 1,
      explanation:
        "A→C←B 是 Collider。筛选 C=1 后，A=0 必须由 B=1 解释，而 A=1 时 B 仍可0/1；因此 selection 本身制造条件关联。是否调整变量依目标图和 estimand，不能按相关性排序决定。",
    },
  ],
  "learning-paradigms": [
    {
      id: "learning-paradigms-mechanism",
      kind: "mechanism",
      question:
        "一个训练过程同时使用 labelled loss=.4 与 unlabelled consistency loss=.8，λ=.5。总 loss 是多少，该流程最直接属于哪类？",
      options: [
        "1.2；Supervised Learning",
        ".8；Semi-supervised Learning",
        ".4；Reinforcement Learning",
        "1.6；Self-supervised Learning",
      ],
      answer: 1,
      explanation:
        "L=.4+.5×.8=.8；训练同时利用真实 labels 与 unlabelled inputs，是 Semi-supervised Learning。若 unlabelled term 用 masking 等任务产生，内部还可包含 Self-supervised objective；分类轴可以组合。",
    },
    {
      id: "learning-paradigms-decision",
      kind: "decision",
      question:
        "一个 LLM Agent 根据 prompt 调用固定工具，在没有 reward-driven parameter update 的条件下工作。应如何归类？",
      options: [
        "只要执行 action，就必定是在训练 RL policy",
        "Agent 是 system design；其 backbone 可经多种 learning paradigms 训练，这次工具执行不自动等于 RL training",
        "Agent 一定使用 unsupervised clustering",
        "只要 tool 返回文本，就相当于生成 ground-truth labels",
      ],
      answer: 1,
      explanation:
        "Learning paradigm 取决于训练时 feedback 与 objective；Agent 描述 observation、decision、tool、state 的系统循环。Inference-time action、人工规则与 RL training 是不同层次，不能只看外观分类。",
    },
  ],
};
