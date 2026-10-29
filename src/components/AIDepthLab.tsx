import { useState, type ReactNode } from "react";
import {
  Range,
  Choice,
  Plot,
  Readout,
  Check,
  Notes,
  useSteps,
} from "./AIBreadthLab";
import {
  hmmExperiment,
  kalmanExperiment,
  assignmentExperiment,
  geometryExperiment,
  mctsExperiment,
  beamExperiment,
  treeRewards,
  type Box,
} from "./depthLabMath";
import "./ai-depth.css";
const blue = "#245fbd",
  teal = "#167b73",
  orange = "#a75224",
  muted = "#60708b";
const f = (v: number, n = 3) =>
  (Math.abs(v) < 0.5 * 10 ** -n ? 0 : v).toFixed(n);
function Derivation({ children }: { children: ReactNode }) {
  return <div className="depth-derivation">{children}</div>;
}
function HMMLab() {
  const [stay, setStay] = useState(0.8),
    [accuracy, setAccuracy] = useState(0.8),
    [seq, setSeq] = useState("10110");
  const r = hmmExperiment(stay, accuracy, [...seq].map(Number)),
    s = useSteps(4),
    a = r.frames[s.step];
  return (
    <>
      <h2>HMM：当前最可能的 state，等于最可能的整条 path 吗？</h2>
      <p>
        两个 hidden states 0/1，prior=[.5,.5]。Emission
        accuracy=P(observation=state)，stay=P(same next state)。逐个 observation
        计算 Forward，再比较使用全部 5 次观测的 Smoothing 与
        Viterbi；不在这里拟合参数。
      </p>
      <div className="bio-controls">
        <Range
          label="Transition stay probability"
          value={stay}
          min={0.5}
          max={0.95}
          step={0.05}
          set={(v) => {
            setStay(v);
            s.choose(0);
          }}
          hint="增大后，切换 state 的 prior cost 更高。"
        />
        <Range
          label="Emission accuracy"
          value={accuracy}
          min={0.55}
          max={0.95}
          step={0.05}
          set={(v) => {
            setAccuracy(v);
            s.choose(0);
          }}
          hint="这是模型假设，不是已测出的真实准确率。"
        />
        <Choice
          label="Observation sequence"
          value={seq}
          set={(v) => {
            setSeq(v);
            s.choose(0);
          }}
          options={["10110", "11100", "01010"].map((x) => [x, x])}
        />
      </div>
      {s.controls}
      <Plot
        label={`HMM trellis through observation ${s.step + 1}`}
        height={290}
      >
        {[0, 1].map((j) => (
          <text key={j} x={10} y={95 + j * 110}>
            state {j}
          </text>
        ))}
        {r.frames.map((frame, t) => (
          <g key={t}>
            {t > 0 &&
              [0, 1].flatMap((j) =>
                [0, 1].map((k) => (
                  <line
                    key={`${j}${k}`}
                    x1={100 + (t - 1) * 120}
                    y1={90 + j * 110}
                    x2={100 + t * 120}
                    y2={90 + k * 110}
                    stroke={
                      t <= s.step &&
                      a.bestPath[t - 1] === j &&
                      a.bestPath[t] === k
                        ? orange
                        : "#d6dfe9"
                    }
                    strokeWidth={
                      t <= s.step &&
                      a.bestPath[t - 1] === j &&
                      a.bestPath[t] === k
                        ? 4
                        : 1
                    }
                  />
                )),
              )}
            {[0, 1].map((j) => (
              <g key={j}>
                <circle
                  cx={100 + t * 120}
                  cy={90 + j * 110}
                  r={26}
                  fill={t <= s.step ? "#ecf3ff" : "white"}
                  stroke={t === s.step ? blue : muted}
                />
                <text x={100 + t * 120} y={95 + j * 110} textAnchor="middle">
                  {t <= s.step ? f(frame.filtered[j], 2) : "?"}
                </text>
              </g>
            ))}
            <text x={100 + t * 120} y={255} textAnchor="middle">
              o{t + 1}={frame.o}
            </text>
          </g>
        ))}
        <text x={20} y={25} className="bio-svg-title">
          Nodes: P(stateₜ | o₁:ₜ) · Orange: best prefix path
        </text>
      </Plot>
      <Plot
        label={`Filtered and smoothed state-one probability at time ${s.step + 1}`}
        height={240}
      >
        <text x={20} y={25} className="bio-svg-title">
          P(state=1)：Filtering 用截至 t 的观测；Smoothing 用全部观测
        </text>
        {[0, 1, 2, 3, 4].map((t) => (
          <g key={t}>
            <rect
              x={65 + t * 115}
              y={180 - r.frames[t].filtered[1] * 125}
              width={32}
              height={r.frames[t].filtered[1] * 125}
              fill={blue}
            />
            <rect
              x={101 + t * 115}
              y={180 - r.smoothed[t][1] * 125}
              width={32}
              height={r.smoothed[t][1] * 125}
              fill={teal}
            />
            <text x={95 + t * 115} y={205} textAnchor="middle">
              t={t + 1}
            </text>
          </g>
        ))}
        <text x={20} y={230}>
          Blue: filtered · Teal: smoothed (contains future evidence)
        </text>
      </Plot>
      <Readout
        values={[
          [`Filtered P(state=1), t=${s.step + 1}`, f(a.filtered[1])],
          ["Smoothed P(state=1)", f(r.smoothed[s.step][1])],
          ["Evidence P(o₁…oₜ)", f(a.likelihood, 5)],
          ["Best prefix path", a.bestPath.join(" → ")],
        ]}
      />
      <Derivation>
        <p>
          Prediction=[{a.prediction.map((x) => f(x)).join(", ")}]。乘 emission=[
          {a.emission.map((x) => f(x)).join(", ")}]，得到 mass=[
          {a.mass.map((x) => f(x)).join(", ")}]；除以 sum={f(a.scale)}，得
          posterior。
        </p>
        <p>
          Forward 对所有前驱求和；Viterbi 对前驱取 max 并保留
          backpointer。右侧未来 columns 尚未读入当前
          filtering；第二幅图刻意展示离线 smoothing 供对照，不能用于在线预测。
        </p>
      </Derivation>
      <Check
        question="用未来 observation 算出的 smoothed posterior，能当作当时在线预测吗？"
        options={["不能，它使用了未来信息", "能，都是 posterior"]}
        answer={0}
        why="Filtering、smoothing 与 best-path decoding 回答不同问题；逐点最大 posterior 也不保证组成联合概率最大的路径。"
      />
      <Notes
        lessons={[
          ["hidden-markov-models", "HMM"],
          ["probabilistic-graphical-models", "PGM"],
        ]}
        sources={[
          [
            "https://web.stanford.edu/~jurafsky/slp3/A.pdf",
            "Jurafsky & Martin: HMM",
          ],
        ]}
      >
        <p>
          用于离散潜状态序列、序列标注与状态切换。优势是可检查的 probabilistic
          structure；限制是 Markov 与 emission independence 假设。先用 held-out
          sequences 检查 likelihood、state stability 与 label alignment；state
          数、transition prior 和 emission family 要一起验证。这里以逐步
          normalization 稳定 state posterior；此 5 步 toy 用 scale 乘积展示
          evidence，长序列应累加 log(scale) 避免下溢。Viterbi 在 log space
          运算。
        </p>
      </Notes>
    </>
  );
}
function KalmanLab() {
  const [q, setQ] = useState(0.2),
    [r, setR] = useState(1),
    [shock, setShock] = useState(3),
    s = useSteps(5),
    result = kalmanExperiment(q, r, shock),
    a = result.frames[s.step];
  const ymin = -3,
    ymax = 11,
    y = (v: number) => 230 - ((v - ymin) / (ymax - ymin)) * 180,
    x = (t: number) => 70 + t * 105;
  return (
    <>
      <h2>Kalman Filter：这次该相信 motion 还是 measurement？</h2>
      <p>
        Scalar state，初始 mean=0、variance=1；首步 control=0，之后每步已知
        control=+1。固定 synthetic measurements，只修改模型的 Q/R 假设及第 4
        次异常观测。Q、R 是 variance，不是 standard deviation。
      </p>
      <div className="bio-controls">
        <Range
          label="Process variance Q"
          value={q}
          min={0}
          max={2}
          step={0.1}
          set={(v) => {
            setQ(v);
            s.choose(0);
          }}
          hint="Q 增大：预测变得更不确定，通常更依赖 measurement。"
        />
        <Range
          label="Measurement variance R"
          value={r}
          min={0.1}
          max={4}
          step={0.1}
          set={(v) => {
            setR(v);
            s.choose(0);
          }}
          hint="R 增大：同一 measurement 的权重降低。"
        />
        <Range
          label="Measurement shock at t=4"
          value={shock}
          min={0}
          max={5}
          step={0.5}
          set={(v) => {
            setShock(v);
            s.choose(0);
          }}
          hint="只改变第4次 observation，不改变隐藏状态的生成模型。"
        />
      </div>
      {s.controls}
      <Plot label={`Kalman sequence through t=${s.step + 1}`} height={285}>
        <text x={20} y={25} className="bio-svg-title">
          Blue: posterior mean ±2 SD · Orange: fixed measurements
        </text>
        {[-2, 0, 2, 4, 6, 8, 10].map((v) => (
          <g key={v}>
            <line x1={45} x2={635} y1={y(v)} y2={y(v)} stroke="#d6dfe9" />
            <text x={12} y={y(v) + 5}>
              {v}
            </text>
          </g>
        ))}
        {result.frames.map((v, t) => (
          <g key={t}>
            <text x={x(t)} y={260} textAnchor="middle">
              t={t + 1}
            </text>
            <circle cx={x(t)} cy={y(v.measurement)} r={5} fill={orange} />
            {t <= s.step && (
              <>
                <line
                  x1={x(t)}
                  x2={x(t)}
                  y1={y(v.mean - 2 * Math.sqrt(v.variance))}
                  y2={y(v.mean + 2 * Math.sqrt(v.variance))}
                  stroke={blue}
                  strokeWidth={3}
                />
                <circle cx={x(t)} cy={y(v.mean)} r={7} fill={blue} />
                {t > 0 && (
                  <line
                    x1={x(t - 1)}
                    y1={y(result.frames[t - 1].mean)}
                    x2={x(t)}
                    y2={y(v.mean)}
                    stroke={blue}
                  />
                )}
              </>
            )}
          </g>
        ))}
      </Plot>
      <Plot
        label={`Prior variance ${f(a.predictedVariance)}, measurement variance ${f(r)}, posterior variance ${f(a.variance)}`}
        height={220}
      >
        <text x={20} y={25} className="bio-svg-title">
          同一次更新：variance 与 gain（不是同一量纲）
        </text>
        {[
          ["Predicted P⁻", a.predictedVariance],
          ["Measurement R", r],
          ["Posterior P", a.variance],
        ].map(([label, value], i) => (
          <g key={String(label)}>
            <text x={20} y={75 + i * 50}>
              {label}
            </text>
            <rect
              x={175}
              y={55 + i * 50}
              width={(Number(value) / 6) * 380}
              height={25}
              fill={i === 2 ? teal : blue}
            />
            <text x={190 + (Number(value) / 6) * 380} y={74 + i * 50}>
              {f(Number(value))}
            </text>
          </g>
        ))}
      </Plot>
      <Readout
        values={[
          ["Gain K", f(a.K)],
          ["Innovation z−x⁻", f(a.innovation)],
          ["Posterior mean", f(a.mean)],
          ["Posterior variance", f(a.variance)],
        ]}
      />
      <Derivation>
        <p>
          x⁻={f(a.predictedMean)}；P⁻={f(a.predictedVariance)}；S=P⁻+R={f(a.S)}
          ；K=P⁻/S={f(a.K)}。x=x⁻+K(z−x⁻)={f(a.mean)}。
        </p>
        <p>
          P=(1−K)²P⁻+K²R={f(a.variance)}（scalar Joseph form）。±2 SD
          是模型下的区间展示；这组人为观测并不能验证 95% empirical
          coverage。异常点很大时，线性 Gaussian update 仍可能被拉偏。
        </p>
      </Derivation>
      <Check
        question="看到 measurement 跳变就降低 R，一定能得到更稳健的估计吗？"
        options={[
          "不一定，降低R反而让异常观测影响更大",
          "一定，R越低滤波越稳定",
        ]}
        answer={0}
        why="先检查 innovation、时间间隔、观测单位和噪声假设；outlier handling 与正确过程模型不能由盲目调小 R 代替。"
      />
      <Notes
        lessons={[
          ["kalman-filtering", "Kalman Filter"],
          ["multi-object-tracking", "Tracking"],
        ]}
        sources={[
          [
            "https://arxiv.org/abs/1710.04055",
            "An Elementary Introduction to Kalman Filtering",
          ],
        ]}
      >
        <p>
          用于在线 sensor fusion 与 motion estimation。先由测量残差/标定估
          R，根据未建模运动及 Δt 构造 Q；这里 scalar Q 只是简化设置，不是多维
          constant-velocity 模型的完整 covariance。优势是递推便宜且 uncertainty
          明确；强非线性、多峰、错误 association
          或异常值需要更合适的模型与诊断。
        </p>
      </Notes>
    </>
  );
}
function AssignmentLab() {
  const [weight, setWeight] = useState(0),
    r = assignmentExperiment(weight),
    s = useSteps(r.frames.length - 1),
    a = r.frames[s.step];
  return (
    <>
      <h2>Assignment：每一行都选最小值，为什么整体反而更贵？</h2>
      <p>
        三个 tracks 与三个 detections 的 synthetic
        costs，必须一对一完整匹配。比较按行 Greedy 与实际执行的 Hungarian
        primal-dual augmenting-path 算法。这里没有 dummy nodes；真实任务允许
        unmatched 时应扩展问题，不能强行全部匹配。
      </p>
      <div className="bio-controls">
        <Range
          label="Appearance cost weight"
          value={weight}
          min={0}
          max={1}
          step={0.05}
          set={(v) => {
            setWeight(v);
            s.choose(0);
          }}
          hint="C=(1−w)·geometry+w·appearance；两组成本在此已约定同一尺度。"
        />
      </div>
      {s.controls}
      <p className="bio-equation">{a.label}</p>
      <Plot
        label={`Assignment cost and reduced cost at step ${s.step}`}
        height={300}
      >
        {["Original C", "Reduced C − u − v"].map((title, k) => (
          <g key={title}>
            <text x={30 + k * 330} y={28} className="bio-svg-title">
              {title}
            </text>
            {[0, 1, 2].map((j) => (
              <text
                key={j}
                x={115 + j * 73 + k * 330}
                y={60}
                textAnchor="middle"
              >
                D{j + 1}
              </text>
            ))}
            {r.cost.map((row, i) => (
              <g key={i}>
                <text x={25 + k * 330} y={100 + i * 65}>
                  T{i + 1}
                </text>
                {row.map((c, j) => (
                  <g key={j}>
                    <rect
                      x={80 + j * 73 + k * 330}
                      y={76 + i * 65}
                      width={68}
                      height={48}
                      fill={
                        a.matching.some(([ii, jj]) => ii === i && jj === j)
                          ? "#d7ebe7"
                          : "#ecf3ff"
                      }
                      stroke={
                        a.matching.some(([ii, jj]) => ii === i && jj === j)
                          ? teal
                          : "#d6dfe9"
                      }
                    />
                    <text
                      x={114 + j * 73 + k * 330}
                      y={105 + i * 65}
                      textAnchor="middle"
                    >
                      {f(k ? a.reduced[i][j] : c, 2)}
                    </text>
                  </g>
                ))}
              </g>
            ))}
          </g>
        ))}
        <text x={20} y={288}>
          Green: current matching · Matching 后的边满足 reduced cost≈0
        </text>
      </Plot>
      <Plot label={`Matching edges at step ${s.step}`} height={255}>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <circle
              cx={120}
              cy={55 + i * 75}
              r={20}
              fill="#ecf3ff"
              stroke={blue}
            />
            <text x={120} y={60 + i * 75} textAnchor="middle">
              T{i + 1}
            </text>
            <circle
              cx={520}
              cy={55 + i * 75}
              r={20}
              fill="#ecf3ff"
              stroke={teal}
            />
            <text x={520} y={60 + i * 75} textAnchor="middle">
              D{i + 1}
            </text>
          </g>
        ))}
        {a.matching.map(([i, j]) => (
          <g key={i}>
            <line
              x1={145}
              y1={55 + i * 75}
              x2={495}
              y2={55 + j * 75}
              stroke={teal}
              strokeWidth={3}
            />
            <text x={295 + i * 25} y={(110 + (i + j) * 75) / 2 - 8}>
              {f(r.cost[i][j], 2)}
            </text>
          </g>
        ))}
      </Plot>
      <Readout
        values={[
          ["Greedy total cost", f(r.greedyCost)],
          ["Global minimum cost", f(r.bestCost)],
          ["Greedy gap", f(r.greedyCost - r.bestCost)],
          [
            "Current matching",
            a.matching.map(([i, j]) => `T${i + 1}→D${j + 1}`).join(", ") ||
              "none",
          ],
        ]}
      />
      <Derivation>
        <p>
          当前 u=[{a.u.map((x) => f(x, 2)).join(", ")}]，v=[
          {a.v.map((x) => f(x, 2)).join(", ")}]。Potential update 产生新的 zero
          reduced-cost edges；augmenting path 可以重新分配早先选中的边。
        </p>
        <p>
          最终 primal cost={f(r.bestCost)} 与 dual sum(u)+sum(v)={f(r.dual)}{" "}
          一致，是此完整 assignment 的 optimality certificate。每次改变 w
          都重新计算；成本变小并不证明 track identity 更真实。
        </p>
      </Derivation>
      <Check
        question="Assignment 的代价矩阵设置错了，精确最优 solver 能修复它吗？"
        options={["不能，solver只优化给定目标", "能，全局最优必然对应真实对象"]}
        answer={0}
        why="区分 cost model、gating、unmatched policy 与 optimization；用真实 identity/annotation 在独立视频评价。"
      />
      <Notes
        lessons={[
          ["hungarian-set-matching", "Hungarian / Set Matching"],
          ["detr", "DETR"],
          ["multi-object-tracking", "Tracking"],
        ]}
        sources={[
          [
            "https://docs.scipy.org/doc/scipy/reference/generated/scipy.optimize.linear_sum_assignment.html",
            "SciPy linear_sum_assignment",
          ],
        ]}
      >
        <p>
          用于 set prediction、tracking 与有限集合配对。SciPy 当前实现为
          modified Jonker–Volgenant；本实验使用 Hungarian primal-dual
          思路，不声称复现 SciPy 内部步骤。先规范 cost units，再调权重、gating
          和 no-match penalties。完整 square matching
          的保证不等于允许拒绝、容量约束或 many-to-one assignment 的解。
        </p>
      </Notes>
    </>
  );
}
function GeometryLab() {
  const [width, setWidth] = useState(320),
    [height, setHeight] = useState(320),
    [mode, setMode] = useState("letterbox"),
    [flip, setFlip] = useState("yes"),
    s = useSteps(3),
    r = geometryExperiment(width, height, mode === "letterbox", flip === "yes");
  const current =
    s.step === 0
      ? r.source
      : s.step === 1
        ? r.resized
        : s.step === 2
          ? r.output
          : r.recovered;
  const panel = (
    bx: number,
    by: number,
    w: number,
    h: number,
    b: Box,
    title: string,
    transformed = false,
  ) => {
    const scale = Math.min(270 / w, 190 / h);
    return (
      <g>
        <text x={bx} y={by - 15} className="bio-svg-title">
          {title}
        </text>
        <rect
          x={bx}
          y={by}
          width={w * scale}
          height={h * scale}
          fill="#ecf3ff"
          stroke={muted}
        />
        {transformed && (
          <rect
            x={bx + r.px * scale}
            y={by + r.py * scale}
            width={320 * r.sx * scale}
            height={180 * r.sy * scale}
            fill="white"
            stroke={muted}
            strokeDasharray="5 4"
          />
        )}
        <rect
          x={bx + b[0] * scale}
          y={by + b[1] * scale}
          width={(b[2] - b[0]) * scale}
          height={(b[3] - b[1]) * scale}
          fill="#d7ebe7"
          stroke={teal}
          strokeWidth={3}
        />
        <text x={bx} y={by + 210}>
          {w} × {h} · continuous xyxy
        </text>
      </g>
    );
  };
  return (
    <>
      <h2>Image Geometry：图像变了，annotation 也一起变了吗？</h2>
      <p>
        用 coordinate canvas 代替照片，原始尺寸
        320×180、box=[40,30,180,130]。演示 resize、padding、flip 和 inverse
        transform 的真实坐标计算；没有插值图像，也没有训练检测器。
      </p>
      <div className="bio-controls">
        <Range
          label="Target width"
          value={width}
          min={160}
          max={480}
          step={32}
          set={(v) => {
            setWidth(v);
            s.choose(0);
          }}
          hint="Target canvas 宽度，单位 pixel coordinate。"
        />
        <Range
          label="Target height"
          value={height}
          min={160}
          max={480}
          step={32}
          set={(v) => {
            setHeight(v);
            s.choose(0);
          }}
          hint="改变长宽比，观察 stretch 与 letterbox 的区别。"
        />
        <Choice
          label="Resize rule"
          value={mode}
          set={(v) => {
            setMode(v);
            s.choose(0);
          }}
          options={[
            ["letterbox", "Letterbox：保持比例并居中 padding"],
            ["stretch", "Stretch：x/y 独立缩放"],
          ]}
        />
        <Choice
          label="Horizontal flip"
          value={flip}
          set={(v) => {
            setFlip(v);
            s.choose(0);
          }}
          options={[
            ["yes", "Flip after resize"],
            ["no", "No flip"],
          ]}
        />
      </div>
      {s.controls}
      <p className="bio-equation">
        {
          [
            "Original coordinates",
            "Resize + padding",
            "Optional horizontal flip",
            "Undo flip → remove padding → divide scale",
          ][s.step]
        }
      </p>
      <Plot
        label={`Geometry stage ${s.step}, box ${current.map((x) => f(x, 1)).join(",")}`}
        height={290}
      >
        {panel(20, 45, 320, 180, r.source, "Original annotation")}
        {panel(
          360,
          45,
          s.step === 0 || s.step === 3 ? 320 : width,
          s.step === 0 || s.step === 3 ? 180 : height,
          current,
          "Current stage",
          s.step === 1 || s.step === 2,
        )}
      </Plot>
      <Readout
        values={[
          ["Scale sx / sy", `${f(r.sx)} / ${f(r.sy)}`],
          ["Padding px / py", `${f(r.px, 1)} / ${f(r.py, 1)}`],
          ["Current xyxy", current.map((x) => f(x, 1)).join(", ")],
          [
            "Round-trip max error",
            f(
              Math.max(...r.recovered.map((x, i) => Math.abs(x - r.source[i]))),
              8,
            ),
          ],
        ]}
      />
      <Derivation>
        <p>
          Resize：x′=sx·x+px，y′=sy·y+py。Flip：x₁″=W−x₂′，x₂″=W−x₁′。必须交换
          left/right，不能只改一个 endpoint。
        </p>
        <p>
          最终 output=[{r.output.map((x) => f(x, 1)).join(", ")}]。
          {Math.max(...r.naive.map((x, i) => Math.abs(x - r.source[i]))) > 1e-8
            ? `只除 scale 而忘了 undo flip/padding，会得到错误的 [${r.naive.map((x) => f(x, 1)).join(", ")}]。`
            : "当前没有 padding/flip，直接除 scale 就足够；加入它们后需完整逆序变换。"}
          完整 inverse 恢复 [{r.recovered.map((x) => f(x, 1)).join(", ")}]。
        </p>
        <p>
          在 Resize / Flip 阶段，右图虚线框是 image footprint；框外浅蓝区域是
          padding。
        </p>
        <p>
          这里坐标连续、padding 可为小数；真实 image tensors 会
          rounding，应保存实际 resize 与 pad 数量再 inverse。真实 labels
          还要处理 clipping、空 box、keypoint visibility；categorical masks
          应使用保持类别的 interpolation。
        </p>
      </Derivation>
      <Check
        question="图像 horizontal flip 后，box 只做 x→W−x 而不交换两端可以吗？"
        options={["不可以，会出现 left/right 颠倒", "可以，宽度不会改变"]}
        answer={0}
        why="Transformation 必须同步作用于 image、box、mask 和 keypoints，并保留 inverse metadata。"
      />
      <Notes
        lessons={[
          ["cv-preprocessing-augmentation", "Preprocessing / Augmentation"],
          ["camera-image-formation", "Camera Geometry"],
        ]}
        sources={[
          [
            "https://docs.pytorch.org/vision/main/auto_examples/transforms/plot_transforms_getting_started.html",
            "Torchvision transforms v2",
          ],
        ]}
      >
        <p>
          用于 detection、segmentation、pose preprocessing
          与部署还原。优势是训练输入规范且可做合理
          augmentation；错误几何会悄悄制造 label noise。选择 target size 时比较
          small-object recall、计算预算与有效 stride；只有 label-preserving
          的变换才适合该任务。不要对 OCR、laterality
          或方向有意义的任务无条件随机 flip。
        </p>
      </Notes>
    </>
  );
}
function MCTSLab() {
  const [c, setC] = useState(1),
    [budget, setBudget] = useState(6),
    [right, setRight] = useState(0.5),
    r = mctsExperiment(c, budget, right),
    s = useSteps(r.frames.length - 1),
    a = r.frames[s.step];
  const positions: Record<string, [number, number]> = {
    S: [330, 55],
    A: [180, 155],
    B: [480, 155],
    A0: [85, 280],
    A1: [255, 280],
    B0: [425, 280],
    B1: [595, 280],
  };
  return (
    <>
      <h2>MCTS：一次模拟如何改变下一次搜索？</h2>
      <p>
        一个深度 2 的 synthetic 单人 planning tree。Leaf returns 固定，rollout
        policy 用可复现 seed 选择左右分支。每次 simulation 分成
        Selection、Expansion、Rollout、Backup；这不是 LLM reasoning benchmark。
      </p>
      <div className="bio-controls">
        <Range
          label="UCT exploration c"
          value={c}
          min={0}
          max={2}
          step={0.1}
          set={(v) => {
            setC(v);
            s.choose(0);
          }}
          hint="调节 Q 与 exploration bonus 的相对权重；return 的尺度必须一起考虑。"
        />
        <Range
          label="Simulation budget"
          value={budget}
          min={2}
          max={16}
          step={1}
          set={(v) => {
            setBudget(v);
            s.choose(0);
          }}
          hint="每次模拟有4个阶段；增加预算不等于得到正确环境模型。"
        />
        <Range
          label="Rollout probability of right branch"
          value={right}
          min={0}
          max={1}
          step={0.1}
          set={(v) => {
            setRight(v);
            s.choose(0);
          }}
          hint="只在未展开的 rollout 部分使用，不替代 tree policy 的 UCT。"
        />
      </div>
      {s.controls}
      <p className="bio-equation">
        Simulation {a.simulation} · {a.phase} · UCT=Q+c√(ln Nparent/Nchild)
      </p>
      <Plot label={`MCTS simulation ${a.simulation} ${a.phase}`} height={360}>
        {Object.entries(r.children).flatMap(([parent, kids]) =>
          kids.map((child) => (
            <line
              key={child}
              x1={positions[parent][0]}
              y1={positions[parent][1] + 20}
              x2={positions[child][0]}
              y2={positions[child][1] - 20}
              stroke={a.path.includes(child) ? orange : "#d6dfe9"}
              strokeWidth={a.path.includes(child) ? 4 : 2}
            />
          )),
        )}
        {Object.entries(positions).map(([id, [x, y]]) => (
          <g key={id}>
            <circle
              cx={x}
              cy={y}
              r={23}
              fill={a.stats[id] ? "#ecf3ff" : "white"}
              stroke={a.path.includes(id) ? orange : muted}
              strokeWidth={a.path.includes(id) ? 3 : 1}
            />
            <text x={x} y={y + 5} textAnchor="middle">
              {id}
            </text>
            <text x={x} y={y + 42} textAnchor="middle">
              {a.stats[id]
                ? `N=${a.stats[id].n}, Q=${a.stats[id].n ? f(a.stats[id].w / a.stats[id].n, 2) : "—"}`
                : "not expanded"}
            </text>
            {treeRewards[id] !== undefined && (
              <text x={x} y={y + 64} textAnchor="middle">
                return={treeRewards[id]}
              </text>
            )}
          </g>
        ))}
      </Plot>
      <Readout
        values={[
          ["Root visits", String(a.stats.S.n)],
          ["Current path", a.path.join(" → ")],
          ["Rollout return", a.reward === null ? "not yet" : f(a.reward)],
          [
            "Final action by visits",
            s.step === r.frames.length - 1
              ? r.recommendation
              : "继续推演到预算结束",
          ],
        ]}
      />
      <Derivation>
        <p>{a.note}</p>
        <p>
          当前 root 的 child statistics：
          {["A", "B"]
            .map((id) => {
              const st = a.stats[id];
              return !st?.n
                ? `${id}: unvisited priority`
                : `${id}: Q=${f(st.w / st.n)}, bonus=${f(c * Math.sqrt(Math.log(Math.max(1, a.stats.S.n)) / st.n))}`;
            })
            .join("；")}
          。这是当前 snapshot 的 score，不代表本轮早先 Selection 当时的值。
        </p>
        <p>
          Final action 采用最多 visits（同分 A 优先），不再加入 exploration
          bonus。有限预算可能漏掉最优 branch；此图中 B0=0.9 是最高 leaf
          return，但错误 rollout/value model 会使多算也无助。
        </p>
      </Derivation>
      <Check
        question="Selection 的 UCT 最大 child，是否必须直接作为最终执行动作？"
        options={[
          "不必，探索选择和最终决策规则要分开",
          "必须，exploration bonus 就是实际 reward",
        ]}
        answer={0}
        why="UCT 用于分配 simulation；常见最终选择看 visit counts 或 estimated values，必须明确规则并独立评估。"
      />
      <Notes
        lessons={[
          ["mcts-uct-search", "MCTS / UCT"],
          ["muzero", "MuZero"],
          ["planning-search-astar", "A*"],
        ]}
        sources={[
          [
            "https://aima.cs.berkeley.edu/~russell/classes/cs294/s11/readings/Kocsis%2BSzepesvari%3A2006.pdf",
            "Kocsis & Szepesvári: UCT",
          ],
        ]}
      >
        <p>
          用于可模拟、具有延迟回报的 planning。先固定 simulator、terminal
          condition 与 return convention，再比较 c、budget、rollout/value
          estimation；未访问节点优先展开。优势是按反馈分配搜索计算；代价是
          simulation 昂贵、有限预算有偏差。两人零和游戏的视角转换、stochastic
          transitions 与 discounting 需要另行建模，不能照抄本实验 backup。
        </p>
      </Notes>
    </>
  );
}
function BeamLab() {
  const [width, setWidth] = useState(2),
    [p, setP] = useState(0.6),
    [grammar, setGrammar] = useState("none"),
    s = useSteps(3),
    r = beamExperiment(width, p, grammar === "y"),
    rows = s.step === 0 ? [] : s.step === 1 ? r.first : r.candidates,
    kept = s.step === 1 ? r.firstKept : r.kept;
  return (
    <>
      <h2>Beam Search：每步最可能，为什么不等于整句最可能？</h2>
      <p>
        固定两步 toy language model：首 token A/B；A 后 x/y=.51/.49，B 后
        x/y=.1/.9；两 token 后 EOS=1。所有序列同长度，因此没有 length
        penalty。可开启 toy grammar：第二 token 只能是 y。
      </p>
      <div className="bio-controls">
        <Range
          label="Beam width"
          value={width}
          min={1}
          max={4}
          set={(v) => {
            setWidth(v);
            s.choose(0);
          }}
          hint="Width=1 是本实验的 greedy；保留更多候选仍只优化 model score。"
        />
        <Range
          label="First-token probability P(A)"
          value={p}
          min={0.1}
          max={0.9}
          step={0.05}
          set={(v) => {
            setP(v);
            s.choose(0);
          }}
          hint="固定后续 conditional probabilities，观察局部与全局的分歧。"
        />
        <Choice
          label="Toy grammar"
          value={grammar}
          set={(v) => {
            setGrammar(v);
            s.choose(0);
          }}
          options={[
            ["none", "Unconstrained"],
            ["y", "Second token must be y"],
          ]}
        />
      </div>
      {s.controls}
      <p className="bio-equation">
        {
          [
            "Start",
            "Step 1: expand A/B and prune",
            "Step 2: expand surviving prefixes",
            "Final: retain best sequences",
          ][s.step]
        }{" "}
        · log P(sequence)=Σ log P(token | prefix)
      </p>
      <Plot label={`Beam tree width ${width} stage ${s.step}`} height={320}>
        <circle cx={50} cy={150} r={18} fill="#ecf3ff" stroke={blue} />
        <text x={50} y={155} textAnchor="middle">
          S
        </text>
        {["A", "B"].map((id, i) => (
          <g key={id}>
            <line x1={70} y1={150} x2={240} y2={85 + i * 135} stroke={blue} />
            <text x={125} y={105 + i * 90}>
              p={f(id === "A" ? p : 1 - p, 2)}
            </text>
            <circle
              cx={260}
              cy={85 + i * 135}
              r={22}
              fill={
                s.step >= 1 && r.firstKept.some((x) => x.text === id)
                  ? "#d7ebe7"
                  : "white"
              }
              stroke={blue}
            />
            <text x={260} y={90 + i * 135} textAnchor="middle">
              {id}
            </text>
            {["x", "y"].map((token, j) => {
              const text = id + token,
                prob = r.all.find((x) => x.text === text)?.p,
                hit = s.step >= 2 && r.candidates.some((x) => x.text === text);
              return (
                <g key={token}>
                  <line
                    x1={283}
                    y1={85 + i * 135}
                    x2={530}
                    y2={45 + i * 140 + j * 65}
                    stroke={hit ? teal : "#d6dfe9"}
                    strokeDasharray={prob === undefined ? "5 4" : undefined}
                  />
                  <rect
                    x={535}
                    y={25 + i * 140 + j * 65}
                    width={90}
                    height={40}
                    fill={
                      s.step === 3 && r.kept.some((x) => x.text === text)
                        ? "#d7ebe7"
                        : "white"
                    }
                    stroke={hit ? teal : muted}
                  />
                  <text x={580} y={50 + i * 140 + j * 65} textAnchor="middle">
                    {text}
                  </text>
                  <text x={360} y={42 + i * 140 + j * 65}>
                    {prob === undefined ? "masked" : `joint=${f(prob)}`}
                  </text>
                </g>
              );
            })}
          </g>
        ))}
      </Plot>
      <div
        className="ai-lab-table"
        role="region"
        aria-label="Beam candidate scores"
        tabIndex={0}
      >
        <table>
          <caption>当前候选：probability、log score 与 prune decision</caption>
          <thead>
            <tr>
              <th>Prefix</th>
              <th>P</th>
              <th>log P</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((x) => (
              <tr key={x.text}>
                <td>{x.text}</td>
                <td>{f(x.p, 5)}</td>
                <td>{f(Math.log(x.p))}</td>
                <td>
                  {s.step === 2
                    ? "expanded"
                    : kept.some((k) => k.text === x.text)
                      ? "kept"
                      : "pruned"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Readout
        values={[
          ["Beam result", s.step === 3 ? r.best.text : "继续推演"],
          ["Beam probability", s.step === 3 ? f(r.best.p) : "pending"],
          ["Exact toy optimum", r.oracle.text],
          ["Exact optimum P", f(r.oracle.p)],
        ]}
      />
      <Derivation>
        <p>
          默认无 constraint：greedy 先选 A，再选 x，P(Ax)=.6×.51=.306；width=2
          保留 B，找到 P(By)=.4×.9=.36。真实长序列中有限 beam 仍可丢失全局最优。
        </p>
        <p>
          {grammar === "y"
            ? `Grammar 在每个 prefix 把 x 的 probability 置零，再归一化，因而 P(y|A)=P(y|B)=1。Local masking 给 P(Ay)=${f(p)}；原模型在完整合法序列上的 conditional P(Ay | ends in y)=${f((p * 0.49) / (p * 0.49 + (1 - p) * 0.9))}。两者通常不同；当前分数属于 masked distribution。`
            : "这里没有 sampling；temperature/top-p 与 beam width 是不同机制。EOS、长度归一化与重复限制会改变真实 decoder 的搜索目标。"}
        </p>
      </Derivation>
      <Check
        question="Grammar 保证生成符合结构，就能保证字段事实正确吗？"
        options={["不能，结构和事实要分别验证", "能，合法结构等价于正确答案"]}
        answer={0}
        why="Schema/grammar constraints 限制可输出 token；仍要验证业务语义、事实来源和 tool execution outcome。"
      />
      <Notes
        lessons={[
          ["beam-search-decoding", "Beam Search"],
          ["grammar-constrained-decoding", "Constrained Decoding"],
          ["autoregressive-inference", "Autoregressive Inference"],
        ]}
        sources={[
          [
            "https://huggingface.co/docs/transformers/en/generation_strategies",
            "Transformers generation strategies",
          ],
        ]}
      >
        <p>
          用于有明确 sequence score 的候选搜索，以及需要结构约束的输出。比较
          beam width、max_new_tokens、EOS/length policy 与
          latency；验证任务分数和错误类型，不能只看 model likelihood。此处
          grammar 只是固定位置 token mask，不实现完整 JSON
          parser，也不调用语言模型。
        </p>
      </Notes>
    </>
  );
}
const views = {
  hmm: HMMLab,
  kalman: KalmanLab,
  assignment: AssignmentLab,
  geometry: GeometryLab,
  mcts: MCTSLab,
  beam: BeamLab,
};
const names = {
  hmm: "HMM",
  kalman: "Kalman Filter",
  assignment: "Hungarian Assignment",
  geometry: "Image Geometry",
  mcts: "MCTS / UCT",
  beam: "Beam / Constraints",
};
export default function AIDepthLab({ query }: { query: string }) {
  const raw = new URLSearchParams(query).get("lab") || "hmm",
    kind = Object.hasOwn(views, raw) ? (raw as keyof typeof views) : "hmm",
    View = views[kind];
  return (
    <main className="bio-lab ai-depth page-gutter">
      <header>
        <a href="#/landscape">← AI 全景</a>
        <h1>跟着中间量，把算法算清楚。</h1>
        <p>
          六个 synthetic
          算法实验。先改变一个假设，再逐步看状态、概率、坐标与候选如何变化；图中的数值由浏览器实时计算。播放可以随时暂停，所有步骤也可手动查看。
        </p>
      </header>
      <nav className="bio-lab-tabs" aria-label="Algorithm depth experiments">
        {Object.entries(names).map(([id, name]) => (
          <a
            key={id}
            href={`#/ai-depth?lab=${id}`}
            aria-current={kind === id ? "page" : undefined}
          >
            {name}
          </a>
        ))}
      </nav>
      <section className="bio-experiment" key={kind}>
        <View />
      </section>
      <footer className="bio-lab-footer">
        <a href="#/animations">在全站实验目录中继续学习 →</a>
        <p>
          <a href="#/ai-labs?lab=tree">Tree、A*、NMS 与 Retrieval 实验 →</a>
        </p>
      </footer>
    </main>
  );
}
