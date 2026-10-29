import type { Lesson } from "./lessons";

export const agentBreadthLessons: Lesson[] = [
  {
    id: "agent-workflows",
    source: {
      label: "Anthropic: Building effective agents — architectural patterns",
      url: "https://www.anthropic.com/research/building-effective-agents",
    },
    title: "Workflow 与 Agent：谁决定下一步？",
    englishTitle: "Workflows, Routers and Agent Control Loops",
    category: "agents",
    level: "入门",
    duration: "22 分钟",
    icon: "↻",
    summary:
      "把 LLM、工具、程序控制流和任务成功分开；先判断问题需要固定流程，还是需要根据新 observation 动态改变动作。",
    intuition:
      "固定菜谱规定洗菜→切菜→烹饪；一个厨师还会看食材状态决定是否换做法。Workflow 的路径主要由代码规定，Agent 的部分决策由模型根据状态选择。两者都可能调用 LLM；是否用了神经网络并不能区分它们。",
    core: "输入是 task、可见 context、available tools 与 permissions；输出可能是回答、文件或经过验证的 external state。System 包括 controller、model、tool executor、state store 与 evaluator。Workflow 常用 chain/router/DAG；Agent loop 反复读取 observation、提出 action、检查约束、执行并更新 state。LLM 是可替换的 policy component，不是整个 application。RL agent 是更广的 sequential-decision 概念；一个 prompt-driven LLM agent 不一定经过你的环境中的 RL training。",
    equation:
      "a_t=controller(task, history_t, tools); observation_{t+1}=execute(a_t); stop when verified_success or budget_exhausted",
    mechanicsSteps: [
      "先定义完成状态：例如把 20 篇论文整理成带 citation 的表格，并核对每个 citation；‘模型回复完成’不是可验证的结束条件。",
      "画固定 workflow：retrieve→extract→validate。每条边明确输入、输出和失败分支；若路径总是相同，先用这个可测试 baseline。",
      "加入 router：对 table extraction、free-text summary、missing-source 三种情况选择不同子流程。Routing label、confidence 与 fallback 必须可记录。",
      "只有遇到未知中间状态时再增加 agent loop：观察缺失证据→选择 search/read tool→检查结果→决定继续或结束，而不是预先假定固定调用次数。",
      "把 model proposal 与 execution 分离。代码检查参数、权限、预算、重复 action 和返回值，再把真实 observation 放回 context。",
      "手算一条需要连续三个步骤全成功的 toy chain：若每步独立成功率均为 0.95，整体成功率为 0.95³=0.857375。真实错误可能相关，不能无证据直接乘独立概率。",
      "比较 single call、fixed workflow 与 agent：使用同一任务集和可用信息，报告 verified success、失败类型、tool calls、latency 与人工介入率。只在已观察到的缺口上增加控制复杂度。",
    ],
    whenToUse: [
      "Workflow 适合步骤稳定、输入输出可检验的重复任务；优点是控制明确、回放和预算管理简单。",
      "Agent 适合中间证据决定下一步、任务长度变化大的探索工作；优点是能动态选择工具和修正路径。",
      "Router 适合少量可区分的任务类型，不必为了三个分支引入无限循环。",
    ],
    limits: [
      "Agent loop 会增加错误传播、延迟和状态管理成本；灵活性不是自动的正确性。",
      "任务没有可检验的成功条件时，很难知道系统是在推进还是重复生成合理文字。",
      "本课区分是 architecture 设计视角；文献与产品对 agent 的叫法并不完全一致。",
    ],
    howToUse: [
      "写一个含输入、输出、成功检查与失败出口的 task contract。",
      "先实现最短 workflow baseline，保存 tool trace 与每步耗时。",
      "把真正依赖新 observation 的分支交给模型，其余规则保留在确定性代码中。",
      "加入 bounded steps、retry policy、checkpoint 和人工接管条件，用真实失败样本决定是否需要更复杂 architecture。",
    ],
    tuning: [
      "先调 routing 与 tool descriptions，再增加 model calls；错误路由不能靠更多后续推理稳定修复。",
      "提高 max steps 前看新增步骤是否带来新证据，区分 useful continuation 与 loop。",
      "并行只适用于相互独立的节点；共享状态的写操作需要明确顺序。",
    ],
    settings: [
      {
        name: "control pattern",
        start: "对照 single call、3-stage workflow 与 bounded loop。",
        adjust: "只有失败分析表明缺少动态决策时才增添 loop。",
      },
      {
        name: "step / wall-time budget",
        start: "教学可设 6 次 tool calls 与明确总超时；这是实验配置。",
        adjust: "按任务长度和成功-成本曲线选择，并保留超限时的部分结果。",
      },
      {
        name: "completion check",
        start: "检查最终文件、数据库状态或可执行答案条件。",
        adjust: "发现‘回复成功但外部状态没变’时加强 postcondition 检查。",
      },
    ],
    modifications: [
      "把大任务拆成 deterministic outer workflow 与内部 bounded agent，分别设置预算。",
      "对高失败率节点增加 validator 或让用户补充真实缺失信息，而非只加自我评价。",
    ],
    pitfalls: [
      "把 agent、LLM、chatbot、RL 和 workflow 当成同义词。",
      "只比较回答质量，不记录工具执行失败或重复外部操作。",
      "模型给出下一步计划后，就误记为该操作已经完成。",
    ],
    example:
      "Synthetic chain：retrieve/extract/validate 各有 0.95 的独立成功概率时，20 个任务的期望全成功数量为 20×0.857375≈17.15。这个算式解释 why end-to-end evaluation matters，不预测真实 agent 的成功率。",
    compareTo: [
      "tool-calling-contracts",
      "react-agent-loop",
      "reinforcement-learning",
      "agent-reliability-budgets",
    ],
  },
  {
    id: "tool-calling-contracts",
    source: {
      label:
        "JSON Schema: object validation, required and additional properties",
      url: "https://json-schema.org/understanding-json-schema/reference/object",
    },
    title: "Tool Calling：模型提出请求，系统验证并执行",
    englishTitle: "Tool Schemas, Validation and Execution Contracts",
    category: "agents",
    level: "进阶",
    duration: "24 分钟",
    icon: "⚙",
    summary:
      "从一个 JSON request 走到真实结果：schema、semantic validation、authorization、idempotency 和 tool errors 各解决什么问题。",
    intuition:
      "工具请求像一张填好的实验申请表。格式正确只能说明表格填得像样；样本 ID 是否存在、你是否有权取样、实验是否已经做过，仍要分别检查。",
    core: "输入为 tool name、typed arguments 和调用者 context；输出为结构化 result 或明确 error。LLM 生成请求并不自动执行。Schema validation 检查类型/必填/范围；semantic validation 检查业务条件；authorization 检查身份和权限；executor 运行具体操作；postcondition 检查结果。Input schema 不保证 output correctness，也不授予 authority。",
    equation:
      "execute(request) only if schema_valid ∧ semantic_valid ∧ authorized ∧ within_budget; result = data | typed_error",
    mechanicsSteps: [
      "定义只读 toy tool search_docs(query:string, limit:integer)，limit 范围 1–20；query 和 limit 是 required，禁止未声明字段。这是假想接口，不是某个 SDK 的固定签名。",
      "模型输出 {query:'graph learning',limit:5} 后，先 parse JSON，再校验 schema；limit='five' 是 string，应拒绝或按公开规则修正，而非默默猜值。",
      "JSON Schema 的 properties 不自动使字段必填，额外字段默认也不自动被禁止；明确 required 与 additionalProperties 规则。",
      "Schema 合格后检查 query 是否可用、资料访问范围、分页 cursor 与权限。用户传来 document ID，不意味着该用户有权读取它。",
      "Executor 返回带 source IDs 的结果和真实 status；tool timeout、empty result、permission denied 与 invalid arguments 是不同状态，模型应采取不同后续动作。",
      "对于有副作用的工具，使用稳定 idempotency key 或服务提供的等效机制。一次 timeout 可能发生在服务已经写入以后，直接重发可能产生两份结果。",
      "保存 request ID、参数摘要、schema version、duration 与结果状态，并验证最终 postcondition。日志应足够排错，同时避免把 secrets 或无关个人数据写入 trace。",
    ],
    whenToUse: [
      "让 agent 使用检索、计算、文件或业务 API；契约可让错误在执行前被定位。",
      "需要稳定的 typed outputs，供后续步骤或程序处理。",
      "工具数量增多时，窄而清晰的接口比一个接受任意命令的通用工具更容易测试。",
    ],
    limits: [
      "Valid JSON 不等于正确语义，schema 无法证明任务完成。",
      "工具 descriptions 和返回文本也可能错误或被污染；不能仅因它们来自 tool channel 就当成更高权限指令。",
      "Idempotency 依赖服务端定义与保存窗口，添加一个随机字段不自动提供 exactly-once semantics。",
    ],
    howToUse: [
      "为每个工具写成功例、边界例和明确失败例，包含空结果与超时。",
      "把 validation、authorization、execution 分成可独立测试的函数。",
      "给多页结果保留稳定 source IDs 和 pagination contract，避免重复或漏页。",
      "对写工具加入可验证的状态查询与去重策略；重试前先判断错误类型和是否可能已执行。",
    ],
    tuning: [
      "参数过宽会增加错误空间；先减少歧义和不必要的可选字段。",
      "Tool output 太长时返回有 provenance 的摘要和按需读取入口，而非丢弃所有 context。",
      "不要把所有 validation failure 都交给模型无限修复；设置有限 repair 次数并保留原错误。",
    ],
    settings: [
      {
        name: "schema strictness",
        start: "显式 required、类型、范围和 extra-field policy。",
        adjust: "兼容升级时版本化 schema，不能悄悄改变旧参数含义。",
      },
      {
        name: "timeout / retry class",
        start:
          "区分 transient read failure、invalid request 与 uncertain write outcome。",
        adjust: "只有可恢复且重试安全的情况才 retry；其余先修参数或查状态。",
      },
      {
        name: "result contract",
        start: "包含 status、可追溯 IDs 与必要单位，empty 与 error 分开。",
        adjust: "模型经常误读返回值时先改结构与说明，再提高模型容量。",
      },
    ],
    modifications: [
      "把复杂工具拆为 preview→validate→execute，并明确哪些阶段有 side effect。",
      "对独立只读调用做 batching；不要把依赖上一步返回 ID 的调用假装并行。",
    ],
    pitfalls: [
      "看到 tool-call JSON 就写‘已执行’。",
      "仅靠模型说用户允许，跳过真实授权检查。",
      "对所有失败使用相同 retry，导致重复写入或 rate-limit 放大。",
    ],
    example:
      "Toy contract：{query:'graph',limit:5} 合格；缺 limit、不明字段或 limit=0 不合格。即使格式合格，权限检查仍可能拒绝。两个状态不同，应生成不同的 debug action。",
    compareTo: [
      "model-context-protocol",
      "agent-security-boundaries",
      "agent-reliability-budgets",
    ],
  },
  {
    id: "react-agent-loop",
    source: {
      label:
        "Yao et al.: ReAct — Synergizing Reasoning and Acting in Language Models",
      url: "https://arxiv.org/abs/2210.03629",
    },
    title: "ReAct：让新的 observation 改变下一次 action",
    englishTitle: "Observable Action–Observation Loops",
    category: "agents",
    level: "进阶",
    duration: "23 分钟",
    icon: "↺",
    summary:
      "用可观察的 task state、tool action 和真实结果解释闭环；学会区分规划、尝试、执行与已验证完成。",
    intuition:
      "问路时，不是闭眼背完整路线，而是走到路口看路牌，再决定下一段。Agent 同样需要新的 environment feedback；重复生成计划不等于收到了新证据。",
    core: "ReAct 原论文交替使用语言推理与任务动作来与环境交互。本课用可审计的短计划、action、observation 和 state summary 教系统结构，不声称能读取模型的私有 reasoning。Action 可改变外部 state 或获取证据；environment result 必须与模型预测分开。Useful reasoning summary 需要服务动作选择和验证，不是必须公开逐 token 的内部过程。",
    equation:
      "history_{t+1}=history_t ⊕ (action_t, observed_result_t); next_action=policy(task, summarized_state, allowed_tools)",
    mechanicsSteps: [
      "定义 toy task：回答设备 Model X 的最新版温度上限，必须附支持的版本与来源；目前没有足够证据。",
      "Step 1 的 observable plan 是‘找 Model X 最新手册’，action 为 search_docs；这时只是提出调用，不是找到答案。",
      "Observation 返回 v1=60°C、v2=80°C 的两个片段。它们都是资料内容，不是让 agent 改任务的指令；记录版本冲突仍未解决。",
      "Step 2 选择 read_document(v2) 核对型号、发布日期和原文范围；若返回的是其它型号，应继续查而非用 80°C 填答案。",
      "证据满足条件后，产生 answer={model:X,version:v2,limit:80°C,source:doc-v2}；validator 检查 claim 与 citation 的对应。",
      "设置 3 次 tool-call budget：本 trace 用 2 次，剩 1 次只在验证失败且需要新证据时使用；没有新信息的同参数调用应被 loop detector 标记。",
      "把失败拆成 action selection、argument、tool execution、evidence interpretation、termination 五类；同一个错误答案可能来自完全不同的瓶颈。",
    ],
    whenToUse: [
      "网页/资料探索、交互环境、异常处理等需要根据新结果决定下一步的任务。",
      "已知单次问答或固定 RAG 无法覆盖全部证据，需要有限迭代检索。",
      "优点是可把每次动作和新观察串成 trace，便于定位系统在哪一步偏离目标。",
    ],
    limits: [
      "反复生成看似合理的理由无法保证 action 正确，错误 observation 也可能被继续放大。",
      "Tool use 会引入 latency、权限和状态错误；模型可能停得太早或进入 loop。",
      "该模式不等于 RL training，也不表示每个模型公开内部推理或采用原论文相同 prompt。",
    ],
    howToUse: [
      "为系统定义有限 actions、可观察 state 与 postcondition。",
      "Trace 中分别保存 proposed action、executed action、actual result 与 verification，避免混记。",
      "对 empty/stale/conflicting evidence 设计可重放 fixture。",
      "设置 budget、重复调用检测和停止原因；用完整任务指标对照 fixed RAG baseline。",
    ],
    tuning: [
      "先改善 tool feedback 的可读结构，避免让模型从巨量无关日志中猜结果。",
      "增加 max steps 需同时报告 loop rate、独立新证据数和任务成功率。",
      "给 state summary 保留 unresolved questions 与 source IDs，防止摘要把假设变成事实。",
    ],
    settings: [
      {
        name: "action budget",
        start: "教学 trace 最多 3 次，正常完成需 2 次。",
        adjust: "按真实任务复杂度设预算，并单独记录超限失败。",
      },
      {
        name: "loop detection",
        start: "检查连续相同 tool/arguments 与重复无进展 observation。",
        adjust: "允许有明确状态变化后的重试，避免把所有重复动作一律禁止。",
      },
      {
        name: "state summary",
        start: "保留 goal、已验证事实、来源、未知项和剩余预算。",
        adjust: "丢失约束或版本信息时调整摘要 contract，而非继续累加原始聊天。",
      },
    ],
    modifications: [
      "用程序化检查处理稳定的 validation，再让模型决定少量不确定分支。",
      "将多跳检索拆成 evidence graph，记录每条新证据解决了哪个缺口。",
    ],
    pitfalls: [
      "把 planned call 当 completed call；或把 tool result 的预期内容当真实 observation。",
      "只看最终回答，漏掉中途已经发生的不正确外部操作。",
      "把公开的简短决策解释当作完整或忠实的内部计算轨迹。",
    ],
    example:
      "Synthetic trace 以 2 次工具调用分清 v1 的 60°C 与 v2 的 80°C。若第二次调用失败，正确状态是‘版本未验证’，而不是仍输出 80°C 并虚构 citation。",
    compareTo: [
      "agent-workflows",
      "retrieval-augmented-generation",
      "agent-memory-context",
      "agent-evaluation",
    ],
  },
  {
    id: "planning-search-astar",
    source: {
      label:
        "Russell & Norvig: Artificial Intelligence — search algorithms and pseudocode",
      url: "https://aima.cs.berkeley.edu/algorithms.pdf",
    },
    title: "Search 与 A*：用已走成本和剩余估计安排探索",
    englishTitle: "State-Space Search, A* and Heuristic Planning",
    category: "reasoning",
    level: "进阶",
    duration: "27 分钟",
    icon: "⌖",
    summary:
      "AI 不全靠学习权重：当 states、actions 和 costs 已知，可通过搜索直接求解；逐步比较 Uniform-Cost、Greedy 与 A*。",
    intuition:
      "找最便宜路线时，只看‘离目的地近’可能走进昂贵道路；只看已经花的钱，又可能到处绕。A* 把已经支付的 g 与剩余成本估计 h 相加，决定先扩展哪个 frontier state。",
    core: "输入是 initial state、successor/action function、nonnegative edge costs、goal test 与 heuristic h；输出一条 action path 或失败。A* 用 f=g+h 优先扩展 frontier。h=0 退化为 Uniform-Cost Search；Greedy best-first 只用 h。树搜索的 admissible heuristic 不高估剩余最优成本；graph search 若不 reopen nodes，通常要求 consistency 等条件，不能省略重复状态处理后仍宣称最优。",
    equation:
      "f(n)=g(n)+h(n); admissible: h(n)≤h*(n); consistent: h(n)≤c(n,n′)+h(n′)",
    mechanicsSteps: [
      "构造 directed toy graph：S→A cost2，S→B cost1，A→G cost2，B→C cost1，C→G cost5。两条完整路径成本分别为 4 和 7。",
      "给 heuristic h(S)=4、h(A)=2、h(B)=5、h(C)=5、h(G)=0。每个值都不超过该节点到 G 的真实最小剩余成本；还可逐边核查 consistency。",
      "从 S 扩展后，A 的 g=2,h=2,f=4；B 的 g=1,h=5,f=6。A* 先取 A，虽然 B 当前更便宜。",
      "扩展 A 得 G 的 g=4,h=0,f=4。G 从 priority queue 被取出时结束，返回 S→A→G，总成本 4；不是任何目标首次被生成就无条件结束。",
      "h=0 时按 g 排队，会先看 B，并遇到更多节点；Greedy 只看 h，不计已走成本。此 fixture 中 A* 扩展 S/A/G 三个节点，计数包括取出的 goal。",
      "若人为把 h(A) 改成 100，A* 会优先走 B/C/G 并返回成本 7，展示不合格 heuristic 可损害最优性。LLM 生成的估价没有自动的 admissibility 保证。",
      "实际实现保存 best g、parent/action 与 frontier；发现更便宜路径时更新并按算法条件 reopen。大 state space 还要明确 memory budget、tie-breaking 与无解行为。",
    ],
    whenToUse: [
      "状态转移和成本可计算的路线、规划、拼图、有限 action sequencing；不一定需要训练模型。",
      "已有可解释 heuristic，可以减少 blind search 的无用扩展。",
      "作为 learned planner 或 LLM planner 的 exact/small-instance baseline，明确它们到底近似了什么。",
    ],
    limits: [
      "搜索空间可能指数增长；A* 保存 frontier 的 memory 可能成为瓶颈。",
      "环境未知或 stochastic 时，仅在一个确定性 graph 上搜索未必能应对真实 observation。",
      "Admissibility、consistency、重复状态与 stopping rule 决定保证；不能只写 f=g+h 就宣称全局最优。",
    ],
    howToUse: [
      "定义 state 是否包含完成任务所需的信息，例如剩余预算、库存或已完成子任务。",
      "先在小图用 exhaustive/Uniform-Cost 对照 A* 路径成本。",
      "手工核对 heuristic 的单位与下界性质，记录 explored nodes 和 peak frontier。",
      "为 duplicate states、zero-cost edges、unreachable goal 与 tie-breaking 写明确规则。",
    ],
    tuning: [
      "更强但仍 admissible 的 heuristic 可减少扩展；评估计算 h 的成本，不能只数节点。",
      "Weighted A* 改用 g+w h，是新的速度/质量折中；不要沿用普通 A* 的保证而不说明条件。",
      "Beam search 丢弃部分 frontier，节省资源但通常不保留完整性或最优性。",
    ],
    settings: [
      {
        name: "heuristic",
        start: "从 h=0 的可信 baseline 开始，再加可证明的 lower bound。",
        adjust:
          "若结果成本高于 baseline，检查 overestimate、closed-set 与停止条件。",
      },
      {
        name: "duplicate-state policy",
        start: "保存最小已知 g，显式处理更优路径。",
        adjust: "Heuristic 不 consistent 时尤其检查 reopen 条件。",
      },
      {
        name: "search budget",
        start: "同时限定 expanded nodes、frontier memory 与 wall time。",
        adjust:
          "预算耗尽时报告当前解与是否有 optimality certificate，不把部分搜索当无解证明。",
      },
    ],
    modifications: [
      "用 learned model 生成候选 actions，但用程序检查 feasibility 与真实成本。",
      "Constraint Satisfaction、SAT 或 mathematical optimization 可比逐状态枚举更适合强约束结构；问题表达先于算法名字。",
    ],
    pitfalls: [
      "把 goal generated 与 goal selected 混淆。",
      "用几何距离当时间 heuristic，却没有速度或单位转换。",
      "用 LLM 自评当 admissible cost estimate，未经验证就宣称 A* 保证仍成立。",
    ],
    example:
      "Synthetic graph 的最优成本为 4。合格 h 使 A* 按 S→A→G 找到它；h(A)=100 的 overestimate 会让系统先接受成本 7 的另一条路。图中动作和转移完全已知，不是 agent 的真实环境学习。",
    compareTo: [
      "agent-workflows",
      "model-based-rl",
      "muzero",
      "knowledge-graphs-reasoning",
    ],
  },
  {
    id: "agent-memory-context",
    source: {
      label:
        "Park et al.: Generative Agents — memory, retrieval and reflection architecture",
      url: "https://arxiv.org/abs/2304.03442",
    },
    title: "Agent Memory：保存什么、取回什么、忘掉什么？",
    englishTitle: "Working Context, Persistent Memory and Retrieval Policies",
    category: "agents",
    level: "进阶",
    duration: "24 分钟",
    icon: "▤",
    summary:
      "区分当前 context、结构化 task state、episodic log 与 persistent memory；让压缩、检索、失效和删除成为可测的设计。",
    intuition:
      "把所有聊天记录塞进书包不等于记住重点。做实验的人会保留目标、已验证结果、来源和未解决问题，把原始日志另存；需要时再按问题找回来。Agent 也需要这种分工。",
    core: "输入为历史 observations、用户授权的持久信息、任务状态和当前 query；输出为本轮可用 context 与可追溯 memory records。Working context 是模型本次可见内容；persistent memory 是外部存储，不是模型权重更新。Episodic records 保存事件，semantic summaries 保存归纳事实，structured state 保存任务进度。Memory retrieval 与 RAG 共享检索技术，但 memory write/expiry/consent 还有独立要求。",
    equation:
      "usable_context = window − output_reserve − fixed_instructions − tool_schema_budget; retrieved_items must fit usable_context",
    mechanicsSteps: [
      "为每条 memory 标记 scope、source、timestamp、verified/assumed、version 和是否允许跨任务复用；用户偏好、观察事实与模型推测不应混成同一级证据。",
      "维护 structured task state：goal、已完成且验证的步骤、pending items、约束和预算。它可以比不断增长的自然语言聊天更容易检查。",
      "手算 token budget：window=8192，output reserve=1024，fixed instructions=1024，tool schema=512，剩余可放历史与 evidence 的空间为 5632。",
      "若每段 evidence 900 tokens，4 段共 3600，还可放 2032；7 段共 6300 已超过余量 668。这里按已经测得的 tokens 计算，不把字数假装等同 tokenizer 输出。",
      "对旧事件先检索再压缩。候选可按 relevance、recency、importance 组合排序，但分数尺度应校准；不能直接把 cosine=.8 与时间戳相加。",
      "压缩时保留冲突、否定、版本、来源与未证实状态。把‘可能是 A’压缩成‘是 A’会将 uncertainty 变成伪事实。",
      "设置 invalidation：新证据推翻旧记录时，标记 superseded 并维护 provenance；删除或权限收回必须传播到缓存与检索索引。",
      "评估不只看 recall：用跨时间任务检查 stale-memory error、source attribution、constraint retention 与隐私隔离，并对 no-memory baseline 做比较。",
    ],
    whenToUse: [
      "跨多步骤或多轮任务，需要保留进度、用户明确偏好和可验证事实。",
      "Context 变长导致关键约束被淹没，需要结构化 state 和按需 retrieval。",
      "优点是可更新、可删除、可审计，不必为每条新事实修改模型参数。",
    ],
    limits: [
      "更多 memory 可能增加污染、过期信息和错误复用；不保证性能更好。",
      "被检索到不代表可信，memory 也可能来自失败的旧推断或不可信 external text。",
      "Generative Agents 论文研究的是模拟行为架构；其 believability 结果不能直接证明生产系统事实可靠性。",
    ],
    howToUse: [
      "分开 raw log、verified fact store 与当前 task state，给每种对象定义写入规则。",
      "用实际 tokenizer 测 token budget，并为工具返回和最终输出留余量。",
      "为每条 summary 保留 source ID 和 evidence status，抽样检查压缩是否改变含义。",
      "做时间切分评估，测新旧冲突、删除、权限变化和不同用户之间的隔离。",
    ],
    tuning: [
      "Memory top-k 与 chunk size 联动；优先优化 relevance 和去重，而非只扩大 window。",
      "Recency decay 太快会忘掉稳定偏好，太慢会反复取到过期版本；按记录类型区分。",
      "频繁 summary 会累计压缩误差，必要时从原始记录重新构建而非摘要套摘要。",
    ],
    settings: [
      {
        name: "context allocation",
        start: "分别预留 instructions、schemas、evidence、history 与 output。",
        adjust: "超限先压缩冗余并检查来源，不静默截掉最新约束。",
      },
      {
        name: "memory write policy",
        start: "只有满足 scope 与证据条件的事实才写入 persistent store。",
        adjust:
          "False-memory rate 高时提高验证要求，允许标记 uncertain 而非强制二选一。",
      },
      {
        name: "TTL / invalidation",
        start: "稳定偏好和时变数据使用不同有效期，保留版本。",
        adjust: "任务依赖新状态时优先刷新；授权撤回后停止检索相关记录。",
      },
    ],
    modifications: [
      "结合 structured key-value state 与 semantic retrieval：前者守住硬约束，后者补充长尾信息。",
      "对关键数值保留可执行记录或原始表格，减少纯自然语言 summary 的单位和精度损失。",
    ],
    pitfalls: [
      "把外部 memory 当作 fine-tuning，误以为写入后模型参数已改变。",
      "把无出处的旧回答重新检索出来，形成自我强化的引用循环。",
      "模型 window 很大便取消预算和失效策略。",
    ],
    example:
      "Synthetic budget 为 8192−1024−1024−512=5632 tokens。选择 4 个 900-token evidence chunks 后余 2032；是否该再放历史，要由任务需求决定，而不是把剩余窗口填满。",
    compareTo: [
      "kv-cache",
      "retrieval-augmented-generation",
      "react-agent-loop",
      "agent-security-boundaries",
    ],
  },
  {
    id: "hybrid-retrieval-reranking",
    source: {
      label: "Cormack, Clarke & Buettcher: Reciprocal Rank Fusion (SIGIR 2009)",
      url: "https://cormack.uwaterloo.ca/cormacksigir09-rrf.pdf",
    },
    title: "Hybrid Retrieval：合并不同的证据排序",
    englishTitle: "Lexical Retrieval, Dense Retrieval, RRF and Reranking",
    category: "agents",
    level: "进阶",
    duration: "26 分钟",
    icon: "⌕",
    summary:
      "从两个 ranked lists 手算 RRF，再区分召回、融合、重排与答案生成；检索分数和证据正确概率不是同一件事。",
    intuition:
      "一位检索员擅长找精确型号，另一位擅长找近义描述。它们打分的单位可能不同，但都能列出名次。RRF 用名次合并，避免直接把不可比较的 raw scores 加起来。",
    core: "输入为 query、带稳定 IDs/权限/版本的 corpus 和多个候选 rankings；输出为去重的 fused candidates，再经 reranker 选择 context。Lexical 方法善于 exact tokens，dense 方法善于语义相似但也可能忽略精确约束。RRF 按 rank 汇总，不需要把各 score 标准化到同一尺度；cross-encoder reranker 进一步联合读取 query 与 document，但无法找回所有 retrieval 阶段已丢弃的证据。",
    equation:
      "RRF(d)=Σ_{r: d∈r} 1/(k₀+rank_r(d)); absent document contributes 0; rank starts at 1",
    mechanicsSteps: [
      "固定 corpus snapshot、query 集、gold relevant documents 和 access filter。先验证 document IDs 在各检索器之间指向同一版本。",
      "Toy lexical ranking=[A,B,C]，dense ranking=[B,D,A]。两个 list 里重复的 A/B 通过 ID 合并，candidate union 为 A/B/C/D。",
      "教学取 k₀=10：A 得 1/11+1/13≈0.167832；B 得 1/12+1/11≈0.174242；C 得 1/13≈0.076923；D 得 1/12≈0.083333。",
      "融合顺序为 B、A、D、C。缺席一个 list 的文档在该 list 贡献 0；不要伪造一个低名次让截断外文档都产生贡献。",
      "原论文使用 k₀=60；本例用 10 是为了手算。k₀ 越大，前几个名次之间差距相对变小；它不是 retrieval top-k，两者须用不同变量名。",
      "对 union 或 fused top-N 做 reranking，区分 retrieval_k、rerank_N 和 final_context_k。例如检索 20+20、去重后 31、重排 20、提供 4 段；这些数字是管线设置而非通用最优值。",
      "分别报告 relevant recall、ranking quality、latency 与 grounded answer correctness；用 gold evidence context 检查生成器上限，再判断是不是检索瓶颈。",
      "按 exact ID、同义改写、时间/版本冲突、无答案题分组。返回很多语义相近段落，可能仍缺那一条决定答案的精确约束。",
    ],
    whenToUse: [
      "资料同时含型号、基因名、错误码等精确词和自然语言描述，单一路线覆盖不足。",
      "已有多个排名系统但 raw scores 尺度不同，想建立简单 fusion baseline。",
      "Reranker 适合 candidate recall 已较高、但前几名排序不够准确的情境。",
    ],
    limits: [
      "RRF 不知道文档是否真的支持 claim；多个检索器共享错误也可能共同抬高错误结果。",
      "Truncated candidate set 中根本没有的证据，reranker 无法凭空恢复。",
      "增加候选与重排调用会增加 latency、成本和重复内容；最终 context 过长也可能妨碍阅读。",
    ],
    howToUse: [
      "先测 lexical-only 和 dense-only，在同一 gold evidence set 上比较互补错误。",
      "记录每个候选的原始 rank、source retriever、fused score 和去重规则。",
      "把 permission/version filter 放在正确阶段，避免把不允许的文本送入生成 context。",
      "固定验证集调 retrieval_k、RRF constant、rerank_N 和 final_context_k，最后在独立问题集确认收益。",
    ],
    tuning: [
      "Recall 低先查 corpus/分块/embedding/关键词，不先提高 generation temperature。",
      "k₀ 和列表截断深度共同决定融合效果，不能把 60 当跨任务保证。",
      "Reranker 改善排序但失去 evidence diversity 时，加入结构或来源去重并验证多跳题。",
    ],
    settings: [
      {
        name: "retrieval_k / fusion k₀",
        start: "分开记录每路候选数与 RRF constant，先比较一个简单固定配置。",
        adjust: "按 validation recall/latency 改候选数，按排名质量改融合参数。",
      },
      {
        name: "rerank_N / context_k",
        start: "例如重排 20、返回 4；保留来源与版本。",
        adjust: "证据分散时增加覆盖，噪声和重复多时检查排序/去重。",
      },
      {
        name: "query/document encoder",
        start: "使用兼容的 encoder、normalization 与 similarity。",
        adjust: "升级 embedding 后重建对应索引，维度相同不代表空间兼容。",
      },
    ],
    modifications: [
      "对不同 retrievers 使用验证过的 weighted RRF，但权重需要独立评估。",
      "Query decomposition 可召回多段证据；合并时保留各子问题与证据的对应关系。",
    ],
    pitfalls: [
      "把 BM25 raw score 与 cosine similarity 直接相加，忽略尺度。",
      "把 RRF score=.17 解释为 17% 正确概率。",
      "所有问题只看最终 answer score，无法定位 retrieval 或 reranking 的失败。",
    ],
    example:
      "Synthetic ranks [A,B,C] 与 [B,D,A] 在 k₀=10 时得到 B>A>D>C。A 被两路找到但第一名是 B；fusion 依赖 ranks，不在本例中训练任何 neural retriever。",
    compareTo: [
      "retrieval-augmented-generation",
      "two-tower-retrieval",
      "learning-to-rank",
      "agent-evaluation",
    ],
  },
  {
    id: "agent-evaluation",
    source: {
      label:
        "Yao et al.: τ-bench — task-state evaluation and pass^k reliability",
      url: "https://arxiv.org/abs/2406.12045",
    },
    title: "Agent Evaluation：一次成功与稳定成功差多远？",
    englishTitle:
      "Task Success, Trace Evaluation and Repeated-Trial Reliability",
    category: "agents",
    level: "进阶",
    duration: "27 分钟",
    icon: "✓",
    summary:
      "检查最终 state、过程约束与重复运行；用手算区分 pass@k、pass^k、单次平均成功率和真实生产可靠性。",
    intuition:
      "考试允许做五遍，只要有一遍对，与五遍都要对是两种标准。生成代码可以用 tests 挑出一个成功候选；实际办事若每次都要可靠，不能用最好的一次掩盖其它失败。",
    core: "输入是独立 tasks、初始 environment snapshots、goal states、policy constraints 与固定 budget；输出为 task-level scores、trace failure labels、cost/latency 和 uncertainty。Final-state success 可能漏掉中途违规，因此应与 process checks 并列。τ-bench 的 pass@k 衡量 k 次至少一次成功，pass^k 衡量 k 次全成功；从 n 次 trial 中 c 次成功可用组合数估计，先按 task 算再汇总。",
    equation:
      "pass@k = 1−C(n−c,k)/C(n,k); pass^k = C(c,k)/C(n,k); k≤n; average over tasks",
    mechanicsSteps: [
      "冻结 task set 与初始 state，每次 trial 从相同初始条件重新开始；上一次残留的文件或数据库变更不能帮助下一次。",
      "定义 postcondition，例如目标记录被正确更新且未改动其它记录；再加 required confirmation、权限和禁止 side effects 的独立 process checks。",
      "Toy 单任务运行 n=5 次，c=3 次成功；单次经验成功率为 3/5=.6，但不同重复标准会给不同数值。",
      "取 k=2：pass@2=1−C(2,2)/C(5,2)=.9；pass^2=C(3,2)/C(5,2)=.3。一个是至少一次，一个是全部成功，不能把符号省掉。",
      "若假定未来 trials 独立且单次真实成功概率 p=.6，理论值是 1−.4²=.84 与 .6²=.36；这些不是本次有限样本无偏组合数估计的同一个数字。",
      "给每个失败 trace 分类：tool selection、invalid arguments、external error、wrong evidence、unauthorized side effect、premature stop。最终回答流畅不影响这些标签。",
      "用同一任务进行配对比较，并按 task/domain 重采样或区间估计；多个 trials 不能当成完全不同的新任务数量。",
      "同时报告 task success、policy violation、human intervention、tool-call count 与 latency distribution；不要用一个加权总分藏掉不可接受的失败类别。",
    ],
    whenToUse: [
      "比较 prompt、agent loop、tools、memory 或 model checkpoint 的端到端收益。",
      "系统能偶尔完成任务，但用户反馈不稳定，需要重复 trial 和 failure taxonomy。",
      "需要识别成功是来自更多预算、测试集适应，还是方法本身改善。",
    ],
    limits: [
      "小且简单的 task set 不能代表全部真实需求；环境模拟也可能漏掉真实 API 和用户行为。",
      "LLM judge 可能误判或受被评估输出影响，需要与客观检查、人工标注校准。",
      "I.i.d. trial 解释会被共享缓存、非重置环境与 correlated failures 破坏。",
    ],
    howToUse: [
      "建立 development tasks 和冻结 test tasks，按来源/用户/时间去重分开。",
      "保留 state diff 与工具日志，使用可执行 evaluator 检查可执行事实。",
      "对同一 task 做多个 trials，保存 seeds/config/budget 与停止原因。",
      "先按失败类型找可修复瓶颈，再验证优化是否损害约束、成本或稀有场景。",
    ],
    tuning: [
      "提高 trial 数减少采样不确定性，但不会增加 task diversity；两者分别安排。",
      "扩大 tool budget 时同时画 success-cost 曲线，不能只保留最好样本。",
      "Judge rubric 与阈值在 validation set 校准，不能用 test failures 反复改后仍称独立测试。",
    ],
    settings: [
      {
        name: "task reset / environment version",
        start: "每次从相同 snapshot reset，并记录 API fixture/version。",
        adjust: "结果不稳定先排除环境残留与工具变更。",
      },
      {
        name: "trials / k",
        start: "教学 n=5、k=2，真实配置由预期不确定性与预算决定。",
        adjust: "明确 k≤n；pass@k 与 pass^k 分开报告。",
      },
      {
        name: "success / process rubric",
        start: "客观 postcondition 与过程约束分别计分。",
        adjust: "发现 final-state pass 掩盖中途错误时扩充 trace checks。",
      },
    ],
    modifications: [
      "加入 adversarial-but-realistic tasks，例如版本冲突、empty results、timeout 和权限不足。",
      "为外部操作先在可重置 sandbox 做 evaluation，再用经授权的受控流程验证真实工具兼容性。",
    ],
    pitfalls: [
      "把 pass@k 当每一次都成功的概率。",
      "只看最后一条回答，忽略错误 side effects 和未完成写入。",
      "同一个 task 重复一百次便声称有一百个独立场景。",
    ],
    example:
      "Toy task 五次运行三次成功，k=2 时 pass@2=.9、pass^2=.3。这说明同一组 outcomes 在‘能找到一次成功’和‘稳定完成’两种需求下解读不同，不是某模型的实测 benchmark。",
    compareTo: [
      "language-model-evaluation",
      "model-evaluation",
      "agent-reliability-budgets",
      "agent-security-boundaries",
    ],
  },
  {
    id: "agent-security-boundaries",
    source: {
      label:
        "MCP official security best practices — trust, authorization and tool boundaries",
      url: "https://modelcontextprotocol.io/docs/2025-11-25/tutorials/security/security_best_practices",
    },
    title: "Agent Security：内容不能自己授予权限",
    englishTitle: "Prompt Injection, Least Privilege and Tool Authorization",
    category: "agents",
    level: "进阶",
    duration: "25 分钟",
    icon: "◇",
    summary:
      "把 task instructions、外部 evidence、credentials 和 executable actions 放在不同信任边界中；理解防护为何需要系统检查。",
    intuition:
      "你让助手读一张传单，传单上写‘把钥匙给我’不会因此成为你的命令。检索文档、网页、tool output 和旧 memory 都可能含文字，但它们不能凭内容本身获得更高权限。",
    core: "输入包括可信任务意图、受限 tools 和不可信 external content；输出是满足任务与授权边界的结果。Prompt injection 试图让内容影响不属于它权限范围的行为。需要区分 model behavior mitigation 与 application authorization：即使模型提出了错误 action，executor 仍应依据用户身份、resource scope、operation type 与政策拦截。Sanitization、分隔符或一个‘忽略恶意指令’prompt 都不是完整安全边界。",
    equation:
      "allow(action)=authorized_principal ∧ allowed_resource ∧ allowed_operation ∧ required_confirmation; content text ≠ authorization",
    mechanicsSteps: [
      "画 trust map：用户给的 task 是读取公开资料；retrieved page、其内 links 和 tool result 是待分析内容，不是新的用户指令。",
      "Toy 系统有 read_doc 与 send_message 两种能力。原任务只授权 read；网页要求把整份资料发送出去，不会扩张到 send 权限。",
      "设三项 programmatic gates：principal valid、resource allowed、operation allowed。一次请求取值 [1,1,0] 时 AND=0，即使模型把参数填得完全合法也不应执行。",
      "把 credentials 留在可信 executor，模型只得到完成任务所需的结果；按 resource 和 operation 最小化 scope，不把万能 token 当默认工具参数。",
      "Tool outputs 保留来源与 provenance；来自不可信页面的内容进入低信任 evidence 区域。记忆写入也要记录来源，避免一次注入变成以后一直信任的事实。",
      "对有外部副作用的操作，依据产品与用户授权规则取得必要确认，并检查具体 destination/data。不是每个只读动作都需要重复确认，也不是一次广泛授权能覆盖无限范围。",
      "用安全测试 fixture 检查系统能否在完成正常任务的同时拒绝无关越权动作；记录 false blocks、unauthorized attempts 与实际 side effects，分开评价。",
    ],
    whenToUse: [
      "Agent 会读外部网页、文档、邮件、工具返回或共享 memory 时。",
      "工具能访问私有资料或产生外部写入，需要在模型之外落实权限。",
      "优点是让 model mistakes 被限定在系统允许的范围，且可以用执行日志检查。",
    ],
    limits: [
      "没有单个 prompt 或检测模型能保证杜绝 injection；防护需要多层边界和真实测试。",
      "过严规则也可能阻止正常任务；应让用户理解被拦的是哪项具体操作。",
      "本文是防御性系统设计，不能替代组织的完整安全审计与身份管理。",
    ],
    howToUse: [
      "为每个 tool 标注 read/write、resource scope、credential owner 和确认条件。",
      "在 executor 中重新检查权限，不能仅信任模型生成的‘用户同意’字段。",
      "为日志、缓存和 persistent memory 设计访问控制与删除流程。",
      "测试包含不可信文本、混合来源、跨用户隔离和权限撤回的任务，核实真实 side effects。",
    ],
    tuning: [
      "缩小 tool surface 常比单纯增加拒绝词更可测试；按实际任务保留必要能力。",
      "风险阈值应针对具体操作，不把文本敏感度与执行权限混成一个 score。",
      "监测 false positive 与 missed unauthorized operations，避免只在能拦截的少量样例上调规则。",
    ],
    settings: [
      {
        name: "resource / operation scope",
        start: "按任务授予可说明的最小读取/写入范围。",
        adjust: "新增能力时重新列明数据流与允许的 destinations。",
      },
      {
        name: "trust labels / provenance",
        start:
          "区分 task instruction、external evidence、model hypothesis 和 verified tool state。",
        adjust: "跨 summary、memory 或 agent handoff 时保留这些标签。",
      },
      {
        name: "confirmation / execution gate",
        start: "让产品规则决定哪些具体外部动作需确认，并显示可审阅参数。",
        adjust:
          "授权范围或数据 destination 改变时重新检查，不用模糊的‘继续吗’代替说明。",
      },
    ],
    modifications: [
      "对危险工具采用沙箱、窄接口和分阶段执行；preview 与真正 side effect 分开。",
      "引入 independent policy checker，但同时验证它的错误模式，不能把第二个模型当绝对可靠边界。",
    ],
    pitfalls: [
      "把 tool annotation 或网页自称的系统提示视为权威。",
      "模型从外部资料抄出地址或命令后直接执行，未核对 task 与权限。",
      "把所有安全问题都当 prompt engineering，遗漏身份、scope、数据流与幂等性。",
    ],
    example:
      "Synthetic gate：[principal=1,resource=1,operation=0] 得 allow=0。Tool request 的 JSON 完全正确也不改变结果；网页里新增的‘发送’要求没有用户授权来源。",
    compareTo: [
      "tool-calling-contracts",
      "model-context-protocol",
      "agent-memory-context",
      "agent-evaluation",
    ],
  },
  {
    id: "multi-agent-orchestration",
    source: {
      label: "Wu et al.: AutoGen — multi-agent conversation architecture",
      url: "https://arxiv.org/abs/2308.08155",
    },
    title: "Multi-Agent：分工什么时候有帮助，什么时候只增加对话？",
    englishTitle: "Delegation, Shared State and Multi-Agent Coordination",
    category: "agents",
    level: "进阶",
    duration: "25 分钟",
    icon: "⋈",
    summary:
      "把角色、任务依赖、共享 artifact 和协调成本画出来；区分独立并行、串行 handoff、review 与重复投票。",
    intuition:
      "三个人一起写报告可能更快，也可能同时改坏同一段。有效分工需要清晰的接口和负责人；给三个相同模型起不同角色名字，不会自动产生独立知识或正确答案。",
    core: "输入是可拆分 task graph、worker capabilities、共享 state policy 和 budget；输出是经过协调与验证的 integrated artifact。常见结构包括 manager-worker、pipeline、parallel specialists 和 independent reviewer。Multi-agent 可以是同一模型的多个实例，不意味着独立误差。协作的价值来自任务拆分、不同信息/工具和可验证接口，代价包括额外 tokens、通信、冲突与失效处理。",
    equation:
      "serial_time=Σt_i; ideal_parallel_time=max(t_i); actual_time≥critical_path+coordination_overhead",
    mechanicsSteps: [
      "先列任务和依赖：A 查方法、B 查评估、C 生成图可以在材料齐全时独立；D 整合报告必须等 A/B/C 的输出。",
      "给每个 worker 一份窄 contract：目标、输入、允许范围、输出 schema、证据要求和停止条件；让它知道哪些共享文件不能改。",
      "Toy duration 为 A=2s、B=3s、C=5s、整合 D=1s。三个独立 workers 理想总时长 max(2,3,5)+1=6s；串行是 11s，不含排队和模型波动。",
      "并行不减少总工作量：理想 worker processing time 仍为 10s，另有整合 1s。更快的 wall time 可能同时更贵。",
      "Shared artifacts 使用明确 ownership、version 或 merge policy。两个 workers 同时写同一文件需要冲突处理；manager 不能只把最后到达的结果当完整答案。",
      "Reviewer 的输入应包含 task requirements、evidence 与 artifact；用可复现 checks 找问题。多个相同 agents 相互认可，不是独立实验验证。",
      "记录 worker failures、timeouts、重复输出、整合遗漏和 communication volume。小而稳定的任务先与单 agent / workflow 在同预算下比较。",
      "测试一个 worker 失败或迟到时系统能否返回标明缺口的部分结果，而不是编造缺失内容或无限等待。",
    ],
    whenToUse: [
      "存在真正独立的子任务或需要不同工具/信息范围，且结果可以通过清晰接口整合。",
      "需要把实现与审核职责分开，并有可执行的验证条件。",
      "任务长到单 context 难以保留全部细节时，可用窄 scope 降低每个 worker 的信息负担。",
    ],
    limits: [
      "通信和整合成本可能超过并行收益，特别是子任务很小或依赖很强时。",
      "同模型、同数据和同提示造成 correlated errors，majority vote 不一定可靠。",
      "更多 workers 扩大 tool surface 和共享 state 风险，必须明确权限与数据隔离。",
    ],
    howToUse: [
      "先画 dependency DAG，按边界清楚的 artifacts 拆任务。",
      "为每个 worker 指定独占输出或可合并格式，保留 provenance。",
      "限制并发和总预算，设置超时、取消与局部重试策略。",
      "用固定任务集比较 single-agent 与 multi-agent 的 quality、wall time、total compute 和协调失败率。",
    ],
    tuning: [
      "先找 critical path；加 worker 不能缩短本来必须串行的依赖。",
      "并发过高会引发 rate limits 和 shared-state contention；记录排队时间。",
      "减少不必要的全量聊天转发，以结构化摘要交接证据与未解决问题。",
    ],
    settings: [
      {
        name: "worker count / concurrency",
        start: "教学比较 1 与 3 workers，保持相同任务与模型信息。",
        adjust: "新增 worker 没有独立工作时减少并发，避免只扩大对话。",
      },
      {
        name: "artifact ownership",
        start: "每个 worker 独占文件/模块，manager 负责整合。",
        adjust: "出现覆盖写入时增加版本检查或串行合并。",
      },
      {
        name: "review / termination",
        start: "Reviewer 对照明确 rubric，manager 以验证结果结束任务。",
        adjust:
          "Review 反复无新发现时停止循环；重要问题回到可测的失败 fixture。",
      },
    ],
    modifications: [
      "把 agent workers 放进 deterministic orchestration DAG，减少自由聊天的控制不确定性。",
      "用不同 evidence sources、工具或检验程序产生互补信息，而不只是更换角色名称。",
    ],
    pitfalls: [
      "把 3 个 agents 的一致回答当作 3 个独立证据。",
      "把 wall-time 降低当成总 token/compute 成本也降低。",
      "整合者只读总结而不检查原始 artifact，导致错误被摘要掩盖。",
    ],
    example:
      "Synthetic durations 2/3/5s 与 1s merge：理想串行 11s，并行 6s。若协调额外花 7s，并行总时长会变成 13s，反而更慢；真实收益必须测量。",
    compareTo: [
      "agent-workflows",
      "agent-evaluation",
      "agent-reliability-budgets",
      "agent-security-boundaries",
    ],
  },
  {
    id: "model-context-protocol",
    source: {
      label:
        "Model Context Protocol specification — pinned 2025-06-18 lifecycle and capabilities",
      url: "https://modelcontextprotocol.io/specification/2025-06-18",
    },
    title: "MCP：把模型应用与工具服务接起来",
    englishTitle:
      "Model Context Protocol, Lifecycle and Capability Negotiation",
    category: "agents",
    level: "进阶",
    duration: "25 分钟",
    icon: "⇄",
    summary:
      "理解 host、client、server、resources、tools 与 prompts；沿一次连接的生命周期区分协议兼容、模型选择和实际授权。",
    intuition:
      "MCP 像一套统一插头与通信约定：应用知道怎样询问服务提供什么，再按约定调用。插头兼容不等于插上的设备可信，也不替你决定什么时候用哪个工具。",
    core: "MCP 是连接 LLM applications 与 context/tools 的开放协议，不是模型、训练算法或完整 agent framework。本课固定讨论 2025-06-18 specification，避免把协议变更当成永久 API。Host 管理应用与用户体验，client 连接 server，server 暴露协商后的能力。JSON-RPC 2.0 请求/响应关联调用，notifications 没有需要响应的 request ID。具体 SDK 和新版本应另核对。",
    equation:
      "initialize → negotiated version/capabilities → notifications/initialized → permitted operations → shutdown",
    mechanicsSteps: [
      "先画角色：一个 host 可以通过多个 clients 连接不同 servers；server 提供能力，不会因为接入就获得整个对话或所有本地文件的无限权限。",
      "Client 首先发送 initialize，带支持的 protocol version、capabilities 与实现信息；server 回复可支持的版本与能力。双方不支持相同协议时不能假装正常互通。",
      "Toy message sequence：request id=1 用于 initialize，response id=1 与其对应；随后发送 notifications/initialized，没有 request ID。",
      "若 server 宣告 tools capability，client 可用 tools/list 发现工具及 inputSchema；request id=2 的结果包括工具定义，必要时处理 pagination。",
      "模型应用提出一次工具动作后，可信 host/executor 根据授权与 contract 检查，再通过 tools/call 发起 request id=3；对应 response id=3 才是这一调用的结果。",
      "区分 server resources（供读取的 context/data）、prompts（模板化交互）与 tools（可执行操作）。它们不是三种神经网络，也不天然等同访问权限等级。",
      "Transport、cancellation、error、reconnect 和 schema version 都是系统契约。stdio 或 HTTP 等方式的部署与授权细节依所选版本，不能只照抄某 SDK 的默认配置。",
      "将协议层 success、工具业务 success 和任务最终 success 分开记录；JSON-RPC 成功传输并不说明文档存在、操作已完成或答案正确。",
    ],
    whenToUse: [
      "希望多个工具服务与支持 MCP 的应用采用相同 discovery/call 协议，减少每对系统的专用适配。",
      "需要统一管理 capability discovery、结构化工具描述与连接生命周期。",
      "优点是标准化接口边界；agent 的策略、评估和权限管理仍可独立选择。",
    ],
    limits: [
      "MCP 不自动判断 tool 内容可信、工具选择正确或 task 已完成。",
      "不同协议/SDK 版本与 server capabilities 可能不兼容；本课 pinned version 不代表当前全部功能。",
      "标准化连接不会自动解决 prompt injection、authorization、数据隔离或 exactly-once execution。",
    ],
    howToUse: [
      "记录 host/client/server 版本与实际协商的 protocol version。",
      "从一个无副作用的小工具开始，验证 initialize、discovery、call、error 和 shutdown。",
      "在可信 application 层控制 tool scope、credentials、confirmation 与结果处理。",
      "为 timeout、capability变化、schema升级和 reconnect 建兼容性测试，再接更多服务。",
    ],
    tuning: [
      "缓存 tool list 时要考虑 server 宣告的变化通知和重新发现，不能永远使用旧 schema。",
      "暴露过多相似 tools 会增加模型选择困难；按任务缩小可见能力。",
      "调大连接超时前先区分 transport failure、业务长任务和模型等待。",
    ],
    settings: [
      {
        name: "protocol version",
        start: "教学固定 2025-06-18；生产记录真实协商值。",
        adjust: "升级后对照变更文档与兼容性 tests，不把旧字段机械迁移。",
      },
      {
        name: "capabilities / tool scope",
        start: "只启用当前任务需要且 server 明确宣告的能力。",
        adjust: "新增能力同时检查用户授权与数据流。",
      },
      {
        name: "request IDs / lifecycle",
        start: "保持唯一可关联 request IDs，区分 requests 与 notifications。",
        adjust: "并发/reconnect 时检查重复结果、取消状态与 stale responses。",
      },
    ],
    modifications: [
      "同一个 agent 可以混合 MCP tools 与直接 API adapters，但保持统一 validation 和权限语义。",
      "为多 server 场景加入名称空间与审计记录，避免同名工具的来源混淆。",
    ],
    pitfalls: [
      "把 MCP 当成 multi-agent 通信或自动规划算法。",
      "只验证能连通，就假定所有 server 功能都可用或已获授权。",
      "把 server 返回的自然语言 instructions 当成可以覆盖用户任务的权限来源。",
    ],
    example:
      "Synthetic handshake 有 id=1 initialize、一个 initialized notification、id=2 tools/list、id=3 tools/call。Notifications 不占 request/response pair；3 次请求成功也不等于最终任务已通过 postcondition。",
    compareTo: [
      "tool-calling-contracts",
      "agent-workflows",
      "agent-security-boundaries",
      "multi-agent-orchestration",
    ],
  },
  {
    id: "knowledge-graphs-reasoning",
    source: {
      label:
        "Hogan et al.: Knowledge Graphs — representation, queries and inference",
      url: "https://arxiv.org/abs/2003.02320",
    },
    title: "Knowledge Graph 与 Symbolic Reasoning：从关系到可追溯结论",
    englishTitle:
      "Knowledge Graphs, Rules, Queries and Neural–Symbolic Systems",
    category: "reasoning",
    level: "进阶",
    duration: "27 分钟",
    icon: "⋈",
    summary:
      "区分存储关系、规则推导、图查询和 embedding prediction；解释明确规则的优势，以及 incomplete knowledge 的边界。",
    intuition:
      "如果已知每个 Hepatocyte 都是 Cell，每个 Cell 都是 BiologicalEntity，那么 x 是 Hepatocyte 时，可按规则推出 x 也是 BiologicalEntity。这个结论来自已声明的关系和逻辑，不需要先训练一个大网络。",
    core: "输入是有稳定 entity IDs、typed relations、provenance 的 facts 与明确 rules；输出是 query results、entailed facts 或 candidate predictions。RDF 用 subject–predicate–object triples 表达关系；规则系统按其逻辑语义推导。Embedding/GNN 的 link prediction 则给缺失关系打分，不等于逻辑必然成立。Closed-world 与 open-world assumptions 决定‘数据库没有’能否被当作‘为假’。",
    equation:
      "type(x,A) ∧ subClassOf(A,B) ⇒ type(x,B); logical entailment ≠ high neural similarity",
    mechanicsSteps: [
      "建立 entity identity：同名字符串不一定是同一对象，跨库 ID 合并要记录来源与版本；先解决 identity，才能谈图上的关系。",
      "Toy facts 为 subClassOf(Hepatocyte,Cell)、subClassOf(Cell,BiologicalEntity)、type(x,Hepatocyte)。这里只演示 type propagation rule。",
      "第一轮把 type(x,Hepatocyte) 与第一条 subclass edge 合并，得到 type(x,Cell)；第二轮沿下一条 edge 得到 type(x,BiologicalEntity)。",
      "该指定 rule closure 有 3 条关于 x 的 type facts：1 条原有、2 条新增。若同时启用 subclass transitivity 等更多 rules，完整 closure 还会增加别的关系，因此必须声明 rule set。",
      "Query ‘哪些对象是 Cell’ 可返回 x 并列出所用 facts 与 rule。删除或更正一条 premise 后，依赖它的 derived facts 需要重新检查。",
      "若没有 type(y,Cell)，在 open-world assumption 下只能说当前知识未证明它；不能自动推出 y 不是 Cell。显式 negation 与缺失记录不同。",
      "Neural link predictor 可为候选 missing edges 排序，供人工或独立证据验证；它的高分不能被直接当作 rule-derived fact 写回而不标记来源。",
      "评估 graph queries 的正确性、规则一致性、entity resolution 与 provenance；对于 learned completion 另外按 entity/time split 评估，防止 inverse-edge 或重复事实泄漏。",
    ],
    whenToUse: [
      "领域关系、定义、约束和来源可明确表达，且需要解释结论依赖哪些 premises。",
      "多数据库实体和事实整合、可审计查询、规则校验与结构化 evidence retrieval。",
      "优点是显式语义与可追溯推导；可与 ML 检索、entity linking 或 candidate ranking 结合。",
    ],
    limits: [
      "Knowledge Graph 不会自动保证 facts 正确、完整或跨来源无冲突。",
      "开放世界下缺失不是否定；复杂逻辑系统的推理成本依具体 language/rules 变化。",
      "Ontology、entity linking 和维护成本可能很高，简单任务用关系表或关键词检索已足够。",
    ],
    howToUse: [
      "先写最小 entity/relation schema、ID 规范和 provenance，不从画大图开始。",
      "用少量可手算 facts 与 rules 验证 closure、冲突和删除后的行为。",
      "明确 query semantics、open/closed-world assumption 与允许的 inference rules。",
      "将 observed、derived、predicted edges 分开保存，并对每种来源采用相应验证标准。",
    ],
    tuning: [
      "图越大不等于知识越好；优先改 ID 对齐、重复事实和关系定义。",
      "规则过宽会产生大量无用或错误 entailments；检查每条 rule 的适用域。",
      "Embedding negative sampling 需考虑 unobserved positives，不能随意把所有 missing edges 当真 negatives。",
    ],
    settings: [
      {
        name: "identity / provenance",
        start: "每个 entity 用稳定 ID，每个 fact 保留 source/version。",
        adjust: "跨库合并前核同名、别名与上下文；错误合并会污染整条推导链。",
      },
      {
        name: "rule set / world assumption",
        start: "Toy 只启用 type propagation；明确缺失事实如何解释。",
        adjust: "新增逻辑规则后重测 closure 与复杂度，不沿用旧事实计数。",
      },
      {
        name: "predicted-edge threshold",
        start: "Neural scores 只用于 candidate ranking，与确定性 facts 分层。",
        adjust: "按独立标注校准精度/覆盖率；不能把分数阈值当逻辑证明。",
      },
    ],
    modifications: [
      "Neural retrieval 找候选实体，symbolic rules 检查约束；分别记录检索失败与逻辑失败。",
      "将 Graph RAG 作为结构化检索策略比较，但仍检查最终回答是否被原始来源支持。",
    ],
    pitfalls: [
      "把 Knowledge Graph 和 GNN 混为一个概念：前者是表示与知识组织，后者是一类可学习运算。",
      "把 missing edge 自动标为 false，破坏 open-world semantics。",
      "对循环生成的 predicted facts 再做训练和验证，造成自我证明。",
    ],
    example:
      "Synthetic rule closure 从 x:Hepatocyte 出发，依次得到 x:Cell 与 x:BiologicalEntity。推导正确仍依赖 premises 与 rule 适合问题；它没有测量一个真实 cell 的 biology。",
    compareTo: [
      "gnn",
      "probabilistic-graphical-models",
      "planning-search-astar",
      "hybrid-retrieval-reranking",
    ],
  },
  {
    id: "agent-reliability-budgets",
    source: {
      label: "AWS Builders' Library: Timeouts, retries, backoff and jitter",
      url: "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/",
    },
    title: "Reliability Budget：更多重试为什么不总是更好？",
    englishTitle:
      "Retry Budgets, Idempotency, Timeouts and End-to-End Reliability",
    category: "agents",
    level: "进阶",
    duration: "28 分钟",
    icon: "⌛",
    summary:
      "用有限 geometric series 手算成功率和调用成本，再区分 transient failure、错误参数、相关故障与重复 side effects。",
    intuition:
      "电话偶尔没接通，重拨可能有效；拨错号码，再拨十遍也没用。Agent 的 retry 同样要先判断失败类型，并确认上一通是否其实已经完成了操作。",
    core: "输入是 task steps、tool failure classes、per-attempt cost、timeouts 与最大 attempts；输出是可测的 completion probability、expected calls 和终止状态。独立且同成功概率 p 的 toy step 在最多 r 次 attempts 后成功概率 s=1−(1−p)^r。真实系统有 correlated outage、deterministic errors 与 uncertain writes，不能直接用独立公式预测生产可靠性。Retry 还可能增加负载，需 backoff、jitter 和总预算。",
    equation:
      "s=1−(1−p)^r; E[attempts]=Σ_{j=0}^{r−1}(1−p)^j; independent n-step success=s^n",
    mechanicsSteps: [
      "先区分 attempts 与 retries：最多 3 attempts 意味着首次调用加最多 2 retries，不是再多做 3 次。",
      "Toy 单次成功 p=.8，failure q=.2。最多 3 attempts 的最终 failure=.2³=.008，success=.992。该计算要求每次失败后下一次仍有相同独立 p。",
      "Expected attempts 用 tail sum：必做第一次，概率 .2 做第二次，概率 .04 做第三次，得到 1+.2+.04=1.24；不是固定每次都调用 3 次。",
      "五个必须完成且相互独立的步骤，每步不重试时全成功为 .8⁵=.32768；每步按上述规则重试后为 .992⁵≈.9606。加入共享 outage 后这个乘法通常不成立。",
      "如果所有五步都尝试，期望调用数为 5×1.24=6.2；如果一旦某步彻底失败就停止，期望为 1.24×Σ_{i=0}^{4}.992^i≈6.102。两种控制流成本不同，必须声明约定。",
      "Invalid arguments、permission denied 或证据本身缺失通常不是同参数 retry 可修复的 transient errors。先修 task/arguments 或明确缺口，避免反复浪费预算。",
      "写操作 timeout 可能已经执行成功；使用服务端 idempotency/状态查询处理 uncertain outcome。Retry 应在安全前提下进行，不能把成功率公式当授权或 exactly-once 保证。",
      "分别设置 per-call timeout、total wall time、attempt limit 和最大 tool budget；加 exponential backoff 与 jitter 时，也要计入等待时间，并检查是否放大 backend overload。",
    ],
    whenToUse: [
      "Agent 依赖多个外部工具，偶发网络或服务失败影响整条任务链。",
      "需要对比质量与 latency/cost，判断重试放在哪一层更合理。",
      "优点是把预算变成显式系统参数，并能从失败类型判断是否该继续。",
    ],
    limits: [
      "Independent constant-p toy 忽略 shared outage、状态变化与 deterministic model errors。",
      "多层系统各自重试会放大调用数；例如 3 层每层最多 3 attempts，最坏可放大到 27 个底层 attempts。",
      "重试不安全的写操作可能产生重复结果；timeout 不证明服务没执行。",
    ],
    howToUse: [
      "定义 retryable error taxonomy，区分 read、idempotent write 与 uncertain non-idempotent write。",
      "从日志估计不同错误类别的恢复情况和 latency，而非用一个全局平均 p。",
      "统一记录 attempt number、request identity、backoff time 与最终 postcondition。",
      "按 task 评估 retry 对 success、tail latency、cost、重复 side effects 的影响，并保留无需重试的 baseline。",
    ],
    tuning: [
      "提高 r 前查看失败是否可恢复；相同错误连续出现时应止损或切换策略。",
      "Backoff 降低瞬时负载但增加等待，需与总 deadline 共同设置。",
      "减少重复层级的 retry，明确哪个组件拥有恢复责任。",
    ],
    settings: [
      {
        name: "max attempts / total budget",
        start: "教学 r=3 包括首次调用；实际配置同时限定整条任务 calls。",
        adjust: "按边际成功收益和成本选择，不把最大值当目标调用数。",
      },
      {
        name: "timeout / backoff / jitter",
        start:
          "从可观测 latency 分布和服务约束设置，并区分 connection 与 operation timeout。",
        adjust: "超时过短会制造重试；过长会占用预算，需看 tail behavior。",
      },
      {
        name: "idempotency / outcome check",
        start: "写工具记录 stable request identity，并支持查询是否已经完成。",
        adjust: "出现 uncertain write 时先查状态，不盲目生成新 key 再写一遍。",
      },
    ],
    modifications: [
      "加入 circuit breaker 或 fallback path，但要明确 fallback 是否仍满足任务正确性。",
      "对只读独立操作使用 bounded concurrency；总预算仍需跨 workers 汇总。",
    ],
    pitfalls: [
      "把重试次数和最大 attempts 混淆，预算差一次。",
      "把模型反复猜错答案当作独立网络失败，套用 .992 的公式。",
      "每层都自动重试，忽略 backend amplification 与 duplicate writes。",
    ],
    example:
      "Synthetic p=.8、r=3：单步 success=.992、expected attempts=1.24。五步 chain 的 success≈.9606；stop-on-first-failure 时 expected calls≈6.102。所有数值依赖独立、相同 p 与特定控制流，不是真实 agent 性能测量。",
    compareTo: [
      "agent-workflows",
      "tool-calling-contracts",
      "agent-evaluation",
      "multi-agent-orchestration",
    ],
  },
];
