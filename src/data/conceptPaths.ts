export type ConceptPath = {
  id: string;
  title: string;
  description: string;
  steps: { lessonId: string; why: string }[];
};

/**
 * Short routes through existing model lessons and the concept lessons.
 * A step explains why the next idea belongs in the same learning journey.
 */
export const conceptPaths: ConceptPath[] = [
  {
    id: "language-model-pipeline",
    title: "语言模型：从文本到可靠应用",
    description:
      "串起 tokenizer、位置、prefill/decode、KV/GQA，再比较 prompting、RAG 与微调，最后用独立评估闭环；到实践工坊可交互计算显存与张量形状。",
    steps: [
      {
        lessonId: "tokenization",
        why: "文本先变成 token IDs；长度、词表和特殊 token 影响后续所有预算。",
      },
      {
        lessonId: "positional-encoding",
        why: "位置编码告诉 attention token 的顺序；认识绝对位置与 RoPE 的差异。",
      },
      {
        lessonId: "autoregressive-inference",
        why: "分开并行读取 prompt 的 prefill 与逐 token 的 decode，理解首 token 延迟。",
      },
      {
        lessonId: "kv-cache",
        why: "跟踪每一层 K/V 的形状与增长，避免把缓存显存误当总显存。",
      },
      {
        lessonId: "grouped-query-attention",
        why: "多个 query heads 共享 K/V，连接架构选择与缓存预算。",
      },
      {
        lessonId: "in-context-learning",
        why: "先用明确指令、模板和少量示例建立 prompt baseline，不更新模型权重。",
      },
      {
        lessonId: "retrieval-augmented-generation",
        why: "当答案依赖可更新资料时，检索证据，并分别检查召回与生成忠实度。",
      },
      {
        lessonId: "transfer-lora",
        why: "任务行为需要稳定适配时再比较微调，控制数据、冻结范围和训练预算。",
      },
      {
        lessonId: "language-model-evaluation",
        why: "用固定测试集、切片、生成设置与成本指标，验证这条工作链是否满足目标。",
      },
    ],
  },
  {
    id: "stable-training",
    title: "训练为何会稳定，也为何会崩",
    description:
      "从梯度到 normalization、学习率、裁剪与混合精度，按统计量和更新过程逐项定位训练问题。",
    steps: [
      {
        lessonId: "backpropagation",
        why: "先确认 loss 的梯度确实流到需要更新的参数。",
      },
      {
        lessonId: "batch-normalization",
        why: "查看 batch/channel 统计和 running statistics，理解 train/eval 的差异。",
      },
      {
        lessonId: "layer-normalization",
        why: "切换统计轴，理解为什么序列模型常使用每 token 的特征归一化。",
      },
      {
        lessonId: "learning-rate-schedules",
        why: "把学习率画成训练步数的函数，区分 warmup 与衰减。",
      },
      {
        lessonId: "gradient-clipping",
        why: "观察原始 norm 和更新量，再决定如何限制异常梯度。",
      },
      {
        lessonId: "mixed-precision",
        why: "最后引入精度和 scaling，掌握 unscale → clip → step 的顺序与 NaN 排查。",
      },
    ],
  },
  {
    id: "generative-trajectories",
    title: "生成模型的路径：噪声、潜空间与速度场",
    description:
      "用同一视角比较随机反向过程、DDIM 路径、latent 空间与 flow matching 的向量场，区分训练目标和采样器。",
    steps: [
      {
        lessonId: "diffusion",
        why: "先建立逐步破坏与逐步恢复数据的整体直觉。",
      },
      {
        lessonId: "ddpm",
        why: "看清前向加噪、噪声预测与随机反向采样的每个量。",
      },
      {
        lessonId: "ddim",
        why: "保持训练目标，修改生成轨迹与跳步设置，比较确定性和随机性。",
      },
      {
        lessonId: "autoencoder-vae",
        why: "理解把高维图像压到有结构的 latent space 会保留和丢失什么。",
      },
      {
        lessonId: "latent-diffusion",
        why: "把去噪计算搬到 latent 空间，代价从分辨率、压缩率与重建质量共同产生。",
      },
      {
        lessonId: "flow-matching",
        why: "改为拟合条件速度，比较 ODE 积分的步数、误差与生成质量。",
      },
    ],
  },
  {
    id: "structured-model-selection",
    title: "表格、图与时间：先看数据结构",
    description:
      "把树、图聚合与时间序列方法放回数据结构和部署目标；比较何时需要邻域、归纳能力或时间回测。",
    steps: [
      {
        lessonId: "random-forest",
        why: "用 bagging 树建立表格基线，明确与 boosting 的差异。",
      },
      {
        lessonId: "xgboost",
        why: "逐轮拟合梯度并正则化叶节点，学习如何调深度、学习率和轮数。",
      },
      {
        lessonId: "gnn",
        why: "只有关系真正携带任务信息时，再把样本组织成图。",
      },
      { lessonId: "gcn", why: "先从带自环的归一化邻域聚合理解消息传递。" },
      {
        lessonId: "graphsage",
        why: "采样邻域、学习聚合函数，为未见过的新节点生成表示。",
      },
      {
        lessonId: "gat",
        why: "再让不同邻居拥有可学习权重，同时留意 softmax 邻域与开销。",
      },
      {
        lessonId: "time-series-forecasting",
        why: "当预测目标在未来，用 horizon、季节基线与滚动回测重新定义验证。",
      },
    ],
  },
  {
    id: "two-kinds-of-heads",
    title: "Head 到底指什么？",
    description:
      "从 backbone 的特征走到任务输出，再进入 Transformer 的 multi-head attention；分清 prediction head 与 attention head 两种不同层次的部件。",
    steps: [
      {
        lessonId: "neural-networks",
        why: "先看线性层怎样把中间表示映射到 logits 或数值，理解 task head 的最小构件。",
      },
      {
        lessonId: "resnet",
        why: "ResNet 是可复用的 image backbone；最后的分类层只是连接特征与目标的一种 head。",
      },
      {
        lessonId: "prediction-heads",
        why: "逐步比较分类、回归、token 与像素级 prediction heads，以及何时冻结或重训 backbone。",
      },
      {
        lessonId: "unet",
        why: "分割需要保留空间结构和逐像素输出；这能说明 head 为何必须服从任务的输出粒度。",
      },
      {
        lessonId: "attention",
        why: "切换到另一种 head：先弄懂 Query、Key、Value 如何生成 token 间的加权信息。",
      },
      {
        lessonId: "attention-heads",
        why: "多个 attention heads 并行处理不同投影，再拼接映射；它们不是分类或分割的输出层。",
      },
      {
        lessonId: "transformer",
        why: "把 multi-head attention 放回完整 block，看 residual、normalization 与 feed-forward 如何配合。",
      },
      {
        lessonId: "bert",
        why: "用 BERT 贯通两种 head：编码器内部有 attention heads，预训练表示上还能接任务 head。",
      },
    ],
  },
  {
    id: "zero-to-few-shot",
    title: "从 Zero-shot 到 Few-shot",
    description:
      "把预训练表示、无样例迁移、少样例适配与参数更新放在一条线上，比较 CLIP、linear probe、prototype 和 meta-learning。",
    steps: [
      {
        lessonId: "contrastive-learning",
        why: "先理解表示空间：相似输入靠近、不同输入分开，后续的少样例方法才有可比较的特征。",
      },
      {
        lessonId: "clip",
        why: "CLIP 对齐图像与文本表示，文本标签可以变成候选类别描述。",
      },
      {
        lessonId: "zero-shot-learning",
        why: "明确 zero-shot 的样例与训练边界：评估目标任务时没有该任务的标注示例，仍要检查类别描述和分布。",
      },
      {
        lessonId: "linear-probe",
        why: "如果已有标注，可先冻结 encoder、只训练一个线性 head，衡量表示中已有多少可读出的信息。",
      },
      {
        lessonId: "few-shot-learning",
        why: "把每类只有少量 support examples 的任务写清楚，区分少样例微调与 prompt 内示例。",
      },
      {
        lessonId: "episodic-meta-learning",
        why: "先把 meta-train/val/test 与每个任务的 support/query 隔离正确，否则后续方法都可能泄漏。",
      },
      {
        lessonId: "prototypical-networks",
        why: "看 embedding 中每类 prototype 如何由 support set 形成，再用距离判断 query。",
      },
      {
        lessonId: "matching-networks",
        why: "不把同类压成一个中心，让 query 直接注意每个 support 并汇总其标签。",
      },
      {
        lessonId: "relation-networks",
        why: "当固定欧氏或余弦距离不足时，让小网络学习比较函数。",
      },
      {
        lessonId: "meta-learning-maml",
        why: "对比另一条路线：在多个训练任务上学一个能用少量梯度步快速适配的初始化。",
      },
      {
        lessonId: "fomaml-reptile",
        why: "理解一阶近似怎样省掉 Hessian，并与完整 MAML 做成本和质量对照。",
      },
      {
        lessonId: "transfer-lora",
        why: "最后对照实际部署选项：保持模型冻结、训练浅层 head，或对预训练权重做参数高效适配。",
      },
    ],
  },
  {
    id: "cohort-to-validation",
    title: "Cohort 到可信评估",
    description:
      "把样本是谁、标签何时产生、模型看到哪些信息与结果能否迁移接起来；适用于医疗、用户和时间序列数据研究。",
    steps: [
      {
        lessonId: "cohort-design",
        why: "先定义研究对象、入排标准、index time、观察窗口与预测窗口，固定一个可复现的样本集合。",
      },
      {
        lessonId: "data-leakage",
        why: "沿时间和实体边界检查特征：预测时未知的信息与同一人的重复记录都可能使验证结果虚高。",
      },
      {
        lessonId: "class-imbalance",
        why: "检查事件率和各子群样本数，再决定采样、损失权重与 PR 指标等设置。",
      },
      {
        lessonId: "model-evaluation",
        why: "确定任务级指标、阈值与置信区间；明确一次验证所对应的 cohort 和数据切分。",
      },
      {
        lessonId: "domain-shift",
        why: "人群、设备、机构或时间变化会改变输入与目标分布，内部好成绩不能自动代表新环境。",
      },
      {
        lessonId: "external-validation",
        why: "在独立地点、时间或来源的 cohort 上测试，观察性能和子群差异是否稳定。",
      },
      {
        lessonId: "calibration-uncertainty",
        why: "最后检验预测概率是否与观察频率一致，并用不确定性分析支持阈值和使用边界。",
      },
    ],
  },
  {
    id: "prompting-to-alignment",
    title: "GPT、Prompt 与反馈学习",
    description:
      "沿 next-token prediction 到 in-context learning、few-shot prompting、推理提示和偏好训练，区分上下文适配与权重更新。",
    steps: [
      {
        lessonId: "decoder-models",
        why: "从 causal mask 与 next-token objective 开始，理解模型为何能接着提示继续生成。",
      },
      {
        lessonId: "gpt-language-model",
        why: "把 decoder 训练成语言模型，认识 pretraining 与下游任务提示之间的接口。",
      },
      {
        lessonId: "in-context-learning",
        why: "在 prompt 中放任务说明或示例，让模型条件化当前输出；推理时并没有梯度更新。",
      },
      {
        lessonId: "few-shot-learning",
        why: "同为 few-shot，prompt 中的 demonstrations 与少量样本上的参数微调是两种不同操作。",
      },
      {
        lessonId: "chain-of-thought-prompting",
        why: "为多步问题加入中间推理示例或要求，检查何时提高表现、何时只是增加 token 与错误链。",
      },
      {
        lessonId: "reward-model",
        why: "偏好数据训练一个给候选回答打分的 reward model，这一步会更新模型参数。",
      },
      {
        lessonId: "rlhf",
        why: "把 reward model 用于策略优化，区分训练期偏好对齐与推理时仅改 prompt。",
      },
      {
        lessonId: "dpo",
        why: "对照一种直接利用偏好对优化策略的做法，理解何时不必显式训练独立的奖励模型。",
      },
    ],
  },
  {
    id: "modern-sequence-backbones",
    title: "现代序列模型：Attention、SSM、Mamba 与 RWKV",
    description:
      "用同一组 shape、状态大小、训练并行性和逐 token 延迟问题，比较显式 token 交互与压缩递推状态。",
    steps: [
      {
        lessonId: "rnn",
        why: "从逐步 hidden state 开始，建立固定状态与序列递推的基准。",
      },
      {
        lessonId: "attention",
        why: "让每个 token 直接读取其他位置，理解显式内容寻址和 T² score 矩阵。",
      },
      {
        lessonId: "state-space-models",
        why: "把线性递推改写为并行卷积，理解 S4 的结构化长程状态。",
      },
      {
        lessonId: "mamba",
        why: "让状态更新依赖当前内容，用 selective scan 连接选择性与线性序列成本。",
      },
      {
        lessonId: "rwkv",
        why: "比较另一条加权递推路线：训练可并行，生成保留固定大小状态。",
      },
      {
        lessonId: "transformer",
        why: "回到完整 Transformer，以质量、显存、prefill 和 decode 实测做架构选择。",
      },
    ],
  },
  {
    id: "multimodal-perception",
    title: "视觉与多模态：分类、检测、分割到 VLM",
    description:
      "沿输出粒度逐步增加：整图类别、对象框、像素 mask、promptable segmentation，再让文本查询视觉证据。",
    steps: [
      {
        lessonId: "resnet",
        why: "先用卷积 backbone 把图像压成可迁移的多尺度特征。",
      },
      {
        lessonId: "faster-rcnn-yolo",
        why: "比较 two-stage 与 one-stage 如何从特征图定位多个对象。",
      },
      {
        lessonId: "detr",
        why: "用 object queries 与集合匹配替代密集候选和传统 NMS 流程。",
      },
      {
        lessonId: "unet",
        why: "把输出粒度推进到每个像素，并通过 skip connection 恢复边界。",
      },
      {
        lessonId: "segment-anything",
        why: "加入点、框与 mask prompt，理解开放目标的交互式分割。",
      },
      {
        lessonId: "clip",
        why: "先把图像与文本投到同一表示空间，为 zero-shot 检索与分类打基础。",
      },
      {
        lessonId: "vision-language-models",
        why: "用 cross-attention 让文本 token 读取视觉 tokens，并验证真实 grounding。",
      },
    ],
  },
  {
    id: "recommendation-to-policy",
    title: "推荐与决策：召回、排序、反馈到策略",
    description:
      "从静态交互矩阵到百万候选召回和列表排序，再处理旧策略日志、示范学习与安全决策。",
    steps: [
      {
        lessonId: "matrix-factorization",
        why: "先用低秩 user/item factors 建立快速、可解释的推荐基线。",
      },
      {
        lessonId: "two-tower-retrieval",
        why: "用特征 towers 与 ANN 把召回扩展到大候选和冷启动。",
      },
      {
        lessonId: "learning-to-rank",
        why: "在固定候选上优化顶部顺序，区分召回上限与排序质量。",
      },
      {
        lessonId: "multi-armed-bandit",
        why: "当展示会影响未来数据时，引入探索、利用与在线反馈。",
      },
      {
        lessonId: "imitation-learning",
        why: "从专家示范学习策略，并用 DAgger 处理闭环状态分布偏移。",
      },
      {
        lessonId: "offline-rl",
        why: "不能在线探索时，用旧策略日志保守改进并做 OPE。",
      },
      {
        lessonId: "safe-rl-pomdp",
        why: "观测不完整且存在硬约束时，显式建模 memory、cost 与回退。",
      },
    ],
  },
  {
    id: "uncertainty-causality",
    title: "可信预测：校准、不确定性、生存与因果",
    description:
      "先让概率可解释，再表达模型分歧和预测集合；随后处理删失时间，并区分预测风险与干预效果。",
    steps: [
      {
        lessonId: "calibration-uncertainty",
        why: "先检查预测概率与实际频率是否一致，并定义阈值与成本。",
      },
      {
        lessonId: "deep-ensembles",
        why: "用独立模型成员的分歧观察数据未充分约束的区域。",
      },
      {
        lessonId: "conformal-selective-prediction",
        why: "用独立 calibration set 构造预测集合，并量化拒答工作量。",
      },
      {
        lessonId: "domain-shift",
        why: "验证新时间、设备和人群是否破坏校准与 conformal 假设。",
      },
      {
        lessonId: "survival-analysis",
        why: "结局是事件时间且有删失时，保留风险集信息而非退化为二分类。",
      },
      {
        lessonId: "causal-treatment-effects",
        why: "最后区分谁会发生事件与给 treatment 是否会改变事件。",
      },
    ],
  },
  {
    id: "deployment-lifecycle",
    title: "部署优化：精度、压缩、服务与监控",
    description:
      "从训练 dtype 走到整数推理、知识迁移和紧凑结构，最后把导出、延迟、版本、漂移与反馈写成系统契约。",
    steps: [
      {
        lessonId: "mixed-precision",
        why: "先理解训练中的 dtype、loss scaling 与数值边界。",
      },
      {
        lessonId: "quantization",
        why: "用 scale、zero-point、PTQ/QAT 把推理转为低比特，并在硬件实测。",
      },
      {
        lessonId: "distillation-pruning",
        why: "让小 student 学 teacher，并真正删除通道或 block 形成紧凑图。",
      },
      {
        lessonId: "model-evaluation",
        why: "压缩后重新检查主指标、子群 guardrails 与置信区间。",
      },
      {
        lessonId: "model-serving-monitoring",
        why: "固定输入输出契约，测 p99、canary、漂移与延迟反馈。",
      },
      {
        lessonId: "data-leakage",
        why: "部署数据可用性与训练定义必须一致，防止离线特征在线不可获得。",
      },
    ],
  },
  {
    id: "meta-learning-complete",
    title: "Meta-Learning：从 Episode 到会适配的学习器",
    description:
      "先固定 Task 与 Support/Query Protocol，再比较 Metric-Based、Optimization-Based、Memory-Based 与 Policy-Based Meta-Learning，最后进入 Cross-Domain 压力测试。",
    steps: [
      {
        lessonId: "episodic-meta-learning",
        why: "定义 task、N-way K-shot、support/query 和三层 meta split。",
      },
      {
        lessonId: "siamese-triplet",
        why: "先学可迁移的距离空间，理解 pair/triplet 和采样。",
      },
      {
        lessonId: "prototypical-networks",
        why: "用类别均值建立最简 metric-based few-shot baseline。",
      },
      {
        lessonId: "matching-networks",
        why: "保留每个 support，用 attention 做标签汇总。",
      },
      {
        lessonId: "relation-networks",
        why: "再让比较函数本身可学习，观察容量与过拟合。",
      },
      {
        lessonId: "meta-learning-maml",
        why: "转入 optimization-based 路线：用 query 优化可快速更新的初始化。",
      },
      {
        lessonId: "fomaml-reptile",
        why: "比较二阶与一阶 meta update 的计算和近似。",
      },
      {
        lessonId: "meta-sgd-anil",
        why: "决定是学习逐参数更新规则，还是只让 head 快速适配。",
      },
      {
        lessonId: "memory-augmented-meta-learning",
        why: "用 episode state 快速绑定新标签，不在测试时更新权重。",
      },
      {
        lessonId: "meta-reinforcement-learning",
        why: "把快速适配推进到需要探索的新 MDP。",
      },
      {
        lessonId: "cross-domain-few-shot",
        why: "最后同时更换类别与数据域，检验是否真正学会适配。",
      },
    ],
  },
  {
    id: "domain-adaptation-stack",
    title: "Transfer Learning、Domain Generalization 与 Test-Time Adaptation",
    description:
      "按目标域信息何时可见来选方法：有标签少量适配、训练时无标签对齐、目标域完全不可见、上线后无标签微调。",
    steps: [
      {
        lessonId: "transfer-learning-strategies",
        why: "有少量目标标签时，从冻结 head 到逐层解冻建立基线。",
      },
      {
        lessonId: "cross-domain-few-shot",
        why: "目标域只有极少 support 时，限制适配容量并报告域差。",
      },
      {
        lessonId: "domain-adaptation-dann",
        why: "训练时可见无标签 target，则用 adversarial alignment。",
      },
      {
        lessonId: "domain-generalization-irm",
        why: "target 完全不可见时，只能利用多个 source environments 的稳定性。",
      },
      {
        lessonId: "test-time-adaptation",
        why: "部署输入到来后，用无标签 objective 小幅更新并设置回滚。",
      },
      {
        lessonId: "online-learning-drift",
        why: "标签延迟到达后进入真正的时间顺序更新与漂移闭环。",
      },
    ],
  },
  {
    id: "data-efficient-learning",
    title:
      "Data-Efficient Learning：Active Learning、Semi-Supervised Learning、Curriculum Learning 与 Continual Learning",
    description:
      "同样面对有限标注，分别决定标哪一笔、怎样使用无标签数据、先学什么，以及新数据到来后怎样不忘旧知识。",
    steps: [
      {
        lessonId: "active-learning",
        why: "标注者可循环参与时，选择信息量和代表性高的样本。",
      },
      {
        lessonId: "semi-supervised-self-training",
        why: "利用剩余无标签池，同时控制 pseudo-label 错误放大。",
      },
      {
        lessonId: "curriculum-self-paced",
        why: "通过样本进入顺序改善优化，但保证最终覆盖难例和少数群体。",
      },
      {
        lessonId: "continual-learning",
        why: "数据按任务顺序到来时，用 replay、正则或蒸馏控制遗忘。",
      },
      {
        lessonId: "multi-task-learning",
        why: "若多个监督同时可得，检查共享表示的正迁移与梯度冲突。",
      },
    ],
  },
  {
    id: "automated-distributed-learning",
    title: "Learning Systems：AutoML、Meta-Optimization 与 Federated Learning",
    description:
      "把更新规则、超参数、架构和多客户端训练都视为外层设计问题，同时计算总预算、信息边界与部署约束。",
    steps: [
      {
        lessonId: "learned-optimizers",
        why: "让模型输出参数 update，并测试跨 optimizee 与长 horizon 泛化。",
      },
      {
        lessonId: "hypernetworks-meta-gradients",
        why: "按任务生成参数，理解展开与隐式 meta-gradient。",
      },
      {
        lessonId: "automl-hpo-nas",
        why: "系统搜索超参数和结构，并防止对 validation 过拟合。",
      },
      {
        lessonId: "federated-learning",
        why: "数据不能集中时，在 non-IID 客户端间本地更新和聚合。",
      },
      {
        lessonId: "model-serving-monitoring",
        why: "最后把成本、版本、漂移、回滚和反馈接入生产闭环。",
      },
    ],
  },
];
