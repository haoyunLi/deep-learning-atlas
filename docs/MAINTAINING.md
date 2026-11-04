# 维护与发布

[文档导航](README.md) · [文件分工](REPOSITORY.md)

## 开发

使用 Node.js 22.12 或更新版本，在仓库根目录运行 `npm ci`，再运行 `npm run dev`。生产预览为 `npm run build` 后运行 `npm run preview`。

## 修改课程或实验

1. 在 `src/data/` 编辑正文，保留唯一课程 ID、English technical terms、来源、机制步骤、使用条件、限制和参数调整依据。
2. 新课在 `lessons.ts` 注册；新课程文件同时加入 `scripts/validate-content.mjs` 的清单。
3. 在练习注册中为该课加入 mechanism 与 decision 各一题，保持题目 ID 和修订逻辑可追踪。
4. 数值实验写清 synthetic inputs、单位、假设、中间计算和结论边界，并用独立预期值验证。
5. 改动 Complete Lab 的题目或参数后运行 `node scripts/generate-complete-lab-catalog.mjs`。
6. 运行 `npm run build`。对新交互再检查实际浏览器操作、手机布局和控制台；旧验证记录不代表本次已完成这些检查。

可单独运行 `npm run validate:complete`、`npm run validate:practice`、`npm run validate:animations` 和 `npm run validate:experience` 定位失败。完整构建会运行各组内容、课程和算法检查。

## 发布

`main` 的推送触发 `.github/workflows/deploy.yml`：安装依赖 → 完整构建 → 上传 `dist/` → 部署 GitHub Pages。仓库 Pages Source 使用 GitHub Actions。完成后检查对应提交的 Actions 状态和线上页面。

学习记录位于浏览器；修改路由、课程或题目 ID 时，应检查旧进度恢复。保留稳定的 `#/lesson/<id>` 与学习路径入口。

## 文档与生成文件

README 提供当前网站入口与简要使用说明。维护方法放在 `docs/`，带日期和范围的审查放在 `docs/audits/`，历史快照放在 `docs/archive/`。新验证记录只说明本次实际完成的检查。

设计参考图片保存在 `design/`；本地截图保存在忽略目录 `.impeccable/review/`。依赖、构建产物和临时截图不进入提交。
