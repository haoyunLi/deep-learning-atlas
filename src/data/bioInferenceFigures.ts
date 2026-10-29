export const bioInferenceFigures: Record<
  string,
  {
    question: string;
    nodes: [
      { title: string; detail: string },
      { title: string; detail: string },
      { title: string; detail: string },
    ];
    edges: [string, string];
    caption: string;
    lab: "em" | "planning" | "gae" | "gcn" | "gat" | "contrastive";
  }
> = {
  "em-objective-diagnostics": {
    question: "一轮 EM 怎样把 latent weights 变成参数更新？",
    nodes: [
      { title: "Observed X", detail: "x=[0,2]；μ=[0,2]；variance=1" },
      { title: "E-step R", detail: "第一 row=[0.880797,0.119203]" },
      { title: "M-step μ", detail: "新 μ=[0.238406,1.761594]" },
    ],
    edges: ["π=0.5；normalized Gaussian scores", "N₁=N₂=1；weighted means"],
    caption:
      "Synthetic fixed-variance GMM：log likelihood 从 −2.970315 升至 −2.886563。下方 Count EM lab 演示另一 observation model；二者都可用 EM，但数值与 latent meaning 不同。",
    lab: "em",
  },
  "count-mixture-background": {
    question: "第二 gene 的 count 增多，是否一定意味着 cell type 改变？",
    nodes: [
      { title: "Cell + ambient", detail: "φ=[0.9,0.1]；b=[0.2,0.8]" },
      { title: "Mixed profile", detail: "α=0.2 → p=[0.76,0.24]" },
      { title: "Expected counts", detail: "s=10 → μ=[7.6,2.4]" },
    ],
    edges: ["0.8φ+0.2b", "Expected G2 ambient count=1.6"],
    caption:
      "Synthetic contamination model。Expected molecule source、categorical cell posterior 与 multi-cell abundance 是不同 outputs；soft allocations 不是已观测的 molecule labels。",
    lab: "em",
  },
  "structured-assignment-inference": {
    question: "Capacity 为什么会改变一个 bin 的 posterior？",
    nodes: [
      { title: "Local weights", detail: "bin1=[0.6,0.4]；bin2=[0.9,0.1]" },
      { title: "Feasible pairs", detail: "AB weight=0.06；BA weight=0.36" },
      { title: "Joint posterior", detail: "P(AB)=1/7；P(BA)=6/7" },
    ],
    edges: ["每 cell 一个 unit；排除 AA/BB", "Normalize by 0.42；MAP=BA"],
    caption:
      "仅为 one-to-one toy。真实 transcript-to-cell 常为 many-to-one；MAP、marginal posterior 与 transport plan 不能互换。Planning lab 使用独立的 score objective。",
    lab: "planning",
  },
  "spatial-mdp-design": {
    question: "延迟收益什么时候值得等？",
    nodes: [
      { title: "Two choices", detail: "A rewards=[3]；B rewards=[0,5]" },
      { title: "Discount", detail: "γ=0.9 → G(A)=3；G(B)=4.5" },
      { title: "Decision", detail: "选 B；若 γ=0.5 则选 A" },
    ],
    edges: ["G=Σγᵗr_t", "改变 γ 会改变目标排序"],
    caption:
      "已知 tiny transitions 可以直接枚举。Static coupling 不等于必须 RL；learned solver 需要在未见实例上比较 quality、constraint violations 与 compute。",
    lab: "planning",
  },
  "reward-shaping-constraints": {
    question: "过程奖励如何保持同一初态的 policy ranking？",
    nodes: [
      { title: "Base path", detail: "r=[0,5]；Φ=[2,3,0]；γ=0.9" },
      { title: "Shaping F", detail: "γΦ(next)−Φ(now)=[0.7,−3]" },
      { title: "Return", detail: "G′=2.5=G−2；terminal Φ=0" },
    ],
    edges: ["r′=[0.7,2]", "0.7+0.9×2=2.5"],
    caption:
      "固定 potential、相同 discount 与正确 terminal 边界是关键。保持 base reward ranking 并不证明 proxy 代表 biology；GAE lab 另检查 terminal 与 truncation 的 bootstrap。",
    lab: "gae",
  },
  "spatial-policy-ope": {
    question: "四条旧 logs 对新 policy 有多少支持？",
    nodes: [
      { title: "Logged actions", detail: "A,B,B,B；rewards=[4,1,1,1]" },
      { title: "Policy ratios", detail: "μ(A)=0.25 → weights=[2,⅔,⅔,⅔]" },
      { title: "IPS / ESS", detail: "π(A)=0.5 → IPS=2.5；ESS=3" },
    ],
    edges: ["π(B)/μ(B)=0.5/0.75", "(8+2)/4=2.5；16/(16/3)=3"],
    caption:
      "Synthetic one-step fixture。Zero support 或 changed environment 不能靠权重修复；GAE lab 只检查 value bookkeeping，不是 OPE 或真实策略收益证明。",
    lab: "gae",
  },
};
