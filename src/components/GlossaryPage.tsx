import { useMemo, useState } from "react";
import { lessons } from "../data/lessons";
import {
  filterGlossary,
  glossaryEntries,
  glossaryGroups,
  type GlossaryGroup,
} from "../data/glossary";
import "../guidance.css";

const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));
const suggestions = [
  "BN",
  "LayerNorm",
  "KV cache",
  "GQA",
  "RAG",
  "DDIM",
  "OPE",
  "Cohort",
];

export default function GlossaryPage() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<GlossaryGroup | "all">("all");
  const filtered = useMemo(() => filterGlossary(query, group), [query, group]);
  const groupLabel =
    glossaryGroups.find((item) => item.id === group)?.label ?? "全部分组";
  const reset = () => {
    setQuery("");
    setGroup("all");
  };

  return (
    <main className="guidance-page guidance-glossary page-gutter">
      <header className="guidance-heading">
        <a className="guidance-back" href="#/atlas">
          ← 算法图谱
        </a>
        <span className="guidance-eyebrow">GLOSSARY / 随读随查</span>
        <h1>术语，讲人话。</h1>
        <p>
          从缩写找到全称，从一句解释走进课程。{glossaryEntries.length}{" "}
          个中英术语，覆盖数学、训练、数据、模型与推理。
        </p>
      </header>

      <section className="guidance-search-panel" aria-label="查找术语">
        <label className="guidance-input-label" htmlFor="guidance-term-search">
          搜索中文、英文、缩写或概念
        </label>
        <div className="guidance-search-row">
          <input
            id="guidance-term-search"
            type="search"
            placeholder="例如：BN、tokenizer、预测头、流匹配"
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <label
            className="guidance-select-label"
            htmlFor="guidance-term-group"
          >
            <span>知识分组</span>
            <select
              id="guidance-term-group"
              value={group}
              onChange={(event) =>
                setGroup(event.target.value as GlossaryGroup | "all")
              }
            >
              <option value="all">全部分组 · {glossaryEntries.length}</option>
              {glossaryGroups.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} ·{" "}
                  {
                    glossaryEntries.filter((entry) => entry.group === item.id)
                      .length
                  }
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="guidance-suggestions" aria-label="常查缩写">
          <span>常查：</span>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                setQuery(suggestion);
                setGroup("all");
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </section>

      <div className="guidance-results-bar">
        <p role="status" aria-live="polite">
          {groupLabel} · 找到 <strong>{filtered.length}</strong> /{" "}
          {glossaryEntries.length} 个术语
        </p>
        {(query || group !== "all") && (
          <button
            className="guidance-text-button"
            type="button"
            onClick={reset}
          >
            清除筛选
          </button>
        )}
      </div>
      {filtered.length ? (
        <dl className="guidance-term-list">
          {filtered.map((entry) => (
            <div className="guidance-term" key={entry.id}>
              <dt>
                <span className="guidance-term-group">
                  {
                    glossaryGroups.find((item) => item.id === entry.group)
                      ?.label
                  }
                </span>
                <strong>{entry.chinese}</strong>
                <span lang="en" className="guidance-term-english">
                  {entry.english}
                </span>
              </dt>
              <dd>
                <p>{entry.definition}</p>
                <p className="guidance-aliases">
                  <span>相关检索词</span> {entry.aliases.join(" · ")}
                </p>
                <div
                  className="guidance-lesson-links"
                  aria-label={`${entry.chinese}相关课程`}
                >
                  {entry.lessonIds.map((id) => (
                    <a href={`#/lesson/${id}`} key={id}>
                      {lessonById.get(id)?.title ?? id}{" "}
                      <span aria-hidden="true">↗</span>
                    </a>
                  ))}
                </div>
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <section
          className="guidance-empty"
          aria-labelledby="guidance-empty-title"
        >
          <h2 id="guidance-empty-title">还没有匹配的术语。</h2>
          <p>试试缩写、英文全称或更短的中文词；分组筛选也可能限制结果。</p>
          <button type="button" className="guidance-reset" onClick={reset}>
            显示全部术语
          </button>
          <a href="#/atlas">去算法图谱查找课程 →</a>
        </section>
      )}
      <aside className="guidance-endnote">
        <p>知道这些词，还是不确定从哪种方法开始？</p>
        <a href="#/guide">按任务找到起点 →</a>
      </aside>
    </main>
  );
}
