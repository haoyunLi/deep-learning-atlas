import { useLayoutEffect } from "react";
import type { Lesson } from "../data/lessons";
import AnimatedExplainer from "./AnimatedExplainer";
import HandCalculationSandbox from "./HandCalculationSandbox";
import LessonExercises from "./LessonExercises";
import FoundationContrasts from "./FoundationContrasts";

export default function LessonInteractive({
  lesson,
  part,
  jump,
}: {
  lesson: Lesson;
  part: "visual" | "quiz";
  jump?: string;
}) {
  useLayoutEffect(() => {
    if (
      jump &&
      ((part === "quiz" && jump === "exercises") ||
        (part === "visual" && jump !== "exercises"))
    )
      document.getElementById(jump)?.scrollIntoView({ behavior: "instant" });
  }, [lesson.id, part, jump]);
  return part === "quiz" ? (
    <LessonExercises key={lesson.id} lessonId={lesson.id} />
  ) : (
    <>
      {lesson.id === "backpropagation" && (
        <p className="training-lesson-link">
          <a href="#/studio/training">
            进一步：把 Forward、两层 chain rule 与同时 SGD 串成一轮可调计算 →
          </a>
        </p>
      )}
      <AnimatedExplainer key={lesson.id} lesson={lesson} />
      <FoundationContrasts key={`contrast-${lesson.id}`} lessonId={lesson.id} />
      <HandCalculationSandbox
        key={`sandbox-${lesson.id}`}
        lessonId={lesson.id}
      />
    </>
  );
}
