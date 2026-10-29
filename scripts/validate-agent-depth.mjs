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
  return JSON.parse(JSON.stringify(exports[exportName]));
}
const lessons = loadData("src/data/agentDepth.ts", "agentDepthLessons");
const quizzes = loadData(
  "src/data/exercisesAgentDepth.ts",
  "agentDepthExercises",
);
const figures = loadData("src/data/agentDepthFigures.ts", "agentDepthFigures");
const ids = [
  "mcts-uct-search",
  "contextual-bandits-linucb",
  "beam-search-decoding",
  "grammar-constrained-decoding",
  "speculative-decoding",
  "agent-state-checkpoints",
];
assert.deepEqual(
  lessons.map((lesson) => lesson.id),
  ids,
);
assert.deepEqual(Object.keys(quizzes).sort(), [...ids].sort());
assert.deepEqual(Object.keys(figures).sort(), [...ids].sort());
const exerciseIds = new Set();
for (const lesson of lessons) {
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
      typeof lesson[field] === "string" && lesson[field].trim(),
      `${lesson.id}: ${field}`,
    );
  assert.equal(new URL(lesson.source.url).protocol, "https:");
  for (const [field, minimum] of Object.entries({
    mechanicsSteps: 7,
    howToUse: 4,
    settings: 4,
    limits: 3,
    whenToUse: 3,
    tuning: 3,
    modifications: 3,
    pitfalls: 3,
    compareTo: 3,
  }))
    assert.ok(lesson[field].length >= minimum, `${lesson.id}: ${field}`);
  for (const setting of lesson.settings)
    for (const field of ["name", "start", "adjust"])
      assert.ok(setting[field]?.trim(), `${lesson.id}: setting ${field}`);
  assert.ok(
    lesson.mechanicsSteps.filter((step) => /\d/.test(step)).length >= 3,
    `${lesson.id}: intermediate trace`,
  );
  assert.equal(quizzes[lesson.id].length, 2);
  assert.deepEqual(quizzes[lesson.id].map((quiz) => quiz.kind).sort(), [
    "decision",
    "mechanism",
  ]);
  for (const quiz of quizzes[lesson.id]) {
    assert.ok(!exerciseIds.has(quiz.id));
    exerciseIds.add(quiz.id);
    assert.ok(quiz.id.startsWith(`${lesson.id}-`));
    assert.equal(quiz.options.length, 4);
    assert.equal(new Set(quiz.options).size, 4);
    assert.ok(
      Number.isInteger(quiz.answer) && quiz.answer >= 0 && quiz.answer < 4,
    );
    assert.ok(quiz.question.length > 30 && quiz.explanation.length > 45);
  }
  const figure = figures[lesson.id];
  assert.equal(figure.nodes.length, 3);
  assert.equal(figure.edges.length, 2);
  assert.ok(figure.question && figure.caption.startsWith("Synthetic"));
  for (const node of figure.nodes)
    assert.ok(
      node.title && [...node.detail].length <= 50,
      `${lesson.id}: figure detail`,
    );
  assert.ok(figure.nodes.some((node) => /\d/.test(node.detail)));
}
assert.equal(exerciseIds.size, 12);
let arithmeticChecks = 0;
const near = (actual, expected, tolerance = 1e-9) => {
  assert.ok(
    Number.isFinite(actual) && Math.abs(actual - expected) < tolerance,
    `${actual} != ${expected}`,
  );
  arithmeticChecks++;
};
const sum = (values) => values.reduce((total, value) => total + value, 0);
const normalized = (values) => {
  const mass = sum(values);
  assert.ok(mass > 0);
  return values.map((value) => value / mass);
};

// UCT allocates simulation; only the sampled return enters the backup statistics.
const rootCount = 10;
const branches = [
  { name: "A", n: 8, w: 4.8 },
  { name: "B", n: 2, w: 0.8 },
];
const uct = (branch, parent, c) =>
  branch.n === 0
    ? Infinity
    : branch.w / branch.n + c * Math.sqrt(Math.log(parent) / branch.n);
near(uct(branches[0], rootCount, 1), 1.1364915065723369);
near(uct(branches[1], rootCount, 1), 1.4729830131446737);
assert.equal(
  [...branches].sort((a, b) => uct(b, rootCount, 1) - uct(a, rootCount, 1))[0]
    .name,
  "B",
);
assert.equal(
  [...branches].sort((a, b) => uct(b, rootCount, 0) - uct(a, rootCount, 0))[0]
    .name,
  "A",
);
assert.equal(uct({ n: 0, w: 0 }, 10, 1), Infinity);
branches[1].n++;
branches[1].w += 0.9;
near(branches[1].w, 1.7);
near(branches[1].w / branches[1].n, 0.5666666666666667);
assert.equal(sum(branches.map((branch) => branch.n)), 11);
assert.equal([...branches].sort((a, b) => b.n - a.n)[0].name, "A");
let value = 0.8;
for (const reward of [0.2, 0.4].reverse()) value = reward + 0.5 * value;
near(value, 0.6);

// Independent two-dimensional linear algebra checks the LinUCB updates.
const dot = (a, b) => sum(a.map((value, i) => value * b[i]));
const solve2 = (matrix, b) => {
  const [[a, c], [d, e]] = matrix,
    determinant = a * e - c * d;
  assert.ok(determinant > 0);
  return [
    (e * b[0] - c * b[1]) / determinant,
    (-d * b[0] + a * b[1]) / determinant,
  ];
};
function update(model, x, reward) {
  return {
    a: model.a.map((row, i) => row.map((value, j) => value + x[i] * x[j])),
    b: model.b.map((value, i) => value + reward * x[i]),
  };
}
const initial = {
  a: [
    [1, 0],
    [0, 1],
  ],
  b: [0, 0],
};
const familiar = [1, 1, 0].reduce(
  (model, reward) => update(model, [1, 0], reward),
  initial,
);
assert.deepEqual(familiar, {
  a: [
    [4, 0],
    [0, 1],
  ],
  b: [2, 0],
});
const score = (model, x, alpha) =>
  dot(x, solve2(model.a, model.b)) +
  alpha * Math.sqrt(dot(x, solve2(model.a, x)));
near(score(familiar, [1, 0], 1.2), 1.1);
near(score(initial, [1, 0], 1.2), 1.2);
near(score(familiar, [1, 0], 0.6), 0.8);
near(score(initial, [1, 0], 0.6), 0.6);
const updated = update(initial, [1, 0], 1);
assert.deepEqual(updated, {
  a: [
    [2, 0],
    [0, 1],
  ],
  b: [1, 0],
});
near(score(updated, [1, 0], 1.2), 1.348528137423857);
near(score(updated, [0, 1], 1.2), 1.2);
near(score(familiar, [0, 1], 1.2), 1.2);
near(1 - 0.1 + 0.1 / 2, 0.95);
near(0.1 / 2, 0.05);

// Enumerated finite sequence tree supplies an oracle independent of UI beam code.
const transitions = {
  "": [
    ["A", 0.6],
    ["B", 0.4],
  ],
  A: [
    ["x", 0.51],
    ["y", 0.49],
  ],
  B: [
    ["x", 0.1],
    ["y", 0.9],
  ],
};
for (const distribution of Object.values(transitions))
  near(sum(distribution.map(([, probability]) => probability)), 1);
function beam(width) {
  let active = [{ prefix: "", probability: 1 }];
  for (let step = 0; step < 2; step++)
    active = active
      .flatMap(({ prefix, probability }) =>
        transitions[prefix].map(([token, p]) => ({
          prefix: prefix + token,
          probability: probability * p,
        })),
      )
      .sort((a, b) => b.probability - a.probability)
      .slice(0, width);
  return active;
}
assert.equal(beam(1)[0].prefix, "Ax");
near(beam(1)[0].probability, 0.306);
assert.equal(beam(2)[0].prefix, "By");
near(beam(2)[0].probability, 0.36);
near(Math.log(0.306), -1.1841701770297563);
near(Math.log(0.36), -1.0216512475319814);
assert.ok(Math.log(0.3) > Math.log(0.24));
assert.ok(Math.log(0.3) / 2 < Math.log(0.24) / 4);
near(Math.log(0.3) / 2, -0.6019864021629681);
near(Math.log(0.24) / 4, -0.35677908891003645);

const masked = normalized([0.1, 0.2, 0, 0]);
near(masked[0], 1 / 3);
near(masked[1], 2 / 3);
near(masked[2], 0);
near(masked[3], 0);
near(masked[1] ** 2, 4 / 9);
const allBinaryStrings = ["00", "01", "10", "11"];
near(
  sum(
    allBinaryStrings.map((text) =>
      [...text].reduce((p, token) => p * masked[Number(token)], 1),
    ),
  ),
  1,
);
assert.equal(/^[01]{2}$/.test("1"), false);
assert.equal(/^[01]{2}$/.test("11"), true);
const conditionalValid = normalized([0.5 * 0.9, 0.5 * 0.1]);
near(conditionalValid[0], 0.9);
near(conditionalValid[1], 0.1);
assert.notEqual(conditionalValid[0], 0.5);
assert.throws(() => normalized([0, 0, 0]));

// Acceptance + residual accounting, including the wrong-fallback counterexample.
const target = [0.5, 0.3, 0.2],
  proposal = [0.2, 0.5, 0.3];
const acceptance = target.map((p, i) => Math.min(1, p / proposal[i]));
const accepted = proposal.map((q, i) => q * acceptance[i]);
const rejectedMass = 1 - sum(accepted);
const residual = normalized(target.map((p, i) => Math.max(0, p - proposal[i])));
near(sum(accepted), 0.7);
near(rejectedMass, 0.3);
assert.deepEqual(residual, [1, 0, 0]);
for (let i = 0; i < target.length; i++)
  near(accepted[i] + rejectedMass * residual[i], target[i]);
const wrongFallback = accepted.map((p, i) => p + rejectedMass * target[i]);
for (const [i, value] of [0.35, 0.39, 0.26].entries())
  near(wrongFallback[i], value);
const tokensPerBlock = sum(Array.from({ length: 4 }, (_, i) => 0.7 ** i));
near(tokensPerBlock, 2.533);
near((tokensPerBlock * 10) / 13, 1.9484615384615385);
// If p=q, rejection probability is zero; do not normalize a zero residual.
near(sum(target.map((p, i) => Math.min(p, target[i]))), 1);

// A small effect ledger demonstrates specific recovery assumptions, not exactly-once in general.
const receipts = new Map();
function writeEffect(key, inputRevision) {
  if (!receipts.has(key))
    receipts.set(key, {
      artifact: `artifact-${receipts.size + 1}`,
      inputRevision,
    });
  return receipts.get(key);
}
const receipt = writeEffect("run7:write:v2", "v2");
assert.equal(receipts.size, 1);
assert.equal(receipts.get("run7:write:v2"), receipt);
assert.equal(writeEffect("run7:write:v2", "v2"), receipt);
assert.equal(receipts.size, 1);
assert.equal(receipt.inputRevision === "v3", false);
writeEffect("run7:write:new-random-key", "v2");
assert.equal(receipts.size, 2);
assert.equal(2 + 3 + 5 + 1 + 1, 12);
assert.equal(2 + 3 + 5 + 2 + 3 + 5 + 1, 21);
let revision = 7;
function commit(expected) {
  if (revision !== expected) return false;
  revision++;
  return true;
}
assert.equal(commit(7), true);
assert.equal(revision, 8);
assert.equal(commit(7), false);
assert.equal(revision, 8);

console.log(
  `Validated 6 Agent/LM depth lessons, 12 authored exercises, 6 mechanism figures and ${arithmeticChecks} independent numerical checks plus crash-state fixtures.`,
);
