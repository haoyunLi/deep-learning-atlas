import { useState } from "react";
import { lessons } from "../data/lessons";
import { guideTasks } from "../data/modelGuide";
import "../guidance.css";

const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));

export default function ModelGuide() {
  const [taskId, setTaskId] = useState(guideTasks[0].id);
  const [contexts, setContexts] = useState<Record<string, string>>({});
  const task = guideTasks.find((item) => item.id === taskId) ?? guideTasks[0];
  const context =
    task.contexts.find((item) => item.id === contexts[task.id]) ??
    task.contexts[0];
  const recommendations = context.recommendationIds.map((id) =>
    task.recommendations.find((item) => item.lessonId === id)!,
  );

  return (
    <main className="guidance-page guidance-model-guide page-gutter">
      <header className="guidance-heading">
        <a className="guidance-back" href="#/atlas">
          ← 算法图谱
        </a>
        <span className="guidance-eyebrow">MODEL GUIDE / 从问题出发</span>
        <h1>下一步，该试哪条路？</h1>
        <p>
          选任务，再回答一个与它相关的问题。收敛到 2–3
          个可比较的起点，带着设置、边界与评估方法开始实验。
        </p>
      </header>

      <div className="guidance-guide-layout">
        <nav className="guidance-task-nav" aria-label="选择建模任务">
          <h2>
            <span>01</span> 选择任务
          </h2>
          <div className="guidance-task-buttons">
            {guideTasks.map((item, index) => (
              <button
                type="button"
                key={item.id}
                aria-pressed={task.id === item.id}
                aria-controls="guidance-task-result"
                onClick={() => setTaskId(item.id)}
              >
                <span className="guidance-task-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <span lang="en">{item.english}</span>
                </span>
                <span className="guidance-task-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            ))}
          </div>
        </nav>

        <section
          id="guidance-task-result"
          className="guidance-task-result"
          aria-labelledby="guidance-task-title"
        >
          <div className="guidance-task-intro">
            <span className="guidance-eyebrow">{task.english}</span>
            <h2 id="guidance-task-title">{task.title}</h2>
            <p>{task.description}</p>
          </div>
          <fieldset className="guidance-context" key={task.id}>
            <legend>
              <span>02</span> {task.question}
            </legend>
            <div className="guidance-context-options">
              {task.contexts.map((item) => (
                <label
                  key={item.id}
                  className={
                    context.id === item.id ? "guidance-context-selected" : ""
                  }
                >
                  <input
                    type="radio"
                    name={`guidance-context-${task.id}`}
                    value={item.id}
                    checked={context.id === item.id}
                    onChange={() =>
                      setContexts((previous) => ({
                        ...previous,
                        [task.id]: item.id,
                      }))
                    }
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="guidance-baseline">
            <span className="guidance-eyebrow">先建立参照 / BASELINE</span>
            <p>{context.baseline}</p>
          </div>
          <div className="guidance-option-heading">
            <h3>
              <span>03</span> 带着理由比较
            </h3>
            <p role="status" aria-live="polite">
              {task.title} · {recommendations.length} 个起点
            </p>
          </div>
          <div className="guidance-recommendations">
            {recommendations.map((recommendation, index) => (
              <article
                className="guidance-recommendation"
                key={`${task.id}-${recommendation.lessonId}`}
              >
                <header>
                  <span className="guidance-recommendation-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <span className="guidance-option-role">
                      {recommendation.role}
                    </span>
                    <h4>{recommendation.name}</h4>
                  </div>
                </header>
                <p className="guidance-reason">{recommendation.reason}</p>
                <h5>第一轮怎么设置</h5>
                <ul>
                  {recommendation.settings.map((setting) => (
                    <li key={setting}>{setting}</li>
                  ))}
                </ul>
                <p className="guidance-limitation">
                  <strong>适用边界</strong>
                  {recommendation.limitation}
                </p>
                <a
                  className="guidance-course-link"
                  href={`#/lesson/${recommendation.lessonId}`}
                >
                  学习原理与完整配方 <span aria-hidden="true">↗</span>
                  <span className="guidance-sr-only">
                    ：{recommendation.name}
                  </span>
                </a>
              </article>
            ))}
          </div>
          <section
            className="guidance-evaluation"
            aria-labelledby="guidance-evaluation-title"
          >
            <h3 id="guidance-evaluation-title">
              <span>04</span> 怎样证明它有效
            </h3>
            <ul>
              {task.evaluation.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="guidance-caveat">
              这些是待验证的实验起点。用同一数据边界、质量指标、资源预算和错误分析决定最终方案。
            </p>
          </section>
          <section
            className="guidance-preparation"
            aria-labelledby="guidance-preparation-title"
          >
            <h3 id="guidance-preparation-title">动手前，补齐这几块</h3>
            <div className="guidance-lesson-links">
              {task.preparationIds.map((id) => (
                <a key={id} href={`#/lesson/${id}`}>
                  {lessonById.get(id)?.title ?? id}{" "}
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          </section>
          <div className="guidance-guide-actions">
            <a href="#/compare">并排比较模型 →</a>
            <a href="#/glossary">查术语 →</a>
          </div>
        </section>
      </div>
    </main>
  );
}
