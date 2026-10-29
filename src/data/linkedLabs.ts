export type LinkedLab = {
  id: string;
  href: string;
  lessons: string[];
  label: string;
  hint: string;
};
export const linkedLabs: LinkedLab[] = [
  {
    id: "hmm",
    href: "#/ai-depth?lab=hmm",
    lessons: ["hidden-markov-models"],
    label: "Transition / emission probabilities",
    hint: "逐步比较 Filtering、Smoothing 与 Viterbi；观察未来证据改变了什么。",
  },
  {
    id: "kalman",
    href: "#/ai-depth?lab=kalman",
    lessons: ["kalman-filtering"],
    label: "Q / R / measurement shock",
    hint: "改变噪声假设，检查 prediction、innovation、gain 和 posterior variance。",
  },
  {
    id: "assignment",
    href: "#/ai-depth?lab=assignment",
    lessons: ["hungarian-set-matching"],
    label: "Appearance cost weight",
    hint: "真实执行 Hungarian potentials 与 augmenting paths，比较 Greedy 与全局最优。",
  },
  {
    id: "geometry",
    href: "#/ai-depth?lab=geometry",
    lessons: ["cv-preprocessing-augmentation"],
    label: "Resize / padding / flip",
    hint: "同步变换 box，并逐步还原原坐标；直接看到漏掉 padding 或 flip 的错误。",
  },
  {
    id: "mcts",
    href: "#/ai-depth?lab=mcts",
    lessons: ["mcts-uct-search"],
    label: "Exploration / simulation budget",
    hint: "每次模拟按 Selection、Expansion、Rollout、Backup 推进，追踪 N、W、Q。",
  },
  {
    id: "beam",
    href: "#/ai-depth?lab=beam",
    lessons: ["beam-search-decoding", "grammar-constrained-decoding"],
    label: "Beam width / grammar mask",
    hint: "对比 Greedy 与 Beam Search 的序列概率，观察 grammar 如何改变可输出 token。",
  },
  {
    id: "tree",
    href: "#/ai-labs?lab=tree",
    lessons: ["decision-tree-splits"],
    label: "Threshold / minimum leaf size",
    hint: "真实计算每个 candidate split 的 impurity gain 与合法性。",
  },
  {
    id: "astar",
    href: "#/ai-labs?lab=search",
    lessons: ["planning-search-astar"],
    label: "Heuristic weight",
    hint: "逐步查看 frontier、g/h/f，比较 search effort 与路径 cost。",
  },
  {
    id: "nms",
    href: "#/ai-labs?lab=nms",
    lessons: ["detection-metrics-nms"],
    label: "IoU / score / class rule",
    hint: "拖动 box 并逐步 suppression，区分三个 threshold 的用途。",
  },
  {
    id: "rrf",
    href: "#/ai-labs?lab=retrieval",
    lessons: ["hybrid-retrieval-reranking"],
    label: "Candidate depth / RRF k",
    hint: "分别核算两种检索的 contribution，检查 candidate recall 上限。",
  },
  {
    id: "reliability",
    href: "#/ai-labs?lab=reliability",
    lessons: ["agent-reliability-budgets"],
    label: "Retries / correlated outage",
    hint: "比较成功率与 early-stop expected calls，避免把共同故障当独立重试。",
  },
  {
    id: "bio-em",
    href: "#/bio-algorithms?lab=em",
    lessons: [
      "em-objective-diagnostics",
      "count-mixture-background",
      "bio-count-vae",
    ],
    label: "Count mixture / background",
    hint: "跟踪 Poisson responsibilities、sufficient statistics 与 likelihood。",
  },
  {
    id: "bio-planning",
    href: "#/bio-algorithms?lab=planning",
    lessons: ["structured-assignment-inference", "spatial-mdp-design"],
    label: "Assignment constraints / future cost",
    hint: "比较局部 assignment 与后续代价，判断是否真的需要 sequential decision。",
  },
  {
    id: "bio-gae",
    href: "#/bio-algorithms?lab=gae",
    lessons: ["reward-shaping-constraints", "spatial-policy-ope"],
    label: "GAE λ / terminal handling",
    hint: "逐步比较 TD residual、bootstrap 与 advantage。",
  },
  {
    id: "bio-gcn",
    href: "#/bio-algorithms?lab=gcn",
    lessons: [
      "bio-graph-construction",
      "bio-gcn-propagation",
      "bio-graphsage-sampling",
    ],
    label: "Graph edges / propagation depth",
    hint: "观察 normalized message passing 如何跨组织边界混合 signals。",
  },
  {
    id: "bio-gat",
    href: "#/bio-algorithms?lab=gat",
    lessons: ["bio-gat-attention"],
    label: "Neighbor logits / temperature",
    hint: "比较局部 attention weights 与 edge contributions；weight 不是因果证据。",
  },
  {
    id: "bio-contrastive",
    href: "#/bio-algorithms?lab=contrastive",
    lessons: ["bio-contrastive-design"],
    label: "Positive pairs / false negatives",
    hint: "追踪 InfoNCE、pair 选择与 donor confounding 的影响。",
  },
];
export const linkedLabForLesson = (id: string) =>
  linkedLabs.find((l) => l.lessons.includes(id));
