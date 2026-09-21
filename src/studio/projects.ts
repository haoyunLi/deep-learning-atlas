export type ProjectStage = {
  id: string;
  label: string;
  english: string;
  question: string;
  action: string;
  evidence: string;
  pass: string;
  failure: string;
};

export type StudioProject = {
  id: string;
  title: string;
  english: string;
  summary: string;
  task: string;
  input: string;
  output: string;
  baseline: string;
  primaryMetric: string;
  guardrail: string;
  split: string;
  settings: string[];
  relatedLessons: string[];
  stages: ProjectStage[];
};

const stageBlueprints = [
  ["contract", "问题契约", "Problem contract"],
  ["audit", "数据审计", "Data audit"],
  ["split", "切分与基线", "Split & baseline"],
  ["train", "训练与调参", "Train & tune"],
  ["ablation", "消融实验", "Ablation"],
  ["errors", "错误分析", "Error analysis"],
  ["test", "锁定测试", "Locked test"],
  ["deploy", "部署与监控", "Deploy & monitor"],
] as const;

function makeStages(
  specifics: Array<{
    question: string;
    action: string;
    evidence: string;
    pass: string;
    failure: string;
  }>,
): ProjectStage[] {
  return stageBlueprints.map(([id, label, english], index) => ({
    id,
    label,
    english,
    ...specifics[index],
  }));
}

const readmission: StudioProject = {
  id: "readmission-risk",
  title: "住院再入院风险",
  english: "Tabular risk prediction",
  summary:
    "用有缺失值、类别变量和类别不平衡的表格数据，完成从 Logistic 基线到 XGBoost 的可靠比较。",
  task: "在出院时预测 30 天内是否再次入院，供随访资源排序。",
  input: "一次住院结束前可获得的年龄、诊断、化验和历史就诊记录。",
  output: "每次住院的风险概率与校准后的风险层级。",
  baseline: "缺失值指示 + one-hot + regularized logistic regression",
  primaryMetric: "PR-AUC（类别不平衡）",
  guardrail: "校准误差与各年龄组 sensitivity",
  split: "按患者分组，再按时间把最后 20% 作为锁定测试集。",
  settings: [
    "XGBoost depth 3–8",
    "learning rate 0.03–0.15",
    "early stopping 30 rounds",
    "class weight 从 prevalence 起步",
  ],
  relatedLessons: [
    "logistic-regression",
    "xgboost",
    "data-leakage",
    "calibration-uncertainty",
  ],
  stages: makeStages([
    {
      question: "预测发生在何时，谁会使用结果？",
      action: "写明出院时刻、30 天标签窗、可采取的随访动作和漏报/误报成本。",
      evidence: "一页 model card 草案与输入字段时间戳。",
      pass: "任何输入都早于预测时刻。",
      failure: "使用出院后才生成的编码或账单字段。",
    },
    {
      question: "缺失、重复与标签偏差有多大？",
      action: "按字段统计缺失率，按患者查重复记录，并分时间/年龄查看阳性率。",
      evidence: "数据字典、缺失热图与 cohort flow。",
      pass: "每个排除条件都有数量和原因。",
      failure: "先填补全量数据，再切分。",
    },
    {
      question: "模型真的超过简单规则吗？",
      action:
        "患者分组时间切分；仅在训练集拟合预处理；训练 prevalence、规则和 Logistic 三个基线。",
      evidence: "固定 split manifest 与三条基线。",
      pass: "验证集中无患者重叠。",
      failure: "同一患者的不同住院落到训练与测试。",
    },
    {
      question: "容量增加是否值得？",
      action: "随机搜索深度、学习率和子采样；以 PR-AUC 选择，以校准作约束。",
      evidence: "参数—指标轨迹与最佳轮数。",
      pass: "重复种子后提升稳定。",
      failure: "用测试集挑最佳树数。",
    },
    {
      question: "哪个组件真正贡献提升？",
      action: "依次去掉时间特征、缺失指示、类别权重和校准。",
      evidence: "同切分同预算的消融表。",
      pass: "结论含置信区间或重复运行波动。",
      failure: "一次改变多个因素。",
    },
    {
      question: "错误集中在哪些人群？",
      action:
        "查看高置信误报/漏报，按时间、医院和人群分层；检查 SHAP 仅作线索。",
      evidence: "错误 cohort 表和 20 个个案复核。",
      pass: "找到至少一个可修数据问题与一个不可约误差。",
      failure: "把特征重要性当因果解释。",
    },
    {
      question: "一次性测试是否支持上线？",
      action: "冻结阈值、预处理和模型后只评估一次锁定测试。",
      evidence: "PR-AUC、校准、分组 sensitivity 与 bootstrap CI。",
      pass: "主指标和所有 guardrail 达标。",
      failure: "看结果后修改阈值仍报告同一测试。",
    },
    {
      question: "分布变化如何被发现？",
      action: "记录输入缺失、分数分布、校准和干预覆盖率；设回滚阈值。",
      evidence: "监控面板规范与 shadow deployment 报告。",
      pass: "漂移告警能对应负责人和动作。",
      failure: "只监控服务延迟，不监控数据与结果。",
    },
  ]),
};

const segmentation: StudioProject = {
  id: "lesion-segmentation",
  title: "医学影像病灶分割",
  english: "3D lesion segmentation",
  summary:
    "以 U-Net / nnU-Net 为主线，处理患者级切分、各向异性体素、类别不平衡和滑窗推理。",
  task: "在 3D 扫描中标出病灶体素，辅助测量体积。",
  input: "经去标识的 3D CT/MRI、体素 spacing 与专家 mask。",
  output: "与原始空间对齐的概率图、二值 mask 和病灶体积。",
  baseline: "固定 spacing 的 2D U-Net + Dice/CE",
  primaryMetric: "patient-level Dice",
  guardrail: "95% Hausdorff distance 与小病灶 recall",
  split: "患者级、中心级分层；外部中心只用于最终测试。",
  settings: [
    "patch 覆盖物理尺寸",
    "Dice + CE 权重",
    "positive patch sampling",
    "sliding-window overlap 0.5",
  ],
  relatedLessons: ["unet", "nnunet", "unet-plus-plus", "mixed-precision"],
  stages: makeStages([
    {
      question: "输出用于筛查还是定量？",
      action: "写清器官/病灶标签、空间坐标、最小有意义病灶和允许误差。",
      evidence: "标注协议与输入输出样例。",
      pass: "预测可逆变换回原始体素空间。",
      failure: "只保存 resize 后 mask。",
    },
    {
      question: "扫描与标注是否可比较？",
      action: "检查 spacing、方向、强度、空 mask、连通分量与标注者差异。",
      evidence: "每病例 QC 表与可视叠图。",
      pass: "异常病例有显式处理规则。",
      failure: "把 slice 当独立样本随机切分。",
    },
    {
      question: "简单 2D 模型能达到什么水平？",
      action: "患者级固定切分，训练 2D U-Net，记录空预测基线。",
      evidence: "split IDs、学习曲线和逐病例指标。",
      pass: "训练与推理预处理完全复用。",
      failure: "验证增强含随机几何变换。",
    },
    {
      question: "3D 上下文带来多少收益？",
      action:
        "比较 2D、3D patch 与 nnU-Net 配置，调 patch、batch、spacing 和采样。",
      evidence: "显存—上下文—指标表。",
      pass: "至少三个种子不出现崩溃。",
      failure: "仅按像素尺寸选 patch，忽略物理 spacing。",
    },
    {
      question: "收益来自网络还是预处理？",
      action: "分别去掉重采样、深监督、Dice loss 与 test-time augmentation。",
      evidence: "组件消融与运行成本。",
      pass: "每次只改一个组件。",
      failure: "比较模型时使用不同数据版本。",
    },
    {
      question: "小病灶为何被漏掉？",
      action: "按体积、位置、中心和扫描质量分层，逐层叠图检查。",
      evidence: "missed-lesion gallery 与原因标签。",
      pass: "错误分类能转为数据或模型动作。",
      failure: "只报告总体 Dice。",
    },
    {
      question: "外部中心能否保持表现？",
      action:
        "冻结 preprocessing plan、checkpoint 与阈值，在外部中心评估一次。",
      evidence: "Dice/HD95/recall 的病例级 bootstrap CI。",
      pass: "guardrail 达标并说明失败 cohort。",
      failure: "排除困难病例却不更新 cohort flow。",
    },
    {
      question: "推理结果怎样安全交付？",
      action: "滑窗推理、恢复空间坐标、检测空/异常输入并保留不确定性。",
      evidence: "端到端 DICOM/NIfTI 回归测试。",
      pass: "体积和坐标与参考工具一致。",
      failure: "部署端使用不同插值模式。",
    },
  ]),
};

const rag: StudioProject = {
  id: "grounded-rag",
  title: "可追溯的 RAG 助手",
  english: "Grounded retrieval assistant",
  summary:
    "从 tokenizer、chunk、embedding、召回和 rerank 走到带证据生成与失败归因。",
  task: "回答内部技术手册问题，每个结论必须链接到可核对段落。",
  input: "带版本、权限和章节结构的文档 corpus 与用户问题。",
  output: "简洁答案、引用段落、无法回答时的拒答。",
  baseline: "BM25 top-k + extractive answer",
  primaryMetric: "answer correctness × citation entailment",
  guardrail: "权限泄漏率与无答案拒答率",
  split: "按文档版本和主题切分；保留更新后的文档作为时间外测试。",
  settings: [
    "chunk 256–768 tokens",
    "top-k 3–20",
    "hybrid retrieval weight",
    "reranker cutoff",
    "temperature 0–0.3",
  ],
  relatedLessons: [
    "retrieval-augmented-generation",
    "tokenization",
    "word2vec",
    "transformer",
  ],
  stages: makeStages([
    {
      question: "回答必须满足什么证据标准？",
      action: "定义可回答、不可回答、冲突版本和权限边界。",
      evidence: "50 个带引用金标问题。",
      pass: "评分者能独立核对答案。",
      failure: "只凭流畅度判分。",
    },
    {
      question: "文档解析是否保留结构？",
      action: "检查表格、代码、标题、版本和 ACL；记录解析失败率。",
      evidence: "chunk lineage 与失败样例。",
      pass: "每个 chunk 可回溯原页。",
      failure: "跨权限边界拼接 chunk。",
    },
    {
      question: "没有生成模型时能检索到吗？",
      action: "按主题切分问题，建立 BM25 和 dense retrieval Recall@k。",
      evidence: "query—gold chunk 对照表。",
      pass: "召回错误与生成错误可分开。",
      failure: "用完整答案文本生成 query embedding。",
    },
    {
      question: "chunk、k 和 rerank 怎样联动？",
      action: "同一预算搜索 chunk size、overlap、hybrid 权重和 top-k。",
      evidence: "召回—上下文 token—延迟曲线。",
      pass: "选择点满足质量与延迟约束。",
      failure: "无限增大 k 掩盖检索问题。",
    },
    {
      question: "哪个环节贡献正确性？",
      action: "去掉 rerank、query rewrite、citation verifier 与拒答规则。",
      evidence: "端到端与分组件消融。",
      pass: "每个复杂组件有可量化收益。",
      failure: "只看最终准确率，无法定位退化。",
    },
    {
      question: "错答来自 retrieve 还是 generate？",
      action:
        "标记 no-recall、wrong-rank、context-missed、unsupported-generation 和 stale-doc。",
      evidence: "错误瀑布图与案例库。",
      pass: "每类有负责人和修复策略。",
      failure: "把所有错答归为 hallucination。",
    },
    {
      question: "新版本文档上仍然可靠吗？",
      action: "冻结 prompt、索引构建与阈值，运行时间外测试和权限攻击集。",
      evidence: "正确性、引用蕴含、拒答和泄漏率。",
      pass: "所有安全 guardrail 为零容忍。",
      failure: "测试索引混入旧版金标答案。",
    },
    {
      question: "文档变化怎样触发更新？",
      action: "监控索引新鲜度、空召回、引用点击和人工纠错；支持按文档回滚。",
      evidence: "离线评估版本与线上 trace schema。",
      pass: "每个回答可重放检索上下文。",
      failure: "只记录最终文本，不保存检索证据。",
    },
  ]),
};

const detection: StudioProject = {
  id: "wildlife-detection",
  title: "野生动物目标检测",
  english: "Object detection under shift",
  summary:
    "比较 two-stage、YOLO 与 DETR 风格检测器，并把相机、季节和小目标偏差纳入评估。",
  task: "在固定相机图像中定位并分类动物。",
  input: "不同相机、季节和昼夜条件下的 RGB 图像与 boxes。",
  output: "类别、置信度和坐标框。",
  baseline: "预训练 ResNet 特征 + Faster R-CNN",
  primaryMetric: "mAP@[.5:.95]",
  guardrail: "small-object AP、每相机 false positives/hour",
  split: "按相机与时间块切分，避免相邻帧泄漏。",
  settings: [
    "image scale",
    "anchor/object queries",
    "IoU matching",
    "class focal weight",
    "NMS threshold",
  ],
  relatedLessons: ["resnet", "mask-rcnn", "detr", "transfer-lora"],
  stages: makeStages([
    {
      question: "框用于计数、告警还是生态研究？",
      action: "定义类别层级、最小框、遮挡规则与可接受的小时误报。",
      evidence: "标注手册与业务成本表。",
      pass: "同一图像由两名标注者达到约定一致性。",
      failure: "训练中途修改类别定义。",
    },
    {
      question: "近重复帧和空图有多少？",
      action: "按相机/时间聚类，检查 box 尺寸、类别频率、坏图和重复。",
      evidence: "相机 cohort 与尺寸分布。",
      pass: "空图保留且有明确采样策略。",
      failure: "随机按图片切分连续视频帧。",
    },
    {
      question: "标准检测器能否稳定工作？",
      action: "固定相机切分，训练预训练 Faster R-CNN 并记录空预测。",
      evidence: "逐类 AP、召回—置信度曲线。",
      pass: "评估坐标变换已用合成框测试。",
      failure: "resize 后标签框未同步变换。",
    },
    {
      question: "实时性与小目标性能如何权衡？",
      action:
        "同预算比较 YOLO 风格、Faster R-CNN 与 DETR，调分辨率、匹配和阈值。",
      evidence: "mAP—latency—memory Pareto 图。",
      pass: "在目标设备测 batch=1 延迟。",
      failure: "用服务器吞吐代表边缘延迟。",
    },
    {
      question: "预训练、增强和检测头各贡献多少？",
      action: "去掉强增强、预训练和多尺度；记录小目标变化。",
      evidence: "同种子消融表。",
      pass: "保留计算预算相当。",
      failure: "更大的模型也训练更久。",
    },
    {
      question: "误报由背景还是标注缺失造成？",
      action: "按相机、昼夜、尺寸和物种复核 top false positives/negatives。",
      evidence: "背景触发与漏标标签。",
      pass: "区分模型错误和金标错误。",
      failure: "把未标注动物当成模型误报。",
    },
    {
      question: "新相机和新季节表现如何？",
      action: "冻结 checkpoint 和阈值，在未见相机/季节测试一次。",
      evidence: "mAP、small AP 和 FP/hour CI。",
      pass: "最差相机仍满足 guardrail。",
      failure: "按总体图片数加权掩盖小 cohort。",
    },
    {
      question: "现场漂移怎样发现？",
      action: "监控亮度、空图率、框尺寸、置信度和人工抽检；保留降级计数模式。",
      evidence: "边缘推理基准与漂移告警。",
      pass: "相机离线和数据漂移能区分。",
      failure: "将无检测误认为没有动物。",
    },
  ]),
};

const forecasting: StudioProject = {
  id: "demand-forecasting",
  title: "分层需求预测",
  english: "Hierarchical time-series forecasting",
  summary:
    "用季节 naive、树模型和序列模型预测多商品需求，并验证回测、区间覆盖与库存成本。",
  task: "预测未来 14 天每门店每商品需求。",
  input: "历史销量、库存、价格、促销、节假日及当时可知的外生变量。",
  output: "逐日点预测、80/95% 区间和聚合层级预测。",
  baseline: "seasonal naive + moving average",
  primaryMetric: "weighted scaled error",
  guardrail: "区间 coverage 与缺货成本模拟",
  split: "rolling-origin backtest，最终 14 天完全锁定。",
  settings: [
    "context length",
    "forecast horizon",
    "lag set",
    "quantile loss",
    "reconciliation method",
  ],
  relatedLessons: ["time-series-forecasting", "rnn", "transformer", "xgboost"],
  stages: makeStages([
    {
      question: "预测何时生成，未来哪些特征已知？",
      action: "画清 cutoff、horizon、补货动作和层级约束。",
      evidence: "feature availability matrix。",
      pass: "所有特征带 as-of 时间。",
      failure: "使用预测期结束后汇总的促销效果。",
    },
    {
      question: "零销量是缺货还是无需求？",
      action: "检查缺货、退货、节假日、冷启动和层级总和。",
      evidence: "每序列状态标签。",
      pass: "缺失、零和 censoring 分开编码。",
      failure: "把库存为零时的销量当真实需求。",
    },
    {
      question: "复杂模型是否超过季节规则？",
      action: "用多个 rolling folds 跑 naive、季节 naive 和线性 lag 基线。",
      evidence: "每 horizon 与层级误差。",
      pass: "所有模型使用相同 cutoff。",
      failure: "随机切分时间点。",
    },
    {
      question: "共享模型还是每序列模型？",
      action:
        "同预算比较 XGBoost lag、RNN/Transformer；调 context、loss 和 sampling。",
      evidence: "精度—训练时间—冷启动表。",
      pass: "超参只由回测 folds 选择。",
      failure: "在最终 14 天选择 context。",
    },
    {
      question: "外生变量和层级约束是否有用？",
      action: "去掉促销、节假日、item embedding 和 reconciliation。",
      evidence: "按 horizon 的消融。",
      pass: "同时报告平均与最差层级。",
      failure: "只汇报总量预测。",
    },
    {
      question: "哪些序列系统性偏差？",
      action: "按销售速度、缺货、促销、冷启动和门店聚类残差。",
      evidence: "残差 cohort 与覆盖率。",
      pass: "偏差可映射到特征或策略。",
      failure: "只查看 RMSE 最大的高销量商品。",
    },
    {
      question: "锁定期能否支持库存决策？",
      action: "冻结模型，在最终窗口评估误差、区间和库存仿真。",
      evidence: "成本曲线与 block bootstrap CI。",
      pass: "业务成本优于基线且 coverage 接近目标。",
      failure: "仅点预测更准，区间严重欠覆盖。",
    },
    {
      question: "预测退化时怎么回退？",
      action:
        "监控数据延迟、误差、区间覆盖和 bias；为每序列保留 seasonal naive。",
      evidence: "champion/challenger 与回退规则。",
      pass: "实际值到达后自动回填评估。",
      failure: "没有区分数据缺失和需求突变。",
    },
  ]),
};

const recommendation: StudioProject = {
  id: "two-stage-recommendation",
  title: "两阶段推荐系统",
  english: "Retrieval and ranking",
  summary:
    "从 popularity 基线、负采样和 two-tower 召回，走到 ranking、离线偏差与在线实验。",
  task: "从百万候选中为每位用户排序 20 个相关内容。",
  input: "带曝光位置、点击、时间和内容元数据的交互日志。",
  output: "候选集、排序分数和推荐理由字段。",
  baseline: "按时间窗的 popularity + seen-item filter",
  primaryMetric: "Recall@100（召回）与 NDCG@20（排序）",
  guardrail: "coverage、novelty、延迟与投诉率",
  split: "按用户内时间切分，训练只见 cutoff 前事件。",
  settings: [
    "embedding 64–256",
    "negative sampling distribution",
    "retrieval temperature",
    "hard negatives",
    "ranker calibration",
  ],
  relatedLessons: [
    "word2vec",
    "contrastive-learning",
    "two-tower-retrieval",
    "learning-to-rank",
  ],
  stages: makeStages([
    {
      question: "优化点击、消费还是长期价值？",
      action: "定义曝光单位、正样本窗口、过滤规则和多目标约束。",
      evidence: "event schema 与 metric tree。",
      pass: "正负样本都来自真实可见候选。",
      failure: "把未曝光 item 当明确负样本。",
    },
    {
      question: "日志受旧策略怎样影响？",
      action: "检查位置偏差、重复曝光、机器人、冷启动和 catalog availability。",
      evidence: "exposure funnel 与 propensity 分布。",
      pass: "训练样本能回溯当时候选集。",
      failure: "使用推荐后才产生的特征。",
    },
    {
      question: "个性化超过 popularity 吗？",
      action: "时间切分，建立 popularity、recent-popularity 和矩阵分解基线。",
      evidence: "Recall/NDCG/coverage 表。",
      pass: "seen-item 与不可用 item 统一过滤。",
      failure: "在全量日志计算 item popularity。",
    },
    {
      question: "召回与排序如何分配预算？",
      action:
        "调 two-tower embedding、负采样和 hard negatives，再训练 ranker。",
      evidence: "candidate recall—rank quality—latency 曲线。",
      pass: "ranker 评估基于固定候选。",
      failure: "召回模型变化时直接比较 ranker NDCG。",
    },
    {
      question: "收益来自哪些训练信号？",
      action: "去掉 hard negatives、内容特征、去偏权重和多任务 head。",
      evidence: "召回与排序分开的消融。",
      pass: "同时记录 tail-item coverage。",
      failure: "主指标提升但 catalog coverage 崩溃。",
    },
    {
      question: "哪些用户和 item 被忽略？",
      action: "按活跃度、冷启动、流行度、语言和设备分析。",
      evidence: "user/item cohort scorecard。",
      pass: "发现数据暴露问题与模型问题。",
      failure: "只看平均活跃用户。",
    },
    {
      question: "离线提升可靠吗？",
      action:
        "冻结索引、候选和 ranker，在未来窗口评估；用 IPS 仅作敏感性分析。",
      evidence: "离线指标、置信区间和 OPE 假设。",
      pass: "明确支持集不足区域。",
      failure: "把 OPE 当无偏真值。",
    },
    {
      question: "如何安全做在线实验？",
      action:
        "灰度 A/B，先看延迟、错误与投诉，再看价值指标；记录曝光 propensity。",
      evidence: "实验设计与停止规则。",
      pass: "guardrail 预先注册。",
      failure: "中途反复查看并择优停止。",
    },
  ]),
};

const offlineRl: StudioProject = {
  id: "offline-policy",
  title: "离线策略评估与改进",
  english: "Offline policy evaluation",
  summary:
    "在不能直接在线探索时，用历史策略日志建立行为克隆、OPE 和受约束策略改进闭环。",
  task: "为资源分配提出策略，但上线前只能访问历史决策日志。",
  input: "state、action、reward、next state、done 和行为策略 propensity。",
  output: "候选策略、置信区间、支持集告警和上线约束。",
  baseline: "behavior cloning + direct reward model",
  primaryMetric: "lower confidence bound of policy value",
  guardrail: "support violation、worst cohort value 与 action rate",
  split: "按完整 trajectory 和时间切分。",
  settings: [
    "discount γ",
    "importance-weight clip",
    "conservatism penalty",
    "bootstrap trajectories",
    "policy divergence limit",
  ],
  relatedLessons: [
    "offline-rl",
    "off-policy-evaluation",
    "ppo",
    "model-based-rl",
  ],
  stages: makeStages([
    {
      question: "状态是否包含决策时刻可知信息？",
      action: "画 MDP、奖励延迟、终止条件和不可接受动作。",
      evidence: "causal timing diagram 与 policy constraints。",
      pass: "每个字段有 as-of 时间。",
      failure: "state 使用 action 后测量。",
    },
    {
      question: "日志覆盖哪些动作？",
      action:
        "按 state cohort 检查 action propensity、轨迹长度、缺失和 reward censoring。",
      evidence: "support map 与 cohort flow。",
      pass: "零支持区域被标记为禁止外推。",
      failure: "未知 behavior propensity 被当作均匀。",
    },
    {
      question: "复制旧策略能达到什么表现？",
      action:
        "trajectory split，训练 behavior cloning 和 reward model，回放旧策略。",
      evidence: "action accuracy、calibration 与 logged return。",
      pass: "模拟评估能恢复已知行为策略值。",
      failure: "按 transition 随机切分同一 trajectory。",
    },
    {
      question: "保守程度如何选？",
      action:
        "在验证轨迹上调 CQL/BCQ 类 penalty、policy divergence 和模型容量。",
      evidence: "estimated value—support violation 曲线。",
      pass: "改进来自多个 OPE estimator 共识。",
      failure: "只优化单一高方差 IPS。",
    },
    {
      question: "OPE 假设影响多大？",
      action:
        "比较 direct、IPS、weighted IPS 和 doubly robust；改变 clip 与 reward model。",
      evidence: "estimator sensitivity table。",
      pass: "结论对合理设置稳定。",
      failure: "隐藏极端 importance weights。",
    },
    {
      question: "策略在哪里改变最多？",
      action: "按状态、动作和人群检查 policy shift，人工复核低支持决策。",
      evidence: "action-change cohort 与反事实案例。",
      pass: "每个大幅改变都有数据支持。",
      failure: "平均 action rate 相近就认为安全。",
    },
    {
      question: "锁定轨迹是否仍支持改进？",
      action:
        "冻结候选策略，在最终时间窗做 bootstrap trajectory OPE 与 stress tests。",
      evidence: "value LCB、support violation 和最差 cohort。",
      pass: "LCB 超过行为策略且 guardrail 达标。",
      failure: "只报告点估计。",
    },
    {
      question: "如何从离线走向在线？",
      action:
        "先 shadow，再受约束小流量；设置 action cap、人工覆盖和即时回滚。",
      evidence: "分阶段上线与停止规则。",
      pass: "任何约束触发自动回退行为策略。",
      failure: "直接部署确定性新策略。",
    },
  ]),
};

const fewShotAdaptation: StudioProject = {
  id: "few-shot-adaptation",
  title: "跨机构少样本适配",
  english: "Cross-domain few-shot adaptation",
  summary:
    "用严格的 task split 和 support/query episode，比冻结表示、ProtoNet、ANIL 与 MAML，回答新机构只有少量标签时怎样适配。",
  task: "新实验室到来时，每类仅 1–5 个标注样本，识别此前未见的细胞类型。",
  input: "多实验室显微图像、实验室 ID、物种/批次信息和每类少量 support 标签。",
  output: "query 类别概率、拒答标记、适配耗时和任务级不确定性。",
  baseline: "冻结预训练 encoder + 每类 support prototype",
  primaryMetric: "mean query macro-F1 across unseen-lab episodes",
  guardrail: "worst-lab recall、ECE、适配时间与每任务显存",
  split:
    "按实验室×类别隔离 meta-train/meta-val/meta-test；每个 episode 内 support/query 不重叠。",
  settings: [
    "5-way 1/5-shot episodes",
    "inner steps 1–5",
    "inner LR 0.001–0.1",
    "prototype distance / temperature",
    "head-only 与后层解冻",
  ],
  relatedLessons: [
    "episodic-meta-learning",
    "prototypical-networks",
    "meta-learning-maml",
    "cross-domain-few-shot",
    "calibration-uncertainty",
  ],
  stages: makeStages([
    {
      question: "真正的新任务是什么？",
      action: "写清新实验室、新类别、可用 support 数、允许更新步数与拒答成本。",
      evidence: "task contract、episode schema 与上线适配时序图。",
      pass: "query 标签只在评分后可见。",
      failure: "把新图片而非新机构/新类别误称为新任务。",
    },
    {
      question: "机构、类别和实体是否泄漏？",
      action:
        "按实验室、批次、物种与近重复图像审计，统计每任务可用 support/query。",
      evidence: "task-level cohort flow、重复簇与域差异报告。",
      pass: "同一细胞、批次和目标机构不跨 meta split。",
      failure: "随机按图片切分造成风格和实体泄漏。",
    },
    {
      question: "简单冻结表示能达到什么水平？",
      action:
        "固定同一批 meta-test episodes，比较 kNN、prototype 和 linear head。",
      evidence: "1/5-shot 任务级分布与 bootstrap CI。",
      pass: "所有方法复用同一 support/query。",
      failure: "每种方法抽到不同的容易任务。",
    },
    {
      question: "梯度式适配是否超过低方差基线？",
      action:
        "只用 meta-train/val 调 MAML/FOMAML 的 inner LR、步数、层范围和 outer LR。",
      evidence: "适配前后 query 曲线、时间、显存与 gradient norm。",
      pass: "多种未见实验室上稳定超过 prototype。",
      failure: "support loss 降低却 query 退化。",
    },
    {
      question: "收益来自 episode、初始化还是适配层？",
      action:
        "分别去掉 episodic training、换随机初始化、改 head-only、移除域增广。",
      evidence: "同预算消融表和 task-level paired difference。",
      pass: "关键组件的提升跨任务一致。",
      failure: "同时改变 backbone、episode 与训练 token。",
    },
    {
      question: "哪些任务适配失败？",
      action: "按实验室、类别、support 噪声和域距离检查高置信错误与负适配。",
      evidence: "失败 episode gallery、support attention/距离与标注复核。",
      pass: "区分表示失配、support 噪声和 inner overfit。",
      failure: "只看平均准确率掩盖单个机构崩溃。",
    },
    {
      question: "封闭目标机构是否仍然成立？",
      action:
        "冻结方法和超参数，在完整未见实验室一次评估 1-shot、5-shot 与缺类 episode。",
      evidence: "macro-F1、worst-lab recall、ECE、CI 和适配资源。",
      pass: "主指标、最差域和资源 guardrails 同时通过。",
      failure: "看 target test 后改 support 采样或 inner steps。",
    },
    {
      question: "怎样安全处理新任务 support？",
      action:
        "版本化 support、校验标签/类覆盖，限制更新参数和步数，并保存 source fallback。",
      evidence:
        "adaptation audit log、drift dashboard、回滚演练和人工复核队列。",
      pass: "每次适配可复现、可隔离、可回滚。",
      failure: "跨机构复用 optimizer/memory state 造成信息串线。",
    },
  ]),
};

export const studioProjects: StudioProject[] = [
  readmission,
  segmentation,
  rag,
  detection,
  forecasting,
  recommendation,
  offlineRl,
  fewShotAdaptation,
];
export const studioProjectById = new Map(
  studioProjects.map((project) => [project.id, project]),
);
