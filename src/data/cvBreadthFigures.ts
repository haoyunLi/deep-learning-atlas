type CVBreadthFigure = {
  question: string;
  nodes: [
    { title: string; detail: string },
    { title: string; detail: string },
    { title: string; detail: string },
  ];
  edges: [string, string];
  caption: string;
};

export const cvBreadthFigures: Record<string, CVBreadthFigure> = {
  "camera-image-formation": {
    question: "一个三维点如何落到 pixel？",
    nodes: [
      {
        title: "Camera point",
        detail: "(X,Y,Z)=(1,0.5,5) m",
      },
      {
        title: "Normalize by depth",
        detail: "(X/Z,Y/Z)=(0.2,0.1)",
      },
      {
        title: "Pixel projection",
        detail: "f=800，c=(320,240) → (480,320)",
      },
    ],
    edges: ["Perspective divide", "Apply intrinsics"],
    caption:
      "Synthetic pinhole，无 distortion；不同深度的共线点可产生相同 pixel。",
  },
  "local-features-matching": {
    question: "相似 patch 是否足够证明正确对应？",
    nodes: [
      {
        title: "Top-2 candidates",
        detail: "d1=0.4；d2=0.8",
      },
      {
        title: "Ratio gate",
        detail: "0.4/0.8=0.5 < 0.75",
      },
      {
        title: "Geometry check",
        detail: "仍需 RANSAC residual / inlier mask",
      },
    ],
    edges: ["Compare ambiguity", "Verify correspondence"],
    caption: "Synthetic descriptor distances；ratio pass 不是正确匹配的概率。",
  },
  "registration-ransac": {
    question: "RANSAC 的 iteration budget 从哪里来？",
    nodes: [
      {
        title: "Match quality",
        detail: "w=0.5；minimal sample s=4",
      },
      {
        title: "One clean sample",
        detail: "P(all inliers)=0.5⁴=0.0625",
      },
      {
        title: "99% trial target",
        detail: "ceil[ln(.01)/ln(.9375)]=72",
      },
    ],
    edges: ["Independent-sample toy", "Repeat hypotheses"],
    caption:
      "Synthetic sampling calculation；真实matches相关、几何退化或模型错误会破坏简单保证。",
  },
  "detection-metrics-nms": {
    question: "NMS threshold 与 evaluation IoU 是同一件事吗？",
    nodes: [
      {
        title: "Two predictions",
        detail: "A/B area=16；intersection=9",
      },
      {
        title: "Prediction overlap",
        detail: "IoU=9/23=0.3913",
      },
      {
        title: "NMS decisions",
        detail: "threshold .3→留A；.5→留A/B",
      },
    ],
    edges: ["Compute geometry", "Compare with NMS threshold"],
    caption:
      "Synthetic同类框、score A>B；ground-truth matching与AP在后续独立计算。",
  },
  "segmentation-task-metrics": {
    question: "相同 foreground，为何instance结果不同？",
    nodes: [
      {
        title: "Ground truth",
        detail: "两个instances，各3pixels",
      },
      {
        title: "Merged prediction",
        detail: "一个6pixel mask；foreground Dice=1",
      },
      {
        title: "Instance check",
        detail: "各IoU=.5；strict >.5下PQ=0",
      },
    ],
    edges: ["Forget identity", "Evaluate object identity"],
    caption:
      "Synthetic无ignore/crowd例子；foreground重合不保证object数量和边界正确。",
  },
  "optical-flow-motion": {
    question: "为什么一个pixel不足以确定二维运动？",
    nodes: [
      {
        title: "First gradient",
        detail: "Ix=1,Iy=0,It=−2 → u=2",
      },
      {
        title: "Missing direction",
        detail: "v未确定：沿边方向缺证据",
      },
      {
        title: "Independent constraint",
        detail: "Ix=0,Iy=1,It=−1 → v=1",
      },
    ],
    edges: ["One equation, two unknowns", "Use another valid constraint"],
    caption:
      "Synthetic linear brightness equations；邻域同运动假设遇到boundary可能失败。",
  },
  "multi-object-tracking": {
    question: "各自挑最近的detection，为什么可能更差？",
    nodes: [
      {
        title: "Pair costs",
        detail: "C=[[.10,.20],[.11,.90]]",
      },
      {
        title: "Row-greedy",
        detail: ".10+.90=1.00",
      },
      {
        title: "Global matching",
        detail: ".20+.11=.31",
      },
    ],
    edges: ["One-to-one constraint", "Compare feasible assignments"],
    caption:
      "Synthetic两对两complete assignment；真实tracker需允许unmatched与gating。",
  },
  "stereo-depth-geometry": {
    question: "同样1pixel误差，为何远处代价更大？",
    nodes: [
      {
        title: "Camera baseline",
        detail: "f=800px，B=.1m → fB=80",
      },
      {
        title: "Near: d=40px",
        detail: "Z=2m；δd=1px → |δZ|≈.05m",
      },
      {
        title: "Far: d=20px",
        detail: "Z=4m；δd=1px → |δZ|≈.20m",
      },
    ],
    edges: ["Z=fB/d", "Sensitivity ∝ 1/d²"],
    caption:
      "Synthetic rectified stereo，一阶小误差近似；实际还包含calibration和occlusion误差。",
  },
  "point-cloud-learning": {
    question: "Point顺序改变，为什么object表示不变？",
    nodes: [
      {
        title: "Shared point features",
        detail: "x=[1,2,3] → h=[(1,1),(2,4),(3,9)]",
      },
      {
        title: "Symmetric pooling",
        detail: "channel max=[3,9]",
      },
      {
        title: "Permute rows",
        detail: "[3,1,2]仍得到[3,9]",
      },
    ],
    edges: ["Apply the same h", "Row order has no effect"],
    caption:
      "Synthetic shared function；permutation invariance不等于rotation或density invariance。",
  },
  "nerf-gaussian-splatting": {
    question: "前面的颜色怎样挡住后面的贡献？",
    nodes: [
      {
        title: "Ray samples",
        detail: "front red α=.5；back blue α=.5",
      },
      {
        title: "Visibility weights",
        detail: "wfront=.5；wback=.5×.5=.25",
      },
      {
        title: "Black-background color",
        detail: "C=(.5,0,.25)；剩余T=.25",
      },
    ],
    edges: ["Front-to-back transmittance", "Weighted compositing"],
    caption:
      "Synthetic两层alpha例子；NeRF与3DGS共享相关合成直觉，但表示和renderer不同。",
  },
  "video-understanding": {
    question: "8帧到底覆盖多长时间、多少tokens？",
    nodes: [
      {
        title: "Sampling policy",
        detail: "30fps；T=8；stride=4",
      },
      {
        title: "Time coverage",
        detail: "indices 0…28；span=.933秒",
      },
      {
        title: "Patch sequence",
        detail: "196 patches/frame → 1568 tokens",
      },
    ],
    edges: ["Use timestamps", "Combine time and space"],
    caption:
      "Synthetic采样与shape计算；长span不保证捕获短事件，token数不等于实际memory。",
  },
  "document-ai-ocr": {
    question: "OCR正确率为什么不能替代field准确率？",
    nodes: [
      {
        title: "Page geometry",
        detail: "1000×2000px；box=(100,200,300,400)",
      },
      {
        title: "Layout coordinates",
        detail: "normalize→(100,100,300,200)",
      },
      {
        title: "Two evaluations",
        detail: "CER=.3不等于field error=.3",
      },
    ],
    edges: ["Retain position and text", "Evaluate structured meaning"],
    caption:
      "Synthetic坐标与CER示例；field value需page evidence，合法格式本身不证明正确。",
  },
};
