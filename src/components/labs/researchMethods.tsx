import type { LabDefinition, LabProps } from "./types";
import { LabCanvas, VizArrow, VizNode, VizText } from "./LabCanvas";

const blue = "#2468c9";
const teal = "#16847b";
const orange = "#9f5228";
const ink = "#14284b";
const muted = "#60708b";
const motion = { transition: "all 420ms ease" };
const f = (value: number, digits = 2) => value.toFixed(digits);
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

// NB2 parameterization: Var(Y)=mu+mu²/theta, where theta=1/alpha in statsmodels.
// https://www.statsmodels.org/stable/generated/statsmodels.genmod.families.family.NegativeBinomial.html
// Elastic Net convention follows Friedman, Hastie & Tibshirani (2010), eqs. 1, 5.
// https://doi.org/10.18637/jss.v033.i01
export const researchMethodCalculations = {
  countLikelihoods: (thetaValue: number, maxCount = 12) => {
    const mean = 3;
    const theta = Math.max(Number.EPSILON, thetaValue);
    const poisson = [Math.exp(-mean)];
    const negativeBinomial = [(theta / (theta + mean)) ** theta];
    for (let k = 0; k < maxCount; k += 1) {
      poisson.push((poisson[k] * mean) / (k + 1));
      negativeBinomial.push(
        negativeBinomial[k] * ((k + theta) / (k + 1)) * (mean / (theta + mean)),
      );
    }
    return {
      mean,
      theta,
      variance: mean + mean ** 2 / theta,
      poisson,
      negativeBinomial,
      poissonZero: poisson[0],
      negativeBinomialZero: negativeBinomial[0],
      poissonTail: Math.max(0, 1 - poisson.reduce((sum, p) => sum + p, 0)),
      negativeBinomialTail: Math.max(
        0,
        1 - negativeBinomial.reduce((sum, p) => sum + p, 0),
      ),
    };
  },
  pseudobulkHierarchy: (typeACellCount: number) => {
    const cells = 10;
    const typeA = clamp(Math.round(typeACellCount), 0, cells);
    const typeB = cells - typeA;
    const countA = 10;
    const countB = 2;
    const sumA = typeA * countA;
    const sumB = typeB * countB;
    return {
      cells,
      typeA,
      typeB,
      countA,
      countB,
      sumA,
      sumB,
      sum: sumA + sumB,
      mean: (sumA + sumB) / cells,
      referenceSum: 5 * countA + 5 * countB,
      referenceMean: (5 * countA + 5 * countB) / cells,
    };
  },
  elasticNet: (lambdaValue: number, alphaValue = 0.5) => {
    const lambda = Math.max(0, lambdaValue);
    const alpha = clamp(alphaValue, 0, 1);
    const z = [3, 1, 0.3];
    const threshold = lambda * alpha;
    const denominator = 1 + lambda * (1 - alpha);
    const thresholded = z.map(
      (coordinate) =>
        Math.sign(coordinate) * Math.max(Math.abs(coordinate) - threshold, 0),
    );
    const coefficients = thresholded.map(
      (coordinate) => coordinate / denominator,
    );
    return {
      z,
      lambda,
      alpha,
      threshold,
      denominator,
      thresholded,
      coefficients,
    };
  },
  spatialAssignment: (expressionWeight: number, temperatureValue = 0.25) => {
    const alpha = clamp(expressionWeight, 0, 1);
    const temperature = Math.max(Number.EPSILON, temperatureValue);
    const geometryCosts = [0.1, 0.9];
    const expressionCosts = [0.9, 0.1];
    const costs = geometryCosts.map(
      (geometry, index) =>
        (1 - alpha) * geometry + alpha * expressionCosts[index],
    );
    // Subtracting min(cost) makes the same Gibbs normalization numerically stable.
    const minimum = Math.min(...costs);
    const weights = costs.map((cost) =>
      Math.exp(-(cost - minimum) / temperature),
    );
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    const probabilities = weights.map((weight) => weight / total);
    const entropy = -probabilities.reduce(
      (sum, probability) =>
        sum + (probability > 0 ? probability * Math.log(probability) : 0),
      0,
    );
    return {
      alpha,
      temperature,
      geometryCosts,
      expressionCosts,
      costs,
      weights,
      probabilities,
      entropy,
    };
  },
};

function Caption({ title, detail }: { title: string; detail: string }) {
  return (
    <g>
      <rect x={24} y={286} width={672} height={55} rx={10} fill="#edf2f8" />
      <VizText x={360} y={307} anchor="middle" size={13} weight={700}>
        {title}
      </VizText>
      <VizText x={360} y={329} anchor="middle" size={11} fill={muted}>
        {detail}
      </VizText>
    </g>
  );
}

function CountLikelihoodLab({ step, value }: LabProps) {
  const r = researchMethodCalculations.countLikelihoods(value);
  const baseline = 244;
  const scale = 400;
  return (
    <LabCanvas
      label={`Poisson 与 Negative Binomial 的 PMF：μ=3，θ=${f(r.theta)}，NB variance=${f(r.variance)}，Poisson P0=${f(r.poissonZero, 3)}，NB P0=${f(r.negativeBinomialZero, 3)}`}
    >
      <VizText x={28} y={31} size={14} weight={700}>
        固定 μ=3：θ 越小，Negative Binomial 越分散
      </VizText>
      <VizText x={58} y={64} size={12}>
        P(Y=k)
      </VizText>
      <line x1={60} y1={baseline} x2={459} y2={baseline} stroke="#b8c9dc" />
      {[0, 0.2, 0.4].map((p) => (
        <g key={p}>
          <line
            x1={60}
            y1={baseline - p * scale}
            x2={459}
            y2={baseline - p * scale}
            stroke="#e1e8f0"
          />
          <VizText
            x={54}
            y={baseline - p * scale + 4}
            anchor="end"
            size={10}
            fill={muted}
          >
            {f(p, 1)}
          </VizText>
        </g>
      ))}
      {r.poisson.map((p, k) => (
        <g key={k}>
          <rect
            x={69 + k * 29}
            y={baseline - p * scale}
            width={10}
            height={p * scale}
            fill={blue}
            opacity={0.7}
          />
          <rect
            x={80 + k * 29}
            y={baseline - r.negativeBinomial[k] * scale}
            width={10}
            height={r.negativeBinomial[k] * scale}
            fill={orange}
            opacity={step >= 1 ? 0.95 : 0.18}
            style={motion}
          />
          <VizText
            x={80 + k * 29}
            y={261}
            anchor="middle"
            size={10}
            fill={muted}
          >
            {k}
          </VizText>
        </g>
      ))}
      <VizText x={459} y={278} anchor="end" size={10} fill={muted}>
        count k（0—12）
      </VizText>
      <rect x={493} y={55} width={10} height={10} fill={blue} />
      <VizText x={511} y={65} size={12}>
        Poisson
      </VizText>
      <rect x={493} y={77} width={10} height={10} fill={orange} />
      <VizText x={511} y={87} size={12}>
        Negative Binomial
      </VizText>
      <VizText x={493} y={122} size={12} fill={muted}>
        Var(Y) = 3 + 9 / θ
      </VizText>
      <VizText
        x={493}
        y={146}
        size={20}
        fill={step >= 1 ? orange : muted}
        weight={700}
      >
        {f(r.variance)} vs 3.00
      </VizText>
      <VizText x={493} y={178} size={12} fill={muted}>
        P(Y=0)：NB / Poisson
      </VizText>
      <VizText
        x={493}
        y={202}
        size={18}
        fill={step >= 2 ? orange : muted}
        weight={700}
      >
        {f(r.negativeBinomialZero, 3)} / {f(r.poissonZero, 3)}
      </VizText>
      <VizText x={493} y={234} size={11} fill={muted}>
        NB 图外 P(Y&gt;12)
      </VizText>
      <VizText x={493} y={255} size={15} fill={step === 3 ? orange : muted}>
        {f(r.negativeBinomialTail * 100)}%
      </VizText>
      <Caption
        title={`P₀ = (θ / (θ+3))^θ = ${f(r.negativeBinomialZero, 3)}`}
        detail="这里没有额外 zero-inflation；更多零值也可以来自普通 NB 的 dispersion。"
      />
    </LabCanvas>
  );
}

function PseudobulkLab({ step, value }: LabProps) {
  const r = researchMethodCalculations.pseudobulkHierarchy(value);
  const samples = [
    {
      name: "Replicate 1",
      typeA: 5,
      sum: r.referenceSum,
      mean: r.referenceMean,
    },
    { name: "Replicate 2", typeA: r.typeA, sum: r.sum, mean: r.mean },
  ];
  return (
    <LabCanvas
      label={`Synthetic composition：Replicate 1 sum=60 mean=6；Replicate 2 Type A=${r.typeA}，Type B=${r.typeB}，sum=${r.sum}，mean=${f(r.mean)}；Type A 内表达=10，Type B 内表达=2 均未变`}
    >
      <VizText x={28} y={31} size={14} weight={700}>
        每个 sample 10 cells；Type A 每 cell=10，Type B 每 cell=2
      </VizText>
      {samples.map((sample, sampleIndex) => {
        const y = 70 + sampleIndex * 99;
        return (
          <g key={sample.name}>
            <VizText x={30} y={y} size={13} weight={700}>
              {sample.name}
            </VizText>
            {Array.from({ length: 10 }, (_, i) => (
              <g key={i}>
                <circle
                  cx={47 + i * 27}
                  cy={y + 30}
                  r={10}
                  fill={i < sample.typeA ? teal : orange}
                  style={motion}
                />
                <VizText
                  x={47 + i * 27}
                  y={y + 34}
                  anchor="middle"
                  size={9}
                  fill="#fff"
                >
                  {i < sample.typeA ? 10 : 2}
                </VizText>
              </g>
            ))}
            <VizText x={30} y={y + 57} size={11} fill={muted}>
              {sample.typeA} A + {10 - sample.typeA} B；每个点是 1 cell
            </VizText>
            <VizArrow
              x1={314}
              y1={y + 28}
              x2={368}
              y2={y + 28}
              active={step >= 2}
              color={teal}
            />
            <VizNode
              x={378}
              y={y + 1}
              width={130}
              label={`sum = ${sample.sum}`}
              sublabel="raw integer counts"
              active={step === 2}
              color={teal}
            />
            <VizNode
              x={531}
              y={y + 1}
              width={154}
              label={`mean = ${f(sample.mean, 1)}`}
              sublabel="sum / 10 cells"
              active={step === 2}
              color={orange}
            />
          </g>
        );
      })}
      <VizText x={30} y={266} size={12} fill={step >= 1 ? teal : muted}>
        Replicate 2：A 的 sum={r.typeA}×10={r.sumA}；B 的 sum={r.typeB}×2=
        {r.sumB}
      </VizText>
      <Caption
        title={`Composition 变化：总 sum 差=${r.sum - r.referenceSum}；A 内 mean=10，B 内 mean=2 均未变`}
        detail="真实 Pseudobulk 按 replicate × cell type 汇总 raw counts，再建模 library-size offsets；这张图不作 DE 检验。"
      />
    </LabCanvas>
  );
}

function ElasticNetLab({ step, value }: LabProps) {
  const r = researchMethodCalculations.elasticNet(value);
  const ridge = researchMethodCalculations.elasticNet(value, 0);
  const lasso = researchMethodCalculations.elasticNet(value, 1);
  const px = (coefficient: number) => 102 + coefficient * 110;
  return (
    <LabCanvas
      label={`正交 Elastic Net toy：λ=${f(r.lambda)}，ρ=0.5，threshold=${f(r.threshold)}，shrink denominator=${f(r.denominator)}，最终 β=[${r.coefficients.map((v) => f(v, 3)).join(", ")}]`}
    >
      <VizText x={28} y={31} size={14} weight={700}>
        XᵀX/n = I；z = Xᵀy/n = [3, 1, 0.3]；固定 ρ=0.5
      </VizText>
      <VizText x={28} y={56} size={11} fill={muted}>
        Toy objective：½Σ(βⱼ−zⱼ)² + λ[(1−ρ)Σβⱼ²/2 + ρΣ|βⱼ|]
      </VizText>
      {[0, 1, 2, 3].map((tick) => (
        <g key={tick}>
          <line x1={px(tick)} y1={79} x2={px(tick)} y2={245} stroke="#e1e8f0" />
          <VizText x={px(tick)} y={264} anchor="middle" size={11} fill={muted}>
            {tick}
          </VizText>
        </g>
      ))}
      {r.z.map((coordinate, i) => {
        const y = 92 + i * 54;
        const displayed =
          step >= 2
            ? r.coefficients[i]
            : step === 1
              ? r.thresholded[i]
              : coordinate;
        return (
          <g key={i}>
            <VizText x={28} y={y + 17} size={12}>
              Feature {i + 1}
            </VizText>
            <rect
              x={102}
              y={y}
              width={coordinate * 110}
              height={7}
              rx={3}
              fill="#b9c6d8"
            />
            <rect
              x={102}
              y={y + 10}
              width={displayed * 110}
              height={15}
              rx={3}
              fill={teal}
              style={motion}
            />
            <VizText x={441} y={y + 21} size={12} fill={teal} weight={700}>
              {f(displayed)}
            </VizText>
            <circle
              cx={px(ridge.coefficients[i])}
              cy={y + 35}
              r={3}
              fill={blue}
              opacity={step === 3 ? 1 : 0.15}
              style={motion}
            />
            <circle
              cx={px(lasso.coefficients[i])}
              cy={y + 35}
              r={3}
              fill={orange}
              opacity={step === 3 ? 1 : 0.15}
              style={motion}
            />
          </g>
        );
      })}
      <VizText x={511} y={101} size={12} fill={muted}>
        Soft threshold λρ
      </VizText>
      <VizText
        x={511}
        y={129}
        size={23}
        weight={700}
        fill={step >= 1 ? teal : muted}
      >
        {f(r.threshold)}
      </VizText>
      <VizText x={511} y={166} size={12} fill={muted}>
        除以 1+λ(1−ρ)
      </VizText>
      <VizText
        x={511}
        y={194}
        size={23}
        weight={700}
        fill={step >= 2 ? teal : muted}
      >
        {f(r.denominator)}
      </VizText>
      <VizText x={511} y={230} size={11} fill={blue}>
        ● Ridge ρ=0
      </VizText>
      <VizText x={511} y={252} size={11} fill={orange}>
        ● Lasso ρ=1
      </VizText>
      <Caption
        title="βⱼ = sign(zⱼ) max(|zⱼ|−λρ, 0) / [1+λ(1−ρ)]"
        detail="只有此正交 toy design 才能各列独立得到 exact solution；相关特征需 iterative optimization，λ 用训练内 CV 选择。"
      />
    </LabCanvas>
  );
}

function SpatialAssignmentLab({ step, value }: LabProps) {
  const r = researchMethodCalculations.spatialAssignment(value);
  return (
    <LabCanvas
      label={`未校准 Spatial Gibbs weights：expression weight α=${f(r.alpha)}，costs=[${r.costs.map((v) => f(v)).join(", ")}]，weights=[${r.probabilities.map((v) => f(v, 3)).join(", ")}]，entropy=${f(r.entropy, 3)} nats`}
    >
      <VizText x={28} y={31} size={14} weight={700}>
        同一个 bin：近邻 A 与 expression 更相似的 B，证据发生冲突
      </VizText>
      <VizText x={28} y={56} size={11} fill={muted}>
        Toy geometry / expression costs 已缩放到 [0,1]；T=0.25；α 是 expression
        weight
      </VizText>
      <circle cx={88} cy={171} r={18} fill={ink} />
      <VizText x={88} y={176} anchor="middle" size={12} fill="#fff">
        bin
      </VizText>
      {[106, 211].map((y, i) => (
        <g key={i}>
          <VizArrow
            x1={111}
            y1={171}
            x2={218}
            y2={y + 26}
            active={step >= 1}
            color={i === 0 ? blue : teal}
          />
          <VizNode
            x={226}
            y={y}
            width={90}
            height={51}
            label={`Cell ${i === 0 ? "A" : "B"}`}
            active={step === 0}
            color={i === 0 ? blue : teal}
          />
          <VizText x={327} y={y + 10} size={11} fill={muted}>
            geometry={f(r.geometryCosts[i], 1)}
          </VizText>
          <VizText x={327} y={y + 30} size={11} fill={muted}>
            expression={f(r.expressionCosts[i], 1)}
          </VizText>
          <VizText
            x={327}
            y={y + 52}
            size={13}
            weight={700}
            fill={step >= 1 ? ink : muted}
          >
            cost={f(r.costs[i])}
          </VizText>
          <rect
            x={510}
            y={y + 8}
            width={172}
            height={20}
            rx={4}
            fill="#e2eaf3"
          />
          <rect
            x={510}
            y={y + 8}
            width={r.probabilities[i] * 172}
            height={20}
            rx={4}
            fill={i === 0 ? blue : teal}
            opacity={step >= 2 ? 1 : 0.2}
            style={motion}
          />
          <VizText
            x={510}
            y={y + 51}
            size={13}
            weight={700}
            fill={step >= 2 ? ink : muted}
          >
            weight p={f(r.probabilities[i], 3)}
          </VizText>
        </g>
      ))}
      <VizText x={30} y={270} size={12} fill={step === 3 ? teal : muted}>
        H = −Σ p log p = {f(r.entropy, 3)} nats；最大值 log 2 = 0.693
      </VizText>
      <Caption
        title="costⱼ=(1−α)geometryⱼ+α expressionⱼ；pⱼ=exp(−costⱼ/T) / Σ exp(−cost/T)"
        detail="这些是未校准 Gibbs weights；不能直接称为 posterior。EM 需要生成模型；RL 需要 sequential state 与 future reward。"
      />
    </LabCanvas>
  );
}

export const researchMethodsLabs: Record<string, LabDefinition> = {
  "count-likelihoods": {
    title: "固定均值，观察 dispersion 怎样增加零值与长尾",
    englishTitle: "Poisson vs Negative Binomial PMF",
    readout: (value) => {
      const r = researchMethodCalculations.countLikelihoods(value);
      return [
        { label: "NB variance", value: f(r.variance) },
        { label: "Poisson P(0)", value: f(r.poissonZero, 3) },
        { label: "NB P(0)", value: f(r.negativeBinomialZero, 3) },
        { label: "NB tail: k > 12", value: f(r.negativeBinomialTail, 4) },
      ];
    },
    steps: [
      {
        title: "1 · Fix the mean",
        explanation:
          "设同一 gene 的 toy mean μ=3。Poisson 的 variance 必须也是 3；蓝色柱是精确 PMF，不是随机抽样。",
      },
      {
        title: "2 · Add dispersion",
        explanation:
          "Negative Binomial 使用 θ：Var(Y)=μ+μ²/θ。拖动 θ；小 θ 允许更大的 variance。注意有的软件用 α=1/θ，方向相反。",
      },
      {
        title: "3 · Compute zero probability",
        explanation:
          "从 NB PMF 代入 k=0，得到 P₀=(θ/(θ+μ))^θ。此 toy 没有添加单独的 dropout 或 zero-inflation 参数，仍然能产生更多零值。",
      },
      {
        title: "4 · Inspect the tail",
        explanation:
          "检查零值与高 count 的质量同时变化。图仅画到 12，右侧明确显示剩余 tail probability。选 likelihood 需检查模型与数据生成假设，零多本身不证明需要 ZINB。",
      },
    ],
    parameter: {
      label: "NB dispersion θ",
      min: 0.5,
      max: 20,
      step: 0.5,
      initial: 2,
      hint: "固定 μ=3；θ 越大越接近 Poisson。软件若报告 α=1/θ，α 越大反而越分散。",
    },
    note: "Synthetic count distribution；真实 count analysis 还需考虑 gene、sample、library size 与 experimental design。这里没有拟合测序数据。",
    render: CountLikelihoodLab,
  },
  "pseudobulk-hierarchy": {
    title: "先区分 cell-type composition，再解释 sample-level 变化",
    englishTitle: "Pseudobulk: Counts, Composition, Replicates",
    readout: (value) => {
      const r = researchMethodCalculations.pseudobulkHierarchy(value);
      return [
        { label: "Replicate 2 raw sum", value: String(r.sum) },
        { label: "Replicate 2 mean", value: f(r.mean) },
        { label: "Type A / B cells", value: `${r.typeA} / ${r.typeB}` },
        { label: "Within-type mean A / B", value: "10 / 2 · unchanged" },
      ];
    },
    steps: [
      {
        title: "1 · Identify replicates",
        explanation:
          "两排是两个独立 biological replicates，每排固定 10 cells。Cell 是观测单位；独立 replicate 才能支撑跨患者或跨样本的推断。",
      },
      {
        title: "2 · Read raw counts",
        explanation:
          "假设每个 A cell 对此 gene 都有 10 个 raw counts，每个 B cell 有 2 个。只调整 Replicate 2 的 A cell 数；cell-type 内状态始终不变。",
      },
      {
        title: "3 · Sum and divide",
        explanation:
          "先计算 A 的 nA×10、B 的 nB×2，再相加得到 sample sum；mean=sum/10。真实 Pseudobulk 为每个 replicate × cell type 汇总 raw integer counts。",
      },
      {
        title: "4 · Separate composition from state",
        explanation:
          "总 sum 与总 mean 会随 A 的比例改变，但 A 内 mean=10、B 内 mean=2 都没变。比较 cell-type 内状态需使用恰当的 replicate-level design 和 library-size offsets；总量变化不能直接解释为 cell state 改变。",
      },
    ],
    parameter: {
      label: "Replicate 2 的 Type A cells",
      min: 1,
      max: 9,
      step: 1,
      initial: 6,
      hint: "总 cell 数固定为 10；Type B cells=10−A。这里让两个 cell types 始终存在，方便比较。",
      unit: "cells",
    },
    note: "Toy gene 与两个示意 replicates，仅说明 composition 与 aggregation；没有运行 Differential Expression test，也没有声称该数据足以估计 biological variation。",
    render: PseudobulkLab,
  },
  "elastic-net": {
    title: "先把小系数推到零，再收缩保留下来的系数",
    englishTitle: "Elastic Net: Soft Threshold and Shrinkage",
    readout: (value) => {
      const r = researchMethodCalculations.elasticNet(value);
      return [
        { label: "L1 threshold λρ", value: f(r.threshold) },
        { label: "L2 denominator", value: f(r.denominator) },
        {
          label: "Final β coefficients",
          value: `[${r.coefficients.map((v) => f(v, 3)).join(", ")}]`,
        },
      ];
    },
    steps: [
      {
        title: "1 · Specify the design",
        explanation:
          "Toy standardized design 满足 XᵀX/n=I，三列互相正交；z=Xᵀy/n=[3,1,0.3]。λ=0 时，β=z。固定 ρ=0.5 表示同等混合 L1 与 L2 penalty。",
      },
      {
        title: "2 · Soft threshold",
        explanation:
          "计算 threshold=λρ，对每个 z 应用 sign(z)max(|z|−λρ,0)。λ 增大时，小的坐标先变成精确 0；这是 L1 penalty 的稀疏作用。",
      },
      {
        title: "3 · Shrink retained coefficients",
        explanation:
          "把 threshold 后的值除以 1+λ(1−ρ)。这一步是 L2 收缩；例如 λ=1 时，β=[2.5,0.5,0]/1.5。绿色条是当前阶段的中间值。",
      },
      {
        title: "4 · Compare limits",
        explanation:
          "蓝点是同一 λ 下的 Ridge (ρ=0)，橙点是 Lasso (ρ=1)。真实 methylation 特征通常相关，需 coordinate descent 等 iterative optimization；在 training folds 内标准化、选特征并调 λ/ρ。",
      },
    ],
    parameter: {
      label: "Regularization λ",
      min: 0,
      max: 4,
      step: 0.1,
      initial: 1,
      hint: "只改变 penalty 强度；ρ 固定 0.5。拖到 0 看 unregularized coefficients，再增加 λ 观察何时被置零。",
    },
    note: "Exact formula 依赖上述正交设计与 objective normalization。本图 λ 对应 scikit-learn alpha，ρ 对应 l1_ratio；glmnet alpha 则对应 ρ。本图不演示 prediction performance 或 causal feature importance。",
    render: ElasticNetLab,
  },
  "spatial-assignment": {
    title: "观察 geometry 与 expression 的冲突，而后读取 assignment 歧义",
    englishTitle: "Spatial Assignment: Cost to Gibbs Weight",
    readout: (value) => {
      const r = researchMethodCalculations.spatialAssignment(value);
      return [
        { label: "Cost A / B", value: r.costs.map((v) => f(v)).join(" / ") },
        {
          label: "Gibbs weight A / B",
          value: r.probabilities.map((v) => f(v, 3)).join(" / "),
        },
        { label: "Entropy H (nats)", value: f(r.entropy, 3) },
      ];
    },
    steps: [
      {
        title: "1 · Compare evidence",
        explanation:
          "A 的 geometry cost=0.1、expression cost=0.9；B 正好相反。这些是人为指定并缩放到 [0,1] 的 toy costs。真实项目须先确认坐标、units、registration 与 score normalization。",
      },
      {
        title: "2 · Combine normalized costs",
        explanation:
          "设 α 为 expression weight，cost=(1−α)geometry+α expression。低 cost 更好；α=0 只看 geometry，α=1 只看 expression。缩放方式会改变权重的实际含义。",
      },
      {
        title: "3 · Normalize Gibbs weights",
        explanation:
          "以固定 T=0.25 计算 pⱼ=exp(−costⱼ/T)/Σexp(−cost/T)。α=0.5 时，两候选 cost 相同，权重均为 0.5。归一化只产生相对权重，不提供概率校准。",
      },
      {
        title: "4 · Read ambiguity and choose a method",
        explanation:
          "Entropy H=−Σp log p 用于描述这些权重的集中程度。此 toy 没有容量约束或 unassigned 候选；真实任务应允许合理的 unmatched 状态。Likelihood EM 需要生成模型；只有当前行动改变后续状态且 future reward 有意义时，才有理由使用 RL。",
      },
    ],
    parameter: {
      label: "Expression weight α",
      min: 0,
      max: 1,
      step: 0.05,
      initial: 0.5,
      hint: "Geometry weight=1−α；固定 T=0.25。先预测 α 增大时哪一个候选获得更多权重。",
    },
    note: "Synthetic two-candidate illustration。Gibbs weights 是 heuristic assignment weights，不是 calibrated posterior；本图未运行 EM、RL 或完整 bin-to-cell matching。",
    render: SpatialAssignmentLab,
  },
};
