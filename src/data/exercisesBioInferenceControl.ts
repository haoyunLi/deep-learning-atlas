import type { Exercise } from "./exerciseTypes";

export const bioInferenceControlExercises: Record<string, Exercise[]> = {
  "em-objective-diagnostics": [
    {
      id: "em-objective-diagnostics-mechanism",
      kind: "mechanism",
      question:
        "Fixed-variance GMM：x=[0,2]，E-step 的 first-component responsibilities=[0.880797,0.119203]。M-step 的第一均值是什么？",
      options: [
        "0，因为第一个点的 argmax 是 component 1",
        "0.238406，因为 soft effective count 为 1",
        "1，因为两点无权平均为 1",
        "0.119203，因为 responsibility 就是新均值",
      ],
      answer: 1,
      explanation:
        "N₁=0.880797+0.119203=1；μ₁′=(0×0.880797+2×0.119203)/1=0.238406。M-step 使用固定旧 R 的 weighted sufficient statistics。先取 argmax 会变成另一个 hard-assignment update。",
    },
    {
      id: "em-objective-diagnostics-decision",
      kind: "decision",
      question:
        "自由 covariance 的 GMM 中，一个 component 的 effective count 接近 1、最小 eigenvalue 趋近 0，同时 training likelihood 急升。下一步最合理是什么？",
      options: [
        "立即当成更真实的 rare cell type",
        "只增加 max iterations，直到 responsibility 全为 0/1",
        "检查 covariance collapse，比较正则化/family/seed，并用独立 evidence 验证",
        "关闭 likelihood 日志，因为上升总是正常",
      ],
      answer: 2,
      explanation:
        "Gaussian component 可缩向单点产生 singular likelihood。高 training likelihood 不等于 rare biology；需查 Nₖ、eigenvalues、输入尺度、regularization 与独立 fit/boundary evidence。更改 regularization 后要注明实际 objective。",
    },
  ],
  "count-mixture-background": [
    {
      id: "count-mixture-background-mechanism",
      kind: "mechanism",
      question:
        "Cell profile=[0.9,0.1]、ambient=[0.2,0.8]、α=0.2、expected library size=10。第二 gene 的 expected count 及 ambient contribution 是多少？",
      options: [
        "1 与 0，因为 cell profile 没变",
        "2.4 与 1.6",
        "8 与 2，因为 ambient 第二项是 0.8",
        "2.4 与 2.4，因为所有非主 marker 都来自 ambient",
      ],
      answer: 1,
      explanation:
        "Cellular contribution=10×(1−0.2)×0.1=0.8，ambient contribution=10×0.2×0.8=1.6，总计 2.4。这些是 model expectations，不是已知每一个 molecule 的真实来源。",
    },
    {
      id: "count-mixture-background-decision",
      kind: "decision",
      question:
        "一个 spot 明确覆盖多个 cells，且 reference 缺少一种 type。最合理的建模判断是什么？",
      options: [
        "选 single categorical z，并把最大 posterior 当唯一真实 type",
        "先用 additive abundance model，检查 missing reference/background 敏感性，承认可识别性限制",
        "先把 normalized values 四舍五入，便恢复原始 UMI likelihood",
        "把所有未知 counts 都叫 ambient，因此不再需要新 reference",
      ],
      answer: 1,
      explanation:
        "多来源 spot 可需要 additive contributions。缺少 reference type 时，其 signal 可能被已有 types 或 background 吸收；仅提高拟合复杂度不能证明分解正确。Raw counts、reference coverage 与独立 evidence 都需要检查。",
    },
  ],
  "structured-assignment-inference": [
    {
      id: "structured-assignment-inference-mechanism",
      kind: "mechanism",
      question:
        "Local probabilities：bin1=[0.6,0.4]、bin2=[0.9,0.1]；限制每个 cell 恰接收一个 bin。Conditioned posterior 中 P(bin1=A) 是多少？",
      options: [
        "0.6，因为每个 bin 独立",
        "0.5，因为两种 configurations",
        "1/7，因为 AB 的 weight 0.06，BA 的 weight 0.36",
        "0，因为 MAP 是 BA，所以 marginal 也必须为 0",
      ],
      answer: 2,
      explanation:
        "合法 configurations 只有 AB 与 BA，weights 为 0.6×0.1=0.06 与 0.4×0.9=0.36。P(bin1=A|F)=0.06/0.42=1/7。MAP 选 BA，但 posterior 仍保留 AB 的 1/7，不确定性与硬解不同。",
    },
    {
      id: "structured-assignment-inference-decision",
      kind: "decision",
      question:
        "每个真实 cell 能接收许多 transcripts；开发者想直接用一一对应 linear assignment，并在独立 softmax 后删掉冲突项。最合理的修正是什么？",
      options: [
        "一一对应永远更严格，因此更符合 biology",
        "只降低 temperature，就会自动满足所有 capacities",
        "先定义 many-to-one capacity 与 unmatched，再选 solver；删冲突项不是自动正确的 structured E-step",
        "给每个 cell 相同 transcript quota，保证 expression 没有差异",
      ],
      answer: 2,
      explanation:
        "Constraint 必须匹配观测单位和真实问题。一一对应会错误排除合法多 transcript 归属；post-hoc deletion 也没有给出 coupled posterior。先定义 feasible set，再区分 MAP、posterior marginals 与 relaxation。",
    },
  ],
  "spatial-mdp-design": [
    {
      id: "spatial-mdp-design-mechanism",
      kind: "mechanism",
      question:
        "Action A 立即奖励 3 并结束；B 奖励序列为 [0,5]。在 γ=0.9 与 γ=0.5 时，最优选择分别是什么？",
      options: [
        "都是 A，第一步总是最重要",
        "都是 B，最后 reward 最大",
        "γ=0.9 选 B；γ=0.5 选 A",
        "无法计算，必须训练 PPO",
      ],
      answer: 2,
      explanation:
        "A return=3；B return=γ×5。γ=0.9 得 4.5>3，γ=0.5 得 2.5<3。Discount 改变目标排序；已知 tiny transition 可直接枚举，RL 并非计算答案的必要条件。",
    },
    {
      id: "spatial-mdp-design-decision",
      kind: "decision",
      question:
        "所有 bin-to-cell costs 与 capacities 已固定且可直接读取，唯一任务是求一张 assignment table。开始 RL 之前最有用的步骤是什么？",
      options: [
        "把每个循环称为 episode，说明 RL 必要",
        "建立 exact/static 与 fixed-budget local-search baselines，验证 RL 是否改善质量或速度",
        "只报告 training reward，避免比较 compute budget",
        "把 action probabilities 直接当 cell identity posterior",
      ],
      answer: 1,
      explanation:
        "Static constraints 可以造成 global coupling，但不因此必须用 RL。可将 solver 构造成 computational MDP 来研究 learned search；其收益应由 equal-budget、unseen-instance 比较验证，且与 biological causal dynamics 分开。",
    },
  ],
  "reward-shaping-constraints": [
    {
      id: "reward-shaping-constraints-mechanism",
      kind: "mechanism",
      question:
        "Base rewards=[0,5]、γ=0.9、potentials=[2,3,0]。使用 F=γΦ(next)−Φ(current) 后，shaped discounted return 是多少？",
      options: [
        "4.5，因为每一步 reward 都不变",
        "2.5，因为 shaping terms=[0.7,−3]，return=0.7+0.9×2",
        "2.8，因为 shaping 不需要 γ",
        "7.5，因为 potential 总是 bonus",
      ],
      answer: 1,
      explanation:
        "F₀=0.9×3−2=0.7，F₁=0.9×0−3=−3；r′=[0.7,2]，G′=2.5。它等于 base G=4.5 减初态 Φ=2。Terminal Φ=0 与一致 γ 使边界项消失。",
    },
    {
      id: "reward-shaping-constraints-decision",
      kind: "decision",
      question:
        "Illegal merge 增加 100 expression-score，penalty 为 10，因此 learner 常违规。哪项解释与处理正确？",
      options: [
        "已使用 penalty，所以不可能违规",
        "将 penalty 名字改成 safety，便有硬保证",
        "有限 penalty 允许 trade-off；若确为不可接受规则，应显式限制动作并分别报告 cost",
        "只增加 entropy bonus，就一定安全",
      ],
      answer: 2,
      explanation:
        "总分仍增加 100−10=90，因此优化器可能偏好违规。Hard feasibility、expected cost constraint 与 reward penalty 是不同要求；还要验证 mask、fallback 与执行端 bookkeeping。",
    },
  ],
  "spatial-policy-ope": [
    {
      id: "spatial-policy-ope-mechanism",
      kind: "mechanism",
      question:
        "Logs 为 A,B,B,B，rewards=[4,1,1,1]；μ(A)=0.25、π(A)=0.5。IPS 与 ESS 是多少？",
      options: [
        "IPS=1.75、ESS=4，因为四行等权",
        "IPS=2.5、ESS=3",
        "IPS=4、ESS=1，因为 target 总选 A",
        "IPS=2.5、ESS=4，因为 IPS 已消除一切不确定性",
      ],
      answer: 1,
      explanation:
        "Weights=[2,2/3,2/3,2/3]；IPS=(8+2)/4=2.5。Σw=4，Σw²=4+4/3=16/3，ESS=16/(16/3)=3。这个 fixture 恰等于真实值，不代表四条 logs 足以获得高精度。",
    },
    {
      id: "spatial-policy-ope-decision",
      kind: "decision",
      question:
        "旧 policy 永远选 A，新 policy 一半选 B；同时新 pipeline 换了 candidate generation。能否给 μ(B)=0 加 ε 后直接声称新 pipeline 已验证？",
      options: [
        "能，只要 ε 足够小",
        "能，使用 DR 会自动恢复没观察过的 B outcomes",
        "不能：B 无 support，candidate/environment 改变又引入另一个 shift，需要新证据或明确额外假设",
        "能，因为新 policy 概率总和为 1",
      ],
      answer: 2,
      explanation:
        "ε 只改变公式，不能产生 B 的 counterfactual outcomes。Policy importance weighting 也不单独处理 candidate/transition/reward mechanism shift。应审计版本与支持，区分新环境 direct validation、模型外推和可识别的 OPE。",
    },
  ],
};
