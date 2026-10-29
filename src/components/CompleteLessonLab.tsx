import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { Lesson } from "../data/lessons";
import { completeLabCatalog } from "../data/completeLabCatalog";
import type {
  CompleteLab,
  LabChart,
  LabMetric,
} from "../data/completeLabs/types";
import CompleteLabChart, { displayNumber } from "./CompleteLabChart";
import "./complete-lab.css";

export async function loadCompleteLab(id: string): Promise<CompleteLab> {
  const entry = completeLabCatalog[id];
  if (!entry) throw new Error("此课程没有新增参数实验。");
  const collection =
    entry.group === "ml"
      ? (await import("../data/completeLabs/ml")).mlCompleteLabs
      : entry.group === "cv"
        ? (await import("../data/completeLabs/cv")).cvCompleteLabs
        : (await import("../data/completeLabs/rl")).rlCompleteLabs;
  if (!collection[id]) throw new Error("实验数据没有完整载入，请重试。");
  return collection[id];
}
function MetricComparison({
  current,
  baseline,
  caption,
}: {
  current: LabMetric[];
  baseline: LabMetric[];
  caption: string;
}) {
  const labels = [
    ...new Set([
      ...current.map((m) => m.label),
      ...baseline.map((m) => m.label),
    ]),
  ];
  return (
    <div
      className="complete-table-scroll"
      tabIndex={0}
      role="region"
      aria-label={caption}
    >
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">计算量</th>
            <th scope="col">当前</th>
            <th scope="col">对照</th>
            <th scope="col">Δ 当前−对照</th>
          </tr>
        </thead>
        <tbody>
          {labels.map((label) => {
            const a = current.find((m) => m.label === label),
              b = baseline.find((m) => m.label === label);
            return (
              <tr key={label}>
                <th scope="row">
                  {label}
                  {a?.unit || b?.unit ? ` · ${a?.unit || b?.unit}` : ""}
                </th>
                <td>{a ? displayNumber(a.value) : "n/a"}</td>
                <td>{b ? displayNumber(b.value) : "n/a"}</td>
                <td>
                  {a && b && a.unit === b.unit
                    ? displayNumber(a.value - b.value)
                    : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
function ChartValues({
  chart,
  group,
}: {
  chart: LabChart;
  group: "当前" | "固定对照";
}) {
  return (
    <details className="complete-chart-values">
      <summary>{group} · 查看图中完整数值与标签</summary>
      <div
        className="complete-table-scroll"
        tabIndex={0}
        role="region"
        aria-label={`${group}图形精确数据`}
      >
        {chart.kind === "matrix" ? (
          <table>
            <caption>
              {group}矩阵 · {chart.unit}
            </caption>
            <thead>
              <tr>
                <th scope="col">Row / Column</th>
                {chart.columns.map((c, i) => (
                  <th scope="col" key={i}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chart.rows.map((r, i) => (
                <tr key={i}>
                  <th scope="row">{r}</th>
                  {chart.values[i].map((v, j) => (
                    <td key={j}>{displayNumber(v)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table>
            <caption>
              {group} ·{" "}
              {chart.kind === "line"
                ? `${chart.xLabel} → ${chart.yLabel}`
                : chart.unit}
            </caption>
            <thead>
              <tr>
                <th scope="col">
                  {chart.kind === "line" ? chart.xLabel : "Label"}
                </th>
                <th scope="col">Value</th>
              </tr>
            </thead>
            <tbody>
              {chart.kind === "line"
                ? chart.x.map((x, i) => (
                    <tr key={i}>
                      <th scope="row">{displayNumber(x)}</th>
                      <td>{displayNumber(chart.y[i])}</td>
                    </tr>
                  ))
                : chart.labels.map((l, i) => (
                    <tr key={i}>
                      <th scope="row">{l}</th>
                      <td>{displayNumber(chart.values[i])}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        )}
      </div>
    </details>
  );
}

export function CompleteLabPlayer({
  lab,
  lessonId,
}: {
  lab: CompleteLab;
  lessonId: string;
}) {
  const defaults = useMemo(
    () => Object.fromEntries(lab.controls.map((c) => [c.id, c.initial])),
    [lab],
  );
  const [values, setValues] = useState(defaults),
    [reference, setReference] = useState(defaults);
  const [step, setStep] = useState(0),
    [playing, setPlaying] = useState(false),
    [speed, setSpeed] = useState(1);
  const [reduced, setReduced] = useState(false),
    [notice, setNotice] = useState("");
  const container = useRef<HTMLDivElement>(null),
    uid = useId();
  const result = useMemo(() => lab.calculate(values), [lab, values]);
  const baseline = useMemo(() => lab.calculate(reference), [lab, reference]);
  const stage = result.stages[step],
    compare = baseline.stages[step];
  function selectStep(next: number) {
    setPlaying(false);
    setStep(next);
  }
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReduced(mq.matches);
      if (mq.matches) setPlaying(false);
    };
    const visibility = () => {
      if (document.hidden) setPlaying(false);
    };
    update();
    mq.addEventListener("change", update);
    document.addEventListener("visibilitychange", visibility);
    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver((entries) => {
            if (!entries[0]?.isIntersecting) setPlaying(false);
          })
        : null;
    if (container.current) observer?.observe(container.current);
    return () => {
      mq.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", visibility);
      observer?.disconnect();
    };
  }, []);
  useEffect(() => {
    if (!playing || reduced) return;
    if (step >= result.stages.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = window.setInterval(
      () => setStep((old) => Math.min(old + 1, result.stages.length - 1)),
      3000 / speed,
    );
    return () => window.clearInterval(timer);
  }, [playing, reduced, speed, step, result.stages.length]);
  const controlText = (params: Record<string, number>) =>
    lab.controls
      .map((c) => `${c.label}=${displayNumber(params[c.id])}`)
      .join(" · ");
  function reset() {
    setValues({ ...defaults });
    setReference({ ...defaults });
    selectStep(0);
    setNotice("参数、对照和步骤已恢复默认值。");
  }
  function download() {
    const data = {
      lessonId,
      synthetic: true,
      source: lab.source,
      parameters: values,
      referenceParameters: reference,
      current: result,
      reference: baseline,
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${lessonId}-calculation.json`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("已导出参数、四步中间值和对照结果。");
  }
  return (
    <div className="complete-player" ref={container}>
      <h2>{lab.question}</h2>
      <p className="complete-input">
        <strong>输入与问题：</strong>
        {lab.input}
      </p>
      <p className="complete-scope">
        Synthetic teaching model ·{" "}
        {lab.boundary.replace(
          /^Synthetic teaching (?:example|fixture|model)[；。·:\s]*/,
          "",
        )}
      </p>
      <div className="complete-controls">
        {lab.controls.map((c) => (
          <label key={c.id} htmlFor={`${uid}-${c.id}`}>
            <span>
              {c.label}
              <output htmlFor={`${uid}-${c.id}`}>
                {displayNumber(values[c.id])}
              </output>
            </span>
            <input
              id={`${uid}-${c.id}`}
              type="range"
              min={c.min}
              max={c.max}
              step={c.step}
              value={values[c.id]}
              aria-describedby={`${uid}-${c.id}-hint`}
              onChange={(e) => {
                setValues((v) => ({ ...v, [c.id]: Number(e.target.value) }));
                setPlaying(false);
                setNotice("");
              }}
            />
            <small id={`${uid}-${c.id}-hint`}>{c.hint}</small>
          </label>
        ))}
      </div>
      <div className="complete-comparison-controls">
        <button
          type="button"
          onClick={() => {
            setReference({ ...values });
            setNotice("当前参数已固定为对照；继续调参即可比较。");
          }}
        >
          固定当前参数为对照
        </button>
        <button type="button" onClick={reset}>
          全部重置
        </button>
        <button type="button" onClick={download}>
          下载本次数值
        </button>
      </div>
      <p className="complete-reference">
        <strong>固定对照：</strong>
        {controlText(reference)}
        <br />
        调参会保留当前步骤，并暂停播放；固定对照保持不变。
      </p>
      <p className="complete-notice" role="status">
        {notice}
      </p>
      <nav className="complete-stages" aria-label="数值推演步骤">
        {result.stages.map((s, i) => (
          <button
            key={i}
            type="button"
            aria-current={i === step ? "step" : undefined}
            onClick={() => selectStep(i)}
          >
            <span>{i + 1}</span>
            {s.title}
          </button>
        ))}
      </nav>
      <div className="complete-playback">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => selectStep(step - 1)}
        >
          上一步
        </button>
        <span>
          Step {step + 1} / {result.stages.length}
        </span>
        <button
          type="button"
          disabled={step === result.stages.length - 1}
          onClick={() => selectStep(step + 1)}
        >
          下一步
        </button>
        <button
          type="button"
          disabled={reduced}
          onClick={() => {
            if (step === result.stages.length - 1) setStep(0);
            setPlaying((p) => !p);
          }}
        >
          {playing ? "暂停推演" : "播放推演"}
        </button>
        <label>
          播放速度
          <select
            aria-label="播放速度"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          >
            <option value={0.5}>慢速 · 6 秒/步</option>
            <option value={1}>标准 · 3 秒/步</option>
            <option value={2}>快速 · 1.5 秒/步</option>
          </select>
        </label>
      </div>
      {reduced && (
        <p className="complete-scope">
          系统启用了 Reduced Motion；请用手动步骤查看完整计算。
        </p>
      )}
      <div
        className="complete-stage-copy"
        aria-live={playing ? "off" : "polite"}
      >
        <h3>{stage.title}</h3>
        <p>{stage.explanation}</p>
        <p className="complete-formula">{stage.formula}</p>
      </div>
      <CompleteLabChart
        chart={stage.chart}
        baseline={compare.chart}
        label={`Step ${step + 1} · ${stage.title}`}
      />
      <details className="complete-chart-values">
        <summary>查看对照组本步的公式</summary>
        <p className="complete-formula">{compare.formula}</p>
      </details>
      <ChartValues chart={stage.chart} group="当前" />
      <ChartValues chart={compare.chart} group="固定对照" />
      <MetricComparison
        current={stage.metrics}
        baseline={compare.metrics}
        caption={`本步中间量 · ${stage.title}`}
      />
      <h3 className="complete-result-title">最终结果怎样变化？</h3>
      <p className="complete-scope">
        此处比较完整四步的终点，便于先预测再验证。Δ
        的正负仅表示数值变化，不自动表示优劣。
      </p>
      <MetricComparison
        current={result.outcomes}
        baseline={baseline.outcomes}
        caption="完整计算的结果对照"
      />
      <details className="complete-guidance" open>
        <summary>什么时候用 · 怎么调参 · 怎么排错</summary>
        <h3>什么时候用，何时换方法</h3>
        <ul>
          {lab.usage.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <h3>参数起点与调整信号</h3>
        <ul>
          {lab.tuning.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <h3>先定位原因，再修改配置</h3>
        <dl>
          {lab.troubleshooting.map((t) => (
            <div key={t.symptom}>
              <dt>{t.symptom}</dt>
              <dd>
                <strong>先检查：</strong>
                {t.check}
              </dd>
              <dd>
                <strong>再处理：</strong>
                {t.action}
              </dd>
            </div>
          ))}
        </dl>
        <p>
          <a href={lab.source.url} target="_blank" rel="noreferrer">
            Primary source · {lab.source.label}
          </a>
        </p>
      </details>
    </div>
  );
}

export default function CompleteLessonLab({ lesson }: { lesson: Lesson }) {
  const [lab, setLab] = useState<CompleteLab | null>(null),
    [error, setError] = useState(""),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setError("");
    setLab(null);
    loadCompleteLab(lesson.id)
      .then((value) => {
        if (active) setLab(value);
      })
      .catch((reason) => {
        if (active)
          setError(
            reason instanceof Error ? reason.message : "实验未能载入，请重试。",
          );
      });
    return () => {
      active = false;
    };
  }, [lesson.id, attempt]);
  return (
    <section
      id="animation"
      className="complete-lesson-lab"
      aria-label={`${lesson.title}的参数与中间计算实验`}
    >
      {error ? (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => setAttempt((n) => n + 1)}>
            重新载入实验
          </button>
        </div>
      ) : lab ? (
        <CompleteLabPlayer key={lesson.id} lab={lab} lessonId={lesson.id} />
      ) : (
        <p role="status">正在载入本课计算与图形…</p>
      )}
    </section>
  );
}
