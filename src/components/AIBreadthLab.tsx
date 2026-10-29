import { useEffect, useId, useState, type ReactNode } from "react";
import {
  treeSplitExperiment,
  astarExperiment,
  searchEdges,
  searchHeuristic,
  searchNodes,
  nmsExperiment,
  boxIoU,
  rrfExperiment,
  reliabilityExperiment,
} from "./aiBreadthMath";
import "./bio-algorithms.css";
import "./ai-labs.css";
const names = {
  tree: "Decision Tree",
  search: "A* Search",
  nms: "IoU / NMS",
  retrieval: "Hybrid Retrieval",
  reliability: "Agent Reliability",
};
type Kind = keyof typeof names;
const blue = "#245fbd",
  teal = "#167b73",
  orange = "#a75224",
  purple = "#7855a2";
const f = (x: number, n = 3) =>
  x !== 0 && Math.abs(x) < 0.0005 ? x.toExponential(2) : x.toFixed(n);
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
  set: (n: number) => void;
  hint: string;
}) {
  return (
    <label className="bio-range">
      <span>
        {label}
        <output>
          {f(value, Number.isInteger(value) && Number.isInteger(step) ? 0 : 2)}
        </output>
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
  set,
  options,
}: {
  label: string;
  value: string;
  set: (s: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="bio-choice">
      {label}
      <select
        aria-label={label}
        value={value}
        onChange={(e) => set(e.target.value)}
      >
        {options.map(([id, t]) => (
          <option key={id} value={id}>
            {t}
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
      role="region"
      aria-label={`${label}，可横向滚动`}
      tabIndex={0}
    >
      <span className="ai-plot-hint">图表可左右滑动查看。</span>
      <svg viewBox={`0 0 660 ${height}`} aria-label={label} role="img">
        {children}
      </svg>
    </div>
  );
}
function Readout({ values }: { values: [string, string][] }) {
  return (
    <dl className="bio-readout">
      {values.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
function Check({
  question,
  options,
  answer,
  why,
}: {
  question: string;
  options: string[];
  answer: number;
  why: string;
}) {
  const id = useId(),
    [selected, setSelected] = useState(-1),
    [checked, setChecked] = useState(false);
  return (
    <fieldset className="bio-question">
      <legend>先预测：{question}</legend>
      {options.map((option, i) => (
        <label key={option}>
          <input
            type="radio"
            name={id}
            checked={selected === i}
            onChange={() => {
              setSelected(i);
              setChecked(false);
            }}
          />
          {option}
        </label>
      ))}
      <button disabled={selected < 0} onClick={() => setChecked(true)}>
        检查理解
      </button>
      {checked && (
        <p role="status">
          {selected === answer ? "正确。" : "对照中间量再想一遍。"}
          {why}
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
    <details className="bio-notes">
      <summary>什么时候用、如何设置、优缺点与边界</summary>
      {children}
      <p>
        相关课程：
        {lessons.map(([id, t]) => (
          <a key={id} href={`#/lesson/${id}`}>
            {t} →
          </a>
        ))}
      </p>
      <p>
        Primary sources：
        {sources.map(([url, t]) => (
          <a key={url} href={url} target="_blank" rel="noreferrer">
            {t} ↗
          </a>
        ))}
      </p>
    </details>
  );
}
function useSteps(max: number) {
  const [step, setStep] = useState(0),
    [playing, setPlaying] = useState(false),
    [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setReduced(m.matches);
      if (m.matches) setPlaying(false);
    };
    sync();
    m.addEventListener("change", sync);
    return () => m.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setStep((s) => Math.min(max, s + 1)), 1800);
    const pause = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener("visibilitychange", pause);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", pause);
    };
  }, [playing, max]);
  useEffect(() => {
    if (step >= max) setPlaying(false);
  }, [step, max]);
  const choose = (n: number) => {
    setPlaying(false);
    setStep(n);
  };
  return {
    step: Math.min(step, max),
    choose,
    controls: (
      <div className="bio-stepper">
        <button disabled={step === 0} onClick={() => choose(step - 1)}>
          ← 上一步
        </button>
        <output aria-live={playing ? "off" : "polite"}>
          Step {Math.min(step, max)} / {max}
        </output>
        <button disabled={step >= max} onClick={() => choose(step + 1)}>
          下一步 →
        </button>
        <button
          disabled={reduced || max === 0}
          onClick={() => {
            if (step >= max) setStep(0);
            setPlaying(!playing);
          }}
        >
          {playing ? "暂停" : "播放推演"}
        </button>
        <button onClick={() => choose(0)}>回到起点</button>
        {reduced && <small>Reduced motion：使用手动步骤。</small>}
      </div>
    ),
  };
}

function TreeLab() {
  const [cut, setCut] = useState(4.5),
    [leaf, setLeaf] = useState(1),
    [criterion, setCriterion] = useState<"gini" | "entropy">("gini");
  const r = treeSplitExperiment(cut, leaf, criterion),
    s = r.selected;
  const max = Math.max(...r.candidates.map((c) => c.gain), 0.001);
  return (
    <>
      <h2>Decision Tree 为什么选择这一刀？</h2>
      <p>
        八个 synthetic 样本的 x=1…8，labels=[0,0,1,0,1,1,0,1]。只拟合一个
        split，计算两侧 impurity 的加权平均；这还不是完整 Decision
        Tree，也没有独立 test score。
      </p>
      <div className="bio-controls">
        <Range
          label="Split threshold"
          min={1.5}
          max={7.5}
          step={1}
          value={cut}
          set={setCut}
          hint="x ≤ threshold 去左侧，否则去右侧。"
        />
        <Range
          label="Minimum samples per leaf"
          min={1}
          max={4}
          value={leaf}
          set={setLeaf}
          hint="任一侧样本数太少，该 split 就不可用。"
        />
        <Choice
          label="Impurity criterion"
          value={criterion}
          set={(v) => setCriterion(v as "gini" | "entropy")}
          options={[
            ["gini", "Gini：2p(1−p)"],
            ["entropy", "Entropy：−Σp log₂p"],
          ]}
        />
        <button
          onClick={() => {
            setCut(4.5);
            setLeaf(1);
            setCriterion("gini");
          }}
        >
          恢复参数
        </button>
      </div>
      <p className="bio-equation">
        Gain = I(parent) − [nL I(left) + nR I(right)] / N
      </p>
      <Plot
        label={`Split at ${cut}; left ${s.left.length}, right ${s.right.length}`}
        height={245}
      >
        <text x={20} y={26} className="bio-svg-title">
          在同一份 training data 上比较 cut
        </text>
        <line
          x1={40 + cut * 70}
          x2={40 + cut * 70}
          y1={50}
          y2={190}
          stroke={orange}
          strokeDasharray="5 4"
        />
        {r.rows.map((row) => (
          <g key={row.x}>
            <circle
              cx={40 + row.x * 70}
              cy={110}
              r={22}
              fill={row.y === 0 ? "#fff" : "#dbe9fc"}
              stroke={row.y === 0 ? teal : blue}
              strokeWidth={2}
            />
            <text x={40 + row.x * 70} y={115} textAnchor="middle">
              {row.y}
            </text>
            <text x={40 + row.x * 70} y={160} textAnchor="middle">
              x={row.x}
            </text>
          </g>
        ))}
        <text x={20} y={218}>
          圈内为 class label；虚线为 threshold。图中颜色不是模型预测。
        </text>
      </Plot>
      <Plot
        label={`Candidate split ${criterion} gains, best eligible threshold ${r.best.cut}`}
        height={365}
      >
        <text x={20} y={26} className="bio-svg-title">
          所有 candidate cuts：以有效 splits 的最大 gain 选择
        </text>
        {r.candidates.map((c, i) => (
          <g key={c.cut}>
            <text x={20} y={66 + i * 40}>
              cut={c.cut}
            </text>
            <rect
              x={125}
              y={49 + i * 40}
              width={(350 * c.gain) / max}
              height={23}
              fill={!c.valid ? "#c3ccd7" : c.cut === cut ? orange : blue}
            />
            <text x={490} y={66 + i * 40}>
              {f(c.gain)} {c.valid ? "" : "invalid"}
            </text>
          </g>
        ))}
      </Plot>
      <Readout
        values={[
          ["Parent impurity", f(r.parent)],
          ["Weighted child impurity", f(s.child)],
          [
            "Selected gain",
            `${f(s.gain)}${s.valid ? "" : " · 不满足 min leaf"}`,
          ],
          ["Best eligible cut", String(r.best.cut)],
        ]}
      />
      <p className="bio-interpretation">
        Left n={s.left.length}、I={f(s.leftImpurity)}；Right n={s.right.length}
        、I={f(s.rightImpurity)}。Best cut 同分时取较小 threshold。更大 training
        gain 只说明此节点更纯，不自动证明泛化更好。
      </p>
      <Check
        question="min leaf=4 时，还能选择 cut=2.5 吗？"
        options={["能，只要 gain 大", "不能，左侧只有2个样本"]}
        answer={1}
        why="Complexity constraints 先确定可行 splits。正则化可牺牲 training fit 来降低不稳定性，效果仍需独立 validation。"
      />
      <Notes
        lessons={[
          ["decision-tree-splits", "Decision Tree"],
          ["boosting-families", "Boosting families"],
        ]}
        sources={[
          [
            "https://scikit-learn.org/stable/modules/tree.html",
            "Decision Trees",
          ],
        ]}
      >
        <p>
          适用于理解 tree split 和 min_samples_leaf。真实模型还需
          max_depth、pruning、missing values 与 categorical feature 处理。先比较
          shallow tree、forest 与 boosting，固定 split 后再调参数。
        </p>
        <p>
          优势是规则清楚、无需依靠 feature
          scaling；单树通常方差较大、对小数据变化敏感。Feature importance
          也不能直接解释为 causal influence。Entropy 单位为 bits，Gini 是另一种
          impurity，不应跨 criterion 直接比 gain 大小。
        </p>
      </Notes>
    </>
  );
}

function SearchLab() {
  const [weight, setWeight] = useState(1),
    r = astarExperiment(weight),
    seq = useSteps(r.trace.length - 1),
    s = r.trace[seq.step];
  const pos: Record<string, [number, number]> = {
    S: [55, 145],
    A: [230, 65],
    B: [225, 235],
    C: [380, 235],
    D: [505, 145],
    G: [610, 65],
  };
  const activePath = s.done ? s.current!.path : [];
  return (
    <>
      <h2>A* 怎样决定下一步展开谁？</h2>
      <p>
        固定一张六节点 directed graph。g 是已经付出的 cost，h 是手工给定的剩余
        cost estimate。改变 weight，比较 Uniform-cost、A* 与 Weighted A*
        的队列顺序和最终路径。
      </p>
      <div className="bio-controls">
        <Range
          label="Heuristic weight w"
          value={weight}
          min={0}
          max={3}
          step={0.5}
          set={(v) => {
            setWeight(v);
            seq.choose(0);
          }}
          hint="w=0 为 Uniform-cost；w=1 为 A*；w>1 是 Weighted A*。"
        />
      </div>
      <p className="bio-equation">
        Priority f(n)=g(n)+w h(n)；每次从 frontier 取最小 f，改进 g 时允许更新 /
        reopen。
      </p>
      {seq.controls}
      <Plot
        label={`Search graph, current node ${s.current?.node ?? "none"}, popped ${s.visited.join(",")}`}
        height={315}
      >
        <text x={20} y={26} className="bio-svg-title">
          Directed graph · edge labels 为 cost
        </text>
        <defs>
          <marker
            id="ai-search-arrow"
            markerWidth="7"
            markerHeight="7"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0 0L6 3L0 6" fill="none" stroke="#60708b" />
          </marker>
        </defs>
        {searchEdges.map(([a, b, cost]) => {
          const [x1, y1] = pos[a],
            [x2, y2] = pos[b],
            norm = Math.hypot(x2 - x1, y2 - y1),
            dx = (x2 - x1) / norm,
            dy = (y2 - y1) / norm,
            used = activePath.some(
              (p, i) => p === a && activePath[i + 1] === b,
            );
          return (
            <g key={a + b}>
              <line
                x1={x1 + dx * 23}
                y1={y1 + dy * 23}
                x2={x2 - dx * 25}
                y2={y2 - dy * 25}
                stroke={used ? orange : "#93a9c4"}
                strokeWidth={used ? 4 : 1.5}
                markerEnd="url(#ai-search-arrow)"
              />
              <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 8} textAnchor="middle">
                {cost}
              </text>
            </g>
          );
        })}
        {searchNodes.map((n) => (
          <g key={n}>
            <circle
              cx={pos[n][0]}
              cy={pos[n][1]}
              r={22}
              fill={
                s.current?.node === n
                  ? "#faeadf"
                  : s.visited.includes(n)
                    ? "#dbe9fc"
                    : "#fff"
              }
              stroke={blue}
            />
            <text x={pos[n][0]} y={pos[n][1] + 5} textAnchor="middle">
              {n}
            </text>
            <text x={pos[n][0]} y={pos[n][1] + 43} textAnchor="middle">
              h={searchHeuristic[n]}
            </text>
          </g>
        ))}
      </Plot>
      <div
        className="ai-lab-table"
        tabIndex={0}
        role="region"
        aria-label="当前 frontier 数值"
      >
        <table>
          <caption>
            Frontier after step {seq.step} · 按 f 排序，同分按 node name
          </caption>
          <thead>
            <tr>
              <th>Node</th>
              <th>g</th>
              <th>h</th>
              <th>f = g + wh</th>
              <th>Path</th>
            </tr>
          </thead>
          <tbody>
            {s.frontier.map((e) => (
              <tr key={e.node}>
                <td>{e.node}</td>
                <td>{f(e.g, 1)}</td>
                <td>{searchHeuristic[e.node]}</td>
                <td>{f(e.f, 1)}</td>
                <td>{e.path.join(" → ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {s.frontier.length === 0 && <p>Frontier 为空。</p>}
      </div>
      <Readout
        values={[
          ["当前 popped node", s.current?.node ?? "尚未取出"],
          ["Popped nodes", String(s.visited.length)],
          ["Goal path", s.done ? s.current!.path.join(" → ") : "继续推演到 G"],
          ["Returned cost", s.done ? String(s.current!.g) : "尚未返回"],
        ]}
      />
      <p className="bio-interpretation">
        该图的最低 cost 是 5，经 S→B→C→D→G；h 没有高估真实剩余 cost。w=3
        时会更偏向看似近的 A，提前返回 cost=8 的 G。图中 h
        是预先指定，不是运行神经网络预测的数值。
      </p>
      <Check
        question="把 w 从1调到3，能否仍无条件保证最短路径？"
        options={[
          "可以，heuristic 越强越准确",
          "不可以，搜索顺序与保证条件改变了",
        ]}
        answer={1}
        why="Admissible/consistent base heuristic 是标准 A* 保证的重要条件。加权后不能直接沿用同一个 optimality 结论；此例可看到更少 popped nodes 与更高 cost 的取舍。"
      />
      <Notes
        lessons={[
          ["planning-search-astar", "A* Search"],
          ["agent-workflows", "Agent / Workflow"],
        ]}
        sources={[
          [
            "https://artint.info/3e/html/ArtInt3e.Ch3.S6.html",
            "Poole & Mackworth: Heuristic Search",
          ],
        ]}
      >
        <p>
          适用于已知 state transitions/cost 的 planning。先写正确 state、goal
          test、edge cost 和 duplicate handling；这里 nonnegative costs、finite
          graph、goal 在 pop 时判断。不要在第一次生成 goal 时提前认定最佳。
        </p>
        <p>
          Search 不需要训练。优势是规则清楚、条件满足时有可证明性质；局限是
          state explosion 和 heuristic 构造成本。LLM Agent 可调用
          search，但它的自然语言 plan 不自动具备 A* 的保证。
        </p>
      </Notes>
    </>
  );
}

function NMSLab() {
  const [iou, setIoU] = useState(0.45),
    [score, setScore] = useState(0.5),
    [aware, setAware] = useState("yes"),
    [shift, setShift] = useState(8);
  const r = nmsExperiment(iou, score, aware === "yes", shift),
    seq = useSteps(r.trace.length - 1),
    s = r.trace[seq.step],
    colors = [blue, teal, purple, orange];
  return (
    <>
      <h2>两个框都很自信，为什么只留下一个？</h2>
      <p>
        四个 synthetic boxes 已有固定 scores 和 class labels。先按 score
        threshold 过滤，再逐步挑最高分并抑制重叠框。这里只运行
        post-processing，没有检测网络、ground truth 或 mAP。
      </p>
      <div className="bio-controls">
        <Range
          label="NMS IoU threshold"
          value={iou}
          min={0}
          max={1}
          step={0.05}
          set={(v) => {
            setIoU(v);
            seq.choose(0);
          }}
          hint="仅当 IoU 严格大于 threshold 时抑制。"
        />
        <Range
          label="Score threshold"
          value={score}
          min={0.1}
          max={1}
          step={0.05}
          set={(v) => {
            setScore(v);
            seq.choose(0);
          }}
          hint="先排除 score < threshold 的 boxes。"
        />
        <Range
          label="Box B horizontal shift"
          value={shift}
          min={0}
          max={40}
          step={2}
          set={(v) => {
            setShift(v);
            seq.choose(0);
          }}
          hint="改变 box B 的横坐标，直接改变 intersection 与 union。"
        />
        <Choice
          label="NMS class rule"
          value={aware}
          set={(v) => {
            setAware(v);
            seq.choose(0);
          }}
          options={[
            ["yes", "Class-aware：只在同类之间抑制"],
            ["no", "Class-agnostic：所有类共同竞争"],
          ]}
        />
      </div>
      <p className="bio-equation">
        IoU = intersection area / union area；坐标为 continuous xyxy，不采用
        inclusive-pixel 的 +1。
      </p>
      {seq.controls}
      <Plot
        label={`Boxes at NMS step ${seq.step}; kept ${s.kept.join(",") || "none"}`}
        height={310}
      >
        <text x={20} y={26} className="bio-svg-title">
          Boxes：实线 retained/pending，虚线 suppressed/filtered
        </text>
        {r.boxes.map((b, i) => {
          const inactive =
              s.suppressed.some((x) => x.id === b.id) ||
              r.filtered.includes(b.id),
            [x1, y1, x2, y2] = b.xyxy;
          return (
            <g key={b.id}>
              <rect
                x={35 + x1 * 3}
                y={45 + y1 * 2}
                width={(x2 - x1) * 3}
                height={(y2 - y1) * 2}
                stroke={colors[i]}
                fill={s.kept.includes(b.id) ? colors[i] : "none"}
                fillOpacity={0.08}
                strokeWidth={s.kept.includes(b.id) ? 4 : 2}
                strokeDasharray={inactive ? "6 4" : undefined}
                opacity={inactive ? 0.35 : 1}
              />
              <text x={20 + i * 160} y={260} style={{ fill: colors[i] }}>
                {b.id} · {b.label} · {b.score}
              </text>
              <text x={20 + i * 160} y={284}>
                {r.filtered.includes(b.id)
                  ? "filtered"
                  : s.kept.includes(b.id)
                    ? "kept"
                    : s.suppressed.some((x) => x.id === b.id)
                      ? "suppressed"
                      : "pending"}
              </text>
            </g>
          );
        })}
      </Plot>
      <Plot
        label={`Pairwise IoU matrix, A-B ${f(boxIoU(r.boxes[0].xyxy, r.boxes[1].xyxy))}`}
        height={300}
      >
        <text x={20} y={26} className="bio-svg-title">
          Pairwise IoU · class label 不改变几何重叠
        </text>
        {r.boxes.map((a, i) => (
          <g key={a.id}>
            <text x={130 + i * 105} y={57}>
              {a.id}
            </text>
            <text x={80} y={96 + i * 52}>
              {a.id}
            </text>
            {r.boxes.map((b, j) => {
              const v = boxIoU(a.xyxy, b.xyxy);
              return (
                <g key={b.id}>
                  <rect
                    x={110 + j * 105}
                    y={73 + i * 52}
                    width={95}
                    height={43}
                    fill={blue}
                    fillOpacity={v * 0.28}
                  />
                  <text x={155 + j * 105} y={99 + i * 52} textAnchor="middle">
                    {f(v)}
                  </text>
                </g>
              );
            })}
          </g>
        ))}
      </Plot>
      <Readout
        values={[
          ["A / B IoU", f(boxIoU(r.boxes[0].xyxy, r.boxes[1].xyxy))],
          ["Kept so far", s.kept.join(", ") || "none"],
          [
            "Suppressed so far",
            s.suppressed.map((x) => `${x.id} by ${x.by}`).join("; ") || "none",
          ],
          ["Score-filtered", r.filtered.join(", ") || "none"],
        ]}
      />
      <p className="bio-interpretation">
        {s.suppressed
          .map(
            (x) =>
              `${x.id} 与 ${x.by} 的 IoU=${f(x.iou)} > ${f(iou)}，所以被抑制。`,
          )
          .join(" ") ||
          "查看当前 class rule 是否允许 suppression；若所有 boxes 都被 score threshold 过滤，应先降低该 threshold。"}{" "}
        相邻真实对象也可能重叠；NMS 不能凭几何识别哪个框对应哪个实例。
      </p>
      <Check
        question="NMS threshold 与 evaluation IoU threshold 是同一用途吗？"
        options={[
          "不是：前者删预测框，后者判断预测与真值的匹配",
          "是：两个都只影响 mAP 计算",
        ]}
        answer={0}
        why="Score threshold、NMS IoU、evaluation IoU 是三个不同设置。先固定 evaluation protocol，再在 validation set 调 post-processing。"
      />
      <Notes
        lessons={[
          ["detection-metrics-nms", "Detection metrics"],
          ["multi-object-tracking", "Tracking"],
        ]}
        sources={[
          [
            "https://docs.pytorch.org/vision/stable/generated/torchvision.ops.nms.html",
            "Torchvision NMS",
          ],
        ]}
      >
        <p>
          优点是简单、快速且可解释；拥挤场景容易 suppress 真对象。比较
          class-aware NMS、Soft-NMS 与 detector 自身的 matching 方式；不是所有
          DETR-style 模型都必须再做 NMS。
        </p>
        <p>
          Score 不是自动校准概率；先核 box format 与尺度，检查 per-class score
          distribution。Soft-NMS、batched implementation、score tie
          的行为按实际库验证，本例 scores 无并列。
        </p>
      </Notes>
    </>
  );
}

function RetrievalLab() {
  const [k, setK] = useState(10),
    [depth, setDepth] = useState(4),
    [weight, setWeight] = useState(1),
    [top, setTop] = useState(3);
  const r = rrfExperiment(k, depth, weight, top),
    max = Math.max(...r.ranking.map((x) => x.score));
  return (
    <>
      <h2>Keyword 与 Dense retrieval 排名不同，怎样合并？</h2>
      <p>
        固定两份 synthetic rankings：Keyword=[A,B,C,D]，Dense=[B,E,C,A]。RRF
        融合 rank，避免直接相加不同尺度的原始 scores。只有 C/E 在这个教学 query
        的独立 relevance labels 中相关。
      </p>
      <div className="bio-controls">
        <Range
          label="RRF constant k"
          value={k}
          min={1}
          max={60}
          set={setK}
          hint="与 nearest-neighbor top-k 不是同一个参数。"
        />
        <Range
          label="Candidate depth per retriever"
          value={depth}
          min={1}
          max={4}
          set={setDepth}
          hint="先截断每份候选，再融合；缺失 document 的对应 contribution 为0。"
        />
        <Range
          label="Dense contribution weight"
          value={weight}
          min={0.25}
          max={2}
          step={0.25}
          set={setWeight}
          hint="1 是等权 RRF；其他值是加权扩展。"
        />
        <Range
          label="Output top K"
          value={top}
          min={1}
          max={5}
          set={setTop}
          hint="最多只能返回当前 candidate union 中的 documents。"
        />
      </div>
      <p className="bio-equation">
        score(d) = 1/(k+rank_keyword) + w/(k+rank_dense)；缺失项不参与。
      </p>
      <div className="ai-retrieval-lists">
        <p>
          <strong>Keyword candidates</strong>
          {r.keyword.join(" → ")}
        </p>
        <p>
          <strong>Dense candidates</strong>
          {r.dense.join(" → ")}
        </p>
      </div>
      <Plot
        label={`RRF contributions and ranking ${r.ranking.map((x) => x.id).join(", ")}`}
        height={95 + r.ranking.length * 44}
      >
        <text x={20} y={26} className="bio-svg-title">
          Blue = Keyword · Teal = Dense · 分数不是 probability
        </text>
        {r.ranking.map((row, i) => (
          <g key={row.id}>
            <text x={20} y={74 + i * 44}>
              #{i + 1} {row.id}
            </text>
            <rect
              x={110}
              y={56 + i * 44}
              width={(row.lexical / max) * 360}
              height={26}
              fill={blue}
            />
            <rect
              x={110 + (row.lexical / max) * 360}
              y={56 + i * 44}
              width={(row.semantic / max) * 360}
              height={26}
              fill={teal}
            />
            <text x={485} y={74 + i * 44}>
              {f(row.score, 4)}
              {i < top ? " · returned" : ""}
            </text>
          </g>
        ))}
      </Plot>
      <Readout
        values={[
          ["Candidate union", r.ranking.map((x) => x.id).join(", ")],
          ["Output", r.retrieved.map((x) => x.id).join(" → ")],
          ["Candidate recall", `${r.candidateRecall * 100}%`],
          ["Returned recall", `${r.recall * 100}%`],
        ]}
      />
      <details className="bio-notes">
        <summary>逐 document 核算 contribution</summary>
        {r.ranking.map((x) => (
          <p key={x.id}>
            {x.id}：Keyword rank={x.keywordRank || "absent"}、Dense rank=
            {x.denseRank || "absent"}；{f(x.lexical, 5)} + {f(x.semantic, 5)} ={" "}
            {f(x.score, 5)}
          </p>
        ))}
      </details>
      <p className="bio-interpretation">
        Relevance labels C/E 只用于 evaluation，不进入 RRF 分数。降低 candidate
        depth 可以让相关文档完全消失；后面的 reranker 或 LLM
        无法从这个候选集合中恢复它。这里没有实际 embedding model、BM25 或
        cross-encoder。
      </p>
      <Check
        question="Candidate recall=0 时，只换更强 reranker 能补回缺失文档吗？"
        options={[
          "不能，先改善 candidate generation",
          "能，reranker 会搜索整个 corpus",
        ]}
        answer={0}
        why="Reranker 通常只重排传入 candidates；检索召回与排序质量必须分开检查。"
      />
      <Notes
        lessons={[
          ["hybrid-retrieval-reranking", "Hybrid retrieval"],
          ["retrieval-augmented-generation", "RAG"],
        ]}
        sources={[
          [
            "https://cormack.uwaterloo.ca/cormacksigir09-rrf.pdf",
            "RRF original paper",
          ],
        ]}
      >
        <p>
          适合融合异构检索器；优点是不要求它们原始 scores 可比。缺点是丢掉 score
          margin，而且更多候选会增加 reranking/context 成本。
        </p>
        <p>
          从 keyword-only、dense-only、等权 RRF baselines 开始，按 query type 测
          recall、ranking quality、latency 与 grounded answers。k=60
          是原论文的固定实验设置，不是所有 corpus
          的最优值；chunking、deduplication 与 document permissions 要独立核对。
        </p>
      </Notes>
    </>
  );
}

function ReliabilityLab() {
  const [stages, setStages] = useState(5),
    [p, setP] = useState(0.9),
    [attempts, setAttempts] = useState(1),
    [outage, setOutage] = useState(0.1);
  const r = reliabilityExperiment(stages, p, attempts, outage);
  const xp = (i: number) => 75 + (i * 510) / Math.max(1, stages - 1),
    yp = (v: number) => 230 - v * 160;
  return (
    <>
      <h2>每一步 90% 成功，整个 Agent 就有 90% 吗？</h2>
      <p>
        一个 synthetic workflow 有 n 个必须全部完成的
        stages，失败就停止。在没有共同故障时，每次 attempt 以 p 独立成功，每
        stage 最多 a 次 attempts。再加入 probability c 的共同
        outage：它发生时第一 stage 的所有 attempts 都失败。
      </p>
      <div className="bio-controls">
        <Range
          label="Required stages n"
          value={stages}
          min={2}
          max={8}
          set={setStages}
          hint="所有 stages 都成功才算 workflow 完成。"
        />
        <Range
          label="Conditional attempt success p"
          value={p}
          min={0.5}
          max={1}
          step={0.05}
          set={setP}
          hint="条件为没有共同 outage；现实中必须测量，不能假定各次独立。"
        />
        <Range
          label="Max attempts per stage a"
          value={attempts}
          min={1}
          max={3}
          set={setAttempts}
          hint="包含首次 attempt；a=2 意味着最多重试一次。"
        />
        <Range
          label="Common outage probability c"
          value={outage}
          min={0}
          max={0.3}
          step={0.05}
          set={setOutage}
          hint="同一个 outage 让本次 workflow 的所有 attempts 不可成功。"
        />
      </div>
      <p className="bio-equation">
        q=1−(1−p)ᵃ；P(success)=(1−c)qⁿ。可靠性取决于失败结构，不只取决于每步平均数。
      </p>
      <Plot
        label={`Workflow success ${f(r.success)} with ${stages} stages`}
        height={310}
      >
        <text x={20} y={26} className="bio-svg-title">
          到第 i 个 stage 全部成功的 probability
        </text>
        {[0, 0.5, 1].map((v) => (
          <g key={v}>
            <line x1={65} y1={yp(v)} x2={600} y2={yp(v)} stroke="#d6dfe9" />
            <text x={55} y={yp(v) + 5} textAnchor="end">
              {v}
            </text>
          </g>
        ))}
        {(["oneTry", "retry", "withOutage"] as const).map((key, j) => (
          <polyline
            key={key}
            points={r.stageSuccess
              .map((v, i) => `${xp(i)},${yp(v[key])}`)
              .join(" ")}
            fill="none"
            stroke={["#60708b", blue, orange][j]}
            strokeWidth={2.5}
            strokeDasharray={j === 0 ? "5 4" : undefined}
          />
        ))}
        {r.stageSuccess.map((v, i) => (
          <text key={v.stage} x={xp(i)} y={253} textAnchor="middle">
            {v.stage}
          </text>
        ))}
        <text x={20} y={290}>
          Dashed: one attempt · Blue: retries · Orange: retries + outage
        </text>
      </Plot>
      <Readout
        values={[
          ["Stage success q", `${f(r.q * 100, 1)}%`],
          ["Workflow success", `${f(r.success * 100, 1)}%`],
          ["Expected total attempts", f(r.expectedCalls, 2)],
          ["Attempt budget upper bound", String(r.worstCalls)],
        ]}
      />
      <p className="bio-interpretation">
        Expected attempts 会考虑失败后 early
        stop；因此一个更容易失败的系统可能平均调用更少，这不是质量提升。共同
        outage 无法靠同一环境中的即时 retries 消除。
      </p>
      <details className="bio-notes">
        <summary>Expected cost 怎样计算？</summary>
        <p>
          无 outage 时，每 stage 的 expected attempts 为 Σⱼ₌₀ᵃ⁻¹(1−p)ʲ；到 stage
          i 的 probability 为 qⁱ，因此乘以 Σᵢ₌₀ⁿ⁻¹qⁱ。共同 outage 时只在第一
          stage 尝试 a 次，所以 E(total)=c·a+(1−c)·E(no outage)。配置预算上界为
          n·a；在 p=1 等端点，此上界不一定会达到。没有加入
          tokens、latency、backoff 或不同工具单价。
        </p>
      </details>
      <Check
        question="相同输入重复调用同一个必错工具，独立重试公式可信吗？"
        options={["不可信，失败可能高度相关", "可信，尝试更多次必然趋近100%"]}
        answer={0}
        why="先区分 transient error、deterministic failure、权限拒绝和共同 outage，再选择修参、fallback、停止或人工处理。"
      />
      <Notes
        lessons={[
          ["agent-reliability-budgets", "Reliability budgets"],
          ["agent-evaluation", "Agent evaluation"],
          ["tool-calling-contracts", "Tool contracts"],
        ]}
        sources={[
          [
            "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/",
            "Timeouts, retries and backoff",
          ],
        ]}
      >
        <p>
          用于理解长 workflow 的 failure accumulation。实际任务的
          stages、attempts 相关，成功判定可能不完美；不要把这个 toy probability
          当成 Agent benchmark。
        </p>
        <p>
          设 max_steps、deadline、retry budget 与 stop conditions，写入动作使用
          idempotency 或去重，校验 tool response 与最终 artifact。Timeout
          不证明操作没执行。只对合适的 transient errors retry，并用
          backoff/jitter 避免放大故障。
        </p>
      </Notes>
    </>
  );
}
const views = {
  tree: TreeLab,
  search: SearchLab,
  nms: NMSLab,
  retrieval: RetrievalLab,
  reliability: ReliabilityLab,
};
export default function AIBreadthLab({ query }: { query: string }) {
  const raw = new URLSearchParams(query).get("lab") || "tree",
    kind: Kind = Object.hasOwn(names, raw) ? (raw as Kind) : "tree",
    View = views[kind];
  return (
    <main className="bio-lab ai-labs page-gutter">
      <header>
        <a href="#/landscape">← AI 全景</a>
        <h1>把 AI 的关键机制算一遍。</h1>
        <p>
          五个 synthetic
          数值实验：选一个问题，改变参数，检查中间量与结论边界。这里运行教学计算，不调用外部模型或工具服务。
        </p>
      </header>
      <nav className="bio-lab-tabs" aria-label="AI breadth experiments">
        {Object.entries(names).map(([id, name]) => (
          <a
            key={id}
            href={`#/ai-labs?lab=${id}`}
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
        <a href="#/landscape">回到 AI / ML / CV / Agent 学习地图 →</a>
        <p>
          <a href="#/practice?lab=bayes">
            更多概率、transport 与 bootstrap 实验 →
          </a>{" "}
          ·{" "}
          <a href="#/bio-algorithms?lab=em">Single-cell / Spatial 算法实验 →</a>
        </p>
      </footer>
    </main>
  );
}
