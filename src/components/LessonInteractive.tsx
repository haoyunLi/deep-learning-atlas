import { useLayoutEffect } from "react";
import type { Lesson } from "../data/lessons";
import AnimatedExplainer from "./AnimatedExplainer";
import HandCalculationSandbox from "./HandCalculationSandbox";
import LessonExercises from "./LessonExercises";

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
      <AnimatedExplainer key={lesson.id} lesson={lesson} />
      <HandCalculationSandbox
        key={`sandbox-${lesson.id}`}
        lessonId={lesson.id}
      />
    </>
  );
}
