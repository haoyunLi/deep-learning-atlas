type BioGraphFigure = {
  question: string;
  nodes: [
    { title: string; detail: string },
    { title: string; detail: string },
    { title: string; detail: string },
  ];
  edges: [string, string];
  caption: string;
  lab: "em" | "planning" | "gae" | "gcn" | "gat" | "contrastive";
};

export const bioGraphFigures: Record<string, BioGraphFigure> = {
  "bio-graph-construction": {
    question: "Physical distance 与 feature similarity 会选择同一条 edge 吗？",
    nodes: [
      { title: "Coordinates", detail: "A/B/C 位于 0/3/10 μm；同一 section" },
      { title: "Radius = 4 μm", detail: "只连 A—B；C 无邻居，d(B,C)=7" },
      { title: "Graph prior", detail: "Feature=[0,10,0.1] 时 A/C 更像" },
    ],
    edges: ["按距离建边", "对照 feature graph"],
    caption:
      "Synthetic graph-design example：coordinates 与 expression 指向不同邻域；不存在通用正确 graph。Physical edges 限于同一有效 section 坐标系统。关联 GCN lab 展示换边后的 propagation，不模拟真实组织。",
    lab: "gcn",
  },
  "bio-gcn-propagation": {
    question: "Self-loop 能保证 boundary contrast 不被抹掉吗？",
    nodes: [
      { title: "Boundary input", detail: "两个相连 nodes：x=[0,10]" },
      { title: "GCN mixing", detail: "A+I 后 S 各项为 1/2；Sx=[5,5]" },
      { title: "Residual α=0.8", detail: "0.8x+0.2Sx=[1,9]；contrast=8" },
    ],
    edges: ["Symmetric normalization", "保留 self-feature"],
    caption:
      "Synthetic linear operator：W=I、无 activation。图中 residual 只是明确的混合公式，不代表所有 trained GCN。Lab 使用另一张小图检查 edge/self-loop/depth；平滑是否有益需独立 biological validation。",
    lab: "gcn",
  },
  "bio-gat-attention": {
    question: "最高 attention 的 edge 一定贡献最大吗？",
    nodes: [
      { title: "Edge inputs", detail: "logits=[ln2,0,0]；messages=[1,4,0]" },
      { title: "Local softmax", detail: "τ=1；weights=[0.5,0.25,0.25]" },
      { title: "Message sum", detail: "贡献=[0.5,1,0]；output=1.5" },
    ],
    edges: ["exp / sum(exp)", "weight × message"],
    caption:
      "Synthetic GAT aggregation stage，使用给定 logits/messages；没有训练 attention 参数。第二条 edge 权重较低却贡献更大。Attention 的局部竞争与 causal cell–cell signaling 是不同概念。",
    lab: "gat",
  },
  "bio-graphsage-sampling": {
    question: "节省计算时，rare niche evidence 有多大机会被漏掉？",
    nodes: [
      { title: "Neighborhood", detail: "20 neighbors 中仅 1 个 rare neighbor" },
      { title: "Sample 5", detail: "均匀无放回；P(miss)=15/20=75%" },
      { title: "Sample 10", detail: "P(miss)=50%；成本随 fanout 上升" },
    ],
    edges: ["限制 fanout", "比较 coverage 与成本"],
    caption:
      "Synthetic sampling calculation，只计算单次遗漏概率，未模拟训练效果。GraphSAGE mean/self aggregation 与关联 GCN lab 的 symmetric normalization 不同；该 lab 仅帮助比较缺少邻居时的传播变化。",
    lab: "gcn",
  },
  "bio-count-vae": {
    question: "Counts 翻倍能否只由 library scale 改变解释？",
    nodes: [
      { title: "Count model", detail: "ρ₁=0.2，s=10，θ₁=4 → μ₁=2" },
      { title: "NB variance", detail: "Var=2+2²/4=3；P(0)≈0.1975" },
      { title: "Double library", detail: "s=20 → μ₁=4、Var=8；ρ₁不变" },
    ],
    edges: ["μ=sρ", "改变 scale，固定 state"],
    caption:
      "Synthetic NB example，固定 observed library 与 inverse dispersion，未拟合 scVI。关联 EM lab 仅作 latent-variable inference 对照：EM responsibilities 与 VAE posterior/ELBO 是不同对象，不能用该 lab 视作 Count VAE 复现。",
    lab: "em",
  },
  "bio-contrastive-design": {
    question: "新增一个 false negative 为什么会让 loss 上升？",
    nodes: [
      { title: "Pair scores", detail: "exp(s/τ)：positive=2；negatives=1,1" },
      { title: "InfoNCE", detail: "p⁺=2/4=0.5；loss=ln2≈0.693" },
      { title: "False negative", detail: "再加入值2：p⁺=2/6；loss=ln3≈1.099" },
    ],
    edges: ["Local denominator", "相似 cell 被错误推远"],
    caption:
      "Synthetic single-positive InfoNCE；新增 negative 改变 objective，不能按 loss 大小直接比较 biological quality。Positive/negative 定义依任务；不等于 GraphST 或所有 Single-cell contrastive methods 的具体 loss。",
    lab: "contrastive",
  },
};
