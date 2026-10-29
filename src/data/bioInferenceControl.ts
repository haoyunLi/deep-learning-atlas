import type { Lesson } from "./lessons";

export const bioInferenceControlLessons: Lesson[] = [
  {
    id: "em-objective-diagnostics",
    source: {
      label:
        "Dempster, Laird & Rubin: Maximum Likelihood from Incomplete Data via EM (1977)",
      url: "https://www.jstor.org/stable/2984875",
    },
    title: "EM Diagnostics：每轮到底改善了什么",
    englishTitle: "EM Objectives, Initialization & Degeneracy",
    category: "classical",
    level: "高级",
    duration: "24 分钟",
    icon: "◌",
    summary:
      "从一次可手算的 E/M update 追踪 responsibility、Q 与 observed likelihood，再判断 convergence 是否掩盖了 collapse。",
    intuition:
      "两间实验室的读数混在一起。EM 先给每条读数两张不同权重的归属票，再按这些票更新均值。票变得更坚决，并不说明实验室身份更真实；也可能只是模型把一条读数周围的 variance 缩得过小。",
    core: "输入 X∈R^(N×D)、component count K、initial parameters θ⁰，输出 fitted θ、R∈[0,1]^(N×K) 与 objective trace。Observed log likelihood ℓ(θ)=Σᵢ log Σₖ πₖp(xᵢ|θₖ) 才是 marginal-data 目标；Q(θ|θᵗ)=Σᵢₖrᵗᵢₖ log[πₖp(xᵢ|θₖ)] 在一轮 M-step 中固定旧 R。F(q,θ)=E_q log p(X,Z|θ)+H(q)，且 ℓ=F+KL(q||posterior)。Exact E-step 令 KL=0，M-step 改善同一个 F，因此在相应条件下 ℓ 不下降。不同轮的 Q 使用不同 q，不能只比较裸 Q 判定进步。以下固定 variance 的 GMM 是自建教学例子，不是完整 spatial segmentation model。",
    equation:
      "rᵢₖ=softmaxₖ(log πₖ+log p(xᵢ|θₖ)); Nₖ=Σᵢrᵢₖ; μₖ′=Σᵢrᵢₖxᵢ/Nₖ; πₖ′=Nₖ/N",
    mechanicsSteps: [
      "先写完整的 generative model、可学习参数与固定参数。本例 x=[0,2]，K=2，μ=[0,2]，π=[0.5,0.5]，两个 variance 都固定为 1；不能中途悄悄更新 variance 后继续使用同一数值答案。",
      "计算 log joint scores：对 x=0，去掉共有常数后为 log(0.5)+[0,−2]。用 logsumexp 归一化，得到 r₀=[0.880797,0.119203]；x=2 的两个权重对调。",
      "计算 effective counts：N₁=N₂=1。它们是软权重之和，不是两组各已确定观察到一个 biological cell。",
      "固定这张 R 做 M-step：μ₁′=(0×0.880797+2×0.119203)/1=0.238406；μ₂′=1.761594，π 仍为 [0.5,0.5]。",
      "用新参数重新 marginalize：包含 Gaussian normalizing constant 的 total ℓ 从 −2.970315 升至 −2.886563。对负 log likelihood 则应下降，先核对日志的符号与 total/mean 单位。",
      "重新算 R 后再更新参数；同时记录最小 covariance eigenvalue、每个 Nₖ、component separation 和 seed。若允许自由 covariance，极小 component 可能围住单点使 likelihood 发散。",
      "对同一 toy 若把两个 μ 都初始化为 1，E-step 始终各 0.5，M-step 仍为 1；这是对称 fixed point。换 seed、检查 objective 与 held-out behavior，而非认为再跑更多轮必然拆出两群。",
      "区分 exact EM、Generalized EM 与 Variational EM。后两者要检查实际被改善的 objective；加入 covariance floor、prior 或 heuristic truncation 后，不能无条件套用未正则化 exact-EM 的保证。",
    ],
    whenToUse: [
      "已经懂 EM 基本概念，需要实现、审计或排查 spatial assignment 的 latent-variable update 时。",
      "优点是每个 intermediate quantity 可检查，可将数值错误、initialization 问题与模型失配分开定位。",
      "需要比较多个初值，或发现 training likelihood 变好但 boundary quality 变差时。",
    ],
    limits: [
      "EM 的单调性针对指定 objective；不保证 global optimum、正确 K、可识别的 cell identity 或 calibrated uncertainty。",
      "高维 full covariance 需要大量信息；参数多而 Nₖ 小时容易退化。Regularization 增加稳定性，也改变可得到的解。",
      "Latent posterior 无法解析时，近似 E-step 的误差可主导结果；不能只看 optimizer 的 converged flag。",
      "Mixture labels 可以交换。比较 seeds 时应先对齐 components，不能把编号变化直接当 biological instability。",
    ],
    howToUse: [
      "先在两点 toy 上逐项验证 scores、row sums、Nₖ、means 与 ℓ，再把相同代码路径用于多维数据。",
      "保存 exact configuration、seed、initial parameters、每轮 objective 与 degeneracy diagnostics；用 logsumexp 避免乘积 underflow。",
      "在训练数据确定多个合理 K、covariance families 与重启方案；用预留 sample/region 和外部 boundary evidence 检查选型。",
      "异常下降先查更新顺序、variance/standard deviation 混用、log base、缺失 normalizer 与数值精度。",
      "给 ambiguous units 保留 soft R，并用 registration、features 与 initialization perturbations 检验 downstream aggregation。",
    ],
    tuning: [
      "把同一 objective 的 per-observation gain 与参数变化同时记录；仅 total gain 很小可能只是样本数或日志尺度改变。",
      "先比较 tied/diagonal 与 full covariance；如果 full 解被少量点撑住，减少自由度往往比增加迭代更有效。",
      "重启次数根据 seed-to-seed objective 和 assignment stability 调整；训练 best likelihood 不能替代独立验证。",
      "Variance floor 应相对于 feature units；坐标从 μm 换成 pixel 后原数值 floor 不再等价。",
    ],
    settings: [
      {
        name: "Toy initialization",
        start: "教学 fixture 使用 K=2、μ=[0,2]、variance=1；另试 μ=[1,1]。",
        adjust:
          "实际数据从有意义的 geometry/profile seeds 和多个重启开始；这里没有通用最佳初值。",
      },
      {
        name: "Covariance family / floor",
        start:
          "先记录 standardized feature units，比较 diagonal 与 tied；floor 作为显式配置。",
        adjust:
          "出现 singular covariance 时查 Nₖ 和异常点，再调整 family/floor，并重新评估 fit。",
      },
      {
        name: "Stopping criteria",
        start:
          "教学可试 mean log-likelihood gain 10⁻⁵、max 200 iterations，同时记录是否触顶。",
        adjust:
          "这些是检查起点；随精度、数据尺度与实际 gain 改变，不把固定轮数当已收敛。",
      },
      {
        name: "Restarts / selection",
        start: "教学比较 5 个 seeds 与一个 symmetric seed，保存全部 trace。",
        adjust: "Seed 差异明显时扩展重启并查模型；以独立指标确定可用性。",
      },
    ],
    modifications: [
      "将 component prior 或参数 prior 写进 joint objective 做 MAP-EM，并同时报告 penalty 与 likelihood，避免混淆二者。",
      "为过小 components 设置可审计的 merge/reinitialize 规则；此类 intervention 之后单独标记 objective trace。",
      "若 raw RNA counts 主导输入，转入 Count Mixture 的 observation model；不要仅把 GMM 名字换成 biological cell model。",
    ],
    pitfalls: [
      "M-step 更新一个 component 后立即用新参数更新其它 component 的 R，混成未经推导的更新流程。",
      "把 Q、ELBO、observed log likelihood 与 negative loss 画在同一无标注曲线上。",
      "Responsibility 很接近 0/1 便称为可信 cell boundary，忽略 misspecification 与 collapse。",
    ],
    example:
      "Synthetic arithmetic：x=[0,2]、variance 固定为 1。一轮 R=[[0.880797,0.119203],[0.119203,0.880797]]，μ′=[0.238406,1.761594]，ℓ: −2.970315→−2.886563。若 μ⁰=[1,1]，两个 components 保持重合，ℓ=−2.837877；这个过小且 overlapping 的数据甚至更偏好重合解，说明‘拆成两群’不是 EM 必须实现的事实。自由 variance 下的 singularity 是另一个问题，不能与该 fixed-variance toy 混为一谈。",
    compareTo: [
      "expectation-maximization",
      "gaussian-mixture-model",
      "count-mixture-background",
      "structured-assignment-inference",
    ],
  },
  {
    id: "count-mixture-background",
    source: {
      label:
        "cell2location official model: NB likelihood, sensitivity and additive background",
      url: "https://cell2location.readthedocs.io/en/latest/cell2location.html",
    },
    title: "Count Mixture：把 depth 与 ambient RNA 放进模型",
    englishTitle: "Count Mixtures, Exposure & Ambient Background",
    category: "classical",
    level: "高级",
    duration: "26 分钟",
    icon: "▥",
    summary:
      "把单一 latent class、多个 cell types 的混合贡献、ambient contamination 分开；它们产生不同的 likelihood 与 output。",
    intuition:
      "同样录到 10 个声音片段，可能来自更吵的一个人、更长的录音时间，或背景广播。RNA count 也同时受 expression、capture depth 与 ambient 影响；先说明每个来源如何相加，才能讨论归属。",
    core: "输入 Y∈N₀^(B×G) 的 raw counts、exposure s_b、reference profiles 与候选空间关系。单一 class mixture 为 z_b∼Categorical(π)，Y_bg|z_b=k∼Poisson(s_b φ_kg)；输出 class responsibilities。若一个 spot 包含多类 cells，应考虑 additive mean μ_bg=s_b Σₖa_bk φ_kg+β_bg，输出 abundance a，而不是强迫一个 z。NB 可增加 overdispersion。cell2location 是带技术效应、additive background 和 abundance priors 的 Bayesian NB model，使用 approximate Variational Inference；本课简化 Poisson toy 并非该软件的 EM 实现。Background/unassigned class 表示整个 unit 的归属，within-unit ambient fraction 则表示其 counts 来源，不能互换。",
    equation:
      "r_bk ∝ πₖ∏g Poisson(Y_bg;s_bφ_kg); contaminated profile p_bg=(1−α_b)φ_kg+α_b b_g; μ_bg=s_b p_bg",
    mechanicsSteps: [
      "先确认 observed unit：isolated cell、multi-cell spot 或可能跨 boundary 的 bin。保存 raw count layer、gene order、coordinates 与 sample ID；log-normalized 值不是同一 count observation。",
      "定义 exposure 与 profile 的尺度。若 φ 和 background b 都为 gene proportions，则各自 sum=1，s 为 expected total count；若 φ 为每 cell expression rate，则 exposure/abundance 的定义需要重新写清。",
      "从 Poisson mixture 手算 class evidence：单 gene λ_A=1、λ_B=5、equal priors 时，B/A posterior odds=e⁻⁴5ʸ。y=0 得 P(B)=0.017986；y=2 得 0.314078。零也是证据，不能全部删去。",
      "按 log likelihood 跨 genes 求和，再用 logsumexp 求 R。独立 Poisson 假设只是起点；若 residual variance 大于 mean，比较 NB，并检查 residual correlation 与 batch effects。",
      "只有在无 background 且 exposure 已知的简单 Poisson model，M-step 有 φ_kg′=Σ_b r_bkY_bg / Σ_b r_bk s_b 的 rate update。添加 proportions sum constraint 或其他 priors 后需要相应重推更新。",
      "另一个可交互教学 model 是 molecule-source mixture：固定 source gene profiles φ_kg，observed gene counts y_g，对每个 gene 算 r_gk=πₖφ_kg/Σ_jπ_jφ_jg，再更新 πₖ′=Σ_gy_gr_gk/Σ_gy_g。这里 R 的 row 是 gene category，π 是 molecule-source fraction，不是整个 bin 属于 cell k 的 posterior。无 prior 的 multiplicative update 中 πₖ=0 会一直为 0，需要正初始化才能让 source 参与竞争。",
      "加入 ambient toy：cell profile φ=[0.9,0.1]、background b=[0.2,0.8]、α=0.2、s=10，则 μ=10×[0.76,0.24]=[7.6,2.4]。第二 gene 的 expected 2.4 counts 中，1.6 来自 ambient，不能全部当 cell identity marker。",
      "区分 latent source allocation 与真实分子标签。Soft assignments 给出条件 expectation，不能把 fractional corrected counts 说成直接观测的整数，也不能沿用原 count likelihood 而忽略其不确定性。",
      "在独立 samples 检查 library size、zero frequency、gene residuals 与 negative-control regions；改变 reference completeness、background estimate 与 exposure 假设，观察 abundance/assignment 是否稳定。",
    ],
    whenToUse: [
      "Single-cell/Spatial 输入是 UMI counts，需要解释 low-count uncertainty、depth effects 与 background 时。",
      "优点是 observation process 与 units 明确；可以把 expected expression、sampling variability 与 contamination 分开检查。",
      "一个 spot 确实含多类 cells 时，选择 additive deconvolution；每个 unit 合理来自单一 component 时才使用 categorical mixture。",
    ],
    limits: [
      "相似 reference profiles、缺失 cell types 与 ambient profile 重叠时，abundance 与 contamination 可能不可识别；多跑 epochs 不增加独立证据。",
      "Poisson 的 mean=variance 可能过强；NB dispersion 也不能自动修复错误 reference、registration 或 assay panel bias。",
      "自由 exposure 与自由 abundance 可相互缩放；需要 normalization、offset、reference calibration 或 prior 来确定尺度。",
      "GMM on PCA embeddings 可是有用的 clustering baseline，但其 density 不是 raw-count likelihood，二者 uncertainty 含义不同。",
    ],
    howToUse: [
      "写一张 observed unit、raw matrix layer、exposure definition、latent variables、output units 的数据说明。",
      "从 known-background synthetic counts 检查 recovery，再比较无 background、固定 background 与估计 background 的 ablation。",
      "从技术或空间 negative controls 估计 background 时，确认这些区域确实具有可比 capture process；不直接套用任意 empty region。",
      "用 held-out samples 和 posterior predictive/residual checks 对比 Poisson/NB；把 raw-count fit 与 biological correctness 分别报告。",
      "导出 expected abundance、responsibilities 与 uncertainty，附带 reference version 和参数；不要只交一张 hard cell-type map。",
    ],
    tuning: [
      "先查 exposure 与 gene ordering，再调 optimizer；两个 genes 顺序错位能产生很自信却相反的 assignment。",
      "Dispersion 参数化必须写清：本网站使用 Var=μ+μ²/θ；θ 越大越接近 Poisson。",
      "Background fraction 上界和 prior 要有 assay evidence，过强会擦掉真实表达，过弱会把 ambient 当 cell signal。",
      "Reference 的稀有 type 可先做合并/缺失敏感性分析，不以训练 fit 最好为唯一筛选条件。",
    ],
    settings: [
      {
        name: "Observation layer",
        start:
          "Poisson/NB 使用非负整数 raw counts；embedding baseline 保留独立预处理说明。",
        adjust:
          "输入只有 normalized matrix 时先找 raw layer；不能通过四舍五入恢复原 sampling process。",
      },
      {
        name: "Exposure / normalization",
        start: "Toy 固定 s=10；真实场景记录 depth、profile units 与总量约束。",
        adjust:
          "Abundance 与 depth 高度共变时，检查尺度不可识别以及 detection efficiency 假设。",
      },
      {
        name: "Ambient fraction α",
        start:
          "教学对比 α=0、0.1、0.2；仅作 sensitivity grid，不是任何 assay 的推荐比例。",
        adjust:
          "用 negative controls 与已知 marker absence 核查；α 增大导致全部 cells 趋同时警惕过校正。",
      },
      {
        name: "Likelihood / dispersion",
        start:
          "比较简单 Poisson 与明确参数化的 NB，先画 mean–variance residuals。",
        adjust:
          "NB 仍失配时查 batch、unmodeled types 与 feature dependence，不能只增加 dispersion。",
      },
    ],
    modifications: [
      "将 gene-wise independent Poisson 换为 conditioned-on-total Multinomial，可突出 composition，但会改变利用 total count 的方式。",
      "Multi-cell locations 使用 additive abundance model；分清 normalized proportions、expected cells 与表达 contribution。",
      "对 unseen cell type 设置 unknown/background 通道并核查其含义，避免强制投到最相似的已知 class。",
    ],
    pitfalls: [
      "把 ambient fraction、mixture class probability 与 spot cell-type proportion 当同一个 α。",
      "Cell2location 用 NB 就称它是 GMM 的直接 EM 替换版；其 model 与推断算法都更复杂。",
      "训练和验证使用同一批 markers 来决定 background 并证明 identity，造成 circular evidence。",
    ],
    example:
      "Synthetic two-gene cell：φ=[0.9,0.1]，b=[0.2,0.8]，s=10。α=0 时 expected counts=[9,1]；α=0.2 时=[7.6,2.4]。第二 gene 的 increase=1.4 并不意味着 cell 改变 type，而是 ambient 的 1.6 加上 retained cellular signal 0.8。若将 cell library depth 加倍且其余不变，means 同时加倍；不要让 class assignment 只学到 depth。",
    compareTo: [
      "count-likelihoods",
      "scvi",
      "em-objective-diagnostics",
      "spatial-assignment",
      "calibration-uncertainty",
    ],
  },
  {
    id: "structured-assignment-inference",
    source: {
      label: "SciPy official documentation: linear_sum_assignment",
      url: "https://docs.scipy.org/doc/scipy/reference/generated/scipy.optimize.linear_sum_assignment.html",
    },
    title: "Structured Assignment：一处归属会限制另一处",
    englishTitle: "Coupled Assignments, Feasibility & Structured Inference",
    category: "classical",
    level: "高级",
    duration: "25 分钟",
    icon: "⇄",
    summary:
      "从独立 softmax 走到受约束的 joint configurations，分清 marginal posterior、MAP solution 与 fractional transport。",
    intuition:
      "两位学生都最想去 A 实验室，但 A 只有一个名额。不能让每个人各自 softmax 后宣布问题解决；一个人的选择改变另一个人的可选结果。Cell capacity、unmatched 和 boundary continuity 也需要在共同可行空间里表达。",
    core: "输入 local log scores L∈R^(B×K)、candidate mask 与 feasible set F，输出可以是 hard assignment z*、joint posterior 或 marginals R，三者不同。若 z 独立，posterior factorizes；加入 capacity/adjacency 后 p(z|X,F)∝1[z∈F] exp(Σ_b L_b,z_b+pairwise terms)，normalizer 遍历合法 configurations。按 row softmax 再裁剪通常不是该 joint posterior 的 E-step。Linear assignment 求一一对应的最优总 cost；min-cost flow 可表达某些 capacities，pairwise continuity 常使问题不再是普通 linear assignment。",
    equation:
      "z*=argmax_(z∈F) Σ_b L_b,z_b; p(z|X,F)∝1[z∈F]∏_b p_b,z_b; R_bk=Σ_(z:z_b=k)p(z|X,F)",
    mechanicsSteps: [
      "先定义 capacity 的单位：cells、bins、面积还是 transcript mass。Cell 可以接收很多 transcripts，一一对应只是本课两单位 toy，不是普遍 biological constraint。",
      "建立候选表与 explicit unassigned option，检测空 candidate rows、容量不足以及互相冲突的规则。可行性检查应在优化之前完成。",
      "Toy local probabilities 为 bin1=[0.6,0.4]、bin2=[0.9,0.1]。独立 argmax 得 A,A；独立 soft R 的 A 总 mass=1.5，若容量为 1 就不满足约束。",
      "若要求两个 bins 各去一个不同 cell，合法 configurations 仅 AB、BA。其 unnormalized joint weights 分别 0.6×0.1=0.06、0.4×0.9=0.36。",
      "归一化后 P(AB|F)=1/7，P(BA|F)=6/7。因此 bin1 的 A marginal 从 0.6 降至 1/7；global competition 改变了 uncertainty，而非仅将最后一项硬改标签。",
      "MAP 是 BA，因为 0.36>0.06。若把 local probabilities 当 likelihood factors，MAP 应最大化 sum log p，不应任意换成 sum p；不同 scoring objectives 可能选不同结果。",
      "在 EM 中，真实 E-step 必须给当前 structured model 所需的 posterior expectations。若只取 MAP configuration，是 hard/Classification EM 类更新；若用 mean-field 或 relaxation，要标记 approximation 与实际优化的 bound。",
      "扩大数据时选择 linear assignment、flow、OT、factor graph inference 或 integer programming；同时报告 solver residual/gap、constraint violations、unassigned fraction 与 runtime。",
    ],
    whenToUse: [
      "许多 units 竞争有限 candidates、存在已知 capacities，或者希望显式处理 unmatched 时。",
      "优点是把 infeasible output 排除在外，能解释一个 assignment 怎样影响其他 units。",
      "调试‘每个 row 都合理，但整体出现重复占用或不可能区域’的 spatial model 时。",
    ],
    limits: [
      "Incorrect constraints 会把真实答案排除；optimization 最优只说明在给定 F 内最好。",
      "Exact joint posterior 可有指数级 configurations；MAP、marginals 与 entropy regularization 通常不能互相替代。",
      "容量约束不保证区域 connected 或 boundary 合理；pairwise smoothness 也可能吞掉稀有小 cells。",
      "SciPy linear_sum_assignment 是 modified Jonker–Volgenant implementation；不能把接口名字理解为支持任意 spatial constraints。",
    ],
    howToUse: [
      "把任务写成 table：unit、candidate、score、capacity、unassigned、connectivity；逐项说明证据来源。",
      "对 2×2 或 3×3 tiny case 枚举合法 assignments，分别核对 exact MAP 和 posterior marginals。",
      "先跑 independent baseline，再加单个 constraint 做 ablation；量化它排除了多少 candidate truth 或产生多少 unmatched。",
      "检查每行 conservation、每列 capacity 和 illegal edge mass；soft rounding 后必须再次验证 constraints。",
      "用独立 boundaries/regions 检查结果，并输出 ambiguous alternatives；比较附近 radius、capacity 与 penalty 改变的 sensitivity。",
    ],
    tuning: [
      "Candidate radius 过小会造成无解，过大让表达相近的远处 cells 竞争；先按物理尺度与 registration error 调整。",
      "Unassigned penalty 太高强迫错误归属，太低让所有难例退出；用 labeled ambiguous regions 与 coverage–quality curve 检查。",
      "Capacity 是科学假设，优先做成像/面积敏感性分析，不能为 solver 易收敛随意设成平均数。",
      "Pairwise weight 增大可能改善 smoothness 也可能合并真实边界；分别评估 split、merge 与 small-cell recall。",
    ],
    settings: [
      {
        name: "Feasible set F",
        start:
          "Toy 用一一对应；真实 bins/transcripts 明确 many-to-one 或 mass capacity。",
        adjust: "出现大量 forced assignment 时先重新检查 correspondence 假设。",
      },
      {
        name: "Score semantics",
        start:
          "标记 log likelihood、distance cost 或 heuristic score，不把它们都叫 posterior。",
        adjust:
          "改变 scale/temperature 会改变 optimum 或 softness，需重新检查 score calibration。",
      },
      {
        name: "Unassigned option",
        start:
          "显式 dummy/background channel，定义它消耗的 capacity 与 penalty。",
        adjust:
          "对 threshold 做预先定义的 sensitivity；报告拒绝率和保留部分的质量。",
      },
      {
        name: "Solver accuracy",
        start:
          "Small case 用 exact enumeration；大 case 保存 tolerance、time limit 与 feasible status。",
        adjust:
          "达到 time limit 不等于 optimal；有 gap 时报告 incumbent 与 bound。",
      },
    ],
    modifications: [
      "Fixed additive edge costs 与 integer capacities 可考虑 min-cost flow；一一对应只是特殊情况。",
      "允许 fractional mass 时使用相应 OT formulation，但 transport softness 不自动等于 structured posterior。",
      "增加 connectivity/topology constraints 前先定义 biological exceptions；可用 graph-based regularization 或更复杂 discrete solver。",
    ],
    pitfalls: [
      "独立 R 按列归一化一次后便称为精确 constrained E-step，没有验证 row sums 或 joint model。",
      "用最大 probability 的 hard label 宣称 uncertainty 已消失；MAP 只是选择一个 configuration。",
      "对每个 cell 设置同一 transcript count capacity，把真实 cell size/表达差异强行磨平。",
    ],
    example:
      "Synthetic capacity toy：local R=[[0.6,0.4],[0.9,0.1]]。Condition on one unit per cell 后，只有 AB 与 BA；probabilities=1/7 与 6/7，exact marginals=[[1/7,6/7],[6/7,1/7]]，列和均为 1。MAP 为 BA。这个 1/7 来自明确的 joint model 与 constraint，不等于随意调低 softmax temperature 的效果。",
    compareTo: [
      "spatial-assignment",
      "optimal-transport",
      "em-objective-diagnostics",
      "spatial-mdp-design",
    ],
  },
  {
    id: "spatial-mdp-design",
    source: {
      label:
        "Sutton & Barto: Reinforcement Learning, finite MDPs (author textbook draft)",
      url: "https://web.stanford.edu/class/psych209/Readings/SuttonBartoIPRLBook2ndEd.pdf",
    },
    title: "Spatial MDP：什么时候值得把 assignment 做成决策",
    englishTitle: "Spatial MDP Design versus Static Optimization",
    category: "reinforcement",
    level: "高级",
    duration: "25 分钟",
    icon: "↝",
    summary:
      "先画出 action 改变哪些 future options，再决定需要 RL、planning、contextual bandit，还是直接求 static optimum。",
    intuition:
      "拿到完整排座位表时，可以一次把座位排好；若每次查看一个房间都会花预算、揭示新信息，并改变下一次该去哪，才出现真正的 sequential trade-off。把 for-loop 叫 episode 并不会自动增加 RL 的价值。",
    core: "输入是 environment specification (S,A,P,r,γ,H)、initial-state distribution 与 observations；输出是 policy π(a|s) 或 π(a|history)，不是 latent cell posterior。Spatial research 中可研究 sequential review、有限 imaging budget 或 learned local-search policy。Static cost matrix 即使有 capacity coupling，仍可用 global optimization。人工把 static solver 写成逐步动作可以形成 computational MDP，但 RL 的价值需靠跨实例的 speed/quality trade-off 证明，不能宣称组织本身发生了 causal biological transitions。",
    equation:
      "G₀=Σ_(t=0)^(H−1)γᵗr_t; Qπ(s,a)=E[r+γVπ(s′)|s,a]; Markov: P(s′,r|history,a)=P(s′,r|s,a)",
    mechanicsSteps: [
      "先写最终 output 和可直接计算的 objective。若所有 costs、constraints 与 observations 已知，先运行 assignment/flow/OT/local search；保留 equal-compute baseline。",
      "定义 action 真正改变什么：move/reassign、split/merge、request annotation、acquire image 或 stop。每个 action 要给出 preconditions、cost 与 valid-action mask。",
      "定义 state 为足以预测 next transition/reward 的信息：当前 assignment、remaining capacity、候选 scores、已知 evidence、remaining budget 和 time。只给当前 bin embedding 常会遗漏历史。",
      "检查 Markov aliasing：同一 bin feature 在 A capacity=0 与 capacity=1 时，可行动作不同；若 observation 相同却不含 remaining capacity，memoryless policy 看不到决定性区别。",
      "写 deterministic 或 stochastic transition：reassignment 后更新哪些 profiles/scores，是否允许 undo，是否有新的 measurement。固定数据 local search 与真实 acquisition environment 要分别命名。",
      "定义 reward timing 和 termination。Toy 中 action A 立即给 3 并结束；action B 先给 0、下一步给 5。γ=0.9 时 A return=3，B=4.5；γ=0.5 时 B=2.5，ranking 反转。",
      "先对 tiny deterministic environment 枚举或 dynamic programming 求最优值，验证 reward、mask、stop 与 reset；不能依赖一个 PPO training curve 证明 environment 正确。",
      "再学 policy，分开报告训练环境 return、unseen donor/slide return、constraint violations、external boundary quality 与 wall-clock cost。若 policy只加快优化，明确把 claim 限定为 solver behavior。",
    ],
    whenToUse: [
      "Actions 影响后续信息、预算或可选动作，并存在可测试的长期收益时。",
      "大量类似 assignment instances 需要快速重复求解，可研究 amortized policy，并与强 static/heuristic solvers 比较。",
      "优点是能在明确 environment 中处理 delayed credit 与 adaptive actions；前提是 transition 与 reward 可被验证。",
    ],
    limits: [
      "RL 不消除错误 objective；reward 与 biology 不一致时，学得更好可能放大错误。",
      "Simulator 缺少真实 registration、cell-type 或 tissue variability 时，高 return 不代表新 slide 上有效。",
      "Combinatorial action space、long horizon 与 expensive transitions 会让 RL 比直接优化更慢且不稳定。",
      "Action probability 描述 policy 的选择倾向，EM responsibility 描述 model 下的 latent posterior，不能互换作 assignment confidence。",
    ],
    howToUse: [
      "写一页 environment contract：observations、state、actions、transition、reward、constraints、termination、reset 与随机性。",
      "给每种 action 构造至少一个合法、一个非法、一个 terminal tiny case，并验证更新后的所有 bookkeeping。",
      "建立 no-op、greedy、static optimum（小例）与 fixed-budget local-search baselines；比较 quality–runtime frontier。",
      "按 donor/slide 划分 environment instances，保留 final test 的实例分布与 reference labels。",
      "记录 trajectories 和 reward components，检查 policy 是否反复撤销、利用 stop rule 或只挑容易的 regions。",
    ],
    tuning: [
      "γ 改变偏好的时间尺度；若目标是固定 episode 的 undiscounted final quality，可明确比较 γ=1 的有限 horizon formulation。",
      "H 与 action granularity 共同决定可达解：只允许单步 move 的短 episode 可能无法绕开局部瓶颈。",
      "Mask 必须在 sampling 与 policy likelihood/update 中一致，否则 PPO ratio 等量会对应不同动作空间。",
      "先固定 environment 版本，再调 PPO/SAC 等 learner；随训练改 reward 或 candidate rules 会改变问题。",
    ],
    settings: [
      {
        name: "State / observation",
        start:
          "包含 assignment、capacity、budget、time 与可用 evidence；先用 tiny full-state environment。",
        adjust:
          "历史不同但 observation 相同导致冲突时补 state、history 或 belief，不只加深 network。",
      },
      {
        name: "Horizon / discount",
        start: "教学比较 H=2、γ=0.5/0.9/1，并显示各 action return。",
        adjust:
          "真实配置由延迟收益和计算预算决定；调 γ 不能继续声称优化原来相同的目标。",
      },
      {
        name: "Action granularity",
        start: "先用小候选集的 move 与 stop；记录每步 computational cost。",
        adjust:
          "加入 split/merge 前定义合法性及更新规则，并重验可达解和 baseline。",
      },
      {
        name: "Termination / truncation",
        start:
          "区分 task terminal、budget exhaustion 与训练 time-limit truncation。",
        adjust:
          "是否 bootstrap value 取决于原任务定义；不要把所有截断一律当 terminal。",
      },
    ],
    modifications: [
      "每次决策没有后续状态影响时，改为 supervised ranking 或 contextual bandit，减少不必要的 credit assignment。",
      "Transition model 已知且状态小，用 planning/dynamic programming；learned policy 不一定是第一选择。",
      "Partial observations 可引入 recurrent state 或 belief；这并不保证未记录的生物信息已经可恢复。",
    ],
    pitfalls: [
      "因为 EM 迭代多轮就说它也是 RL；EM 的迭代是 inference/optimization 更新。",
      "把 algorithm state 中的 reassign action 当成细胞真的迁移或发生 biological intervention。",
      "Reward 值比 baseline 高，却没有比较相同 compute budget 与 independent quality。",
    ],
    example:
      "Synthetic two-step choice：A=[3,terminal]，B=[0,5,terminal]。γ=0.9 时 G(A)=3、G(B)=4.5；γ=0.5 时 G(B)=2.5。若所有 transitions 已知，枚举即可得到答案。这用于验证 MDP specification；只有在大量更复杂实例、信息获取或学习 dynamics 的条件下，才继续测试 RL 的实际收益。",
    compareTo: [
      "reinforcement-learning",
      "structured-assignment-inference",
      "model-based-rl",
      "safe-rl-pomdp",
      "reward-shaping-constraints",
    ],
  },
  {
    id: "reward-shaping-constraints",
    source: {
      label:
        "Ng, Harada & Russell: Policy Invariance under Reward Transformations (1999)",
      url: "https://ai.stanford.edu/~ang/papers/shaping-icml99.pdf",
    },
    title: "Reward Design：得分、约束与 biological truth 分开",
    englishTitle: "Reward Decomposition, Potential Shaping & Constraints",
    category: "reinforcement",
    level: "高级",
    duration: "24 分钟",
    icon: "⚖",
    summary:
      "用可手算的 telescoping return 理解 potential shaping，再追踪 penalty、hard constraints 与 reward hacking 的边界。",
    intuition:
      "完成一份正确的拼图才是目标，但为了知道中间有没有进步，可以给过程提示。若每次把同一块拿起再放下都得分，agent 就会不停循环。过程奖励必须与真正目标的关系写清楚。",
    core: "输入 base reward r、constraints/cost c、potential Φ 与 discount γ，输出用于训练的 shaped reward r′及分别记录的 base return/cost。Potential-based term F(s,a,s′)=γΦ(s′)−Φ(s) 在相应 MDP 条件下保持 optimal policy；finite episodic return 额外出现 γ^HΦ(s_H)，通常将所有 terminal potentials 设为 0 以消除该项。这个保证针对原 reward 的 policy ranking，不保证原 reward 代表正确 biology，也不保证 function approximation 和有限训练找到最优策略。",
    equation:
      "r′_t=r_t+γΦ(s_(t+1))−Φ(s_t); G′₀=G₀−Φ(s₀)+γ^HΦ(s_H); maxπ J_r subject to J_c≤d",
    mechanicsSteps: [
      "列出科学评价目标与可见 proxies：boundary agreement、unassigned rate、count conservation、smoothness、runtime 等。标记哪些参与训练，哪些保留作独立 validation。",
      "拆分 reward components 并记录 units。把 expression score 从 total 改成 mean 会改变权重含义；先统一尺度，再讨论 weights。",
      "定义不能交易的规则，如禁止 illegal candidate 或负 capacity；可在 environment/mask 中强制执行。有限 penalty 不等于硬保证，期望 cost constraint 也不等于每条 trajectory 都满足。",
      "为 sparse final reward 选择固定 potential Φ，显式使用与 return 相同的 γ；不要把任意 progress bonus 都叫 policy-invariant shaping。",
      "Synthetic path：γ=0.9，Φ(s₀)=2、Φ(s₁)=3、Φ(terminal)=0，base rewards=[0,5]。Shaping terms=[0.7,−3]，shaped rewards=[0.7,2]。",
      "计算 G=0+0.9×5=4.5，G′=0.7+0.9×2=2.5=G−2。对同一 initial state 的合法 episodes，terminal potential 为 0 时差值一致，ranking 保持。",
      "若漏掉 γ 而用 Φ(s′)−Φ(s)，上述 terms 变为 [1,−3]，G′=2.8；一般不再只是固定常数偏移。若 terminal potential 随结局不同或 truncation 处理错误，也可能改掉目标。",
      "做 reward-hacking tests：循环 move/undo、拒绝全部难例、把大 cell 切成小块提高 purity、只保留 marker 强的 bins。分别查看 base return、cost、coverage 和外部 boundary quality。",
    ],
    whenToUse: [
      "Spatial local-search/annotation policy 的 reward 稀疏，需要更明确的中间反馈时。",
      "优点是可将 training signal 与目标回报的关系推导清楚，并让 constraints 可审计。",
      "训练 reward 上升而 assignment coverage、small-cell recall 或真实 boundary 变差时。",
    ],
    limits: [
      "Potential shaping 保持的是指定 base reward 的 optimal policy；错的 proxy 仍然错。",
      "Learned/changing Φ、partial observability 或不一致 terminal 处理需要单独分析，不能直接引用标准固定-potential结论。",
      "大 shaping scale 仍会影响梯度、value targets 与优化稳定性，尽管理论 policy ranking 可能保持。",
      "Lagrangian penalty 与 expected constraint 在有限样本训练中不保证逐条 trajectory 可行。",
    ],
    howToUse: [
      "先冻结一版 base reward 与外部评价，给每一项写公式、方向、单位、range 与可能被利用的 loophole。",
      "用两条不同 paths 到 terminal 的 tiny examples 检查 telescoping identity 与 policy ranking。",
      "为 illegal actions 使用显式可行性规则；保留合法 stop/fallback，并确保全 mask 情况有定义。",
      "做 base-only、shaping-only diagnostic 与 combined reward ablation，比较 learning speed 和最终 base performance。",
      "在 unseen tissue/slide 上展示 reward components 与 independent biological evidence，不能只选最好看的 spatial map。",
    ],
    tuning: [
      "Reward weights 先按组件数值范围检查，防止数量多的 genes/bins 自动支配 objective。",
      "Potential scale 可从与典型 base return 同量级的教学值开始，监测 critic error/advantage scale，而非只看速度。",
      "Constraint threshold 来自 task definition；不能为提升 return 静默放宽容量或丢弃难例。",
      "改变 γ、horizon、terminal handling 后重验 shaping 公式；这些一起决定 telescoping 边界项。",
    ],
    settings: [
      {
        name: "Base reward / external metric",
        start:
          "分别存 raw components、weighted sum、coverage 与独立 boundary metrics。",
        adjust:
          "Reward 和外部指标背离时改 objective 或证据，不用更大 learner 掩盖。",
      },
      {
        name: "Potential Φ",
        start: "教学固定 Φ=[2,3,0]，γ=0.9，terminal Φ=0。",
        adjust:
          "实际 Φ 需对应可解释 progress；改变 Φ 的时间依赖性要重新审查保证。",
      },
      {
        name: "Hard constraints / cost",
        start:
          "将 impossible actions mask；可容忍 trade-off 的 cost 单独记录。",
        adjust: "任何 violation 都按定义检查；有限 penalty 不能宣称零违规。",
      },
      {
        name: "Reward scale",
        start: "画各 component 分布；教学先尝试同量级，非生物学通用 defaults。",
        adjust:
          "梯度或 critic 不稳定时调整 normalization/scale，并保留原始单位下的报告。",
      },
    ],
    modifications: [
      "计算预算可作为独立 cost 或明确 step penalty，但 step penalty 会改变偏好，不是自动 policy-invariant。",
      "允许 abstention 时同时优化或报告 coverage，防止通过拒绝全部难例得到虚假的高 accuracy。",
      "用 independent labels 或 orthogonal imaging 检查 reward proxy；参与 reward 的 markers 不能再作为唯一独立验证。",
    ],
    pitfalls: [
      "每减少一次局部 distance 都给正 bonus，却不扣除倒退动作，让循环可获利。",
      "把所有 terminal states 设置不同 potential，却声称 episode reward ranking 一定不变。",
      "只报告 combined reward，看不到 capacity violation 被另一个巨大正项抵消。",
    ],
    example:
      "Synthetic shaping identity：base=[0,5]，γ=0.9，Φ=[2,3,0]。F=[0.7,−3]，shaped=[0.7,2]，base return=4.5、shaped return=2.5。二者差 −2 来自相同初态的 potential。若一个 illegal merge 多拿 100 expression points，而 penalty 仅 10，总 reward 仍增加 90；这说明 penalty 可以被交易，必须按真实要求区分 hard constraint。",
    compareTo: [
      "spatial-mdp-design",
      "ppo",
      "reward-model",
      "safe-rl-pomdp",
      "spatial-policy-ope",
    ],
  },
  {
    id: "spatial-policy-ope",
    source: {
      label:
        "Jiang & Li: Doubly Robust Off-policy Value Evaluation for Reinforcement Learning (2016)",
      url: "https://proceedings.mlr.press/v48/jiang16.html",
    },
    title: "Spatial Policy Audit：旧日志能回答新策略吗",
    englishTitle: "Spatial Offline Policy Audit, Support & Environment Shift",
    category: "reinforcement",
    level: "高级",
    duration: "26 分钟",
    icon: "▤",
    summary:
      "针对 Spatial pipeline 审计 propensity、candidate mask、sample unit 与 environment version；分清 replay、OPE 和真实新数据验证。",
    intuition:
      "过去的标注员只看了最容易的区域。新策略想查看边界模糊的区域，旧平均分无法告诉你会发生什么。给旧记录乘权重能纠正已记录的选择差异，不能补出从未发生的动作结果，也不能修复换了相机后整个测量机制的变化。",
    core: "输入是完整 logged episodes：decision-time observation/history、candidate mask、action、实际 behavior propensity μ、reward、next observation、terminal/truncation、slide/donor 与 environment version；输出是固定 target policy π 在明确 initial distribution、H、γ 与 reward definition 下的 value estimate 和支持诊断。Offline RL 学 policy；OPE 评估 policy。重新运行可完全重算的 static objective 是 direct computational evaluation，不必伪装成 OPE；新 imaging/annotation action 的未知结果才产生真正 counterfactual 缺口。",
    equation:
      "ρ_t=π(a_t|h_t)/μ(a_t|h_t); W_t=∏_(j=0)^tρ_j; V̂PDIS=N⁻¹Σ_iΣ_tγᵗW_it r_it; ESS=(Σ_iW_i)²/Σ_iW_i²",
    mechanicsSteps: [
      "先固定评估对象：同一 tissue distribution 的新 policy、换了 panel 的 pipeline，还是新 donor 的 generalization。Policy change 与 environment/domain shift 是不同问题。",
      "审计日志 schema：保存 action 前的 history、mask、策略版本与实际 propensity。过滤 illegal actions 后的 renormalized probability 才是 sampling probability；原始 logits 或全局 action frequency 不足以替代。",
      "检查 target support：只要 π(a|h)>0，就需要 μ(a|h)>0 及实际覆盖。一个旧 deterministic nearest-cell policy 对其他 actions 的 propensity 为 0；给分母加 ε 不会创造 evidence。",
      "Synthetic one-step fixture：μ(A)=0.25、π(A)=0.5，A reward=4、B reward=1；四条 logs 恰有 A 一条、B 三条。Weights 为 [2,2/3,2/3,2/3]。",
      "计算 raw logged mean=(4+1+1+1)/4=1.75；IPS=(2×4+3×(2/3)×1)/4=2.5，与此 toy 的真实 target value=0.5×4+0.5×1=2.5 一致。这是特定合成 fixture，不是四条数据普遍精确。",
      "计算 ESS=4²/[2²+3×(2/3)²]=3。多步若每步 ratio=2，五步 cumulative weight=32；trajectory 数很多也可能只有少量有效支持。",
      "DR/FQE 引入 outcome/Q model 可降低某些 variance，但需 coverage、可识别性与有效建模；分别评估独立 nuisance models 与 policy。缺失人工决策依据或 phenotype history 可能破坏常规 OPE 假设。",
      "按独立 slide/donor 分组评估与重采样，保存 whole episodes；同一 slide 的重叠 crops 或相邻 steps 不提供同样数量的独立重复。",
      "如果 registration、segmentation candidates、panel、reward implementation 或 measurement quality 变了，action propensity weighting 不再单独纠正 transition/reward shift。进行新环境 direct validation 或明确 transport assumptions，不能继续报告旧环境 OPE 为上线事实。",
    ],
    whenToUse: [
      "已有带随机化与真实 propensity 的 annotation/acquisition logs，想评估固定候选策略时。",
      "优点是把支持缺口和不确定性变成可报告结果，能阻止高 reward 外推被误当已验证收益。",
      "Offline RL/CQL 训练后需要独立审计，或者旧 policy、mask 与 environment 版本混合在同一数据库时。",
    ],
    limits: [
      "无支持动作的 value 通常不能由现有 logs 识别；模型预测只是在额外假设下外推。",
      "Action weighting 主要改变 policy distribution，不能自动修复换 donor/tissue、registration 或 reward definition 导致的 environment shift。",
      "少量 independent donors、extreme weights 与 adaptive policy selection 可使普通 bootstrap 区间失真或过于乐观。",
      "DR 的稳健性依赖具体条件，不意味着 propensity 与 outcome model 都错也没关系；replay agreement 也不证明真实 biology。",
    ],
    howToUse: [
      "先判断是否真需 OPE：可直接重算的 deterministic assignments 在固定 data 上运行所有候选 policy，并标记这是 computation evaluation。",
      "对真正 sequential logs 冻结 policy 与 reward version，检查概率归一化、mask、一致 action ID 和 termination flags。",
      "先画 support、ratio、cumulative weight 与 donor-level ESS；无法支持的 regions 单独列出，不只给总体平均。",
      "将 policy learning、nuisance fitting、policy selection 与 final audit 分开；cross-fitting 保留 donor/episode 结构。",
      "对比 IPS、self-normalized IS 与合适 DR/FQE，报告 clipping sensitivity 与 estimator disagreement。",
      "有可信 environment 时做独立 rollouts；真实新 measurements 仍需受控采集与外部质量验证，区分已观测结果和拟合预测。",
    ],
    tuning: [
      "限制 target policy 远离 behavior 可改善支持，但会限制可尝试策略范围；这是一项明确 trade-off。",
      "Clipping 限制 variance 同时引入 bias，不能把 clipped confidence interval 当无偏保证。",
      "H/γ 降低会缩短重加权链，但同时改变 estimand；只报告有实际意义的任务时间尺度。",
      "按 tissue region/rare cell/ambiguous boundary 分层查 support，整体 ESS 好不保证关键小群体有信息。",
    ],
    settings: [
      {
        name: "Logging contract",
        start:
          "History、mask、actual propensity、reward components、next state、termination、donor/slide、versions 全记录。",
        adjust:
          "缺失 propensity 时评估能否可信重建；不可识别部分明确标注，不用频率硬填。",
      },
      {
        name: "Target support",
        start:
          "Synthetic fixture μ(A)=0.25、π(A)=0.5；真实策略先输出 overlap diagnostics。",
        adjust:
          "μ=0 区域限制 target、补有设计的 logs 或承认未知；不使用 epsilon 修复宣称。",
      },
      {
        name: "Clipping sensitivity",
        start: "先给 unclipped baseline；教学可比较 weight cap=1、2、5。",
        adjust:
          "阈值是 sensitivity，不是通用最佳值；不同阈值改变结论时降低判断强度。",
      },
      {
        name: "Evaluation unit / version",
        start:
          "按 donor/slide 与完整 episode 划分，冻结 environment 与 target policy。",
        adjust:
          "换 panel/registration/reward 后重验目标与支持；不能把 row split 当新 donor test。",
      },
    ],
    modifications: [
      "如果仅有 expert trajectories，先做 Behavior Cloning baseline；其 imitation accuracy 不是 new policy value。",
      "CQL/behavior constraints 可减少 unsupported action exploitation，但不能替代 independent OPE 或新环境 validation。",
      "对有限预算的新日志进行明确 randomized exploration 设计，记录真实 probabilities；prior data 中的 missing support 无法靠事后公式补齐。",
    ],
    pitfalls: [
      "把同一 tissue 的不同 overlapping crops 随机拆 train/test，误以为完成 new-slide generalization。",
      "旧日志使用一个 candidate mask，新策略使用另一个，却仍把 action probabilities 当可比。",
      "挑选 OPE 最高的几十个策略后，继续用同一份 logs 的单策略区间宣称最终可靠。",
    ],
    example:
      "Synthetic one-step logs：A, B, B, B 的 rewards=[4,1,1,1]。Behavior μ(A)=0.25、target π(A)=0.5，weights=[2,2/3,2/3,2/3]，IPS=2.5、ESS=3。若旧 logs 全由 deterministic A policy 生成，target 却有 50% 的 B，则 B reward 从日志未知。若新 camera 改变了 A/B 的 outcome，同一套 action weights 也不能把旧 outcome 转成新 camera 的结果。",
    compareTo: [
      "off-policy-evaluation",
      "offline-rl",
      "cql",
      "importance-sampling",
      "spatial-mdp-design",
      "domain-shift",
    ],
  },
];
