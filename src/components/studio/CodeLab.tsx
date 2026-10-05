import { useEffect, useMemo, useState } from "react";
import {
  codeLabByLesson,
  codeLabMetrics,
  codeLabs,
  formatCount,
  validateCodeLabDimensions,
} from "../../studio/codeLabs";
import type { CodeMode, StudioDimensions } from "../../studio/types";
import { visitStudioTool } from "../../studio/studioState";
import { StudioSectionTitle, StudioShell, StatusDot } from "./StudioShell";

const modeLabels: Record<CodeMode, { title: string; english: string }> = {
  scratch: { title: "手写计算", english: "From scratch" },
  pytorch: { title: "框架实现", english: "PyTorch" },
  production: { title: "部署示意", english: "Deployment sketch" },
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
    "idle" | "passed" | "failed"
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
  const errors = validateCodeLabDimensions(lab, dimensions);

  useEffect(() => {
    visitStudioTool(`code:${labId}`);
  }, [labId]);

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
      intro="逐行阅读数组运算、PyTorch 片段与部署示意。浏览器只校验尺寸参数并做公式估算，不执行 Python，也不测试数值、梯度或模型训练。"
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
            title="代码阅读路径"
            english="Code walkthrough"
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
          <p className="code-scope">代码是阅读片段：imports、数据、模型成员与 helper 需在自己的环境补齐。尺寸输入只用于估算，不会改写代码中的常数；下方清单是待做测试。</p>
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
              onClick={() => setRunState(errors.length ? "failed" : "passed")}
            >
              校验尺寸与估算
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
                  max={key === "bytes" ? 8 : key === "T" ? 512 : 2048}
                  step="1"
                  value={Number.isFinite(value) ? value : ""}
                  aria-invalid={errors.some((error) => error.startsWith(`${key}：`))}
                  aria-describedby="estimator-status"
                  onChange={(event) =>
                    updateDimension(
                      key,
                      event.target.valueAsNumber,
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
          <span>ESTIMATED PARAMETERS</span>
          <strong>{formatCount(metrics.params)}</strong>
        </div>
        <div>
          <span>ESTIMATED FORWARD FLOPS</span>
          <strong>{formatCount(metrics.flops)}</strong>
        </div>
        <div>
          <span>ESTIMATED ACTIVATION STORAGE</span>
          <strong>{metrics.activationBytes === null ? "未估算" : `${formatCount(metrics.activationBytes)}B`}</strong>
        </div>
        <div>
          <span>GRADIENT · 未测试</span>
          <strong>{metrics.gradient}</strong>
        </div>
        <p id="estimator-status" role="status">
          {runState === "idle"
            ? "调整尺寸后校验。数值有限性、autograd 与训练结果均未测试。"
            : runState === "passed"
              ? lab.lessonId === "attention" ? "参数有效，D 可按 H 整分。其余 tensor/mask shape、数值与梯度未测试。" : "尺寸参数有效。此模型的实际 tensor shape、数值与梯度未测试。"
              : errors.join(" ")}
        </p>
        <p>{metrics.scope}</p>
      </section>

      <section className="production-checks">
        <StudioSectionTitle
          index="03"
          title="部署前需验证"
          english="Tests to run in your environment"
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
