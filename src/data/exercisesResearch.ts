import type { Exercise } from "./exerciseTypes";

type QuizSpec = {
  mechanism: [string, string[], number, string];
  decision: [string, string[], number, string];
};

const specs: Record<string, QuizSpec> = {
  "count-likelihoods": {
    mechanism: [
      "使用 Var=μ+μ²/θ 的 NB，μ=4、θ=2。哪组 variance 与 P(count=0) 正确？",
      [
        "variance=4，P(0)=e^(−4)",
        "variance=12，P(0)=1/9",
        "variance=6，P(0)=1/3",
        "variance=12，所以必须额外加 π 才有零",
      ],
      1,
      "Variance=4+16/2=12；P_NB(0)=(2/(2+4))²=1/9。NB 本身已能产生比同 mean Poisson 更多零，不需要先假设一个额外 dropout 组件。",
    ],
    decision: [
      "RNA UMI matrix 零很多，另一个 matrix 是 methylation β。最合理的 likelihood 流程是什么？",
      [
        "都换成 ZINB，因为任何稀疏矩阵都是 counts",
        "RNA 检查 raw-count Poisson/NB 的零预测与 held-out fit；β 按连续测量另选模型",
        "把 β 乘 100 四舍五入，便得到等价 RNA counts",
        "删掉所有 zero genes 后用最复杂 likelihood",
      ],
      1,
      "Likelihood 必须对应观测单位和生成过程。许多 UMI zeros 可由 sampling/heterogeneity 解释，零多本身不是额外零机制的证据；β 是连续比例测量，乘常数不能恢复不存在的 count sampling process。",
    ],
  },
  "pseudobulk-hierarchy": {
    mechanism: [
      "Type A/B 内 mean expression 固定为 2/8。A/B 比例从 80%/20% 变成 20%/80%，bulk mean 怎样变化？",
      [
        "3.2→6.8，变化可完全来自 composition",
        "2→8，因此两类内部 expression 都变化了",
        "保持 5，因为两类均值没变",
        "必须先加深网络才能计算",
      ],
      0,
      "原 mean=0.8×2+0.2×8=3.2，新 mean=0.2×2+0.8×8=6.8。这能产生 bulk/pathway signal，却不是 within-cell-type expression 改变的证据。",
    ],
    decision: [
      "4 位 donors 各 2,000 cells。你要研究新 donor 的 pathway–age association；下一步最合理是什么？",
      [
        "随机把 cells 分成 100 个 replicates，使 n=100",
        "按 sample/donor 与 cell type 汇总，保留 donor mapping，承认独立 donors 仍只有 4",
        "按 cell row split，只要 train/test cells 不同就独立",
        "把每 donor cells 加到 20,000，便不再受 donor 数限制",
      ],
      1,
      "Cells 改善 donor 内测量，不创造新的独立 biological replicates。Aggregation key 应对应采样设计，重复 samples 仍关联同 donor；4 donors 的 age/generalization证据有限，不能通过随机 cell 分组修复。",
    ],
  },
  "nested-group-validation": {
    mechanism: [
      "Outer holdout 是 donor F，inner grouped CV 使用 A–E。Top-variance 10,000 loci 应在哪些数据上 fit？",
      [
        "先全部 A–F fit 一次，因 selector 没有用 y",
        "每个 inner training fold fit；选好流程后再在 A–E refit，F 只 transform",
        "每次把 F 加入 inner training，使 feature variance 更准",
        "只在 F fit，使 F 的 features 与它最匹配",
      ],
      1,
      "即使不读取 y，global variance selection 也用了 holdout X 的统计信息。Inductive evaluation 的 learned preprocessing 在每个 training fold 内 fit；outer F 不能参与选择，A–E refit 后才预测 F。",
    ],
    decision: [
      "所有年轻 donors 都来自 batch A，所有年长 donors 都来自 batch B。Nested Group CV 高分后可以怎样解读？",
      [
        "已证明 age effect 与 batch 无关",
        "CV 更多 folds 就能让 age 与 batch 可识别",
        "当前数据无法区分 age 与 batch 的来源；需要交叉覆盖的新样本或限制结论",
        "用 batch correction 删除 B，便自动保留 age mechanism",
      ],
      2,
      "Split discipline 可减少泄漏，却不能提供观测中不存在的对照。Age 与 batch 完全 confounded 时，模型高分或 correction都不能唯一识别其来源；新数据设计需要年龄与 batch 的交叉覆盖。",
    ],
  },
  "elastic-net": {
    mechanism: [
      "单 feature a=1、partial-residual correlation s=0.8，α=0.2、l1_ratio=0.5。Coordinate update 最接近哪一个？",
      ["0.8", "0.7", "0.636", "0.4"],
      2,
      "L1 threshold αρ=0.1，L2 denominator=1+α(1−ρ)=1.1。w=soft(0.8,0.1)/1.1=0.7/1.1≈0.636。这个数依赖本课的 loss normalization 与标准化 feature，不能直接跨软件搬用。",
    ],
    decision: [
      "Methylation age 模型对所有 holdout donors 都预测约 55 岁。哪项诊断最有信息？",
      [
        "立刻把 network 加到 20 层",
        "只选一个 55 岁 donor，证明预测准确",
        "比较 mean-age baseline，检查 penalty、nonzero weights、scale、target range 与 donor split",
        "使用 holdout labels 重新计算 scaler",
      ],
      2,
      "Strong shrinkage 可令 weights 接近零，只剩 training mean/intercept；弱 features、distribution shift、scale 或 evaluation错误也可能产生相似现象。先比较 baseline与完整pipeline诊断，不能凭同一预测值断言没有 age signal。",
    ],
  },
  scvi: {
    mechanism: [
      "6 cells×4 genes 的 count VAE 使用 K=2。一个 cell library s=10、decoder proportions=[0.1,0.2,0.3,0.4]。哪些 shapes 和 mean 正确？",
      [
        "Latent mean 6×4，decoded mean 6×2",
        "Latent mean 6×2，decoded mean 6×4；该 cell μ=[1,2,3,4]",
        "Latent mean 2×4；decoded mean 恒为 proportions",
        "K=2 表示只有两个独立 donors",
      ],
      1,
      "Encoder posterior 每 cell 有 K 个 latent dimensions，因此是 C×K=6×2；decoder 对每 cell/gene给 distribution means，是 C×G=6×4。μ=sρ=[1,2,3,4]；latent dimensions不是 biological replicate 数。",
    ],
    decision: [
      "Integration 后 UMAP batch mixing 很好，但 disease cell type 也消失了。应优先怎样处理？",
      [
        "只用 mixing 分数选模型，因为去 batch 是唯一目标",
        "把 n_latent 翻倍便证明 disease signal 恢复",
        "同时检验 biological conservation、batch–phenotype confounding、count layer与holdout donors",
        "将 UMAP颜色去掉，便完成验证",
      ],
      2,
      "Mixing 与保留 relevant biology 都是目标；batch correction 可能删去真实差异，尤其 batch 与 phenotype重合。需要检查输入、设计、capacity与独立biological evidence，UMAP外观不能独立验证这些。",
    ],
  },
  "spatial-assignment": {
    mechanism: [
      "两个 candidate cells 的 equal-prior toy joint costs 是 0.2 和 1.2。r∝exp(−cost)，正确解释是什么？",
      [
        "Responsibilities≈[0.731,0.269]，是该模型条件下的 soft assignment",
        "Responsibilities=[0.2,1.2]，不必 normalize",
        "第一个 cell 有 73.1% 概率是正确 biological type，已由算法证明",
        "这两个数就是 RL 的 long-term returns",
      ],
      0,
      "exp(−0.2)/(exp(−0.2)+exp(−1.2))=1/(1+e^(−1))≈0.731。它是定义的toy模型内 assignment posterior-like weight，不能跨 output 解释为 cell-type certainty，更不能当独立真值或 RL value。",
    ],
    decision: [
      "任务是一张固定 cell-pair cost table 的一次最小代价匹配，有明确 unmatched与capacity规则。是否应首先训练 RL？",
      [
        "应该，只要把 negative cost叫reward就一定需要RL",
        "先比较 static constrained matching；只有 transition与长期trade-off有实质作用时再评估RL",
        "应该，EM和RL都是概率所以等价",
        "不需核查registration，因为algorithm会自动修正",
      ],
      1,
      "Static costs与constraints已定义时，matching/OT等baseline直接针对问题。RL需可解释state、action、transition与return；reward名称不能创造sequential结构。Registration及output定义先于复杂algorithm。",
    ],
  },
  "optimal-transport": {
    mechanism: [
      "Transport plan 第一行=[0.366,0.134]，source mass a₁=0.5。该 row 的条件分配概率应是什么？",
      [
        "[0.366,0.134]，剩下50%自动消失",
        "[0.732,0.268]，将 transport mass除以source row mass",
        "[0.5,0.5]，所有balanced OT都均匀",
        "[1,0]，OT不允许mass splitting",
      ],
      1,
      "Balanced plan row sum为a₁。Π是mass，conditional assignment=Π₁j/a₁，因此[0.732,0.268]。OT允许soft mass splitting；row-normalized weights也不自动是calibrated biologicalcertainty。",
    ],
    decision: [
      "两张 spatial slices 的 field of view只部分重叠，balanced OT把所有sources配到了targets。优先改什么？",
      [
        "仅减小ε，让每个错误配对更尖锐",
        "提高iterationlimit即可创造真实对应",
        "检查overlap与mass假设，比较partial/unbalanced formulation并保留unmatched mass",
        "把所有nonzero plan entries称为同一个physical cell",
      ],
      2,
      "Balanced OT强制完整marginal匹配。真实场景有nonoverlap时，是问题假设不符；partial/unbalanced或合适unmatched机制可放宽它。Convergence与sharpness不能修复缺失对应区域。",
    ],
  },
  "multiple-instance-learning": {
    mechanism: [
      "一个 bag 的 embeddings为[1,0]、[0,2]，attention scores为0、log3。Pooled embedding是什么？",
      ["[0.5,1]", "[1,2]", "[0.25,1.5]", "[0,2]"],
      2,
      "Softmax scores得到[1/(1+3),3/(1+3)]=[0.25,0.75]；weighted sum为0.25[1,0]+0.75[0,2]=[0.25,1.5]。它仍输出一个bag representation，并不是两个cell-levelage labels。",
    ],
    decision: [
      "20位donors各有1,000 cells，只有donor age labels。Attention MIL的高权重cell能否直接称为‘衰老cell’？",
      [
        "能，attention weights就是cell age probability",
        "能，20,000 cells等于20,000 independent labeled donors",
        "不能；weights描述当前模型的bag aggregation，还需instance-level证据和donor holdout",
        "只要增加softmax温度，就能作因果解释",
      ],
      2,
      "监督标签与独立样本量在donor层，D=20。Attention受同bag其它instances、representation、composition与batch影响，不是cell age/class/causal-effect概率。Bag预测需要new-donor验证，cellbiology解释还需独立证据。",
    ],
  },
};

export const researchExercises: Record<string, Exercise[]> = Object.fromEntries(
  Object.entries(specs).map(([lessonId, spec]) => [
    lessonId,
    (["mechanism", "decision"] as const).map((kind) => {
      const [question, options, answer, explanation] = spec[kind];
      return {
        id: `${lessonId}-${kind}`,
        kind,
        question,
        options,
        answer,
        explanation,
      };
    }),
  ]),
);
