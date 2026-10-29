export const mlDepthFigures: Record<
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
  "variational-inference-elbo": {
    question: "ELBO 离 log evidence 还差什么？",
    nodes: [
      {
        title: "Fixed joint",
        detail: "p(x,z)=[.4,.1]；q=[.6,.4]",
      },
      {
        title: "ELBO",
        detail: "Σq ln(joint/q)=−.797797",
      },
      {
        title: "Posterior gap",
        detail: "KL=.104650；ln p(x)=−.693147",
      },
    ],
    edges: ["Exact posterior=[.8,.2]", "ELBO + KL(q‖posterior) = log evidence"],
    caption:
      "Synthetic enumerable example。这里的 gap KL to posterior 与 VAE 的 KL to prior 不同；真实大模型通常不知道 exact log evidence。",
  },
  "hierarchical-partial-pooling": {
    question: "同样的 group mean，为什么收缩幅度不同？",
    nodes: [
      {
        title: "Shared prior",
        detail: "μ=0；τ²=4；σ²=9；两组 mean=6",
      },
      {
        title: "Information weight",
        detail: "n=1 → w=4/13；n=9 → w=.8",
      },
      {
        title: "Posterior mean",
        detail: "m₁=24/13≈1.846；m₉=4.8",
      },
    ],
    edges: ["Variance of group mean = σ²/n", "m = w × group mean + (1−w)μ"],
    caption:
      "Synthetic fixed-hyperparameter Normal model。Group mean uncertainty 与未来 observation noise 分开；真实 Full Bayesian 模型还需传播 hyperparameter uncertainty。",
  },
  "proper-scoring-rules": {
    question: "同样猜对70%，概率质量为什么不同？",
    nodes: [
      {
        title: "True population rate",
        detail: "Y~Bernoulli(.7)；reports=.7 / .9",
      },
      {
        title: "Expected Brier",
        detail: "p=.7 → .21；p=.9 → .25",
      },
      {
        title: "Expected Log Loss",
        detail: "p=.7 → .610864；p=.9 → .764528",
      },
    ],
    edges: [
      "Both hard predictions give accuracy=.7",
      "Larger confidence can be less truthful",
    ],
    caption:
      "Synthetic population expectation，lower loss is better。Strict Propriety 不保证每个有限 test 胜出，也不将 score 改善自动转成 subgroup calibration 或 decision utility。",
  },
  "bayes-decision-thresholds": {
    question: "何时该自动判断，何时值得 review？",
    nodes: [
      {
        title: "Probability + costs",
        detail: "p=.3；FP=2；FN=8；review=1",
      },
      {
        title: "Expected risks",
        detail: "Positive=1.4；Negative=2.4；Review=1",
      },
      {
        title: "Choose minimum risk",
        detail: "选 Review；无 Review 时选 Positive",
      },
    ],
    edges: [
      "Multiply each outcome cost by its probability",
      "Threshold=.2；reject region=(.125,.5)",
    ],
    caption:
      "Synthetic cost model；正确分类 cost=0，review 假设总 cost 固定1。实际 review 错误、delay、capacity 与概率失准会改变决策。",
  },
  "quantile-regression": {
    question: "同一个 quantile objective 可以有多个最优解吗？",
    nodes: [
      {
        title: "Outcomes + level",
        detail: "y=[1,2,4,8]；τ=.75",
      },
      {
        title: "Pinball at q=4",
        detail: "loss=[.75,.5,0,3]；mean=1.0625",
      },
      {
        title: "Flat optimum",
        detail: "所有 q∈[4,8]皆最优；q=2较差",
      },
    ],
    edges: [
      "Underprediction slope=.75；over=.25",
      "Nτ=3 → finite-sample non-uniqueness",
    ],
    caption:
      "Synthetic unregularized constant model。Quantile forecasts 不是 parameter confidence intervals；finite-sample/subgroup coverage 需要独立检查。",
  },
  "label-shift-correction": {
    question: "同一输入，类别基率变化怎样改变 posterior？",
    nodes: [
      {
        title: "Source → target prior",
        detail: "πs=.2 → πt=.5；source posterior=.4",
      },
      {
        title: "Prior-weighted classes",
        detail: "Negative=.375；Positive=1",
      },
      {
        title: "Normalize",
        detail: "Target posterior=1/1.375=8/11",
      },
    ],
    edges: ["Ratios: positive=2.5；negative=.625", "Bayes odds multiplier=4"],
    caption:
      "Synthetic Label Shift example，假设 P(X|Y)稳定且 source posterior 准确。Unlabelled prediction 频率变化不能单独证明这个假设。",
  },
};
