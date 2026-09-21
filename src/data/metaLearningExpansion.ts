import type { Lesson } from "./lessons";

export const metaLearningExpansionLessons: Lesson[] = [
  {
    id: "episodic-meta-learning",
    source: {
      label:
        "Triantafillou et al.: Meta-Dataset—A Dataset of Datasets for Learning to Learn from Few Examples",
      url: "https://arxiv.org/abs/1903.03096",
    },
    title: "Episode：把少样本任务切成支持集与查询集",
    englishTitle: "Episodic Meta-Learning Protocol",
    category: "adaptation",
    level: "进阶",
    duration: "13 分钟",
    icon: "⊂",
    summary:
      "把类别、样本和任务分成 meta-train、meta-validation、meta-test，再在每个任务内拆 support 与 query。",
    intuition:
      "普通训练一次抽一批样本；元学习一次抽一项小任务。Support 像开卷材料，query 像看完材料后的考试。真正要验证的是面对未见任务能否快速学会。",
    core: "一个 N-way K-shot episode 含 N 个类别、每类 K 个有标签 support，以及独立 query。Meta-training 从训练任务分布采样 episodes；超参数只看 meta-validation；最终在未见类别、用户或环境构成的 meta-test 上反复采样并报告均值和置信区间。",
    equation: "τ=(Sτ,Qτ), |Sτ|=N×K;  minθ Eτ∼p_train(τ)[LQτ(A(θ,Sτ))]",
    mechanicsSteps: [
      "先定义一个 task 到底是什么：新类别、新用户、新语言、新环境或新奖励函数，并按 task identity 划分 meta-train、meta-val、meta-test。",
      "在一个 task 内采样 N 个类别，每类抽 K 个 support；再从同一类别抽不重叠 query，记录 [N,K,…] 与 [N,Q,…] 形状。",
      "适配器 A 只能读取 support：它可以算 prototype、训练 head，或执行少量梯度步；query 只用于计算适配后的泛化损失。",
      "用许多独立 meta-test episodes 汇总均值、标准误与每域结果；同时与冻结表示、最近邻和普通微调比较。",
    ],
    whenToUse: [
      "未来会重复出现相关新任务，并且每个新任务只有少量标注时。",
      "要公平比较 metric、optimization 与 memory-based meta-learning 时。",
    ],
    limits: [
      "任务边界不清或未来任务与训练任务无关时，episodic 假设不成立。",
      "同一实体或类别跨 meta split 会产生比普通样本泄漏更隐蔽的任务泄漏。",
    ],
    howToUse: [
      "写下 task identity、N、K、query 数和新任务时允许的适配操作。",
      "先按 task 分割，再在各 split 内采 episode，绝不先随机样本再拼任务。",
      "固定多个 episode seeds，比较方法时复用同一批任务与 support/query。",
      "报告适配前后成绩、每任务耗时、显存和失败任务，而不只给总体均值。",
    ],
    tuning: [
      "训练 N/K 应靠近部署协议，并额外测试 N/K 改变时的敏感性。",
      "query 太少会让 outer gradient 和评估方差大；先增加 query 再盲目增加模型。",
      "类不平衡时保留真实先验和均衡 episode 两套结果。",
    ],
    settings: [
      {
        name: "N-way / K-shot",
        start: "先按真实上线一次会出现的类别数和标注预算设置。",
        adjust: "部署任务更宽或更少样本时，做跨 N/K 压力测试并重新校准。",
      },
      {
        name: "query 数量",
        start: "每类至少保留多个独立 query，使 task loss 不被单个样本支配。",
        adjust: "outer gradient 抖动或置信区间过宽时增加 query 或任务 batch。",
      },
      {
        name: "meta split",
        start: "按类别、用户、域或时间中真正代表新任务的单位隔离。",
        adjust:
          "若部署同时包含新类与新域，应采用交叉域 meta-test，而非只隔离类别。",
      },
    ],
    modifications: [
      "回归任务用 context/target points 代替 N-way 类别。",
      "跨域 few-shot 可让 meta-test 同时更换类别与数据来源。",
    ],
    pitfalls: [
      "把 query 放进 prototype、梯度更新或早停，造成 episode 内泄漏。",
      "只在见过类别换样本，误把普通泛化当作 few-shot task generalization。",
    ],
    example:
      "5-way 1-shot 鸟类识别：训练、验证、测试使用互不相交的物种；每个测试 episode 用 5 张 support 适配，再在 75 张独立 query 上评分。",
    compareTo: [
      "few-shot-learning",
      "prototypical-networks",
      "meta-learning-maml",
      "cross-domain-few-shot",
    ],
  },
  {
    id: "fomaml-reptile",
    source: {
      label: "Nichol et al.: On First-Order Meta-Learning Algorithms",
      url: "https://arxiv.org/abs/1803.02999",
    },
    title: "FOMAML 与 Reptile：省掉二阶导数",
    englishTitle: "First-Order MAML and Reptile",
    category: "adaptation",
    level: "高级",
    duration: "14 分钟",
    icon: "≈",
    summary:
      "用一阶近似保留跨任务快速适配目标，降低 MAML 的高阶梯度、显存与实现成本。",
    intuition:
      "MAML 精确追问“改变起点会怎样改变适配后的结果”；FOMAML 忽略一部分曲率。Reptile 更直接：先在任务里学几步，再把共同起点朝任务终点拉近。",
    core: "FOMAML 对 query loss 求适配参数 θ′ 的梯度，并近似把 dθ′/dθ 当作单位映射。Reptile 在同一任务做 k 步 SGD 得 θ′，再用 θ←θ+ε(θ′−θ) 更新初始化。多步和跨 batch 采样使更新包含促进任务内梯度一致的项；它不是简单联合训练。",
    equation: "FOMAML: g≈∇θ′LQ(θ′);  Reptile: θ←θ+ε(θ′−θ)",
    mechanicsSteps: [
      "采一批任务并从共享 θ 复制任务参数，每个任务只读取自己的 support。",
      "FOMAML 在 support 适配后用 query 求一阶梯度；停止追踪 inner update 的 Hessian 路径。",
      "Reptile 在任务内用多个 mini-batches 更新到 θ′，直接取参数差 θ′−θ 作为 meta direction。",
      "在未见任务用相同适配步数比较 MAML、FOMAML、Reptile、普通预训练；同时报告速度、显存和精度。",
    ],
    whenToUse: [
      "MAML 二阶图超出显存或框架实现复杂度时。",
      "需要一个简洁的一阶 optimization-based meta-learning 基线时。",
    ],
    limits: [
      "近似会丢失曲率信息，在敏感任务上可能弱于完整 MAML。",
      "Reptile 若每任务只有一步或重复同一 batch，会更接近普通联合训练。",
    ],
    howToUse: [
      "先复现相同 episode 的普通微调与完整 MAML 小模型结果。",
      "明确 inner batch 顺序、步数、α 与 meta step ε；保存任务级随机种子。",
      "检查每任务适配后 query 是否普遍改善，而非少数任务拉高平均。",
      "用墙钟、峰值显存和 task batch 大小解释一阶近似的工程收益。",
    ],
    tuning: [
      "Reptile inner steps 从 2–5 起步，确保使用不同 support mini-batches。",
      "meta step ε 通常逐步衰减；震荡时先降 ε 再增加 inner steps。",
      "FOMAML 与 MAML 应匹配任务 batch 和适配协议，避免计算预算混杂。",
    ],
    settings: [
      {
        name: "inner steps k",
        start: "用部署允许的 2–5 步，并跨步读取不同 support 子批。",
        adjust: "query 先升后降时减少步数或 α；完全无适配则检查任务差异。",
      },
      {
        name: "inner learning rate α",
        start: "选能稳定降低 support loss 且不破坏 query 的范围。",
        adjust: "任务终点分散或出现 NaN 时降低；适配不足时小幅提高。",
      },
      {
        name: "meta step ε / β",
        start: "从保守值配合 warmup 或衰减，并平均多个任务方向。",
        adjust: "跨任务方向互相抵消时增加任务 batch 或重审任务族。",
      },
    ],
    modifications: [
      "ANIL 只在 inner loop 更新 head，进一步减少计算。",
      "可对 backbone 分层设置是否参与 inner loop，形成速度与可塑性的折中。",
    ],
    pitfalls: [
      "把 Reptile 写成每任务一步、同一 batch 更新，却期望完整 meta-learning 效果。",
      "detach 位置错误会让 FOMAML 意外保留二阶图或彻底切断 query 梯度。",
    ],
    example:
      "字符任务上每个 episode 做 5 步 support SGD；Reptile 把初始化向每个任务的终点移动，再在未见字符集按同样 5 步适配。",
    compareTo: [
      "meta-learning-maml",
      "meta-sgd-anil",
      "episodic-meta-learning",
      "transfer-learning-strategies",
    ],
  },
  {
    id: "matching-networks",
    source: {
      label: "Vinyals et al.: Matching Networks for One Shot Learning",
      url: "https://arxiv.org/abs/1606.04080",
    },
    title: "Matching Networks：让 query 注意支持样本",
    englishTitle: "Matching Networks",
    category: "adaptation",
    level: "进阶",
    duration: "12 分钟",
    icon: "⌁",
    summary:
      "把 query 与每个 support embedding 比较，用 attention 权重汇总 support 标签，无需测试时梯度更新。",
    intuition:
      "不是先把每类压成一个中心，而是让新样本逐个查看所有带标签示例：越像哪个示例，就越多继承它的标签。",
    core: "Matching Networks 用 support encoder g 和 query encoder f 产生上下文相关表示，attention a(x,xᵢ) 常由 cosine similarity softmax 得到，预测为 support one-hot 标签的加权和。训练与测试都按 episode 执行，full context embedding 可让 support 相互影响。",
    equation: "p(y|x,S)=Σᵢ a(f(x),g(xᵢ))·1[yᵢ=y]",
    mechanicsSteps: [
      "采样 N-way K-shot support 与独立 query，并用共享或上下文 encoder 得到向量。",
      "计算 query 到每个 support 的 cosine similarity，除温度后对全部 support 做 softmax。",
      "用注意力权重加权 one-hot 标签；同类多个 support 的权重相加得到类别概率。",
      "跨 episodes 用 query 交叉熵训练 encoder；新任务只前向计算，不执行梯度适配。",
    ],
    whenToUse: [
      "support 很小且希望保留每个示例而非只保留均值时。",
      "需要无梯度测试时适配，并想和 ProtoNet 比较时。",
    ],
    limits: [
      "推理成本随 support 数增长，噪声 support 会直接参与投票。",
      "全上下文编码对 support 顺序与实现敏感，规模大时较重。",
    ],
    howToUse: [
      "先实现冻结 embedding + cosine kNN 作为可解释基线。",
      "对每个 episode 检查 attention 权重总和与同类权重聚合。",
      "严格让 meta-test 类别不出现在 encoder 的监督训练标签中。",
      "画出错误 query 最关注的 support，区分表示错误和标注噪声。",
    ],
    tuning: [
      "温度控制权重尖锐度，应用 meta-validation 而非 test 选择。",
      "K 增大时观察推理成本和错误 support 的影响。",
      "embedding 归一化、support 上下文编码与 query encoder 应做消融。",
    ],
    settings: [
      {
        name: "similarity temperature",
        start: "从归一化 cosine 与温度 1 开始。",
        adjust: "权重过平时降低，过度相信单样本时提高并检查校准。",
      },
      {
        name: "support encoder",
        start: "先让 support/query 共享简单 encoder。",
        adjust: "基线稳定后再加入 full-context embedding，并报告额外成本。",
      },
      {
        name: "support size",
        start: "匹配真实 N-way K-shot 预算。",
        adjust: "support 增长时考虑 prototype 或检索裁剪，避免线性延迟失控。",
      },
    ],
    modifications: [
      "可先按类别聚合 attention，减轻样本数不均造成的先验偏差。",
      "与可学习关系模块结合会接近 Relation Network。",
    ],
    pitfalls: [
      "对 support 样本而非类别 softmax，却忽略每类样本数不同造成的偏置。",
      "把 query 混入 support context 产生 transductive 信息，却仍宣称 inductive。",
    ],
    example:
      "3-way 2-shot 声音分类：query 对 6 段带标签声音分配相似度权重，再把同类两段的权重相加作为类别概率。",
    compareTo: [
      "prototypical-networks",
      "relation-networks",
      "knn",
      "few-shot-learning",
    ],
  },
  {
    id: "relation-networks",
    source: {
      label:
        "Sung et al.: Learning to Compare—Relation Network for Few-Shot Learning",
      url: "https://arxiv.org/abs/1711.06025",
    },
    title: "Relation Network：把距离函数也学出来",
    englishTitle: "Relation Networks for Few-Shot Learning",
    category: "adaptation",
    level: "进阶",
    duration: "12 分钟",
    icon: "≋",
    summary:
      "把 query 与每类 support 表示组成 pair，让一个小网络学习 relation score，而非固定欧氏或余弦距离。",
    intuition:
      "有些相似性不是直线距离能表达。Relation module 像一个专门的比较员，学习哪些局部差异对当前任务真正重要。",
    core: "Embedding module 先编码样本；同类 K-shot feature 通常聚合后与 query feature 拼接，再交给 relation module gφ 输出 [0,1] 分数。Episodic training 让正确类别 pair 得高分、错误类别得低分，原方案用均方误差训练 relation score。",
    equation: "rₖ=gφ([Σ(xᵢ,yᵢ=k)fθ(xᵢ), fθ(xq)]);  L=Σₖ(rₖ−1[yq=k])²",
    mechanicsSteps: [
      "在 episode 内分别编码 support 与 query，按类别聚合 support feature map。",
      "把 query 与每类表示沿通道拼接，形成 N 个 relation pairs。",
      "relation module 为每个 pair 输出相似度分数，用正确类为 1、其余为 0 的目标训练。",
      "meta-test 新类时冻结比较机制，只从新 support 构造 pairs 并取最高 relation score。",
    ],
    whenToUse: [
      "固定距离明显无法表达结构化相似性，且有足够 episodes 学比较器时。",
      "希望 metric-based 方法仍保持无梯度新任务推理时。",
    ],
    limits: [
      "可学习比较器更容易过拟合训练任务和数据域。",
      "每个 query 与每类都运行 relation module，类别很多时成本增加。",
    ],
    howToUse: [
      "先与 ProtoNet 欧氏距离和 Matching cosine 做同 encoder 对照。",
      "检查 score 是否校准，并分别看见过域与新域。",
      "固定 support 聚合方式，避免 K 变化时 feature 尺度漂移。",
      "对 relation module 宽度、输入顺序和类别置换做消融。",
    ],
    tuning: [
      "relation module 从小网络开始，训练过快饱和时减容量或加正则。",
      "K-shot 求和会随 K 放大，K 可变时考虑均值或归一化。",
      "输出激活与 loss 必须配套；BCE 使用 logits 时不要先 sigmoid。",
    ],
    settings: [
      {
        name: "relation capacity",
        start: "先用浅层卷积/MLP，并匹配 embedding 空间尺寸。",
        adjust: "训练分数完美而新任务差时减小容量或增加任务多样性。",
      },
      {
        name: "support aggregation",
        start: "固定 K 时复现论文聚合；通用实现优先均值并记录 K。",
        adjust: "K 变化导致 score 漂移时归一化或让聚合器显式读取 K。",
      },
      {
        name: "score objective",
        start: "先复现 MSE relation score，再对照 BCE logits。",
        adjust: "分数不校准时在 meta-val 调温度，不触碰 meta-test。",
      },
    ],
    modifications: [
      "用 cross-attention 代替简单拼接，让比较器对齐局部区域。",
      "多 prototype 可处理单类多模态，再由 relation module比较。",
    ],
    pitfalls: [
      "relation module 看到类别固定位置，学会位置捷径；episode 内必须随机置换类别。",
      "比较不同方法时同时更换 backbone，无法判断收益来自 metric 还是容量。",
    ],
    example:
      "5-way 1-shot 零件缺陷识别中，relation network 学会比较局部纹理组合；新缺陷类别只需每类一张 support。",
    compareTo: [
      "matching-networks",
      "prototypical-networks",
      "siamese-triplet",
      "cross-domain-few-shot",
    ],
  },
  {
    id: "siamese-triplet",
    source: {
      label:
        "Schroff et al.: FaceNet—A Unified Embedding for Face Recognition and Clustering",
      url: "https://arxiv.org/abs/1503.03832",
    },
    title: "Siamese 与 Triplet：先学会比较",
    englishTitle: "Siamese Networks and Triplet Learning",
    category: "adaptation",
    level: "进阶",
    duration: "13 分钟",
    icon: "⫯",
    summary:
      "共享权重编码 pair 或 triplet，用相似度损失塑造 embedding，再用阈值、近邻或 prototype 处理新类。",
    intuition:
      "模型不必先记住固定类别名，可以先回答“两样东西是不是同类”。Anchor 应靠近 positive，并与 negative 至少保持一段 margin。",
    core: "Siamese twin towers 共享参数，contrastive loss 拉近正 pair、推远负 pair。Triplet loss 比较 anchor-positive 与 anchor-negative 距离，只有违反 margin 的 triplet 产生梯度。采样策略决定大部分训练信号；部署阈值需在独立验证 pair 上选择。",
    equation: "Ltriplet=max(0,d(a,p)−d(a,n)+m)",
    mechanicsSteps: [
      "用同一 encoder 编码 anchor、positive、negative，确认三路权重完全共享。",
      "计算正负距离；若 d(a,n) 已比 d(a,p)+margin 更远，该 triplet loss 为 0。",
      "在 batch 内挖掘 semi-hard 或 hard negatives，避免全是零损失或极端噪声。",
      "训练后冻结 embedding，用新类 support 做 kNN/prototype，或在验证 pair 上选 verification threshold。",
    ],
    whenToUse: [
      "类别经常增加，任务更关心验证、检索或相似度时。",
      "能构造可靠 pair/triplet，但固定多类 head 不适合时。",
    ],
    limits: [
      "组合数量巨大且采样偏差强，错误负样本会破坏语义空间。",
      "embedding 距离并不自动给出校准概率或业务可用阈值。",
    ],
    howToUse: [
      "先建立分类预训练 embedding 与随机/半难负样本基线。",
      "批内记录有效 triplet 比例、正负距离分布和假负样本。",
      "按实体隔离 train/val/test，避免同一对象不同增强跨集合。",
      "分别验证 retrieval recall、verification ROC 和新类 few-shot 准确率。",
    ],
    tuning: [
      "margin 太小信号弱，太大让大量不可能约束持续激活。",
      "batch 越大可挖掘负样本越多，但要避免把同义样本当负例。",
      "L2 normalization 后距离范围改变，需重新选择 margin 与阈值。",
    ],
    settings: [
      {
        name: "margin m",
        start: "归一化 embedding 先从中等 margin 小范围扫描。",
        adjust: "有效 triplet 近零时增大或改善采样；持续全激活时减小并查噪声。",
      },
      {
        name: "negative mining",
        start: "先用 batch semi-hard negatives，保留随机负样本对照。",
        adjust:
          "hard negatives 多为标注冲突时过滤；过易则增加 batch 或检索候选。",
      },
      {
        name: "embedding dimension",
        start: "从 64–256 维并做归一化开始。",
        adjust: "欠拟合再增加；检索存储/延迟紧张时降低并测召回。",
      },
    ],
    modifications: [
      "多相似度或监督对比损失一次利用 batch 中多个正负对。",
      "把类别文字作为另一塔可扩展到 zero-shot image-text matching。",
    ],
    pitfalls: [
      "随机 triplet 大多太容易导致 loss≈0，却误判为训练完成。",
      "在测试集选择距离阈值，泄漏实际部署 operating point。",
    ],
    example:
      "门禁人脸验证先学 128 维归一化 embedding，再在验证身份上选 cosine 阈值；新员工无需重训固定分类 head。",
    compareTo: [
      "triplet-loss",
      "contrastive-learning",
      "matching-networks",
      "prototypical-networks",
    ],
  },
  {
    id: "meta-sgd-anil",
    source: {
      label:
        "Li et al.: Meta-SGD—Learning to Learn Quickly for Few-Shot Learning",
      url: "https://arxiv.org/abs/1707.09835",
    },
    title: "Meta-SGD 与 ANIL：学更新规则或只改 head",
    englishTitle: "Meta-SGD and Almost No Inner Loop",
    category: "adaptation",
    level: "高级",
    duration: "13 分钟",
    icon: "α",
    summary:
      "Meta-SGD 为每个参数学习更新步长与方向；ANIL 则固定表示，只在 inner loop 快速更新任务 head。",
    intuition:
      "MAML 给所有参数同一类更新规则。Meta-SGD 连“每个参数走多远、是否反向走”也学；ANIL 问另一件事：也许 backbone 已经会表示，新任务只需换最后的读出层。",
    core: "Meta-SGD 同时 meta-learn 初始化 θ 与逐参数 α，inner update 为 θ′=θ−α⊙∇Lsupport。ANIL 保留 MAML outer objective，但 inner loop 只更新 head，减少高阶计算并检验快速适配究竟来自 feature reuse 还是 feature change。",
    equation:
      "Meta-SGD: θ′=θ−α⊙∇θLS(θ);  ANIL: w′=w−α∇wLS(φ,w), φ fixed inner-loop",
    mechanicsSteps: [
      "为每个 episode 从共享 backbone/head 初始化开始，用 support 计算梯度。",
      "Meta-SGD 用可学习向量 α 逐元素缩放梯度；α 可改变大小甚至方向。",
      "ANIL 只更新任务 head w，backbone φ 在 inner loop 不变，但 outer query loss 仍更新 φ。",
      "在 meta-test 比较全参数适配、head-only、linear probe 与 prototype，报告计算和新域差异。",
    ],
    whenToUse: [
      "想提高一步适配的表达力，或诊断 MAML 是否主要复用特征时。",
      "部署只能快速更新少量参数，希望用 ANIL 降成本时。",
    ],
    limits: [
      "Meta-SGD 为每个参数再存 α，易过拟合有限任务并增加 meta 参数。",
      "ANIL 遇到需要改变底层特征的新域时可能不足。",
    ],
    howToUse: [
      "先让 MAML 与 head-only 共享完全相同的 episode 和 backbone。",
      "记录每层 α 分布、更新 norm 与 query 改善，识别异常反向步长。",
      "限制测试适配层与训练时一致，不临时解冻更多层。",
      "跨相近任务和跨域任务分别比较 feature reuse 假设。",
    ],
    tuning: [
      "α 初始化过大会一步越过低点；先用普通 inner LR 的小值。",
      "对 α 加约束或分层共享可减少参数与过拟合。",
      "ANIL head 容量太大会记 support，需用 query 曲线选正则。",
    ],
    settings: [
      {
        name: "α granularity",
        start: "先逐层或逐张量共享，再比较逐参数 α。",
        adjust: "任务多且逐参数收益稳定时再增加自由度；过拟合则重新共享。",
      },
      {
        name: "adapted layers",
        start: "ANIL 只更新最后 head，并记录可训练参数数。",
        adjust: "跨域特征失配时逐块解冻，形成清晰消融。",
      },
      {
        name: "inner steps",
        start: "先用 1 步验证 Meta-SGD 的设计目标。",
        adjust: "增加步数时检查 α 是否仍稳定，必要时每步独立或共享。",
      },
    ],
    modifications: [
      "让 α 由 task embedding 条件生成，实现任务相关更新。",
      "只为 normalization affine 或 adapter 学 α，可控制部署状态。",
    ],
    pitfalls: [
      "未限制 α 数值，少数参数产生极端更新并在混合精度下溢出。",
      "ANIL outer loop 误冻结 backbone，变成普通固定特征训练。",
    ],
    example:
      "新传感器分类中，ANIL 每个设备只更新小 head；若跨设备频谱变化大，再比较最后两层参与 inner loop。",
    compareTo: [
      "meta-learning-maml",
      "fomaml-reptile",
      "linear-probe",
      "transfer-learning-strategies",
    ],
  },
  {
    id: "learned-optimizers",
    source: {
      label:
        "Andrychowicz et al.: Learning to Learn by Gradient Descent by Gradient Descent",
      url: "https://arxiv.org/abs/1606.04474",
    },
    title: "Learned Optimizer：让网络提出更新量",
    englishTitle: "Learned Optimizers",
    category: "adaptation",
    level: "高级",
    duration: "14 分钟",
    icon: "∆",
    summary:
      "用一个 optimizer network 读取梯度与历史状态，输出被优化模型的参数更新，并通过展开后的最终损失训练。",
    intuition:
      "Adam 的更新规则由人写。Learned optimizer 把规则本身变成模型：观察梯度、动量和尺度后决定下一步，但也可能只会处理训练时见过的地形。",
    core: "Optimizee 参数 θt 产生梯度 gt；optimizer mφ(gt,ht) 输出 Δθt 与新状态。展开 T 步得到 θT，再用一段 loss 之和或终点 loss 对 φ 求 meta-gradient。长展开带来显存、梯度爆炸/消失和分布外泛化问题。",
    equation: "[Δθt,hₜ₊₁]=mφ(gₜ,hₜ); θₜ₊₁=θₜ+Δθt; minφ E[L(θT)]",
    mechanicsSteps: [
      "从 optimizee 任务分布采样模型、数据与初始参数，计算当前 loss 和 gradient。",
      "把预处理后的 gradient、参数尺度和 optimizer state 输入 learned optimizer，输出 update。",
      "展开多步并累计 meta-objective；反向穿过更新轨迹，或使用截断/隐式梯度。",
      "在未见架构、损失尺度和更长 horizon 上与 SGD/Adam 比较稳定性和墙钟。",
    ],
    whenToUse: [
      "拥有重复优化任务族，并愿意投入较高 meta-training 成本时。",
      "研究特定结构的快速求解器或自动更新规则时。",
    ],
    limits: [
      "对未见尺度、维度或更长优化步数常失稳。",
      "训练 learned optimizer 本身是昂贵的双层优化，未必胜过调好的 AdamW。",
    ],
    howToUse: [
      "先用低维凸函数和小网络验证更新符号、state 与 meta-gradient。",
      "训练任务中随机化尺度、初始化、维度和 horizon。",
      "设置 update clipping、数值有限性与 fallback optimizer。",
      "在未见 optimizee 和长于训练展开的步数上评估。",
    ],
    tuning: [
      "truncation horizon 太短会学短视策略，太长会使 meta-gradient 难优化。",
      "梯度预处理应保留符号并压缩极端尺度。",
      "optimizer state 宽度增加容量，也增加每参数内存和延迟。",
    ],
    settings: [
      {
        name: "unroll length",
        start: "从 10–20 步能稳定反传的短展开开始。",
        adjust: "长程退化时逐步加长或课程式增加，并监控 meta-gradient。",
      },
      {
        name: "gradient preprocessing",
        start: "使用 log-magnitude + sign 或归一化梯度。",
        adjust: "跨尺度失效时扩大训练尺度分布并加入 clipping。",
      },
      {
        name: "optimizer state",
        start: "小型 LSTM/MLP state 与逐参数共享权重。",
        adjust: "需要全局耦合时增加聚合统计，而非盲目给每参数大状态。",
      },
    ],
    modifications: [
      "学习超参数 schedule 而非完整更新，降低风险。",
      "用坐标共享加全局统计兼顾可扩展性与任务信息。",
    ],
    pitfalls: [
      "只在训练 optimizee 上更快，未测试新架构和更长 horizon。",
      "把计算 meta-gradient 的成本排除在总训练成本之外。",
    ],
    example:
      "针对同一类小型物理反演问题训练 learned optimizer；上线前必须在未见参数范围和两倍迭代长度上与 Adam 比较。",
    compareTo: [
      "gradient-descent",
      "adamw",
      "hypernetworks-meta-gradients",
      "automl-hpo-nas",
    ],
  },
  {
    id: "hypernetworks-meta-gradients",
    source: {
      label: "Ha et al.: HyperNetworks",
      url: "https://arxiv.org/abs/1609.09106",
    },
    title: "Hypernetwork 与 Meta-gradient：参数也可以由模型产生",
    englishTitle: "Hypernetworks and Meta-Gradients",
    category: "adaptation",
    level: "高级",
    duration: "14 分钟",
    icon: "H",
    summary:
      "让一个网络根据任务描述生成另一网络的权重或适配参数，并沿验证目标对生成器与超参数求梯度。",
    intuition:
      "普通模型用一套固定权重解决所有输入；hypernetwork 先读任务说明，再临时组装一套参数。Meta-gradient 则把“训练过程”也放进计算图，追踪超参数怎样影响最终验证结果。",
    core: "Hypernetwork hφ(zτ) 输出 target network 的全部或部分权重 θτ。任务 embedding 可来自 support set、域 ID 或上下文。若 θ*(λ) 由 inner optimization 定义，outer validation loss 对 λ 的梯度可通过 unrolling 或 implicit differentiation 计算。",
    equation: "θτ=hφ(zτ); y=fθτ(x);  dLval/dλ=∂Lval/∂λ+(∂Lval/∂θ*)(dθ*/dλ)",
    mechanicsSteps: [
      "把 support/task metadata 编码为 zτ，确保不使用 query 标签。",
      "hypernetwork 生成 adapter、head 或权重低秩因子，target network 用它完成任务。",
      "在 query/validation 上计算 outer loss，梯度回到 hypernetwork；若有 inner solve，再选择展开或隐式求导。",
      "检查生成权重的范数、跨任务平滑性与未见任务外推，并与共享模型和独立模型比较。",
    ],
    whenToUse: [
      "任务有可编码上下文，并需要快速生成个性化参数时。",
      "要对正则系数、学习率或数据权重做可微双层优化时。",
    ],
    limits: [
      "生成完整大模型权重成本高，通常只生成 adapter/head。",
      "task embedding 可能携带 ID 捷径，未见任务外推并无保证。",
    ],
    howToUse: [
      "从生成小 head 或 FiLM 参数开始，保留静态共享 backbone。",
      "固定 outer validation 划分，避免对同一数据同时 inner fit 与 outer selection。",
      "做 task embedding shuffle 与 unseen task 测试，检查是否只记住 ID。",
      "对 unroll 深度、implicit solver tolerance 和总计算做记录。",
    ],
    tuning: [
      "生成参数量过大时用低秩、分块或基向量组合。",
      "task encoder 容量过高会记任务，需 dropout/正则和新任务验证。",
      "隐式梯度不稳定时先验证 Hessian-vector product 与 solver residual。",
    ],
    settings: [
      {
        name: "generated scope",
        start: "只生成 head、adapter 或 normalization affine。",
        adjust: "任务差异仍大且证据充分时扩大到后层，持续监控参数量。",
      },
      {
        name: "task embedding",
        start: "用 support 的 permutation-invariant pooling。",
        adjust: "多模态任务可加入元数据，但必须测试缺失和错误元数据。",
      },
      {
        name: "meta-gradient method",
        start: "小步数用 exact unroll 建正确性基线。",
        adjust: "内循环长时再用截断或 implicit gradient，并比较偏差。",
      },
    ],
    modifications: [
      "生成 LoRA A/B 或 prompt tokens，可与参数高效微调结合。",
      "加入不确定性 head，对任务信息不足时拒绝过度个性化。",
    ],
    pitfalls: [
      "query 统计进入 task embedding，使 outer evaluation 泄漏。",
      "只检查生成权重形状，不检查 target network 实际使用的是新权重。",
    ],
    example:
      "多医院模型用每院少量 support 汇总成 task embedding，hypernetwork 只生成最后分类 head；新医院无 query 标签参与。",
    compareTo: [
      "meta-sgd-anil",
      "learned-optimizers",
      "transfer-lora",
      "multi-task-learning",
    ],
  },
  {
    id: "memory-augmented-meta-learning",
    source: {
      label:
        "Santoro et al.: Meta-Learning with Memory-Augmented Neural Networks",
      url: "https://arxiv.org/abs/1605.06065",
    },
    title: "Memory-Augmented Meta-Learning：把新标签写进外部记忆",
    englishTitle: "Memory-Augmented Meta-Learning",
    category: "adaptation",
    level: "高级",
    duration: "12 分钟",
    icon: "▤",
    summary:
      "用可读写 memory 把当前 episode 的样本与标签快速绑定，模型权重保持不变也能适配新类。",
    intuition:
      "遇到新概念时不必立即重写长期记忆，可以先在工作记忆里放一张“样本→标签”的临时卡片，随后用内容相似度把它取回。",
    core: "Controller 编码当前样本，并用 content-based addressing 读取 memory；标签常延迟一步输入，迫使系统先存样本、下一次再利用绑定。LRUA 等写入规则选择最少使用位置。训练跨 episodes 学会读写策略，测试时 memory state 必须按 task 正确重置。",
    equation: "rₜ=Σᵢ softmax(sim(kₜ,Mᵢ))Mᵢ;  p(yₜ)=g(hₜ,rₜ)",
    mechanicsSteps: [
      "episode 开始清空或初始化 memory，输入样本表示但把其标签延迟到下一步。",
      "controller 产生 read key，对 memory slots 做相似度寻址并读取加权内容。",
      "把当前样本与上一时刻标签写入选定 slot，维护 usage 或 least-recently-used 状态。",
      "在同一任务后续样本上训练预测，并测试 memory 容量、顺序与任务重置。",
    ],
    whenToUse: [
      "任务是快速绑定新符号或标签，且允许保留 episode 内状态时。",
      "想研究无梯度快速适配与序列式 few-shot 学习时。",
    ],
    limits: [
      "memory 容量和读写顺序限制可扩展性，长 episode 会覆盖。",
      "状态跨用户或任务错误复用会产生严重信息泄漏。",
    ],
    howToUse: [
      "先在小型 one-shot 序列任务验证标签延迟与 slot 写入。",
      "明确 reset 边界和并发会话的独立 memory。",
      "记录读写权重熵、slot usage 与容量溢出。",
      "与 kNN 缓存、Matching Networks 和固定上下文 transformer 比较。",
    ],
    tuning: [
      "slot 数应覆盖预期 episode 概念数并留余量。",
      "寻址温度过低会硬锁错误 slot，过高会混合多个标签。",
      "controller 太强可能绕过 memory，需 memory ablation。",
    ],
    settings: [
      {
        name: "memory slots",
        start: "从略高于 episode 最大独特样本数开始。",
        adjust: "覆盖频繁时增大或改写入策略；延迟敏感则限制容量。",
      },
      {
        name: "read temperature",
        start: "先让相似度权重不过度尖锐。",
        adjust: "读出混杂则降低；错误一旦写入后持续放大则提高。",
      },
      {
        name: "reset policy",
        start: "每个独立 task/session 完全重置。",
        adjust: "跨 episode memory 必须成为明确研究变量并防止标签泄漏。",
      },
    ],
    modifications: [
      "把外部 memory 替换为可检索 support 向量库，获得透明近邻。",
      "加入遗忘门或分层 memory，分开短期 task state 与长期知识。",
    ],
    pitfalls: [
      "训练和测试的标签输入时序不一致。",
      "批处理中不同 episode 共用 memory slots，造成跨任务串线。",
    ],
    example:
      "新符号分类中第一次看到符号和标签后写入 memory，第二次出现相似符号时通过内容寻址读取标签。",
    compareTo: [
      "matching-networks",
      "in-context-learning",
      "rnn",
      "episodic-meta-learning",
    ],
  },
  {
    id: "meta-reinforcement-learning",
    source: {
      label:
        "Duan et al.: RL²—Fast Reinforcement Learning via Slow Reinforcement Learning",
      url: "https://arxiv.org/abs/1611.02779",
    },
    title: "Meta-RL：让 agent 学会快速探索新任务",
    englishTitle: "Meta Reinforcement Learning / RL²",
    category: "adaptation",
    level: "高级",
    duration: "14 分钟",
    icon: "↯",
    summary:
      "在任务分布上训练带记忆的策略，让隐藏状态或少量梯度更新承担对新 MDP 的在线适配。",
    intuition:
      "普通 RL 在一个环境里学策略；Meta-RL 学的是面对一批相似新环境时先试什么、怎样从奖励推断任务，再快速利用。",
    core: "RL² 把上一动作、奖励、终止信号与当前观察输入 recurrent policy，RNN hidden state 在一个 trial 内充当学习算法；权重跨 trials 用慢速 RL 更新。另一类 gradient-based Meta-RL 对 support trajectories 做 inner update。评估必须在未见 MDP 上同时衡量探索速度与最终回报。",
    equation: "aₜ∼πθ(a|oₜ,aₜ₋₁,rₜ₋₁,dₜ₋₁,hₜ); hₜ₊₁=RNNθ(hₜ,·)",
    mechanicsSteps: [
      "定义任务分布 p(MDP)，隔离训练与测试的目标、动力学或奖励参数。",
      "一个 trial 内运行多个 episodes，不重置 recurrent hidden state，让 agent 从动作和奖励积累任务证据。",
      "trial 结束后用 PPO/A2C 等更新共享策略权重；下一个 trial 重置 hidden state 并换任务。",
      "在未见 MDP 画随 episode 变化的回报、探索覆盖与后悔值，而非只看最后一局。",
    ],
    whenToUse: [
      "会重复遇到同族新环境，并允许在部署中交互探索时。",
      "bandit、自适应控制或个性化策略需要快速在线识别任务时。",
    ],
    limits: [
      "训练任务分布外的目标或动力学可能导致探索策略失效。",
      "真实环境探索可能昂贵或不安全，不能只靠平均回报。",
    ],
    howToUse: [
      "从可解析 bandit 任务检验 hidden state 是否编码后验和探索。",
      "清楚区分 episode reset、trial reset 与模型参数更新。",
      "与 oracle task ID、普通 recurrent RL、context encoder 做对照。",
      "报告适配曲线、最坏任务、安全约束与交互样本数。",
    ],
    tuning: [
      "trial 长度要足以先探索再利用，但与部署预算一致。",
      "任务分布太窄会记策略，太宽则学不到共享结构。",
      "熵奖励与 recurrent state 容量共同影响探索。",
    ],
    settings: [
      {
        name: "episodes per trial",
        start: "按部署允许的适应轮次设置，并至少包含探索与利用阶段。",
        adjust: "后期仍无改善时检查任务可辨识性，而非只延长 trial。",
      },
      {
        name: "task distribution",
        start: "覆盖真实任务参数范围并保留未见组合。",
        adjust: "分布外失效时扩展训练覆盖或加入不确定性与安全 fallback。",
      },
      {
        name: "recurrent state",
        start: "小型 GRU/LSTM 并在 trial 边界重置。",
        adjust: "证据不足再增加容量；先排除 reset 和 truncated BPTT 错误。",
      },
    ],
    modifications: [
      "显式 context encoder 从最近轨迹推断 latent task。",
      "结合 offline meta-RL，减少新任务在线探索，但需处理行为覆盖。",
    ],
    pitfalls: [
      "在测试任务继续更新共享权重，混淆 hidden-state 适配与在线训练。",
      "随机种子或环境 ID 泄漏任务，使 agent 无需真正探索。",
    ],
    example:
      "新用户推荐 bandit 中，agent 前几轮试探偏好，hidden state 汇总点击证据，随后把流量集中到更可能的类别。",
    compareTo: [
      "multi-armed-bandit",
      "ppo",
      "offline-rl",
      "memory-augmented-meta-learning",
    ],
  },
  {
    id: "cross-domain-few-shot",
    source: {
      label: "Triantafillou et al.: Meta-Dataset",
      url: "https://arxiv.org/abs/1903.03096",
    },
    title: "Cross-Domain Few-Shot：新类别还来自新领域",
    englishTitle: "Cross-Domain Few-Shot Learning",
    category: "adaptation",
    level: "高级",
    duration: "13 分钟",
    icon: "⇄",
    summary:
      "同时改变类别、图像风格或数据来源，检验 meta-learner 是否学会适配而非记住单一 benchmark。",
    intuition:
      "在照片上学会少样本分类，不等于能在显微镜、卫星或手绘图上少样本适配。新任务的“新”可以同时发生在标签和输入分布。",
    core: "标准 few-shot 常在同一 dataset 内做 class-disjoint split；cross-domain 评估把 meta-test 放到不同数据源。强预训练 backbone、feature normalization 和简单 linear/prototype adaptation 常是重要基线。必须分开报告 within-domain 与 cross-domain gap。",
    equation: "τtrain∼p_source(τ), τtest∼p_target(τ), p_source≠p_target",
    mechanicsSteps: [
      "按 dataset/domain 划分 source meta-train 与完全独立 target meta-test，再在各域内隔离类别。",
      "在 source episodes 训练 encoder/meta-learner，并只用 source meta-val 选超参数。",
      "target task 到来后只读取其少量 support；比较 frozen features、prototype、head fine-tune 与 meta-update。",
      "按 target domain、shot 数和 domain gap 报告结果，检查强预训练是否比复杂 meta 方法更稳。",
    ],
    whenToUse: [
      "上线领域与标注任务都会变化，如医学机构、遥感传感器或新语言。",
      "要验证 few-shot 方法的实际迁移能力，而非同数据集类拆分。",
    ],
    limits: [
      "目标域 support 极少时，无法可靠估计归一化或重学底层特征。",
      "若目标域完全未知，任何 source-only 选择都可能偏离部署。",
    ],
    howToUse: [
      "保留至少一个完整域作为从未触碰的 final test。",
      "用大规模通用预训练 + linear/prototype 建强基线。",
      "冻结 BatchNorm 或明确目标域统计更新策略。",
      "做支持集大小、backbone 层解冻与数据增强的域级消融。",
    ],
    tuning: [
      "跨域时小学习率与少量层解冻通常比全量微调稳定。",
      "support augmentation 必须保持目标语义，避免风格增强改变标签。",
      "用 source validation 选择策略后锁定，不按 target test 反复调参。",
    ],
    settings: [
      {
        name: "adaptation scope",
        start: "prototype 或线性 head 起步，再逐层解冻。",
        adjust: "域差大且 support 足够时扩展；过拟合时退回浅层适配。",
      },
      {
        name: "normalization",
        start: "小 support 时冻结训练统计或用 LayerNorm backbone。",
        adjust: "目标数据足够且在线协议允许时比较 target statistics。",
      },
      {
        name: "domain split",
        start: "以完整数据来源为单位留出。",
        adjust: "多因素变化时按机构×时间×设备组合做最坏切片。",
      },
    ],
    modifications: [
      "在 source training 做 domain randomization 或风格扰动。",
      "用 domain-adversarial 表示学习，但保留 source task 可分性。",
    ],
    pitfalls: [
      "target domain 参与 backbone/增强/超参数选择，最终不再是未知域。",
      "把同患者或同地点的不同样本分到 source 与 target。",
    ],
    example:
      "自然照片 meta-train 后，在显微细胞新类别上 5-shot 测试；同一 support 分别跑 prototype、ANIL 与全量微调。",
    compareTo: [
      "episodic-meta-learning",
      "domain-adaptation-dann",
      "domain-generalization-irm",
      "transfer-learning-strategies",
    ],
  },
  {
    id: "transfer-learning-strategies",
    source: {
      label:
        "Yosinski et al.: How Transferable Are Features in Deep Neural Networks?",
      url: "https://arxiv.org/abs/1411.1792",
    },
    title: "迁移学习策略：冻结、解冻还是重新训练",
    englishTitle: "Transfer Learning Strategies",
    category: "adaptation",
    level: "进阶",
    duration: "13 分钟",
    icon: "⇢",
    summary:
      "根据数据量与领域差异，在 linear probe、逐层解冻、全量微调和从头训练之间做有证据的选择。",
    intuition:
      "预训练模型像已经学会通用视觉或语言的员工。新任务相近时只换工作说明；差异大时需要重训后层甚至底层，但样本少时改得太多会忘掉原能力。",
    core: "底层特征通常更通用，高层更任务相关，但具体可迁移性取决于架构与域。冻结 backbone 只训练 head 是低方差基线；discriminative learning rates 与 gradual unfreezing 可降低破坏；全量 fine-tuning 容量最大也最易过拟合。",
    equation: "θ* = argminθtask Ltarget(θpretrained,θtask)+λ‖θ−θpretrained‖²",
    mechanicsSteps: [
      "选与输入模态和预训练目标相符的 checkpoint，复现其预处理与 tokenizer。",
      "冻结 backbone 训练 head，建立 linear probe；记录 train/eval mode 和 normalization。",
      "按从高到低逐块解冻，用较小 backbone LR，并比较验证曲线与遗忘。",
      "最终与从头训练和参数高效适配比较质量、数据、显存、延迟和维护成本。",
    ],
    whenToUse: [
      "目标标签有限且有相近领域的可靠预训练模型时。",
      "需要快速建立强 baseline，再决定是否使用 meta-learning 时。",
    ],
    limits: [
      "预训练偏差和错误特征会负迁移，规模大不保证匹配。",
      "输入规范、标签语义或 normalization 不一致会破坏迁移。",
    ],
    howToUse: [
      "先锁定数据 split 和目标指标，再选 checkpoint。",
      "依次运行 head-only、后层解冻、全量微调，而非同时改变所有设置。",
      "保存适配前后在源任务或通用探针上的性能。",
      "对小数据使用多个 seeds 和置信区间。",
    ],
    tuning: [
      "backbone LR 常比 head LR 小 10–100 倍。",
      "小数据先加强增广/权重衰减和早停，再增加解冻层。",
      "领域差异大时更值得比较自监督中间训练或 adapter。",
    ],
    settings: [
      {
        name: "freeze depth",
        start: "head-only 起步，随后从最后 block 逐步解冻。",
        adjust: "欠拟合且数据足够时扩大；验证下降时减少。",
      },
      {
        name: "layer-wise LR",
        start: "head 用基础 LR，backbone 低 10–100 倍。",
        adjust: "后层无变化时略增；早期特征漂移或遗忘时降低。",
      },
      {
        name: "preprocessing",
        start: "严格复用 checkpoint 的尺寸、归一化、tokenizer。",
        adjust: "改变前先单独验证并记录，避免静默分布错位。",
      },
    ],
    modifications: [
      "LoRA、adapter、prompt tuning 限制可训练参数。",
      "先做目标域自监督继续预训练，再用少量标签微调。",
    ],
    pitfalls: [
      "只把 requires_grad=False，却让 BatchNorm running stats 持续变化。",
      "挑选最适合 test 的 checkpoint 或解冻层，造成评估泄漏。",
    ],
    example:
      "病理分类先冻结通用视觉 encoder 训练 head，再只解冻最后 block；患者级测试保持封闭，并与从头训练比较。",
    compareTo: [
      "linear-probe",
      "transfer-lora",
      "meta-learning-maml",
      "cross-domain-few-shot",
    ],
  },
  {
    id: "domain-adaptation-dann",
    source: {
      label: "Ganin et al.: Domain-Adversarial Training of Neural Networks",
      url: "https://arxiv.org/abs/1505.07818",
    },
    title: "DANN：让特征能做任务却难分领域",
    englishTitle: "Domain-Adversarial Neural Networks",
    category: "adaptation",
    level: "高级",
    duration: "14 分钟",
    icon: "⇆",
    summary:
      "用 gradient reversal 同时训练标签分类器与域分类器，使表示保留任务信息并减少 source/target 可区分性。",
    intuition:
      "特征要让主任务老师容易判标签，却让领域侦探猜不出来自旧设备还是新设备。反转梯度让 encoder 主动混淆领域。",
    core: "Source 有任务标签，target 可无标签。Feature extractor 接 label head 与 domain head；domain classifier 最小化域 loss，而 gradient reversal 把传给 extractor 的域梯度乘 −λ。若 label mechanism 在域间变化，强行对齐边缘分布可能产生负迁移。",
    equation: "minF,C maxD Ly(C(F(xs)),ys)−λLd(D(F(x)),domain)",
    mechanicsSteps: [
      "混合 source labeled batch 与 target unlabeled batch，记录 domain labels。",
      "encoder 产生 feature；label head 只在 source 求任务 loss，domain head 在两域求 domain loss。",
      "gradient reversal 对 domain head 正常更新，对 encoder 反转并缩放域梯度。",
      "在独立 target validation/test 检查任务性能、域可分性和每类对齐，避免只看 domain accuracy=50%。",
    ],
    whenToUse: [
      "训练时能访问无标签 target 数据，且 source/target 任务标签语义一致时。",
      "域差异主要是可对齐的输入/表示变化时。",
    ],
    limits: [
      "label shift 或 conditional shift 下，全局对齐可能把不同类混在一起。",
      "目标域完全不可访问时应使用 domain generalization，而不是 DANN。",
    ],
    howToUse: [
      "先训练 source-only baseline 并测 target gap。",
      "保持 source/target batch 平衡，画 label 与 domain loss。",
      "用类条件混淆矩阵或 feature 可视化检查错误对齐。",
      "保留 target 标签只用于验证/最终测试，严格记录可访问范围。",
    ],
    tuning: [
      "λ 从 0 warm up，避免训练初期域信号压过标签学习。",
      "domain head 太强会梯度饱和，太弱则无对齐压力。",
      "source/target sampling 比例改变有效域先验。",
    ],
    settings: [
      {
        name: "GRL λ",
        start: "从 0 随训练逐步升到小范围候选。",
        adjust: "source 任务崩溃则降低；域仍易分且 target 未改善时小幅提高。",
      },
      {
        name: "domain head capacity",
        start: "使用小型 MLP，不超过任务 head 太多。",
        adjust: "domain loss 立即为零时减弱或调 LR；一直随机则检查特征与标签。",
      },
      {
        name: "batch composition",
        start: "每步同时含 source 与 target，数量近似平衡。",
        adjust: "目标样本有限时重复采样需防过拟合，并报告独立目标集。",
      },
    ],
    modifications: [
      "类条件 domain alignment 可减少不同类别被强行混合。",
      "结合伪标签时只使用高置信且校准的 target 样本。",
    ],
    pitfalls: [
      "domain accuracy 接近 50% 也可能因为 domain head 没学会，不证明表示已对齐。",
      "把 target test 无标签输入用于反复训练和选参，却称为纯测试。",
    ],
    example:
      "从合成道路图像迁移到真实相机：source 提供分割标签，target 只提供图像；用 GRL 对齐中间特征。",
    compareTo: [
      "domain-shift",
      "domain-generalization-irm",
      "test-time-adaptation",
      "cross-domain-few-shot",
    ],
  },
  {
    id: "domain-generalization-irm",
    source: {
      label: "Arjovsky et al.: Invariant Risk Minimization",
      url: "https://arxiv.org/abs/1907.02893",
    },
    title: "Domain Generalization 与 IRM：目标域不可见怎么办",
    englishTitle: "Domain Generalization and Invariant Risk Minimization",
    category: "adaptation",
    level: "高级",
    duration: "14 分钟",
    icon: "∞",
    summary:
      "从多个 source environments 学在各环境都成立的预测关系，再到完全未见 target 测试。",
    intuition:
      "背景颜色在每个训练环境里的相关性会变化，而真正形状规律保持。若同一个分类器能在不同环境都最优，表示更可能依赖稳定信号。",
    core: "ERM 最小化所有 source 风险平均。IRM 希望学表示 Φ，使同一 classifier w 在每个 environment 都最优，实际常用 IRMv1 梯度惩罚近似。效果依赖 environment 划分与变化足够暴露伪相关；理论目标不保证真实深网总能找到因果特征。",
    equation: "minΦ,w Σe Re(w∘Φ)+λ‖∇w Re(w·Φ)|w=1‖²",
    mechanicsSteps: [
      "按机构、时间、设备或生成机制定义多个 source environments，不读取 target。",
      "先训练 ERM 与强数据增广基线，记录每环境风险。",
      "加入 invariant penalty，先低 λ 学任务，再提高约束；监控风险与 penalty。",
      "锁定模型后一次评估完全未见 target，并报告最差域而非只报平均。",
    ],
    whenToUse: [
      "训练有多个已知环境，但部署目标域无法访问时。",
      "怀疑环境间变化可帮助识别稳定预测关系时。",
    ],
    limits: [
      "环境划分无信息或伪相关在所有 source 同方向时，无法辨别。",
      "IRM 近似目标优化困难，可能不优于调好的 ERM。",
    ],
    howToUse: [
      "明确 environment 的因果与采集含义，不按标签随意切分。",
      "保留完整域作 final test；用 source-domain validation 选参。",
      "报告 ERM、group DRO、增广与 IRM 的同 backbone 对照。",
      "做特征/反事实检查验证是否真正减少伪相关。",
    ],
    tuning: [
      "penalty λ 常需 warmup，否则模型先学常数解。",
      "环境 batch 太小会让 penalty 梯度噪声大。",
      "模型选择准则不能依赖不可见 target。",
    ],
    settings: [
      {
        name: "environment definition",
        start: "用真实采集机制或已知干预定义。",
        adjust: "若域内差异大于域间差异，重审定义而非只调 λ。",
      },
      {
        name: "penalty weight λ",
        start: "先 ERM warmup，再从小到大扫描。",
        adjust: "任务风险升高且 penalty 无稳定改善时降低或改用更简单基线。",
      },
      {
        name: "model selection",
        start: "用多个 source leave-one-domain-out validation。",
        adjust: "source 排名与 target 不稳定时报告选择不确定性。",
      },
    ],
    modifications: [
      "Group DRO 优化最差 source group，可作为更直接鲁棒基线。",
      "domain randomization 主动扩大风格与机制覆盖。",
    ],
    pitfalls: [
      "用 target validation 选择 λ 后仍声称 domain generalization。",
      "把 invariance 等同因果性，忽略未观测混杂与环境覆盖不足。",
    ],
    example:
      "三家医院训练、第四家完全封闭测试；按医院为 environment，比 ERM、leave-one-hospital-out 与 IRM。",
    compareTo: [
      "domain-adaptation-dann",
      "domain-shift",
      "test-time-adaptation",
      "causal-treatment-effects",
    ],
  },
  {
    id: "continual-learning",
    source: {
      label:
        "Kirkpatrick et al.: Overcoming Catastrophic Forgetting in Neural Networks",
      url: "https://arxiv.org/abs/1612.00796",
    },
    title: "持续学习：在学新任务时别忘旧任务",
    englishTitle: "Continual Learning, EWC, Replay and GEM",
    category: "adaptation",
    level: "高级",
    duration: "15 分钟",
    icon: "↺",
    summary:
      "比较正则保护、知识蒸馏、经验回放和梯度约束，量化新知识获得与旧知识遗忘。",
    intuition:
      "模型连续上课，新课梯度会覆盖旧课用过的参数。EWC 保护重要参数，LwF 保持旧输出，replay 重看少量旧题，GEM 阻止更新伤害记忆样本。",
    core: "Task-incremental、domain-incremental、class-incremental 的可用 task ID 与输出空间不同。EWC 用 Fisher importance 惩罚关键参数漂移；LwF 蒸馏旧模型；experience replay 混合 memory；GEM 把梯度投影到不增加旧任务 loss 的可行区域。评估需用 accuracy matrix 计算 forgetting 与 forward/backward transfer。",
    equation: "LEWC=Lnew+λΣj Fj(θj−θ*j)²;  forgetting=maxpast acc−current acc",
    mechanicsSteps: [
      "定义任务流、是否提供 task ID、类别是否扩展，以及每步可保存的数据/模型预算。",
      "完成任务 t 后保存 checkpoint、Fisher/teacher 或有限 replay buffer，再学习 t+1。",
      "每学完一个任务，在所有已见任务上填 accuracy matrix；计算平均准确率、forgetting 与 transfer。",
      "比较 fine-tune、joint upper bound、EWC/LwF、replay/GEM，并报告内存与隐私成本。",
    ],
    whenToUse: [
      "数据按时间/任务到达且无法每次联合重训全部历史时。",
      "产品持续增加类别、域或用户行为，需要控制遗忘时。",
    ],
    limits: [
      "任务边界未知和 class-incremental 比有 task ID 的设置更难。",
      "replay 涉及存储、隐私与代表性；正则方法任务多时约束累积。",
    ],
    howToUse: [
      "先用 naive fine-tuning 和 joint training 上界界定遗忘。",
      "固定任务顺序和多个顺序种子，避免只报有利顺序。",
      "按每任务/每类记录 accuracy matrix，而非只看最后平均。",
      "将 buffer 字节、额外参数和计算纳入公平比较。",
    ],
    tuning: [
      "EWC λ 过小无保护，过大阻止新任务学习。",
      "buffer 大小与采样策略决定 replay 覆盖，优先监控每类/每域。",
      "新旧 loss 尺度需平衡，避免蒸馏完全压过新标签。",
    ],
    settings: [
      {
        name: "memory budget",
        start:
          "先按固定总样本或字节预算，使用 reservoir/class-balanced replay。",
        adjust: "遗忘集中在少数类时调整采样，不隐式增大总预算。",
      },
      {
        name: "stability λ",
        start: "从允许新任务正常下降的小值扫描。",
        adjust: "旧任务快速掉点则增加；新任务不学则降低。",
      },
      {
        name: "evaluation matrix",
        start: "每个任务结束都评估所有已见任务。",
        adjust: "任务多时仍保留固定 probe set，不能只看当前任务。",
      },
    ],
    modifications: [
      "adapter/专家隔离任务参数可减少干扰，但参数随任务增长。",
      "generative replay 不存原样本，但生成偏差会累积。",
    ],
    pitfalls: [
      "训练时使用 test task ID 或旧测试样本回放。",
      "方法保存更多数据/模型却与零 memory 基线只比准确率。",
    ],
    example:
      "图像系统每月新增缺陷类别：固定 2,000 样本 buffer，比较 replay 与 EWC，并画每月对历史月份的准确率矩阵。",
    compareTo: [
      "distillation-pruning",
      "online-learning-drift",
      "multi-task-learning",
      "federated-learning",
    ],
  },
  {
    id: "active-learning",
    source: {
      label: "Gal et al.: Deep Bayesian Active Learning with Image Data",
      url: "https://arxiv.org/abs/1703.02910",
    },
    title: "主动学习：下一笔标注花在哪里",
    englishTitle: "Active Learning",
    category: "adaptation",
    level: "进阶",
    duration: "13 分钟",
    icon: "?",
    summary:
      "从未标注池中选择最有价值的一批样本请求标注，在固定标注预算下提高学习效率。",
    intuition:
      "不是随机问更多题，而是找模型最犹豫、最有代表性、且不会重复的问题。但不确定度高也可能只是异常值。",
    core: "Pool-based active learning 循环为 train→score unlabeled→select batch→label→retrain。Acquisition 可用 entropy、margin、BALD、coreset 或 diversity。不确定性应校准；所有方法必须在相同初始集、标注批量、预算和独立测试集下比较学习曲线。",
    equation: "x*=argmaxx∈U a(x;θ);  BALD=H[y|x,D]−Ew H[y|x,w]",
    mechanicsSteps: [
      "从小型已标注 L、未标注池 U 和封闭 test 开始，训练初始模型。",
      "对 U 计算 uncertainty/representativeness，并在一次 acquisition 内加入 diversity 约束。",
      "只把选中 batch 交给标注者，记录拒标、冲突与真实标注成本，再移入 L。",
      "按轮重训并画 test metric 对累计标注成本，与随机采样多 seeds 比较。",
    ],
    whenToUse: [
      "未标注数据多、专家标注昂贵且可以迭代请求时。",
      "目标是节省标注成本而不是增加模型容量时。",
    ],
    limits: [
      "模型早期不确定性不可靠，会反复选择异常值或分布外样本。",
      "批量选择若不处理冗余，会一次标许多近重复样本。",
    ],
    howToUse: [
      "先定义单位标注成本和固定预算，不只按样本数。",
      "随机采样作为必须基线，并复用相同初始 L。",
      "每轮保存 acquisition scores、样本切片与标注者反馈。",
      "test 永不进入 acquisition；另设 validation 调策略。",
    ],
    tuning: [
      "acquisition batch 小反馈快但重训频繁，大 batch 易冗余。",
      "uncertainty 与 diversity 权重应在模拟/验证流程选择。",
      "MC dropout 次数增加估计稳定性也线性增加打分成本。",
    ],
    settings: [
      {
        name: "query batch",
        start: "从总预算的 5–10% 一轮起步。",
        adjust: "重复样本多时减小或增强 diversity；重训太贵时增大。",
      },
      {
        name: "acquisition",
        start: "entropy/margin + 随机基线。",
        adjust: "异常值主导时加入 density/coreset 或 OOD 过滤。",
      },
      {
        name: "retraining",
        start: "每轮从同 checkpoint 策略重训并固定预算。",
        adjust: "warm-start 省成本时，必须与随机组同样 warm-start。",
      },
    ],
    modifications: [
      "按预计信息增益除以标注成本做 cost-aware acquisition。",
      "多人标注时可同时选择样本与需要复核的争议标签。",
    ],
    pitfalls: [
      "使用测试误差选择下一批，形成测试集反馈环。",
      "只跑一个随机初始集，主动策略收益可能只是 seed 运气。",
    ],
    example:
      "病理切片池每轮挑 100 张：先按 MC-dropout entropy 排序，再用 embedding k-center 去重；横轴报告专家分钟数。",
    compareTo: [
      "deep-ensembles",
      "calibration-uncertainty",
      "semi-supervised-self-training",
      "cohort-design",
    ],
  },
  {
    id: "multi-task-learning",
    source: {
      label:
        "Kendall et al.: Multi-Task Learning Using Uncertainty to Weigh Losses",
      url: "https://arxiv.org/abs/1705.07115",
    },
    title: "多任务学习：共享什么，冲突怎么办",
    englishTitle: "Multi-Task Learning",
    category: "adaptation",
    level: "进阶",
    duration: "13 分钟",
    icon: "⋈",
    summary:
      "共享 backbone、保留任务 heads，并通过采样、loss 权重与梯度冲突诊断决定任务能否互相帮助。",
    intuition:
      "相关任务可以共享基础能力，但一个老师要求边缘敏感，另一个要求纹理不变，梯度也可能互相拉扯。共享不是越多越好。",
    core: "Hard sharing 用一个 backbone 接多个 task heads，总 loss 为加权和。任务频率、loss 量纲与梯度方向共同决定实际更新。Uncertainty weighting 学 log variance 调整权重；PCGrad 等方法处理冲突梯度。应比较每任务 single-task baseline 与 Pareto trade-off。",
    equation: "Ltotal=Σt wtLt;  Luncertainty=Σt Lt/(2σt²)+logσt",
    mechanicsSteps: [
      "为每任务定义独立 head、loss、metric 和可用样本掩码，先训练 single-task baselines。",
      "共享 backbone 后按任务或混合 batch 采样，计算各任务 loss 与 backbone gradient。",
      "检查 loss 尺度、梯度 norm 与 cosine；用固定、uncertainty 或动态权重平衡。",
      "在每任务独立 test 上比较收益/退化，并报告总体 Pareto 前沿。",
    ],
    whenToUse: [
      "任务输入相同或相关，且共享表示/推理成本有价值时。",
      "一个主任务标注少、辅助任务能提供相关监督时。",
    ],
    limits: [
      "不相关或冲突任务会 negative transfer。",
      "动态权重可能通过压低难任务损失获得表面稳定。",
    ],
    howToUse: [
      "先建立每个任务单独模型与等参数基线。",
      "统一 loss reduction，记录有效样本数。",
      "监控共享层每任务 gradient norm/cosine。",
      "按主任务约束选择权重，而非只最小化总 loss。",
    ],
    tuning: [
      "任务采样率与 loss 权重是不同旋钮，都要记录。",
      "共享深度可从底层共享、后层分支开始。",
      "梯度冲突稳定存在时尝试 PCGrad 或 task-specific adapter。",
    ],
    settings: [
      {
        name: "loss weights",
        start: "归一化各 loss 后从等权开始。",
        adjust: "按梯度 norm 与主任务约束调，不按原始 loss 数值直觉。",
      },
      {
        name: "task sampling",
        start: "按数据量温度采样，避免最大数据集完全主导。",
        adjust: "小任务欠训练时提高频率，同时防止重复过拟合。",
      },
      {
        name: "shared depth",
        start: "共享通用前层，任务 head 独立。",
        adjust: "冲突集中在后层时提前分支；任务高度相关再增加共享。",
      },
    ],
    modifications: [
      "用 soft sharing 或 cross-stitch 让任务选择交换信息。",
      "Mixture-of-experts 可按任务/样本条件共享部分专家。",
    ],
    pitfalls: [
      "总 loss 下降但主任务指标变差。",
      "不同任务 batch 的缺失标签被错误当负标签。",
    ],
    example:
      "自动驾驶共享视觉 backbone，同时做深度、分割和检测；分别记录三任务梯度 cosine 与单任务差值。",
    compareTo: [
      "mixture-of-experts",
      "prediction-heads",
      "hypernetworks-meta-gradients",
      "continual-learning",
    ],
  },
  {
    id: "automl-hpo-nas",
    source: {
      label: "Liu et al.: DARTS—Differentiable Architecture Search",
      url: "https://arxiv.org/abs/1806.09055",
    },
    title: "AutoML：HPO、超梯度与神经架构搜索",
    englishTitle: "Hyperparameter and Neural Architecture Search",
    category: "adaptation",
    level: "高级",
    duration: "15 分钟",
    icon: "⌘",
    summary:
      "把学习率、正则、模型结构和资源约束写成可复现搜索问题，比较随机、Bayesian、bandit 与可微 NAS。",
    intuition:
      "AutoML 不是自动获得真理，而是把“试哪些配置、给多少预算、用什么验证信号”系统化。搜索空间和评估协议写错，自动化只会更快地过拟合验证集。",
    core: "HPO 在 λ 空间最小化 validation objective；random search 对少数重要维度常比 grid 有效，successive halving/Hyperband 早停差配置。DARTS 用混合操作的连续权重 α 松弛离散结构，并做 train weights/validation architecture 的双层优化，最终离散化再从头验证。",
    equation: "λ*=argminλ Lval(w*(λ),λ), w*=argminw Ltrain(w,λ)",
    mechanicsSteps: [
      "定义搜索空间、资源预算、validation metric、延迟/显存约束与随机种子。",
      "先跑 random search 和默认 baseline，使用相同数据切分与最大预算。",
      "多保真方法给候选少量 epoch 后淘汰；NAS 则交替更新 network weights 与 architecture parameters。",
      "选定配置后从头重训，并只在封闭 test 评一次；报告所有试验总成本。",
    ],
    whenToUse: [
      "训练流程稳定且重复任务足以回收自动搜索成本时。",
      "多项超参数交互或硬件约束使手工逐项调参困难时。",
    ],
    limits: [
      "反复搜索会过拟合 validation，trial 多不代表结论可靠。",
      "proxy 训练、权重共享和连续松弛的最佳结构未必在完整训练中最佳。",
    ],
    howToUse: [
      "先修复数据泄漏与训练不稳定，再启动搜索。",
      "记录每 trial 配置、seed、预算、失败与中间曲线。",
      "使用 nested 或额外 holdout 验证大量搜索后的泛化。",
      "把 GPU-hours、能耗、延迟约束纳入最终比较。",
    ],
    tuning: [
      "对数尺度参数如 LR/weight decay 用 log-uniform。",
      "早停规则需允许慢启动配置，避免系统性偏置。",
      "NAS architecture LR 与 weight LR 分离，离散化后必须重训。",
    ],
    settings: [
      {
        name: "search budget",
        start: "先用小 random search 估计敏感维度与单 trial 方差。",
        adjust: "收益趋平后停止，不以试验数量作为目标。",
      },
      {
        name: "search space",
        start: "只含能解释且部署允许的范围。",
        adjust: "大量 trial 撞边界时扩展；无效区域多时收紧。",
      },
      {
        name: "selection protocol",
        start: "固定 validation，最终候选多 seeds 重训。",
        adjust: "搜索规模大时增加二级 holdout 或 nested validation。",
      },
    ],
    modifications: [
      "多目标搜索同时优化质量、延迟、显存与能耗，输出 Pareto 集。",
      "Population Based Training 联合搜索超参数 schedule 与权重。",
    ],
    pitfalls: [
      "把 test 纳入 scheduler 或 architecture selection。",
      "只报告最佳 trial，不报告搜索总次数与 winner's curse。",
    ],
    example:
      "图像分类在 50 GPU-hours 内搜索 LR、增广和宽度；选前三个配置以 5 seeds 完整重训后再开 test。",
    compareTo: [
      "model-evaluation",
      "learning-rate-schedules",
      "learned-optimizers",
      "xgboost",
    ],
  },
  {
    id: "curriculum-self-paced",
    source: {
      label: "Bengio et al.: Curriculum Learning",
      url: "https://arxiv.org/abs/0904.1694",
    },
    title: "Curriculum 与 Self-Paced Learning：先学什么",
    englishTitle: "Curriculum and Self-Paced Learning",
    category: "adaptation",
    level: "进阶",
    duration: "12 分钟",
    icon: "⇗",
    summary:
      "按难度、长度或可靠性改变训练样本顺序；课程由人定义，自步学习由当前模型选择容易样本。",
    intuition:
      "学习顺序会改变优化路径。先掌握清晰短例子，再逐步加入困难和噪声样本，可能更稳；但一直只看容易样本会错过真正目标。",
    core: "Curriculum 用外部难度 c(x) 和 pacing function 决定某步可见样本。Self-paced learning 根据当前 loss 联合选择样本权重 vᵢ，在逐渐放宽 λ 时纳入更难样本。收益可能来自优化、正则或数据清洗，必须与随机顺序和等步数比较。",
    equation: "minθ,v Σᵢ vᵢLᵢ(θ)−λΣᵢvᵢ, vᵢ∈{0,1}",
    mechanicsSteps: [
      "定义可解释难度：长度、噪声置信度、遮挡或教师评分，并检查与标签/群体的相关性。",
      "设计 pacing schedule，从容易子集逐步扩大，同时保持总更新步数公平。",
      "self-paced 每阶段按当前 loss/置信度更新样本权重，再继续训练。",
      "与随机顺序、反课程和全数据基线比较最终指标、收敛速度与群体表现。",
    ],
    whenToUse: [
      "长序列、组合任务或标签噪声导致早期训练不稳时。",
      "样本难度有可信信号且部署最终仍覆盖全部难度时。",
    ],
    limits: [
      "模型 loss 低可能因为容易或因为记住偏差。",
      "难度与少数群体相关时，课程会延迟甚至忽略重要样本。",
    ],
    howToUse: [
      "先画难度分布和按群体/类别切片。",
      "固定总 examples seen 与 LR schedule 做公平对照。",
      "记录每阶段进入的数据和最终覆盖率。",
      "检查困难样本与少数群体最终性能。",
    ],
    tuning: [
      "起始比例太小会过拟合简单子集。",
      "pacing 太慢浪费预算，太快等同随机全数据。",
      "self-paced 阈值应逐步覆盖全部目标数据。",
    ],
    settings: [
      {
        name: "difficulty score",
        start: "使用与任务机制相关、训练前可计算的简单信号。",
        adjust: "与标签或群体强相关时分层归一化或弃用。",
      },
      {
        name: "initial fraction",
        start: "从 20–40% 容易样本开始并保持类别覆盖。",
        adjust: "早期过拟合则增大；仍不稳定则改善数据而非继续缩小。",
      },
      {
        name: "pacing",
        start: "线性或分段扩大，在中期覆盖全数据。",
        adjust: "困难集长期落后时加快；全局不稳时放慢。",
      },
    ],
    modifications: [
      "competence-based curriculum 根据验证能力动态扩展难度。",
      "teacher model 可学习选样，但必须防止与 student 共谋捷径。",
    ],
    pitfalls: [
      "课程与 baseline 使用不同总步数或 LR，收益不可归因。",
      "永久丢弃高 loss 样本，导致难例和少数群体消失。",
    ],
    example:
      "语音识别先训练短、清晰音频，再逐步加入长和嘈杂样本；最终测试按噪声等级分别报告 WER。",
    compareTo: [
      "active-learning",
      "class-imbalance",
      "data-leakage",
      "learning-rate-schedules",
    ],
  },
  {
    id: "federated-learning",
    source: {
      label:
        "McMahan et al.: Communication-Efficient Learning of Deep Networks from Decentralized Data",
      url: "https://arxiv.org/abs/1602.05629",
    },
    title: "Federated Learning：数据不集中时怎样共同训练",
    englishTitle: "Federated Learning and FedAvg",
    category: "adaptation",
    level: "高级",
    duration: "14 分钟",
    icon: "⌂",
    summary:
      "客户端在本地数据上更新模型，服务器按样本量聚合；核心挑战是 non-IID、通信、隐私和掉线。",
    intuition:
      "每台设备拿同一份模型在本地练几步，只寄回更新而不寄原始数据。服务器平均后再发下一轮，但不同设备的数据和算力并不相同。",
    core: "FedAvg 每轮抽客户端，客户端从全局 wt 做 E 个 local epochs 得 wt+1ᵏ，服务器按 nk 加权平均。数据留在本地不自动等于隐私安全；updates 可泄漏信息，通常还需 secure aggregation、差分隐私和治理。Non-IID local drift 与通信是主要约束。",
    equation: "wₜ₊₁=Σk(nk/Σjnj)wₜ₊₁ᵏ",
    mechanicsSteps: [
      "服务器抽一组客户端并下发同一全局模型与训练配置。",
      "每客户端仅在本地数据做若干 SGD 步，返回 model delta、样本数和允许的诊断信息。",
      "服务器按有效样本量聚合，处理掉线、裁剪与安全聚合，再形成下一轮模型。",
      "在全局与每客户端/群体测试集评估，并记录通信字节、轮数和最差客户端。",
    ],
    whenToUse: [
      "原始数据因隐私、带宽或治理不能集中，但参与方愿意协作训练时。",
      "终端设备或机构拥有相关但异质的数据时。",
    ],
    limits: [
      "参数更新仍可能泄漏，FL 不是隐私保证。",
      "non-IID、设备掉线与算力差异会使收敛和公平性变差。",
    ],
    howToUse: [
      "先用真实 client partition 模拟，禁止随机打散成 IID。",
      "建立 centralized upper bound 与 local-only baselines。",
      "跟踪每轮参与率、update norm、通信量和客户端切片。",
      "明确 secure aggregation、DP、删除请求与模型版本流程。",
    ],
    tuning: [
      "local epochs 多可省通信却增加 client drift。",
      "client fraction 影响代表性、轮时延与方差。",
      "server LR、clipping 与 FedProx 等正则需在 non-IID 程度下选择。",
    ],
    settings: [
      {
        name: "local epochs E",
        start: "从 1–5 个本地 epoch 并测 drift。",
        adjust: "通信过多可增加；客户端方向分散或掉点时减少。",
      },
      {
        name: "client fraction",
        start: "保证每轮覆盖足够不同客户端并记录抽样概率。",
        adjust: "方差大时增加；轮延迟受慢客户端限制时优化选择。",
      },
      {
        name: "aggregation / clipping",
        start: "按样本量 FedAvg + update norm 监控。",
        adjust:
          "异质或异常更新强时加入 clipping/robust aggregation，并查公平性。",
      },
    ],
    modifications: [
      "FedProx 限制本地参数远离全局模型。",
      "个性化 FL 在共享 backbone 上为客户端保留 adapter/head。",
    ],
    pitfalls: [
      "把集中式随机 split 的结果当 federated 结论。",
      "宣称数据不上传就完全隐私，忽略 update leakage 与元数据。",
    ],
    example:
      "多医院联合训练影像模型：按医院本地更新，安全聚合 delta；同时报告总体 AUROC 与最差医院灵敏度。",
    compareTo: [
      "model-serving-monitoring",
      "multi-task-learning",
      "continual-learning",
      "deep-ensembles",
    ],
  },
  {
    id: "test-time-adaptation",
    source: {
      label:
        "Wang et al.: Tent—Fully Test-Time Adaptation by Entropy Minimization",
      url: "https://arxiv.org/abs/2006.10726",
    },
    title: "Test-Time Adaptation：模型上线后还能改什么",
    englishTitle: "Test-Time Adaptation and TENT",
    category: "adaptation",
    level: "高级",
    duration: "13 分钟",
    icon: "T",
    summary:
      "在没有测试标签时，用当前测试批的统计量和自监督目标小幅更新模型；收益伴随漂移与崩塌风险。",
    intuition:
      "模型到新环境后先观察当前输入的分布，调整少量旋钮再预测。TENT 让预测更确定，但错误自信也可能被进一步放大。",
    core: "TENT 在测试时更新 normalization statistics 与 channel-wise affine 参数，通过最小化预测 entropy 适配。Protocol 可是 episodic reset、continual stream 或 online predict-then-update；这些定义改变可用未来信息。必须与 source model、AdaBN、oracle 和不适配比较。",
    equation: "minγ,β H(pθ(y|x_test));  θ\{γ,β\} fixed",
    mechanicsSteps: [
      "冻结 source checkpoint，明确测试流顺序、batch、是否可多次看样本及何时 reset。",
      "对当前无标签 batch 前向，更新 normalization stats，并对 affine 参数计算 entropy gradient。",
      "先预测后更新或更新后预测必须固定协议，限制步数和学习率。",
      "监控 entropy、类别分布、参数漂移与延迟；在干净、渐变和突变 shift 上评估。",
    ],
    whenToUse: [
      "部署输入存在可观测协变量漂移，并允许短暂在线更新时。",
      "模型含可安全调节的 normalization/adapter 参数时。",
    ],
    limits: [
      "entropy minimization 会强化错误和类别坍塌。",
      "batch 太小、标签分布变化或样本相关会让统计量不可靠。",
    ],
    howToUse: [
      "保存不可变 source checkpoint 和一键 reset 路径。",
      "先离线回放真实时间顺序，禁止打乱未来样本。",
      "只更新白名单参数并设置 norm/step 上限。",
      "加入 OOD、低置信、类别坍塌触发的停止与回滚。",
    ],
    tuning: [
      "测试 LR 通常远小于训练 LR，先 1 步。",
      "batch size 决定 BN 统计稳定性和适配延迟。",
      "episodic reset 更稳，continual 适应持续漂移但会累积错误。",
    ],
    settings: [
      {
        name: "update scope",
        start: "只更新 normalization affine 与统计量。",
        adjust: "证据充分才扩大到 adapter；绝不默认全模型更新。",
      },
      {
        name: "steps / LR",
        start: "每批 1 步、小 LR，并与零更新对照。",
        adjust: "熵降但准确率降时立即减小或停止。",
      },
      {
        name: "reset policy",
        start: "独立任务/域之间 reset source。",
        adjust: "连续流只有在回放验证与回滚机制成熟后保留状态。",
      },
    ],
    modifications: [
      "加入 teacher/augmentation consistency 减少单一预测自强化。",
      "用 drift detector 决定何时适配，而非每批都更新。",
    ],
    pitfalls: [
      "先用整个 test set 适配再回头评同一批，却称 online。",
      "只看 entropy 下降，把更自信的错误当成功。",
    ],
    example:
      "摄像头遇到逐渐增强的雾：每批只更新 BN affine，一旦类别分布塌缩或漂移超阈值就回滚 source。",
    compareTo: [
      "domain-adaptation-dann",
      "domain-generalization-irm",
      "online-learning-drift",
      "calibration-uncertainty",
    ],
  },
  {
    id: "semi-supervised-self-training",
    source: {
      label: "Sohn et al.: FixMatch—Simplifying Semi-Supervised Learning",
      url: "https://arxiv.org/abs/2001.07685",
    },
    title: "半监督与 Self-Training：用无标签数据但别放大错误",
    englishTitle: "Semi-Supervised Learning, Pseudo-Labels and FixMatch",
    category: "adaptation",
    level: "进阶",
    duration: "13 分钟",
    icon: "±",
    summary:
      "用弱增强产生高置信 pseudo-label，再要求强增强预测一致；阈值、校准和类分布决定是否有效。",
    intuition:
      "模型先给自己出答案，只把足够有把握的答案当临时标签，再检查输入被强扰动后结论是否一致。若初始偏差大，错误会像滚雪球。",
    core: "FixMatch 对 unlabeled x 做 weak augmentation 得 q，若 max q≥τ，取 argmax 为 pseudo-label；strong augmentation 预测用交叉熵拟合该标签。总 loss 为 labeled supervised loss 加 μ 倍 unsupervised loss。有效性依赖类内平滑、阈值校准和 labeled seed。",
    equation: "L=Ls+μ·1[max q≥τ]·CE(argmax q,p(y|strong(x)))",
    mechanicsSteps: [
      "用小型 labeled L 训练基线，保留独立 validation/test；unlabeled U 不含 test。",
      "对 U 的 weak augmentation 预测，按置信阈值生成 pseudo-label 与 mask。",
      "对同一样本 strong augmentation 计算 masked unsupervised loss，与 labeled loss 联合更新。",
      "监控每类 pseudo-label 数、precision proxy、coverage 与 confirmation bias，并与监督基线比较。",
    ],
    whenToUse: [
      "同分布无标签数据远多于标签，并有可靠增强时。",
      "标注预算有限但可获得大量原始输入时。",
    ],
    limits: [
      "分布外 U、类不平衡或错误校准会放大偏差。",
      "不保持语义的强增强会训练模型拟合错误不变性。",
    ],
    howToUse: [
      "先审计 U 与目标分布、去重并排除 test。",
      "从监督 baseline 和固定增强开始。",
      "按类记录 pseudo-label coverage 与置信分布。",
      "用少量人工抽检验证高置信 pseudo-label 精度。",
    ],
    tuning: [
      "τ 高更准但 coverage 低，低则错误传播。",
      "μ 和 unlabeled batch ratio 共同决定无监督梯度强度。",
      "强增强必须在领域内保持标签。",
    ],
    settings: [
      {
        name: "confidence τ",
        start: "从 0.95 一类的保守阈值并按类审计。",
        adjust: "coverage 太低且校准可靠时降低；错误偏多时提高。",
      },
      {
        name: "unsupervised weight μ",
        start: "warmup 后逐步升到与监督 loss 同量级。",
        adjust: "监督指标退化或少数类消失时降低。",
      },
      {
        name: "augmentation",
        start: "weak 保留原貌，strong 明显扰动但不改语义。",
        adjust: "按领域验证；医学/时间序列不可照搬自然图像策略。",
      },
    ],
    modifications: [
      "teacher EMA 可提供更平滑 pseudo-label。",
      "distribution alignment 或 class-aware threshold 可缓解类别偏斜。",
    ],
    pitfalls: [
      "unlabeled pool 含 test 或同实体近重复样本。",
      "只看 pseudo-label 数量，不看每类精度和错误累积。",
    ],
    example:
      "10% 标注的工业图像加 90% 无标签池；弱增强定 pseudo-label，强增强训练，并每轮抽检各类高置信样本。",
    compareTo: [
      "active-learning",
      "regularization",
      "distillation-pruning",
      "domain-adaptation-dann",
    ],
  },
  {
    id: "online-learning-drift",
    source: {
      label: "Gama et al.: A Survey on Concept Drift Adaptation",
      url: "https://arxiv.org/abs/1304.6003",
    },
    title: "Online Learning 与 Drift：数据流里持续更新",
    englishTitle: "Online Learning and Concept Drift",
    category: "adaptation",
    level: "高级",
    duration: "13 分钟",
    icon: "≈",
    summary:
      "按时间顺序预测、等待标签、更新并监测漂移，区分 data drift、label drift 与 concept drift。",
    intuition:
      "部署数据像河流，不是固定训练集。昨天的规律可能慢慢变，也可能突然断裂；系统要先预测，再在反馈到达后学习，不能偷看未来。",
    core: "Prequential evaluation 对每个时刻先 test 再 train。Data drift 是 p(x) 变化，label shift 是 p(y) 变化，concept drift 是 p(y|x) 变化。滑动窗口、遗忘因子、drift detector 与 replay 控制适应速度和稳定性；标签延迟使真实监控更难。",
    equation: "predict ŷt=fθt(xt); observe yt later; θt+1=Update(θt,xt,yt)",
    mechanicsSteps: [
      "按事件时间排序数据，定义标签延迟、可更新频率与真实部署决策。",
      "每个样本先用当前模型预测并记日志，标签到达后才计分和更新。",
      "维护短/长窗口指标、输入统计和 detector；触发后调整窗口、LR 或回滚。",
      "用 gradual、sudden、recurring drift 回放测试恢复速度、误报和遗忘。",
    ],
    whenToUse: [
      "用户行为、市场、传感器或内容分布持续变化且会有反馈时。",
      "批量定期重训太慢，需要受控增量更新时。",
    ],
    limits: [
      "无标签时只能检测输入变化，不能证明 concept drift。",
      "快速适应会忘旧模式，慢适应又跟不上突变。",
    ],
    howToUse: [
      "建立不可变时间回放与 production-like 标签延迟。",
      "先比较不更新、定期重训、滑动窗口和在线 SGD。",
      "监控模型版本、特征 schema、反馈缺失与选择偏差。",
      "为自动更新设置 champion/challenger、回滚和冻结条件。",
    ],
    tuning: [
      "窗口小适应快但方差大；窗口大更稳但滞后。",
      "遗忘因子决定旧样本权重衰减。",
      "detector 阈值需要权衡误报与漏报，并按事件成本选择。",
    ],
    settings: [
      {
        name: "window / decay",
        start: "从覆盖一个完整业务周期的窗口开始。",
        adjust: "突变恢复慢时缩短；指标噪声大时加长。",
      },
      {
        name: "update cadence",
        start: "先定期小批更新并保留版本。",
        adjust: "反馈快且稳定再提高频率；标签延迟大则避免伪在线。",
      },
      {
        name: "drift threshold",
        start: "用无漂移历史校准可接受误报率。",
        adjust: "错过高成本突变时降低，并增加人工确认或多信号。",
      },
    ],
    modifications: [
      "recurring drift 可维护多个专家并按当前 context 选择。",
      "无标签阶段用自监督/统计 detector，标签到达后再确认性能漂移。",
    ],
    pitfalls: [
      "随机打乱时间流评估，消除真正 drift。",
      "用户只看到模型选择的内容，反馈带 selection bias 却被当 IID 标签。",
    ],
    example:
      "欺诈模型逐笔先评分，30 天后标签成熟再更新；分别监控输入 PSI、延迟校准和已成熟 cohort 的召回。",
    compareTo: [
      "continual-learning",
      "test-time-adaptation",
      "cohort-design",
      "model-serving-monitoring",
    ],
  },
];
