import { useState } from "react";
import type { Exercise } from "../data/exerciseTypes";
import { exercises } from "../data/exercises";
import "../practice.css";
import {
  useStudyState,
  recordAttempt,
  questionSignature,
} from "../lib/studyState";

function Question({ exercise }: { exercise: Exercise }) {
  const study = useStudyState();
  const signature = questionSignature(exercise);
  const saved = study.attempts[exercise.id];
  const [draft, setDraft] = useState<number | null>(null);
  const [retrying, setRetrying] = useState(false);
  const submitted = Boolean(
    saved &&
    saved.signature === signature &&
    saved.selected < exercise.options.length &&
    !retrying,
  );
  const selected = submitted ? saved.selected : draft;
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
              onChange={() => setDraft(index)}
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
            setDraft(null);
            setRetrying(true);
          } else if (selected !== null) {
            recordAttempt(exercise.id, {
              selected,
              correct: selected === exercise.answer,
              signature,
              updatedAt: Date.now(),
            });
            setRetrying(false);
          }
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
  const study = useStudyState();
  const questions = exercises[lessonId];
  if (!questions) return null;
  return (
    <section id="exercises" className="detail-section lesson-exercises">
      <h2>
        检验理解 <span>Check your understanding</span>
      </h2>
      <p>
        先预测，再看解释。每节一题机制题、一题选型或排错题；已提交答案保存在当前浏览器，重新作答会更新记录。
      </p>
      <p>
        <a href="#/review">查看学习记录与待复习题目 →</a>
      </p>
      {study.storageUnavailable && (
        <p role="status">浏览器当前无法保存记录；仍可作答，刷新后可能丢失。</p>
      )}
      {questions.map((exercise) => (
        <Question key={`${lessonId}-${exercise.id}`} exercise={exercise} />
      ))}
    </section>
  );
}
