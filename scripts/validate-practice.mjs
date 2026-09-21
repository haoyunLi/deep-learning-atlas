import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname, extname } from "node:path";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const cache = new Map();
function loadTs(input) {
  let file = resolve(input);
  if (extname(file) === ".css") return {};
  if (!extname(file)) file = [file + ".ts", file + ".tsx"].find(existsSync);
  assert.ok(file, `Cannot resolve ${input}`);
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const code = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
    },
    fileName: file,
  }).outputText;
  const localRequire = (path) =>
    path.startsWith(".") ? loadTs(resolve(dirname(file), path)) : require(path);
  new vm.Script(`(function(require,module,exports){${code}\n})`, {
    filename: file,
  }).runInThisContext()(localRequire, module, module.exports);
  return module.exports;
}
let checks = 0;
function close(actual, expected, message, tolerance = 1e-9) {
  assert.ok(
    Math.abs(actual - expected) < tolerance,
    `${message}: ${actual} != ${expected}`,
  );
  checks++;
}
const math = loadTs("src/components/practiceMath.ts");
const {
  caseRows,
  caseSplit,
  featureStats,
  fitLogistic,
  fitKnn,
  evaluateCase,
  runCaseSearch,
} = math;
assert.deepEqual(caseRows, math.makeCaseData(), "seeded data is reproducible");
assert.equal(caseRows.length, 160);
assert.equal(
  new Set(caseRows.map((row) => row.id)).size,
  160,
  "one row per unique customer",
);
assert.equal(caseSplit.train.length, 80);
assert.equal(caseSplit.validation.length, 30);
assert.equal(caseSplit.test.length, 30);
assert.equal(caseSplit.excluded.length, 20);
const groups = [
  caseSplit.train,
  caseSplit.validation,
  caseSplit.test,
  caseSplit.excluded,
];
assert.equal(
  new Set(groups.flat().map((row) => row.id)).size,
  160,
  "split sets are disjoint and complete",
);
const lastDay = (rows) => Math.max(...rows.map((r) => r.day));
const firstDay = (rows) => Math.min(...rows.map((r) => r.day));
assert.ok(
  lastDay(caseSplit.train) + 30 < firstDay(caseSplit.validation),
  "all training labels mature before validation begins",
);
assert.ok(
  lastDay(caseSplit.validation) + 30 < firstDay(caseSplit.test),
  "all validation labels mature before test begins",
);
assert.ok(
  lastDay(caseSplit.test) + 30 <= 507,
  "all final labels mature by observation cutoff",
);
caseRows.forEach((row, index) => {
  close(row.day, index * 3, "index-day formula");
  assert.ok(row.x[0] >= 0 && row.x[0] <= 30 && row.x[1] >= 0 && row.x[1] <= 5);
  assert.ok(row.y === 0 || row.y === 1);
});

const stats = featureStats(caseSplit.train);
for (let j = 0; j < 2; j++) {
  const standardized = caseSplit.train.map(
    (row) => (row.x[j] - stats.mean[j]) / stats.scale[j],
  );
  close(
    standardized.reduce((sum, x) => sum + x, 0) / 80,
    0,
    "training features centered",
  );
  close(
    standardized.reduce((sum, x) => sum + x * x, 0) / 80,
    1,
    "training features unit variance",
  );
}
const constantFeatureRows = [0, 1, 1, 1].map((y, i) => ({
  id: i,
  day: i,
  x: [2, 4],
  y,
}));
assert.deepEqual(
  featureStats(constantFeatureRows).scale,
  [1, 1],
  "constant feature scaling is finite",
);
const interceptModel = fitLogistic(constantFeatureRows, 0.2, 0.01);
close(
  interceptModel.predict(constantFeatureRows[0]),
  0.75,
  "intercept learns prevalence with no varying features",
  1e-5,
);
const initialModel = fitLogistic(caseSplit.train, 0, 0.01);
caseRows.forEach((row) =>
  close(
    initialModel.predict(row),
    0.5,
    "zero learning rate preserves zero initialization",
  ),
);
const initialLoss = evaluateCase(initialModel, caseSplit.train).loss;
const trained = fitLogistic(caseSplit.train, 0.1, 0.01);
assert.ok(
  evaluateCase(trained, caseSplit.train).loss < initialLoss - 0.02,
  "gradient descent lowers training log loss",
);
const ablated = fitLogistic(caseSplit.train, 0.1, 0.01, true);
close(
  ablated.predict({ id: 0, day: 0, x: [14, 0], y: 0 }),
  ablated.predict({ id: 0, day: 0, x: [14, 5000], y: 0 }),
  "ablated logistic prediction ignores tickets",
);

const knnRows = [0, 1, 1].map((y, i) => ({ id: i + 1, day: i, x: [i, 0], y }));
const query = { id: 99, day: 9, x: [1, 0], y: 1 };
close(
  fitKnn(knnRows, 1).predict(query),
  2 / 3,
  "one positive neighbor uses Laplace smoothing",
);
close(
  fitKnn(knnRows, 3).predict(query),
  3 / 5,
  "three neighbors use correct class counts",
);
close(
  fitKnn(knnRows, 1).predict({ ...query, x: [0.5, 0] }),
  1 / 3,
  "distance ties break by stable ID",
);
const ablatedKnn = fitKnn(caseSplit.train, 5, true);
close(
  ablatedKnn.predict({ ...query, x: [15, 0] }),
  ablatedKnn.predict({ ...query, x: [15, 5000] }),
  "ablated kNN ignores tickets",
);

const snapshot = JSON.stringify(caseRows);
const trials = runCaseSearch();
assert.equal(
  trials.length,
  18,
  "one prevalence baseline, twelve logistic trials, five kNN settings",
);
assert.equal(trials.filter((t) => t.model.family === "logistic").length, 12);
assert.equal(trials.filter((t) => t.model.family === "knn").length, 5);
assert.equal(
  JSON.stringify(caseRows),
  snapshot,
  "training leaves source data unchanged",
);
const prevalence =
  caseSplit.train.reduce((sum, row) => sum + row.y, 0) / caseSplit.train.length;
close(
  trials[0].model.predict(query),
  prevalence,
  "baseline uses training prevalence only",
);
for (const trial of trials) {
  for (const model of [trial.model, trial.ablation]) {
    caseRows.forEach((row) => {
      const prediction = model.predict(row);
      assert.ok(
        Number.isFinite(prediction) && prediction > 0 && prediction < 1,
        "all supported settings yield finite probabilities",
      );
    });
    const metrics = evaluateCase(model, caseSplit.validation);
    close(
      metrics.tp + metrics.tn + metrics.fp + metrics.fn,
      30,
      "confusion matrix totals validation size",
    );
    assert.ok(Number.isFinite(metrics.loss) && metrics.loss >= 0);
    const low = evaluateCase(model, caseSplit.validation, 0.2);
    const high = evaluateCase(model, caseSplit.validation, 0.8);
    assert.ok(
      low.tp >= high.tp && low.fp >= high.fp,
      "lower threshold never removes positive predictions",
    );
    close(
      low.loss,
      high.loss,
      "classification threshold does not change log loss",
    );
  }
  close(
    trial.validation.loss,
    evaluateCase(trial.model, caseSplit.validation).loss,
    "search scores use validation data",
  );
}
const repeat = runCaseSearch();
trials.forEach((trial, i) => {
  assert.equal(
    trial.model.setting,
    repeat[i].model.setting,
    "search seed fixes hyperparameters",
  );
  close(
    trial.validation.loss,
    repeat[i].validation.loss,
    "search is deterministic",
  );
});
const allNegativeModel = {
  name: "zero",
  family: "constant",
  setting: "0",
  predict: () => 0,
};
const undefinedPrecision = evaluateCase(allNegativeModel, [
  { ...query, y: 1 },
  { ...query, y: 0 },
]);
assert.equal(
  undefinedPrecision.precision,
  null,
  "no positive predictions means undefined precision",
);
assert.equal(undefinedPrecision.recall, 0);
const undefinedRecall = evaluateCase(allNegativeModel, [{ ...query, y: 0 }]);
assert.equal(
  undefinedRecall.recall,
  null,
  "no positive labels means undefined recall",
);
assert.ok(
  Number.isFinite(undefinedPrecision.loss),
  "metric clipping handles probability endpoints",
);

const { languageBudget } = loadTs("src/components/languageBudgetMath.ts");
const budgetConfig = {
  batch: 1,
  prompt: 2048,
  generated: 512,
  layers: 32,
  queryHeads: 32,
  kvHeads: 8,
  headDim: 128,
  bytes: 2,
};
const budget = languageBudget(budgetConfig);
close(budget.length, 2560, "total cached length");
close(budget.kvBytes, 335544320, "default GQA KV bytes");
close(budget.kvBytes / 2 ** 30, 0.3125, "GiB conversion");
close(budget.bytesPerToken, 131072, "per-token cache bytes across all layers");
close(budget.mhaBytes, 4 * budget.kvBytes, "32 query heads / 8 KV heads");
close(
  languageBudget({ ...budgetConfig, generated: 513 }).kvBytes - budget.kvBytes,
  budget.bytesPerToken,
  "adding one cached token",
);
for (const field of ["batch", "layers", "headDim", "bytes"]) {
  const doubled = languageBudget({
    ...budgetConfig,
    [field]: budgetConfig[field] * 2,
  });
  close(
    doubled.kvBytes,
    2 * budget.kvBytes,
    `${field} scales KV storage linearly`,
  );
}
close(
  languageBudget({ ...budgetConfig, kvHeads: 1 }).kvBytes,
  budget.kvBytes / 8,
  "MQA removes repeated KV heads",
);
close(
  languageBudget({ ...budgetConfig, kvHeads: 32 }).kvBytes,
  budget.mhaBytes,
  "MHA reference matches actual 32 KV heads",
);
close(
  languageBudget({ ...budgetConfig, prompt: 4096 }).prefillScores,
  4 * budget.prefillScores,
  "prefill score count grows quadratically",
);
close(
  languageBudget({ ...budgetConfig, prompt: 4096, generated: 1024 })
    .decodeScores,
  2 * budget.decodeScores,
  "single-token decode score count grows linearly with cached length",
);
close(
  languageBudget({ ...budgetConfig, kvHeads: 1 }).prefillScores,
  budget.prefillScores,
  "GQA changes KV storage but logical scores still have query-head count",
);
console.log(
  `Validated practical experiment and LM budget: ${checks} numeric checks, 18 reproducible trials, probability/metric invariants, and time-separated label windows.`,
);

const { lessons } = loadTs("src/data/lessons.ts");
const { exercises, exerciseGroups } = loadTs("src/data/exercises.ts");
const groupKeys = exerciseGroups.flatMap(Object.keys);
assert.equal(
  new Set(groupKeys).size,
  groupKeys.length,
  "exercise groups must not silently overwrite lesson entries",
);
const lessonIds = new Set(lessons.map((lesson) => lesson.id));
const exerciseIds = new Set();
for (const [lessonId, items] of Object.entries(exercises)) {
  assert.ok(
    lessonIds.has(lessonId),
    `Exercises refer to unknown lesson: ${lessonId}`,
  );
  assert.equal(
    items.length,
    2,
    `${lessonId}: one mechanism and one decision exercise required`,
  );
  assert.deepEqual(
    items.map((item) => item.kind).sort(),
    ["decision", "mechanism"],
    `${lessonId}: exercise types`,
  );
  for (const item of items) {
    assert.ok(!exerciseIds.has(item.id), `Duplicate exercise ID: ${item.id}`);
    exerciseIds.add(item.id);
    assert.ok(
      item.question.trim().length >= 10 && item.explanation.trim().length >= 20,
      `${item.id}: authored prompt and explanation`,
    );
    assert.ok(
      item.options.length >= 3 &&
        new Set(item.options).size === item.options.length,
      `${item.id}: distinct answer choices`,
    );
    assert.ok(
      Number.isInteger(item.answer) &&
        item.answer >= 0 &&
        item.answer < item.options.length,
      `${item.id}: valid answer index`,
    );
  }
}
const missing = lessons
  .filter((lesson) => !exercises[lesson.id])
  .map((lesson) => lesson.id);
assert.deepEqual(
  missing,
  [],
  `Missing authored exercises: ${missing.join(", ")}`,
);
console.log(
  `Validated full exercise coverage: ${exerciseIds.size} questions across ${lessons.length} lessons, with unique IDs and valid answer indices.`,
);

const { default: LessonExercises } = loadTs(
  "src/components/LessonExercises.tsx",
);
const escapeHtml = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
      })[character],
  );
for (const lesson of lessons) {
  const html = renderToStaticMarkup(
    React.createElement(LessonExercises, { lessonId: lesson.id }),
  );
  const fieldsets = [
    ...html.matchAll(/<fieldset\b[^>]*>([\s\S]*?)<\/fieldset>/g),
  ];
  assert.equal(
    fieldsets.length,
    2,
    `${lesson.id}: renders two accessible question groups`,
  );
  for (const [index, match] of fieldsets.entries()) {
    const question = exercises[lesson.id][index];
    const group = match[1];
    const legend = group.match(/<legend>([\s\S]*?)<\/legend>/);
    assert.ok(
      legend && legend[1].includes(escapeHtml(question.question)),
      `${question.id}: lesson-specific question is the fieldset legend`,
    );
    const radios = [...group.matchAll(/<input\b[^>]*type="radio"[^>]*>/g)].map(
      (radio) => radio[0],
    );
    assert.equal(
      radios.length,
      question.options.length,
      `${question.id}: all answer choices render`,
    );
    radios.forEach((radio) => {
      assert.ok(
        radio.includes(`name="${escapeHtml(question.id)}"`),
        `${question.id}: radio options share this question's unique group`,
      );
      assert.ok(
        !/\s(?:checked|disabled)(?:=|\s|>)/.test(radio),
        `${question.id}: initial options are unselected and interactive`,
      );
    });
    question.options.forEach((option) =>
      assert.ok(
        group.includes(escapeHtml(option)),
        `${question.id}: authored option is visible`,
      ),
    );
    const checks = [
      ...group.matchAll(/<button\b([^>]*)>检查答案 Check<\/button>/g),
    ];
    assert.equal(checks.length, 1, `${question.id}: exactly one check action`);
    assert.ok(
      /\sdisabled(?:=|\s|$)/.test(checks[0][1]),
      `${question.id}: checking is disabled until an answer is selected`,
    );
    assert.ok(
      !group.includes('class="exercise-feedback"') &&
        !group.includes('class="exercise-correct"'),
      `${question.id}: no answer is revealed initially`,
    );
  }
}
assert.equal(
  renderToStaticMarkup(
    React.createElement(LessonExercises, { lessonId: "not-a-lesson" }),
  ),
  "",
  "unknown lessons do not show generic placeholder questions",
);
console.log(
  `Validated LessonExercises SSR for all ${lessons.length} courses: two fieldsets, authored questions/options, unique radio groups, and initially disabled answer checks.`,
);
