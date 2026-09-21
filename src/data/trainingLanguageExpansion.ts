import type { Lesson } from "./lessons";

export const trainingLanguageExpansionLessons: Lesson[] = [
  {
    id: "batch-normalization",
    source: {
      label: "Ioffe & Szegedy, Batch Normalization (2015)",
      url: "https://arxiv.org/abs/1502.03167",
    },
    title: "BatchNorm：用同批样本校准通道",
    englishTitle: "Batch Normalization",
    category: "training",
    level: "进阶",
    duration: "11 分钟",
    icon: "≋",
    summary:
      "训练时按通道汇总 batch 统计量，推理时通常换成移动统计量；选对归一化轴和模式才能得到一致结果。",
    intuition:
      "同一个通道像一支测量仪。BatchNorm 用这一批观测估计仪器的中心和尺度，再用可学习的增益 γ、偏移 β 调到下一层需要的范围。每个样本会受同批其他样本影响，所以换 batch 和切换 train/eval 都可能改变输出。",
    core: "Batch normalization 对选定轴求均值、方差，再标准化和仿射变换。对 CNN 的 [B,C,H,W]，每个通道跨 B、H、W 统计，γ、β 各为 [C]。默认推理使用训练累积的 running mean/variance。它可改善优化，但不能把所有收益简单归结为消除 internal covariate shift，也不保证每层输出总是零均值单位方差。",
    equation:
      "μc = meanB,H,W(xc);  σ²c = mean((xc−μc)²);  yc = γc(xc−μc)/√(σ²c+ε)+βc",
    mechanicsSteps: [
      "输入 [8,32,16,16] 表示 8 张图、32 个通道。对每个通道收集 8×16×16=2048 个值，得到 [32] 的 μ 与 σ²；不把 32 个通道混成一个统计量。",
      "训练 forward 用当前 batch 均值中心化、方差加 ε 后开平方做缩放。简化到单通道四个值 [1,3,5,7]：μ=4、σ²=5，忽略 ε 时输出约 [−1.342,−0.447,0.447,1.342]。",
      "对标准化结果逐通道乘 γ、加 β。初始化 γ=1、β=0；若学到 γ=2、β=1，上例首值变为约 −1.684，因此 BN 的最终输出不必均值为 0。",
      "backward 同时求输入和 γ、β 的梯度；均值与方差依赖当前 batch，因此同通道样本的梯度相互关联。running statistics 是状态缓冲，不是由 optimizer 学习的参数。",
      "更新移动统计量。例如 PyTorch momentum m=0.1 使用 running←0.9×running+0.1×batch；其训练标准化使用有偏方差，而 running variance 更新使用无偏估计，手写复现要区分。",
      "验证和部署切到 eval，默认以 running statistics 替代当前 batch 统计量，γ、β 保持不变。若显式关闭 track_running_stats，eval 也会使用 batch 统计量，必须单独记录这种配置。",
    ],
    whenToUse: [
      "CNN 分类或检测中有效统计样本充足，且采用的预训练骨干本身使用 BN。",
      "需要理解为什么同一图像在不同 batch、训练模式与评估模式下预测不同。",
    ],
    howToUse: [
      "先标注输入轴；NCHW 卷积输出常用 BatchNorm2d(C)，MLP 的 [B,D] 可用 BatchNorm1d(D)。",
      "从已有架构的 Conv→BN→activation 顺序开始；BN 的 β 已能提供偏移，紧邻 BN 的卷积通常可关闭 bias。",
      "训练使用 train()，验证使用 eval() 并关闭梯度；保存 checkpoint 时同时保存 running mean、running variance 与计数状态。",
      "在固定图像上比较单独预测与加入其他图像后的 eval 输出，确认其没有意外依赖同批样本。",
      "小数据微调先比较冻结 BN 统计量与重新估计的验证结果；冻结参数梯度不会自动停止 running statistics 更新。",
    ],
    tuning: [
      "统计可靠性取决于 B×H×W 以及样本相关性；同一视频的相邻帧很多也不等于独立样本很多。",
      "先检查 train/eval 状态再改 momentum；统计噪声大时降低新 batch 的权重，明显域变化时评估重新校准。",
      "ε 太小在近常量通道上放大数值误差；沿用预训练配置，再用激活范围和验证表现判断调整。",
    ],
    settings: [
      {
        name: "statistics axes / 统计轴",
        start: "NCHW 按 B、H、W 归一化，每通道独立。",
        adjust:
          "若换 NHWC 或输入序列，先转换布局或使用匹配的层，避免把长度当通道。",
      },
      {
        name: "momentum / 移动平均",
        start: "PyTorch 可从默认 0.1 开始；明确它是新统计量的权重。",
        adjust:
          "小 batch 波动大时试更低权重；更换框架时核对 momentum 定义是否相反。",
      },
      {
        name: "ε / train–eval",
        start: "沿用模型 ε，例如 1e−5，并在验证前显式 eval()。",
        adjust:
          "出现异常值查方差和精度；微调时分别决定是否更新 γβ 与运行统计量。",
      },
    ],
    modifications: [
      "多 GPU 可用 SyncBatchNorm 跨设备聚合统计，但会引入通信开销。",
      "每卡 batch 很小或 batch 组成变化很大时比较 GroupNorm；Transformer token 表示通常用 LayerNorm 或 RMSNorm。",
      "部署时可将固定统计量的 BN 折叠进相邻卷积权重与偏置，验证数值误差后减少算子。",
    ],
    limits: [
      "非独立样本、小统计集合或训练部署域不一致时，估计的均值方差可能失效。",
      "对自回归序列沿时间轴混合统计可能引入未来信息；直接套用图像 BN 设计不适合所有语言模型。",
    ],
    pitfalls: [
      "把 requires_grad=False 当成冻结整个 BN；它只冻结参数，训练模式下 buffers 仍会更新。",
      "验证忘记 eval()，导致 batch 顺序影响结果且验证数据污染 running statistics。",
      "用增大梯度累积次数来解决 BN 小 batch 问题；累积梯度不会合并各次 forward 的统计量。",
    ],
    example:
      "微调图像模型时每卡只能放 2 张图片：先固定预训练 BN 统计量作为基线，再比较 SyncBatchNorm 或 GroupNorm。记录同一验证集上的结果，不能仅用训练 loss 选方案。",
    compareTo: ["layer-normalization", "cnn", "regularization"],
  },
  {
    id: "layer-normalization",
    source: {
      label: "Ba, Kiros & Hinton, Layer Normalization (2016)",
      url: "https://arxiv.org/abs/1607.06450",
    },
    title: "LayerNorm：每个 token 自己定标尺",
    englishTitle: "Layer Normalization & RMSNorm",
    category: "training",
    level: "进阶",
    duration: "10 分钟",
    icon: "⊜",
    summary:
      "沿每个位置的特征维归一化，不依赖其他样本；理解归一化轴、残差顺序和 RMSNorm 的差别。",
    intuition:
      "把每个 token 的特征向量看作一份独立仪器读数。LayerNorm 只比较这份读数里的各维，让表示尺度可控；隔壁句子增加或离开 batch，不会改变它使用的统计量。",
    core: "对 Transformer 的 X∈R[B,T,D]，LayerNorm(D) 在每个 (b,t) 的 D 个特征上求均值方差，再使用长度 D 的 γ、β。统计量在每次 forward 现算，训练与推理规则相同，没有 BN 的 running statistics。Pre-LN 与 Post-LN 决定归一化位于残差分支前还是相加后；RMSNorm 只按均方根缩放，不减均值。",
    equation:
      "LN(x)=γ⊙(x−meanD(x))/√(varD(x)+ε)+β;  RMSNorm(x)=γ⊙x/√(meanD(x²)+ε)",
    mechanicsSteps: [
      "取输入 [2,3,4]：2 个句子、每句 3 个 token、每 token 4 个特征。LayerNorm(4) 产生 [2,3,1] 的均值与方差，再广播回原形状。",
      "某 token 为 [1,1,3,3]，均值 2、方差 1；忽略 ε 后归一化为 [−1,−1,1,1]。相邻 token 的值不参加这次计算。",
      "γ、β 各有 4 个元素并在 batch 与时间位置共享；它们可以恢复任务需要的特征尺度和偏移，由反向传播学习。",
      "Pre-LN 子层写成 x+F(LN(x))，残差保留一条直接路径；Post-LN 写成 LN(x+F(x))。选择会影响深层优化，不能只移动代码而期待旧 checkpoint 等价。",
      "若改为 RMSNorm，同一 [1,1,3,3] 的均方根是 √5，输出约 [0.447,0.447,1.342,1.342]；它仍有正均值，不能描述成自动中心化。",
      "训练、验证和逐 token 解码都按相同特征维计算；推理时只处理新增 token 也能得到与完整 causal forward 对应位置一致的归一化结果。",
    ],
    whenToUse: [
      "Transformer、RNN 或小 batch 任务，需要归一化结果独立于同批其他样本。",
      "排查序列模型归一化维度错误、深层残差训练不稳，或理解现代语言模型的 RMSNorm。",
    ],
    howToUse: [
      "标出 [B,T,D] 并使用 LayerNorm(D)，先在 [2,3,4] 玩具输入手算一个 token。",
      "沿用骨干模型的 Pre-LN/Post-LN、ε 与 bias 配置，加载权重时检查参数形状。",
      "保持 padding attention mask 和 loss mask；逐 token LN 不会让 padding 自动消失。",
      "训练和 eval 均复用该层，不需要估计移动均值；单独检查 dropout 等仍随模式变化的层。",
      "替换为 RMSNorm 前比较小规模重新训练结果和输出尺度，不把两种层视为 checkpoint 可无损互换。",
    ],
    tuning: [
      "先确认 normalized_shape；LayerNorm([T,D]) 会把多个时间位置一起归一化，语义与 LayerNorm(D) 不同。",
      "深层网络训练不稳时检查 residual stream 的范数和残差布局，再联合调整学习率、初始化。",
      "混合精度下近常量输入容易放大误差，可对统计量保留 FP32 并沿用稳定 ε。",
    ],
    settings: [
      {
        name: "normalized_shape",
        start: "序列输入 [B,T,D] 使用 D；参数 γβ 也为 [D]。",
        adjust: "换图像布局时检查归一化是否只跨通道，或跨全部空间与通道。",
      },
      {
        name: "ε / 精度",
        start: "从骨干配置开始，常见示例值 1e−5；统计归约优先保持数值稳定。",
        adjust:
          "若方差很小且出现非有限值，定位具体算子再比较更大 ε 或 FP32 统计。",
      },
      {
        name: "残差位置 / norm 类型",
        start: "复现已有模型时完整保留 Pre-LN、Post-LN 或 RMSNorm。",
        adjust:
          "训练新模型可比较布局，但同时重调学习率和最终输出 normalization。",
      },
    ],
    modifications: [
      "RMSNorm 去掉减均值和常见实现中的 β，减少统计工作，但改变表达形式。",
      "视觉小 batch 可比较 GroupNorm；其分组通道与空间统计并不等于逐 token LayerNorm。",
    ],
    limits: [
      "归一化轴选错会混合时间或空间信息；LayerNorm 这个名字本身不能说明具体归约维度。",
      "独立于 batch 不代表能消除分布偏移、解决全部梯度问题或保证任意深度稳定训练。",
    ],
    pitfalls: [
      "在 [B,T,D] 上对 B 求均值，以为实现了 LN，实际引入了跨样本依赖。",
      "把 LN 输出的整体均值检查为 0 来断言实现正确；可学习 γβ 会改变最终统计量。",
    ],
    example:
      "聊天请求长度分别为 3 和 100 个 token，动态 batching 会不断变化。逐 token LN 的标尺由各自 D 维特征决定，不需要因 batch 大小变化重新估计运行统计量。",
    compareTo: ["batch-normalization", "transformer", "mixed-precision"],
  },
  {
    id: "learning-rate-schedules",
    source: {
      label: "PyTorch: CosineAnnealingLR",
      url: "https://docs.pytorch.org/docs/stable/generated/torch.optim.lr_scheduler.CosineAnnealingLR.html",
    },
    title: "学习率日程：什么时候迈大步",
    englishTitle: "Learning Rate Schedules & Warmup",
    category: "training",
    level: "进阶",
    duration: "10 分钟",
    icon: "↘",
    summary:
      "把学习率变成随优化器更新次数变化的函数：先平稳进入训练，再逐步减小步幅。",
    intuition:
      "同一条山路开始时需要摸清方向，中途可以走快，接近谷底时要缩小步子。Scheduler 规定每一步的尺度，optimizer 决定怎样组合梯度；两者共同决定真实更新。",
    core: "Warmup 从小学习率升到峰值，随后可用 constant、linear 或 cosine decay。计数单位必须明确是 optimizer update 还是 epoch，梯度累积会改变两者关系。CosineAnnealingLR 本身不包含 warmup，也不自动执行 warm restarts；ReduceLROnPlateau 则由验证指标驱动。",
    equation:
      "warmup: ηt=ηpeak·t/W;  decay: ηt=ηmin+(ηpeak−ηmin)[1+cos(π(t−W)/(T−W))]/2",
    mechanicsSteps: [
      "先确定训练预算 T 是有效 optimizer 更新数。例：每 epoch 400 个 micro-batch，累积 4 次更新一次，10 epochs 共 T=1000 次更新。",
      "选 warmup W=100、峰值 0.001、最低值 0.00001。约定 t=0 为日程起点，则第 50 个 warmup 位置学习率 0.0005，第 100 个到峰值。",
      "余下 900 次按余弦下降；t=550 为衰减段中点，学习率是 (0.001+0.00001)/2=0.000505，t=1000 到最低值。",
      "一次更新中先 forward/backward，再 optimizer.step()；通常随后 scheduler.step() 为下一次更新设置学习率。记录实际 lr，核对框架初始索引与自己的 t 定义。",
      "如果累积 4 个 micro-batch，只在 optimizer 实际更新后推进一次日程；AMP 跳过非有限梯度更新时，也应避免无条件消耗计划中的有效更新。",
      "验证不做梯度更新，也不推进按 step 的日程。断点恢复需一起恢复模型、optimizer、scheduler 和更新计数，否则 lr 会突然跳回起点。",
    ],
    whenToUse: [
      "大模型训练或预训练微调中，开头易发散、后期 loss 震荡，需要控制不同阶段的更新尺度。",
      "比较不同 batch、累积次数或训练时长，确保实际学习率曲线仍表达同一个实验。",
    ],
    howToUse: [
      "先用固定小学习率验证数据、loss 和梯度，再引入 schedule，避免把程序错误当日程问题。",
      "在训练前画完整 lr 对 optimizer step 曲线，标出 warmup 终点和计划停止点。",
      "把峰值 lr 与 optimizer、有效 batch、初始化方式一起调；保留每个参数组的实际 lr 日志。",
      "从 warmup 加 cosine 或 linear decay 的简单基线开始，保持总训练 token 数一致再比较策略。",
      "恢复训练后检查前几步 lr 与中断前连续；改变总预算时重新定义剩余曲线并记录变更。",
    ],
    tuning: [
      "起步 loss 急升时，先查峰值 lr 与 warmup 长度；延长 warmup 不能拯救始终过大的峰值。",
      "训练后期仍明显下降可延长预算或提高终点 lr；验证开始恶化时检查过拟合，不能只延长训练。",
      "有效 batch 变化时不要盲用线性 lr 缩放规则；用短试验比较 loss、梯度范数与验证性能。",
    ],
    settings: [
      {
        name: "peak learning rate",
        start: "以所用模型训练配方为中心，做小规模对数扫描。",
        adjust:
          "出现连续震荡或发散时降低峰值；稳定但停滞时结合梯度和预算判断是否提高。",
      },
      {
        name: "warmup updates W",
        start: "教学实验可先取总更新的 5%–10%，作为待验证假设。",
        adjust: "只在起步阶段不稳时延长；预算短而升温占比太大时缩短。",
      },
      {
        name: "T / 最低学习率",
        start: "T 用实际更新数，ηmin 明确为 0 或峰值的小比例。",
        adjust:
          "改累积或总 token 预算后重算 T；计划提前结束时检查是否真正到达衰减区。",
      },
    ],
    modifications: [
      "验证指标停滞时可用 ReduceLROnPlateau；需设定指标方向、patience 与验证频率。",
      "需要反复探索时比较 cosine warm restarts；重启的是学习率，不默认重置模型参数或 optimizer 状态。",
    ],
    limits: [
      "调度只改变步幅，不能修复错误标签、泄漏、不可学习目标或错误梯度。",
      "相同日程在不同总 token 数、有效 batch 和 optimizer 下不代表相同训练过程。",
    ],
    pitfalls: [
      "每个 micro-batch 调 scheduler，导致累积 4 次时学习率衰减快 4 倍。",
      "只恢复权重而不恢复日程和 Adam 状态，随后把性能变化归因于模型本身。",
      "把 cosine decay 等同于带周期重启的 SGDR，造成训练后段出现意外曲线。",
    ],
    example:
      "训练 1000 次更新，前 100 次 warmup，剩余做余弦衰减。把累积从 4 改为 8 后，若数据遍数不变只剩 500 次更新，应重新决定日程与比较预算。",
    compareTo: ["gradient-descent", "adamw", "gradient-clipping"],
  },
  {
    id: "gradient-clipping",
    source: {
      label: "PyTorch: clip_grad_norm_",
      url: "https://docs.pytorch.org/docs/stable/generated/torch.nn.utils.clip_grad_norm_.html",
    },
    title: "梯度裁剪：限制一次更新前的冲击",
    englishTitle: "Gradient Clipping",
    category: "training",
    level: "进阶",
    duration: "9 分钟",
    icon: "⊣",
    summary:
      "在 backward 之后限制梯度范数，压住偶发尖峰；正确顺序是累积、反缩放、裁剪、更新。",
    intuition:
      "梯度像一根指向下降方向的箭头。全局范数裁剪只在箭头过长时按同一比例缩短它，保留方向；逐元素裁剪则会把各坐标单独截断，可能改变方向。",
    core: "Global norm clipping 将所有参数梯度视为一个长向量 g，超过阈值 c 时乘 c/‖g‖。它作用于 optimizer 看到的梯度，不直接约束 Adam 的最终参数更新范数，也不能把 NaN 或 Inf 变为可靠梯度。训练中有用，普通推理没有 backward，因此不需要裁剪。",
    equation: "g′ = g·min(1,c/(‖g‖₂+ε));  若 g=[3,4], c=2，则 g′=[1.2,1.6]",
    mechanicsSteps: [
      "对一个有效 batch 计算 loss 并 backward，收集所有需要更新参数的 .grad；不同张量在概念上展平成一个长向量，不必实际拼接。",
      "若使用梯度累积，先完成全部 micro-batch 的梯度求和或平均。各次单独裁剪后再相加一般不等于先相加再裁剪。",
      "FP16 GradScaler 产生放大后的梯度，先 scaler.unscale_(optimizer)。例如真实 g=[3,4]、scale=1024，必须先从 [3072,4096] 还原，才能按真实阈值裁剪。",
      "计算全局 L2 范数：√(3²+4²)=5。阈值 c=2 时统一乘 2/5，得到 [1.2,1.6]；若范数只有 1，则保持原梯度。",
      "调用 optimizer 更新参数；SGD 无动量时更新为 −ηg′，Adam 还会经过历史矩估计和预条件缩放，因此 c 不是参数位移的硬上界。",
      "记录裁剪前范数、触发比例和非有限值。大多数 step 都被强烈缩小时，要检查学习率、loss 归约、异常 batch 与阈值，而不是只看 loss 是否停止爆炸。",
    ],
    whenToUse: [
      "RNN 长序列、深层 Transformer 或偶发困难 batch 产生极大梯度。",
      "已验证模型和 loss 正常，仍需限制训练中的梯度尖峰并提高稳定性。",
    ],
    howToUse: [
      "先在一段正常训练记录未裁剪范数分布，结合已有训练配方选择候选阈值。",
      "在 backward 后、optimizer.step 前调用 clip_grad_norm_，覆盖实际由该 optimizer 管理的全部参数。",
      "AMP 下先 unscale；累积完成后每次 optimizer 更新只裁剪一次。",
      "设置非有限值检查并定位首个出现异常的层或 batch；裁剪不是替换 Inf/NaN 的修复方法。",
      "分布式参数分片训练使用框架提供的全局裁剪接口，确保范数包含所有 shard。",
    ],
    tuning: [
      "可比较 c=0.5、1、5 等示例值，但其意义取决于 loss 平均方式、模型和梯度尺度。",
      "阈值太低会长期压缩正常梯度；同时看触发比例、训练速度和验证表现。",
      "如果尖峰持续出现，先减少学习率、核对序列长度与损失归一化，再决定是否加强裁剪。",
    ],
    settings: [
      {
        name: "max_norm c",
        start: "沿用模型配方或根据正常范数分布试少量候选。",
        adjust: "频繁强裁剪且收敛慢时适当提高；少数尖峰破坏训练时适当降低。",
      },
      {
        name: "norm_type / 范数",
        start: "先用 global L2，明确范围包含哪些参数。",
        adjust:
          "有意使用逐层或逐元素裁剪时单独比较，因为它们会改变各层相对更新。",
      },
      {
        name: "执行时点 / AMP",
        start: "全部梯度累积→unscale→clip→step。",
        adjust:
          "改多 optimizer 或分片策略时，分别核对梯度归属、同步与反缩放次数。",
      },
    ],
    modifications: [
      "Value clipping 把每个分量截到 [−c,c]；对 [3,4] 且 c=2 得 [2,2]，方向与 global norm clipping 不同。",
      "Adaptive gradient clipping 根据参数尺度限制梯度；需要明确每个单元或层的分组方式，重新验证收益。",
    ],
    limits: [
      "裁剪会改变梯度估计，过强会拖慢或妨碍学习；它不能保证目标函数单调下降。",
      "Inf/NaN、错误 loss 尺度和太大学习率的根因仍需单独修复。",
    ],
    pitfalls: [
      "裁剪 scaled gradients，随后 unscale，使实际阈值被缩小成 c/scale。",
      "每层分别裁到 c 后宣称全局范数≤c；多个层合起来仍可能超过 c。",
      "把裁剪前返回的 norm 当成裁剪失败，因为许多 API 返回的就是修改前范数。",
    ],
    example:
      "一次语言模型更新的 norm 从平时 0.8 跳到 20，c=1 会把这次所有梯度乘 0.05。若每次都是 20，则先查 loss 是否从 mean 改成 sum。",
    compareTo: [
      "backpropagation",
      "mixed-precision",
      "learning-rate-schedules",
    ],
  },
  {
    id: "mixed-precision",
    source: {
      label: "PyTorch: Automatic Mixed Precision examples",
      url: "https://docs.pytorch.org/docs/stable/notes/amp_examples.html",
    },
    title: "混合精度：把位数花在需要的地方",
    englishTitle: "Automatic Mixed Precision (AMP)",
    category: "training",
    level: "进阶",
    duration: "11 分钟",
    icon: "½",
    summary:
      "让适合的运算使用 FP16/BF16，关键统计保留足够精度；FP16 训练用 loss scaling 保护小梯度。",
    intuition:
      "草图可用较粗刻度快速计算，关键合计再用细刻度。混合精度给不同算子分配不同数值格式，而不是把整个训练流程一律压成 16 位。",
    core: "Autocast 按设备与算子策略选择计算 dtype。典型 AMP 保留 FP32 模型参数与优化器状态，矩阵乘法等适用运算使用 FP16/BF16，敏感归约选择更稳定精度。FP16 指数范围较窄，GradScaler 将 loss 放大后反传，再在更新前还原梯度；BF16 的指数范围更宽，通常不需要 loss scaling，但有效尾数更少。",
    equation:
      "Lscaled = s·L;  gscaled = s·∇θL;  g = gscaled/s;  finite(g) 才执行更新",
    mechanicsSteps: [
      "从 FP32 基线开始，记录固定输入的 loss 与验证指标。例：X[16,128,512] 进入 Linear 权重 [2048,512]，输出 [16,128,2048]；AMP 不改变这些形状。",
      "在 torch.autocast(device_type=..., dtype=...) 中执行 forward 与 loss。支持的矩阵乘法以低精度运行，其他算子依据 autocast 规则选精度；不需先对整个模型调用 half()。",
      "FP16 训练构建 torch.amp.GradScaler。若真实梯度约 1e−8，放大 1024 后约 1e−5，更容易在 FP16 中保留下来；这不能修复 forward 已经溢出的数。",
      "调用 scaler.scale(loss).backward()，通常把 backward 放在 autocast 区域外。梯度累积期间保持同一个 scale，并按有效 batch 的 loss 归约方式处理。",
      "更新前若要检查或裁剪梯度，先 scaler.unscale_(optimizer)；随后 scaler.step(optimizer) 检查非有限梯度，正常则更新，有问题则跳过，再 scaler.update() 调节 scale。",
      "验证和推理可在 inference_mode 与 autocast 下运行，不需要 GradScaler，因为没有反向梯度。比较任务指标和实际吞吐，确认数值格式与硬件支持匹配。",
    ],
    whenToUse: [
      "GPU 支持低精度矩阵运算，训练受显存、算力或内存带宽限制。",
      "长序列与大 batch 训练，希望减少部分激活占用，或在精度允许范围内加速推理。",
    ],
    howToUse: [
      "先确认设备支持 FP16/BF16 的实际加速路径；用稳定 FP32 小规模训练作为数值参照。",
      "把 forward 和 loss 放入 autocast；FP16 训练加 GradScaler，按官方循环处理 step 与 update。",
      "梯度累积时在所有 micro-batch 完成后再 unscale 和 clip；同一 optimizer 每次更新只 unscale 一次。",
      "保存和恢复 scaler 状态、optimizer 状态与 scheduler 更新计数，检查跳步是否影响学习率进度。",
      "报告 peak memory、每秒有效 token 数和验证质量；AMP 不保证所有模型、设备都更快或显存减半。",
    ],
    tuning: [
      "BF16 支持良好时可先试 BF16，特别是数值范围较大的预训练模型；仍需观察精度损失。",
      "频繁跳步时定位 forward 激活和梯度中第一个异常点，必要时把局部运算移到 FP32。",
      "吞吐提升后再调整 batch 或序列长度，每次保持总 token 预算与验证条件可比较。",
    ],
    settings: [
      {
        name: "dtype / device",
        start: "按硬件支持选 BF16 或 FP16，并保留 FP32 对照。",
        adjust:
          "FP16 溢出可比较 BF16 或局部 FP32；设备没有快路径时不要仅凭位宽判断收益。",
      },
      {
        name: "GradScaler",
        start: "FP16 使用动态 loss scaling；BF16 一般不需开启。",
        adjust:
          "持续跳步时查非有限值和数据；调 scale 不能扩大 FP16 的 forward 表示范围。",
      },
      {
        name: "高精度算子 / accumulation",
        start: "先沿用 autocast 规则，重要统计与自定义归约核对精度。",
        adjust:
          "局部数值不稳时禁用该段 autocast 并显式转 FP32，确认稳定后再衡量速度。",
      },
    ],
    modifications: [
      "Activation checkpointing 用重算换显存，可与 AMP 组合，但吞吐收益需要重新测量。",
      "推理量化到 INT8/INT4 是另一类表示与校准方案，不能直接复用 AMP 的数值假设。",
    ],
    limits: [
      "低精度会引入舍入误差；对微小差值、极端动态范围或敏感科学计算需要专门验证。",
      "典型 AMP 仍保留 FP32 参数、梯度和优化器状态，实际显存节省依赖激活占比。",
    ],
    pitfalls: [
      "误以为 loss scaling 等于提高学习率；正确 unscale 后期望梯度尺度恢复原值。",
      "在 unscale 前做 clipping，或在不同累积 micro-batch 中途改变 scale。",
      "无条件 scheduler.step()，忽略 scaler 可能跳过 optimizer 更新，导致日程和权重更新不同步。",
    ],
    example:
      "同一 [16,128,512] 输入用 FP32 与 BF16 跑 100 次有效更新，对比 loss 走势与验证准确率。若显存下降但吞吐不升，检查是否数据加载或小算子开销占主导。",
    compareTo: ["gradient-clipping", "adamw", "kv-cache"],
  },
  {
    id: "tokenization",
    source: {
      label: "Hugging Face: Tokenization algorithms",
      url: "https://huggingface.co/docs/transformers/main/en/tokenizer_summary",
    },
    title: "Tokenization：文字怎样变成模型的单位",
    englishTitle: "Tokenization, BPE & Subwords",
    category: "sequence",
    level: "入门",
    duration: "11 分钟",
    icon: "▤",
    summary:
      "先把字符串变成稳定的 token ID，再查 embedding；词表、切分规则和特殊标记都是模型接口的一部分。",
    intuition:
      "模型不是逐个读自然语言里的词，而是在读约定好的积木编号。常见片段可成为一块积木，罕见词拆成几块；积木切得细，序列更长，切得粗，词表和输出层更大。",
    core: "Tokenizer 包含规范化、预切分、子词算法、特殊 token 和 ID 映射。BPE 从较小单位开始，按语料中的相邻频率学习合并顺序；编码新文本时应用已固定的规则。WordPiece 与 Unigram 使用不同学习或分段准则，SentencePiece 是支持多种算法的工具框架。Tokenizer 训练与语言模型权重训练是不同阶段。",
    equation: "text → token strings → ids[B,T] → E[ids]∈R[B,T,D];  E∈R[V,D]",
    mechanicsSteps: [
      "构造教学语料：'low' 出现 3 次、'lower' 2 次、'new' 1 次。若初始按字符且只在词内合并，(l,o) 与 (o,w) 各出现 5 次；用固定 tie-break 先合成 'lo'，再把 ('lo','w') 合成 'low'。",
      "继续按设定词表大小或合并次数训练，保存 merge rank。这个玩具词表可将 'lower' 切为 ['low','e','r']；真实结果取决于所用 tokenizer，不能假定同一字符串在各模型中切法一致。",
      "为 token 分配 ID，例如 ['low','e','r']→[17,5,9]。ID 只是索引，17 不表示比 5 更积极、更大或更相似。",
      "打包两条长度 3 和 2 的序列到 [B,T]=[2,3]，同时生成 attention mask；padding 的位置不应成为有效监督目标，常把对应 labels 设为 loss 的 ignore index。",
      "若词表 V=32000、隐藏维 D=512，embedding 表为 [32000,512]；查表把 [2,3] ID 变成 [2,3,512]。生成 head 输出 [2,3,32000] 的 token logits。",
      "自回归训练让位置 t 预测下一个 token；推理用完全相同的 tokenizer 和 chat template 编码提示，生成 ID 后再 decode，按配置处理 BOS、EOS 与其他特殊标记。",
    ],
    whenToUse: [
      "准备语言模型训练数据，或排查奇怪空格、未知字符、输入被截断和聊天模板不一致。",
      "比较中文、英文、代码等数据的 token 长度、上下文成本和词表覆盖。",
    ],
    howToUse: [
      "预训练模型优先加载其配套 tokenizer、revision 和 chat template，保存这些配置与权重的版本关联。",
      "在中文、英文、数字、换行、emoji 和领域术语上打印 token/ID/decoded text，检查规范化与 round trip。",
      "按 token 数决定截断和 batch packing，显式记录 BOS/EOS、padding side、attention mask 与 loss mask。",
      "新训练 tokenizer 时只用约定的训练语料拟合规则，并报告不同语言和领域的 tokens/字符比例。",
      "添加特殊 token 后同步调整 embedding 与输出层大小，并训练新行；改变词表 ID 映射后不能直接沿用原权重解释。",
    ],
    tuning: [
      "词表变大通常能缩短部分序列，但 embedding/output 参数随 V×D 增长，需同时测序列长度与模型成本。",
      "规范化如 lowercasing 或 Unicode 转换可能损失任务需要的大小写与原始格式；代码、标识符任务应单独验证。",
      "中文或低资源语言若被切得很碎，相同上下文 token 上限可容纳的实际文字更少，应按语言切片评估。",
    ],
    settings: [
      {
        name: "vocabulary / 算法",
        start: "已有模型固定配套 tokenizer；从零训练时比较少量词表规模。",
        adjust:
          "序列膨胀明显时检查训练语料覆盖与切分规则，而不只增加 max_length。",
      },
      {
        name: "special tokens / template",
        start: "明确 BOS、EOS、PAD、角色标记及 chat template 的插入方式。",
        adjust:
          "重复开始标记、角色混乱或生成不停止时检查是否被两层代码重复添加。",
      },
      {
        name: "padding / truncation",
        start: "依据模型和生成 API 选 padding side，并保留完整 mask。",
        adjust:
          "decoder 批量生成时核对最后有效位置；长文截断需保证答案证据仍在上下文中。",
      },
    ],
    modifications: [
      "Byte-level BPE 可覆盖任意字节序列，降低未知词问题，但一个可见字符可能拆成多个 token。",
      "Unigram 在候选片段词表上定义概率并寻找分段；subword regularization 可在训练时采样分段，但评估需固定协议。",
    ],
    limits: [
      "Token 边界不是语义边界，同一个词内部的拼写、计数或数值运算仍可能困难。",
      "token 级 perplexity 受切分单位影响，不宜直接拿不同 tokenizer 的数值作语言能力排名。",
    ],
    pitfalls: [
      "把字符数当 token 数，导致上下文超限或截断位置与预期不同。",
      "单独复制 tokenizer 文件却漏掉新增 special tokens 或聊天模板，输入 ID 语义随之改变。",
      "只遮住 padding 的 attention，却把 PAD 继续计入训练 loss，模型会学会输出填充标记。",
    ],
    example:
      "两句话字符数相近，但代码标识符可能拆出更多 token。先用目标模型 tokenizer 统计真实长度，再设 max_length 和 packing，才能判断显存与上下文是否够用。",
    compareTo: ["word2vec", "gpt-language-model", "language-model-evaluation"],
  },
  {
    id: "positional-encoding",
    source: {
      label: "Su et al., RoFormer / Rotary Position Embedding",
      url: "https://arxiv.org/abs/2104.09864",
    },
    title: "位置编码：让注意力知道先后远近",
    englishTitle: "Positional Encoding & RoPE",
    category: "sequence",
    level: "进阶",
    duration: "12 分钟",
    icon: "↔",
    summary:
      "向 token 表示或注意力分数注入位置信息；RoPE 旋转 Q、K，让点积包含相对位置。",
    intuition:
      "只看词的内容，很难区分谁在前谁在后。位置编码给每个位置一个坐标；RoPE 像把 Q 与 K 的二维小箭头按所在位置旋转，两箭头的夹角便包含它们相隔多远。",
    core: "没有位置机制和顺序约束的 self-attention 对输入排列具有置换等变性。绝对位置编码把向量加到 embedding，relative bias 直接改 attention score；RoPE 将每个 head 的 Q、K 按二维对旋转，使 qᵢᵀRⱼ₋ᵢkⱼ 依赖相对位移。Causal mask 限制可见位置，与位置编码承担不同职责；RoPE 不等于无限长上下文保证。",
    equation: "R(φ)[a,b]=[a cosφ−b sinφ, a sinφ+b cosφ];  (Rᵢq)ᵀ(Rⱼk)=qᵀRⱼ₋ᵢk",
    mechanicsSteps: [
      "对 X[B,T,D]=[2,8,32] 做 Q、K 投影，分成 H=4 个 head，得到 [2,4,8,8]，其中 head_dim=8。每个 head 的特征按实现约定分成 4 对。",
      "为第 j 个二维对设频率 ωj，例如经典 RoPE 形式 ωj=base^(−2j/dhead)，位置 p 对应角度 pωj；不同对使用不同频率以表示不同尺度。",
      "对 Q 和 K 分别应用同一套位置旋转，V 通常不旋转。教学例只看一对 [1,0]，在角度 π/2 处变为 [0,1]，在 π 处变为 [−1,0]。",
      "计算旋转后的 QKᵀ/√dhead。若原始 q=k=[1,0]，两个位置角度差 π/2，点积由同位时的 1 变为 0；这里只是单个二维对的演示。",
      "加入 causal/padding mask，再 softmax 并对 V 加权。位置旋转改变相似度，但不会自动阻止未来 token 进入 attention。",
      "带 KV cache 解码时，新增 token 的 position 必须接续已有前缀；缓存通常保存已按正确位置旋转的 K，不能在每步把新 token 的位置都重设为 0。",
      "训练与推理使用兼容的 base、旋转配对顺序和 position IDs。需要扩展上下文时，通过相应位置缩放方案与长上下文验证检查检索、理解和困惑度。",
    ],
    whenToUse: [
      "Transformer 的词序、时间序列或图像 patch 位置对预测有意义。",
      "理解长上下文退化、KV cache 位置错位，以及不同 checkpoint 的 RoPE 配置。",
    ],
    howToUse: [
      "先区分 absolute embedding、sinusoidal、relative bias 和 RoPE，再沿用目标架构实现。",
      "用极小 [B,H,T,dhead] 张量验证旋转前后范数相同，并检查相同相对位移的点积关系。",
      "核对 token 的实际 position IDs，尤其是左 padding、packed sequences、截断与 cache 续接。",
      "保存 base、rotary dimension、配对布局和 scaling 配置；转换 checkpoint 时完整对齐这些约定。",
      "扩长上下文时建立不同距离的证据检索与理解样例，并重新测短上下文性能。",
    ],
    tuning: [
      "RoPE base 控制各维旋转频率；改变它会改变模型看到的位置几何，需配合训练或经过验证的扩展方案。",
      "若只旋转部分 head 维度，明确 rotary dimension 必须适配二维配对，保留其余维的处理方式。",
      "先在训练范围内验证实现，再测试更长序列；短序列正常并不能证明长距离外推可靠。",
    ],
    settings: [
      {
        name: "position IDs",
        start: "按有效 token 的位置与模型约定生成，并与 cache 状态同步。",
        adjust:
          "批量和单条结果差异大时检查 padding、续接偏移与 packed document 边界。",
      },
      {
        name: "RoPE base / 配对布局",
        start:
          "严格复用 checkpoint 配置；二维相邻配对与半区配对需对应权重约定。",
        adjust:
          "做长上下文扩展时使用可复现的 scaling 配置，避免只改一个常数后直接部署。",
      },
      {
        name: "context length",
        start: "先在训练支持范围内建立长度分组评估。",
        adjust:
          "扩长后检查远处证据、相似干扰和多跳任务，不能只测输入是否能运行。",
      },
    ],
    modifications: [
      "Learned absolute embeddings 学每个位置的向量；sinusoidal 用固定多频正余弦，两者通常加在 token embedding 上。",
      "ALiBi 等 relative bias 在 attention score 上按距离加偏置；二维图像可按行列分别设计位置机制。",
    ],
    limits: [
      "位置编码不能单独替代 attention mask、文档边界规则或 padding 处理。",
      "能计算更长位置的三角函数，不代表模型在未训练的距离上仍能正确理解。",
    ],
    pitfalls: [
      "只旋转 Q 不旋转 K，或用不同旋转配对顺序加载已有权重。",
      "生成每一步都用 position 0，cache 形状虽正确，位置相似度已经错误。",
      "把 RoPE 等价关系误解为所有距离更远的 token 分数必然更低；内容和多个频率共同影响点积。",
    ],
    example:
      "提示有 128 个有效 token，下一 token 应按模型约定使用接续位置 128，而不是长度为 1 的新输入位置 0。修复该偏移后，再比较缓存与完整重算的 logits。",
    compareTo: ["attention", "transformer", "kv-cache"],
  },
  {
    id: "autoregressive-inference",
    source: {
      label: "Hugging Face: Generation strategies",
      url: "https://huggingface.co/docs/transformers/main/en/generation_strategies",
    },
    title: "自回归解码：每次只决定下一个 token",
    englishTitle: "Autoregressive Inference & Sampling",
    category: "sequence",
    level: "进阶",
    duration: "12 分钟",
    icon: "▷",
    summary:
      "先处理提示，再循环预测、选择、追加 token；温度和采样改变选择规则，不改变已学到的权重。",
    intuition:
      "接龙时每次只能根据已经写出的内容继续写一个单位。模型给出下一块积木的候选概率，解码器决定取最大项还是抽样，再把结果交回模型继续。",
    core: "自回归分解 p(x₁:T)=∏t p(xt|x<t)。训练可用 teacher forcing 与 causal mask 同时计算多个位置的 next-token loss；实际生成时下一步依赖刚选出的 token，通常顺序进行。推理分 prefill 和 decode：prefill 处理完整提示，decode 逐 token 前进并可复用 KV cache。",
    equation:
      "pt=softmax(logitst/τ);  xt∼Filter(pt);  p(sequence)=∏t p(xt|x<t)",
    mechanicsSteps: [
      "用配套 tokenizer 和 chat template 编码提示，形成 ids[B,T]=[1,4]，同时创建 attention mask；确认剩余 context budget 能容纳计划生成长度。",
      "prefill 产生 logits[1,4,V] 与各层 KV cache。取最后一个有效提示位置的 [V] logits 作为下一个 token 的分布，不是把 4 个位置各抽一次接到结尾。",
      "若玩具词表有 3 个候选，logits=[2,1,0]，τ=1 时 softmax≈[0.665,0.245,0.090]；τ=0.5 变为≈[0.867,0.117,0.016]，分布更集中。",
      "Greedy 选概率最大者；top-k 只保留前 k 项；top-p 取按概率降序累计达到阈值的最小集合。例如上例 p=0.8 保留前两项后重新归一化再抽样。",
      "把选出的 token 追加到序列，下一次通常只输入该新 token 和过去 cache。模型产生新的 next-token logits，重复选择；已生成的错误可能成为后续条件。",
      "遇 EOS、约定停止串或 max_new_tokens 后结束；停止串可能跨多个 token，需按生成框架规则判断。每个 batch 请求可以在不同时间结束。",
      "统计 time to first token、每个后续 token 的延迟、总输出长度和质量。缓存与批处理可提高效率，但顺序依赖仍限制单请求生成速度。",
    ],
    whenToUse: [
      "部署 decoder 语言模型、调聊天输出风格、结构化生成或分析为什么相同提示产生不同答案。",
      "比较延迟、生成长度和质量，区分模型能力与采样策略造成的差异。",
    ],
    howToUse: [
      "先使用正确模板、固定提示与 greedy decoding 建立可复现基线。",
      "按任务设置 max_new_tokens、EOS/stop 和 context budget；不要只限制输入长度。",
      "需要多样性时开启 sampling，再单独调温度与 top-p，保存随机种子及全部生成配置。",
      "批量 decoder 推理核对 padding side、mask 和最后有效位置；已结束请求应停止继续计费式计算或正确标记。",
      "用任务指标验证生成结果，结构化任务加输出格式检查；降低温度不能保证事实正确。",
    ],
    tuning: [
      "τ 较低更集中，较高更多样但可能不连贯；τ=0 不应直接代入除法，使用框架的 greedy 模式。",
      "top-p 随分布尖锐程度改变候选数，top-k 固定数量；同时开启时需理解实现的过滤顺序。",
      "重复惩罚或长度惩罚会改变输出分布；先检查模板、EOS 和任务要求，再针对真实失败调节。",
    ],
    settings: [
      {
        name: "greedy / sampling",
        start: "评估确定性短答案可从 do_sample=false 开始。",
        adjust:
          "创作或多候选搜索时开启 sampling，以多个随机种子的结果判断质量。",
      },
      {
        name: "temperature / top-p",
        start: "教学对照先固定 τ=1，再比较 τ=0.7、top-p=0.9 等候选。",
        adjust:
          "输出太随机可降低温度或收紧候选；过于重复时也检查提示和训练分布。",
      },
      {
        name: "max_new_tokens / stop",
        start: "为答案预留明确预算，使用模型规定的 EOS。",
        adjust:
          "输出常被截断时加预算并检查是否遗漏停止标记；过长时用任务相关停止条件。",
      },
    ],
    modifications: [
      "Beam search 同时保留多个高分前缀，可用于翻译等任务；并不保证最终文本更真实或更适合开放聊天。",
      "Speculative decoding 用草稿模型提候选、目标模型验证，在满足相应接受规则时可保持目标采样分布。",
    ],
    limits: [
      "生成错误会进入后续上下文；teacher forcing 训练的低 loss 不保证长文本自由生成稳定。",
      "采样配置不能给模型补充缺失知识；事实性任务需要数据、检索或外部核验支持。",
    ],
    pitfalls: [
      "把低温度或 greedy 输出当作真实答案，忽略模型可能很确定地生成错误内容。",
      "用总 max_length 误当新增 token 上限，导致不同提示长度得到不同输出预算。",
      "比较模型时使用不同 chat template、候选数或输出长度，混淆解码预算和模型效果。",
    ],
    example:
      "同一提示先用 greedy 输出一份短答案，再在 τ=0.8、top-p=0.9 下采样 5 份候选。报告任务成功率与平均 token 成本，不能只展示最漂亮的一次。",
    compareTo: ["gpt-language-model", "kv-cache", "language-model-evaluation"],
  },
  {
    id: "kv-cache",
    source: {
      label: "Hugging Face: How caching works",
      url: "https://huggingface.co/docs/transformers/main/en/cache_explanation",
    },
    title: "KV Cache：记住前缀算过的键和值",
    englishTitle: "Key–Value Cache",
    category: "sequence",
    level: "进阶",
    duration: "12 分钟",
    icon: "▣",
    summary:
      "因果解码中旧 token 的 K、V 不再变化，逐层缓存它们以节省重复计算，但显存随上下文与并发增长。",
    intuition:
      "每写一个新词，不必把前面每个词的资料卡重新制作一遍。缓存保留旧 token 的 key 与 value，新 query 仍要查阅这些卡片，所以省了重算，并没有免除读历史的成本。",
    core: "在固定模型、固定前缀、causal attention 下，历史 token 的隐藏状态不受未来 token 影响，故各层 K/V 可复用。Prefill 写入全部提示的 cache，decode 仅算新 token 的 Q/K/V 并追加 K/V。训练通常并行处理整段且需要反向图，不按普通生成方式复用跨更新的 cache。",
    equation:
      "Kcache←concat(Kcache,kt);  Vcache←concat(Vcache,vt);  ot=softmax(qtKcacheᵀ/√d+mask)Vcache;  bytes≈2LBTHkvds",
    mechanicsSteps: [
      "设 L=32 层、B=1、Hkv=8、head_dim d=128。对 4096-token 提示执行 prefill，每层 K、V 的概念形状各为 [1,8,4096,128]。",
      "第一个生成 token 由提示末位置的 logits 选出。下一次 forward 只输入这个 token；每层计算新 K/V [1,8,1,128] 并追加，缓存长度变为 4097。",
      "新 Q 的形状为 [1,Hq,1,128]，与历史和当前 K 做匹配，score 为 [1,Hq,1,4097]。即便复用 cache，每一步仍需对允许可见的历史做注意力。",
      "用正确的 position IDs 旋转新 Q/K，mask 的 key 长度要覆盖 past+current。先有 cache 但只传长度 1 的错误 mask，会产生维度错误或错误可见范围。",
      "缓存占用近似 2×L×B×T×Hkv×d×s 字节，2 来自 K 和 V。上述配置、T=4096、s=2 字节时为 536870912 字节，即 512 MiB；不含权重、临时激活、分配余量。",
      "将完整重算与缓存解码的同位置 logits 在 eval 模式下比较，应在数值容差内一致。不同 kernel 和舍入可能带来微小差异，采样轨迹也可能因此分叉。",
      "请求结束时释放或回收 cache；跨请求复用前缀需匹配模型、精确 token 前缀、位置与适配器状态，不能只因为可见文字相似就共享。",
    ],
    whenToUse: [
      "自回归生成多个 token，重复处理历史前缀成为主要开销。",
      "设计长上下文服务、并发容量、前缀复用，或排查首 token 快而后续解码显存暴涨。",
    ],
    howToUse: [
      "优先使用模型框架支持的 use_cache 和 cache 类型，先运行短序列正确性对照。",
      "测量 prefill 延迟和 decode token/s，分别记录提示长度、输出长度与 batch。",
      "用公式估计请求的 KV 预算，为输出增长和临时算子保留空间，再设置最大并发。",
      "手写循环时仅传未缓存 token，维护 attention mask、cache position 和停止状态的一致性。",
      "每次切换模型权重、LoRA adapter 或前缀内容都重新确认缓存有效性；验证多轮续写边界。",
    ],
    tuning: [
      "并发 B、长度 T、KV head 数和 dtype 都近似线性影响 KV 占用，优先找到实际受限项。",
      "Dynamic cache 按需增长易用；static cache 预留容量利于固定形状执行，但可能浪费未用槽位。",
      "CPU offload 或 cache quantization 可节省 GPU 显存，需同时测数据传输、精度和 decode 延迟。",
    ],
    settings: [
      {
        name: "cache implementation",
        start: "先用模型支持的默认动态缓存验证结果。",
        adjust: "编译或固定容量服务可比较静态缓存；显存碎片多时评估分页管理。",
      },
      {
        name: "maximum sequence / concurrency",
        start: "按 2LBTHkvds 估算并预留额外显存。",
        adjust: "长请求出现 OOM 时限制总在途 token 数，而不只限制请求数量。",
      },
      {
        name: "KV dtype / offload",
        start: "与模型稳定的推理精度匹配，例如 BF16 的 s=2。",
        adjust: "显存不足再比较量化或卸载；用长上下文质量与实际延迟选择。",
      },
    ],
    modifications: [
      "Paged KV 管理以块分配缓存，改善可变长度服务的显存利用；它主要改变存储管理。",
      "GQA/MQA 减少 Hkv，从模型结构上缩小缓存；滑动窗口限制可见历史，需要对应模型或明确接受语义变化。",
    ],
    limits: [
      "缓存使内存随上下文和并发增长，长上下文 decode 还可能受历史 K/V 读取带宽限制。",
      "双向 attention 中新 token 可改变旧状态，不能直接套用同样的逐 token 缓存复用假设。",
    ],
    pitfalls: [
      "忘记 K、V 各一份，或忘记乘层数，把实际显存需求低估数十倍。",
      "把整个前缀再次送入已有 cache，导致 token 重复、position 偏移和长度膨胀。",
      "认为 cache 让所有历史 attention 成为常数成本；全局 attention 的单步历史读取仍随 T 增长。",
    ],
    example:
      "32 层、8 KV heads、128 head_dim、4096 长度的 BF16 单请求缓存约 512 MiB；同时 8 个同长度请求约 4 GiB。若改成 32 KV heads，相同条件约需 16 GiB。",
    compareTo: [
      "autoregressive-inference",
      "grouped-query-attention",
      "positional-encoding",
    ],
  },
  {
    id: "grouped-query-attention",
    source: {
      label: "Ainslie et al., GQA (EMNLP 2023)",
      url: "https://arxiv.org/abs/2305.13245",
    },
    title: "GQA：多组 query 共享键和值",
    englishTitle: "Grouped-Query Attention (GQA)",
    category: "sequence",
    level: "高级",
    duration: "11 分钟",
    icon: "⋈",
    summary:
      "保持较多 query heads，让每组共享一个 KV head，在解码显存、带宽和模型表达能力之间做取舍。",
    intuition:
      "8 位读者可以提出不同问题，但不必各复制一套资料。把读者分成 2 组，每组共用 key/value 资料，而每位读者保留自己的 query 和注意力权重。",
    core: "标准 MHA 有 Hq=Hkv；MQA 只有 Hkv=1；GQA 让 1<Hkv<Hq，通常 Hq 能被 Hkv 整除。每个 query head 对所属 KV head 独立计算注意力。主要节省 K/V 投影与缓存、解码读取带宽；query head 数与 attention score 的数量不会按同一比例减少。",
    equation:
      "g(h)=⌊h/(Hq/Hkv)⌋;  Oh=softmax(QhKg(h)ᵀ/√d+mask)Vg(h);  KV容量比=Hkv/Hq",
    mechanicsSteps: [
      "设输入 X[2,10,512]、Hq=8、Hkv=2、d=64。Q 投影维度 8×64=512，K/V 各投影到 2×64=128。",
      "重排 Q 为 [2,8,10,64]，K/V 各为 [2,2,10,64]；每 4 个 query heads 共享一组 KV。Q heads 0–3 用 KV 0，heads 4–7 用 KV 1。",
      "每个 query head 独立算 QhKg(h)ᵀ，得到 [2,8,10,10] 的概念 attention scores，再加 mask、softmax、乘共享 V。共享 K/V 不等于共享 attention weights。",
      "各 head 输出 [2,8,10,64]，合并回 [2,10,512] 并经过 output projection；模型的 residual stream 维度仍是 512。",
      "推理每层缓存 [B,2,T,64] 的 K/V，相对 8-head MHA 只需 1/4 的 KV 元素。高效 kernel 可直接共享读取；教学实现显式 repeat 到 8 heads 可能削弱显存收益。",
      "训练时直接学习较小 K/V 投影。若从已有 MHA checkpoint 转换，原论文将组内 K/V 投影均值合并后继续训练；不能只删掉 heads 后宣称输出完全等价。",
      "用相同质量目标和实际设备比较预填充、解码延迟、KV 占用与验证 loss；缓存缩小 4 倍不意味着整模型参数、计算量或延迟也缩小 4 倍。",
    ],
    whenToUse: [
      "设计或选择面向长上下文、大并发自回归服务的语言模型。",
      "理解 num_attention_heads 与 num_key_value_heads 的区别，或分析缓存为何比普通 MHA 小。",
    ],
    howToUse: [
      "读取模型配置中的 Hq、Hkv、head_dim，并画出 query 到 KV 的分组映射。",
      "先采用已经训练好的 GQA checkpoint，确认推理框架和 attention kernel 支持该布局。",
      "从实际 max context 和并发出发计算 KV 内存，比较 MHA、GQA、MQA 的预算。",
      "若自行转换 MHA，按组聚合 K/V 权重后安排继续训练，保存转换规则和训练数据协议。",
      "分别在短文、长文和任务评估上检查质量，报告吞吐时固定设备、batch 与 token 长度。",
    ],
    tuning: [
      "Hkv 越小缓存越省，但共享约束更强；依据验证质量与硬件吞吐选择，不把 MQA 当万能终点。",
      "query head 数不变时，score tensor 的逻辑大小仍随 Hq×T² 增长；训练显存还要看 attention 实现。",
      "检查实现是否物理复制 K/V，及 tensor parallel 的 head 分配是否满足整除约束。",
    ],
    settings: [
      {
        name: "Hq / Hkv",
        start: "教学示例用 Hq=8、Hkv=2；已有模型严格按配置加载。",
        adjust: "新模型可比较 Hkv=1、2、4、8，保持其他容量与训练预算尽量一致。",
      },
      {
        name: "head_dim / projection",
        start:
          "核对 Q 输出 Hq×d、K/V 输出 Hkv×d，与 output projection 接口一致。",
        adjust: "修改 d 同时影响缓存和表示能力，不应只改 reshape 数值。",
      },
      {
        name: "kernel / KV storage",
        start: "选择支持分组 KV 的高效 attention 路径。",
        adjust:
          "实际显存未降时检查是否 repeat 到 Hq heads，以及临时张量和缓存分配。",
      },
    ],
    modifications: [
      "MQA 是 Hkv=1 的极端共享方案；MHA 是 Hkv=Hq 的无组内共享边界。",
      "与 KV quantization、分页缓存和高效 attention kernel 组合时分别测量质量和速度，收益不能简单相乘。",
    ],
    limits: [
      "减少 KV heads 是架构约束，可能降低模型质量，需要训练适配和任务评估。",
      "受算力、通信或其他算子限制的工作负载中，缓存缩小未必带来同等比例速度提升。",
    ],
    pitfalls: [
      "以为共享 KV 的 query heads 输出相同；它们的 Q 和 softmax 权重仍各自不同。",
      "把 num_key_value_heads 改小后直接加载旧权重，忽略投影形状和继续训练需求。",
      "对每组先平均 query 再计算 attention，实际已经实现了不同的模型。",
    ],
    example:
      "Hq=32、Hkv=8 的模型将每 4 个 query heads 分为一组。相同层数、长度、精度和 head_dim 下，KV cache 元素数是 32-head MHA 的 1/4，但输出仍由 32 个 query heads 组成。",
    compareTo: ["attention-heads", "kv-cache", "transformer"],
  },
  {
    id: "retrieval-augmented-generation",
    source: {
      label: "Lewis et al., Retrieval-Augmented Generation (2020)",
      url: "https://arxiv.org/abs/2005.11401",
    },
    title: "RAG：先找证据，再组织答案",
    englishTitle: "Retrieval-Augmented Generation (RAG)",
    category: "sequence",
    level: "进阶",
    duration: "13 分钟",
    icon: "⌕",
    summary:
      "把外部资料检索接到生成之前；分别检查有没有找到正确证据，以及回答是否忠于证据。",
    intuition:
      "让模型带着资料答题。资料库负责可更新的事实，检索器负责找到相关片段，生成器负责理解、组织和注明出处。找错页与读错页是不同故障，需要分别测量。",
    core: "现代常见 RAG pipeline 把 query 相关文档放进生成上下文，可在不修改生成器参数的情况下更新资料。原始 RAG 论文更具体：把检索文档作为潜变量，以检索概率对条件生成概率做边缘化，并联合训练 query encoder 与生成器。简单地拼接 top-k 文本是常用实现，但不等于原论文的全部训练算法。",
    equation:
      "检索: score(q,di)=eqᵀedi;  原始 RAG-Sequence: p(y|q)≈Σd∈top-k pη(d|q)∏t pθ(yt|q,d,y<t)",
    mechanicsSteps: [
      "离线解析资料，保留文档 ID、版本、时间、标题与访问范围；按段落语义分 chunk。示例 1000 个片段经 document encoder 得到矩阵 D[1000,384] 并建立索引。",
      "在线把问题编码为 q[1,384]，用内积或与索引匹配的相似度搜索 top-20。若使用 cosine，query 与文档向量都需按同一约定归一化。",
      "可结合关键词检索覆盖编号和专有名词；reranker 对问题与候选片段共同评分，将 20 段筛成 4 段。检索分数只是排序依据，不直接等于证据正确概率。",
      "组装带来源编号的上下文。4 段各 300 tokens 共 1200，加问题、指令和输出预留预算后检查是否超限；重复、冲突和过期段落应在组织上下文时处理。",
      "常见推理 pipeline 让生成器基于这些片段回答并引用来源，证据不足时表达不足。生成器仍可能误读或补写，因此引用 ID 必须能指向实际支持该断言的文本。",
      "原论文的 RAG-Sequence 对每篇候选文档条件下的整句概率加权求和；RAG-Token 则在每个生成位置对文档边缘化。其训练固定文档编码器与索引，优化 query encoder 和生成器。",
      "评估先计算答案证据的 Recall@k，再检查答案正确性、faithfulness 与引用准确率。把 gold evidence 直接交给生成器，可判断瓶颈在检索还是阅读/生成。",
    ],
    whenToUse: [
      "回答来自经常更新、领域专有或需要出处的资料，例如产品手册、研究资料库和内部知识库。",
      "需要把知识更新与模型权重更新分开，并能追踪回答依据的文档版本。",
    ],
    howToUse: [
      "先构建带 gold evidence 的真实问题集，包含无答案、同名实体、版本冲突与多段证据题。",
      "从简单关键词或 dense retrieval 加少量上下文开始，保留每题检索结果和最终 prompt 供错误分析。",
      "切分时尽量保留标题、表格说明和指代上下文；设置来源 ID，使答案可回溯到原文。",
      "严格按可访问资料构建检索范围，把检索文本作为证据处理，避免其中的指令改变应用行为。",
      "更新 embedding 模型时重建兼容索引；资料更新要维护删除、版本和增量同步规则。",
      "分别选择检索、重排和生成的验证指标，用端到端准确率与延迟共同确定最终配置。",
    ],
    tuning: [
      "chunk 太小可能缺上下文，太大则混入噪声；用证据召回和最终回答质量比较若干尺寸。",
      "提高 retrieval k 常能增加召回但也增加 rerank 成本；给生成器的 context k 应单独调。",
      "检索好而回答差时检查上下文顺序、冲突资料和生成指令；回答缺证据时不要只调温度。",
    ],
    settings: [
      {
        name: "chunk size / overlap",
        start: "教学基线可试 300 tokens、50-token overlap，并保留段落标题。",
        adjust:
          "表格或长定义被切断时按结构切分；大量重复上下文时减少 overlap。",
      },
      {
        name: "retrieval k / rerank k",
        start: "例如先检索 20 段、重排后交给生成器 4 段。",
        adjust:
          "Recall@20 低先改善检索；召回高但最终答案低再检查重排与证据使用。",
      },
      {
        name: "embedding / index version",
        start: "固定文档与 query 编码器、维度、相似度和索引快照。",
        adjust: "更换编码器或预处理后重建索引并重测，不能混用不兼容向量空间。",
      },
    ],
    modifications: [
      "Hybrid search 结合 dense 与 lexical retrieval，reranker 进一步判断问题和文段关系。",
      "多跳问题可拆解或迭代检索；增加检索轮次时报告额外延迟、成本和错误传播。",
      "领域检索器可用正负证据训练，生成器也可做引用或拒答微调，但二者都需要独立验证。",
    ],
    limits: [
      "资料库不存在答案、证据过期或访问范围不含所需内容时，RAG 无法凭空提供可靠依据。",
      "检索到正确证据也不能保证模型忠实回答；模型可能忽略、误读或错误引用。",
    ],
    pitfalls: [
      "只看最终正确率，无法区分检索失败和生成失败，导致一直调错组件。",
      "认为出现引用就代表断言被支持；必须核对引用文本与具体断言的对应关系。",
      "将新 embedding 模型的 query 与旧模型建立的文档索引混用，维度相同也可能完全不兼容。",
    ],
    example:
      "用户问某设备新版的温度上限。系统检索到旧版 60°C 和新版 80°C，答案必须按型号与版本筛选并引用新版段落；把两段同时塞给模型并不能保证自动解决冲突。",
    compareTo: [
      "in-context-learning",
      "language-model-evaluation",
      "contrastive-learning",
    ],
  },
  {
    id: "language-model-evaluation",
    source: {
      label: "Liang et al., Holistic Evaluation of Language Models",
      url: "https://arxiv.org/abs/2211.09110",
    },
    title: "语言模型评估：预测得好与回答得好",
    englishTitle: "Language Model Evaluation & Perplexity",
    category: "training",
    level: "进阶",
    duration: "13 分钟",
    icon: "☑",
    summary:
      "同时评估 token 概率、任务成功、证据忠实度和推理成本；固定模板与预算，才能做公平比较。",
    intuition:
      "语言模型像一位考生：填空概率、做题正确率、引用资料的准确性和完成时间是不同成绩。一张总分表可以概括结果，但不能掩盖某种语言、长文本或困难子群的失败。",
    core: "Perplexity 是平均 token 负对数似然的指数，衡量在给定真实前缀时预测下一个 token 的难度。它不是自由生成答案的正确率，且依赖 tokenizer 与上下文协议。应用评估还要固定提示模板、few-shot 示例、解码配置与工具预算，报告任务指标、子群差异和不确定性；模型裁判需要与人工评分校验。",
    equation:
      "NLL=−Σvalid log p(xt|x<t)/Nvalid;  PPL=exp(NLL);  accuracy=正确题数/总题数",
    mechanicsSteps: [
      "先定义测试任务和样本单位，例如文档级问答；按实体、时间或来源划分训练/验证/测试，尽量去除重复与已知污染，测试集不用于调提示。",
      "算概率指标时使用 eval 与无梯度模式。ids[B,T]=[2,5] 对应 logits[2,5,V]，有效监督通常是 logits[:,0:4] 预测 ids[:,1:5]，padding 和纯上下文位置需屏蔽。",
      "教学例中 4 个目标 token 的真实标签概率均为 0.25，则每个 NLL=−ln0.25≈1.386，PPL=exp1.386=4。PPL 不是说模型只有 25% 的问答正确率。",
      "长文超过 context window 时使用固定滑窗或 stride 协议，重叠区可提供上下文但只对新目标计分。按有效目标 token 数加权累计 NLL，再统一取 exp，避免直接平均各 batch 的 PPL。",
      "任务指标另行生成：短答案用预先定义的 exact match/容错规则，代码用测试通过率，RAG 用答案正确性和引用支持率。固定模板、候选数、输出长度与采样种子策略。",
      "按语言、难度、长度、领域及有无答案分组，报告样本数与置信区间。用配对题目比较两模型，避免把随机采样噪声或不同题集当成性能提升。",
      "人工或模型裁判采用明确 rubric、打乱答案位置并隐藏模型身份；抽样核验一致性，测量延迟、token 成本和错误类型后再决定部署取舍。",
    ],
    whenToUse: [
      "比较 checkpoint、prompt、RAG 配置或生成策略，判断改善是否可复现。",
      "发现 benchmark 分数高但真实应用差，需要定位数据、评价协议和任务覆盖的缺口。",
    ],
    howToUse: [
      "写明模型版本、tokenizer、chat template、系统提示、few-shot 示例与全部解码配置。",
      "先用手算概率样例核对 shift、mask、sum/mean 和 PPL；再跑真实语料，记录有效 token 数。",
      "建立独立验证集用于选配置，最终测试只做冻结后的比较；保留按来源与时间划分的信息。",
      "为真实应用收集困难样例和无答案样例，定义成功、部分成功和错误引用等可执行评分规则。",
      "自动裁判先对一批人工标注题验证偏差，重要结论使用人工复核或更客观任务检查。",
      "同时保存原始输出、检索证据、延迟与成本，确保平均分变化可以追溯到具体题目。",
    ],
    tuning: [
      "上下文长度和滑窗 stride 会影响 PPL，跨模型比较必须明确协议，不能只对比分数。",
      "多次采样取最好答案会增加预算；报告 pass@k 或 best-of-k 时必须同时说明 k 与选择方法。",
      "小差异先看置信区间和配对错误，再决定是否需要更多样本，不因单次高分反复改测试集。",
    ],
    settings: [
      {
        name: "probability protocol",
        start: "固定 tokenizer、上下文窗口、stride、BOS 与文档边界规则。",
        adjust:
          "更换切分单位后不要直接比较 token PPL；可补充明确归一化的 byte/character 指标。",
      },
      {
        name: "generation budget",
        start: "固定 max_new_tokens、候选数、工具轮数和采样设置。",
        adjust: "允许更大推理预算时把质量与成本一并报告，避免隐藏额外计算。",
      },
      {
        name: "slices / uncertainty",
        start: "预定义语言、长度和领域分组，报告各组样本数。",
        adjust:
          "弱组样本太少时补充采样；相关题目用文档/实体级重采样估计不确定性。",
      },
    ],
    modifications: [
      "选择题可比较候选答案的条件似然，但需处理 token 长度偏置，并明确是否做长度归一化。",
      "开放回答使用人类偏好或 rubric 评分时，同时检查位置偏差、冗长偏好和参考答案局限。",
      "服务上线后跟踪漂移和失败类型，定期更新独立评估集，保留旧版以保证历史可比。",
    ],
    limits: [
      "公开数据可能存在训练污染，好的 benchmark 分数未必代表对新任务的泛化。",
      "模型裁判可能偏好特定文风或被输出中的指令影响，不能把它当成无误差的事实判定器。",
      "较低 PPL 不能保证事实性、对话体验或工具调用成功率更高。",
    ],
    pitfalls: [
      "先平均每段 PPL 再当作全语料 PPL；正确做法是按有效 token 加权 NLL 后取指数。",
      "跨 tokenizer 直接排名 token PPL，忽略每个 token 表示的信息单位不同。",
      "反复根据测试题改提示或检索配置，让测试集变成了验证集。",
    ],
    example:
      "模型 A 的 PPL 更低，但在 200 道设备手册题上正确率 72%，模型 B 为 80%。先核对相同提示和预算，再按证据缺失、阅读错误与版本混淆分析；不能仅凭 PPL 选 A。",
    compareTo: [
      "model-evaluation",
      "tokenization",
      "retrieval-augmented-generation",
    ],
  },
];
