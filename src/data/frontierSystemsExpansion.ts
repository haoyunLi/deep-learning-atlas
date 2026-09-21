import type { Lesson } from "./lessons";

export const frontierSystemsExpansionLessons: Lesson[] = [
  {
    id: "state-space-models",
    source: {
      label:
        "Gu et al.: Efficiently Modeling Long Sequences with Structured State Spaces (2022)",
      url: "https://arxiv.org/abs/2111.00396",
    },
    title: "SSM 与 S4：把长序列压进连续状态",
    englishTitle: "State Space Models and S4",
    category: "sequence",
    level: "高级",
    duration: "14 分钟",
    icon: "∿",
    summary:
      "用线性状态递推累计历史，再把同一系统改写为卷积并行训练；S4 用结构化参数让长卷积核可计算。",
    intuition:
      "把序列看成驱动动态系统的输入。隐藏状态像有限容量的记忆槽，每一步按 A 衰减旧信息、按 B 写入新信息，再由 C 读出。训练时可一次算卷积，推理时逐步递推。",
    core: "连续系统 x′(t)=Ax(t)+Bu(t), y(t)=Cx(t)+Du(t) 经步长 Δ 离散化得到 xₖ=Āxₖ₋₁+B̄uₖ。线性时不变系统可展开为卷积核 K=[CB̄,CĀB̄,…]。S4 对 A 施加对角加低秩结构，以稳定且高效地生成长核。",
    equation: "xₖ=Āxₖ₋₁+B̄uₖ; yₖ=Cxₖ+Duₖ; Kₖ=CĀᵏB̄",
    mechanicsSteps: [
      "先定状态宽度 N、输入宽度 D 与离散步长 Δ；B 把当前 token 写入 N 维状态，A 决定各时间尺度的保留与衰减。",
      "以标量 Ā=0.8、B̄=1 为例，输入 [1,0,2] 从 x₀=0 得状态 [1,0.8,2.64]；旧输入按幂次衰减。",
      "把递推展开成 K=[1,0.8,0.64,…] 与输入卷积，训练可并行；流式推理只保存当前状态，不缓存全部 token。",
      "S4 用结构化 A 与专门核计算避免直接求巨大矩阵幂；前后都配 pointwise mixing、门控、残差和 normalization 形成深层 block。",
    ],
    whenToUse: [
      "长序列且二次 attention 成本不可接受时。",
      "需要固定大小流式状态和稳定逐步延迟时。",
      "音频、传感器或基因组中存在多时间尺度动态时。",
    ],
    limits: [
      "线性时不变递推的选择性弱，内容相关检索通常不如 attention 直接。",
      "离散化、复数参数和核实现较难调试；理论 O(L) 不保证短序列墙钟更快。",
    ],
    howToUse: [
      "先用小 RNN、卷积和 Transformer 做同切分基线。",
      "打印 [B,L,D] 与 state [B,N]，分别测试整段和逐步推理一致性。",
      "按真实长度扫描吞吐、峰值显存和首 token/每 token 延迟。",
      "检查状态谱、梯度范数和很长序列上的数值有限性。",
    ],
    tuning: [
      "状态宽度 N 控制记忆容量，先加深再盲目加宽通常更可控。",
      "Δ 决定时间尺度；数据采样率变化时需要重新验证。",
      "残差 dropout、learning rate 与长序列裁剪共同影响稳定性。",
    ],
    settings: [
      {
        name: "state size N",
        start: "从 32–128 与同参数 Transformer 比较。",
        adjust: "长依赖欠拟合再增加；延迟或内存超限则减小。",
      },
      {
        name: "discretization Δ",
        start: "使用实现的稳定参数化并记录范围。",
        adjust: "快速信号丢失时减小有效步长；状态几乎不衰减时收紧范围。",
      },
      {
        name: "sequence length / depth",
        start: "先在训练可覆盖的真实长度和 4–8 层验证。",
        adjust: "长度外推前单独做超长 stress test，并检查累计数值误差。",
      },
    ],
    modifications: [
      "加入双向扫描用于离线编码；因其使用未来信息，不可直接用于 causal 生成。",
      "用输入相关参数改成 selective SSM，得到 Mamba 类机制。",
    ],
    pitfalls: [
      "把卷积训练形式误认为推理也必须保留整段历史。",
      "只报 FLOPs，不在目标硬件测 scan kernel 和内存搬运。",
    ],
    example:
      "长度 65k 的传感器序列中，SSM 可用固定状态逐点更新；先验证同一段序列用卷积与递推得到的输出误差在容许范围内。",
    compareTo: ["rnn", "transformer", "mamba"],
  },
  {
    id: "mamba",
    source: {
      label:
        "Gu & Dao: Mamba—Linear-Time Sequence Modeling with Selective State Spaces (2023)",
      url: "https://arxiv.org/abs/2312.00752",
    },
    title: "Mamba：让状态更新由当前内容决定",
    englishTitle: "Mamba / Selective State Space Model",
    category: "sequence",
    level: "高级",
    duration: "14 分钟",
    icon: "〽",
    summary:
      "把 SSM 的步长与写入、读出参数设为输入函数，让模型选择何时记、何时忘，并用硬件感知 selective scan 执行。",
    intuition:
      "固定滤波器会对所有 token 用同一种记忆规则。Mamba 像带内容控制的阀门：标点可以让状态慢下来，关键信息可以强写入，噪声可以快速忘掉。",
    core: "选择性使 Δ、B、C 随 xₜ 变化，因此不能直接使用固定卷积核。实现以 associative scan、kernel fusion 和 recomputation 控制 HBM 读写；线性序列复杂度来自 scan，不代表所有矩阵运算都消失。",
    equation: "hₜ=Ā(Δₜ)hₜ₋₁+B̄(Δₜ)B(xₜ)xₜ; yₜ=C(xₜ)hₜ+D xₜ",
    mechanicsSteps: [
      "输入 [B,L,D] 先做投影并分成内容支路与门控支路，局部 depthwise convolution 注入短程顺序。",
      "内容支路生成逐 token 的 Δ、B、C；softplus 等约束让有效步长为正，再据此离散化连续状态。",
      "selective scan 沿 L 递推 N 维状态；训练用并行 scan，autoregressive 推理缓存每层状态和局部卷积窗口。",
      "扫描输出经过门控和输出投影，再与残差相加；逐层重复形成语言、音频或视觉 backbone。",
    ],
    whenToUse: [
      "上下文很长且需要近线性内存增长时。",
      "流式生成希望每层缓存大小不随上下文增长时。",
      "愿意以硬件实测比较新 backbone 而非默认使用 attention 时。",
    ],
    limits: [
      "精确复制或任意位置检索仍可能需要混合 attention 或专门训练。",
      "性能高度依赖 fused scan kernel、dtype 与硬件；朴素循环实现会很慢。",
    ],
    howToUse: [
      "先保持 tokenizer、数据和参数预算一致，与 Transformer 做 controlled baseline。",
      "测试 full-sequence 与 recurrent decode 输出是否一致。",
      "分别记录 prefill、单 token decode、峰值显存和长上下文质量。",
      "用 copy/retrieval、长度外推和真实任务三类评估诊断选择性。",
    ],
    tuning: [
      "d_state 增加每通道记忆容量，也增加 scan 工作量。",
      "d_conv 控制局部窗口，过大可能重复承担长程建模。",
      "expand 改变内部宽度，需与层数、参数量和延迟共同比较。",
    ],
    settings: [
      {
        name: "d_state",
        start: "从实现常用的 16–64 起步。",
        adjust: "长程任务欠拟合且显存允许时增加；scan 占比过高则减小。",
      },
      {
        name: "d_conv",
        start: "先用 3–4 个位置的局部卷积。",
        adjust: "局部模式明显时小幅增加，并测流式缓存与延迟。",
      },
      {
        name: "expand / depth",
        start: "匹配比较模型的总参数与训练 token。",
        adjust: "先沿 Pareto 曲线选宽深组合，不以单一 perplexity 决定。",
      },
    ],
    modifications: [
      "在少数层加入 attention，补足显式检索能力。",
      "二维视觉输入可按多方向扫描，但必须说明扫描次序和方向融合。",
    ],
    pitfalls: [
      "把线性序列长度误读为常数计算量。",
      "比较时让 Mamba 与 Transformer 使用不同 tokenizer、训练 token 或优化预算。",
    ],
    example:
      "对 32k token 文档，先在 2k、8k、32k 分别测质量与 decode 状态大小；若 copy 任务下降，可尝试混合少量 attention 层。",
    compareTo: ["state-space-models", "transformer", "rwkv"],
  },
  {
    id: "rwkv",
    source: {
      label:
        "Peng et al.: RWKV—Reinventing RNNs for the Transformer Era (2023)",
      url: "https://arxiv.org/abs/2305.13048",
    },
    title: "RWKV：并行训练，循环生成",
    englishTitle: "RWKV / Receptance Weighted Key Value",
    category: "sequence",
    level: "高级",
    duration: "13 分钟",
    icon: "↻",
    summary:
      "用 time-mixing 的指数加权状态替代完整注意力矩阵，训练时可并行表达，推理时像 RNN 一样保存固定状态。",
    intuition:
      "每个通道保留一份衰减的 key-value 摘要，receptance 决定当前 token 读取多少。不同通道可学习不同记忆半衰期。",
    core: "RWKV 的 time mixing 累积带指数衰减的 key/value，并用数值稳定形式维护分子、分母和最大项；channel mixing 类似带门控的逐 token FFN。token shift 混合当前与前一位置。",
    equation:
      "wkvₜ=(Σᵢ≤ₜ exp(kᵢ−(t−i)w)vᵢ)/(Σᵢ≤ₜ exp(kᵢ−(t−i)w)); yₜ=σ(rₜ)⊙wkvₜ",
    mechanicsSteps: [
      "对输入与前一 token 表示做可学习线性混合，分别生成 r、k、v。",
      "按通道累计指数衰减的 key-value 分子和权重分母，用 log-sum-exp 风格状态避免溢出。",
      "receptance sigmoid 门控当前读出；输出投影与残差形成 time-mix block。",
      "channel-mix 在每个位置做门控非线性；生成时每层只更新 time/channel state。",
    ],
    whenToUse: [
      "自回归服务希望 KV cache 不随上下文增长时。",
      "需要 RNN 式流式处理但想保留大规模语言建模训练方式时。",
      "要比较 attention、SSM 与加权递推的工程权衡时。",
    ],
    limits: [
      "固定压缩状态可能遗失需要精确回看的早期细节。",
      "并行训练与循环推理的等价性依赖实现和数值稳定处理。",
    ],
    howToUse: [
      "验证整段与逐 token 模式 logits 的最大误差。",
      "为每个会话正确初始化、保存和清理 layer state。",
      "测长对话中的记忆衰减、吞吐和固定状态显存。",
      "微调时保留架构对应 tokenizer 与时间参数初始化。",
    ],
    tuning: [
      "层数与 embedding 宽度决定主要容量。",
      "time decay 初始化覆盖短到长多种半衰期。",
      "长序列训练的 chunk、state detach 与梯度范围要显式决定。",
    ],
    settings: [
      {
        name: "context / chunk length",
        start: "从训练可承受长度开始并保留跨 chunk state。",
        adjust:
          "长依赖下降时增加训练跨度或使用 state tuning，避免只改推理长度。",
      },
      {
        name: "time decay",
        start: "使用预训练配置的分层、分通道初始化。",
        adjust: "状态过快遗忘时检查衰减分布；数值爆炸时检查稳定累计。",
      },
      {
        name: "state precision",
        start: "用 FP32 状态验证基线。",
        adjust: "降精度前逐长度比较 logits 漂移与溢出。",
      },
    ],
    modifications: [
      "可与局部 attention 混合，给精确短程匹配一条直接路径。",
      "对分类任务使用双向或整段池化版本，但不再保持 causal 语义。",
    ],
    pitfalls: [
      "不同会话复用同一 state 会泄漏上下文。",
      "只测短 prompt，忽略状态误差随生成长度累计。",
    ],
    example:
      "聊天服务每层保存固定状态；在 1k、16k、64k token 后插入同一事实查询，绘制准确率与状态精度关系。",
    compareTo: ["rnn", "transformer", "mamba"],
  },
  {
    id: "faster-rcnn-yolo",
    source: {
      label:
        "Ren et al.: Faster R-CNN—Towards Real-Time Object Detection (2015)",
      url: "https://arxiv.org/abs/1506.01497",
    },
    title: "Faster R-CNN 与 YOLO：两条检测流水线",
    englishTitle: "Two-stage and One-stage Object Detection",
    category: "vision",
    level: "进阶",
    duration: "14 分钟",
    icon: "⌗",
    summary:
      "比较先提 region 再分类的 two-stage 检测，与在密集网格直接预测类别和框的 one-stage 路线。",
    intuition:
      "Faster R-CNN 先问‘哪里可能有物体’，再仔细看每个候选；YOLO 类模型一次扫过整图，同时回答位置与类别。",
    core: "backbone/FPN 产生多尺度特征。Faster R-CNN 的 RPN 生成 proposals，经 RoIAlign 得定长特征后分类回归；YOLO 类 head 在多尺度位置直接输出 objectness/class/box。训练依赖匹配规则，推理通常还需阈值和 NMS。",
    equation:
      "L=Lcls+λbox Lbox; IoU(A,B)=|A∩B|/|A∪B|; NMS keeps high-score boxes under IoU threshold",
    mechanicsSteps: [
      "把图像 resize/pad，同时以相同几何变换更新 xyxy boxes；记录原图逆变换。",
      "backbone 和 FPN 输出多分辨率特征，小目标使用较高分辨率层。",
      "two-stage 先匹配 anchors/proposals 再 RoI 分类；one-stage 在密集位置完成匹配与预测。",
      "把框映射回原图，按类做 score filter 与 NMS，再用 mAP 和业务误报指标评估。",
    ],
    whenToUse: [
      "Faster R-CNN 适合准确率优先和中小数据迁移基线。",
      "YOLO 类适合 batch=1 延迟、边缘设备或高吞吐。",
      "需要明确比较小目标、密集场景和速度时。",
    ],
    limits: [
      "mAP 不直接等于现场误报成本，阈值需按使用情景选择。",
      "相邻帧随机切分会严重泄漏；稀有类和漏标会扭曲匹配与负样本。",
    ],
    howToUse: [
      "先可视化增强后的图与框，单 batch 过拟合。",
      "按场景/视频/设备切分，同分辨率同预训练比较模型。",
      "报告 AP50、AP75、small/medium/large AP 和目标硬件延迟。",
      "逐类绘制 precision-recall，复核高置信误报与漏标。",
    ],
    tuning: [
      "input size 提升小目标信息但以近平方增加特征计算。",
      "score 与 NMS IoU 是部署参数，应在验证集按成本选择。",
      "positive matching、focal/class weights 影响稀有目标召回。",
    ],
    settings: [
      {
        name: "image size",
        start: "以预训练默认短边开始。",
        adjust: "小目标召回低时增加并测实际显存/延迟。",
      },
      {
        name: "score / NMS IoU",
        start: "先画完整 PR 曲线，不急于固定 0.5。",
        adjust: "按每图或每小时误报上限选择联合阈值。",
      },
      {
        name: "anchors / matching",
        start: "先用数据集常见尺度并统计 box 尺寸。",
        adjust: "极端长宽比或小框匹配不足时再改先验。",
      },
    ],
    modifications: [
      "用 anchor-free head 减少人工 anchor 设计。",
      "密集遮挡场景比较 soft-NMS 或 DETR 集合预测。",
    ],
    pitfalls: [
      "把推理 resize 后的框直接画回原图。",
      "比较速度时一个模型含 NMS，另一个只报 backbone。",
    ],
    example:
      "同一相机数据固定切分后，Faster R-CNN 的 small AP 更高但延迟 70 ms，YOLO 类 18 ms；最终选择由漏报成本和设备上限共同决定。",
    compareTo: ["detr", "mask-rcnn", "resnet"],
  },
  {
    id: "segment-anything",
    source: {
      label: "Kirillov et al.: Segment Anything (2023)",
      url: "https://arxiv.org/abs/2304.02643",
    },
    title: "SAM：用 prompt 指出要分割什么",
    englishTitle: "Segment Anything Model (SAM)",
    category: "vision",
    level: "进阶",
    duration: "12 分钟",
    icon: "▧",
    summary:
      "把图像编码与点、框、粗 mask 等 prompt 编码分开，用轻量 mask decoder 生成多个候选分割。",
    intuition:
      "图像只做一次重编码，用户每点一下或画一个框，模型就快速更新‘你指的是哪个物体’。prompt 解决目标歧义，不能替代领域验证。",
    core: "image encoder 生成 dense embedding；prompt encoder 处理稀疏点/框和 dense mask；mask decoder 用双向交互输出若干 masks 与质量分数。zero-shot 指无需目标任务训练直接提示，不保证医学或遥感边界可靠。",
    equation: "E=ImageEncoder(I); z=PromptEncoder(p); (M,q)=MaskDecoder(E,z)",
    mechanicsSteps: [
      "按模型规则 resize 图像并记录坐标比例，image encoder 产生一次可复用 embedding。",
      "把正负点或框映射到编码坐标，prompt encoder 形成 sparse tokens。",
      "mask decoder 让 prompt token 与 image embedding 交互，输出多义候选与预测质量。",
      "选择候选、恢复原分辨率并做领域指标；交互式场景把错误区域转为下一轮点 prompt。",
    ],
    whenToUse: [
      "交互标注、预标注或开放词汇对象抠图。",
      "同一图像需要多次快速提示。",
      "作为下游分割的候选生成器或 teacher。",
    ],
    limits: [
      "小目标、细结构与域外影像可能失败；quality score 不是临床置信度。",
      "SAM 原生不提供语义类别，自动 mask 还需去重和分类。",
    ],
    howToUse: [
      "先区分交互分割、自动全部分割与语义分割目标。",
      "保存原图到 encoder 的完整坐标变换并写 round-trip 测试。",
      "按 prompt 类型、目标大小和域分别评估。",
      "用于标注时抽样人工复核，不能把模型 mask 当金标。",
    ],
    tuning: [
      "点的位置和正负语义常比点数量更重要。",
      "框 prompt 通常减少对象歧义，紧框与松框都应验证。",
      "自动生成时 points-per-side、IoU 与 stability threshold 联动。",
    ],
    settings: [
      {
        name: "prompt type",
        start: "已有候选框时先框；交互时先中心正点。",
        adjust: "边界外泄加负点，漏区域加正点。",
      },
      {
        name: "multimask output",
        start: "歧义 prompt 保留多个候选。",
        adjust: "下游需要单 mask 时用验证过的质量规则选择。",
      },
      {
        name: "automatic thresholds",
        start: "从官方默认并记录生成 mask 数。",
        adjust: "重复多则提高 NMS/stability；漏小目标则提高采样密度。",
      },
    ],
    modifications: [
      "冻结 Image Encoder，只训练 Adapter 或 Decoder 做 Domain Adaptation。",
      "接分类器或文本对齐模型给 masks 赋语义。",
    ],
    pitfalls: [
      "把 promptable segmentation 说成零错误自动标注。",
      "坐标缩放取整错误导致肉眼相近但系统性偏移。",
    ],
    example:
      "病灶标注工具先用框得到三个候选，医生加一个负点去掉邻近器官；记录交互次数与最终 Dice，而非只测自动首个 mask。",
    compareTo: ["unet", "mask-rcnn", "clip"],
  },
  {
    id: "vision-language-models",
    source: {
      label:
        "Alayrac et al.: Flamingo—A Visual Language Model for Few-Shot Learning (2022)",
      url: "https://arxiv.org/abs/2204.14198",
    },
    title: "VLM 与 Cross-Attention：让图像进入语言模型",
    englishTitle: "Vision-Language Models and Cross-Attention",
    category: "representation",
    level: "高级",
    duration: "14 分钟",
    icon: "◫",
    summary:
      "视觉编码器把图像变成 tokens，cross-attention 让文本 query 读取视觉 key/value；再区分对齐、生成和 grounded prediction。",
    intuition:
      "文本 token 像提出问题，视觉 tokens 像可查阅的证据表。cross-attention 决定当前词从哪些图像区域取信息。",
    core: "若文本 Q∈Rᴮˣᵀˣᴰ、视觉 K,V∈Rᴮˣᴾˣᴰ，则注意力权重为 [B,H,T,P]。VLM 可采用双塔对比对齐、融合编码或视觉到 LLM 的投影/cross-attention；架构决定可做检索、分类或生成。",
    equation: "CrossAttn(Qtext,Kvision,Vvision)=softmax(QKᵀ/√d)V",
    mechanicsSteps: [
      "视觉 encoder 把 H×W 图像转为 P 个 patch/region tokens；投影到语言模型兼容宽度。",
      "文本 self-attention 建模已有上下文，cross-attention 用文本 query 读取视觉 key/value。",
      "训练可组合图文对比、caption next-token、matching 与 grounding loss；每个目标监督不同能力。",
      "推理按任务解码文本或读出分类/框，并把视觉证据与语言流畅度分别评估。",
    ],
    whenToUse: [
      "图文问答、caption、视觉检索或文档理解。",
      "需要 zero/few-shot 迁移多个视觉任务。",
      "已有强视觉和语言模型，希望用投影或 adapter 连接。",
    ],
    limits: [
      "语言先验会生成图中不存在的内容；流畅答案不证明视觉 grounding。",
      "图像分辨率、视觉 token 数和多图上下文快速增加显存。",
    ],
    howToUse: [
      "先写清输出是检索分数、封闭类别还是开放生成。",
      "打印 P、T 与 cross-attention [B,H,T,P]，验证 mask。",
      "加入 text-only、image-only 与打乱图像对照，检查模型是否真看图。",
      "按 OCR、小目标、计数、关系和域外图像分层评估。",
    ],
    tuning: [
      "视觉 token 数在细节与成本间权衡。",
      "冻结 backbone 先训 connector，数据足够再逐步解冻。",
      "生成 temperature 影响多样性，不修复 grounding。",
    ],
    settings: [
      {
        name: "vision resolution / tokens",
        start: "从 backbone 预训练分辨率开始。",
        adjust: "OCR/小目标失败时提高或用多尺度裁块，同时测 token 成本。",
      },
      {
        name: "connector",
        start: "先比较线性投影与小型 cross-attention。",
        adjust: "欠对齐再增加容量，防止小数据过拟合。",
      },
      {
        name: "freeze schedule",
        start: "冻结双 backbone，只训练 connector。",
        adjust: "验证稳定后低学习率解冻顶层，并监控遗忘。",
      },
    ],
    modifications: [
      "用 query tokens 压缩大量视觉 patches。",
      "把 region/box 坐标加入 tokens，增强可定位输出。",
    ],
    pitfalls: [
      "只用 caption 指标宣称具备可靠视觉问答。",
      "few-shot 示例包含测试图或答案模板造成泄漏。",
    ],
    example:
      "文档 VQA 中把一页切成高分辨率 tiles；先用 text-only 对照确认问题不能仅凭常识回答，再检查答案引用的区域是否包含证据。",
    compareTo: ["clip", "attention", "transformer"],
  },
  {
    id: "ctc-wav2vec",
    source: {
      label: "Baevski et al.: wav2vec 2.0 (2020)",
      url: "https://arxiv.org/abs/2006.11477",
    },
    title: "CTC 与 wav2vec 2.0：从声音到文字",
    englishTitle: "CTC and wav2vec 2.0",
    category: "sequence",
    level: "进阶",
    duration: "14 分钟",
    icon: "≋",
    summary:
      "wav2vec 2.0 用无标注音频学表示；CTC 对所有能折叠为目标文本的对齐路径求和，免去帧级标注。",
    intuition:
      "录音有几百帧而文字只有几十个符号。CTC 允许模型在多数帧输出 blank，并把重复符号折叠；wav2vec 先从大量声音学会可迁移的声学单位。",
    core: "wav2vec 2.0 将 waveform 经卷积变成 latent frames，mask 后由 Transformer 建上下文，并从量化目标与 negatives 做对比学习。微调时 CTC head 输出 T×V logits；前向后向动态规划求所有合法 alignment 的总概率。",
    equation:
      "LCTC=−log Σπ:B(π)=y ∏ₜp(πₜ|x); Lcontrast=−log exp(sim(c,q+)/κ)/Σq exp(sim(c,q)/κ)",
    mechanicsSteps: [
      "waveform 按统一采样率与幅度处理，卷积 encoder 把样本压成 [B,T,D] 帧。",
      "预训练随机 mask latent spans，上下文网络预测被 mask 位置对应的量化表示，并与 negatives 对比。",
      "微调加字符/subword+blank head；CTC 动态规划允许 blank 和重复，要求输入帧数足够覆盖标签。",
      "解码用 greedy 或 beam，可加语言模型；WER 先规范化文本再统计替换、删除、插入。",
    ],
    whenToUse: [
      "转录标注少但无标注语音多。",
      "输入输出单调对齐，且不需要显式帧级 alignment。",
      "流式或非自回归 ASR 基线。",
    ],
    limits: [
      "CTC 的条件独立假设使语言建模较弱，beam LM 能补但增加延迟。",
      "采样率、语言、口音和噪声偏移会显著影响表示。",
    ],
    howToUse: [
      "先检查 audio duration、采样率、transcript 与空样本。",
      "确认 encoder 帧长 T 足以对齐去重后的标签。",
      "冻结 feature encoder 先稳定微调，再按验证集逐层解冻。",
      "报告总体 WER 及口音、噪声、时长和说话人 cohort。",
    ],
    tuning: [
      "mask span/概率影响预训练任务难度。",
      "CTC blank bias 与 beam width 影响删除和插入。",
      "fine-tune learning rate 对预训练 encoder 应低于新 head。",
    ],
    settings: [
      {
        name: "sampling rate",
        start: "严格沿用 checkpoint 期望值。",
        adjust: "异源音频先离线高质量重采样并记录原始格式。",
      },
      {
        name: "freeze / learning rates",
        start: "先冻结卷积 encoder 数千步。",
        adjust: "head 稳定后低学习率解冻，若表示漂移则延长冻结。",
      },
      {
        name: "beam / LM weight",
        start: "先用 greedy 建立声学基线。",
        adjust: "在验证集联合调 beam、LM 和 insertion penalty。",
      },
    ],
    modifications: [
      "多语种用共享 encoder 和语言特定 tokenizer/head。",
      "需要强条件依赖时比较 RNN-T 或 encoder-decoder。",
    ],
    pitfalls: [
      "不同文本 normalization 得到不可比 WER。",
      "说话人片段随机切分让同一声音出现在训练与测试。",
    ],
    example:
      "10 小时领域语音先用预训练 wav2vec 2.0，冻结 encoder 训练 CTC head；验证删除率高时先查帧/标签长度和 blank，再调 beam。",
    compareTo: ["rnn", "contrastive-learning", "whisper"],
  },
  {
    id: "whisper",
    source: {
      label:
        "Radford et al.: Robust Speech Recognition via Large-Scale Weak Supervision (2022)",
      url: "https://arxiv.org/abs/2212.04356",
    },
    title: "Whisper：把 ASR 变成多任务序列生成",
    englishTitle: "Whisper / Encoder-Decoder Speech Recognition",
    category: "sequence",
    level: "进阶",
    duration: "13 分钟",
    icon: "♬",
    summary:
      "mel 频谱由 audio encoder 编码，text decoder 通过特殊 tokens 统一转录、翻译、语言识别和时间戳预测。",
    intuition:
      "模型先阅读整段声学图，再像语言模型一样逐 token 写转录；任务、语言和时间戳也作为 token 写进同一序列。",
    core: "音频被 pad/trim 到固定窗口并转 log-Mel spectrogram。encoder 输出声学 tokens，causal decoder 对已有文本 self-attention，并 cross-attend 音频。弱监督规模带来 zero-shot 能力，也继承训练数据噪声。",
    equation: "p(y|audio,task,lang)=∏ₜp(yₜ|y<ₜ,Encoder(logMel(audio)))",
    mechanicsSteps: [
      "把 waveform 转到 checkpoint 采样率，计算 log-Mel 并按窗口 pad/trim。",
      "audio encoder 产生 [B,Ta,D]；decoder 输入起始、语言和任务 tokens。",
      "每个文本 token 先看历史，再 cross-attend 音频；可生成文本和时间戳 tokens。",
      "长音频分窗或滑窗解码，合并重叠结果并处理无语音、重复与时间戳。",
    ],
    whenToUse: [
      "多语种转录/翻译与强 zero-shot 基线。",
      "需要统一文本生成接口和时间戳。",
      "领域有少量标注，可在强预训练模型上适配。",
    ],
    limits: [
      "生成式 decoder 可能在静音、音乐或域外音频产生幻觉文本。",
      "长音频分段、beam 与大模型增加延迟，真实流式能力有限。",
    ],
    howToUse: [
      "先做 VAD/静音检查并保留原时间轴。",
      "明确 task=transcribe/translate 与 language 设置，自动检测要单独评估。",
      "对短音频和长音频分别测 WER、实时因子和时间戳误差。",
      "建立无语音、专名、数字和重复输出的后处理测试。",
    ],
    tuning: [
      "temperature fallback 可处理解码退化，但阈值需验证。",
      "beam size 改善搜索同时增加延迟。",
      "chunk 长度与 overlap 影响上下文、重复和边界漏字。",
    ],
    settings: [
      {
        name: "model size",
        start: "先以目标设备能实时运行的最小版本建立基线。",
        adjust: "质量不足再增大，并测真实音频实时因子。",
      },
      {
        name: "language / task tokens",
        start: "已知时显式给出。",
        adjust: "多语混合才使用自动检测，并记录检测失败。",
      },
      {
        name: "chunk / overlap",
        start: "沿模型窗口，保留少量重叠。",
        adjust: "边界漏词增加重叠；重复多则改合并规则。",
      },
    ],
    modifications: [
      "领域词汇可用 prompt 或受控微调，但要测普通语言退化。",
      "低延迟场景结合 VAD、较小模型与增量分段。",
    ],
    pitfalls: [
      "把翻译输出与原语言 reference 算 WER。",
      "用同一说话人或同一长录音的相邻窗跨 split。",
    ],
    example:
      "会议转录先用 VAD 切段并保留 offset；对静音段要求空输出，对专名错误单独统计，最后把每段时间戳映射回原录音。",
    compareTo: ["ctc-wav2vec", "transformer", "decoder-models"],
  },
  {
    id: "two-tower-retrieval",
    source: {
      label:
        "Covington et al.: Deep Neural Networks for YouTube Recommendations (2016)",
      url: "https://research.google/pubs/deep-neural-networks-for-youtube-recommendations/",
    },
    title: "矩阵分解、负采样与双塔召回",
    englishTitle: "Matrix Factorization and Two-Tower Retrieval",
    category: "representation",
    level: "进阶",
    duration: "14 分钟",
    icon: "⌁",
    summary:
      "把用户与 item 编码到同一向量空间，用内积从百万候选中快速召回；负采样决定模型真正学到的边界。",
    intuition:
      "矩阵分解给每个用户和物品一张坐标；双塔把坐标改成由特征网络生成，因此新用户和新物品也能有向量。",
    core: "user tower f(u)、item tower g(i) 独立编码，score=f(u)ᵀg(i)。训练用 sampled softmax、in-batch negatives 或 pairwise loss，服务时预计算 item embeddings 并用 ANN 检索。采样分布改变训练目标，离线负样本必须来自当时可用候选。",
    equation: "s(u,i)=fθ(u)ᵀgφ(i); L=−log exp(s+)/[exp(s+)+Σj∈N exp(sj)]",
    mechanicsSteps: [
      "按用户时间构造正交互和当时可见候选，避免使用未来 catalog。",
      "user/item tower 输出 [B,D]，L2 normalization 后内积等于 cosine；不归一化时向量范数也影响分数。",
      "在 batch 内把其他正 item 当 negatives，或按 popularity/均匀分布采样，并对假负样本和采样偏差做处理。",
      "冻结 item tower 生成索引；线上计算 user 向量，ANN top-k 后交给 ranker。",
    ],
    whenToUse: [
      "候选数巨大，不能对每个 item 运行联合模型。",
      "检索、推荐或匹配需要预计算一侧 embedding。",
      "内容特征能支持冷启动。",
    ],
    limits: [
      "双塔只在最后内积，难表达精细交叉特征。",
      "离线 Recall@k 受旧策略曝光偏差影响，未曝光不等于不喜欢。",
    ],
    howToUse: [
      "先做 popularity 与矩阵分解基线。",
      "按用户时间切分，特征与负样本都遵守 cutoff。",
      "固定候选池报告 Recall@k、coverage 和 ANN recall。",
      "区分模型召回损失与近似索引损失。",
    ],
    tuning: [
      "embedding D 提高容量也增加索引内存。",
      "temperature 控制对比分布尖锐度。",
      "hard negatives 提升边界，但假负样本会伤害学习。",
    ],
    settings: [
      {
        name: "embedding dimension",
        start: "从 64–128 并测索引大小。",
        adjust: "召回欠拟合再增加；延迟/内存超限则压缩。",
      },
      {
        name: "negative sampling",
        start: "混合 in-batch 与 popularity-adjusted negatives。",
        adjust: "过易则加 hard negatives；假负高则过滤同义/已喜欢 item。",
      },
      {
        name: "retrieval temperature",
        start: "从 0.05–0.2 小范围搜索。",
        adjust: "梯度过尖或训练不稳时提高；区分不足时降低。",
      },
    ],
    modifications: [
      "多兴趣用户可输出多个 user vectors。",
      "用蒸馏让 cross-encoder/ranker 教双塔召回。",
    ],
    pitfalls: [
      "把 batch 中语义相同的 item 当负样本。",
      "更新 item tower 后忘记重建 ANN 索引。",
    ],
    example:
      "一百万文章先预计算 128 维 item embedding；线上 user tower 召回 500 篇，再由 ranker 选 20 篇，并分开监控 embedding freshness 与 ANN recall。",
    compareTo: [
      "contrastive-learning",
      "learning-to-rank",
      "matrix-factorization",
    ],
  },
  {
    id: "matrix-factorization",
    source: {
      label:
        "Koren et al.: Matrix Factorization Techniques for Recommender Systems (2009)",
      url: "https://datajobs.com/data-science-repo/Recommender-Systems-%5BNetflix%5D.pdf",
    },
    title: "矩阵分解：推荐系统的可解释坐标基线",
    englishTitle: "Matrix Factorization for Recommendation",
    category: "classical",
    level: "进阶",
    duration: "11 分钟",
    icon: "⊠",
    summary:
      "把稀疏用户—物品交互矩阵近似为两个低秩向量表，用内积和 bias 预测偏好。",
    intuition:
      "每个隐藏维度像一个由数据学出的偏好方向；用户和物品在这些方向上靠近，就得到更高分。",
    core: "显式反馈常最小化观测 rating 的平方误差；隐式反馈需区分 confidence 与 preference，或用 BPR pairwise ranking。用户、物品和全局 bias 吸收基准差异，L2 防止稀少实体向量发散。",
    equation: "r̂ui=μ+bu+bi+puᵀqi; L=Σ(u,i)∈Ω(rui−r̂ui)²+λ(||pu||²+||qi||²)",
    mechanicsSteps: [
      "建立训练时可见的 user/item ID 映射和稀疏交互 Ω。",
      "初始化 P:[U,D]、Q:[I,D] 与 bias；仅对观测或采样 pair 计算 loss。",
      "SGD/ALS 交替更新，使正交互内积上升并由正则限制范数。",
      "用 user 向量与候选 item 向量打分；冷启动回退到 popularity 或内容特征。",
    ],
    whenToUse: [
      "交互矩阵主导且需要强、快、可解释基线。",
      "作为双塔与复杂 ranker 的 sanity check。",
      "中等规模候选可用向量近邻服务。",
    ],
    limits: [
      "纯 ID 向量不能处理新用户/物品。",
      "曝光偏差与 popularity 会混入 latent factors。",
    ],
    howToUse: [
      "按用户内时间切分而非随机交互。",
      "先用 global/item/user bias，再增加 factors。",
      "隐式数据明确负采样与 confidence。",
      "报告 head/tail 与冷启动 cohort。",
    ],
    tuning: [
      "rank D 控制低秩容量。",
      "正则要按交互频率检查。",
      "负样本数与分布改变优化目标。",
    ],
    settings: [
      {
        name: "latent rank",
        start: "从 32–128 比较。",
        adjust: "训练/验证都差再加；验证过拟合则减小。",
      },
      {
        name: "regularization",
        start: "用户与 item 分开调 L2。",
        adjust: "稀少实体范数大时加强对应正则。",
      },
      {
        name: "implicit negatives",
        start: "从每个正样本 1–5 个开始。",
        adjust: "排序区分不足再增大，并校正 popularity 偏差。",
      },
    ],
    modifications: [
      "加入时间 bias 处理偏好和流行度漂移。",
      "用内容 tower 生成或正则冷启动 item 向量。",
    ],
    pitfalls: [
      "未评分项目被当明确不喜欢。",
      "全量交互拟合 ID 映射后再切分造成未来信息。",
    ],
    example:
      "电影推荐先用 bias MF；若 D 从 64 增至 256 只改善训练 RMSE、未来窗口 NDCG 下降，应增加正则或回到较低秩。",
    compareTo: ["two-tower-retrieval", "knn", "logistic-regression"],
  },
  {
    id: "learning-to-rank",
    source: {
      label: "Burges: From RankNet to LambdaRank to LambdaMART (2010)",
      url: "https://www.microsoft.com/en-us/research/publication/from-ranknet-to-lambdarank-to-lambdamart-an-overview/",
    },
    title: "Learning to Rank：从候选到有用顺序",
    englishTitle: "Learning to Rank and Ranking Losses",
    category: "classical",
    level: "进阶",
    duration: "13 分钟",
    icon: "≻",
    summary:
      "比较 pointwise、pairwise 与 listwise 目标，理解 LambdaMART 如何让梯度更关注真正会改变 NDCG 的交换。",
    intuition:
      "排序不要求每个分数绝对准确，只要求相关 item 排在不相关 item 前。列表顶部的错误比尾部交换更昂贵。",
    core: "pointwise 把每个 item 当分类/回归；pairwise 学 sᵢ>sⱼ；listwise 直接建模整个列表。LambdaRank 以交换两个 item 对 NDCG 的影响缩放 pairwise 梯度，LambdaMART 用 boosted trees 拟合这些伪梯度。",
    equation: "NDCG@k=DCG@k/IDCG@k; DCG@k=Σᵣ≤k(2^relᵣ−1)/log₂(r+1)",
    mechanicsSteps: [
      "按 query/user/time 组成候选列表，保留曝光位置、相关性与可用候选。",
      "ranker 对每个 query-item 特征产生 score；同一 query 内比较，跨 query 分数不一定同尺度。",
      "计算 item pair 的顺序错误，并按交换后 ΔNDCG 缩放梯度；树或神经模型更新。",
      "对固定候选集排序，报告 NDCG/Recall 和业务 guardrail；召回变化时单独归因。",
    ],
    whenToUse: [
      "已有候选集，需要优化搜索或推荐顶部顺序。",
      "标签存在等级或行为强弱。",
      "想结合 query-item 交叉特征，而双塔内积表达不足。",
    ],
    limits: [
      "训练日志受旧排序曝光和位置偏差影响。",
      "离线 NDCG 提升不保证长期满意度或因果增益。",
    ],
    howToUse: [
      "固定候选生成器，先比较简单 pointwise 模型。",
      "按 query/time 切分，避免同一请求跨 split。",
      "记录候选 recall 上限，ranker 无法找回缺失 item。",
      "按位置、用户活跃度与 item 流行度分析错误。",
    ],
    tuning: [
      "树深控制交叉复杂度。",
      "pair sampling 决定看到哪些顺序错误。",
      "NDCG cutoff 应对应真实界面展示深度。",
    ],
    settings: [
      {
        name: "objective",
        start: "二元反馈先比较 pointwise 与 LambdaMART。",
        adjust: "有可靠等级标签再使用 graded/listwise 目标。",
      },
      {
        name: "tree depth / leaves",
        start: "从浅树与 early stopping 开始。",
        adjust: "训练高验证低就减小交互容量。",
      },
      {
        name: "position correction",
        start: "先分位置报告点击率。",
        adjust: "有随机曝光或 propensity 时再做去偏，并做权重敏感性分析。",
      },
    ],
    modifications: [
      "用 cross-encoder 提升文本相关性，再蒸馏到更快 ranker。",
      "多目标排序加入质量、多样性与约束重排。",
    ],
    pitfalls: [
      "用被点击 item 与全库随机 item 训练，却在线只重排困难候选。",
      "候选集变化后把指标下降全归给 ranker。",
    ],
    example:
      "搜索 top-10 中把相关等级 3 的结果从第 8 移到第 2 会产生较大 ΔNDCG；LambdaMART 会比交换两个尾部结果给予更大更新。",
    compareTo: ["two-tower-retrieval", "xgboost", "logistic-regression"],
  },
  {
    id: "survival-analysis",
    source: {
      label:
        "Katzman et al.: DeepSurv—Personalized Treatment Recommender (2016)",
      url: "https://arxiv.org/abs/1606.00931",
    },
    title: "Kaplan–Meier、Cox 与 DeepSurv：有删失的时间预测",
    englishTitle: "Survival Analysis and DeepSurv",
    category: "classical",
    level: "高级",
    duration: "15 分钟",
    icon: "⌛",
    summary:
      "当部分个体尚未发生事件时，利用风险集和删失信息估计生存曲线、相对风险与非线性风险函数。",
    intuition:
      "随访结束仍未复发的人并非‘永不复发’，只知道事件时间晚于观察截止。生存模型把这条不完整信息留在风险集中。",
    core: "Kaplan–Meier 在每个事件时点乘上存活比例。Cox 模型令 hazard h(t|x)=h₀(t)exp(f(x))，partial likelihood 在事件者与当时仍在风险集者间比较。DeepSurv 用神经网络替代线性 f，但仍依赖 proportional hazards 与非信息删失假设。",
    equation:
      "Ŝ(t)=∏tᵢ≤t(1−dᵢ/nᵢ); h(t|x)=h₀(t)exp(fθ(x)); Lpartial=−Σevent[fᵢ−logΣj∈Rᵢexp(fⱼ)]",
    mechanicsSteps: [
      "每人记录 duration、event indicator 与预测时可见 covariates；按个体切分。",
      "KM 按事件时间更新 nᵢ 风险人数与 dᵢ 事件数，删失只在其后移出风险集。",
      "Cox/DeepSurv 对每个事件与其风险集计算 partial likelihood，得到相对风险分数。",
      "估计 baseline hazard 转为生存概率，并用 C-index、time-dependent Brier 和校准评估。",
    ],
    whenToUse: [
      "结局是 time-to-event 且存在右删失。",
      "需要风险排序或个体生存曲线。",
      "随访长度不一，普通二分类会丢失时间信息。",
    ],
    limits: [
      "删失依赖未观测风险时估计会偏。",
      "Cox/DeepSurv 的比例风险假设可能失效，非线性网络也不会自动修复。",
    ],
    howToUse: [
      "画 cohort flow 与 KM 曲线，检查事件/删失时间。",
      "先 Cox 线性基线，再用 DeepSurv 证明非线性增益。",
      "检查 Schoenfeld/时间交互或分层诊断 PH 假设。",
      "按时间外测试并报告风险排序与绝对概率校准。",
    ],
    tuning: [
      "网络容量相对事件数而非总人数选择。",
      "ties 方法在大量离散事件时间下很重要。",
      "time horizon 必须有足够 at-risk 样本。",
    ],
    settings: [
      {
        name: "hidden layers",
        start: "一到两层小 MLP 与 Cox 对照。",
        adjust: "重复交叉验证稳定提升再加容量。",
      },
      {
        name: "regularization",
        start: "较强 L2/dropout 起步。",
        adjust: "事件少或 C-index 波动时加强。",
      },
      {
        name: "evaluation horizon",
        start: "选业务有意义且随访充分的时点。",
        adjust: "尾部风险人数过少则缩短或报告高不确定性。",
      },
    ],
    modifications: [
      "非比例风险可用时间交互、分层 Cox 或离散时间模型。",
      "竞争风险需建 cause-specific 或 cumulative incidence，不把其他事件简单删失。",
    ],
    pitfalls: ["把删失者标为负类。", "用 C-index 高就宣称 1 年风险概率准确。"],
    example:
      "100 人中随访结束 40 人无复发，这 40 人仍贡献截止前风险集；模型必须另做 1 年校准，不能只报 C-index。",
    compareTo: ["logistic-regression", "neural-networks", "xgboost"],
  },
  {
    id: "deep-ensembles",
    source: {
      label:
        "Lakshminarayanan et al.: Simple and Scalable Predictive Uncertainty Estimation (2016)",
      url: "https://arxiv.org/abs/1612.01474",
    },
    title: "Deep Ensembles：用多个解表达模型不确定性",
    englishTitle: "Deep Ensembles and Predictive Uncertainty",
    category: "training",
    level: "进阶",
    duration: "12 分钟",
    icon: "⋮",
    summary:
      "独立初始化并训练多个模型，平均预测得到更稳的概率，用成员分歧观察 epistemic uncertainty。",
    intuition:
      "同一数据允许多个同样合理的函数。若不同模型在某个样本上给出不同答案，说明训练数据没有把那里约束清楚。",
    core: "分类时平均成员概率而非 logits；总预测熵混合数据噪声与模型分歧，可用平均熵和 mutual information 分解线索。回归成员可输出均值与方差，用 law of total variance 合并 aleatoric 与 epistemic 部分。",
    equation: "p̄(y|x)=1/M Σₘpₘ(y|x); Var(y)=Eₘ[σₘ²+μₘ²]−Eₘ[μₘ]²",
    mechanicsSteps: [
      "固定数据切分与预处理，用不同 seed/bootstraps 独立训练 M 个成员。",
      "每个成员分别通过验证与校准检查，排除训练失败成员。",
      "推理收集 M 组概率并求平均，同时计算方差、熵或成员 disagreement。",
      "在 in-domain、corruption 与真实 shift 上共同评估 accuracy、NLL、calibration 和 selective risk。",
    ],
    whenToUse: [
      "质量与不确定性重要，能承担多倍训练/推理。",
      "需要强稳健基线比较 Bayesian 近似。",
      "Active Learning 或人工复核需要 Disagreement 信号。",
    ],
    limits: [
      "成员共享数据和架构，可能对同一系统性偏差一致自信。",
      "计算、存储和服务成本近似乘以成员数。",
    ],
    howToUse: [
      "先确保单模型数据与校准流程正确。",
      "保存每个成员独立 checkpoint 和 seed。",
      "平均 probabilities，并测试 member dropout 对质量影响。",
      "不确定性阈值在独立 validation/shift set 选择。",
    ],
    tuning: [
      "M 从 3–5 常能看到大部分收益。",
      "成员多样性来自 seed、bootstrap 或架构，但不能破坏可比性。",
      "温度校准可对 ensemble 输出单独拟合。",
    ],
    settings: [
      {
        name: "ensemble size",
        start: "M=3 或 5 建立收益曲线。",
        adjust: "边际质量趋平后停止增加。",
      },
      {
        name: "diversity",
        start: "独立 seed 与 shuffle。",
        adjust: "分歧过低可试 bootstrap；分歧高先排除失败成员。",
      },
      {
        name: "aggregation",
        start: "分类平均概率，回归合并均值/方差。",
        adjust: "加权前必须用独立验证证明稳定收益。",
      },
    ],
    modifications: [
      "snapshot ensemble 用一个训练轨迹保存多个解，成本低但多样性通常较弱。",
      "teacher ensemble 可蒸馏成单 student，保留部分质量但不等价于完整分歧。",
    ],
    pitfalls: [
      "平均 logits 与平均 probabilities 混用。",
      "把低 disagreement 当作输入一定属于训练分布。",
    ],
    example:
      "五个病灶分类模型均值为 0.52，但成员从 0.1 到 0.9，适合转人工复核；若五个都错误地为 0.99，ensemble 也无法发现共同偏差。",
    compareTo: [
      "calibration-uncertainty",
      "conformal-selective-prediction",
      "neural-networks",
    ],
  },
  {
    id: "conformal-selective-prediction",
    source: {
      label:
        "Angelopoulos & Bates: A Gentle Introduction to Conformal Prediction (2021)",
      url: "https://arxiv.org/abs/2107.07511",
    },
    title: "Conformal、拒答与 OOD：知道何时不确定",
    englishTitle: "Conformal and Selective Prediction",
    category: "training",
    level: "高级",
    duration: "14 分钟",
    icon: "⊘",
    summary:
      "用独立 calibration set 的 nonconformity 分数构造有限样本预测集，并用 coverage、set size 与 selective risk 管理拒答。",
    intuition:
      "不强迫模型每次给一个答案；先看正确答案在校准样本中通常有多‘不像’，再给新样本足够大的候选集合覆盖真实标签。",
    core: "split conformal 在可交换性下选择有限样本校正分位数 q̂。分类把概率不足的标签加入集合，回归给区间。保证是边际 coverage，不能自动保证每个 subgroup、每个样本或 shift 后仍成立；OOD detection 是不同目标。",
    equation:
      "q̂=Quantileceil((n+1)(1−α))/n({sᵢ}); C(x)={y:s(x,y)≤q̂}; P(Y∈C(X))≥1−α",
    mechanicsSteps: [
      "训练模型后保留从未用于拟合/调参的 calibration set。",
      "为每个校准样本计算 nonconformity，例如分类 s=1−ptrue。",
      "按有限样本修正索引取 1−α 分位数 q̂；新样本保留 s(x,y)≤q̂ 的标签。",
      "报告 coverage、平均集合大小、空/全标签比例，并按 subgroup 与 shift 压力测试。",
    ],
    whenToUse: [
      "需要可解释的预测集合或回归区间。",
      "系统允许拒答/人工复核。",
      "黑盒模型已训练好，希望加分布自由校准层。",
    ],
    limits: [
      "exchangeability 被时间或域偏移破坏时 coverage 可能失效。",
      "边际 90% 不等于每个类别和每个人群都 90%。",
    ],
    howToUse: [
      "在训练/调参后再隔离 calibration。",
      "预先选择 α 与业务风险，不用 test 调。",
      "同时报告效率与 coverage，集合全大虽覆盖但无用。",
      "将 OOD score、conformal set 和 abstention 分开评估。",
    ],
    tuning: [
      "α 直接控制覆盖目标与集合大小。",
      "nonconformity score 可利用校准概率或 class-conditional 设计。",
      "calibration size 决定分位数分辨率与稳定性。",
    ],
    settings: [
      {
        name: "target α",
        start: "按允许错误率预注册，如 0.1。",
        adjust: "只用业务成本调整，不按测试表现追逐。",
      },
      {
        name: "calibration split",
        start: "与部署分布一致且独立。",
        adjust: "时间变化明显时用 rolling/recalibration 并承认假设变化。",
      },
      {
        name: "abstention rule",
        start: "集合大于 1 或置信低时转人工。",
        adjust: "在验证集画 coverage–risk–workload 曲线。",
      },
    ],
    modifications: [
      "Mondrian conformal 可按类别/预定义组校准。",
      "covariate shift 下可做加权 conformal，但依赖可靠 density ratio。",
    ],
    pitfalls: [
      "用 calibration set 反复选模型后仍声称严格保证。",
      "把 softmax 最大值当成经证明的 OOD detector。",
    ],
    example:
      "目标 90% coverage 时，模型可返回 {猫,狐} 而非强给单类；若新相机使 coverage 降到 76%，说明 exchangeability 已破坏，需要重新校准或回退。",
    compareTo: [
      "calibration-uncertainty",
      "deep-ensembles",
      "logistic-regression",
    ],
  },
  {
    id: "causal-treatment-effects",
    source: {
      label: "Hernán & Robins: Causal Inference—What If (2020)",
      url: "https://www.hsph.harvard.edu/miguel-hernan/causal-inference-book/",
    },
    title: "DAG、Propensity 与 Treatment Effect：从预测到干预",
    englishTitle: "Causal DAGs and Treatment Effects",
    category: "classical",
    level: "高级",
    duration: "16 分钟",
    icon: "⇢",
    summary:
      "先用因果图写清混杂、碰撞点与时间，再用 propensity 或 outcome models 在可识别假设下估计平均与异质处理效应。",
    intuition:
      "预测谁会好转不等于知道给治疗会不会让他好转。因果问题比较同一个体在 treatment 与 no-treatment 两个无法同时观察的世界。",
    core: "潜在结果 Y(1),Y(0) 定义 treatment effect。观测数据识别通常需要 consistency、exchangeability 和 positivity。DAG 决定该控制哪些前置混杂，不能机械控制所有变量。propensity e(x)=P(A=1|X) 可用于 matching/weighting；doubly robust 联合 outcome 与 propensity。",
    equation: "ATE=E[Y(1)−Y(0)]; e(x)=P(A=1|X); w=A/e(X)+(1−A)/(1−e(X))",
    mechanicsSteps: [
      "明确 treatment、outcome、time zero、eligibility 与 estimand，画出变量发生时间。",
      "用 DAG 选择足以阻断 backdoor 的前置混杂，不调整 treatment 后 mediator 或 collider。",
      "在训练折估 propensity/outcome，检查 overlap、极端权重和加权后 covariate balance。",
      "估计 ATE/CATE 并用 bootstrap、negative controls 与 sensitivity analysis 表达不确定性和未测混杂风险。",
    ],
    whenToUse: [
      "问题是干预效果而非风险预测。",
      "随机实验不可用但有充分的前置混杂变量。",
      "要决定谁可能受益而不是谁本来风险高。",
    ],
    limits: [
      "未测混杂无法由更复杂模型自动消除。",
      "positivity 差时模型在无支持区域外推反事实。",
    ],
    howToUse: [
      "在看结果前定义 target trial 与 estimand。",
      "DAG 由领域与时间知识构建，不由相关矩阵自动发现。",
      "报告 overlap、balance 与 effective sample size。",
      "把 predictive validation 与 causal identification 检查分开。",
    ],
    tuning: [
      "propensity clipping 降方差但改变 estimand。",
      "CATE 模型复杂度受 treatment-arm 有效样本限制。",
      "cross-fitting 减少同样本拟合 nuisance 与 effect 的偏差。",
    ],
    settings: [
      {
        name: "estimand",
        start: "先明确 ATE、ATT 或 policy value。",
        adjust: "支持集不足时限制目标人群，而非强行外推。",
      },
      {
        name: "propensity bounds",
        start: "可视化分布，不先武断截断。",
        adjust: "极端权重时报告多种阈值敏感性。",
      },
      {
        name: "effect model",
        start: "线性/树 DR learner 基线。",
        adjust: "异质性有重复证据再增加深度模型。",
      },
    ],
    modifications: [
      "随机试验可直接估计平均效果，再用预先指定模型探索 heterogeneity。",
      "纵向 treatment 需要 g-methods 处理 time-varying confounding。",
    ],
    pitfalls: [
      "用 outcome 预测重要性宣称 treatment 因果作用。",
      "调整 collider 或 treatment 后变量制造偏差。",
    ],
    example:
      "高风险患者更常接受治疗，直接比较结局会低估治疗；先在共同支持人群平衡 treatment 前变量，再估计效应并报告权重敏感性。",
    compareTo: ["logistic-regression", "offline-rl", "xgboost"],
  },
  {
    id: "imitation-learning",
    source: {
      label:
        "Ross et al.: A Reduction of Imitation Learning to No-Regret Online Learning (2011)",
      url: "https://arxiv.org/abs/1011.0686",
    },
    title: "Behavior Cloning、DAgger 与 GAIL：从示范学策略",
    englishTitle: "Imitation Learning, DAgger, and GAIL",
    category: "reinforcement",
    level: "高级",
    duration: "15 分钟",
    icon: "➟",
    summary:
      "Behavior cloning 只看专家状态；DAgger 收集学习者访问状态的专家动作；GAIL 通过判别器让 occupancy measure 接近专家。",
    intuition:
      "照着专家历史开车，一旦自己偏离路线就会进入没见过的状态。DAgger 让学习者实际开，再请专家标注怎样纠正。",
    core: "BC 是监督学习，分布偏移导致误差随 horizon 累积。DAgger 迭代混合专家/学习者 rollout，把访问状态加入数据。GAIL 训练 discriminator 区分 expert 与 policy state-action，再用 RL 让策略骗过它；学到的是行为分布而非显式奖励。",
    equation:
      "D←D∪{(s,π*(s)):s∼dπ}; minπ maxD Eexpert logD(s,a)+Eπ log(1−D(s,a))",
    mechanicsSteps: [
      "先用专家 trajectories 按完整 episode 切分，训练 BC 并做 closed-loop rollout。",
      "DAgger 用当前/混合策略访问环境，专家为这些状态给动作，再聚合重训。",
      "逐轮降低专家混合比例，记录干预次数、状态覆盖和安全失败。",
      "GAIL 交替更新 discriminator 与 policy optimizer，并用真实任务回报/约束验证是否学到正确目标。",
    ],
    whenToUse: [
      "有高质量示范但难手写 reward。",
      "模拟器或安全环境中可查询专家纠正。",
      "机器人/控制中需要从示范初始化再强化。",
    ],
    limits: [
      "DAgger 需要专家在线标注学习者状态，可能昂贵或危险。",
      "GAIL 训练不稳定且可模仿表面行为，不保证目标语义。",
    ],
    howToUse: [
      "先建立 BC 和 expert performance 上界。",
      "评估必须 closed-loop，不只算动作分类准确率。",
      "定义专家查询、安全 override 和数据版本。",
      "按 episode seed/场景报告成功率与 intervention。",
    ],
    tuning: [
      "DAgger mixing schedule 平衡安全与覆盖。",
      "GAIL discriminator capacity/updates 过强会让 policy 梯度枯竭。",
      "entropy bonus 保持探索但可能降低精确控制。",
    ],
    settings: [
      {
        name: "expert mixing β",
        start: "从较高专家比例逐轮衰减。",
        adjust: "失败危险就慢降；覆盖不足且环境安全可快降。",
      },
      {
        name: "aggregation rounds",
        start: "每轮固定 rollout 数并看错误是否饱和。",
        adjust: "新状态仍频繁出现则继续收集。",
      },
      {
        name: "GAIL update ratio",
        start: "policy 与 discriminator 近似平衡。",
        adjust: "判别准确率长期接近 100% 时减少其更新或容量。",
      },
    ],
    modifications: [
      "safe DAgger 用不确定性触发专家接管。",
      "先 BC 再 offline/online RL，用示范提高初始安全与样本效率。",
    ],
    pitfalls: [
      "随机拆 trajectory 让相邻状态泄漏。",
      "只看 imitation loss，不运行策略看 compounding error。",
    ],
    example:
      "机械臂 BC 在标准起点成功率 90%，轻微偏移后 40%；DAgger 收集偏移状态的专家纠正后，闭环成功率提升，而动作准确率可能变化很小。",
    compareTo: ["offline-rl", "actor-critic", "model-based-rl"],
  },
  {
    id: "safe-rl-pomdp",
    source: {
      label: "Achiam et al.: Constrained Policy Optimization (2017)",
      url: "https://arxiv.org/abs/1705.10528",
    },
    title: "POMDP 与 Safe RL：看不全时仍守约束",
    englishTitle: "Partial Observability and Safe Reinforcement Learning",
    category: "reinforcement",
    level: "高级",
    duration: "15 分钟",
    icon: "⚑",
    summary:
      "用 belief 或 recurrent state 处理部分可观测性，用 CMDP 把奖励与成本分开，并在策略更新中限制安全成本。",
    intuition:
      "agent 看到的是带噪快照，不是完整世界；同时‘得高分’不能补偿一次不可接受事故，所以安全成本需要独立约束。",
    core: "POMDP 以 observation 替代真实 state，策略依赖 history 或 belief。CMDP 最大化 expected return，同时要求 Jc(π)≤d。Lagrangian 用 multiplier 权衡，CPO 类方法在 trust region 内近似满足成本约束；任何训练期保证都依赖模型与估计。",
    equation: "maxπ Jᵣ(π) s.t. Jc(π)≤d; L(π,λ)=Jᵣ(π)−λ(Jc(π)−d)",
    mechanicsSteps: [
      "区分隐藏 state、可见 observation、reward、cost 与硬约束。",
      "用 frame stack、RNN state 或显式 belief 汇总历史，并测试 state reset。",
      "分别估计 reward return 与 cost return/advantages，不能把成本简单混成奖励后隐藏。",
      "策略更新限制 KL/step，并更新 λ 或解约束子问题；在 worst-case scenarios 做独立安全测试。",
    ],
    whenToUse: [
      "传感器不足、延迟或噪声使当前观测不满足 Markov。",
      "存在碰撞、剂量或资源等不可交换约束。",
      "可在模拟器和受控阶段逐步上线。",
    ],
    limits: [
      "期望成本约束不等于每条轨迹都安全。",
      "稀有事故估计方差大，模拟器遗漏的 failure mode 无法被保证。",
    ],
    howToUse: [
      "先写 hard constraints 与可优化 cost 的区别。",
      "建立 rule-based safe baseline 和 emergency fallback。",
      "按 episode 记录 cost 分布、CVaR 和最差 cohort。",
      "从 offline/shadow 到小流量上线并保留人工 override。",
    ],
    tuning: [
      "cost limit d 应来自需求，不能为提升 reward 偷调。",
      "λ 学习率过大振荡，过小长期违反约束。",
      "recurrent horizon 与 burn-in 影响 belief 质量。",
    ],
    settings: [
      {
        name: "cost limit",
        start: "由系统安全规范预先固定。",
        adjust: "只有需求变化才改，并重新验证。",
      },
      {
        name: "Lagrange multiplier",
        start: "小正值与慢更新。",
        adjust: "持续违规提高；在边界剧烈振荡则减小步长。",
      },
      {
        name: "history / memory",
        start: "先 frame stack，再比较 GRU。",
        adjust: "需要更长隐藏信息且数据足够时增加记忆。",
      },
    ],
    modifications: [
      "shield 在动作执行前拦截已知不安全动作。",
      "risk-sensitive/CVaR 目标关注尾部成本，而非只看期望。",
    ],
    pitfalls: [
      "把负 reward 当作绝对安全保证。",
      "训练平均 cost 达标就忽略单次灾难轨迹。",
    ],
    example:
      "机器人 reward 鼓励速度，cost 记录碰撞；即使平均回报高，也要求碰撞率上限和 shield，且对传感器遮挡场景单独测试 recurrent policy。",
    compareTo: ["ppo", "offline-rl", "model-based-rl"],
  },
  {
    id: "quantization",
    source: {
      label:
        "Jacob et al.: Quantization and Training for Integer-Arithmetic-Only Inference (2017)",
      url: "https://arxiv.org/abs/1712.05877",
    },
    title: "量化：把浮点张量映射到低比特整数",
    englishTitle: "Post-Training and Quantization-Aware Training",
    category: "training",
    level: "进阶",
    duration: "13 分钟",
    icon: "▥",
    summary:
      "用 scale 与 zero-point 表示有限范围，比较 PTQ 与 QAT，并把精度、模型大小和真实硬件延迟一起验证。",
    intuition:
      "把连续数轴切成有限格子；范围太大浪费格子，范围太小会 clipping。校准决定格子放在哪里。",
    core: "affine quantization 近似 r≈s(q−z)。per-tensor 共用 scale，per-channel 为每个输出通道设 scale。PTQ 用 calibration data 估范围；QAT 在训练前向插 fake quant，并用 straight-through estimator 近似反传。accumulator 通常更高位。",
    equation: "q=clip(round(r/s)+z,qmin,qmax); r̂=s(q−z)",
    mechanicsSteps: [
      "冻结 FP32 baseline 与代表性 calibration set，记录逐层 activation 范围。",
      "选择 bit width、对称/非对称、per-tensor/per-channel，计算 s,z 并模拟 round/clip。",
      "PTQ 直接转换；若掉点过大，用 QAT fake quant 微调，使权重适应量化噪声。",
      "在目标 runtime 导出并测模型大小、峰值内存、batch=1 延迟、吞吐和分组质量。",
    ],
    whenToUse: [
      "CPU/边缘推理受内存带宽和整数算子加速。",
      "模型分发大小或能耗受限。",
      "已有稳定模型，需要可测的部署压缩。",
    ],
    limits: [
      "硬件没有对应 kernel 时低比特可能更慢。",
      "outlier channels、LayerNorm/softmax 等敏感算子常需混合精度。",
    ],
    howToUse: [
      "先 profile 确认瓶颈和支持算子。",
      "calibration 数据覆盖真实输入范围。",
      "逐层比较 FP 与量化输出定位掉点。",
      "最终在目标设备而非开发 GPU 测性能。",
    ],
    tuning: [
      "per-channel 权重量化通常更稳但元数据更多。",
      "calibration percentile/entropy 影响 clipping。",
      "QAT 学习率应低于原训练，并短程微调。",
    ],
    settings: [
      {
        name: "precision",
        start: "权重/激活 INT8 建立基线。",
        adjust: "敏感层保留 FP16/FP32，再考虑更低比特。",
      },
      {
        name: "calibration",
        start: "数百到数千代表性样本。",
        adjust: "范围偏移或稀有模式掉点时增加对应 cohort。",
      },
      {
        name: "granularity",
        start: "权重 per-channel、激活按 runtime 支持。",
        adjust: "精度差先细化权重粒度，速度差则核对 kernel。",
      },
    ],
    modifications: [
      "weight-only 量化适合大模型内存瓶颈。",
      "smooth/scale 重分配可把 activation outliers 转移到权重。",
    ],
    pitfalls: ["文件变小就宣称延迟变快。", "用测试集选择 calibration 范围。"],
    example:
      "INT8 PTQ 让 CNN 小 4 倍但小病灶 recall 下降；逐层检查发现首层 activation clipping，改代表性 calibration 与保留首层高精度后恢复。",
    compareTo: ["mixed-precision", "distillation-pruning", "neural-networks"],
  },
  {
    id: "distillation-pruning",
    source: {
      label:
        "Hinton et al.: Distilling the Knowledge in a Neural Network (2015)",
      url: "https://arxiv.org/abs/1503.02531",
    },
    title: "蒸馏与剪枝：把容量换成更小的计算图",
    englishTitle: "Knowledge Distillation and Structured Pruning",
    category: "training",
    level: "进阶",
    duration: "13 分钟",
    icon: "✂",
    summary:
      "蒸馏让 student 拟合 teacher 的软分布；结构化剪枝删除通道、head 或 block，只有实际改变计算图才可能加速。",
    intuition:
      "hard label 只说正确类，teacher 的软概率还告诉你哪些错误类彼此相似；剪枝则把贡献低且可替代的结构真正移除。",
    core: "distillation 用温度 T 软化 logits，KL 项通常乘 T² 保持梯度尺度，并与 ground-truth loss 混合。unstructured sparsity 产生很多零但需稀疏 kernel；structured pruning 删除完整通道/head，更容易得到墙钟收益。",
    equation: "L=αLhard+(1−α)T² KL(softmax(zt/T)||softmax(zs/T))",
    mechanicsSteps: [
      "冻结并验证 teacher，选择满足设备约束的 student 架构。",
      "同一输入获得 teacher/student logits，在温度 T 下计算 soft KL 与 hard loss。",
      "若剪枝，按通道/head/block 重要度逐步删除并 fine-tune，而非只把权重置零。",
      "重新导出 compact graph，在目标设备测质量、大小、内存和延迟。",
    ],
    whenToUse: [
      "大模型质量好但部署成本过高。",
      "有 teacher logits 或可离线生成软标签。",
      "硬件对更窄/更浅 dense 图加速明确。",
    ],
    limits: [
      "student 容量不足时无法复现 teacher。",
      "稀疏率高不等于加速，部署栈可能不支持。",
    ],
    howToUse: [
      "先定义实际 latency/memory 目标。",
      "比较同架构从头训练，确认收益来自 teacher。",
      "逐层/逐 cohort 检查被剪结构影响。",
      "导出后重新跑完整 test，避免训练图与部署图差异。",
    ],
    tuning: [
      "T 控制暗知识平滑程度。",
      "α 平衡真实标签与 teacher 偏差。",
      "剪枝 schedule 小步删除通常比一次性稳定。",
    ],
    settings: [
      {
        name: "temperature",
        start: "T=2–4 与 T=1 比较。",
        adjust: "teacher 分布仍过尖可提高；类间噪声被放大则降低。",
      },
      {
        name: "loss weight",
        start: "hard 与 soft 各占可见比例。",
        adjust: "teacher 在关键 cohort 偏差大时提高 hard 权重。",
      },
      {
        name: "structured sparsity",
        start: "先删 10–20% 通道并 fine-tune。",
        adjust: "沿质量—延迟曲线逐步增加，停止于真实收益拐点。",
      },
    ],
    modifications: [
      "匹配中间特征或 attention maps 提供额外监督。",
      "先剪枝再蒸馏，teacher 帮助恢复 compact student。",
    ],
    pitfalls: [
      "teacher 与 student tokenizer/augmentation 不一致。",
      "报告参数减少但未重建紧凑权重矩阵。",
    ],
    example:
      "ResNet teacher 蒸馏到窄 student 后，再结构化删除 20% 通道；只有重新导出并在手机测到延迟下降才算成功。",
    compareTo: ["quantization", "transfer-lora", "resnet"],
  },
  {
    id: "model-serving-monitoring",
    source: {
      label:
        "Sculley et al.: Hidden Technical Debt in Machine Learning Systems (2015)",
      url: "https://papers.nips.cc/paper/5656-hidden-technical-debt-in-machine-learning-systems",
    },
    title: "导出、服务与监控：让训练结果在真实系统中成立",
    englishTitle: "Model Export, Serving, and Monitoring",
    category: "training",
    level: "进阶",
    duration: "15 分钟",
    icon: "⌁",
    summary:
      "把预处理、模型、后处理和版本写成可重放契约；同时监控服务、数据、预测、反馈与分组结果。",
    intuition:
      "checkpoint 只是系统的一部分。线上输入少一个归一化、类别字典错一位或反馈晚一个月，都能让离线好模型失效。",
    core: "export 需固定 input signature、dynamic axes、dtype 与算子支持。服务需 batching、timeout、fallback 和版本路由。监控分为 system metrics、data quality/drift、prediction distribution、delayed performance 与 cohort guardrails；drift 是调查信号，不自动等于质量下降。",
    equation:
      "total latency = queue + preprocess + inference + postprocess + network; SLI measured per version and cohort",
    mechanicsSteps: [
      "把训练预处理与后处理封装成版本化函数，建立 golden inputs/outputs。",
      "导出 ONNX/目标 runtime，比较 eager 与 exported outputs、dynamic shapes 和异常输入。",
      "在目标硬件测冷启动、p50/p95/p99、batch=1 与吞吐；设置 timeout、fallback 和 canary。",
      "上线记录模型/特征版本、输入摘要、预测和反馈 join key，按时间与 cohort 监控并演练回滚。",
    ],
    whenToUse: [
      "任何要离开 notebook 的模型。",
      "多团队共享特征、runtime 或在线反馈。",
      "需要持续更新、审计或回滚。",
    ],
    limits: [
      "没有及时标签时只能监控 proxy，不能直接知道准确率。",
      "分布统计正常也可能发生 Concept Drift 或系统性偏差。",
    ],
    howToUse: [
      "先写 serving contract 与 SLO。",
      "用生产样本建立 shadow/canary 比较。",
      "每次发布绑定数据、代码、权重与 schema 版本。",
      "告警必须指向负责人、阈值理由与响应动作。",
    ],
    tuning: [
      "batch window 在吞吐与单请求延迟间权衡。",
      "dynamic shape 范围越宽，编译优化越难。",
      "drift 阈值应由历史正常波动和行动成本确定。",
    ],
    settings: [
      {
        name: "batching",
        start: "低延迟先 batch=1，记录队列。",
        adjust: "吞吐不足再加短 batching window 并约束 p99。",
      },
      {
        name: "canary traffic",
        start: "从极小比例与可回滚 cohort 开始。",
        adjust: "system 和 quality guardrail 稳定后逐步扩大。",
      },
      {
        name: "monitor windows",
        start: "分钟级系统、日级数据、标签到达后性能。",
        adjust: "按业务季节性与反馈延迟设置多时间窗。",
      },
    ],
    modifications: [
      "champion/challenger 在 shadow 中持续比较。",
      "无法获得标签时加入人工抽检与 targeted review。",
    ],
    pitfalls: [
      "只监控 HTTP 200 和平均延迟。",
      "训练与服务各自实现 tokenizer/normalization。",
    ],
    example:
      "模型 A 离线更准，但线上 p99 超时触发空结果；完整监控会同时显示队列、fallback 率、输入 drift 与延迟标签性能，而不是只看平均 accuracy。",
    compareTo: ["quantization", "mixed-precision", "data-leakage"],
  },
];
