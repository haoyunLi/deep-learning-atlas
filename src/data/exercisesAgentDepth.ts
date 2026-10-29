import type { Exercise } from "./exerciseTypes";

export const agentDepthExercises: Record<string, Exercise[]> = {
  "mcts-uct-search": [
    {
      id: "mcts-uct-search-mechanism",
      kind: "mechanism",
      question:
        "Root N=10。A:N=8,Q=.6；B:N=2,Q=.4；UCT=Q+√(ln10/N)。选中 B 的一次 simulation return=.9，正确的新 B 统计是什么？",
      options: [
        "N=3,W=1.7,Q≈.566667",
        "N=3,W=.9,Q=.3",
        "N=2,W=1.7,Q=.85",
        "N=3,Q=1.47298，因为 UCT 就是均值",
      ],
      answer: 0,
      explanation:
        "选择前 B 的 W=2×.4=.8；一次 backup 加 .9 得 W=1.7，N=3，Q=1.7/3。Root N 也从10变11。UCT 的 bonus 只影响计算分配，不能写入累计真实/simulated return。",
    },
    {
      id: "mcts-uct-search-decision",
      kind: "decision",
      question:
        "搜索预算用完时，B 的 UCT 比 A 大，但预先约定 root 按 visit count 执行动作，当前 A:N=8、B:N=3。应该怎样处理？",
      options: [
        "执行 B，并把 UCT 当 action probability",
        "重新训练 model，直到 B 访问数更高",
        "按声明规则执行 A，并分别报告 root counts、Q 与搜索预算",
        "只要增加一次模拟就一定得到最优动作",
      ],
      answer: 2,
      explanation:
        "Selection rule 与最终 execution rule 是两层设计。这个约定下选访问次数更多的 A；也可研究 max-Q 等规则，但需事先说明并评估。有限预算与不完美模型不提供无条件最优性。",
    },
  ],
  "contextual-bandits-linucb": [
    {
      id: "contextual-bandits-linucb-mechanism",
      kind: "mechanism",
      question:
        "Toy x=[1,0]，A_A=diag(4,1),b_A=[2,0]；A_B=I,b_B=0；α=1.2。LinUCB 如何选择？",
      options: [
        "A，因为 .5 均值永远高于0",
        "B，因为 A score=1.1、B score=1.2",
        "A，因为 B 没有 labels 就必须禁止",
        "随机各.5，因为 score>1 是错误",
      ],
      answer: 1,
      explanation:
        "A 的 θ=[.5,0]，uncertainty=.5；B 的 mean=0，uncertainty=1。因此 A=.5+1.2×.5=1.1，B=1.2。Score 不是概率，超过1不等于实现有错；α=.6则会选A。",
    },
    {
      id: "contextual-bandits-linucb-decision",
      kind: "decision",
      question:
        "Deterministic LinUCB 在某类 context 的日志中从未选 B。现在想离线评价总选 B 的策略，最关键的限制是什么？",
      options: [
        "只要 B 的 UCB bonus>0，就已经有非零 propensity",
        "把 B 未观察到的 rewards 填0即可",
        "提高模型容量后不再需要日志覆盖",
        "该 context-action 缺 support；不能凭现日志无条件识别新策略价值",
      ],
      answer: 3,
      explanation:
        "Exploration score 不等于 sampling probability。给定 history 的 argmax 可令其它 arms 的 propensity=0。需要真实有支持的 randomized logging 或额外可辩护的 modeling assumptions；未选择不是 reward=0。",
    },
  ],
  "beam-search-decoding": [
    {
      id: "beam-search-decoding-mechanism",
      kind: "mechanism",
      question:
        "首步 A=.6、B=.4；A→x=.51,y=.49；B→x=.1,y=.9；两内容tokens后EOS=1。Greedy 与 width=2 beam 最终 raw probabilities 是多少？",
      options: [
        "都为.6，因为只看第一步",
        ".36 与 .306",
        ".306 与 .36",
        "1.11 与1.3，因为应该相加概率",
      ],
      answer: 2,
      explanation:
        "Greedy 先选A再选x：.6×.51=.306。Beam2保留A/B，展开四条候选后By=.4×.9=.36居首。Sequence probability相乘，log probability相加；较高model score不自动表示答案更真实。",
    },
    {
      id: "beam-search-decoding-decision",
      kind: "decision",
      question:
        "两个已完成候选 short:P=.30,L=2 与 long:P=.24,L=4；L包含EOS。用 raw logP 改成 logP/L，哪项解释正确？",
      options: [
        "Raw偏好short，归一化偏好long；这是改变scoring objective",
        "两个分数都仍是概率且和必须为1",
        "长度归一化保证更正确，所以不用验证",
        "只要beam足够宽，长度项不会改变结果",
      ],
      answer: 0,
      explanation:
        "Raw: ln(.30)≈−1.20397 > ln(.24)≈−1.42712。除长度后short≈−.60199，long≈−.35678，排名翻转。不同library的length penalty、EOS计数与stopping约定也需核对。",
    },
  ],
  "grammar-constrained-decoding": [
    {
      id: "grammar-constrained-decoding-mechanism",
      kind: "mechanism",
      question:
        "Toy未完成prefix的probabilities按[0,1,x,EOS]为[.1,.2,.6,.1]，grammar只允许0/1继续。Mask后选择1的概率是多少？",
      options: [
        ".2，因为过滤不会改变sampling概率",
        "2/3，因为保留质量为.3，随后归一化",
        ".6，因为最大原概率应优先",
        "1，因为grammar要求最终完整",
      ],
      answer: 1,
      explanation:
        "允许质量Z=.1+.2=.3，因此P_mask(1)=.2/.3=2/3。Mask更改了sampling distribution；合法prefix仍可能未完成，EOS只能在该toy满两位后开放。",
    },
    {
      id: "grammar-constrained-decoding-decision",
      kind: "decision",
      question:
        "首步A/B各.5；A后合法结束的原概率.9，B后仅.1。逐步mask在首步保留两者各.5。它是否等价于原模型在最终合法条件下的distribution？",
      options: [
        "是，任何mask都只相当于全局条件化",
        "是，因为第一个token分布没变",
        "否，因此mask完全不能生成合法输出",
        "否；全局合法mass为.45/.05，条件化得到.9/.1，与local .5/.5不同",
      ],
      answer: 3,
      explanation:
        "Local mask只看当前候选是否仍可完成，不自动乘上未来合法completion的概率。它可保证支持的grammar形式，却通常不保持全局conditional distribution；更不保证字段事实正确或获准执行。",
    },
  ],
  "speculative-decoding": [
    {
      id: "speculative-decoding-mechanism",
      kind: "mechanism",
      question:
        "Target p=[.5,.3,.2]、draft q=[.2,.5,.3]。接受质量为[.2,.3,.2]、拒绝率.3。正确 residual 与最终输出分布是什么？",
      options: [
        "residual=p，最终[.35,.39,.26]",
        "residual=q，最终[.26,.45,.29]",
        "residual=[1,0,0]，最终[.5,.3,.2]",
        "不需residual，直接归一化[.2,.3,.2]",
      ],
      answer: 2,
      explanation:
        "max(p−q,0)=[.3,0,0]，归一化为[1,0,0]。接受质量加.3×residual精确恢复p。拒绝后直接从p抽会产生第一项所示偏差，不满足target distribution保持。",
    },
    {
      id: "speculative-decoding-decision",
      kind: "decision",
      question:
        "一个draft更强、acceptance更高，但自身调用和verification成本也更大。能否据acceptance alone判断加速？",
      options: [
        "不能，要测block输出数、draft/verify成本、batch/hardware与端到端latency",
        "能，acceptance越高必然越快",
        "能，接受的token不需要任何计算",
        "不能，因为speculative decoding一定比target-only慢",
      ],
      answer: 0,
      explanation:
        "简化toy α=.7,m=3得到2.533 tokens/block；只有额外假定target10ms、draft每步1ms，才有2.533×10/13≈1.948倍估计。真实设备、长度、EOS与并发会改变收益，分布正确和性能改善要分别验证。",
    },
  ],
  "agent-state-checkpoints": [
    {
      id: "agent-state-checkpoints-mechanism",
      kind: "mechanism",
      question:
        "Toy retrieve2s+analyze3s+write5s；write外部成功后本地崩溃。恢复查询receipt1s、verify1s。正确恢复总耗时与effect count是多少？",
      options: [
        "11s与0，因为checkpoint替代真实写入",
        "12s与1，前提是receipt匹配原逻辑操作与artifact revision",
        "21s与1，不管key如何变化",
        "12s与2，因为任何resume都必须重写",
      ],
      answer: 1,
      explanation:
        "崩溃前已用10s；恢复查询1s+verify1s，总12s且未重复effect。若新key整条重跑需额外11s，总21s、toy产生两个artifacts。这里耗时均人为设定，checkpoint不自动等同外部事务。",
    },
    {
      id: "agent-state-checkpoints-decision",
      kind: "decision",
      question:
        "两个workers都读到state revision7；A已原子提交为8，B随后拿expected_revision7提交。最合适行为是什么？",
      options: [
        "覆盖A，因为B更晚提交",
        "把revision改回7，保持两者一致",
        "把两段自然语言总结拼起来就等于原子合并",
        "拒绝stale write，重新读取并按明确merge/recompute规则处理",
      ],
      answer: 3,
      explanation:
        "Compare-and-set检查读写期间状态是否变化，避免lost update。它与external effect deduplication不同：revision保护共享state，stable effect key与receipt帮助核对外部操作，两者不能互相替代。",
    },
  ],
};
