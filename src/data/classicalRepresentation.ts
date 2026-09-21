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
    mechanicsSteps: [
      "写出观测 x、潜变量 z 与联合概率 p(x,z|θ)，明确哪些量在数据里不可见。",
      "用当前 θ 计算后验 q(z)=p(z|x,θ)；若无法精确求后验，先说明采用哪种近似。",
      "固定 q，最大化 Q(θ)=E_q[log p(x,z|θ)]，例如按软责任度加权更新各成分参数。",
      "用新 θ 重新计算观测数据 log likelihood，重复 E/M 步至增益变小，并比较不同初值的结果。",
    ],
    limits: [
      "后验或 M 步难计算时，标准精确 EM 无法直接套用；需变分、采样或数值优化并检查其收敛性质。",
      "高度非凸或模型假设不对时，似然上升也可能落在差的局部解；需多次初始化和留出集诊断。",
    ],
    settings: [
      {
        name: "初始化 / n_init",
        start: "从有意义的初值和多个随机种子开始；GMM 可用 K-means 初始化。",
        adjust: "不同运行结果差很多时增加重启次数，比较留出似然和参数稳定性。",
      },
      {
        name: "收敛阈值 / tol",
        start: "监测每轮观测 log likelihood 的相对改进与参数变化。",
        adjust:
          "过早停止而结果仍在变化时收紧阈值；无实际增益却长时间运行时放宽。",
      },
      {
        name: "潜变量近似",
        start: "后验可解析时优先用精确 E 步。",
        adjust: "后验不可解析时选变分或采样方法，并单独验证近似误差。",
      },
    ],
    whenToUse: [
      "隐藏分组、缺失或其他潜变量使直接最大似然难优化时。",
      "需要概率解释或软分配，而非只给一个硬类别时。",
      "潜变量能带来可解释的软归属，且能为完整数据似然写出可计算的更新时。",
    ],
    howToUse: [
      "先明确观测 x、潜变量 z 和联合模型 p(x,z|θ)。",
      "推导或近似 E-step，再推导 M-step；检查每轮 log likelihood 和收敛。",
      "对 GMM 可从多个随机种子拟合，保留验证准则更好的解。",
      "把训练收敛解用于独立数据，检查预测后验是否稳定，并记录每次初始化的结果。",
    ],
    tuning: [
      "初始化会改变收敛点；尝试多次重启和合理先验。",
      "设置迭代上限与似然改进阈值；避免太早停或无效空转。",
      "若观测似然突然下降，先检查 E/M 推导、近似误差与数值稳定性，不要只放宽停止条件。",
    ],
    modifications: [
      "E-step 无法精确算时，用变分 EM 或 Monte Carlo 近似，但单调性需重新核查。",
      "若分布形状不符，改似然模型，而非只加迭代次数。",
      "M 步没有闭式解时可用广义 EM：只需使 Q 函数改善，并用观测似然验证。",
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
    mechanicsSteps: [
      "只在训练集拟合缺失值处理、缩放或 embedding 生成流程，并保存可供检索的训练向量与标签。",
      "对查询 x 用同一预处理，按选定 metric 计算与训练向量的距离或相似度。",
      "选出距离最近的 k 个邻居；分类做投票，回归求均值，也可按距离加权。",
      "在验证集评估邻居质量、类别错误和查询延迟，再固定设置用于测试或部署。",
    ],
    limits: [
      "距离在原始高维稀疏空间缺少语义时，近邻可能不是真正相似的样本；先学表征或换模型。",
      "数据量很大或延迟严格时，保存并检索全部样本的代价可能过高；考虑近似索引或训练参数模型。",
    ],
    settings: [
      {
        name: "n_neighbors / k",
        start: "先比较少量与较多邻居的候选值，并记录各类召回。",
        adjust:
          "预测抖动且受单个噪声点影响时增大 k；边界被抹平或少数类召回低时减小 k。",
      },
      {
        name: "metric / 特征尺度",
        start:
          "连续特征先按训练集缩放后试欧氏距离；单位化 embedding 比较余弦距离。",
        adjust: "近邻在人类检查下不相似时，优先修正特征与距离定义。",
      },
      {
        name: "weights / 索引",
        start: "先用 uniform 投票与精确搜索建立基线。",
        adjust:
          "近邻距离差异很大时试 distance weighting；延迟超预算时试近似索引并量化召回损失。",
      },
    ],
    whenToUse: [
      "中小数据集、特征距离有意义、希望快速建立可解释 baseline 时。",
      "已有强 embedding，想做少样本分类或相似案例检索时。",
      "模型需要随着参考案例库更新而快速纳入新实例、无须重新拟合复杂参数时。",
    ],
    howToUse: [
      "仅用训练集拟合标准化器，再变换验证与测试数据，避免 leakage。",
      "在验证集上比较 k、距离度量与 uniform/distance weighting。",
      "样本很多时使用合适的邻居索引或近似检索，并测实际延迟。",
      "上线时固定训练样本库版本、预处理器与索引，新增样本后重新测检索质量。",
    ],
    tuning: [
      "小 k 更灵活也更受噪声影响；大 k 更平滑，可能抹平少数类。",
      "欧氏距离适合经缩放的连续特征；embedding 常试 cosine similarity。",
      "少数类召回低但整体准确率高时，分别检查 k、权重、邻居库类比例和阈值。",
    ],
    modifications: [
      "类别不平衡时比较距离加权、类别权重或重新采样。",
      "先用 PCA 或学习到的 embedding 改善高维距离，再运行 kNN。",
      "若不同特征重要性不同，先学习度量或对 embedding 微调，再做同一邻居检索评估。",
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
    mechanicsSteps: [
      "对数值特征做训练集内缩放并确认欧氏距离有意义，选择候选 K。",
      "用 K-means++ 或其他初始化挑出 K 个初始质心。",
      "分配步把每个样本归给最近质心；更新步把质心移到所属样本均值。",
      "重复到质心或 inertia 变化足够小；比较多次重启后的稳定性和业务解释。",
    ],
    limits: [
      "非凸形状、密度差异很大或大量离群点时，平方欧氏距离的质心可能误导；比较密度聚类。",
      "需要成员概率或不同方向协方差时，K-means 的硬分配不够；可比较 GMM。",
    ],
    settings: [
      {
        name: "n_clusters / K",
        start: "按问题允许的分组粒度给出几个候选 K。",
        adjust: "组内明显混杂时提高 K；大量空泛相似簇时降低 K，并核查稳定性。",
      },
      {
        name: "init / n_init",
        start: "用 K-means++ 并做多次独立初始化。",
        adjust: "不同种子结果差距大时增加重启次数并检查异常值与缩放。",
      },
      {
        name: "算法与批量",
        start: "数据可放入内存时先用完整 K-means。",
        adjust:
          "样本规模使训练过慢时试 MiniBatchKMeans，同时比较目标值和下游质量。",
      },
    ],
    whenToUse: [
      "需要快速粗分组、原型压缩或向量量化 baseline 时。",
      "分组主要由欧氏距离和近似球形结构解释时。",
      "要为海量向量提取少数可检查的代表原型，并可接受硬分配时。",
    ],
    howToUse: [
      "清理异常值并缩放特征；先可视化或评估距离是否有意义。",
      "用 k-means++ 初始化，并运行多个随机种子。",
      "结合业务解释、轮廓系数等检查 K，而非仅看训练 inertia。",
      "对每个簇展示代表样本、簇内距离和大小，核查是否真能解释下游问题。",
    ],
    tuning: [
      "K 决定分组粒度；从几个合理候选值比较稳定性与下游用途。",
      "n_init 多次重启可缓解差的局部解；大规模数据可用 MiniBatchKMeans。",
      "出现极小簇或质心被异常值拉走时先清理异常值，再比较 K 和鲁棒替代。",
    ],
    modifications: [
      "簇呈椭圆或需软概率时改 GMM；复杂非凸形状可试密度或谱聚类。",
      "高维噪声大时先在训练集上做 PCA，再重新评估聚类。",
      "若异常值很难剔除且希望代表必须是真实样本，可比较 K-medoids。",
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
    mechanicsSteps: [
      "设定成分数 K 与 covariance_type，初始化各混合权重 π、均值 μ 和协方差 Σ。",
      "E 步用贝叶斯公式计算每个样本对每个成分的责任度 rᵢₖ。",
      "M 步按 rᵢₖ 的软计数更新 π、μ、Σ；必要时给协方差加正则防止奇异。",
      "重复至似然收敛，检查权重极小的成分，并用留出似然/BIC 与解释需求选择模型。",
    ],
    limits: [
      "真实簇不是可由少量高斯近似的椭圆结构时，分量与业务类别可能不对应。",
      "高维且每成分样本少时 full covariance 容易不稳；应缩维、用受限协方差或换模型。",
    ],
    settings: [
      {
        name: "n_components",
        start: "从业务预期附近的几个候选成分数出发。",
        adjust:
          "留出似然恶化或出现很小权重成分时减小；明显欠拟合多峰分布时增大。",
      },
      {
        name: "covariance_type",
        start: "先用受限的 diag 或 tied 与 full 比较。",
        adjust: "簇方向各异且样本足够时试 full；协方差不稳时退回受限形式。",
      },
      {
        name: "reg_covar / n_init",
        start: "监测协方差是否接近奇异，并做多次初始化。",
        adjust: "数值不稳定时提高正则；不同运行落点差距大时增加初始化次数。",
      },
    ],
    whenToUse: [
      "需要 soft clustering、密度估计或离群分数时。",
      "样本群形状可由几个高斯成分合理近似时。",
      "一个点同时有多种状态概率比强制单簇标签更符合业务含义时。",
    ],
    howToUse: [
      "预处理数值特征，并比较不同成分数与 covariance_type。",
      "用多次初始化拟合；观察每个成分的权重、协方差与分配概率。",
      "用留出集似然或 BIC 等选候选模型，再检验解释是否合理。",
      "在部署数据上检查责任度分布与低概率样本比例，发现漂移时重新拟合。",
    ],
    tuning: [
      "n_components 过大易拟合噪声；full covariance 灵活但更耗样本。",
      "协方差正则 reg_covar 可防奇异矩阵；极小成分权重要检查。",
      "若多个成分几乎重叠，减少成分数或限制协方差，不把每个成分硬解释为独立类别。",
    ],
    modifications: [
      "维度很高时可先 PCA 或用 tied/diag covariance。",
      "若组件数不明且想用概率先验，可探索 BayesianGaussianMixture。",
      "若少数成分频繁退化，可加入参数先验或改用变分贝叶斯混合模型。",
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
    equation: "Xc=X−μtrain;  Z=XcW_d;  W_d 为 XcᵀXc 的前 d 个单位正交特征向量",
    mechanicsSteps: [
      "划分数据后只在训练集估计均值，量纲差异大时同时估计缩放参数。",
      "设训练 X 为 [n,p]，按列中心化为 Xc 后做 SVD；取前 d 个右奇异向量作 W_d:[p,d]，投影 Z:[n,d]。不能用未经中心化的 XᵀX 代替。",
      "把训练、验证和测试样本投影到同一组方向，并检查解释方差与下游表现。",
      "把 PCA 与预处理器一起保存，部署时只 transform 新数据，不重新 fit。",
    ],
    limits: [
      "最大方差方向不一定最能预测标签；监督任务须以验证指标决定是否保留 PCA。",
      "非线性流形或局部结构是关键时，线性主成分可能丢信息；比较合适的非线性方法。",
    ],
    settings: [
      {
        name: "n_components",
        start: "观察累计解释方差，选几个不同维数作下游验证。",
        adjust: "模型欠拟合或稀有信号丢失时增加维数；噪声大且延迟高时减少。",
      },
      {
        name: "standardize",
        start: "单位不同的特征先按训练数据标准化。",
        adjust: "若原始方差大小本身有意义，比较只中心化与标准化两种流程。",
      },
      {
        name: "whiten",
        start: "先关闭白化保留主成分的相对尺度。",
        adjust: "下游算法对尺度敏感时试白化；低方差噪声变大时关闭。",
      },
    ],
    whenToUse: [
      "需要压缩高维连续特征、去掉部分冗余或做二维探索时。",
      "给聚类或经典模型提供轻量、可复现的预处理 baseline 时。",
      "希望先测量数据能否用低维线性子空间表示，再决定是否训练非线性 encoder 时。",
    ],
    howToUse: [
      "先按训练数据中心化或标准化，再只在训练集 fit PCA。",
      "观察 explained_variance_ratio_ 与下游验证表现决定维数。",
      "在验证和测试集只调用 transform，避免时间或标签泄漏。",
      "保存训练均值、缩放和主成分矩阵，之后的新数据必须沿同一流程投影。",
    ],
    tuning: [
      "n_components 可按累计方差提出候选，但最终由任务指标决定。",
      "whiten 改变各主成分尺度，可能帮助某些下游模型，也会放大低方差噪声。",
      "重建误差小但预测变差时，保留更多低方差方向或跳过 PCA，以任务指标为准。",
    ],
    modifications: [
      "非线性结构明显时比较 kernel PCA 或 autoencoder。",
      "数据稀疏或规模大时考虑 TruncatedSVD 或增量 PCA。",
      "类别信号落在低方差方向时，改用有监督的表示学习或保留更多主成分。",
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
    mechanicsSteps: [
      "只用训练数据拟合特征缩放器，再选择线性或核映射下的相似度。",
      "训练时最小化权重范数与 hinge-loss 惩罚之和，C 决定违反间隔的代价。",
      "预测时由 support vectors 决定决策函数的符号或类别分数；核 SVM 需计算与支持向量的核值。",
      "用交叉验证比较 C、核与核参数，独立检查每类误差、计算时间及是否需要概率校准。",
    ],
    limits: [
      "大量样本配 RBF 核时训练和预测开销高；先试线性 SVM 或核近似。",
      "原始输入需学习复杂表征时，SVM 不会自动学到图像或语言语义；先用 encoder 抽特征或端到端网络。",
    ],
    settings: [
      {
        name: "kernel",
        start: "有合理特征时先用 linear 作为基线。",
        adjust: "线性验证表现持续欠拟合且数据规模可承受时试 RBF。",
      },
      {
        name: "C",
        start: "在训练折内做对数尺度候选搜索。",
        adjust: "训练和验证都差时提高 C；训练好验证差时降低 C 或简化核。",
      },
      {
        name: "gamma (RBF)",
        start: "按实现默认尺度起步，再在交叉验证中搜索。",
        adjust: "决策边界过碎时降低 gamma；过平滑且欠拟合时提高。",
      },
    ],
    whenToUse: [
      "中小规模标注数据、强特征已准备好，需要稳健分类 baseline 时。",
      "类别边界可能非线性，但不需要端到端学习表示时。",
      "已有固定 embedding 而标注样本不多，线性或 RBF 边界可胜任时。",
    ],
    howToUse: [
      "仅按训练集拟合 scaler，然后在交叉验证里联调 kernel、C 与 gamma。",
      "先试 linear kernel；若欠拟合，再比较 RBF。",
      "用独立验证集检查每类错误、概率校准需求和预测速度。",
      "需要概率时在训练数据内部做交叉验证校准，再在独立验证集检验校准曲线。",
    ],
    tuning: [
      "C 大倾向压低训练错误，也更可能过拟合；C 小带来更强正则。",
      "RBF 的 gamma 太大易记住局部点，太小会使边界过平滑。",
      "RBF 训练耗时或支持向量过多时先比较线性模型与核近似，再调整计算方案。",
    ],
    modifications: [
      "大量样本可考虑 LinearSVC 或核近似，避免 kernel SVC 的计算负担。",
      "类别不平衡时试 class_weight，并报告 macro 指标。",
      "多分类可比较一对多和一对一策略；类别不平衡时与 class_weight 一起验证。",
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
    mechanicsSteps: [
      "定义待评分变量 x 或条件组合 (x,y)，由网络输出一个标量 energy。",
      "选择训练目标：极大似然需要处理正样本与模型分布负样本；score matching 或 NCE 则对应不同近似。",
      "若用采样式训练，从当前模型生成负样本，比较数据样本与负样本的 energy，并更新参数。",
      "评估独立数据上的排序、生成质量和采样诊断，而非只看训练 energy 差。",
    ],
    limits: [
      "归一化常数 Zθ 和负样本采样难计算时，精确概率评估与稳定训练可能不可行。",
      "若任务只需固定类别判别，简单分类器往往更省计算且更易校准。",
    ],
    settings: [
      {
        name: "负样本 / 训练目标",
        start: "从任务可解释的正负构造与明确的排序或似然目标开始。",
        adjust: "模型只识别人工扰动痕迹时换更真实的负样本或训练目标。",
      },
      {
        name: "采样步长与步数",
        start: "采用 MCMC 时先记录链轨迹和样本多样性。",
        adjust:
          "链不移动时调步长或增加步数；样本发散时降低步长并检查 energy 梯度。",
      },
      {
        name: "energy 网络容量",
        start: "用能表达目标相容性的最小可行网络。",
        adjust:
          "训练/验证排序都差时增容量；训练很好但新样本失效时加约束或减容量。",
      },
    ],
    whenToUse: [
      "需要灵活表示相对兼容性、约束或多模态分布的研究问题。",
      "现成判别模型和显式生成模型难表达目标结构时。",
      "需要对候选输出做相对排序，且能接受较复杂的采样或负例构造时。",
    ],
    howToUse: [
      "先定义 x 或 (x,y) 的 energy 和可评估的目标。",
      "从可复现的小问题开始，对比正负样本的 energy 与采样质量。",
      "根据数据和计算预算选训练法，并监测负样本链或其他近似误差。",
      "固定一组未见样本和扰动样本，持续观察能量排序及采样多样性。",
    ],
    tuning: [
      "调整 energy 网络容量和正负样本构造，避免只学到无意义捷径。",
      "若用 MCMC，步长、步数与链混合度会直接影响估计质量。",
      "负样本能量很高但真实难例排序差时，更新负样本生成过程而不只调网络容量。",
    ],
    modifications: [
      "条件 EBM 可用 Eθ(x,y) 评价输入和候选答案的匹配。",
      "可把 energy 作为 reranker，与已有生成器组合。",
      "若采样成本高，可先把 Eθ(x,y) 用作有限候选的 reranker，而非全空间生成器。",
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
    mechanicsSteps: [
      "先定义 anchor、真正相关的 positive 与候选 negative，确定语义是否真的相斥。",
      "用共享或双塔 encoder 得到 embedding，常做归一化后计算点积或余弦相似度。",
      "把各候选相似度除以 temperature，再做 softmax 和正确正例的负 log likelihood。",
      "在检索或迁移任务上验证表示；同时统计 false negatives 与难例，而非只观察训练 loss。",
    ],
    limits: [
      "批内大量同语义样本被当负例时，目标可能破坏所需聚类；改正例定义或考虑非对比路线。",
      "InfoNCE 只是目标函数，缺少配对策略与 encoder 设计时不能单独解决表征学习。",
    ],
    settings: [
      {
        name: "temperature τ",
        start: "按选定相似度和归一化方式，在验证集比较候选值。",
        adjust:
          "过度关注极少难例导致不稳时升高 τ；正负分离不够时降低并检查梯度。",
      },
      {
        name: "候选字典",
        start: "先用 batch 内其他样本作负例并统计语义重复。",
        adjust:
          "负例太容易时增多样性或难度；false negatives 多时改采样而非盲目扩大 batch。",
      },
      {
        name: "配对增强",
        start: "仅使用可保持任务语义的视图或跨模态配对。",
        adjust: "下游关键属性在增强中被抹去时减弱或移除对应增强。",
      },
    ],
    whenToUse: [
      "有可靠正配对，想学可检索或可迁移 embedding 时。",
      "图文、不同增强视图或时间邻近片段可构成有意义配对时。",
      "需要明确的多候选识别目标，并能定义有用负候选时。",
    ],
    howToUse: [
      "先定义何为 positive，确保同一语义的样本不会大量误作 negative。",
      "对 embedding 归一化，明确 batch 或队列构造负样本的策略。",
      "除训练 loss 外，做 retrieval、linear probe 或任务验证。",
      "用冻结 encoder 的最近邻和检索案例人工核查：正对是否正确、负例是否混入同语义。",
    ],
    tuning: [
      "temperature τ 影响 hard examples 权重；用验证任务选而非死记数值。",
      "负样本数与多样性有影响，但‘越多越好’并非无条件成立。",
      "batch 扩大后训练 loss 变化却检索不升时，检查 false negatives 和评估指标，而非继续扩字典。",
    ],
    modifications: [
      "有标签时可用 supervised contrastive objective，把同类样本都视作 positive。",
      "无可靠负样本时比较 BYOL 或 Barlow Twins。",
      "多正例场景可改为正例概率之和或使用 SupCon 的逐正例平均；两种目标不等价。其他正例仍可出现在归一化分母中，关键是同时赋予它们正例监督。",
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
    mechanicsSteps: [
      "用实体或类别标签确定 anchor、同类 positive、异类 negative，并按实体划分训练和验证。",
      "encoder 产生 embedding，按检索时要使用的距离计算 d(a,p) 与 d(a,n)。",
      "仅当 d(a,p)+margin>d(a,n) 时产生损失和梯度；从 batch 挑选有效的 semi-hard 三元组。",
      "训练后建立向量库，以 Recall@K、验证身份的检索结果和难例检查表征。",
    ],
    limits: [
      "训练 batch 无足够有效正负例时，随机三元组 loss 常为零；需改采样或换多候选损失。",
      "标签关系不可靠或同类本身多模态时，强行压近同类可能损失细节。",
    ],
    settings: [
      {
        name: "margin",
        start: "先根据 embedding 是否归一化与距离尺度设置可满足的 margin。",
        adjust:
          "有效三元组过少时降低或加强 mining；所有三元组都违反且训练不稳时检查噪声并减小。",
      },
      {
        name: "mining 策略",
        start: "先用 batch 内 semi-hard negative，并监测有效比例。",
        adjust: "几乎全是简单负例时加强采样；极难负例多为错标时降低难度。",
      },
      {
        name: "batch 组成",
        start: "每个实体放入至少两个视图或样本，并覆盖多个实体。",
        adjust: "缺正例时增加同实体样本；负例单一时增加不同实体。",
      },
    ],
    whenToUse: [
      "检索、身份匹配、去重等任务，最终评估依赖 embedding 距离时。",
      "有清楚的同类/异类关系，并能构造高质量三元组时。",
      "最终产品由相对距离排序驱动，且能稳定采到难度合适的三元组时。",
    ],
    howToUse: [
      "设定正负样本来源，划分训练身份和验证身份以检验泛化。",
      "输出归一化 embedding，选择 cosine 或欧氏距离并保持训练/检索一致。",
      "采用 batch 内 semi-hard mining，监测有效三元组比例。",
      "固定验证图库与查询集，绘制难例并测新实体上的 Recall@K。",
    ],
    tuning: [
      "margin 太小区分不够，太大可能难以满足；按验证检索指标调。",
      "batch 内身份数和每身份样本数影响可挖掘三元组质量。",
      "有效三元组比例迅速接近零时加强半难例采样；损失剧烈波动时排查错标的极难负例。",
    ],
    modifications: [
      "可换 contrastive/InfoNCE loss，利用一个 batch 中更多配对。",
      "标注充分时也可把分类 loss 与 metric loss 组合。",
      "标签层级复杂时，把 margin 或采样按层级设计，避免近缘实体被推得过远。",
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
    mechanicsSteps: [
      "从同一图像独立采样两套增强 t₁、t₂，形成正对；其他实例的视图构成 batch 内负例。",
      "共享 encoder f 产生表征，再经 MLP projection head g 得到训练用向量 z。",
      "对 z 归一化，按温度缩放余弦相似度，以 NT-Xent 对每个视图识别另一个视图。",
      "预训练后使用 encoder 输出做 linear probe 或微调，比较下游而不是保留投影头的训练分数。",
    ],
    limits: [
      "显存限制导致 batch 负例太少时，原版 SimCLR 的训练条件可能不合适；比较 MoCo 队列或非对比方法。",
      "增强改变标签语义时，不变性目标会主动抹掉任务信息；需重设计增强。",
    ],
    settings: [
      {
        name: "增强组合",
        start: "从保留目标语义的裁剪和外观变化开始，逐项做消融。",
        adjust: "线性探针下降或关键属性消失时减弱相关增强。",
      },
      {
        name: "batch / 负例",
        start: "在显存允许下记录 batch 大小和有效负例多样性。",
        adjust: "负例不足或过易时增加 batch 或改用队列；假负例多时改样本构造。",
      },
      {
        name: "temperature / projector",
        start: "保留投影头，用下游 probe 选择 temperature 与头容量。",
        adjust:
          "训练 loss 改善但 encoder 不提升时检查头是否吸收了全部任务信息。",
      },
    ],
    whenToUse: [
      "有大量未标注图像，希望先预训练 backbone 再少量标注微调时。",
      "能设计保留任务语义的数据增强时。",
      "能够使用足够多样的 batch 内负例，且同实例两视图能可靠保留语义时。",
    ],
    howToUse: [
      "先按领域设计两种独立增强视图；颜色是否可变需由任务决定。",
      "训练 encoder + projection head，再冻结 encoder 做 linear probe。",
      "与监督 baseline 和不同增强强度比较下游指标。",
      "固定 backbone 与训练预算，和 MoCo 或监督训练在同一数据切分上比较。",
    ],
    tuning: [
      "重点调增强组合、batch size、temperature 和训练时长。",
      "投影头维数与学习率影响预训练，但最终以 encoder 特征质量选。",
      "预训练损失继续下降而线性探针退步时，首先核查增强是否改变标签语义。",
    ],
    modifications: [
      "显存有限可考虑 MoCo 的队列设计。",
      "有类别标签可加入 supervised contrastive loss。",
      "若实例级 false negatives 很多，可用标签或伪标签扩展 positive 集。",
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
    mechanicsSteps: [
      "对同一图像取 query 与 key 两种增强视图；query encoder 接收梯度，key encoder 独立产生正键。",
      "将正键与队列中旧 batch 的键组合为字典，对当前 query 做 InfoNCE 分类。",
      "反传只更新 query encoder；按 EMA 更新 key encoder，再把当前键入队并移除最旧键。",
      "训练后用 query encoder 抽特征，评价线性探针、检索或下游微调结果。",
    ],
    limits: [
      "数据分布快速变化或队列更新太慢时，旧键可能过时；需缩短队列或调整动量。",
      "语义相同样本大量进入负样本队列时，会产生 false negatives；可改采样或考虑非对比路线。",
    ],
    settings: [
      {
        name: "EMA momentum",
        start: "从缓慢更新 key encoder 的设置开始，记录查询与键表征差距。",
        adjust: "队列键不一致时提高动量；key 长期跟不上 query 时降低动量。",
      },
      {
        name: "queue 长度",
        start: "用可覆盖足够多样性且更新及时的队列。",
        adjust: "负例不足时增长；过时键或假负例多时缩短或更新采样。",
      },
      {
        name: "temperature / 增强",
        start: "与 SimCLR 同样以线性探针比较温度和保语义增强。",
        adjust: "训练稳定但下游差时先检查正对定义、队列类别混合，再调温度。",
      },
    ],
    whenToUse: [
      "无标签视觉预训练需要大量负样本，且当前 batch 受显存限制时。",
      "对比学习实验希望明确控制字典大小时。",
      "希望解耦当前 batch 大小与负例字典大小，并能维护稳定队列时。",
    ],
    howToUse: [
      "构建 query/key 两路增强；只对 query 路反传梯度。",
      "每次入队新 key、出队最旧 key，并检查队列与数据分布。",
      "冻结预训练 encoder 做 linear probe 或按下游任务微调。",
      "记录队列填充、平均键年龄和查询/键编码器差异，再解释性能变化。",
    ],
    tuning: [
      "momentum 系数决定 key 变化速度；过快会让队列不一致，过慢会滞后。",
      "queue 大小、temperature 与增强共同影响负样本难度。",
      "负例总来自旧分布时缩短队列或重建队列；不要仅提高 momentum。",
    ],
    modifications: [
      "可参考 MoCo v2 的增强、投影头和训练配方升级。",
      "若负样本语义误判多，可比较不依赖负样本的 BYOL。",
      "若数据按时间漂移，可按时间窗口清理旧键，避免历史分布主导负例。",
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
      "Sᵢⱼ=s·cos(image_encoder(Iᵢ),text_encoder(Tⱼ));  L=(CE_rows+CE_cols)/2",
    mechanicsSteps: [
      "收集匹配的图文对，并分别经过图像 encoder 与文本 encoder 得到单位化向量。",
      "计算 batch 内所有图片与所有文本的相似度矩阵；正样本在对角线，其余配对作为候选负例。",
      "用可学习 logit scale 调整相似度，然后分别做 image-to-text 与 text-to-image 交叉熵。",
      "推理时预先编码类别文本或检索库，比较相似度；用领域验证集检查 prompt、类别与群体错误。",
    ],
    limits: [
      "图文语义配对覆盖不足或专业术语偏离预训练语料时，zero-shot 结果可能不稳定；需领域验证和适配。",
      "CLIP 的相似度不等于校准概率或事实判断；若需要生成文本，还需独立生成模型。",
    ],
    settings: [
      {
        name: "文本 prompt",
        start: "对每类写含真实描述的简短模板，并用验证集比较。",
        adjust: "某类结果对措辞高度敏感时增加同义模板并做平均或领域适配。",
      },
      {
        name: "logit scale / temperature",
        start: "复用预训练模型的标定设置；重训时监测双向对比损失。",
        adjust:
          "分布过尖而错例置信极高时降低 scale 并检查数据噪声；过平时提高并重验。",
      },
      {
        name: "微调范围",
        start: "先比较冻结编码器、线性头与小范围适配。",
        adjust:
          "领域差距大且有足够配对数据时扩大微调范围；过拟合时退回冻结或参数高效适配。",
      },
    ],
    whenToUse: [
      "跨模态检索、开放词汇图像分类、图文匹配时。",
      "类别说明可以用自然语言表达且可接受 prompt 试验时。",
      "图像类别可用自然语言描述，且需要开放词汇检索或零样本候选比较时。",
    ],
    howToUse: [
      "从合适的预训练图文模型开始，核查许可、数据域和输入预处理。",
      "为每个类别写多个一致的文本提示，在验证集比较并检查偏差。",
      "图文检索用 Recall@K，分类用每类指标，另看错误样本。",
      "开放词汇类别在验证集上做提示词、类别名与子群体误差分析，再固定模板上线。",
    ],
    tuning: [
      "若微调，优先比较冻结 encoder、线性 probe 和小学习率微调。",
      "批次内负样本、多样性与 temperature 都会影响对齐质量。",
      "短文本只含模糊类别名而错分多时改成具体视觉描述，再考虑微调编码器。",
    ],
    modifications: [
      "领域术语很特殊时，用领域图文配对再训练或微调。",
      "可把图文 embedding 接入检索系统，再由生成模型使用检索结果。",
      "特定领域短文本含歧义时，加入上下文 prompt 或用领域图文对做轻量适配。",
    ],
    pitfalls: [
      "图文相似度不是事实真伪或校准概率。",
      "zero-shot 能用不代表在特定领域可靠；prompt 和训练数据偏差都需测。",
    ],
    example:
      "在物种图像库里搜索‘长红色喙的鸟’；先把图片和文本都编码，再按余弦相似度检索并人工审查前几名。",
    compareTo: [
      "simclr",
      "infonce",
      "encoder-models",
      "zero-shot-learning",
      "linear-probe",
    ],
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
    mechanicsSteps: [
      "对同一图像生成两种增强视图，一路送 online encoder+projector+predictor，另一路送 target encoder+projector。",
      "归一化 online 预测与 target 投影，用匹配误差训练；对 target 表征停止梯度。",
      "只对 online 网络反传，随后用 EMA 把 online 参数缓慢写入 target；交换两视图方向可形成对称损失。",
      "监测输出方差和下游 linear probe，部署时通常保留 online encoder。",
    ],
    limits: [
      "正对来自会改变类别的增强时，模型学到错误的不变性；先核查领域语义。",
      "没有显式负样本仍可能发生表征塌缩或学到肤浅捷径；必须监控方差与下游任务。",
    ],
    settings: [
      {
        name: "target EMA",
        start: "按骨干网络与训练日程选择缓慢移动的 teacher。",
        adjust:
          "target 不稳定时增加平滑；target 更新滞后时减弱平滑并检查 probe。",
      },
      {
        name: "predictor / projector",
        start: "保留 online 独有 predictor 与两路 projector，先用已验证结构。",
        adjust: "特征方差塌缩时先核查 stop-gradient 和预测头连接，再调整容量。",
      },
      {
        name: "增强强度",
        start: "从保留任务语义的两种视图开始。",
        adjust: "两视图实际语义不一致或下游下降时减弱裁剪/颜色变换。",
      },
    ],
    whenToUse: [
      "无标签图像预训练，且显式负样本构造不可靠或显存有限时。",
      "想比较对比式与预测式自监督表示质量时。",
      "想避开显式负例，同时有足够未标注视图可构造同实例配对时。",
    ],
    howToUse: [
      "构建 online/target 双分支和两种增强；确认 target 不参与梯度更新。",
      "只把 online encoder 留给下游任务，并跑 linear probe。",
      "监测特征方差、相似度和下游指标，排查表示塌缩。",
      "用固定下游切分比较冻结 encoder 与端到端微调，确认收益来自表征而非训练细节。",
    ],
    tuning: [
      "EMA momentum、增强强度、predictor 容量和训练日程都重要。",
      "学习率与 batch size 需按所用 backbone 和训练配方验证。",
      "各维方差逐步降到接近零时先核查 stop-gradient、EMA 和 predictor 路径。",
    ],
    modifications: [
      "可比较 SimSiam 等无动量 target 的非对比结构。",
      "当正配对质量不佳时，先调整视图构造，再改网络。",
      "若计算需要更简单，比较 SimSiam 等无动量 target 方案，但重新验证稳定性。",
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
    mechanicsSteps: [
      "为每张图像生成两种增强视图，经共享 encoder 与 projector 得到两个 batch 表征。",
      "对各维度在 batch 上中心化和标准化，计算跨视图的维度相关矩阵 C。",
      "把 C 的对角线拉向 1 保持同维一致，压低非对角项减少跨维冗余。",
      "训练后检查 C、每维方差及冻结 encoder 的下游效果，避免只报告预训练损失。",
    ],
    limits: [
      "小 batch 使相关矩阵估计噪声大时，目标可能不稳定；需核查批量和归一化实现。",
      "任务依赖细小颜色或位置线索时，常见增强可能抹掉这些信号；先做语义检查。",
    ],
    settings: [
      {
        name: "冗余权重 λ",
        start: "按原始方法结构设置，再记录对角与非对角损失。",
        adjust: "不同维度仍高度相关时提高；同视图对齐受损时降低。",
      },
      {
        name: "batch 大小",
        start: "选择能稳定估计相关矩阵的可承受 batch。",
        adjust: "相关矩阵和训练曲线波动大时增大有效批量或累积统计。",
      },
      {
        name: "投影维数 / 增强",
        start: "用领域可保语义的增强与可计算的投影维数。",
        adjust: "矩阵计算成为瓶颈时减小维数；下游信息不足时比较更丰富表征。",
      },
    ],
    whenToUse: [
      "想在无负样本设定下学习较少冗余的视觉表征时。",
      "希望研究特征维度去相关对下游迁移的影响时。",
      "希望用可解释的跨视图相关矩阵同时诊断一致性与冗余时。",
    ],
    howToUse: [
      "生成两个保留语义的增强视图，经共享 encoder 和 projector。",
      "正确实现跨 batch 标准化与相关矩阵，监测对角/非对角项。",
      "用冻结特征的分类或检索表现来比较其他 SSL 方案。",
      "在验证阶段分别记录矩阵对角均值、非对角能量和线性探针。",
    ],
    tuning: [
      "λ 控制去相关权重；特征维数、batch size 与增强会影响矩阵估计。",
      "过强增强可能让两视图不再对应同一语义。",
      "非对角项改善但对角项变差时减弱冗余权重或检查增强是否过强。",
    ],
    modifications: [
      "可比较 VICReg 的方差与协方差约束。",
      "换领域时先验证增强操作是否改变标签。",
      "如果 batch 统计不稳，可研究 VICReg 的显式方差项，并在相同预算下比较。",
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
    mechanicsSteps: [
      "把图像切成 patch，随机选择部分 patch 遮挡，只把可见 token 连同位置送入 ViT encoder。",
      "在轻量 decoder 中补入 mask token，恢复原 patch 位置并输出被遮区域的像素预测。",
      "仅对 masked patch 计算重建损失，反传更新 encoder 和 decoder。",
      "预训练后丢弃 decoder，比较 encoder 在分类、检测或分割任务上的微调表现。",
    ],
    limits: [
      "像素重建可以偏向低层纹理，若下游更依赖语义对应，需比较对比或教师目标。",
      "图像 patch 很小或遮挡策略不合领域结构时，模型可能用局部线索轻易补全而学不到目标表征。",
    ],
    settings: [
      {
        name: "mask ratio",
        start: "以原论文的高遮挡思路为候选，再按领域验证。",
        adjust: "任务太容易时提高遮挡；重要结构完全不可见且训练不稳时降低。",
      },
      {
        name: "patch size",
        start: "选能覆盖关键结构且计算可承受的 patch 尺寸。",
        adjust: "细小目标被压掉时减小 patch；计算过重且细节不关键时增大。",
      },
      {
        name: "decoder 容量",
        start: "使用相对轻量的预训练 decoder，让计算主要留给 encoder。",
        adjust:
          "重建欠拟合到不能训练时适度增加；重建好但下游差时先检查目标和遮挡。",
      },
    ],
    whenToUse: [
      "有大量未标注图像、准备预训练 ViT backbone 时。",
      "对比式正负配对不自然，但图像遮挡重建合理时。",
      "重建缺失图像块具有意义，且下游会使用 ViT encoder 时。",
    ],
    howToUse: [
      "划分 patches、随机 mask，并确保 encoder 只接收可见 patch。",
      "预训练后去掉 decoder，使用下游标注任务微调或 linear probe。",
      "与随机初始化和对比预训练比较相同 backbone 的下游结果。",
      "保存 encoder 并在相同下游骨干上比较从零训练、linear probe 和全量微调。",
    ],
    tuning: [
      "mask ratio 控制任务难度；原论文常用较高比例，但领域需重验。",
      "patch 大小、decoder 容量和预训练时长都会改变学习任务。",
      "重建图像清晰但下游分类差时比较遮挡策略与语义目标，不盲目增加 decoder。",
    ],
    modifications: [
      "医学或遥感图像可换领域相关的遮挡与重建目标。",
      "若像素重建过于关注低层细节，可探索特征空间重建。",
      "局部纹理重建主导而语义迁移差时，比较特征预测目标或加入语义监督。",
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
    mechanicsSteps: [
      "为同一图像生成两种语义一致的增强视图，用共享 encoder/projector 得到 z 与 z′。",
      "invariance 项对齐同一图像两路表示；variance 项要求每路的各维标准差不要低于阈值。",
      "covariance 项惩罚同一路表征不同维度的非对角协方差，减少冗余。",
      "联合优化三项，并分别监测每维方差、协方差和下游 linear probe。",
    ],
    limits: [
      "小 batch 的方差/协方差估计不稳时，防塌缩信号有噪声；需扩大有效批量或调整估计。",
      "三个正则保证的是统计形态，不保证语义有用；下游质量仍取决于增强与数据。",
    ],
    settings: [
      {
        name: "variance 阈值",
        start: "按实现的特征标准化约定设置，并记录低方差维度比例。",
        adjust:
          "大量维度趋近常数时增强约束；梯度过于被方差项支配时检查尺度或放缓。",
      },
      {
        name: "三项权重",
        start: "先沿用已验证配方，分别画出各项曲线。",
        adjust:
          "视图不一致时提高 invariance；维度相关过强时提高 covariance；塌缩时提高 variance。",
      },
      {
        name: "batch 与增强",
        start: "用能稳定估计批统计的 batch 和保语义增强。",
        adjust:
          "统计抖动大时提高有效批量；probe 变差时逐项减弱改变标签的增强。",
      },
    ],
    whenToUse: [
      "希望在无负样本设定下预训练视觉 embedding，并能分别诊断塌缩来源时。",
      "研究增强不变性与特征维度多样性之间的权衡时。",
      "需要把“同视图一致”和“防塌缩”分开监测并调节时。",
    ],
    howToUse: [
      "为同一图像产生两个保留语义的增强视图，送入共享 encoder 与 projector。",
      "分别记录三项 loss、每维标准差，以及冻结特征的下游指标。",
      "与 Barlow Twins、BYOL 在相同骨干网络和数据上比较。",
      "定期保存表征统计量，确认三项损失没有某一项长期主导训练。",
    ],
    tuning: [
      "variance 项阈值和三项权重改变防塌缩与不变性之间的平衡。",
      "batch 太小会让方差和协方差估计波动，需与计算预算一起调。",
      "维度方差正常但下游检索差时核查增强、数据域与正对定义，而非继续加方差约束。",
    ],
    modifications: [
      "可把 variance 正则与其他自监督目标结合，测试是否稳定训练。",
      "领域增强需要重新设计，避免把目标特征变成噪声。",
      "若某维容易塌缩，先单独增加 variance 项并观察其他两项和下游是否受损。",
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
    mechanicsSteps: [
      "从一张图生成 global 和 local crops；teacher 只看 global，student 看多种裁剪。",
      "两网络经 encoder/head 输出 logits；teacher 分布经 centering 与 sharpening，student 用自己的 temperature 做 softmax。",
      "用跨视图 teacher/student 分布的交叉熵更新 student，teacher 停梯度并用 student 参数 EMA 更新。",
      "监测输出熵与分布塌缩，预训练后用 student/teacher 特征做 kNN、linear probe 和下游评估。",
    ],
    limits: [
      "local crop 不含 global 的目标语义时，强行配对会生成错误监督；需检查裁剪与任务物体尺度。",
      "teacher 温度、centering 和 EMA 组合实现不当可能使输出塌缩；应先复现可信配方。",
    ],
    settings: [
      {
        name: "teacher temperature / centering",
        start: "使用经验证的 schedule 与 running center，并跟踪输出熵。",
        adjust:
          "分布变成常数或单一维度时先核查中心化和温度；过平或过尖再小步调整。",
      },
      {
        name: "EMA momentum",
        start: "让 teacher 平滑追随 student，并记录两路特征差距。",
        adjust: "teacher 抖动时提高平滑；teacher 长期滞后时降低。",
      },
      {
        name: "global/local crop",
        start: "依据目标大小选择能保留语义的裁剪尺度。",
        adjust: "局部裁剪经常空白或无目标时减少此类裁剪或增大视野。",
      },
    ],
    whenToUse: [
      "有大规模未标注图像，想为分类、检索或分割准备 ViT 特征时。",
      "希望自监督特征的局部 patch 也有语义结构时。",
      "希望无标签 ViT 特征具备较好的局部 patch 语义，并可负担教师训练时。",
    ],
    howToUse: [
      "从经过验证的 DINO 训练配方开始，明确 global/local crops 的分配。",
      "核查 teacher 仅接收规定的视角、只由 EMA 更新。",
      "分别评估 kNN、linear probe 与目标下游任务，不只看预训练 loss。",
      "对独立图像检查 teacher 输出熵与不同裁剪预测，再做 kNN/线性探针。",
    ],
    tuning: [
      "teacher temperature、centering、EMA 日程会影响分布熵和稳定性。",
      "crop 尺寸、数量与 patch 大小影响局部到全局的学习难度。",
      "teacher 分布接近均匀或只偏向少数原型时，先排查温度、centering 与 EMA。",
    ],
    modifications: [
      "可以使用领域相关的多视角裁剪，保留目标语义。",
      "下游若有少量标签，可先冻结特征训练头，再比较全量微调。",
      "小目标领域可调整 multi-crop 尺度，让局部裁剪仍包含可识别目标。",
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
    mechanicsSteps: [
      "按实体或时间正确分割数据，在训练折内拟合缺失值、类别编码与特征缩放。",
      "线性组合得到 logit，再用 sigmoid 得二分类概率；训练时最小化 cross-entropy 加正则。",
      "在验证集选择正则强度和决策阈值，必要时评估概率校准。",
      "锁定预处理、系数与阈值，在独立测试集报告每类指标并检查分布变化。",
    ],
    limits: [
      "原特征下边界高度非线性或交互复杂时，线性 logit 不足；可加交互或比较树模型。",
      "类别概率不一定天然校准，尤其存在偏移或重采样时；需校准评估。",
    ],
    settings: [
      {
        name: "正则强度 C",
        start: "在交叉验证中搜索，从有正则的简单模型开始。",
        adjust: "训练验证都欠拟合时增大 C；系数不稳或泛化差时减小。",
      },
      {
        name: "penalty",
        start: "相关特征较多时先试 L2。",
        adjust: "需要稀疏可解释系数时试 L1；特征高度相关时注意 L1 选择不稳定。",
      },
      {
        name: "分类阈值 / class_weight",
        start: "先用原始类比例训练并报告 PR、召回、校准。",
        adjust: "漏报代价高时调低阈值；类别权重改变后重新校准和选阈值。",
      },
    ],
    whenToUse: [
      "结构化特征、稀疏文本特征或已训练 embedding 的首个监督分类 baseline。",
      "想要小模型、快速推理和可检查的特征权重时。",
      "需要对特征贡献方向做初步审查并保留一个强、快的监督 baseline 时。",
    ],
    howToUse: [
      "划分训练/验证/测试集；只在训练集 fit 标准化与缺失值处理。",
      "在交叉验证中调正则强度 C，按任务选择 F1、AUROC 或校准指标。",
      "观察混淆矩阵、不同群体表现及特征系数，检查数据泄漏。",
      "部署时把缺失值处理、编码器、系数和验证阈值封装成同一预测流水线。",
    ],
    tuning: [
      "C 越小正则越强；L1 可产生稀疏系数，L2 常作为稳健起点。",
      "不平衡类别可试 class_weight，但阈值仍应由验证集和错误代价决定。",
      "概率排序好而决策召回差时先调阈值；校准差时单独做概率校准。",
    ],
    modifications: [
      "边界弯曲时加入合理交互或非线性特征，或比较 SVM / 随机森林。",
      "已有深度 encoder 时，把逻辑回归当 linear probe 检查 embedding 信息。",
      "若交互显著，可加入经过领域筛选的交叉特征，并与树模型做独立验证。",
    ],
    pitfalls: [
      "原始系数大小受特征单位影响，不能直接跨量纲解释重要性。",
      "分类阈值 0.5 未必符合业务代价；训练准确率也不能替代独立验证。",
    ],
    example:
      "预测客户是否流失：先用经过训练集拟合的编码器处理表格特征，再训练逻辑回归；与随机森林比较 AUROC 和校准曲线。",
    compareTo: ["svm", "random-forest", "neural-networks", "xgboost"],
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
    mechanicsSteps: [
      "用训练数据 bootstrap 抽样，给每棵树一组略不同的样本。",
      "每次节点分裂只在随机抽出的特征子集上寻找最佳切分，形成彼此不同的树。",
      "分类汇总各树类别预测或概率，回归对各树数值输出求平均。",
      "用留出集或交叉验证比较泛化指标、各类错误、OOB 估计及推理成本。",
    ],
    limits: [
      "需要外推到训练值范围以外时，树的分段常数预测通常不可靠；比较线性或结构化模型。",
      "原始图像、语音或文本需要自动学习局部/序列特征时，直接用随机森林可能不如专门 encoder。",
    ],
    settings: [
      {
        name: "n_estimators",
        start: "先用足够多的树让验证波动稳定。",
        adjust: "不同随机种子的结果仍抖动时增加；收益很小而成本高时停止增加。",
      },
      {
        name: "max_depth / min_samples_leaf",
        start: "限制单树复杂度并比较训练与验证误差。",
        adjust:
          "训练好验证差时降低深度或提高叶节点最小样本数；双双欠拟合时反向调整。",
      },
      {
        name: "max_features",
        start: "从实现的任务默认值开始。",
        adjust: "树高度相关且泛化差时减小候选特征数；单树普遍太弱时增大。",
      },
    ],
    whenToUse: [
      "中小型表格数据，想快速获得非线性监督 baseline 时。",
      "特征间可能有阈值和交互，且不想手写大量交叉特征时。",
      "表格特征的阈值与交互重要，且训练样本量可支撑多树集成时。",
    ],
    howToUse: [
      "先正确分割数据并处理类别、缺失值；检查所用实现对它们的支持。",
      "在验证集评估分类/回归指标，同时看训练与验证差距。",
      "用置换重要性或局部解释辅助诊断，不把重要性当因果结论。",
      "在验证集之外保留最终测试集；若使用 OOB，也核查其与独立验证的一致性。",
    ],
    tuning: [
      "n_estimators 增多可降低随机波动，但增加训练和预测成本。",
      "max_depth、min_samples_leaf 控制单棵树复杂度；max_features 控制树间差异。",
      "训练准确率接近满分但验证差时先提高 min_samples_leaf 或降低 max_depth。",
    ],
    modifications: [
      "若追求更强表格性能，可比较梯度提升树，但调参和误差模式不同。",
      "类别很不平衡时调 class_weight、采样或阈值，并看每类召回。",
      "对严格延迟要求，可减少树数或深度并记录实际性能折衷。",
    ],
    pitfalls: [
      "树对训练数据的数值范围之外难可靠外推。",
      "用测试集选超参数或把同一人的记录拆到训练和测试，会虚高表现。",
    ],
    example:
      "用年龄、实验室指标等表格数据做分类；先比较逻辑回归与随机森林，再决定是否值得训练更复杂的网络。",
    compareTo: ["logistic-regression", "svm", "neural-networks", "xgboost"],
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
    core: "对每个 anchor，batch 内除自身外的同类别视图构成 positive set；损失对这些 positive 的 log probability 求平均。分母包含除 anchor 自身外的所有候选，包括正例和负例。它需要可靠标签和足够正例，与自监督 SimCLR 的实例级配对不同。训练后可接分类头或直接用 embedding 检索。",
    equation:
      "Lᵢ=−(1/|P(i)|)Σ_{p∈P(i)} log[exp(sim(zᵢ,zₚ)/τ)/Σ_{a≠i}exp(sim(zᵢ,zₐ)/τ)]",
    mechanicsSteps: [
      "按可信类别标签构造 batch，让每个 anchor 至少有一个同类 positive 与异类候选。",
      "对每个样本做保标签增强，经 encoder 与 projection head 得到归一化 embedding。",
      "对每个 anchor 平均所有同类 positive 的 log-softmax 项；分母包含该 batch 中除 anchor 自身外的全部正负候选。",
      "训练 encoder 后单独训练分类头或做检索，检查少数类与细粒度类是否被过度合并。",
    ],
    limits: [
      "标签噪声把异类当正对时，会主动压近错误样本；需清理标签或降低错误配对影响。",
      "同一粗类包含重要子类型时，类内聚合可能损害细粒度检索；考虑分层正例或普通 CE。",
    ],
    settings: [
      {
        name: "batch 组成",
        start: "保证每类有多个样本/视图，并包含多类。",
        adjust: "anchor 缺正例时提高每类样本数；负例单一时覆盖更多类别。",
      },
      {
        name: "temperature",
        start: "在固定归一化和采样方案下，用验证检索指标搜索。",
        adjust: "难例使训练不稳时调高；类间分离不足时调低并检查噪声。",
      },
      {
        name: "与 CE 联合权重",
        start: "先做 CE baseline 和纯 SupCon，再比较联合训练。",
        adjust:
          "分类上升而检索下降时提高对比项；分类退步时降低并检查正例定义。",
      },
    ],
    whenToUse: [
      "有可信标签，希望分类特征兼顾检索或同类聚集时。",
      "同类内部变化大，普通 cross-entropy 的几何结构不满足下游需求时。",
      "同类近邻检索本身是目标，且同类多实例标签足够可靠时。",
    ],
    howToUse: [
      "构造包含每类多个样本的 batch；保证每个 anchor 有正例。",
      "训练 encoder 与 projection head，再用冻结或微调的 encoder 训练分类头。",
      "同时评估分类、检索与难例，和 cross-entropy baseline 比较。",
      "抽样检查同类 positive 是否真的语义一致，单独评估细粒度检索。",
    ],
    tuning: [
      "temperature、batch 内类别数和每类样本数决定对比目标的难度。",
      "数据增强应保留标签语义；标签噪声较多时先清理或降低错误正对影响。",
      "大类聚得好而小类被吞没时调整 batch 采样与每类权重，并看 macro 指标。",
    ],
    modifications: [
      "可与 cross-entropy 联合训练，但应验证两项目标的权重。",
      "类别层级明显时，正例定义可以按层级调整并单独评估。",
      "若类内具有重要亚型，可根据层级标签定义不同权重的正例或分阶段训练。",
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
