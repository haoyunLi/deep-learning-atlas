export type ResearchStage = {
  title: string;
  message: string;
  steps: string[];
  check: string;
  lessonIds: string[];
};
export type ResearchChoice = {
  name: string;
  use: string;
  strength: string;
  cost: string;
  settings: string;
  lessonId: string;
};
export type ResearchPath = {
  id: string;
  name: string;
  question: string;
  why: string;
  gap: string;
  input: string;
  transform: string;
  output: string;
  outputBoundary: string;
  stages: ResearchStage[];
  choices: ResearchChoice[];
  challenge: {
    question: string;
    options: string[];
    answer: number;
    feedback: string;
  };
  sources: { label: string; url: string }[];
  protocol: {
    unit: string;
    target: string;
    baseline: string;
    split: string;
    metric: string;
    failure: string;
  };
};

export const researchPaths: ResearchPath[] = [
  {
    id: "spatial",
    name: "Spatial bin-to-cell",
    question:
      "如何把 spatial bins 或 transcripts 分配到候选 cells，同时保留边界处的不确定性？",
    why: "分配错误会改变 cell-level expression 和下游 annotation；因此要先确认测量对象与几何关系，再讨论模型复杂度。",
    gap: "最近 nucleus 或 polygon overlap 提供明确 baseline，但坐标误差、细胞边界不完整和表达混合会让部分对象有多个合理候选。",
    input:
      "N 个 bin/transcript 的坐标与 counts；M 个 cell/nucleus 的几何信息；可选 expression reference",
    transform: "Candidate search → score/likelihood → assignment",
    output:
      "N × M 稀疏 assignment weights，及 N 个 unmatched/ambiguity 标记；可汇总为 M × G weighted/expected expression",
    outputBoundary:
      "Assignment、cell segmentation、cell-type annotation 是三个不同输出。高权重表示模型偏好；需要独立标注验证，才能把它当作可靠的归属。Soft assignment 汇总通常是小数，并非 observed integer raw counts，不能直接沿用 raw-count likelihood 的解释。",
    stages: [
      {
        title: "坐标一致，候选才有意义",
        message:
          "先检查 pixel/µm、原点、轴方向和 registration；不同平台的对象不一定能逐一对应。",
        steps: [
          "画同一区域的 nuclei、cell boundaries 和 bin centers；用 landmarks 检查方向与尺度。",
          "保留 bin、transcript、cell、nucleus、slide、patient 的原始 ID，避免把不同层级合并。",
          "以 radius 或 polygon overlap 生成稀疏候选；为无候选对象留 unmatched 路径。",
        ],
        check: "如果 x/y 交换后算法仍有漂亮图，图的美观没有验证 registration。",
        lessonIds: ["spatial-assignment", "data-leakage", "knn"],
      },
      {
        title: "Baseline 先暴露哪里困难",
        message:
          "比较 nearest nucleus、polygon overlap 和一个明确的 geometry score；按边界、密度与组织区域分层。",
        steps: [
          "固定 candidate set，在同一批人工检查对象上比较 baseline。",
          "记录 coverage、unmatched rate、人工标注 agreement 和不同距离处的错误，不能只看汇总分数。",
          "区分 candidate recall 不够与 score 排错：真 cell 不在候选里，后续 EM 或 RL 也无法恢复。",
        ],
        check: "先看“真候选是否被纳入”，再看“算法是否选对”。",
        lessonIds: ["knn", "spatial-assignment", "calibration-uncertainty"],
      },
      {
        title: "EM 从明确的 likelihood 开始",
        message:
          "当 assignment 是 latent variable 且表达参数也要估计时，E-step 与 M-step 可以交替更新；启发式 softmax 本身并不构成 EM。",
        steps: [
          "写出 p(x,z|θ)，说明 geometry、expression 和 prior 各在何处；counts 的 likelihood 要与测量尺度匹配。",
          "E-step 计算 responsibility；M-step 用软权重更新可学习参数，保留 initialization 与多个 seed。",
          "检查 objective、空 cluster、局部 optimum 和 entropy；不要用 entropy 小替代准确率高。",
        ],
        check: "必须能回答：M-step 更新了哪个 θ？优化的完整 objective 是什么？",
        lessonIds: [
          "expectation-maximization",
          "count-likelihoods",
          "spatial-assignment",
        ],
      },
      {
        title: "只有连续决策需要未来收益",
        message:
          "若当前操作会改变后续候选、边界或预算，RL 才有可检查的 sequential formulation。静态 assignment 可以先用 matching/optimization。",
        steps: [
          "定义 state（当前边界与剩余对象）、action（一次修改）、transition 和 episode termination。",
          "用人工目标或留出标注检查 reward：同一个 reward 能否被错误的 merge/split 轻易刷高？",
          "与 greedy、EM、matching 在相同候选、信息与预算上比较；记录 reward 与独立指标是否一起改善。",
        ],
        check: "如果动作互不影响且没有延迟收益，先验证静态方法是否足够。",
        lessonIds: [
          "reinforcement-learning",
          "ppo",
          "reward-model",
          "optimal-transport",
        ],
      },
      {
        title: "按 patient 或 slide 留出再评估",
        message:
          "同一区域的相邻 bins 不提供独立的新患者证据。评估要匹配你声称的推广对象。",
        steps: [
          "新 patient 泛化按 patient split；同 patient 新 section 是不同问题，要另行报告。",
          "避免把 reference annotation、目标 slide 的 cell labels 或同一区域的标注反馈放进测试流程。",
          "按 tissue region、cell density、boundary proximity 报告样本量与错误；区间按独立 slide/patient 重采样。",
        ],
        check: "坐标 registration 误差与 cell-type reference 误差要分别消融。",
        lessonIds: [
          "nested-group-validation",
          "external-validation",
          "cohort-design",
        ],
      },
      {
        title: "用 ambiguity 决定何时交给人",
        message:
          "低 margin、高 entropy 或 unmatched 适合进入人工复核；阈值需在 validation labels 上确定。",
        steps: [
          "比较 top-1 weight、top-1/top-2 margin 与错误率，而不是直接叫它 confidence。",
          "在固定审核预算下报告覆盖率和剩余错误；保留原始 counts 与 assignment provenance。",
          "以 segmentation 与独立 annotation 指标检查下游收益；表达更平滑不能单独证明归属更正确。",
        ],
        check: "完美 assignment 仍不能自动证明 cell type 或生物学作用。",
        lessonIds: [
          "spatial-assignment",
          "active-learning",
          "calibration-uncertainty",
        ],
      },
    ],
    choices: [
      {
        name: "Geometry baseline",
        use: "坐标可信、边界清楚",
        strength: "可解释、便宜，便于定位 registration/candidate 错误",
        cost: "难处理表达混合与缺失边界",
        settings: "radius 用真实单位；检查 candidate recall 与 unmatched",
        lessonId: "spatial-assignment",
      },
      {
        name: "EM / probabilistic model",
        use: "有可说明的 latent assignment likelihood",
        strength: "联合估计 assignment 与表达参数，保留软权重",
        cost: "初始化、模型错设和 identifiability；更多迭代不保证正确",
        settings:
          "多个 initialization；追踪 objective；检查 prior 与 dispersion",
        lessonId: "expectation-maximization",
      },
      {
        name: "Optimal Transport",
        use: "需要全局 coupling 与明确 mass constraints",
        strength: "联合平衡几何与表达，限制全局分配",
        cost: "mass 假设可能不合适；partial/unbalanced 场景需改模型",
        settings: "cost scale、entropy ε、mass/unmatched 约束分别消融",
        lessonId: "optimal-transport",
      },
      {
        name: "RL",
        use: "动作改变后续状态且存在延迟收益",
        strength: "可学习多步操作顺序",
        cost: "reward hacking、环境偏差与训练开销",
        settings: "先验证 state/action/reward；与 greedy 同预算比较",
        lessonId: "ppo",
      },
    ],
    challenge: {
      question:
        "训练 reward 上升，但人工检查的 boundary assignment 变差，优先做什么？",
      options: [
        "增加 PPO epochs，让 reward 更高",
        "检查 reward 与真实目标的关系，按错误类型复核并比较静态 baseline",
        "把所有 assignment temperature 降到接近 0",
      ],
      answer: 1,
      feedback:
        "代理 reward 可能奖励了过度 merge、表达平滑或更大 cell。先检查具体反例与独立标注；提高 reward 或压低 entropy 都无法修复目标错设。",
    },
    sources: [
      {
        label: "pciSeq · probabilistic cell typing",
        url: "https://www.nature.com/articles/s41592-019-0631-4",
      },
      {
        label: "PASTE · spatial alignment with OT",
        url: "https://www.nature.com/articles/s41592-022-01459-6",
      },
      {
        label: "Group cross-validation · scikit-learn",
        url: "https://scikit-learn.org/stable/modules/cross_validation.html",
      },
    ],
    protocol: {
      unit: "patient → slide → cell → bin/transcript",
      target: "assignment 到 cell + unmatched；分开记录 annotation",
      baseline: "nearest nucleus / polygon overlap",
      split: "按 patient 或独立 slide 留出；固定人工检查集",
      metric: "agreement、coverage、unmatched；边界分层；审核预算",
      failure: "registration 错位、真候选缺失、reward 与人工目标冲突",
    },
  },
  {
    id: "pathway",
    name: "Pathway/Age",
    question:
      "Pathway 特征能否在未见患者上提供超过简单 baseline 的 age prediction？",
    why: "预测可以帮助定位可重复的关联，但 age prediction 与衰老机制需要不同证据。",
    gap: "聚合表达可能同时反映 cell-type composition、cell state、library size 和 batch；模型必须先区分这些来源。",
    input:
      "Cells × genes raw counts、patient/cell-type/batch metadata、patient age；固定 pathway gene sets",
    transform: "按 patient/cell type 聚合 → normalization → pathway features",
    output:
      "Patients × pathways → 每 patient 的 predicted age 与 out-of-fold residual",
    outputBoundary:
      "Pathway score 的预测贡献不能直接证明该 pathway 导致衰老；composition、batch 与其他 covariates 都可能解释关联。",
    stages: [
      {
        title: "先定义什么是一行",
        message:
          "预测标签在 patient 层，cells 提供更细测量，不能把每个 cell 的年龄标签当作独立患者。",
        steps: [
          "保留 patient、sample、cell type、batch 和 age；先画 age 与 batch/cell counts 的分布。",
          "明确是预测 whole-tissue age 还是特定 cell type 的 age-related state；目标不同，aggregation 也不同。",
          "患者有多个 sample 时先定 patient-level 输出与聚合规则，避免高测量患者被重复加权。",
        ],
        check:
          "100 个 patient 各 1,000 cells，不是 100,000 个独立 age labels。",
        lessonIds: [
          "pseudobulk-hierarchy",
          "cohort-design",
          "nested-group-validation",
        ],
      },
      {
        title: "聚合会把 composition 带进来",
        message:
          "Raw count sum、mean log expression 和 pathway score 不是可互换的对象。",
        steps: [
          "Pseudobulk counts 按 biological replicate × cell type 求 raw count sum，保留 library size。",
          "Pathway scoring 方法要求什么 input scale，就明确记录其 normalization 与基因匹配规则。",
          "分别比较 whole-tissue、cell-type-specific 特征与 cell-type proportion baseline。",
        ],
        check:
          "同一 cell type 内表达不变，仅比例变化，也能改变 whole-tissue mean。",
        lessonIds: ["pseudobulk-hierarchy", "count-likelihoods", "scvi"],
      },
      {
        title: "常数预测先给错误一个参照",
        message:
          "Train mean/median age 是必要 baseline；预测挤在中间未必是程序错误，也可能是弱信号或过强 regularization。",
        steps: [
          "MSE baseline 用 train mean；MAE baseline 用 train median，禁止读取 test age。",
          "加入 covariate-only、gene-level 与 pathway-level Ridge/Elastic Net，固定 folds。",
          "画 predicted-vs-true、residual-vs-age 和预测 variance；逐步检查 target alignment、scaling 与 inverse transform。",
        ],
        check:
          "不能只凭 correlation 判断预测好坏：预测范围塌缩和系统偏差也要看。",
        lessonIds: ["elastic-net", "loss-functions", "model-evaluation"],
      },
      {
        title: "每一步只改变一个假设",
        message:
          "消融要区分 gene-set 定义、feature scale、composition 与模型容量，避免把流程变化全部归功于网络。",
        steps: [
          "同 split 下比较 pathway 与 gene features；random gene sets 匹配大小并重复采样。",
          "去掉一个 covariate、固定一类 cell type 或改变 aggregation 后重跑完整训练流程。",
          "比较多个 seeds 与独立 patient 的误差；对候选 pathways 做 multiple-testing 处理。",
        ],
        check:
          "筛 gene sets、选择 scoring 方法与挑模型都属于 selection，不能在 test 上做。",
        lessonIds: [
          "nested-group-validation",
          "data-leakage",
          "model-evaluation",
        ],
      },
      {
        title: "用患者层面的外层误差选结论",
        message:
          "Inner CV 调参，outer CV 估计整个 selection procedure 的泛化；需要真正独立 cohort 时另做 external validation。",
        steps: [
          "所有 normalization、feature selection 与 hyperparameter search 放进 outer-training 数据。",
          "同患者的 sample 不跨折；按真实部署选择 patient、center 或 time holdout。",
          "每 patient 只贡献约定的一份指标；报告 MAE/RMSE、误差分层和样本数。",
        ],
        check:
          "一个 batch 只有年轻、另一个只有年老，算法不能识别 age 与 batch 的独立作用。",
        lessonIds: [
          "nested-group-validation",
          "external-validation",
          "domain-adaptation-dann",
        ],
      },
      {
        title: "从预测关联走到可检验的假说",
        message:
          "稳定的 feature importance 提供候选假说，mechanism 需要 perturbation、独立测量或适合的 causal design。",
        steps: [
          "检查相关 pathways 的系数是否在 folds 中互换，别把单个系数当作唯一解释。",
          "保留 composition、batch、sex 等可用 covariates 的对照；明确尚不可识别的因素。",
          "用独立 cohort 验证关联；要说 pathway 改变 age-related phenotype，设计额外实验。",
        ],
        check: "即使 age prediction 完美，也只能支持预测问题的答案。",
        lessonIds: [
          "causal-treatment-effects",
          "model-evaluation",
          "elastic-net",
        ],
      },
    ],
    choices: [
      {
        name: "Mean / Median baseline",
        use: "每个回归项目都应先做",
        strength: "可识别 weak signal、label 错位和预测塌缩",
        cost: "没有个体化信息",
        settings: "仅用 train age；MAE 对应 median，MSE 对应 mean",
        lessonId: "model-evaluation",
      },
      {
        name: "Ridge / Elastic Net",
        use: "pathways 相关，patient 数有限",
        strength: "低成本、可正则化、易消融",
        cost: "线性假设；系数受相关性与 scale 影响",
        settings: "fold 内 scaling；对数网格 λ；检查预测范围",
        lessonId: "elastic-net",
      },
      {
        name: "XGBoost",
        use: "有足够 patient，怀疑 nonlinear interactions",
        strength: "表格强基线，可捕捉交互",
        cost: "小样本搜索易过拟合；重要性不等于机制",
        settings: "浅树、保守 learning rate；inner-fold early stopping",
        lessonId: "xgboost",
      },
      {
        name: "MIL",
        use: "patient bag 内有异质 cells，标签仅在 patient",
        strength: "保留集合异质性，可学习 pooling",
        cost: "attention 不等于 cell-level causal contribution；复杂且需 patient 数",
        settings: "先 mean pooling；同 patient 不跨折；对 bag size 做控制",
        lessonId: "multiple-instance-learning",
      },
    ],
    challenge: {
      question:
        "年轻样本 type A 占 20%，年老占 80%；两种 cell type 内表达都不变。Whole-tissue pathway score 上升能说明什么？",
      options: [
        "每个 cell 都激活了 pathway",
        "可能由 composition 改变引起，需 cell-type-specific 与 proportion 对照",
        "换成 Transformer 就能识别原因",
      ],
      answer: 1,
      feedback:
        "Aggregate 同时依赖类型比例与类型内表达。先拆 composition 与 state；更复杂的预测器不能替代这个对照。",
    },
    sources: [
      {
        label: "Squair et al. · biological replicate aggregation",
        url: "https://www.nature.com/articles/s41467-021-25960-2",
      },
      {
        label: "Nested CV · scikit-learn",
        url: "https://scikit-learn.org/stable/auto_examples/model_selection/plot_nested_cross_validation_iris.html",
      },
    ],
    protocol: {
      unit: "patient → sample → cell type → cell",
      target: "patient age；预先定义 whole-tissue 或 cell-type-specific",
      baseline: "train median/mean + covariate-only + Ridge/Elastic Net",
      split: "nested patient/group CV；另留独立 cohort",
      metric: "patient MAE/RMSE、residual-vs-age、预测 variance",
      failure: "label 错位、composition/batch 混杂、test 上筛 pathway",
    },
  },
  {
    id: "methylation",
    name: "Methylation/Age",
    question: "在 p ≫ n 的 methylation 特征里，哪些预测关系能推广到未见患者？",
    why: "特征比患者多时，容量、特征筛选与 validation leakage 往往比选哪种深度网络更影响结论。",
    gap: "全数据挑高 variance probes、重叠患者或过多搜索可能使评估产生偏差或过于乐观；相关 probes 的系数也可能不稳定。",
    input:
      "Patients × probes 的 β values、missingness/QC flags、age、patient/sample/batch metadata",
    transform: "Fold 内 QC/imputation/feature selection/scaling → regression",
    output:
      "每 patient 的 out-of-fold age prediction、误差；另报告 probes/coefficients 的稳定性",
    outputBoundary:
      "Methylation β 是比例尺度，不是 RNA count；预测时钟的 probe 系数不直接表示因果效应或生物学年龄。",
    stages: [
      {
        title: "先保证标签与测量一一对应",
        message:
          "Patient ID、sample ID、probe ID 的对齐必须显式检查；技术重复不能跨 train/test。",
        steps: [
          "报告 patient 数、sample 数、probe 数、缺失率与 age range；明确 sample inclusion。",
          "按 ID join 后检查重复与未匹配，不靠排序位置拼接 X 与 y。",
          "识别 assay/batch 与 age 分布；完全 confounded 时记录无法分离的效应。",
        ],
        check:
          "连续 β value 不应直接套 Poisson/NB；0、1 与缺失也不是同一回事。",
        lessonIds: ["cohort-design", "data-leakage", "count-likelihoods"],
      },
      {
        title: "筛选特征也在学习数据",
        message:
          "High-variance probe 筛选即使不读 age，也可能读取 held-out distribution；需在每个 training fold 内 fit。",
        steps: [
          "固定 assay QC 规则与数据依赖的筛选分开；后者只看 training fold。",
          "将 imputation、variance selection、scaling 和 regressor 放入 Pipeline。",
          "验证同一 probe order、缺失处理与 transform 应用于 held-out 数据。",
        ],
        check: "每折选到不同 probes 正常；这正反映 selection uncertainty。",
        lessonIds: ["nested-group-validation", "data-leakage", "elastic-net"],
      },
      {
        title: "从可解释的收缩开始",
        message:
          "Ridge 对相关 probes 平滑收缩；Lasso 稀疏但可能在相关 probes 间切换；Elastic Net 组合二者。",
        steps: [
          "用 train median/mean age 作基线，再比较 Ridge、Elastic Net；固定输入与 folds。",
          "在 inner CV 选 λ 与 l1_ratio；记录收敛与系数数量，禁止用 outer test 挑 sparse 解。",
          "画 regularization strength 与 train/validation error：太弱容易拟合噪声，太强可能接近常数。",
        ],
        check:
          "glmnet 的 alpha 是混合比；scikit-learn 的 alpha 是总惩罚强度，名字不能直接互换。",
        lessonIds: ["elastic-net", "regularization", "model-evaluation"],
      },
      {
        title: "外层隔离整个搜索流程",
        message:
          "Outer held-out 评估的是包括 feature selection 与调参在内的完整流程。",
        steps: [
          "患者重复时用 GroupKFold；独立一人一行时可用合适的 KFold，部署跨中心则按中心留出。",
          "对每个 outer fold，仅其 training 数据构造 inner splits；选择后重训 outer-training。",
          "汇总 out-of-fold patient predictions；不要把折间标准差直接当作独立患者置信区间。",
        ],
        check: "center 数很少时，不能硬凑很多独立 folds；报告数据限制。",
        lessonIds: [
          "nested-group-validation",
          "external-validation",
          "model-evaluation",
        ],
      },
      {
        title: "检查预测与解释的稳定性",
        message: "稳定预测不保证稳定 probe list，特别是高度相关的 CpG 特征。",
        steps: [
          "报告 MAE/RMSE、predicted-vs-true 与 age strata residual；测试标签分布改变会影响指标。",
          "在 training-only resampling 中记录 probe selection frequency 与系数方向。",
          "比较 matched-feature baselines 与新增 covariates 的消融，区分预测增益与 batch dependence。",
        ],
        check:
          "若预测稳定但 selected probes 变化大，解释应转向相关特征组而非宣称唯一关键 CpG。",
        lessonIds: ["elastic-net", "model-evaluation", "external-validation"],
      },
      {
        title: "把不可识别的解释写进结论",
        message:
          "一个 clock 的 chronological age error 不足以建立 biological age 或干预效果。",
        steps: [
          "明确训练目标是 chronological age；age acceleration 的定义与 covariate 调整另行预注册。",
          "跨 cohort、assay 或组织时检查 feature mapping 和 calibration；不能只复用 scaler 就声称 transfer。",
          "要解释机制，结合独立证据和研究设计；新的预测器只回答约定的预测任务。",
        ],
        check: "完美预测年龄仍不能回答“改变这组 CpGs 会改变衰老速度吗”。",
        lessonIds: [
          "causal-treatment-effects",
          "domain-adaptation-dann",
          "calibration-uncertainty",
        ],
      },
    ],
    choices: [
      {
        name: "Ridge",
        use: "大量相关 probes，先看整体预测",
        strength: "稳定收缩，适合 p≫n 基线",
        cost: "系数通常不为零，单 probe 解释困难",
        settings: "fold 内 standardize；对数网格 λ；与 train mean 比较",
        lessonId: "elastic-net",
      },
      {
        name: "Elastic Net",
        use: "希望稀疏又保留相关特征组",
        strength: "混合 L1/L2，控制容量并筛选",
        cost: "probe list 可随 folds 变化；scale 与 penalty convention 重要",
        settings: "l1_ratio 多档；inner CV 选 alpha；检查 convergence",
        lessonId: "elastic-net",
      },
      {
        name: "XGBoost",
        use: "有足够独立患者，探索非线性",
        strength: "能建模 thresholds 与 interactions",
        cost: "高维小样本调参风险；split importance 偏差",
        settings: "先 fold 内减维；浅树；相同 outer folds",
        lessonId: "xgboost",
      },
      {
        name: "MLP / pretrained representation",
        use: "基线仍有可重复误差，且有数据/预训练证据",
        strength: "可学习非线性共享表示",
        cost: "容量与训练方差；外部预训练 overlap 需审计",
        settings: "小 head；固定预训练来源；与 linear probe 比较",
        lessonId: "transfer-learning-strategies",
      },
    ],
    challenge: {
      question:
        "先在全部患者上选 10,000 个最高 variance probes，再做 5-fold CV，结果很好。应如何验证？",
      options: [
        "保持筛选列表，增加 CV repeats",
        "把数据依赖的筛选放到每折 training 内，并隔离调参后重新评估",
        "只减少 MLP 的层数",
      ],
      answer: 1,
      feedback:
        "Held-out 数据参与了特征定义。重复同一泄漏流程不能消除这个问题；重新运行 fold 内筛选与嵌套模型选择，才能评估完整 procedure。",
    },
    sources: [
      {
        label: "Zou & Hastie · Elastic Net",
        url: "https://doi.org/10.1111/j.1467-9868.2005.00503.x",
      },
      {
        label: "Pipeline leakage pitfalls · scikit-learn",
        url: "https://scikit-learn.org/stable/common_pitfalls.html",
      },
      {
        label: "ElasticNet objective · scikit-learn",
        url: "https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.ElasticNet.html",
      },
    ],
    protocol: {
      unit: "patient → sample；probes 是 features，不是独立样本",
      target: "chronological age；β values 与 QC metadata",
      baseline: "train median/mean + Ridge + Elastic Net",
      split: "fold 内 preprocessing/variance selection；nested patient CV",
      metric: "patient MAE/RMSE、age strata residual、selection stability",
      failure: "全数据筛 probes、batch-age confounding、系数当 causal effect",
    },
  },
];

export const researchStageNames = [
  "数据与对象",
  "Baseline 与表示",
  "算法与设置",
  "对照与修改",
  "独立评估",
  "结论边界",
];

export function researchLinksForLesson(id: string) {
  return researchPaths.filter(
    (path) =>
      path.stages.some((stage) => stage.lessonIds.includes(id)) ||
      path.choices.some((choice) => choice.lessonId === id),
  );
}
