import type { Lesson } from "../data/lessons";
import type { AnimationStep } from "./labs/types";

export function courseAnimationSteps(lesson: Lesson): AnimationStep[] {
  return lesson.mechanicsSteps.map((explanation) => {
    const clause = explanation.split(/[，；。：;:]/)[0];
    return {
      title: clause.length > 24 ? clause.slice(0, 23) + "…" : clause,
      explanation,
    };
  });
}

export default function CourseWalkthrough({
  lesson,
  step,
}: {
  lesson: Lesson;
  step: number;
}) {
  const steps = courseAnimationSteps(lesson);
  return (
    <div
      className="course-walkthrough"
      aria-label={`${lesson.title}的逐步流程`}
    >
      <div className="course-walkthrough-track" aria-hidden="true">
        <div
          style={{ height: `${(step / Math.max(1, steps.length - 1)) * 100}%` }}
        />
      </div>
      <ol>
        {steps.map((item, index) => (
          <li
            key={item.title}
            className={
              index === step ? "current" : index < step ? "visited" : ""
            }
            aria-current={index === step ? "step" : undefined}
          >
            <span className="course-step-orb">
              {index < step ? "✓" : String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <span>STEP {index + 1}</span>
              <strong>{item.title}</strong>
            </div>
            {index === step && (
              <span className="course-step-moving" aria-hidden="true">
                →
              </span>
            )}
          </li>
        ))}
      </ol>
      <p className="course-flow-caption">
        跟随流程，再看下方本步的完整说明。步骤依据本课机制拆解。
      </p>
    </div>
  );
}
