import type { Exercise } from "./exerciseTypes";

type QuizSpec = {
  mechanism: [string, string[], number, string];
  decision: [string, string[], number, string];
};

const specs: Record<string, QuizSpec> = {
  "episodic-meta-learning": {
    mechanism: [
      "一个 5-way 3-shot episode 的 support 一共有多少个带标签样本？",
      ["5", "8", "15", "取决于 query 数"],
      2,
      "N-way K-shot 的 support 大小是 N×K，因此 5×3=15；query 必须另行采样。",
    ],
    decision: [
      "同一患者的一次检查进了 support，另一次检查进了 meta-test query。主要问题是什么？",
      ["学习率太小", "任务/实体泄漏使新任务评估虚高", "类别太少", "query 太多"],
      1,
      "meta split 应按真正的新任务单位隔离；同一患者跨集合会泄漏个体特征。",
    ],
  },
  "fomaml-reptile": {
    mechanism: [
      "Reptile 的外层更新方向主要是什么？",
      [
        "随机噪声",
        "任务适配后参数 θ′ 与初始化 θ 的差",
        "测试标签梯度",
        "只更新分类偏置",
      ],
      1,
      "Reptile 在任务内更新后，把初始化朝 θ′ 移动：θ←θ+ε(θ′−θ)。",
    ],
    decision: [
      "Reptile 使用每任务一步、同一个 support batch，表现像普通联合训练。先改什么？",
      [
        "删除 query",
        "增加不同 mini-batch 的 inner steps",
        "把 ε 设为 0",
        "使用测试任务训练",
      ],
      1,
      "多步且跨 batch 的任务内更新才会产生促进任务内泛化的高阶项。",
    ],
  },
  "matching-networks": {
    mechanism: [
      "Matching Networks 如何得到 query 的类别概率？",
      [
        "训练新线性 head",
        "把对 support 的 attention 按标签汇总",
        "只取全局均值",
        "对 query 聚类",
      ],
      1,
      "query 与每个 support 比较，相似度 softmax 后加权 one-hot 标签；同类权重相加。",
    ],
    decision: [
      "每类 support 数不同，模型明显偏向样本多的类。优先检查什么？",
      [
        "是否对所有 support softmax 导致类先验偏置",
        "是否使用 GPU",
        "是否增大词表",
        "是否删除温度",
      ],
      0,
      "样本级 attention 在每类数量不同时会隐含先验，应做类级聚合或平衡协议。",
    ],
  },
  "relation-networks": {
    mechanism: [
      "Relation Network 与 ProtoNet 的核心差异是什么？",
      [
        "不使用 embedding",
        "用可学习 relation module 代替固定距离",
        "必须更新测试标签",
        "只做回归",
      ],
      1,
      "Relation Network 学比较函数；ProtoNet 通常使用平方欧氏等固定度量。",
    ],
    decision: [
      "relation score 在训练类完美、未见类很差。最有信息的对照是什么？",
      [
        "继续加深 relation module",
        "同 backbone 的固定欧氏/余弦 metric 与更小 relation module",
        "使用 test 调参",
        "关闭类别置换",
      ],
      1,
      "可学习 metric 容易记训练任务，应与固定 metric 和容量消融比较。",
    ],
  },
  "siamese-triplet": {
    mechanism: [
      "d(a,p)=0.5、d(a,n)=1.2、margin=0.4 时 triplet loss 是多少？",
      ["0", "0.1", "0.7", "1.1"],
      0,
      "max(0,0.5−1.2+0.4)=max(0,−0.3)=0。",
    ],
    decision: [
      "训练中 99.9% triplet loss 为 0。优先做什么？",
      [
        "只增加 epoch",
        "检查负样本是否过易并引入可靠 semi-hard mining",
        "把所有标签打乱",
        "取消共享权重",
      ],
      1,
      "几乎全为零说明大多数 triplet 没有训练信号，需改善采样而非只延长训练。",
    ],
  },
  "meta-sgd-anil": {
    mechanism: [
      "ANIL 的 inner loop 通常更新什么？",
      ["整个 backbone", "任务 head", "测试 query 标签", "数据增强参数"],
      1,
      "ANIL 在 inner loop 固定 feature extractor，只快速更新 head；outer loop 仍可更新 backbone。",
    ],
    decision: [
      "跨域任务上 ANIL 明显弱于全 MAML。合理下一步是什么？",
      [
        "逐块增加参与 inner update 的后层并做消融",
        "冻结更多层",
        "使用 test 训练",
        "删除 support",
      ],
      0,
      "跨域可能需要改变表示，可逐层扩大适配范围并保持同一评估协议。",
    ],
  },
  "learned-optimizers": {
    mechanism: [
      "Learned optimizer 的 meta-objective 通常评价什么？",
      [
        "优化器网络的分类标签",
        "被优化模型展开若干步后的 loss",
        "参数文件大小",
        "只评价第一步梯度",
      ],
      1,
      "optimizer network 通过 optimizee 在更新轨迹后的表现得到 meta-gradient。",
    ],
    decision: [
      "训练只展开 20 步，测试到 500 步后发散。最关键的修复方向是什么？",
      [
        "只报前 20 步",
        "在训练中增加 horizon 多样性并做更长 stress test",
        "删除 baseline",
        "把梯度符号反转",
      ],
      1,
      "learned optimizer 容易对训练 horizon 过拟合，需要更长展开课程和分布外测试。",
    ],
  },
  "hypernetworks-meta-gradients": {
    mechanism: [
      "Hypernetwork 的输出是什么？",
      [
        "另一个网络的全部或部分参数",
        "固定数据标签",
        "测试集划分",
        "只是一项标量 loss",
      ],
      0,
      "Hypernetwork 根据 task/context embedding 生成 target network 权重、adapter 或 head。",
    ],
    decision: [
      "新任务表现异常好，但 task embedding 用了整个 query 集的均值。问题是什么？",
      ["query 信息泄漏进入适配", "batch 太小", "参数太少", "没有 softmax"],
      0,
      "适配器只能读取 support 或部署可得上下文；query 统计会污染外层评估。",
    ],
  },
  "memory-augmented-meta-learning": {
    mechanism: [
      "外部 memory 在 one-shot 任务里主要做什么？",
      [
        "永久修改模型权重",
        "快速绑定 episode 内样本与新标签",
        "生成测试标签",
        "替代所有 encoder",
      ],
      1,
      "可读写 memory 保存临时样本标签绑定，权重可保持不变。",
    ],
    decision: [
      "两个用户的预测相互影响。首先检查什么？",
      [
        "每个 task/session 是否独立初始化 memory state",
        "是否增大温度",
        "是否加类别",
        "是否关闭日志",
      ],
      0,
      "跨会话复用 memory 会直接造成上下文与标签泄漏。",
    ],
  },
  "meta-reinforcement-learning": {
    mechanism: [
      "RL² 中新任务的快速适配主要存在哪里？",
      [
        "recurrent hidden state",
        "固定测试标签",
        "优化器文件名",
        "环境随机种子",
      ],
      0,
      "策略权重慢速跨任务学习，trial 内 hidden state 汇总动作与奖励证据。",
    ],
    decision: [
      "测试任务能从 observation 中直接读出 task ID。为什么结果可疑？",
      [
        "agent 可能绕过探索，利用 ID 捷径",
        "奖励太稀疏",
        "模型参数太少",
        "query 太多",
      ],
      0,
      "Meta-RL 要检验从交互证据推断任务；泄漏 ID 会让探索问题消失。",
    ],
  },
  "cross-domain-few-shot": {
    mechanism: [
      "Cross-domain few-shot 比同域 class-disjoint 更难在哪里？",
      [
        "同时改变新类别与输入数据域",
        "不需要 support",
        "类别完全相同",
        "只能用线性模型",
      ],
      0,
      "meta-test 来自不同数据来源，表示本身也面临分布转移。",
    ],
    decision: [
      "目标域只有每类 2 张图。最稳妥的首个 baseline 是什么？",
      [
        "全模型大 LR 微调",
        "强预训练冻结 embedding + prototype/linear head",
        "从头训练超深网络",
        "用 target test 选层",
      ],
      1,
      "极少样本下先用低方差的冻结表示方法，再逐层验证是否需要解冻。",
    ],
  },
  "transfer-learning-strategies": {
    mechanism: [
      "逐层解冻的目的是什么？",
      [
        "先保留通用特征，再逐步增加目标任务可塑性",
        "删除预训练权重",
        "增加测试样本",
        "固定所有层",
      ],
      0,
      "从 head 和后层开始可减少小数据下对底层通用表示的破坏。",
    ],
    decision: [
      "标记冻结后验证仍漂移，发现 BatchNorm 在 train mode。应怎么做？",
      [
        "冻结 running statistics 或切 eval mode",
        "只把 LR 设为零",
        "增加类别",
        "修改测试标签",
      ],
      0,
      "冻结梯度不阻止 BatchNorm 更新统计量，需明确处理训练/推理模式。",
    ],
  },
  "domain-adaptation-dann": {
    mechanism: [
      "Gradient reversal 对 domain head 和 encoder 的作用分别是什么？",
      [
        "两者都反转",
        "domain head 正常最小化域损失，encoder 接收反向域梯度",
        "两者都冻结",
        "只更新标签",
      ],
      1,
      "GRL 在前向恒等，反向只把传给 feature extractor 的域梯度乘 −λ。",
    ],
    decision: [
      "domain accuracy 50%，target 任务却更差。应如何解释？",
      [
        "已证明完美对齐",
        "可能是 domain head 太弱或错误类被对齐，应检查任务和类条件",
        "只需增大 λ",
        "说明 test 有标签",
      ],
      1,
      "域不可分本身不保证保留任务结构，也可能只是判别器失败。",
    ],
  },
  "domain-generalization-irm": {
    mechanism: [
      "IRM 希望同一个什么在多个环境都最优？",
      [
        "classifier on learned representation",
        "随机种子",
        "测试标签",
        "batch size",
      ],
      0,
      "IRM 学表示，使同一 readout/classifier 在各训练环境上同时适用。",
    ],
    decision: [
      "所有 source 环境的伪相关方向都相同。IRM 能否可靠识别？",
      [
        "通常不能，环境变化没有暴露冲突",
        "一定可以",
        "只需把 λ 设无限大",
        "删除 ERM",
      ],
      0,
      "没有环境间变化就缺少识别稳定与伪相关的信号。",
    ],
  },
  "continual-learning": {
    mechanism: [
      "EWC 的 Fisher importance 用来做什么？",
      [
        "估计哪些旧任务参数应少移动",
        "选择测试样本",
        "增加类别数",
        "计算输入均值",
      ],
      0,
      "重要参数偏离旧最优会受到更强二次惩罚，从而减少关键能力遗忘。",
    ],
    decision: [
      "方法保存 10 倍 replay 数据却只与零内存基线比较准确率。缺少什么？",
      ["同内存预算对照与存储成本", "更大的 test", "更小模型名称", "更多颜色"],
      0,
      "持续学习必须在相同 memory/参数/计算预算下比较。",
    ],
  },
  "active-learning": {
    mechanism: [
      "BALD 试图选择哪类样本？",
      [
        "模型参数不确定性导致预测分歧大的样本",
        "最短文件",
        "已经标注的样本",
        "固定类别第一张",
      ],
      0,
      "BALD 衡量预测熵与条件熵之差，近似参数后验带来的信息增益。",
    ],
    decision: [
      "entropy 策略反复选异常损坏图。合理修复是什么？",
      [
        "加入 OOD/density 过滤与 diversity，并保留随机基线",
        "降低所有分辨率",
        "删除 validation",
        "只选最高 entropy",
      ],
      0,
      "不确定性高可能来自无价值异常点，应结合代表性和可标注性。",
    ],
  },
  "multi-task-learning": {
    mechanism: [
      "两个任务 gradient cosine 为负通常表示什么？",
      ["共享参数上的更新方向冲突", "两任务完全相同", "没有梯度", "测试泄漏"],
      0,
      "负 cosine 表示一个任务的局部下降方向可能伤害另一个任务。",
    ],
    decision: [
      "总 loss 下降但主任务变差。第一步应做什么？",
      [
        "检查任务采样、loss/gradient 尺度并与 single-task 比较",
        "继续加辅助任务",
        "删除主任务指标",
        "用 test 调权重",
      ],
      0,
      "总 loss 会掩盖任务权重与负迁移，需看每任务证据。",
    ],
  },
  "automl-hpo-nas": {
    mechanism: [
      "DARTS 为什么称为可微架构搜索？",
      [
        "用连续 architecture weights 混合候选操作并求梯度",
        "枚举所有离散网络",
        "不训练权重",
        "只随机搜索",
      ],
      0,
      "连续松弛让 architecture parameters 可沿 validation objective 更新。",
    ],
    decision: [
      "搜索 10,000 个配置后只报最佳 validation 与一次 test。最大风险是什么？",
      [
        "对 validation 过拟合与 winner's curse",
        "参数太少",
        "无法用 GPU",
        "query 太多",
      ],
      0,
      "大量尝试会选择到验证噪声赢家，需要额外 holdout、多 seed 重训并报告总试验数。",
    ],
  },
  "curriculum-self-paced": {
    mechanism: [
      "Curriculum 与 self-paced 的主要区别是什么？",
      [
        "前者外部定义难度/顺序，后者按当前模型 loss 选择",
        "前者无数据",
        "后者不训练",
        "没有区别",
      ],
      0,
      "self-paced 的样本权重依赖模型当前状态，而 curriculum 可由人或外部规则预设。",
    ],
    decision: [
      "高 loss 样本主要来自少数群体，self-paced 长期不纳入。应怎么做？",
      [
        "按群体审计并保证最终覆盖，必要时改难度规则",
        "永久删除",
        "只看平均",
        "缩小 test",
      ],
      0,
      "难度选择可能放大代表性偏差，必须看群体覆盖和最终性能。",
    ],
  },
  "federated-learning": {
    mechanism: [
      "FedAvg 为什么按客户端样本数加权？",
      [
        "近似集中数据上的样本平均目标",
        "让小客户端永远消失",
        "保证差分隐私",
        "减少模型层数",
      ],
      0,
      "按 nk 加权使每个本地样本在全局目标中获得相近权重，但不自动解决公平性。",
    ],
    decision: [
      "数据不离开设备，能否直接声称完全隐私？",
      [
        "不能，updates 仍可能泄漏，还需安全聚合/DP与治理",
        "能",
        "只有 GPU 才能",
        "取决于 batch 颜色",
      ],
      0,
      "Federated learning 是数据位置架构，不等于形式化隐私保证。",
    ],
  },
  "test-time-adaptation": {
    mechanism: [
      "TENT 通常更新哪些参数？",
      [
        "normalization statistics 与 affine 参数",
        "所有测试标签",
        "完整训练集",
        "只更新输出类别名",
      ],
      0,
      "TENT 限制更新到归一化相关状态，并最小化测试预测熵。",
    ],
    decision: [
      "测试 entropy 下降但类别全塌到一个。应该怎么做？",
      [
        "触发停止/回滚并检查类别分布",
        "继续多更新",
        "只报 entropy",
        "删除 source checkpoint",
      ],
      0,
      "更自信不等于更准确；类别坍塌是需要回滚的失败模式。",
    ],
  },
  "semi-supervised-self-training": {
    mechanism: [
      "FixMatch 的 pseudo-label 来自哪一路？",
      [
        "weak augmentation 的高置信预测",
        "strong augmentation 的真实标签",
        "test label",
        "随机类别",
      ],
      0,
      "弱增强产生较稳定的候选标签，强增强分支拟合它的一致性。",
    ],
    decision: [
      "少数类几乎没有 pseudo-label。优先做什么？",
      [
        "按类检查置信校准与阈值/分布对齐",
        "删除少数类",
        "进一步提高统一阈值",
        "使用 test 伪标签",
      ],
      0,
      "统一阈值会使校准差或难类失去训练信号，应做 class-aware 审计。",
    ],
  },
  "online-learning-drift": {
    mechanism: [
      "Prequential evaluation 的顺序是什么？",
      [
        "先预测，标签到达后计分并更新",
        "先用当前标签训练再预测同一样本",
        "随机打乱",
        "只训练不评估",
      ],
      0,
      "test-then-train 模拟真实在线时序，避免当前标签提前进入预测。",
    ],
    decision: [
      "只有输入 PSI 上升、暂时没有成熟标签。可以得出什么？",
      [
        "这是调查信号，不能直接断言准确率下降",
        "已证明 concept drift",
        "模型一定失效",
        "应立即用 test 训练",
      ],
      0,
      "p(x) 变化不等于 p(y|x) 已变化，需要延迟标签、抽检或其他证据确认。",
    ],
  },
};

export const metaLearningExercises: Record<string, Exercise[]> =
  Object.fromEntries(
    Object.entries(specs).map(([lessonId, spec]) => [
      lessonId,
      (["mechanism", "decision"] as const).map((kind) => {
        const [question, options, answer, explanation] = spec[kind];
        return {
          id: `${lessonId}-${kind}`,
          kind,
          question,
          options,
          answer,
          explanation,
        };
      }),
    ]),
  );
