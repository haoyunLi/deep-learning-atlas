# 文件分工

[文档导航](README.md) · [维护与发布](MAINTAINING.md)

| 任务 | 主要位置 |
| --- | --- |
| 课程正文、设置和方法对比 | `src/data/`；`lessons.ts` 汇总注册 |
| 练习与答案解释 | `src/data/exercises*.ts`；`exercises.ts` 汇总注册 |
| Course-specific 数值实验 | `src/data/completeLabs/` |
| 轻量实验目录 | `src/data/completeLabCatalog.ts`，由生成脚本维护 |
| 四阶段播放器与计算图 | `src/components/CompleteLessonLab.tsx`、`CompleteLabChart.tsx` |
| 其他交互实验与页面 | `src/components/`，各实验的计算函数与页面相邻 |
| 概念路径与全景路线 | `src/data/conceptPaths.ts`、`aiLandscape.ts` |
| 路径顺序、搜索和本机进度 | `src/lib/` |
| 顶层页面与 hash 路由 | `src/App.tsx` |
| 响应式样式 | `src/*.css` 与组件相邻的 CSS |
| 自动检查和生成 | `scripts/` |
| 产品与视觉约定 | 根目录 `PRODUCT.md`、`DESIGN.md` |
| 设计图片 | `design/` |
| 维护文档、历史与审查 | `docs/` |

根目录保留应用入口、构建配置、README 和产品/设计约定。`node_modules/`、`dist/`、`*.tsbuildinfo` 与 `.impeccable/review/` 是本机依赖或生成结果，已由 `.gitignore` 排除。

页面使用 hash 路由；课程 ID、路由和进度键应保持稳定。整理文档不需要重新排列课程 ID 或分类顺序。
