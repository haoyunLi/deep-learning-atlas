export type GuideRecommendation = {
  lessonId: string;
  name: string;
  role: string;
  reason: string;
  settings: string[];
  limitation: string;
};
export type GuideContext = {
  id: string;
  label: string;
  baseline: string;
  recommendationIds: string[];
};
export type GuideTask = {
  id: string;
  title: string;
  english: string;
  description: string;
  question: string;
  contexts: GuideContext[];
  recommendations: GuideRecommendation[];
  evaluation: string[];
  preparationIds: string[];
};

export const guideTasks: GuideTask[] = [
  {
    id: "tabular",
    title: "表格分类与回归",
    english: "Tabular prediction",
    description:
      "每行是一个对象，每列是一个已知特征。先把目标、预测时点与可用字段定义清楚。",
    question: "需要预测哪一种目标？",
    contexts: [
      {
        id: "classification",
        label: "类别或事件概率",
        baseline: "先记录多数类或固定患病率预测，再用逻辑回归建立可复现参照。",
        recommendationIds: ["logistic-regression", "random-forest", "xgboost"],
      },
      {
        id: "regression",
        label: "连续数值",
        baseline:
          "先以训练集均值或中位数作常数预测，再比较线性回归与树模型；所有方案使用同一划分。",
        recommendationIds: ["random-forest", "xgboost"],
      },
    ],
    recommendations: [
      {
        lessonId: "logistic-regression",
        name: "逻辑回归",
        role: "分类基线",
        reason: "适合先检查可用特征是否有信号，并建立简单的概率预测参照。",
        settings: [
          "只在训练折拟合缺失填补、类别编码与数值标准化。",
          "先用 L2 正则；按验证指标调整强度，阈值另外选择。",
        ],
        limitation:
          "原始特征下的线性边界可能漏掉非线性交互；概率仍需校准检查。",
      },
      {
        lessonId: "random-forest",
        name: "随机森林",
        role: "非线性对照",
        reason: "多棵树可捕捉阈值与交互，便于建立分类或回归的非线性参照。",
        settings: [
          "先限制叶子最小样本数，记录种子与特征处理流程。",
          "增加树数到验证表现趋稳，再调整深度和叶大小。",
        ],
        limitation:
          "大森林增加内存和推理成本；不能可靠地外推训练范围外的趋势。",
      },
      {
        lessonId: "xgboost",
        name: "XGBoost",
        role: "逐步修正误差",
        reason:
          "固定表格特征存在复杂交互时，可与线性模型、随机森林做同划分比较。",
        settings: [
          "深度从 3–6、学习率从 0.03 或 0.1 的量级试起。",
          "给足轮数并在独立验证集早停；类别编码只能从训练折学习。",
        ],
        limitation:
          "树更深并不必然更好；缺失机制变化与越界外推都可能导致失效。",
      },
    ],
    evaluation: [
      "分类同时看类比例、PR 曲线、校准及所需阈值；回归按误差代价选 MAE 或 RMSE。",
      "重复对象按个体分组，预测未来按时间划分；不要把事后字段或全数据预处理统计量带入训练。",
    ],
    preparationIds: ["cohort-design", "data-leakage", "model-evaluation"],
  },
  {
    id: "image-classification",
    title: "图像分类",
    english: "Image classification",
    description:
      "为整幅图像预测类别。优先确认预训练权重、输入分辨率和标注的覆盖范围。",
    question: "当前最主要的约束是什么？",
    contexts: [
      {
        id: "few-labels",
        label: "标注少，先确认可迁移性",
        baseline:
          "先冻结预训练图像特征，只训练线性分类头，检查数据与标签是否支持任务。",
        recommendationIds: ["linear-probe", "resnet"],
      },
      {
        id: "device",
        label: "需要在有限算力设备运行",
        baseline:
          "在目标设备测端到端延迟与峰值内存，保留冻结特征或小型 CNN 的质量参照。",
        recommendationIds: ["mobilenet-v2", "resnet"],
      },
      {
        id: "pretrained",
        label: "有匹配的预训练模型与训练预算",
        baseline: "先跑预训练 ResNet 的冻结头或微调结果，再比较预训练 ViT。",
        recommendationIds: ["resnet", "vit"],
      },
    ],
    recommendations: [
      {
        lessonId: "linear-probe",
        name: "冻结特征 + 线性头",
        role: "低成本基线",
        reason: "少量标签时先衡量已有表示是否有效，也方便发现标签和划分问题。",
        settings: [
          "骨干进入评估模式并冻结参数，固定预处理。",
          "只调分类头正则与学习率，先检查单个小批量可学习。",
        ],
        limitation:
          "如果目标图像与预训练域差异很大，固定表示可能缺少必要信息。",
      },
      {
        lessonId: "resnet",
        name: "预训练 ResNet",
        role: "卷积路线",
        reason:
          "残差卷积提供常用的图像特征起点，适合与冻结特征基线比较微调收益。",
        settings: [
          "先训新分类头，再用较小学习率解冻骨干。",
          "保持与权重匹配的归一化；小批量时核查 BatchNorm 统计量。",
        ],
        limitation:
          "微调会增加过拟合风险，仍需在患者、对象或拍摄来源层面隔离验证。",
      },
      {
        lessonId: "mobilenet-v2",
        name: "MobileNetV2",
        role: "设备预算路线",
        reason: "倒残差与深度可分离卷积为受限设备提供可比较的轻量结构。",
        settings: [
          "先使用预训练配置，按目标设备比较输入分辨率和宽度。",
          "计时包含预处理、数据传输与输出处理，记录 batch=1 表现。",
        ],
        limitation: "参数少不保证在每种硬件上更快，算子支持会改变实际速度。",
      },
      {
        lessonId: "vit",
        name: "预训练 ViT",
        role: "图像 token 路线",
        reason:
          "有匹配预训练和足够数据时，检验全局 token 交互是否带来任务收益。",
        settings: [
          "保持权重的 patch 与位置编码配置；小学习率微调。",
          "先固定分辨率与增强，再评估增加 token 数是否值得。",
        ],
        limitation:
          "从零训练通常更依赖数据与配方；更高分辨率会明显增加注意力成本。",
      },
    ],
    evaluation: [
      "报告每类召回和混淆矩阵；长尾类别不能只看总体准确率。",
      "同一患者、物体或近重复图像不得跨训练与测试；增强仅用于训练并确认保留标签语义。",
    ],
    preparationIds: ["prediction-heads", "transfer-lora", "class-imbalance"],
  },
  {
    id: "segmentation",
    title: "像素与实例分割",
    english: "Segmentation",
    description:
      "先明确输出是每像素类别，还是每个对象独立的掩码，再决定结构与标注格式。",
    question: "你的标注与图像属于哪种设定？",
    contexts: [
      {
        id: "semantic",
        label: "普通图像的像素类别",
        baseline:
          "用简单 U-Net 与固定输入预处理起步，先确认图像和 mask 的空间对齐。",
        recommendationIds: ["unet", "deeplabv3-plus"],
      },
      {
        id: "volumetric",
        label: "医学体积或 spacing 差异明显",
        baseline:
          "以 nnU-Net 的规划与交叉验证流水线建立参照，再判断自定义 U-Net 是否有稳定收益。",
        recommendationIds: ["nnunet", "unet"],
      },
      {
        id: "instance",
        label: "同类对象也要逐个区分",
        baseline: "先用小样本检查实例 ID、重叠与漏标，再建立 Mask R-CNN 基线。",
        recommendationIds: ["mask-rcnn", "unet"],
      },
    ],
    recommendations: [
      {
        lessonId: "unet",
        name: "U-Net",
        role: "语义分割基线",
        reason:
          "编码器获得上下文，跳接恢复空间细节；适合先验证像素级任务流程。",
        settings: [
          "先确定 2D 或 3D、patch 大小与类别通道；核对输入输出形状。",
          "比较交叉熵与 Dice 类损失组合；采样需覆盖稀少前景。",
        ],
        limitation:
          "普通 U-Net 只输出类别掩码；实例任务还需额外分离机制，并检查相邻对象是否粘连。",
      },
      {
        lessonId: "deeplabv3-plus",
        name: "DeepLabv3+",
        role: "多尺度上下文",
        reason:
          "目标尺寸差异大且需要兼顾语义与边界时，比较空洞卷积和解码器的收益。",
        settings: [
          "从预训练骨干与官方 output stride 配置起步。",
          "固定裁剪与增强后，再比较分辨率、空洞率和边界误差。",
        ],
        limitation: "更精细输出增加内存，小目标和薄结构仍可能在下采样中丢失。",
      },
      {
        lessonId: "nnunet",
        name: "nnU-Net",
        role: "体积数据流水线",
        reason:
          "将 spacing、patch、网络和训练配置一起适配，适合作为医学分割参照。",
        settings: [
          "检查病例 ID、方向、spacing 与标签在物理空间对齐。",
          "先保留规划值，按病例交叉验证比较 2D/3D 配置与后处理。",
        ],
        limitation: "自动规划无法修复病例泄漏、错误标注或外部医院的分布变化。",
      },
      {
        lessonId: "mask-rcnn",
        name: "Mask R-CNN",
        role: "实例输出路线",
        reason: "先定位对象，再为每个候选区域预测掩码，直接对应逐对象标注。",
        settings: [
          "用预训练检测骨干，统一框、类别与实例 mask。",
          "先核查候选框召回与小目标，再调图像尺寸和阈值。",
        ],
        limitation:
          "拥挤、遮挡和极小对象可能首先在候选阶段失败，需逐阶段诊断。",
      },
    ],
    evaluation: [
      "语义分割按类别与病例报告 Dice/IoU；实例分割增加 mask AP，边界重要时另测边界误差。",
      "按患者或完整图像划分后再切 patch；重采样和增强必须同时作用于图像与标签，标签插值需保持类别。",
    ],
    preparationIds: ["prediction-heads", "data-leakage", "external-validation"],
  },
  {
    id: "language",
    title: "文本理解与生成",
    english: "Language tasks",
    description:
      "输出固定标签、自由文本或带证据的回答，所需模型与评估方式都不同。",
    question: "系统需要输出什么？",
    contexts: [
      {
        id: "understanding",
        label: "分类、匹配或抽取结果",
        baseline:
          "先用固定表示加浅层分类器，确认标签与文本切分，再比较 Encoder 微调。",
        recommendationIds: ["linear-probe", "bert"],
      },
      {
        id: "generation",
        label: "摘要、改写或自由文本",
        baseline: "先用固定 prompt 和现有预训练模型记录输出，再考虑任务微调。",
        recommendationIds: ["gpt-language-model", "t5"],
      },
      {
        id: "grounded",
        label: "依赖文档证据的回答",
        baseline:
          "先建立可检查的检索基线与引用样例，再把检索结果送给生成模型。",
        recommendationIds: [
          "retrieval-augmented-generation",
          "gpt-language-model",
        ],
      },
    ],
    recommendations: [
      {
        lessonId: "linear-probe",
        name: "固定文本表示 + 任务头",
        role: "标签任务基线",
        reason: "低成本检查预训练表示对目标标签的区分能力。",
        settings: [
          "固定编码器、分词器与池化策略；只训练线性头。",
          "检查长文本截断比例，任务损失与标签编码保持一致。",
        ],
        limitation:
          "目标信息若被截断或未进入表示，增加头的训练轮数也难以补救。",
      },
      {
        lessonId: "bert",
        name: "BERT 类 Encoder",
        role: "理解与抽取",
        reason: "双向上下文表示适合分类、匹配和 token 标注等已知输入任务。",
        settings: [
          "使用匹配的 tokenizer，统计长度后设 max length。",
          "小学习率微调，明确用句级还是 token 级预测头及 mask。",
        ],
        limitation: "Encoder 的任务头不能直接替代自由生成所需的解码流程。",
      },
      {
        lessonId: "gpt-language-model",
        name: "自回归语言模型",
        role: "生成路线",
        reason: "逐 token 条件生成适合开放文本任务，可从提示与少量示例开始。",
        settings: [
          "固定模板、tokenizer、停止条件和最大输出长度。",
          "先比较贪心或低随机性设置；需要微调时再评估 LoRA 与完整微调。",
        ],
        limitation:
          "流畅输出可能缺少事实依据；长 prompt、输出长度与 KV cache 决定不少推理成本。",
      },
      {
        lessonId: "t5",
        name: "T5 类 Encoder–Decoder",
        role: "文本转换路线",
        reason: "源文本与目标文本明确对应时，可直接构造文本到文本训练任务。",
        settings: [
          "分别设置源、目标长度，使用与预训练匹配的任务格式。",
          "核查 shift-right、padding loss mask 与生成阶段的停止规则。",
        ],
        limitation:
          "训练时给定正确前缀，生成时使用自身输出；只看训练损失会漏掉实际生成错误。",
      },
      {
        lessonId: "retrieval-augmented-generation",
        name: "检索增强生成 RAG",
        role: "证据更新路线",
        reason: "答案依赖具体或经常变化的文档时，可检查检索内容并提供出处。",
        settings: [
          "先固定文档版本、切块、top-k 与小型带证据评估集。",
          "分别评测检索召回与回答引用；再决定重排、片段长度与拒答规则。",
        ],
        limitation:
          "RAG 是系统流程；检索失败、过期文档和不忠实引用仍会产生错误。",
      },
    ],
    evaluation: [
      "标签任务用 F1 等目标指标；生成任务另测事实性、完整性与任务成功率，困惑度不能替代答案质量。",
      "防止近重复文本与来源穿越划分；统一上下文预算、模板、采样设置，记录首 token 与完整响应延迟。",
    ],
    preparationIds: ["tokenization", "language-model-evaluation", "kv-cache"],
  },
  {
    id: "forecasting",
    title: "时间序列预测",
    english: "Forecasting",
    description:
      "从固定预测时点出发，使用当时已知的信息预测未来；先定义频率、历史窗口与预测范围。",
    question: "现有数据支持哪种输入方式？",
    contexts: [
      {
        id: "features",
        label: "可以构造滞后与滚动特征",
        baseline:
          "先跑最后观测值与季节性 naive；季节周期必须有数据证据，并采用相同预测 horizon。",
        recommendationIds: ["time-series-forecasting", "xgboost"],
      },
      {
        id: "sequences",
        label: "多条序列，需学习较长依赖",
        baseline:
          "保留 naive 与季节性 naive，再比较小 TCN 与 GRU，不因模型复杂就取消简单参照。",
        recommendationIds: ["tcn", "lstm-gru"],
      },
    ],
    recommendations: [
      {
        lessonId: "time-series-forecasting",
        name: "Naive 与季节性基线",
        role: "先验证回测",
        reason:
          "可发现季节结构与数据可用性问题，给复杂模型一个真正需要超过的参照。",
        settings: [
          "固定采样频率、lookback、horizon 和目标到达延迟。",
          "按多个滚动起点回测，预处理只拟合各起点的历史数据。",
        ],
        limitation:
          "机制改变或弱季节性时可能失效，但应保留以量化其他模型的增益。",
      },
      {
        lessonId: "xgboost",
        name: "滞后特征 + XGBoost",
        role: "表格化预测",
        reason:
          "当历史统计量与已知协变量能够表达主要信号时，树模型便于快速比较。",
        settings: [
          "每个 lag 与 rolling feature 只读预测起点之前的值。",
          "从浅树与验证早停起步，明确直接多步还是递归预测。",
        ],
        limitation:
          "树对未见趋势外推有限；用未来实际协变量回测会制造虚假的提升。",
      },
      {
        lessonId: "tcn",
        name: "因果 TCN",
        role: "并行序列路线",
        reason: "用因果空洞卷积建模历史窗口，可与循环网络比较质量和吞吐。",
        settings: [
          "由核大小、层数与 dilation 计算感受野，覆盖所需历史。",
          "核查因果 padding，先用小通道数与直接多步输出。",
        ],
        limitation: "感受野不足会漏掉远期信号；增加长度也可能混入过时规律。",
      },
      {
        lessonId: "lstm-gru",
        name: "GRU / LSTM",
        role: "循环序列路线",
        reason: "顺序更新隐藏状态，适合比较历史依赖与可变长度序列的作用。",
        settings: [
          "先用单层小隐藏维度，明确序列间何时重置状态。",
          "标准化仅用训练历史，监控梯度范数并验证裁剪设置。",
        ],
        limitation:
          "长序列训练与推理较难并行，隐藏状态跨实体错误复用会造成污染。",
      },
    ],
    evaluation: [
      "滚动回测按 horizon 与实体报告 MAE/RMSE；目标接近零时慎用 MAPE，区间预测另查覆盖率和宽度。",
      "随机打散时间点、先用全序列标准化、使用未来实际天气或修订值，都会让离线评估偏乐观。",
    ],
    preparationIds: ["time-series-forecasting", "data-leakage", "domain-shift"],
  },
  {
    id: "graph",
    title: "图与关系数据",
    english: "Graph learning",
    description:
      "节点、边及其可用时间是输入的一部分。先确认关系是否带来超过节点特征本身的收益。",
    question: "部署时的图是什么样？",
    contexts: [
      {
        id: "fixed",
        label: "规模可控，主要预测既有节点",
        baseline: "先用节点特征 MLP，作为不利用图连接的对照。",
        recommendationIds: ["neural-networks", "gcn", "gat"],
      },
      {
        id: "growing",
        label: "图较大，或持续出现新节点",
        baseline: "保留仅用节点特征的模型，再测邻居采样是否带来可迁移收益。",
        recommendationIds: ["neural-networks", "graphsage"],
      },
    ],
    recommendations: [
      {
        lessonId: "neural-networks",
        name: "节点特征 MLP",
        role: "无图基线",
        reason:
          "检查预测能力是否已经来自节点自身特征，避免把图结构收益想当然。",
        settings: [
          "先用 1–2 个隐藏层，输入仅含预测时已知特征。",
          "与图模型共享划分、特征和指标，保留相同调参预算。",
        ],
        limitation: "不利用边和邻居信息，确实依赖关系的任务可能明显受限。",
      },
      {
        lessonId: "gcn",
        name: "GCN",
        role: "邻居平均路线",
        reason:
          "规模可控且邻接关系有预测价值时，规范化邻居聚合是直接的结构基线。",
        settings: [
          "先从两层开始，明确自环和邻接归一化。",
          "区分 transductive 与 inductive 设定，记录允许访问的节点与边。",
        ],
        limitation:
          "多层聚合可能使节点表示趋同；邻居类别差异大时，简单混合可能损害信号。",
      },
      {
        lessonId: "gat",
        name: "GAT",
        role: "可学习邻居权重",
        reason: "不同邻居重要性可能不同，可检验注意力加权相对固定聚合的收益。",
        settings: [
          "从少量头与较浅层开始，对齐输出拼接或平均的维度。",
          "固定边集合，再比较注意力 dropout、头数和显存。",
        ],
        limitation: "注意力权重不自动构成解释，更多头也会增加边级计算。",
      },
      {
        lessonId: "graphsage",
        name: "GraphSAGE",
        role: "采样与新节点路线",
        reason:
          "通过邻居采样控制大图计算，并学习可用于有特征新节点的聚合规则。",
        settings: [
          "先用 mean aggregator 与两层，记录每层 fanout。",
          "固定采样种子与评估采样策略，检查新节点特征的可获得性。",
        ],
        limitation: "采样会增加方差；新图关系或特征分布变化时仍可能失效。",
      },
    ],
    evaluation: [
      "划分应对应节点、子图、时间或完整图的部署单位；连边预测需报告负采样规则。",
      "目标边、未来关系和通过邻居传播的标签可能泄漏；只遮住标签不一定足够。",
    ],
    preparationIds: ["gnn", "data-leakage", "domain-shift"],
  },
  {
    id: "representation",
    title: "表示学习与检索",
    english: "Representation learning",
    description:
      "目标是可迁移的向量表示。先确定什么算相似，以及怎样在下游任务中验证表示有用。",
    question: "可以获得哪一种学习信号？",
    contexts: [
      {
        id: "unlabeled",
        label: "无标签图像，可构造合理增强",
        baseline:
          "先评估现成预训练表示的线性探测和近邻检索，再判断自监督训练的增益。",
        recommendationIds: ["linear-probe", "simclr", "mae"],
      },
      {
        id: "paired",
        label: "图文配对或跨模态数据",
        baseline: "先使用现成图文编码器与固定提示建立检索和零样本参照。",
        recommendationIds: ["clip", "linear-probe"],
      },
      {
        id: "labeled",
        label: "少量类别或相似性标签",
        baseline: "冻结已有表示后训练线性头，并在独立查询集上测近邻检索。",
        recommendationIds: ["linear-probe", "supervised-contrastive"],
      },
    ],
    recommendations: [
      {
        lessonId: "linear-probe",
        name: "线性探测与固定表示",
        role: "迁移基线",
        reason: "用固定特征与低容量头测表示是否已经提供目标任务需要的信息。",
        settings: [
          "冻结编码器与归一化状态，只训练线性头。",
          "固定数据量、正则搜索范围与划分，保留检索查询集。",
        ],
        limitation:
          "线性任务头成绩只覆盖一种可读出方式，不能代表所有下游任务。",
      },
      {
        lessonId: "simclr",
        name: "SimCLR",
        role: "同图不同视图",
        reason:
          "有足够无标签图像与合理增强时，可从两种视图的对比目标学习特征。",
        settings: [
          "先检查裁剪、颜色等增强是否保留任务语义。",
          "记录有效负样本数与温度，训练后比较投影头前的表示。",
        ],
        limitation:
          "大批量计算与假负样本会影响效果；增强破坏关键细节时可能学错不变性。",
      },
      {
        lessonId: "mae",
        name: "MAE",
        role: "遮挡重建路线",
        reason:
          "通过重建被遮挡图像块学习视觉表示，可与对比学习使用同一探测协议比较。",
        settings: [
          "使用明确的 patch、mask ratio 与轻量解码器配置。",
          "先复现一种训练配方，再比较下游冻结和微调结果。",
        ],
        limitation:
          "重建图像好不代表目标类别可分；预训练规模与后续适配都影响结果。",
      },
      {
        lessonId: "clip",
        name: "CLIP",
        role: "图文对齐路线",
        reason:
          "配对图文提供跨模态匹配信号，可用于双向检索与基于类别描述的分类。",
        settings: [
          "先用匹配编码器与 tokenizer，归一化向量并固定提示模板。",
          "以独立图文对测双向 Recall@K，再考虑目标域微调。",
        ],
        limitation:
          "配对噪声、提示措辞与预训练覆盖都会改变结果；相似度不是校准概率。",
      },
      {
        lessonId: "supervised-contrastive",
        name: "监督对比学习",
        role: "利用类别关系",
        reason: "标签能定义更多同类正对，适合验证类内聚集是否改善检索和迁移。",
        settings: [
          "采样确保一个 batch 中同类有可用正对。",
          "固定温度与增强，再与交叉熵训练作同数据对照。",
        ],
        limitation:
          "粗粒度或错误标签可能把需要区分的样本拉近，不能只看训练对比损失。",
      },
    ],
    evaluation: [
      "分别测线性探测、下游微调与 Recall@K；保持划分、特征归一化和探测预算一致。",
      "查询与图库的重复样本、预训练污染和同实体不同视图跨划分，会夸大迁移或检索表现。",
    ],
    preparationIds: [
      "contrastive-learning",
      "zero-shot-learning",
      "few-shot-learning",
    ],
  },
  {
    id: "generative",
    title: "图像与连续数据生成",
    english: "Generative modeling",
    description:
      "先明确生成条件、分辨率与可接受的训练和采样成本。模型质量与采样器设置要一起验证。",
    question: "这次最希望解决哪一步？",
    contexts: [
      {
        id: "learn",
        label: "建立可理解的小规模生成实验",
        baseline:
          "在小分辨率数据上先检查 VAE 重建和潜空间，再比较 DDPM 的生成质量。",
        recommendationIds: ["autoencoder-vae", "ddpm"],
      },
      {
        id: "resolution",
        label: "利用现成权重生成较大图像",
        baseline: "先跑兼容的预训练潜空间扩散流水线，固定种子、分辨率与条件。",
        recommendationIds: ["latent-diffusion", "ddim"],
      },
      {
        id: "dynamics",
        label: "比较去噪与连续流路线",
        baseline:
          "固定数据、网络规模与采样预算，再比较 DDPM 和 Flow Matching 的质量与代价。",
        recommendationIds: ["ddpm", "flow-matching"],
      },
    ],
    recommendations: [
      {
        lessonId: "autoencoder-vae",
        name: "VAE",
        role: "潜空间与重建基线",
        reason: "同时学习压缩表示与解码，便于检查数据重建、插值和采样流程。",
        settings: [
          "先固定输入归一化与重建损失，检查重建样例。",
          "比较潜变量维度和 KL 权重，查看两项损失的变化。",
        ],
        limitation: "重建与先验约束需要平衡，压缩和解码形式可能抹平细节。",
      },
      {
        lessonId: "ddpm",
        name: "DDPM",
        role: "去噪生成路线",
        reason:
          "已知加噪过程提供训练目标，是理解逐步生成与条件控制的直接起点。",
        settings: [
          "固定噪声日程、预测参数化和时间步采样。",
          "先在小分辨率确认训练，再分别记录训练步数与推理采样步数。",
        ],
        limitation:
          "多步采样开销可观；噪声预测损失下降不保证视觉质量或多样性同步改善。",
      },
      {
        lessonId: "latent-diffusion",
        name: "潜空间扩散",
        role: "压缩空间路线",
        reason:
          "在压缩表示中运行去噪网络，便于利用现成大图生成权重与条件模块。",
        settings: [
          "匹配 VAE、潜变量缩放、条件编码器与去噪模型。",
          "固定分辨率和种子后，再比较 guidance 强度与采样预算。",
        ],
        limitation: "VAE 压缩损失会限制细节；强引导可能产生伪影或损失多样性。",
      },
      {
        lessonId: "ddim",
        name: "DDIM 采样",
        role: "兼容模型的采样选项",
        reason:
          "已有兼容扩散权重时，可检验更少采样步和不同轨迹的速度质量取舍。",
        settings: [
          "核对噪声日程、预测类型和时间步索引的兼容性。",
          "固定初始噪声，对照步数与 η；分别记录耗时与输出质量。",
        ],
        limitation:
          "DDIM 是采样路线，不能脱离兼容训练模型单独生成；减步可能损失质量。",
      },
      {
        lessonId: "flow-matching",
        name: "Flow Matching",
        role: "速度场路线",
        reason:
          "通过学习噪声到数据路径的速度，探索与去噪目标不同的连续生成建模。",
        settings: [
          "明确路径、时间采样和速度目标，先检查小规模训练。",
          "采样固定 ODE 求解器，再比较步长与函数评估次数。",
        ],
        limitation:
          "轨迹、训练配方和求解器共同决定结果，不能只比较名义采样步数。",
      },
    ],
    evaluation: [
      "同时看质量、多样性、条件遵循与采样成本；指标使用统一特征提取器、样本量和参考集。",
      "固定种子便于对照，但最终评估需多种子与足够样本；检查是否记忆训练图像或遗漏少数模式。",
    ],
    preparationIds: ["diffusion", "autoencoder-vae", "model-evaluation"],
  },
  {
    id: "online-rl",
    title: "可交互的强化学习",
    english: "Online reinforcement learning",
    description:
      "环境允许持续采集轨迹。先确定观测、动作、奖励和终止语义，再考虑策略优化。",
    question: "动作空间与采样条件是什么？",
    contexts: [
      {
        id: "discrete",
        label: "离散动作，可复用经验",
        baseline: "先记录随机策略和简单规则的回报；小状态空间可先使用 Q 表。",
        recommendationIds: ["dqn", "ppo"],
      },
      {
        id: "continuous",
        label: "连续动作，希望复用经验",
        baseline: "保留随机或规则控制器，统一环境步数预算，再比较 SAC 与 TD3。",
        recommendationIds: ["sac", "td3"],
      },
      {
        id: "simulator",
        label: "模拟器可并行，便于持续采样",
        baseline:
          "先跑已知可解的简单环境验证终止、奖励与动作映射，再转入目标环境。",
        recommendationIds: ["ppo", "actor-critic"],
      },
    ],
    recommendations: [
      {
        lessonId: "dqn",
        name: "DQN",
        role: "离散动作基线",
        reason: "用 Q 网络、经验回放和目标网络，直接比较有限动作的预期价值。",
        settings: [
          "先确定回放缓冲、探索日程与目标网络更新周期。",
          "检查终止与截断 mask，监控 TD 误差及 Q 值尺度。",
        ],
        limitation: "标准 DQN 需要枚举候选动作，不直接适用于高维连续动作。",
      },
      {
        lessonId: "ppo",
        name: "PPO",
        role: "持续采样路线",
        reason:
          "用当前策略 rollout 做有限更新，适合可持续交互且支持并行环境的任务。",
        settings: [
          "clip ε 可从 0.2、GAE λ 从 0.95 附近作待验证起点。",
          "限制每批更新轮数，监控 KL、clip fraction 与独立评估回报。",
        ],
        limitation:
          "需要新鲜 rollout，clipping 不保证策略变化或回报存在硬界限。",
      },
      {
        lessonId: "sac",
        name: "SAC",
        role: "连续动作与探索",
        reason:
          "结合经验回放、双 Q 与熵目标，适合比较连续控制的样本利用与探索。",
        settings: [
          "统一动作缩放，核查 squashed action 的 log-prob 修正。",
          "从标准双 Q 与自动温度配方起步，记录 entropy、α 与回报。",
        ],
        limitation:
          "奖励尺度与熵目标会影响行为，离线固定数据不能直接照搬在线配方。",
      },
      {
        lessonId: "td3",
        name: "TD3",
        role: "确定性控制对照",
        reason:
          "通过双 critic、目标平滑与延迟 actor 更新，提供连续控制的另一条基线。",
        settings: [
          "统一动作范围，分别设置探索噪声和目标策略平滑噪声。",
          "固定 critic/actor 更新比例并监控 Q 值与评估回报。",
        ],
        limitation:
          "探索依赖噪声设计，确定性策略在多解或强随机任务中可能受限。",
      },
      {
        lessonId: "actor-critic",
        name: "Actor–Critic",
        role: "机制清晰的参照",
        reason: "用价值网络提供基准，帮助理解策略梯度、bootstrap 与优势估计。",
        settings: [
          "先用小网络和短 rollout，核对 return 与 advantage。",
          "分别记录 policy loss、value loss、entropy 和环境步数。",
        ],
        limitation:
          "价值估计偏差会传入策略更新，代码能运行并不表示长期回报正确。",
      },
    ],
    evaluation: [
      "按相同环境交互预算和多个随机种子比较，独立评估回合报告回报、成功率与波动。",
      "终止/截断处理、动作变换和奖励缩放必须一致；只报最高一次回报会隐藏不稳定性。",
    ],
    preparationIds: ["reinforcement-learning", "q-learning", "actor-critic"],
  },
  {
    id: "offline-rl",
    title: "固定日志中的决策学习",
    english: "Offline RL & evaluation",
    description:
      "训练时无法获取新的交互。先核查日志覆盖和轨迹边界，再讨论能否改进历史行为。",
    question: "当前需要学习策略，还是评估已有策略？",
    contexts: [
      {
        id: "demonstrations",
        label: "高质量示范，先复现行为",
        baseline:
          "先做行为克隆，用独立轨迹衡量模仿误差；有可靠模拟器时再测闭环回报。",
        recommendationIds: ["behavior-cloning", "decision-transformer"],
      },
      {
        id: "improve",
        label: "固定轨迹，希望改进策略",
        baseline:
          "保留行为克隆与历史行为表现作为参照；先检查候选策略动作是否有日志支持。",
        recommendationIds: ["behavior-cloning", "cql", "off-policy-evaluation"],
      },
      {
        id: "evaluate",
        label: "已有候选策略，要估计价值",
        baseline:
          "冻结候选策略与回报定义，独立保留评估日志，先检查支持和行为概率。",
        recommendationIds: ["off-policy-evaluation", "offline-rl"],
      },
    ],
    recommendations: [
      {
        lessonId: "behavior-cloning",
        name: "行为克隆",
        role: "策略学习基线",
        reason: "以观测预测日志动作，先量化仅模仿数据能做到什么。",
        settings: [
          "按完整轨迹或独立个体划分，保留动作与观测的正确时序。",
          "离散动作使用分类目标，连续动作先核查归一化与多模态性。",
        ],
        limitation:
          "单步模仿误差小不保证闭环回报高，偏离示范状态后错误可能累积。",
      },
      {
        lessonId: "decision-transformer",
        name: "Decision Transformer",
        role: "回报条件轨迹建模",
        reason:
          "当轨迹质量和回报跨度足够时，用历史状态、动作和目标回报条件化动作预测。",
        settings: [
          "明确 return-to-go、序列长度、时间索引与轨迹 padding。",
          "目标回报从数据支持范围内比较，独立检查动作输出约束。",
        ],
        limitation:
          "要求更高回报不会凭空产生超出数据覆盖的能力，长轨迹还会增加建模成本。",
      },
      {
        lessonId: "cql",
        name: "保守 Q 学习 CQL",
        role: "限制数据外高估",
        reason: "通过保守价值目标降低未充分覆盖动作的高估，可与模仿基线比较。",
        settings: [
          "先验证奖励尺度、终止 mask 和动作归一化。",
          "记录保守惩罚系数及 Q 值变化，用独立评估检查是否过度保守。",
        ],
        limitation:
          "保守惩罚不能补足缺失覆盖；强惩罚可能使策略只保留较差行为。",
      },
      {
        lessonId: "off-policy-evaluation",
        name: "OPE：先诊断再估计",
        role: "评估候选策略",
        reason: "用于估计固定策略的回报，并展示日志对该策略能提供多强证据。",
        settings: [
          "冻结策略、目标群体、horizon 和折扣；核查实际 propensity 与支持。",
          "比较适用的 IS/DR/FQE，报告区间、有效样本量与敏感性。",
        ],
        limitation:
          "零覆盖、未记录混杂或极端权重会使估计不可靠；高离线分数不能独自证明部署收益。",
      },
      {
        lessonId: "offline-rl",
        name: "离线学习的数据边界",
        role: "设计与可行性检查",
        reason:
          "梳理训练策略与评估策略所需的数据边界，判断日志是否支持当前问题。",
        settings: [
          "记录行为策略版本、观测、动作、奖励和终止完整性。",
          "策略训练、调参与最终评估按独立轨迹隔离，并检查覆盖。",
        ],
        limitation:
          "这是问题设定与诊断步骤；发现覆盖不足时，需要改变目标或补充数据，不能只换算法。",
      },
    ],
    evaluation: [
      "区分学策略与估计策略价值；策略选择和最终 OPE 不应反复复用同一份评估日志。",
      "按完整轨迹或独立个体计算不确定性，报告支持不足的状态与群体；逐行打散可能破坏依赖结构。",
    ],
    preparationIds: ["offline-rl", "off-policy-evaluation", "data-leakage"],
  },
];
