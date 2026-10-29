import { useLayoutEffect } from "react";
import type { Lesson } from "../data/lessons";
import AnimatedExplainer from "./AnimatedExplainer";
import HandCalculationSandbox from "./HandCalculationSandbox";
import LessonExercises from "./LessonExercises";
import FoundationContrasts from "./FoundationContrasts";
import CompleteLessonLab from "./CompleteLessonLab";
import { completeLabCatalog } from "../data/completeLabCatalog";
import { biologyConnections, biologyChapterUrl, biologyLabUrl } from "../data/biologyConnections";

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
      {biologyConnections[lesson.id] && (
        <p className="training-lesson-link">
          <strong>先连接生物对象：</strong>{" "}
          <a href={biologyChapterUrl(biologyConnections[lesson.id].chapter)}>
            {biologyConnections[lesson.id].label} ↗
          </a>{" "} · {" "}
          <a href={biologyLabUrl(biologyConnections[lesson.id].lab)}>Bio/CS 机制实验 ↗</a>
        </p>
      )}
      {lesson.id === "backpropagation" && (
        <p className="training-lesson-link">
          <a href="#/studio/training">
            进一步：把 Forward、两层 chain rule 与同时 SGD 串成一轮可调计算 →
          </a>
        </p>
      )}
      {completeLabCatalog[lesson.id] ? (
        <CompleteLessonLab key={lesson.id} lesson={lesson} />
      ) : (
        <AnimatedExplainer key={lesson.id} lesson={lesson} />
      )}
      <FoundationContrasts key={`contrast-${lesson.id}`} lessonId={lesson.id} />
      <HandCalculationSandbox
        key={`sandbox-${lesson.id}`}
        lessonId={lesson.id}
      />
    </>
  );
}
