# 深度学习图谱 · Deep Learning Atlas

一个中英混合的深度学习学习网站，用直觉、机制、选择和实践步骤解释算法。

在线阅读：[Deep Learning Atlas](https://haoyunli.github.io/deep-learning-atlas/)

## 学什么

网站目前包含 104 篇课程，按基础原理、训练与泛化、经典基线、视觉模型、语言与序列、生成模型、表示学习、强化学习、更多架构这九条路线组织。涵盖 EM、kNN、U-Net／nnU-Net、ResNet、RNN、BERT、GPT 式 LM、Reward Model、DQN、PPO、SAC、Offline RL、SimCLR、MoCo、BYOL 等。每篇回答七个问题：

1. 一句话怎样理解？
2. 内部机制如何运作？
3. 什么时候适用？
4. 怎么开始使用？
5. 优先调哪些参数？
6. 如何修改或扩展？
7. 常见问题和相邻方法的区别是什么？

每节进一步提供至少 4 步的算法运行过程、2 条适用边界，以及至少 3 个具体设置项。设置项分别说明从哪里开始、观察到什么信号后怎样调整；这些是实验起点，仍要依据数据、验证集和资源预算决定。

还包括关键词搜索、分类筛选、两算法并排比较、按数据结构选起点的指南、关键概念路径、术语表，以及保存在本机浏览器的阅读进度。每篇课程都链接到原始论文或官方文档。

全部 104 节课程都有步骤动效；其中 48 节配有专属机制图，45 节还可调参数并实时查看计算结果。覆盖 MLP、反向传播、优化器、EM、kNN、PCA、CNN、ResNet、U-Net、RNN、BERT、GPT、GNN、LoRA、VAE、GAN、CLIP、对比学习、Q-learning、SARSA、DQN、SAC、Reward Model、DPO，以及 cohort、数据泄漏、校准等。

[动效实验室](https://haoyunli.github.io/deep-learning-atlas/#/animations) 支持关键词、学习方向与动效类型筛选。每个实验提供四步中英说明、滑块或图解、播放/暂停、慢速/快速、手动跳步与重置；也可切换到完整课程步骤。手机上支持图内横向滑动。自动播放只在图进入视野时运行；系统启用减少动态效果时关闭自动播放和过渡。参数实验使用可手算的合成案例，清楚说明哪些公式在实时计算、哪些示意并未运行模型训练。

关键概念路径把课程按问题串起来：prediction head 与 attention head 的不同位置；zero-shot、few-shot、linear probe、原型网络与元学习；GPT 的 in-context learning、chain-of-thought 与偏好训练；cohort 定义、数据泄漏、分布漂移、外部验证与校准。每一步说明为什么要接着学下一步，并链接到完整课程。独立课程中的机制拆解仍按步骤展开，附有配置起点与调整信号。

> 阅读时要区分不同层次：CNN、RNN、Transformer 和 GNN 是模型架构；EM 是处理潜变量的一种优化框架；kNN、随机森林等是非深度学习基线；对比学习和强化学习描述学习目标或训练范式；SGD、AdamW 是更新参数的优化方法。不同层次的方法常常能够组合。

## 本地运行

需要 Node.js 22.12 或更新版本。

```bash
npm ci
npm run dev
```

打开终端给出的本地地址。生产构建：

```bash
npm run build
npm run preview
```

## 内容与结构

- [`src/data/lessons.ts`](src/data/lessons.ts)：核心课程、分类与汇总顺序。
- [`src/data/classicalRepresentation.ts`](src/data/classicalRepresentation.ts)：经典方法与表示学习课程。
- [`src/data/visionLanguage.ts`](src/data/visionLanguage.ts)：视觉、语言与序列模型课程。
- [`src/data/rlModels.ts`](src/data/rlModels.ts)：强化学习及偏好优化课程。
- [`src/data/learningConcepts.ts`](src/data/learningConcepts.ts)：head、zero/few-shot、in-context learning 等概念课程。
- [`src/data/dataConcepts.ts`](src/data/dataConcepts.ts)：cohort、数据泄漏、分布变化与可信评估课程。
- [`src/data/conceptPaths.ts`](src/data/conceptPaths.ts)：把模型课与概念课串成四条逐步学习路径。
- [`src/App.tsx`](src/App.tsx)：课程图谱、详情、对比、选型与术语交互。
- [`src/components/AnimatedExplainer.tsx`](src/components/AnimatedExplainer.tsx)：动效步骤、参数控制、播放速度、可见性与减少动画设置。
- [`src/components/AnimationDirectory.tsx`](src/components/AnimationDirectory.tsx)：可搜索筛选的动效实验室。
- [`src/components/CourseWalkthrough.tsx`](src/components/CourseWalkthrough.tsx)：由课程机制生成的完整步骤导览。
- [`src/components/labs/`](src/components/labs/)：45 个专属参数实验，按基础/经典、视觉/序列、强化/表示、生成/数据组织。
- [`src/components/AttentionAnimation.tsx`](src/components/AttentionAnimation.tsx)、[`src/components/DiffusionAnimation.tsx`](src/components/DiffusionAnimation.tsx)、[`src/components/PPOAnimation.tsx`](src/components/PPOAnimation.tsx)：三张算法机制动效图。
- [`src/styles.css`](src/styles.css)：响应式视觉系统。
- [`src/animation.css`](src/animation.css)：动效图与首页入口样式。
- [`scripts/validate-content.mjs`](scripts/validate-content.mjs)：构建时检查课程字段、来源、分类、唯一 ID 和比较链接。
- [`scripts/validate-animations.mjs`](scripts/validate-animations.mjs)：构建时检查动效覆盖、参数端点、540 组 SVG 渲染及梯度、EM、概率归一化和 RL 目标等数值不变量；可单独运行 `npm run validate:animations`。
- [`design/concept-home.png`](design/concept-home.png)、[`design/concept-lesson.png`](design/concept-lesson.png)：首页和课程详情的设计参考。

添加课程时给出唯一的 `id`、所属 `category`，填写课程各字段，特别是 `mechanicsSteps`、`limits` 与 `settings`，并确保 `compareTo` 引用已有课程 ID。生产构建会检查这三组内容的最低条目数和设置项字段。项目采用 hash 路由，因此课程链接可在 GitHub Pages 上直接打开或分享。

## 发布到 GitHub Pages

将仓库推送到 GitHub 的 `main` 分支，在仓库 **Settings → Pages** 中将 **Build and deployment → Source** 设为 **GitHub Actions**。之后每次推送都会运行 `.github/workflows/deploy.yml`，完成构建和部署。

部署在 `https://haoyunli.github.io/deep-learning-atlas/` 时，Vite 的相对资源路径与 hash 路由可正常工作，无需额外服务器。

## 说明

网站用于学习与方法选择，不承诺单一算法适用于所有数据。具体参数以数据规模、验证集表现、延迟、内存和任务目标为准。课程中的超参数范围是实验起点。
