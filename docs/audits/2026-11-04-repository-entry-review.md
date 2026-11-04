# GitHub 仓库入口审查 · 2026-11-04

检查范围：当前账户名下 15 个仓库的仓库元数据和默认分支 README。读取 `has_pages`、`homepage` 与 README 中明确的网站 URL；这不是对所有网站功能或内容的全面验证。

两个学习网站现统一在 README 标题下提供在线入口，并设置 GitHub About 的 Website 字段。两站的根目录、维护说明与历史资料同时整理。其他仓库本轮只检查并记录。

有 Pages 或 homepage 配置的仓库共 10 个。大多数已在 README 前 20 行给出网站链接；PaperBridge-Website 的正式网站链接位于第 124 行。`pseudo_bulk` 缺 README；未配置网站的代码项目应优先提供用途、安装和使用入口。

| 仓库 | Pages / homepage 配置 | README 网站入口 | 结论 |
| --- | --- | --- | --- |
| [Bin2Cell_Validation](https://github.com/haoyunLi/Bin2Cell_Validation) | 未配置 | 未发现已配置的独立网站 | 代码/资料项目，保留安装或使用说明入口 |
| [CellAnnotation-MCP](https://github.com/haoyunLi/CellAnnotation-MCP) | 有 | 第 3 行 | 已有 README 网站入口 |
| [champaign-fandian](https://github.com/haoyunLi/champaign-fandian) | 有 | 第 5 行 | 已有 README 网站入口 |
| [cpsc-440-learning-atlas](https://github.com/haoyunLi/cpsc-440-learning-atlas) | 有 | 第 5 行 | 已有 README 网站入口 |
| [deep-learning-atlas](https://github.com/haoyunLi/deep-learning-atlas) | 有 | 第 3 行（本轮统一） | README、文档分类与 About 网站字段已整理 |
| [HD-Cell-RL](https://github.com/haoyunLi/HD-Cell-RL) | 有 | 第 10 行 | 已有 README 网站入口 |
| [hpc-introduction](https://github.com/haoyunLi/hpc-introduction) | 有 | 第 7 行 | 已有 README 网站入口 |
| [intro-to-bio-for-computational-biology](https://github.com/haoyunLi/intro-to-bio-for-computational-biology) | 有 | 第 3 行（本轮统一） | README、文档分类与 About 网站字段已整理 |
| [PaperBridge](https://github.com/haoyunLi/PaperBridge) | 有 | 第 13 行 | 已有 README 网站入口 |
| [PaperBridge-Website](https://github.com/haoyunLi/PaperBridge-Website) | 有 | 第 124 行 | 网站入口较靠后，建议移到标题下；本轮仅审查 |
| [pseudo_bulk](https://github.com/haoyunLi/pseudo_bulk) | 未配置 | 缺少 README | 代码项目，建议补安装、输入输出和用法说明 |
| [research-talk-slides](https://github.com/haoyunLi/research-talk-slides) | 未配置 | 未发现已配置的独立网站 | 代码/资料项目，保留安装或使用说明入口 |
| [shiri-nutrition-journal](https://github.com/haoyunLi/shiri-nutrition-journal) | 有 | 第 5 行 | 已有 README 网站入口 |
| [terra-workshop](https://github.com/haoyunLi/terra-workshop) | 未配置 | 未发现已配置的独立网站 | 代码/资料项目，保留安装或使用说明入口 |
| [VAE_EMBEDDINGS](https://github.com/haoyunLi/VAE_EMBEDDINGS) | 未配置 | 未发现已配置的独立网站 | 代码/资料项目，保留安装或使用说明入口 |

## 两站整理结果

- 当前 README 只保留网站入口、学习入口、运行检查和文件导航。
- 长篇历史说明保存在 `docs/archive/`，审查记录按日期归入 `docs/audits/`。
- 生物站 82 个 JS 和 24 个 CSS 按类别迁移到 `assets/js/`、`assets/css/`；资源内容按迁移前版本逐字节核对。HTML、CSS 和测试引用同步调整。
- 生物站原有 15 个 HTML 页面、章节 ID 与本机进度键保留。根目录阅读卡保留轻量兼容入口。
- 新增本地引用检查；AI 完整构建包含该检查，生物站以 `node scripts/check.mjs` 统一运行检查。

验证记录以本次实际完成的自动检查和浏览器结果为准；历史审计中的数字属于各自版本。

## 本轮验证

- AI：`npm run build` 通过，包含新加入的本地文档引用检查；课程与算法源文件未改动。
- 生物：`node scripts/check.mjs` 的 18 项检查通过；106 个迁移资源与整理前提交逐字节一致。
- 使用当前可用的 Unified CUA 内置浏览器验证；独立 Browser skill 未提供，未使用外部 Playwright。
- 生物站 15 个 HTML 入口在桌面 1280px 与手机 390px 下均有实际内容，无页面横向溢出和相关控制台错误。
- 实际操作 RB03 → RB04 专题跳转；ABC 切换候选集合后，E1 score 为 .6154，保留 Step4。
- 仓库说明中的网站链接通过 HTTP 检查；About Website 字段同步核对。截图与临时检查数据保存在仓库外。
