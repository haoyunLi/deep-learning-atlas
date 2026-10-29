import { mlDepthFigures } from "../data/mlDepthFigures";
import { cvDepthFigures } from "../data/cvDepthFigures";
import { agentDepthFigures } from "../data/agentDepthFigures";
import { linkedLabForLesson } from "../data/linkedLabs";
import { mlBreadthFigures } from "../data/mlBreadthFigures";
import { cvBreadthFigures } from "../data/cvBreadthFigures";
import { agentBreadthFigures } from "../data/agentBreadthFigures";
import "./bio-algorithms.css";
const figures = {
  ...mlBreadthFigures,
  ...cvBreadthFigures,
  ...agentBreadthFigures,
  ...mlDepthFigures,
  ...cvDepthFigures,
  ...agentDepthFigures,
};
export default function BreadthLessonFigure({
  lessonId,
}: {
  lessonId: string;
}) {
  const figure = figures[lessonId],
    lab = linkedLabForLesson(lessonId);
  if (!figure) return null;
  return (
    <figure className="bio-lesson-figure">
      <h2>{figure.question}</h2>
      <ol aria-label="输入、中间计算与输出">
        {figure.nodes.map((n, i) => (
          <li key={n.title}>
            <strong>{n.title}</strong>
            <p>{n.detail}</p>
            {i < 2 && <small>→ {figure.edges[i]}</small>}
          </li>
        ))}
      </ol>
      <figcaption>
        <p>{figure.caption}</p>
        {lab && (
          <p>
            <a href={lab.href}>改变参数，逐步验证相关算法机制 →</a>
          </p>
        )}
        <a href="#/landscape">这节课在 AI / ML 全景的什么位置？ →</a>
      </figcaption>
    </figure>
  );
}
