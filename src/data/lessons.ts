import { classicalRepresentationLessons } from "./classicalRepresentation";
import { dataConceptLessons } from "./dataConcepts";
import { learningConceptLessons } from "./learningConcepts";
import { rlLessons } from "./rlModels";
import { visionLanguageLessons } from "./visionLanguage";

export type Lesson = {
  id: string;
  source: { label: string; url: string };
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
  mechanicsSteps: string[];
  whenToUse: string[];
  limits: string[];
  howToUse: string[];
  tuning: string[];
  settings: { name: string; start: string; adjust: string }[];
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
      "在训练开始前检查一小批输入、输出形状和标签映射，并确认简单模型能拟合很小的样本集。",
    ],
    tuning: [
      "宽度控制容量；先试 64–512 hidden units，再看训练集与验证集曲线。",
      "学习率通常比盲目增加层数更值得先调；batch size 影响梯度噪声和吞吐。",
      "同时画训练与验证 loss；两条都高先查特征和容量，只有验证差则检查泄漏、正则化和数据量。",
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
    mechanicsSteps: [
      "把连续特征按训练集统计量缩放，离散特征编码或查 embedding，并固定输入张量的列顺序。",
      "每层计算仿射变换 Wx+b，再通过非线性 activation；隐藏层把输入组合成任务相关的中间表示。",
      "输出层产生回归值或分类 logits，按标签类型计算 loss；分类训练通常让交叉熵直接接收 logits。",
      "反向传播得到每层权重的梯度，优化器重复更新；验证曲线决定容量、正则化与停止时机。",
    ],
    limits: [
      "样本很少的表格任务先与线性模型、随机森林等基线比较；MLP 不会自动利用表格的先验结构。",
      "图像、序列或图含有明确局部、顺序或关系结构时，优先试 CNN、RNN/Transformer 或 GNN。",
    ],
    settings: [
      {
        name: "隐藏层宽度",
        start: "从小模型开始，只增加到能拟合训练集的程度，并记录参数量。",
        adjust:
          "训练与验证都欠拟合再加宽；训练好而验证差时先减容量或加强正则。",
      },
      {
        name: "层数与激活",
        start: "先用少量隐藏层和 ReLU/GELU，深层时考虑归一化与残差。",
        adjust:
          "深层训练变差或梯度衰减时检查初始化、归一化和 skip connection。",
      },
      {
        name: "学习率与 batch",
        start: "先做小规模学习率扫描，选择能稳定下降的范围。",
        adjust: "loss 振荡或发散就降低学习率；收敛过慢且梯度正常可小幅提高。",
      },
    ],
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
      "在一个手算得到答案的小 batch 上核对 loss 数值和梯度方向，再进入完整训练。",
    ],
    tuning: [
      "类权重从训练集频率估计，再用验证集检查 precision/recall 的取舍。",
      "Huber 的转折阈值决定何时从平方惩罚切到线性惩罚。",
      "先定位误差类型再改目标：离群值、类别失衡和概率不校准对应不同处理，不能只看平均 loss。",
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
    mechanicsSteps: [
      "先定义输出空间与标签：连续值、互斥类别、多标签或排序目标，对应不同的概率假设。",
      "模型给出预测或 logits，loss 把每个样本的错误变成可微标量；再决定求和、平均及类别权重。",
      "反向传播沿 loss 的梯度更新模型，确保权重和归约方式不会让某些样本压倒其他样本。",
      "用独立指标和阈值评估真正关心的表现；必要时根据错误分析调整 loss 或采样。",
    ],
    limits: [
      "交叉熵优化概率拟合，不会直接保证 F1、召回率或校准度；这些仍需独立验证。",
      "无法可靠标注的目标或受噪声严重污染的标签，单纯更换 loss 难以解决数据问题。",
    ],
    settings: [
      {
        name: "任务匹配",
        start: "回归先试 MSE/Huber；单标签多类用交叉熵；多标签用逐类 BCE。",
        adjust: "残差长尾明显可比较 Huber/MAE；漏检代价高则另行调阈值与权重。",
      },
      {
        name: "类别权重",
        start: "先不加权，记录每类 precision、recall 与支持数。",
        adjust:
          "少数类召回不足时按训练集频率试权重，并观察多数类精度是否明显下降。",
      },
      {
        name: "归约与尺度",
        start: "核对框架默认是 mean 还是 sum，多任务 loss 先记录各项数值范围。",
        adjust: "某一项梯度主导训练时重新缩放或调权重，避免只看总 loss。",
      },
    ],
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
      "对自定义算子或复杂 loss 用有限差分做小规模梯度检查，并在混合精度训练时观察 NaN/Inf。",
    ],
    tuning: [
      "梯度爆炸时先查学习率，再考虑 gradient clipping。",
      "深层网络梯度消失时检查 activation、初始化、normalization 与残差连接。",
      "记录每层梯度范数；前层几乎为零查饱和与长链，个别层剧烈尖峰查 loss 尺度和学习率。",
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
    mechanicsSteps: [
      "前向计算图记录每个算子及求局部导数需要的中间张量。",
      "从标量 loss 开始设定输出梯度，按链式法则反向传播到各层输入。",
      "一条参数路径上的局部导数相乘，多条汇入路径的梯度相加，得到每个参数的 ∂L/∂θ。",
      "在 optimizer step 前清理或有意累积梯度；检查梯度范数、数值有限性和参数是否真的更新。",
    ],
    limits: [
      "离散采样或硬选择通常没有普通可用梯度，需要 surrogate、重参数化或策略梯度等办法。",
      "长链乘法可能使梯度消失或爆炸；深网络需配合初始化、归一化、残差或 clipping。",
    ],
    settings: [
      {
        name: "梯度清零",
        start:
          "每次独立更新前调用 zero_grad；仅在有意 gradient accumulation 时延后。",
        adjust: "梯度异常变大先排查意外累加和 loss 的 reduction。",
      },
      {
        name: "累积步数",
        start: "显存不足时把多个 micro-batch 的梯度累积成一个有效 batch。",
        adjust:
          "改变累积步数后同步检查 loss 缩放、学习率计划与 optimizer step 计数。",
      },
      {
        name: "梯度裁剪",
        start: "先监控梯度范数；只有出现尖峰或爆炸时再设置 norm clipping。",
        adjust: "频繁触发裁剪通常提示学习率、初始化或数值稳定性需要一起检查。",
      },
    ],
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
      "先用少量 batch 观察 loss 是否单调趋势下降；若第一步即 NaN，检查数据尺度、loss 和学习率。",
    ],
    tuning: [
      "学习率通常按对数尺度尝试，例如相邻候选相差约 3 倍。",
      "batch 变大常需重调学习率，不能照搬旧配置。",
      "改变 batch 或梯度累积时记录实际 optimizer step 数；同样 epoch 数不代表同样的更新预算。",
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
    mechanicsSteps: [
      "从一个 batch 计算当前参数的 loss 和梯度，确认梯度指向局部上升方向。",
      "SGD 按参数减去学习率乘梯度；mini-batch 让每次更新只用部分样本，带来计算效率和随机性。",
      "可用 momentum 累积近期方向，减少来回震荡；学习率调度决定训练后期步幅。",
      "每个 epoch 检查训练/验证曲线和梯度尺度，选择停止点而不是只追求训练 loss 最低。",
    ],
    limits: [
      "梯度只给局部方向，无法保证非凸深网络找到全局最优。",
      "若参数不可微或目标反馈只能从环境中采样，普通 SGD 不能直接提供所需梯度。",
    ],
    settings: [
      {
        name: "学习率",
        start: "在短跑实验中对数尺度扫描，选 loss 能稳定下降且速度合理的区间。",
        adjust: "发散、振荡就减小；稳定但进展太慢可提高或检查梯度是否过小。",
      },
      {
        name: "batch size",
        start:
          "从显存能容纳且吞吐稳定的大小开始，记录有效 batch 与每步样本数。",
        adjust:
          "增大 batch 后需重新检查学习率和泛化；过小导致估计噪声大可用累积。",
      },
      {
        name: "momentum/调度",
        start: "先用固定学习率 baseline，再比较 momentum 与逐步衰减。",
        adjust:
          "谷底附近反复摆动时加 momentum 或降低后期学习率；不要只凭训练速度判优。",
      },
    ],
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
      "核对参数组、scheduler.step 与 optimizer.step 的顺序，并保存 optimizer 状态以便真正恢复训练。",
    ],
    tuning: [
      "优先调 learning rate；再看 weight decay 对验证集的影响。",
      "出现不稳定时检查 warmup、batch size、梯度裁剪和 mixed precision。",
      "把 weight decay 与 L2 loss penalty 分开记录；两者在 Adam 的自适应更新中不等价。",
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
    mechanicsSteps: [
      "用当前梯度更新一阶动量 m 和二阶平方梯度估计 v，并对早期偏差做校正。",
      "对每个参数按 m/(√v+ε) 做自适应尺度更新，使不同梯度量级的参数获得不同步幅。",
      "另行执行 decoupled weight decay，不把它混入自适应梯度项；常对 bias 和归一化参数分组处理。",
      "随训练预算使用 warmup 与衰减调度，并以验证曲线检查学习率、衰减和收敛稳定性。",
    ],
    limits: [
      "AdamW 不是免调学习率的优化器；过大学习率仍会发散，权重衰减过强会欠拟合。",
      "与 SGD 的优劣依赖任务和训练配方，不能凭训练 loss 较快下降就认定泛化更好。",
    ],
    settings: [
      {
        name: "learning rate",
        start: "从所用模型或官方 checkpoint 的推荐配方起，再做短程扫描。",
        adjust:
          "loss 抖动或下游性能退化时降低；稳定但学习缓慢时检查 warmup 和任务头。",
      },
      {
        name: "weight decay",
        start:
          "先按权重与 bias/normalization 分组，使用可复现的默认值作为起点。",
        adjust:
          "训练与验证都差时减弱；训练好但验证差时可增加并对照其他正则化。",
      },
      {
        name: "β₁/β₂、ε",
        start: "优先保留框架或原配方默认值，先调学习率与衰减。",
        adjust: "梯度噪声或数值不稳时才检查动量时间尺度与 ε，并一次只改一项。",
      },
    ],
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
      "把每项正则化作为独立实验记录，不同时改增强、学习率和模型容量，才能判断因果。",
    ],
    tuning: [
      "weight decay 从小值起按数量级搜索；过强会造成欠拟合。",
      "dropout rate 需按模型和数据验证，切勿直接套用一个固定数字。",
      "先找训练/验证间隙再调正则强度；间隙变小但两边指标都差，不代表模型改善。",
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
    mechanicsSteps: [
      "先用相同数据切分训练一个不加复杂正则的 baseline，比较训练与验证误差。",
      "依据过拟合来源选择手段：数据增强改变输入分布，weight decay 限制权重，dropout 随机屏蔽部分表示。",
      "在训练阶段应用随机扰动；验证与推理切到 eval 模式，并保持预处理一致。",
      "逐项增加约束，观察训练误差、验证误差与校准变化，用 early stopping 保存验证最好的 checkpoint。",
    ],
    limits: [
      "训练和验证都表现差时通常先处理欠拟合、标签错误或优化问题，盲目加正则会更差。",
      "数据增强必须保留标签语义；如左右翻转会改变标签，就不能作为无条件增强。",
    ],
    settings: [
      {
        name: "weight decay",
        start: "从优化器和架构的既有配方起，并记录参数组。",
        adjust: "验证过拟合而训练拟合良好时适度增强；两边都欠拟合则减弱。",
      },
      {
        name: "dropout",
        start: "先不用或用轻度 dropout，确认确有过拟合再增加。",
        adjust:
          "训练 loss 上升过多或验证不改善时降低；推理前确认模型处于 eval 模式。",
      },
      {
        name: "early stopping",
        start: "预先确定验证指标和耐心窗口，保存最佳 checkpoint。",
        adjust: "验证曲线噪声大时延长窗口并跨随机种子复核，避免挑到偶然峰值。",
      },
    ],
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
      "把数据切分随机种子、去重规则、预处理拟合范围和指标定义写入实验记录。",
    ],
    tuning: [
      "不平衡分类别只看 accuracy，依据成本选择阈值。",
      "比较模型时固定数据切分并报告多个随机种子或置信区间。",
      "多次试验后测试集也会被间接调参污染；若已反复使用它，应重新留出真正未触碰的数据。",
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
    mechanicsSteps: [
      "先定义任务单位和部署场景，再按病人、用户、时间或设备等独立单位划分数据。",
      "只在训练集拟合标准化、词表和特征选择；验证集用于选模型、阈值与超参数。",
      "按错误代价选择指标，例如不平衡分类查看 per-class precision/recall，回归查看误差分布。",
      "固定最终方案后只在保留测试集评估一次，并报告置信区间、子群表现和实际延迟。",
    ],
    limits: [
      "随机切分不能代表时间漂移、跨机构或同一主体重复样本的部署情境。",
      "单一平均指标不能揭示少数类、关键子群或高代价错误；需要分层和错误分析。",
    ],
    settings: [
      {
        name: "数据切分",
        start: "按实际独立单位切分，保留训练、验证和最终测试三个角色。",
        adjust: "验证明显优于外部测试时检查主体泄漏、时间漂移与采样偏差。",
      },
      {
        name: "主指标",
        start: "事先选与错误成本一致的主指标，并同时报告辅助指标。",
        adjust:
          "只靠准确率掩盖少数类失败时改看 macro/per-class 指标与混淆矩阵。",
      },
      {
        name: "阈值与置信度",
        start: "用验证集选阈值，保留测试集作最终报告。",
        adjust: "召回不足可下调阈值并检查精度代价；概率需可信时做校准评估。",
      },
    ],
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
      "先检查数据维度、颜色通道、归一化均值方差和 train/eval 行为，再比较简单 CNN 与预训练 backbone。",
    ],
    tuning: [
      "Kernel size 控制局部视野；stride 控制下采样速度。",
      "小数据优先迁移学习，再考虑从零增大网络。",
      "报告准确率之外的参数量、显存、推理延迟与小目标错误，避免只凭单一分数选架构。",
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
    mechanicsSteps: [
      "把图像组织为通道与空间维度；卷积核在每个位置复用同一组权重，提取局部边缘和纹理。",
      "非线性与归一化处理特征，逐层堆叠使感受野扩大并组合成更抽象的形状。",
      "下采样降低空间分辨率、增加语义抽象；分类头汇总特征，分割任务则需恢复像素位置。",
      "以训练集增强后的图像计算任务 loss，验证时使用固定预处理并检查尺度、旋转等分布变化。",
    ],
    limits: [
      "标准卷积主要利用局部与平移共享先验，远距离关系可能需要更深层、多尺度结构或注意力。",
      "对不具备网格邻接关系的数据，强行卷积可能引入错误先验；图或集合模型更合适。",
    ],
    settings: [
      {
        name: "输入分辨率",
        start:
          "从目标能被看清、显存可承受的分辨率开始，保持训练与推理规则一致。",
        adjust:
          "小目标漏检时提高分辨率或用局部裁剪；吞吐不足时降低并重新评估。",
      },
      {
        name: "kernel/stride",
        start: "先用成熟 backbone 的卷积和下采样配置，不急于自定义。",
        adjust:
          "细节丢失过早时减小 stride；需要更大上下文时增加层级或多尺度分支。",
      },
      {
        name: "预训练与增强",
        start: "标注不多先加载同任务域附近的预训练权重，采用保持标签的增强。",
        adjust: "训练好验证差时检查增强和域偏移；增强伤害语义时立即收窄。",
      },
    ],
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
      "实际训练时绘制浅层 CNN 与残差网络的训练损失：若更深网络训练误差反而更高，先排查优化和捷径实现。",
    ],
    tuning: [
      "优先比较模型深度、宽度和输入分辨率对收益与成本的影响。",
      "BatchNorm 在小 batch 下统计可能不稳，可考虑其他 normalization。",
      "更深模型的训练误差降低但验证下降时，不要继续加深；对照数据增强、weight decay 与模型宽度。",
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
    mechanicsSteps: [
      "输入 x 进入卷积残差分支 F(x)：基础块通常堆叠卷积、归一化与激活，bottleneck 用 1×1、3×3、1×1 控制通道成本。",
      "捷径分支保留 x；若空间分辨率或通道数改变，用 stride 与 projection 让捷径输出与 F(x) 形状匹配。",
      "逐元素相加得到 y=F(x)+shortcut(x)，再按所选 block 版本放置激活；这条加法提供信息和梯度的直接通路。",
      "堆叠不同分辨率的 stage，接任务头训练；比较不同深度、宽度的训练误差、验证指标、延迟与显存。",
    ],
    limits: [
      "残差连接缓解深网络优化退化，不保证数据少时不会过拟合；泛化差应检查数据、增强与正则。",
      "极小 batch 使 BatchNorm 统计不稳时，原始配方可能失效；可冻结统计量或比较其他归一化。",
    ],
    settings: [
      {
        name: "深度 / block 数",
        start: "先选成熟的较浅 ResNet 作为基线，记录训练和验证误差。",
        adjust:
          "训练仍欠拟合且算力允许时加深；训练提升而验证不升时优先增数据或正则。",
      },
      {
        name: "宽度与输入分辨率",
        start: "按任务目标尺寸和延迟预算选通道宽度与图像尺寸。",
        adjust:
          "小目标丢失时先提高分辨率；推理超预算时降低分辨率或宽度并测目标召回。",
      },
      {
        name: "shortcut / normalization",
        start: "下采样处明确使用 projection，先沿用经验证的归一化配置。",
        adjust:
          "加法形状报错时核查 stride 与通道；小批量统计抖动时试冻结 BN 或其他归一化。",
      },
    ],
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
      "在验证集按时间顺序回放真实输入，确保模型的状态重置与线上流式推理一致。",
    ],
    tuning: [
      "截断 BPTT 限制梯度回溯长度与训练内存；若跨片段传递 hidden state，前向计算仍可携带更早的信息，只是梯度不会跨截断边界传播。",
      "梯度裁剪可缓解爆炸；过长依赖可尝试门控单元。",
      "短期预测好、较远 horizon 急剧恶化时，检查可见窗口与梯度回溯长度，再比较 GRU/LSTM。",
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
    mechanicsSteps: [
      "按时间顺序把序列切成有效长度的窗口，初始化 h₀，并明确独立样本之间是否应重置状态。",
      "每个时间步复用同一组 Wₓ、Wₕ，把当前输入 xₜ 与旧状态 hₜ₋₁ 合成 hₜ，再由输出头产生预测。",
      "训练时把递推计算沿时间展开，用 BPTT 把损失梯度从后往前传；截断 BPTT 时在窗口边界 detach 状态。",
      "用验证集比较不同历史长度与预测 horizon，同时检查梯度范数、误差随时间跨度的变化和在线延迟。",
    ],
    limits: [
      "基本 tanh RNN 的长距离梯度容易消失或爆炸；若需要稳定长依赖，先比较 GRU/LSTM 或 attention。",
      "同一步之后必须等待上一步 hidden state，时间维并行性有限；超长批量训练可能不如并行架构。",
    ],
    settings: [
      {
        name: "hidden size",
        start: "从可满足训练预算的小状态维度开始。",
        adjust: "训练与验证都欠拟合时增大；训练好但验证差或延迟过高时减小。",
      },
      {
        name: "窗口与 BPTT 长度",
        start: "设为业务上可获得的历史，并明确是否跨窗口携带但 detach 状态。",
        adjust:
          "远期信号学不到时延长回溯或换门控/attention；显存超预算时缩短。",
      },
      {
        name: "梯度裁剪",
        start: "记录梯度范数后按实际分布设置裁剪阈值。",
        adjust:
          "损失突然爆炸时收紧并查学习率；梯度长期被裁剪时放宽或降学习率。",
      },
    ],
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
      "上线前逐条模拟时间递增的数据流，检查预测时没有看见未来窗口或提前使用后验特征。",
    ],
    tuning: [
      "hidden size 和层数增加容量，也增加过拟合与延迟。",
      "若长序列不稳定，检查梯度裁剪、初始化与窗口长度。",
      "训练 loss 下降而部署回放失真时，先检查 teacher forcing、双向层、窗口边界和状态重置。",
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
    mechanicsSteps: [
      "把 xₜ 与上一时刻状态组合，经 sigmoid 计算门值；LSTM 有输入、遗忘、输出门，GRU 有更新、重置门。",
      "LSTM 用遗忘门保留旧 cₜ₋₁、输入门写入候选状态，再由输出门得到 hₜ；GRU 用更新门在旧状态与候选状态间插值。",
      "沿时间展开训练，使用 padding mask 或 pack 变长序列，按任务决定只读最后状态还是读每一步输出。",
      "按时间或实体正确切分验证，比较 GRU 与 LSTM 的误差、长 horizon 表现、参数数和逐步推理延迟。",
    ],
    limits: [
      "门控缓解梯度问题，不代表无限记忆；跨很长时间间隔的依赖仍可能难学。",
      "双向 LSTM/GRU 会读取未来位置，实时预测或严格因果任务不能在部署时直接使用。",
    ],
    settings: [
      {
        name: "GRU 或 LSTM",
        start: "先用参数较少的 GRU 建立可比较基线。",
        adjust:
          "验证中长期依赖或状态表达不足时试 LSTM；若收益小且延迟高则保留 GRU。",
      },
      {
        name: "hidden size / 层数",
        start: "从单层与可承受的小 hidden size 起步。",
        adjust: "训练欠拟合时增大；训练验证差距变大时减小或加 dropout。",
      },
      {
        name: "窗口长度 / 裁剪",
        start: "覆盖可用于预测的真实历史，并记录每段有效长度。",
        adjust:
          "远期指标差时增历史或用 attention；显存/延迟过高时缩短并检查损失。",
      },
    ],
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
      "用一个人工序列验证 causal mask：修改未来 token 后，较早位置的输出应保持不变。",
    ],
    tuning: [
      "Heads 增加不同表示子空间，但更多头不保证更好。",
      "Dense attention 的 token 配对计算随序列长度平方增长；朴素实现还会存平方大小的权重矩阵。FlashAttention 等精确算法避免显式存下整张矩阵，降低显存与读写成本，但不消除密集配对计算。",
      "训练准确率意外接近满分但线上生成差时，优先排查 causal mask 与 target shift 泄漏。",
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
    mechanicsSteps: [
      "把输入表示投影为 Q、K、V；self-attention 三者来自同一序列，cross-attention 的 Q 与 K/V 来自不同序列。",
      "对每个 query 与所有允许的 key 做点积，按 √dₖ 缩放分数，并在 softmax 前给 padding 或未来位置加不可见 mask。",
      "对 key 位置做 softmax 得到权重，再对对应 value 求加权和；多头版本并行计算多个投影并合并。",
      "核查张量形状与 mask 的广播方向，用合成样本测试被遮位置的权重为零，再评估真实任务与显存。",
    ],
    limits: [
      "标准密集 self-attention 的 token 两两交互随长度平方增长；长序列应核查实际计算与显存预算。",
      "高注意力权重只是模型内部混合系数，不足以证明因果解释或输入证据可靠。",
    ],
    settings: [
      {
        name: "mask 类型",
        start:
          "分类编码器用 padding mask；自回归解码器同时用 causal 与 padding mask。",
        adjust:
          "验证异常高分或未来泄漏时先测试 mask；输出忽略有效 token 时查遮挡方向。",
      },
      {
        name: "head 数与每头维度",
        start: "从成熟架构的总宽度与 head 划分开始。",
        adjust:
          "算力增加但指标不升时减少 head；表达不足时在固定预算下比较宽度和 head 数。",
      },
      {
        name: "序列长度 / attention 范围",
        start: "先用能覆盖关键证据的最短上下文。",
        adjust:
          "证据被截断时加长或分块；显存超预算时比较局部/稀疏或精确省内存实现。",
      },
    ],
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
      "针对任务写出一张 token 可见性表，再用单元样本核对 mask 与位置编码的实现。",
    ],
    tuning: [
      "层数、宽度、head 数、上下文长度一起决定容量与成本。",
      "学习率、warmup、weight decay 与 batch size 对稳定训练很关键。",
      "加长 context 后指标不升但显存翻倍时，检查证据是否真正跨长距离，再比较分块方案。",
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
    mechanicsSteps: [
      "把 token 映射到向量并加入位置表示；没有位置表示的纯 self-attention 无法区分输入排列。",
      "在每个 block 中计算多头 self-attention，让各 token 交换信息，再经逐位置 MLP 变换通道；两段都配残差与归一化。",
      "按任务选可见性：双向 encoder、因果 decoder，或加 cross-attention 的 encoder–decoder；构造对应的 padding/causal mask。",
      "根据下游任务接分类、序列标注或生成头，训练时监测梯度、验证指标和随长度变化的显存/延迟。",
    ],
    limits: [
      "标准密集注意力的计算随长度平方增长；极长上下文必须考虑分块、高效 kernel 或替代结构的成本。",
      "小数据从零训练深 Transformer 常过拟合或不稳定；优先比较预训练模型或较小架构。",
    ],
    settings: [
      {
        name: "层数 / hidden width",
        start: "从预训练模型或成熟小型配置起步，并记录训练验证差距。",
        adjust: "训练欠拟合再增容量；验证变差或延迟超预算时缩小或加强正则。",
      },
      {
        name: "上下文长度 / 位置表示",
        start: "按证据跨度与显存预算设置，并测试超过训练长度的输入处理。",
        adjust:
          "关键内容被截断时分块或延长；显存暴涨时用高效 attention 或缩短。",
      },
      {
        name: "学习率与 warmup",
        start: "先沿用所选架构的可信优化配方并记录梯度。",
        adjust:
          "初期损失抖动或发散时降峰值学习率或延长 warmup；长期欠拟合时检查优化强度。",
      },
    ],
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
      "用验证集检查短句、长句与领域术语的错误差异，先修正 tokenizer/截断，再扩大模型。",
    ],
    tuning: [
      "小数据先试冻结 backbone，只训练 head；再与完整微调比较。",
      "长文本注意截断策略，重要证据不能被截掉。",
      "训练分类准确但检索 Recall@K 低时，检查句向量是否经过相似度目标训练，而非继续调分类头。",
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
    mechanicsSteps: [
      "用与预训练模型匹配的 tokenizer 把完整输入变成 token、attention mask 和必要的特殊 token。",
      "双向 self-attention 在每层让有效位置读取左右上下文，得到各 token 的上下文表示。",
      "按任务选择头：句级分类用合适 pooled 表示，实体识别对每个 token 分类；语义检索另用配对目标训练句向量。",
      "在领域与长度匹配的数据上冻结或微调 encoder，检查截断、每类错误和独立测试集迁移表现。",
    ],
    limits: [
      "双向 encoder 训练时可以看完整输入，因此不能直接用作严格下一 token 因果生成器。",
      "未经相似度目标训练的 pooled embedding 不保证适合检索；应跑检索验证或使用专门句向量模型。",
    ],
    settings: [
      {
        name: "最大输入长度 / 截断",
        start: "按样本长度分布与证据位置设置，并保留特殊 token。",
        adjust:
          "长文档重要片段被截断时用分块、滑窗或更长模型；显存超标时缩短。",
      },
      {
        name: "冻结范围 / 学习率",
        start: "标注少时先冻结 encoder 训练头作基线。",
        adjust:
          "任务域差距大且验证可提升时逐步解冻；训练好验证差时缩小学习率或冻结更多层。",
      },
      {
        name: "pooling 与检索目标",
        start: "分类用模型推荐的 pooled 表示；检索先试经配对训练的 embedding。",
        adjust:
          "句向量近邻不符合语义时换 pooling 或用对比学习微调，不只调相似度阈值。",
      },
    ],
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
      "用固定提示集分别测试 greedy 与采样解码，并记录长度、错误类型和 token 成本。",
    ],
    tuning: [
      "Temperature 降低通常让分布更集中；top-p 限制累计概率范围。",
      "长对话注意上下文预算、延迟、KV cache 显存。",
      "生成结果随机性过高时先固定 seed 与 sampling 参数；事实错误持续存在时检查检索和数据，别只降 temperature。",
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
    mechanicsSteps: [
      "把文本 token 化，将前缀作为输入、下一 token 作为目标右移一位；padding 位置不参与 loss。",
      "每层用 causal self-attention 只读当前位置及更早 token，再经 MLP 产生新 hidden state。",
      "训练时所有位置的 next-token loss 可并行计算；推理时逐 token 生成，用 KV cache 保存历史 key/value。",
      "按任务验证输出质量、事实性、停止率、长度和推理延迟，并分别调 sampling 与模型适配参数。",
    ],
    limits: [
      "自回归推理有顺序依赖，长输出带来延迟与 KV cache 显存成本。",
      "next-token likelihood 高不保证事实正确、遵循指令或安全；这些能力需要任务数据与独立评估。",
    ],
    settings: [
      {
        name: "temperature / top-p",
        start: "确定性任务先用较集中解码作为对照，再按多样性需求调。",
        adjust:
          "重复或过于保守时适度增加多样性；偏题或不稳定时降低并查 prompt。",
      },
      {
        name: "max_new_tokens / 停止条件",
        start: "按任务期望答案长度设置明确上限与 stop token。",
        adjust:
          "答案经常被截断时增加上限；无意义续写时改停止条件并检查训练格式。",
      },
      {
        name: "context / KV cache",
        start: "将输入长度、输出上限和并发数一起计入预算。",
        adjust:
          "显存或延迟超标时缩短历史、降低并发或采用缓存管理；关键证据丢失时改检索/摘要。",
      },
    ],
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
      "把同一批验证样本用 teacher-forced loss 和真实自回归解码都测一遍，检查两者差距。",
    ],
    tuning: [
      "Beam width 增大搜索范围，也增加推理成本，未必提升所有任务。",
      "长输入截断和长度惩罚会影响摘要的完整性。",
      "生成很流畅但丢关键事实时，优先核查 source 截断、cross-attention 可见性和忠实度指标。",
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
    mechanicsSteps: [
      "source tokenizer 处理输入，encoder 用双向注意力把所有有效源 token 编成 hidden states。",
      "训练时将目标序列右移，decoder 用 causal self-attention 读真实目标前缀，再通过 cross-attention 读取 encoder states。",
      "输出头预测下一目标 token，用 teacher forcing 计算交叉熵；padding 目标不计入 loss。",
      "推理时先编码源序列，再让 decoder 使用自身已生成前缀逐步解码，按任务比较 greedy、beam 或 sampling。",
    ],
    limits: [
      "训练用真实前缀、推理用自身输出，错误可能逐步累积；必须用真实自回归解码评估。",
      "长 source 与长 target 同时增加 cross-attention 和生成成本；极长文档应考虑分块或检索。",
    ],
    settings: [
      {
        name: "source / target 长度",
        start: "分别观察输入与输出的长度分布，设定可覆盖关键证据的上限。",
        adjust:
          "摘要遗漏源尾部信息时增 source 覆盖；输出常被截断时增 target 上限或改停止条件。",
      },
      {
        name: "beam width / 长度惩罚",
        start: "先用 greedy 建立质量与速度基线，再比较少量 beam。",
        adjust:
          "beam 增大但结果更短或更重复时调长度惩罚或改解码；延迟超标时缩窄。",
      },
      {
        name: "微调范围 / 学习率",
        start: "小数据优先用预训练 seq2seq 并从较轻的适配开始。",
        adjust:
          "领域术语漏译时扩大适配数据或微调范围；训练好验证差时降学习率或冻结更多层。",
      },
    ],
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
      "分别可视化原图、重建图和从先验采样的图；三者回答不同问题，不能只展示最好看的重建。",
    ],
    tuning: [
      "调 KL 权重 β，平衡重建精度与潜空间规则性。",
      "潜变量维度太小欠表达，太大可能使先验约束变弱。",
      "同时画重建项、KL 项及活跃潜维度；总 ELBO 下降但 KL 塌缩时需要检查表示是否仍有用。",
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
    mechanicsSteps: [
      "普通 autoencoder 用 encoder 把 x 压到 z，再用 decoder 重建 x；这只要求重建，不规定潜空间的概率形状。",
      "VAE 的 encoder 输出近似后验 qφ(z|x) 的分布参数，通常是均值和方差，而非单个固定编码。",
      "训练时用重参数化 z=μ+σ⊙ε 采样，使重建项和 KL(qφ(z|x)||p(z)) 都能通过梯度优化。",
      "生成时从先验 p(z) 采样送入 decoder；另用下游指标检查潜空间是否真的保留任务信息。",
    ],
    limits: [
      "只追求压缩或异常检测时，先比较普通 autoencoder；VAE 的概率约束会改变重建与表示的取舍。",
      "像素级重建分数高不代表生成样本更真实，也不能把重建误差直接当可靠异常概率。",
    ],
    settings: [
      {
        name: "latent dimension",
        start: "从能重建主要结构的小维度起，记录压缩率和样本质量。",
        adjust:
          "重建失真严重可加大；潜变量完全不被利用则先检查 decoder 容量与 KL。",
      },
      {
        name: "KL 权重",
        start: "先从标准 ELBO 起，分别监控 reconstruction 与 KL 两项。",
        adjust:
          "KL 迅速接近零可能是 posterior collapse；可试退火或调整 decoder，而非只追总 loss。",
      },
      {
        name: "decoder likelihood",
        start: "按数据类型选 Bernoulli、Gaussian 或其他合适的重建分布。",
        adjust: "生成模糊或误差尺度不合理时核对似然假设与输入预处理。",
      },
    ],
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
      "保存固定噪声种子的生成样本和随机采样样本；前者看训练轨迹，后者看覆盖范围。",
    ],
    tuning: [
      "G/D 学习率与更新频次影响平衡。",
      "正则化、归一化与判别器容量会影响稳定性。",
      "若生成样本只剩少数形态，优先排查模式崩塌与 D/G 失衡，不能把低生成器 loss 当作成功。",
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
    mechanicsSteps: [
      "从先验采样 z，生成器 G(z) 合成样本；判别器 D 同时观察真实和生成样本。",
      "更新判别器使它区分真伪，再在冻结或不更新判别器参数的条件下更新生成器。",
      "生成器通过判别器的梯度调整样本，使生成分布更难被区分；不同 GAN loss 改变梯度性质。",
      "训练过程中检查生成样本多样性、判别器状态与独立质量指标，避免只看两项 loss。",
    ],
    limits: [
      "训练数据少或分布模态很多时容易模式崩塌，需与扩散或自回归方法比较质量和覆盖率。",
      "GAN 采样快，但原始对抗目标不直接给每个样本可解释的 likelihood。",
    ],
    settings: [
      {
        name: "G/D 更新比",
        start:
          "先从所选论文或实现的平衡更新配方起，同时监控真伪判别与样本质量。",
        adjust:
          "D 过强使 G 梯度无效时调学习率/更新比；D 过弱时先查数据与架构。",
      },
      {
        name: "latent 与生成器",
        start: "先用成熟架构与固定输入分辨率，保存同一批 z 的进展图。",
        adjust: "细节缺失或多样性不足时查模型容量、输入分辨率和训练数据覆盖。",
      },
      {
        name: "稳定化手段",
        start: "从单一可靠 baseline 起，按需比较谱归一化、梯度惩罚或其他目标。",
        adjust:
          "loss 剧烈振荡、模式崩塌时一次只添加一项稳定化措施并重评多样性。",
      },
    ],
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
      "把训练用 scheduler、预测目标和推理 sampler 一起写入配置，复现实验时只换其中一个变量。",
    ],
    tuning: [
      "采样步数越少通常越快，但质量可能变化，需针对 sampler 验证。",
      "Guidance scale 控制条件遵循程度；过高可损害多样性或产生伪影。",
      "同时报告采样质量与延迟；只比较生成分数而忽略步数，会误判方法实际成本。",
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
    mechanicsSteps: [
      "选噪声日程，在训练时从真实 x₀ 随机抽时间步 t，直接构造对应噪声图 xₜ。",
      "去噪网络以 xₜ、t 和可选条件为输入，学习预测噪声、干净样本或其他等价参数化目标。",
      "采样时从噪声出发，按求解器逐步反向更新；条件 guidance 改变保真度与多样性取舍。",
      "用独立样本、分布指标和实际采样延迟评估，分别追踪训练目标与最终生成质量。",
    ],
    limits: [
      "需要极低延迟或严格少步生成时，先比较蒸馏、潜空间扩散或快速生成架构。",
      "去噪训练 loss 较低不保证生成多样性或语义正确；条件质量和数据偏差须单独检查。",
    ],
    settings: [
      {
        name: "噪声日程/预测目标",
        start:
          "沿用所选实现的 scheduler 与 ε/x₀/v 参数化，确认训练与采样匹配。",
        adjust: "高噪声或低噪声阶段失败时检查时间步采样、权重和目标尺度。",
      },
      {
        name: "采样步数/求解器",
        start: "从官方配方的步数和 sampler 建 baseline，记录单样本延迟。",
        adjust:
          "减少步数后质量下降就比较更合适求解器或蒸馏，而非单纯降低噪声。",
      },
      {
        name: "guidance 强度",
        start: "无条件或低 guidance 先看覆盖率，再逐步提高条件约束。",
        adjust:
          "提示更准但图像重复、失真或饱和时降低 guidance 并检查训练条件。",
      },
    ],
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
      "先用不看邻居的 MLP 和简单邻居平均作 baseline，证明图结构确实提供增量信息。",
    ],
    tuning: [
      "层数控制感受野，深层前先看是否过平滑。",
      "大图关注邻居采样与 batch 构造，避免内存爆炸。",
      "按节点度数和图大小分组评估；平均分数高也可能只对高连接节点有效。",
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
    mechanicsSteps: [
      "定义节点、边与各自特征，并明确任务是节点、边还是整图预测。",
      "每层把邻居表示变成消息，按 sum/mean/max 或注意力聚合，再与本节点状态更新。",
      "堆叠多层后扩大可达邻域；读出层将节点表示映射到标签或汇总成图表示。",
      "划分训练/验证时根据归纳或转导任务检查边与标签泄漏，并分析不同度数节点表现。",
    ],
    limits: [
      "若实体间没有可信的边，手工造图可能引入错误偏置；普通表格/集合模型可能更稳。",
      "层数增加可能导致 oversmoothing、oversquashing 或高邻居采样成本，不能无限加深。",
    ],
    settings: [
      {
        name: "消息传递层数",
        start: "从少层开始，使感受野覆盖任务所需的关系跳数。",
        adjust: "需要更远依赖再增加；表示趋同或验证变差时减少层数或加残差。",
      },
      {
        name: "聚合与邻居采样",
        start: "先试 mean/sum 以及任务允许的全邻居或固定采样。",
        adjust: "高度节点主导或显存超限时调整归一化、采样数及聚合规则。",
      },
      {
        name: "边与特征",
        start: "先验证边是否真实、方向/权重含义是否正确，再加入边特征。",
        adjust: "子群表现异常时查稀疏节点、错误边和训练/验证间信息泄漏。",
      },
    ],
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
      "先画 embedding 检索例子，验证‘近’和‘远’符合任务语义，再扩大自监督训练规模。",
    ],
    tuning: [
      "Temperature 控制相似度分布尖锐程度。",
      "Batch 或 memory bank 影响负例数量，但更多负例也可能带来 false negatives。",
      "投影头上的 loss 改善不等于 encoder 表示更有用；始终用下游任务和检索评估选配置。",
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
    mechanicsSteps: [
      "依据任务定义哪些视图或样本应表示同一语义，构造 positive pair；其他样本可能作为 negatives。",
      "Encoder 把视图映射为表示，常在投影头输出上计算相似度与对比目标。",
      "InfoNCE 等目标提高正例相似度、降低与负例的相对相似度；温度控制 softmax 的区分强度。",
      "训练后在冻结表示的线性 probe、检索或下游微调上评估，检查学到的不是增强伪线索。",
    ],
    limits: [
      "把语义相同样本误作负例会伤害表示，类别密集或 batch 组成特殊时尤需关注。",
      "增强若改变真正标签，模型会被迫忽略有用信息；少标签场景可比较监督对比或重建式方法。",
    ],
    settings: [
      {
        name: "正例与增强",
        start: "先定义任务允许的不变性，再从保留语义的弱增强开始。",
        adjust: "下游精度下降或难例被混淆时检查增强是否抹掉关键属性。",
      },
      {
        name: "温度 temperature",
        start: "从所用论文/实现配方起，观察相似度分布与训练稳定性。",
        adjust: "正负例区分过软或梯度过尖时调温度，并重新比较检索指标。",
      },
      {
        name: "负例来源",
        start: "先明确 batch 内、队列或标签构造的负例，再记录有效负例数量。",
        adjust: "假负例多或 batch 受限时考虑 MoCo、BYOL、VICReg 等替代目标。",
      },
    ],
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
      "保存基础模型版本、adapter 权重、tokenizer/processor 和目标模块配置，推理时核对全部组合。",
    ],
    tuning: [
      "LoRA rank r 控制更新容量；α 控制更新缩放。",
      "微调学习率通常与从零训练不同，需小范围搜索并关注遗忘。",
      "报告可训练参数、峰值显存、训练时间与最终质量；LoRA 的优势依赖实际资源瓶颈。",
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
    mechanicsSteps: [
      "确定目标任务、数据量与与预训练域的差异，选择冻结特征、部分微调、全量微调或 LoRA。",
      "LoRA 冻结原矩阵 W，在选定线性层旁学习低秩增量 ΔW=BA；前向传播使用 W+缩放后的 ΔW。",
      "只把 adapter 参数交给优化器，核对可训练参数比例、checkpoint 与 tokenizer/processor 一致性。",
      "用独立验证集比较 adapter、全量微调和简单任务头的效果、显存与推理延迟。",
    ],
    limits: [
      "预训练权重与领域差异过大或模型缺乏任务知识时，小 adapter 未必足够。",
      "训练参数少不代表推理计算一定更少；多 adapter 管理也会带来部署复杂度。",
    ],
    settings: [
      {
        name: "目标模块",
        start: "从所用架构的注意力投影或官方 LoRA 配方起，核对模块名。",
        adjust: "欠拟合时再覆盖更多层或 MLP；显存、过拟合问题则收窄范围。",
      },
      {
        name: "rank 与 scaling",
        start: "从低 rank baseline 开始，同时记录 adapter 参数量。",
        adjust:
          "训练与验证都欠拟合时增大 rank；只训练好验证差时检查数据和正则。",
      },
      {
        name: "学习率与冻结范围",
        start: "按 adapter 微调配方设独立学习率，先确认基础权重确实冻结。",
        adjust:
          "输出退化或不稳定时降低学习率；迁移不足时比较部分解冻或全量微调。",
      },
    ],
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
      "先用一个很小、可调试的环境核对终止、截断与奖励累计，再上真实任务或大规模模拟器。",
    ],
    tuning: [
      "折扣因子 γ 控制未来回报权重；奖励尺度影响训练稳定性。",
      "探索强度、replay buffer 与 target network 更新频率需配合环境调。",
      "训练回报与评估回报分开记录；训练中带探索的策略和部署时策略可能不同。",
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
    mechanicsSteps: [
      "明确状态 s、可选动作 a、奖励 r、转移和 episode 终止；确认动作如何改变未来状态。",
      "策略与环境交互收集轨迹，或从已有固定轨迹学习；区分数据是当前策略产生还是历史策略产生。",
      "价值方法估计长期回报，策略方法直接优化动作分布，actor-critic 结合两者；折扣 γ 决定未来奖励权重。",
      "按完整 episode 的回报、失败率、方差与安全约束评估，跨随机种子和环境变化复核。",
    ],
    limits: [
      "没有可靠模拟器或交互成本很高时，先考虑行为克隆和 offline RL，并承认离线评估的不确定性。",
      "reward 容易被钻空子；长期满意度不能被单一可观测点击或即时得分完全代表。",
    ],
    settings: [
      {
        name: "折扣 γ",
        start: "依据真正关心的决策时间跨度选取，并检查有效 horizon。",
        adjust:
          "策略过于短视可提高未来权重；回报估计方差过大或长轨迹不可靠时重新权衡。",
      },
      {
        name: "探索机制",
        start:
          "先设可复现的随机或启发式 baseline，再按算法加入 ε、entropy 或动作噪声。",
        adjust:
          "过早只重复少数动作时加强探索；危险动作过多时收紧约束并检查奖励设计。",
      },
      {
        name: "评估预算",
        start: "预定训练步数、随机种子和评估 episode 数，记录平均与尾部回报。",
        adjust: "回报波动大时增加种子和置信区间，避免挑单次最好表现。",
      },
    ],
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
      "在相同训练 token、激活计算和硬件条件下与 dense baseline 对照，避免总参数不同造成假结论。",
    ],
    tuning: [
      "Expert 数、top-k、capacity factor 共同影响负载和计算。",
      "负载均衡辅助损失过弱会专家塌缩，过强也可能压制任务目标。",
      "监控单 expert 负载、通信等待和溢出率；训练 loss 正常下降也可能隐藏严重路由失衡。",
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
    mechanicsSteps: [
      "共享层先处理 token，router 为每个 token 计算 expert 分数并选择 top-k expert。",
      "被选中的 expert 各自执行前馈变换，输出按 router 权重合并；未选 expert 不参与该 token 的主要计算。",
      "训练时同时优化任务 loss 与负载均衡约束，并处理 expert 容量与可能的 token overflow。",
      "评估时分别报告总参数、每 token 激活参数、通信开销、吞吐与质量，而非只报模型大小。",
    ],
    limits: [
      "小规模或低延迟单设备任务可能被通信和路由成本拖累，dense 模型更简单。",
      "参数量增大不保证所有任务更好；expert 塌缩或容量溢出会浪费参数并伤害质量。",
    ],
    settings: [
      {
        name: "expert 数与 top-k",
        start:
          "从可测量的 dense baseline 出发，用少量 expert 和小 top-k 验证收益。",
        adjust: "质量不足且负载均匀时增加容量；通信或延迟偏高时减小激活数。",
      },
      {
        name: "capacity factor",
        start: "先沿用实现推荐值，并监控每个 expert 的 token 数和被丢弃数量。",
        adjust:
          "overflow 较多时增大容量或改善路由；内存过高则权衡吞吐与丢弃率。",
      },
      {
        name: "负载均衡权重",
        start: "先记录不加或默认权重时的路由分布，再小范围调整。",
        adjust: "少数 expert 独占时加强；过强导致任务质量变差时减弱。",
      },
    ],
    compareTo: ["transformer", "decoder-models"],
  },
];

export const lessons: Lesson[] = [
  ...coreLessons,
  ...classicalRepresentationLessons,
  ...visionLanguageLessons,
  ...rlLessons,
  ...learningConceptLessons,
  ...dataConceptLessons,
].sort(
  (a, b) =>
    categories.findIndex((category) => category.id === a.category) -
    categories.findIndex((category) => category.id === b.category),
);
