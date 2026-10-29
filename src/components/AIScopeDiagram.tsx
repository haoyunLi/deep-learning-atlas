export default function AIScopeDiagram() {
  return (
    <figure
      className="ai-scope"
      aria-label="AI 包含多种方法；Deep Learning 属于 Machine Learning；CV、Language 与 Agent 是交叉的任务或系统轴"
    >
      <figcaption>
        <strong>Artificial Intelligence</strong>
        <span>感知 · 学习 · 推理 · 决策</span>
      </figcaption>
      <div className="ai-scope-methods">
        <div className="ai-scope-learning">
          <strong>Machine Learning</strong>
          <span>Linear models · Trees · Kernels</span>
          <div>
            <strong>Deep Learning</strong>
            <span>CNN · Transformer · GNN</span>
          </div>
        </div>
        <div className="ai-scope-reasoning">
          <strong>Search & Reasoning</strong>
          <span>Rules · A* · Logic</span>
          <p>可以直接求解，也可以与学习结合。</p>
        </div>
      </div>
      <div className="ai-scope-applications">
        <strong>这些方法可以解决哪些任务？</strong>
        <span>Vision · Language · Speech · Retrieval · Control</span>
      </div>
      <div className="ai-scope-systems">
        <strong>Workflow / Agent</strong>
        <span>组合 models、tools、memory 与 evaluation</span>
      </div>
      <p>
        RL、Self-supervised 等是学习方式；CV 是任务领域；Agent
        是系统。它们不是互斥的同级类别。
      </p>
    </figure>
  );
}
