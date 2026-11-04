# 深度学习图谱 · Deep Learning Atlas

**在线网站：[点击打开 Deep Learning Atlas](https://haoyunli.github.io/deep-learning-atlas/)**

面向希望理解算法原理与实际用法的学习者，用中文解释、English technical terms 和可操作的数值例子连接 AI、ML、Computer Vision、Search / Reasoning 与 Agents。每课说明机制、适用条件、参数起点、调整依据、优缺点与排错方法。

## 从哪里开始

| 你想做什么 | 在线入口 |
| --- | --- |
| 建立 AI / ML 知识地图 | [AI 全景](https://haoyunli.github.io/deep-learning-atlas/#/landscape) |
| 按先后顺序连续学习 | [关键概念与学习路径](https://haoyunli.github.io/deep-learning-atlas/#/concepts) |
| 按主题查找算法 | [算法目录](https://haoyunli.github.io/deep-learning-atlas/#/atlas) |
| 改参数、看中间计算与结果对照 | [动效实验室](https://haoyunli.github.io/deep-learning-atlas/#/animations) |
| 做实验、调参和诊断训练问题 | [实践工坊](https://haoyunli.github.io/deep-learning-atlas/#/practice) |
| 从科研问题进入 Single-cell / Spatial | [Spatial 项目路径](https://haoyunli.github.io/deep-learning-atlas/#/practice?research=spatial) |
| 理解 TF、Enhancer、LR 与 VAF 的计算模型 | [生物调控学习路径](https://haoyunli.github.io/deep-learning-atlas/#/concepts/biology-regulation-inference) |

当前有 **257 节课程、514 道练习、18 条概念路径和 4 条全景路线**。其中 176 个 course-specific numerical labs 提供逐步计算与固定对照；其他课程连接已有机制图或计算实验。课程与实验的覆盖方式有重叠，实验数不能直接相加当作课程数。

学习路径中的“上一步 / 下一步”沿当前路线继续；按领域浏览的目录用于查阅。阅读和答题记录保存在当前浏览器。计算例子明确标注 synthetic teaching model，其结果与真实数据分析的证据边界分别说明。方法资料链接到原论文或官方文档。

## 本地运行与检查

需要 Node.js 22.12 或更新版本。

```bash
npm ci
npm run dev
```

```bash
npm run build
npm run preview
```

`npm run build` 包含 TypeScript、内容与链接、学习路径、练习、数值模型和图形渲染检查。构建产物位于 `dist/`，本机依赖与预览截图不提交。

## 仓库结构

```text
src/                 课程、练习、算法计算、页面与交互组件
scripts/             内容、数值与学习体验验证；目录生成工具
docs/                维护说明、设计文档、审查记录与历史快照
design/              设计参考图片
.github/workflows/   GitHub Pages 构建与发布
```

- [文档导航](docs/README.md)：从哪里找维护说明与审查记录。
- [文件分工](docs/REPOSITORY.md)：修改课程、实验、导航或样式时定位哪些文件。
- [维护与发布](docs/MAINTAINING.md)：增加课程、运行检查和发布网站。
- [Bio/CS 生物学习网站](https://haoyunli.github.io/intro-to-bio-for-computational-biology/)：补充算法对应的生物对象、测量与实验前提。

`main` 推送后由 GitHub Actions 构建 `dist/` 并发布到 GitHub Pages。更新历史与长篇审查记录已归入 [docs](docs/README.md)，整理前的说明保存在 [历史 README](docs/archive/README-2026-11-04.md)。
