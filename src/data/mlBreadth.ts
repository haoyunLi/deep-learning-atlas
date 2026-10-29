import type { Lesson } from "./lessons";

export const mlBreadthLessons: Lesson[] = [
  {
    id: "linear-regression-ols",
    source: {
      label: "scikit-learn: Ordinary Least Squares and Ridge",
      url: "https://scikit-learn.org/stable/modules/linear_model.html#ordinary-least-squares",
    },
    title: "Linear Regression：一条线怎样成为可检查的 baseline",
    englishTitle: "Ordinary Least Squares, Residuals and Linear Inductive Bias",
    category: "classical",
    summary:
      "从一条可手算的 regression line 理解 feature、coefficient、residual 与 extrapolation；把预测能力、参数稳定性和因果解释分开。",
    intuition:
      "给每个 feature 一把固定刻度的尺，再把刻度相加。模型简单的好处是你能检查哪一项在推高预测；代价是它不会自动发现复杂的弯曲和交互。Linear 指对 coefficients 线性，加入 x² 后仍可用 linear regression 拟合弯曲函数。",
    core: "输入 X:[N,D]、连续目标 y:[N]，加入 intercept 后设计矩阵 Z:[N,D+1]；拟合 β 最小化 residual sum of squares，输出预测 Zβ。OLS 有解析条件与稳定数值解；实际优先 QR/SVD 或 library solver，不直接求 inverse。误差正态性不是计算 OLS 的必要条件，但常规置信区间需要相应统计假设；β 也不自动是 causal effect。",
    equation: "β̂=argminβ ‖y−Zβ‖²; β̂₁=Σ(x−x̄)(y−ȳ)/Σ(x−x̄)²; β̂₀=ȳ−β̂₁x̄",
    mechanicsSteps: [
      "先定义 prediction time 和 unit。例如用广告发布前的预算预测次日需求；不能放入事后得到的成交总额。把类别编码与缺失处理只 fit 在 training fold。",
      "教学数据 x=[0,1,2]、y=[1,2,2]，x̄=1、ȳ=5/3。中心化 cross-product 为 1，x 的平方和为 2，所以 slope=1/2。",
      "Intercept=5/3−1/2=7/6。三个 fitted values 为 [7/6,5/3,13/6]；residual y−ŷ=[−1/6,1/3,−1/6]。",
      "SSE=1/36+1/9+1/36=1/6，training MSE=1/18。这个除以 N 的预测误差，与估计 residual variance 时常用 SSE/(N−p) 是不同量，p 包括 intercept。",
      "含 intercept 且用未加权 OLS 时，residual sum=0，且与设计矩阵列正交。若不满足，先查 solver、intercept、weights 与数据版本，而非直接说训练不够。",
      "检查 residual-vs-fitted、高 leverage points、条件数与分组误差。强 collinearity 会使不同 β 组合给出相似预测，单个 coefficient 却不稳定。",
      "在独立 test 中计算 MAE/MSE 和相对 mean baseline 的收益。x=4 时该线预测 19/6，这是模型按假设外推，不是数据已验证这个区间。",
    ],
    whenToUse: [
      "连续目标、feature 数可控，想获得快速、可审计、低方差的起点。",
      "目标随输入近似加性，或可以依据领域知识添加 interaction/polynomial basis。",
      "优点是训练便宜、数值与单位清楚，适合检查后续复杂模型是否真的带来收益。",
    ],
    limits: [
      "Outliers 的 squared loss 会放大大 residual；可比较 Huber 或 quantile regression。",
      "强 collinearity、D 接近或超过 N 时 β 不稳定或解不唯一；Ridge/Lasso 可增加约束。",
      "线性外推看起来平滑，但不等于对未知范围可靠；相关 coefficient 不等于干预效应。",
    ],
    howToUse: [
      "先固定 train/validation/test split，并与仅预测 training mean 的 baseline 比较。",
      "记录 feature units、intercept、one-hot reference category；所有 scaling/imputation 留在 pipeline 内。",
      "用 QR/SVD 或成熟 solver 拟合，检查 rank、residual 和训练/验证差距。",
      "比较 OLS、Ridge、少量有依据的 interactions；只有新验证证据支持时增加非线性模型。",
      "若要报告 uncertainty，区分 mean-response confidence interval 与 single-observation prediction interval，并检查独立性和方差假设。",
    ],
    tuning: [
      "OLS 没有 learning rate 是因为此处使用直接 solver；用 SGD 时 learning rate 属于数值优化设置。",
      "Polynomial degree 从 1/2/3 比较，同时配合 regularization 和相同 split，防止高次项外推爆炸。",
      "Ridge penalty 的有效大小依 feature scale 和 loss reduction 约定，必须一并记录。",
    ],
    settings: [
      {
        name: "fit_intercept",
        start: "默认保留 intercept，除非零点关系由物理模型决定。",
        adjust: "强制穿过原点会改变所有 coefficients 与 residual 约束。",
      },
      {
        name: "feature preprocessing",
        start: "类别编码与连续尺度写进同一 training-fitted pipeline。",
        adjust: "Ridge/Lasso 或数值条件差时尤其要检查 scaling。",
      },
      {
        name: "regularization / basis",
        start: "从 OLS 与少量 Ridge α 候选开始。",
        adjust:
          "验证方差高或 coefficients 随 split 剧烈变动时增强正则，欠拟合时审查 basis。",
      },
    ],
    modifications: [
      "加入 x₁x₂ 或 spline basis 表达可解释的非线性；模型仍可对 coefficients 线性。",
      "带已知误差方差时考虑 weighted least squares，并重推 residual diagnostics。",
      "多输出 regression 可共享同一设计矩阵，但每个目标仍需单独评估误差尺度。",
    ],
    pitfalls: [
      "把 coefficient 大小直接当 importance，忽略 units 与 collinearity。",
      "先用全部数据筛 feature 再 cross-validation，制造 selection leakage。",
      "混淆 training MSE、unbiased noise variance estimate 与部署误差。",
    ],
    example:
      "Synthetic x=[0,1,2]、y=[1,2,2] 得 slope=.5、intercept=7/6、SSE=1/6；这三个点足以检查代码单位，却不足以建立可靠外推结论。",
    compareTo: [
      "logistic-regression",
      "elastic-net",
      "random-forest",
      "causal-graphs-identifiability",
    ],
    level: "进阶",
    duration: "22 分钟",
    icon: "◇",
  },
  {
    id: "naive-bayes",
    source: {
      label: "scikit-learn: Naive Bayes",
      url: "https://scikit-learn.org/stable/modules/naive_bayes.html",
    },
    title: "Naive Bayes：把多条证据相乘，假设在哪里",
    englishTitle: "Naive Bayes, Conditional Independence and Smoothing",
    category: "classical",
    summary:
      "用 prior、class-conditional likelihood 与 smoothing 解释一个快速分类器，并看重复证据如何造成过度自信。",
    intuition:
      "看到一封邮件含两个提示词，分别比较它们在 spam 与正常邮件里出现的频率，再合并证据。关键简化是假设知道类别之后，各 feature 之间可以独立处理；它不是说现实中的词彼此毫无关系。",
    core: "输入 feature vector x 和训练 labels y，估计 class prior 与每个 feature 在 class 下的 distribution。Bernoulli NB 用 binary presence/absence，Multinomial NB 用非负 token counts，Gaussian NB 用连续值的 class-specific Gaussian。预测用 log prior 加 log likelihood，再归一化得到模型 posterior。正确分类与 calibrated probability 是不同目标。",
    equation:
      "log score(c)=log P(c)+Σj log P(xⱼ|c); P(c|x)=softmaxc(log score(c)); θcj=(Ncj+α)/(Nc+αV)",
    mechanicsSteps: [
      "先选 observation model：邮件 binary 词出现可用 Bernoulli；词频可用 Multinomial；连续传感器量不能不加说明塞进 Multinomial。",
      "教学设 P(S)=.2、P(H)=.8；两个 binary features 都为 1，P(x₁=1|S)=.8、P(x₂=1|S)=.6，H 下分别 .1、.2。",
      "在 conditional independence 假设下，两个 joint scores 为 .2×.8×.6=.096 与 .8×.1×.2=.016；归一化得 P(S|x)=6/7≈.8571。",
      "若 x₂ 只是 x₁ 的完全复制，第二次乘相同证据并非新增信息，会把 odds 再放大。NB 可以仍把类别选对，却给出失真的 confidence。",
      "Multinomial toy：某类 total tokens=6，vocabulary V=3，某词 count=0；α=1 时概率=(0+1)/(6+3)=1/9，避免一个未见词把整篇 joint likelihood 乘成 0。",
      "把长文本的乘积改成 log-sum，预测完成后用 logsumexp 归一化；比较分类 accuracy、PR metrics 与 calibration，不只看训练 likelihood。",
      "Vocabulary、document frequencies 与 feature selection 必须只从训练数据学习；新词按固定 unknown-token/ignore 规则处理，并测试 domain shift。",
    ],
    whenToUse: [
      "高维稀疏文本、标签不多或需要非常便宜的 classification baseline。",
      "在线数据流需要按 sufficient statistics 增量更新时，可检查所选实现是否支持 partial_fit。",
      "优点是训练和推理快、每条 log evidence 可拆开审计，对小数据常有实用价值。",
    ],
    limits: [
      "强相关、重复 features 容易被重复计数；分类表现好不能保证 posterior calibrated。",
      "Gaussian、Bernoulli 和 Multinomial 的观测假设不同；错误单位可能比参数设置更严重。",
      "模型不能自动利用词序或长程 context，语义否定等现象通常需要更有结构的特征或 encoder。",
    ],
    howToUse: [
      "与 Logistic Regression 在相同 vocabulary、split 与 metrics 下比较。",
      "选择对应 feature 类型的 NB 变体；对 Bernoulli 模型记得 absent features 也参与 likelihood。",
      "在训练折构建 vectorizer 并调 smoothing；留出 validation 做 threshold/calibration。",
      "查看每个 class 的先验、稀有词概率与最有影响的 log likelihood ratios。",
      "如果部署 prior 变化，先识别是 label shift 还是 class-conditional shift，再考虑 prior correction。",
    ],
    tuning: [
      "α 可试 .1/1/10 等量级，更多 smoothing 会把稀有 feature 的概率拉向较均匀分布。",
      "Vocabulary size、ngram 和 min document frequency 改变 evidence，不是纯计算参数。",
      "Gaussian NB 的 variance stabilization 应与 feature scale 一起检查，防止接近零的 variance 产生极端分数。",
    ],
    settings: [
      {
        name: "likelihood family",
        start:
          "按 binary/count/continuous input 选择 Bernoulli/Multinomial/Gaussian。",
        adjust: "数据类型改变时重新检验模型，不能只换 class 名称。",
      },
      {
        name: "additive smoothing α",
        start: "比较 .1/1/10，保存稀有类别的 log loss 和 recall。",
        adjust: "未见词导致极端概率时增大；大量证据被抹平时减小。",
      },
      {
        name: "class prior / decision threshold",
        start: "记录训练 prior，threshold 用 validation 成本确定。",
        adjust:
          "类别比例漂移时重新评估 calibration 与 threshold，不能假设 .5 最优。",
      },
    ],
    modifications: [
      "加入短 ngrams 可以表达部分局部词序，但会增加相关 feature 与稀疏性。",
      "Complement NB 可作为不平衡文本的候选，与原模型实测比较。",
      "在独立 validation 上做 calibration；不要拿同一批训练 posterior 自我校准。",
    ],
    pitfalls: [
      "把 naive 假设说成所有 features 无条件独立。",
      "把缺失值与 binary absence 混为一谈。",
      "用 normalized posterior 这个名字暗示其频率校准已被验证。",
    ],
    example:
      "Synthetic 两词邮件：spam score=.096、ham score=.016，posterior=6/7。这个数值来自给定概率表与独立假设；没有真实邮件性能结论。",
    compareTo: [
      "logistic-regression",
      "bayesian-updating",
      "probabilistic-graphical-models",
      "bert",
    ],
    level: "进阶",
    duration: "22 分钟",
    icon: "◇",
  },
  {
    id: "decision-tree-splits",
    source: {
      label: "scikit-learn: Decision Trees",
      url: "https://scikit-learn.org/stable/modules/tree.html",
    },
    title: "Decision Tree：一个 threshold 怎样减少不确定性",
    englishTitle: "CART Splits, Impurity Reduction and Pruning",
    category: "classical",
    summary:
      "手算 split 前后的 Gini impurity，理解 greedy search、leaf probability、depth 与 pruning 如何共同控制树。",
    intuition:
      "每问一个问题，就把样本分到更相似的两组。问题是否值得问，取决于分完后还剩多少混合，而不是只看某一组是否特别纯。树容易读，但很多次小判断可以把偶然样本也记住。",
    core: "Classification tree 输入 X:[N,D] 和 labels，递归寻找 feature-threshold pair 降低 weighted impurity；regression tree 则按目标方差/损失分裂。CART 的 axis-aligned binary splits 是 greedy local decisions，不保证全局最优树。Leaf 统计 class frequencies 或预测均值；它们会受训练采样与 sample weights 影响。",
    equation:
      "Gini(t)=1−Σc p(c|t)²; Δ=I(parent)−nL/n·I(L)−nR/n·I(R); Rα(T)=R(T)+α|leaves(T)|",
    mechanicsSteps: [
      "教学四点 x=[1,2,3,4]、y=[0,0,1,1]，parent 两类各半，Gini=1−.5²−.5²=.5。",
      "候选 threshold=2.5 得左 [0,0]、右 [1,1]，两叶 Gini 都为 0，weighted impurity=0，gain=.5。",
      "threshold=1.5 得左 [0]、右 [0,1,1]；右叶 Gini=4/9，weighted impurity=(3/4)×4/9=1/3，gain=1/6。不能只因左叶纯就说两个 split 一样好。",
      "在每个 node 对允许的 features 与 thresholds 搜索，选当前 gain 最大者，再对子节点重复。这个选择未考虑所有未来树的组合。",
      "停止条件包括 depth、minimum leaf samples、minimum impurity decrease；也可先形成树，再按 cost-complexity pruning 在 validation 上选择子树。",
      "对新 x=2.2，沿 threshold 到左叶输出 class frequencies；若叶里只有一个样本，概率为 0/1 仍不表示充分 certainty。",
      "检查邻近输入跨阈值时预测是否突变；用多个 splits/seeds 看规则稳定性，再与 forest/boosting 比较。",
    ],
    whenToUse: [
      "表格数据中存在可解释的 thresholds 与 interactions，希望迅速审查规则。",
      "需要混合数值/已编码类别特征且不想依赖距离缩放。",
      "优点是单棵浅树可视化直观，对单调 feature rescaling 的 split ordering 通常稳定。",
    ],
    limits: [
      "单棵深树 variance 高，少量数据变化可能改变上层 split。",
      "轴对齐规则表示斜边界可能需要很多 leaves；连续 regression 的树叶外推通常为常数。",
      "高基数与多候选 thresholds 可能影响 impurity-based importance；预测关联不是因果机制。",
    ],
    howToUse: [
      "在训练折编码类别、检查缺失策略与 sample weights，保持 test 完全独立。",
      "先用 shallow tree 与 minimum leaf count 建立可读 baseline。",
      "画整棵树及每叶 sample counts，同时检查 train/validation error。",
      "用 validation 选择 depth/pruning，而不是因树图好看手动挑规则。",
      "若要解释 ensemble，用单棵 surrogate tree 时报告 fidelity，别声称它等于原模型。",
    ],
    tuning: [
      "max_depth 控制最长规则链；min_samples_leaf 直接限制叶内数据支持，二者不能完全互换。",
      "criterion 选择 Gini/log-loss 等不同 impurity；其名字不意味着在全树上求全局 optimum。",
      "ccp_alpha 增大倾向删掉收益不足的分支，需与 preprocessing 和 split 一起 cross-validate。",
    ],
    settings: [
      {
        name: "max_depth",
        start: "可比较 2/4/8，先看树是否可解释及 validation gap。",
        adjust: "明显 overfit 时减深；欠拟合时先查 feature 表达。",
      },
      {
        name: "min_samples_leaf",
        start: "从绝对数量或 training fraction 候选开始。",
        adjust: "小叶概率极端、seed 不稳时增大；稀有群体被合并时分组复核。",
      },
      {
        name: "criterion / pruning",
        start: "记录 criterion，验证 ccp_alpha 候选曲线。",
        adjust: "比较泛化与树大小，不把最小 training impurity 当唯一目标。",
      },
    ],
    modifications: [
      "Random Forest 平均多棵随机树，常减少单树 variance。",
      "Boosting 顺序修正当前 errors，改变训练方式而非简单扩大一棵树。",
      "Oblique trees 或特征变换可表达斜向分界，但可解释性与数值复杂度会变化。",
    ],
    pitfalls: [
      "仅比较子叶 impurity 而忘记 sample-weighted average。",
      "把 leaf frequency 当经过 calibration 的概率。",
      "认为增加 depth 总能提升未知数据表现。",
    ],
    example:
      "Synthetic 四点在 threshold=2.5 的 gain=.5，在 threshold=1.5 的 gain=1/6。这个差异展示 weighted impurity，而不是说明现实任务的最佳深度。",
    compareTo: [
      "random-forest",
      "xgboost",
      "boosting-families",
      "linear-regression-ols",
    ],
    level: "进阶",
    duration: "22 分钟",
    icon: "◇",
  },
  {
    id: "boosting-families",
    source: {
      label:
        "LightGBM official tuning guide; compare with CatBoost and AdaBoost",
      url: "https://lightgbm.readthedocs.io/en/latest/Parameters-Tuning.html",
    },
    title: "Boosting Families：AdaBoost、GBDT、LightGBM 与 CatBoost",
    englishTitle:
      "Sequential Ensembles, Growth Policies and Categorical Learning",
    category: "classical",
    summary:
      "分清优化目标、tree growth、类别处理和工程实现四条轴；用同一预算选型，不把工具名当性能排名。",
    intuition:
      "一组助手依次工作：后来的助手处理当前整体仍做不好的部分。AdaBoost 通过重权重强调错例；Gradient Boosting 通过当前 loss 的梯度定义下一轮任务。不同 toolkit 还会改变怎么找 split、怎么长树、怎么处理类别。",
    core: "Boosting 是 additive modeling family，不是某一个软件。AdaBoost 的经典 binary 形式使用 exponential loss 与 sample weights；GBDT 对可微 loss 逐轮加树；XGBoost 进一步使用正则化及二阶信息等机制。LightGBM 的典型 leaf-wise growth 优先分裂当前 gain 最大的 leaf，并使用 histogram 等工程策略；CatBoost 以 categorical statistics 与 ordered boosting 等方法处理特定 prediction shift。具体可用策略与 defaults 随版本和 mode 变化，应查安装版本。",
    equation:
      "F_m(x)=F_(m−1)(x)+ηh_m(x); classic binary AdaBoost: α_m=½log[(1−ε_m)/ε_m]; w_i′∝w_i exp(−α_m y_i h_m(x_i))",
    mechanicsSteps: [
      "先定目标函数、评估指标、样本分组与计算预算，再比较软件；相同 n_estimators 并不代表相同容量或耗时。",
      "经典 binary AdaBoost 设四点初始权重均 .25，weak learner 只错一点，weighted error ε=.25；α=.5log3≈.5493。",
      "更新后错点权重乘 exp(α)=√3，正确点乘 exp(−α)=1/√3；归一化后错点=.5，每个正确点=1/6。后轮因此更重视这个点，但若它是错标签也会被强调。",
      "GBDT 不必沿用上述权重公式。平方损失拟合 residual，其他损失拟合相应 negative gradient；二分类常在 raw margin 上累加，不能把 margin correction 当 probability correction。",
      "比较 leaf-wise 与 depth-wise：有 4 leaves 的 tree 可以是平衡 depth=2，也可以形成更深的一条分支。相同 leaves 不意味着相同 maximum depth。",
      "类别 target statistics 若直接包含当前样本的 y，会产生 leakage。CatBoost 的 ordered construction 使用排序中此前样本的信息等机制缓解相关问题；它仍不能修复跨患者或未来数据泄漏。",
      "对所有候选用相同 splits、early stopping 与预算记录 score、latency、memory、rare-group error。再分别检查 num_leaves/depth、minimum leaf support、类别策略与 ensemble size。",
    ],
    whenToUse: [
      "固定 tabular features、有非线性 interactions，希望比较强而实用的非神经 baseline。",
      "大量 categorical features 时把 CatBoost 纳入候选；大规模 histogram tree 训练可比较 LightGBM/XGBoost。",
      "优点是可在相对有限数据上学习复杂阈值关系；通常无需像 distance models 那样逐特征标准化。",
    ],
    limits: [
      "不存在稳定的跨所有数据集软件排名；dataset、实现、预算与预处理可改变结论。",
      "反复强调困难样本可能放大 label noise；更多 rounds 不能修复错误标签或分组泄漏。",
      "Tree ensembles 对范围外趋势和原始图像/长文本的结构学习有限，常需要 feature encoder。",
    ],
    howToUse: [
      "先建立线性、单树与 forest baseline，用相同 validation protocol 比较。",
      "把 objective、growth policy、categorical handling、missing handling 写成单独配置，不只记录包名。",
      "LightGBM 同时约束 num_leaves、min_data_in_leaf 与必要的 max_depth；别把 leaves=2^depth 当严格等价。",
      "类别编码、target statistics 和 feature selection 保持训练内；若使用 library 内置类别处理也要检查 split。",
      "联合 tuning learning rate 与 rounds，报告最佳迭代、seed variance 与同等预算结果。",
    ],
    tuning: [
      "Learning rate 小往往需要更多 rounds；比较 early-stopped validation，而非强制同样树数。",
      "Leaf-wise 可能在少数区域长得很深；minimum leaf support 是重要约束。",
      "类权重、sampling 和 categorical statistics 都可能改变 calibration，部署阈值需重验。",
    ],
    settings: [
      {
        name: "capacity",
        start:
          "比较 shallow depth 或 num_leaves=7/15/31 等候选，视样本量而定。",
        adjust: "稀碎叶与大 train/validation gap 时增大叶内支持或减容量。",
      },
      {
        name: "η / iterations",
        start: "从 .03/.1 候选加 early stopping 开始。",
        adjust: "验证仍改善但触顶时增加预算，不能直接说学习率不合适。",
      },
      {
        name: "categorical strategy",
        start: "明确原生 categorical、one-hot、ordered statistics 或其它编码。",
        adjust:
          "高基数和未知类别多时检查稀有类别稳定性与 train/test 处理一致性。",
      },
    ],
    modifications: [
      "Histogram binning 限制 split 候选，交换计算效率与分辨率；不等于改变预测目标。",
      "Monotonic constraints 在有充分依据时限制方向，但可能与真实 interactions 冲突。",
      "用 encoder embeddings 接 tabular model 作为混合 pipeline，仍需端到端防止 leakage。",
    ],
    pitfalls: [
      "把 LightGBM、CatBoost、XGBoost 当互斥的学习理论，而忽略同属 boosting family。",
      "把 AdaBoost binary .5log 权重公式无条件套到 multiclass SAMME。",
      "以 test set early stopping，再把分数当最终独立验证。",
    ],
    example:
      "Synthetic binary AdaBoost 首轮 ε=.25，使唯一错点的归一化权重从 .25 升至 .5。这里只演示经典 binary 公式，不声称所有 library 当前 API 都采用同一参数化。",
    compareTo: [
      "xgboost",
      "random-forest",
      "decision-tree-splits",
      "logistic-regression",
    ],
    level: "进阶",
    duration: "22 分钟",
    icon: "◇",
  },
  {
    id: "dbscan-density",
    source: {
      label: "scikit-learn: DBSCAN and density-based clustering",
      url: "https://scikit-learn.org/stable/modules/clustering.html#dbscan",
    },
    title: "DBSCAN：不用先指定 K，怎样从密度长出 clusters",
    englishTitle: "DBSCAN, Core Points, Border Points and Noise",
    category: "classical",
    summary:
      "逐点检查 ε-neighborhood 与 minimum support，分清 core、border、noise，并解释为什么 density 与 feature scale 决定结果。",
    intuition:
      "不是先放 K 个中心让大家排队，而是从足够拥挤的位置开始，把能通过拥挤区域连起来的点串成一组。孤立点可以暂不归属任何组；这是一条密度规则，不是给异常对象自动下定义。",
    core: "输入 X:[N,D]、distance metric、eps 与 min_samples，输出 cluster labels 和 noise 标记。点的 ε-neighborhood 样本数达到 min_samples 时成为 core（本课采用含自身的常见约定）；core-to-core density connectivity 形成 clusters，邻近 core 的非 core 点是 border。Border 不会像 core 那样继续扩张，cluster 数由密度结构产生。",
    equation: "Nε(x)={xj:d(x,xj)≤ε}; core(x) ⇔ |Nε(x)|≥m; labels∈{−1,0,1,…}",
    mechanicsSteps: [
      "确定 units 和 distance。米与毫米混用会直接改变 ε-neighborhood；标准化是一种改变距离假设的操作，不能当作完全无害的默认步骤。",
      "教学一维 x=[0,.1,.2,.3,.4,2]，ε=.11，min_samples=3，邻居计数（含自身）依次为 [2,3,3,3,2,1]。",
      "因此 .1/.2/.3 是 core；0 和 .4 不是 core，但各邻接 core，属于 border；2 没有邻接 core，标为 noise。",
      "从任意 core 扩展其相连 core component，把 border 附到 cluster。Border 不传播，所以不能借一个非 core 稀疏桥把两组继续连起来。",
      "将 ε 降到 .05，所有点邻居只剩自己，均为 noise；将 ε 增大则可能 merge 原本分开的结构。结果依赖 chosen scale，不存在无参数的真实聚类。",
      "改变 min_samples 会同时影响 core support 与细簇保留；多种 density 共存时，一个全局 ε 可能无法兼顾，可比较 OPTICS/HDBSCAN。",
      "记录 noise fraction、cluster stability、边界点和原 feature space 的证据。若用 clustering 进行 downstream prediction，必须另行定义新点分配规则与评估，标准 DBSCAN 不等于现成分类器。",
    ],
    whenToUse: [
      "未知 cluster 数、形状不适合球状中心假设，同时允许一些点被标为 noise。",
      "地理坐标或低到中维、distance 有清晰意义的数据。",
      "优点是可以找非凸 density-connected shapes，不强制把所有点塞进一个 cluster。",
    ],
    limits: [
      "不同 density 的 clusters 难由一个 ε 兼顾；高维距离集中也会削弱密度意义。",
      "在 ε 很大或邻居很密时某些实现可能用很多内存，不能假设任何设置都线性成本。",
      "Border points 在多个 cluster 可达时的归属可能受遍历顺序影响；cluster ID 本身没有语义顺序。",
    ],
    howToUse: [
      "先画原 feature 的范围和 neighbor distance 分布，说明 metric 与 scaling。",
      "从领域可解释的 ε 候选和数个 min_samples 起步，比较 cluster/noise stability。",
      "逐个检查 core/border/noise 代表样本，并与 K-means/GMM 的不同假设对照。",
      "大数据先测 neighborhood sparsity 和内存，必要时使用适合 metric 的索引或稀疏邻域表示。",
      "不要只根据 2D UMAP 图设 ε 后声称发现原始空间真实群体；同时验证原空间结构。",
    ],
    tuning: [
      "ε 决定 local distance scale；min_samples 决定所需 support，两者共同改变密度门槛。",
      "Distance metric 根据对象选择；Euclidean、cosine、geographic distances 有不同含义和 units。",
      "看多个 ε 下结果稳定区域，但稳定不自动证明 clusters 有业务/生物语义。",
    ],
    settings: [
      {
        name: "eps",
        start: "依据距离分布与实际尺度选择多个候选，教学例为 .11。",
        adjust: "Noise 过多先检查 scale/metric；不要为减少 noise 任意放大 ε。",
      },
      {
        name: "min_samples",
        start:
          "明确是否含自身，教学设 3；真实任务随 dimension/support 需求比较。",
        adjust:
          "稀疏链误合并时提高 support；小但有意义的群体丢失时检查其样本量。",
      },
      {
        name: "metric / preprocessing",
        start: "记录每一维 units，保存 training-fitted transformation。",
        adjust: "换 metric 后重新标定 ε，原值不能直接沿用。",
      },
    ],
    modifications: [
      "OPTICS 保存多尺度 density ordering，帮助探索不同 ε。",
      "HDBSCAN 构建密度层级并选择稳定 clusters，但仍有参数与统计假设。",
      "使用 domain constraints 限制不可达邻居时，要明确新的 neighborhood graph。",
    ],
    pitfalls: [
      "把 min_samples 邻居计数忘记自身，导致手算与 library 不一致。",
      "将 noise label=−1 当作已验证的 fraud、failure 或 rare biology。",
      "把 border 当 core，让稀疏链错误连接 clusters。",
    ],
    example:
      "Synthetic 六点在 ε=.11、m=3 下有一个五点 cluster：三个 core、两个 border，另一个点为 noise。每个身份都可以由邻居计数直接复算。",
    compareTo: [
      "k-means",
      "gaussian-mixture-model",
      "anomaly-detection",
      "manifold-embeddings",
    ],
    level: "进阶",
    duration: "22 分钟",
    icon: "◇",
  },
  {
    id: "manifold-embeddings",
    source: {
      label: "UMAP official parameter guide; t-SNE and UMAP original methods",
      url: "https://umap-learn.readthedocs.io/en/latest/parameters.html",
    },
    title: "t-SNE / UMAP：二维地图保留了什么，又改写了什么",
    englishTitle: "Neighborhood Embeddings, Scale and Interpretation Limits",
    category: "representation",
    summary:
      "把高维 neighborhood 转成低维布局，区分 visualization、representation 与 clustering；用参数敏感性检查“岛屿”的证据。",
    intuition:
      "想把一座山上的道路压到平面纸上：可以努力让近邻仍相邻，却不可能保证每条远近、角度和面积都不变。二维图里两团隔得远，未必表示原空间差异大；图上面积也不直接代表数据密度或群体多样性。",
    core: "输入 features X:[N,D] 与 metric，输出 Y:[N,d]。t-SNE 把高维相似度 P 与 low-dimensional Student-t similarities Q 匹配，常用 KL(P||Q)；UMAP 先构建 fuzzy neighborhood graph，再优化低维邻接关系的交叉熵式目标。两者是不同算法，不能把 perplexity 当作 UMAP n_neighbors 的完全同义词；都需要解释 preprocessing、seed 与 neighborhood scale。",
    equation:
      "t-SNE: KL(P||Q)=Σij Pij log(Pij/Qij); conditional perplexity=exp(−Σj pj|i log pj|i); embedding Y∈R^(N×d)",
    mechanicsSteps: [
      "先确定用于 distance 的 features：原始像素、normalized gene expression、PCA scores 或 encoder embeddings。输入变了，所谓 neighborhood 的语义也变了。",
      "t-SNE 的每点 bandwidth 调到目标 perplexity；若某点对两个邻居分配 [.5,.5]，entropy=log2，perplexity=2。若 [.9,.1]，perplexity≈1.384。这衡量 effective neighborhood size，不是直接取前两个邻居。",
      "在 t-SNE 中用对称 P 和 heavy-tailed Q 比较 pair similarities。KL 对 P 大而 Q 小的遗漏近邻惩罚突出；该目标并不要求所有 global distances 成比例。",
      "UMAP 从 local neighbors 与尺度构建 fuzzy graph；n_neighbors 调节邻域尺度，min_dist 影响低维点靠得多紧，n_components 决定输出维数。小 min_dist 的紧团不是自动的 cluster 证据。",
      "教学 neighborhood audit：某点原空间 top-3={B,C,D}，二维 top-3={B,E,F}，只保留 1/3。图看起来清楚，局部身份也可能改变；可统计更多点的 neighbor preservation/trustworthiness。",
      "固定输入，比较多个 seeds 与 neighborhood settings，并把 labels、batch、time 和 quality metrics 分别着色；不要只展示最符合预期的一张。",
      "若作为预测 pipeline 的 representation，按训练协议 fit 并验证新点 transform 的方法。UMAP 通常提供 transform；标准 t-SNE 的新点扩展需额外方法，不能默认 API 一样。",
    ],
    whenToUse: [
      "探索 high-dimensional neighborhood，发现需要进一步检验的结构、batch effects 或 anomalies。",
      "有明确 feature metric，想比较 representation 是否保留已知关系。",
      "优点是把局部结构可视化，便于提出问题和定位数据问题；UMAP 也可选 d>2 用作待验证的降维步骤。",
    ],
    limits: [
      "二维 island 数、间距、面积与方向不直接等于真实 cluster 数、effect size、density 或 trajectory time。",
      "Stochastic optimization 与超参数可改变布局；不同运行的坐标轴不可直接逐项比较。",
      "若 preprocessing 或 embeddings 已使用 test labels，漂亮地图不能消除 leakage；无监督方法也能接触 holdout 信息。",
    ],
    howToUse: [
      "先看 PCA 和原始 neighbor diagnostics，再添加 nonlinear embedding。",
      "记录 input feature set、metric、normalization、seed、邻域参数与输出维度。",
      "至少比较几个合理 neighborhood scales 和 seeds，并给图注明参数。",
      "聚类、DE 或 statistical testing 尽量在对应模型/原空间上进行，并解释为何使用 embedding。",
      "如果图声称 time/lineage/causality，另提供独立时间、实验或模型证据；二维排列本身不够。",
    ],
    tuning: [
      "UMAP n_neighbors 可比较 15/30/60，按数据规模调整；越大通常关注更宽尺度，但不保证 global distances 正确。",
      "min_dist 可比较 .05/.2/.5；它改变低维紧凑程度，不是 biological resolution。",
      "t-SNE perplexity 必须小于样本量，学习率/迭代与初始化也影响收敛；用 cost 与稳定性而不是美观选择。",
    ],
    settings: [
      {
        name: "feature space / metric",
        start: "明确是 Euclidean on PCA 还是 cosine on normalized embeddings。",
        adjust: "输入空间变更后重新检查 neighbors，不沿用旧图解释。",
      },
      {
        name: "neighborhood scale",
        start: "固定 preprocessing，比多个 n_neighbors 或 perplexities。",
        adjust: "细群体不稳时检查样本支持与原空间距离，不只调到图分开。",
      },
      {
        name: "seed / dimensions",
        start:
          "记录 seed，2D 用于展示；高维 downstream representation 独立调参。",
        adjust: "跨 seed 保留的关系优先解释，方向与坐标不要当绝对量。",
      },
    ],
    modifications: [
      "监督 UMAP 使用 labels，必须明确是 supervised representation，不可再称完全未使用标签。",
      "Parametric embeddings 学显式映射，便于处理新样本，但引入网络容量与训练问题。",
      "Density-preserving variants 或 diffusion maps 可针对不同目标比较；没有一张图同时保留一切。",
    ],
    pitfalls: [
      "在可视化地图上量岛间直线距离，当作可靠的原空间差异。",
      "把 n_neighbors、perplexity、cluster resolution 混作同一个按钮。",
      "只改变 seed 直到图符合故事，然后隐藏其它结果。",
    ],
    example:
      "Synthetic [.5,.5] neighborhood 的 perplexity=2，而 [.9,.1] 为约1.384。若 top-3 neighbors 仅保留一个，neighbor overlap=1/3；这两个数检查的层面不同，不能互相代替。",
    compareTo: [
      "pca",
      "dbscan-density",
      "contrastive-learning",
      "bio-graph-construction",
    ],
    level: "进阶",
    duration: "22 分钟",
    icon: "◇",
  },
  {
    id: "anomaly-detection",
    source: {
      label: "scikit-learn: Novelty and Outlier Detection",
      url: "https://scikit-learn.org/stable/modules/outlier_detection.html",
    },
    title: "Anomaly Detection：稀少、不像与真正有害是三件事",
    englishTitle: "Outlier Scores, Novelty Detection and Alert Thresholds",
    category: "classical",
    summary:
      "比较 Isolation Forest、LOF、One-Class SVM 与 reconstruction error；分清 score、threshold、training contamination 与告警成本。",
    intuition:
      "一笔交易和多数交易不一样，可能是 fraud，也可能是客户第一次旅行。异常模型首先回答“相对这批 reference data 有多不像”；把它变成业务行动，还需要标签、复核成本与目标情景。",
    core: "输入 reference features X，输出异常 ranking score 和经 threshold 得到的 alert。Outlier detection 的训练集可能混有异常；novelty detection 则用近似正常 reference 判断新样本。Isolation Forest 用随机划分的 path length；LOF 比较 local density；One-Class SVM 学边界；autoencoder reconstruction error 衡量选定模型的重建偏差。这些 scores 的方向、尺度和假设不同。",
    equation:
      "alert(x)=1[s(x)>τ] (本课统一 high=abnormal); precision=TP/(TP+FP); expected alerts=N[π·TPR+(1−π)·FPR]",
    mechanicsSteps: [
      "先规定异常的行动含义与评估单位：设备故障、入侵、数据质量错误需要不同 labels 与 observation windows，不能只写“找离群点”。",
      "对正常 reference 训练模型；若训练数据本身受污染，记录其来源与可能比例，并选择相应 robust/outlier 方法。",
      "比较不同 score：很短 isolation path 倾向更易被孤立；LOF 关注相对周围的局部密度，因此全局稀疏的正常群体不一定异常。",
      "教学一天1000条 events，真实异常比例1%，模型TPR=.8、FPR=.05：TP=8、FP=49.5、expected alerts=57.5，precision=8/57.5≈13.9%。小 FPR 仍可能产生大量 false alerts。",
      "Threshold 降低通常增加 recall 与复核负担；用 validation labels 或可承受的 alert budget 设定，而非把 contamination 参数当已知真实 prevalence。",
      "用 chronological/grouped holdout 评估 precision@budget、recall、false alerts per day 和 detection delay；只报 AUROC 可能掩盖实际成本。",
      "部署后检查 score distribution、feature drift 与复核样本代表性。只给高分样本打标签会形成 selection bias，需要有设计的抽样审计。",
    ],
    whenToUse: [
      "异常标签很少，但有相对明确的正常 reference 或复核流程。",
      "数据质量检查、sensor monitoring、fraud triage 等需要先排序再人工验证的场景。",
      "优点是无需全面枚举所有未知故障类型，可作为监督分类器之外的补充信号。",
    ],
    limits: [
      "Rare 不等于 harmful，常见模式也可能有害；异常 score 没有自动的语义标签。",
      "高维中低 density、reconstruction error 与真实异常之间可能脱节；powerful autoencoder 也会重建异常。",
      "Threshold 和评估依赖 prevalence、代价与 reference drift，训练时固定一个比例不能长期通用。",
    ],
    howToUse: [
      "写清正常 reference 来源、污染风险、上线可见 features 与告警处理流程。",
      "比较简单 robust z-score/distance baseline 与 Isolation Forest/LOF，使用相同 split。",
      "检查 library score 方向：某些 score_samples 越低越异常，不要直接接反 threshold。",
      "如果 LOF 用 novelty=True，只按该 API 约定对新的 unseen samples 打分，别把训练点输出与 fit_predict 混比。",
      "在独立小批标注集审查真正异常、少数正常子群和缺失数据模式，再选 threshold。",
    ],
    tuning: [
      "Isolation Forest 的 subsample size 与 trees 改变稳定性/局部尺度；增加 trees 先看 score ranking 是否稳定。",
      "LOF n_neighbors 太小容易受局部噪声影响，太大会忽略小群体；按正常子群大小做敏感性分析。",
      "One-Class SVM 的 ν 与 kernel bandwidth 共同控制边界；ν 不应简单解释为精准的真实异常比例。",
    ],
    settings: [
      {
        name: "reference / split",
        start:
          "优先按时间和实体隔离 validation，明确 outlier 或 novelty 任务。",
        adjust: "参考集漂移时重审定义与更新策略，不仅移动 threshold。",
      },
      {
        name: "threshold / alert budget",
        start: "根据验证过的成本或每日可复核数量设定。",
        adjust: "每天 alerts 暴增时同时检查 distribution shift 与数据管道。",
      },
      {
        name: "score model",
        start: "先选一个简单统计 baseline 与一个 nonlinear 方法。",
        adjust: "复杂模型只在独立标注收益明确时增加，保留按子群误差。",
      },
    ],
    modifications: [
      "组合 supervised detector 与 unsupervised score，但最终 calibration/threshold 需重新验证。",
      "用 human review 主动收集 uncertainty/high-cost cases，保持随机审计样本以监测 selection bias。",
      "时间连续异常可加 persistence 规则，明确以 event 还是 episode 计分。",
    ],
    pitfalls: [
      "把 score normalization 成0–1就称为异常概率。",
      "用 contamination=.01 声称验证了真实异常比例1%。",
      "只看自动删除异常后的分数变好，忽略删掉真实 rare populations。",
    ],
    example:
      "Synthetic rare-event 例中，TPR=.8、FPR=.05 看似不错，但1% prevalence 下 expected precision 仅约13.9%。这是期望计数，所以FP可以是49.5，并非半个实际event。",
    compareTo: [
      "dbscan-density",
      "autoencoder-vae",
      "class-imbalance",
      "calibration-uncertainty",
    ],
    level: "进阶",
    duration: "22 分钟",
    icon: "◇",
  },
  {
    id: "probabilistic-graphical-models",
    source: {
      label: "Stanford CS228: Bayesian networks",
      url: "https://ermongroup.github.io/cs228-notes/representation/directed/",
    },
    title: "Probabilistic Graphical Models：用 graph 表达条件关系",
    englishTitle: "Bayesian Networks, Factorization and Inference",
    category: "reasoning",
    summary:
      "从 joint distribution 的 factorization 到 evidence conditioning，理解 Bayesian Network、Markov Random Field 与 GNN 分别在做什么。",
    intuition:
      "一张 graph 可以是概率依赖的记账本：哪些变量的概率表需要知道哪些条件。它让你避免枚举所有 joint combinations，但 graph 的箭头本身不会凭空变成因果证据，也不等于 neural message passing。",
    core: "Bayesian Network 用 DAG factorization p(x)=∏i p(xi|parentsi) 表示 joint distribution；Markov Random Field 用 undirected factors 与 partition function 描述兼容关系。Inference 是在给定 evidence 后求 marginal/MAP 等查询；learning 是估计参数或结构。GNN 则通常是学习表示/预测的参数化 architecture，二者可结合但不是同一个术语。",
    equation:
      "Bayesian network: p(x₁,…,xD)=∏i p(xi|paᵢ); posterior p(q|e)∝Σhidden∏f factors; MRF: p(x)=Z⁻¹∏c ψc(xc)",
    mechanicsSteps: [
      "先定义每个 random variable 的取值与观测含义；graph nodes 可以是故障、传感器状态、天气等，不一定是实际图数据中的对象。",
      "教学有 binary R→W：P(R=1)=.2，P(W=1|R=1)=.9，P(W=1|R=0)=.1。Joint P(R=1,W=1)=.18，P(R=0,W=1)=.08。",
      "边缘化得到 P(W=1)=.26；看到 W=1 后，P(R=1|W=1)=.18/.26=9/13≈.6923。证据沿反向用于 inference，并不要求把生成箭头反过来。",
      "比较 factorization 的参数预算：N个binary变量的完全joint需要2^N−1个自由概率；每个node最多k个binary parents时，每node条件表约2^k个自由概率。Graph 以条件独立假设交换表示成本。",
      "指定 query 是 marginal、MAP state 还是整组 joint MAP；逐变量选最大 marginal 不一定组成最大概率的 joint assignment。",
      "小 graph 可用 enumeration/variable elimination；tree-structured graph 可做 exact message passing。一般 graph 的精确复杂度与 induced width/treewidth 相关，不只由node数决定。",
      "学 graph/parameters 后用 held-out likelihood、预测与模型检查评价；如果要做 intervention，另提供 causal semantics 与 identification assumptions。",
    ],
    whenToUse: [
      "变量关系有结构、缺失或 hidden variables 多，希望进行可解释的概率查询。",
      "需要把 domain knowledge 与数据结合，并区分 observation uncertainty 与 latent state。",
      "优点是把依赖假设写明，很多小结构可以精确推理，不一定需要深度网络。",
    ],
    limits: [
      "条件表会随 parent count 指数增长；有些 inference 即使 graph不大也昂贵。",
      "结构错设会系统性影响 posterior；小概率与罕见 evidence 可能放大数值问题。",
      "Bayesian Network 名称不表示每个参数都做 Bayesian inference，更不保证 DAG 是因果图。",
    ],
    howToUse: [
      "画 variables 与允许依赖，明确每个 factor 是概率分布还是未归一化 potential。",
      "先在小 graph 上 enumeration 核对 probability mass、marginals 和 evidence normalization。",
      "按查询与 graph structure 选 exact elimination、belief propagation 或 approximation。",
      "把 parameter learning、structure learning 与 inference 的数据/计算流程分别记录。",
      "用缺失模式、posterior predictive checks 和 held-out evidence 检查模型，不只核对最常见 query。",
    ],
    tuning: [
      "Parent count/structure complexity 是建模选择，需要数据支持与结构先验。",
      "Discrete table smoothing 防止稀疏cell产生过度确定的0/1 probabilities。",
      "近似推理的 iterations、sampling数与 convergence diagnostics 独立于模型 capacity。",
    ],
    settings: [
      {
        name: "variables / factor family",
        start: "先明确discrete/continuous、observed/latent和parents。",
        adjust: "变量粒度改变后重审conditional independence，不能仅重画图。",
      },
      {
        name: "inference algorithm",
        start: "小图先exact enumeration，作为其他算法对照。",
        adjust: "复杂度高时选近似法，报告收敛与多个初始化差异。",
      },
      {
        name: "smoothing / priors",
        start: "稀疏概率表使用显式pseudo-count或prior。",
        adjust:
          "极端posterior时先检查稀有evidence支持和结构，而非盲目加强先验。",
      },
    ],
    modifications: [
      "用 neural networks 参数化 conditional distributions，可形成 deep probabilistic models。",
      "Factor graphs 把 variables 与 factors分别画出，适合组织 message passing。",
      "Dynamic Bayesian Networks 把相同依赖重复到时间上；HMM是其中一个典型特例。",
    ],
    pitfalls: [
      "把factor graph消息与GNN的learned message说成同一算法。",
      "把因果箭头的解释直接赋给任何从观测数据学出的DAG。",
      "只选每个变量最可能值，却声称求出了joint MAP。",
    ],
    example:
      "Synthetic R→W中，W=1的概率=.26，P(R=1|W=1)=9/13。这是给定joint model的conditioning；它没有计算do(W=1)会不会导致R。",
    compareTo: [
      "naive-bayes",
      "hidden-markov-models",
      "gnn",
      "causal-graphs-identifiability",
    ],
    level: "进阶",
    duration: "22 分钟",
    icon: "◇",
  },
  {
    id: "hidden-markov-models",
    source: {
      label: "hmmlearn: Hidden Markov Model tutorial",
      url: "https://hmmlearn.readthedocs.io/en/latest/tutorial.html",
    },
    title: "HMM：从观测序列推断看不见的状态",
    englishTitle: "Hidden Markov Models, Forward Filtering and Viterbi",
    category: "reasoning",
    summary:
      "逐步算 transition、emission、forward probability，分清 filtering、smoothing、Viterbi decoding 与 Baum–Welch learning。",
    intuition:
      "每天看到传感器读数，却不知道设备处于健康还是磨损状态。HMM 用“状态通常怎样变化”和“各状态通常产生什么读数”结合证据，既不只看今天，也不把昨天当成确定答案。",
    core: "输入一段observations x₁:T，hidden states z₁:T有K类，参数为initial distribution π、transition A:[K,K]及emission distributions。First-order Markov假设让当前state只依赖前一state；当前observation在给定state后不依赖其它时刻。Filtering用到当前为止的observations，smoothing也使用未来观测；Viterbi找joint最可能path。",
    equation:
      "p(z,x)=π(z₁)∏t>1 A(zₜ₋₁,zₜ)∏t p(xₜ|zₜ); αₜ(j)=p(xₜ|j)Σi αₜ₋₁(i)Aij",
    mechanicsSteps: [
      "设states A/B，π=[.6,.4]，transition rows为[.7,.3]、[.2,.8]。Observation为u时emission probabilities [.5,.1]，为v时为[.5,.9]。每个state的emission分布和为1。",
      "看到第一个u：unnormalized forward α₁=[.6×.5,.4×.1]=[.30,.04]；P(u)=.34，filtered state probabilities=[15/17,2/17]。",
      "预测下一state并结合v：α₂(A)=(.30×.7+.04×.2)×.5=.109；α₂(B)=(.30×.3+.04×.8)×.9=.1098。",
      "Sequence likelihood P(u,v)=.2188；时刻2的filtered P(B|u,v)=.1098/.2188≈.5018。Forward使用sum，因为保留所有可能path。",
      "Viterbi把sum改成max并保存backpointer：AA joint=.105，AB=.081，BA=.004，BB=.0288；最可能整条path是AA，尽管末时刻marginal略偏B。",
      "Backward pass加入未来观测形成smoothing posterior；参数未知时Baum–Welch用这些expected state/transition counts做EM更新，不是把Viterbi硬path当真实labels。",
      "长序列用scaling或logsumexp，训练分多个sequences时保留lengths，不能让不同患者/会话之间产生虚假transition。",
    ],
    whenToUse: [
      "状态离散、局部transition可解释，且观测含噪声的序列分段、activity或设备模式分析。",
      "数据量有限，希望比较比大型RNN更透明的generative sequence baseline。",
      "优点是forward/backward可精确动态规划，给出state uncertainty和sequence likelihood。",
    ],
    limits: [
      "普通first-order HMM有有限记忆，state duration隐含geometric结构，可能不适合长程依赖。",
      "Hidden states编号没有自动语义；增大K可能拆成技术状态或重复模式。",
      "Emission独立和transition平稳假设可能失配；likelihood提升不保证状态解释正确。",
    ],
    howToUse: [
      "先定义sequence边界、采样间隔、missing处理和state解释目标。",
      "按连续值或离散事件选择Gaussian/Categorical等emission，检查API对shape/counts的具体约定。",
      "用上述tiny sequence核对forward likelihood、marginals与Viterbi path。",
      "比较多个K和initializations，按完整sequence/实体留出评估，不随机拆相邻timepoints。",
      "分别报告online filtering表现与使用未来信息的smoothing表现，避免上线时偷看未来。",
    ],
    tuning: [
      "K决定hidden state容量；用held-out likelihood、state occupancy与稳定性共同判断。",
      "Transition initialization和constraints体现允许的state路径；零transition可能成为训练中无法恢复的禁止边。",
      "Gaussian emission covariance形式应适应数据量与dimension；小state有效样本不足时减少自由度。",
    ],
    settings: [
      {
        name: "K / initialization",
        start: "比较少量有意义K与多个seeds，记录occupancy。",
        adjust: "空state或不同seed语义漂移时检查identifiability与初始化。",
      },
      {
        name: "transition constraints",
        start: "保存可达图与sampling interval，说明是否允许跳转。",
        adjust: "采样频率改变后重新估计/建模transition，旧A不一定有效。",
      },
      {
        name: "numerical scaling / sequence lengths",
        start: "使用稳定forward计算，显式提供独立sequence边界。",
        adjust: "underflow或异常跨会话transition先修数据/数值流程。",
      },
    ],
    modifications: [
      "Hidden Semi-Markov Models显式建模duration。",
      "Input-output HMM让transition/emission依赖covariates。",
      "Neural emissions可提高表达力，但仍需检查HMM的state与transition假设。",
    ],
    pitfalls: [
      "将Viterbi最优path与逐时刻marginal最大值混淆。",
      "用smoothing结果当成严格online预测。",
      "拼接独立sequences后忘记重置initial distribution。",
    ],
    example:
      "Synthetic u,v的sequence probability=.2188；末state B marginal≈.5018，但joint最可能path是AA，概率=.105。这个反例解释marginal inference与joint decoding的区别。",
    compareTo: [
      "probabilistic-graphical-models",
      "expectation-maximization",
      "rnn",
      "kalman-filtering",
    ],
    level: "进阶",
    duration: "22 分钟",
    icon: "◇",
  },
  {
    id: "kalman-filtering",
    source: {
      label: "FilterPy: Linear KalmanFilter documentation",
      url: "https://filterpy.readthedocs.io/en/latest/kalman/KalmanFilter.html",
    },
    title: "Kalman Filter：按 uncertainty 给预测和测量分配权重",
    englishTitle: "Linear State Estimation, Innovation and Kalman Gain",
    category: "reasoning",
    summary:
      "从一维predict/update手算到position–velocity状态，理解Q、R、P、innovation与filtering/smoothing边界。",
    intuition:
      "你预计车在10米附近，GPS却说12米。该相信谁不应靠固定平均，而应看动力学预测与测量各有多不确定。Kalman gain就是在明确线性Gaussian假设下算出的权重。",
    core: "输入上一state estimate m及covariance P、transition F、process covariance Q、observation z、measurement matrix H及covariance R；输出当前filtered state distribution。Linear-Gaussian模型下这是exact Bayesian filtering；state可包含位置、速度等未直接观测量。Q描述模型随时间积累的不确定性，R描述measurement noise；二者不是同一种误差。",
    equation:
      "m⁻=Fm; P⁻=FPFᵀ+Q; ν=z−Hm⁻; S=HP⁻Hᵀ+R; K=P⁻HᵀS⁻¹; m=m⁻+Kν; P=(I−KH)P⁻",
    mechanicsSteps: [
      "写state和单位：例如[position,velocity]，F=[[1,Δt],[0,1]]、H=[1,0]只测position。Q应由运动误差和Δt的模型确定，不能任意沿用别的采样频率。",
      "一维toy上一m=10、P=4、F=H=1、Q=1，先predict得到m⁻=10、P⁻=5；即使mean不动，uncertainty也随process noise增大。",
      "收到z=12且R=4，innovation ν=2，innovation covariance S=5+4=9；Kalman gain K=5/9。",
      "Update mean=10+(5/9)×2=100/9≈11.111；posterior variance=(1−5/9)×5=20/9≈2.222。不是简单平均11，因为两份uncertainty不相同。",
      "若同样prior但R=20，K=5/25=.2，mean=10.4、variance=4；更不可靠measurement带来更小修正。把R误当standard deviation会导致不同权重。",
      "检查innovation是否有系统偏差、时间相关或异常大；这可提示F/H/Q/R或数据关联错误。小posterior covariance也可能是过度自信的错模型。",
      "连续执行predict/update只使用已到达observations；RTS smoothing等方法再用未来数据改写过去估计，不能和online filtering的评估混淆。",
    ],
    whenToUse: [
      "近似linear dynamics与Gaussian noise的实时sensor fusion、tracking和state estimation。",
      "想在少量参数和低延迟下显式维护uncertainty，而不必训练一个大型sequence model。",
      "优点是递归更新、不必保存所有历史，矩阵与物理单位可以直接审查。",
    ],
    limits: [
      "非线性、多峰posterior、严重outliers或错误data association会破坏基础假设。",
      "Q/R是模型假设的一部分；仅让轨迹看起来平滑不能验证它们正确。",
      "未观测state能否被恢复依赖observability与运动/measurement结构，增加维度不会自动获得信息。",
    ],
    howToUse: [
      "列出state、measurement、control和所有矩阵shape/units，先做一维toy验证。",
      "从测量标定估R，从运动残差或物理noise模型构造Q，再检查innovation统计。",
      "初始化m与P时表达真实未知程度；不要仅因为library默认identity就沿用。",
      "对缺失measurement执行predict而不伪造测量；对outlier先设计gating/robust处理。",
      "用独立ground truth检查RMSE和uncertainty coverage，区分滤波质量与视觉平滑。",
    ],
    tuning: [
      "Q大通常更愿意承认预测变化，R大通常更少相信measurement；效果需结合F/H和单位。",
      "Δt改变时transition和noise propagation都要更新，尤其是position–velocity模型。",
      "数值实现可用solve代替显式inverse，covariance更新考虑Joseph form/square-root方法以保正定。",
    ],
    settings: [
      {
        name: "state / F / H",
        start: "从最小可识别状态开始，位置速度例明确Δt。",
        adjust: "无法区分的hidden states先检查observability，不直接扩大state。",
      },
      {
        name: "Q / R",
        start: "用variance/covariance单位记录，保留标定依据。",
        adjust: "innovations偏大时分别排查process mismatch与measurement问题。",
      },
      {
        name: "P₀ / robust gating",
        start: "初始不确定性按实际先验给出，定义异常measurement策略。",
        adjust: "过度confident或频繁拒绝观测时复核initialization与noise假设。",
      },
    ],
    modifications: [
      "EKF线性化非线性函数，UKF传播sigma points；二者都不自动处理任意多峰分布。",
      "Particle Filter用加权样本近似posterior，计算代价与degeneracy要另外检查。",
      "Tracking系统还需要detection和data association；Kalman Filter本身不会确定两个detections是否同一对象。",
    ],
    pitfalls: [
      "把Q或R里的variance填成standard deviation。",
      "轨迹更平滑就认为更准确，忽略delay和快速机动。",
      "把smoother使用的未来measurements泄漏到online指标。",
    ],
    example:
      "Synthetic m⁻=10、P⁻=5、z=12、R=4，K=5/9，posterior mean=100/9、variance=20/9；增大R到20后mean只更新到10.4。",
    compareTo: [
      "particle-filters",
      "hidden-markov-models",
      "state-space-models",
      "time-series-forecasting",
    ],
    level: "进阶",
    duration: "22 分钟",
    icon: "◇",
  },
  {
    id: "causal-graphs-identifiability",
    source: {
      label: "Pearl: Causal inference in statistics—An overview",
      url: "https://ftp.cs.ucla.edu/pub/stat_ser/r350.pdf",
    },
    title: "Causal Graphs：为什么 conditioning 不能代替 intervention",
    englishTitle: "SCMs, Backdoor Adjustment, Colliders and Identifiability",
    category: "reasoning",
    summary:
      "在已有Treatment Effect课程之前，先用可枚举的SCM分清association、intervention、confounder、mediator和collider。",
    intuition:
      "看到有人带伞会提高你对下雨的判断；强迫一个晴天的人带伞不会让天空下雨。两者改变的信息不同：conditioning筛选已观察的人，intervention改变系统中的生成机制。",
    core: "Structural Causal Model用variables、structural equations与exogenous noise描述生成过程。DAG加上causal assumptions才允许解释do(A=a)：替换A的生成方程并切断其incoming causal edges。Identification先问目标effect能否由现有distribution和假设决定；estimation再用有限数据算它。更准确的predictor不能自动解决unmeasured confounding或不可识别问题。",
    equation:
      "p(Y|do(A=a)) ≠ p(Y|A=a) generally; valid backdoor Z: p(Y|do(A=a))=Σz p(Y|A=a,Z=z)p(Z=z)",
    mechanicsSteps: [
      "先写变量时间与目标。用U→A、U→Y表示共同原因；用A→M→Y表示mediator；用A→C←Y表示collider。三种位置决定adjustment含义，不能统一说“控制越多越好”。",
      "Synthetic confounding：U~Bernoulli(.5)，A=U，Y=U，且没有A→Y。观测中E[Y|A=1]=1、E[Y|A=0]=0，association差为1。",
      "执行do(A=1)只把A方程改成常数，U与Y仍保持原分布，所以E[Y|do(A=1)]=.5；do(A=0)同样=.5，真实causal effect为0。",
      "该toy在每个U strata里只有一种A，违反overlap。你可从给定SCM推导effect，但仅靠observed table无法非参数估计两个treatments的stratum outcomes；模型知识与数据识别不是同一件事。",
      "Collider toy：独立A,B~Bernoulli(.5)，C=1当A=1或B=1。总体P(B=1|A=0)=.5；筛选C=1后，P(B=1|A=0,C=1)=1，而P(B=1|A=1,C=1)=.5。Conditioning制造了关联。",
      "若pre-treatment Z阻断所有backdoor且满足相应assumptions，按p(Z)加权stratum outcomes做adjustment；不能用post-treatment mediator来估原total effect而不改变问题。",
      "对多个与observational data一致的DAG/SCM做sensitivity与识别分析。Markov-equivalent graphs可能有相同conditional independences却不同intervention含义，需要时间、实验或额外assumptions。",
    ],
    whenToUse: [
      "问题涉及“如果改变某个action会怎样”，如policy、treatment或product intervention。",
      "选择adjustment变量、设计实验或判断现有数据能否回答因果问题。",
      "优点是把不可由prediction分数检验的assumptions显式化，避免在错误estimand上精调模型。",
    ],
    limits: [
      "DAG不是从相关矩阵自动读出的真相；未观测变量与时间定义会改变结论。",
      "Observational equivalence、unmeasured confounding、positivity缺失可能阻止identification。",
      "因果识别依赖assumptions；漂亮fit与高AUC并不能验证所有这些assumptions。",
    ],
    howToUse: [
      "先写action、outcome、time zero、target population与total/direct effect等estimand。",
      "用领域和时间知识列出候选DAG，标记unobserved variables与selection过程。",
      "检查backdoor/mediator/collider，说明为什么adjustment set足够而非仅靠相关筛选。",
      "确认support/overlap、measurement quality与sample-selection条件，再选estimator。",
      "分别报告identification assumptions、estimation uncertainty和sensitivity；有可能时优先设计能打破歧义的实验。",
    ],
    tuning: [
      "DAG结构是assumption选择，不是为提高test accuracy任意调的hyperparameter。",
      "Nuisance model复杂度影响estimation，不能修复错误adjustment set。",
      "Sensitivity parameter应对应明确未测机制与可解释范围，而非选择最有利结论。",
    ],
    settings: [
      {
        name: "estimand / time ordering",
        start: "在看effect结果之前定义目标和variables的时间顺序。",
        adjust: "若加入mediator或改变eligibility，重新声明estimand。",
      },
      {
        name: "adjustment set",
        start: "记录每个Z阻断哪条backdoor path。",
        adjust:
          "发现collider/descendant或遗漏confounder时重新做identification。",
      },
      {
        name: "overlap / sensitivity",
        start: "按strata/propensity检查支持集并报告敏感性范围。",
        adjust: "无支持时限制目标人群或收集新数据，不靠强模型宣称已识别。",
      },
    ],
    modifications: [
      "Randomized interventions、instrumental variables或frontdoor等设计需要各自条件；不是通用修复按钮。",
      "Causal discovery把部分结构学习形式化，但其结果依赖faithfulness、functional/noise等assumptions。",
      "可用ML拟合nuisance components，再结合cross-fitting/DR estimation；identification逻辑仍在模型之前。",
    ],
    pitfalls: [
      "把p(Y|A)写成p(Y|do(A))而不说明假设。",
      "控制所有变量，包括collider或目标total effect的mediator。",
      "把给定SCM可计算effect误说成observational data必然能识别effect。",
    ],
    example:
      "Synthetic U同时决定A与Y：observational差为1，但替换A方程后的causal effect=0。独立A/B在筛选collider C=OR(A,B)后产生关联。两种toy都可逐项枚举。",
    compareTo: [
      "causal-treatment-effects",
      "probabilistic-graphical-models",
      "data-leakage",
      "off-policy-evaluation",
    ],
    level: "进阶",
    duration: "22 分钟",
    icon: "◇",
  },
  {
    id: "learning-paradigms",
    source: {
      label: "Murphy: Probabilistic Machine Learning—An Introduction",
      url: "https://probml.github.io/pml-book/book1.html",
    },
    title: "Learning Paradigms：先看反馈来源，再选模型",
    englishTitle:
      "Supervised, Unsupervised, Self-Supervised, Semi-Supervised and RL",
    category: "foundations",
    summary:
      "把learning setup、architecture、task domain和deployment system分成不同轴，理解为什么同一个Transformer可以出现在多种AI方法里。",
    intuition:
      "你可以用老师给的答案练习、把原材料的一部分藏起来自己出题、找相似结构，或做动作后看未来结果。工具可以一样，反馈来源却不同；只知道模型叫Transformer，仍不知道它在解决哪种学习问题。",
    core: "Supervised learning使用外部提供的input-target pairs；unsupervised learning从无外部任务labels的数据中学习结构/分布；self-supervised learning由数据构造prediction targets，常视为广义unsupervised的一类。Semi-supervised结合少量labels与unlabeled examples；RL用policy interaction和reward优化sequential return。Architecture（tree/CNN/Transformer）、domain（CV/NLP）和system（Agent）是另一些轴，不能排列成同层互斥类别。",
    equation:
      "Supervised: minθ E L(fθ(x),y); self-supervised: minθ E L(fθ(mask(x)),target(x)); RL: maxπ Eπ[Σt γᵗrₜ]",
    mechanicsSteps: [
      "先描述希望输出什么及何时获得feedback：class、continuous value、embedding、density、sequence action都有不同evaluation contract。",
      "Supervised toy：给定两点targets=[2,4]、predictions=[1,3]，MSE=[(1−2)²+(3−4)²]/2=1；labels可以由人、仪器或业务记录产生，并不一定人工逐条输入。",
      "Self-supervised toy：从sequence [A,B,C] 遮住B，输入[A,MASK,C]，target=B。若model给B probability=.25，cross-entropy=−log.25≈1.386；target来自数据，但它不自动等于最终任务标签。",
      "Unsupervised clustering会输出cluster assignments；cluster IDs=0/1没有自动的业务名称。需要外部解释和稳定性验证，不能把其training objective直接当classification accuracy。",
      "Semi-supervised可用L=L_labeled+λL_unlabeled。设两项分别.4和.8、λ=.5，则total=.8；λ改变两种训练信号权重，不自动保证unlabeled data有帮助。",
      "RL toy rewards=[0,1]、γ=.9，return=.9。Action会改变未来state distribution，exploration、delayed rewards与off-policy logs使它不同于固定pairs的分类。",
      "同一个CV encoder可以先self-supervised pretrain，再supervised fine-tune，最后成为Agent的perception module；按每个stage的数据、loss、可见信息分别评估。",
    ],
    whenToUse: [
      "开始新项目、阅读论文或选择课程路径时，先判断feedback结构而不是追模型名称。",
      "需要比较pretraining、fine-tuning、active learning与RL的不同数据需求。",
      "优点是能清楚表达一个复杂pipeline每阶段从哪里得到信号，以及最终用什么证据评价。",
    ],
    limits: [
      "这些术语存在社区差异，尤其self-supervised与unsupervised的包含关系；应明确自己的定义。",
      "没有labels不意味着没有assumptions、没有leakage或不需evaluation。",
      "Agent不等于RL model；Agent可能由fixed workflow、LLM、retrieval与tools组合，未必在线训练。",
    ],
    howToUse: [
      "为每个stage写Input/Target/Feedback/Output/Decision，标记labels与未来信息来源。",
      "选择最接近部署需求的independent evaluation unit，先做简单baseline。",
      "Unlabeled/pretraining数据是否包含test entities必须明确，区分inductive与transductive声明。",
      "先看target和loss，再看architecture；同architecture可比较不同learning setups。",
      "报告最终task表现，也检查pretext task是否保留目标所需信息与稀有情况。",
    ],
    tuning: [
      "Label budget、unlabeled loss weight、augmentation与RL horizon属于不同层面的设置，不应共享一个“模型大小”旋钮。",
      "Pretraining到fine-tuning时检查task/feature shift，再调冻结层数和learning rate。",
      "Semi-supervised confidence threshold与pseudo-label quality相互影响，标签越少越需监控confirmation bias。",
    ],
    settings: [
      {
        name: "feedback contract",
        start: "明确谁提供target、何时可见，以及是否会受policy影响。",
        adjust: "目标变化时先重新选择learning setup，而非仅换architecture。",
      },
      {
        name: "objective / weighting",
        start: "写清每项loss的reduction与weight；toy λ=.5不是通用值。",
        adjust: "一项loss主导时核units、batch composition和标签质量。",
      },
      {
        name: "evaluation protocol",
        start:
          "区分pretext score、task accuracy、policy return与system success。",
        adjust: "任何一项提升都不能自动替代其它层面的验证。",
      },
    ],
    modifications: [
      "Weak supervision利用noisy rules/labels，需建模或评估label noise。",
      "Active learning选择下一批要标注的样本，改变数据采集策略，可与多种模型组合。",
      "Transfer/meta-learning决定知识怎样迁移到新任务，和监督类型可以交叉，而非互斥分类。",
    ],
    pitfalls: [
      "把CV、Transformer、self-supervised、Agent当四种同层算法。",
      "说“没用test labels”就忽略pretraining看过test inputs的protocol差异。",
      "用生成文本看起来流畅代替retrieval accuracy、tool correctness或真实task success。",
    ],
    example:
      "同一图像模型可先用masked patches自建targets，再用人工类别fine-tune，最后供Agent识别场景。三阶段分别是self-supervised学习、supervised学习与system使用；不是把它们混成一个统一训练过程。",
    compareTo: [
      "neural-networks",
      "semi-supervised-self-training",
      "active-learning",
      "reinforcement-learning",
    ],
    level: "进阶",
    duration: "22 分钟",
    icon: "◇",
  },
];
