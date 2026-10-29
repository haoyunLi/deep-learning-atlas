type CVDepthFigure = {
  question: string;
  nodes: [
    { title: string; detail: string },
    { title: string; detail: string },
    { title: string; detail: string },
  ];
  edges: [string, string];
  caption: string;
};

export const cvDepthFigures: Record<string, CVDepthFigure> = {
  "cv-preprocessing-augmentation": {
    question: "Label怎样跟着letterbox一起移动？",
    nodes: [
      {
        title: "Original box",
        detail: "640×480：[100,50,300,250]",
      },
      {
        title: "Resize and pad",
        detail: "s=.5、pad_y=40 → [50,65,150,165]",
      },
      {
        title: "Horizontal flip",
        detail: "W=320 → [170,65,270,165]",
      },
    ],
    edges: ["Apply same geometry", "Flip box boundaries"],
    caption:
      "Synthetic continuous xyxy；逆序undo flip、减pad、除scale可恢复原box，crop丢失的信息不可恢复。",
  },
  "feature-pyramids-small-objects": {
    question: "FPN如何同时保留细位置和深层语义？",
    nodes: [
      {
        title: "Input object",
        detail: "8pixel宽；stride4/16覆盖2/.5 cell",
      },
      {
        title: "Lateral + top-down",
        detail: "[256,16,16] + upsample(M5)",
      },
      {
        title: "High-resolution P2",
        detail: "[256,64,64] = 4MiB FP32 / sample",
      },
    ],
    edges: ["Measure spatial sampling", "Fuse, then 3×3 Conv"],
    caption:
      "Synthetic shapes与memory算术；4MiB只计一个feature输出，upsampling不会重建丢失观测。",
  },
  "box-regression-losses": {
    question: "零overlap时，额外几何项提供什么信号？",
    nodes: [
      {
        title: "Two disjoint boxes",
        detail: "A=[0,0,2,2]；B=[3,0,5,2]",
      },
      {
        title: "Enclosing rectangle",
        detail: "intersection0；union8；enclosing10",
      },
      {
        title: "Geometry-aware loss",
        detail: "IoU loss=1；GIoU loss=1.2",
      },
    ],
    edges: ["Compute true areas", "Penalize enclosing gap"],
    caption:
      "Synthetic rectangles；B左移1仍无overlap，但GIoU loss降到1。它不是正确对象配对的证明。",
  },
  "hungarian-set-matching": {
    question: "为什么不能只选矩阵里最小的数字？",
    nodes: [
      {
        title: "Original costs",
        detail: "C=[[4,1,3],[2,0,5],[3,2,2]]",
      },
      {
        title: "One-to-one constraint",
        detail: "各row/column恰好1个；最小0先选可得6",
      },
      {
        title: "Global assignment",
        detail: "cols=[2,1,3] → cost=1+2+2=5",
      },
    ],
    edges: ["Respect coupling", "Compare original sums"],
    caption:
      "Synthetic教学matrix沿用SciPy文档例子；global optimum只对给定cost成立，不自动等于真实identity。",
  },
  "dense-visual-correspondence": {
    question: "高cosine是否足够证明对应正确？",
    nodes: [
      {
        title: "Patch descriptors",
        detail: "A2=(.8,.6)；B1=(.6,.8)，norm=1",
      },
      {
        title: "Similarity and margin",
        detail: "cosine=.96；top2=.8；margin=.16",
      },
      {
        title: "Validate correspondence",
        detail: "Mutual + geometry + precision/coverage",
      },
    ],
    edges: ["Dot product", "Check independent evidence"],
    caption:
      "Synthetic features；.96不是96%正确率，重复纹理也可形成mutual但错误的match。",
  },
  "keypoint-heatmaps-pose": {
    question: "Heatmap的期望为何可能落在没有峰的位置？",
    nodes: [
      {
        title: "Two candidate peaks",
        detail: "x=[0,1,2,3]；p=[.5,0,0,.5]",
      },
      {
        title: "Soft-argmax",
        detail: "E[x]=0×.5+3×.5=1.5",
      },
      {
        title: "Preserve ambiguity",
        detail: "1.5无probability mass；保留两个候选",
      },
    ],
    edges: ["Take expectation", "Inspect multimodality"],
    caption:
      "Synthetic exact双峰反例；连续坐标和尖锐heatmap都不自动等于calibrated confidence。",
  },
};
