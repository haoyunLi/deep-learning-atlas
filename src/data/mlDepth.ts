import type { Lesson } from "./lessons";

// Synthetic arithmetic illustrates mechanisms; no toy score is an empirical benchmark.
export const mlDepthLessons: Lesson[] = [
  {
    id: "variational-inference-elbo",
    title: "Variational Inference：一个更好的 ELBO 到底说明什么",
    englishTitle: "Variational Families, ELBO Gaps and Approximation Error",
    category: "reasoning",
    level: "进阶",
    duration: "25 分钟",
    icon: "∫",
    source: {
      label: "Blei, Kucukelbir & McAuliffe: Variational Inference",
      url: "https://arxiv.org/abs/1601.00670",
    },
    summary:
      "从可枚举的 posterior 出发，拆开 inference、optimization 与 model error，弄清 VAE 中两个不同的 KL 和 Mean-field 的边界。",
    intuition:
      "真实 posterior 像一块形状复杂的软泥，你只允许用某种模具去贴合它。优化负责把模具摆到最好位置；如果模具不能弯曲，再多优化也不会复原所有相关性。",
    core: "输入 observed x、joint density pθ(x,z) 和 variational family qφ(z)，输出近似 posterior 及其 expectations。固定 θ 时，最大化 ELBO 等价于最小化 KL(qφ(z)‖pθ(z|x))；θ 同时训练时，两者都在改变。Mean-field 是对 q 的独立性限制，不表示原 generative model 的 latent variables 真独立。Amortized inference 用 encoder 从每个 x 直接给出 φ(x)，可增加相对逐样本优化的 approximation gap。",
    equation:
      "ELBO=E_q[log pθ(x,z)−log qφ(z)]; log pθ(x)=ELBO+KL(qφ(z)‖pθ(z|x)); ELBO=E_q log pθ(x|z)−KL(qφ(z)‖p(z))",
    mechanicsSteps: [
      "先固定一个 generative model。Synthetic binary z∈{A,B}，prior=[.5,.5]，观察 x=1 的 likelihood=[.8,.2]；joint weights=[.4,.1]，evidence p(x)=.5，exact posterior=[.8,.2]。",
      "选择 trial approximation q=[.6,.4]。直接从 joint 算 ELBO=.6 ln(.4/.6)+.4 ln(.1/.4)=−.797797 nats，不需要先知道 posterior normalizer。",
      "另算 KL(q‖posterior)=.6 ln(.6/.8)+.4 ln(.4/.2)=.104650。它非负，且 ELBO+KL=−.693147=ln(.5)，数值核对 lower bound identity。",
      "若 q 改为 [.8,.2]，gap KL=0，ELBO=ln(.5)。这是 fixed-model、family 含 exact posterior 的 toy；一般复杂模型不知道 log evidence，不能从训练日志直接读出真实 gap。",
      "VAE 的 ELBO 里减的是 KL(q(z|x)‖prior p(z))；lower-bound gap 却是 KL(q(z|x)‖posterior p(z|x))。前者可以解析计算，不等于后者；把 prior KL 推到0并不能证明 posterior approximation 完美。",
      "Mean-field counterexample：真实二维 Gaussian covariance=[[1,.8],[.8,1]]。最优 reverse-KL diagonal Gaussian 的两维 variance 都是 1−.8²=.36，而真实 marginal variance=1；优化已到最优仍低估 uncertainty。这是该 Gaussian 例的结论，不是所有 VI 都必然缩成同一种形状。",
      "连续 latent 可用 z=μ+σ ε、ε~N(0,1) 的 reparameterization gradient；μ=.5、σ=.2、ε=1.5 时 z=.8。Discrete latent 不能直接套这个连续路径，需枚举、合适 estimator 或注明 relaxation bias。",
      "实际训练同时检查 ELBO 各项、seed、gradient noise 与 posterior predictive checks；在可做的小模型上与 exact inference 或已诊断 MCMC 对比。增加 iterations 主要处理 optimization，不会自动扩大 variational family。",
    ],
    whenToUse: [
      "大规模 latent-variable models 需要快速近似 posterior，或要给 VAE/scVI 的 inference 建立共同语言。",
      "同一模型需要对很多 inputs 重复推断，amortized encoder 可降低每个新样本的计算成本。",
      "优点是能利用 minibatch 和 gradient optimization；当 uncertainty 的近似误差可被单独检查时尤其有用。",
    ],
    limits: [
      "局部 optimum、family restriction、amortization 与 model misspecification 是不同误差来源，ELBO 平稳不代表都已解决。",
      "Reverse KL 对 q 放到 target 极低密度位置的惩罚很大；多峰或相关 posterior 可能被简单 family 表达不足。",
      "极端 posterior tails 或可靠区间是重点时，先比较更丰富 family / MCMC；不能仅凭速度选择 VI。",
    ],
    howToUse: [
      "先写完整 joint、latent shapes 和约束；用本课 binary enumeration 检查符号及 log units。",
      "固定 model 后比较 Mean-field 与 low-rank/full-covariance q，再决定是否需要 amortized encoder。",
      "用多个 seeds 跑优化，分开记录 expected log likelihood、prior KL 与 gradient diagnostics。",
      "Minibatch 只给被 subsample 的 data terms 乘 N/B；global prior 与 global variational entropy 不能重复放大。",
      "验证 posterior predictive behavior、关键 moments 与 downstream decisions；VI posterior draws 的数量增加不会修复 family bias。",
    ],
    tuning: [
      "以相同 model、相同 data reduction 比较 ELBO；不同观测单位或省略不同常数时不能直接排名。",
      "学习率先用少量候选 1e−3 / 3e−4 检查梯度稳定，再看 full-data/固定评估批的 bound；这是实验起点，不是通用最优值。",
      "Sample count 1–4 可作 gradient 预算起点，增加到 16 看估计噪声是否下降；family bias 需另改结构。",
    ],
    settings: [
      {
        name: "Variational family",
        start: "先用 diagonal Gaussian 或可枚举 categorical 作 baseline。",
        adjust:
          "Posterior correlations / interval coverage 明显不足时比较 low-rank、full covariance 或 flow。",
      },
      {
        name: "Optimizer / step size",
        start: "记录 Adam learning rate，先比较 1e−3 与 3e−4、至少3个 seeds。",
        adjust:
          "ELBO 抖动、NaN 或不同 seeds 差异大时检查 scaling、参数约束和 gradient variance。",
      },
      {
        name: "Monte Carlo samples",
        start: "训练可从1–4个 q samples 开始，evaluation 使用更大固定预算。",
        adjust:
          "评估排序随 seed 波动时加 samples；均值稳定但区间偏窄时查 family，而非继续采样。",
      },
      {
        name: "Minibatch scaling",
        start: "标记 N、B 以及 local/global terms；先与 full-data toy 对照。",
        adjust:
          "改变 batch size 后 objective 比例改变，优先检查 N/B 和 sum/mean。",
      },
    ],
    modifications: [
      "Structured VI 保留 selected dependencies；Normalizing Flows 扩大 q 的几何表达，但增加优化与密度计算复杂度。",
      "Local refinement 在 encoder 输出后再优化单样本 φ，可检查 amortization gap。",
      "Variational EM 可交替改善 q 与 model parameters；它改善的是 bound，不能无条件宣称 observed likelihood 每轮单调。",
    ],
    pitfalls: [
      "把可计算的 KL to prior 当成未知的 KL to posterior。",
      "将 β≠1 的 weighted objective 仍称为原模型标准 ELBO，或跨不同 scaling 比较 loss。",
      "把 q 中因子独立说成数据已证明 latent variables 独立。",
    ],
    example:
      "Synthetic binary example：q=[.6,.4] 得 ELBO≈−.797797、gap≈.104650；exact posterior=[.8,.2] 时 gap=0。二维 Gaussian 的 Mean-field variance=.36 反例说明 optimization success 与 uncertainty fidelity 是两回事。",
    compareTo: [
      "autoencoder-vae",
      "em-objective-diagnostics",
      "mcmc-hmc",
      "bio-count-vae",
    ],
  },
  {
    id: "hierarchical-partial-pooling",
    title: "Partial Pooling：小 group 为什么要借力，又不能被抹平",
    englishTitle: "Hierarchical Models, Shrinkage and New-Group Prediction",
    category: "classical",
    level: "进阶",
    duration: "25 分钟",
    icon: "∫",
    source: {
      label: "Stan User’s Guide: Hierarchical regression",
      url: "https://mc-stan.org/docs/stan-users-guide/regression.html#hierarchical-regression",
    },
    summary:
      "从 Normal–Normal posterior 手算 shrinkage，区分 complete pooling、no pooling、partial pooling，以及已有 group 和新 group 的预测。",
    intuition:
      "两家店的平均销量都高，但一家只有1天记录，另一家有9天记录。相同均值不代表同样证据；Partial Pooling 让信息少的组更多参考共同规律，同时允许真实组间差异留下来。",
    core: "输入 y_gi、group IDs、每组 n_g 与 observation model；建立 θ_g~Normal(μ,τ²)、y_gi|θ_g~Normal(θ_g,σ²)。输出 group posterior、population hyperparameters 与指定层级的 predictive distribution。τ 表示 between-group variation，σ 表示 within-group variation。本课解析例固定 μ、τ²、σ²；Full Bayesian model 要对其 posterior 积分，Empirical Bayes plug-in 则不自动包含 hyperparameter uncertainty。",
    equation:
      "v_g=(1/τ²+n_g/σ²)⁻¹; m_g=w_g ȳ_g+(1−w_g)μ; w_g=τ²/(τ²+σ²/n_g); y_new,same|data~Normal(m_g,σ²+v_g)",
    mechanicsSteps: [
      "先确认 group 是 sites、users、devices 还是 donors，并定义预测将面对已见 group 还是完全新 group。相同 group 内更多 rows 不等于新增独立 groups。",
      "Synthetic two-group example：μ=0、τ²=4、σ²=9；两组 ȳ 都是6，n_A=1、n_B=9。观测均值的 variance 分别是9与1。",
      "A 的 data weight w_A=4/(4+9)=4/13，posterior mean m_A=24/13≈1.846；prior/shared mean weight=9/13。信息少，所以 shrinkage 较强。",
      "B 的 data weight w_B=4/(4+1)=.8，posterior mean m_B=4.8；同样 ȳ=6 因 n 不同而得到不同修正。",
      "Posterior variance A=(1/4+1/9)⁻¹=36/13≈2.769；B=(1/4+9/9)⁻¹=.8。Mean uncertainty 与未来单个 observation 的噪声不能混为一谈。",
      "预测已有 A 的新 observation 时 variance=9+36/13=153/13；已有 B 为9+.8=9.8。对于没有 observations 的全新 group，固定 hyperparameters 下 θ_new~N(0,4)，y_new~N(0,13)，不能复用 A/B 的已收缩 posterior。",
      "在固定 μ 条件下 τ²→0 会把各组压到 μ，τ²→∞ 则 m_g→ȳ_g。真实 complete pooling 通常还会由所有训练数据估共同 mean，不能误把此 toy 的固定0当作拟合结果。",
      "实际估 μ、τ、σ 后，检查 group residuals、posterior predictive dispersion 和 hyperprior sensitivity；按新 group 留出能检验跨 group 泛化，随机拆同一 group 的 rows 只评估另一种任务。",
    ],
    whenToUse: [
      "很多相关 groups 的样本量不均，希望稳定 small-group estimates，且共享 population 假设可辩护。",
      "跨站点需求预测、user-level models、multi-device measurements 或 donor-level biological analysis。",
      "优点是能在共享规律和组间异质性间连续权衡，并对已有/新 group 分开给出 uncertainty。",
    ],
    limits: [
      "错误 exchangeability 假设会把真实 minority/rare-group effects 过度拉向共同中心。",
      "独立 groups 很少时 τ 和 population uncertainty 难估；增加每组重复观测不能完全弥补。",
      "Group selection、confounding、informative cluster size 不会因加 random effects 自动消失；不相关群体不应强行 pool。",
    ],
    howToUse: [
      "记录 sampling hierarchy、group counts 和目标 estimand；先比较 pooled 与 no-pooling baselines。",
      "标准化单位后设置可解释的 scale priors，画 prior predictive data 检查不合理范围。",
      "用本课 Normal toy 对照 posterior mean/variance，再拟合合适的 continuous/count/binary hierarchy。",
      "明确 conditional-on-group 与 new-group predictions，评估时分别留出 future rows 和完整 groups。",
      "报告 shrinkage weights、group uncertainty 与 τ sensitivity；用 partial pooling 调整估计，不将 shrinkage 本身当生物不存在的证明。",
    ],
    tuning: [
      "τ 控制真实组间变异，不能为了让图更整齐而调小；应由假设、prior 和数据共同约束。",
      "对 standardized outcome，可比较 Half-Normal scales .5/1/2 的合理敏感性，但须先检验产生的 prior predictive range。",
      "Centered / Non-centered parameterization 是计算选择；弱 group data 时 Non-centered 常有帮助，但应看实际 sampler diagnostics。",
    ],
    settings: [
      {
        name: "Group structure",
        start: "先只用一个有明确意义的 group level，并列出每组 n。",
        adjust:
          "出现残余 site/time dependence 时考虑 nested 或 crossed effects，检查是否可识别。",
      },
      {
        name: "Between-group scale τ",
        start:
          "用 outcome units 定义 scale prior；standardized toy 比较 .5/1/2。",
        adjust:
          "Small groups 的结论随 prior 改变时报告 sensitivity，不能只展示最稳定版本。",
      },
      {
        name: "Observation noise σ",
        start: "从测量误差/残差设起点，确认是否允许各组不同 σ。",
        adjust:
          "大组仍有异常 shrinkage 或 heteroscedastic residuals 时检查 likelihood。",
      },
      {
        name: "Prediction target / validation",
        start:
          "先明确 seen-group 与 unseen-group；部署到新 sites 用 group-held-out。",
        adjust:
          "随机 row split 远好于 group split 时调查 identity memorization 与 population shift。",
      },
    ],
    modifications: [
      "Binary outcomes 使用 hierarchical logistic/Beta–Binomial；counts 可用 hierarchical Poisson/NB，重新定义 link 与 dispersion。",
      "加入 group-level covariates 解释可预测异质性，再为剩余 differences 做 partial pooling。",
      "Crossed effects 可同时表示 user 与 item、donor 与 batch；信息不足时简化结构而非无限加 levels。",
    ],
    pitfalls: [
      "把 group posterior variance 直接当未来 observation variance，遗漏 observation noise。",
      "声称固定 hyperparameters 的 toy interval 已包含 population parameters 的估计 uncertainty。",
      "对所有 cells 随机切分后，宣称已验证新 donor prediction。",
    ],
    example:
      "Synthetic fixed-hyperparameter example：同为 ȳ=6，n=1 的 mean 收缩到24/13，n=9 收缩到4.8。新 group 的 y variance=13，不是已有 B 的9.8。",
    compareTo: [
      "bayesian-updating",
      "hierarchical-bootstrap",
      "pseudobulk-hierarchy",
      "nested-group-validation",
    ],
  },
  {
    id: "proper-scoring-rules",
    title: "Proper Scoring Rules：怎样奖励诚实的概率",
    englishTitle: "Brier Score, Log Loss, Calibration and Resolution",
    category: "training",
    level: "进阶",
    duration: "25 分钟",
    icon: "∫",
    source: {
      label: "Gneiting & Raftery: Strictly Proper Scoring Rules",
      url: "https://sites.stat.washington.edu/raftery/Research/PDF/Gneiting2007jasa.pdf",
    },
    summary:
      "不仅问 class 是否猜对，还问概率质量；手算 expected Brier/NLL，解释 calibration、sharpness、ranking 与 decision utility 为什么不能互换。",
    intuition:
      "两人都说会下雨，一人报70%，一人报99%。只记“有没有猜对”无法判断谁更可靠；Proper Scoring Rule 让长期如实报出自己掌握的概率，比把概率夸大更有利。",
    core: "输入预测 probabilities p_i:[K] 与真实 outcomes y_i，输出可平均的 forecast loss。这里采用 lower-is-better convention：binary Brier=(p−y)²，Log Loss=−log p_y。Strictly Proper 指对真实 distribution 的 expected loss 唯一在报告该 distribution 时最小；它不是有限 test set 上必然获胜的保证。总体 loss 同时反映 calibration 与 resolution/信息性，不能独立诊断校准；置信度高只是 sharpness，不代表正确。",
    equation:
      "E[(p−Y)²]=(p−r)²+r(1−r), Y~Bernoulli(r); E[NLL]=−r ln p−(1−r)ln(1−p)",
    mechanicsSteps: [
      "固定 synthetic population true rate r=.7，把预测 p 当作可选择的报告。若始终输出 hard class=1，p=.7 与 p=.9 的 expected accuracy 都是.7。",
      "Brier expected loss=r(1−p)²+(1−r)p²。p=.7 得 .7×.3²+.3×.7²=.21；p=.9 得 .7×.1²+.3×.9²=.25。更自信却偏离真实概率会多付.04。",
      "把代数展开为 (p−r)²+r(1−r)，第二项对 p 不变，第一项在 p=r 唯一为0；这直接解释 binary Brier 的 Strict Propriety。",
      "同一 population，expected Log Loss 在 p=.7 时≈.610864 nats，在 p=.9 时≈.764528；报极小的真实 outcome probability 会被 log loss 强烈惩罚。",
      "有限四个 outcomes=[1,1,1,0]：constant p=.75 的 empirical Brier=.1875；p=.99 的=.2451。两者 threshold=.5 后 accuracy 都=.75。这里真实 population probability 未知，经验样本不能证明.75永远最佳。",
      "Calibration 不等于信息性：若两个等大 groups 的真实 rates 为 .2 与 .8，统一报.5在总体上 calibrated，expected Brier=.25；分别报.2/.8也 calibrated，expected Brier=.16，额外信息改善 resolution。",
      "按 label 做 class weighting 会改变最优报告：weighted Log Loss 的 minimizer 为 p*=w₁r/(w₁r+w₀(1−r))。r=.2、w₁=3、w₀=1 时 p*=3/7，不再是原始 population 的.2；训练后概率含义要重新检查。",
      "在独立 target-like test 同时报 Brier/NLL、reliability plots、subgroup counts 与 ranking/decision metrics。Score improvement 不能单独证明每个 subgroup calibrated，也不能代替实际成本评估。",
    ],
    whenToUse: [
      "输出要被当成概率用于 forecast、risk ranking、ensemble 或 downstream decision，想比较概率质量。",
      "Accuracy 相同但 confidence 差异很大的 classifiers，或 recalibration 前后需要可比较指标。",
      "优点是每个样本都有明确 loss，可追踪 catastrophic overconfidence，并提供 truthful-probability 的 population objective。",
    ],
    limits: [
      "有限样本、label noise 与 selection bias 会影响 score；Strict Propriety 是 expectation 性质。",
      "Brier/NLL 将多个能力压成一个数，低分不保证每个 subgroup 或 shifted domain 的 calibration。",
      "重尾 log losses 可由少数极端错误主导；需要查原始案例而非随意截断后只报较好指标。",
    ],
    howToUse: [
      "固定 label mapping、probability shape、sample weights 与 averaging convention；保存原始 logits/probabilities。",
      "用 prevalence-only baseline，再比较模型 Brier/NLL，防止把多数类预测当有用信息。",
      "先画 probability bins 与 subgroup sample counts，再解释总体 score 的变化。",
      "若做 temperature/isotonic calibration，使用独立 calibration data，test 留在选择之外。",
      "最后按 cost matrix 或 workload curve 选择 action rule；不要把最低 NLL 自动等同于最低业务损失。",
    ],
    tuning: [
      "报告 natural-log nats 或其他底；不同 log base 只改比例，不能混在同一对比表。",
      "Binary Brier 的单正类平方误差在[0,1]；对两类向量求和会是两倍，比较前统一 convention。",
      "Reliability bins 可从10个起并报告 counts，稀疏时合并；改变 bins 会影响 ECE，但不改变未分箱 Brier/NLL。",
    ],
    settings: [
      {
        name: "Probability contract",
        start: "明确 binary positive class，检查每行 probabilities 和为1。",
        adjust: "发现 scores 不在[0,1]或未归一化时先查接口，不能直接用作 NLL。",
      },
      {
        name: "Reduction / weights",
        start: "默认按独立目标 unit 等权平均，说明 binary Brier convention。",
        adjust:
          "Group size 差异大时同时报告 equal-group 与 sample-weighted estimands。",
      },
      {
        name: "Numerical handling",
        start: "用 stable log-softmax 从 logits 算 NLL；记录 any clipping ε。",
        adjust:
          "大量 values 落在 clipping 边界时查模型过度自信，不仅调大 ε 隐藏损失。",
      },
      {
        name: "Diagnostic granularity",
        start: "从总体和预定义 groups 的 score/reliability 图开始，列出 n。",
        adjust: "总体改善而关键组变差时分别报告，不用 aggregate average 抵消。",
      },
    ],
    modifications: [
      "连续 predictive distributions 可用 CRPS；完整 distribution scoring 与只评一个 quantile 的 Pinball Loss 目标不同。",
      "对 dataset shift 在目标分布下重新估 score，明确 weights 与 uncertainty。",
      "Combine calibrated probabilities with Bayes decisions，把 probability quality 与 action costs 拆成两个可审计阶段。",
    ],
    pitfalls: [
      "把高 accuracy 或高 AUROC 当作概率必然校准。",
      "把 class-weighted training 后的输出直接解释为原 population posterior。",
      "只优化 ECE 的分箱方式，或把所有 predictions 改成 base rate 后宣布预测能力提高。",
    ],
    example:
      "Synthetic true rate=.7 时，p=.7/.9 的 expected accuracy 相同，但 Brier=.21/.25，Log Loss≈.610864/.764528。Proper Scoring 鼓励概率诚实，不能保证某个有限样本或部署决策必然更好。",
    compareTo: [
      "calibration-uncertainty",
      "class-imbalance",
      "bayes-decision-thresholds",
      "deep-ensembles",
    ],
  },
  {
    id: "bayes-decision-thresholds",
    title: "Bayes Decision Theory：概率相同，为什么行动会不同",
    englishTitle: "Cost Matrices, Bayes Risk and Reject Options",
    category: "reasoning",
    level: "进阶",
    duration: "25 分钟",
    icon: "∫",
    source: {
      label: "scikit-learn: Tuning the decision threshold",
      url: "https://scikit-learn.org/stable/modules/classification_threshold.html",
    },
    summary:
      "从两种错误的代价推导 threshold，再加入 abstention；把 probability estimation、threshold selection 与 action capacity 分开。",
    intuition:
      "一个包裹有30%概率需要额外检查：漏检可能损失8单位，误检损失2单位。是否检查不能只看30%有没有超过50%，而要把两种行动的所有可能后果乘上概率。",
    core: "输入 target-population probability p=P(Y=1|x)、actions 与 cost matrix C(a,y)，输出最小 conditional expected loss 的 action。正确分类成本为0时，R(+)=C_FP(1−p)，R(−)=C_FN p，positive threshold=C_FP/(C_FP+C_FN)。Cost 是外部目标，不是 model confidence；若概率不校准、成本随 x 变化或动作改变 outcomes，简单常数 threshold 可能不适用。",
    equation:
      "a*(x)=argmin_a Σy C(a,y)p(y|x); choose + if p≥C_FP/(C_FP+C_FN); R(reject)=c_R only under the stated constant-cost assumption",
    mechanicsSteps: [
      "先列出 rows=actions、columns=true outcomes 的 cost matrix，标明正类与零成本假设。Synthetic C_FP=2、C_FN=8，正确分类 cost=0；所有值只是教学单位。",
      "对 p=.3，直接行动 positive 的 risk=2×.7=1.4，negative 的 risk=8×.3=2.4，所以选 positive，虽然它不是最可能的 class。",
      "解 2(1−p)≤8p 得 p≥.2；这个 threshold 来自成本比。只有对称错误成本且正确分类 cost 相同，.5才是相应 Bayes threshold。",
      "加入理想化 review action，其总成本固定为1，且已包含后续结果：risk(reject)=1。p=.3 时 review 的1小于1.4与2.4，因此选择 review。现实 review 若也会犯错，须把其错误概率与延迟成本重新放入矩阵。",
      "解 negative risk≤1 得 p≤1/8=.125；positive risk≤1 得 p≥.5。因此在此 toy 中 .125<p<.5 选择 reject，两侧选对应自动 action；边界 ties 要预先定义。",
      "核对 p=.1 时 negative risk=.8、positive=1.8、reject=1；p=.6 时 positive=.8、negative=4.8、reject=1。拒答阈值依成本不一定围绕.5对称。",
      "若每天最多 review B 个 cases，就不再是每个样本独立 argmin；比较 review 带来的 expected risk reduction，显式解决 capacity constraint，而非随意取最不自信的 B 个。",
      "在独立 target-like validation 上检查 probabilities、cost 敏感性、action rates 与 subgroup outcomes；若用数据调 threshold，另留 test 评估完整选择流程。单纯换 threshold 不会改变原 scores 的 ROC 排序。",
    ],
    whenToUse: [
      "Forecast 已能输出有依据的概率，需要将它转换为分类、复核、分配资源等明确动作。",
      "False Positive 与 False Negative 的代价不同，或允许 reject/人工 review。",
      "优点是把争论落到可解释的 cost 与 assumptions，能在不重训 backbone 的情况下审查决策规则。",
    ],
    limits: [
      "成本不确定、随人群/时间改变时，单一 threshold 可能不稳；应报告一组合理成本下的策略变化。",
      "模型 probability 不等于可信 posterior，严重 shift 时精确的 cost 公式仍可产生坏决策。",
      "若 action 改变 Y 或有长期外部影响，需要 causal/sequential 决策模型；此静态 classification risk 不是通用 policy evaluation。",
    ],
    howToUse: [
      "先和任务定义对齐 action/outcome/cost，明确谁承担每类错误。",
      "训练与 calibration 后冻结概率输出，再推导或验证 threshold。",
      "用 cost-versus-threshold、review workload 和 group error rates 检查政策可执行性。",
      "对不确定成本做敏感性表，记录 ties 与无法执行 action 时的 fallback。",
      "最终测试完整 pipeline 的 realized loss，并保留未来真实 outcomes 用于监测；决策动作导致的 label missingness 要另外处理。",
    ],
    tuning: [
      "先把 C_FP 标准化为1，比较 C_FN/C_FP 的合理范围，而非任意固定0.5。",
      "Reject cost 应包含 review 本身、delay 和 residual errors；不能默认 human=perfect。",
      "Capacity constraints 与 fairness/feasibility constraints 要显式建模，不能藏在模型 loss 或事后手调。",
    ],
    settings: [
      {
        name: "Cost matrix",
        start: "从清楚的2×2表开始；本课 FP=2、FN=8只是 toy。",
        adjust:
          "错误类型遗漏或实际成本依 x 变化时升级为 instance-dependent costs。",
      },
      {
        name: "Probability / prevalence",
        start:
          "使用目标人群的独立 calibration 证据，保留 source 和 target 基率。",
        adjust: "部署 prior 改变时先查 Label Shift，而不是只复制旧 threshold。",
      },
      {
        name: "Reject policy",
        start: "先评 constant review cost=1的 toy，并预先规定 ties。",
        adjust: "Review 并非无误或工时受限时加入其 error model 与 capacity。",
      },
      {
        name: "Threshold selection split",
        start:
          "先解析推导，再用独立 validation 检查 cost curve；test 不参与选择。",
        adjust:
          "Threshold 随 fold 剧烈变化时检查样本量、calibration 与 cost 假设。",
      },
    ],
    modifications: [
      "Multiclass 时直接计算每个 action 对所有 classes 的 expected cost，不必强行变成一个 scalar threshold。",
      "加入 resource 约束可按 expected utility 做 allocation；coupled cases 需要联合优化。",
      "有后续信息可购买时用 Value of Information 比较额外测量的 expected benefit 与 cost。",
    ],
    pitfalls: [
      "把最可能 class 直接当最优 action，忽略不对称错误成本。",
      "把 reject 当 OOD 检测保证，或把人工 review 当作零错误、零延迟。",
      "在 test set 上挑最低 cost threshold 后，用同一 test 宣称 unbiased policy performance。",
    ],
    example:
      "Synthetic p=.3、FP=2、FN=8时，positive risk=1.4<negative risk=2.4；若 review 固定 cost=1则 review 更优。Threshold=.2，review 区间(.125,.5)，说明概率与决策是两个层次。",
    compareTo: [
      "proper-scoring-rules",
      "calibration-uncertainty",
      "conformal-selective-prediction",
      "label-shift-correction",
    ],
  },
  {
    id: "quantile-regression",
    title: "Quantile Regression：为什么上界和均值需要不同的 loss",
    englishTitle: "Pinball Loss, Conditional Quantiles and Interval Checks",
    category: "classical",
    level: "进阶",
    duration: "25 分钟",
    icon: "∫",
    source: {
      label: "scikit-learn: QuantileRegressor",
      url: "https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.QuantileRegressor.html",
    },
    summary:
      "逐项计算 Pinball Loss，理解 median、tail forecast、quantile crossing，以及预测区间为何不自动有 finite-sample coverage。",
    intuition:
      "准备库存时，低估需求和高估需求的损失通常不一样。Mean 预测把两边平方误差对称处理；Quantile 预测则通过不同方向的线性斜率，把需要保守到什么程度写进目标。",
    core: "输入 features X:[N,D]、连续 outcomes y:[N]与 quantile level τ∈(0,1)，输出 conditional quantile qτ(x)，而不是 mean 或参数 confidence interval。Pinball Loss 对 underprediction 和 overprediction 施加τ与1−τ的斜率；population expected loss 的 minimizers 是相应 quantiles。Finite/discrete data 存在 ties 时解可不唯一，线性/树/神经网络限制与 regularization 也会改变实际 fit。",
    equation:
      "u=y−q; ρτ(u)=max(τu,(τ−1)u); qτ∈argmin_q E[ρτ(Y−q)|X=x]; τ=C_under/(C_under+C_over)",
    mechanicsSteps: [
      "先明确预测 unit 和 horizon，例如下一日需求；用过去可得 features 预测未来，不能把同一天事后统计量放回输入。",
      "对τ=.75，underprediction u>0的 loss=.75u，overprediction u<0的 loss=.25|u|。同样差4单位，低估罚3，高估罚1；这不是把所有错误统一乘.75。",
      "Synthetic outcomes=[1,2,4,8]，constant q=4，residuals=[−3,−2,0,4]，losses=[.75,.5,0,3]，sum=4.25，mean Pinball=1.0625。",
      "改 q=2，losses=[.25,0,1.5,4.5]，sum=6.25，mean=1.5625，因此在τ=.75下 q=4优于 q=2。用 MSE 选 quantile 会换成另一个目标。",
      "q=8的 losses=[1.75,1.5,1,0]也合计4.25；本例任意 q∈[4,8]都是 empirical optimum，因为 Nτ=3产生平坦区间。不要把不同 quantile 插值约定误当优化 bug。",
      "连续 population、正确 conditional quantiles 的 q.1与 q.9之间应有.8的 conditional mass；但估计模型在新数据上的实际 coverage 可能偏离.8，discrete/ties 时还需重新理解边界概率。",
      "分别拟合多τ可能得到 q.9<q.1的 Quantile Crossing。检查 ordering；可用 joint monotonic output 或合适 rearrangement，但修复顺序不自动保证 calibration。",
      "用 held-out Pinball Loss、interval width、overall/subgroup/horizon coverage 联合评价；若需 Conformal 校正，保留独立 calibration 并说明其 exchangeability 与 marginal guarantee。",
    ],
    whenToUse: [
      "对 under/overprediction 代价不同的库存、latency、demand、resource planning 或 risk forecast。",
      "条件分布 heteroscedastic 或 skewed，mean±固定σ不能描述不同输入的 tails。",
      "优点是不必预设完整 Gaussian likelihood，可直接优化所需 quantile，linear baseline 易检查。",
    ],
    limits: [
      "极端τ如.99需要足够 tail data；没有观测支持时更复杂模型也无法保证 tail 可靠。",
      "Quantile interval 不是模型参数的 confidence interval，也不自带 Conformal finite-sample coverage。",
      "Independent quantile fits 可能 cross；非平稳 time series 与 censored outcomes 还需对应的数据/likelihood 处理。",
    ],
    howToUse: [
      "先选需要的τ及业务理由，比较 constant empirical quantile 和 linear Quantile Regression。",
      "按 training folds fit 预处理，用 Pinball Loss 做验证，避免用 mean-oriented metric 替换主目标。",
      "保存每个τ的 predictions；检查 q ordering、极端输入和 under/over error counts。",
      "评估不同 groups 与 forecast horizons 的 coverage 和 width，给出 sample counts。",
      "Tail data 不足时报告范围与 uncertainty，考虑更低τ或补样；加入 Conformal 时单独说明校准过程。",
    ],
    tuning: [
      "τ来自要预测的 quantile 或成本比，不是为测试集 Pinball 最低而任意挑的 hyperparameter。",
      "Linear QuantileRegressor 的 alpha 是 L1 regularization；standardized features 可从0/.001/.01/.1作验证候选，依 library reduction 与数据尺度解释。",
      "τ=.1/.5/.9可作三个输出的教学起点；若要.01/.99应检查 tail 有效样本和稳定性，不把更多 heads 当更多证据。",
    ],
    settings: [
      {
        name: "Quantile levels",
        start: "先列τ=[.1,.5,.9]或由 C_under/(C_under+C_over)明确选择。",
        adjust:
          "成本/horizon 改变时重新定义目标；tail 样本太少时降低声明精度。",
      },
      {
        name: "Regularization / feature scaling",
        start:
          "Linear baseline 保留 intercept；scale 只 fit training，用 small alpha grid。",
        adjust:
          "验证误差增大或系数随 fold 剧变时查 collinearity、regularization 和数据量。",
      },
      {
        name: "Quantile ordering",
        start: "每个 x 检查 q.1≤q.5≤q.9，记录 crossing 率。",
        adjust:
          "Crossing 明显时用 joint monotonic construction 或验证过的 rearrangement。",
      },
      {
        name: "Coverage protocol",
        start: "独立 test 同时报告 coverage、width、Pinball 与每组 n。",
        adjust:
          "Coverage 不足时先查 shift/错设；Conformal 校准需要另外保留 calibration 数据。",
      },
    ],
    modifications: [
      "Gradient Boosting、Quantile Forest 或 Neural Quantile Head 可表达非线性，评价目标仍是对应 quantiles。",
      "Joint quantile models 共享 features 并施加 non-crossing constraints，避免独立 fits 互相矛盾。",
      "Conformalized Quantile Regression 用校准 residual 扩大/调整区间，保证范围依其独立性和 exchangeability 条件。",
    ],
    pitfalls: [
      "把τ=.9理解为每一个单独样本都有已验证90%成功保证。",
      "使用 MSE 排名后声称选出了最好的.9-quantile predictor。",
      "对 finite sample 的非唯一 quantile optimum 只认一个插值数值，误判其他解为错误。",
    ],
    example:
      "Synthetic y=[1,2,4,8]、τ=.75时，q=4的 mean Pinball=1.0625，q=2为1.5625；整个[4,8]都是 empirical optimum。这个 flat region 可用来检验自己的 loss 与 quantile convention。",
    compareTo: [
      "linear-regression-ols",
      "time-series-forecasting",
      "conformal-selective-prediction",
      "bayes-decision-thresholds",
    ],
  },
  {
    id: "label-shift-correction",
    title: "Label Shift：类别比例改变，posterior 怎样重算",
    englishTitle:
      "Prior-Ratio Correction, Black Box Shift Estimation and Identifiability",
    category: "training",
    level: "进阶",
    duration: "25 分钟",
    icon: "∫",
    source: {
      label: "Lipton, Wang & Smola: Detecting and Correcting for Label Shift",
      url: "https://proceedings.mlr.press/v80/lipton18a.html",
    },
    summary:
      "从 Bayes odds 重加权到 confusion matrix 估 prior，区分“有更多 positive predictions”与“已知真实 prevalence 变了”。",
    intuition:
      "同一种物体在照片里的外观没变，但新地区出现它的比例更高；同一张模糊照片应得到不同 posterior。关键是假设各 class 的外观分布真的稳定，不能只因为 predicted positives 增多就认定这个解释。",
    core: "Label Shift 假设 p_target(x|y)=p_source(x|y)，但 class priors π_t(y)改变。若 source posterior 与 priors 已知且 support 足够，target posterior∝p_s(y|x)π_t(y)/π_s(y)。当 target labels 缺失，BBSE 可利用 held-out source confusion matrix 和 target prediction frequencies 估 priors；它的可识别性依矩阵信息，不能靠无标签数据一般性证明 class-conditional stability。",
    equation:
      "p_t(y|x)=[p_s(y|x)π_t(y)/π_s(y)]/Σk[p_s(k|x)π_t(k)/π_s(k)]; predicted-positive rate=FPR+(TPR−FPR)π_t",
    mechanicsSteps: [
      "先固定 source/target、class definitions 和 preprocessing；明确 Label Shift 允许 P(Y|X)随 prior 变化，不能同时假设它像 Covariate Shift 那样保持不变。",
      "Synthetic binary source prior π_s(1)=.2、target prior π_t(1)=.5；对某 x，source posterior p_s(1|x)=.4。Positive prior ratio=.5/.2=2.5，negative ratio=.5/.8=.625。",
      "Unnormalized target weights=[.6×.625,.4×2.5]=[.375,1]，normalize 得 p_t(1|x)=1/1.375=8/11≈.727273。不能只把.4乘2.5得到1后就当最终 probability。",
      "等价地，source odds=.4/.6=2/3，prior-odds multiplier=(.5/.5)/(.2/.8)=4，所以 target odds=8/3、probability=8/11。Binary positive multiplier 固定时排序不变，但 calibration/decisions 改变。",
      "若 target prior 未知，冻结 classifier，用独立 source labels 估 TPR=.8、FPR=.1；target predicted-positive rate=.45。在 class-conditional prediction 稳定假设下，π_t=(.45−.1)/(.8−.1)=.5。",
      "按 rows=predicted、columns=true，conditional confusion matrix=[[.9,.2],[.1,.8]]，columns 和为1；乘 target prior vector[.5,.5]得 prediction frequencies[.55,.45]。别与 joint confusion matrix convention 混用。",
      "若 TPR=FPR，classifier 输出不区分 labels，方程无法识别 prior；若 TPR=.51、FPR=.49，prediction rate 仅变.01就使 estimated prior 变.5，说明近 singular 矩阵会放大噪声。",
      "用约束估计确保 priors 非负且和为1，报告 source confusion 与 target frequency 的 sampling uncertainty；收集少量 target labels 检查 assumptions 与修正后的 calibration。估 prior、改 posterior、定 threshold 是三个步骤。",
    ],
    whenToUse: [
      "类别含义、采集过程和 class-conditional appearance 近似稳定，但实际 class proportions 有合理变化原因。",
      "需要诊断 source calibration 在新 prevalence 下为何失效，或比较 prior correction 与重训。",
      "优点是在较强但明确的假设下可利用 unlabelled target inputs，且 binary correction 可以逐项手算。",
    ],
    limits: [
      "如果 P(X|Y)也变、出现 source 未见 class 或 label definition 改变，单纯 prior 修正可严重失效。",
      "BBSE 矩阵接近 singular 时估计不稳；source 少数类样本很少会进一步放大 uncertainty。",
      "BBSE 估 prior 不要求 classifier 本身 calibrated，但直接把其 soft outputs 当 source posterior 做 Bayes correction 需要相应概率质量；两者条件不同。",
    ],
    howToUse: [
      "先用未经适应的 frozen pipeline 记录 source 和 target prediction distributions，并排除数据管道变化。",
      "在独立 source validation 估 class-conditional confusion，保存 class order、样本数与 matrix convention。",
      "估 target priors 时施加 simplex 约束，检查 condition number 及 bootstrap/sensitivity，而非盲目 inverse 后截断负数。",
      "若使用 soft posterior correction，先审查 source calibration 和采样/class-weighting 对输出的影响。",
      "收集 target labels 做独立复验并保留 unadapted baseline；明确无标签信号本身不足以证明 Label Shift。",
    ],
    tuning: [
      "Prior smoothing / regularization 控制估计方差，但会引入 bias；report both 与 source prior 的偏离幅度。",
      "Target window 从符合近似 stationarity 的时间窗开始；窗口太短频率噪声大，太长可能混合不同 regimes。",
      "Class granularity 过细时 matrix 可能不稳；合并 classes 必须有语义依据，而不是为了取得漂亮 condition number。",
    ],
    settings: [
      {
        name: "Shift assumption",
        start: "先写出稳定的 P(X|Y)与变动的 P(Y)，列采集/标签变化证据。",
        adjust:
          "新仪器、外观变化或 class definitions 改变时停止仅用 prior correction 解释。",
      },
      {
        name: "Confusion estimation",
        start:
          "冻结 predictor，用 held-out source 各类样本估 conditional matrix。",
        adjust: "稀少类或 TPR≈FPR 时增加数据/改善识别信息，避免直接矩阵求逆。",
      },
      {
        name: "Target window / support",
        start:
          "记录 window 大小与 class support；toy 窗口只用于固定 prior 估计。",
        adjust:
          "估计随 window 剧变或新 class 出现时收集标签并审查非 stationarity。",
      },
      {
        name: "Correction / validation",
        start:
          "完整归一化 prior-weighted probabilities，再单独选择 cost threshold。",
        adjust:
          "修正后 NLL 或 group calibration 变差时复核假设与 source probabilities，不只继续放大 ratio。",
      },
    ],
    modifications: [
      "可用 soft confusion moments、regularized constrained estimation 或 EM-style prior fitting，但每种实现需注明校准与 identifiability 条件。",
      "Class-based importance weights 可用于 target risk 估计或 retraining；weights 不改变 source 缺失 support 的事实。",
      "Generalized/mixed shift 需要额外 assumptions 或 target labels，不能把 Label Shift 公式当万能 domain adaptation。",
    ],
    pitfalls: [
      "将 target predicted-positive fraction 直接当真实 prevalence，忽略 FPR/TPR。",
      "只乘 positive ratio 不归一化，产生超出[0,1]的伪 probability。",
      "把 BBSE 可使用 uncalibrated classifier 误解成任意 uncalibrated soft scores 都能当 Bayes posterior 修正。",
    ],
    example:
      "Synthetic prior .2→.5使 source posterior .4修正为8/11；target prediction positive=.45配合 TPR=.8/FPR=.1才推得π_t=.5。这些结果依 class-conditional stability 与 support，并非无标签数据已经验证的事实。",
    compareTo: [
      "domain-shift",
      "importance-sampling",
      "proper-scoring-rules",
      "bayes-decision-thresholds",
    ],
  },
];
