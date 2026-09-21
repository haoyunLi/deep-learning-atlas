import type { Exercise } from "./exerciseTypes";

export const trainingLanguageExercises: Record<string, Exercise[]> = {
  "batch-normalization": [
    {
      id: "batch-normalization-mechanism",
      kind: "mechanism",
      question:
        "BatchNorm2d 接收 [8,32,16,16] 的 NCHW 特征。训练时，一个通道的均值通常由多少个值计算？",
      options: [
        "32：只跨通道维",
        "2048：跨 8×16×16 的 batch 与空间位置",
        "65536：把所有通道和位置一起平均",
        "8：只取每张图的一个空间位置",
      ],
      answer: 1,
      explanation:
        "每个通道独立统计，归约轴为 B、H、W，所以参与值数为 8×16×16=2048。32 个通道各自得到均值和方差，γ、β 各有 32 个可学习元素。",
    },
    {
      id: "batch-normalization-decision",
      kind: "decision",
      question:
        "微调时将 BN 的 γ、β 设为 requires_grad=false，但同一验证图像的预测仍随同批图像变化。最该先检查什么？",
      options: [
        "把梯度累积次数从 1 增加到 16",
        "把所有卷积层加宽一倍",
        "是否仍处于 train 模式，以及是否启用了 running statistics",
        "把验证 batch 随机打乱得更充分",
      ],
      answer: 2,
      explanation:
        "冻结 γ、β 的梯度不会停止训练模式下的 batch 统计和 running statistics 更新。默认配置应在验证时 eval()；若 track_running_stats=false，即使 eval 也可能依赖同批样本。",
    },
  ],
  "layer-normalization": [
    {
      id: "layer-normalization-mechanism",
      kind: "mechanism",
      question:
        "对一个 token 的 [1,1,3,3] 做 LayerNorm，设 γ=1、β=0 并忽略 ε，输出是什么？",
      options: [
        "[−1,−1,1,1]",
        "[0.447,0.447,1.342,1.342]",
        "[0,0,0,0]",
        "需要知道其他 batch 样本，无法计算",
      ],
      answer: 0,
      explanation:
        "均值为 2，按 4 个特征计算的方差为 1，减均值后除以标准差得到 [−1,−1,1,1]。第二项是同样忽略 ε 的 RMSNorm 结果；它没有减均值。",
    },
    {
      id: "layer-normalization-decision",
      kind: "decision",
      question:
        "causal Transformer 的输入是 [B,T,D]，希望每个 token 独立归一化且支持不同长度。应选哪种配置？",
      options: [
        "LayerNorm([T,D])，把全部时间位置共同归一化",
        "沿 B 维求均值方差，并为推理保存统计量",
        "去掉 padding mask，因为归一化会自动去除 padding",
        "LayerNorm(D)，并继续正确使用 attention 与 loss mask",
      ],
      answer: 3,
      explanation:
        "LayerNorm(D) 只归约当前 token 的特征，统计不依赖其他位置或其他样本。归一化不负责控制 attention 可见性或排除 padding 监督，这两种 mask 仍要保留。",
    },
  ],
  "learning-rate-schedules": [
    {
      id: "learning-rate-schedules-mechanism",
      kind: "mechanism",
      question:
        "每个 epoch 有 400 个 micro-batch，累积 4 次才更新一次，共训练 10 epochs。按 optimizer update 计数的日程有多少步？",
      options: ["100 步", "400 步", "1000 步", "4000 步"],
      answer: 2,
      explanation:
        "每 epoch 有 400÷4=100 次更新，10 epochs 共 1000 次。若每个 micro-batch 都推进按更新设计的 scheduler，学习率会比预期快 4 倍走完日程。这里假设没有跳步或残余 batch。",
    },
    {
      id: "learning-rate-schedules-decision",
      kind: "decision",
      question:
        "恢复训练后 loss 突然振荡，记录显示 lr 回到了训练开始值。最合理的修复是什么？",
      options: [
        "恢复 optimizer、scheduler 和有效更新计数，并检查恢复前后的实际 lr 连续性",
        "只把总 epoch 数增加一倍",
        "把验证集加入训练，增加样本数",
        "不记录 lr，只观察最终准确率",
      ],
      answer: 0,
      explanation:
        "只恢复模型权重不能恢复优化过程。Adam 的矩估计、日程状态和更新位置都影响下一步；先验证 lr 是否连续，再判断是否还存在数据或数值问题。",
    },
  ],
  "gradient-clipping": [
    {
      id: "gradient-clipping-mechanism",
      kind: "mechanism",
      question:
        "真实梯度 g=[3,4]，使用 global L2 norm clipping，max_norm=2，忽略 ε。裁剪后是什么？",
      options: ["[2,2]", "[3,4]", "[0.6,0.8]", "[1.2,1.6]"],
      answer: 3,
      explanation:
        "原范数为 5，统一乘 2/5 得 [1.2,1.6]，新范数为 2 且方向保留。[2,2] 是逐元素截断的结果，会改变原来的坐标比例。",
    },
    {
      id: "gradient-clipping-decision",
      kind: "decision",
      question:
        "使用 FP16 GradScaler 并累积 4 个 micro-batch。应该在哪里裁剪梯度？",
      options: [
        "每个 scaled backward 后立即裁剪，然后再累积",
        "完成 4 次累积后 unscale，一次裁剪，再执行 optimizer step",
        "先 optimizer step，再裁剪以修复本次更新",
        "在 forward 之前裁剪模型参数值",
      ],
      answer: 1,
      explanation:
        "阈值针对有效 batch 的真实梯度。先完成累积，再 unscale 还原尺度，随后裁剪并更新；逐 micro-batch 裁剪会改变累积结果，裁剪 scaled gradients 会让实际阈值意外变小。",
    },
  ],
  "mixed-precision": [
    {
      id: "mixed-precision-mechanism",
      kind: "mechanism",
      question:
        "GradScaler 将 loss 乘 1024，之后按正确流程反传并 unscale。正常有限梯度送入 optimizer 时，尺度如何变化？",
      options: [
        "大致恢复为原 loss 的梯度尺度，主要变化来自数值舍入",
        "始终放大 1024 倍，相当于学习率增加 1024 倍",
        "缩小到原梯度的 1/1024",
        "只保留梯度符号，丢弃大小",
      ],
      answer: 0,
      explanation:
        "链式法则让 scaled loss 的梯度也乘 1024；更新前再除 1024 会还原尺度。Loss scaling 的目的在于减少低精度小梯度下溢，不是改变期望学习率，也无法修复 forward 中已发生的溢出。",
    },
    {
      id: "mixed-precision-decision",
      kind: "decision",
      question:
        "启用 FP16 后某个 forward 运算首先出现 Inf，GradScaler 持续跳步。下一步更合理的是？",
      options: [
        "继续增大 loss scale，让所有数更大",
        "关闭所有非有限值检查并强制更新",
        "定位该运算，比较 BF16 或局部 FP32，并复查激活与数据范围",
        "只把输出序列截短，认为梯度缩放会自动修复 forward",
      ],
      answer: 2,
      explanation:
        "Forward 已溢出意味着当前数值格式或运算范围存在问题。Loss scaling 作用在反向梯度尺度，无法使已经产生的 Inf 恢复；BF16 的更宽指数范围或局部 FP32 可作为经验证的修复选择。",
    },
  ],
  tokenization: [
    {
      id: "tokenization-mechanism",
      kind: "mechanism",
      question:
        "token IDs 的形状为 [2,3]，embedding 表为 [32000,512]。查表后的输出形状是什么？",
      options: ["[2,32000]", "[2,3,512]", "[32000,3,512]", "[2,3,32000]"],
      answer: 1,
      explanation:
        "每个 token ID 索引一条 512 维向量，因此 [B,T] 变为 [B,T,D]=[2,3,512]。[2,3,32000] 通常是语言模型输出 head 的词表 logits 形状。",
    },
    {
      id: "tokenization-decision",
      kind: "decision",
      question:
        "给已有语言模型增加一个特殊 token 后，它的 ID 超出原 embedding 行数。正确处理是什么？",
      options: [
        "直接把新 ID 对旧词表大小取模",
        "只修改解码显示字符串，无需改变模型",
        "重新随机排列全部 token ID，让新 token 放在中间",
        "同步扩展相关 embedding/output 层，并训练新增参数及保存 tokenizer 配置",
      ],
      answer: 3,
      explanation:
        "新增 ID 需要对应的模型参数行，某些模型的输入输出权重还会绑定。仅添加 tokenizer 字符串不会自动赋予新 token 语义；ID 重排或取模会破坏原有 token 与权重的对应关系。",
    },
  ],
  "positional-encoding": [
    {
      id: "positional-encoding-mechanism",
      kind: "mechanism",
      question:
        "RoPE 中 q=k=[1,0]，q 的旋转角为 0，k 为 π/2。旋转后的点积是多少？",
      options: ["1", "−1", "0", "π/2"],
      answer: 2,
      explanation:
        "q 仍为 [1,0]，k 转为 [0,1]，点积为 0。这个二维例子展示相对旋转如何进入相似度；实际 attention 还会汇总多个频率维度并受内容影响。",
    },
    {
      id: "positional-encoding-decision",
      kind: "decision",
      question:
        "一个提示已有 128 个有效 token，缓存解码每次只输入 1 个新 token，却总把其 position ID 设为 0。应如何修复？",
      options: [
        "让位置按已有前缀接续，并同步检查 cache position 与 mask",
        "把所有历史 K 也改成 position 0",
        "去掉 causal mask，因为 RoPE 已表达先后关系",
        "只提高 sampling temperature 来掩盖位置误差",
      ],
      answer: 0,
      explanation:
        "新增 token 应按模型约定从前缀后的正确位置继续，例如下一个位置为 128。输入张量的长度 1 不等于全局位置 0；位置偏移会破坏 Q 与历史 K 的相对旋转关系。",
    },
  ],
  "autoregressive-inference": [
    {
      id: "autoregressive-inference-mechanism",
      kind: "mechanism",
      question:
        "某步概率已按降序为 [0.665,0.245,0.090]。使用 top-p=0.8 时，通常保留哪些候选？",
      options: [
        "只保留第一项，因为它概率最大",
        "三项都保留，top-p 只影响温度",
        "只保留第二项，因为 0.245 最接近 0.2",
        "保留前两项，并重新归一化后抽样",
      ],
      answer: 3,
      explanation:
        "第一项累计概率 0.665 未达到 0.8，前两项累计为 0.910，形成达到阈值的最小前缀集合。过滤后需重新归一化，第二项仍有被抽到的可能。",
    },
    {
      id: "autoregressive-inference-decision",
      kind: "decision",
      question:
        "比较两个模型的问答质量时，A 生成 1 个候选，B 生成 20 个并人工挑最好。怎样报告才合理？",
      options: [
        "直接比较最好答案，候选数不影响公平性",
        "固定候选与生成预算，或明确报告不同预算下的质量、选择规则和成本",
        "只比较两者输出的最长答案",
        "把 B 的温度设为 0，就可忽略多候选成本",
      ],
      answer: 1,
      explanation:
        "更多候选和人工选择增加了推理与选择预算。可以研究这种质量—成本取舍，但需要公开候选数、选择方法和费用；若要比较模型本身，应尽量统一评估协议。",
    },
  ],
  "kv-cache": [
    {
      id: "kv-cache-mechanism",
      kind: "mechanism",
      question:
        "32 层、B=1、T=4096、8 个 KV heads、head_dim=128、每元素 2 字节。只计算 K/V cache，约占多少内存？",
      options: ["512 MiB", "256 MiB", "16 MiB", "4 GiB"],
      answer: 0,
      explanation:
        "2×32×1×4096×8×128×2=536870912 字节，即 512 MiB。最前面的 2 表示 K 和 V 两份；这不包括模型权重、临时激活或缓存分配余量。",
    },
    {
      id: "kv-cache-decision",
      kind: "decision",
      question:
        "手写生成循环已有完整前缀 cache，但每次仍传入整段前缀，缓存长度异常增长。应怎样改？",
      options: [
        "将缓存中的所有张量清零后继续追加",
        "每次把 position ID 随机重置",
        "只传尚未缓存的新 token，并保持 past+current mask 和位置正确",
        "增大 max_new_tokens，让长度增长更平滑",
      ],
      answer: 2,
      explanation:
        "已有前缀的 K/V 已在 cache 中，再传全部前缀可能重复追加。缓存循环应输入未缓存部分，维护正确的总可见长度和位置；可用完整重算 logits 做小样例一致性检查。",
    },
  ],
  "grouped-query-attention": [
    {
      id: "grouped-query-attention-mechanism",
      kind: "mechanism",
      question:
        "Hq=8、Hkv=2 的 GQA，与相同 d、层数、长度和精度的 8-head MHA 相比，KV cache 元素数是多少？",
      options: [
        "相同，因为 query heads 仍是 8",
        "1/4；每 4 个 query heads 共享一组 KV",
        "1/8；GQA 永远只保留一个 KV head",
        "1/2；K 共享但 V 不共享",
      ],
      answer: 1,
      explanation:
        "缓存与 Hkv 成正比，2/8=1/4。每个 query head 保持自己的 Q 和 attention weights，所以共享 KV 不等于把 4 个 query heads 合成一个。",
    },
    {
      id: "grouped-query-attention-decision",
      kind: "decision",
      question:
        "想把一个已训练的 MHA checkpoint 转成更少 KV heads 的 GQA。最合适的路线是什么？",
      options: [
        "只修改配置里的 Hkv，原权重形状无需变化",
        "随机删掉大部分 query heads，并称输出完全等价",
        "在推理时平均最终答案 logits，代替修改 attention",
        "按组处理 K/V 投影，继续训练适配，并重新验证质量与速度",
      ],
      answer: 3,
      explanation:
        "GQA 改变 K/V 投影形状和共享约束。原论文使用组内 K/V 权重均值合并后继续训练；转换后的模型不能假定与原模型等价，缓存收益也需用实际 kernel 验证。",
    },
  ],
  "retrieval-augmented-generation": [
    {
      id: "retrieval-augmented-generation-mechanism",
      kind: "mechanism",
      question:
        "RAG-Sequence 的概率边缘化 p(y|q)≈Σd p(d|q)p(y|q,d) 中，d 表示什么？",
      options: [
        "输出层隐藏维度",
        "每个 query 的梯度范数",
        "作为潜变量的检索文档，按检索概率加权其条件生成概率",
        "必须逐字复制到答案的整个知识库",
      ],
      answer: 2,
      explanation:
        "原始 RAG-Sequence 把文档视为整段输出共享的潜变量，对 top-k 文档条件下的序列概率做加权求和。常见工程 pipeline 直接拼接多个文段生成答案，与这个特定概率模型需要区分。",
    },
    {
      id: "retrieval-augmented-generation-decision",
      kind: "decision",
      question:
        "RAG 回答正确率很低。把人工标注的正确证据直接交给同一生成器后，正确率大幅提升。应优先改哪里？",
      options: [
        "检索覆盖、chunk 切分和重排，检查正确证据在哪一步丢失",
        "只把生成 temperature 从 0.7 改为 0.6",
        "删除所有引用，减少输出长度",
        "直接加大生成器，而不再检查检索日志",
      ],
      answer: 0,
      explanation:
        "Gold evidence 对照说明生成器在拿到正确证据时能完成大量原先失败的题目。先检查 Recall@k、切分是否保留证据、重排是否淘汰正确片段，比仅调整生成温度更能定位瓶颈。",
    },
  ],
  "language-model-evaluation": [
    {
      id: "language-model-evaluation-mechanism",
      kind: "mechanism",
      question:
        "4 个有效目标 token 的正确标签概率都为 0.25。使用自然对数计算 NLL，再取指数，PPL 是多少？",
      options: ["0.25", "1.386", "25", "4"],
      answer: 3,
      explanation:
        "平均 NLL=−ln(0.25)=ln4≈1.386，因此 PPL=exp(ln4)=4。它度量 token 概率预测的平均难度，不能解读为问答正确率 25%。",
    },
    {
      id: "language-model-evaluation-decision",
      kind: "decision",
      question:
        "模型 A 和 B 使用不同 tokenizer，A 的 token PPL 更低。应如何判断哪个更适合领域问答？",
      options: [
        "直接选 A，PPL 对所有 tokenizer 都完全可比",
        "用统一任务与预算做问答评估，说明切分差异；如需概率比较，选择明确且可比的归一化协议",
        "直接选词表更大的模型，它必定理解更好",
        "只比较两者最短的一次生成",
      ],
      answer: 1,
      explanation:
        "不同 tokenizer 的 token 信息单位不同，token PPL 不宜直接排名。领域问答应在同一问题集、模板和预算下测任务表现，另行报告概率指标的分词与上下文协议。",
    },
  ],
};
