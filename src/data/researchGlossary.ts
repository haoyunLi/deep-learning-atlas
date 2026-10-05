import type { GlossaryEntry } from "./glossary";

// Research terms link to the full lesson, where primary sources and assumptions
// are given. Definitions deliberately preserve English technical names.
export const researchGlossaryEntries: GlossaryEntry[] = [
  {
    id: "negative-binomial",
    chinese: "允许额外计数波动的分布",
    english: "Negative Binomial",
    group: "math",
    aliases: ["NB", "NB2", "负二项分布", "count distribution"],
    definition:
      "用于非负整数 counts 的分布；常用参数化为 mean μ、variance μ+μ²/θ，比 Poisson 的 variance=μ 多一个波动尺度。零值多不自动意味着必须添加 zero-inflation。例如 μ=3、θ=1 时，variance=12、P(Y=0)=0.25，且没有单独的 dropout 参数。",
    lessonIds: ["count-likelihoods", "scvi"],
  },
  {
    id: "dispersion",
    chinese: "均值之外的波动尺度",
    english: "Dispersion",
    group: "math",
    aliases: ["inverse dispersion", "overdispersion", "离散度", "过度离散"],
    definition:
      "描述 count 波动是否超过 Poisson 的 mean-variance 关系。NB 的 θ 是 inverse dispersion：θ 越大，variance 越接近 mean；有的软件用 α=1/θ，方向相反。例如固定 μ=3，θ 从 1 增到 3 时，variance 从 12 降到 6；先核对软件参数化再解释数值。",
    lessonIds: ["count-likelihoods", "scvi"],
  },
  {
    id: "pseudobulk",
    chinese: "按独立样本汇总原始计数",
    english: "Pseudobulk",
    group: "data",
    aliases: [
      "pseudo-bulk",
      "replicate cell type aggregation",
      "伪批量",
      "伪bulk",
    ],
    definition:
      "通常按 biological replicate × cell type 对 raw integer counts 求和，把大量 cells 汇成可按独立样本建模的 count matrix。它不等于 mean log expression；汇总后还需恰当的 library-size normalization 或 offsets。例如同一患者的 T cells 汇成一行，不能把这一行内每个 cell 当作独立患者。",
    lessonIds: [
      "pseudobulk-hierarchy",
      "count-likelihoods",
      "nested-group-validation",
    ],
  },
  {
    id: "pseudoreplication",
    chinese: "把重复测量误当独立样本",
    english: "Pseudoreplication",
    group: "data",
    aliases: ["pseudo-replication", "伪重复", "cell-level leakage"],
    definition:
      "把共享同一独立单位的相关测量当作独立 replicates，使样本量或评估证据显得过大。更多 cells 可以改善患者内测量，却不自动增加独立患者数。例如 100 个 patients 各测 1,000 cells，不能据此声称拥有 100,000 个独立 age labels；同一 patient 也不能跨 train/test。",
    lessonIds: [
      "pseudobulk-hierarchy",
      "nested-group-validation",
      "data-leakage",
    ],
  },
  {
    id: "independent-unit",
    chinese: "支持独立推断的样本单位",
    english: "Independent Unit",
    group: "data",
    aliases: [
      "independent replicate",
      "biological replicate",
      "独立单位",
      "独立样本",
    ],
    definition:
      "其独立性由 sampling 与 experimental design 决定，未必等于输入矩阵的一行；切分和重采样应保留相应依赖结构。Technical repeats 不自动成为新的 biological replicates。例如评估未见患者的 age prediction 时，patient 是分组单位，同患者的多个 samples 或 cells 应一起进入同一折。",
    lessonIds: [
      "cohort-design",
      "nested-group-validation",
      "pseudobulk-hierarchy",
    ],
  },
  {
    id: "identifiability",
    chinese: "观测能否区分不同解释",
    english: "Identifiability",
    group: "math",
    aliases: ["non-identifiability", "identifiable", "可识别性", "不可识别"],
    definition:
      "问不同参数或机制是否能由可观测数据分开；优化收敛或预测准确不保证答案唯一。例如 GMM 交换 component labels 后 likelihood 不变；若所有年轻患者都在 batch A、年长患者都在 batch B，仅靠这些数据无法可靠分开 age 与 batch 的解释。增加 model capacity 不能补出缺失的对照。",
    lessonIds: [
      "gaussian-mixture-model",
      "expectation-maximization",
      "scvi",
      "cohort-design",
    ],
  },
  {
    id: "estimand",
    chinese: "研究最终要估计的量",
    english: "Estimand",
    group: "data",
    aliases: ["target quantity", "target population", "目标量", "估计目标"],
    definition:
      "在选算法前说明要对哪个 population、哪个单位、什么条件估计什么量；estimator 是计算它的方法，estimate 是算出的数值。例如未见患者的 expected age MAE，与某 cell type 的平均表达差异是两个不同目标，需要不同 aggregation、labels 和验证协议；一个预测分数不能自动回答机制问题。",
    lessonIds: [
      "cohort-design",
      "model-evaluation",
      "causal-treatment-effects",
      "pseudobulk-hierarchy",
    ],
  },
  {
    id: "elastic-net",
    chinese: "混合稀疏与收缩的惩罚",
    english: "Elastic Net",
    group: "training",
    aliases: ["elasticnet", "L1 L2 mixture", "l1_ratio", "弹性网"],
    definition:
      "将 L1 的 sparse selection 与 L2 的 coefficient shrinkage 混合，用于大量且相关的特征。Penalty 不保证某个 selected probe 是 causal driver。例如 methylation age prediction 可在 inner CV 选择总惩罚与混合比；glmnet 的 alpha 表示混合比，而 scikit-learn 的 alpha 表示总惩罚强度，不能按名字直接互换。",
    lessonIds: ["elastic-net", "regularization", "nested-group-validation"],
  },
  {
    id: "assignment-entropy",
    chinese: "候选归属权重的分散程度",
    english: "Assignment Entropy",
    group: "math",
    aliases: ["assignment uncertainty", "Gibbs weights", "归属熵", "分配歧义"],
    definition:
      "用 H=−Σp log p 描述候选 assignment weights 的集中程度。Low entropy 只说明当前权重很集中，不能保证 assignment 正确或 probability 已校准。例如两候选各 0.5 时 H=log 2；对 heuristic costs 做 Softmax 得到的权重，不会因此变成生成模型中的 posterior。",
    lessonIds: [
      "spatial-assignment",
      "calibration-uncertainty",
      "expectation-maximization",
    ],
  },
  {
    id: "optimal-transport",
    chinese: "带整体约束的质量分配",
    english: "Optimal Transport",
    group: "math",
    aliases: ["OT", "transport plan", "Sinkhorn", "最优传输"],
    definition:
      "按 cost 分配 source 与 target 的 mass，求一个整体 coupling；balanced OT 规定两侧 marginal masses，不能只给每行独立做 Softmax。Entropy regularization 让 coupling 更平滑，但 transport mass 不是自动校准的 cell identity posterior。例如 bin-to-cell 任务存在缺失或未匹配对象时，应核对是否需要 partial 或 unbalanced 约束。",
    lessonIds: ["optimal-transport", "spatial-assignment"],
  },
  {
    id: "multiple-instance-learning",
    chinese: "用集合标签学习集合内异质性",
    english: "Multiple Instance Learning",
    group: "architecture",
    aliases: ["MIL", "bag-level learning", "多实例学习", "bag label"],
    definition:
      "输入一个由多个 instances 组成的 bag，而监督标签给在 bag 层；用 pooling 将不同数量的 instances 汇成预测。Bag label 不提供每个 instance 的真实标签，attention weight 也不自动表示 causal contribution。例如患者的 cells 组成 bag、age 是 patient label，应按 patient 切分，并先比较简单 mean pooling baseline。",
    lessonIds: [
      "multiple-instance-learning",
      "pseudobulk-hierarchy",
      "attention",
    ],
  },
  {
    id: "scvi",
    chinese: "从单细胞计数学习隐表示",
    english: "scVI",
    group: "representation",
    aliases: ["single-cell Variational Inference", "SCVI", "scvi-tools"],
    definition:
      "为 scRNA-seq raw count matrix 建立带 latent cell state、library-size scaling 与 batch covariates 的 generative model，用 Variational Inference 学习低维表示。Latent axis 不自动对应 biological mechanism。例如可用 NB count likelihood 做 representation baseline；把 age 或其他目标生物因素作为待去除 covariate，可能移除真正要研究的信号。",
    lessonIds: [
      "scvi",
      "autoencoder-vae",
      "count-likelihoods",
      "nested-group-validation",
    ],
  },
];
