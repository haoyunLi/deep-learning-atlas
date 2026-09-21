import { useEffect, useMemo, useState } from "react";
import { categories, lessons, type Lesson } from "./data/lessons";

const repoUrl = "https://github.com/haoyunLi/deep-learning-atlas";

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
    { href: "#/path", label: "学习路径" },
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
              className={route === link.href.slice(1) ? "active" : ""}
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

function Home({ initialSection }: { initialSection?: "path" | "atlas" }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<"route" | "az">("route");
  const [completed, setCompleted] = useState<string[]>(readProgress);
  const filtered = useMemo(
    () =>
      lessons
        .filter((lesson) => {
          const matchesCategory =
            category === "all" || lesson.category === category;
          const text = [
            lesson.title,
            lesson.englishTitle,
            lesson.summary,
            lesson.id,
          ]
            .join(" ")
            .toLocaleLowerCase();
          return (
            matchesCategory && text.includes(query.trim().toLocaleLowerCase())
          );
        })
        .sort((a, b) =>
          sort === "az"
            ? a.englishTitle.localeCompare(b.englishTitle)
            : lessons.indexOf(a) - lessons.indexOf(b),
        ),
    [query, category, sort],
  );

  useEffect(() => {
    if (initialSection)
      window.setTimeout(
        () =>
          document
            .getElementById(initialSection)
            ?.scrollIntoView({ behavior: "smooth" }),
        40,
      );
  }, [initialSection]);

  function toggleComplete(id: string) {
    const next = completed.includes(id)
      ? completed.filter((item) => item !== id)
      : [...completed, id];
    setCompleted(next);
    localStorage.setItem("dla-progress", JSON.stringify(next));
  }

  return (
    <main>
      <section className="hero page-gutter">
        <div className="hero-copy">
          <h1>把深度学习看懂，再用对。</h1>
          <p className="hero-en">
            From intuition to implementation — 一次理清原理、选择与调参。
          </p>
          <p className="hero-description">
            用直观的图解、清楚的对比与可执行的步骤，建立对算法的完整认识，并在真实问题中做出合适的选择。
          </p>
          <a className="primary-button" href="#/atlas">
            开始学习 <ArrowIcon />
          </a>
        </div>
        <NetworkDiagram />
      </section>

      <section className="route-section page-gutter" id="path">
        <div className="section-intro">
          <h2>学习路径</h2>
          <p>Learning Route</p>
        </div>
        <div className="route-grid">
          {[
            {
              no: "01",
              title: "基础",
              en: "Foundations",
              description: "建立训练循环与核心直觉",
              filter: "foundations",
            },
            {
              no: "02",
              title: "训练",
              en: "Training",
              description: "让优化与评估更可靠",
              filter: "training",
            },
            {
              no: "03",
              title: "架构",
              en: "Architectures",
              description: "理解模型怎样处理数据",
              filter: "architectures",
            },
            {
              no: "04",
              title: "生成",
              en: "Generative",
              description: "理解模型怎样生成样本",
              filter: "generative",
            },
            {
              no: "05",
              title: "进阶",
              en: "Beyond",
              description: "面向不同问题继续拓展",
              filter: "frontiers",
            },
          ].map((item) => (
            <button
              className="route-item"
              key={item.no}
              onClick={() => {
                setCategory(
                  categories.some((c) => c.id === item.filter)
                    ? item.filter
                    : "all",
                );
                document
                  .getElementById("atlas")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <div className="route-line">
                <span>{item.no}</span>
                <i />
              </div>
              <strong>{item.title}</strong>
              <em>{item.en}</em>
              <small>{item.description}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="atlas-section page-gutter" id="atlas">
        <div className="atlas-heading">
          <div className="section-intro">
            <h2>选择你要理解的算法</h2>
            <p>Find and learn algorithms</p>
          </div>
          <div className="atlas-tools">
            <label className="search-field">
              <SearchIcon />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索算法或缩写，如 CNN、GAN"
                aria-label="搜索算法"
              />
            </label>
            <div className="filter-row">
              <div className="filters">
                <button
                  className={category === "all" ? "selected" : ""}
                  onClick={() => setCategory("all")}
                >
                  全部
                </button>
                {categories.map((item) => (
                  <button
                    key={item.id}
                    className={category === item.id ? "selected" : ""}
                    onClick={() => setCategory(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <label className="sort-select">
                排序{" "}
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as "route" | "az")}
                >
                  <option value="route">学习路径</option>
                  <option value="az">A–Z</option>
                </select>
              </label>
            </div>
          </div>
        </div>
        <div className="results-count">
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
                  onClick={() => toggleComplete(lesson.id)}
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
            架构回答“信息怎么流动”，训练目标回答“要学到什么”，优化器回答“参数怎么更新”。例如 Transformer + next-token 目标 + AdamW 可以组合使用；最终还要看数据、指标、算力和延迟。
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

function readProgress(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem("dla-progress") || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function MechanismDiagram({ lesson }: { lesson: Lesson }) {
  const name = `${lesson.id} ${lesson.englishTitle}`.toLowerCase();
  let steps = [
    "输入数据 Input",
    "模型变换 Model",
    "计算损失 Loss",
    "参数更新 Update",
  ];
  if (/attention|transformer/.test(name))
    steps = [
      "查询 Q · 键 K · 值 V",
      "相似度 QKᵀ/√d",
      "softmax 权重",
      "加权求和 AV",
    ];
  else if (/cnn|convolution|resnet/.test(name))
    steps = [
      "局部图像块 Patch",
      "卷积核 Kernel",
      "特征图 Feature map",
      "预测 Prediction",
    ];
  else if (/rnn|lstm|gru/.test(name))
    steps = ["当前输入 xₜ", "隐藏状态 hₜ₋₁", "状态更新 hₜ", "下一步输出"];
  else if (/diffusion/.test(name))
    steps = ["真实样本 x₀", "逐步加噪 Noise", "预测噪声 ε", "逐步去噪 Sample"];
  else if (/gan/.test(name))
    steps = ["随机噪声 z", "生成器 G", "判别器 D", "交替优化"];
  else if (/vae|autoencoder/.test(name))
    steps = ["输入 x", "编码器 Encoder", "潜变量 z", "解码器 Decoder"];
  else if (/gnn|graph/.test(name))
    steps = ["节点与边", "邻居消息", "聚合 Aggregate", "节点表示"];
  return (
    <div
      className="mechanism-diagram"
      aria-label={`${lesson.title}的机制示意图`}
    >
      <div className="diagram-caption">
        机制速览 <span>Mechanism at a glance</span>
      </div>
      <div className="diagram-flow">
        {steps.map((step, i) => (
          <div className="diagram-step" key={step}>
            <span className="diagram-index">0{i + 1}</span>
            <strong>{step}</strong>
            {i < steps.length - 1 && <ArrowIcon />}
          </div>
        ))}
      </div>
    </div>
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

function Detail({ id }: { id: string }) {
  const lesson = lessons.find((item) => item.id === id);
  const [completed, setCompleted] = useState<string[]>(readProgress);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [id]);
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
    .filter((item): item is Lesson => Boolean(item))
    .slice(0, 3);
  function toggle() {
    const next = completed.includes(lesson!.id)
      ? completed.filter((item) => item !== lesson!.id)
      : [...completed, lesson!.id];
    setCompleted(next);
    localStorage.setItem("dla-progress", JSON.stringify(next));
  }
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
          {[
            ["intuition", "直觉 Intuition"],
            ["mechanics", "原理 Mechanics"],
            ["usage", "怎么用 How to use"],
            ["tuning", "调参 Tuning"],
            ["modify", "怎么改 Modify"],
            ["pitfalls", "常见问题 Pitfalls"],
            ["related", "对比 Compare"],
          ].map(([section, label]) => (
            <button
              key={section}
              onClick={() =>
                document
                  .getElementById(section)
                  ?.scrollIntoView({ behavior: "smooth" })
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
            onClick={toggle}
          >
            {completed.includes(lesson.id) ? "✓ 已完成" : "○ 标记已学"}
          </button>
        </div>
        <h1>
          {lesson.title}
          <span>{lesson.englishTitle}</span>
        </h1>
        <p className="detail-summary">{lesson.summary}</p>
        <section className="detail-section intuition-section" id="intuition">
          <h2>
            一句话直觉 <span>Intuition</span>
          </h2>
          <p>{lesson.intuition}</p>
        </section>
        <MechanismDiagram lesson={lesson} />
        <section className="detail-section" id="mechanics">
          <h2>
            机制拆解 <span>How it works</span>
          </h2>
          <p>{lesson.core}</p>
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
          <a href="#/compare" className="notes-link">
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
    label: "常见问题",
    field: "pitfalls",
    format: (value) => (value as string[]).join(" "),
  },
];

function Compare() {
  const [first, setFirst] = useState("rnn");
  const [second, setSecond] = useState("transformer");
  const a = lessons.find((item) => item.id === first),
    b = lessons.find((item) => item.id === second);
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
          ["cnn", "transformer", "CNN ↔ Transformer"],
          ["gan", "diffusion", "GAN ↔ Diffusion"],
          ["gradient-descent", "adamw", "SGD ↔ AdamW"],
        ].map(([left, right, label]) => (
          <button
            key={label}
            onClick={() => {
              setFirst(left);
              setSecond(right);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="comparison-pickers">
        <label>
          算法 A
          <select value={first} onChange={(e) => setFirst(e.target.value)}>
            {lessons.map((item) => (
              <option value={item.id} key={item.id}>
                {item.title} · {item.englishTitle}
              </option>
            ))}
          </select>
        </label>
        <label>
          算法 B
          <select value={second} onChange={(e) => setSecond(e.target.value)}>
            {lessons.map((item) => (
              <option value={item.id} key={item.id}>
                {item.title} · {item.englishTitle}
              </option>
            ))}
          </select>
        </label>
      </div>
      {a && b && (
        <>
          {a.category !== b.category && (
            <p className="comparison-axis-note">
              这两项属于不同层次：
              {categories.find((c) => c.id === a.category)?.label} 与{" "}
              {categories.find((c) => c.id === b.category)?.label}
              。它们可能组合使用，先看各自解决什么问题。
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

const guideOptions = [
  {
    id: "image",
    title: "图像与空间数据",
    en: "Images & spatial patterns",
    keywords: /cnn|convolution|resnet/i,
    reason: "局部结构和平移特性通常很重要，先从卷积结构开始。",
  },
  {
    id: "sequence",
    title: "文本与序列",
    en: "Text & sequences",
    keywords: /transformer|attention|lstm|rnn/i,
    reason:
      "需要处理上下文关系；短序列可先比较 RNN/LSTM，长程交互常试 Transformer。",
  },
  {
    id: "graph",
    title: "关系与网络",
    en: "Graphs & relations",
    keywords: /graph|gnn|gcn/i,
    reason: "样本由节点和边组成，让相邻实体交换信息更自然。",
  },
  {
    id: "generate",
    title: "生成新样本",
    en: "Generate new samples",
    keywords: /diffusion|gan|vae|autoencoder/i,
    reason: "先明确质量、采样速度、潜变量结构和训练稳定性的优先级。",
  },
  {
    id: "general",
    title: "普通预测任务",
    en: "Prediction baseline",
    keywords: /mlp|backprop|neural network|optimization/i,
    reason: "先用简单基线弄清损失函数、数据规模和评估方法，再增加结构复杂度。",
  },
];

function Guide() {
  const [choice, setChoice] = useState(guideOptions[0].id);
  const selected = guideOptions.find((option) => option.id === choice)!;
  const recommended = lessons
    .filter((item) => selected.keywords.test(`${item.id} ${item.englishTitle}`))
    .slice(0, 5);
  return (
    <main className="utility-page guide-page page-gutter">
      <div className="utility-heading">
        <a href="#/atlas">← 算法图谱</a>
        <h1>从你的问题出发。</h1>
        <p>
          Choose by problem, then tune by evidence ·
          先看数据长什么样，再决定模型。
        </p>
      </div>
      <div className="guide-layout">
        <div>
          <h2>你的数据是什么结构？</h2>
          <div className="choice-list">
            {guideOptions.map((option) => (
              <button
                key={option.id}
                className={choice === option.id ? "active" : ""}
                onClick={() => setChoice(option.id)}
              >
                <span>
                  <strong>{option.title}</strong>
                  <em>{option.en}</em>
                </span>
                <ArrowIcon />
              </button>
            ))}
          </div>
        </div>
        <div className="guide-result">
          <span className="result-label">
            推荐起点 / Suggested starting point
          </span>
          <h2>{selected.title}</h2>
          <p>{selected.reason}</p>
          <ol>
            {recommended.map((item) => (
              <li key={item.id}>
                <a href={`#/lesson/${item.id}`}>
                  <span>
                    {item.title}
                    <em>{item.englishTitle}</em>
                  </span>
                  <ArrowIcon />
                </a>
              </li>
            ))}
          </ol>
          <p className="guide-caveat">
            这是一条起步路径，不是自动选型结论。用验证集指标、错误分析、延迟和预算决定最终方案。
          </p>
        </div>
      </div>
    </main>
  );
}

const glossary = [
  [
    "张量 Tensor",
    "带有形状（shape）的多维数值数组；模型的输入、权重和输出通常都是张量。",
  ],
  ["参数 Parameter", "训练时通过梯度更新的数值，例如权重和偏置。"],
  [
    "超参数 Hyperparameter",
    "训练前或训练中由人设定的选择，例如学习率、批大小、层数。",
  ],
  ["损失函数 Loss", "衡量预测与目标差距的函数；训练的直接优化目标。"],
  ["梯度 Gradient", "损失对参数的局部变化率，指示小步调整的方向。"],
  ["反向传播 Backpropagation", "用链式法则高效计算各层参数梯度的方法。"],
  ["泛化 Generalization", "模型在没见过的数据上仍能表现良好的能力。"],
  ["过拟合 Overfitting", "训练集表现很好，但验证集或真实数据表现变差。"],
  ["注意力 Attention", "根据当前查询对不同信息分配权重，再汇总成上下文表示。"],
  ["嵌入 Embedding", "把离散对象映射为可学习的连续向量。"],
  ["潜变量 Latent variable", "模型内部用于表达隐藏因素的压缩表示。"],
  ["微调 Fine-tuning", "从预训练参数出发，继续用特定任务数据训练。"],
];

function Glossary() {
  const [query, setQuery] = useState("");
  const filtered = glossary.filter(([title, definition]) =>
    `${title} ${definition}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <main className="utility-page glossary-page page-gutter">
      <div className="utility-heading">
        <a href="#/atlas">← 算法图谱</a>
        <h1>术语，讲人话。</h1>
        <p>Glossary · 读懂深度学习常见词汇。</p>
      </div>
      <label className="search-field glossary-search">
        <SearchIcon />
        <input
          aria-label="搜索术语"
          placeholder="搜索术语"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <dl className="glossary-list">
        {filtered.map(([title, definition]) => (
          <div key={title}>
            <dt>{title}</dt>
            <dd>{definition}</dd>
          </div>
        ))}
      </dl>
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
  useEffect(() => {
    const update = () => {
      setRoute(window.location.hash.slice(1) || "/");
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  let page;
  if (route.startsWith("/lesson/"))
    page = <Detail id={decodeURIComponent(route.slice(8))} />;
  else if (route === "/compare") page = <Compare />;
  else if (route === "/guide") page = <Guide />;
  else if (route === "/glossary") page = <Glossary />;
  else
    page = (
      <Home
        initialSection={
          route === "/path" ? "path" : route === "/atlas" ? "atlas" : undefined
        }
      />
    );
  return (
    <>
      <Header route={route} />
      {page}
      <Footer />
    </>
  );
}

export default App;
