# 深度学习图谱 · Deep Learning Atlas

一个中英混合的 AI / ML 学习网站，覆盖 Classical ML、Deep Learning、Computer Vision、Search / Reasoning 和 Agents，用直觉、机制、选择和实践步骤解释算法。

在线阅读：[Deep Learning Atlas](https://haoyunli.github.io/deep-learning-atlas/)

## 学什么

网站目前包含 251 篇课程，按 12 个分类组织：基础原理、训练与泛化、Classical ML、Computer Vision、语言与序列、生成模型、表示学习、Reinforcement Learning、扩展模型与系统、Meta-Learning / Adaptation、Search / Reasoning 和 Agents。除 EM、kNN、U-Net／nnU-Net、ResNet、RNN、BERT、LM、Reward Model 与不同 RL 路线外，还覆盖 MAML、FOMAML、Reptile、Matching/Relation Networks、Continual Learning、Active Learning、Domain Adaptation、AutoML、Federated Learning 与 Test-Time Adaptation。每篇回答七个问题：

1. 一句话怎样理解？
2. 内部机制如何运作？
3. 什么时候适用？
4. 怎么开始使用？
5. 优先调哪些参数？
6. 如何修改或扩展？
7. 常见问题和相邻方法的区别是什么？

每节进一步提供至少 4 步的算法运行过程、2 条适用边界，以及至少 3 个具体设置项。设置项分别说明从哪里开始、观察到什么信号后怎样调整；这些是实验起点，仍要依据数据、验证集和资源预算决定。

还包括兼容常用缩写的关键词搜索、分类与学习状态筛选、可分享的两算法对比、关键概念路径，以及保存在本机浏览器的阅读与答题记录。124 项中英术语都能跳到相关课程；选型指南从 15 类任务的 39 种具体情境出发，给出可比较的基线、第一轮设置、适用边界和评估方法。每篇课程都链接到原始论文或官方文档。

全部 251 节课程都有步骤导览；原有 56 节配有机制动效图，另新增 12 节 Biological methods 的静态机制图，53 节还可调参数并实时查看计算结果。覆盖 MLP、反向传播、优化器、EM、kNN、PCA、CNN、ResNet、U-Net、RNN、BERT、GPT、GNN、LoRA、VAE、GAN、CLIP、对比学习、Q-learning、SARSA、DQN、SAC、Reward Model、DPO，以及 cohort、数据泄漏、校准等。

[动效实验室](https://haoyunli.github.io/deep-learning-atlas/#/animations) 支持关键词、学习方向与动效类型筛选。机制实验提供四步中英说明、滑块或图解、播放/暂停、慢速/快速、手动跳步与重置；也可切换到完整课程步骤。手机上支持图内横向滑动。自动播放只在图进入视野时运行；系统启用减少动态效果时关闭自动播放和过渡。参数实验使用可手算的合成案例，清楚说明哪些公式在实时计算、哪些示意并未运行模型训练。

关键概念路径把课程按问题串起来：prediction head 与 attention head 的不同位置；zero-shot、few-shot、linear probe、原型网络与元学习；GPT 的 in-context learning、chain-of-thought 与偏好训练；cohort 定义、数据泄漏、分布漂移、外部验证与校准。每一步说明为什么要接着学下一步，并链接到完整课程。独立课程中的机制拆解仍按步骤展开，附有配置起点与调整信号。

> 阅读时要区分不同层次：CNN、RNN、Transformer 和 GNN 是模型架构；EM 是处理潜变量的一种优化框架；kNN、随机森林等是非深度学习基线；对比学习和强化学习描述学习目标或训练范式；SGD、AdamW 是更新参数的优化方法。不同层次的方法常常能够组合。

## 手算、练习与实践工坊

全部 251 节课各有一题机制题和一题选型/排错题，共 502 题；提交后显示解释，可重新作答。最近一次答案保存在当前浏览器，“学习记录与错题复习”页会汇总阅读标记、作答情况和待复习题目；课程题目修订后，旧答案不会误算进新题。

[实践工坊](https://haoyunli.github.io/deep-learning-atlas/#/practice) 包含：

- **六个手算沙盘**：kNN 距离、排名与投票；均值型 EM 的密度、责任度、加权和与似然；attention 的 Q/K/V、缩放、mask、softmax 和加权输出；PPO 正负 advantage 的裁剪目标和局部导数；cohort 的入组、观察/结果窗、随访、时间与患者切分。另有 MAML 的 support/query、inner update 与 meta-gradient 沙盘。参数变化会重新计算中间值，支持播放/暂停、逐步查看和重置。
- **完整实验案例**：160 位合成客户，按时间切成 80 train / 30 validation / 30 test，中间保留两个 30 天间隔。浏览器真实拟合 Logistic Regression，比较常数概率基线与 kNN，执行 18 组候选比较、特征消融、阈值与错误分析。查看独立测试后锁定模型和阈值，CSV 可下载复现。
- **诊断树**：loss 不降/NaN、训练好验证差、线上变差三类症状，共九个有分支的检查点。
- **LM 显存与形状计算器**：调整 batch、上下文、生成长度、层数、KV heads、head dimension 和 dtype 字节数；比较 MHA/GQA/MQA，查看 prefill/decode 的逻辑张量形状。计算的是理想 KV 存储，不是总显存或硬件延迟预测。

新增 22 节课程：BatchNorm、LayerNorm、LR schedules、gradient clipping、mixed precision；tokenization、positional encoding、autoregressive inference、KV cache、GQA、RAG、LM evaluation；XGBoost、GCN、GraphSAGE、GAT、time-series forecasting、DDPM、DDIM、latent diffusion、flow matching、OPE。新增训练稳定性、LM 完整工作链、生成路径、结构化模型选型四条关联路径。

## 从你的科研问题学习算法

[科研实践入口](https://haoyunli.github.io/deep-learning-atlas/#/practice?research=spatial) 默认打开 Spatial bin-to-cell，也可切换 Pathway/Age 和 Methylation/Age。每条路径先写 Question、Input、Output 和结论边界，再沿 6 个阶段连接 baseline、算法机制、设置、消融、独立评估与解释。选型表比较优势、代价、适用条件与第一轮设置；新情境题检查迁移理解；实验方案可编辑、本机保存并下载 Markdown。

新增 8 节课、16 道机制/选型题与 12 个术语：Count Likelihood、Pseudobulk、Nested Group Validation、Elastic Net、scVI、Spatial Assignment、Optimal Transport、Multiple Instance Learning。每课写出输入输出 shapes、具体计算、原始论文与适用边界。

新增 4 个参数机制图：Poisson/NB PMF、composition 与 aggregation、Elastic Net soft-threshold/shrinkage、geometry/expression costs 到 Gibbs weights。另有 donor split 反例：固定 4 位 donor，改变每人 cells 数与 split 单位，实时计算 fingerprint memorizer 的预测与 MAE。所有数据均为明确标识的合成教学例子，不是用户科研结果。

课程步骤导览默认手动切换；真实机制实验保留播放、暂停与调参。NB、Elastic Net 与 assignment 的参数符号、概率含义、观测单位及不适用条件明确说明。

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
- [`src/data/trainingLanguageExpansion.ts`](src/data/trainingLanguageExpansion.ts)、[`src/data/modelFamilyExpansion.ts`](src/data/modelFamilyExpansion.ts)：新增 22 节专题。
- [`src/data/exercises.ts`](src/data/exercises.ts)：502 道题的统一注册；题目分文件维护。
- [`src/components/HandCalculationSandbox.tsx`](src/components/HandCalculationSandbox.tsx)、[`src/components/sandboxMath.ts`](src/components/sandboxMath.ts)：六个沙盘及纯数值计算。
- [`src/components/PracticeHub.tsx`](src/components/PracticeHub.tsx)：完整实验案例、诊断与 LM 预算工坊。
- [`src/data/conceptPaths.ts`](src/data/conceptPaths.ts)：把模型课与概念课串成17 条逐步学习路径。
- [`src/data/glossary.ts`](src/data/glossary.ts)、[`src/data/modelGuide.ts`](src/data/modelGuide.ts)：124 项术语及 15 类任务的情境化选型数据。
- [`src/App.tsx`](src/App.tsx)：课程图谱、详情、可分享筛选、对比与路由。
- [`src/components/GlossaryPage.tsx`](src/components/GlossaryPage.tsx)、[`src/components/ModelGuide.tsx`](src/components/ModelGuide.tsx)、[`src/components/StudyReview.tsx`](src/components/StudyReview.tsx)：术语、选型和学习复习页面。
- [`src/lib/studyState.ts`](src/lib/studyState.ts)、[`src/lib/search.ts`](src/lib/search.ts)、[`src/lib/routing.ts`](src/lib/routing.ts)：本机学习记录、缩写搜索和可分享 URL 状态。
- [`src/components/AnimatedExplainer.tsx`](src/components/AnimatedExplainer.tsx)：动效步骤、参数控制、播放速度、可见性与减少动画设置。
- [`src/components/AnimationDirectory.tsx`](src/components/AnimationDirectory.tsx)：可搜索筛选的动效实验室。
- [`src/components/CourseWalkthrough.tsx`](src/components/CourseWalkthrough.tsx)：由课程机制生成的完整步骤导览。
- [`src/components/labs/`](src/components/labs/)：53 个专属参数实验，覆盖基础/经典、视觉/序列、强化/表示、生成/数据、Meta-Learning 与科研方法。
- [`src/components/AttentionAnimation.tsx`](src/components/AttentionAnimation.tsx)、[`src/components/DiffusionAnimation.tsx`](src/components/DiffusionAnimation.tsx)、[`src/components/PPOAnimation.tsx`](src/components/PPOAnimation.tsx)：三张算法机制动效图。
- [`src/styles.css`](src/styles.css)：响应式视觉系统。
- [`src/animation.css`](src/animation.css)：动效图与首页入口样式。
- [`scripts/validate-content.mjs`](scripts/validate-content.mjs)：构建时检查课程字段、来源、分类、唯一 ID 和比较链接。
- [`scripts/validate-animations.mjs`](scripts/validate-animations.mjs)：构建时检查动效覆盖、每个滑块刻度的 4,716 组 SVG 渲染，以及梯度、EM、概率归一化和 RL 目标等数值不变量；可单独运行 `npm run validate:animations`。
- [`scripts/validate-sandboxes.mjs`](scripts/validate-sandboxes.mjs)、[`scripts/validate-practice.mjs`](scripts/validate-practice.mjs)：构建时核查 EM 单调性、PPO 梯度、cohort 时间窗、案例切分/拟合/指标、KV 公式与逐课练习覆盖；可单独运行 `npm run validate:practice`。
- [`scripts/validate-experience.mjs`](scripts/validate-experience.mjs)：构建时核查术语与选型链接、损坏/旧版学习记录恢复、存储不可用时的降级、题目签名、搜索别名、路由参数和轻量动效目录；可单独运行 `npm run validate:experience`。
- [`design/concept-home.png`](design/concept-home.png)、[`design/concept-lesson.png`](design/concept-lesson.png)：首页和课程详情的设计参考。

添加课程时给出唯一的 `id`、所属 `category`，填写课程各字段，特别是 `mechanicsSteps`、`limits` 与 `settings`，并确保 `compareTo` 引用已有课程 ID。为新课在练习文件中添加 `mechanism` 与 `decision` 各一题，注册到 `exercises.ts`；新课程文件也需注册到内容校验脚本。生产构建会检查这三组内容的最低条目数和设置项字段。项目采用 hash 路由，因此课程链接可在 GitHub Pages 上直接打开或分享。

## 发布到 GitHub Pages

将仓库推送到 GitHub 的 `main` 分支，在仓库 **Settings → Pages** 中将 **Build and deployment → Source** 设为 **GitHub Actions**。之后每次推送都会运行 `.github/workflows/deploy.yml`，完成构建和部署。

部署在 `https://haoyunli.github.io/deep-learning-atlas/` 时，Vite 的相对资源路径与 hash 路由可正常工作，无需额外服务器。

## 说明

网站用于学习与方法选择，不承诺单一算法适用于所有数据。具体参数以数据规模、验证集表现、延迟、内存和任务目标为准。课程中的超参数范围是实验起点。

## 机制推演扩展 · 2026-10-28

[进入交互实验](https://haoyunli.github.io/deep-learning-atlas/#/practice?lab=bayes)：Bayesian Update、Threshold & Base Rate、Sinkhorn Transport、Donor Bootstrap。四组实验有八幅实时计算图、参数控制、预测反馈、四步推导、设置建议与适用边界，另有跨站 Bio/CS 机制实验入口。它们独立于原有53个课程参数实验计数。

新课程包括 Bayesian Updating、Gaussian Processes、Bayesian Optimization、MCMC/HMC、Importance Sampling、Particle Filters、Neural ODEs 与 Hierarchical Bootstrap。所有数值为显式 synthetic examples；不声称复现真实生物结果。


## Single-cell / Spatial algorithm detail expansion

[打开 Biological Algorithm Lab](https://haoyunli.github.io/deep-learning-atlas/#/bio-algorithms?lab=em)。新增 12 节专课、24 道课程练习与 12 幅三阶段机制图。覆盖 EM objective/degeneracy、count mixture/background、structured assignment、Spatial MDP、reward shaping/constraints、OPE、graph construction、GCN boundary propagation、GAT、GraphSAGE sampling、Count VAE、biological Contrastive design。每课包括输入输出、逐步数值例子、使用条件、限制、参数起点与调整依据。

六个独立数值实验各有两幅计算图和一道预测题：

- Count mixture EM：molecule responsibilities、mixture M-step、likelihood trace 与 zero-weight trapping。
- Assignment → RL：四条 trajectories 的 exact planning、discount、collision penalty 与独立 reference。
- GAE：逐步 backward trace、terminal 与 time-limit truncation 的 bootstrap 区别。
- GCN：symmetric degree normalization、self-loop、跨 boundary edge 和深度传播。
- GAT：给定 edge logits 后的 attention、per-edge messages 与邻居集合变化。
- Contrastive：InfoNCE probabilities、false-negative gradient 与 temperature。

这些是 synthetic teaching models，不声称复现 scVI、cell2location 或训练后的 biological GNN/RL。GAE/GCN/EM 支持手动步骤与可暂停播放；减少动态效果时保留手动操作。图保持标签字号，仅在图内横向滚动。Practice tab/path/lab 同步 URL，支持刷新与 Back/Forward。

独立数值检查 `scripts/validate-bio-algorithms.mjs` 覆盖守恒、极限与差分梯度；课程 fixtures 另以 `validate-bio-inference-content.mjs` 与 `validate-bio-graph-lessons.mjs` 检查。新实验计数独立于已有 53 parameter labs 与 4 个 Experiment Bench 实验。


## AI / ML breadth expansion

[AI 全景](https://haoyunli.github.io/deep-learning-atlas/#/landscape) 将方法、任务与系统分开解释：Machine Learning / Deep Learning 是方法家族；Computer Vision、Speech、Retrieval 是任务领域；Workflow / Agent 是系统组织方式；RL 与 Self-supervised 是学习方式。它们可以交叉组合。原站名、GitHub URL、课程 IDs 与浏览器学习记录保持可用。

新增36节课（每节有完整机制、设置、适用条件、优缺点、两道课程练习与三阶段机制图）：

- Classical ML / Probability：OLS、Naive Bayes、Decision Tree、Boosting families、DBSCAN、t-SNE/UMAP、Anomaly Detection、Probabilistic Graphical Models、HMM、Kalman Filter、Causal Graph、Learning Paradigms。
- Computer Vision：Camera Geometry、Local Features、RANSAC、Detection Metrics / NMS、Segmentation Metrics、Optical Flow、Tracking、Stereo Depth、Point Clouds、NeRF / 3DGS、Video、Document AI / OCR。
- Agents / Reasoning：Workflow、Tool Contracts、ReAct、A*、Memory、Hybrid Retrieval、Evaluation、Security Boundaries、Multi-Agent、MCP、Knowledge Graph、Reliability Budgets。

全景入口覆盖10个交叉领域、6种系统组合与4条有顺序的学习路线；课程选择显示已有学习状态。新[跨领域机制实验](https://haoyunli.github.io/deep-learning-atlas/#/ai-labs?lab=tree)提供 Decision Tree split、A* frontier、IoU/NMS、RRF ranking 和 Agent retry/correlation 的真实数值计算。所有 fixtures 均为明确标记的 synthetic examples，没有外部模型调用，也不声称是真实 Agent/CV benchmark。

新增四个 validators 检查36课的算术、72道题、36幅机制图，以及数值实验、链接、SSR、异常路由回退与 radio groups。


## AI / ML / CV / Agent mechanism depth · 2026-10-29

在全站 233 节既有课程的目录与邻接内容审查基础上，新增 18 节细节课，当前共 **251 节课程、502 道练习**。新增课各有 8–10 个机制步骤、4 个以上使用步骤、4 个参数设置（起点及调整信号）、适用条件与限制、两道题、三阶段数值图。审阅范围及来源见 [ML](docs/audits/2026-10-29-ml-depth.md)、[CV](docs/audits/2026-10-29-cv-depth.md)、[Agent](docs/audits/2026-10-29-agent-depth.md)；这不是全 AI 知识已经穷尽的声明。

- **ML / Probability**：Variational Inference / ELBO、Hierarchical Partial Pooling、Proper Scoring Rules、Bayes Decision Thresholds、Quantile Regression、Label Shift Correction。
- **CV**：Preprocessing / Augmentation、Feature Pyramids / Small Objects、Box Regression Losses、Hungarian Set Matching、Dense Visual Correspondence、Keypoint Heatmaps / Pose。
- **Agent / Search / Decoding**：MCTS / UCT、LinUCB、Beam Search、Grammar-constrained Decoding、Speculative Decoding、State Checkpoints / Recovery。

[六个逐步算法实验](https://haoyunli.github.io/deep-learning-atlas/#/ai-depth?lab=hmm) 实际计算 HMM Forward/Smoothing/Viterbi、Kalman posterior、Hungarian primal-dual assignment、Image Geometry 坐标往返、四阶段 MCTS 和 Beam/Grammar scores。它们共有九幅计算图，支持参数重算、手动步骤、可暂停播放、数值读数、预测题及设置/边界说明。图像是计算生成的 SVG，不是模型训练或真实实验结果。参数修改回到初始步骤，隐藏页面暂停，reduced motion 保留手动操作。

动效目录补齐 17 个跨课数值实验的直接入口，并把关联课程纳入“可调参数”筛选。这 17 个实验包括原有 6 个 Biological Algorithm Labs、5 个 AI Breadth Labs 和本轮 6 个 Depth Labs；独立于原有 53 个课内参数实验、手算沙盘与 Experiment Bench，不能混计为 17 个全新实验。

修订旧课的 RoI Pooling/RoIAlign、YOLO 版本边界、theoretical/Effective Receptive Field、ViT patch/checkpoint、β-VAE/ELBO、Ensemble disagreement、Conformal selective risk、Class Weighting、Label Shift、Bandit context/propensity 与 PUCT/UCT，并加入相应细节课的双向联系。

新增四个 validators 分别检查课程算术与深度实验。Depth Lab 使用 exhaustive HMM path/assignment oracles、Kalman precision fusion、geometry round trips、MCTS backup invariants、Beam distribution normalization 等独立依据；完整 build 同时检查全站课程、练习、链接、既有实验和 TypeScript。所有教学数值均为 synthetic fixtures。
