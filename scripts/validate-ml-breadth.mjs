import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));
function loadData(file, exportName) {
  const source = readFileSync(resolve(root, file), "utf8");
  const { outputText, diagnostics } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    reportDiagnostics: true,
  });
  assert.equal(
    diagnostics?.length ?? 0,
    0,
    `${file}: TypeScript parse diagnostics`,
  );
  const exports = {};
  vm.runInNewContext(outputText, { exports }, { filename: file });
  return exports[exportName];
}
const lessons = loadData("src/data/mlBreadth.ts", "mlBreadthLessons");
const exercises = loadData(
  "src/data/exercisesMLBreadth.ts",
  "mlBreadthExercises",
);
const figures = loadData("src/data/mlBreadthFigures.ts", "mlBreadthFigures");
const expectedIds = [
  "linear-regression-ols",
  "naive-bayes",
  "decision-tree-splits",
  "boosting-families",
  "dbscan-density",
  "manifold-embeddings",
  "anomaly-detection",
  "probabilistic-graphical-models",
  "hidden-markov-models",
  "kalman-filtering",
  "causal-graphs-identifiability",
  "learning-paradigms",
];
assert.equal(lessons.length, 12);
assert.deepEqual(
  Array.from(lessons, (l) => l.id),
  expectedIds,
);
assert.deepEqual(Object.keys(exercises), expectedIds);
assert.deepEqual(Object.keys(figures), expectedIds);
const exerciseIds = new Set();
for (const lesson of lessons) {
  for (const [field, min] of Object.entries({
    mechanicsSteps: 6,
    howToUse: 4,
    whenToUse: 3,
    limits: 3,
    tuning: 3,
    settings: 3,
    modifications: 3,
    pitfalls: 3,
  })) {
    assert.ok(lesson[field].length >= min, `${lesson.id}: ${field}`);
  }
  for (const field of [
    "title",
    "englishTitle",
    "summary",
    "intuition",
    "core",
    "equation",
    "example",
  ])
    assert.ok(
      typeof lesson[field] === "string" && lesson[field].length > 10,
      `${lesson.id}: ${field}`,
    );
  assert.ok(lesson.source.url.startsWith("https://"));
  assert.equal(exercises[lesson.id].length, 2);
  assert.equal(new Set(exercises[lesson.id].map((e) => e.kind)).size, 2);
  for (const e of exercises[lesson.id]) {
    assert.ok(!exerciseIds.has(e.id), `Duplicate exercise ${e.id}`);
    exerciseIds.add(e.id);
    assert.ok(
      Number.isInteger(e.answer) &&
        e.answer >= 0 &&
        e.answer < e.options.length,
    );
    assert.ok(e.explanation.length > 50);
  }
  const f = figures[lesson.id];
  assert.equal(f.nodes.length, 3);
  assert.equal(f.edges.length, 2);
  for (const n of f.nodes)
    assert.ok([...n.detail].length <= 50, `${lesson.id}: figure detail length`);
  assert.ok(
    f.caption.includes("Synthetic") ||
      f.caption.includes("synthetic") ||
      f.caption.includes("Classic"),
    `${lesson.id}: example boundary`,
  );
}
let checks = 0;
const near = (actual, expected, tolerance = 1e-6) => {
  assert.ok(
    Number.isFinite(actual) && Math.abs(actual - expected) < tolerance,
    `${actual} ≠ ${expected}`,
  );
  checks++;
};
const sum = (xs) => xs.reduce((a, b) => a + b, 0);
const normalize = (xs) => xs.map((v) => v / sum(xs));
const mean = (xs) => sum(xs) / xs.length;

// OLS: calculate the least-squares line from raw points, then check normal equations.
const x = [0, 1, 2],
  y = [1, 2, 2];
const slope =
  sum(x.map((v, i) => (v - mean(x)) * (y[i] - mean(y)))) /
  sum(x.map((v) => (v - mean(x)) ** 2));
const intercept = mean(y) - slope * mean(x);
const residual = y.map((v, i) => v - (intercept + slope * x[i]));
near(slope, 0.5);
near(intercept, 7 / 6);
near(sum(residual.map((v) => v * v)), 1 / 6);
near(mean(residual.map((v) => v * v)), 1 / 18);
near(sum(residual), 0);
near(sum(residual.map((v, i) => v * x[i])), 0);
near(intercept + slope * 4, 19 / 6);

// Bayes normalization and additive smoothing are distinct operations.
const nb = normalize([0.2 * 0.8 * 0.6, 0.8 * 0.1 * 0.2]);
near(nb[0], 6 / 7);
near((0 + 1) / (6 + 1 * 3), 1 / 9);
const gini = (ys) =>
  1 -
  sum(
    [...new Set(ys)].map(
      (c) => (ys.filter((v) => v === c).length / ys.length) ** 2,
    ),
  );
const tx = [1, 2, 3, 4],
  ty = [0, 0, 1, 1];
const splitGain = (cut) => {
  const left = ty.filter((_, i) => tx[i] <= cut),
    right = ty.filter((_, i) => tx[i] > cut);
  return (
    gini(ty) -
    (left.length / ty.length) * gini(left) -
    (right.length / ty.length) * gini(right)
  );
};
near(gini(ty), 0.5);
near(splitGain(1.5), 1 / 6);
near(splitGain(2.5), 0.5);

// Binary AdaBoost, using labels and predictions to derive epsilon and new weights.
const targets = [1, 1, -1, -1],
  preds = [1, 1, 1, -1],
  w = [0.25, 0.25, 0.25, 0.25];
const epsilon = sum(w.map((v, i) => (targets[i] !== preds[i] ? v : 0)));
const alpha = 0.5 * Math.log((1 - epsilon) / epsilon);
const nextW = normalize(
  w.map((v, i) => v * Math.exp(-alpha * targets[i] * preds[i])),
);
near(epsilon, 0.25);
near(alpha, 0.549306);
nextW.forEach((v, i) => near(v, i === 2 ? 0.5 : 1 / 6));

// Density roles from independently counted inclusive epsilon neighborhoods.
const points = [0, 0.1, 0.2, 0.3, 0.4, 2];
const counts = points.map(
  (p) => points.filter((q) => Math.abs(p - q) <= 0.11).length,
);
assert.deepEqual(counts, [2, 3, 3, 3, 2, 1]);
const core = points.filter((_, i) => counts[i] >= 3);
assert.deepEqual(core, [0.1, 0.2, 0.3]);
const border = points.filter(
  (p, i) => counts[i] < 3 && core.some((q) => Math.abs(p - q) <= 0.11),
);
assert.deepEqual(border, [0, 0.4]);
assert.equal(
  points.filter((p) => !core.includes(p) && !border.includes(p))[0],
  2,
);
assert.ok(
  points.every((p) => points.filter((q) => Math.abs(p - q) <= 0.05).length < 3),
);
const entropy = (p) => -sum(p.map((v) => (v === 0 ? 0 : v * Math.log(v))));
near(Math.exp(entropy([0.5, 0.5])), 2);
near(Math.exp(entropy([0.9, 0.1])), 1.384145);
near(
  ["B", "C", "D"].filter((v) => ["B", "E", "F"].includes(v)).length / 3,
  1 / 3,
);
const tp = 1000 * 0.01 * 0.8,
  fp = 1000 * 0.99 * 0.05;
near(tp, 8);
near(fp, 49.5);
near(tp / (tp + fp), 0.1391304348);
const joint = [0.2 * 0.9, 0.8 * 0.1];
near(sum(joint), 0.26);
near(normalize(joint)[0], 9 / 13);

// Forward recurrence versus explicit path enumeration must agree on likelihood.
const pi = [0.6, 0.4],
  transition = [
    [0.7, 0.3],
    [0.2, 0.8],
  ],
  emissions = [
    [0.5, 0.5],
    [0.1, 0.9],
  ];
const first = pi.map((v, i) => v * emissions[i][0]);
const second = first.map(
  (_, j) => sum(first.map((v, i) => v * transition[i][j])) * emissions[j][1],
);
near(first[0], 0.3);
near(first[1], 0.04);
near(first[0] / sum(first), 15 / 17);
near(second[0], 0.109);
near(second[1], 0.1098);
near(sum(second), 0.2188);
const paths = [0, 1].flatMap((i) =>
  [0, 1].map((j) => ({
    states: [i, j],
    weight: pi[i] * emissions[i][0] * transition[i][j] * emissions[j][1],
  })),
);
paths.forEach((p, i) => near(p.weight, [0.105, 0.081, 0.004, 0.0288][i]));
near(sum(paths.map((p) => p.weight)), sum(second));
assert.deepEqual(
  paths.toSorted((a, b) => b.weight - a.weight)[0].states,
  [0, 0],
);
assert.ok(second[1] > second[0]);

// Kalman covariance update is also checked against the scalar Joseph form.
const priorMean = 10,
  predictedVariance = 4 + 1,
  observation = 12;
for (const [R, expectedMean, expectedVariance] of [
  [4, 100 / 9, 20 / 9],
  [20, 10.4, 4],
]) {
  const K = predictedVariance / (predictedVariance + R);
  near(priorMean + K * (observation - priorMean), expectedMean);
  const P = (1 - K) * predictedVariance;
  near(P, expectedVariance);
  near((1 - K) ** 2 * predictedVariance + K ** 2 * R, P);
}

// Enumerate SCM samples, then replace only A's equation for each intervention.
const scm = [0, 1].map((u) => ({ u, a: u, y: u, p: 0.5 }));
const observedMean = (a) =>
  sum(scm.filter((s) => s.a === a).map((s) => s.p * s.y)) /
  sum(scm.filter((s) => s.a === a).map((s) => s.p));
const interventionMean = (a) =>
  sum(scm.map((s) => ({ ...s, a })).map((s) => s.p * s.y));
near(observedMean(1) - observedMean(0), 1);
near(interventionMean(1), 0.5);
near(interventionMean(0), 0.5);
const collider = [0, 1].flatMap((a) =>
  [0, 1].map((b) => ({ a, b, c: Number(Boolean(a || b)) })),
);
for (const [a, expected] of [
  [0, 1],
  [1, 0.5],
]) {
  const selected = collider.filter((s) => s.a === a && s.c === 1);
  near(mean(selected.map((s) => s.b)), expected);
}
near(mean([2, 4].map((v, i) => (v - [1, 3][i]) ** 2)), 1);
near(-Math.log(0.25), Math.log(4));
near(0.4 + 0.5 * 0.8, 0.8);
near(sum([0, 1].map((r, t) => 0.9 ** t * r)), 0.9);

// Bind computed teaching fixtures to the visible material to prevent silent fixture drift.
const anchors = {
  "linear-regression-ols": ["1/6", "1/18"],
  "naive-bayes": ["6/7", ".096"],
  "decision-tree-splits": ["1/6", "1/3"],
  "boosting-families": ["1/6", ".5"],
  "dbscan-density": ["2,3,3,3,2,1", ".11"],
  "manifold-embeddings": ["1.384", "Perplexity"],
  "anomaly-detection": ["49.5", "13.9"],
  "probabilistic-graphical-models": ["9/13", ".26"],
  "hidden-markov-models": [".1098", "AA"],
  "kalman-filtering": ["100/9", "20/9"],
  "causal-graphs-identifiability": [".5", "positivity"],
  "learning-paradigms": [".8", ".9"],
};
for (const lesson of lessons) {
  const material = JSON.stringify([
    lesson,
    exercises[lesson.id],
    figures[lesson.id],
  ]);
  for (const text of anchors[lesson.id])
    assert.ok(material.includes(text), `${lesson.id}: missing fixture ${text}`);
}
console.log(
  `Validated ML breadth: 12 detailed lessons, 24 exercises, 12 diagrams and ${checks} independent numerical checks including OLS, AdaBoost, HMM path oracle, Kalman covariance and causal interventions.`,
);
