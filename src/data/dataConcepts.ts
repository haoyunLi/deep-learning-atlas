import type { Lesson } from "./lessons";

export const dataConceptLessons: Lesson[] = [
  {
    id: "cohort-design",
    source: {
      label:
        "TRIPOD+AI: reporting clinical prediction model studies (BMJ, 2024)",
      url: "https://www.bmj.com/content/385/bmj-2023-078378",
    },
    title: "Cohort：先定义谁能进入数据",
    englishTitle: "Cohort Design & Prediction Windows",
    category: "training",
    level: "进阶",
    duration: "13 分钟",
    icon: "◌",
    summary:
      "Cohort 是按明确规则选出的研究对象；纳排、时间起点与结果窗口决定模型到底在预测谁、何时、什么事。",
    intuition:
      "把 cohort 想成一部电影的选角和时间线：先决定谁有资格出场，再决定按下暂停键的 index date，以及暂停前能看什么、暂停后要预测什么。模型只有在这些界线清楚时才有可解释的成绩。",
    core: "先写目标人群与使用场景，再定义 inclusion/exclusion、每个对象的 index date、lookback/feature window、prediction gap、label horizon 与 follow-up。特征只能来自预测时可用的信息。统计每一步筛选的对象数、事件数和缺失；多次记录或同一人的多个样本需按 person/group 管理，避免跨训练和测试泄漏。Cohort 规则改变会改变 P(X,Y)、阳性率与适用范围。",
    equation: "Xᵢ = recordsᵢ[t₀−L, t₀];  Yᵢ = eventᵢ(t₀+g, t₀+g+H]",
    mechanicsSteps: [
      "写下 target population 与 prediction question：对象是谁、在什么 index date 做判断、预测未来多长时间的哪种 outcome。",
      "按预先制定的 inclusion/exclusion 规则形成 cohort；为每位对象记录纳入原因、排除原因、来源、时间范围和可观察的 follow-up。",
      "只用 index date 及之前的 lookback window 构造 X，留出必要的 prediction gap；用之后的 label horizon 定义 Y，并检查 outcome 可否完整观测。",
      "按人、设备或其他独立单元先分 train/validation/test，再做标准化、编码和特征选择；同一对象的多条记录保持在同一分区。",
      "报告筛选流程、各分区人数与事件数、缺失和随访长度；在目标场景相近的独立队列复核表现。",
    ],
    whenToUse: [
      "纵向医疗、用户流失、设备故障等从历史记录预测未来事件的任务。",
      "同一个人或实体反复出现、结果有明确发生时间、或评估人群可能不同于训练人群时。",
    ],
    limits: [
      "研究队列由纳排规则和数据可得性决定；即使内部指标很高，也不能直接推广到未覆盖的人群。",
      "回顾性记录有缺失、记录频率差异和选择偏倚；队列设计本身不能消除这些问题。",
    ],
    howToUse: [
      "先写一页 cohort specification：来源、对象单位、纳排条件、index date、特征截止时间、预测间隔、label horizon。",
      "画每条样本的时间轴，随机抽查记录时间戳，确认任何特征都不会看到答案或答案之后的信息。",
      "先按独立实体和时间完成划分，再在训练分区上拟合 imputer、normalizer 与编码表。",
      "保存 cohort 构建代码与筛选计数，按训练/验证/测试分别记录样本数、阳性率及关键子群。",
      "将预期部署人群与队列的纳排条件逐项比较；偏差大时规划外部验证或重建队列。",
    ],
    tuning: [
      "lookback 加长会增加历史信息，也会减少有足够历史的对象；比较覆盖率与性能，而非只挑高分窗口。",
      "horizon 越长，标签事件数和目标含义可能变化；应由实际决策时间尺度确定，不按验证分数任意挑选。",
      "多个 index date 会增加样本但造成相关性；设置间隔或按对象分组，评估时同时报告对象数和样本数。",
    ],
    settings: [
      {
        name: "时间窗",
        start:
          "用业务或研究问题确定 index date、lookback L、gap g、horizon H，并画出时间轴。",
        adjust:
          "若特征获取太晚、随访不足或事件定义含糊，先修正时间定义并重建全套分区。",
      },
      {
        name: "纳排与观测条件",
        start:
          "记录每项条件的理由和筛掉的人数；避免以结果发生后的信息来判定纳入。",
        adjust:
          "覆盖率过低时检查数据来源和条件是否必要，修改后需重新评估目标人群。",
      },
      {
        name: "分割单位",
        start:
          "默认按 person 或实体分组；有未来部署场景时再保留时间更晚的独立测试队列。",
        adjust:
          "若同一人多次出现或设备共享来源，扩大 group key，确保分区之间没有实体交叉。",
      },
    ],
    modifications: [
      "做静态图像或单次问卷任务时，可把 index date 理解为采集/判断时点，仍需核查标签形成时间。",
      "有不同场所或时间段时构造多组 cohort，分别报告性能与 calibration，不只合并为一个平均值。",
    ],
    pitfalls: [
      "用最终诊断、出院记录或未来互动来筛选对象或生成特征，会把未来信息带回 index date。",
      "逐条记录随机分割让同一个人的相近记录出现在训练和测试中，造成虚高指标。",
      "用过短 follow-up 的未发生事件样本当作可靠阴性，会引入错误标签。",
    ],
    example:
      "预测设备未来 30 天是否故障：以每月首日为 t₀，只取此前 90 天传感器特征，留出 1 天处理延迟，未来 30 天定义标签；同一设备只进入一个数据分区。医疗研究需另行处理观测与结局定义，不可直接套用此例作临床决策。",
    compareTo: ["data-leakage", "model-evaluation", "external-validation"],
  },
  {
    id: "data-leakage",
    source: {
      label:
        "Kapoor & Narayanan: Leakage and the reproducibility crisis (Patterns, 2023)",
      url: "https://doi.org/10.1016/j.patter.2023.100804",
    },
    title: "数据泄漏：模型偷看了答案",
    englishTitle: "Data Leakage & Split Discipline",
    category: "training",
    level: "入门",
    duration: "11 分钟",
    icon: "↯",
    summary:
      "Leakage 是训练或选择过程接触到了实际预测时不可用的信息，让离线成绩看起来过好。",
    intuition:
      "模拟考试的题目如果提前混进教材，考试高分不能说明真的学会。数据泄漏既可能是直接出现答案，也可能是同一个对象跨分区、或先看全体数据再决定处理方法。",
    core: "按时间、实体和特征来源审计信息流。典型泄漏包括 outcome 之后的变量、同一对象跨分区、全数据拟合预处理/特征选择，以及对 test set 反复调参。评估集合应模拟未来真正会遇到的样本；任何从验证/测试反馈选择模型的步骤，都使该集合不再是完全独立的最终检验。",
    equation:
      "合法特征：X(t₀) ⊆ information available at t₀；test ∩ model-selection data = ∅",
    mechanicsSteps: [
      "先确定预测时点 t₀ 和真实部署中可见的信息，给每个候选特征标注产生时间与数据来源。",
      "按 person、设备、文档来源或时间切分独立集合；检查重复、近重复和同源样本是否跨分区。",
      "把 imputing、scaling、vocabulary、特征选择及过采样放进仅在训练 fold 上 fit 的 pipeline，再对验证/测试执行 transform。",
      "用验证集调模型和阈值；冻结全部选择后只对锁定的 test set 做一次最终评估，并对异常高分回查泄漏路径。",
    ],
    whenToUse: [
      "任何监督学习评估，尤其是时间序列、重复个体、相似图像或派生文本任务。",
      "模型效果显著超出简单基线、线上表现比离线差、或训练测试样本来源高度相关时。",
    ],
    limits: [
      "没有发现泄漏不等于数据有代表性；还需要检查 cohort 偏倚与 domain shift。",
      "有些共享信息是合法的，例如部署时确实可用的公开知识；判定标准是预测时点与实际使用流程。",
    ],
    howToUse: [
      "列一张特征表，写明字段来源、产生时间、预测时可否获取和潜在答案代理变量。",
      "先定义 split key 与时间规则，在任何学习型预处理之前生成并保存分区 ID。",
      "用训练集 fit 预处理、采样及特征选择；交叉验证时每个 fold 内都重新 fit。",
      "检查跨分区实体 ID、哈希重复、近重复和共享序列；对可能重复的源做抽样人工核查。",
      "记录每次使用验证/测试反馈所做的选择，保留从未参与选择的最终独立评估集。",
    ],
    tuning: [
      "split 粒度从实际独立单位出发；若设备或人的数据相关，按 group 切，而非按行随机切。",
      "时间 gap 根据特征延迟与标签形成过程设定；太短可能泄漏，太长会减少可用样本。",
      "相似度去重阈值先人工核对样本对，再做敏感性分析；不能只靠一个阈值宣称无泄漏。",
    ],
    settings: [
      {
        name: "Split key",
        start:
          "选择真实独立单位，如 patient_id、device_id、document family 或地点。",
        adjust:
          "发现跨分区相同或高度相近样本时，提升到更粗的 group 层级并重做评估。",
      },
      {
        name: "时间截止",
        start: "冻结 t₀，仅保留在 t₀ 之前且部署时可获取的字段。",
        adjust:
          "若字段有处理延迟，把截止提前；若未来信息不可避免，重新定义预测问题。",
      },
      {
        name: "预处理 fit 范围",
        start:
          "每个训练 fold 单独 fit imputer/scaler/selector，验证和测试只 transform。",
        adjust:
          "若流程中有自监督预训练或外部数据，明确记录其是否接触测试样本和标签。",
      },
    ],
    modifications: [
      "检索增强或 foundation model 任务中，还要审计预训练语料/索引与 benchmark 的重叠及时间范围。",
      "若只能取得现成随机分割，明确其相关性限制，并增加跨对象或跨时间测试。",
    ],
    pitfalls: [
      "先做标准化、特征选择、SMOTE，再交叉验证；这些操作已从 holdout 获取统计信息。",
      "把 test set 当成长期排行榜，多次试错后报告其中最高分。",
    ],
    example:
      "同一台设备每分钟生成日志，若随机按行分割，训练与测试几乎是相邻片段。按设备 ID 切分后准确率下降，反而更接近新设备上的真实表现。",
    compareTo: ["cohort-design", "model-evaluation", "external-validation"],
  },
  {
    id: "domain-shift",
    source: {
      label:
        "Moreno-Torres et al.: A unifying view on dataset shift in classification (2012)",
      url: "https://www.sciencedirect.com/science/article/pii/S0031320311002901",
    },
    title: "分布变了，旧规律还可靠吗",
    englishTitle: "Dataset & Domain Shift",
    category: "training",
    level: "进阶",
    duration: "12 分钟",
    icon: "⇢",
    summary:
      "训练、测试和使用环境的分布可能不同；要先识别变的是输入、标签比例，还是输入与标签的关系。",
    intuition:
      "在晴天学会认路，不代表雨夜也能看清。甚至路牌没变，目的地规则却变了。Shift 的类型不同，修复方法也不同。",
    core: "总体上 P_train(X,Y) 与 P_target(X,Y) 不同。Covariate shift 指 P(X) 变而 P(Y|X) 近似稳定；label/prior shift 指 P(Y) 变且 P(X|Y) 近似稳定；concept shift 指 P(Y|X) 变化。现实中这些假设不易确认，先用分组/时间/站点评估误差与 calibration，再决定收集目标域标签、重训、重加权或调整任务。",
    equation:
      "P_train(X,Y) ≠ P_target(X,Y);  covariate: P(X) 变；concept: P(Y|X) 变",
    mechanicsSteps: [
      "指定 source domain 和实际 target domain：人群、地点、时间、仪器、采集流程与标签定义。",
      "比较输入与标签的边际分布，以及关键子群的性能；不要只依据一个总体距离或单个 AUC 判断是否安全。",
      "在能获得目标域标签时检查 P(Y|X) 是否仍可用；区分输入比例变化、类别基率变化与概念关系变化。",
      "选择应对方式：收集目标域标注并重新训练/微调，或在假设合理时做加权与校准；最终在未参与调整的目标域样本复验。",
    ],
    whenToUse: [
      "模型从一个机构、年份、地区、设备或语言转移到另一处。",
      "上线后输入分布、阳性率或错误模式出现漂移时。",
    ],
    limits: [
      "只看无标签输入分布无法证明 P(Y|X) 没变；真正的目标域表现需要可核验的标签或可信代理。",
      "重要目标样本可能超出训练支持范围，此时重加权无法凭空学到从未见过的关系。",
    ],
    howToUse: [
      "写清目标使用环境，记录训练和目标数据的时间、采集流程、人口/对象组成和标签定义。",
      "比较特征分布、缺失率、基率与分组表现；绘制随时间的误差与校准曲线。",
      "优先获取一批独立目标域标签，建立不参与调参的目标域测试。",
      "若使用重要性加权，先检查 source/target 的支持重叠及权重极值；报告假设和有效样本量。",
      "改动模型或阈值后，在新的时间段或独立站点重做评估。",
    ],
    tuning: [
      "漂移监测窗口太短会有噪声，太长会延迟发现；按事件量和使用频率选择。",
      "重加权时裁剪极大权重可降低方差，但引入偏差；用目标域验证比较。",
      "微调强度受目标域标注量控制；样本少时从校准、head 或低学习率微调开始，并与旧模型比较。",
    ],
    settings: [
      {
        name: "目标域划分",
        start: "先保留一个独立地点或较晚时间段，不参与模型与阈值选择。",
        adjust: "若目标场景涵盖多地点或人群，分别报告，而不是仅用合并平均数。",
      },
      {
        name: "监测指标",
        start: "同时跟踪输入缺失、标签基率、性能和校准；设人工复核触发条件。",
        adjust:
          "只有无标签数据时把漂移信号当作调查线索，补充标签后再判定性能变化。",
      },
      {
        name: "适应策略",
        start: "先以未经适应的模型建立目标域 baseline，再试校准、微调或重训。",
        adjust:
          "当标签机制改变或训练覆盖不足时优先补数据与重定义任务，避免只调阈值。",
      },
    ],
    modifications: [
      "文本模型需额外看语言、领域词汇和标注规则；视觉模型需看相机、光照和压缩方式。",
      "多源训练可增加覆盖，但不能替代真正目标域的独立检验。",
    ],
    pitfalls: [
      "把任何性能下降都归因于 covariate shift，忽略标签定义或标注过程发生变化。",
      "在目标测试集上反复调整模型，然后仍称它为外部独立验证。",
    ],
    example:
      "在白天摄像头数据训练的目标检测器移到夜间：先看亮度与物体类别频率，再采集少量夜间标注检查每类召回；若夜间出现训练中没有的物体，仅做亮度归一化并不能解决。",
    compareTo: [
      "external-validation",
      "cohort-design",
      "calibration-uncertainty",
    ],
  },
  {
    id: "external-validation",
    source: {
      label:
        "Riley et al.: External validation of clinical prediction models using big datasets (BMJ, 2016)",
      url: "https://www.bmj.com/content/353/bmj.i3140",
    },
    title: "外部验证：换个地方还能用吗",
    englishTitle: "External & Temporal Validation",
    category: "training",
    level: "进阶",
    duration: "10 分钟",
    icon: "⊞",
    summary:
      "External validation 在独立时间、地点或人群上检验一个已经冻结的模型，回答能否迁移的问题。",
    intuition:
      "同一本练习册上留几页当考试，检验的是同一环境下是否学会；换一所学校或下一年的试卷，才更能看出模型是否适应新环境。",
    core: "训练内部随机 holdout 估计近似同分布表现，外部验证更接近新时间、地点、采集系统或人群。锁定模型、预处理、阈值与输出定义后，在新 cohort 上计算 discrimination、calibration、关键子群与置信区间。若看完外部结果后又重训或重定阈值，那组数据成为 adaptation/validation data，需要再找独立集合复验。",
    equation:
      "评估：frozen f(X_external) → discrimination + calibration + subgroup error",
    mechanicsSteps: [
      "冻结在开发队列选定的模型权重、预处理、标签定义、阈值和评估代码。",
      "选择独立外部队列，确认纳排、index date、输入可得性和 outcome horizon 与目标使用场景一致。",
      "完整运行冻结 pipeline，不在外部数据上重新 fit 特征处理；报告样本/事件数、总体和关键子群的性能与不确定性。",
      "解释差异来自分布、采集或结局定义的哪一部分；若决定更新模型，将新测试数据单独留出再复验。",
    ],
    whenToUse: [
      "准备将模型用于训练数据之外的时间、地点、机构、设备或人群前。",
      "论文或产品声称模型具有可迁移性、鲁棒性或广泛适用性时。",
    ],
    limits: [
      "一次外部验证只覆盖所选场景，不能证明所有未来环境都可靠。",
      "外部队列若结局定义不同或标签质量差，指标变化不能简单解释为模型本身失效。",
    ],
    howToUse: [
      "在看外部结果之前明确模型版本、阈值、主要指标和目标子群。",
      "核对开发和外部 cohort 的变量含义、采集时点、缺失处理与标签 horizon。",
      "分别报告 AUROC/PR 等 discrimination、校准曲线或 Brier score，以及阈值下的错误类型。",
      "按地点、年份、设备或人口子群展示表现和样本量，避免总平均掩盖失效。",
      "若需调整参数或重校准，把此队列标为适应数据，并用独立新队列确认调整效果。",
    ],
    tuning: [
      "外部队列选择由预期使用范围决定：时间外推用后续年份，地域外推用不同地点。",
      "样本量和事件数不足时估计不稳定；报告置信区间，不因单次数值好看而过度解读。",
      "指标需覆盖 ranking、probability 与行动阈值；阳性率变化时 PR 与阈值指标尤其要重算。",
    ],
    settings: [
      {
        name: "独立轴",
        start:
          "按预期迁移风险选择时间、地点、设备或人群中至少一个真正独立的轴。",
        adjust:
          "如果测试与训练共享同一实体或处理流程，扩大独立范围并重新定义验证名称。",
      },
      {
        name: "冻结内容",
        start: "锁定模型、特征变换、阈值、标签映射和主要指标。",
        adjust:
          "任何外部结果驱动的修改都要记作 model update，并在额外独立队列检验。",
      },
      {
        name: "报告粒度",
        start: "同时报告样本数、事件数、置信区间、总体与预先定义的子群。",
        adjust: "子群数据稀少时合并或延长收集窗口，并明确估计不稳定。",
      },
    ],
    modifications: [
      "在线模型可做前瞻性 shadow evaluation，但仍要冻结用于比较的版本和分析计划。",
      "跨语言或跨模态迁移要检查任务定义是否仍相同，不能只看输入表面变化。",
    ],
    pitfalls: [
      "把同一数据源的另一随机折称为外部验证；它没有测试来源或时间变化。",
      "在外部集合上优化阈值后，将同一集合上的提升当作独立证据。",
    ],
    example:
      "用 2023 年工厂 A 的传感器训练故障模型，在 2025 年工厂 B 上固定模型测召回、误报和概率校准；若需要用 B 的标签重新校准，应再用 B 的之后月份或工厂 C 检验。",
    compareTo: ["model-evaluation", "domain-shift", "cohort-design"],
  },
  {
    id: "calibration-uncertainty",
    source: {
      label:
        "Guo et al.: On Calibration of Modern Neural Networks (ICML, 2017)",
      url: "https://proceedings.mlr.press/v70/guo17a.html",
    },
    title: "模型的 90% 真的有九成把握吗",
    englishTitle: "Probability Calibration & Uncertainty",
    category: "training",
    level: "进阶",
    duration: "12 分钟",
    icon: "◔",
    summary:
      "Calibration 检查预测概率和实际频率是否匹配；它与分类正确率、排序能力和对未知输入的认识不同。",
    intuition:
      "天气预报若每次说“九成会下雨”，长期看这批日子也应约九成下雨。模型的 confidence 数字同样需要被核验；能把样本排对顺序，不代表概率可信。",
    core: "校准关注 P(Y=1 | p̂≈p)≈p。可用 reliability diagram、Brier score、log loss 和 ECE 作互补诊断；ECE 依赖分箱方式，不能独立作为真理。温度缩放在固定模型的验证集上拟合 T>0，再对 logits/T 做 softmax，能调整置信度而不改变多类 argmax 排序。校准不等于 epistemic uncertainty 或 OOD 检测，分布变化后需重新验证。",
    equation: "p̂_T = softmax(z/T);  Brier = (1/n)Σ(p̂ᵢ−yᵢ)²",
    mechanicsSteps: [
      "训练并冻结分类器，用独立验证集取得 logits 和真实标签，先检查准确率与置信度分布。",
      "将相近预测概率分组，比较每组平均置信度与实际正确率；同时看 Brier/log loss，注意分箱及子群样本量。",
      "如需改善概率，用验证 logits 拟合正温度 T 以最小化 NLL，再固定 T 应用到独立测试或部署数据。",
      "在时间、地点和关键子群上复查校准；若目标域改变，区分模型重训、再校准与阈值改变各自的作用。",
    ],
    whenToUse: [
      "输出概率会进入风险分层、资源分配、阈值决策或模型融合时。",
      "准确率不错但置信度过高、阈值跨环境失效，或需要比较不同子群的概率质量时。",
    ],
    limits: [
      "整体校准可以很好却在某些子群很差；因此需要分组检查并报告样本量。",
      "温度缩放在原验证分布有效不保证在未知域有效，也不能识别未见类别或解释不确定性来源。",
    ],
    howToUse: [
      "保留验证 logits，不要先只保存 argmax 类别；多类任务按任务需求检查 top-label 或 classwise 校准。",
      "画 reliability diagram，报告分箱和每箱样本数，并补充 Brier score 或 NLL。",
      "在独立验证集拟合 T；在测试集只应用固定 T，不让测试标签参与选择。",
      "按 cohort、时间、站点或关键群体复核校准，比较重新校准前后的概率质量。",
      "为决策阈值单独分析 precision/recall 与代价；不要把校准改进误作所有决策指标都提升。",
    ],
    tuning: [
      "温度 T=1 表示不变；T>1 通常软化过高置信度，但实际最优值须由验证集求得。",
      "分箱数量影响 ECE 方差与分辨率，展示多个合理分箱或采用平滑诊断避免单值误导。",
      "当验证集太小或目标域变化快时，再校准可能过拟合；优先补充数据并监测时段表现。",
    ],
    settings: [
      {
        name: "校准数据",
        start: "在训练之外保留与使用环境接近的有标签验证集。",
        adjust:
          "环境已变化时用新时间/地点的独立标签重新评估；重新拟合后另留测试。",
      },
      {
        name: "温度 T",
        start: "从 T=1 出发，在验证 logits 上优化 NLL 并约束 T>0。",
        adjust:
          "T 很大或很小时检查数据量、模型错误及标签质量，不能靠缩放修正错误排序。",
      },
      {
        name: "诊断粒度",
        start: "报告总体与关键子群的可靠性图、Brier/NLL 和样本数。",
        adjust: "分箱样本太少则合并箱或扩大数据；重要子群单独校验。",
      },
    ],
    modifications: [
      "二分类可考虑 Platt scaling 或 isotonic calibration，但更灵活的方法需要更多验证数据。",
      "若需要可信区间或 OOD 告警，应研究专门的不确定性与分布外方法，不把 softmax confidence 当作保证。",
    ],
    pitfalls: [
      "把 0.9 softmax 概率理解为模型有 90% 的“自知之明”，却没有用独立标签验证。",
      "在测试集拟合 T，或只报告总体 ECE 而忽略低基率与子群失准。",
    ],
    example:
      "一批图片预测中，模型说 0.9 的样本只有 0.7 实际正确。固定模型后在验证集上学习温度，让这批分数更接近频率；仍需在新相机数据上重新检查。",
    compareTo: ["model-evaluation", "domain-shift", "external-validation"],
  },
  {
    id: "class-imbalance",
    source: {
      label: "Lin et al.: Focal Loss for Dense Object Detection (ICCV, 2017)",
      url: "https://openaccess.thecvf.com/content_iccv_2017/html/Lin_Focal_Loss_for_ICCV_2017_paper.html",
    },
    title: "少数类稀少时怎么学",
    englishTitle: "Class Imbalance & Focal Loss",
    category: "training",
    level: "进阶",
    duration: "11 分钟",
    icon: "◕",
    summary:
      "多数类占据大部分梯度与指标时，先看每类错误，再决定权重、采样、focal loss 或阈值。",
    intuition:
      "一万张背景图里只有几十个目标，模型总说“没有”也能拿到好看的 accuracy。要让少数类的错被看见，同时留意误报会不会因此暴增。",
    core: "类别不平衡不自动代表要重采样。先报告基率、confusion matrix、每类 precision/recall 与 PR 曲线。类权重改变训练错误的相对代价；重采样改变 batch 组成；focal loss 的 (1−p_t)^γ 抑制易分类样本梯度；阈值选择改变预测决策而不改变训练模型。四者解决问题的层面不同，且都要在真实基率的独立验证/测试集评估。",
    equation: "Focal loss = −α_t(1−p_t)^γ log(p_t);  γ=0 时退回加权 CE",
    mechanicsSteps: [
      "统计训练、验证与预期部署的每类样本数和事件率，明确误报与漏报各自的代价。",
      "先用普通 cross-entropy 训练 baseline，检查 per-class recall、precision、PR 曲线及概率校准。",
      "若易负例淹没训练信号，比较 class weighting、训练集内重采样或 focal loss；它们分别改变代价、样本频率和难度权重。",
      "在保持自然基率的验证集选择阈值，在独立测试集报告 confusion matrix、每类指标及误报数量。",
    ],
    whenToUse: [
      "稀有事件识别、异常检测、密集目标检测或多标签任务中，少数类性能被总体 accuracy 掩盖。",
      "需要明确调节 precision/recall 或不同类别错误代价时。",
    ],
    limits: [
      "极少正例会让验证指标方差很大，重加权无法替代更多高质量标注。",
      "采样或权重会改变训练概率与校准；若需要可靠风险概率，应在自然分布上检查并可能重新校准。",
    ],
    howToUse: [
      "先检查标签质量与各分区基率，确认少数类不是编码错误或 cohort 选择造成。",
      "用真实基率验证集报告 PR-AUC、少数类 precision/recall 与具体误报数，不只报告 accuracy。",
      "先试普通 CE 和阈值选择；训练时确实被多数类主导，再加入 class weight 或 focal loss。",
      "任何过采样、欠采样或合成样本只在训练 fold 内完成，避免跨分区泄漏。",
      "最终阈值结合场景成本选定，另做 calibration 与时间/群体分层检查。",
    ],
    tuning: [
      "class weight 从轻度上调开始，观察少数类召回与多数类误报的交换；不要盲目使用极端反频率。",
      "focal γ 从 0 的 CE 基线开始逐步增大；太大可能忽视大量有用的易样本。",
      "阈值用验证集在明确的 precision 或 recall 目标下选择，部署基率变化时需复核。",
    ],
    settings: [
      {
        name: "主要指标",
        start: "预先指定每类 recall/precision、PR-AUC 与单位样本误报数。",
        adjust: "误报代价更高时提高精度约束，漏报代价更高时提高召回约束。",
      },
      {
        name: "类权重 / α",
        start: "先设无权重 CE；若少数类学不到，再小步提高其权重。",
        adjust: "观察梯度和误报；权重过大导致多数类大幅退化时回退。",
      },
      {
        name: "Focal γ / 阈值",
        start: "γ=0 是 CE 参照；阈值在自然基率验证集上独立选择。",
        adjust:
          "易负例仍主导时试更大 γ；若 calibration 或整体表现变差，回到简单损失。",
      },
    ],
    modifications: [
      "多标签任务逐标签设阈值，并避免把每个标签出现率差异简单汇总。",
      "稀有事件的评估可增加置信区间和不同时间段的基率分析，以免一次幸运切分误导。",
    ],
    pitfalls: [
      "为平衡类别而改变测试集比例，却把该测试 precision 当成实际使用结果。",
      "把 focal loss 当成万能默认值；样本难度可能来自错误标签，过度关注它们会更糟。",
    ],
    example:
      "1% 的图像含目标，永远预测背景可得 99% accuracy。先记录目标召回与每千张误报，再比较 CE、类权重和 focal loss；最终在保持 1% 基率的测试集复核阈值。",
    compareTo: [
      "loss-functions",
      "model-evaluation",
      "calibration-uncertainty",
    ],
  },
];
