import { useEffect, useMemo, useState } from "react";
import { categories, lessons, type Lesson } from "./data/lessons";
import { conceptPaths } from "./data/conceptPaths";
import AnimatedExplainer, {
  animationSpecs,
} from "./components/AnimatedExplainer";

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
                setCategory(item.id);
                document
                  .getElementById("atlas")
                  ?.scrollIntoView({ behavior: "smooth" });
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
          <span>Interactive walkthroughs · 可暂停、可逐步查看</span>
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
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索算法或概念，如 BERT、zero-shot、cohort"
                aria-label="搜索算法或概念"
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
  const conceptFlows: Record<string, string[]> = {
    "prediction-heads": [
      "读取 backbone 表示",
      "选聚合与输出形状",
      "产生 logits 或数值",
      "按任务损失训练",
    ],
    "attention-heads": [
      "投影多组 Q/K/V",
      "每组分别注意",
      "拼接各 head 输出",
      "输出投影融合",
    ],
    "zero-shot-learning": [
      "固定未见任务",
      "写任务描述或标签",
      "不提供目标样例",
      "独立测试泛化",
    ],
    "few-shot-learning": [
      "准备少量 support",
      "限定示例预算",
      "适配或放进 prompt",
      "测 query 泛化",
    ],
    "in-context-learning": [
      "选择任务示例",
      "放进上下文窗口",
      "保持模型权重不变",
      "预测新输入",
    ],
    "chain-of-thought-prompting": [
      "给任务或示例",
      "引导中间步骤",
      "生成推理文本",
      "核验最终答案",
    ],
    "linear-probe": [
      "冻结预训练编码器",
      "抽取 embedding",
      "训练线性分类器",
      "评估表示质量",
    ],
    "prototypical-networks": [
      "编码 support 样本",
      "每类求 prototype",
      "计算 query 距离",
      "按距离分类",
    ],
    "meta-learning-maml": [
      "采样多个任务",
      "任务内快速更新",
      "跨任务求元梯度",
      "适应新任务",
    ],
    "cohort-design": [
      "定义目标人群",
      "设 index date",
      "限定特征与结局窗口",
      "按个体切分评估",
    ],
    "data-leakage": [
      "画预测时间线",
      "核查特征可用时点",
      "隔离训练与测试",
      "重跑无泄漏评估",
    ],
    "domain-shift": [
      "定义训练分布",
      "识别目标环境",
      "比较漂移类型",
      "外部数据验证",
    ],
    "external-validation": [
      "冻结模型与阈值",
      "选择新时间或地点",
      "独立计算指标",
      "分析性能差异",
    ],
    "calibration-uncertainty": [
      "输出预测概率",
      "按风险段分组",
      "比较预测与发生率",
      "必要时重新校准",
    ],
    "class-imbalance": [
      "检查类别基率",
      "选任务相关指标",
      "训练对比基线",
      "调阈值与校准",
    ],
  };
  if (conceptFlows[lesson.id]) steps = conceptFlows[lesson.id];
  else if (/expectation.maximization|^em\b|em-algorithm/.test(name))
    steps = ["观测数据", "E-step 估计隐变量", "M-step 更新参数", "重复至收敛"];
  else if (/\bknn\b|k-nearest/.test(name))
    steps = ["保存训练样本", "计算查询距离", "找到 k 个近邻", "投票或取平均"];
  else if (/k-means/.test(name))
    steps = ["选择 k 个中心", "分配最近中心", "更新簇中心", "重复至稳定"];
  else if (/gaussian-mixture|\bgmm\b/.test(name))
    steps = ["多个高斯分量", "计算软归属", "更新均值与方差", "得到混合密度"];
  else if (/\bpca\b|principal.component/.test(name))
    steps = ["中心化数据", "寻找最大方差方向", "选择主成分", "投影降维"];
  else if (/\bsvm\b|support.vector/.test(name))
    steps = ["输入特征与标签", "最大化分类间隔", "确定支持向量", "预测新样本"];
  else if (/energy.based|\bebm\b/.test(name))
    steps = ["输入候选样本", "计算能量 Eθ", "压低真实样本能量", "比较或采样"];
  else if (/\bdino\b/.test(name))
    steps = ["裁出不同视图", "学生与教师编码", "教师动量更新", "对齐输出分布"];
  else if (/\bbyol\b/.test(name))
    steps = [
      "同一图像的两种视图",
      "在线编码器与预测头",
      "目标编码器 EMA",
      "对齐两个表示",
    ];
  else if (/barlow.twins|\bvicreg\b/.test(name))
    steps = ["构造两种视图", "分别编码", "保持语义一致", "避免特征塌缩或冗余"];
  else if (/\bmae\b|masked.autoencoder/.test(name))
    steps = [
      "遮住图像 patches",
      "编码可见部分",
      "解码缺失部分",
      "重建原始像素",
    ];
  else if (/\bmoco\b/.test(name))
    steps = [
      "两种增强视图",
      "查询与动量编码器",
      "队列提供负样本",
      "对比损失更新",
    ];
  else if (/contrastive|simclr|moco|clip|infonce|triplet/.test(name))
    steps = [
      "构造样本或视图",
      "编码成 embedding",
      "比较相似度",
      "拉近正例、拉远负例",
    ];
  else if (/mask.rcnn/.test(name))
    steps = ["提取图像特征", "提出候选区域", "检测每个物体", "预测实例 mask"];
  else if (/\bdetr\b/.test(name))
    steps = [
      "编码图像特征",
      "object queries",
      "集合匹配训练",
      "输出目标框和类别",
    ];
  else if (/u-net|unet|deeplab|segmentation/.test(name))
    steps = [
      "输入图像",
      "提取多尺度特征",
      "融合局部与全局信息",
      "输出像素标签",
    ];
  else if (/resnet|residual/.test(name))
    steps = ["输入 x", "残差变换 F(x)", "相加 F(x)+x", "继续堆叠特征"];
  else if (/\bvit\b|swin.transformer/.test(name))
    steps = [
      "图像切分成 patches",
      "映射为 token",
      "注意力整合上下文",
      "输出视觉特征",
    ];
  else if (/\bbert\b|roberta/.test(name))
    steps = ["输入双向上下文", "编码 token 关系", "预训练表示", "接任务头微调"];
  else if (/seq2seq|encoder.decoder|\bt5\b|\bbart\b/.test(name))
    steps = [
      "读取输入序列",
      "Encoder 建表示",
      "Decoder 条件生成",
      "输出目标序列",
    ];
  else if (/\bgpt\b|autoregressive|language.model/.test(name))
    steps = ["已有 token 前缀", "因果注意力", "预测下一个 token", "追加并重复"];
  else if (/word2vec/.test(name))
    steps = ["抽取词与上下文", "查找词向量", "预测邻近词", "复用学到的向量"];
  else if (/\btcn\b|temporal.convolution/.test(name))
    steps = ["输入时间序列", "因果卷积", "扩张感受野", "预测当前或未来"];
  else if (/\bppo\b|proximal.policy/.test(name))
    steps = [
      "用当前策略采样",
      "估计优势 Advantage",
      "裁剪策略比率",
      "更新策略与价值",
    ];
  else if (/\bdqn\b|deep.q|double.dqn|dueling.dqn/.test(name))
    steps = [
      "观察状态 s",
      "估计各动作 Q 值",
      "选择动作并收集经验",
      "用 TD 目标更新",
    ];
  else if (/\bdpo\b/.test(name))
    steps = [
      "收集偏好对",
      "比较策略与参考模型",
      "直接优化偏好目标",
      "评估回复质量",
    ];
  else if (/\brlhf\b/.test(name))
    steps = ["收集人类偏好", "训练奖励模型", "优化生成策略", "验证真实偏好"];
  else if (/reward.model/.test(name))
    steps = [
      "收集偏好或反馈",
      "比较回答质量",
      "学习评分函数",
      "给策略提供信号",
    ];
  else if (/decision.transformer/.test(name))
    steps = [
      "固定离线轨迹",
      "加入目标回报",
      "建模状态动作序列",
      "预测下一动作",
    ];
  else if (/offline.rl|\bcql\b/.test(name))
    steps = [
      "收集固定轨迹",
      "估计价值或策略",
      "限制数据外动作",
      "离线评估与验证",
    ];
  else if (lesson.category === "reinforcement")
    steps = [
      "观察状态 State",
      "选择动作 Action",
      "获得奖励 Reward",
      "改进策略或价值",
    ];
  else if (/attention|transformer/.test(name))
    steps = [
      "查询 Q · 键 K · 值 V",
      "相似度 QKᵀ/√d",
      "softmax 权重",
      "加权求和 AV",
    ];
  else if (
    /cnn|convolution|vgg|densenet|efficientnet|convnext|\bvit\b|swin/.test(name)
  )
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
  else if (lesson.category === "representation")
    steps = [
      "构造训练视图",
      "Encoder 提取表示",
      "自监督目标更新",
      "迁移到下游任务",
    ];
  else if (lesson.category === "classical")
    steps = ["准备特征", "拟合或保存样本", "形成决策规则", "预测或分析"];
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
  const pathways = conceptPaths
    .map((path) => ({
      path,
      step: path.steps.find((step) => step.lessonId === lesson.id),
    }))
    .filter((item) => Boolean(item.step));
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
            ...(animationSpecs[lesson.id]
              ? [["animation", "动效 Walkthrough"]]
              : []),
            ["mechanics", "步骤 Mechanics"],
            ["usage", "选型与上手 Use"],
            ["tuning", "配置与调参 Settings"],
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
        {animationSpecs[lesson.id] ? (
          <AnimatedExplainer key={lesson.id} lessonId={lesson.id} />
        ) : (
          <MechanismDiagram lesson={lesson} />
        )}
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

function Compare() {
  const [first, setFirst] = useState("rnn");
  const [second, setSecond] = useState("transformer");
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
            <LessonOptions />
          </select>
        </label>
        <label>
          算法 B
          <select value={second} onChange={(e) => setSecond(e.target.value)}>
            <LessonOptions />
          </select>
        </label>
      </div>
      {a && b && (
        <>
          {insight && (
            <div className="comparison-insight">
              <strong>差别与选择 / Key distinction</strong>
              <p>{insight}</p>
            </div>
          )}
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

const guideOptions = [
  {
    id: "classical",
    title: "小数据或快速基线",
    en: "Small data & baselines",
    category: "classical",
    reason:
      "先用 kNN、聚类、PCA 等低成本方法检验特征与任务，再判断深层模型是否值得投入。",
  },
  {
    id: "image",
    title: "图像与空间数据",
    en: "Images & spatial patterns",
    category: "vision",
    reason:
      "从 CNN 和 ResNet 理解局部特征，再根据数据规模与任务比较视觉 Transformer。",
  },
  {
    id: "segmentation",
    title: "图像分割",
    en: "Image segmentation",
    keywords: /u-net|unet|deeplab|segmentation/i,
    reason:
      "需要逐像素预测时，比较 U-Net 的跳接、DeepLab 的多尺度上下文和 nnU-Net 的自动配置。",
  },
  {
    id: "sequence",
    title: "文本与序列",
    en: "Text & sequences",
    category: "sequence",
    reason:
      "先看 RNN、attention 和 Transformer 的信息流，再按理解或生成任务选择 BERT 或自回归 LM。",
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
    id: "representation",
    title: "少标签与表示学习",
    en: "Few labels & representations",
    category: "representation",
    reason:
      "利用无标签数据学习 embedding；重点比较正负样本、增强方式与是否需要动量编码器。",
  },
  {
    id: "reinforcement",
    title: "决策与反馈",
    en: "Decisions & feedback",
    category: "reinforcement",
    reason:
      "先明确状态、动作、奖励和数据来源，再比较 value-based、policy-based、on-policy 与 off-policy 方法。",
  },
  {
    id: "general",
    title: "普通预测任务",
    en: "Prediction baseline",
    keywords: /mlp|backprop|neural network|optimization|knn/i,
    reason: "先用简单基线弄清损失函数、数据规模和评估方法，再增加结构复杂度。",
  },
];

function Guide() {
  const [choice, setChoice] = useState(guideOptions[0].id);
  const selected = guideOptions.find((option) => option.id === choice)!;
  const recommended = lessons
    .filter((item) =>
      "category" in selected
        ? item.category === selected.category
        : selected.keywords.test(`${item.id} ${item.englishTitle}`),
    )
    .sort(
      (a, b) =>
        ["入门", "进阶", "高级"].indexOf(a.level) -
        ["入门", "进阶", "高级"].indexOf(b.level),
    )
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
          <h2>你想解决什么问题？</h2>
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

function Concepts({ selectedPath }: { selectedPath?: string }) {
  useEffect(() => {
    if (!selectedPath) return;
    const timeout = window.setTimeout(() => {
      document
        .getElementById(selectedPath)
        ?.scrollIntoView({ behavior: "smooth" });
    }, 50);
    return () => window.clearTimeout(timeout);
  }, [selectedPath]);
  return (
    <main className="utility-page concept-page page-gutter">
      <div className="utility-heading">
        <a href="#/atlas">← 算法图谱</a>
        <h1>从一个概念，走到完整方法。</h1>
        <p>Connected ideas · 用逐步路径看清相邻概念如何组合、在哪一步分叉。</p>
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
  ["基线 Baseline", "先运行的简单方法，给复杂模型一个值得超过的参照。"],
  ["后验 Posterior", "给定观测后，对隐藏变量或参数的概率判断。"],
  ["软分配 Soft assignment", "给一个样本属于各组的概率，而非只指定唯一组别。"],
  ["分割 Segmentation", "对图像的像素或区域逐一预测类别或目标掩码。"],
  [
    "跳接 Skip connection",
    "把较早层的特征直接送到后面的层，保留细节或改善优化。",
  ],
  ["Token", "语言模型处理的文本单位，可以是词、子词或字符片段。"],
  [
    "因果掩码 Causal mask",
    "限制当前 token 只能读取已出现的 token，便于逐步生成。",
  ],
  ["正样本 Positive pair", "训练时希望表示更接近的一对样本或增强视图。"],
  ["负样本 Negative pair", "训练时希望模型区分开的一对样本或增强视图。"],
  [
    "数据增强 Augmentation",
    "对训练输入作保留关键信息的变换，增加可学习的变化。",
  ],
  ["策略 Policy", "强化学习中从状态选择动作的规则，常记作 π(a|s)。"],
  ["价值函数 Value function", "估计状态或动作未来累计回报的函数。"],
  ["On-policy", "主要用当前策略采集的数据更新这个策略的学习方式。"],
  ["Off-policy", "可以利用其他策略产生的数据学习目标策略的方式。"],
  ["奖励模型 Reward model", "从人类或其他偏好反馈学习打分信号的模型。"],
  [
    "预测头 Prediction head",
    "接在 backbone 表示之后的任务输出模块；分类输出 logits，回归输出数值，分割可输出像素级结果。",
  ],
  [
    "注意力头 Attention head",
    "多头注意力中的一组 Q/K/V 投影及其加权汇聚分支；与任务的 prediction head 不是同一个部件。",
  ],
  [
    "零样本 Zero-shot",
    "目标任务没有可供适配的标注示例，依靠预训练知识、任务描述或类别语义进行预测；评估须说清训练中见过什么。",
  ],
  [
    "少样本 Few-shot",
    "目标任务只有少量示例；示例可放进 prompt、用于训练浅层分类器或用于快速参数适配。",
  ],
  [
    "上下文学习 In-context learning",
    "在 prompt 中给任务说明或示例，让模型在不更新权重的推理过程中条件化输出。",
  ],
  [
    "思维链提示 Chain-of-thought",
    "在提示或示例中使用中间推理步骤，帮助某些多步问题；输出的推理文本仍要核验。",
  ],
  [
    "队列 Cohort",
    "按纳排条件、起始时点和观察窗口定义的一组研究对象；预测研究中应明确每人的特征可用时间与结局窗口。",
  ],
  [
    "数据泄漏 Data leakage",
    "训练或评估使用了预测时不可得的信息，或训练与测试之间出现不该共享的实体、处理统计量等。",
  ],
  [
    "分布漂移 Domain shift",
    "训练数据与目标环境的数据分布或输入和目标的关系发生变化。",
  ],
  [
    "外部验证 External validation",
    "将冻结的模型放到独立时间、地点或来源的数据上评估，检验其泛化表现。",
  ],
  [
    "校准 Calibration",
    "预测概率和实际发生频率的一致程度；例如预测为 0.2 的组若长期约有 20% 事件则该组较校准。",
  ],
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
  else if (route.startsWith("/concepts"))
    page = <Concepts selectedPath={route.split("/")[2]} />;
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
