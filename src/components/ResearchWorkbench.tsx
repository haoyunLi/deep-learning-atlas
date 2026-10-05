import { useEffect, useState } from "react";
import { lessons } from "../data/lessons";
import {
  researchPaths,
  researchStageNames,
  type ResearchPath,
} from "../data/researchPaths";
import AnimatedExplainer from "./AnimatedExplainer";
import { hierarchySplit } from "./researchMath";
import "../research.css";

const protocolFields = [
  ["unit", "Observation / independent unit"],
  ["target", "Target / output"],
  ["baseline", "Baseline"],
  ["split", "Split / preprocessing"],
  ["metric", "Evaluation"],
  ["failure", "Failure / ablation"],
] as const;
type Protocol = ResearchPath["protocol"];
const storageKey = "atlas-research-protocol-v1";
function loadProtocols(): Record<string, Protocol> {
  const defaults = Object.fromEntries(
    researchPaths.map((p) => [p.id, { ...p.protocol }]),
  );
  try {
    if (typeof window === "undefined") return defaults;
    const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
    for (const p of researchPaths) {
      for (const [key] of protocolFields) {
        if (typeof saved?.[p.id]?.[key] === "string")
          defaults[p.id][key] = saved[p.id][key].slice(0, 2000);
      }
    }
  } catch {
    /* A malformed or unavailable store must not stop learning. */
  }
  return defaults;
}

function CourseLinks({ ids }: { ids: string[] }) {
  return (
    <div className="research-course-links">
      {ids.map((id) => {
        const lesson = lessons.find((l) => l.id === id);
        return lesson ? (
          <a key={id} href={`#/lesson/${id}`}>
            {lesson.englishTitle} →
          </a>
        ) : null;
      })}
    </div>
  );
}

export function HierarchyExample() {
  const [cells, setCells] = useState(4);
  const [mode, setMode] = useState<"row" | "group">("row");
  const [revealed, setRevealed] = useState(false);
  const result = hierarchySplit(cells, mode);
  return (
    <section className="research-hierarchy" aria-labelledby="hierarchy-title">
      <h3 id="hierarchy-title">更多 cells，为什么没有更多未见 patients？</h3>
      <p>
        合成反例：4 位 donor 的 age 为 30、40、60、70。每个 donor 的 cells
        带相同的技术 fingerprint。模型只记住 training 中见过的 fingerprint
        对应的 age；遇到新 fingerprint 则输出 train mean。这里故意构造
        leakage，展示切分回答的问题。
      </p>
      <label className="research-range" htmlFor="hierarchy-cells">
        每 donor 的 cells <output htmlFor="hierarchy-cells">{cells}</output>
        <input
          id="hierarchy-cells"
          type="range"
          min="2"
          max="20"
          step="2"
          value={cells}
          aria-describedby="hierarchy-hint"
          onChange={(e) => setCells(Number(e.target.value))}
        />
      </label>
      <p id="hierarchy-hint">
        先预测：增加 cells 会增加独立 donor 数吗？两种 split 都把一半 rows 用于
        train，另一半用于 test。
      </p>
      <div className="practice-tabs" role="group" aria-label="选择切分单位">
        <button aria-pressed={mode === "row"} onClick={() => setMode("row")}>
          Row split · 每 donor 各分一半
        </button>
        <button
          aria-pressed={mode === "group"}
          onClick={() => setMode("group")}
        >
          Group split · 留出 C、D
        </button>
      </div>
      <div
        className="research-hierarchy-figure"
        role="img"
        aria-label={`${mode}：train donors ${result.trainDonors.join("、")}；test donors ${result.testDonors.join("、")}；重叠 ${result.overlap.length} 位。实心为 train，空心为 test。`}
      >
        {["A", "B", "C", "D"].map((donor) => (
          <div className="research-donor" key={donor}>
            <strong>
              Donor {donor} · {result.rows.find((r) => r.donor === donor)?.age}{" "}
              years
            </strong>
            <div>
              {result.rows
                .filter((r) => r.donor === donor)
                .map((r) => (
                  <span
                    key={r.cell}
                    className={r.train ? "train" : "test"}
                    aria-hidden="true"
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
      <p className="research-legend">
        <span className="train" /> Train <span className="test" /> Test ·{" "}
        {result.trainRows} / {result.testRows} rows；共 4 位 donor
      </p>
      {!revealed ? (
        <button
          className="practice-button primary"
          onClick={() => setRevealed(true)}
        >
          查看实际预测与 MAE
        </button>
      ) : (
        <div className="research-calculated" aria-live="polite">
          <p>
            <strong>Test MAE = {result.mae.toFixed(1)} years</strong>
            ；Train/Test donor overlap = {result.overlap.length}。Unseen
            fingerprint 的 fallback = {result.fallback.toFixed(1)}。
          </p>
          <div
            className="practice-table"
            tabIndex={0}
            role="region"
            aria-label="每 donor 的 held-out age prediction（可横向滚动）"
          >
            <table>
              <thead>
                <tr>
                  <th>Test donor</th>
                  <th>True age</th>
                  <th>Prediction</th>
                  <th>Absolute error</th>
                </tr>
              </thead>
              <tbody>
                {result.testDonors.map((d) => {
                  const row = result.rows.find(
                    (r) => r.donor === d && !r.train,
                  )!;
                  return (
                    <tr key={d}>
                      <td>{d}</td>
                      <td>{row.age}</td>
                      <td>{row.prediction.toFixed(1)}</td>
                      <td>{Math.abs(row.prediction - row.age).toFixed(1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p>
            {mode === "row"
              ? "Row split 看到了所有 donor 的 fingerprint，因此 test 为零误差；这只证明能识别已见 donor，不能证明新患者泛化。"
              : "Group split 完全没见 C/D，输出 train mean=35；误差是 (|35−60|+|35−70|)/2=30。增加同样的 cells 不改变独立 donor 数，也不改变这个反例的误差。"}
          </p>
        </div>
      )}
      <p className="research-boundary">
        数值只来自这个刻意设计的 synthetic
        memorizer，不是对真实模型性能的预测。真实 cells 存在异质性，但新 patient
        的评估仍要避免同 patient 跨集。
        <a
          href="https://scikit-learn.org/stable/modules/cross_validation.html"
          target="_blank"
          rel="noreferrer"
        >
          Group CV 文档 ↗
        </a>
      </p>
      <CourseLinks
        ids={[
          "nested-group-validation",
          "pseudobulk-hierarchy",
          "data-leakage",
        ]}
      />
    </section>
  );
}

function TransferCheck({ path }: { path: ResearchPath }) {
  const [answer, setAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  return (
    <section className="research-check">
      <h3>换一个情境，你会先查什么？</h3>
      <fieldset>
        <legend>{path.challenge.question}</legend>
        {path.challenge.options.map((option, i) => (
          <label key={option}>
            <input
              type="radio"
              name={`research-check-${path.id}`}
              checked={answer === i}
              onChange={() => {
                setAnswer(i);
                setSubmitted(false);
              }}
            />
            {option}
          </label>
        ))}
      </fieldset>
      <button
        className="practice-button"
        disabled={answer === null}
        onClick={() => setSubmitted(true)}
      >
        检查我的判断
      </button>
      {submitted && (
        <p role="status">
          <strong>
            {answer === path.challenge.answer
              ? "判断正确。"
              : "先检查问题与证据。"}
          </strong>{" "}
          {path.challenge.feedback}
        </p>
      )}
    </section>
  );
}

function ResearchProtocol({ path }: { path: ResearchPath }) {
  const [protocols, setProtocols] = useState(loadProtocols);
  const [storageOk, setStorageOk] = useState(true);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(protocols));
      setStorageOk(true);
    } catch {
      setStorageOk(false);
    }
  }, [protocols]);
  const protocol = protocols[path.id];
  const markdown = `# ${path.name} · Experiment protocol\n\nQuestion: ${path.question}\n\n${protocolFields.map(([key, label]) => `## ${label}\n\n${protocol[key]}`).join("\n\n")}\n\n## Sources\n\n${path.sources.map((s) => `- [${s.label}](${s.url})`).join("\n")}\n\nLearning worksheet; not a completed experiment or validated research result.\n`;
  return (
    <details className="research-protocol">
      <summary>写成你的实验方案 · 可编辑并下载</summary>
      <p>
        把阅读转为具体决策。每条路径单独保存草稿；用你的真实样本数、split
        和指标替换起点。草稿保存在当前浏览器，可下载 Markdown。
      </p>
      <div className="research-protocol-fields">
        {protocolFields.map(([key, label]) => (
          <div key={key}>
            <label htmlFor={`protocol-${path.id}-${key}`}>{label}</label>
            <textarea
              id={`protocol-${path.id}-${key}`}
              rows={3}
              maxLength={2000}
              value={protocol[key]}
              onChange={(e) =>
                setProtocols((previous) => ({
                  ...previous,
                  [path.id]: { ...previous[path.id], [key]: e.target.value },
                }))
              }
            />
          </div>
        ))}
      </div>
      <div className="practice-links">
        <a
          className="practice-button primary"
          download={`${path.id}-experiment-protocol.md`}
          href={`data:text/markdown;charset=utf-8,${encodeURIComponent(markdown)}`}
        >
          下载实验方案
        </a>
        <button
          className="practice-button"
          onClick={() =>
            setProtocols((previous) => ({
              ...previous,
              [path.id]: { ...path.protocol },
            }))
          }
        >
          恢复这条路径的起点
        </button>
      </div>
      <p role="status">
        {storageOk
          ? "草稿已保存到本机浏览器。"
          : "浏览器存储不可用；当前草稿仍可编辑，请下载保存。"}
      </p>
    </details>
  );
}

export default function ResearchWorkbench() {
  const requested =
    typeof window === "undefined"
      ? "spatial"
      : new URLSearchParams(window.location.hash.split("?")[1] || "").get(
          "research",
        );
  const [pathId, setPathId] = useState(
    researchPaths.some((p) => p.id === requested) ? requested! : "spatial",
  );
  const [stageIndex, setStageIndex] = useState(0);
  const path = researchPaths.find((p) => p.id === pathId)!;
  const stage = path.stages[stageIndex];
  const mechanismId =
    path.id === "spatial"
      ? "spatial-assignment"
      : path.id === "pathway"
        ? "pseudobulk-hierarchy"
        : "elastic-net";
  const mechanism = lessons.find((l) => l.id === mechanismId);
  function choosePath(id: string) {
    setPathId(id);
    setStageIndex(0);
    window.history.replaceState(null, "", `#/practice?research=${id}`);
  }
  return (
    <section className="research-workbench" aria-labelledby="research-title">
      <div
        className="research-path-selector"
        role="group"
        aria-label="选择项目学习路径"
      >
        {researchPaths.map((p) => (
          <button
            key={p.id}
            aria-pressed={p.id === path.id}
            onClick={() => choosePath(p.id)}
          >
            {p.name}
          </button>
        ))}
      </div>
      <div className="research-question">
        <h2 id="research-title">{path.question}</h2>
        <details className="research-motivation">
          <summary>为什么这样问？现有方法还缺什么？</summary>
          <p>{path.why}</p>
          <p>
            <strong>现有方法留下的问题：</strong>
            {path.gap}
          </p>
        </details>
      </div>
      <figure className="research-io">
        <div>
          <strong>Input</strong>
          <p>{path.input}</p>
        </div>
        <div className="research-io-transform">
          <span aria-hidden="true">→</span>
          <p>{path.transform}</p>
          <span aria-hidden="true">→</span>
        </div>
        <div>
          <strong>Output</strong>
          <p>{path.output}</p>
        </div>
        <figcaption>
          按你的 Computational Biology 项目整理；下面的数值与图解均为 synthetic
          examples。
          <br />
          {path.outputBoundary}
        </figcaption>
      </figure>
      {mechanism && (
        <div className="research-mechanism">
          <AnimatedExplainer key={mechanism.id} lesson={mechanism} />
        </div>
      )}
      <div className="research-route">
        <h3>从对象到结论，一步一步检查</h3>
        <nav className="research-stage-nav" aria-label="科研路径的六个阶段">
          {path.stages.map((s, i) => (
            <button
              key={s.title}
              aria-current={stageIndex === i ? "step" : undefined}
              onClick={() => setStageIndex(i)}
            >
              <span>{i + 1}</span>
              {researchStageNames[i]}
            </button>
          ))}
        </nav>
        <section
          className="research-stage"
          aria-labelledby="research-stage-title"
          key={`${path.id}-${stageIndex}`}
        >
          <p className="research-stage-count">Stage {stageIndex + 1} / 6</p>
          <h3 id="research-stage-title">{stage.title}</h3>
          <p>{stage.message}</p>
          <ol>
            {stage.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="research-stage-check">
            <strong>继续前先确认：</strong>
            {stage.check}
          </p>
          <CourseLinks ids={stage.lessonIds} />
        </section>
        <div className="practice-links">
          <button
            className="practice-button"
            disabled={stageIndex === 0}
            onClick={() => setStageIndex(stageIndex - 1)}
          >
            ← 前一阶段
          </button>
          <button
            className="practice-button"
            disabled={stageIndex === 5}
            onClick={() => setStageIndex(stageIndex + 1)}
          >
            下一阶段 →
          </button>
        </div>
      </div>
      <details className="research-selection">
        <summary>在这个任务里，怎样比较算法的优缺点与设置？</summary>
        <div
          className="practice-table"
          tabIndex={0}
          role="region"
          aria-label={`${path.name} 算法选型比较（可横向滚动）`}
        >
          <table>
            <thead>
              <tr>
                <th>方法 / 什么时候用</th>
                <th>优势</th>
                <th>代价与边界</th>
                <th>第一轮设置</th>
              </tr>
            </thead>
            <tbody>
              {path.choices.map((choice) => (
                <tr key={choice.name}>
                  <td>
                    <a href={`#/lesson/${choice.lessonId}`}>
                      <strong>{choice.name} →</strong>
                    </a>
                    <p>{choice.use}</p>
                  </td>
                  <td>{choice.strength}</td>
                  <td>{choice.cost}</td>
                  <td>{choice.settings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <HierarchyExample />
      <TransferCheck key={path.id} path={path} />
      <ResearchProtocol path={path} />
      <section className="research-sources">
        <h3>从教学例子回到原始方法</h3>
        <p>
          图中数据与计算是本站自编的机制例子；以下资料支持方法与假设，不是这些
          toy 数值的来源。
        </p>
        <ul>
          {path.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.label} ↗
              </a>
            </li>
          ))}
        </ul>
        <CourseLinks
          ids={[
            "count-likelihoods",
            "pseudobulk-hierarchy",
            "nested-group-validation",
            "elastic-net",
            "scvi",
            "spatial-assignment",
            "optimal-transport",
            "multiple-instance-learning",
          ]}
        />
      </section>
    </section>
  );
}
