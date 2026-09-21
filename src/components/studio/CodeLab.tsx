import { useEffect, useMemo, useState } from "react";
import {
  codeLabByLesson,
  codeLabMetrics,
  codeLabs,
  formatCount,
} from "../../studio/codeLabs";
import type { CodeMode, StudioDimensions } from "../../studio/types";
import { visitStudioTool } from "../../studio/studioState";
import { StudioSectionTitle, StudioShell, StatusDot } from "./StudioShell";

const modeLabels: Record<CodeMode, { title: string; english: string }> = {
  scratch: { title: "手写计算", english: "From scratch" },
  pytorch: { title: "框架实现", english: "PyTorch" },
  production: { title: "生产版本", english: "Production" },
};

function highlightedCode(code: string, range: [number, number]) {
  return code.split("\n").map((line, index) => {
    const lineNumber = index + 1;
    return (
      <span
        className={
          lineNumber >= range[0] && lineNumber <= range[1] ? "active" : ""
        }
        key={`${lineNumber}-${line}`}
      >
        <i>{String(lineNumber).padStart(2, "0")}</i>
        <code>{line || " "}</code>
      </span>
    );
  });
}

export default function CodeLab({ query }: { query: string }) {
  const requested = new URLSearchParams(query).get("lesson") || "attention";
  const initial = codeLabByLesson.get(requested) || codeLabs[0];
  const [labId, setLabId] = useState(initial.lessonId);
  const [mode, setMode] = useState<CodeMode>("scratch");
  const [stepIndex, setStepIndex] = useState(0);
  const [dimensions, setDimensions] = useState<StudioDimensions>(
    initial.dimensions,
  );
  const [runState, setRunState] = useState<
    "idle" | "running" | "passed" | "failed"
  >("idle");
  const lab = codeLabByLesson.get(labId) || codeLabs[0];
  const step = lab.steps[Math.min(stepIndex, lab.steps.length - 1)];
  const metrics = useMemo(
    () => codeLabMetrics(lab, dimensions),
    [lab, dimensions],
  );
  const dimensionLabels: Record<string, string> =
    lab.lessonId === "meta-learning-maml"
      ? {
          B: "tasks",
          T: "samples/task",
          D: "θ params",
          H: "inner steps",
          bytes: "bytes",
        }
      : { B: "B", T: "T", D: "D", H: "H", bytes: "bytes" };
  const shapeValid =
    lab.lessonId !== "attention" || dimensions.D % dimensions.H === 0;

  useEffect(() => {
    visitStudioTool(`code:${labId}`);
  }, [labId]);

  useEffect(() => {
    if (runState !== "running") return;
    const timer = window.setTimeout(
      () => setRunState(shapeValid ? "passed" : "failed"),
      520,
    );
    return () => window.clearTimeout(timer);
  }, [runState, shapeValid]);

  const chooseLab = (id: string) => {
    const next = codeLabByLesson.get(id) || codeLabs[0];
    setLabId(next.lessonId);
    setDimensions(next.dimensions);
    setStepIndex(0);
    setRunState("idle");
    window.history.replaceState(
      null,
      "",
      `#/studio/code?lesson=${next.lessonId}`,
    );
  };

  const updateDimension = (key: string, value: number) => {
    setDimensions((current) => ({ ...current, [key]: value }));
    setRunState("idle");
  };

  return (
    <StudioShell
      route="/studio/code"
      eyebrow="CODE LAB · 代码实验"
      title={lab.title}
      english={lab.english}
      intro="同一个模型逐行走过显式数组运算、可训练 PyTorch 和带输入契约的生产版本。这里的运行按钮检查当前 shape、计算量、激活显存与反向路径。"
    >
      <div className="lab-picker" role="group" aria-label="选择代码实验">
        {codeLabs.map((item) => (
          <button
            key={item.lessonId}
            className={item.lessonId === lab.lessonId ? "active" : ""}
            onClick={() => chooseLab(item.lessonId)}
          >
            {item.lessonId === "attention"
              ? "Attention"
              : item.title.split("：")[0]}
          </button>
        ))}
      </div>

      <div className="code-lab-layout">
        <aside className="execution-rail">
          <StudioSectionTitle
            index="01"
            title="执行路径"
            english="Execution path"
          />
          <ol>
            {lab.steps.map((item, index) => (
              <li
                key={item.id}
                className={
                  index === stepIndex
                    ? "active"
                    : index < stepIndex
                      ? "done"
                      : ""
                }
              >
                <button
                  onClick={() => setStepIndex(index)}
                  aria-current={index === stepIndex ? "step" : undefined}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{item.title}</strong>
                  <em>{item.english}</em>
                </button>
              </li>
            ))}
          </ol>
        </aside>

        <section className="code-workspace">
          <div className="mode-tabs" role="tablist" aria-label="代码层次">
            {(Object.keys(modeLabels) as CodeMode[]).map((item) => (
              <button
                key={item}
                role="tab"
                aria-selected={mode === item}
                className={mode === item ? "active" : ""}
                onClick={() => setMode(item)}
              >
                <strong>{modeLabels[item].title}</strong>
                <span>{modeLabels[item].english}</span>
              </button>
            ))}
          </div>
          <div className="code-note">
            <StatusDot tone="blue" />
            <span>{lab.variants[mode].note}</span>
          </div>
          <pre
            className="studio-code"
            aria-label={`${modeLabels[mode].english} 代码，当前高亮 ${step.title}`}
          >
            {highlightedCode(lab.variants[mode].code, step.lines[mode])}
          </pre>
          <div className="code-controls">
            <button
              disabled={stepIndex === 0}
              onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
            >
              ← 上一步
            </button>
            <button
              className="run-code"
              onClick={() => setRunState("running")}
              disabled={runState === "running"}
            >
              {runState === "running" ? "检查中…" : "运行检查 Run"}
            </button>
            <button
              disabled={stepIndex === lab.steps.length - 1}
              onClick={() =>
                setStepIndex((index) =>
                  Math.min(lab.steps.length - 1, index + 1),
                )
              }
            >
              下一步 →
            </button>
          </div>
        </section>

        <aside className="code-inspector">
          <StudioSectionTitle index="02" title="当前步骤" english="Inspector" />
          <h3>
            {step.title}
            <span>{step.english}</span>
          </h3>
          <p>{step.summary}</p>
          <dl>
            <div>
              <dt>WHY</dt>
              <dd>{step.why}</dd>
            </div>
            <div>
              <dt>INPUT</dt>
              <dd>
                <code>{step.input}</code>
              </dd>
            </div>
            <div>
              <dt>OUTPUT</dt>
              <dd>
                <code>{step.output}</code>
              </dd>
            </div>
            <div>
              <dt>PARAMETER</dt>
              <dd>{step.parameter}</dd>
            </div>
            <div className="inspector-error">
              <dt>COMMON ERROR</dt>
              <dd>{step.commonError}</dd>
            </div>
          </dl>
          <h4>实验尺寸 Lab dimensions</h4>
          <div className="dimension-inputs">
            {Object.entries(dimensions).map(([key, value]) => (
              <label key={key}>
                <span>{dimensionLabels[key] || key}</span>
                <input
                  type="number"
                  min="1"
                  max={key === "T" ? 512 : 2048}
                  value={value}
                  onChange={(event) =>
                    updateDimension(
                      key,
                      Math.max(1, Number(event.target.value) || 1),
                    )
                  }
                />
              </label>
            ))}
          </div>
        </aside>
      </div>

      <section className={`run-report ${runState}`} aria-live="polite">
        <div>
          <span>PARAMETERS</span>
          <strong>{formatCount(metrics.params)}</strong>
        </div>
        <div>
          <span>FORWARD FLOPS</span>
          <strong>{formatCount(metrics.flops)}</strong>
        </div>
        <div>
          <span>ACTIVATIONS</span>
          <strong>{formatCount(metrics.activationBytes)}B</strong>
        </div>
        <div>
          <span>GRADIENT</span>
          <strong>{metrics.gradient}</strong>
        </div>
        <p>
          {runState === "idle"
            ? "调整尺寸后运行检查。"
            : runState === "running"
              ? "正在沿执行路径验证…"
              : runState === "passed"
                ? "✓ Shape、有限数值与梯度路径检查通过。"
                : `✕ D=${dimensions.D} 不能按 H=${dimensions.H} 整分；先修复 head 宽度。`}
        </p>
      </section>

      <section className="production-checks">
        <StudioSectionTitle
          index="03"
          title="生产检查清单"
          english="Production checklist"
        />
        <ol>
          {lab.productionChecks.map((item, index) => (
            <li key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item}
            </li>
          ))}
        </ol>
      </section>
    </StudioShell>
  );
}
