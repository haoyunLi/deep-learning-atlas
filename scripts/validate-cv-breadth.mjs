import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function load(file, name) {
  const code = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
    },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports });
  return module.exports[name];
}
const lessons = load("src/data/cvBreadth.ts", "cvBreadthLessons");
const exercises = load("src/data/exercisesCVBreadth.ts", "cvBreadthExercises");
const figures = load("src/data/cvBreadthFigures.ts", "cvBreadthFigures");
assert.equal(lessons.length, 12);
assert.equal(new Set(lessons.map((x) => x.id)).size, 12);
for (const lesson of lessons) {
  for (const key of [
    "id",
    "title",
    "englishTitle",
    "category",
    "level",
    "duration",
    "icon",
    "summary",
    "intuition",
    "core",
    "equation",
    "example",
  ])
    assert.ok(lesson[key]?.length, `${lesson.id}: ${key}`);
  for (const [key, min] of Object.entries({
    mechanicsSteps: 6,
    howToUse: 4,
    limits: 3,
    tuning: 3,
    settings: 3,
    whenToUse: 2,
    modifications: 2,
    pitfalls: 2,
    compareTo: 2,
  }))
    assert.ok(lesson[key]?.length >= min, `${lesson.id}: ${key}`);
  assert.equal(lesson.category, "vision");
  assert.ok(new URL(lesson.source.url).protocol === "https:");
  for (const setting of lesson.settings)
    for (const key of ["name", "start", "adjust"])
      assert.ok(setting[key]?.length);
  assert.equal(exercises[lesson.id]?.length, 2);
  assert.deepEqual(Array.from(exercises[lesson.id].map((x) => x.kind)), [
    "mechanism",
    "decision",
  ]);
  for (const exercise of exercises[lesson.id]) {
    assert.ok(
      exercise.answer >= 0 && exercise.answer < exercise.options.length,
    );
    assert.ok(
      exercise.question.length > 10 && exercise.explanation.length > 20,
    );
  }
  const fig = figures[lesson.id];
  assert.equal(fig.nodes.length, 3);
  assert.equal(fig.edges.length, 2);
  for (const node of fig.nodes)
    assert.ok(
      [...node.detail].length <= 50,
      `${lesson.id}: figure detail too long`,
    );
  assert.ok(fig.caption.includes("Synthetic"));
}
const near = (a, b, t = 1e-9) => assert.ok(Math.abs(a - b) < t, `${a} ≠ ${b}`);
// Camera projection, then resize and crop.
const project = (p, f, c) => [
  (f[0] * p[0]) / p[2] + c[0],
  (f[1] * p[1]) / p[2] + c[1],
];
assert.deepEqual(project([1, 0.5, 5], [800, 800], [320, 240]), [480, 320]);
assert.deepEqual(project([2, 1, 10], [800, 800], [320, 240]), [480, 320]);
assert.deepEqual(project([1, 0.5, 5], [400, 400], [160, 120]), [240, 160]);
assert.deepEqual(project([1, 0.5, 5], [400, 400], [140, 110]), [220, 150]);
// Descriptor distances: ratio and binary distance are distinct quantities.
near(0.4 / 0.8, 0.5);
near(0.7 / 0.8, 0.875);
assert.ok(0.4 < 0.75 * 0.8);
assert.ok(!(0.7 < 0.75 * 0.8));
assert.equal([..."101100"].filter((bit, i) => bit !== "111001"[i]).length, 3);
// RANSAC probability under the explicit independent-draw teaching assumptions.
const ransac = (w, s, p) => Math.ceil(Math.log(1 - p) / Math.log(1 - w ** s));
assert.equal(ransac(0.5, 4, 0.99), 72);
assert.equal(ransac(0.8, 4, 0.99), 9);
assert.ok(1 - (1 - 0.5 ** 4) ** 72 >= 0.99);
assert.ok(1 - (1 - 0.5 ** 4) ** 71 < 0.99);
assert.deepEqual(
  [1, 2, 8].map((e) => e <= 3),
  [true, true, false],
);
// Continuous-coordinate IoU and greedy one-class NMS fixture.
const area = (b) => Math.max(0, b[2] - b[0]) * Math.max(0, b[3] - b[1]);
const iou = (a, b) => {
  const intersection =
    Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) *
    Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
  return intersection / (area(a) + area(b) - intersection);
};
const overlap = iou([0, 0, 4, 4], [1, 1, 5, 5]);
near(overlap, 9 / 23);
assert.ok(overlap > 0.3 && overlap < 0.5);
// All-points monotone-envelope AP, deliberately not COCO's sampled AP.
const tp = [1, 1, 2],
  fp = [0, 1, 1];
const precision = tp.map((v, i) => v / (v + fp[i]));
const recall = tp.map((v) => v / 2);
near(precision[1], 0.5);
near(recall[1], 0.5);
for (let i = precision.length - 2; i >= 0; i--)
  precision[i] = Math.max(precision[i], precision[i + 1]);
let ap = 0,
  last = 0;
for (let i = 0; i < precision.length; i++) {
  ap += (recall[i] - last) * precision[i];
  last = recall[i];
}
near(ap, 5 / 6);
// Pixel-perfect foreground can still merge distinct instances.
near(6 / 6, 1);
near((2 * 6) / (2 * 6), 1);
near(3 / 6, 0.5);
const mergeMatches = [0.5, 0.5].filter((x) => x > 0.5).length;
assert.equal(mergeMatches, 0);
near((0.8 + 0.6) / (2 + 0.5 * 1 + 0.5 * 1), 7 / 15);
near((0.8 + 0.6) / 2, 0.7);
near((2 / 3) * 0.7, 7 / 15);
// Flow equation remains underdetermined along the unobserved direction.
for (const v of [-5, 0, 7]) near(1 * 2 + 0 * v - 2, 0);
near(0 * 2 + 1 * 1 - 1, 0);
near(Math.hypot(3 - 2, 1 - 1), 1);
// One-to-one association cannot reuse a detection.
const cost = [
  [0.1, 0.2],
  [0.11, 0.9],
];
near(cost[0][0] + cost[1][1], 1);
near(cost[0][1] + cost[1][0], 0.31);
// Depth and its local first-order sensitivity.
const depth = (d) => (800 * 0.1) / d;
near(depth(40), 2);
near(depth(20), 4);
near(80 / 40 ** 2, 0.05);
near(80 / 20 ** 2, 0.2);
const eps = 1e-4;
near(-(depth(40 + eps) - depth(40 - eps)) / (2 * eps), 0.05, 1e-8);
// Symmetric point aggregation and its shape/storage arithmetic.
const pool = (xs) => [Math.max(...xs), Math.max(...xs.map((x) => x * x))];
assert.deepEqual(pool([1, 2, 3]), [3, 9]);
assert.deepEqual(pool([3, 1, 2]), [3, 9]);
assert.equal(1024 + 64, 1088);
assert.equal(64 ** 3, 262144);
assert.equal(128 ** 3, 2097152);
assert.equal(128 ** 3 / 64 ** 3, 8);
// Two-sample alpha compositing over black, preserving remaining transmittance.
const alpha = 1 - Math.exp(-Math.log(2));
near(alpha, 0.5);
const weights = [alpha, (1 - alpha) * alpha],
  tail = (1 - alpha) ** 2;
near(weights[0], 0.5);
near(weights[1], 0.25);
near(weights[0] + weights[1] + tail, 1);
// Video temporal span and attention pair counts, not measured FLOPs/memory.
near(((8 - 1) * 4) / 30, 14 / 15);
assert.equal((224 / 16) ** 2, 196);
assert.equal(8 * 196, 1568);
assert.equal((8 * 196) ** 2, 2458624);
assert.equal(196 * 8 ** 2 + 8 * 196 ** 2, 319872);
// Page coordinate normalization and edit-distance metric denominator.
assert.deepEqual(
  [100 / 1000, 200 / 2000, 300 / 1000, 400 / 2000].map((x) => x * 1000),
  [100, 100, 300, 200],
);
near((1 + 1 + 1) / 10, 0.3);
console.log(
  "Validated CV breadth: 12 lessons, 24 exercises, 12 figures; camera, matching, RANSAC, IoU/AP/PQ, flow, tracking, stereo, point pooling, compositing, video and OCR arithmetic.",
);
