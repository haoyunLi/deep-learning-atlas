import type { Lesson } from "./lessons";

// Examples are authored synthetic calculations, not reported paper results.
export const mechanismExpansionLessons: Lesson[] = [
  {
    id: "bayesian-updating",
    title: "Bayesian Updating：让证据逐次改变不确定性",
    englishTitle: "Bayesian Updating & Beta–Binomial Inference",
    category: "classical",
    level: "进阶",
    duration: "22 分钟",
    icon: "∫",
    source: {
      label: "Duke Statistics: Conjugate prior derivation",
      url: "https://www2.stat.duke.edu/~st118/sta250/conjug.pdf",
    },
    summary:
      "把 prior、likelihood、posterior 与 posterior predictive 分开，理解证据怎样改变概率分布。",
    intuition:
      "每次观察不只把答案往一个数推近，还改变哪些参数值仍然合理。Prior 是看数据之前的约束；likelihood 描述某个参数会产生怎样的数据。",
    core: "输入是 n 个在条件 θ 下独立、成功定义一致的 Bernoulli observations y∈{0,1}ⁿ；k=Σy。输出是成功率 θ∈[0,1] 的 posterior density，以及未来 trial 的 predictive probability。Beta(a,b) 与 Binomial likelihood 共轭，得到 Beta(a+k,b+n−k)。θ 的 uncertainty 与下一次 y 的随机性不同；density 的高度也不是单点 probability。相同 donor 的 cells 往往不满足这个独立 likelihood，必须另建层级模型。",
    equation:
      "p(θ|y) ∝ p(y|θ)p(θ); θ|y ~ Beta(a+k,b+n−k); E[θ|y]=(a+k)/(a+b+n); P(y_new=1|y)=E[θ|y]",
    mechanicsSteps: [
      "定义 trial、success 与可交换的样本范围，先说明要估的是哪个群体的 θ。",
      "在看当前 outcomes 前设置 a,b；用 prior mean=a/(a+b) 与 concentration=a+b 分开表达位置和强度。",
      "统计 k successes 与 n−k failures；Binomial likelihood 保留与 θ 有关的 θᵏ(1−θ)ⁿ⁻ᵏ。",
      "相乘后把指数加起来，得到 posterior a′=a+k、b′=b+n−k；分批或一次更新应给出相同结果。",
      "输出 posterior mean、quantiles 与 predictive distribution，不能只报最大 density 位置。",
      "模拟 replicated outcomes 检查 dispersion、分组差异与极端值；再检查换一组合理 prior 是否改变结论。",
    ],
    whenToUse: [
      "少量、定义清楚的 binary observations，需要保留参数 uncertainty。",
      "比较同类实验的 success rate，且能解释 prior 的来源与范围。",
      "数据逐批到达，想展示上一批 posterior 怎样成为下一批 prior。",
      "为 Bayesian model、MCMC、GP 与 posterior predictive checks 建立共同语言。",
      "优势是更新可追溯、示例可解析计算；也能把 prior sensitivity 直接展示给读者。",
    ],
    limits: [
      "共轭解来自指定 likelihood；把 related cells 当独立 trials 会产生过窄 posterior。",
      "Prior 不能修复 selection bias、label error 或未识别的 confounding。",
      "强 prior 可在小 n 时明显主导结果；posterior probability 仍以模型假设为条件。",
    ],
    howToUse: [
      "保存 trial 定义、sampling unit、a,b、k,n 及来源；区分观察前设定与看数据后的选择。",
      "用解析 Beta update 做单元核验，再和通用推断工具对照。",
      "画 prior、normalized likelihood 与 posterior；注明 normalized likelihood 只是形状比较。",
      "对新 batch 做 posterior predictive check，查看模型是否低估 batch variability。",
      "存在 donor/batch hierarchy 时改用 per-group rates 与 hyperprior，并按独立 donor 评估。",
    ],
    tuning: [
      "改变 concentration 保持 mean 不变，观察 prior strength 怎样影响 posterior。",
      "把 a,b 加倍并不等于新收集了同等数量 independent donors。",
      "偏离 Bernoulli 独立假设时优先改变 observation model，而非只放宽 prior。",
    ],
    settings: [
      {
        name: "Prior mean",
        start: "用 m=a/(a+b) 表达观察前合理中心。",
        adjust:
          "实验定义或目标群体改变时重新检查；不要为得到喜欢的 posterior 而改。",
      },
      {
        name: "Concentration",
        start: "用 c=a+b 表达强度，并展示至少两种合理 c。",
        adjust: "小样本下结果对 c 敏感时报告 sensitivity，收集更有信息的数据。",
      },
      {
        name: "Observation unit",
        start: "每条 y 对应一个独立试验，保留 donor/batch。",
        adjust: "同一 donor 重复测量时用 hierarchical likelihood。",
      },
      {
        name: "Predictive check",
        start: "模拟与实际相同 n 和 sampling design 的 outcomes。",
        adjust: "方差或组间差异系统不符时修改模型假设。",
      },
    ],
    modifications: [
      "将 fixed θ 扩展为 donor-specific θ_d，使用 hierarchical partial pooling。",
      "连续 observations 可换 Normal likelihood；counts 可换 Poisson/Gamma，但必须重新推导单位与参数化。",
    ],
    pitfalls: [
      "把 posterior density=2 误读为 200% probability。",
      "重复使用同一批数据更新两次，使 uncertainty 虚假收缩。",
      "把 credible interval 直接解释成整个建模流程已经无偏。",
    ],
    example:
      "Synthetic example：prior Beta(2,2)，8 trials 中 6 successes、2 failures。Posterior=Beta(8,4)，mean=8/12≈0.667，variance=8×4/(12²×13)≈0.0171。下一 trial success probability 是 0.667；未来 10 trials 的分布还需对 θ 积分，不能把 θ 当成已知常数。",
    compareTo: [
      "count-likelihoods",
      "mcmc-hmc",
      "gaussian-processes",
      "calibration-uncertainty",
    ],
  },
  {
    id: "gaussian-processes",
    title: "Gaussian Process：相似输入怎样共享函数证据",
    englishTitle: "Gaussian Process Regression & Kernel Uncertainty",
    category: "classical",
    level: "进阶",
    duration: "22 分钟",
    icon: "∫",
    source: {
      label: "Rasmussen & Williams: GPML, Chapter 2",
      url: "https://gaussianprocess.org/gpml/chapters/RW2.pdf",
    },
    summary:
      "用 kernel 定义函数值之间的 covariance，再把 observations 条件化成预测分布。",
    intuition:
      "假设近邻输入的函数值会一起变化。看到一个位置的值后，周围位置的预测会被拉动；拉动范围由 kernel 决定。",
    core: "输入 X∈R^(n×d)、continuous targets y∈Rⁿ 和 test inputs X*∈R^(m×d)；输出 latent function mean∈Rᵐ 与 covariance∈R^(m×m)。本课 zero-mean GP 与 independent Gaussian noise σ_n²：K_y=K(X,X)+σ_n²I。预测 variance 区分 latent f* 与 noisy y*，后者额外加 observation noise。Dense exact regression 需要 O(n³) factorization、O(n²) storage，适合样本适中的结构化任务。",
    equation:
      "μ*=K*ᵀ K_y⁻¹y; Σ*=K**−K*ᵀ K_y⁻¹K*; RBF k(x,x′)=σ_f² exp(−||x−x′||²/(2ℓ²)); Var(y*)=Var(f*)+σ_n²",
    mechanicsSteps: [
      "确认 y 是什么单位、X 哪些维度可比较；仅在 training data fit scaling。",
      "选择 mean function 与 kernel；RBF 表达很平滑的函数，Matérn 可表达较粗糙变化。",
      "计算 K∈R^(n×n)，加入 observation noise 与很小数值 jitter；这两项含义不同。",
      "用 Cholesky 分解 K_y=LLᵀ，通过 triangular solves 求解，避免显式求 inverse。",
      "用 train/test cross covariance K*∈R^(n×m) 求 posterior mean 与 covariance。",
      "在 holdout donors/区域上检查误差、区间覆盖和 residual structure，再检查 kernel/length-scale sensitivity。",
    ],
    whenToUse: [
      "小到中等 n、连续输出，且相似性或平滑假设有意义。",
      "需要预测分布支持下一次采样或实验选择。",
      "平滑时间或空间信号时，希望显式表达 covariance assumptions。",
      "作为 Bayesian Optimization 的 surrogate，减少昂贵 function evaluations。",
      "优点是固定 hyperparameters 与 Gaussian likelihood 下可解析推断，uncertainty 与观测位置直接关联。",
    ],
    limits: [
      "Kernel uncertainty 是模型条件下的结果，不自动包含遗漏 covariates、模型选择或所有 distribution shifts。",
      "高维距离可能缺少意义；每个 feature 单独 length-scale 也可能在小 n 时难识别。",
      "空间相近并不表示 biological replicates 独立；空间预测和新 patient 泛化是不同任务。",
    ],
    howToUse: [
      "先比较 constant/linear/Ridge baseline，再选择是否需要非线性 kernel。",
      "把 preprocessing、kernel fitting 与 noise estimation 放入 training fold。",
      "从少量有解释的 kernels 开始，保存 fitted length-scales、noise、boundaries 与版本。",
      "分别画 latent interval 和 observation interval，标清单位。",
      "记录 n、factorization time 与 memory；n 很大时再考虑 inducing points 或结构化近似。",
    ],
    tuning: [
      "Length-scale 太小会靠近逐点插值，太大可能只剩近似常数；结合 residual 与 held-out score 判断。",
      "Noise 接近零时核查重复 inputs 与数值 conditioning，不能仅靠无限增加 jitter 掩盖问题。",
      "输入单位变换会改变 kernel距离，因此先固定尺度再解释 length-scale。",
    ],
    settings: [
      {
        name: "Kernel",
        start: "从 RBF 或 Matérn 与明确的 mean baseline 比较。",
        adjust: "出现周期或多尺度 residual 时加入有机制理由的结构。",
      },
      {
        name: "Length-scale ℓ",
        start: "在已标准化的 input 尺度上设置合理 bounds。",
        adjust: "优化总贴边时检查数据尺度、核假设或识别性。",
      },
      {
        name: "Noise σ_n²",
        start: "表示 observation variance；与 jitter 分开记录。",
        adjust:
          "异方差明显时改 likelihood/noise model，避免统一 noise 吸收全部结构。",
      },
      {
        name: "Numerical jitter",
        start: "仅加足以稳定 Cholesky 的小正数并记录。",
        adjust: "需很大 jitter 才成功时检查重复点和 condition number。",
      },
    ],
    modifications: [
      "多输出 GP 可共享不同测量的相关结构，但需要额外 covariance assumptions。",
      "Deep Kernel Learning 把 learned embedding 接 kernel；必须一起验证 uncertainty 与训练范围。",
    ],
    pitfalls: [
      "把 log-transformed expression 的区间当作 raw counts 的区间。",
      "把 GP 的低 posterior variance 视为该位置没有 model misspecification。",
      "用全部 donors 优化 kernel 后，再宣称 holdout donors 未参与训练。",
    ],
    example:
      "Synthetic scalar example：一个 training observation y=2，K=1，noise variance=1，test prior variance=1，cross covariance=0.5。因此 K_y=2，μ*=0.5×2/2=0.5；latent variance=1−0.5²/2=0.875，noisy observation variance=1.875。",
    compareTo: [
      "bayesian-updating",
      "bayesian-optimization",
      "elastic-net",
      "deep-ensembles",
    ],
  },
  {
    id: "bayesian-optimization",
    title: "Bayesian Optimization：下一次昂贵实验该试哪里",
    englishTitle: "Bayesian Optimization & Acquisition Functions",
    category: "adaptation",
    level: "进阶",
    duration: "22 分钟",
    icon: "∫",
    source: {
      label: "Snoek et al.: Practical Bayesian Optimization (2012)",
      url: "https://arxiv.org/abs/1206.2944",
    },
    summary:
      "Surrogate 估计目标函数，acquisition function 决定下一次 evaluation 的价值。",
    intuition:
      "每一次完整训练或实验都昂贵时，先用已有结果画出“哪里可能更好、哪里还不清楚”，再选择最值得花预算的位置。",
    core: "输入是已评估配置 X∈R^(n×d)、validation objective y∈Rⁿ、search space 与 evaluation budget；输出是下一个配置 x_next∈Rᵈ 和随轮次更新的 incumbent。Surrogate posterior mean μ(x) 与 standard deviation σ(x) 进入 acquisition。以 minimization 的 Expected Improvement 为例，比较候选能低于当前 best f_best 的期望幅度。BO 优化的是指定 validation procedure；独立 test 必须在模型选择之外。",
    equation:
      "EI(x)=(f_best−μ)Φ(z)+σφ(z), z=(f_best−μ)/σ; σ=0 时 EI=max(f_best−μ,0); x_next=argmax EI",
    mechanicsSteps: [
      "定义 minimize/maximize、训练随机性、每次 cost 与失败条件，冻结同一 validation protocol。",
      "给 continuous、integer、categorical 与 conditional parameters 定义合法 search space。",
      "做一组覆盖范围的初始 evaluations，并保存 seeds、folds、失败与运行时间。",
      "Fit surrogate posterior；对 noisy objectives 使用能处理 observation noise 的 acquisition。",
      "在合法 space 内优化 acquisition，再运行真正昂贵的 objective，得到新 observation。",
      "更新 surrogate 与 incumbent，按预算/停止规则结束；最后用独立 test 评估选定流程。",
    ],
    whenToUse: [
      "单次模型训练、模拟或实验昂贵，且预算只允许有限 evaluations。",
      "连续且维数适中的 search space，可由 surrogate 学到有用结构。",
      "需要在 exploration 与 exploitation 间显式权衡。",
      "希望把不同 evaluation cost、parallel trials 或 feasibility 纳入决策。",
      "优点是可重复使用历史 evaluations；每次选择可解释为 acquisition 下的决策。",
    ],
    limits: [
      "Surrogate fitting/acquisition optimization 本身有成本，小训练任务可能 random search 更划算。",
      "维数很高、搜索条件复杂或目标很不连续时，简单 GP surrogate 可能失配。",
      "反复选择 validation 最优值会过拟合 validation；BO 不提供无偏最终分数。",
    ],
    howToUse: [
      "写好 objective function，使一次调用返回 metric、noise/seed信息、cost 与 failure。",
      "Log-scale 搜索 learning rate/regularization；离散参数保持合法取值。",
      "和相同预算的 random search 比较，并统一 final evaluation。",
      "记录每轮 suggested/configured/completed 状态，避免并行时重复测同配置。",
      "将所有选择包含在 inner CV；outer holdout 或 final cohort 仅用于评价流程。",
    ],
    tuning: [
      "先设总 wall-clock/evaluation budget，再决定初始覆盖点与后续轮数。",
      "Acquisition 的 exploration 参数增大后是否有效，要看实际 objective 改善和cost。",
      "Noisy experiments 用重复测量估 noise，不能把幸运单次结果当确定 optimum。",
    ],
    settings: [
      {
        name: "Search space",
        start: "仅开放有机制理由的少量参数，并给出合法 bounds。",
        adjust:
          "最优点长期贴边时检查范围；不要每轮偷偷扩大后仍用旧独立性声明。",
      },
      {
        name: "Acquisition",
        start: "确定 maximize EI 或其他准则与目标方向。",
        adjust:
          "Noise/parallel/pending trials 明显时采用匹配的 noisy/batch acquisition。",
      },
      {
        name: "Budget",
        start: "统一 evaluations 或 wall-clock budget，与 baseline公平比较。",
        adjust: "实验耗时差异大时比较 cost-aware策略。",
      },
      {
        name: "Validation",
        start: "固定 grouped folds 与 metric aggregation。",
        adjust: "新研究目标需改protocol并重新评估，不复用旧最佳分数。",
      },
    ],
    modifications: [
      "多保真优化可先用小预算筛选，再把有希望的配置分配更多训练资源。",
      "Constrained BO 同时建模性能与可行性，适合有资源或实验约束的问题。",
    ],
    pitfalls: [
      "把 acquisition 的预测值报告成已完成实验的真实 metric。",
      "把 test score 直接作为 objective，随后仍称 test independent。",
      "只比较最好一次，不报告失败试验、预算与多次搜索的 variability。",
    ],
    example:
      "Synthetic EI example（minimize）：best=0.50；A 的 μ=0.55、σ=0.20，EI≈0.0573；B 的 μ=0.48、σ=0.01，EI≈0.0201。A 的 mean 更差，却有更大的潜在 improvement；选择 A 是采集信息的决策，不保证下一次 outcome 更好。",
    compareTo: [
      "gaussian-processes",
      "automl-hpo-nas",
      "nested-group-validation",
      "active-learning",
    ],
  },
  {
    id: "mcmc-hmc",
    title: "MCMC 与 HMC：用相关样本探索 posterior",
    englishTitle: "Markov Chain Monte Carlo, HMC & NUTS",
    category: "classical",
    level: "进阶",
    duration: "22 分钟",
    icon: "∫",
    source: {
      label: "Stan Reference Manual: MCMC Sampling",
      url: "https://mc-stan.org/docs/reference-manual/mcmc.html",
    },
    summary:
      "当 posterior 无法解析求解，用满足目标分布的 Markov transitions 近似积分。",
    intuition:
      "只找到最高山峰还不知道整片山地的面积。MCMC 沿着有规则的路线探索高低不同区域，用停留比例估计 posterior；HMC 用梯度和动量减少盲目小步。",
    core: "输入是 log unnormalized posterior log p(θ,y) 及可计算 gradients，θ∈Rᵈ；输出 S×d correlated posterior draws。HMC 引入 momentum r∈Rᵈ，沿 Hamiltonian trajectory 提议新状态，再用 acceptance step 修正 numerical error。NUTS 自适应选择 trajectory 长度。Monte Carlo uncertainty、model uncertainty、data sampling uncertainty 是不同来源；draws 数量不等于独立 donors 数。",
    equation:
      "H(θ,r)=−log p(θ,y)+½rᵀM⁻¹r; accept=min(1,exp(H_old−H_new)); MCSE(mean)≈SD(draws)/sqrt(ESS)",
    mechanicsSteps: [
      "写出 prior、likelihood、constraints 与参数变换；检查 log density 在合理值上有限且gradient正确。",
      "运行 prior predictive simulations，确认模型允许合理数据，并识别异常尺度。",
      "从多个分散但可行的初值运行 chains；warmup期间适配 step size 与 metric。",
      "每次 HMC transition 抽 momentum，执行 leapfrog updates，按 Hamiltonian差接受或拒绝。",
      "Warmup后收集 draws，检查 R-hat、bulk/tail ESS、MCSE、divergences 与 trace plots。",
      "用 draws计算目标量与 predictive checks；若诊断失败，先修模型参数化/识别性，再延长采样。",
    ],
    whenToUse: [
      "复杂 Bayesian model 的 posterior 无共轭解且积分本身是研究目标。",
      "需要 nonlinear parameter contrasts、credible intervals 或 posterior predictive quantities。",
      "数据量与参数规模允许多链计算，并可写出合理 generative model。",
      "用作 Variational Inference 近似质量的一个可诊断参照。",
      "HMC 对光滑 continuous posterior 能利用梯度作远距离 proposals，减少 random-walk低效。",
    ],
    limits: [
      "HMC 需要可微 continuous参数；离散 latent states通常要marginalize或另选算法。",
      "Divergences、multimodality、funnel geometry 与弱识别可能使有限计算遗漏重要posterior区域。",
      "诊断正常是必要的检查，不能证明模型假设或采样已绝对正确。",
    ],
    howToUse: [
      "先用小 synthetic dataset 检查能否恢复已知参数及 predictive distribution。",
      "对有层级结构的模型比较 centered/noncentered parameterization。",
      "保存 chains、warmup、seed、sampler配置与全部诊断，不只导出均值。",
      "对实际目标函数计算 ESS/MCSE；同一条链不同参数的ESS不同。",
      "把posterior draws传入生成过程，比较 observed与replicated summaries。",
    ],
    tuning: [
      "Step size过大会增加integration error，过小会增加每个有效样本的cost。",
      "增加target acceptance通常缩小step size，不能替代修复错误的posterior几何。",
      "样本数增大能减少稳定链的Monte Carlo error，不能自动修复漏掉mode或divergences。",
    ],
    settings: [
      {
        name: "Chains / warmup",
        start: "使用多个独立初始化的chains，明确warmup不用于posterior摘要。",
        adjust: "R-hat、trace或初始化差异异常时检查混合与identifiability。",
      },
      {
        name: "Step size / target acceptance",
        start: "先用工具适配并记录结果。",
        adjust:
          "Divergences出现时检查参数化、尺度与prior；提高acceptance是诊断手段之一。",
      },
      {
        name: "Metric / mass matrix",
        start: "从适合参数尺度的metric开始。",
        adjust: "强相关使ESS低时比较reparameterization或更灵活metric的cost。",
      },
      {
        name: "Stopping criterion",
        start: "按目标量的MCSE与bulk/tail ESS判断精度。",
        adjust: "需要尾部概率时检查tail精度，不能只看均值稳定。",
      },
    ],
    modifications: [
      "用 marginalization 移除某些离散latentvariables，可改善continuousposterior采样。",
      "大规模任务可比较 VI，但要通过目标量与predictive checks评估近似偏差。",
    ],
    pitfalls: [
      "把optimizer得到的MAP附近抖动当作posterior sampling。",
      "删除divergent draws后宣布结果正常。",
      "只看一条chain的trace好看，忽略多链不一致和tail ESS。",
    ],
    example:
      "Synthetic leapfrog：目标为standard Normal，U(θ)=θ²/2，θ=1、r=0、M=1、ε=0.1。先r←−0.05，再θ←0.995，再r←−0.09975。H由0.5变为约0.4999875，本步acceptance=1。这个单步例子展示更新顺序；它不是已收敛的posterior样本集。",
    compareTo: [
      "bayesian-updating",
      "autoencoder-vae",
      "importance-sampling",
      "gaussian-mixture-model",
    ],
  },
  {
    id: "importance-sampling",
    title: "Importance Sampling：改变采样位置，再补回权重",
    englishTitle: "Importance Sampling & Effective Sample Size",
    category: "classical",
    level: "进阶",
    duration: "22 分钟",
    icon: "∫",
    source: {
      label: "Owen: Monte Carlo theory, methods and examples, Chapter 9",
      url: "https://artowen.su.domains/mc/Ch-var-is.pdf",
    },
    summary:
      "从容易采样的 proposal q 抽样，用 target/proposal ratio 修正 expectation。",
    intuition:
      "如果我们特意多检查罕见情况，简单平均会夸大它的占比。Importance weight记录这次抽样偏向了哪里，把每个样本的贡献改回目标分布。",
    core: "输入为 S 个 proposal draws x_s∼q、target density p或未归一化density p̃，以及integrand h(x)；输出目标expectation估计。标准IS用w=p/q，估计S⁻¹Σw h；不知道normalizer时用self-normalized IS：Σw̄h，w̄=w/Σw。Self-normalized estimator一般在有限样本有偏，但在适当条件下一致。ESS=1/Σw̄²只描述当前weight集中度，不证明tail或未覆盖区域已被探索。",
    equation:
      "E_p[h]=E_q[(p/q)h]; μ̂_SNIS=Σw̄_s h(x_s); w̄_s=exp(logw_s−logsumexp(logw)); ESS=1/Σw̄_s²",
    mechanicsSteps: [
      "写清target expectation和integrand h，不能只说“估计posterior”。",
      "选择proposal q并检查support：target有贡献的区域q必须能覆盖。",
      "从q抽样，逐样本计算logtarget、logproposal与logweight差。",
      "用logsumexp归一化，保留极端权重诊断，避免直接指数溢出。",
      "计算weighted estimate、weight ESS和最大weight；多次独立runs比较稳定性。",
      "若极少样本主导，改proposal或增加有针对性的覆盖；谨慎处理truncation产生的bias。",
    ],
    whenToUse: [
      "需要把已有proposal samples重用于另一个明确target。",
      "评估posterior expectation或rare-event integral，且proposal可设计。",
      "理解off-policy evaluation中的policy ratios从何而来。",
      "为SMC/particle filters的weight update建立基础。",
      "优势是样本可独立生成并行化，且不用Markov chain；好的proposal能显著减少variance。",
    ],
    limits: [
      "Proposal tails过轻或遗漏mode时可能极端高variance；有限sample ESS也可能没看见问题。",
      "高维target与proposal轻微不匹配就会让weights集中。",
      "截断weights改变estimator，降低variance通常伴随bias，需要报告。",
    ],
    howToUse: [
      "先在可解析toy distribution上对照真实expectation。",
      "用target的units与density convention一致地计算ratios，包括必要Jacobian。",
      "保存logweights、normalized weights、ESS与重复runs的估计。",
      "对目标h分别检查误差；一个统一ESS不能替代每个estimand的精度。",
      "比较更厚尾或mixture proposals，验证是否覆盖所有有贡献区域。",
    ],
    tuning: [
      "Proposal位置与scale用独立pilot data或规范adaptive流程确定。",
      "样本数增加前先看weight concentration，必要时先改善proposal。",
      "Clip阈值必须做sensitivity并说明estimand/estimator的变化。",
    ],
    settings: [
      {
        name: "Proposal q",
        start: "选择可采样、可评估density且有足够support的proposal。",
        adjust: "出现极端weights时检查tails、modes和scale。",
      },
      {
        name: "Log weights",
        start: "先算logp−logq，再做logsumexp。",
        adjust: "非有限数时检查support、参数变换和density实现。",
      },
      {
        name: "Sample budget",
        start: "报告实际S与weight ESS。",
        adjust: "重复runs不稳定时增加覆盖，而不只增加相同poorproposal样本。",
      },
      {
        name: "Weight modification",
        start: "默认不做未说明的clipping。",
        adjust: "若为variance控制截断，报告阈值及bias敏感性。",
      },
    ],
    modifications: [
      "使用mixture proposals覆盖多个modes，同时正确计算mixture density。",
      "把target按时间或temperature拆成序列，可转入SMC逐步纠正。",
    ],
    pitfalls: [
      "直接平均来自q的h，却声称得到target p的expectation。",
      "把normalized weights当作每个观测真实类别的posterior probability。",
      "ESS高便认定proposal没有遗漏重要region。",
    ],
    example:
      "Synthetic draws 的h=[0,1,2]、unnormalized weights=[1,2,1]，normalized=[0.25,0.5,0.25]，SNIS estimate=1；ESS=1/(0.25²+0.5²+0.25²)=8/3≈2.67。若weights变为[1,98,1]，ESS≈1.04，即使保存了3个draws，贡献几乎只来自一个。",
    compareTo: [
      "off-policy-evaluation",
      "particle-filters",
      "mcmc-hmc",
      "bayesian-updating",
    ],
  },
  {
    id: "particle-filters",
    title: "Particle Filter：每来一次观测，就更新一群可能状态",
    englishTitle: "Particle Filters & Sequential Monte Carlo",
    category: "sequence",
    level: "进阶",
    duration: "22 分钟",
    icon: "∫",
    source: {
      label: "Naesseth et al.: Elements of Sequential Monte Carlo",
      url: "https://arxiv.org/abs/1903.04797",
    },
    summary: "用传播、加权和重采样追踪随时间变化的latent state distribution。",
    intuition:
      "跟踪看不清的运动目标时，先保留一群可能位置；新测量到来后，提高相容位置的权重，再把计算预算放到有支持的区域。",
    core: "输入为observations y₁:T、transition p(x_t|x_t−1)、observation likelihood p(y_t|x_t)和N particles；x_t∈Rᵈ、y_t∈Rᵖ。输出每个t的weighted particles N×d与filtering distribution p(x_t|y₁:t)的近似。Bootstrap particle filter把transition当proposal，因此incremental weights由当前likelihood给出；这与统计bootstrap的用途不同。Resampling复制/淘汰particles，不能创造新的观测证据。",
    equation:
      "x_t^(i)~p(x_t|x_(t−1)^(i)); w̃_t^(i)=w_(t−1)^(i)p(y_t|x_t^(i)); w_t=w̃_t/Σw̃_t; ESS_t=1/Σ_i(w_t^(i))²",
    mechanicsSteps: [
      "定义latent state、time units、transition noise和observation过程，记录不规则时间间隔。",
      "从initial-state prior生成N particles与初始weights。",
      "按Δt传播每个particle；这一步表示模型预测，尚未吸收新measurement。",
      "计算observation likelihood并更新logweights，再归一化。",
      "当weight ESS低于预设阈值时resample，保存ancestor indices并把新weights设为1/N。",
      "输出weighted estimate与分位数，检查particle diversity、predictive residual与未见序列表现。",
    ],
    whenToUse: [
      "Nonlinear或non-Gaussian dynamic state-space model需要online filtering。",
      "状态分布可能多峰，单一均值/协方差近似不够。",
      "测量逐次到来，不能每次从头拟合全部trajectory。",
      "用于跟踪、动力学或assay latent state教学，但必须有明确时间与measurement model。",
      "优势是保留一群候选states，容易展示观测怎样改变不确定性。",
    ],
    limits: [
      "高维状态下weights可能迅速退化，需要更好的proposal或结构化方法。",
      "频繁resampling会导致path degeneracy；当前filtering可用不代表历史smoothing准确。",
      "过窄likelihood或错误transition可让真实状态始终不在particles覆盖中。",
    ],
    howToUse: [
      "在已知latent轨迹的synthetic data上检查state recovery和coverage。",
      "先实现可解释的state-space baseline，再考虑learned transition。",
      "用logweights并记录每个time step的ESS、maxweight和resampling事件。",
      "区分filtering只用past/current data与smoothing使用future data。",
      "评估不同particle count、seed与proposal的稳定性，并对新sequence或donor留出。",
    ],
    tuning: [
      "增加N改善Monte Carlo近似但提高cost，不能修复错误likelihood。",
      "Resampling threshold常用N的某个比例作为起点，需看diversity与estimate稳定性。",
      "Transition noise过小难跟踪真实改变，过大则预测太散；用observational residual检查。",
    ],
    settings: [
      {
        name: "Particle count N",
        start: "从能覆盖toy状态空间的预算开始，记录runtime。",
        adjust: "不同seeds的estimate差异大时增加N或改善proposal。",
      },
      {
        name: "Observation noise",
        start: "对应measurement error与其单位。",
        adjust: "Weights瞬间崩到单粒子时核查noise尺度与模型失配。",
      },
      {
        name: "Resampling threshold",
        start: "明确ESS/N触发阈值和resampling方法。",
        adjust:
          "重复ancestors太多时检查proposal与rejuvenation，而不只频繁resample。",
      },
      {
        name: "Time interval Δt",
        start: "Transition必须与真实时间间隔一致。",
        adjust: "Irregular sampling时使用Δt条件化transition或连续时间模型。",
      },
    ],
    modifications: [
      "Observation-informed proposal可把当前measurement用于产生更有效particles，同时修正importance ratio。",
      "加入MCMC rejuvenation或更合适smoothing方法以改善重复particle和历史path退化。",
    ],
    pitfalls: [
      "重采样后weights全相等，就宣称所有particles彼此独立。",
      "使用未来observations做smoothing，却把结果报告成online prediction。",
      "把particle数N当成独立biological samples数。",
    ],
    example:
      "Synthetic update：prior weights=[0.5,0.5]，两个candidate states的likelihood=[0.1,0.9]。相乘得到[0.05,0.45]，normalize后[0.1,0.9]，ESS=1/(0.01+0.81)≈1.22。Resampling可能多复制第二个state，但没有增加任何新measurement。",
    compareTo: [
      "state-space-models",
      "importance-sampling",
      "neural-odes",
      "time-series-forecasting",
    ],
  },
  {
    id: "neural-odes",
    title: "Neural ODE：学习变化速度，再积分出轨迹",
    englishTitle: "Neural Ordinary Differential Equations",
    category: "frontiers",
    level: "进阶",
    duration: "22 分钟",
    icon: "∫",
    source: {
      label: "Chen et al.: Neural Ordinary Differential Equations (2018)",
      url: "https://arxiv.org/abs/1806.07366",
    },
    summary:
      "网络输出state derivative，ODE solver决定如何沿时间把局部变化累积起来。",
    intuition:
      "给每个时间点直接猜一个位置，与学习“当前位置接下来怎样变化”是两种建模方式。Neural ODE先学速度场，再用积分连接成trajectory。",
    core: "输入initial state z(t₀)∈Rᵈ、observation times t₁:T和可选controls；网络f_θ(z,t)输出dz/dt∈Rᵈ，单位是state unit/time。ODE solver输出Z∈R^(T×d)，decoder可映射到observations。训练要同时指定observation loss与数值solver；continuous time不等于真实biological causality，也不保证从snapshot识别唯一dynamics。",
    equation:
      "dz/dt=f_θ(z,t); z(t₁)=z(t₀)+∫[t₀,t₁]f_θ(z(t),t)dt; Euler: z_(k+1)=z_k+h f_θ(z_k,t_k)",
    mechanicsSteps: [
      "定义state与measurement的区别，明确时间单位、initial condition与观测时刻。",
      "选择f_θ结构和decoder，检查输出dimension与derivative单位。",
      "先用Euler等简单solver手算一步，理解step size怎样进入trajectory。",
      "用合适solver和tolerances求完整observed-time predictions。",
      "通过solver求梯度或adjoint方法优化loss，记录function evaluations与gradient diagnostics。",
      "在未见trajectory/time range验证，并改变solver tolerance检查结果是否依赖numerical artifacts。",
    ],
    whenToUse: [
      "具有真实time stamps的不规则时间序列，希望在任意时间查询latent state。",
      "已知部分dynamics，希望用network补充未知项。",
      "研究continuous-depth模型与residual updates之间的关系。",
      "需要把动态预测与observation process分开。",
      "优点是time grid不必等距，模型与数值求解的职责可以明确区分。",
    ],
    limits: [
      "Sparse snapshots通常不足以唯一识别velocity field；漂亮trajectory不证明真实lineage。",
      "Stiff dynamics可使通用solver代价很高；更小tolerance也不自动改善统计泛化。",
      "简单ODE是deterministic dynamics，process noise、jumps或interventions需要额外模型结构。",
    ],
    howToUse: [
      "从已知解析ODE开始核验time scaling、initial condition和solver输出。",
      "将时间缩放记录到f_θ的单位中，避免seconds/minutes混用。",
      "与discrete RNN、interpolation或mechanistic ODE比较相同held-out任务。",
      "训练/评估时保存solver、rtol、atol、maxsteps和gradient方法。",
      "分开报告prediction error、function evaluations与wall-clock，检查外推范围。",
    ],
    tuning: [
      "Tolerances更严格通常增加function evaluations；逐步检查预测是否已稳定。",
      "训练中function evaluations暴涨可能提示stiffness、rough vector field或loss设计问题。",
      "Network变深不能弥补initial states、time labels或measurementmodel缺失。",
    ],
    settings: [
      {
        name: "Solver",
        start: "先用与dynamics适配的可靠solver并记录名称。",
        adjust: "Stiffness/step failures出现时检查模型及stiff solver适用性。",
      },
      {
        name: "rtol / atol",
        start: "相对与绝对误差容许值必须匹配state尺度。",
        adjust: "尺度差异大时逐dimension考虑tolerances或标准化。",
      },
      {
        name: "Time normalization",
        start: "明确t=1对应多少真实时间。",
        adjust: "跨assay比较时重新对齐time units。",
      },
      {
        name: "Gradient method",
        start: "比较可计算的direct differentiation与adjoint实现。",
        adjust: "优化异常时在小例子做finite-difference检查并收紧solver误差。",
      },
    ],
    modifications: [
      "加入已知reaction项形成hybrid model，仍需检查unknown term的identifiability。",
      "有process noise时比较Neural SDE；有突然事件时考虑jump或controlled dynamics。",
    ],
    pitfalls: [
      "把pseudotime直接当真实elapsed time输入，随后解释物理rate。",
      "训练solver宽松产生的误差被network吸收，换solver后表现崩溃。",
      "把state interpolation的准确度当长期extrapolation能力。",
    ],
    example:
      "Synthetic decay：dz/dt=−0.5z，z(0)=2。Euler h=1得到z(1)=1；用两步h=0.5得到2→1.5→1.125；解析值2exp(−0.5)≈1.213。Step size改变numerical approximation，真实rate仍是0.5/time。",
    compareTo: [
      "resnet",
      "state-space-models",
      "particle-filters",
      "time-series-forecasting",
    ],
  },
  {
    id: "hierarchical-bootstrap",
    title: "Hierarchical Bootstrap：先重采样独立对象",
    englishTitle: "Cluster & Hierarchical Bootstrap",
    category: "training",
    level: "进阶",
    duration: "22 分钟",
    icon: "∫",
    source: {
      label:
        "Saravanan et al.: Hierarchical bootstrap for multilevel data (2020)",
      url: "https://arxiv.org/abs/2007.07797",
    },
    summary:
      "重采样单位必须对应研究想推广到的新对象，再决定是否重采样其内部测量。",
    intuition:
      "从同一个人复制一百张照片，不会变成一百个新的人。Bootstrap要模拟的是重新进行哪种采样，而非把表里的每一行都当独立票。",
    core: "输入hierarchical measurements x_di、donor/group IDs与统计量T；输出B个bootstrap statistics和指定方法的interval。Cluster bootstrap先有放回抽D个independent donors，并保留所抽donor的cluster；如果sampling design要求，还可在每个抽中的donor内重采样cells，构成hierarchical bootstrap。Equal-donor与equal-cell statistics回答不同estimands。Bootstrap重复次数B改善Monte Carlo精度，不增加原始independent D。",
    equation:
      "T_equal-donor=(1/D)Σ_d mean_i(x_di); draw d₁*,…,d_D* with replacement; T_b*=T(resampled clusters); percentile CI=[Q_0.025(T*),Q_0.975(T*)]",
    mechanicsSteps: [
      "先写estimand：新donor平均、所有cells平均，还是paired treatment contrast？确定independent sampling unit。",
      "保留donor→sample→cell层级与配对关系，检查cluster sizes和missingness。",
      "每个replicate有放回抽D个donor IDs；重复抽到同一donor要作为不同抽样副本保留。",
      "根据sampling design选择保留整cluster或在内部继续重采样；不默认所有层级都应重采样。",
      "按原始定义重算T；若评估整个训练流程的uncertainty，需说明是否重新fit和重新select。",
      "查看bootstrap distribution、interval method、seed与Monte Carlo稳定性，并报告原始D很小时的局限。",
    ],
    whenToUse: [
      "Cell、tile、visit等measurements嵌套在少数donors内。",
      "想对donor-level平均、contrast或predictive metric表达sampling uncertainty。",
      "Paired数据需要保持同一donor的conditions成对进入replicate。",
      "比较模型时可在同一抽样donors上重算paired metric difference。",
      "优点是resampling过程直观，能让统计量与采样层级对应，减少把related rows当独立的错误。",
    ],
    limits: [
      "很少独立clusters时经验分布贫乏，bootstrap不能创造没观察到的population多样性。",
      "强偏差、selection或confounding不会因bootstrap而消失。",
      "Percentile、basic、BCa等interval有不同适用性；增加B不保证正确coverage。",
    ],
    howToUse: [
      "画sampling hierarchy并保存每个row的group key，先算equal-donor和equal-cell差异。",
      "用固定tiny dataset手算几个resamples，核查duplicates与pairing。",
      "保存bootstrap seed、B、unit、statistic、interval method及是否refit。",
      "Cluster sizes不等时明确权重，避免大donor无意支配目标。",
      "与合适的hierarchical model或design-based分析比较，解释各自假设。",
    ],
    tuning: [
      "B先足以观察distribution，再检查interval端点随seed/B是否稳定。",
      "内部resampling是否必要取决于采样设计，机械增加层数可能重复计入某些variance。",
      "极少donors或离散statistics导致interval退化时，应报告限制并增加独立数据。",
    ],
    settings: [
      {
        name: "Resampling unit",
        start: "新patient推断先抽donor，保留相关rows。",
        adjust: "新site问题应考虑site层；time dependence另需block设计。",
      },
      {
        name: "Statistic weighting",
        start: "明确equal-donor或equal-cell定义。",
        adjust: "每donor cells不等且结果改变时解释estimand差异。",
      },
      {
        name: "Pairing",
        start: "同donor的conditions作为同一cluster一起抽。",
        adjust: "丢失配对会改变variance与比较对象，先修复join。",
      },
      {
        name: "Interval / B",
        start: "记录interval method、B与随机seed。",
        adjust: "端点不稳定时增加B；D过小的科学限制需另外报告。",
      },
    ],
    modifications: [
      "Repeated measures时间依赖可用合适block bootstrap，但block长度需有依据。",
      "要估训练算法的variability时，可重采样development donors并重新fit，同时另定义独立evaluation。",
    ],
    pitfalls: [
      "在全部cells层面bootstrap，得到很窄interval后声称跨patient稳定。",
      "把B=10,000写成n=10,000 biological replicates。",
      "固定一个已选择模型的predictions做bootstrap，却说包含了model selection uncertainty。",
    ],
    example:
      "Synthetic donors：A cells=[1,1]、B=[5,5]、C=[9,9]。Equal-donor mean=5；一次donor resample[A,A,C]给出(1+1+9)/3=11/3。每个donor复制10倍相同cells仍只有D=3，donor-level bootstrap distribution不变。",
    compareTo: [
      "pseudobulk-hierarchy",
      "nested-group-validation",
      "model-evaluation",
      "deep-ensembles",
    ],
  },
];
