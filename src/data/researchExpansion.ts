import type { Lesson } from "./lessons";

export const researchExpansionLessons: Lesson[] = [
  {
    id: "count-likelihoods",
    source: {
      label: "Svensson: Droplet scRNA-seq is not zero-inflated (2020)",
      url: "https://www.nature.com/articles/s41587-019-0379-5",
    },
    title: "Count Likelihood：先决定观测是怎样产生的",
    englishTitle: "Poisson, Negative Binomial & Zero Inflation",
    category: "classical",
    level: "进阶",
    duration: "18 分钟",
    icon: "▥",
    summary:
      "RNA molecule counts、normalized expression 与 methylation β values 是不同观测；选 likelihood 前先认清单位与测量过程。",
    intuition:
      "把测量想成从细胞里抽到多少个分子。即使真实平均表达不为零，抽样也可能一个都没抽到。不同细胞的表达强度还会变化，因此 count variance 可能大于 mean。",
    core: "输入为未经 log/scale 的非负 count matrix X∈N₀^(N×G)，以及 library size 或 exposure s∈R₊^N；输出为每项观测的 μ_ng、dispersion θ_g 与 log likelihood，形状通常为 N×G。Poisson 要求 Var(X)=μ；此处 NB 使用 mean–inverse-dispersion 参数化 Var(X)=μ+μ²/θ，θ 越小额外变异越大。ZINB 再加入结构零概率 π，不能仅因零多就选它。Svensson 的 droplet UMI 技术对照说明普通抽样模型能解释许多零；这不是所有 assay 都无 zero inflation 的结论。Methylation β∈[0,1] 是连续比例测量，不能作为 RNA count 塞进 Poisson/NB。",
    equation:
      "Poisson: Var=μ, P(0)=e^(−μ); NB: Var=μ+μ²/θ, P(0)=(θ/(θ+μ))^θ; ZINB: P(0)=π+(1−π)P_NB(0)",
    mechanicsSteps: [
      "先标注每行对象、每列 feature 和数据单位：RNA raw counts、CPM、log1p expression、methylation β 都分别记录；检查输入是否已经变换。",
      "设置 mean model，例如 log μ_ng=log s_n+η_ng；log s 是 exposure offset，让相同相对表达在更深测序下有更大的 expected count。",
      "拟合 Poisson baseline，再按同类可比观测检查 residual 与 overdispersion；不要把跨 cell type 的异质性直接当作同一分布的抽样方差。",
      "用 NB 为剩余 overdispersion 建模，记录 θ 的参数化；μ=4、θ=2 时 variance=4+16/2=12，P(0)=1/9≈0.111，而 Poisson P(0)≈0.018。",
      "仅在测量机制与 held-out predictive checks 支持额外零过程时比较 ZINB；若 π=0.2，则上述例子的 P(0)=0.2+0.8/9≈0.289。",
      "比较 held-out log likelihood、零频率、尾部 counts 和 subgroup residuals；良好的重构并不自动证明生物解释正确。",
    ],
    whenToUse: [
      "为 scRNA-seq、spatial RNA counts 或 pseudobulk 写 generative model、GLM 或 VAE reconstruction loss 时。",
      "Mean squared error 在稀疏异方差 count data 上缺少测量解释，且希望区分 library depth 与 expression 时。",
      "优点是 likelihood 与 observation scale 对齐，并能生成预测分布；简单 Poisson 是可解释且计算便宜的起点。",
    ],
    limits: [
      "NB 可吸收 overdispersion，但不能自动区分 biological variability、batch effects、ambient RNA 或错误 cell assignment。",
      "ZINB 的 π 与低 μ 可能解释相同零，参数识别需要更多证据；增加零组件可能只增加拟合自由度。",
      "Targeted Xenium panel、Visium HD capture 与 droplet scRNA-seq 的测量机制不同，不能直接共用未验证的 likelihood 或 library normalization。",
    ],
    howToUse: [
      "保留原始 count layer，另存用于图示/PCA 的 normalized 或 log layer；给每个函数明确指定所用 layer。",
      "先在训练 donors 上定义 gene filtering、mean model、offset 与 dispersion structure，再应用到 holdout。",
      "把 Poisson 与 NB 设为起点，用同一 split 比较 predictive distribution，而非只比较 train reconstruction loss。",
      "检查 predicted zeros 是否覆盖 observed zeros；再检查高 count tail 与不同 library-size group，避免只拟合零。",
      "保存参数化、软件版本、count 来源和 normalization；θ 或 α 名字相同不代表定义相同。",
    ],
    tuning: [
      "θ 从共享或 per-gene dispersion 开始；数据少时 per-cell-per-gene dispersion 容易过拟合。",
      "低表达 genes 的 dispersion 难估，考虑 shrinkage 或过滤，但 filtering threshold 必须在 training 范围内确定。",
      "若 μ 与 library depth 仍系统相关，先核查 offset、panel、捕获效率与 normalization，再增加模型层数。",
      "零多先计算 baseline 的 expected zero rate；π 的存在应由额外零过程和独立预测改善支持。",
    ],
    settings: [
      {
        name: "Observation layer",
        start: "Count likelihood 使用 raw nonnegative counts，保留变换前副本。",
        adjust:
          "发现 log1p/standardized 输入时修正 layer；连续 β values 另选适合其测量尺度的模型。",
      },
      {
        name: "Dispersion θ",
        start: "明确 Var=μ+μ²/θ，先使用共享或 per-gene θ。",
        adjust:
          "Residual variance 超出模型时检查 mean/covariates，再比较更多 dispersion flexibility。",
      },
      {
        name: "Exposure / library size",
        start:
          "写清 s 的单位与是否作为 offset；不要把 depth 当成新的独立样本。",
        adjust:
          "Targeted panel 或 capture differences 下重新验证 exposure 假设，不盲目使用 total counts。",
      },
      {
        name: "Zero inflation π",
        start: "先评估 Poisson/NB 的零预测，π=0 是明确 baseline。",
        adjust:
          "有可靠额外零机制且 holdout 改善时再增加 ZINB，检查 π 与 μ 的不稳定替代。",
      },
    ],
    modifications: [
      "若关心 zero versus nonzero 与 positive count 两个独立问题，可比较 hurdle model，并说明它与 ZINB 的生成机制不同。",
      "若 count 合并到 donor×cell type pseudobulk，可用 NB GLM 与 sample-level design；不要把所有 cell-level likelihood 当独立 biological evidence。",
      "若处理 methylation β，可比较 raw β 或适当变换的 regularized regression，以 held-out prediction 验证；连续比例不等于整数 count。",
    ],
    pitfalls: [
      "把一个 observed zero 解释为 gene 完全没表达，或把所有 zero 都叫 technical dropout。",
      "把 NB 的 inverse dispersion θ 与 α=1/θ 混用，导致对‘增大 dispersion’的理解反向。",
      "把 count likelihood、library normalization 与 patient-level split 当成可互相替代的步骤。",
    ],
    example:
      "教学 toy：一个 gene 的 expected count μ=4。Poisson variance=4；NB θ=2 的 variance=12，仍然没有额外 dropout 组件。两者 P(0) 分别约 0.018 与 0.111。观察到许多零时，先检查 μ、heterogeneity 与 depth；methylation β=0.72 则是另一种连续观测，不能替代这个 count。",
    compareTo: [
      "loss-functions",
      "scvi",
      "pseudobulk-hierarchy",
      "autoencoder-vae",
    ],
  },
  {
    id: "pseudobulk-hierarchy",
    source: {
      label:
        "Squair et al.: Confronting false discoveries in single-cell differential expression (2021)",
      url: "https://www.nature.com/articles/s41467-021-25960-2",
    },
    title: "Pseudobulk：把 cell evidence 放回 donor 层级",
    englishTitle: "Pseudobulk, Hierarchical Data & Composition",
    category: "training",
    level: "进阶",
    duration: "19 分钟",
    icon: "▤",
    summary:
      "更多 cells 能改善一位 donor 的测量，却不能凭空增加独立 donors；aggregation 同时决定 age/pathway 模型在回答哪一层问题。",
    intuition:
      "从一个人身上测一千个 cells，像从一位学生收一千次作业。你知道这个学生更清楚了，但班里仍然只有一位学生。先画 donor→sample→cell→gene 的树，再决定在哪一层汇总与比较。",
    core: "输入 count matrix X∈N₀^(C×G)，以及每个 cell 的 donor_id、sample_id、cell_type。按实际采样设计在 sample×cell type 汇总 raw counts，得到 B∈N₀^(P×G) 和 donor mapping；同一 donor 的多个 sample 仍有相关性，不能自动算独立 donors。For donor-level age prediction，输出可为 donor×gene/pathway feature matrix 与 age vector∈R^D。Pseudobulk count sum、mean expression、mean of log expression 是不同 estimands。Squair 的 DE study 支持对 biological replicate variability 建模；这不保证任何 age model 都会因 aggregation 改善。",
    equation:
      "B_pg=Σ_(c∈sample p,type t)X_cg; bulk mean=Σ_t proportion_t×mean_expression_t; n_independent≠n_cells",
    mechanicsSteps: [
      "画清层级和研究问题：要预测新 donor 的 age、比较 cell-type-specific expression，还是对单个 cell 做 annotation？这些任务的 output 不同。",
      "用 sample_id×cell_type 分组并 sum raw counts，保留 donor_id、cell 数、library size 和缺失 cell types；同 donor 重复 samples 用设计或进一步 aggregation 处理。",
      "对 count-based analysis 在 aggregation 后计算相应 normalization/offset；mean(log1p X) 不等于 log1p(sum X)，不要换了顺序还保留同一解释。",
      "检查 composition：type A mean=2、type B mean=8，比例从 80%/20% 变为 20%/80%，bulk mean 会从 3.2 变为 6.8，即使两类内部 expression 完全没变。",
      "若目标是 within-cell-type age association，使用相应 cell type 的 donor/sample-level matrix；若目标是 whole-tissue prediction，可保留 composition，但解释其来源。",
      "按 donor 分割并报告 biological replicate 数；对 DE 使用合适 sample-level design，对 prediction 在 training fold 内拟合所有 feature transforms。",
    ],
    whenToUse: [
      "跨 donors 的 scRNA/spatial DE、pathway comparison，或用细胞信息构造 donor-level age features。",
      "需要把 cell-level technical variation 与 donor-level biological evidence 分开，并减少稀疏 count matrix 时。",
      "优点是实验单位明确、可与成熟 count GLM 配合、计算成本较低；也便于做 cell-type-specific baseline。",
    ],
    limits: [
      "Aggregation 会丢失 donor 内 cell-state distribution；平均不变不能排除少数 cell state 改变。",
      "少 donors 的问题仍然存在；每位 donor 加十倍 cells 不能修复 age 与 batch 的完全混杂。",
      "Cell type annotation 与 bin-to-cell assignment 错误会传到 pseudobulk；某类 cells 缺失也可能由采样或测量造成。",
    ],
    howToUse: [
      "生成 sample×cell_type×gene count sums，并同时保存 donor IDs、cell counts 和 QC table。",
      "先检查 donor 数、age distribution、batch、cell-type coverage；不要只用总 cells 数描述数据量。",
      "把 expression features 与 composition features 分别构造，比较各自 baseline 和联合模型。",
      "Pathway scoring 先确定要求的 input scale；gene sets、filters、scalers 和 selectors 都在 training fold 内固定。",
      "做 donor holdout，并按 age range、batch、cell type coverage 分层查看 error；预测关联与机制解释分别陈述。",
    ],
    tuning: [
      "Minimum cells per sample×type 由测量稳定性与保留 donors 的 trade-off 决定，比较 sensitivity 而非挑最高分。",
      "Aggregation granularity 从科学问题决定；分得过细会得到稀疏且大量缺失的 sample×state groups。",
      "Gene filtering 与 library-size handling 依据 count model 或 pathway 方法设置，不能混用任意 normalized mean。",
      "对 age prediction，比较 gene、pathway、composition 和混合 features；每种 feature 选择都重新嵌套到训练。",
    ],
    settings: [
      {
        name: "Aggregation key",
        start:
          "按 sample×cell type 汇总并保留 donor_id，或在问题允许时按 donor×cell type 汇总。",
        adjust:
          "多 sample/visit 来自同 donor 时用 repeated-measure design 或 donor aggregation，split 仍按 donor。",
      },
      {
        name: "Count sum / mean / log mean",
        start:
          "Count model 用 raw count sum；图示与不同 scoring 方法另列所用 scale。",
        adjust:
          "发现 sum 与 log/mean 次序不一致时重建 features，并重新写 estimand。",
      },
      {
        name: "Cell coverage",
        start: "记录每组 cell 数与 zero/missing groups，预设最低覆盖规则。",
        adjust:
          "少数 donors 被大量排除时报告 selection，并比较更粗 cell types 或适合缺失的模型。",
      },
      {
        name: "Composition covariates",
        start:
          "先单独检查 fractions 与 age/batch，再决定预测问题是否需要它们。",
        adjust:
          "想解释 within-type change 时做 cell-type-specific analysis；调整 composition 会改变问题，需明示。",
      },
    ],
    modifications: [
      "保留每个 donor 的 cell-state quantiles、distribution features 或 MIL，以检验均值遗漏的 heterogeneity。",
      "有重复 visits 或多切片时采用合适 mixed-effects/repeated-measure model，仍以 donor 为泛化与 uncertainty 单位。",
      "若 age 与 composition 共同变化，做 expression-only、composition-only 与联合 ablation；这能定位预测信息，但不能证明因果机制。",
    ],
    pitfalls: [
      "把一位 donor 的 cells 随机拆成数个‘replicates’，再用这些组做 biological significance test。",
      "把 tissue mixture 的 mean change 直接解释为每种 cell type 内 expression 都变了。",
      "借 aggregation 得到更稳定 features 后，忘记 donor-level feature selection 与 split。",
    ],
    example:
      "教学 toy：4 位 donors 各有 100 cells，独立 donor 数仍为 4。某 donor 的一个 type 内 gene counts 为 [2,8]，count sum=10、cell mean=5；mean(log1p counts)≈1.648，而 log1p(sum)=log11≈2.398。另一个 composition toy 从 80% low-expression type 转为 80% high-expression type，使 bulk mean 3.2→6.8，却没有 within-type gene change。",
    compareTo: [
      "cohort-design",
      "count-likelihoods",
      "nested-group-validation",
      "multiple-instance-learning",
      "causal-treatment-effects",
    ],
  },
  {
    id: "nested-group-validation",
    source: {
      label:
        "Cawley & Talbot: Over-fitting in model selection and selection bias (JMLR, 2010)",
      url: "https://www.jmlr.org/papers/v11/cawley10a.html",
    },
    title: "Nested Group CV：评估整套选择流程",
    englishTitle: "Nested Group Cross-Validation & Patient-Level Evidence",
    category: "training",
    level: "进阶",
    duration: "20 分钟",
    icon: "⌗",
    summary:
      "Inner CV 选择 features 与 settings，outer CV 评估这套选择流程；两个层级都按实际泛化对象分组。",
    intuition:
      "要知道一套备考策略能不能帮助新学生，不能用同一张考试卷既选策略又给策略打分。还要避免同一学生的不同作业跨进备考和考试两边。",
    core: "输入 X∈R^(N×P)、targets y∈R^N 和 groups∈{1,…,D}^N。N 可以是 cells/samples，独立 donor 数为 D。Outer split 把一组 donors 完全留出；只在 outer training 内用 inner grouped CV 选择 imputation、scaling、HVG/variance filtering、pathway features、model 与 hyperparameters，再 refit 并预测 outer holdout。输出 out-of-fold predictions∈R^N 及 donor-level/预先定义的 weighted metrics。Nested CV 估计选择流程的泛化，不提供一个在所有 outer folds 内共同选定的 magic setting。",
    equation:
      "Outer: donors A→inner Group CV→selected pipeline→fit(A)→predict(B); A∩B=∅; MAE_donor=(1/D)Σ_d |ŷ_d−y_d|",
    mechanicsSteps: [
      "先写 deployment question：新 donor、同 donor 新 visit，还是新 institution？以最相关独立单位构造 group key，并检查重叠。",
      "建立 outer grouped folds；每次锁住 outer test donors，任何参数选择都不得读取其 labels 或 learned statistics。",
      "仅在 outer train 中生成 inner grouped folds，把 imputer、scaler、variance selector、feature construction 与 estimator 放进 pipeline。",
      "在 inner validation 上选 settings；全 outer train 上重新 fit 选定流程，再对 outer test transform/predict。",
      "合并 outer predictions，按 donor 或预先规定的目标单位计分；若每位 donor cells 数不同，不让大 donor 无意支配主指标。",
      "报告 donor 数、fold counts、age/batch coverage 与 uncertainty；重新在全部 development data 内选方案后，用最终独立 cohort 评估部署版本。",
    ],
    whenToUse: [
      "Donors 较少、features 很多，且反复选择 methylation loci、pathway sets、Elastic Net/XGBoost/NN settings 时。",
      "希望评估‘从数据到选定模型’的整个研究流程，或已有验证分数在大量试验后被反复优化时。",
      "优点是隔离 model selection bias 与同 donor leakage，并能公平比较同一 protocol 下的算法。",
    ],
    limits: [
      "Nested CV 不创造新 donors，small D 下 fold variance 仍很大；各 fold score 也不是独立实验 replicate。",
      "Age 与 batch/institution 完全重合时，任何 split 都不能识别哪个机制产生信号；需要新样本或降低解释范围。",
      "计算代价较高；数据充足时清楚分开的 train/validation/final test 也可有效评估，无需为了形式增加 nested loops。",
    ],
    howToUse: [
      "先保存每个 sample 的 donor_id、age、batch、site 与 data source，建立固定 split manifest。",
      "使用 GroupKFold/LeaveOneGroupOut 等适合问题的 splitter；inner 和 outer 都传正确 groups，核查 API 与 sklearn version。",
      "将 top-variance 10,000 methylation features 的选择、missing value handling、scaling 等放入每个 training fold。",
      "与 mean-age baseline、Ridge/Elastic Net 比较，用相同 outer predictions 计算 MAE/RMSE 与 age-range errors。",
      "Uncertainty 按 donor 或更高独立 cluster 重采样，不按 correlated cells bootstrap；说明它是否重新拟合与重新调参。",
      "最后冻结完整 pipeline、feature list 与 settings，独立 cohort 的结果单独报告。",
    ],
    tuning: [
      "Outer/inner fold 数由独立 groups 与 target coverage 决定；极少 donors 时减少 folds 或承认评估不稳定。",
      "搜索范围先小且有机制理由；试验越多，选择对 validation noise 的拟合风险越高。",
      "预先设定主指标与 donor weighting；把 overall MAE 与 age-stratified errors 一起看，防止只预测均值仍显得不错。",
      "模型选择看 inner 分数；outer 分数只用于评估流程，不能再拿来逐轮改 features 并宣称仍独立。",
    ],
    settings: [
      {
        name: "Group key",
        start: "新 patient 场景使用 donor_id，所有其 cells/visits 同 fold。",
        adjust:
          "新 site 场景需 site holdout；same-donor future visit 场景另定时间协议与目标。",
      },
      {
        name: "Pipeline fit scope",
        start:
          "Inner training 才能 fit imputation、scaling、HVG/variance selector 和 model。",
        adjust:
          "发现任何 global fit 时重做所有 outer folds，不能仅补一句 disclosure。",
      },
      {
        name: "Fold count",
        start:
          "检查每个 fold 的 donors 与 target range；用 group 数而非 row 数决定可行性。",
        adjust:
          "某 fold 缺少相关 age/batch coverage 时调整 protocol 或增加数据，保持 holdout 的真实场景含义。",
      },
      {
        name: "Metric / resampling unit",
        start: "预设 donor-level MAE/RMSE 与 donor resampling。",
        adjust:
          "多 samples per donor 时选择 donor aggregation 或等 donor 权重，并明示 estimand。",
      },
    ],
    modifications: [
      "有时间序列或新医院场景时用 nested temporal/site protocol，grouped random CV 不是通用答案。",
      "最终测试 cohort 已被多次用于选择时，记录污染并建立新的未参与选择的评估；重新命名旧 cohort 不能恢复独立性。",
      "固定低容量 baseline 与少量预设 settings 时，可用开发集内 grouped tuning 加独立 test；评估角色清楚比 loop 数更重要。",
    ],
    pitfalls: [
      "先在全部 TCGA samples 选 top-variance loci，再做 Nested CV；outer holdout 已影响 features。",
      "Outer fold scores 多个，就把它们当独立 donors 计算过窄 confidence intervals。",
      "新 donor 问题使用 cell row split，或把 nested outer score 当新的调参 leaderboard。",
    ],
    example:
      "教学 toy：6 位 donors 各 100 cells 是 N=600、D=6。一个 outer fold 留 donor F 的 100 cells；inner CV 只用 A–E，重新挑 variance features 与 α。选定后在 A–E refit 再预测 F。若 F 的 age=70、预测=60，donor error=10 年；把其 100 cells 当 100 个独立误差不会增加 100 倍证据。",
    compareTo: [
      "model-evaluation",
      "data-leakage",
      "cohort-design",
      "elastic-net",
      "automl-hpo-nas",
      "external-validation",
    ],
  },
  {
    id: "elastic-net",
    source: {
      label:
        "Zou & Hastie: Regularization and Variable Selection via the Elastic Net (2005)",
      url: "https://doi.org/10.1111/j.1467-9868.2005.00503.x",
    },
    title: "Elastic Net：相关 features 多、donors 少时先做稳基线",
    englishTitle: "Ridge, Lasso & Elastic Net Regression",
    category: "classical",
    level: "进阶",
    duration: "19 分钟",
    icon: "≋",
    summary:
      "Ridge 缩小 coefficients，Lasso 可将其置零，Elastic Net 混合二者；高维 methylation age 是比盲目加深 network 更值得先理解的场景。",
    intuition:
      "许多 CpG 或 genes 都在描述相近变化，模型可能用任意一组大而相互抵消的权重记住 donors。Penalty 为复杂解释收取代价，让解更稳定；L1 还能删除部分 weights。",
    core: "输入 donor×feature X∈R^(D×P) 与 age y∈R^D，输出 coefficients w∈R^P、intercept b 与 predictions∈R^D。这里使用 sklearn 的 objective：squared error/(2D)+α·ρ·L1+α(1−ρ)·L2/2，ρ=l1_ratio。ρ=1 是 Lasso，ρ=0 是 L2 penalty；Ridge 的软件 α 可能有不同 loss scaling，不能直接比较数值。训练 fold 内 scaling 决定各 features 的 penalty 相对强度。L2 有助于 correlated-feature stability；L1 提供 sparsity，但 selected loci 与 coefficients 都不是 causal effects。",
    equation:
      "min_(w,b) ||y−Xw−b||²/(2D)+α ρ||w||₁+α(1−ρ)||w||²/2; w_j←soft(s_j,αρ)/(a_j+α(1−ρ))",
    mechanicsSteps: [
      "先按 donor split，training fold 内拟合 imputer、variance filter 和 scaler；保存 feature ordering 与 scaling parameters。",
      "把每个目标减去 training mean 或拟合 intercept，定义 penalty 与 loss normalization，确认哪些参数被 penalty。",
      "Coordinate descent 固定其它 coefficients，计算该 feature 对当前 partial residual 的相关 s_j 与平方尺度 a_j；L1 用 soft threshold，L2 增大 denominator。",
      "教学标准化单 feature 中 a=1、s=0.8、α=0.2、ρ=0.5：soft(0.8,0.1)/(1+0.1)=0.7/1.1≈0.636。Lasso 同 α 得 0.6；此 L2 objective 得约 0.667。",
      "在 inner grouped CV 比较 α 与 ρ，评估 MAE、mean-age baseline、非零 features 数与 coefficient stability。",
      "Refit 选定 pipeline 后在外部 donors 预测；检查所有预测靠近 mean 是强 shrinkage、弱信号、scale 错误还是 distribution shift。",
    ],
    whenToUse: [
      "TCGA methylation、gene/pathway age prediction，P 大于 D 且 features 高度相关时。",
      "需要计算便宜、可审计的 strong baseline，或想量化稀疏度与 prediction 的 trade-off。",
      "优点是 optimization 较稳定、参数含义清楚、适于小样本高维起点；比 unrestricted linear regression 更能控制 variance。",
    ],
    limits: [
      "Linear additive form 可能遗漏非线性与 interactions；高分也可能主要来自 tissue composition、batch 或 tumor state。",
      "Lasso 在 correlated features 间可能替代选择；Elastic Net 改善 grouping 并不保证 selected features 唯一或真实。",
      "Coefficients 依赖 scaling、covariates 和 cohort；不能把某 CpG 的正系数直接解释为促衰老机制。",
    ],
    howToUse: [
      "先构建 mean-age 与 Ridge baselines，再比较 Lasso/Elastic Net，保持同一 donor-level protocol。",
      "Methylation raw β、M-value 或其它 transform 按明确理由比较；只用 training fold 拟合 transformation/feature selection。",
      "用 pipeline 与 inner grouped search 调 α、l1_ratio；默认 ElasticNetCV 的 splitter 是否按 groups 工作必须核实，不能凭类名假定。",
      "保存 coefficients、scaler、imputer、feature IDs、software version、training target mean 与 split manifest。",
      "检查 donor residuals、age slope、prediction range 与 mean baseline；同时记录 train error、validation error 和 convergence status。",
    ],
    tuning: [
      "α 在 log scale 上从弱到强搜索；强 α 下 weights 趋近零，预测更接近 training target mean。",
      "ρ 从偏 L2、混合、偏 L1 的少量候选比较；相关 features 多时同时看 coefficient resampling stability。",
      "tol 与 max_iter 依据 dual gap/convergence warning 调整；先修正 feature scales，不把未收敛结果用于解释。",
      "Feature count 是 hyperparameter，top-variance loci 数也要进 inner search；高 variance 不等于 age-relevant。",
    ],
    settings: [
      {
        name: "α / penalty strength",
        start: "Log-spaced candidates，由 inner donor CV 选择。",
        adjust:
          "Train 和 validation 都接近 mean baseline 时检查强 shrinkage、features 与真实信号；过拟合时增加约束。",
      },
      {
        name: "l1_ratio ρ",
        start:
          "比较 0.1、0.5、0.9 等机制清楚的 mixed penalties，单独拟合 Ridge baseline。",
        adjust:
          "稀疏 selections 跨 folds 大变时降低 L1 比例并检查 correlated groups；不要仅挑好看 feature list。",
      },
      {
        name: "Scaler / transform",
        start:
          "Training-only imputation 与 scaling；记录 β/M-value 等原始 scale。",
        adjust:
          "单位或 variance 主导 penalty 时核查 transformation，验证不同 representations 是否稳定。",
      },
      {
        name: "Convergence",
        start: "记录 max_iter、tol、dual gap 与 warning。",
        adjust:
          "未收敛先标准化和核查数据，再提高迭代上限/调整 tol，并复核预测。",
      },
    ],
    modifications: [
      "若有非线性证据，与 XGBoost、kernel regression 或小 MLP 比较；模型变复杂后仍用同一外层 donor protocol。",
      "用 gene/pathway grouped features 或 grouped penalties 表达结构，但须检验 gene-set overlap 和信息损失。",
      "对选中 loci 做 donor resampling 与稳定性检查；科学机制需要 independent biological evidence，不能用 coefficient sign 代替。",
    ],
    pitfalls: [
      "认为 β variance 最大的 10,000 loci 必然最适合 age；variance selector 只看 X，不回答与 age 的关系。",
      "混淆 sklearn α 与 glmnet α/lambda，或比较不同 objective scaling 下的相同 numeric penalty。",
      "观察 prediction 全部接近 55 岁后，只增加 network depth，没查 intercept、penalty、scale、target distribution 与 leakage。",
    ],
    example:
      "教学 toy：D=80 donors、P=10,000 CpGs。先在 outer train 内选 features 与 scale，再 inner CV 调 α/ρ。单 feature coordinate update 从相关量 s=0.8 变为 w≈0.636；若 α 大到使所有 |s_j|≤αρ，则所有 weights 可为 0，预测就是 training age mean。这是需要诊断的 shrinkage 现象，不是数据中一定没有 age 信息。",
    compareTo: [
      "regularization",
      "logistic-regression",
      "xgboost",
      "nested-group-validation",
      "pca",
    ],
  },
  {
    id: "scvi",
    source: {
      label: "scvi-tools: scVI generative model and inference documentation",
      url: "https://docs.scvi-tools.org/en/stable/user_guide/models/scvi.html",
    },
    title: "scVI：用 Count VAE 分开 latent state 与测量条件",
    englishTitle: "Single-Cell Variational Inference (scVI)",
    category: "generative",
    level: "高级",
    duration: "21 分钟",
    icon: "◈",
    summary:
      "把 VAE 的 decoder 改成适合 RNA counts 的 probabilistic model，并显式建模 batch/library；latent embedding 仍需 biological 与 donor-level validation。",
    intuition:
      "同样的 cell state 经不同测量条件，会产生不同 counts。Encoder 从 noisy counts 推断可能的 latent state，decoder 再结合 batch 与 library size 重建观测分布；它学的是一个解释数据的统计模型。",
    core: "Lopez et al. 2018 的 scVI 是 single-cell count VAE。输入 raw counts X∈N₀^(C×G)、batch codes∈N^C 与 library information；encoder 输出 qφ(z_c|x_c,b_c) 的 mean/variance∈R^(C×K)，decoder 输出 count-distribution parameters∈R^(C×G)。常用 z prior 为 standard Normal，观测可使用 NB/ZINB/Poisson，具体参数与默认值应按安装版本核查。Decoder 的 mean 由 normalized expression 与 library scale 等决定；training 用 reconstruction expectation 减 KL 的 ELBO。z 的第一个坐标不自动等于 age 或某 pathway。",
    equation:
      "ELBO=E_q[log pθ(x|z,b,s)]−KL(qφ(z|x,b)||p(z)); μ_cg=s_cρ_θg(z_c,b_c)",
    mechanicsSteps: [
      "保留 raw count layer，标注 gene IDs、batch、donor 与 assay；仅将 intended count data 注册给模型，log-normalized layer 留给其它分析。",
      "Encoder 为每个 cell 产生 K-dimensional posterior mean/variance；用 reparameterization z=mean+std×ε 抽样，使梯度能流回 encoder。",
      "Decoder 输入 z 与 batch/covariates，输出每 gene 的 expression proportions/positive means 与 dispersion；结合 library scale 构造 count likelihood。",
      "教学 shape：C=6、G=4、K=2，X 是 6×4，posterior mean 是 6×2，decoder means 回到 6×4。一个 cell 的 s=10、ρ=[0.1,0.2,0.3,0.4] 时 μ=[1,2,3,4]。",
      "用 mini-batches 优化 ELBO，检查 reconstruction 与 KL 两项、held-out fit 和训练稳定性；KL 约束 posterior，但更小 training loss 并不保证正确生物结构。",
      "获得 latent embedding 或 normalized-expression posterior samples，再检查 cell-type biology 保留、batch mixing 与 new-donor 表现；下游 age prediction 必须另做 donor-level evaluation。",
    ],
    whenToUse: [
      "较大 single-cell count datasets 的 probabilistic representation、batch-aware integration 或 downstream embeddings。",
      "需要从 VAE 原理理解 RNA-specific likelihood、library factors、posterior uncertainty 与 counterfactual batch conditioning。",
      "优点是将多个分析环节放进一个可扩展 count model，可输出 latent posterior 与 decoded expression，而非只给 deterministic PCA coordinates。",
    ],
    limits: [
      "Batch 与 phenotype 完全 confounded 时，模型无法从观测数据识别哪个差异应保留、哪个应移除；图上 mixing 好也不证明 correction 正确。",
      "Latent representations 不自动 identifiable，且依赖 gene panel、likelihood、capacity、data coverage 与 optimization。",
      "Targeted Xenium panel 与全转录组 RNA 的 features/测量过程不同，不能无验证地把 scVI integration 当跨 assay 对齐或 cell segmentation。",
      "Posterior uncertainty 依赖模型假设；cells 相关性与 donor-level scientific inference 仍须单独处理。",
    ],
    howToUse: [
      "先做可解释 PCA/normalization baseline 和 QC，检查 shared genes、count layer 与 batch/age cross-table。",
      "使用 setup_anndata 注册 raw counts layer 和合法 batch_key/covariates；记录 scvi-tools version 与 API。",
      "对 count likelihood 与 latent dimension 做小范围、有机制理由的比较，保存 seeds、training curves 和 validation criteria。",
      "同时检查 biological conservation 与 batch removal，避免仅根据一张混合漂亮的 UMAP 选模型。",
      "若要预测新 donor 的 age，将 representation learning 接触 holdout data 的范围写清：inductive 流程在 development fit，transductive integration 不能冒充完全未见样本评估。",
      "保存 model、gene order、registry 与 count 来源；到新数据时先确认 feature compatibility、assay 和分布，再选择 transfer workflow。",
    ],
    tuning: [
      "n_latent 从小容量如 10/20 的候选起检验，数字是候选而非 universal recipe；增大后需检查 rare-state preservation 和过拟合。",
      "gene_likelihood 与 dispersion 依据 count process/held-out fit 选择；不要因为 zeros 多就默认必须 ZINB。",
      "n_layers、hidden width、dropout 和 training epochs 是容量/optimization 参数；先确保 count layer 与 batch design 正确。",
      "KL warmup/early stopping 依版本配置并检查 curve；posterior collapse 时检查 KL/reconstruction，而非只看 total loss。",
    ],
    settings: [
      {
        name: "Count layer / gene order",
        start: "注册 raw counts，记录 shared genes 与 feature order。",
        adjust:
          "错用 log/scaled data 或不同 gene ordering 时重新注册/训练，先核查数据单位。",
      },
      {
        name: "batch_key / covariates",
        start:
          "只指定有清楚测量解释的 nuisance variables，检查与 phenotype 的 cross-table。",
        adjust:
          "与 age/disease 完全重合时不能靠 tuning 解决，需新设计或缩小解释范围。",
      },
      {
        name: "n_latent / capacity",
        start: "小范围比较 K 与 PCA baseline，shape C×K 明确保存。",
        adjust:
          "Rare states 丢失或 embedding 受 noise 主导时结合 biological checks 调整容量与 data coverage。",
      },
      {
        name: "gene_likelihood / dispersion",
        start:
          "Explicitly 记录 NB/ZINB/Poisson 与 dispersion 参数化，不依赖未记录默认值。",
        adjust:
          "Predictive checks 不佳时先检查 mean/offset、assay，再增加 likelihood flexibility。",
      },
    ],
    modifications: [
      "有可信 cell labels 可研究 scANVI；有 protein/RNA 或其它 modality 时选相应 generative model，而非把不同单位简单拼成 counts。",
      "Spatial mixture deconvolution 可进一步学习 DestVI 等方法，output 是 mixture/state inference；这与 bin-to-cell physical assignment 不同。",
      "把 latent/decoded features 接到 donor-level Elastic Net 或 MIL，与 raw-feature baseline 做同 protocol ablation。",
    ],
    pitfalls: [
      "把输入到 encoder 的 standardized methylation β 误当 RNA counts，或把 UMAP separation 直接当已验证 cell biology。",
      "为去除 batch 而回归掉与 phenotype 重合的变量，却继续声称保留了全部 disease/age effects。",
      "先用所有 evaluation donors 学 representation，再宣称下游是完全 inductive new-donor generalization。",
    ],
    example:
      "教学 toy：6 cells×4 genes 经 encoder 得 6×2 latent posterior，再经 decoder 得 6×4 count means。对同一 z，library 10→20 可令 mean [1,2,3,4]→[2,4,6,8]，而 relative expression 不变。若所有年轻 donors 在 batch A、年长 donors 在 B，模型没有证据把 age 与 batch 唯一区分。",
    compareTo: [
      "autoencoder-vae",
      "count-likelihoods",
      "domain-shift",
      "pseudobulk-hierarchy",
      "nested-group-validation",
    ],
  },
  {
    id: "spatial-assignment",
    source: {
      label:
        "Petukhov et al.: Cell segmentation in imaging-based spatial transcriptomics / Baysor (2021)",
      url: "https://www.nature.com/articles/s41587-021-01044-w",
    },
    title: "Spatial Assignment：先分清 matching、segmentation 与 annotation",
    englishTitle: "Spatial Assignment, Latent Inference & EM versus RL",
    category: "classical",
    level: "高级",
    duration: "22 分钟",
    icon: "⌖",
    summary:
      "Bin/transcript 归属于哪个 cell、两个 assay 的 cells 是否对应、cell 是什么 type，是三个不同 output；选 EM/RL 前先把目标写清。",
    intuition:
      "地图上一个点靠近两个房间的门。最近房间提供 geometry evidence；点的分子组成提供 expression evidence。Soft assignment 保留不确定归属，global constraints 防止所有点挤入同一房间。只有行动会改变后续状态时，sequential decision 才成为主要问题。",
    core: "Physical assignment 输入 spatial units U∈R^(B×2/3)、features X∈R₊^(B×G)、candidate cells/boundaries，输出 assignment R∈[0,1]^(B×(K+1))，额外一列可代表 background/unassigned。Candidate matching 的 output 则是两组 cell IDs 间关系；annotation 输出 cell×type probabilities。Baysor 示范 joint transcriptional composition 与 morphology 的 segmentation model，但以下 score/EM 例子是教学自定义模型，不能声称重现 Baysor 或直接适用于 Visium HD。Static constrained assignment、latent-model EM 与 MDP/RL 是不同 problem formulations。",
    equation:
      "Toy r_bk ∝ prior_k exp(−geometry_cost_bk−expression_cost_bk); Σ_k r_bk=1; RL: (s_t,a_t)→s_(t+1), r_t",
    mechanicsSteps: [
      "定义 observed unit 是 Xenium transcript、Visium HD bin 还是已有 cell；固定 coordinates 的单位、transform、registration 与 assay-specific feature meaning。",
      "列出 output：bin/transcript-to-cell assignment、cell-to-cell matching 或 cell-type annotation；同时列出 background、unmatched 与 one-to-many policy。",
      "构造候选 cells 与 geometry/expression evidence，把物理单位和特征尺度规范化。教学 score 对两 cells 为 [−0.2,−1.2]，等 prior 下 heuristic normalized weights≈[0.731,0.269]；尚未定义 generative likelihood，不能称作 EM responsibility。",
      "若写得出 latent assignment 的 joint likelihood，用 E-step 求 responsibilities，M-step 更新 cell profiles/形状参数，并监测 objective、多初始化与 degeneracy。",
      "若只需一次最小代价匹配且 constraints 已知，先用 nearest-neighbor/overlap/Hungarian/OT 等 static baselines；capacity 与 unmatched 规则比算法名更先决定可行解。",
      "若 action 会改变后续 assignment state、存在长程 trade-off 与可检验的 reward，可定义 MDP 并比较 RL；只把 objective improvement 叫 reward 并不足以证明 RL 必要。",
      "用独立/manual labels、boundary evidence、negative controls 与扰动敏感性检验；likelihood/reward 上升不等于真实 cell boundaries 或 type 正确。",
    ],
    whenToUse: [
      "学习 spatial bin-to-cell、transcript assignment、cross-assay cell matching 中 geometry 与 molecular evidence 如何结合。",
      "需要比较 static optimization、EM 的 latent posterior 与 RL 的 sequential policy，并决定复杂方法是否回答真实问题。",
      "优点是把 output、constraints 与 uncertainty 明确化，可从简单可审计 baseline 扩展，而非直接依赖某个算法标签。",
    ],
    limits: [
      "Spatial proximity 不等于 same cell，cell boundaries 不等于 nucleus boundaries；不同 assay 也未必包含完全相同 physical cells。",
      "Expression 相似可来自相同 cell type；不能仅凭相似 marker profile 证明两个 cell IDs 是一一对应。",
      "Latent model 可能有 equivalent/local solutions；EM convergence 或 RL reward 高不能独立确认 biological identity。",
      "奖励代理、registration 误差或 panel bias 可能驱动错误 assignment，下游 annotation/pseudobulk 会继承错误。",
    ],
    howToUse: [
      "先保存 transform、coordinate units、cell/bin/transcript IDs 与 candidate rules，并画几处 boundary/registration overlays 人工检查。",
      "建立 geometry-only、expression-only、joint static baselines，记录 unmatched、split/merge 与 ambiguous cases。",
      "对 probabilistic approach 写明 joint model、priors、background 与每轮更新；检查 responsibilities 不被错误数值尺度支配。",
      "对 RL 写明 state、action、transition、reward、termination 和 constraints，比较 equal-budget static/EM baselines。",
      "在未参与设计的区域/样本上验证；拆开 assignment quality、cell matching quality 与 annotation accuracy。",
      "把 ambiguous assignments 的 uncertainty 传到 cell profiles/pathway prediction，并对合理扰动做 sensitivity analysis。",
    ],
    tuning: [
      "Candidate radius 以物理单位设定，检查 registration residual 与 cell morphology；太大增加混淆，太小排除真实归属。",
      "Geometry/expression weight 先做尺度核查与单项 ablation；同一个数值权重在两套 feature units 下不具相同含义。",
      "Softness/temperature 会改变 confidence，不会自动改善 correctness；做 calibration/ambiguity checks。",
      "EM initialization、profile regularization 与 background prior 控制退化；RL reward weights 则要用外部质量指标检验。",
    ],
    settings: [
      {
        name: "Output & constraints",
        start:
          "分别定义 assignment、matching 与 annotation；显式保留 background/unmatched。",
        adjust:
          "发现大量 split/merge 或非对应 assay 时修正 correspondence policy，不强迫 one-to-one。",
      },
      {
        name: "Geometry radius / units",
        start: "用 μm 等统一物理单位，先验证 transform 和 registration。",
        adjust:
          "Assignments 系统偏移时先修正坐标；不要用 reward 或表达权重掩盖 registration 错误。",
      },
      {
        name: "Expression likelihood / weights",
        start:
          "按 assay 与 panel 选 features/likelihood，比较 geometry-only baseline。",
        adjust:
          "Cell types 相似导致错配时增加独立 boundary evidence；避免把 type similarity 当 identity。",
      },
      {
        name: "Background / uncertainty",
        start:
          "给 unassigned/background 合法通道并记录 soft responsibilities。",
        adjust:
          "所有 units 被强分配且边界异常时核查 rejection、capacity 与 prior，而非只提高 confidence。",
      },
    ],
    modifications: [
      "已知 binary cell masks 时从 polygon overlap / boundary-aware assignment 起，再检验 morphology 不完整的情况。",
      "存在总容量/质量约束时用 constrained matching 或 OT；允许未匹配 mass 需要 partial/unbalanced formulation。",
      "仅有 donor-level 或 slide labels 时可研究 MIL；只有真 sequential environment 才以 RL policy 作为主要 output。",
    ],
    pitfalls: [
      "把 Xenium segmentation 当无误 ground truth，或把 Visium HD bin 数视为独立 cell 数。",
      "用同一 expression markers 同时优化 assignment 又宣称 annotation 独立验证，从而形成 circular evidence。",
      "EM responsibilities 和 RL action probabilities 都是概率，就把二者当同一种 uncertainty。",
    ],
    example:
      "教学 toy：一个 bin 对两个 candidate cells 的 combined costs 为 0.2、1.2，等 priors、temperature=1 的 heuristic normalized weights≈0.731/0.269；若 registration 错了，让第一个 cost 增为 2.2，weights 将反转为≈0.269/0.731。先修坐标才有意义。这些 weights 未经 calibration，也没有构成 EM。若任务只是一张固定 cost table 的最小匹配，static optimization 是必要对照；若重新分配会改变后续状态并影响长期约束，才进一步评估 MDP/RL。",
    compareTo: [
      "expectation-maximization",
      "knn",
      "optimal-transport",
      "reinforcement-learning",
      "safe-rl-pomdp",
      "calibration-uncertainty",
    ],
  },
  {
    id: "optimal-transport",
    source: {
      label: "Cuturi: Sinkhorn Distances (NeurIPS, 2013)",
      url: "https://papers.nips.cc/paper/2013/hash/af21d0c97db2e27e13572cbf59eb343d-Abstract.html",
    },
    title: "Optimal Transport：同时分配，而不是各自找最近点",
    englishTitle: "Optimal Transport, Sinkhorn & Spatial Correspondence",
    category: "classical",
    level: "高级",
    duration: "20 分钟",
    icon: "⇄",
    summary:
      "OT 在 cost 与 mass constraints 下求 transport plan；global competition、entropy 与 unmatched policy 决定它和 kNN/Hungarian 的差别。",
    intuition:
      "两处仓库要给两处目的地运货。每个仓库不能只挑自己最近的目的地，因为目的地有需求量、仓库有供给量。Transport plan 记录多少 mass 从每个 source 流向每个 target；它不天然代表某两个 physical cells 是同一个。",
    core: "输入 source masses a∈R₊^B、target masses b∈R₊^K 和 cost C∈R^(B×K)，balanced OT 要求 Σa=Σb，输出 Π∈R₊^(B×K)，满足 Π1=a、Πᵀ1=b。Entropy regularization 使 plan 更分散且可用 Sinkhorn scaling 求解；Π 是 transported mass，不是直接 row-normalized probability。只有对 a_i>0 的 row 除以 a_i 才得到条件分配。PASTE 使用 expression 与 within-slice geometry 的 fused Gromov–Wasserstein objective；下述简单 cost OT 只是基础教学，并未复现 PASTE。",
    equation:
      "min_Π ⟨Π,C⟩+εΣ_ij Π_ij(log Π_ij−1), Π1=a, Πᵀ1=b; K_ij=e^(−C_ij/ε), u=a/(Kv), v=b/(Kᵀu)",
    mechanicsSteps: [
      "定义 mass 代表 sample weights、expression mass 还是 cell abundance，并确定 balanced、partial 或 unbalanced 的科学含义。",
      "构造 cost matrix，分别规范 expression 与 geometry scales；若 coordinates 未对齐，先处理 registration 或使用 appropriate structural cost。",
      "教学 a=b=[0.5,0.5]、C=[[0,1],[1,0]]：ε→0 的 plan 为 diagonal entries 0.5，总 cost=0；每 row/column 都满足 mass constraint。",
      "Finite ε 时先构造 positive kernel K=exp(−C/ε)，交替更新 u=a/(Kv)、v=b/(Kᵀu)；检查 row/column marginal residuals。",
      "同一 toy 中 ε=1 给 diagonal mass≈0.366、off-diagonal≈0.134；除以 row mass 0.5 后，conditional assignment 为≈0.731/0.269。更大 ε 增加 softness，也增加 biased mixing。",
      "检查 unmatched points：balanced OT 会把所有 mass 分完；场景存在不对应区域时改 partial/unbalanced formulation 并验证剩余 mass，而非把所有 plan entries 都当真实对应。",
      "与 nearest-neighbor、one-to-one Hungarian 和 geometry-only baselines 比较质量、constraints、运行成本与对扰动的稳定性。",
    ],
    whenToUse: [
      "需要 global mass/capacity competition 的 distribution matching、spatial slice alignment 或跨群体 correspondence。",
      "kNN 会将大量 source 指向同一 target，而目标问题确有可解释 supply/demand constraints 时。",
      "优点是 objective 与 constraints 明确，soft plan 可保留多对多关系；Sinkhorn 便于连续可微计算与 GPU batch 处理。",
    ],
    limits: [
      "错误的 mass equality/capacity 假设会强迫错误对应；plan 满足 constraints 并不证明它代表真实 cell identity。",
      "Cost matrix 需要 B×K memory，结构化 GW 还可更贵；大数据通常需稀疏/近似/分块方法。",
      "很小 ε 可数值不稳定，很大 ε 会混合不应对应的点；entropy 给 softness，不提供 calibrated biological uncertainty。",
    ],
    howToUse: [
      "先写 a、b、C 的定义、单位与总 mass，判断是不是应有 full overlap；显式保留 unmatched 情况。",
      "从小 matrix 验证 cost、marginals 与 known correspondences，再扩大到实际 data。",
      "选择 stable log-domain Sinkhorn 实现并记录 ε、iteration limit、tolerance 与 marginal residual。",
      "检查 transport mass 与 row conditional probabilities 的区别，导出 soft plan 时保留 source mass。",
      "人工抽查对应点与 regions，比较 cost-weight、ε、mass、registration perturbations 的 sensitivity。",
      "用于 downstream aggregation 时检查质量守恒与 duplicated contribution，不能把同一 mass 多次当 independent cells。",
    ],
    tuning: [
      "ε 需相对 cost scale 解释；把 C 乘十却保持 ε 不变，相当于让 assignment 更尖锐。",
      "Geometry/expression weights 按明确尺度与 independent checks 比较；不同 features 的 numeric variance 不能偷偷决定权重。",
      "Tolerance/iterations 根据 marginal residual 与 objective stability 确定；iteration结束不等于 constraints 已满足。",
      "Partial overlap fraction 或 unbalanced penalty 是 problem assumption，必须做 sensitivity，而非仅按最漂亮地图选择。",
    ],
    settings: [
      {
        name: "Balanced / partial / unbalanced",
        start:
          "只有 full mass matching 合理时使用 balanced；不对应 points 有合法剩余机制。",
        adjust:
          "Field-of-view、cell composition 不同导致强迫错配时比较 partial/unbalanced，不强制所有 cells 配对。",
      },
      {
        name: "Cost scale & ε",
        start: "记录 C 的范围与单位，ε 相对 cost 设置。",
        adjust:
          "Plan 过散或过尖时先核查 cost normalization，再调整 ε 并验证 correspondence quality。",
      },
      {
        name: "Mass a,b",
        start: "明示 weights/abundance 等含义，检查总 mass 和 capacities。",
        adjust:
          "Marginal 假设与真实 assay 不符时修改 formulation，不能只改求解器。",
      },
      {
        name: "Convergence / numerics",
        start:
          "Log-domain solver，记录 max iterations 与 row/column residuals。",
        adjust:
          "Underflow、NaN 或 residual 高时检查 scaling/ε 与 solver稳定性，而非接受一个看似合理 plot。",
      },
    ],
    modifications: [
      "一一对应的离散单位且不需 mass splitting 时，比较 Hungarian assignment，仍需独立处理 unmatched。",
      "坐标系不共用且有组织结构信息时研究 Gromov–Wasserstein/fused GW；PASTE 为相邻 spatial slices 的具体应用。",
      "存在局部 overlaps 或新 cell types 时研究 partial/unbalanced OT；解释未匹配 mass 是缺少对应还是测量偏差。",
    ],
    pitfalls: [
      "把 Π_ij=0.366 直接称为 36.6% cell assignment probability，忽略 row mass=0.5；条件概率应为 0.732。",
      "将 full transport 的输出当作两套 assay 的全部 physical cells 已一一对应。",
      "把 ε 改小后 plan 更尖锐，便宣称 biological accuracy 或 uncertainty calibration 提高。",
    ],
    example:
      "教学 2×2 toy：equal masses a=b=[0.5,0.5]，diagonal cost=0、off-diagonal cost=1。ε=1 时 plan≈[[0.366,0.134],[0.134,0.366]]，row/column sums 都为 0.5。Nearest-neighbor 只看各 row；OT 同时看供给与需求。若 target 有一块不在 source slice 中，balanced 假设会强迫配对，需修改 unmatched formulation。",
    compareTo: [
      "knn",
      "spatial-assignment",
      "expectation-maximization",
      "flow-matching",
      "domain-shift",
    ],
  },
  {
    id: "multiple-instance-learning",
    source: {
      label:
        "Ilse, Tomczak & Welling: Attention-based Deep Multiple Instance Learning (ICML, 2018)",
      url: "https://proceedings.mlr.press/v80/ilse18a.html",
    },
    title: "MIL：只有 donor 标签，怎样利用许多 cells 或 patches",
    englishTitle: "Multiple Instance Learning & Attention Pooling",
    category: "representation",
    level: "高级",
    duration: "20 分钟",
    icon: "⧉",
    summary:
      "一个 bag 有许多 instances，却只有一个 bag label。MIL 学习如何汇总 instances 做预测；bag-level success 不直接验证 instance biology。",
    intuition:
      "一份 tissue slide 有许多 patches，只知道整张 slide 的 diagnosis；一个 donor 有许多 cells，只知道这个人的 age。给每个 patch/cell复制同一个标签，会把弱监督假装成强监督。MIL 直接预测整个 bag。",
    core: "输入第 d 个 bag X_d∈R^(C_d×G) 或 patches，经共享 encoder 得 H_d∈R^(C_d×K)。Permutation-invariant pooling 输出 z_d∈R^K，再由 head 输出 bag probability 或 continuous age；bag labels y∈R^D。Attention scores∈R^C_d 经 softmax 得 weights a，z=Σ_c a_c h_c。Ilse 的 binary bag formulation 与 attention pooling 是原始来源；age regression 是同一 pooling思想的任务扩展。Classical binary MIL 的‘至少一个 positive instance’假设不适用于任意 age task，不能机械套用。",
    equation:
      "a_c=softmax_c(wᵀtanh(Vh_c)); z_d=Σ_c a_ch_c; ŷ_d=head(z_d); L=(1/D)Σ_d ℓ(ŷ_d,y_d)",
    mechanicsSteps: [
      "定义 bag=donor、sample/slide 或其它有标签单位，并保持 donor mapping；instance 可为 cells、bins 或 patches，不能混淆独立样本量。",
      "共享 encoder 将 variable-size bag 的 C_d instances 变为 C_d×K embeddings，batch 时用 mask 排除 padding。",
      "先比较 mean/max pooling，再计算每个 embedding 的 learned attention score，并在同一 bag 内 softmax；weights sum=1。",
      "教学 H=[[1,0],[0,2]]、scores=[0,log3] 得 a=[0.25,0.75]，bag embedding z=[0.25,1.5]。交换 instance 顺序同时交换 scores，z 应不变。",
      "Bag head 产生 probability 或 age，loss 与 labels 都只在 bag/donor 层计算；backprop 同时训练 encoder、pooling 与 head。",
      "在 unseen donors 评估，检验 bag size、cell composition、batch 与 attention集中程度；人工 labels 或其它 evidence 才能检验高 attention instance 的生物含义。",
    ],
    whenToUse: [
      "有 donor age、slide diagnosis 等 bag labels，缺少可信 cell/patch-level targets 时。",
      "Pseudobulk mean 可能遗漏 heterogeneity，且有足够 independent bags 支持更灵活的 aggregation 时。",
      "优点是支持 variable bag sizes、共享 instance encoder 与可学习 pooling，不必给每个 cell 强行分配 donor-level label。",
    ],
    limits: [
      "Independent labeled bag 数 D 才决定监督证据；即使每个 bag 有十万 cells，few donors 仍容易过拟合。",
      "Attention 是条件于同 bag 其它 instances 的 aggregation weight，不是 cell class probability、causal importance 或已校准可信度。",
      "模型可能利用 bag size、composition、scanner/batch artifacts；没有 instance labels 时不能仅凭 bag accuracy 声称定位正确 cells。",
    ],
    howToUse: [
      "先构造 donor-level bags 和 labels，检查多 slides/samples per donor 的 grouping 与目标定义。",
      "用 pseudobulk/mean pooling+Elastic Net 或小 head 建 baseline，再试 attention pooling，固定 donor protocol。",
      "训练时以 bag 为采样单位，避免大 bags 隐含占据更多 loss 权重；subsample instances 时记录策略。",
      "变长 bag 使用 valid-instance mask，softmax 与 pooling 都排除 padding；检查置换不变性。",
      "按 donor 做 nested tuning、holdout 与 uncertainty；拆开年龄区间、batch、bag size 与 composition 的 error。",
      "做 mean-versus-attention、encoder frozen-versus-finetuned、instance removal 和 sampling sensitivity；interpretation 另外用 evidence 检验。",
    ],
    tuning: [
      "Encoder capacity 与 labeled bags D 配套；D 小先用 frozen/pretrained embeddings 与小 pooling/head。",
      "Instances per bag 由信息覆盖与 compute budget 决定；比较 stratified sampling，避免 rare states 总被漏掉。",
      "Attention temperature/regularization 可控制过度集中，但更平滑不自动代表更好解释；比较 prediction 与 perturbation stability。",
      "Bag-level loss weighting 预先定义；等 donor 权重与等 cell 权重回答不同目标。",
    ],
    settings: [
      {
        name: "Bag / label unit",
        start: "一个 label 对应一个 donor/slide bag，保存更高层 donor_id。",
        adjust:
          "同 donor 多 slides 时 grouped split，并选择 donor aggregation 或 explicit repeated-sample目标。",
      },
      {
        name: "Pooling",
        start: "Mean/max baseline 与 learned attention，用相同 encoder 比较。",
        adjust:
          "Attention 高分但外部差时检查 composition、batch proxies 和 pooling capacity。",
      },
      {
        name: "Bag sampling / mask",
        start: "固定 instance sampling 与 valid mask，记录各 bag size。",
        adjust:
          "Rare states 被漏掉或 padding 得到 weight 时修正采样与 mask，再评估。",
      },
      {
        name: "Encoder / head capacity",
        start: "小 D 使用低容量 head 或 frozen representations。",
        adjust:
          "Train 很好、donor holdout 差时减小容量并检查 leakage；不单靠增加 cells 解决。",
      },
    ],
    modifications: [
      "有可信 instance labels 时增加 instance supervision，但仍保持 donor grouping 并区分两个 output 的评估。",
      "空间关系对任务必要时，在 pooling 前加入 spatial graph/positional structure；此时需保留坐标与 registration检查。",
      "想表达 cell-type-specific signals 时用 stratified bags 或 hierarchical pooling，比较它是否只学习 cell-type proportions。",
    ],
    pitfalls: [
      "给同 donor 每个 cell 都复制 age 再随机 row split，把 20 donors 伪装成 20,000 independent training targets。",
      "Attention score 高就把 cell 标为‘衰老 cell’；没有 instance-level biological证据时这种结论不成立。",
      "Softmax 没有 masking，padding 或 duplicated cells 改变 bag embedding；重复一个 instance 也会改变权重竞争。",
    ],
    example:
      "教学 toy：一个 donor 的两 cells embeddings 是 [1,0] 与 [0,2]。Scores [0,log3] 给 attention [0.25,0.75]，pooled z=[0.25,1.5]；mean pooling 为 [0.5,1]。Age head 只预测这位 donor 的一个 age。第二个 cell 权重大说明它对当前模型 aggregation 贡献较大，不能直接证明它更老或驱动衰老。",
    compareTo: [
      "pseudobulk-hierarchy",
      "attention",
      "prediction-heads",
      "elastic-net",
      "gnn",
      "nested-group-validation",
    ],
  },
];
