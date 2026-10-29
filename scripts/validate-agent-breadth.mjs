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
const lessons = loadData("src/data/agentBreadth.ts", "agentBreadthLessons");
const exercises = loadData(
  "src/data/exercisesAgentBreadth.ts",
  "agentBreadthExercises",
);
const figures = loadData(
  "src/data/agentBreadthFigures.ts",
  "agentBreadthFigures",
);
const expectedIds = [
  "agent-workflows",
  "tool-calling-contracts",
  "react-agent-loop",
  "planning-search-astar",
  "agent-memory-context",
  "hybrid-retrieval-reranking",
  "agent-evaluation",
  "agent-security-boundaries",
  "multi-agent-orchestration",
  "model-context-protocol",
  "knowledge-graphs-reasoning",
  "agent-reliability-budgets",
];
assert.deepEqual(
  lessons.map((lesson) => lesson.id),
  expectedIds,
);
assert.deepEqual(Object.keys(exercises).sort(), [...expectedIds].sort());
assert.deepEqual(Object.keys(figures).sort(), [...expectedIds].sort());
const allExerciseIds = new Set();
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
  assert.ok(["agents", "reasoning"].includes(lesson.category));
  assert.ok(["入门", "进阶", "高级"].includes(lesson.level));
  assert.ok(lesson.source.label.length > 15);
  assert.equal(new URL(lesson.source.url).protocol, "https:");
  for (const [field, minimum] of Object.entries({
    mechanicsSteps: 6,
    whenToUse: 3,
    howToUse: 4,
    limits: 3,
    tuning: 3,
    settings: 3,
    modifications: 2,
    pitfalls: 3,
    compareTo: 3,
  }))
    assert.ok(
      Array.isArray(lesson[field]) && lesson[field].length >= minimum,
      `${lesson.id}: ${field}`,
    );
  for (const setting of lesson.settings)
    for (const field of ["name", "start", "adjust"])
      assert.ok(
        typeof setting[field] === "string" && setting[field].trim(),
        `${lesson.id}: setting ${field}`,
      );
  assert.ok(
    lesson.mechanicsSteps.some((step) => /\d/.test(step)),
    `${lesson.id}: numerical/trace step`,
  );
  const lessonExercises = exercises[lesson.id];
  assert.equal(lessonExercises.length, 2, `${lesson.id}: two exercises`);
  assert.deepEqual(lessonExercises.map((item) => item.kind).sort(), [
    "decision",
    "mechanism",
  ]);
  for (const exercise of lessonExercises) {
    assert.ok(
      !allExerciseIds.has(exercise.id),
      `Duplicate exercise ${exercise.id}`,
    );
    allExerciseIds.add(exercise.id);
    assert.ok(exercise.id.startsWith(`${lesson.id}-`));
    assert.ok(
      exercise.question.length > 30 && exercise.explanation.length > 45,
    );
    assert.equal(exercise.options.length, 4);
    assert.equal(new Set(exercise.options).size, 4);
    assert.ok(
      Number.isInteger(exercise.answer) &&
        exercise.answer >= 0 &&
        exercise.answer < 4,
    );
  }
  const figure = figures[lesson.id];
  assert.equal(figure.nodes.length, 3);
  assert.equal(figure.edges.length, 2);
  assert.ok(figure.question.length > 10 && figure.caption.length > 40);
  for (const node of figure.nodes) {
    assert.ok(node.title && node.detail);
    assert.ok(
      [...node.detail].length <= 50,
      `${lesson.id}: node detail exceeds 50 characters`,
    );
  }
  assert.ok(
    figure.nodes.some((node) => /\d/.test(node.detail)),
    `${lesson.id}: numerical figure`,
  );
  assert.ok(
    /Toy|toy|Synthetic|Fictional|Pinned|Finite-sample/.test(figure.caption),
    `${lesson.id}: fixture boundary`,
  );
}
assert.equal(allExerciseIds.size, 24);

const near = (actual, expected, tolerance = 1e-9) =>
  assert.ok(
    Math.abs(actual - expected) < tolerance,
    `${actual} differs from ${expected}`,
  );
const sum = (values) => values.reduce((total, value) => total + value, 0);
near(0.95 ** 3, 0.857375);
near(20 * 0.95 ** 3, 17.1475);

// Independently check the hypothetical tool's declared contract, not an SDK API.
const validToyRequest = (args) =>
  typeof args.query === "string" &&
  Number.isInteger(args.limit) &&
  args.limit >= 1 &&
  args.limit <= 20 &&
  Object.keys(args).length === 2 &&
  Object.keys(args).every((key) => ["query", "limit"].includes(key));
assert.equal(validToyRequest({ query: "graph", limit: 5 }), true);
for (const args of [
  { query: "graph" },
  { query: "graph", limit: 0 },
  { query: "graph", limit: "five" },
  { query: "graph", limit: 5, override: true },
])
  assert.equal(validToyRequest(args), false);
assert.equal(3 - 2, 1);
assert.equal(Boolean(1 && 1 && 0), false);

// A separate priority-queue search checks the frontier/path examples and counterexample.
const graph = {
  S: [
    ["A", 2],
    ["B", 1],
  ],
  A: [["G", 2]],
  B: [["C", 1]],
  C: [["G", 5]],
  G: [],
};
const heuristic = { S: 4, A: 2, B: 5, C: 5, G: 0 };
const exactDistances = { S: 4, A: 2, B: 6, C: 5, G: 0 };
for (const [node, edges] of Object.entries(graph)) {
  assert.ok(heuristic[node] <= exactDistances[node]);
  for (const [next, cost] of edges)
    assert.ok(heuristic[node] <= cost + heuristic[next]);
}
function astar(h) {
  const frontier = [{ node: "S", g: 0, path: ["S"] }];
  const best = { S: 0 };
  const popped = [];
  while (frontier.length) {
    frontier.sort((a, b) => a.g + h[a.node] - (b.g + h[b.node]));
    const current = frontier.shift();
    if (current.g !== best[current.node]) continue;
    popped.push(current.node);
    if (current.node === "G")
      return { cost: current.g, path: current.path, popped };
    for (const [node, cost] of graph[current.node]) {
      const g = current.g + cost;
      if (g < (best[node] ?? Infinity)) {
        best[node] = g;
        frontier.push({ node, g, path: [...current.path, node] });
      }
    }
  }
  throw new Error("No goal");
}
assert.deepEqual(astar(heuristic), {
  cost: 4,
  path: ["S", "A", "G"],
  popped: ["S", "A", "G"],
});
assert.equal(astar({ ...heuristic, A: 100 }).cost, 7);
const uniformCost = astar(
  Object.fromEntries(Object.keys(graph).map((node) => [node, 0])),
);
assert.equal(uniformCost.cost, 4);
assert.ok(uniformCost.popped.length > astar(heuristic).popped.length);

const available = 8192 - 1024 - 1024 - 512;
assert.equal(available, 5632);
assert.equal(available - 4 * 900, 2032);
assert.equal(7 * 900 - available, 668);

const rankings = [
  ["A", "B", "C"],
  ["B", "D", "A"],
];
const scores = new Map();
for (const list of rankings)
  list.forEach((id, index) =>
    scores.set(id, (scores.get(id) ?? 0) + 1 / (10 + index + 1)),
  );
assert.deepEqual(
  [...scores].sort((a, b) => b[1] - a[1]).map(([id]) => id),
  ["B", "A", "D", "C"],
);
near(scores.get("A"), 0.16783216783216784);
near(scores.get("B"), 0.17424242424242425);
near(scores.get("C"), 0.07692307692307693);
near(scores.get("D"), 0.08333333333333333);

// Enumerate unordered subsets instead of assuming an observed success rate is known p.
const outcomes = [1, 1, 1, 0, 0];
const pairs = [];
for (let i = 0; i < outcomes.length; i++)
  for (let j = i + 1; j < outcomes.length; j++)
    pairs.push([outcomes[i], outcomes[j]]);
assert.equal(pairs.length, 10);
near(pairs.filter(([a, b]) => a || b).length / pairs.length, 0.9);
near(pairs.filter(([a, b]) => a && b).length / pairs.length, 0.3);
near(1 - 0.4 ** 2, 0.84);
near(0.6 ** 2, 0.36);

const durations = [2, 3, 5];
assert.equal(sum(durations) + 1, 11);
assert.equal(Math.max(...durations) + 1, 6);
assert.equal(Math.max(...durations) + 1 + 7, 13);
const lifecycle = [
  { kind: "request", method: "initialize", id: 1 },
  { kind: "response", id: 1 },
  { kind: "notification", method: "notifications/initialized" },
  { kind: "request", method: "tools/list", id: 2 },
  { kind: "response", id: 2 },
  { kind: "request", method: "tools/call", id: 3 },
  { kind: "response", id: 3 },
];
assert.equal(
  lifecycle.filter((message) => message.kind === "request").length,
  3,
);
assert.ok(
  lifecycle
    .filter((message) => message.kind === "notification")
    .every((message) => message.id === undefined),
);
for (const request of lifecycle.filter((message) => message.kind === "request"))
  assert.equal(
    lifecycle.filter(
      (message) => message.kind === "response" && message.id === request.id,
    ).length,
    1,
  );

const subclass = [
  ["Hepatocyte", "Cell"],
  ["Cell", "BiologicalEntity"],
];
const types = new Set(["Hepatocyte"]);
let changed = true;
while (changed) {
  changed = false;
  for (const [sub, sup] of subclass)
    if (types.has(sub) && !types.has(sup)) {
      types.add(sup);
      changed = true;
    }
}
assert.deepEqual([...types], ["Hepatocyte", "Cell", "BiologicalEntity"]);
assert.equal(types.size - 1, 2);

// Enumerate truncated-geometric outcomes and solve the early-stop chain recurrence.
const p = 0.8,
  q = 1 - p,
  maxAttempts = 3,
  steps = 5;
const stepOutcomes = Array.from({ length: maxAttempts }, (_, index) => ({
  success: true,
  attempts: index + 1,
  probability: q ** index * p,
}));
stepOutcomes.push({
  success: false,
  attempts: maxAttempts,
  probability: q ** maxAttempts,
});
near(sum(stepOutcomes.map((outcome) => outcome.probability)), 1);
const success = sum(
  stepOutcomes
    .filter((outcome) => outcome.success)
    .map((outcome) => outcome.probability),
);
const expectedAttempts = sum(
  stepOutcomes.map((outcome) => outcome.attempts * outcome.probability),
);
near(success, 0.992);
near(expectedAttempts, 1.24);
near(p ** steps, 0.32768);
near(success ** steps, 0.960634900447232);
near(expectedAttempts * steps, 6.2);
let expectedCalls = 0;
for (let step = 0; step < steps; step++) {
  expectedCalls = sum(
    stepOutcomes.map(
      (outcome) =>
        outcome.probability *
        (outcome.attempts + (outcome.success ? expectedCalls : 0)),
    ),
  );
}
near(expectedCalls, 6.10159043067904);
near(
  expectedCalls,
  expectedAttempts * sum(Array.from({ length: steps }, (_, i) => success ** i)),
);
assert.equal(3 ** 3, 27);

console.log(
  "Validated 12 Agent/Reasoning lessons, 24 authored exercises, 12 mechanism figures and independent arithmetic fixtures.",
);
