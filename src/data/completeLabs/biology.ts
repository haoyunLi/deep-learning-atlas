import type {
  CompleteLab,
  CompleteLabMap,
  LabCalculation,
  LabChart,
  LabControl,
  LabMetric,
  LabStage,
} from "./types";
import { bars, line, matrix, metric, fmt, sum } from "./types";

const control = (
  id: string,
  label: string,
  min: number,
  max: number,
  step: number,
  initial: number,
  hint: string,
): LabControl => ({ id, label, min, max, step, initial, hint });
const stage = (
  title: string,
  explanation: string,
  formula: string,
  metrics: LabMetric[],
  chart: LabChart,
): LabStage => ({ title, explanation, formula, metrics, chart });
const numbers = (labels: string[], values: number[], unit: string) =>
  values.map((v, i) => metric(labels[i], v, unit));
const choose = (n: number, k: number) => {
  let answer = 1;
  for (let i = 1; i <= k; i++) answer = (answer * (n - i + 1)) / i;
  return answer;
};
export function alleleDistribution(n: number, p: number) {
  return Array.from(
    { length: n + 1 },
    (_, k) => choose(n, k) * p ** k * (1 - p) ** (n - k),
  );
}
export function lrLabelPermutations(r: number) {
  const cells = Array.from({ length: 6 }, (_, i) =>
    i < 3 ? [4, 0, 0] : [0, 4, r],
  );
  const score = (senders: number[]) => {
    const receivers = [0, 1, 2, 3, 4, 5].filter((i) => !senders.includes(i));
    const ligand = sum(senders.map((i) => cells[i][0])) / 3;
    const r1 = sum(receivers.map((i) => cells[i][1])) / 3;
    const r2 = sum(receivers.map((i) => cells[i][2])) / 3;
    return (ligand + Math.min(r1, r2)) / 2;
  };
  const scores: number[] = [];
  for (let a = 0; a < 4; a++)
    for (let b = a + 1; b < 5; b++)
      for (let c = b + 1; c < 6; c++) scores.push(score([a, b, c]));
  return { cells, observed: score([0, 1, 2]), scores };
}
const define = (lab: CompleteLab): CompleteLab => lab;
export const biologyCompleteLabs: CompleteLabMap = {
  "motif-pwm-scoring": define({
    question: "相同的 AT，换 background 后 score 为什么变？",
    input:
      "沿用正文的两位置 motif：counts 为 [8,1,1,0] 和 [0,1,1,8]，列依次为 A,C,G,T。主要观察 AT，最后与 TT 比较。按 background 分配 total pseudocount α。",
    controls: [
      control(
        "gc",
        "Background G/C fraction",
        0.2,
        0.8,
        0.05,
        0.5,
        "q_C=q_G=GC/2，q_A=q_T=(1−GC)/2。改变 GC 会重算当前结果；固定对照保留原参数。",
      ),
      control(
        "alpha",
        "Total pseudocount α",
        0.1,
        4,
        0.1,
        1,
        "α是每位置加入的total count；不是每个base各加α。",
      ),
    ],
    calculate: ({ gc, alpha }): LabCalculation => {
      const q = [(1 - gc) / 2, gc / 2, gc / 2, (1 - gc) / 2],
        counts = [
          [8, 1, 1, 0],
          [0, 1, 1, 8],
        ],
        smoothed = counts.map((row) =>
          row.map((n, j) => (n + alpha * q[j]) / (10 + alpha)),
        ),
        selected = [smoothed[0][0], smoothed[1][3]],
        ratios = selected.map((p, i) => p / q[i === 0 ? 0 : 3]),
        bits = ratios.map((v) => Math.log2(v));
      const at = sum(bits),
        tt =
          Math.log2(smoothed[0][3] / q[3]) + Math.log2(smoothed[1][3] / q[3]);
      return {
        stages: [
          stage(
            "先固定 counts 与 background",
            "两行 motif counts 保持不变。先看原始观察，再明确当前 background 为每种 base 分配多少概率。",
            `q=[${q.map((v) => fmt(v)).join(", ")}]; N=10`,
            numbers(["q_A", "q_C", "q_G", "q_T"], q, "probability"),
            matrix(
              ["position1", "position2"],
              ["A", "C", "G", "T"],
              counts,
              "observed counts",
            ),
          ),
          stage(
            "加入 pseudocount 并归一化",
            "为 base b 加入 αq_b，再除以该位置的总 count。每行新增的总量为 α，转换后的概率之和仍为 1。",
            `p_j(b)=(n_jb+${fmt(alpha)}q_b)/(10+${fmt(alpha)})`,
            numbers(["P1(A)", "P2(T)"], selected, "probability"),
            matrix(
              ["position1", "position2"],
              ["A", "C", "G", "T"],
              smoothed,
              "motif probability",
            ),
          ),
          stage(
            "逐位置计算 log-odds",
            "对 AT 的每个位置，比较 motif probability 与 background probability；取 log2 后，两个位置的贡献可以相加。",
            `bits=[${bits.map((v) => fmt(v)).join(", ")}]; S_AT=Σbits`,
            numbers(["position1", "position2"], bits, "bits"),
            bars(
              ["position1 A", "position2 T"],
              bits,
              "log2 likelihood ratio (bits)",
            ),
          ),
          stage(
            "比较 AT 与 TT 的 score",
            "现在只改变待评分的 sequence：AT 与 TT 使用同一 motif 和 background。分数差反映 sequence compatibility，仍不是 P value 或 binding probability。",
            `S_AT=${fmt(at)}; S_TT=${fmt(tt)}`,
            numbers(["AT score", "TT score"], [at, tt], "bits"),
            bars(["AT", "TT"], [at, tt], "log2 likelihood ratio (bits)"),
          ),
        ],
        outcomes: [
          metric("AT score", at, "bits"),
          metric("AT minus TT", at - tt, "bits"),
        ],
      };
    },
    usage: [
      "用于理解motif与background的likelihood比较，并检查reference/alternate序列的score变化。",
      "实际binding还依赖chromatin、TF/cofactor与cell context；sequence相似性只提供一层证据。",
    ],
    tuning: [
      "本例从GC=.5、α=1开始；实际background应匹配问题与候选区域，工具默认需按版本记录。",
      "若hits被GC组成主导，比较matched background并重新校准null；不是只放宽score threshold。",
    ],
    troubleshooting: [
      {
        symptom: "相同motif换region set后hits骤增",
        check:
          "background composition、search universe与multiple testing是否一并改变。",
        action:
          "固定candidate universe做对照，再分别改变background与threshold。",
      },
      {
        symptom: "稀疏motif出现无穷log score",
        check: "是否有zero probabilities、遗漏pseudocount或错误background。",
        action: "使用明确的smoothing约定并检查每行sum=1；本toyα始终>0。",
      },
    ],
    boundary:
      "只计算两个2-base windows的PWM evidence；不计算FIMO P/q values、不扫描完整genome、不预测真实binding。",
    source: {
      label: "FIMO scoring and background documentation",
      url: "https://meme-suite.org/meme/doc/fimo.html",
    },
  }),
  "enhancer-gene-abc": define({
    question: "E1没有变，为什么它的 ABC score 仍会变化？",
    input:
      "沿用正文的三个候选 elements：A=[4,2,1]，contact=[.1,c,.4]。它们对应同一 gene；只改变 E2 contact，其他输入和候选集合保持不变。",
    controls: [
      control(
        "contact",
        "E2 contact c",
        0,
        0.6,
        0.05,
        0.2,
        "contact是本toy的无量纲权重；不是把它当单cell真实碰撞概率。",
      ),
    ],
    calculate: ({ contact }): LabCalculation => {
      const A = [4, 2, 1],
        C = [0.1, contact, 0.4],
        w = A.map((a, i) => a * C[i]),
        total = sum(w),
        scores = w.map((x) => x / total);
      return {
        stages: [
          stage(
            "固定候选与两类输入",
            "先分别读 activity 和 contact：图中展示 A，中间数值列出 C。两者有不同含义，下一步才计算乘积。",
            "A=[4,2,1]; C=[.1,c,.4]",
            numbers(
              ["E1 contact", "E2 contact", "E3 contact"],
              C,
              "contact weight",
            ),
            bars(["E1", "E2", "E3"], A, "relative activity A"),
          ),
          stage(
            "相乘得到 regulatory weights",
            "逐个计算 A×C。较低 activity 可以被较高 contact 补偿，因此只按其中一个量排序，可能得到不同结果。",
            `w=A×C=[${w.map((v) => fmt(v)).join(", ")}]`,
            numbers(["E1 numerator", "E2 numerator", "E3 numerator"], w, "A×C"),
            bars(["E1", "E2", "E3"], w, "unnormalized regulatory weight"),
          ),
          stage(
            "合计同一 gene 的候选 weights",
            "把三个 weights 相加得到分母。E1 numerator 始终为 .4，但改变 E2 contact 仍会改变这个总和。",
            `total=.4+2×${fmt(contact)}+.4=${fmt(total)}`,
            numbers(["total", "E1 numerator"], [total, 0.4], "A×C"),
            bars(
              ["E1 weight", "E2 weight", "E3 weight", "total"],
              [...w, total],
              "unnormalized regulatory weight",
            ),
          ),
          stage(
            "归一化并比较 ABC scores",
            "最后用各自 weight 除以总和。若 E1 score 改变，先回看分母：本例并没有新增 E1 activity 的证据。",
            `ABC=[${scores.map((v) => fmt(v)).join(", ")}]; ΣABC=1`,
            numbers(["E1", "E2", "E3"], scores, "relative score"),
            bars(["E1", "E2", "E3"], scores, "ABC relative score"),
          ),
        ],
        outcomes: [
          metric("E1 ABC score", scores[0]),
          metric("E2 ABC score", scores[1]),
          metric("Total raw weight", total, "A×C"),
        ],
      };
    },
    usage: [
      "对同一gene的candidate enhancer links进行可解释排序，适合检查activity/contact/denominator各自贡献。",
      "Nearest gene和spatial contact可作候选线索，功能target还需independent validation。",
    ],
    tuning: [
      "先固定candidate universe和输入normalization，再比较contact或activity替代方案。",
      "Score threshold应在独立functional validation和具体版本中校准；不存在跨context通用cutoff。",
    ],
    troubleshooting: [
      {
        symptom: "某element原始数据没变但score变了",
        check: "其他candidate的weights、promoter inclusion及window是否变动。",
        action: "一起检查numerator、denominator与完整candidate list。",
      },
      {
        symptom: "高ABC link没有functional效应",
        check:
          "数据context、assay quality、perturbation效率和score的relative含义。",
        action:
          "保留alternative explanations，使用独立perturbation及简单baselines评估。",
      },
    ],
    boundary:
      "只复算一个 gene、三个给定 elements 的 ABC normalization，不模拟 ATAC/H3K27ac 处理、Hi-C 估计或 CRISPR 结果。Bio/CS 关联实验使用另一组输入并改变候选集合，两例应比较分母机制，而不是直接比较数值。",
    source: {
      label: "Fulco et al., Activity-by-Contact (2019)",
      url: "https://www.nature.com/articles/s41588-019-0538-0",
    },
  }),
  "regulon-tf-activity": define({
    question: "Repressive target 改变，signed activity score 朝哪边走？",
    input:
      "沿用正文给定的 regulon：targets z=[2,1,z3]，weights=[1,1,−1]。z 是 contrast statistics；TF 自身的 transcript readout 保持不变。这里只改变第三个 target 的反应。",
    controls: [
      control(
        "target",
        "Repressed target z3",
        -3,
        3,
        0.25,
        -1,
        "负 weight 表示 prior 中预期 TF 抑制这个 target；该 target 上升会降低 signed score。",
      ),
    ],
    calculate: ({ target }): LabCalculation => {
      const z = [2, 1, target],
        w = [1, 1, -1],
        parts = z.map((v, i) => v * w[i]),
        den = sum(w.map(Math.abs)),
        signed = sum(parts) / den,
        unsigned = sum(z) / 3;
      return {
        stages: [
          stage(
            "先固定带符号的 network prior",
            "先读每条 edge 的 weight 与 sign。本实验把 network 作为已知输入，不从接下来的 target responses 反推 network。",
            "w=[+1,+1,−1]",
            numbers(["g1", "g2", "g3"], w, "regulatory weight"),
            bars(
              ["g1 activating", "g2 activating", "g3 repressive"],
              w,
              "signed prior weight",
            ),
          ),
          stage(
            "读取三个 targets 的变化",
            "现在读取 z=[2,1,z3]。这些是 targets 的变化；TF 自己的 RNA 并未进入这个 score。",
            `z=[2,1,${fmt(target)}]`,
            numbers(["g1", "g2", "g3"], z, "contrast z"),
            bars(["g1", "g2", "g3"], z, "target contrast statistic"),
          ),
          stage(
            "按 sign 计算每项贡献",
            "将每个 z 乘以对应 weight。对预期被抑制的 target，下降与 prior 方向一致，因此得到正贡献。",
            `w×z=[${parts.map((v) => fmt(v)).join(", ")}]`,
            numbers(
              ["g1 contribution", "g2 contribution", "g3 contribution"],
              parts,
              "weighted z",
            ),
            bars(["g1", "g2", "g3"], parts, "signed contribution"),
          ),
          stage(
            "用绝对 weights 归一化",
            "按本课定义除以 Σ|w|=3，得到 signed score。旁边的 unsigned mean 忽略了 sign，用来说明两种计算为什么会给出不同解释。",
            `signed=(3−(${fmt(target)}))/3=${fmt(signed)}; unsigned=(3+(${fmt(target)}))/3`,
            numbers(
              ["signed score", "unsigned mean"],
              [signed, unsigned],
              "normalized contrast",
            ),
            bars(
              ["signed score", "unsigned mean"],
              [signed, unsigned],
              "normalized target score",
            ),
          ),
        ],
        outcomes: [
          metric("Signed TF score", signed),
          metric("Unsigned mean", unsigned),
        ],
      };
    },
    usage: [
      "已有带sign的可信TF–target prior时，检查targets是否共同支持某个regulatory方向。",
      "SCENIC建regulon、AUCell按ranks评分和本例signed WMEAN是不同步骤/方法；不要混用数值。",
    ],
    tuning: [
      "核network物种、gene IDs、sign和matched targets；输入scale必须符合score定义。",
      "先保留continuous scores；低target coverage或单target主导时检查coverage及leave-one-target-out稳定性。",
    ],
    troubleshooting: [
      {
        symptom: "TF expression和activity排名不一致",
        check: "两者测量层次、target coverage和prior context是否相符。",
        action:
          "分别报告RNA、target score及独立protein/binding证据，避免强迫一致。",
      },
      {
        symptom: "Repressed targets上升反而推高score",
        check: "是否丢了negative weights或错误使用unsigned aggregation。",
        action: "逐target检查signed contribution和分母约定。",
      },
    ],
    boundary:
      "实现明确的L1-normalized signed raw estimate（参照decoupler1.9.2 WMEAN定义）；不是当前API调用，不含permutation/NES，不计算AUCell或证明causal TF activity。",
    source: {
      label: "decoupler 1.9.2 WMEAN mathematical definition",
      url: "https://decoupler.scverse.org/en/v1.9.2/generated/decoupler.run_wmean.html",
    },
  }),
  "ligand-receptor-inference": define({
    question: "Receptor 瓶颈改变时，interaction score 与 null 怎样变？",
    input:
      "LR 在这里指 Ligand–Receptor。沿用正文的六个独立 synthetic cells：前三个 L=4、R1=R2=0；后三个 L=0、R1=4、R2=r。固定 group sizes 为 3 对 3，枚举全部 20 种 cell-label 划分。",
    controls: [
      control(
        "subunit",
        "Receiver R2 expression r",
        0.5,
        6,
        0.5,
        2,
        "Complex=min(R1,R2)；r>4后R1成为瓶颈。所有observed参与者均通过本toy的表达存在检查。",
      ),
    ],
    calculate: ({ subunit }): LabCalculation => {
      const { cells, observed, scores } = lrLabelPermutations(subunit),
        complex = Math.min(4, subunit),
        levels = [
          ...new Set(scores.map((v) => Number(v.toPrecision(12)))),
        ].sort((a, b) => a - b),
        counts = levels.map(
          (value) => scores.filter((v) => Math.abs(v - value) < 1e-9).length,
        ),
        tail = scores.filter((x) => x >= observed - 1e-10).length,
        p = tail / scores.length;
      return {
        stages: [
          stage(
            "先读 cells 与成员 genes",
            "每行保留一个 cell 完整的 L、R1、R2 表达。后面的 permutation 只改变分组标签，不拆散同一 cell 的 gene profile。",
            "rows=cells; columns=L,R1,R2",
            [metric("Cells", 6), metric("Group size", 3)],
            matrix(
              ["c1", "c2", "c3", "c4", "c5", "c6"],
              ["L", "R1", "R2"],
              cells,
              "synthetic normalized expression",
            ),
          ),
          stage(
            "计算观察到的 interaction mean",
            "先计算 group means，再用最低表达的 receptor subunit 表示 complex 瓶颈，最后与 sender ligand mean 取平均。这里得到的是声明过的表达 score。",
            `R=min(4,${fmt(subunit)})=${fmt(complex)}; T=(4+R)/2=${fmt(observed)}`,
            numbers(
              ["sender L", "receiver complex", "observed T"],
              [4, complex, observed],
              "expression units",
            ),
            bars(
              ["sender L", "receiver complex", "interaction mean"],
              [4, complex, observed],
              "synthetic expression units",
            ),
          ),
          stage(
            "枚举 cell-label null",
            "保持 3 对 3 的分组大小，对每种标签划分重算同一个 score。图把相同 score 合并成频数，所有柱子的计数总和仍为 20。",
            `C(6,3)=20; T bins=[${levels.map((v) => fmt(v)).join(", ")}]; counts=[${counts.join(", ")}]`,
            [
              metric("Permutations", 20),
              metric("Null maximum", Math.max(...scores)),
            ],
            bars(
              levels.map((value) => `T=${fmt(value)}`),
              counts,
              "number of label assignments",
            ),
          ),
          stage(
            "数出 null 的 upper tail",
            "枚举包含 observed arrangement。本例允许的 r 范围内，它始终是唯一最大值，所以 exact p 一直为 1/20；score 的数值变化，并不必然改变它在 null 中的排名。",
            `p_exact=${tail}/20=${fmt(p)}`,
            [metric("Tail count", tail), metric("Exact P value", p)],
            bars(
              ["T ≥ observed", "T < observed"],
              [tail, 20 - tail],
              "permutation count",
            ),
          ),
        ],
        outcomes: [
          metric("Observed interaction mean", observed),
          metric("Exact specificity P value", p),
          metric("Receptor complex expression", complex),
        ],
      };
    },
    usage: [
      "用于理解CellPhoneDB-style complex / interaction mean与cell-type specificity null。",
      "多donor condition差异是另一问题：生物站paired-donor sign-flip实验检验donor differences，不能用本cell-label null替代。",
    ],
    tuning: [
      "先检查database和subunit completeness、expression fraction与group size，再解释score和P value。",
      "真实permutation须尊重exchangeability、donor/batch/spatial结构，并预先确定multiple-testing family。",
    ],
    troubleshooting: [
      {
        symptom: "R2继续升高但interaction不再变",
        check: "其他必需subunit是否成为min瓶颈。",
        action: "查看全部subunits，不用单个gene代替整个complex。",
      },
      {
        symptom: "P value很小就声称真实通信",
        check:
          "是否测到protein、spatial reach、下游response和干预证据，以及null究竟检验什么。",
        action: "表述为候选specificity证据，并设计独立功能验证。",
      },
    ],
    boundary:
      "仅复算minimum subunit、arithmetic interaction mean和六cell的exact label null；无数据库、表达比例阈值、多重检验、donor condition效应或真实communication证明。",
    source: {
      label: "CellPhoneDB statistical analysis and complex rules",
      url: "https://cellphonedb.readthedocs.io/en/stable/RESULTS-DOCUMENTATION.html",
    },
  }),
  "perturbation-generalization": define({
    question: "Additive baseline 遇到 interaction 和新 context，会错在哪里？",
    input:
      "沿用正文的两个 gene readouts：control=[10,10]，ΔA=[−2,1]，ΔB=[1,−3]。先仅用单扰动构建预测，再揭示人为设定的 held-out double response=[9+δ+c,8−δ+c]。",
    controls: [
      control(
        "interaction",
        "Interaction δ",
        -4,
        4,
        0.5,
        2,
        "只改变held-out double中的非加和部分；single perturbation training inputs固定。",
      ),
      control(
        "context",
        "Common context shift c",
        -3,
        3,
        0.5,
        0,
        "两genes共同移动的toy context项；不模拟in vivo组织或domain adaptation。",
      ),
    ],
    calculate: ({ interaction, context }): LabCalculation => {
      const controlY = [10, 10],
        singleA = [8, 11],
        singleB = [11, 7],
        pred = [9, 8],
        truth = [9 + interaction + context, 8 - interaction + context],
        residual = truth.map((v, i) => v - pred[i]),
        squared = residual.map((x) => x * x),
        mse = sum(squared) / 2;
      return {
        stages: [
          stage(
            "先看训练中已有的 conditions",
            "训练信息只有 control、single A 和 single B。先固定 baseline，再查看 double perturbation 的 held-out 结果。",
            "y0=[10,10]; yA=[8,11]; yB=[11,7]",
            [metric("Observed conditions", 3)],
            matrix(
              ["control", "single A", "single B"],
              ["gene1", "gene2"],
              [controlY, singleA, singleB],
              "synthetic expression",
            ),
          ),
          stage(
            "相加 single effects 得到预测",
            "每个 single response 先减去 control，得到 ΔA 和 ΔB。把两项变化加回同一个 control；若直接相加两个绝对 expression，会重复计入 baseline。",
            "ŷ_AB=y0+(yA−y0)+(yB−y0)=[9,8]",
            numbers(["predicted gene1", "predicted gene2"], pred, "expression"),
            matrix(
              ["delta A", "delta B", "sum delta"],
              ["gene1", "gene2"],
              [
                [-2, 1],
                [1, -3],
                [-1, -2],
              ],
              "expression change",
            ),
          ),
          stage(
            "揭示 held-out response",
            "现在揭示 double response。δ 控制 interaction，c 控制共同的 context shift；滑块改变的是 synthetic 数据生成规则，没有用 test 反向拟合 baseline。",
            `truth=[9+(${fmt(interaction)})+(${fmt(context)}),8−(${fmt(interaction)})+(${fmt(context)})]`,
            numbers(["true gene1", "true gene2"], truth, "expression"),
            matrix(
              ["additive prediction", "held-out truth"],
              ["gene1", "gene2"],
              [pred, truth],
              "synthetic expression",
            ),
          ),
          stage(
            "拆开 interaction 与 context 误差",
            "逐个 readout 计算 residual 与平方误差，再取平均。本例的两个变化方向正交，恰好得到 MSE=δ²+c²；其他生成模型不一定具有这个分解。",
            `residual=[${residual.map((v) => fmt(v)).join(", ")}]; MSE=${fmt(mse)}`,
            [
              metric("MSE", mse, "expression²"),
              metric("Interaction component", interaction ** 2, "expression²"),
              metric("Context component", context ** 2, "expression²"),
            ],
            bars(
              ["gene1 squared error", "gene2 squared error"],
              squared,
              "expression²",
            ),
          ),
        ],
        outcomes: [
          metric("Held-out MSE", mse, "expression²"),
          metric(
            "Interaction error component",
            interaction ** 2,
            "expression²",
          ),
          metric("Context error component", context ** 2, "expression²"),
        ],
      };
    },
    usage: [
      "用于设计new combination/new context评估，检查复杂模型是否超过additive和no-change baselines。",
      "In vitro预测与in vivo泛化需不同证据；new cell holdout不等于new intervention holdout。",
    ],
    tuning: [
      "先固定 held-out unit、control 和 evaluation genes，再调整 model capacity。",
      "当absolute expression相关性很高时，继续检查delta方向、interaction residual和independent donor uncertainty。",
    ],
    troubleshooting: [
      {
        symptom: "Random cell test很好但新perturbation失败",
        check: "同perturbation/context是否跨train/test，特征选择是否使用test。",
        action:
          "按部署目标holdout完整conditions、genes、combinations或contexts。",
      },
      {
        symptom: "Single effects准确而double错",
        check:
          "Additivity假设、perturbation效率、viability selection与interaction residual。",
        action:
          "保留additive baseline，收集独立组合验证；不要只增加同条件cells。",
      },
    ],
    boundary:
      "两个readouts的显式生成toy，不训练GEARS、不估计真实causal effect，也不模拟完整cell或in vivo response。",
    source: {
      label: "Roohani et al., GEARS and perturbation generalization (2023)",
      url: "https://www.nature.com/articles/s41587-023-01905-6",
    },
  }),
  "variant-mixture-inference": define({
    question: "相同的 5/20 reads，purity 和 copy number 怎样改变解释？",
    input:
      "沿用正文的观测：alternate reads k=5、depth n=20。固定目标群内携带比例 f=1、mutant multiplicity m=1，以及不含 variant 的 background CN=2。只改变目标群比例 ρ 和 copy number；另一个候选模型固定 p0=.5。",
    controls: [
      control(
        "purity",
        "Target-cell fraction ρ",
        0.1,
        1,
        0.1,
        0.5,
        "ρ是cell fraction，不是DNA fraction；另一未知cell fraction f在本toy固定1。",
      ),
      control(
        "copies",
        "Target total copies C_T",
        2,
        6,
        1,
        2,
        "目标群内局部copy数统一为C_T，mutant copies仍固定1；这不是所有CN演化情景。",
      ),
    ],
    calculate: ({ purity, copies }): LabCalculation => {
      const total = purity * copies + (1 - purity) * 2,
        alt = purity,
        p = alt / total,
        dist = alleleDistribution(20, p),
        logSom =
          Math.log(choose(20, 5)) + 5 * Math.log(p) + 15 * Math.log1p(-p),
        logBalanced = Math.log(choose(20, 5)) + 20 * Math.log(0.5),
        logLR = logSom - logBalanced,
        se = Math.sqrt((p * (1 - p)) / 20);
      return {
        stages: [
          stage(
            "先数各类 cells 贡献的 DNA copies",
            "先按 cell fraction 加权，计算混合样本中每个 cell 平均贡献的 total 与 mutant copies。下一步才能把两者相除。",
            `total=ρC_T+(1−ρ)2=${fmt(total)}; mutant=ρ=${fmt(alt)}`,
            [
              metric("Total copies per mixed cell", total),
              metric("Mutant copies per mixed cell", alt),
            ],
            bars(
              ["mutant copies", "reference copies"],
              [alt, total - alt],
              "expected copies per mixed cell",
            ),
          ),
          stage(
            "由 copies 得到 expected VAF",
            "分母是 DNA copies，观测 VAF 则按 reads 计数。即使目标群内所有 cells 都携带 variant（f=1），混合样本的 expected VAF 也不必等于 .5。",
            `p=ρ/[ρC_T+(1−ρ)2]=${fmt(p)}`,
            [metric("Expected VAF", p), metric("Observed VAF", 0.25)],
            bars(
              ["expected VAF", "observed 5/20"],
              [p, 0.25],
              "allele fraction",
            ),
          ),
          stage(
            "加入有限 read depth 的抽样",
            "即使 expected VAF p 已知，20 条 reads 中的 alternate count k 仍会变化。图连接离散的 Binomial probability mass 点，不能把点之间当作连续 density。",
            `P(k|20,p)=C(20,k)p^k(1−p)^(20−k)`,
            [metric("P(k=5)", dist[5]), metric("VAF sampling SD", se)],
            line(
              Array.from({ length: 21 }, (_, i) => i),
              dist,
              "alternate read count k (integers)",
              "Binomial probability mass",
            ),
          ),
          stage(
            "比较两种声明过的生成模型",
            "用同一观测 k=5 比较 mixture candidate 与 p0=.5 candidate。Likelihood ratio 只比较这两个模型；没有 prior，也没有覆盖全部来源假设，因此不是 Somatic/Germline posterior。",
            `log LR=5log(p/.5)+15log((1−p)/.5)=${fmt(logLR)}`,
            [metric("Log likelihood ratio", logLR, "nats")],
            bars(
              ["mixture candidate", "balanced p=.5 candidate"],
              [logSom, logBalanced],
              "log probability of k=5 (nats)",
            ),
          ),
        ],
        outcomes: [
          metric("Expected VAF", p),
          metric("Log likelihood ratio", logLR, "nats"),
          metric("VAF sampling SD", se),
        ],
      };
    },
    usage: [
      "用于检查VAF、cell fraction和copy number的分母及allele-count likelihood。",
      "真实somatic/germline解释需要matched normal、lineage、CN与assay证据；不是单一VAF threshold。",
    ],
    tuning: [
      "先记录ρ、f、m、C_T/C_N分别来自数据还是假设，再增加model复杂度。",
      "低depth保留sampling uncertainty；更多depth不能消除ρf乘积的structural nonidentifiability。",
    ],
    troubleshooting: [
      {
        symptom: "VAF=.25被直接解释为25%cells",
        check: "是否忽略heterozygosity、purity、normal contamination与CN。",
        action: "先手算copy加权分母，并展示多个产生同一p的参数组合。",
      },
      {
        symptom: "Likelihood最高就宣布variant来源",
        check: "prior、candidate completeness、read bias与matched normal信息。",
        action: "将结果限制为给定模型比较，用独立证据检验替代解释。",
      },
    ],
    boundary:
      "Synthetic DNA allele-count model，局部CN在每群内一致、无mapping bias且reads独立；不执行variant calling、不提供个人诊断。",
    source: {
      label: "Carter et al., purity and absolute somatic copy number (2012)",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4383288/",
    },
  }),
};
