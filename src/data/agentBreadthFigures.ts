export type AgentBreadthFigure = {
  question: string;
  nodes: [
    { title: string; detail: string },
    { title: string; detail: string },
    { title: string; detail: string },
  ];
  edges: [string, string];
  caption: string;
};

export const agentBreadthFigures: Record<string, AgentBreadthFigure> = {
  "agent-workflows": {
    question: "每一步看起来可靠，为什么整个 workflow 仍容易失败？",
    nodes: [
      { title: "Local quality", detail: "3 个必要步骤；每步 p=0.95" },
      { title: "All must succeed", detail: "假设独立：0.95×0.95×0.95" },
      { title: "End-to-end", detail: "P(all)=0.857375；检查最终状态" },
    ],
    edges: ["错误可沿依赖链传播", "任务评价不能只看单步"],
    caption:
      "Synthetic independent chain。真实失败可能共享来源，需测量 end-to-end success；该算式不代表某个实际 agent 的表现。",
  },
  "tool-calling-contracts": {
    question: "一个符合 schema 的请求，为什么仍可能不能执行？",
    nodes: [
      { title: "Schema", detail: "query:string；limit=5∈[1,20]" },
      { title: "Authority", detail: "身份、资源、操作 3 项分别检查" },
      {
        title: "Execution",
        detail: "真实 result + postcondition；不是请求 JSON",
      },
    ],
    edges: ["结构正确不授予权限", "通过检查后执行并验证"],
    caption:
      "Toy search_docs contract。Format、semantic validity、authorization 与结果真实性是不同层；所有字段与范围为教学设计。",
  },
  "react-agent-loop": {
    question: "哪一次新 observation 真正改变了下一步？",
    nodes: [
      { title: "Search", detail: "v1:60°C 与 v2:80°C；尚未消除冲突" },
      {
        title: "Read + verify",
        detail: "第 2 次 tool call 核对 v2 型号与原文",
      },
      {
        title: "Evidence-bound answer",
        detail: "80°C + v2 citation；3 次预算余 1",
      },
    ],
    edges: ["版本冲突决定 read action", "真实 observation 支持 claim"],
    caption:
      "Fictional Model X。图表示可观察的 action/observation/state，不表示读取模型的 private reasoning。若 read 失败，80°C 不能作为已核验结论。",
  },
  "planning-search-astar": {
    question: "A* 为什么先选已走成本更高的 A？",
    nodes: [
      { title: "Frontier after S", detail: "A:g=2,h=2；B:g=1,h=5" },
      { title: "Priority f=g+h", detail: "f(A)=4 < f(B)=6 → pop A" },
      { title: "Goal popped", detail: "S→A→G cost=4；另一条路径 cost=7" },
    ],
    edges: ["计入剩余代价估计", "h 合格且实现正确时保留最优性"],
    caption:
      "Toy directed graph，nonnegative edges；使用本课 admissible/consistent h，goal 在 pop 时判断。把 h(A) 改成 100 会破坏该保证。",
  },
  "agent-memory-context": {
    question: "更多 memory 什么时候反而挤掉了当前任务？",
    nodes: [
      { title: "Window", detail: "8192−1024−1024−512=5632 tokens" },
      { title: "Retrieved chunks", detail: "4×900=3600 tokens；剩余 2032" },
      { title: "Overflow check", detail: "7×900=6300；超过可用预算 668" },
    ],
    edges: ["先预留输出、指令与工具", "检索、压缩与时效一起评估"],
    caption:
      "Synthetic measured token counts。External memory 需要检索才能进入 context；不能把词数、token 数或 KV cache 当作同一概念。",
  },
  "hybrid-retrieval-reranking": {
    question: "两份不同尺度的 ranking 怎么融合？",
    nodes: [
      { title: "Two rankings", detail: "Lexical:[A,B,C]；Dense:[B,D,A]" },
      { title: "RRF, k₀=10", detail: "B:1/12+1/11≈0.17424" },
      { title: "Merged pool", detail: "B>A>D>C；A≈0.16783" },
    ],
    edges: ["用 rank 而非原 score 相加", "reranker 只能重排已有候选"],
    caption:
      "Synthetic rankings，rank 从 1 开始，缺席列表贡献 0；k₀=10 是手算设置，原论文实验使用 60。RRF score 不是 relevance probability。",
  },
  "agent-evaluation": {
    question: "至少成功一次，与每次都成功，有多大差别？",
    nodes: [
      { title: "Repeated task runs", detail: "n=5、c=3；每次重置 environment" },
      { title: "At least one", detail: "pass@2=1−C(2,2)/C(5,2)=0.9" },
      { title: "Both successful", detail: "pass²=C(3,2)/C(5,2)=0.3" },
    ],
    edges: ["从已有 runs 估计一次可选成功", "稳定重复执行是更严格事件"],
    caption:
      "Finite-sample combinatorial estimates，来自同一任务的 repeated runs。它们不是把观察率 3/5 当已知真实 p 后算出的 0.84 与 0.36。",
  },
  "agent-security-boundaries": {
    question: "为什么工具返回的文字不能提高自己的权限？",
    nodes: [
      {
        title: "Retrieved content",
        detail: "来源可提供数据；authority 不自动变成 1",
      },
      {
        title: "Execution gate",
        detail: "principal=1, resource=1, operation=0",
      },
      { title: "Enforced result", detail: "1∧1∧0=0 → deny operation" },
    ],
    edges: ["分开 data 与执行指令", "实际权限决定允许范围"],
    caption:
      "Toy access-control conjunction。模型解释、schema-valid arguments 与文档里的命令都不能覆盖真实 authorization；只展示防御性边界。",
  },
  "multi-agent-orchestration": {
    question: "多个 agents 能缩短时间，但会减少总工作吗？",
    nodes: [
      { title: "Independent tasks", detail: "耗时 [2,3,5] 秒；merge=1 秒" },
      { title: "Critical path", detail: "Serial=11 秒；ideal parallel=6 秒" },
      {
        title: "Coordination cost",
        detail: "额外 overhead=7 秒 → parallel=13 秒",
      },
    ],
    edges: ["并行等待最长分支", "通信与冲突可能抵消加速"],
    caption:
      "Synthetic latency example，假设可并行、资源足够。没有额外 overhead 时总处理工作量仍是 11 秒；依赖链、共享写入和 correlated errors 要另外评估。",
  },
  "model-context-protocol": {
    question: "MCP 标准化的是哪一层，哪里还需要应用负责？",
    nodes: [
      { title: "Initialize", detail: "id=1 协商 version/capabilities" },
      { title: "Discover", detail: "initialized 无 id；tools/list id=2" },
      { title: "Call + verify", detail: "tools/call id=3；授权与结果另查" },
    ],
    edges: ["完成 lifecycle 后发现功能", "调用协议不保证工具可信"],
    caption:
      "Pinned MCP 2025-06-18 toy trace，3 个 request-response pairs 加 1 个 notification。该版本用于稳定教学，不声称是 latest，也不代表模型 training 或 multi-agent 协议。",
  },
  "knowledge-graphs-reasoning": {
    question: "一条显式 rule 怎样产生可追溯的多步结论？",
    nodes: [
      { title: "Given facts", detail: "x:Hepatocyte；Hepatocyte⊆Cell⊆Entity" },
      {
        title: "Type propagation",
        detail: "Round 1:+type(x,Cell)；Round 2:+Entity",
      },
      { title: "Fixed point", detail: "x 共 3 个 types；新增 2 个 type facts" },
    ],
    edges: ["使用同一个已声明 type rule", "无新 fact 时停止"],
    caption:
      "Toy Entity 是 BiologicalEntity 的缩写；仅启用本课 type-propagation rule。逻辑有效性依赖 facts/rules；open-world 下 missing 不等于 false。",
  },
  "agent-reliability-budgets": {
    question: "更多 retries 提高成功率的代价是什么？",
    nodes: [
      { title: "One attempt", detail: "p=0.8；q=0.2；最多 3 attempts" },
      { title: "One step", detail: "Success=1−0.2³=0.992；E[N]=1.24" },
      {
        title: "Five-step chain",
        detail: "All success≈0.9606；early-stop calls≈6.102",
      },
    ],
    edges: ["成功就停，最多 retry 2 次", "先前失败会阻止后续 steps"],
    caption:
      "Synthetic independent, constant-p model；chain 在首次永久失败后停止。Shared outage、deterministic errors 或不安全写操作不满足这些假设，不能直接套用结果。",
  },
};
