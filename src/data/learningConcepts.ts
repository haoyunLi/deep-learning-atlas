import type { Lesson } from "./lessons";

export const learningConceptLessons: Lesson[] = [
  {
    id: "prediction-heads",
    source: {
      label: "Hugging Face Transformers: How models solve tasks",
      url: "https://huggingface.co/docs/transformers/main/tasks_explained",
    },
    title: "Prediction head：最后一步怎么预测",
    englishTitle: "Prediction Heads & Task Outputs",
    category: "foundations",
    level: "入门",
    duration: "10 分钟",
    icon: "◫",
    summary:
      "Backbone 产生通用特征，prediction head 把它们变成任务需要的 logits、数值或像素标签。",
    intuition:
      "同一本百科可以接不同的答题纸：BERT 读完句子后，分类 head 给整句打标签；token head 给每个词打标签；LM head 给每个位置的词表打分。head 是输出接口，不等于网络的全部能力。",
    core: "先定义预测单位，再选择聚合方式和输出维度：sequence classification 通常取 pooled/CLS 表示，token classification 保留每个 token，segmentation 保留空间网格，causal LM 在每个位置投影到 vocabulary。Head 常是线性层，也可以是小 MLP 或解码器。输出 logits 通常交给对应 loss；冻结 backbone 并只训练线性 head 才是 linear probe；冻结后训练 MLP 是非线性特征探针，解冻 backbone 则是微调。不要把 prediction head 与 multi-head attention 中的 attention head 混为一谈。",
    equation:
      "h = backbone(x);  z = W·pool(h)+b（句级）；zₜ = W·hₜ+b（token/像素级）",
    mechanicsSteps: [
      "写明输入和标签的粒度：一个样本一个标签、每个 token 一个标签、每个像素一个标签，还是下一个 token。",
      "让 backbone 产生隐藏表示 H，并只在需要时做 pooling；token/像素任务若先压成一个向量就丢了位置。",
      "用 head 把隐藏维度映射到输出维度：K 类得到 K 个 logits，回归得到连续值，LM 得到词表大小的 logits。",
      "用匹配的 loss 训练 head；若同时训练 backbone，梯度经过 head 回到特征层。验证时检查形状、阈值和每类错误。",
    ],
    whenToUse: [
      "复用预训练 encoder/CNN/Transformer 到一个具体下游任务时。",
      "想区分是特征不够好，还是任务接口与标签粒度设置不对时。",
    ],
    limits: [
      "线性 head 只能从已有表示中读出近似线性可分的信息；表示不含任务信号时需微调或换 backbone。",
      "Head 输出的 softmax 分数不是自动校准的真实概率；部署阈值与可靠性要在独立数据上检验。",
    ],
    howToUse: [
      "先列出 H 的形状和标签形状，手算一个 batch 的预期 logits 维度。",
      "分类从线性 head + cross-entropy 起步；回归用合适的连续值 loss，分割先对齐原图尺寸与 ignore index。",
      "少量标注时先冻结 backbone 训练 head，记录 linear probe 基线，再比较小学习率全模型微调。",
      "在一小批样本上检查标签映射、padding mask、loss 和梯度，之后再选阈值并看分组指标。",
    ],
    tuning: [
      "训练 loss 都降不下去先检查粒度、维度和标签；别急着堆多层 head。",
      "训练好而验证差时降低 head 容量、加 dropout/weight decay 或减少 backbone 更新。",
      "少数类漏检时先看 per-class 结果，再调类权重或决策阈值；阈值不等于训练参数。",
    ],
    settings: [
      {
        name: "输出粒度与维度",
        start: "整句 K 类用 [batch,K]；token/像素 K 类保留序列/网格维度。",
        adjust:
          "形状不匹配时先核对标签和 pooling；不要用 reshape 掩盖语义错误。",
      },
      {
        name: "冻结范围",
        start: "先冻结 backbone 跑线性 head，得到低成本基线。",
        adjust:
          "验证性能不足且数据足够时解冻后层或全模型，用更小的 backbone 学习率。",
      },
      {
        name: "Head 容量",
        start: "先用一层线性映射，必要时加入 dropout。",
        adjust: "表示可用但边界复杂时比较小 MLP；过拟合则退回线性层。",
      },
    ],
    modifications: [
      "多标签任务用每类独立 logit 与 BCE，不能把互斥类别的 softmax 直接套用。",
      "检测/分割任务加入保留空间信息的解码器或多尺度 head；序列生成用词表投影与 causal mask。",
    ],
    pitfalls: [
      "把 attention head 当作最后的分类层：前者在 block 内并行混合信息，后者负责任务输出。",
      "在分类交叉熵前重复 softmax，或在 token 任务错误地只取 CLS，都会让训练与目标错位。",
    ],
    example:
      "用 BERT 做病历主题分类：取句级表示接 3 类线性 head；做实体抽取时改为对每个 token 输出 BIO logits，并排除 padding 标签。",
    compareTo: ["attention-heads", "linear-probe", "bert", "loss-functions"],
  },
  {
    id: "attention-heads",
    source: {
      label: "Vaswani et al.: Attention Is All You Need, §3.2.2",
      url: "https://arxiv.org/abs/1706.03762",
    },
    title: "Attention head：多视角读上下文",
    englishTitle: "Multi-Head Attention",
    category: "sequence",
    level: "进阶",
    duration: "11 分钟",
    icon: "✺",
    summary:
      "把 Q/K/V 投影到多个子空间，分别读取上下文，再拼接成下一层的表示。",
    intuition:
      "读一句话时可同时追踪代词指向、语法依赖和主题线索。多个 attention heads 是多组可学习的查询方式，但不能预设每个 head 都有单一可解释语义。",
    core: "对同一 H，用每个 head 独立的 WQ、WK、WV 得到 Qᵢ/Kᵢ/Vᵢ。每头计算 masked softmax(QᵢKᵢᵀ/√dₖ)Vᵢ，拼接后通过 WO 回到 model width。常见实现把 d_model 划成 h 个等宽头，因此 d_head=d_model/h；需要可整除，但变体可能不同。Attention head 是 block 内的信息混合单元，prediction head 是网络末端的任务映射。",
    equation: "headᵢ=softmax(QᵢKᵢᵀ/√dₖ+mask)Vᵢ;  MHA=Concat(head₁,…,headₕ)Wᴼ",
    mechanicsSteps: [
      "给定 H 的 [batch,tokens,d_model]，用三组投影并 reshape 为 [batch,heads,tokens,d_head]。",
      "每头对允许的 token 配对计算缩放相似度；在 softmax 前施加 padding 或 causal mask。",
      "把权重乘 V 得到各头上下文，再 concat、乘输出矩阵 WO，送入 residual 与下一层。",
      "检查每头维度、mask 广播和输出形状；用改变未来 token 的实验确认 causal attention 没有偷看。",
    ],
    whenToUse: [
      "Transformer 中需要并行建模多个上下文关系时。",
      "要理解 head 数、每头维度、KV cache 和长上下文成本的关系时。",
    ],
    limits: [
      "更多 heads 不保证质量更好；固定 d_model 下每头会更窄，性能要在相同预算下比较。",
      "Head 权重不是可靠的因果解释；标准密集注意力仍需处理长序列的配对成本。",
    ],
    howToUse: [
      "先选 d_model 与成熟架构，再选可整除且已有实践验证的 head 数。",
      "按任务设置 mask：BERT 可双向读取，生成式 decoder 必须遮住未来 token。",
      "用张量形状断言验证 Q/K/V 与 concat 后维度，并用小序列测试被遮位置。",
      "固定总宽度和计算预算比较 head 数；记录质量、显存和延迟，而非只看训练 loss。",
    ],
    tuning: [
      "若 head 增加后结果变差，检查 d_head 太窄或训练预算不足，再回退。",
      "若长上下文显存过高，先检查 attention 实现、序列长度和 batch，再考虑结构改变。",
      "若生成任务验证分数异常好，优先排查 causal mask 和目标错位。",
    ],
    settings: [
      {
        name: "Head 数 h",
        start: "沿用匹配预训练骨干的 h，使 d_model 能按实现要求整除。",
        adjust: "固定参数与 token 预算做消融；增加 h 不增益就恢复较少头。",
      },
      {
        name: "每头维度 d_head",
        start: "常规实现取 d_model/h，并核查 Q/K/V reshape。",
        adjust: "头太窄时减少 h 或增加宽度，同时重算显存与 FLOPs。",
      },
      {
        name: "Mask 与长度",
        start: "编码任务处理 padding；自回归任务另加 causal mask。",
        adjust: "遇到未来泄漏先修 mask；证据被截断才增加长度。",
      },
    ],
    modifications: [
      "Cross-attention 让 query 来自解码器、key/value 来自编码器；它仍可有多个 heads。",
      "长序列可比较局部/稀疏注意力或精确的省显存 kernel，并核对信息可达范围。",
    ],
    pitfalls: [
      "把 head 数当成输出类别数；它们是完全不同的维度。",
      "把 attention map 当作模型为什么正确的完整证据，忽略残差、MLP 和其他层。",
    ],
    example:
      "d_model=512、h=8 时，常规等宽实现每头 64 维；8 个 64 维结果拼接回 512 维，再经 WO 混合。",
    compareTo: [
      "attention",
      "transformer",
      "prediction-heads",
      "grouped-query-attention",
      "kv-cache",
    ],
  },
  {
    id: "zero-shot-learning",
    source: {
      label:
        "Radford et al.: Learning Transferable Visual Models From Natural Language Supervision",
      url: "https://arxiv.org/abs/2103.00020",
    },
    title: "Zero-shot：目标任务没有示例",
    englishTitle: "Zero-Shot Transfer & Evaluation",
    category: "representation",
    level: "入门",
    duration: "10 分钟",
    icon: "0",
    summary:
      "模型无需目标任务标注样本更新参数，也可凭预训练知识和任务说明给出预测。",
    intuition:
      "第一次给你一套新的鸟类名称，却不给已标注的鸟照片。若模型已有图文共同表示，就可比较照片与各类文字描述的相似度。这里的‘零’是目标任务示例数，不是模型从未见过任何相关知识。",
    core: "Zero-shot 要明确相对哪个任务、标签集和训练阶段。CLIP 零样本分类把类别名变成文本 prompt，与图像 embedding 比相似度；语言模型可仅凭指令回答，没有目标任务示例或参数更新。预训练覆盖、标签措辞、候选类和数据泄漏都会影响结果。Zero-shot 不是‘无需验证’，也不保证未见分布可靠。",
    equation:
      "ŷ = argmaxᵧ sim(f_image(x), f_text(prompt(y)))；目标任务 shots = 0",
    mechanicsSteps: [
      "先定义目标任务、训练/评估边界与允许使用的信息，核查目标测试样本和标签未混入适配过程。",
      "把任务描述、候选类别或指令写成模型能读的输入；CLIP 对每个类别构造文本描述并编码。",
      "保持模型参数不变，对新样本计算输出；CLIP 比相似度，生成 LM 则按提示生成或判别。",
      "在固定的独立测试集评估每类与群体结果，并报告 prompt 模板、候选集及所用预训练模型。",
    ],
    whenToUse: [
      "新任务缺少标注样本，需要快速建立预训练模型基线时。",
      "开放词汇检索、类别可用语言描述、或需比较模型迁移能力时。",
    ],
    limits: [
      "‘未提供目标示例’不等于训练语料中毫无相关概念；若预训练集与测试集重叠，结论可能偏乐观。",
      "Prompt、候选标签与领域差距会明显改变结果；专业或高风险应用需目标人群验证。",
    ],
    howToUse: [
      "写明 zero-shot 的操作定义：0 个目标任务示例、哪些文本说明允许、是否完全不更新权重。",
      "从官方预处理和预训练权重起步，保存版本与候选标签列表。",
      "用非测试数据选择少量语义等价的模板，固定后才运行最终测试。",
      "报告 per-class 指标并与多数类、随机或简单特征基线比较；再决定是否收集 few-shot 标注。",
    ],
    tuning: [
      "类别名模糊时写更具体的可见属性或任务定义，避免偷偷加入答案线索。",
      "同义 prompt 差异大时用事先确定的模板集或领域验证集选择，但要保留独立测试集。",
      "领域表现差时比较冻结特征线性探针或少量领域适配，并重新标注为 few-shot/finetuned 结果。",
    ],
    settings: [
      {
        name: "Shots",
        start: "目标任务示例数固定为 0，任务说明和类别名可提供。",
        adjust:
          "一旦加入示例，明确改报 one-/few-shot；一旦更新参数，另报 fine-tuning。",
      },
      {
        name: "Prompt 模板",
        start: "每类采用同一种中性模板，先检查词义是否准确。",
        adjust: "措辞敏感时在验证集比较多个对称模板，测试前锁定。",
      },
      {
        name: "候选标签集",
        start: "固定真实部署会出现的候选类，并报告类别定义。",
        adjust: "新增/删除候选类会改变分类难度，必须重新评估。",
      },
    ],
    modifications: [
      "零样本图像任务可从 CLIP 式图文匹配扩展到开放词汇检索。",
      "获得少量标注后比较 linear probe、prototype 或参数高效微调。",
    ],
    pitfalls: [
      "反复用测试集挑 prompt，却仍声称严格 zero-shot 泛化评估。",
      "把 zero-shot 理解为‘模型没有训练过’，忽视大量预训练带来的先验。",
    ],
    example:
      "要识别新拍的 5 种鸟，用 CLIP 编码照片与 5 条对称的类别描述，按相似度选最大者；对未覆盖物种与模糊图片单独检查错误。",
    compareTo: [
      "few-shot-learning",
      "clip",
      "linear-probe",
      "in-context-learning",
    ],
  },
  {
    id: "few-shot-learning",
    source: {
      label: "Brown et al.: Language Models are Few-Shot Learners",
      url: "https://arxiv.org/abs/2005.14165",
    },
    title: "Few-shot：少量示例怎么用",
    englishTitle: "Few-Shot Learning & Prompting",
    category: "representation",
    level: "入门",
    duration: "11 分钟",
    icon: "ₖ",
    summary:
      "目标任务只有少量样本；可放进 prompt，也可用于原型、线性分类器或少步微调。",
    intuition:
      "给模型三份‘输入→正确输出’示范，然后问第四题，属于 few-shot prompting。把那三份用来更新一个分类器则也是 few-shot 适配，但机制完全不同。",
    core: "Few-shot 只描述目标任务示例少，不能替代方法名。LLM in-context few-shot 把 demonstrations 放在上下文，推理时权重不更新；metric 方法用 N-way K-shot support set 计算新类原型；gradient 方法在少量标注上更新参数。必须报告 K、类别数 N、抽样次数、是否更新权重以及测试集划分。原论文 GPT-3 的 few-shot 设置无梯度更新，不能推广到所有 few-shot 方法。",
    equation:
      "N-way K-shot：每个 episode 有 N 个类、每类 K 个 support；meta-test 的 query 标签仅用于评估",
    mechanicsSteps: [
      "定义新任务与示例预算：N-way K-shot 或 prompt 内 K 个演示，并保证 query/test 不进入 support。",
      "选适配机制：直接放进上下文、用冻结 embedding 算 prototype/训线性层，或做少步参数更新。",
      "在新任务测试时只用允许的 support 适配，再对隔离的 query 预测；ProtoNet/MAML 的 meta-training 则会用训练任务的 query loss 更新共享表示或初始化。",
      "重复多个随机任务/示例抽样，报告均值、波动和 zero-shot 基线，记录每次使用的模型与样例。",
    ],
    whenToUse: [
      "有少量但难以大规模标注的新类别或新格式任务时。",
      "希望研究表示是否容易迁移，或比较 prompting、prototype 与微调时。",
    ],
    limits: [
      "极少样本会带来高方差；一组示例上的高分不能代表稳定表现。",
      "Few-shot prompting 受上下文长度和示例顺序影响；few-shot 微调则可能迅速过拟合。",
    ],
    howToUse: [
      "写清 N、K、任务数、各类 support/query 数，以及类是否在训练期出现。",
      "先跑 zero-shot 和冻结 embedding 基线，再选择 prompt、prototype 或参数更新。",
      "若用 prompt，示例格式保持一致且标签平衡；若训练 head，只从 support 学参数。",
      "跨多个抽样种子与任务报告结果，并保留一次性独立测试集。",
    ],
    tuning: [
      "Prompt 示例若长度超预算，优先去掉冗长说明而保留标签定义与代表性样例。",
      "Support 不平衡时检查每类错误并重做有记录的分层抽样。",
      "微调过拟合时减少更新步数、提高正则或退回冻结特征原型。",
    ],
    settings: [
      {
        name: "K-shot 预算",
        start: "预先固定每类或每任务的 K，并把 query 完全隔离。",
        adjust: "画性能随 K 变化的曲线；不要只报告最幸运的一组样本。",
      },
      {
        name: "适配方式",
        start: "先试无更新的 prompt 与冻结 embedding 基线。",
        adjust: "稳定不足且有标注时比较 prototype、线性 head 或少步微调。",
      },
      {
        name: "示例选择",
        start: "分层随机抽样、固定种子，记录示例顺序。",
        adjust: "若顺序敏感，重复置换并报告波动；按规则选例要在测试前确定。",
      },
    ],
    modifications: [
      "类别扩展可用 Prototypical Networks 通过 support 均值加入新类。",
      "任务来自共同分布时可用 MAML 学一个容易少步适配的初始化。",
    ],
    pitfalls: [
      "把 few-shot prompting 称为模型权重学习，却未发生梯度更新。",
      "把 query/test 标注反复用于挑选 support 示例，造成评估泄漏。",
    ],
    example:
      "5-way 3-shot 新物种分类：每个新物种给 3 张带标签图片，15 张构成 support；另外的图片是 query。可比较 CLIP 特征原型与训练 5 类线性 head。",
    compareTo: [
      "zero-shot-learning",
      "in-context-learning",
      "prototypical-networks",
      "meta-learning-maml",
    ],
  },
  {
    id: "in-context-learning",
    source: {
      label: "Brown et al.: Language Models are Few-Shot Learners",
      url: "https://arxiv.org/abs/2005.14165",
    },
    title: "In-context learning：示例放在上下文",
    englishTitle: "In-Context Learning (ICL)",
    category: "sequence",
    level: "进阶",
    duration: "11 分钟",
    icon: "⌗",
    summary:
      "模型根据当前 prompt 中的指令和示例调整输出行为，推理时参数保持不变。",
    intuition:
      "像考场前看几道样题：接下来的回答会沿用题目格式，但书本没有被重新印刷。Prompt 离开上下文后，这次适配通常不会自动保存在模型权重里。",
    core: "把任务说明、可选 demonstrations 与新 query 串进同一上下文，让预训练自回归 LM 预测后续 token。Zero-shot ICL 可以没有示例，one-/few-shot ICL 则加 1/少量示例。推理不执行反向传播或权重更新；注意模型可能只是识别已有模式，不能凭表现证明形成了新知识。ICL 与 fine-tuning 的成本、持久性和数据边界不同。",
    equation: "p(answer | instruction, demonstrations, query; θ固定)",
    mechanicsSteps: [
      "给出明确任务指令、输入字段和输出格式，预留足够 context 给真实 query。",
      "可选加入几组干净的输入→输出示例，保持分隔符、标签顺序和格式一致。",
      "将新 query 接在相同模板后，固定模型 θ 生成答案；无需 optimizer 或训练轮次。",
      "从输出中解析目标字段，比较 zero/one/few-shot、示例顺序与不同任务样本的表现。",
    ],
    whenToUse: [
      "需快速改变模型回答格式、任务规则，且不便更新模型权重时。",
      "只掌握少量示例，想先测预训练模型是否已具备相关能力时。",
    ],
    limits: [
      "示例占用上下文并增加推理成本；长输入截断时，前面的说明可能失效。",
      "ICL 可能受示例顺序、表面格式和预训练污染影响，不能视为稳定的持久训练。",
    ],
    howToUse: [
      "先写零样本基线，明确输入输出 schema 与成功指标。",
      "从少量代表性且无测试泄漏的示例开始，统一格式和分隔符。",
      "固定模型版本、推理设置和 prompt，测试不同样本与顺序。",
      "若成本、上下文长度或稳定性不满足要求，再考虑检索示例或有训练集的微调。",
    ],
    tuning: [
      "输出偏格式时增加一条格式示范或更明确的字段约束。",
      "示例顺序导致结果摇摆时重复置换、平衡类别并测多次。",
      "上下文超限时减少冗余演示或改用检索选例，保持 query 和核心规则完整。",
    ],
    settings: [
      {
        name: "演示数 K",
        start: "先测 K=0，再用少量高质量示例观察增益。",
        adjust: "收益停止或成本过高时减少 K；不得用测试答案挑例。",
      },
      {
        name: "格式与分隔符",
        start: "每例使用一致的 Input/Output 字段，并明确结束位置。",
        adjust: "模型复制错误格式时检查示例一致性与输出解析。",
      },
      {
        name: "上下文预算",
        start: "预留系统/任务说明、示例、query 和输出所需 token。",
        adjust: "截断发生时先缩短示例，再考虑更长上下文模型。",
      },
    ],
    modifications: [
      "难推理问题可比较带中间步骤示例的 chain-of-thought prompting。",
      "示例库很大时，可用检索为每个 query 选相关演示，但必须避免标签泄漏。",
    ],
    pitfalls: [
      "把上下文内行为变化误认为权重已经被训练；新请求不带演示通常不会保留该规则。",
      "在调 prompt 时查看最终测试答案并反复修改，令评估集变成开发集。",
    ],
    example:
      "给语言模型两条‘患者叙述→结构化症状字段’的格式示例，再输入第三条叙述；模型按同一格式输出，权重未改变，实际医学使用还需专业验证。",
    compareTo: [
      "few-shot-learning",
      "zero-shot-learning",
      "chain-of-thought-prompting",
      "transfer-lora",
      "retrieval-augmented-generation",
    ],
  },
  {
    id: "chain-of-thought-prompting",
    source: {
      label:
        "Wei et al.: Chain-of-Thought Prompting Elicits Reasoning in Large Language Models",
      url: "https://arxiv.org/abs/2201.11903",
    },
    title: "CoT：把中间步骤也作为提示",
    englishTitle: "Chain-of-Thought Prompting",
    category: "sequence",
    level: "进阶",
    duration: "10 分钟",
    icon: "↳",
    summary: "在 prompt 里展示或要求中间推理步骤，以改善某些多步任务的输出。",
    intuition:
      "只给‘题目→答案’与给‘题目→分解步骤→答案’，模型续写的模式不同。CoT 让模型先生成中间文本，再生成结论；中间文本可以有帮助，也可能貌似合理却算错。",
    core: "原始 few-shot CoT 在 demonstrations 里同时写问题、中间步骤与答案；zero-shot CoT 可以用通用指令引导逐步作答。两者都属于 prompting，不必更新参数。对数学、常识与符号问题的收益依模型和任务而变，不能把生成的解释当成真实因果轨迹。评估最终答案，并检查中间步骤是否一致。",
    equation: "p(rationale, answer | question, CoT examples; θ固定)",
    mechanicsSteps: [
      "先识别题目是否需要多步计算、条件组合或规划，并建立直接回答的 baseline。",
      "准备少量正确、简短、格式一致的‘问题→步骤→答案’演示；若零样本则只给清楚的逐步指令。",
      "保持模型参数不变生成中间步骤和答案，约束输出字段以便解析。",
      "单独检查最终答案正确率、步骤一致性、token 成本与难题/易题差异。",
    ],
    whenToUse: [
      "算术、符号操作、条件链等确实需要多步处理的任务。",
      "直接回答基线反复漏掉步骤，且额外 token 成本可接受时。",
    ],
    limits: [
      "流畅的步骤可能是错误或事后编造；CoT 不保证答案正确，也不证明真实内部推理过程。",
      "多一步生成增加延迟与成本，简单抽取或分类任务可能没有收益。",
    ],
    howToUse: [
      "先跑无 CoT 的相同模型和样本，确定需要解决的错误类型。",
      "Few-shot CoT 使用已核查的短步骤示例；zero-shot CoT 不放示例，并分别报告设置。",
      "在固定评估集对齐模型、解码、样本数，只改变提示方式。",
      "对重要计算再用规则、代码或外部工具核验，记录 token 成本与错误案例。",
    ],
    tuning: [
      "中间步骤冗长而无增益时减少示例长度或直接回答。",
      "步骤频繁偏题时明确输出结构并用更贴近任务的正确示例。",
      "高温度下结果摇摆时先固定较低随机性，再比较多次采样策略。",
    ],
    settings: [
      {
        name: "提示类型",
        start: "分别试直接回答、zero-shot CoT、few-shot CoT。",
        adjust: "只有在相同测试协议下显著改善时才保留更长提示。",
      },
      {
        name: "步骤示例",
        start: "从少量已核查、覆盖主要题型的短示例开始。",
        adjust: "步骤有错会污染输出；先纠正示例，再考虑增加数量。",
      },
      {
        name: "生成预算",
        start: "给中间步骤和最终答案留足 token，并明确答案字段。",
        adjust: "输出被截断才提高上限；无收益时缩短推理文本。",
      },
    ],
    modifications: [
      "可将多次采样的最终答案做一致性比较，但额外计算成本要计入。",
      "对可验证任务，把语言步骤与代码执行或规则校验组合。",
    ],
    pitfalls: [
      "把 CoT 与 cohort 混淆：前者是 chain-of-thought 提示，后者是研究/数据队列。",
      "只展示看起来合理的步骤，却不检查最终正确率和可复现性。",
    ],
    example:
      "问‘原有 7 件，卖 2 件又到货 4 件，还剩多少？’时，CoT 示例先列 7−2=5，再列 5+4=9；最终以 9 为答案，仍需核对计算。",
    compareTo: [
      "in-context-learning",
      "few-shot-learning",
      "gpt-language-model",
    ],
  },
  {
    id: "linear-probe",
    source: {
      label:
        "Chen et al.: A Simple Framework for Contrastive Learning of Visual Representations",
      url: "https://arxiv.org/abs/2002.05709",
    },
    title: "Linear probe：冻结特征后读答案",
    englishTitle: "Linear Probing",
    category: "representation",
    level: "进阶",
    duration: "9 分钟",
    icon: "⊸",
    summary:
      "冻结预训练 encoder，只训练线性任务 head，检验表示中能否直接读出目标。",
    intuition:
      "像给一张已经画好的地图放上透明直尺：若一条简单边界就能分开两类，说明地图原本就把相关信息摆好了；直尺并没有重新画地图。",
    core: "先用固定 encoder 提取表示，再拟合线性分类器/回归器。原自监督论文常用 linear evaluation 评估冻结特征的可迁移性。它也是新任务的低成本基线；与 full fine-tuning 相比不更新 backbone，与 zero-shot 相比通常使用目标任务标签训练 head。成绩好说明该 probe 可读出信息，不说明 encoder 内含完整因果解释。",
    equation: "z = fθ(x), θ固定；ŷ = Wz+b，只更新 W,b",
    mechanicsSteps: [
      "选择预训练模型和固定的特征层，统一输入预处理，并把训练/验证/测试按实体隔离。",
      "冻结 encoder 参数，对各样本提取 embedding；若特征可缓存，记录模型版本以避免混用。",
      "只在训练集特征上拟合线性 head，用验证集选正则化与阈值。",
      "在独立测试集报告结果，并与 zero-shot、训练全部参数和简单原始特征基线比较。",
    ],
    whenToUse: [
      "评估自监督或预训练表示是否可迁移时。",
      "标签有限、计算预算少，想先判断是否值得微调大模型时。",
    ],
    limits: [
      "表示里虽有信号但非线性不可分时，线性 probe 会低估可用能力。",
      "标签少、类别不平衡或划分泄漏会使 probe 结果高度不稳定。",
    ],
    howToUse: [
      "明确取哪一层、如何 pooling、是否归一化，固定 encoder 的 eval 模式。",
      "按组/实体划分数据，标准化特征时只拟合训练集统计量。",
      "先用线性层或带正则逻辑回归，并限制 head 容量保持比较公平。",
      "验证后报告独立测试结果与每类指标，记录 backbone 和 head 的训练状态。",
    ],
    tuning: [
      "Probe 训练与验证都差时比较其他特征层、pooling 或更匹配的预训练模型。",
      "训练好但验证差时加正则、减少维度或补充训练样本。",
      "与 full fine-tuning 差距大时，再考虑逐层解冻或 LoRA。",
    ],
    settings: [
      {
        name: "冻结状态",
        start: "encoder.eval() 且无梯度，只更新线性 head。",
        adjust: "若解冻任何 backbone 层，明确改称 fine-tuning 并单独报告。",
      },
      {
        name: "表示层 / pooling",
        start: "从模型推荐的语义特征层与规范化方式开始。",
        adjust: "分类效果差时比较 CLS、平均池化或相邻层，验证后固定。",
      },
      {
        name: "正则强度",
        start: "从简单 L2 正则和训练集标准化开始。",
        adjust: "样本少且验证波动大时增强正则，欠拟合再减弱。",
      },
    ],
    modifications: [
      "多标签任务把线性 head 改为多输出并用逐类 BCE。",
      "新类别极少时可比较无需 head 训练的类别 prototype。",
    ],
    pitfalls: [
      "只冻结梯度却仍让 BatchNorm 在训练模式更新统计量，导致 encoder 并非真正固定。",
      "在全数据上标准化或挑层，泄漏测试集信息。",
    ],
    example:
      "冻结 SimCLR 图像 encoder，提取病理图片 embedding，在训练病人上拟合二分类线性层；测试必须用从未出现过的病人。",
    compareTo: [
      "prediction-heads",
      "zero-shot-learning",
      "few-shot-learning",
      "simclr",
      "transfer-lora",
    ],
  },
  {
    id: "prototypical-networks",
    source: {
      label: "Snell et al.: Prototypical Networks for Few-shot Learning",
      url: "https://arxiv.org/abs/1703.05175",
    },
    title: "ProtoNet：每一类有一个中心",
    englishTitle: "Prototypical Networks",
    category: "representation",
    level: "进阶",
    duration: "11 分钟",
    icon: "◌",
    summary:
      "把每类少量支持样本映射到 embedding 空间，取均值作原型，再按距离给查询样本分类。",
    intuition:
      "班里每个小组只有几位代表。先算每组代表的平均位置，来了新同学，就看离哪组中心近。真正训练的重点是学一张‘同类聚、异类分’的地图。",
    core: "在每个 N-way K-shot episode 里，encoder fθ 把 support 和 query 变成向量。每类 prototype 为该类 K 个 support embedding 的均值；query 的负距离经 softmax 得到类概率。Meta-training 用许多模拟少样本任务优化 encoder，使新类的均值也有用。原论文显示平方欧氏距离适合其方案；部署时须在新类任务上重新计算 prototype。",
    equation: "cₖ=(1/|Sₖ|)Σ(x,y)∈Sₖ fθ(x);  p(y=k|x)=softmaxₖ(−‖fθ(x)−cₖ‖²)",
    mechanicsSteps: [
      "从训练类别采样一个 N-way K-shot episode，并把样本拆成 support 与 query。",
      "用同一个 encoder 产生全部 embedding，对每类 support 向量求均值得到 prototype。",
      "计算每个 query 到 N 个 prototype 的距离，取负距离 softmax，并对 query 标签求 loss。",
      "跨许多 episodes 更新 encoder；测试新类别时只用新 support 重算 prototype，不用测试 query 参与均值。",
    ],
    whenToUse: [
      "新类样本很少且类别会不断变化，能得到好的 embedding 时。",
      "希望用简单、可解释的类别中心与其他 few-shot 方法做基线时。",
    ],
    limits: [
      "一类呈多个分离簇时，单个均值可能落在没有样本的地方。",
      "新任务领域与 meta-training 差异很大时，原 embedding 距离未必有意义。",
    ],
    howToUse: [
      "按任务而非单样本组织数据，严格分离 meta-train、meta-val 与新类别 meta-test。",
      "先固定 N 和 K，建立 frozen embedding + 均值 prototype 基线。",
      "训练时每个 episode 重新采样 support/query，确认 query 不参与 prototype 计算。",
      "在很多独立新类 episodes 上报告平均性能和波动，比较 K 的变化。",
    ],
    tuning: [
      "若类内分布多峰，考虑多 prototype 或改进 embedding，不要只调 softmax 温度。",
      "训练 episode 的 N/K 与测试差很多时做匹配实验，并检查泛化。",
      "距离尺度太大或概率过尖时做 embedding 归一化与温度验证。",
    ],
    settings: [
      {
        name: "N-way K-shot",
        start: "先让训练 episodes 接近实际新任务的类别数与样本预算。",
        adjust: "部署 N/K 变化时重新评估，不假设原设置可无损迁移。",
      },
      {
        name: "距离度量",
        start: "先试原论文常用的平方欧氏距离。",
        adjust: "向量尺度差异大时比较归一化余弦距离，并保持公平验证。",
      },
      {
        name: "Episode 数量",
        start: "覆盖多种类别组合与 support 抽样，记录随机种子。",
        adjust: "评估方差大时增加独立 episodes，不只汇报最佳 episode。",
      },
    ],
    modifications: [
      "类内多峰时可让每类保留多个中心，再设计聚合规则。",
      "用 CLIP 等预训练 embedding 直接算 prototype 可成为低训练成本对照。",
    ],
    pitfalls: [
      "把 query 标签也用于算均值，造成支持集与测试集泄漏。",
      "只测与训练相同的类别，误把普通分类性能当成新类 few-shot 泛化。",
    ],
    example:
      "5-way 2-shot 昆虫识别：10 张带标签 support 图片形成 5 个均值向量；新图片在同一 encoder 中嵌入，分给最近的原型。",
    compareTo: [
      "few-shot-learning",
      "knn",
      "linear-probe",
      "meta-learning-maml",
    ],
  },
  {
    id: "meta-learning-maml",
    source: {
      label:
        "Finn et al.: Model-Agnostic Meta-Learning for Fast Adaptation of Deep Networks",
      url: "https://arxiv.org/abs/1703.03400",
    },
    title: "MAML：学一个容易改的起点",
    englishTitle: "Model-Agnostic Meta-Learning",
    category: "frontiers",
    level: "高级",
    duration: "12 分钟",
    icon: "↻",
    summary: "在很多任务上训练一个初始化，让新任务只需少量样本和少步梯度更新。",
    intuition:
      "不是练好一道题，而是把自己放在‘遇到任何同类新题都容易迅速学会’的位置。每次练习先模拟短暂学习，再看学完后的考试成绩，反过来调整起点。",
    core: "每轮采样多个任务。对每个任务，从共同初始化 θ 用 support loss 做 inner-loop 梯度更新得 θ′ᵢ；用该任务 query loss 评价适配后效果。Outer-loop 对这些 query losses 更新 θ。原始 MAML 需沿 inner update 求高阶梯度；一阶近似可降计算。它与 ICL 不同：测试新任务时真的会更新参数；与 ProtoNet 不同：它学的是可快速更新的初始化，不只计算类中心。",
    equation: "θ′ᵢ=θ−α∇θLᵢ,support(θ);  θ←θ−β∇θΣᵢLᵢ,query(θ′ᵢ)",
    mechanicsSteps: [
      "准备一族相关任务，划分 meta-train/meta-val/meta-test，每任务再拆 support 与 query。",
      "从共享 θ 为每个任务复制参数，仅在该任务 support 上走少量 inner-loop 梯度步。",
      "用适配后的 θ′ᵢ 在该任务 query 上求 loss，并把多个任务的 query loss 聚合。",
      "沿这项适配后损失更新原始 θ；新任务到来时仍需用其少量 support 真正做梯度适配。",
    ],
    whenToUse: [
      "有许多相关历史任务，未来新任务仅有少量样本且允许快速参数更新时。",
      "需要比较梯度式适配与冻结表示或 prototype 路线时。",
    ],
    limits: [
      "Inner/outer 双层优化计算和内存成本高；简单预训练 embedding + 线性分类器常是强基线。",
      "若新任务与 meta-train 任务分布很不同，学到的初始化未必能少步适配。",
    ],
    howToUse: [
      "先明确新任务的真实 support/query 预算，并构造同样协议的训练 episodes。",
      "与普通预训练后微调、linear probe 和 prototype 比较，避免把任务设计增益误归于 MAML。",
      "分别记录 inner-loop 学习率、步数和 outer-loop 学习率，以及每个任务的适配前后结果。",
      "严格在未见任务上测试多次抽样，并报告计算成本和方差。",
    ],
    tuning: [
      "Inner 步数过多导致 query 退化时减少步数或降低 α。",
      "Outer loss 振荡时降低 β、增大任务 batch 或检查高阶梯度实现。",
      "成本太高时比较一阶近似，但清楚标注方法变化并重验性能。",
    ],
    settings: [
      {
        name: "Inner 学习率 α",
        start: "从能让 support loss 稳定下降的保守值开始。",
        adjust: "适配后 query 变差时降低 α，且同时检查支持集过拟合。",
      },
      {
        name: "Inner 步数",
        start: "先用 1–5 步的小规模实验，匹配部署可用的步数。",
        adjust: "增加步数只有在新任务 query 稳定改善时才保留。",
      },
      {
        name: "Outer 学习率 β / 任务 batch",
        start: "用多个任务平均 query loss，并监测跨任务方差。",
        adjust: "更新不稳时减小 β 或增加任务 batch；显存不足可用一阶近似。",
      },
    ],
    modifications: [
      "一阶 MAML 省去部分高阶梯度计算，但它是近似，需独立报告。",
      "可只对 prediction head 或部分层做 inner updates，平衡速度、显存与适配能力。",
    ],
    pitfalls: [
      "把 support 的训练误差当 outer objective，忽视真正要优化的适配后 query 泛化。",
      "测试时直接用 θ 而不做规定的少步更新，却声称完成 MAML 适配。",
    ],
    example:
      "有许多独立字符识别任务；MAML 在每个任务用少量字符样本做两步更新，再对该任务新样本评分。新字符集到来时也按相同步数适配。",
    compareTo: [
      "few-shot-learning",
      "prototypical-networks",
      "linear-probe",
      "in-context-learning",
    ],
  },
];
