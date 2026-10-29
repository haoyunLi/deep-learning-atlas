import { useEffect, useState, useId, type ReactNode } from "react";
import {
  countMixtureEM,
  assignmentPlanning,
  gaeExperiment,
  gcnExperiment,
  gatExperiment,
  contrastiveExperiment,
} from "./bioAlgorithmMath";
import "./bio-algorithms.css";

export type BioLabKind =
  "em" | "planning" | "gae" | "gcn" | "gat" | "contrastive";
const names: Record<BioLabKind, string> = {
  em: "Count mixture EM",
  planning: "Assignment → RL?",
  gae: "GAE & Bootstrap",
  gcn: "GCN & Boundary",
  gat: "GAT & Neighbors",
  contrastive: "Contrastive pairs",
};
const blue = "#245fbd",
  teal = "#167b73",
  orange = "#a75224";
const colors = [blue, teal, orange];
const f = (v: number, n = 3) =>
  n === 3 && v !== 0 && Math.abs(v) < 0.0005
    ? v.toExponential(2)
    : v.toFixed(n);
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
    <label className="bio-range">
      <span>
        {label} <output>{f(value, step < 1 ? 2 : 0)}</output>
      </span>
      <input
        type="range"
        aria-label={label}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => set(Number(e.target.value))}
      />
      <small>{hint}</small>
    </label>
  );
}
function Choice({
  label,
  value,
  options,
  set,
}: {
  label: string;
  value: string;
  options: [string, string][];
  set: (v: string) => void;
}) {
  return (
    <label className="bio-choice">
      {label}
      <select value={value} onChange={(e) => set(e.target.value)}>
        {options.map(([id, name]) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}
function Plot({
  label,
  children,
  height = 280,
}: {
  label: string;
  children: ReactNode;
  height?: number;
}) {
  return (
    <div
      className="bio-plot"
      tabIndex={0}
      role="region"
      aria-label={`${label}，可横向滚动`}
    >
      <svg viewBox={`0 0 660 ${height}`} role="img" aria-label={label}>
        {children}
      </svg>
    </div>
  );
}
function Readout({ values }: { values: [string, string][] }) {
  return (
    <dl className="bio-readout" aria-live="polite">
      {values.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}
function Bars({
  label,
  labels,
  values,
  format = (x: number) => f(x),
  signed = false,
}: {
  label: string;
  labels: string[];
  values: number[];
  format?: (x: number) => string;
  signed?: boolean;
}) {
  const max = Math.max(1e-9, ...values.map(Math.abs));
  const base = signed ? 380 : 180,
    scale = (signed ? 170 : 360) / max;
  return (
    <Plot label={label} height={80 + 38 * values.length}>
      <text x={20} y={27} className="bio-svg-title">
        {label}
      </text>
      {values.map((v, i) => (
        <g key={labels[i]}>
          <text x={20} y={63 + i * 38}>
            {labels[i]}
          </text>
          <line
            x1={base}
            y1={45 + i * 38}
            x2={base}
            y2={70 + i * 38}
            stroke="#b7c6d8"
          />
          <rect
            x={v < 0 ? base + v * scale : base}
            y={46 + i * 38}
            width={Math.max(0.5, Math.abs(v) * scale)}
            height={22}
            fill={colors[i % 3]}
          />
          <text x={Math.max(base, base + v * scale) + 8} y={62 + i * 38}>
            {format(v)}
          </text>
        </g>
      ))}
    </Plot>
  );
}
function Curve({
  label,
  values,
  step,
}: {
  label: string;
  values: number[];
  step: number;
}) {
  const lo = Math.min(...values),
    hi = Math.max(...values),
    span = hi - lo || 1;
  const x = (i: number) => 90 + (i * 510) / Math.max(1, values.length - 1),
    y = (v: number) => 200 - ((v - lo) * 130) / span;
  return (
    <Plot label={label} height={255}>
      <text x={20} y={27} className="bio-svg-title">
        {label}
      </text>
      {[0, 0.5, 1].map((a) => (
        <g key={a}>
          <line
            x1={85}
            y1={200 - a * 130}
            x2={610}
            y2={200 - a * 130}
            stroke="#d6dfe9"
          />
          <text x={75} y={205 - a * 130} textAnchor="end">
            {f(lo + a * span, 2)}
          </text>
        </g>
      ))}
      <polyline
        points={values.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
        fill="none"
        stroke={blue}
        strokeWidth={2}
      />
      {values.map((v, i) => (
        <circle
          key={i}
          cx={x(i)}
          cy={y(v)}
          r={i === step ? 6 : 3}
          fill={i === step ? orange : blue}
        />
      ))}
      <text x={90} y={235}>
        0
      </text>
      <text x={580} y={235}>
        {values.length - 1}
      </text>
      <text x={280} y={235}>
        Iteration / Layer
      </text>
    </Plot>
  );
}
function useSequence(max: number) {
  const [step, setStep] = useState(0),
    [playing, setPlaying] = useState(false),
    [reduced, setReduced] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setReduced(q.matches);
      if (q.matches) setPlaying(false);
    };
    sync();
    q.addEventListener("change", sync);
    return () => q.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (!playing) return;
    const pause = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener("visibilitychange", pause);
    const timer = window.setInterval(
      () => setStep((s) => Math.min(max, s + 1)),
      1700,
    );
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", pause);
    };
  }, [playing, max]);
  useEffect(() => {
    if (step >= max) setPlaying(false);
  }, [step, max]);
  const choose = (v: number) => {
    setPlaying(false);
    setStep(v);
  };
  const controls = (
    <div className="bio-stepper">
      <button disabled={step === 0} onClick={() => choose(step - 1)}>
        ← 上一步
      </button>
      <output>
        Step {step} / {max}
      </output>
      <button disabled={step === max} onClick={() => choose(step + 1)}>
        下一步 →
      </button>
      <button
        disabled={reduced}
        onClick={() => {
          if (step === max) setStep(0);
          setPlaying(!playing);
        }}
      >
        {playing ? "暂停" : "播放推演"}
      </button>
      <button onClick={() => choose(0)}>回到起点</button>
      {reduced && <small>Reduced motion：使用手动步骤。</small>}
    </div>
  );
  return { step, choose, controls, playing };
}
function Question({
  prompt,
  options,
  answer,
  explanation,
}: {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
}) {
  const [choice, setChoice] = useState(-1),
    [checked, setChecked] = useState(false);
  const group = useId();
  return (
    <fieldset className="bio-question">
      <legend>先预测，再验证：{prompt}</legend>
      {options.map((o, i) => (
        <label key={o}>
          <input
            type="radio"
            name={group}
            checked={choice === i}
            onChange={() => {
              setChoice(i);
              setChecked(false);
            }}
          />
          {o}
        </label>
      ))}
      <button disabled={choice < 0} onClick={() => setChecked(true)}>
        检查理解
      </button>
      {checked && (
        <p role="status">
          {choice === answer ? "正确。" : "再看一下计算。"}
          {explanation}
        </p>
      )}
    </fieldset>
  );
}
function Notes({
  children,
  lessons,
  sources,
}: {
  children: ReactNode;
  lessons: [string, string][];
  sources: [string, string][];
}) {
  return (
    <>
      <details className="bio-notes">
        <summary>什么时候用、怎么设置，以及解释边界</summary>
        {children}
        <p>
          继续阅读：
          {lessons.map(([id, name]) => (
            <a key={id} href={`#/lesson/${id}`}>
              {name} →{" "}
            </a>
          ))}
        </p>
        <p>
          方法来源：
          {sources.map(([url, name]) => (
            <a key={url} href={url} target="_blank" rel="noreferrer">
              {name} ↗{" "}
            </a>
          ))}
        </p>
      </details>
    </>
  );
}
function EMExperiment() {
  const [ambient, setAmbient] = useState(5),
    [model, setModel] = useState("full");
  const seq = useSequence(15);
  const r = countMixtureEM(ambient, model !== "missing", model === "zero", 15),
    s = r.history[seq.step];
  const labels = ["Profile A", "Profile B", "Ambient"].slice(
    0,
    s.weights.length,
  );
  return (
    <>
      <h2>EM 把 molecules 分给谁？</h2>
      <p>
        一个合成 bin 的三个 gene counts 为 [8, 3, {ambient}]。固定 reference
        profiles，交替估计每种 molecule 的来源和 mixture proportions。这里的 π
        是 molecule fraction，不是 cell fraction，也不是 bin 的 cell identity
        posterior。
      </p>
      <div className="bio-controls">
        <Range
          label="Gene 3 count"
          value={ambient}
          min={0}
          max={20}
          set={(v) => {
            setAmbient(v);
            seq.choose(0);
          }}
          hint="Gene 3 在 Ambient profile 中最多；这个滑块改 observed counts。"
        />
        <Choice
          label="Model specification"
          value={model}
          set={(v) => {
            setModel(v);
            seq.choose(0);
          }}
          options={[
            ["full", "A + B + Ambient；π₀ = .4/.4/.2"],
            ["missing", "漏掉 Ambient；π₀ = .5/.5"],
            ["zero", "Ambient π₀ = 0；检查 zero trapping"],
          ]}
        />
      </div>
      <p className="bio-equation">
        E: r[g,k] = π[k] θ[k,g] / Σⱼπ[j]θ[j,g]　 M: π′[k] = Σg y[g]r[g,k] / N
      </p>
      {seq.controls}
      <div className="bio-figure-pair">
        <Plot
          label={`E-step expected molecule allocations at iteration ${seq.step}`}
          height={255}
        >
          <text x={20} y={27} className="bio-svg-title">
            E-step：expected allocated molecules
          </text>
          {r.counts.map((n, g) => (
            <g key={g}>
              <text x={20} y={80 + g * 52}>
                Gene {g + 1} · y={n}
              </text>
              {s.allocated[g].map((v, k) => (
                <rect
                  key={k}
                  x={
                    180 +
                    s.allocated[g].slice(0, k).reduce((a, b) => a + b, 0) * 18
                  }
                  y={60 + g * 52}
                  width={v * 18}
                  height={28}
                  fill={colors[k]}
                />
              ))}
              <text x={190 + n * 18} y={80 + g * 52}>
                {n}
              </text>
            </g>
          ))}
          {labels.map((l, i) => (
            <text key={l} x={20 + i * 205} y={235} style={{ fill: colors[i] }}>
              ■ {l}: π={f(s.weights[i])}
            </text>
          ))}
        </Plot>
        <Curve
          label="Observed log-likelihood (constant omitted)"
          values={r.history.map((x) => x.logLikelihood)}
          step={seq.step}
        />
      </div>
      <Readout
        values={[
          [`Iteration ${seq.step} · log L`, f(s.logLikelihood)],
          ["Mixture π", s.weights.map((x) => f(x)).join(" / ")],
          ["Expected gene counts", s.expected.map((x) => f(x, 2)).join(" / ")],
        ]}
      />
      <p className="bio-interpretation">
        当前 Gene 3 分给{" "}
        {labels.map((l, k) => `${l} ${f(s.allocated[2][k], 2)}`).join("，")} 个
        expected molecules。下一次 M-step 会把各 gene 的 allocation 加总，再除以
        N={r.counts.reduce((a, b) => a + b, 0)}。
        {model === "zero"
          ? " Ambient 权重从 0 开始，每次 responsibility 都为 0，EM 无法自行恢复它。"
          : model === "missing"
            ? " 缺失的来源只能被已有 profiles 吸收；likelihood 上升也不能补回一个没建模的来源。"
            : " 每次完整 M-step 的 observed likelihood 不下降；这不等于来源标签已被生物学验证。"}
      </p>
      <details className="bio-notes">
        <summary>展开 reference profiles 与当前 responsibility 数值</summary>
        <p>
          θ A=[.80,.15,.05]；B=[.10,.80,.10]；Ambient=[.15,.15,.70]，每行和为
          1。它们是人为设定的 reference。
        </p>
        {s.responsibilities.map((v, g) => (
          <p key={g}>
            Gene {g + 1}: r = [{v.map((x) => f(x)).join(", ")}]；y × r = [
            {s.allocated[g].map((x) => f(x)).join(", ")}]
          </p>
        ))}
      </details>
      <Question
        prompt="Ambient 初始权重是 0，再多迭代会怎样？"
        options={["EM 会自动发现新来源", "这个 unregularized 更新会一直保持 0"]}
        answer={1}
        explanation="E-step 分子含 π，零权重使所有对应 responsibility 为零。重启、正的初始化或改变模型可以处理，但已经改变了条件。"
      />
      <Notes
        lessons={[
          ["count-mixture-background", "Count mixture"],
          ["em-objective-diagnostics", "EM diagnostics"],
        ]}
        sources={[
          [
            "https://doi.org/10.1111/j.2517-6161.1977.tb01600.x",
            "EM original paper",
          ],
        ]}
      >
        <p>
          适合学习 fixed-profile deconvolution 的 latent allocation；只有
          profiles 可区分、reference 适配时 mixture 才可识别。实际 spatial
          counts 可需要 exposure、NB overdispersion、unknown component
          和多基因模型。此处只有 conditional Multinomial likelihood，没有拟合
          gene profiles、cell abundance 或 uncertainty interval。
        </p>
        <p>
          起步用正的 π、多次 initialization、held-out likelihood 和 residual
          genes。增加 iterations 前先看 convergence 与 reference
          mismatch；不要把更多 component 当成自动更准确。
        </p>
      </Notes>
    </>
  );
}
function PlanningExperiment() {
  const [gamma, setGamma] = useState(1),
    [penalty, setPenalty] = useState(1),
    [reference, setReference] = useState("BA");
  const r = assignmentPlanning(gamma, penalty, reference);
  return (
    <>
      <h2>Assignment 有全局约束，就必须用 RL 吗？</h2>
      <p>
        两个 bins 各选 A 或 B。单独看 scores：bin 1 是 [.90,.80]，bin 2 是
        [.85,.10]；重复选同一个 cell 会在第二步扣
        penalty。只有四个方案，直接枚举就能找到此 toy objective 的最优解。
      </p>
      <div className="bio-controls">
        <Range
          label="Discount γ"
          value={gamma}
          min={0}
          max={1}
          step={0.05}
          set={setGamma}
          hint="改变第二步 reward 对第一步决策的影响。"
        />
        <Range
          label="Collision penalty"
          value={penalty}
          min={0}
          max={2}
          step={0.05}
          set={setPenalty}
          hint="Soft penalty；有限惩罚不等于 hard capacity constraint。"
        />
        <Choice
          label="独立 evaluation reference"
          value={reference}
          set={setReference}
          options={[
            ["BA", "bin 1→B，bin 2→A"],
            ["AB", "bin 1→A，bin 2→B"],
          ]}
        />
        <button
          onClick={() => {
            setGamma(1);
            setPenalty(1);
            setReference("BA");
          }}
        >
          恢复参数
        </button>
      </div>
      <p className="bio-equation">
        G = score(bin 1) + γ [score(bin 2) − penalty × collision]
      </p>
      <div className="bio-figure-pair">
        <Plot
          label={`Four assignment trajectories; optimal ${r.optimal.id}`}
          height={300}
        >
          <text x={20} y={25} className="bio-svg-title">
            穷举 state → action → terminal return
          </text>
          <text x={25} y={163}>
            Start
          </text>
          {[0, 1].map((i) => (
            <g key={i}>
              <line
                x1={75}
                y1={157}
                x2={230}
                y2={95 + i * 120}
                stroke="#93a9c4"
              />
              <text x={160} y={75 + i * 120}>
                bin 1 → {i === 0 ? "A" : "B"}
              </text>
              {r.paths.slice(i * 2, i * 2 + 2).map((p, j) => (
                <g key={p.id}>
                  <line
                    x1={230}
                    y1={95 + i * 120}
                    x2={405}
                    y2={65 + i * 120 + j * 58}
                    stroke={p.id === r.optimal.id ? blue : "#93a9c4"}
                    strokeWidth={p.id === r.optimal.id ? 4 : 1}
                  />
                  <text x={415} y={70 + i * 120 + j * 58}>
                    {p.id} · G={f(p.value, 2)} {p.collision ? "collision" : ""}
                  </text>
                </g>
              ))}
            </g>
          ))}
        </Plot>
        <Bars
          label="Return：同一目标下逐方案比较"
          labels={r.paths.map((p) => p.id)}
          values={r.paths.map((p) => p.value)}
          signed
        />
      </div>
      <Readout
        values={[
          ["Exact optimum", `${r.optimal.id} · ${f(r.optimal.value)}`],
          ["Greedy first step", `${r.greedy.id} · ${f(r.greedy.value)}`],
          ["Optimum reference accuracy", `${r.optimal.accuracy * 100}%`],
        ]}
      />
      <p className="bio-interpretation">
        并列最优时只展示 AA、AB、BA、BB 顺序中的第一个方案。Reference 只参与
        evaluation，不影响 reward 或选中的路径。换 reference 后，objective
        optimum 保持 {r.optimal.id}，但“最优”与 biological accuracy
        可以分离。该例的 collision 只是人为 one-to-one 约束；实际多个 bins
        归于同一个 cell 往往完全合理。
      </p>
      <Question
        prompt="约束全部已知、objective 可直接算，下一步先做什么？"
        options={[
          "先建 exact / optimization baseline，再论证 RL 的额外价值",
          "立即训练 PPO，模型复杂度越高越好",
        ]}
        answer={0}
        explanation="RL 更值得用于真正序贯、action 改变后续 observation/state、reward 延迟且要从交互中学习的任务。静态分配可先考虑 matching、min-cost flow 或 OT。"
      />
      <Notes
        lessons={[
          ["spatial-mdp-design", "Spatial MDP"],
          ["structured-assignment-inference", "Structured inference"],
          ["reward-shaping-constraints", "Reward design"],
        ]}
        sources={[
          [
            "http://incompleteideas.net/book/the-book-2nd.html",
            "Sutton & Barto",
          ],
        ]}
      >
        <p>
          此处是 known-model exhaustive planning，没有 policy
          training、exploration 或 PPO update。γ 与 penalty
          都在定义目标，不是无关紧要的数值开关。若真正需要 hard
          constraint，应限制 feasible actions，而不是无限增加 penalty。
        </p>
        <p>
          实际 bin-to-cell 项目先检查 candidate
          recall、unmatched、容量与细胞大小，再比较静态 solver。若用 RL，记录
          state/action/reward/terminal、action masks，按 tissue/donor
          留出，并用不依赖 reward 的边界和 assignment 指标验证。
        </p>
      </Notes>
    </>
  );
}
function GAEExperiment() {
  const [gamma, setGamma] = useState(0.99),
    [lambda, setLambda] = useState(0.95),
    [ending, setEnding] = useState("terminal");
  const seq = useSequence(3);
  const r = gaeExperiment(gamma, lambda, ending === "truncated");
  return (
    <>
      <h2>最后一步结束了，为什么还要 Bootstrap？</h2>
      <p>
        合成 rollout 的 rewards=[0,0,1]，critic V=[.4,.6,.5]。逐步向前取得 TD
        residual，再从最后一步向后累积 GAE。此处只有 estimator 计算，没有训练
        agent。
      </p>
      <div className="bio-controls">
        <Range
          label="GAE γ"
          value={gamma}
          min={0.5}
          max={1}
          step={0.01}
          set={(v) => {
            setGamma(v);
            seq.choose(0);
          }}
          hint="Discount 决定未来 reward 权重。"
        />
        <Range
          label="GAE λ"
          value={lambda}
          min={0}
          max={1}
          step={0.05}
          set={(v) => {
            setLambda(v);
            seq.choose(0);
          }}
          hint="λ=0 用单步 TD；λ=1 用完整此段 residual trace。"
        />
        <Choice
          label="Rollout ending"
          value={ending}
          set={(v) => {
            setEnding(v);
            seq.choose(0);
          }}
          options={[
            ["terminal", "True terminal：next V=0"],
            ["truncated", "Time-limit truncation：next V=.7"],
          ]}
        />
      </div>
      <p className="bio-equation">
        δₜ=rₜ+γV(sₜ₊₁)−V(sₜ)；Aₜ=δₜ+γλAₜ₊₁；targetₜ=Aₜ+V(sₜ)
      </p>
      {seq.controls}
      <div className="bio-figure-pair">
        <Bars
          label="TD residual δ：先减去当前 V"
          labels={["t=0", "t=1", "t=2"]}
          values={r.deltas}
          signed
        />
        <Plot
          label={`Backward GAE calculation, ${seq.step} steps revealed`}
          height={240}
        >
          <text x={20} y={28} className="bio-svg-title">
            Backward trace：t=2 → t=1 → t=0
          </text>
          {[2, 1, 0].map((t, i) => (
            <g key={t}>
              <rect
                x={20 + i * 215}
                y={65}
                width={190}
                height={105}
                fill={seq.step > i ? "#ecf3ff" : "#f1f3f6"}
                stroke="#b9c9dc"
              />
              <text x={35 + i * 215} y={90}>
                t={t} · δ={f(r.deltas[t])}
              </text>
              <text x={35 + i * 215} y={123}>
                A = {seq.step > i ? f(r.advantages[t]) : "点击下一步"}
              </text>
              <text x={35 + i * 215} y={150}>
                target = {seq.step > i ? f(r.targets[t]) : "—"}
              </text>
              {i < 2 && (
                <text x={212 + i * 215} y={121}>
                  →
                </text>
              )}
            </g>
          ))}
          <text x={20} y={211}>
            Trace 在 rollout 边界停止；truncation 仍保留 next-state bootstrap。
          </text>
        </Plot>
      </div>
      <Readout
        values={[
          ["Last next-state V", f(r.bootstrap)],
          ["Last δ", f(r.deltas[2])],
          ["Trace revealed", `${seq.step} / 3`],
        ]}
      />
      <p className="bio-interpretation">
        {seq.step === 0
          ? "先看 δ₂ = 1 + γ × next V − .5。先点击下一步算 A₂，再继续看它如何进入 A₁。"
          : `刚计算 A${3 - seq.step} = ${f(r.deltas[3 - seq.step])} + ${f(gamma * lambda)} × ${3 - seq.step === 2 ? "0" : f(r.advantages[4 - seq.step])} = ${f(r.advantages[3 - seq.step])}。`}{" "}
        Time-limit 是外部采样截断时，继续使用 terminal observation 的
        V；不要错用环境 reset 后 observation 的 V。
      </p>
      <Question
        prompt="把 truncation 当 terminal，常见后果是什么？"
        options={[
          "错误丢弃 bootstrap，改变 advantage/critic target",
          "只是少记录一个状态，不影响更新",
        ]}
        answer={0}
        explanation="这里 next V=.7 时最后 δ 比 terminal 情况多 γ×.7，影响还会沿 γλ 向前传播。有限时长本身属于任务定义时，真正 horizon terminal 则应置零。"
      />
      <Notes
        lessons={[
          ["ppo", "PPO"],
          ["spatial-policy-ope", "Policy evaluation"],
        ]}
        sources={[
          ["https://arxiv.org/abs/1506.02438", "GAE"],
          [
            "https://gymnasium.farama.org/tutorials/gymnasium_basics/handling_time_limits/",
            "Gymnasium time limits",
          ],
        ]}
      >
        <p>
          PPO 常见 γ=.99、λ=.95 仅是探索起点；应与有效 horizon、reward
          delay、critic error 对应。先测 episode length、advantage scale、value
          loss 与 reward components，再调 clipping。λ 大会保留更长
          trace；bias/variance 依赖 critic 与采样，不保证性能单调。
        </p>
        <p>
          GAE 是 on-policy trajectory estimator
          的常用组件；不要把旧策略日志不加修正地当成当前策略 rollout。OPE 还需要
          support 与 propensity 等条件。
        </p>
      </Notes>
    </>
  );
}
function GCNExperiment() {
  const [bridge, setBridge] = useState(1),
    [loops, setLoops] = useState(1);
  const seq = useSequence(8);
  const r = gcnExperiment(bridge, loops, 8),
    h = r.history[seq.step];
  return (
    <>
      <h2>一条跨边界 edge，怎样改变整片 tissue 的表示？</h2>
      <p>
        六个 synthetic nodes，左三个初始 h=1，右三个 h=0。只演示 GCN
        propagation：W=I、identity activation，没有训练。中央 bridge 控制两个
        domains 之间的信息流。
      </p>
      <div className="bio-controls">
        <Range
          label="Boundary edge weight"
          value={bridge}
          min={0}
          max={1}
          step={0.1}
          set={(v) => {
            setBridge(v);
            seq.choose(0);
          }}
          hint="0 表示移除跨边界 edge；1 与组内 edge 同权。"
        />
        <Range
          label="Self-loop weight"
          value={loops}
          min={0}
          max={2}
          step={0.1}
          set={(v) => {
            setLoops(v);
            seq.choose(0);
          }}
          hint="标准加 I 对应 1；0 可产生交替振荡。"
        />
      </div>
      <p className="bio-equation">
        Â=A+sI；Dᵢᵢ=ΣⱼÂᵢⱼ；S=D⁻¹ᐟ²ÂD⁻¹ᐟ²；h(l+1)=S h(l)
      </p>
      {seq.controls}
      <div className="bio-figure-pair">
        <Plot
          label={`GCN graph at layer ${seq.step}; values ${h.map((x) => f(x)).join(", ")}`}
          height={270}
        >
          <text x={20} y={28} className="bio-svg-title">
            Node features · Layer {seq.step}
          </text>
          <line
            x1={330}
            y1={55}
            x2={330}
            y2={225}
            stroke={orange}
            strokeDasharray="5 5"
          />
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1={65 + i * 105}
              y1={130}
              x2={170 + i * 105}
              y2={130}
              stroke={i === 2 ? orange : blue}
              strokeWidth={i === 2 ? bridge * 7 : 3}
              opacity={i === 2 && bridge === 0 ? 0 : 1}
            />
          ))}
          {h.map((v, i) => (
            <g key={i}>
              <circle
                cx={65 + i * 105}
                cy={130}
                r={30}
                fill="#fff"
                stroke={blue}
                strokeWidth={2}
              />
              <circle
                cx={65 + i * 105}
                cy={130}
                r={26}
                fill={blue}
                opacity={Math.min(0.75, v * 0.6)}
              />
              <text x={65 + i * 105} y={81} textAnchor="middle">
                Node {i}
              </text>
              <text x={65 + i * 105} y={135} textAnchor="middle">
                {f(v, 2)}
              </text>
              <text x={65 + i * 105} y={191} textAnchor="middle">
                d={f(r.degrees[i], 1)}
              </text>
            </g>
          ))}
          <text x={20} y={244}>
            Blue: feature h · dashed orange: biological boundary assumption
          </text>
        </Plot>
        <Curve
          label="Mean feature gap：left − right"
          values={r.gaps}
          step={seq.step}
        />
      </div>
      <Readout
        values={[
          ["Layer", `${seq.step}`],
          ["Boundary message coefficient S₂₃", f(r.normalized[2][3])],
          ["Node 2 row sum", f(r.normalized[2].reduce((a, b) => a + b, 0))],
          ["Mean feature gap", f(r.gaps[seq.step])],
        ]}
      />
      <details className="bio-notes">
        <summary>逐边检查 Node 2：degree normalization 与 message</summary>
        {r.normalized[2].map(
          (w, j) =>
            w > 0 && (
              <p key={j}>
                j={j}：S₂ⱼ = {f(r.adjacency[2][j])} / √({f(r.degrees[2])} ×{" "}
                {f(r.degrees[j])}) = {f(w)}；下一层 contribution = {f(w)} ×{" "}
                {f(h[j])} = {f(w * h[j])}
              </p>
            ),
        )}
        <p>
          下一层 Node 2 ={" "}
          {f(r.normalized[2].reduce((a, w, j) => a + w * h[j], 0))}。Symmetric
          normalization 的 row sum 不一定是 1，输出不是概率，也不一定落在原
          feature 范围。
        </p>
      </details>
      <Question
        prompt="增大 depth 后边界变模糊，最先排查什么？"
        options={[
          "Graph 是否跨了错误的 tissue boundary，以及 aggregation 深度",
          "只把 hidden dimension 加倍",
        ]}
        answer={0}
        explanation="消息传播沿 graph 的 edges 发生。错误连接可反复扩散；只增大参数量不会自动修正 graph 语义。"
      />
      <Notes
        lessons={[
          ["bio-graph-construction", "Graph construction"],
          ["bio-gcn-propagation", "GCN details"],
          ["bio-graphsage-sampling", "GraphSAGE sampling"],
        ]}
        sources={[["https://arxiv.org/abs/1609.02907", "GCN"]]}
      >
        <p>
          真实模型先比较 no-graph MLP、1–2 layers、radius/kNN 与 edge
          ablation；检查坐标单位、section IDs、barriers、稀有 cell states 和
          graph degree。3D 注册未验证时不要跨 section 建边。
        </p>
        <p>
          Symmetric GCN 的深层极限与 degree 有关，不是所有 node
          必然变成同一数值；无 self-loop 的 bipartite graph
          还可能振荡。此图只隔离 propagation，不能推断实际训练模型的
          accuracy。按 donor/section 切分，避免跨 split 的训练消息与
          preprocessing leakage。
        </p>
      </Notes>
    </>
  );
}
function GATExperiment() {
  const [temperature, setTemperature] = useState(1),
    [neighbors, setNeighbors] = useState(1);
  const r = gatExperiment(temperature, neighbors);
  return (
    <>
      <h2>Attention 很高，是因为重要，还是因为邻居集合变了？</h2>
      <p>
        固定一层 GAT 已经算出的 edge
        logits：Self=1，Same-domain=2，Boundary=2.5；对应 scalar
        values=.9、.8、.1。只推演 softmax 与 weighted aggregation，增加同样的
        boundary neighbor，观察 normalization 怎样改变。
      </p>
      <div className="bio-controls">
        <Range
          label="Attention temperature τ"
          value={temperature}
          min={0.2}
          max={2}
          step={0.1}
          set={setTemperature}
          hint="原始 GAT 对应 τ=1；其他值是此教学实验的扩展。"
        />
        <Range
          label="Boundary neighbors"
          value={neighbors}
          min={0}
          max={4}
          set={setNeighbors}
          hint="每个新增 node 的 logit=2.5，value=.1。"
        />
        <button
          onClick={() => {
            setTemperature(1);
            setNeighbors(1);
          }}
        >
          恢复参数
        </button>
      </div>
      <p className="bio-equation">
        αᵢⱼ = softmaxⱼ(eᵢⱼ/τ)；messageᵢⱼ=αᵢⱼvⱼ；outputᵢ=Σⱼmessageᵢⱼ
      </p>
      <div className="bio-figure-pair">
        <Bars
          label="Attention α：同一 neighbor set 内归一化"
          labels={r.labels}
          values={r.weights}
        />
        <Bars
          label="Message α × value：实际加进 output 的量"
          labels={r.labels}
          values={r.messages}
        />
      </div>
      <Readout
        values={[
          ["GAT stage output", f(r.output)],
          ["Uniform mean", f(r.uniform)],
          ["Boundary total attention", f(r.boundaryMass)],
          ["Attention entropy", f(r.entropy)],
        ]}
      />
      <p className="bio-interpretation">
        Self 的 logit 没变，但它的 attention 是 {f(r.weights[0])}；neighbor set
        改变了分母。高 attention 乘上很小的 value，也可能只产生很小的
        message。此处给定的高 boundary logits 是一个可控失败案例。
      </p>
      <Question
        prompt="高 attention 能直接证明 cell-cell signaling 吗？"
        options={[
          "能，attention 已经给出因果解释",
          "不能；它依赖 graph、logits、values 和 normalization",
        ]}
        answer={1}
        explanation="需要 edge ablation、跨 donor 稳定性与独立 biological evidence；attention 本身不是实验验证。"
      />
      <Notes
        lessons={[
          ["bio-gat-attention", "GAT attention"],
          ["bio-graph-construction", "Spatial graph"],
        ]}
        sources={[["https://arxiv.org/abs/1710.10903", "GAT"]]}
      >
        <p>
          完整 GAT 会先用 W projection，再用 additive attention 与 LeakyReLU
          产生 logits；此实验固定这些输出，没有训练 W/a、multi-head、dropout 或
          nonlinear activation。温度不是每个 GAT library 都提供的参数。
        </p>
        <p>
          起步比较 GCN 与 GAT，保持相同 graph/split；记录每 head 的
          entropy、boundary mass 和 edge-removal sensitivity。增加 heads
          同时改变容量与 concat 后维度，不能只按 attention 图是否好看决定设置。
        </p>
      </Notes>
    </>
  );
}
function ContrastiveExperiment() {
  const [temperature, setTemperature] = useState(0.2),
    [included, setIncluded] = useState("yes");
  const r = contrastiveExperiment(temperature, included === "yes"),
    labels = [
      "Positive",
      "Negative 1",
      "Negative 2",
      ...(included === "yes" ? ["False negative"] : []),
    ];
  return (
    <>
      <h2>同一 biological state，被当作 Negative 会发生什么？</h2>
      <p>
        固定 cosine similarities：positive=.8，两个 negatives=.1/.2；另一个
        same-state cell=.9。假设当前任务希望保留这个 state 的相似性，它被当成
        negative 就构成 false negative。不同任务下，same cell type
        也可能需要区分细微状态。
      </p>
      <div className="bio-controls">
        <Range
          label="InfoNCE temperature τ"
          value={temperature}
          min={0.05}
          max={1}
          step={0.05}
          set={setTemperature}
          hint="温度同时影响 softmax concentration 和 similarity gradient 的 1/τ scale。"
        />
        <Choice
          label="Negative set"
          value={included}
          set={setIncluded}
          options={[
            ["yes", "包含 same-state false negative"],
            ["no", "移除这个 false negative"],
          ]}
        />
        <button
          onClick={() => {
            setTemperature(0.2);
            setIncluded("yes");
          }}
        >
          恢复参数
        </button>
      </div>
      <p className="bio-equation">
        L = −log p(positive)；pⱼ=softmax(sⱼ/τ)；∂L/∂sⱼ = [pⱼ−1(j=positive)]/τ
      </p>
      <div className="bio-figure-pair">
        <Bars
          label="Softmax probability：positive 争夺的归一化质量"
          labels={labels}
          values={r.probabilities}
        />
        <Bars
          label="Gradient ∂L/∂similarity：下降时反方向移动"
          labels={labels}
          values={r.gradients}
          signed
        />
      </div>
      <Readout
        values={[
          ["InfoNCE loss", f(r.loss)],
          ["Positive probability", f(r.probabilities[0])],
          ["Positive gradient", f(r.gradients[0])],
          [
            "False-negative gradient",
            included === "yes" ? f(r.gradients[3]) : "excluded",
          ],
        ]}
      />
      <p className="bio-interpretation">
        Positive gradient 为负，gradient descent 会提高它的 similarity；false
        negative 若存在，gradient 为正，会被推远。移除 candidate
        改变了训练目标与难度，因此更小的 loss 不能单独证明 representation 更好。
      </p>
      <Question
        prompt="把所有相邻 Spatial cells 都当 positives 的风险？"
        options={[
          "组织边界两侧不同 cell states 可能被错误拉近",
          "所有近邻一定共享 cell identity",
        ]}
        answer={0}
        explanation="Positive 定义就是 invariance 假设。应通过 matched modalities、可信 augmentations、boundary-aware sampling 和 held-out evaluation 检查它。"
      />
      <Notes
        lessons={[
          ["bio-contrastive-design", "Biological Contrastive design"],
          ["bio-count-vae", "Count VAE diagnostics"],
        ]}
        sources={[
          ["https://arxiv.org/abs/1807.03748", "InfoNCE / CPC"],
          [
            "https://arxiv.org/abs/2004.11362",
            "Supervised Contrastive Learning",
          ],
        ]}
      >
        <p>
          定义清楚 anchor/positive/negative 的生物单位，避免 donor ID 或 batch
          shortcut；同一 cell 的 modalities 常用于 matched positives，但每个
          modality 的特有信息不应全被抹去。不要用 test labels 帮训练筛
          negatives。
        </p>
        <p>
          从可解释的 augmentations、normalized embeddings 和若干 τ 候选起步，按
          donor 留出，评估 rare-state preservation、retrieval、batch mixing 与
          biological conservation。单纯增加 batch/negative 数会改变
          false-negative 风险。此处梯度是对 similarity 的偏导，不是完整 encoder
          parameter gradient。
        </p>
      </Notes>
    </>
  );
}
const components = {
  em: EMExperiment,
  planning: PlanningExperiment,
  gae: GAEExperiment,
  gcn: GCNExperiment,
  gat: GATExperiment,
  contrastive: ContrastiveExperiment,
};
export default function BioAlgorithmLab({ query }: { query: string }) {
  const raw = new URLSearchParams(query).get("lab") || "em";
  const kind: BioLabKind = Object.hasOwn(names, raw)
    ? (raw as BioLabKind)
    : "em";
  const Component = components[kind];
  return (
    <main className="bio-lab page-gutter">
      <header>
        <p className="eyebrow">SINGLE-CELL × SPATIAL · ALGORITHM LAB</p>
        <h1>把算法接到 biological question</h1>
        <p>
          从中间数值理解假设、参数和失败模式。6 个可计算实验均为 synthetic
          examples，结果由当前参数实时计算。
        </p>
        <a href="#/practice?research=spatial">← Spatial research workbench</a> ·{" "}
        <a href="https://haoyunli.github.io/intro-to-bio-for-computational-biology/">
          Bio/CS Atlas ↗
        </a>
      </header>
      <nav
        className="bio-lab-tabs"
        aria-label="Biological algorithm experiments"
      >
        {Object.entries(names).map(([id, name]) => (
          <a
            key={id}
            href={`#/bio-algorithms?lab=${id}`}
            aria-current={kind === id ? "page" : undefined}
          >
            {name}
          </a>
        ))}
      </nav>
      <section key={kind} className="bio-experiment">
        <Component />
      </section>
      <footer className="bio-lab-footer">
        <h2>从假设，到可检验的结果</h2>
        <p>
          EM：latent source → likelihood；RL：sequential decision →
          return；GNN：graph → message；Contrastive：pair definition →
          representation。算法名字不能替代 biological
          unit、reference、independent split 与外部验证。
        </p>
        <a href="#/lesson/bio-count-vae">
          继续：Count VAE 的 likelihood 与 ELBO →
        </a>{" "}
        ·{" "}
        <a href="#/lesson/spatial-policy-ope">
          继续：Offline policy evaluation 的证据条件 →
        </a>
      </footer>
    </main>
  );
}
