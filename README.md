# 深度学习图谱 · Deep Learning Atlas

一个中英混合的深度学习学习网站，用直觉、机制、选择和实践步骤解释算法。

在线阅读：[Deep Learning Atlas](https://haoyunli.github.io/deep-learning-atlas/)

## 学什么

网站目前包含 89 篇课程，按基础原理、训练与泛化、经典基线、视觉模型、语言与序列、生成模型、表示学习、强化学习、更多架构这九条路线组织。涵盖 EM、kNN、U-Net／nnU-Net、ResNet、RNN、BERT、GPT 式 LM、Reward Model、DQN、PPO、SAC、Offline RL、SimCLR、MoCo、BYOL 等。每篇回答七个问题：

1. 一句话怎样理解？
2. 内部机制如何运作？
3. 什么时候适用？
4. 怎么开始使用？
5. 优先调哪些参数？
6. 如何修改或扩展？
7. 常见问题和相邻方法的区别是什么？

还包括关键词搜索、分类筛选、两算法并排比较、按数据结构选起点的指南、术语表，以及保存在本机浏览器的阅读进度。每篇课程都链接到原始论文或官方文档。

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
- [`src/App.tsx`](src/App.tsx)：课程图谱、详情、对比、选型与术语交互。
- [`src/styles.css`](src/styles.css)：响应式视觉系统。
- [`scripts/validate-content.mjs`](scripts/validate-content.mjs)：构建时检查课程字段、来源、分类、唯一 ID 和比较链接。
- [`design/concept-home.png`](design/concept-home.png)、[`design/concept-lesson.png`](design/concept-lesson.png)：首页和课程详情的设计参考。

添加课程时给出唯一的 `id`、所属 `category`，填写课程各字段，并确保 `compareTo` 引用已有课程 ID。项目采用 hash 路由，因此课程链接可在 GitHub Pages 上直接打开或分享。

## 发布到 GitHub Pages

将仓库推送到 GitHub 的 `main` 分支，在仓库 **Settings → Pages** 中将 **Build and deployment → Source** 设为 **GitHub Actions**。之后每次推送都会运行 `.github/workflows/deploy.yml`，完成构建和部署。

部署在 `https://haoyunli.github.io/deep-learning-atlas/` 时，Vite 的相对资源路径与 hash 路由可正常工作，无需额外服务器。

## 说明

网站用于学习与方法选择，不承诺单一算法适用于所有数据。具体参数以数据规模、验证集表现、延迟、内存和任务目标为准。课程中的超参数范围是实验起点。
