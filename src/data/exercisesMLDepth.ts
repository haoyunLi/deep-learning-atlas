import type { Exercise } from "./exerciseTypes";

export const mlDepthExercises: Record<string, Exercise[]> = {
  "variational-inference-elbo": [
    {
      id: "variational-inference-elbo-mechanism",
      kind: "mechanism",
      question:
        "Fixed generative model 的 joint weights=[.4,.1]，q=[.6,.4]。ELBO≈−.797797、log evidence≈−.693147。两者差约.104650表示什么？",
      options: [
        "KL(q‖prior)，因此把它变成0就能证明 posterior 完美",
        "KL(q‖posterior)，不等于 VAE 里通常可计算的 KL to prior",
        "Observation noise variance",
        "只要增大 Monte Carlo samples，这个 gap 必然变成0",
      ],
      answer: 1,
      explanation:
        "log p(x)−ELBO=KL(q‖p(z|x))。本例 posterior=[.8,.2]，可以枚举该 gap；一般模型不知道 log evidence。更多 samples 可减估计噪声，但不会自动改变 q 的 family 或修复优化误差。",
    },
    {
      id: "variational-inference-elbo-decision",
      kind: "decision",
      question:
        "二维 Gaussian 真实 covariance=[[1,.8],[.8,1]]，reverse-KL 最优 diagonal q 的 variance 为.36而真实 marginal variance=1。下一步优先查什么？",
      options: [
        "只把同一个 q 多抽100万次，就会恢复 variance=1",
        "把所有 observations 复制两遍",
        "比较 full-covariance/structured q 与可诊断 MCMC，检查 family restriction，并将 compute 与 model 错误分开",
        "强迫 prior KL 等于0，即可得到真实 posterior",
      ],
      answer: 2,
      explanation:
        "在该 Gaussian 例中，Mean-field optimum 本来就是 variance=.36。优化已完成仍可能低估 uncertainty。更丰富 family 可表示 correlation；MCMC 也需诊断 mixing，不能把任意 chain 当 ground truth。",
    },
  ],
  "hierarchical-partial-pooling": [
    {
      id: "hierarchical-partial-pooling-mechanism",
      kind: "mechanism",
      question:
        "固定μ=0、τ²=4、σ²=9，group mean=6、n=9。Group posterior mean 与该 group 未来一个 observation 的 variance 是多少？",
      options: ["4.8与.8", "6与1", "4.8与9.8", "0与13"],
      answer: 2,
      explanation:
        "Data weight=4/(4+9/9)=.8，posterior mean=.8×6=4.8，θ的 posterior variance=(1/4+9/9)⁻¹=.8。新 observation 还要加σ²=9，因此 variance=9.8；固定 hyperparameters 的计算未包含其估计 uncertainty。",
    },
    {
      id: "hierarchical-partial-pooling-decision",
      kind: "decision",
      question:
        "系统将部署到从未见过的新 sites。当前 random-row split 很好，但 group-held-out 表现差，怎样解释？",
      options: [
        "Random-row split 已经足够，因为所有 rows 都用同一模型",
        "新 site 可直接使用训练中最大 site 的 posterior",
        "两种 split 回答不同 prediction target；检查新 group 分布、shared assumptions 和 group-level covariates，报告 unseen-group 性能",
        "增加每个已有 site 的重复 rows 等于新增 independent sites",
      ],
      answer: 2,
      explanation:
        "已见 group 的额外 row 可以利用该 group 估计；新 group 需要 population-level 预测。Partial Pooling 不会使两个任务相同，也不能用更多 within-group repeats 代替更多独立 groups。",
    },
  ],
  "proper-scoring-rules": [
    {
      id: "proper-scoring-rules-mechanism",
      kind: "mechanism",
      question:
        "真实 Bernoulli rate r=.7，模型 A 始终报 p=.7，B 始终报 p=.9。哪项对 expected metrics 的描述正确？",
      options: [
        "两者 accuracy 都.7，Brier 分别.21与.25",
        "两者 accuracy 都.9，Brier 分别.25与.21",
        "B 更 sharp，所以 Brier 必然更低",
        "Proper Scoring 保证每个有限 test set 中 A 都胜出",
      ],
      answer: 0,
      explanation:
        "以.5为分类 threshold 时二者均预测 positive，expected accuracy=.7。Expected Brier=(p−r)²+r(1−r)，A=.21，B=.04+.21=.25。Strict Propriety 是 population expectation 结论，不是有限样本必胜。",
    },
    {
      id: "proper-scoring-rules-decision",
      kind: "decision",
      question:
        "一个 binary classifier 用 positive weight=3、negative weight=1训练 Log Loss。在 true rate=.2的 constant-feature population，最优输出是3/7。应如何使用这个输出？",
      options: [
        "直接当成原 population 的真实 posterior .2",
        "认识到 weighted objective 改变了最优概率报告；检查 sampling/weighting 并用独立 target-like 数据校准后再定 cost threshold",
        "强制 threshold=.5即可恢复原概率",
        "把3/7四舍五入为0，就完成 calibration",
      ],
      answer: 1,
      explanation:
        "最优 weighted probability=3×.2/(3×.2+.8)=3/7。Class weights 可服务分类目标，但输出语义发生改变；threshold 操作不修复 probability calibration。",
    },
  ],
  "bayes-decision-thresholds": [
    {
      id: "bayes-decision-thresholds-mechanism",
      kind: "mechanism",
      question:
        "p=.3，正确 action cost=0，FP=2、FN=8。额外 review action 固定总 cost=1。应该选什么，为什么？",
      options: [
        "Negative：.3小于.5",
        "Positive：risk=1.4，永远无需 review",
        "Review：risk=1，低于 positive 的1.4和 negative 的2.4",
        "随机选择：p 不是0或1",
      ],
      answer: 2,
      explanation:
        "Expected risks 依次为 positive=2×.7=1.4，negative=8×.3=2.4，review=1。选最小 risk。Review 固定 cost 已包含所有后续后果，是本 toy 假设；现实 review 有误差/延迟时须重新计算。",
    },
    {
      id: "bayes-decision-thresholds-decision",
      kind: "decision",
      question: "当 review capacity 只有每天20例，下面哪个政策原则最合理？",
      options: [
        "无条件 review 所有 p 在.125到.5之间的 cases，即使超过 capacity",
        "按 review 相对可执行自动 action 的 expected risk reduction 考虑 capacity，并检查概率和成本假设",
        "永远选择20个最接近.5的 cases，因为 cost matrix 不会影响 review 价值",
        "把 review cost 设为0以便总 loss 更好看",
      ],
      answer: 1,
      explanation:
        "Capacity 把逐样本独立决策变成受约束 allocation。应比较 review 到底减少多少风险，并纳入实际执行条件；高 uncertainty 与高 review 价值并不总一致。",
    },
  ],
  "quantile-regression": [
    {
      id: "quantile-regression-mechanism",
      kind: "mechanism",
      question:
        "y=[1,2,4,8]，τ=.75，无 regularization 的 constant Quantile Regression。哪些 q 使 empirical Pinball Loss 最小？",
      options: [
        "只能 q=4",
        "只能 q=8",
        "任意 q∈[4,8]，mean loss=1.0625",
        "q=3.75，因为它是 mean",
      ],
      answer: 2,
      explanation:
        "q=4的 loss sum=.75+.5+0+3=4.25，q=8也为1.75+1.5+1=4.25；区间内线性 slopes 抵消，因为 Nτ=3。Finite-sample quantile 的非唯一性不应与 continuous-population unique quantile 混淆。",
    },
    {
      id: "quantile-regression-decision",
      kind: "decision",
      question:
        "模型给出 q.1和 q.9，区间总体 test coverage=.8，但某 rare subgroup 只有.5。该怎样报告？",
      options: [
        "总体.8证明每个 sample 和 subgroup 都有80%保证",
        "同时报告 subgroup coverage、width 和样本数，检查 shift/错设；若加 Conformal 要注明其通常是 marginal guarantee",
        "只把两个 quantiles 排序就能保证 subgroup coverage",
        "将τ改成 test set 上最好看的组合后用同一 test 报告保证",
      ],
      answer: 1,
      explanation:
        "Quantile 模型只估 conditional distribution 的两个位置；finite-data fit 不会自动达到每组 coverage。修复 crossing 只修复顺序；标准 split Conformal 也不自动给出每个 subgroup 的条件 coverage。",
    },
  ],
  "label-shift-correction": [
    {
      id: "label-shift-correction-mechanism",
      kind: "mechanism",
      question:
        "Source positive prior=.2，target=.5，source posterior=.4。Label Shift 成立且 source posterior 准确时，target posterior 是多少？",
      options: [
        "1，因为.4×(.5/.2)=1",
        ".4，因为 Label Shift 不改变 P(Y|X)",
        "8/11≈.727273",
        ".5，因为 target prior=.5",
      ],
      answer: 2,
      explanation:
        "Positive weight=.4×2.5=1；negative weight=.6×(.5/.8)=.375，normalize 得到1/1.375=8/11。只乘单类 ratio 而不归一化不是 Bayes correction；Label Shift 保持的是 P(X|Y)，并非 P(Y|X)。",
    },
    {
      id: "label-shift-correction-decision",
      kind: "decision",
      question:
        "Source TPR=.51、FPR=.49；target predicted-positive rate 的测量误差约.01。估 target prior 时最该警惕什么？",
      options: [
        "TPR/FPR 都接近.5，所以 prior 估计反而最稳定",
        "π=(positive rate−FPR)/(TPR−FPR)的分母仅.02，.01频率变化可放大为.5的 prior 变化；须检查 identifiability 与 uncertainty",
        "BBSE 完全不受 classifier 识别能力影响",
        "直接把 predicted-positive rate 当 true prevalence 可消除误差",
      ],
      answer: 1,
      explanation:
        "近 singular conditional confusion matrix 使 inverse problem 高度敏感。BBSE 不要求 perfect/calibrated classifier，不等于不要求矩阵含可识别信息；还需 source 样本支持及 class-conditional stability。",
    },
  ],
};
