import { useState } from "react";
import type { Exercise } from "../data/exerciseTypes";
import { exercises } from "../data/exercises";
import "../practice.css";

function Question({ exercise }: { exercise: Exercise }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  return (
    <fieldset className="exercise-card">
      <legend>
        <span>
          {exercise.kind === "mechanism"
            ? "01 · 机制 Mechanism"
            : "02 · 选型 / 排错 Decision"}
        </span>
        {exercise.question}
      </legend>
      <div className="exercise-options">
        {exercise.options.map((option, index) => (
          <label
            key={option}
            className={
              submitted && index === exercise.answer ? "exercise-correct" : ""
            }
          >
            <input
              type="radio"
              name={exercise.id}
              checked={selected === index}
              disabled={submitted}
              onChange={() => setSelected(index)}
            />
            <span>
              <b>{String.fromCharCode(65 + index)}.</b> {option}
            </span>
          </label>
        ))}
      </div>
      <button
        className="practice-button"
        disabled={selected === null}
        onClick={() => {
          if (submitted) {
            setSelected(null);
            setSubmitted(false);
          } else setSubmitted(true);
        }}
      >
        {submitted ? "重新思考 Try again" : "检查答案 Check"}
      </button>
      {submitted && (
        <div className="exercise-feedback" role="status">
          <strong>
            {selected === exercise.answer
              ? "✓ 正确"
              : `再看一下：正确选项是 ${String.fromCharCode(65 + exercise.answer)}`}
          </strong>
          <p>{exercise.explanation}</p>
        </div>
      )}
    </fieldset>
  );
}

export default function LessonExercises({ lessonId }: { lessonId: string }) {
  const questions = exercises[lessonId];
  if (!questions) return null;
  return (
    <section id="exercises" className="detail-section lesson-exercises">
      <h2>
        检验理解 <span>Check your understanding</span>
      </h2>
      <p>
        先预测，再看解释。每节一题机制题、一题选型或排错题；答案只保留在当前页面。
      </p>
      {questions.map((exercise) => (
        <Question key={`${lessonId}-${exercise.id}`} exercise={exercise} />
      ))}
    </section>
  );
}
