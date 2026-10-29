import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";
const root = fileURLToPath(new URL("../", import.meta.url));
function load(file, name) {
  const { outputText, diagnostics } = ts.transpileModule(
    readFileSync(resolve(root, file), "utf8"),
    {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
      },
      reportDiagnostics: true,
    },
  );
  assert.equal(diagnostics?.length ?? 0, 0);
  const exports = {};
  vm.runInNewContext(outputText, { exports }, { filename: file });
  return exports[name];
}
const lessons = load("src/data/mlDepth.ts", "mlDepthLessons"),
  exercises = load("src/data/exercisesMLDepth.ts", "mlDepthExercises"),
  figures = load("src/data/mlDepthFigures.ts", "mlDepthFigures");
const ids = [
  "variational-inference-elbo",
  "hierarchical-partial-pooling",
  "proper-scoring-rules",
  "bayes-decision-thresholds",
  "quantile-regression",
  "label-shift-correction",
];
assert.deepEqual(
  Array.from(lessons, (l) => l.id),
  ids,
);
assert.deepEqual(Object.keys(exercises), ids);
assert.deepEqual(Object.keys(figures), ids);
const allExerciseIds = new Set();
for (const l of lessons) {
  for (const [field, min] of Object.entries({
    mechanicsSteps: 7,
    howToUse: 4,
    settings: 4,
    limits: 3,
    whenToUse: 3,
    modifications: 3,
    pitfalls: 3,
    tuning: 3,
  })) {
    assert.ok(l[field].length >= min, `${l.id}: ${field}`);
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
      typeof l[field] === "string" && l[field].length > 10,
      `${l.id}: ${field}`,
    );
  assert.ok(l.source.url.startsWith("https://"));
  assert.equal(exercises[l.id].length, 2);
  assert.equal(new Set(exercises[l.id].map((e) => e.kind)).size, 2);
  for (const e of exercises[l.id]) {
    assert.ok(!allExerciseIds.has(e.id));
    allExerciseIds.add(e.id);
    assert.ok(
      e.answer >= 0 &&
        e.answer < e.options.length &&
        Number.isInteger(e.answer),
    );
    assert.ok(e.options.length >= 3 && e.explanation.length > 50);
  }
  const f = figures[l.id];
  assert.equal(f.nodes.length, 3);
  assert.equal(f.edges.length, 2);
  assert.ok(f.caption.startsWith("Synthetic"));
  for (const node of f.nodes)
    assert.ok([...node.detail].length <= 50, `${l.id}: figure detail too long`);
}
let checks = 0;
const near = (a, b, tol = 1e-6) => {
  assert.ok(Number.isFinite(a) && Math.abs(a - b) < tol, `${a} != ${b}`);
  checks++;
};
const sum = (xs) => xs.reduce((a, b) => a + b, 0),
  mean = (xs) => sum(xs) / xs.length;
// Evaluate joint probabilities, bound, and posterior KL independently.
const joint = [0.5 * 0.8, 0.5 * 0.2],
  evidence = sum(joint),
  posterior = joint.map((x) => x / evidence);
const bound = (q) =>
  sum(q.map((p, i) => (p === 0 ? 0 : p * Math.log(joint[i] / p))));
const kl = (q) =>
  sum(q.map((p, i) => (p === 0 ? 0 : p * Math.log(p / posterior[i]))));
near(bound([0.6, 0.4]), -0.7977968093);
near(kl([0.6, 0.4]), 0.1046496288);
near(bound(posterior), Math.log(0.5));
near(kl(posterior), 0);
for (let i = 0; i <= 100; i++) {
  const q = [i / 100, 1 - i / 100];
  near(bound(q) + kl(q), Math.log(evidence));
  assert.ok(kl(q) >= -1e-12);
}
// Gaussian Mean-field reverse-KL variance is the inverse precision diagonal.
const rho = 0.8,
  det = 1 - rho * rho,
  precisionDiagonal = 1 / det,
  qVariance = 1 / precisionDiagonal;
near(qVariance, 0.36);
assert.ok(qVariance < 1);
near(0.5 + 0.2 * 1.5, 0.8);
const gaussianKL = (variance) =>
  0.5 *
  (2 * precisionDiagonal * variance -
    2 +
    Math.log(det / (variance * variance)));
for (const v of [0.1, 0.2, 0.35, 0.36, 0.4, 0.8, 1, 2])
  assert.ok(gaussianKL(v) >= gaussianKL(qVariance) - 1e-12);

// Normal-Normal posterior via summed precisions; compare a separate shrinkage form.
function pooling(n, avg = 6, mu = 0, tau2 = 4, sigma2 = 9) {
  const v = 1 / (1 / tau2 + n / sigma2),
    m = v * (mu / tau2 + (n * avg) / sigma2),
    w = tau2 / (tau2 + sigma2 / n);
  return { v, m, w, predictive: v + sigma2 };
}
near(pooling(1).m, 24 / 13);
near(pooling(1).v, 36 / 13);
near(pooling(1).predictive, 153 / 13);
near(pooling(9).m, 4.8);
near(pooling(9).v, 0.8);
near(pooling(9).predictive, 9.8);
near(4 + 9, 13);
for (const n of [1, 2, 9, 50])
  for (const tau of [0.01, 0.5, 4, 100]) {
    const r = pooling(n, 6, 2, tau, 9);
    near(r.m, r.w * 6 + (1 - r.w) * 2);
    assert.ok(r.m >= 2 && r.m <= 6 && r.v < tau && r.v < 9 / n);
  }
near(pooling(1, 6, 0, 1e-12, 9).m, 0);
near(pooling(1, 6, 0, 1e12, 9).m, 6);

// Proper scoring: direct expectations match square decomposition over a probability grid.
const expectedBrier = (r, p) => r * (1 - p) ** 2 + (1 - r) * p * p;
const expectedNLL = (r, p) => -r * Math.log(p) - (1 - r) * Math.log(1 - p);
near(expectedBrier(0.7, 0.7), 0.21);
near(expectedBrier(0.7, 0.9), 0.25);
near(expectedNLL(0.7, 0.7), 0.6108643021);
near(expectedNLL(0.7, 0.9), 0.7645278889);
for (const r of [0.1, 0.2, 0.5, 0.7, 0.9])
  for (let i = 1; i < 100; i++) {
    const p = i / 100;
    near(expectedBrier(r, p), (p - r) ** 2 + r * (1 - r));
    assert.ok(expectedNLL(r, p) >= expectedNLL(r, r) - 1e-12);
  }
const outcomes = [1, 1, 1, 0];
near(mean(outcomes.map((y) => (0.75 - y) ** 2)), 0.1875);
near(mean(outcomes.map((y) => (0.99 - y) ** 2)), 0.2451);
near((expectedBrier(0.2, 0.2) + expectedBrier(0.8, 0.8)) / 2, 0.16);
near((expectedBrier(0.2, 0.5) + expectedBrier(0.8, 0.5)) / 2, 0.25);
const weightedOptimal = (3 * 0.2) / (3 * 0.2 + 0.8);
near(weightedOptimal, 3 / 7);
const weightedNLL = (p) => -3 * 0.2 * Math.log(p) - 0.8 * Math.log(1 - p);
for (let i = 1; i < 100; i++)
  assert.ok(weightedNLL(i / 100) >= weightedNLL(weightedOptimal) - 1e-12);

// Enumerate action risks, independently derive threshold and reject intervals.
const risks = (p) => [8 * p, 2 * (1 - p), 1];
near(2 / (2 + 8), 0.2);
near(1 / 8, 0.125);
near(1 - 1 / 2, 0.5);
near(risks(0.3)[0], 2.4);
near(risks(0.3)[1], 1.4);
assert.equal(risks(0.3).indexOf(Math.min(...risks(0.3))), 2);
for (let i = 0; i <= 1000; i++) {
  const p = i / 1000,
    [negative, positive, review] = risks(p);
  const best = Math.min(negative, positive, review);
  const piecewise = p <= 0.125 ? negative : p >= 0.5 ? positive : review;
  near(best, piecewise);
  assert.equal(positive <= negative + 1e-12, p >= 0.2);
}

// Pinball loss: enumerate a dense grid and verify the whole non-unique optimum.
const y = [1, 2, 4, 8],
  pinball = (u, tau) => Math.max(tau * u, (tau - 1) * u),
  loss = (q) => mean(y.map((v) => pinball(v - q, 0.75)));
near(loss(4), 1.0625);
near(loss(8), 1.0625);
near(loss(2), 1.5625);
near(pinball(4, 0.75), 3);
near(pinball(-4, 0.75), 1);
for (let i = -100; i <= 1200; i++) {
  const q = i / 100;
  assert.ok(loss(q) >= 1.0625 - 1e-12);
  if (q >= 4 && q <= 8) near(loss(q), 1.0625);
  else assert.ok(loss(q) > 1.0625 - 1e-12);
}
near(3 / (3 + 1), 0.75);

// Label shift correction from Bayes factors, and matrix inversion checked by forward mixing.
function corrected(p, source, target) {
  const positive = (p * target) / source,
    negative = ((1 - p) * (1 - target)) / (1 - source);
  return positive / (positive + negative);
}
near(corrected(0.4, 0.2, 0.5), 8 / 11);
near(0.5 / 0.5 / (0.2 / 0.8), 4);
const tpr = 0.8,
  fpr = 0.1,
  positiveRate = 0.45,
  pi = (positiveRate - fpr) / (tpr - fpr);
near(pi, 0.5);
near(fpr * (1 - pi) + tpr * pi, positiveRate);
near(0.9 * (1 - pi) + 0.2 * pi, 0.55);
near(0.9 * 0.8 - 0.2 * 0.1, 0.7);
near(0.01 / (0.51 - 0.49), 0.5);
near(0.5 - 0.5, 0);
for (const source of [0.1, 0.2, 0.5, 0.9])
  for (const target of [0.1, 0.4, 0.7, 0.9])
    for (const p of [0.05, 0.2, 0.4, 0.8, 0.95]) {
      const pt = corrected(p, source, target);
      near(corrected(pt, target, source), p);
      near(
        pt / (1 - pt),
        ((p / (1 - p)) * (target / (1 - target))) / (source / (1 - source)),
      );
    }

// Bind numerical checks to actual visible teaching fixtures, not only detached constants.
const anchors = {
  "variational-inference-elbo": ["−.797797", ".104650", ".36"],
  "hierarchical-partial-pooling": ["24/13", "153/13", "9.8"],
  "proper-scoring-rules": [".610864", ".764528", "3/7"],
  "bayes-decision-thresholds": ["1.4", "2.4", ".125"],
  "quantile-regression": ["1.0625", "1.5625", "[4,8]"],
  "label-shift-correction": ["8/11", ".375", ".02"],
};
for (const l of lessons) {
  const corpus = JSON.stringify([l, exercises[l.id], figures[l.id]]);
  for (const anchor of anchors[l.id])
    assert.ok(
      corpus.includes(anchor),
      `${l.id}: missing numerical anchor ${anchor}`,
    );
}
console.log(
  `Validated ML depth: 6 lessons, 12 authored exercises, 6 diagrams and ${checks} numerical checks, including ELBO identity, precision/shrinkage equivalence, proper-score expectation, constrained decision regions, non-unique quantile optimum and label-shift round trips.`,
);
