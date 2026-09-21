import {
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { categories, lessons, type Lesson } from "./data/lessons";
import { conceptPaths } from "./data/conceptPaths";
import AnimationDirectory from "./components/AnimationDirectory";
import {
  mechanismCount,
  animationCatalog,
  handCalculationLessonIds,
} from "./data/animationCatalog";
import RouteErrorBoundary from "./components/RouteErrorBoundary";
const LessonInteractive = lazy(() => import("./components/LessonInteractive"));
import { useStudyState, toggleCompleted, visitLesson } from "./lib/studyState";
import { matchesLesson } from "./lib/search";
import { hashParts, replaceHash } from "./lib/routing";
import "./study.css";
import "./practice.css";
import "./animation.css";
const StudyReview = lazy(() => import("./components/StudyReview"));
const GlossaryPage = lazy(() => import("./components/GlossaryPage"));
const ModelGuide = lazy(() => import("./components/ModelGuide"));
const PracticeHub = lazy(() => import("./components/PracticeHub"));
const StudioPage = lazy(() => import("./components/studio/StudioPage"));

const repoUrl = "https://github.com/haoyunLi/deep-learning-atlas";
const codeLabLessonIds = new Set([
  "attention",
  "cnn",
  "rnn",
  "unet",
  "gnn",
  "meta-learning-maml",
]);
function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
}

function ArrowIcon({ diagonal = false }: { diagonal?: boolean }) {
  return diagonal ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 19 19 5M8 5h11v11" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 12h15m-6-6 6 6-6 6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </svg>
  );
}

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <a className="brand" href="#/" onClick={onClick}>
      <strong>深度学习图谱</strong>
      <span className="brand-divider" />
      <span>Deep Learning Atlas</span>
    </a>
  );
}

function Header({ route }: { route: string }) {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#/studio", label: "学习工作台" },
    { href: "#/path", label: "学习路径" },
    { href: "#/animations", label: "动效实验室" },
    { href: "#/practice", label: "实践工坊" },
    { href: "#/concepts", label: "关键概念" },
    { href: "#/atlas", label: "算法图谱" },
    { href: "#/compare", label: "对比" },
    { href: "#/guide", label: "怎么选" },
    { href: "#/glossary", label: "术语" },
  ];
  return (
    <header className="site-header">
      <div className="header-inner">
        <Logo onClick={() => setOpen(false)} />
        <button
          className="mobile-menu"
          aria-label="切换导航"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav className={open ? "nav open" : "nav"} aria-label="主导航">
          {links.map((link) => (
            <a
              key={link.href}
              className={
                route === link.href.slice(1) ||
                (link.href === "#/studio" && route.startsWith("/studio/")) ||
                (link.href === "#/concepts" && route.startsWith("/concepts/"))
                  ? "active"
                  : ""
              }
              href={link.href}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href={repoUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
          >
            GitHub <ArrowIcon diagonal />
          </a>
        </nav>
      </div>
    </header>
  );
}

function NetworkDiagram() {
  const layers = [
    { x: 55, ys: [102, 164, 226, 288] },
    { x: 205, ys: [72, 122, 172, 222, 272, 322] },
    { x: 355, ys: [72, 122, 172, 222, 272, 322] },
    { x: 505, ys: [142, 242] },
  ];
  return (
    <div
      className="network-wrap"
      aria-label="神经网络前向传播与反向传播示意图"
      role="img"
    >
      <svg
        className="network-svg"
        viewBox="0 0 570 405"
        preserveAspectRatio="xMidYMid meet"
      >
        <g className="network-labels">
          <text x="55" y="30">
            输入层
          </text>
          <text x="205" y="30">
            隐藏层
          </text>
          <text x="355" y="30">
            隐藏层
          </text>
          <text x="505" y="30">
            输出层
          </text>
          <text x="55" y="49">
            Input
          </text>
          <text x="205" y="49">
            Hidden
          </text>
          <text x="355" y="49">
            Hidden
          </text>
          <text x="505" y="49">
            Output
          </text>
        </g>
        <g className="network-edges">
          {layers
            .slice(0, -1)
            .flatMap((layer, i) =>
              layer.ys.flatMap((y, a) =>
                layers[i + 1].ys.map((nextY, b) => (
                  <line
                    key={`${i}-${a}-${b}`}
                    x1={layer.x + 10}
                    y1={y}
                    x2={layers[i + 1].x - 10}
                    y2={nextY}
                  />
                )),
              ),
            )}
        </g>
        <g className="network-nodes">
          {layers.flatMap((layer, i) =>
            layer.ys.map((y, j) => (
              <circle key={`${i}-${j}`} cx={layer.x} cy={y} r="10" />
            )),
          )}
        </g>
        <g className="network-tokens">
          {["x₁", "x₂", "x₃", "x₄"].map((t, i) => (
            <text key={t} x="20" y={layers[0].ys[i] + 5}>
              {t}
            </text>
          ))}
          <text x="529" y="147">
            ŷ₁
          </text>
          <text x="529" y="247">
            ŷ₂
          </text>
        </g>
        <line
          className="network-flow"
          x1="85"
          y1="367"
          x2="475"
          y2="367"
          markerEnd="url(#arrow)"
        />
        <line
          className="network-flow backward"
          x1="475"
          y1="390"
          x2="85"
          y2="390"
          markerEnd="url(#arrow)"
        />
        <text className="flow-text" x="230" y="359">
          前向传播 · Forward pass
        </text>
        <text className="flow-text" x="218" y="385">
          反向传播 · Backprop
        </text>
        <defs>
          <marker
            id="arrow"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
          >
            <path d="M0 0 8 4 0 8" fill="none" stroke="#254f91" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

function Home({
  initialSection,
  routeQuery = "",
}: {
  initialSection?: "path" | "atlas";
  routeQuery?: string;
}) {
  const params = new URLSearchParams(routeQuery);
  const [query, setQuery] = useState(params.get("q") || "");
  const [category, setCategory] = useState(params.get("category") || "all");
  const [sort, setSort] = useState<"route" | "az">(
    params.get("sort") === "az" ? "az" : "route",
  );
  const [status, setStatus] = useState(params.get("status") || "all");
  const study = useStudyState();
  const completed = study.completed;
  const last = lessons.find((lesson) => lesson.id === study.lastLesson);
  useEffect(() => {
    const next = new URLSearchParams(routeQuery);
    setQuery(next.get("q") || "");
    setCategory(
      categories.some((c) => c.id === next.get("category"))
        ? next.get("category")!
        : "all",
    );
    setSort(next.get("sort") === "az" ? "az" : "route");
    setStatus(
      ["done", "todo"].includes(next.get("status") || "")
        ? next.get("status")!
        : "all",
    );
  }, [routeQuery]);
  function filterChange(
    patch: Partial<{
      q: string;
      category: string;
      sort: string;
      status: string;
    }>,
  ) {
    const next = { q: query, category, sort, status, ...patch };
    setQuery(next.q);
    setCategory(next.category);
    setSort(next.sort === "az" ? "az" : "route");
    setStatus(next.status);
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(next))
      if (value && value !== "all" && !(key === "sort" && value === "route"))
        params.set(key, value);
    replaceHash("/atlas", params);
  }
  const filtered = useMemo(
    () =>
      lessons
        .filter((lesson) => {
          const matchesCategory =
            category === "all" || lesson.category === category;
          return (
            matchesCategory &&
            matchesLesson(lesson, query) &&
            (status === "all" ||
              (status === "done"
                ? completed.includes(lesson.id)
                : !completed.includes(lesson.id)))
          );
        })
        .sort((a, b) =>
          sort === "az"
            ? a.englishTitle.localeCompare(b.englishTitle)
            : lessons.indexOf(a) - lessons.indexOf(b),
        ),
    [query, category, sort, status, completed],
  );

  useLayoutEffect(() => {
    if (initialSection)
      document
        .getElementById(initialSection)
        ?.scrollIntoView({ behavior: "instant" });
  }, [initialSection]);

  return (
    <main>
      <section className="hero page-gutter">
        <div className="hero-copy">
          <h1>把深度学习看懂，再用对。</h1>
          <p className="hero-en">
            From intuition to implementation — 一次理清原理、选择与调参。
          </p>
          <p className="hero-description">
            从 kNN、EM 到 BERT、U-Net、PPO 与 Reward Model，再到
            head、zero/few-shot 与
            cohort，用直觉、逐步机制、对比和调参步骤看懂方法，并在真实问题中做出合适的选择。
          </p>
          <a className="primary-button" href="#/atlas">
            开始学习 <ArrowIcon />
          </a>
        </div>
        <NetworkDiagram />
      </section>

      <section className="study-summary" aria-label="我的学习进度">
        <div>
          <strong>
            已标记 {completed.length} / {lessons.length} 节课程
          </strong>
          <p>
            {study.storageUnavailable
              ? "浏览器暂时无法保存，记录仅在本次打开期间有效。"
              : "阅读和答题分别记录，保存在当前浏览器。"}
          </p>
        </div>
        <div className="study-summary-links">
          {last && <a href={`#/lesson/${last.id}`}>继续：{last.title} →</a>}
          <a href="#/review">学习记录与错题复习 →</a>
        </div>
      </section>
      <section
        className="learning-studio-promo page-gutter"
        aria-labelledby="studio-promo-title"
      >
        <div>
          <span>NEW · LEARNING STUDIO</span>
          <h2 id="studio-promo-title">
            从会解释，走到会实现、会诊断、会交付。
          </h2>
          <p>
            学习前诊断与掌握度地图 · 三层代码实验 · 五类 Tensor Shape Debugger ·
            同切分算法竞技场 · 八个端到端项目
          </p>
        </div>
        <nav aria-label="学习工作台快捷入口">
          <a href="#/studio">打开工作台 →</a>
          <a href="#/studio/code">Code Lab</a>
          <a href="#/studio/shapes">Shape Debugger</a>
          <a href="#/studio/arena">Algorithm Arena</a>
        </nav>
      </section>
      <section className="route-section page-gutter" id="path">
        <div className="section-intro">
          <h2>学习路径</h2>
          <p>Learning Route</p>
        </div>
        <div className="route-grid">
          {categories.map((item, index) => (
            <button
              className="route-item"
              key={item.id}
              onClick={() => {
                filterChange({ category: item.id });
                document
                  .getElementById("atlas")
                  ?.scrollIntoView({ behavior: scrollBehavior() });
              }}
            >
              <div className="route-line">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <i />
              </div>
              <strong>{item.label}</strong>
              <em>{item.englishLabel}</em>
              <small>{item.description}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="concept-preview page-gutter">
        <div>
          <span className="concept-kicker">KEY IDEAS · CONNECTED</span>
          <h2>把容易混淆的概念，接成一条线。</h2>
          <p>
            两种 head 的含义、zero-shot 到 few-shot、prompt
            中的示例与参数微调、cohort
            到外部验证：先看区别，再沿着实际任务学会使用。
          </p>
        </div>
        <a href="#/concepts">
          探索关键概念路径 <ArrowIcon />
        </a>
      </section>

      <section
        className="animation-promo page-gutter"
        aria-labelledby="animation-promo-title"
      >
        <div className="animation-promo-heading">
          <h2 id="animation-promo-title">跟着动效，看懂算法的每一步。</h2>
          <a className="animation-all-link" href="#/animations">
            {lessons.length} 节步骤动效 · {mechanismCount} 张机制图 ·{" "}
            {Object.keys(animationCatalog).length} 个参数实验　浏览全部 →
          </a>
        </div>
        <div className="animation-promo-grid">
          {[
            {
              id: "attention",
              number: "01 / ATTENTION",
              title: "注意力如何汇总信息",
              description: "从 Q/K/V、mask、softmax 到加权求和",
            },
            {
              id: "diffusion",
              number: "02 / DIFFUSION",
              title: "扩散如何从噪声生成",
              description: "从训练时加噪到生成时多步去噪",
            },
            {
              id: "ppo",
              number: "03 / PPO",
              title: "PPO 如何控制更新",
              description: "跟着概率比理解 clipped surrogate",
            },
          ].map((item) => (
            <a key={item.id} href={`#/lesson/${item.id}`}>
              <span>{item.number}</span>
              <strong>{item.title}</strong>
              <small>{item.description}</small>
              <ArrowIcon diagonal />
            </a>
          ))}
        </div>
      </section>

      <section className="atlas-section page-gutter" id="atlas">
        <div className="practice-promo">
          <div>
            <strong>新：手算、练习与完整实践闭环</strong>
            <p>
              六个逐步计算沙盘 · 每课两题 · 可复现选型案例 · 训练诊断树 · LM
              显存计算器
            </p>
          </div>
          <a href="#/practice">进入实践工坊 →</a>
        </div>
        <div className="atlas-heading">
          <div className="section-intro">
            <h2>选择你要理解的主题</h2>
            <p>Find algorithms and key ideas</p>
          </div>
          <div className="atlas-tools">
            <label className="search-field">
              <SearchIcon />
              <input
                value={query}
                onChange={(e) => filterChange({ q: e.target.value })}
                placeholder="搜索算法或概念，如 BERT、zero-shot、cohort"
                aria-label="搜索算法或概念"
              />
            </label>
            <div className="filter-row">
              <div className="filters">
                <button
                  className={category === "all" ? "selected" : ""}
                  aria-pressed={category === "all"}
                  onClick={() => filterChange({ category: "all" })}
                >
                  全部
                </button>
                {categories.map((item) => (
                  <button
                    key={item.id}
                    className={category === item.id ? "selected" : ""}
                    aria-pressed={category === item.id}
                    onClick={() => filterChange({ category: item.id })}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <label className="sort-select">
                排序{" "}
                <select
                  value={sort}
                  onChange={(e) => filterChange({ sort: e.target.value })}
                >
                  <option value="route">学习路径</option>
                  <option value="az">A–Z</option>
                </select>
              </label>
            </div>
          </div>
        </div>
        <div className="filter-row">
          <label className="search-status-select">
            学习状态
            <select
              value={status}
              onChange={(e) => filterChange({ status: e.target.value })}
            >
              <option value="all">全部进度</option>
              <option value="todo">尚未标记</option>
              <option value="done">已学课程</option>
            </select>
          </label>
          {(query || category !== "all" || status !== "all") && (
            <button
              className="search-reset"
              onClick={() =>
                filterChange({
                  q: "",
                  category: "all",
                  status: "all",
                  sort: "route",
                })
              }
            >
              清除搜索与筛选
            </button>
          )}
        </div>
        <div className="results-count" aria-live="polite">
          {filtered.length} 个主题 · 已学完 {completed.length}/{lessons.length}
        </div>
        <div className="lesson-list">
          {filtered.length ? (
            filtered.map((lesson, i) => (
              <div className="lesson-row" key={lesson.id}>
                <a className="lesson-row-main" href={`#/lesson/${lesson.id}`}>
                  <span className="lesson-no">
                    {String(lessons.indexOf(lesson) + 1).padStart(2, "0")}
                  </span>
                  <span className="lesson-title">
                    <strong>{lesson.title}</strong>
                    <em>{lesson.englishTitle}</em>
                  </span>
                  <span className="lesson-summary">{lesson.summary}</span>
                  <span className="lesson-meta">
                    {categories.find((c) => c.id === lesson.category)?.label ??
                      lesson.category}
                    <small>{lesson.level}</small>
                  </span>
                  <ArrowIcon />
                </a>
                <button
                  className={
                    completed.includes(lesson.id)
                      ? "progress-control done"
                      : "progress-control"
                  }
                  onClick={() => toggleCompleted(lesson.id)}
                  aria-label={`${completed.includes(lesson.id) ? "取消完成" : "标记完成"} ${lesson.title}`}
                  title={
                    completed.includes(lesson.id) ? "取消完成" : "标记已学"
                  }
                >
                  {completed.includes(lesson.id) ? "✓ 已学" : "○ 标记"}
                </button>
                {i === 0 && (
                  <span className="first-row-marker" aria-hidden="true" />
                )}
              </div>
            ))
          ) : (
            <div className="empty-results">
              没有找到匹配的主题。试试其他关键词或选择“全部”。
            </div>
          )}
        </div>
      </section>

      <section className="method-section page-gutter">
        <div>
          <h2>先问问题，再选算法。</h2>
          <p>
            架构回答“信息怎么流动”，训练目标回答“要学到什么”，优化器回答“参数怎么更新”。例如
            Transformer + next-token 目标 + AdamW
            可以组合使用；最终还要看数据、指标、算力和延迟。
          </p>
        </div>
        <div className="method-links">
          <a href="#/guide">
            打开选择指南 <ArrowIcon />
          </a>
          <a href="#/compare">
            对比两种算法 <ArrowIcon />
          </a>
        </div>
      </section>
    </main>
  );
}

function TextList({ items }: { items: string[] }) {
  return (
    <ul className="editorial-list">
      {items.map((item, i) => (
        <li key={`${i}-${item}`}>{item}</li>
      ))}
    </ul>
  );
}

function Detail({
  id,
  showAnimation = false,
  showSandbox = false,
  showExercise = false,
}: {
  id: string;
  showAnimation?: boolean;
  showSandbox?: boolean;
  showExercise?: boolean;
}) {
  const lesson = lessons.find((item) => item.id === id);
  const study = useStudyState();
  const completed = study.completed;
  useEffect(() => {
    visitLesson(id);
  }, [id]);
  useLayoutEffect(() => {
    window.scrollTo({ top: 0 });
    if (!showAnimation && !showSandbox && !showExercise) return;
    document
      .getElementById(
        showExercise ? "exercises" : showSandbox ? "sandbox" : "animation",
      )
      ?.scrollIntoView({ behavior: "instant" });
  }, [id, showAnimation, showSandbox, showExercise]);
  if (!lesson)
    return (
      <div className="not-found page-gutter">
        <h1>没有找到这节课</h1>
        <a href="#/atlas">
          返回算法图谱 <ArrowIcon />
        </a>
      </div>
    );
  const index = lessons.indexOf(lesson);
  const related = lesson.compareTo
    .map((other) => lessons.find((item) => item.id === other))
    .filter((item): item is Lesson => Boolean(item));
  const pathways = conceptPaths
    .map((path) => ({
      path,
      step: path.steps.find((step) => step.lessonId === lesson.id),
    }))
    .filter((item) => Boolean(item.step));
  const sections = [
    ["intuition", "直觉 Intuition"],
    ["animation", "动效 Walkthrough"],
    ...(handCalculationLessonIds.includes(lesson.id)
      ? [["sandbox", "手算 Calculate"]]
      : []),
    ["mechanics", "步骤 Mechanics"],
    ["usage", "选型与上手 Use"],
    ["tuning", "配置与调参 Settings"],
    ["modify", "怎么改 Modify"],
    ["pitfalls", "常见问题 Pitfalls"],
    ["exercises", "练习 Check"],
    ["related", "对比 Compare"],
  ];
  const jump = (section: string) =>
    document
      .getElementById(section)
      ?.scrollIntoView({ behavior: scrollBehavior() });

  return (
    <main className="detail-layout">
      <aside className="detail-left">
        <a className="back-link" href="#/atlas">
          ← 返回算法图谱
        </a>
        <div className="aside-rule" />
        <div className="chapter-label">
          {categories.find((item) => item.id === lesson.category)?.label ??
            lesson.category}{" "}
          <span>
            {
              categories.find((item) => item.id === lesson.category)
                ?.englishLabel
            }
          </span>
        </div>
        <div className="chapter-list">
          {lessons
            .filter((item) => item.category === lesson.category)
            .map((item) => (
              <a
                className={item.id === lesson.id ? "current" : ""}
                key={item.id}
                href={`#/lesson/${item.id}`}
              >
                {String(lessons.indexOf(item) + 1).padStart(2, "0")}　
                {item.title}
              </a>
            ))}
        </div>
        <div className="aside-rule" />
        <strong className="aside-title">本节内容</strong>
        <nav className="detail-toc">
          {sections.map(([section, label]) => (
            <button
              key={section}
              onClick={() =>
                document
                  .getElementById(section)
                  ?.scrollIntoView({ behavior: scrollBehavior() })
              }
            >
              {label}
            </button>
          ))}
        </nav>
      </aside>
      <article className="detail-main">
        <div className="detail-topline">
          <span>
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(lessons.length).padStart(2, "0")}　{lesson.level} ·{" "}
            {lesson.duration}
          </span>
          <button
            className={
              completed.includes(lesson.id) ? "mark-button done" : "mark-button"
            }
            onClick={() => toggleCompleted(lesson.id)}
          >
            {completed.includes(lesson.id) ? "✓ 已完成" : "○ 标记已学"}
          </button>
        </div>
        <h1>
          {lesson.title}
          <span>{lesson.englishTitle}</span>
        </h1>
        <p className="detail-summary">{lesson.summary}</p>
        <details className="lesson-mobile-toc">
          <summary>本节目录 · 跳到原理、设置或练习</summary>
          <nav aria-label="手机课程目录">
            {sections.map(([section, label]) => (
              <button key={section} onClick={() => jump(section)}>
                {label}
              </button>
            ))}
          </nav>
        </details>
        <section className="detail-section intuition-section" id="intuition">
          <h2>
            一句话直觉 <span>Intuition</span>
          </h2>
          <p>{lesson.intuition}</p>
        </section>
        <Suspense
          fallback={
            <section className="detail-section" role="status">
              正在载入互动图解…
            </section>
          }
        >
          <LessonInteractive
            key={`visual-${lesson.id}`}
            lesson={lesson}
            part="visual"
            jump={
              showSandbox ? "sandbox" : showAnimation ? "animation" : undefined
            }
          />
        </Suspense>
        {codeLabLessonIds.has(lesson.id) && (
          <aside className="lesson-code-lab-link">
            <div>
              <span>FROM EQUATION TO CODE</span>
              <strong>这节课有三层代码实验</strong>
              <p>
                逐行比较 From scratch、PyTorch 与 Production，并检查
                shape、参数量、FLOPs、激活显存与梯度路径。
              </p>
            </div>
            <a href={`#/studio/code?lesson=${lesson.id}`}>
              打开 {lesson.id} Code Lab →
            </a>
          </aside>
        )}
        <div className="practice-promo">
          <div>
            <strong>把原理带进完整实验</strong>
            <p>
              数据切分 → 基线 → 调参 → 消融 → 错误分析 →
              独立测试；还有训练诊断树与 LM 显存计算器。
            </p>
          </div>
          <a href="#/practice">打开实践工坊 →</a>
        </div>
        <section className="detail-section" id="mechanics">
          <h2>
            机制拆解 <span>How it works</span>
          </h2>
          <p>{lesson.core}</p>
          <h3>
            按步骤看算法 <span>Step by step</span>
          </h3>
          <ol className="mechanics-steps">
            {lesson.mechanicsSteps.map((step, stepIndex) => (
              <li key={`${lesson.id}-step-${stepIndex}`}>
                <span>{String(stepIndex + 1).padStart(2, "0")}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
          <div className="equation">
            <span>核心表达 / Core expression</span>
            <code>{lesson.equation}</code>
          </div>
        </section>
        <section className="detail-section" id="usage">
          <h2>
            什么时候用 <span>When to use</span>
          </h2>
          <TextList items={lesson.whenToUse} />
          <h3>
            边界与替代 <span>Limits & alternatives</span>
          </h3>
          <TextList items={lesson.limits} />
          <h3>
            如何上手 <span>Setup checklist</span>
          </h3>
          <TextList items={lesson.howToUse} />
          <div className="scenario">
            <strong>具体例子 / Example</strong>
            <p>{lesson.example}</p>
          </div>
        </section>
        <section className="detail-section" id="tuning">
          <h2>
            先调这些 <span>First knobs</span>
          </h2>
          <TextList items={lesson.tuning} />
          <div className="settings-list" aria-label="具体配置与调整信号">
            {lesson.settings.map((setting) => (
              <div className="setting-row" key={setting.name}>
                <strong>{setting.name}</strong>
                <div>
                  <span>从这里开始 / Start</span>
                  <p>{setting.start}</p>
                </div>
                <div>
                  <span>何时调整 / Adjust</span>
                  <p>{setting.adjust}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="detail-section" id="modify">
          <h2>
            怎么改 <span>Modify and extend</span>
          </h2>
          <TextList items={lesson.modifications} />
        </section>
        <section className="detail-section" id="pitfalls">
          <h2>
            常见问题 <span>Failure modes</span>
          </h2>
          <TextList items={lesson.pitfalls} />
        </section>
        <Suspense
          fallback={
            <section className="detail-section" role="status">
              正在载入本课练习…
            </section>
          }
        >
          <LessonInteractive
            key={`quiz-${lesson.id}`}
            lesson={lesson}
            part="quiz"
            jump={showExercise ? "exercises" : undefined}
          />
        </Suspense>
        <section className="detail-section" id="related">
          <h2>
            放在一起看 <span>Compare nearby ideas</span>
          </h2>
          {related.length ? (
            <div className="related-list">
              {related.map((item) => (
                <a href={`#/lesson/${item.id}`} key={item.id}>
                  <span>
                    {item.title}
                    <em>{item.englishTitle}</em>
                  </span>
                  <ArrowIcon />
                </a>
              ))}
            </div>
          ) : (
            <a className="text-link" href="#/compare">
              打开算法对比 <ArrowIcon />
            </a>
          )}
        </section>
        {pathways.length > 0 && (
          <section className="detail-section concept-connections">
            <h2>
              把这节课连起来 <span>Concept connections</span>
            </h2>
            {pathways.map(({ path, step }) => (
              <a href={`#/concepts/${path.id}`} key={path.id}>
                <span>
                  <strong>{path.title}</strong>
                  <small>{step?.why}</small>
                </span>
                <ArrowIcon />
              </a>
            ))}
          </section>
        )}
        {lesson.source && (
          <div className="source-line">
            延伸阅读 / Primary source　
            <a href={lesson.source.url} target="_blank" rel="noreferrer">
              {lesson.source.label} <ArrowIcon diagonal />
            </a>
          </div>
        )}
        <div className="lesson-next">
          {index > 0 && (
            <a href={`#/lesson/${lessons[index - 1].id}`}>
              ← 上一节 <strong>{lessons[index - 1].title}</strong>
            </a>
          )}
          {index < lessons.length - 1 && (
            <a href={`#/lesson/${lessons[index + 1].id}`}>
              下一节 → <strong>{lessons[index + 1].title}</strong>
            </a>
          )}
        </div>
      </article>
      <aside className="detail-right">
        <div className="sticky-notes">
          <h3>
            何时用 <span>When to use</span>
          </h3>
          <TextList items={lesson.whenToUse.slice(0, 3)} />
          <h3>
            先调这些 <span>First knobs</span>
          </h3>
          <TextList items={lesson.tuning.slice(0, 3)} />
          <h3>
            配置起点 <span>Start here</span>
          </h3>
          {lesson.settings.slice(0, 2).map((setting) => (
            <div className="quick-setting" key={setting.name}>
              <strong>{setting.name}</strong>
              <p>{setting.start}</p>
            </div>
          ))}
          <a
            href={`#/compare?a=${lesson.id}&b=${related[0]?.id || "neural-networks"}`}
            className="notes-link"
          >
            对比其他算法 <ArrowIcon />
          </a>
        </div>
      </aside>
    </main>
  );
}

const compareRows: {
  label: string;
  field: keyof Lesson;
  format?: (value: Lesson[keyof Lesson]) => string;
}[] = [
  { label: "一句话直觉", field: "intuition" },
  { label: "核心机制", field: "core" },
  {
    label: "适用场景",
    field: "whenToUse",
    format: (value) => (value as string[]).join(" "),
  },
  {
    label: "边界与替代",
    field: "limits",
    format: (value) => (value as string[]).join(" "),
  },
  {
    label: "上手步骤",
    field: "howToUse",
    format: (value) => (value as string[]).join(" "),
  },
  {
    label: "优先调参",
    field: "tuning",
    format: (value) => (value as string[]).join(" "),
  },
  {
    label: "配置起点",
    field: "settings",
    format: (value) =>
      (value as Lesson["settings"])
        .map((item) => `${item.name}：${item.start} ${item.adjust}`)
        .join(" "),
  },
  {
    label: "常见问题",
    field: "pitfalls",
    format: (value) => (value as string[]).join(" "),
  },
];

const comparisonInsights: Record<string, string> = {
  "batch-normalization|layer-normalization":
    "BatchNorm 对指定通道跨 batch/空间求统计，通常在 eval 使用 running statistics；LayerNorm 对每个样本/token 的特征轴现算统计。先核对输入形状、统计轴与预训练架构；梯度累积不会合并 BN 每次 forward 的统计量。",
  "random-forest|xgboost":
    "随机森林用 bootstrap 与特征随机性训练多棵树并平均，XGBoost 顺序添加新树来修正当前目标的梯度。表格任务先比较两种基线，固定数据切分、缺失值处理与搜索预算；XGBoost 的学习率、深度和轮数需要联合控制。",
  "gcn|graphsage":
    "GCN 使用归一化邻接聚合；GraphSAGE 强调邻居采样和共享的聚合函数，适合大图上的批量训练与新节点表示。归纳能力还取决于特征、可见边和评估设计，不能仅靠模型名称判断是否泄漏。",
  "ddim|ddpm":
    "DDPM 常采用随机反向采样；DDIM 可复用相同噪声预测训练目标，用不同的路径与时间子序列生成。η=0 时，固定初始噪声与条件的 DDIM 轨迹是确定的；减少步数后仍需评估质量和实际延迟。",
  "flow-matching|latent-diffusion":
    "Latent diffusion 说明去噪在压缩的 latent 表示中进行；flow matching 说明以速度场为训练目标并通过积分生成。两者描述不同设计轴，flow matching 也可以在 latent 空间中工作，不能把它们视作完全互斥的家族。",
  "retrieval-augmented-generation|transfer-lora":
    "RAG 在推理时检索外部资料，再据此生成；LoRA 通过低秩参数更新改变模型行为。知识需要更新、追溯来源时先检查检索，输出格式或任务行为需稳定适配时比较微调；两种方式可以组合，并分别评估检索与生成错误。",
  "off-policy-evaluation|offline-rl":
    "Offline RL 从固定日志学习策略；OPE 估计指定策略的预期回报，是评估工具。两者都受日志覆盖影响；没有 action support 或可信行为概率时，重要性采样不能凭空补齐缺失证据。",
  "attention-heads|prediction-heads":
    "Attention head 是注意力模块里的并行 Q/K/V 分支，用来从不同表示子空间汇聚上下文；prediction head 是 backbone 后接的任务输出模块，把表示转成类别、数值、token 或 mask。它们可以同时出现在一个模型中，但位置与作用不同。",
  "few-shot-learning|zero-shot-learning":
    "Zero-shot 的目标任务没有标注示例；few-shot 允许少量示例。比较时固定任务、模型、测试集与标签空间，明确示例是放进 prompt、用于参数适配还是用于原型计算；这三种 few-shot 实现方式不同。",
  "few-shot-learning|in-context-learning":
    "Few-shot 描述可用标注样例很少的任务设置；in-context learning 是把示例放入 prompt、在推理时不更新权重的一种实现。Few-shot 也可以通过微调或 metric-based 方法完成。",
  "cohort-design|data-leakage":
    "Cohort 先定义哪些个体在什么时间进入研究、何时预测、观察什么结局；leakage 检查模型是否读取了预测时不可用的信息，或让同一个体同时进入训练与测试。时间窗口和切分单位要一起设计。",
  "domain-shift|external-validation":
    "Domain shift 指部署环境的数据关系与训练时不同；external validation 用新时间、地点或人群的独立数据测这种变化对性能的影响。外部验证能揭示问题，但不能单独证明漂移的原因。",
  "rnn|transformer":
    "RNN 逐步更新 hidden state，适合流式输入或较小序列基线；Transformer 用 attention 直接连接位置，训练时更容易并行，但长序列的注意力成本要单独测。",
  "bert|gpt-language-model":
    "BERT 双向读取完整输入，优先用于分类、抽取和表示；GPT 式 LM 用因果掩码预测下一个 token，优先用于开放式生成。两者的预训练目标与可见上下文不同。",
  "resnet|vit":
    "ResNet 的卷积先验适合从局部纹理逐层建特征；ViT 把 patch 当 token 交给 attention。先用相近参数量、预训练数据和输入分辨率比较，不能只比模型名称。",
  "nnunet|unet":
    "U-Net 是编码器、解码器和跳接构成的分割架构；nnU-Net 是依据数据指纹自动配置预处理、网络、训练与后处理的完整流程。需要强医学分割基线时先跑 nnU-Net，再决定改哪里。",
  "moco|simclr":
    "SimCLR 主要使用同一 batch 内的负例，依赖批量和增强质量；MoCo 以动量编码器维护跨 batch 队列。显存限制 batch 时先比较 MoCo，同时检查队列负例是否过时。",
  "byol|simclr":
    "SimCLR 明确拉近正例、拉远负例；BYOL 用在线网络预测动量目标网络，不依赖显式负例。比较时固定 encoder、数据增强和下游评估，避免把训练配方差异误当作目标函数差异。",
  "q-learning|sarsa":
    "Q-learning 的目标使用下一状态最大 Q，是 off-policy；SARSA 使用当前行为策略实际选出的下一动作，是 on-policy。探索动作有风险时，SARSA 会把这种风险纳入学习目标。",
  "dqn|ppo":
    "DQN 用 replay 训练离散动作的 Q 网络，属于 off-policy value-based；PPO 用新采轨迹更新策略，属于 on-policy policy-based。先看动作空间和交互成本，再比较样本效率与训练稳定性。",
  "ppo|sac":
    "PPO 反复用一批新 rollout 做有限更新，随后重采；SAC 可复用旧经验并加入 entropy 目标。连续控制且交互昂贵时先比较 SAC，有大规模稳定模拟器时 PPO 常是清晰基线。",
  "knn|svm":
    "kNN 预测时查训练样本的邻居，表现取决于距离和存储库；SVM 在训练时学习最大间隔边界。小数据先同时跑，两者都要在训练集内完成缩放和选参。",
  "diffusion|gan":
    "GAN 通过生成器与判别器对抗训练，采样通常较快；扩散模型学逐步去噪，采样通常需要多步。比较质量时同时报告多样性、失败案例、训练稳定性与推理延迟。",
  "adamw|gradient-descent":
    "SGD 按梯度与全局学习率更新，可加入 momentum；AdamW 用梯度一、二阶动量做参数级自适应更新，并把 weight decay 解耦。两者都要认真调学习率和调度。",
};

function Compare({ routeQuery = "" }: { routeQuery?: string }) {
  const params = new URLSearchParams(routeQuery);
  const valid = (id: string | null, fallback: string) =>
    lessons.some((l) => l.id === id) ? id! : fallback;
  const [first, setFirst] = useState(valid(params.get("a"), "rnn"));
  const [second, setSecond] = useState(valid(params.get("b"), "transformer"));
  useEffect(() => {
    const next = new URLSearchParams(routeQuery);
    setFirst(valid(next.get("a"), "rnn"));
    setSecond(valid(next.get("b"), "transformer"));
  }, [routeQuery]);
  function pick(left: string, right: string) {
    setFirst(left);
    setSecond(right);
    replaceHash("/compare", new URLSearchParams({ a: left, b: right }));
  }
  const a = lessons.find((item) => item.id === first),
    b = lessons.find((item) => item.id === second);
  const insight = comparisonInsights[[first, second].sort().join("|")];
  return (
    <main className="utility-page page-gutter">
      <div className="utility-heading">
        <a href="#/atlas">← 算法图谱</a>
        <h1>把两种方法放在一起看。</h1>
        <p>Compare algorithms · 从机制、适用问题到调参方法，逐项看清差异。</p>
      </div>
      <div className="comparison-presets">
        <span>常看对比</span>
        {[
          ["rnn", "transformer", "RNN ↔ Transformer"],
          ["bert", "gpt-language-model", "BERT ↔ GPT"],
          ["resnet", "vit", "ResNet ↔ ViT"],
          ["unet", "nnunet", "U-Net ↔ nnU-Net"],
          ["simclr", "moco", "SimCLR ↔ MoCo"],
          ["simclr", "byol", "SimCLR ↔ BYOL"],
          ["q-learning", "sarsa", "Q-learning ↔ SARSA"],
          ["dqn", "ppo", "DQN ↔ PPO"],
          ["ppo", "sac", "PPO ↔ SAC"],
          ["knn", "svm", "kNN ↔ SVM"],
          ["gan", "diffusion", "GAN ↔ Diffusion"],
          ["gradient-descent", "adamw", "SGD ↔ AdamW"],
          ["prediction-heads", "attention-heads", "输出 Head ↔ Attention Head"],
          ["zero-shot-learning", "few-shot-learning", "Zero-shot ↔ Few-shot"],
          ["few-shot-learning", "in-context-learning", "Few-shot ↔ ICL"],
          ["cohort-design", "data-leakage", "Cohort ↔ Leakage"],
          ["domain-shift", "external-validation", "Shift ↔ 外部验证"],
          [
            "batch-normalization",
            "layer-normalization",
            "BatchNorm ↔ LayerNorm",
          ],
          ["random-forest", "xgboost", "Random Forest ↔ XGBoost"],
          ["gcn", "graphsage", "GCN ↔ GraphSAGE"],
          ["ddpm", "ddim", "DDPM ↔ DDIM"],
          [
            "latent-diffusion",
            "flow-matching",
            "Latent diffusion ↔ Flow matching",
          ],
          ["retrieval-augmented-generation", "transfer-lora", "RAG ↔ LoRA"],
          ["offline-rl", "off-policy-evaluation", "Offline RL ↔ OPE"],
        ].map(([left, right, label]) => (
          <button
            key={label}
            onClick={() => {
              pick(left, right);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="comparison-pickers">
        <label>
          算法 A
          <select value={first} onChange={(e) => pick(e.target.value, second)}>
            <LessonOptions />
          </select>
        </label>
        <label>
          算法 B
          <select value={second} onChange={(e) => pick(first, e.target.value)}>
            <LessonOptions />
          </select>
        </label>
      </div>
      {a && b && (
        <>
          <div className="comparison-course-links">
            <a href={`#/lesson/${first}`}>阅读 A：{a.title} →</a>
            <a href={`#/lesson/${second}`}>阅读 B：{b.title} →</a>
            <span>当前地址可直接分享这一组对比。</span>
          </div>
          {first === second && (
            <p className="comparison-same" role="status">
              当前两侧选择了同一课程。更换一侧可以查看不同方法的差异。
            </p>
          )}
          {insight && (
            <div className="comparison-insight">
              <strong>差别与选择 / Key distinction</strong>
              <p>{insight}</p>
            </div>
          )}
          {a.category !== b.category && (
            <p className="comparison-axis-note">
              学习方向：
              {categories.find((c) => c.id === a.category)?.label} 与{" "}
              {categories.find((c) => c.id === b.category)?.label}
              。比较前请对齐任务、数据和指标，再判断它们各自的作用与组合方式。
            </p>
          )}
          <div className="comparison-table" role="table">
            <div className="comparison-row comparison-head" role="row">
              <span role="columnheader">比较维度</span>
              <strong role="columnheader">
                {a.title}
                <small>{a.englishTitle}</small>
              </strong>
              <strong role="columnheader">
                {b.title}
                <small>{b.englishTitle}</small>
              </strong>
            </div>
            {compareRows.map((row) => (
              <div className="comparison-row" role="row" key={row.label}>
                <strong role="rowheader">{row.label}</strong>
                <p role="cell">
                  {row.format ? row.format(a[row.field]) : String(a[row.field])}
                </p>
                <p role="cell">
                  {row.format ? row.format(b[row.field]) : String(b[row.field])}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}

function LessonOptions() {
  return categories.map((category) => (
    <optgroup label={category.label} key={category.id}>
      {lessons
        .filter((item) => item.category === category.id)
        .map((item) => (
          <option value={item.id} key={item.id}>
            {item.title} · {item.englishTitle}
          </option>
        ))}
    </optgroup>
  ));
}

function Concepts({ selectedPath }: { selectedPath?: string }) {
  useEffect(() => {
    if (!selectedPath) return;
    const timeout = window.setTimeout(() => {
      document
        .getElementById(selectedPath)
        ?.scrollIntoView({ behavior: scrollBehavior() });
    }, 50);
    return () => window.clearTimeout(timeout);
  }, [selectedPath]);
  return (
    <main className="utility-page concept-page page-gutter">
      <div className="utility-heading">
        <a href="#/atlas">← 算法图谱</a>
        <h1>从一个概念，走到完整方法。</h1>
        <p>Connected ideas · 用逐步路径看清相邻概念如何组合、在哪一步分叉。</p>
        <a className="study-resume" href="#/review">
          查看我的学习记录 →
        </a>
      </div>
      <nav className="concept-index" aria-label="关键概念路径">
        {conceptPaths.map((path, index) => (
          <a href={`#/concepts/${path.id}`} key={path.id}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{path.title}</strong>
            <ArrowIcon />
          </a>
        ))}
      </nav>
      <div className="concept-paths">
        {conceptPaths.map((path, pathIndex) => (
          <section className="concept-path" id={path.id} key={path.id}>
            <div className="concept-path-intro">
              <span>PATH {String(pathIndex + 1).padStart(2, "0")}</span>
              <h2>{path.title}</h2>
              <p>{path.description}</p>
            </div>
            <ol>
              {path.steps.map((step, index) => {
                const lesson = lessons.find(
                  (item) => item.id === step.lessonId,
                );
                if (!lesson) return null;
                return (
                  <li key={step.lessonId}>
                    <span className="concept-step-no">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <a href={`#/lesson/${lesson.id}`}>
                        <strong>{lesson.title}</strong>
                        <em>{lesson.englishTitle}</em>
                        <ArrowIcon />
                      </a>
                      <p>{step.why}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </main>
  );
}

function Footer() {
  return (
    <footer className="site-footer page-gutter">
      <a href="#/">
        深度学习图谱 <span>Deep Learning Atlas</span>
      </a>
      <p>直觉 → 原理 → 选择 → 实践</p>
      <a href={repoUrl} target="_blank" rel="noreferrer">
        View on GitHub <ArrowIcon diagonal />
      </a>
    </footer>
  );
}

function App() {
  const [route, setRoute] = useState(
    () => window.location.hash.slice(1) || "/",
  );
  const { path, params } = hashParts(route);
  const routeQuery = params.toString();
  useEffect(() => {
    const update = () => {
      const next = window.location.hash.slice(1) || "/";
      setRoute((previous) => {
        const before = hashParts(previous).path,
          after = hashParts(next).path;
        if (
          before !== after &&
          !(
            ["/", "/path", "/atlas"].includes(before) &&
            ["/", "/path", "/atlas"].includes(after)
          )
        )
          window.scrollTo({ top: 0, behavior: "instant" });
        return next;
      });
    };
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  let lessonId = "";
  if (path.startsWith("/lesson/")) {
    try {
      lessonId = decodeURIComponent(path.slice(8));
    } catch {
      lessonId = path.slice(8);
    }
  }
  const pageNames: Record<string, string> = {
    "/": "学习首页",
    "/atlas": "算法图谱",
    "/path": "学习路径",
    "/animations": "动效实验室",
    "/practice": "实践工坊",
    "/compare": "算法对比",
    "/guide": "选型指南",
    "/glossary": "术语表",
    "/review": "学习记录",
    "/studio": "学习工作台",
    "/studio/code": "代码实验",
    "/studio/shapes": "张量形状调试器",
    "/studio/arena": "跨算法竞技场",
    "/studio/projects": "端到端项目案例",
  };
  const routeTitle = path.startsWith("/lesson/")
    ? lessons.find((l) => l.id === lessonId)?.title || "课程未找到"
    : path.startsWith("/concepts")
      ? "关键概念路径"
      : pageNames[path] || "页面未找到";
  useEffect(() => {
    document.title = `${routeTitle} · 深度学习图谱`;
  }, [routeTitle]);
  let page;
  if (path.startsWith("/lesson/"))
    page = (
      <Detail
        id={lessonId}
        showAnimation={params.get("animation") === "1"}
        showSandbox={params.get("sandbox") === "1"}
        showExercise={params.get("exercise") === "1"}
      />
    );
  else if (path === "/animations") page = <AnimationDirectory />;
  else if (path === "/practice") page = <PracticeHub />;
  else if (path === "/compare") page = <Compare routeQuery={routeQuery} />;
  else if (path === "/guide") page = <ModelGuide />;
  else if (path === "/glossary") page = <GlossaryPage />;
  else if (path === "/review") page = <StudyReview />;
  else if (
    path === "/studio" ||
    path === "/studio/code" ||
    path === "/studio/shapes" ||
    path === "/studio/arena" ||
    path === "/studio/projects"
  )
    page = <StudioPage path={path} query={routeQuery} />;
  else if (
    path === "/concepts" ||
    (path.startsWith("/concepts/") &&
      conceptPaths.some((p) => p.id === path.split("/")[2]))
  )
    page = <Concepts selectedPath={path.split("/")[2]} />;
  else if (["/", "/path", "/atlas"].includes(path))
    page = (
      <Home
        initialSection={
          path === "/path" ? "path" : path === "/atlas" ? "atlas" : undefined
        }
        routeQuery={routeQuery}
      />
    );
  else
    page = (
      <main className="utility-page page-gutter">
        <h1>这个页面没有找到</h1>
        <p>地址可能有误，或页面已调整。</p>
        <a className="study-resume" href="#/atlas">
          返回算法图谱 →
        </a>
      </main>
    );
  return (
    <>
      <a
        href="#main-content"
        className="skip-link"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main-content")?.focus();
          document
            .getElementById("main-content")
            ?.scrollIntoView({ behavior: "instant" });
        }}
      >
        跳到主要内容
      </a>
      <Header route={path} />
      <div className="route-announce" role="status" aria-live="polite">
        {routeTitle}
      </div>
      <div id="main-content" tabIndex={-1}>
        <RouteErrorBoundary route={path}>
          <Suspense
            fallback={
              <main className="page-loading page-gutter" role="status">
                正在打开{routeTitle}…
              </main>
            }
          >
            {page}
          </Suspense>
        </RouteErrorBoundary>
      </div>
      <Footer />
    </>
  );
}

export default App;
