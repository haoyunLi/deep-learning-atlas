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
    equation: "Dₗ = Conv([Upsample(Dₗ₊₁), Eₗ]);  ŷ₍ᵢⱼ₎ = softmax(D₀₍ᵢⱼ₎)",
    whenToUse: [
      "像素级语义分割，尤其需要边缘定位、标注数据有限的医学或工业图像。",
      "输入和输出具有同一空间坐标系，例如细胞、器官或缺陷 mask。",
    ],
    howToUse: [
      "统一图像与 mask 的尺寸、插值和几何增强；mask 缩放应使用 nearest neighbor。",
      "从预训练 encoder 的 U-Net baseline 开始；按类别分布选 cross-entropy、Dice 或组合损失。",
      "按病例或场景划分训练与验证，推理后检查小目标和边界。",
    ],
    tuning: [
      "patch size 决定上下文和显存；目标大时增加视野，目标细时保留分辨率。",
      "前景稀少时调采样策略和 Dice/CE 权重，观察 per-class Dice/IoU。",
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
    whenToUse: [
      "医学图像分割任务变化多、没有时间逐项手调 U-Net pipeline。",
      "需要强、可复现的 baseline 来判断自定义方法是否真的有收益。",
    ],
    howToUse: [
      "严格整理病例级数据、体素间距与类别标签；先检查方向、spacing 和 train/validation split。",
      "运行规划和预处理，再训练推荐配置；比较 2D、3D、cascade 的交叉验证结果。",
      "使用对应配置的推理、重采样和后处理步骤；外部测试集单独评估。",
    ],
    tuning: [
      "先检查自动规划的 target spacing、patch size、batch size 与各类出现率。",
      "显存受限可调资源预算；目标极小或各向异性明显时重点看重采样带来的信息损失。",
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
    whenToUse: [
      "U-Net 已可运行，但浅层细节与深层语义结合不足、边界或小目标仍差。",
      "能承担额外计算并需要比较不同 decoder 深度。",
    ],
    howToUse: [
      "先固定同一 encoder、数据分割和增强，与普通 U-Net 公平比较。",
      "训练多级 segmentation heads；推理时选经验证的单 head 或融合方式。",
    ],
    tuning: [
      "嵌套深度与通道宽度共同影响显存；先用小规模版本试效果。",
      "deep supervision 的各 head 权重应结合验证集确定。",
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
    equation: "ASPP(F) = concat(Convᵣ₁(F), Convᵣ₂(F), Convᵣ₃(F), pool(F))",
    whenToUse: [
      "自然场景语义分割，物体大小差异显著。",
      "希望在感受野、输出分辨率和计算量之间控制取舍。",
    ],
    howToUse: [
      "选预训练 backbone，并对齐图像、mask 与输出尺寸。",
      "先固定 output stride 与 crop size，记录每类 IoU 和边界错误。",
    ],
    tuning: [
      "atrous rates 要与 feature map 大小匹配；太大的 rate 可能采不到有效位置。",
      "output stride 小可保留更多细节，但显存和计算通常增加。",
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
    whenToUse: [
      "学习 CNN stage、感受野和深度概念。",
      "已有 VGG 预训练权重且需要兼容旧实验或感知损失。",
    ],
    howToUse: [
      "优先加载预训练特征提取器，更换分类 head。",
      "与 ResNet、EfficientNet 比较相同数据集上的精度、参数和延迟。",
    ],
    tuning: [
      "输入分辨率和 batch size 会明显影响显存；迁移学习先冻结早期 stage。",
      "从较小 VGG 版本开始，若训练不稳定先检查学习率。",
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
    whenToUse: [
      "需要比较 feature reuse 和 residual addition 的不同设计。",
      "图像分类或作为预训练 backbone，且实测延迟和显存可接受。",
    ],
    howToUse: [
      "先使用成熟的预训练 DenseNet 变体并替换最终 head。",
      "用相同数据 split 对比 ResNet，记录吞吐与峰值显存。",
    ],
    tuning: [
      "growth rate、block 深度和压缩率控制容量与内存。",
      "小数据集先调增强和正则化，别直接加深 block。",
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
    whenToUse: [
      "分类需要在精度与计算预算间挑选不同规模模型。",
      "想用成熟的预训练 CNN backbone 做迁移学习。",
    ],
    howToUse: [
      "先选与设备延迟、显存匹配的 B 型号和推荐输入尺寸。",
      "加载预训练权重，按任务替换分类头，并做同硬件测速。",
    ],
    tuning: [
      "输入分辨率与模型变体应一起调；分辨率过高可能只增加成本。",
      "小数据微调优先扫学习率、增强与冻结层数。",
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
    whenToUse: [
      "想保留卷积归纳偏置，同时使用强的现代视觉 backbone。",
      "图像分类、检测或分割需要与 ViT/Swin 公平比较。",
    ],
    howToUse: [
      "使用可信的预训练 checkpoint 和对应预处理。",
      "把它当 backbone 接任务 head，并在目标硬件上测 latency、显存和精度。",
    ],
    tuning: [
      "模型尺寸与输入分辨率同时决定成本。",
      "微调学习率、weight decay 和增强时保持验证 split 一致。",
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
    whenToUse: [
      "有合适的预训练权重，需要全局关系的图像分类或迁移任务。",
      "愿意比较不同 patch size 与预训练规模的视觉模型。",
    ],
    howToUse: [
      "优先使用预训练 ViT，匹配输入尺寸、归一化和位置编码处理。",
      "分类用 class token 或 pooling；密集预测需接 decoder 或用多尺度变体。",
    ],
    tuning: [
      "patch 越小 token 越多，细节更多但 attention 成本上升。",
      "微调先扫学习率、weight decay、warmup 与数据增强。",
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
    compareTo: ["cnn", "convnext", "swin-transformer"],
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
    whenToUse: [
      "检测、实例/语义分割等需要多尺度 feature maps 的视觉任务。",
      "高分辨率图像让标准全局 ViT attention 成本过高。",
    ],
    howToUse: [
      "选预训练 Swin 作为 backbone，接检测或分割 neck/head。",
      "让输入尺寸与 window size、patch merging 层级兼容，并记录实际内存。",
    ],
    tuning: [
      "window size 改变局部视野与成本；大目标依赖跨层信息传播。",
      "Tiny/Small/Base 选择要以目标设备 latency 与精度为准。",
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
    whenToUse: [
      "离线文本标注、语音片段分类或完整时间序列分析。",
      "序列长度适中，想比单向 RNN 多利用右侧上下文。",
    ],
    howToUse: [
      "输入序列设 padding mask 或 packed sequence，避免填充值污染状态。",
      "按 token 或整句任务接分类 head；先与单向 LSTM/GRU 比较。",
    ],
    tuning: [
      "hidden size 与层数决定容量和延迟；双向通常让输出维度翻倍。",
      "长序列检查梯度、截断和批内长度差异。",
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
    whenToUse: [
      "翻译、摘要、语音转写等输入输出均为序列且长度可变。",
      "需要理解 encoder-decoder 与 autoregressive generation 的基础结构。",
    ],
    howToUse: [
      "准备输入/输出 tokenizer 与起止 token；训练时常用 teacher forcing。",
      "推理逐步解码，用 greedy 或 beam search，并设置最大长度。",
      "与 Transformer encoder-decoder baseline 比较质量和延迟。",
    ],
    tuning: [
      "最大序列长度、beam width 和长度惩罚会影响速度与生成结果。",
      "检查训练时 teacher forcing 与推理时自身输出反馈造成的差异。",
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
    equation: "yₜ = Σₖ wₖ x₍ₜ₋d·k₎;  receptive field 随层数和 dilation 扩大",
    whenToUse: [
      "时间序列预测、传感器信号、音频等有固定历史窗口的任务。",
      "希望并行训练且要求严格因果性。",
    ],
    howToUse: [
      "先确定预测时可见的历史长度，再设计 kernel、层数、dilation 覆盖它。",
      "保留时间顺序划分验证集，检查因果 padding 和标签对齐。",
    ],
    tuning: [
      "dilation schedule 决定感受野，先算清楚再调通道数。",
      "长历史与实时延迟间需要平衡；batch size 受序列长度影响。",
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
    compareTo: ["rnn", "bidirectional-rnn", "transformer"],
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
    whenToUse: [
      "学习 embedding 基础、构建轻量词汇特征 baseline。",
      "数据/算力有限且任务对上下文歧义不敏感。",
    ],
    howToUse: [
      "分词与词表先固定，训练或加载向量，再作为下游模型 embedding 初始化。",
      "检查 OOV 和领域词汇覆盖，和随机 embedding、上下文 embedding 对比。",
    ],
    tuning: [
      "window size 控制局部语境范围；embedding dimension 平衡容量和数据量。",
      "低频词过滤阈值、负采样规模影响训练和长尾词表示。",
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
    compareTo: ["bert", "roberta", "contrastive-learning"],
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
    whenToUse: [
      "文本分类、序列标注、抽取式问答等需要利用完整上下文的任务。",
      "有适合语言与领域的预训练 checkpoint，标注量有限。",
    ],
    howToUse: [
      "选择对应 tokenizer 与预训练权重，设置最大长度、截断和 attention mask。",
      "分类接 [CLS] head；实体识别接 token-level head；保留独立验证集。",
      "长文可分块并设计聚合，不能假设默认上下文长度足够。",
    ],
    tuning: [
      "微调学习率通常需低于随机初始化 head；先扫 learning rate、epochs、batch。",
      "对不平衡标签记录 macro F1 与各类召回。",
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
    whenToUse: [
      "BERT 类理解任务需要一个强的通用 encoder baseline。",
      "研究预训练 recipe 对下游任务的影响。",
    ],
    howToUse: [
      "加载对应 RoBERTa tokenizer、special tokens 与 checkpoint。",
      "按任务加分类或 token head，用相同 split 对比 BERT。",
    ],
    tuning: [
      "先调微调 learning rate、训练轮数和最大长度。",
      "继续预训练时控制语料质量与计算预算，并单独评估领域迁移。",
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
    whenToUse: [
      "文本生成、对话、代码补全或统一为生成的任务。",
      "希望利用已有预训练模型做 prompting 或少量数据适配。",
    ],
    howToUse: [
      "先选与语言、许可、上下文长度及算力匹配的 checkpoint。",
      "推理明确 prompt、停止条件、最大输出长度；在验证集测准确性和延迟。",
      "若需微调，先比较 prompting、LoRA 与全参数方案。",
    ],
    tuning: [
      "temperature 调随机性，top-p 限定采样候选；事实/代码任务可从低随机性开始。",
      "上下文长度、batching 和 KV cache 影响吞吐与显存；训练需检查 causal mask。",
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
    compareTo: ["bert", "t5", "decoder-models", "reward-model"],
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
    whenToUse: [
      "翻译、摘要、问答或多个任务共用统一输入输出形式。",
      "既要看完整输入又要生成可变长度结果。",
    ],
    howToUse: [
      "使用所选 checkpoint 对应 tokenizer 与任务前缀。",
      "分别设 input/output 最大长度，训练时用目标文本监督，推理时设置解码策略。",
    ],
    tuning: [
      "beam size、length penalty 和最大生成长度影响生成质量与速度。",
      "任务前缀、微调学习率与领域数据质量需要验证。",
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
    whenToUse: [
      "手机、边缘设备或在线服务有明确延迟与内存预算。",
      "需要轻量分类 backbone 或分割、检测的特征提取器。",
    ],
    howToUse: [
      "以预训练权重作为起点，换任务 head。",
      "在实际设备上测端到端延迟、峰值内存与精度。",
    ],
    tuning: [
      "width multiplier、输入分辨率和量化设置共同影响成本。",
      "微调时先控制学习率与 normalization，再决定是否解冻全部层。",
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
    whenToUse: [
      "需要计数或分别跟踪多个同类物体。",
      "目标级 mask 比整张图语义分割更有用。",
    ],
    howToUse: [
      "准备每个实例单独的 mask 和 box，明确拥挤区域标注规则。",
      "选预训练 backbone/RPN，训练后按类别评估 AP、mask AP 与小目标 AP。",
    ],
    tuning: [
      "proposal 数量、置信度与 NMS 阈值影响召回和速度。",
      "图像缩放和 backbone 分辨率影响小目标。",
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
    whenToUse: [
      "研究 end-to-end 目标检测与集合预测。",
      "有预训练实现，并希望减少 anchor/NMS 等人工设计。",
    ],
    howToUse: [
      "准备每图 box、类别及对应尺寸坐标；检查空目标图处理。",
      "从预训练 checkpoint 微调，与同数据的两阶段检测器比较 AP 和延迟。",
    ],
    tuning: [
      "object query 数要覆盖典型目标数量；no-object 权重影响假阳性。",
      "训练轮数、学习率和多尺度特征对收敛及小目标很关键。",
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
    whenToUse: [
      "摘要、改写、生成式问答等需要读完整输入再生成输出。",
      "想比较 T5 与 BART 的 seq2seq 预训练目标。",
    ],
    howToUse: [
      "使用匹配的 tokenizer/checkpoint，准备输入与目标文本。",
      "微调设置输入/输出长度和解码策略，验证事实一致性。",
    ],
    tuning: [
      "beam width、长度惩罚与最大输出长度影响摘要长度。",
      "领域迁移时先看输入截断比例和学习率。",
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
