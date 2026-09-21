import { useEffect, useMemo, useState } from "react";
import {
  firstShapeError,
  shapeDefinitionById,
  shapeDefinitions,
} from "../../studio/shapeMath";
import type { ShapeDefinition, StudioDimensions } from "../../studio/types";
import { visitStudioTool } from "../../studio/studioState";
import { StudioSectionTitle, StudioShell, StatusDot } from "./StudioShell";

export default function ShapeDebugger() {
  const [definitionId, setDefinitionId] =
    useState<ShapeDefinition["id"]>("attention");
  const definition =
    shapeDefinitionById.get(definitionId) || shapeDefinitions[0];
  const [values, setValues] = useState<StudioDimensions>(definition.defaults);
  const [stageIndex, setStageIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const stages = useMemo(() => definition.stages(values), [definition, values]);
  const activeStage = stages[Math.min(stageIndex, stages.length - 1)];
  const error = firstShapeError(definition, values);

  useEffect(() => {
    visitStudioTool(`shapes:${definitionId}`);
  }, [definitionId]);

  useEffect(() => {
    if (!playing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPlaying(false);
      return;
    }
    const timer = window.setInterval(() => {
      setStageIndex((current) => {
        if (current >= stages.length - 1) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, 1100);
    return () => window.clearInterval(timer);
  }, [playing, stages.length]);

  const chooseDefinition = (next: ShapeDefinition) => {
    setDefinitionId(next.id);
    setValues(next.defaults);
    setStageIndex(0);
    setPlaying(false);
  };

  return (
    <StudioShell
      route="/studio/shapes"
      eyebrow="TENSOR SHAPE DEBUGGER · 张量形状调试器"
      title="让每一条轴都有名字。"
      english="Trace dimensions before runtime errors trace you."
      intro="选择模型并改变尺寸，沿运算管线观察输入、输出、参数量和约束。点击“制造错误”查看真正的失败条件，再让修复按钮回到合法形状。"
    >
      <div className="shape-model-tabs" role="tablist" aria-label="模型类型">
        {shapeDefinitions.map((item) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={definition.id === item.id}
            className={definition.id === item.id ? "active" : ""}
            onClick={() => chooseDefinition(item)}
          >
            <strong>{item.label}</strong>
            <span>{item.english}</span>
          </button>
        ))}
      </div>

      <div className="shape-layout">
        <aside className="shape-controls">
          <StudioSectionTitle
            index="01"
            title="尺寸控制"
            english="Dimensions"
          />
          {definition.fields.map((field) => (
            <label key={field.key}>
              <span>{field.label}</span>
              <input
                type="range"
                min={field.min}
                max={field.max}
                step={field.step}
                value={Math.min(
                  field.max,
                  Math.max(field.min, values[field.key] ?? field.min),
                )}
                onChange={(event) => {
                  setValues((current) => ({
                    ...current,
                    [field.key]: Number(event.target.value),
                  }));
                  setStageIndex(0);
                }}
              />
              <input
                className="shape-number"
                aria-label={`${field.label} 数值`}
                type="number"
                min={field.min}
                max={field.max}
                step={field.step}
                value={values[field.key] ?? field.min}
                onChange={(event) => {
                  setValues((current) => ({
                    ...current,
                    [field.key]: Number(event.target.value),
                  }));
                  setStageIndex(0);
                }}
              />
            </label>
          ))}
          <div className="shape-error-buttons">
            <button
              onClick={() => {
                setValues(definition.makeError(values));
                setStageIndex(0);
              }}
            >
              制造错误 Break shape
            </button>
            <button
              onClick={() => {
                setValues(definition.repair(values));
                setStageIndex(0);
              }}
            >
              自动修复 Repair
            </button>
          </div>
        </aside>

        <section className="shape-pipeline-area">
          <StudioSectionTitle
            index="02"
            title="运算管线"
            english="Operation pipeline"
            note={`${stages.length} stages`}
          />
          <div className="shape-playback">
            <button
              className="studio-primary-button"
              onClick={() => {
                setStageIndex(0);
                setPlaying(true);
              }}
              disabled={playing}
            >
              {playing ? "正在播放…" : "播放形状流 Play"}
            </button>
            <button
              className="studio-text-button"
              onClick={() => setPlaying(false)}
              disabled={!playing}
            >
              暂停
            </button>
          </div>
          <ol className="shape-pipeline">
            {stages.map((item, index) => (
              <li
                key={item.id}
                className={`${index === stageIndex ? "active" : ""} ${index < stageIndex ? "passed" : ""} ${item.error ? "has-error" : ""}`}
              >
                <button
                  onClick={() => {
                    setStageIndex(index);
                    setPlaying(false);
                  }}
                  aria-current={index === stageIndex ? "step" : undefined}
                >
                  <span className="shape-node">
                    {item.error ? "!" : index < stageIndex ? "✓" : index + 1}
                  </span>
                  <strong>{item.label}</strong>
                  <em>{item.operation}</em>
                  <code>{item.output}</code>
                </button>
                {index < stages.length - 1 && (
                  <span className="shape-arrow" aria-hidden="true">
                    →
                  </span>
                )}
              </li>
            ))}
          </ol>
          <div
            className={`shape-alert ${error ? "error" : "valid"}`}
            role="status"
            aria-live="polite"
          >
            <StatusDot tone={error ? "red" : "green"} />
            <div>
              <strong>{error ? "SHAPE ERROR" : "SHAPE CONTRACT PASSED"}</strong>
              <p>{error || "所有阶段的元素数、索引和拼接约束都成立。"}</p>
            </div>
          </div>
        </section>

        <aside className="shape-inspector">
          <StudioSectionTitle index="03" title="轴与公式" english="Inspector" />
          <h3>
            {activeStage.label}
            <span>{activeStage.operation}</span>
          </h3>
          <dl>
            <div>
              <dt>INPUT</dt>
              <dd>
                <code>{activeStage.input}</code>
              </dd>
            </div>
            <div>
              <dt>OUTPUT</dt>
              <dd>
                <code>{activeStage.output}</code>
              </dd>
            </div>
            <div>
              <dt>WHY</dt>
              <dd>{activeStage.why}</dd>
            </div>
            <div>
              <dt>PARAMETERS / COST</dt>
              <dd>{activeStage.parameters}</dd>
            </div>
          </dl>
          <h4>最常见的错位</h4>
          <ul>
            {activeStage.commonErrors.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {activeStage.error && (
            <p className="shape-stage-error">{activeStage.error}</p>
          )}
        </aside>
      </div>

      <section className="shape-ledger">
        <StudioSectionTitle
          index="04"
          title="形状账本"
          english="Shape ledger"
          note="输入 → 操作 → 输出"
        />
        <div role="table" aria-label={`${definition.english} 形状账本`}>
          {stages.map((item, index) => (
            <button
              role="row"
              key={item.id}
              onClick={() => setStageIndex(index)}
              className={index === stageIndex ? "active" : ""}
            >
              <span role="cell">{String(index + 1).padStart(2, "0")}</span>
              <strong role="cell">{item.label}</strong>
              <code role="cell">{item.input}</code>
              <span role="cell">{item.operation}</span>
              <code role="cell">{item.output}</code>
            </button>
          ))}
        </div>
      </section>
    </StudioShell>
  );
}
