import { type CompleteLabMap, fmt, sum } from "./types";
import { control, stage, result, make } from "./rlShared";
export const rlAgentLabs: CompleteLabMap = {
  "agent-workflows": make(
    "agent-workflows",
    "Routing workflow何时能节省调用成本？",
    "4个已分类task；easy branch耗时2s，complex branch5s；router每task .25s，validation每task .5s，全程serial。",
    control(
      "Complex tasks among four",
      0,
      4,
      1,
      2,
      "从2开始；task类别由fixture给定，不假设LLM router永远判断正确。",
    ),
    (n) => {
      const easy = 4 - n,
        cost = [2 * easy, 5 * n],
        router = 1,
        verify = 2,
        total = router + sum(cost) + verify;
      return result(
        [
          stage(
            "Route known inputs",
            "固定4个task改变分支构成，先显式记录routing decision。",
            `easy=${easy}; complex=${n}`,
            ["easy tasks", "complex tasks"],
            [easy, n],
            "tasks",
          ),
          stage(
            "Execute selected branches",
            "只执行被选中的branch；所有task串行所以加总latency。",
            `execution=2×${easy}+5×${n}=${sum(cost)}s`,
            ["easy execution", "complex execution"],
            cost,
            "s",
          ),
          stage(
            "Include orchestration overhead",
            "router和validator的时间也必须记账。",
            `T=1+${sum(cost)}+2=${total}s`,
            ["routing", "execution", "validation"],
            [router, sum(cost), verify],
            "s",
          ),
          stage(
            "Compare a fixed workflow",
            "always-complex无需router，但仍需相同validation；task全复杂时routing可能纯增overhead。",
            `routed=${total}s; always-complex=4×5+2=22s`,
            ["routed workflow", "always-complex workflow"],
            [total, 22],
            "s",
          ),
        ],
        "Routed serial latency",
        total,
        "s",
      );
    },
    {
      use: [
        "输入类别可可靠判断、分支步骤可预先定义时，routing workflow容易测试和控制成本。",
        "开放探索任务才可能需要更自由的Agent；固定workflow的优点是trace可审计，缺点是覆盖未知分支能力有限。",
      ],
      tune: [
        "先记录每branch latency、正确率和routing confusion matrix；从少量有明显区别的分支开始。",
        "若复杂任务比例高或router误分频繁，减少routing复杂度；不要只以调用次数判断质量。",
      ],
      debug: [
        "路由后反而更慢",
        "检查router/validation开销与branch实际比例",
        "按完整trace计时，合并没有成本收益的分支。",
        "简单branch输出不够完整",
        "检查misrouting样本与fallback触发条件",
        "加入可测validation和升级分支，重新评估端到端质量。",
      ],
      boundary:
        "确定性4-task成本账本，durations人为声明；没有调用真实LLM、没有估计routing准确率，也不是生产latency benchmark。",
    },
  ),
  "tool-calling-contracts": make(
    "tool-calling-contracts",
    "合法JSON是否足以允许tool执行？",
    "请求read_rows(limit=n)；schema要求integer且1≤n≤10；application policy另规定最多6行。",
    control(
      "Requested row limit n",
      0,
      12,
      1,
      5,
      "从5开始；7到10满足schema但超出policy budget，0和11以上schema失败。",
    ),
    (n) => {
      const tests = [
          Number(Number.isInteger(n)),
          Number(n >= 1),
          Number(n <= 10),
        ],
        valid = tests.every(Boolean),
        policy = n <= 6 && n >= 0,
        execute = valid && policy,
        rows = execute ? n : 0;
      return result(
        [
          stage(
            "Construct typed arguments",
            "工具名固定，只改变一个number参数；schema还应检查required和additionalProperties。",
            `arguments={limit:${n}}`,
            ["requested rows", "schema upper bound", "policy upper bound"],
            [n, 10, 6],
            "rows",
          ),
          stage(
            "Schema validation",
            "integer、minimum、maximum是独立检查；任意失败即拒绝解析后的参数。",
            `integer=${tests[0]}, min=${tests[1]}, max=${tests[2]}`,
            ["integer valid", "minimum valid", "maximum valid"],
            tests,
            "0/1",
          ),
          stage(
            "Authorization and budget",
            "schema valid不赋予权限；policy在执行前独立检查。",
            `execute=schema_valid AND policy_allowed=${Number(execute)}`,
            ["schema valid", "policy allowed", "execution allowed"],
            [Number(valid), Number(policy), Number(execute)],
            "0/1",
          ),
          stage(
            "Return structured result",
            "失败返回typed error且没有读取side effect；成功结果仍需output validation。",
            `executed rows=${rows}; unused budget=${6 - rows}`,
            ["returned rows", "remaining row budget"],
            [rows, 6 - rows],
            "rows",
          ),
        ],
        "Executed rows",
        rows,
        "rows",
      );
    },
    {
      use: [
        "Agent要调用数据库、分析脚本或外部API时，typed arguments和structured results让错误可定位。",
        "Schema约束形状，policy约束允许的动作；二者不能替代tool内部的访问控制与资源限制。",
      ],
      tune: [
        "从最小required字段、严格enum/range和additionalProperties=false开始；拒绝率高时先改tool描述和错误消息。",
        "为read/write分别设预算与权限；合法但高成本请求频繁时收紧policy或要求更小分批调用。",
      ],
      debug: [
        "JSON可解析但tool崩溃",
        "检查type、required、range及output schema",
        "在executor边界做validation，返回可机器处理的error code。",
        "模型绕过额度",
        "检查policy是否仅写在prompt里",
        "在server/executor强制budget与authorization，不依赖模型自觉。",
      ],
      boundary:
        "本地确定性schema/policy示例；整数slider不测试所有JSON语法，也没有真实数据库、认证系统或外部读操作。",
    },
  ),
  "react-agent-loop": make(
    "react-agent-loop",
    "ReAct预算耗尽时怎样区分已观察信息与已验证结果？",
    "固定trace：fetch evidence(2s)→parse(1s)→calculate(1s)→verify(2s)；每步依赖上一步，只有verify后允许标记verified。",
    control(
      "Maximum action steps",
      1,
      4,
      1,
      3,
      "从3开始；增加到4会执行verification，不能把未执行的检查算作成功。",
    ),
    (b) => {
      const names = ["fetch", "parse", "calculate", "verify"],
        dur = [2, 1, 1, 2],
        run = names.map((_, i) => Number(i < b)),
        cost = dur.map((x, i) => x * run[i]),
        verified = Number(b === 4);
      return result(
        [
          stage(
            "Plan next action from state",
            "本fixture给定合法action sequence；真实ReAct需根据observation选择后续action。",
            `budget=${b}; action order=fetch→parse→calculate→verify`,
            names,
            run,
            "executed 0/1",
          ),
          stage(
            "Observe completed tools",
            "每次只追加已执行tool observation，禁止把future output写入state。",
            `completed observations=${b}; unexecuted=${4 - b}`,
            ["observed steps", "remaining required steps"],
            [b, 4 - b],
            "steps",
          ),
          stage(
            "Account for trace cost",
            "budget截断sequence；已花费的tool latency不能被未完成结果抵消。",
            `spent=${cost.join("+")}=${sum(cost)}s`,
            names.map((x) => `${x} cost`),
            cost,
            "s",
          ),
          stage(
            "Stop with explicit status",
            "完成calculation但未verify的结果必须标注unverified；step cap不是成功条件。",
            `verified=${verified}; blocked by budget=${1 - verified}`,
            ["verified result", "budget-limited result"],
            [verified, 1 - verified],
            "0/1",
          ),
        ],
        "Executed trace latency",
        sum(cost),
        "s",
      );
    },
    {
      use: [
        "需要交替调用tool、读取observation并调整下一步的任务，ReAct提供可检查的interaction loop。",
        "步骤固定且无需动态决策时workflow更简单；ReAct需要处理loop、错误observation和budget耗尽。",
      ],
      tune: [
        "先设置max steps、wall-time和token budget，检查完整trace中的必要动作能否完成；通过率低时先看停在哪一步。",
        "从短loop和明确定义的done condition开始；重复同一action时加重复检测或修订状态信息。",
      ],
      debug: [
        "Agent不断重复搜索",
        "检查是否存入tool result及下一步是否使用新observation",
        "增加重复action检测，要求新信息或明确终止。",
        "有答案但证据不足",
        "检查done predicate是否只匹配最终文字",
        "用environment state和verification结果决定完成状态。",
      ],
      boundary:
        "预先声明的deterministic trace展示预算和状态推进；不模拟LLM推理质量，也不展示真实私有chain of thought。",
    },
  ),
  "agent-memory-context": make(
    "agent-memory-context",
    "Context budget不足时究竟保留哪条memory？",
    "固定system占100 tokens；候选memory A=(120 tokens,utility6)、B=(80,4)、C=(250,1)；0/1 knapsack选择最大utility，utility为教学评分。",
    control(
      "Total context budget",
      100,
      600,
      50,
      300,
      "从300开始；system先占用预算，再枚举8种memory子集。",
    ),
    (budget) => {
      const costs = [120, 80, 250],
        utilities = [6, 4, 1],
        available = budget - 100;
      let best = 0,
        bestScore = -1,
        bestCost = 0;
      for (let mask = 0; mask < 8; mask++) {
        const c = sum(costs.map((v, i) => ((mask >> i) & 1) * v)),
          score = sum(utilities.map((v, i) => ((mask >> i) & 1) * v));
        if (
          c <= available &&
          (score > bestScore || (score === bestScore && c < bestCost))
        ) {
          best = mask;
          bestScore = score;
          bestCost = c;
        }
      }
      const chosen = costs.map((_, i) => (best >> i) & 1);
      return result(
        [
          stage(
            "Reserve fixed context",
            "system/instructions也占context，不能把total budget全部分给retrieved memory。",
            `available=${budget}−100=${available}`,
            ["system tokens", "memory budget"],
            [100, available],
            "tokens",
          ),
          stage(
            "Measure candidate costs",
            "token成本与task relevance是不同量，长memory不自动更有用。",
            `costs=[120,80,250]; utility=[6,4,1]`,
            ["A tokens", "B tokens", "C tokens"],
            costs,
            "tokens",
          ),
          stage(
            "Select a feasible subset",
            "穷举所有8个subset，最大化声明的additive utility；tie取更少tokens。",
            `selected=[${chosen.join(",")}]; utility=${bestScore}`,
            ["select A", "select B", "select C"],
            chosen,
            "0/1",
          ),
          stage(
            "Construct context",
            "只拼接被选择的memory；本例不把summary当作无损压缩。",
            `used=100+${bestCost}=${100 + bestCost}; spare=${budget - 100 - bestCost}`,
            ["system", "selected memories", "remaining"],
            [100, bestCost, budget - 100 - bestCost],
            "tokens",
          ),
        ],
        "Retained memory utility",
        bestScore,
        "toy utility",
      );
    },
    {
      use: [
        "历史信息多于context window时，需要明确retrieval、summary和memory生命周期。",
        "Single-cell分析Agent应优先保留dataset版本、split、parameter与provenance；过期的分析结论不能无限复用。",
      ],
      tune: [
        "先预留system、current question与output budget，再用task-relevance筛memory；命中事实少时检查retrieval而非只扩大context。",
        "从少量有source和timestamp的memory开始；conflict增多时加版本、expiration和去重。",
      ],
      debug: [
        "回答引用了过期参数",
        "检查memory provenance、timestamp和最新run ID",
        "按版本优先，标记已失效记录并在回答中绑定来源。",
        "context很长但关键事实丢失",
        "检查实际token计数与truncation位置",
        "保留必须字段，压缩低utility历史并测试retrieval recall。",
      ],
      boundary:
        "精确求解3项knapsack说明budget allocation；utility人为指定且可加，不代表真实LLM recall、importance estimator或tokenizer输出。",
    },
  ),
  "agent-evaluation": make(
    "agent-evaluation",
    "pass@k与pass^k为何会随k向相反方向变化？",
    "假设每次独立成功概率p=.8；pass@k指至少成功一次，pass^k指k次全部成功；不是实测Agent结果。",
    control(
      "Repeated trials k",
      1,
      6,
      1,
      3,
      "从3开始；same task重复运行用于观察稳定性，但现实trial可能相关。",
    ),
    (k) => {
      const p = 0.8,
        all = p ** k,
        any = 1 - (1 - p) ** k,
        expected = sum(Array.from({ length: k }, (_, i) => (1 - p) ** i));
      return result(
        [
          stage(
            "Define the trial outcome",
            "success需由environment final state判定，不能只看Agent声称成功。",
            `p=.8; k=${k}; independent Bernoulli assumption`,
            ["single success probability", "single failure probability"],
            [p, 1 - p],
            "probability",
          ),
          stage(
            "At least one success",
            "至少一次成功是全失败的补集。",
            `pass@${k}=1−.2^${k}=${fmt(any)}`,
            ["at least one success", "all fail"],
            [any, 1 - any],
            "probability",
          ),
          stage(
            "Reliability across all trials",
            "pass^k要求每次都成功，比best-of-k严格。",
            `pass^${k}=.8^${k}=${fmt(all)}`,
            ["all succeed", "at least one failure"],
            [all, 1 - all],
            "probability",
          ),
          stage(
            "Retry cost",
            "若首次成功就停止，期望calls=Σ_{i=0}^{k−1}(1−p)^i；k次全跑另计。",
            `E[calls]=${fmt(expected)}; fixed k calls=${k}`,
            ["stop-on-success expected calls", "run-all calls"],
            [expected, k],
            "calls",
          ),
        ],
        "All-trials success probability",
        all,
      );
    },
    {
      use: [
        "Agent上线前应同时评估task success与repeatability；pass@k高可能掩盖同一任务的不稳定。",
        "科学分析任务还需检查data leakage、code execution、artifact完整性和provenance，不只用LLM-as-judge。",
      ],
      tune: [
        "先为每task写可执行success criterion，固定tool/data版本并重复多seed；增加k时同时报告cost。",
        "从分层task set和failure taxonomy开始；某类失败集中时扩大对应测试而非只加容易题。",
      ],
      debug: [
        "benchmark高但用户重复失败",
        "检查是否只报告best-of-k及是否重试改变预算",
        "报告pass^k、single-run success和完整retry cost。",
        "两次评估分数差异大",
        "检查task sample、environment变化和trial相关性",
        "锁定fixtures，给置信区间并保留per-task traces。",
      ],
      boundary:
        "p=.8和独立性都是声明的数学假设；这是metric定义的推导，不是任何Agent实测成功率或τ-bench分数。",
    },
  ),
  "agent-security-boundaries": make(
    "agent-security-boundaries",
    "Prompt里的tool请求怎样被executor权限截断？",
    "untrusted text依次请求read、delete、send、grant；application allowlist只允许read；没有真实tool调用。",
    control(
      "Requested actions in prefix",
      1,
      4,
      1,
      3,
      "从3开始；增加不可信请求不会自动增加权限。",
    ),
    (n) => {
      const names = ["read", "delete", "send", "grant"],
        requested = names.map((_, i) => Number(i < n)),
        allowed = [1, 0, 0, 0],
        executed = requested.map((x, i) => x * allowed[i]),
        blocked = requested.map((x, i) => x - executed[i]);
      return result(
        [
          stage(
            "Parse untrusted requests",
            "外部文本可以提出要求，但文本不是用户授权。",
            `requested first ${n} actions`,
            names.map((x) => `request ${x}`),
            requested,
            "0/1",
          ),
          stage(
            "Consult application policy",
            "policy来自可信控制层；untrusted result不能修改allowlist。",
            `allowlist={read}`,
            names.map((x) => `allow ${x}`),
            allowed,
            "0/1",
          ),
          stage(
            "Enforce intersection",
            "executor只接受requested∩allowed，并在每次执行前重检。",
            `executed_i=requested_i×allowed_i`,
            names.map((x) => `execute ${x}`),
            executed,
            "0/1",
          ),
          stage(
            "Audit blocked actions",
            "拒绝记录和完成状态需要可见；blocked不应伪装成执行成功。",
            `blocked=${sum(blocked)}; executed=${sum(executed)}`,
            ["executed actions", "blocked actions"],
            [sum(executed), sum(blocked)],
            "actions",
          ),
        ],
        "Blocked untrusted actions",
        sum(blocked),
        "actions",
      );
    },
    {
      use: [
        "Agent读取网页、论文、tool output或repo文件时，要分离data和instructions，避免prompt injection提升权限。",
        "read-only分析与写入/发送/删除应有不同capability边界；MCP连接本身不赋予任意操作许可。",
      ],
      tune: [
        "从最小allowlist、scoped credentials和read-only tools开始；确有任务需要时再明确扩大scope。",
        "为高影响side effects定义idempotency、audit和必要的人类授权；将攻击fixtures加入回归测试。",
      ],
      debug: [
        "网页文字触发了写操作",
        "检查是否把retrieved text当system/user指令以及executor是否独立授权",
        "隔离untrusted content，并在tool boundary强制权限。",
        "拒绝后Agent仍报告完成",
        "检查result schema和done predicate是否区分blocked/failed/success",
        "传播真实状态，要求可验证side-effect receipt。",
      ],
      boundary:
        "deterministic allowlist交集演示；不是完整security model、prompt-injection攻击成功率或已验证的产品防护能力。",
    },
  ),
  "multi-agent-orchestration": make(
    "multi-agent-orchestration",
    "增加workers何时减少latency、何时只增加overhead？",
    "8个独立同长jobs，每个3s；w workers均分waves；coordination overhead=.5(w−1)s；最后统一join。",
    control(
      "Parallel workers w",
      1,
      4,
      1,
      2,
      "从2开始；假设任务完全独立、没有rate limit和worker failures。",
    ),
    (w) => {
      const waves = Math.ceil(8 / w),
        work = waves * 3,
        overhead = 0.5 * (w - 1),
        total = work + overhead,
        assign = Array.from(
          { length: w },
          (_, i) => Math.floor(8 / w) + Number(i < 8 % w),
        );
      return result(
        [
          stage(
            "Partition independent work",
            "只有无共享write冲突、依赖明确的jobs才能在这个模型中并行。",
            `8 jobs / ${w} workers; assignment=[${assign.join(",")}]`,
            assign.map((_, i) => `worker${i + 1}`),
            assign,
            "jobs",
          ),
          stage(
            "Execute in waves",
            "latency由最忙worker决定，不是sum所有worker的工作时间。",
            `waves=ceil(8/${w})=${waves}; execution=${work}s`,
            ["parallel execution", "serial execution"],
            [work, 24],
            "s",
          ),
          stage(
            "Add coordination",
            "spawn、handoff、merge都有成本；这里overhead由fixture声明。",
            `coordination=.5(${w}−1)=${fmt(overhead)}s`,
            ["execution", "coordination"],
            [work, overhead],
            "s",
          ),
          stage(
            "Join and account",
            "总worker工作量仍是24 worker-seconds；wall time下降不等于token成本下降。",
            `latency=${fmt(total)}s; speedup=24/${fmt(total)}=${fmt(24 / total)}`,
            ["parallel wall time", "serial wall time"],
            [total, 24],
            "s",
          ),
        ],
        "Parallel wall time",
        total,
        "s",
      );
    },
    {
      use: [
        "可独立检索、检查不同模块或分析不同cohort时，multi-agent分工可缩短wall time。",
        "共享文件、依赖链或判断标准不一致时，并行可能增加冲突；先明确ownership和integration contract。",
      ],
      tune: [
        "从2 workers开始测实际wall time与token cost；rate limit、merge等待或重复工作增多时减少并发。",
        "按独立子任务拆分并预留最终review；worker数量不应超过可独立且有足够粒度的任务数。",
      ],
      debug: [
        "多个Agent改坏同一文件",
        "检查ownership、shared state和merge规则",
        "分开文件责任并顺序处理依赖写入。",
        "workers都结束但整体没完成",
        "检查join条件是否包含integration和validation",
        "由orchestrator核对产物契约并跑全局检查。",
      ],
      boundary:
        "同长独立jobs的排程模型，overhead人为给定；没有真实多Agent性能数据，不说明增加LLM agents一定更准确。",
    },
  ),
  "model-context-protocol": make(
    "model-context-protocol",
    "MCP discovery之后为何还需要application tool selection？",
    "Server advertised tools=[search,read,write,delete]；client application只批准search/read。参数表示本次声明列表的prefix长度；protocol采用pinned 2025-06-18概念。",
    control(
      "Discovered tool count",
      1,
      4,
      1,
      3,
      "从3开始；先initialize，再tools/list，最后只调用应用允许的工具。",
    ),
    (n) => {
      const names = ["search", "read", "write", "delete"],
        discovered = names.map((_, i) => Number(i < n)),
        policy = [1, 1, 0, 0],
        usable = discovered.map((x, i) => x * policy[i]),
        calls = sum(usable),
        requests = 2 + calls,
        notifications = 1;
      return result(
        [
          stage(
            "Initialize connection",
            "initialize request/response交换版本与capabilities，随后client发送initialized notification。",
            `JSON-RPC requests before tool calls: initialize + tools/list = 2`,
            [
              "initialize request",
              "initialized notification",
              "tools/list request",
            ],
            [1, notifications, 1],
            "messages sent",
          ),
          stage(
            "Discover exposed tools",
            "advertised tool list不等于用户已授权所有tool；tools capability支持发现/调用流程。",
            `tools/list returns ${n} names`,
            names.map((x) => `discover ${x}`),
            discovered,
            "0/1",
          ),
          stage(
            "Apply host policy",
            "这是application层的tool allowlist，不是虚构的MCP permission-negotiation message。",
            `usable=discovered∩{search,read}`,
            names.map((x) => `host permits ${x}`),
            usable,
            "0/1",
          ),
          stage(
            "Call and correlate responses",
            "每个request使用不同id；notifications无id且不期待response。此fixture每个允许tool调用一次。",
            `requests=2+${calls}=${requests}; responses=${requests}; notifications=1`,
            ["requests", "matching responses", "notifications"],
            [requests, requests, notifications],
            "messages",
          ),
        ],
        "Usable discovered tools",
        calls,
        "tools",
      );
    },
    {
      use: [
        "需要用统一protocol连接不同tool/data servers时，MCP可规范discovery、request/response和lifecycle。",
        "MCP不替代tool语义、业务授权或output validation；不要把标准接口理解成模型一定能正确使用工具。",
      ],
      tune: [
        "先pin protocol/SDK版本并跑initialize→initialized→tools/list→tools/call最小trace；再添加pagination、timeout和error handling。",
        "从少量清晰描述的tools开始；工具选择混乱时合并重复能力或缩小host暴露列表。",
      ],
      debug: [
        "能连接但看不到tools",
        "检查initialize capability、tools/list响应和分页cursor",
        "按协议顺序重放trace并处理nextCursor。",
        "response关联错请求",
        "检查并发request id唯一性和notification是否错误带id",
        "使用严格JSON-RPC dispatcher，分别处理request、response、notification。",
      ],
      boundary:
        "固定协议版本的简化message计数，不发网络请求；host allowlist为教学application policy，非协议新增权限机制。",
    },
  ),
  "agent-state-checkpoints": make(
    "agent-state-checkpoints",
    "Checkpoint恢复为何仍可能重复外部写入？",
    "三步：prepare并checkpoint S1→external write→记录receipt并checkpoint S2。crash位置0=写前，1=写后但S2前，2=S2后；恢复后必须完成一次logical write。",
    control(
      "Crash position (0/1/2)",
      0,
      2,
      1,
      1,
      "从1开始看最危险窗口；stable idempotency key由external service强制去重。",
    ),
    (c) => {
      const beforeWrite = Number(c >= 1),
        receiptSaved = Number(c === 2),
        retry = Number(!receiptSaved),
        attempts = beforeWrite + retry,
        naive = attempts,
        dedup = 1,
        duplicates = Math.max(0, naive - 1),
        replayed = receiptSaved ? 0 : 1;
      return result(
        [
          stage(
            "Locate crash boundary",
            "只有S2包含完成receipt；external write成功不代表local checkpoint已提交。",
            `position=${c}; write occurred=${beforeWrite}; receipt saved=${receiptSaved}`,
            ["write before crash", "receipt checkpoint saved"],
            [beforeWrite, receiptSaved],
            "0/1",
          ),
          stage(
            "Resume from durable state",
            "S1恢复无法仅凭local state区分write是否已成功；S2恢复可直接跳过。",
            `retry write=${retry}; total attempts=${attempts}`,
            ["pre-crash attempt", "post-resume attempt"],
            [beforeWrite, retry],
            "attempts",
          ),
          stage(
            "Compare external semantics",
            "没有idempotency，crash在1会重复side effect；stable key只有被server原子执行时才有效。",
            `naive writes=${naive}; idempotent logical writes=${dedup}`,
            ["naive external writes", "deduplicated writes"],
            [naive, dedup],
            "writes",
          ),
          stage(
            "Audit recovery result",
            "checkpoint解决state恢复；external exactly-once effect仍依赖事务/去重设计。",
            `duplicate naive effects=${duplicates}; replayed write step=${replayed}`,
            ["duplicate effects", "replayed write steps"],
            [duplicates, replayed],
            "count",
          ),
        ],
        "Naive duplicate side effects",
        duplicates,
        "effects",
      );
    },
    {
      use: [
        "长运行Agent需要恢复、暂停、人工review和审计时，checkpoints应保存可恢复state与tool receipts。",
        "外部支付、发信或写数据库与checkpoint不在同一事务时，有failure window；恢复不自动保证exactly-once。",
      ],
      tune: [
        "先在每个有意义state transition后checkpoint，并给logical operation稳定idempotency key；用故障注入测各边界。",
        "从durable checkpointer开始；checkpoint太频繁影响latency时，合并纯计算步骤但保留side-effect边界审计。",
      ],
      debug: [
        "重启后同一操作执行两次",
        "检查external成功与receipt checkpoint之间的窗口",
        "让server按stable key原子去重；若使用transactional outbox，仍需下游consumer idempotency，不能仅靠prompt禁止重复。",
        "进程重启后无可恢复state",
        "检查是否用了in-memory saver及thread/run ID是否一致",
        "使用durable storage，验证重启后的真实恢复而非同进程resume。",
      ],
      boundary:
        "三种确定crash位置的事务示意；stable key本身不保证去重，假设external service原子保存key与effect；未运行真实LangGraph或外部服务。",
    },
  ),
};
