import type { Exercise } from "./exerciseTypes";

type Prompt = [
  question: string,
  correct: string,
  distractor1: string,
  distractor2: string,
  explanation: string,
];
type Pair = [lessonId: string, mechanism: Prompt, decision: Prompt];
const pairs: Pair[] = [
  [
    "neural-networks",
    [
      "两层之间去掉所有非线性 activation，会发生什么？",
      "整个网络仍可合并为一个 affine 变换",
      "深度越大就自动得到更复杂的非线性边界",
      "梯度无法计算",
      "W₂(W₁x+b₁)+b₂=(W₂W₁)x+(W₂b₁+b₂)。深度本身不产生非线性，需要 activation 等非线性操作。",
    ],
    [
      "表格分类的新任务尚无 baseline，第一步更合理的是？",
      "先用简单模型和小 MLP 验证数据、切分与 loss",
      "直接把隐藏层扩大到几百层",
      "先根据测试集分数选择网络宽度",
      "简单基线能暴露数据或评估问题；验证集用于选型，独立测试用于最终报告，不能用测试反馈反复调参。",
    ],
  ],
  [
    "loss-functions",
    [
      "多类单标签分类的 cross entropy，对真实类概率从 0.2 提高到 0.8 会怎样？",
      "−log p(y) 从约 1.609 降到 0.223",
      "loss 变大，因为模型更自信",
      "loss 完全不变，只与预测标签有关",
      "交叉熵利用概率而非仅 argmax；把质量分配给正确类会降低该样本的负对数似然。",
    ],
    [
      "PyTorch CrossEntropyLoss 前又手动 softmax，优先怎么处理？",
      "通常直接传原始 logits，并核对 target 格式",
      "再 softmax 一次以便归一化",
      "先对 logits 取 argmax，再送入 CrossEntropyLoss",
      "该 loss 内部完成 log-softmax 等稳定计算；手动 softmax 会把概率再当 logits，改变目标和梯度。",
    ],
  ],
  [
    "backpropagation",
    [
      "ŷ=2w，L=½(ŷ−3)²，w=1 时 dL/dw 是多少？",
      "−2",
      "−1",
      "2",
      "链式法则：dL/dŷ=−1，dŷ/dw=2，相乘得 −2。梯度下降会增大 w，使 ŷ 更接近 3。",
    ],
    [
      "某层梯度始终为 None，优先查什么？",
      "是否被 detach、冻结或未参与 loss 的计算图",
      "只把训练 epoch 增加十倍",
      "直接把 weight decay 设为 1",
      "None 常意味着没有梯度路径，与数值恰好为 0 不同。先查 requires_grad、计算图和 optimizer 参数覆盖。",
    ],
  ],
  [
    "gradient-descent",
    [
      "L(w)=½w²，从 w=2 用 η=0.25 更新一次是多少？",
      "1.5",
      "2.5",
      "0.5",
      "梯度为 w=2，w_new=2−0.25×2=1.5。学习率决定沿负梯度移动的步长。",
    ],
    [
      "Loss 在最优点两侧大幅震荡，先做哪项诊断？",
      "降低 LR，并画出梯度 norm 与参数更新量",
      "保证 batch=1 就一定解决",
      "把测试集加入训练",
      "过大的更新可能跨过低谷；但也要排查异常数据或梯度。先改变一个因素，验证震荡是否缓解。",
    ],
  ],
  [
    "adamw",
    [
      "AdamW 的 decoupled weight decay 是指？",
      "权重衰减与自适应梯度预条件分开应用",
      "把学习率设成 weight decay",
      "只衰减梯度，不改变参数",
      "AdamW 避免把 L2 项直接混入自适应矩估计；衰减量仍与学习率有关，例如参数乘以 1−ηλ。",
    ],
    [
      "训练欠拟合且权重很快接近 0，应检查什么？",
      "LR 与 weight decay 的组合，以及哪些参数参与衰减",
      "保证 decay 越大泛化一定越好",
      "只增大验证集 batch",
      "过强衰减会限制拟合。常单独配置 bias/normalization 参数组，具体策略需在有效验证集比较。",
    ],
  ],
  [
    "regularization",
    [
      "常见 inverted dropout 在训练时保留概率 q，保留值通常乘多少？",
      "1/q",
      "q",
      "0",
      "保留后放大 1/q 使输出期望不变，eval 时通常关闭 dropout。不要混淆 drop probability p 与 keep probability q=1−p。",
    ],
    [
      "训练、验证 loss 都很高时，先增加强正则化是否合理？",
      "先排查欠拟合和训练故障，再评估正则强度",
      "合理，正则越强任何 loss 都越低",
      "只需要把验证标签随机化",
      "强正则可能进一步加重欠拟合。先建立可拟合的小样本测试、检查容量与优化，再依据学习曲线调整。",
    ],
  ],
  [
    "model-evaluation",
    [
      "在测试集上挑出最好的 50 次实验后，报告该测试分数意味着什么？",
      "测试集已参与选择，分数可能乐观",
      "它仍是完全独立的泛化估计",
      "重复次数越多越消除选择偏差",
      "选择过程利用了测试噪声；模型、阈值和超参数应通过训练/验证确定，最终独立测试只做报告。",
    ],
    [
      "同一患者有多张影像，目标是泛化到新患者，如何切分？",
      "按患者分组，保证同一患者不跨训练和验证",
      "对每张影像独立随机切分",
      "按文件名排序轮流放入各集合",
      "同一患者样本高度相关，影像级随机切分可能泄漏身份信息。切分单位应匹配部署时的独立单位。",
    ],
  ],
  [
    "cnn",
    [
      "输入宽 32、kernel 3、stride 2、padding 1、dilation 1，输出宽是多少？",
      "16",
      "32",
      "15",
      "floor((32+2−3)/2)+1=16。核大小、padding、stride 与 dilation 共同决定空间形状。",
    ],
    [
      "模型需要像素级输出而连续 stride 使细节消失，应考虑？",
      "减少下采样或增加上采样、skip connections，并检查 mask 对齐",
      "直接 flatten 后输出单一类别",
      "用测试 mask 决定训练增强",
      "分割需要恢复空间定位。decoder 和 skip 可结合高层语义与细节，但必须保持标签几何变换一致。",
    ],
  ],
  [
    "resnet",
    [
      "残差块 y=x+F(x)，为何存在直接梯度路径？",
      "dy/dx 包含恒等项 I",
      "F 的梯度永远等于 1",
      "加法会取消所有梯度",
      "dy/dx=I+∂F/∂x，为梯度提供直接通道；它改善优化条件，但不保证任何深度都无训练困难。",
    ],
    [
      "残差分支改变通道数或 stride，无法与 x 相加怎么办？",
      "对 shortcut 使用匹配形状的投影",
      "无条件广播相加即可",
      "把 batch dimension 当通道补齐",
      "加法要求可匹配的特征形状，常用 1×1 convolution 投影并按需改变 stride；应明确空间与通道对应关系。",
    ],
  ],
  [
    "rnn",
    [
      "RNN 在不同时间步如何使用 recurrent weights？",
      "共享同一组参数，hidden state 随时间更新",
      "每个时间步必须独立一套权重",
      "整个序列只有第一个 token 参与计算",
      "h_t=f(Wx_t+Uh_(t−1)) 中 W、U 跨时间共享，训练通过展开后的时间链反传。",
    ],
    [
      "长序列依赖学不到，且梯度很小，应比较什么？",
      "LSTM/GRU、attention 或更合适的截断长度",
      "只使用更短标签来伪造长依赖",
      "把训练和测试 hidden state 无条件串起来",
      "多步 Jacobian 连乘可能消失；门控、注意力与训练序列设计各有成本，应按任务验证长期信息是否保留。",
    ],
  ],
  [
    "lstm-gru",
    [
      "LSTM forget gate 接近 0 时，对旧 cell state 的直接贡献怎样变化？",
      "旧记忆被大幅抑制",
      "旧记忆被无限放大",
      "gate 不参与 cell 更新",
      "c_t=f_t⊙c_(t−1)+i_t⊙g_t，f_t 接近 0 抑制旧状态；新写入仍由 input gate 与候选内容决定。",
    ],
    [
      "推理时跨独立患者保留 recurrent state 会有什么问题？",
      "可能让无关个体的信息混入，应按序列边界重置",
      "一定提升所有患者预测",
      "等价于增加训练 batch size",
      "state 有序列语义。是否跨 batch 保留取决于同一连续序列的边界，不能让独立样本共享历史。",
    ],
  ],
  [
    "attention",
    [
      "两项 attention logits 都加同一个常数，softmax 权重如何变化？",
      "不变",
      "全部变为 0.5",
      "较大项的权重一定增加",
      "exp(s_i+c) 的共同因子 exp(c) 在分子分母抵消；这也是减去最大值实现稳定 softmax 的依据。",
    ],
    [
      "自回归训练 loss 很好，生成时失效，发现可见未来 token，应修复？",
      "正确施加 causal mask 并检查 label shift",
      "去掉 position 信息即可",
      "把 attention temperature 设为 0",
      "训练时偷看未来构成目标泄漏，生成时未来 token 不存在。mask 和目标对齐必须与实际因果生成一致。",
    ],
  ],
  [
    "transformer",
    [
      "普通全 attention 的 score 张量，在序列长 L 加倍时元素数怎样变化？",
      "约变为 4 倍",
      "约变为 2 倍",
      "不变",
      "逻辑形状包含 L×L；固定 batch 和 heads 时元素数随 L²。高效 kernel 可避免完整物化，不能混同逻辑形状与实际显存。",
    ],
    [
      "长上下文 OOM，最先应记录什么？",
      "实际 token 长度、batch、dtype、activation/KV 占用及 attention 后端",
      "只看模型文件有多大",
      "把 head 数随意改小并加载原权重",
      "OOM 可能来自权重、训练激活或推理缓存。先分辨阶段和占用来源；结构修改需要相应训练/权重支持。",
    ],
  ],
  [
    "encoder-models",
    [
      "双向 encoder 的一个 token 表示通常能利用哪些上下文？",
      "未被 mask 阻止的左右上下文",
      "只能左侧上下文",
      "只能该 token 自身",
      "encoder 的非因果 self-attention 通常允许访问两侧，这适合理解任务，但不能直接当作 causal next-token 生成。",
    ],
    [
      "要给整段文本做分类，合理的起点是？",
      "在 encoder pooled/特定 token 表示上接分类 head",
      "每次必须训练完整 encoder-decoder",
      "把文本长度作为唯一标签",
      "预训练 encoder 加任务 head 是常用理解基线；pooling、冻结范围与标签定义都需验证。",
    ],
  ],
  [
    "decoder-models",
    [
      "Causal decoder 在位置 t 的 logits 通常预测什么？",
      "在给定前缀后的下一个 token",
      "当前位置已经输入的 token",
      "过去所有标签的均值",
      "输入 [A,B,C] 的逐位置标签可为 [B,C,EOS]，使每个位置只凭已见前缀预测下一项。若模型内部已对齐 logits 和 labels，就不要再手动位移一次；同时检查 causal mask。",
    ],
    [
      "生成总是重复，除模型质量外应检查哪些设置？",
      "prompt 模板、停止条件、采样温度与重复抑制",
      "让模型看到答案后再计分",
      "只增加 padding 到最大长度",
      "解码设置影响输出分布，应固定评估配置并排查训练/服务模板一致性；重复抑制也可能伤害正常重复。",
    ],
  ],
  [
    "encoder-decoder",
    [
      "Encoder-decoder 的 cross-attention 中 Q 和 K/V 通常分别来自哪里？",
      "Q 来自 decoder，K/V 来自 encoder 输出",
      "Q 来自 encoder，K/V 来自 decoder",
      "Q、K、V 都来自 decoder 的同一表示",
      "decoder 用当前生成状态查询 encoder 的输入表示；decoder self-attention 和 cross-attention 是不同模块。",
    ],
    [
      "摘要系统训练时使用 teacher forcing，应如何评估实际生成质量？",
      "用真实 autoregressive 生成评估最终文本质量",
      "只报告给定真前缀时的训练 loss",
      "始终把参考答案放进 prompt",
      "teacher forcing 的条件与实际生成不同。应同时检查 token loss、生成质量、长度及解码设置。",
    ],
  ],
  [
    "autoencoder-vae",
    [
      "VAE 用 z=μ+σ⊙ε、ε∼N(0,I) 的主要训练作用是什么？",
      "把可微路径保留到 μ 和 σ",
      "让 KL 项必定为 0",
      "不再需要 decoder",
      "reparameterization 将随机性放在 ε，允许重建项梯度传播到分布参数；ELBO 中的 KL 仍约束后验。",
    ],
    [
      "重建模糊且 latent 几乎不携带信息，应排查？",
      "KL 与重建项的权衡、decoder 容量和 posterior collapse",
      "保证 KL 权重越大越清晰",
      "删除验证集只看重建图",
      "过强 KL 或强 decoder 可能使 posterior 接近 prior 而忽略输入；应观察 KL、重建和 latent 使用情况。",
    ],
  ],
  [
    "gan",
    [
      "GAN 的 generator 与 discriminator 关系是什么？",
      "交替优化相互影响的目标",
      "两者都直接最小化同一个固定 MSE",
      "D 的更新不会影响 G 的训练信号",
      "D 学区分真伪，G 通过 D 的信号改善生成；对手变化使优化成为动态博弈，而非固定 loss 的普通最小化。",
    ],
    [
      "生成很多几乎相同的样本但单张很逼真，应关注？",
      "Mode collapse，同时检查多样性与覆盖度",
      "只要单张逼真就说明训练成功",
      "只把图像锐化",
      "质量与多样性是不同维度，需观察模式覆盖、训练稳定性和评估样本，而非只挑选最好看的结果。",
    ],
  ],
  [
    "diffusion",
    [
      "常见噪声预测 diffusion 训练中，t 为什么随机采样？",
      "让同一网络学习多个噪声水平的去噪任务",
      "为了不需要训练数据",
      "使每步梯度严格相同",
      "训练用已知 x₀ 与噪声构造 x_t，再以 t 条件预测噪声；随机 t 覆盖整条噪声路径。",
    ],
    [
      "想降低采样延迟，应该怎样比较？",
      "在相同模型与评估下比较 sampler、步数和质量",
      "任意跳过步数且保留原更新系数",
      "只提高训练 batch 就能保证推理更快",
      "改变时间网格通常需要一致的采样公式。延迟与质量应同时测量，并区分训练目标和推理采样器。",
    ],
  ],
  [
    "gnn",
    [
      "消息传递层通常将哪类信息组合？",
      "自身表示与邻居消息的聚合",
      "所有节点按文件顺序直接拼接",
      "只有节点 ID 的大小",
      "聚合通常要求对邻居顺序不敏感，再结合自身表示更新节点；图结构决定谁能传递信息。",
    ],
    [
      "图上随机边切分，训练时已把测试目标边放入邻接矩阵，会怎样？",
      "可能泄漏目标关系，需要按任务构造可用图",
      "因为没有读 label 就永远安全",
      "自动等价于归纳评估",
      "图结构本身可能暴露待预测的答案。应明确 transductive/inductive 场景，以及评估时允许访问哪些边和节点特征。",
    ],
  ],
  [
    "contrastive-learning",
    [
      "Contrastive learning 中 positive pair 的定义为何关键？",
      "它定义应拉近的语义关系，影响表示学到的不变性",
      "它只影响 batch 的排序",
      "任意两条数据都可当正例而不改变目标",
      "把两种视图拉近，会鼓励对这些变化不敏感。如果增强删掉标签相关信息，模型可能学错不变性。",
    ],
    [
      "医学图像增强把细微病变裁掉，训练 loss 仍很好，怎么办？",
      "检查增强是否保留任务语义，并做下游验证",
      "只继续降低 contrastive loss",
      "把所有不同患者都设为正例",
      "自监督目标与下游目标可能不一致。必须审查增强、正负例定义，并用有效下游任务检验表示。",
    ],
  ],
  [
    "transfer-lora",
    [
      "LoRA 对权重更新 ΔW=BA，rank r 增大通常意味着什么？",
      "可训练参数与表达空间增大",
      "基础权重矩阵维度自动变小",
      "推理时必须丢掉原始 W",
      "低秩更新的参数量约为 r(d_in+d_out)，增加 rank 提高容量与训练成本；不能保证性能单调改善。",
    ],
    [
      "LoRA loss 不降，发现目标 projection 从未挂上 adapter，应先？",
      "核对 target modules、可训练参数及 optimizer 覆盖",
      "直接把 rank 调到最大",
      "只提高 max_new_tokens",
      "训练参数没有进入有效计算/优化路径，增大容量不会解决。先确认 adapter 被使用、梯度非零和标签 mask 正确。",
    ],
  ],
  [
    "reinforcement-learning",
    [
      "RL 中动作的价值为什么不只看即时 reward？",
      "动作会改变未来状态和后续回报",
      "未来回报总是 0",
      "策略只能选择即时奖励最大的动作",
      "目标通常是折扣累计回报；当前行为会改变以后能到达的状态，这造成信用分配与探索问题。",
    ],
    [
      "只有固定历史日志、无法在线探索，应优先考虑？",
      "Offline RL / 行为克隆，并检查覆盖与离线评估",
      "直接把在线探索动作当成已观测结果",
      "用训练 reward 上升证明新策略安全",
      "离线数据的 action support 有边界，分布外动作价值容易高估。应建立 BC baseline，并用有条件的 OPE 评估。",
    ],
  ],
  [
    "mixture-of-experts",
    [
      "Sparse MoE 的 active parameters 与 total parameters 有何区别？",
      "每 token 只激活部分 experts，总存储仍含全部 experts",
      "只激活部分专家就不必存储其他专家",
      "每 token 必须经过全部专家",
      "稀疏路由降低每 token 激活的专家计算，但模型驻留、通信和路由成本仍存在，不能只看 active 参数估显存。",
    ],
    [
      "大量 token 都路由到一个 expert，首先查什么？",
      "负载分布、容量限制、丢 token 和负载均衡项",
      "只报告总参数更大",
      "删除其他专家且保证质量不变",
      "不均衡会让部分专家过载、其他闲置。应同时观察路由、overflow 与任务质量，调整容量和均衡强度。",
    ],
  ],
];

export const coreExercises: Record<string, Exercise[]> = Object.fromEntries(
  pairs.map(([id, ...questions], i) => [
    id,
    questions.map(([question, correct, wrong1, wrong2, explanation], j) => {
      const answer = (i + j) % 3;
      const options = [wrong1, wrong2];
      options.splice(answer, 0, correct);
      return {
        id: `${id}-${j === 0 ? "mechanism" : "decision"}`,
        kind: j === 0 ? "mechanism" : "decision",
        question,
        options,
        answer,
        explanation,
      };
    }),
  ]),
);
