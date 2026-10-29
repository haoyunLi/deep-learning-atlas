export const mlBreadthFigures: Record<
  string,
  {
    question: string;
    nodes: [
      { title: string; detail: string },
      { title: string; detail: string },
      { title: string; detail: string },
    ];
    edges: [string, string];
    caption: string;
  }
> = {
  "linear-regression-ols": {
    question: "一条 fitted line 的误差怎样逐项核算？",
    nodes: [
      {
        title: "Observed pairs",
        detail: "x=[0,1,2]；y=[1,2,2]",
      },
      {
        title: "OLS fit",
        detail: "slope=.5；intercept=7/6",
      },
      {
        title: "Residual check",
        detail: "residual=[−1/6,1/3,−1/6]",
      },
    ],
    edges: ["Centered cross-product=1；x SS=2", "SSE=1/6；training MSE=1/18"],
    caption:
      "Synthetic three-point fit。训练残差可核算，但不证明线性假设、coefficient 因果含义或外推可靠性。",
  },
  "naive-bayes": {
    question: "先乘 evidence，再归一化会得到什么？",
    nodes: [
      {
        title: "Prior + likelihood",
        detail: "Spam=.2；Ham=.8；两个 binary features",
      },
      {
        title: "Joint weights",
        detail: "Spam=.096；Ham=.016",
      },
      {
        title: "Posterior",
        detail: "P(Spam|features)=6/7",
      },
    ],
    edges: [
      "Conditional independence factorization",
      "Divide by evidence=.112",
    ],
    caption:
      "Synthetic positive-feature example。重复 correlated features 可重复计证据；posterior normalization 不等于实际 calibration。",
  },
  "decision-tree-splits": {
    question: "为什么同样分出一片纯叶，gain 仍可能较小？",
    nodes: [
      {
        title: "Parent labels",
        detail: "[0,0,1,1]；Gini=.5",
      },
      {
        title: "Split at x=1.5",
        detail: "Left=[0]；Right=[0,1,1]",
      },
      {
        title: "Weighted gain",
        detail: "Child impurity=1/3；gain=1/6",
      },
    ],
    edges: ["Weights are leaf sample proportions", "Compare x=2.5 → gain=.5"],
    caption:
      "Synthetic CART example。Greedy gain 是当前 training split 的量；它不保证 globally optimal tree 或 validation improvement。",
  },
  "boosting-families": {
    question: "AdaBoost 怎样把下一轮注意力转给错误样本？",
    nodes: [
      {
        title: "Initial weights",
        detail: "4 points；w=[.25,.25,.25,.25]",
      },
      {
        title: "One error",
        detail: "ε=.25；α=.5 ln3≈.5493",
      },
      {
        title: "Reweight",
        detail: "Error=.5；each correct=1/6",
      },
    ],
    edges: ["Binary exponential-loss update", "Normalize all updated weights"],
    caption:
      "Classic binary AdaBoost convention。GBDT 拟合 loss 的 negative gradients；LightGBM/CatBoost 的实现与 categorical handling 另有设置，不能直接共用本公式。",
  },
  "dbscan-density": {
    question: "Core Point、Border Point 与 Noise 如何区分？",
    nodes: [
      {
        title: "Metric neighborhood",
        detail: "x=[0,.1,.2,.3,.4,2]；eps=.11",
      },
      {
        title: "Count including self",
        detail: "Neighbor counts=[2,3,3,3,2,1]",
      },
      {
        title: "min_samples=3",
        detail: "Core=.1,.2,.3；Border=0,.4；Noise=2",
      },
    ],
    edges: [
      "Use the same feature scale and metric",
      "Density reachability gives one cluster",
    ],
    caption:
      "Synthetic one-dimensional example。Noise 是所选密度阈值下的标签，不自动代表错误样本或危险事件。",
  },
  "manifold-embeddings": {
    question: "Perplexity 和二维图里的 cluster 数是一回事吗？",
    nodes: [
      {
        title: "Neighbor probabilities",
        detail: "p=[.5,.5]",
      },
      {
        title: "Entropy",
        detail: "H=−Σp ln p=ln2",
      },
      {
        title: "Effective neighbors",
        detail: "Perplexity=exp(H)=2",
      },
    ],
    edges: [
      "Compare p=[.9,.1] → H≈.3251",
      "New perplexity≈1.384；not cluster count",
    ],
    caption:
      "Synthetic t-SNE conditional neighborhood。UMAP 有不同的 graph/objective；二者二维全局距离、面积和间隔都不能直接当作原空间效应量。",
  },
  "anomaly-detection": {
    question: "高 TPR 为何仍可能产生大量 false alerts？",
    nodes: [
      {
        title: "Base rate",
        detail: "N=1000；prevalence=.01",
      },
      {
        title: "Expected detection",
        detail: "TPR=.8 → TP=8；FPR=.05 → FP=49.5",
      },
      {
        title: "Alert precision",
        detail: "8/(8+49.5)≈13.9%",
      },
    ],
    edges: [
      "Apply rates to 10 anomalies + 990 normal",
      "Set threshold with review cost and budget",
    ],
    caption:
      "Synthetic expected counts，所以 FP 可为小数。Detector score 不是 anomaly posterior；deployment prevalence 改变会影响 precision。",
  },
  "probabilistic-graphical-models": {
    question: "观测 W 后，如何反向推断 R？",
    nodes: [
      {
        title: "Factorization R→W",
        detail: "P(R)=.2；P(W|R)=.9；P(W|¬R)=.1",
      },
      {
        title: "Joint evidence",
        detail: "P(R,W)=.18；P(¬R,W)=.08",
      },
      {
        title: "Normalize",
        detail: "P(R|W)=.18/.26=9/13",
      },
    ],
    edges: ["Joint = prior × conditional likelihood", "Evidence P(W)=.26"],
    caption:
      "Synthetic Bayesian Network。Arrow 可表达概率 factorization；Bayes inference 的方向与 causal intervention 不可互换。",
  },
  "hidden-markov-models": {
    question: "最可能的一条路径，为何不同于单时点最可能 state？",
    nodes: [
      {
        title: "First observation u",
        detail: "Forward α₁=[.30,.04]",
      },
      {
        title: "Second observation v",
        detail: "Forward α₂=[.109,.1098]",
      },
      {
        title: "Two different outputs",
        detail: "Viterbi=AA；t₂ marginal MAP=B",
      },
    ],
    edges: [
      "Transition A then emission b(v)",
      "Sum vs max over paths answers different questions",
    ],
    caption:
      "Synthetic two-state HMM。P(u,v)=.2188；Filtering、Smoothing、Viterbi 与 EM parameter learning 是不同计算。",
  },
  "kalman-filtering": {
    question: "信任 prediction 还是 measurement，由什么决定？",
    nodes: [
      {
        title: "Predicted uncertainty",
        detail: "m⁻=10；P⁻=4+Q=5",
      },
      {
        title: "Observation z=12",
        detail: "R=4；innovation=2；K=5/9",
      },
      {
        title: "Updated estimate",
        detail: "m⁺=100/9；P⁺=20/9",
      },
    ],
    edges: ["Innovation variance S=P⁻+R=9", "m⁺=m⁻+K(z−m⁻)"],
    caption:
      "Synthetic scalar Linear-Gaussian model，F=H=1、Q=1。R 是 variance；增大 R 会减小 gain，但错误 dynamics 不会因此自动修复。",
  },
  "causal-graphs-identifiability": {
    question: "Observed association 为什么不等于 intervention effect？",
    nodes: [
      {
        title: "SCM U→A; U→Y",
        detail: "U~Bernoulli(.5)；A=U；Y=U",
      },
      {
        title: "Observed groups",
        detail: "E[Y|A=1]−E[Y|A=0]=1",
      },
      {
        title: "Intervene on A",
        detail: "Both E[Y|do(A)]=.5；effect=0",
      },
    ],
    edges: [
      "Both A and Y inherit the same U",
      "Replacing A equation does not change Y",
    ],
    caption:
      "Synthetic specified SCM。给定模型可算 effect；此观察分布存在 positivity failure，不能只靠观测表证明该因果结论。",
  },
  "learning-paradigms": {
    question: "Architecture、learning paradigm 和 Agent 是同一条分类轴吗？",
    nodes: [
      {
        title: "Feedback + target",
        detail: "Labels / masked tokens / rewards",
      },
      {
        title: "Objective examples",
        detail: "MSE=1；CE=ln4；return=.9",
      },
      {
        title: "System composition",
        detail: "One Agent may combine several objectives",
      },
    ],
    edges: [
      "Choose what observations count as supervision",
      "Backbone + tools + state + evaluation",
    ],
    caption:
      "Synthetic objectives：y=[2,4]、ŷ=[1,3]；masked-target p=.25；rewards=[0,1], γ=.9。Loss 数值单位不同，不能直接用大小评判哪种 paradigm 更好。",
  },
};
