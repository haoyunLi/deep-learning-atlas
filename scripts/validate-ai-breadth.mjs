import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve, dirname, extname } from "node:path";
import vm from "node:vm";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
const require = createRequire(import.meta.url),
  cache = new Map();
function load(input) {
  let file = resolve(input);
  if (extname(file) === ".css") return {};
  if (!extname(file)) file = [file + ".ts", file + ".tsx"].find(existsSync);
  assert.ok(file, `Missing ${input}`);
  if (cache.has(file)) return cache.get(file).exports;
  const m = { exports: {} };
  cache.set(file, m);
  const code = ts.transpileModule(readFileSync(file, "utf8"), {
    fileName: file,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  new vm.Script(`(function(require,module,exports){${code}\n})`, {
    filename: file,
  }).runInThisContext()(
    (p) => (p.startsWith(".") ? load(resolve(dirname(file), p)) : require(p)),
    m,
    m.exports,
  );
  return m.exports;
}
const {
  treeSplitExperiment,
  astarExperiment,
  boxIoU,
  nmsExperiment,
  rrfExperiment,
  reliabilityExperiment,
  searchEdges,
  searchHeuristic,
} = load("src/components/aiBreadthMath.ts");
let checks = 0;
const near = (a, b, tol = 1e-9) => {
  assert.ok(Number.isFinite(a) && Math.abs(a - b) < tol, `${a} != ${b}`);
  checks++;
};
near(treeSplitExperiment(2.5).selected.gain, 1 / 6);
near(treeSplitExperiment(4.5).selected.gain, 1 / 8);
assert.equal(treeSplitExperiment(2.5, 4).selected.valid, false);
assert.equal(treeSplitExperiment(2.5, 4).best.cut, 4.5);
for (const criterion of ["gini", "entropy"])
  for (let leaf = 1; leaf <= 4; leaf++)
    for (let cut = 1.5; cut <= 7.5; cut++) {
      const r = treeSplitExperiment(cut, leaf, criterion);
      near(r.selected.left.length + r.selected.right.length, 8);
      assert.ok(r.selected.gain >= -1e-12);
      assert.ok(r.best.valid);
      assert.ok(
        r.candidates
          .filter((c) => c.valid)
          .every((c) => c.gain <= r.best.gain + 1e-12),
      );
    }
// Enumerate every simple path independently of frontier priority.
function paths(node, path = [], cost = 0) {
  if (node === "G") return [{ path: [...path, node], cost }];
  return searchEdges
    .filter((e) => e[0] === node && !path.includes(e[1]))
    .flatMap(([, next, c]) => paths(next, [...path, node], cost + c));
}
const allPaths = paths("S"),
  shortest = Math.min(...allPaths.map((p) => p.cost));
near(shortest, 5);
for (const [a, b, c] of searchEdges)
  assert.ok(searchHeuristic[a] <= c + searchHeuristic[b]);
for (let w = 0; w <= 1; w += 0.1) {
  const r = astarExperiment(w);
  near(r.result.g, shortest);
  assert.equal(r.result.node, "G");
  assert.ok(r.trace.at(-1).done);
  for (const s of r.trace)
    for (const e of s.frontier) near(e.f, e.g + w * searchHeuristic[e.node]);
}
near(astarExperiment(3).result.g, 8);
assert.ok(astarExperiment(3).trace.length < astarExperiment(1).trace.length);
near(boxIoU([0, 0, 2, 2], [1, 1, 3, 3]), 1 / 7);
near(boxIoU([0, 0, 1, 1], [2, 2, 3, 3]), 0);
near(boxIoU([0, 0, 2, 2], [0, 0, 2, 2]), 1);
assert.deepEqual(nmsExperiment().kept, ["A", "C", "D"]);
assert.deepEqual(nmsExperiment(0.45, 0.5, false).kept, ["A", "D"]);
assert.deepEqual(nmsExperiment(0.5, 0.5, false).kept, ["A", "C", "D"]);
assert.deepEqual(nmsExperiment(1, 0.5, false).kept, ["A", "C", "B", "D"]);
assert.equal(nmsExperiment(0.5, 1).kept.length, 0);
for (let t = 0; t <= 1; t += 0.05)
  for (const aware of [true, false])
    for (const shift of [0, 8, 20, 40]) {
      const r = nmsExperiment(t, 0.5, aware, shift);
      assert.equal(
        new Set([...r.kept, ...r.suppressed.map((s) => s.id), ...r.filtered])
          .size,
        4,
      );
      for (const s of r.suppressed) {
        assert.ok(s.iou > t);
        if (aware)
          assert.equal(
            r.boxes.find((b) => b.id === s.id).label,
            r.boxes.find((b) => b.id === s.by).label,
          );
      }
      for (const a of r.boxes)
        for (const b of r.boxes) {
          near(boxIoU(a.xyxy, b.xyxy), boxIoU(b.xyxy, a.xyxy));
          assert.ok(boxIoU(a.xyxy, b.xyxy) >= 0 && boxIoU(a.xyxy, b.xyxy) <= 1);
        }
    }
near(
  rrfExperiment(10).ranking.find((x) => x.id === "B").score,
  1 / 12 + 1 / 11,
);
near(rrfExperiment(10, 1).candidateRecall, 0);
near(rrfExperiment(10, 4).candidateRecall, 1);
for (const k of [1, 10, 60])
  for (let depth = 1; depth <= 4; depth++)
    for (const weight of [0.25, 1, 2])
      for (let top = 1; top <= 5; top++) {
        const r = rrfExperiment(k, depth, weight, top);
        assert.ok(r.recall <= r.candidateRecall);
        assert.ok(r.retrieved.length <= top);
        for (const x of r.ranking) near(x.score, x.lexical + x.semantic);
        assert.ok(
          r.ranking.every(
            (x, i) => i === 0 || r.ranking[i - 1].score >= x.score,
          ),
        );
      }
near(reliabilityExperiment(5, 0.8, 3, 0).success, 0.992 ** 5);
near(
  reliabilityExperiment(5, 0.8, 3, 0).expectedCalls,
  1.24 * (1 + 0.992 + 0.992 ** 2 + 0.992 ** 3 + 0.992 ** 4),
);
// Independent dynamic recursion: expected calls until stage success/abort.
function expectedCalls(stages, p, a) {
  if (stages === 0) return 0;
  function attempt(left) {
    if (left === 0) return 0;
    return (
      1 + p * expectedCalls(stages - 1, p, a) + (1 - p) * attempt(left - 1)
    );
  }
  return attempt(a);
}
for (let n = 2; n <= 8; n++)
  for (const p of [0, 0.5, 0.8, 0.95, 1])
    for (let a = 1; a <= 3; a++)
      for (const c of [0, 0.1, 0.3, 1]) {
        const r = reliabilityExperiment(n, p, a, c);
        near(r.expectedCalls, c * a + (1 - c) * expectedCalls(n, p, a));
        near(r.success, (1 - c) * (1 - (1 - p) ** a) ** n);
        assert.ok(r.expectedCalls <= r.worstCalls + 1e-9);
        assert.ok(r.success >= 0 && r.success <= 1);
        assert.ok(
          r.stageSuccess.every(
            (s, i) =>
              i === 0 ||
              s.withOutage <= r.stageSuccess[i - 1].withOutage + 1e-12,
          ),
        );
      }

const { lessons } = load("src/data/lessons.ts"),
  ids = new Set(lessons.map((l) => l.id));
const { aiAreas, aiJourneys, aiTaskCompositions } = load(
  "src/data/aiLandscape.ts",
);
assert.equal(aiAreas.length, 10);
assert.equal(aiJourneys.length, 4);
assert.equal(aiTaskCompositions.length, 6);
for (const group of [...aiAreas, ...aiJourneys, ...aiTaskCompositions])
  for (const id of group.lessons ?? group.ids)
    assert.ok(ids.has(id), `Unknown landscape lesson ${id}`);
const Lab = load("src/components/AIBreadthLab.tsx").default;
const expected = {
  tree: "Decision Tree 为什么",
  search: "A* 怎样决定",
  nms: "两个框都很自信",
  retrieval: "Keyword 与 Dense",
  reliability: "每一步 90%",
};
for (const [lab, heading] of Object.entries(expected)) {
  const html = renderToStaticMarkup(
    React.createElement(Lab, { query: "lab=" + lab }),
  );
  assert.ok(html.includes(heading));
  assert.ok(!/NaN|Infinity|undefined/.test(html));
  assert.ok((html.match(/<svg\b/g) || []).length >= 1);
  const radios = [...html.matchAll(/<input\b[^>]*type="radio"[^>]*>/g)];
  assert.equal(radios.length, 2);
  const groups = radios.map(([tag]) => tag.match(/name="([^"]+)"/)?.[1]);
  assert.ok(groups[0]);
  assert.equal(groups[0], groups[1]);
  assert.ok(/disabled=""[^>]*>检查理解/.test(html));
  for (const [, id] of html.matchAll(/href="#\/lesson\/([^"?]+)/g))
    assert.ok(ids.has(id), `Missing lab link ${id}`);
}
for (const query of ["", "lab=toString", "lab=__proto__", "lab=missing"])
  assert.ok(
    renderToStaticMarkup(React.createElement(Lab, { query })).includes(
      expected.tree,
    ),
  );
const Landscape = load("src/components/AILandscape.tsx").default;
for (const area of aiAreas) {
  const html = renderToStaticMarkup(
    React.createElement(Landscape, { query: "area=" + area.id }),
  );
  assert.ok(html.includes(area.question));
  assert.ok(!/NaN|undefined/.test(html));
}
const Figure = load("src/components/BreadthLessonFigure.tsx").default;
let figureCount = 0;
for (const id of ids) {
  const html = renderToStaticMarkup(
    React.createElement(Figure, { lessonId: id }),
  );
  if (html) {
    figureCount++;
    assert.equal((html.match(/<li\b/g) || []).length, 3);
  }
}
assert.equal(figureCount, 54);
console.log(
  `Validated AI breadth: ${checks} numerical checks, optimal-search oracle, strict/class-aware NMS, RRF candidate bounds, early-stop retry recursion, 5 lab SSR routes, 10 areas, 4 journeys, 6 compositions and 54 breadth/depth lesson figures.`,
);
