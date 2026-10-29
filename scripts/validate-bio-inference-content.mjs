import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));
function loadData(file, exportName) {
  const source = readFileSync(resolve(root, file), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const exports = {};
  vm.runInNewContext(outputText, { exports }, { filename: file });
  return exports[exportName];
}
const lessons = loadData(
  "src/data/bioInferenceControl.ts",
  "bioInferenceControlLessons",
);
const quizzes = loadData(
  "src/data/exercisesBioInferenceControl.ts",
  "bioInferenceControlExercises",
);
const figures = loadData(
  "src/data/bioInferenceFigures.ts",
  "bioInferenceFigures",
);
assert.equal(lessons.length, 6);
for (const lesson of lessons) {
  for (const [field, minimum] of Object.entries({
    mechanicsSteps: 6,
    howToUse: 4,
    limits: 3,
    tuning: 3,
    settings: 3,
  })) {
    assert.ok(lesson[field].length >= minimum, `${lesson.id}: ${field}`);
  }
  assert.equal(quizzes[lesson.id]?.length, 2, `${lesson.id}: exercises`);
  assert.equal(
    new Set(quizzes[lesson.id].map((exercise) => exercise.kind)).size,
    2,
  );
  for (const exercise of quizzes[lesson.id]) {
    assert.ok(
      exercise.answer >= 0 && exercise.answer < exercise.options.length,
    );
  }
  const figure = figures[lesson.id];
  assert.equal(figure.nodes.length, 3);
  assert.equal(figure.edges.length, 2);
  for (const node of figure.nodes)
    assert.ok([...node.detail].length <= 45, `${lesson.id}: detail too long`);
}

const near = (actual, expected, tolerance = 1e-6) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} ≠ ${expected}`);
const sum = (xs) => xs.reduce((total, value) => total + value, 0);
const normalize = (xs) => xs.map((value) => value / sum(xs));

// Independently calculate the fixed-variance GMM example from Gaussian densities.
const x = [0, 2];
const means = [0, 2];
const density = (value, mean) =>
  Math.exp(-0.5 * (value - mean) ** 2) / Math.sqrt(2 * Math.PI);
const r = x.map((value) =>
  normalize(means.map((mean) => 0.5 * density(value, mean))),
);
const newMeans = means.map(
  (_, k) =>
    sum(x.map((value, i) => value * r[i][k])) / sum(r.map((row) => row[k])),
);
const likelihood = (mus) =>
  sum(
    x.map((value) =>
      Math.log(sum(mus.map((mean) => 0.5 * density(value, mean)))),
    ),
  );
near(r[0][0], 0.880797);
near(newMeans[0], 0.238406);
near(newMeans[1], 1.761594);
near(likelihood(means), -2.970315);
near(likelihood(newMeans), -2.886563);
near(likelihood([1, 1]), -2.837877);
assert.ok(likelihood(newMeans) > likelihood(means));

// Count evidence and ambient arithmetic are source-generation fixtures, not real data.
const poisson = (y, lambda) => {
  let factorial = 1;
  for (let i = 2; i <= y; i++) factorial *= i;
  return (Math.exp(-lambda) * lambda ** y) / factorial;
};
near(normalize([poisson(0, 1), poisson(0, 5)])[1], 0.017986);
near(normalize([poisson(2, 1), poisson(2, 5)])[1], 0.314078);
const profile = [0.9, 0.1].map((value, g) => 0.8 * value + 0.2 * [0.2, 0.8][g]);
near(profile[0] * 10, 7.6);
near(profile[1] * 10, 2.4);
near(10 * 0.2 * 0.8, 1.6);

// Enumerate the feasible configurations rather than deriving their marginals separately.
const local = [
  [0.6, 0.4],
  [0.9, 0.1],
];
const feasible = [
  [0, 1],
  [1, 0],
];
const joint = normalize(
  feasible.map((assignment) =>
    assignment.reduce((weight, k, i) => weight * local[i][k], 1),
  ),
);
near(joint[0], 1 / 7);
near(joint[1], 6 / 7);
const firstMarginalA = sum(
  feasible.map((assignment, i) => (assignment[0] === 0 ? joint[i] : 0)),
);
near(firstMarginalA, 1 / 7);

// Check return ordering, telescoping, and the deliberate missing-gamma counterexample.
const discounted = (rewards, gamma) =>
  sum(rewards.map((reward, t) => gamma ** t * reward));
assert.ok(discounted([0, 5], 0.9) > discounted([3], 0.9));
assert.ok(discounted([0, 5], 0.5) < discounted([3], 0.5));
const potentials = [2, 3, 0];
const baseRewards = [0, 5];
const shaped = baseRewards.map(
  (reward, t) => reward + 0.9 * potentials[t + 1] - potentials[t],
);
near(discounted(shaped, 0.9), 2.5);
near(discounted(shaped, 0.9), discounted(baseRewards, 0.9) - potentials[0]);
const wrongShaped = baseRewards.map(
  (reward, t) => reward + potentials[t + 1] - potentials[t],
);
near(discounted(wrongShaped, 0.9), 2.8);

// Policy importance weights are derived from both action probabilities.
const actions = [0, 1, 1, 1];
const behavior = [0.25, 0.75];
const target = [0.5, 0.5];
const weights = actions.map((action) => target[action] / behavior[action]);
const rewards = actions.map((action) => [4, 1][action]);
near(sum(rewards) / 4, 1.75);
near(sum(rewards.map((reward, i) => reward * weights[i])) / 4, 2.5);
near(sum(weights) ** 2 / sum(weights.map((weight) => weight ** 2)), 3);

console.log(
  "Bio inference content: 6 lessons, 12 exercises, 6 figures; independent EM/count/assignment/return/shaping/OPE arithmetic passed.",
);
