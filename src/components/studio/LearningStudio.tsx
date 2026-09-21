import { useMemo } from "react";
import { lessons } from "../../data/lessons";
import { useStudyState } from "../../lib/studyState";
import {
  answerDiagnostic,
  resetDiagnostic,
  setMastery,
  useStudioState,
  type MasteryLevel,
} from "../../studio/studioState";
import { StudioSectionTitle, StudioShell, StatusDot } from "./StudioShell";

const masteryTopics = [
  {
    id: "foundation",
    label: "数学与训练",
    english: "Math & training",
    lessonIds: [
      "gradient-descent",
      "backpropagation",
      "batch-normalization",
      "mixed-precision",
    ],
  },
  {
    id: "vision",
    label: "视觉模型",
    english: "Vision",
    lessonIds: ["cnn", "resnet", "unet", "detr"],
  },
  {
    id: "sequence",
    label: "序列与语言",
    english: "Sequence & language",
    lessonIds: [
      "rnn",
      "attention",
      "transformer",
      "retrieval-augmented-generation",
    ],
  },
  {
    id: "representation",
    label: "表示学习",
    english: "Representation",
    lessonIds: ["word2vec", "contrastive-learning", "autoencoder-vae"],
  },
  {
    id: "decision",
    label: "强化学习",
    english: "Decision learning",
    lessonIds: ["q-learning", "ppo", "offline-rl"],
  },
  {
    id: "practice",
    label: "验证与部署",
    english: "Validation & delivery",
    lessonIds: [
      "data-leakage",
      "calibration-uncertainty",
      "model-serving-monitoring",
    ],
  },
];

const levels = [
  { value: 0 as const, label: "未开始", english: "Not started" },
  { value: 1 as const, label: "能解释", english: "Explain" },
  { value: 2 as const, label: "能实现", english: "Implement" },
  { value: 3 as const, label: "能诊断", english: "Diagnose" },
];

const diagnosticQuestions = [
  {
    id: "goal",
    question: "你下一步最想完成什么？",
    options: [
      ["mechanism", "看懂模型为何有效"],
      ["code", "从公式写到代码"],
      ["debug", "定位训练和形状错误"],
      ["project", "完成一个端到端项目"],
    ],
  },
  {
    id: "tensor",
    question: "看到 x: [B,T,D] 时，你能追踪 reshape 吗？",
    options: [
      ["new", "还不熟悉"],
      ["read", "能读懂"],
      ["write", "能独立写"],
      ["debug", "能定位广播和轴错误"],
    ],
  },
  {
    id: "evaluation",
    question: "你怎样选择模型与超参数？",
    options: [
      ["unsure", "主要跟随默认值"],
      ["validation", "使用固定验证集"],
      ["budget", "比较同一切分与预算"],
      ["stress", "还会做消融和压力测试"],
    ],
  },
];

function recommendation(answers: Record<string, string>) {
  if (!answers.goal)
    return {
      href: "#/studio/code",
      title: "先做 8 分钟诊断，再打开 Attention Code Lab",
      reason: "用三个问题把起点从“感觉会”变成可行动的证据。",
    };
  if (answers.tensor === "new" || answers.tensor === "read")
    return {
      href: "#/studio/shapes",
      title: "从 Tensor Shape Debugger 开始",
      reason: "先把轴、元素数和 reshape 契约练成可检查的步骤。",
    };
  if (answers.goal === "project")
    return {
      href: "#/studio/projects",
      title: "选择一个端到端项目",
      reason: "按问题契约、切分、基线、调参、消融、错误分析、测试和部署推进。",
    };
  if (answers.evaluation === "unsure" || answers.evaluation === "validation")
    return {
      href: "#/studio/arena",
      title: "进入跨算法竞技场",
      reason: "在相同数据、切分和预算下观察模型何时胜出或失效。",
    };
  return {
    href: "#/studio/code?lesson=attention",
    title: "继续 Attention Production Lab",
    reason: "把机制、shape、复杂度、梯度和生产检查连成一条链。",
  };
}

export default function LearningStudio() {
  const study = useStudyState();
  const studio = useStudioState();
  const suggested = recommendation(studio.diagnostic);
  const completed = useMemo(() => new Set(study.completed), [study.completed]);

  return (
    <StudioShell
      route="/studio"
      eyebrow="LEARNING STUDIO · 学习工作台"
      title="从看懂，到会做。"
      english="Move from intuition to implementation, diagnosis, and delivery."
      intro="诊断你的起点，逐层记录掌握度，再用代码、形状、算法比较和完整项目把知识转为能力。所有进度只保存在当前浏览器。"
    >
      <section className="studio-dashboard">
        <div className="studio-main-column">
          <StudioSectionTitle
            index="01"
            title="掌握度地图"
            english="Mastery map"
            note="点击单元格更新自评"
          />
          <div className="mastery-table" role="table" aria-label="掌握度地图">
            <div className="mastery-row mastery-head" role="row">
              <span role="columnheader">主题</span>
              {levels.map((level) => (
                <span key={level.value} role="columnheader">
                  {level.label}
                  <small>{level.english}</small>
                </span>
              ))}
              <span role="columnheader">课程证据</span>
            </div>
            {masteryTopics.map((topic) => {
              const evidence = topic.lessonIds.filter((id) =>
                completed.has(id),
              ).length;
              const selected = studio.mastery[topic.id] ?? 0;
              return (
                <div className="mastery-row" role="row" key={topic.id}>
                  <span role="rowheader">
                    <strong>{topic.label}</strong>
                    <small>{topic.english}</small>
                  </span>
                  {levels.map((level) => (
                    <button
                      key={level.value}
                      className={selected === level.value ? "selected" : ""}
                      aria-label={`${topic.label}：${level.label}`}
                      aria-pressed={selected === level.value}
                      onClick={() =>
                        setMastery(topic.id, level.value as MasteryLevel)
                      }
                    >
                      <span>{selected === level.value ? "●" : "○"}</span>
                    </button>
                  ))}
                  <span className="mastery-evidence">
                    {evidence}/{topic.lessonIds.length}
                    <small>已完成</small>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="studio-side-column">
          <StudioSectionTitle
            index="02"
            title="学习前诊断"
            english="Entry diagnostic"
          />
          <div className="diagnostic-list">
            {diagnosticQuestions.map((item, questionIndex) => (
              <fieldset key={item.id}>
                <legend>
                  <span>{questionIndex + 1}</span>
                  {item.question}
                </legend>
                {item.options.map(([value, label]) => (
                  <label key={value}>
                    <input
                      type="radio"
                      name={item.id}
                      value={value}
                      checked={studio.diagnostic[item.id] === value}
                      onChange={() => answerDiagnostic(item.id, value)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </fieldset>
            ))}
            {Object.keys(studio.diagnostic).length > 0 && (
              <button className="studio-text-button" onClick={resetDiagnostic}>
                重新诊断 Reset
              </button>
            )}
          </div>
        </aside>
      </section>

      <section className="studio-recommendation" aria-live="polite">
        <div>
          <StatusDot tone="green" />
          <span>NEXT STEP · 下一步</span>
        </div>
        <h2>{suggested.title}</h2>
        <p>{suggested.reason}</p>
        <a className="studio-primary-button" href={suggested.href}>
          继续学习 <span>→</span>
        </a>
      </section>

      <section className="studio-tool-summary">
        {[
          [
            "Code Lab",
            "同一算法的 From scratch / PyTorch / Production 三层实现。",
            "#/studio/code",
          ],
          [
            "Shape Debugger",
            "让每个 tensor 轴、参数量和错误条件都可见。",
            "#/studio/shapes",
          ],
          [
            "Algorithm Arena",
            "固定数据、切分与预算，比较五种算法。",
            "#/studio/arena",
          ],
          [
            "Project Cases",
            "七个项目，每个按八阶段交付证据。",
            "#/studio/projects",
          ],
        ].map(([title, text, href], index) => (
          <a href={href} key={title}>
            <span>0{index + 1}</span>
            <strong>{title}</strong>
            <p>{text}</p>
            <em>打开 →</em>
          </a>
        ))}
      </section>
      {studio.storageUnavailable && (
        <p className="studio-storage-warning" role="status">
          浏览器无法保存本地进度；当前操作仍可继续。
        </p>
      )}
      <p className="studio-course-count">
        课程库现有 {lessons.length} 节；工作台把阅读、练习和项目证据连接起来。
      </p>
    </StudioShell>
  );
}
