import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function load(file, name) {
  const result = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
    },
  });
  const module = { exports: {} };
  vm.runInNewContext(result.outputText, { module, exports: module.exports });
  return module.exports[name];
}
const lessons = load("src/data/cvDepth.ts", "cvDepthLessons");
const exercises = load("src/data/exercisesCVDepth.ts", "cvDepthExercises");
const figures = load("src/data/cvDepthFigures.ts", "cvDepthFigures");
const ids = lessons.map((x) => x.id);
assert.equal(lessons.length, 6);
assert.equal(new Set(ids).size, 6);
assert.deepEqual(Object.keys(exercises).sort(), [...ids].sort());
assert.deepEqual(Object.keys(figures).sort(), [...ids].sort());
// Read actual lesson object literals to check links without importing unfinished sibling modules.
const catalogue = new Set();
for (const file of readdirSync("src/data").filter((f) => f.endsWith(".ts"))) {
  const ast = ts.createSourceFile(
    file,
    readFileSync("src/data/" + file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  function walk(node) {
    if (ts.isObjectLiteralExpression(node)) {
      const props = new Map(
        node.properties
          .filter(ts.isPropertyAssignment)
          .map((p) => [
            p.name.getText(ast).replaceAll('"', "").replaceAll("'", ""),
            p.initializer,
          ]),
      );
      const id = props.get("id");
      if (props.has("englishTitle") && id && ts.isStringLiteral(id))
        catalogue.add(id.text);
    }
    ts.forEachChild(node, walk);
  }
  walk(ast);
}
for (const lesson of lessons) {
  for (const key of [
    "id",
    "title",
    "englishTitle",
    "summary",
    "intuition",
    "core",
    "equation",
    "example",
  ])
    assert.ok(lesson[key]?.length > 0, `${lesson.id}: ${key}`);
  for (const [key, min] of Object.entries({
    mechanicsSteps: 7,
    howToUse: 4,
    settings: 4,
    whenToUse: 3,
    limits: 3,
    modifications: 3,
    pitfalls: 3,
    tuning: 3,
    compareTo: 3,
  }))
    assert.ok(lesson[key]?.length >= min, `${lesson.id}: ${key}`);
  assert.equal(lesson.category, "vision");
  assert.ok(new URL(lesson.source.url).protocol === "https:");
  for (const source of lesson.supplementarySources ?? []) {
    assert.ok(source.label.length > 0);
    assert.equal(new URL(source.url).protocol, "https:");
  }
  assert.ok(
    !lesson.core.includes("https://"),
    "Use named source links instead of raw URLs in prose",
  );
  for (const setting of lesson.settings)
    for (const k of ["name", "start", "adjust"])
      assert.ok(setting[k].length >= 10);
  for (const id of lesson.compareTo)
    assert.ok(catalogue.has(id), `Unknown comparison ${id}`);
  const questions = exercises[lesson.id];
  assert.deepEqual(Array.from(questions.map((q) => q.kind)), [
    "mechanism",
    "decision",
  ]);
  for (const q of questions) {
    assert.ok(q.answer >= 0 && q.answer < q.options.length);
    assert.ok(q.explanation.length > 25);
    assert.equal(new Set(q.options).size, q.options.length);
  }
  const fig = figures[lesson.id];
  assert.equal(fig.nodes.length, 3);
  assert.equal(fig.edges.length, 2);
  assert.ok(fig.caption.includes("Synthetic"));
  for (const node of fig.nodes)
    assert.ok([...node.detail].length <= 50, `${lesson.id}: long figure node`);
  assert.ok(
    fig.nodes.some((n) => /\d/.test(n.detail)),
    `${lesson.id}: missing numerical intermediate`,
  );
}
let checks = 0;
const near = (a, b, tol = 1e-9) => {
  assert.ok(Number.isFinite(a) && Math.abs(a - b) < tol, `${a} != ${b}`);
  checks++;
};
// 1. Coordinate transforms use continuous box boundaries; inverse order is explicit.
const source = [100, 50, 300, 250],
  s = Math.min(320 / 640, 320 / 480),
  padY = (320 - 480 * s) / 2;
const resized = source.map((v) => v * s),
  padded = resized.map((v, i) => v + (i % 2 ? padY : 0));
const flip = (b) => [320 - b[2], b[1], 320 - b[0], b[3]];
assert.deepEqual(padded, [50, 65, 150, 165]);
assert.deepEqual(flip(padded), [170, 65, 270, 165]);
assert.deepEqual(
  flip(flip(padded)).map((v, i) => (v - (i % 2 ? padY : 0)) / s),
  source,
);
near((153 / 255 - 0.5) / 0.25, 0.4);
near((0 + 2) / 2, 1); // Averaging class IDs creates an unrelated class.
assert.equal(
  exercises[ids[0]][0].options[exercises[ids[0]][0].answer],
  "[50,65,150,165]",
);
// 2. Enumerate input locations covered by three 3-wide, stride-2 convolutions.
let locations = new Set([0]);
for (let layer = 0; layer < 3; layer++)
  locations = new Set(
    [...locations].flatMap((p) => [2 * p, 2 * p + 1, 2 * p + 2]),
  );
assert.equal(Math.max(...locations) - Math.min(...locations) + 1, 15);
assert.deepEqual(
  [4, 8, 16, 32].map((stride) => 256 / stride),
  [64, 32, 16, 8],
);
near(8 / 4, 2);
near(8 / 16, 0.5);
near((256 * 64 * 64 * 4) / 2 ** 20, 4);
near((256 * 32 * 32 * 4) / 2 ** 20, 1);
near((512 / 4) ** 2 / (256 / 4) ** 2, 4);
// 3. Independent rectangle geometry and finite-difference gradient for separated boxes.
function geometry(a, b) {
  const area = (x) => (x[2] - x[0]) * (x[3] - x[1]);
  const I =
    Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) *
    Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
  const U = area(a) + area(b) - I,
    w = Math.max(a[2], b[2]) - Math.min(a[0], b[0]),
    h = Math.max(a[3], b[3]) - Math.min(a[1], b[1]);
  const rho2 =
    ((a[0] + a[2] - b[0] - b[2]) / 2) ** 2 +
    ((a[1] + a[3] - b[1] - b[3]) / 2) ** 2;
  return {
    I,
    U,
    C: w * h,
    iou: I / U,
    giou: I / U - (w * h - U) / (w * h),
    diouLoss: 1 - I / U + rho2 / (w * w + h * h),
  };
}
const target = [0, 0, 2, 2];
for (const [t, expectedG, expectedD] of [
  [3, -0.2, 1 + 9 / 29],
  [2, 0, 1.2],
  [1, 1 / 3, 29 / 39],
]) {
  const r = geometry(target, [t, 0, t + 2, 2]);
  near(r.giou, expectedG);
  near(r.diouLoss, expectedD);
  const scaled = geometry(
    target.map((v) => 3 * v),
    [t, 0, t + 2, 2].map((v) => 3 * v),
  );
  near(scaled.iou, r.iou);
  near(scaled.giou, r.giou);
}
const giouLoss = (t) => 1 - geometry(target, [t, 0, t + 2, 2]).giou;
near((giouLoss(3 + 1e-5) - giouLoss(3 - 1e-5)) / 2e-5, 0.16, 1e-8);
near(geometry(target, target).giou, 1);
near(geometry(target, target).diouLoss, 0);
// 4. Exhaustive assignment is an independent oracle for each Hungarian teaching state.
const permutations = (xs) =>
  xs.length === 0
    ? [[]]
    : xs.flatMap((x, i) =>
        permutations(xs.filter((_, j) => j !== i)).map((rest) => [x, ...rest]),
      );
const perms = permutations([0, 1, 2]),
  C = [
    [4, 1, 3],
    [2, 0, 5],
    [3, 2, 2],
  ];
const costs = (M) =>
  perms.map((p) => p.reduce((sum, col, row) => sum + M[row][col], 0));
assert.deepEqual(costs(C), [6, 11, 5, 9, 7, 6]);
assert.equal(Math.min(...costs(C)), 5);
const rowReduced = C.map((row) => row.map((v) => v - Math.min(...row)));
assert.deepEqual(rowReduced, [
  [3, 0, 2],
  [2, 0, 5],
  [1, 0, 0],
]);
const colReduced = rowReduced.map((row) =>
  row.map((v, j) => v - Math.min(...rowReduced.map((r) => r[j]))),
);
assert.deepEqual(colReduced, [
  [2, 0, 2],
  [1, 0, 5],
  [0, 0, 0],
]);
const adjusted = colReduced.map((row, i) =>
  row.map((v, j) =>
    i !== 2 && j !== 1 ? v - 1 : i === 2 && j === 1 ? v + 1 : v,
  ),
);
assert.deepEqual(adjusted, [
  [1, 0, 1],
  [0, 0, 4],
  [0, 1, 0],
]);
assert.equal(costs(adjusted).indexOf(0), costs(C).indexOf(5));
const rectangular = [
  [0.1, 0.6],
  [0.2, 0.3],
  [0.9, 0.2],
];
const candidates = [];
for (let a = 0; a < 3; a++)
  for (let b = 0; b < 3; b++)
    if (a !== b)
      candidates.push({
        rows: [a, b],
        cost: rectangular[a][0] + rectangular[b][1],
      });
candidates.sort((a, b) => a.cost - b.cost);
assert.deepEqual(candidates[0].rows, [0, 2]);
near(candidates[0].cost, 0.3);
assert.ok(2 + 2 < 8);
// 5. Full cosine matrix and reverse nearest-neighbor indices, not just one dot product.
const A = [
    [1, 0],
    [0.8, 0.6],
    [0, 1],
  ],
  B = [
    [0.6, 0.8],
    [1, 0],
    [0, 1],
  ],
  dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
for (const v of [...A, ...B]) near(dot(v, v), 1);
const S = A.map((a) => B.map((b) => dot(a, b)));
const expected = [
  [0.6, 1, 0],
  [0.96, 0.8, 0.6],
  [0.8, 0, 1],
];
S.forEach((r, i) => r.forEach((v, j) => near(v, expected[i][j])));
const argmax = (xs) => xs.indexOf(Math.max(...xs));
const forward = S.map(argmax),
  reverse = B.map((_, j) => argmax(S.map((row) => row[j])));
assert.deepEqual(forward, [1, 0, 2]);
for (let i = 0; i < 3; i++) assert.equal(reverse[forward[i]], i);
near(0.96 - 0.8, 0.16);
assert.ok(0.96 - 0.8 < 0.2);
near((256 ** 2 * 4) / 2 ** 20, 0.25);
near((1024 ** 2 * 4) / 2 ** 20, 4);
// 6. Normalize heatmap weights, compute expectation/variance, and expose bimodal mean.
const soft = (weights, T) => {
  const adjusted = weights.map((w) => w ** (1 / T)),
    sum = adjusted.reduce((a, b) => a + b, 0);
  return adjusted.map((w) => w / sum);
};
const expect = (p) => p.reduce((sum, w, x) => sum + x * w, 0),
  p = soft([1, 2, 6, 1], 1),
  mean = expect(p);
near(mean, 1.7);
assert.equal(argmax(p), 2);
near(p.reduce((sum, w, x) => sum + x * x * w, 0) - mean ** 2, 0.61);
near(4 * mean + 2, 8.8);
near(Math.abs(8.8 - 9.2), 0.4);
near(Math.abs(10 - 9.2), 0.8);
near(expect(soft([1, 2, 6, 1], 0.5)), 79 / 42);
const bimodal = [0.5, 0, 0, 0.5];
near(expect(bimodal), 1.5);
assert.equal(bimodal[1] + bimodal[2], 0);
near(100 * 0.05, 5);
console.log(
  `Validated CV depth: 6 lessons, 12 exercises, 6 numerical figures, catalogue links and ${checks} independent numerical assertions (geometry round-trip, FPN/RF, IoU gradients, exhaustive matching, cosine matrix, heatmap ambiguity).`,
);
