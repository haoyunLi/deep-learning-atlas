export type ConceptPath = {
  id: string;
  title: string;
  description: string;
  steps: { lessonId: string; why: string }[];
};

/**
 * Short routes through existing model lessons and the concept lessons.
 * A step explains why the next idea belongs in the same learning journey.
 */
export const conceptPaths: ConceptPath[] = [
  {
    id: "two-kinds-of-heads",
    title: "Head 到底指什么？",
    description:
      "从 backbone 的特征走到任务输出，再进入 Transformer 的 multi-head attention；分清 prediction head 与 attention head 两种不同层次的部件。",
    steps: [
      {
        lessonId: "neural-networks",
        why: "先看线性层怎样把中间表示映射到 logits 或数值，理解 task head 的最小构件。",
      },
      {
        lessonId: "resnet",
        why: "ResNet 是可复用的 image backbone；最后的分类层只是连接特征与目标的一种 head。",
      },
      {
        lessonId: "prediction-heads",
        why: "逐步比较分类、回归、token 与像素级 prediction heads，以及何时冻结或重训 backbone。",
      },
      {
        lessonId: "unet",
        why: "分割需要保留空间结构和逐像素输出；这能说明 head 为何必须服从任务的输出粒度。",
      },
      {
        lessonId: "attention",
        why: "切换到另一种 head：先弄懂 Query、Key、Value 如何生成 token 间的加权信息。",
      },
      {
        lessonId: "attention-heads",
        why: "多个 attention heads 并行处理不同投影，再拼接映射；它们不是分类或分割的输出层。",
      },
      {
        lessonId: "transformer",
        why: "把 multi-head attention 放回完整 block，看 residual、normalization 与 feed-forward 如何配合。",
      },
      {
        lessonId: "bert",
        why: "用 BERT 贯通两种 head：编码器内部有 attention heads，预训练表示上还能接任务 head。",
      },
    ],
  },
  {
    id: "zero-to-few-shot",
    title: "从 Zero-shot 到 Few-shot",
    description:
      "把预训练表示、无样例迁移、少样例适配与参数更新放在一条线上，比较 CLIP、linear probe、prototype 和 meta-learning。",
    steps: [
      {
        lessonId: "contrastive-learning",
        why: "先理解表示空间：相似输入靠近、不同输入分开，后续的少样例方法才有可比较的特征。",
      },
      {
        lessonId: "clip",
        why: "CLIP 对齐图像与文本表示，文本标签可以变成候选类别描述。",
      },
      {
        lessonId: "zero-shot-learning",
        why: "明确 zero-shot 的样例与训练边界：评估目标任务时没有该任务的标注示例，仍要检查类别描述和分布。",
      },
      {
        lessonId: "linear-probe",
        why: "如果已有标注，可先冻结 encoder、只训练一个线性 head，衡量表示中已有多少可读出的信息。",
      },
      {
        lessonId: "few-shot-learning",
        why: "把每类只有少量 support examples 的任务写清楚，区分少样例微调与 prompt 内示例。",
      },
      {
        lessonId: "prototypical-networks",
        why: "看 embedding 中每类 prototype 如何由 support set 形成，再用距离判断 query。",
      },
      {
        lessonId: "meta-learning-maml",
        why: "对比另一条路线：在多个训练任务上学一个能用少量梯度步快速适配的初始化。",
      },
      {
        lessonId: "transfer-lora",
        why: "最后对照实际部署选项：保持模型冻结、训练浅层 head，或对预训练权重做参数高效适配。",
      },
    ],
  },
  {
    id: "cohort-to-validation",
    title: "Cohort 到可信评估",
    description:
      "把样本是谁、标签何时产生、模型看到哪些信息与结果能否迁移接起来；适用于医疗、用户和时间序列数据研究。",
    steps: [
      {
        lessonId: "cohort-design",
        why: "先定义研究对象、入排标准、index time、观察窗口与预测窗口，固定一个可复现的样本集合。",
      },
      {
        lessonId: "data-leakage",
        why: "沿时间和实体边界检查特征：预测时未知的信息与同一人的重复记录都可能使验证结果虚高。",
      },
      {
        lessonId: "class-imbalance",
        why: "检查事件率和各子群样本数，再决定采样、损失权重与 PR 指标等设置。",
      },
      {
        lessonId: "model-evaluation",
        why: "确定任务级指标、阈值与置信区间；明确一次验证所对应的 cohort 和数据切分。",
      },
      {
        lessonId: "domain-shift",
        why: "人群、设备、机构或时间变化会改变输入与目标分布，内部好成绩不能自动代表新环境。",
      },
      {
        lessonId: "external-validation",
        why: "在独立地点、时间或来源的 cohort 上测试，观察性能和子群差异是否稳定。",
      },
      {
        lessonId: "calibration-uncertainty",
        why: "最后检验预测概率是否与观察频率一致，并用不确定性分析支持阈值和使用边界。",
      },
    ],
  },
  {
    id: "prompting-to-alignment",
    title: "GPT、Prompt 与反馈学习",
    description:
      "沿 next-token prediction 到 in-context learning、few-shot prompting、推理提示和偏好训练，区分上下文适配与权重更新。",
    steps: [
      {
        lessonId: "decoder-models",
        why: "从 causal mask 与 next-token objective 开始，理解模型为何能接着提示继续生成。",
      },
      {
        lessonId: "gpt-language-model",
        why: "把 decoder 训练成语言模型，认识 pretraining 与下游任务提示之间的接口。",
      },
      {
        lessonId: "in-context-learning",
        why: "在 prompt 中放任务说明或示例，让模型条件化当前输出；推理时并没有梯度更新。",
      },
      {
        lessonId: "few-shot-learning",
        why: "同为 few-shot，prompt 中的 demonstrations 与少量样本上的参数微调是两种不同操作。",
      },
      {
        lessonId: "chain-of-thought-prompting",
        why: "为多步问题加入中间推理示例或要求，检查何时提高表现、何时只是增加 token 与错误链。",
      },
      {
        lessonId: "reward-model",
        why: "偏好数据训练一个给候选回答打分的 reward model，这一步会更新模型参数。",
      },
      {
        lessonId: "rlhf",
        why: "把 reward model 用于策略优化，区分训练期偏好对齐与推理时仅改 prompt。",
      },
      {
        lessonId: "dpo",
        why: "对照一种直接利用偏好对优化策略的做法，理解何时不必显式训练独立的奖励模型。",
      },
    ],
  },
];
