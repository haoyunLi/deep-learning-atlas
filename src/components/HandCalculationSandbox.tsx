import { useEffect, useId, useState, type ReactNode } from "react";
import {
  attentionTokens,
  calculateAttention,
  calculateCohort,
  calculateEM,
  calculateKNN,
  calculatePPO,
  emSamples,
  knnSamples,
  type SplitMethod,
} from "./sandboxMath";
import "../sandbox.css";

const number = (value: number, digits = 3) =>
  Math.abs(value) < 0.5 * 10 ** -digits
    ? (0).toFixed(digits)
    : value.toFixed(digits);
const density = (value: number) =>
  value < 0.0001 ? value.toExponential(2) : number(value, 4);
const vector = (values: readonly number[]) =>
  `[${values.map((value) => number(value)).join(", ")}]`;

type SandboxStep = { title: string; english: string; explanation: ReactNode };
type FrameProps = {
  title: string;
  english: string;
  scope: string;
  steps: SandboxStep[];
  controls: ReactNode;
  source: { label: string; href: string };
  onReset: () => void;
  children: (step: number) => ReactNode;
};

function SandboxFrame({
  title,
  english,
  scope,
  steps,
  controls,
  source,
  onReset,
  children,
}: FrameProps) {
  const id = useId();
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => {
      setReducedMotion(preference.matches);
      if (preference.matches) setPlaying(false);
    };
    const pauseWhenHidden = () => {
      if (document.hidden) setPlaying(false);
    };
    syncPreference();
    preference.addEventListener("change", syncPreference);
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => {
      preference.removeEventListener("change", syncPreference);
      document.removeEventListener("visibilitychange", pauseWhenHidden);
    };
  }, []);

  useEffect(() => {
    if (!playing || reducedMotion || document.hidden) return;
    const timer = window.setTimeout(() => {
      const next = step + 1;
      setStep(Math.min(next, steps.length - 1));
      if (next >= steps.length - 1) setPlaying(false);
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [playing, reducedMotion, step, steps.length]);

  const selectStep = (next: number) => {
    setPlaying(false);
    setStep(next);
  };
  return (
    <section
      id="sandbox"
      className="sandbox"
      aria-labelledby={`${id}-heading`}
      data-playing={playing}
    >
      <header className="sandbox-heading">
        <div>
          <span className="sandbox-kicker">
            CALCULATE · CHANGE · UNDERSTAND
          </span>
          <h2 id={`${id}-heading`}>
            手算沙盒 <span>Hand calculation sandbox</span>
          </h2>
          <h3>
            {title} <span lang="en">{english}</span>
          </h3>
        </div>
        <span
          className="sandbox-counter"
          aria-label={`步骤 ${step + 1}，共 ${steps.length} 步`}
        >
          {String(step + 1).padStart(2, "0")}
          <small> / {String(steps.length).padStart(2, "0")}</small>
        </span>
      </header>
      <p className="sandbox-scope">
        教学玩具示例 · Toy example. {scope}{" "}
        计算使用完整精度，显示值经过四舍五入。
      </p>
      <div
        className="sandbox-parameters"
        onChangeCapture={() => setPlaying(false)}
      >
        {controls}
      </div>
      <nav className="sandbox-step-nav" aria-label={`${title}手算步骤`}>
        {steps.map((item, index) => (
          <button
            key={item.title}
            type="button"
            aria-current={index === step ? "step" : undefined}
            onClick={() => selectStep(index)}
          >
            <span>
              {index + 1}. {item.title}
            </span>
            <small lang="en">{item.english}</small>
          </button>
        ))}
      </nav>
      <div className="sandbox-stage" id={`${id}-stage`}>
        <div
          className="sandbox-explanation"
          aria-live={playing ? "off" : "polite"}
          aria-atomic="true"
        >
          <strong>{steps[step].title}</strong>
          <p>{steps[step].explanation}</p>
        </div>
        {children(step)}
      </div>
      <div className="sandbox-footer">
        <div className="sandbox-playback" aria-label="手算播放控制">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => selectStep(step - 1)}
            aria-label="手算上一步"
          >
            ← 上一步
          </button>
          <button
            className="sandbox-play"
            type="button"
            disabled={reducedMotion}
            aria-pressed={playing}
            onClick={() => {
              if (!playing && step === steps.length - 1) setStep(0);
              setPlaying(!playing);
            }}
            aria-label={playing ? "暂停手算播放" : "播放手算步骤"}
          >
            {playing ? "Ⅱ 暂停" : "▶ 播放"}
          </button>
          <button
            type="button"
            disabled={step === steps.length - 1}
            onClick={() => selectStep(step + 1)}
            aria-label="手算下一步"
          >
            下一步 →
          </button>
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setStep(0);
              onReset();
            }}
          >
            重置参数
          </button>
        </div>
        <p>
          {reducedMotion
            ? "已遵循系统减少动态效果设置，请手动选步。"
            : "每步 4.5 秒；切换到后台会暂停。"}{" "}
          <a href={source.href} target="_blank" rel="noreferrer">
            {source.label} ↗
          </a>
        </p>
      </div>
    </section>
  );
}

function Range({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  hint,
  digits = 1,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  hint: string;
  digits?: number;
}) {
  const id = useId();
  return (
    <div className="sandbox-range">
      <div>
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>{number(value, digits)}</output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-describedby={`${id}-hint`}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <small id={`${id}-hint`}>{hint}</small>
    </div>
  );
}

function DataTable({
  caption,
  headings,
  rows,
}: {
  caption: string;
  headings: string[];
  rows: ReactNode[][];
}) {
  return (
    <div
      className="sandbox-table-scroll"
      tabIndex={0}
      role="region"
      aria-label={caption}
    >
      <table className="sandbox-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            {headings.map((heading) => (
              <th scope="col" key={heading}>
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, col) =>
                col === 0 ? (
                  <th scope="row" key={col}>
                    {cell}
                  </th>
                ) : (
                  <td key={col}>{cell}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Result({ children }: { children: ReactNode }) {
  return <div className="sandbox-result">{children}</div>;
}

function KNNSandbox() {
  const [x, setX] = useState(2.8);
  const [y, setY] = useState(2.5);
  const [k, setK] = useState(3);
  const result = calculateKNN(x, y, k);
  const selected = new Set(result.selected.map((p) => p.id));
  const sx = (value: number) => 44 + value * 42;
  const sy = (value: number) => 292 - value * 42;
  const closest = result.ranked[0];
  const steps: SandboxStep[] = [
    {
      title: "摆放查询点",
      english: "Query & data",
      explanation: `七个带标签的点固定不动。查询 q = (${number(x, 1)}, ${number(y, 1)})；移动 q 会改变它到每个训练点的欧氏距离。横纵坐标使用相同的数值单位和显示比例，图上的距离与计算一致。`,
    },
    {
      title: "计算距离并排序",
      english: "Distances & ranking",
      explanation: `d(q, xᵢ) = √[(xᵢ₁ − q₁)² + (xᵢ₂ − q₂)²]。当前最近的是 ${closest.id}：√(${number(closest.dx2)} + ${number(closest.dy2)}) = ${number(closest.distance)}。距离相同按 ID 排序。`,
    },
    {
      title: "截取最近 k 个",
      english: "Choose neighbors",
      explanation: `按距离升序取前 k = ${k} 个：${result.selected.map((p) => p.id).join("、")}。改变 k 只改变截取位置；改变查询坐标则会改变距离和排名。`,
    },
    {
      title: "多数投票",
      english: "Majority vote",
      explanation: `A 类 ${result.votes.A} 票，B 类 ${result.votes.B} 票，所以预测 ${result.winner}。当更多另一类的点进入近邻集合，投票结果可能翻转。这里只使用奇数 k，避免二分类票数相同。`,
    },
  ];
  return (
    <SandboxFrame
      title="kNN：从距离到投票"
      english="From distance to votes"
      scope="二维、两类、无距离加权。坐标量纲一致，实际数据通常需要在训练集上拟合标准化。"
      steps={steps}
      onReset={() => {
        setX(2.8);
        setY(2.5);
        setK(3);
      }}
      source={{
        label: "scikit-learn · kNN",
        href: "https://scikit-learn.org/stable/modules/neighbors.html",
      }}
      controls={
        <>
          <Range
            label="查询横坐标 q₁"
            value={x}
            min={0}
            max={6}
            step={0.1}
            onChange={setX}
            hint="向左靠近 A 类，向右靠近 B 类。"
          />
          <Range
            label="查询纵坐标 q₂"
            value={y}
            min={0}
            max={6}
            step={0.1}
            onChange={setY}
            hint="改变哪几个点成为近邻。"
          />
          <Range
            label="邻居数量 k"
            value={k}
            min={1}
            max={7}
            step={2}
            onChange={setK}
            digits={0}
            hint="1、3、5、7：局部决策与更大邻域。"
          />
        </>
      }
    >
      {(step) => (
        <>
          <svg
            className="sandbox-plot"
            viewBox="0 0 360 335"
            role="img"
            aria-label={`查询点位于 ${x}, ${y}；最近 ${k} 个点为 ${result.selected.map((p) => p.id).join("、")}`}
          >
            <title>二维近邻图：圆形 A 类，方形 B 类，菱形查询点</title>
            {[0, 1, 2, 3, 4, 5, 6].map((tick) => (
              <g key={tick}>
                <line
                  x1={sx(tick)}
                  y1={sy(6)}
                  x2={sx(tick)}
                  y2={sy(0)}
                  className="sandbox-grid-line"
                />
                <line
                  x1={sx(0)}
                  y1={sy(tick)}
                  x2={sx(6)}
                  y2={sy(tick)}
                  className="sandbox-grid-line"
                />
                <text x={sx(tick)} y="312" textAnchor="middle">
                  {tick}
                </text>
                <text x="26" y={sy(tick) + 4} textAnchor="middle">
                  {tick}
                </text>
              </g>
            ))}
            {step >= 2 &&
              result.selected.map((p) => (
                <line
                  key={p.id}
                  x1={sx(x)}
                  y1={sy(y)}
                  x2={sx(p.x)}
                  y2={sy(p.y)}
                  className="sandbox-neighbor-line"
                />
              ))}
            {knnSamples.map((p) => (
              <g
                key={p.id}
                opacity={step >= 2 && !selected.has(p.id) ? 0.38 : 1}
              >
                {p.label === "A" ? (
                  <circle cx={sx(p.x)} cy={sy(p.y)} r="6" fill="#254b69" />
                ) : (
                  <rect
                    x={sx(p.x) - 6}
                    y={sy(p.y) - 6}
                    width="12"
                    height="12"
                    fill="#b34830"
                  />
                )}
                <text x={sx(p.x) + 9} y={sy(p.y) - 7}>
                  {p.id}
                </text>
              </g>
            ))}
            <path
              d={`M ${sx(x)} ${sy(y) - 8} l 8 8 -8 8 -8 -8 Z`}
              fill="#fff8e8"
              stroke="#152f44"
              strokeWidth="2"
            />
            <text x={sx(x) + 10} y={sy(y) + 17} fontWeight="700">
              q
            </text>
            <text x="44" y="18">
              ● A 类　■ B 类　◇ 查询 q
            </text>
            <text x="323" y="297">
              q₁
            </text>
            <text x="15" y="27">
              q₂
            </text>
          </svg>
          {step === 0 && (
            <DataTable
              caption="训练点 / Training points"
              headings={["点", "类别", "x₁", "x₂"]}
              rows={knnSamples.map((p) => [p.id, p.label, p.x, p.y])}
            />
          )}
          {step === 1 && (
            <DataTable
              caption="完整距离计算（升序）/ Sorted distances"
              headings={["排名 · 点", "(x₁−q₁)²", "(x₂−q₂)²", "距离 d"]}
              rows={result.ranked.map((p, index) => [
                `${index + 1} · ${p.id}`,
                number(p.dx2),
                number(p.dy2),
                number(p.distance),
              ])}
            />
          )}
          {step === 2 && (
            <DataTable
              caption="进入投票的近邻 / Selected neighbors"
              headings={["排名 · 点", "类别", "距离", "是否入选"]}
              rows={result.ranked.map((p, index) => [
                `${index + 1} · ${p.id}`,
                p.label,
                number(p.distance),
                index < k ? "✓ 计入" : "— 不计入",
              ])}
            />
          )}
          {step === 3 && (
            <>
              <DataTable
                caption="逐类票数 / Class votes"
                headings={["类别", "票数", "票数 / k"]}
                rows={["A", "B"].map((label) => [
                  label,
                  result.votes[label as "A" | "B"],
                  number(result.votes[label as "A" | "B"] / k),
                ])}
              />
              <Result>
                预测类别 <strong>{result.winner}</strong> · 邻居投票占比{" "}
                {number(Math.max(result.votes.A, result.votes.B) / k)}
                。该比例不是经过校准的概率。
              </Result>
            </>
          )}
        </>
      )}
    </SandboxFrame>
  );
}

function EMSandbox() {
  const [mean1, setMean1] = useState(-1);
  const [mean2, setMean2] = useState(2);
  const [sigma, setSigma] = useState(1.2);
  const [iteration, setIteration] = useState(0);
  const result = calculateEM([mean1, mean2], sigma, iteration);
  const update = (set: (n: number) => void) => (value: number) => {
    set(value);
    setIteration(0);
  };
  const steps: SandboxStep[] = [
    {
      title: "设置混合分布",
      english: "Current mixture",
      explanation: `数据 x = [${emSamples.join(", ")}]。已完成 ${iteration} 次更新，此轮均值 μ = ${vector(result.means)}，共同标准差 σ = ${number(sigma, 1)}。每个分量的权重固定为 0.5。`,
    },
    {
      title: "E 步：软分配",
      english: "Responsibilities",
      explanation:
        "先计算 N(xᵢ | μ₁, σ²) 和 N(xᵢ | μ₂, σ²)，再用 rᵢ₁ = 0.5 N₁ / (0.5 N₁ + 0.5 N₂) 归一化。每行 rᵢ₁ + rᵢ₂ = 1；σ 变大通常会让软分配更模糊。",
    },
    {
      title: "M 步：加权平均",
      english: "Weighted sums",
      explanation: `固定本轮责任度后，μⱼ′ = Σᵢrᵢⱼxᵢ / Σᵢrᵢⱼ。分量 1 的“有效样本数”为 ${number(result.mass[0])}，加权和为 ${number(result.sums[0])}；责任越大的点越能拉动该分量的均值。`,
    },
    {
      title: "检查似然与迭代",
      english: "Likelihood & iteration",
      explanation: `更新后均值为 ${vector(result.nextMeans)}。ℓ = Σᵢ log[0.5 N₁(xᵢ) + 0.5 N₂(xᵢ)] 从 ${number(result.beforeLL, 4)} 变为 ${number(result.afterLL, 4)}，增加 ${number(result.afterLL - result.beforeLL, 4)}。调整迭代次数可把新均值送回下一轮 E 步。`,
    },
  ];
  return (
    <SandboxFrame
      title="EM：一次 E 步与 M 步"
      english="A complete EM iteration"
      scope="一维、两个高斯分量，仅学习均值；σ 和混合权重固定，因此这里不是完整的协方差学习。"
      steps={steps}
      onReset={() => {
        setMean1(-1);
        setMean2(2);
        setSigma(1.2);
        setIteration(0);
      }}
      source={{
        label: "Princeton · EM notes",
        href: "https://www.cs.princeton.edu/courses/archive/spring12/cos424/pdf/em-mixtures.pdf",
      }}
      controls={
        <>
          <Range
            label="初始均值 μ₁⁽⁰⁾"
            value={mean1}
            min={-4}
            max={1}
            step={0.25}
            digits={2}
            onChange={update(setMean1)}
            hint="更改初值会回到第 0 轮。"
          />
          <Range
            label="初始均值 μ₂⁽⁰⁾"
            value={mean2}
            min={1}
            max={6}
            step={0.25}
            digits={2}
            onChange={update(setMean2)}
            hint="相同初值可能无法打破对称性。"
          />
          <Range
            label="固定标准差 σ"
            value={sigma}
            min={0.5}
            max={2.5}
            step={0.1}
            onChange={update(setSigma)}
            hint="σ² 是方差；这里整个迭代期间固定。"
          />
          <Range
            label="已完成更新次数 t"
            value={iteration}
            min={0}
            max={8}
            onChange={setIteration}
            digits={0}
            hint="显示第 t → t+1 轮的完整中间数。"
          />
        </>
      }
    >
      {(step) => (
        <>
          {step === 0 && (
            <>
              <DataTable
                caption="本轮参数 / Parameters at iteration t"
                headings={["分量", "π", "μ⁽ᵗ⁾", "σ²"]}
                rows={result.means.map((mean, i) => [
                  `${i + 1}`,
                  "0.500",
                  number(mean),
                  number(sigma ** 2),
                ])}
              />
              <Result>
                观测点：
                {emSamples.map((x) => (
                  <span className="sandbox-number-chip" key={x}>
                    {x}
                  </span>
                ))}
                <p>
                  初始均值控制第一轮“谁负责解释哪个点”，后续均值由真实加权平均计算。
                </p>
              </Result>
            </>
          )}
          {step === 1 && (
            <DataTable
              caption="密度不是概率；责任度才在每行归一 / Density & responsibility"
              headings={["xᵢ", "N₁(xᵢ)", "N₂(xᵢ)", "rᵢ₁", "rᵢ₂"]}
              rows={result.rows.map((r) => [
                r.x,
                density(r.density1),
                density(r.density2),
                number(r.r1, 4),
                number(r.r2, 4),
              ])}
            />
          )}
          {step === 2 && (
            <>
              <DataTable
                caption="保留小数权重的累加 / Weighted accumulation"
                headings={["xᵢ", "rᵢ₁", "rᵢ₁xᵢ", "rᵢ₂", "rᵢ₂xᵢ"]}
                rows={[
                  ...result.rows.map((r) => [
                    r.x,
                    number(r.r1),
                    number(r.weighted1),
                    number(r.r2),
                    number(r.weighted2),
                  ]),
                  [
                    "合计 Σ",
                    number(result.mass[0]),
                    number(result.sums[0]),
                    number(result.mass[1]),
                    number(result.sums[1]),
                  ],
                ]}
              />
              <Result>
                μ₁′ = {number(result.sums[0])} / {number(result.mass[0])} ={" "}
                <strong>{number(result.nextMeans[0])}</strong>
                <br />
                μ₂′ = {number(result.sums[1])} / {number(result.mass[1])} ={" "}
                <strong>{number(result.nextMeans[1])}</strong>
              </Result>
            </>
          )}
          {step === 3 && (
            <>
              <DataTable
                caption="固定方差时的均值更新 / Mean update"
                headings={["参数", "更新前", "更新后"]}
                rows={[
                  [
                    "μ₁",
                    number(result.means[0], 4),
                    number(result.nextMeans[0], 4),
                  ],
                  [
                    "μ₂",
                    number(result.means[1], 4),
                    number(result.nextMeans[1], 4),
                  ],
                  [
                    "总对数似然 ℓ",
                    number(result.beforeLL, 4),
                    number(result.afterLL, 4),
                  ],
                ]}
              />
              <Result>
                Δℓ ={" "}
                <strong>{number(result.afterLL - result.beforeLL, 6)}</strong>
                。EM 的这一步不会降低似然，但不同初值可能收敛到不同解；改善接近
                0 可能表示收敛，也可能是对称初值停住。
              </Result>
              <button
                type="button"
                className="sandbox-action"
                disabled={iteration >= 8}
                onClick={() => setIteration(iteration + 1)}
              >
                应用本轮更新 → 第 {iteration + 1} 轮
              </button>
            </>
          )}
        </>
      )}
    </SandboxFrame>
  );
}

function AttentionSandbox() {
  const [q1, setQ1] = useState(1);
  const [q2, setQ2] = useState(0.5);
  const [temperature, setTemperature] = useState(1);
  const [scaled, setScaled] = useState(true);
  const [causal, setCausal] = useState(false);
  const result = calculateAttention(q1, q2, temperature, scaled, causal);
  const steps: SandboxStep[] = [
    {
      title: "准备 Q、K、V",
      english: "Query, keys, values",
      explanation: `单个查询 Q = ${vector([q1, q2])}，三个 token 的 K、V 固定为表中向量。Q 与 K 决定相关性；V 是最终要混合的信息。`,
    },
    {
      title: "点积、缩放与掩码",
      english: "Scores & mask",
      explanation: `sᵢ = (Q·Kᵢ) / ${scaled ? "√2" : "1"} / τ，当前 τ = ${number(temperature, 2)}。${causal ? "查询位于第 2 个位置，所以未来 token C 的分数设为 −∞。" : "当前允许访问全部三个 token。"} 缩放或温度改变分数之间的差距。`,
    },
    {
      title: "Softmax 归一化",
      english: "Normalized weights",
      explanation: `先减去未屏蔽分数的最大值 m = ${number(result.maxScore)}，再算 eᵢ = exp(sᵢ − m)，αᵢ = eᵢ / Σe。当前分母 Σe = ${number(result.denominator)}。减去同一最大值不改变权重，能防止指数溢出。`,
    },
    {
      title: "对 V 加权求和",
      english: "Weighted output",
      explanation: `输出 O = ΣᵢαᵢVᵢ = ${vector(result.output)}。降低温度会放大已有分数差距；提高温度会使可见 token 的权重更接近。${causal ? "被屏蔽的 C 权重严格为 0。" : "当前没有掩码，三个 token 都参与加权求和。"}`,
    },
  ];
  return (
    <SandboxFrame
      title="Attention：手算一行注意力"
      english="One attention row"
      scope="单头、dₖ = 2，Q/K/V 已给定，省略线性投影与训练。温度 τ 是本沙盒额外的教学控制，标准公式对应 τ = 1。"
      steps={steps}
      onReset={() => {
        setQ1(1);
        setQ2(0.5);
        setTemperature(1);
        setScaled(true);
        setCausal(false);
      }}
      source={{
        label: "Vaswani et al. · §3.2.1",
        href: "https://arxiv.org/abs/1706.03762",
      }}
      controls={
        <>
          <Range
            label="查询分量 q₁"
            value={q1}
            min={-2}
            max={2}
            step={0.1}
            onChange={setQ1}
            hint="改变与 K 的第一维匹配程度。"
          />
          <Range
            label="查询分量 q₂"
            value={q2}
            min={-2}
            max={2}
            step={0.1}
            onChange={setQ2}
            hint="改变与 K 的第二维匹配程度。"
          />
          <Range
            label="温度 τ"
            value={temperature}
            min={0.25}
            max={2}
            step={0.05}
            digits={2}
            onChange={setTemperature}
            hint="小温度更集中；大温度更均匀。"
          />
          <div className="sandbox-checks">
            <label>
              <input
                type="checkbox"
                checked={scaled}
                onChange={(event) => setScaled(event.target.checked)}
              />{" "}
              使用 1/√dₖ 缩放
            </label>
            <label>
              <input
                type="checkbox"
                checked={causal}
                onChange={(event) => setCausal(event.target.checked)}
              />{" "}
              因果掩码：屏蔽 C
            </label>
          </div>
        </>
      }
    >
      {(step) => (
        <>
          {step === 0 && (
            <DataTable
              caption={`Q = ${vector([q1, q2])}；下表每行为一个 token`}
              headings={["token", "Kᵢ", "Vᵢ"]}
              rows={attentionTokens.map((token) => [
                token.name,
                `[${token.key.join(", ")}]`,
                `[${token.value.join(", ")}]`,
              ])}
            />
          )}
          {step === 1 && (
            <DataTable
              caption="分数逐项计算 / Score calculation"
              headings={[
                "token",
                "Q·Kᵢ",
                scaled ? "除以 √dₖ" : "不缩放（除以 1）",
                "再除以 τ",
                "掩码后",
              ]}
              rows={result.rows.map((r) => [
                r.name,
                number(r.dot),
                number(r.dot / result.divisor),
                number(r.score),
                r.masked ? "−∞（屏蔽）" : number(r.score),
              ])}
            />
          )}
          {step === 2 && (
            <>
              <DataTable
                caption="稳定 Softmax / Stable softmax"
                headings={["token", "sᵢ − m", "exp(sᵢ − m)", "αᵢ"]}
                rows={result.rows.map((r) => [
                  r.name,
                  r.masked ? "−∞" : number(r.shifted),
                  number(r.exp, 4),
                  number(r.weight, 4),
                ])}
              />
              <Result>
                Σᵢαᵢ ={" "}
                <strong>
                  {number(
                    result.rows.reduce((sum, r) => sum + r.weight, 0),
                    4,
                  )}
                </strong>
                。注意力权重是信息混合系数，不能直接当作模型决策的因果解释。
              </Result>
            </>
          )}
          {step === 3 && (
            <>
              <DataTable
                caption="每个 token 对输出的贡献 / Contributions to output"
                headings={["token", "αᵢ", "αᵢVᵢ[1]", "αᵢVᵢ[2]"]}
                rows={[
                  ...result.rows.map((r) => [
                    r.name,
                    number(r.weight, 4),
                    number(r.contribution[0], 4),
                    number(r.contribution[1], 4),
                  ]),
                  [
                    "总和 O",
                    "1.0000",
                    number(result.output[0], 4),
                    number(result.output[1], 4),
                  ],
                ]}
              />
              <div className="sandbox-weight-bars" aria-label="注意力权重">
                {result.rows.map((r) => (
                  <div key={r.name}>
                    <span>{r.name}</span>
                    <div>
                      <span style={{ width: `${r.weight * 100}%` }} />
                    </div>
                    <output>{number(r.weight * 100, 1)}%</output>
                  </div>
                ))}
              </div>
              <Result>
                O = <strong>{vector(result.output)}</strong>。改变查询会改写每个
                token 的分数；温度与掩码再决定它能贡献多少。
              </Result>
            </>
          )}
        </>
      )}
    </SandboxFrame>
  );
}

function PPOSandbox() {
  const [ratio, setRatio] = useState(1.3);
  const [epsilon, setEpsilon] = useState(0.2);
  const [advantage, setAdvantage] = useState(2);
  const result = calculatePPO(ratio, epsilon, advantage);
  const px = (r: number) => 40 + ((r - 0.2) / 2) * 280;
  const py = (objective: number) => 113 - objective * 13;
  const curve = Array.from({ length: 101 }, (_, i) => {
    const r = 0.2 + i * 0.02;
    return `${i ? "L" : "M"} ${px(r)} ${py(calculatePPO(r, epsilon, advantage).objective)}`;
  }).join(" ");
  const slopeText =
    result.gradient === null ? "不可导（折点）" : number(result.gradient);
  const steps: SandboxStep[] = [
    {
      title: "概率比与优势",
      english: "Ratio & advantage",
      explanation: `旧策略概率固定 p_old = 0.4，新概率 p_new = ${number(result.newProbability)}，所以 r = p_new / p_old = ${number(ratio)}。A = ${number(advantage, 1)} 表示这个已采样动作相对基线的好坏。`,
    },
    {
      title: "形成两个分支",
      english: "Two branches",
      explanation: `裁剪区间为 [1−ε, 1+ε] = [${number(result.lower)}, ${number(result.upper)}]。原分支 rA = ${number(result.raw)}，裁剪分支 clip(r)A = ${number(result.clipped)}。必须先乘带符号的 A，再比较两者。`,
    },
    {
      title: "取较小目标",
      english: "Pessimistic minimum",
      explanation: `L = min(${number(result.raw)}, ${number(result.clipped)}) = ${number(result.objective)}。${advantage > 0 ? "A > 0 时，上方 r > 1+ε 的收益被截平；r < 1−ε 仍保留梯度。" : advantage < 0 ? "A < 0 时，下方 r < 1−ε 的收益被截平；r > 1+ε 仍保留负梯度。" : "A = 0 时，两条分支和梯度都为 0。"}`,
    },
    {
      title: "查看更新与平台",
      english: "Gradient & plateau",
      explanation: `此样本对比值 r 的导数 dL/dr = ${slopeText}。${result.kink ? "折点左右导数不同；下面明确选择 0 作为次梯度来演示更新。" : result.plateau ? "当前位于平台；继续沿有利方向改变该动作概率，不再提高此样本的裁剪目标。" : "当前目标仍随 r 变化；梯度的正负决定标量上升方向。"}`,
    },
  ];
  return (
    <SandboxFrame
      title="PPO：看清 min 与负优势"
      english="Clipping with signed advantage"
      scope="单条样本的 PPO-Clip 目标，最大化 L。最后一步直接对 r 做标量梯度上升；真实 PPO 对网络参数 θ 求导，还包含批量、价值与熵等项。"
      steps={steps}
      onReset={() => {
        setRatio(1.3);
        setEpsilon(0.2);
        setAdvantage(2);
      }}
      source={{
        label: "OpenAI Spinning Up · PPO",
        href: "https://spinningup.openai.com/en/latest/algorithms/ppo.html",
      }}
      controls={
        <>
          <Range
            label="策略概率比 r"
            value={ratio}
            min={0.2}
            max={2.2}
            step={0.05}
            digits={2}
            onChange={setRatio}
            hint="r = p_new / 0.4；大于 1 表示动作更常见。"
          />
          <Range
            label="裁剪宽度 ε"
            value={epsilon}
            min={0.05}
            max={0.4}
            step={0.05}
            digits={2}
            onChange={setEpsilon}
            hint="移动平台的边界，不直接截断参数。"
          />
          <Range
            label="带符号优势 A"
            value={advantage}
            min={-3}
            max={3}
            step={0.5}
            onChange={setAdvantage}
            hint="把优势切到负值，观察平台换到左侧。"
          />
        </>
      }
    >
      {(step) => (
        <>
          {step === 0 && (
            <DataTable
              caption="同一状态动作上的概率 / Action probabilities"
              headings={["量", "数值", "解释"]}
              rows={[
                ["p_old", "0.400", "采样时旧策略"],
                ["p_new", number(result.newProbability), "当前新策略"],
                [
                  "r",
                  `${number(result.newProbability)} / 0.400 = ${number(ratio)}`,
                  "概率比",
                ],
                [
                  "A",
                  number(advantage),
                  advantage > 0
                    ? "相对基线更好"
                    : advantage < 0
                      ? "相对基线更差"
                      : "与基线相同",
                ],
              ]}
            />
          )}
          {step === 1 && (
            <DataTable
              caption="分支计算 / Branch arithmetic"
              headings={["分支", "计算", "结果"]}
              rows={[
                [
                  "原分支",
                  `${number(ratio)} × (${number(advantage)})`,
                  number(result.raw),
                ],
                [
                  "clip(r)",
                  `clip(${number(ratio)}, ${number(result.lower)}, ${number(result.upper)})`,
                  number(result.clippedRatio),
                ],
                [
                  "裁剪分支",
                  `${number(result.clippedRatio)} × (${number(advantage)})`,
                  number(result.clipped),
                ],
              ]}
            />
          )}
          {step >= 2 && (
            <>
              <svg
                className="sandbox-plot"
                viewBox="0 0 360 235"
                role="img"
                aria-label={`PPO目标曲线，优势 ${advantage}，裁剪边界 ${number(result.lower)} 和 ${number(result.upper)}，当前目标 ${number(result.objective)}`}
              >
                <title>PPO 裁剪目标 L 关于概率比 r 的曲线</title>
                <line
                  x1="40"
                  y1="113"
                  x2="325"
                  y2="113"
                  className="sandbox-axis"
                />
                <line
                  x1="40"
                  y1="20"
                  x2="40"
                  y2="206"
                  className="sandbox-axis"
                />
                <rect
                  x={px(result.lower)}
                  y="20"
                  width={px(result.upper) - px(result.lower)}
                  height="186"
                  fill="#eee7d9"
                  opacity="0.7"
                />
                <line
                  x1={px(result.lower)}
                  y1="20"
                  x2={px(result.lower)}
                  y2="206"
                  className="sandbox-dashed"
                />
                <line
                  x1={px(result.upper)}
                  y1="20"
                  x2={px(result.upper)}
                  y2="206"
                  className="sandbox-dashed"
                />
                <path d={curve} fill="none" stroke="#254b69" strokeWidth="3" />
                <circle
                  cx={px(ratio)}
                  cy={py(result.objective)}
                  r="6"
                  fill="#b34830"
                />
                <text x="10" y="20">
                  L
                </text>
                <text x="337" y="119">
                  r
                </text>
                <text x="24" y="117">
                  0
                </text>
                <text x="40" y="222" textAnchor="middle">
                  0.2
                </text>
                <text x={px(1)} y="222" textAnchor="middle">
                  1
                </text>
                <text x="320" y="222" textAnchor="middle">
                  2.2
                </text>
                <text x="63" y="20">
                  阴影 = [1−ε, 1+ε]
                </text>
              </svg>
              <Result>
                L = min(rA, clip(r)A) ={" "}
                <strong>{number(result.objective)}</strong> ·{" "}
                {result.plateau
                  ? "当前：裁剪平台"
                  : result.kink
                    ? "当前：平台折点"
                    : "当前：可变分支"}
              </Result>
            </>
          )}
          {step === 3 && (
            <>
              <DataTable
                caption="一次标量梯度上升 / One scalar ascent step"
                headings={["量", "数值"]}
                rows={[
                  ["dL/dr", slopeText],
                  ["学习率 η", "0.050"],
                  [
                    "r′ = r + η · g",
                    `${number(ratio)} + 0.050 × (${number(result.gradient ?? 0)}) = ${number(result.nextRatio)}`,
                  ],
                  ["p_new′ = 0.4r′", number(0.4 * result.nextRatio)],
                ]}
              />
              <p className="sandbox-inline-note">
                此处展示的是目标函数的平台，不是对 r
                的硬性约束。真实网络共享参数，其他样本或其他损失仍可能改变该动作的概率。
              </p>
            </>
          )}
        </>
      )}
    </SandboxFrame>
  );
}

const splitNames: Record<string, string> = {
  train: "训练",
  test: "测试",
  excluded: "不入分析",
  "purged-group": "移除：同患者",
  "purged-time": "移除：标签跨界",
};
function CohortSandbox() {
  const [lookback, setLookback] = useState(30);
  const [horizon, setHorizon] = useState(30);
  const [featureEnd, setFeatureEnd] = useState(7);
  const [splitDay, setSplitDay] = useState(120);
  const [method, setMethod] = useState<SplitMethod>("row");
  const selectId = useId();
  const result = calculateCohort(
    lookback,
    horizon,
    featureEnd,
    splitDay,
    method,
  );
  const eligible = result.rows.filter((r) => r.eligible);
  const featureRows = eligible.flatMap((r) =>
    r.requested.map((f) => ({ record: r, feature: f })),
  );
  const steps: SandboxStep[] = [
    {
      title: "资格与索引日",
      english: "Eligibility & index",
      explanation: `纳入规则：年龄 ≥ 18 岁，索引日前可观察历史 ≥ ${lookback} 天。8 次就诊来自 7 位虚构患者；A1 与 A2 是同一患者。当前 ${eligible.length} 次就诊满足资格。每次预测以自己的索引日为相对第 0 天。`,
    },
    {
      title: "冻结可用特征",
      english: "Available features",
      explanation: `候选特征窗口为 [−${lookback}, ${featureEnd}] 天。还必须满足事件日 < 0 且可获知日 ≤ 0。当前候选中有 ${result.leakedCount} 个特征在预测时不可用；把窗口截止移到 −1 仍可能保留“过去发生、未来才回报”的泄漏。`,
    },
    {
      title: "定义结果窗口",
      english: "Outcome & censoring",
      explanation: `标签 Y = 1 表示 (0, ${horizon}] 天内观察到事件；Y = 0 要求至少完整观察 ${horizon} 天且无窗口内事件。随访不足且尚未出现事件时标为未知，不能强行写成 0。当前 ${result.usable.length} 次就诊可用于这个二分类示例。`,
    },
    {
      title: "检查组别与时间",
      english: "Group & time split",
      explanation: `计划在绝对第 ${splitDay} 天部署。当前方案：训练 ${result.train.length} 行，测试 ${result.test.length} 行；跨集合患者 ${result.overlappingPatients.length} 位，标签窗口未在部署前结束的训练行 ${result.futureTrain.length} 条，部署前的测试行 ${result.pastTest.length} 条。切换方案观察三种问题能否同时消失。`,
    },
  ];
  return (
    <SandboxFrame
      title="队列设计：先固定预测时点"
      english="Define the prediction moment"
      scope="完全合成的就诊、天数和测量值，演示新患者在未来时间的评估目标。二分类分析暂时移除结局未知行；实际研究需考虑删失、选择偏差与生存分析。"
      steps={steps}
      onReset={() => {
        setLookback(30);
        setHorizon(30);
        setFeatureEnd(7);
        setSplitDay(120);
        setMethod("row");
      }}
      source={{
        label: "scikit-learn · grouped/time splits",
        href: "https://scikit-learn.org/stable/modules/cross_validation.html",
      }}
      controls={
        <>
          <Range
            label="所需既往观察天数"
            value={lookback}
            min={15}
            max={90}
            step={15}
            digits={0}
            onChange={setLookback}
            hint="改变入组资格和特征回看窗口。"
          />
          <Range
            label="结果观察窗 H（天）"
            value={horizon}
            min={7}
            max={60}
            digits={0}
            onChange={setHorizon}
            hint="改变标签、随访要求和时间隔离。"
          />
          <Range
            label="候选特征截止（日）"
            value={featureEnd}
            min={-1}
            max={14}
            digits={0}
            onChange={setFeatureEnd}
            hint="相对索引日；正值会允许未来事件混入。"
          />
          <Range
            label="部署 / 切分日 T"
            value={splitDay}
            min={90}
            max={160}
            step={5}
            digits={0}
            onChange={setSplitDay}
            hint="绝对日期编号，所有记录共用此时间轴。"
          />
          <div className="sandbox-select">
            <label htmlFor={selectId}>评估切分方案 / Split strategy</label>
            <select
              id={selectId}
              value={method}
              onChange={(event) => setMethod(event.target.value as SplitMethod)}
            >
              <option value="row">逐行分配（有意错误）</option>
              <option value="group">仅按患者分组</option>
              <option value="time">仅按索引时间</option>
              <option value="group-time">患者分组 + 时间隔离</option>
            </select>
            <small>逐行方案是固定反例；各方法使用同一份记录。</small>
          </div>
        </>
      }
    >
      {(step) => (
        <>
          <svg
            className="sandbox-timeline"
            viewBox="0 0 560 125"
            role="img"
            aria-label={`特征回看 ${lookback} 天，在索引日 0 做预测，之后 ${horizon} 天观察结果`}
          >
            <title>相对索引日的特征窗口与结果窗口</title>
            <line x1="25" y1="61" x2="530" y2="61" className="sandbox-axis" />
            <rect x="35" y="43" width="217" height="35" rx="5" fill="#dce8e9" />
            <rect
              x="265"
              y="43"
              width="245"
              height="35"
              rx="5"
              fill="#f5dacd"
            />
            <line
              x1="260"
              y1="20"
              x2="260"
              y2="105"
              stroke="#152f44"
              strokeWidth="2"
            />
            <text x="143" y="65" textAnchor="middle">
              特征：预测时已获知
            </text>
            <text x="389" y="65" textAnchor="middle">
              结果：(0, {horizon}] 天
            </text>
            <text x="35" y="99">
              −{lookback} 天
            </text>
            <text x="260" y="116" textAnchor="middle">
              0 · 索引日
            </text>
            <text x="510" y="99" textAnchor="end">
              +{horizon} 天
            </text>
            <text x="35" y="23">
              相对时间轴（示意，非等比例）
            </text>
          </svg>
          {step === 0 && (
            <DataTable
              caption="资格检查 / Eligibility audit"
              headings={["记录 · 患者", "年龄", "索引日", "既往天数", "资格"]}
              rows={result.rows.map((r) => [
                `${r.id} · ${r.patient}`,
                r.age,
                r.index,
                r.history,
                r.eligible ? "✓ 纳入" : r.age < 18 ? "未成年" : "历史不足",
              ])}
            />
          )}
          {step === 1 && (
            <>
              <DataTable
                caption="仅列合资格记录的候选测量；日期相对各自索引日"
                headings={["记录", "事件日", "可获知日", "测量值", "使用决定"]}
                rows={featureRows.map(({ record: r, feature: f }) => [
                  r.id,
                  f.day,
                  f.available,
                  f.value,
                  f.day >= 0
                    ? "× 未来事件"
                    : f.available > 0
                      ? "× 尚未回报"
                      : "✓ 预测时已知",
                ])}
              />
              <Result>
                候选特征中的泄漏数：<strong>{result.leakedCount}</strong>
                。安全输入只保留标记为“预测时已知”的测量，不使用结果窗口里的信息。
              </Result>
            </>
          )}
          {step === 2 && (
            <DataTable
              caption="完整随访或已知阳性才确定标签 / Outcome ascertainment"
              headings={["记录", "随访天数", "事件日", "H 天标签", "分析状态"]}
              rows={result.rows.map((r) => [
                r.id,
                r.followup,
                r.event === null ? "未观察到" : `+${r.event}`,
                r.label === null ? "未知" : r.label,
                !r.eligible
                  ? "资格不符"
                  : !r.observed
                    ? "暂不入二分类"
                    : "✓ 可分析",
              ])}
            />
          )}
          {step === 3 && (
            <>
              <DataTable
                caption="当前方案与参照方案 / Selected vs group-and-time split"
                headings={[
                  "记录",
                  "索引日",
                  "标签窗结束",
                  "当前方案",
                  "分组 + 时间隔离",
                ]}
                rows={result.rows.map((r) => [
                  r.id,
                  r.index,
                  r.index + horizon,
                  splitNames[r.split],
                  splitNames[r.safeSplit],
                ])}
              />
              <Result>
                跨集合患者：
                <strong>{result.overlappingPatients.join("、") || "无"}</strong>
                <br />
                训练信息跨越 T：
                <strong>
                  {result.futureTrain.map((r) => r.id).join("、") || "无"}
                </strong>
                <br />
                测试记录早于 T：
                <strong>
                  {result.pastTest.map((r) => r.id).join("、") || "无"}
                </strong>
              </Result>
              <p className="sandbox-inline-note">
                参照方案保留索引日 ≥ T
                的未来测试记录；同患者的早期记录移除。其余训练记录须满足“索引日
                + H &lt; T”，保证标签窗在部署前结束。仅按患者方案固定保留
                A、C、G
                为测试患者；仅按时间方案不会自动解决患者重叠。这里的规则服务于“未来新患者”的目标，其他部署目标应另行设计。
              </p>
            </>
          )}
        </>
      )}
    </SandboxFrame>
  );
}

export const handCalculationLessonIds: readonly string[] = [
  "knn",
  "expectation-maximization",
  "attention",
  "ppo",
  "cohort-design",
];

export function HandCalculationSandbox({ lessonId }: { lessonId: string }) {
  switch (lessonId) {
    case "knn":
      return <KNNSandbox />;
    case "expectation-maximization":
      return <EMSandbox />;
    case "attention":
      return <AttentionSandbox />;
    case "ppo":
      return <PPOSandbox />;
    case "cohort-design":
      return <CohortSandbox />;
    default:
      return null;
  }
}

export default HandCalculationSandbox;
