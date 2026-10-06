import { useEffect, useState } from "react";
import {
  defaultTrainingInputs,
  trainingNumber as f,
  trainingStep,
  type TrainingInputs,
} from "../../studio/backpropMath";
import { StudioShell } from "./StudioShell";
import TrainingDiagnostics from "./TrainingDiagnostics";

const labels = [
  "固定参数",
  "Forward",
  "Loss",
  "输出层梯度",
  "Chain rule",
  "同时 SGD",
  "重新 Forward",
];
const fields: {
  key: keyof TrainingInputs;
  label: string;
  min: number;
  max: number;
  step: number;
}[] = [
  { key: "x", label: "输入 x", min: -2, max: 2, step: 0.25 },
  { key: "w", label: "第一层权重 w", min: -3, max: 3, step: 0.25 },
  { key: "v", label: "输出层权重 v", min: -2, max: 2, step: 0.25 },
  { key: "target", label: "目标 y", min: -1.5, max: 1.5, step: 0.25 },
  { key: "eta", label: "Learning rate η", min: 0, max: 2, step: 0.05 },
];

export default function TrainingWalkthrough() {
  const [inputs, setInputs] = useState<TrainingInputs>(defaultTrainingInputs);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [prediction, setPrediction] = useState("");
  const [reduced, setReduced] = useState(false);
  const result = trainingStep(inputs);
  const { before: b, after: a } = result;
  const final = step === 6;
  const shown = final ? a : b;
  const reset = (next: TrainingInputs) => {
    setInputs(next);
    setStep(0);
    setPlaying(false);
    setPrediction("");
  };
  useEffect(() => {
    const pauseHidden = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener("visibilitychange", pauseHidden);
    return () => document.removeEventListener("visibilitychange", pauseHidden);
  }, []);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReduced(preference.matches);
      if (preference.matches) setPlaying(false);
    };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!playing || reduced || step >= 6) return;
    const timer = window.setTimeout(() => {
      if (document.hidden) {
        setPlaying(false);
        return;
      }
      setStep(step + 1);
      if (step === 5) setPlaying(false);
    }, 2400);
    return () => window.clearTimeout(timer);
  }, [playing, reduced, step]);
  const descriptions = [
    "这一轮只用一个合成样本。先固定 w、v；Forward 保存中间量，Backward 求导，optimizer 才改参数。",
    `先算 z=w×x=${f(b.z)}，再经过 tanh 得 h=${f(b.h)}；输出 ŷ=v×h=${f(b.prediction)}。这时还没有修改任何权重。`,
    `残差 r=ŷ−y=${f(b.residual)}，平方损失 L=½r²=${f(b.loss)}。Loss 衡量这个样本的预测误差，不是泛化能力。`,
    `从 loss 出发：∂L/∂ŷ=r=${f(result.outputGradient)}。输出层对 v 的局部导数是 h，所以 gᵥ=r×h=${f(result.vGradient)}。`,
    `继续反传：δh=r×v=${f(result.hiddenGradient)}；tanh 的局部导数 1−h²=${f(result.activationDerivative)}；δz=δh×(1−h²)=${f(result.affineGradient)}；g𝑤=δz×x=${f(result.wGradient)}。`,
    `先保留旧参数下算出的两个梯度，再同时更新 w′=${f(result.updated.w)}、v′=${f(result.updated.v)}。不能先更新 v 再重算 g𝑤，那会改变这一轮更新的含义。`,
    `用新参数重新计算：ŷ′=${f(a.prediction)}，L′=${f(a.loss)}。${a.loss < b.loss ? "这一步 loss 下降；试着增大学习率，看是否越过低损失区域。" : a.loss > b.loss ? "这一步 loss 上升：沿负梯度走太远仍可能越过低损失区域。" : "这一步 loss 不变；检查学习率为零、输入为零或梯度是否为零。"}`,
  ];
  const nodes = [
    { label: "x", formula: "固定输入", value: f(inputs.x), reveal: 0 },
    { label: "z", formula: "w × x", value: f(shown.z), reveal: 1 },
    { label: "h", formula: "tanh(z)", value: f(shown.h), reveal: 1 },
    { label: "ŷ", formula: "v × h", value: f(shown.prediction), reveal: 1 },
    { label: "L", formula: "½(ŷ − y)²", value: f(shown.loss), reveal: 2 },
  ];
  const derivatives = [
    { x: 200, label: "g𝑤 = δz × x", value: result.wGradient, reveal: 4 },
    {
      x: 376,
      label: "δz = δh × (1−h²)",
      value: result.affineGradient,
      reveal: 4,
    },
    { x: 552, label: "δh = δŷ × v", value: result.hiddenGradient, reveal: 4 },
    { x: 728, label: "δŷ = ŷ − y", value: result.outputGradient, reveal: 3 },
  ];
  const allowAdvance = Boolean(prediction);
  return (
    <StudioShell
      route="/studio/training"
      eyebrow="ONE TRAINING STEP · 一轮训练"
      title="误差怎样变成一次参数更新？"
      english="Forward → loss → backward → simultaneous SGD"
      intro="把一个 tanh 隐层和一个输出层拆成可观察的计算图。只改一个输入，再逐步或播放：看中间量、局部导数和一步更新如何接起来。"
    >
      <div className="training-layout">
        <aside className="training-inputs" aria-label="一轮训练参数">
          <h2>改一个量，再追踪</h2>
          {fields.map((field) => (
            <label key={field.key}>
              {field.label}
              <strong>{f(inputs[field.key])}</strong>
              <input
                type="range"
                min={field.min}
                max={field.max}
                step={field.step}
                value={inputs[field.key]}
                onChange={(e) =>
                  reset({ ...inputs, [field.key]: e.target.valueAsNumber })
                }
              />
            </label>
          ))}
          <p>改变参数会暂停并回到开始；每个结果来自页面内实际算术。</p>
          <div
            className="training-presets"
            role="group"
            aria-label="训练对照情境"
          >
            <button onClick={() => reset(defaultTrainingInputs)}>
              默认小步长
            </button>
            <button onClick={() => reset({ ...defaultTrainingInputs, eta: 2 })}>
              大步长 η=2
            </button>
            <button
              onClick={() =>
                reset({ ...defaultTrainingInputs, w: 3, target: 0 })
              }
            >
              tanh 饱和
            </button>
            <button
              onClick={() =>
                reset({ ...defaultTrainingInputs, x: 0, target: 0 })
              }
            >
              误差为零
            </button>
          </div>
        </aside>
        <section
          className="training-trace"
          aria-label="Forward 和 Backward 计算路径"
        >
          <label className="training-predict">
            先猜：更新后这个样本的 loss 会怎样？
            <select
              aria-label="先猜：更新后这个样本的 loss 会怎样？"
              disabled={step > 0}
              value={prediction}
              onChange={(e) => setPrediction(e.target.value)}
            >
              <option value="">选一个预判，再看过程</option>
              <option value="下降">下降</option>
              <option value="上升">上升</option>
              <option value="不变">不变</option>
              <option value="还不确定">还不确定，先跟着计算</option>
            </select>
          </label>
          <div className="training-controls">
            <button
              disabled={step === 0}
              onClick={() => {
                setPlaying(false);
                setStep(step - 1);
              }}
            >
              ← 上一步
            </button>
            <button
              disabled={!allowAdvance || reduced || final}
              aria-pressed={playing}
              onClick={() => setPlaying(!playing)}
            >
              {playing ? "暂停" : "播放过程"}
            </button>
            <button
              disabled={!allowAdvance || final}
              onClick={() => {
                setPlaying(false);
                setStep(step + 1);
              }}
            >
              下一步 →
            </button>
            <button
              onClick={() => {
                setPlaying(false);
                setStep(0);
              }}
            >
              重播 / 回到开始
            </button>
          </div>
          <p className="training-motion-note">
            {reduced
              ? "系统减少动态效果已启用：使用上一步 / 下一步查看静态状态。"
              : "播放只在你点击后开始，每步停留 2.4 秒；可随时暂停或手动逐步查看。"}
          </p>
          <ol className="training-steps" aria-label="训练计算步骤">
            {labels.map((label, index) => (
              <li key={label}>
                <button
                  disabled={index > 0 && !allowAdvance}
                  aria-current={step === index ? "step" : undefined}
                  onClick={() => {
                    setPlaying(false);
                    setStep(index);
                  }}
                >
                  {index + 1}. {label}
                </button>
              </li>
            ))}
          </ol>
          <div
            className="training-graph-scroll"
            role="region"
            tabIndex={0}
            aria-label="训练计算图，窄屏可左右滑动"
          >
            <svg
              className={`training-graph ${playing ? "is-playing" : ""} ${step === 1 ? "is-forward" : ""} ${step === 3 || step === 4 ? "is-backward" : ""}`}
              viewBox="0 0 900 420"
              role="img"
              aria-labelledby="training-graph-title training-graph-desc"
            >
              <title id="training-graph-title">
                {`第 ${step + 1}/7 步：${labels[step]}`}
              </title>
              <desc id="training-graph-desc">
                {descriptions[step]} 蓝色向右是 Forward；橙色向左是 chain rule
                求导，梯度都使用更新前的参数。
              </desc>
              <defs>
                <marker
                  id="train-blue"
                  markerWidth="7"
                  markerHeight="7"
                  refX="6"
                  refY="3.5"
                  orient="auto"
                >
                  <path d="M0 0L7 3.5L0 7" fill="#245fbd" />
                </marker>
                <marker
                  id="train-orange"
                  markerWidth="7"
                  markerHeight="7"
                  refX="6"
                  refY="3.5"
                  orient="auto"
                >
                  <path d="M0 0L7 3.5L0 7" fill="#a74e21" />
                </marker>
              </defs>
              <text x="24" y="28" className="training-diagram-heading">
                {final
                  ? "新参数下的 Forward"
                  : "旧参数下的 Forward · 更新前不改权重"}
              </text>
              <text x="24" y="55">
                w={f(final ? result.updated.w : inputs.w)} · v=
                {f(final ? result.updated.v : inputs.v)} · target y=
                {f(inputs.target)}
              </text>
              {nodes.slice(0, 4).map((_, i) => (
                <path
                  key={i}
                  className={
                    step >= 1 ? "training-edge forward-flow" : "training-edge"
                  }
                  d={`M${166 + i * 176} 130h28`}
                  markerEnd="url(#train-blue)"
                />
              ))}
              {nodes.map((node, i) => (
                <g
                  key={node.label}
                  className={
                    step >= node.reveal
                      ? "training-node revealed"
                      : "training-node"
                  }
                >
                  <rect
                    x={24 + i * 176}
                    y="85"
                    width="142"
                    height="91"
                    rx="4"
                  />
                  <text x={95 + i * 176} y="108" textAnchor="middle">
                    {node.label} · {node.formula}
                  </text>
                  <text
                    x={95 + i * 176}
                    y="150"
                    textAnchor="middle"
                    className="training-value"
                  >
                    {step >= node.reveal ? node.value : "待计算"}
                  </text>
                </g>
              ))}
              {step >= 3 && !final && (
                <>
                  <text x="24" y="215" className="training-diagram-heading">
                    Backward · 上游梯度 × 局部导数
                  </text>
                  <path
                    className="training-backward-edge backward-flow"
                    d="M799 178v65"
                    markerEnd="url(#train-orange)"
                  />
                  {derivatives.map((node) => (
                    <g
                      key={node.label}
                      className={
                        step >= node.reveal
                          ? "training-node derivative revealed"
                          : "training-node derivative"
                      }
                    >
                      <rect x={node.x} y="252" width="142" height="70" rx="4" />
                      <text x={node.x + 71} y="276" textAnchor="middle">
                        {node.label}
                      </text>
                      <text
                        x={node.x + 71}
                        y="306"
                        textAnchor="middle"
                        className="training-value"
                      >
                        {step >= node.reveal ? f(node.value) : "待反传"}
                      </text>
                    </g>
                  ))}
                  {step >= 4 &&
                    [0, 1, 2].map((i) => (
                      <path
                        key={i}
                        className="training-backward-edge backward-flow"
                        d={`M${728 - i * 176} 286h-28`}
                        markerEnd="url(#train-orange)"
                      />
                    ))}
                  <path
                    className="training-backward-edge backward-flow"
                    d="M799 324v40h-46"
                    markerEnd="url(#train-orange)"
                  />
                  <text x="728" y="370" textAnchor="end">
                    输出层另一条参数路径：gᵥ=δŷ×h={f(result.vGradient)}
                  </text>
                  <text x="24" y="401">
                    此处橙色是导数路径；不是把输入数据倒着流动。
                  </text>
                </>
              )}
              {final && (
                <text x="24" y="220">
                  新的 ŷ 和 L 由 w′、v′ 重新计算；下方表保留旧梯度供对照。
                </text>
              )}
            </svg>
          </div>
          <p className="training-scroll-note">
            窄屏可左右滑动完整图；同一步的公式和解释在下面。
          </p>
          <div
            className="training-explanation"
            role="status"
            aria-live={playing ? "off" : "polite"}
          >
            <h2>
              {step + 1}/7 · {labels[step]}
            </h2>
            <p>{descriptions[step]}</p>
          </div>
          {step >= 5 && (
            <div
              className="training-table-scroll"
              role="region"
              tabIndex={0}
              aria-label="同时 SGD 更新对照"
            >
              <table>
                <caption>同一次旧 Forward 的梯度 → 同时更新</caption>
                <thead>
                  <tr>
                    <th>参数</th>
                    <th>旧值</th>
                    <th>梯度</th>
                    <th>θ′ = θ − ηg</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>w</th>
                    <td>{f(inputs.w)}</td>
                    <td>{f(result.wGradient)}</td>
                    <td>{f(result.updated.w)}</td>
                  </tr>
                  <tr>
                    <th>v</th>
                    <td>{f(inputs.v)}</td>
                    <td>{f(result.vGradient)}</td>
                    <td>{f(result.updated.v)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          {final && (
            <div className="training-result">
              <p>
                你的预判：{prediction}。实际：
                {a.loss < b.loss ? "下降" : a.loss > b.loss ? "上升" : "不变"}。
              </p>
              <dl>
                <div>
                  <dt>更新前 L</dt>
                  <dd>{f(b.loss)}</dd>
                </div>
                <div>
                  <dt>更新后 L′</dt>
                  <dd>{f(a.loss)}</dd>
                </div>
                <div>
                  <dt>tanh 局部导数 1−h²</dt>
                  <dd>{f(result.activationDerivative)}</dd>
                </div>
              </dl>
              <p>
                试“tanh 饱和”：即使输出误差明显，1−h²
                很小，第一层得到的梯度也会被压小。
              </p>
            </div>
          )}
          {step >= 4 && <TrainingDiagnostics inputs={inputs} step={step} />}
        </section>
      </div>
      <p className="training-boundary">
        模型边界：原创单样本、单隐单元、无 bias 的 tanh
        回归示意；L=½(ŷ−y)²。这里实际计算解析梯度和一次无 momentum 的 SGD
        更新，不模拟 mini-batch 随机抽样，也不报告训练收敛或泛化性能。
      </p>
      <p className="training-sources">
        继续阅读：
        <a
          href="https://d2l.ai/chapter_multilayer-perceptrons/backprop.html"
          target="_blank"
          rel="noreferrer"
        >
          D2L：Forward / Backward
        </a>{" "}
        ·{" "}
        <a
          href="https://cs231n.github.io/optimization-2/"
          target="_blank"
          rel="noreferrer"
        >
          CS231n：chain rule
        </a>{" "}
        ·{" "}
        <a
          href="https://d2l.ai/chapter_optimization/gd.html"
          target="_blank"
          rel="noreferrer"
        >
          D2L：步长与下降
        </a>{" "}
        ·{" "}
        <a
          href="https://www.3blue1brown.com/lessons/backpropagation-calculus/"
          target="_blank"
          rel="noreferrer"
        >
          3Blue1Brown：导数直觉
        </a>
        。本页图与计算均为原创。
      </p>
    </StudioShell>
  );
}
