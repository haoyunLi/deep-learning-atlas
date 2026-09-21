import "../../studio.css";
import AlgorithmArena from "./AlgorithmArena";
import CodeLab from "./CodeLab";
import LearningStudio from "./LearningStudio";
import ProjectCases from "./ProjectCases";
import ShapeDebugger from "./ShapeDebugger";

export default function StudioPage({
  path,
  query,
}: {
  path: string;
  query: string;
}) {
  if (path === "/studio/code") return <CodeLab query={query} />;
  if (path === "/studio/shapes") return <ShapeDebugger />;
  if (path === "/studio/arena") return <AlgorithmArena />;
  if (path === "/studio/projects") return <ProjectCases query={query} />;
  return <LearningStudio />;
}
