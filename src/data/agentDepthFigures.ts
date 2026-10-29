import type { AgentBreadthFigure } from "./agentBreadthFigures";

export const agentDepthFigures: Record<string, AgentBreadthFigure> = {
  "mcts-uct-search": {
    question: "为什么平均回报更低的B值得再模拟一次？",
    nodes: [
      { title: "Tree statistics", detail: "root N=10；A:N8,Q.6；B:N2,Q.4" },
      { title: "Selection", detail: "c=1：UCT(A)=1.1365，B=1.4730" },
      { title: "Backup", detail: "B得G=.9 → N3,W1.7,Q=.5667" },
    ],
    edges: ["探索项偏向信息不足分支", "一次simulation只回传一次return"],
    caption:
      "Synthetic单人、bounded-return快照；selection用UCT，最终执行动作按预先声明root rule。这里max-visits仍选A，UCT不是动作成功概率。",
  },
  "contextual-bandits-linucb": {
    question: "熟悉方向上的信息能替代新context吗？",
    nodes: [
      { title: "Direction x=[1,0]", detail: "A:mean=.5,sd=.5；B:mean=0,sd=1" },
      { title: "Explore with α=1.2", detail: "scores A=1.1，B=1.2 → 选B" },
      { title: "Only chosen update", detail: "B收到r=1：A=diag(2,1)，b=[1,0]" },
    ],
    edges: ["预测与uncertainty共同排序", "未选arm与未测方向不自动更新"],
    caption:
      "Synthetic disjoint LinUCB，λ=1。x=[0,1]仍无reward信息；score可大于1，不是概率。原argmax policy也不自动提供非零logged propensity。",
  },
  "beam-search-decoding": {
    question: "为什么先选最可能的A，最终反而错过By？",
    nodes: [
      { title: "First token", detail: "A=.6，B=.4；beam2同时保留" },
      { title: "Expand both", detail: "Ax=.306，Ay=.294，Bx=.04，By=.36" },
      { title: "Global prune", detail: "保留By与Ax；raw score选择By=.36" },
    ],
    edges: [
      "每条边用其prefix的conditional概率",
      "全局top-B，不是每个parent各留B个",
    ],
    caption:
      "Synthetic两内容tokens后EOS=1，固定长度、无length penalty。Greedy只能得到Ax=.306；此处更高model probability并不证明更高事实正确率。",
  },
  "grammar-constrained-decoding": {
    question: "合法下一步怎样改变模型给出的概率？",
    nodes: [
      { title: "Model distribution", detail: "[0,1,x,EOS]→[.1,.2,.6,.1]" },
      { title: "Allowed prefix", detail: "只允许0/1；保留质量Z=.3" },
      { title: "Masked sampling", detail: "[1/3,2/3,0,0]；满两位才允许EOS" },
    ],
    edges: ["逐token检查能否合法继续", "归一化改变sampling distribution"],
    caption:
      "Synthetic two-bit grammar，不是完整SQL/JSON parser实现。Local mask通常不同于全局conditional-on-valid sampling；grammar validity也不能替代字段事实与authorization。",
  },
  "speculative-decoding": {
    question: "为什么拒绝草稿后不能直接从target再抽一次？",
    nodes: [
      { title: "Proposal + target", detail: "q=[.2,.5,.3]；p=[.5,.3,.2]" },
      { title: "Accepted mass", detail: "min(p,q)=[.2,.3,.2]；reject=.3" },
      { title: "Residual correction", detail: "+.3×[1,0,0] → [.5,.3,.2]=p" },
    ],
    edges: ["接受概率为min(1,p/q)", "补回target相对draft不足的质量"],
    caption:
      "Synthetic共享token space、同prefix概率表。接受质量加residual恢复target distribution；这不表示相同seed文本逐字一致，也不自动证明有硬件加速。",
  },
  "agent-state-checkpoints": {
    question: "本地没记成功，为什么不能直接重新写一遍？",
    nodes: [
      { title: "Before crash", detail: "2s+3s+5s；服务已写K，本地outcome未知" },
      { title: "Recovery", detail: "查询K receipt 1s，再verify 1s" },
      {
        title: "Verified result",
        detail: "总12s、1个effect；新key重跑21s、2个",
      },
    ],
    edges: ["Checkpoint与外部receipt分别核对", "稳定identity连接同一逻辑操作"],
    caption:
      "Synthetic durations/effect ledger。仅此trace中receipt确认成功；checkpoint不自动提供跨服务exactly-once。未知结果与不支持去重的服务需专门对账。",
  },
};
