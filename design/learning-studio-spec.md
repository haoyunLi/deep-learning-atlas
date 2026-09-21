# Learning Studio visual specification

The five `concept-*.png` files in this directory define the accepted visual
direction for the next learning surfaces. They extend the existing Atlas design
rather than replacing it.

## Shared system

- **Background:** true white `#fff`; selected rows use the existing pale blue.
- **Text:** existing navy `#14284b`; muted copy uses the existing blue gray;
  interactive emphasis uses the existing medium blue.
- **Semantic colors:** brick red is reserved for invalid shapes, green for a
  completed project stage, and muted orange for a test-set warning.
- **Typography:** the existing Chinese serif stack is used for page titles and
  major project headings. Controls, tables and explanatory text use the existing
  sans stack. Code and tensor shapes use a monospace stack.
- **Geometry:** open columns, rails and tables separated by thin rules. Radius is
  2–6 px. There are no gradients, floating bento grids or decorative shadows.
- **Icons:** existing stroke arrows and simple status circles/checks. Icons are
  functional and use `currentColor`; there is no decorative icon row.
- **Motion:** selected-step movement and data-flow emphasis use short opacity or
  transform transitions. `prefers-reduced-motion` disables automatic movement.

## Surfaces and locked copy

1. **Learning Studio** — “从看懂，到会做。” and “诊断基础、动手实现、比较模型、完成项目。”
2. **Code Lab** — “Attention：从公式到可靠实现”; modes “From scratch”,
   “PyTorch”, “Production”; execution rail, readable code, tensor table and
   inspector.
3. **Tensor Shape Debugger** — “先看形状，再找错误。”; five model families,
   editable dimensions, pipeline, error explanation and shape ledger.
4. **Algorithm Arena** — “同一数据，同一预算，再比较。”; task/data/budget
   controls, deterministic comparison plot, evidence explanation and results
   table with a locked test column.
5. **Project Cases** — “把一次实验，走到最后。”; seven projects, eight ordered
   stages, stage evidence rail and related-course links.

## Responsive continuation

- At tablet width, right inspectors move below the main work area while the step
  rail remains visible.
- At phone width, rails become horizontal selectors, tables and pipelines use
  named keyboard-focusable scroll regions, and primary actions remain at least
  44 px high.
- The current site header and footer remain unchanged apart from the new
  “学习工作台” route.

