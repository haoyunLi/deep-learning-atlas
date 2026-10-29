import { bioInferenceFigures } from "../data/bioInferenceFigures";
import { bioGraphFigures } from "../data/bioGraphFigures";
import "./bio-algorithms.css";
const figures = { ...bioInferenceFigures, ...bioGraphFigures };
const related: Record<string, string> = {
  "expectation-maximization": "em",
  "spatial-assignment": "em",
  ppo: "gae",
  "offline-rl": "planning",
  gnn: "gcn",
  gcn: "gcn",
  gat: "gat",
  graphsage: "gcn",
  "contrastive-learning": "contrastive",
  scvi: "em",
};
export default function BioLessonFigure({ lessonId }: { lessonId: string }) {
  const figure = figures[lessonId];
  if (!figure)
    return related[lessonId] ? (
      <p className="lesson-research-context">
        <a href={`#/bio-algorithms?lab=${related[lessonId]}`}>
          把本课接到 Single-cell / Spatial：打开可计算的 biological algorithm
          lab →
        </a>
      </p>
    ) : null;
  return (
    <figure className="bio-lesson-figure">
      <h2>{figure.question}</h2>
      <ol aria-label="Input 到 intermediate calculation 再到 output">
        {figure.nodes.map((node, i) => (
          <li key={node.title}>
            <strong>{node.title}</strong>
            <p>{node.detail}</p>
            {i < 2 && <small>→ {figure.edges[i]}</small>}
          </li>
        ))}
      </ol>
      <figcaption>
        <p>{figure.caption}</p>
        <a href={`#/bio-algorithms?lab=${figure.lab}`}>
          在相关数值实验中改变参数，检验这个机制 →
        </a>
      </figcaption>
    </figure>
  );
}
