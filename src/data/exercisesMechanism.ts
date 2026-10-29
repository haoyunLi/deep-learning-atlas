import type { Exercise } from "./exerciseTypes";

export const mechanismExercises: Record<string, Exercise[]> = {
  "bayesian-updating": [
    {
      id: "bayesian-updating-mechanism",
      kind: "mechanism",
      question:
        "Beta(2,2) prior 下观察 6 successes、2 failures，posterior 与下一 trial success probability 是什么？",
      options: [
        "Beta(6,2)，0.75",
        "Beta(8,4)，2/3",
        "Beta(4,8)，1/3",
        "Beta(2,2)，0.5",
      ],
      answer: 1,
      explanation:
        "两个成功指数与六次success相加，两个失败参数与两次failure相加，得到Beta(8,4)。Posterior predictive success probability为posterior mean=8/12。",
    },
    {
      id: "bayesian-updating-decision",
      kind: "decision",
      question:
        "同一 donor 的 1,000 个 related cells 都有 binary outcome，如何设置 Bayesian observation model？",
      options: [
        "把 n=1,000 当作 1,000 independent donors",
        "只增大 prior concentration 就能消除相关性",
        "保留 donor/group structure，检查条件独立假设，必要时用 hierarchical likelihood",
        "重复更新同一批 cells 可进一步提高证据",
      ],
      answer: 2,
      explanation:
        "Trial count和independent donor count不是同一层级。Beta–Binomial简例假设给定同一θ后trials独立；相关性或group heterogeneity需要匹配的模型，重复用数据会制造虚假精度。",
    },
  ],
  "gaussian-processes": [
    {
      id: "gaussian-processes-mechanism",
      kind: "mechanism",
      question:
        "单训练点 y=2、K=1、noise variance=1，test prior variance=1、cross covariance=0.5。Latent predictive mean/variance 是？",
      options: [
        "mean=1，variance=1",
        "mean=0.5，variance=0.875",
        "mean=0.5，variance=1.875",
        "mean=2，variance=0",
      ],
      answer: 1,
      explanation:
        "K_y=2，μ*=0.5×2/2=0.5；latent variance=1−0.5²/2=0.875。若预测同noise的未来observation，再加1得到1.875。",
    },
    {
      id: "gaussian-processes-decision",
      kind: "decision",
      question:
        "GP 在新 tissue 区域给出很窄 interval，但 residual 有强结构，下一步应怎样？",
      options: [
        "把低 variance 直接当无模型错误的证据",
        "只提高 jitter 让区间更稳定",
        "核查 kernel、observation model 与 shift，并在合适 holdout 上检查 coverage",
        "删去全部异常点后仅展示剩余区间",
      ],
      answer: 2,
      explanation:
        "Posterior variance以kernel与noise假设为条件；它不会自动包含所有misspecification。Jitter处理数值稳定，无法修复不合适的scientific model。",
    },
  ],
  "bayesian-optimization": [
    {
      id: "bayesian-optimization-mechanism",
      kind: "mechanism",
      question:
        "Minimization 时 best=0.50。A: μ=0.55、σ=0.20、EI≈0.0573；B: μ=0.48、σ=0.01、EI≈0.0201。按 EI 应选哪个？",
      options: [
        "A；较大的 uncertainty 带来较大 expected improvement",
        "B；永远只比较 posterior mean",
        "两者都不应再评估，因为预测已经是真实结果",
        "A；它下一次真实 loss 必然更低",
      ],
      answer: 0,
      explanation:
        "EI比较低于当前best的期望改善。A mean虽更差，uncertainty提供了更大的改善机会；这只是acquisition下的选择，不保证实际outcome。",
    },
    {
      id: "bayesian-optimization-decision",
      kind: "decision",
      question:
        "使用 100 轮 BO 选择 model/settings，怎样保持最终泛化评价可解释？",
      options: [
        "把 test score 当 objective，最后报告最优 test",
        "在 inner/development validation 上搜索，保留独立 outer/test 评价选择流程",
        "每轮改 folds，直到结果满意",
        "只报告成功的 evaluation，忽略失败和 cost",
      ],
      answer: 1,
      explanation:
        "自适应搜索会利用validation noise。记录固定protocol、budget和所有evaluations，在选择外部做独立评价，才能区分搜得好与泛化得好。",
    },
  ],
  "mcmc-hmc": [
    {
      id: "mcmc-hmc-mechanism",
      kind: "mechanism",
      question:
        "Standard Normal target，θ=1、r=0、ε=0.1、M=1。一次 leapfrog 的更新结果是什么？",
      options: [
        "θ=0.9、r=0",
        "θ=0.995、r=−0.09975",
        "θ=1.1、r=0.1",
        "θ=0、r=1",
      ],
      answer: 1,
      explanation:
        "Momentum半步r=−0.05；位置一步θ=1+0.1×(−0.05)=0.995；第二个momentum半步r=−0.05−0.05×0.995=−0.09975。",
    },
    {
      id: "mcmc-hmc-decision",
      kind: "decision",
      question: "运行更多 iterations 后仍有 divergences，哪些处理最合理？",
      options: [
        "删除 divergent draws 即完成修复",
        "只要 draws 多于参数数就可忽略",
        "检查参数化、尺度、prior 和 posterior geometry，再结合 sampler设置与多链诊断处理",
        "把 warmup draws 加回去提高 ESS",
      ],
      answer: 2,
      explanation:
        "Divergences可能指向未被正确探索的posterior区域。增加draws或删除标记不修复几何问题；reparameterization、合理prior/尺度与适当step-size策略需要结合检查。",
    },
  ],
  "importance-sampling": [
    {
      id: "importance-sampling-mechanism",
      kind: "mechanism",
      question:
        "Normalized weights=[0.25,0.5,0.25]，h=[0,1,2]。SNIS estimate 与 weight ESS 是多少？",
      options: ["1；约2.67", "1；3", "0.5；约2.67", "2；1"],
      answer: 0,
      explanation:
        "Weighted estimate=0+0.5+0.5=1。ESS=1/(0.25²+0.5²+0.25²)=8/3。ESS描述weight集中度，不能证明未采样tails不存在。",
    },
    {
      id: "importance-sampling-decision",
      kind: "decision",
      question: "Proposal q 在一个 target 有贡献的区域完全为 0，怎样处理？",
      options: [
        "增加相同 q 的 samples 即可自动补齐",
        "把缺失区域的 weight 设成 0",
        "改 proposal 以覆盖该区域，再正确计算 density ratio",
        "只报告现有 samples 的高 ESS 即可",
      ],
      answer: 2,
      explanation:
        "Support failure不能由更多同proposal抽样修复。q必须覆盖target integral中有贡献的区域，才有适当importance correction；现有weight诊断看不到未被采样的区域。",
    },
  ],
  "particle-filters": [
    {
      id: "particle-filters-mechanism",
      kind: "mechanism",
      question:
        "Prior particle weights=[0.5,0.5]，current likelihood=[0.1,0.9]，normalize 后 weights 与 ESS 是？",
      options: [
        "[0.5,0.5]；2",
        "[0.05,0.45]；2",
        "[0.1,0.9]；约1.22",
        "[0.9,0.1]；约1.22",
      ],
      answer: 2,
      explanation:
        "未归一化weights=[0.05,0.45]，和为0.5，因此归一化为[0.1,0.9]；ESS=1/(0.1²+0.9²)=1/0.82≈1.22。",
    },
    {
      id: "particle-filters-decision",
      kind: "decision",
      question: "Resampling 后所有 weights 都相等，能推出什么？",
      options: [
        "Particles现在代表更多独立biological observations",
        "只是weights重置，重复ancestors与path degeneracy仍可能存在",
        "已证明历史trajectory恢复准确",
        "可以不再计算新的likelihood",
      ],
      answer: 1,
      explanation:
        "Resampling重新分配现有计算预算，经常复制同一ancestor。它没有增加新data，也不保证particles独立或historical smoothing可靠。",
    },
  ],
  "neural-odes": [
    {
      id: "neural-odes-mechanism",
      kind: "mechanism",
      question: "dz/dt=−0.5z，z(0)=2。两步 Euler，h=0.5，到 t=1 得到什么？",
      options: ["2→1→0.5", "2→1.5→1.125", "2→1.75→1.5", "精确等于2exp(−0.5)"],
      answer: 1,
      explanation:
        "每步z_new=z−0.25z=0.75z，因此2→1.5→1.125。解析值≈1.213，差异来自数值离散，不能把Euler结果当精确解。",
    },
    {
      id: "neural-odes-decision",
      kind: "decision",
      question:
        "Neural ODE 从 cross-sectional cells 的 pseudotime 拟合漂亮轨迹，可以怎样解释？",
      options: [
        "已经识别真实分钟尺度的rate",
        "已经证明每个cell的真实lineage",
        "是指定pseudotime与模型假设下的轨迹；需真实time/perturbation等证据支持dynamics解释",
        "只要降低solver tolerance便变成因果结果",
      ],
      answer: 2,
      explanation:
        "Pseudotime没有自动提供物理时间单位，snapshot也通常不能唯一识别velocity field。Numerical精度与biological identifiability是不同问题。",
    },
  ],
  "hierarchical-bootstrap": [
    {
      id: "hierarchical-bootstrap-mechanism",
      kind: "mechanism",
      question:
        "Donor means A=1、B=5、C=9。一次 donor resample 是 [A,A,C]，equal-donor mean 为多少？",
      options: ["5", "3", "11/3", "15/2"],
      answer: 2,
      explanation:
        "重复抽中的A必须保留为两个抽样副本，mean=(1+1+9)/3=11/3。不能用unique donor IDs去重，否则改变bootstrap过程。",
    },
    {
      id: "hierarchical-bootstrap-decision",
      kind: "decision",
      question:
        "只有 4 位 donors，各有 10,000 cells。把 B 从 1,000 加到 100,000 能解决什么？",
      options: [
        "把independent donor n提高到100,000",
        "减少bootstrap Monte Carlo误差，但独立donors仍只有4",
        "保证95%interval在所有分布下有正确coverage",
        "自动包含model selection uncertainty",
      ],
      answer: 1,
      explanation:
        "B是重复计算次数；提高B可让bootstrap quantiles估得更稳定，无法创造population中未观察到的donors，也不会自动重新拟合或选择模型。",
    },
  ],
};
