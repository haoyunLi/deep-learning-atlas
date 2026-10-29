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
      "两位置 DNA motif counts：第一行[8,1,1,0]，第二行[0,1,1,8]，列为A,C,G,T。固定query=AT，按background分配total pseudocount α。",
    controls: [
      control(
        "gc",
        "Background G/C fraction",
        0.2,
        0.8,
        0.05,
        0.5,
        "q_C=q_G=GC/2，q_A=q_T=(1−GC)/2；对同一query重算reference。",
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
            "Counts and background",
            "固定motif observations，只有背景组成及smoothing可调。",
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
            "Add pseudocounts",
            "每个位置加αq_b，总增加α；每行probability仍归一化。",
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
            "Positionwise evidence",
            "逐位置比较motif与background，再相加log evidence。",
            `bits=[${bits.map((v) => fmt(v)).join(", ")}]; S_AT=Σbits`,
            numbers(["position1", "position2"], bits, "bits"),
            bars(
              ["position1 A", "position2 T"],
              bits,
              "log2 likelihood ratio (bits)",
            ),
          ),
          stage(
            "Compare candidate windows",
            "AT和TT使用完全相同的motif及background；score不是P value或binding probability。",
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
      "同一gene三个候选elements，A=[4,2,1]，contact=[.1,c,.4]。这里只改变E2的contact，其余输入和candidate universe固定。",
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
            "Declare candidate inputs",
            "图展示activity；下方中间量列出contact。两种输入分别进入乘积，不共用同一物理尺度。",
            "A=[4,2,1]; C=[.1,c,.4]",
            numbers(
              ["E1 contact", "E2 contact", "E3 contact"],
              C,
              "contact weight",
            ),
            bars(["E1", "E2", "E3"], A, "relative activity A"),
          ),
          stage(
            "Multiply activity and contact",
            "弱activity可能由较强contact补偿；只看一个因子会漏掉关系。",
            `w=A×C=[${w.map((v) => fmt(v)).join(", ")}]`,
            numbers(["E1 numerator", "E2 numerator", "E3 numerator"], w, "A×C"),
            bars(["E1", "E2", "E3"], w, "unnormalized regulatory weight"),
          ),
          stage(
            "Build the denominator",
            "同一gene的所有候选都进入分母；E1numerator固定.4。",
            `total=.4+2×${fmt(contact)}+.4=${fmt(total)}`,
            numbers(["total", "E1 numerator"], [total, 0.4], "A×C"),
            bars(
              ["E1 weight", "E2 weight", "E3 weight", "total"],
              [...w, total],
              "unnormalized regulatory weight",
            ),
          ),
          stage(
            "Normalize relative contributions",
            "E1score变化可能仅由竞争分母改变；不是E1新产生了activity证据。",
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
      "只有一个gene三个给定elements的ABC normalization；不模拟ATAC/H3K27ac处理、Hi-C估计或CRISPR结果。",
    source: {
      label: "Fulco et al., Activity-by-Contact (2019)",
      url: "https://www.nature.com/articles/s41588-019-0538-0",
    },
  }),
  "regulon-tf-activity": define({
    question: "Repressive target 改变，signed activity score 朝哪边走？",
    input:
      "已给定一个regulon，targets z=[2,1,z3]、weights=[1,1,−1]，TF自身transcript readout保持不变。输入z是contrast statistics，非raw counts。",
    controls: [
      control(
        "target",
        "Repressed target z3",
        -3,
        3,
        0.25,
        -1,
        "负weight表示预期repression；该target上升会降低signed score。",
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
            "Fix the network prior",
            "先给定weights；本实验没有从这些targets反推network。",
            "w=[+1,+1,−1]",
            numbers(["g1", "g2", "g3"], w, "regulatory weight"),
            bars(
              ["g1 activating", "g2 activating", "g3 repressive"],
              w,
              "signed prior weight",
            ),
          ),
          stage(
            "Measure target responses",
            "TF自己的RNA不是这个target-based score的输入。",
            `z=[2,1,${fmt(target)}]`,
            numbers(["g1", "g2", "g3"], z, "contrast z"),
            bars(["g1", "g2", "g3"], z, "target contrast statistic"),
          ),
          stage(
            "Apply regulatory signs",
            "Repressed target下降贡献正向证据；忽略sign会丢失这一点。",
            `w×z=[${parts.map((v) => fmt(v)).join(", ")}]`,
            numbers(
              ["g1 contribution", "g2 contribution", "g3 contribution"],
              parts,
              "weighted z",
            ),
            bars(["g1", "g2", "g3"], parts, "signed contribution"),
          ),
          stage(
            "Normalize by absolute weights",
            "本课明确使用L1分母3；与unsigned mean比较只用于展示sign的作用。",
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
      "LR在本课指Ligand–Receptor。六个独立synthetic cells：前三个L=4,R1=R2=0；后三个L=0,R1=4,R2=r。枚举全部20种三对三cell-label划分。",
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
            "Cells and participant genes",
            "保留每个cell的joint gene profile；permutation只交换cell labels。",
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
            "Observed interaction mean",
            "先求group means，再取最小receptor subunit；不是直接把RNA相乘当binding概率。",
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
            "Exact cell-label null",
            "每种划分均保留3对3；相同score的划分合并显示为频数，合计仍为20。",
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
            "Count the upper tail",
            "Observed arrangement包含在枚举中；此离散例p最小为1/20。调整强度不一定改变specificity rank。",
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
      "两个gene readouts，control=[10,10]，ΔA=[−2,1]、ΔB=[1,−3]。Held-out double response人为定义为[9+δ+c,8−δ+c]，便于分解误差。",
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
            "Training conditions",
            "只观察control和singleA/B，不使用double truth来选择baseline。",
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
            "Add the single effects",
            "每个single先减control；直接加两个absolute expression会重复计算baseline。",
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
            "Reveal held-out response",
            "δ是interaction，c是共同context shift；它们是toy生成规则而非由test拟合的参数。",
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
            "Diagnose error components",
            "本例两个方向正交，所以MSE=δ²+c²；这个分解不是所有生物模型的通用规律。",
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
      "先固定held-outunit、control和evaluation genes，再调model capacity。",
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
      "固定alternate k=5、depth n=20；目标cell群携带比例f=1、mutant multiplicity m=1，background CN=2且无variant。对照候选模型p0=.5仅代表balanced-diploid假设。",
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
            "Cells contribute different DNA copies",
            "先计算混合样本每cell的expected copies，再求mutant比例。",
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
            "Expected allele fraction",
            "分母是DNA copies，非cell数量；f=1不要求VAF=.5。",
            `p=ρ/[ρC_T+(1−ρ)2]=${fmt(p)}`,
            [metric("Expected VAF", p), metric("Observed VAF", 0.25)],
            bars(
              ["expected VAF", "observed 5/20"],
              [p, 0.25],
              "allele fraction",
            ),
          ),
          stage(
            "Sampling at finite depth",
            "给定p下k仍随机；曲线连接离散Binomial mass点以便阅读，不是continuous density。",
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
            "Compare two stated models",
            "Likelihood ratio不是somatic/germline posterior；未指定prior且备选模型并不穷尽所有情况。",
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
