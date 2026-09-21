import type { Lesson } from "./lessons";

export const visionLanguageLessons: Lesson[] = [
  {
    id: "unet",
    source: {
      label: "Ronneberger et al., U-Net (2015)",
      url: "https://arxiv.org/abs/1505.04597",
    },
    title: "U-Net：一边理解，一边找回位置",
    englishTitle: "U-Net",
    category: "vision",
    level: "进阶",
    duration: "9 分钟",
    icon: "◫",
    summary:
      "Encoder 抓语义、decoder 还原分辨率，skip connection 把细节直接送回去。",
    intuition:
      "像先缩小地图认出哪块是道路，再把路的轮廓画回原图。缩小时丢掉的精细位置，由同尺度的 skip features 补回来。",
    core: "对称的下采样与上采样路径构成 U 形；每一级 decoder 把上采样特征与对应 encoder 特征拼接，再卷积融合。输出为逐像素分类 logits。原论文针对生物图像并强调强数据增强；现代实现可替换 backbone 与卷积块。",
    equation:
      "Dₗ=Conv([Upsample(Dₗ₊₁), Eₗ]);  z=Conv₁×₁(D₀);  pᵢⱼ=softmax类(zᵢⱼ)（多类）或 sigmoid(zᵢⱼ)（单 logit 二分类）",
    mechanicsSteps: [
      "输入图像经重复卷积与下采样，空间尺寸下降、通道与语义上下文增加；记录每级 encoder 特征 Eₗ。",
      "瓶颈层处理最大视野的特征；decoder 每级先上采样，再与同尺度 Eₗ 在通道维拼接。",
      "融合卷积把粗语义与精细位置合并，末端 1×1 卷积输出每像素各类别 logits；二分类可用单 logit。",
      "训练时将 logits 与逐像素标签计算 CE／BCE、Dice 或组合损失；推理时 softmax／sigmoid，再按验证集确定的规则转 mask。",
    ],
    limits: [
      "标准 U-Net 输出的是类别区域，不会天然分开相贴的同类实例；需要实例标签时比较 Mask R-CNN。",
      "目标尺度超过 patch 上下文时易断裂；可加大视野、滑窗重叠或使用多尺度上下文模型。",
    ],
    settings: [
      {
        name: "patch size / 输入视野",
        start: "先保证典型目标及其周围上下文能同时进入 patch，并记录显存。",
        adjust:
          "大结构被截断就扩大视野；细小边界丢失就提高有效分辨率或减少下采样。",
      },
      {
        name: "loss 与前景采样",
        start: "多类先用 CE，前景稀疏时加入 Dice 并保证 batch 有前景。",
        adjust:
          "背景准确但小目标召回低时提高前景采样或调 Dice 权重；假阳性多时反向检查。",
      },
      {
        name: "预测阈值 / overlap",
        start: "二分类阈值与滑窗重叠在验证集上选，保存同一后处理配置。",
        adjust:
          "边缘接缝明显就增加重叠并平滑融合；误检多则结合 PR 曲线升阈值。",
      },
    ],
    whenToUse: [
      "像素级语义分割，尤其需要边缘定位、标注数据有限的医学或工业图像。",
      "输入和输出具有同一空间坐标系，例如细胞、器官或缺陷 mask。",
    ],
    howToUse: [
      "统一图像与 mask 的尺寸、插值和几何增强；mask 缩放应使用 nearest neighbor。",
      "从预训练 encoder 的 U-Net baseline 开始；按类别分布选 cross-entropy、Dice 或组合损失。",
      "按病例或场景划分训练与验证，推理后检查小目标和边界。",
      "先检查图像、mask 的类别编码、配准和空 mask 样本；用可视化叠图抽检。",
      "部署时复用训练的归一化、滑窗拼接和阈值；报告病例级与类别级指标。",
    ],
    tuning: [
      "patch size 决定上下文和显存；目标大时增加视野，目标细时保留分辨率。",
      "前景稀少时调采样策略和 Dice/CE 权重，观察 per-class Dice/IoU。",
      "训练 Dice 高而外部病例低时先检查病人级泄漏与强度归一化，再扩大增强范围。",
      "训练 loss 降而边界破碎时对照原图检查 mask 插值、输出分辨率与边界相关误差。",
    ],
    modifications: [
      "三维体数据可用 3D U-Net；数据差异较大时先试 nnU-Net 的自动配置。",
      "需要更丰富的跨尺度融合时比较 U-Net++ 或 attention gates。",
    ],
    pitfalls: [
      "切片随机分到训练和验证会把同一病例信息泄漏两边。",
      "只看总体像素准确率会掩盖小病灶漏检；阈值也应在验证集上选。",
    ],
    example:
      "在显微图里分出每个细胞区域：模型输出每个像素属于细胞的概率，再按验证阈值得到 mask。",
    compareTo: ["nnunet", "unet-plus-plus", "deeplabv3-plus"],
  },
  {
    id: "nnunet",
    source: {
      label: "Isensee et al., nnU-Net (Nature Methods, 2021)",
      url: "https://doi.org/10.1038/s41592-020-01008-z",
    },
    title: "nnU-Net：让分割流水线自己适配",
    englishTitle: "nnU-Net",
    category: "vision",
    level: "进阶",
    duration: "9 分钟",
    icon: "▦",
    summary: "在 U-Net 家族上自动选择预处理、网络、训练与后处理配置。",
    intuition:
      "U-Net 是一张设计图；nnU-Net 更像会看数据规格后决定裁剪、分辨率和训练配方的施工队。改进常来自完整 pipeline，而非神奇的新层。",
    core: "nnU-Net 分析数据指纹，包括图像维度、体素间距与大小，选择 2D、3D full-resolution 或级联配置，并制定归一化、patch、batch、增强和后处理。它是 self-configuring segmentation framework，不是一个固定结构的单一模型。",
    equation: "配置 = f(数据指纹, 显存预算);  mask = 后处理(U-Net配置(x))",
    mechanicsSteps: [
      "读取数据指纹：图像形状、voxel spacing、模态、类别与训练病例分布。",
      "规划器依据数据与显存预算选 target spacing、归一化、patch size、网络深度及可行的 2D／3D／cascade 配置。",
      "预处理重采样图像与标签，训练各候选配置并用病例级交叉验证比较或集成。",
      "推理复用相同预处理和重采样，预测回原坐标；后处理只采用交叉验证有收益的规则。",
    ],
    limits: [
      "它自动适配工程配置，但无法修正标签错误、跨医院分布偏移或错误的病例切分。",
      "3D 配置可能因显存只看有限体积；极小病灶或强各向异性数据仍需查重采样后的可见性。",
    ],
    settings: [
      {
        name: "target spacing",
        start: "先保留自动规划值并记录每轴 spacing 与各向异性。",
        adjust:
          "薄结构在重采样后消失时检查原始体素、改变 spacing 或优先比较 2D 配置。",
      },
      {
        name: "patch / batch / 显存预算",
        start: "从规划器给出的可运行组合开始，先确认典型器官能进入视野。",
        adjust:
          "大器官上下文不足时优先增加 patch；OOM 时缩 patch 或启用更小配置，并检查小 batch 的梯度波动。",
      },
      {
        name: "配置选择 / 后处理",
        start:
          "用病例级交叉验证选择 2D、3D full-resolution、cascade 或其集成。",
        adjust:
          "连通域后处理删掉真实小病灶就关闭该类规则；外部数据变差时分医院核查。",
      },
    ],
    whenToUse: [
      "医学图像分割任务变化多、没有时间逐项手调 U-Net pipeline。",
      "需要强、可复现的 baseline 来判断自定义方法是否真的有收益。",
    ],
    howToUse: [
      "严格整理病例级数据、体素间距与类别标签；先检查方向、spacing 和 train/validation split。",
      "运行规划和预处理，再训练推荐配置；比较 2D、3D、cascade 的交叉验证结果。",
      "使用对应配置的推理、重采样和后处理步骤；外部测试集单独评估。",
      "核对扫描方向、spacing 元数据与标签在物理空间是否重合，并按病人去重。",
      "保留规划输出、训练 seed、fold 和推理配置，让外部样本按同一流程重现。",
    ],
    tuning: [
      "先检查自动规划的 target spacing、patch size、batch size 与各类出现率。",
      "显存受限可调资源预算；目标极小或各向异性明显时重点看重采样带来的信息损失。",
      "小目标漏检时先查看重采样后的标签是否还存在，再考虑调 patch 和采样，而不是只改网络。",
      "外部医院成绩掉落时按站点比较强度直方图、spacing 与标签规范。",
    ],
    modifications: [
      "可更换 backbone、loss 或采样方案，但先与默认配方做同 split 对照。",
      "后处理可按类别验证连通域规则，避免删除真实小目标。",
    ],
    pitfalls: [
      "nnU-Net 不会修复错误的标注、病例泄漏或不代表真实部署分布的验证集。",
      "把它描述为新的卷积层会误解其核心贡献：系统化的数据适配。",
    ],
    example:
      "多家医院的 CT 器官分割：先让 nnU-Net 根据 voxel spacing 和体积大小选择 3D patch，再验证每家医院的 Dice。",
    compareTo: ["unet", "unet-plus-plus", "deeplabv3-plus"],
  },
  {
    id: "unet-plus-plus",
    source: {
      label: "Zhou et al., UNet++ (2018)",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7329239/",
    },
    title: "U-Net++：把跳接变成融合路径",
    englishTitle: "UNet++",
    category: "vision",
    level: "进阶",
    duration: "8 分钟",
    icon: "▤",
    summary:
      "密集、嵌套的 skip pathways 缩小 encoder 与 decoder 特征的语义差距。",
    intuition:
      "普通 U-Net 让浅层纹理直接与深层语义会合；UNet++ 在它们之间建多级过渡站，逐步把两种特征对齐。",
    core: "每条 skip path 含卷积节点，并在同分辨率上密集连接多个中间结果；deep supervision 可在不同深度输出预测。这增加融合能力，也增加计算和实现复杂度。",
    equation: "Xⁱʲ = Conv([Xⁱ⁰,…,Xⁱ⁽ʲ⁻¹⁾, Up(X⁽ⁱ⁺¹⁾⁽ʲ⁻¹⁾)])",
    mechanicsSteps: [
      "encoder 构造多尺度特征，类似 U-Net，但每个同尺度 skip 不直接只连一个 decoder 节点。",
      "嵌套节点拼接该尺度之前的中间节点与更深层上采样特征，卷积逐步弥合浅层与深层语义差。",
      "可在多级 decoder 节点接 segmentation head 做 deep supervision；每个 head 上采样到标签尺度计算损失。",
      "推理使用已验证的一个 head 或融合输出；较浅 head 可在精度允许时剪去部分深层路径。",
    ],
    limits: [
      "密集拼接让中间激活显存增加，推理时也可能更慢；预算紧时先试标准 U-Net。",
      "如果误差来自标注噪声、数据泄漏或目标缺失，增加 skip 密度不会解决。",
    ],
    settings: [
      {
        name: "嵌套深度",
        start: "从与 U-Net 近似宽度的浅层嵌套版本开始，同 split 对照。",
        adjust: "边界收益很小而显存飙升时减节点；小目标有持续收益再加深。",
      },
      {
        name: "deep supervision 权重",
        start: "各输出 head 先用可解释的非零权重，在验证集比较单 head 和融合。",
        adjust:
          "浅层 head 噪声大时降低其权重；深层 head 训练慢时检查梯度与分辨率。",
      },
      {
        name: "通道宽度",
        start: "固定 encoder，先从与基线相近的 decoder 通道开始。",
        adjust: "OOM 优先减 decoder 宽度或嵌套深度；欠拟合再增通道。",
      },
    ],
    whenToUse: [
      "U-Net 已可运行，但浅层细节与深层语义结合不足、边界或小目标仍差。",
      "能承担额外计算并需要比较不同 decoder 深度。",
    ],
    howToUse: [
      "先固定同一 encoder、数据分割和增强，与普通 U-Net 公平比较。",
      "训练多级 segmentation heads；推理时选经验证的单 head 或融合方式。",
      "把所有中间 head 的输出尺寸、类别维和标签插值逐一单测。",
      "分别记录精度、峰值显存与端到端延迟，决定额外融合是否值得。",
    ],
    tuning: [
      "嵌套深度与通道宽度共同影响显存；先用小规模版本试效果。",
      "deep supervision 的各 head 权重应结合验证集确定。",
      "若训练集边界改善而验证集不改善，先减宽度、加强形变增强并核查标注一致性。",
      "多 head 预测不一致时按病灶大小分层诊断，不要直接用测试集选择 head。",
    ],
    modifications: [
      "可用预训练 encoder 或三维卷积；更小预算可裁剪部分 decoder。",
      "若跨尺度上下文不足，可对照 DeepLabv3+ 的 ASPP。",
    ],
    pitfalls: [
      "更多跳接不保证更好；需要计入 latency 和显存。",
      "多输出 head 的测试选择不能依据 test set。",
    ],
    example: "对细胞边界不清的分割任务，逐级融合高分辨率纹理与低分辨率语义。",
    compareTo: ["unet", "nnunet", "deeplabv3-plus"],
  },
  {
    id: "deeplabv3-plus",
    source: {
      label: "Chen et al., DeepLabv3+ (2018)",
      url: "https://arxiv.org/abs/1802.02611",
    },
    title: "DeepLabv3+：看大范围，也修边界",
    englishTitle: "DeepLabv3+",
    category: "vision",
    level: "进阶",
    duration: "8 分钟",
    icon: "▥",
    summary: "空洞卷积与 ASPP 获取多尺度上下文，decoder 再恢复对象边界。",
    intuition:
      "识别道路需要看远处的场景，同时画边界时又要看近处细节；不同 dilation rate 像用不同大小的窗口同时观察。",
    core: "Backbone 产出特征；ASPP 使用并行的 atrous convolution 以不同采样间距汇聚上下文；轻量 decoder 融合低层特征改善边缘。相较 U-Net，更强调多尺度感受野与 output stride 的控制。",
    equation:
      "ASPP(F)=Project₁×₁(concat(Conv₁×₁(F), Convᵣ₁(F), Convᵣ₂(F), Convᵣ₃(F), Up(Conv₁×₁(GAP(F)))))",
    mechanicsSteps: [
      "backbone 产生高层语义特征及低层高分辨率特征；空洞卷积以间隔采样而不继续下采样。",
      "ASPP 并行使用 1×1、多个 dilation rate 的 3×3 卷积与全局平均池化分支；池化分支经投影后上采样回同一空间尺寸，再拼接并投影融合。",
      "高层输出上采样，和降通道后的低层特征拼接；decoder 卷积恢复边界信息。",
      "逐像素分类训练，推理将 logits 上采样回原图尺寸，再按类别取预测并检查细小结构。",
    ],
    limits: [
      "过大的 dilation 对很小 feature map 只采到少数有效点；不能把标称感受野等同真实上下文。",
      "只需简单医学 mask 且样本很少时，预训练 U-Net 或 nnU-Net 可能更易建立强基线。",
    ],
    settings: [
      {
        name: "output stride",
        start:
          "在现有 backbone 的标准 stride 配置上起步，并记录输出 feature map 大小。",
        adjust:
          "边界粗糙或小物体漏检可减 stride；显存／延迟超预算则增 stride。",
      },
      {
        name: "ASPP dilation rates",
        start: "使用与所选 output stride 和 crop 相匹配的实现默认配置。",
        adjust:
          "特征图太小导致有效采样稀疏时降低 rate；大物体上下文不够时扩大 crop 或对照较大 rate。",
      },
      {
        name: "crop / scale augmentation",
        start: "裁剪应覆盖主要物体及周围语境，并做尺度扰动。",
        adjust: "大物体被裁断就增 crop；训练只识别单一尺度时扩大 scale 范围。",
      },
    ],
    whenToUse: [
      "自然场景语义分割，物体大小差异显著。",
      "希望在感受野、输出分辨率和计算量之间控制取舍。",
    ],
    howToUse: [
      "选预训练 backbone，并对齐图像、mask 与输出尺寸。",
      "先固定 output stride 与 crop size，记录每类 IoU 和边界错误。",
      "核查空洞卷积输出 stride 与标签尺度，确保最后插值用正确坐标约定。",
      "在验证集分别看大物体、小物体与边缘误差，再决定改 ASPP 还是 decoder。",
    ],
    tuning: [
      "atrous rates 要与 feature map 大小匹配；太大的 rate 可能采不到有效位置。",
      "output stride 小可保留更多细节，但显存和计算通常增加。",
      "大物体预测破碎时先检查训练 crop 是否切断结构；小目标漏检优先检查输出 stride。",
      "边界比 U-Net 差时审视低层特征通道与上采样实现，而非单改 ASPP rate。",
    ],
    modifications: [
      "更换 backbone 可改变速度与准确率；深度可分离卷积可减计算。",
      "可加入边界损失或高分辨率分支处理细长结构。",
    ],
    pitfalls: [
      "把大 dilation 当作必然更大的有效上下文，忽略 feature map 尺寸。",
      "训练时过度裁剪会切断大物体上下文。",
    ],
    example:
      "道路场景里同时分割行人、车与道路：ASPP 处理尺度差异，decoder 修正行人轮廓。",
    compareTo: ["unet", "unet-plus-plus", "swin-transformer"],
  },
  {
    id: "vgg",
    source: {
      label: "Simonyan & Zisserman, VGG (2014)",
      url: "https://arxiv.org/abs/1409.1556",
    },
    title: "VGG：用小卷积搭深网络",
    englishTitle: "VGG",
    category: "vision",
    level: "入门",
    duration: "7 分钟",
    icon: "▧",
    summary: "堆叠 3×3 convolution 和 pooling，研究网络深度带来的收益。",
    intuition:
      "连续几个小窗口也能覆盖较大区域，并在每一步加入非线性；结构整齐，容易看清深度的作用。",
    core: "VGG-16/19 按 stage 堆叠 3×3 卷积，stage 间下采样，末端用于分类。它没有 ResNet 的残差捷径，参数量和计算成本较高，今天更适合做架构历史与简单特征基线。",
    equation: "Fₗ₊₁ = ReLU(Conv₃×₃(Fₗ));  多层堆叠扩大有效感受野",
    mechanicsSteps: [
      "各 stage 连续执行 3×3 卷积与 ReLU，多次小卷积累积感受野并加入非线性。",
      "池化在 stage 间降低空间分辨率，同时提高后续层的通道数量。",
      "分类版把末端特征送入全连接层输出类别 logits，再用交叉熵训练。",
      "迁移时加载预训练卷积层、替换分类头；推理固定同样的图像预处理。",
    ],
    limits: [
      "原始大规模全连接头参数多、激活成本高；严格设备预算下通常先看 MobileNetV2 等轻量骨干。",
      "缺少残差捷径，盲目堆更深层不如直接比较 ResNet 的优化稳定性。",
    ],
    settings: [
      {
        name: "VGG-16 / VGG-19",
        start: "以较小变体作兼容性基线，采用与权重配套的输入规范。",
        adjust: "容量明显不足才试更深版本；延迟超限则换更轻骨干。",
      },
      {
        name: "冻结 stage",
        start: "小数据先冻结早期卷积，只训练新 head。",
        adjust:
          "训练准确但验证低时先加强增强；领域纹理差异大且欠拟合时逐级解冻。",
      },
      {
        name: "head 与学习率",
        start: "先用小型分类头，并给预训练层更温和的学习率。",
        adjust:
          "头部过拟合就减参数或用全局池化；解冻后 loss 暴涨就降 backbone 学习率。",
      },
    ],
    whenToUse: [
      "学习 CNN stage、感受野和深度概念。",
      "已有 VGG 预训练权重且需要兼容旧实验或感知损失。",
    ],
    howToUse: [
      "优先加载预训练特征提取器，更换分类 head。",
      "与 ResNet、EfficientNet 比较相同数据集上的精度、参数和延迟。",
      "先确认官方权重的颜色通道、归一化和输入尺度，避免迁移时预处理错配。",
      "用同一硬件记录参数、激活显存、吞吐和精度，而非只看模型文件大小。",
    ],
    tuning: [
      "输入分辨率和 Batch Size 会明显影响显存；Transfer Learning 先冻结早期 Stage。",
      "从较小 VGG 版本开始，若训练不稳定先检查学习率。",
      "训练变慢或 OOM 时先减少输入分辨率／batch，评估是否该换结构。",
      "解冻后验证集退化时先降 backbone 学习率并检查数据增强是否过弱。",
    ],
    modifications: [
      "用 global average pooling 替换庞大的全连接头减少参数。",
      "需要更深网络时改用残差连接架构。",
    ],
    pitfalls: [
      "把网络层数增加等同于泛化改善。",
      "只比较准确率而忽略内存、计算成本和更现代 baseline。",
    ],
    example:
      "拿预训练 VGG 卷积特征做工业图片分类，再对照 ResNet 的速度和准确率。",
    compareTo: ["cnn", "resnet", "densenet"],
  },
  {
    id: "densenet",
    source: {
      label: "Huang et al., DenseNet (2017)",
      url: "https://arxiv.org/abs/1608.06993",
    },
    title: "DenseNet：每层都能看到前面",
    englishTitle: "DenseNet",
    category: "vision",
    level: "进阶",
    duration: "7 分钟",
    icon: "▨",
    summary: "每层拼接此前所有层的特征，鼓励特征复用和短梯度路径。",
    intuition:
      "ResNet 把旧答案与新答案相加；DenseNet 则把前面学到的线索都摆上桌，让下一层自己挑要用什么。",
    core: "在一个 dense block 内，第 l 层输入是此前层输出的 concatenation；growth rate 决定每层新增多少通道。Transition layer 压缩通道并下采样，限制规模。",
    equation: "xₗ = Hₗ([x₀, x₁, …, xₗ₋₁])",
    mechanicsSteps: [
      "dense block 第 l 层把此前所有层的 feature maps 按通道拼接，不是逐元素相加。",
      "本层卷积只生成由 growth rate 指定数量的新通道，旧通道沿短路径继续传给后层。",
      "transition layer 通过卷积压缩通道并池化降采样，避免整个网络通道无限增长。",
      "最终汇聚特征接分类 head；反向传播可经密集连接抵达早期层。",
    ],
    limits: [
      "密集拼接的激活与内存访问可能重，低参数量不自动意味着低显存或低延迟。",
      "如果主要瓶颈是训练数据或部署算子，结构上的特征复用不一定带来收益。",
    ],
    settings: [
      {
        name: "growth rate",
        start: "从成熟的预训练变体原生 growth rate 起步。",
        adjust: "显存高则减增长率或用 checkpointing；欠拟合且数据足够再增。",
      },
      {
        name: "block depth / compression",
        start: "保留预训练架构配置，先替换 head。",
        adjust:
          "中间激活成为瓶颈时缩 block 或加强 transition 压缩；容量不足再扩深。",
      },
      {
        name: "冻结与学习率",
        start: "小样本先训 head，之后逐级解冻。",
        adjust:
          "解冻 loss 波动大就降低 backbone 学习率；领域差异大且收益停滞再多解冻。",
      },
    ],
    whenToUse: [
      "需要比较 feature reuse 和 residual addition 的不同设计。",
      "图像分类或作为预训练 backbone，且实测延迟和显存可接受。",
    ],
    howToUse: [
      "先使用成熟的预训练 DenseNet 变体并替换最终 head。",
      "用相同数据 split 对比 ResNet，记录吞吐与峰值显存。",
      "检查每个 dense block 的通道增长是否和实现文档一致，并记录峰值激活。",
      "与参数量相近或延迟相近的 ResNet 比较，避免只按模型名称判断。",
    ],
    tuning: [
      "growth rate、block 深度和压缩率控制容量与内存。",
      "小数据集先调增强和正则化，别直接加深 block。",
      "GPU 使用率低但 latency 高时检查 concat 与内存带宽开销。",
      "过拟合优先处理数据增强、weight decay 和预训练迁移，再改 growth rate。",
    ],
    modifications: [
      "可把 DenseNet 当 encoder 接 U-Net decoder。",
      "内存紧张时考虑 checkpointing 或更低 growth rate。",
    ],
    pitfalls: [
      "特征拼接会持续增长通道，算子和中间激活成本需实测。",
      "与 ResNet 的加法 skip 混为一谈会忽视其结构差异。",
    ],
    example:
      "用 DenseNet-121 提取胸片特征，比较同数据上的 ResNet-50 AUC、显存和推理速度。",
    compareTo: ["resnet", "vgg", "efficientnet"],
  },
  {
    id: "efficientnet",
    source: {
      label: "Tan & Le, EfficientNet (ICML, 2019)",
      url: "https://proceedings.mlr.press/v97/tan19a.html",
    },
    title: "EfficientNet：一起放大宽、深和分辨率",
    englishTitle: "EfficientNet",
    category: "vision",
    level: "进阶",
    duration: "8 分钟",
    icon: "▣",
    summary: "Compound scaling 用一个预算系数协调网络深度、宽度和输入分辨率。",
    intuition:
      "要放大照片识别能力，既需要更多处理步骤，也需要更宽的特征通道和更清楚的输入；只放大一个维度容易失衡。",
    core: "从搜索得到的 EfficientNet-B0 出发，按预设比例同时扩展 depth、width、resolution 形成 B 系列。基础网络采用高效卷积块；compound scaling 是模型族的核心原则，不代表所有设备上都最快。",
    equation: "depth = α^φ, width = β^φ, resolution = γ^φ;  α·β²·γ² ≈ 2",
    mechanicsSteps: [
      "先确定基础网络 B0 的卷积块与阶段布局，再用 compound scaling 而非只加深或加宽。",
      "预算系数 φ 同时提高深度、通道宽度和输入分辨率，设计好的比例形成不同 B 型号。",
      "网络内部的高效卷积块提取逐级特征，末端全局汇聚后分类。",
      "迁移时加载匹配型号的预训练权重与图像预处理，替换 head 并在目标设备验证成本。",
    ],
    limits: [
      "论文的 FLOPs 效率不等于所有硬件上的响应时间；算子实现和批大小会改变排序。",
      "更大 B 型号需要更多训练数据与显存，小数据任务不一定有更好泛化。",
    ],
    settings: [
      {
        name: "B 型号",
        start:
          "从符合设备预算的较小预训练型号开始，同时固定对应推荐输入预处理。",
        adjust:
          "准确率不足且延迟有余量时升型号；超时则降型号或比较 MobileNetV2。",
      },
      {
        name: "输入分辨率",
        start: "先与 checkpoint 训练尺寸一致，记录小目标可见性。",
        adjust: "细节丢失而有算力余量时升分辨率；收益不增而成本上升时回退。",
      },
      {
        name: "解冻与学习率",
        start: "先训练新 head，再用较低 backbone 学习率微调。",
        adjust:
          "领域差异大且欠拟合就逐步解冻；验证下降时减学习率和增强过强部分。",
      },
    ],
    whenToUse: [
      "分类需要在精度与计算预算间挑选不同规模模型。",
      "想用成熟的预训练 CNN Backbone 做 Transfer Learning。",
    ],
    howToUse: [
      "先选与设备延迟、显存匹配的 B 型号和推荐输入尺寸。",
      "加载预训练权重，按任务替换分类头，并做同硬件测速。",
      "确认模型权重、输入尺寸与 normalization 是同一发布版本的组合。",
      "评估需要用实际部署的 batch、精度模式和预处理成本做端到端测速。",
    ],
    tuning: [
      "输入分辨率与模型变体应一起调；分辨率过高可能只增加成本。",
      "小数据微调优先扫学习率、增强与冻结层数。",
      "精度已饱和但 latency 上升时停止加大 B 型号，改检查数据质量。",
      "小目标持续漏检时比较升分辨率与更适合密集预测的骨干，而非只加宽。",
    ],
    modifications: [
      "可用 EfficientNet encoder 搭配 U-Net 或 DeepLab decoder。",
      "移动端要实测所用算子的实际效率，必要时比较 MobileNet。",
    ],
    pitfalls: [
      "FLOPs 低不保证真实硬件 latency 低。",
      "微调时使用与预训练权重不匹配的 normalization 或图像尺寸。",
    ],
    example:
      "移动设备图片分类：比较 B0、B2 的精度与端侧响应时间，选满足延迟要求的版本。",
    compareTo: ["vgg", "resnet", "convnext"],
  },
  {
    id: "convnext",
    source: {
      label: "Liu et al., ConvNeXt (CVPR, 2022)",
      url: "https://arxiv.org/abs/2201.03545",
    },
    title: "ConvNeXt：用现代训练配方重做 CNN",
    englishTitle: "ConvNeXt",
    category: "vision",
    level: "进阶",
    duration: "8 分钟",
    icon: "▩",
    summary: "保留卷积骨干，吸收 ViT 时代在 stage、卷积块与训练上的设计经验。",
    intuition:
      "当 Transformer 表现强时，先问是不是网络部件和训练配方也进步了；ConvNeXt 把这些进步逐一放回纯 CNN。",
    core: "ConvNeXt 基于 ResNet 路线改造 stage ratio、patchify stem、depthwise 大核卷积、归一化与激活等设计；它仍是 ConvNet，不使用 self-attention。论文中的比较依赖相应训练 recipe。",
    equation: "block(x) = x + PW₂(GELU(PW₁(LN(DWConv₇×₇(x)))))",
    mechanicsSteps: [
      "patchify stem 先把图像映射成较低分辨率特征，随后分 stage 处理。",
      "每个现代化 block 用大核 depthwise convolution 处理空间、pointwise 层混合通道，并通过残差相加。",
      "stage 间下采样形成多尺度特征；分类使用全局汇聚，检测／分割接任务 head。",
      "性能依赖架构与训练 recipe 的组合；微调加载与 checkpoint 匹配的规范化和增强配置。",
    ],
    limits: [
      "ConvNeXt 仍用局部卷积，不能简单等同 ViT 的全局 token attention。",
      "若目标设备不擅长 depthwise 或大核卷积，参数／FLOPs 的优势可能不转化为延迟优势。",
    ],
    settings: [
      {
        name: "Tiny / Small / Base 规模",
        start: "先以能满足显存与延迟的预训练小型号作为 baseline。",
        adjust: "验证欠拟合且资源有余再升级；部署超时则缩模型或降低输入尺寸。",
      },
      {
        name: "输入尺寸",
        start: "采用与权重相配的预处理与分辨率。",
        adjust:
          "小对象纹理被抹掉则测试更高分辨率；成本大幅增加却指标不动时回退。",
      },
      {
        name: "微调 recipe",
        start: "先沿用发布实现的优化器、weight decay 和增强范围。",
        adjust:
          "微调震荡降低 backbone 学习率；训练与验证差距扩大则调整增强或正则。",
      },
    ],
    whenToUse: [
      "想保留卷积归纳偏置，同时使用强的现代视觉 backbone。",
      "图像分类、检测或分割需要与 ViT/Swin 公平比较。",
    ],
    howToUse: [
      "使用可信的预训练 checkpoint 和对应预处理。",
      "把它当 backbone 接任务 head，并在目标硬件上测 latency、显存和精度。",
      "分别比较同预训练数据量、同输入尺寸的 ResNet 和 ViT，再看真实任务收益。",
      "分类以外的任务接多尺度 feature maps，并核查各 stage stride 与 neck 的接口。",
    ],
    tuning: [
      "模型尺寸与输入分辨率同时决定成本。",
      "微调学习率、weight decay 和增强时保持验证 split 一致。",
      "在新领域表现弱时先检查 normalization／颜色空间与权重一致性。",
      "精度高但设备延迟异常时分析 depthwise 大核算子的实际实现，而不是仅看 FLOPs。",
    ],
    modifications: [
      "可加入分割 decoder；也可与 ConvNeXt V2 比较预训练策略。",
      "资源有限时用 Tiny 规模或更轻 backbone。",
    ],
    pitfalls: [
      "把收益全部归因于某一个卷积核大小，忽略完整训练配方。",
      "不同预训练数据量的 checkpoint 直接比较会误导选择。",
    ],
    example:
      "工业缺陷分类同场测试 ConvNeXt-Tiny、ResNet-50 与 ViT-Base，记录准确率和每张图推理时间。",
    compareTo: ["resnet", "efficientnet", "vit", "swin-transformer"],
  },
  {
    id: "vit",
    source: {
      label: "Dosovitskiy et al., Vision Transformer (2020)",
      url: "https://arxiv.org/abs/2010.11929",
    },
    title: "ViT：把图像切成 token",
    englishTitle: "Vision Transformer (ViT)",
    category: "vision",
    level: "进阶",
    duration: "9 分钟",
    icon: "▦",
    summary:
      "将 image patches 投影为序列，交给 Transformer encoder 建模全局关系。",
    intuition:
      "CNN 从局部窗口逐步扩大视野；ViT 把图片切成小方块，允许每块通过 attention 直接参考其他块。",
    core: "图像分割为固定大小 patches，线性投影加位置编码与可选 class token，随后进入 Transformer encoder。标准全局 attention 在 patch 数 N 上计算通常为 O(N²)，因此 patch size 与分辨率影响很大。",
    equation:
      "N = (H/P)(W/P);  z₀ = [CLS; PatchEmbed(x₁); …; PatchEmbed(xₙ)] + position",
    mechanicsSteps: [
      "把 H×W 图像切为 P×P patch，展平并线性投影为 token；添加位置表示及可选 [CLS] token。",
      "每层 encoder 的多头 self-attention 让 token 读取其他位置，再经前馈网络和残差更新表示。",
      "分类从 [CLS] 或 pooled tokens 输出 logits；密集任务需要重组 patch 特征并接解码器。",
      "训练用任务损失反传；推理需处理新输入分辨率带来的 token 数与位置嵌入变化。",
    ],
    limits: [
      "标准全局 attention 随 token 数平方增长，高分辨率密集预测需要认真测内存或用分层变体。",
      "缺少卷积局部归纳偏置，小数据从零训练通常更依赖预训练或强增强。",
    ],
    settings: [
      {
        name: "patch size P",
        start: "先沿用预训练权重原生 P，记录最小目标覆盖的 token 数。",
        adjust: "小目标被整块吞没可比较更小 P；显存超限则增 P 或改 Swin。",
      },
      {
        name: "输入分辨率 / 位置嵌入",
        start: "先使用预训练推荐尺寸和对应位置编码处理。",
        adjust: "提高分辨率时确认位置嵌入插值正确，并测 N² attention 成本。",
      },
      {
        name: "微调学习率 / warmup",
        start: "使用预训练模型官方 recipe 的量级作为搜索起点。",
        adjust:
          "早期 loss 发散就降学习率或延长 warmup；欠拟合再检查冻结与数据量。",
      },
    ],
    whenToUse: [
      "有合适的预训练权重，需要全局关系的图像分类或迁移任务。",
      "愿意比较不同 patch size 与预训练规模的视觉模型。",
    ],
    howToUse: [
      "优先使用预训练 ViT，匹配输入尺寸、归一化和位置编码处理。",
      "分类用 class token 或 pooling；密集预测需接 decoder 或用多尺度变体。",
      "核查 checkpoint 的 patch embedding、位置编码与图像预处理完全匹配。",
      "按目标尺寸分层报告结果，判断 patch token 化是否吃掉关键细节。",
    ],
    tuning: [
      "patch 越小 token 越多，细节更多但 attention 成本上升。",
      "微调先扫学习率、weight decay、warmup 与数据增强。",
      "训练集高而验证低时先加强数据增强或减小可训练参数量，不盲目减 patch。",
      "新分辨率性能骤降时排查位置嵌入插值与序列长度，而非只改 head。",
    ],
    modifications: [
      "自监督预训练或卷积 stem 可改善数据效率。",
      "检测和分割任务可比较 Swin 的层次化特征。",
    ],
    pitfalls: [
      "从小数据随机训练时不能假设与大型预训练 ViT 一样有效。",
      "调整输入分辨率却不处理位置嵌入与算力变化。",
    ],
    example:
      "用预训练 ViT 分类病理切片 patch，检查所需局部纹理是否被 patch size 保留。",
    compareTo: [
      "cnn",
      "convnext",
      "swin-transformer",
      "mae",
      "positional-encoding",
    ],
  },
  {
    id: "swin-transformer",
    source: {
      label: "Liu et al., Swin Transformer (ICCV, 2021)",
      url: "https://arxiv.org/abs/2103.14030",
    },
    title: "Swin：窗口注意力也能跨窗交流",
    englishTitle: "Swin Transformer",
    category: "vision",
    level: "进阶",
    duration: "9 分钟",
    icon: "▧",
    summary: "层次化特征加 shifted windows，使局部 attention 能跨窗口传信息。",
    intuition:
      "先让图像块在各自房间讨论，下一层把房间墙错开，于是原本隔壁的块也能交流；再逐级合并块得到更大尺度。",
    core: "Window self-attention 将注意力限制在局部窗口；交替 shifted window 打通相邻窗口；patch merging 构成多尺度金字塔。与标准 ViT 的单一尺度全局 attention 不同，Swin 易作为检测和分割 backbone。",
    equation:
      "W-MSA → SW-MSA → patch merging;  固定窗口时 attention 随像素数近似线性增长",
    mechanicsSteps: [
      "图像先被分成 patch tokens，在一个 stage 内按固定窗口分组计算局部 self-attention。",
      "下一 block 平移窗口划分，使前一层不同窗口的 token 能间接交换信息。",
      "patch merging 降低空间分辨率并增加通道，形成类似 CNN 的多尺度金字塔。",
      "分类取末端特征；检测或分割将多个 stage 的特征送入 neck／decoder，再做任务训练。",
    ],
    limits: [
      "shifted window 只是逐层跨窗传播，不意味着单层对整图直接全局注意。",
      "复杂的窗口划分和 padding 在非标准尺寸上可能增延迟；设备预算很紧时要比较卷积骨干。",
    ],
    settings: [
      {
        name: "window size",
        start: "先用预训练 checkpoint 的窗口尺寸，确保输入能正确 padding。",
        adjust:
          "大目标关系不足时比较更大窗口或全局方法；显存／延迟超限则缩窗口。",
      },
      {
        name: "模型规模",
        start: "从预训练 Tiny 级别和标准 stage 输出起步。",
        adjust: "特征不足且算力允许再升型号；部署受限则换轻量 CNN。",
      },
      {
        name: "输入分辨率 / patch merging",
        start: "选能保留最小目标并兼容各 stage 的分辨率。",
        adjust: "小目标漏检升分辨率或接 FPN；padding 过多就改裁剪与尺寸规划。",
      },
    ],
    whenToUse: [
      "检测、实例/语义分割等需要多尺度 feature maps 的视觉任务。",
      "高分辨率图像让标准全局 ViT attention 成本过高。",
    ],
    howToUse: [
      "选预训练 Swin 作为 backbone，接检测或分割 neck/head。",
      "让输入尺寸与 window size、patch merging 层级兼容，并记录实际内存。",
      "打印每个 stage 的 feature shape，确认接入检测／分割 head 的 stride 正确。",
      "推理测试非整窗口倍数输入，核查 padding 区域不会进入有效预测。",
    ],
    tuning: [
      "window size 改变局部视野与成本；大目标依赖跨层信息传播。",
      "Tiny/Small/Base 选择要以目标设备 latency 与精度为准。",
      "小目标差但大目标好时先检查 stage stride 与多尺度 head，不直接放大窗口。",
      "高分辨率 latency 异常时拆分统计窗口划分、attention 和 decoder 成本。",
    ],
    modifications: [
      "可使用更高分辨率变体或和 U-Net 风格 decoder 结合。",
      "局部与全局关系不足时比较 ViT、分层卷积骨干。",
    ],
    pitfalls: [
      "把 shifted windows 误解为每层都有全局 attention。",
      "不同输入大小下 padding 和 window partition 处理不当会出错。",
    ],
    example:
      "卫星图像中既需识别小建筑又需理解街区，Swin 逐级形成多尺度特征供 segmentation head 使用。",
    compareTo: ["vit", "convnext", "deeplabv3-plus"],
  },
  {
    id: "bidirectional-rnn",
    source: {
      label: "Schuster & Paliwal, Bidirectional RNNs (1997)",
      url: "https://doi.org/10.1109/78.650093",
    },
    title: "双向 RNN：前后文一起看",
    englishTitle: "Bidirectional RNN / BiLSTM",
    category: "sequence",
    level: "进阶",
    duration: "7 分钟",
    icon: "⇄",
    summary: "一条循环链从左到右，另一条从右到左，结合当前位置两侧的信息。",
    intuition:
      "读一句话里的“银行”时，前面的“河边”和后面的“堤岸”都能帮助判断意思；双向网络让表示同时参考过去与未来。",
    core: "前向和后向 RNN/LSTM/GRU 各计算一组隐藏状态，再在每个时间步拼接或融合。适合已经拿到完整输入的任务；实时预测未来信息不可见时不能直接用后向链。",
    equation: "h⃗ₜ = RNN→(xₜ, h⃗ₜ₋₁), h⃖ₜ = RNN←(xₜ, h⃖ₜ₊₁); hₜ = [h⃗ₜ; h⃖ₜ]",
    mechanicsSteps: [
      "同一完整序列送入前向与后向两套独立 RNN／LSTM／GRU，分别在时间两端开始递推。",
      "位置 t 的前向状态包含左侧历史，后向状态包含右侧未来；拼接后得到该 token 的上下文表示。",
      "token 级任务对每个拼接状态分类；句级任务聚合有效位置或使用终态。",
      "训练时损失对两条方向链反向传播；推理前必须拿到完整序列，不能在线使用未到达的未来样本。",
    ],
    limits: [
      "流式预测的未来输入不可见，双向链会造成信息泄漏；在线场景用单向 RNN／因果 TCN。",
      "长序列仍需逐步递推且可能难捕捉远距依赖，吞吐受限时比较 Transformer encoder。",
    ],
    settings: [
      {
        name: "hidden size / 双向输出维",
        start: "从单向基线的隐藏维起步，明确拼接后输出通常为两倍。",
        adjust: "过拟合或延迟大则缩维；欠拟合且数据充足再扩维。",
      },
      {
        name: "序列长度与 padding",
        start: "按任务真实长度分布设截断，并使用 mask 或 packed sequence。",
        adjust: "尾部关键信息常被截断就分块或加长；padding 占比高就长度分桶。",
      },
      {
        name: "层数与 dropout",
        start: "先用浅层模型并在堆叠层间加可控 dropout。",
        adjust: "训练高验证低则增强正则；两者都低则检查标签与上下文长度。",
      },
    ],
    whenToUse: [
      "离线文本标注、语音片段分类或完整时间序列分析。",
      "序列长度适中，想比单向 RNN 多利用右侧上下文。",
    ],
    howToUse: [
      "输入序列设 padding mask 或 packed sequence，避免填充值污染状态。",
      "按 token 或整句任务接分类 head；先与单向 LSTM/GRU 比较。",
      "先明确预测发生时整段序列是否已经到齐，并划掉未来不可见的任务。",
      "检查 batch 排序、序列长度恢复与 mask，确保最终分类只聚合真实 token。",
    ],
    tuning: [
      "hidden size 与层数决定容量和延迟；双向通常让输出维度翻倍。",
      "长序列检查梯度、截断和批内长度差异。",
      "离线指标很高而在线下降时排查后向链使用了未来信息。",
      "长序列训练慢时先做长度分桶，再比较 TCN／Transformer 的吞吐。",
    ],
    modifications: [
      "可换双向 GRU/LSTM，或叠加 attention 汇聚关键信息。",
      "需要并行处理长序列时比较 TCN 或 Transformer encoder。",
    ],
    pitfalls: [
      "在线预测使用了尚未发生的未来信息，是数据泄漏。",
      "忽略序列 mask 会把 padding 当作真实 token。",
    ],
    example: "给整句文本做命名实体识别：当前词的标签由左、右上下文共同决定。",
    compareTo: ["rnn", "lstm-gru", "tcn", "bert"],
  },
  {
    id: "seq2seq",
    source: {
      label: "Sutskever et al., Sequence to Sequence Learning (2014)",
      url: "https://arxiv.org/abs/1409.3215",
    },
    title: "Seq2Seq：把一个序列变成另一个",
    englishTitle: "Sequence-to-Sequence",
    category: "sequence",
    level: "进阶",
    duration: "8 分钟",
    icon: "⇢",
    summary: "Encoder 表示输入，decoder 逐步生成可变长度输出。",
    intuition:
      "先听完整句话形成上下文，再一个词一个词翻译。输出不需要与输入一样长。",
    core: "经典 seq2seq 使用 RNN/LSTM encoder 压缩输入，autoregressive decoder 根据上下文和前面生成的 token 预测下一个 token。早期固定长度向量是长句瓶颈，attention 让 decoder 每步读取不同输入位置；Transformer 保留了 encoder-decoder 思想并替换循环计算。",
    equation: "p(y₁:ₜ|x) = ∏ₜ p(yₜ | y₍<ₜ₎, Enc(x))",
    mechanicsSteps: [
      "encoder 按输入顺序更新隐藏状态，把源序列压缩为上下文；带 attention 的版本保留所有位置表示。",
      "decoder 从起始 token 开始，结合前一 token、自己的状态和源端上下文计算下一个 token 分布。",
      "训练时 teacher forcing 输入真实前一 token，对目标序列逐位置算交叉熵并忽略 padding。",
      "推理时将已生成 token 反馈到 decoder，按 greedy／beam 等策略继续，遇结束 token 或长度上限停止。",
    ],
    limits: [
      "纯固定向量 encoder 对长输入有信息瓶颈；长句翻译应加 attention 或用 Transformer encoder-decoder。",
      "逐 token 解码难并行，严格低延迟且输出形式简单时可考虑分类或非自回归方法。",
    ],
    settings: [
      {
        name: "输入／输出最大长度",
        start: "按训练集长度分布设上限并统计截断率。",
        adjust: "长句错误集中时提高上限或分块；大量 padding 时长度分桶。",
      },
      {
        name: "teacher forcing 与推理反馈",
        start: "训练先用标准 teacher forcing，验证完整序列生成。",
        adjust: "token loss 好但自由生成重复时分析 exposure bias 与解码策略。",
      },
      {
        name: "beam width / 长度惩罚",
        start: "先用 greedy 建基线，再在验证集逐步比较 beam。",
        adjust: "译文过短时调长度惩罚；质量不变却延迟高时减 beam。",
      },
    ],
    whenToUse: [
      "翻译、摘要、语音转写等输入输出均为序列且长度可变。",
      "需要理解 encoder-decoder 与 autoregressive generation 的基础结构。",
    ],
    howToUse: [
      "准备输入/输出 tokenizer 与起止 token；训练时常用 teacher forcing。",
      "推理逐步解码，用 greedy 或 beam search，并设置最大长度。",
      "与 Transformer encoder-decoder baseline 比较质量和延迟。",
      "核对源端与目标端 tokenization、起止符、padding mask；右移的是送入 decoder 的目标前缀，监督标签保持原目标顺序。",
      "用完整输出的任务指标与错误案例验证，而不只看 teacher-forced loss。",
    ],
    tuning: [
      "最大序列长度、beam width 和长度惩罚会影响速度与生成结果。",
      "检查训练时 teacher forcing 与推理时自身输出反馈造成的差异。",
      "输出一开始就结束时检查 EOS 学习与长度惩罚；持续重复时检查解码反馈和训练标签位移。",
      "长输入质量下降时先加 attention 或换 Transformer，再考虑单纯扩大隐藏维度。",
    ],
    modifications: [
      "添加 attention 缓解固定上下文瓶颈。",
      "可把 RNN 换 Transformer；对少数据任务优先微调预训练 T5。",
    ],
    pitfalls: [
      "只看训练 token loss，忽略完整句级质量与幻觉。",
      "decoder 训练时看到了目标未来 token，会造成因果 mask 错误。",
    ],
    example:
      "输入英文句子，encoder 编码后 decoder 逐词输出中文翻译，直到结束 token。",
    compareTo: ["rnn", "attention", "encoder-decoder", "t5"],
  },
  {
    id: "tcn",
    source: {
      label: "Bai et al., Temporal Convolutional Networks (2018)",
      url: "https://arxiv.org/abs/1803.01271",
    },
    title: "TCN：用因果卷积读时间",
    englishTitle: "Temporal Convolutional Network",
    category: "sequence",
    level: "进阶",
    duration: "7 分钟",
    icon: "▱",
    summary: "Causal + dilated convolutions 在不偷看未来的前提下扩大时间视野。",
    intuition:
      "小卷积看最近几步；扩大采样间距后，少数层也能看很久以前的输入。各时间位置可并行计算。",
    core: "TCN 用 causal convolution 保证 t 时刻输出只依赖 ≤t 的输入，再以 dilation 扩大 receptive field，常配 residual blocks。它不维护 RNN 那样逐步更新的隐状态，但有限感受野必须覆盖任务所需历史。",
    equation: "yₜ = Σⱼ wⱼ x₍ₜ₋d·j₎; stride 1 时 R = 1 + (K−1)Σₗ mₗdₗ",
    mechanicsSteps: [
      "每层只取当前位置及之前的位置做 causal convolution；通过左侧 padding 保证不接触未来。",
      "dilated convolution 隔 d 个时间步取样，常逐层增加 dilation，使有效历史窗口快速增长。",
      "残差块把输入与卷积输出相加或投影后相加，以便训练更深的时间卷积堆栈。",
      "最后取预测时刻的表示接回归／分类 head；整段训练可并行，线上每次仅输入当时可见历史。",
    ],
    limits: [
      "感受野是固定且有限的，依赖更早事件的任务若超出窗口将无法被模型利用。",
      "非规则采样或时间间隔本身很重要时，需显式加入时间差特征或改用适配不规则时间的方法。",
    ],
    settings: [
      {
        name: "kernel / dilation / 层数",
        start: "先根据最大必要历史计算理论感受野，再选能覆盖它的组合。",
        adjust:
          "周期性长依赖漏掉就增 dilation 或层数；计算超限就缩通道而保留必需视野。",
      },
      {
        name: "输入窗口",
        start: "按上线时真实可得到的历史长度建窗口，并遵守时间顺序。",
        adjust: "短窗口丢掉周期信号就延长；只增窗口但感受野不变则无效。",
      },
      {
        name: "通道数 / dropout",
        start: "从小通道残差 TCN 开始。",
        adjust: "训练误差高才增容量；训练好验证差则增强正则与跨时期验证。",
      },
    ],
    whenToUse: [
      "时间序列预测、传感器信号、音频等有固定历史窗口的任务。",
      "希望并行训练且要求严格因果性。",
    ],
    howToUse: [
      "先确定预测时可见的历史长度，再设计 kernel、层数、dilation 覆盖它。",
      "保留时间顺序划分验证集，检查因果 padding 和标签对齐。",
      "用人为修改未来值的测试确认 t 时刻输出完全不变，验证因果性。",
      "把特征归一化统计只拟合训练时期，评估采用滚动或未来时间段切分。",
    ],
    tuning: [
      "dilation schedule 决定感受野，先算清楚再调通道数。",
      "长历史与实时延迟间需要平衡；batch size 受序列长度影响。",
      "远期预测差时先算感受野，确认长周期信号落在窗口内。",
      "线上性能比离线差时核查归一化、时间戳对齐与因果 padding。",
    ],
    modifications: [
      "可混合 attention 获得更灵活的远程依赖。",
      "加残差和归一化便于训练更深的卷积堆栈。",
    ],
    pitfalls: [
      "使用普通双侧 padding 会看到未来，导致离线指标虚高。",
      "感受野短于关键历史时，盲目增加宽度也无法补足。",
    ],
    example:
      "预测下一小时用电量：只用过去几天读数，TCN 通过扩张卷积聚合近远期趋势。",
    compareTo: [
      "rnn",
      "bidirectional-rnn",
      "transformer",
      "time-series-forecasting",
    ],
  },
  {
    id: "word2vec",
    source: {
      label: "Mikolov et al., Word Representations (2013)",
      url: "https://arxiv.org/abs/1301.3781",
    },
    title: "word2vec：词义来自邻居",
    englishTitle: "word2vec / Static Embeddings",
    category: "sequence",
    level: "入门",
    duration: "7 分钟",
    icon: "⋯",
    summary: "通过预测词与上下文，把离散词学成稠密向量。",
    intuition:
      "经常出现在相似上下文的词，向量也会靠近；相比 one-hot，模型有了可共享的语义坐标。",
    core: "CBOW 用上下文预测中心词，Skip-gram 用中心词预测上下文。训练得到每个词的固定向量；它不随具体句子改变，所以一词多义需要上下文模型如 BERT 处理。",
    equation: "Skip-gram: maximize Σ₍w,c₎ log p(c | w)",
    mechanicsSteps: [
      "从语料抽取中心词与窗口内上下文词，构造 CBOW 或 Skip-gram 训练对。",
      "Skip-gram 从中心词向量预测邻词；负采样版本同时拉高真实词对得分、压低采样负例得分。",
      "反向传播更新词表向量；同一个词无论出现在哪句都使用同一个静态 embedding。",
      "下游将向量作为词级输入，可固定或继续微调，并与随机初始化、上下文 embedding 对照。",
    ],
    limits: [
      "一个词仅有一组静态向量，无法区分英文 bank 的金融机构与河岸两种词义；歧义任务可比较 BERT 类上下文表示。",
      "OOV、错别字和领域新词受词表限制；可用 subword 变体或重新训练词表。",
    ],
    settings: [
      {
        name: "context window",
        start: "从能覆盖典型局部搭配的窗口开始，保持评估任务一致。",
        adjust:
          "仅学到局部搭配而缺少主题相关性可适度放大；噪声邻居太多则缩小。",
      },
      {
        name: "向量维度",
        start: "小语料先用较低维并检查相似词质量。",
        adjust: "下游欠拟合且语料足够才升维；过拟合或存储成本高则降维。",
      },
      {
        name: "负采样 / 低频词",
        start: "使用成熟实现默认负采样与频率过滤规则，并统计词表覆盖。",
        adjust: "长尾词质量差时调整过滤或用子词；训练成本太高时减少负例。",
      },
    ],
    whenToUse: [
      "学习 embedding 基础、构建轻量词汇特征 baseline。",
      "数据/算力有限且任务对上下文歧义不敏感。",
    ],
    howToUse: [
      "分词与词表先固定，训练或加载向量，再作为下游模型 embedding 初始化。",
      "检查 OOV 和领域词汇覆盖，和随机 embedding、上下文 embedding 对比。",
      "先统计 OOV 率和领域词覆盖，不要仅凭几个最近邻展示判断可用性。",
      "冻结与微调两种下游用法都在同一验证集评估，并检查语义歧义案例。",
    ],
    tuning: [
      "window size 控制局部语境范围；embedding dimension 平衡容量和数据量。",
      "低频词过滤阈值、负采样规模影响训练和长尾词表示。",
      "高频虚词占邻居时检查 subsampling 和停用词对目标任务的作用。",
      "近邻看似合理但分类效果差时检查是否需要句级监督或上下文模型。",
    ],
    modifications: [
      "subword 表示可处理未见词；语境敏感任务用 BERT 类模型。",
      "句子检索通常需要专门训练的 sentence embedding，而非简单平均词向量。",
    ],
    pitfalls: [
      "向量相近不代表模型理解了句子或事实。",
      "同一词在不同上下文中仍共享一个静态向量。",
    ],
    example:
      "用领域语料训练词向量，观察“肿瘤”和“癌症”是否接近，再用于小型分类模型。",
    compareTo: ["bert", "roberta", "contrastive-learning", "tokenization"],
  },
  {
    id: "bert",
    source: {
      label: "Devlin et al., BERT (2018)",
      url: "https://arxiv.org/abs/1810.04805",
    },
    title: "BERT：遮住词，读懂整句",
    englishTitle: "BERT",
    category: "sequence",
    level: "进阶",
    duration: "10 分钟",
    icon: "▣",
    summary:
      "双向 Transformer encoder 通过 masked language modeling 学上下文表示。",
    intuition:
      "句子里一个词被盖住后，模型同时看左边和右边猜它；因此同一个词在不同句子里可以有不同表示。",
    core: "BERT 是 encoder-only Transformer。预训练包含 masked language modeling（原版还含 next sentence prediction），微调时在 [CLS] 或 token 表示上接分类/标注 head。双向可见性适合理解任务，却不能像 GPT 一样直接用标准训练方式逐词生成长文本。",
    equation: "p(x_mask | x_visible);  h₁:ₙ = TransformerEncoder(x₁:ₙ)",
    mechanicsSteps: [
      "tokenizer 把文本转成子词 token，加特殊标记、位置和 segment 信息；attention mask 屏蔽 padding。",
      "预训练随机遮住部分位置；双向 Transformer encoder 同时读左右可见 token，预测被遮住的原 token；原版另有 NSP。",
      "微调时整句分类使用 [CLS] 表示，序列标注使用各 token 表示，抽取问答预测答案起止位置。",
      "推理完整输入一次得到上下文表示；被截断的文本部分不会参与预测，因此需记录截断比例。",
    ],
    limits: [
      "双向 MLM 不直接提供严格的左到右生成概率；长文本生成优先 GPT／T5。",
      "固定最大位置长度外的文档需分块、长上下文模型或检索，否则关键证据可能被截掉。",
    ],
    settings: [
      {
        name: "max length / truncation",
        start: "按任务文本长度分布设置并记录截断率、证据位置。",
        adjust:
          "关键答案落在尾部时改滑窗／分块聚合；padding 过多时按长度分桶。",
      },
      {
        name: "微调学习率",
        start:
          "从 checkpoint 官方任务 recipe 的低学习率范围搜，head 与 backbone 可分组。",
        adjust:
          "loss 震荡就降 backbone 学习率；稳定欠拟合再增加训练步数或逐层解冻。",
      },
      {
        name: "任务指标 / 阈值",
        start: "分类先看 macro F1 与各类召回，多标签任务在验证集选每类阈值。",
        adjust: "少数类漏检时改采样、损失权重或阈值；误检多时反向检查校准。",
      },
    ],
    whenToUse: [
      "文本分类、序列标注、抽取式问答等需要利用完整上下文的任务。",
      "有适合语言与领域的预训练 checkpoint，标注量有限。",
    ],
    howToUse: [
      "选择对应 tokenizer 与预训练权重，设置最大长度、截断和 attention mask。",
      "分类接 [CLS] head；实体识别接 token-level head；保留独立验证集。",
      "长文可分块并设计聚合，不能假设默认上下文长度足够。",
      "对 token-level 任务把 subword 预测准确映射回原词或字符偏移。",
      "保存 tokenizer、特殊 token、类别映射与 max length，部署复用同一预处理。",
    ],
    tuning: [
      "微调学习率通常需低于随机初始化 head；先扫 learning rate、epochs、batch。",
      "对不平衡标签记录 macro F1 与各类召回。",
      "单类 F1 很低时先看标签不平衡和 token 对齐，不把问题全归于 backbone。",
      "长文本指标差时统计截断后的证据缺失率，必要时改分块方法。",
    ],
    modifications: [
      "RoBERTa 调整预训练配方；领域语料可继续预训练。",
      "需要生成长文本时比较 GPT 或 T5。",
    ],
    pitfalls: [
      "把 masked LM 理解成通常意义的左到右文本生成。",
      "词表、大小写和预处理与 checkpoint 不匹配会严重损害效果。",
    ],
    example:
      "医学记录分类：输入完整句子，让 BERT 同时读前后文，再预测诊断类别。",
    compareTo: ["roberta", "gpt-language-model", "t5", "encoder-models"],
  },
  {
    id: "roberta",
    source: {
      label: "Liu et al., RoBERTa (2019)",
      url: "https://arxiv.org/abs/1907.11692",
    },
    title: "RoBERTa：先把 BERT 训练充分",
    englishTitle: "RoBERTa",
    category: "sequence",
    level: "进阶",
    duration: "7 分钟",
    icon: "▤",
    summary: "保留 BERT 式双向 encoder，改变数据、批量和掩码等预训练配方。",
    intuition:
      "对比两个模型时，先把同一类型模型真正训练到位。RoBERTa 的信息是：训练方法和资源也会左右架构结论。",
    core: "RoBERTa 延长训练、增加数据和 batch，采用动态 masking，并去掉原 BERT 的 next sentence prediction 目标；仍是 masked-LM encoder。实际性能需根据 checkpoint、语言和任务验证。",
    equation: "L_MLM = −Σ₍i∈mask₎ log p(xᵢ | x_visible)",
    mechanicsSteps: [
      "将文本按 RoBERTa 对应 tokenizer 编码，使用双向 Transformer encoder。",
      "预训练用动态 masked language modeling：不同轮次可遮不同位置，原配方不使用 BERT 的 NSP。",
      "将预训练表示接分类或 token head，按真实任务有监督微调。",
      "推理复用相同 tokenizer 与特殊 token 处理，输出分类／标注而非直接逐词续写。",
    ],
    limits: [
      "RoBERTa 强项仍是双向理解；需要自由长文本生成时优先生成式 LM 或 encoder-decoder。",
      "预训练语料、语言和词表不适配目标领域时，换名字本身不能保证比 BERT 好。",
    ],
    settings: [
      {
        name: "checkpoint 语言与领域",
        start: "选覆盖目标语言／术语的权重，先测 OOV 和 token 化长度。",
        adjust: "专有词切分碎且效果低时比较领域继续预训练或领域权重。",
      },
      {
        name: "max length",
        start: "按数据分布设置截断长度并保留同等 BERT 对照条件。",
        adjust: "长文证据丢失则滑窗；padding 浪费显著则分桶。",
      },
      {
        name: "微调学习率 / epoch",
        start: "沿用权重发布方推荐 recipe 作为验证搜索起点。",
        adjust: "验证波动大时降低学习率并多 seed；过拟合则早停或增强正则。",
      },
    ],
    whenToUse: [
      "BERT 类理解任务需要一个强的通用 encoder baseline。",
      "研究预训练 recipe 对下游任务的影响。",
    ],
    howToUse: [
      "加载对应 RoBERTa tokenizer、special tokens 与 checkpoint。",
      "按任务加分类或 token head，用相同 split 对比 BERT。",
      "确保 Byte-level BPE 的空格、特殊符号与 token 对齐处理符合任务。",
      "在相同 split、输入长度与训练预算下对照 BERT，记录不同 seed 方差。",
    ],
    tuning: [
      "先调微调 learning rate、训练轮数和最大长度。",
      "继续预训练时控制语料质量与计算预算，并单独评估领域迁移。",
      "RoBERTa 比 BERT 差时先排查 tokenizer、语言和长度条件是否相同。",
      "句子检索不佳时训练专门的对比式 embedding，而非只换池化层。",
    ],
    modifications: [
      "领域继续预训练，或压缩成更小 student 以满足延迟限制。",
      "句子检索需对比学习等专门训练，不能只取未经适配的句向量。",
    ],
    pitfalls: [
      "把 RoBERTa 当作完全不同的 attention 架构。",
      "跨语言、不同预训练语料的 checkpoint 直接比较会混淆结论。",
    ],
    example:
      "新闻情感分类：以相同训练和验证数据微调 BERT 与 RoBERTa，比较 macro F1 和推理成本。",
    compareTo: ["bert", "gpt-language-model", "t5"],
  },
  {
    id: "gpt-language-model",
    source: {
      label: "Radford et al., Generative Pre-Training (2018)",
      url: "https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf",
    },
    title: "GPT 式 LM：预测下一个 token",
    englishTitle: "Autoregressive Language Model (GPT)",
    category: "sequence",
    level: "进阶",
    duration: "10 分钟",
    icon: "➜",
    summary:
      "Decoder-only Transformer 用 causal mask 左到右预测，能连续生成文本。",
    intuition:
      "它读到前面的文字，猜下一个 token；把新 token 加回输入，再猜下一个，于是可以写出长段内容。",
    core: "Autoregressive LM 分解联合概率，每个位置只看前文。GPT 类用带 causal self-attention 的 Transformer decoder 预训练，再可做 instruction tuning 或其他任务适配。与 BERT 的双向填空目标不同，其原生接口就是 continuation/generation。",
    equation: "p(x₁:ₙ) = ∏ₜ p(xₜ | x₍<ₜ₎)",
    mechanicsSteps: [
      "tokenizer 把上下文变为 token 序列，decoder 各层的 causal mask 使位置 t 只能注意 ≤t 的 token。",
      "逐位置预测下一个 token：输入 [A,B,C] 对应标签 [B,C,EOS]，只对有效目标求交叉熵。若框架在 loss 内位移 logits/labels，不再手动重复位移。",
      "推理从 prompt 计算下一个 token 概率，按 greedy 或采样策略选 token，再不断追加直到 stop／长度上限。",
      "KV cache 保存已处理 token 的 key/value，减少重复计算，但上下文与并发仍消耗显存。",
    ],
    limits: [
      "生成概率衡量语言续写，不保证事实、推理或来源正确；高风险回答需检索与核查。",
      "上下文窗口有限，过长输入会截掉信息；长文问答需分块、检索或长上下文方法。",
    ],
    settings: [
      {
        name: "temperature / top-p",
        start: "可验证答案或代码先从确定性解码基线开始；创意任务再增加采样。",
        adjust:
          "输出重复可比较小幅采样或 repetition 控制；事实错误多则降随机性并加证据。",
      },
      {
        name: "max new tokens / stop",
        start: "按目标输出长度设上限和明确停止串，记录被截断比例。",
        adjust: "答案常被截断就升上限；拖沓或成本高则收紧长度与提示格式。",
      },
      {
        name: "context / batch / KV cache",
        start: "按实际部署并发和上下文长度测吞吐与峰值显存。",
        adjust:
          "OOM 时缩并发／上下文或用量化；长文信息漏掉时改检索／摘要流程。",
      },
    ],
    whenToUse: [
      "文本生成、对话、代码补全或统一为生成的任务。",
      "希望利用已有预训练模型做 prompting 或少量数据适配。",
    ],
    howToUse: [
      "先选与语言、许可、上下文长度及算力匹配的 checkpoint。",
      "推理明确 prompt、停止条件、最大输出长度；在验证集测准确性和延迟。",
      "若需微调，先比较 prompting、LoRA 与全参数方案。",
      "设计不含测试答案的 prompt 模板，训练时验证 causal label shift 与 padding mask。",
      "分开评估事实准确率、格式通过率、延迟和成本；必要时加入检索证据。",
    ],
    tuning: [
      "temperature 调随机性，top-p 限定采样候选；事实/代码任务可从低随机性开始。",
      "上下文长度、batching 和 KV cache 影响吞吐与显存；训练需检查 causal mask。",
      "输出流畅却错误时优先改证据供给和评估，不只微调 temperature。",
      "训练 loss 不降或答案复制错位时检查 token 右移、EOS 与 padding 屏蔽。",
    ],
    modifications: [
      "用 retrieval 提供外部资料；用专门的 instruction 数据适配响应格式。",
      "奖励模型与偏好优化处理回答偏好，但不能替代事实核查。",
    ],
    pitfalls: [
      "流畅生成不意味着事实正确。",
      "将测试答案放进 prompt 或训练语料而未识别泄漏。",
    ],
    example:
      "代码注释补全：给定函数前文，让模型逐 token 生成注释，并用人工与自动检查结果。",
    compareTo: [
      "bert",
      "t5",
      "decoder-models",
      "reward-model",
      "autoregressive-inference",
    ],
  },
  {
    id: "t5",
    source: {
      label: "Raffel et al., T5 (JMLR, 2020)",
      url: "https://www.jmlr.org/papers/v21/20-074.html",
    },
    title: "T5：所有语言任务都写成文本到文本",
    englishTitle: "Text-to-Text Transfer Transformer (T5)",
    category: "sequence",
    level: "进阶",
    duration: "9 分钟",
    icon: "⇥",
    summary: "Encoder 读完整输入，decoder 输出文本；统一翻译、摘要与问答接口。",
    intuition:
      "不用为每个任务设计不同输出头：输入写“summarize: …”，输出就是摘要文本；任务提示告诉模型要做什么。",
    core: "T5 使用 encoder-decoder Transformer，预训练通过 span corruption 把被遮住的连续片段作为生成目标。微调时把任务转成 text-to-text。相较 BERT 更自然地生成文本；相较 GPT，encoder 可双向读取完整输入。",
    equation: "p(y | x) = ∏ₜ p(yₜ | y₍<ₜ₎, Encoder(x))",
    mechanicsSteps: [
      "把任务写成文本输入，tokenizer 编码后由双向 encoder 读取全部可见输入。",
      "预训练时连续文本片段被 sentinel token 替换，decoder 自回归生成缺失片段序列。",
      "下游训练将目标文本右移供 decoder 输入，cross-attention 读取 encoder 表示并计算目标 token loss。",
      "推理从起始 token 逐步生成输出，可用 greedy／beam，并在 EOS 或长度上限停止。",
    ],
    limits: [
      "文本到文本接口使纯分类也需要生成 token，严格低延迟任务可比较 BERT 类分类 head。",
      "输入截断和输出长度上限会影响摘要／翻译，长文任务需额外分块或长上下文模型。",
    ],
    settings: [
      {
        name: "任务前缀 / 格式",
        start: "沿用 checkpoint 的任务格式，固定训练与推理 prompt。",
        adjust: "输出跑题或混任务时检查前缀一致性与混合数据比例。",
      },
      {
        name: "input / target length",
        start: "分别统计原文和目标长度，设两个独立上限。",
        adjust:
          "关键源信息被截时分块或加长输入；输出常不完整时加长 target 和生成上限。",
      },
      {
        name: "beam / length penalty",
        start: "先用 greedy 建速度基线，再在验证集比较 beam 与长度惩罚。",
        adjust: "输出过短调长度惩罚；质量无增却变慢则减 beam。",
      },
    ],
    whenToUse: [
      "翻译、摘要、问答或多个任务共用统一输入输出形式。",
      "既要看完整输入又要生成可变长度结果。",
    ],
    howToUse: [
      "使用所选 checkpoint 对应 tokenizer 与任务前缀。",
      "分别设 input/output 最大长度，训练时用目标文本监督，推理时设置解码策略。",
      "校验 target shift、decoder padding mask 与 EOS，避免模型学到错误结束位置。",
      "用任务层指标和人工事实核查共同评估生成，不仅看训练 token loss。",
    ],
    tuning: [
      "beam size、length penalty 和最大生成长度影响生成质量与速度。",
      "任务前缀、微调学习率与领域数据质量需要验证。",
      "摘要遗漏事实时检查输入截断，再改长度与训练语料；只增 beam 不会找回未见内容。",
      "多任务间性能冲突时调整采样比例并逐任务记录指标。",
    ],
    modifications: [
      "多任务混合训练需控制各任务采样比例。",
      "资源不足可比较较小 T5 或参数高效微调。",
    ],
    pitfalls: [
      "只靠 token loss 评估摘要，忽略事实遗漏与幻觉。",
      "把 T5 与 BERT 仅按参数量比较，忽略生成与理解目标不同。",
    ],
    example:
      "同一 T5 模型输入“translate English to Chinese: …”输出译文；输入“summarize: …”输出摘要。",
    compareTo: ["seq2seq", "bert", "gpt-language-model", "encoder-decoder"],
  },
  {
    id: "mobilenet-v2",
    source: {
      label: "Sandler et al., MobileNetV2 (2018)",
      url: "https://arxiv.org/abs/1801.04381",
    },
    title: "MobileNetV2：为设备预算设计卷积",
    englishTitle: "MobileNetV2",
    category: "vision",
    level: "进阶",
    duration: "7 分钟",
    icon: "▢",
    summary:
      "Inverted residual 与 depthwise convolution 降低移动端模型的计算负担。",
    intuition:
      "先把窄特征展开到较宽空间做轻量局部处理，再投回窄空间；跳接连的是两端的窄表示。",
    core: "MobileNetV2 block 用 1×1 expansion、depthwise 3×3、线性 1×1 projection；stride=1 且形状匹配时可加 residual。线性 bottleneck 避免在压缩空间再用 ReLU 丢失信息。",
    equation: "y = x + PW_linear(DWConv(PW_expand(x)))  （形状匹配时）",
    mechanicsSteps: [
      "1×1 expansion 先把窄输入投影到更宽通道，为后续变换提供表达空间。",
      "depthwise 3×3 卷积逐通道处理空间信息，相比普通卷积减少跨通道乘法。",
      "线性 1×1 projection 把特征压回窄 bottleneck；在 stride=1 且形状相同时加入 residual。",
      "多个倒残差 block 逐级下采样，最终接全局汇聚和分类 head；部署时测真实设备算子延迟。",
    ],
    limits: [
      "轻量 backbone 可能损失精细小目标信息，密集预测需检查输出 stride 与 decoder。",
      "depthwise 的理论计算量小，但硬件支持不佳时实际延迟可能不如预期。",
    ],
    settings: [
      {
        name: "width multiplier",
        start: "从可用预训练型号中选满足设备预算的宽度，不随意改权重结构。",
        adjust: "精度不足且有余量就升宽；超预算则降宽或量化。",
      },
      {
        name: "输入分辨率",
        start: "采用 checkpoint 对应预处理并测端侧响应时间。",
        adjust: "小物体漏检升分辨率；延迟超限且精度允许则降低。",
      },
      {
        name: "量化与 normalization",
        start: "先建立 FP32／FP16 基线，再做目标硬件支持的量化评估。",
        adjust:
          "量化后精度掉太多则做校准或量化感知训练；微调 batch 很小时注意 BN 统计。",
      },
    ],
    whenToUse: [
      "手机、边缘设备或在线服务有明确延迟与内存预算。",
      "需要轻量分类 backbone 或分割、检测的特征提取器。",
    ],
    howToUse: [
      "以预训练权重作为起点，换任务 head。",
      "在实际设备上测端到端延迟、峰值内存与精度。",
      "确认每个 residual 只发生在形状匹配的 block，并核查 projection 后没有额外非线性。",
      "把预处理、模型与后处理都纳入端到端测速，使用目标设备实际 batch。",
    ],
    tuning: [
      "width multiplier、输入分辨率和量化设置共同影响成本。",
      "微调时先控制学习率与 normalization，再决定是否解冻全部层。",
      "FLOPs 下降但延迟不降时检查 depthwise 算子、线程数和数据搬运。",
      "量化后某些类别退化时按类别检查校准样本覆盖与激活分布。",
    ],
    modifications: [
      "用作 DeepLabv3+ encoder；需要更小模型可测试量化。",
      "与 EfficientNet、ConvNeXt-Tiny 做相同硬件对照。",
    ],
    pitfalls: [
      "仅凭参数量推断部署速度，忽略具体硬件算子支持。",
      "在投影层误加非线性，改变原本的 linear bottleneck 设计。",
    ],
    example:
      "手机照片分类：测 MobileNetV2 的 95 分位响应时间，选满足体验要求的输入尺寸。",
    compareTo: ["efficientnet", "resnet", "convnext"],
  },
  {
    id: "mask-rcnn",
    source: {
      label: "He et al., Mask R-CNN (2017)",
      url: "https://arxiv.org/abs/1703.06870",
    },
    title: "Mask R-CNN：为每个物体单独画 mask",
    englishTitle: "Mask R-CNN",
    category: "vision",
    level: "进阶",
    duration: "9 分钟",
    icon: "▰",
    summary: "两阶段检测框架增加并行 mask head，输出 instance segmentation。",
    intuition:
      "语义分割只说“这些像素是人”；实例分割还要区分“这是第一个人，那是第二个人”。",
    core: "Region Proposal Network 找候选框，RoIAlign 提取对齐的区域特征，再分别预测类别、边界框和每实例二值 mask。RoIAlign 避免粗量化导致的像素错位。与 U-Net 的整图像素分类目标不同。",
    equation: "L = L_class + L_box + L_mask",
    mechanicsSteps: [
      "backbone／FPN 提取多尺度图像特征，RPN 提议可能含物体的候选区域。",
      "RoIAlign 从特征图对齐抽取每个 proposal 的固定尺寸特征，避免坐标粗量化。",
      "并行 head 分别预测类别、box 修正与该实例的二值 mask；训练时匹配真实框并合并各损失。",
      "推理筛选候选、应用框后处理，再把每实例 mask 投回原图对应 box 区域。",
    ],
    limits: [
      "需要逐实例 mask 标注，标注成本高；只关心类别区域时 U-Net／DeepLab 更直接。",
      "两阶段流程的 proposal、RoI 与 mask head 增加延迟，高吞吐实时场景需实测或比较单阶段方法。",
    ],
    settings: [
      {
        name: "proposal 数量",
        start: "沿用实现的默认 proposal 配额，先测密集图中目标数分布。",
        adjust:
          "拥挤场景漏实例可增加 proposals；延迟高且空 proposal 多可减少。",
      },
      {
        name: "NMS / score threshold",
        start: "在验证集调阈值并记录 precision-recall 曲线。",
        adjust:
          "相贴物体被压掉时提高 NMS IoU 阈值；重复框过多时降低它或提高 score 阈值。",
      },
      {
        name: "图像尺度 / 小目标",
        start: "保持目标在输入与 FPN 特征中可见，记录小目标 AP。",
        adjust: "小目标漏检升输入分辨率或改 FPN 层；显存超限则降尺度／batch。",
      },
    ],
    whenToUse: [
      "需要计数或分别跟踪多个同类物体。",
      "目标级 mask 比整张图语义分割更有用。",
    ],
    howToUse: [
      "准备每个实例单独的 mask 和 box，明确拥挤区域标注规则。",
      "选预训练 backbone/RPN，训练后按类别评估 AP、mask AP 与小目标 AP。",
      "验证 box 与 mask 的像素坐标、类别 ID 和空图标签一致，抽查重叠物体。",
      "分别报告 box AP、mask AP、各目标尺度 AP 与推理延迟。",
    ],
    tuning: [
      "proposal 数量、置信度与 NMS 阈值影响召回和速度。",
      "图像缩放和 backbone 分辨率影响小目标。",
      "框正确而 mask 边缘差时先检查 mask 分辨率、RoIAlign 与标注质量。",
      "密集实例漏检时分解 RPN recall、NMS 抑制与 mask head 错误。",
    ],
    modifications: [
      "可换轻量 backbone 降延迟，或加特定领域的 mask head。",
      "若只需每类像素区域，先比较 U-Net 的简洁方案。",
    ],
    pitfalls: [
      "把 instance mask 和 semantic mask 混为同一种标签。",
      "只看分类准确率，忽略定位和 mask 边界质量。",
    ],
    example:
      "一张显微图含多个相贴细胞：为每个细胞输出独立 mask，便于计数和形态测量。",
    compareTo: ["unet", "deeplabv3-plus", "detr"],
  },
  {
    id: "detr",
    source: {
      label: "Carion et al., DETR (2020)",
      url: "https://arxiv.org/abs/2005.12872",
    },
    title: "DETR：把目标检测当集合预测",
    englishTitle: "DEtection TRansformer (DETR)",
    category: "vision",
    level: "高级",
    duration: "9 分钟",
    icon: "⌗",
    summary:
      "Object queries 与 Hungarian matching 直接预测一组目标，减少手工后处理。",
    intuition:
      "模型预留固定数量的“座位”，每个座位尝试负责一个物体；匹配规则保证一个真实物体由一个合适座位学习。",
    core: "CNN backbone 与 Transformer encoder-decoder 产生 object query 表示；预测类别和 box，与真实目标做二分图最优匹配，再计算集合损失。空座位预测 no-object 类。原版通常无需 NMS，但训练收敛与小目标表现需要特别关注。",
    equation: "σ* = argmin_σ Σᵢ Cost(ŷ_σ(i), yᵢ);  L_set = Σᵢ L(ŷ_σ*(i), yᵢ)",
    mechanicsSteps: [
      "backbone 提取二维视觉特征，加入位置编码后送入 Transformer encoder 建模上下文。",
      "固定数量的 learned object queries 进入 decoder，对图像特征 cross-attention，输出类别与归一化 box。",
      "训练时用 Hungarian matching 在预测与真值间找一对一最小成本匹配；未匹配 query 学 no-object。",
      "匹配后计算类别、L1 box 和几何重叠相关损失；推理直接筛掉 no-object／低分结果，原版无需 NMS。",
    ],
    limits: [
      "原版 DETR 收敛可能慢，小目标性能受单尺度特征限制；可比较 Deformable DETR 等多尺度变体。",
      "固定 query 数是预测上限，极拥挤场景若目标数超过 query 数会漏检。",
    ],
    settings: [
      {
        name: "object query 数",
        start: "至少覆盖训练与部署中通常的最大实例数并留余量。",
        adjust:
          "拥挤图片达到 query 上限时增加；大量空 query 又耗算力时减少并验证召回。",
      },
      {
        name: "no-object 类权重",
        start: "从论文或实现的默认类别权重出发，观察空 query 与漏检。",
        adjust: "假阳性多可提高空类约束；漏检多则检查权重是否过强。",
      },
      {
        name: "训练计划 / feature scale",
        start: "使用预训练和已验证的收敛 recipe，单独记录小目标 AP。",
        adjust:
          "收敛慢时先查学习率与训练轮数；小目标差则比较多尺度 Deformable DETR。",
      },
    ],
    whenToUse: [
      "研究 end-to-end 目标检测与集合预测。",
      "有预训练实现，并希望减少 anchor/NMS 等人工设计。",
    ],
    howToUse: [
      "准备每图 box、类别及对应尺寸坐标；检查空目标图处理。",
      "从预训练 checkpoint 微调，与同数据的两阶段检测器比较 AP 和延迟。",
      "核对 box 坐标在归一化训练、损失与回原图推理三个阶段的格式。",
      "记录各尺寸目标 AP、空图假阳性、匹配结果与训练曲线，定位结构瓶颈。",
    ],
    tuning: [
      "object query 数要覆盖典型目标数量；no-object 权重影响假阳性。",
      "训练轮数、学习率和多尺度特征对收敛及小目标很关键。",
      "类别正确但框偏移时检查 box 格式和 matching cost 权重。",
      "小目标漏检时优先比较多尺度特征，而不是仅增加 query 数。",
    ],
    modifications: [
      "小目标或收敛速度瓶颈可试多尺度、deformable attention 变体。",
      "需要实例 mask 时加 segmentation head。",
    ],
    pitfalls: [
      "把固定 query 数理解成每图必须有这么多对象。",
      "用原版 DETR 与训练配方完全不同的检测器直接比结论。",
    ],
    example:
      "街景检测车与行人：object queries 各自输出类别与框，匹配损失让预测对齐真实实例。",
    compareTo: ["mask-rcnn", "vit", "swin-transformer"],
  },
  {
    id: "bart",
    source: {
      label: "Lewis et al., BART (ACL, 2020)",
      url: "https://arxiv.org/abs/1910.13461",
    },
    title: "BART：把弄乱的文本复原",
    englishTitle: "BART",
    category: "sequence",
    level: "进阶",
    duration: "8 分钟",
    icon: "↝",
    summary: "给输入施加噪声，再让 encoder-decoder 生成原文，学习文本恢复。",
    intuition:
      "把文章的一些段落盖住、顺序打乱，让模型恢复；它既需理解整个受损输入，也需逐步写出自然文本。",
    core: "BART 是 denoising seq2seq Transformer：双向 encoder 处理受损文本，自回归 decoder 重建原文。可使用文本填空、句子重排等噪声；与 BERT 的单 token 预测不同，输出是完整文本序列。",
    equation: "L = −log p_θ(x_original | noise(x_original))",
    mechanicsSteps: [
      "预训练先对原文加噪声，如遮住连续片段或改变句子顺序，形成受损输入。",
      "双向 encoder 读取受损输入，形成上下文表示；自回归 decoder 用 cross-attention 读取 encoder 特征。",
      "训练时 decoder teacher forcing 逐 token 重建原文，优化条件生成交叉熵。",
      "下游摘要／改写微调用任务输入和目标文本，推理逐 token 生成并按 EOS／长度上限停止。",
    ],
    limits: [
      "去噪预训练不保证生成摘要忠实于原文，关键事实和数字仍需专门评估。",
      "长文超出输入窗口会被截断；重要证据在尾部时需要分块或其他长文方案。",
    ],
    settings: [
      {
        name: "输入截断",
        start: "统计原文 token 长度与关键信息位置，再设 max input length。",
        adjust: "遗漏末段信息时改分块或长文模型；padding 高则按长度分桶。",
      },
      {
        name: "输出长度 / beam",
        start:
          "按目标摘要长度分布设置 min／max generation，再比较 greedy 与 beam。",
        adjust:
          "过短时调最短长度／长度惩罚；重复或拖沓时收紧输出并检查训练目标。",
      },
      {
        name: "微调学习率",
        start: "沿用对应 BART checkpoint 的官方任务 recipe 作为搜索起点。",
        adjust:
          "生成质量退化或 loss 波动大时降低 backbone 学习率；欠拟合则检查任务样本与训练步数。",
      },
    ],
    whenToUse: [
      "摘要、改写、生成式问答等需要读完整输入再生成输出。",
      "想比较 T5 与 BART 的 seq2seq 预训练目标。",
    ],
    howToUse: [
      "使用匹配的 tokenizer/checkpoint，准备输入与目标文本。",
      "微调设置输入/输出长度和解码策略，验证事实一致性。",
      "核查 tokenizer、decoder 起始 token、作为 decoder 输入的目标前缀位移及 attention mask；监督标签保留原目标序列。",
      "在事实一致性、覆盖率和长度上对输出抽样评估，不能只用 ROUGE。",
    ],
    tuning: [
      "beam width、长度惩罚与最大输出长度影响摘要长度。",
      "领域迁移时先看输入截断比例和学习率。",
      "数字／人名常错时加入事实一致性检查并审视训练数据，beam 调整不足以保证忠实。",
      "句子重复时排查目标格式与解码策略，必要时比较重复约束。",
    ],
    modifications: [
      "可继续做领域去噪预训练，再微调任务。",
      "需要轻量部署可比较小型号或蒸馏版本。",
    ],
    pitfalls: [
      "把预训练重建目标当作能保证事实准确。",
      "忽略长文被截断后模型实际上看不到关键信息。",
    ],
    example:
      "新闻摘要：encoder 读报道，decoder 生成简短摘要，人工检查关键数字与人物是否准确。",
    compareTo: ["t5", "bert", "gpt-language-model", "seq2seq"],
  },
];
