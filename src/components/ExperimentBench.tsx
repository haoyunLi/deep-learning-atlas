import { useMemo, useState, type ReactNode } from "react";
import {
  bayesUpdate,
  thresholdExperiment,
  scoreDistributions,
  sinkhornExperiment,
  bootstrapExperiment,
} from "./experimentBenchMath";
import "./experiment-bench.css";
import { navigatePractice, usePracticeRoute } from "../lib/practiceRouting";

type Kind = "bayes" | "threshold" | "transport" | "bootstrap";
const names: Record<Kind, string> = {
  bayes: "Bayesian Update",
  threshold: "Threshold & Base Rate",
  transport: "Sinkhorn Transport",
  bootstrap: "Donor Bootstrap",
};
const f = (v: number, digits = 3) => v.toFixed(digits);
const pct = (v: number | null) =>
  v === null ? "未定义" : (v * 100).toFixed(1) + "%";
const blue = "#245fbd",
  teal = "#08766e",
  ink = "#14284b";
function Range({
  label,
  value,
  min,
  max,
  step = 1,
  set,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  set: (v: number) => void;
  hint: string;
}) {
  return (
    <label className="bench-range">
      <span>
        {label} <output>{value}</output>
      </span>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => set(Number(e.target.value))}
      />
      <small>{hint}</small>
    </label>
  );
}
function Plot({
  label,
  children,
  height = 290,
}: {
  label: string;
  children: ReactNode;
  height?: number;
}) {
  return (
    <div
      className="bench-plot"
      role="region"
      aria-label={label + "，可横向滚动"}
      tabIndex={0}
    >
      <svg viewBox={"0 0 640 " + height} role="img" aria-label={label}>
        {children}
      </svg>
    </div>
  );
}
function Readout({ values }: { values: [string, string][] }) {
  return (
    <dl className="bench-readout" aria-live="polite">
      {values.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}
function Check({
  question,
  options,
  correct,
  explanation,
}: {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}) {
  const [answer, setAnswer] = useState<number | null>(null),
    [checked, setChecked] = useState(false);
  return (
    <section className="bench-check">
      <fieldset>
        <legend>先预测：{question}</legend>
        {options.map((s, i) => (
          <label key={s}>
            <input
              type="radio"
              name={question}
              checked={answer === i}
              onChange={() => {
                setAnswer(i);
                setChecked(false);
              }}
            />
            {s}
          </label>
        ))}
      </fieldset>
      <button
        type="button"
        disabled={answer === null}
        onClick={() => setChecked(true)}
      >
        检查与解释
      </button>
      {checked && (
        <p role="status">
          <strong>
            {answer === correct ? "判断正确。" : "回到生成过程看。"}
          </strong>
          {explanation}
        </p>
      )}
    </section>
  );
}
function Derivation({ steps }: { steps: [string, string][] }) {
  const [step, setStep] = useState(0);
  return (
    <section className="bench-derivation">
      <h3>
        逐步推导 · {step + 1} / {steps.length}
      </h3>
      <div role="group" aria-label="推导步骤">
        {steps.map(([title], i) => (
          <button
            type="button"
            key={title}
            aria-pressed={step === i}
            onClick={() => setStep(i)}
          >
            {i + 1}. {title}
          </button>
        ))}
      </div>
      <p aria-live="polite">
        <strong>{steps[step][0]}：</strong>
        {steps[step][1]}
      </p>
    </section>
  );
}
function Details({
  children,
  links,
  source,
  href,
}: {
  children: ReactNode;
  links: [string, string][];
  source: string;
  href: string;
}) {
  return (
    <details className="bench-details">
      <summary>什么时候用、如何设置、怎样排错</summary>
      <div>{children}</div>
      <p>
        {links.map(([id, text]) => (
          <a key={id} href={"#/lesson/" + id}>
            {text}
          </a>
        ))}
      </p>
      <a href={href} target="_blank" rel="noreferrer">
        Primary source · {source}
      </a>
    </details>
  );
}
function Bayes() {
  const [success, setSuccess] = useState(16),
    [strength, setStrength] = useState(4);
  const r = bayesUpdate(success, strength),
    peak = Math.max(...r.points.flatMap((p) => [p.prior, p.posterior]));
  const line = (key: "prior" | "posterior") =>
    r.points
      .map((p) => 60 + p.x * 520 + "," + (235 - (p[key] / peak) * 180))
      .join(" ");
  return (
    <>
      <h2>相同的 20 次观测，为什么可以得到不同的 posterior？</h2>
      <p>
        Input：success/failure 与 Beta prior。Output：未知成功概率 θ 的
        posterior，以及下一次观测的 predictive probability。
      </p>
      <Check
        question="固定 16/20 次 success，把对 θ=0.5 的 prior 加强，会怎样？"
        options={[
          "Posterior mean 更接近 0.5",
          "Posterior mean 必须等于 0.8",
          "下一次一定 success",
        ]}
        correct={0}
        explanation="Prior strength 增大时，0.5 获得更多权重。θ 的不确定性与下一次 Bernoulli 结果的不确定性是两个层次。"
      />
      <div className="bench-controls">
        <Range
          label="Observed successes"
          min={0}
          max={20}
          value={success}
          set={setSuccess}
          hint="总 trial 数固定为 20；假设条件独立、共享 θ。"
        />
        <Range
          label="Prior strength α₀ + β₀"
          min={2}
          max={40}
          step={2}
          value={strength}
          set={setStrength}
          hint="固定 prior mean=0.5；α₀=β₀=strength/2。"
        />
      </div>
      <Plot label={"Beta density：prior mean0.5，posterior mean" + f(r.mean)}>
        <text x="60" y="25">
          θ 的 uncertainty：灰色 Prior / 蓝色 Posterior
        </text>
        <path d="M60 50V235H590" className="bench-axis" />
        <polyline
          points={line("prior")}
          fill="none"
          stroke="#718198"
          strokeWidth="2"
          strokeDasharray="7 4"
        />
        <polyline
          points={line("posterior")}
          fill="none"
          stroke={blue}
          strokeWidth="3"
        />
        {[0, 0.25, 0.5, 0.75, 1].map((x) => (
          <text key={x} x={60 + x * 520} y="257" textAnchor="middle">
            {x}
          </text>
        ))}
        <text x="570" y="281">
          θ
        </text>
        <text x="7" y="65">
          {f(peak, 1)}
        </text>
        <text x="8" y="105">
          Density
        </text>
        <line
          x1={60 + r.mean * 520}
          x2={60 + r.mean * 520}
          y1="55"
          y2="235"
          stroke={teal}
          strokeDasharray="3 4"
        />
      </Plot>
      <Plot
        label={
          "下一次 Bernoulli predictive：success " +
          pct(r.mean) +
          "，failure " +
          pct(1 - r.mean)
        }
        height={140}
      >
        <text x="35" y="28">
          下一次观测 y ∈ {"{0,1}"}：两种可能结果
        </text>
        <rect x="35" y="48" width={570 * r.mean} height="38" fill={blue} />
        <rect
          x={35 + 570 * r.mean}
          y="48"
          width={570 * (1 - r.mean)}
          height="38"
          fill={teal}
        />
        <text x="35" y="112">
          Success {pct(r.mean)}
        </text>
        <text x="605" y="112" textAnchor="end">
          Failure {pct(1 - r.mean)}
        </text>
      </Plot>
      <Readout
        values={[
          ["Posterior α / β", r.a + " / " + r.b],
          ["Posterior mean", f(r.mean)],
          ["Posterior SD", f(Math.sqrt(r.variance))],
          ["MLE = s / n", f(r.mle)],
        ]}
      />
      <Derivation
        steps={[
          [
            "Prior",
            "θ ~ Beta(" +
              strength / 2 +
              ", " +
              strength / 2 +
              ")；density 高度不是某一点的概率。",
          ],
          [
            "Likelihood",
            "L(θ) ∝ θ^" +
              success +
              " × (1−θ)^" +
              (20 - success) +
              "。Binomial coefficient 不随 θ 改变。",
          ],
          [
            "Update",
            "α=α₀+s=" +
              r.a +
              "，β=β₀+n−s=" +
              r.b +
              "。Posterior mean=α/(α+β)=" +
              f(r.mean) +
              "。",
          ],
          [
            "Predict",
            "P(y_new=1 | data)=E[θ | data]=" +
              f(r.mean) +
              "；多个 future trials 需要 Beta-Binomial，而非把 θ 固定成均值。",
          ],
        ]}
      />
      <Details
        links={[
          ["bayesian-updating", "Bayesian Updating"],
          ["count-likelihoods", "Observation Likelihood"],
        ]}
        source="Stan · Beta-Binomial"
        href="https://mc-stan.org/docs/functions-reference/beta-binomial-distribution.html"
      >
        <p>
          <strong>When：</strong>可交换的 binary events、小样本 rate
          estimation；优点是 prior 和观测贡献可解释，conjugacy 可精确计算。
        </p>
        <p>
          <strong>Settings：</strong>先写 observation unit，再做 prior
          predictive check；用多个合理 prior strengths 检查 sensitivity。相同
          donor 的重复 events 通常需要 hierarchical model。
        </p>
        <p>
          <strong>Limits：</strong>Conditional independence、固定 θ
          和已知观测过程都是假设；label errors、selection bias 与 distribution
          shift 不能靠增加 prior strength 修复。
        </p>
      </Details>
      <button
        type="button"
        onClick={() => {
          setSuccess(16);
          setStrength(4);
        }}
      >
        重置 Bayesian 参数
      </button>
    </>
  );
}
function Threshold() {
  const [prevalence, setPrevalence] = useState(10),
    [cut, setCut] = useState(4);
  const r = thresholdExperiment(prevalence / 100, cut);
  return (
    <>
      <h2>相同 score 分布，为什么换个 cohort 后 precision 会变？</h2>
      <p>
        Input：两个 class 的 synthetic score
        distributions、prevalence、threshold。Output：1,000 个对象的 expected
        confusion counts 与指标。Score 未做 probability calibration。
      </p>
      <Check
        question="固定 threshold 和 class-conditional score distributions，降低 prevalence 后怎样？"
        options={[
          "Recall 必须下降",
          "Precision 通常下降，Recall 保持",
          "Accuracy 足以解释所有变化",
        ]}
        correct={1}
        explanation="TPR/FPR 在本例保持；negative 总数变大，FP 相对 TP 更多。这是明确固定条件下的 base-rate effect，真实 cohort 的条件分布也可能变。"
      />
      <div className="bench-controls">
        <Range
          label="Prevalence (%)"
          min={1}
          max={50}
          value={prevalence}
          set={setPrevalence}
          hint="1,000个对象的 expected positive 比例；非真实 prevalence。"
        />
        <Range
          label="Threshold bin"
          min={0}
          max={8}
          value={cut}
          set={setCut}
          hint={
            "预测 positive 当 score ≥ " +
            f(cut / 8) +
            "；8 时没有 predicted positive。"
          }
        />
      </div>
      <Plot
        label={"Class conditional score histogram，threshold=" + f(cut / 8)}
      >
        <text x="60" y="25">
          每个 class 内的比例 · 蓝色 Positive / 绿色 Negative
        </text>
        <path d="M60 50V235H600" className="bench-axis" />
        {scoreDistributions.positive.map((v, i) => (
          <g key={i}>
            <rect
              x={64 + i * 64}
              y={235 - v * 4.7}
              width="24"
              height={v * 4.7}
              fill={blue}
            />
            <rect
              x={88 + i * 64}
              y={235 - scoreDistributions.negative[i] * 4.7}
              width="24"
              height={scoreDistributions.negative[i] * 4.7}
              fill={teal}
            />
            <text x={64 + i * 64} y="258">
              {f(i / 8, 2)}
            </text>
          </g>
        ))}
        <line
          x1={60 + cut * 64}
          x2={60 + cut * 64}
          y1="45"
          y2="235"
          stroke={ink}
          strokeWidth="2"
          strokeDasharray="5 3"
        />
        <text x="12" y="68">
          35%
        </text>
        <text x="550" y="280">
          Score
        </text>
      </Plot>
      <Plot
        label={
          "Expected confusion counts TP " +
          f(r.tp, 1) +
          ", FP " +
          f(r.fp, 1) +
          ", FN " +
          f(r.fn, 1) +
          ", TN " +
          f(r.tn, 1)
        }
        height={245}
      >
        <text x="215" y="25">
          Predicted positive
        </text>
        <text x="420" y="25">
          Predicted negative
        </text>
        <text x="15" y="100">
          Actual positive
        </text>
        <text x="15" y="185">
          Actual negative
        </text>
        {[
          ["TP", r.tp],
          ["FN", r.fn],
          ["FP", r.fp],
          ["TN", r.tn],
        ].map(([key, v], i) => (
          <g key={key}>
            <rect
              x={180 + (i % 2) * 210}
              y={45 + Math.floor(i / 2) * 90}
              width="198"
              height="80"
              fill={i === 0 || i === 3 ? "#e9f3f1" : "#edf2fb"}
            />
            <text x={195 + (i % 2) * 210} y={92 + Math.floor(i / 2) * 90}>
              {key} = {f(v as number, 1)}
            </text>
          </g>
        ))}
      </Plot>
      <Readout
        values={[
          ["Precision", pct(r.precision)],
          ["Recall / TPR", pct(r.recall)],
          ["Specificity", pct(r.specificity)],
          ["Expected FP", f(r.fp, 1)],
        ]}
      />
      <Derivation
        steps={[
          [
            "Count population",
            "N+=1000×" +
              prevalence +
              "%=" +
              prevalence * 10 +
              "；N−=" +
              (1000 - prevalence * 10) +
              "。",
          ],
          [
            "Integrate score tail",
            "只累加 threshold 右侧的 conditional probability：TPR=" +
              pct(r.recall) +
              "，FPR=" +
              pct(1 - r.specificity) +
              "。",
          ],
          [
            "Build confusion matrix",
            "TP=N+×TPR=" +
              f(r.tp, 1) +
              "，FP=N−×FPR=" +
              f(r.fp, 1) +
              "。小数表示 expected counts。",
          ],
          [
            "Interpret",
            "Precision=TP/(TP+FP)=" +
              pct(r.precision) +
              "；没有 predicted positive 时分母为0，precision 未定义。",
          ],
        ]}
      />
      <Details
        links={[
          ["class-imbalance", "Class Imbalance"],
          ["calibration-uncertainty", "Calibration"],
        ]}
        source="scikit-learn · Precision-Recall"
        href="https://scikit-learn.org/stable/auto_examples/model_selection/plot_precision_recall.html"
      >
        <p>
          <strong>When：</strong>rare cell type detection、candidate
          filtering、binary classifier deployment。阈值选型同时考虑 false
          positive 与 false negative 的任务代价。
        </p>
        <p>
          <strong>Settings：</strong>仅用 validation 调 threshold，锁定后评估
          independent cohort；报告 prevalence、PR curve、confusion matrix 和
          subgroup metrics。
        </p>
        <p>
          <strong>Limits：</strong>阈值改变 decision，不能修复 representation 或
          calibration。本例固定 conditional distributions；真实
          covariate/concept shift 要另查。
        </p>
      </Details>
      <button
        type="button"
        onClick={() => {
          setPrevalence(10);
          setCut(4);
        }}
      >
        重置 Threshold 参数
      </button>
    </>
  );
}
function Transport() {
  const [epsilon, setEpsilon] = useState(0.7),
    [demand, setDemand] = useState(0.4),
    [iterations, setIterations] = useState(0);
  const r = sinkhornExperiment(epsilon, demand, iterations);
  return (
    <>
      <h2>每行各自 softmax 后，为什么仍不满足目标容量？</h2>
      <p>
        Input：3×3 cost matrix、source mass a、target mass b。Output：transport
        plan P。手动运行 Sinkhorn，观察两侧 marginal 是否同时满足。
      </p>
      <Check
        question="只把每行归一化到 a，就足以满足 b 吗？"
        options={[
          "是，每行正确即可",
          "否，还需要 column scaling 并交替迭代",
          "把所有 weights 变硬就行",
        ]}
        correct={1}
        explanation="行约束和列约束耦合。一次 column scaling 会改变行和，因此要继续交替更新，监测 marginal residual。"
      />
      <div className="bench-controls">
        <Range
          label="Entropy regularization ε"
          min={0.2}
          max={2}
          step={0.1}
          value={epsilon}
          set={(v) => {
            setEpsilon(v);
            setIterations(0);
          }}
          hint="ε 与 cost 同尺度；增大通常让 plan 更分散。"
        />
        <Range
          label="Target B mass"
          min={0.2}
          max={0.6}
          step={0.05}
          value={demand}
          set={(v) => {
            setDemand(v);
            setIterations(0);
          }}
          hint="b=[0.2, B, 0.8−B]；source a=[0.5,0.3,0.2]。"
        />
      </div>
      <div className="bench-iteration">
        <strong>完整 u/v iterations：{iterations}</strong>
        <button
          type="button"
          onClick={() => setIterations((x) => Math.min(100, x + 1))}
          disabled={iterations === 100}
        >
          运行下一次 iteration
        </button>
        <button type="button" onClick={() => setIterations(100)}>
          计算 100 次作为对照
        </button>
      </div>
      <Plot
        label={
          "Transport flows，iteration " +
          iterations +
          "，marginal residual " +
          f(r.error, 5)
        }
        height={300}
      >
        <text x="25" y="25">
          Source a → P 的流量 → Target b
        </text>
        {r.plan.flatMap((row, i) =>
          row.map((p, j) => (
            <path
              key={i + "-" + j}
              d={
                "M145 " +
                (75 + i * 85) +
                "C270 " +
                (75 + i * 85) +
                " 365 " +
                (75 + j * 85) +
                " 490 " +
                (75 + j * 85)
              }
              fill="none"
              stroke={i === 0 ? blue : i === 1 ? teal : "#765298"}
              strokeWidth={Math.max(0.7, Math.min(24, p * 60))}
              opacity=".55"
            />
          )),
        )}
        {r.a.map((mass, i) => (
          <g key={i}>
            <circle cx="135" cy={75 + i * 85} r="11" fill={blue} />
            <text x="20" y={70 + i * 85}>
              {"ABC"[i]} · a={f(mass, 1)}
            </text>
            <text x="20" y={91 + i * 85}>
              ΣP={f(r.rows[i])}
            </text>
            <circle cx="500" cy={75 + i * 85} r="11" fill={teal} />
            <text x="520" y={70 + i * 85}>
              {"ABC"[i]} · b={f(r.b[i], 2)}
            </text>
            <text x="520" y={91 + i * 85}>
              ΣP={f(r.columns[i])}
            </text>
          </g>
        ))}
      </Plot>
      <Plot
        label={
          "Transport plan matrix " +
          r.plan.map((row) => row.map((x) => f(x)).join(", ")).join("; ")
        }
        height={230}
      >
        <text x="30" y="27">
          P = diag(u) K diag(v)
        </text>
        <text x="360" y="27">
          C = [[0,1,4],[1,0,1],[4,1,0]]
        </text>
        {r.plan.flatMap((row, i) =>
          row.map((p, j) => (
            <g key={i + "-" + j}>
              <rect
                x={35 + j * 190}
                y={45 + i * 56}
                width="180"
                height="48"
                fill={blue}
                fillOpacity={0.04 + 0.18 * Math.min(p / 0.5, 1)}
              />
              <text x={70 + j * 190} y={76 + i * 56}>
                {"ABC"[i]}→{"ABC"[j]} {f(p)}
              </text>
            </g>
          )),
        )}
      </Plot>
      <Readout
        values={[
          ["Max marginal residual", f(r.error, 6)],
          ["Total mass", f(r.mass)],
          ["Transport cost ΣPC", f(r.cost)],
        ]}
      />
      <Derivation
        steps={[
          [
            "Kernel",
            "Kᵢⱼ=exp(−Cᵢⱼ/ε)。Iteration0时 u=v=1，显示的是未归一化 K；total mass 不必等于1。",
          ],
          [
            "Row scaling",
            "u=a/(Kv)，elementwise division；每行调整到 source mass。",
          ],
          [
            "Column scaling",
            "v=b/(Kᵀu)，再更新 target marginal；当前 v=[" +
              r.v.map((x) => f(x)).join(", ") +
              "]。",
          ],
          [
            "Check convergence",
            "P=diag(u)Kdiag(v)；max(|P1−a|,|Pᵀ1−b|)=" +
              f(r.error, 6) +
              "。Cost 单独显示，未包含 entropy term。",
          ],
        ]}
      />
      <Details
        links={[
          ["optimal-transport", "Optimal Transport"],
          ["spatial-assignment", "Spatial Assignment"],
        ]}
        source="Cuturi (2013)"
        href="https://arxiv.org/abs/1306.0895"
      >
        <p>
          <strong>When：</strong>需要同时约束 supply/demand 的 distribution
          matching；spatial correspondence 的 marginals 与 cost 必须有实际含义。
        </p>
        <p>
          <strong>Settings：</strong>先标准化 cost 单位；按 residual
          停止，不能仅数 iterations；极小 ε 在大任务中用 log-domain
          updates，检查 underflow。
        </p>
        <p>
          <strong>Limits：</strong>本例是 balanced entropic OT，强制分配所有
          mass；真实 unmatched、缺失组织和不同总量可能需要 partial/unbalanced
          OT。Plan 不是经验证的 cell identity posterior。
        </p>
      </Details>
      <button
        type="button"
        onClick={() => {
          setEpsilon(0.7);
          setDemand(0.4);
          setIterations(0);
        }}
      >
        重置 Sinkhorn 参数
      </button>
    </>
  );
}
function Bootstrap() {
  const [copies, setCopies] = useState(1);
  const r = useMemo(() => bootstrapExperiment(copies), [copies]);
  const hist = (xs: number[]) =>
    Array.from(
      { length: 20 },
      (_, i) =>
        xs.filter(
          (x) => x >= i * 0.6 && (x < (i + 1) * 0.6 || (i === 19 && x <= 12)),
        ).length,
    );
  const rowBins = hist(r.row),
    donorBins = hist(r.donor),
    peak = Math.max(...rowBins, ...donorBins);
  return (
    <>
      <h2>把同一批 cells 复制十遍，interval 为什么会“更精确”？</h2>
      <p>
        Input：4 个 donors，每个3个 synthetic
        values：A=[1,2,3]，B=[3,4,5]，C=[7,8,9]，D=[9,10,11]。Output：row
        bootstrap 与 donor cluster bootstrap 的 mean distributions。固定 seed 和
        512 次 resamples，方便复算。
      </p>
      <Check
        question="增加完全相同的 cell rows，独立 donor 仍为4，哪个 interval 应保持？"
        options={[
          "Donor cluster bootstrap",
          "Row bootstrap 必然正确",
          "两种都必须缩小十倍",
        ]}
        correct={0}
        explanation="这里刻意复制原始 rows，不添加新独立信息。把所有 rows 当独立样本会产生虚假的精度；donor resampling 保留组结构。"
      />
      <Range
        label="Copies of each donor's three cells"
        min={1}
        max={10}
        value={copies}
        set={setCopies}
        hint="每 donor 的原始3个值重复copies次；不是重新采集的独立 cells。"
      />
      <Plot
        label={
          "4 donors，" + r.cells.length + " cell rows；donor means 2,4,8,10"
        }
        height={245}
      >
        <text x="35" y="25">
          观察层级：每行一个 donor，数字是该 donor 的 mean
        </text>
        {r.means.map((m, i) => (
          <g key={m}>
            <text x="30" y={63 + i * 49}>
              Donor {"ABCD"[i]} · {m}
            </text>
            {Array.from({ length: copies * 3 }, (_, j) => (
              <circle
                key={j}
                cx={185 + j * 13.7}
                cy={58 + i * 49}
                r="4"
                fill={i % 2 ? teal : blue}
              />
            ))}
          </g>
        ))}
      </Plot>
      <Plot
        label={
          "Bootstrap distributions，row interval " +
          r.rowInterval.map((x) => f(x, 2)) +
          "，donor interval " +
          r.donorInterval.map((x) => f(x, 2))
        }
        height={320}
      >
        <text x="55" y="25">
          Bootstrap mean · 蓝色 Row / 绿色 Donor cluster
        </text>
        <path d="M55 50V220H600" className="bench-axis" />
        {rowBins.map((v, i) => (
          <g key={i}>
            <rect
              x={58 + i * 26}
              y={220 - (v / peak) * 155}
              width="11"
              height={(v / peak) * 155}
              fill={blue}
            />
            <rect
              x={70 + i * 26}
              y={220 - (donorBins[i] / peak) * 155}
              width="11"
              height={(donorBins[i] / peak) * 155}
              fill={teal}
            />
          </g>
        ))}
        {[0, 3, 6, 9, 12].map((x) => (
          <text key={x} x={55 + (x / 12) * 520} y="240">
            {x}
          </text>
        ))}
        <text x="5" y="63">
          {peak}
        </text>
        <text x="5" y="84">
          Count
        </text>
        {[r.rowInterval, r.donorInterval].map((ci, i) => (
          <g key={i}>
            <line
              x1={55 + (ci[0] / 12) * 520}
              x2={55 + (ci[1] / 12) * 520}
              y1={267 + i * 30}
              y2={267 + i * 30}
              stroke={i ? teal : blue}
              strokeWidth="5"
            />
            <circle
              cx={55 + (6 / 12) * 520}
              cy={267 + i * 30}
              r="5"
              fill={i ? teal : blue}
            />
          </g>
        ))}
      </Plot>
      <Readout
        values={[
          ["Independent donors / rows", "4 / " + r.cells.length],
          ["Mean", f(r.mean, 1)],
          [
            "Row percentile interval",
            r.rowInterval.map((x) => f(x, 2)).join(" – "),
          ],
          [
            "Donor percentile interval",
            r.donorInterval.map((x) => f(x, 2)).join(" – "),
          ],
        ]}
      />
      <Derivation
        steps={[
          [
            "Define estimand",
            "这里每 donor 权重相同，目标是 donor means 的平均：(2+4+8+10)/4=6。",
          ],
          [
            "Row resampling",
            "把" +
              r.cells.length +
              "个 rows 放在一起，每次抽相同数量，有放回；这种方法忽略 donor dependence。",
          ],
          [
            "Cluster resampling",
            "每次抽4个 donor IDs，有放回，并带上该 donor 的整个 cell block。这是单层 cluster bootstrap，未额外在 donor 内 resample。",
          ],
          [
            "Read interval",
            "取512个 means 的2.5%与97.5% percentiles。只有4 donors 时 coverage 与稳定性有限；更多 resamples 不创造更多独立 donors。",
          ],
        ]}
      />
      <Details
        links={[
          ["hierarchical-bootstrap", "Hierarchical Bootstrap"],
          ["pseudobulk-hierarchy", "Pseudobulk"],
          ["nested-group-validation", "Group CV"],
        ]}
        source="Saravanan et al. (2020)"
        href="https://pmc.ncbi.nlm.nih.gov/articles/PMC7906290/"
      >
        <p>
          <strong>When：</strong>cell/donor、patch/patient、visit/person
          等嵌套数据。先定义目标人群、独立 unit 和 weighting，再选 resampling
          scheme。
        </p>
        <p>
          <strong>Settings：</strong>真实研究检查 bootstrap repetitions、seed
          sensitivity 和 interval method；paired conditions 要成对 resample
          donors。Group CV 评估 generalization，bootstrap 估计 sampling
          variability，两者问题不同。
        </p>
        <p>
          <strong>Limits：</strong>少量 donors、严重 imbalance、confounding
          或选择流程会影响 interval；如果模型经过调参，是否每次重新
          fit/调参必须明确。
        </p>
      </Details>
      <button type="button" onClick={() => setCopies(1)}>
        重置 Bootstrap 参数
      </button>
    </>
  );
}
export default function ExperimentBench() {
  const { lab } = usePracticeRoute();
  const kind: Kind = lab && Object.hasOwn(names, lab) ? (lab as Kind) : "bayes";
  return (
    <section className="experiment-bench" aria-label="机制推演实验室">
      <div className="bench-picker" role="group" aria-label="选择机制实验">
        {Object.entries(names).map(([id, title]) => (
          <button
            key={id}
            type="button"
            aria-pressed={kind === id}
            onClick={() => {
              navigatePractice({ tab: "bench", lab: id });
            }}
          >
            {title}
          </button>
        ))}
      </div>
      <p className="bench-note">
        Synthetic examples ·
        先选答案，再改参数、读图、逐步推导。所有图和数字由当前设置实时计算。
      </p>
      <div key={kind}>
        {kind === "bayes" ? (
          <Bayes />
        ) : kind === "threshold" ? (
          <Threshold />
        ) : kind === "transport" ? (
          <Transport />
        ) : (
          <Bootstrap />
        )}
      </div>
      <p className="bench-bridge">
        把方法连回观测过程：
        <a href="https://haoyunli.github.io/intro-to-bio-for-computational-biology/foundations-lab.html#mechanism-workbench">
          打开 Bio/CS 的 biological mechanism 实验
        </a>
      </p>
    </section>
  );
}
