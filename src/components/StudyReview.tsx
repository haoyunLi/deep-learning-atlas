import { lessons } from "../data/lessons";
import { exercises } from "../data/exercises";
import { questionSignature, useStudyState } from "../lib/studyState";
import "../study.css";

export default function StudyReview() {
  const state = useStudyState();
  const rows = lessons.map((lesson) => ({
    lesson,
    questions: (exercises[lesson.id] || [])
      .map((exercise) => ({ exercise, attempt: state.attempts[exercise.id] }))
      .filter(
        ({ exercise, attempt }) =>
          attempt &&
          attempt.selected < exercise.options.length &&
          attempt.signature === questionSignature(exercise),
      ),
  }));
  const answered = rows.reduce((sum, row) => sum + row.questions.length, 0);
  const correct = rows.reduce(
    (sum, row) =>
      sum +
      row.questions.filter((q) => q.attempt.selected === q.exercise.answer)
        .length,
    0,
  );
  const wrong = rows.filter((row) =>
    row.questions.some((q) => q.attempt.selected !== q.exercise.answer),
  );
  const last = lessons.find((lesson) => lesson.id === state.lastLesson);
  return (
    <main className="utility-page page-gutter study-review">
      <div className="utility-heading">
        <a href="#/atlas">← 算法图谱</a>
        <h1>学过之后，再检验一次。</h1>
        <p>
          Study log · 阅读标记与答题结果分别记录；答对两题不等于掌握全部内容。
        </p>
      </div>
      <div className="study-metrics">
        <div>
          <strong>
            {state.completed.length}/{lessons.length}
          </strong>
          <span>标记已学</span>
        </div>
        <div>
          <strong>
            {answered}/{lessons.length * 2}
          </strong>
          <span>已作答</span>
        </div>
        <div>
          <strong>{correct}</strong>
          <span>最近一次答对</span>
        </div>
        <div>
          <strong>{answered - correct}</strong>
          <span>待复习题目</span>
        </div>
      </div>
      {last && (
        <a className="study-resume" href={`#/lesson/${last.id}`}>
          继续上次阅读：{last.title} →
        </a>
      )}
      <p className="study-note">
        记录保存在当前浏览器，无账号同步。再次提交会更新该题记录；课程题目修订后，旧答案不计入本页。
        {state.storageUnavailable &&
          " 当前浏览器无法保存，只能保留本次打开期间的记录。"}
      </p>
      <h2>
        值得再想一遍 <span>Review mistakes</span>
      </h2>
      {wrong.length ? (
        <div className="study-review-list">
          {wrong.map(({ lesson, questions }) => (
            <article key={lesson.id}>
              <h3>
                <a href={`#/lesson/${lesson.id}?exercise=1`}>
                  {lesson.title} →
                </a>
              </h3>
              {questions
                .filter((q) => q.attempt.selected !== q.exercise.answer)
                .map(({ exercise, attempt }) => (
                  <div key={exercise.id}>
                    <strong>
                      {exercise.kind === "mechanism" ? "机制" : "选型 / 排错"} ·{" "}
                      {exercise.question}
                    </strong>
                    <p>上次选择：{exercise.options[attempt.selected]}</p>
                  </div>
                ))}
              <a href={`#/lesson/${lesson.id}?exercise=1`}>回到本课重新作答</a>
            </article>
          ))}
        </div>
      ) : (
        <div className="study-empty">
          <strong>
            {answered ? "目前没有待复习的错题" : "还没有答题记录"}
          </strong>
          <p>
            {answered
              ? "继续学习其他课程，或尝试解释某个参数为何改变结果。"
              : "从感兴趣的课程开始，完成课程末尾的两道练习后，这里会显示复习线索。"}
          </p>
          <a href="#/guide">按任务选择起点 →</a>
        </div>
      )}
      <h2>
        已学课程 <span>Reading history</span>
      </h2>
      <div className="study-read-list">
        {state.completed.length ? (
          lessons
            .filter((l) => state.completed.includes(l.id))
            .map((lesson) => (
              <a key={lesson.id} href={`#/lesson/${lesson.id}`}>
                {lesson.title} →
              </a>
            ))
        ) : (
          <p>课程页的“标记已学”可以记录阅读进度。</p>
        )}
      </div>
    </main>
  );
}
