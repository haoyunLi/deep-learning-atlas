import type { Exercise } from "./exerciseTypes";

export const cvDepthExercises: Record<string, Exercise[]> = {
  "cv-preprocessing-augmentation": [
    {
      id: "cv-preprocessing-augmentation-mechanism",
      kind: "mechanism",
      question:
        "W=640、H=480的图letterbox到320×320，原continuous xyxy box=[100,50,300,250]。正确新box是？",
      options: [
        "[50,25,150,125]",
        "[50,65,150,165]",
        "[50,33.33,150,166.67]",
        "[100,50,300,250]",
      ],
      answer: 1,
      explanation:
        "s=.5先得320×240，上下各pad40；x乘.5，y乘.5后加40，因此[50,65,150,165]。第一项漏掉padding，第三项是另一种非等比resize。",
    },
    {
      id: "cv-preprocessing-augmentation-decision",
      kind: "decision",
      question:
        "Hard class mask resize后出现原标签中没有的新class ID，先查什么？",
      options: [
        "增大backbone避免欠拟合",
        "降低learning rate",
        "mask是否错误使用bilinear而非nearest interpolation",
      ],
      answer: 2,
      explanation:
        "Hard class IDs是离散类别；插值可混出不存在的值。先修label transform并画overlay，再训练。Soft probability map才需要另一套连续插值约定。",
    },
  ],
  "feature-pyramids-small-objects": [
    {
      id: "feature-pyramids-small-objects-mechanism",
      kind: "mechanism",
      question:
        "一个8pixel宽目标在stride4和stride16网格上，约各覆盖多少cell宽？",
      options: ["2与.5", "4与1", "32与128", "都为8"],
      answer: 0,
      explanation:
        "宽度除以stride：8/4=2，8/16=.5。这说明目标对细网格的需求，但覆盖cell数不保证一定能检测到，也不等同receptive field。",
    },
    {
      id: "feature-pyramids-small-objects-decision",
      kind: "decision",
      question:
        "新增P2后small-object recall没有提升，日志显示P2几乎没有positive targets。优先做什么？",
      options: [
        "继续增大P2 channels",
        "检查scale/anchor assignment与每level正样本分布",
        "提高evaluation IoU threshold",
      ],
      answer: 1,
      explanation:
        "新features需要与head的监督分配一致。没有positive可能来自assignment/尺度配置，先核规则与label再解释architecture收益；evaluation threshold应固定。",
    },
  ],
  "box-regression-losses": [
    {
      id: "box-regression-losses-mechanism",
      kind: "mechanism",
      question:
        "A=[0,0,2,2]、B=[3,0,5,2]。Continuous boxes的GIoU与其loss是多少？",
      options: ["GIoU=0，loss=1", "GIoU=.2，loss=.8", "GIoU=−.2，loss=1.2"],
      answer: 2,
      explanation:
        "intersection=0、union=8、enclosing area=10。GIoU=0−(10−8)/10=−.2，loss=1−GIoU=1.2。负GIoU合法，它不是概率。",
    },
    {
      id: "box-regression-losses-decision",
      kind: "decision",
      question: "把训练图尺寸翻倍后pixel L1增大而IoU相近，应先怎样处理？",
      options: [
        "检查box单位、normalization与loss权重，再比较gradient",
        "把evaluation IoU减半",
        "认为所有几何loss都损坏了",
      ],
      answer: 0,
      explanation:
        "同一相对几何下IoU不随统一缩放改变，pixel L1会变。先确认L1是否使用normalized cxcywh、reduction和loss量级，再调权重；不用改评价协议掩盖。",
    },
  ],
  "hungarian-set-matching": [
    {
      id: "hungarian-set-matching-mechanism",
      kind: "mechanism",
      question:
        "C=[[4,1,3],[2,0,5],[3,2,2]]，one-to-one最优配对的原始总cost是多少？",
      options: [
        "0，因为reduced matrix可以选三个zero",
        "5，对应row1→col2、row2→col1、row3→col3",
        "3，等于row minima之和",
      ],
      answer: 1,
      explanation:
        "在原始matrix取1+2+2=5。Reduction仅保留最优assignment位置，不意味着原始cost变0；row minima忽略column冲突。",
    },
    {
      id: "hungarian-set-matching-decision",
      kind: "decision",
      question:
        "一个square tracker cost matrix中所有pair都不可信，但solver仍返回完整配对，缺少什么？",
      options: [
        "更复杂的color palette",
        "更高精度的浮点数",
        "明确的unmatched/dummy cost和feasibility/拒绝规则",
      ],
      answer: 2,
      explanation:
        "Square完整assignment的约束强制每个对象被配。若任务允许拒绝，必须写入目标和可行集合。Solver不会自动知道业务上哪些pair应该丢弃。",
    },
  ],
  "dense-visual-correspondence": [
    {
      id: "dense-visual-correspondence-mechanism",
      kind: "mechanism",
      question:
        "两个已L2-normalized features a=(.8,.6)、b=(.6,.8)，cosine similarity是多少？",
      options: [".48", ".96", "1.4"],
      answer: 1,
      explanation:
        "dot product=.8×.6+.6×.8=.96。长度均1所以无需再除范数；.96是相似性，不能解释为96%配对正确率。",
    },
    {
      id: "dense-visual-correspondence-decision",
      kind: "decision",
      question:
        "同一建筑重复窗户产生很多高cosine且mutual的matches，下一步最合理的是？",
      options: [
        "接受所有matches，因为mutual已证明正确",
        "只把feature图颜色改得更明显",
        "检查重复结构与geometry residual，报告precision和coverage",
      ],
      answer: 2,
      explanation:
        "重复纹理可以形成自洽但错误的对应。Mutual nearest neighbor是过滤器而非真值；应使用符合场景的geometry、独立landmarks和coverage评价。",
    },
  ],
  "keypoint-heatmaps-pose": [
    {
      id: "keypoint-heatmaps-pose-mechanism",
      kind: "mechanism",
      question: "Grid[0,1,2,3]上的p=[.1,.2,.6,.1]，soft-argmax是多少？",
      options: ["1.7", "2", "1.5"],
      answer: 0,
      explanation:
        "期望为0×.1+1×.2+2×.6+3×.1=1.7。Hard argmax为2；连续输出有不同偏差，不能只因有小数就认定更准确。",
    },
    {
      id: "keypoint-heatmaps-pose-decision",
      kind: "decision",
      question: "Heatmap在0和3各有.5概率质量，soft-argmax给1.5，应该如何解释？",
      options: [
        "模型已经精确定位到1.5",
        "均值掩盖双峰，应保留多候选或歧义信息",
        "把1.5取整就能保证正确",
      ],
      answer: 1,
      explanation:
        "1.5没有任何该分布的质量，却是两个峰的均值。应检查visibility、多人/左右歧义、标注并保留适当多假设，不能把均值直接当确定landmark。",
    },
  ],
};
