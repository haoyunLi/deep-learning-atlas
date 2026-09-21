import { classicalRepresentationLessons } from "./classicalRepresentation";
import { rlLessons } from "./rlModels";
import { visionLanguageLessons } from "./visionLanguage";

export type Lesson = {
  id: string;
  source?: { label: string; url: string };
  title: string;
  englishTitle: string;
  category: string;
  level: "入门" | "进阶" | "高级";
  duration: string;
  icon: string;
  summary: string;
  intuition: string;
  core: string;
  equation: string;
  whenToUse: string[];
  howToUse: string[];
  tuning: string[];
  modifications: string[];
  pitfalls: string[];
  example: string;
  compareTo: string[];
};

export const categories = [
  {
    id: "foundations",
    label: "基础原理",
    englishLabel: "Foundations",
    description: "从神经元、目标函数到梯度，理解模型究竟在学什么。",
  },
  {
    id: "training",
    label: "训练与泛化",
    englishLabel: "Training & Generalization",
    description: "掌握优化、正则化与评估，让训练结果可靠且可复现。",
  },
  {
    id: "classical",
    label: "经典基线",
    englishLabel: "Classical Baselines",
    description: "用简单方法建立参照，理解聚类、近邻与潜变量推断。",
  },
  {
    id: "vision",
    label: "视觉模型",
    englishLabel: "Computer Vision",
    description: "从卷积到残差、分割与视觉 Transformer。",
  },
  {
    id: "sequence",
    label: "语言与序列",
    englishLabel: "Language & Sequences",
    description: "理解循环网络、注意力、BERT 与语言模型。",
  },
  {
    id: "generative",
    label: "生成模型",
    englishLabel: "Generative Models",
    description: "沿着潜变量、对抗训练与逐步去噪理解生成。",
  },
  {
    id: "representation",
    label: "表示学习",
    englishLabel: "Representation Learning",
    description: "对比、自监督与多模态方法怎样学到可迁移的特征。",
  },
  {
    id: "reinforcement",
    label: "强化学习",
    englishLabel: "Reinforcement Learning",
    description: "比较价值、策略、模型与奖励反馈的不同路线。",
  },
  {
    id: "frontiers",
    label: "更多架构",
    englishLabel: "More Architectures",
    description: "图网络、参数高效微调与专家模型。",
  },
] as const;

const coreLessons: Lesson[] = [
  {
    id: "neural-networks",
    source: {
      label: "Deep Learning, Ch. 6: Deep Feedforward Networks",
      url: "https://www.deeplearningbook.org/contents/mlp.html",
    },
    title: "神经网络从哪来",
    englishTitle: "Neural Networks & MLPs",
    category: "foundations",
    level: "入门",
    duration: "8 分钟",
    icon: "◉",
    summary: "把许多简单的可学习变换串起来，得到能表示非线性关系的函数。",
    intuition:
      "一个 neuron 像可调的筛选器：先给输入加权，再决定要传出多少。多层网络把低层线索组合成更抽象的特征；隐藏层学的是中间表示，不是人工写好的规则。",
    core: "全连接层做 affine transform Wx+b，再经 activation。若所有层都只用线性变换，多层会塌缩成一层；ReLU、GELU 等非线性使深度有意义。训练过程调整权重，使预测更接近目标。",
    equation: "h₁ = φ(W₁x + b₁),  ŷ = W₂h₁ + b₂",
    whenToUse: [
      "结构化表格、固定长度特征或其他模型的 prediction head。",
      "需要先搭一个小 baseline，验证任务、数据和训练流程。",
    ],
    howToUse: [
      "先规范化数值特征，分类变量做合适的编码或 embedding。",
      "按任务选输出层：回归常用线性输出；多类分类用 logits 配合 cross-entropy。",
      "从 1–3 个隐藏层的小模型开始，并保留验证集。",
    ],
    tuning: [
      "宽度控制容量；先试 64–512 hidden units，再看训练集与验证集曲线。",
      "学习率通常比盲目增加层数更值得先调；batch size 影响梯度噪声和吞吐。",
    ],
    modifications: [
      "数据有空间结构时换 CNN；有顺序依赖时考虑 RNN 或 Transformer。",
      "加 residual connection 有助于更深网络的优化。",
    ],
    pitfalls: [
      "把训练准确率高误当作泛化好；两者必须分开看。",
      "对分类 logits 先手动 softmax 再交给期望 logits 的损失函数，容易造成数值或接口错误。",
    ],
    example:
      "预测房价：面积、房龄、地段编码进入 MLP，输出一个连续价格；若样本很少，先与线性模型和树模型比较。",
    compareTo: ["cnn", "resnet"],
  },
  {
    id: "loss-functions",
    source: {
      label: "PyTorch: CrossEntropyLoss",
      url: "https://docs.pytorch.org/docs/stable/generated/torch.nn.CrossEntropyLoss.html",
    },
    title: "损失函数定方向",
    englishTitle: "Loss Functions",
    category: "foundations",
    level: "入门",
    duration: "7 分钟",
    icon: "◎",
    summary:
      "Loss 把“做得多好”转为一个可优化的数字；目标设错，模型就会认真地学错。",
    intuition:
      "损失函数像导航目的地。参数更新只会沿它给出的坡度走，因此需要让训练目标接近真正关心的结果。",
    core: "回归常用 MSE 或对异常值更稳健的 MAE/Huber；单标签多类分类常用 cross-entropy；多标签分类对每个标签独立用 binary cross-entropy。训练损失和业务指标可以不同，最终仍须用业务指标验证。",
    equation: "MSE = (1/n)Σ(ŷᵢ−yᵢ)²;  CE = −Σ yₖ log pₖ",
    whenToUse: [
      "先按输出形式选 loss：连续值、单类、多标签或排序任务。",
      "类别严重不平衡时，观察每类表现并考虑 class weighting 或 focal loss。",
    ],
    howToUse: [
      "检查标签格式与框架 API：cross-entropy 通常直接接收 logits 和类别索引。",
      "同时记录 loss 与独立指标，例如 macro F1、AUROC、MAE。",
      "先用简单 loss 建 baseline，再根据错误类型改目标。",
    ],
    tuning: [
      "类权重从训练集频率估计，再用验证集检查 precision/recall 的取舍。",
      "Huber 的转折阈值决定何时从平方惩罚切到线性惩罚。",
    ],
    modifications: [
      "多任务学习可组合多个 loss，但要控制量纲和权重。",
      "难样本问题可试 focal loss；概率质量要求高时检查 calibration。",
    ],
    pitfalls: [
      "只看平均 loss 会隐藏少数类失败。",
      "把 test set 用来反复选 loss 会泄漏评估信息。",
    ],
    example:
      "垃圾邮件是二分类，使用 binary cross-entropy；若漏判更贵，验证时再选满足召回率要求的阈值。",
    compareTo: ["model-evaluation", "regularization"],
  },
  {
    id: "backpropagation",
    source: {
      label: "PyTorch: A Gentle Introduction to torch.autograd",
      url: "https://docs.pytorch.org/tutorials/beginner/blitz/autograd_tutorial.html",
    },
    title: "反向传播像传账单",
    englishTitle: "Backpropagation",
    category: "foundations",
    level: "入门",
    duration: "9 分钟",
    icon: "↶",
    summary: "从最终误差往回计算每个参数的责任，再用梯度更新参数。",
    intuition:
      "如果最终答案错了，backprop 会沿计算路径把“这一步造成了多少误差”逐层分摊。它不是从数据中倒着推理，而是用 chain rule 高效求导。",
    core: "Forward pass 保存计算所需的中间量；反向 pass 从 loss 对输出的导数出发，逐层乘局部导数。自动微分处理图的求导，优化器再使用这些梯度更新权重。",
    equation: "若 z = wx, L = (z−y)²，则 ∂L/∂w = 2(z−y)x",
    whenToUse: [
      "训练可微分神经网络的默认方法。",
      "需要定位训练失败时，用梯度范数检查消失或爆炸。",
    ],
    howToUse: [
      "按 forward → loss → zero gradients → backward → optimizer step 的顺序写训练循环。",
      "用很小 batch 做 overfit test：模型应能记住少量样本。",
      "自定义算子时用数值梯度或自动微分工具核对导数。",
    ],
    tuning: [
      "梯度爆炸时先查学习率，再考虑 gradient clipping。",
      "深层网络梯度消失时检查 activation、初始化、normalization 与残差连接。",
    ],
    modifications: [
      "Gradient accumulation 用多个 micro-batch 近似更大的 batch。",
      "Activation checkpointing 以重算换显存，数学目标不变。",
    ],
    pitfalls: [
      "忘记清零梯度，会在框架中意外累加。",
      "在不合适的位置 detach 张量，会切断梯度路径。",
    ],
    example:
      "预测值是 3、目标是 2；误差往回传播，使推动预测升高的权重得到正梯度，梯度下降会把它调小。",
    compareTo: ["gradient-descent", "neural-networks"],
  },
  {
    id: "gradient-descent",
    source: {
      label: "Deep Learning, Ch. 8: Optimization",
      url: "https://www.deeplearningbook.org/contents/optimization.html",
    },
    title: "梯度下降怎么走",
    englishTitle: "SGD & Learning Rates",
    category: "training",
    level: "入门",
    duration: "8 分钟",
    icon: "↘",
    summary: "梯度给出局部上坡方向；沿反方向走多远，由 learning rate 决定。",
    intuition:
      "在浓雾里下山：梯度告诉你脚下最陡的上坡方向，反过来迈一步。Batch SGD 用一小批样本估计坡度，因此方向有噪声，但每步计算便宜。",
    core: "Mini-batch SGD 每步仅抽部分样本求平均梯度；momentum 把连续方向积累起来，减少来回摆动。学习率过大可震荡或发散，过小则训练缓慢；schedule 常在后期逐渐减小步幅。",
    equation: "θₜ₊₁ = θₜ − η∇L_batch(θₜ);  momentum: vₜ = μvₜ₋₁ + gₜ",
    whenToUse: [
      "几乎所有可微模型训练都需要优化器；SGD+momentum 是可靠基线。",
      "大规模视觉任务中，经过调参的 SGD 仍很常见。",
    ],
    howToUse: [
      "先选一个能让 loss 稳定下降的学习率，再定 batch size 和 schedule。",
      "记录 train/validation loss 与学习率曲线；前几百步就发散时先减小 η。",
      "用 warmup 加余弦衰减处理大型模型训练的起步和后期收敛。",
    ],
    tuning: [
      "学习率通常按对数尺度尝试，例如相邻候选相差约 3 倍。",
      "batch 变大常需重调学习率，不能照搬旧配置。",
    ],
    modifications: [
      "加入 momentum 或 Nesterov momentum。",
      "显存不足时用梯度累积保持有效 batch size。",
    ],
    pitfalls: [
      "只凭一次训练的最终分数判断优化器，忽略随机种子和 schedule。",
      "把训练发散全部归因于模型结构，漏查数据尺度与学习率。",
    ],
    example:
      "某分类器 loss 一直 NaN：先查看输入异常值和梯度，再把 learning rate 从 0.1 降到 0.01。",
    compareTo: ["adamw", "backpropagation"],
  },
  {
    id: "adamw",
    source: {
      label: "Decoupled Weight Decay Regularization",
      url: "https://arxiv.org/abs/1711.05101",
    },
    title: "AdamW 为什么好用",
    englishTitle: "AdamW Optimizer",
    category: "training",
    level: "进阶",
    duration: "8 分钟",
    icon: "◌",
    summary: "给每个参数自适应地调步长，再把 weight decay 与梯度更新分开。",
    intuition:
      "SGD 用一把尺量所有参数；Adam 利用梯度均值和波动，给每个参数安排不同尺度的步子。AdamW 另加独立的权重收缩，避免把 weight decay 混入自适应梯度。",
    core: "Adam 维护一阶矩 m 和二阶矩 v 的指数移动平均，做 bias correction 后按 m/(√v+ε) 更新。AdamW 在此之外应用 decoupled weight decay；weight decay 不等同于对所有参数都施加相同的 L2 loss。",
    equation: "mₜ=β₁mₜ₋₁+(1−β₁)gₜ;  vₜ=β₂vₜ₋₁+(1−β₂)gₜ²;  θ←θ−ηm̂/(√v̂+ε)−ηλθ",
    whenToUse: [
      "训练 Transformer 或需要省调参时间的通用首选 baseline。",
      "梯度尺度在不同参数间差异较大时。",
    ],
    howToUse: [
      "从框架的 AdamW 实现开始，用验证集找 learning rate 和 weight decay。",
      "通常把 bias 与 normalization 参数排除在 weight decay 外。",
      "保持 β₁、β₂、ε 默认值，除非有明确的稳定性问题。",
    ],
    tuning: [
      "优先调 learning rate；再看 weight decay 对验证集的影响。",
      "出现不稳定时检查 warmup、batch size、梯度裁剪和 mixed precision。",
    ],
    modifications: [
      "想比较泛化能力时，与经过合理调参的 SGD+momentum 对照。",
      "低精度训练需要关注 optimizer states 的数值稳定性。",
    ],
    pitfalls: [
      "AdamW 的 weight_decay 和给 loss 直接加 L2 项并不总等价。",
      "优化器让训练 loss 降得快，不保证最终泛化分数最好。",
    ],
    example:
      "微调文本模型：先用 AdamW、短 warmup 和衰减日程；如果 validation loss 先降后升，提前停止并调小学习率。",
    compareTo: ["gradient-descent", "regularization"],
  },
  {
    id: "regularization",
    source: {
      label:
        "Dropout: A Simple Way to Prevent Neural Networks from Overfitting",
      url: "https://jmlr.org/papers/v15/srivastava14a.html",
    },
    title: "让模型学规律而非记答案",
    englishTitle: "Regularization",
    category: "training",
    level: "入门",
    duration: "8 分钟",
    icon: "◇",
    summary: "通过限制容量、扰动训练或提早停止，提高新数据上的表现。",
    intuition:
      "考试前把题库答案背下来不等于会解题。Regularization 给模型加限制或练习变化版题目，迫使它抓住可重复的信号。",
    core: "Weight decay 抑制过大的参数；dropout 在训练时随机置零部分激活；data augmentation 保留标签语义并增加变化；early stopping 以验证集决定停止点。方法适用性依架构和数据而异。",
    equation:
      "L_total = L_data + λ‖W‖²（经典 L2 正则）；AdamW 的 decay 需另行理解",
    whenToUse: [
      "训练表现显著优于验证表现，或数据量相对模型容量较小时。",
      "对图像、语音等能设计可信 augmentation 的任务。",
    ],
    howToUse: [
      "先确认训练/验证分布与切分正确。",
      "优先尝试数据增强、weight decay 和 early stopping，再评估 dropout。",
      "每次只改一两项，记录验证指标和训练曲线。",
    ],
    tuning: [
      "weight decay 从小值起按数量级搜索；过强会造成欠拟合。",
      "dropout rate 需按模型和数据验证，切勿直接套用一个固定数字。",
    ],
    modifications: [
      "视觉任务可加随机裁剪、翻转；时间序列需确保增强不破坏时间含义。",
      "Label smoothing 可缓解过度自信，但可能改变概率校准。",
    ],
    pitfalls: [
      "验证集也做随机训练增强，会让比较失真。",
      "数据泄漏造成的虚高分数，正则化无法修复。",
    ],
    example:
      "猫狗分类训练 99%、验证 75%：检查重复图片和切分，再加入合理裁剪与 weight decay，观察差距是否缩小。",
    compareTo: ["model-evaluation", "adamw"],
  },
  {
    id: "model-evaluation",
    source: {
      label: "scikit-learn: Cross-validation and model evaluation",
      url: "https://scikit-learn.org/stable/modules/cross_validation.html",
    },
    title: "评估模型到底会不会",
    englishTitle: "Evaluation & Data Splits",
    category: "training",
    level: "入门",
    duration: "8 分钟",
    icon: "▤",
    summary: "用正确切分与正确指标，才能判断模型学到的东西能否迁移。",
    intuition:
      "把同一套题的变体放进训练和考试，会高估能力。Evaluation 的核心是模拟真实未来：让测试样本代表部署时会遇到的情况。",
    core: "Train 用于拟合参数，validation 用于选择超参数，test 留作最终报告。分类看 confusion matrix、precision/recall、F1 或 AUROC；回归看 MAE/RMSE；概率决策还需检查 calibration。切分单位应与应用场景一致。",
    equation: "Precision = TP/(TP+FP);  Recall = TP/(TP+FN);  F1 = 2PR/(P+R)",
    whenToUse: [
      "每个项目从第一天就建立评估协议。",
      "类别失衡、时间变化、用户重复出现等情况下尤其重要。",
    ],
    howToUse: [
      "按用户、患者、设备或时间切分，避免同一实体跨集合泄漏。",
      "先定主要指标和业务阈值，再训练与调参。",
      "最终 test 只在选择完成后使用，并报告样本量与不确定性。",
    ],
    tuning: [
      "不平衡分类别只看 accuracy，依据成本选择阈值。",
      "比较模型时固定数据切分并报告多个随机种子或置信区间。",
    ],
    modifications: [
      "部署会遇到时间漂移时，做时间后推验证。",
      "需求涉及公平性或可靠性时，按关键子群体拆分指标。",
    ],
    pitfalls: [
      "先对全数据标准化再切分，会泄漏统计信息。",
      "反复查看 test 并调整模型，会让 test 变成事实上的 validation。",
    ],
    example:
      "预测患者未来风险：按患者分组并按就诊时间切分；同一患者的多次记录不能同时出现在训练与测试。",
    compareTo: ["loss-functions", "regularization"],
  },
  {
    id: "cnn",
    source: {
      label: "Deep Learning, Ch. 9: Convolutional Networks",
      url: "https://www.deeplearningbook.org/contents/convnets.html",
    },
    title: "卷积为何懂图像",
    englishTitle: "Convolutional Neural Networks",
    category: "vision",
    level: "入门",
    duration: "9 分钟",
    icon: "▦",
    summary: "局部连接与共享滤波器，让模型高效检测到处都可能出现的模式。",
    intuition:
      "同一种边缘可能出现在图像任何位置。CNN 用同一块小滤镜扫过整张图，不必为每个像素位置重新学习一套检测器。",
    core: "Convolution kernel 只观察局部 receptive field，权重在空间位置共享。堆叠层会扩大有效感受野，形成从边缘、纹理到物体部件的层级。Pooling 或 stride 降低空间尺寸，但也可能丢失精细位置信息。",
    equation: "y[i,j] = ΣₐΣᵦ K[a,b]·x[i+a,j+b] + b",
    whenToUse: [
      "图像分类、检测、分割，尤其当局部结构和位移相关性很重要时。",
      "像光谱、音频时频图等有网格结构的数据。",
    ],
    howToUse: [
      "先明确输入尺寸、通道顺序、目标分辨率和 augmentation。",
      "从预训练 backbone 或小型 CNN baseline 开始。",
      "分割任务保留高分辨率特征，可用 encoder-decoder 或 skip connection。",
    ],
    tuning: [
      "Kernel size 控制局部视野；stride 控制下采样速度。",
      "小数据优先迁移学习，再考虑从零增大网络。",
    ],
    modifications: [
      "用 depthwise separable convolution 降低计算量。",
      "加 residual block 训练更深网络；attention 可补充全局关系。",
    ],
    pitfalls: [
      "把任意表格 reshape 成图像，未必会得到有意义的局部结构。",
      "过早下采样会损失细粒度定位所需的信息。",
    ],
    example:
      "识别显微镜中的细胞边界：局部纹理很关键，用 CNN/UNet 类结构并保留浅层细节。",
    compareTo: ["resnet", "transformer"],
  },
  {
    id: "resnet",
    source: {
      label: "Deep Residual Learning for Image Recognition",
      url: "https://arxiv.org/abs/1512.03385",
    },
    title: "残差网络搭一条近路",
    englishTitle: "Residual Networks",
    category: "vision",
    level: "进阶",
    duration: "8 分钟",
    icon: "↗",
    summary: "让一组层学习“在原输入上修正多少”，而非重新构建全部信息。",
    intuition:
      "已经有一条不错的路线，就先保留它，再学习小幅绕路。Skip connection 让信息和梯度能沿近路穿过深层网络。",
    core: "Residual block 输出 x+F(x)。当 F(x) 接近 0 时，模块容易近似恒等映射；反向传播也有直接路径。输入输出维度不同时需用 projection 或调整通道与步幅。残差能改善优化，但不能自动解决所有泛化问题。",
    equation: "hₗ₊₁ = hₗ + F(hₗ; Wₗ)",
    whenToUse: [
      "CNN 或 MLP 越堆越深却难以优化时。",
      "需要稳健的视觉 backbone 或更深的特征提取器。",
    ],
    howToUse: [
      "先用成熟的 residual block 配置建立 baseline。",
      "验证加法两侧 tensor 形状一致；下采样时处理 skip 分支。",
      "观察训练曲线与推理成本，深度增加并不一定总划算。",
    ],
    tuning: [
      "优先比较模型深度、宽度和输入分辨率对收益与成本的影响。",
      "BatchNorm 在小 batch 下统计可能不稳，可考虑其他 normalization。",
    ],
    modifications: [
      "Bottleneck block 用 1×1 convolution 降维再升维以节省计算。",
      "Transformer 中也广泛采用 residual connection。",
    ],
    pitfalls: [
      "残差分支与 skip 分支形状不同，不能直接相加。",
      "把训练集收益当作测试集收益；更深仍可能过拟合。",
    ],
    example:
      "普通 30 层 CNN 比 15 层更难训练；改用 residual block 后，网络能更容易学到必要修正。",
    compareTo: ["cnn", "transformer"],
  },
  {
    id: "rnn",
    source: {
      label: "Deep Learning, Ch. 10: Sequence Modeling",
      url: "https://www.deeplearningbook.org/contents/rnn.html",
    },
    title: "循环网络逐步读序列",
    englishTitle: "Recurrent Neural Networks",
    category: "sequence",
    level: "入门",
    duration: "8 分钟",
    icon: "⤴",
    summary: "用一个不断更新的 hidden state，把过去的信息带到当前时间步。",
    intuition:
      "读一句话时，你会用之前读到的内容理解下一个词。RNN 每读一个 token 更新一次“当前记忆”；同一套参数在所有时间步重复使用。",
    core: "基础 RNN 用当前输入 xₜ 和旧状态 hₜ₋₁ 计算新状态 hₜ。时间展开后可用 backpropagation through time 训练。长序列上，反复相乘的梯度可能消失或爆炸，且时间步难以完全并行。",
    equation: "hₜ = tanh(Wₓxₜ + Wₕhₜ₋₁ + b)",
    whenToUse: [
      "流式、低延迟、逐步输入且序列不太长的任务。",
      "作为理解序列建模与 LSTM 的基础 baseline。",
    ],
    howToUse: [
      "按时间顺序送入序列，并明确 padding、mask 和 hidden state 是否跨片段保留。",
      "处理变长序列时避免把 padding 当作真实信息。",
      "从单层、小 hidden size 开始，对照 LSTM/Transformer。",
    ],
    tuning: [
      "截断 BPTT 限制梯度回溯长度与训练内存；若跨片段传递 hidden state，前向计算仍可携带更早的信息，只是梯度不会跨截断边界传播。",
      "梯度裁剪可缓解爆炸；过长依赖可尝试门控单元。",
    ],
    modifications: [
      "LSTM/GRU 加门控以改善长期信息保存。",
      "Bidirectional RNN 能看前后文，但不能直接用于严格因果在线预测。",
    ],
    pitfalls: [
      "随机打乱时间步会破坏序列语义。",
      "让同一个 hidden state 意外跨独立样本传递，会产生信息串扰。",
    ],
    example:
      "实时传感器每秒到达一个数值；RNN 可随数据到来更新状态，预测下一秒趋势。",
    compareTo: ["lstm-gru", "transformer"],
  },
  {
    id: "lstm-gru",
    source: {
      label: "Long Short-Term Memory",
      url: "https://doi.org/10.1162/neco.1997.9.8.1735",
    },
    title: "LSTM 与 GRU 的门",
    englishTitle: "LSTM & GRU",
    category: "sequence",
    level: "进阶",
    duration: "9 分钟",
    icon: "⊞",
    summary: "门控机制决定保留、忘记和写入哪些历史信息。",
    intuition:
      "普通 RNN 的记忆容易被新信息冲掉。LSTM 像有一个专门的记事本：忘记门擦掉无关内容，输入门写入新内容，输出门决定此刻展示什么。",
    core: "LSTM 同时维护 cell state cₜ 与 hidden state hₜ，门值由 sigmoid 控制。GRU 用更新门和重置门，结构更简洁。两者改善长距离依赖的训练，但长序列仍需逐步计算。",
    equation: "cₜ = fₜ⊙cₜ₋₁ + iₜ⊙gₜ;  hₜ = oₜ⊙tanh(cₜ)",
    whenToUse: [
      "时间序列、语音或小中型序列任务，尤其需要在线逐步更新时。",
      "数据规模不大或部署预算限制 Transformer 时。",
    ],
    howToUse: [
      "先试 GRU 作为较轻的门控 baseline，再看 LSTM 是否带来收益。",
      "保持序列顺序，明确窗口长度与预测 horizon。",
      "在验证集上比较简单统计模型、RNN、门控 RNN。",
    ],
    tuning: [
      "hidden size 和层数增加容量，也增加过拟合与延迟。",
      "若长序列不稳定，检查梯度裁剪、初始化与窗口长度。",
    ],
    modifications: [
      "多变量时间序列可加 attention 来聚焦关键时间步。",
      "双向版本适合已拿到完整序列的标注任务，不适合需要预测未来的因果场景。",
    ],
    pitfalls: [
      "把 LSTM 当成无限记忆；非常长的依赖仍可能难学。",
      "训练用完整未来上下文，部署却只有过去，会造成不公平比较。",
    ],
    example:
      "预测设备接下来 10 分钟是否故障：GRU 读过去 2 小时的传感器窗口，输出风险分数。",
    compareTo: ["rnn", "attention"],
  },
  {
    id: "attention",
    source: {
      label: "Attention Is All You Need",
      url: "https://arxiv.org/abs/1706.03762",
    },
    title: "注意力是按需查找",
    englishTitle: "Attention & QKV",
    category: "sequence",
    level: "进阶",
    duration: "10 分钟",
    icon: "✳",
    summary: "每个位置提出 query，按相关性从其他位置的 value 中读取信息。",
    intuition:
      "读到“它”时，你会回头找“它”指代哪个词。Attention 让当前 token 给其他 token 打分，再按分数聚合信息；权重是输入相关的，不是固定窗口。",
    core: "输入经线性投影得到 Q、K、V；QKᵀ 给出匹配分数，除以 √dₖ 控制尺度，softmax 得到权重，再乘 V。Self-attention 的 Q/K/V 来自同一序列；cross-attention 的 query 与 key/value 来自不同序列。Mask 决定哪些位置可见。",
    equation: "Attention(Q,K,V) = softmax(QKᵀ/√dₖ + mask)V",
    whenToUse: [
      "需要建模远距离依赖或跨模态对齐时。",
      "序列中哪些部分重要会随当前输入变化时。",
    ],
    howToUse: [
      "先明确 self-attention 还是 cross-attention，以及允许看哪些位置。",
      "Padding mask 排除补齐 token；causal mask 防止看未来。",
      "检查 Q/K/V 维度与多头拼接后的投影维度。",
    ],
    tuning: [
      "Heads 增加不同表示子空间，但更多头不保证更好。",
      "Dense attention 的 token 配对计算随序列长度平方增长；朴素实现还会存平方大小的权重矩阵。FlashAttention 等精确算法避免显式存下整张矩阵，降低显存与读写成本，但不消除密集配对计算。",
    ],
    modifications: [
      "Multi-head attention 让不同头学习不同关系。",
      "长序列可用局部、稀疏或其他高效 attention 变体，但需检查信息损失。",
    ],
    pitfalls: [
      "注意力权重可帮助观察聚焦位置，但不能直接当作完整因果解释。",
      "漏加 causal mask 会让生成模型在训练时偷看未来。",
    ],
    example:
      "机器翻译生成“bank”时，cross-attention 可参考原句中“river”的上下文，决定译成河岸还是银行。",
    compareTo: ["transformer", "lstm-gru"],
  },
  {
    id: "transformer",
    source: {
      label: "Attention Is All You Need",
      url: "https://arxiv.org/abs/1706.03762",
    },
    title: "Transformer 的积木",
    englishTitle: "Transformer Architecture",
    category: "sequence",
    level: "进阶",
    duration: "11 分钟",
    icon: "▧",
    summary:
      "用注意力交换位置间的信息，再用逐位置 MLP 加工；残差与归一化稳定训练。",
    intuition:
      "Self-attention 负责“和谁交流”，feed-forward network 负责“我怎么加工收到的信息”。把这一组积木反复堆叠，就能形成多层表示。",
    core: "典型 block 包含 multi-head self-attention、position-wise MLP、residual connections 和 normalization。因为注意力本身不按顺序扫描，需通过 positional encoding/embedding 注入位置信息。原始 Transformer 是 encoder-decoder；今天也常见 encoder-only 和 decoder-only 变体。",
    equation:
      "H′ = H + Attention(Norm(H));  H″ = H′ + MLP(Norm(H′))（pre-norm 示意）",
    whenToUse: [
      "文本、多模态和长距离关系重要、数据与算力较充足的任务。",
      "需要大规模预训练再迁移到下游任务时。",
    ],
    howToUse: [
      "先选择 encoder、decoder 或 encoder-decoder，而非只说“用 Transformer”。",
      "准备 tokenization、padding/causal mask 和 positional representation。",
      "从现成预训练模型和标准配置开始，再按数据、延迟、显存约束调整。",
    ],
    tuning: [
      "层数、宽度、head 数、上下文长度一起决定容量与成本。",
      "学习率、warmup、weight decay 与 batch size 对稳定训练很关键。",
    ],
    modifications: [
      "Pre-norm 常用于更深模型的优化；cross-attention 可连接编码器和解码器。",
      "长上下文场景考虑稀疏/局部 attention 或缓存策略。",
    ],
    pitfalls: [
      "注意力不自动理解顺序，位置表示不可遗漏。",
      "仅加大 context window 会明显增加标准 attention 的成本。",
    ],
    example:
      "做长文档分类：使用 encoder 读完整段落，输出 pooled representation，再接分类头。",
    compareTo: ["attention", "encoder-models", "decoder-models"],
  },
  {
    id: "encoder-models",
    source: {
      label: "BERT: Pre-training of Deep Bidirectional Transformers",
      url: "https://arxiv.org/abs/1810.04805",
    },
    title: "Encoder 擅长读懂",
    englishTitle: "Encoder-only Models",
    category: "sequence",
    level: "进阶",
    duration: "8 分钟",
    icon: "⊙",
    summary: "双向读完整输入，产出适合分类、检索和抽取的上下文表示。",
    intuition:
      "理解一句话时，某个词的含义可由左边和右边共同决定。Encoder 让每个位置参考整段可见输入，适合“读完再判断”。",
    core: "Encoder-only Transformer 通常使用双向 self-attention，输出每个 token 的上下文表示。BERT 类模型常用 masked language modeling 预训练；下游可接分类头、token labeling 头，或通过合适训练获得句向量。",
    equation: "H = Encoder(x₁,…,xₙ);  ŷ = Classifier(pool(H))",
    whenToUse: [
      "文本分类、实体识别、搜索排序、特征提取。",
      "输入可以完整获得，且重点是理解或匹配而非逐词生成。",
    ],
    howToUse: [
      "选与语言、领域匹配的预训练 encoder。",
      "分类任务接 pooled 表示；实体识别对每个 token 预测标签。",
      "检索 embedding 需要针对相似度目标训练，不应默认任意 pooled 向量都有效。",
    ],
    tuning: [
      "小数据先试冻结 backbone，只训练 head；再与完整微调比较。",
      "长文本注意截断策略，重要证据不能被截掉。",
    ],
    modifications: [
      "用对比学习改造 encoder，使语义相近样本更接近。",
      "参数受限时用 LoRA 或 adapter 微调。",
    ],
    pitfalls: [
      "直接用双向 encoder 做因果生成会看到未来 token。",
      "把相似度分数误当作校准概率。",
    ],
    example:
      "判断工单是否需要紧急处理：encoder 读整条工单，分类头输出类别和置信分数。",
    compareTo: ["decoder-models", "encoder-decoder", "contrastive-learning"],
  },
  {
    id: "decoder-models",
    source: {
      label: "Language Models are Few-Shot Learners",
      url: "https://arxiv.org/abs/2005.14165",
    },
    title: "Decoder 擅长续写",
    englishTitle: "Decoder-only Models",
    category: "sequence",
    level: "进阶",
    duration: "9 分钟",
    icon: "▹",
    summary: "只看当前及过去 token，逐步预测下一个 token 来生成序列。",
    intuition:
      "写句子时，你可以参考已写的内容，却不能偷看将来的字。Causal mask 强制 decoder 在训练时遵守同样的规则。",
    core: "Decoder-only Transformer 用因果 self-attention，训练目标常为 next-token prediction。训练时可对序列各位置并行计算 loss；推理时自回归地产生下一个 token，KV cache 复用过去 token 的 key/value。Sampling 控制输出多样性。",
    equation: "p(x₁:ₙ) = ∏ₜ p(xₜ | x₁,…,xₜ₋₁)",
    whenToUse: [
      "开放式文本生成、代码生成、对话和统一的序列续写任务。",
      "可利用大量无标签序列做自监督预训练时。",
    ],
    howToUse: [
      "训练时对 token 做右移目标，确保 causal mask 和 padding mask 正确。",
      "推理时设 max tokens、停止条件、temperature 与 top-p。",
      "需要事实正确时加入检索、工具或人工审查流程，并单独评估可靠性。",
    ],
    tuning: [
      "Temperature 降低通常让分布更集中；top-p 限制累计概率范围。",
      "长对话注意上下文预算、延迟、KV cache 显存。",
    ],
    modifications: [
      "Instruction fine-tuning 改变模型响应风格与任务遵循。",
      "LoRA 用较少可训练参数做特定领域适配。",
    ],
    pitfalls: [
      "训练数据中的模式不保证生成事实正确。",
      "推理阶段逐 token 生成，不能按训练时的并行速度估计延迟。",
    ],
    example:
      "代码补全：把光标前代码作为上下文，decoder 按序生成后续代码；低 temperature 可提高稳定性。",
    compareTo: ["encoder-models", "encoder-decoder", "transformer"],
  },
  {
    id: "encoder-decoder",
    source: {
      label: "Attention Is All You Need",
      url: "https://arxiv.org/abs/1706.03762",
    },
    title: "Encoder–Decoder 做转换",
    englishTitle: "Sequence-to-Sequence",
    category: "sequence",
    level: "进阶",
    duration: "9 分钟",
    icon: "⇄",
    summary: "一个模块理解输入，另一个模块在参考输入的同时生成输出。",
    intuition:
      "翻译像先读懂原文，再一句句写译文。Decoder 既需要看自己已写的部分，也需要随时回看 encoder 产生的输入表示。",
    core: "Encoder 对输入做双向表示；decoder 用 causal self-attention 处理输出前缀，再用 cross-attention 读取 encoder hidden states。训练时 teacher forcing 提供真实历史输出；推理时只能用自己已生成的 token。",
    equation: "p(y₁:ₘ | x) = ∏ₜ p(yₜ | y₍<ₜ₎, Encoder(x))",
    whenToUse: [
      "翻译、摘要、语音转写、结构化输入到文本输出。",
      "输入和输出是不同序列，且需要明确对齐或条件生成时。",
    ],
    howToUse: [
      "分别设置 source/target tokenization 与最大长度。",
      "训练时对 target 右移并做因果 mask；推理时使用 greedy、beam search 或 sampling。",
      "用任务指标及人工样本检查遗漏、重复和忠实度。",
    ],
    tuning: [
      "Beam width 增大搜索范围，也增加推理成本，未必提升所有任务。",
      "长输入截断和长度惩罚会影响摘要的完整性。",
    ],
    modifications: [
      "小数据可从预训练 seq2seq 模型微调。",
      "多模态任务可用图像或音频 encoder，文本 decoder。",
    ],
    pitfalls: [
      "Teacher forcing 下训练表现好，不能保证自回归推理时同样稳定。",
      "只看流畅度会漏掉翻译、摘要中的事实遗漏。",
    ],
    example:
      "摘要系统：encoder 读整篇文章，decoder 逐词写摘要，并用 cross-attention 聚焦相关段落。",
    compareTo: ["encoder-models", "decoder-models", "attention"],
  },
  {
    id: "autoencoder-vae",
    source: {
      label: "Auto-Encoding Variational Bayes",
      url: "https://arxiv.org/abs/1312.6114",
    },
    title: "VAE 把数据放进连续空间",
    englishTitle: "Autoencoders & VAEs",
    category: "generative",
    level: "进阶",
    duration: "10 分钟",
    icon: "◈",
    summary: "编码成潜变量，再解码重建；VAE 进一步约束潜空间的分布。",
    intuition:
      "普通 autoencoder 像把图片压成一串摘要再复原。VAE 要求这些摘要在一个较平滑的 latent space 中分布，使我们能从潜空间采样并生成新样本。",
    core: "Encoder 输出 qφ(z|x) 的均值与方差，用 reparameterization trick 采样 z；decoder 学 pθ(x|z)。训练优化 reconstruction term 与 KL divergence 的权衡。KL 约束过强可能导致 posterior collapse，解码器忽略 z。",
    equation: "ELBO = E_q[log pθ(x|z)] − KL(qφ(z|x) ‖ p(z))",
    whenToUse: [
      "需要连续潜空间、重建或可控生成的基础模型时；也可探索异常检测，但必须单独验证异常分数。",
      "想理解概率生成模型和 latent-variable modeling 时。",
    ],
    howToUse: [
      "选择与数据相符的重建分布和 loss。",
      "编码器输出 μ、log σ²，并用 z=μ+σ⊙ε 反向传播。",
      "检查重建质量、随机采样质量和潜变量是否真的被使用。",
    ],
    tuning: [
      "调 KL 权重 β，平衡重建精度与潜空间规则性。",
      "潜变量维度太小欠表达，太大可能使先验约束变弱。",
    ],
    modifications: [
      "β-VAE 强调潜变量约束；conditional VAE 在类别或其他条件下生成。",
      "高分辨率生成可在学习到的 latent space 中训练 diffusion。",
    ],
    pitfalls: [
      "只看 reconstruction 好坏，不检查从先验采样出的质量。",
      "低重建误差不保证样本正常：模型也可能很好地重建异常；异常检测需用标注异常或可信代理数据验证分数与阈值。",
      "把 VAE 与普通 autoencoder 当成同一个目标；前者有显式分布约束。",
    ],
    example:
      "用手写数字训练 VAE：把不同数字编码成潜向量，在两个样本的 z 之间插值，观察形状平滑变化。",
    compareTo: ["gan", "diffusion"],
  },
  {
    id: "gan",
    source: {
      label: "Generative Adversarial Networks",
      url: "https://arxiv.org/abs/1406.2661",
    },
    title: "GAN 用对抗学习生成",
    englishTitle: "Generative Adversarial Networks",
    category: "generative",
    level: "进阶",
    duration: "10 分钟",
    icon: "⚑",
    summary: "生成器造样本，判别器辨真伪；相互竞争推动生成分布接近数据。",
    intuition:
      "一位画家不断尝试骗过鉴赏家，鉴赏家也在提高辨别能力。画家的目标不是逐像素复原某一张图，而是产出整体上像真的新图。",
    core: "Generator G(z) 将噪声映射到样本；discriminator D(x) 估计真假。原始 minimax 目标可描述两者博弈，实践中常把生成器目标改为 non-saturating loss −E_z log D(G(z))，以避免 D 很自信时生成器梯度太弱。训练交替更新两者；若生成器只产生少数样式，会出现 mode collapse。GAN 通常不直接提供易用的样本似然。",
    equation:
      "原始 minimax：min_G max_D Eₓ[log D(x)] + E_z[log(1−D(G(z)))]; 常用 G loss：−E_z log D(G(z))",
    whenToUse: [
      "高保真图像合成、风格转换，且能投入较多训练调试时。",
      "需要快速单次前向采样，并可接受对抗训练复杂度时。",
    ],
    howToUse: [
      "从成熟架构和训练 recipe 起步，分别监控 G、D 的更新。",
      "保存固定噪声种子的生成样本，观察质量与多样性。",
      "用独立指标和人工评估，检查是否只是记住训练图像。",
    ],
    tuning: [
      "G/D 学习率与更新频次影响平衡。",
      "正则化、归一化与判别器容量会影响稳定性。",
    ],
    modifications: [
      "Conditional GAN 以标签或输入图像控制输出。",
      "WGAN 类目标改变分布距离与训练约束，但仍需认真诊断。",
    ],
    pitfalls: [
      "判别器 loss 低不等于生成质量好。",
      "只展示最好看的少数样本，掩盖 mode collapse。",
    ],
    example:
      "生成服装草图：条件 GAN 让 G 根据噪声和类别标签生成图像，让 D 判断“给定该标签时，这张图像是否真实”。",
    compareTo: ["autoencoder-vae", "diffusion"],
  },
  {
    id: "diffusion",
    source: {
      label: "Denoising Diffusion Probabilistic Models",
      url: "https://arxiv.org/abs/2006.11239",
    },
    title: "扩散模型一步步去噪",
    englishTitle: "Diffusion Models",
    category: "generative",
    level: "进阶",
    duration: "11 分钟",
    icon: "◍",
    summary: "训练网络识别不同噪声程度下的噪声，再从随机噪声逐步生成样本。",
    intuition:
      "先给清晰图片逐步加入随机噪声，直到原信号几乎被噪声淹没；模型学习反向去噪。生成时从纯噪声出发，反复去噪直到出现图像。",
    core: "Forward process 按噪声日程把 x₀ 变成 xₜ；网络以 xₜ 和 t 为输入预测噪声 ε、原图或其他参数化目标。Reverse sampling 从 x_T 迭代到 x₀。条件生成可加入文本等条件；推理质量、步数和速度之间存在取舍。",
    equation: "xₜ = √ᾱₜ x₀ + √(1−ᾱₜ) ε,  ε∼N(0,I);  L≈‖ε−εθ(xₜ,t)‖²",
    whenToUse: [
      "图像、音频等高质量条件生成与编辑。",
      "对生成多样性和训练稳定性要求较高，能承担多步采样成本时。",
    ],
    howToUse: [
      "选定噪声 schedule、时间步采样和网络结构。",
      "训练时随机抽 t、加噪、预测目标；验证时固定 prompts/seeds 比较。",
      "推理时同时评估采样步数、质量、延迟和显存。",
    ],
    tuning: [
      "采样步数越少通常越快，但质量可能变化，需针对 sampler 验证。",
      "Guidance scale 控制条件遵循程度；过高可损害多样性或产生伪影。",
    ],
    modifications: [
      "Latent diffusion 先压缩到潜空间再去噪，降低计算成本。",
      "不同 sampler 可改变采样路径与速度，不必重新训练同一模型。",
    ],
    pitfalls: [
      "把训练时的加噪步骤数和推理采样步数混为一谈。",
      "只看少量图片，忽略多样性、偏差与失败案例。",
    ],
    example:
      "文本生成图像：网络在每个噪声级别参考文本 embedding，逐步将 latent noise 变成与描述匹配的图像。",
    compareTo: ["gan", "autoencoder-vae"],
  },
  {
    id: "gnn",
    source: {
      label: "Semi-Supervised Classification with Graph Convolutional Networks",
      url: "https://arxiv.org/abs/1609.02907",
    },
    title: "图神经网络在关系中学习",
    englishTitle: "Graph Neural Networks",
    category: "frontiers",
    level: "进阶",
    duration: "10 分钟",
    icon: "∘",
    summary: "节点从邻居接收消息并聚合，学习同时包含自身与关系结构的表示。",
    intuition:
      "判断一个用户是否可能喜欢某商品，不能只看用户本身；还要看他和其他用户、商品的连接。GNN 用多轮邻居交流传播这些线索。",
    core: "Message passing 每层为边构造消息，并用 sum/mean/attention 等聚合，再更新节点表示。k 层通常能访问 k-hop 邻域。经典 GCN 用度归一化的邻接矩阵加权聚合；GraphSAGE 学习邻居聚合函数以泛化到有特征的新节点，常用邻居采样处理大图；GAT 学习邻居间的 attention 权重。层数过深可能 oversmoothing。",
    equation:
      "hᵥ⁽ˡ⁺¹⁾ = Update(hᵥ⁽ˡ⁾, Aggregate({Message(hᵤ⁽ˡ⁾,eᵤᵥ): u∈N(v)}))",
    whenToUse: [
      "分子、知识图谱、推荐、社交网络或任何关系本身有预测价值的任务。",
      "目标涉及节点、边或整张图的预测时。",
    ],
    howToUse: [
      "先定义节点、边、特征和训练/验证边界。",
      "选择节点级、边级或图级 readout。",
      "做一个忽略图结构的 baseline，确认边信息确有增益。",
    ],
    tuning: [
      "层数控制感受野，深层前先看是否过平滑。",
      "大图关注邻居采样与 batch 构造，避免内存爆炸。",
    ],
    modifications: [
      "有异质节点或边类型时用 relation-aware message passing。",
      "需要数据驱动的邻居权重可试 GAT；需要处理有特征的新节点可试 GraphSAGE，大图训练时再配合邻居采样。",
    ],
    pitfalls: [
      "随机切边时让验证节点的答案通过图结构泄漏。",
      "以为更多层总能捕获更好关系，忽视 oversmoothing 和噪声传播。",
    ],
    example:
      "预测分子毒性：原子是节点、化学键是边，GNN 聚合原子局部环境后做 graph-level classification。",
    compareTo: ["cnn", "attention"],
  },
  {
    id: "contrastive-learning",
    source: {
      label:
        "A Simple Framework for Contrastive Learning of Visual Representations",
      url: "https://arxiv.org/abs/2002.05709",
    },
    title: "对比学习让相似靠近",
    englishTitle: "Contrastive Learning",
    category: "representation",
    level: "进阶",
    duration: "9 分钟",
    icon: "⇆",
    summary: "构造正负样本，让 embedding 空间反映我们在意的相似关系。",
    intuition:
      "同一张照片的两种裁剪应该被认作一类；不同照片通常应分开。模型不需先知道对象名字，也能从“谁和谁相似”学到表示。",
    core: "Encoder 把输入映射到向量；InfoNCE 类目标提高正样本相似度，降低与负样本的相似度。关键设计是正例定义、增强方式、负例来源与 temperature。错误的正负关系会直接塑造错误的 embedding 几何。",
    equation: "Lᵢ = −log[exp(sim(zᵢ,zᵢ⁺)/τ) / Σⱼ exp(sim(zᵢ,zⱼ)/τ)]",
    whenToUse: [
      "标签少，但可构造同一对象的不同视图时。",
      "图文检索、语义搜索、去重或聚类需要可比较向量时。",
    ],
    howToUse: [
      "明确什么算语义上的正例，设计不破坏语义的 augmentation。",
      "对向量做适当归一化，设定 similarity 与 temperature。",
      "用真正的检索指标如 Recall@K 测试，而非只看对比损失。",
    ],
    tuning: [
      "Temperature 控制相似度分布尖锐程度。",
      "Batch 或 memory bank 影响负例数量，但更多负例也可能带来 false negatives。",
    ],
    modifications: [
      "有标签时可用 supervised contrastive loss。",
      "多模态双塔把图像和文本编码到同一向量空间。",
    ],
    pitfalls: [
      "强增强若改变类别语义，会逼模型忽略重要信息。",
      "两个实际相似样本被当作负例，可能损害检索质量。",
    ],
    example:
      "建立论文搜索：标题和摘要通过 encoder 得到 embedding，相关论文在向量空间靠近，查询时用近邻搜索。",
    compareTo: ["encoder-models", "autoencoder-vae"],
  },
  {
    id: "transfer-lora",
    source: {
      label: "LoRA: Low-Rank Adaptation of Large Language Models",
      url: "https://arxiv.org/abs/2106.09685",
    },
    title: "预训练模型怎么适配新任务",
    englishTitle: "Transfer Learning & LoRA",
    category: "frontiers",
    level: "进阶",
    duration: "10 分钟",
    icon: "↳",
    summary: "复用大模型已学到的通用表示，再按数据量和资源选择微调范围。",
    intuition:
      "已经会识别一般形状的模型，学医学影像时不必从零开始。LoRA 更进一步：保留原有大矩阵，只训练一个低秩的“小修正”。",
    core: "分类/回归任务可冻结 backbone、只训练新 head 来提取特征；生成任务通常先用 prompting 或 few-shot examples 建 baseline。Full fine-tuning 更新全部参数；LoRA 把权重更新近似写为 ΔW=BA，冻结 W 只训练低秩 A/B。不同方案在显存、灵活性、适配能力上有取舍；LoRA 节省可训练参数和 optimizer state，但不自动降低基础模型推理计算。",
    equation: "W′ = W + ΔW,  ΔW = (α/r)BA,  rank(BA) ≤ r",
    whenToUse: [
      "新任务标注少，已有相近领域的预训练模型。",
      "基础模型太大，完整微调的训练显存或存储成本过高。",
    ],
    howToUse: [
      "分类/回归先试冻结 backbone + head；文本生成先试 prompting/few-shot，分别建立低成本 baseline。",
      "若适配不足，再试 LoRA 或 full fine-tuning；固定同一验证集比较。",
      "LoRA 指定要注入的线性层，训练 adapter 并正确保存基础模型版本。",
    ],
    tuning: [
      "LoRA rank r 控制更新容量；α 控制更新缩放。",
      "微调学习率通常与从零训练不同，需小范围搜索并关注遗忘。",
    ],
    modifications: [
      "领域差异很大时，扩大可训练层或进行领域继续预训练。",
      "多个任务可维护不同 adapter；部署时可按需要合并权重。",
    ],
    pitfalls: [
      "训练集太小仍可能过拟合，即使只训练少量参数。",
      "只报告 adapter 文件大小，忽略部署仍需加载基础模型。",
    ],
    example:
      "给通用文本模型添加法律文书分类能力：先训练分类头；效果不足时用 LoRA 微调 attention 投影。",
    compareTo: ["encoder-models", "decoder-models", "adamw"],
  },
  {
    id: "reinforcement-learning",
    source: {
      label: "Sutton & Barto: Reinforcement Learning, 2nd ed.",
      url: "https://mitpress.mit.edu/9780262352703/reinforcement-learning/",
    },
    title: "强化学习从反馈中决策",
    englishTitle: "Reinforcement Learning",
    category: "reinforcement",
    level: "入门",
    duration: "11 分钟",
    icon: "♜",
    summary: "Agent 试动作、看结果、积累 reward，学习长期收益更好的策略。",
    intuition:
      "玩游戏时，眼前得分最高的动作未必能赢整局。RL 关注行动如何影响未来状态和累计回报，而非只拟合一张静态答案表。",
    core: "环境给出 state、action、reward、next state。Value-based 方法（如 DQN）估计动作价值；policy-gradient 直接调整动作概率；actor-critic 同时学习策略与价值。Exploration、延迟奖励、样本效率和离线数据偏差都是核心挑战。",
    equation: "Q*(s,a) = E[r + γ maxₐ′ Q*(s′,a′) | s,a]",
    whenToUse: [
      "动作会改变未来环境，且能定义可验证的奖励或模拟器时。",
      "游戏、控制、资源调度与某些序列决策问题。",
    ],
    howToUse: [
      "先写清 state、action、reward、episode termination 和安全约束。",
      "有离散小动作空间可从 DQN 类 baseline 开始；连续动作常考虑 actor-critic。",
      "与随机策略、启发式规则对比，并跨多个随机种子评估。",
    ],
    tuning: [
      "折扣因子 γ 控制未来回报权重；奖励尺度影响训练稳定性。",
      "探索强度、replay buffer 与 target network 更新频率需配合环境调。",
    ],
    modifications: [
      "可用 imitation learning 先从演示数据学习，再在线改进。",
      "离线 RL 必须处理策略偏离历史数据时的价值估计误差。",
    ],
    pitfalls: [
      "Reward hacking：agent 可能优化奖励漏洞而非真实目标。",
      "只报告最好一局，掩盖回报方差与失败风险。",
    ],
    example:
      "仓库机器人选择路线：即时移动成本小的路未必最快；策略需要考虑拥堵造成的后续延迟。",
    compareTo: ["loss-functions", "model-evaluation"],
  },
  {
    id: "mixture-of-experts",
    source: {
      label: "Outrageously Large Neural Networks: Sparsely-Gated MoE",
      url: "https://arxiv.org/abs/1701.06538",
    },
    title: "MoE 让专家分工",
    englishTitle: "Mixture of Experts",
    category: "frontiers",
    level: "高级",
    duration: "9 分钟",
    icon: "⋈",
    summary:
      "路由器为每个 token 选择少数 expert，在扩大参数容量时控制每次计算量。",
    intuition:
      "不是每个问题都要让所有专家一起作答。Router 先判断交给谁，再让被选中的专家处理；这样总参数可以很大，而单次只激活其中一部分。",
    core: "MoE 通常把 Transformer 中的 dense feed-forward block 替换成多个 expert MLP。Router 产生 expert 分数，常选 top-k 专家加权输出。训练需处理负载均衡与 expert 容量；实际吞吐还受通信、内存与部署方式限制。",
    equation: "y = Σᵢ∈TopK(g(x)) pᵢ(x)·Expertᵢ(x)",
    whenToUse: [
      "模型容量需求很大，且具备分布式训练与服务基础设施时。",
      "不同 token/任务可能受益于条件计算时。",
    ],
    howToUse: [
      "先有性能清楚的 dense baseline，再评估 MoE 带来的质量与吞吐收益。",
      "监控每个 expert 的 token 分配和被丢弃/溢出的 token。",
      "把总参数、每 token 激活参数与真实吞吐分别报告。",
    ],
    tuning: [
      "Expert 数、top-k、capacity factor 共同影响负载和计算。",
      "负载均衡辅助损失过弱会专家塌缩，过强也可能压制任务目标。",
    ],
    modifications: [
      "按层选择性使用 MoE，平衡质量与通信成本。",
      "共享 expert 可提供通用路径，专门 expert 学特定模式。",
    ],
    pitfalls: [
      "总参数大不等于单次计算量等比例大，也不保证延迟低。",
      "路由不均使少数 expert 过载，训练质量和服务吞吐同时受损。",
    ],
    example:
      "多领域语言模型中，代码与自然语言 token 可被路由到不同 expert 组合，但并非由人工硬编码领域标签。",
    compareTo: ["transformer", "decoder-models"],
  },
];

export const lessons: Lesson[] = [
  ...coreLessons,
  ...classicalRepresentationLessons,
  ...visionLanguageLessons,
  ...rlLessons,
].sort(
  (a, b) =>
    categories.findIndex((category) => category.id === a.category) -
    categories.findIndex((category) => category.id === b.category),
);
