import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";
import ts from "typescript";

const root = resolve(import.meta.dirname, "..");
function loadData(file, name) {
  const source = readFileSync(resolve(root, "src/data", file), "utf8");
  const result = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const context = { exports: {} };
  vm.runInNewContext(result.outputText, context);
  return context.exports[name];
}

const lessons = loadData(
  "bioGraphRepresentation.ts",
  "bioGraphRepresentationLessons",
);
const exercises = loadData(
  "exercisesBioGraphRepresentation.ts",
  "bioGraphRepresentationExercises",
);
const figures = loadData("bioGraphFigures.ts", "bioGraphFigures");
assert.equal(lessons.length, 6);
const allData = readdirSync(resolve(root, "src/data"))
  .filter((file) => file.endsWith(".ts"))
  .map((file) => readFileSync(resolve(root, "src/data", file), "utf8"))
  .join("\n");
const knownIds = new Set(
  [...allData.matchAll(/id:\s*"([^"]+)"/g)].map((match) => match[1]),
);
for (const lesson of lessons) {
  assert.ok(lesson.mechanicsSteps.length >= 6, lesson.id);
  assert.ok(lesson.howToUse.length >= 4, lesson.id);
  for (const key of ["limits", "tuning", "settings"])
    assert.ok(lesson[key].length >= 3, `${lesson.id}.${key}`);
  for (const id of lesson.compareTo)
    assert.ok(knownIds.has(id), `${lesson.id}: unknown related ${id}`);
  assert.match(lesson.source.url, /^https:\/\//);
  assert.equal(exercises[lesson.id].length, 2);
  assert.deepEqual(
    new Set(exercises[lesson.id].map((item) => item.kind)),
    new Set(["mechanism", "decision"]),
  );
  for (const exercise of exercises[lesson.id]) {
    assert.equal(exercise.options.length, 4);
    assert.ok(
      exercise.answer >= 0 && exercise.answer < exercise.options.length,
    );
    assert.ok(exercise.explanation.length > 30);
  }
  assert.equal(figures[lesson.id].nodes.length, 3);
  assert.equal(figures[lesson.id].edges.length, 2);
  for (const node of figures[lesson.id].nodes) {
    assert.ok(
      Array.from(node.detail).length <= 45,
      `${lesson.id}: figure detail too long`,
    );
  }
}

// These independent numeric fixtures check the teaching claims, not trained-model outcomes.
const near = (actual, expected, label) =>
  assert.ok(
    Math.abs(actual - expected) < 1e-10,
    `${label}: ${actual} != ${expected}`,
  );
function symmetricPropagation(adjacency, x) {
  const withSelf = adjacency.map((row, i) =>
    row.map((value, j) => value + Number(i === j)),
  );
  const degree = withSelf.map((row) => row.reduce((a, b) => a + b, 0));
  return withSelf.map((row, i) =>
    row.reduce(
      (sum, edge, j) => sum + (edge * x[j]) / Math.sqrt(degree[i] * degree[j]),
      0,
    ),
  );
}
const pair = [
  [0, 1],
  [1, 0],
];
let boundary = [0, 10];
const mixed = symmetricPropagation(pair, boundary);
near(mixed[0], 5, "GCN boundary first");
near(mixed[1], 5, "GCN boundary second");
for (let step = 0; step < 3; step += 1) {
  const propagated = symmetricPropagation(pair, boundary);
  boundary = boundary.map((value, i) => 0.8 * value + 0.2 * propagated[i]);
}
near(boundary[1] - boundary[0], 5.12, "Residual contrast after three steps");
const constantPath = symmetricPropagation(
  [
    [0, 1, 0],
    [1, 0, 1],
    [0, 1, 0],
  ],
  [1, 1, 1],
);
near(constantPath[0], 0.5 + 1 / Math.sqrt(6), "Irregular degree endpoint");
near(constantPath[1], 1 / 3 + 2 / Math.sqrt(6), "Irregular degree center");

function softmax(logits, temperature) {
  const shift = Math.max(...logits);
  const numerators = logits.map((value) =>
    Math.exp((value - shift) / temperature),
  );
  const denominator = numerators.reduce((a, b) => a + b, 0);
  return numerators.map((value) => value / denominator);
}
const messageSum = (weights, messages) =>
  weights.reduce((sum, weight, i) => sum + weight * messages[i], 0);
near(
  messageSum(softmax([Math.log(2), 0, 0], 1), [1, 4, 0]),
  1.5,
  "GAT weighted message",
);
near(
  messageSum(softmax([Math.log(2), 0, 0], 2), [1, 4, 0]),
  3 - Math.SQRT2,
  "GAT temperature two",
);
near(
  messageSum(softmax([Math.log(2), 0, 0, 0], 1), [1, 4, 0, 4]),
  2,
  "GAT added neighbor",
);

const population = [0, 0, 10, 10];
const means = [];
for (let i = 0; i < population.length; i += 1) {
  for (let j = i + 1; j < population.length; j += 1)
    means.push((population[i] + population[j]) / 2);
}
near(
  means.reduce((a, b) => a + b, 0) / means.length,
  5,
  "GraphSAGE sample expectation",
);
near(
  means.reduce((sum, value) => sum + (value - 5) ** 2, 0) / means.length,
  25 / 3,
  "GraphSAGE sampling variance",
);
near(
  means.reduce((sum, value) => sum + Math.max(0, value - 6), 0) / means.length,
  2 / 3,
  "Nonlinear sampling bias",
);
let missRare = 1;
for (let draw = 0; draw < 5; draw += 1) missRare *= (19 - draw) / (20 - draw);
near(missRare, 0.75, "Rare neighbor miss probability");
assert.equal(256 * (1 + 8 + 8 * 4), 10496);

near(2 + 2 ** 2 / 4, 3, "NB variance low library");
near(4 + 4 ** 2 / 4, 8, "NB variance high library");
near((4 / (4 + 2)) ** 4, 16 / 81, "NB zero low library");
near((4 / (4 + 4)) ** 4, 1 / 16, "NB zero high library");
const posteriorMean = [1, 0];
const posteriorVariance = [1, 1];
const kl = posteriorMean.reduce(
  (sum, m, i) =>
    sum +
    (m ** 2 + posteriorVariance[i] - Math.log(posteriorVariance[i]) - 1) / 2,
  0,
);
near(kl, 0.5, "Diagonal Gaussian KL");
near(-12 - kl, -12.5, "ELBO");
near(
  -Math.log(softmax([Math.log(2), 0, 0], 1)[0]),
  Math.log(2),
  "InfoNCE initial",
);
near(
  -Math.log(softmax([Math.log(2), 0, 0, Math.log(2)], 1)[0]),
  Math.log(3),
  "InfoNCE false negative",
);
console.log(
  "Validated 6 biology graph/representation lessons, 12 exercises, 6 mechanism figures, and independent numeric fixtures.",
);
