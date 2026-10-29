import { linkedLabs, linkedLabForLesson } from "../data/linkedLabs";
import { useMemo, useState } from "react";
import { categories, lessons } from "../data/lessons";
import {
  animationKind,
  animationCatalog,
  handCalculationLessonIds,
} from "../data/animationCatalog";
import { matchesLesson } from "../lib/search";
import { completeLabCatalog } from "../data/completeLabCatalog";

const kindLabels = {
  parameter: "参数实验",
  visual: "机制动效",
  steps: "步骤导览",
};

export default function AnimationDirectory() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [kind, setKind] = useState("all");
  const filtered = useMemo(
    () =>
      lessons.filter((lesson) => {
        const lab =
          linkedLabForLesson(lesson.id) ??
          completeLabCatalog[lesson.id] ??
          animationCatalog[lesson.id];
        return (
          (category === "all" || lesson.category === category) &&
          (kind === "all" ||
            (linkedLabForLesson(lesson.id) ||
            completeLabCatalog[lesson.id] ||
            handCalculationLessonIds.includes(lesson.id)
              ? "parameter"
              : animationKind(lesson.id)) === kind) &&
          matchesLesson(lesson, query, lab?.label || "")
        );
      }),
    [query, category, kind],
  );
  return (
    <main className="animation-directory page-gutter">
      <div className="animation-directory-intro">
        <div>
          <a className="back-link" href="#/">
            ← 回到学习首页
          </a>
          <h1>让算法在眼前发生。</h1>
          <p>
            固定一组参数作对照，再改变一个设置。逐步比较中间数值、图形和最终结果，理解差异从哪里来。
          </p>
        </div>
        <dl className="animation-stats">
          <div>
            <dt>{lessons.length}</dt>
            <dd>课程已连接机制实验或动效</dd>
          </div>
          <div>
            <dt>{Object.keys(completeLabCatalog).length}</dt>
            <dd>新增逐课数值推演 · 含固定对照</dd>
          </div>
          <div>
            <dt>{Object.keys(animationCatalog).length}</dt>
            <dd>原有课内参数实验 · 另有 {linkedLabs.length} 个跨课实验</dd>
          </div>
        </dl>
      </div>
      <div className="practice-promo">
        <div>
          <strong>进一步：把每个中间数算出来</strong>
          <p>六个逐步手算沙盘、每课两题，以及完整实验案例和 LM 显存计算器。</p>
        </div>
        <a href="#/practice">打开实践工坊 →</a>
      </div>
      <section className="animation-starts" aria-label="动效学习起点">
        <strong>从一个问题开始</strong>
        <a href="#/concepts/biology-regulation-inference">
          Motif、Enhancer、TF、Ligand–Receptor 的计算分数能支持什么生物结论？ ↗
        </a>
        <a href="#/lesson/batch-normalization?animation=1">
          BatchNorm 的 batch statistics 怎样影响当前样本？ ↗
        </a>
        <a href="#/lesson/td3?animation=1">
          TD3 怎样改变 target，为什么要看两个 Critics？ ↗
        </a>
        <a href="#/lesson/speculative-decoding?animation=1">
          Speculative Decoding 为什么需要 residual correction？ ↗
        </a>
        <a href="#/ai-depth?lab=hmm">
          HMM、Kalman、Assignment、Geometry、MCTS 与 Beam 怎样逐步运行？ ↗
        </a>
        <a href="#/ai-labs?lab=tree">
          Tree、A*、NMS、Retrieval 与 Agent reliability 怎样计算？ ↗
        </a>
        <a href="#/bio-algorithms?lab=em">
          EM 如何分配 molecules，GNN 如何跨边界传播？ ↗
        </a>
        <a href="#/studio/training">误差怎样变成一次权重更新？ ↗</a>
        <a href="#/lesson/gradient-descent?animation=1">学习率太大会怎样？ ↗</a>
        <a href="#/lesson/knn?animation=1">k 如何改变近邻投票？ ↗</a>
        <a href="#/lesson/attention?animation=1">Q/K/V 怎样传递信息？ ↗</a>
        <a href="#/lesson/cohort-design?animation=1">
          预测窗口怎样改变标签？ ↗
        </a>
      </section>
      <div className="animation-library-tools">
        <label className="animation-search">
          搜索动效
          <input
            aria-label="搜索动效"
            placeholder="EM、CNN、U-Net、SAC、temperature…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div
          className="animation-kind-filters"
          role="group"
          aria-label="动效类型"
        >
          {[
            ["all", "全部"],
            ["parameter", "可调参数"],
            ["visual", "机制动效"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={kind === id}
              onClick={() => setKind(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="animation-category">
          学习方向
          <select
            aria-label="筛选动效方向"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">全部方向</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="animation-result-count" aria-live="polite">
        {filtered.length} 个结果 ·
        专属图解用合成数据展示机制；步骤导览对应完整课程流程。
      </p>
      <div className="animation-library-grid">
        {filtered.map((lesson, index) => {
          const external = linkedLabForLesson(lesson.id),
            lab =
              external ??
              completeLabCatalog[lesson.id] ??
              animationCatalog[lesson.id],
            type =
              external ||
              completeLabCatalog[lesson.id] ||
              handCalculationLessonIds.includes(lesson.id)
                ? "parameter"
                : animationKind(lesson.id);
          return (
            <a
              className={`animation-library-card kind-${type}`}
              href={
                external?.href ??
                `#/lesson/${lesson.id}?${!lab && handCalculationLessonIds.includes(lesson.id) ? "sandbox" : "animation"}=1`
              }
              key={lesson.id}
            >
              <div className="animation-card-top">
                <span>{kindLabels[type]}</span>
                <small>
                  {categories.find((c) => c.id === lesson.category)?.label}
                </small>
              </div>
              <h2>{lesson.title}</h2>
              <p className="animation-card-english">{lesson.englishTitle}</p>
              <p className="animation-card-description">
                {lab ? lab.hint : lesson.summary}
              </p>
              <div className="animation-card-bottom">
                <span>
                  {lab
                    ? `调节：${lab.label}`
                    : type === "parameter"
                      ? "打开逐步手算沙盘"
                      : `${lesson.mechanicsSteps.length} 个课程步骤`}
                </span>
                <b aria-hidden="true">↗</b>
              </div>
              <span className="animation-card-index" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
            </a>
          );
        })}
      </div>
      {!filtered.length && (
        <div className="empty-results">
          没有找到匹配动效。
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("all");
              setKind("all");
            }}
          >
            清除筛选
          </button>
        </div>
      )}
    </main>
  );
}
