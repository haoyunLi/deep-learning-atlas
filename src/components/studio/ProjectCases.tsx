import { useEffect, useMemo, useState } from "react";
import { studioProjectById, studioProjects } from "../../studio/projects";
import {
  toggleProjectStage,
  useStudioState,
  visitStudioTool,
} from "../../studio/studioState";
import { StudioSectionTitle, StudioShell, StatusDot } from "./StudioShell";

export default function ProjectCases({ query }: { query: string }) {
  const requested =
    new URLSearchParams(query).get("project") || studioProjects[0].id;
  const [projectId, setProjectId] = useState(
    studioProjectById.has(requested) ? requested : studioProjects[0].id,
  );
  const project = studioProjectById.get(projectId) || studioProjects[0];
  const [stageIndex, setStageIndex] = useState(0);
  const state = useStudioState();
  const completed = useMemo(
    () => new Set(state.projectStages[project.id] || []),
    [state.projectStages, project.id],
  );
  const stage = project.stages[stageIndex];

  useEffect(() => {
    visitStudioTool(`project:${projectId}`);
  }, [projectId]);

  const chooseProject = (id: string) => {
    setProjectId(id);
    setStageIndex(0);
    window.history.replaceState(null, "", `#/studio/projects?project=${id}`);
  };

  return (
    <StudioShell
      route="/studio/projects"
      eyebrow="PROJECT CASES · 端到端项目"
      title="一个模型，不等于一个项目。"
      english="Ship evidence across the whole lifecycle."
      intro="八个案例都按同一八阶段闭环推进。每一阶段给出问题、动作、应交证据、通过条件和典型失败；勾选只记录你已经拿出证据的阶段。"
    >
      <div className="project-layout">
        <aside className="project-list">
          <StudioSectionTitle
            index="01"
            title="项目案例"
            english="Case library"
          />
          <ol>
            {studioProjects.map((item, index) => {
              const count = state.projectStages[item.id]?.length || 0;
              return (
                <li
                  key={item.id}
                  className={item.id === project.id ? "active" : ""}
                >
                  <button
                    onClick={() => chooseProject(item.id)}
                    aria-current={item.id === project.id ? "page" : undefined}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{item.title}</strong>
                    <em>{item.english}</em>
                    <small>{count}/8</small>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        <section className="project-main">
          <header className="project-hero">
            <span>
              CASE{" "}
              {String(
                studioProjects.findIndex((item) => item.id === project.id) + 1,
              ).padStart(2, "0")}
            </span>
            <h2>{project.title}</h2>
            <p className="project-english">{project.english}</p>
            <p>{project.summary}</p>
          </header>
          <div className="project-contract">
            <div>
              <span>TASK</span>
              <p>{project.task}</p>
            </div>
            <div>
              <span>INPUT</span>
              <p>{project.input}</p>
            </div>
            <div>
              <span>OUTPUT</span>
              <p>{project.output}</p>
            </div>
          </div>

          <StudioSectionTitle
            index="02"
            title="八阶段路线"
            english="Eight-stage delivery path"
            note={`${completed.size}/8 complete`}
          />
          <ol className="project-roadmap">
            {project.stages.map((item, index) => (
              <li
                key={item.id}
                className={`${index === stageIndex ? "active" : ""} ${completed.has(item.id) ? "complete" : ""}`}
              >
                <button
                  onClick={() => setStageIndex(index)}
                  aria-current={index === stageIndex ? "step" : undefined}
                >
                  <span>
                    {completed.has(item.id)
                      ? "✓"
                      : String(index + 1).padStart(2, "0")}
                  </span>
                  <strong>{item.label}</strong>
                  <em>{item.english}</em>
                </button>
                {index < project.stages.length - 1 && (
                  <i aria-hidden="true">→</i>
                )}
              </li>
            ))}
          </ol>

          <article className="project-stage-detail">
            <header>
              <span>STAGE {String(stageIndex + 1).padStart(2, "0")}</span>
              <h3>{stage.label}</h3>
              <p>{stage.english}</p>
            </header>
            <div className="project-stage-grid">
              <div>
                <span>QUESTION · 要回答的问题</span>
                <p>{stage.question}</p>
              </div>
              <div>
                <span>ACTION · 要做的动作</span>
                <p>{stage.action}</p>
              </div>
              <div>
                <span>EVIDENCE · 应交证据</span>
                <p>{stage.evidence}</p>
              </div>
              <div className="project-pass">
                <span>PASS · 通过条件</span>
                <p>{stage.pass}</p>
              </div>
              <div className="project-fail">
                <span>FAILURE · 常见失败</span>
                <p>{stage.failure}</p>
              </div>
            </div>
            <button
              className={
                completed.has(stage.id)
                  ? "stage-complete-button completed"
                  : "stage-complete-button"
              }
              onClick={() => toggleProjectStage(project.id, stage.id)}
              aria-pressed={completed.has(stage.id)}
            >
              {completed.has(stage.id)
                ? "✓ 已有证据，标记完成"
                : "我已经产出证据 Mark complete"}
            </button>
          </article>
        </section>

        <aside className="project-evidence-rail">
          <StudioSectionTitle
            index="03"
            title="实验契约"
            english="Evidence contract"
          />
          <dl>
            <div>
              <dt>BASELINE</dt>
              <dd>{project.baseline}</dd>
            </div>
            <div>
              <dt>PRIMARY METRIC</dt>
              <dd>{project.primaryMetric}</dd>
            </div>
            <div>
              <dt>GUARDRAIL</dt>
              <dd>{project.guardrail}</dd>
            </div>
            <div>
              <dt>SPLIT</dt>
              <dd>{project.split}</dd>
            </div>
          </dl>
          <h3>关键设置 Settings</h3>
          <ul>
            {project.settings.map((setting) => (
              <li key={setting}>{setting}</li>
            ))}
          </ul>
          <h3>关联课程 Related lessons</h3>
          <div className="project-related">
            {project.relatedLessons.map((lesson) => (
              <a key={lesson} href={`#/lesson/${lesson}`}>
                {lesson} →
              </a>
            ))}
          </div>
          <div
            className="project-progress"
            aria-label={`项目完成 ${completed.size} / 8`}
          >
            <div>
              <span style={{ width: `${(completed.size / 8) * 100}%` }} />
            </div>
            <p>
              <StatusDot tone={completed.size === 8 ? "green" : "blue"} />
              {completed.size === 8
                ? "完整闭环已完成"
                : `还需 ${8 - completed.size} 个阶段证据`}
            </p>
          </div>
        </aside>
      </div>
    </StudioShell>
  );
}
