import type { LabDefinition, LabProps } from "./types";
import { LabCanvas, VizArrow, VizNode, VizText } from "./LabCanvas";

const ink = "#183c38";
const muted = "#647b75";
const teal = "#218776";
const orange = "#d18743";
const blue = "#638fc3";
const purple = "#9974ad";
const colors = [teal, orange, blue, purple];
const f = (n: number, digits = 2) => n.toFixed(digits);
const path = (points: [number, number][]) =>
  points
    .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");
const samples = (
  fn: (x: number) => [number, number],
  min: number,
  max: number,
  n = 100,
) => Array.from({ length: n + 1 }, (_, i) => fn(min + ((max - min) * i) / n));
const transition = { transition: "all 450ms ease" };

function PlotFrame({
  x = 55,
  y = 65,
  width = 420,
  height = 225,
  xlabel = "x",
  ylabel = "y",
}: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  xlabel?: string;
  ylabel?: string;
}) {
  return (
    <g>
      <path
        d={`M${x},${y}V${y + height}H${x + width}`}
        fill="none"
        stroke="#b7c8c1"
        strokeWidth="1.5"
      />
      {[1, 2, 3].map((i) => (
        <line
          key={i}
          x1={x}
          y1={y + (height * i) / 4}
          x2={x + width}
          y2={y + (height * i) / 4}
          stroke="#e1e9e4"
          strokeDasharray="3 5"
        />
      ))}
      <VizText x={x + width} y={y + height + 22} size={12} anchor="end">
        {xlabel}
      </VizText>
      <VizText x={x} y={y - 13} size={12}>
        {ylabel}
      </VizText>
    </g>
  );
}
function Metric({
  x = 510,
  y,
  label,
  value,
  color = teal,
}: {
  x?: number;
  y: number;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <g>
      <VizText x={x} y={y} size={12} fill={muted}>
        {label}
      </VizText>
      <VizText x={x} y={y + 26} size={22} weight={700} fill={color}>
        {value}
      </VizText>
    </g>
  );
}

export const toySigmoid = (x: number) => 1 / (1 + Math.exp(-x));
export const toyGradientDescent = (eta: number, count = 4) =>
  Array.from({ length: count }, (_, i) => 2.4 * (1 - eta) ** i);
export function toyNetwork(weight: number) {
  const z1 = weight - 0.5;
  const h1 = Math.max(0, z1);
  const h2 = 0.5;
  return { z1, h1, h2, output: 0.8 * h1 - 0.4 * h2 };
}

function NetworkLab({ step, value }: LabProps) {
  const { z1, h1, h2, output } = toyNetwork(value);
  return (
    <LabCanvas label="MLP 前向传播，调节权重观察 ReLU 与输出变化">
      <VizText x={34} y={32} size={15} weight={700}>
        一个可手算的 2 → 2 → 1 网络
      </VizText>
      <VizText x={75} y={72} size={12}>
        Inputs
      </VizText>
      <VizText x={254} y={72} size={12}>
        Affine
      </VizText>
      <VizText x={427} y={72} size={12}>
        ReLU
      </VizText>
      <VizText x={604} y={72} size={12}>
        Output
      </VizText>
      {[124, 234].flatMap((y, i) =>
        [124, 234].map((z, j) => (
          <VizArrow
            key={`${i}-${j}`}
            x1={144}
            y1={y}
            x2={219}
            y2={z}
            active={step === 1}
            color={i === j ? teal : orange}
          />
        )),
      )}
      <VizNode x={35} y={95} width={109} label="x₁ = 1.0" active={step === 0} />
      <VizNode
        x={35}
        y={205}
        width={109}
        label="x₂ = 0.5"
        active={step === 0}
      />
      <VizNode
        x={220}
        y={95}
        width={125}
        label={`z₁ = ${f(z1)}`}
        sublabel={`w × 1 − 0.5`}
        active={step === 1}
      />
      <VizNode
        x={220}
        y={205}
        width={125}
        label="z₂ = 0.50"
        sublabel="−0.5 × 1 + 2 × 0.5"
        active={step === 1}
      />
      <VizArrow x1={345} y1={124} x2={389} y2={124} active={step === 2} />
      <VizArrow x1={345} y1={234} x2={389} y2={234} active={step === 2} />
      <VizNode
        x={390}
        y={95}
        width={109}
        label={`h₁ = ${f(h1)}`}
        sublabel={z1 <= 0 ? "负值被截断" : "保留正值"}
        active={step === 2}
      />
      <VizNode
        x={390}
        y={205}
        width={109}
        label={`h₂ = ${f(h2)}`}
        sublabel="max(0, z₂)"
        active={step === 2}
      />
      <VizArrow x1={499} y1={124} x2={569} y2={179} active={step === 3} />
      <VizArrow
        x1={499}
        y1={234}
        x2={569}
        y2={179}
        active={step === 3}
        color={orange}
      />
      <VizText x={535} y={126} size={12}>
        × 0.8
      </VizText>
      <VizText x={535} y={250} size={12}>
        × −0.4
      </VizText>
      <VizNode
        x={570}
        y={150}
        width={119}
        label={`ŷ = ${f(output)}`}
        sublabel="0.8h₁ − 0.4h₂"
        active={step === 3}
      />
      <VizText
        x={35}
        y={313}
        size={14}
        fill={teal}
      >{`可调参数 w = ${f(value)}；w ≤ 0.5 时，这条 ReLU 路径输出为 0。`}</VizText>
      <VizText x={35} y={338} size={12}>
        Forward pass：每次拖动重新计算数值；这里没有运行模型训练。
      </VizText>
    </LabCanvas>
  );
}

function LossLab({ step, value }: LabProps) {
  const px = (r: number) => 55 + ((r + 3) / 6) * 420;
  const py = (l: number) => 290 - (l / 9) * 225;
  const huber = (r: number) =>
    Math.abs(r) <= 1 ? 0.5 * r * r : Math.abs(r) - 0.5;
  const activeColor = step < 2 ? teal : orange;
  return (
    <LabCanvas label="MSE 与 Huber 的损失和梯度对比">
      <PlotFrame xlabel="residual r = ŷ − y" ylabel="单样本 loss" />
      <path
        d={path(samples((r) => [px(r), py(r * r)], -3, 3))}
        stroke={teal}
        strokeWidth={step === 1 ? 5 : 3}
        opacity={step === 2 ? 0.35 : 1}
        fill="none"
      />
      <path
        d={path(samples((r) => [px(r), py(huber(r))], -3, 3))}
        stroke={orange}
        strokeWidth={step === 2 ? 5 : 3}
        opacity={step === 1 ? 0.35 : 1}
        fill="none"
      />
      <line
        x1={px(value)}
        y1={65}
        x2={px(value)}
        y2={290}
        stroke={activeColor}
        strokeDasharray="4 4"
      />
      <circle
        cx={px(value)}
        cy={py(value * value)}
        r={7}
        fill={teal}
        style={transition}
      />
      <circle
        cx={px(value)}
        cy={py(huber(value))}
        r={7}
        fill={orange}
        style={transition}
      />
      {[-3, 0, 3].map((r) => (
        <VizText
          key={r}
          x={px(r)}
          y={282}
          size={11}
          anchor={r === -3 ? "start" : r === 3 ? "end" : "middle"}
        >
          {r}
        </VizText>
      ))}
      <Metric y={72} label="Residual 残差" value={f(value)} />
      <Metric
        y={137}
        label="MSE = r² / gradient = 2r"
        value={`${f(value * value)} / ${f(2 * value)}`}
      />
      <Metric
        y={202}
        label="Huber δ=1 / gradient"
        value={`${f(huber(value))} / ${f(Math.max(-1, Math.min(1, value)))}`}
        color={orange}
      />
      <VizText x={55} y={340} size={13}>
        {step === 3
          ? "大残差时 Huber 梯度封顶为 ±1；MSE 梯度随误差继续增大。"
          : "绿：MSE；橙：Huber。两条曲线采用各自标准定义，数值尺度不同。"}
      </VizText>
    </LabCanvas>
  );
}

export function toyBackprop(weight: number) {
  const output = 2 * weight;
  const residual = output - 3;
  return {
    output,
    residual,
    loss: 0.5 * residual ** 2,
    gradient: 2 * residual,
    updated: weight - 0.1 * 2 * residual,
  };
}
function BackpropLab({ step, value }: LabProps) {
  const n = toyBackprop(value);
  return (
    <LabCanvas label="链式法则沿计算图反向传播">
      <VizText x={36} y={35} size={15} weight={700}>
        x = 2，target y = 3，L = ½(z − 3)²
      </VizText>
      <VizNode
        x={36}
        y={92}
        width={135}
        label={`w = ${f(value)}`}
        sublabel="可学习 parameter"
        active={step === 3}
      />
      <VizArrow x1={172} y1={121} x2={247} y2={121} active={step === 0} />
      <VizText x={209} y={87} size={13} anchor="middle">
        × x
      </VizText>
      <VizNode
        x={248}
        y={92}
        width={135}
        label={`z = ${f(n.output)}`}
        sublabel="z = w × 2"
        active={step === 0}
      />
      <VizArrow x1={384} y1={121} x2={479} y2={121} active={step === 0} />
      <VizNode
        x={480}
        y={92}
        width={195}
        label={`L = ${f(n.loss)}`}
        sublabel={`½ × (${f(n.residual)})²`}
        active={step === 0}
      />
      <VizArrow
        x1={574}
        y1={159}
        x2={574}
        y2={205}
        active={step >= 1}
        color={orange}
      />
      <VizNode
        x={480}
        y={212}
        width={195}
        label={`∂L/∂z = ${f(n.residual)}`}
        sublabel="上游梯度 = z − 3"
        active={step === 1}
        color={orange}
      />
      <VizArrow
        x1={480}
        y1={241}
        x2={385}
        y2={241}
        active={step === 2}
        color={orange}
      />
      <VizNode
        x={248}
        y={212}
        width={135}
        label="∂z/∂w = 2"
        sublabel="局部导数 = x"
        active={step === 2}
        color={orange}
      />
      <VizArrow
        x1={248}
        y1={241}
        x2={172}
        y2={241}
        active={step === 2}
        color={orange}
      />
      <VizNode
        x={36}
        y={212}
        width={135}
        label={`∂L/∂w = ${f(n.gradient)}`}
        sublabel="上游 × 局部"
        active={step === 2}
        color={orange}
      />
      <VizText
        x={36}
        y={314}
        size={16}
        weight={700}
        fill={step === 3 ? teal : muted}
      >{`Optimizer：w′ = w − 0.1 × ∂L/∂w = ${f(n.updated)}`}</VizText>
      <VizText x={36} y={339} size={12}>
        backward 负责算导数；optimizer 才负责更新。拖到 w = 1.5 时梯度为 0。
      </VizText>
    </LabCanvas>
  );
}

function GradientLab({ step, value }: LabProps) {
  const sequence = toyGradientDescent(value);
  const theta = sequence[step];
  const px = (x: number) => 55 + ((x + 5) / 10) * 420;
  const py = (y: number) => 290 - (y / 13) * 220;
  return (
    <LabCanvas label="学习率控制一维二次函数上的梯度下降轨迹">
      <PlotFrame xlabel="parameter θ" ylabel="L(θ) = ½θ²" />
      <path
        d={path(samples((x) => [px(x), py(0.5 * x * x)], -5, 5))}
        stroke={teal}
        fill="none"
        strokeWidth={3}
      />
      {sequence.slice(0, step + 1).map((x, i) => (
        <g key={i}>
          {i > 0 && (
            <VizArrow
              x1={px(sequence[i - 1])}
              y1={py(0.5 * sequence[i - 1] ** 2)}
              x2={px(x)}
              y2={py(0.5 * x ** 2)}
              active={i === step}
              color={orange}
            />
          )}
          <circle
            cx={px(x)}
            cy={py(0.5 * x * x)}
            r={i === step ? 8 : 5}
            fill={i === step ? orange : teal}
          />
          <VizText
            x={px(x)}
            y={py(0.5 * x * x) - 15}
            size={12}
            anchor="middle"
          >{`θ${i}`}</VizText>
        </g>
      ))}
      <Metric y={70} label={`Step ${step} · θ`} value={f(theta, 3)} />
      <Metric y={137} label="gradient g = θ" value={f(theta, 3)} />
      <Metric
        y={204}
        label="loss = ½θ²"
        value={f(0.5 * theta * theta, 3)}
        color={orange}
      />
      <VizText
        x={55}
        y={333}
        size={14}
      >{`θₜ₊₁ = (1 − η)θₜ；η = ${f(value)} → ${value < 1 ? "逐步靠近 0" : value === 1 ? "一步到达 0" : value < 2 ? "跨过谷底，振荡收敛" : value === 2 ? "等幅振荡" : "振荡发散"}`}</VizText>
    </LabCanvas>
  );
}

export function toyAdamW(decay: number) {
  let m = 0,
    v = 0,
    weight = 2;
  return [0.2, -0.05, 0.4, -0.1].map((g, i) => {
    m = 0.9 * m + 0.1 * g;
    v = 0.999 * v + 0.001 * g * g;
    const mhat = m / (1 - 0.9 ** (i + 1));
    const vhat = v / (1 - 0.999 ** (i + 1));
    const adaptive = (0.2 * mhat) / (Math.sqrt(vhat) + 1e-8);
    const shrink = 0.2 * decay * weight;
    const before = weight;
    weight -= adaptive + shrink;
    return { g, mhat, vhat, adaptive, shrink, before, after: weight };
  });
}
function AdamWLab({ step, value }: LabProps) {
  const rows = toyAdamW(value);
  const r = rows[step];
  const barWidth = (v: number) => Math.abs(v) * 300;
  return (
    <LabCanvas label="AdamW 的动量、自适应更新和独立权重衰减">
      <VizText x={34} y={35} size={15} weight={700}>
        固定梯度序列 [0.20, −0.05, 0.40, −0.10] · η = 0.20
      </VizText>
      {rows.map((row, i) => (
        <g key={i} opacity={i <= step ? 1 : 0.3}>
          <rect
            x={37 + i * 169}
            y={59}
            width={152}
            height={60}
            rx={10}
            fill={i === step ? "#e0eee7" : "#f2f5f1"}
            stroke={i === step ? teal : "#dbe5df"}
          />
          <VizText
            x={52 + i * 169}
            y={82}
            size={12}
          >{`t=${i + 1} · g=${f(row.g)}`}</VizText>
          <VizText
            x={52 + i * 169}
            y={104}
            size={14}
            weight={700}
          >{`θ → ${f(row.after, 3)}`}</VizText>
        </g>
      ))}
      <VizText
        x={38}
        y={158}
        size={13}
      >{`m̂ = ${f(r.mhat, 3)}   v̂ = ${f(r.vhat, 4)}`}</VizText>
      <VizText x={38} y={187} size={12}>
        梯度项 adaptive step
      </VizText>
      <rect
        x={230}
        y={173}
        width={barWidth(r.adaptive)}
        height={20}
        rx={4}
        fill={teal}
      />
      <VizText x={445} y={188} size={15} fill={teal}>
        {f(r.adaptive, 4)}
      </VizText>
      <VizText x={38} y={229} size={12}>
        独立项 ηλθ
      </VizText>
      <rect
        x={230}
        y={215}
        width={barWidth(r.shrink)}
        height={20}
        rx={4}
        fill={orange}
        style={transition}
      />
      <VizText x={445} y={230} size={15} fill={orange}>
        {f(r.shrink, 4)}
      </VizText>
      <VizNode
        x={515}
        y={157}
        width={167}
        height={85}
        label={`θ′ = ${f(r.after, 3)}`}
        sublabel={`${f(r.before, 3)} − ${f(r.adaptive, 3)} − ${f(r.shrink, 3)}`}
        active
      />
      <VizText x={38} y={289} size={15} weight={700}>
        θ′ = θ − ηm̂/(√v̂ + ε) − ηλθ
      </VizText>
      <VizText x={38} y={320} size={12}>
        拖动 λ：orange shrink 变化，固定梯度下 m̂ 和 v̂ 不变。
      </VizText>
      <VizText x={38} y={341} size={12}>
        示意学习率放大；实际梯度会随 θ 改变。β₁=0.9，β₂=0.999。
      </VizText>
    </LabCanvas>
  );
}

function RegularizationLab({ step, value }: LabProps) {
  const w = 2 / (1 + value);
  const px = (x: number) => 55 + (x / 3) * 420;
  const maxY = 5 + value * 2;
  const py = (y: number) => 290 - (y / maxY) * 225;
  return (
    <LabCanvas label="L2 正则如何改变目标函数及最优参数">
      <PlotFrame
        xlabel="weight w"
        ylabel={`objective（纵轴上限 ${f(maxY, 1)}）`}
      />
      <path
        d={path(samples((x) => [px(x), py(0.5 * (x - 2) ** 2)], 0, 3))}
        fill="none"
        stroke={blue}
        strokeWidth={step === 0 ? 4 : 2}
      />
      {step >= 1 && (
        <path
          d={path(
            samples(
              (x) => [px(x), py(0.5 * value * x * x)],
              0,
              Math.min(3, Math.sqrt((maxY * 2) / Math.max(value, 0.01))),
            ),
          )}
          fill="none"
          stroke={orange}
          strokeWidth={3}
        />
      )}
      {step >= 2 && (
        <path
          d={path(
            samples(
              (x) => [px(x), py(0.5 * (x - 2) ** 2 + 0.5 * value * x * x)],
              0,
              Math.min(
                3,
                (2 + Math.sqrt(Math.max(0, 4 - (1 + value) * (4 - 2 * maxY)))) /
                  (1 + value),
              ),
            ),
          )}
          fill="none"
          stroke={teal}
          strokeWidth={4}
        />
      )}
      {step >= 2 && (
        <circle
          cx={px(w)}
          cy={py(0.5 * (w - 2) ** 2 + 0.5 * value * w * w)}
          r={8}
          fill={teal}
          style={transition}
        />
      )}
      <Metric y={69} label="无正则最优 w" value="2.00" color={blue} />
      <Metric y={138} label="L2 最优 w* = 2/(1+λ)" value={f(w)} />
      <Metric
        y={209}
        label="参数收缩比例 w*/2"
        value={`${f(100 / (1 + value), 0)}%`}
        color={orange}
      />
      <VizText x={55} y={331} size={13}>
        蓝：½(w−2)²　橙：½λw²　绿：两项相加；更小的 w 不自动保证泛化更好。
      </VizText>
    </LabCanvas>
  );
}

const emData = [-2.8, -2.1, -1.2, 0.5, 1.4, 2.5];
const gaussian = (x: number, mu: number, sigma = 1) =>
  Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI));
export function toyEM(separation: number) {
  const before = [-separation / 2, separation / 2];
  const responsibilities = emData.map(
    (x) =>
      gaussian(x, before[0]) /
      (gaussian(x, before[0]) + gaussian(x, before[1])),
  );
  const count = responsibilities.reduce((s, r) => s + r, 0);
  const after = [
    emData.reduce((s, x, i) => s + x * responsibilities[i], 0) / count,
    emData.reduce((s, x, i) => s + x * (1 - responsibilities[i]), 0) /
      (emData.length - count),
  ];
  const ll = (means: number[]) =>
    emData.reduce(
      (s, x) =>
        s + Math.log(0.5 * gaussian(x, means[0]) + 0.5 * gaussian(x, means[1])),
      0,
    );
  return {
    before,
    after,
    responsibilities,
    beforeLL: ll(before),
    afterLL: ll(after),
  };
}
function EMLab({ step, value }: LabProps) {
  const n = toyEM(value);
  const means = step >= 2 ? n.after : n.before;
  const px = (x: number) => 55 + ((x + 4) / 8) * 590;
  const py = (y: number) => 180 - y * 250;
  return (
    <LabCanvas label="EM 先计算责任度再更新两个高斯均值">
      <VizText x={34} y={30} size={15} weight={700}>
        Mean-only EM · π₁ = π₂ = ½，σ₁ = σ₂ = 1 固定
      </VizText>
      <line x1={55} y1={180} x2={645} y2={180} stroke="#becdc5" />
      {means.map((mu, k) => (
        <g key={k}>
          <path
            d={path(samples((x) => [px(x), py(gaussian(x, mu))], -4, 4))}
            fill="none"
            stroke={colors[k]}
            strokeWidth={3}
          />
          <VizText
            x={px(mu)}
            y={65}
            size={13}
            anchor="middle"
            fill={colors[k]}
          >{`μ${k + 1}=${f(mu)}`}</VizText>
          {step >= 2 && (
            <VizArrow
              x1={px(n.before[k])}
              y1={200}
              x2={px(n.after[k])}
              y2={200}
              active
              color={colors[k]}
            />
          )}
        </g>
      ))}
      {emData.map((x, i) => (
        <g key={i}>
          <circle cx={px(x)} cy={180} r={6} fill={ink} />
          <VizText x={px(x)} y={224} size={12} anchor="middle">
            {x}
          </VizText>
          {step >= 1 && (
            <>
              <rect
                x={px(x) - 25}
                y={238}
                width={50 * n.responsibilities[i]}
                height={18}
                fill={teal}
              />
              <rect
                x={px(x) - 25 + 50 * n.responsibilities[i]}
                y={238}
                width={50 * (1 - n.responsibilities[i])}
                height={18}
                fill={orange}
              />
              <VizText
                x={px(x)}
                y={277}
                size={11}
                anchor="middle"
              >{`${f(n.responsibilities[i] * 100, 0)}% A`}</VizText>
            </>
          )}
        </g>
      ))}
      <VizText x={55} y={309} size={14} fill={teal}>
        {step === 0
          ? "隐藏变量：每个样本来自 A 还是 B？先给出两个初始均值。"
          : step === 1
            ? "E-step：条形的长度表示 p(component | x)，每个样本总和 = 1。"
            : step === 2
              ? "M-step：用刚才的软权重求 weighted mean，箭头显示均值移动。"
              : `Observed log-likelihood：${f(n.beforeLL)} → ${f(n.afterLL)}（一次 E + M）`}
      </VizText>
      <VizText x={55} y={336} size={12}>
        此处仅更新均值；完整 GMM 的 M-step 还可更新 mixture weights 和
        covariance。
      </VizText>
    </LabCanvas>
  );
}

const neighborPoints = [
  { x: 2.7, y: 2.65, label: 0 },
  { x: 3.45, y: 2.4, label: 1 },
  { x: 3.3, y: 3.05, label: 1 },
  { x: 2.3, y: 2.8, label: 0 },
  { x: 2.3, y: 2.1, label: 0 },
  { x: 4.1, y: 2.6, label: 1 },
  { x: 3.9, y: 3.6, label: 1 },
  { x: 1.6, y: 3.6, label: 0 },
  { x: 1.8, y: 1.5, label: 0 },
];
export function toyKNN(k: number) {
  const ranked = neighborPoints
    .map((p, i) => ({ ...p, i, distance: Math.hypot(p.x - 3, p.y - 2.5) }))
    .sort((a, b) => a.distance - b.distance);
  const selected = ranked.slice(0, k);
  const a = selected.filter((p) => p.label === 0).length;
  return {
    ranked,
    selected,
    votes: [a, k - a],
    prediction: a > k / 2 ? "A" : "B",
  };
}
function KNNLab({ step, value }: LabProps) {
  const k = Math.round(value),
    n = toyKNN(k);
  const px = (x: number) => 50 + x * 60,
    py = (y: number) => 300 - y * 60;
  const selected = new Set(n.selected.map((p) => p.i));
  return (
    <LabCanvas label="kNN 根据欧氏距离选邻居并投票">
      <PlotFrame
        x={50}
        y={55}
        width={395}
        height={245}
        xlabel="feature 1"
        ylabel="feature 2"
      />
      {step >= 2 && (
        <circle
          cx={px(3)}
          cy={py(2.5)}
          r={n.selected[k - 1].distance * 60}
          fill="none"
          stroke={blue}
          strokeWidth={1.5}
          strokeDasharray="5 4"
        />
      )}
      {step >= 1 &&
        n.selected.map((p) => (
          <line
            key={p.i}
            x1={px(3)}
            y1={py(2.5)}
            x2={px(p.x)}
            y2={py(p.y)}
            stroke={colors[p.label]}
            strokeWidth={2}
            strokeDasharray="4 4"
          />
        ))}
      {neighborPoints.map((p, i) => (
        <g key={i}>
          <circle
            cx={px(p.x)}
            cy={py(p.y)}
            r={step >= 2 && selected.has(i) ? 11 : 7}
            fill={colors[p.label]}
            opacity={step >= 2 && !selected.has(i) ? 0.3 : 1}
            stroke={selected.has(i) && step >= 2 ? ink : "none"}
            strokeWidth={2}
            style={transition}
          />
          {step === 1 && selected.has(i) && (
            <VizText x={px(p.x) + 10} y={py(p.y) - 10} size={11}>
              {f(n.ranked.find((q) => q.i === i)!.distance)}
            </VizText>
          )}
        </g>
      ))}
      <path
        d={`M${px(3)},${py(2.5) - 12}l12,12l-12,12l-12,-12Z`}
        fill="white"
        stroke={ink}
        strokeWidth={3}
      />
      <VizText x={px(3) - 15} y={py(2.5) - 20} size={12}>
        Query
      </VizText>
      <Metric x={480} y={70} label="最近 k 个邻居" value={`${k}`} />
      {[0, 1].map((c, i) => (
        <g key={c} opacity={step >= 2 ? 1 : 0.3}>
          <VizText
            x={480}
            y={163 + 55 * i}
            size={13}
          >{`${c === 0 ? "A" : "B"} votes = ${n.votes[c]}`}</VizText>
          <rect
            x={480}
            y={173 + 55 * i}
            width={n.votes[c] * 28}
            height={17}
            rx={4}
            fill={colors[c]}
            style={transition}
          />
        </g>
      ))}
      <VizText
        x={480}
        y={293}
        size={19}
        weight={700}
        fill={step === 3 ? colors[n.prediction === "A" ? 0 : 1] : muted}
      >
        {step === 3 ? `Prediction → ${n.prediction}` : "Uniform voting"}
      </VizText>
      <VizText x={50} y={339} size={12}>
        两轴等比例；虚线圆覆盖最近 k 个邻居。绿色 A，橙色 B，菱形是新样本。
      </VizText>
    </LabCanvas>
  );
}

const clusterPoints: [number, number][] = [
  [1, 1.2],
  [1.2, 1.8],
  [1.6, 1.4],
  [2, 2],
  [2.1, 2.5],
  [3.5, 1],
  [4, 1.4],
  [4.5, 0.8],
  [3.7, 3.5],
  [4.2, 4],
  [4.7, 3.6],
  [1.1, 4],
  [1.6, 4.3],
  [1.9, 3.8],
];
export function toyKMeans(k: number) {
  const initial: [number, number][] = [
    [1, 1],
    [4.5, 3.5],
    [1, 4.5],
    [4.7, 0.8],
  ].slice(0, k) as [number, number][];
  const assign = (centers: [number, number][]) =>
    clusterPoints.map((p) =>
      centers.reduce(
        (best, c, i) =>
          Math.hypot(p[0] - c[0], p[1] - c[1]) <
          Math.hypot(p[0] - centers[best][0], p[1] - centers[best][1])
            ? i
            : best,
        0,
      ),
    );
  const assignments = assign(initial);
  const after = initial.map((c, j) => {
    const points = clusterPoints.filter((_, i) => assignments[i] === j);
    return points.length
      ? ([
          points.reduce((s, p) => s + p[0], 0) / points.length,
          points.reduce((s, p) => s + p[1], 0) / points.length,
        ] as [number, number])
      : c;
  });
  return { initial, assignments, after, finalAssignments: assign(after) };
}
function KMeansLab({ step, value }: LabProps) {
  const n = toyKMeans(Math.round(value));
  const centers = step >= 2 ? n.after : n.initial;
  const memberships = step === 3 ? n.finalAssignments : n.assignments;
  const px = (x: number) => 115 + x * 50,
    py = (y: number) => 305 - y * 50;
  const inertia = clusterPoints.reduce(
    (s, p, i) =>
      s +
      (p[0] - centers[memberships[i]][0]) ** 2 +
      (p[1] - centers[memberships[i]][1]) ** 2,
    0,
  );
  return (
    <LabCanvas label="K-means 的硬分配与质心均值更新">
      <PlotFrame
        x={115}
        y={55}
        width={250}
        height={250}
        xlabel="feature 1"
        ylabel="feature 2"
      />
      {step >= 1 &&
        clusterPoints.map((p, i) => (
          <line
            key={i}
            x1={px(p[0])}
            y1={py(p[1])}
            x2={px(centers[memberships[i]][0])}
            y2={py(centers[memberships[i]][1])}
            stroke={colors[memberships[i]]}
            opacity={0.32}
          />
        ))}
      {clusterPoints.map((p, i) => (
        <circle
          key={i}
          cx={px(p[0])}
          cy={py(p[1])}
          r={6}
          fill={step === 0 ? muted : colors[memberships[i]]}
        />
      ))}
      {centers.map((c, i) => (
        <g key={i}>
          {step >= 2 && (
            <VizArrow
              x1={px(n.initial[i][0])}
              y1={py(n.initial[i][1])}
              x2={px(c[0])}
              y2={py(c[1])}
              active
              color={colors[i]}
            />
          )}
          <path
            d={`M${px(c[0]) - 9},${py(c[1]) - 9}l18,18m0,-18l-18,18`}
            stroke={colors[i]}
            strokeWidth={4}
            style={transition}
          />
          <VizText
            x={px(c[0]) + 11}
            y={py(c[1]) - 12}
            size={12}
            fill={colors[i]}
          >{`μ${i + 1}`}</VizText>
        </g>
      ))}
      <Metric y={70} label="Clusters K" value={`${Math.round(value)}`} />
      <Metric
        y={144}
        label="Inertia · Σ distance²"
        value={f(inertia)}
        color={orange}
      />
      <VizText x={510} y={234} size={13}>
        ● 样本 samples
      </VizText>
      <VizText x={510} y={260} size={13}>
        × 均值 centroids
      </VizText>
      <VizText x={510} y={287} size={12}>
        一个点只属于一个簇
      </VizText>
      <VizText x={45} y={340} size={12}>
        两轴等比例；一次 assign → update → reassign，不代表已收敛。
      </VizText>
    </LabCanvas>
  );
}

function GMMLab({ step, value }: LabProps) {
  const sigma = value,
    query = 0.5;
  const a = 0.45 * gaussian(query, -1.2, sigma),
    b = 0.55 * gaussian(query, 1.4, 0.8);
  const r = a / (a + b);
  const px = (x: number) => 55 + ((x + 4) / 8) * 420;
  const py = (y: number) => 285 - y * 245;
  return (
    <LabCanvas label="GMM 把高斯密度相加并按贝叶斯公式计算软归属">
      <PlotFrame xlabel="x" ylabel="probability density" />
      <path
        d={path(
          samples((x) => [px(x), py(0.45 * gaussian(x, -1.2, sigma))], -4, 4),
        )}
        stroke={teal}
        strokeWidth={3}
        fill="none"
      />
      <path
        d={path(
          samples((x) => [px(x), py(0.55 * gaussian(x, 1.4, 0.8))], -4, 4),
        )}
        stroke={orange}
        strokeWidth={3}
        fill="none"
      />
      {step >= 1 && (
        <path
          d={path(
            samples(
              (x) => [
                px(x),
                py(
                  0.45 * gaussian(x, -1.2, sigma) +
                    0.55 * gaussian(x, 1.4, 0.8),
                ),
              ],
              -4,
              4,
            ),
          )}
          stroke={ink}
          strokeWidth={3}
          fill="none"
          strokeDasharray="5 3"
        />
      )}
      {step >= 2 && (
        <>
          <line
            x1={px(query)}
            y1={70}
            x2={px(query)}
            y2={290}
            stroke={blue}
            strokeDasharray="4 4"
          />
          <circle cx={px(query)} cy={py(a + b)} r={7} fill={blue} />
          <VizText x={px(query)} y={316} size={12} anchor="middle">
            x = 0.5
          </VizText>
        </>
      )}
      <Metric y={70} label="Component A · σ₁" value={f(sigma)} />
      <Metric
        y={136}
        label="p(x=0.5) · density"
        value={f(a + b, 3)}
        color={ink}
      />
      <g opacity={step === 3 ? 1 : 0.3}>
        <VizText x={510} y={223} size={12}>
          posterior responsibility
        </VizText>
        <rect x={510} y={237} width={170 * r} height={24} fill={teal} />
        <rect
          x={510 + 170 * r}
          y={237}
          width={170 * (1 - r)}
          height={24}
          fill={orange}
        />
        <VizText
          x={510}
          y={286}
          size={13}
        >{`A ${f(r * 100, 1)}% · B ${f((1 - r) * 100, 1)}%`}</VizText>
      </g>
      <VizText x={55} y={340} size={12}>
        实线是 πₖNₖ(x)，虚线是总密度；density 与 posterior probability
        的含义不同。
      </VizText>
    </LabCanvas>
  );
}

const pcaData: [number, number][] = [
  [-2.6, -1],
  [-2, -1.6],
  [-1.4, -0.3],
  [-0.8, -0.9],
  [0.8, 0.9],
  [1.4, 0.3],
  [2, 1.6],
  [2.6, 1],
];
export function toyPCA(angle: number) {
  const radians = (angle * Math.PI) / 180;
  const u: [number, number] = [Math.cos(radians), Math.sin(radians)];
  const projections = pcaData.map((p) => p[0] * u[0] + p[1] * u[1]);
  const sxx = pcaData.reduce((s, p) => s + p[0] ** 2, 0) / pcaData.length;
  const syy = pcaData.reduce((s, p) => s + p[1] ** 2, 0) / pcaData.length;
  const sxy = pcaData.reduce((s, p) => s + p[0] * p[1], 0) / pcaData.length;
  return {
    u,
    projections,
    variance: projections.reduce((s, x) => s + x * x, 0) / pcaData.length,
    totalVariance: sxx + syy,
    bestAngle: (0.5 * Math.atan2(2 * sxy, sxx - syy) * 180) / Math.PI,
  };
}
function PCALab({ step, value }: LabProps) {
  const n = toyPCA(value),
    axisLength = Math.min(
      3.3,
      2.2 / Math.max(0.01, Math.abs(Math.sin((value * Math.PI) / 180))),
    ),
    px = (x: number) => 265 + x * 61,
    py = (y: number) => 175 - y * 61;
  return (
    <LabCanvas label="转动投影轴观察 PCA 最大方差方向">
      <line x1={60} y1={175} x2={470} y2={175} stroke="#d9e3dc" />
      <line x1={265} y1={35} x2={265} y2={315} stroke="#d9e3dc" />
      <VizText x={58} y={32} size={13}>
        Centered point cloud · 均值 (0, 0)
      </VizText>
      {step >= 1 && (
        <line
          x1={px(-axisLength * n.u[0])}
          y1={py(-axisLength * n.u[1])}
          x2={px(axisLength * n.u[0])}
          y2={py(axisLength * n.u[1])}
          stroke={teal}
          strokeWidth={3}
          style={transition}
        />
      )}
      {pcaData.map((p, i) => (
        <g key={i}>
          {step >= 2 && (
            <>
              <line
                x1={px(p[0])}
                y1={py(p[1])}
                x2={px(n.projections[i] * n.u[0])}
                y2={py(n.projections[i] * n.u[1])}
                stroke={orange}
                strokeDasharray="3 4"
              />
              <circle
                cx={px(n.projections[i] * n.u[0])}
                cy={py(n.projections[i] * n.u[1])}
                r={5}
                fill={orange}
                style={transition}
              />
            </>
          )}
          <circle cx={px(p[0])} cy={py(p[1])} r={7} fill={blue} />
        </g>
      ))}
      <Metric y={60} label="Projection axis θ" value={`${f(value, 0)}°`} />
      <Metric
        y={128}
        label="Projected variance"
        value={f(n.variance, 3)}
        color={orange}
      />
      <Metric
        y={196}
        label="Retained / total variance"
        value={`${f((n.variance / n.totalVariance) * 100, 1)}%`}
      />
      <VizText
        x={510}
        y={282}
        size={13}
        weight={700}
      >{`PCA 最优角 ≈ ${f(n.bestAngle, 1)}°`}</VizText>
      <VizText x={55} y={340} size={12}>
        橙色是正交投影，虚线是重建误差；PCA 选择最大方差方向，不使用类别标签。
      </VizText>
    </LabCanvas>
  );
}

const svmData = [-2, -1.4, -0.8, -0.3, 0.3, 0.8, 1.4, 2].map((x, i) => ({
  x,
  y: [-1, -1, -1, 1, -1, 1, 1, 1][i],
}));
export function toySVM(c: number) {
  let bestW = 0,
    bestLoss = Infinity;
  for (let i = 0; i <= 4000; i++) {
    const w = i / 1000;
    const hinge = svmData.reduce(
      (s, p) => s + Math.max(0, 1 - p.y * w * p.x),
      0,
    );
    const objective = 0.5 * w * w + c * hinge;
    if (objective < bestLoss) {
      bestW = w;
      bestLoss = objective;
    }
  }
  return {
    w: bestW,
    objective: bestLoss,
    hinge: svmData.map((p) => Math.max(0, 1 - p.y * bestW * p.x)),
  };
}
function SVMLab({ step, value }: LabProps) {
  const n = toySVM(value),
    px = (x: number) => 265 + x * 84;
  const margin = Math.min(2.5, 1 / Math.max(n.w, 0.001));
  return (
    <LabCanvas label="软间隔 SVM 的 C 改变拟合权重与间隔宽度">
      <VizText x={45} y={33} size={14}>
        1D linear SVM · f(x)=wx，固定 b=0
      </VizText>
      {step >= 1 && (
        <rect
          x={px(-margin)}
          y={58}
          width={margin * 168}
          height={231}
          fill="#e3efe8"
          style={transition}
        />
      )}
      <line
        x1={px(0)}
        y1={55}
        x2={px(0)}
        y2={294}
        stroke={ink}
        strokeWidth={3}
      />
      {step >= 1 &&
        [-1, 1].map((sign) => (
          <line
            key={sign}
            x1={px(sign * margin)}
            y1={55}
            x2={px(sign * margin)}
            y2={294}
            stroke={teal}
            strokeDasharray="5 5"
            style={transition}
          />
        ))}
      {svmData.map((p, i) => (
        <g key={i}>
          <circle
            cx={px(p.x)}
            cy={105 + (i % 3) * 57}
            r={10}
            fill={p.y < 0 ? orange : teal}
            stroke={step >= 2 && n.hinge[i] > 0 ? ink : "white"}
            strokeWidth={step >= 2 && n.hinge[i] > 0 ? 3 : 2}
          />
          <VizText x={px(p.x)} y={132 + (i % 3) * 57} size={11} anchor="middle">
            {step >= 2 ? `ξ=${f(n.hinge[i], 1)}` : `y=${p.y}`}
          </VizText>
        </g>
      ))}
      <VizText x={265} y={317} size={12} anchor="middle">
        x=0 · decision boundary
      </VizText>
      <Metric y={68} label="惩罚权重 C" value={f(value)} />
      <Metric y={136} label="拟合的 w（网格求解）" value={f(n.w, 3)} />
      <Metric
        y={205}
        label="Margin width = 2/|w|"
        value={f(2 / Math.max(n.w, 0.001), 2)}
        color={orange}
      />
      <VizText x={45} y={340} size={12}>
        点的高度只为排版；黑圈标出 hinge ＞ 0 的样本，ξ=max(0,1−ywx)。
      </VizText>
    </LabCanvas>
  );
}

function LogisticLab({ step, value }: LabProps) {
  const query = 1.2,
    z = value * query - 1,
    p = toySigmoid(z);
  const px = (x: number) => 55 + ((x + 3) / 6) * 420,
    py = (y: number) => 290 - y * 225;
  return (
    <LabCanvas label="Logistic regression 将线性分数变成概率并计算交叉熵">
      <PlotFrame xlabel="feature x" ylabel="p(y=1 | x)" />
      <line
        x1={55}
        y1={py(0.5)}
        x2={475}
        y2={py(0.5)}
        stroke={orange}
        strokeDasharray="5 5"
      />
      <VizText x={57} y={py(0.5) - 9} size={11}>
        threshold 0.5
      </VizText>
      <path
        d={path(samples((x) => [px(x), py(toySigmoid(value * x - 1))], -3, 3))}
        fill="none"
        stroke={teal}
        strokeWidth={4}
      />
      <circle
        cx={px(query)}
        cy={py(p)}
        r={8}
        fill={orange}
        style={transition}
      />
      <line
        x1={px(query)}
        y1={py(p)}
        x2={px(query)}
        y2={290}
        stroke={orange}
        strokeDasharray="4 4"
      />
      <VizText x={px(query)} y={316} size={12} anchor="middle">
        x=1.2, y=1
      </VizText>
      <Metric
        y={65}
        label="Linear logit z = wx − 1"
        value={f(z)}
        color={step === 0 ? orange : teal}
      />
      <Metric
        y={132}
        label="Sigmoid p = 1/(1+e⁻ᶻ)"
        value={`${f(p * 100, 1)}%`}
      />
      <Metric
        y={200}
        label="BCE(y=1) = −log p"
        value={f(-Math.log(p), 3)}
        color={orange}
      />
      <VizText
        x={510}
        y={287}
        size={13}
      >{`∂L/∂w = (p−1)x = ${f((p - 1) * query, 3)}`}</VizText>
      <VizText x={55} y={340} size={12}>
        {step === 3
          ? "此样本梯度为负：梯度下降会增大 w，提升这个正样本的概率。"
          : "w 同时改变 S 曲线陡峭程度与边界 x=1/w；阈值选择与概率训练是不同步骤。"}
      </VizText>
    </LabCanvas>
  );
}

export const foundationsClassicalLabs: Record<string, LabDefinition> = {
  "neural-networks": {
    title: "让一个权重流过神经网络",
    englishTitle: "MLP forward pass",
    steps: [
      {
        title: "输入 Input",
        explanation:
          "固定 x₁=1、x₂=0.5。一个 feature 向量沿每条连线传入隐藏层；权重决定各输入的贡献。",
      },
      {
        title: "线性组合 Affine",
        explanation:
          "第一条路径计算 z₁=w×1−0.5；另一神经元计算 z₂=−0.5×1+2×0.5。拖动 w 会改变 z₁。",
      },
      {
        title: "非线性 Activation",
        explanation:
          "ReLU(z)=max(0,z)。当 w≤0.5，第一条路径被截为零；非线性让多层网络能表达比单层线性变换更复杂的函数。",
      },
      {
        title: "输出 Prediction",
        explanation:
          "输出层算 ŷ=0.8h₁−0.4h₂。回归任务可直接使用这个数；分类任务通常让输出 logits 进入相应 loss。",
      },
    ],
    parameter: {
      label: "第一条连接的权重 w",
      min: -1,
      max: 3,
      step: 0.1,
      initial: 1,
      hint: "在 w=0.5 附近拖动，观察 ReLU 何时开始传递信号。",
    },
    note: "所有数值来自显示的 toy network。其余权重固定，仅展示 forward pass；真实训练要同时计算梯度和更新参数。",
    render: NetworkLab,
  },
  "loss-functions": {
    title: "同一个错误，两种惩罚方式",
    englishTitle: "MSE versus Huber",
    steps: [
      {
        title: "量化误差 Residual",
        explanation:
          "先计算残差 r=ŷ−y。正负表示预测偏高或偏低，绝对值表示离目标多远。",
      },
      {
        title: "平方惩罚 MSE",
        explanation:
          "这里单样本 MSE=r²，梯度为 2r。误差放大一倍，损失放大四倍；大离群误差可能主导更新。",
      },
      {
        title: "稳健惩罚 Huber",
        explanation:
          "δ=1 时，|r|≤1 用 ½r²，超过后用 |r|−½。外侧梯度为 ±1，从平方增长转为线性增长。",
      },
      {
        title: "比较 Gradient",
        explanation:
          "观察数值梯度决定更新力度。Huber 可降低离群残差的影响，但是否更适合任务仍要看独立验证指标。",
      },
    ],
    parameter: {
      label: "预测残差 r = ŷ − y",
      min: -3,
      max: 3,
      step: 0.1,
      initial: 1.5,
      hint: "拖过 ±1，观察 Huber 由二次段切换到线性段。",
    },
    note: "此处聚焦回归损失；MSE 与 Huber 的标准定义系数不同，不能单凭 loss 数值大小判断谁更好。",
    render: LossLab,
  },
  backpropagation: {
    title: "把链式法则变成一条反向路径",
    englishTitle: "Backpropagation chain rule",
    steps: [
      {
        title: "前向 Forward",
        explanation:
          "保存中间量 z=2w，再得到标量损失 L=½(z−3)²。图中每个节点都能手算核对。",
      },
      {
        title: "上游梯度 Upstream",
        explanation:
          "从 loss 开始求 ∂L/∂z=z−3：输出增加一点会让 loss 增加多少？梯度可以为正、负或零。",
      },
      {
        title: "局部相乘 Chain rule",
        explanation:
          "乘法节点的局部导数 ∂z/∂w=x=2。链式法则把两段相乘，得到 ∂L/∂w=(z−3)×2。",
      },
      {
        title: "参数更新 Optimizer",
        explanation:
          "用学习率 0.1 做 w′=w−0.1∂L/∂w。backprop 给梯度，optimizer 使用梯度更新；两者是不同操作。",
      },
    ],
    parameter: {
      label: "当前权重 w",
      min: 0,
      max: 2.5,
      step: 0.1,
      initial: 0.8,
      hint: "试试 w=1.5：预测等于目标，loss 与梯度同时归零。",
    },
    note: "一条计算路径的局部导数相乘；复杂计算图里多条汇入路径的梯度还需要相加。",
    render: BackpropLab,
  },
  "gradient-descent": {
    title: "学习率决定下坡的每一步",
    englishTitle: "Learning-rate trajectories",
    steps: [
      {
        title: "初始位置 θ₀",
        explanation:
          "从 θ₀=2.4 出发，目标是 L(θ)=½θ²。此处 gradient g=θ，最优点在 θ=0。",
      },
      {
        title: "第一次更新",
        explanation: "计算 θ₁=θ₀−ηθ₀=(1−η)θ₀。η 控制步长；η>1 会跨过谷底。",
      },
      {
        title: "重算局部梯度",
        explanation:
          "来到新位置后重算梯度，再执行同一规则。振荡本身不等于发散，要看距最优点是否在缩小。",
      },
      {
        title: "检查稳定性",
        explanation:
          "对这个曲率为 1 的二次函数，0<η<2 收敛；η=2 等幅振荡；η>2 发散。实际损失曲率不同，稳定范围也不同。",
      },
    ],
    parameter: {
      label: "Learning rate η",
      min: 0.1,
      max: 2.2,
      step: 0.1,
      initial: 0.5,
      hint: "比较 η=0.1、1、1.5、2.2 的三次更新轨迹。",
    },
    note: "精确计算一维 full-batch 梯度下降；真实 mini-batch 梯度有噪声，深网络也不是固定二次曲面。",
    render: GradientLab,
  },
  adamw: {
    title: "自适应步长与独立收缩",
    englishTitle: "AdamW update decomposition",
    steps: [
      {
        title: "第一次梯度",
        explanation:
          "从 θ=2、m=v=0 出发。更新梯度与平方梯度的指数均值，再做 bias correction，得到 m̂ 和 v̂。",
      },
      {
        title: "积累 Momentum",
        explanation:
          "第二次梯度变负，但 m̂ 仍可能为正：动量保留过去梯度。自适应项用 m̂/(√v̂+ε) 计算。",
      },
      {
        title: "独立 Weight decay",
        explanation:
          "绿色条是 adaptive step，橙色条是 ηλθ。AdamW 把权重收缩直接作用于参数，不把 λθ 混入梯度的动量统计。",
      },
      {
        title: "继续更新与检查",
        explanation:
          "四步使用同一公式 θ′=θ−adaptive−decay。调 λ 会改变参数轨迹；调参时仍需联合考察学习率、验证误差与训练预算。",
      },
    ],
    parameter: {
      label: "Weight decay λ",
      min: 0,
      max: 1,
      step: 0.05,
      initial: 0.1,
      hint: "这里学习率刻意放大为 0.2，方便看清独立收缩项。",
    },
    note: "固定四个梯度隔离 weight decay 的作用；真实梯度取决于参数与 batch。不是建议把示意学习率照搬到模型。",
    render: AdamWLab,
  },
  regularization: {
    title: "L2 如何把最优权重拉向零",
    englishTitle: "Ridge regularization geometry",
    steps: [
      {
        title: "拟合 Data loss",
        explanation:
          "玩具数据损失是 ½(w−2)²，不加惩罚时最优参数为 w=2。蓝色曲线只衡量拟合误差。",
      },
      {
        title: "加入 L2 penalty",
        explanation:
          "橙色曲线是 ½λw²，偏好较小权重。λ 决定你愿意为减小参数而牺牲多少训练拟合。",
      },
      {
        title: "求新的最优点",
        explanation:
          "总目标求导：(w−2)+λw=0，得到 w*=2/(1+λ)。绿点是解析最优点，不是预设动画。",
      },
      {
        title: "判断 Bias–variance",
        explanation:
          "λ 越大，参数越小，但训练误差会增加。真实任务用验证集选择 λ；仅让权重变小不保证泛化更好。",
      },
    ],
    parameter: {
      label: "L2 强度 λ",
      min: 0,
      max: 6,
      step: 0.1,
      initial: 1,
      hint: "对比 λ=0、1、5；图中纵轴随目标范围缩放。",
    },
    note: "展示 L2/ridge 目标，不代表 dropout、early stopping 等所有正则方式；AdamW 的独立 weight decay 另有专门实验。",
    render: RegularizationLab,
  },
  "expectation-maximization": {
    title: "先软分配，再更新解释数据的均值",
    englishTitle: "One exact EM iteration",
    steps: [
      {
        title: "初始化 Latent model",
        explanation:
          "六个观测没有类别。先放两个高斯均值，混合权重各 ½、方差均为 1；滑杆改变初始均值间距。",
      },
      {
        title: "E-step 责任度",
        explanation:
          "用当前参数计算 rᵢ₁=N(xᵢ|μ₁)/(N₁+N₂)，rᵢ₂=1−rᵢ₁。它们是条件概率，不是硬标签。",
      },
      {
        title: "M-step 加权均值",
        explanation:
          "保持 E-step 的责任度固定，再算 μₖ′=Σrᵢₖxᵢ/Σrᵢₖ。每个点按软归属程度贡献均值。",
      },
      {
        title: "比较 Likelihood",
        explanation:
          "显示更新前后的 observed log-likelihood。此 toy model 做精确 E/M 更新，似然不会下降；这不保证全局最优。",
      },
    ],
    parameter: {
      label: "初始均值间距 |μ₂−μ₁|",
      min: 0.5,
      max: 5,
      step: 0.1,
      initial: 2,
      hint: "中心靠近时责任度更模糊；拉开后边缘点的归属更明确。",
    },
    note: "这是固定方差与混合权重的 mean-only EM。一轮后还未必收敛；完整 GMM 通常同时更新均值、协方差与权重。",
    render: EMLab,
  },
  knn: {
    title: "谁是近邻，谁决定投票",
    englishTitle: "kNN distances and voting",
    steps: [
      {
        title: "保存参考样本",
        explanation:
          "圆点是已知标签的参考数据；菱形是新 query。kNN 需要有意义的特征尺度，不会自动学习语义距离。",
      },
      {
        title: "计算与排序距离",
        explanation:
          "用数据坐标的 Euclidean distance 排序。连线旁显示被选邻居的真实距离，距离越短，排名越靠前。",
      },
      {
        title: "选择 k 个邻居",
        explanation:
          "边框与连线标出最近 k 个点，uniform voting 每点一票。调大 k 会纳入较远的样本。",
      },
      {
        title: "多数投票分类",
        explanation:
          "A/B 条形是当前票数，多数类成为预测。此例使用奇数 k 避免二类平票；实际应在验证集比较 k 与加权方式。",
      },
    ],
    parameter: {
      label: "邻居数量 k",
      min: 1,
      max: 9,
      step: 2,
      initial: 3,
      hint: "试 1、3、5：新增邻居能改变多数票与预测类别。",
    },
    note: "九个固定样本、两个特征、无距离加权；两轴等比例绘制，圆半径由第 k 个邻居的欧氏距离决定。",
    render: KNNLab,
  },
  "k-means": {
    title: "交替移动分配与质心",
    englishTitle: "K-means assignment and update",
    steps: [
      {
        title: "初始化 K 个中心",
        explanation:
          "叉号是确定性的初始质心，圆点是无标签样本。K 决定允许多少个簇，不能由算法自动解释为真实类别数。",
      },
      {
        title: "Assign 最近中心",
        explanation:
          "每个样本归给欧氏距离最近的中心，连线显示硬分配。目标是样本到所属质心的平方距离之和。",
      },
      {
        title: "Update 组内均值",
        explanation:
          "固定刚才的分配，把每个质心移到组内样本均值。箭头显示实际位移，inertia 用新质心重新计算。",
      },
      {
        title: "Reassign 再分配",
        explanation:
          "用新质心重新寻找最近中心，部分成员可能换组。真实训练重复 assign/update 到收敛，并比较多次初始化。",
      },
    ],
    parameter: {
      label: "簇数量 K",
      min: 2,
      max: 4,
      step: 1,
      initial: 3,
      hint: "比较同一批数据分成 2、3、4 组时的粒度与 inertia。",
    },
    note: "只展示一轮 Lloyd 迭代，固定初始化便于复现；没有宣称已得到收敛解或全局最优。",
    render: KMeansLab,
  },
  "gaussian-mixture-model": {
    title: "密度相加，归属归一化",
    englishTitle: "GMM density and posterior",
    steps: [
      {
        title: "两个高斯 Components",
        explanation:
          "绿 A：μ=−1.2，π=0.45；橙 B：μ=1.4，π=0.55，σ=0.8。滑杆改变 A 的标准差，曲线变宽且峰变低。",
      },
      {
        title: "混合密度 Mixture",
        explanation:
          "虚线是 p(x)=π₁N₁(x)+π₂N₂(x)。这是密度曲线；单个横坐标处的密度值不是落在该点的概率。",
      },
      {
        title: "查询一个样本",
        explanation:
          "固定 x=0.5，分别计算两个加权密度。两者之和给出模型在此位置的总密度。",
      },
      {
        title: "软归属 Posterior",
        explanation:
          "把 A 的加权密度除以总密度，就得到 p(A|x)；B 同理，归属概率和为 1。概率受均值、方差和混合权重共同影响。",
      },
    ],
    parameter: {
      label: "Component A 标准差 σ₁",
      min: 0.4,
      max: 2,
      step: 0.1,
      initial: 1,
      hint: "观察 A 变宽后，x=0.5 的 posterior 如何变化。",
    },
    note: "此实验考察给定参数的 GMM inference，没有拟合数据。EM 的参数学习过程在独立动效中展示。",
    render: GMMLab,
  },
  pca: {
    title: "旋转一根轴，留下最多变化",
    englishTitle: "PCA projection and variance",
    steps: [
      {
        title: "中心化 Center",
        explanation:
          "蓝色样本已减去训练均值，此例均值恰为 (0,0)。量纲不一致时还要考虑训练集内标准化。",
      },
      {
        title: "选择一个方向",
        explanation:
          "绿色单位方向 u=(cosθ,sinθ)。滑动角度改变候选一维子空间；PCA 会从所有方向中寻找最优方向。",
      },
      {
        title: "投影 Project",
        explanation:
          "每点的一维坐标 z=x·u，橙点是重建 zu。虚线垂直于投影轴，长度反映丢失的信息。",
      },
      {
        title: "最大化 Variance",
        explanation:
          "看投影方差占总方差的比例。图中最优角由协方差矩阵求得；一维最大方差方向同时最小化平方重建误差。",
      },
    ],
    parameter: {
      label: "投影方向 θ",
      min: -80,
      max: 80,
      step: 1,
      initial: 25,
      unit: "°",
      hint: "把方向转到接近显示的 PCA 最优角，再与垂直方向比较。",
    },
    note: "八个中心化样本、二维压缩到一维。方差按 n 归一化；解释方差高不保证保留预测标签需要的信号。",
    render: PCALab,
  },
  svm: {
    title: "C 如何改变软间隔的取舍",
    englishTitle: "Soft-margin SVM trade-off",
    steps: [
      {
        title: "线性判别 Score",
        explanation:
          "横坐标是唯一输入特征，高度仅为排版。标签为 ±1，决策分数 f(x)=wx，边界在 x=0。中心附近故意放了两个反常标签。",
      },
      {
        title: "最大化 Margin",
        explanation:
          "间隔边界满足 wx=±1，总宽度为 2/|w|。减小 w 可扩大间隔，但会让更多样本落入间隔或被分错。",
      },
      {
        title: "计算 Hinge penalty",
        explanation:
          "每个点 ξ=max(0,1−ywx)。黑圈表示 ξ>0；分对但落在间隔内的点同样产生 hinge loss。",
      },
      {
        title: "用 C 权衡",
        explanation:
          "对称数据固定 b=0，数值搜索最小化 ½w²+CΣξ。大 C 提高违反间隔的代价；滑杆实时重新求解 w，而非仅改变示意线宽。",
      },
    ],
    parameter: {
      label: "Hinge 惩罚系数 C",
      min: 0.1,
      max: 5,
      step: 0.1,
      initial: 1,
      hint: "从 C=0.1 往上拖，观察实际最优 w 与 margin 的变化。",
    },
    note: "一维线性 soft-margin 示例；w∈[0,4] 以 0.001 网格搜索近似求解。黑圈只标 hinge>0，不等同于完整支持向量集合。",
    render: SVMLab,
  },
  "logistic-regression": {
    title: "从线性分数到概率与梯度",
    englishTitle: "Logistic regression and BCE",
    steps: [
      {
        title: "线性 Logit",
        explanation:
          "先算 z=wx+b，这里 b=−1、查询 x=1.2。z 可以是任意实数，尚不是概率。",
      },
      {
        title: "Sigmoid 概率",
        explanation:
          "用 sigmoid(z) 把实数映射到 (0,1)。调 w 改变曲线；p=0.5 对应 z=0，边界 x=1/w。",
      },
      {
        title: "交叉熵 BCE",
        explanation:
          "查询点标签 y=1，所以 loss=−log p。预测概率越接近 0，正标签受到的惩罚越大。",
      },
      {
        title: "梯度 Update direction",
        explanation:
          "BCE 对 logit 的梯度是 p−y，再乘局部导数 x，得到 ∂L/∂w=(p−y)x。此正样本会推动 w 增大。",
      },
    ],
    parameter: {
      label: "权重 w",
      min: 0.2,
      max: 4,
      step: 0.1,
      initial: 1,
      hint: "比较 w 较小时的犹豫概率与 w 增大后的高置信度。",
    },
    note: "单样本梯度帮助理解计算；实际训练对多个样本求平均，还要验证概率校准与分类阈值。",
    render: LogisticLab,
  },
};
