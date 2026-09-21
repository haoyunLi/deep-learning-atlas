import type { Exercise } from "./exerciseTypes";

type QuizSpec = {
  mechanism: [string, string[], number, string];
  decision: [string, string[], number, string];
};

const specs: Record<string, QuizSpec> = {
  "state-space-models": {
    mechanism: [
      "标量 SSM 满足 xₜ=0.8xₜ₋₁+uₜ，x₀=0，输入为 [1,0,2]。最终状态是多少？",
      ["2.00", "2.64", "3.60", "1.28"],
      1,
      "状态依次为 1、0.8、2.64。0.8 的幂决定旧输入对后续状态的衰减，最终还要加当前输入 2。",
    ],
    decision: [
      "长序列 SSM 的理论计算量较低，但部署反而比 Transformer 慢。最该先做什么？",
      [
        "只增加 state size",
        "在目标硬件 profile scan kernel、内存搬运和真实长度",
        "把所有序列缩短后继续宣称更快",
        "去掉数值有限性检查",
      ],
      1,
      "SSM 的收益依赖专门 scan 实现与硬件。FLOPs 不能代表墙钟时间，必须在目标长度和设备测 kernel 与数据搬运。",
    ],
  },
  mamba: {
    mechanism: [
      "Mamba 相比线性时不变 SSM 的关键变化是什么？",
      [
        "每个 token 都保存完整 attention matrix",
        "让 Δ、B、C 等状态参数随当前输入变化",
        "取消所有状态递推",
        "只在输出端加入 softmax",
      ],
      1,
      "输入相关的选择性参数让模型按内容决定写入、遗忘和读出，因此可以处理离散 token 的内容选择问题。",
    ],
    decision: [
      "Mamba 在 32k 文档上速度很好，但精确复制早期字符串失败。合理下一步是什么？",
      [
        "只提高生成 temperature",
        "加入 copy/retrieval 压力测试并比较混合少量 attention",
        "删除所有长序列样本",
        "只增大 batch size",
      ],
      1,
      "固定压缩状态可能弱于显式内容寻址。应先用针对性任务确认，再比较 hybrid attention，而不是用解码温度掩盖。",
    ],
  },
  rwkv: {
    mechanism: [
      "RWKV 自回归推理的缓存为什么可保持固定大小？",
      [
        "它删除了所有历史影响",
        "历史被递推地压缩进每层 time-mixing 状态",
        "它把所有 token 存在 CPU",
        "它只支持长度 1",
      ],
      1,
      "RWKV 用指数加权的分子、分母等状态递推历史，不需要保存随上下文增长的完整 K/V 张量。",
    ],
    decision: [
      "两个用户请求交替生成时出现上下文串线，RWKV 服务首先应检查什么？",
      [
        "是否给每个会话独立初始化、保存和清理 recurrent state",
        "是否把 temperature 设为 1",
        "是否增加词表",
        "是否关闭日志",
      ],
      0,
      "RWKV 的状态承载上下文。跨会话复用或错误路由 state 会直接泄漏历史，必须按会话隔离并在结束时清理。",
    ],
  },
  "faster-rcnn-yolo": {
    mechanism: [
      "Faster R-CNN 的 RoIAlign 位于哪条计算路径？",
      [
        "RPN proposals 之后、分类与框回归之前",
        "图像读取之前",
        "NMS 之后才提特征",
        "只在 loss 之后",
      ],
      0,
      "RPN 先提出候选区域，RoIAlign 从共享特征图提取定长 region 特征，再交给分类和边框回归 head。",
    ],
    decision: [
      "YOLO 类模型总体 mAP 较高，但现场小目标漏报多。应先改什么？",
      [
        "只把 NMS 关掉",
        "检查 small AP、输入分辨率、box 匹配与训练样本尺度",
        "只增加类别数",
        "随机拆分相邻视频帧",
      ],
      1,
      "总体 mAP 会掩盖尺度问题。应针对小框的信息量和正样本匹配排查，并保持按视频或相机的正确切分。",
    ],
  },
  "segment-anything": {
    mechanism: [
      "同一张图上连续加入点 prompt 时，SAM 哪个部分通常可以复用？",
      [
        "图像编码器输出的 dense embedding",
        "每个新 prompt 的坐标编码",
        "最终人工标签",
        "所有候选 mask 的选择",
      ],
      0,
      "图像 embedding 可只计算一次；新的点、框或 mask prompt 再编码并交给轻量 decoder，从而支持快速交互。",
    ],
    decision: [
      "用 SAM 预标医学图像后准备作为训练金标，最关键的处理是什么？",
      [
        "直接把预测当真值",
        "按领域、目标大小抽样人工复核并记录交互与修改",
        "删除空 mask",
        "只保留最高质量分数",
      ],
      1,
      "SAM 的 zero-shot mask 和质量分数不等于领域金标。应由合格标注者复核，并记录模型辅助造成的潜在偏差。",
    ],
  },
  "vision-language-models": {
    mechanism: [
      "文本 Q 形状 [B,H,T,Dh]，视觉 K 形状 [B,H,P,Dh]。cross-attention 分数形状是什么？",
      ["[B,H,T,P]", "[B,P,Dh]", "[T,P] 且没有 batch", "[B,H,Dh,Dh]"],
      0,
      "Q 与 K 的最后一维做点积，文本位置 T 查询视觉位置 P，所以每个 batch/head 的分数矩阵是 T×P。",
    ],
    decision: [
      "VLM 在图像问答上得分高，但怀疑主要靠语言先验。最有信息的对照是什么？",
      [
        "只增加 beam size",
        "比较 text-only、image-only 与打乱图像输入",
        "把字体变大",
        "只看生成文本长度",
      ],
      1,
      "模态消融和打乱配对能直接检验模型是否使用正确图像证据，仅看流畅度或总体分数无法识别语言捷径。",
    ],
  },
  "ctc-wav2vec": {
    mechanism: [
      "CTC 为什么需要 blank 符号？",
      [
        "用于增加音频音量",
        "允许帧级路径在无字符输出并区分相邻重复字符",
        "替代所有语言模型",
        "把 waveform 变成频谱",
      ],
      1,
      "blank 让长帧序列可对齐短文本，也使重复字符通过中间 blank 保持为两个字符，最后再折叠路径。",
    ],
    decision: [
      "CTC 微调出现大量删除错误，第一轮排查应包含什么？",
      [
        "帧长是否足够、blank 偏置、文本规范化与解码参数",
        "只增加颜色增强",
        "把说话人随机混入测试",
        "删除短音频",
      ],
      0,
      "删除可能来自输入帧不足、blank 主导或解码设置。应先验证这些机制，再决定是否增加模型容量。",
    ],
  },
  whisper: {
    mechanism: [
      "Whisper decoder 读取音频信息主要通过什么机制？",
      [
        "对 waveform 做 kNN",
        "decoder 对 audio encoder tokens 做 cross-attention",
        "只读取文件名",
        "CTC 动态规划",
      ],
      1,
      "audio encoder 产生声学表示，causal text decoder 在自注意力之外使用 cross-attention 读取这些音频 tokens。",
    ],
    decision: [
      "Whisper 在长静音段生成重复句子。优先的系统修复是什么？",
      [
        "增加随机 temperature",
        "加入 VAD/无语音检测并对重复和时间戳做验证",
        "把静音当正样本句子",
        "忽略这些输出",
      ],
      1,
      "生成式 ASR 可能在无证据时延续语言先验。VAD、no-speech 规则和重复检测应作为端到端流程的一部分。",
    ],
  },
  "two-tower-retrieval": {
    mechanism: [
      "双塔推荐为何能从百万 item 中高效召回？",
      [
        "每次为所有 item 运行联合 cross-encoder",
        "item embedding 可预计算并建立近似近邻索引",
        "只返回最流行 item",
        "训练时不需要负样本",
      ],
      1,
      "user 与 item 独立编码，item 向量可离线保存。线上只算 user 向量并做 ANN 内积搜索，再交给 ranker。",
    ],
    decision: [
      "加入 hard negatives 后召回明显下降，首先应检查什么？",
      [
        "hard negatives 是否含用户实际喜欢的假负样本或同义 item",
        "是否把 embedding 调到 4096",
        "是否删除验证集",
        "是否关闭 item tower",
      ],
      0,
      "困难负样本很有信息，但假负会迫使相似正例分开。应检查曝光、同义和历史正反馈，再调整采样。",
    ],
  },
  "matrix-factorization": {
    mechanism: [
      "矩阵分解预测 r̂ui=μ+bu+bi+puᵀqi 中，puᵀqi 表示什么？",
      [
        "用户与物品在 latent factors 上的匹配",
        "全局平均",
        "物品出现次数",
        "测试集标签",
      ],
      0,
      "用户和物品向量的内积刻画在学习到的隐藏偏好方向上的匹配，bias 则吸收全局和实体基准差异。",
    ],
    decision: [
      "新物品从未有交互，纯 ID 矩阵分解无法给出可靠向量。合理回退是什么？",
      [
        "随机高分",
        "用 popularity 与内容特征生成的冷启动表示",
        "读取未来点击",
        "把它从 catalog 永久删除",
      ],
      1,
      "纯 ID factors 没有新 item 的学习信号，应使用可用内容特征或规则基线，并把冷启动作为独立 cohort 评估。",
    ],
  },
  "learning-to-rank": {
    mechanism: [
      "LambdaRank 为什么对某些 pair 交换给更大梯度？",
      [
        "因为它们字符串更长",
        "因为交换对 NDCG 的改变更大",
        "因为所有 pair 梯度随机",
        "因为只看 item ID",
      ],
      1,
      "位于列表顶部或相关性差异大的错误交换通常带来更大 ΔNDCG，因此更影响排序目标。",
    ],
    decision: [
      "ranker 的 NDCG 下降，但候选生成器也刚更新。正确诊断方式是什么？",
      [
        "直接归因 ranker",
        "固定候选分别评估 candidate recall 与 rank quality",
        "只看点击总量",
        "删除旧日志",
      ],
      1,
      "ranker 无法找回未召回 item。先固定候选集隔离排序质量，再分析召回变化，才能正确归因。",
    ],
  },
  "survival-analysis": {
    mechanism: [
      "右删失个体在生存分析中提供了什么信息？",
      [
        "事件永远不会发生",
        "事件时间晚于已观察到的删失时间",
        "等同于立刻发生事件",
        "没有任何信息",
      ],
      1,
      "右删失只说明真实事件晚于观察截止。在删失前，该个体仍属于风险集并贡献信息。",
    ],
    decision: [
      "DeepSurv 的 C-index 很高，但 1 年风险普遍过高。下一步应做什么？",
      [
        "只报告 C-index",
        "检查 baseline hazard、1 年校准和比例风险假设",
        "把删失者改为负类",
        "删除事件样本",
      ],
      1,
      "C-index 衡量排序，不保证绝对生存概率。应单独评估 horizon calibration，并检查模型假设和 baseline hazard。",
    ],
  },
  "deep-ensembles": {
    mechanism: [
      "分类 deep ensemble 应如何得到总体预测概率？",
      [
        "先把成员类别 ID 相加",
        "平均每个成员的概率分布",
        "只选训练 loss 最低成员",
        "平均输入特征",
      ],
      1,
      "成员的 predictive probabilities 可直接平均形成 mixture；平均 logits 通常得到不同结果，不能混用。",
    ],
    decision: [
      "五个 ensemble 成员在域外样本上都以 0.99 给出同一错误类别，这说明什么？",
      [
        "ensemble 保证发现所有 OOD",
        "成员共享系统性偏差，低分歧不等于可靠",
        "样本一定属于训练分布",
        "应删除所有成员",
      ],
      1,
      "ensemble 只能暴露成员间分歧，无法识别所有共同盲点。仍需真实 shift/OOD 压力测试和 guardrails。",
    ],
  },
  "conformal-selective-prediction": {
    mechanism: [
      "split conformal 的 calibration set 为什么不能用于反复选模型？",
      [
        "因为文件太小",
        "反复选择会破坏其独立校准角色与覆盖保证条件",
        "因为不含输入",
        "因为必须是训练集",
      ],
      1,
      "校准分位数需要在模型与评分规则固定后估计。反复看校准结果调模型会引入选择偏差。",
    ],
    decision: [
      "目标 90% coverage 在新医院降到 75%。正确解释是什么？",
      [
        "保证仍严格成立",
        "分布交换性可能被破坏，需要新域评估和重新校准/回退",
        "只把 α 改成 0.01 即可",
        "删除所有大集合",
      ],
      1,
      "conformal 的有限样本保证依赖 calibration 与测试可交换。真实域偏移会使 coverage 失效，不能靠原阈值宣称保证。",
    ],
  },
  "causal-treatment-effects": {
    mechanism: [
      "估计 treatment effect 时为什么不能控制 treatment 后的 mediator？",
      [
        "它可能阻断 treatment 作用路径并改变 estimand",
        "它一定没有缺失",
        "它总是随机",
        "它只影响计算速度",
      ],
      0,
      "mediator 位于 treatment 到 outcome 的因果路径上。若目标是总效应，调整它会阻断部分真实作用，还可能引入偏差。",
    ],
    decision: [
      "propensity 权重极端且两组几乎不重叠，合理做法是什么？",
      [
        "继续无限外推",
        "限制目标人群并报告 overlap、有效样本和截断敏感性",
        "删除 propensity 模型",
        "只提高神经网络层数",
      ],
      1,
      "缺乏 positivity 时没有数据支持反事实比较。应改变目标人群或设计，并透明报告权重和敏感性。",
    ],
  },
  "imitation-learning": {
    mechanism: [
      "DAgger 相比 behavior cloning 主要解决什么问题？",
      [
        "通过学习者 rollout 收集其实际访问状态的专家动作，减轻分布偏移",
        "取消专家",
        "把所有动作随机化",
        "只提高分类准确率",
      ],
      0,
      "BC 只见专家状态，学习者小误差会进入新状态。DAgger 对这些状态查询专家并聚合数据，直接处理 compounding error。",
    ],
    decision: [
      "BC 离线动作准确率 98%，闭环任务仍频繁失败。下一步最关键是什么？",
      [
        "继续只优化离线准确率",
        "做 closed-loop rollout，定位偏离后的未见状态并考虑 DAgger",
        "删除环境",
        "把测试轨迹加入训练",
      ],
      1,
      "高离线准确率不覆盖策略自己造成的状态分布。闭环 rollout 才能揭示累计误差，并指导收集纠正示范。",
    ],
  },
  "safe-rl-pomdp": {
    mechanism: [
      "CMDP 中把 cost constraint 单独建模的原因是什么？",
      [
        "安全成本不能总由更高 reward 抵消",
        "为了减少 observation",
        "让 agent 无动作",
        "替代所有评估",
      ],
      0,
      "碰撞等约束有独立上限。把它仅混入 reward 可能允许高收益策略用少数严重事故换分。",
    ],
    decision: [
      "策略平均 cost 达标但有少数灾难 episode。应如何评估？",
      [
        "只保留平均值",
        "报告 cost 分布、tail/CVaR 和最差场景，并加入 shield/fallback",
        "提高奖励",
        "忽略稀有事件",
      ],
      1,
      "期望约束不保证逐轨迹安全。尾部指标、压力场景和执行前防护才能覆盖稀有严重失败。",
    ],
  },
  quantization: {
    mechanism: [
      "affine INT8 量化中的 scale 主要决定什么？",
      ["相邻整数格在实数空间的间距", "模型层数", "类别数", "batch 顺序"],
      0,
      "实数近似为 s(q−z)，scale 决定量化步长；范围过宽会降低分辨率，过窄会增加 clipping。",
    ],
    decision: [
      "模型文件缩小 4 倍但目标 CPU 延迟没有下降，最该检查什么？",
      [
        "实际 runtime 是否有对应整数 kernel，以及瓶颈是否在该算子",
        "只继续降到 1 bit",
        "删除性能测试",
        "增加输出类别",
      ],
      0,
      "量化只有在部署栈使用高效低比特 kernel 且原瓶颈受益时才加速。大小变化本身不能证明墙钟改善。",
    ],
  },
  "distillation-pruning": {
    mechanism: [
      "蒸馏 loss 中温度 T 提高通常会怎样改变 teacher 分布？",
      [
        "使类别概率更平滑，暴露类间相似性",
        "变成 one-hot",
        "删除真实标签",
        "改变输入分辨率",
      ],
      0,
      "更高温度软化 logits，非目标类相对概率携带 teacher 的暗知识；通常用 T² 调整 KL 梯度尺度。",
    ],
    decision: [
      "非结构化剪枝得到 90% 零权重，但延迟不变。合理解释是什么？",
      [
        "dense runtime 没有利用这些零，计算图形状未改变",
        "精度一定更高",
        "GPU 自动跳过所有零",
        "参数数目增加",
      ],
      0,
      "若仍用 dense 矩阵 kernel，零权重照样参与乘法。需要稀疏硬件支持或结构化删除通道/块并重建紧凑图。",
    ],
  },
  "model-serving-monitoring": {
    mechanism: [
      "端到端线上延迟应包括哪些组成？",
      [
        "只有矩阵乘法",
        "排队、预处理、推理、后处理与网络",
        "只有模型加载",
        "只有数据库写入",
      ],
      1,
      "用户感受到的是完整请求路径。只报模型 kernel 会漏掉 batching queue、特征处理、序列化和网络成本。",
    ],
    decision: [
      "线上输入分布漂移，但暂时没有标签。正确行动是什么？",
      [
        "立刻断言 accuracy 已下降",
        "把漂移当调查信号，结合 proxy、人工抽检和标签回填计划",
        "忽略所有漂移",
        "把测试集加入线上",
      ],
      1,
      "data drift 不必然等于性能下降，也可能漏掉 concept drift。应触发有证据的调查和抽检，并等待可靠反馈闭环。",
    ],
  },
};

export const frontierSystemsExercises: Record<string, Exercise[]> =
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
