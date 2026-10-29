import { aiAreas, aiJourneys, aiTaskCompositions } from "../data/aiLandscape";
import { lessons } from "../data/lessons";
import { useStudyState } from "../lib/studyState";
import AIScopeDiagram from "./AIScopeDiagram";
import "./ai-landscape.css";
function CourseLinks({ ids }: { ids: string[] }) {
  const { completed } = useStudyState();
  return (
    <ol className="ai-course-list">
      {ids.map((id) => {
        const lesson = lessons.find((l) => l.id === id);
        return lesson ? (
          <li key={id}>
            <a href={`#/lesson/${id}`}>
              <span>{lesson.englishTitle}</span>
              <small>{lesson.title}</small>
            </a>
            <span>{completed.includes(id) ? "已学" : "待学"}</span>
          </li>
        ) : null;
      })}
    </ol>
  );
}
export default function AILandscape({ query }: { query: string }) {
  const params = new URLSearchParams(query),
    area = aiAreas.find((a) => a.id === params.get("area")) ?? aiAreas[0],
    task =
      aiTaskCompositions.find((t) => t.id === params.get("task")) ??
      aiTaskCompositions[0];
  const href = (key: string, value: string) => {
    const next = new URLSearchParams(query);
    next.set(key, value);
    return "#/landscape?" + next.toString();
  };
  return (
    <main className="ai-landscape page-gutter">
      <header className="ai-landscape-intro">
        <div>
          <h1>把 AI 的全景连起来。</h1>
          <p>
            认识方法之间的关系，再决定往哪里深入。从 Classical ML、Search 和
            Probability，到 CV、Language、RL 与 Agent systems。
          </p>
          <p>
            {lessons.length} 节课程沿着同一条教学线：直觉 → 输入输出 → 逐步机制
            → 参数 → 适用条件与边界。
          </p>
          <a href="#/ai-labs?lab=tree">先亲手计算一个机制 →</a>
        </div>
        <AIScopeDiagram />
      </header>
      <section className="ai-map-section">
        <h2>先按问题认识十个领域</h2>
        <p>
          这里是学习地图，各领域相互交叉。点击一个领域，查看它解决什么、先试什么，以及什么时候需要更复杂的方法。
        </p>
        <nav className="ai-area-nav" aria-label="AI knowledge areas">
          {aiAreas.map((a) => (
            <a
              href={href("area", a.id)}
              key={a.id}
              aria-current={a.id === area.id ? "page" : undefined}
            >
              {a.name}
            </a>
          ))}
        </nav>
        <article className="ai-area-detail" key={area.id}>
          <h3>{area.question}</h3>
          <dl className="ai-io">
            <div>
              <dt>Input</dt>
              <dd>{area.input}</dd>
            </div>
            <div>
              <dt>Output</dt>
              <dd>{area.output}</dd>
            </div>
          </dl>
          <div className="ai-choice-reasons">
            <p>
              <strong>先试什么：</strong>
              {area.baseline}
            </p>
            <p>
              <strong>何时升级：</strong>
              {area.upgrade}
            </p>
            <p>
              <strong>什么不能据此推断：</strong>
              {area.boundary}
            </p>
          </div>
          <CourseLinks ids={area.lessons} />
        </article>
      </section>
      <section className="ai-task-section">
        <h2>同一个系统，可以组合多种 AI 方法</h2>
        <nav className="ai-task-nav" aria-label="选择应用任务">
          {aiTaskCompositions.map((t) => (
            <a
              key={t.id}
              href={href("task", t.id)}
              aria-current={t.id === task.id ? "page" : undefined}
            >
              {t.name}
            </a>
          ))}
        </nav>
        <figure className="ai-task-flow">
          <div>
            <small>INPUT</small>
            <strong>{task.input}</strong>
          </div>
          <span aria-hidden="true">→</span>
          <div>
            <small>METHODS / SYSTEM</small>
            <strong>{task.mechanism}</strong>
          </div>
          <span aria-hidden="true">→</span>
          <div>
            <small>OUTPUT</small>
            <strong>{task.output}</strong>
          </div>
          <figcaption>{task.why}</figcaption>
        </figure>
        <CourseLinks ids={task.ids} />
        {task.lab && (
          <a href={`#/ai-labs?lab=${task.lab}`}>
            打开相关机制的 synthetic 数值实验 →
          </a>
        )}
      </section>
      <section className="ai-journeys">
        <h2>四条有先后关系的学习路线</h2>
        <p>
          先读一条路线，再按实际问题回到全景地图补缺口。课程标记沿用已有的浏览器学习记录。
        </p>
        {aiJourneys.map((j) => (
          <details key={j.id} open={j.id === "breadth"}>
            <summary>
              {j.title} <span>{j.ids.length} lessons</span>
            </summary>
            <p>{j.why}</p>
            <CourseLinks ids={j.ids} />
          </details>
        ))}
      </section>
      <section className="ai-reading-boundary">
        <h2>广度之后，怎样判断自己真的理解了？</h2>
        <p>
          能说出 input/output、objective / cost /
          constraints（需要训练的方法再说明
          loss），能手算一个关键步骤，能给出一个适用场景与一个反例，能解释参数变化，并能设计独立评价。模型名记得多只是起点。
        </p>
        <a href="#/ai-labs?lab=search">
          练习 Search、Tree、NMS、Retrieval 与 Agent reliability →
        </a>
        <p>
          <a href="#/atlas">浏览全部课程 →</a> ·{" "}
          <a href="#/guide">按任务比较模型 →</a> ·{" "}
          <a href="#/bio-algorithms?lab=em">Single-cell / Spatial 实践分支 →</a>
        </p>
      </section>
    </main>
  );
}
