import { mlBreadthFigures } from "../data/mlBreadthFigures";
import { cvBreadthFigures } from "../data/cvBreadthFigures";
import { agentBreadthFigures } from "../data/agentBreadthFigures";
import "./bio-algorithms.css";
const figures = {
  ...mlBreadthFigures,
  ...cvBreadthFigures,
  ...agentBreadthFigures,
};
const labs: Record<string, string> = {
  "decision-tree-splits": "tree",
  "planning-search-astar": "search",
  "detection-metrics-nms": "nms",
  "hybrid-retrieval-reranking": "retrieval",
  "agent-reliability-budgets": "reliability",
};
export default function BreadthLessonFigure({
  lessonId,
}: {
  lessonId: string;
}) {
  const figure = figures[lessonId];
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
        {labs[lessonId] && (
          <p>
            <a href={`#/ai-labs?lab=${labs[lessonId]}`}>
              改变参数，逐步验证相关算法机制 →
            </a>
          </p>
        )}
        <a href="#/landscape">这节课在 AI / ML 全景的什么位置？ →</a>
      </figcaption>
    </figure>
  );
}
