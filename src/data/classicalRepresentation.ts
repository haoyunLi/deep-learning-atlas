import type { Lesson } from "./lessons";

export const classicalRepresentationLessons: Lesson[] = [
  {
    id: "expectation-maximization",
    source: {
      label: "scikit-learn: Gaussian mixture models and EM",
      url: "https://scikit-learn.org/stable/modules/mixture.html",
    },
    title: "EM：猜隐藏变量，再更新参数",
    englishTitle: "Expectation–Maximization (EM)",
    category: "classical",
    level: "进阶",
    duration: "9 分钟",
    icon: "◌",
    summary:
      "EM 是处理 latent variables 的迭代优化框架，不是一种神经网络架构。",
    intuition:
      "想给一堆混在一起的点找出各自来源，但来源标签看不见。先按当前模型给每个点一个‘来自哪个群’的概率，再按这些软标签重估每个群；如此交替。",
    core: "E-step 根据旧参数求隐藏变量的后验或其近似；M-step 最大化该后验下的 complete-data log likelihood 的期望。精确 EM 在常见条件下使观测数据似然不下降，但可能收敛到局部最优。GMM 是一个例子；EM 还可用于其他带潜变量的概率模型。",
    equation: "qᵗ(z)=p(z|x,θᵗ);  θᵗ⁺¹=argmaxθ E_qᵗ[log p(x,z|θ)]",
    whenToUse: [
      "隐藏分组、缺失或其他潜变量使直接最大似然难优化时。",
      "需要概率解释或软分配，而非只给一个硬类别时。",
    ],
    howToUse: [
      "先明确观测 x、潜变量 z 和联合模型 p(x,z|θ)。",
      "推导或近似 E-step，再推导 M-step；检查每轮 log likelihood 和收敛。",
      "对 GMM 可从多个随机种子拟合，保留验证准则更好的解。",
    ],
    tuning: [
      "初始化会改变收敛点；尝试多次重启和合理先验。",
      "设置迭代上限与似然改进阈值；避免太早停或无效空转。",
    ],
    modifications: [
      "E-step 无法精确算时，用变分 EM 或 Monte Carlo 近似，但单调性需重新核查。",
      "若分布形状不符，改似然模型，而非只加迭代次数。",
    ],
    pitfalls: [
      "把 EM 和 GMM 当同义词；前者是优化套路，后者是模型。",
      "似然收敛不等于找到了真实聚类，也不保证全局最优。",
    ],
    example:
      "两种仪器产生的测量值混在同一表中：GMM 的 E-step 估计每条记录的来源概率，M-step 更新两组均值、方差和比例。",
    compareTo: ["gaussian-mixture-model", "k-means", "autoencoder-vae"],
  },
  {
    id: "knn",
    source: {
      label: "scikit-learn: Nearest Neighbors",
      url: "https://scikit-learn.org/stable/modules/neighbors.html",
    },
    title: "kNN：看附近样本怎么说",
    englishTitle: "k-Nearest Neighbors (kNN)",
    category: "classical",
    level: "入门",
    duration: "7 分钟",
    icon: "⌁",
    summary: "kNN 是距离驱动的非参数 baseline；预测时直接参考训练样本。",
    intuition:
      "新点来到地图上，先找到最近的 k 个已标注邻居，再让它们投票或求平均。模型把‘相近应有相似答案’作为主要假设。",
    core: "分类用邻居标签多数票，回归用邻居目标均值或距离加权均值。它几乎没有传统的参数训练，但要保存样本，预测时搜索邻居。距离选择、缩放和特征表示直接决定‘近’的含义。",
    equation: "ŷ(x)=majority{yᵢ : xᵢ∈Nₖ(x)}  或  (1/k)Σᵢ∈Nₖ(x)yᵢ",
    whenToUse: [
      "中小数据集、特征距离有意义、希望快速建立可解释 baseline 时。",
      "已有强 embedding，想做少样本分类或相似案例检索时。",
    ],
    howToUse: [
      "仅用训练集拟合标准化器，再变换验证与测试数据，避免 leakage。",
      "在验证集上比较 k、距离度量与 uniform/distance weighting。",
      "样本很多时使用合适的邻居索引或近似检索，并测实际延迟。",
    ],
    tuning: [
      "小 k 更灵活也更受噪声影响；大 k 更平滑，可能抹平少数类。",
      "欧氏距离适合经缩放的连续特征；embedding 常试 cosine similarity。",
    ],
    modifications: [
      "类别不平衡时比较距离加权、类别权重或重新采样。",
      "先用 PCA 或学习到的 embedding 改善高维距离，再运行 kNN。",
    ],
    pitfalls: [
      "高维原始特征中距离可能不再区分好邻居；不要省略特征检验。",
      "把查询样本、时间上更晚的样本或测试集放入邻居库，会造成数据泄漏。",
    ],
    example:
      "给少量细胞图像分类：用已训练图像编码器抽特征，再让新图像的 5 个最近邻投票；先检查近邻是否真的形态相似。",
    compareTo: ["svm", "pca", "contrastive-learning"],
  },
  {
    id: "k-means",
    source: {
      label: "scikit-learn: K-means",
      url: "https://scikit-learn.org/stable/modules/clustering.html#k-means",
    },
    title: "K-means：找 K 个代表点",
    englishTitle: "K-means Clustering",
    category: "classical",
    level: "入门",
    duration: "7 分钟",
    icon: "✳",
    summary: "交替分配样本和更新质心，是最常用的硬聚类 baseline 之一。",
    intuition:
      "给每组放一个代表点。每个样本先找最近代表，再把代表移到组内平均位置；重复到代表基本不动。",
    core: "K-means 最小化样本到所属质心的平方距离。它给硬分配，默认偏好凸且大小相近、欧氏距离合理的簇；它不建模概率或椭圆协方差。",
    equation: "min_{μ₁…μₖ,cᵢ} Σᵢ ‖xᵢ−μ_{cᵢ}‖²",
    whenToUse: [
      "需要快速粗分组、原型压缩或向量量化 baseline 时。",
      "分组主要由欧氏距离和近似球形结构解释时。",
    ],
    howToUse: [
      "清理异常值并缩放特征；先可视化或评估距离是否有意义。",
      "用 k-means++ 初始化，并运行多个随机种子。",
      "结合业务解释、轮廓系数等检查 K，而非仅看训练 inertia。",
    ],
    tuning: [
      "K 决定分组粒度；从几个合理候选值比较稳定性与下游用途。",
      "n_init 多次重启可缓解差的局部解；大规模数据可用 MiniBatchKMeans。",
    ],
    modifications: [
      "簇呈椭圆或需软概率时改 GMM；复杂非凸形状可试密度或谱聚类。",
      "高维噪声大时先在训练集上做 PCA，再重新评估聚类。",
    ],
    pitfalls: [
      "算法总会产出 K 个簇，即使数据没有天然的 K 类。",
      "它会对极端值和量纲敏感，质心也可能不对应真实样本。",
    ],
    example:
      "把顾客向量分成几个行为原型，先用 K-means 探索；若每个人都应有混合归属，再看 GMM。",
    compareTo: ["gaussian-mixture-model", "expectation-maximization", "pca"],
  },
  {
    id: "gaussian-mixture-model",
    source: {
      label: "scikit-learn: Gaussian mixture models",
      url: "https://scikit-learn.org/stable/modules/mixture.html",
    },
    title: "GMM：软分群的概率模型",
    englishTitle: "Gaussian Mixture Model (GMM)",
    category: "classical",
    level: "进阶",
    duration: "8 分钟",
    icon: "◍",
    summary: "把数据看作多个高斯分布的混合，输出每个样本属于各成分的概率。",
    intuition:
      "同一个点可能有 70% 像 A 类、30% 像 B 类。GMM 用多个钟形分布解释数据，每个分布能有自己的中心、大小和方向。",
    core: "模型包含 mixture weights、均值和协方差。常用 EM 拟合：算 responsibilities，再用软权重重估参数。和 K-means 相比，它能表达不确定性与某些椭圆簇，但依赖高斯混合假设。",
    equation: "p(x)=Σₖ πₖ 𝒩(x|μₖ,Σₖ);  rᵢₖ=p(zᵢ=k|xᵢ)",
    whenToUse: [
      "需要 soft clustering、密度估计或离群分数时。",
      "样本群形状可由几个高斯成分合理近似时。",
    ],
    howToUse: [
      "预处理数值特征，并比较不同成分数与 covariance_type。",
      "用多次初始化拟合；观察每个成分的权重、协方差与分配概率。",
      "用留出集似然或 BIC 等选候选模型，再检验解释是否合理。",
    ],
    tuning: [
      "n_components 过大易拟合噪声；full covariance 灵活但更耗样本。",
      "协方差正则 reg_covar 可防奇异矩阵；极小成分权重要检查。",
    ],
    modifications: [
      "维度很高时可先 PCA 或用 tied/diag covariance。",
      "若组件数不明且想用概率先验，可探索 BayesianGaussianMixture。",
    ],
    pitfalls: [
      "把组件直接当真实类别；一个复杂类别可能需要多个高斯成分。",
      "异常值或非高斯数据可能导致参数与概率解释不稳。",
    ],
    example:
      "设备传感器值似乎来自两种工作状态；GMM 给每个读数的状态概率，便于在边界区域表达不确定性。",
    compareTo: ["k-means", "expectation-maximization", "autoencoder-vae"],
  },
  {
    id: "pca",
    source: {
      label: "scikit-learn: PCA",
      url: "https://scikit-learn.org/stable/modules/generated/sklearn.decomposition.PCA.html",
    },
    title: "PCA：保留最大变化方向",
    englishTitle: "Principal Component Analysis (PCA)",
    category: "classical",
    level: "入门",
    duration: "7 分钟",
    icon: "◇",
    summary: "PCA 是线性降维工具，用少数互相正交的方向保留尽可能多的方差。",
    intuition:
      "从斜着铺开的点云里转动坐标轴，第一根轴沿着点云最长的方向，下一根沿剩下变化最大的方向。",
    core: "PCA 对中心化数据寻找方差最大的正交投影，常由 SVD 实现。它不利用标签，保留方差也不等于保留任务所需的信息；与 nonlinear autoencoder 的表达能力不同。",
    equation: "z=X_centered W_d,  W_d=top d eigenvectors of XᵀX",
    whenToUse: [
      "需要压缩高维连续特征、去掉部分冗余或做二维探索时。",
      "给聚类或经典模型提供轻量、可复现的预处理 baseline 时。",
    ],
    howToUse: [
      "先按训练数据中心化或标准化，再只在训练集 fit PCA。",
      "观察 explained_variance_ratio_ 与下游验证表现决定维数。",
      "在验证和测试集只调用 transform，避免时间或标签泄漏。",
    ],
    tuning: [
      "n_components 可按累计方差提出候选，但最终由任务指标决定。",
      "whiten 改变各主成分尺度，可能帮助某些下游模型，也会放大低方差噪声。",
    ],
    modifications: [
      "非线性结构明显时比较 kernel PCA 或 autoencoder。",
      "数据稀疏或规模大时考虑 TruncatedSVD 或增量 PCA。",
    ],
    pitfalls: [
      "用完整数据 fit PCA 后再切训练集，会让测试分布信息进入预处理。",
      "二维图上分开不一定表示高维中可预测；反之亦然。",
    ],
    example:
      "200 维基因表达特征先在训练集做 PCA，取若干主成分再给 kNN；比较原始特征和 PCA 后的验证准确率。",
    compareTo: ["autoencoder-vae", "knn", "k-means"],
  },
  {
    id: "svm",
    source: {
      label: "scikit-learn: Support Vector Machines",
      url: "https://scikit-learn.org/stable/modules/svm.html",
    },
    title: "SVM：把分类边界撑开",
    englishTitle: "Support Vector Machine (SVM)",
    category: "classical",
    level: "进阶",
    duration: "8 分钟",
    icon: "⟡",
    summary:
      "SVM 追求大间隔边界；kernel 可让非线性边界在隐式特征空间里变线性。",
    intuition:
      "两类点之间能画很多条线；SVM 寻找离最近样本也尽量远的那条。真正贴近边界的样本叫 support vectors。",
    core: "软间隔 SVM 在间隔和误分类之间权衡，C 控制惩罚强弱。RBF kernel 通过相似度建立弯曲边界，gamma 控制单点影响范围。它是经典监督学习方法，不属于深度网络。",
    equation: "min_{w,b} ½‖w‖²+CΣᵢ max(0,1−yᵢ(wᵀxᵢ+b))",
    whenToUse: [
      "中小规模标注数据、强特征已准备好，需要稳健分类 baseline 时。",
      "类别边界可能非线性，但不需要端到端学习表示时。",
    ],
    howToUse: [
      "仅按训练集拟合 scaler，然后在交叉验证里联调 kernel、C 与 gamma。",
      "先试 linear kernel；若欠拟合，再比较 RBF。",
      "用独立验证集检查每类错误、概率校准需求和预测速度。",
    ],
    tuning: [
      "C 大倾向压低训练错误，也更可能过拟合；C 小带来更强正则。",
      "RBF 的 gamma 太大易记住局部点，太小会使边界过平滑。",
    ],
    modifications: [
      "大量样本可考虑 LinearSVC 或核近似，避免 kernel SVC 的计算负担。",
      "类别不平衡时试 class_weight，并报告 macro 指标。",
    ],
    pitfalls: [
      "原始特征尺度不一致会扭曲距离与间隔。",
      "SVM 的 decision score 不是天然校准概率；概率需求要单独校准。",
    ],
    example:
      "小型医学表格分类先做标准化线性 SVM；若验证集持续欠拟合，再试 RBF 并在交叉验证中调 C/gamma。",
    compareTo: ["knn", "neural-networks", "pca"],
  },
  {
    id: "energy-based-models",
    source: {
      label: "Song & Kingma: How to Train Your Energy-Based Models",
      url: "https://arxiv.org/abs/2101.03288",
    },
    title: "EBM：给状态打一个能量分数",
    englishTitle: "Energy-Based Models (EBM)",
    category: "generative",
    level: "高级",
    duration: "9 分钟",
    icon: "↯",
    summary: "Energy 表示配置的相对偏好；能量低代表模型认为更合适。",
    intuition:
      "把所有可能答案想成一张地形图，好的答案在低谷，坏的答案在高处。模型学的是地形，而不一定直接吐出概率或样本。",
    core: "EBM 用标量 Eθ(x) 定义未归一化分布 pθ(x)∝exp(−Eθ(x))。神经网络可以参数化 energy，但 EBM 本身是一类建模框架。难点是归一化常数和采样；常用 MCMC、score matching、noise contrastive estimation 等训练路线，各有目标与假设。",
    equation: "pθ(x)=exp(−Eθ(x))/Zθ,  Zθ=∫exp(−Eθ(x))dx",
    whenToUse: [
      "需要灵活表示相对兼容性、约束或多模态分布的研究问题。",
      "现成判别模型和显式生成模型难表达目标结构时。",
    ],
    howToUse: [
      "先定义 x 或 (x,y) 的 energy 和可评估的目标。",
      "从可复现的小问题开始，对比正负样本的 energy 与采样质量。",
      "根据数据和计算预算选训练法，并监测负样本链或其他近似误差。",
    ],
    tuning: [
      "调整 energy 网络容量和正负样本构造，避免只学到无意义捷径。",
      "若用 MCMC，步长、步数与链混合度会直接影响估计质量。",
    ],
    modifications: [
      "条件 EBM 可用 Eθ(x,y) 评价输入和候选答案的匹配。",
      "可把 energy 作为 reranker，与已有生成器组合。",
    ],
    pitfalls: [
      "低 energy 不是经过校准的概率。",
      "采样或归一化估计困难；训练损失下降不保证生成样本好。",
    ],
    example:
      "给蛋白质构象打相对分数：合理构象的 energy 应比扰动构象低；再检查模型是否只识别扰动方式。",
    compareTo: ["diffusion", "gan", "expectation-maximization"],
  },
  {
    id: "infonce",
    source: {
      label: "van den Oord et al.: Contrastive Predictive Coding",
      url: "https://arxiv.org/abs/1807.03748",
    },
    title: "InfoNCE：在候选里认出正样本",
    englishTitle: "InfoNCE Contrastive Objective",
    category: "representation",
    level: "进阶",
    duration: "8 分钟",
    icon: "⊕",
    summary: "InfoNCE 是对比学习常用的 loss；它本身不是 encoder 架构。",
    intuition:
      "给模型一个 anchor、一个真正相关的 positive，以及一批 distractors；任务像多选题：把 positive 的相似度排在最前。",
    core: "将正样本相似度与正负候选相似度共同送入 softmax，最大化正确配对的 log probability。temperature 控制分布尖锐程度。SimCLR、MoCo、CLIP 的配对和负样本来源不同，但都能使用相近的对比目标。",
    equation: "L=−log[exp(sim(q,k⁺)/τ)/Σ_{k∈{k⁺,k⁻}}exp(sim(q,k)/τ)]",
    whenToUse: [
      "有可靠正配对，想学可检索或可迁移 embedding 时。",
      "图文、不同增强视图或时间邻近片段可构成有意义配对时。",
    ],
    howToUse: [
      "先定义何为 positive，确保同一语义的样本不会大量误作 negative。",
      "对 embedding 归一化，明确 batch 或队列构造负样本的策略。",
      "除训练 loss 外，做 retrieval、linear probe 或任务验证。",
    ],
    tuning: [
      "temperature τ 影响 hard examples 权重；用验证任务选而非死记数值。",
      "负样本数与多样性有影响，但‘越多越好’并非无条件成立。",
    ],
    modifications: [
      "有标签时可用 supervised contrastive objective，把同类样本都视作 positive。",
      "无可靠负样本时比较 BYOL 或 Barlow Twins。",
    ],
    pitfalls: [
      "假负例会把应接近的样本推远。",
      "相似度只学到增强伪迹或数据来源，也可能拿到低 loss。",
    ],
    example:
      "同一张图的两种裁剪作 positive，batch 内其他图作负候选；训练后用冻结特征做小样本分类。",
    compareTo: ["simclr", "moco", "byol", "contrastive-learning"],
  },
  {
    id: "triplet-loss",
    source: {
      label: "FaceNet: A Unified Embedding for Face Recognition and Clustering",
      url: "https://arxiv.org/abs/1503.03832",
    },
    title: "Triplet：让正样本比负样本更近",
    englishTitle: "Triplet Loss & Metric Learning",
    category: "representation",
    level: "进阶",
    duration: "8 分钟",
    icon: "△",
    summary: "用 anchor、positive、negative 三元组直接塑造 embedding 距离。",
    intuition:
      "不用规定‘这张脸的类别概率’，只要求同一个人比不同人更近，而且至少近一个 margin。",
    core: "Triplet loss 惩罚 d(anchor, positive)+margin 超过 d(anchor, negative) 的三元组。与 InfoNCE 的多候选 softmax 不同，它直接约束一个正负距离差；采样太容易的三元组没有梯度，太难的三元组可能含错标或噪声。",
    equation: "L=max(0, d(a,p)−d(a,n)+m)",
    whenToUse: [
      "检索、身份匹配、去重等任务，最终评估依赖 embedding 距离时。",
      "有清楚的同类/异类关系，并能构造高质量三元组时。",
    ],
    howToUse: [
      "设定正负样本来源，划分训练身份和验证身份以检验泛化。",
      "输出归一化 embedding，选择 cosine 或欧氏距离并保持训练/检索一致。",
      "采用 batch 内 semi-hard mining，监测有效三元组比例。",
    ],
    tuning: [
      "margin 太小区分不够，太大可能难以满足；按验证检索指标调。",
      "batch 内身份数和每身份样本数影响可挖掘三元组质量。",
    ],
    modifications: [
      "可换 contrastive/InfoNCE loss，利用一个 batch 中更多配对。",
      "标注充分时也可把分类 loss 与 metric loss 组合。",
    ],
    pitfalls: [
      "随机三元组大多太容易，loss 为零并不代表 embedding 好。",
      "在验证集混入训练中相同的实体，会高估新实体检索表现。",
    ],
    example:
      "商品图像检索：同款不同拍摄角度是 positive，外形相近的别款是 hard negative；看 Recall@K 而不只看 loss。",
    compareTo: ["infonce", "knn", "clip"],
  },
  {
    id: "simclr",
    source: {
      label: "Chen et al.: A Simple Framework for Contrastive Learning",
      url: "https://arxiv.org/abs/2002.05709",
    },
    title: "SimCLR：同一图像的两种视角",
    englishTitle: "SimCLR",
    category: "representation",
    level: "进阶",
    duration: "8 分钟",
    icon: "❂",
    summary: "强数据增强 + encoder + projection head + batch 内对比损失。",
    intuition:
      "同一图像裁剪、变色后仍应被认出；不同图像通常应分开。模型由此学到跨视角稳定的视觉表示。",
    core: "对每张图生成两个增强视图，经共享 encoder 和 MLP projection head 得到表示；用 NT-Xent 对比正对与 batch 内其他视图。训练后通常丢掉 projection head，使用 encoder 特征。与 MoCo 相比，原版 SimCLR 依赖较大的 batch，而无动量队列。",
    equation: "zᵢ=g(f(t₁(x))); zⱼ=g(f(t₂(x)));  L=NT-Xent(zᵢ,zⱼ)",
    whenToUse: [
      "有大量未标注图像，希望先预训练 backbone 再少量标注微调时。",
      "能设计保留任务语义的数据增强时。",
    ],
    howToUse: [
      "先按领域设计两种独立增强视图；颜色是否可变需由任务决定。",
      "训练 encoder + projection head，再冻结 encoder 做 linear probe。",
      "与监督 baseline 和不同增强强度比较下游指标。",
    ],
    tuning: [
      "重点调增强组合、batch size、temperature 和训练时长。",
      "投影头维数与学习率影响预训练，但最终以 encoder 特征质量选。",
    ],
    modifications: [
      "显存有限可考虑 MoCo 的队列设计。",
      "有类别标签可加入 supervised contrastive loss。",
    ],
    pitfalls: [
      "把决定标签的特征通过增强抹掉，例如病理颜色或遥感方向。",
      "batch 内其他图像可能属于同一语义类别，形成 false negatives。",
    ],
    example:
      "没有标签的病理切片先学表征；裁剪可有用，但颜色增强要由病理专家确认不会抹去诊断线索。",
    compareTo: ["moco", "byol", "infonce"],
  },
  {
    id: "moco",
    source: {
      label: "He et al.: Momentum Contrast",
      url: "https://arxiv.org/abs/1911.05722",
    },
    title: "MoCo：用队列保存更多对照",
    englishTitle: "Momentum Contrast (MoCo)",
    category: "representation",
    level: "高级",
    duration: "8 分钟",
    icon: "⟳",
    summary: "动量编码器和负样本队列，让对比字典跨 batch 保持较大且较一致。",
    intuition:
      "每次只看当前 batch，选择题里的干扰选项太少。MoCo 用一个队列保存旧 batch 的键，但让产生这些键的 encoder 缓慢变化，减少过时问题。",
    core: "query encoder 由梯度更新，key encoder 用其参数的指数移动平均更新；当前正键和队列中的负键构成字典。队列解耦字典大小与当前 batch size。与 SimCLR 的主要机制差异是动量 key encoder + queue。",
    equation: "θ_key ← mθ_key+(1−m)θ_query;  L=InfoNCE(q,k⁺,queue)",
    whenToUse: [
      "无标签视觉预训练需要大量负样本，且当前 batch 受显存限制时。",
      "对比学习实验希望明确控制字典大小时。",
    ],
    howToUse: [
      "构建 query/key 两路增强；只对 query 路反传梯度。",
      "每次入队新 key、出队最旧 key，并检查队列与数据分布。",
      "冻结预训练 encoder 做 linear probe 或按下游任务微调。",
    ],
    tuning: [
      "momentum 系数决定 key 变化速度；过快会让队列不一致，过慢会滞后。",
      "queue 大小、temperature 与增强共同影响负样本难度。",
    ],
    modifications: [
      "可参考 MoCo v2 的增强、投影头和训练配方升级。",
      "若负样本语义误判多，可比较不依赖负样本的 BYOL。",
    ],
    pitfalls: [
      "误把 key encoder 当普通可训练分支；原方法对它使用动量更新。",
      "队列太久未更新或数据分布改变会让字典过时。",
    ],
    example:
      "单卡图像预训练 batch 小时，用队列保存跨批次负例；训练后比较和 SimCLR 在相同算力下的线性探针表现。",
    compareTo: ["simclr", "infonce", "byol"],
  },
  {
    id: "clip",
    source: {
      label:
        "Radford et al.: Learning Transferable Visual Models From Natural Language Supervision",
      url: "https://arxiv.org/abs/2103.00020",
    },
    title: "CLIP：让图片和文字相遇",
    englishTitle: "CLIP & Image–Text Alignment",
    category: "representation",
    level: "进阶",
    duration: "9 分钟",
    icon: "⊛",
    summary: "分别编码图片与文本，学会在同一 embedding 空间对齐正确图文配对。",
    intuition:
      "一批图片和描述被打乱，模型要把每张图片找回对应文字。学会这件事后，就能用文字描述去找图，或比较图与类别提示词。",
    core: "图像 encoder 与文本 encoder 输出归一化 embedding；batch 的相似度矩阵用双向对比目标训练。推理时可比较图片与候选文本的相似度做 zero-shot 分类，但结果受 prompt 和训练数据覆盖影响。它不是文本生成 LM。",
    equation:
      "Sᵢⱼ=τ·cos(image_encoder(Iᵢ),text_encoder(Tⱼ));  L=(CE_rows+CE_cols)/2",
    whenToUse: [
      "跨模态检索、开放词汇图像分类、图文匹配时。",
      "类别说明可以用自然语言表达且可接受 prompt 试验时。",
    ],
    howToUse: [
      "从合适的预训练图文模型开始，核查许可、数据域和输入预处理。",
      "为每个类别写多个一致的文本提示，在验证集比较并检查偏差。",
      "图文检索用 Recall@K，分类用每类指标，另看错误样本。",
    ],
    tuning: [
      "若微调，优先比较冻结 encoder、线性 probe 和小学习率微调。",
      "批次内负样本、多样性与 temperature 都会影响对齐质量。",
    ],
    modifications: [
      "领域术语很特殊时，用领域图文配对再训练或微调。",
      "可把图文 embedding 接入检索系统，再由生成模型使用检索结果。",
    ],
    pitfalls: [
      "图文相似度不是事实真伪或校准概率。",
      "zero-shot 能用不代表在特定领域可靠；prompt 和训练数据偏差都需测。",
    ],
    example:
      "在物种图像库里搜索‘长红色喙的鸟’；先把图片和文本都编码，再按余弦相似度检索并人工审查前几名。",
    compareTo: ["simclr", "infonce", "encoder-models"],
  },
  {
    id: "byol",
    source: {
      label: "Grill et al.: Bootstrap Your Own Latent",
      url: "https://arxiv.org/abs/2006.07733",
    },
    title: "BYOL：不靠负样本的自监督",
    englishTitle: "Bootstrap Your Own Latent (BYOL)",
    category: "representation",
    level: "高级",
    duration: "8 分钟",
    icon: "↗",
    summary: "online 网络预测 target 网络对另一视图的表征；target 用动量更新。",
    intuition:
      "把同一图像的两个视角交给两个网络。学生预测老师的表示，老师缓慢跟随学生；无需列出‘其他图都是错答案’。",
    core: "online encoder、projector、predictor 对另一增强视图的 target projection 做匹配；target 网络由 online 参数指数移动平均更新，目标分支 stop-gradient。原方法不显式使用负样本。与 SimCLR/MoCo 的区别在于非对比的预测目标与非对称更新。",
    equation: "L=‖normalize(qθ(z₁))−stopgrad(normalize(z₂′))‖²; θ′←mθ′+(1−m)θ",
    whenToUse: [
      "无标签图像预训练，且显式负样本构造不可靠或显存有限时。",
      "想比较对比式与预测式自监督表示质量时。",
    ],
    howToUse: [
      "构建 online/target 双分支和两种增强；确认 target 不参与梯度更新。",
      "只把 online encoder 留给下游任务，并跑 linear probe。",
      "监测特征方差、相似度和下游指标，排查表示塌缩。",
    ],
    tuning: [
      "EMA momentum、增强强度、predictor 容量和训练日程都重要。",
      "学习率与 batch size 需按所用 backbone 和训练配方验证。",
    ],
    modifications: [
      "可比较 SimSiam 等无动量 target 的非对比结构。",
      "当正配对质量不佳时，先调整视图构造，再改网络。",
    ],
    pitfalls: [
      "去掉 predictor、stop-gradient 或动量更新却仍假设行为相同。",
      "没有负样本不代表天然不会塌缩；实现细节和验证仍重要。",
    ],
    example:
      "在未标注工业零件照片上预训练，之后仅用少量缺陷标签训练线性分类头，和 SimCLR 的冻结特征比较。",
    compareTo: ["simclr", "moco", "barlow-twins"],
  },
  {
    id: "barlow-twins",
    source: {
      label: "Zbontar et al.: Barlow Twins",
      url: "https://arxiv.org/abs/2103.03230",
    },
    title: "Barlow Twins：既一致，也少重复",
    englishTitle: "Barlow Twins",
    category: "representation",
    level: "高级",
    duration: "8 分钟",
    icon: "▦",
    summary: "让两种视图的对应特征一致，同时压低不同特征维度的冗余。",
    intuition:
      "两份图像视角应讲同一件事，所以相同维度要对齐；但每个维度最好提供不同信息，不要全在重复一句话。",
    core: "对两个增强视图的投影构建跨视图相关矩阵 C；对角线推近 1，非对角元素推近 0。原方法不需要显式负样本、动量 target 或梯度停止。与 BYOL 的预测式不对称结构不同。",
    equation: "L=Σᵢ(1−Cᵢᵢ)²+λΣᵢ≠ⱼ Cᵢⱼ²",
    whenToUse: [
      "想在无负样本设定下学习较少冗余的视觉表征时。",
      "希望研究特征维度去相关对下游迁移的影响时。",
    ],
    howToUse: [
      "生成两个保留语义的增强视图，经共享 encoder 和 projector。",
      "正确实现跨 batch 标准化与相关矩阵，监测对角/非对角项。",
      "用冻结特征的分类或检索表现来比较其他 SSL 方案。",
    ],
    tuning: [
      "λ 控制去相关权重；特征维数、batch size 与增强会影响矩阵估计。",
      "过强增强可能让两视图不再对应同一语义。",
    ],
    modifications: [
      "可比较 VICReg 的方差与协方差约束。",
      "换领域时先验证增强操作是否改变标签。",
    ],
    pitfalls: [
      "把相关矩阵写成同一视图内部矩阵，会偏离原目标。",
      "去相关损失低不保证下游任务有用；仍需独立评估。",
    ],
    example:
      "用大量未标注显微照片训练图像 encoder，检查特征是否塌缩，再用少量标签训练线性分类器。",
    compareTo: ["byol", "simclr", "infonce"],
  },
  {
    id: "mae",
    source: {
      label: "He et al.: Masked Autoencoders Are Scalable Vision Learners",
      url: "https://arxiv.org/abs/2111.06377",
    },
    title: "MAE：遮住图像，再补回来",
    englishTitle: "Masked Autoencoders (MAE)",
    category: "representation",
    level: "进阶",
    duration: "8 分钟",
    icon: "▧",
    summary: "用可见 patch 预测被遮住的 patch，是重建式自监督路线。",
    intuition:
      "像拼图：只给模型一部分图像，让它补全缺失部分。要补得合理，encoder 得抓住图像结构。",
    core: "原版 MAE 把大量图像 patch 随机遮住；ViT encoder 只处理可见 patch，轻量 decoder 接上 mask tokens 重建像素。预训练后通常丢弃 decoder，微调 encoder。与 SimCLR 不同，它不靠正负配对拉近/推远表示。",
    equation: "L=mean_{p∈masked} ‖decoder(encoder(visible))_p−pixel_p‖²",
    whenToUse: [
      "有大量未标注图像、准备预训练 ViT backbone 时。",
      "对比式正负配对不自然，但图像遮挡重建合理时。",
    ],
    howToUse: [
      "划分 patches、随机 mask，并确保 encoder 只接收可见 patch。",
      "预训练后去掉 decoder，使用下游标注任务微调或 linear probe。",
      "与随机初始化和对比预训练比较相同 backbone 的下游结果。",
    ],
    tuning: [
      "mask ratio 控制任务难度；原论文常用较高比例，但领域需重验。",
      "patch 大小、decoder 容量和预训练时长都会改变学习任务。",
    ],
    modifications: [
      "医学或遥感图像可换领域相关的遮挡与重建目标。",
      "若像素重建过于关注低层细节，可探索特征空间重建。",
    ],
    pitfalls: [
      "把训练时重建像素好坏当成最终表征质量的唯一指标。",
      "预训练图像分布与下游差距大时，迁移增益可能有限。",
    ],
    example:
      "先用未标注卫星影像训练 MAE，再用少量地物标签微调 ViT；注意遮挡不能泄露数据切分。",
    compareTo: ["autoencoder-vae", "simclr", "contrastive-learning"],
  },
  {
    id: "vicreg",
    source: {
      label: "Bardes et al.: VICReg",
      url: "https://arxiv.org/abs/2105.04906",
    },
    title: "VICReg：防止表示全部一样",
    englishTitle: "Variance–Invariance–Covariance Regularization",
    category: "representation",
    level: "高级",
    duration: "8 分钟",
    icon: "▥",
    summary: "把视图一致、维度有变化、维度少重复拆成三个可检查的目标。",
    intuition:
      "两张同一图像的视图要表达同一内容，但不能把所有图片都编码成同一个点；每个特征维度也最好承担不同信息。",
    core: "VICReg 用 invariance loss 对齐同一样本的两个视图，用 variance 下限避免每个维度塌成常数，再用 covariance penalty 减少维度间冗余。它不需要显式负样本；与 Barlow Twins 的跨视图相关矩阵目标相近，但把防塌缩条件明确拆开。",
    equation: "L=λ·invariance(z,z′)+μ·variance(z,z′)+ν·covariance(z,z′)",
    whenToUse: [
      "希望在无负样本设定下预训练视觉 embedding，并能分别诊断塌缩来源时。",
      "研究增强不变性与特征维度多样性之间的权衡时。",
    ],
    howToUse: [
      "为同一图像产生两个保留语义的增强视图，送入共享 encoder 与 projector。",
      "分别记录三项 loss、每维标准差，以及冻结特征的下游指标。",
      "与 Barlow Twins、BYOL 在相同骨干网络和数据上比较。",
    ],
    tuning: [
      "variance 项阈值和三项权重改变防塌缩与不变性之间的平衡。",
      "batch 太小会让方差和协方差估计波动，需与计算预算一起调。",
    ],
    modifications: [
      "可把 variance 正则与其他自监督目标结合，测试是否稳定训练。",
      "领域增强需要重新设计，避免把目标特征变成噪声。",
    ],
    pitfalls: [
      "只看总 loss 会掩盖某一项失败；应分项监测。",
      "特征方差足够并不说明这些特征对真实下游标签有用。",
    ],
    example:
      "在未标注的工业影像上预训练，比较 VICReg 与 Barlow Twins 的每维方差，以及缺陷分类的线性探针结果。",
    compareTo: ["barlow-twins", "byol", "simclr"],
  },
  {
    id: "dino",
    source: {
      label:
        "Caron et al.: Emerging Properties in Self-Supervised Vision Transformers",
      url: "https://arxiv.org/abs/2104.14294",
    },
    title: "DINO：让学生预测老师的视角",
    englishTitle: "DINO Self-Distillation",
    category: "representation",
    level: "高级",
    duration: "9 分钟",
    icon: "◈",
    summary:
      "无标签自蒸馏：teacher 看大图，student 从多种裁剪学习相同的语义分布。",
    intuition:
      "老师看较完整的图，学生可能只看局部，但要猜出老师对图像内容的判断；不同视角被拉向同一个语义。",
    core: "DINO 用共享结构的 student 和 EMA teacher 输出概率分布，以跨视图交叉熵训练 student；teacher 不反传梯度。multi-crop、teacher centering 和 temperature/sharpening 有助于稳定训练。它与 BYOL 都有动量 teacher，但 DINO 对齐的是归一化分布，而非直接回归向量。",
    equation:
      "L=CE(P_teacher(global crop),P_student(other crop)); θ_teacher←EMA(θ_student)",
    whenToUse: [
      "有大规模未标注图像，想为分类、检索或分割准备 ViT 特征时。",
      "希望自监督特征的局部 patch 也有语义结构时。",
    ],
    howToUse: [
      "从经过验证的 DINO 训练配方开始，明确 global/local crops 的分配。",
      "核查 teacher 仅接收规定的视角、只由 EMA 更新。",
      "分别评估 kNN、linear probe 与目标下游任务，不只看预训练 loss。",
    ],
    tuning: [
      "teacher temperature、centering、EMA 日程会影响分布熵和稳定性。",
      "crop 尺寸、数量与 patch 大小影响局部到全局的学习难度。",
    ],
    modifications: [
      "可以使用领域相关的多视角裁剪，保留目标语义。",
      "下游若有少量标签，可先冻结特征训练头，再比较全量微调。",
    ],
    pitfalls: [
      "省掉 centering 或温度日程后，概率输出可能塌缩。",
      "局部视角若不含目标物，强迫它匹配全局语义可能产生错误监督。",
    ],
    example:
      "用未标注自然图像训练 ViT，再用 patch 特征探索前景区域，并用独立分割标注评估，而不把注意力图直接当分割结果。",
    compareTo: ["byol", "mae", "barlow-twins"],
  },
  {
    id: "logistic-regression",
    source: {
      label: "scikit-learn: LogisticRegression",
      url: "https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html",
    },
    title: "逻辑回归：简单而可靠的分类起点",
    englishTitle: "Logistic Regression",
    category: "classical",
    level: "入门",
    duration: "7 分钟",
    icon: "∿",
    summary:
      "把特征的线性组合转成类别概率；名称里有 regression，主要用来分类。",
    intuition:
      "每个特征给答案加一票或减一票，再用 sigmoid 把总分映射到 0–1。权重告诉你模型沿哪个方向改变判断。",
    core: "二分类模型先算 logit wᵀx+b，再用 sigmoid 得到正类概率，常用 cross-entropy 拟合并加 L2/L1 正则。多分类可用 softmax。它只能在原特征空间里学线性边界，但有时强特征比复杂模型更重要；它是非深度学习 baseline。",
    equation: "p(y=1|x)=σ(wᵀx+b);  σ(t)=1/(1+e⁻ᵗ)",
    whenToUse: [
      "结构化特征、稀疏文本特征或已训练 embedding 的首个监督分类 baseline。",
      "想要小模型、快速推理和可检查的特征权重时。",
    ],
    howToUse: [
      "划分训练/验证/测试集；只在训练集 fit 标准化与缺失值处理。",
      "在交叉验证中调正则强度 C，按任务选择 F1、AUROC 或校准指标。",
      "观察混淆矩阵、不同群体表现及特征系数，检查数据泄漏。",
    ],
    tuning: [
      "C 越小正则越强；L1 可产生稀疏系数，L2 常作为稳健起点。",
      "不平衡类别可试 class_weight，但阈值仍应由验证集和错误代价决定。",
    ],
    modifications: [
      "边界弯曲时加入合理交互或非线性特征，或比较 SVM / 随机森林。",
      "已有深度 encoder 时，把逻辑回归当 linear probe 检查 embedding 信息。",
    ],
    pitfalls: [
      "原始系数大小受特征单位影响，不能直接跨量纲解释重要性。",
      "分类阈值 0.5 未必符合业务代价；训练准确率也不能替代独立验证。",
    ],
    example:
      "预测客户是否流失：先用经过训练集拟合的编码器处理表格特征，再训练逻辑回归；与随机森林比较 AUROC 和校准曲线。",
    compareTo: ["svm", "random-forest", "neural-networks"],
  },
  {
    id: "random-forest",
    source: {
      label: "scikit-learn: Random forests and ensemble methods",
      url: "https://scikit-learn.org/stable/modules/ensemble.html#random-forests",
    },
    title: "随机森林：让很多树一起判断",
    englishTitle: "Random Forest",
    category: "classical",
    level: "入门",
    duration: "8 分钟",
    icon: "♣",
    summary:
      "多棵决策树在随机样本和特征子集上训练，再汇总预测，是强力表格 baseline。",
    intuition:
      "一棵树容易根据训练集做出偶然判断。让许多树各看略有不同的数据和特征，再汇总意见，通常能降低单棵树的波动。",
    core: "随机森林通过 bootstrap 抽样和节点处的随机特征子集制造树之间的差异。分类通常汇总各树类别概率，回归平均输出。它能表达非线性与交互，但不能像神经网络一样端到端学习图像或语言表示；它是非深度学习方法。",
    equation: "ŷ(x)=aggregate(T₁(x),T₂(x),…,T_B(x))",
    whenToUse: [
      "中小型表格数据，想快速获得非线性监督 baseline 时。",
      "特征间可能有阈值和交互，且不想手写大量交叉特征时。",
    ],
    howToUse: [
      "先正确分割数据并处理类别、缺失值；检查所用实现对它们的支持。",
      "在验证集评估分类/回归指标，同时看训练与验证差距。",
      "用置换重要性或局部解释辅助诊断，不把重要性当因果结论。",
    ],
    tuning: [
      "n_estimators 增多可降低随机波动，但增加训练和预测成本。",
      "max_depth、min_samples_leaf 控制单棵树复杂度；max_features 控制树间差异。",
    ],
    modifications: [
      "若追求更强表格性能，可比较梯度提升树，但调参和误差模式不同。",
      "类别很不平衡时调 class_weight、采样或阈值，并看每类召回。",
    ],
    pitfalls: [
      "树对训练数据的数值范围之外难可靠外推。",
      "用测试集选超参数或把同一人的记录拆到训练和测试，会虚高表现。",
    ],
    example:
      "用年龄、实验室指标等表格数据做分类；先比较逻辑回归与随机森林，再决定是否值得训练更复杂的网络。",
    compareTo: ["logistic-regression", "svm", "neural-networks"],
  },
  {
    id: "supervised-contrastive",
    source: {
      label: "Khosla et al.: Supervised Contrastive Learning",
      url: "https://arxiv.org/abs/2004.11362",
    },
    title: "SupCon：同类样本都是正例",
    englishTitle: "Supervised Contrastive Learning (SupCon)",
    category: "representation",
    level: "进阶",
    duration: "8 分钟",
    icon: "⊚",
    summary:
      "有标签时，不必只把同一实例的两个视图当正例；同类别样本也可聚在一起。",
    intuition:
      "SimCLR 只知道‘两张裁剪来自同一张图’。SupCon 还知道‘这两张不同图片都是猫’，所以把同类样本拉近、异类样本推远。",
    core: "对每个 anchor，batch 内所有同类别样本构成 positive set；损失对这些 positive 的 log probability 求平均。它需要可靠标签和每类足够的 batch 样本，与自监督 SimCLR 的实例级配对不同。训练后可接分类头或直接用 embedding 检索。",
    equation:
      "Lᵢ=−(1/|P(i)|)Σ_{p∈P(i)} log[exp(sim(zᵢ,zₚ)/τ)/Σ_{a≠i}exp(sim(zᵢ,zₐ)/τ)]",
    whenToUse: [
      "有可信标签，希望分类特征兼顾检索或同类聚集时。",
      "同类内部变化大，普通 cross-entropy 的几何结构不满足下游需求时。",
    ],
    howToUse: [
      "构造包含每类多个样本的 batch；保证每个 anchor 有正例。",
      "训练 encoder 与 projection head，再用冻结或微调的 encoder 训练分类头。",
      "同时评估分类、检索与难例，和 cross-entropy baseline 比较。",
    ],
    tuning: [
      "temperature、batch 内类别数和每类样本数决定对比目标的难度。",
      "数据增强应保留标签语义；标签噪声较多时先清理或降低错误正对影响。",
    ],
    modifications: [
      "可与 cross-entropy 联合训练，但应验证两项目标的权重。",
      "类别层级明显时，正例定义可以按层级调整并单独评估。",
    ],
    pitfalls: [
      "把不同子类型硬当一个语义簇，可能损害细粒度区分。",
      "类别分布不均时，大类会产生更多正对；需检查采样和每类指标。",
    ],
    example:
      "训练商品图像分类器时，用同款不同拍摄图作正例；同时比较分类准确率和相似商品检索 Recall@K。",
    compareTo: ["simclr", "triplet-loss", "infonce"],
  },
];
